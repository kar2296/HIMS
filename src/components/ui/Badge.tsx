import React from 'react';
import { colors, radii, typography } from './tokens';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneMap: Record<BadgeTone, { bg: string; border: string; fg: string }> = {
  success: { bg: colors.successBg, border: colors.successBorder, fg: '#047857' },
  warning: { bg: colors.warningBg, border: colors.warningBorder, fg: '#b45309' },
  danger: { bg: colors.dangerBg, border: colors.dangerBorder, fg: '#b91c1c' },
  info: { bg: colors.infoBg, border: colors.infoBorder, fg: '#0369a1' },
  neutral: { bg: colors.neutralBg, border: colors.neutralBorder, fg: colors.textMuted },
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children }) => {
  const t = toneMap[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: radii.full,
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.2px',
      backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      fontFamily: typography.fontFamily,
    }}>
      {children}
    </span>
  );
};

/**
 * Maps REAL status strings/labels already present in the app's data (never
 * invented) to a visual tone. Callers pass whatever ActiveStatus.Description /
 * Status label the backend already returns; this only picks a color family --
 * it never changes what status exists or what it means.
 */
const STATUS_TONE_KEYWORDS: Array<[BadgeTone, string[]]> = [
  ['success', ['active', 'approved', 'completed', 'paid', 'available', 'confirmed', 'success']],
  ['danger', ['inactive', 'rejected', 'cancelled', 'canceled', 'unpaid', 'occupied', 'failed', 'deceased']],
  ['warning', ['pending', 'partial', 'draft', 'hold', 'awaiting']],
  ['info', ['in progress', 'processing', 'scheduled', 'ongoing']],
];

export function toneForStatus(status?: string | null): BadgeTone {
  if (!status) return 'neutral';
  const s = status.toLowerCase();
  for (const [tone, keywords] of STATUS_TONE_KEYWORDS) {
    if (keywords.some((k) => s.includes(k))) return tone;
  }
  return 'neutral';
}

export interface StatusBadgeProps {
  status?: string | null;
  tone?: BadgeTone; // explicit override when the caller already knows the tone (e.g. from an ActiveStatusId check)
}

/** Convenience wrapper: <StatusBadge status={entity.ActiveStatus?.Description} /> */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, tone }) => (
  <Badge tone={tone || toneForStatus(status)}>{status || '—'}</Badge>
);
