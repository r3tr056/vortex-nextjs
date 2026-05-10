'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = {
  label: string;
  image: string;
  lineA: string;
  lineB: string;
  lineC: string;
};

const slides: Slide[] = [
  {
    label: 'VAS-01 · Atlas Logistics',
    image: '/atlas.jpeg',
    lineA: 'Autonomous air',
    lineB: 'capability,',
    lineC: 'built in India.',
  },
  {
    label: 'VAS-03 · Ranger ISR',
    image: '/ranger.jpeg',
    lineA: 'Indigenous systems.',
    lineB: 'Zero foreign',
    lineC: 'dependency.',
  },
  {
    label: 'VAS-04 · Sentinel',
    image: '/sentinel.png',
    lineA: 'Ladakh altitude.',
    lineB: 'Thar heat.',
    lineC: 'India-rated.',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }, []);

  const start = () => {
    stop();
    if (prefersReducedMotion.current) return;
    intervalRef.current = setInterval(
      () => setActive((p) => (p + 1) % slides.length),
      2500
    );
  };
  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    if (i === active) return;
    setActive(i);
    start();
  };

  const slide = slides[active];

  return (
    <section
      className="hero pt-nav"
      aria-label="Hero"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-carousel" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="hero-slide active"
            style={{ zIndex: -1 }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-top">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="eyebrow" 
          style={{ marginBottom: 0 }}
        >
          Autonomous Air Systems
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="hero-coords">28.66° N · 77.45° E — Ghaziabad</div>
          <p className="hero-desc">
            Indigenously designed and manufactured UAV platforms for defence,
            government, and precision industry.
          </p>
        </motion.div>
      </div>

      <div className="hero-headline">
        <h1 style={{ margin: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <span style={{ display: 'block' }}>{slide.lineA}</span>
              <span className="line-dim" style={{ display: 'block' }}>
                {slide.lineB}
              </span>
              <span className="line-accent">{slide.lineC}</span>
            </motion.div>
          </AnimatePresence>
        </h1>
      </div>

      <div className="hero-bottom">
        <div className="hero-stats" aria-label="Market context">
          {[
            { val: '₹40k', unit: ' Cr', key: 'Post-Sindoor procurement' },
            { val: '50', unit: 'k', key: 'Army annual demand' },
            { val: '28', unit: '%', key: 'Agri market CAGR' },
            { val: '71', unit: '%', key: 'TC rejection rate' },
          ].map((s, idx) => (
            <motion.div 
              key={s.key} 
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (idx * 0.1) }}
            >
              <span className="stat-val">
                {s.val}
                <span className="g">{s.unit}</span>
              </span>
              <span className="stat-key">{s.key}</span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="hero-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span className="hero-nav-label">
            <span className="carousel-progress" aria-hidden="true">
              <span className="carousel-progress-bar" key={active} />
            </span>
            {slide.label}
          </span>
          <div className="carousel-dots" role="tablist" aria-label="Hero slides">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`${s.label}`}
                className={`carousel-dot${active === i ? ' active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="hero-ctas">
            <Link href="/systems" className="btn-primary">
              Explore Platforms <span className="arr">→</span>
            </Link>
            <Link href="/partner#contact-form" className="btn-outline">
              Request Briefing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
