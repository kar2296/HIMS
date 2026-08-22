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

interface PersonName {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface PatientInfo extends PersonName {
  MRN?: string;
  Age?: number;
  Gender?: { Description?: string };
}

interface EncounterEntity {
  Id: number;
  PatientId?: number;
  GuarantorTypeId?: number;
  AdmissionDate?: string;
  DischargeDate?: string;
  VisitIdentifier?: string;
  Patient?: PatientInfo;
  Doctor?: PersonName;
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Guarantor?: { GuarantorName?: string };
  [key: string]: any;
}

interface CurrentFilter {
  FromDate?: string;
  patientnamemrn?: string;
  DoctorId?: number;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
  lookup?: { Doctor?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// dischargedpatients.js (`DischargedPatientsController`, state
// `app.docdischargedpatient`, url `/dashboarddischarge/:id`) -- confirmed
// reachable via the already-migrated DoctorDashboardTopSection.tsx's
// "Discharged" tile (onNavigate('app.docdischargedpatient')) which flows
// through doctordashboard.js's real handleNavigation -> $scope.dischargepatients
// -> $state.go('app.docdischargedpatient'). This directory's other two files
// have different fates: doctordashboard.js's own top section was already
// migrated in an earlier session (jqx-scheduler intentionally stays native
// below it); doctordashboard/appointment.js is DEAD CODE -- it is only ever
// bound to a state via public/js/custom-states.js, which is entirely
// commented out of both index.html and dist/index.html (never loaded), so
// its state (`app..doctorappointment`, itself a literal double-dot typo in
// the source) can never be reached in production. Not migrated.
//
// Real API: Visit/Visit/GetEncounters (Key 3=6 hardcoded "discharged"
// status filter, Key 5=DoctorId, Key 11=name/MRN search, Key 28=From date).
// All API calls/business logic stay in the untouched Angular controller;
// this component only renders the filter row, grid, and pager, dispatching
// back into existing functions.
//
// Real, disclosed pre-existing bugs preserved as-is, NOT fixed:
// - Patient Name column has a literal markup typo in the real cellTemplate:
//   `"/<span>"` instead of `"/</span>"` (an unclosed nested `<span>`,
//   silently auto-corrected by browsers at parse time). Not reproducible in
//   valid JSX; rendered below as plain, correctly-nested markup with the
//   same visible text/order.
// - "Doctor Name" column reuses `handleEvents('patientinfo', entity)` --
//   the SAME action as the Patient Name column (opens the patient profile
//   modal, not any doctor-specific view) -- reproduced verbatim.
// - The actions column's cellTemplate renders a "Discharge" button
//   (`ng-click="handleEvents('discharge', entity)"`, conditional on
//   `entity.GuarantorTypeId == 6`) but `$scope.handleEvents` only implements
//   `'emr'` and `'patientinfo'` branches -- clicking "Discharge" is a real,
//   silent no-op in the original. Reproduced verbatim: the button dispatches
//   'discharge' but nothing in the hollowed controller handles it either.
// - AdmissionStatus/Ward/Department filter fields and their commented-out
//   real template blocks (Department) are dead/not rendered in the real
//   template; only From-date, Name/MRN, and Doctor filters are live and
//   reproduced here.
// ---------------------------------------------------------------------------
export const DischargedPatientsScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  const columns: DataTableColumn<EncounterEntity>[] = [
    {
      key: 'sno', header: 'S.No', width: '56px', align: 'center',
      render: (_row) => {
        const idx = items.indexOf(_row);
        return idx + 1;
      },
    },
    {
      key: 'AdmissionDate', header: 'Admission Date',
      render: (row) => formatDateTime(row.AdmissionDate),
    },
    {
      key: 'DischargeDate', header: 'Discharge Date',
      render: (row) => formatDateTime(row.DischargeDate),
    },
    { key: 'VisitIdentifier', header: 'Visit No', field: 'VisitIdentifier' },
    {
      key: 'Patient', header: 'Patient Name',
      render: (row) => {
        const p = row.Patient;
        if (!p) return null;
        return (
          <a onClick={() => dispatch('patientinfo', { entity: row })} style={{ cursor: 'pointer' }}>
            {p.Title?.Description ? <span>{p.Title.Description}&nbsp;</span> : null}
            <span>{p.FirstName}&nbsp;</span>
            <span><b>{p.LastName}</b>&nbsp;</span>
            <span>/</span>
            <span>{p.MRN}&nbsp;</span>
            <span>/</span>
            <span>{p.Age}&nbsp;</span>
            <span>/</span>
            <span>{p.Gender?.Description}</span>
          </a>
        );
      },
    },
    {
      key: 'RoomDetails', header: 'Room Details',
      render: (row) => {
        if (!row.WardRoomMaster) return null;
        return (
          <span>
            {row.WardMaster?.WardName}/{row.WardRoomMaster?.RoomNo}
            {row.WardRoomBedMaster ? `/${row.WardRoomBedMaster.BedNo}` : ''}
          </span>
        );
      },
    },
    {
      key: 'DoctorName', header: 'Doctor Name',
      render: (row) => (
        <span onClick={() => dispatch('patientinfo', { entity: row })} style={{ cursor: 'pointer' }}>
          {row.Doctor?.Title?.Description}&nbsp;{row.Doctor?.FirstName}&nbsp;{row.Doctor?.LastName}
        </span>
      ),
    },
    { key: 'Guarantor', header: 'Guarantor', field: 'Guarantor.GuarantorName' },
  ];

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <h3 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0 }}>Discharged Patients</h3>
        <button
          onClick={() => dispatch('doctordashboard')}
          title="Dashboard"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontSize: 20 }}
        >
          <i className="fas fa-th-large" aria-hidden="true" />
        </button>
      </div>

      <Card>
        <FilterBar>
          <DatePicker
            label="From Date"
            value={currentfilter.FromDate ?? ''}
            onChange={(val) => dispatch('filterChangeAndSearch', { field: 'FromDate', value: val })}
          />
          <Input
            label="Name"
            placeholder="NAME/MRN"
            value={currentfilter.patientnamemrn ?? ''}
            onChange={(e) => dispatch('filterChange', { field: 'patientnamemrn', value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
          />
          <Select
            label="Doctor"
            value={currentfilter.DoctorId ?? -1}
            onChange={(value) => dispatch('filterChangeAndSearch', { field: 'DoctorId', value: Number(value) })}
            options={(lookup.Doctor || []).map((d) => ({ value: d.Id, label: d.Text }))}
          />
        </FilterBar>
      </Card>

      <DataTable<EncounterEntity>
        columns={columns}
        rows={items}
        rowKey={(row) => row.Id}
      />

      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => dispatch('pageChange', { page })}
      />
    </div>
  );
};
