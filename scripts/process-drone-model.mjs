// Turns a raw Meshy drone export into a phone-ready GLB for the booth AR.
//
//   npm run ar:model -- 3d_models/Sentinel.glb public/ar-assets/models/sentinel.glb \
//     --diagonal 0.95 --nose=-x
//
// Steps:
//  1. Rotate so the nose faces +Z (runtime convention), Y up.
//  2. Find the four 2-blade propellers (thin band above the motors), cut the blade triangles
//     out, and add `prop_N` empty nodes at each hub (extras.radius = blade radius) so the app
//     can attach spinning props.
//  3. Scale so the motor-to-motor diagonal matches reality; feet on y = 0, centred on the hubs.
//  4. Weld + simplify, WebP textures sized for phones, meshopt-compress for 4G.

import { mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from './lib/sharp.mjs';
import { readSingleMesh } from './lib/glb-geometry.mjs';

// ── CLI ──────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').match(/^--(diagonal|ratio|error|nose)$/));
const flag = (name, fallback) => {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const [input, output] = positional;
const diagonalM = Number(flag('diagonal'));
const nose = flag('nose', '-x');
const ratio = Number(flag('ratio', '0.12'));
const maxError = Number(flag('error', '0.0015'));
const usage = 'Usage: process-drone-model.mjs <in.glb> <out.glb> --diagonal <metres> [--nose=-x|+x|-z|+z] [--ratio 0.12] [--error 0.0015]';
const invalid = [
  !input || !output ? 'input and output paths are required' : null,
  !(diagonalM > 0 && diagonalM < 5) ? '--diagonal must be a motor-to-motor distance in metres (0-5)' : null,
  !(ratio > 0 && ratio <= 1) ? '--ratio must be in (0, 1]' : null,
  !(maxError > 0 && maxError < 1) ? '--error must be in (0, 1)' : null,
].filter(Boolean);
if (invalid.length) {
  console.error(invalid.join('\n') + '\n' + usage);
  process.exit(1);
}

const NOSE_YAW = { '-x': Math.PI / 2, '+x': -Math.PI / 2, '+z': 0, '-z': Math.PI };
if (!(nose in NOSE_YAW)) throw new Error(`--nose must be one of ${Object.keys(NOSE_YAW).join(', ')}`);
const yaw = NOSE_YAW[nose];
const cy = Math.cos(yaw);
const sy = Math.sin(yaw);

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input);
const { positions, normals, indices, prim, node } = readSingleMesh(doc);
const vcount = positions.length / 3;
const log = (...a) => console.log('  ', ...a);
console.log(`▸ ${input}: ${vcount} vertices, ${indices.length / 3} triangles`);

// 1. Rotate about Y so the nose faces +Z.
for (let i = 0; i < vcount; i++) {
  const x = positions[i * 3];
  const z = positions[i * 3 + 2];
  positions[i * 3] = x * cy + z * sy;
  positions[i * 3 + 2] = -x * sy + z * cy;
  if (normals) {
    const nx = normals[i * 3];
    const nz = normals[i * 3 + 2];
    normals[i * 3] = nx * cy + nz * sy;
    normals[i * 3 + 2] = -nx * sy + nz * cy;
  }
}

// 2. Propellers.
let minY = Infinity;
let maxY = -Infinity;
let cx = 0;
let cz = 0;
{
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < vcount; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
  }
  cx = (x0 + x1) / 2;
  cz = (z0 + z1) / 2;
}
const radial = new Float32Array(vcount);
let maxR = 0;
for (let i = 0; i < vcount; i++) {
  radial[i] = Math.hypot(positions[i * 3] - cx, positions[i * 3 + 2] - cz);
  maxR = Math.max(maxR, radial[i]);
}

// Blade plane: only blade tips reach the outermost ring.
const tipYs = [];
for (let i = 0; i < vcount; i++) if (radial[i] > 0.9 * maxR) tipYs.push(positions[i * 3 + 1]);
tipYs.sort((a, b) => a - b);
const pct = (p) => tipYs[Math.min(tipYs.length - 1, Math.floor(p * tipYs.length))];
const bladeY = pct(0.5);
const tol = (pct(0.97) - pct(0.03)) / 2 + (maxY - minY) * 0.012;
log(`blade plane y=${bladeY.toFixed(4)} ±${tol.toFixed(4)} (model height ${(maxY - minY).toFixed(3)})`);

