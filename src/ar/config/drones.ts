// Per-drone configuration for the booth AR experience.
//
// Everything physical is in metres, in "booth space": origin on the floor directly below the
// centre of the standee's printed face, +Y up, +Z out of the standee towards the visitor,
// +X to the visitor's right.
//
// Models:  npm run ar:model -- 3d_models/<Name>.glb public/ar-assets/models/<slug>.glb --diagonal <m> --nose=-x
// Targets: node scripts/build-image-targets.mjs  (prints the sizes/heights used below)

export type DroneSlug = 'sentinel' | 'ranger';
export type MissionType = 'lockon' | 'survey';

export interface ImageTargetDef {
  /** Name baked into the image-target JSON. */
  name: string;
  dataUrl: string;
  /** Printed width × height of the target region, metres. */
  sizeM: [number, number];
  /** Printed length of the target's longer side, metres (8th Wall reports scale on it). */
  longSideM: number;
  /** Centre of the target on the standee: [metres right of centre, metres above floor]. */
  centerM: [number, number];
}

/** The QR code printed on the standee, used as a metric anchor by the WebXR (ARCore) session. */
export interface StandeeQr {
  /** Side of the QR symbol (finder-pattern corners, excluding the white quiet zone), metres. */
  sizeM: number;
  centerM: [number, number];
  /**
   * Optional substring of the QR's encoded URL. If set, other QR codes in view (e.g. the other
   * standee's) are ignored. Leave empty to accept any QR.
   */
  match: string;
}

export interface Standee {
  /** Web-sized print artwork, used for the virtual standee in 3D preview mode. */
  previewImage: string;
  /** Print file size (width × height, metres); the bottom edge sits at the floor. */
  printSizeM: [number, number];
  targets: ImageTargetDef[];
  qr: StandeeQr;
}

export interface DroneModel {
  url: string;
  /** Motor-to-motor diagonal, metres (the processed GLB is already at this scale). */
  diagonalM: number;
  /** Fallback prop diameter for the procedural stand-in, metres. */
  propDiameterM: number;
  /** Extra rotation (radians about +Y) if the nose doesn't face +Z. */
  yawOffset: number;
  /** Gimbal camera position in model space (feet at y = 0, nose +Z), metres. */
  gimbal: [number, number, number];
  ready: boolean;
}

export interface Spec {
  k: string;
  v: string;
}

/** Live demo the drone performs when a hotspot is tapped in Explore mode. */
export type HotspotAction = 'track' | 'spool' | 'xray' | 'vio' | 'stealth' | 'map' | 'fleet' | 'tether';

export interface Hotspot {
  id: string;
  title: string;
  body: string;
  /** Short value shown on the card, mirroring the standee spec table. */
  stat: string;
  /** Position on the model (feet at y = 0, nose +Z), metres. */
  anchor: [number, number, number];
  action: HotspotAction;
}

export interface ArDrone {
  slug: DroneSlug;
  num: string;
  name: string;
  role: string;
  tagline: string;
  specs: Spec[];
  systemPath: string;
  mission: MissionType;
  missionTitle: string;
  missionBrief: string;
  model: DroneModel;
  standee: Standee;
  hotspots: Hotspot[];
}

export const CONTACT = {
  phone: '+919873717711',
  phoneDisplay: '+91 98737 17711',
  email: 'info@vortexsystem.org',
  site: 'vortexsystem.org',
} as const;

// Sizes and centres printed by scripts/build-image-targets.mjs.
const target = (slug: DroneSlug, part: 'upper' | 'lower' | 'close', sizeM: [number, number], centerM: [number, number]): ImageTargetDef => ({
  name: `${slug}-${part}`,
  dataUrl: `/ar-assets/targets/${slug}-${part}.json`,
  sizeM,
  longSideM: Math.max(...sizeM),
  centerM,
});

