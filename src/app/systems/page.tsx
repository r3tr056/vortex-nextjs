import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import IntelStrip from '@/components/IntelStrip';
import Link from 'next/link';
import { systems } from '@/data';

export default function SystemsPage() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main className="pt-nav">
        {/* HERO */}
        <div className="systems-hero">
          <div>
            <div className="eyebrow reveal r1">Platform Portfolio</div>
            <h1 className="h1 reveal r2">
              Every mission<br /><span className="g">covered.</span>
            </h1>
          </div>
          <div className="reveal r3">
            <p className="body-lg" style={{ marginBottom: 28 }}>
              Six autonomous platforms across defense, enterprise, and agriculture — all built, integrated, and software-managed by Vortex. Indigenous supply chains. No Chinese components.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag tag-green">TRL 6 · All Platforms</span>
              <span className="tag">Tethered variants available</span>
              <span className="tag tag-blue">Cloud-managed</span>
            </div>
          </div>
        </div>

        {/* SYSTEMS GRID */}
        <div className="systems-grid">
          {systems.map((sys, idx) => (
            <Link
              key={sys.id}
              href={`/systems/${sys.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className={`system-row${sys.featured ? ' featured' : ''} reveal`}
                style={{ transitionDelay: `${idx * 0.07}s` }}
              >
                <div className="sys-num">{sys.num}</div>
                <div className="sys-main">
                  <span
                    className="sys-cat"
                    style={sys.featured ? { color: 'var(--green)' } : undefined}
                  >
                    {sys.category}
                  </span>
                  <div className="sys-name">{sys.name}</div>
                  <span
                    className="sys-variant"
                    style={sys.featured ? { color: '#FF5533' } : undefined}
                  >
                    {sys.featured ? `MUNITION VARIANT · ${sys.num} · RESTRICTED` : sys.keySpec}
                  </span>
                  <p className="sys-desc">{sys.desc}</p>
                  <div className="sys-tags">
                    {sys.id === 'vas02' ? (
                      <span className="tag" style={{ borderColor: 'rgba(255,184,48,0.3)', color: '#FFB830' }}>{sys.tagLabel}</span>
                    ) : (
                      <span className={`tag ${sys.tagType === 'tag-green' ? 'tag-green' : sys.tagType === 'tag-blue' ? 'tag-blue' : ''}`}>{sys.tagLabel}</span>
                    )}
                    {sys.tagExtra?.slice(0, 2).map((t) => (
                      <span key={t.label} className="tag">{t.label}</span>
                    ))}
                  </div>
                </div>
                <div className="sys-specs">
                  {sys.specs.slice(0, 5).map((spec) => (
                    <div key={spec.k} className="spec-line">
                      <span className="spec-k">{spec.k}</span>
                      <span className="spec-v">{spec.v}</span>
                    </div>
                  ))}
                  <div className="spec-line" style={{ marginTop: 'auto', paddingTop: 12 }}>
                    <span className="spec-k" />
                    <span className="spec-v" style={{ color: 'var(--green)' }}>View details →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER CTA */}
        <div style={{
          padding: '60px 56px 80px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              All systems at TRL 6. Tethered variants of Sentinel and Ranger available.
            </p>
            <p className="body-md" style={{ maxWidth: 500 }}>
              Defense platforms operate under MoD exemption — no DGCA Type Certification required for military procurement and trials.
            </p>
          </div>
          <Link href="/partner" className="btn-primary">
            Request System Briefing <span className="arr">→</span>
          </Link>
        </div>

        <IntelStrip />
      </main>

      <Footer />
    </>
  );
}
