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
  DocumentNumber?: string;
  DocumentDate?: string;
  DepartmentId?: number;
  BillingCounterStatusId?: number;
}

interface SubmissionRow {
  Id?: number;
  DocumentDate?: string;
  DocumentNumber?: string;
  Department?: { DepartmentName?: string };
  BillingCounter?: { Description?: string };
  CreatedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  OpeningBalance?: number | string;
  ClosingBalance?: number | string;
  BillingCounterStatus?: { Description?: string };
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface BillingCashSubmissionListScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { BillingCounter?: LookupItem[]; Department?: LookupItem[]; BillingCounterStatus?: LookupItem[] };
    submissions?: SubmissionRow[];
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

function formatUser(u?: SubmissionRow['CreatedUser']): string {
  if (!u) return '';
  return [u.Title?.Description, u.FirstName, u.LastName].filter(Boolean).join(' ');
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

// UI-MODERNIZATION RETROFIT (Billing / Cash Submissions List,
// app.cashsubmission-list, CashSubmissionListController) -- the second
// half of the hybrid bridge (see cashsubmission-list.html's
// top-of-file disclosure for the full rationale). This mount sits
// immediately after the native <autosearch> field for the User
// filter, which cannot run inside React and stays untouched. AngularJS
// remains authoritative for the real
// billing/userbillingcounters/GetBillingCounters list call and
// handleEvents() state transitions to app.cashsubmission-form.
//
// Confirmed pre-existing quirk, preserved exactly (not "fixed"): the
// grid's DocumentDate/DocumentNumber column headers are translated via
// the borrowed billing.billingcounters.* namespace ("Doc# Date"/
// "Doc# No"), while this screen's OWN filter-field labels correctly
// use billing.cashsubmissions.* ("Document Date"/"Document No#") --
// the same field is labeled two different ways on one screen. Both
// label pairs are reproduced verbatim, unreconciled. The grid's only
// row action is "edit" (pencil icon, unconditional) -- there is no
// view or delete affordance in the original template.
export const BillingCashSubmissionListScreen: React.FC<BillingCashSubmissionListScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {}, lookup, submissions = [], pager = {} } = reactProps || {};
  const counterOptions = lookup?.BillingCounter || [];
  const departmentOptions = lookup?.Department || [];
  const statusOptions = lookup?.BillingCounterStatus || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap', marginBottom: spacing.md }}>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Counters"
            value={currentfilter.BillingCounterId != null ? String(currentfilter.BillingCounterId) : ''}
            options={counterOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('billingCounterChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <Input
            label="Document No#"
            placeholder="Document No#"
            value={currentfilter.DocumentNumber || ''}
            onChange={(e) => dispatch('documentNumberChange', { value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <DatePicker
            label="Document Date"
            value={currentfilter.DocumentDate || ''}
            onChange={(v) => dispatch('documentDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Department"
            value={currentfilter.DepartmentId != null ? String(currentfilter.DepartmentId) : ''}
            options={departmentOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('departmentChange', { value: v ? parseInt(String(v), 10) : undefined })}
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
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Doc# Date</th>
              <th style={thStyle}>Doc# No</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Counters</th>
              <th style={thStyle}>User Name</th>
              <th style={thStyle}>Opening Balance</th>
              <th style={thStyle}>Closing Balance</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr><td style={tdStyle} colSpan={9}>No records</td></tr>
            ) : (
              submissions.map((row, idx) => (
                <tr key={row.Id != null ? row.Id : idx}>
                  <td style={tdStyle}>{formatDateTime(row.DocumentDate)}</td>
                  <td style={tdStyle}>{row.DocumentNumber}</td>
                  <td style={tdStyle}>{row.Department?.DepartmentName}</td>
                  <td style={tdStyle}>{row.BillingCounter?.Description}</td>
                  <td style={tdStyle}>{formatUser(row.CreatedUser)}</td>
                  <td style={tdRightStyle}>{formatCurrency(row.OpeningBalance)}</td>
                  <td style={tdRightStyle}>{formatCurrency(row.ClosingBalance)}</td>
                  <td style={tdStyle}>{row.BillingCounterStatus?.Description}</td>
                  <td style={tdStyle}>
                    <span style={{ cursor: 'pointer' }} onClick={() => dispatch('edit', { entity: row })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
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
