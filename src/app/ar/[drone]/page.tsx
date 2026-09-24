import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { AR_DRONES, getArDrone } from '@/ar/config/drones';
import ARExperienceLoader from '@/ar/ui/ARExperienceLoader';

type Params = { drone: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return AR_DRONES.map((d) => ({ drone: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { drone: slug } = await params;
  const drone = getArDrone(slug);
  if (!drone) return {};
  return {
    title: `${drone.name} in AR`,
    description: `Fly the Vortex ${drone.name} (${drone.num}) in augmented reality — ${drone.role}.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `Fly the Vortex ${drone.name} in AR`,
      description: `${drone.role}. Scan, watch, then take the sticks.`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function DroneArPage({ params }: { params: Promise<Params> }) {
  const { drone: slug } = await params;
  const drone = getArDrone(slug);
  if (!drone) notFound();
  return (
    <main id="main">
      <ARExperienceLoader key={drone.slug} slug={drone.slug} />
    </main>
  );
}
