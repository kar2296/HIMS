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
  ReceiptDt?: string;
  RefundDt?: string;
  Receiptnumber?: string;
  Refundnumber?: string;
  Billnumber?: string;
  Visittnumber?: string;
  Refundtype?: string;
  PatientName?: string;
  Drname?: string;
  Cash?: number;
  Card?: number;
  ChequeOthers?: number;
}

interface Totals {
  TotalCashAdvances?: number | string;
  TotalCardAdvances?: number | string;
  TotalChequeOtherAdvances?: number | string;
  TotalAdvances?: number | string;
  TotalCashReceipts?: number | string;
  TotalCardReceipts?: number | string;
  TotalChequeOtherReceipts?: number | string;
  TotalReceipts?: number | string;
  TotalCashRefunds?: number | string;
  TotalCardRefunds?: number | string;
  TotalChequeOtherRefunds?: number | string;
  TotalRefunds?: number | string;
}

interface BillingIpBillingCollectionsScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { PaymentType?: LookupItem[] };
    flags?: {
      PatientAdvances?: boolean;
      PatientReceipts?: boolean;
      PatientRefunds?: boolean;
    };
    totals?: Totals;
    advances?: CollectionRow[];
    receipts?: CollectionRow[];
    refunds?: CollectionRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real displaycurrency filter (vendor/common/ngCommonHelper.js):
