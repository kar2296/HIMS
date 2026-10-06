import React from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Input, Textarea } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

interface LookupShape {
  Department?: LookupOption[];
  PrescriptionPriority?: LookupOption[];
  StoreMaster?: LookupOption[];
  ClinicalRemarks?: LookupOption[];
  [key: string]: any;
}

interface ItemShape {
  PatientId?: number;
  PrescriptionDate?: string | Date;
  Identifier?: string;
  DisplayPrecriptionStatus?: string | null;
  DepartmentId?: number;
  PrescriptionPriorityId?: number;
  PharmacyId?: number;
  AdviceListId?: number;
  Diagnosis?: string;
  Comments?: string;
  Physiotheraphy?: string;
  ReviewDate?: string | Date;
  PrecriptionStatusId?: number;
  [key: string]: any;
}

interface CurrentContextShape {
  option?: 'detail' | 'ticksheet' | 'panels' | string;
  isPatientHasAllergy?: boolean;
  attachmentcount?: number;
  [key: string]: any;
}

interface OptionTab {
  key: string;
  name: string;
}

interface ReactPropsShape {
  item?: ItemShape;
  currentcontext?: CurrentContextShape;
  lookup?: LookupShape;
  options?: OptionTab[];
  isDisabled?: boolean;
  canShowSaveBtn?: boolean;
  canShowPrescribeBtn?: boolean;
  canShowPrescribeOrderBtn?: boolean;
  canShowClearBtn?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => { onAction?.(action, payload); };

// Date-only, e.g. for ReviewDate (originally uib-datepicker-popup, a plain Date object).
const toDateInputValue = (d?: string | Date): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

// Date+time, for PrescriptionDate (originally `datetime-picker`, also a plain Date object).
const toDateTimeInputValue = (d?: string | Date): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Mirrors the real header's own oddly-punctuated filter chain exactly:
// {{item.PrescriptionDate|date:'dd:MM:yyyy'}} {{item.PrescriptionDate|date:'HH:mm'}}
// -- colons between day/month/year (not the usual dashes/slashes), not "fixed" here.
function formatHeaderDate(d?: string | Date): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}:${pad(date.getMonth() + 1)}:${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const iconBtnStyle: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 };

