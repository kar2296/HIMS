import React from 'react';
import { DatePicker } from '../components/ui/DatePicker';
import { Select } from '../components/ui/Select';
import { Button } from './Button';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  FromBillDate?: string; // ISO yyyy-mm-dd, converted from/to the real AngularJS Date object by the bridge
  ToBillDate?: string;
  PaymentTypeId?: number;
}

interface CollectionRow {
  SNo: number;
  BillDt?: string;
  RefundDt?: string;
  Billnumber?: string;
  Receiptnumber?: string;
  Refundnumber?: string;
  PatientName?: string;
  Drname?: string;
  ReferralName?: string;
  Cash?: number;
  Card?: number;
  ChequeOthers?: number;
  Status?: string;
}

interface Totals {
  TotalCashSales?: number | string;
  TotalCardSales?: number | string;
  TotalChequeOtherSales?: number | string;
  TotalSales?: number | string;
  TotalCashRefunds?: number | string;
  TotalCardRefunds?: number | string;
  TotalChequeOtherRefunds?: number | string;
  TotalRefunds?: number | string;
  TotalCashCancels?: number | string;
  TotalCardCancels?: number | string;
  TotalChequeOtherCancels?: number | string;
  TotalCancels?: number | string;
}

interface BillingBillingCollectionsScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { PaymentType?: LookupItem[] };
    flags?: {
      PatientBills?: boolean;
      PatientBillCancellations?: boolean;
      PatientRefunds?: boolean;
    };
    totals?: Totals;
    sales?: CollectionRow[];
    cancels?: CollectionRow[];
    refunds?: CollectionRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real displaycurrency filter (vendor/common/ngCommonHelper.js):