// a ₹ symbol plus Indian-style digit grouping, 2 decimals -- same helper
// already established for this migration (FindBillModalComponent, and the
// sibling BillingBillingCollectionsScreen). Not reproduced: the filter's
// window.clientcode "swostha" branch, consistent with that precedent.
function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(val?: string): string {
  // Mirrors the real {{X | date:'dd/MMM/yyyy'}}&nbsp;{{X | date:'HH:mm'}} markup exactly.
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

// UI-MODERNIZATION RETROFIT (Billing / IP Billing Collections,
// app.ipbillingcollections). See the disclosure comment in
// ipbillingcollections.html for the reachability caveat and the
// single-mount-design rationale (no utl.Validator usage, no shared
// native-only widgets, confirmed via a full read of both the real
// controller and template). AngularJS (ipbillingcollections.js) remains
// authoritative for the real Billing/PatientPaymentDetails/
// GetPatientPaymentDetails calls (Advances/Fund/Receipts/Refunds) and
// every row/total computation; this component only renders reactProps
// and dispatches action names via handleReactAction.
//
// Confirmed pre-existing quirks and bugs, preserved exactly (not "fixed"):
// - The "Payment Type" filter dropdown (bound to currentfilter.PaymentTypeId,
//   options CASH/CARD/OTHERS) is real and live but its value is never read
//   by getIPAdvancesList/getIPReceiptsList/getIPRefundsList/getIPFundList/
//   getList -- changing it has zero effect on the fetched data, same dead-
//   filter pattern already confirmed for the sibling OP screen.
// - A genuine copy-paste bug in the real Receipts table: its Card column
//   is bound to `PatientBill.Card` (a variable that does not exist in this
//   ng-repeat's scope -- the row variable here is PatientReceipt, not
//   PatientBill) instead of `PatientReceipt.Card`. Since PatientBill is
//   undefined, `undefined | displaycurrency` always renders "₹0.00" --
//   the real Receipts table's Card column shows ₹0.00 for every row
//   regardless of the actual card amount collected. Reproduced verbatim
//   below (see the Receipts row rendering).
// - A confirmed dead feature, not just a dead field: getIPFundList()/
//   getIPFundListCallback fire on every Fetch (a 4th
//   GetPatientPaymentDetails call, Key:4=5) and populate
//   $scope.PaymentIPFunds plus Fund* totals, but the real 364-line
//   template never renders any of it -- no ng-repeat, no summary row,
//   no visibility flag. This React mount does not surface Funds either,
//   matching the real screen's total absence of Funds UI. The real
//   getIPFundList() keeps firing unmodified from the bridge (see
//   ipbillingcollections.js) even though React never sees its result.
// - Within getIPFundListCallback itself (AngularJS-side, unaffected by
//   this migration but worth noting): it resets $scope.FundCashAdvances/
//   FundCardAdvances/FundChequeOtherAdvances/FundAdvances to 0 on every
//   call, but actually accumulates into a *different*, never-initialized
//   set of scope vars (FundCashFunds/FundCardFunds/FundChequeOtherFunds/
//   FundFunds) -- which are undefined on first use, so `undefined +=
//   amount` yields NaN. Irrelevant to the visible UI today only because
//   nothing in the template reads any Fund* total, per the point above.
// - The Advance/Receipt/Card/Cheque payment-type categorization has the
//   same operator-precedence bug already confirmed for OP Billing
//   Collections (`PaymentTypeId == 5 || PaymentTypeId == 6 &&
//   ReceiptStatusId == 1`, where && binds tighter than ||) -- lives
//   entirely in AngularJS and is preserved automatically since this
//   component only renders the already-computed arrays/totals.
// - PatientAdvances/PatientReceipts/PatientRefunds (the flags that
//   show/hide each table's header) are only ever set to `true` inside
//   their callback when data is returned -- never reset to `false` on a
//   subsequent Fetch that returns zero rows. Once a section has shown
//   data once, its header stays visible (with an empty table body) even
//   after a later empty result. Reproduced by mirroring the real
//   booleans unmodified.
// - $scope.UserName is computed inside getIPReceiptsListCallback (built
//   from PatientReceipt.CreatedUser when currentfilter.UserId > 0) but is
//   never bound anywhere in the real template -- confirmed dead computed
//   state, not rendered here.
// - getList()'s real 3-day range validation, on failure, shows its
//   message via the app's "success" alert style (not an error alert) and
//   resets both dates to right-now (not back to today's default
//   00:00/23:59 window) -- both confirmed real behavior, invoked through
//   the real, unmodified $scope.getList() via the Fetch button's dispatch.
// - The "Net Submission" balance banner sums all three per-mode Net
//   values (Advances + Receipts - Refunds, per Cash/Card/Cheque-Other) --
//   Funds are not included anywhere, consistent with Funds having no UI
//   presence at all.
export const BillingIpBillingCollectionsScreen: React.FC<BillingIpBillingCollectionsScreenProps> = ({ reactProps, onAction }) => {
  const {
    currentfilter = {},
    lookup,
    flags = {},
    totals = {},
    advances = [],
    receipts = [],
    refunds = [],
  } = reactProps || {};

  const paymentTypeOptions = lookup?.PaymentType || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const cashAdvances = Number(totals.TotalCashAdvances) || 0;
  const cardAdvances = Number(totals.TotalCardAdvances) || 0;
  const chequeAdvances = Number(totals.TotalChequeOtherAdvances) || 0;
  const cashReceipts = Number(totals.TotalCashReceipts) || 0;
  const cardReceipts = Number(totals.TotalCardReceipts) || 0;
  const chequeReceipts = Number(totals.TotalChequeOtherReceipts) || 0;
  const cashRefunds = Number(totals.TotalCashRefunds) || 0;
  const cardRefunds = Number(totals.TotalCardRefunds) || 0;
  const chequeRefunds = Number(totals.TotalChequeOtherRefunds) || 0;

  const netCash = cashAdvances + cashReceipts - cashRefunds;
  const netCard = cardAdvances + cardReceipts - cardRefunds;
  const netOthers = chequeAdvances + chequeReceipts - chequeRefunds;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <h4 style={{ ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.md}` }}>
        IP Collections Summary
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

      <div style={{ overflowX: 'auto', marginBottom: spacing.md }}>
        <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={tdStyle}>Advance Cash</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCashAdvances)}</td>
              <td style={tdStyle}>Advance Card</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardAdvances)}</td>
              <td style={tdStyle}>Advance Cheque/Other</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalChequeOtherAdvances)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Total Cash</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCashReceipts)}</td>
              <td style={tdStyle}>Total Card</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalCardReceipts)}</td>
              <td style={tdStyle}>Total Cheque/Other</td>
              <td style={tdRightStyle}>{formatCurrency(totals.TotalChequeOtherReceipts)}</td>
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
              <td style={tdStyle}>Net Cash</td>
              <td style={tdRightStyle}>{formatCurrency(netCash)}</td>
              <td style={tdStyle}>Net Card</td>
              <td style={tdRightStyle}>{formatCurrency(netCard)}</td>
              <td style={tdStyle}>Net Others</td>
              <td style={tdRightStyle}>{formatCurrency(netOthers)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.lg }}>
        <table>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, background: '#e24b8fd6', color: '#fff' }}>Net Submission</td>
              <td style={{ ...tdRightStyle, background: '#e24b8fd6', color: '#fff' }}>{formatCurrency(netCash + netCard + netOthers)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {flags.PatientAdvances && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Receipt Date</th>
                <th style={thStyle}>Receipt No</th>
                <th style={thStyle}>Visit No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Cash</th>
                <th style={thStyle}>Card</th>
                <th style={thStyle}>Cheque/Others</th>
              </tr>
            </thead>
          )}
          <tbody>
            {advances.map((row) => (
              <tr key={`advance-${row.SNo}`}>
                <td style={tdStyle}>{row.SNo}</td>
                <td style={tdStyle}>{formatDateTime(row.ReceiptDt)}</td>
                <td style={tdStyle}>{row.Receiptnumber}</td>
                <td style={tdStyle}>{row.Visittnumber}</td>
                <td style={tdStyle}>{row.PatientName}</td>
                <td style={tdStyle}>{row.Drname}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Cash)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Card)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.ChequeOthers)}</td>
              </tr>
            ))}
          </tbody>
          {flags.PatientReceipts && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Receipt Date</th>
                <th style={thStyle}>Receipt No</th>
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
            {receipts.map((row) => (
              <tr key={`receipt-${row.SNo}`}>
                <td style={tdStyle}>{row.SNo}</td>
                <td style={tdStyle}>{formatDateTime(row.ReceiptDt)}</td>
                <td style={tdStyle}>{row.Receiptnumber}</td>
                <td style={tdStyle}>{row.Billnumber}</td>
                <td style={tdStyle}>{row.PatientName}</td>
                <td style={tdStyle}>{row.Drname}</td>
                <td style={tdRightStyle}>{formatCurrency(row.Cash)}</td>
                {/* Confirmed pre-existing bug: the real Card column is bound to an
                    undefined variable (PatientBill.Card, not PatientReceipt.Card) --
                    always renders ₹0.00, never row.Card. See disclosure above. */}
                <td style={tdRightStyle}>{formatCurrency(undefined)}</td>
                <td style={tdRightStyle}>{formatCurrency(row.ChequeOthers)}</td>
              </tr>
            ))}
          </tbody>
          {flags.PatientRefunds && (
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Refund Date</th>
                <th style={thStyle}>Refund No</th>
                <th style={thStyle}>Refund Type</th>
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
                <td style={tdStyle}>{row.Refundtype}</td>
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

      <div style={{ marginTop: spacing.lg }}>
        <Button variant="secondary" onClick={() => dispatch('backToList')}>Back</Button>
      </div>
    </div>
  );
};
