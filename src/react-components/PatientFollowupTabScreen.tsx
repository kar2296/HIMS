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
// patientfollowup-tab (app.patientfollowuptab.*, tab shell) -- the real tab
// header for the Patient Followup family (pending/followup children). All
// logic (just building the two-entry $scope.tabs array and $state.go on
// switchTab) stays in the untouched Angular controller; this only renders
// the page title + tab strip. The child state's own screen renders through
// the native <div ui-view> left in the .html template below this mount --
// NOT reproduced here.
//
// Real, disclosed specifics preserved exactly:
// - Unlike the sibling inpatienttab/oppatienttab shells (which build
//   $scope.tabs conditionally from HasAccess(...) permission checks), this
//   controller has NO permission gating at all -- both tabs are pushed
//   unconditionally. A commented-out `var canDisableTab = parseInt(
//   $stateParams.id) === 0 ...` line is dead source (never assigned to a
//   live variable, never read) -- both tab entries hardcode
//   `canDisable: false` directly, so no tab is ever disabled and the
//   disabled-tab styling path below is never exercised in production
//   (kept only for visual parity with the shared tab-shell pattern, same as
//   the oppatienttab sibling).
// - No extra header controls (no doctor-dashboard icon button, unlike
//   inpatienttab/oppatienttab) -- the real patientfollowup-tab.html has only
//   the page title and the tab strip.
// ---------------------------------------------------------------------------
export const PatientFollowupTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ marginBottom: spacing.md }}>
        <h4 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>Patient Followup</h4>
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
