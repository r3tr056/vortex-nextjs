import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import ContactForm from '@/components/ContactForm';
import Link from 'next/link';

export const metadata = {
  title: 'Partner — Vortex Autonomous Systems',
  description: 'Three procurement pathways for defence, enterprise, and R&D partners. Field demos available. hello@vortexsystem.org',
};

const BG        = '#06080D';
const BG2       = '#0A0E16';
const BG3       = '#0F1520';
const LINE      = 'rgba(255,255,255,0.06)';
const GREEN     = '#94d327';
const GREEN_DIM = 'rgba(148,211,39,0.08)';
const GREEN_GLOW= 'rgba(148,211,39,0.14)';
const BLUE      = '#38b6ff';
const MUTED     = '#52607A';

const Mono = ({ children, color = MUTED }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color }}>
    {children}
  </div>
);

const paths = [
  {
    num: 'PATH 01',
    title: 'Defence & Government',
    accent: GREEN,
    accentDim: 'rgba(148,211,39,0.08)',
    channels: [
      'iDEX DISC · Make-II · Fast Track Procedure',
      'GeM Portal · Army Design Bureau',
      'DRDO TDF · ADITI scheme',
    ],
    body: 'MoD-exempt platforms available through verified defence procurement channels. NDA executed on first contact for Sentinel-M and Hornet Swarm briefings.',
    cta: 'Request Defence Briefing',
    ctaClass: 'btn-primary',
  },
  {
    num: 'PATH 02',
    title: 'Enterprise & Institutional',
    accent: BLUE,
    accentDim: 'rgba(56,182,255,0.08)',
    channels: [
      'Direct supply agreement · Annual fleet contracts',
      'Pilot programme · Training and maintenance SLA',
      'TC-certified platforms for DGCA compliance',
    ],
    body: 'For civil logistics operators, state government agriculture departments, infrastructure survey firms, and disaster management authorities.',
    cta: 'Request Enterprise Briefing',
    ctaClass: 'btn-arrow',
  },
  {
    num: 'PATH 03',
    title: 'Research & Development',
    accent: 'rgba(148,211,39,0.45)',
    accentDim: 'rgba(148,211,39,0.05)',
    channels: [
      'Academic institutions · DRDO labs',
      'Startup ecosystem · Defence incubators',
    ],
    body: 'Co-development agreements, technology transfer frameworks, and joint IP arrangements available for qualifying Indian research institutions.',
    cta: 'Request R&D Briefing',
    ctaClass: 'btn-arrow',
  },
];

export default function PartnerPage() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main className="pt-nav" style={{ background: BG }}>

        {/* ══════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════ */}
        <div className="partner-hero" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="partner-hero-bg" />
          <div className="noise" />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 65% at 15% 55%, ${GREEN_GLOW} 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
          <div className="ghost-text" style={{ position: 'absolute', top: 80, right: 56, zIndex: 0 }}>PARTNER</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="eyebrow eyebrow-blue reveal r1">Work With Us</div>
            <h1 className="h1 reveal r2">
              Three ways to procure.<br /><span className="g">One team to work with.</span>
            </h1>
            <p className="body-lg reveal r3" style={{ maxWidth: 580, marginTop: 24 }}>
              Defence. Enterprise. Research. Clear procurement pathways, verified channels, and a team that stays in the loop from first briefing to field deployment.
            </p>
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════
            PROCUREMENT PATHS — 3 columns
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ padding: '64px 56px 48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', borderBottom: `1px solid ${LINE}` }}>
            <div>
              <div className="eyebrow reveal r1">Procurement Paths</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                How to engage.
              </h2>
            </div>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 400 }} className="reveal r3">
              Every procurement path has a dedicated team contact, NDA template, and platform briefing pack ready to send on first contact.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: LINE }}>
            {paths.map((p, i) => (
              <div key={p.num} style={{ background: BG2, padding: '44px 36px', borderTop: `2px solid ${p.accent}`, position: 'relative', overflow: 'hidden', transitionDelay: `${i * 0.08}s` } as React.CSSProperties} className="reveal">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, ${p.accentDim} 0%, transparent 100%)`, pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                  <Mono color={p.accent as string}>{p.num}</Mono>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 700, color: '#E4EAF4', lineHeight: 1, margin: '14px 0 20px' }}>{p.title}</div>

                  {/* Channel list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {p.channels.map((ch) => (
                      <div key={ch} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: p.accent as string, fontSize: 10, marginTop: 2, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 12, color: '#7A8BA6', lineHeight: 1.6 }}>{ch}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: LINE, marginBottom: 20 }} />

                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>{p.body}</p>

                  <Link
                    href="#contact-form"
                    className={p.ctaClass}
                    style={i === 0 ? { background: GREEN, color: '#000', display: 'inline-flex', alignItems: 'center', gap: 8 } : { color: p.accent as string }}
                  >
                    {p.cta} <span className="arr">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            CONTACT SECTION
        ══════════════════════════════════════════════════════ */}
        <section className="contact-section" id="contact-form" style={{ background: BG }}>
          <div className="contact-inner">
            {/* Left */}
            <div className="contact-info">
              <div className="eyebrow eyebrow-blue reveal r1">Get in Touch</div>
              <h2 className="h2 reveal r2" style={{ marginBottom: 20 }}>
                Start the<br />conversation.
              </h2>
              <p className="reveal r3" style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 32 }}>
                Defence inquiries are handled under mutual NDA. All communications are treated with full operational security. Classified platform details shared only with verified institutional buyers.
              </p>

              {/* Contact details */}
              <div className="contact-detail reveal r4">
                {[
                  { k: 'General',         v: 'hello@vortexsystem.org', href: 'mailto:hello@vortexsystem.org' },
                  { k: 'Defence',         v: 'defense@vortexsystem.org', href: 'mailto:defense@vortexsystem.org' },
                  { k: 'Location',        v: 'Ghaziabad, Uttar Pradesh · India', href: null },
                  { k: 'DPIIT',           v: 'Recognised Startup', href: null, green: true },
                  { k: 'GeM portal',      v: 'Registered vendor', href: null, green: true },
                  { k: 'iDEX status',     v: 'DISC Applicant · Cycle 2026', href: null, green: true },
                ].map((r) => (
                  <div key={r.k} className="contact-row">
                    <span className="contact-row-k">{r.k}</span>
                    <span className="contact-row-v">
                      {r.href ? (
                        <a href={r.href} style={{ color: BLUE }}>{r.v}</a>
                      ) : (
                        <span style={r.green ? { color: GREEN } : {}}>{r.v}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="reveal r2">
              <ContactForm />
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            FIELD DEMO CTA
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 56px', background: BG3, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 65% 80% at 10% 50%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <div className="eyebrow reveal r1" style={{ marginBottom: 16 }}>Ready to Deploy?</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 16 }} className="reveal r2">
              Every platform is available for demonstration<br />in your operational environment.
            </h2>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.8 }} className="reveal r3">
              We fly to you. Whether it&apos;s a high-altitude forward operating base, an agricultural field in Punjab, or a coastal infrastructure site — we demonstrate in the conditions you actually operate in.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }} className="reveal r3">
            <Link href="#contact-form" className="btn-primary" style={{ fontSize: 14, padding: '16px 28px' }}>
              Schedule a Field Demo <span className="arr">→</span>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
