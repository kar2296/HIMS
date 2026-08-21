import React, { forwardRef, useState } from 'react';
import { colors, radii, spacing, typography, transitions, controlHeight } from './tokens';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  containerStyle?: React.CSSProperties;
}

const sizeMap = {
  sm: { height: '30px', fontSize: '12px', padding: '0 10px' },
  md: { height: controlHeight, fontSize: '13px', padding: '0 12px' },
  lg: { height: '44px', fontSize: '14px', padding: '0 14px' },
};

/** Global text/number/password input. Purely presentational -- value/onChange/name stay whatever the caller already wires to its real state/dispatch. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, required, error, helperText, fullWidth = true, size = 'md', leftIcon,
  disabled, readOnly, style, containerStyle, id, ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const dims = sizeMap[size];
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : undefined, ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
          {label}
          {required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {leftIcon && (
          <i className={leftIcon} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.textSubtle, fontSize: '13px' }} />
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            width: '100%',
            height: dims.height,
            fontSize: dims.fontSize,
            padding: leftIcon ? `0 12px 0 34px` : dims.padding,
            fontFamily: typography.fontFamily,
            color: disabled ? colors.textSubtle : colors.textMain,
            backgroundColor: disabled ? colors.surfaceMuted : readOnly ? colors.surfaceSunken : colors.surface,
            border: `1px solid ${error ? colors.danger : focused ? colors.primary : colors.border}`,
            borderRadius: radii.sm,
            outline: 'none',
            boxShadow: focused && !error ? '0 0 0 3px rgba(0,0,92,0.1)' : error && focused ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
            transition: transitions.fast,
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
            ...style,
          }}
          {...rest}
        />
      </div>
      {error ? (
        <span style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</span>
      ) : helperText ? (
        <span style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.xs }}>{helperText}</span>
      ) : null}
    </div>
  );
});
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, required, error, helperText, fullWidth = true, style, disabled, readOnly, id, rows = 3, ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={inputId} style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
          {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          width: '100%',
          fontSize: '13px',
          padding: '10px 12px',
          fontFamily: typography.fontFamily,
          color: disabled ? colors.textSubtle : colors.textMain,
          backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
          border: `1px solid ${error ? colors.danger : focused ? colors.primary : colors.border}`,
          borderRadius: radii.sm,
          outline: 'none',
          boxShadow: focused ? shadowFor(error) : 'none',
          transition: transitions.fast,
          boxSizing: 'border-box',
          resize: 'vertical',
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</span>
      ) : helperText ? (
        <span style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.xs }}>{helperText}</span>
      ) : null}
    </div>
  );
});
Textarea.displayName = 'Textarea';

function shadowFor(error?: string) {
  return error ? '0 0 0 3px rgba(239,68,68,0.12)' : '0 0 0 3px rgba(0,0,92,0.1)';
}
