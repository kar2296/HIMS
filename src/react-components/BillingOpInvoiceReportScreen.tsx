import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';

interface BillingOpInvoiceReportScreenProps {
  reactProps?: {
    canOpBillReport?: boolean;
    canCollectionDetailByCashier?: boolean;
    canCollectionDetailByAllCashier?: boolean;
    canOpIpCollectionSummaryByCashier?: boolean;
    canOpCollectionSummaryByCashier?: boolean;
    canOverallCollectionSummary?: boolean;
    canOverallCollectionSummaryByCashier?: boolean;
    canInsuranceCreditSummary?: boolean;
    canInsuranceOutstandingSummary?: boolean;
    canOutstandingReports?: boolean;
    canOpDueCollectReport?: boolean;
    canDiscount?: boolean;
    canCancelReport?: boolean;
    canRefundReport?: boolean;
    canDirectBillReport?: boolean;
    canCollectionSummaryOpIp?: boolean;
    canGeneralExpenseReport?: boolean;
    canAdvanceFundDetailsReport?: boolean;
    canPatientFundAdjustmentReport?: boolean;
  };
  onAction?: (actionName: string) => void;
}

interface ReportRow {
  label: string;
  action: string;
  visible: boolean;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports / OP Invoice
// (Collection Reports For OP/IP) tab child,
// app.billingreportstab.opinvoicebillingreport, OPBillingReportController).
// Confirmed a real child of the already-migrated app.billingreportstab
// hub (BillingReportsTabScreen), reached by its first tab (whose own
// label carries the confirmed pre-existing translation-key typo
// documented in the BillingReportsTabScreen.tsx migration).
//
// Confirmed extensive dead code, NOT reproduced (verified via a full
// template read): OPBillingReportController defines roughly 70
// $state.go navigation functions (several themselves commented out --
// ipadmissionreport/ipdischargereport/revenuesummarybycategory/
// revenuesummarybydoctor/revenuesummarybydept), but the real template
// only ever wires up 20 of them via ng-click. Every other function has
// zero UI trigger in the real template and is genuinely unreachable on
// the live app today. Only the 20 real, wired rows are rendered here,
// in the same order as the real template.
//
// Confirmed pre-existing quirk, reproduced exactly (harmless, not a
// display bug): three of the twenty real rows pass a literal English
// sentence directly as the translate directive's "key" instead of a
// real i18n key ("Collection Details By All Cashier(OP/IP)",
// "Advance Fund Details", "Patient Fund Adjustment Report"). Since
// $translateProvider has no missingTranslationHandler configured, these
// render as their own literal text today by coincidence -- reproduced
// as hardcoded label text, matching what actually renders.
//
// Each row's real visibility is privilege-gated
// (ng-if="HasAccess('CollectionReportsForOP/IP', '<code>')" via
// utl.Ctrl.getPrivilegeCtrl). AngularJS remains authoritative for this
// check -- the bridge calls the real $scope.HasAccess() for every row
// and passes the booleans through as reactProps rather than
// reimplementing privilege logic in React.
export const BillingOpInvoiceReportScreen: React.FC<BillingOpInvoiceReportScreenProps> = ({ reactProps, onAction }) => {
  const p = reactProps || {};

  const dispatch = (action: string) => {
    if (onAction) onAction(action);
  };

  const allRows: ReportRow[] = [
    { label: 'OP Bills Reports', action: 'opbillreport', visible: !!p.canOpBillReport },
    { label: 'Collection Details By Cashier(OP/IP)', action: 'collectiondetailbycashierreport', visible: !!p.canCollectionDetailByCashier },
    { label: 'Collection Details By All Cashier(OP/IP)', action: 'collectiondetailbyallcashierreport', visible: !!p.canCollectionDetailByAllCashier },
    { label: 'OP/IP Collection Summary By Cashier', action: 'opipcollectionsummarybycashier', visible: !!p.canOpIpCollectionSummaryByCashier },
    { label: 'OP Collection Summary By Cashier', action: 'opcollectionsummarybycashier', visible: !!p.canOpCollectionSummaryByCashier },
    { label: 'Overall Collection Summary(OP/IP/Pharmacy)', action: 'overallcollectionsummary', visible: !!p.canOverallCollectionSummary },
    { label: 'Overall Collection Summary By Cashier(OP/IP/Pharmacy)', action: 'overallcollectioncashier', visible: !!p.canOverallCollectionSummaryByCashier },
    { label: 'Payer Credit Summary', action: 'insurancecreditsummary', visible: !!p.canInsuranceCreditSummary },
    { label: 'Payer Outstanding Summary', action: 'insuranceoutstandingsummary', visible: !!p.canInsuranceOutstandingSummary },
    { label: 'Due Reports For OP', action: 'outstandingreports', visible: !!p.canOutstandingReports },
    { label: 'Due Collect Reports For OP', action: 'opduecollectreport', visible: !!p.canOpDueCollectReport },
    { label: 'Discount Reports For OP', action: 'discount', visible: !!p.canDiscount },
    { label: 'Cancell Bill Reports For OP', action: 'cancelreport', visible: !!p.canCancelReport },
    { label: 'Refund Details Reports For OP', action: 'refundreport', visible: !!p.canRefundReport },
    { label: 'Direct Bill Details', action: 'directbillreport', visible: !!p.canDirectBillReport },
    { label: 'Collections Summary OP/IP', action: 'collectionsummaryopip', visible: !!p.canCollectionSummaryOpIp },
    { label: 'General Expense Details', action: 'generalexpensereport', visible: !!p.canGeneralExpenseReport },
    { label: 'Advance Fund Details', action: 'advancefunddetailsreport', visible: !!p.canAdvanceFundDetailsReport },
    { label: 'Patient Fund Adjustment Report', action: 'patientfundadjustmentreport', visible: !!p.canPatientFundAdjustmentReport },
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
