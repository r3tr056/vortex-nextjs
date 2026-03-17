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
const BLUE      = '#38b6ff';
const BLUE_DIM  = 'rgba(56,182,255,0.08)';
const BLUE_GLOW = 'rgba(56,182,255,0.13)';
const GREEN     = '#94d327';
const GREEN_DIM = 'rgba(148,211,39,0.08)';

/* ─── hero carousel slides ─── */
const SLIDES = [
  {
    img:      '/systems/ranger/ranger_on_matte.png',
    blend:    'screen' as const,
    pos:      'center 38%',
    filter:   'brightness(0.84) contrast(1.10) saturate(1.12)',
    eyebrow:  'VAS-03 · Enterprise Intelligence',
    h1:       <>Best-in-class ISR —<br /><span style={{ color: BLUE }}>autonomy at its core.</span></>,
    sub:      "Ranger is Vortex's enterprise aerial intelligence platform — persistent surveillance, precision mapping, and full-stack sovereign data. Every feed processed on Indian infrastructure via Vortex Cloud GCS.",
    mono:     'Enterprise ISR · Vortex Cloud GCS',
    tags:     ['Government', 'Enterprise', 'TRL 6', 'NPNT compliant'],
    tagFirst: 'tag tag-blue',
    glow:     `radial-gradient(ellipse 55% 65% at 68% 42%, ${BLUE_GLOW} 0%, transparent 65%)`,
  },
  {
    img:      '/systems/ranger/ranger_top_view.png',
    blend:    'screen' as const,
    pos:      'center',
    filter:   'brightness(0.85) contrast(1.07) saturate(1.08)',
    eyebrow:  'VAS-03 · Airframe Design',
    h1:       <>Engineered for<br />precision —<br /><span style={{ color: BLUE }}>not compromise.</span></>,
    sub:      'Symmetric hexacopter geometry designed from scratch — not adapted from a kit. Every arm machined T700 carbon fibre. Sensor payload at the geometric centre-of-lift. 1 cm/pixel orthomosaic accuracy.',
    mono:     'Top view · symmetric hexacopter',
    tags:     ['T700 CF frame', 'Geo CoL centre', '60 cm folded'],
    tagFirst: 'tag tag-blue',
    glow:     `radial-gradient(ellipse 60% 60% at 50% 45%, ${BLUE_GLOW} 0%, transparent 65%)`,
  },
  {
    img:      '/systems/ranger/ranger_scene.png',
    blend:    'screen' as const,
    pos:      'center 48%',
    filter:   'brightness(0.82) contrast(1.08) saturate(1.12)',
    eyebrow:  'VAS-03 · Field Deployment',
    h1:       <>Ranger maps where<br /><span style={{ color: BLUE }}>teams can&apos;t go.</span></>,
    sub:      'High-endurance aerial survey and persistent surveillance across enterprise and government deployments. SVAMITVA cadaster survey, NDRF operations, and state police ISR — all from one platform.',
    mono:     'Field deployment · enterprise survey',
    tags:     ['SVAMITVA survey', 'NDRF ops', '4,200 m ceiling'],
    tagFirst: 'tag tag-blue',
    glow:     `radial-gradient(ellipse 55% 55% at 55% 45%, rgba(56,182,255,0.10) 0%, transparent 65%)`,
  },
  {
    img:      '/systems/ranger/ranger_military_1.png',
    blend:    'screen' as const,
    pos:      'center',
    filter:   'brightness(0.76) contrast(1.12) saturate(0.90)',
    eyebrow:  'VAS-03 · Defense Configuration',
    h1:       <>Ranger in<br /><span style={{ color: GREEN }}>uniform.</span></>,
    sub:      'Low-signature airframe, encrypted GCS link, and persistent tethered variant make Ranger a frontline ISR asset. No DGCA TC required under MoD exemption for military procurement.',
    mono:     'Defense ISR · forward deployment',
    tags:     ['MoD exempt', 'Encrypted link', 'Tethered variant'],
    tagFirst: 'tag tag-green',
    glow:     `radial-gradient(ellipse 55% 55% at 50% 42%, rgba(148,211,39,0.07) 0%, transparent 65%)`,
  },
  {
    img:      '/systems/ranger/ranger_different_scene.png',
    blend:    'screen' as const,
    pos:      'center',
    filter:   'brightness(0.80) contrast(1.07) saturate(1.10)',
    eyebrow:  'VAS-03 · Vortex Cloud GCS',
    h1:       <>Indian data.<br /><span style={{ color: BLUE }}>Indian servers.</span></>,
    sub:      "Vortex Cloud GCS — India's answer to DJI Flight Hub. NPNT-compliant multi-fleet coordination, real-time AI analytics, and mission planning. Every byte stored on Indian infrastructure.",
    mono:     'Vortex Cloud GCS · sovereign data',
    tags:     ['Vortex Cloud GCS', 'Indian data residency', 'Multi-fleet'],
    tagFirst: 'tag tag-blue',
    glow:     `radial-gradient(ellipse 60% 55% at 60% 45%, ${BLUE_DIM} 0%, transparent 65%)`,
  },
];

