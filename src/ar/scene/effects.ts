// Holographic effects for the ad sequences and missions. All in booth space (metres).

import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { LockOnTargetState, SurveyGrid, TargetKind } from '../core/missions.ts';
import { LIME } from './drone';


function fadeMaterial(color: Color | string, opacity: number) {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });
}

// ── Blob shadow ─────────────────────────────────────────────────────────────────────

export class BlobShadow {
  readonly mesh: Mesh;

  constructor(size: number) {
    const s = 128;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    const tex = new CanvasTexture(c);
    this.mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.renderOrder = -1;
  }

  update(x: number, z: number, altitude: number, visible: boolean) {
    this.mesh.visible = visible;
    this.mesh.position.set(x, 0.003, z);
    const k = 1 + altitude * 0.35;
    this.mesh.scale.set(k, k, 1);
    (this.mesh.material as MeshBasicMaterial).opacity = Math.max(0.15, 1 - altitude * 0.3);
  }
}

// ── Scan sweep over the standee ─────────────────────────────────────────────────────

export class ScanSweep {
  readonly mesh: Mesh;
  private readonly mat: ShaderMaterial;
  private t = -1;

  constructor(width: number, height: number) {
    this.mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0 },
        uColor: { value: LIME.clone() },
        uAspect: { value: width / height },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uTime, uAlpha, uAspect;
        uniform vec3 uColor;
        void main() {
          float line = 1.0 - fract(uTime * 0.6);
          float d = abs(vUv.y - line);
          float sweep = smoothstep(0.035, 0.0, d) + smoothstep(0.25, 0.0, vUv.y - line) * step(line, vUv.y) * 0.12;
          vec2 e = min(vUv, 1.0 - vUv) * vec2(uAspect, 1.0);
          float edge = min(e.x, e.y);
          float corner = step(edge, 0.012) * step(max(min(vUv.x, 1.0 - vUv.x) * uAspect, min(vUv.y, 1.0 - vUv.y)), 0.12);
          float grid = step(0.985, fract(vUv.x * 12.0)) + step(0.985, fract(vUv.y * 12.0 / uAspect));
          float a = (sweep + corner * 1.2 + grid * 0.05) * uAlpha;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
    });
    this.mesh = new Mesh(new PlaneGeometry(width, height), this.mat);
    this.mesh.visible = false;
  }

  play() {
    this.t = 0;
    this.mesh.visible = true;
  }

  update(dt: number) {
    if (this.t < 0) return;
    this.t += dt;
    this.mat.uniforms.uTime.value = this.t;
    const a = Math.min(1, this.t * 3) * Math.min(1, Math.max(0, (4.2 - this.t) * 2));
    this.mat.uniforms.uAlpha.value = a;
    if (this.t > 4.2) {
      this.t = -1;
      this.mesh.visible = false;
    }
  }
}

// ── Pulse ring (landing pad / handover marker) ──────────────────────────────────────

export class PulseRing {
  readonly group = new Group();
  private readonly rings: Mesh[] = [];
  private t = 0;
  active = false;

  constructor(radius: number) {
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new RingGeometry(radius * 0.96, radius, 64), fadeMaterial(LIME, 0));
      ring.rotation.x = -Math.PI / 2;
      this.rings.push(ring);
      this.group.add(ring);
    }
    const dot = new Mesh(new RingGeometry(radius * 0.15, radius * 0.19, 32), fadeMaterial(LIME, 0.6));
    dot.rotation.x = -Math.PI / 2;
    this.group.add(dot);
    this.group.position.y = 0.004;
    this.group.visible = false;
  }

  show(on: boolean) {
    this.active = on;
    this.group.visible = on;
  }

  update(dt: number) {
    if (!this.active) return;
    this.t += dt;
    this.rings.forEach((r, i) => {
      const p = (this.t * 0.6 + i / 3) % 1;
      r.scale.setScalar(0.3 + p * 0.9);
      (r.material as MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });
  }
}

// ── Materialise ring (travels up the drone while it "prints") ───────────────────────

export class MaterializeRing {
  readonly mesh: Mesh;

