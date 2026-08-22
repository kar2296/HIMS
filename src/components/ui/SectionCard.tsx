import React from 'react';
import { colors, radii, shadows, spacing, typography } from './tokens';

/**
 * SectionCard + DetailField -- the "titled info card with label/value pairs"
 * pattern used throughout read-only detail views (patient details, visit
 * summary, etc). Purely presentational: callers pass in whatever real field
 * values they already have, this only lays them out consistently. Distinct
 * from Card (which is a generic content container) in that it's specifically
 * for a grid of DetailFields -- use Card directly for anything else (a form
 * section, a filter area, a table wrapper).
 */
export interface SectionCardProps {
  title?: string;
  actions?: React.ReactNode;
  columns?: number; // number of DetailField columns on wide screens, default 2
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, actions, columns = 2, children, style }) => (
  <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, boxShadow: shadows.sm, padding: spacing.xl, ...style }}>
    {(title || actions) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        {title && (
          <h3 style={{ ...typography.labelSm, color: colors.textMuted, margin: 0, fontFamily: typography.fontFamily }}>
            {title}
          </h3>
        )}
        {actions && <div style={{ display: 'flex', gap: spacing.sm }}>{actions}</div>}
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: spacing.xl, rowGap: spacing.lg }}>
      {children}
    </div>
  </div>
);

export interface DetailFieldProps {
  label: string;
  value?: React.ReactNode;
  emphasize?: boolean; // renders value in the primary accent color (e.g. an ID)
  span?: number; // columns to span within the parent SectionCard's grid
}

/** One label/value pair -- e.g. "PATIENT ID" / "PT-001245". */
export const DetailField: React.FC<DetailFieldProps> = ({ label, value, emphasize, span }) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined, minWidth: 0 }}>
    <div style={{ ...typography.labelSm, color: colors.textSubtle, marginBottom: '4px', fontFamily: typography.fontFamily }}>
      {label}
    </div>
    <div style={{
      fontSize: '14px', fontWeight: 600, fontFamily: typography.fontFamily,
      color: emphasize ? colors.primary : colors.textMain,
      overflow: 'hidden', textOverflow: 'ellipsis',
    }}>
      {value === undefined || value === null || value === '' ? '—' : value}
    </div>
  </div>
);
