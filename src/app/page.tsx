'use client';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';
import IntelStrip from '@/components/IntelStrip';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { systems, capabilityLayers, timeline, values } from '@/data';

/* ─────────────────────────────────────────────
   Narrative content
───────────────────────────────────────────── */

// THE GAP — why this company exists, now.
const gapStats = [
  {
    num: '₹40k', unit: ' Cr',
    cap: 'Indian UAV procurement budget unlocked post-Operation Sindoor — the largest indigenous air-systems push in a generation.',
    src: 'MoD · 2025',
  },
  {
    num: '50', unit: 'k',
    cap: "The Army's projected annual small-UAV demand — against a supply base still dependent on foreign sub-systems.",
    src: 'Army Design Bureau',
  },
  {
    num: '71', unit: '%',
    cap: 'Type-Certification rejection rate for agri-drones — most fail on traceable, compliant, indigenous supply chains.',
    src: 'DGCA · NTH',
  },
];

// THE PLATFORMS — grouped by mission family, sourced from the catalog.
const byId = Object.fromEntries(systems.map((s) => [s.id, s]));
const domains = [
  {
    title: 'Defence & Strike',
    meta: '03 platforms · MoD-exempt',
    ids: ['vas04', 'vas05', 'vas06'],
  },
  {
    title: 'Industry & Civil',
    meta: '03 platforms · GeM-listed',
    ids: ['vas03', 'vas01', 'vas02'],
  },
];

// THE PROOF — credibility at a glance.
const proof = [
  { k: 'TRL 6', v: 'All six platforms' },
  { k: '0', v: 'Chinese components', g: true },
  { k: '70%', v: 'Made in India' },
  { k: 'DPIIT', v: 'Recognised startup' },
  { k: 'iDEX', v: '2026 applicant' },
  { k: 'GeM', v: 'Registered vendor' },
];