  constructor(radius: number) {
    this.mesh = new Mesh(new RingGeometry(radius * 0.92, radius, 64), fadeMaterial(LIME, 0.9));
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.visible = false;
  }
}

// ── Gimbal cone + sensor footprint ──────────────────────────────────────────────────

export class SensorCone {
  readonly group = new Group();
  private readonly cone: Mesh;
  private readonly ring: Mesh;
  private readonly fill: Mesh;
  private opacity = 0;
  private target = 0;

  constructor(color: Color = LIME) {
    const geo = new ConeGeometry(1, 1, 40, 1, true);
    geo.translate(0, -0.5, 0); // apex at origin, base at y = -1
    this.cone = new Mesh(geo, fadeMaterial(color, 0));
    this.ring = new Mesh(new RingGeometry(0.94, 1, 64), fadeMaterial(color, 0));
    this.ring.rotation.x = -Math.PI / 2;
    this.fill = new Mesh(new RingGeometry(0, 0.94, 64), fadeMaterial(color, 0));
    this.fill.rotation.x = -Math.PI / 2;
    this.group.add(this.cone, this.ring, this.fill);
    this.group.visible = false;
  }

  show(on: boolean) {
    this.target = on ? 1 : 0;
    if (on) this.group.visible = true;
  }

  /** apex: gimbal position; (fx, fz, r): footprint on the floor. */
  update(dt: number, apex: Vector3, fx: number, fz: number, r: number, valid: boolean) {
    this.opacity += (this.target - this.opacity) * Math.min(1, dt * 6);
    if (this.opacity < 0.01 && this.target === 0) {
      this.group.visible = false;
      return;
    }
    const base = new Vector3(fx, 0.005, fz);
    const dir = base.clone().sub(apex);
    const h = dir.length();
    this.cone.position.copy(apex);
    this.cone.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), dir.normalize());
    this.cone.scale.set(r, h, r);
    this.ring.position.set(fx, 0.006, fz);
    this.ring.scale.setScalar(r);
    this.fill.position.set(fx, 0.005, fz);
    this.fill.scale.setScalar(r);
    const k = valid ? 1 : 0.35;
    (this.cone.material as MeshBasicMaterial).opacity = 0.09 * this.opacity * k;
    (this.ring.material as MeshBasicMaterial).opacity = 0.8 * this.opacity * k;
    (this.fill.material as MeshBasicMaterial).opacity = 0.06 * this.opacity * k;
  }
}

// ── Holographic ground targets (Sentinel) ───────────────────────────────────────────

function silhouette(kind: TargetKind): BufferGeometry {
  switch (kind) {
    case 'vehicle': {
      const g = new BoxGeometry(0.42, 0.16, 0.22);
      g.translate(0, 0.08, 0);
      return g;
    }
    case 'radar': {
      const g = new CylinderGeometry(0.12, 0.16, 0.24, 8);
      g.translate(0, 0.12, 0);
      return g;
    }
    case 'person':
    default: {
      const g = new CylinderGeometry(0.05, 0.06, 0.34, 8);
      g.translate(0, 0.17, 0);
      return g;
    }
  }
}

class ProgressArc {
  readonly mesh: Mesh;
  private readonly mat: ShaderMaterial;

  constructor(radius: number) {
    this.mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: { uProgress: { value: 0 }, uColor: { value: LIME.clone() }, uAlpha: { value: 1 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uProgress, uAlpha;
        uniform vec3 uColor;
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          float band = smoothstep(0.80, 0.84, r) * smoothstep(1.0, 0.96, r);
          float ang = fract(atan(p.x, p.y) / 6.2831853 + 1.0);
          float on = step(ang, uProgress);
          float a = band * (0.18 + on * 0.82) * uAlpha;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
    });
    this.mesh = new Mesh(new PlaneGeometry(radius * 2, radius * 2), this.mat);
    this.mesh.rotation.x = -Math.PI / 2;
  }

  set progress(v: number) {
    this.mat.uniforms.uProgress.value = v;
  }

