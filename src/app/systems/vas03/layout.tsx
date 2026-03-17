import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VAS-03 · Ranger — Vortex Autonomous Systems',
  description:
    'High-endurance mapping and persistent surveillance platform for enterprise and government operators. Paired with Vortex Cloud GCS for NPNT-compliant multi-fleet coordination.',
};

export default function RangerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