/* ── Motion ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const viewport = { once: true, margin: '-80px' } as const;

function Chapter({ num, label, center }: { num: string; label: string; center?: boolean }) {
  return (
    <span className={`chapter${center ? ' chapter-center' : ''}`}>
      <span className="chapter-num">{num}</span>
      <span className="chapter-rule" />
      {label}
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="main">
        <HeroCarousel />

        {/* ═══ 01 · THE GAP ═══ */}
        <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div className="ambient-tl" />
          <motion.div className="container" style={{ position: 'relative' }} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <div className="story-head">
              <motion.div variants={fadeUp}>
                <Chapter num="01" label="The Gap" />
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  India can design the mission.<br />
                  <span className="g">The supply chain is the front line.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="body-lg lede measure" style={{ alignSelf: 'end' }}>
                Demand has never been higher — or more exposed. The platforms that win
                tomorrow&apos;s contracts must be traceable to the silicon. That is the gap
                Vortex was built to close.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="gap-grid">
              {gapStats.map((s) => (
                <div key={s.src} className="gap-stat">
                  <span className="num">{s.num}<span className="u">{s.unit}</span></span>
                  <p className="cap">{s.cap}</p>
                  <span className="src">Source · {s.src}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 02 · THE THESIS ═══ */}
        <section className="section" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <motion.div className="container" style={{ maxWidth: 1040 }} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <motion.div variants={fadeUp}><Chapter num="02" label="The Thesis" /></motion.div>
            <motion.p variants={fadeUp} className="statement measure-lg" style={{ marginBottom: 40 }}>
              We don&apos;t assemble drones. We engineer the whole stack —
              <span className="hl"> airframe, flight control, edge AI, and ground software </span>
              under one roof, on Indian soil, with <span className="hl">zero foreign dependency</span>.
              <span className="dim"> Silicon to sky.</span>
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/capabilities" className="btn-arrow">
                See how the stack is built <span className="arr">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 03 · THE STACK ═══ */}
        <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div className="ambient-tr" />
          <motion.div className="container" style={{ position: 'relative' }} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <div className="story-head">
              <motion.div variants={fadeUp}>
                <Chapter num="03" label="The Stack" />
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Five layers.<br /><span className="g">One native system.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="body-lg lede measure" style={{ alignSelf: 'end' }}>
                Every layer is developed in-house — so security, performance, and upgrades
                stay in Vortex&apos;s control, never a vendor&apos;s. This is the moat.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="stack">
              {capabilityLayers.map((l) => {
                const progress = l.statusClass === 'blue';
                return (
                  <div key={l.num} className="stack-row">
                    <div className="stack-layer">{l.num}</div>
                    <div>
                      <span className={`stack-status${progress ? ' is-progress' : ''}`}>
                        <span className="dot" />{l.status}
                      </span>
                      <div className="stack-name">{l.name}</div>
                      <p className="stack-sub measure">{l.sub}</p>
                    </div>
                    <ul className="stack-tech">
                      {l.tech.slice(0, 4).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 04 · THE PLATFORMS ═══ */}
        <section className="section" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <motion.div className="container" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <div className="story-head">
              <motion.div variants={fadeUp}>
                <Chapter num="04" label="The Platforms" />
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Six platforms.<br /><span className="g">Every mission profile.</span>
                </h2>
              </motion.div>
              <motion.div variants={fadeUp} style={{ alignSelf: 'end' }}>
                <p className="body-lg lede measure" style={{ marginBottom: 16 }}>
                  One avionics stack, six airframes. Rapid deployment and unified training
                  across defence, enterprise, and agriculture.
                </p>
                <Link href="/systems" className="btn-arrow">
                  View full catalog <span className="arr">→</span>
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp}>
              {domains.map((d) => (
                <div key={d.title} className="domain">
                  <div className="domain-head">
                    <span className="domain-title">{d.title}</span>
                    <span className="domain-meta">{d.meta}</span>
                  </div>
                  {d.ids.map((id) => {
                    const s = byId[id];
                    if (!s) return null;
                    return (
                      <Link key={id} href={`/systems/${id}`} className="platform">
                        <span className={`platform-id${s.featured ? ' restricted' : ''}`}>{s.num}</span>
                        <span>
                          <span className="platform-name" style={{ display: 'block' }}>{s.name}</span>
                          <span className="platform-cat">{s.category}</span>
                          <span className="platform-desc" style={{ display: 'block' }}>{s.sub}</span>
                        </span>
                        <span className={`platform-spec${s.featured ? ' restricted' : ''}`}>
                          {s.featured ? 'Restricted · NDA' : s.keySpec}
                        </span>
                        <span className="platform-arrow">→</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 05 · THE PROOF ═══ */}
        <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div className="ambient-center" />
          <motion.div className="container" style={{ position: 'relative' }} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <div className="story-head">
              <motion.div variants={fadeUp}>
                <Chapter num="05" label="The Proof" />
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Not a render.<br /><span className="g">Built to be checked.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="body-lg lede measure" style={{ alignSelf: 'end' }}>
                Flight-proven hardware, documented to the standard of entities that expect to
                audit it — MoD due diligence, export review, supply-chain inspection.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="proof-row" style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}>
              {proof.map((p) => (
                <div key={p.k + p.v} className="proof-cell">
                  <span className="k">{p.g ? <span className="g">{p.k}</span> : p.k}</span>
                  <span className="v">{p.v}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '0 clamp(32px, 4vw, 64px)' }}>
              {values.slice(0, 6).map((v) => (
                <div key={v.num} className="principle">
                  <span className="principle-num">{v.num}</span>
                  <div>
                    <div className="principle-title">{v.title}</div>
                    <p className="principle-body">{v.body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 06 · THE JOURNEY ═══ */}
        <section className="section" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <motion.div className="container" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <div className="story-head">
              <motion.div variants={fadeUp}>
                <Chapter num="06" label="The Journey" />
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Student team to<br /><span className="g">drone company. One year.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="body-lg lede measure" style={{ alignSelf: 'end' }}>
                Every subsystem earned its TRL-6 rating in the field, not the lab — debugged at
                competitions across North India before it ever became a product.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="journey">
              {timeline.map((t, i) => (
                <div key={t.year} className={`journey-row${i === timeline.length - 1 ? ' is-future' : ''}`}>
                  <span className="journey-year">{t.year}</span>
                  <div>
                    <div className="journey-title">{t.title}</div>
                    <p className="journey-body">{t.body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <IntelStrip />

        {/* ═══ FINAL CTA ═══ */}
        <section className="section cta-final" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          <div className="ambient-tr" />
          <motion.div className="container cta-final-inner" style={{ position: 'relative' }} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Chapter num="07" label="Engage" />
              <h2 className="h2" style={{ marginBottom: 20 }}>Bring us the mission.</h2>
              <p className="body-lg lede measure" style={{ marginBottom: 0 }}>
                Whether you procure for defence or scale enterprise operations, you talk to the
                engineers who built the stack — not a sales layer.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner#contact-form" className="btn-primary">
                Request a briefing <span className="arr">→</span>
              </Link>
              <Link href="/partner/one-pager" className="btn-outline">
                Investor one-pager
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