  set alpha(v: number) {
    this.mat.uniforms.uAlpha.value = v;
  }
}

class GroundTarget {
  readonly group = new Group();
  readonly labelAnchor = new Object3D();
  private readonly arc: ProgressArc;
  private readonly body: LineSegments;
  private readonly bracket: LineSegments;
  private readonly lineMat: LineBasicMaterial;
  private readonly bracketMat: LineBasicMaterial;
  private t = Math.random() * 3;
  appear = 0;
  appearTarget = 0;

  constructor(readonly def: { id: string; kind: TargetKind; x: number; z: number }) {
    this.group.position.set(def.x, 0, def.z);
    this.lineMat = new LineBasicMaterial({ color: '#ff8a5b', transparent: true, opacity: 0.8, depthWrite: false });
    this.body = new LineSegments(new EdgesGeometry(silhouette(def.kind)), this.lineMat);
    this.arc = new ProgressArc(0.32);
    this.arc.mesh.position.y = 0.006;

    // Corner brackets around the target, shown once it is acquired.
    const s = 0.3;
    const h = 0.42;
    const c = 0.08;
    const pts: number[] = [];
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      for (const y of [0.01, h]) {
        const x = sx * s;
        const z = sz * s;
        const dy = y < 0.1 ? c : -c;
        pts.push(x, y, z, x - sx * c, y, z);
        pts.push(x, y, z, x, y, z - sz * c);
        pts.push(x, y, z, x, y + dy, z);
      }
    }
    const bg = new BufferGeometry();
    bg.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
    this.bracketMat = new LineBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false });
    this.bracket = new LineSegments(bg, this.bracketMat);

    this.labelAnchor.position.set(0, h + 0.05, 0);
    this.group.add(this.body, this.arc.mesh, this.bracket, this.labelAnchor);
    this.group.visible = false;
  }

  update(dt: number, state: Pick<LockOnTargetState, 'progress' | 'locked' | 'inView'> | null) {
    this.t += dt;
    this.appear += (this.appearTarget - this.appear) * Math.min(1, dt * 4);
    this.group.visible = this.appear > 0.01;
    if (!this.group.visible) return;
    const locked = state?.locked ?? false;
    const progress = state?.progress ?? 0;
    this.group.scale.setScalar(0.6 + 0.4 * this.appear);
    this.body.rotation.y = this.def.kind === 'radar' ? this.t * 1.5 : 0;
    this.lineMat.color.set(locked ? '#b8e043' : '#ff8a5b');
    this.lineMat.opacity = (0.55 + 0.35 * Math.sin(this.t * 4)) * this.appear;
    this.arc.progress = locked ? 1 : progress;
    this.arc.alpha = this.appear;
    const bracketOn = locked || (state?.inView ?? false) || progress > 0;
    this.bracketMat.opacity += ((bracketOn ? 1 : 0) * this.appear - this.bracketMat.opacity) * Math.min(1, dt * 8);
  }
}

export class GroundTargets {
  readonly group = new Group();
  readonly items: GroundTarget[];

  /** Moves one target (e.g. the Explore demo target in front of the drone). */
  place(i: number, x: number, z: number) {
    this.items[i]?.group.position.set(x, 0, z);
  }

  constructor(defs: { id: string; kind: TargetKind; x: number; z: number }[]) {
    this.items = defs.map((d) => new GroundTarget(d));
    this.items.forEach((t) => this.group.add(t.group));
  }

  show(on: boolean) {
    this.items.forEach((t) => (t.appearTarget = on ? 1 : 0));
  }

  update(dt: number, states: LockOnTargetState[] | null) {
    this.items.forEach((t, i) => t.update(dt, states?.[i] ?? null));
  }
}

// ── Survey tiles (Ranger) ───────────────────────────────────────────────────────────

const SURVEY_PALETTE = ['#2f7d32', '#5c9e2e', '#8fbf3a', '#c7d94a', '#e6c84c', '#b8e043'].map((c) => new Color(c));

export class SurveyTiles {
  readonly group = new Group();
  private readonly tiles: InstancedMesh;
  private readonly pop: Float32Array;
  private readonly outline: LineSegments;
  private readonly dummy = new Object3D();

