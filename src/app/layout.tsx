import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vortex Autonomous Systems — Indigenous UAV Platforms for Defence & Industry',
  description: 'Six TRL-6 autonomous UAV platforms engineered in India. Zero Chinese components. Defence, precision agriculture, ISR, and swarm systems. DPIIT registered · iDEX applicant · GeM vendor.',
  keywords: 'UAV, drone, autonomous systems, defence drone India, agriculture drone, ISR UAV, swarm drone, DPIIT startup, iDEX, Make in India, zero Chinese components, Ghaziabad',
  openGraph: {
    title: 'Vortex Autonomous Systems — Autonomous Air Capability, Built in India',
    description: 'Six TRL-6 autonomous UAV platforms. Zero Chinese components. Defence, agriculture, ISR, and swarm — one indigenous stack.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
