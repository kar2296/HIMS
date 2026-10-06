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
  BillingCounterStatusId?: number;
  DocumentDate?: string;
  DocumentNumber?: string;
}

interface StatementRow {
  Id?: number;
  DocumentNumber?: string;
  DocumentDate?: string;
  OpeningDate?: string;
  ClosingDate?: string;
  ClosingCash?: number | string;
  DenominationsNetTotal?: number | string;
  BillingCounterStatus?: { Description?: string };
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface BillingBankStatementListScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { BillingCounterStatus?: LookupItem[] };
    bills?: StatementRow[];
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

// UI-MODERNIZATION RETROFIT (Billing / Bank Statement List, app.bankstatement,
// bankstatementListController) -- single-mount React replacement. Full
// dependency investigation confirmed no native-only widgets and no
// utl.Validator.validate($scope) call, so per the established single-mount
// criterion this is ONE component, not a hybrid split (see
// bankstatementlist.html's top-of-file disclosure for the full rationale).
// AngularJS remains authoritative for the real
// billing/bankstatements/GetBankStatementWithoutDenominations API call,
// the genuinely-live openAdvancedFilter() modal (utl.Modal.openDynamicForm,
// untouched -- not reimplemented here), addNew()/handleEvents() state
// transitions to app.bankstatementform, and onDeleteConfirmed()
// (billing/bankstatements/UpdateBankStatements).
//
// Replaces the real <custom-table config="vm.gridConfig"> with a plain
// read-only table (this screen never enabled row selection on
// vm.gridConfig, so unlike consolidatepayment there is no
// $scope.gridApi-crash class of bug here -- purely a rendering swap).
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - "Add New" button's tooltip resolves to "Assign User"
//   (billing.bankstatementlist.addnew-tooltip.lbl), not anything
//   referencing Bank Statement -- a real label/purpose mismatch.
// - The advanced-filter button's tooltip resolves to "Fetch"
//   (borrowed from clinicalmaster.serviceitem-list.filter.lbl), not
//   "Filter"/"Advanced Filter".
// - Document Number search only re-queries on Enter (the real on-enter
//   directive) -- typing alone does not filter the list.
export const BillingBankStatementListScreen: React.FC<BillingBankStatementListScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {}, lookup, bills = [], pager = {} } = reactProps || {};
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
        <h4 style={{ margin: 0, ...typography.h4 }}>Bank Statements</h4>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button type="button" title="Fetch" onClick={() => dispatch('openAdvancedFilter')} className="drhms-billing-btn drhms-previousbill-btn">
            <i className="fa fa-search-plus" aria-hidden="true"></i>
          </button>
          <button type="button" tabIndex={-1} title="Assign User" onClick={() => dispatch('addNew')} className="btn-add">
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap', marginBottom: spacing.md }}>
        <div style={{ minWidth: 220 }}>
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
              <th style={thStyle}>Doc# Date</th>
              <th style={thStyle}>From Date</th>
              <th style={thStyle}>To Date</th>
              <th style={thStyle}>Cash Amount</th>
              <th style={thStyle}>Cash InHand</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr><td style={tdStyle} colSpan={8}>No records</td></tr>
            ) : (
              bills.map((row, idx) => (
                <tr key={row.Id != null ? row.Id : idx}>
                  <td style={tdStyle}>{row.DocumentNumber}</td>
                  <td style={tdStyle}>{formatDateTime(row.DocumentDate)}</td>
                  <td style={tdStyle}>{formatDateTime(row.OpeningDate)}</td>
                  <td style={tdStyle}>{formatDateTime(row.ClosingDate)}</td>
                  <td style={tdRightStyle}>{formatCurrency(row.ClosingCash)}</td>
                  <td style={tdRightStyle}>{formatCurrency(row.DenominationsNetTotal)}</td>
                  <td style={tdStyle}>{row.BillingCounterStatus?.Description}</td>
                  <td style={tdStyle}>
                    <span style={{ cursor: 'pointer', color: colors.primary, marginRight: spacing.sm }} onClick={() => dispatch('view', { entity: row })}>
                      <i className="fas fa-eye" aria-hidden="true"></i>
                    </span>
                    <span style={{ cursor: 'pointer', color: colors.danger }} onClick={() => dispatch('delete', { entity: row })}>
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </span>
                  </td>
                </tr>
              ))
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
