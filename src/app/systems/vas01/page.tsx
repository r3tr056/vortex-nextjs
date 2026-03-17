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
const GREEN_GLOW= 'rgba(148,211,39,0.14)';
const RED       = '#e84141';
const RED_DIM   = 'rgba(232,65,65,0.08)';

/* ─── hero carousel slides ─── */
const SLIDES = [
  {
    img:    '/systems/atlas/atlas_hero1.png',
    blend:  'screen' as const,
    pos:    'center 30%',
    filter: 'brightness(0.88) contrast(1.08) saturate(1.10)',
    eyebrow:'VAS-01 · Heavy-Lift Logistics',
    h1:     <>25 kg lifted.<br /><span style={{ color: GREEN }}>Any terrain. No roads needed.</span></>,
    sub:    "Atlas is Vortex's heavy-lift logistics platform — carrying 25 kg across 30 minutes of flight across terrain where roads end. Forward resupply, humanitarian relief, and medevac in a single airframe.",
    mono:   'Heavy-lift hex · 25 kg payload',
    tags:   ['Dual-Use', '25 kg payload', '30 min endurance', 'Fold-arm deploy'],
    glow:   `radial-gradient(ellipse 60% 65% at 50% 55%, ${GREEN_GLOW} 0%, transparent 68%)`,
  },
  {
    img:    '/systems/atlas/atlas_solo.png',
    blend:  'screen' as const,
    pos:    'center 42%',
    filter: 'brightness(0.85) contrast(1.08) saturate(1.10)',
    eyebrow:'VAS-01 · Modular Platform',
    h1:     <>One airframe.<br /><span style={{ color: GREEN }}>Any payload.</span></>,
    sub:    'Universal quick-release payload bay — swap between cargo, medevac, and sensor configurations in under 60 seconds. No tools. No downtime.',
    mono:   'Payload bay · quick-release config',
    tags:   ['Dual-Use', 'Quick-release bay', '60-sec swap'],
    glow:   `radial-gradient(ellipse 60% 65% at 50% 55%, ${GREEN_GLOW} 0%, transparent 68%)`,
  },
  {
    img:    '/systems/atlas/atlas_rough.png',
    blend:  'screen' as const,
    pos:    'center 55%',
    filter: 'brightness(0.78) contrast(1.10) saturate(1.20)',
    eyebrow:'VAS-01 · Field Deployment',
    h1:     <>Reaches where<br /><span style={{ color: GREEN }}>roads don&apos;t.</span></>,
    sub:    'Deployed at golden hour across desert, jungle, and high-altitude terrain. Atlas flies the routes that are impossible on the ground — last-mile logistics where it matters most.',
    mono:   'Field deployment · last-mile logistics',
    tags:   ['Dual-Use', 'IP53 rated', 'Multi-environment'],
    glow:   'radial-gradient(ellipse 60% 50% at 55% 40%, rgba(255,184,48,0.07) 0%, transparent 65%)',
  },
  {
    img:    '/systems/atlas/atlas_hero2.png',
    blend:  'screen' as const,
    pos:    'center 35%',
    filter: 'brightness(0.80) contrast(1.10) saturate(1.05)',
    eyebrow:'VAS-01 · Mission Capable',
    h1:     <>Forward resupply.<br /><span style={{ color: GREEN }}>Autonomous.</span></>,
    sub:    'Autonomous waypoint navigation with AI-assisted route optimisation and obstacle avoidance. Atlas flies the mission while the crew focuses on the objective.',
    mono:   'Forward logistics configuration',
    tags:   ['Dual-Use', 'AI-assisted nav', 'Waypoint auto'],
    glow:   `radial-gradient(ellipse 60% 65% at 50% 55%, ${GREEN_GLOW} 0%, transparent 68%)`,
  },
  {
    img:    '/systems/atlas/atlas_payload_medical.png',
    blend:  'screen' as const,
    pos:    'center 35%',
    filter: 'brightness(0.80) contrast(1.10) saturate(1.05)',
    eyebrow:'VAS-01 · Medical Evacuation',
    h1:     <>Medevac in minutes.<br /><span style={{ color: RED }}>Not hours.</span></>,
    sub:    'Rapid medical extraction from contested or inaccessible terrain. Medevac bay configuration accepts standard field medical containers — sub-60 second swap from logistics to life-critical mode.',
    mono:   'Medevac configuration · forward extraction',
    tags:   ['Medevac capable', 'Sub-60s config swap', 'Man-portable'],
    glow:   'radial-gradient(ellipse 60% 65% at 50% 55%, rgba(232,65,65,0.10) 0%, transparent 68%)',
  },
];

