// Keyframed camera-free path used by the scripted ad sequences.

import { wrapAngle } from './anchor.ts';

export interface PathKey {
  t: number;
  p: [number, number, number];
  yaw: number;
}

export interface PathSample {
  x: number;
  y: number;
  z: number;
  yaw: number;
  /** Approximate velocity, used to tilt the drone into its motion. */
  vx: number;
  vy: number;
  vz: number;
}

function catmull(p0: number, p1: number, p2: number, p3: number, u: number) {
  const u2 = u * u;
  const u3 = u2 * u;
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
}

function smooth(u: number) {
  return u * u * (3 - 2 * u);
}

export function samplePath(keys: PathKey[], t: number, out?: PathSample): PathSample {
  const s = out ?? { x: 0, y: 0, z: 0, yaw: 0, vx: 0, vy: 0, vz: 0 };
  if (keys.length === 0) return s;
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (t <= first.t || keys.length === 1) {
    [s.x, s.y, s.z] = first.p;
    s.yaw = first.yaw;
    s.vx = s.vy = s.vz = 0;
    return s;
  }
  if (t >= last.t) {
    [s.x, s.y, s.z] = last.p;
    s.yaw = last.yaw;
    s.vx = s.vy = s.vz = 0;
    return s;
  }
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(keys.length - 1, i + 2)];
  const span = k2.t - k1.t;
  const u = span > 0 ? (t - k1.t) / span : 0;
  const pos = (uu: number): [number, number, number] => [
    catmull(k0.p[0], k1.p[0], k2.p[0], k3.p[0], uu),
    catmull(k0.p[1], k1.p[1], k2.p[1], k3.p[1], uu),
    catmull(k0.p[2], k1.p[2], k2.p[2], k3.p[2], uu),
  ];
  [s.x, s.y, s.z] = pos(u);
  const du = 0.01;
  const [ax, ay, az] = pos(Math.max(0, u - du));
  const [bx, by, bz] = pos(Math.min(1, u + du));
  const dt = span * (Math.min(1, u + du) - Math.max(0, u - du)) || 1;
  s.vx = (bx - ax) / dt;
  s.vy = (by - ay) / dt;
  s.vz = (bz - az) / dt;
  s.yaw = k1.yaw + wrapAngle(k2.yaw - k1.yaw) * smooth(u);
  return s;
}
