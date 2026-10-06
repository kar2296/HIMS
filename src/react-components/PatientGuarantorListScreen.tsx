import React from 'react';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { Select } from '../components/ui/Select';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { StatusBadge } from '../components/ui/Badge';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface GuarantorEntity {
  Id: number;
  GuarantorName?: string;
  GuarantorType?: { Description?: string };
  GuarantorTypeId?: number;
  Rank?: number;
  PolicyNo?: string;
  EffectiveFrom?: string;
  CreditLimit?: number;
  ActiveStatus?: { Description?: string };
  ActiveStatusId?: number;
  [key: string]: any;
}

interface CurrentFilter {
  status?: number;
  guarantortype?: number;
}

interface CurrentContext {
  ismodal?: boolean;
  isFinalized?: boolean;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: GuarantorEntity[];
  lookup?: { GuarantorType?: LookupItem[]; ActiveStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  currentcontext?: CurrentContext;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real ngformatdate directive's 'dd-MMM-yyyy' format.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// patientguarantor-list -- reachable BOTH as a full-page state
// (app.fullregistrationtab.basic's sibling `app.patientguarantorlist`/
// `app.patientguarantorbilling`) AND, far more commonly, as a MODAL
// (`utl.Modal.open('app.patientguarantorlist', ...)`) opened from dozens of
// Billing/Pharmacy/bill-modification screens across the app -- 40+ real call
// sites, the highest fan-in of anything migrated in this batch.
//
// <patientbanner> (modal-mode only) stays native -- see patientguarantor-list.html.
//
// UI-MODERNIZATION RETROFIT (Phase 4 proof-of-concept): this screen's markup
// now renders through the global design-system components (Select, DataTable,
// Pagination, StatusBadge, Card/FilterBar, shared tokens) instead of hand-rolled
// inline styles. NOTHING behavioral changed: same dispatch() calls with the same
// action names/payload shapes (edit/gl/delete/filterChange/pageChange/cancelModal),
// same field names, same sort-by-column-click behavior (now via DataTable's
// clientSort, which mirrors the same case-insensitive string compare the original
// local sort used), same conditional Edit/GL/Delete visibility rules, same
// pagination semantics (dispatches 'pageChange' with the target page number --
// the caller's real server-paginated fetch decides what happens next).
//
// Real, disclosed pre-existing quirks preserved as-is, NOT fixed:
// - "Add" is fully dead on this screen today: addNew() is a real function, but its
//   trigger button is commented out of the live template, AND its target modal
//   state 'app.patientguarantorform' does not exist anywhere in hims-states.js.
//   Not rendered here either -- this matches what's actually live today.
// - The footer Back/Cancel button (backToForm()) is likewise commented out of the
//   live template -- not rendered.
// - Row-selection "picker" mode (enableRowSelection/onRegisterApi/gridApi, gated by
//   currentcontext.canselectrow, used by Billing callers passing parent:"txn" to
//   pick a guarantor) targets ui-grid's selection API, but the live template
//   renders <custom-table>, which implements only column-header sort (reOrder) and
//   has no selection API at all -- this code path is unreachable today and is not
//   reproduced here.
// - Edit is shown only for ActiveStatusId==2, GL for ActiveStatusId==1||3, Delete
//   for ActiveStatusId==1||3 -- exactly mirroring the original cellTemplate's
//   ng-show conditions.
// - When currentcontext.isFinalized is true, clicking Edit/GL/Delete shows an
//   error alert -- but the real handleEvents() passes the raw i18n KEY string
//   straight to showErrorMsg (missing the $translate.instant() wrapper every other
//   call site here uses), so the literal untranslated key displays. Preserved
//   verbatim via the native dispatch (handleEvents itself decides this, unchanged).
// ---------------------------------------------------------------------------
export const PatientGuarantorListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    currentcontext = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<GuarantorEntity>[] = [
    { key: 'type', header: 'Type', field: 'GuarantorType.Description', sortable: true },
    { key: 'name', header: 'Guarantor', field: 'GuarantorName', sortable: true },
    { key: 'rank', header: 'Rank', field: 'Rank', sortable: true, align: 'center' },
    { key: 'policy', header: 'Policy No', field: 'PolicyNo', sortable: true },
    { key: 'effective', header: 'Effective Date', sortable: true, field: 'EffectiveFrom', render: (e) => formatDate(e.EffectiveFrom) },
    { key: 'credit', header: 'Credit Limit', field: 'CreditLimit', sortable: true, align: 'right' },
    { key: 'status', header: 'Status', field: 'ActiveStatus.Description', sortable: true, render: (e) => <StatusBadge status={e.ActiveStatus?.Description} /> },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {currentcontext.ismodal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <h4 style={{ ...typography.sectionHeading, margin: 0, color: colors.textMain, fontFamily: typography.fontFamily }}>Manage Payer Type</h4>
          <button
            type="button"
            title="Close"
            onClick={() => dispatch('cancelModal')}
            style={{ width: 30, height: 30, borderRadius: radii.sm, border: 'none', background: colors.danger, color: '#fff', cursor: 'pointer' }}
          >
            <i className="fa fa-times" aria-hidden="true" />
          </button>
        </div>
      )}

      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Type"
              value={currentfilter.guarantortype ?? -1}
              onChange={(v) => dispatch('filterChange', { field: 'guarantortype', value: Number(v) })}
              options={(lookup.GuarantorType || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Status"
              value={currentfilter.status ?? 2}
              onChange={(v) => dispatch('filterChange', { field: 'status', value: Number(v) })}
              options={(lookup.ActiveStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
        </FilterBar>
      </Card>

      <DataTable<GuarantorEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          <>
            {entity.ActiveStatusId === 2 && (
              <button
                type="button"
                title="Edit"
                onClick={() => dispatch('edit', { entity })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
              >
                <i className="fas fa-edit" aria-hidden="true" />
              </button>
            )}
            {(entity.ActiveStatusId === 1 || entity.ActiveStatusId === 3) && (
              <button
                type="button"
                title="GL Edit"
                onClick={() => dispatch('gl', { entity })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
              >
                <i className="fas fa-edit" aria-hidden="true" />
              </button>
            )}
            {(entity.ActiveStatusId === 1 || entity.ActiveStatusId === 3) && (
              <button
                type="button"
                title="Delete"
                onClick={() => dispatch('delete', { entity })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.danger }}
              >
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            )}
          </>
        )}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => dispatch('pageChange', { page })}
      />
    </div>
  );
};
