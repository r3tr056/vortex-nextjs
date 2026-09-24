// Scripted ~40 s ad sequences, one per drone. Positions are in the intro's own space (metres,
// booth axes, drone at real size). The world shrinks the whole experience uniformly to fit the
// stage in front of the standee (core/stage.ts: INTRO_STAGE) and keeps that scale afterwards.
//
// Copy mirrors docs/ar-experience-brief.md — edit both together.

import type { DroneSlug } from '../config/drones';
import type { PathKey } from '../core/track.ts';

/** `target` = demo target in the ad sequence; `missionTarget` = lock-on mission target. */
export type CalloutAnchor = 'drone' | 'gimbal' | { target: number } | { missionTarget: number } | [number, number, number];

export interface SequenceFx {
  caption(index: string, title: string, body: string): void;
  callout(id: string, title: string, body: string, anchor: CalloutAnchor, side?: 'left' | 'right'): void;
  hideCallout(id: string): void;
  scan(): void;
  pad(on: boolean): void;
  materialize(seconds: number): void;
  rpm(value: number, seconds: number): void;
  altitude(from: number, to: number, seconds: number): void;
  hideAltitude(): void;
  climbStreaks(on: boolean): void;
  gimbal(on: boolean): void;
  gimbalLook(target: number | null): void;
  demoTargets(on: boolean): void;
  gpsDenied(on: boolean): void;
  featurePoints(on: boolean): void;
  surveyTiles(on: boolean): void;
  surveyAutoPaint(on: boolean): void;
  terrain(on: boolean): void;
  ghosts(on: boolean): void;
  sound(kind: 'scan' | 'lock' | 'beat'): void;
}

export interface Cue {
  t: number;
  run: (fx: SequenceFx) => void;
}

export interface SequenceScript {
  duration: number;
  path: PathKey[];
  cues: Cue[];
  /** Ground targets classified during the Track beat (Sentinel). */
  demoTargets?: { id: string; kind: 'vehicle' | 'person' | 'radar'; label: string; x: number; z: number; confidence: string }[];
  /** When the fleet wingmen fly (they count toward the stage fit). */
  ghosts?: [number, number];
  /** When the climb streaks show. */
  streaks?: [number, number];
}

// Effect windows for the stage fit. Each ends ~1 s after its "off" cue because the effect fades
// out over about a second, and it still occupies space while it does.
const CLIMB: [number, number] = [10, 18.5];
// Wingmen join once the drone has turned to face the visitor (so they don't sweep the booth).
const FLEET: [number, number] = [29.2, 34.5];

const HANDOVER: PathKey[] = [
  { t: 37.5, p: [0, 1.2, 1.1], yaw: Math.PI },
  { t: 40, p: [0, 1.2, 1.1], yaw: Math.PI },
];

const sentinel: SequenceScript = {
  duration: 40,
  streaks: CLIMB,
  demoTargets: [
    { id: 'd1', kind: 'vehicle', label: 'Vehicle', x: -0.85, z: 1.25, confidence: '0.94' },
    { id: 'd2', kind: 'person', label: 'Person', x: 0.1, z: 1.5, confidence: '0.91' },
    { id: 'd3', kind: 'vehicle', label: 'Vehicle', x: 0.85, z: 0.9, confidence: '0.88' },
  ],
  path: [
    { t: 0, p: [0, 0, 0.9], yaw: 0 },
    { t: 6.5, p: [0, 0, 0.9], yaw: 0 },
    { t: 10, p: [0, 1.1, 0.95], yaw: 0 },
    { t: 17.5, p: [0.05, 2.0, 0.95], yaw: 0.9 },
    { t: 20, p: [-0.35, 1.65, 1.1], yaw: 0.3 },
    { t: 23, p: [0.05, 1.65, 1.2], yaw: 0 },
    { t: 26.5, p: [0.4, 1.55, 1.05], yaw: -0.4 },
    { t: 30, p: [0.45, 1.45, 0.9], yaw: -1.3 },
    { t: 33, p: [0.05, 1.4, 0.9], yaw: -0.2 },
    ...HANDOVER,
  ],
  cues: [
    { t: 0, run: (fx) => { fx.scan(); fx.sound('scan'); fx.caption('01', 'Target acquired', 'Sentinel · VAS-04'); } },
    { t: 1.5, run: (fx) => fx.pad(true) },
    { t: 4, run: (fx) => { fx.caption('02', 'Deploy', 'Man-portable. Airborne in minutes.'); fx.materialize(2.2); fx.sound('beat'); } },
    { t: 5, run: (fx) => fx.rpm(0.35, 1) },
    { t: 6.2, run: (fx) => { fx.rpm(0.9, 1.4); fx.pad(false); } },
    { t: 7.5, run: (fx) => fx.callout('deploy', 'Man-portable', 'Carried and launched by one operator', 'drone', 'right') },
    { t: CLIMB[0], run: (fx) => { fx.hideCallout('deploy'); fx.caption('03', 'Climb', 'Rated above 5,000 m. Built for Ladakh-class ceilings.'); fx.altitude(0, 5000, 7); fx.climbStreaks(true); fx.sound('beat'); } },
    { t: CLIMB[1] - 1, run: (fx) => fx.climbStreaks(false) },
    { t: 18.5, run: (fx) => { fx.hideAltitude(); fx.caption('04', 'Track', 'Onboard AI finds and classifies targets. No ground station needed.'); fx.demoTargets(true); fx.gimbal(true); fx.gimbalLook(0); fx.sound('beat'); } },
    { t: 20, run: (fx) => { fx.callout('c0', 'Vehicle', 'Confidence 0.94', { target: 0 }, 'left'); fx.sound('lock'); } },
    { t: 22.5, run: (fx) => fx.gimbalLook(1) },
    { t: 23.5, run: (fx) => { fx.callout('c1', 'Person', 'Confidence 0.91', { target: 1 }, 'right'); fx.sound('lock'); } },
    { t: 25.5, run: (fx) => fx.gimbalLook(2) },
    { t: 26.5, run: (fx) => { fx.callout('c2', 'Vehicle', 'Confidence 0.88', { target: 2 }, 'right'); fx.sound('lock'); } },
    { t: 28, run: (fx) => { fx.gimbal(false); fx.gimbalLook(null); fx.caption('05', 'Deny', 'GPS jammed. Sentinel keeps flying on vision.'); fx.gpsDenied(true); fx.featurePoints(true); fx.sound('beat'); } },
    { t: 29, run: (fx) => fx.callout('vio', 'Visual-inertial navigation', 'Holds course without GNSS · low-signature', 'drone', 'left') },
    { t: 33.5, run: (fx) => { fx.hideCallout('vio'); fx.hideCallout('c0'); fx.hideCallout('c1'); fx.hideCallout('c2'); fx.demoTargets(false); } },
    { t: 34.5, run: (fx) => { fx.gpsDenied(false); fx.featurePoints(false); } },
    { t: 35, run: (fx) => { fx.caption('06', 'Your turn', 'Take the sticks.'); fx.pad(true); fx.sound('beat'); } },
  ],
};

