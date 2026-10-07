import React, { useState, useEffect } from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';

export interface TabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface IvfRegistrationTabScreenProps {
  reactProps?: {
    tabs?: TabDef[];
    patientId?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IvfRegistrationTabScreen: React.FC<IvfRegistrationTabScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [], patientId = 0 } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const defaultTabs: TabDef[] = [
    { title: 'Basic Details', state: 'app.ivfregistrationtab.basic', canDisable: false, icon: 'fa-user' },
    { title: 'Spouse Registration', state: 'app.ivfregistrationtab.spousereg', canDisable: !patientId, icon: 'fa-user-friends' },
  ];

  const effectiveTabs = tabs.length > 0 ? tabs : defaultTabs;

  const isTabActive = (tabState: string) => {
    const hash = (currentHash || (typeof window !== 'undefined' ? window.location.hash : '')).toLowerCase();
    const tabKey = tabState.toLowerCase().split('.').pop() || '';
    if (tabKey === 'basic') {
      return hash.includes('basic') || !hash.includes('spousereg');
    }
    return hash.includes(tabKey);
  };

  const getTabIcon = (tabState: string, defaultIcon?: string) => {
    if (defaultIcon) return defaultIcon;
    if (tabState.includes('spouse')) return 'fa-user-friends';
    return 'fa-user';
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, marginBottom: spacing.sm }}>
      <div
        style={{
          display: 'flex',
          gap: spacing.xs,
          borderBottom: `2px solid ${colors.border}`,
          paddingBottom: 0,
          alignItems: 'center',
        }}
      >
        {effectiveTabs.map((tab) => {
          const active = isTabActive(tab.state);
          const icon = getTabIcon(tab.state, tab.icon);
          return (
            <button
              key={tab.state}
              type="button"
              onClick={() => {
                if (!tab.canDisable) dispatch('switchTab', { state: tab.state });
              }}
              disabled={tab.canDisable}
              style={{
                border: 'none',
                background: 'none',
                padding: `${spacing.sm} ${spacing.lg}`,
                cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                opacity: tab.canDisable ? 0.45 : 1,
                color: active ? 'var(--hims-primary, #2563eb)' : colors.textMuted,
                fontWeight: active ? 700 : 500,
                fontSize: '13px',
                fontFamily: typography.fontFamily,
                borderBottom: active ? `3px solid var(--hims-primary, #2563eb)` : '3px solid transparent',
                marginBottom: -2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                transition: 'all 0.15s ease',
              }}
              title={tab.canDisable ? 'Save basic patient details first to unlock spouse registration' : tab.title}
            >
              <i className={`fa ${icon}`} style={{ fontSize: '13px' }} />
              <span>{tab.title}</span>
              {tab.canDisable && (
                <i className="fa fa-lock" style={{ fontSize: '10px', color: colors.textSubtle, marginLeft: '2px' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