  constructor(private readonly grid: SurveyGrid) {
    const { region } = grid;
    const w = (region.maxX - region.minX) / grid.cols;
    const d = (region.maxZ - region.minZ) / grid.rows;
    const geo = new PlaneGeometry(w * 0.92, d * 0.92);
    geo.rotateX(-Math.PI / 2);
    this.tiles = new InstancedMesh(
      geo,
      new MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false }),
      grid.total,
    );
    this.pop = new Float32Array(grid.total);
    for (let i = 0; i < grid.total; i++) {
      const [cx, cz] = grid.cellCenter(i);
      this.dummy.position.set(cx, 0.004, cz);
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.tiles.setMatrixAt(i, this.dummy.matrix);
      // Deterministic "multispectral" colour per cell.
      const n = Math.abs(Math.sin(cx * 3.1 + cz * 5.7) + Math.sin(cx * 7.3 - cz * 2.9)) / 2;
      this.tiles.setColorAt(i, SURVEY_PALETTE[Math.min(SURVEY_PALETTE.length - 1, Math.floor(n * SURVEY_PALETTE.length))]);
    }
    this.tiles.instanceMatrix.needsUpdate = true;

    // Zone outline + cell grid.
    const pts: number[] = [];
    for (let c = 0; c <= grid.cols; c++) {
      const x = region.minX + c * w;
      pts.push(x, 0.003, region.minZ, x, 0.003, region.maxZ);
    }
    for (let r = 0; r <= grid.rows; r++) {
      const z = region.minZ + r * d;
      pts.push(region.minX, 0.003, z, region.maxX, 0.003, z);
    }
    const lg = new BufferGeometry();
    lg.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
    this.outline = new LineSegments(lg, new LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.25, depthWrite: false }));
    this.group.add(this.outline, this.tiles);
    this.group.visible = false;
  }

  show(on: boolean) {
    this.group.visible = on;
  }

  reset() {
    this.pop.fill(0);
    for (let i = 0; i < this.grid.total; i++) this.setScale(i, 0);
    this.tiles.instanceMatrix.needsUpdate = true;
  }

  private setScale(i: number, s: number) {
    const [cx, cz] = this.grid.cellCenter(i);
    this.dummy.position.set(cx, 0.004, cz);
    this.dummy.scale.setScalar(s);
    this.dummy.updateMatrix();
    this.tiles.setMatrixAt(i, this.dummy.matrix);
  }

  update(dt: number) {
    if (!this.group.visible) return;
    let dirty = false;
    for (let i = 0; i < this.grid.total; i++) {
      if (!this.grid.covered[i] || this.pop[i] >= 1) continue;
      this.pop[i] = Math.min(1, this.pop[i] + dt * 4);
      const p = this.pop[i];
      this.setScale(i, p < 0.7 ? (p / 0.7) * 1.15 : 1.15 - ((p - 0.7) / 0.3) * 0.15);
      dirty = true;
    }
    if (dirty) this.tiles.instanceMatrix.needsUpdate = true;
  }
}

// ── Terrain digital twin (Ranger) ───────────────────────────────────────────────────

function terrainHeight(x: number, z: number) {
  return (
    0.16 * Math.sin(x * 1.7 + 0.4) * Math.cos(z * 1.3) +
    0.1 * Math.sin(x * 3.9 - z * 2.2) +
    0.05 * Math.cos(x * 7.1 + z * 5.3) +
    0.12 * Math.exp(-((x - 0.6) ** 2 + (z - 2.1) ** 2) * 2.5)
  );
}

export class TerrainTwin {
  readonly group = new Group();
  private readonly mesh: Mesh;
  private readonly wire: LineSegments;
  private rise = 0;
  private target = 0;

