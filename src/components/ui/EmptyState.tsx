import React from 'react';
import { colors, spacing, typography } from './tokens';

export interface EmptyStateProps {
  text?: string;
  subtext?: string;
  icon?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ text = 'No records found', subtext, icon = 'fa-solid fa-inbox', action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xxl, color: colors.textSubtle, textAlign: 'center' }}>
    <i className={icon} style={{ fontSize: '28px', color: colors.border }} />
    <span style={{ ...typography.body, fontWeight: 600, color: colors.textMuted, fontFamily: typography.fontFamily }}>{text}</span>
    {subtext && <span style={{ ...typography.helper, color: colors.textSubtle }}>{subtext}</span>}
    {action && <div style={{ marginTop: spacing.sm }}>{action}</div>}
  </div>
);

export interface ErrorStateProps {
  text?: string;
  subtext?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ text = 'Something went wrong', subtext, onRetry, retryLabel = 'Retry' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xxl, color: colors.danger, textAlign: 'center' }}>
    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '28px' }} />
    <span style={{ ...typography.body, fontWeight: 600, fontFamily: typography.fontFamily }}>{text}</span>
    {subtext && <span style={{ ...typography.helper, color: colors.textMuted }}>{subtext}</span>}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: spacing.sm, height: 32, padding: '0 16px', borderRadius: 6, border: 'none',
          backgroundColor: colors.danger, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {retryLabel}
      </button>
    )}
  </div>
);
