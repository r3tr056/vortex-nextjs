// Glue between the AR session, the 3D world, audio, analytics and the React HUD.
//
// Engine choice (best native AR first):
//   Android Chrome with ARCore → WebXR (ARCore tracking, QR anchoring, anchors, light estimation)
//   iPhone / other phones      → 8th Wall (in-browser SLAM + standee image targets); on iOS, AR
//                                Quick Look (native ARKit) is offered alongside
//   Desktop / no camera        → 3D preview
// If ARCore refuses to start, the controller falls back to 8th Wall automatically.

import { Vector3 } from 'three';
import type { ArDrone } from './config/drones';
import type { Sticks } from './core/flight.ts';
import type { FilterResult } from './core/anchor.ts';
import { createArStore, type AnchorMode, type ArState, type ArStore, type Platform } from './core/store.ts';
import { RotorAudio } from './audio/rotor';
import { Tracker, type Detail } from './analytics';
import { openQuickLook } from './engine/quicklook';
import type { ArSession, EngineKind, ImageEvent, MarkerEvent, SessionErrorKind, SessionHandles } from './engine/types';
import { ExperienceWorld, type PlaceKind } from './scene/world';
import { CalloutLayer } from './ui/callouts';
import { HotspotLayer } from './ui/hotspots';
import { composeSharePhoto, shareOrDownload } from './share';
import { isInAppBrowser } from './platform';

export type StartMode = 'ar' | 'preview';

const TRACKING_HINTS: Record<string, string> = {
  TOO_MUCH_MOTION: 'Move your phone a little slower',
  NOT_ENOUGH_TEXTURE: 'Point at a more detailed area',
  RELOCALIZING: 'Re-finding the booth… hold steady',
};

export function initialArState(drone: ArDrone, platform: Platform): ArState {
  return {
    slug: drone.slug,
    phase: 'intro',
    engine: null,
    capabilities: null,
    quickLookReady: false,
    placeKind: 'standee',
    photo: 'idle',
    notice: null,
    anchorMode: null,
    platform,
    loadProgress: 0,
    caption: null,
    altitude: null,
    gpsDenied: false,
    mission: null,
    result: null,
    trackingWarning: null,
    boundaryWarning: false,
    scanElapsed: 0,
    placeReady: false,
    hotspot: null,
    explored: [],
    muted: false,
    proControls: false,
    ctaOpen: false,
    error: null,
  };
}

export interface Surfaces {
  canvas: HTMLCanvasElement;
  /** Full-screen HUD root: the WebXR DOM overlay. */
  overlay: HTMLElement;
  callouts: HTMLElement;
  hotspots: HTMLElement;
}

export class ArController {
  readonly store: ArStore;
  readonly sticks: Sticks = { lx: 0, ly: 0, rx: 0, ry: 0 };
  private readonly audio = new RotorAudio();
  private tracker: Tracker | null = null;
  private session: ArSession | null = null;
  private world: ExperienceWorld | null = null;
  private callouts: CalloutLayer | null = null;
  private hotspots: HotspotLayer | null = null;
  private engine: EngineKind = 'preview';
  private webxrSupported = false;
  private capsKnown = false;
  private targetsAvailable = false;
  private scanStart = 0;
  private disposed = false;
  /** Incremented per start/reset; async work from an older run is ignored. */
  private run = 0;
  private replacing = false;
  private usdzUrl: string | null = null;
  private noticeTimer = 0;
  private photoTimer = 0;
  private rescanTimer = 0;
  private readonly follow = new Vector3();
  /** Debug/demo: `?mode=3d` forces the 3D preview on phones. */
  forcePreview = false;

  constructor(
    readonly drone: ArDrone,
    readonly platform: Platform,
  ) {
    this.store = createArStore(initialArState(drone, platform));
  }

