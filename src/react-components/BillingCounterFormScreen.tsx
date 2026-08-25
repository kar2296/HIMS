import React, { useEffect } from 'react';
import { Select } from '../components/ui/Select';
import { spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
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
  UserName?: string;
  CounterName?: string;
  CounterStatus?: string;
  CounterStartStatus?: string;
  DepartmentId?: number;
  BillingCounterId?: number;
  OpeningDate?: string;
  ClosingDate?: string;
  OpeningBalance?: number;
  OpeningRemarks?: string;
  ClosingRemarks?: string;
  DenominationsNetCount?: number;
  DenominationsNetTotal?: number;
  OpenedStatus?: boolean;
  ClosedStatus?: boolean;
  SubmittedStatus?: boolean;
}

interface CurrentContext {
  id?: number;
}

interface BillingCounterFormScreenProps {
  reactProps?: {
    item?: Item;
    currentcontext?: CurrentContext;
    lookup?: { Department?: LookupItem[]; BillingCounter?: LookupItem[] };
    DefinedDenominations?: DenominationRow[];
    CounterRunning?: boolean;
    canShowStartBtn?: boolean;
    canShowCloseBtn?: boolean;
    canShowRevertBtn?: boolean;
    canShowSaveBtn?: boolean;
    canShowSubmitBtn?: boolean;
    canShowPrintBtn?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function n(val: number | string | undefined | null): number {
  const num = parseFloat(String(val));
  return isNaN(num) ? 0 : num;
}

function formatDateTime(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(date.getDate())}-${months[date.getMonth()]}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
  color: '#000', textAlign: 'center', fontWeight: 700, border: '1px solid #bbaeae',
};
const panelStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: 4, padding: spacing.md, marginBottom: spacing.md,
};
const legendStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  ...typography.label, fontWeight: 600, marginBottom: spacing.sm,
};
const fieldRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs,
};
const fieldLabelStyle: React.CSSProperties = { ...typography.label, minWidth: 160 };

