import Nav from '@/components/Nav';
import CustomCursor from '@/components/CustomCursor';

export const metadata = {
  title: 'Vortex Pre-Seed One Pager',
  description:
    'Pre-seed one-pager for Vortex Autonomous Systems covering problem, solution, market, traction, business model, team, and raise.',
};

export default function PartnerOnePager() {
  return (
    <>
      <CustomCursor />
      <Nav />

      <main className="pt-nav onepager-page">
        <article className="sheet">
          <div className="topbar">
            <span className="topbar-l">Vortex Autonomous Systems</span>
            <span className="topbar-r">Pre-Seed · April 2026</span>
          </div>

          <div className="op-hero">
            <div className="op-hero-left">
              <div className="op-eyebrow">Autonomous Drone Intelligence · India</div>
              <h1 className="op-title">
                Making Drones <em>Think.</em>
              </h1>
              <p className="op-sub">India&apos;s first end-to-end autonomous drone company.</p>
              <div className="op-meta">
                <div className="op-meta-item">
                  <span className="op-meta-k">Founded</span>
                  <span className="op-meta-v">2026</span>
                </div>
                <div className="op-meta-item">
                  <span className="op-meta-k">Team</span>
                  <span className="op-meta-v">5 Co-Founders</span>
                </div>
                <div className="op-meta-item">
                  <span className="op-meta-k">HQ</span>
                  <span className="op-meta-v">Ghaziabad, UP</span>
                </div>
                <div className="op-meta-item">
                  <span className="op-meta-k">Recognition</span>
                  <span className="op-meta-v">DPIIT Startup</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-n">3</div>
              <div className="stat-l">Platforms Proven</div>
            </div>
            <div className="stat">
              <div className="stat-n">3</div>
              <div className="stat-l">In Dev Pipeline</div>
            </div>
            <div className="stat">
              <div className="stat-n">3,500m+</div>
              <div className="stat-l">Altitude Proven</div>
            </div>
            <div className="stat">
              <div className="stat-n">2</div>
              <div className="stat-l">iDEX Apps Filed</div>
            </div>
          </div>

          <div className="body">
            <div className="col-l">
              <div className="sec">
                <div className="sec-tag">01 · Problem</div>
                <div className="sec-head">The Problem</div>
                <div className="sec-body">
                  Drones today follow GPS waypoints, depend on human operators, and collapse under operational
                  stress. No Indian company offers a vertically integrated autonomous system.
                </div>
                <ul className="pts">
                  <li>
                    <strong>46/46 indigenous drone makers</strong> failed Army EW trials in 2025
                  </li>
                  <li>India still lacks a flight-ready autonomous intelligence stack built as one system</li>
                </ul>
              </div>

              <div className="sec">
                <div className="sec-tag">02 · Solution</div>
                <div className="sec-head">The Solution</div>
                <div className="sec-body">
                  Complete autonomous intelligence platform - hardware, onboard AI, ML-driven navigation, and
                  mission C2 - delivered as one integrated system.
                </div>
                <div className="chips">
                  <div className="chip">Vortex Delta</div>
                  <div className="chip">Onboard AI</div>
                  <div className="chip">Mission C2</div>
                  <div className="chip b">3 Flight-Proven</div>
                  <div className="chip b">3 In Development</div>
                  <div className="chip">70% Indian Components</div>
                  <div className="chip">EW-Resilient Direction</div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-tag">03 · Market Opportunity</div>
                <div className="sec-head">Market Opportunity</div>
                <div className="sec-body">
                  India&apos;s drone market is entering a structural growth cycle, with defense procurement and enterprise
                  adoption both accelerating.
                </div>
                <div className="mkt">
                  <div className="mkt-box">
                    <div className="mkt-lbl">TAM</div>
                    <div className="mkt-val">$4.8B</div>
                    <div className="mkt-sub">India drone market by 2030</div>
                  </div>
                  <div className="mkt-box">
                    <div className="mkt-lbl">SAM</div>
                    <div className="mkt-val">Rs 4,300 Cr+</div>
                    <div className="mkt-sub">Defense + enterprise over 7 years</div>
                  </div>
                  <div className="mkt-box alt">
                    <div className="mkt-lbl">SOM</div>
                    <div className="mkt-val">Rs 30-50 Cr</div>
                    <div className="mkt-sub">3-year ARR target</div>
                  </div>
                  <div className="mkt-box alt">
                    <div className="mkt-lbl">Tailwind</div>
                    <div className="mkt-val">MoD FY27</div>
                    <div className="mkt-sub">Rs 7.85L Cr budget, 75% reserved for Indian companies</div>
                  </div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-tag">04 · Traction</div>
                <div className="sec-head">Traction</div>
                <ul className="pts">
                  <li>
                    <strong>3 platforms proven</strong> and 3 more in active development
                  </li>
                  <li>
                    <strong>3,500m+ altitude</strong> proven in operations
                  </li>
                  <li>
                    SIH Winner · DPIIT deep-tech · GeM registered
                  </li>
                  <li>Ladakh ops proven</li>
                  <li><strong>2 iDEX applications filed</strong></li>
                </ul>
              </div>
            </div>

            <div className="col-r">
              <div className="sec">
                <div className="sec-tag">05 · Business Model</div>
                <div className="sec-head">Business Model</div>
                <div className="kv">
                  <div className="kv-row">
                    <span className="kv-k">Platform Sales</span>
                    <span className="kv-v">Drone systems to Army, Navy, ITBP, BSF, and enterprises</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-k">Autonomy Licensing</span>
                    <span className="kv-v">Vortex Delta module licensed to OEMs for MoD qualification</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-k">Cloud SaaS</span>
                    <span className="kv-v">Fleet management and analytics priced per drone per month</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-k">DaaS</span>
                    <span className="kv-v">Drone-as-a-Service for agriculture and enterprise ISR</span>
                  </div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-tag">06 · Team</div>
                <div className="sec-head">Team</div>
                <div className="team">
                  <div className="tm">
                    <span className="tm-name">Avi Mittal</span>
                    <span className="tm-role">CEO</span>
                    <span className="tm-bio">AI/ML, certified drone pilot. Strategy and defense BD.</span>
                  </div>
                  <div className="tm">
                    <span className="tm-name">Ankur Debnath</span>
                    <span className="tm-role">CTO</span>
                    <span className="tm-bio">AI/ML, autonomy stack architect, VortexDelta firmware.</span>
                  </div>
                  <div className="tm">
                    <span className="tm-name">Amogh Varshney</span>
                    <span className="tm-role">CFO</span>
                    <span className="tm-bio">Mech eng, certified pilot. Airframe and financial strategy.</span>
                  </div>
                  <div className="tm">
                    <span className="tm-name">Ekansh Mitra</span>
                    <span className="tm-role">COO</span>
                    <span className="tm-bio">Supply chain and operations.</span>
                  </div>
                  <div className="tm">
                    <span className="tm-name">Arya Bhushan</span>
                    <span className="tm-role">CDO</span>
                    <span className="tm-bio">Product design and UX.</span>
                  </div>
                </div>
                <div className="origin">5 co-founders · operator-builder team</div>
              </div>

              <div className="sec">
                <div className="sec-tag">07 · The Ask</div>
                <div className="sec-head">The Ask</div>
                <div className="ask-box">
                  <div className="ask-grid">
                    <div className="ask-item">
                      <span className="ask-lbl">Raising</span>
                      <span className="ask-val">Rs 1 Crore</span>
                    </div>
                    <div className="ask-item">
                      <span className="ask-lbl">Equity</span>
                      <span className="ask-val">4%</span>
                    </div>
                    <div className="ask-item">
                      <span className="ask-lbl">Post-Money Val.</span>
                      <span className="ask-val">Rs 25 Cr</span>
                    </div>
                    <div className="ask-item">
                      <span className="ask-lbl">Stage</span>
                      <span className="ask-val">Pre-Seed</span>
                    </div>
                  </div>
                  <div className="ask-use">
                    <strong>Use of Funds:</strong> Vortex Delta prototype (35%) · AKASH SAYAKA (25%) · Team (20%) · IP filing + IDDM (12%) · Working capital (8%)
                  </div>
                  <div className="ask-use">
                    <strong>Unlocks:</strong> Rs 1.35 Cr iDEX SPARK · up to Rs 25 Cr ADITI 4.0 · Army EW trial qualification · Seed round at Rs 80-100 Cr valuation (4-5x return)
                  </div>
                  <div className="ask-use">
                    Beyond capital, we&apos;re seeking mentors who understand defense procurement, deep-tech scaling,
                    and can open doors that no cold email ever will.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="doc-footer">
            <div className="footer-l">
              Avi Mittal · <a href="mailto:info@vortexsystem.org">info@vortexsystem.org</a> · +91 9873717711
            </div>
            <div className="footer-r">www.vortexsystem.org</div>
          </div>
          <div className="disc">
            Confidential
          </div>
        </article>
      </main>

      <style>{`
        .onepager-page {
          --bg: #06080d;
          --surface: #0a0e16;
          --card: #0f1520;
          --line: rgba(255, 255, 255, 0.08);
          --green: #94d327;
          --blue: #38b6ff;
          --white: #e4eaf4;
          --muted: #52607a;
          --body: #9bb0c8;
          min-height: 100vh;
          background: radial-gradient(ellipse 70% 80% at 10% 5%, rgba(148, 211, 39, 0.08) 0%, transparent 50%),
            var(--bg);
          padding: 0 0 56px;
        }

        .sheet {
          background: var(--bg);
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 28px;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
        }

        .topbar-l {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .topbar-r {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: var(--green);
          text-transform: uppercase;
        }

        .op-hero {
          background: var(--surface);
          display: block;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--line);
        }

        .op-hero-left {
          max-width: 920px;
        }

        .op-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 8px;
        }

        .op-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: clamp(38px, 4.2vw, 60px);
          line-height: 0.94;
          text-transform: uppercase;
          color: var(--white);
          max-width: 840px;
        }

        .op-title em {
          color: var(--green);
          font-style: normal;
        }

        .op-sub {
          margin-top: 12px;
          font-size: 15px;
          color: var(--body);
          font-weight: 400;
          max-width: 780px;
          line-height: 1.6;
        }

        .op-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 24px;
          margin-top: 16px;
        }

        .op-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .op-meta-k {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .op-meta-v {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: var(--green);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          background: var(--green);
        }

        .stat {
          padding: 14px 10px;
          text-align: center;
          border-right: 1px solid rgba(0, 0, 0, 0.18);
        }

        .stat:last-child {
          border-right: 0;
        }

        .stat-n {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 26px;
          color: #000;
          line-height: 1;
          text-transform: uppercase;
        }

        .stat-l {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 3px;
        }

        .body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .col-l {
          border-right: 1px solid var(--line);
        }

        .sec {
          padding: 20px 22px;
          border-bottom: 1px solid var(--line);
        }

        .sec:last-child {
          border-bottom: 0;
        }

        .sec-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sec-tag::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .sec-head {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--green);
          margin-bottom: 10px;
          line-height: 1.1;
        }

        .sec-body {
          font-size: 14px;
          color: var(--body);
          line-height: 1.65;
          font-weight: 400;
        }

        .sec-body strong {
          color: var(--white);
          font-weight: 700;
        }

        .pts {
          list-style: none;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0;
        }

        .pts li {
          font-size: 14px;
          color: var(--body);
          padding-left: 16px;
          position: relative;
          line-height: 1.55;
        }

        .pts li::before {
          content: '›';
          position: absolute;
          left: 0;
          color: var(--green);
          font-size: 17px;
          line-height: 1.15;
          font-weight: 700;
        }

        .pts li strong {
          color: var(--white);
          font-weight: 700;
        }

        .chips,
        .moat {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .chip,
        .mpill {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 10px;
          border: 1px solid var(--green);
          color: var(--green);
          background: rgba(148, 211, 39, 0.08);
        }

        .chip.b {
          border-color: var(--blue);
          color: var(--blue);
          background: rgba(56, 182, 255, 0.08);
        }

        .mkt {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .mkt-box {
          background: #090d14;
          border: 1px solid var(--line);
          border-left: 2.5px solid var(--green);
          padding: 12px 14px;
        }

        .mkt-box.alt {
          border-left-color: var(--blue);
        }

        .mkt-lbl {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .mkt-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 22px;
          color: var(--green);
          line-height: 1.1;
          margin-top: 2px;
        }

        .mkt-box.alt .mkt-val {
          color: var(--blue);
        }

        .mkt-sub {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
          line-height: 1.45;
        }

        .kv {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .kv-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: baseline;
          padding: 10px 0;
          border-bottom: 1px solid var(--line);
        }

        .kv-row:last-child {
          border-bottom: 0;
        }

        .kv-k {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }

        .kv-v {
          font-size: 14px;
          color: var(--body);
          font-weight: 500;
          text-align: right;
          max-width: 240px;
          line-height: 1.45;
        }

        .mpill {
          border-color: var(--line);
          color: var(--body);
          background: var(--card);
          padding: 6px 10px;
        }

        .mpill.h {
          border-color: var(--green);
          color: var(--green);
          background: rgba(148, 211, 39, 0.08);
        }

        .team {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }

        .tm {
          display: grid;
          grid-template-columns: 140px 52px 1fr;
          align-items: baseline;
          gap: 8px;
        }

        .tm-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 16px;
          text-transform: uppercase;
          color: var(--white);
          letter-spacing: 0.03em;
        }

        .tm-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .tm-bio {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }

        .origin {
          margin-top: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .ask-box {
          margin-top: 12px;
          border: 1px solid var(--green);
          background: linear-gradient(135deg, #0a1118, #0c1a0c);
          padding: 16px 18px;
        }

        .ask-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
        }

        .ask-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ask-lbl {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .ask-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 28px;
          color: var(--green);
          line-height: 1;
        }

        .ask-use {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--line);
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }

        .ask-use strong {
          color: var(--white);
          font-weight: 600;
        }

        .doc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 14px 28px;
          background: var(--surface);
          border-top: 3px solid var(--green);
          flex-wrap: wrap;
        }

        .footer-l {
          font-size: 13px;
          color: var(--muted);
        }

        .footer-l a {
          color: var(--green);
          text-decoration: none;
          font-weight: 600;
        }

        .footer-r {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: var(--white);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .disc {
          text-align: center;
          font-size: 9px;
          color: #3e4b5f;
          padding: 8px 22px 12px;
          background: var(--bg);
          border-top: 1px solid var(--line);
        }

        @media (max-width: 1279px) {
          .body {
            grid-template-columns: 1fr;
          }

          .col-l {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
        }

        @media (max-width: 1023px) {
          .topbar,
          .op-hero,
          .doc-footer {
            padding-left: 18px;
            padding-right: 18px;
          }

          .sec {
            padding: 18px 18px;
          }
        }

        @media (max-width: 767px) {
          .onepager-page {
            padding: 0 0 40px;
          }

          .topbar {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .op-title {
            font-size: 36px;
          }

          .op-sub,
          .sec-body,
          .pts li,
          .kv-v,
          .tm-bio,
          .ask-use,
          .footer-l {
            font-size: 14px;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }

          .sec {
            padding: 18px 16px;
          }

          .sec-head {
            font-size: 24px;
          }

          .mkt,
          .ask-grid {
            grid-template-columns: 1fr;
          }

          .tm {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .kv-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .kv-v {
            text-align: left;
            max-width: none;
          }

          .doc-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-r {
            letter-spacing: 0.08em;
            font-size: 13px;
          }
        }

      `}</style>
    </>
  );
}