// a ₹ symbol plus Indian-style digit grouping, 2 decimals. Same helper
// already established for this migration in FindBillModalComponent. Not
// reproduced: the filter's window.clientcode "swostha" branch (a rupee-
// symbol variant for one specific deployment), consistent with that
// precedent.
function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(val?: string): string {
  // Mirrors the real {{X | date:'dd/MMM/yyyy'}}&nbsp;{{X | date:'HH:mm'}}
  // markup exactly -- note the slash-separated date, distinct from the
  // dash-separated "dd-MMM-yyyy HH:mm" format used elsewhere in Billing.
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mmm}/${yyyy} ${hh}:${min}`;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, background: '#164360', color: '#fff',
  ...typography.label, fontFamily: typography.fontFamily, whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, border: '1px solid #aaa', background: '#fff',
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily, whiteSpace: 'nowrap',
};
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' };
const tdRedStyle: React.CSSProperties = { ...tdStyle, color: 'red' };
const tdRedRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', color: 'red' };

// UI-MODERNIZATION RETROFIT (Billing / OP Billing Collections,
// app.opbillingcollections). See the disclosure comment in
// billingcollections.html for the reachability caveat and the
// not-reproduced stray nested-document markup. AngularJS
// (billingcollections.js) remains authoritative for the real
// billing/patientbills/GetPatientBills and
// Billing/PatientRefund/GetPatientRefund calls and every row/total
// computation; this component only renders reactProps and dispatches
// action names via handleReactAction.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The page title "OP Billing Collection" is hardcoded literal English
//   in the real template, not routed through i18n at all.
// - The "Payment Type" filter dropdown is real and live (bound to
//   currentfilter.PaymentTypeId) but its value is never read by
//   getOPDGSalesList/getOPDGCancelsList/getOPDGRefundsList/getList --
//   changing it has zero effect on the fetched data. Reproduced as a
//   real, working dropdown that genuinely does nothing, matching today.
// - The "Other Cancellations" total cell in the summary table is bound
//   to TotalCardCancels, not TotalChequeOtherCancels -- a real
//   copy-paste bug in the original markup. Reproduced verbatim: this
//   screen shows the Card Cancelled amount twice, never the actual
//   cheque/other cancelled total.
// - PatientBills/PatientBillCancellations/PatientRefunds (the flags
//   that show/hide each table's header) are only ever set to `true`
//   inside their callback when data is returned -- never reset to
//   `false` on a subsequent Fetch that returns zero rows. Once a
//   section has shown data once, its header stays visible (with an
//   empty table body) even after a later empty result. Reproduced by
//   mirroring the real booleans unmodified.
// - getList()'s real 3-day range validation, on failure, shows its
//   message via the app's "success" alert style (not an error alert)
//   and resets both dates to right-now (not back to today's default
//   00:00/23:59 window) -- both confirmed real behavior, invoked
//   through the real, unmodified $scope.getList() via the Fetch
//   button's dispatch.
// - The summary "Net Submission" total is Sales minus Refunds only --
//   Cancellations are not subtracted. Reproduced exactly.
export const BillingBillingCollectionsScreen: React.FC<BillingBillingCollectionsScreenProps> = ({ reactProps, onAction }) => {
  const {
    currentfilter = {},
    lookup,
    flags = {},
    totals = {},
    sales = [],
    cancels = [],
    refunds = [],
  } = reactProps || {};

  const paymentTypeOptions = lookup?.PaymentType || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const cashSales = Number(totals.TotalCashSales) || 0;
  const cardSales = Number(totals.TotalCardSales) || 0;
  const chequeSales = Number(totals.TotalChequeOtherSales) || 0;
  const cashRefunds = Number(totals.TotalCashRefunds) || 0;
  const cardRefunds = Number(totals.TotalCardRefunds) || 0;
  const chequeRefunds = Number(totals.TotalChequeOtherRefunds) || 0;
  const totalSales = Number(totals.TotalSales) || 0;
  const totalRefunds = Number(totals.TotalRefunds) || 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <h4 style={{ ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.md}` }}>
        OP Billing Collection
      </h4>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: spacing.lg }}>
        <div style={{ minWidth: 180 }}>
          <DatePicker label="From Date" value={currentfilter.FromBillDate || ''} onChange={(v) => dispatch('fromDateChange', { value: v })} />
        </div>
        <div style={{ minWidth: 180 }}>
          <DatePicker label="To Date" value={currentfilter.ToBillDate || ''} onChange={(v) => dispatch('toDateChange', { value: v })} />
        </div>
        <div style={{ minWidth: 180 }}>
          <Select
            label="Payment Type"
            value={currentfilter.PaymentTypeId != null ? String(currentfilter.PaymentTypeId) : ''}
            options={paymentTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('paymentTypeFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        <div>
          <Button variant="primary" onClick={() => dispatch('getList')}>Fetch</Button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: spacing.lg }}>
        <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={tdStyle}>Total Cash</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCashSales)}</td>
              <td style={tdStyle}>Total Card</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardSales)}</td>
              <td style={tdStyle}>Total Cheque/Other</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalChequeOtherSales)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Refunded Cash</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCashRefunds)}</td>
              <td style={tdStyle}>Refunded Card</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardRefunds)}</td>
              <td style={tdStyle}>Refunded Cheque/Other</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalChequeOtherRefunds)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Cancelled Cash</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCashCancels)}</td>
              <td style={tdStyle}>Cancelled Card</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardCancels)}</td>
              <td style={tdStyle}>Other Cancellations</td>
              {/* Confirmed pre-existing bug: bound to Card Cancelled, not Cheque/Other Cancelled -- see disclosure above */}
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardCancels)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Net Cash</td>
              <td style={tdRightStyle}>{formatCurrency(cashSales - cashRefunds)}</td>
              <td style={tdStyle}>Net Card</td>
              <td style={tdRightStyle}>{formatCurrency(cardSales - cardRefunds)}</td>
              <td style={tdStyle}>Net Others</td>
              <td style={tdRightStyle}>{formatCurrency(chequeSales - chequeRefunds)}</td>
            </tr>
            <tr>
              <td style={tdStyle} />
              <td style={tdStyle} />
              <td style={tdStyle} />
              <td style={tdStyle} />
              <td style={{ ...tdStyle, background: '#e24b8fd6', color: '#fff' }}>Net Submission</td>
              <td style={{ ...tdRightStyle, background: '#e24b8fd6', color: '#fff' }}>{formatCurrency(totalSales - totalRefunds)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {flags.PatientBills && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Bill Date</th>
                <th style={thStyle}>Bill No</th>
                <th style={thStyle}>Receipt No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Cash</th>
                <th style={thStyle}>Card</th>
                <th style={thStyle}>Cheque/Others</th>
              </tr>
            </thead>
          )}
          <tbody>
            {sales.map((row) => (
              <tr key={`sale-${row.SNo}`}>
                <td style={tdStyle}>{row.SNo}</td>
                <td style={tdStyle}>{formatDateTime(row.BillDt)}</td>
                <td style={tdStyle}>{row.Billnumber}</td>
                <td style={tdStyle}>{row.Receiptnumber}</td>
                <td style={tdStyle}>{row.PatientName}</td>
                <td style={tdStyle}>{row.Drname}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Cash)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Card)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.ChequeOthers)}</td>
              </tr>
            ))}
          </tbody>
          {flags.PatientBillCancellations && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Bill Date</th>
                <th style={thStyle}>Bill No</th>
                <th style={thStyle}>Receipt No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Cash</th>
                <th style={thStyle}>Card</th>
                <th style={thStyle}>Cheque/Others</th>
              </tr>
            </thead>
          )}
          <tbody>
            {cancels.map((row) => (
              <tr key={`cancel-${row.SNo}`}>
                <td style={tdRedStyle}>{row.SNo}</td>
                <td style={tdRedStyle}>{formatDateTime(row.BillDt)}</td>
                <td style={tdRedStyle}>{row.Billnumber}</td>
                <td style={tdRedStyle}>{row.Receiptnumber}</td>
                <td style={tdRedStyle}>{row.PatientName}</td>
                <td style={tdRedStyle}>{row.Drname}</td>
                <td style={tdRedRightStyle}>{formatCurrency(row.Cash)}</td>
                <td style={tdRedRightStyle}>{formatCurrency(row.Card)}</td>
                <td style={tdRedRightStyle}>{formatCurrency(row.ChequeOthers)}</td>
              </tr>
            ))}
          </tbody>
          {flags.PatientRefunds && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Refund Date</th>
                <th style={thStyle}>Refund No</th>
                <th style={thStyle}>Bill No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Cash</th>
                <th style={thStyle}>Card</th>
                <th style={thStyle}>Cheque/Others</th>
              </tr>
            </thead>
          )}
          <tbody>
            {refunds.map((row) => (
              <tr key={`refund-${row.SNo}`}>
                <td style={tdStyle}>{row.SNo}</td>
                <td style={tdStyle}>{formatDateTime(row.RefundDt)}</td>
                <td style={tdStyle}>{row.Refundnumber}</td>
                <td style={tdStyle}>{row.Billnumber}</td>
                <td style={tdStyle}>{row.PatientName}</td>
                <td style={tdStyle}>{row.Drname}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Cash)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Card)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.ChequeOthers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
