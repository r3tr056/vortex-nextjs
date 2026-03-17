import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VAS-01 · Atlas — Vortex Autonomous Systems',
  description:
    'Heavy-lift hexacopter engineered for 25 kg+ payload delivery in contested and austere environments. Purpose-built for forward resupply, humanitarian logistics, and dual-use cargo missions.',
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
