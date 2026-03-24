import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing } from './tokens';

// ══════════════════════════════════════════════════════════
// CONTAINER COMPONENT
// ══════════════════════════════════════════════════════════

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, variant = 'default', children, style, ...props }, ref) => {
    const variants = {
      default: { maxWidth: '1280px' },
      narrow: { maxWidth: '860px' },
      wide: { maxWidth: '1536px' },
      full: { maxWidth: '100%' },
    };

    return (
      <div
        ref={ref}
        className={cn('container', `container-${variant}`, className)}
        style={{
          margin: '0 auto',
          padding: `0 ${spacing.sectionX}`,
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

Container.displayName = 'Container';

// ══════════════════════════════════════════════════════════
// SECTION COMPONENT
// ══════════════════════════════════════════════════════════

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'compact' | 'spacious';
  background?: 'bg' | 'bg2' | 'bg3';
  bordered?: boolean;
  glow?: 'green-left' | 'green-center' | 'green-right' | 'green-bottom' | 'none';
  children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      variant = 'default',
      background = 'bg',
      bordered = false,
      glow = 'none',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const backgrounds = {
      bg: colors.bg,
      bg2: colors.bg2,
      bg3: colors.bg3,
    };

    const variants = {
      default: {
        padding: `${spacing.sectionY} ${spacing.sectionX}`,
      },
      compact: {
        padding: `${spacing[12]} ${spacing.sectionX}`,
      },
      spacious: {
        padding: `${spacing.sectionYLg} ${spacing.sectionX}`,
      },
    };

    const glows = {
      'green-left': `radial-gradient(ellipse 70% 80% at 20% 50%, ${colors.greenDim} 0%, transparent 65%)`,
      'green-center': `radial-gradient(ellipse 55% 70% at 50% 50%, ${colors.greenDim} 0%, transparent 65%)`,
      'green-right': `radial-gradient(ellipse 80% 60% at 80% 40%, ${colors.greenGlow} 0%, transparent 65%)`,
      'green-bottom': `radial-gradient(ellipse 60% 80% at 10% 50%, ${colors.greenDim} 0%, transparent 65%)`,
      none: undefined,
    };

    return (
      <section
        ref={ref}
        className={cn('section', `section-${variant}`, className)}
        style={{
          background: backgrounds[background],
          borderBottom: bordered ? `1px solid ${colors.line}` : undefined,
          position: 'relative',
          overflow: glow !== 'none' ? 'hidden' : undefined,
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
      </section>
    );
  }
);

Section.displayName = 'Section';

// ══════════════════════════════════════════════════════════
// GRID COMPONENT
// ══════════════════════════════════════════════════════════

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl' | '1px';
  responsive?: boolean;
  children: React.ReactNode;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = 'md', responsive = true, children, style, ...props }, ref) => {
    const gaps = {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
      xl: spacing.sectionGap,
      '1px': '1px',
    };

    const gridCols = responsive
      ? `repeat(auto-fit, minmax(min(100%, 320px), 1fr))`
      : `repeat(${cols}, 1fr)`;

    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          gap: gaps[gap],
          background: gap === '1px' ? colors.line : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// ══════════════════════════════════════════════════════════
// FLEX COMPONENT
// ══════════════════════════════════════════════════════════

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  children: React.ReactNode;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      gap = 'md',
      wrap = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const gaps = {
      sm: spacing[2],
      md: spacing[3],
      lg: spacing[4],
      xl: spacing[6],
    };

    const alignments = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
    };

    const justifications = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
    };

    return (
      <div
        ref={ref}
        className={cn('flex', className)}
        style={{
          display: 'flex',
          flexDirection: direction,
          alignItems: alignments[align],
          justifyContent: justifications[justify],
          gap: gaps[gap],
          flexWrap: wrap ? 'wrap' : 'nowrap',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// ══════════════════════════════════════════════════════════
// STACK COMPONENT (Vertical Flex)
// ══════════════════════════════════════════════════════════

export interface StackProps extends Omit<FlexProps, 'direction'> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  return <Flex ref={ref} direction="column" {...props} />;
});

Stack.displayName = 'Stack';
