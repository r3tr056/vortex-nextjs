'use client';

import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── colour tokens ─── */
const BG         = '#06080D';
const BG2        = '#07090C';
const BG3        = '#0B0F0A';
const LINE       = 'rgba(255,255,255,0.06)';
const GREEN      = '#94d327';
const GREEN_DIM  = 'rgba(148,211,39,0.08)';
const GREEN_GLOW = 'rgba(148,211,39,0.18)';
const GREEN_MID  = 'rgba(148,211,39,0.55)';

/* ─── hero carousel slides ─── */
const SLIDES = [
  {
    img:      '/systems/atlas_ag/atlas_ag_hero1.png',
    blend:    'screen' as const,
    pos:      'center 42%',
    filter:   'brightness(0.90) contrast(1.08) saturate(1.10)',
    eyebrow:  'VAS-02 · Precision Agriculture',
    h1:       <>Every acre covered.<br /><span style={{ color: GREEN }}>Every drop counted.</span></>,
    sub:      'Atlas Ag is Vortex\'s precision agriculture platform — 10–16 litres, AI-mapped autonomous field missions, and interchangeable spray, seed, and hybrid payload bays.',
    mono:     'Spray configuration · full nozzle array',
    tags:     ['Civil · Agriculture', '10–16 L tank', '~1 ac/min', 'SMAM eligible'],
    glow:     'radial-gradient(ellipse 65% 50% at 50% 68%, rgba(148,211,39,0.18) 0%, transparent 65%)',
  },
  {
    img:      '/systems/atlas_ag/atlas_ag_sprayer2.png',
    blend:    'screen' as const,
    pos:      'center 52%',
    filter:   'brightness(0.88) contrast(1.10) saturate(1.12)',
    eyebrow:  'VAS-02 · Boom Spray System',
    h1:       <>Wide boom.<br /><span style={{ color: GREEN }}>Zero drift.</span></>,
    sub:      'Folding boom arms extend the spray array wide of the motor wash — eliminating prop-wash drift. Variable-rate flow control on every nozzle.',
    mono:     'Boom-mounted · anti-drift atomisation',
    tags:     ['Boom-mounted nozzles', 'Variable-rate flow', 'AGL terrain-follow'],
    glow:     'radial-gradient(ellipse 60% 55% at 48% 58%, rgba(148,211,39,0.16) 0%, transparent 65%)',
  },
  {
    img:      '/systems/atlas_ag/atlas_ag_field1.png',
    blend:    'normal' as const,
    pos:      'center 50%',
    filter:   'brightness(0.80) contrast(1.08) saturate(1.12)',
    eyebrow:  'VAS-02 · Field Operations',
    h1:       <>From the sky —<br /><span style={{ color: GREEN }}>wall-to-wall coverage.</span></>,
    sub:      'Autonomous AI-mapped missions require one operator. The drone reads the field, plans the grid, and completes the run — you just press go.',
    mono:     'Field operations · active spray · soybean',
    tags:     ['AI field planning', 'Single operator', 'GPS auto-grid'],
    glow:     'radial-gradient(ellipse 70% 45% at 50% 75%, rgba(148,211,39,0.12) 0%, transparent 60%)',
  },
  {
    img:      '/systems/atlas_ag/atlas_ag_field2.png',
    blend:    'normal' as const,
    pos:      'center 45%',
    filter:   'brightness(0.78) contrast(1.10) saturate(1.18)',
    eyebrow:  'VAS-02 · Kharif Season',
    h1:       <>Paddy to wheat.<br /><span style={{ color: GREEN }}>Kharif to rabi.</span></>,
    sub:      'One airframe, twelve months, two full crop cycles. Atlas Ag operates across all major Indian cropping systems with no seasonal downtime.',
    mono:     'Kharif operations · maize · early season',
    tags:     ['Year-round ops', 'All crop types', 'DaaS ready'],
    glow:     'radial-gradient(ellipse 65% 40% at 50% 80%, rgba(148,211,39,0.10) 0%, transparent 60%)',
  },
  {
    img:      '/systems/atlas_ag/atlas_ag_hero2.png',
    blend:    'screen' as const,
    pos:      'center 50%',
    filter:   'brightness(0.88) contrast(1.08) saturate(1.10)',
    eyebrow:  'VAS-02 · SMAM Subsidy',
    h1:       <>Indian farmers.<br /><span style={{ color: GREEN }}>Indian subsidy.</span></>,
    sub:      'SMAM subsidy-eligible post-Type Certification. 40–100% capital subsidy for farmers and FPOs through Sub-Mission on Agricultural Mechanization.',
    mono:     'Full boom arm configuration · studio',
    tags:     ['SMAM eligible', 'NPNT compliant', 'FPO / CHC ready'],
    glow:     'radial-gradient(ellipse 60% 55% at 50% 55%, rgba(148,211,39,0.15) 0%, transparent 65%)',
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
  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color }}>
    {children}
  </div>
);

