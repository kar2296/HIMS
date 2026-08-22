import React, { useEffect, useRef, useState } from 'react';
import { colors, radii, spacing, typography, transitions, zIndex, shadows, controlHeight } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { SearchSelect } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { StatusBadge } from '../components/ui/Badge';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface NameDescription {
  Description?: string;
}

interface EncounterEntity {
  Id: number;
  PatientId?: number;
  AdmissionDate?: string;
  VisitIdentifier?: string;
  Patient?: {
    Id?: number;
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number;
    Gender?: NameDescription;
    PhotoPath?: string;
  };
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Doctor?: {
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
  };
  Guarantor?: { GuarantorName?: string };
  AdmissionStatus?: NameDescription;
  [key: string]: any;
}

interface CurrentFilter {
  patientnamemrn?: string;
  admissiondate?: string; // ISO yyyy-mm-dd, same as the DatePicker's native value
  WardId?: number | string;
  admissionstatusid?: string; // comma-joined ids, exactly what multiselectchk's `selected` binding holds
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
  lookup?: { Ward?: LookupItem[]; AdmissionStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real ngformatdate / date filter 'dd-MMM-yyyy' formatting used by the original cellTemplate.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Mirrors the original cellTemplate's second span: {{AdmissionDate | date:'HH:mm'}}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// myinpatients -- "My InPatients" tab under app.inpatienttab (IPManagement).
// Reachable only as the default child state of the already-migrated
// inpatienttab shell (InpatientTabScreen.tsx renders <div ui-view> below it) --
// no modal usage, no <patientbanner> sibling in the real template.
//
// UI-MODERNIZATION RETROFIT (same Phase 4 pattern as PatientGuarantorListScreen
// / EncounterGuarantorListScreen): filter row and grid now render through the
// shared design-system components (Input/SearchSelect/DatePicker, a small
// checkbox-dropdown standing in for the vendor multiselectchk component,
// DataTable, Pagination, StatusBadge, Card/FilterBar) instead of hand-rolled
// ui-grid cellTemplates. NOTHING behavioral changed: same dispatch() calls,
// same field names, same server-side pagination/filtering (every filter
// dispatch still ends up calling the real unchanged getList()), same
// Enter-to-search semantics on the Name/MRN box (mirrors the real on-enter
// directive -- typing alone never refetches, only Enter does).
//
// Real, disclosed pre-existing quirks preserved as-is, NOT fixed:
// - Clicking the DOCTOR NAME cell dispatches handleEvents('patientinfo', entity)
//   -- the exact same action as clicking the PATIENT NAME cell -- opening the
//   patient-info modal, not any doctor-related view. This is what the real
//   cellTemplate does (copy-paste artifact, most likely); reproduced verbatim.
// - The Room/Bed cell's real cellTemplate gates ALL FOUR pieces (ward name,
//   room no, AND bed no) on `ng-if="entity.WardRoomMaster"` -- even the bed
//   number span, which should logically check WardRoomBedMaster instead. So a
//   patient with a WardRoomMaster but no WardRoomBedMaster still shows an
//   (empty) bed slot render attempt, and one with WardRoomBedMaster but no
//   WardRoomMaster shows nothing at all. Reproduced exactly, not corrected.
// - The real status cellTemplate renders a `<div style="height:15px;width:20px;
//   border-radius:7px;margin-top:4px;class='col-sm-2'"></div>` colored-dot
//   placeholder immediately before the status text -- note "class=" is stray
//   text trapped INSIDE the style attribute (a string-concatenation bug), so
//   no background-color was ever actually set and the "dot" has always
//   rendered as an invisible, colorless empty box. Since it never displayed
//   any color in production, it is not reproduced pixel-for-pixel here;
//   StatusBadge (this codebase's standard status-tone chip, same as the
//   guarantor-list screens) stands in as the equivalent modernized status
//   indicator.
// - print(), doctor_dashboard(), bed_management(), patientprofiledetails(),
//   and openModal() are all real functions still defined in the untouched
//   controller, but NONE of them are wired to any element in the real
//   myinpatient.html template (doctor_dashboard/bed_management duplicate
//   what the parent inpatienttab shell already provides; the others are
//   dead leftovers). None are dispatched from this screen either, matching
//   what is actually live today.
// - The "No" (S.No) column has no real backing field -- the original
//   cellTemplate just prints the ui-grid row's position via `{{index+1}}`.
//   Reproduced here as the row's position within the current page's `items`
//   array (not re-derived from any client-side re-sort), matching the fact
//   that this column itself was never sortable in the original either.
// - A `currentinPatientsTemplate.html` <script type="text/ng-template"> block
//   sits at the bottom of the real myinpatient.html, but vm.gridConfig's
//   columnDefs never reference it by that id (unlike pendingdischarges.js /
//   currentinpatients.js, which do) -- it is genuinely dead, unused markup in
//   this screen and is not reproduced here.
// ---------------------------------------------------------------------------
export const MyInpatientListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [searchDraft, setSearchDraft] = useState(currentfilter.patientnamemrn || '');
  useEffect(() => { setSearchDraft(currentfilter.patientnamemrn || ''); }, [currentfilter.patientnamemrn]);

  const columns: DataTableColumn<EncounterEntity>[] = [
    {
      key: 'sno',
      header: 'No',
      sortable: false,
      render: (e) => <span>{items.indexOf(e) + 1}</span>,
    },
    {
      key: 'admissiondate',
      header: 'Admission Date & Time',
      field: 'AdmissionDate',
      sortable: true,
      render: (e) => (
        <span>
          {formatDate(e.AdmissionDate)} <span style={{ color: colors.textMuted }}>{formatTime(e.AdmissionDate)}</span>
        </span>
      ),
    },
    { key: 'visitno', header: 'Visit No', field: 'VisitIdentifier', sortable: true },
    {
      key: 'patient',
      header: 'Patient Name',
      field: 'Patient.FirstName',
      sortable: true,
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ color: colors.primary, cursor: 'pointer', textDecoration: 'none' }}
        >
          {e.Patient?.Title?.Description ? `${e.Patient.Title.Description} ` : ''}
          {e.Patient?.FirstName} {e.Patient?.LastName} / {e.Patient?.MRN} / {e.Patient?.Age} / {e.Patient?.Gender?.Description}
        </a>
      ),
    },
    {
      key: 'roomdetails',
      header: 'Room Details',
      field: 'WardMaster.WardName',
      sortable: true,
      // See disclosed quirk above: all three spans (ward/room/bed) key off
      // entity.WardRoomMaster in the real template, bed included.
      render: (e) => (
        e.WardRoomMaster ? (
          <span>
            {e.WardMaster?.WardName}/{e.WardRoomMaster?.RoomNo}/{e.WardRoomBedMaster?.BedNo}
          </span>
        ) : null
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor Name',
      field: 'Doctor.FirstName',
      sortable: true,
      // Real quirk: clicking here dispatches 'patientinfo', same as the Patient Name cell -- not doctor info. Preserved as-is.
      render: (e) => (
        <span onClick={() => dispatch('patientinfo', { entity: e })} style={{ cursor: 'pointer' }}>
          {e.Doctor?.Title?.Description ? `${e.Doctor.Title.Description} ` : ''}
          {e.Doctor?.FirstName} {e.Doctor?.LastName}
        </span>
      ),
    },
    { key: 'guarantor', header: 'Payer Name', field: 'Guarantor.GuarantorName', sortable: true },
    {
      key: 'status',
      header: 'Status',
      field: 'AdmissionStatus.Description',
      sortable: true,
      render: (e) => <StatusBadge status={e.AdmissionStatus?.Description} />,
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Name"
              placeholder="NAME/MRN"
              leftIcon="fas fa-search"
              value={searchDraft}
              onChange={(ev) => {
                const v = ev.target.value;
                setSearchDraft(v);
                dispatch('filterChange', { field: 'patientnamemrn', value: v });
              }}
              onKeyDown={(ev) => {
                // Mirrors the real on-enter directive: only Enter re-fetches.
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  dispatch('search');
                }
              }}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <DatePicker
              label="DOA"
              value={currentfilter.admissiondate}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'admissiondate', value: v })}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <SearchSelect
              label="Ward"
              value={currentfilter.WardId ?? null}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'WardId', value: v })}
              options={(lookup.Ward || []).map((o) => ({ value: o.Id, label: o.Text }))}
              placeholder="Select Ward"
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <AdmissionStatusMultiSelect
              label="Status"
              options={lookup.AdmissionStatus || []}
              selected={currentfilter.admissionstatusid || ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'admissionstatusid', value: v })}
            />
          </div>
        </FilterBar>
      </Card>

      <DataTable<EncounterEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          <button
            type="button"
            title="EMR"
            onClick={() => dispatch('emr', { entity })}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary, fontSize: '15px' }}
          >
            <i className="fas fa-laptop-medical" aria-hidden="true" />
          </button>
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