  constructor(region: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    const w = region.maxX - region.minX;
    const d = region.maxZ - region.minZ;
    const geo = new PlaneGeometry(w, d, 60, 40);
    geo.rotateX(-Math.PI / 2);
    geo.translate(region.minX + w / 2, 0, region.minZ + d / 2);
    const pos = geo.attributes.position as BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const low = new Color('#264d2a');
    const mid = new Color('#7a8f4a');
    const high = new Color('#d9d2b0');
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const hgt = Math.max(0, terrainHeight(pos.getX(i), pos.getZ(i)) + 0.12);
      pos.setY(i, hgt);
      const t = Math.min(1, hgt / 0.42);
      if (t < 0.5) c.lerpColors(low, mid, t * 2);
      else c.lerpColors(mid, high, (t - 0.5) * 2);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    this.mesh = new Mesh(
      geo,
      new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, transparent: true, opacity: 0 }),
    );
    this.wire = new LineSegments(
      new EdgesGeometry(geo, 25),
      new LineBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.group.add(this.mesh, this.wire);
    this.group.visible = false;
  }

  show(on: boolean) {
    this.target = on ? 1 : 0;
    if (on) this.group.visible = true;
  }

  update(dt: number) {
    this.rise += (this.target - this.rise) * Math.min(1, dt * 1.6);
    if (this.rise < 0.005 && this.target === 0) {
      this.group.visible = false;
      return;
    }
    this.group.scale.set(1, Math.max(0.001, this.rise), 1);
    (this.mesh.material as MeshStandardMaterial).opacity = Math.min(0.95, this.rise * 1.2);
    (this.wire.material as LineBasicMaterial).opacity = 0.35 * this.rise;
  }
}

// ── Climb streaks (Sentinel "thin air") ─────────────────────────────────────────────

export class ClimbStreaks {
  readonly lines: LineSegments;
  private readonly seeds: Float32Array;
  private readonly count = 70;
  private strength = 0;
  private target = 0;

  constructor() {
    const pos = new Float32Array(this.count * 6);
    this.seeds = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 1.4;
      this.seeds.set([Math.cos(a) * r, Math.random() * 3, Math.sin(a) * r], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    this.lines = new LineSegments(
      g,
      new LineBasicMaterial({ color: '#cfe0a0', transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
    );
    this.lines.frustumCulled = false;
    this.lines.visible = false;
  }

  show(on: boolean) {
    this.target = on ? 1 : 0;
    if (on) this.lines.visible = true;
  }

  update(dt: number, centre: Vector3) {
    this.strength += (this.target - this.strength) * Math.min(1, dt * 3);
    if (this.strength < 0.01 && this.target === 0) {
      this.lines.visible = false;
      return;
    }
    const attr = this.lines.geometry.attributes.position as BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      let y = this.seeds[i * 3 + 1] - dt * 3.2;
      if (y < -1.5) y += 3;
      this.seeds[i * 3 + 1] = y;
      const x = centre.x + this.seeds[i * 3];
      const z = centre.z + this.seeds[i * 3 + 2];
      const yy = centre.y + y;
      arr.set([x, yy, z, x, yy + 0.1, z], i * 6);
    }
    attr.needsUpdate = true;
    (this.lines.material as LineBasicMaterial).opacity = 0.22 * this.strength;
  }
}

// ── Visual-inertial feature points (GPS-denied beat) ────────────────────────────────

export class FeaturePoints {
  readonly points: Points;
  private readonly base: Float32Array;
  private strength = 0;
  private target = 0;
  private t = 0;

  /** `standee` null (floor mode, no standee): scatter points on the floor only. */
  constructor(standee: { size: [number, number]; centreY: number } | null) {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      if (standee && i < n * 0.35) {
        pos.set(
          [(Math.random() - 0.5) * standee.size[0], standee.centreY + (Math.random() - 0.5) * standee.size[1], 0.02],
          i * 3,
        );
      } else {
        pos.set([(Math.random() - 0.5) * 5, 0.005, Math.random() * 4], i * 3);
      }
    }
    this.base = new Float32Array(n * 3).fill(1);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('color', new BufferAttribute(new Float32Array(n * 3), 3));
    this.points = new Points(
      g,
      new PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending }),
    );
    this.points.visible = false;
  }

  show(on: boolean) {
    this.target = on ? 1 : 0;
    if (on) this.points.visible = true;
  }

  update(dt: number) {
    this.strength += (this.target - this.strength) * Math.min(1, dt * 4);
    if (this.strength < 0.01 && this.target === 0) {
      this.points.visible = false;
      return;
    }
    this.t += dt;
    const col = this.points.geometry.attributes.color as BufferAttribute;
    const arr = col.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      if (Math.random() < dt * 3) this.base[i] = Math.random();
      const v = this.base[i] * this.strength;
      arr[i * 3] = LIME.r * v;
      arr[i * 3 + 1] = LIME.g * v;
      arr[i * 3 + 2] = LIME.b * v;
    }
    col.needsUpdate = true;
  }
}

