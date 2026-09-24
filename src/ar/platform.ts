import type { Platform } from './core/store.ts';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (!window.matchMedia('(pointer: coarse)').matches) return 'desktop';
  return 'other';
}

/** Social-app webviews usually block the camera; we ask visitors to open the real browser. */
export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|LinkedInApp|Snapchat|Line\/|; wv\)/.test(navigator.userAgent);
}
