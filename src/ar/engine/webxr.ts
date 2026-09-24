// Native AR on Android (Chrome + ARCore) via WebXR `immersive-ar`.
//
// Uses what the device offers: ARCore world tracking and hit-testing, anchors, light estimation
// (with a reflection map), DOM overlay for the HUD, and raw camera access — which lets us read
// the standee's QR code with Chrome's BarcodeDetector and anchor the booth to it metrically, plus
// take composited photos.
//
// Depth-sensing is deliberately not requested: three's built-in occlusion only understands
// Quest's depth format, so on ARCore it would cost a depth computation every frame for nothing.
//
// The session itself is requested synchronously inside the Start tap (ArController.start).

import {
  Color,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight.js';
import type { BoothPose } from '../core/anchor.ts';
import { solveMarkerPose } from '../core/qrPose.ts';
import type { ArSession, SessionCallbacks, SessionCapabilities } from './types';

interface BarcodeResult {
  rawValue: string;
  cornerPoints: { x: number; y: number }[];
}
interface BarcodeDetectorLike {
  detect(source: ImageData): Promise<BarcodeResult[]>;
}
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => BarcodeDetectorLike;

export async function isWebXrArSupported(): Promise<boolean> {
  try {
    return !!navigator.xr && (await navigator.xr.isSessionSupported('immersive-ar'));
  } catch {
    return false;
  }
}

/** Region of the camera image in GL texture coordinates (origin bottom-left). */
interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}
const FULL: Crop = { x: 0, y: 0, w: 1, h: 1 };

