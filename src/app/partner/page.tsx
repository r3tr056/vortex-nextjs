import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import ContactForm from '@/components/ContactForm';
import Link from 'next/link';

export const metadata = {
  title: 'Partner — Procurement pathways',
  description:
    'Three procurement pathways for defence, enterprise, and R&D partners. Field demos available. info@vortexsystem.org',
};

const paths = [
  {
    num: 'PATH 01',
    title: 'Defence & Government',
    accent: 'var(--accent)',
    channels: [
      'iDEX DISC · Make-II · Fast Track Procedure',
      'GeM Portal · Army Design Bureau',
      'DRDO TDF · ADITI scheme',
    ],
    body:
      'MoD-exempt platforms through verified defence channels. NDA on first contact for Sentinel-M and Hornet Swarm.',
    cta: 'Request Defence Briefing',
    primary: true,
  },
  {
    num: 'PATH 02',
    title: 'Enterprise & Institutional',
    accent: 'var(--info)',
    channels: [
      'Direct supply · Annual fleet contracts',
      'Pilot + training + maintenance SLA',
      'TC-certified platforms for DGCA compliance',
    ],
    body:
      'Civil logistics, state agriculture departments, infrastructure survey, and disaster response authorities.',
    cta: 'Request Enterprise Briefing',
    primary: false,
  },
  {
    num: 'PATH 03',
    title: 'Research & Development',
    accent: 'var(--warn)',
    channels: [
      'Academic institutions · DRDO labs',
      'Startup ecosystem · Defence incubators',
    ],
    body:
      'Co-development, technology transfer, and joint-IP arrangements for qualifying Indian research institutions.',
    cta: 'Request R&D Briefing',
    primary: false,
  },
];

export default function PartnerPage() {
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
            <span className="eyebrow eyebrow-blue reveal r1">Work With Us</span>
            <h1 className="h1 display reveal r2" style={{ maxWidth: 1100 }}>
              Three ways to procure.<br />
              <span className="g">One team to work with.</span>
            </h1>
            <p className="body-lg reveal r3" style={{ maxWidth: 640, marginTop: 24 }}>
              Clear procurement paths. Verified channels. Dedicated contact and NDA template
              ready on first exchange.
            </p>
          </div>
        </section>

        {/* Paths */}
        <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section-tight">
            <div className="split-7-5" style={{ marginBottom: 32 }}>
              <div>
                <span className="eyebrow reveal r1">Procurement Paths</span>
                <h2 className="h2 reveal r2" style={{ marginBottom: 0 }}>
                  How to engage.
                </h2>
              </div>
              <p className="body-lg reveal r3" style={{ alignSelf: 'end' }}>
                Every path has a dedicated team contact, NDA template, and platform briefing pack
                available on first contact.
              </p>
            </div>

            <div className="cards-auto-sm" style={{ border: '1px solid var(--line)' }}>
              {paths.map((p, i) => (
                <div
                  key={p.num}
                  className="reveal"
                  style={{
                    padding: 'clamp(28px, 3vw, 40px)',
                    borderTop: `2px solid ${p.accent}`,
                    transitionDelay: `${i * 0.05}s`,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.22em', color: p.accent, marginBottom: 14 }}>
                    {p.num}
                  </div>
                  <div className="display" style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', marginBottom: 18 }}>
                    {p.title}
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {p.channels.map((ch) => (
                      <li key={ch} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ color: p.accent, fontSize: 10, marginTop: 5, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{ch}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ height: 1, background: 'var(--line)', marginBottom: 20 }} />

                  <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24, flex: 1 }}>
                    {p.body}
                  </p>

                  <Link
                    href="#contact-form"
                    className={p.primary ? 'btn-primary' : 'btn-outline'}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {p.cta} <span className="arr">→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact-form" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <div className="container section split-5-5">
            <div>
              <span className="eyebrow eyebrow-blue reveal r1">Get in Touch</span>
              <h2 className="h2 reveal r2" style={{ marginBottom: 20 }}>
                Start the<br />conversation.
              </h2>
              <p className="body-lg reveal r3" style={{ marginBottom: 28 }}>
                Defence inquiries under mutual NDA. Classified platform details shared only with
                verified institutional buyers.
              </p>

              <div className="spec-table reveal r4" style={{ border: '1px solid var(--line)' }}>
                {[
                  { k: 'Email', v: 'info@vortexsystem.org', href: 'mailto:info@vortexsystem.org' },
                  { k: 'Location', v: 'Ghaziabad, UP · India' },
                  { k: 'DPIIT', v: 'Recognised Startup', accent: true },
                  { k: 'GeM portal', v: 'Registered vendor', accent: true },
                  { k: 'iDEX status', v: 'DISC Applicant · 2026', accent: true },
                ].map((r) => (
                  <div key={r.k} className="spec-row" style={{ padding: '14px 18px' }}>
                    <span className="spec-key">{r.k}</span>
                    <span className="spec-value">
                      {r.href ? (
                        <a href={r.href} style={{ color: 'var(--accent)' }}>
                          {r.v}
                        </a>
                      ) : (
                        <span style={r.accent ? { color: 'var(--accent)' } : undefined}>{r.v}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal r3">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* Field demo CTA */}
        <section
          className="section-tight"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
        >
          <div className="ambient-tl" />
          <div className="container cta-band" style={{ position: 'relative' }}>
            <div style={{ maxWidth: 640 }}>
              <span className="eyebrow reveal r1">Field Demonstrations</span>
              <h2 className="h2 reveal r2" style={{ fontSize: 'clamp(26px, 3.6vw, 44px)', marginBottom: 12 }}>
                We fly to you.
              </h2>
              <p className="body-lg reveal r3" style={{ marginBottom: 0 }}>
                High-altitude forward base, agricultural field in Punjab, coastal infrastructure
                site — we demonstrate in your actual operating conditions.
              </p>
            </div>
            <div className="reveal r3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="#contact-form" className="btn-primary">
                Schedule Field Demo <span className="arr">→</span>
              </Link>
              <Link href="/partner/one-pager" className="btn-outline">
                Investor One-Pager
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
