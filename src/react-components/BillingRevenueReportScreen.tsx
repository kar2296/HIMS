import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';

interface BillingRevenueReportScreenProps {
  reactProps?: {
    canItemWiseOp?: boolean;
    canItemWiseIp?: boolean;
    canItemWiseOpAndIp?: boolean;
    canRevenueByServiceItem?: boolean;
    canReferralDoctorRevenueDetails?: boolean;
  };
  onAction?: (actionName: string) => void;
}

interface ReportRow {
  label: string;
  action: string;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports / Revenue Reports
// tab child, app.billingreportstab.revenuereport, RevenueReportController).
// Confirmed a real child of the already-migrated app.billingreportstab
// hub (BillingReportsTabScreen), reached by its "Revenue Reports" tab.
//
// Confirmed extensive dead code, NOT reproduced (verified via a full
// template read): RevenueReportController defines roughly 65 $state.go
// navigation functions, but the real template only ever wires up FIVE
// of them via ng-click -- itemwisecollectionsummaryopreport,
// itemwisecollectionsummaryipreport,
// itemwisecollectionsummaryopandipreport, revenuesummarybyserviceitem,
// and referraldoctorrevenuedetailsreport. A sixth row
// (departmenttestwiserevenuereport) exists in the real template but is
// entirely HTML-commented-out -- confirmed disabled, not rendered.
// Every other function is genuinely unreachable on the live app today.
//
// Confirmed pre-existing quirk, reproduced exactly (harmless, not a
// display bug): two of the five real rows pass a literal English
// sentence directly as the translate directive's "key" instead of a
// real i18n key (translate="Item Wise Collection Summary For OP and IP"
// and translate="Referral Doctor Revenue Details Report"). Since
// $translateProvider has no missingTranslationHandler configured,
// looking up a nonexistent key returns the raw key string itself --
// which happens to already be the correct human-readable text, so both
// rows display correctly on the live app today purely by coincidence.
// Reproduced as literal hardcoded label text here, matching what
// actually renders (not routed through any i18n lookup, since there is
// none on the real side for these two rows either).
//
// Each row's real visibility is privilege-gated
// (ng-if="HasAccess('Revenuereports', '<code>')" via
// utl.Ctrl.getPrivilegeCtrl). AngularJS remains authoritative for this
// check -- the bridge calls the real $scope.HasAccess() and passes the
// five booleans through as reactProps rather than reimplementing
// privilege logic in React.
export const BillingRevenueReportScreen: React.FC<BillingRevenueReportScreenProps> = ({ reactProps, onAction }) => {
  const {
    canItemWiseOp = false,
    canItemWiseIp = false,
    canItemWiseOpAndIp = false,
    canRevenueByServiceItem = false,
    canReferralDoctorRevenueDetails = false,
  } = reactProps || {};

  const dispatch = (action: string) => {
    if (onAction) onAction(action);
  };

  const rows: ReportRow[] = [];
  if (canItemWiseOp) rows.push({ label: 'Item Wise Collection Summary For OP', action: 'itemwisecollectionsummaryopreport' });
  if (canItemWiseIp) rows.push({ label: 'Item Wise Collection Summary For IP', action: 'itemwisecollectionsummaryipreport' });
  if (canItemWiseOpAndIp) rows.push({ label: 'Item Wise Collection Summary For OP and IP', action: 'itemwisecollectionsummaryopandipreport' });
  if (canRevenueByServiceItem) rows.push({ label: 'Revenue Summary By Service Item', action: 'revenuesummarybyserviceitem' });
  if (canReferralDoctorRevenueDetails) rows.push({ label: 'Referral Doctor Revenue Details Report', action: 'referraldoctorrevenuedetailsreport' });

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
