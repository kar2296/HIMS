import React, { useState } from 'react';
import { colors, radii, typography, zIndex } from './tokens';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom';
}

/** Lightweight, dependency-free tooltip (CSS-only positioning). */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
            backgroundColor: colors.textMain, color: '#fff', padding: '4px 8px',
            borderRadius: radii.sm, fontSize: '11px', fontFamily: typography.fontFamily,
            whiteSpace: 'nowrap', zIndex: zIndex.tooltip, pointerEvents: 'none',
          } as React.CSSProperties}
        >
          {content}
        </span>
      )}
    </span>
  );
};
