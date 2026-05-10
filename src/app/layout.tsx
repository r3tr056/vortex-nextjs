import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Barlow, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vortexsystem.org'),
  title: {
    default: 'Vortex Autonomous Systems — Indigenous UAV Platforms for Defence & Industry',
    template: '%s · Vortex Autonomous Systems',
  },
  description:
    'Six TRL-6 autonomous UAV platforms engineered in India. Zero Chinese components. Defence, precision agriculture, ISR, and swarm systems. DPIIT registered · iDEX applicant · GeM vendor.',
  keywords: [
    'UAV', 'drone', 'autonomous systems', 'defence drone India', 'agriculture drone',
    'ISR UAV', 'swarm drone', 'DPIIT startup', 'iDEX', 'Make in India',
    'indigenous UAV', 'Vortex Autonomous Systems',
  ],
  authors: [{ name: 'Vortex Autonomous Systems' }],
  openGraph: {
    title: 'Vortex Autonomous Systems — Autonomous Air Capability, Built in India',
    description:
      'Six TRL-6 autonomous UAV platforms. Zero Chinese components. Defence, agriculture, ISR, and swarm — one indigenous stack.',
    type: 'website',
    siteName: 'Vortex Autonomous Systems',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vortex Autonomous Systems',
    description: 'Six TRL-6 autonomous UAV platforms. Zero Chinese components. Built in India.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#06080D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
