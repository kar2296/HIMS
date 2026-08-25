import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  FromBillDate?: string | Date;
  ToBillDate?: string | Date;
  DisableFromBillDate?: boolean;
  DisableToBillDate?: boolean;
}

interface StatementRow {
  Name?: string;
  Cash?: number;
  Card?: number;
  Others?: number;
  LHRC?: number;
  Voucher?: number;
  NetCash?: number;
}

interface DenominationRow {
  DenominationId?: number;
  DenominationName?: string;
  DenominationValue?: number;
  DenominationCount?: number;
  DenominationTotal?: number;
}

interface Item {
  Id?: number;
  FilterDepartmentId?: number;
  FilterUserId?: number;
  FetalAmount?: number;
  DenominationsNetCount?: number;
  DenominationsNetTotal?: number;
  DifferenceAmount?: number;
  SubmittedStatus?: boolean;
}

interface CurrentContext {
  id?: number;
}

interface BillingBankStatementFormScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { Department?: LookupItem[]; User?: LookupItem[] };
    item?: Item;
    currentcontext?: CurrentContext;
    StatementData?: StatementRow[];
    DefinedDenominations?: DenominationRow[];
    NetCashAmt?: number;
    TotalCashInHand?: number;
    TotalCashAmount?: number;
    TotalCardAmount?: number;
    OverAllNetCash?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function n(val: number | string | undefined | null): number {
  const num = parseFloat(String(val));
  return isNaN(num) ? 0 : num;
}

// FromBillDate/ToBillDate are bound via ng-date-object (a real JS Date
// object), the same confirmed convention as PrescriptionDate/ReviewDate
// elsewhere in this migration -- despite the controller's initial seed
// value coming from $filter('date')(...) as a formatted string, the
// datetime-picker directive's own parsers/formatters convert it to a Date.
// Converts to the value a native datetime-local input expects.
function toDateTimeInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Reproduces $scope.numberonly(e) verbatim: allows Backspace/Tab, Ctrl/Cmd+A,
// Home/End/Left/Right/Up/Down, blocks Shift and any non-digit keycode.
function numberonlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const keyCode = e.keyCode;
  if ([8, 9].indexOf(keyCode) !== -1 ||
    (keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    (keyCode >= 35 && keyCode <= 40)) {
    return;
  }
  if (e.shiftKey || keyCode < 48 || keyCode > 57) {
    e.preventDefault();
  }
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily,
  fontSize: '12px', fontWeight: 600, color: '#fff', background: '#0287a5b8',
  letterSpacing: '1px', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily, fontSize: '13px',
  color: colors.textMain, borderBottom: `1px solid ${colors.border}`,
};
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
const fieldRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md,
  padding: `${spacing.xs} 0`,
};
const fieldLabelStyle: React.CSSProperties = { ...typography.label, color: colors.textMain, minWidth: 180 };

