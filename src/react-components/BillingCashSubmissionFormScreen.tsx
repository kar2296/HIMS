import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input, Textarea } from '../components/ui/Input';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DenominationRow {
  Id?: number;
  DenominationId?: number;
  DenominationName?: string;
  DenominationCount?: number | string;
  DenominationTotal?: number | string;
}

interface CancelledReceiptRow {
  Id?: number;
  BillNumber?: string;
  ReceiptNumber?: string;
  CancelledAmount?: number | string;
  CancelledReason?: string;
}

interface CashSubmissionItem {
  Id?: number;
  UserId?: number;
  BillingCounterId?: number;
  DepartmentId?: number;
  OpeningDate?: string;
  OpeningBalance?: number | string;
  OpeningRemarks?: string;
  ClosingDate?: string;
  ClosingBalance?: number | string;
  ClosingCard?: number | string;
  ClosingCheque?: number | string;
  ClosingRemarks?: string;
  DifferenceAmount?: number | string;
  DenominationsNetCount?: number | string;
  DenominationsNetTotal?: number | string;
  OtherDenominationsTotal?: number | string;
  UserName?: string;
  CounterName?: string;
  CounterStatus?: string;
  OpenedStatus?: boolean;
  ClosedStatus?: boolean;
}

interface Totals {
  CashSales?: number; CardSales?: number; ChequeOtherSales?: number;
  NetBankingSales?: number; UPISales?: number; AffordSales?: number;
  CashAdvanceAdj?: number; CardAdvanceAdj?: number; ChequeOtherAdvanceAdj?: number;
  NetBankingAdvanceAdj?: number; UPIAdvanceAdj?: number; AffordAdvanceAdj?: number;
  CashRefunds?: number; CardRefunds?: number; ChequeOtherRefunds?: number;
  NetBankingRefunds?: number; UPIRefunds?: number; AffordRefunds?: number;
  CashCancels?: number; CardCancels?: number; ChequeOtherCancels?: number;
  NetBankingCancels?: number; UPICancels?: number; AffordCancels?: number;
  ExpCashSales?: number; ExpCardSales?: number; ExpChequeOtherSales?: number;
  ExpNetBankingSales?: number; ExpUPISales?: number; ExpAffordSales?: number;
  NetCash?: number; NetCard?: number; NetChequeOther?: number;
  NetNetBanking?: number; NetUPI?: number; NetAfford?: number; NetSubmission?: number;
}