export const AR_DRONES: ArDrone[] = [
  {
    slug: 'sentinel',
    num: 'VAS-04',
    name: 'Sentinel',
    role: 'High-altitude ISR · Man-portable',
    tagline: 'Eyes above 5,000 m',
    specs: [
      { k: 'Altitude', v: '5,000 m+' },
      { k: 'Deployment', v: 'Man-portable' },
      { k: 'Onboard AI', v: 'Target tracking' },
      { k: 'Signature', v: 'Low-signature' },
      { k: 'EW resilience', v: 'GPS-denied nav' },
    ],
    systemPath: '/systems/vas04',
    mission: 'lockon',
    missionTitle: 'Lock-on',
    missionBrief: 'Three targets are hidden around the booth. Fly the camera over each one and hold it in view to lock on.',
    model: {
      url: '/ar-assets/models/sentinel.glb',
      diagonalM: 0.95,
      propDiameterM: 0.56,
      yawOffset: 0,
      gimbal: [0, 0.24, 0.17],
      ready: true,
    },
    standee: {
      previewImage: '/ar-assets/standees/sentinel.webp',
      printSizeM: [0.75, 1.891],
      targets: [
        target('sentinel', 'upper', [0.75, 1.0], [0, 1.391]),
        target('sentinel', 'lower', [0.75, 1.0], [0, 0.5]),
        target('sentinel', 'close', [0.378, 0.504], [0.186, 0.252]),
      ],
      qr: { sizeM: 0.1166, centerM: [0.2356, 0.1426], match: '' },
    },
    hotspots: [
      {
        id: 'sensor',
        title: 'Onboard AI tracking',
        body: 'The EO payload detects, classifies and tracks targets on the aircraft itself — no ground-station link needed.',
        stat: 'Target tracking',
        anchor: [0, 0.24, 0.17],
        action: 'track',
      },
      {
        id: 'propulsion',
        title: 'Built for thin air',
        body: 'Motors and props sized for operations above 5,000 m, where the air is roughly half as dense as at sea level.',
        stat: '5,000 m+',
        anchor: [0.351, 0.349, 0.327],
        action: 'spool',
      },
      {
        id: 'airframe',
        title: 'Man-portable airframe',
        body: 'A carbon-fibre frame carried, assembled and launched by a single operator. Airborne in minutes.',
        stat: 'Man-portable',
        anchor: [0, 0.4, -0.02],
        action: 'xray',
      },
      {
        id: 'navigation',
        title: 'GPS-denied navigation',
        body: 'Visual-inertial navigation holds course when GNSS is jammed or spoofed, so the mission continues under EW.',
        stat: 'GPS-denied nav',
        anchor: [-0.12, 0.38, -0.2],
        action: 'vio',
      },
      {
        id: 'signature',
        title: 'Low-signature',
        body: 'A quiet, low-visibility profile for ISR close to the line — hard to see, hard to hear.',
        stat: 'Low-signature',
        anchor: [0.21, 0.05, 0.12],
        action: 'stealth',
      },
    ],
  },
  {
    slug: 'ranger',
    num: 'VAS-03',
    name: 'Ranger',
    role: 'Enterprise intelligence · Mapping & surveillance',
    tagline: 'Map it. Twin it.',
    specs: [
      { k: 'Sensors', v: 'RGB / Multispectral / LiDAR' },
      { k: 'Autonomy stack', v: 'Vortex FlightControl' },
      { k: 'Fleet capability', v: 'Multi-fleet coord.' },
      { k: '2nd variant', v: 'Tethered option' },
    ],
    systemPath: '/systems/vas03',
    mission: 'survey',
    missionTitle: 'Survey the zone',
    missionBrief: 'Map the marked zone in front of the booth. Fly slow, steady passes — the sensor only captures when you’re under 1 m/s. Map 90% before the clock runs out.',
    model: {
      url: '/ar-assets/models/ranger.glb',
      diagonalM: 0.85,
      propDiameterM: 0.48,
      yawOffset: 0,
      gimbal: [0, 0.2, 0.19],
      ready: true,
    },
    standee: {
      previewImage: '/ar-assets/standees/ranger.webp',
      printSizeM: [0.75, 1.94],
      targets: [
        target('ranger', 'upper', [0.75, 1.0], [0, 1.44]),
        target('ranger', 'lower', [0.75, 1.0], [0, 0.5]),
        target('ranger', 'close', [0.379, 0.505], [0.186, 0.252]),
      ],
      qr: { sizeM: 0.1166, centerM: [0.2441, 0.1427], match: '' },
    },
    hotspots: [
      {
        id: 'sensor',
        title: 'RGB · Multispectral · LiDAR',
        body: 'One payload bay, three sensors: orthomosaics, crop and vegetation indices, and survey-grade point clouds.',
        stat: '3 sensors',
        anchor: [0, 0.2, 0.19],
        action: 'map',
      },
      {
        id: 'propulsion',
        title: 'High-endurance',
        body: 'Efficient large-diameter props for long survey sorties and persistent surveillance over a site.',
        stat: 'Long-endurance',
        anchor: [0.309, 0.403, 0.299],
        action: 'spool',
      },
      {
        id: 'autonomy',
        title: 'Vortex FlightControl',
        body: 'Our autonomy stack flies waypoint and area missions with terrain following and fail-safes built in.',
        stat: 'Autonomy stack',
        anchor: [0, 0.43, -0.04],
        action: 'xray',
      },
      {
        id: 'fleet',
        title: 'Multi-fleet coordination',
        body: 'One operator station runs several aircraft at once through Vortex Cloud GCS — Indian data residency, NPNT compliant.',
        stat: 'Multi-fleet',
        anchor: [-0.1, 0.44, 0.06],
        action: 'fleet',
      },
      {
        id: 'tether',
        title: 'Tethered option',
        body: 'A tethered variant draws power from the ground, staying up for persistent perimeter surveillance.',
        stat: '2nd variant',
        anchor: [0.2, 0.05, 0.1],
        action: 'tether',
      },
    ],
  },
];

export function getArDrone(slug: string): ArDrone | undefined {
  return AR_DRONES.find((d) => d.slug === slug);
}
