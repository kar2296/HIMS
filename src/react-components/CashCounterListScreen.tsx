import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { colors, spacing, typography } from '../components/ui/tokens';

// Cash Counter list (app.cashcounterlist, cashcounterlistController) — React view.
//
// The AngularJS controller still loads the lookups, runs the list request
// (GetUserBillingCounterWithoutDenominations), opens the advanced-filter dialog and navigates
// to the Cash Counter screen. This component renders the view model built by
// $scope.buildCashCounterListReactProps() (new bridge code at the end of cashcounter-list.js)
// and reports user input through onAction(...). Labels arrive translated and dates/amounts
// arrive formatted exactly as the AngularJS grid formatted them.
//
// Separate from BillingCounterListScreen on purpose: that screen shows view/edit icons by
// status and opens a different form; changing it would change Billing → Billing Counters.

interface LookupItem { Id: number; Text: string }

interface CounterRow {
  index: number;
  documentNumber: string;
  counter: string;
  openingDate: string;
  openingBalance: string;
  closingDate: string;
  closingBalance: string;
  status: string;
}

export interface CashCounterListViewModel {
  labels: Record<string, string>;
  filter: { billingCounterId: number | null; statusId: number | null; documentDate: string; documentNumber: string };
  lookup: { BillingCounter: LookupItem[]; BillingCounterStatus: LookupItem[] };
  rows: CounterRow[];
  pager: { totalItems: number; currentPage: number; pageSize: number };
}

export interface CashCounterListScreenProps {
  reactProps?: CashCounterListViewModel;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.sm} ${spacing.sm}`, fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 0.5, color: colors.textMain, background: '#eef2f7', borderBottom: `2px solid ${colors.border}`, whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontSize: 13, color: colors.textMain, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap',
};
const iconBtn = (bg: string): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: 8, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontSize: 16,
});

export const CashCounterListScreen: React.FC<CashCounterListScreenProps> = ({ reactProps, onAction }) => {
  const vm = reactProps;
  if (!vm) return null;
  const send = (action: string, payload?: Record<string, unknown>) => onAction?.(action, payload);
  const L = vm.labels;
  const { totalItems, currentPage, pageSize } = vm.pager;
  const first = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalItems);
  const toOptions = (list: LookupItem[]) => list.map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <div id="cashcounterlist-react" style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{L.title}</h4>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button type="button" style={iconBtn('#2563eb')} title={L.filterTooltip} aria-label={L.filterTooltip} onClick={() => send('openAdvancedFilter')}>
            <i className="fas fa-search" aria-hidden="true" />
          </button>
          <button type="button" style={iconBtn('#2563eb')} title={L.addTooltip} aria-label={L.addTooltip} onClick={() => send('addNew')}>
            <i className="fa fa-plus" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
        <Select label={L.counters} name="billingcounter" options={toOptions(vm.lookup.BillingCounter)} value={vm.filter.billingCounterId ?? ''}
          onChange={(v) => send('setCounter', { value: Number(v) })} />
        <Select label={L.status} name="billingcounterstatus" options={toOptions(vm.lookup.BillingCounterStatus)} value={vm.filter.statusId ?? ''}
          onChange={(v) => send('setStatus', { value: Number(v) })} />
        <DatePicker label={L.documentDate} name="documentdate" value={vm.filter.documentDate}
          onChange={(v) => send('setDocumentDate', { value: v })} />
        <Input label={L.documentNumber} name="documentnumber" placeholder="Document No#" value={vm.filter.documentNumber}
          onChange={(e) => send('setDocumentNumber', { value: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') send('search'); }} />
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label={L.title}>
          <thead>
            <tr>
              <th style={th}>{L.colDocumentNumber}</th>
              <th style={th}>{L.colCounter}</th>
              <th style={th}>{L.colOpeningDate}</th>
              <th style={th}>{L.colOpeningBalance}</th>
              <th style={th}>{L.colClosingDate}</th>
              <th style={th}>{L.colClosingBalance}</th>
              <th style={th}>{L.colStatus}</th>
              <th style={th}>{L.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {vm.rows.map((r) => {
              // No status colouring: the controller's red rowTemplate for status 3 was never applied,
              // because <custom-table> ignores rowTemplate.
              const cell = td;
              return (
                <tr key={r.index}>
                  <td style={cell}>{r.documentNumber}</td>
                  <td style={cell}>{r.counter}</td>
                  <td style={cell}>{r.openingDate}</td>
                  <td style={cell}>{r.openingBalance}</td>
                  <td style={cell}>{r.closingDate}</td>
                  <td style={cell}>{r.closingBalance}</td>
                  <td style={cell}>{r.status}</td>
                  <td style={cell}>
                    <button type="button" title={L.edit} aria-label={`${L.edit} ${r.documentNumber}`}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      onClick={() => send('edit', { index: r.index })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap',
        marginTop: spacing.md, padding: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6 }}>
        <span style={{ fontSize: 13, color: colors.textMuted }} data-testid="ccl-showing">
          Showing {first}-{last} of {totalItems} items
        </span>
        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize}
          onPageChange={(page) => send('page', { page })} />
      </div>
    </div>
  );
};

export default CashCounterListScreen;
