// Copies the 8th Wall engine binary into public/xr8 so it is served from our own origin.
// Runs before `dev` and `build`. Only the files the booth AR needs are copied: the core
// engine, the SLAM chunk (world tracking + image targets), and the license, which the
// XR Engine License requires to travel with every copy of the binary.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@8thwall', 'engine-binary', 'dist');
const dest = join(root, 'public', 'xr8');

const files = ['xr.js', 'xr-slam.js', 'LICENSE', join('resources', 'powered-by.svg')];

if (!existsSync(src)) {
  console.error('[copy-xr8] @8thwall/engine-binary is not installed. Run `npm install`.');
  process.exit(1);
}

for (const file of files) {
  const to = join(dest, file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(src, file), to);
}

console.log(`[copy-xr8] copied ${files.length} files to public/xr8`);