  /** Starts analytics, capability checks and cache warming. Re-entrant (StrictMode). */
  mount() {
    this.disposed = false;
    const params = new URLSearchParams(window.location.search);
    this.forcePreview = params.get('mode') === '3d';
    this.tracker = new Tracker({ drone: this.drone.slug, platform: this.platform, src: params.get('src') });
    this.tracker.track('page_open', { inApp: isInAppBrowser() });
    void this.detectCapabilities();
  }

  get state() {
    return this.store.getState();
  }

  private track = (event: string, detail?: Detail) => this.tracker?.track(event, detail);

  private haptic = (pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate?.(pattern);
  };

  private async detectCapabilities() {
    void fetch(this.drone.model.url).catch(() => {});
    if (this.platform === 'desktop') return;
    for (const t of this.drone.standee.targets) void fetch(t.dataUrl).catch(() => {});
    const { isWebXrArSupported } = await import('./engine/webxr');
    this.webxrSupported = this.platform !== 'ios' && (await isWebXrArSupported());
    this.capsKnown = true;
    this.track('capabilities', { webxr: this.webxrSupported });
    // Warm the engine this device will use.
    if (!this.webxrSupported) void import('./engine/xr8').then((m) => m.preloadEngine()).catch(() => {});
    if (this.platform === 'ios') void this.prepareQuickLook();
  }

  /** iOS: build the Quick Look USDZ in the background so the tap can open it instantly. */
  private async prepareQuickLook() {
    try {
      const { isQuickLookSupported, buildUsdz } = await import('./engine/quicklook');
      if (!isQuickLookSupported()) return;
      const { DroneRig } = await import('./scene/drone');
      const rig = await DroneRig.create({ slug: this.drone.slug, model: this.drone.model });
      if (this.disposed) return rig.dispose();
      const url = await buildUsdz(rig.model);
      rig.dispose();
      if (this.disposed) return URL.revokeObjectURL(url);
      this.usdzUrl = url;
      this.store.setState({ quickLookReady: true });
    } catch (err) {
      console.warn('[ar] Quick Look model unavailable', err);
    }
  }

  setStick(side: 'left' | 'right', x: number, y: number) {
    if (side === 'left') {
      this.sticks.lx = x;
      this.sticks.ly = y;
    } else {
      this.sticks.rx = x;
      this.sticks.ry = y;
    }
  }

  releaseSticks() {
    this.sticks.lx = this.sticks.ly = this.sticks.rx = this.sticks.ry = 0;
  }

  /** Any HUD tap: recovers audio that iOS interrupted. */
  touch() {
    this.audio.resume();
  }

  // ── Start ──────────────────────────────────────────────────────────────────────────

  /** Must be called synchronously from the Start tap (WebXR session, iOS motion, audio). */
  start(mode: StartMode, surfaces: Surfaces) {
    // A double tap must not open a second camera / XR session.
    if (this.session || this.state.phase === 'starting') return;
    const run = ++this.run;
    this.audio.unlock();
    const preview = mode === 'preview' || this.forcePreview;
    // A tap that beats the capability check on Android still tries ARCore first; if the request
    // is refused, boot() falls back to 8th Wall.
    const tryWebXr = this.webxrSupported || (!this.capsKnown && this.platform === 'android' && !!navigator.xr);

    let xrSession: Promise<XRSession> | null = null;
    let motion: Promise<unknown> | null = null;
    if (preview) {
      this.engine = 'preview';
    } else if (tryWebXr) {
      this.engine = 'webxr';
      xrSession = this.requestXrSession(surfaces.overlay);
    } else {
      this.engine = 'xr8';
      motion = this.requestMotion();
    }
    this.store.setState({ phase: 'starting', error: null, engine: this.engine });
    this.track('start', { engine: this.engine });
    void this.boot(run, surfaces, xrSession, motion);
  }

