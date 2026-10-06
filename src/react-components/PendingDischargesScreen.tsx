import React from 'react';
import { colors, spacing, radii, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Card, FilterBar } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

interface LookupItem {
  Id: number;
  Text: string;
}

interface PatientInfo {
  Id?: number;
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  GenderId?: number;
  Gender?: { Description?: string };
  Age?: string | number;
  DOB?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  City?: string;
  State?: string;
  Country?: string;
  LandLine?: string;
  NationalityIdentifier?: string;
  PhotoPath?: string;
  Photo?: string;
}

interface PendingDischargeEntity {
  Id: number;
  Patient?: PatientInfo;
  AdmittingReason?: { Description?: string };
  AdmissionDate?: string;
  VisitIdentifier?: string;
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  AdmissionStatus?: { Description?: string };
  Diagnosis?: { DiagnosisName?: string };
  Doctor?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  ALOS?: number | string;
  [key: string]: any;
}

interface CurrentFilter {
  patientnamemrn?: string;
  visitdate?: string; // bound to the real "Admit Date" picker -- see disclosure below: getList() never actually reads this
  WardId?: number;
  admissionstatusid?: number | string;
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
  items?: PendingDischargeEntity[];
  lookup?: { Ward?: LookupItem[]; AdmissionStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  currentcontext?: CurrentContext;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real 'dd-MMM-yyyy' AngularJS date filter.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Mirrors the real <displaydate datetime-val="..."> directive (ngCommonHelper.js),
// which -- because only the datetime-val attribute is ever bound on this template,
// never date-val -- always renders via the 'dd-MMM-yyyy HH:mm' branch only.
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

// Mirrors the real inline ternary:
// {{Age ? ((Age <= 1) ? Age + 'Yr' : Age + ' Yrs') : 'N/A'}}
function formatAge(age?: string | number): string {
  if (!age) return 'N/A';
  const n = Number(age);
  if (!isNaN(n) && n <= 1) return `${age}Yr`;
  return `${age} Yrs`;
}
// ---------------------------------------------------------------------------
// pendingdischarges (app.pendingdischarges, standalone top-level state --
// NOT nested inside a tab shell, so this component renders the entire page:
// header, myinpatients/allinpatients toggle, filter row, patient-card list,
// and pager). Real API: Visit/Visit/GetEncounters, same family as
// AllInpatientListScreen/MyInpatientListScreen/PatientDischargeListScreen,
// but with its own single-column "Patient Details" card cellTemplate (no
// per-field grid columns) -- reproduced as a plain card list, the same
// choice already made for PatientSearchScreen.tsx's single-column card grid,
// rather than forced into the shared DataTable component.
//
// Real, disclosed pre-existing bugs/dead code preserved as-is, NOT fixed:
//
// - THE ENTIRE "ADVANCED FILTER" DYNAMIC FORM IS DEAD CODE: initDynamicForm(),
//   handleDynamicFormEvents(), openAdvancedFilter(), and the
//   $scope.advancedfilter / advancedfilterDefault / advancedFilterSchema
//   state it builds are all real and fully wired to utl.Modal.openDynamicForm,
//   but grep across the real pendingdischarges.html confirms there is no
//   ng-click="openAdvancedFilter()", no id="btnadvanced", and no reference to
//   "advancedfilter" anywhere in the template -- nothing in production can
//   ever open this modal. Not rendered here (no fabricated button added).
// - $scope.patientprofiledetails() (opens the registration.patientprofile
//   modal) has zero call sites anywhere in the real template either -- dead
//   code, not wired here.
// - getPatientProfilePic() / getPatientProfilePicCallback() / loadPhotos()
//   are all real, but unlike the sibling patientdischarge/myinpatient
//   controllers, THIS controller's getListCallback() never calls
//   loadPhotos() at all. So Patient.Photo is never populated in production,
//   and the `ng-show="PhotoPath && Photo"` real photo <img> can never
//   actually display -- only the placeholder gender icon ever renders.
//   Reproduced as-is: no photo-loading logic added, so the placeholder icon
//   is all that ever shows here too.
// - $scope.currentfilter.wardid (lowercase) is set at init to -1 but is
//   never read anywhere in this controller -- both getList() and the real
//   Ward <ui-select> exclusively use currentfilter.WardId (capital W).
//   Dead/redundant field, not exposed in reactProps.
// - REAL BUG -- THE VISIBLE "ADMIT DATE" FILTER HAS NO EFFECT ON RESULTS:
//   the real date-picker is bound to `ng-model="currentfilter.visitdate"`
//   with `ng-change="getList()"`, but getList() never reads
//   currentfilter.visitdate anywhere. Its allinpatients branch instead sends
//   `utl.Formatter.getFilterDate(currentfilter.AdmissionDate)` (Key 16) --
//   a property that is never set by anything else in this controller or
//   template. So changing the Admit Date box refetches the list (the
//   ng-change still fires) but the chosen date never actually reaches the
//   server query. Reproduced unchanged: the DatePicker below still updates
//   currentfilter.visitdate and still triggers getList(), matching this
//   real broken behavior exactly.
// - currentfilter.RequestNo / VisitIdentifier / AttenderPhone / PatientId are
//   all read inside getList()'s allinpatients Params array but have no
//   corresponding input anywhere in the real template -- always
//   undefined/blank in production. Not exposed as filters here (nothing real
//   to wire them to).
// - currentfilter.AdmissionRequestTypeId is likewise sent to the server
//   (Key 8, allinpatients branch only) but is never bound to any UI control
//   either -- always sent at its initial value of -1. Not exposed as a
//   filter control here.
// - lookup.Doctor and lookup.Department are fetched by initLookup() but
//   neither is bound to any live filter control in the real template --
//   both are only ever read by the dead advanced-filter dynamic form above.
//   Not exposed in reactProps.lookup (nothing live consumes them).
// - `datePickerOptions` (referenced in the real template as
//   `uib-datepicker-popup="{{datePickerOptions.dateFormat}}"` and
//   `placeholder="{{datePickerOptions.placeholder}}"` on the Admit Date box)
//   is never defined anywhere on $scope in this controller -- an
//   undefined-scope-variable reference. Both interpolations silently
//   resolve to empty strings in production (AngularJS renders undefined
//   expressions as ''), so the real date-picker popup falls back to its
//   library default format and the input shows no placeholder text. Not
//   reproduced as a fabricated format/placeholder; the DatePicker below
//   simply uses its own shared default, matching the real page's fallback
//   behavior rather than inventing configuration that was never real.
// - Translate-key oddities (cosmetically harmless, disclosed for
//   completeness -- looked up in public/i18n/emr/registration/en.json):
//   the page header's key (`registration.inpatients.pagetitle.lbl`)
//   resolves to "In Patient Lists", not anything mentioning "discharge" --
//   so this "Pending Discharges" screen's own header literally reads
//   "In Patient Lists" in production today (a separate, unused
//   `registration.inpatients.discharge.lbl` = "Pending Discharges" key
//   exists in the same file but the template never references it); the
//   "All In-Patients" toggle option's key
//   (`registration.inpatients.currentinpatients.lbl`) happens to also
//   resolve to "All In-Patients"; the Name filter's sr-only label key
//   (`registration.checkedinpatients.filter_patientname.lbl`) is borrowed
//   from the separate "checkedinpatients" feature, resolving to
//   "Patient Name"; and the Infection Control tooltip's key
//   (`medicalcertificate.dischargesummary-form.infectioncontrol.lbl`) is
//   borrowed from the Medical Certificate module, resolving to
//   "Infection Controls". All reproduced below with their real resolved
//   English text, not corrected to more "sensible" copy.
// - The real Ward/Room/Bed line
//   (`{{WardMaster.WardName}} / {{WardRoomMaster.RoomNo}} /
//   {{WardRoomBedMaster.BedNo}}`) has NO ng-if guards at all in this
//   template -- unlike the sibling patientdischarge/myinpatient
//   cellTemplates, which gate the equivalent fields on
//   WardRoomMaster/WardRoomBedMaster. The "/" separators always render
//   here even when Ward/Room/Bed are completely empty. Reproduced
//   unconditionally (no guards added).
// - The Doctor Name line in this card has NO click handler at all (plain,
//   non-interactive text) -- unlike the sibling patientdischarge/
//   myinpatient/AllOPPatientListScreen screens, whose equivalent doctor-name
//   cell dispatches a 'patientinfo' click action. Reproduced as static text.
// - $scope.handleEvents(actionType, row) on THIS controller implements only
//   a single 'edit' branch
//   (`$state.go('patientemr.patientdashboard', {pid: row.entity.Patient.Id,
//   eid: row.entity.Id})`) -- there is no 'emr'/'patientinfo'/'discharge'
//   branch here at all (unlike its siblings). Only 'edit' is dispatched by
//   this component, matching the single chevron button in the real
//   template; the payload passed back mimics the real ui-grid `row` wrapper
//   (`{ entity }`) since that is what the untouched handleEvents() expects.
// - REAL BUG in the address block: when Patient.AddressLine1 is falsy but
//   AddressLine2 is truthy, the real template's
//   `{{Patient.AddressLine1 + ','}}` literally renders the JS string
//   "undefined," (string concatenation of `undefined + ','`) before the
//   rest of the address -- AddressLine2 itself has a proper falsy-guard
//   ternary but AddressLine1 does not. Reproduced verbatim below (not
//   patched to hide the literal "undefined,").
// - `$scope.Items = []` and `uibButtonConfig.activeClass = "opt-selected"`
//   are both set at controller init but never read/written again anywhere
//   else in this file -- dead state, not exposed in reactProps. The
//   "opt-selected" CSS class itself was purely a presentational hook for
//   the old Bootstrap toggle buttons and is not carried forward, matching
//   the same choice already made on other migrated screens that discard
//   legacy inline <style> blocks in favor of the shared design system.
// ---------------------------------------------------------------------------
export const PendingDischargesScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    currentcontext = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;
  const option = currentcontext.option || 'myinpatients';

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

  return (
    <div style={{ fontFamily: typography.fontFamily, padding: `${spacing.sm} ${spacing.md} ${spacing.xl}` }}>
      {/* Header: title + Doctor Dashboard / Bed Management / Infection Control shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
        {/* Real translate key resolves to "In Patient Lists", not "Pending Discharges" -- see disclosure above. */}
        <h4 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>
          In Patient Lists
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            type="button"
            title="Doctor Dashboard"
            onClick={() => dispatch('doctorDashboard')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <img src="app/img/main/download.png" alt="home" style={{ width: 24, height: 24 }} />
          </button>
          <button
            type="button"
            title="Bed Management"
            onClick={() => dispatch('bedManagement')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <img src="app/img/main/235797.png" alt="bed" style={{ width: 24, height: 24 }} />
          </button>
          <button
            type="button"
            title="Infection Controls"
            onClick={() => dispatch('infectionControl')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: radii.full, border: 'none',
              backgroundColor: colors.primary, color: '#fff', cursor: 'pointer', fontSize: '15px',
            }}
          >
            <i className="fa fa-bug" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* My In-Patients / All In-Patients toggle -- mirrors uib-btn-radio + ng-click="getList()" */}
      <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.md }}>
        <button type="button" style={optionBtnStyle(option === 'myinpatients')} onClick={() => dispatch('toggleOption', { option: 'myinpatients' })}>
          My In-Patients
        </button>
        {/* Real translate key here is registration.inpatients.currentinpatients.lbl -- see disclosure above. */}
        <button type="button" style={optionBtnStyle(option === 'allinpatients')} onClick={() => dispatch('toggleOption', { option: 'allinpatients' })}>
          All In-Patients
        </button>
      </div>

