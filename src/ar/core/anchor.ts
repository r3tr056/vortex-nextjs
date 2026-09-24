// Booth anchoring: converts detections of something printed on the standee (an 8th Wall image
// target, or the QR code read through WebXR) into the booth frame, and filters them so glare,
// blur or a passer-by can't make the scene jump.
//
// A planar detection is a plane in its local XY with normal +Z (out of the print), +Y up. The
// booth frame is gravity-aligned: only yaw is taken from the detection, so a leaning roll-up
// standee doesn't tilt the scene. Booth origin = floor point under the centre of the standee.

import { Quaternion, Vector3 } from 'three';

export interface ImageDetection {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  /** 8th Wall: the target's longer side in world units. */
  scale: number;
}

export interface BoothPose {
  position: Vector3;
  yaw: number;
  /** World units per metre (1 for metric WebXR/ARCore). */
  scale: number;
}

export interface PlanarPlacement {
  /** Centre of the printed region on the standee: [metres right of centre, metres above floor]. */
  centerM: [number, number];
}

const tmpQ = new Quaternion();
const tmpN = new Vector3();

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** How far (radians) a detected print's up axis leans from vertical. */
export function tiltFromVertical(rotation: { x: number; y: number; z: number; w: number }): number {
  tmpQ.set(rotation.x, rotation.y, rotation.z, rotation.w);
  tmpN.set(0, 1, 0).applyQuaternion(tmpQ);
  return Math.acos(Math.min(1, Math.max(-1, tmpN.y)));
}

export function boothPoseFromPlanar(
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number; w: number },
  worldPerMetre: number,
  placement: PlanarPlacement,
): BoothPose {
  tmpQ.set(rotation.x, rotation.y, rotation.z, rotation.w);
  tmpN.set(0, 0, 1).applyQuaternion(tmpQ);
  const yaw = Math.hypot(tmpN.x, tmpN.z) < 1e-4 ? 0 : Math.atan2(tmpN.x, tmpN.z);
  // Booth +X in world = (cos yaw, 0, -sin yaw).
  const [cx, cy] = placement.centerM;
  const k = worldPerMetre;
  return {
    position: new Vector3(
      position.x - Math.cos(yaw) * cx * k,
      position.y - cy * k,
      position.z + Math.sin(yaw) * cx * k,
    ),
    yaw,
    scale: k,
  };
}

export function boothPoseFromImage(d: ImageDetection, target: PlanarPlacement & { longSideM: number }): BoothPose {
  return boothPoseFromPlanar(d.position, d.rotation, d.scale / target.longSideM, target);
}

/** Exponential smoothing towards a new pose; `k` in (0, 1]. Mutates `current`. */
export function blendPose(current: BoothPose, next: BoothPose, k: number): BoothPose {
  current.position.lerp(next.position, k);
  current.yaw = wrapAngle(current.yaw + wrapAngle(next.yaw - current.yaw) * k);
  current.scale += (next.scale - current.scale) * k;
  return current;
}

// ── Consensus filter ──────────────────────────────────────────────────────────────────

export interface AnchorFilterOptions {
  /** Agreeing detections needed before the booth locks. */
  lockCount: number;
  /** Position agreement, metres (scaled by world units per metre). */
  posTol: number;
  /** Yaw agreement, radians. */
  yawTol: number;
  /** Detections older than this are forgotten, ms. */
  windowMs: number;
  /** Consistent disagreeing detections needed to re-lock (standee moved / tracking re-localised). */
  relockCount: number;
  /** Smoothing applied to agreeing detections after lock. */
  follow: number;
}

export const DEFAULT_FILTER: AnchorFilterOptions = {
  lockCount: 4,
  posTol: 0.18,
  yawTol: 0.26,
  windowMs: 2500,
  relockCount: 10,
  follow: 0.06,
};

interface Sample {
  pose: BoothPose;
  t: number;
}

export type FilterResult = 'pending' | 'locked' | 'updated' | 'rejected' | 'relocked';

function agrees(a: BoothPose, b: BoothPose, o: AnchorFilterOptions) {
  const tol = o.posTol * ((a.scale + b.scale) / 2);
  return (
    a.position.distanceTo(b.position) <= tol &&
    Math.abs(wrapAngle(a.yaw - b.yaw)) <= o.yawTol &&
    Math.abs(a.scale - b.scale) <= 0.25 * Math.max(a.scale, b.scale)
  );
}

function average(samples: Sample[]): BoothPose {
  const p = new Vector3();
  let sx = 0;
  let sy = 0;
  let scale = 0;
  for (const s of samples) {
    p.add(s.pose.position);
    sx += Math.cos(s.pose.yaw);
    sy += Math.sin(s.pose.yaw);
    scale += s.pose.scale;
  }
  return { position: p.divideScalar(samples.length), yaw: Math.atan2(sy, sx), scale: scale / samples.length };
}

/** Largest group of samples that agree with one member of the group (a cheap mode-seeking step). */
function bestCluster(samples: Sample[], o: AnchorFilterOptions): Sample[] {
  let best: Sample[] = [];
  for (const seed of samples) {
    const group = samples.filter((s) => agrees(seed.pose, s.pose, o));
    if (group.length > best.length) best = group;
  }
  return best;
}

export class AnchorFilter {
  locked: BoothPose | null = null;
  private pending: Sample[] = [];
  private outliers: Sample[] = [];

  constructor(private readonly o: AnchorFilterOptions = DEFAULT_FILTER) {}

  reset() {
    this.locked = null;
    this.pending = [];
    this.outliers = [];
  }

  /** Forces the next consistent cluster to replace the current lock (manual re-align). */
  unlock() {
    this.locked = null;
    this.pending = [];
    this.outliers = [];
  }

  push(pose: BoothPose, now: number): FilterResult {
    const o = this.o;
    // Own copy: callers may reuse their pose object, and a locked pose is blended in place.
    const sample = { pose: { position: pose.position.clone(), yaw: pose.yaw, scale: pose.scale }, t: now };
    if (!this.locked) {
      this.pending = this.pending.filter((s) => now - s.t <= o.windowMs);
      this.pending.push(sample);
      const cluster = bestCluster(this.pending, o);
      if (cluster.length >= o.lockCount) {
        this.locked = average(cluster);
        this.pending = [];
        return 'locked';
      }
      return 'pending';
    }
    if (agrees(this.locked, sample.pose, o)) {
      blendPose(this.locked, sample.pose, o.follow);
      this.outliers = [];
      return 'updated';
    }
    this.outliers = this.outliers.filter((s) => now - s.t <= o.windowMs * 2);
    this.outliers.push(sample);
    const cluster = bestCluster(this.outliers, o);
    if (cluster.length >= o.relockCount) {
      this.locked = average(cluster);
      this.outliers = [];
      return 'relocked';
    }
    return 'rejected';
  }
}