const ranger: SequenceScript = {
  duration: 40,
  ghosts: FLEET,
  path: [
    { t: 0, p: [0, 0, 0.9], yaw: 0 },
    { t: 6.5, p: [0, 0, 0.9], yaw: 0 },
    { t: 9.5, p: [0, 1.3, 1.0], yaw: 0 },
    // Lawnmower survey: three passes across the zone.
    { t: 10.8, p: [-0.7, 1.35, 0.8], yaw: Math.PI / 2 },
    { t: 12.8, p: [0.7, 1.35, 0.8], yaw: Math.PI / 2 },
    { t: 13.6, p: [0.7, 1.35, 1.1], yaw: -Math.PI / 2 },
    { t: 15.6, p: [-0.7, 1.35, 1.1], yaw: -Math.PI / 2 },
    { t: 16.4, p: [-0.7, 1.35, 1.4], yaw: Math.PI / 2 },
    { t: 18.4, p: [0.7, 1.35, 1.4], yaw: Math.PI / 2 },
    // Orbit the rising digital twin.
    { t: 20.5, p: [0.7, 1.75, 1.1], yaw: -Math.PI / 2 },
    { t: 22.8, p: [0, 1.8, 1.4], yaw: Math.PI },
    { t: 25, p: [-0.7, 1.75, 1.1], yaw: Math.PI / 2 },
    { t: 27.5, p: [-0.15, 1.6, 1.2], yaw: 2.6 },
    // Fleet: a gentle bank, far enough forward that the wingmen stay in front of the standee.
    { t: 29.5, p: [0, 1.55, 1.2], yaw: 0 },
    { t: 32, p: [0.1, 1.65, 1.15], yaw: -0.15 },
    { t: 34, p: [0, 1.5, 1.15], yaw: 0 },
    ...HANDOVER,
  ],
  cues: [
    { t: 0, run: (fx) => { fx.scan(); fx.sound('scan'); fx.caption('01', 'Target acquired', 'Ranger · VAS-03'); } },
    { t: 1.5, run: (fx) => fx.pad(true) },
    { t: 4, run: (fx) => { fx.caption('02', 'Launch', 'Long-endurance mapping and persistent ISR.'); fx.materialize(2.2); fx.sound('beat'); } },
    { t: 5, run: (fx) => fx.rpm(0.35, 1) },
    { t: 6.2, run: (fx) => { fx.rpm(0.9, 1.4); fx.pad(false); } },
    { t: 9.5, run: (fx) => { fx.caption('03', 'Survey', 'RGB, multispectral and LiDAR turn every pass into survey-grade maps.'); fx.surveyTiles(true); fx.surveyAutoPaint(true); fx.gimbal(true); fx.sound('beat'); } },
    { t: 11, run: (fx) => fx.callout('sensor', 'RGB / Multispectral / LiDAR', 'Survey-grade maps and point clouds', 'gimbal', 'right') },
    { t: 18.6, run: (fx) => { fx.surveyAutoPaint(false); fx.gimbal(false); fx.hideCallout('sensor'); } },
    { t: 19, run: (fx) => { fx.caption('04', 'Twin', 'Vortex Enterprise builds the digital twin: terrain, assets, change.'); fx.terrain(true); fx.sound('beat'); } },
    { t: 19.6, run: (fx) => fx.surveyTiles(false) },
    { t: 21, run: (fx) => fx.callout('twin', 'Digital twin', 'Geospatial intelligence from one flight', [0.6, 0.45, 1.05], 'left') },
    { t: 27, run: (fx) => { fx.hideCallout('twin'); fx.terrain(false); } },
    { t: 27.5, run: (fx) => { fx.caption('05', 'Fleet', 'One operator, many aircraft. Vortex Cloud GCS.'); fx.sound('beat'); } },
    { t: FLEET[0], run: (fx) => { fx.ghosts(true); fx.callout('fleet', 'Multi-fleet coordination', 'Vortex FlightControl · tethered option', 'drone', 'right'); } },
    { t: FLEET[1] - 1, run: (fx) => { fx.ghosts(false); fx.hideCallout('fleet'); } },
    { t: 35, run: (fx) => { fx.caption('06', 'Your turn', 'Take the sticks.'); fx.pad(true); fx.sound('beat'); } },
  ],
};

export const SEQUENCES: Record<DroneSlug, SequenceScript> = { sentinel, ranger };
