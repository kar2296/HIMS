import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DischargeEncounterEntity {
  Id: number;
  PatientId?: number;
  AdmissionDate?: string;
  VisitIdentifier?: string;
  Patient?: {
    Id?: number;
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: string | number;
    Gender?: { Description?: string };
    PhotoPath?: string;
  };
  Doctor?: {
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
  };
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Guarantor?: { GuarantorName?: string };
  AdmissionStatus?: { Description?: string };
  [key: string]: any;
}

interface CurrentFilter {
  patientnamemrn?: string;
  From?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.From (moment/Date) by the controller bridge
  To?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.To (Date) by the controller bridge
  WardId?: number;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: DischargeEncounterEntity[];
  lookup?: { Ward?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real ngformatdate 'dd-MMM-yyyy' filter used by the AdmissionDate cellTemplate.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Mirrors the 'HH:mm' filter applied to the same AdmissionDate value.
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// patientdischarge-list -- the "Patient Discharge" grid under the
// app.inpatienttab.patientdischarge child state (renders inside the already-
// migrated inpatienttab shell's <div ui-view>). Read-only summary grid,
// server-side paginated (Visit/Visit/GetEncounters with a fixed admission
// status filter for discharged encounters), no native sibling directives in
// the real template (no <patientbanner> here).
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - The Name/MRN box uses the real on-enter directive: typing does NOT
//   re-query (no ng-change on that field) -- only pressing Enter calls
//   getList(). Reproduced here via a plain keydown check dispatching a
//   separate 'search' action; every keystroke still updates the filter value
//   via 'filterChange' (matching real two-way ng-model binding) without
//   triggering a fetch.
// - getList() has a real side effect: whenever patientnamemrn is non-empty,
//   it unconditionally blanks $scope.currentfilter.From/To (the SAME bound
//   object backing the date inputs) before every request. So searching by
//   name visibly clears the From/To date pickers in the real app today --
//   reproduced unchanged (the controller bridge only mirrors currentfilter
//   back into reactProps after getList runs; it does not restore the dates).
// - currentfilter.From is seeded via utl.Formatter.addDays(...), which
//   returns a moment object, while currentfilter.To is seeded via
//   utl.Formatter.getCurrentDate(), a plain Date -- an inconsistent type the
//   real controller has always had. The bridge normalizes both to ISO
//   yyyy-mm-dd strings for this component and reconstructs a local Date on
//   the way back, so this quirk is invisible here but is not a behavior
//   change to the underlying data getList() sends.
// - The real getList() Params array hardcodes Key 3 (admission status) to 6
//   and Key 15 to 2 regardless of currentfilter.admissionstatusid/anything
//   else -- currentfilter.admissionstatusid, DoctorId, FacilityId,
//   DepartmentId are all set on currentfilter but never actually sent to the
//   server (their Params entries are commented out in the real controller).
//   Not exposed here since nothing in the real template reads them either.
// - The Doctor-name column is a SECOND columnDef also literally named
//   field: "Patient" (duplicate field key with the patient-name column), and
//   clicking the doctor's name dispatches handleEvents('patientinfo', ...)
//   -- the SAME "show patient profile" action as the patient-name column,
//   not a doctor-info action. Reproduced verbatim: clicking the doctor name
//   opens the patient profile modal, not anything doctor-related.
// - The WardRoomMaster/room/bed cell has inconsistent ng-if guards in the
//   real cellTemplate: WardName, the first "/", RoomNo and the second "/"
//   are ALL gated on entity.WardRoomMaster (not on WardMaster's own
//   existence), while BedNo is gated independently on WardRoomBedMaster. So
//   it's possible to see a bare bed number with no ward/room text/separators
//   at all if WardRoomMaster is falsy but WardRoomBedMaster is set.
//   Reproduced with the same guards.
// - The AdmissionStatus cellTemplate contains a malformed color-indicator
//   div (`style='...;class='col-sm-2'>`, a class attribute nested inside the
//   open style-attribute string) -- it has never actually applied any
//   background-color or class in the browser, so the "status dot" has always
//   rendered as an invisible/blank box. Reproduced as an empty, uncolored
//   placeholder box next to the status text rather than fabricating a
//   working color-coded indicator that was never live.
// - The real custom-table directive (public/js/custom-table.html /
//   customTableController.reOrder) makes EVERY column header clickable and
//   sorts unconditionally via `a[field].toLowerCase()` with no per-column
//   opt-in/opt-out. For columns whose "field" resolves to a nested OBJECT
//   (Patient, WardRoomMaster) or a NUMBER (Id, the actions column), calling
//   .toLowerCase() throws a real client-side TypeError today -- i.e.
//   clicking the S.No*/Patient Name/Doctor Name/Room Details/Actions column
//   headers is currently broken in production. (*S.No's field literally
//   doesn't exist on the row data, so it no-ops rather than crashing.)
//   Reproducing an actual uncaught exception inside this shared DataTable
//   isn't practical/safe, so instead only the columns whose original sort
//   value is a real STRING (AdmissionDate, IP No, Guarantor, Status) are
//   marked sortable here; the rest are left non-sortable (header click does
//   nothing) as the closest faithful stand-in for "sorting is broken there".
// - doctor_dashboard(), bed_management(), patientprofiledetails(), print(),
//   openModal(), and the handleEvents('discharge', ...) branch are all real
//   functions on this controller, but NONE of them are wired to any element
//   in the real patientdischarge.html template -- they are dead code today.
//   Not rendered/dispatched here, matching the live template exactly.
// - The funnel-less Ward <ui-select> has no "All wards" sentinel option in
//   the real markup; options come straight from lookup.Ward as returned by
//   the server, unmodified here.
// ---------------------------------------------------------------------------
export const PatientDischargeListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const numberedItems = items.map((it, i) => ({ ...it, __rowNo: i + 1 }));

  const columns: DataTableColumn<DischargeEncounterEntity & { __rowNo: number }>[] = [
    { key: 'sno', header: 'S.No', field: '__rowNo', align: 'center', width: '70px' },
    {
      key: 'admissiondate', header: 'Admission Date', field: 'AdmissionDate', sortable: true,
      render: (e) => (
        <span>{formatDate(e.AdmissionDate)} {formatTime(e.AdmissionDate)}</span>
      ),
    },
    { key: 'ipno', header: 'IP No', field: 'VisitIdentifier', sortable: true },
    {
      key: 'patient', header: 'Patient Name',
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ cursor: 'pointer', color: colors.primary }}
        >
          {e.Patient?.Title?.Description ? <span>{e.Patient.Title.Description}&nbsp;</span> : null}
          <span>{e.Patient?.FirstName}&nbsp;</span>
          <span>{e.Patient?.LastName}&nbsp;</span>
          <span>/</span>
          <span>{e.Patient?.MRN}&nbsp;</span>
          <span>/</span>
          <span>{e.Patient?.Age}&nbsp;</span>
          <span>/</span>
          <span>{e.Patient?.Gender?.Description}</span>
        </a>
      ),
    },
    {
      key: 'room', header: 'Room Details',
      render: (e) => (
        <>
          {e.WardRoomMaster && <span>{e.WardMaster?.WardName}</span>}
          {e.WardRoomMaster && <span>/</span>}
          {e.WardRoomMaster && <span>{e.WardRoomMaster?.RoomNo}</span>}
          {e.WardRoomMaster && <span>/</span>}
          {e.WardRoomBedMaster && <span>{e.WardRoomBedMaster?.BedNo}</span>}
        </>
      ),
    },
    {
      key: 'doctor', header: 'Doctor Name',
      // Real bug: clicking this dispatches 'patientinfo' (same as the patient-name
      // column above), not a doctor-info action -- see disclosure comment above.
      render: (e) => (
        <span
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ cursor: 'pointer' }}
        >
          <span>{e.Doctor?.Title?.Description}&nbsp;</span>
          <span>{e.Doctor?.FirstName}&nbsp;</span>
          <span>{e.Doctor?.LastName}</span>
        </span>
      ),
    },
    { key: 'guarantor', header: 'Guarantor', field: 'Guarantor.GuarantorName', sortable: true },
    {
      key: 'status', header: 'Status', field: 'AdmissionStatus.Description', sortable: true,
      render: (e) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          {/* Real cellTemplate's color-indicator div; never actually colored -- see disclosure comment above. */}
          <div style={{ height: 15, width: 20, borderRadius: 7 }} />
          <span>{e.AdmissionStatus?.Description}</span>
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (e) => (
        <button
          type="button"
          title="EMR"
          onClick={() => dispatch('emr', { entity: e })}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
        >
          <i className="fas fa-laptop-medical" aria-hidden="true" />
        </button>
      ),
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Name"
              leftIcon="fas fa-search"
              placeholder="NAME/MRN"
              value={currentfilter.patientnamemrn ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patientnamemrn', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') dispatch('search'); }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="From"
              value={currentfilter.From ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'From', value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="To"
              value={currentfilter.To ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'To', value: v })}
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
        </FilterBar>
      </Card>

      <DataTable<DischargeEncounterEntity & { __rowNo: number }>
        columns={columns}
        rows={numberedItems}
        rowKey={(e) => e.Id}
        emptyText="No records"
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