const INTERVAL = 5000;

/* ─── reusable corner bracket marks ─── */
const Corner = ({ accent = GREEN }: { accent?: string }) => (
  <>
    {[
      { top: 20,    left: 20 },
      { top: 20,    right: 20,  transform: 'scaleX(-1)' },
      { bottom: 20, left: 20,   transform: 'scaleY(-1)' },
      { bottom: 20, right: 20,  transform: 'scale(-1)' },
    ].map((pos, i) => (
      <div key={i} style={{ position: 'absolute', width: 20, height: 20, pointerEvents: 'none', zIndex: 4, ...pos }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, background: accent, opacity: 0.55 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 1, background: accent, opacity: 0.55 }} />
      </div>
    ))}
  </>
);

export default function RangerPage() {
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
              alt={`Ranger VAS-03 — ${slide.eyebrow}`}
              fill priority sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: slide.pos, mixBlendMode: slide.blend, filter: slide.filter }}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: slide.glow }} />
          </div>

          {/* Canvas darkening — Ranger's signature: stronger right fade */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            background: `
              linear-gradient(to right,  rgba(6,8,13,0.96) 0%, rgba(6,8,13,0.68) 32%, rgba(6,8,13,0.18) 58%, rgba(6,8,13,0.55) 100%),
              linear-gradient(to bottom, rgba(6,8,13,0.82) 0%, rgba(6,8,13,0.12) 22%, rgba(6,8,13,0.08) 58%, rgba(6,8,13,0.97) 100%)
            `,
          }} />

          {/* Subtle white grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.020) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.020) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          {/* Ghost designation top-right */}
          <div style={{
            position: 'absolute', top: 152, right: 56, zIndex: 3,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(72px, 11vw, 152px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
            WebkitTextStroke: `1px rgba(56,182,255,0.07)`, color: 'transparent',
            userSelect: 'none', pointerEvents: 'none',
          }}>
            VAS-03
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
          <div style={{ position: 'relative', zIndex: 5, padding: '160px 56px 80px', maxWidth: 820 }}>

            {/* eyebrow */}
            <div
              className="eyebrow eyebrow-blue"
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
                fontSize: 'clamp(48px, 7.5vw, 104px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.02em',
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
                fontSize: 16, color: '#7A8BA6', lineHeight: 1.78, maxWidth: 540, marginBottom: 36,
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
              <span className={slide.tagFirst}>{slide.tags[0]}</span>
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
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(56,182,255,0.55)',
                opacity: fading ? 0 : 1, transition: 'opacity 400ms ease',
              }}
            >
              {slide.mono}
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
                    border: i === active ? `1px solid rgba(56,182,255,0.45)` : 'none',
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
                  border: `1px solid rgba(56,182,255,0.22)`,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'monospace', fontSize: 14,
                  transition: 'border-color 220ms, color 220ms, background 220ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = BLUE;
                  (e.currentTarget as HTMLButtonElement).style.color = BLUE;
                  (e.currentTarget as HTMLButtonElement).style.background = BLUE_DIM;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(56,182,255,0.22)';
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
            §2  TOP VIEW — DESIGN AESTHETICS
            Left = image · Right = text · BG2 base
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh', background: BG2, borderBottom: `1px solid ${LINE}` }}>

          {/* Image column */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 560 }}>
            <Image
              src="/systems/ranger/ranger_top_view.png"
              alt="Ranger VAS-03 — symmetric hexacopter top view"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.85) contrast(1.07) saturate(1.08)' }}
            />
            {/* Blue glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 70% 70% at 50% 45%, ${BLUE_GLOW} 0%, transparent 70%)` }} />
            {/* Right bleed → text col */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, transparent 52%, ${BG2} 100%)` }} />
            {/* Top + bottom fades */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG2} 0%, transparent 10%, transparent 90%, ${BG2} 100%)` }} />
            <Corner accent={BLUE} />
            <div style={{ position: 'absolute', bottom: 24, left: 28, zIndex: 3, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52607A' }}>
              Top view · Symmetric hexacopter
            </div>
          </div>

          {/* Text column */}
          <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: `1px solid ${LINE}`, background: BG2, position: 'relative' }}>
            {/* Blue glow */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 60% at 80% 30%, ${BLUE_DIM} 0%, transparent 70%)` }} />

            <div className="eyebrow eyebrow-blue reveal r1" style={{ position: 'relative' }}>Airframe Design</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.01em', marginBottom: 28, color: '#E4EAF4', position: 'relative' }} className="reveal r2">
              Engineered for<br />precision — not<br />compromise.
            </h2>

            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 18, position: 'relative' }} className="reveal r3">
              Ranger&apos;s symmetric hexacopter arm layout is designed from geometry outward — not adapted from a commercial kit. Each arm is machined T700 carbon fibre, tuned for minimal vibration transfer to the payload bay. The folded footprint drops to 60 cm for vehicle transport.
            </p>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 36, position: 'relative' }} className="reveal r3">
              The airframe places the sensor payload at the geometric centre-of-lift, eliminating rotational torque errors in the mosaic. When your deliverable is a 1 cm/pixel orthomosaic — geometry is everything.
            </p>

            {[
              { k: 'Frame material',    v: 'T700 carbon fibre' },
              { k: 'Configuration',     v: 'Symmetric hexacopter' },
              { k: 'Folded footprint',  v: '~60 cm' },
              { k: 'Payload mount',     v: 'Geometric CoL centre' },
              { k: 'Vibration damping', v: 'Dual-stage isolation' },
            ].map((r) => (
              <div key={r.k} className="spec-row reveal r4" style={{ borderBottom: `1px solid ${LINE}`, position: 'relative' }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value">{r.v}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §3  MOTOR MACRO — BUILT TO ENDURE
            Image pinned right 55% · Text left · BG3 · green
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: BG3, borderBottom: `1px solid ${LINE}` }}>

          {/* Top bleed from §2 BG2 */}
          <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 80, zIndex: 1, background: `linear-gradient(to bottom, ${BG2} 0%, transparent 100%)`, pointerEvents: 'none' }} />

          {/* Motor image — right 55% */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', overflow: 'hidden' }}>
            <Image
              src="/systems/ranger/ranger_motor_macro.png"
              alt="Ranger brushless motor macro — altitude-tuned propulsion"
              fill sizes="55vw"
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.80) contrast(1.12) saturate(1.05)' }}
            />
            {/* Green ambient glow on motor coils */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 58% 58% at 45% 50%, rgba(148,211,39,0.09) 0%, transparent 65%)` }} />
            {/* Left bleed into text area */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${BG3} 0%, rgba(15,21,32,0.60) 28%, transparent 58%), linear-gradient(to bottom, ${BG3} 0%, transparent 8%, transparent 92%, ${BG3} 100%)` }} />
          </div>

          {/* Text — left */}
          <div style={{ position: 'relative', zIndex: 3, padding: '80px 56px', maxWidth: 540 }}>
            <div className="eyebrow reveal r1">Propulsion System</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 5vw, 70px)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.015em', marginBottom: 24, color: '#E4EAF4' }} className="reveal r2">
              Built to endure<br />where others<br /><span style={{ color: GREEN }}>land.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 40 }} className="reveal r3">
              Custom-wound brushless motors paired with altitude-tuned carbon fibre props deliver market-leading hover efficiency at density altitudes up to 4,200 m ASL. Ranger keeps flying when DJI-class platforms declare a ceiling.
            </p>

            {/* 4-stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 36 }}>
              {[
                { val: '4,200 m', key: 'Max altitude ceiling (ASL)' },
                { val: '52 min',  key: 'Hover endurance (no payload)' },
                { val: '6 kg',    key: 'Max takeoff weight' },
                { val: '−20–55°C', key: 'Operating temperature' },
              ].map((s) => (
                <div key={s.key} style={{ background: 'rgba(6,8,13,0.65)', border: `1px solid rgba(148,211,39,0.14)`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: GREEN, lineHeight: 1 }}>
                    {s.val}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#52607A' }}>{s.key}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="reveal r4">
              <span className="tag tag-green">High-altitude validated</span>
              <span className="tag">Motor-arm ESC mount</span>
              <span className="tag">IP53 rated</span>
            </div>
          </div>

          {/* Bottom bleed → BG */}
          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 80, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §4  CUTAWAY — INTERNAL SYSTEMS
            Full-width image · three annotation cards · manifest
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          {/* Header */}
          <div style={{ padding: '80px 56px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, borderBottom: `1px solid ${LINE}` }}>
            <div>
              <div className="eyebrow eyebrow-blue reveal r1">System Architecture</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4.5vw, 62px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4' }} className="reveal r2">
                Every system<br />in its right place.
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8 }} className="reveal r3">
                Ranger&apos;s internals are organised across two structural carbon fibre plates with dedicated zones for power, compute, and comms — no spaghetti wiring, no hot-glue engineering. Every component lives exactly where physics demands it.
              </p>
            </div>
          </div>

          {/* Cutaway image — full width, intrinsic sizing so nothing is ever clipped */}
          <div style={{ position: 'relative', width: '100%', background: BG, padding: '48px 0' }}>
            {/* Blue ambient glow behind the diagram */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(56,182,255,0.06) 0%, transparent 72%)` }} />
            {/* Use a natural <img> tag rendered at full width so objectFit:contain is respected with no crop */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/systems/ranger/ranger_cutway.png"
              alt="Ranger internal cutaway — system layout"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                mixBlendMode: 'screen',
                filter: 'brightness(0.94) contrast(1.06) saturate(1.05)',
                position: 'relative', zIndex: 1,
              }}
            />
            {/* Top + bottom fades to blend into section */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to top, ${BG} 0%, transparent 100%)` }} />
          </div>

          {/* Three annotation cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: LINE }}>
            {[
              {
                layer: 'Arms → lower plate',
                title: 'Power Distribution',
                body: 'ESCs are mounted directly at the motor-arm junction points — minimum power trace length, maximum thermal dissipation to the arm itself. The PDB is sandwiched between the CF plates with direct solder pads for clean, low-impedance current routing to each arm.',
                accent: GREEN,
              },
              {
                layer: 'Between CF plates',
                title: 'Flight Control Core',
                body: 'Cube Orange Plus autopilot with triple-redundant IMUs sits vibration-isolated on a double-damped mount between the structural plates. Drone ID tag and ADS-B Out module are co-located here for full Digital Sky airspace compliance.',
                accent: BLUE,
              },
              {
                layer: 'Upper CF plate',
                title: 'Compute & Comms',
                body: 'NVIDIA Jetson Orin Nano (onboard AI computer) + high-bandwidth network switch + SIYI air unit for RC and HD video. The switch forms a single low-latency network fabric connecting camera, Jetson, and air unit — no bottleneck, no single point of failure.',
                accent: BLUE,
              },
            ].map((item) => (
              <div key={item.title} style={{ background: BG2, padding: '40px 36px', borderTop: `2px solid ${item.accent}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                {/* Top glow strip matching accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, ${item.accent === BLUE ? BLUE_DIM : GREEN_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52607A', marginBottom: 20, position: 'relative' }}>{item.layer}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 600, color: '#E4EAF4', marginBottom: 14, position: 'relative' }}>{item.title}</div>
                <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.78, position: 'relative' }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* Component manifest grid — 4 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: LINE, borderTop: `1px solid ${LINE}` }}>
            {[
              { component: 'Cube Orange Plus', role: 'Flight controller',       layer: 'Mid plate' },
              { component: 'Jetson Orin Nano', role: 'Onboard AI compute',      layer: 'Top plate' },
              { component: 'SIYI Air Unit',    role: 'RC + HD video link',      layer: 'Top plate' },
              { component: 'Network Switch',   role: 'Camera · AI · RC fabric', layer: 'Top plate' },
              { component: 'PDB',              role: 'Power distribution',      layer: 'Mid plate' },
              { component: 'Motor-arm ESCs',   role: 'Per-arm speed control',   layer: 'Arms' },
              { component: 'Drone ID Tag',     role: 'DGCA Digital Sky',        layer: 'Mid plate' },
              { component: 'ADS-B Out',        role: 'Airspace broadcast',      layer: 'Mid plate' },
            ].map((c) => (
              <div key={c.component} style={{ background: BG, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 600, color: '#E4EAF4' }}>{c.component}</div>
                <div style={{ fontSize: 12, color: '#52607A' }}>{c.role}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginTop: 4 }}>{c.layer}</div>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §5  SCENE — full-bleed atmospheric
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '72vh', overflow: 'hidden', background: BG }}>
          <Image
            src="/systems/ranger/ranger_scene.png"
            alt="Ranger in field deployment — enterprise survey"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 48%', mixBlendMode: 'screen', filter: 'brightness(0.82) contrast(1.08) saturate(1.12)' }}
          />
          {/* Blue ambient glow */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 50% 55% at 55% 45%, rgba(56,182,255,0.07) 0%, transparent 65%)` }} />
          {/* Cinematic letterbox fades */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.82) 0%, rgba(6,8,13,0.06) 22%, rgba(6,8,13,0.06) 60%, rgba(6,8,13,0.94) 100%)` }} />

          {/* Caption bottom-left */}
          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: BLUE, marginBottom: 14 }}>
              Field Deployment · Enterprise Survey
            </div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              Ranger maps where<br /><span style={{ color: BLUE }}>teams can&apos;t go.</span>
            </h3>
          </div>

          {/* Bottom bleed → BG2 */}
          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §6  SPECS + DIFFERENT SCENE
            Left = spec table BG2 · Right = image
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', background: BG2, borderBottom: `1px solid ${LINE}` }} id="specs">

          {/* Specs column */}
          <div style={{ padding: '80px 56px', background: BG2, borderRight: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
            {/* Blue glow top-right corner */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 80% at 80% 10%, ${BLUE_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="eyebrow reveal r1" style={{ position: 'relative' }}>Technical Specifications</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 40, position: 'relative' }} className="reveal r2">
              Numbers that<br />matter in the field.
            </h2>

            {[
              { k: 'Sensors',          v: 'RGB / Multispectral / Thermal' },
              { k: 'GCS',              v: 'Vortex Cloud GCS' },
              { k: 'Max altitude',     v: '4,200 m ASL' },
              { k: 'Hover endurance',  v: '52 min (no payload)' },
              { k: 'Fleet management', v: 'Multi-fleet coordination' },
              { k: 'Tethered variant', v: 'Unlimited endurance' },
              { k: 'Data residency',   v: 'Indian servers only' },
              { k: 'Compliance',       v: 'NPNT · Digital Sky' },
              { k: 'TRL',              v: '6 · Production ready' },
            ].map((r, i) => (
              <div key={r.k} className="spec-row reveal" style={{ borderBottom: `1px solid ${LINE}`, position: 'relative', transitionDelay: `${i * 0.045}s` }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value">{r.v}</span>
              </div>
            ))}

            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }} className="reveal r5">
              <Link href="/partner" className="btn-primary">Request Briefing <span className="arr">→</span></Link>
              <Link href="/partner#contact-form" className="btn-outline">Get Pricing</Link>
            </div>
          </div>

          {/* Scene image column */}
          <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden', background: BG }}>
            <Image
              src="/systems/ranger/ranger_different_scene.png"
              alt="Ranger alternate deployment — survey operations"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.80) contrast(1.07) saturate(1.10)' }}
            />
            {/* Left and top/bottom fades */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to left, transparent 45%, ${BG2} 100%), linear-gradient(to bottom, ${BG2} 0%, transparent 12%, transparent 88%, ${BG2} 100%)` }} />
            {/* Blue accent glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 60% 45%, ${BLUE_DIM} 0%, transparent 65%)` }} />
            <div style={{ position: 'absolute', bottom: 28, right: 28, zIndex: 2, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52607A', textAlign: 'right' }}>
              Ranger · Enterprise survey deployment
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §7  MILITARY — TWO IMAGES SIDE BY SIDE
            Dark BG · green accents · defense config
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          {/* Header strip */}
          <div style={{ padding: '72px 56px 56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}`, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow reveal r1">Defense Configuration</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 62px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                Ranger in<br /><span style={{ color: GREEN }}>uniform.</span>
              </h2>
            </div>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, maxWidth: 460 }} className="reveal r3">
              The Ranger&apos;s civilian form factor belies its defense utility. Low-signature airframe, encrypted GCS link, and persistent tethered variant make it a frontline ISR asset — no DGCA TC required under MoD exemption for military procurement.
            </p>
          </div>

          {/* Two military images side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: LINE }}>
            {[
              { src: '/systems/ranger/ranger_military_1.png', cap: 'Forward ISR deployment' },
              { src: '/systems/ranger/ranger_military_2.png', cap: 'Tethered persistent surveillance' },
            ].map((img) => (
              <div key={img.src} style={{ position: 'relative', height: 500, overflow: 'hidden', background: BG }}>
                <Image
                  src={img.src}
                  alt={img.cap}
                  fill sizes="50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'screen', filter: 'brightness(0.76) contrast(1.12) saturate(0.90)' }}
                />
                {/* Green-tinted glow for military context */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 50% 42%, rgba(148,211,39,0.07) 0%, transparent 65%)` }} />
                {/* Top + bottom fades */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.62) 0%, transparent 18%, transparent 72%, rgba(6,8,13,0.80) 100%)` }} />
                <Corner accent={GREEN} />
                <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 3, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52607A' }}>{img.cap}</div>
              </div>
            ))}
          </div>

          {/* Defense capability cards — 4 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: LINE }}>
            {[
              { title: 'MoD Exempt',     body: 'No civilian type-certificate required for defense procurement and field trials under Ministry of Defence exemption.' },
              { title: 'Encrypted Link', body: 'SIYI encrypted RC + HD video downlink. Zero unencrypted telemetry in flight — ground-to-air and air-to-ground both secured.' },
              { title: 'Tethered ISR',   body: 'Unlimited endurance tethered configuration for fixed-point persistent forward surveillance at platoon level.' },
              { title: 'AI Cueing',      body: 'Jetson Orin Nano runs YOLOv8 target detection onboard. No GCS uplink required for cueing — works in denied RF environments.' },
            ].map((f) => (
              <div key={f.title} style={{ background: BG2, padding: '36px 32px', borderTop: `2px solid ${GREEN}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, background: `linear-gradient(to bottom, ${GREEN_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 600, color: '#E4EAF4', marginBottom: 12, position: 'relative' }}>{f.title}</div>
                <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.72, position: 'relative' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §8  CTA — PROCUREMENT
            BG2 · blue identity returns · two-col layout
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          {/* Blue glow top-left */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '60%', background: `radial-gradient(ellipse 80% 80% at 10% 10%, ${BLUE_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div className="eyebrow eyebrow-blue reveal r1">Procurement</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4.5vw, 66px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 24 }} className="reveal r2">
              Ready to deploy<br />Ranger?
            </h2>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8 }} className="reveal r3">
              Ranger is available for government survey contracts, enterprise fleet deployment, and defense ISR procurement. Vortex Cloud GCS SaaS subscription is included with every fleet purchase.
            </p>
          </div>

          <div style={{ position: 'relative' }} className="reveal r3">
            {[
              { k: 'SVAMITVA Survey',  v: 'Active program · GeM portal' },
              { k: 'State / NDRF',     v: 'Direct procurement pathway' },
              { k: 'Defense ISR',      v: 'MoD exempt · iDEX / DRDO TDF' },
              { k: 'GCS SaaS',         v: 'Per-fleet subscription' },
              { k: 'Fleet leasing',    v: 'Enterprise DaaS model' },
            ].map((r) => (
              <div key={r.k} className="spec-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value" style={{ color: '#7A8BA6' }}>{r.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner#contact-form" className="btn-primary">Initiate Procurement <span className="arr">→</span></Link>
              <Link href="/systems/vas04" className="btn-outline">Sentinel ISR →</Link>
            </div>
          </div>
        </section>

        {/* Prev / Next navigation strip */}
        <div style={{ padding: '32px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, flexWrap: 'wrap', gap: 16, background: BG }}>
          <Link href="/systems/vas02" className="btn-outline">← VAS-02 · Atlas Ag</Link>
          <Link href="/systems" className="btn-arrow" style={{ color: '#52607A' }}>
            All platforms <span className="arr">→</span>
          </Link>
          <Link href="/systems/vas04" className="btn-outline">VAS-04 · Sentinel →</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
