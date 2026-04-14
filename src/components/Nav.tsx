'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/systems', label: 'Systems' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/company', label: 'Company' },
  { href: '/partner', label: 'Partner' },
  { href: '/partner/one-pager', label: 'One Pager' },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav id="nav">
        <Link href="/" className="nav-logo">
          <Image
            src="/vortex_logo.png"
            alt="Vortex Autonomous Systems"
            width={300}
            height={300}
            priority
            style={{ width: 'auto', height: 'clamp(120px, 15vw, 150px)', display: 'block' }}
          />
        </Link>

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <div className="nav-status">
            <span className="status-dot" />
            Systems Online
          </div>
          <Link href="/partner" className="btn-nav">
            <span>Request Briefing</span>
          </Link>
          <button
            className="mobile-nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={pathname === link.href ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/partner" className="btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
          Request Briefing
        </Link>
      </div>
    </>
  );
}
