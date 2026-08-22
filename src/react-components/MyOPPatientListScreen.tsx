import React, { useEffect, useState } from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
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

interface AppointmentDisplay {
  TokenNo?: string | number;
}

interface EncounterEntity {
  Id: number;
  PatientId?: number;
  AppointmentId?: number;
  StartDate?: string;
  TokenNo?: string | number;
  EncounterDoctorStatus?: number;
  DoctorId?: number;
  OrderConsultTypeId?: number;
  VirtualOrderId?: number;
  Appointment?: {
    StartTime?: string;
    EndTime?: string;
    AppointmentDisplays?: AppointmentDisplay[];
  };
  Patient?: {
    Id?: number;
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    FamilyUniqueId?: string;
    Age?: number;
    Gender?: NameDescription;
    PhotoPath?: string;
    Photo?: string;
    Remark?: { Remarks?: string };
  };
  Encounter?: {
    Id?: number;
    DoctorId?: number;
    VisitType?: NameDescription;
    BillingRemarks?: string;
    PatientConditions?: { DiagnosisName?: string }[];
  };
  PatientDiagnosis?: { DiagnosisName?: string };
  Doctor?: {
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
    OPDRoomId?: number;
  };
  ConsultationStatus?: NameDescription;
  [key: string]: any;
}

