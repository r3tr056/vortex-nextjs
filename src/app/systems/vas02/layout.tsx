import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VAS-02 · Atlas Ag — Vortex Autonomous Systems',
  description:
    '10–16 litre precision agriculture platform with interchangeable spray, seed, and hybrid payload bays. AI-mapped autonomous field missions, SMAM subsidy-eligible, and DaaS-ready for FPO and Custom Hiring Centre deployments.',
};

export default function AtlasAgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
