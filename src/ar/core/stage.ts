// The whole experience plays as a scale model in a compact stage in front of the standee, so it
// never spills into the aisle, the neighbouring standee or above the booth (congested halls).
// Booth space, metres: origin on the floor below the centre of the standee face, +X to the
// visitor's right, +Z toward the visitor. The intro sets the scale; Explore, flight and the
// missions keep it.

import { headingVectors } from './flight.ts';
import { samplePath, type PathKey } from './track.ts';

export interface Extent {
  minX: number;
  maxX: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

/**
 * The 75 cm standee plus ~50 cm each side, lower than the 1.8 m standee, and no deeper than
 * ~1.3 m in front of it.
 */
export const INTRO_STAGE: Extent = { minX: -0.875, maxX: 0.875, maxY: 1.6, minZ: 0.1, maxZ: 1.3 };

/**
 * Where visitors fly afterwards: the same footprint and ceiling, reaching a little further toward
 * the visitor (they stand in front, so the extra depth is on their side, not the aisle's).
 */
export const PLAY_STAGE: Extent = { ...INTRO_STAGE, maxZ: 1.5 };

/** Fleet wingmen fly this far to each side of, behind and above the lead drone. */
export const GHOST_OFFSET = { side: 0.8, back: 0.4, up: 0.1 };

/**
 * Climb streaks: a ring just outside the props (multiples of the drone's reach), falling from
 * `above` to `below` metres relative to the drone's feet.
 */
export const CLIMB_STREAKS = { inner: 1.02, outer: 1.25, above: 0.35, below: 1.3, length: 0.1 };

/** Uniform scale about the floor (y = 0 stays the floor), then a shift in x/z. */
export interface StageFit {
  scale: number;
  x: number;
  z: number;
}

export interface IntroContent {
  duration: number;
  path: PathKey[];
  demoTargets?: { x: number; z: number }[];
  /** Seconds during which the fleet wingmen fly alongside. */
  ghosts?: [number, number];
  /** Seconds during which the climb streaks show. */
  streaks?: [number, number];
}

/** Drone size: `reach` = centre to prop tip in plan (yaw-independent), `height` = feet to top. */
export interface DroneSize {
  reach: number;
  height: number;
}

/** Everything the intro occupies in its own (unscaled) space: the drone along its path and each effect. */
export function introExtent(c: IntroContent, drone: DroneSize, extra: Extent[] = []): Extent {
  const e: Extent = { minX: Infinity, maxX: -Infinity, maxY: 0, minZ: Infinity, maxZ: -Infinity };
  const add = (x: number, z: number, r: number, top: number) => {
    e.minX = Math.min(e.minX, x - r);
    e.maxX = Math.max(e.maxX, x + r);
    e.minZ = Math.min(e.minZ, z - r);
    e.maxZ = Math.max(e.maxZ, z + r);
    e.maxY = Math.max(e.maxY, top);
  };
  const within = (t: number, w?: [number, number]) => !!w && t >= w[0] && t <= w[1];
  for (let t = 0; t <= c.duration; t += 0.05) {
    const s = samplePath(c.path, t);
    // + the hover bob.
    add(s.x, s.z, drone.reach, s.y + drone.height + 0.02);
    if (within(t, c.streaks)) {
      add(s.x, s.z, drone.reach * CLIMB_STREAKS.outer, s.y + CLIMB_STREAKS.above + CLIMB_STREAKS.length);
    }
    if (within(t, c.ghosts)) {
      const h = headingVectors(s.yaw);
      for (const side of [-1, 1]) {
        add(
          s.x + h.rx * side * GHOST_OFFSET.side - h.fx * GHOST_OFFSET.back,
          s.z + h.rz * side * GHOST_OFFSET.side - h.fz * GHOST_OFFSET.back,
          drone.reach,
          s.y + GHOST_OFFSET.up + drone.height + 0.02,
        );
      }
    }
  }
  // Ground target markers.
  for (const t of c.demoTargets ?? []) add(t.x, t.z, 0.25, 0.3);
  for (const x of extra) {
    e.minX = Math.min(e.minX, x.minX);
    e.maxX = Math.max(e.maxX, x.maxX);
    e.minZ = Math.min(e.minZ, x.minZ);
    e.maxZ = Math.max(e.maxZ, x.maxZ);
    e.maxY = Math.max(e.maxY, x.maxY);
  }
  return e;
}

/** The largest uniform scale (never above 1) that fits `content` inside `stage`, centred in it. */
export function fitStage(content: Extent, stage: Extent = INTRO_STAGE): StageFit {
  const scale = Math.min(
    1,
    (stage.maxX - stage.minX) / (content.maxX - content.minX),
    stage.maxY / content.maxY,
    (stage.maxZ - stage.minZ) / (content.maxZ - content.minZ),
  );
  return {
    scale,
    x: (stage.minX + stage.maxX) / 2 - (scale * (content.minX + content.maxX)) / 2,
    z: (stage.minZ + stage.maxZ) / 2 - (scale * (content.minZ + content.maxZ)) / 2,
  };
}

/** Booth-space point → stage (scale-model) space. */
export function toStage(fit: StageFit, x: number, y: number, z: number): [number, number, number] {
  return [(x - fit.x) / fit.scale, y / fit.scale, (z - fit.z) / fit.scale];
}

/**
 * Flight volume for the drone's centre, in stage space: inside `box` once scaled, the props clear
 * of the standee, the top of the drone under the ceiling, and at most half a prop-reach overhang
 * at the sides.
 */
export function playBounds(fit: StageFit, drone: DroneSize, box: Extent = PLAY_STAGE) {
  const k = fit.scale;
  return {
    minX: (box.minX - fit.x) / k + drone.reach / 2,
    maxX: (box.maxX - fit.x) / k - drone.reach / 2,
    minZ: (box.minZ - fit.z) / k + drone.reach,
    maxZ: (box.maxZ - fit.z) / k,
    maxY: box.maxY / k - drone.height,
  };
}

/** Where `content` ends up after `fit` (for checks). */
export function applyFit(content: Extent, fit: StageFit): Extent {
  return {
    minX: fit.x + fit.scale * content.minX,
    maxX: fit.x + fit.scale * content.maxX,
    maxY: fit.scale * content.maxY,
    minZ: fit.z + fit.scale * content.minZ,
    maxZ: fit.z + fit.scale * content.maxZ,
  };
}
