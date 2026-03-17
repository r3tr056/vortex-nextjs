import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import Link from 'next/link';
import { timeline, values } from '@/data';

export const metadata = {
  title: 'Company — Vortex Autonomous Systems',
  description: 'DPIIT-registered defence technology startup based in Ghaziabad, UP. Engineers first. Zero Chinese components. TRL 6 across all platforms.',
};

const BG        = '#06080D';
const BG2       = '#0A0E16';
const BG3       = '#0F1520';
const LINE      = 'rgba(255,255,255,0.06)';
const GREEN     = '#94d327';
const GREEN_DIM = 'rgba(148,211,39,0.08)';
const GREEN_GLOW= 'rgba(148,211,39,0.14)';
const MUTED     = '#52607A';

export default function CompanyPage() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main className="pt-nav" style={{ background: BG }}>

        {/* ══════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════ */}
        <div className="company-hero" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="company-hero-bg" />
          <div className="noise" />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 65% at 15% 55%, ${GREEN_GLOW} 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
          <div className="ghost-text" style={{ position: 'absolute', top: 80, right: 56, zIndex: 0 }}>VORTEX</div>

          <div className="company-grid-content" style={{ position: 'relative', zIndex: 1 }}>
            <div>
              <div className="eyebrow reveal r1">Who We Are</div>
              <h1 className="h1 reveal r2">
                Engineers first.<br /><span className="g">Always.</span>
              </h1>
            </div>
            <div className="reveal r3">
              <p className="body-lg" style={{ marginBottom: 24 }}>
                Vortex Autonomous Systems was founded by a team that had spent years watching India depend on foreign platforms for missions that Indian engineers were fully capable of designing better.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-green">DPIIT Registered</span>
                <span className="tag">Ghaziabad, UP · India</span>
                <span className="tag tag-blue">Zero Chinese Components</span>
              </div>
            </div>
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════
            WHO WE ARE — body copy
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ padding: '80px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 80% 30%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div className="eyebrow reveal r1" style={{ marginBottom: 24 }}>About the Company</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 32 }} className="reveal r2">
                We are a DPIIT-registered<br />defence technology startup<br />based in <span style={{ color: GREEN }}>Ghaziabad, UP.</span>
              </h2>
              {/* Credential strip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: LINE }}>
                {[
                  { k: 'Entity',        v: 'Vortex Autonomous Systems Pvt. Ltd.' },
                  { k: 'Registration',  v: 'DPIIT Recognised Startup' },
                  { k: 'Location',      v: 'Ghaziabad, Uttar Pradesh · India' },
                  { k: 'Platform TRL',  v: 'TRL 6 across all six platforms' },
                  { k: 'Supply chain',  v: '0 Chinese-origin components' },
                  { k: 'iDEX status',   v: 'Open Challenge applicant · 2026' },
                ].map((r) => (
                  <div key={r.k} className="spec-row" style={{ background: BG3 }}>
                    <span className="spec-key">{r.k}</span>
                    <span className="spec-value">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
              {[
                'We are a DPIIT-registered defence technology startup based in Ghaziabad, Uttar Pradesh. Our team spans aeronautical engineering, embedded systems, AI/ML, and military operations. We have flown our platforms in conditions ranging from Ladakh high-altitude to coastal humidity to agricultural flatland.',
                'We do not operate in stealth mode. We publish our TRL status, our design constraints, and our supply chain policy because we believe transparency is the only way to build the institutional trust that defence procurement demands.',
                'If you are looking for a vendor with a polished pitch deck and no flight hours — we are not that company.',
                'If you need platforms that work, documentation that holds up to scrutiny, and a team you can call at 2am when a mission timeline shifts — talk to us.',
              ].map((para, i) => (
                <p key={i} style={{
                  fontSize: i === 2 || i === 3 ? 16 : 15,
                  color: i === 2 ? MUTED : i === 3 ? '#C8D8E8' : '#8A9BB8',
                  lineHeight: 1.82,
                  fontWeight: i === 3 ? 500 : 400,
                  fontStyle: i === 2 ? 'italic' : 'normal',
                }} className="reveal r3">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            TIMELINE
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 56px', background: BG, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 45% 60% at 85% 40%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start', position: 'relative', zIndex: 1 }}>
            <div>
              <div className="eyebrow reveal r1">Timeline</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.015em', color: '#E4EAF4', marginBottom: 24 }} className="reveal r2">
                How we<br />got here.
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8 }} className="reveal r3">
                From ISRO&apos;s IROC-U challenge to NIDAR to a registered drone startup — one competition cycle, six platforms, zero shortcuts.
              </p>
            </div>

            <div className="origin-timeline">
              {timeline.map((item, idx) => (
                <div key={item.year} className="timeline-item reveal" style={{ transitionDelay: `${idx * 0.07}s` }}>
                  <div className="tl-year">{item.year}</div>
                  <div>
                    <div className="tl-title">{item.title}</div>
                    <p className="tl-body">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            OPERATING PRINCIPLES
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ padding: '72px 56px 52px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, borderBottom: `1px solid ${LINE}`, alignItems: 'end' }}>
            <div>
              <div className="eyebrow eyebrow-blue reveal r1">How We Work</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
                Six principles.<br /><span style={{ color: GREEN }}>Non-negotiable.</span>
              </h2>
            </div>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.8 }} className="reveal r3">
              Six principles that govern every engineering decision, every procurement negotiation, and every platform we ship. Not aspirational. Operational.
            </p>
          </div>

          <div className="values-grid" style={{ padding: '0 0' }}>
            {values.map((val, idx) => (
              <div key={val.num} className="value-card reveal" style={{ transitionDelay: `${idx * 0.07}s` }}>
                <span className="value-num">{val.num}</span>
                <div className="value-title">{val.title}</div>
                <p className="value-body">{val.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 56px', background: BG3, borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 10% 50%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="eyebrow reveal r1" style={{ marginBottom: 16 }}>Work with us</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(26px, 3.8vw, 52px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
              We are open to defence, government,<br />and enterprise conversations.
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }} className="reveal r3">
            <Link href="/partner" className="btn-primary">Get in Touch <span className="arr">→</span></Link>
            <Link href="/capabilities" className="btn-outline">View Capabilities</Link>
            <Link href="/systems" className="btn-outline">All Platforms</Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
