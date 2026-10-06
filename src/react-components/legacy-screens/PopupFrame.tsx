/**
 * Layout for React screens that open inside the existing AngularJS popup ($uibModal):
 * title bar with a close button, scrollable body and an optional footer.
 */
import React from 'react';
import { Button } from '../Button';
import { colors, spacing, typography } from '../../components/ui/tokens';

interface PopupFrameProps {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  closeLabel?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const PopupFrame: React.FC<PopupFrameProps> = ({ title, subtitle, onClose, closeLabel = 'Close', footer, children }) => (
  <div style={{ fontFamily: typography.fontFamily, color: colors.textBody, background: colors.surface }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.md} ${spacing.lg}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ ...typography.h3, margin: 0 }}>{title}</h4>
        {subtitle && <div style={{ ...typography.body, color: colors.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <Button variant="icon" size="sm" icon="fa-solid fa-xmark" aria-label={closeLabel} title={closeLabel} onClick={onClose} />
    </div>
    <div style={{ padding: spacing.lg, maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>
    {footer && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: spacing.sm,
          padding: `${spacing.md} ${spacing.lg}`,
          borderTop: `1px solid ${colors.border}`,
          background: colors.surfaceMuted,
        }}
      >
        {footer}
      </div>
    )}
  </div>
);
