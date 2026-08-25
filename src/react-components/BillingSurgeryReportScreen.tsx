import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';

interface BillingSurgeryReportScreenProps {
  reactProps?: {
    canOtScheduleReport?: boolean;
    canSurgeryEntry?: boolean;
    canSurgerySummaryByProcedure?: boolean;
  };
  onAction?: (actionName: string) => void;
}

interface ReportRow {
  label: string;
  action: string;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports / Surgery Reports
// tab child, app.billingreportstab.surgerybillingreport,
// SurgeryBillingReportController). Confirmed a real child state of the
// already-migrated app.billingreportstab hub (BillingReportsTabScreen),
// reached by clicking its "Surgery Reports" tab.
//
// Confirmed dead controller functions, NOT reproduced (verified via a
// full template read -- neither is referenced by any ng-click anywhere
// in the real template): surgeryreport() (would navigate to
// app.surgeryschedulereports) and surgeryprocedure() (would navigate to
// app.surgeryschedulebyprocedure). backtoList() is also unreferenced in
// this template (no back button exists here). Only the three real,
// wired rows -- OT Schedule Report, Surgery Entry Report, and Surgery
// Summary By Procedure (whose real i18n key is reports.surgeryprocedure.lbl
// despite its function being named surgerysummarybyprocedure -- the
// label/function pairing itself is correct in the real template, this
// is just a confusing-but-harmless naming mismatch) -- are rendered.
//
// Each row's real visibility is privilege-gated
// (ng-if="HasAccess('Surgeryreports', '<code>')" via
// utl.Ctrl.getPrivilegeCtrl). AngularJS remains authoritative for this
// check -- the bridge calls the real $scope.HasAccess() and passes the
// three booleans through as reactProps rather than reimplementing
// privilege logic in React.
//
// Cosmetic-only quirk in the real template, not reproduced structurally
// (verified harmless): each row's markup has a stray, unmatched closing
// </td> immediately after its first real <td>...</td> -- browsers
// silently ignore it, so the real rendered row is unaffected (icon cell
// + label cell, same as this component renders).
export const BillingSurgeryReportScreen: React.FC<BillingSurgeryReportScreenProps> = ({ reactProps, onAction }) => {
  const {
    canOtScheduleReport = false,
    canSurgeryEntry = false,
    canSurgerySummaryByProcedure = false,
  } = reactProps || {};

  const dispatch = (action: string) => {
    if (onAction) onAction(action);
  };

  const rows: ReportRow[] = [];
  if (canOtScheduleReport) rows.push({ label: 'Surgery Schedule Report', action: 'otschedulereport' });
  if (canSurgeryEntry) rows.push({ label: 'Surgery Entry Report', action: 'surgeryentry' });
  if (canSurgerySummaryByProcedure) rows.push({ label: 'Surgery Summary By Procedure', action: 'surgerysummarybyprocedure' });

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td style={{ padding: spacing.md, ...typography.body, color: colors.textMuted, fontFamily: typography.fontFamily }}>
                  No reports available.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.action}
                style={{ cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                onClick={() => dispatch(row.action)}
              >
                <td style={{ padding: spacing.sm, width: 32 }}>
                  <i className="lni lni-checkmark" style={{ color: colors.primary }} aria-hidden="true" />
                </td>
                <td style={{ padding: spacing.sm, ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily }}>
                  {row.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
