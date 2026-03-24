import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, fonts, fontSizes, letterSpacing, spacing } from './tokens';

// ══════════════════════════════════════════════════════════
// INPUT COMPONENT
// ══════════════════════════════════════════════════════════

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn('form-input', className)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: colors.bg3,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: '14px',
          fontFamily: fonts.barlow,
          outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
          ...style,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// ══════════════════════════════════════════════════════════
// TEXTAREA COMPONENT
// ══════════════════════════════════════════════════════════

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn('form-textarea', className)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: colors.bg3,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: '14px',
          fontFamily: fonts.barlow,
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.2s, background 0.2s',
          ...style,
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

// ══════════════════════════════════════════════════════════
// SELECT COMPONENT
// ══════════════════════════════════════════════════════════

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn('form-select', className)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: colors.bg3,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: '14px',
          fontFamily: fonts.barlow,
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

// ══════════════════════════════════════════════════════════
// LABEL COMPONENT
// ══════════════════════════════════════════════════════════

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('form-label', className)}
        style={{
          display: 'block',
          fontFamily: fonts.mono,
          fontSize: fontSizes.eyebrow,
          letterSpacing: letterSpacing.monoWider,
          textTransform: 'uppercase',
          color: colors.sub,
          marginBottom: spacing[2],
          ...style,
        }}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

// ══════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ══════════════════════════════════════════════════════════

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('form-field', className)}
        style={{
          marginBottom: spacing[6],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// ══════════════════════════════════════════════════════════
// FORM ROW (FOR 2-COLUMN LAYOUTS)
// ══════════════════════════════════════════════════════════

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('form-row', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormRow.displayName = 'FormRow';

// ══════════════════════════════════════════════════════════
// CHECKBOX COMPONENT
// ══════════════════════════════════════════════════════════

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, style, ...props }, ref) => {
    return (
      <div className={cn('form-check', className)} style={{ display: 'flex', gap: spacing[2], alignItems: 'flex-start' }}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          style={{
            width: '16px',
            height: '16px',
            marginTop: '2px',
            cursor: 'pointer',
            accentColor: colors.green,
            ...style,
          }}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            style={{
              fontSize: '12px',
              color: colors.sub,
              lineHeight: 1.6,
              cursor: 'pointer',
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
