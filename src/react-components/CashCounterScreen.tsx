import React, { useEffect } from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input, Textarea } from '../components/ui/Input';
import { colors, spacing, typography } from '../components/ui/tokens';

// Cash Counter (app.cashcounter, CashCounterController) — React view.
//
// The AngularJS controller still owns all data loading, calculations and saving. This
// component only renders the view model built by $scope.buildCashCounterReactProps()
// (new bridge code at the end of cashcounter.js) and reports user input through
// onAction(...), which the controller routes to its existing functions (Start, Close,
// Revert, Save, Submit, print, backToList, CalculateTotal). Labels arrive already
// translated and amounts already formatted by the app's displaycurrency filter, so the
// text matches the AngularJS screen exactly.

interface LookupItem { Id: number; Text: string }

interface DenominationRow {
  name: string;
  count: string;
  total: string;
}

interface CancelledRow {
  billReceipt: string;
  amount: string;
  reason: string;
}

interface BannerCell { label: string; value: string; negative?: boolean; highlight?: boolean }

export interface CashCounterViewModel {
  labels: Record<string, string>;
  header: { userName: string; counterName: string; counterStatus: string };
  item: {
    openingDate: string;
    closingDate: string;
    departmentId: number | null;
    billingCounterId: number | null;
    openingBalance: string;
    closingBalance: string;
    comments: string;
    differenceAmount: string;
    denominationsNetCount: string;
    denominationsNetTotal: string;
    submitted: boolean;
  };
  lookup: { Department: LookupItem[]; BillingCounter: LookupItem[] };
  denominations: DenominationRow[];
  cancelled: CancelledRow[];
  flags: { start: boolean; close: boolean; revert: boolean; save: boolean; submit: boolean; print: boolean };
  banner: BannerCell[][];
  /** True while a save (Start/Stop/Revert/Save/Submit) is in progress; those actions are disabled. */
  busy?: boolean;
}

export interface CashCounterScreenProps {
  reactProps?: CashCounterViewModel;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

/** Same key filter as $scope.numberonly: digits, Backspace, Tab, Home/End/arrows, Ctrl/Cmd+A. */
function numberOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const k = e.keyCode;
  if (k === 8 || k === 9 || (k === 65 && (e.ctrlKey || e.metaKey)) || (k >= 35 && k <= 40)) return;
  if (e.shiftKey || k < 48 || k > 57) e.preventDefault();
}

/** ng-pattern="/^\d+$/" equivalent for pasted text: keep digits only. */
const digitsOnly = (v: string) => v.replace(/\D+/g, '');

const panel: React.CSSProperties = {
  border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.surface, marginBottom: spacing.md,
};
const legend: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm,
  padding: `${spacing.xs} ${spacing.md}`, background: '#efefef', color: '#373737', fontWeight: 600,
  minHeight: 40, borderBottom: `1px solid ${colors.border}`, borderRadius: '6px 6px 0 0',
};
const panelBody: React.CSSProperties = { padding: spacing.md };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' };
const rowLabel: React.CSSProperties = { flex: '1 1 140px', fontSize: 13, color: colors.textMain };
const rowControl: React.CSSProperties = { flex: '1 1 180px', minWidth: 0 };
const th: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, fontSize: 12, fontWeight: 600,
  color: '#fff', background: '#0287a5', letterSpacing: 0.5,
};
const td: React.CSSProperties = { padding: `${spacing.xs} ${spacing.sm}`, fontSize: 13, color: colors.textMain, borderBottom: `1px solid ${colors.border}` };
const iconButton: React.CSSProperties = {
  border: 'none', background: 'transparent', cursor: 'pointer', color: '#00125a', fontSize: 20, padding: 4, lineHeight: 1,
};
const actionButton: React.CSSProperties = {
  border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', background: colors.surface, color: colors.textMain,
};
const primaryButton: React.CSSProperties = { ...actionButton, background: '#0b5ed7', borderColor: '#0b5ed7', color: '#fff' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={row}>
      <label style={rowLabel}>{label}</label>
      <div style={rowControl}>{children}</div>
    </div>
  );
}