// Samples a region of the camera texture as-is (no colour conversion) into a render target.
const cameraQuadMaterial = () =>
  new ShaderMaterial({
    uniforms: { map: { value: null }, crop: { value: new Vector4(0, 0, 1, 1) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `uniform sampler2D map; uniform vec4 crop; varying vec2 vUv;
      void main() { gl_FragColor = texture2D(map, crop.xy + vUv * crop.zw); }`,
    depthTest: false,
    depthWrite: false,
  });

class CameraReader {
  private readonly scene = new Scene();
  private readonly cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material = cameraQuadMaterial();
  private rt: WebGLRenderTarget | null = null;
  private buffer = new Uint8Array(0);
  private image: ImageData | null = null;

  constructor() {
    this.scene.add(new Mesh(new PlaneGeometry(2, 2), this.material));
  }

  /** Renders `crop` of the camera texture at w×h. Must run inside the XR frame callback. */
  private draw(renderer: WebGLRenderer, texture: Texture, w: number, h: number, crop: Crop): WebGLRenderTarget {
    if (!this.rt || this.rt.width !== w || this.rt.height !== h) {
      this.rt?.dispose();
      this.rt = new WebGLRenderTarget(w, h, { depthBuffer: false });
      this.buffer = new Uint8Array(w * h * 4);
      this.image = new ImageData(w, h);
    }
    this.material.uniforms.map.value = texture;
    (this.material.uniforms.crop.value as Vector4).set(crop.x, crop.y, crop.w, crop.h);
    const target = renderer.getRenderTarget();
    const xrEnabled = renderer.xr.enabled;
    renderer.xr.enabled = false;
    try {
      renderer.setRenderTarget(this.rt);
      renderer.render(this.scene, this.cam);
    } finally {
      renderer.setRenderTarget(target);
      renderer.xr.enabled = xrEnabled;
    }
    return this.rt;
  }

  /** Top-down RGBA copy of the last read. The ImageData is reused: callers must serialise. */
  private toImage(w: number, h: number): ImageData {
    const img = this.image!;
    const row = w * 4;
    for (let y = 0; y < h; y++) img.data.set(this.buffer.subarray((h - 1 - y) * row, (h - y) * row), y * row);
    return img;
  }

  read(renderer: WebGLRenderer, texture: Texture, w: number, h: number, crop: Crop = FULL): ImageData {
    const rt = this.draw(renderer, texture, w, h, crop);
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, this.buffer);
    return this.toImage(w, h);
  }

  /** Same as read() without stalling the frame on the GPU (pixel buffer + fence). */
  async readAsync(renderer: WebGLRenderer, texture: Texture, w: number, h: number, crop: Crop): Promise<ImageData> {
    const rt = this.draw(renderer, texture, w, h, crop);
    try {
      await renderer.readRenderTargetPixelsAsync(rt, 0, 0, w, h, this.buffer);
    } catch {
      // No async readback on this GPU. The target still holds this frame's pixels (the camera
      // texture itself is gone by now), so read the target directly.
      renderer.readRenderTargetPixels(rt, 0, 0, w, h, this.buffer);
    }
    return this.toImage(w, h);
  }

  dispose() {
    this.rt?.dispose();
    this.rt = null;
    this.material.dispose();
  }
}

/**
 * QR scan window: the short side at 640 px (a 12 cm code at 1.5 m stays ~50 px across), the long
 * side cropped to 4:3 around the centre, where the on-screen scan guide sits.
 */
function scanWindow(aspect: number): { w: number; h: number; crop: Crop } {
  const SHORT = 640;
  const LONG = Math.round(SHORT * (4 / 3));
  if (aspect < 1) {
    const fullH = SHORT / aspect;
    const h = Math.min(LONG, Math.round(fullH));
    const ch = h / fullH;
    return { w: SHORT, h, crop: { x: 0, y: (1 - ch) / 2, w: 1, h: ch } };
  }
  const fullW = SHORT * aspect;
  const w = Math.min(LONG, Math.round(fullW));
  const cw = w / fullW;
  return { w, h: SHORT, crop: { x: (1 - cw) / 2, y: 0, w: cw, h: 1 } };
}

export interface WebXrMarker {
  sizeM: number;
  match: string;
}

const _m = new Matrix4();
const _up = new Vector3();
const _fwd = new Vector3();
const _q = new Quaternion();
const Y_AXIS = new Vector3(0, 1, 0);

export class WebXrSession implements ArSession {
  readonly kind = 'webxr' as const;
  private renderer: WebGLRenderer | null = null;
  private refSpace: XRReferenceSpace | null = null;
  private hitSource: XRHitTestSource | null = null;
  private readonly hit = new Vector3();
  private hitValid = false;
  private anchor: XRAnchor | null = null;
  private anchorRequest: BoothPose | null = null;
  /** Bumped per anchor request: a slow createAnchor() from an older request is discarded. */
  private anchorSeq = 0;
  private readonly anchorPos = new Vector3();
  private scanning = false;
  private qrBusy = false;
  private qrLast = 0;
  private detector: BarcodeDetectorLike | null = null;
  private readonly qrReader = new CameraReader();
  private readonly photoReader = new CameraReader();
  private captureWaiters: ((b: Blob | null) => void)[] = [];
  private features: string[] = [];
  private last = 0;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private ended = false;

  constructor(
    private readonly sessionPromise: Promise<XRSession>,
    private readonly marker: WebXrMarker | null,
  ) {
    const BD = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (BD && marker) {
      try {
        this.detector = new BD({ formats: ['qr_code'] });
      } catch {
        this.detector = null;
      }
    }
  }

  capabilities(): SessionCapabilities {
    const has = (f: string) => this.features.includes(f);
    return {
      depthOcclusion: false,
      lightEstimation: has('light-estimation'),
      anchors: has('anchors'),
      markerTracking: has('camera-access') && !!this.detector,
      imageTargets: false,
      photo: has('camera-access'),
    };
  }

  async start(canvas: HTMLCanvasElement, cb: SessionCallbacks) {
    const session = await this.sessionPromise;
    if (this.ended) return; // stop() already ends the session
    this.features = [...(session.enabledFeatures ?? [])];
    session.addEventListener('end', () => {
      if (this.ended) return;
      this.ended = true;
      this.renderer?.setAnimationLoop(null);
      canvas.style.visibility = '';
      cb.onEnded?.();
    });

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    this.renderer = renderer;

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 60);
    scene.add(camera);
    this.scene = scene;
    this.camera = camera;

    // XREstimatedLight requests its light probe on the renderer's `sessionstart`, which
    // setSession() dispatches — so it has to exist before that call.
    if (this.features.includes('light-estimation') && 'requestLightProbe' in session) {
      const light = new XREstimatedLight(renderer, true);
      light.addEventListener('estimationstart', () => {
        scene.add(light);
        cb.onLighting?.({ kind: 'estimated', active: true, environment: light.environment });
      });
      light.addEventListener('estimationend', () => {
        scene.remove(light);
        cb.onLighting?.({ kind: 'estimated', active: false, environment: null });
      });
    }

    await renderer.xr.setSession(session);
    if (this.ended) return;
    // The XR compositor shows the camera; the page canvas would only cover the DOM overlay.
    canvas.style.visibility = 'hidden';
    this.refSpace = renderer.xr.getReferenceSpace();

    try {
      const viewer = await session.requestReferenceSpace('viewer');
      this.hitSource = (await session.requestHitTestSource?.({ space: viewer })) ?? null;
    } catch {
      this.hitSource = null;
    }
    if (this.ended) {
      this.hitSource?.cancel();
      this.hitSource = null;
      return;
    }

    cb.onReady({
      scene,
      camera,
      renderer,
      canvas,
      metric: true,
      hitTest: () => (this.hitValid ? this.hit : null),
    });

    this.last = performance.now();
    renderer.setAnimationLoop((_t, frame) => this.onXrFrame(frame, cb));
  }

  private onXrFrame(frame: XRFrame | undefined, cb: SessionCallbacks) {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const refSpace = this.refSpace;
    if (!renderer || !scene || !camera || this.ended) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;

    // Pose the user camera now (three would otherwise do it inside render, a frame late for us).
    renderer.xr.updateCamera(camera);

    if (frame && refSpace) {
      this.updateHitTest(frame, refSpace);
      this.updateAnchor(frame, refSpace, cb);
      const view = frame.getViewerPose(refSpace)?.views[0];
      const xrCam = renderer.xr.getCamera().cameras[0] ?? renderer.xr.getCamera();
      // Raw camera access (WebXR camera-access module); not yet in the WebXR typings.
      const viewCamera = (view as (XRView & { camera?: { width: number; height: number } }) | undefined)?.camera;
      if (viewCamera && (this.captureWaiters.length || (this.scanning && this.detector))) {
        const texture = renderer.xr.getCameraTexture(viewCamera as never) as Texture | undefined;
        if (texture) {
          const aspect = viewCamera.width / viewCamera.height;
          if (this.scanning && this.detector && now - this.qrLast > 300 && !this.qrBusy) {
            this.qrLast = now;
            this.scanQr(renderer, texture, aspect, xrCam, cb);
          }
          if (this.captureWaiters.length) this.capture(renderer, texture, aspect, xrCam);
        }
      }
    }

    cb.onFrame(dt);
    renderer.render(scene, camera);
  }

  private updateHitTest(frame: XRFrame, refSpace: XRReferenceSpace) {
    this.hitValid = false;
    if (!this.hitSource) return;
    const results = frame.getHitTestResults(this.hitSource);
    for (const r of results) {
      const pose = r.getPose(refSpace);
      if (!pose) continue;
      _m.fromArray(pose.transform.matrix);
      // Floors only: the surface normal (the hit pose's Y axis) must point up.
      if (_up.set(0, 1, 0).transformDirection(_m).y < 0.85) continue;
      this.hit.setFromMatrixPosition(_m);
      this.hitValid = true;
      return;
    }
  }

  private updateAnchor(frame: XRFrame, refSpace: XRReferenceSpace, cb: SessionCallbacks) {
    const req = this.anchorRequest;
    if (req && frame.createAnchor) {
      this.anchorRequest = null;
      const seq = this.anchorSeq;
      _q.setFromAxisAngle(Y_AXIS, req.yaw);
      const transform = new XRRigidTransform(
        { x: req.position.x, y: req.position.y, z: req.position.z },
        { x: _q.x, y: _q.y, z: _q.z, w: _q.w },
      );
      frame
        .createAnchor(transform, refSpace)
        ?.then((a) => {
          if (seq !== this.anchorSeq || this.ended) {
            a.delete();
            return;
          }
          this.anchor = a;
        })
        .catch(() => {});
    }
    if (this.anchor && frame.trackedAnchors?.has(this.anchor)) {
      const pose = frame.getPose(this.anchor.anchorSpace, refSpace);
      if (pose) {
        _m.fromArray(pose.transform.matrix);
        this.anchorPos.setFromMatrixPosition(_m);
        _fwd.set(0, 0, 1).transformDirection(_m);
        cb.onAnchor?.(this.anchorPos, Math.atan2(_fwd.x, _fwd.z));
      }
    }
  }

  private scanQr(renderer: WebGLRenderer, texture: Texture, aspect: number, xrCam: PerspectiveCamera, cb: SessionCallbacks) {
    const detector = this.detector;
    const marker = this.marker;
    if (!detector || !marker) return;
    const { w, h, crop } = scanWindow(aspect);
    // The camera pose is snapshotted in the same frame as the pixels.
    const projection = xrCam.projectionMatrix.clone();
    const world = xrCam.matrixWorld.clone();
    this.qrBusy = true;
    this.qrReader
      .readAsync(renderer, texture, w, h, crop)
      .then((img) => detector.detect(img))
      .then((codes) => {
        if (this.ended) return;
        const candidates = codes.filter((c) => c.cornerPoints?.length === 4 && (!marker.match || c.rawValue.includes(marker.match)));
        // Prefer the largest code in view (closest / most reliable corners).
        const area = (c: BarcodeResult) => {
          const [a, b, , d] = c.cornerPoints;
          return Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(d.x - a.x, d.y - a.y);
        };
        const code = candidates.sort((x, y) => area(y) - area(x))[0];
        if (!code) return;
        // Crop pixels (top-down) → full camera image texture coords → NDC.
        const ndc = code.cornerPoints.map((p) => ({
          x: (crop.x + (p.x / w) * crop.w) * 2 - 1,
          y: (crop.y + (1 - p.y / h) * crop.h) * 2 - 1,
        }));
        const pose = solveMarkerPose(ndc, projection, marker.sizeM);
        if (!pose) return;
        const distance = pose.position.length();
        pose.position.applyMatrix4(world);
        pose.quaternion.premultiply(new Quaternion().setFromRotationMatrix(world));
        cb.onMarker?.({ position: pose.position, quaternion: pose.quaternion, distance, value: code.rawValue });
      })
      .catch(() => {})
      .finally(() => {
        this.qrBusy = false;
      });
  }

  /** Composites the camera image and the 3D scene into a JPEG (the XR canvas holds only 3D). */
  private capture(renderer: WebGLRenderer, texture: Texture, aspect: number, xrCam: PerspectiveCamera) {
    const waiters = this.captureWaiters.splice(0);
    const done = (b: Blob | null) => waiters.forEach((resolve) => resolve(b));
    const scene = this.scene;
    let rt: WebGLRenderTarget | null = null;
    try {
      const width = Math.min(1440, Math.round(1080 * Math.max(1, aspect)));
      const bg = this.photoReader.read(renderer, texture, width, Math.round(width / aspect));
      const w = bg.width;
      const h = bg.height;
      // Render exactly like the on-screen XR layer: sRGB-encoded, tone-mapped output blended in
      // sRGB space (so glows and ghosts match the screen), stored as plain RGBA8, with MSAA.
      rt = new WebGLRenderTarget(w, h, { samples: 4, colorSpace: SRGBColorSpace, internalFormat: 'RGBA8' });
      rt.texture.internalFormat = 'RGBA8';
      (rt as unknown as { isXRRenderTarget: boolean }).isXRRenderTarget = true;
      const cam = new PerspectiveCamera();
      cam.projectionMatrix.copy(xrCam.projectionMatrix);
      cam.projectionMatrixInverse.copy(xrCam.projectionMatrixInverse);
      cam.matrixWorld.copy(xrCam.matrixWorld);
      cam.matrixWorldInverse.copy(xrCam.matrixWorldInverse);
      cam.matrixAutoUpdate = false;
      cam.matrixWorldAutoUpdate = false;
      const px = new Uint8Array(w * h * 4);
      const target = renderer.getRenderTarget();
      const xrEnabled = renderer.xr.enabled;
      const clearColor = renderer.getClearColor(new Color());
      const clearAlpha = renderer.getClearAlpha();
      renderer.xr.enabled = false;
      try {
        renderer.setRenderTarget(rt);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        if (scene) renderer.render(scene, cam);
        renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
      } finally {
        renderer.setClearColor(clearColor, clearAlpha);
        renderer.setRenderTarget(target);
        renderer.xr.enabled = xrEnabled;
      }
      // Premultiplied "over", as the XR compositor does: out = scene + camera · (1 − alpha).
      const out = bg.data;
      const row = w * 4;
      for (let y = 0; y < h; y++) {
        const src = (h - 1 - y) * row;
        const dst = y * row;
        for (let x = 0; x < row; x += 4) {
          const a = px[src + x + 3];
          const r = px[src + x];
          const g = px[src + x + 1];
          const b = px[src + x + 2];
          if (a === 0 && r === 0 && g === 0 && b === 0) continue;
          const k = 1 - a / 255;
          out[dst + x] = Math.min(255, r + out[dst + x] * k);
          out[dst + x + 1] = Math.min(255, g + out[dst + x + 1] * k);
          out[dst + x + 2] = Math.min(255, b + out[dst + x + 2] * k);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return done(null);
      ctx.putImageData(bg, 0, 0);
      canvas.toBlob(done, 'image/jpeg', 0.9);
    } catch {
      done(null);
    } finally {
      rt?.dispose();
    }
  }

  setBoothAnchor(pose: BoothPose) {
    if (!this.features.includes('anchors')) return;
    // Drop the old anchor now: while the new one is being created it would keep pulling the
    // booth back to where it was.
    this.anchorSeq++;
    this.anchor?.delete();
    this.anchor = null;
    this.anchorRequest = { position: pose.position.clone(), yaw: pose.yaw, scale: 1 };
  }

  setMarkerScanning(on: boolean) {
    this.scanning = on;
  }

  async screenshot(): Promise<Blob | null> {
    if (!this.features.includes('camera-access') || !this.renderer || this.ended) return null;
    return new Promise((resolve) => {
      const waiter = (b: Blob | null) => {
        window.clearTimeout(timer);
        resolve(b);
      };
      const timer = window.setTimeout(() => {
        this.captureWaiters = this.captureWaiters.filter((w) => w !== waiter);
        resolve(null);
      }, 3000);
      this.captureWaiters.push(waiter);
    });
  }

  stop() {
    if (this.ended && !this.renderer) return;
    this.ended = true;
    this.renderer?.setAnimationLoop(null);
    this.anchorSeq++;
    this.anchor?.delete();
    this.anchor = null;
    this.hitSource?.cancel();
    this.hitSource = null;
    this.captureWaiters.splice(0).forEach((resolve) => resolve(null));
    // Also covers a session that resolves after stop() (the visitor backed out mid-start).
    void this.sessionPromise.then((s) => s.end()).catch(() => {});
    this.qrReader.dispose();
    this.photoReader.dispose();
    if (this.renderer) this.renderer.domElement.style.visibility = '';
    this.renderer?.dispose();
    this.renderer = null;
  }
}
