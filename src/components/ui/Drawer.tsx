import React from 'react';
import { colors, radii, shadows, spacing, typography, zIndex, transitions } from './tokens';

export interface DrawerProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  side?: 'right' | 'left';
}

/** Global slide-in side panel -- for screens that show a detail/edit panel
 * beside a list rather than a centered modal. Presentational only; the
 * caller keeps its own real open/close and save/submit logic. */
export const Drawer: React.FC<DrawerProps> = ({ isOpen, title, onClose, children, footer, width = '420px', side = 'right' }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: zIndex.modal }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, bottom: 0, [side]: 0, width, maxWidth: '92vw',
          backgroundColor: colors.surface, boxShadow: shadows.lg, display: 'flex', flexDirection: 'column',
          transition: transitions.base,
        } as React.CSSProperties}
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
        <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