const quadrant = (x, z) => (x - cx >= 0 ? 1 : 0) + (z - cz >= 0 ? 2 : 0);
// Twisted blades leave the tight band at the tips, so clusters grow within a wider band;
// only vertices connected to a blade (plan view) are ever removed, which protects the body.
const inBand = (i) => Math.abs(positions[i * 3 + 1] - bladeY) <= tol * 2.6 && radial[i] > 0.25 * maxR;

// Each propeller = the connected cluster (in plan view) of band vertices grown from the
// outermost blade tip in its quadrant. Parts of the body top can share the blade height, but
// they are not connected to the blades within the band. Hub = midpoint of the cluster's two
// farthest-apart points (the tips of a 2-blade prop).
const CELL = maxR * 0.012;
const hubs = [];
for (let q = 0; q < 4; q++) {
  const ids = [];
  for (let i = 0; i < vcount; i++) if (inBand(i) && quadrant(positions[i * 3], positions[i * 3 + 2]) === q) ids.push(i);
  if (ids.length < 20) throw new Error(`Quadrant ${q}: no propeller found (${ids.length} band vertices)`);
  const cells = new Map();
  const key = (gx, gz) => `${gx},${gz}`;
  for (const i of ids) {
    const k = key(Math.floor(positions[i * 3] / CELL), Math.floor(positions[i * 3 + 2] / CELL));
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(i);
  }
  let seed = ids[0];
  for (const i of ids) if (radial[i] > radial[seed]) seed = i;
  const start = [Math.floor(positions[seed * 3] / CELL), Math.floor(positions[seed * 3 + 2] / CELL)];
  const seen = new Set([key(...start)]);
  const stack = [start];
  const cluster = [];
  while (stack.length) {
    const [gx, gz] = stack.pop();
    cluster.push(...cells.get(key(gx, gz)));
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const k = key(gx + dx, gz + dz);
        if (!seen.has(k) && cells.has(k)) {
          seen.add(k);
          stack.push([gx + dx, gz + dz]);
        }
      }
    }
  }
  const far = (fx, fz) => {
    let best = cluster[0], bd = -1;
    for (const i of cluster) {
      const d = Math.hypot(positions[i * 3] - fx, positions[i * 3 + 2] - fz);
      if (d > bd) { bd = d; best = i; }
    }
    return best;
  };
  // The seed is the outermost tip; the opposite tip is the farthest cluster point from it.
  const b = far(positions[seed * 3], positions[seed * 3 + 2]);
  const a = far(positions[b * 3], positions[b * 3 + 2]);
  log(`quadrant ${q}: ${cluster.length}/${ids.length} band vertices belong to the propeller`);
  const hx = (positions[a * 3] + positions[b * 3]) / 2;
  const hz = (positions[a * 3 + 2] + positions[b * 3 + 2]) / 2;
  const r = Math.hypot(positions[a * 3] - positions[b * 3], positions[a * 3 + 2] - positions[b * 3 + 2]) / 2;
  hubs.push({ x: hx, z: hz, r, q, members: new Set(cluster) });
  log(`prop ${q}: hub (${hx.toFixed(3)}, ${hz.toFixed(3)}) blade radius ${r.toFixed(3)} from ${ids.length} vertices`);
}

const hubOf = (x, z) => hubs[quadrant(x, z)];
const bladeVertex = new Uint8Array(vcount);
for (let i = 0; i < vcount; i++) {
  if (!inBand(i)) continue;
  const h = hubOf(positions[i * 3], positions[i * 3 + 2]);
  if (!h.members.has(i)) continue;
  const d = Math.hypot(positions[i * 3] - h.x, positions[i * 3 + 2] - h.z);
  if (d >= h.r * 0.16 && d <= h.r * 1.08) bladeVertex[i] = 1;
}
// A triangle touching any blade vertex is blade (root slivers would otherwise float in the air
// under the spinning props). Hub and body vertices never qualify: blade vertices sit outside
// 16% of the blade radius and inside the propeller's own cluster.
const kept = [];
let removed = 0;
for (let t = 0; t < indices.length; t += 3) {
  const a = indices[t], b = indices[t + 1], c = indices[t + 2];
  if (bladeVertex[a] || bladeVertex[b] || bladeVertex[c]) removed++;
  else kept.push(a, b, c);
}
log(`removed ${removed} blade triangles, kept ${kept.length / 3}`);

