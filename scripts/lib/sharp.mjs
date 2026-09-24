// Next.js ships sharp 0.34 while glTF-Transform's ndarray-pixels depends on sharp 0.35. Loading
// both in one process registers two libvips builds and breaks encoding ("colourspace: parameter
// space not set"), so the model scripts use the exact copy glTF-Transform itself loads.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const functionsEntry = require.resolve('@gltf-transform/functions');
const pixelsEntry = createRequire(functionsEntry).resolve('ndarray-pixels');
const sharp = createRequire(pixelsEntry)('sharp');

export default sharp;
