'use client';

import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── colour tokens ─── */
const BG        = '#06080D';
const BG2       = '#0A0E16';
const BG3       = '#0F1520';
const LINE      = 'rgba(255,255,255,0.06)';
const GREEN     = '#94d327';
const GREEN_DIM = 'rgba(148,211,39,0.08)';
const GREEN_GLOW= 'rgba(148,211,39,0.13)';
const AMBER     = '#FFB830';
const AMBER_DIM = 'rgba(255,184,48,0.08)';
const AMBER_GLOW= 'rgba(255,184,48,0.12)';

/* ─── hero carousel slides ─── */
interface Slide {
  img:      string;
  blend:    'screen' | 'normal';
  pos:      string;
  filter:   string;
  eyebrow:  string;
  h1:       React.ReactNode;
  sub:      string;
  mono:     string;
  tags:     string[];
  tagFirstClass: string;
  glow:     string;
}

const SLIDES: Slide[] = [
  {
    img:           '/systems/sentinel/sentinel_on_matte.png',
    blend:         'screen' as const,
    pos:           'center 40%',
    filter:        'brightness(0.82) contrast(1.12) saturate(1.08)',
    eyebrow:       'VAS-04 · Military ISR',
    h1:            <>Eyes above<br /><span style={{ color: GREEN }}>Ladakh.</span> Anywhere.</>,
    sub:           'Sentinel is Vortex\'s frontline ISR platform — built for the environments India actually deploys in. 3,500 m+ altitude ceiling, man-portable by a single soldier, and onboard AI that keeps tracking targets when the GCS link goes dark.',
    mono:          'Military ISR · Ladakh-rated',
    tags:          ['Defense (MoD exempt)', 'Ladakh-rated', 'TRL 6', 'Man-portable'],
    tagFirstClass: 'tag tag-green',
    glow:          `radial-gradient(ellipse 52% 62% at 66% 44%, ${GREEN_GLOW} 0%, transparent 65%)`,
  },
  {
    img:           '/systems/sentinel/sentinel_top_view.png',
    blend:         'screen' as const,
    pos:           'center',
    filter:        'brightness(0.88) contrast(1.08) saturate(1.05)',
    eyebrow:       'VAS-04 · Compact Form Factor',
    h1:            <>One soldier.<br /><span style={{ color: GREEN }}>Any mission.</span></>,
    sub:           'Compact quad layout folds to single-soldier backpack dimensions without sacrificing structural rigidity at 3,500 m density altitude. T700 CF arms. PA12-CF motor mounts. Deploys in under 10 minutes.',
    mono:          'Top view · compact ISR platform',
    tags:          ['Man-portable', '<10 min deploy', 'T700 CF frame'],
    tagFirstClass: 'tag tag-green',
    glow:          `radial-gradient(ellipse 68% 68% at 50% 46%, ${GREEN_GLOW} 0%, transparent 65%)`,
  },
  {
    img:           '/systems/sentinel/sentinel_prop_macro.png',
    blend:         'screen' as const,
    pos:           'center',
    filter:        'brightness(0.80) contrast(1.14) saturate(1.05)',
    eyebrow:       'VAS-04 · Altitude Propulsion',
    h1:            <>Engineered for<br />where the air<br /><span style={{ color: GREEN }}>gets thin.</span></>,
    sub:           'At 3,500 m the air is 65% sea-level density. Sentinel\'s altitude-tuned carbon fibre props and custom-wound motors are sized for those conditions specifically — not as a footnote to a sea-level platform.',
    mono:          'Altitude-tuned propulsion · 3,500 m rated',
    tags:          ['3,500 m+ ceiling', '38 min endurance', 'Altitude CF props'],
    tagFirstClass: 'tag tag-green',
    glow:          'radial-gradient(ellipse 55% 60% at 42% 50%, rgba(148,211,39,0.09) 0%, transparent 65%)',
  },
  {
    img:           '/systems/sentinel/sentinel_camera_macro.png',
    blend:         'screen' as const,
    pos:           'center 45%',
    filter:        'brightness(0.85) contrast(1.10) saturate(1.10)',
    eyebrow:       'VAS-04 · AI Target Acquisition',
    h1:            <>Sees it first.<br /><span style={{ color: AMBER }}>Tracks it without you.</span></>,
    sub:           'Dual EO/IR payload with continuous optical zoom. Onboard YOLOv8 tracks multiple targets simultaneously — no GCS uplink required during terminal phase. 12 simultaneous track IDs via ByteTrack.',
    mono:          'EO/IR payload · YOLOv8 onboard',
    tags:          ['EO + IR dual payload', 'YOLOv8 onboard', 'No GCS required'],
    tagFirstClass: 'tag tag-green',
    glow:          `radial-gradient(ellipse 48% 52% at 52% 48%, ${AMBER_GLOW} 0%, transparent 65%)`,
  },
  {
    img:           '/systems/sentinel/sentinel_on_box.png',
    blend:         'screen' as const,
    pos:           'center 42%',
    filter:        'brightness(0.83) contrast(1.10) saturate(1.05)',
    eyebrow:       'VAS-04 · Tethered ISR',
    h1:            <>Unlimited endurance.<br /><span style={{ color: GREEN }}>Zero logistics.</span></>,
    sub:           'Tethered configuration provides unlimited operational endurance at fixed observation height — forward observation posts, static perimeter, and command-post air picture. No battery swap logistics.',
    mono:          'Tethered variant · unlimited endurance',
    tags:          ['Tethered variant', 'Unlimited endurance', 'iDEX / DRDO TDF'],
    tagFirstClass: 'tag tag-green',
    glow:          `radial-gradient(ellipse 56% 56% at 58% 48%, ${GREEN_DIM} 0%, transparent 65%)`,
  },
];

