import React from 'react';
import { colors, radii, shadows, spacing, typography, zIndex } from './tokens';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  loading?: boolean;
}

/**
 * Generic content modal shell (header + body + footer + close button) for
 * screens that render their own modal content directly in React -- distinct
 * from the app's real Angular modals (opened via `utl.Modal.open('app.some.state', ...)`),
 * which stay native per the established REUSABLE SUB-WIDGET / dispatch
 * pattern and are NOT rebuilt here. Use this only for genuinely new
 * React-only dialog content, or to standardize a screen's own inline modal
 * header (e.g. the "Manage Payer Type" pattern) rather than hand-rolling one.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, footer, width = '480px', loading }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: zIndex.modal, padding: spacing.lg,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, backgroundColor: colors.surface, borderRadius: radii.lg,
          boxShadow: shadows.lg, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>{title}</h3>
          <button
            type="button" onClick={onClose} title="Close"
            style={{ width: 30, height: 30, borderRadius: radii.sm, border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer', fontSize: '14px' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '22px', color: colors.primary }} />
            </div>
          )}
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
