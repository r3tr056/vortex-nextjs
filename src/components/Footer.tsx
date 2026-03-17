import Link from 'next/link';
import Image from 'next/image';

const footerLinks = [
  { href: '/', label: 'Overview' },
  { href: '/systems', label: 'Systems' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/company', label: 'Company' },
  { href: '/partner', label: 'Partner' },
];

export default function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <Link href="/" style={{ display: 'inline-block', marginBottom: 12, textDecoration: 'none' }}>
          <Image
            src="/vortex_logo.png"
            alt="Vortex Autonomous Systems"
            width={300}
            height={300}
            style={{ width: 'auto', height: 'clamp(160px, 18vw, 200px)', display: 'block', opacity: 0.72 }}
          />
        </Link>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          © 2026 Vortex Autonomous Systems Pvt. Ltd.
        </div>
      </div>
      <ul className="footer-center">
        {footerLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <div className="footer-right">
        Ghaziabad, Uttar Pradesh · India<br />
        <a href="mailto:info@vortexsystem.org" style={{ color: 'var(--green)', textDecoration: 'none' }}>info@vortexsystem.org</a>
      </div>
    </footer>
  );
}

