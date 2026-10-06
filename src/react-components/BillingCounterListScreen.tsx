import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  BillingCounterId?: number;
  BillingCounterStatusId?: number;
  DocumentDate?: string;
  DocumentNumber?: string;
}

interface CounterRow {
  Id?: number;
  DocumentNumber?: string;
  BillingCounter?: { Description?: string };
  OpeningDate?: string;
  OpeningBalance?: number | string;
  ClosingDate?: string;
  ClosingBalance?: number | string;
  BillingCounterStatusId?: number;
  BillingCounterStatus?: { Description?: string };
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface BillingCounterListScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { BillingCounter?: LookupItem[]; BillingCounterStatus?: LookupItem[] };
    counters?: CounterRow[];
    pager?: Pager;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(val: number | string | undefined | null): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
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
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontFamily: typography.fontFamily, fontSize: '13px',
  color: colors.textMain, borderBottom: `1px solid ${colors.border}`,
};
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

// UI-MODERNIZATION RETROFIT (Billing / Billing Counters List,
// app.billingcounter-list, BillingCounterListController) -- single-mount
// React replacement. Full dependency investigation confirmed no
// native-only widgets and no utl.Validator.validate($scope) call, and the
// grid is already rendered via <custom-table config="vm.gridConfig">
// (never had row selection enabled) -- so per the established
// single-mount criterion this is ONE component, not a hybrid split (see
// billingcounter-list.html's top-of-file disclosure for the full
// rationale; this controller is structurally near-identical to the
// already-migrated billing/bankstatement/bankstatementlist.js).
// AngularJS remains authoritative for the real
// billing/userbillingcounters/GetUserBillingCounterWithoutDenominations
// list call, the genuinely-live openAdvancedFilter() modal
// (utl.Modal.openDynamicForm, untouched -- not reimplemented here), and
// addNew()/handleEvents() state transitions to app.billingcounter-form.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The advanced-filter button's tooltip/label borrow clinicalmaster's
//   serviceitem-list.filter-tooltip.lbl/filter.lbl ("Advance
//   Search"/"Fetch") instead of this module's own
//   billing.billingcounters.advancefilter-tooltip.lbl ("Advance
//   Filter").
// - The Document No# input's placeholder is literal "Document No#",
//   not i18n-driven.
// - The grid's "view" (eye) icon shows only for BillingCounterStatusId
//   3/4/5 and "edit" (pencil) only for 1/2 -- both navigate to the
//   identical app.billingcounter-form state. There is no delete
//   affordance in the original template (deleteItemCallback/
//   onDeleteConfirmed are declared but unreachable dead code, and
//   onDeleteConfirmed even calls the wrong domain's API action --
//   not reproduced here).
export const BillingCounterListScreen: React.FC<BillingCounterListScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {}, lookup, counters = [], pager = {} } = reactProps || {};
  const counterOptions = lookup?.BillingCounter || [];
  const statusOptions = lookup?.BillingCounterStatus || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, ...typography.h4 }}>Billing Counters</h4>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button type="button" title="Advance Search" onClick={() => dispatch('openAdvancedFilter')} className="btn-add">
            <i className="fas fa-search" aria-hidden="true"></i>&nbsp;&nbsp;Fetch
          </button>
          <button type="button" title="Assign User" onClick={() => dispatch('addNew')} className="btn-add">
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap', marginBottom: spacing.md }}>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Counters"
            value={currentfilter.BillingCounterId != null ? String(currentfilter.BillingCounterId) : ''}
            options={counterOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('billingCounterChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Status"
            value={currentfilter.BillingCounterStatusId != null ? String(currentfilter.BillingCounterStatusId) : ''}
            options={statusOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('statusChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <DatePicker
            label="Doc# Date"
            value={currentfilter.DocumentDate || ''}
            onChange={(v) => dispatch('documentDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <Input
            label="Doc# No"
            placeholder="Document No#"
            value={currentfilter.DocumentNumber || ''}
            onChange={(e) => dispatch('documentNumberChange', { value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Doc# No</th>
              <th style={thStyle}>Counters</th>
              <th style={thStyle}>Opening Date</th>
              <th style={thStyle}>Opening Balance</th>
              <th style={thStyle}>Closing Date</th>
              <th style={thStyle}>Closing Balance</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {counters.length === 0 ? (
              <tr><td style={tdStyle} colSpan={8}>No records</td></tr>
            ) : (
              counters.map((row, idx) => {
                const statusId = row.BillingCounterStatusId;
                const showView = statusId === 3 || statusId === 4 || statusId === 5;
                const showEdit = statusId === 1 || statusId === 2;
                return (
                  <tr key={row.Id != null ? row.Id : idx}>
                    <td style={tdStyle}>{row.DocumentNumber}</td>
                    <td style={tdStyle}>{row.BillingCounter?.Description}</td>
                    <td style={tdStyle}>{formatDateTime(row.OpeningDate)}</td>
                    <td style={tdRightStyle}>{formatCurrency(row.OpeningBalance)}</td>
                    <td style={tdStyle}>{formatDateTime(row.ClosingDate)}</td>
                    <td style={tdRightStyle}>{formatCurrency(row.ClosingBalance)}</td>
                    <td style={tdStyle}>{row.BillingCounterStatus?.Description}</td>
                    <td style={tdStyle}>
                      {showView && (
                        <span style={{ cursor: 'pointer', color: colors.primary, marginRight: spacing.sm }} onClick={() => dispatch('view', { entity: row })}>
                          <i className="fas fa-eye" aria-hidden="true"></i>
                        </span>
                      )}
                      {showEdit && (
                        <span style={{ cursor: 'pointer' }} onClick={() => dispatch('edit', { entity: row })}>
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: spacing.md }}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </div>
    </div>
  );
};
