/**
 * Wrapping tab bar for the EMR panels (a native <select> replaces it on phones).
 * Keyboard: Left/Right/Home/End move between tabs, per the WAI-ARIA tabs pattern.
 */
import React, { useRef } from 'react';
import type { WorkspaceTab } from './types';
import { Select } from '../../components/ui/Select';

interface EmrTabBarProps {
  tabs: WorkspaceTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const EmrTabBar: React.FC<EmrTabBarProps> = ({ tabs, activeKey, onChange }) => {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (index: number) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.key);
    refs.current[tab.key]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    else if (e.key === 'End') { e.preventDefault(); focusTab(tabs.length - 1); }
  };

  return (
    <>
      <div className="emrws-tabbar" role="tablist" aria-label="EMR panels">
        {tabs.map((tab, index) => {
          const selected = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              ref={(el) => { refs.current[tab.key] = el; }}
              id={`emrws-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="emrws-panel"
              tabIndex={selected ? 0 : -1}
              className="emrws-tab"
              title={tab.label}
              onClick={() => onChange(tab.key)}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {tab.label}
              {tab.mandatory && <span className="emrws-tab-star" aria-label="mandatory">★</span>}
            </button>
          );
        })}
      </div>
      <div className="emrws-tab-select">
        <Select
          label="EMR panel"
          value={activeKey}
          options={tabs.map((t) => ({ value: t.key, label: `${t.label}${t.mandatory ? ' ★' : ''}` }))}
          onChange={(v) => onChange(String(v))}
        />
      </div>
    </>
  );
};
