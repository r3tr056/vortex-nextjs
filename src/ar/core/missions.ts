// Mission logic for the two mini-games, independent of rendering. Booth space, metres.

import { headingVectors } from './flight.ts';

export interface Footprint {
  x: number;
  z: number;
  r: number;
  /** False when the drone is too low or too high for the sensor to be useful. */
  valid: boolean;
}

/** Sentinel's gimbal looks down and slightly ahead of the nose. */
export function gimbalFootprint(x: number, y: number, z: number, yaw: number): Footprint {
  const alt = y;
  const h = headingVectors(yaw);
  const ahead = alt * 0.3;
  return {
    x: x + h.fx * ahead,
    z: z + h.fz * ahead,
    r: Math.min(0.75, Math.max(0.25, 0.18 + alt * 0.22)),
    valid: alt >= 0.35 && alt <= 3.2,
  };
}

/** Ranger's mapping sensor looks straight down. */
export function nadirFootprint(x: number, y: number, z: number): Footprint {
  const alt = y;
  return {
    x,
    z,
    r: Math.min(0.4, Math.max(0.18, 0.1 + alt * 0.16)),
    valid: alt >= 0.5 && alt <= 2.6,
  };
}

/** Survey cells only count on a steady pass (sharp imagery), like a real mapping flight. */
export const SURVEY_MAX_SPEED = 1.0;

// ── Lock-on (Sentinel) ────────────────────────────────────────────────────────────────

export type TargetKind = 'vehicle' | 'person' | 'radar';

export interface LockOnTargetDef {
  id: string;
  kind: TargetKind;
  label: string;
  x: number;
  z: number;
}

export interface LockOnTargetState extends LockOnTargetDef {
  progress: number;
  locked: boolean;
  inView: boolean;
}

export type MissionEvent =
  | { type: 'lock'; id: string }
  | { type: 'acquire'; id: string }
  | { type: 'complete'; success: boolean };

export const LOCKON_TARGETS: LockOnTargetDef[] = [
  { id: 't1', kind: 'vehicle', label: 'Vehicle', x: -1.9, z: 0.7 },
  { id: 't2', kind: 'radar', label: 'Radar', x: 1.8, z: 1.2 },
  { id: 't3', kind: 'person', label: 'Person', x: 0.4, z: 1.9 },
];

export class LockOnMission {
  readonly targets: LockOnTargetState[];
  elapsed = 0;
  done = false;

  constructor(
    defs: LockOnTargetDef[] = LOCKON_TARGETS,
    readonly timeLimit = 60,
    readonly holdTime = 1.5,
  ) {
    this.targets = defs.map((d) => ({ ...d, progress: 0, locked: false, inView: false }));
  }

  get lockedCount() {
    return this.targets.filter((t) => t.locked).length;
  }

  get timeLeft() {
    return Math.max(0, this.timeLimit - this.elapsed);
  }

  update(dt: number, fp: Footprint): MissionEvent[] {
    if (this.done) return [];
    const events: MissionEvent[] = [];
    // A long frame (tab switch, GC) must not earn hold time past the deadline.
    dt = Math.min(dt, this.timeLeft);
    this.elapsed += dt;

    for (const t of this.targets) {
      if (t.locked) continue;
      const inView = fp.valid && Math.hypot(t.x - fp.x, t.z - fp.z) <= fp.r;
      if (inView && !t.inView) events.push({ type: 'acquire', id: t.id });
      t.inView = inView;
      t.progress = inView
        ? Math.min(1, t.progress + dt / this.holdTime)
        : Math.max(0, t.progress - dt / (this.holdTime * 2));
      if (t.progress >= 1) {
        t.locked = true;
        t.inView = false;
        events.push({ type: 'lock', id: t.id });
      }
    }

    if (this.lockedCount === this.targets.length) {
      this.done = true;
      events.push({ type: 'complete', success: true });
    } else if (this.elapsed >= this.timeLimit) {
      this.done = true;
      events.push({ type: 'complete', success: false });
    }
    return events;
  }
}

// ── Survey (Ranger) ───────────────────────────────────────────────────────────────────

export interface SurveyRegion {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Sized for the space between a visitor scanning the standee (~1.5–2.5 m away) and the standee.
export const SURVEY_REGION: SurveyRegion = { minX: -1.35, maxX: 1.35, minZ: 0.45, maxZ: 1.65 };

/** Grid of cells that get "mapped" when the sensor footprint passes over their centre. */
export class SurveyGrid {
  readonly cols: number;
  readonly rows: number;
  readonly covered: Uint8Array;
  coveredCount = 0;

  constructor(
    readonly region: SurveyRegion = SURVEY_REGION,
    readonly cell = 0.3,
  ) {
    this.cols = Math.max(1, Math.round((region.maxX - region.minX) / cell));
    this.rows = Math.max(1, Math.round((region.maxZ - region.minZ) / cell));
    this.covered = new Uint8Array(this.cols * this.rows);
  }

  get total() {
    return this.cols * this.rows;
  }

  get coverage() {
    return this.coveredCount / this.total;
  }

  cellCenter(i: number): [number, number] {
    const c = i % this.cols;
    const r = Math.floor(i / this.cols);
    const w = (this.region.maxX - this.region.minX) / this.cols;
    const d = (this.region.maxZ - this.region.minZ) / this.rows;
    return [this.region.minX + (c + 0.5) * w, this.region.minZ + (r + 0.5) * d];
  }

  /** Marks cells under the footprint; returns indices that were newly covered. */
  paint(fp: Footprint): number[] {
    if (!fp.valid) return [];
    const fresh: number[] = [];
    for (let i = 0; i < this.covered.length; i++) {
      if (this.covered[i]) continue;
      const [cx, cz] = this.cellCenter(i);
      if (Math.hypot(cx - fp.x, cz - fp.z) <= fp.r) {
        this.covered[i] = 1;
        this.coveredCount++;
        fresh.push(i);
      }
    }
    return fresh;
  }

  reset() {
    this.covered.fill(0);
    this.coveredCount = 0;
  }
}

export class SurveyMission {
  elapsed = 0;
  done = false;

  constructor(
    readonly grid: SurveyGrid,
    readonly goal = 0.9,
    readonly timeLimit = 60,
  ) {}

  get timeLeft() {
    return Math.max(0, this.timeLimit - this.elapsed);
  }

  update(dt: number, fp: Footprint): { fresh: number[]; events: MissionEvent[] } {
    if (this.done) return { fresh: [], events: [] };
    this.elapsed += Math.min(dt, this.timeLeft);
    const fresh = this.grid.paint(fp);
    const events: MissionEvent[] = [];
    if (this.grid.coverage >= this.goal) {
      this.done = true;
      events.push({ type: 'complete', success: true });
    } else if (this.elapsed >= this.timeLimit) {
      this.done = true;
      events.push({ type: 'complete', success: false });
    }
    return { fresh, events };
  }
}
