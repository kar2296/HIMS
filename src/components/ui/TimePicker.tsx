import React from 'react';
import { colors, controlHeight, radii, spacing, typography } from './tokens';

export interface TimePickerProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  name?: string;
}

/** Global time input -- wraps the native `<input type="time">` (same
 * "no heavy calendar/time library" rationale as DatePicker). The caller's
 * existing value format (usually "HH:mm") and onChange wiring are
 * preserved verbatim; this only restyles the control. */
export const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, required, error, disabled, name }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
    {label && (
      <label style={{ ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily }}>
        {label}{required && <span style={{ color: colors.danger }}> *</span>}
      </label>
    )}
    <input
      type="time"
      name={name}
      value={value ?? ''}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: controlHeight, padding: `0 ${spacing.sm}`, borderRadius: radii.md,
        border: `1px solid ${error ? colors.danger : colors.border}`,
        backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
        color: colors.textMain, fontFamily: typography.fontFamily, fontSize: typography.body.fontSize,
      }}
    />
    {error && <span style={{ ...typography.helper, color: colors.danger }}>{error}</span>}
  </div>
);
