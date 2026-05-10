import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import Link from 'next/link';
import { timeline, values } from '@/data';

export const metadata = {
  title: 'Company — Engineers first, always',
  description:
    'DPIIT-registered defence technology startup. Ghaziabad, UP. TRL 6 across six platforms. Zero Chinese components. Registered vendor on GeM · iDEX 2026 applicant.',
};

const teamDisciplines = [
  { k: 'Aeronautical Engineering', v: 'Airframe · CF structures · motor-arm geometry' },
  { k: 'Embedded & Avionics',      v: 'ArduPilot · PX4 · Cube Orange Plus integration' },
  { k: 'AI / ML · Edge Inference', v: 'YOLOv8 · ByteTrack · Jetson deployment' },
  { k: 'Systems & Firmware',       v: 'VortexDelta custom stack · MAVLink routing' },
  { k: 'Cloud GCS Platform',       v: 'FastAPI · real-time telemetry · NPNT compliant' },
  { k: 'Field Operations',         v: 'High-altitude · desert · tropical validation' },
];

const credentials = [
  { k: 'Entity',        v: 'Vortex Autonomous Systems Pvt. Ltd.' },
  { k: 'Registration',  v: 'DPIIT Recognised Startup' },
  { k: 'Founded',       v: '2026 · Ghaziabad, UP' },
  { k: 'Platform TRL',  v: 'TRL 6 · all six platforms' },
  { k: 'Supply chain',  v: '0 Chinese-origin components' },
  { k: 'iDEX',          v: 'Open Challenge applicant · 2026' },
  { k: 'GeM',           v: 'Registered vendor' },
  { k: 'NPNT',          v: 'Digital Sky compliant' },
];

export default function CompanyPage() {
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
              <span className="eyebrow reveal r1">Who We Are</span>
              <h1 className="h1 display reveal r2">
                Engineers first.<br /><span className="g">Always.</span>
              </h1>
            </div>
            <div className="reveal r3" style={{ alignSelf: 'end' }}>
              <p className="body-lg" style={{ marginBottom: 20 }}>
                A DPIIT-registered defence technology company building autonomous UAV platforms in
                Ghaziabad, UP. Flight-validated across Ladakh high-altitude, coastal humidity,
                and agricultural flatland.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-green">DPIIT Startup</span>
                <span className="tag">Ghaziabad · UP</span>
                <span className="tag tag-blue">0 Chinese Components</span>
              </div>
            </div>
          </div>
        </section>

        {/* Credentials block */}
        <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight split-5-5">
            <div>
              <span className="eyebrow reveal r1">Credentials</span>
              <h2 className="h2 reveal r2" style={{ marginBottom: 28 }}>
                Documentation buyers<br /><span className="g">can verify.</span>
              </h2>
              <p className="body-md reveal r3" style={{ marginBottom: 24, maxWidth: 440 }}>
                Registration, supply-chain posture, and platform readiness — each line verifiable
                against official records on request.
              </p>
              <Link href="/partner#contact-form" className="btn-outline reveal r3">
                Request due-diligence pack
              </Link>
            </div>

            <div className="spec-table reveal r3" style={{ border: '1px solid var(--line)' }}>
              {credentials.map((r) => (
                <div key={r.k} className="spec-row" style={{ padding: '14px 18px' }}>
                  <span className="spec-key">{r.k}</span>
                  <span className="spec-value">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team disciplines */}
        <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight">
            <div className="split-7-5" style={{ marginBottom: 36 }}>
              <div>
                <span className="eyebrow reveal r1">Team</span>
                <h2 className="h2 reveal r2" style={{ marginBottom: 0 }}>
                  Six disciplines.<br /><span className="g">One integrated team.</span>
                </h2>
              </div>
              <p className="body-lg reveal r3" style={{ alignSelf: 'end' }}>
                A compact founding team that covers every layer of the stack in-house — from
                airframe mechanical through embedded avionics through edge inference to cloud
                fleet control.
              </p>
            </div>

            <div className="cards-auto-sm" style={{ border: '1px solid var(--line)' }}>
              {teamDisciplines.map((d, i) => (
                <div key={d.k} className="reveal" style={{ padding: 'clamp(24px, 3vw, 32px)', transitionDelay: `${i * 0.05}s` }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: 14 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                    {d.k}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>{d.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section
          className="section-tight"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
        >
          <div className="ambient-tr" />
          <div className="container split-5-5" style={{ position: 'relative' }}>
            <div>
              <span className="eyebrow reveal r1">Path to here</span>
              <h2 className="h2 reveal r2" style={{ marginBottom: 20 }}>
                Competition team<br />to company.
              </h2>
              <p className="body-md reveal r3" style={{ maxWidth: 380 }}>
                ISRO IROC-U to NIDAR to a registered defence startup — one year, six platforms,
                zero shortcuts.
              </p>
            </div>

            <ol style={{ listStyle: 'none' }}>
              {timeline.map((item, idx) => (
                <li
                  key={item.year}
                  className="row-2col-year reveal"
                  style={{
                    padding: '24px 0',
                    borderBottom: '1px solid var(--line)',
                    transitionDelay: `${idx * 0.05}s`,
                  }}
                >
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em', paddingTop: 4 }}
                  >
                    {item.year}
                  </div>
                  <div>
                    <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                      {item.title}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7, marginBottom: 0 }}>
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Values — operating principles */}
        <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight">
            <div className="split-7-5" style={{ marginBottom: 36 }}>
              <div>
                <span className="eyebrow eyebrow-blue reveal r1">How we work</span>
                <h2 className="h2 reveal r2" style={{ marginBottom: 0 }}>
                  Six principles.<br /><span className="g">Non-negotiable.</span>
                </h2>
              </div>
              <p className="body-lg reveal r3" style={{ alignSelf: 'end' }}>
                Operational commitments we can show you in code, BOMs, and flight logs — not slide
                decks.
              </p>
            </div>

            <div className="cards-auto-sm" style={{ border: '1px solid var(--line)' }}>
              {values.map((v, i) => (
                <div
                  key={v.num}
                  className="reveal"
                  style={{
                    padding: 'clamp(26px, 3vw, 36px)',
                    borderTop: `2px solid ${i === 0 ? 'var(--accent)' : 'transparent'}`,
                    transitionDelay: `${i * 0.05}s`,
                  }}
                >
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--muted)', marginBottom: 20 }}>
                    {v.num}
                  </div>
                  <div className="display" style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
                    {v.title}
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="section-tight"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
        >
          <div className="ambient-tl" />
          <div className="container cta-band" style={{ position: 'relative' }}>
            <div>
              <span className="eyebrow reveal r1">Work with us</span>
              <h2 className="h2 reveal r2" style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}>
                Defence · Government · Enterprise.
              </h2>
              <p className="body-md reveal r3" style={{ marginTop: 10, marginBottom: 0, maxWidth: 520 }}>
                One briefing covers procurement path, platform fit, and timelines.
              </p>
            </div>
            <div className="reveal r3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/partner#contact-form" className="btn-primary">Get in Touch <span className="arr">→</span></Link>
              <Link href="/partner/one-pager" className="btn-outline">One-Pager</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
