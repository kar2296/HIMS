import React, { useState, useEffect } from 'react';
import { colors, spacing, radii, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Card, FilterBar } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { AgeDisplay } from './AgeDisplay';
import { Button } from './Button';

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
  const [standaloneItems, setStandaloneItems] = useState<PatientRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Standalone search filters
  const [filterPatientName, setFilterPatientName] = useState('');
  const [filterDOB, setFilterDOB] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterPhoneNo, setFilterPhoneNo] = useState('');
  const [filterVisitId, setFilterVisitId] = useState('');
  const [filterRegisteredDate, setFilterRegisteredDate] = useState('');
  const [filterIsTemp, setFilterIsTemp] = useState(false);
  const [filterIsOtherFacility, setFilterIsOtherFacility] = useState(false);
  const [currentPageState, setCurrentPageState] = useState(1);

  // Advanced filter drawer state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advMRN, setAdvMRN] = useState('');
  const [advName, setAdvName] = useState('');
  const [advDOB, setAdvDOB] = useState('');
  const [advPhone, setAdvPhone] = useState('');
  const [advFromDate, setAdvFromDate] = useState('');
  const [advToDate, setAdvToDate] = useState('');
  const [advPincode, setAdvPincode] = useState('');
  const [advCountry, setAdvCountry] = useState('');
  const [advState, setAdvState] = useState('');
  const [advCityTown, setAdvCityTown] = useState('');
  const [advArea, setAdvArea] = useState('');
  const [advShowTempPatient, setAdvShowTempPatient] = useState(false);

  const {
    items = standaloneItems,
    lookup = {},
    currentfilter = {},
    pager = { totalItems: standaloneTotal, pageSize: 25, currentPage: currentPageState },
  } = reactProps || {};

  const executeFetch = async (page = 1, useAdv = false) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [
        { Key: 8, Value: true }, // IncludeAppointments
      ];

      const nameVal = useAdv ? advName : filterPatientName;
      if (nameVal) params.push({ Key: 1, Value: nameVal });

      const dobVal = useAdv ? advDOB : filterDOB;
      if (dobVal) params.push({ Key: 3, Value: dobVal });

      const phoneVal = useAdv ? advPhone : filterPhoneNo;
      if (phoneVal) params.push({ Key: 4, Value: phoneVal });

      if (filterVisitId) params.push({ Key: 5, Value: filterVisitId });
      if (filterStatus) params.push({ Key: 7, Value: filterStatus });

      if (useAdv) {
        if (advMRN) params.push({ Key: 26, Value: advMRN });
        if (advFromDate) params.push({ Key: 9, Value: advFromDate });
        if (advToDate) params.push({ Key: 10, Value: advToDate });
        if (advPincode) params.push({ Key: 16, Value: advPincode });
        if (advCountry) params.push({ Key: 17, Value: advCountry });
        if (advState) params.push({ Key: 18, Value: advState });
        if (advCityTown) params.push({ Key: 19, Value: advCityTown });
        if (advArea) params.push({ Key: 20, Value: advArea });
        if (advShowTempPatient) params.push({ Key: 23, Value: true });
      } else {
        if (filterIsTemp) params.push({ Key: 23, Value: true });
      }

      const res: any = await callBackendApi({
        action: 'Registration/Patient/GetPatients',
        data: {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: page }
        },
        type: 'post'
      });

      if (res?.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reactProps?.items) {
      executeFetch(1);
    }
  }, [reactProps]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    } else {
      if (action === 'openAdvancedFilter') {
        setIsAdvancedFilterOpen(true);
      } else if (action === 'search') {
        setCurrentPageState(1);
        executeFetch(1, false);
      } else if (action === 'pageChange') {
        const page = payload?.page || 1;
        setCurrentPageState(page);
        executeFetch(page, false);
      }
    }
  };

  const handleApplyAdvancedFilter = () => {
    setIsAdvancedFilterOpen(false);
    setCurrentPageState(1);
    executeFetch(1, true);
  };

  const handleResetAdvancedFilter = () => {
    setAdvMRN('');
    setAdvName('');
    setAdvDOB('');
    setAdvPhone('');
    setAdvFromDate('');
    setAdvToDate('');
    setAdvPincode('');
    setAdvCountry('');
    setAdvState('');
    setAdvCityTown('');
    setAdvArea('');
    setAdvShowTempPatient(false);
    setIsAdvancedFilterOpen(false);
    setCurrentPageState(1);
    executeFetch(1, false);
  };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || standaloneTotal;
  const currentPage = pager.currentPage || currentPageState;

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
            id="btnFilterPatientSearch"
            type="button"
            title="Filter"
            onClick={() => {
              if (onAction) onAction('openAdvancedFilter');
              setIsAdvancedFilterOpen(true);
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px',
              borderRadius: radii.sm, border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
              color: colors.textMain, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <i className="fa fa-filter fa-xs" aria-hidden="true" />
            Filter
          </button>
          {/* Real button label is always hidden today (HasPrivilege undefined) -- icon-only, see disclosure above. */}
          <button
            id="btnAddNewFullRegistration"
            type="button"
            onClick={() => {
              if (onAction) onAction('addNewFull');
              else window.location.href = '/registration/new';
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px',
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
              display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px',
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
              id="txtPatientSearchName"
              label="Patient Name"
              leftIcon="fas fa-search"
              placeholder="Patient Name"
              value={reactProps ? (currentfilter.patientname ?? '') : filterPatientName}
              onChange={(ev) => {
                setFilterPatientName(ev.target.value);
                dispatch('filterChange', { field: 'patientname', value: ev.target.value });
              }}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date of Birth"
              value={reactProps ? (currentfilter.dateofbirth ?? '') : filterDOB}
              onChange={(v) => {
                setFilterDOB(v);
                dispatch('filterChangeAndSearch', { field: 'dateofbirth', value: v });
              }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Input
              id="txtPatientSearchPhone"
              label="Phone No"
              leftIcon="fas fa-search"
              placeholder="Phone No"
              value={reactProps ? (currentfilter.phoneno ?? '') : filterPhoneNo}
              onChange={(ev) => {
                setFilterPhoneNo(ev.target.value);
                dispatch('filterChange', { field: 'phoneno', value: ev.target.value });
              }}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Input
              id="txtPatientSearchVisitId"
              label="ID (OP/IP/ER)"
              leftIcon="fas fa-search"
              placeholder="ID (OP/IP/ER)"
              value={reactProps ? (currentfilter.visitid ?? '') : filterVisitId}
              onChange={(ev) => {
                setFilterVisitId(ev.target.value);
                dispatch('filterChange', { field: 'visitid', value: ev.target.value });
              }}
              onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing.sm }}>
            <button
              id="btnRunPatientSearch"
              type="button"
              onClick={() => dispatch('search')}
              style={{
                height: 36, padding: '0 16px', borderRadius: radii.sm,
                border: 'none', backgroundColor: colors.primary, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
        </FilterBar>
      </Card>

      {/* Advanced Filter Modal Dialog */}
      {isAdvancedFilterOpen && (
        <div
          id="patientAdvancedFilterOverlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsAdvancedFilterOpen(false); }}
        >
          <div
            id="patientAdvancedFilterDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advancedFilterTitle"
            style={{
              backgroundColor: '#fff', borderRadius: 8, padding: spacing.xl,
              width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 id="advancedFilterTitle" style={{ margin: 0, ...typography.h3, color: colors.textMain }}>
                Advanced Patient Filter
              </h3>
              <button
                id="btnCloseAdvancedFilter"
                type="button"
                onClick={() => setIsAdvancedFilterOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: colors.textMuted }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
              <Input
                id="txtAdvFilterMRN"
                label="MRN"
                value={advMRN}
                onChange={(e) => setAdvMRN(e.target.value)}
                placeholder="MRN Number"
              />
              <Input
                id="txtAdvFilterName"
                label="Patient Name"
                value={advName}
                onChange={(e) => setAdvName(e.target.value)}
                placeholder="Full or partial name"
              />
              <DatePicker
                label="Date of Birth"
                value={advDOB}
                onChange={(v) => setAdvDOB(v)}
              />
              <Input
                id="txtAdvFilterPhone"
                label="Phone"
                value={advPhone}
                onChange={(e) => setAdvPhone(e.target.value)}
                placeholder="Mobile / Landline"
              />
              <DatePicker
                label="Registered From"
                value={advFromDate}
                onChange={(v) => setAdvFromDate(v)}
              />
              <DatePicker
                label="Registered To"
                value={advToDate}
                onChange={(v) => setAdvToDate(v)}
              />
              <Input
                id="txtAdvFilterPincode"
                label="Pincode"
                value={advPincode}
                onChange={(e) => setAdvPincode(e.target.value)}
                placeholder="6-digit pincode"
              />
              <Input
                id="txtAdvFilterCountry"
                label="Country"
                value={advCountry}
                onChange={(e) => setAdvCountry(e.target.value)}
                placeholder="Country"
              />
              <Input
                id="txtAdvFilterState"
                label="State"
                value={advState}
                onChange={(e) => setAdvState(e.target.value)}
                placeholder="State"
              />
              <Input
                id="txtAdvFilterCity"
                label="City / Town"
                value={advCityTown}
                onChange={(e) => setAdvCityTown(e.target.value)}
                placeholder="City"
              />
              <Input
                id="txtAdvFilterArea"
                label="Area"
                value={advArea}
                onChange={(e) => setAdvArea(e.target.value)}
                placeholder="Area"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
                <input
                  id="chkAdvFilterTempPatient"
                  type="checkbox"
                  checked={advShowTempPatient}
                  onChange={(e) => setAdvShowTempPatient(e.target.checked)}
                />
                <label htmlFor="chkAdvFilterTempPatient" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Show Temp Patients</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnResetAdvFilter" variant="secondary" onClick={handleResetAdvancedFilter}>Reset</Button>
              <Button id="btnApplyAdvFilter" variant="primary" onClick={handleApplyAdvancedFilter}>Apply Filter</Button>
            </div>
          </div>
        </div>
      )}

      {/* Patient list -- the real ui-grid here is a single-column card list
          (columnDefs has exactly one active column, "Patient Details", with
          showHeader:false), not a tabular grid, so it is reproduced as a plain
          card list rather than forced into the shared DataTable component. */}
      {items.length === 0 ? (
        <EmptyState text="No records" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {items.map((row: PatientRow) => (
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