      {/* Filter row */}
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Patient Name"
              leftIcon="fas fa-search"
              placeholder="Patient Name"
              value={currentfilter.patientnamemrn ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patientnamemrn', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') dispatch('search'); }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            {/* Real bug: this field's value is never actually sent to the server -- see disclosure above. */}
            <DatePicker
              label="Admit Date"
              value={currentfilter.visitdate ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'visitdate', value: v })}
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
          <div style={{ minWidth: 200 }}>
            <Select
              label="Status"
              value={currentfilter.admissionstatusid ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'admissionstatusid', value: Number(v) })}
              options={(lookup.AdmissionStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
        </FilterBar>
      </Card>

      {/* Patient list -- the real ui-grid here has exactly one active column
          ("Patient Details") whose cellTemplate is the full patient card below,
          so it is reproduced as a plain card list rather than forced into the
          shared DataTable component (same choice as PatientSearchScreen.tsx). */}
      {items.length === 0 ? (
        <EmptyState text="No records" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {items.map((row) => (
            <PendingDischargeCard key={row.Id} row={row} onAction={dispatch} />
          ))}
        </div>
      )}

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

const PendingDischargeCard: React.FC<{ row: PendingDischargeEntity; onAction: (action: string, payload?: any) => void }> = ({ row, onAction }) => {
  const patient = row.Patient || {};
  const hasAddress = !!(patient.AddressLine1 || patient.AddressLine2);

  return (
    <Card padding={spacing.md}>
      <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Photo -- see disclosure above: Photo is never actually populated in
            production (loadPhotos() dead code), so only the placeholder ever shows. */}
        <div style={{ flex: '0 0 56px' }}>
          {patient.PhotoPath && patient.Photo ? (
            <img
              src={`data:image/png;base64,${patient.Photo}`}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          ) : (
            <img
              src={patient.GenderId === 2 ? 'app/img/main/no-img-female.png' : 'app/img/main/no-img-icon.png'}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          )}
        </div>

        {/* Name / demographics / address / contact */}
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.primary }}>
            {patient.Title?.Description} {patient.FirstName} {patient.LastName}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.textMain }}>
            <span style={{ color: colors.textMain }}>MRN - {patient.MRN || 'N/A'}</span>
            {' | '}{patient.Gender?.Description || 'N/A'}
            {' | '}{formatAge(patient.Age)}
            {' | '}{patient.DOB ? formatDate(patient.DOB) : 'N/A'}
          </div>
          {hasAddress ? (
            <div style={{ fontSize: '11px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;
              {/* Real bug: renders the literal string "undefined," when AddressLine1
                  is falsy -- see file-level disclosure comment above. */}
              {`${patient.AddressLine1},`} {patient.AddressLine2 ? `${patient.AddressLine2},` : ''}{' '}
              {patient.Area ? `${patient.Area},` : ''} {patient.City ? `${patient.City},` : ''}{' '}
              {patient.State ? `${patient.State},` : ''} {patient.Country || ''}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;N/A
            </div>
          )}
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>
            <i className="fa fa-phone-square" aria-hidden="true" /> : {patient.LandLine}{' | '}
            NRIC - {patient.NationalityIdentifier || 'N/A'}
          </div>
        </div>

        {/* Admission timeline: admitting reason / date+visit-id / ward-room-bed / status */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          {row.AdmittingReason?.Description ? (
            <Badge tone="warning">{row.AdmittingReason.Description}</Badge>
          ) : null}
          <div style={{ fontSize: '12px', color: colors.primary, marginTop: spacing.xs }}>
            {formatDateTime(row.AdmissionDate)}&nbsp;|&nbsp;{row.VisitIdentifier}
          </div>
          {/* Real template has NO guards here at all (unlike sibling screens) --
              separators always render even when Ward/Room/Bed are empty; see
              disclosure above. */}
          <div style={{ fontSize: '12px', color: colors.primary }}>
            {row.WardMaster?.WardName} / {row.WardRoomMaster?.RoomNo} / {row.WardRoomBedMaster?.BedNo}
          </div>
          {row.AdmissionStatus?.Description ? (
            <div style={{ marginTop: spacing.xs }}>
              <Badge tone="success">{row.AdmissionStatus.Description}</Badge>
            </div>
          ) : null}
        </div>

        {/* Diagnosis / doctor / ALOS */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          {row.Diagnosis?.DiagnosisName ? (
            <Badge tone="neutral">{row.Diagnosis.DiagnosisName}</Badge>
          ) : null}
          {/* Real bug: no click handler on Doctor Name in this template -- see
              disclosure above; plain, non-interactive text. */}
          <div style={{ fontSize: '12px', color: colors.primary, marginTop: spacing.sm }}>
            {row.Doctor?.Title?.Description} {row.Doctor?.FirstName} {row.Doctor?.LastName}
          </div>
          {row.ALOS !== undefined && row.ALOS !== null ? (
            <div style={{ marginTop: spacing.xs }}>
              <Badge tone="info">{row.ALOS} Days</Badge>
            </div>
          ) : null}
        </div>

        {/* Real chevron button -- dispatches 'edit', mimicking the ui-grid `row`
            wrapper the untouched handleEvents('edit', row) expects. */}
        <div style={{ flex: '0 0 auto', alignSelf: 'center' }}>
          <button
            type="button"
            onClick={() => onAction('edit', { entity: row })}
            style={{
              border: 'none', background: colors.surfaceMuted, color: colors.textMain,
              borderRadius: radii.sm, width: 30, height: 30, cursor: 'pointer',
            }}
          >
            <i className="fa fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  );
};
