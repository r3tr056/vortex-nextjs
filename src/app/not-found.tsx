import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

export default function NotFound() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <main className="pt-nav" style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 56px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'var(--green)',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            404 · Page Not Found
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(72px, 10vw, 128px)',
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
            marginBottom: 32,
            WebkitTextStroke: '1px var(--green)',
            color: 'transparent',
          }}>
            Lost signal.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--sub)', marginBottom: 40 }}>
            That frequency doesn&apos;t exist in our stack.
          </p>
          <Link href="/" className="btn-primary">
            Return to base <span className="arr">→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
