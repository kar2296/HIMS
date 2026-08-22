import React from 'react';
import { colors, radii, shadows, spacing, typography } from './tokens';

/**
 * SummaryPanel -- the right-rail contextual info panel used in the
 * two-column form/summary layout (form ~65-70%, summary ~30-35%). Purely
 * presentational: callers pass whatever real fields/status they already
 * have for the current record; this only lays them out. Not tied to any
 * specific entity (patient/visit/bill) -- generic label/value + status.
 */
export interface SummaryField {
  label: string;
  value?: React.ReactNode;
}

export interface SummaryPanelProps {
  title: string;
  fields: SummaryField[];
  status?: React.ReactNode; // typically a <StatusBadge> or <Badge>
  footer?: React.ReactNode; // e.g. extra actions/links
  style?: React.CSSProperties;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, fields, status, footer, style }) => (
  <div style={{
    backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.lg,
    boxShadow: shadows.sm, padding: spacing.xl, position: 'sticky', top: spacing.xl, ...style,
  }}>
    <h3 style={{ ...typography.labelSm, color: colors.textMuted, margin: `0 0 ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
      {fields.map((f, i) => (
        <div key={i}>
          <div style={{ ...typography.labelSm, color: colors.textSubtle, marginBottom: '3px', fontFamily: typography.fontFamily }}>
            {f.label}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textMain, fontFamily: typography.fontFamily, wordBreak: 'break-word' }}>
            {f.value === undefined || f.value === null || f.value === '' ? '—' : f.value}
          </div>
        </div>
      ))}
      {status && (
        <div>
          <div style={{ ...typography.labelSm, color: colors.textSubtle, marginBottom: '5px', fontFamily: typography.fontFamily }}>
            STATUS
          </div>
          {status}
        </div>
      )}
    </div>
    {footer && (
      <div style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
        {footer}
      </div>
    )}
  </div>
);
