import React, { useEffect, useRef, useState } from 'react';
import { colors, radii, shadows, spacing, typography, zIndex } from './tokens';

export interface DropdownOption {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  align?: 'left' | 'right';
}

/**
 * Generic action/menu dropdown (e.g. a row's "..." actions menu, or a
 * page-level "More actions" button) -- distinct from `Select`/`SearchSelect`,
 * which are form value pickers. Each option's onClick should call the
 * screen's existing real action dispatcher; this component only renders
 * and positions the menu.
 */
export const Dropdown: React.FC<DropdownProps> = ({ trigger, options, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>{trigger}</div>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', [align]: 0, minWidth: '160px',
            backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.md,
            boxShadow: shadows.md, zIndex: zIndex.dropdown, overflow: 'hidden', padding: spacing.xs,
          } as React.CSSProperties}
        >
          {options.map((opt) => (
            <div
              key={opt.key}
              onClick={() => { if (!opt.disabled) { opt.onClick(); setOpen(false); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing.sm, padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: radii.sm, cursor: opt.disabled ? 'not-allowed' : 'pointer',
                color: opt.disabled ? colors.textSubtle : opt.danger ? colors.danger : colors.textMain,
                fontFamily: typography.fontFamily, fontSize: typography.body.fontSize,
              }}
              onMouseEnter={(e) => { if (!opt.disabled) e.currentTarget.style.backgroundColor = colors.surfaceMuted; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {opt.icon && <i className={opt.icon} style={{ fontSize: '12px', width: '14px' }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
