import React from 'react';
import { colors, radii, spacing, typography, transitions } from './tokens';

export interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  error?: string;
}

/** Global checkbox. `checked`/`onChange` map straight onto whatever real
 * boolean/status field the caller already binds -- no new business meaning. */
export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled, id, name, error }) => {
  const boxId = id || (typeof label === 'string' ? `chk-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div>
      <label
        htmlFor={boxId}
        style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.sm, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      >
        <span
          onClick={() => !disabled && onChange(!checked)}
          style={{
            width: 18, height: 18, flexShrink: 0, borderRadius: radii.sm,
            border: `1.5px solid ${checked ? colors.primary : error ? colors.danger : colors.borderStrong}`,
            backgroundColor: checked ? colors.primary : colors.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: transitions.fast,
          }}
        >
          {checked && <i className="fa-solid fa-check" style={{ fontSize: '11px', color: '#fff' }} />}
        </span>
        <input
          id={boxId}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        {label && <span style={{ ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily }}>{label}</span>}
      </label>
      {error && <div style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</div>}
    </div>
  );
};

export interface RadioOption {
  value: string | number;
  label: string;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string | number | null;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  name: string;
  direction?: 'row' | 'column';
}

/** Global radio group. Preserves the same value set/API mapping the caller already had. */
export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, value, onChange, disabled, name, direction = 'row' }) => (
  <div>
    {label && <div style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs }}>{label}</div>}
    <div style={{ display: 'flex', flexDirection: direction, gap: direction === 'row' ? spacing.lg : spacing.sm, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label key={o.value} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.sm, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
            <span
              onClick={() => !disabled && onChange(o.value)}
              style={{
                width: 18, height: 18, borderRadius: radii.full, flexShrink: 0,
                border: `1.5px solid ${checked ? colors.primary : colors.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: transitions.fast,
              }}
            >
              {checked && <span style={{ width: 9, height: 9, borderRadius: radii.full, backgroundColor: colors.primary }} />}
            </span>
            <input type="radio" name={name} checked={checked} disabled={disabled} onChange={() => onChange(o.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
            <span style={{ ...typography.body, color: colors.textMain }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  </div>
);
