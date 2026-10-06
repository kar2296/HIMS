import React, { useEffect, useRef, useState } from 'react';
import { colors, radii, spacing, typography, shadows, zIndex } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
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
}

interface EncounterEntity {
  Id: number;
  PatientId?: number;
  GuarantorTypeId?: number;
  AdmissionDate?: string;
  VisitIdentifier?: string;
  Patient?: PatientInfo;
  Doctor?: PersonName;
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Guarantor?: { GuarantorName?: string };
  AdmissionStatus?: { Description?: string };
  [key: string]: any;
}

interface CurrentFilter {
  patientnamemrn?: string;
  WardId?: number;
  // Comma-joined string of AdmissionStatus ids, matching the real
  // multiselectchk component (public/vendor/components/multiselectchk.js).
  admissionstatusid?: string;
  [key: string]: any;
}

interface CurrentContext {
  option?: string; // 'myinpatients' | 'allinpatients'
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
  currentcontext?: CurrentContext;
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

// Minimal multi-checkbox dropdown reproducing the real <multiselectchk> component
// (public/vendor/components/multiselectchk.js): `selected` is a comma-joined
// string of numeric Ids, `list` is [{Id, Text}]. No shared design-system
// multi-select exists yet, so this is kept local to this screen (same choice
// already made on the sibling AllInpatientListScreen.tsx).
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
// currentinpatients (`app.currentinpatient`, singular -- a real, separate,
// standalone top-level state confirmed reachable via `$state.go(
// 'app.currentinpatient')` from three real dashboard screens: labdashboard.js,
// risdashboard.js, and insurancedashboard.js. NOT the same screen as the
// already-migrated CurrentInpatientListScreen.tsx, which bridges a
// differently-named, differently-scoped state (`app.currentinpatients`,
// plural, in the unrelated `public/views/inpatient/currentinpatients/`
// directory) -- the two happen to share a near-identical name but are
// distinct controllers/templates/states with no relation to each other.
//
// Real API: Visit/Visit/GetEncounters (same family as the IPManagement
// all/my-inpatient screens). All API calls/business logic stay in the
// untouched Angular controller; this component only renders the toggle,
// filter row, grid, and pager, dispatching back into existing functions.
//
// Real, disclosed pre-existing bugs/dead code preserved as-is, NOT fixed:
// - THE VISIBLE DATE FILTER IS COMPLETELY DEAD: getList() reads
//   `$scope.currentfilter.admissiondate` to compute From/To, but the real
//   template's only `ng-model="currentfilter.admissiondate"` date-picker
//   input is entirely inside an HTML comment block (never rendered) --
//   there is no live UI control for it anywhere. From/To are therefore
//   always null/undefined in production. Not reproduced as a fabricated
//   filter control here (nothing real to wire it to).
// - The real "Doctor" filter (an <autosearch> bound to currentfilter.DoctorId)
//   and the "Department" filter (a ui-select bound to currentfilter.DepartmentId)
//   are both likewise entirely commented out in the template -- both values
//   stay fixed at their controller-init defaults (current logged-in user's
//   id / department) for the whole session. Not exposed as live filters here.
// - Patient Name column: the real cellTemplate has a literal markup typo --
//   a `/` separator followed by `<span>` where every other separator in the
//   same cellTemplate closes with `</span>` (i.e. `"/<span>"` instead of
//   `"/</span>"`), leaving an unclosed nested `<span>` that swallows the
//   rest of the row's markup into it (browsers silently auto-correct this at
//   parse time). Not reproducible or meaningful inside valid JSX; rendered
//   below as plain, correctly-nested markup with the same visible text/order.
// - "Doctor Name" column reuses `handleEvents('patientinfo', entity)` (the
//   same action as the Patient Name column) rather than any doctor-specific
//   action -- reproduced verbatim, not "fixed" to a distinct handler.
// - AdmissionStatus column's real colored-square markup is itself broken
//   (`class=` nested inside an unterminated `style="..."` attribute string),
//   so it only ever rendered as an empty, uncolored box in production. That
//   specific dead swatch is not reproduced; the status text itself is shown
//   plainly (no color-coding is computed/exposed anywhere else in this
//   controller for this screen, unlike the sibling allinpatient.js which has
//   a real ColorCode).
// - Room Details column guards each fragment separately, exactly as the real
//   cellTemplate does: WardName/RoomNo (+ separators) only render when
//   `WardRoomMaster` is present; BedNo is gated independently on
//   `WardRoomBedMaster`. Reproduced with the same two independent guards
//   (not merged into one, unlike the sibling allinpatient.js's single guard).
// - Discharge action (`GuarantorTypeId == 6`) opens `app.freecheckout` via
//   `handleEvents('discharge', entity)`, exactly as in the untouched
//   controller -- reproduced as a conditional row action, not a permanent one.
// - `$scope.Items`, `$scope.Encounter`, `$scope.Patient` are all set at
//   controller init but never read/written again anywhere else in this
//   file -- dead state, not exposed in reactProps.
// - The bottom-of-file `<script type="text/ng-template" id=
//   "currentinPatientsTemplate.html">` block in the real template is dead
//   markup: the live columnDefs never reference that template id (the only
//   commented-out columnDefs array that once did is itself disabled). Not
//   reproduced here.
// ---------------------------------------------------------------------------
export const CurrentInpatientScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    currentcontext = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  // Name/MRN uses the real `on-enter` directive semantics: dispatch only on
  // Enter, not on every keystroke.
  const [nameFilter, setNameFilter] = useState(currentfilter.patientnamemrn || '');
  useEffect(() => { setNameFilter(currentfilter.patientnamemrn || ''); }, [currentfilter.patientnamemrn]);

