import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import IntelStrip from '@/components/IntelStrip';
import Link from 'next/link';
import { systems } from '@/data';

export const metadata = {
  title: 'Systems — Six autonomous platforms',
  description:
    'Six autonomous UAV platforms across defence, enterprise, and agriculture. TRL 6. Indigenous supply chains. Zero Chinese components.',
};

export default function SystemsPage() {
  return (
    <>
      <Nav />
      <RevealObserver />

      <main id="main" className="pt-nav">
        {/* HERO */}
        <section
          className="section-tight"
          style={{ borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
        >
          <div className="ambient-tl" />
          <div className="container split-7-5" style={{ position: 'relative' }}>
            <div>
              <span className="eyebrow reveal r1">Platform Portfolio</span>
              <h1 className="display h1 reveal r2">
                Every mission<br /><span className="g">covered.</span>
              </h1>
            </div>
            <div className="reveal r3" style={{ alignSelf: 'end' }}>
              <p className="body-lg" style={{ marginBottom: 20 }}>
                Six autonomous platforms — defence, enterprise, agriculture. Built, integrated,
                and software-managed by Vortex. TRL 6 across the board.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-green">TRL 6 · All Platforms</span>
                <span className="tag">Tethered variants</span>
                <span className="tag tag-blue">Cloud-managed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Systems rows */}
        <section style={{ background: 'var(--bg)' }}>
          <div className="container">
            {systems.map((sys, idx) => (
              <Link
                key={sys.id}
                href={`/systems/${sys.id}`}
                className="row-3col reveal"
                style={{
                  borderTop: idx === 0 ? '1px solid var(--line)' : 'none',
                  borderBottom: '1px solid var(--line)',
                  padding: 'clamp(24px, 3vw, 40px) 0',
                  transitionDelay: `${idx * 0.05}s`,
                  textDecoration: 'none',
                }}
              >
                {/* num */}
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    color: sys.featured ? 'var(--danger)' : 'var(--muted)',
                    paddingTop: 6,
                  }}
                >
                  {sys.num}
                </div>

                {/* main */}
                <div style={{ paddingRight: 'clamp(0px, 3vw, 48px)', minWidth: 0 }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: sys.featured ? 'var(--danger)' : 'var(--muted)',
                      marginBottom: 12,
                    }}
                  >
                    {sys.category}
                  </div>
                  <h2
                    className="display"
                    style={{
                      fontSize: 'clamp(28px, 4.5vw, 56px)',
                      lineHeight: 0.95,
                      marginBottom: 6,
                      color: sys.featured ? 'transparent' : 'var(--text)',
                      WebkitTextStroke: sys.featured ? '1px var(--accent)' : 'none',
                    }}
                  >
                    {sys.name}
                  </h2>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: sys.featured ? 'var(--danger)' : 'var(--accent)',
                      letterSpacing: '0.08em',
                      marginBottom: 16,
                    }}
                  >
                    {sys.featured
                      ? `RESTRICTED · ${sys.num}`
                      : sys.keySpec}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--sub)',
                      lineHeight: 1.72,
                      maxWidth: 620,
                      marginBottom: 16,
                    }}
                  >
                    {sys.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`tag ${sys.tagType}`}>{sys.tagLabel}</span>
                    {sys.tagExtra?.slice(0, 2).map((t) => (
                      <span key={t.label} className="tag">
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* specs (hidden <1024) */}
                <div className="row-3col-specs">
                  <div className="spec-table">
                    {sys.specs.slice(0, 5).map((spec) => (
                      <div key={spec.k} className="spec-line">
                        <span className="spec-k">{spec.k}</span>
                        <span className="spec-v">{spec.v}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mono"
                    style={{
                      marginTop: 16,
                      fontSize: 11,
                      color: 'var(--accent)',
                      letterSpacing: '0.15em',
                      textAlign: 'right',
                    }}
                  >
                    View details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="section-tight"
          style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
        >
          <div className="container cta-band">
            <div style={{ maxWidth: 520 }}>
              <span className="eyebrow reveal r1">Procurement note</span>
              <p className="body-lg reveal r2" style={{ marginBottom: 0 }}>
                Defence platforms operate under MoD exemption — no DGCA Type Certification
                required for military procurement and trials.
              </p>
            </div>
            <Link href="/partner#contact-form" className="btn-primary reveal r3">
              Request System Briefing <span className="arr">→</span>
            </Link>
          </div>
        </section>

        <IntelStrip />
      </main>

      <Footer />
    </>
  );
}
