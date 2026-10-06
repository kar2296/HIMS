import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PatientRef {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: string | number;
  Gender?: { Description?: string };
}

interface BillRow {
  Id?: number;
  BillDateTime?: string;
  BillNumber?: string;
  Patient?: PatientRef;
  BillAmount?: number | string;
  BillDiscount?: number | string;
  RoundOff?: number | string;
  NetAmount?: number | string;
  PaidAmount?: number | string;
  OutStandingAmount?: number | string;
  [key: string]: any;
}

interface BillingConsolidatePaymentGridScreenProps {
  reactProps?: {
    bills?: BillRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real displaycurrency filter (vendor/common/ngCommonHelper.js):
// a ₹ symbol plus Indian-style digit grouping, 2 decimals, and "₹0.00" for
// undefined/NaN input -- same helper already established for this
// migration (FindBillModalComponent and sibling Billing screens).
function formatCurrency(val: number | string | undefined | null): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBillDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mi}`;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily,
  fontSize: '12px', fontWeight: 600, color: colors.textMain, borderBottom: `2px solid ${colors.border}`,
  background: '#a0bfd44f', whiteSpace: 'nowrap',
};
const thSortableStyle: React.CSSProperties = { ...thStyle, cursor: 'pointer', userSelect: 'none' };
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily, fontSize: '13px',
  color: colors.textMain, borderBottom: `1px solid ${colors.border}`,
};
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

// UI-MODERNIZATION RETROFIT (Billing / Consolidate Payment grid mount --
// see consolidatepayment.html's top-of-file disclosure for the full hybrid
// rationale). Replaces the real <custom-table config="vm.gridConfig">
// (public/js/custom-table.html / customTableController in public/js/app.js)
// with a plain read-only table driven by reactProps.bills, which the
// AngularJS bridge sources straight from the real, unmodified
// vm.gridConfig.data.
//
// CONFIRMED MAJOR PRE-EXISTING DEFECT, reproduced exactly, NOT fixed: the
// shared <custom-table> component (public/js/app.js customTableController)
// has NO row-selection/checkbox support at all -- it never invokes
// vm.gridConfig.onRegisterApi, so $scope.gridApi is permanently undefined
// in production. saveAndApprove()'s getSelectionRows()
// (-> $scope.gridApi.selection.getSelectedRows()) therefore throws an
// uncaught TypeError EVERY time it runs today, meaning the entire "select
// bills and consolidate payment" workflow is already non-functional in
// production, independent of this migration. Accordingly: NO selection
// checkboxes are rendered below (there is no checkbox column in the real
// vm.gridConfig.columnDefs or the custom-table template either), and the
// 'saveAndApprove' action dispatched by BillingConsolidatePaymentActionsScreen
// goes straight to the real, unmodified $scope.saveAndApprove(), which will
// throw the same way it does today. selectionChangedCal() (the function
// that would have accumulated item.Discount/BillAmount/OutStandingAmt/
// Received from checked rows) is consequently unreachable dead code and is
// NOT reproduced here.
//
// SORT FIDELITY: header clicks dispatch 'sortBills' with the SAME field
// name the real vm.gridConfig.columnDefs uses for that column -- including
// its real display mismatches, reproduced verbatim rather than "corrected"
// to the visually-correct field:
//   - "Bill Amount" header sorts by field "Amount" (not BillAmount)
//   - "Discount" header sorts by field "GrossGSTAmount" (not BillDiscount)
//   - "Round Off" header sorts by field "DoctorShare" (not RoundOff)
//   - "Paid Amount" AND "Due Amount" headers BOTH sort by field "Doctor"
//     (a real duplicate/copy-paste field name shared by two different
//     columns in the live columnDefs)
// The bridge's sortBills handler mirrors customTableController.reOrder
// exactly (dotted-path field lookup, case-insensitive string compare,
// in-place mutation of vm.gridConfig.data).
//
// The "Patient" column's real field is literally "Patient" (not a leaf
// path) -- the dotted-path reduce resolves it to the nested Patient
// object itself, not a string, so the real reOrder's a.toLowerCase() call
// throws an uncaught TypeError today if that header is clicked. Left
// non-sortable here (same faithful stand-in already used on sibling
// screens, e.g. AllOPPatientListScreen, for this exact bug class) rather
// than reproducing a real crash inside this component.
export const BillingConsolidatePaymentGridScreen: React.FC<BillingConsolidatePaymentGridScreenProps> = ({ reactProps, onAction }) => {
  const bills = reactProps?.bills || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const sortHeader = (label: string, field: string) => (
    <th style={thSortableStyle} onClick={() => dispatch('sortBills', { field })}>
      {label} <i className="fa fa-sort" aria-hidden="true" style={{ fontSize: '10px', opacity: 0.6 }}></i>
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {sortHeader('Bill Date', 'BillDateTime')}
            {sortHeader('Bill No', 'BillNumber')}
            <th style={thStyle}>Patient Name</th>
            {sortHeader('Bill Amount', 'Amount')}
            {sortHeader('Discount', 'GrossGSTAmount')}
            {sortHeader('Round Off', 'DoctorShare')}
            {sortHeader('Net Amount', 'NetAmount')}
            {sortHeader('Paid Amount', 'Doctor')}
            {sortHeader('Due Amount', 'Doctor')}
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td style={tdStyle} colSpan={9}>No records</td>
            </tr>
          ) : (
            bills.map((row, idx) => (
              <tr key={row.Id != null ? row.Id : idx}>
                <td style={tdStyle}>{formatBillDateTime(row.BillDateTime)}</td>
                <td style={tdStyle}>{row.BillNumber}</td>
                <td style={tdStyle}>
                  <a
                    onClick={() => dispatch('patientinfo', { entity: row })}
                    style={{ cursor: 'pointer', color: colors.primary, textDecoration: 'none' }}
                  >
                    {row.Patient?.Title?.Description ? <b>{row.Patient.Title.Description}</b> : null}{' '}
                    <b>{row.Patient?.FirstName}</b> {row.Patient?.LastName} / {row.Patient?.MRN} / {row.Patient?.Age} / {row.Patient?.Gender?.Description}
                  </a>
                </td>
                <td style={tdRightStyle}>{formatCurrency(row.BillAmount)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.BillDiscount)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.RoundOff)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.NetAmount)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.PaidAmount)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.OutStandingAmount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
