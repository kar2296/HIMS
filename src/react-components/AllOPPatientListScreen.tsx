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
  Id?: number;
  MRN?: string;
  Age?: string | number;
  Gender?: { Description?: string };
  FamilyUniqueId?: string;
  Remark?: { Remarks?: string };
  PhotoPath?: string;
  Photo?: string;
}

interface AppointmentDisplay {
  TokenNo?: string;
}

interface AppointmentInfo {
  StartTime?: string;
  EndTime?: string;
  AppointmentDisplays?: AppointmentDisplay[];
}

interface EncounterInfo {
  Id?: number;
  DoctorId?: number;
  BillingRemarks?: string;
  PatientConditions?: Array<{ DiagnosisName?: string;[key: string]: any }>;
}

interface EncounterDoctorEntity {
  Id: number; // EncounterDoctor Id -- see disclosure note on the Actions column's sort behavior below
  PatientId?: number;
  AppointmentId?: number;
  DoctorId?: number;
  OrderConsultTypeId?: number;
  VirtualOrderId?: number;
  EncounterDoctorStatus?: number; // 1 = waiting for doctor (shows Attend), otherwise EMR is shown
  StartDate?: string;
  Appointment?: AppointmentInfo;
  Encounter?: EncounterInfo;
  Patient?: PatientInfo;
  Doctor?: PersonName & { OPDRoomId?: number };
  OrderConsultType?: { Description?: string };
  ConsultationStatus?: { Description?: string };
  // Both set server-side by the real getListCallback (unchanged), not part of the raw API row shape:
  TokenNo?: string;
  PatientDiagnosis?: { DiagnosisName?: string };
  [key: string]: any;
}

