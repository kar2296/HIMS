import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { StatusBadge } from '../components/ui/Badge';

interface NameDescription {
  Description?: string;
}

interface PatientInfo {
  Id?: number;
  Title?: NameDescription;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: string | number;
  Gender?: NameDescription;
  Remark?: { Remarks?: string };
}

interface EncounterInfo {
  Id?: number;
  DoctorId?: number;
  VisitTypeId?: number;
  VisitType?: NameDescription;
  IsPaidVisit?: boolean;
  IsBillCompleted?: boolean;
}

interface EncounterEntity {
  Id: number; // EncounterDoctor Id -- the Actions column's real field, see disclosed sort-crash note below
  PatientId?: number;
  AppointmentId?: number;
  EncounterId?: number; // real, but see disclosed "flat EncounterId doesn't exist on this shape" note below
  StartDate?: string;
  EncounterDoctorStatus?: number; // 1 = waiting for doctor (shows Attend), otherwise EMR is shown
  DoctorName?: string; // real columnDef field -- ALWAYS undefined on this screen's rows, see disclosure below
  Patient?: PatientInfo;
  Encounter?: EncounterInfo;
  ConsultationStatus?: NameDescription;
  [key: string]: any;
}

interface CurrentFilter {
  patientname?: string;
  visitdate?: string | null; // ISO yyyy-mm-dd, converted from the real currentfilter.visitdate (a plain Date/null) by the controller bridge
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
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
// Mirrors {{entity.StartDate | date: 'HH:mm'}}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// previousoppatientslist (app.oppatienttab.previousoppatient,
// PreviousOPPatientsController) -- the third and final tab under the
// already-migrated oppatienttab shell, alongside MyOPPatientListScreen and
// AllOPPatientListScreen. Renders inside that shell's <div ui-view>; no tab
// header of its own.
//
// THREE SEPARATE MOUNTS (multi-mount pattern, same technique already used on
// FamilyLinkScreen): the real .html's filter row is [Name input] [Doctor
// <autosearch>] [Date picker], with the Doctor field a live, debounced,
// server-searched typeahead (config: vm.doctorcontrolconfig, api
// 'SystemSettings/User/GetUsers', presearch/postsearch/formatdisplay hooks,
// only queries when >2 chars typed). The shared design-system SearchSelect
// is a CLIENT-SIDE filter over a fixed options array, not a live per-keystroke
// server search -- swapping it in here would be a real behavioral
// regression (debounce timing, server-side matching, minimum-query-length
// gating all lost). Consistent with how the Doctor <autosearch> was already
// left NATIVE on registrationcumvisit.html/FamilyLinkScreen, this component
// does NOT touch that field: it is left as an untouched native <autosearch>
// directive sitting between two small React mounts (Name, Date) in the
// .html, all three sharing the same reactProps/handleReactAction as the grid
// mount below. currentfilter.DoctorId itself is bound directly by ng-model
// on the native widget and is never read by this React code.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
//
// - DATE-REQUIRED VALIDATION IS PROVABLY DEAD CODE: the real getList() only
//   shows the "Please Select Date..." error (and aborts the fetch) inside
//   `if (!$scope.currentfilter.patientname && !$scope.currentfilter.DoctorId
//   && $scope.currentfilter.DoctorId == -1)`. DoctorId defaults to -1, and
//   in JavaScript `!(-1)` is `false` (-1 is truthy) -- so `!DoctorId` can
//   only be true when DoctorId is falsy (0/null/undefined), which can never
//   simultaneously equal -1. The three-way AND can therefore never be true
//   for ANY value DoctorId takes, making the entire guard permanently
//   unreachable. In production, clearing the date never blocks the search
//   and never shows this message, regardless of what the Name/Doctor
//   fields contain. This is inside the untouched getList() body (called via
//   'search'/'filterChangeAndSearch' dispatch below) -- not reproduced or
//   fixed here, just disclosed.
// - getListCallback SETS totalItems FROM THE UNFILTERED RESPONSE: the real
//   line is `vm.gridConfig.pagerObj.totalItems = res.Data.length;` (the
//   commented-out line above it shows the intended
//   `res.PageContext.TotalRecords` was swapped out) -- but the rows actually
//   pushed into vm.gridConfig.data (what the grid renders) are filtered to
//   only those with a truthy `.Patient` property. If the API ever returns
//   any row without a Patient, the pager's reported total will be HIGHER
//   than the number of rows actually shown/paged through. Reproduced
//   unchanged (pager.totalItems below is read straight from the real
//   pagerObj, not recomputed from items.length).
// - PHOTOS NEVER LOAD (dead data path, same bug class as MyOPPatientListScreen/
//   AllOPPatientListScreen): loadPhotos() IS called at the end of the real
//   getListCallback (not commented out here), but it loops over
//   $scope.gridData, which is initialized to [] at the top of the controller
//   and is NEVER reassigned -- getListCallback only ever populates
//   vm.gridConfig.data (a different array). So loadPhotos() always iterates
//   zero rows and every photo fetch is silently dead. No Photo column exists
//   in the real columnDefs either way, so nothing is rendered here for this;
//   noted for disclosure only.
// - "DOCTOR NAME" COLUMN IS ALWAYS BLANK, not just non-sortable: unlike the
//   sibling myoppatientlist/alloppatientlist columns (which read a real,
//   populated nested `entity.Doctor.*`), this screen's real columnDef is
//   `{field: "DoctorName", displayName: ...}` with NO cellTemplate at all --
//   ui-grid's default renderer just shows `{{entity.DoctorName}}`. Nothing
//   in this controller's getListCallback or the API action ever attaches a
//   flat `DoctorName` property to a row (the doctor-search widget's own
//   postsearch() only stamps `.DoctorName` onto the AUTOSEARCH DROPDOWN
//   result items, a completely separate array, never onto grid rows). So in
//   production this column is permanently empty for every row. Reproduced
//   below as a column that always renders blank, not invented/populated.
// - "S.No" / "Name" (Patient Name) use `field` values that don't correspond
//   to any real row property ("S.No" contains a literal dot the shared
//   custom-table path-resolver misreads as a nested path; "Name" doesn't
//   exist -- the cellTemplate only ever reads `entity.Patient.*`), so
//   clicking either header to sort is a silent no-op in production (same
//   bug class already found on the myoppatientlist/alloppatientlist/
//   myinpatient siblings). Reproduced here as non-sortable to match that
//   no-op, not fabricated as newly-working sort.
// - PATIENT NAME cellTemplate's `ng-click="handleEvents('patientinfo',entity)"`
//   IS present and correctly wired here (unlike some IPManagement siblings
//   where a copy-pasted Doctor-Name column mistakenly reused the
//   'patientinfo' action) -- reproduced as a real clickable link.
// - "S.No" column's displayName translate key
//   ('inventory.purchaseorders.sno.lbl') is borrowed from the unrelated
//   Purchase Orders module (same copy-paste leftover already found on every
//   sibling in this family); "Visit Reason" is a literal English string
//   passed straight to $translate.instant(...), not a real dotted key.
//   Both happen to render as plain English text either way -- reproduced as
//   plain headers.
// - ACTIONS COLUMN: real field is literally "Id" -- a NUMBER -- which would
//   throw inside the shared custom-table's `a[field].toLowerCase()` sort
//   compare if a user ever clicked that header (same bug class already
//   disclosed on AllOPPatientListScreen). Not reproduced as a crash;
//   reproduced as non-sortable, matching the faithful stand-in already used
//   on sibling screens. The EMR icon's real class list is literally
//   "fas solid fa-laptop-medical" (an invalid extra "solid" token, silently
//   ignored by browsers) -- reproduced verbatim, not cleaned up.
// - attendPatient()'s VisitTypeId===2 BRANCH IS A LIVE CALL SITE TO A
//   PREVIOUSLY-FLAGGED "DEAD" MODAL: when `entity.Encounter.VisitTypeId==2`,
//   the untouched attendPatient() function opens
//   `utl.Modal.open('app.patientvisit-details', ...)`. The project's own
//   earlier REGISTRATION_REACHABILITY_SWEEP.md audit classified
//   patientvisit-details.js as CONFIRMED DEAD (zero references found
//   anywhere in the codebase at that time). This is a real, reachable call
//   site inside a live, non-commented function that appears to contradict
//   that classification -- flagged here for disclosure, NOT silently
//   resolved or removed. Whether the modal state/template still actually
//   resolves at runtime (vs. failing silently/erroring) was not re-verified
//   in this pass. The confirmCallback wired to that modal
//   ($scope.onConfirmation) in turn calls the untouched $scope.changeFollwUpVisit(),
//   which references `$scope.changeFollwUpCallback` -- a function that is
//   NEVER defined anywhere in this file, a second, independent latent bug
//   whose reachability depends entirely on the same open question above.
//   None of this chain requires any React involvement either way: the grid
//   below only ever dispatches the single 'attend' action, and the untouched
//   attendPatient()/onConfirmation()/changeFollwUpVisit() functions run
//   exactly as before, unmodified.
// - 'emr' HANDLER USES A FLAT EncounterId THAT DOESN'T EXIST ON THIS ROW
//   SHAPE: $scope.handleEvents('emr', entity) builds the EMR navigation's
//   `eid` param from `entity.EncounterId` -- a flat property this screen's
//   rows never carry (the real encounter id is nested at
//   `entity.Encounter.Id`, which is exactly what attendPatientAfterConfirm
//   correctly uses instead). Same bug class already disclosed on
//   AllOPPatientListScreen's 'emr' handler. Reproduced unchanged -- entity is
//   passed straight through to the real, untouched handleEvents().
// - NO CONSULTATION-STATUS FILTER EXISTS IN THIS SCREEN'S REAL TEMPLATE
//   (unlike its My/All siblings, which both have one): `currentfilter
//   .consultationstatusid` stays hardcoded at its initial value of 3 for
//   the life of the screen, `changeConsultantStatus()` is a real function
//   with zero call sites anywhere in this template, and getList()'s own
//   "Key: 4" filter param is hardcoded to `Value: 3` directly (NOT read
//   from currentfilter.consultationstatusid at all, so even if something
//   else changed that field, this request param would not follow it).
//   Reproduced by simply not rendering any status filter control here.
// - LARGE DEAD-CODE SURFACE (left completely untouched, not migrated): the
//   entire second/older `$scope.handleEvents` block (with 'checkout' ->
//   handleCheckout(entity), 'call', 'labresult', 'ordertracker', etc.) is
//   commented-out source, fully superseded by the live handleEvents defined
//   later (attend/emr/patientinfo only); backToList(), changeConsultantStatus(),
//   canShowAction(), handleCheckout()/patientTrackerCallback() have zero
//   live call sites. $scope.currentcontext.DoctorId is set but never read
//   anywhere. None of this is exposed via reactProps or dispatched here,
//   matching the real page's behavior exactly.
// ---------------------------------------------------------------------------

export const PreviousOPPatientNameFilterScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <Input
        label="Name"
        placeholder="Search Patient / UHID / MObile #"
        leftIcon="fas fa-search"
        value={currentfilter.patientname ?? ''}
        onChange={(ev) => dispatch('filterChange', { field: 'patientname', value: ev.target.value })}
        onKeyDown={(ev) => {
          // Mirrors the real on-enter directive: typing alone never re-fetches, only Enter does.
          if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); }
        }}
      />
    </div>
  );
};

export const PreviousOPPatientDateFilterScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <DatePicker
        label="Date"
        value={currentfilter.visitdate ?? ''}
        // Real ng-change="getList()" on this field -- refetches immediately, unlike Name.
        onChange={(v) => dispatch('filterChangeAndSearch', { field: 'visitdate', value: v })}
      />
    </div>
  );
};

export const PreviousOPPatientGridScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], pager = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const numberedItems = items.map((it, i) => ({ ...it, __rowNo: i + 1 }));

  const columns: DataTableColumn<EncounterEntity & { __rowNo: number }>[] = [
    // Real field is the literal string "S.No" -- see disclosed broken-sort-mapping note above.
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
    { key: 'mrn', header: 'MRN', field: 'Patient.MRN', sortable: true },
    {
      // Real field is "Name" -- no entity.Name exists; see disclosed broken-sort-mapping note above.
      key: 'patientname', header: 'Patient Name',
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          style={{ cursor: 'pointer', color: colors.primary, textDecoration: 'none' }}
        >
          {e.Patient?.Title?.Description ? `${e.Patient.Title.Description} ` : ''}
          {e.Patient?.FirstName} <b>{e.Patient?.LastName}</b> / {e.Patient?.MRN} / {e.Patient?.Age} / {e.Patient?.Gender?.Description}
        </a>
      ),
    },
    { key: 'visitreason', header: 'Visit Reason', field: 'Patient.Remark.Remarks', sortable: true },
    { key: 'visittype', header: 'Visit Type', field: 'Encounter.VisitType.Description', sortable: true },
    {
      // Real field "DoctorName" is never populated on this row shape -- see
      // disclosed "always blank" note above. Rendered as an always-empty cell,
      // not fabricated from any Doctor object (none exists on these rows).
      key: 'doctorname', header: 'Doctor Name', field: 'DoctorName',
      render: () => <span />,
    },
    {
      key: 'status', header: 'Status', field: 'ConsultationStatus.Description', sortable: true,
      render: (e) => <StatusBadge status={e.ConsultationStatus?.Description} />,
    },
    {
      // Real field is literally "Id" (a number) -- see disclosed sort-crash note above.
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
              {/* Real class list is literally "fas solid fa-laptop-medical" -- reproduced verbatim, see disclosure above. */}
              <i className="fas solid fa-laptop-medical" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <DataTable<EncounterEntity & { __rowNo: number }>
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
