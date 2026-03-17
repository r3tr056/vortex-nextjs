import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import RevealObserver from '@/components/RevealObserver';
import HeroCarousel from '@/components/HeroCarousel';
import IntelStrip from '@/components/IntelStrip';
import Link from 'next/link';

/* ─── colour tokens ─── */
const BG        = '#06080D';
const BG2       = '#0A0E16';
const BG3       = '#0F1520';
const LINE      = 'rgba(255,255,255,0.06)';
const GREEN     = '#94d327';
const GREEN_DIM = 'rgba(148,211,39,0.08)';
const GREEN_GLOW= 'rgba(148,211,39,0.14)';
const MUTED     = '#52607A';

const Mono = ({ children, color = MUTED }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color }}>
    {children}
  </div>
);

/* Platform data — inline for full control over copy */
const platforms = [
  {
    id: 'vas01',
    num: 'VAS-01',
    name: 'Atlas',
    class: 'Heavy-Lift Logistics',
    config: 'Hexacopter',
    specKey: 'Payload',
    specVal: '25 kg',
    specKey2: 'Endurance',
    specVal2: '30 min',
    category: 'Dual-Use · Civil + Military',
    status: 'TRL 6 · Available',
    tagLabel: 'Dual-Use',
    tagClass: 'tag-blue',
    pitch: 'The workhorse. Where roads end and missions begin.\nForward resupply, medevac, humanitarian last-mile — Atlas carries what matters, where vehicles cannot go.',
    accent: '#38b6ff',
    restricted: false,
  },
  {
    id: 'vas02',
    num: 'VAS-02',
    name: 'Atlas Ag',
    class: 'Precision Agriculture',
    config: 'Hexacopter · Spray + Seed',
    specKey: 'Payload',
    specVal: '10–16 L modular',
    specKey2: 'Coverage',
    specVal2: '~1 ac/min',
    category: 'Civil · SMAM Eligible',
    status: 'TRL 6 · TC Pathway Active',
    tagLabel: 'Civil',
    tagClass: 'tag-agri',
    pitch: 'India farms 140 million hectares.\nAtlas Ag is how precision reaches every one of them.\nRTK-guided, AI-mapped, subsidy-eligible.',
    accent: '#94d327',
    restricted: false,
  },
  {
    id: 'vas03',
    num: 'VAS-03',
    name: 'Ranger',
    class: 'Enterprise ISR · Mapping',
    config: 'Quadcopter + Tethered Variant',
    specKey: 'Endurance',
    specVal: 'Unlimited (tethered)',
    specKey2: 'Payload',
    specVal2: 'EO/IR · LiDAR bay',
    category: 'Dual-Use · Civil + Military',
    status: 'TRL 6 · Available',
    tagLabel: 'Government',
    tagClass: 'tag-blue',
    pitch: 'Persistent eyes. Unlimited endurance when tethered.\nBorder surveillance, infrastructure inspection, real-time intelligence — Ranger watches without blinking.',
    accent: '#38b6ff',
    restricted: false,
  },
  {
    id: 'vas04',
    num: 'VAS-04',
    name: 'Sentinel',
    class: 'Lightweight ISR',
    config: 'Compact Quadcopter + Tethered',
    specKey: 'Altitude',
    specVal: '3,500 m+ certified',
    specKey2: 'Category',
    specVal2: 'MoD Exempt',
    category: 'Military · Dual-Use',
    status: 'TRL 6 · MoD Exempt',
    tagLabel: 'Military',
    tagClass: 'tag-green',
    pitch: 'Designed for Ladakh.\nOperates where most drones refuse to fly.\nLightweight, cold-resistant, high-altitude ISR for India\'s most demanding forward positions.',
    accent: '#94d327',
    restricted: false,
  },
  {
    id: 'vas05',
    num: 'VAS-05',
    name: 'Sentinel-M',
    class: 'RESTRICTED',
    config: 'Loitering Munition',
    specKey: 'Variants',
    specVal: 'Strike · Kamikaze · FPV',
    specKey2: 'Channel',
    specVal2: 'MoD Only',
    category: 'Military Only · MoD Channels',
    status: 'iDEX Application Filed',
    tagLabel: 'Classified',
    tagClass: '',
    pitch: 'This platform is not discussed in open channels.\nDefence procurement only.\nContact through verified MoD pathways.',
    accent: '#e84141',
    restricted: true,
  },
  {
    id: 'vas06',
    num: 'VAS-06',
    name: 'Hornet Swarm',
    class: 'Autonomous Swarm',
    config: '10–15 unit coordinated array',
    specKey: 'Control',
    specVal: 'Single operator',
    specKey2: 'Autonomy',
    specVal2: 'Mesh AI · decentralised',
    category: 'Military · Dual-Use',
    status: 'iDEX Application Filed',
    tagLabel: 'Swarm',
    tagClass: 'tag-green',
    pitch: 'One operator. Fifteen drones. Zero collision.\nHornet executes coordinated swarm missions with mesh-networked AI — no cloud, no single point of failure, no foreign firmware.',
    accent: '#94d327',
    restricted: false,
  },
];

