import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import { systems } from '@/data';

export async function generateStaticParams() {
  return systems.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const sys = systems.find((s) => s.id === params.id);
  if (!sys) return {};
  return {
    title: `${sys.num} · ${sys.name} — Vortex Autonomous Systems`,
    description: sys.desc,
  };
}

export default function SystemDetailPage({ params }: { params: { id: string } }) {
  const sysIndex = systems.findIndex((s) => s.id === params.id);
  if (sysIndex === -1) notFound();

  const sys = systems[sysIndex];
  const prevSys = sysIndex > 0 ? systems[sysIndex - 1] : null;
  const nextSys = sysIndex < systems.length - 1 ? systems[sysIndex + 1] : null;

  const isFeatured = sys.featured;

  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main className="pt-nav">
        {/* HERO */}
        <div
          className="sys-detail-hero"
          style={isFeatured ? { background: 'var(--bg3)' } : undefined}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: isFeatured
              ? 'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(255,85,51,0.05) 0%, transparent 60%)'
              : 'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(148,211,39,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          {/* Ghost text */}
          <div className="ghost-text" style={{
            position: 'absolute', top: 80, right: 48,
            fontSize: 'clamp(80px, 12vw, 160px)',
            zIndex: 0,
          }}>
            {sys.num}
          </div>

          <Link href="/systems" className="sys-detail-back">
            Back to Systems
          </Link>

          <div className="sys-detail-header">
            <div>
              <span className="sys-detail-designation">{sys.num} · Vortex Autonomous Systems</span>
              <div
                className="sys-detail-name"
                style={isFeatured ? {
                  WebkitTextStroke: '2px #FF5533',
                  color: 'transparent',
                } : undefined}
              >
                {sys.name}
              </div>
              <span
                className="sys-detail-variant"
                style={isFeatured ? { color: '#FF5533' } : undefined}
              >
                {sys.variant}
              </span>
            </div>
            <div>
              <p className="sys-detail-desc">{sys.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`tag ${sys.tagType}`}>{sys.tagLabel}</span>
                <span className="tag">TRL 6</span>
                {isFeatured && <span className="tag" style={{ borderColor: '#FF5533', color: '#FF5533', background: 'rgba(255,85,51,0.08)' }}>NDA Required</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SPECS + FEATURES */}
        <div className="sys-detail-specs-grid">
          {/* Left: Specs */}
          <div>
            <div className="specs-block reveal r1">
              <div className="specs-block-title">Technical Specifications</div>
              <div className="spec-table">
                {sys.specs.map((spec) => (
                  <div key={spec.k} className="spec-row">
                    <span className="spec-key">{spec.k}</span>
                    <span className="spec-value">{spec.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Procurement path */}
            <div className="specs-block reveal r2" style={{ marginTop: 48 }}>
              <div className="specs-block-title">Procurement Pathway</div>
              <p className="body-sm" style={{ marginTop: 16, lineHeight: 1.8 }}>
                {sys.procurement}
              </p>
              <div style={{ marginTop: 24 }}>
                <Link href="/partner" className="btn-primary">
                  Initiate Procurement <span className="arr">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div>
            <div className="specs-block reveal r3">
              <div className="specs-block-title">Key Capabilities</div>
              <div className="features-list" style={{ marginTop: 24 }}>
                {sys.features.map((feat) => (
                  <div
                    key={feat.title}
                    className="feature-item"
                    style={isFeatured ? { borderLeftColor: '#FF5533' } : undefined}
                  >
                    <div className="feature-item-text">
                      <h4>{feat.title}</h4>
                      <p>{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA & NAV */}
        <div className="sys-detail-cta">
          <div>
            <div className="eyebrow">Ready to procure?</div>
            <h3 className="h3">Request a full technical briefing<br />for {sys.name}.</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sys-nav-buttons">
              {prevSys && (
                <Link href={`/systems/${prevSys.id}`} className="btn-outline">
                  ← {prevSys.name}
                </Link>
              )}
              {nextSys && (
                <Link href={`/systems/${nextSys.id}`} className="btn-outline">
                  {nextSys.name} →
                </Link>
              )}
            </div>
            <Link href="/partner" className="btn-primary">
              Request Briefing <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
