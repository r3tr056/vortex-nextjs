/**
 * Vortex Design System Tokens
 * Military-industrial aesthetic with sharp edges and technical precision
 */

// ══════════════════════════════════════════════════════════
// COLOR PALETTE
// ══════════════════════════════════════════════════════════

// Canonical source of truth: mirrors globals.css :root (Design System v2).
// Keep these in sync with the CSS custom properties — one palette, site-wide.
export const colors = {
  // Backgrounds  (→ --bg / --surface / --surface-2)
  bg: '#06080D',
  bg2: '#0B0F17',
  bg3: '#10161F',

  // Borders  (→ --line / --line-2)
  border: 'rgba(255,255,255,0.11)',
  borderG: 'rgba(184,224,67,0.30)',
  borderB: 'rgba(94,184,240,0.30)',
  line: 'rgba(255,255,255,0.055)',

  // Brand — signature lime  (→ --accent / --accent-2)
  green: '#B8E043',
  greenHover: '#c9ed5a',
  greenDim: 'rgba(184,224,67,0.08)',
  greenGlow: 'rgba(184,224,67,0.14)',

  blue: '#5EB8F0',
  blueDim: 'rgba(94,184,240,0.08)',

  red: '#E85541',
  redDim: 'rgba(232,85,65,0.08)',
  redBorder: 'rgba(232,85,65,0.30)',

  // Agriculture/Civil  (→ --warn)
  agri: '#FFB830',
  agriDim: 'rgba(255,184,48,0.08)',
  agriBorder: 'rgba(255,184,48,0.30)',

  // Restricted
  restricted: '#FF5533',
  restrictedDim: 'rgba(255,85,51,0.08)',
  restrictedBorder: 'rgba(255,85,51,0.30)',

  // Text  (→ --text / --sub / --muted, AA-tuned)
  text: '#EEF2F8',
  textSecondary: '#C8D8E8',
  sub: '#A2B0C4',
  muted: '#6B7993',

  // Utility
  selection: 'rgba(184,224,67,1)',
  selectionText: '#0A0F0A',
} as const;

// ══════════════════════════════════════════════════════════
// TYPOGRAPHY
// ══════════════════════════════════════════════════════════

export const fonts = {
  barlow: "'Barlow', sans-serif",
  barlowCondensed: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const fontSizes = {
  // Headlines - using clamp for responsiveness
  hero: 'clamp(56px, 8vw, 108px)',
  h1: 'clamp(72px, 10vw, 128px)',
  h2: 'clamp(36px, 5vw, 68px)',
  h3: 'clamp(22px, 3vw, 32px)',
  h4: 'clamp(20px, 2.5vw, 30px)',
  h5: 'clamp(16px, 2.5vw, 18px)',

  // Body
  bodyLg: '17px',
  bodyMd: '15px',
  bodySm: '13px',
  bodyXs: '12px',

  // Specialized
  stat: 'clamp(32px, 4vw, 56px)',
  eyebrow: '10px',
  eyebrowSm: '9px',
  tag: '10px',
  tagSm: '8px',
  mono: '11px',
  monoSm: '9px',
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeights = {
  tight: 0.88,
  tighter: 0.92,
  compact: 1,
  snug: 1.1,
  normal: 1.5,
  relaxed: 1.65,
  loose: 1.7,
  looser: 1.75,
  spacious: 1.82,
  airy: 1.85,
} as const;

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.015em',
  normal: '0em',
  wide: '0.01em',
  wider: '0.04em',
  widest: '0.10em',
  mono: '0.12em',
  monoWide: '0.14em',
  monoWider: '0.15em',
  monoWidest: '0.20em',
  ultra: '0.22em',
  extreme: '0.25em',
} as const;

// ══════════════════════════════════════════════════════════
// SPACING
// ══════════════════════════════════════════════════════════

export const spacing = {
  // Static spacing
  px: '1px',
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  24: '96px',
  28: '112px',

  // Responsive spacing (clamp)
  sectionY: 'clamp(48px, 8vw, 72px)',
  sectionX: 'clamp(16px, 4vw, 56px)',
  sectionYLg: 'clamp(60px, 10vw, 100px)',
  sectionGap: 'clamp(32px, 5vw, 60px)',
  cardPadding: 'clamp(28px, 4vw, 36px)',
  cardPaddingX: 'clamp(24px, 3vw, 32px)',
  cardGap: 'clamp(40px, 6vw, 80px)',
} as const;

// ══════════════════════════════════════════════════════════
// BORDERS & RADIUS
// ══════════════════════════════════════════════════════════

export const borders = {
  none: '0',
  default: '1px',
  thick: '2px',
} as const;

export const radius = {
  none: '0px', // Sharp edges - military aesthetic
  sm: '2px',
  md: '4px',
  full: '50%', // For dots/badges only
} as const;

// ══════════════════════════════════════════════════════════
// SHADOWS & GLOWS
// ══════════════════════════════════════════════════════════

export const glows = {
  greenCenter: `radial-gradient(ellipse 55% 70% at 50% 50%, ${colors.greenDim} 0%, transparent 65%)`,
  greenLeft: `radial-gradient(ellipse 70% 80% at 20% 50%, ${colors.greenDim} 0%, transparent 65%)`,
  greenRight: `radial-gradient(ellipse 80% 60% at 80% 40%, ${colors.greenGlow} 0%, transparent 65%)`,
  greenBottom: `radial-gradient(ellipse 60% 80% at 10% 50%, ${colors.greenDim} 0%, transparent 65%)`,
  red: `radial-gradient(ellipse 60% 60% at 50% 40%, ${colors.redDim} 0%, transparent 70%)`,
} as const;

// ══════════════════════════════════════════════════════════
// BREAKPOINTS
// ══════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ══════════════════════════════════════════════════════════
// TRANSITIONS
// ══════════════════════════════════════════════════════════

export const transitions = {
  fast: '0.1s',
  normal: '0.2s',
  slow: '0.25s',
  slower: '0.4s',
  slowest: '0.6s',
} as const;

export const easings = {
  linear: 'linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
} as const;

// ══════════════════════════════════════════════════════════
// Z-INDEX SCALE
// ══════════════════════════════════════════════════════════

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  nav: 500,
  toast: 600,
  cursor: 9998,
  cursorDot: 9999,
} as const;

// ══════════════════════════════════════════════════════════
// ANIMATIONS
// ══════════════════════════════════════════════════════════

export const animations = {
  fadeIn: 'fadeIn 0.4s ease',
  scrollLeft: 'scroll-l 30s linear infinite',
  pulse: 'pulse 2s ease-in-out infinite',
  reveal: 'opacity 0.6s ease, transform 0.6s ease',
} as const;

// ══════════════════════════════════════════════════════════
// NOISE TEXTURE
// ══════════════════════════════════════════════════════════

export const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` as const;

// ══════════════════════════════════════════════════════════
// TYPE EXPORTS
// ══════════════════════════════════════════════════════════

export type Color = keyof typeof colors;
export type Font = keyof typeof fonts;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
export type Spacing = keyof typeof spacing;
export type Border = keyof typeof borders;
export type Radius = keyof typeof radius;
export type Glow = keyof typeof glows;
export type Breakpoint = keyof typeof breakpoints;
export type Transition = keyof typeof transitions;
export type Easing = keyof typeof easings;
export type ZIndex = keyof typeof zIndex;
export type Animation = keyof typeof animations;
