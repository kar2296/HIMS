import React from 'react';
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

// ---------------------------------------------------------------------------
// oppatienttab (app.oppatienttab.*, tab shell) -- the real tab header for the
// checked-in-OP-patient family (mycheckin/allcheckin/previousoppatient
// children). All API calls/permission checks (HasAccess('OutPatients', ...))
// and the controller's own initial auto-navigation to tabs[0] stay in the
// untouched Angular controller; this only renders the header + tab strip.
// The child state's own screen renders through the native <div ui-view> left
// in the .html template below this mount -- NOT reproduced here.
//
// Real, disclosed specifics preserved exactly:
// - Tabs are permission-gated (HasAccess-driven), matching CanMyOutPatients/
//   CanAllOutPatients/CanPreviousOutPatients; "My OutPatients" is additionally
//   hidden entirely when $stateParams.context === 'nursing'.
// - Unlike the sibling inpatienttab shell, switchTab() here has no extra
//   gating condition -- every visible tab always navigates on click. No
//   tab.canDisable is ever true in this controller (all three push with
//   canDisable: false), so no disabled-tab styling path is exercised today,
//   but the visual affordance is kept for parity with the shared pattern.
// ---------------------------------------------------------------------------
export const OppatientTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const isTabActive = (tabState: string) => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      const tabKey = tabState.toLowerCase().split('.').pop() || '';
      return hash.includes(tabKey) || (tabKey === 'mycheckin' && (hash.includes('myoplist') || hash.includes('mycheckin')));
    }
    return false;
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, padding: '16px 20px 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>OP Patient List</h3>
        <button
          onClick={() => dispatch('doctorDashboard')}
          title="Doctor Dashboard"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontSize: 20 }}
        >
          <i className="fas fa-th-large" aria-hidden="true" />
        </button>
      </div>

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
                color: active ? colors.primary : colors.textMuted,
                fontWeight: active ? 600 : 500,
                fontFamily: typography.fontFamily,
                borderBottom: active ? `2px solid ${colors.primary}` : `2px solid transparent`,
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
