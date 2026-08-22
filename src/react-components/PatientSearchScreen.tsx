import React from 'react';
import { colors, spacing, radii, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Card, FilterBar } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { AgeDisplay } from './AgeDisplay';

interface LookupItem {
  Id: number;
  Text: string;
}

interface NameDescription {
  Description?: string;
}

interface EncounterEntity {
  Id?: number;
  AppointmentId?: number;
  EncounterTypeId?: number;
  EncounterStatusId?: number;
  DischargeDate?: string | null;
  AdmissionDate?: string | null;
  AppointmentDate?: string | null;
  StartTime?: string;
  VisitIdentifier?: string;
  PatientGuarantor?: { GuarantorName?: string };
  WardMaster?: { WardName?: string };
  WardRoomBedMaster?: { BedNo?: string };
  WardRoomMaster?: { RoomNo?: string };
  [key: string]: any;
}

interface AppointmentEntity {
  Id?: number;
  AppointmentDate?: string;
  StartTime?: string;
  AppointmentStatus?: NameDescription;
  [key: string]: any;
}

interface PatientRow {
  Id: number;
  Title?: NameDescription;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Gender?: NameDescription;
  GenderId?: number;
  DOB?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  City?: string;
  State?: string;
  Country?: string;
  LandLine?: string;
  Mobile?: string;
  NationalityIdentifier?: string;
  Facility?: { FacilityName?: string };
  PatientStatus?: NameDescription;
  PatientStatusId?: number;
  RegisteredDate?: string;
  PhotoPath?: string;
  Photo?: string;
  MRNTypeId?: number;
  OutStandingAmount?: number;
  Encounters?: EncounterEntity[];
  Appointments?: AppointmentEntity[];
  // Both computed server-side by the real (unchanged) getListCallback / getLatestAppointment(),
  // not part of the raw API row shape:
  LatestEncounter?: EncounterEntity | null;
  LatestAppointment?: AppointmentEntity | null;
  AgeDisplay?: string;
  [key: string]: any;
}

