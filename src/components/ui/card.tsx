import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing } from './tokens';

// ══════════════════════════════════════════════════════════
// CARD COMPONENT
// ══════════════════════════════════════════════════════════

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: 'green' | 'red' | 'none';
  hoverBorder?: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      glow = 'none',
      hoverBorder = false,
      accentColor = colors.green,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: {
        background: colors.bg2,
      },
      elevated: {
        background: colors.bg3,
      },
      bordered: {
        background: colors.bg2,
        border: `1px solid ${colors.border}`,
      },
    };

    const glows = {
      green: `radial-gradient(ellipse 60% 80% at 10% 50%, ${colors.greenDim} 0%, transparent 65%)`,
      red: `radial-gradient(ellipse 60% 60% at 50% 40%, ${colors.redDim} 0%, transparent 70%)`,
      none: undefined,
    };

    return (
      <div
        ref={ref}
        className={cn('card', `card-${variant}`, className)}
        style={{
          padding: `${spacing.cardPadding} ${spacing.cardPaddingX}`,
          borderTop: hoverBorder ? `2px solid transparent` : undefined,
          transition: hoverBorder ? 'border-color 0.2s, background 0.2s' : undefined,
          position: 'relative',
          overflow: 'hidden',
          ...variants[variant],
          ...style,
        }}
        {...props}
      >
        {glow !== 'none' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: glows[glow],
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

// ══════════════════════════════════════════════════════════
// CARD HEADER
// ══════════════════════════════════════════════════════════

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-header', className)}
        style={{
          marginBottom: spacing[4],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ══════════════════════════════════════════════════════════
// CARD TITLE
// ══════════════════════════════════════════════════════════

export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-title', className)}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(20px, 2.5vw, 30px)',
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1,
          marginBottom: spacing[1],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// ══════════════════════════════════════════════════════════
// CARD DESCRIPTION
// ══════════════════════════════════════════════════════════

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('card-description', className)}
        style={{
          fontSize: 'clamp(11px, 1.8vw, 12px)',
          color: colors.muted,
          lineHeight: 1.7,
          ...style,
        }}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// ══════════════════════════════════════════════════════════
// CARD CONTENT
// ══════════════════════════════════════════════════════════

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('card-content', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ══════════════════════════════════════════════════════════
// CARD FOOTER
// ══════════════════════════════════════════════════════════

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-footer', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing[4],
          borderTop: `1px solid ${colors.line}`,
          flexWrap: 'wrap',
          gap: spacing[3],
          marginTop: spacing[5],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ══════════════════════════════════════════════════════════
// STAT CARD (2-column grid)
// ══════════════════════════════════════════════════════════

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: Array<{ key: string; value: string }>;
  accentColor?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, stats, accentColor = colors.green, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('stat-card', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          background: colors.line,
          marginBottom: spacing[5],
          ...style,
        }}
        {...props}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              background: colors.bg3,
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(13px, 2vw, 15px)',
                fontWeight: 600,
                color: accentColor,
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: colors.muted,
              }}
            >
              {stat.key}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
