// Native AR on iPhone/iPad via AR Quick Look (ARKit): real plane detection, people occlusion,
// true-to-scale placement, native lighting and native photo/video capture.
//
// Safari can't run WebXR, and Quick Look can't run our custom controls, so on iOS it complements
// the interactive 8th Wall experience. The USDZ is generated on the device from the same ~1 MB
// GLB (propellers restored), so there is no 40 MB USDZ to download. Quick Look's banner button
// ("Book a demo") posts a message back to the page.

import { Group, Mesh, type Object3D } from 'three';
import type { ArDrone } from '../config/drones';

export function isQuickLookSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const a = document.createElement('a');
  return !!a.relList?.supports?.('ar');
}

export const QUICK_LOOK_BUTTON_EVENT = '_apple_ar_quicklook_button_tapped';

/** Builds a USDZ blob URL from the drone rig's model group (static pose, blades visible). */
export async function buildUsdz(model: Object3D): Promise<string> {
  const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
  const exportRoot = new Group();
  const clone = model.clone(true);
  // Drop helper meshes (prop blur discs, effects) that only make sense when animated.
  const drop: Object3D[] = [];
  clone.traverse((o) => {
    if (o.userData.noExport) drop.push(o);
    if ((o as Mesh).isMesh) o.visible = true;
  });
  drop.forEach((o) => o.parent?.remove(o));
  exportRoot.add(clone);
  exportRoot.updateMatrixWorld(true);
  const exporter = new USDZExporter();
  const data = await exporter.parseAsync(exportRoot, { quickLookCompatible: true, maxTextureSize: 1024 });
  return URL.createObjectURL(new Blob([data as BlobPart], { type: 'model/vnd.usdz+zip' }));
}

/**
 * Opens Quick Look. Must run synchronously inside a tap handler, so the USDZ must already be
 * built. `onBannerTap` fires when the visitor taps the "Book a demo" banner inside Quick Look.
 */
export function openQuickLook(usdzUrl: string, drone: ArDrone, onBannerTap: () => void) {
  const params = new URLSearchParams({
    callToAction: 'Book a demo',
    checkoutTitle: `Vortex ${drone.name} · ${drone.num}`,
    checkoutSubtitle: drone.role,
    allowsContentScaling: '0',
  });
  const a = document.createElement('a');
  a.rel = 'ar';
  a.href = `${usdzUrl}#${params.toString()}`;
  // Quick Look requires the anchor to wrap an image.
  a.appendChild(document.createElement('img'));
  a.addEventListener(
    'message',
    (e) => {
      if ((e as MessageEvent).data === QUICK_LOOK_BUTTON_EVENT) onBannerTap();
    },
    false,
  );
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => a.remove(), 60_000);
}
