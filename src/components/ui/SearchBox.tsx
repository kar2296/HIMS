import React from 'react';
import { colors, controlHeight, radii, spacing, typography } from './tokens';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

/**
 * Global page-level search input (the box at the top of a list/grid screen
 * that drives the existing search API call) -- distinct from `SearchSelect`,
 * which is a searchable dropdown for picking one option from a fixed list.
 * Purely presentational: the caller keeps its own debounce/submit/API call.
 */
export const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onSubmit, placeholder = 'Search...', onClear, autoFocus }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '220px' }}>
    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: spacing.sm, fontSize: '13px', color: colors.textSubtle }} />
    <input
      type="text"
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && onSubmit) onSubmit(); }}
      style={{
        width: '100%', height: controlHeight, padding: `0 ${spacing.xl} 0 30px`, borderRadius: radii.md,
        border: `1px solid ${colors.border}`, backgroundColor: colors.surface, color: colors.textMain,
        fontFamily: typography.fontFamily, fontSize: typography.body.fontSize,
      }}
    />
    {value && onClear && (
      <button
        type="button" onClick={onClear} title="Clear"
        style={{ position: 'absolute', right: spacing.sm, background: 'none', border: 'none', cursor: 'pointer', color: colors.textSubtle, fontSize: '12px' }}
      >
        <i className="fa-solid fa-xmark" />
      </button>
    )}
  </div>
);
