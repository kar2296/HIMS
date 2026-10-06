import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';

interface BillingIpInvoiceReportScreenProps {
  reactProps?: {
    canIpBillReport?: boolean;
    canIpCollectionDetailByCashier?: boolean;
    canIpCollectionSummaryByCashier?: boolean;
    canIpRefundReport?: boolean;
    canIpDueCollectReport?: boolean;
    canCurrentOccupancyReport?: boolean;
    canIpCancelReport?: boolean;
    canIpDiscountReport?: boolean;
    canIpInsuranceReport?: boolean;
    canIpDue?: boolean;
    canIpAdmissionReport?: boolean;
    canIpDischargeReport?: boolean;
    canIpOccupancyReportWithAdvance?: boolean;
  };
  onAction?: (actionName: string) => void;
}

interface ReportRow {
  label: string;
  action: string;
  visible: boolean;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports / IP Invoice
// (Collection Reports For IP) tab child,
// app.billingreportstab.ipinvoicebillingreport, IPBillingReportController).
// Confirmed a real child of the already-migrated app.billingreportstab
// hub (BillingReportsTabScreen), reached by its "IP Invoice" tab. This
// completes the migration of the entire app.billingreportstab hub (all
// 5 tab children now React-owned; the tab bar itself and the real
// ui-view host were migrated in an earlier commit).
//
// Confirmed extensive dead code, NOT reproduced (verified via a full
// template read): IPBillingReportController defines roughly 60
// $state.go navigation functions, but the real template only ever wires
// up 12 of them via ng-click. Only the 12 real, wired rows are rendered
// here, in the same order as the real template.
//
// Confirmed pre-existing quirk, reproduced exactly (harmless, not a
// display bug): one of the twelve real rows
// (ipoccupancyreportwithadvance) passes a literal English sentence
// directly as the translate directive's "key"
// ("IP Occupancy Report With Advance") instead of a real i18n key.
// Since $translateProvider has no missingTranslationHandler configured,
// this renders as its own literal text today by coincidence --
// reproduced as hardcoded label text. Also preserved verbatim: the real
// i18n value for reports.billingipdetails.lbl ("IP Admission Details ")
// carries a trailing space.
//
// Each row's real visibility is privilege-gated
// (ng-if="HasAccess('CollectionReportsForIP', '<code>')" via
// utl.Ctrl.getPrivilegeCtrl). AngularJS remains authoritative for this
// check -- the bridge calls the real $scope.HasAccess() for every row
// and passes the booleans through as reactProps rather than
// reimplementing privilege logic in React.
export const BillingIpInvoiceReportScreen: React.FC<BillingIpInvoiceReportScreenProps> = ({ reactProps, onAction }) => {
  const p = reactProps || {};

  const dispatch = (action: string) => {
    if (onAction) onAction(action);
  };

  const allRows: ReportRow[] = [
    { label: 'IP Bills Reports', action: 'ipbillreport', visible: !!p.canIpBillReport },
    { label: 'IP Collection Reports By Cashier', action: 'ipcollectiondetailbycashierreport', visible: !!p.canIpCollectionDetailByCashier },
    { label: 'IP Collection Summary By Cashier', action: 'ipcollectionsummarybycashier', visible: !!p.canIpCollectionSummaryByCashier },
    { label: 'IP Refund Details', action: 'iprefundreport', visible: !!p.canIpRefundReport },
    { label: 'Due Collect Reports For IP', action: 'ipduecollectreport', visible: !!p.canIpDueCollectReport },
    { label: 'Current Occupancy Reports with Payment', action: 'currentoccupancyreport', visible: !!p.canCurrentOccupancyReport },
    { label: 'IP Cancel Reports', action: 'ipcancelreport', visible: !!p.canIpCancelReport },
    { label: 'IP Discount Reports', action: 'ipdiscountreport', visible: !!p.canIpDiscountReport },
    { label: 'IP Payer Details Reports', action: 'ipinsurancereport', visible: !!p.canIpInsuranceReport },
    { label: 'IP Due Reports For Private', action: 'ipdue', visible: !!p.canIpDue },
    { label: 'IP Admission Details ', action: 'ipadmissionreport', visible: !!p.canIpAdmissionReport },
    { label: 'IP Discharge Details', action: 'ipdischargereport', visible: !!p.canIpDischargeReport },
    { label: 'IP Occupancy Report With Advance', action: 'ipoccupancyreportwithadvance', visible: !!p.canIpOccupancyReportWithAdvance },
  ];
  const rows = allRows.filter((r) => r.visible);

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
