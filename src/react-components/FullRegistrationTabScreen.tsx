import React, { useState, useEffect } from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';

interface TabDef {
  title: string;
  state: string;
  canDisable: boolean;
}

interface ReactPropsShape {
  tabs?: TabDef[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

export const FullRegistrationTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isTabActive = (tabState: string) => {
    const hash = (currentHash || (typeof window !== 'undefined' ? window.location.hash : '')).toLowerCase();
    const tabKey = tabState.toLowerCase().split('.').pop() || '';
    if (tabKey === 'patientids') {
      return hash.includes('patientids') || hash.includes('patientidentities');
    }
    return hash.includes(tabKey);
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, marginBottom: spacing.sm }}>
      <div style={{ display: 'flex', gap: spacing.xs, borderBottom: `1px solid ${colors.border}` }}>
        {tabs.map((tab) => {
          const active = isTabActive(tab.state);
          return (
            <button
              key={tab.state}
              onClick={() => { if (!tab.canDisable) dispatch('switchTab', { state: tab.state }); }}
              disabled={tab.canDisable}
              style={{
                border: 'none',
                background: 'none',
                padding: `${spacing.sm} ${spacing.md}`,
                cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                opacity: tab.canDisable ? 0.5 : 1,
                color: active ? 'var(--hims-primary, #21008d)' : colors.textMuted,
                fontWeight: active ? 600 : 500,
                fontFamily: typography.fontFamily,
                borderBottom: active ? `2px solid var(--hims-primary, #21008d)` : `2px solid transparent`,
                marginBottom: -1,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};