// 3. Scale + recentre: motor diagonal → metres, feet on the floor, centred on the hubs.
const diag = (Math.hypot(hubs[0].x - hubs[3].x, hubs[0].z - hubs[3].z) + Math.hypot(hubs[1].x - hubs[2].x, hubs[1].z - hubs[2].z)) / 2;
const s = diagonalM / diag;
const hcx = hubs.reduce((acc, h) => acc + h.x, 0) / 4;
const hcz = hubs.reduce((acc, h) => acc + h.z, 0) / 4;
let feet = Infinity;
let top = -Infinity;
for (let t = 0; t < kept.length; t++) {
  const y = positions[kept[t] * 3 + 1];
  feet = Math.min(feet, y);
  top = Math.max(top, y);
}
const tx = (x) => (x - hcx) * s;
const ty = (y) => (y - feet) * s;
const tz = (z) => (z - hcz) * s;
log(`scale ×${s.toFixed(4)} → height ${((top - feet) * s).toFixed(3)} m, prop Ø ${(hubs.reduce((a, h) => a + h.r, 0) / 2 * s).toFixed(3)} m`);

const posAcc = prim.getAttribute('POSITION');
const outPos = new Float32Array(vcount * 3);
for (let i = 0; i < vcount; i++) {
  outPos[i * 3] = tx(positions[i * 3]);
  outPos[i * 3 + 1] = ty(positions[i * 3 + 1]);
  outPos[i * 3 + 2] = tz(positions[i * 3 + 2]);
}
posAcc.setArray(outPos);
if (normals) {
  const nAcc = prim.getAttribute('NORMAL');
  nAcc.setArray(normals);
}
// Meshy exports are indexed, but a non-indexed input gets an index accessor here.
const keptIdx = Uint32Array.from(kept);
if (prim.getIndices()) prim.getIndices().setArray(keptIdx);
else prim.setIndices(doc.createAccessor('indices').setType('SCALAR').setArray(keptIdx).setBuffer(posAcc.getBuffer()));
node.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
node.setName('body');

let scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
if (!scene) {
  scene = doc.createScene('Scene');
  doc.getRoot().setDefaultScene(scene);
}
// Re-parent the body directly under the scene so prop anchors and body share a frame.
for (const parent of doc.getRoot().listNodes()) if (parent.listChildren().includes(node)) parent.removeChild(node);
if (!scene.listChildren().includes(node)) scene.addChild(node);
for (const child of scene.listChildren()) if (child !== node && !child.getMesh() && child.listChildren().length === 0) scene.removeChild(child);

// Meshy blades vary a little in length; one radius keeps the four spinning discs identical.
const meanR = hubs.reduce((acc, h) => acc + h.r, 0) / hubs.length;
hubs
  .slice()
  .sort((a, b) => a.q - b.q)
  .forEach((h, i) => {
    // Diagonal pairs (quadrants 0/3 and 1/2) spin the same way on a real quad.
    const spin = h.q === 0 || h.q === 3 ? 1 : -1;
    const anchor = doc
      .createNode(`prop_${i}`)
      .setTranslation([tx(h.x), ty(bladeY), tz(h.z)])
      .setExtras({ radius: meanR * s, spin });
    scene.addChild(anchor);
  });

// 4. Optimise for phones on 4G.
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error: maxError, lockBorder: false }),
  dedup(),
  prune({ keepLeaves: true, keepExtras: true }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^baseColor/, resize: [2048, 2048], quality: 78 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^normal/, resize: [1024, 1024], quality: 82 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^metallicRoughness/, resize: [512, 512], quality: 80 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

const outPrim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
log(`final: ${outPrim.getAttribute('POSITION').getCount()} vertices, ${outPrim.getIndices().getCount() / 3} triangles`);
mkdirSync(dirname(output), { recursive: true });
await io.write(output, doc);
console.log(`✓ ${output} ${(statSync(output).size / 1024 / 1024).toFixed(2)} MB`);
