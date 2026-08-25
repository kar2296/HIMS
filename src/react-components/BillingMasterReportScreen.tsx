import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';

interface BillingMasterReportScreenProps {
  reactProps?: {
    canBillingService?: boolean;
    canBillingGroup?: boolean;
    canBillingPackage?: boolean;
  };
  onAction?: (actionName: string) => void;
}

interface ReportRow {
  label: string;
  action: string;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports / Master reports
// tab child, app.billingreportstab.masterbillingreport,
// MasterBillingReportController). Confirmed a real child of the
// already-migrated app.billingreportstab hub (BillingReportsTabScreen),
// reached by its "Master reports" tab.
//
// Confirmed extensive dead code, NOT reproduced (verified via a full
// template read): MasterBillingReportController defines roughly 55
// $state.go navigation functions, but the real template only ever
// wires up THREE of them via ng-click -- billingservice(), billingGroup(),
// and billingpackage(). Every other function (patientlist,
// collectionreport, dailybills, discount, doctorinvtds, labsummary,
// ipdue, surgeryreport, surgeryentry, surgeryprocedure,
// revenuesummarybycategory, and roughly 40 more) has zero UI trigger
// anywhere in the real template and is genuinely unreachable on the live
// app today. Only the three real, wired rows are rendered here.
//
// Each row's real visibility is privilege-gated
// (ng-if="HasAccess('Masterreports', '<code>')" via
// utl.Ctrl.getPrivilegeCtrl). AngularJS remains authoritative for this
// check -- the bridge calls the real $scope.HasAccess() and passes the
// three booleans through as reactProps rather than reimplementing
// privilege logic in React.
export const BillingMasterReportScreen: React.FC<BillingMasterReportScreenProps> = ({ reactProps, onAction }) => {
  const {
    canBillingService = false,
    canBillingGroup = false,
    canBillingPackage = false,
  } = reactProps || {};

  const dispatch = (action: string) => {
    if (onAction) onAction(action);
  };

  const rows: ReportRow[] = [];
  if (canBillingService) rows.push({ label: 'Service Item With Rate Details', action: 'billingservice' });
  if (canBillingGroup) rows.push({ label: 'Billing Group Details', action: 'billingGroup' });
  if (canBillingPackage) rows.push({ label: 'Package Details', action: 'billingpackage' });

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
