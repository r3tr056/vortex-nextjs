import Link from 'next/link';
import Image from 'next/image';

const platformLinks = [
  { href: '/systems', label: 'All Platforms' },
  { href: '/systems/vas01', label: 'Atlas · Logistics' },
  { href: '/systems/vas02', label: 'Atlas Ag' },
  { href: '/systems/vas03', label: 'Ranger · ISR' },
  { href: '/systems/vas04', label: 'Sentinel' },
];

const companyLinks = [
  { href: '/company', label: 'Company' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/partner', label: 'Partner' },
  { href: '/partner/one-pager', label: 'Investor One-Pager' },
];

export default function Footer() {
  return (
    <footer role="contentinfo">
      <div className="footer-brand">
        <Link href="/" className="footer-brand-mark" aria-label="Vortex Autonomous Systems — home">
          <Image
            src="/vortex_logo.png"
            alt="Vortex Autonomous Systems"
            width={300}
            height={300}
            style={{ width: 'auto', height: 'clamp(160px, 18vw, 200px)', display: 'block', opacity: 0.72 }}
          />
        </Link>
        <p className="footer-brand-sub">
          Autonomous air capability, built in India. Six platforms. One indigenous stack.
          Zero Chinese components.
        </p>
      </div>

      <nav className="footer-nav" aria-label="Footer">
        <div className="footer-nav-col">
          <h5>Platforms</h5>
          <ul>
            {platformLinks.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-nav-col">
          <h5>Company</h5>
          <ul>
            {companyLinks.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </nav>

      <address className="footer-contact" style={{ fontStyle: 'normal' }}>
        <div>Ghaziabad, Uttar Pradesh</div>
        <div>India</div>
        <div style={{ height: 4 }} />
        <a href="mailto:info@vortexsystem.org">info@vortexsystem.org</a>
      </address>

      <div className="footer-base">
        <span>© 2026 Vortex Autonomous Systems Pvt. Ltd.</span>
        <span>DPIIT Registered · GeM Vendor · iDEX 2026</span>
      </div>
    </footer>
  );
}