const INTERVAL = 5000;

/* ─── corner bracket marks ─── */
const Corner = ({ accent = GREEN }: { accent?: string }) => (
  <>
    {[
      { top: 20, left: 20 },
      { top: 20, right: 20, transform: 'scaleX(-1)' },
      { bottom: 20, left: 20, transform: 'scaleY(-1)' },
      { bottom: 20, right: 20, transform: 'scale(-1)' },
    ].map((pos, i) => (
      <div key={i} style={{ position: 'absolute', width: 20, height: 20, pointerEvents: 'none', zIndex: 4, ...pos }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, background: accent, opacity: 0.55 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 1, background: accent, opacity: 0.55 }} />
      </div>
    ))}
  </>
);

const Mono = ({ children, color = '#52607A' }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color }} >
    {children}
  </div>
);

export default function AtlasPage() {
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
              alt={`Atlas VAS-01 — ${slide.eyebrow}`}
              fill priority sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: slide.pos, mixBlendMode: slide.blend, filter: slide.filter }}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: slide.glow }} />
          </div>

          {/* Canvas darkening — always on top of image layers */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            background: `
              linear-gradient(to right,  rgba(6,8,13,0.97) 0%, rgba(6,8,13,0.75) 28%, rgba(6,8,13,0.20) 56%, rgba(6,8,13,0.55) 100%),
              linear-gradient(to bottom, rgba(6,8,13,0.75) 0%, rgba(6,8,13,0.08) 22%, rgba(6,8,13,0.05) 55%, rgba(6,8,13,0.97) 100%)
            `,
          }} />

          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(148,211,39,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(148,211,39,0.018) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          {/* Ghost designation */}
          <div style={{
            position: 'absolute', top: 152, right: 56, zIndex: 3,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(72px, 11vw, 152px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
            WebkitTextStroke: `1px rgba(148,211,39,0.07)`, color: 'transparent',
            userSelect: 'none', pointerEvents: 'none',
          }}>VAS-01</div>

          {/* Top bar — back link */}
          <div style={{
            position: 'absolute', top: 72, left: 0, right: 0, zIndex: 6,
            padding: '14px 56px', display: 'flex', alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(6,8,13,0.72) 0%, transparent 100%)',
          }}>
            <Link href="/systems" className="hero-back-link"><span>←</span> Back to Systems</Link>
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
                fontSize: 'clamp(52px, 7.5vw, 108px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em',
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
              <span className="tag tag-blue">{slide.tags[0]}</span>
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
            {/* Mono label */}
            <div
              key={`mono-${active}`}
              style={{ opacity: fading ? 0 : 1, transition: 'opacity 400ms ease' }}
            >
              <Mono color="rgba(148,211,39,0.55)">{slide.mono}</Mono>
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
            §2  DESIGN WIREFRAME — atlas_design.png
            Compact · specs overlaid on image · no separate header
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative' }}>

          {/* Image with specs overlaid — natural width, fixed viewport height */}
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: BG2 }}>

            {/* Green ambient glow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 65% at 50% 52%, ${GREEN_DIM} 0%, transparent 70%)` }} />

            {/* Section label — top left */}
            <div style={{ position: 'absolute', top: 28, left: 56, zIndex: 4 }} className="reveal r1">
              <div className="eyebrow" style={{ marginBottom: 0 }}>Airframe Design · VAS-01</div>
            </div>

            {/* Wireframe image — full width, natural aspect */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/systems/atlas/atlas_design.png"
              alt="Atlas VAS-01 technical wireframe"
              style={{ display: 'block', width: '100%', height: 'auto', mixBlendMode: 'screen', filter: 'brightness(1.02) contrast(1.04) saturate(1.02)', position: 'relative', zIndex: 1 }}
            />

            {/* Top fade */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG2} 0%, transparent 100%)` }} />
            {/* Bottom fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to top, ${BG2} 0%, transparent 100%)` }} />

            {/* ── Spec overlay cards ── */}
            {/* Left column — top */}
            <div style={{ position: 'absolute', top: '18%', left: 40, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Configuration', val: 'Symmetric hexacopter', sub: '6-arm · 6-motor' },
                { label: 'Frame material', val: 'T700 carbon fibre', sub: 'CNC-machined arms' },
              ].map((c) => (
                <div key={c.label} style={{ background: 'rgba(6,8,13,0.78)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.14)`, padding: '12px 16px', minWidth: 190 }} className="reveal r2">
                  <Mono>{c.label}</Mono>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: '#E4EAF4', marginTop: 5, lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: '#52607A', marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Right column — top */}
            <div style={{ position: 'absolute', top: '18%', right: 40, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              {[
                { label: 'Payload bay', val: 'Universal quick-release', sub: 'Centre-CoG · modular' },
                { label: 'Fold-arm system', val: 'Vehicle-portable', sub: 'Deploy in <5 min' },
              ].map((c) => (
                <div key={c.label} style={{ background: 'rgba(6,8,13,0.78)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.14)`, padding: '12px 16px', minWidth: 190, textAlign: 'right' }} className="reveal r2">
                  <Mono>{c.label}</Mono>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: '#E4EAF4', marginTop: 5, lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: '#52607A', marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Bottom stat strip — overlaid above bottom fade */}
            <div style={{ position: 'absolute', bottom: 24, left: 56, right: 56, zIndex: 3, display: 'flex', gap: 4 }}>
              {[
                { val: '25 kg',    key: 'Lift capacity' },
                { val: '30 min',   key: 'Endurance' },
                { val: '3500 m',   key: 'Altitude rated' },
                { val: 'IP53',     key: 'Environment' },
                { val: 'AI-nav',   key: 'Autonomy stack' },
              ].map((s) => (
                <div key={s.key} style={{ flex: 1, background: 'rgba(6,8,13,0.82)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.12)`, padding: '14px 16px', textAlign: 'center' }} className="reveal r3">
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.val}</div>
                  <Mono>{s.key}</Mono>
                </div>
              ))}
            </div>
          </div>

          {/* Brief descriptor line below image */}
          <div style={{ padding: '20px 56px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: `1px solid ${LINE}` }}>
            <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.7, maxWidth: 620 }}>
              Atlas is engineered from the payload outward — symmetric hex geometry distributes 25 kg loads evenly across six arms, delivering 30-minute endurance across desert, high-altitude, and tropical terrain. Intelligent AI autonomy, IP53 multi-environment rating, and fold-arm portability make it operable by a two-person crew with zero pre-flight tools.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag tag-green">25 kg lift</span>
              <span className="tag">30 min endurance</span>
              <span className="tag">Multi-environment</span>
              <span className="tag">Intelligent AI nav</span>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §3  BARE FRAME — atlas_frame.png
            Image right · text left · BG3 · raw engineering
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: BG3, borderBottom: `1px solid ${LINE}` }}>

          {/* Top bleed from BG2 */}
          <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 80, zIndex: 1, background: `linear-gradient(to bottom, ${BG2} 0%, transparent 100%)`, pointerEvents: 'none' }} />

          {/* Frame image — right 55% */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', overflow: 'hidden' }}>
            <Image
              src="/systems/atlas/atlas_frame.png"
              alt="Atlas bare carbon fibre frame — no payload, no props"
              fill sizes="55vw"
              style={{ objectFit: 'cover', objectPosition: 'center 40%', mixBlendMode: 'screen', filter: 'brightness(0.90) contrast(1.10) saturate(0.85)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 60% at 45% 48%, rgba(148,211,39,0.06) 0%, transparent 65%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${BG3} 0%, rgba(15,21,32,0.50) 25%, transparent 55%), linear-gradient(to bottom, ${BG3} 0%, transparent 8%, transparent 92%, ${BG3} 100%)` }} />
          </div>

          {/* Text — left */}
          <div style={{ position: 'relative', zIndex: 3, padding: '80px 56px', maxWidth: 540 }}>
            <div className="eyebrow reveal r1">Structural Engineering</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', marginBottom: 24, color: '#E4EAF4' }} className="reveal r2">
              The frame that<br />carries what<br /><span style={{ color: GREEN }}>others won&apos;t.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 40 }} className="reveal r3">
              The bare Atlas frame weighs under 4 kg — yet its T700 carbon fibre arm tubes and octagonal central hub are rated for 25 kg+ sustained payload. Motor mounts are PA12-CF printed: stronger than aluminium at a third of the weight, field-replaceable without tools.
            </p>

            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 36 }}>
              {[
                { val: '25 kg',   key: 'Payload capacity' },
                { val: '30 min',  key: 'Flight endurance' },
                { val: '6 arms',  key: 'Symmetric hex layout' },
                { val: 'T700 CF', key: 'Arm tube material' },
              ].map((s) => (
                <div key={s.key} style={{ background: 'rgba(6,8,13,0.65)', border: `1px solid rgba(148,211,39,0.14)`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: GREEN, lineHeight: 1 }}>{s.val}</span>
                  <Mono>{s.key}</Mono>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="reveal r4">
              <span className="tag tag-green">PA12-CF motor mounts</span>
              <span className="tag">Field-replaceable arms</span>
              <span className="tag">IP53 rated</span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 80, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §4  PAYLOAD BOX MACRO — atlas_payload_box.png
            Full-bleed cinematic · carbon fibre payload bay
            green rim light · modular payload story
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '75vh', overflow: 'hidden', background: BG }}>
          <Image
            src="/systems/atlas/atlas_payload_box.png"
            alt="Atlas modular carbon fibre payload bay — close-up"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 45%', mixBlendMode: 'screen', filter: 'brightness(0.90) contrast(1.12) saturate(1.15)' }}
          />
          {/* Green ambient */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 48% 52%, ${GREEN_GLOW} 0%, transparent 65%)` }} />
          {/* Letterbox fades */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.88) 0%, rgba(6,8,13,0.05) 20%, rgba(6,8,13,0.05) 65%, rgba(6,8,13,0.95) 100%)` }} />
          {/* Right-side panel for text */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to left, rgba(6,8,13,0.94) 0%, rgba(6,8,13,0.65) 28%, transparent 55%)` }} />

          {/* Text — bottom right */}
          <div style={{ position: 'absolute', bottom: 56, right: 56, zIndex: 3, maxWidth: 440, textAlign: 'right' }}>
            <Mono color={GREEN}>Modular Payload Bay · Quick-Release</Mono>
            <div style={{ height: 16 }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(26px, 3.5vw, 48px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              One airframe.<br /><span style={{ color: GREEN }}>Any payload.</span>
            </h3>
            <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.75, marginTop: 16 }}>
              The CF payload bay interfaces via a universal quick-release plate — swap between cargo, medevac, and sensor configurations in under 60 seconds without tools.
            </p>
          </div>

          {/* Payload mode strip — bottom left */}
          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { val: 'Cargo box',  key: 'Standard logistics' },
              { val: 'Medevac',    key: 'Medical evacuation' },
              { val: '25 kg+',     key: 'Max payload' },
            ].map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em' }}>{s.val}</span>
                <Mono color="#52607A">{s.key}</Mono>
              </div>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §5  FIELD SCENE — atlas_rough.png
            Full-bleed outdoor · golden hour · atmospheric
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '70vh', overflow: 'hidden', background: BG2 }}>
          <Image
            src="/systems/atlas/atlas_rough.png"
            alt="Atlas deployed in field — golden hour terrain"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 55%', mixBlendMode: 'screen', filter: 'brightness(0.78) contrast(1.10) saturate(1.20)' }}
          />
          {/* Warm amber glow — matches the golden hour */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 50% at 55% 40%, rgba(255,184,48,0.07) 0%, transparent 65%)` }} />
          {/* Fades */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.82) 0%, rgba(6,8,13,0.05) 20%, rgba(6,8,13,0.05) 62%, rgba(6,8,13,0.94) 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, rgba(6,8,13,0.85) 0%, transparent 35%, transparent 65%, rgba(6,8,13,0.85) 100%)` }} />

          {/* Caption — bottom left */}
          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3 }}>
            <Mono color="rgba(148,211,39,0.8)">Field Deployment · Last-Mile Logistics</Mono>
            <div style={{ height: 14 }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              Reaches where<br /><span style={{ color: GREEN }}>roads don&apos;t.</span>
            </h3>
          </div>

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §6  SPECS — id="specs"
            Left = 12-row spec table · Right = atlas_solo.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', background: BG2, borderBottom: `1px solid ${LINE}` }} id="specs">

          {/* Spec table */}
          <div style={{ padding: '80px 56px', background: BG2, borderRight: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 80% at 80% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="eyebrow reveal r1" style={{ position: 'relative' }}>Technical Specifications</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 40, position: 'relative' }} className="reveal r2">
              Rated for the<br />mission, not the lab.
            </h2>

            {[
              { k: 'Configuration',    v: 'Symmetric hexacopter' },
              { k: 'Payload capacity', v: '25 kg' },
              { k: 'Endurance',        v: '30 minutes' },
              { k: 'Altitude rated',   v: '3500 m AMSL' },
              { k: 'Frame material',   v: 'T700 carbon fibre' },
              { k: 'Motor mounts',     v: 'PA12-CF printed' },
              { k: 'Autonomy',         v: 'Waypoint + AI-assisted' },
              { k: 'Mission profiles', v: 'Resupply / Medevac / Cargo' },
              { k: 'Environment',      v: 'Desert · High-alt · Tropical' },
              { k: 'Flight controller',v: 'Cube Orange Plus' },
              { k: 'Compliance',       v: 'NPNT · Digital Sky' },
              { k: 'TRL',              v: '6 · Production ready' },
            ].map((r, i) => (
              <div key={r.k} className="spec-row reveal" style={{ borderBottom: `1px solid ${LINE}`, position: 'relative', transitionDelay: `${i * 0.038}s` }}>
                <span className="spec-key">{r.k}</span>
                <span className="spec-value">{r.v}</span>
              </div>
            ))}

            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }} className="reveal r5">
              <Link href="/partner" className="btn-primary">Request Briefing <span className="arr">→</span></Link>
              <Link href="/partner#contact-form" className="btn-outline">Get Pricing</Link>
            </div>
          </div>

          {/* Side image — atlas_solo with green glow payload */}
          <div style={{ position: 'relative', minHeight: 600, overflow: 'hidden', background: BG }}>
            <Image
              src="/systems/atlas/atlas_solo.png"
              alt="Atlas VAS-01 three-quarter view with payload"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center 42%', mixBlendMode: 'screen', filter: 'brightness(0.85) contrast(1.08) saturate(1.10)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to left, transparent 40%, ${BG2} 100%), linear-gradient(to bottom, ${BG2} 0%, transparent 10%, transparent 88%, ${BG2} 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 55% 48%, ${GREEN_DIM} 0%, transparent 68%)` }} />
            <Corner accent={GREEN} />
            <div style={{ position: 'absolute', bottom: 28, right: 28, zIndex: 2, textAlign: 'right' }}>
              <Mono>Atlas VAS-01 · Payload configuration</Mono>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §7  MISSION CONFIGURATIONS
            Header · atlas_hero2 + atlas_payload_medical side by side
            Logistics vs Medevac · capability cards
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          {/* Header */}
          <div style={{ padding: '72px 56px 56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}`, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow reveal r1">Mission Configurations</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                One airframe.<br /><span style={{ color: GREEN }}>Every mission.</span>
              </h2>
            </div>
            <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, maxWidth: 460 }} className="reveal r3">
              Atlas swaps between mission configurations in under 60 seconds — logistics cargo, medevac extraction, or precision sensor payload. The universal quick-release bay accepts all three without modification to the airframe or flight stack.
            </p>
          </div>

          {/* Two mission images side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: LINE }}>
            {[
              {
                src: '/systems/atlas/atlas_hero2.png',
                cap: 'Forward logistics — Vortex cargo config',
                label: 'LOGISTICS',
                accent: GREEN,
              },
              {
                src: '/systems/atlas/atlas_payload_medical.png',
                cap: 'Medevac — forward extraction',
                label: 'MEDEVAC',
                accent: RED,
              },
            ].map((img) => (
              <div key={img.src} style={{ position: 'relative', height: 520, overflow: 'hidden', background: BG }}>
                <Image
                  src={img.src}
                  alt={img.cap}
                  fill sizes="50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 35%', mixBlendMode: 'screen', filter: 'brightness(0.80) contrast(1.10) saturate(1.05)' }}
                />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 50% at 50% 42%, ${img.accent === GREEN ? 'rgba(148,211,39,0.07)' : 'rgba(232,65,65,0.07)'} 0%, transparent 65%)` }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.60) 0%, transparent 18%, transparent 72%, rgba(6,8,13,0.82) 100%)` }} />
                <Corner accent={img.accent} />
                {/* Config label — top left badge */}
                <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 3 }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: img.accent, background: `rgba(${img.accent === GREEN ? '148,211,39' : '232,65,65'},0.10)`,
                    border: `1px solid ${img.accent === GREEN ? 'rgba(148,211,39,0.22)' : 'rgba(232,65,65,0.22)'}`,
                    padding: '5px 10px',
                  }}>{img.label}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 3 }}>
                  <Mono>{img.cap}</Mono>
                </div>
              </div>
            ))}
          </div>

          {/* 4 capability cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: LINE }}>
            {[
              {
                title: 'Forward Resupply',
                body: 'Deliver 25 kg+ to forward operating bases and inaccessible terrain. Autonomous waypoint navigation with AI-assisted route optimisation and obstacle avoidance.',
                accent: GREEN,
              },
              {
                title: 'Medevac Capable',
                body: 'Rapid medical extraction from contested or inaccessible terrain. Medevac bay configuration accepts standard field medical containers with sub-60s swap time.',
                accent: RED,
              },
              {
                title: 'Fold-Arm Deploy',
                body: 'Compact fold-arm design deploys from vehicle transport in under 5 minutes by a two-person crew. No special tools. No pre-flight calibration required.',
                accent: GREEN,
              },
              {
                title: 'Dual-Use Cleared',
                body: 'Civil-certified airframe with dual-use capability — no MoD exemption required for logistics and humanitarian operations. GeM portal listed for government procurement.',
                accent: GREEN,
              },
            ].map((f) => (
              <div key={f.title} style={{ background: BG2, padding: '36px 32px', borderTop: `2px solid ${f.accent}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, background: `linear-gradient(to bottom, ${f.accent === GREEN ? GREEN_DIM : RED_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 600, color: '#E4EAF4', marginBottom: 12, position: 'relative' }}>{f.title}</div>
                <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.72, position: 'relative' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §8  CTA — PROCUREMENT
            atlas_solo_2 background · green identity
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>

          {/* Background drone image — very faint right side */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', overflow: 'hidden', opacity: 0.35 }}>
            <Image
              src="/systems/atlas/atlas_solo_2.png"
              alt=""
              fill sizes="48vw"
              style={{ objectFit: 'cover', objectPosition: 'center 38%', mixBlendMode: 'screen', filter: 'brightness(0.70) contrast(1.05) saturate(0.80)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to right, ${BG2} 0%, transparent 40%)` }} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            {/* Green glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '60%', background: `radial-gradient(ellipse 80% 80% at 10% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div className="eyebrow reveal r1">Procurement</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 24 }} className="reveal r2">
                Deploy Atlas<br />for your mission?
              </h2>
              <p style={{ fontSize: 15, color: '#7A8BA6', lineHeight: 1.8, marginBottom: 28 }} className="reveal r3">
                Atlas is available for defense logistics contracts, civil humanitarian operations, and government fleet procurement. Dual-use classification means civilian TC suffices — no MoD exemption required.
              </p>
              {/* Dual-use callout */}
              <div style={{ padding: '20px 24px', background: BG3, border: `1px solid rgba(148,211,39,0.12)`, borderLeft: `3px solid ${GREEN}` }} className="reveal r4">
                <Mono color={GREEN}>Dual-use classification</Mono>
                <p style={{ fontSize: 13, color: '#7A8BA6', lineHeight: 1.7, marginTop: 8 }}>
                  Atlas operates under civil certification for logistics and humanitarian missions. Defense logistics commands may procure directly without MoD exemption — reducing procurement timeline significantly vs. defense-classified platforms.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative' }} className="reveal r3">
              {[
                { k: 'Civil logistics',    v: 'GeM portal · Direct contract' },
                { k: 'Disaster relief',    v: 'NDRF / State civil defence' },
                { k: 'Def. logistics',     v: 'No MoD exemption required' },
                { k: 'Humanitarian ops',   v: 'UN / NGO direct supply' },
                { k: 'Fleet leasing',      v: 'DaaS logistics model' },
                { k: 'Custom payloads',    v: 'OEM bay integration' },
              ].map((r) => (
                <div key={r.k} className="spec-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <span className="spec-key">{r.k}</span>
                  <span className="spec-value" style={{ color: '#7A8BA6' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/partner#contact-form" className="btn-primary">Initiate Procurement <span className="arr">→</span></Link>
                <Link href="/systems/vas02" className="btn-outline">Atlas Ag →</Link>
              </div>
            </div>
          </div>
        </section>


        {/* Prev / Next nav */}
        <div style={{ padding: '32px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, flexWrap: 'wrap', gap: 16, background: BG }}>
          <Link href="/systems" className="btn-outline">← All Platforms</Link>
          <Link href="/systems" className="btn-arrow" style={{ color: '#52607A' }}>
            All platforms <span className="arr">→</span>
          </Link>
          <Link href="/systems/vas02" className="btn-outline">VAS-02 · Atlas Ag →</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
