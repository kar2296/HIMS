import React from 'react';
import { colors, spacing, typography, transitions } from './tokens';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Global tab strip -- purely presentational. Callers keep their own real
 * "active tab" state and their own tab-shell nav (see the app's existing
 * SCOPE-INHERITANCE-ACROSS-TAB-SHELL pattern for the native ui-router tab
 * states this sits on top of, where applicable); onChange should call
 * whatever the screen already uses to switch tabs.
 */
export const Tabs: React.FC<TabsProps> = ({ items, activeKey, onChange }) => (
  <div style={{ display: 'flex', gap: spacing.lg, borderBottom: `1px solid ${colors.border}`, marginBottom: spacing.lg }}>
    {items.map((item) => {
      const active = item.key === activeKey;
      return (
        <button
          key={item.key}
          type="button"
          disabled={item.disabled}
          onClick={() => !item.disabled && onChange(item.key)}
          style={{
            appearance: 'none', background: 'none', border: 'none', cursor: item.disabled ? 'not-allowed' : 'pointer',
            padding: `${spacing.sm} 0`, marginBottom: '-1px',
            borderBottom: active ? `2px solid ${colors.primary}` : '2px solid transparent',
            color: item.disabled ? colors.textSubtle : active ? colors.primary : colors.textMuted,
            fontFamily: typography.fontFamily, fontSize: typography.body.fontSize, fontWeight: active ? 700 : 500,
            display: 'flex', alignItems: 'center', gap: spacing.xs, transition: transitions.fast,
          }}
        >
          {item.label}
          {typeof item.count === 'number' && (
            <span style={{
              backgroundColor: active ? colors.primary : colors.surfaceMuted, color: active ? '#fff' : colors.textMuted,
              borderRadius: '999px', fontSize: '11px', padding: '1px 7px', fontWeight: 700,
            }}>
              {item.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