// ---------------------------------------------------------------------------
// doctorprescribe-form (state app.doctorsprescription-form, controller
// `DoctorprescriptionFormController` in doctorprescribe-form.js) -- the
// doctor's prescription-writing screen, opened from prescriptions.js's
// addNew()/handleEvents('edit', ...). All API calls, validation and
// business logic below stay in the untouched Angular controller.
//
// SEVEN mounts share one reactProps/handleReactAction. The prescription-line
// grid (`<tr ng-repeat="item in prescriptionDetails | filter:{Status:1}">`,
// each row hosting a live, debounced, server-searched `<autosearch
// config="vm.drugcontrolconfig">` drug-search widget instantiated per
// ng-repeat row) is left ENTIRELY NATIVE, unchanged -- exactly the
// FamilyLinkScreen.tsx precedent (one `<autosearch>` per repeated row;
// React cannot compile an Angular directive inside a React-rendered row,
// and reimplementing the drug search/debounce/presearch-postsearch hooks
// would risk a real regression for no functional gain). The Patient field
// (native `<patientsearch>`) and the Physician field (native `<autosearch
// config="vm.doctorcontrolconfig">`) are likewise left native, matching how
// the Doctor `<autosearch>` was left native in VisitCreateFormScreen's
// precedent. `<patientbanner>`, `<ticksheetcontrol>` (Tick Sheet tab) and
// `<panelcontrol>` (Panels tab) are shared native vendor components, also
// left untouched.
//
//   1. DoctorPrescribeFormHeader     -- title/date/identifier/status banner +
//                                        doctor/patient-dashboard, Add,
//                                        Vitals/Allergies/Previous-meds icons
//   2. DoctorPrescribeFormTabs       -- Prescriptions/Tick Sheet/Panels tabs
//                                        + the allergy alert label (see BUG 3)
//      [native] <patientbanner>
//      [native] <patientsearch> (Patient field, row 1 col 1)
//   3. DoctorPrescribeFormFieldsRow1 -- Date, Department      (row 1, cols 2-3)
//      [native] <autosearch config="vm.doctorcontrolconfig"> (Physician, row 2 col 1)
//   4. DoctorPrescribeFormFieldsRow2 -- Priority, Pharmacy    (row 2, cols 2-3)
//      [native] prescription-line grid (thead + ng-repeat tbody, per-row
//               <autosearch config="vm.drugcontrolconfig">, unchanged)
//   5. DoctorPrescribeFormNotesSection -- Review Date, Advice List (+ Add),
//                                          Diagnosis, Comments, Physiotheraphy
//   6. DoctorPrescribeFormFooter     -- Back/Save-as-Rx-Panel/Attachments/
//                                        Previous-Rx/Cancel/Print/Save/
//                                        Prescribe/Prescribe&Order/Clear
//      [native] <ticksheetcontrol> (Tick Sheet tab, unchanged)
//      [native] <panelcontrol> (Panels tab, unchanged)
//
// Real, disclosed pre-existing defects preserved exactly, NOT fixed (line
// numbers refer to doctorprescribe-form.js/.html as they stood before
// migration):
//
// 1. `$scope.applyVisibilityRules = function () { }` (line 51) is a
//    PERMANENT NO-OP -- it is called from `getItemCallback` and from the
//    else-branch of `getItem()`, but never assigns `$scope.canShowSaveBtn`,
//    `canShowPrescribeBtn`, `canShowPrescribeOrderBtn` or `canShowClearBtn`
//    anywhere in this controller (confirmed: those four identifiers appear
//    ONLY in the .html template's `ng-show`, never on the LHS of an
//    assignment in the .js). Since AngularJS's `ng-show` treats an
//    undefined scope expression as falsy, the Save / Prescribe / Prescribe
//    & Order / Clear buttons in the real footer are PERMANENTLY HIDDEN --
//    there is no way, in the shipped app, to reach any of those four
//    actions from this screen's UI. Reproduced verbatim below: each button
//    still exists and is still wired to its real handler, but renders only
//    if its `canShowXxxBtn` prop is truthy, which it never is today.
// 2. `ng-change="departmentChange()"` (Department select) and
//    `itemchange="doctorChange()"` (Physician `<autosearch>`) reference
//    functions that do not exist anywhere in this controller -- calling
//    them throws inside Angular's (silently swallowed) $exceptionHandler.
//    Reproduced: selecting a department only updates `item.DepartmentId`
//    itself, no function is invoked (the Physician field stays native and
//    is unaffected by this migration either way).
// 3. The allergy warning
//    `<label ng-if="currentcontext.isPatientHasAllergy||item.PatientId>0"
//    class="allergyAlert">Patient has Drug Allergy</label>` -- note the
//    `||`: as written this renders the red "Patient has Drug Allergy"
//    warning for ANY selected patient (`PatientId>0`), regardless of
//    whether `checkDrugAllergy()` actually found an allergy. A real,
//    clinically-relevant false-positive, reproduced verbatim (not fixed).
// 4. `$scope.currentcontext.ismodal` and `$scope.confirmCallback` are read
//    in `saveItemCallback` (`if ($scope.currentcontext.ismodal) {
//    $scope.confirmCallback(); }`) and gate several footer buttons'
//    `ng-hide="IsDisabled && currentcontext.ismodal && canShowPatientControl"`,
//    but neither `ismodal` nor `confirmCallback` is EVER assigned anywhere
//    in this controller -- an apparent copy-paste remnant from a
//    modal-based sibling screen; this controller is always used as a full
//    page. Since `ismodal` is always falsy, that whole `ng-hide` clause is
//    always false, so Back / Save-as-Rx-Panel are unconditionally visible
//    and Cancel's visibility reduces to its own separate
//    `ng-show="item.PrecriptionStatusId==3"`. Reproduced by implementing
//    each button's real, always-resolving visibility and dropping the
//    always-false clause (not by hiding anything new).
// 5. The translate key `patientemr.prescription-form.advicelist.lbl`, used
//    both as the "Advice List" field's own label AND as the "+" button's
//    tooltip, does not exist in ANY shipped i18n bundle (confirmed via a
//    full-repo search of public/i18n/**) -- a genuinely missing/mismatched
//    translate key. Reproduced by using the same literal label text the
//    real page's $translate fallback would show either way ("Advice List"
//    is used here for readability; the real behavior is $translate's
//    missing-key fallback, not a real translation).
// 6. The Comments/"Advice/Instructions" textarea is disabled via
//    `ng-disabled="item.PrecriptionStatusId==3"` -- a DIFFERENT condition
//    from every other field on this screen, which uses the controller's
//    `IsDisabled` flag (true for status 2 *or* 3). Net effect: when a
//    cancelled prescription (status 2) is reopened, every other field is
//    disabled EXCEPT Comments, which stays editable. Reproduced verbatim,
//    not unified with `IsDisabled`.
// 7. `checkDuplicateEnrty()` (note the typo "Enrty") is defined but never
//    called anywhere -- dead code, nothing to wire here.
// 8. `loadData()` contains a commented-out call,
//    `// $scope.loadTickSheet();   // function not implemented` -- the
//    original author's own comment admits the function doesn't exist.
//    Left exactly as a comment; not implemented.
// 9. `$scope.onDeleteConfirmed(item)` sets `$scope.item.AvailQuantity = 0`
//    (the prescription HEADER's `AvailQuantity`, an otherwise-unused field)
//    instead of `item.AvailQuantity = 0` (the line ITEM being deleted) --
//    almost certainly a copy/paste typo. Native grid, unaffected by this
//    migration, noted for completeness.
// 10. In `$scope.drugChanged`, the `else if (item.GenericId)` branch
//     contains a no-op `item.GenericId = item.GenericId;` and
//     `item.GenericCode = item.Code;`, where `item.Code` is never set
//     anywhere on a prescription-detail line (always `undefined`). Native
//     grid, unaffected by this migration, noted for completeness.
// 11. The grid's 5th and 6th `<th>` both use the identical translate key
//     `patientemr.prescription-form.duration.lbl` ("Duration"), even though
//     the 6th column is really the Duration-Period select (Days/Weeks/
//     Months) -- a mismatched/duplicated translate key. The `dgfreq{{$index}}`
//     DOM id is also reused on both the DrugFrequencyId AND (several
//     columns later) the DrugInstructionId `<ui-select>` -- a duplicate id
//     per row. Both native grid, unaffected by this migration, noted for
//     completeness.
//
// Migration-note (not a pre-existing app bug, disclosed for the record):
// `utl.Validator.validate($scope)` (called from `saveItem`) checks
// `$scope.item_form.$valid`, the AngularJS FormController for
// `<form name="item_form">`. Native `ng-model`/`required` bindings register
// with that controller automatically; the three fields moved into React
// mounts here that originally carried `required` (Date, Department,
// Priority) no longer do, since React renders them independently of
// Angular's compiler/form registration. Because Save/Prescribe/Clear are
// already permanently unreachable today (BUG 1 above), this has no live
// observable effect right now -- disclosed in case BUG 1 is ever fixed
// upstream. Patient and Physician (native, unmodified) still participate
// normally.
// ---------------------------------------------------------------------------

