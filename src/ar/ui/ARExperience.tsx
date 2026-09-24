'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Box,
  Camera,
  ChevronRight,
  Crosshair,
  Gamepad2,
  LocateFixed,
  Menu,
  Play,
  RotateCcw,
  ScanLine,
  SkipForward,
  Smartphone,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getArDrone, type ArDrone, type DroneSlug } from '../config/drones';
import { ArController } from '../controller';
import type { ArState } from '../core/store.ts';
import { detectPlatform } from '../platform';
import { Attribution, CtaSheet } from './CtaSheet';
import { Joysticks, useKeyboardSticks } from './Joysticks';
import styles from './ar.module.css';

const MANUAL_AFTER = 6;
const SCAN_TIPS = [
  'Hold steady for a moment',
  'Glare on the print? Step a little to one side',
  'Too close? Step back until the standee fits',
  'Keep the standee in good light',
];

function useArState(ctrl: ArController): ArState {
  return useSyncExternalStore(ctrl.store.subscribe, ctrl.store.getState, ctrl.store.getState);
}

// ── Intro ───────────────────────────────────────────────────────────────────────────

function Intro({ drone, ctrl, state, onStart }: { drone: ArDrone; ctrl: ArController; state: ArState; onStart: (mode: 'ar' | 'preview') => void }) {
  const desktop = state.platform === 'desktop' && !ctrl.forcePreview;
  return (
    <div className={styles.intro}>
      <div className={styles.introGrid} />
      <div className={styles.introHead}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ar-assets/vortex-wordmark.png" alt="Vortex Autonomous Systems" className={styles.logo} />
        <span className={styles.eyebrowAccent}>Booth AR · {drone.num}</span>
      </div>

      <div className={styles.introVisual} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={drone.standee.previewImage} alt="" />
      </div>

      <div className={styles.introBody}>
        <div>
          <span className={styles.eyebrow}>{drone.role}</span>
          <h1 className={styles.introName}>{drone.name}</h1>
          <p className={styles.introTagline}>{drone.tagline}</p>
        </div>
        <dl className={styles.specs}>
          {drone.specs.map((s) => (
            <div key={s.k} className={styles.specRow}>
              <dt>{s.k}</dt>
              <dd>{s.v}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.introActions}>
          {desktop ? (
            <>
              <button className={styles.primaryBtn} onClick={() => onStart('preview')}>
                <Play size={18} /> Fly it in 3D
              </button>
              <p className={styles.introNote}>
                <Smartphone size={13} style={{ verticalAlign: '-2px' }} /> Open this page on your phone to fly {drone.name} in augmented
                reality, anchored to the Vortex booth.
              </p>
            </>
          ) : (
            <>
              <button className={styles.primaryBtn} onClick={() => onStart('ar')}>
                <ScanLine size={18} /> Launch AR
              </button>
              {state.platform === 'ios' && state.quickLookReady && (
                <button className={styles.ghostBtn} onClick={() => ctrl.openQuickLook()}>
                  <Box size={17} /> Place in your space · native AR
                </button>
              )}
              <p className={styles.introNote}>
                Uses your camera to place a life-size {drone.name} in the real world. Nothing is recorded or uploaded. Sound on for the
                full experience.
              </p>
            </>
          )}
        </div>
        <Attribution />
      </div>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────────────────

function TopRight({ ctrl, state }: { ctrl: ArController; state: ArState }) {
  return (
    <div className={styles.topGroup}>
      {state.capabilities?.photo && (
        <button className={styles.iconBtn} onClick={() => void ctrl.capturePhoto()} aria-label="Take a photo" disabled={state.photo === 'working'}>
          <Camera size={18} />
        </button>
      )}
      <button className={state.muted ? styles.iconBtn : styles.iconBtnOn} onClick={() => ctrl.setMuted(!state.muted)} aria-label={state.muted ? 'Unmute' : 'Mute'}>
        {state.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <button className={styles.pillBtn} onClick={() => ctrl.setCtaOpen(true, 'menu')} aria-label="Book a demo and contact">
        <Menu size={16} /> Demo
      </button>
    </div>
  );
}

function Toasts({ state }: { state: ArState }) {
  const photo =
    state.photo === 'working'
      ? 'Capturing…'
      : state.photo === 'done'
        ? 'Photo ready'
        : state.photo === 'failed'
          ? 'Couldn’t capture — use your phone’s screenshot instead'
          : null;
  const flying = state.phase === 'flight' || state.phase === 'mission';
  const warn = flying ? (state.boundaryWarning ? 'Stay near the booth' : state.trackingWarning) : state.phase === 'scanning' ? state.trackingWarning : null;
  const text = photo ?? state.notice ?? warn;
  if (!text) return null;
  return (
    <div className={styles.toastDock} role="status" aria-live="polite">
      <span className={warn && !photo && !state.notice ? styles.toastWarn : styles.toast}>{text}</span>
    </div>
  );
}

function Starting({ state }: { state: ArState }) {
  const label = state.engine === 'webxr' ? 'Starting ARCore…' : state.engine === 'xr8' ? 'Starting the camera…' : 'Loading the drone…';
  return (
    <div className={styles.center}>
      <div className={styles.statusCard}>
        <div className={styles.spinner} />
        <p className={styles.statusBody}>{label}</p>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${Math.round(state.loadProgress * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Anchoring ───────────────────────────────────────────────────────────────────────

function Scanning({ drone, ctrl, state }: { drone: ArDrone; ctrl: ArController; state: ArState }) {
  const qr = state.engine === 'webxr';
  const tip = SCAN_TIPS[Math.floor(state.scanElapsed / 4) % SCAN_TIPS.length];
  return (
    <>
      <div className={qr ? styles.scanGuideQr : styles.scanGuide} aria-hidden>
        <span className={styles.corner} />
        <span className={styles.corner} />
        <span className={styles.corner} />
        <span className={styles.corner} />
        <span className={styles.scanLine} />
      </div>
      <div className={styles.bottomDock}>
        <div className={styles.hint}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.hintThumb} src={drone.standee.previewImage} alt="" />
          <span>
            {qr ? (
              <>
                Point your camera at the <strong>QR code</strong> on the {drone.name} standee.
              </>
            ) : (
              <>
                Point your camera at the <strong>{drone.name.toUpperCase()}</strong> standee — the whole poster or just the spec panel.
              </>
            )}
            <span className={styles.hintTip}>{tip}</span>
          </span>
        </div>
        {state.scanElapsed >= MANUAL_AFTER && (
          <div className={styles.row}>
            <button className={styles.ghostBtn} onClick={() => ctrl.placeManually('standee')}>
              Place at the standee
            </button>
            <button className={styles.ghostBtn} onClick={() => ctrl.placeManually('floor')}>
              Not at the booth
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Placing({ ctrl, state }: { ctrl: ArController; state: ArState }) {
  const standee = state.placeKind === 'standee';
  const text = state.placeReady
    ? standee
      ? 'Line the ring up with the base of the standee, then tap Set.'
      : 'Tap Place to deploy the drone here.'
    : 'Slowly move your phone and aim at the floor.';
  const canScan = state.engine === 'webxr' ? !!state.capabilities?.markerTracking : state.engine === 'xr8';
  return (
    <div className={styles.bottomDock}>
      <div className={styles.hint}>
        <Crosshair size={18} color="var(--accent)" style={{ flex: 'none' }} />
        <span>{text}</span>
      </div>
      <button className={styles.primaryBtn} disabled={!state.placeReady} onClick={() => ctrl.confirmPlacement()}>
        {standee ? 'Set the booth here' : 'Place here'}
      </button>
      {canScan && state.anchorMode === null && (
        <button className={styles.quietBtn} onClick={() => ctrl.backToScanning()}>
          Scan the standee instead
        </button>
      )}
    </div>
  );
}

// ── Sequence ────────────────────────────────────────────────────────────────────────

function Sequence({ ctrl, state }: { ctrl: ArController; state: ArState }) {
  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.chips}>
          {state.altitude && (
            <span className={styles.chip}>
              Alt <span className={styles.chipValue}>{state.altitude}</span>
            </span>
          )}
          {state.gpsDenied && (
            <span className={styles.chipWarn}>
              <span className={styles.strike}>GNSS</span> Jammed · VIO active
            </span>
          )}
        </div>
        <button className={styles.pillBtn} onClick={() => ctrl.skip()}>
          Skip <SkipForward size={14} />
        </button>
      </div>
      {state.caption && (
        <div key={state.caption.index} className={styles.caption}>
          <div className={styles.captionRule} />
          <span className={styles.eyebrowAccent}>{state.caption.index} / 06</span>
          <h2 className={styles.captionTitle}>{state.caption.title}</h2>
          <p className={styles.captionBody}>{state.caption.body}</p>
        </div>
      )}
    </>
  );
}

// ── Explore ─────────────────────────────────────────────────────────────────────────

function Explore({ drone, ctrl, state }: { drone: ArDrone; ctrl: ArController; state: ArState }) {
  const total = drone.hotspots.length;
  const index = drone.hotspots.findIndex((h) => h.id === state.hotspot);
  const active = index >= 0 ? drone.hotspots[index] : null;
  const next = () => {
    const unexplored = drone.hotspots.find((h) => !state.explored.includes(h.id) && h.id !== state.hotspot);
    ctrl.selectHotspot((unexplored ?? drone.hotspots[(index + 1) % total]).id);
  };
  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.topGroup}>
          <span className={styles.chip}>
            Explore <span className={styles.chipValue}>{state.explored.length}/{total}</span>
          </span>
          {state.anchorMode !== 'preview' && (
            <button className={styles.iconBtn} onClick={() => ctrl.reanchor()} aria-label="Re-align to the standee">
              <LocateFixed size={18} />
            </button>
          )}
        </div>
        <TopRight ctrl={ctrl} state={state} />
      </div>

      {state.gpsDenied && (
        <div className={styles.chipDock}>
          <span className={styles.chipWarn}>
            <span className={styles.strike}>GNSS</span> Jammed · VIO active
          </span>
        </div>
      )}

      {active ? (
        <div key={active.id} className={styles.infoCard}>
          <div className={styles.infoHead}>
            <span className={styles.eyebrowAccent}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button className={styles.iconBtnSm} onClick={() => ctrl.selectHotspot(null)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <h2 className={styles.infoTitle}>{active.title}</h2>
          <span className={styles.statChip}>{active.stat}</span>
          <p className={styles.infoBody}>{active.body}</p>
          <div className={styles.row}>
            <button className={styles.ghostBtn} onClick={next}>
              Next <ChevronRight size={16} />
            </button>
            <button className={styles.primaryBtn} onClick={() => ctrl.takeControls()}>
              <Gamepad2 size={17} /> Fly it
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.bottomDock}>
          {state.explored.length === 0 && (
            <div className={styles.hint}>
              <span className={styles.hintDot} aria-hidden />
              <span>Tap the glowing points to explore {drone.name}. Walk around it — it’s really there.</span>
            </div>
          )}
          <button className={styles.primaryBtn} onClick={() => ctrl.takeControls()}>
            <Gamepad2 size={18} /> Take the controls
          </button>
          <button className={styles.quietBtn} onClick={() => ctrl.replay()}>
            <RotateCcw size={14} /> Replay the intro
          </button>
        </div>
      )}
    </>
  );
}

// ── Flight / mission / result ───────────────────────────────────────────────────────

function FlightBar({ ctrl, state }: { ctrl: ArController; state: ArState }) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topGroup}>
        <button
          className={styles.pillBtn}
          onClick={() => ctrl.setProControls(!state.proControls)}
          aria-pressed={state.proControls}
          title="Simple: sticks follow your view. Pro: sticks follow the drone's nose."
        >
          <Gamepad2 size={14} color={state.proControls ? 'var(--accent)' : undefined} /> {state.proControls ? 'Pro' : 'Simple'}
        </button>
        {state.phase !== 'mission' && (
          <button className={styles.iconBtn} onClick={() => ctrl.backToExplore()} aria-label="Explore the drone">
            <Box size={18} />
          </button>
        )}
        {state.anchorMode !== 'preview' && (
          <button className={styles.iconBtn} onClick={() => ctrl.reanchor()} aria-label="Re-align to the standee">
            <LocateFixed size={18} />
          </button>
        )}
      </div>
      <TopRight ctrl={ctrl} state={state} />
    </div>
  );
}

function MissionBrief({ drone, ctrl, onDismiss }: { drone: ArDrone; ctrl: ArController; onDismiss: () => void }) {
  return (
    <div className={styles.missionCard}>
      <span className={styles.eyebrowAccent}>Mission · {drone.name}</span>
      <h2 className={styles.missionTitle}>{drone.missionTitle}</h2>
      <p className={styles.missionBody}>{drone.missionBrief} You have 60 seconds.</p>
      <div className={styles.row}>
        <button className={styles.primaryBtn} onClick={() => ctrl.startMission()}>
          Start
        </button>
        <button className={styles.ghostBtn} onClick={onDismiss}>
          Free fly
        </button>
      </div>
    </div>
  );
}

function formatClock(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function MissionHudView({ state }: { state: ArState }) {
  const m = state.mission;
  if (!m) return null;
  return (
    <div className={styles.missionHud}>
      <div className={styles.timer}>
        <span className={`${styles.timerValue} ${m.timeLeft <= 10 ? styles.timerLow : ''}`}>{formatClock(m.timeLeft)}</span>
        {m.type === 'lockon' ? (
          <span className={styles.dots} aria-label={`${m.value} of ${m.goal} targets locked`}>
            {Array.from({ length: m.goal }, (_, i) => (
              <span key={i} className={i < m.value ? styles.dotOn : styles.dot} />
            ))}
          </span>
        ) : (
          <span className={styles.bar} aria-label={`${m.value}% mapped`}>
            <span className={styles.barFill} style={{ width: `${m.value}%` }} />
            <span className={styles.barGoal} style={{ left: `${m.goal}%` }} />
          </span>
        )}
      </div>
      {m.hint && <span className={styles.toast}>{m.hint}</span>}
    </div>
  );
}

function Result({ drone, ctrl, state }: { drone: ArDrone; ctrl: ArController; state: ArState }) {
  const r = state.result;
  if (!r) return null;
  const headline =
    r.type === 'lockon' ? (r.success ? 'All targets locked' : `${r.value} of ${r.goal} locked`) : r.success ? 'Zone mapped' : `${r.value}% mapped`;
  return (
    <div className={styles.center}>
      <div className={styles.resultCard}>
        <span className={styles.eyebrowAccent}>
          {drone.missionTitle} · {r.success ? 'Mission complete' : 'Time up'}
        </span>
        <div className={r.success ? styles.resultValue : styles.resultValueMiss}>{r.type === 'lockon' ? `${r.value}/${r.goal}` : `${r.value}%`}</div>
        <p className={styles.statusBody} style={{ textAlign: 'left' }}>
          {headline} in {r.time}s. {r.success ? `That’s the ${drone.name} doing what it does in the field.` : 'Give it another go, or see the real thing at the booth.'}
        </p>
        <div className={styles.stack}>
          <button className={styles.primaryBtn} onClick={() => ctrl.setCtaOpen(true, 'result')}>
            Book a {drone.name} demo
          </button>
          <div className={styles.row}>
            <button className={styles.ghostBtn} onClick={() => ctrl.retryMission()}>
              <RotateCcw size={16} /> Retry
            </button>
            <button className={styles.ghostBtn} onClick={() => ctrl.flyAgain()}>
              <Gamepad2 size={16} /> Free fly
            </button>
          </div>
          <div className={styles.row}>
            <button className={styles.quietBtn} onClick={() => ctrl.backToExplore()}>
              Explore the specs
            </button>
            <button className={styles.quietBtn} onClick={() => ctrl.replay()}>
              Replay the intro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ ctrl, state, onPreview }: { ctrl: ArController; state: ArState; onPreview: () => void }) {
  return (
    <div className={styles.center}>
      <div className={styles.statusCard}>
        <h2 className={styles.statusTitle}>{state.error?.title}</h2>
        <p className={styles.statusBody}>{state.error?.body}</p>
        <button className={styles.primaryBtn} onClick={() => ctrl.reset()}>
          Try again
        </button>
        {state.platform === 'ios' && state.quickLookReady && (
          <button className={styles.ghostBtn} onClick={() => ctrl.openQuickLook()}>
            <Box size={17} /> Native AR view
          </button>
        )}
        <button className={styles.quietBtn} onClick={onPreview}>
          No camera? View in 3D
        </button>
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────────────

function ExperienceView({ ctrl, drone }: { ctrl: ArController; drone: ArDrone }) {
  const state = useArState(ctrl);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const hotspotRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [briefDismissed, setBriefDismissed] = useState(false);

  const flying = state.phase === 'flight' || state.phase === 'mission';
  useKeyboardSticks(ctrl, flying && state.anchorMode === 'preview');

  useEffect(() => {
    document.documentElement.classList.add('ar-mode');
    return () => document.documentElement.classList.remove('ar-mode');
  }, []);

  const start = (mode: 'ar' | 'preview') => {
    if (!rootRef.current || !canvasRef.current || !calloutRef.current || !hotspotRef.current) return;
    ctrl.start(mode, { canvas: canvasRef.current, overlay: rootRef.current, callouts: calloutRef.current, hotspots: hotspotRef.current });
  };

  // After an error the old WebGL context may be unusable: remount a fresh canvas first.
  const previewAfterError = () => {
    ctrl.reset();
    setRun((r) => r + 1);
    requestAnimationFrame(() => requestAnimationFrame(() => start('preview')));
  };

  const xrOverlay = state.engine === 'webxr' && state.phase !== 'intro' && state.phase !== 'error';

  return (
    <div ref={rootRef} className={`${styles.root} ${xrOverlay ? styles.xrActive : ''}`} onPointerDown={() => ctrl.touch()}>
      <canvas key={run} ref={canvasRef} className={styles.canvas} />
      <div ref={calloutRef} className={styles.layer} />
      <div ref={hotspotRef} className={styles.layer} />

      <div className={styles.hud}>
        {state.phase === 'intro' && <Intro drone={drone} ctrl={ctrl} state={state} onStart={start} />}
        {state.phase === 'starting' && <Starting state={state} />}
        {state.phase === 'scanning' && <Scanning drone={drone} ctrl={ctrl} state={state} />}
        {state.phase === 'placing' && <Placing ctrl={ctrl} state={state} />}
        {state.phase === 'sequence' && <Sequence ctrl={ctrl} state={state} />}
        {state.phase === 'explore' && <Explore drone={drone} ctrl={ctrl} state={state} />}

        {(flying || state.phase === 'result') && <FlightBar ctrl={ctrl} state={state} />}
        {state.phase === 'flight' && !briefDismissed && <MissionBrief drone={drone} ctrl={ctrl} onDismiss={() => setBriefDismissed(true)} />}
        {state.phase === 'flight' && briefDismissed && (
          <div className={styles.chipDock}>
            <button className={styles.pillBtn} onClick={() => ctrl.startMission()}>
              <Crosshair size={14} /> Start mission
            </button>
          </div>
        )}
        {state.phase === 'mission' && <MissionHudView state={state} />}
        {flying && <Joysticks sink={ctrl} />}
        {flying && state.anchorMode === 'preview' && state.platform === 'desktop' && (
          <div className={styles.keyHint}>
            <span className={styles.eyebrow}>Keyboard: W/S climb · A/D turn · arrows move</span>
          </div>
        )}
        {state.phase === 'result' && <Result drone={drone} ctrl={ctrl} state={state} />}
        {state.phase === 'error' && <ErrorView ctrl={ctrl} state={state} onPreview={previewAfterError} />}

        <Toasts state={state} />
        {state.ctaOpen && <CtaSheet drone={drone} ctrl={ctrl} />}
      </div>
    </div>
  );
}

export default function ARExperience({ slug }: { slug: DroneSlug }) {
  const drone = getArDrone(slug)!;
  // Client-only component (loaded with ssr: false), so browser APIs are safe here.
  const [ctrl] = useState(() => new ArController(drone, detectPlatform()));

  useEffect(() => {
    ctrl.mount();
    return () => ctrl.dispose();
  }, [ctrl]);

  return <ExperienceView ctrl={ctrl} drone={drone} />;
}
