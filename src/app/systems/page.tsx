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

const byId = Object.fromEntries(systems.map((s) => [s.id, s]));

const domains = [
  {
    n: 'Family A',
    title: 'Defence & Strike',
    note: 'MoD-exempt · iDEX / DRDO TDF',
    ids: ['vas04', 'vas05', 'vas06'],
  },
  {
    n: 'Family B',
    title: 'Industry & Civil',
    note: 'GeM-listed · DaaS-ready',
    ids: ['vas03', 'vas01', 'vas02'],
  },
];

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
          <div className="container" style={{ position: 'relative' }}>
            <div className="story-head" style={{ marginBottom: 0 }}>
              <div className="reveal r1">
                <span className="chapter">
                  <span className="chapter-num">VAS</span>
                  <span className="chapter-rule" />
                  Platform Catalog
                </span>
                <h1 className="display h1" style={{ marginBottom: 0 }}>
                  Every mission<br /><span className="g">covered.</span>
                </h1>
              </div>
              <div className="reveal r2" style={{ alignSelf: 'end' }}>
                <p className="body-lg lede measure" style={{ marginBottom: 20 }}>
                  Six autonomous platforms — defence, enterprise, agriculture. Built, integrated,
                  and software-managed by Vortex on a single avionics stack. TRL 6 across the board.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag tag-green">TRL 6 · All platforms</span>
                  <span className="tag">Tethered variants</span>
                  <span className="tag tag-blue">Cloud-managed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DOMAIN-GROUPED CATALOG */}
        <section style={{ background: 'var(--bg)' }}>
          <div className="container">
            {domains.map((d) => (
              <div key={d.title}>
                <div className="sys-domain-label reveal">
                  <span className="n">{d.n}</span>
                  <span className="t">{d.title}</span>
                  <span className="rule" />
                  <span className="domain-meta">{d.note}</span>
                </div>

                {d.ids.map((id) => {
                  const sys = byId[id];
                  if (!sys) return null;
                  return (
                    <Link
                      key={id}
                      href={`/systems/${id}`}
                      className="platform reveal"
                      aria-label={`${sys.name} — ${sys.category}`}
                    >
                      <span className={`platform-id${sys.featured ? ' restricted' : ''}`}>{sys.num}</span>

                      <span>
                        <span className="platform-cat" style={{ display: 'block' }}>{sys.category}</span>
                        <span className="platform-name" style={{ display: 'block' }}>{sys.name}</span>
                        <span className="platform-desc" style={{ display: 'block', marginBottom: 14 }}>{sys.desc}</span>
                        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className={`tag ${sys.tagType}`}>{sys.tagLabel}</span>
                          {sys.tagExtra?.slice(0, 2).map((t) => (
                            <span key={t.label} className="tag">{t.label}</span>
                          ))}
                        </span>
                      </span>

                      <span className="row-3col-specs" style={{ borderLeft: '1px solid var(--line)', paddingLeft: 'clamp(20px, 2.4vw, 36px)' }}>
                        <span className="spec-table" style={{ display: 'flex', flexDirection: 'column' }}>
                          {sys.specs.slice(0, 4).map((spec) => (
                            <span key={spec.k} className="spec-line">
                              <span className="spec-k">{spec.k}</span>
                              <span className="spec-v">{spec.v}</span>
                            </span>
                          ))}
                        </span>
                        <span className={`platform-spec${sys.featured ? ' restricted' : ''}`} style={{ display: 'block', marginTop: 14 }}>
                          {sys.featured ? 'Restricted · NDA' : sys.keySpec}
                        </span>
                      </span>

                      <span className="platform-arrow">→</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="section-tight"
          style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginTop: 'clamp(40px, 5vw, 64px)' }}
        >
          <div className="container cta-band">
            <div style={{ maxWidth: 560 }}>
              <span className="chapter reveal r1">
                <span className="chapter-num">·</span>
                <span className="chapter-rule" />
                Procurement note
              </span>
              <p className="body-lg lede reveal r2" style={{ marginBottom: 0 }}>
                Defence platforms operate under MoD exemption — no DGCA Type Certification
                required for military procurement and trials.
              </p>
            </div>
            <Link href="/partner#contact-form" className="btn-primary reveal r3">
              Request system briefing <span className="arr">→</span>
            </Link>
          </div>
        </section>

        <IntelStrip />
      </main>

      <Footer />
    </>
  );
}
