import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, fonts, letterSpacing } from './tokens';

// ══════════════════════════════════════════════════════════
// BUTTON VARIANTS
// ══════════════════════════════════════════════════════════

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'arrow' | 'nav';
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: fonts.barlowCondensed,
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: letterSpacing.monoWide,
      textTransform: 'uppercase' as const,
      textDecoration: 'none',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
    };

    const variants = {
      primary: {
        padding: '14px 32px',
        background: colors.green,
        color: '#000',
      },
      outline: {
        padding: '13px 32px',
        background: 'transparent',
        color: colors.text,
        border: `1px solid ${colors.border}`,
      },
      arrow: {
        padding: '0',
        background: 'none',
        color: colors.green,
        gap: '8px',
      },
      nav: {
        padding: '9px 24px',
        border: `1px solid ${colors.green}`,
        color: colors.green,
        background: 'transparent',
        position: 'relative' as const,
        overflow: 'hidden' as const,
      },
    };

    return (
      <button
        ref={ref}
        className={cn('btn', `btn-${variant}`, className)}
        style={{ ...baseStyles, ...variants[variant] }}
        {...props}
      >
        {variant === 'nav' ? <span style={{ position: 'relative', zIndex: 1 }}>{children}</span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ══════════════════════════════════════════════════════════
// BUTTON WITH ARROW
// ══════════════════════════════════════════════════════════

export interface ButtonArrowProps extends Omit<ButtonProps, 'variant'> {
  showArrow?: boolean;
}

const ButtonArrow = React.forwardRef<HTMLButtonElement, ButtonArrowProps>(
  ({ children, showArrow = true, ...props }, ref) => {
    return (
      <Button ref={ref} variant="arrow" {...props}>
        {children}
        {showArrow && <span className="arr">→</span>}
      </Button>
    );
  }
);

ButtonArrow.displayName = 'ButtonArrow';

// ══════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════

export { Button, ButtonArrow };
