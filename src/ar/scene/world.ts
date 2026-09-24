// The booth scene: drone, effects, ad sequence, Explore hotspots, flight and missions.
// Session-agnostic — the same world runs on ARCore (WebXR), 8th Wall and the 3D preview.

import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  type Material,
  MeshBasicMaterial,
  Plane,
  PMREMGenerator,
  Quaternion,
  Raycaster,
  type Texture,
  Vector2,
  Vector3,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { ArDrone, Hotspot, HotspotAction, ImageTargetDef } from '../config/drones';
import {
  AnchorFilter,
  blendPose,
  boothPoseFromImage,
  boothPoseFromPlanar,
  tiltFromVertical,
  type BoothPose,
  type FilterResult,
} from '../core/anchor.ts';
import { FlightModel, headingVectors, type Sticks } from '../core/flight.ts';
import {
  gimbalFootprint,
  LOCKON_TARGETS,
  LockOnMission,
  nadirFootprint,
  SURVEY_MAX_SPEED,
  SurveyGrid,
  SurveyMission,
  type Footprint,
} from '../core/missions.ts';
import type { AnchorMode, ArStore, MissionHud } from '../core/store.ts';
import { samplePath, type PathSample } from '../core/track.ts';
import type { RotorAudio } from '../audio/rotor';
import type { ImageEvent, LightingEvent, MarkerEvent, SessionHandles } from '../engine/types';
import type { CalloutLayer } from '../ui/callouts';
import type { HotspotLayer } from '../ui/hotspots';
import { DroneRig } from './drone';
import {
  BlobShadow,
  ClimbStreaks,
  FeaturePoints,
  GroundTargets,
  MaterializeRing,
  PulseRing,
  Reticle,
  ScanSweep,
  SensorCone,
  SurveyTiles,
  TerrainTwin,
  Tether,
} from './effects';
import { SEQUENCES, type CalloutAnchor, type SequenceFx, type SequenceScript } from './sequences';

type WorldPhase = 'idle' | 'placing' | 'sequence' | 'explore' | 'flight' | 'mission' | 'result';
export type PlaceKind = 'standee' | 'floor';
export type TrackFn = (event: string, detail?: Record<string, string | number | boolean>) => void;

export interface WorldOptions {
  handles: SessionHandles;
  drone: ArDrone;
  mode: AnchorMode;
  store: ArStore;
  audio: RotorAudio;
  callouts: CalloutLayer;
  hotspots: HotspotLayer;
  sticks: Sticks;
  track: TrackFn;
  haptic: (pattern: number | number[]) => void;
  onProgress?: (p: number) => void;
}

const IDLE_STICKS: Sticks = { lx: 0, ly: 0, rx: 0, ry: 0 };
const HANDOVER_POS = new Vector3(0, 1.2, 1.1);
/** Where the drone hovers in Explore: in front of the standee, at chest height. */
const EXPLORE_POS = new Vector3(0, 1.05, 1.2);
/** A standee is upright; anything leaning more than this is a misdetection. */
const MAX_TILT = (30 * Math.PI) / 180;
const DEMO_DURATION: Record<HotspotAction, number> = {
  track: 4.5,
  spool: 3.2,
  xray: 3.2,
  vio: 4,
  stealth: 3.6,
  map: 5,
  fleet: 4.5,
  tether: 4.5,
};