// ---------------------------------------------------------------------------
// Small checkbox-dropdown standing in for the vendor `multiselectchk`
// component (public/vendor/components/multiselectchk.js). Same contract:
// `selected` is a comma-joined string of AdmissionStatus ids, `options` is
// the {Id, Text}[] lookup list, and `onChange` fires with the new
// comma-joined string -- exactly what the real component's
// `onSelectionChanged` -> `cvm.selected` -> `change()` chain produced.
// ---------------------------------------------------------------------------
const AdmissionStatusMultiSelect: React.FC<{
  label: string;
  options: LookupItem[];
  selected: string;
  onChange: (value: string) => void;
}> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIds = selected ? selected.split(',').map((s) => parseInt(s, 10)) : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next.join(','));
  };

  const summary = selectedIds.length === 0
    ? 'None selected'
    : options.filter((o) => selectedIds.includes(o.Id)).map((o) => o.Text).join(', ') || `${selectedIds.length} selected`;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>{label}</label>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: controlHeight.md, padding: '0 12px', fontSize: '13px', fontFamily: typography.fontFamily,
          color: colors.textMain, backgroundColor: colors.surface,
          border: `1px solid ${open ? colors.primary : colors.border}`,
          borderRadius: radii.sm, cursor: 'pointer', boxSizing: 'border-box', transition: transitions.fast,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '11px', color: colors.textSubtle }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: zIndex.dropdown,
          backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.sm,
          boxShadow: shadows.md, maxHeight: 220, overflowY: 'auto',
        }}>
          {options.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: colors.textSubtle }}>No options</div>
          )}
          {options.map((o) => {
            const checked = selectedIds.includes(o.Id);
            return (
              <div
                key={o.Id}
                onClick={() => toggle(o.Id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.sm,
                  padding: '8px 12px', fontSize: '13px', cursor: 'pointer',
                  backgroundColor: checked ? colors.primaryLight : 'transparent',
                  color: colors.textMain,
                }}
              >
                <span
                  style={{
                    width: 16, height: 16, flexShrink: 0, borderRadius: radii.sm,
                    border: `1.5px solid ${checked ? colors.primary : colors.borderStrong}`,
                    backgroundColor: checked ? colors.primary : colors.surface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {checked && <i className="fa-solid fa-check" style={{ fontSize: '10px', color: '#fff' }} />}
                </span>
                {o.Text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