// UI-MODERNIZATION RETROFIT (Billing / Billing Counter Form (cash counter
// start/close/revert/save/submit), app.billingcounter-form,
// BillingCounterFormController) -- single-mount React replacement. Full
// dependency investigation of the 949-line controller and 601-line template
// confirmed no native-only widgets and no utl.Validator.validate($scope)
// call anywhere (see billingcounter-form.html's top-of-file disclosure for
// the full rationale), so per the established single-mount criterion this
// is ONE component, not a hybrid split. AngularJS remains authoritative for
// every real API call, the Start/Close/Revert/Submit confirm-dialog chains,
// the Close-button's receipts/LHRC/vouchers/refunds aggregation chain, and
// every denomination total calculation -- React only renders reactProps and
// dispatches action names via handleReactAction. This is the real, fully-
// wired sibling of bankstatementform.js's dead canShowStartBtn/
// canShowCloseBtn/canShowRevertBtn/canShowSaveBtn/canShowSubmitBtn/
// canShowPrintBtn/CounterRunning flags -- here they genuinely drive button
// visibility.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - Start/Close/Revert button labels are hardcoded literal English text in
//   the original markup (no translate attribute at all) -- reproduced as
//   literals, not looked up via i18n.
// - Print button label is a hardcoded literal "Print" (same quirk
//   confirmed on bankstatementform.js's Print button: the original used
//   translate="Print", a non-existent i18n key).
// - Back button carries a real angular-hotkeys "alt+b" shortcut in the
//   original markup, which cannot run as an Angular directive attribute on
//   a React-rendered button -- reproduced with an equivalent global
//   keydown listener (Alt+B) dispatching the same 'back' action.
// - Department select and both date fields are always-disabled
//   (ng-disabled="true" literally in the original) regardless of counter
//   state -- reproduced as always-disabled, read-only display fields.
export const BillingCounterFormScreen: React.FC<BillingCounterFormScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup, DefinedDenominations = [],
    CounterRunning, canShowStartBtn, canShowCloseBtn, canShowRevertBtn,
    canShowSaveBtn, canShowSubmitBtn, canShowPrintBtn,
  } = reactProps || {};

  const departmentOptions = lookup?.Department || [];
  const counterOptions = lookup?.BillingCounter || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Reproduces the original hotkey="{'alt+b': backToList}" (angular-hotkeys)
  // directive, which cannot attach to a React-rendered button.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        dispatch('back');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, ...typography.h4 }}>Manage User Billing Counters</h4>
        {!CounterRunning ? (
          <h4 style={{ margin: 0, color: '#bf219d', ...typography.h4 }}>
            {item.UserName} | {item.CounterName} | {item.CounterStatus}
          </h4>
        ) : (
          <h4 style={{ margin: 0, color: '#bf2121', ...typography.h4 }}>{item.CounterStartStatus}</h4>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', minWidth: 360 }}>
          <div style={panelStyle}>
            <div style={legendStyle}>
              <span>Opening</span>
              {canShowStartBtn && (
                <button type="button" id="startbtnsubmit" className="draftbutton" onClick={() => dispatch('start')}>
                  Start
                </button>
              )}
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Start Date &amp; Time</label>
              <input type="text" className="form-control" style={{ maxWidth: 220 }} value={formatDateTime(item.OpeningDate)} disabled readOnly />
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Department</label>
              <div style={{ maxWidth: 220, flex: 1 }}>
                <Select
                  value={item.DepartmentId != null ? String(item.DepartmentId) : ''}
                  disabled
                  options={departmentOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                  onChange={() => { /* always disabled in the original (ng-disabled="true") */ }}
                />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Counter</label>
              <div style={{ maxWidth: 220, flex: 1 }}>
                <Select
                  value={item.BillingCounterId != null ? String(item.BillingCounterId) : ''}
                  disabled={!!item.OpenedStatus}
                  options={counterOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                  onChange={(v) => dispatch('counterChange', { value: v ? parseInt(String(v), 10) : undefined })}
                />
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Opening Cash</label>
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 220 }}
                value={item.OpeningBalance ?? ''}
                disabled={!!item.OpenedStatus}
                onKeyDown={numberonlyKeyDown}
                onChange={(e) => dispatch('openingBalanceChange', { value: n(e.target.value) })}
              />
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Remarks</label>
              <textarea
                rows={3}
                className="notes-textarea"
                style={{ width: '100%', maxWidth: 220 }}
                maxLength={4000}
                value={item.OpeningRemarks || ''}
                disabled={!!item.OpenedStatus}
                onChange={(e) => dispatch('openingRemarksChange', { value: e.target.value })}
              />
            </div>
          </div>

          <div style={panelStyle}>
            <div style={legendStyle}>
              <span>Closing</span>
              <div style={{ display: 'flex', gap: spacing.xs }}>
                {canShowCloseBtn && (
                  <button type="button" id="closebtnsubmit" className="btn btn-danger" onClick={() => dispatch('close')}>
                    Close
                  </button>
                )}
                {canShowRevertBtn && (
                  <button type="button" id="revertbtnsubmit" className="btn btn-danger" onClick={() => dispatch('revert')}>
                    Revert
                  </button>
                )}
              </div>
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>End Date &amp; Time</label>
              <input type="text" className="form-control" style={{ maxWidth: 220 }} value={formatDateTime(item.ClosingDate)} disabled readOnly />
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Remarks</label>
              <textarea
                rows={3}
                className="notes-textarea"
                style={{ width: '100%', maxWidth: 220 }}
                maxLength={4000}
                value={item.ClosingRemarks || ''}
                disabled={!!item.ClosedStatus}
                onChange={(e) => dispatch('closingRemarksChange', { value: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 420px', minWidth: 360 }}>
          <div style={panelStyle}>
            <div style={legendStyle}><span>Denominations</span></div>
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
                    <td style={{ ...tdStyle, fontWeight: 700 }} colSpan={2}>Amount</td>
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

          <div style={panelStyle}>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Opening</label>
              <input type="text" className="form-control" style={{ maxWidth: 220 }} value={item.OpeningBalance ?? 0} disabled readOnly />
            </div>
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>Denominations</label>
              <input type="text" className="form-control" style={{ maxWidth: 220 }} value={item.DenominationsNetTotal ?? 0} disabled readOnly />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.lg, paddingTop: spacing.md, borderTop: '1px solid #e2e8f0' }}>
        <button type="button" className="btn pyr-color10 btn-sm" onClick={() => dispatch('back')}>
          <i className="fa fa-angle-left" aria-hidden="true"></i>&nbsp;&nbsp;
          <span className="btn-fontsize">Back</span>
        </button>
        <div style={{ display: 'flex', gap: spacing.xs }}>
          {canShowSaveBtn && (
            <button id="btnSavetForm" type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('save')}>
              Save
            </button>
          )}
          {canShowSubmitBtn && (
            <button id="btnSubmitForm" type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('submit')}>
              Submit
            </button>
          )}
          {canShowPrintBtn && (
            <button id="btnPrintForm" type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('print')}>
              Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
