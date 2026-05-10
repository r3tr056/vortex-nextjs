import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import Link from 'next/link';
import { capabilityLayers, softwareCards } from '@/data';

export const metadata = {
  title: 'Capabilities — Full-stack air intelligence',
  description:
    'Airframe · flight control · edge AI · Cloud GCS. Every layer developed in-house. No black boxes. No foreign firmware. Complete system sovereignty.',
};

const SoftwareIcon = ({ icon }: { icon: string }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="1" y="1" width="16" height="16" rx="1" />
        <line x1="1" y1="6" x2="17" y2="6" />
        <circle cx="4" cy="3.5" r="0.8" fill="currentColor" />
        <circle cx="7" cy="3.5" r="0.8" fill="currentColor" />
      </svg>
    ),
    plan: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="9,1 17,17 1,17" />
        <line x1="9" y1="7" x2="9" y2="13" />
        <circle cx="9" cy="15" r="0.8" fill="currentColor" />
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="9" cy="9" r="3" />
        <line x1="9" y1="1" x2="9" y2="5" />
        <line x1="9" y1="13" x2="9" y2="17" />
        <line x1="1" y1="9" x2="5" y2="9" />
        <line x1="13" y1="9" x2="17" y2="9" />
      </svg>
    ),
    swarm: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="4" r="1.5" />
        <circle cx="15" cy="4" r="1.5" />
        <circle cx="3" cy="14" r="1.5" />
        <circle cx="15" cy="14" r="1.5" />
        <line x1="9" y1="7.5" x2="4.2" y2="5.2" />
        <line x1="9" y1="7.5" x2="13.8" y2="5.2" />
        <line x1="9" y1="10.5" x2="4.2" y2="12.8" />
        <line x1="9" y1="10.5" x2="13.8" y2="12.8" />
      </svg>
    ),
    npnt: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M9 1l7 3v5c0 4-3.5 7-7 8C5.5 16 2 13 2 9V4l7-3z" />
        <polyline points="6,9 8,11 12,7" />
      </svg>
    ),
    api: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
        <polyline points="5,4 1,9 5,14" />
        <polyline points="13,4 17,9 13,14" />
        <line x1="7" y1="14" x2="11" y2="4" />
      </svg>
    ),
  };
  return <>{icons[icon] || icons['api']}</>;
};

export default function CapabilitiesPage() {
  return (
    <>
      <Nav />
      <RevealObserver />

      <main id="main" className="pt-nav">
        {/* HERO */}
        <section className="section-tight" style={{ borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div className="ambient-tr" />
          <div className="container split-7-5" style={{ position: 'relative' }}>
            <div>
              <span className="eyebrow eyebrow-blue reveal r1">Technical Capabilities</span>
              <h1 className="h1 display reveal r2">
                Full-stack<br />air <span className="b">intelligence.</span>
              </h1>
            </div>
            <div className="reveal r3" style={{ alignSelf: 'end' }}>
              <p className="body-lg" style={{ marginBottom: 20 }}>
                Airframe, flight control, onboard AI, Cloud GCS — every layer in-house. No black
                boxes. No foreign firmware. One release cycle.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-green">Hardware</span>
                <span className="tag tag-blue">Software</span>
                <span className="tag tag-green">AI / ML</span>
                <span className="tag tag-blue">Cloud GCS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stack layers */}
        <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight">
            <div className="split-5-5" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow eyebrow-blue reveal r1">The stack</span>
                <h2 className="h2 reveal r2" style={{ marginBottom: 0 }}>
                  Built ground-up.
                </h2>
              </div>
              <p className="body-lg reveal r3" style={{ alignSelf: 'end' }}>
                Each layer is developed in-house — faster iteration, defensible IP, and zero
                dependency on foreign-controlled systems.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--line)' }}>
              {capabilityLayers.map((layer, idx) => (
                <div
                  key={layer.num}
                  className="reveal cap-layer-row"
                  style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'clamp(24px, 3vw, 36px) 0',
                    transitionDelay: `${idx * 0.05}s`,
                  }}
                >
                  <div className="cap-head">
                    <div
                      className="mono"
                      style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--muted)' }}
                    >
                      {layer.num}
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
                        {layer.name}
                      </div>
                      <p className="body-md" style={{ marginBottom: 0 }}>
                        {layer.sub}
                      </p>
                    </div>
                  </div>
                  <div className="cap-details">
                    <ul style={{ listStyle: 'none' }}>
                      {layer.tech.map((t) => (
                        <li
                          key={t}
                          style={{
                            fontSize: 13,
                            color: 'var(--sub)',
                            padding: '7px 0',
                            borderBottom: '1px solid var(--line)',
                          }}
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <span
                        className="mono"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 11,
                          letterSpacing: '0.16em',
                          color: layer.statusClass === 'blue' ? 'var(--info)' : 'var(--accent)',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: layer.statusClass === 'blue' ? 'var(--info)' : 'var(--accent)',
                          }}
                        />
                        {layer.status}
                      </span>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.65 }}>
                        {layer.statusNote}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <style>{`
              .cap-layer-row {
                display: grid;
                gap: clamp(20px, 3vw, 36px);
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              }
              .cap-head {
                display: grid;
                grid-template-columns: minmax(0, 60px) minmax(0, 1fr);
                gap: 16px;
                align-items: start;
              }
              .cap-details {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 220px);
                gap: clamp(16px, 2vw, 32px);
              }
              @media (max-width: 900px) {
                .cap-layer-row { grid-template-columns: 1fr; }
                .cap-details { grid-template-columns: 1fr; gap: 16px; }
              }
              @media (max-width: 540px) {
                .cap-head { grid-template-columns: 1fr; gap: 10px; }
              }
            `}</style>
          </div>
        </section>

        {/* Cloud GCS */}
        <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight">
            <div className="split-7-5" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow eyebrow-blue reveal r1">Software</span>
                <h2 className="h2 reveal r2" style={{ marginBottom: 0 }}>
                  Vortex Cloud GCS
                </h2>
              </div>
              <p className="body-lg reveal r3" style={{ alignSelf: 'end' }}>
                India’s alternative to DJI Flight Hub — hardware-agnostic fleet management, NPNT
                compliant, data resident in India.
              </p>
            </div>

            <div className="cards-auto-sm" style={{ border: '1px solid var(--line)' }}>
              {softwareCards.map((card, i) => (
                <div
                  key={card.title}
                  className="reveal"
                  style={{ padding: 'clamp(26px, 3vw, 36px)', transitionDelay: `${i * 0.04}s` }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      border: '1px solid rgba(94,184,240,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      color: 'var(--info)',
                    }}
                  >
                    <SoftwareIcon icon={card.icon} />
                  </div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                    {card.title}
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-tight" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="container cta-band">
            <div style={{ maxWidth: 560 }}>
              <span className="eyebrow reveal r1">Your mission · our stack</span>
              <p className="body-lg reveal r2" style={{ marginBottom: 0 }}>
                Airframe to Cloud GCS — delivered as one integrated platform. No plug-ins. No
                vendor chains.
              </p>
            </div>
            <div className="reveal r3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner#contact-form" className="btn-primary">
                Technical Briefing <span className="arr">→</span>
              </Link>
              <Link href="/systems" className="btn-outline">View Platforms</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
