import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, fonts, fontSizes, letterSpacing } from './tokens';

// ══════════════════════════════════════════════════════════
// TAG / BADGE COMPONENT
// ══════════════════════════════════════════════════════════

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'blue' | 'agri' | 'restricted' | 'classified';
  size?: 'default' | 'sm';
  children: React.ReactNode;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', size = 'default', children, style, ...props }, ref) => {
    const variants = {
      default: {
        borderColor: colors.border,
        color: colors.muted,
        background: 'transparent',
      },
      green: {
        borderColor: colors.borderG,
        color: colors.green,
        background: colors.greenDim,
      },
      blue: {
        borderColor: colors.borderB,
        color: colors.blue,
        background: colors.blueDim,
      },
      agri: {
        borderColor: colors.agriBorder,
        color: colors.agri,
        background: colors.agriDim,
      },
      restricted: {
        borderColor: colors.restrictedBorder,
        color: colors.restricted,
        background: colors.restrictedDim,
      },
      classified: {
        borderColor: colors.redBorder,
        color: colors.red,
        background: colors.redDim,
      },
    };

    const sizes = {
      default: {
        fontSize: fontSizes.tag,
        letterSpacing: letterSpacing.widest,
        padding: '5px 12px',
      },
      sm: {
        fontSize: fontSizes.tagSm,
        letterSpacing: letterSpacing.monoWidest,
        padding: '4px 8px',
      },
    };

    return (
      <span
        ref={ref}
        className={cn('tag', `tag-${variant}`, className)}
        style={{
          fontFamily: fonts.mono,
          textTransform: 'uppercase',
          border: '1px solid',
          display: 'inline-block',
          ...sizes[size],
          ...variants[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

// ══════════════════════════════════════════════════════════
// DIVIDER
// ══════════════════════════════════════════════════════════

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('divider', className)}
        style={{
          width: orientation === 'horizontal' ? '100%' : '1px',
          height: orientation === 'horizontal' ? '1px' : '100%',
          background: colors.line,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

// ══════════════════════════════════════════════════════════
// STATUS DOT
// ══════════════════════════════════════════════════════════

export interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'green' | 'blue' | 'red' | 'muted';
  pulse?: boolean;
}

export const StatusDot = React.forwardRef<HTMLDivElement, StatusDotProps>(
  ({ className, variant = 'green', pulse = false, style, ...props }, ref) => {
    const variants = {
      green: colors.green,
      blue: colors.blue,
      red: colors.red,
      muted: colors.muted,
    };

    return (
      <div
        ref={ref}
        className={cn('status-dot', pulse && 'pulse', className)}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: variants[variant],
          animation: pulse ? 'pulse 2s ease-in-out infinite' : undefined,
          ...style,
        }}
        {...props}
      />
    );
  }
);

StatusDot.displayName = 'StatusDot';

// ══════════════════════════════════════════════════════════
// STATUS INDICATOR
// ══════════════════════════════════════════════════════════

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'green' | 'blue' | 'red' | 'muted';
  pulse?: boolean;
  children: React.ReactNode;
}

export const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, variant = 'green', pulse = true, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('nav-status', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: fonts.mono,
          fontSize: fontSizes.eyebrow,
          letterSpacing: letterSpacing.widest,
          color: colors.muted,
          ...style,
        }}
        {...props}
      >
        <StatusDot variant={variant} pulse={pulse} />
        {children}
      </div>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';