export const DoctorPrescribeFormHeader: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ fontFamily: typography.fontFamily, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: `${spacing.sm} 0` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <h4 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>Manage Prescription (Rx)</h4>
        <div style={{ fontSize: '12px', display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
          <span style={{ color: colors.textMuted }}>{formatHeaderDate(item.PrescriptionDate)}&nbsp;|</span>
          <span style={{ color: colors.primary }}>{item.Identifier}&nbsp;|</span>
          {item.DisplayPrecriptionStatus && (
            <span style={{ background: '#a52a2a', color: '#fff', padding: '1px 8px', borderRadius: radii.sm }}>{item.DisplayPrecriptionStatus}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button type="button" title="Doctor Dashboard" onClick={() => dispatch('doctorDashboard')} style={iconBtnStyle}>
          <img src="app/img/main/download.png" alt="home" style={{ width: 22, height: 22 }} />
        </button>
        <button type="button" title="Patient Dashboard" onClick={() => dispatch('patientDashboard')} style={iconBtnStyle}>
          <img src="app/img/main/patdash.png" alt="patient dashboard" style={{ width: 22, height: 22 }} />
        </button>
        <Button variant="primary" size="sm" icon="fa-plus" text="Add New" onClick={() => dispatch('addNew')} />
        <Button variant="info" size="sm" text="Vital(s)" onClick={() => dispatch('vital')} />
        <Button variant="warning" size="sm" text="Allergies" onClick={() => dispatch('patientAllergy')} />
        <Button variant="secondary" size="sm" text="Previous Prescriptions" onClick={() => dispatch('previousMedication')} />
      </div>
    </div>
  );
};

export const DoctorPrescribeFormTabs: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { currentcontext = {}, item = {}, options = [] } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const active = currentcontext.option || 'detail';
  // BUG 3 (see file header): `||` means this shows for ANY selected patient, not only patients with a real allergy.
  const showAllergyAlert = !!currentcontext.isPatientHasAllergy || Number(item.PatientId) > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', fontFamily: typography.fontFamily, marginBottom: spacing.md }}>
      <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const isActive = active === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => dispatch('optionChange', { value: opt.key })}
              style={{
                border: `1px solid ${isActive ? colors.primary : colors.border}`,
                background: isActive ? colors.primary : colors.surface,
                color: isActive ? '#fff' : colors.textMain,
                borderRadius: radii.sm,
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {opt.name}
            </button>
          );
        })}
      </div>
      {showAllergyAlert && (
        <span style={{ color: '#ff0000', fontWeight: 700, fontSize: '13px' }}>Patient has Drug Allergy</span>
      )}
    </div>
  );
};

