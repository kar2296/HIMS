import React from 'react';
import { colors, radii, shadows, spacing, typography } from './tokens';

export interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padding?: string;
  style?: React.CSSProperties;
}

/** Global content card -- the standard section container every screen's
 * filter area / form section / grid wrapper should use, replacing ad-hoc
 * bordered divs. */
export const Card: React.FC<CardProps> = ({ title, actions, children, padding = spacing.lg, style }) => (
  <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, boxShadow: shadows.sm, overflow: 'hidden', ...style }}>
    {(title || actions) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing.md} ${padding}`, borderBottom: `1px solid ${colors.border}` }}>
        {title && <h2 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>{title}</h2>}
        {actions && <div style={{ display: 'flex', gap: spacing.sm }}>{actions}</div>}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);

export interface FilterBarProps {
  children: React.ReactNode;
}

/** Global filter/search row container -- consistent spacing for search boxes, dropdown filters, date ranges. */
export const FilterBar: React.FC<FilterBarProps> = ({ children }) => (
  <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: spacing.lg }}>
    {children}
  </div>
);