interface CurrentFilter {
  patientname?: string;
  consultationstatusid?: number;
  visitdate?: string; // native value passed straight through by the bridge, same as the DatePicker's value contract
  FacilityId?: number;
  DepartmentId?: number;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
  lookup?: { ConsultationStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real {{entity.StartDate | date : 'dd-MMM-yyyy'}} cellTemplate formatting.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Mirrors {{entity.StartDate| date: 'HH:mm'}}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// mycheckin -- "My OP Patients" tab under app.oppatienttab (checked-in OP
// patients belonging to the logged-in doctor). Reachable only as a child
// state of the already-migrated oppatienttab shell, rendering inside that
// shell's <div ui-view> -- no tab header of its own, no modal usage besides
// what handleEvents already opens.
//
// UI-MODERNIZATION RETROFIT (same pattern as MyInpatientListScreen /
// AllInpatientListScreen / PatientDischargeListScreen): filter row and grid
// render through the shared design-system components (Input/SearchSelect/
// DatePicker/DataTable/Pagination/StatusBadge/Card+FilterBar) instead of the
// original ui-grid cellTemplates. NOTHING behavioral changed: same
// dispatch() calls, same field names, same server-side pagination/filtering
// (every filter dispatch still ends up calling the real unchanged getList()).
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
//
// - PHOTOS NEVER LOAD (dead data path): the real getListCallback builds
//   vm.gridConfig.data (used for the grid) but never assigns to
//   $scope.gridData (which stays the initial empty array declared at the
//   top of the controller). loadPhotos()/getPatientProfilePic() iterate
//   $scope.gridData, so they always iterate zero rows -- profile photos are
//   silently never fetched for this screen in production. No Photo column
//   exists in the real columnDefs either way, so this has no visible column
//   here, but it is a confirmed dead code path, not reproduced/fixed.
//
// - BROKEN SORT COLUMN MAPPINGS: the real custom-table directive resolves a
//   column's `field` by splitting on '.' and reducing into the row, then
//   compares with `a.toLowerCase()` (public/js/app.js `reOrder`). Several
//   columns here have a `field` that does not correspond to any real
//   property on the row entity, so clicking their header to sort is a
//   silent no-op in production (the resolved value is always undefined):
//     - "S.No" -- the field literally contains a dot ("S.No"), which the
//       path-resolver misreads as a nested path S -> No (entity.S doesn't
//       exist); this is a copy of the identical bug already found in the
//       sibling myinpatient.js S.No column.
//     - "Name" (Patient Name column) -- no entity.Name exists; the template
//       only ever reads entity.Patient.*.
//     - "DoctorName" (Doctor Name column) -- no entity.DoctorName exists;
//       the template only ever reads entity.Doctor.*.
//   All three are reproduced here as sortable (matching the real clickable
//   header) with `field` set to the same broken path, so clicking them is
//   an equally inert no-op via this shared DataTable's null-safe resolver
//   (it never crashes, but it never reorders anything either -- the same
//   observable behavior as production).
//   Separately, "TokenNo" is a REAL field (set in getListCallback) but is
//   plausibly numeric; the real custom-table's `a.toLowerCase()` compare
//   would throw a runtime TypeError if a user ever sorted by it and the
//   value were a number. This shared DataTable's compare function
//   stringifies before comparing and does not crash, so that crash is not
//   reproduced (same as how the sibling screens did not reproduce
//   component-level rendering bugs that this shared DataTable supersedes);
//   noted here for disclosure only.
//
// - MALFORMED CELLTEMPLATE MARKUP (never fixed in source, harmless because
//   browsers tolerate unbalanced inline tags): the real "Schedule Time" and
//   "Doctor Name" cellTemplates each end with a stray closing `</a>` with no
//   matching opening `<a>` anywhere in the template. The real "Patient Name"
//   cellTemplate opens `<a ng-click=...>` but its very first `{{...}}` binding
//   is immediately followed by an unmatched `</span>` (no corresponding
//   open), and later has `"<span >/<span>"` -- an unclosed nested `<span>`
//   with no closing tag of its own. None of this affects what is rendered
//   (same text/order/separators reproduced below in valid JSX); disclosed,
//   not silently "fixed" as clean markup, because valid JSX cannot literally
//   reproduce unbalanced tags.
//
// - "Doctor Name" column is NOT clickable in the real template (no ng-click
//   at all on that cellTemplate) -- unlike some sibling screens where the
//   doctor-name cell was mistakenly wired to the patient-info action, here
//   it is simply plain, non-interactive text. Reproduced as plain text.
//
// - BORROWED / MISMATCHED TRANSLATE KEYS (copy-paste leftovers, not fixed):
//     - "S.No" column's displayName uses translate key
//       'inventory.purchaseorders.sno.lbl' -- borrowed from the unrelated
//       Purchase Orders module, not an OP-registration-specific key.
//     - The Status filter's label uses translate key
//       'billing.servicebilldiscounts.approvalstatus.lbl' -- borrowed from a
//       billing discounts "Approval Status" screen, even though this filter
//       actually drives the ConsultationStatus lookup/filter. Whatever that
//       key actually renders as in production ("Approval Status" or similar)
//       is what real users see, not a "Consultation/Status" label. Not
//       corrected here -- left as a plain "Approval Status" label to match
//       the real (mismatched) source key's evident intent.
//
// - LARGE DEAD-CODE SURFACE (left completely untouched, not migrated,
//   because none of it is reachable from the real template): backToList,
//   changeConsultantStatus, onConfirmation/attendPatientAfterConfirm,
//   getSecPin/gotoEMR/getattendPatConf, changeFollwUpVisit, handleCheckout/
//   updateCheckoutStatus, updateEncounterDoctorStatus, updateEncounterStatus,
//   updateAppointmentStatus, getPatientBills(Callback)/updatePatientBills(Callback),
//   and canShowAction are all real functions still defined in the untouched
//   controller, but none of them are wired to any element in the real
//   myoppatientlist.html template or to any columnDefs handleEvent/ng-click
//   target. Only handleEvents('attend'|'emr'|'call'|'patientinfo', entity)
//   and getList()/lookupCallback()/initLookup() are actually live. This
//   looks like leftover copy-paste from a patient-tracker/doctor-dashboard
//   controller; matches real (non-)behavior exactly by not dispatching any
//   of it from this screen.
//
// - The commented-out "Consult Type" column (OrderConsultType.Description)
//   in the real columnDefs is genuinely dead/commented source and is not
//   reproduced here, matching what is actually rendered today.
//
// - The Actions column's real EMR icon class is `"fas solid fa-laptop-medical"`
//   -- the stray extra word "solid" wedged between "fas" and the icon name
//   is a copy-paste leftover (identical bug already found in the sibling
//   myinpatient.js Actions column) and is reproduced verbatim, not cleaned up.
// ---------------------------------------------------------------------------
export const MyOPPatientListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [searchDraft, setSearchDraft] = useState(currentfilter.patientname || '');
  useEffect(() => { setSearchDraft(currentfilter.patientname || ''); }, [currentfilter.patientname]);

  const columns: DataTableColumn<EncounterEntity>[] = [
    {
      key: 'sno',
      header: 'S.No',
      // Real field is the literal string "S.No" -- see disclosed broken-sort-mapping note above.
      field: 'S.No',
      sortable: true,
      render: (e) => <span>{items.indexOf(e) + 1}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      field: 'StartDate',
      sortable: true,
      render: (e) => (
        <span>
          {formatDate(e.StartDate)} <span style={{ color: colors.textMuted }}>{formatTime(e.StartDate)}</span>
        </span>
      ),
    },
    {
      key: 'scheduletime',
      header: 'Schedule Time',
      field: 'Appointment.StartTime',
      sortable: true,
      render: (e) => (
        <span>{e.Appointment?.StartTime} - {e.Appointment?.EndTime}</span>
      ),
    },
    { key: 'mrn', header: 'MRN', field: 'Patient.MRN', sortable: true },
    { key: 'familycaseid', header: 'FamilyCase Id', field: 'Patient.FamilyUniqueId', sortable: true },
    {
      key: 'patientname',
      header: 'Patient Name',
      // Real field is "Name" -- no entity.Name exists; see disclosed broken-sort-mapping note above.
      field: 'Name',
      sortable: true,
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ color: colors.primary, cursor: 'pointer', textDecoration: 'none' }}
        >
          {e.Patient?.Title?.Description ? `${e.Patient.Title.Description} ` : ''}
          {e.Patient?.FirstName} <b>{e.Patient?.LastName}</b> / {e.Patient?.MRN} / {e.Patient?.Age} / {e.Patient?.Gender?.Description}
        </a>
      ),
    },
    { key: 'visittype', header: 'Visit Type', field: 'Encounter.VisitType.Description', sortable: true },
    { key: 'visitreason', header: 'Visit Reason', field: 'Patient.Remark.Remarks', sortable: true },
    {
      key: 'doctorname',
      header: 'Doctor Name',
      // Real field is "DoctorName" -- no entity.DoctorName exists; see disclosed broken-sort-mapping note above.
      field: 'DoctorName',
      sortable: true,
      // Real quirk: this cell is NOT clickable in the original (no ng-click on this cellTemplate), unlike the Patient Name column.
      render: (e) => (
        <span>
          {e.Doctor?.Title?.Description ? `${e.Doctor.Title.Description} ` : ''}
          {e.Doctor?.FirstName} {e.Doctor?.LastName}
        </span>
      ),
    },
    {
      key: 'tokenno',
      header: 'Token #',
      field: 'TokenNo',
      sortable: true, // real field, but see disclosed numeric-sort-crash note above (not reproduced by this safe DataTable)
    },
    { key: 'remarks', header: 'Remarks', field: 'Encounter.BillingRemarks', sortable: true },
    { key: 'diagnosis', header: 'Diagnosis', field: 'PatientDiagnosis.DiagnosisName', sortable: true },
    {
      key: 'status',
      header: 'Status',
      field: 'ConsultationStatus.Description',
      sortable: true,
      render: (e) => <StatusBadge status={e.ConsultationStatus?.Description} />,
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
                dispatch('filterChange', { field: 'patientname', value: v });
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
              label="Date"
              value={currentfilter.visitdate}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'visitdate', value: v })}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            {/* Real label translate key is 'billing.servicebilldiscounts.approvalstatus.lbl',
                borrowed from an unrelated billing screen -- see disclosed mismatch above. */}
            <SearchSelect
              label="Approval Status"
              value={currentfilter.consultationstatusid ?? null}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'consultationstatusid', value: v })}
              options={(lookup.ConsultationStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
              placeholder="All"
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
            {entity.EncounterDoctorStatus === 1 && (
              <button
                type="button"
                title="Attend"
                onClick={() => dispatch('attend', { entity })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary, fontSize: '15px' }}
              >
                <i className="fas fa-hospital-user" aria-hidden="true" />
              </button>
            )}
            {entity.EncounterDoctorStatus !== 1 && (
              <button
                type="button"
                title="EMR"
                onClick={() => dispatch('emr', { entity })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary, fontSize: '15px' }}
              >
                {/* Real class is "fas solid fa-laptop-medical" -- stray "solid" token, reproduced verbatim, see disclosure above. */}
                <i className="fas solid fa-laptop-medical" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              title="Call"
              onClick={() => dispatch('call', { entity })}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary, fontSize: '15px' }}
            >
              <i className="fas fa-phone-square-alt" aria-hidden="true" />
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
