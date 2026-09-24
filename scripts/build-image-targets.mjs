// Builds 8th Wall image targets (+ a web preview) from the standee print files.
//
//   node scripts/build-image-targets.mjs
//
// Each standee print is 75 cm wide; its pixel width therefore sets the physical scale. Three 3:4
// targets are cut from each print so recognition survives glare, blur or a person blocking part of
// the standee — any one of them is enough to anchor:
//   upper — logo, drone render, product name (full width, eye level)
//   lower — subtitle, spec table, QR code (full width, high-contrast text)
//   close — spec values + QR card only (right half, for visitors still standing close after scanning)
// The physical size and centre of each target are printed for src/ar/config/drones.ts.
//
// Assumption: the bottom edge of the print file sits at floor level (the extra length beyond
// 180 cm is hidden inside the roll-up cassette). Adjust PRINT_BOTTOM_M if calibration shows
// the drone floating or sinking.

import { mkdirSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { applyCrop } from '@8thwall/image-target-cli/src/apply.js';

const STANDEE_WIDTH_M = 0.75;
const PRINT_BOTTOM_M = 0;
const OUT = 'public/ar-assets/targets';
const PREVIEW_OUT = 'public/ar-assets/standees';

const STANDEES = [
  { slug: 'sentinel', file: '3d_models/standee_images/Sentinel Standee.png' },
  { slug: 'ranger', file: '3d_models/standee_images/Ranger Standee.png' },
];

mkdirSync(OUT, { recursive: true });
mkdirSync(PREVIEW_OUT, { recursive: true });

for (const { slug, file } of STANDEES) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const pxPerM = width / STANDEE_WIDTH_M;
  const cropH = Math.round((width * 4) / 3);
  const closeW = 480; // CLI minimum width
  const closeH = 640;
  const crops = [
    { part: 'upper', top: 0, left: 0, w: width, h: cropH },
    { part: 'lower', top: height - cropH, left: 0, w: width, h: cropH },
    { part: 'close', top: height - closeH, left: width - closeW, w: closeW, h: closeH },
  ];
  console.log(`▸ ${slug}: ${width}×${height}px, ${(pxPerM / 100).toFixed(2)} px/cm, print height ${(height / pxPerM).toFixed(3)} m`);

  for (const { part, top, left, w, h } of crops) {
    const name = `${slug}-${part}`;
    const geometry = { top, left, width: w, height: h, isRotated: false, originalWidth: width, originalHeight: height };
    const { dataPath } = await applyCrop(sharp(file), { type: 'PLANAR', geometry }, OUT, name, true);

    // The CLI writes a page-relative URL; the AR pages live under /ar/<slug>, so make it absolute
    // and drop the files the engine never loads.
    const data = JSON.parse(await readFile(dataPath, 'utf8'));
    data.imagePath = `/ar-assets/targets/${data.resources.luminanceImage}`;
    await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
    for (const key of ['originalImage', 'croppedImage', 'thumbnailImage']) rmSync(join(OUT, data.resources[key]), { force: true });

    const centreX = (left + w / 2 - width / 2) / pxPerM;
    const centreY = PRINT_BOTTOM_M + (height - (top + h / 2)) / pxPerM;
    console.log(
      `   ${name}: size ${(w / pxPerM).toFixed(3)} × ${(h / pxPerM).toFixed(3)} m, ` +
        `centre [${centreX.toFixed(3)}, ${centreY.toFixed(3)}] m (right of centre, above floor) → ${dataPath}`,
    );
  }

  // Virtual standee for 3D preview mode.
  await sharp(file).resize({ width: 600 }).webp({ quality: 80 }).toFile(join(PREVIEW_OUT, `${slug}.webp`));
}