  /** Inlined (not behind a dynamic import) so the request happens inside the tap. */
  private requestXrSession(overlay: HTMLElement): Promise<XRSession> | null {
    if (!navigator.xr) return null;
    // No depth-sensing: see engine/webxr.ts (three's occlusion can't use ARCore depth).
    return navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'anchors', 'light-estimation', 'camera-access'],
      domOverlay: { root: overlay },
    } as XRSessionInit);
  }

  private requestMotion(): Promise<unknown> | null {
    const w = window as unknown as {
      DeviceMotionEvent?: { requestPermission?: () => Promise<string> };
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
    };
    const reqs: Promise<unknown>[] = [];
    if (typeof w.DeviceMotionEvent?.requestPermission === 'function') reqs.push(w.DeviceMotionEvent.requestPermission().catch(() => 'denied'));
    if (typeof w.DeviceOrientationEvent?.requestPermission === 'function') reqs.push(w.DeviceOrientationEvent.requestPermission().catch(() => 'denied'));
    return reqs.length ? Promise.all(reqs) : null;
  }

  private stale(run: number) {
    return this.disposed || run !== this.run;
  }

  private async boot(run: number, s: Surfaces, xrSession: Promise<XRSession> | null, motion: Promise<unknown> | null): Promise<void> {
    try {
      if (motion) {
        const results = (await motion) as string[];
        if (results.some((r) => r === 'denied')) return this.fail('camera-denied', 'Motion access was blocked.');
      }
      this.callouts?.dispose();
      this.hotspots?.dispose();
      this.callouts = new CalloutLayer(s.callouts);
      this.hotspots = new HotspotLayer(s.hotspots, (id) => this.selectHotspot(id));
      const session = await this.createSession(run, xrSession);
      if (!session) return;
      if (this.stale(run)) return session.stop();
      this.session = session;
      // Every callback is bound to this run and this session: late events from a stopped or
      // replaced session (a slow model load, an engine exception) never touch the current one.
      const live = () => !this.stale(run) && this.session === session;
      await session.start(s.canvas, {
        onReady: (h) => {
          if (!live()) return;
          this.onReady(run, h).catch((err) => {
            if (live()) this.fail('engine', err instanceof Error ? err.message : String(err));
          });
        },
        onFrame: (dt) => {
          if (live()) this.onFrame(dt);
        },
        onImageFound: (e) => {
          if (live()) this.onImage(e);
        },
        onImageUpdated: (e) => {
          if (live()) this.onImage(e);
        },
        onMarker: (e) => {
          if (live()) this.onMarker(e);
        },
        onAnchor: (p, yaw) => {
          if (live()) this.world?.onNativeAnchor(p, yaw);
        },
        onLighting: (e) => {
          if (live()) this.world?.setLighting(e);
        },
        onTracking: (status, reason) => {
          if (live()) this.store.setState({ trackingWarning: status === 'LIMITED' ? TRACKING_HINTS[reason] ?? null : null });
        },
        onEnded: () => {
          if (live()) this.onSessionEnded();
        },
        onError: (kind, message) => {
          if (live()) this.fail(kind, message);
        },
      });
    } catch (err) {
      if (this.stale(run)) return;
      const message = err instanceof Error ? err.message : String(err);
      if (this.engine === 'webxr') {
        // ARCore declined (not installed, permission, device quirk): fall back to 8th Wall.
        this.track('webxr_failed', { message: message.slice(0, 80) });
        if (this.session) this.session.stop();
        else xrSession?.then((x) => x.end()).catch(() => {});
        this.session = null;
        this.engine = 'xr8';
        this.store.setState({ engine: 'xr8' });
        return this.boot(run, s, null, null);
      }
      this.fail('engine', message);
    }
  }

  private async createSession(run: number, xrSession: Promise<XRSession> | null): Promise<ArSession | null> {
    if (this.engine === 'webxr') {
      if (!xrSession) throw new Error('WebXR session unavailable');
      const { WebXrSession } = await import('./engine/webxr');
      return new WebXrSession(xrSession, this.drone.standee.qr);
    }
    if (this.engine === 'xr8') {
      const xr8 = await import('./engine/xr8');
      const compat = await xr8.isArCompatible();
      if (this.stale(run)) return null;
      if (!compat.ok) {
        this.fail('unsupported', compat.reasons.join(', '));
        return null;
      }
      const data = await this.loadTargets();
      if (this.stale(run)) return null;
      this.targetsAvailable = data.length > 0;
      if (data.length < this.drone.standee.targets.length) {
        this.track('targets_partial', { loaded: data.length, of: this.drone.standee.targets.length });
        if (!data.length) this.notify('Standee recognition didn’t load — place the drone by hand');
      }
      return new xr8.Xr8Session(data);
    }
    const { PreviewSession } = await import('./engine/preview');
    return new PreviewSession({ image: this.drone.standee.previewImage, sizeM: this.drone.standee.printSizeM });
  }

  /** Standee image-target definitions, each retried once (busy hall networks drop requests). */
  private async loadTargets(): Promise<unknown[]> {
    const get = (url: string) =>
      fetch(url).then((r) => (r.ok ? (r.json() as Promise<unknown>) : Promise.reject(new Error(`HTTP ${r.status}`))));
    const retry = (url: string) =>
      get(url).catch(() => new Promise((r) => window.setTimeout(r, 700)).then(() => get(url)).catch(() => null));
    const results = await Promise.all(this.drone.standee.targets.map((t) => retry(t.dataUrl)));
    return results.filter((d): d is NonNullable<typeof d> => d !== null);
  }

  private async onReady(run: number, handles: SessionHandles) {
    const initialMode: AnchorMode = this.engine === 'preview' ? 'preview' : 'standee';
    const world = await ExperienceWorld.create({
      handles,
      drone: this.drone,
      mode: initialMode,
      store: this.store,
      audio: this.audio,
      callouts: this.callouts!,
      hotspots: this.hotspots!,
      sticks: this.sticks,
      track: this.track,
      haptic: this.haptic,
      onProgress: (p) => this.store.setState({ loadProgress: p }),
    });
    if (this.stale(run)) return world.dispose();
    this.world = world;
    const caps = this.session?.capabilities() ?? null;
    this.store.setState({ capabilities: caps });
    this.track('ready', { engine: this.engine, occlusion: !!caps?.depthOcclusion, qr: !!caps?.markerTracking });

    if (this.engine === 'preview') {
      world.setBoothPose({ position: new Vector3(), yaw: 0, scale: 1 }, true);
      this.setAnchored('preview');
      world.startSequence();
      return;
    }
    if (this.canScan()) {
      this.session?.setMarkerScanning?.(true);
      this.scanStart = performance.now();
      this.store.setState({ phase: 'scanning', scanElapsed: 0 });
    } else {
      this.placeManually('standee');
    }
  }

  private canScan() {
    return this.engine === 'webxr' ? !!this.state.capabilities?.markerTracking : this.engine === 'xr8' && this.targetsAvailable;
  }

  private setAnchored(mode: AnchorMode, detail?: Detail) {
    if (this.tracker) this.tracker.anchorMode = mode;
    this.store.setState({ anchorMode: mode });
    this.track('anchored', { mode, engine: this.engine, ...detail });
  }

  private handleFilterResult(r: FilterResult | null, detail: Detail) {
    const world = this.world;
    if (!world || !r) return;
    window.clearTimeout(this.rescanTimer);
    if (r === 'locked' && this.state.phase === 'scanning') {
      world.setAnchorMode('standee');
      this.session?.setBoothAnchor?.(world.boothPose);
      this.session?.setMarkerScanning?.(false);
      this.setAnchored('standee', { ...detail, secs: Math.round((performance.now() - this.scanStart) / 1000) });
      this.haptic(20);
      world.startSequence();
    } else if (r === 'locked' || r === 'relocked') {
      this.session?.setBoothAnchor?.(world.boothPose);
      this.session?.setMarkerScanning?.(false);
      this.notify('Re-aligned to the standee');
      this.track('realigned', detail);
    }
  }

  private onImage(e: ImageEvent) {
    if (!this.world || this.state.phase === 'placing' || this.state.anchorMode === 'floor') return;
    this.handleFilterResult(this.world.offerImage(e), { source: 'image', target: e.name });
  }

  private onMarker(e: MarkerEvent) {
    if (!this.world || this.state.phase === 'placing' || this.state.anchorMode === 'floor') return;
    this.handleFilterResult(this.world.offerMarker(e), { source: 'qr' });
  }

  private onFrame(dt: number) {
    const world = this.world;
    if (!world) return;
    world.update(dt);
    if (this.state.phase === 'scanning') {
      this.store.setState({ scanElapsed: Math.floor((performance.now() - this.scanStart) / 1000) });
    }
    if (this.engine === 'preview' && this.session && 'setOrbitTarget' in this.session) {
      world.droneWorldPosition(this.follow);
      this.follow.y = Math.max(0.6, this.follow.y * 0.7);
      (this.session as { setOrbitTarget: (v: Vector3, k: number) => void }).setOrbitTarget(this.follow, 1 - Math.exp(-dt * 1.5));
    }
  }

  private onSessionEnded() {
    // The visitor left AR (Android back button). Return to the intro so they can re-enter.
    this.track('session_ended');
    this.reset();
  }

  private notify(text: string) {
    window.clearTimeout(this.noticeTimer);
    this.store.setState({ notice: text });
    this.noticeTimer = window.setTimeout(() => this.store.setState({ notice: null }), 2600);
  }

  // ── Actions (called from the HUD) ──────────────────────────────────────────────────

  /** Manual anchoring: aim the reticle at the standee's base (or any floor when away). */
  placeManually(kind: PlaceKind) {
    const world = this.world;
    if (!world) return;
    this.session?.setMarkerScanning?.(false);
    this.replacing = !!this.state.anchorMode && this.state.phase !== 'scanning' && this.state.phase !== 'placing';
    world.setAnchorMode(kind === 'floor' ? 'floor' : 'standee');
    world.beginPlacing(kind);
    this.store.setState({ phase: 'placing', placeKind: kind });
    this.track('placing', { kind });
  }

  confirmPlacement() {
    const world = this.world;
    if (!world) return;
    const pose = world.confirmPlacement();
    if (!pose) return;
    this.session?.setBoothAnchor?.(pose);
    const kind = this.state.placeKind;
    this.setAnchored(kind === 'floor' ? 'floor' : 'standee', { source: 'manual' });
    this.haptic(20);
    if (this.replacing) {
      this.replacing = false;
      world.startExplore();
    } else {
      world.startSequence();
    }
  }

  /** Back to scanning from manual placement (e.g. the visitor found the standee after all). */
  backToScanning() {
    if (!this.world || !this.canScan()) return;
    this.world.cancelPlacing();
    this.world.requestReanchor();
    this.session?.setMarkerScanning?.(true);
    this.scanStart = performance.now();
    this.store.setState({ phase: 'scanning', scanElapsed: 0 });
  }

  /** Re-align: scan the standee again (keeps the experience running meanwhile). */
  reanchor() {
    const world = this.world;
    if (!world) return;
    if (this.canScan() && this.state.anchorMode === 'standee') {
      world.requestReanchor();
      this.session?.setMarkerScanning?.(true);
      this.notify(this.engine === 'webxr' ? 'Point at the QR code on the standee' : 'Point at the standee to re-align');
      // Scanning costs a camera readback every 300 ms: stop if no sighting comes in.
      window.clearTimeout(this.rescanTimer);
      this.rescanTimer = window.setTimeout(() => {
        if (this.state.phase !== 'scanning') this.session?.setMarkerScanning?.(false);
      }, 15_000);
    } else {
      this.placeManually(this.state.anchorMode === 'floor' ? 'floor' : 'standee');
    }
    this.track('reanchor');
  }

  skip() {
    this.world?.skipSequence();
  }

  selectHotspot(id: string | null) {
    this.world?.selectHotspot(id);
  }

  takeControls() {
    this.world?.takeControls();
  }

  backToExplore() {
    this.world?.startExplore();
  }

  startMission() {
    this.world?.startMission();
  }

  flyAgain() {
    this.world?.flyAgain();
    this.track('fly_again');
  }

  retryMission() {
    this.world?.startMission();
    this.track('mission_retry');
  }

  replay() {
    this.world?.replay();
    this.track('replay');
  }

  setMuted(muted: boolean) {
    this.audio.setMuted(muted);
    this.store.setState({ muted });
  }

  setProControls(pro: boolean) {
    this.store.setState({ proControls: pro });
    this.track('controls', { pro });
  }

  setCtaOpen(open: boolean, via?: string) {
    this.store.setState({ ctaOpen: open });
    if (open) this.track('cta_open', { via: via ?? 'menu' });
  }

  trackCta(action: string) {
    this.track('cta_click', { action });
  }

  trackLead(ok: boolean) {
    this.track(ok ? 'lead_submitted' : 'lead_failed');
  }

  /** iOS: open the drone in AR Quick Look (native ARKit). Must be called from a tap. */
  openQuickLook() {
    if (!this.usdzUrl) return;
    openQuickLook(this.usdzUrl, this.drone, () => this.setCtaOpen(true, 'quicklook'));
    this.track('quicklook');
  }

  async capturePhoto() {
    window.clearTimeout(this.photoTimer);
    this.store.setState({ photo: 'working' });
    let result: 'shared' | 'downloaded' | 'cancelled' | 'failed' = 'failed';
    try {
      const shot = await this.session?.screenshot();
      if (shot) result = await shareOrDownload(await composeSharePhoto(shot, this.drone), this.drone);
    } catch {
      result = 'failed';
    }
    this.track('photo', { result, engine: this.engine });
    this.store.setState({ photo: result === 'failed' ? 'failed' : 'done' });
    this.photoTimer = window.setTimeout(() => this.store.setState({ photo: 'idle' }), result === 'failed' ? 4000 : 2200);
  }

  private fail(kind: SessionErrorKind, message: string) {
    const copy: Record<SessionErrorKind, { title: string; body: string }> = {
      'camera-denied': {
        title: 'Camera or motion access is off',
        body: 'AR needs the camera and motion sensors. Allow access in your browser settings, then try again.',
      },
      unsupported: {
        title: 'AR isn’t supported in this browser',
        body: isInAppBrowser()
          ? 'This in-app browser blocks the camera. Open this page in Safari or Chrome to fly the drone in AR.'
          : 'Open this page in Safari (iPhone) or Chrome (Android) to fly the drone in AR.',
      },
      engine: {
        title: 'The AR engine couldn’t start',
        body: 'Check your connection and try again.',
      },
    };
    this.run++;
    window.clearTimeout(this.rescanTimer);
    this.store.setState({ phase: 'error', error: copy[kind] });
    this.track('error', { kind, engine: this.engine, message: message.slice(0, 120) });
    this.world?.dispose();
    this.world = null;
    this.session?.stop();
    this.session = null;
  }

  /** Tear down and return to the intro (after an error or when the AR session ends). */
  reset() {
    this.run++;
    window.clearTimeout(this.rescanTimer);
    this.world?.dispose();
    this.world = null;
    this.session?.stop();
    this.session = null;
    this.releaseSticks();
    const keep = { muted: this.state.muted, explored: this.state.explored, quickLookReady: this.state.quickLookReady };
    this.store.setState({ ...initialArState(this.drone, this.platform), ...keep });
  }

  dispose() {
    this.disposed = true;
    this.run++;
    window.clearTimeout(this.noticeTimer);
    window.clearTimeout(this.photoTimer);
    window.clearTimeout(this.rescanTimer);
    this.tracker?.dispose();
    this.tracker = null;
    this.world?.dispose();
    this.world = null;
    this.session?.stop();
    this.session = null;
    this.releaseSticks();
    this.audio.dispose();
    if (this.usdzUrl) URL.revokeObjectURL(this.usdzUrl);
    this.usdzUrl = null;
  }
}
