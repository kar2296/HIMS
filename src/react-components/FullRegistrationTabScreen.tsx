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
// fullregistrationtab (`app.fullregistrationtab` / `app.fullregistrationtab.*`,
// the top-level tab shell for the entire Full Registration flow -- Basic /
// Patient IDs / Patient Kins / Family Link). Extremely high-traffic real
// entry point (reached from newregistration/quickregistration/patient search
// flows app-wide), yet was not itself converted in prior batches even though
// every one of its child tab screens (fullregistration.html "Basic",
// patientidentity-list, patientkin-list, familylinking) already has been --
// this fills that gap. Same shape as the already-migrated sibling shells
// (InpatientTabScreen, OppatientTabScreen, PatientFollowupTabScreen): renders
// the header + tab strip only; each child tab's own screen renders through
// the native `<div ui-view>` left in the .html template below this mount, NOT
// reproduced here. All API calls/permission checks stay in the untouched
// Angular controller.
//
// Real, disclosed specifics preserved exactly, NOT changed:
// - The commented-out "Guarantor" and "Audit Log" tabs in the real
//   controller's $scope.tabs array (dead per the reachability sweep --
//   `app.fullregistrationtab.patientguarantor` and `.auditlog` are both
//   unreachable states) are never pushed at all, so they simply do not
//   appear here either -- nothing to preserve, nothing invented.
// - `canDisable` is real: false for "Basic", true for every other tab only
//   when `$stateParams.id` is falsy/0 (i.e. before a patient exists yet) --
//   clicking a disabled tab does nothing, matching `disable="tab.canDisable"`
//   and the original `switchTab()`'s own `if (!canDisableTab)` guard.
// - The native `<patientsearch>` widget (real, shared, async-fetching
//   directive) and the nested `<div ui-view>` both stay native siblings in
//   the .html template -- REUSABLE SUB-WIDGET PATTERN, untouched.
// ---------------------------------------------------------------------------
export const FullRegistrationTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>Full Registration</h3>
        <button
          onClick={() => dispatch('addNewFull')}
          title="Add New"
          style={{
            border: 'none', borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: colors.primary, color: '#fff', cursor: 'pointer',
          }}
        >
          <i className="fa fa-plus" aria-hidden="true" />
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
              borderBottom: '2px solid transparent',
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
};
