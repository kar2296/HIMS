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

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
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
        {tabs.map((tab) => (
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
              color: colors.textMain,
              fontFamily: typography.fontFamily,
              borderBottom: `2px solid transparent`,
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
};
