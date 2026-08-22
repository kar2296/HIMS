import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Select } from '../components/ui/Select';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { StatusBadge } from '../components/ui/Badge';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface EncounterGuarantorEntity {
  Id: number;
  GuarantorName?: string;
  GuarantorType?: { Description?: string };
  GuarantorTypeId?: number;
  Tpa?: { Description?: string };
  Rank?: number;
  PolicyNo?: string;
  GuarantorLetterNo?: string;
  GuarantorLetterDate?: string;
  EffectiveFrom?: string;
  EffectiveTo?: string;
  CreditLimit?: number;
  ActiveStatus?: { Description?: string };
  ActiveStatusId?: number;
  PatientId?: number;
  [key: string]: any;
}

interface CurrentFilter {
  status?: number;
  guarantortype?: number;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterGuarantorEntity[];
  lookup?: { GuarantorType?: LookupItem[]; ActiveStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
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
// encounterguarantor-list -- reachable ONLY as a modal (`utl.Modal.open(
// 'app.encounterguarantors', { params: { encounterid, pid } })`), one real
// caller: patientsearch.js. Unlike patientguarantor-list.js (patient-level,
// dual modal/full-page, <patientbanner> sibling, ~40 call sites), this is the
// *encounter*-level equivalent: modal-only, no native sibling directive (the
// real template's modal-header has just a title, no close/X button -- not
// fabricated here), and a richer column set (Tpa, GL No, GL Date, Expiry Date
// are all live here, vs. commented out in patientguarantor-list.js).
//
// Real, disclosed pre-existing quirks preserved as-is, NOT fixed:
// - "Add" (addNew()) is LIVE and clickable in the real template (unlike
//   patientguarantor-list's Add button, which is commented out) -- but its
//   target, utl.Modal.open('app.patientguarantorform', ...), is NOT registered
//   anywhere in hims-states.js (verified). So clicking Add is a real, live
//   broken-target no-op today. Rendered here, dispatching the real addNew()
//   unchanged, faithfully reproducing the break.
// - "Edit" (handleEvents('edit', ...)) targets that SAME unregistered
//   'app.patientguarantorform' state -- also broken today. Only "GL"
//   (app.encounterguarantorgl, registered) and "Delete" actually work. All
//   three are still rendered/dispatched unconditionally, since the real
//   controller applies no ActiveStatusId-based visibility gating on any of
//   them (unlike patientguarantor-list's custom-table template, which does).
// - addNew() passes isrankexst: $scope.IsRankExist, a scope property this
//   controller never sets anywhere -- always undefined. Preserved verbatim,
//   unchanged, inside the untouched addNew()/handleEvents() functions.
// - The template's funnel/filter icon button (`btn-filter`) has no ng-click
//   at all in the real markup -- a dead decorative button. Rendered inert
//   here (no dispatch) to match.
// - The grid's action column cellTemplate ('actionTemplate.html') does not
//   exist as a file anywhere in the repo, and the shared $$gridService
//   'actions' cellTemplate it would otherwise fall back to expects
//   {iconCls/text/hideFn} per action -- but this columnDef's actions only
//   carry {actiontype, display}. What (if anything) actually rendered
//   per-row in production is uncertain; Edit/Delete/GL icon buttons are
//   reproduced here as the closest faithful equivalent, dispatching into the
//   same unchanged handleEvents() the original relied on.
// ---------------------------------------------------------------------------
export const EncounterGuarantorListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<EncounterGuarantorEntity>[] = [
    { key: 'type', header: 'Type', field: 'GuarantorType.Description', sortable: true },
    { key: 'guarantor', header: 'Insurance', field: 'GuarantorName', sortable: true },
    { key: 'tpaname', header: 'TPA Name', field: 'Tpa.Description', sortable: true },
    { key: 'rank', header: 'Rank', field: 'Rank', sortable: true, align: 'center' },
    { key: 'policyno', header: 'Policy No', field: 'PolicyNo', sortable: true },
    { key: 'glno', header: 'Gl /Approval No', field: 'GuarantorLetterNo', sortable: true },
    { key: 'gldate', header: 'GL / Approval Date', sortable: true, field: 'GuarantorLetterDate', render: (e) => formatDate(e.GuarantorLetterDate) },
    { key: 'effectivedate', header: 'Effective Date', sortable: true, field: 'EffectiveFrom', render: (e) => formatDate(e.EffectiveFrom) },
    { key: 'expirydate', header: 'Expiry Date', sortable: true, field: 'EffectiveTo', render: (e) => formatDate(e.EffectiveTo) },
    { key: 'creditlimit', header: 'Credit Limit', field: 'CreditLimit', sortable: true, align: 'right' },
    { key: 'status', header: 'Status', field: 'ActiveStatus.Description', sortable: true, render: (e) => <StatusBadge status={e.ActiveStatus?.Description} /> },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h4 style={{ ...typography.sectionHeading, margin: 0, color: colors.textMain, fontFamily: typography.fontFamily }}>Encounter Payers</h4>
      </div>

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
          <div style={{ display: 'flex', gap: spacing.sm, marginLeft: 'auto' }}>
            <button
              type="button"
              title="add new"
              onClick={() => dispatch('addNew')}
              style={{ width: 30, height: 30, borderRadius: 4, border: 'none', background: colors.primary, color: '#fff', cursor: 'pointer' }}
            >
              <i className="fa fa-plus" aria-hidden="true" />
            </button>
            {/* Dead in the real template too: no ng-click there either -- inert here to match. */}
            <button
              type="button"
              title="Filter"
              disabled
              style={{ width: 30, height: 30, borderRadius: 4, border: `1px solid ${colors.border}`, background: colors.surfaceMuted, color: colors.textSubtle, cursor: 'default' }}
            >
              <i className="fa fa-filter" aria-hidden="true" />
            </button>
          </div>
        </FilterBar>
      </Card>

      <DataTable<EncounterGuarantorEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          <>
            <button
              type="button"
              title="Edit"
              onClick={() => dispatch('edit', { entity })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
            >
              <i className="fas fa-edit" aria-hidden="true" />
            </button>
            <button
              type="button"
              title="GL"
              onClick={() => dispatch('gl', { entity })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
            >
              <i className="fas fa-file-invoice" aria-hidden="true" />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => dispatch('delete', { entity })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.danger }}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
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
