// Shared helpers for reading world-space triangle data out of a single-mesh glTF (Meshy export).
import sharp from './sharp.mjs';

/** Returns { positions (world space), normals (world space, may be null), indices, prim, node }. */
export function readSingleMesh(doc) {
  const root = doc.getRoot();
  const node = root.listNodes().find((n) => n.getMesh());
  if (!node) throw new Error('No mesh node found');
  const prims = node.getMesh().listPrimitives();
  if (prims.length !== 1) throw new Error(`Expected 1 primitive, found ${prims.length}`);
  const prim = prims[0];
  const m = node.getWorldMatrix();
  const read = (name, isDir) => {
    const acc = prim.getAttribute(name);
    if (!acc) return null;
    const count = acc.getCount();
    const out = new Float32Array(count * 3);
    const v = [0, 0, 0];
    for (let i = 0; i < count; i++) {
      acc.getElement(i, v);
      const [x, y, z] = v;
      const w = isDir ? 0 : 1;
      out[i * 3] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
      out[i * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
      out[i * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    }
    return out;
  };
  const positions = read('POSITION', false);
  const normals = read('NORMAL', true);
  const idxAcc = prim.getIndices();
  const count = positions.length / 3;
  const indices = idxAcc ? Uint32Array.from(idxAcc.getArray()) : Uint32Array.from({ length: count }, (_, i) => i);
  return { positions, normals, indices, prim, node };
}

/** Writes top / front / side point-density projections (debugging aid). */
export async function renderViews(positions, prefix, indices = null) {
  const n = positions.length / 3;
  const used = new Uint8Array(n);
  if (indices) for (const i of indices) used[i] = 1;
  else used.fill(1);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    if (!used[i]) continue;
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], positions[i * 3 + a]);
      max[a] = Math.max(max[a], positions[i * 3 + a]);
    }
  }
  const S = 900;
  const view = async (name, ax, ay, flip) => {
    const img = new Uint8Array(S * S * 3);
    const span = Math.max(max[ax] - min[ax], max[ay] - min[ay]);
    for (let i = 0; i < n; i++) {
      if (!used[i]) continue;
      const u = (positions[i * 3 + ax] - min[ax]) / span;
      let w = (positions[i * 3 + ay] - min[ay]) / span;
      if (flip) w = 1 - w;
      const px = Math.min(S - 1, Math.floor(u * (S - 1)));
      const py = Math.min(S - 1, Math.floor(w * (S - 1)));
      const o = (py * S + px) * 3;
      const v = Math.min(255, img[o] + 40);
      img[o] = img[o + 1] = img[o + 2] = v;
    }
    await sharp(Buffer.from(img), { raw: { width: S, height: S, channels: 3 } }).png().toFile(`${prefix}-${name}.png`);
  };
  await view('top', 0, 2, false);
  await view('front', 0, 1, true);
  await view('side', 2, 1, true);
  return { min, max };
}