export const DoctorPrescribeFormFieldsRow1: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, isDisabled } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, fontFamily: typography.fontFamily }}>
      <DatePicker
        label="Date"
        required
        includeTime
        disabled={!!isDisabled}
        value={toDateTimeInputValue(item.PrescriptionDate)}
        onChange={(v) => dispatch('itemDateFieldChange', { field: 'PrescriptionDate', value: v })}
      />
      {/* BUG 2 (see file header): departmentChange() is undefined -- field-only update, no function call. */}
      <Select
        label="Department"
        required
        disabled={!!isDisabled}
        options={toOptions(lookup.Department)}
        value={item.DepartmentId ?? ''}
        onChange={(v) => dispatch('itemFieldChange', { field: 'DepartmentId', value: Number(v) })}
      />
    </div>
  );
};

export const DoctorPrescribeFormFieldsRow2: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, isDisabled } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, fontFamily: typography.fontFamily }}>
      <Select
        label="Priority"
        required
        disabled={!!isDisabled}
        options={toOptions(lookup.PrescriptionPriority)}
        value={item.PrescriptionPriorityId ?? ''}
        onChange={(v) => dispatch('itemFieldChange', { field: 'PrescriptionPriorityId', value: Number(v) })}
      />
      <Select
        label="Pharmacy"
        disabled={!!isDisabled}
        options={toOptions(lookup.StoreMaster)}
        value={item.PharmacyId ?? ''}
        onChange={(v) => dispatch('itemFieldChange', { field: 'PharmacyId', value: Number(v) })}
      />
    </div>
  );
};

