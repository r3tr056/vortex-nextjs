// 8th Wall engine session: camera feed + SLAM world tracking + standee image target.
//
// The engine binary is served from /xr8 (copied by scripts/copy-xr8.mjs) and is loaded on
// demand, so the rest of the site never pays for it. Engine: 8th Wall by Niantic Spatial,
// used under the XR Engine License Agreement (see /xr8/LICENSE).

import * as THREE from 'three';
import type { ArSession, SessionCallbacks, SessionCapabilities, ImageEvent } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type XR8Api = any;

declare global {
  interface Window {
    XR8?: XR8Api;
    THREE?: unknown;
  }
}

const ENGINE_SRC = '/xr8/xr.js';
/** Assumed phone height when tracking starts; makes SLAM world units ≈ metres. */
export const CAMERA_HEIGHT = 1.4;

let enginePromise: Promise<XR8Api> | null = null;

/** Starts downloading the engine + SLAM chunk. Safe to call repeatedly. */
export function preloadEngine(): Promise<XR8Api> {
  if (enginePromise) return enginePromise;
  enginePromise = new Promise((resolve, reject) => {
    if (window.XR8) {
      resolve(window.XR8);
      return;
    }
    const timeout = window.setTimeout(() => {
      enginePromise = null;
      reject(new Error('AR engine took too long to load'));
    }, 45000);
    window.addEventListener(
      'xrloaded',
      () => {
        window.clearTimeout(timeout);
        resolve(window.XR8);
      },
      { once: true },
    );
    const script = document.createElement('script');
    script.src = ENGINE_SRC;
    script.async = true;
    script.dataset.preloadChunks = 'slam';
    script.onerror = () => {
      window.clearTimeout(timeout);
      enginePromise = null;
      reject(new Error('Could not download the AR engine'));
    };
    document.head.appendChild(script);
  });
  return enginePromise;
}

export async function isArCompatible(): Promise<{ ok: boolean; reasons: string[] }> {
  const XR8 = await preloadEngine();
  const config = { allowedDevices: XR8.XrConfig.device().MOBILE };
  if (XR8.XrDevice.isDeviceBrowserCompatible(config)) return { ok: true, reasons: [] };
  return { ok: false, reasons: XR8.XrDevice.incompatibleReasons(config) ?? [] };
}

function toImageEvent(detail: any): ImageEvent {
  return {
    name: detail.name,
    position: detail.position,
    rotation: detail.rotation,
    scale: detail.scale,
  };
}

export class Xr8Session implements ArSession {
  readonly kind = 'xr8' as const;
  private XR8: XR8Api = null;
  private last = 0;
  private frame = 0;
  private resizeCanvas: (() => void) | null = null;

  constructor(private readonly imageTargetData: unknown[] = []) {}

  async start(canvas: HTMLCanvasElement, cb: SessionCallbacks) {
    const XR8 = await preloadEngine();
    await XR8.loadChunk('slam');
    this.XR8 = XR8;
    window.THREE = THREE;

    XR8.XrController.configure({
      imageTargetData: this.imageTargetData,
      disableWorldTracking: false,
      // Exposure + colour-temperature estimate, used to match the drone to the hall lighting.
      enableLighting: true,
    });

    // Render at up to 1.75× device pixels: sharp enough for the drone, cheap enough for
    // mid-range Android phones that also run SLAM on the same GPU.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    this.resizeCanvas = resize;
    resize();
    window.addEventListener('resize', resize);

    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      XR8.Threejs.pipelineModule(),
      XR8.XrController.pipelineModule(),
      XR8.CanvasScreenshot.pipelineModule(),
      {
        name: 'vortex-booth',
        onStart: () => {
          const { scene, camera, renderer } = XR8.Threejs.xrScene();
          camera.position.set(0, CAMERA_HEIGHT, 0);
          XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
          });
          this.last = performance.now();
          cb.onReady({ scene, camera, renderer, canvas, metric: false });
        },
        onDeviceOrientationChange: () => resize(),
        onUpdate: ({ processCpuResult }: any) => {
          const now = performance.now();
          const dt = Math.min(0.1, (now - this.last) / 1000);
          this.last = now;
          const lighting = processCpuResult?.reality?.lighting;
          if (lighting && ++this.frame % 10 === 0) {
            cb.onLighting?.({ kind: 'exposure', exposure: lighting.exposure ?? 0, temperature: lighting.temperature ?? 0 });
          }
          cb.onFrame(dt);
        },
        onCameraStatusChange: ({ status }: { status: string }) => {
          if (status === 'failed') cb.onError('camera-denied', 'Camera access was blocked.');
        },
        onException: (err: unknown) => {
          cb.onError('engine', err instanceof Error ? err.message : String(err));
        },
        listeners: [
          { event: 'reality.imagefound', process: ({ detail }: any) => cb.onImageFound?.(toImageEvent(detail)) },
          { event: 'reality.imageupdated', process: ({ detail }: any) => cb.onImageUpdated?.(toImageEvent(detail)) },
          { event: 'reality.imagelost', process: ({ detail }: any) => cb.onImageLost?.(toImageEvent(detail)) },
          {
            event: 'reality.trackingstatus',
            process: ({ detail }: any) => cb.onTracking?.(detail.status, detail.reason),
          },
        ],
      },
    ]);

    XR8.run({
      canvas,
      allowedDevices: XR8.XrConfig.device().MOBILE,
      cameraConfig: { direction: XR8.XrConfig.camera().BACK },
    });
  }

  capabilities(): SessionCapabilities {
    return { depthOcclusion: false, lightEstimation: true, anchors: false, markerTracking: false, imageTargets: true, photo: true };
  }

  /** Re-centres SLAM, e.g. after the visitor walks far from the booth. */
  recenter() {
    this.XR8?.XrController.recenter();
  }

  stop() {
    if (this.resizeCanvas) window.removeEventListener('resize', this.resizeCanvas);
    if (!this.XR8) return;
    try {
      this.XR8.stop();
      this.XR8.clearCameraPipelineModules();
    } catch {
      // Engine already torn down.
    }
    this.XR8 = null;
  }

  async screenshot(): Promise<Blob | null> {
    if (!this.XR8) return null;
    try {
      const base64: string = await this.XR8.CanvasScreenshot.takeScreenshot();
      const res = await fetch(`data:image/jpeg;base64,${base64}`);
      return await res.blob();
    } catch {
      return null;
    }
  }
}