interface CurrentFilter {
  patientname?: string;
  visitdate?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.visitdate (a plain Date) by the controller bridge
  consultationstatusid?: number;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterDoctorEntity[];
  lookup?: { ConsultationStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate's own 'dd-MMM-yyyy' / 'HH:mm' AngularJS date filters on StartDate.
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

// ---------------------------------------------------------------------------
// alloppatientlist (app.oppatienttab.allcheckin) -- renders inside the
// already-migrated `oppatienttab` shell's <div ui-view>. This component is
// ONLY this screen's own filter row + grid + pager; the tab header lives in
// the shell. Read-only summary grid, server-side paginated
// (Visit/EncounterDoctor/GetEncounterDoctors), same family as
// AllInpatientListScreen/MyInpatientListScreen/PatientDischargeListScreen.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - loadPhotos()/getPatientProfilePic() are real and their call site
//   (inside getListCallback) is NOT commented out here (unlike the
//   inpatient siblings) -- but loadPhotos() loops over $scope.gridData,
//   which is initialized to [] at the top of this controller and is NEVER
//   reassigned anywhere else in the file. getListCallback only ever
//   populates vm.gridConfig.data (a different array). So loadPhotos() always
//   iterates zero items and the photo-fetch is completely dead in practice,
//   even though it looks "wired". reactProps.items is sourced from the real,
//   populated vm.gridConfig.data (what the grid actually renders); no
//   photo/avatar is rendered here, matching what the real page shows today.
// - The real $timeout(...) autofocuses `$('#patientname')` 1s after load,
//   but the actual Name/MRN input's id in the template is "pid", not
//   "patientname" -- the selector matches nothing, so autofocus silently
//   never happens. Not reproduced (no autoFocus added to the Input below).
// - Name/MRN uses the real `on-enter` directive semantics: typing does NOT
//   re-query (no ng-change on that field) -- only pressing Enter calls
//   getList(). Reproduced via a keydown check dispatching a separate
//   'search' action; every keystroke still updates the filter value via
//   'filterChange' without triggering a fetch. Date and Consultation Status
//   both have a real ng-change="getList()" and refetch immediately.
// - getList()'s real Params logic: whenever patientname is non-empty, the
//   Visit Date (Key 22) and Consultation Status (Key 4) params are NEVER
//   added to the request -- searching by name silently ignores whatever
//   date/status the UI still shows selected. When patientname is empty,
//   visitdate is required client-side (a null/cleared date shows
//   utl.Alert.showErrorMsg('Please Select Date...') and aborts the fetch).
//   Reproduced unchanged -- the controller bridge only mirrors currentfilter
//   back into reactProps after getList() runs.
// - Patient Name cellTemplate has malformed markup: a stray unmatched
//   `</span>` immediately after the `<b>{{Title.Description}}</b>` (no
//   opening `<span>` before it), and a literal "/<span>" that OPENS a new,
//   never-closed `<span>` where a closing `</span>` was clearly intended.
//   Schedule Time's and Doctor Name's cellTemplates both end with a stray
//   `</a>` despite Doctor Name never opening an `<a>` tag anywhere in its
//   template at all -- i.e. Doctor Name has NO click handler in production
//   (unlike Patient Name, which does). Browsers silently auto-correct this
//   soup, so nothing is reproduced as broken JSX; only the real, observable
//   behavior (Doctor Name is plain non-interactive text) is preserved.
// - handleEvents('emr', entity) builds the EMR state's `eid` param from
//   entity.EncounterId -- a flat property that does not exist on this
//   screen's rows (the encounter id is nested at entity.Encounter.Id, which
//   is exactly what the 'attend' branch two lines above correctly uses
//   instead). So today, clicking the EMR icon on this screen always
//   navigates with eid: undefined. Real, unchanged bug inside the untouched
//   handleEvents(); the entity object is passed through here exactly as the
//   real row data has it, without patching in a corrected id.
// - Several column displayNames pass a literal English phrase straight into
//   $translate.instant(...) instead of a real dotted i18n key (e.g.
//   'Schedule Time', 'FamilyCase Id', 'Visit Reason', 'Consult Type',
//   'Token #', 'Remarks', 'Diagnosis') -- happens to resolve to that same
//   literal text since no such translation key exists. Reproduced as plain
//   English headers, matching what renders today.
// - The Consultation Status filter's label translation key is
//   `billing.servicebilldiscounts.approvalstatus.lbl` -- a key borrowed from
//   the Billing module, not a checkedinpatients-specific one. It happens to
//   resolve to "Status" either way, so this is cosmetically harmless;
//   reproduced as "Status".
// - Sort-crash class (same shared custom-table `a[field].toLowerCase()`
//   behavior documented on sibling screens, public/js/app.js
//   customTableController.reOrder): only columns whose field resolves to a
//   genuine string are marked sortable here (Date, Schedule Time, MRN No.,
//   FamilyCase Id, Visit Type, Visit Reason, Consult Type, Token #, Remarks,
//   Diagnosis, Status). "S.No", "Patient Name" and "Doctor Name" use field
//   names ("S.No" / "Name" / "DoctorName") that don't exist anywhere on the
//   row data, so clicking those headers already no-ops in production (the
//   dotted-path reduce returns undefined, never reaching .toLowerCase()) --
//   left non-sortable to match that no-op, not to fabricate new behavior.
//   The Actions column's real field is literally "Id" -- a NUMBER -- and
//   `.toLowerCase()` on a number throws a real client-side TypeError today
//   (i.e. clicking that header is currently broken in production).
//   Reproducing an actual uncaught exception inside this shared DataTable
//   isn't practical/safe, so it's left non-sortable instead, the same
//   faithful stand-in already used on sibling screens for this exact bug
//   class.
// - A large block of real controller functions have zero call sites
//   anywhere in the real alloppatientlist.html or the rest of this
//   controller: backToList(), changeConsultantStatus(), onConfirmation()/
//   attendPatientAfterConfirm(), getSecPin()/getattendPatConf()/gotoEMR(),
//   changeFollwUpVisit(), canShowAction(), handleCheckout()/
//   patientTrackerCallback(), and updateAppointmentStatus()/
//   updateEncounterStatus()/updateEncounterDoctorStatus()/
//   updatePatientBills()/getPatientBills()/updateCheckoutStatus(). None are
//   wired to any element in the real template -- not rendered/dispatched
//   here, matching the live page exactly.
// - $scope.currentcontext.DoctorId is set but never read anywhere in this
//   controller or template -- dead state, not exposed via reactProps.
// ---------------------------------------------------------------------------
export const AllOPPatientListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const numberedItems = items.map((it, i) => ({ ...it, __rowNo: i + 1 }));

  const columns: DataTableColumn<EncounterDoctorEntity & { __rowNo: number }>[] = [
    { key: 'sno', header: 'S.No', field: '__rowNo', align: 'center', width: '64px' },
    {
      key: 'date', header: 'Date', field: 'StartDate', sortable: true,
      render: (e) => (
        <div>
          <div>{formatDate(e.StartDate)}</div>
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>{formatTime(e.StartDate)}</div>
        </div>
      ),
    },
    {
      key: 'scheduletime', header: 'Schedule Time', field: 'Appointment.StartTime', sortable: true,
      render: (e) => (
        <span>{e.Appointment?.StartTime} - {e.Appointment?.EndTime}</span>
      ),
    },
    { key: 'mrn', header: 'MRN No.', field: 'Patient.MRN', sortable: true },
    { key: 'familycaseid', header: 'FamilyCase Id', field: 'Patient.FamilyUniqueId', sortable: true },
    {
      key: 'patientname', header: 'Patient Name',
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ cursor: 'pointer', color: colors.primary, textDecoration: 'none' }}
        >
          {e.Patient?.Title?.Description ? <b>{e.Patient.Title.Description}</b> : null}{' '}
          <b>{e.Patient?.FirstName}</b> {e.Patient?.LastName} / {e.Patient?.MRN} / {e.Patient?.Age} / {e.Patient?.Gender?.Description}
        </a>
      ),
    },
    { key: 'visittype', header: 'Visit Type', field: 'Encounter.VisitType.Description', sortable: true },
    { key: 'visitreason', header: 'Visit Reason', field: 'Patient.Remark.Remarks', sortable: true },
    {
      // Real bug: no ng-click anywhere in this cellTemplate -- Doctor Name is
      // plain, non-interactive text in production (see disclosure comment above).
      key: 'doctorname', header: 'Doctor Name',
      render: (e) => (
        <span>{e.Doctor?.Title?.Description} {e.Doctor?.FirstName} {e.Doctor?.LastName}</span>
      ),
    },
    { key: 'consulttype', header: 'Consult Type', field: 'OrderConsultType.Description', sortable: true },
    { key: 'tokenno', header: 'Token #', field: 'TokenNo', sortable: true },
    { key: 'remarks', header: 'Remarks', field: 'Encounter.BillingRemarks', sortable: true },
    { key: 'diagnosis', header: 'Diagnosis', field: 'PatientDiagnosis.DiagnosisName', sortable: true },
    { key: 'status', header: 'Status', field: 'ConsultationStatus.Description', sortable: true },
    {
      key: 'actions', header: 'Action',
      render: (e) => (
        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
          {e.EncounterDoctorStatus === 1 ? (
            <button
              type="button" title="Attend"
              onClick={() => dispatch('attend', { entity: e })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
            >
              <i className="fas fa-hospital-user" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button" title="EMR"
              onClick={() => dispatch('emr', { entity: e })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
            >
              {/* Real class list is literally "fas solid fa-laptop-medical" -- the extra
                  "solid" token is not a valid FA class but browsers just ignore unknown
                  classes, so it's harmless. Reproduced verbatim, not cleaned up. */}
              <i className="fas solid fa-laptop-medical" aria-hidden="true" />
            </button>
          )}
          <button
            type="button" title="Call"
            onClick={() => dispatch('call', { entity: e })}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
          >
            <i className="fas fa-phone-square-alt" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Name"
              leftIcon="fas fa-search"
              placeholder="Search Patient / UHID / MObile #"
              value={currentfilter.patientname ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patientname', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') dispatch('search'); }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date"
              value={currentfilter.visitdate ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'visitdate', value: v })}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Status"
              value={currentfilter.consultationstatusid ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'consultationstatusid', value: Number(v) })}
              options={(lookup.ConsultationStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
        </FilterBar>
      </Card>

      <DataTable<EncounterDoctorEntity & { __rowNo: number }>
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