const tmpV = new Vector3();
const tmpV2 = new Vector3();
const tmpQ = new Quaternion();

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Approximate colour of a black body at `k` kelvin (for 8th Wall's colour-temperature estimate). */
function kelvinToColor(k: number, out: Color) {
  const t = clamp(k, 1500, 12000) / 100;
  const r = t <= 66 ? 255 : 329.7 * (t - 60) ** -0.1332;
  const g = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * (t - 60) ** -0.0755;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  return out.setRGB(clamp(r, 0, 255) / 255, clamp(g, 0, 255) / 255, clamp(b, 0, 255) / 255);
}

export class ExperienceWorld implements SequenceFx {
  readonly booth = new Group();
  private readonly o: WorldOptions;
  private readonly seq: SequenceScript;
  private rig!: DroneRig;
  private readonly flight = new FlightModel();
  private phase: WorldPhase = 'idle';
  private time = 0;
  private mode: AnchorMode;

  // Anchor.
  private anchored = false;
  private pose: BoothPose = { position: new Vector3(), yaw: 0, scale: 1 };
  private readonly filter = new AnchorFilter();
  private scanTarget: ImageTargetDef;

  // Sequence.
  private seqTime = 0;
  private cueIndex = 0;
  private readonly sample: PathSample = { x: 0, y: 0, z: 0, yaw: 0, vx: 0, vy: 0, vz: 0 };
  private rpmFrom = 0;
  private rpmTo = 0;
  private rpmT = 1;
  private rpmDur = 1;
  private matT = -1;
  private matDur = 1;
  private readonly clipPlane = new Plane();
  private alt: { from: number; to: number; dur: number; t: number } | null = null;
  private lookTarget: Vector3 | null = null;
  private readonly lookPos = new Vector3();
  private autoPaint = false;
  private ghostsOn = false;
  private ghostFade = 0;

  // Explore.
  private readonly exploreFrom = new Vector3();
  private exploreT = 1;
  private exploreYaw = 0;
  private demo: { action: HotspotAction; t: number; dur: number; flags: Set<string> } | null = null;
  private readonly demoOffset = new Vector3();
  private demoRpm: number | null = null;
  private stealthMats: { m: Material; transparent: boolean; opacity: number }[] | null = null;

  // Effects.
  private shadow!: BlobShadow;
  private scanSweep!: ScanSweep;
  private padFx!: PulseRing;
  private matRing!: MaterializeRing;
  private cone!: SensorCone;
  private streaks!: ClimbStreaks;
  private points!: FeaturePoints;
  private reticle!: Reticle;
  private tether!: Tether;
  private xrayGhost!: Group;
  private demoTargetsFx: GroundTargets | null = null;
  private exploreTarget: GroundTargets | null = null;
  private missionTargets: GroundTargets | null = null;
  private grid: SurveyGrid | null = null;
  private tiles: SurveyTiles | null = null;
  private terrainFx: TerrainTwin | null = null;
  private ghostRigs: Group[] = [];

  // Lighting.
  private hemi!: HemisphereLight;
  private key!: DirectionalLight;
  private baseEnv: Texture | null = null;
  private lightScale = 1;
  private lightTarget = 1;
  private readonly keyColor = new Color('#ffffff');
  private estimatedLight = false;

  // Flight + missions.
  private controlHeading = Math.PI;
  private lockon: LockOnMission | null = null;
  private survey: SurveyMission | null = null;
  private boundaryTimer = 0;
  private lastPaintBlip = 0;
  private missionKey = '';

  // Floor placement.
  private placeKind: PlaceKind = 'floor';
  private readonly raycaster = new Raycaster();
  private readonly floorPlane = new Plane(new Vector3(0, 1, 0), 0);
  private readonly placeHit = new Vector3();
  private placeValid = false;

  private constructor(o: WorldOptions) {
    this.o = o;
    this.mode = o.mode;
    this.seq = SEQUENCES[o.drone.slug];
    this.scanTarget = o.drone.standee.targets[0];
  }

  static async create(o: WorldOptions): Promise<ExperienceWorld> {
    const w = new ExperienceWorld(o);
    await w.build();
    return w;
  }

  private async build() {
    const { scene, renderer, camera } = this.o.handles;
    const { drone } = this.o;
    renderer.localClippingEnabled = true;

    const pmrem = new PMREMGenerator(renderer);
    this.baseEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = this.baseEnv;
    scene.environmentIntensity = 0.7;
    this.hemi = new HemisphereLight('#e6eefc', '#1a1d22', 1.2);
    this.key = new DirectionalLight('#ffffff', 2.2);
    this.key.position.set(1.5, 4, 2.5);
    scene.add(this.hemi, this.key);

    this.rig = await DroneRig.create({ slug: drone.slug, model: drone.model, onProgress: this.o.onProgress });
    this.rig.root.visible = false;
    this.booth.add(this.rig.root);
    // Installed once; the plane is only moved afterwards. "Reveal all" until materialising.
    this.clipPlane.set(new Vector3(0, -1, 0), 1e5);
    this.rig.installClip(this.clipPlane);

    this.shadow = new BlobShadow(drone.model.diagonalM * 1.1);
    this.padFx = new PulseRing(drone.model.diagonalM * 0.55);
    this.matRing = new MaterializeRing(drone.model.diagonalM * 0.5);
    this.cone = new SensorCone();
    this.streaks = new ClimbStreaks();
    this.points = this.makeFeaturePoints();
    this.scanSweep = new ScanSweep(1, 1);
    this.tether = new Tether();
    this.booth.add(
      this.shadow.mesh,
      this.padFx.group,
      this.matRing.mesh,
      this.cone.group,
      this.streaks.lines,
      this.points.points,
      this.scanSweep.mesh,
      this.tether.group,
    );

    this.xrayGhost = this.rig.createGhost();
    this.xrayGhost.visible = false;
    this.rig.root.add(this.xrayGhost);

    if (this.seq.demoTargets) {
      this.demoTargetsFx = new GroundTargets(this.seq.demoTargets);
      this.booth.add(this.demoTargetsFx.group);
    }
    if (drone.mission === 'lockon') {
      this.missionTargets = new GroundTargets(LOCKON_TARGETS);
      this.exploreTarget = new GroundTargets([{ id: 'x1', kind: 'vehicle', x: 0, z: 1.8 }]);
      this.booth.add(this.missionTargets.group, this.exploreTarget.group);
    } else {
      this.grid = new SurveyGrid();
      this.tiles = new SurveyTiles(this.grid);
      this.terrainFx = new TerrainTwin(this.grid.region);
      this.booth.add(this.tiles.group, this.terrainFx.group);
    }
    for (const side of [-1, 1]) {
      const g = this.rig.createGhost();
      g.visible = false;
      g.userData.side = side;
      this.ghostRigs.push(g);
      this.booth.add(g);
    }

    this.reticle = new Reticle();
    scene.add(this.reticle.group);
    scene.add(this.booth);

    // Compile every shader up front so the first materialise/demo frame doesn't stall.
    const restore: [{ visible: boolean }, boolean][] = [];
    this.booth.traverse((obj) => {
      restore.push([obj, obj.visible]);
      obj.visible = true;
    });
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      // Best effort only.
    }
    for (const [obj, v] of restore) obj.visible = v;
    this.booth.visible = false;
  }

  // ── Anchoring ────────────────────────────────────────────────────────────────────

  private makeFeaturePoints() {
    const upper = this.o.drone.standee.targets[0];
    // No standee in floor mode, so only scatter points on the floor.
    return new FeaturePoints(this.mode === 'floor' ? null : { size: upper.sizeM, centreY: upper.centerM[1] });
  }

  setAnchorMode(mode: AnchorMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.booth.remove(this.points.points);
    this.points = this.makeFeaturePoints();
    this.booth.add(this.points.points);
  }

  get isAnchored() {
    return this.anchored;
  }

  get boothPose(): BoothPose {
    return { position: this.pose.position.clone(), yaw: this.pose.yaw, scale: this.pose.scale };
  }

  private applyPose() {
    this.booth.position.copy(this.pose.position);
    this.booth.rotation.set(0, this.pose.yaw, 0);
    this.booth.scale.setScalar(this.pose.scale);
    this.booth.visible = true;
  }

  setBoothPose(next: BoothPose, immediate: boolean) {
    if (immediate || !this.anchored) {
      this.pose = { position: next.position.clone(), yaw: next.yaw, scale: next.scale };
    } else {
      blendPose(this.pose, next, 0.2);
    }
    this.anchored = true;
    this.applyPose();
  }

  private offer(candidate: BoothPose): FilterResult {
    const r = this.filter.push(candidate, performance.now());
    if (r === 'locked' || r === 'relocked') this.setBoothPose(this.filter.locked!, true);
    else if (r === 'updated') this.setBoothPose(this.filter.locked!, false);
    return r;
  }

  /** 8th Wall image-target sighting. Implausible detections (glare, partial views) are dropped. */
  offerImage(e: ImageEvent): FilterResult | null {
    const def = this.o.drone.standee.targets.find((t) => t.name === e.name);
    if (!def) return null;
    const k = e.scale / def.longSideM;
    if (!(k > 0.4 && k < 2.5)) return 'rejected';
    if (tiltFromVertical(e.rotation) > MAX_TILT) return 'rejected';
    const dist = this.o.handles.camera.getWorldPosition(tmpV).distanceTo(tmpV2.set(e.position.x, e.position.y, e.position.z)) / k;
    if (dist < 0.2 || dist > 6) return 'rejected';
    const r = this.offer(boothPoseFromImage(e, def));
    if (r === 'locked') this.scanTarget = def;
    return r;
  }

  /** QR sighting through WebXR camera access (metric). */
  offerMarker(e: MarkerEvent): FilterResult {
    if (e.distance < 0.12 || e.distance > 4) return 'rejected';
    if (tiltFromVertical(e.quaternion) > MAX_TILT) return 'rejected';
    return this.offer(boothPoseFromPlanar(e.position, e.quaternion, 1, this.o.drone.standee.qr));
  }

  /** The AR platform refined its anchor (ARCore): follow it smoothly. */
  onNativeAnchor(position: Vector3, yaw: number) {
    if (!this.anchored) return;
    blendPose(this.pose, { position, yaw, scale: this.pose.scale }, 0.25);
    this.applyPose();
  }

  /** Manual re-align: the next consistent sighting replaces the current anchor. */
  requestReanchor() {
    this.filter.unlock();
  }

  beginPlacing(kind: PlaceKind) {
    this.phase = 'placing';
    this.placeKind = kind;
    this.reticle.group.visible = true;
  }

  /**
   * Places the booth from the reticle. `standee`: the reticle marks the base of the standee.
   * `floor` (away from the booth): the drone spawns on the reticle, facing the visitor.
   */
  confirmPlacement(): BoothPose | null {
    if (!this.placeValid) return null;
    const cam = this.o.handles.camera.getWorldPosition(tmpV);
    const toCam = tmpV2.set(cam.x - this.placeHit.x, 0, cam.z - this.placeHit.z).normalize();
    const yaw = Math.atan2(toCam.x, toCam.z);
    const origin = this.placeHit.clone();
    if (this.placeKind === 'floor') origin.addScaledVector(toCam, -0.9);
    this.reticle.group.visible = false;
    this.filter.reset();
    this.setBoothPose({ position: origin, yaw, scale: 1 }, true);
    return this.boothPose;
  }

  private updatePlacement() {
    const { camera, hitTest } = this.o.handles;
    let hit: Vector3 | null = hitTest ? hitTest() : null;
    if (hit) {
      this.placeHit.copy(hit);
    } else if (!hitTest) {
      this.raycaster.setFromCamera(new Vector2(0, -0.1), camera);
      hit = this.raycaster.ray.intersectPlane(this.floorPlane, this.placeHit);
    }
    const dist = hit ? this.placeHit.distanceTo(camera.getWorldPosition(tmpV)) : Infinity;
    this.placeValid = !!hit && dist < 7;
    this.reticle.group.visible = this.placeValid;
    if (this.placeValid) {
      this.reticle.group.position.copy(this.placeHit);
      const cam = camera.getWorldPosition(tmpV);
      this.reticle.group.rotation.y = Math.atan2(cam.x - this.placeHit.x, cam.z - this.placeHit.z);
    }
    this.o.store.setState({ placeReady: this.placeValid });
  }

  // ── Lighting ─────────────────────────────────────────────────────────────────────

  setLighting(e: LightingEvent) {
    const { scene } = this.o.handles;
    if (e.kind === 'estimated') {
      // ARCore light estimate: its probe/directional light + reflection map replace ours.
      this.estimatedLight = e.active;
      this.hemi.visible = this.key.visible = !e.active;
      scene.environment = e.active && e.environment ? e.environment : this.baseEnv;
      return;
    }
    // 8th Wall exposure (~ -1..1) and colour temperature.
    this.lightTarget = clamp(1 + e.exposure, 0.35, 1.6);
    if (e.temperature > 1500) kelvinToColor(e.temperature, this.keyColor).lerp(new Color('#ffffff'), 0.5);
  }

  private updateLighting(dt: number) {
    if (this.estimatedLight) return;
    this.lightScale += (this.lightTarget - this.lightScale) * (1 - Math.exp(-dt * 2));
    this.hemi.intensity = 1.2 * this.lightScale;
    this.key.intensity = 2.2 * this.lightScale;
    this.key.color.lerp(this.keyColor, 1 - Math.exp(-dt * 2));
    this.o.handles.scene.environmentIntensity = 0.7 * this.lightScale;
  }

  // ── Phase control ────────────────────────────────────────────────────────────────

  private resetEffects() {
    this.stopDemo();
    this.o.callouts.clear();
    this.o.hotspots.clear();
    this.cone.show(false);
    this.streaks.show(false);
    this.points.show(false);
    this.demoTargetsFx?.show(false);
    this.exploreTarget?.show(false);
    this.missionTargets?.show(false);
    this.terrainFx?.show(false);
    this.tiles?.show(false);
    this.tiles?.reset();
    this.grid?.reset();
    this.padFx.show(false);
    this.tether.show(false);
    this.ghostsOn = false;
    this.autoPaint = false;
    this.lookTarget = null;
    this.alt = null;
    this.lockon = null;
    this.survey = null;
    this.missionKey = '';
    this.o.store.setState({
      caption: null,
      altitude: null,
      gpsDenied: false,
      mission: null,
      boundaryWarning: false,
      hotspot: null,
    });
  }

  private revealAll() {
    this.matT = -1;
    this.clipPlane.set(new Vector3(0, -1, 0), 1e5);
    this.matRing.mesh.visible = false;
  }

  startSequence() {
    this.resetEffects();
    this.phase = 'sequence';
    this.seqTime = 0;
    this.cueIndex = 0;
    this.rig.root.visible = false;
    this.revealAll();
    this.rig.rpm = 0;
    this.rpmFrom = this.rpmTo = 0;
    this.o.store.setState({ phase: 'sequence', result: null });
    this.o.track('sequence_start');
  }

  skipSequence() {
    if (this.phase !== 'sequence') return;
    this.o.track('sequence_skip', { at: Math.round(this.seqTime) });
    if (!this.rig.root.visible || this.rig.root.position.y < 0.3) {
      this.rig.root.position.copy(HANDOVER_POS);
      this.rig.root.rotation.y = Math.PI;
    }
    this.startExplore();
  }

  /** Hover in front of the visitor with tappable hotspots on the real parts of the drone. */
  startExplore() {
    const fromSequence = this.phase === 'sequence';
    this.resetEffects();
    this.revealAll();
    if (fromSequence) this.o.track('sequence_complete');
    this.phase = 'explore';
    this.rig.root.visible = true;
    this.rpmFrom = this.rpmTo = this.rig.rpm = Math.max(this.rig.rpm, 0.85);
    this.exploreFrom.copy(this.rig.root.position);
    this.exploreT = 0;
    // Turn to face the visitor so the sensor hotspots are in view.
    const cam = this.booth.worldToLocal(this.o.handles.camera.getWorldPosition(tmpV));
    this.exploreYaw = Math.atan2(cam.x - EXPLORE_POS.x, cam.z - EXPLORE_POS.z);
    this.o.hotspots.show(
      this.o.drone.hotspots.map((h, i) => ({
        id: h.id,
        index: i + 1,
        label: h.title,
        resolve: (out: Vector3) => this.rig.model.localToWorld(out.set(h.anchor[0], h.anchor[1], h.anchor[2])),
      })),
    );
    this.o.hotspots.setState(null, this.o.store.getState().explored);
    this.o.store.setState({ phase: 'explore', result: null, hotspot: null });
    this.o.track('explore_start');
  }

  selectHotspot(id: string | null) {
    if (this.phase !== 'explore') return;
    const h = id ? this.o.drone.hotspots.find((x) => x.id === id) : null;
    const explored = this.o.store.getState().explored;
    const nextExplored = h && !explored.includes(h.id) ? [...explored, h.id] : explored;
    this.o.store.setState({ hotspot: h?.id ?? null, explored: nextExplored });
    this.o.hotspots.setState(h?.id ?? null, nextExplored);
    if (h) {
      this.startDemo(h);
      this.o.audio.blip('ui');
      this.o.haptic(12);
      this.o.track('hotspot', { id: h.id });
    } else {
      this.stopDemo();
    }
  }

  takeControls() {
    this.startFlight();
  }

  private startFlight() {
    this.resetEffects();
    this.rig.root.visible = true;
    this.revealAll();
    this.rpmFrom = this.rpmTo = this.rig.rpm = 0.85;
    const p = this.rig.root.position;
    this.flight.reset(p.x, Math.max(0.3, p.y), p.z, this.rig.root.rotation.y);
    this.flight.landed = false;
    this.phase = 'flight';
    this.o.store.setState({ phase: 'flight', result: null });
    this.o.track('flight_start');
  }

  startMission() {
    this.o.callouts.clear();
    this.o.hotspots.clear();
    if (this.o.drone.mission === 'lockon') {
      this.lockon = new LockOnMission();
      this.missionTargets?.show(true);
    } else if (this.grid && this.tiles) {
      this.grid.reset();
      this.tiles.reset();
      this.tiles.show(true);
      this.survey = new SurveyMission(this.grid);
    }
    this.cone.show(true);
    this.missionKey = '';
    this.phase = 'mission';
    this.o.store.setState({ phase: 'mission', result: null });
    this.o.audio.blip('beat');
    this.o.track('mission_start');
  }

  flyAgain() {
    this.resetEffects();
    this.phase = 'flight';
    this.o.store.setState({ phase: 'flight', result: null });
  }

  replay() {
    this.startSequence();
  }

  private finishMission(success: boolean, value: number, goal: number, time: number) {
    const type = this.o.drone.mission;
    this.phase = 'result';
    this.cone.show(false);
    this.o.audio.blip(success ? 'success' : 'fail');
    this.o.haptic(success ? [30, 60, 30] : 60);
    this.o.store.setState({
      phase: 'result',
      mission: null,
      result: { type, success, value, goal, time: Math.round(time) },
    });
    this.o.track('mission_complete', { success, value, time: Math.round(time) });
  }

  // ── Explore demos ────────────────────────────────────────────────────────────────

  private startDemo(h: Hotspot) {
    this.stopDemo();
    this.demo = { action: h.action, t: 0, dur: DEMO_DURATION[h.action], flags: new Set() };
    const r = this.rig.root.position;
    switch (h.action) {
      case 'track': {
        // A target appears on the floor between the drone and the visitor, then gets locked.
        // Towards the visitor but angled ~30° aside, so it isn't hidden behind the info card.
        const cam = this.booth.worldToLocal(this.o.handles.camera.getWorldPosition(tmpV));
        const dir = tmpV2.set(cam.x - r.x, 0, cam.z - r.z).normalize();
        const a = 0.55;
        const dx = dir.x * Math.cos(a) + dir.z * Math.sin(a);
        const dz = -dir.x * Math.sin(a) + dir.z * Math.cos(a);
        const x = clamp(r.x + dx * 1.0, -1.6, 1.6);
        const z = clamp(r.z + dz * 1.0, 0.3, 2.4);
        this.exploreTarget?.place(0, x, z);
        this.exploreTarget?.show(true);
        this.cone.show(true);
        this.lookTarget = new Vector3(x, 0, z);
        break;
      }
      case 'vio':
        this.points.show(true);
        this.o.store.setState({ gpsDenied: true });
        break;
      case 'map':
        this.grid?.reset();
        this.tiles?.reset();
        this.tiles?.show(true);
        this.cone.show(true);
        break;
      case 'fleet':
        this.ghostsOn = true;
        for (const g of this.ghostRigs) g.position.copy(r);
        break;
      case 'tether':
        this.tether.show(true);
        break;
      case 'stealth':
        this.stealthMats = this.rig.materials.map((m) => ({ m, transparent: m.transparent, opacity: m.opacity }));
        for (const { m } of this.stealthMats) {
          m.transparent = true;
          m.needsUpdate = true;
        }
        break;
      case 'xray':
        this.xrayGhost.visible = true;
        this.matRing.mesh.visible = true;
        break;
      case 'spool':
        if (this.o.drone.slug === 'sentinel') this.streaks.show(true);
        break;
    }
  }

  private stopDemo() {
    const d = this.demo;
    this.demo = null;
    this.demoOffset.set(0, 0, 0);
    this.demoRpm = null;
    if (!d) return;
    this.o.callouts.hide('x-track');
    this.exploreTarget?.show(false);
    this.cone.show(false);
    this.lookTarget = null;
    this.points.show(false);
    this.streaks.show(false);
    this.ghostsOn = false;
    this.tether.show(false);
    this.xrayGhost.visible = false;
    this.matRing.mesh.visible = false;
    this.o.store.setState({ gpsDenied: false });
    if (this.stealthMats) {
      for (const { m, transparent, opacity } of this.stealthMats) {
        m.transparent = transparent;
        m.opacity = opacity;
        m.needsUpdate = true;
      }
      this.stealthMats = null;
    }
  }

  private updateDemo(dt: number) {
    const d = this.demo;
    if (!d) return;
    d.t += dt;
    const p = clamp(d.t / d.dur, 0, 1);
    const r = this.rig.root.position;
    switch (d.action) {
      case 'track': {
        const progress = clamp((d.t - 0.6) / 1.4, 0, 1);
        const locked = progress >= 1;
        this.exploreTarget?.update(dt, [{ id: 'x1', kind: 'vehicle', label: 'Vehicle', x: 0, z: 0, progress, locked, inView: true }]);
        if (locked && !d.flags.has('locked')) {
          d.flags.add('locked');
          this.o.audio.blip('lock');
          this.o.haptic(20);
          const item = this.exploreTarget?.items[0];
          this.o.callouts.show(
            'x-track',
            'Vehicle · locked',
            'Onboard AI · confidence 0.94',
            (out) => (item ? item.labelAnchor.getWorldPosition(out) : out.set(0, -1000, 0)),
            'right',
          );
        }
        break;
      }
      case 'spool':
        this.demoRpm = p < 0.15 ? 0.85 + (p / 0.15) * 0.15 : p > 0.75 ? 1 - ((p - 0.75) / 0.25) * 0.15 : 1;
        this.demoOffset.set(0, Math.sin(Math.PI * p) * 0.14, 0);
        break;
      case 'xray': {
        const m = this.xrayGhost.userData.material as MeshBasicMaterial;
        m.opacity = Math.sin(Math.PI * p) * 0.4;
        this.matRing.mesh.position.set(r.x, r.y + this.rig.height * (1 - p), r.z);
        (this.matRing.mesh.material as MeshBasicMaterial).opacity = Math.sin(Math.PI * p) * 0.9;
        break;
      }
      case 'stealth': {
        const k = 1 - 0.75 * Math.sin(Math.PI * p);
        for (const s of this.stealthMats ?? []) s.m.opacity = s.opacity * k;
        this.demoRpm = 0.85 - 0.3 * Math.sin(Math.PI * p);
        break;
      }
      case 'map':
        this.demoOffset.set(Math.sin(d.t * 1.8) * 0.7, 0, Math.sin(d.t * 0.9) * 0.25);
        if (this.grid) this.grid.paint(nadirFootprint(r.x, r.y, r.z));
        break;
      case 'tether':
        this.tether.update(dt, tmpV.set(r.x, r.y + 0.03, r.z), r.x + 0.4, r.z + 0.35);
        break;
    }
    if (d.t >= d.dur) {
      // Keep the painted survey patch visible after the map demo; everything else resets.
      const keepTiles = d.action === 'map';
      this.stopDemo();
      if (keepTiles) this.tiles?.show(true);
      this.o.store.setState({ hotspot: null });
      this.o.hotspots.setState(null, this.o.store.getState().explored);
    }
  }

  // ── SequenceFx ───────────────────────────────────────────────────────────────────

  caption(index: string, title: string, body: string) {
    this.o.store.setState({ caption: { index, title, body } });
  }

  private resolveAnchor(anchor: CalloutAnchor): (out: Vector3) => void {
    if (anchor === 'drone') return (out) => this.rig.root.localToWorld(out.set(0, this.rig.height + 0.08, 0));
    if (anchor === 'gimbal') return (out) => this.rig.gimbal.getWorldPosition(out);
    if (Array.isArray(anchor)) return (out) => this.booth.localToWorld(out.set(anchor[0], anchor[1], anchor[2]));
    const item =
      'missionTarget' in anchor ? this.missionTargets?.items[anchor.missionTarget] : this.demoTargetsFx?.items[anchor.target];
    return (out) => {
      if (item) item.labelAnchor.getWorldPosition(out);
      else out.set(0, -1000, 0);
    };
  }

  callout(id: string, title: string, body: string, anchor: CalloutAnchor, side: 'left' | 'right' = 'right') {
    this.o.callouts.show(id, title, body, this.resolveAnchor(anchor), side);
  }

  hideCallout(id: string) {
    this.o.callouts.hide(id);
  }

  scan() {
    if (this.mode === 'floor') {
      this.padFx.show(true);
      this.padFx.group.position.set(0, 0.004, 0.9);
      return;
    }
    const t = this.scanTarget;
    this.booth.remove(this.scanSweep.mesh);
    this.scanSweep = new ScanSweep(t.sizeM[0], t.sizeM[1]);
    this.scanSweep.mesh.position.set(t.centerM[0], t.centerM[1], 0.015);
    this.booth.add(this.scanSweep.mesh);
    this.scanSweep.play();
  }

  pad(on: boolean) {
    this.padFx.show(on);
    if (on) {
      const future = samplePath(this.seq.path, Math.min(this.seq.duration, this.seqTime + 3));
      this.padFx.group.position.set(future.x, 0.004, future.z);
    }
  }

  materialize(seconds: number) {
    this.rig.root.visible = true;
    this.matT = 0;
    this.matDur = seconds;
    this.matRing.mesh.visible = true;
  }

  rpm(value: number, seconds: number) {
    this.rpmFrom = this.rig.rpm;
    this.rpmTo = value;
    this.rpmT = 0;
    this.rpmDur = Math.max(0.01, seconds);
  }

  altitude(from: number, to: number, seconds: number) {
    this.alt = { from, to, dur: seconds, t: 0 };
  }

  hideAltitude() {
    this.alt = null;
    this.o.store.setState({ altitude: null });
  }

  climbStreaks(on: boolean) {
    this.streaks.show(on);
  }

  gimbal(on: boolean) {
    this.cone.show(on);
  }

  gimbalLook(target: number | null) {
    const t = target !== null ? this.seq.demoTargets?.[target] : null;
    this.lookTarget = t ? new Vector3(t.x, 0, t.z) : null;
  }

  demoTargets(on: boolean) {
    this.demoTargetsFx?.show(on);
  }

  gpsDenied(on: boolean) {
    this.o.store.setState({ gpsDenied: on });
  }

  featurePoints(on: boolean) {
    this.points.show(on);
  }

  surveyTiles(on: boolean) {
    this.tiles?.show(on);
  }

  surveyAutoPaint(on: boolean) {
    this.autoPaint = on;
  }

  terrain(on: boolean) {
    this.terrainFx?.show(on);
  }

  ghosts(on: boolean) {
    this.ghostsOn = on;
    if (on) for (const g of this.ghostRigs) g.position.copy(this.rig.root.position);
  }

  sound(kind: 'scan' | 'lock' | 'beat') {
    this.o.audio.blip(kind);
  }

  // ── Per-frame ────────────────────────────────────────────────────────────────────

  /** Heading of the phone camera in booth space (for camera-relative sticks). */
  private cameraHeading(): number {
    const { camera } = this.o.handles;
    camera.getWorldDirection(tmpV);
    this.booth.getWorldQuaternion(tmpQ).invert();
    tmpV.applyQuaternion(tmpQ);
    if (Math.hypot(tmpV.x, tmpV.z) > 0.15) this.controlHeading = Math.atan2(tmpV.x, tmpV.z);
    return this.controlHeading;
  }

  /** World-space drone position (preview camera follow). */
  droneWorldPosition(out: Vector3) {
    return this.rig.root.getWorldPosition(out);
  }

  update(dt: number) {
    this.time += dt;
    const { camera, canvas } = this.o.handles;

    if (this.phase === 'placing') this.updatePlacement();
    this.reticle.update(dt);
    this.updateLighting(dt);

    if (this.anchored) {
      if (this.phase === 'sequence') this.updateSequence(dt);
      else if (this.phase === 'explore') this.updateExplore(dt);
      else if (this.phase === 'flight' || this.phase === 'mission' || this.phase === 'result') this.updateFlight(dt);
      this.updateEffects(dt);
    }

    // Rotor sound falls off with distance from the phone.
    const dist = this.rig.root.getWorldPosition(tmpV).distanceTo(camera.getWorldPosition(tmpV2)) / (this.pose.scale || 1);
    this.o.audio.setRotor(this.rig.root.visible ? this.rig.rpm : 0, dist);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.o.callouts.update(camera, w, h);
    this.o.hotspots.update(camera, w, h);
  }

  private updateSequence(dt: number) {
    this.seqTime += dt;
    const cues = this.seq.cues;
    while (this.cueIndex < cues.length && cues[this.cueIndex].t <= this.seqTime) cues[this.cueIndex++].run(this);

    samplePath(this.seq.path, this.seqTime, this.sample);
    const s = this.sample;
    const airborne = s.y > 0.05;
    this.rig.root.position.set(s.x, s.y + (airborne ? Math.sin(this.time * 2.1) * 0.012 : 0), s.z);
    this.rig.root.rotation.y = s.yaw;
    const h = headingVectors(s.yaw);
    const vf = s.vx * h.fx + s.vz * h.fz;
    const vr = s.vx * h.rx + s.vz * h.rz;
    const k = 1 - Math.exp(-dt * 5);
    this.rig.tilt.rotation.x += (clamp(vf * 0.2, -0.4, 0.4) - this.rig.tilt.rotation.x) * k;
    this.rig.tilt.rotation.z += (clamp(vr * 0.2, -0.4, 0.4) - this.rig.tilt.rotation.z) * k;

    if (this.rpmT < 1) {
      this.rpmT = Math.min(1, this.rpmT + dt / this.rpmDur);
      this.rig.rpm = this.rpmFrom + (this.rpmTo - this.rpmFrom) * this.rpmT;
    }

    // Materialise: a clipping plane rises through the drone with a lime ring on it.
    if (this.matT >= 0) {
      this.matT += dt;
      const p = Math.min(1, this.matT / this.matDur);
      const eased = 1 - (1 - p) ** 3;
      const hLocal = eased * (this.rig.height + 0.05);
      const worldH = this.rig.root.localToWorld(tmpV.set(0, hLocal, 0));
      const n = tmpV2.set(0, -1, 0).applyQuaternion(this.booth.getWorldQuaternion(tmpQ));
      this.clipPlane.setFromNormalAndCoplanarPoint(n, worldH);
      this.matRing.mesh.position.set(s.x, hLocal, s.z);
      (this.matRing.mesh.material as MeshBasicMaterial).opacity = 0.9 * (1 - p * p);
      if (p >= 1) this.revealAll();
    }

    if (this.alt) {
      this.alt.t = Math.min(this.alt.dur, this.alt.t + dt);
      const p = this.alt.t / this.alt.dur;
      const v = this.alt.from + (this.alt.to - this.alt.from) * (1 - (1 - p) ** 2);
      const label = p >= 1 ? `${this.alt.to.toLocaleString('en-IN')} m+` : `${(Math.round(v / 50) * 50).toLocaleString('en-IN')} m`;
      this.o.store.setState({ altitude: label });
    }

    if (this.autoPaint && this.grid) this.grid.paint(nadirFootprint(s.x, s.y, s.z));

    if (this.seqTime >= this.seq.duration) this.startExplore();
  }

  private updateExplore(dt: number) {
    this.exploreT = Math.min(1, this.exploreT + dt / 1.6);
    const e = ease(this.exploreT);
    const target = tmpV.copy(EXPLORE_POS).add(this.demoOffset);
    const goal = this.exploreT < 1 ? tmpV2.copy(this.exploreFrom).lerp(target, e) : target;
    const r = this.rig.root;
    r.position.lerp(goal, 1 - Math.exp(-dt * 6));
    const dy = Math.atan2(Math.sin(this.exploreYaw - r.rotation.y), Math.cos(this.exploreYaw - r.rotation.y));
    r.rotation.y += dy * (1 - Math.exp(-dt * 2.5));
    const k = 1 - Math.exp(-dt * 4);
    this.rig.tilt.rotation.x -= this.rig.tilt.rotation.x * k;
    this.rig.tilt.rotation.z -= this.rig.tilt.rotation.z * k;
    const rpm = this.demoRpm ?? 0.85;
    this.rig.rpm += (rpm - this.rig.rpm) * (1 - Math.exp(-dt * 5));
    this.updateDemo(dt);
  }

  private updateFlight(dt: number) {
    const sticks = this.phase === 'result' ? IDLE_STICKS : this.o.sticks;
    const pro = this.o.store.getState().proControls;
    const heading = pro ? this.flight.yaw : this.cameraHeading();
    this.flight.step(dt, sticks, heading);
    const f = this.flight;
    const airborne = !f.landed;
    this.rig.root.position.set(f.position.x, f.position.y + (airborne ? Math.sin(this.time * 2.1) * 0.01 : 0), f.position.z);
    this.rig.root.rotation.y = f.yaw;
    this.rig.tilt.rotation.x = f.pitch;
    this.rig.tilt.rotation.z = f.roll;
    const speed = f.velocity.length() / f.params.maxSpeedH;
    const target = f.landed ? 0.3 : clamp(0.72 + speed * 0.18 + Math.max(0, sticks.ly) * 0.1, 0, 1);
    this.rig.rpm += (target - this.rig.rpm) * (1 - Math.exp(-dt * 4));

    if (f.atBoundary) this.boundaryTimer = 1.5;
    this.boundaryTimer = Math.max(0, this.boundaryTimer - dt);
    this.o.store.setState({ boundaryWarning: this.boundaryTimer > 0 });

    if (this.phase === 'mission') this.updateMission(dt);
  }

  private footprint(): Footprint {
    const p = this.rig.root.position;
    return this.o.drone.mission === 'lockon'
      ? gimbalFootprint(p.x, p.y, p.z, this.rig.root.rotation.y)
      : nadirFootprint(p.x, p.y, p.z);
  }

  private altitudeHint(fp: Footprint): string | null {
    if (fp.valid) return null;
    return this.rig.root.position.y < 1 ? 'Climb higher to use the sensor' : 'Too high — descend a little';
  }

  /** Mission HUD only changes a few times a second; avoid re-rendering React every frame. */
  private publishMission(m: MissionHud) {
    const key = `${m.type}|${m.timeLeft}|${m.value}|${m.goal}|${m.hint}`;
    if (key === this.missionKey) return;
    this.missionKey = key;
    this.o.store.setState({ mission: m });
  }

  private updateMission(dt: number) {
    const fp = this.footprint();
    if (this.lockon) {
      const m = this.lockon;
      for (const e of m.update(dt, fp)) {
        if (e.type === 'acquire') this.o.audio.blip('acquire');
        if (e.type === 'lock') {
          const i = m.targets.findIndex((t) => t.id === e.id);
          const t = m.targets[i];
          this.o.audio.blip('lock');
          this.o.haptic(25);
          this.callout(`m-${e.id}`, `${t.label} locked`, 'Onboard AI · tracking', { missionTarget: i }, i % 2 ? 'left' : 'right');
          this.o.track('target_locked', { target: e.id });
        }
        if (e.type === 'complete') return this.finishMission(e.success, m.lockedCount, m.targets.length, m.elapsed);
      }
      const hint = this.altitudeHint(fp) ?? (m.targets.some((t) => t.inView) ? 'Hold steady…' : 'Find the orange markers around the booth');
      this.publishMission({ type: 'lockon', timeLeft: Math.ceil(m.timeLeft), value: m.lockedCount, goal: m.targets.length, hint });
    } else if (this.survey) {
      const m = this.survey;
      const tooFast = Math.hypot(this.flight.velocity.x, this.flight.velocity.z) > SURVEY_MAX_SPEED;
      const { fresh, events } = m.update(dt, tooFast ? { ...fp, valid: false } : fp);
      if (fresh.length && this.time - this.lastPaintBlip > 0.12) {
        this.lastPaintBlip = this.time;
        this.o.audio.blip('ui');
      }
      const pct = Math.round(m.grid.coverage * 100);
      for (const e of events) {
        if (e.type === 'complete') return this.finishMission(e.success, pct, Math.round(m.goal * 100), m.elapsed);
      }
      this.publishMission({
        type: 'survey',
        timeLeft: Math.ceil(m.timeLeft),
        value: pct,
        goal: Math.round(m.goal * 100),
        hint: this.altitudeHint(fp) ?? (tooFast ? 'Slow down — the sensor needs a steady pass' : null),
      });
    }
  }

  private updateEffects(dt: number) {
    const r = this.rig.root.position;
    this.rig.update(dt);
    this.shadow.update(r.x, r.z, r.y, this.rig.root.visible);
    this.scanSweep.update(dt);
    this.padFx.update(dt);
    this.streaks.update(dt, r);
    this.points.update(dt);
    this.terrainFx?.update(dt);
    this.tiles?.update(dt);
    this.demoTargetsFx?.update(dt, null);
    if (this.demo?.action !== 'track') this.exploreTarget?.update(dt, null);
    this.missionTargets?.update(dt, this.lockon?.targets ?? null);

    // Sensor cone: scripted look-at (sequence / Explore demo) or the real footprint.
    let fx: number;
    let fz: number;
    let fr: number;
    let valid = true;
    if (this.lookTarget) {
      this.lookPos.lerp(this.lookTarget, 1 - Math.exp(-dt * 4));
      fx = this.lookPos.x;
      fz = this.lookPos.z;
      fr = 0.32;
    } else {
      const fp = this.footprint();
      fx = fp.x;
      fz = fp.z;
      fr = fp.r;
      valid = fp.valid || this.phase === 'sequence' || this.phase === 'explore';
      this.lookPos.set(fx, 0, fz);
    }
    const apex = this.booth.worldToLocal(this.rig.gimbal.getWorldPosition(tmpV2));
    this.cone.update(dt, apex, fx, fz, fr, valid);

    // Ghost wingmen trail the drone in a loose V.
    const target = this.ghostsOn ? 1 : 0;
    this.ghostFade += (target - this.ghostFade) * (1 - Math.exp(-dt * 3));
    const h = headingVectors(this.rig.root.rotation.y);
    for (const g of this.ghostRigs) {
      const side = g.userData.side as number;
      const goal = tmpV.set(r.x + h.rx * side * 0.95 - h.fx * 0.45, r.y + 0.1, r.z + h.rz * side * 0.95 - h.fz * 0.45);
      g.position.lerp(goal, 1 - Math.exp(-dt * 2.5));
      g.rotation.y = this.rig.root.rotation.y;
      (g.userData.material as MeshBasicMaterial).opacity = 0.2 * this.ghostFade;
      g.visible = this.ghostFade > 0.01;
    }
  }

  /** The model group, e.g. for the Quick Look USDZ export. */
  get droneModel() {
    return this.rig.model;
  }

  dispose() {
    this.stopDemo();
    this.o.handles.scene.remove(this.booth, this.reticle.group);
    this.o.callouts.dispose();
    this.o.hotspots.dispose();
  }
}
