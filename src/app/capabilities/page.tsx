import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import Link from 'next/link';
import { capabilityLayers, softwareCards } from '@/data';

const SoftwareIcon = ({ icon }: { icon: string }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <rect x="1" y="1" width="16" height="16" rx="1"/>
        <line x1="1" y1="6" x2="17" y2="6"/>
        <circle cx="4" cy="3.5" r="0.8" fill="#38b6ff"/>
        <circle cx="7" cy="3.5" r="0.8" fill="#38b6ff"/>
      </svg>
    ),
    plan: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <polygon points="9,1 17,17 1,17"/>
        <line x1="9" y1="7" x2="9" y2="13"/>
        <circle cx="9" cy="15" r="0.8" fill="#38b6ff"/>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <circle cx="9" cy="9" r="3"/>
        <line x1="9" y1="1" x2="9" y2="5"/>
        <line x1="9" y1="13" x2="9" y2="17"/>
        <line x1="1" y1="9" x2="5" y2="9"/>
        <line x1="13" y1="9" x2="17" y2="9"/>
        <line x1="3" y1="3" x2="6" y2="6"/>
        <line x1="12" y1="12" x2="15" y2="15"/>
        <line x1="15" y1="3" x2="12" y2="6"/>
        <line x1="6" y1="12" x2="3" y2="15"/>
      </svg>
    ),
    swarm: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <circle cx="9" cy="9" r="1.5"/>
        <circle cx="3" cy="4" r="1.5"/>
        <circle cx="15" cy="4" r="1.5"/>
        <circle cx="3" cy="14" r="1.5"/>
        <circle cx="15" cy="14" r="1.5"/>
        <line x1="9" y1="7.5" x2="4.2" y2="5.2"/>
        <line x1="9" y1="7.5" x2="13.8" y2="5.2"/>
        <line x1="9" y1="10.5" x2="4.2" y2="12.8"/>
        <line x1="9" y1="10.5" x2="13.8" y2="12.8"/>
      </svg>
    ),
    npnt: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <path d="M9 1l7 3v5c0 4-3.5 7-7 8C5.5 16 2 13 2 9V4l7-3z"/>
        <polyline points="6,9 8,11 12,7"/>
      </svg>
    ),
    api: (
      <svg viewBox="0 0 18 18" fill="none" stroke="#38b6ff" strokeWidth="1">
        <polyline points="5,4 1,9 5,14"/>
        <polyline points="13,4 17,9 13,14"/>
        <line x1="7" y1="14" x2="11" y2="4"/>
      </svg>
    ),
  };
  return <>{icons[icon] || icons['api']}</>;
};

export default function CapabilitiesPage() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main className="pt-nav">
        {/* HERO */}
        <div className="cap-hero">
          <div>
            <div className="eyebrow eyebrow-blue reveal r1">Technical capabilities</div>
            <h1 className="h1 reveal r2">
              Full-stack<br />air <span className="b">intelligence.</span>
            </h1>
          </div>
          <div className="reveal r3">
            <p className="body-lg" style={{ marginBottom: 32 }}>
              Vortex designs and integrates every layer of the autonomous stack — airframe, flight control, onboard AI, and cloud GCS. No black boxes. No foreign firmware. Complete system sovereignty.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag tag-green">Hardware</span>
              <span className="tag tag-blue">Software</span>
              <span className="tag tag-green">AI / ML</span>
              <span className="tag tag-blue">Cloud GCS</span>
            </div>
          </div>
        </div>

        {/* CAP STACK */}
        <div className="cap-stack">
          <div className="cap-stack-header">
            <div>
              <div className="eyebrow eyebrow-blue reveal r1">Technology stack</div>
              <h2 className="h2 reveal r2">Built from the<br />ground up.</h2>
            </div>
            <div className="reveal r3">
              <p className="body-md">
                Each layer of the Vortex stack is developed in-house. This means faster iteration, defensible IP, full customisation for mission profiles, and zero dependency on foreign-controlled systems.
              </p>
            </div>
          </div>

          {capabilityLayers.map((layer, idx) => (
            <div key={layer.num} className="cap-layer reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
              <div className="cap-layer-num">{layer.num}</div>
              <div className="cap-layer-title">
                <div className="cap-layer-name">{layer.name}</div>
                <p className="cap-layer-sub">{layer.sub}</p>
              </div>
              <div className="cap-layer-tech">
                <ul>
                  {layer.tech.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div className="cap-layer-status">
                <span className={`tech-status${layer.statusClass ? ` ${layer.statusClass}` : ''}`}>
                  {layer.status}
                </span>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
                  {layer.statusNote}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SOFTWARE SECTION */}
        <div className="sw-section">
          <div style={{ marginBottom: 0 }}>
            <div className="eyebrow eyebrow-blue reveal r1">Software platform</div>
            <h2 className="h2 reveal r2" style={{ marginBottom: 16 }}>Vortex Cloud GCS</h2>
            <p className="body-md reveal r3" style={{ maxWidth: 560, marginBottom: 0 }}>
              The Indian alternative to DJI Flight Hub — a hardware-agnostic drone fleet management platform built for Indian data residency, NPNT compliance, and enterprise-scale operations.
            </p>
          </div>

          <div className="sw-grid">
            {softwareCards.map((card, idx) => (
              <div key={card.title} className="sw-card reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
                <div className="sw-icon">
                  <SoftwareIcon icon={card.icon} />
                </div>
                <div className="sw-title">{card.title}</div>
                <p className="sw-body">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
