// "Photo to share": camera frame + drone, with a Vortex brand bar, shared via the native share
// sheet (or downloaded where Web Share with files isn't supported).

import type { ArDrone } from './config/drones';
import { CONTACT } from './config/drones';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fontFamily(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

export async function composeSharePhoto(shot: Blob, drone: ArDrone): Promise<Blob> {
  const url = URL.createObjectURL(shot);
  try {
    const [img, logo] = await Promise.all([loadImage(url), loadImage('/ar-assets/vortex-wordmark.png').catch(() => null)]);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d')!;
    g.drawImage(img, 0, 0, w, h);

    const bar = Math.round(Math.min(w, h) * 0.2);
    const grad = g.createLinearGradient(0, h - bar * 1.6, 0, h);
    grad.addColorStop(0, 'rgba(6,8,13,0)');
    grad.addColorStop(1, 'rgba(6,8,13,0.92)');
    g.fillStyle = grad;
    g.fillRect(0, h - bar * 1.6, w, bar * 1.6);

    const pad = Math.round(bar * 0.28);
    const display = fontFamily('--font-barlow-condensed', 'sans-serif');
    const mono = fontFamily('--font-plex-mono', 'monospace');
    // Wordmark bottom-right, drone name bottom-left.
    if (logo) {
      const lh = bar * 0.3;
      const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
      g.drawImage(logo, w - pad - lw, h - pad - lh, lw, lh);
    }
    const x = pad;
    g.fillStyle = '#eef2f8';
    g.font = `700 ${Math.round(bar * 0.3)}px ${display}`;
    g.fillText(`${drone.name.toUpperCase()} · ${drone.num}`, x, h - pad - bar * 0.2);
    g.fillStyle = '#b8e043';
    g.font = `500 ${Math.round(bar * 0.12)}px ${mono}`;
    g.fillText(`FLOWN IN AR · ${CONTACT.site.toUpperCase()}`, x, h - pad);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function shareOrDownload(photo: Blob, drone: ArDrone): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([photo], `vortex-${drone.slug}-ar.jpg`, { type: 'image/jpeg' });
  const text = `I just flew the Vortex ${drone.name} in AR. https://${CONTACT.site}${drone.systemPath}`;
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Vortex ${drone.name}`, text });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(photo);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
