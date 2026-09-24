'use client';

import dynamic from 'next/dynamic';
import type { DroneSlug } from '../config/drones';

// three.js + WebGL are browser-only; keep them out of the server render and the site bundle.
const ARExperience = dynamic(() => import('./ARExperience'), {
  ssr: false,
  loading: () => <div style={{ position: 'fixed', inset: 0, background: '#06080d' }} />,
});

export default function ARExperienceLoader({ slug }: { slug: DroneSlug }) {
  return <ARExperience slug={slug} />;
}