interface CurrentFilter {
  patientname?: string;
  dateofbirth?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.dateofbirth (a plain Date/'') by the controller bridge
  status?: number;
  phoneno?: string;
  visitid?: string;
  registereddate?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.registereddate (a plain Date) by the controller bridge
  isOtherFacility?: boolean;
  istemp?: boolean;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: PatientRow[];
  lookup?: { PatientStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real {{... | date : 'dd-MMM-yyyy'}} AngularJS date filter used throughout
// patientListTemplate.html.
function formatDate(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
// Mirrors the real <displaydate datetime-val="..."> directive, which formats as
// 'dd-MMM-yyyy HH:mm' (see public/vendor/common/ngCommonHelper.js's displaydate directive).
function formatDateTime(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mi}`;
}

// ---------------------------------------------------------------------------
// patientsearch (app.patientsearch, patientSearchListController) -- the main
// "Patient Search" screen: header actions, a filter row, a paginated list of
// patient cards (registration/appointment.status/photo), each with a set of
// row action links. Read/searched via registration/patient/GetPatients;
// lookups (PatientStatus/Referral/VisitType/Guarantor) via
// General/Options/getoptions.
//
// SCOPE NOTES:
// - No live server-searched autosearch/typeahead directive exists anywhere in
//   the real patientsearch.html (confirmed by reading the full file), so
//   unlike FamilyLinkScreen/PreviousOPPatientListScreen this is a SINGLE React
//   mount -- nothing needed to stay native for that reason.
// - The "Advanced Filter" button (openAdvancedFilter()) opens the real,
//   untouched utl.Modal.openDynamicForm(...) dynamic-form modal
//   ($scope.advancedFilterSchema/$scope.advancedfilter, built from the real
//   Referral/VisitType/Guarantor lookups) -- that modal's own fields are a
//   separate native Angular UI outside this screen's own template and are not
//   reimplemented here, exactly like the precedent set for other screens'
//   dynamic-form modals. Only the button that opens it is migrated.
// - showprocessflow()/hideprocessflow()/#myModal ("ProcessFlow" doc-viewer
//   modal) are NOT rendered here: the only button that ever called
//   showprocessflow() is already commented out in the real patientsearch.html
//   (inside the same commented block as the "UserManual" button), so this UI
//   is already unreachable/dead in production today. Not reproduced (no
//   fabricated trigger added), matching the real page.
// - The old <style> block's ".hims-theme-registration" presentation-only CSS
//   retrofit targeted the previous ui-grid/Bootstrap markup structure
//   (.patientprofilebg, .ui-grid-header, .linkstyle, etc.) which no longer
//   exists once this screen renders through the design system below, so it
//   is not carried forward -- this component's visual language comes from the
//   shared tokens/Card/Input/etc. instead, consistent with every other
//   migrated screen in this codebase.
//
// REAL, DISCLOSED PRE-EXISTING BUGS/DEAD CODE PRESERVED AS-IS, NOT FIXED:
//
// - THE ENTIRE PER-ROW ACTION-BUTTON COLUMN IS PERMANENTLY HIDDEN IN
//   PRODUCTION TODAY: every one of the 14 row action links in the real
//   patientListTemplate.html (edit/DEM, newvisit/NEW, appointments/APP,
//   admissionlink/ADM, opbillinglist/OPB, ipbillinglink/DGB,
//   outstandingbillsview/DUE, payer/PYR, emr/EMR, preappoinments/PRV,
//   portalaccess/Portal, checkout/CHK, vitals/VIT, patientprint/PRINT) is
//   gated by `ng-if="grid.appScope.HasPrivilege('Patient', 'PATIENT-XXX')"`.
//   `HasPrivilege` (the two-argument entity/action-code form used here) is
//   NOT defined anywhere in this codebase -- confirmed by an exhaustive grep
//   across public/ -- and it is not injected onto this controller's $scope by
//   the app.patientsearch state config (no extra resolve/parent controller
//   supplies it) either. This is the same class of finding already disclosed
//   on FullRegistrationScreen.tsx for its own HasPrivilege-gated buttons. Not
//   fixed/invented here: none of these 14 actions are rendered, matching the
//   real, always-hidden production behavior. (handleEvents() itself --
//   including all 14 branches -- is left 100% unchanged in the controller;
//   only the 'update' action below, which has NO such gate in the real
//   template, is actually wired.)
// - THE TWO HEADER "ADD" BUTTONS ARE ICON-ONLY IN PRODUCTION, FOR THE SAME
//   REASON: addNewFull()'s button label
//   (`registration.fullregistration.buttonfullreg.lbl`) is gated
//   `ng-if="HasPrivilege('PatientSearch', 'PSQuickReg')"` and addNewQuick()'s
//   label (`registration.quickregistration.buttonquickreg.lbl`) is gated
//   `ng-if="HasPrivilege('PatientSearch', 'PSFullReg')"` -- note the
//   privilege codes are also SWAPPED relative to what the button actually
//   does (the "full registration" button checks a "QuickReg" privilege code
//   and vice versa). Since HasPrivilege doesn't exist either way, both
//   labels are always hidden today regardless of the swap, so both buttons
//   render as bare icons (a plus and a tablet) with no visible text -- the
//   swap is a real latent bug that would only start to matter if
//   HasPrivilege were ever implemented. Reproduced as icon-only buttons, the
//   swap disclosed rather than silently corrected.
// - THE MRN / NRIC FILTER BOX IS DEAD MARKUP: `$scope.currentfilter.mrn` is
//   read throughout getList() (both as a direct search param and to decide
//   between Params Key 2/26/32 for the MRN-vs-shortcode branches), but its
//   `<input ... ng-model="currentfilter.mrn">` is entirely commented out in
//   the real patientsearch.html. There is no way to set it from this screen's
//   UI at all -- it can only ever be '' here (unless deep-linked). Not
//   reproduced as an input (there is nothing real to wire it to); the
//   underlying currentfilter.mrn / getList() logic is left completely
//   unchanged.
// - THE "ADVANCED FILTER" BUTTON HAS NO `id="btnadvanced"` IN THE REAL
//   TEMPLATE, even though $scope.openAdvancedFilter() passes
//   `relativeto: '#btnadvanced'` to utl.Modal.openDynamicForm -- that
//   selector matches nothing on this page, so the dynamic-form modal's
//   real positioning-relative-to-the-button behavior is already broken today.
//   Not fixed (no id added here); openAdvancedFilter() itself is called
//   unchanged.
// - BROKEN SERVER-SIDE PAGINATION: the real getList() request hardcodes
//   `PageContext: { PageSize: 50, PageNumber: 1 }` -- literal constants, NOT
//   read from `vm.gridConfig.pagerObj.pageSize` (25) or
//   `vm.gridConfig.pagerObj.currentPage` at all. The real
//   uib-pagination widget still updates `pagerObj.currentPage` and calls
//   getList() again on click, but every page (1, 2, 3, ...) issues the exact
//   same request and gets back the exact same first-50-rows response --
//   clicking "page 2" never actually advances to different patients. On top
//   of that, `getListCallback` sets `vm.gridConfig.pagerObj.totalItems =
//   res.Data.length` -- the count of rows in THIS single (max-50) response,
//   not a real total-record count from the server -- so the pager can both
//   under-report how many matches exist beyond 50, and offer a "page 2" that
//   silently redisplays page 1's data. Reproduced unchanged: the Pagination
//   control below is wired to the same real pagerObj/getList() round-trip,
//   bug and all -- not recomputed or capped differently here.
// - `{{row.entity.Encounters.VisitIdentifier}}` (Ward/Bed/Room block) READS
//   `.VisitIdentifier` DIRECTLY OFF THE `Encounters` ARRAY, not
//   `Encounters[0].VisitIdentifier` like every other reference in this same
//   template (including the sibling Appointment block three lines above,
//   which correctly uses `LatestEncounter.VisitIdentifier`). Arrays never
//   carry a `.VisitIdentifier` property, so this always renders blank in
//   production. Reproduced as always-blank (not backfilled from
//   Encounters[0]).
// - `$scope.test()` (returns the literal string "Visit in Progress") has zero
//   call sites anywhere in this controller or the real template -- dead code,
//   not exposed here.
// - `$scope.onDeleteConfirmed()` / `$scope.deleteItemCallback()` /
//   `handleEvents('delete', ...)`: there is no 'delete' action anywhere in
//   the real patientListTemplate.html (confirmed by grep), so this whole
//   branch is unreachable from the UI today; ALSO, were it ever reached, it
//   posts to `action: ''` (a literal empty string) -- a real, separate,
//   already-broken endpoint. Neither is wired here.
// - The filter/advanced-filter button's own translate keys
//   (`clinicalmaster.serviceitem-list.filter.lbl` /
//   `...filter-tooltip.lbl`) are borrowed from the unrelated Clinical Master
//   module, not a registration.patientsearch.* key -- cosmetically harmless
//   (they resolve to "Filter" either way) but reproduced as literal
//   English text rather than invented registration-specific copy.
// - The real filter row crams two unrelated checkboxes into one cell with a
//   confusing label arrangement: the cell's own heading label is
//   `registration.patientsearch.filter_istemp.lbl` (describing the FIRST
//   checkbox, bound to `currentfilter.istemp`), but a second, literal,
//   untranslated "Other" label sits between the two checkboxes, immediately
//   before the SECOND checkbox (bound to `currentfilter.isOtherFacility` --
//   "search other facility", not merely "other"). Reproduced with the same
//   two labels verbatim rather than relabeling the second one to what it
//   actually means.
// ---------------------------------------------------------------------------

export const PatientSearchScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
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

  return (
    <div style={{ fontFamily: typography.fontFamily, padding: `${spacing.sm} ${spacing.md} ${spacing.xl}` }}>
      {/* Header row: OPD dashboard shortcut, Advanced Filter, Add Full/Quick Registration */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, flexWrap: 'wrap', gap: spacing.sm }}>
        <h2 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>
          Patient Search
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            title="OPD Dashboard"
            onClick={() => dispatch('opd_dashboard')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <img src="app/img/main/download.png" alt="home" style={{ width: 22, height: 22 }} />
          </button>
          <button
            type="button"
            title="Filter"
            onClick={() => dispatch('openAdvancedFilter')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px',
              borderRadius: radii.sm, border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
              color: colors.textMain, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <i className="fa fa-search fa-xs" aria-hidden="true" />
            Filter
          </button>
          {/* Real button label is always hidden today (HasPrivilege undefined) -- icon-only, see disclosure above. */}
          <button
            type="button"
            onClick={() => dispatch('addNewFull')}
            style={{
              display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 12px',
              borderRadius: radii.sm, border: 'none', backgroundColor: colors.primary,
              color: '#fff', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
          </button>
          {/* Real button label is always hidden today (HasPrivilege undefined) -- icon-only, see disclosure above. */}
          <button
            type="button"
            onClick={() => dispatch('addNewQuick')}
            style={{
              display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 12px',
              borderRadius: radii.sm, border: 'none', backgroundColor: colors.accent,
              color: '#fff', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <i className="fa fa-tablet" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Filter row */}
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Input
              label="Patient Name"
              leftIcon="fas fa-search"
              placeholder="Patient Name"
              value={currentfilter.patientname ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patientname', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date of Birth"
              value={currentfilter.dateofbirth ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'dateofbirth', value: v })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <Select
              label="Status"
              value={currentfilter.status ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'status', value: Number(v) })}
              options={(lookup.PatientStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Input
              label="Phone No"
              leftIcon="fas fa-search"
              placeholder="Phone No"
              value={currentfilter.phoneno ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'phoneno', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Input
              label="ID (OP/IP/ER)"
              leftIcon="fas fa-search"
              placeholder="ID (OP/IP/ER)"
              value={currentfilter.visitid ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'visitid', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Registered Date"
              value={currentfilter.registereddate ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'registereddate', value: v })}
            />
          </div>
          {/* Real cell heading label describes the FIRST checkbox only; the literal,
              untranslated "Other" text sits between the two checkboxes and actually
              precedes the SECOND one (isOtherFacility) -- reproduced verbatim, see
              disclosure above. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, paddingBottom: 6 }}>
            <Checkbox
              label="Temp Patient"
              checked={!!currentfilter.istemp}
              onChange={(checked) => dispatch('filterChangeAndSearch', { field: 'istemp', value: checked })}
            />
            <Checkbox
              label="Other"
              checked={!!currentfilter.isOtherFacility}
              onChange={(checked) => dispatch('filterChangeAndSearch', { field: 'isOtherFacility', value: checked })}
            />
          </div>
        </FilterBar>
      </Card>

      {/* Patient list -- the real ui-grid here is a single-column card list
          (columnDefs has exactly one active column, "Patient Details", with
          showHeader:false), not a tabular grid, so it is reproduced as a plain
          card list rather than forced into the shared DataTable component. */}
      {items.length === 0 ? (
        <EmptyState text="No records" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {items.map((row) => (
            <PatientCard key={row.Id} row={row} onAction={dispatch} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => dispatch('pageChange', { page })}
      />
    </div>
  );
};

const PatientCard: React.FC<{ row: PatientRow; onAction: (action: string, payload?: any) => void }> = ({ row, onAction }) => {
  const encounter0 = row.Encounters && row.Encounters.length > 0 ? row.Encounters[0] : undefined;
  const hasAddress = !!(row.AddressLine1 || row.AddressLine2);

  const showRegGuarantor =
    !!encounter0 &&
    ((encounter0.EncounterTypeId === 2 && !encounter0.DischargeDate) || encounter0.EncounterTypeId === 1);

  const showAppointmentBlock = !!(row.LatestAppointment && row.LatestAppointment.AppointmentStatus?.Description);
  const showCheckedIn = !!(encounter0 && (encounter0.EncounterStatusId || 0) > 0);
  const showAppointmentStatus =
    (!row.Encounters || row.Encounters.length === 0) && !!(row.Appointments && row.Appointments.length > 0);

  const showWardBlock = !!(encounter0 && encounter0.EncounterTypeId === 2 && !encounter0.DischargeDate);

  return (
    <Card padding={spacing.md}>
      <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Photo */}
        <div style={{ flex: '0 0 56px' }}>
          {row.PhotoPath && row.Photo ? (
            <img
              src={`data:image/png;base64,${row.Photo}`}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          ) : (
            <img
              src={row.GenderId === 2 ? 'app/img/no-img-female.png' : 'app/img/no-img-icon.png'}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          )}
        </div>

        {/* Name / demographics / address / contact */}
        <div style={{ flex: '1 1 320px', minWidth: 260 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.primary }}>
            {row.Title?.Description} {row.FirstName} {row.LastName}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.textMain }}>
            <span style={{ color: colors.primary }}>MRN - {row.MRN || 'N/A'}</span>
            {' | '}{row.Gender?.Description || 'N/A'}{' | '}
            <AgeDisplay dob={row.DOB} />
            {' | '}{row.DOB ? formatDate(row.DOB) : 'N/A'}
          </div>
          {hasAddress ? (
            <div style={{ fontSize: '11px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;
              {row.AddressLine1 ? `${row.AddressLine1},` : ''} {row.AddressLine2 ? `${row.AddressLine2},` : ''}{' '}
              {row.Area ? `${row.Area},` : ''} {row.City ? `${row.City},` : ''} {row.State ? `${row.State},` : ''}{' '}
              {row.Country || ''}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;N/A
            </div>
          )}
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>
            <i className="fa fa-phone-square" aria-hidden="true" /> : {row.LandLine} {row.Mobile}{' | '}
            NRIC - {row.NationalityIdentifier || 'N/A'}
            {/* Only row action that is NOT gated by the undefined HasPrivilege() in the
                real template -- real, functional, opens the demographic-update modal. */}
            <a
              onClick={() => onAction('update', { entity: row })}
              title="Patient Demographics"
              style={{ cursor: 'pointer', color: colors.primary, marginLeft: 6 }}
            >
              <i className="icon-info-sign" aria-hidden="true" />
            </a>
            {row.Facility?.FacilityName ? ` ${row.Facility.FacilityName}` : ''}
          </div>
        </div>

        {/* Registration / appointment timeline */}
        <div style={{ flex: '1 1 260px', minWidth: 220 }}>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Registration :{' '}
            <span style={{ color: colors.primary }}>{row.PatientStatus?.Description}</span>
          </div>
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>
            {formatDate(row.RegisteredDate)}
            {showRegGuarantor && encounter0?.PatientGuarantor?.GuarantorName ? (
              <span style={{ color: colors.success, marginLeft: 4 }}>{encounter0.PatientGuarantor.GuarantorName}</span>
            ) : null}
          </div>

          {showAppointmentBlock && (
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: spacing.xs }}>
              Appointment :{' '}
              {showCheckedIn ? (
                <span style={{ color: colors.primary }}>Checked In</span>
              ) : showAppointmentStatus ? (
                <span style={{ color: colors.primary }}>{row.Appointments?.[0]?.AppointmentStatus?.Description}</span>
              ) : null}
              <div style={{ fontSize: '11px', color: colors.textSubtle }}>
                {row.LatestEncounter?.AdmissionDate ? (
                  formatDateTime(row.LatestEncounter.AdmissionDate)
                ) : (
                  <span>
                    {formatDate(row.LatestAppointment?.AppointmentDate)} {row.LatestAppointment?.StartTime}
                  </span>
                )}{' '}
                {/* Real bug: {{row.entity.Encounters.VisitIdentifier}} reads .VisitIdentifier
                    off the ARRAY, not Encounters[0] -- always undefined in production.
                    Reproduced as always-blank, see disclosure above (this line correctly
                    uses LatestEncounter, matching the real template). */}
                <span style={{ color: '#dc009d' }}>{row.LatestEncounter?.VisitIdentifier}</span>
              </div>
            </div>
          )}

          {showWardBlock && (
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: spacing.xs }}>
              Ward / Bed / Room :{' '}
              <span style={{ color: colors.primary }}>
                {encounter0?.WardMaster?.WardName} / {encounter0?.WardRoomBedMaster?.BedNo} / {encounter0?.WardRoomMaster?.RoomNo}
              </span>
              <div style={{ fontSize: '11px', color: colors.textSubtle }}>
                {encounter0?.AdmissionDate ? (
                  formatDateTime(encounter0.AdmissionDate)
                ) : (
                  <span>
                    {formatDate(encounter0?.AppointmentDate)} {encounter0?.StartTime}
                  </span>
                )}{' '}
                {/* Same real bug as above: {{row.entity.Encounters.VisitIdentifier}} --
                    always undefined, reproduced as always-blank. */}
                <span style={{ color: '#dc009d' }} />
              </div>
            </div>
          )}
        </div>

        {/* Real per-row action-button column intentionally not rendered: all 14 real
            action links here are gated by grid.appScope.HasPrivilege(...), a function
            that does not exist anywhere in this codebase -- every one of them is
            permanently hidden in production today. See the file-level disclosure
            comment for the full list and the grep confirming this. Nothing fabricated
            in its place. */}
      </div>
    </Card>
  );
};
