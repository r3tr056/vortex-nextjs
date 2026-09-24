// Tiny external store shared by the three.js world (writer) and the React HUD (reader).
// Per-frame data (callout positions, sticks) never goes through here — only state that
// changes a handful of times per second.

import type { DroneSlug } from '../config/drones';
import type { EngineKind, SessionCapabilities } from '../engine/types';

export type Phase =
  | 'intro'
  | 'starting'
  | 'scanning'
  | 'placing'
  | 'sequence'
  | 'explore'
  | 'flight'
  | 'mission'
  | 'result'
  | 'error';

export type AnchorMode = 'standee' | 'floor' | 'preview';
export type Platform = 'ios' | 'android' | 'desktop' | 'other';

export interface Caption {
  index: string;
  title: string;
  body: string;
}

export interface MissionHud {
  type: 'lockon' | 'survey';
  timeLeft: number;
  /** Locked targets, or coverage percentage. */
  value: number;
  goal: number;
  hint: string | null;
}

export interface MissionResult {
  type: 'lockon' | 'survey';
  success: boolean;
  value: number;
  goal: number;
  time: number;
}

export type PhotoStatus = 'idle' | 'working' | 'done' | 'failed';

export interface ArState {
  slug: DroneSlug;
  phase: Phase;
  engine: EngineKind | null;
  capabilities: SessionCapabilities | null;
  /** iOS: an AR Quick Look (native ARKit) model is ready to open. */
  quickLookReady: boolean;
  /** Where manual placement anchors: the base of the standee, or anywhere on the floor. */
  placeKind: 'standee' | 'floor';
  photo: PhotoStatus;
  /** Short-lived status line (e.g. "Re-aligned to the standee"). */
  notice: string | null;
  anchorMode: AnchorMode | null;
  platform: Platform;
  loadProgress: number;
  caption: Caption | null;
  altitude: string | null;
  gpsDenied: boolean;
  mission: MissionHud | null;
  result: MissionResult | null;
  trackingWarning: string | null;
  boundaryWarning: boolean;
  scanElapsed: number;
  /** Floor placement: the reticle has found the floor. */
  placeReady: boolean;
  /** Explore mode: open hotspot id, and ids visited so far. */
  hotspot: string | null;
  explored: string[];
  muted: boolean;
  proControls: boolean;
  ctaOpen: boolean;
  error: { title: string; body: string } | null;
}

type Listener = () => void;

export function createArStore(initial: ArState) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(patch: Partial<ArState>) {
      let changed = false;
      for (const k in patch) {
        if (!Object.is(state[k as keyof ArState], patch[k as keyof ArState])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export type ArStore = ReturnType<typeof createArStore>;
