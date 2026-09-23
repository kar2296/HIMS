/**
 * Small presentational building blocks used only inside the EMR Workspace.
 * They sit on top of the global design tokens so the workspace matches the rest of the app.
 */
import React from 'react';
import { colors, radii, spacing, typography, shadows } from '../../components/ui/tokens';

/* ─────────────────────────── Section ─────────────────────────── */

interface PanelSectionProps {
  title: string;
  icon?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Remove inner padding (for tables that should run edge to edge). */
  flush?: boolean;
  /** Let popovers (e.g. search suggestions) extend outside the card. */
  allowOverflow?: boolean;
}

export const PanelSection: React.FC<PanelSectionProps> = ({ title, icon, actions, children, flush, allowOverflow }) => (
  <section
    style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.lg,
      boxShadow: shadows.xs,
      overflow: allowOverflow ? 'visible' : 'hidden',
    }}
  >
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        flexWrap: 'wrap',
        padding: `${spacing.sm} ${spacing.lg}`,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.surfaceMuted,
        borderRadius: `${radii.lg} ${radii.lg} 0 0`,
      }}
    >
      <h3 style={{ ...typography.h4, margin: 0, color: colors.textMain, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        {icon && <i className={icon} style={{ color: colors.primary, fontSize: 13 }} aria-hidden="true" />}
        {title}
      </h3>
      {actions && <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</div>}
    </header>
    <div style={{ padding: flush ? 0 : spacing.lg }}>{children}</div>
  </section>
);

/* ─────────────────────────── Field row ─────────────────────────── */

interface FieldRowProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

/** Label on the left, control(s) on the right -- stacks on narrow screens (see .emrws-field-row CSS). */
export const FieldRow: React.FC<FieldRowProps> = ({ label, hint, children }) => (
  <div className="emrws-field-row">
    <div style={{ ...typography.label, color: colors.textMuted }}>
      {label}
      {hint && <div style={{ ...typography.caption, color: colors.textSubtle, fontWeight: 400, marginTop: 2 }}>{hint}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', minWidth: 0 }}>{children}</div>
  </div>
);

/* ─────────────────────────── States ─────────────────────────── */

export const InlineNotice: React.FC<{ tone?: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }> = ({ tone = 'info', children }) => {
  const map = {
    info: [colors.infoBg, colors.infoBorder, colors.infoText, 'fa-solid fa-circle-info'],
    warning: [colors.warningBg, colors.warningBorder, colors.warningText, 'fa-solid fa-triangle-exclamation'],
    danger: [colors.dangerBg, colors.dangerBorder, colors.dangerText, 'fa-solid fa-circle-exclamation'],
    success: [colors.successBg, colors.successBorder, colors.successText, 'fa-solid fa-circle-check'],
  } as const;
  const [bg, border, text, icon] = map[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-start', padding: `${spacing.sm} ${spacing.md}`, background: bg, border: `1px solid ${border}`, borderRadius: radii.md, color: text, ...typography.body }}
    >
      <i className={icon} style={{ marginTop: 3 }} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
};

export const RangeFlag: React.FC<{ status: 'normal' | 'low' | 'high' | 'none'; range?: string }> = ({ status, range }) => {
  if (status === 'none') {
    return range ? <span style={{ ...typography.caption, color: colors.textSubtle }}>{range}</span> : null;
  }
  const isNormal = status === 'normal';
  return (
    <span
      title={range ? `Reference range ${range}` : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: radii.full,
        ...typography.caption,
        background: isNormal ? colors.successBg : colors.dangerBg,
        color: isNormal ? colors.successText : colors.dangerText,
        border: `1px solid ${isNormal ? colors.successBorder : colors.dangerBorder}`,
        whiteSpace: 'nowrap',
      }}
    >
      <i className={isNormal ? 'fa-solid fa-check' : status === 'high' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'} aria-hidden="true" />
      {isNormal ? 'Normal' : status === 'high' ? 'High' : 'Low'}
    </span>
  );
};

/* ─────────────────────────── Pain scale ─────────────────────────── */

const PAIN_STEPS = [
  { value: 0, icon: 'fa-regular fa-face-smile', label: 'No pain', color: '#10b981' },
  { value: 2, icon: 'fa-regular fa-face-smile-beam', label: 'Mild', color: '#84cc16' },
  { value: 4, icon: 'fa-regular fa-face-meh', label: 'Moderate', color: '#eab308' },
  { value: 6, icon: 'fa-regular fa-face-frown', label: 'Severe', color: '#f59e0b' },
  { value: 8, icon: 'fa-regular fa-face-sad-tear', label: 'Very severe', color: '#f97316' },
  { value: 10, icon: 'fa-regular fa-face-dizzy', label: 'Worst possible', color: '#ef4444' },
];

interface PainScaleProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

/** Wong-Baker style 0–10 face scale, like the reference screen. Click the selected face again to clear. */
export const PainScale: React.FC<PainScaleProps> = ({ value, onChange, disabled }) => (
  <div role="radiogroup" aria-label="Pain score" style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
    {PAIN_STEPS.map((step) => {
      const selected = value === step.value;
      return (
        <button
          key={step.value}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={disabled}
          title={`${step.value} – ${step.label}`}
          onClick={() => onChange(selected ? null : step.value)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: 52,
            padding: '6px 0',
            borderRadius: radii.md,
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: `1.5px solid ${selected ? step.color : colors.border}`,
            background: selected ? `${step.color}1a` : colors.surface,
            color: selected ? step.color : colors.textSubtle,
          }}
        >
          <i className={step.icon} style={{ fontSize: 20 }} aria-hidden="true" />
          <span style={{ ...typography.caption, color: selected ? step.color : colors.textMuted }}>{step.value}</span>
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────── Segmented toggle ─────────────────────────── */

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function Segmented<T extends string | number>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{ display: 'inline-flex', padding: 2, background: colors.surfaceSunken, borderRadius: radii.md, gap: 2 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            style={{
              border: 'none',
              cursor: 'pointer',
              padding: '5px 12px',
              borderRadius: radii.sm,
              ...typography.label,
              background: active ? colors.surface : 'transparent',
              color: active ? colors.primary : colors.textMuted,
              boxShadow: active ? shadows.xs : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Simple table ─────────────────────────── */

interface SimpleTableProps {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
}

/** Lightweight table with horizontal scroll on small screens. */
export const SimpleTable: React.FC<SimpleTableProps> = ({ headers, children, empty, emptyText = 'No records found' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="emrws-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: 'center', color: colors.textSubtle, padding: spacing.xl }}>
              <i className="fa-solid fa-inbox" style={{ marginRight: 6 }} aria-hidden="true" />
              {emptyText}
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  </div>
);
