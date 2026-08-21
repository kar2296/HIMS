import React, { useMemo, useRef, useState, useEffect } from 'react';
import { colors, radii, spacing, typography, transitions, controlHeight, shadows, zIndex } from './tokens';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string | number | null;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
}

/** Global native <select>, styled to match Input. Preserves whatever real
 * options/value/onChange the caller passes -- no data source changes. */
export const Select: React.FC<SelectProps> = ({
  label, required, error, helperText, options, value, onChange, placeholder,
  disabled, fullWidth = true, loading, name, id,
}) => {
  const [focused, setFocused] = useState(false);
  const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={selectId} style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
          {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          name={name}
          required={required}
          disabled={disabled || loading}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: controlHeight,
            fontSize: '13px',
            padding: '0 30px 0 12px',
            fontFamily: typography.fontFamily,
            color: disabled ? colors.textSubtle : colors.textMain,
            backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
            border: `1px solid ${error ? colors.danger : focused ? colors.primary : colors.border}`,
            borderRadius: radii.sm,
            outline: 'none',
            boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.12)' : '0 0 0 3px rgba(0,0,92,0.1)') : 'none',
            transition: transitions.fast,
            boxSizing: 'border-box',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <i
          className={loading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-chevron-down'}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: colors.textSubtle, pointerEvents: 'none' }}
        />
      </div>
      {error ? (
        <span style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</span>
      ) : helperText ? (
        <span style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.xs }}>{helperText}</span>
      ) : null}
    </div>
  );
};

export interface SearchSelectProps extends Omit<SelectProps, 'placeholder'> {
  placeholder?: string;
  emptyText?: string;
}

/** Searchable dropdown (client-side filter over the same `options` prop --
 * no new data source). For screens whose original used ui-select's typeahead
 * filtering purely for convenience, not a real server search. */
export const SearchSelect: React.FC<SearchSelectProps> = ({
  label, required, error, helperText, options, value, onChange, placeholder = 'Search...',
  disabled, fullWidth = true, loading, emptyText = 'No matches',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', width: fullWidth ? '100%' : undefined, position: 'relative' }}>
      {label && (
        <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
          {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: controlHeight, padding: '0 12px', fontSize: '13px', fontFamily: typography.fontFamily,
          color: selected ? colors.textMain : colors.textSubtle,
          backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
          border: `1px solid ${error ? colors.danger : open ? colors.primary : colors.border}`,
          borderRadius: radii.sm, cursor: disabled ? 'not-allowed' : 'pointer', boxSizing: 'border-box',
          transition: transitions.fast,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <i className={loading ? 'fa-solid fa-circle-notch fa-spin' : `fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '11px', color: colors.textSubtle }} />
      </div>
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: zIndex.dropdown,
          backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.sm, boxShadow: shadows.md, maxHeight: 260, overflow: 'hidden',
        }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to filter..."
            style={{
              width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: `1px solid ${colors.border}`,
              padding: '8px 12px', fontSize: '13px', fontFamily: typography.fontFamily, outline: 'none',
            }}
          />
          <div style={{ maxHeight: 210, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '12px', color: colors.textSubtle }}>{emptyText}</div>
            )}
            {filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => { onChange?.(o.value); setOpen(false); setQuery(''); }}
                style={{
                  padding: '8px 12px', fontSize: '13px', cursor: 'pointer',
                  backgroundColor: o.value === value ? colors.primaryLight : 'transparent',
                  color: colors.textMain,
                }}
                onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.backgroundColor = colors.surfaceMuted; }}
                onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
      {error ? (
        <span style={{ ...typography.helper, color: colors.danger, marginTop: spacing.xs }}>{error}</span>
      ) : helperText ? (
        <span style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.xs }}>{helperText}</span>
      ) : null}
    </div>
  );
};
