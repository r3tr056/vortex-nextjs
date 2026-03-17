'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
  {
    label: 'VAS-01 · ATLAS LOGISTICS',
    image: '/atlas.jpeg',
    line1: 'Autonomous air',
    line2: 'capability,',
    line3: 'built in India.',
    accent: 'rgba(148,211,39,0.06)',
  },
  {
    label: 'VAS-03 · RANGER ISR',
    image: '/ranger.jpeg',
    line1: 'Indigenous systems.',
    line2: 'Zero foreign',
    line3: 'dependency.',
    accent: 'rgba(56,182,255,0.06)',
  },
  {
    label: 'VAS-04 · SENTINEL',
    image: '/sentinel.png',
    line1: 'Ladakh altitude.',
    line2: 'Thar heat.',
    line3: 'India-rated.',
    accent: 'rgba(148,211,39,0.05)',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, 5000);
  };

  const advance = () => {
    setAnimating(true);
    setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
      setAnimating(false);
    }, 350);
  };

  const goTo = (i: number) => {
    if (i === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(i);
      setAnimating(false);
    }, 350);
    startInterval();
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = slides[active];

  return (
    <section className="hero pt-nav">
      {/* Static tinted bg + grid */}
      <div className="hero-bg" />
      <div className="hero-grid-bg" />
      <div className="noise" />

      {/* ── IMAGE CAROUSEL ── */}
      <div className="hero-carousel">
        {slides.map((s, i) => (
          <div key={i} className={`hero-slide${active === i ? ' active' : ''}`}>
            {/* Drone image — screen blend so it bleeds into the dark bg */}
            <Image
              src={s.image}
              alt={s.label}
              fill
              priority={i === 0}
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: 'center 35%',
                mixBlendMode: 'screen',
                filter: 'brightness(0.72) contrast(1.1) saturate(1.15)',
              }}
            />

            {/* Per-slide colour accent glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 55% 60% at 65% 35%, ${s.accent} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
          </div>
        ))}

        {/* Multi-layer fade so text always reads cleanly */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: `
            linear-gradient(to bottom,
              rgba(6,8,13,0.72) 0%,
              rgba(6,8,13,0.38) 28%,
              rgba(6,8,13,0.22) 52%,
              rgba(6,8,13,0.90) 100%),
            linear-gradient(to right,
              rgba(6,8,13,0.62) 0%,
              rgba(6,8,13,0.12) 28%,
              rgba(6,8,13,0.12) 72%,
              rgba(6,8,13,0.62) 100%)
          `,
        }} />

        {/* Extra bottom gradient so stats bar reads */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%',
          background: 'linear-gradient(to top, rgba(6,8,13,0.88) 0%, rgba(6,8,13,0.5) 50%, transparent 100%)',
          zIndex: 3, pointerEvents: 'none',
        }} />
      </div>

      {/* Crosshair decoration */}
      <div className="crosshair">
        <div className="crosshair-ring" />
        <div className="crosshair-ring2" />
      </div>

      {/* Top info bar */}
      <div className="hero-top">
        <div>
          <div className="eyebrow" style={{ marginBottom: 0 }}>
            Autonomous Air Systems
          </div>
        </div>
        <div className="hero-top-right">
          <div className="hero-coords">28.6692° N · 77.4538° E · Ghaziabad</div>
          <p className="hero-desc">
            Indigenously designed and manufactured autonomous UAV platforms for defense,
            government, and precision industry. Zero foreign system dependency.
          </p>
        </div>
      </div>

      {/* ── ANIMATED HEADLINE ── */}
      <div className="hero-headline" style={{ position: 'relative', zIndex: 4, marginBottom: 40 }}>
        {(['line1', 'line2', 'line3'] as const).map((key, di) => (
          <span
            key={key}
            className={key}
            style={{
              display: 'block',
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(14px)' : 'translateY(0)',
              transition: 'opacity 0.32s ease, transform 0.32s ease',
              transitionDelay: animating ? '0s' : `${di * 0.06}s`,
            }}
          >
            {slide[key]}
          </span>
        ))}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="hero-bottom" style={{ position: 'relative', zIndex: 4 }}>
        <div className="hero-stats">
          {[
            { val: <>₹40k<span className="g"> Cr</span></>, key: 'Post-Sindoor procurement' },
            { val: <>50<span className="g">k</span></>,    key: 'Army annual demand' },
            { val: <>28<span className="g">%</span></>,    key: 'Agri market CAGR' },
            { val: <>71<span className="g">%</span></>,    key: 'TC rejection rate' },
          ].map((s) => (
            <div key={s.key} className="hero-stat">
              <span className="stat-val">{s.val}</span>
              <span className="stat-key">{s.key}</span>
            </div>
          ))}
        </div>

        <div className="hero-bottom-right">
          {/* Progress + platform label */}
          <div className="carousel-label">
            <div className="carousel-progress">
              <div className="carousel-progress-bar" key={active} />
            </div>
            <span
              className="carousel-platform"
              style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.32s ease' }}
            >
              {slide.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', width: '100%' }}>
            {/* Dot nav */}
            <div className="carousel-nav">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`carousel-dot${active === i ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${i + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      goTo(i);
                    }
                  }}
                />
              ))}
            </div>

            {/* CTAs */}
            <div className="hero-ctas">
              <Link href="/systems" className="btn-primary">
                Explore Platforms <span className="arr">→</span>
              </Link>
              <Link href="/partner" className="btn-outline">
                Request Briefing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