// ── Placement reticle (floor mode) ──────────────────────────────────────────────────

export class Reticle {
  readonly group = new Group();
  private t = 0;

  constructor() {
    const ring = new Mesh(new RingGeometry(0.26, 0.3, 64), fadeMaterial(LIME, 0.9));
    ring.rotation.x = -Math.PI / 2;
    const inner = new Mesh(new RingGeometry(0.03, 0.05, 32), fadeMaterial(LIME, 0.9));
    inner.rotation.x = -Math.PI / 2;
    const arrow = new Mesh(new ConeGeometry(0.05, 0.1, 3), fadeMaterial(LIME, 0.8));
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 0.002, 0.38);
    const orb = new Mesh(new SphereGeometry(0.01, 8, 8), fadeMaterial(LIME, 0.8));
    this.group.add(ring, inner, arrow, orb);
    this.group.visible = false;
  }

  update(dt: number) {
    this.t += dt;
    this.group.children[0].scale.setScalar(1 + Math.sin(this.t * 4) * 0.04);
  }
}


// ── Tether (Ranger tethered variant) ───────────────────────────────────────────────────

export class Tether {
  readonly group = new Group();
  private readonly line: LineSegments;
  private readonly base: Mesh;
  private opacity = 0;
  private target = 0;

  constructor() {
    const g = new BufferGeometry();
    const segments = 24;
    g.setAttribute('position', new BufferAttribute(new Float32Array(segments * 2 * 3), 3));
    this.line = new LineSegments(g, new LineBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false }));
    this.line.frustumCulled = false;
    this.base = new Mesh(
      new BoxGeometry(0.34, 0.16, 0.24),
      new MeshStandardMaterial({ color: '#2b323b', roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0 }),
    );
    this.group.add(this.line, this.base);
    this.group.visible = false;
  }

  show(on: boolean) {
    this.target = on ? 1 : 0;
    if (on) this.group.visible = true;
  }

  /** Immediate hide (update() stops being called when its demo ends, so no fade-out). */
  hide() {
    this.target = 0;
    this.opacity = 0;
    this.group.visible = false;
  }

  /** from: drone underside; groundX/Z: ground station position (booth space). */
  update(dt: number, from: Vector3, groundX: number, groundZ: number) {
    this.opacity += (this.target - this.opacity) * Math.min(1, dt * 4);
    if (this.opacity < 0.01 && this.target === 0) {
      this.group.visible = false;
      return;
    }
    this.base.position.set(groundX, 0.08, groundZ);
    const attr = this.line.geometry.attributes.position as BufferAttribute;
    const arr = attr.array as Float32Array;
    const n = arr.length / 6;
    // Point on the cable at t, with a slight catenary sag toward the ground station.
    const put = (t: number, o: number) => {
      arr[o] = from.x + (groundX - from.x) * t;
      arr[o + 1] = from.y + (0.16 - from.y) * t - Math.sin(Math.PI * t) * 0.12;
      arr[o + 2] = from.z + (groundZ - from.z) * t;
    };
    for (let i = 0; i < n; i++) {
      put(i / n, i * 6);
      put((i + 1) / n, i * 6 + 3);
    }
    attr.needsUpdate = true;
    (this.line.material as LineBasicMaterial).opacity = 0.9 * this.opacity;
    (this.base.material as MeshStandardMaterial).opacity = this.opacity;
  }
}
