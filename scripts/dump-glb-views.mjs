// Debug helper: writes top / front / side point projections of a GLB (raw or processed).
// Usage: node scripts/dump-glb-views.mjs 3d_models/Sentinel.glb out-prefix
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { readSingleMesh, renderViews } from './lib/glb-geometry.mjs';

const [, , file, prefix = 'view'] = process.argv;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(file);
const props = doc.getRoot().listNodes().filter((n) => /^prop_/.test(n.getName()));
for (const p of props) console.log(p.getName(), p.getTranslation().map((v) => v.toFixed(3)), p.getExtras());
const { positions } = readSingleMesh(doc);
const { min, max } = await renderViews(positions, prefix);
console.log('bounds', min.map((v) => v.toFixed(3)), max.map((v) => v.toFixed(3)));