// UI-MODERNIZATION RETROFIT (Billing / Bank Statement Form, app.bankstatementform,
// bankstatementFormController) -- single-mount React replacement. Full
// dependency investigation of the 906-line controller and 346-line template
// confirmed no native-only widgets and no utl.Validator.validate($scope) call
// anywhere (see bankstatementform.html's top-of-file disclosure for the full
// rationale), so per the established single-mount criterion this is ONE
// component, not a hybrid split. AngularJS remains authoritative for every
// real API call, the Submit -> confirm -> save chain, and every totals
// calculation (StatementAmt/CalculateTotal/CalculateNetTotal/
// CalculateLoadedData) -- React only renders reactProps and dispatches
// action names via handleReactAction.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - Print button label is a hardcoded literal "Print" (the original used
//   translate="Print" as a non-existent i18n key, which angular-translate's
//   missing-key fallback rendered as the literal key text) -- reproduced as
//   a literal string, not looked up via i18n.
// - Date-field disabled state is bound to currentfilter.DisableFromBillDate /
//   DisableToBillDate (not currentcontext.id) -- see the HTML disclosure for
//   why: a duplicate ng-disabled attribute in the original markup meant the
//   first one silently won.
// - Department/User filters and both date fields are disabled once
//   currentcontext.id is set for a genuinely different reason (loading an
//   existing statement disables them via DisableFromBillDate/DisableToBillDate
//   being set together in LoadOldData) -- Department/User selects use
//   currentcontext.id directly per the original markup (no duplicate
//   attribute existed on those elements).
export const BillingBankStatementFormScreen: React.FC<BillingBankStatementFormScreenProps> = ({ reactProps, onAction }) => {
  const {
    currentfilter = {}, lookup, item = {}, currentcontext = {}, StatementData = [],
    DefinedDenominations = [], NetCashAmt = 0, TotalCashInHand = 0, TotalCashAmount = 0,
    TotalCardAmount = 0, OverAllNetCash = 0,
  } = reactProps || {};

  const departmentOptions = lookup?.Department || [];
  const userOptions = lookup?.User || [];
  const isExisting = !!currentcontext.id;

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <h4 style={{ margin: `0 0 ${spacing.md}`, ...typography.h4 }}>Manage Bank Statements</h4>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: spacing.lg }}>
        <div style={{ minWidth: 190 }}>
          <DatePicker
            label="From Date"
            includeTime
            value={toDateTimeInputValue(currentfilter.FromBillDate)}
            disabled={!!currentfilter.DisableFromBillDate}
            onChange={(v) => dispatch('fromDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 190 }}>
          <DatePicker
            label="To Date"
            includeTime
            value={toDateTimeInputValue(currentfilter.ToBillDate)}
            disabled={!!currentfilter.DisableToBillDate}
            onChange={(v) => dispatch('toDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Department"
            value={item.FilterDepartmentId != null ? String(item.FilterDepartmentId) : ''}
            disabled={isExisting}
            options={departmentOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('departmentChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="User"
            value={item.FilterUserId != null ? String(item.FilterUserId) : ''}
            disabled={isExisting}
            options={userOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('userChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        {!isExisting && (
          <button type="button" className="draftbutton" style={{ marginBottom: 2 }} onClick={() => dispatch('fetch')}>
            Fetch
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 560px', minWidth: 480 }}>
          <div style={{ ...typography.label, textAlign: 'center', background: '#EFEFEF', color: '#373737', padding: spacing.xs, fontWeight: 600 }}>
            Closing
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Users</th>
                  <th style={thStyle}>Cash</th>
                  <th style={thStyle}>Card</th>
                  <th style={thStyle}>Others</th>
                  <th style={thStyle}>LHRC</th>
                  <th style={thStyle}>Voucher</th>
                  <th style={thStyle}>NetCash</th>
                </tr>
              </thead>
              <tbody>
                {StatementData.map((stmt, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{stmt.Name}</td>
                    <td style={tdRightStyle}>{stmt.Cash}</td>
                    <td style={tdRightStyle}>{stmt.Card}</td>
                    <td style={tdRightStyle}>{stmt.Others}</td>
                    <td style={tdRightStyle}>{stmt.LHRC}</td>
                    <td style={tdRightStyle}>{stmt.Voucher}</td>
                    <td style={tdRightStyle}>{stmt.NetCash}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>Total</td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdRightStyle, fontWeight: 600 }}>{NetCashAmt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ flex: '1 1 380px', minWidth: 340 }}>
          <div style={{ ...typography.label, textAlign: 'center', background: '#EFEFEF', color: '#373737', padding: spacing.xs, fontWeight: 600 }}>
            Denominations
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} colSpan={2}>Denomination</th>
                  <th style={thStyle}>Number</th>
                  <th style={thStyle}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {DefinedDenominations.map((d, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle} colSpan={2}>{d.DenominationName}</td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        className="form-control"
                        value={d.DenominationCount ?? 0}
                        disabled={!!item.SubmittedStatus}
                        onKeyDown={numberonlyKeyDown}
                        onChange={(e) => dispatch('denominationCountChange', { index: idx, value: n(e.target.value) })}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input type="text" className="form-control" value={d.DenominationTotal ?? 0} disabled readOnly />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 600 }} colSpan={2}>Amount</td>
                  <td style={tdStyle}>
                    <input type="text" className="form-control" value={item.DenominationsNetCount ?? 0} disabled readOnly />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" className="form-control" value={item.DenominationsNetTotal ?? 0} disabled readOnly />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap', marginTop: spacing.lg }}>
        <div style={{ flex: '1 1 380px', minWidth: 340 }}>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Fetal Amount</label>
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: 220 }}
              value={item.FetalAmount ?? ''}
              disabled={(item.Id ?? 0) > 0}
              onKeyDown={numberonlyKeyDown}
              onChange={(e) => dispatch('fetalAmountChange', { value: n(e.target.value) })}
            />
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Total Inhand Cash</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={TotalCashInHand} disabled readOnly />
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>OverAll NetCash</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={OverAllNetCash} disabled readOnly />
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Total Cash Amount</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={TotalCashAmount} disabled readOnly />
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Total Card Amount</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={TotalCardAmount} disabled readOnly />
          </div>
        </div>
        <div style={{ flex: '1 1 380px', minWidth: 340 }}>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Denominations</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={item.DenominationsNetTotal ?? 0} disabled readOnly />
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Amount Difference</label>
            <input type="text" className="form-control" style={{ maxWidth: 220 }} value={item.DifferenceAmount ?? 0} disabled readOnly />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
        <button type="button" id="btnSubmit" className="btn pyr-color10 btn-sm" onClick={() => dispatch('back')}>
          Back
        </button>
        <div>
          {!isExisting && (
            <button type="button" className="draftbutton" onClick={() => dispatch('submit')}>
              Submit
            </button>
          )}
          {isExisting && (
            <button type="button" id="btnPrintForm" className="draftbutton" onClick={() => dispatch('print')}>
              Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
