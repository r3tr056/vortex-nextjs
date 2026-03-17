import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VAS-04 · Sentinel — Vortex Autonomous Systems',
  description:
    'Lightweight military ISR platform engineered for high-altitude operation above 3,500m — Ladakh-rated, man-portable, rapid-deploy. Onboard AI provides real-time target tracking without ground-station dependency.',
};

export default function SentinelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
