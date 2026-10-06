import React, { useEffect, useRef, useState } from 'react';
import { colors, radii, spacing, typography, shadows, zIndex } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { StatusBadge, toneForStatus, type BadgeTone } from '../components/ui/Badge';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface PersonName {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface PatientInfo extends PersonName {
  Id?: number;
  MRN?: string;
  Age?: number;
  Gender?: { Description?: string };
  PhotoPath?: string;
  Photo?: string;
}

interface EncounterEntity {
  Id: number;
  PatientId?: number;
  AdmissionDate?: string;
  VisitIdentifier?: string;
  Patient?: PatientInfo;
  Doctor?: PersonName;
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Guarantor?: { GuarantorName?: string };
  // Real controller mutates this to the literal string "Day-1 Discharge" when true,
  // otherwise leaves the original boolean (usually false) untouched -- see
  // getListCallback in allinpatient.js. Preserved verbatim, not normalized.
  IsDay1Discharge?: boolean | string;
  AdmissionStatus?: { Description?: string };
  AdmissionStatusId?: number;
  // Real, working per-row color signal computed in getListCallback: 6 = bill-locked
  // (unpaid, non-discharge status), 7 = package-assigned, else = AdmissionStatusId
  // (only 5/6/7 have an actual color mapped in vm.gridConfig.background.style.value;
  // 1-4 are commented out there, i.e. deliberately uncolored).
  ColorCode?: number;
  IsPackageAssigned?: boolean;
  IsBillLock?: boolean;
  [key: string]: any;
}

interface CurrentFilter {
  patientnamemrn?: string;
  DOA?: string; // ISO yyyy-mm-dd, matches native date input / $filter('date') usage in getList()
  WardId?: number;
  // Comma-joined string of AdmissionStatus ids, exactly the format the real
  // multiselectchk component (public/vendor/components/multiselectchk.js)
  // produces and Key:31 of getList()'s Params expects.
  admissionstatusid?: string;
  [key: string]: any;
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

// Mirrors the real cellTemplate's own 'dd-MMM-yyyy' / 'HH:mm' AngularJS date filters.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Real hex values from vm.gridConfig.background.style.value in allinpatient.js
// (ColorCode 5/6/7 only -- 1-4 are commented out there, i.e. no color for them).
function toneForColorCode(code?: number): BadgeTone | undefined {
  if (code === 6) return 'danger';   // '#ed143dad' -- bill-locked / unpaid
  if (code === 7) return 'warning';  // '#EE7700'   -- package assigned
  if (code === 5) return 'info';     // '#4274d8ad' -- financial discharge
  return undefined; // falls back to toneForStatus(description) below
}

// Minimal multi-checkbox dropdown reproducing the real <multiselectchk> component
// (public/vendor/components/multiselectchk.js): `selected` is a comma-joined
// string of numeric Ids, `list` is [{Id, Text}], exactly as the real controller's
// lookup.AdmissionStatus / currentfilter.admissionstatusid already are. No shared
// design-system multi-select exists yet, so this is kept local to this screen.
const MultiSelectCheckboxFilter: React.FC<{
  label: string;
  list: LookupItem[];
  selected?: string;
  onChange: (value: string) => void;
}> = ({ label, list, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIds = (selected || '').split(',').filter(Boolean).map((s) => parseInt(s, 10));

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
    : selectedIds.length <= 4
      ? list.filter((l) => selectedIds.includes(l.Id)).map((l) => l.Text).join(', ')
      : `${selectedIds.length} selected`;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>{label}</label>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 36, padding: '0 12px', fontSize: '13px', fontFamily: typography.fontFamily,
          color: selectedIds.length ? colors.textMain : colors.textSubtle,
          backgroundColor: colors.surface, border: `1px solid ${open ? colors.primary : colors.border}`,
          borderRadius: radii.sm, cursor: 'pointer', boxSizing: 'border-box',
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
          {list.length === 0 && <div style={{ padding: '10px 12px', fontSize: '12px', color: colors.textSubtle }}>No options</div>}
          {list.map((item) => (
            <label
              key={item.Id}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: colors.textMain }}
            >
              <input type="checkbox" checked={selectedIds.includes(item.Id)} onChange={() => toggle(item.Id)} />
              {item.Text}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// allinpatient (app.inpatienttab.allinpatient) -- renders inside the already-
// migrated `inpatienttab` shell's <div ui-view>. This component is ONLY the
// screen's own filter row + grid + pager; the tab header lives in the shell.
//
// Real, disclosed pre-existing quirks preserved as-is, NOT fixed:
// - The whole bottom half of the real allinpatient.html (lines 55-159) was a
//   dead <script type="text/ng-template" id="currentinPatientsTemplate.html">
//   block: never referenced by any cellTemplate in this file's columnDefs
//   (grep-verified -- the id is only used as a live cellTemplate in the
//   unrelated pendingdischarges.js, and is commented out in
//   currentinpatients.js). Its `handleEvents('ordertracker', ...)` and
//   `handleEvents('edit', ...)` ng-clicks targeted actionTypes handleEvents()
//   never even handles (only 'emr'/'patientinfo'/'discharge' have branches).
//   None of that dead markup is reproduced here.
// - `doctor_dashboard()`, `bed_management()`, `print()`, `openModal()`,
//   `patientprofiledetails()` are real controller functions with zero call
//   sites in this template -- left out, not invented UI for them.
// - `loadPhotos()`/`getPatientProfilePic()` are real but loadPhotos()'s own
//   call site is commented out (`// loadPhotos();`), so Patient.Photo is
//   never populated -- no photo column here, matching production.
// - The "Doctor" column's cellTemplate literally calls
//   `handleEvents('patientinfo', entity)` (same as the Patient-name column) --
//   NOT a doctor-detail action. Clicking the doctor's name opens the same
//   patient-info modal. Reproduced verbatim below, not "fixed" to a
//   doctor-specific action.
// - "Day-1 Discharge" column: displayName is `$translate.instant('Day-1
//   Discharge')` -- the literal English string used AS a translation key
//   (not a normal dotted key like the other columns), and the cell value is
//   whatever getListCallback left on the row: the string "Day-1 Discharge"
//   when true, or the original (usually boolean false) value otherwise. No
//   formatting/normalization applied here either -- rendered as-is.
// - AdmissionStatus column: the real cellTemplate's little colored square
//   (`<div style='height:15px;width:20px;...;class='col-sm-2'></div>`) is
//   itself broken markup -- `class=` is nested INSIDE the unterminated
//   `style` attribute string, so no color/class ever actually applies; it
//   only ever rendered as an empty, uncolored box. That specific swatch is
//   not reproduced (nothing dead is worth re-breaking). The *real* working
//   signal is the row's `ColorCode` (computed in getListCallback, consumed
//   by vm.gridConfig.background.style to color the whole ui-grid row) --
//   our shared DataTable has no per-row background option, so that same
//   ColorCode is translated into this column's StatusBadge tone instead
//   (exact hex-to-tone mapping in toneForColorCode() above), preserving the
//   real signal (bill-locked / package-assigned / financial-discharge) in a
//   way this design system can actually render.
// - getList()'s Key:4 filter param (PatientId) is sent on every request but
//   nothing in this controller or template ever sets
//   `$scope.currentfilter.PatientId` -- always undefined. Real, unchanged,
//   inside the untouched getList().
// ---------------------------------------------------------------------------
export const AllInpatientListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  // Name/MRN uses the real `on-enter` directive semantics: dispatch only on
  // Enter, not on every keystroke (matches the original's on-enter="getList()").
  const [nameFilter, setNameFilter] = useState(currentfilter.patientnamemrn || '');
  useEffect(() => { setNameFilter(currentfilter.patientnamemrn || ''); }, [currentfilter.patientnamemrn]);

  const columns: DataTableColumn<EncounterEntity>[] = [
    {
      key: 'sno', header: 'S.No', width: '56px', align: 'center',
      render: (e) => { const i = items.indexOf(e); return i >= 0 ? i + 1 : ''; },
    },
    {
      key: 'admissiondate', header: 'Admission Date', field: 'AdmissionDate', sortable: true,
      render: (e) => (
        <div>
          <div>{formatDate(e.AdmissionDate)}</div>
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>{formatTime(e.AdmissionDate)}</div>
        </div>
      ),
    },
    { key: 'visitidentifier', header: 'IP No', field: 'VisitIdentifier', sortable: true },
    {
      key: 'patientname', header: 'Patient Name', field: 'Patient.FirstName', sortable: true,
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
      key: 'wardroom', header: 'Room Details', field: 'WardRoomMaster.RoomNo',
      render: (e) => e.WardRoomMaster ? (
        <span>
          {e.WardMaster?.WardName}/{e.WardRoomMaster?.RoomNo}/{e.WardRoomBedMaster?.BedNo}
        </span>
      ) : null,
    },
    {
      // Real quirk: this dispatches 'patientinfo' too, same as the Patient
      // Name column above -- the original cellTemplate literally reused
      // handleEvents('patientinfo', entity) here instead of a doctor action.
      key: 'doctorname', header: 'Doctor Name', field: 'Doctor.FirstName', sortable: true,
      render: (e) => (
        <span onClick={() => dispatch('patientinfo', { entity: e })} style={{ cursor: 'pointer' }}>
          {e.Doctor?.Title?.Description} {e.Doctor?.FirstName} {e.Doctor?.LastName}
        </span>
      ),
    },
    { key: 'guarantor', header: 'Guarantor', field: 'Guarantor.GuarantorName', sortable: true },
    {
      key: 'day1discharge', header: 'Day-1 Discharge', field: 'IsDay1Discharge',
      render: (e) => (typeof e.IsDay1Discharge === 'string' ? e.IsDay1Discharge : String(e.IsDay1Discharge ?? '')),
    },
    {
      key: 'status', header: 'Status', field: 'AdmissionStatus.Description', sortable: true,
      render: (e) => <StatusBadge status={e.AdmissionStatus?.Description} tone={toneForColorCode(e.ColorCode) ?? toneForStatus(e.AdmissionStatus?.Description)} />,
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Input
              label="Name"
              placeholder="NAME/MRN"
              leftIcon="fas fa-search"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('filterChange', { field: 'patientnamemrn', value: nameFilter }); }}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <DatePicker
              label="DOA"
              value={currentfilter.DOA}
              onChange={(v) => dispatch('filterChange', { field: 'DOA', value: v })}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Ward"
              value={currentfilter.WardId ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'WardId', value: Number(v) })}
              options={(lookup.Ward || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <MultiSelectCheckboxFilter
              label="Status"
              list={lookup.AdmissionStatus || []}
              selected={currentfilter.admissionstatusid}
              onChange={(value) => dispatch('filterChange', { field: 'admissionstatusid', value })}
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
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
          >
            <i className="fas fa-laptop-medical" aria-hidden="true" />
          </button>
        )}
      />

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