export const CashCounterScreen: React.FC<CashCounterScreenProps> = ({ reactProps, onAction }) => {
  const vm = reactProps;
  const send = (action: string, payload?: Record<string, unknown>) => onAction?.(action, payload);

  // alt+b → Back (hotkey="{'alt+b': backToList}" on the AngularJS Back buttons).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.code === 'KeyB' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onAction?.('back');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onAction]);

  if (!vm) return null;
  const L = vm.labels;
  const item = vm.item;
  const busy = !!vm.busy;
  const busyStyle: React.CSSProperties = busy ? { opacity: 0.5, cursor: 'wait' } : {};
  const toOptions = (list: LookupItem[]) => list.map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <div id="cashcounter-react" style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{L.title}</h4>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0c2aa5' }} data-testid="cc-header">
          {vm.header.userName} | {vm.header.counterName} | {vm.header.counterStatus}
        </h4>
      </div>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left column: Opening, Closing, Cancelled bills */}
        <div style={{ flex: '5 1 340px', minWidth: 0 }}>
          <section style={panel} aria-label={L.opening}>
            <div style={legend}>
              <span>{L.opening}</span>
              {vm.flags.start && (
                <button type="button" style={{ ...iconButton, ...busyStyle }} disabled={busy} title={L.start} aria-label={L.start} onClick={() => send('start')}>
                  <i className="fas fa-play-circle" aria-hidden="true" />
                </button>
              )}
            </div>
            <div style={panelBody}>
              <Field label={L.startDateTime}>
                <DatePicker includeTime name="openingdatetime" value={item.openingDate}
                  onChange={(v) => send('setOpeningDate', { value: v })} />
              </Field>
              <Field label={L.department}>
                <Select name="department" options={toOptions(vm.lookup.Department)} value={item.departmentId ?? ''} disabled />
              </Field>
              <Field label={L.counter}>
                <Select name="BillingCounter" options={toOptions(vm.lookup.BillingCounter)} value={item.billingCounterId ?? ''}
                  onChange={(v) => send('setBillingCounter', { value: Number(v) })} />
              </Field>
              <Field label={L.openingBalance}>
                <Input name="openingbalance" inputMode="numeric" value={item.openingBalance}
                  onKeyDown={numberOnlyKeyDown}
                  onChange={(e) => send('setOpeningBalance', { value: digitsOnly(e.target.value) })} />
              </Field>
            </div>
          </section>

          <section style={panel} aria-label={L.closing}>
            {/* The legend (title, Stop and Revert) shows only while canShowCloseBtn is true, as in AngularJS. */}
            {vm.flags.close && (
              <div style={legend}>
                <span>{L.closing}</span>
                <span>
                  <button type="button" style={{ ...iconButton, ...busyStyle }} disabled={busy} title={L.stop} aria-label={L.stop} onClick={() => send('close')}>
                    <i className="fa fa-times" aria-hidden="true" />
                  </button>
                  {vm.flags.revert && (
                    <button type="button" style={{ ...iconButton, marginLeft: 10, ...busyStyle }} disabled={busy} title={L.revert} aria-label={L.revert} onClick={() => send('revert')}>
                      <i className="fas fa-history" aria-hidden="true" />
                    </button>
                  )}
                </span>
              </div>
            )}
            <div style={panelBody}>
              <Field label={L.endDateTime}>
                <DatePicker includeTime name="closingdatetime" value={item.closingDate}
                  onChange={(v) => send('setClosingDate', { value: v })} />
              </Field>
              <Field label={L.closingBalance}>
                <Input name="closingbalance" value={item.closingBalance} disabled readOnly />
              </Field>
              <Field label={L.remarks}>
                <Textarea name="instructions" rows={3} maxLength={4000} value={item.comments}
                  onChange={(e) => send('setComments', { value: e.target.value })} />
              </Field>
            </div>
          </section>

          <section style={panel} aria-label={L.cancelBills}>
            <div style={legend}><span>{L.cancelBills}</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>{L.billReceiptNo}</th>
                    <th style={th}>{L.cancelAmount}</th>
                    <th style={th}>{L.reason}</th>
                  </tr>
                </thead>
                <tbody>
                  {vm.cancelled.map((c, i) => (
                    <tr key={i}>
                      <td style={td}>{c.billReceipt}</td>
                      <td style={td}>{c.amount}</td>
                      <td style={td}>{c.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column: Denominations and summary */}
        <div style={{ flex: '7 1 420px', minWidth: 0 }}>
          <section style={panel} aria-label={L.denominations}>
            <div style={legend}><span>{L.denominations}</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>{L.denomination}</th>
                    <th style={th}>{L.number}</th>
                    <th style={th}>{L.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {vm.denominations.map((d, i) => (
                    <tr key={i}>
                      <td style={td}>{d.name}</td>
                      <td style={td}>
                        <Input aria-label={`${d.name} ${L.number}`} inputMode="numeric" value={d.count} disabled={item.submitted}
                          onKeyDown={numberOnlyKeyDown}
                          onChange={(e) => send('setDenominationCount', { index: i, value: digitsOnly(e.target.value) })} />
                      </td>
                      <td style={td}>
                        <Input aria-label={`${d.name} ${L.amount}`} value={d.total} placeholder="0.00" disabled readOnly />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...td, fontWeight: 600 }}>{L.netAmount}</td>
                    <td style={td}><Input aria-label={`${L.netAmount} ${L.number}`} value={item.denominationsNetCount} placeholder="0.00" disabled readOnly /></td>
                    <td style={td}><Input aria-label={`${L.netAmount} ${L.amount}`} value={item.denominationsNetTotal} placeholder="0.00" disabled readOnly /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ ...panel, ...panelBody }} aria-label="Summary">
            <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px' }}>
                <Field label={L.opening}><Input value={item.openingBalance} placeholder="0.00" disabled readOnly /></Field>
                <Field label={L.closingCash}><Input value={item.closingBalance} placeholder="0.00" disabled readOnly /></Field>
                <Field label={L.difference}><Input value={item.differenceAmount} placeholder="0.00" disabled readOnly /></Field>
              </div>
              <div style={{ flex: '1 1 220px' }}>
                <Field label={L.denominations}><Input value={item.denominationsNetTotal} placeholder="0.00" disabled readOnly /></Field>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Collections summary (#bannerdetails) */}
      <div style={{ overflowX: 'auto', margin: `${spacing.sm} 0 ${spacing.md}` }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 960, marginLeft: 'auto' }} aria-label="Collections summary">
          <tbody>
            {vm.banner.map((cells, r) => (
              <tr key={r} style={{ borderBottom: `1px solid ${colors.border}` }}>
                {cells.map((c, i) => {
                  const hl: React.CSSProperties = c.highlight ? { background: '#E91E63', color: '#fff' } : {};
                  return (
                    <React.Fragment key={i}>
                      <td style={{ ...td, whiteSpace: 'nowrap', color: c.negative ? 'red' : colors.textMain, ...hl }}>{c.label}</td>
                      <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: c.negative ? 'red' : colors.textMain, ...hl }}>
                        {c.value}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap',
        borderTop: `1px solid ${colors.border}`, paddingTop: spacing.sm }}>
        <button type="button" style={actionButton} title="Alt+B" onClick={() => send('back')}>
          <i className="fa fa-angle-left" aria-hidden="true" />&nbsp;&nbsp;{L.back}
        </button>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          {vm.flags.save && <button type="button" style={{ ...primaryButton, ...busyStyle }} disabled={busy} onClick={() => send('save')}>{L.save}</button>}
          {vm.flags.submit && <button type="button" style={{ ...primaryButton, ...busyStyle }} disabled={busy} onClick={() => send('submit')}>{L.submit}</button>}
          {vm.flags.print && <button type="button" style={actionButton} onClick={() => send('print')}>{L.print}</button>}
        </div>
      </div>
    </div>
  );
};

export default CashCounterScreen;