export const DoctorPrescribeFormNotesSection: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, isDisabled } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  // BUG 6 (see file header): Comments uses a different disable condition (status==3 only) than every other field (IsDisabled, status 2 or 3).
  const commentsDisabled = Number(item.PrecriptionStatusId) === 3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, fontFamily: typography.fontFamily, marginTop: spacing.md }}>
      <DatePicker
        label="Review Date"
        disabled={!!isDisabled}
        value={toDateInputValue(item.ReviewDate)}
        onChange={(v) => dispatch('itemDateFieldChange', { field: 'ReviewDate', value: v })}
      />
      <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          {/* BUG 5 (see file header): translate key patientemr.prescription-form.advicelist.lbl does not exist in any shipped i18n bundle. */}
          <Select
            label="Advice List"
            disabled={!!isDisabled}
            options={toOptions(lookup.ClinicalRemarks)}
            value={item.AdviceListId ?? ''}
            onChange={(v) => dispatch('adviceListChange', { value: Number(v) })}
          />
        </div>
        <Button variant="success" size="sm" icon="fa-plus" title="Advice List" onClick={() => dispatch('addClinicalRemark')} />
      </div>
      <Input
        label="Diagnosis"
        disabled={!!isDisabled}
        value={item.Diagnosis ?? ''}
        onChange={(e) => dispatch('itemFieldChange', { field: 'Diagnosis', value: e.target.value })}
      />
      <Textarea
        label="Advice/Instructions"
        rows={1}
        maxLength={4000}
        disabled={commentsDisabled}
        value={item.Comments ?? ''}
        onChange={(e) => dispatch('itemFieldChange', { field: 'Comments', value: e.target.value })}
      />
      <Input
        label="Physiotheraphy"
        disabled={!!isDisabled}
        value={item.Physiotheraphy ?? ''}
        onChange={(e) => dispatch('itemFieldChange', { field: 'Physiotheraphy', value: e.target.value })}
      />
    </div>
  );
};

export const DoctorPrescribeFormFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, canShowSaveBtn, canShowPrescribeBtn, canShowPrescribeOrderBtn, canShowClearBtn } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const statusId = Number(item.PrecriptionStatusId);
  const showCancel = statusId === 3;
  const showPrint = statusId === 3;
  // canShowPrescribeBtn/canShowPrescribeOrderBtn additionally require status != 2 and != 3 in the original (ng-hide) -- kept for fidelity even though both flags are always falsy today (BUG 1).
  const showPrescribe = !!canShowPrescribeBtn && statusId !== 2 && statusId !== 3;
  const showPrescribeOrder = !!canShowPrescribeOrderBtn && statusId !== 2 && statusId !== 3;
  // canShowSaveBtn additionally requires status to be neither 1, 2 nor 3 in the original (ng-hide) -- kept for fidelity even though the flag is always falsy today (BUG 1).
  const showSave = !!canShowSaveBtn && statusId !== 1 && statusId !== 2 && statusId !== 3;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, fontFamily: typography.fontFamily, marginTop: spacing.lg, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* BUG 4 (see file header): the original's ng-hide gate on Back/Save-as-Rx-Panel is always false (ismodal is never assigned) -- both are unconditionally visible. */}
        <Button variant="secondary" size="sm" icon="fa-angle-left" text="Back" onClick={() => dispatch('backToList')} />
        <Button variant="warning" size="sm" text="Save as Rx Panel" onClick={() => dispatch('saveAsRxPanel')} />
        <Button variant="light" size="sm" icon="fa-paperclip" text={`(${currentcontext.attachmentcount ?? 0})`} title="Attachments" onClick={() => dispatch('openAttachments')} />
        <Button variant="primary" size="sm" icon="fa-history" title="Previous Prescriptions" onClick={() => dispatch('previousPrescription')} rounded="full" />
        {showCancel && <Button variant="danger" size="sm" text="Cancel" onClick={() => dispatch('saveCancelled')} />}
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
        {showPrint && <Button variant="light" size="sm" text="Print" onClick={() => dispatch('print')} />}
        {/* BUG 1 (see file header): canShowSaveBtn/canShowPrescribeBtn/canShowPrescribeOrderBtn/canShowClearBtn are never assigned (applyVisibilityRules() is a permanent no-op) -- these four never render in the real app either. */}
        {showSave && <Button variant="primary" size="sm" text="Save" onClick={() => dispatch('saveDraft')} />}
        {showPrescribe && <Button variant="info" size="sm" text="Prescribe" onClick={() => dispatch('prescribe')} />}
        {showPrescribeOrder && <Button variant="info" size="sm" text="Prescribe&Order" onClick={() => dispatch('prescribeAndOrder')} />}
        {!!canShowClearBtn && <Button variant="warning" size="sm" text="Clear" onClick={() => dispatch('clear')} />}
      </div>
    </div>
  );
};
