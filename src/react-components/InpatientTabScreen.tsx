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
// inpatienttab (app.inpatienttab.*, tab shell) -- the real tab header for the
// IPManagement family (myinpatient/allinpatient/patientdischarge children).
// All API calls/permission checks (HasAccess('InPatients', ...)) stay in the
// untouched Angular controller; this only renders the header + tab strip.
// The child state's own screen renders through the native <div ui-view> left
// in the .html template below this mount -- NOT reproduced here.
//
// Real, disclosed specifics preserved exactly:
// - Tabs are permission-gated (only rendered if HasAccess(...) is true for
//   that tab), matching CanMyInPatients/CanAllInPatients/CanPreviousInPatients.
// - Each tab's own `canDisable` (already computed in the controller: always
//   false for "My InPatients", true for the other two only when the real
//   $stateParams.id is 0) is used directly, matching the original's
//   `disable="tab.canDisable"` -- clicking a disabled tab does nothing.
// ---------------------------------------------------------------------------
export const InpatientTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const isTabActive = (tabState: string) => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      const tabKey = tabState.toLowerCase().split('.').pop() || '';
      return hash.includes(tabKey) || (tabKey === 'myinpatient' && hash.includes('myinpatient'));
    }
    return false;
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, padding: '16px 20px 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>In-Patients</h3>
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