const capabilities = [
  {
    num: '01',
    title: 'VortexDelta Firmware',
    body: 'Our custom ArduCopter derivative built for Indian operational conditions. GPS-denied navigation via inertial and optical flow. AI-assisted obstacle avoidance. No OEM cloud dependency. Fully auditable source. Runs on Cube Orange Plus.',
  },
  {
    num: '02',
    title: 'Vortex Cloud GCS',
    body: 'Browser-native ground control. Real-time telemetry across all active platforms simultaneously. Mission planning, fleet health, video feed integration, log analytics. No Chinese server infrastructure. Indian data sovereignty.',
  },
  {
    num: '03',
    title: 'AI Vision & Edge Inference',
    body: 'Onboard neural inference on every platform. Target classification, anomaly detection, terrain mapping — processed on the vehicle, not in a data centre. Decisions in milliseconds. No connectivity required.',
  },
  {
    num: '04',
    title: 'Indigenous Supply Chain',
    body: 'Every component is sourced and validated against a zero-Chinese hardware policy. Vendor list available for MoD due diligence. Critical assemblies manufactured in-house in Ghaziabad, UP.',
  },
  {
    num: '05',
    title: 'Multi-Domain Operations',
    body: 'The same avionics stack, the same GCS interface, the same maintenance protocol — across logistics, agriculture, ISR, and strike. One team. One training cycle. Every mission.',
  },
];

