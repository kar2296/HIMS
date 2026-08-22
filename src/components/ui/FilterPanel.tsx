import React from 'react';
import { colors, radii, shadows, spacing } from './tokens';
import { Button } from '../../react-components/Button';

/**
 * FilterPanel -- the "complex module" filter area (search field(s) +
 * dropdown/date filters, laid out in a responsive grid, with a trailing
 * [Search] [Reset] action row). This is a layout shell only: callers pass
 * their own real filter controls (Input/Select/DatePicker bound to their
 * own state) as children, and their own real onSearch/onReset handlers --
 * no filter that doesn't already exist in a screen's original functionality
 * should be added just because this component has room for one.
 *
 * For the simpler one-line "search box + a couple of buttons" case (see
 * Card.tsx's FilterBar), prefer FilterBar instead -- this component is for
 * screens whose original filter area genuinely has multiple fields.
 */
export interface FilterPanelProps {
  children: React.ReactNode; // the actual filter field controls
  onSearch?: () => void;
  onReset?: () => void;
  searchLabel?: string;
  resetLabel?: string;
  loading?: boolean;
  columns?: number; // responsive grid column count, default auto-fit
  style?: React.CSSProperties;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  children, onSearch, onReset, searchLabel = 'Search', resetLabel = 'Reset', loading, columns, style,
}) => (
  <div style={{
    backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.lg,
    boxShadow: shadows.sm, padding: spacing.lg, marginBottom: spacing.lg, ...style,
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns ? `repeat(${columns}, minmax(0, 1fr))` : 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: spacing.md,
      alignItems: 'end',
    }}>
      {children}
    </div>
    {(onSearch || onReset) && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg }}>
        {onReset && (
          <Button variant="secondary" onClick={onReset} disabled={loading} type="button">
            {resetLabel}
          </Button>
        )}
        {onSearch && (
          <Button variant="primary" onClick={onSearch} disabled={loading} loading={loading} type="button">
            {searchLabel}
          </Button>
        )}
      </div>
    )}
  </div>
);
