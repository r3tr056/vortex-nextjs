import type { Metadata } from 'next';
import Link from 'next/link';
import { AR_DRONES } from '@/ar/config/drones';

export const metadata: Metadata = {
  title: 'Booth AR',
  description: 'Fly Vortex drones in augmented reality.',
  robots: { index: false, follow: true },
};

export default function ArIndexPage() {
  return (
    <main
      id="main"
      style={{
        minHeight: '100svh',
        padding: 'max(28px, env(safe-area-inset-top)) var(--gutter) 40px',
        display: 'grid',
        alignContent: 'center',
        gap: 28,
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <div>
        <p className="mono" style={{ color: 'var(--accent)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Vortex · Booth AR
        </p>
        <h1 className="display-1" style={{ fontSize: 'clamp(44px, 12vw, 72px)', margin: '8px 0 0' }}>
          Pick a drone to fly
        </h1>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {AR_DRONES.map((d) => (
          <Link
            key={d.slug}
            href={`/ar/${d.slug}`}
            style={{
              display: 'grid',
              gap: 4,
              padding: '18px 20px',
              borderRadius: 14,
              background: 'var(--surface)',
              boxShadow: 'inset 0 0 0 1px var(--line-2)',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            <span style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {d.num}
            </span>
            <strong style={{ fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{d.name}</strong>
            <span style={{ color: 'var(--sub)', fontSize: 14 }}>{d.role}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