export default function AtlasAgPage() {
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
              alt={`Atlas Ag — ${slide.eyebrow}`}
              fill priority sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: slide.pos, mixBlendMode: slide.blend, filter: slide.filter }}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: slide.glow }} />
          </div>

          {/* Canvas darkening — always on top of image layers */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            background: `
              linear-gradient(to right,  rgba(6,8,13,0.96) 0%, rgba(6,8,13,0.70) 30%, rgba(6,8,13,0.18) 58%, rgba(6,8,13,0.52) 100%),
              linear-gradient(to bottom, rgba(6,8,13,0.80) 0%, rgba(6,8,13,0.06) 24%, rgba(6,8,13,0.04) 55%, rgba(6,8,13,0.97) 100%)
            `,
          }} />

          {/* Subtle field grid */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(148,211,39,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(148,211,39,0.016) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          {/* Ghost designation */}
          <div style={{
            position: 'absolute', top: 152, right: 56, zIndex: 4,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(72px, 11vw, 152px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
            WebkitTextStroke: `1px rgba(148,211,39,0.07)`, color: 'transparent',
            userSelect: 'none', pointerEvents: 'none',
          }}>VAS-02</div>

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
              <span className="tag tag-agri">{slide.tags[0]}</span>
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
              style={{
                opacity: fading ? 0 : 1, transition: 'opacity 400ms ease',
              }}
            >
              <Mono color={GREEN_MID}>{slide.mono}</Mono>
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

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 120, zIndex: 5, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §2  AIRFRAME — atlas_frame.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: 28, left: 56, zIndex: 4 }} className="reveal r1">
            <div className="eyebrow" style={{ marginBottom: 0 }}>Airframe · VAS-02</div>
          </div>

          <div style={{ position: 'relative', width: '100%', background: BG2 }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 58% 62% at 50% 46%, ${GREEN_DIM} 0%, transparent 68%)` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/systems/atlas_ag/atlas_frame.png"
              alt="Atlas Ag VAS-02 — bare carbon fibre hexacopter frame"
              style={{ display: 'block', width: '100%', height: 'auto', mixBlendMode: 'screen', filter: 'brightness(0.95) contrast(1.06) saturate(0.90)', position: 'relative', zIndex: 1 }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${BG2} 0%, transparent 100%)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to top, ${BG2} 0%, transparent 100%)` }} />

            <div style={{ position: 'absolute', top: '18%', left: 40, zIndex: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Configuration', val: 'Symmetric hexacopter', sub: '6-arm · 6-motor' },
                { label: 'Frame material', val: 'T700 carbon fibre', sub: 'Fold-arm · field deploy' },
              ].map((c) => (
                <div key={c.label} style={{ background: 'rgba(6,8,13,0.82)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.14)`, padding: '12px 16px', minWidth: 195 }} className="reveal r2">
                  <Mono>{c.label}</Mono>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: '#E4EAF4', marginTop: 5, lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: '#52607A', marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', top: '18%', right: 40, zIndex: 4, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              {[
                { label: 'Spray boom', val: 'Folding boom arms', sub: 'Extended-reach nozzles' },
                { label: 'Payload bay', val: 'Quick-release module', sub: 'Spray / Seed / Hybrid' },
              ].map((c) => (
                <div key={c.label} style={{ background: 'rgba(6,8,13,0.82)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.14)`, padding: '12px 16px', minWidth: 195, textAlign: 'right' }} className="reveal r2">
                  <Mono>{c.label}</Mono>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: '#E4EAF4', marginTop: 5, lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: '#52607A', marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: 24, left: 56, right: 56, zIndex: 4, display: 'flex', gap: 4 }}>
              {[
                { val: '10–16 L', key: 'Tank capacity' },
                { val: '~1 ac/min', key: 'Coverage rate' },
                { val: '4 nozzles', key: 'Spray array' },
                { val: 'Var-rate', key: 'Flow control' },
                { val: 'AI-mapped', key: 'Field missions' },
              ].map((s) => (
                <div key={s.key} style={{ flex: 1, background: 'rgba(6,8,13,0.85)', backdropFilter: 'blur(8px)', border: `1px solid rgba(148,211,39,0.12)`, padding: '14px 16px', textAlign: 'center' }} className="reveal r3">
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.val}</div>
                  <Mono>{s.key}</Mono>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '18px 56px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: `1px solid ${LINE}` }}>
            <p style={{ fontSize: 13, color: '#52607A', lineHeight: 1.7, maxWidth: 640 }}>
              Symmetric hexacopter with fold-arm portability, T700 carbon fibre structure, and a universal quick-release payload bay — swap between spray nozzle array, seed spreader, and hybrid configurations without tools.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag tag-green">Fold-arm portable</span>
              <span className="tag">NPNT · Digital Sky</span>
              <span className="tag">IP53 rated</span>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §3  SPRAY SYSTEM — atlas_ag_sprayer2.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '55% 45%', background: BG3, borderBottom: `1px solid ${LINE}` }}>

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 540 }}>
            <Image
              src="/systems/atlas_ag/atlas_ag_sprayer2.png"
              alt="Atlas Ag — wide boom arms fully extended, 6-nozzle spray system"
              fill sizes="55vw"
              style={{ objectFit: 'cover', objectPosition: 'center 52%', mixBlendMode: 'screen', filter: 'brightness(0.88) contrast(1.10) saturate(1.12)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 55% at 48% 55%, ${GREEN_GLOW} 0%, transparent 65%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${BG3} 0%, transparent 12%, transparent 78%, ${BG3} 100%), linear-gradient(to bottom, ${BG3} 0%, transparent 8%, transparent 90%, ${BG3} 100%)` }} />
            <Corner accent={GREEN} />
            <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 3 }}>
              <Mono color={GREEN}>Boom spray system · Extended configuration</Mono>
            </div>
          </div>

          <div style={{ padding: '68px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="eyebrow reveal r1">Spray System</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 3.8vw, 54px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 22 }} className="reveal r2">
              Wide boom.<br /><span style={{ color: GREEN }}>Zero drift.</span>
            </h2>
            <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.82, marginBottom: 32 }} className="reveal r3">
              Folding boom arms extend the spray array wide of the motor wash zone — eliminating prop-wash drift. Variable-rate flow control across nozzles adjusts spray volume per metre in real-time based on AI prescription maps or NDVI input.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 28 }}>
              {[
                { val: '10–16 L', key: 'Tank capacity' },
                { val: '~1 ac/min', key: 'Coverage rate' },
                { val: 'Boom-mounted', key: 'Anti-drift nozzles' },
                { val: 'AGL hold', key: 'Terrain-following' },
              ].map((s) => (
                <div key={s.key} style={{ background: 'rgba(6,8,13,0.55)', border: `1px solid rgba(148,211,39,0.12)`, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }} className="reveal r3">
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.val}</span>
                  <Mono>{s.key}</Mono>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="reveal r4">
              <span className="tag tag-green">Variable-rate flow</span>
              <span className="tag">Anti-drift atomisation</span>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §4  NOZZLE MACRO — atlas_ag_sprayer_macro.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '70vh', overflow: 'hidden', background: BG }}>
          <Image
            src="/systems/atlas_ag/atlas_ag_sprayer_macro.png"
            alt="Atlas Ag — single variable-rate nozzle atomising green spray"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 48%', mixBlendMode: 'screen', filter: 'brightness(0.92) contrast(1.10) saturate(1.12)' }}
          />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 50% 55% at 50% 52%, ${GREEN_GLOW} 0%, transparent 62%)` }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.85) 0%, rgba(6,8,13,0.04) 22%, rgba(6,8,13,0.04) 65%, rgba(6,8,13,0.96) 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to left, rgba(6,8,13,0.88) 0%, rgba(6,8,13,0.50) 28%, transparent 55%)` }} />

          <div style={{ position: 'absolute', bottom: 56, right: 56, zIndex: 3, maxWidth: 400, textAlign: 'right' }}>
            <Mono color={GREEN_MID}>Variable-Rate Nozzle · Flat-Fan Atomisation</Mono>
            <div style={{ height: 16 }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(24px, 3vw, 44px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              Precision at the tip.<br /><span style={{ color: GREEN }}>Measured to the millilitre.</span>
            </h3>
            <p style={{ fontSize: 13, color: '#7A8BA6', lineHeight: 1.75, marginTop: 14 }}>
              Flat-fan nozzles produce consistent droplet size across the spray arc. Flow sensors on each boom arm feed real-time data to the flight controller — adjusting pump pressure to maintain constant L/ha regardless of speed or altitude variation.
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { val: 'Flat-fan', key: 'Nozzle type' },
              { val: 'Var-rate', key: 'L/ha control' },
              { val: '±5%',      key: 'Flow accuracy' },
            ].map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: '-0.01em' }}>{s.val}</span>
                <Mono color="#52607A">{s.key}</Mono>
              </div>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG3} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §5  TANK MACRO — atlas_ag_tank_macro.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '55% 45%', background: BG3, borderBottom: `1px solid ${LINE}` }}>

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 500 }}>
            <Image
              src="/systems/atlas_ag/atlas_ag_tank_macro.png"
              alt="Atlas Ag — tank body with outlet valve and green flow tube macro"
              fill sizes="55vw"
              style={{ objectFit: 'cover', objectPosition: '35% 50%', mixBlendMode: 'screen', filter: 'brightness(0.92) contrast(1.08) saturate(1.10)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 60% at 42% 50%, ${GREEN_GLOW} 0%, transparent 65%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${BG3} 0%, transparent 8%, transparent 88%, ${BG3} 100%), linear-gradient(to bottom, ${BG3} 0%, transparent 8%, transparent 90%, ${BG3} 100%)` }} />
            <Corner accent={GREEN} />
            <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 3 }}>
              <Mono color={GREEN}>Tank module · outlet valve · flow manifold</Mono>
            </div>
          </div>

          <div style={{ padding: '68px 56px 68px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="eyebrow reveal r1">Tank + Plumbing</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 3.5vw, 50px)', fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 22 }} className="reveal r2">
              Quick-fill.<br /><span style={{ color: GREEN }}>Tool-free swap.</span>
            </h2>
            <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.82, marginBottom: 32 }} className="reveal r3">
              Wide-mouth quick-fill tank with level indicator window. Single outlet valve feeds the centrifugal pump and boom manifold. Tank module detaches without tools for cleaning or sprayer-to-seeder bay swap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '◆', title: '10–16 L capacity', body: 'Transparent level window and graduated fill marks — field-readable without lifting the tank.' },
                { icon: '◆', title: 'Single-valve outlet', body: 'Positive-shut butterfly valve prevents drips during transport. Hose-barb quick-connects for pump attachment.' },
                { icon: '◆', title: 'Tool-free removal', body: 'Quarter-turn locking clips on the payload bay interface — tank out in <30 seconds for refill or module swap.' },
              ].map((f) => (
                <div key={f.title} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(6,8,13,0.50)', border: `1px solid rgba(148,211,39,0.10)`, borderLeft: `2px solid ${GREEN}` }} className="reveal r3">
                  <div style={{ color: GREEN, fontSize: 8, marginTop: 4, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#C8D8E8', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: '#52607A', lineHeight: 1.65 }}>{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §6  FIELD — atlas_ag_field1.png
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, position: 'relative', height: '65vh', overflow: 'hidden', background: '#060A04' }}>
          <Image
            src="/systems/atlas_ag/atlas_ag_field1.png"
            alt="Atlas Ag spraying over soybean field — blue sky daytime"
            fill sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 50%', filter: 'brightness(0.82) contrast(1.08) saturate(1.10)' }}
          />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.72) 0%, rgba(6,8,13,0.05) 22%, rgba(6,8,13,0.05) 65%, rgba(6,8,13,0.92) 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to right, rgba(6,8,13,0.75) 0%, transparent 30%, transparent 70%, rgba(6,8,13,0.75) 100%)` }} />

          <div style={{ position: 'absolute', bottom: 56, left: 56, zIndex: 3 }}>
            <Mono color="rgba(148,211,39,0.80)">Field Operations · Active Spray · Soybean</Mono>
            <div style={{ height: 14 }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(26px, 3.2vw, 48px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.01em', color: '#E4EAF4' }}>
              From the sky — uniform<br /><span style={{ color: GREEN }}>wall-to-wall coverage.</span>
            </h3>
          </div>

          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 100, zIndex: 4, background: `linear-gradient(to bottom, transparent 0%, ${BG2} 100%)`, pointerEvents: 'none' }} />
        </section>


        {/* ══════════════════════════════════════════════════════
            §7  SPECS — id="specs"
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', background: BG2, borderBottom: `1px solid ${LINE}` }} id="specs">

          <div style={{ padding: '80px 56px', borderRight: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 80% at 80% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="eyebrow reveal r1" style={{ position: 'relative' }}>Technical Specifications</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(26px, 3.6vw, 46px)', fontWeight: 700, lineHeight: 0.91, letterSpacing: '-0.01em', color: '#E4EAF4', marginBottom: 40, position: 'relative' }} className="reveal r2">
              Built for Indian fields.<br />Certified for Indian farmers.
            </h2>

            {[
              { k: 'Configuration',    v: 'Hexacopter · Fold-arm' },
              { k: 'Tank capacity',    v: '10–16 Litre' },
              { k: 'Coverage rate',    v: '~1 acre / min' },
              { k: 'Spray nozzles',    v: 'Flat-fan · variable-rate' },
              { k: 'Boom placement',   v: 'Outside motor wash zone' },
              { k: 'Altitude hold',    v: 'Terrain-following AGL' },
              { k: 'Payload modes',    v: 'Spray / Seed / Hybrid' },
              { k: 'Autonomy',         v: 'AI field mission planning' },
              { k: 'Flight controller',v: 'Cube Orange Plus' },
              { k: 'NPNT',             v: 'Digital Sky compliant' },
              { k: 'Business model',   v: 'DaaS · FPO · CHC' },
              { k: 'Subsidy path',     v: 'SMAM eligible post-TC' },
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

          <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden', background: BG }}>
            <Image
              src="/systems/atlas_ag/atlas_ag_hero2.png"
              alt="Atlas Ag VAS-02 — full boom arm configuration, studio"
              fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center 50%', mixBlendMode: 'screen', filter: 'brightness(0.88) contrast(1.08) saturate(1.10)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to left, transparent 40%, ${BG2} 100%), linear-gradient(to bottom, ${BG2} 0%, transparent 10%, transparent 88%, ${BG2} 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 55% at 55% 55%, ${GREEN_DIM} 0%, transparent 68%)` }} />
            <Corner accent={GREEN} />
            <div style={{ position: 'absolute', bottom: 28, right: 28, zIndex: 2, textAlign: 'right' }}>
              <Mono>Atlas Ag VAS-02 · Spray configuration</Mono>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §8  FIELD SCENARIOS — field2 + field3
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}` }}>

          <div style={{ padding: '64px 56px 52px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}`, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow reveal r1">Field Operations</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                Paddy to wheat.<br /><span style={{ color: GREEN }}>Kharif to rabi.</span>
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.8, maxWidth: 420 }} className="reveal r3">
              Atlas Ag operates across all major Indian cropping systems — paddy, wheat, cotton, sugarcane, corn, and vegetables. One airframe, 12-month operation across two crop cycles.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: LINE }}>
            {[
              { src: '/systems/atlas_ag/atlas_ag_field2.png', cap: 'Maize — early season spray, golden crop rows', label: 'KHARIF' },
              { src: '/systems/atlas_ag/atlas_ag_field3.png', cap: 'Corn — tall crop canopy, full boom coverage',   label: 'RABI'   },
            ].map((img) => (
              <div key={img.src} style={{ position: 'relative', height: 460, overflow: 'hidden', background: '#060A04' }}>
                <Image
                  src={img.src} alt={img.cap} fill sizes="50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 45%', filter: 'brightness(0.78) contrast(1.08) saturate(1.15)' }}
                />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(6,8,13,0.55) 0%, transparent 18%, transparent 72%, rgba(6,8,13,0.88) 100%)` }} />
                <Corner accent={GREEN} />
                <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 3 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: GREEN, background: 'rgba(148,211,39,0.10)', border: `1px solid rgba(148,211,39,0.22)`, padding: '5px 10px' }}>{img.label}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 3 }}>
                  <Mono>{img.cap}</Mono>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: LINE }}>
            {[
              { title: 'Precision Spraying', body: 'Variable-rate flat-fan nozzles outside the motor wash zone — pesticides, herbicides, and liquid fertilisers with ±5% flow accuracy.' },
              { title: 'Seed Broadcasting',  body: 'Interchangeable seed spreader module with programmable broadcast patterns. Paddy DSR, wheat, mustard, vegetable seed deployment.' },
              { title: 'SMAM Subsidy Path',  body: 'Eligible under Sub-Mission on Agricultural Mechanization — post-TC empanelment enables 40–100% capital subsidy for farmer and FPO buyers.' },
              { title: 'DaaS Per-Acre',      body: 'No capital purchase required — per-acre drone service model for FPO partnerships, NAMO Drone Didi SHG groups, and CHC deployments.' },
            ].map((f) => (
              <div key={f.title} style={{ background: BG2, padding: '30px 26px', borderTop: `2px solid ${GREEN}`, position: 'relative', overflow: 'hidden' }} className="reveal r2">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, background: `linear-gradient(to bottom, ${GREEN_DIM} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: '#E4EAF4', marginBottom: 10, position: 'relative' }}>{f.title}</div>
                <p style={{ fontSize: 12, color: '#52607A', lineHeight: 1.72, position: 'relative' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            §9  CTA — PROCUREMENT
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden', opacity: 0.22 }}>
            <Image
              src="/systems/atlas_ag/atlas_ag_hero1.png" alt="" fill sizes="50vw"
              style={{ objectFit: 'cover', objectPosition: 'center 42%', mixBlendMode: 'screen', filter: 'brightness(0.55) contrast(1.05) saturate(0.70)' }}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to right, ${BG2} 0%, transparent 40%)` }} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '60%', background: `radial-gradient(ellipse 80% 80% at 10% 10%, ${GREEN_DIM} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div className="eyebrow reveal r1">Procurement · Deployment</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 3.8vw, 58px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 22 }} className="reveal r2">
                Deploy Atlas Ag<br />on your fields?
              </h2>
              <p style={{ fontSize: 14, color: '#7A8BA6', lineHeight: 1.82, marginBottom: 26 }} className="reveal r3">
                Available for state agriculture department procurement, FPO bulk fleet contracts, NAMO Drone Didi SHG deployments, and Custom Hiring Centre partnerships.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '16px 20px', background: BG3, border: `1px solid rgba(148,211,39,0.12)`, borderLeft: `3px solid ${GREEN}` }} className="reveal r4">
                  <Mono color={GREEN}>SMAM Subsidy Eligibility</Mono>
                  <p style={{ fontSize: 12, color: '#7A8BA6', lineHeight: 1.7, marginTop: 6 }}>
                    Post-TC empanelment enables 40–100% capital subsidy for farmers and FPOs — making per-unit economics viable for smallholder deployments.
                  </p>
                </div>
                <div style={{ padding: '16px 20px', background: BG3, border: `1px solid rgba(148,211,39,0.12)`, borderLeft: `3px solid rgba(148,211,39,0.40)` }} className="reveal r4">
                  <Mono color="rgba(148,211,39,0.55)">DaaS Per-Acre Model</Mono>
                  <p style={{ fontSize: 12, color: '#7A8BA6', lineHeight: 1.7, marginTop: 6 }}>
                    No capital purchase required — per-acre drone service pricing available for FPO and CHC operators. Service + maintenance bundle included.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }} className="reveal r3">
              {[
                { k: 'State agri dept', v: 'Direct procurement · GeM' },
                { k: 'FPO bulk fleet',  v: 'Volume pricing available' },
                { k: 'NAMO Drone Didi', v: 'SHG deployment-ready' },
                { k: 'CHC operations',  v: 'Custom Hiring Centre model' },
                { k: 'DaaS service',    v: 'Per-acre pricing available' },
                { k: 'SMAM subsidy',    v: '40–100% post-TC empanelment' },
              ].map((r) => (
                <div key={r.k} className="spec-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <span className="spec-key">{r.k}</span>
                  <span className="spec-value" style={{ color: '#7A8BA6' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/partner#contact-form" className="btn-primary">Initiate Procurement <span className="arr">→</span></Link>
                <Link href="/systems/vas01" className="btn-outline">← Atlas</Link>
              </div>
            </div>
          </div>
        </section>


        {/* Prev / Next nav */}
        <div style={{ padding: '32px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, flexWrap: 'wrap', gap: 16, background: BG }}>
          <Link href="/systems/vas01" className="btn-outline">← VAS-01 · Atlas</Link>
          <Link href="/systems" className="btn-outline" style={{ color: '#52607A' }}>All Platforms</Link>
          <Link href="/systems/vas03" className="btn-outline">VAS-03 · Ranger →</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
