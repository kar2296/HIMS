import React, { useState } from 'react';
import { colors, radii, spacing, typography, transitions, controlHeight } from './tokens';

export interface DatePickerProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value?: string; // ISO yyyy-mm-dd, exactly what a native date input already produces -- no new date format introduced
  onChange?: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  name?: string;
  id?: string;
  includeTime?: boolean;
}

/** Global date/datetime picker. Uses the native browser input[type=date|datetime-local]
 * rather than a heavy calendar library (keeps the app dependency-free and fast, per
 * the modernization spec's performance guidance) -- value/onChange stay ISO strings,
 * identical to what every existing date field in this codebase already expects. */
export const DatePicker: React.FC<DatePickerProps> = ({
  label, required, error, helperText, value, onChange, disabled, fullWidth = true, min, max, name, id, includeTime = false,
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || (label ? `date-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={inputId} style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
          {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={includeTime ? 'datetime-local' : 'date'}
        value={value || ''}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%', height: controlHeight, fontSize: '13px', padding: '0 12px',
          fontFamily: typography.fontFamily, color: disabled ? colors.textSubtle : colors.textMain,
          backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
          border: `1px solid ${error ? colors.danger : focused ? colors.primary : colors.border}`,
          borderRadius: radii.sm, outline: 'none',
          boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.12)' : '0 0 0 3px rgba(0,0,92,0.1)') : 'none',
          transition: transitions.fast, boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {error ? (
        <span style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</span>
      ) : helperText ? (
        <span style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.xs }}>{helperText}</span>
      ) : null}
    </div>
  );
};