export default function HomePage() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <RevealObserver />

      <main style={{ background: BG }}>

        {/* ══════════════════════════════════════════════════════
            HERO CAROUSEL — existing component
        ══════════════════════════════════════════════════════ */}
        <HeroCarousel />


        {/* ══════════════════════════════════════════════════════
            SUBHEADLINE BAND
            Six platforms. One indigenous stack. Zero Chinese components.
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 80% at 20% 50%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{
            padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 56px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <div className="eyebrow reveal r1" style={{ marginBottom: 20 }}>Vortex Autonomous Systems</div>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(28px, 4.5vw, 64px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em',
                color: '#E4EAF4', marginBottom: 0,
              }} className="reveal r2">
                Six platforms.<br />One indigenous stack.<br /><span style={{ color: GREEN }}>Zero Chinese components.</span>
              </h2>
            </div>
            <div className="reveal r3">
              <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#7A8BA6', lineHeight: 1.82, marginBottom: 32 }}>
                From 25 kg logistics to swarm operations — Vortex Autonomous Systems engineers the autonomous infrastructure that India&apos;s next conflict, next harvest, and next disaster response depends on.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/systems" className="btn-primary">Explore Platforms <span className="arr">→</span></Link>
                <Link href="/partner" className="btn-outline">Request Briefing</Link>
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            INTEL TICKER STRIP
        ══════════════════════════════════════════════════════ */}
        <IntelStrip />


        {/* ══════════════════════════════════════════════════════
            MANIFESTO
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 56px)', background: BG, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 70% at 50% 50%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />

          <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="eyebrow reveal r1" style={{ justifyContent: 'center', marginBottom: 32 }}>Our Position</div>

            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(32px, 5.5vw, 80px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em',
              color: '#E4EAF4', textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 56px)',
            }} className="reveal r2">
              India does not need to import<br />its autonomous future.
            </h2>

            {/* Body copy — left-aligned for readability */}
            <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
              <p style={{ fontSize: 'clamp(14px, 2vw, 15px)', color: '#8A9BB8', lineHeight: 1.85 }} className="reveal r3">
                For too long, the platforms protecting India&apos;s borders, feeding its farms, and surveying its infrastructure have been assembled from components manufactured in adversarial supply chains.
              </p>
              <p style={{ fontSize: 'clamp(14px, 2vw, 15px)', color: '#8A9BB8', lineHeight: 1.85 }} className="reveal r3">
                We built Vortex to end that.
              </p>
              <p style={{ fontSize: 'clamp(14px, 2vw, 15px)', color: '#8A9BB8', lineHeight: 1.85 }} className="reveal r4">
                Every motor, every frame, every line of firmware that leaves our facility is engineered with one constraint that cannot be negotiated: <span style={{ color: GREEN }}>zero Chinese components</span>. Not as a marketing claim. As a design requirement hardwired into every bill of materials from day one.
              </p>
              <p style={{ fontSize: 'clamp(14px, 2vw, 15px)', color: '#8A9BB8', lineHeight: 1.85 }} className="reveal r4">
                We are a team of engineers, not salespeople. We do not promise capability we cannot demonstrate. Every platform we ship carries a TRL 6 designation — tested, validated, operationally ready.
              </p>
              <p style={{ fontSize: 'clamp(15px, 2.2vw, 16px)', color: '#C8D8E8', lineHeight: 1.75, fontWeight: 500 }} className="reveal r5">
                The age of India buying its autonomy from elsewhere is over.
              </p>
            </div>

            {/* Closing statement */}
            <div style={{ marginTop: 52, textAlign: 'center', paddingTop: 32, borderTop: `1px solid ${LINE}` }} className="reveal r5">
              <Mono color={MUTED}>Vortex Autonomous Systems — Ghaziabad, UP.</Mono>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            PLATFORM GRID — all 6 platforms with full copy
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG2, borderBottom: `1px solid ${LINE}` }}>

          {/* Header */}
          <div style={{
            padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 56px) clamp(40px, 6vw, 56px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
            gap: 'clamp(32px, 5vw, 60px)',
            borderBottom: `1px solid ${LINE}`,
            alignItems: 'end'
          }}>
            <div>
              <div className="eyebrow reveal r1">The Platform Family</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 5vw, 72px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em', color: '#E4EAF4' }} className="reveal r2">
                Six systems.<br /><span style={{ color: GREEN }}>One ecosystem.</span>
              </h2>
            </div>
            <div className="reveal r3">
              <p style={{ fontSize: 'clamp(14px, 2vw, 15px)', color: '#7A8BA6', lineHeight: 1.82, marginBottom: 24 }}>
                Each platform shares a common avionics stack, ground control infrastructure, and supply chain. Deploy one. Scale to all.
              </p>
              <Link href="/systems" className="btn-arrow" style={{ color: '#7A8BA6' }}>
                Full systems overview <span className="arr">→</span>
              </Link>
            </div>
          </div>

          {/* 3×2 grid on desktop, responsive on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 1, background: LINE }}>
            {platforms.map((p) => (
              <Link
                key={p.id}
                href={`/systems/${p.id}`}
                style={{ textDecoration: 'none', display: 'block', background: BG2, padding: 'clamp(28px, 4vw, 36px) clamp(24px, 3vw, 32px)', borderTop: `2px solid transparent`, transition: 'border-color 0.2s, background 0.2s', position: 'relative', overflow: 'hidden' }}
                className="platform-card-home reveal"
              >
                {/* Accent glow on hover — static radial for the restricted variant */}
                {p.restricted && (
                  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 60% at 50% 40%, rgba(232,65,65,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />
                )}

                {/* Designation + tag row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Mono color={p.restricted ? '#e84141' : p.accent}>{p.num}</Mono>
                  {p.tagLabel && (
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: '0.20em', textTransform: 'uppercase',
                      color: p.restricted ? '#e84141' : p.accent,
                      border: `1px solid ${p.restricted ? 'rgba(232,65,65,0.22)' : `${p.accent}33`}`,
                      background: p.restricted ? 'rgba(232,65,65,0.06)' : `${p.accent}0D`,
                      padding: '4px 8px',
                    }}>{p.tagLabel}</span>
                  )}
                </div>

                {/* Name + class */}
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: '#E4EAF4', lineHeight: 1, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: MUTED, marginBottom: 20, letterSpacing: '0.04em' }}>{p.class}</div>

                {/* 2 key specs */}
                {!p.restricted ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 20, background: LINE }}>
                    {[{ k: p.specKey, v: p.specVal }, { k: p.specKey2, v: p.specVal2 }].map((s) => (
                      <div key={s.k} style={{ background: BG3, padding: '10px 12px' }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: 600, color: p.accent, lineHeight: 1 }}>{s.v}</div>
                        <Mono color={MUTED}>{s.k}</Mono>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginBottom: 20, padding: '10px 12px', background: 'rgba(232,65,65,0.05)', border: '1px solid rgba(232,65,65,0.12)' }}>
                    <Mono color="#e84141">Defence procurement only · MoD channels</Mono>
                  </div>
                )}

                {/* Pitch copy */}
                <p style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: p.restricted ? 'rgba(232,65,65,0.55)' : '#52607A', lineHeight: 1.70, marginBottom: 20, whiteSpace: 'pre-line' }}>{p.pitch}</p>

                {/* Status + CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: `1px solid ${LINE}`, flexWrap: 'wrap', gap: 12 }}>
                  <Mono color={p.restricted ? 'rgba(232,65,65,0.45)' : MUTED}>{p.status}</Mono>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: p.accent, letterSpacing: '0.15em' }}>
                    {p.restricted ? 'Request Briefing →' : 'View platform →'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            METRICS ROW — 8 stats
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG3, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ padding: 'clamp(40px, 6vw, 52px) clamp(16px, 4vw, 56px) clamp(28px, 4vw, 36px)', borderBottom: `1px solid ${LINE}` }}>
            <div className="eyebrow reveal r1">By the Numbers</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', background: LINE, gap: 1 }}>
            {[
              { val: '6',        unit: '',      label: 'Operational platforms', sub: 'TRL 6 each' },
              { val: '25',       unit: ' kg',   label: 'Maximum payload', sub: 'VAS-01 Atlas' },
              { val: '0',        unit: '',      label: 'Chinese-origin components', sub: 'Across all platforms' },
              { val: '70',       unit: '%',     label: 'Made-in-India content', sub: 'Across the full stack' },
              { val: '3,500',    unit: ' m',    label: 'Operational altitude', sub: 'Sentinel high-alt ISR' },
              { val: '10+',      unit: '',      label: 'Drones per swarm', sub: 'Single-operator Hornet' },
              { val: '30',       unit: ' min',  label: 'Endurance at max payload', sub: 'Atlas Logistics' },
              { val: '∞',        unit: '',      label: 'Endurance · Ranger tethered', sub: 'No battery constraint' },
            ].map((m, i) => (
              <div key={i} style={{ background: BG2, padding: 'clamp(28px, 4vw, 36px) clamp(24px, 3vw, 32px)', borderBottom: `2px solid transparent`, transition: 'border-color 0.2s', transitionDelay: `${i * 0.06}s` }} className="reveal">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: GREEN, marginBottom: 10 }}>
                  {m.val}<span style={{ fontSize: '0.55em', color: '#52607A' }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#C8D8E8', fontWeight: 500, marginBottom: 4 }}>{m.label}</div>
                <Mono color={MUTED}>{m.sub}</Mono>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            CAPABILITIES TEASER — 5 blocks
        ══════════════════════════════════════════════════════ */}
        <section style={{ padding: 0, background: BG, borderBottom: `1px solid ${LINE}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 80% 40%, ${GREEN_GLOW} 0%, transparent 65%)`, pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{
            padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 56px) clamp(40px, 6vw, 52px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            borderBottom: `1px solid ${LINE}`,
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <div className="eyebrow reveal r1">The Technology</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4.8vw, 68px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em', color: '#E4EAF4' }} className="reveal r2">
                One stack to rule<br /><span style={{ color: GREEN }}>every mission.</span>
              </h2>
            </div>
            <Link href="/capabilities" className="btn-arrow reveal r3" style={{ color: '#7A8BA6' }}>
              Full capabilities overview <span className="arr">→</span>
            </Link>
          </div>

          {/* 5 capability blocks - responsive grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 1, background: LINE, position: 'relative', zIndex: 1 }}>
            {capabilities.map((c, i) => (
              <div key={c.num} style={{ background: BG2, padding: 'clamp(28px, 4vw, 36px) clamp(20px, 3vw, 28px)', borderTop: `2px solid ${i === 0 ? GREEN : LINE}`, transition: 'border-color 0.2s' }} className="reveal r2">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.20em', color: GREEN, opacity: 0.45, marginBottom: 16 }}>{c.num}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: 600, color: '#E4EAF4', marginBottom: 14, lineHeight: 1.1 }}>{c.title}</div>
                <p style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: MUTED, lineHeight: 1.75 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════
            CTA BAND — bottom of home
        ══════════════════════════════════════════════════════ */}
        <section style={{
          padding: 'clamp(60px, 8vw, 80px) clamp(16px, 4vw, 56px)',
          background: BG2,
          borderBottom: `1px solid ${LINE}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'clamp(32px, 5vw, 40px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 10% 50%, ${GREEN_DIM} 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="eyebrow reveal r1" style={{ marginBottom: 16 }}>Procurement · Partnerships · Briefings</div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 700, lineHeight: 0.90, letterSpacing: '-0.015em', color: '#E4EAF4' }} className="reveal r2">
              Ready to deploy Vortex<br />on your mission?
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }} className="reveal r3">
            <Link href="/partner#contact-form" className="btn-primary">Initiate Procurement <span className="arr">→</span></Link>
            <Link href="/systems" className="btn-outline">View All Platforms</Link>
            <Link href="/company" className="btn-outline">About Vortex</Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
