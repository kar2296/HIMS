import React from 'react';
import { colors, radii, spacing, typography } from './tokens';

export type AlertTone = 'success' | 'warning' | 'danger' | 'info';

const toneMap: Record<AlertTone, { bg: string; border: string; fg: string; icon: string }> = {
  success: { bg: colors.successBg, border: colors.successBorder, fg: '#047857', icon: 'fa-solid fa-circle-check' },
  warning: { bg: colors.warningBg, border: colors.warningBorder, fg: '#b45309', icon: 'fa-solid fa-triangle-exclamation' },
  danger: { bg: colors.dangerBg, border: colors.dangerBorder, fg: '#b91c1c', icon: 'fa-solid fa-circle-exclamation' },
  info: { bg: colors.infoBg, border: colors.infoBorder, fg: '#0369a1', icon: 'fa-solid fa-circle-info' },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

/**
 * Global INLINE banner for in-page/in-form messages (validation summaries,
 * "session about to expire," empty-lookup warnings, etc). This is distinct
 * from the app's existing toast mechanism (utl.Alert.showSuccessMsg /
 * showErrorMsg, backed by toastr, used app-wide for save/delete
 * confirmations and errors) -- that real, working mechanism is left
 * completely untouched. Use Alert only where the original screen actually
 * rendered an inline message block, not for transient toasts.
 */
export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, onDismiss }) => {
  const t = toneMap[tone];
  return (
    <div style={{
      display: 'flex', gap: spacing.sm, alignItems: 'flex-start',
      padding: spacing.md, borderRadius: radii.md,
      backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.fg,
    }}>
      <i className={t.icon} style={{ fontSize: '15px', marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ ...typography.label, color: t.fg, marginBottom: 2, fontFamily: typography.fontFamily }}>{title}</div>}
        <div style={{ ...typography.body, color: t.fg, fontFamily: typography.fontFamily }}>{children}</div>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} style={{ background: 'none', border: 'none', color: t.fg, cursor: 'pointer', fontSize: '13px', opacity: 0.7 }}>
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  );
};
