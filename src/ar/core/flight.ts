// Assisted multirotor flight model (DJI "P-mode" feel), in booth space (metres, +Y up).
//
// Sticks are Mode 2: left stick = climb/descend (ly) + yaw (lx); right stick = move (rx, ry).
// The drone holds position when sticks are released. Heading convention: yaw 0 = nose along +Z;
// forward = (sin yaw, 0, cos yaw), right = (-cos yaw, 0, sin yaw).

import { Vector3 } from 'three';

export interface Sticks {
  lx: number;
  ly: number;
  rx: number;
  ry: number;
}

export interface FlightBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  maxY: number;
}

export interface FlightParams {
  maxSpeedH: number;
  maxSpeedV: number;
  maxYawRate: number;
  accelH: number;
  brakeH: number;
  accelV: number;
  maxTilt: number;
  /** Height of the body origin above the floor when resting on the landing gear. */
  groundClearance: number;
}

export const DEFAULT_FLIGHT_PARAMS: FlightParams = {
  maxSpeedH: 2.0,
  maxSpeedV: 1.1,
  maxYawRate: 1.9,
  accelH: 2.8,
  brakeH: 3.6,
  accelV: 2.6,
  maxTilt: (24 * Math.PI) / 180,
  groundClearance: 0,
};

export const DEFAULT_FLIGHT_BOUNDS: FlightBounds = {
  minX: -2.8,
  maxX: 2.8,
  minZ: -0.4,
  maxZ: 3.0,
  maxY: 3.0,
};

const DEADZONE = 0.08;

/** Deadzone + gentle expo so small stick deflections give fine control. */
export function shapeAxis(v: number): number {
  const a = Math.abs(v);
  if (a < DEADZONE) return 0;
  const n = Math.min(1, (a - DEADZONE) / (1 - DEADZONE));
  return Math.sign(v) * n * (0.35 + 0.65 * n);
}

export function headingVectors(yaw: number) {
  return {
    fx: Math.sin(yaw),
    fz: Math.cos(yaw),
    rx: -Math.cos(yaw),
    rz: Math.sin(yaw),
  };
}

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  return Math.max(current - maxDelta, target);
}

export class FlightModel {
  readonly position = new Vector3();
  readonly velocity = new Vector3();
  yaw = 0;
  yawRate = 0;
  /** Visual tilt, radians. Positive pitch = nose down; positive roll = bank right. */
  pitch = 0;
  roll = 0;
  landed = true;
  atBoundary = false;

  constructor(
    readonly params: FlightParams = DEFAULT_FLIGHT_PARAMS,
    readonly bounds: FlightBounds = DEFAULT_FLIGHT_BOUNDS,
  ) {}

  reset(x: number, y: number, z: number, yaw: number) {
    this.position.set(x, Math.max(y, this.params.groundClearance), z);
    this.velocity.set(0, 0, 0);
    this.yaw = yaw;
    this.yawRate = 0;
    this.pitch = 0;
    this.roll = 0;
    this.landed = y <= this.params.groundClearance + 1e-3;
    this.atBoundary = false;
  }

  /**
   * @param controlYaw heading that "stick forward" maps to. Pass the camera's heading for
   *   camera-relative (beginner) control, or `this.yaw` for nose-relative (pro) control.
   */
  step(dt: number, sticks: Sticks, controlYaw: number) {
    const p = this.params;
    dt = Math.min(dt, 0.05);

    const throttle = shapeAxis(sticks.ly);
    const yawIn = shapeAxis(sticks.lx);
    let mx = shapeAxis(sticks.rx);
    let my = shapeAxis(sticks.ry);
    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }

    if (this.landed && throttle > 0.15) this.landed = false;

    // Yaw (right stick right = turn right = heading decreases, see header comment).
    const targetYawRate = this.landed ? 0 : -yawIn * p.maxYawRate;
    this.yawRate = approach(this.yawRate, targetYawRate, 9 * dt);
    this.yaw += this.yawRate * dt;

    // Horizontal velocity towards the stick-commanded velocity.
    const c = headingVectors(controlYaw);
    let tx = (c.fx * my + c.rx * mx) * p.maxSpeedH;
    let tz = (c.fz * my + c.rz * mx) * p.maxSpeedH;
    if (this.landed) {
      tx = 0;
      tz = 0;
    }
    const dx = tx - this.velocity.x;
    const dz = tz - this.velocity.z;
    const dmag = Math.hypot(dx, dz);
    const accel = mag > 0 ? p.accelH : p.brakeH;
    const maxDv = accel * dt;
    if (dmag > maxDv) {
      this.velocity.x += (dx / dmag) * maxDv;
      this.velocity.z += (dz / dmag) * maxDv;
    } else {
      this.velocity.x = tx;
      this.velocity.z = tz;
    }

    // Vertical.
    const targetVy = this.landed ? 0 : throttle * p.maxSpeedV;
    this.velocity.y = approach(this.velocity.y, targetVy, p.accelV * dt);

    this.position.addScaledVector(this.velocity, dt);

    // Floor.
    if (this.position.y <= p.groundClearance) {
      this.position.y = p.groundClearance;
      if (this.velocity.y < 0) this.velocity.y = 0;
      if (throttle <= 0) {
        this.landed = true;
        this.velocity.x = 0;
        this.velocity.z = 0;
      }
    }

    // Flight volume: clamp and kill outward velocity.
    const b = this.bounds;
    this.atBoundary = false;
    if (this.position.x < b.minX) { this.position.x = b.minX; this.velocity.x = Math.max(0, this.velocity.x); this.atBoundary = true; }
    if (this.position.x > b.maxX) { this.position.x = b.maxX; this.velocity.x = Math.min(0, this.velocity.x); this.atBoundary = true; }
    if (this.position.z < b.minZ) { this.position.z = b.minZ; this.velocity.z = Math.max(0, this.velocity.z); this.atBoundary = true; }
    if (this.position.z > b.maxZ) { this.position.z = b.maxZ; this.velocity.z = Math.min(0, this.velocity.z); this.atBoundary = true; }
    if (this.position.y > b.maxY) { this.position.y = b.maxY; this.velocity.y = Math.min(0, this.velocity.y); this.atBoundary = true; }

    // Visual tilt follows body-frame velocity.
    const n = headingVectors(this.yaw);
    const vf = this.velocity.x * n.fx + this.velocity.z * n.fz;
    const vr = this.velocity.x * n.rx + this.velocity.z * n.rz;
    const k = 1 - Math.exp(-dt * 7);
    this.pitch += ((vf / p.maxSpeedH) * p.maxTilt - this.pitch) * k;
    this.roll += ((vr / p.maxSpeedH) * p.maxTilt - this.roll) * k;
  }

  /** Height above the floor of the body origin, minus the landing gear. */
  get altitude() {
    return this.position.y - this.params.groundClearance;
  }
}
