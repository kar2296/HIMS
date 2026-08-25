import React from 'react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface PaymentItem {
  PaymentTypeId?: number;
  BankId?: number;
  ChequeNo?: string;
  DDNumber?: string;
  WireTransferId?: string;
  AuthorizedCode?: string;
  CollectedOn?: string;
  TerminalNoId?: number;
  ChequeDate?: string;
  DDDate?: string;
  WireTransferDate?: string;
  CardTypeId?: number;
  OutStandingAmt?: number | string;
  Discount?: number | string;
  BillAmount?: number | string;
  TotRndoffAmt?: number | string;
  Received?: number | string;
}

interface BillingConsolidatePaymentFooterScreenProps {
  reactProps?: {
    item?: PaymentItem;
    lookup?: {
      PaymentType?: LookupItem[];
      Bank?: LookupItem[];
      Terminal?: LookupItem[];
      CardType?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const fieldWrapStyle: React.CSSProperties = { marginBottom: spacing.md };

// Mirrors the real displaycurrency filter -- same helper already
// established for this migration (FindBillModalComponent and sibling
// Billing screens).
function formatCurrency(val: number | string | undefined | null): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const totalsTableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontFamily: typography.fontFamily };
const totalsLabelStyle: React.CSSProperties = {
  background: '#a0bfd44f', color: '#000', fontWeight: 600, padding: `${spacing.xs} ${spacing.sm}`, fontSize: '13px',
};
const totalsValueStyle: React.CSSProperties = {
  fontWeight: 700, padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'right', fontSize: '13px',
  fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${colors.border}`,
};

// UI-MODERNIZATION RETROFIT (Billing / Consolidate Payment, payment-detail
// footer + totals table -- see consolidatepayment.html's top-of-file
// disclosure for the full hybrid rationale). Real required/ng-pattern
// validators for every field below are preserved via hidden native mirror
// inputs in consolidatepayment.html (bound to the same item.* model paths
// the bridge already writes to), NOT reimplemented here, so
// utl.Validator.validate($scope)'s real item_form.$valid check keeps
// working exactly as before.
//
// PaymentTypeId-conditional visibility below matches the real template's
// ng-if conditions exactly:
// - Bank Name shows for ANY PaymentTypeId other than 1 (Cash) -- a wider
//   gate than some sibling screens (e.g. LHRC Voucher also excludes 7);
//   this screen's real ng-if is only `item.PaymentTypeId != 1`.
// - Cheque No: PaymentTypeId==2. DD No: ==3. Wire Transfer No: ==4.
// - Auth Code / Terminal No / Card Type: ==5 || ==6.
// - Collected On: ==2 || ==3 || ==4. Cheque Date: ==2. DD Date: ==3.
//   Transferred On: ==4.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The field labeled "Receipt Amount" (translate=
//   "billing.opbilling-list.receiptamount.lbl") is bound to
//   item.OutStandingAmt, not item.Received/ReceivedAmount -- a real
//   label/model mismatch in the live template -- and the input is
//   `disabled` in the real markup. Reproduced verbatim: label says
//   "Receipt Amount", value shown is item.OutStandingAmt, always
//   non-editable.
// - "Transcation No" (DD/Wire Transfer field's real i18n text, a genuine
//   typo for "Transaction No") and "Auth Code" (not "Authorized Code")
//   and " DD Date" (a real leading space in the i18n string) are
//   reproduced verbatim, not corrected.
// - The totals table's row labels ("Discount :", "Total :", "Round Off :",
//   "Due Amount :", "Grand Amount", "Received :") are literal English
//   strings hardcoded directly in the real template -- NOT translate
//   directives at all (unlike almost every other label on this screen).
//   Reproduced as plain literal text, matching what renders today.
// - "Round Off" always shows ₹0.00: it is bound to item.TotRndoffAmt,
//   a field the controller never sets anywhere. Reproduced as a dead,
//   permanently-zero field, not wired to RoundOff/any live value.
// - "Grand Amount" is a real copy-paste duplicate of "Due Amount" -- both
//   are bound to the exact same item.OutStandingAmt. Reproduced verbatim
//   (not corrected to a distinct Grand Total calculation).
// - Every totals value ultimately depends on item.* fields that are only
//   ever mutated by the dead selectionChangedCal() (see
//   BillingConsolidatePaymentGridScreen's disclosure on the
//   $scope.gridApi crash bug) -- so in practice these totals always show
//   their static ₹0.00 initial defaults and never change via the UI,
//   exactly as in production today.
export const BillingConsolidatePaymentFooterScreen: React.FC<BillingConsolidatePaymentFooterScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};

  const paymentTypeOptions = lookup?.PaymentType || [];
  const bankOptions = lookup?.Bank || [];
  const terminalOptions = lookup?.Terminal || [];
  const cardTypeOptions = lookup?.CardType || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const paymentTypeId = item.PaymentTypeId;
  const showBank = paymentTypeId != null && paymentTypeId !== 1;
  const showChequeNo = paymentTypeId === 2;
  const showDDNo = paymentTypeId === 3;
  const showWireTransferNo = paymentTypeId === 4;
  const showAuthCode = paymentTypeId === 5 || paymentTypeId === 6;
  const showCollectedOn = paymentTypeId === 2 || paymentTypeId === 3 || paymentTypeId === 4;
  const showTerminal = paymentTypeId === 5 || paymentTypeId === 6;
  const showChequeDate = paymentTypeId === 2;
  const showDDDate = paymentTypeId === 3;
  const showTransferredOn = paymentTypeId === 4;
  const showCardType = paymentTypeId === 5 || paymentTypeId === 6;

  return (
    <div className="col-sm-12" style={{ padding: `0 ${spacing.md}` }}>
      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 480px', minWidth: 420 }}>
          <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              <div style={fieldWrapStyle}>
                <Select
                  label="Payment Type"
                  value={item.PaymentTypeId != null ? String(item.PaymentTypeId) : ''}
                  options={paymentTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                  onChange={(v) => dispatch('paymentTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
                  required
                />
              </div>
              <div style={fieldWrapStyle}>
                <Input label="Receipt Amount" value={item.OutStandingAmt != null ? String(item.OutStandingAmt) : ''} disabled />
              </div>
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              {showBank && (
                <div style={fieldWrapStyle}>
                  <Select
                    label="Bank Name"
                    value={item.BankId != null ? String(item.BankId) : ''}
                    options={bankOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                    onChange={(v) => dispatch('bankChange', { value: v ? parseInt(String(v), 10) : undefined })}
                    required
                  />
                </div>
              )}
              {showChequeNo && (
                <div style={fieldWrapStyle}>
                  <Input label="Cheque No" value={item.ChequeNo || ''} onChange={(e) => dispatch('chequeNoChange', { value: e.target.value })} required />
                </div>
              )}
              {showDDNo && (
                <div style={fieldWrapStyle}>
                  <Input label="DD No" value={item.DDNumber || ''} onChange={(e) => dispatch('ddNumberChange', { value: e.target.value })} required />
                </div>
              )}
              {showWireTransferNo && (
                <div style={fieldWrapStyle}>
                  <Input label="Transcation No" value={item.WireTransferId || ''} onChange={(e) => dispatch('wireTransferIdChange', { value: e.target.value })} required />
                </div>
              )}
              {showAuthCode && (
                <div style={fieldWrapStyle}>
                  <Input
                    label="Auth Code"
                    value={item.AuthorizedCode || ''}
                    onChange={(e) => dispatch('authorizedCodeChange', { value: e.target.value })}
                    maxLength={8}
                    required
                  />
                </div>
              )}
              {showCollectedOn && (
                <div style={fieldWrapStyle}>
                  <DatePicker label="Collected On" value={item.CollectedOn || ''} onChange={(v) => dispatch('collectedOnChange', { value: v })} />
                </div>
              )}
              {showTerminal && (
                <div style={fieldWrapStyle}>
                  <Select
                    label="Terminal No"
                    value={item.TerminalNoId != null ? String(item.TerminalNoId) : ''}
                    options={terminalOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                    onChange={(v) => dispatch('terminalChange', { value: v ? parseInt(String(v), 10) : undefined })}
                    required
                  />
                </div>
              )}
              {showChequeDate && (
                <div style={fieldWrapStyle}>
                  <DatePicker label="Cheque Date" value={item.ChequeDate || ''} onChange={(v) => dispatch('chequeDateChange', { value: v })} />
                </div>
              )}
              {showDDDate && (
                <div style={fieldWrapStyle}>
                  <DatePicker label=" DD Date" value={item.DDDate || ''} onChange={(v) => dispatch('ddDateChange', { value: v })} />
                </div>
              )}
              {showTransferredOn && (
                <div style={fieldWrapStyle}>
                  <DatePicker label="Transferred On" value={item.WireTransferDate || ''} onChange={(v) => dispatch('wireTransferDateChange', { value: v })} />
                </div>
              )}
              {showCardType && (
                <div style={fieldWrapStyle}>
                  <Select
                    label="Card Type"
                    value={item.CardTypeId != null ? String(item.CardTypeId) : ''}
                    options={cardTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                    onChange={(v) => dispatch('cardTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: '0 1 300px', minWidth: 260 }}>
          <table style={totalsTableStyle}>
            <tbody>
              <tr>
                <td style={totalsLabelStyle}>Discount :</td>
                <td style={totalsValueStyle}>{formatCurrency(item.Discount)}</td>
              </tr>
              <tr>
                <td style={totalsLabelStyle}>Total :</td>
                <td style={totalsValueStyle}>{formatCurrency(item.BillAmount)}</td>
              </tr>
              <tr>
                <td style={totalsLabelStyle}>Round Off :</td>
                <td style={totalsValueStyle}>{formatCurrency(item.TotRndoffAmt)}</td>
              </tr>
              <tr>
                <td style={totalsLabelStyle}>Due Amount :</td>
                <td style={totalsValueStyle}>{formatCurrency(item.OutStandingAmt)}</td>
              </tr>
              <tr>
                <td style={totalsLabelStyle}>Grand Amount</td>
                <td style={totalsValueStyle}>{formatCurrency(item.OutStandingAmt)}</td>
              </tr>
              <tr>
                <td style={totalsLabelStyle}>Received :</td>
                <td style={totalsValueStyle}>{formatCurrency(item.Received)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
