'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/systems', label: 'Systems' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/company', label: 'Company' },
  { href: '/partner', label: 'Partner' },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav id="nav" aria-label="Primary">
        <Link href="/" className="nav-logo" aria-label="Vortex Autonomous Systems — home">
          <Image
            src="/vortex_logo.png"
            alt="Vortex Autonomous Systems"
            width={300}
            height={300}
            priority
            style={{ width: 'auto', height: 'clamp(120px, 15vw, 150px)', display: 'block' }}
          />
        </Link>

        <ul className="nav-links" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? 'active' : ''}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <div className="nav-status" aria-hidden="true">
            <span className="status-dot" />
            Systems Online
          </div>
          <Link href="/partner#contact-form" className="btn-nav">
            <span>Request Briefing</span>
          </Link>
          <button
            className="mobile-nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span
              style={{
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              }}
            />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              style={{
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal={menuOpen}
        aria-label="Menu"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={isActive(link.href) ? 'active' : ''}
            aria-current={isActive(link.href) ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/partner#contact-form"
          className="btn-primary"
          style={{ marginTop: 28, alignSelf: 'flex-start' }}
          onClick={() => setMenuOpen(false)}
        >
          Request Briefing <span className="arr">→</span>
        </Link>
      </div>
    </>
  );
}
