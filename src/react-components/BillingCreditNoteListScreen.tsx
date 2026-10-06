import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  CreditNoteIdentifier?: string;
  name?: string;
  CreditNoteTypeId?: number;
  CreditNoteStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface CreditNoteRow {
  Id: number;
  CreditNoteIdentifier?: string;
  CreditNoteDateTime?: string;
  CreditNoteType?: { Description?: string };
  CreditNoteAmount?: number;
  CreditNoteStatus?: { Description?: string };
  CreditNoteStatusId?: number;
  PatientId?: number;
  Patient?: {
    MRN?: string;
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
    Age?: number;
    Gender?: { Description?: string };
  };
}

interface BillingCreditNoteListScreenProps {
  reactProps?: {
    items?: CreditNoteRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { CreditNoteType?: LookupItem[]; CreditNoteStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCnDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${min}`;
}

function formatCurrency(val?: number): string {
  if (val == null) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Mirrors the real cellTemplate's exact (malformed, but real) markup:
// MRN is gated behind Title.Description existing (ng-if on that span
// only) -- when a patient has no Title, the MRN is dropped entirely and
// the cell literally starts with a bare "/". Reproduced verbatim, not
// fixed.
function formatPatientCell(p?: CreditNoteRow['Patient']): string {
  if (!p) return '';
  const hasTitle = !!p.Title?.Description;
  const mrn = hasTitle ? (p.MRN || '') : '';
  return `${mrn}/${p.Title?.Description || ''} ${p.FirstName || ''} ${p.LastName || ''} /${p.Age != null ? p.Age : ''} ${p.Gender?.Description || ''}`;
}

// UI-MODERNIZATION RETROFIT (Billing / Credit Note list, app.creditnotes,
// creditnoteListController). Re-skins the real ui-grid screen with the
// shared design-system components instead of ui-grid/ui-select markup.
// All real data flow is unchanged -- same handleReactAction dispatch
// back to creditnote-list.js's hollowed controller, same real
// Billing/PatientCreditNote/GetPatientCreditNotes call. Confirmed LIVE
// via a real $state.go('app.creditnotes') call from
// emr/dashboard/opddashboard.js, and real $state.go('app.creditnote')
// navigation into the credit note form from this screen's own addNew/
// edit actions.
//
// The real "Fetch" button (filter icon, tooltip "Advance Search") opens
// a schema-driven AngularJS dynamic-form popover (utl.Modal.
// openDynamicForm) with From/To Date, CN Amount, Payer, Payer Type, and
// Doctor fields -- a generic AngularJS-rendered mechanism used across
// many screens in this codebase, independent of the React mount point.
// Rather than reimplementing that generic popover renderer in React
// (which would duplicate infrastructure used elsewhere and risk
// diverging from it), this button dispatches straight through to the
// real $scope.openAdvancedFilter(), which still opens the identical
// native AngularJS popover exactly as today.
//
// Confirmed pre-existing quirk, reproduced exactly (not "fixed"): the
// Patient Name column's cellTemplate gates the MRN behind
// Patient.Title.Description existing -- for a patient with no title,
// the cell literally starts with a bare "/" and no MRN. See
// formatPatientCell above.
export const BillingCreditNoteListScreen: React.FC<BillingCreditNoteListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const cnTypeOptions = lookup?.CreditNoteType || [];
  const cnStatusOptions = lookup?.CreditNoteStatus || [];

  const [cnNo, setCnNo] = useState(currentfilter.CreditNoteIdentifier || '');
  useEffect(() => { setCnNo(currentfilter.CreditNoteIdentifier || ''); }, [currentfilter.CreditNoteIdentifier]);
  const [name, setName] = useState(currentfilter.name || '');
  useEffect(() => { setName(currentfilter.name || ''); }, [currentfilter.name]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Credit Notes"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="secondary" icon="fa-filter" title="Advance Search" onClick={() => dispatch('openAdvancedFilter')}>Fetch</Button>
            <Button variant="primary" icon="fa-plus" title="Credit Note" onClick={() => dispatch('addNew')}>Add New</Button>
            <Button variant="icon" icon="fa-home" title="OPD Dashboard" onClick={() => dispatch('opd_dashboard')} />
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              label=" CN No."
              value={cnNo}
              onChange={(e) => setCnNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search', { CreditNoteIdentifier: cnNo, name }); }}
              placeholder="CN Number"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <Input
              label=" Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search', { CreditNoteIdentifier: cnNo, name }); }}
              placeholder="Name/MRN"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label=" CN Type"
              value={currentfilter.CreditNoteTypeId != null ? String(currentfilter.CreditNoteTypeId) : ''}
              options={cnTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('typeFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label=" CN Status"
              value={currentfilter.CreditNoteStatusId != null ? String(currentfilter.CreditNoteStatusId) : ''}
              options={cnStatusOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Credit Note No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>CN Date</th>
                <th style={thStyle}>CN Type</th>
                <th style={thStyle}>CN Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={7}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.CreditNoteIdentifier}</td>
                  <td style={tdStyle}>
                    <a href="#" onClick={(e) => { e.preventDefault(); dispatch('patientinfo', row.PatientId); }} style={{ color: colors.primary }}>
                      {formatPatientCell(row.Patient)}
                    </a>
                  </td>
                  <td style={tdStyle}>{formatCnDateTime(row.CreditNoteDateTime)}</td>
                  <td style={tdStyle}>{row.CreditNoteType?.Description}</td>
                  <td style={tdStyle}>{formatCurrency(row.CreditNoteAmount)}</td>
                  <td style={tdStyle}>{row.CreditNoteStatus?.Description}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      {(row.CreditNoteStatusId === 2 || row.CreditNoteStatusId === 3) && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="View" onClick={() => dispatch('view', row)}>
                          <i className="fas fa-eye" aria-hidden="true" />
                        </span>
                      )}
                      {row.CreditNoteStatusId === 1 && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Edit" onClick={() => dispatch('edit', row)}>
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" />
                        </span>
                      )}
                      {row.CreditNoteStatusId === 1 && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Delete" onClick={() => dispatch('delete', row)}>
                          <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </Card>
    </div>
  );
};