const INTERVAL = 5000;

/* ─── corner bracket marks ─── */
const Corner = ({ accent = GREEN, size = 20 }: { accent?: string; size?: number }) => (
  <>
    {[
      { top: size, left: size },
      { top: size, right: size, transform: 'scaleX(-1)' },
      { bottom: size, left: size, transform: 'scaleY(-1)' },
      { bottom: size, right: size, transform: 'scale(-1)' },
    ].map((pos, i) => (
      <div key={i} style={{ position: 'absolute', width: size, height: size, pointerEvents: 'none', zIndex: 4, ...pos }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, background: accent, opacity: 0.55 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 1, background: accent, opacity: 0.55 }} />
      </div>
    ))}
  </>
);

/* ─── mono label ─── */
const MonoLabel = ({ children, color = '#52607A' }: { children: React.ReactNode; color?: string }) => (
  <div style={{
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9, letterSpacing: '0.22em',
    textTransform: 'uppercase', color,
  }}>{children}</div>
);

export default function SentinelPage() {
  const [active, setActive]     = useState(0);
  const [prev,   setPrev]       = useState<number | null>(null);
  const [fading, setFading]     = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number>(0);
  const pausedRef = useRef(false);

  /* ── smooth progress bar ── */
  const tickProgress = useCallback(() => {
    if (pausedRef.current) return;
    const elapsed = performance.now() - startRef.current;
    const pct = Math.min((elapsed / INTERVAL) * 100, 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx === active) return;
    setPrev(active);
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setPrev(null);
      setFading(false);
    }, 520);
  }, [active]);

  const advance = useCallback(() => {
    goTo((active + 1) % SLIDES.length);
  }, [active, goTo]);

  /* reset progress + schedule next on slide change */
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgress(0);
    startRef.current = performance.now();
    rafRef.current   = requestAnimationFrame(tickProgress);
    timerRef.current = setTimeout(advance, INTERVAL);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const pause = () => {
    pausedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resume = () => {
    pausedRef.current = false;
    startRef.current  = performance.now() - (progress / 100) * INTERVAL;
    rafRef.current    = requestAnimationFrame(tickProgress);
    timerRef.current  = setTimeout(advance, INTERVAL - (progress / 100) * INTERVAL);
  };

  const slide     = SLIDES[active];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main style={{ background: BG }}>

        {/* ══════════════════════════════════════════════════════
            §1  HERO — CAROUSEL
            Full-viewport · text left · green military identity
        ══════════════════════════════════════════════════════ */}
        <section
          style={{ padding: 0, position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden', background: BG }}
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* ── outgoing slide (fades out) ── */}
          {prevSlide && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: fading ? 0 : 1, transition: 'opacity 520ms ease' }}>
              <Image
                src={prevSlide.img}
                alt=""
                fill sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: prevSlide.pos, mixBlendMode: prevSlide.blend, filter: prevSlide.filter }}
              />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: prevSlide.glow }} />
            </div>
          )}

          {/* ── active slide image (fades in) ── */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: fading ? 0 : 1, transition: 'opacity 520ms ease' }}>
            <Image
              src={slide.img}
              alt={`Sentinel VAS-04 — ${slide.eyebrow}`}
              fill priority sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: slide.pos, mixBlendMode: slide.blend, filter: slide.filter }}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: slide.glow }} />
          </div>

          {/* Canvas darkening — heavy military look */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            background: `
              linear-gradient(to right,  rgba(6,8,13,0.97) 0%, rgba(6,8,13,0.72) 30%, rgba(6,8,13,0.20) 56%, rgba(6,8,13,0.58) 100%),
              linear-gradient(to bottom, rgba(6,8,13,0.80) 0%, rgba(6,8,13,0.10) 24%, rgba(6,8,13,0.06) 56%, rgba(6,8,13,0.97) 100%)
            `,
          }} />

          {/* Grid overlay — green military */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(148,211,39,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(148,211,39,0.018) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          {/* Ghost designation — VAS-04 top right */}
          <div style={{
            position: 'absolute', top: 152, right: 56, zIndex: 3,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(72px, 11vw, 152px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
            WebkitTextStroke: `1px rgba(148,211,39,0.08)`, color: 'transparent',
            userSelect: 'none', pointerEvents: 'none',
          }}>
            VAS-04
          </div>

          {/* Top bar — back link */}
          <div style={{
            position: 'absolute', top: 72, left: 0, right: 0, zIndex: 6,
            padding: '14px 56px', display: 'flex', alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(6,8,13,0.72) 0%, transparent 100%)',
          }}>
            <Link href="/systems" className="hero-back-link">
              <span>←</span> Back to Systems
            </Link>
          </div>

          {/* ── Hero text (transitions with slide) ── */}
          <div style={{ position: 'relative', zIndex: 5, padding: '160px 56px 80px', maxWidth: 860 }}>

            {/* eyebrow */}
            <div
              className="eyebrow"
              key={`ey-${active}`}
              style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 400ms ease, transform 400ms ease' }}
            >
              {slide.eyebrow}
            </div>

            {/* h1 */}
            <h1
              key={`h1-${active}`}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(50px, 7.5vw, 108px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em',
                color: '#E4EAF4', marginBottom: 28,
                opacity: fading ? 0 : 1, transform: fading ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 420ms ease 40ms, transform 420ms ease 40ms',
              }}
            >
              {slide.h1}
            </h1>

            {/* subline */}
            <p
              key={`sub-${active}`}
              style={{
                fontSize: 16, color: '#7A8BA6', lineHeight: 1.78, maxWidth: 560, marginBottom: 36,
                opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)',
                transition: 'opacity 430ms ease 80ms, transform 430ms ease 80ms',
              }}
            >
              {slide.sub}
            </p>

            {/* tags */}
            <div
              key={`tags-${active}`}
              style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36,
                opacity: fading ? 0 : 1, transition: 'opacity 440ms ease 120ms',
              }}
            >
              <span className={slide.tagFirstClass}>{slide.tags[0]}</span>
              {slide.tags.slice(1).map((t) => <span key={t} className="tag">{t}</span>)}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner" className="btn-primary">Request Briefing <span className="arr">→</span></Link>
              <Link href="#specs" className="btn-outline">Specifications</Link>
            </div>
          </div>

          {/* ── Carousel controls — bottom left ── */}
          <div style={{
            position: 'absolute', bottom: 48, left: 56, zIndex: 6,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* Mono caption */}
            <div
              key={`mono-${active}`}
              style={{ opacity: fading ? 0 : 1, transition: 'opacity 400ms ease' }}
            >
              <MonoLabel color="rgba(148,211,39,0.55)">{slide.mono}</MonoLabel>
            </div>

            {/* Dot nav + slide counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    all: 'unset', cursor: 'pointer', position: 'relative',
                    width: i === active ? 28 : 8, height: 8,
                    background: i === active ? 'transparent' : 'rgba(255,255,255,0.18)',
                    border: i === active ? `1px solid rgba(148,211,39,0.45)` : 'none',
                    transition: 'width 300ms ease, background 300ms ease',
                    overflow: 'hidden',
                  }}
                >
                  {i === active && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, height: '100%',
                      width: `${progress}%`,
                      background: GREEN,
                      transition: 'none',
                    }} />
                  )}
                </button>
              ))}
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)',
              }}>
                {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* ── Prev / Next arrows — bottom right ── */}
          <div style={{
            position: 'absolute', bottom: 44, right: 56, zIndex: 6,
            display: 'flex', gap: 8,
          }}>
            {[
              { label: '←', fn: () => goTo((active - 1 + SLIDES.length) % SLIDES.length) },
              { label: '→', fn: () => goTo((active + 1) % SLIDES.length) },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                aria-label={label === '←' ? 'Previous slide' : 'Next slide'}
                style={{
                  all: 'unset', cursor: 'pointer',
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid rgba(148,211,39,0.22)`,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'monospace', fontSize: 14,
                  transition: 'border-color 220ms, color 220ms, background 220ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = GREEN;
                  (e.currentTarget as HTMLButtonElement).style.color = GREEN;
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(148,211,39,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148,211,39,0.22)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bottom bleed → BG2 */}
          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 120, zIndex: 5, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §2  TOP VIEW — FORM FACTOR & AIRFRAME
            Left = image · Right = text · BG2 base
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh', background: BG2, borderBottom: `1px solid ${LINE}` }}>

          {/* Image column */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 560 }}>
            <Image
              src="/systems/sentinel/sentinel_top_view.png"
              alt="Sentinel VAS-04 top view — compact ISR form factor"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.88) contrast(1.08) saturate(1.05)' }}
            />
            {/* Green glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 68% 68% at 50% 46%, ${GREEN_GLOW} 0%, transparent 70%)` }} />
            {/* Right bleed into text col */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, transparent 50%, ${BG2} 100%)` }} />
            {/* Top + bottom fades */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG2} 0%, transparent 10%, transparent 90%, ${BG2} 100%)` }} />
            <Corner accent={GREEN} />
            <div style={{ position: 'absolute', bottom: 24, left: 28, zIndex: 3 }}>
              <MonoLabel>Top view · Compact ISR form factor</MonoLabel>
            </div>
          </div>

          {/* Text column */}
          <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: `1px solid ${LINE}`, background: BG2, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 55% at 82% 28%, ${GREEN_DIM} 0%, transparent 70%)` }} />

            <div className="eyebrow reveal r1" style={{ position: 'relative' }}>Airframe Design</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(34px, 4vw, 56px)', fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.01em', marginBottom: 28, color: '#E4EAF4', position: 'relative' }} className="reveal r2">
              Compact enough<br />for one soldier.<br />Capable enough<br />for any mission.
            </h2>

            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 18, position: 'relative' }} className="reveal r3">
              Sentinel&apos;s airframe is engineered around the platoon-level deployment constraint: one soldier, one backpack, ten minutes to launch. The compact quad layout folds to vehicle-portable dimensions without sacrificing the structural rigidity demanded by 3,500 m density altitude flight.
            </p>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 36, position: 'relative' }} className="reveal r3">
              Every gram is deliberate. T700 carbon fibre arms. PA12-CF printed motor mounts. The result is a platform that a rifleman can carry, a section commander can operate, and a battalion can maintain.
            </p>

            {[
              { k: 'Configuration',    v: 'Compact quadcopter' },
              { k: 'Frame material',   v: 'T700 carbon fibre' },
              { k: 'Motor mounts',     v: 'PA12-CF printed' },
              { k: 'Deploy time',      v: '<10 min, one person' },
              { k: 'Transport',        v: 'Single soldier backpack' },
              { k: 'Doctrine',         v: 'Ashni platoon aligned' },
            ].map((r) => (
              <div key={r.k} className="spec-row reveal r4" style={{ borderBottom: `1px solid ${LINE}`, position: 'relative' }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value">{r.v}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §3  PROP MACRO — HIGH-ALTITUDE PROPULSION
            Image pinned right · text left · BG3 · green stats
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: BG3, borderBottom: `1px solid ${LINE}` }}>

          {/* Top bleed from BG2 */}
          <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 80, zIndex: 1, background: `linear-gradient(to bottom, ${BG2} 0%, transparent 100%)`, pointerEvents: 'none' }} />

          {/* Prop image — right 55% */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '56%', overflow: 'hidden' }}>
            <Image
              src="/systems/sentinel/sentinel_prop_macro.png"
              alt="Sentinel altitude-tuned propulsion system"
              fill sizes="56vw"
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.80) contrast(1.14) saturate(1.05)' }}
            />
            {/* Green warmth glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 60% at 42% 50%, rgba(148,211,39,0.09) 0%, transparent 65%)` }} />
            {/* Left bleed into text */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${BG3} 0%, rgba(15,21,32,0.55) 26%, transparent 56%), linear-gradient(to bottom, ${BG3} 0%, transparent 8%, transparent 92%, ${BG3} 100%)` }} />
          </div>

          {/* Text — left */}
          <div style={{ position: 'relative', zIndex: 3, padding: '80px 56px', maxWidth: 540 }}>
            <div className="eyebrow reveal r1">Altitude-Tuned Propulsion</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', marginBottom: 24, color: '#E4EAF4' }} className="reveal r2">
              Engineered for<br />where the air<br /><span style={{ color: GREEN }}>gets thin.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 40 }} className="reveal r3">
              At 3,500 m the air is 65% the density of sea level — standard props cavitate, standard motors overheat. Sentinel&apos;s altitude-tuned carbon fibre props and custom-wound motors are sized for those conditions specifically, not as a footnote.
            </p>

            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 36 }}>
              {[
                { val: '3,500 m+', key: 'Operational altitude (ASL)' },
                { val: '38 min',   key: 'Endurance at altitude' },
                { val: '2.4 kg',   key: 'Max takeoff weight' },
                { val: '−25–55°C', key: 'Operating temperature' },
              ].map((s) => (
                <div key={s.key} style={{ background: 'rgba(6,8,13,0.65)', border: `1px solid rgba(148,211,39,0.14)`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: GREEN, lineHeight: 1 }}>
                    {s.val}
                  </span>
                  <MonoLabel>{s.key}</MonoLabel>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="reveal r4">
              <span className="tag tag-green">Ladakh altitude validated</span>
              <span className="tag">Altitude-tuned CF props</span>
              <span className="tag">Motor-arm ESCs</span>
            </div>
          </div>

          {/* Bottom bleed → BG */}
          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 80, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §4  CAMERA MACRO — SENSOR PAYLOAD
            Full-bleed cinematic · amber accent · sensor story
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '78vh', overflow: 'hidden', background: BG }}>
          <Image
            src="/systems/sentinel/sentinel_camera_macro.png"
            alt="Sentinel EO/IR camera payload — target acquisition system"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 45%', mixBlendMode: 'screen', filter: 'brightness(0.85) contrast(1.10) saturate(1.10)' }}
          />

          {/* Warm amber glow — sensor optics colour language */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 48% 52% at 52% 48%, ${AMBER_GLOW} 0%, transparent 65%)` }} />

          {/* Cinematic letterbox fades */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.88) 0%, rgba(6,8,13,0.06) 20%, rgba(6,8,13,0.06) 62%, rgba(6,8,13,0.95) 100%)` }} />

          {/* Right-side dark panel for text readability */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to left, rgba(6,8,13,0.92) 0%, rgba(6,8,13,0.60) 30%, transparent 58%)` }} />

          {/* Text — bottom right */}
          <div style={{ position: 'absolute', bottom: 56, right: 56, zIndex: 3, maxWidth: 460, textAlign: 'right' }}>
            <MonoLabel color={AMBER}>EO/IR Payload · Target Acquisition</MonoLabel>
            <div style={{ height: 16 }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 3.5vw, 50px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              Sees it first.<br /><span style={{ color: AMBER }}>Tracks it without you.</span>
            </h3>
            <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.75, marginTop: 16 }}>
              Dual EO/IR payload with continuous optical zoom. Onboard YOLOv8 tracks multiple targets simultaneously — no GCS uplink required during terminal phase.
            </p>
          </div>

          {/* Sensor stat strip — bottom left */}
          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { val: 'EO + IR', key: 'Dual payload' },
              { val: 'YOLOv8', key: 'Onboard detection' },
              { val: 'Multi-target', key: 'Simultaneous tracks' },
            ].map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: AMBER, letterSpacing: '-0.01em' }}>{s.val}</span>
                <MonoLabel color="#52607A">{s.key}</MonoLabel>
              </div>
            ))}
          </div>

          {/* Bottom bleed → BG */}
          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §5  CUTAWAY — INTERNAL ARCHITECTURE
            Full-width natural image · 3 annotation cards · manifest
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          {/* Header */}
          <div style={{ padding: '80px 56px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, borderBottom: `1px solid ${LINE}` }}>
            <div>
              <div className="eyebrow reveal r1">System Architecture</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4' }} className="reveal r2">
                Precision-packed.<br />Field-serviceable.
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8 }} className="reveal r3">
                Sentinel&apos;s internal architecture is designed for the two realities of military deployment: extreme conditions on the way out, and a soldier with basic tools on the way back. Every subsystem is modular, accessible, and swappable in the field.
              </p>
            </div>
          </div>

          {/* Cutaway — natural size, no crop */}
          <div style={{ position: 'relative', width: '100%', background: BG, padding: '48px 0' }}>
            {/* Green ambient glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 65% 65% at 50% 50%, rgba(148,211,39,0.05) 0%, transparent 72%)` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/systems/sentinel/sentinel_cutaway.png"
              alt="Sentinel internal cutaway — system layout"
              style={{ display: 'block', width: '100%', height: 'auto', mixBlendMode: 'screen', filter: 'brightness(0.94) contrast(1.06) saturate(1.05)', position: 'relative', zIndex: 1 }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to top, ${BG} 0%, transparent 100%)` }} />
          </div>

          {/* Three annotation cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: LINE }}>
            {[
              {
                layer: 'Propulsion layer',
                title: 'Power & Motor Control',
                body: 'Motor-arm mounted ESCs at each junction — minimum trace length from battery to motor, maximum thermal spreading across the CF arms. Clean per-arm current control with individual fault isolation for redundancy in the field.',
                accent: GREEN,
              },
              {
                layer: 'Core avionics plate',
                title: 'Flight Control & Compliance',
                body: 'Cube Orange Plus autopilot with triple-redundant IMUs on a vibration-isolated mount. Drone ID and ADS-B Out modules co-located for full Digital Sky compliance. Compact layout between CF plates leaves nothing exposed.',
                accent: GREEN,
              },
              {
                layer: 'Compute & comms stack',
                title: 'AI Edge + Data Link',
                body: 'Jetson Orin Nano runs YOLOv8 + ByteTrack target detection entirely onboard — no GCS dependency in the terminal tracking phase. SIYI encrypted air unit for RC + HD video. Network switch ties camera, compute, and link into a single fabric.',
                accent: AMBER,
              },
            ].map((item) => (
              <div key={item.title} style={{ background: BG2, padding: '40px 36px', borderTop: `2px solid ${item.accent}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, ${item.accent === AMBER ? AMBER_DIM : GREEN_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ marginBottom: 20, position: 'relative' }}><MonoLabel>{item.layer}</MonoLabel></div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 600, color: '#E4EAF4', marginBottom: 14, position: 'relative' }}>{item.title}</div>
                <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.78, position: 'relative' }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* Component manifest — 4 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: LINE, borderTop: `1px solid ${LINE}` }}>
            {[
              { component: 'Cube Orange Plus', role: 'Autopilot · triple IMU',    layer: 'Core plate',  accent: GREEN },
              { component: 'Jetson Orin Nano', role: 'AI edge compute',           layer: 'Compute stack', accent: AMBER },
              { component: 'SIYI Air Unit',    role: 'Encrypted RC + HD video',   layer: 'Compute stack', accent: AMBER },
              { component: 'Network Switch',   role: 'Camera · AI · link fabric', layer: 'Compute stack', accent: AMBER },
              { component: 'EO/IR Camera',     role: 'Dual optical payload',      layer: 'Payload bay',  accent: AMBER },
              { component: 'Motor-arm ESCs',   role: 'Per-arm speed control',     layer: 'Prop layer',   accent: GREEN },
              { component: 'Drone ID Tag',     role: 'DGCA Digital Sky',          layer: 'Core plate',   accent: GREEN },
              { component: 'ADS-B Out',        role: 'Airspace broadcast',        layer: 'Core plate',   accent: GREEN },
            ].map((c) => (
              <div key={c.component} style={{ background: BG, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 600, color: '#E4EAF4' }}>{c.component}</div>
                <div style={{ fontSize: 12, color: '#52607A' }}>{c.role}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: c.accent, marginTop: 4 }}>{c.layer}</div>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §6  SPECS + ON-BOX DEPLOYMENT
            Left = spec table · Right = sentinel_on_box image
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', background: BG2, borderBottom: `1px solid ${LINE}` }} id="specs">

          {/* Specs column */}
          <div style={{ padding: '80px 56px', background: BG2, borderRight: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
            {/* Green glow top-right */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 80% at 80% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="eyebrow reveal r1" style={{ position: 'relative' }}>Technical Specifications</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 40, position: 'relative' }} className="reveal r2">
              Built for Ladakh.<br />Proven at altitude.
            </h2>

            {[
              { k: 'Platform class',     v: 'Compact quadcopter' },
              { k: 'Altitude ceiling',   v: '3,500 m+ ASL (Ladakh-rated)' },
              { k: 'Hover endurance',    v: '38 min at altitude' },
              { k: 'Max takeoff weight', v: '2.4 kg' },
              { k: 'Payload',            v: 'EO / IR / dual-mode' },
              { k: 'AI compute',         v: 'Jetson Orin Nano' },
              { k: 'Onboard detection',  v: 'YOLOv8 + ByteTrack' },
              { k: 'Data link',          v: 'SIYI encrypted RC + HD' },
              { k: 'Flight controller',  v: 'Cube Orange Plus' },
              { k: 'Tethered variant',   v: 'Unlimited endurance' },
              { k: 'Deployment',         v: 'Man-portable · <10 min' },
              { k: 'Procurement',        v: 'MoD exempt · iDEX / DRDO TDF' },
            ].map((r, i) => (
              <div key={r.k} className="spec-row reveal" style={{ borderBottom: `1px solid ${LINE}`, position: 'relative', transitionDelay: `${i * 0.040}s` }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value">{r.v}</span>
              </div>
            ))}

            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }} className="reveal r5">
              <Link href="/partner" className="btn-primary">Request Briefing <span className="arr">→</span></Link>
              <Link href="/partner#contact-form" className="btn-outline">Procurement enquiry</Link>
            </div>
          </div>

          {/* Deployment image — sentinel on its carry box */}
          <div style={{ position: 'relative', minHeight: 600, overflow: 'hidden', background: BG, display: 'flex', flexDirection: 'column' }}>
            <Image
              src="/systems/sentinel/sentinel_on_box.png"
              alt="Sentinel packed for deployment on carry case"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center 42%', mixBlendMode: 'screen', filter: 'brightness(0.83) contrast(1.10) saturate(1.05)' }}
            />
            {/* Fades */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to left, transparent 42%, ${BG2} 100%), linear-gradient(to bottom, ${BG2} 0%, transparent 10%, transparent 88%, ${BG2} 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 58% 48%, ${GREEN_DIM} 0%, transparent 65%)` }} />
            <Corner accent={GREEN} />

            {/* Deployment callout — bottom of image */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '48px 36px 36px', background: `linear-gradient(to top, ${BG2} 0%, transparent 100%)` }}>
              <MonoLabel color={GREEN}>Field deployment · Man-portable configuration</MonoLabel>
              <div style={{ height: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: LINE }}>
                {[
                  { val: '1 person',  key: 'Deploy crew' },
                  { val: '<10 min',   key: 'Setup time' },
                  { val: 'IP53',      key: 'Weather rating' },
                  { val: 'Folded',    key: 'Pack state' },
                ].map((s) => (
                  <div key={s.key} style={{ background: BG3, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em' }}>{s.val}</span>
                    <MonoLabel>{s.key}</MonoLabel>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §7  AI INTELLIGENCE — CAPABILITY CARDS
            Dark BG · four capability pillars · amber + green
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          {/* Header */}
          <div style={{ padding: '72px 56px 56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}`, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow reveal r1">Autonomous Intelligence</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                Tracks when the<br /><span style={{ color: GREEN }}>link goes dark.</span>
              </h2>
            </div>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, maxWidth: 460 }} className="reveal r3">
              Sentinel&apos;s intelligence stack is designed for the reality of forward operations: degraded comms, GPS jamming, and adversarial EW environments. Every critical function — detection, tracking, classification — runs entirely onboard. The GCS is for situational awareness, not survival.
            </p>
          </div>

          {/* 4 capability cards — 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: LINE }}>
            {[
              {
                num: '01',
                title: 'YOLOv8 Onboard Detection',
                body: 'Real-time target detection at 30 fps on Jetson Orin Nano — personnel, vehicles, and equipment. Runs entirely onboard at 3,500 m with no GCS uplink requirement. Works in GPS-denied and comms-jammed environments.',
                accent: GREEN,
                tag: 'No GCS required',
              },
              {
                num: '02',
                title: 'ByteTrack Multi-Target Persistence',
                body: 'ByteTrack multi-object tracker maintains target IDs across occlusion, manoeuvre, and temporary loss of detection. Track up to 12 simultaneous targets. Persistent track output even when target briefly exits camera FOV.',
                accent: GREEN,
                tag: '12 simultaneous tracks',
              },
              {
                num: '03',
                title: 'Encrypted Full-Spectrum Link',
                body: 'SIYI encrypted RC + HD video downlink. Zero unencrypted telemetry in flight — ground-to-air and air-to-ground both fully secured. Operates on frequency-hopping spread spectrum to resist EW and jamming attempts.',
                accent: AMBER,
                tag: 'EW resistant',
              },
              {
                num: '04',
                title: 'Tethered Persistent ISR',
                body: 'Tethered configuration provides unlimited operational endurance at fixed observation height — ideal for forward observation posts, static perimeter, and command-post air picture. Eliminates battery swap logistics entirely.',
                accent: AMBER,
                tag: 'Unlimited endurance',
              },
            ].map((f) => (
              <div key={f.title} style={{ background: BG2, padding: '44px 40px', borderTop: `2px solid ${f.accent}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, ${f.accent === AMBER ? AMBER_DIM : GREEN_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                {/* Number */}
                <div style={{ position: 'absolute', top: 36, right: 40, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 72, fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,0.03)', userSelect: 'none' }}>{f.num}</div>
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: f.accent, background: `rgba(${f.accent === AMBER ? '255,184,48' : '148,211,39'},0.10)`, padding: '4px 10px', border: `1px solid ${f.accent === AMBER ? AMBER_DIM : GREEN_DIM}` }}>
                    {f.tag}
                  </span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 600, color: '#E4EAF4', marginBottom: 14, position: 'relative' }}>{f.title}</div>
                <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.78, position: 'relative' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §8  CTA — PROCUREMENT
            BG2 · green identity · two-col layout
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          {/* Green glow top-left */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '60%', background: `radial-gradient(ellipse 80% 80% at 10% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div className="eyebrow reveal r1">Procurement</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 24 }} className="reveal r2">
              Field Sentinel<br />for your unit?
            </h2>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8 }} className="reveal r3">
              Sentinel operates under MoD exemption — no civilian type-certificate required for defense procurement and field trials. Available through iDEX, DRDO TDF, Make-II, and Army Design Bureau pathways.
            </p>
            {/* Ashni callout */}
            <div style={{ marginTop: 32, padding: '20px 24px', background: BG3, border: `1px solid rgba(148,211,39,0.12)`, borderLeft: `3px solid ${GREEN}` }} className="reveal r4">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: GREEN, marginBottom: 8 }}>Ashni doctrine aligned</div>
              <p style={{ fontSize: 13, color: '#7A8BA6', lineHeight: 1.7 }}>
                Sentinel is sized, documented, and C2-interfaced for integration into the Ashni platoon-level drone deployment doctrine — a direct fit with Army Small Unit Unmanned Systems requirements.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative' }} className="reveal r3">
            {[
              { k: 'iDEX DISC',         v: 'Open Challenge eligible' },
              { k: 'DRDO TDF',          v: 'Technology Dev. Fund' },
              { k: 'Make-II',           v: 'Suo-Moto / Army initiated' },
              { k: 'Army Design Bureau',v: 'Direct engagement' },
              { k: 'MoD exemption',     v: 'No TC required' },
              { k: 'Field trials',      v: 'Available on request' },
            ].map((r) => (
              <div key={r.k} className="spec-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value" style={{ color: '#7A8BA6' }}>{r.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner#contact-form" className="btn-primary">Initiate Procurement <span className="arr">→</span></Link>
              <Link href="/systems/vas05" className="btn-outline">Sentinel-M →</Link>
            </div>
          </div>
        </section>


        {/* Prev / Next navigation */}
        <div style={{ padding: '32px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, flexWrap: 'wrap', gap: 16, background: BG }}>
          <Link href="/systems/vas03" className="btn-outline">← VAS-03 · Ranger</Link>
          <Link href="/systems" className="btn-arrow" style={{ color: '#52607A' }}>
            All platforms <span className="arr">→</span>
          </Link>
          <Link href="/systems/vas05" className="btn-outline">VAS-05 · Sentinel-M →</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