  const option = currentcontext.option || 'myinpatients';
  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  const optionBtnStyle = (selected: boolean): React.CSSProperties => ({
    border: 'none',
    cursor: 'pointer',
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: radii.sm,
    backgroundColor: selected ? colors.primary : colors.surfaceMuted,
    color: selected ? '#fff' : colors.textMain,
    fontFamily: typography.fontFamily,
  });

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
    { key: 'visitidentifier', header: 'Visit No', field: 'VisitIdentifier', sortable: true },
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
      render: (e) => (
        <span>
          {e.WardRoomMaster && (<>{e.WardMaster?.WardName}/{e.WardRoomMaster?.RoomNo}/</>)}
          {e.WardRoomBedMaster && e.WardRoomBedMaster.BedNo}
        </span>
      ),
    },
    {
      // Real quirk: this dispatches 'patientinfo' too, same as the Patient
      // Name column above -- see disclosure above.
      key: 'doctorname', header: 'Doctor Name', field: 'Doctor.FirstName', sortable: true,
      render: (e) => (
        <span onClick={() => dispatch('patientinfo', { entity: e })} style={{ cursor: 'pointer' }}>
          {e.Doctor?.Title?.Description} {e.Doctor?.FirstName} {e.Doctor?.LastName}
        </span>
      ),
    },
    { key: 'guarantor', header: 'Guarantor', field: 'Guarantor.GuarantorName', sortable: true },
    { key: 'status', header: 'Status', field: 'AdmissionStatus.Description', sortable: true },
  ];

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>In Patients</h3>
        <button
          type="button"
          title="Doctor Dashboard"
          onClick={() => dispatch('doctorDashboard')}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary, fontSize: 20 }}
        >
          <i className="fas fa-th-large" aria-hidden="true" />
        </button>
      </div>

      {/* My In-Patients / All In-Patients toggle -- mirrors uib-btn-radio + ng-click="getList()" */}
      <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.md }}>
        <button type="button" style={optionBtnStyle(option === 'myinpatients')} onClick={() => dispatch('toggleOption', { option: 'myinpatients' })}>
          My In-Patients
        </button>
        <button type="button" style={optionBtnStyle(option === 'allinpatients')} onClick={() => dispatch('toggleOption', { option: 'allinpatients' })}>
          All In-Patients
        </button>
      </div>

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
          <div style={{ minWidth: 200 }}>
            <Select
              label="Ward"
              value={currentfilter.WardId ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'WardId', value: Number(v) })}
              options={(lookup.Ward || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <MultiSelectCheckboxFilter
              label="Status"
              list={lookup.AdmissionStatus || []}
              selected={currentfilter.admissionstatusid}
              onChange={(value) => dispatch('filterChangeAndSearch', { field: 'admissionstatusid', value })}
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
          <>
            <button
              type="button"
              title="EMR"
              onClick={() => dispatch('emr', { entity })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
            >
              <i className="fas fa-laptop-medical" aria-hidden="true" />
            </button>
            {entity.GuarantorTypeId === 6 && (
              <button
                type="button"
                onClick={() => dispatch('discharge', { entity })}
                style={{ border: 'none', background: '#d15ef7', color: '#fff', borderRadius: radii.sm, padding: '4px 8px', marginLeft: spacing.xs, cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}
              >
                Discharge
              </button>
            )}
          </>
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
