// Native AR on Android (Chrome + ARCore) via WebXR `immersive-ar`.
//
// Uses what the device offers: ARCore world tracking and hit-testing, anchors, light estimation
// (with a reflection map), depth-sensing occlusion (real objects hide the drone), DOM overlay
// for the HUD, and raw camera access — which lets us read the standee's QR code with Chrome's
// BarcodeDetector and anchor the booth to it metrically, plus take composited photos.
//
// requestArSession() must be called synchronously inside the Start tap (user activation).

import {
  Matrix4,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  Texture,
  Vector3,
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

/** Call synchronously in the tap handler; the returned promise is handed to WebXrSession. */
export function requestArSession(overlayRoot: HTMLElement): Promise<XRSession> {
  if (!navigator.xr) return Promise.reject(new Error('WebXR unavailable'));
  const init = {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay', 'anchors', 'light-estimation', 'depth-sensing', 'camera-access', 'local-floor'],
    domOverlay: { root: overlayRoot },
    depthSensing: {
      usagePreference: ['gpu-optimized'],
      dataFormatPreference: ['luminance-alpha', 'float32', 'unsigned-short'],
    },
  } as XRSessionInit;
  return navigator.xr.requestSession('immersive-ar', init);
}

// Samples the camera texture as-is (no colour conversion) into a render target.
const cameraQuadMaterial = () =>
  new ShaderMaterial({
    uniforms: { map: { value: null } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `uniform sampler2D map; varying vec2 vUv; void main() { gl_FragColor = texture2D(map, vUv); }`,
    depthTest: false,
    depthWrite: false,
  });

const SRGB_LUT = (() => {
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    lut[i] = Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
  }
  return lut;
})();

class CameraReader {
  private readonly scene = new Scene();
  private readonly cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material = cameraQuadMaterial();
  private rt: WebGLRenderTarget | null = null;
  private buffer = new Uint8Array(0);

  constructor() {
    this.scene.add(new Mesh(new PlaneGeometry(2, 2), this.material));
  }

  /** Renders the camera texture at `width` px wide and returns top-down RGBA pixels. */
  read(renderer: WebGLRenderer, texture: Texture, width: number, aspect: number): ImageData {
    const w = Math.round(width);
    const h = Math.round(width / aspect);
    if (!this.rt || this.rt.width !== w || this.rt.height !== h) {
      this.rt?.dispose();
      this.rt = new WebGLRenderTarget(w, h, { depthBuffer: false });
      this.buffer = new Uint8Array(w * h * 4);
    }
    this.material.uniforms.map.value = texture;
    const xrTarget = renderer.getRenderTarget();
    const xrEnabled = renderer.xr.enabled;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(this.rt);
    renderer.render(this.scene, this.cam);
    renderer.readRenderTargetPixels(this.rt, 0, 0, w, h, this.buffer);
    renderer.setRenderTarget(xrTarget);
    renderer.xr.enabled = xrEnabled;
    const img = new ImageData(w, h);
    const row = w * 4;
    for (let y = 0; y < h; y++) img.data.set(this.buffer.subarray((h - 1 - y) * row, (h - y) * row), y * row);
    return img;
  }

  dispose() {
    this.rt?.dispose();
    this.material.dispose();
  }
}

export interface WebXrMarker {
  sizeM: number;
  match: string;
}

export class WebXrSession implements ArSession {
  readonly kind = 'webxr' as const;
  private renderer: WebGLRenderer | null = null;
  private session: XRSession | null = null;
  private refSpace: XRReferenceSpace | null = null;
  private hitSource: XRHitTestSource | null = null;
  private readonly hit = new Vector3();
  private hitValid = false;
  private anchor: XRAnchor | null = null;
  private anchorRequest: BoothPose | null = null;
  private scanning = false;
  private qrBusy = false;
  private qrLast = 0;
  private detector: BarcodeDetectorLike | null = null;
  private readonly reader = new CameraReader();
  private captureWaiters: ((b: Blob | null) => void)[] = [];
  private features: string[] = [];
  private lightActive = false;
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
      depthOcclusion: !!this.renderer?.xr.hasDepthSensing(),
      lightEstimation: has('light-estimation'),
      anchors: has('anchors'),
      markerTracking: has('camera-access') && !!this.detector,
      imageTargets: false,
      photo: has('camera-access'),
    };
  }

  async start(canvas: HTMLCanvasElement, cb: SessionCallbacks) {
    const session = await this.sessionPromise;
    this.session = session;
    this.features = [...(session.enabledFeatures ?? [])];

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    this.renderer = renderer;
    await renderer.xr.setSession(session);
    // The XR compositor shows the camera; the page canvas would only cover the DOM overlay.
    canvas.style.visibility = 'hidden';

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 60);
    scene.add(camera);
    this.scene = scene;
    this.camera = camera;
    this.refSpace = renderer.xr.getReferenceSpace();

    try {
      const viewer = await session.requestReferenceSpace('viewer');
      this.hitSource = (await session.requestHitTestSource?.({ space: viewer })) ?? null;
    } catch {
      this.hitSource = null;
    }

    if (this.features.includes('light-estimation')) {
      const light = new XREstimatedLight(renderer, true);
      light.addEventListener('estimationstart', () => {
        this.lightActive = true;
        scene.add(light);
        cb.onLighting?.({ kind: 'estimated', active: true, environment: light.environment });
      });
      light.addEventListener('estimationend', () => {
        this.lightActive = false;
        scene.remove(light);
        cb.onLighting?.({ kind: 'estimated', active: false, environment: null });
      });
    }

    session.addEventListener('end', () => {
      if (this.ended) return;
      this.ended = true;
      renderer.setAnimationLoop(null);
      canvas.style.visibility = '';
      cb.onEnded?.();
    });

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
    if (!renderer || !scene || !camera) return;
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
      if (viewCamera) {
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
      const m = new Matrix4().fromArray(pose.transform.matrix);
      const up = new Vector3(0, 1, 0).transformDirection(m);
      // Floors only: the surface normal must point up.
      if (up.y < 0.85) continue;
      this.hit.setFromMatrixPosition(m);
      this.hitValid = true;
      return;
    }
  }

  private updateAnchor(frame: XRFrame, refSpace: XRReferenceSpace, cb: SessionCallbacks) {
    const req = this.anchorRequest;
    if (req && frame.createAnchor) {
      this.anchorRequest = null;
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), req.yaw);
      const transform = new XRRigidTransform(
        { x: req.position.x, y: req.position.y, z: req.position.z },
        { x: q.x, y: q.y, z: q.z, w: q.w },
      );
      frame
        .createAnchor(transform, refSpace)
        ?.then((a) => {
          this.anchor?.delete();
          this.anchor = a;
        })
        .catch(() => {});
    }
    if (this.anchor && frame.trackedAnchors?.has(this.anchor)) {
      const pose = frame.getPose(this.anchor.anchorSpace, refSpace);
      if (pose) {
        const m = new Matrix4().fromArray(pose.transform.matrix);
        const pos = new Vector3().setFromMatrixPosition(m);
        const fwd = new Vector3(0, 0, 1).transformDirection(m);
        cb.onAnchor?.(pos, Math.atan2(fwd.x, fwd.z));
      }
    }
  }

  private scanQr(renderer: WebGLRenderer, texture: Texture, aspect: number, xrCam: PerspectiveCamera, cb: SessionCallbacks) {
    const detector = this.detector;
    const marker = this.marker;
    if (!detector || !marker) return;
    // Portrait camera images are tall: 640 px wide keeps a QR at 1.5 m around 50 px across.
    const img = this.reader.read(renderer, texture, Math.min(720, 640 * Math.max(1, aspect)), aspect);
    const projection = xrCam.projectionMatrix.clone();
    const world = xrCam.matrixWorld.clone();
    this.qrBusy = true;
    detector
      .detect(img)
      .then((codes) => {
        const candidates = codes.filter((c) => c.cornerPoints?.length === 4 && (!marker.match || c.rawValue.includes(marker.match)));
        // Prefer the largest code in view (closest / most reliable corners).
        const area = (c: BarcodeResult) => {
          const [a, b, , d] = c.cornerPoints;
          return Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(d.x - a.x, d.y - a.y);
        };
        const code = candidates.sort((x, y) => area(y) - area(x))[0];
        if (!code) return;
        const ndc = code.cornerPoints.map((p) => ({ x: (p.x / img.width) * 2 - 1, y: 1 - (p.y / img.height) * 2 }));
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
    const scene = this.scene;
    try {
      const width = Math.min(1440, Math.round(1080 * Math.max(1, aspect)));
      const bg = this.reader.read(renderer, texture, width, aspect);
      const w = bg.width;
      const h = bg.height;
      const rt = new WebGLRenderTarget(w, h);
      const cam = new PerspectiveCamera();
      cam.projectionMatrix.copy(xrCam.projectionMatrix);
      cam.projectionMatrixInverse.copy(xrCam.projectionMatrixInverse);
      cam.matrixWorld.copy(xrCam.matrixWorld);
      cam.matrixWorldInverse.copy(xrCam.matrixWorldInverse);
      cam.matrixAutoUpdate = false;
      cam.matrixWorldAutoUpdate = false;
      const xrTarget = renderer.getRenderTarget();
      const xrEnabled = renderer.xr.enabled;
      renderer.xr.enabled = false;
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      if (scene) renderer.render(scene, cam);
      const px = new Uint8Array(w * h * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
      renderer.setRenderTarget(xrTarget);
      renderer.xr.enabled = xrEnabled;
      rt.dispose();
      // Premultiplied "over": the 3D layer is linear, the camera image is already sRGB.
      const out = bg.data;
      const row = w * 4;
      for (let y = 0; y < h; y++) {
        const src = (h - 1 - y) * row;
        const dst = y * row;
        for (let x = 0; x < row; x += 4) {
          const a = px[src + x + 3] / 255;
          if (a <= 0 && px[src + x] === 0 && px[src + x + 1] === 0 && px[src + x + 2] === 0) continue;
          for (let c = 0; c < 3; c++) {
            out[dst + x + c] = Math.min(255, SRGB_LUT[px[src + x + c]] + out[dst + x + c] * (1 - a));
          }
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.putImageData(bg, 0, 0);
      canvas.toBlob((b) => waiters.forEach((resolve) => resolve(b)), 'image/jpeg', 0.9);
    } catch {
      waiters.forEach((resolve) => resolve(null));
    }
  }

  setBoothAnchor(pose: BoothPose) {
    if (this.features.includes('anchors')) this.anchorRequest = { position: pose.position.clone(), yaw: pose.yaw, scale: 1 };
  }

  setMarkerScanning(on: boolean) {
    this.scanning = on;
  }

  async screenshot(): Promise<Blob | null> {
    if (!this.features.includes('camera-access') || !this.session) return null;
    return new Promise((resolve) => {
      this.captureWaiters.push(resolve);
      window.setTimeout(() => resolve(null), 3000);
    });
  }

  stop() {
    this.ended = true;
    this.renderer?.setAnimationLoop(null);
    this.anchor?.delete();
    this.anchor = null;
    this.hitSource?.cancel();
    this.hitSource = null;
    void this.session?.end().catch(() => {});
    this.session = null;
    this.reader.dispose();
    if (this.renderer) this.renderer.domElement.style.visibility = '';
    this.renderer?.dispose();
    this.renderer = null;
  }

  /** Light estimation is active (world should drop its default lights). */
  get estimatingLight() {
    return this.lightActive;
  }
}
