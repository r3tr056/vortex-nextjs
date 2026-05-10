'use client';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';
import { motion } from 'framer-motion';

const highlightCategories = [
  {
    id: 'defence',
    tag: 'Military',
    tagClass: 'tag-green',
    name: 'Defence & Security',
    pitch: 'High-altitude ISR, loitering munitions, and medevac for forward positions.',
    specs: [{ k: 'Altitude', v: '3,500 m+' }, { k: 'Compliance', v: 'MoD Exempt' }],
    example: 'Sentinel & Atlas Series'
  },
  {
    id: 'enterprise',
    tag: 'Civil',
    tagClass: 'tag-agri',
    name: 'Enterprise & Mapping',
    pitch: 'Precision agriculture, structural survey, and logistics where roads end.',
    specs: [{ k: 'Payload', v: 'Up to 25kg' }, { k: 'Endurance', v: 'Extended' }],
    example: 'Ranger & Atlas Ag'
  },
  {
    id: 'swarm',
    tag: 'Swarm',
    tagClass: 'tag-blue',
    name: 'Autonomous Swarm',
    pitch: 'Single-operator control of 10–15 drones. Mesh-networked edge AI.',
    specs: [{ k: 'Control', v: '1-to-15' }, { k: 'Network', v: 'Mesh / No Cloud' }],
    example: 'Hornet Systems'
  }
];

const whyVortex = [
  {
    num: '01', title: 'Zero-Chinese BOM',
    body: 'Every component verified before procurement, protecting supply chains from systemic risk.',
  },
  {
    num: '02', title: 'One Native Stack',
    body: 'Airframe, flight control, edge AI, and Cloud GCS — developed in-house with Indian data sovereignty.',
  },
  {
    num: '03', title: 'Flight-Proven TRL 6',
    body: 'Not a render. Six operational platforms demonstrated in extreme environments, ready for audit.',
  }
];

// Motion variants for scroll animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="main">
        <HeroCarousel />

        {/* Lighter, clearer positioning section */}
        <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', position: 'relative' }}>
          <div className="ambient-center" />
          <motion.div 
            className="container" 
            style={{ maxWidth: 900, textAlign: 'center', position: 'relative' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="eyebrow" style={{ justifyContent: 'center' }}>
              Our Mission
            </motion.span>
            <motion.h2 variants={fadeInUp} className="h2" style={{ marginBottom: 32 }}>
              Building the indigenous drone ecosystem.<br />
              <span className="g">From silicon to sky.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="body-lg" style={{ margin: '0 auto 48px', maxWidth: 640 }}>
              Vortex builds autonomous UAV platforms for Indian defence, government, and
              precision industry. One unified stack. In-house firmware. Zero reliance on high-risk supply chains.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/systems" className="btn-primary" style={{ margin: '0 auto' }}>
                View Full Catalog <span className="arr">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Simplified Platform Categories */}
        <section className="section" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <motion.div 
            className="container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="split-5-5" style={{ marginBottom: 64, alignItems: 'flex-end' }}>
              <motion.div variants={fadeInUp}>
                <span className="eyebrow">Platform Families</span>
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Engineered for<br />extreme operations.
                </h2>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <p className="body-lg" style={{ marginBottom: 16 }}>
                  Six specialized platforms built on a single avionics stack, enabling rapid deployment and unified training across different mission profiles.
                </p>
                <Link href="/systems" className="btn-arrow">
                  Explore Specifications <span className="arr">→</span>
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="cards-auto" style={{ border: '1px solid var(--line)', background: 'var(--line)', gap: '1px' }}>
              {highlightCategories.map((c) => (
                <div key={c.id} className="card card-accent" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <span className={`tag ${c.tagClass}`}>{c.tag}</span>
                  </div>

                  <div className="display" style={{ fontSize: 'clamp(26px, 3vw, 36px)', marginBottom: 12 }}>
                    {c.name}
                  </div>
                  <p className="body-md" style={{ marginBottom: 32, flex: 1 }}>
                    {c.pitch}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 24, background: 'var(--line)' }}>
                    {c.specs.map((s) => (
                      <div key={s.k} style={{ background: 'var(--surface-2)', padding: '16px' }}>
                        <div className="display" style={{ fontSize: 18, color: 'var(--accent)', lineHeight: 1 }}>
                          {s.v}
                        </div>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 6 }}>
                          {s.k}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                    Featuring: <span style={{ color: 'var(--text)' }}>{c.example}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Unified Why Vortex Section */}
        <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div className="ambient-tr" />
          <motion.div 
            className="container" style={{ position: 'relative' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="split-7-5" style={{ marginBottom: 64 }}>
              <motion.div variants={fadeInUp}>
                <span className="eyebrow">The Advantage</span>
                <h2 className="h2" style={{ marginBottom: 0 }}>
                  Built differently.<br /><span className="g">By design.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeInUp} className="body-lg" style={{ alignSelf: 'end' }}>
                We don&apos;t just assemble off-the-shelf parts. We engineer the core infrastructure, ensuring complete control over security, performance, and upgrades.
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="cards-auto-sm" style={{ border: '1px solid var(--line)', gap: '1px' }}>
              {whyVortex.map((d, i) => (
                <motion.div
                  variants={fadeInUp}
                  key={d.num}
                  className="card"
                  style={{
                    padding: 'clamp(32px, 4vw, 48px)',
                    borderTop: `2px solid ${i === 0 ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  <div className="mono" style={{ fontSize: 12, letterSpacing: '0.22em', color: 'var(--accent)', opacity: 0.7, marginBottom: 20 }}>
                    {d.num}
                  </div>
                  <div className="display" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.12, marginBottom: 16 }}>
                    {d.title}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.72 }}>{d.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Clean, minimalist CTA */}
        <section className="section-tight" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <motion.div 
            className="container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <span className="eyebrow" style={{ justifyContent: 'center' }}>Next Steps</span>
              <h2 className="h2" style={{ marginBottom: 24 }}>Ready to deploy?</h2>
              <p className="body-lg" style={{ marginBottom: 40 }}>
                Whether you are procuring for defence or exploring enterprise capabilities, connect with our engineering team directly.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/partner#contact-form" className="btn-primary">
                  Start Conversation <span className="arr">→</span>
                </Link>
                <Link href="/partner/one-pager" className="btn-outline">
                  Investor Overview
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