interface BillingCashSubmissionFormScreenProps {
  reactProps?: {
    item?: CashSubmissionItem;
    lookup?: { Department?: LookupItem[]; BillingCounter?: LookupItem[] };
    DefinedDenominations?: DenominationRow[];
    UserCounterCancelledReceipts?: CancelledReceiptRow[];
    canShowApproveBtn?: boolean;
    canShowAuthorizeBtn?: boolean;
    canShowPrintBtn?: boolean;
    totals?: Totals;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(val: number | string | undefined | null): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Reproduces $scope.numberonly verbatim (cashsubmission-form.js): a
// DIFFERENT keyCode allow-list than the numberonlyKeyDown helper used
// elsewhere in the migration (Delete/Backspace/Tab/Escape/Enter/NumpadDot/
// Period, plus Ctrl/Cmd+A and arrow keys). Kept for fidelity even though,
// in this screen, every field wired to it ends up disabled once a counter
// record has loaded.
function cashSubmissionNumberOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const keyCode = e.keyCode;
  if ([46, 8, 9, 27, 13, 110, 190].indexOf(keyCode) !== -1 ||
    (keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    (keyCode >= 35 && keyCode <= 40)) {
    return;
  }
  if (e.shiftKey || keyCode < 48 || keyCode > 57) {
    e.preventDefault();
  }
}

const panelStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`, borderRadius: '4px', padding: spacing.md,
  marginBottom: spacing.md, background: colors.surface,
};
const legendStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '14px', color: colors.textMain, marginBottom: spacing.sm,
  paddingBottom: spacing.xs, borderBottom: `1px solid ${colors.border}`,
};
const fieldRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs,
};
const fieldLabelStyle: React.CSSProperties = {
  flex: '0 0 45%', fontSize: '13px', color: colors.textMain, fontFamily: typography.fontFamily,
};
const fieldControlStyle: React.CSSProperties = { flex: '1 1 55%' };

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily,
  fontSize: '12px', fontWeight: 600, color: colors.textMain, borderBottom: `2px solid ${colors.border}`,
  background: '#a0bfd44f',
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily, fontSize: '13px',
  color: colors.textMain, borderBottom: `1px solid ${colors.border}`,
};
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

const bannerCellLabel: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily, fontSize: '12px',
  color: colors.textMain, whiteSpace: 'nowrap',
};
const bannerCellValue: React.CSSProperties = {
  ...bannerCellLabel, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
};
const bannerCellNegative: React.CSSProperties = { ...bannerCellValue, color: '#d32f2f' };
const bannerRowStyle: React.CSSProperties = { borderBottom: `1px solid ${colors.border}` };

function BannerRow({ cells }: { cells: Array<{ label: string; value: React.ReactNode; negative?: boolean }> }) {
  return (
    <tr style={bannerRowStyle}>
      {cells.map((c, i) => (
        <React.Fragment key={i}>
          <td style={bannerCellLabel}>{c.label}</td>
          <td style={c.negative ? bannerCellNegative : bannerCellValue}>{c.value}</td>
        </React.Fragment>
      ))}
    </tr>
  );
}

// UI-MODERNIZATION RETROFIT (Billing / Cash Submissions Form,
// app.cashsubmission-form) -- single-mount React bridge. See
// cashsubmission-form.html's top-of-file disclosure comment for the full
// rationale and the complete list of confirmed pre-existing quirks/bugs
// (dead Start/Close/Revert buttons, always-visible Print button,
// duplicate-fetch-on-load, permanently-unrendered Expenses/Payment*
// arrays, literal-English translate keys throughout the summary table,
// borrowed billing.billingcounter.* namespace on the Cancelled Bills
// table, hardcoded literal status text) -- all reproduced verbatim here,
// not fixed.
export const BillingCashSubmissionFormScreen: React.FC<BillingCashSubmissionFormScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const lookup = reactProps?.lookup || {};
  const denominations = reactProps?.DefinedDenominations || [];
  const cancelledReceipts = reactProps?.UserCounterCancelledReceipts || [];
  const canShowApproveBtn = !!reactProps?.canShowApproveBtn;
  const canShowAuthorizeBtn = !!reactProps?.canShowAuthorizeBtn;
  const canShowPrintBtn = !!reactProps?.canShowPrintBtn;
  const t = reactProps?.totals || {};

  const departmentOptions = lookup.Department || [];
  const counterOptions = lookup.BillingCounter || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, ...typography.h4 }}>Manage User Cash Submissions</h4>
        <h4 style={{ margin: 0, color: '#f02f25', fontSize: '15px' }}>
          {item.UserName} | {item.CounterName} | {item.CounterStatus}
        </h4>
      </div>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 40%', minWidth: 340 }}>
          {/* Opening panel. Original also carries a dead #startbtnsubmit
              button (ng-show="canShowStartBtn") that can never render --
              see disclosure comment; omitted here as it was never visible. */}
          <div style={panelStyle}>
            <div style={legendStyle}>Opening</div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Start Date &amp; Time</label>
              <div style={fieldControlStyle}>
                <DatePicker value={item.OpeningDate || ''} onChange={() => {}} disabled includeTime />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Department</label>
              <div style={fieldControlStyle}>
                <Select
                  value={item.DepartmentId != null ? String(item.DepartmentId) : ''}
                  options={departmentOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Counter</label>
              <div style={fieldControlStyle}>
                <Select
                  value={item.BillingCounterId != null ? String(item.BillingCounterId) : ''}
                  options={counterOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                  onChange={(v) => dispatch('billingCounterChange', { value: v ? parseInt(String(v), 10) : undefined })}
                  disabled={!!item.OpenedStatus}
                />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Opening Cash</label>
              <div style={fieldControlStyle}>
                <Input
                  value={item.OpeningBalance != null ? String(item.OpeningBalance) : ''}
                  onChange={(e) => dispatch('openingBalanceChange', { value: e.target.value })}
                  onKeyDown={cashSubmissionNumberOnlyKeyDown}
                  disabled={!!item.OpenedStatus}
                />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Remarks</label>
              <div style={fieldControlStyle}>
                <Textarea
                  rows={3}
                  maxLength={4000}
                  value={item.OpeningRemarks || ''}
                  onChange={(e) => dispatch('openingRemarksChange', { value: e.target.value })}
                  disabled={!!item.OpenedStatus}
                />
              </div>
            </div>
          </div>

          {/* Closing panel. Original also carries dead #closebtnsubmit
              (canShowCloseBtn) and #revertbtnsubmit (canShowRevertBtn)
              buttons -- neither flag/handler exists in the controller, so
              neither can ever render; omitted here. */}
          <div style={panelStyle}>
            <div style={legendStyle}>Closing</div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>End Date &amp; Time</label>
              <div style={fieldControlStyle}>
                <DatePicker value={item.ClosingDate || ''} onChange={() => {}} disabled includeTime />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Closing Cash</label>
              <div style={fieldControlStyle}>
                <Input value={item.ClosingBalance != null ? String(item.ClosingBalance) : ''} onChange={() => {}} disabled />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Credit / Debit Card</label>
              <div style={fieldControlStyle}>
                <Input value={item.ClosingCard != null ? String(item.ClosingCard) : ''} onChange={() => {}} disabled />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Cheque / DD</label>
              <div style={fieldControlStyle}>
                <Input value={item.ClosingCheque != null ? String(item.ClosingCheque) : ''} onChange={() => {}} disabled />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Remarks</label>
              <div style={fieldControlStyle}>
                <Textarea
                  rows={3}
                  maxLength={4000}
                  value={item.ClosingRemarks || ''}
                  onChange={(e) => dispatch('closingRemarksChange', { value: e.target.value })}
                  disabled={!!item.ClosedStatus}
                />
              </div>
            </div>
          </div>

          {/* Cancelled Bills table -- headers use the borrowed
              billing.billingcounter.* namespace, reproduced verbatim. */}
          <div style={panelStyle}>
            <div style={legendStyle}>Cancelled Bills (or) Receipts</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Bill / Receipt Number</th>
                  <th style={thStyle}>Cancelled Amount</th>
                  <th style={thStyle}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {cancelledReceipts.length === 0 ? (
                  <tr><td style={tdStyle} colSpan={3}>No records</td></tr>
                ) : (
                  cancelledReceipts.map((row, idx) => (
                    <tr key={row.Id != null ? row.Id : idx}>
                      <td style={tdStyle}>
                        {row.BillNumber ? `${row.BillNumber} / ${row.ReceiptNumber}` : row.ReceiptNumber}
                      </td>
                      <td style={tdRightStyle}>{formatCurrency(row.CancelledAmount)}</td>
                      <td style={tdStyle}>{row.CancelledReason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ flex: '1 1 55%', minWidth: 420 }}>
          {/* Denominations -- every field (including the count input) is
              always disabled in the original; CalculateTotal()'s
              ng-change on the count column is therefore unreachable in
              practice, and is not reproduced here. */}
          <div style={panelStyle}>
            <div style={legendStyle}>Denominations</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Denomination</th>
                  <th style={thStyle}>Number</th>
                  <th style={thStyle}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {denominations.map((d, idx) => (
                  <tr key={d.Id != null ? d.Id : idx}>
                    <td style={tdStyle}>{d.DenominationName}</td>
                    <td style={tdRightStyle}>
                      <Input value={d.DenominationCount != null ? String(d.DenominationCount) : ''} onChange={() => {}} disabled />
                    </td>
                    <td style={tdRightStyle}>
                      <Input value={d.DenominationTotal != null ? String(d.DenominationTotal) : ''} onChange={() => {}} disabled />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>Amount</td>
                  <td style={tdRightStyle}>
                    <Input value={item.DenominationsNetCount != null ? String(item.DenominationsNetCount) : ''} onChange={() => {}} disabled />
                  </td>
                  <td style={tdRightStyle}>
                    <Input value={item.DenominationsNetTotal != null ? String(item.DenominationsNetTotal) : ''} onChange={() => {}} disabled />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary figures panel (right-third of original template). */}
          <div style={panelStyle}>
            <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 45%' }}>
                <div style={fieldRowStyle}>
                  <label style={fieldLabelStyle}>Opening</label>
                  <div style={fieldControlStyle}>
                    <Input value={item.OpeningBalance != null ? String(item.OpeningBalance) : ''} onChange={() => {}} disabled />
                  </div>
                </div>
                <div style={fieldRowStyle}>
                  <label style={fieldLabelStyle}>Closing</label>
                  <div style={fieldControlStyle}>
                    <Input value={item.ClosingBalance != null ? String(item.ClosingBalance) : ''} onChange={() => {}} disabled />
                  </div>
                </div>
                <div style={fieldRowStyle}>
                  <label style={fieldLabelStyle}>Difference</label>
                  <div style={fieldControlStyle}>
                    <Input value={item.DifferenceAmount != null ? String(item.DifferenceAmount) : ''} onChange={() => {}} disabled />
                  </div>
                </div>
              </div>
              <div style={{ flex: '1 1 45%' }}>
                <div style={fieldRowStyle}>
                  <label style={fieldLabelStyle}>Denominations</label>
                  <div style={fieldControlStyle}>
                    <Input value={item.DenominationsNetTotal != null ? String(item.DenominationsNetTotal) : ''} onChange={() => {}} disabled />
                  </div>
                </div>
                <div style={fieldRowStyle}>
                  <label style={fieldLabelStyle}>Other Denoms#</label>
                  <div style={fieldControlStyle}>
                    <Input value={item.OtherDenominationsTotal != null ? String(item.OtherDenominationsTotal) : ''} onChange={() => {}} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* #bannerdetails summary table -- see disclosure comment for the
          full list of literal-English translate-key cells reproduced
          below (marked inline). */}
      <div style={{ overflowX: 'auto', marginTop: spacing.md }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 900 }}>
          <tbody>
            <BannerRow cells={[
              { label: 'Total Cash', value: formatCurrency(t.CashSales) },
              { label: 'Total Card', value: formatCurrency(t.CardSales) },
              { label: 'Total Cheque/Other', value: formatCurrency(t.ChequeOtherSales) },
              { label: 'NetBanking Sales', value: formatCurrency(t.NetBankingSales) },
              { label: 'UPI Sales', value: formatCurrency(t.UPISales) },
              { label: 'Afford Sales', value: formatCurrency(t.AffordSales) },
            ]} />
            <BannerRow cells={[
              { label: 'Advance Adj Cash', value: formatCurrency(t.CashAdvanceAdj) },
              { label: 'Advance Adj Card', value: formatCurrency(t.CardAdvanceAdj) },
              { label: 'Advance Adj Cheque', value: formatCurrency(t.ChequeOtherAdvanceAdj) },
              { label: 'Advance Adj NetBanking', value: formatCurrency(t.NetBankingAdvanceAdj) },
              { label: 'Advance Adj UPI', value: formatCurrency(t.UPIAdvanceAdj) },
              { label: 'Advance Adj Afford', value: formatCurrency(t.AffordAdvanceAdj) },
            ]} />
            <BannerRow cells={[
              { label: 'Refunded Cash', value: <>-{formatCurrency(t.CashRefunds)}</>, negative: true },
              { label: 'Refunded Card', value: <>-{formatCurrency(t.CardRefunds)}</>, negative: true },
              { label: 'Refunded Cheque/Other', value: <>-{formatCurrency(t.ChequeOtherRefunds)}</>, negative: true },
              { label: 'Refunds NetBanking', value: <>-{formatCurrency(t.NetBankingRefunds)}</>, negative: true },
              { label: 'Refunds UPI', value: <>-{formatCurrency(t.UPIRefunds)}</>, negative: true },
              { label: 'Refunds Afford', value: <>-{formatCurrency(t.AffordRefunds)}</>, negative: true },
            ]} />
            <BannerRow cells={[
              { label: 'Cancelled Cash', value: formatCurrency(t.CashCancels), negative: true },
              { label: 'Cancelled Card', value: formatCurrency(t.CardCancels), negative: true },
              { label: 'Other Cancellations', value: formatCurrency(t.ChequeOtherCancels), negative: true },
              { label: 'NetBanking Cancels', value: formatCurrency(t.NetBankingCancels), negative: true },
              { label: 'UPI Cancels', value: formatCurrency(t.UPICancels), negative: true },
              { label: 'Afford Cancels', value: formatCurrency(t.AffordCancels), negative: true },
            ]} />
            <BannerRow cells={[
              { label: 'Expense Cash', value: <>-{formatCurrency(t.ExpCashSales)}</>, negative: true },
              { label: 'Expense Card', value: <>-{formatCurrency(t.ExpCardSales)}</>, negative: true },
              { label: 'Expense Others', value: <>-{formatCurrency(t.ExpChequeOtherSales)}</>, negative: true },
              { label: 'Expense NetBanking', value: <>-{formatCurrency(t.ExpNetBankingSales)}</>, negative: true },
              { label: 'Expense UPI', value: <>-{formatCurrency(t.ExpUPISales)}</>, negative: true },
              { label: 'Expense Afford', value: <>-{formatCurrency(t.ExpAffordSales)}</>, negative: true },
            ]} />
            {/* Doctor Cash/Card/Other-Pay row is HTML-commented out in the
                original template -- not reproduced. */}
            <BannerRow cells={[
              { label: 'Net Cash', value: formatCurrency(t.NetCash) },
              { label: 'Net Card', value: formatCurrency(t.NetCard) },
              { label: 'Net Others', value: formatCurrency(t.NetChequeOther) },
              { label: 'Net NetBanking', value: formatCurrency(t.NetNetBanking) },
              { label: 'Net UPI', value: formatCurrency(t.NetUPI) },
              { label: 'Net Afford', value: formatCurrency(t.NetAfford) },
            ]} />
            <tr>
              <td colSpan={6}></td>
              <td style={{ ...bannerCellLabel, background: '#E91E63', color: '#fff', fontWeight: 600 }}>Net Submission</td>
              <td style={{ ...bannerCellValue, background: '#E91E63', color: '#fff' }}>{formatCurrency(t.NetSubmission)}</td>
              <td style={{ ...bannerCellLabel, background: '#E91E63', color: '#fff', fontWeight: 600 }}>Shortage Amount</td>
              <td style={{ ...bannerCellValue, background: '#E91E63', color: '#fff' }}>{formatCurrency(item.DifferenceAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
        <button type="button" className="btn pyr-color10 btn-sm" onClick={() => dispatch('back')}>
          <i className="fa fa-angle-left" aria-hidden="true"></i>&nbsp;&nbsp;Back
        </button>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {canShowApproveBtn && (
            <button type="button" className="draftbutton" onClick={() => dispatch('approve')}>Approve</button>
          )}
          {canShowAuthorizeBtn && (
            <button type="button" className="draftbutton" onClick={() => dispatch('authorize')}>Authorize</button>
          )}
          {/* canShowPrintBtn is hardcoded true and never reassigned in the
              original controller -- always rendered, per the disclosure
              comment above. */}
          {canShowPrintBtn && (
            <button type="button" className="draftbutton" onClick={() => dispatch('print')}>Print</button>
          )}
        </div>
      </div>
    </div>
  );
};
