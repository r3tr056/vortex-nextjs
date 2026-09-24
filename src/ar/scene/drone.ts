// Drone rig: loads the processed GLB when available, otherwise builds a procedural stand-in
// with the same proportions. Hierarchy:
//
//   root (feet on the floor, yaw)  →  tilt (pivot at body centre; pitch/roll)  →  model
//
// Propellers are separate PropRig objects attached at `prop_N` anchor nodes so they can spin.
// Meshy exports are a single fused mesh; scripts/process-drone-model.mjs cuts the blades out
// and writes those anchors.

import {
  AdditiveBlending,
  Box3,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Plane,
  Shape,
  ExtrudeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { DroneModel, DroneSlug } from '../config/drones';

export const LIME = new Color('#b8e043');

let discTexture: CanvasTexture | null = null;
function propDiscTexture() {
  if (discTexture) return discTexture;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s / 2, s / 2, s * 0.08, s / 2, s / 2, s / 2);
  grad.addColorStop(0, 'rgba(210,220,230,0.0)');
  grad.addColorStop(0.35, 'rgba(210,220,230,0.10)');
  grad.addColorStop(0.9, 'rgba(210,220,230,0.22)');
  grad.addColorStop(1, 'rgba(210,220,230,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  discTexture = new CanvasTexture(c);
  discTexture.colorSpace = SRGBColorSpace;
  return discTexture;
}

/** Tapered two-blade planform, lying in the XZ plane, centred on the hub. */
function bladeGeometry(diameter: number) {
  const r = diameter / 2;
  const shape = new Shape();
  const w = r * 0.08;
  // Lens outline: widest at the hub, tapering to both tips.
  shape.moveTo(-r, 0);
  shape.quadraticCurveTo(-r * 0.5, w * 1.3, 0, w);
  shape.quadraticCurveTo(r * 0.5, w * 1.3, r, 0);
  shape.quadraticCurveTo(r * 0.5, -w * 1.3, 0, -w);
  shape.quadraticCurveTo(-r * 0.5, -w * 1.3, -r, 0);
  const geo = new ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: false, curveSegments: 10 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

class PropRig {
  readonly group = new Group();
  private readonly blades = new Group();
  private readonly disc: Mesh;
  private angle = Math.random() * Math.PI;

  constructor(diameter: number, private readonly dir: 1 | -1, bladeMaterial: Material) {
    const len = diameter;
    const b1 = new Mesh(bladeGeometry(len), bladeMaterial);
    this.blades.add(b1);
    const hub = new Mesh(new CylinderGeometry(len * 0.05, len * 0.05, len * 0.04, 12), bladeMaterial);
    this.blades.add(hub);
    this.disc = new Mesh(
      new CircleGeometry(len / 2, 40),
      new MeshBasicMaterial({
        map: propDiscTexture(),
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        opacity: 0,
      }),
    );
    this.disc.rotation.x = -Math.PI / 2;
    this.disc.userData.noExport = true;
    this.group.add(this.blades, this.disc);
  }

  update(dt: number, rpm: number) {
    // rpm is 0..1. Blades are visible when slow; the blur disc takes over when fast.
    this.angle += dt * this.dir * (4 + rpm * 70);
    this.blades.rotation.y = this.angle;
    this.blades.visible = rpm < 0.55;
    (this.disc.material as MeshBasicMaterial).opacity = Math.min(1, Math.max(0, (rpm - 0.3) * 2.2));
  }
}

export interface DroneRigOptions {
  slug: DroneSlug;
  model: DroneModel;
  onProgress?: (p: number) => void;
}

export class DroneRig {
  readonly root = new Group();
  readonly tilt = new Group();
  readonly model = new Group();
  readonly gimbal = new Object3D();
  readonly materials: Material[] = [];
  private props: PropRig[] = [];
  /** Height of the body centre above the feet, metres. */
  pivotHeight = 0.2;
  /** Overall height of the rig, metres. */
  height = 0.4;
  rpm = 0;

  private constructor() {
    this.root.add(this.tilt);
    this.tilt.add(this.model);
    this.root.name = 'drone';
  }

  static async create(opts: DroneRigOptions): Promise<DroneRig> {
    const rig = new DroneRig();
    let loaded = false;
    if (opts.model.ready) {
      try {
        await rig.loadGlb(opts.model, opts.onProgress);
        loaded = true;
      } catch (err) {
        console.warn('[ar] drone model failed to load, using stand-in', err);
      }
    }
    if (!loaded) rig.buildStandIn(opts.slug, opts.model);
    rig.finalize();
    opts.onProgress?.(1);
    return rig;
  }

  private async loadGlb(cfg: DroneModel, onProgress?: (p: number) => void) {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(cfg.url, (e) => {
      if (e.total) onProgress?.(Math.min(0.99, e.loaded / e.total));
    });
    const scene = gltf.scene;
    scene.rotation.y = cfg.yawOffset;
    scene.updateMatrixWorld(true);

    const anchors: Object3D[] = [];
    scene.traverse((o) => {
      if (/^prop_\d+$/.test(o.name)) anchors.push(o);
    });

    // Scale to real size: motor diagonal from prop anchors, else from the bounding box.
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    let s: number;
    if (anchors.length >= 2) {
      let maxD = 0;
      const a = new Vector3();
      const b = new Vector3();
      for (const p of anchors) {
        for (const q of anchors) {
          p.getWorldPosition(a);
          q.getWorldPosition(b);
          maxD = Math.max(maxD, a.distanceTo(b));
        }
      }
      s = cfg.diagonalM / maxD;
    } else {
      s = (cfg.diagonalM + cfg.propDiameterM) / Math.hypot(size.x, size.z);
    }
    scene.scale.multiplyScalar(s);
    scene.updateMatrixWorld(true);
    // Box3.setFromObject measures in world space, and `scene` has no parent yet, so world space
    // is the scaled model's own space: the centring below is consistent with it.
    const scaled = new Box3().setFromObject(scene);
    const centre = scaled.getCenter(new Vector3());
    scene.position.x -= centre.x;
    scene.position.z -= centre.z;
    scene.position.y -= scaled.min.y;
    this.model.add(scene);
    this.height = scaled.max.y - scaled.min.y;
    this.pivotHeight = this.height * 0.55;

    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        this.materials.push(...mats);
      }
    });

    const bladeMat = new MeshStandardMaterial({ color: '#8d959e', roughness: 0.4, metalness: 0.2 });
    anchors.forEach((a, i) => {
      // The processing script stores the blade radius (metres) and spin direction per hub.
      const radius = typeof a.userData.radius === 'number' ? a.userData.radius : cfg.propDiameterM / 2;
      const spin: 1 | -1 = a.userData.spin === -1 ? -1 : a.userData.spin === 1 ? 1 : i % 2 === 0 ? 1 : -1;
      const prop = new PropRig((radius * 2) / s, spin, bladeMat);
      a.add(prop.group);
      this.props.push(prop);
    });
    this.materials.push(bladeMat);

    this.gimbal.position.set(...cfg.gimbal);
    this.model.add(this.gimbal);
  }

  /** Procedural quad in the style of the Vortex renders; replaced by the Meshy GLB later. */
  private buildStandIn(slug: DroneSlug, cfg: DroneModel) {
    const D = cfg.diagonalM;
    const P = cfg.propDiameterM;
    const shell = new MeshStandardMaterial({ color: '#2b323b', roughness: 0.55, metalness: 0.35 });
    const shellDark = new MeshStandardMaterial({ color: '#1c2128', roughness: 0.6, metalness: 0.3 });
    const carbon = new MeshStandardMaterial({ color: '#121417', roughness: 0.32, metalness: 0.5 });
    const motorMat = new MeshStandardMaterial({ color: '#3a3f46', roughness: 0.35, metalness: 0.8 });
    const copper = new MeshStandardMaterial({ color: '#b0643a', roughness: 0.4, metalness: 0.7 });
    const blade = new MeshStandardMaterial({ color: '#8d959e', roughness: 0.4, metalness: 0.2 });
    const lens = new MeshStandardMaterial({ color: '#05070a', roughness: 0.08, metalness: 0.9 });
    const led = new MeshBasicMaterial({ color: LIME });
    this.materials.push(shell, shellDark, carbon, motorMat, copper, blade, lens, led);

    const gearH = D * 0.2;
    const bodyH = D * 0.12;
    const bodyW = D * 0.24;
    const bodyL = D * 0.32;
    const bodyY = gearH + bodyH / 2;

    const body = new Mesh(new BoxGeometry(bodyW, bodyH, bodyL), shell);
    body.position.y = bodyY;
    const lid = new Mesh(new BoxGeometry(bodyW * 0.86, bodyH * 0.35, bodyL * 0.78), shellDark);
    lid.position.set(0, bodyY + bodyH * 0.6, -bodyL * 0.04);
    const nose = new Mesh(new BoxGeometry(bodyW * 0.7, bodyH * 0.7, bodyL * 0.18), shellDark);
    nose.position.set(0, bodyY - bodyH * 0.05, bodyL * 0.55);
    const strip = new Mesh(new BoxGeometry(bodyW * 0.5, bodyH * 0.06, 0.004), led);
    strip.position.set(0, bodyY + bodyH * 0.15, bodyL * 0.645);
    this.model.add(body, lid, nose, strip);

    // Arms + motors + prop anchors (X configuration).
    const armY = bodyY + bodyH * 0.2;
    const armLen = D / 2;
    for (let i = 0; i < 4; i++) {
      const ang = Math.PI / 4 + (i * Math.PI) / 2;
      const dx = Math.sin(ang);
      const dz = Math.cos(ang);
      const arm = new Mesh(new CylinderGeometry(D * 0.013, D * 0.013, armLen, 10), carbon);
      arm.position.set((dx * armLen) / 2, armY, (dz * armLen) / 2);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = ang - Math.PI / 2;
      const motor = new Mesh(new CylinderGeometry(D * 0.034, D * 0.03, D * 0.045, 16), motorMat);
      motor.position.set(dx * armLen, armY + D * 0.02, dz * armLen);
      const coil = new Mesh(new CylinderGeometry(D * 0.036, D * 0.036, D * 0.012, 16), copper);
      coil.position.set(dx * armLen, armY + D * 0.004, dz * armLen);
      this.model.add(arm, motor, coil);

      const anchor = new Object3D();
      anchor.name = `prop_${i}`;
      anchor.position.set(dx * armLen, armY + D * 0.05, dz * armLen);
      const prop = new PropRig(P, i % 2 === 0 ? 1 : -1, blade);
      anchor.add(prop.group);
      this.props.push(prop);
      this.model.add(anchor);
    }

    // Landing gear: two skids + four struts.
    const skidLen = D * 0.36;
    for (const side of [-1, 1]) {
      const skid = new Mesh(new CylinderGeometry(D * 0.012, D * 0.012, skidLen, 10), carbon);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(side * bodyW * 0.62, D * 0.012, 0);
      this.model.add(skid);
      for (const end of [-1, 1]) {
        const top = new Vector3(side * bodyW * 0.35, gearH, end * bodyL * 0.28);
        const bottom = new Vector3(side * bodyW * 0.62, D * 0.012, end * skidLen * 0.32);
        const len = top.distanceTo(bottom);
        const strut = new Mesh(new CylinderGeometry(D * 0.009, D * 0.009, len, 8), carbon);
        strut.position.copy(top).add(bottom).multiplyScalar(0.5);
        strut.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), top.clone().sub(bottom).normalize());
        this.model.add(strut);
      }
    }

    // Gimbal camera: small ball for Sentinel, larger payload ball for Ranger.
    const gr = slug === 'ranger' ? D * 0.07 : D * 0.045;
    const gimbalY = gearH - gr * 0.9;
    const ball = new Mesh(new SphereGeometry(gr, 24, 16), shellDark);
    ball.position.set(0, gimbalY, bodyL * 0.28);
    const glass = new Mesh(new CylinderGeometry(gr * 0.5, gr * 0.5, gr * 0.3, 20), lens);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, gimbalY - gr * 0.15, bodyL * 0.28 + gr * 0.9);
    const yoke = new Mesh(new BoxGeometry(gr * 0.5, gr * 0.9, gr * 0.5), shell);
    yoke.position.set(0, gearH - gr * 0.1, bodyL * 0.28);
    this.model.add(ball, glass, yoke);
    this.gimbal.position.set(0, gimbalY, bodyL * 0.28);
    this.model.add(this.gimbal);

    if (slug === 'sentinel') {
      for (const side of [-1, 1]) {
        const ant = new Mesh(new BoxGeometry(D * 0.012, D * 0.2, D * 0.03), shellDark);
        ant.position.set(side * bodyW * 0.3, bodyY + bodyH * 0.5 + D * 0.1, -bodyL * 0.38);
        ant.rotation.z = side * 0.25;
        this.model.add(ant);
      }
    } else {
      const gps = new Mesh(new CylinderGeometry(D * 0.035, D * 0.035, D * 0.03, 20), shellDark);
      gps.position.set(0, bodyY + bodyH * 0.9 + D * 0.04, -bodyL * 0.3);
      const mast = new Mesh(new CylinderGeometry(D * 0.006, D * 0.006, D * 0.06, 8), carbon);
      mast.position.set(0, bodyY + bodyH * 0.8, -bodyL * 0.3);
      this.model.add(gps, mast);
    }

    this.height = bodyY + bodyH;
    this.pivotHeight = bodyY;
  }

  private finalize() {
    this.tilt.position.y = this.pivotHeight;
    this.model.position.y = -this.pivotHeight;
  }

  /**
   * Installs the world-space clipping plane used by the "materialise" effect. Call once; the
   * caller then only moves the plane (changing clippingPlanes per frame recompiles shaders).
   */
  installClip(plane: Plane) {
    for (const m of this.materials) {
      m.clippingPlanes = [plane];
      m.needsUpdate = true;
    }
  }

  /** Frees GPU resources (the off-screen rig used for the Quick Look export). */
  dispose() {
    this.root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        for (const v of Object.values(mat)) if (v && typeof v === 'object' && (v as { isTexture?: boolean }).isTexture) (v as { dispose(): void }).dispose();
        mat.dispose();
      }
    });
  }

  /** Translucent hologram copy used for the "fleet" beat. */
  createGhost(): Group {
    const ghost = this.model.clone(true);
    // Translucent hologram (a wireframe of a 60k-triangle mesh reads as a solid block).
    const mat = new MeshBasicMaterial({
      color: LIME,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    ghost.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) m.material = mat;
    });
    const g = new Group();
    const tilt = new Group();
    tilt.position.y = this.pivotHeight;
    ghost.position.y = -this.pivotHeight;
    tilt.add(ghost);
    g.add(tilt);
    g.userData.material = mat;
    return g;
  }

  update(dt: number) {
    for (const p of this.props) p.update(dt, this.rpm);
  }
}
