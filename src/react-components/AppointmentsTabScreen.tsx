import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';

interface TabDef {
  title: string;
  state: string;
  canDisableTab: boolean;
}

interface ReactPropsShape {
  tabs?: TabDef[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// appointmentstab (app.appointmentstab / app.appointmentstab.*, tab shell) --
// the real per-appointment management shell reached via $state.go(
// 'app.appointmentstab.details', {id}) etc. from many places app-wide
// (dashboards, doctordashboard "Appointment" tile, surgery calendar, optical
// dashboard, nursing dashboard, and internally from appointments-list.js /
// updateappapnmnts.js / appointments-form1.js / viewappoitment.js /
// patienttracker.js). All API calls/permission checks stay in the untouched
// Angular controller; this only renders the header + tab strip. Each tab's
// own screen renders through the native `<div ui-view>` left in the .html
// template below this mount -- NOT reproduced here.
//
// Real, disclosed specifics preserved exactly, NOT changed:
// - The real controller's tab array has a 4th tab ("appointmentfromapp")
//   FULLY COMMENTED OUT in the source (dead -- confirmed via a project-wide
//   grep: `app.appointmentstab.appointmentfromapp` has zero live callers
//   anywhere besides its own commented-out tab entry and its own state
//   registration -- the file appointmentfromapp.js is unreachable dead code).
//   Only the 3 real, live tabs are reproduced here: Details, View, Appointment
//   Calendar.
// - `canDisableTab` (real field name in the source, NOT renamed to
//   `canDisable` for consistency with other tab shells -- kept literal) is
//   always `false` for every tab in this controller (`var canDisableTab =
//   false;` is hardcoded, the commented-out `$stateParams.id`-based logic
//   above it is dead) -- so no tab is ever actually disabled today, but the
//   disabled-tab rendering path is kept for parity with the shared pattern
//   and in case that hardcoding is ever reverted.
// - `addNew()` navigates to the Details tab with `{id: 0}` (new appointment);
//   `backtodashboard()` goes to `app.frontdashboard` (NOT `app.doctordashboard`
//   -- real, slightly surprising target, preserved verbatim).
// ---------------------------------------------------------------------------
export const AppointmentsTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>Appointments</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            onClick={() => dispatch('addNew')}
            title="Appointments"
            style={{
              border: 'none', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: colors.primary, color: '#fff', cursor: 'pointer',
            }}
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
          <button
            onClick={() => dispatch('backtodashboard')}
            title="Dashboard"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontSize: 20 }}
          >
            <i className="fas fa-home" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: spacing.xs, borderBottom: `1px solid ${colors.border}` }}>
        {tabs.map((tab) => (
          <button
            key={tab.state}
            onClick={() => { if (!tab.canDisableTab) dispatch('switchTab', { state: tab.state }); }}
            disabled={tab.canDisableTab}
            style={{
              border: 'none',
              background: 'none',
              padding: `${spacing.sm} ${spacing.md}`,
              cursor: tab.canDisableTab ? 'not-allowed' : 'pointer',
              opacity: tab.canDisableTab ? 0.5 : 1,
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
