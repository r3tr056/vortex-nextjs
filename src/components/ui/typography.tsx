import * as React from 'react';
import { cn } from '@/lib/utils';
import { fonts, fontSizes, fontWeights, lineHeights, letterSpacing, colors } from './tokens';

// ══════════════════════════════════════════════════════════
// EYEBROW LABEL
// ══════════════════════════════════════════════════════════

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'green' | 'blue';
  children: React.ReactNode;
}

export const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(
  ({ className, variant = 'green', children, style, ...props }, ref) => {
    const color = variant === 'blue' ? colors.blue : colors.green;

    return (
      <div
        ref={ref}
        className={cn('eyebrow', variant === 'blue' && 'eyebrow-blue', className)}
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.eyebrow,
          letterSpacing: letterSpacing.extreme,
          textTransform: 'uppercase',
          color,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Eyebrow.displayName = 'Eyebrow';

// ══════════════════════════════════════════════════════════
// HEADINGS
// ══════════════════════════════════════════════════════════

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'hero';
  children: React.ReactNode;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: Component = 'h2', variant = 'h2', children, style, ...props }, ref) => {
    const variants = {
      hero: {
        fontSize: fontSizes.hero,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.tighter,
        letterSpacing: letterSpacing.tight,
      },
      h1: {
        fontSize: fontSizes.h1,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.tighter,
        letterSpacing: letterSpacing.tight,
      },
      h2: {
        fontSize: fontSizes.h2,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.tight,
        letterSpacing: letterSpacing.tight,
      },
      h3: {
        fontSize: fontSizes.h3,
        fontWeight: fontWeights.semibold,
        lineHeight: lineHeights.snug,
        letterSpacing: letterSpacing.wide,
      },
      h4: {
        fontSize: fontSizes.h4,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.compact,
        letterSpacing: letterSpacing.normal,
      },
      h5: {
        fontSize: fontSizes.h5,
        fontWeight: fontWeights.semibold,
        lineHeight: lineHeights.snug,
        letterSpacing: letterSpacing.wide,
      },
    };

    return (
      <Component
        ref={ref}
        className={cn(variant, className)}
        style={{
          fontFamily: fonts.barlowCondensed,
          color: colors.text,
          ...variants[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

// ══════════════════════════════════════════════════════════
// BODY TEXT
// ══════════════════════════════════════════════════════════

export interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'lg' | 'md' | 'sm' | 'xs';
  children: React.ReactNode;
}

export const BodyText = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ className, variant = 'md', children, style, ...props }, ref) => {
    const variants = {
      lg: {
        fontSize: fontSizes.bodyLg,
        lineHeight: lineHeights.looser,
        color: colors.sub,
      },
      md: {
        fontSize: fontSizes.bodyMd,
        lineHeight: lineHeights.loose,
        color: colors.sub,
      },
      sm: {
        fontSize: fontSizes.bodySm,
        lineHeight: lineHeights.relaxed,
        color: colors.muted,
      },
      xs: {
        fontSize: fontSizes.bodyXs,
        lineHeight: lineHeights.relaxed,
        color: colors.muted,
      },
    };

    return (
      <p
        ref={ref}
        className={cn(`body-${variant}`, className)}
        style={{
          fontFamily: fonts.barlow,
          ...variants[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </p>
    );
  }
);

BodyText.displayName = 'BodyText';

// ══════════════════════════════════════════════════════════
// MONO TEXT
// ══════════════════════════════════════════════════════════

export interface MonoTextProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'sm';
  children: React.ReactNode;
}

export const MonoText = React.forwardRef<HTMLDivElement, MonoTextProps>(
  ({ className, variant = 'default', children, style, ...props }, ref) => {
    const variants = {
      default: {
        fontSize: fontSizes.mono,
        letterSpacing: letterSpacing.monoWider,
      },
      sm: {
        fontSize: fontSizes.monoSm,
        letterSpacing: letterSpacing.ultra,
      },
    };

    return (
      <div
        ref={ref}
        className={cn('mono', className)}
        style={{
          fontFamily: fonts.mono,
          textTransform: 'uppercase',
          color: colors.muted,
          ...variants[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MonoText.displayName = 'MonoText';

// ══════════════════════════════════════════════════════════
// STAT NUMBER
// ══════════════════════════════════════════════════════════

export interface StatNumberProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  unit?: string;
  children?: React.ReactNode;
}

export const StatNumber = React.forwardRef<HTMLDivElement, StatNumberProps>(
  ({ className, value, unit, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('stat-number', className)}
        style={{
          fontFamily: fonts.barlowCondensed,
          fontSize: fontSizes.stat,
          fontWeight: fontWeights.bold,
          letterSpacing: letterSpacing.tighter,
          lineHeight: lineHeights.compact,
          color: colors.green,
          ...style,
        }}
        {...props}
      >
        {value}
        {unit && (
          <span style={{ fontSize: '0.55em', color: colors.muted }}>
            {unit}
          </span>
        )}
      </div>
    );
  }
);

StatNumber.displayName = 'StatNumber';
