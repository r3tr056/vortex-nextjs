// Non-AR 3D session: a virtual booth for desktops, phones without camera access, and
// development. Same world/scene code as the AR session; only the camera source differs.

import {
  Color,
  Fog,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  BoxGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  CanvasTexture,
  RepeatWrapping,
  Group,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ArSession, SessionCallbacks, SessionCapabilities } from './types';

export interface PreviewStandee {
  image: string;
  sizeM: [number, number];
}

function gridTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0b0f17';
  g.fillRect(0, 0, size, size);
  g.strokeStyle = 'rgba(162,176,196,0.16)';
  g.lineWidth = 2;
  g.strokeRect(0, 0, size, size);
  g.strokeStyle = 'rgba(162,176,196,0.06)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(size / 2, 0);
  g.lineTo(size / 2, size);
  g.moveTo(0, size / 2);
  g.lineTo(size, size / 2);
  g.stroke();
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(12, 12);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export class PreviewSession implements ArSession {
  readonly kind = 'preview' as const;
  private renderer: WebGLRenderer | null = null;
  private raf = 0;
  private controls: OrbitControls | null = null;
  private onResize: (() => void) | null = null;
  private scene: Scene | null = null;

  constructor(private readonly standee: PreviewStandee) {}

  async start(canvas: HTMLCanvasElement, cb: SessionCallbacks) {
    const renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer = renderer;

    const scene = new Scene();
    this.scene = scene;
    scene.background = new Color('#06080d');
    scene.fog = new Fog('#06080d', 7, 16);

    const camera = new PerspectiveCamera(55, 1, 0.05, 60);
    camera.position.set(0.4, 1.7, 4.8);
    scene.add(camera);

    // Virtual booth: floor + roll-up standee. The print's bottom edge sits at the floor (hidden in
    // the cassette), matching the target heights used for AR anchoring.
    const floor = new Mesh(new PlaneGeometry(24, 24), new MeshBasicMaterial({ map: gridTexture() }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    scene.add(floor);

    const [w, h] = this.standee.sizeM;
    const standee = new Group();
    const face = new Mesh(new PlaneGeometry(w, h), new MeshStandardMaterial({ color: '#10161f', roughness: 0.6 }));
    face.position.set(0, h / 2, 0.012);
    const back = new Mesh(new BoxGeometry(w + 0.02, h + 0.02, 0.02), new MeshStandardMaterial({ color: '#161d2a', roughness: 0.8 }));
    back.position.set(0, h / 2, 0);
    const base = new Mesh(new BoxGeometry(w + 0.06, 0.09, 0.22), new MeshStandardMaterial({ color: '#2a2f38', metalness: 0.6, roughness: 0.4 }));
    base.position.set(0, 0.045, 0.02);
    standee.add(back, face, base);
    scene.add(standee);
    new TextureLoader().load(this.standee.image, (tex) => {
      if (!this.renderer) return tex.dispose();
      tex.colorSpace = SRGBColorSpace;
      const art = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: tex }));
      art.position.set(0, h / 2, 0.014);
      standee.add(art);
    });

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.9, 1.2);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 1.2;
    controls.maxDistance = 9;
    controls.enablePan = false;
    controls.update();
    this.controls = controls;

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    this.onResize = resize;
    resize();
    window.addEventListener('resize', resize);

    cb.onReady({ scene, camera, renderer, canvas, metric: true });

    let last = performance.now();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      controls.update();
      cb.onFrame(dt);
      renderer.render(scene, camera);
    };
    loop();
  }

  capabilities(): SessionCapabilities {
    return { depthOcclusion: false, lightEstimation: false, anchors: false, markerTracking: false, imageTargets: false, photo: true };
  }

  /** Lets the world steer the orbit target (e.g. to follow the drone). */
  setOrbitTarget(v: Vector3, k: number) {
    this.controls?.target.lerp(v, k);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
    this.controls?.dispose();
    this.scene?.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        (mat as MeshBasicMaterial).map?.dispose();
        mat.dispose();
      }
    });
    this.scene = null;
    this.renderer?.dispose();
    this.renderer = null;
  }

  async screenshot(): Promise<Blob | null> {
    const canvas = this.renderer?.domElement;
    if (!canvas) return null;
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9));
  }
}
