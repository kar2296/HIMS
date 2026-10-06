import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from './Button';

interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

interface LookupShape {
  AppointmentType?: LookupOption[];
  AppointmentStatus?: LookupOption[];
  AppointmentCategory?: LookupOption[];
  Facility?: LookupOption[];
  Department?: LookupOption[];
  Resource?: LookupOption[];
  Priority?: LookupOption[];
  Remark?: LookupOption[];
  VisitType?: LookupOption[];
  Gender?: LookupOption[];
  Title?: LookupOption[];
  Doctor?: LookupOption[];
  Group?: LookupOption[];
  ResearchProject?: LookupOption[];
  PatientGuarantor?: LookupOption[];
  [key: string]: any;
}

interface ItemShape {
  Id?: number;
  PatientId?: number;
  AppointmentTypeId?: number;
  AppointmentStatusId?: number;
  AppointmentDate?: string | Date;
  AppointmentCategoryId?: number;
  PatientGuarantorId?: number;
  ResearchProjectId?: number;
  FacilityId?: number;
  DepartmentId?: number;
  ResourceId?: number;
  IsForceBooking?: boolean;
  StartTime?: string;
  EndTime?: string;
  PriorityId?: number;
  VisitTypeId?: number;
  IsAssignedToUser?: boolean;
  IsAssignedToGroup?: boolean;
  IsMRDFile?: boolean;
  AssignedUserId?: number;
  AssignedUserName?: string;
  AssignedGroupId?: number;
  RemarkId?: number;
  Comments?: string;
  CancelledRemarks?: string;
  [key: string]: any;
}

interface CurrentContextShape {
  id?: number;
  pid?: number;
  ct?: string;
  isnewpatient?: boolean;
  attachmentcount?: number;
  [key: string]: any;
}

interface SelectedPatientShape {
  MRN?: string;
  Title?: { Description?: string };
  FirstName?: string;
  Gender?: { Description?: string };
  Age?: string | number;
  DOB?: string | Date;
  Mobile?: string;
  [key: string]: any;
}

interface NewPatientShape {
  FirstName?: string;
  Mobile?: string;
  TitleId?: number;
  GenderId?: number;
  Age?: string | number;
  DOB?: string | Date;
  ApproxAgeDays?: string | number;
  ApproxAgeMonths?: string | number;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: ItemShape;
  currentcontext?: CurrentContextShape;
  lookup?: LookupShape;
  selectedPatient?: SelectedPatientShape;
  newPatient?: NewPatientShape;
  canShowResearchProject?: boolean;
  canShowVisitType?: boolean;
  canShowApproxAge?: boolean;
  canDisableCategory?: boolean;
  canDisableGurarantor?: boolean;
  canDisableProject?: boolean;
  canDisableFacility?: boolean;
  canDisableDepartment?: boolean;
  canDisableResource?: boolean;
  canDisableAppointmentType?: boolean;
  canDisableAppointmentDate?: boolean;
  isCancelled?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => { onAction?.(action, payload); };

// AppointmentDate is a plain JS Date object on $scope.item (set via
// utl.Formatter.getDate(...)/new moment(...) in the controller) -- bridge
// boundary only, matching the established date-string convention.
const toDateInputValue = (d?: string | Date): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: spacing.md,
};

const panelStyle: React.CSSProperties = { fontFamily: typography.fontFamily };

// ---------------------------------------------------------------------------
// appointment-form (modal opened via utl.Modal.open('app.appointment', ...),
// controller `appointmentFormController` in appointment-form.js) -- the
// single most-referenced screen in the whole Appointment module (53 live
// callers app-wide: patient search, quick/full registration, checked-in
// patients, patient tracker, IVF registration, appointment lists, doctor
// dashboards). All API calls, validation and scheduling/slot-computation
// logic below stay in the untouched Angular controller.
//
// ELEVEN mounts share one reactProps/handleReactAction. Several native
// elements are left entirely untouched, matching established precedent:
//   [native] <patientsearch>       -- server-searched patient lookup widget
//   [native] <patientbanner>       -- shared vendor patient summary banner
//   [native] <uib-tabset>          -- the "Details"/"Order" tab STRIP: dead
//                                     chrome (see BUG 1), left exactly as-is
//   [native] <autosearch> (Doctor) -- config="vm.doctorcontrolconfig",
//                                     debounced/server-searched consultant
//                                     picker (physician-area row)
//   [native] <autosearch> (Referral) + its "Add" button -- config=
//                                     "vm.referralcontrolconfig", same class
//                                     of widget, kept with its button since
//                                     they are one tightly-coupled row
//   [native] <jqx-scheduler>       -- the day-view slot/appointment grid.
//                                     3rd-party jQWidgets calendar wired
//                                     directly to jQuery event handlers
//                                     (appointmentClick/dateChange/
//                                     bindingComplete) that write straight
//                                     into $scope.item.StartTime/EndTime/
//                                     AppointmentDate and call $scope.$apply()
//                                     themselves -- reimplementing this in
//                                     React would be a high-regression-risk
//                                     rewrite of real scheduling UI for zero
//                                     functional gain (same call as
//                                     doctordashboard.js's jqx-scheduler,
//                                     already left native in an earlier
//                                     batch).
//
// Because the native Doctor/Resource row and the native Referral row each
// sit *inside* the same Bootstrap two-column layout as several convertible
// selects, those columns are split into small mounts on either side of each
// native widget so the original top-to-bottom order is preserved exactly:
//   1. AppointmentFormTopBar       -- header row: AppointmentType,
//                                      AppointmentStatus, AppointmentDate
//                                      (native <patientsearch> column stays
//                                      before this, untouched)
//   2. AppointmentFormPatientPanel -- "Patient info" fieldset: Category,
//                                      MRN(view), Guarantor+Add, Research
//                                      Project, Mobile(view/new), Title
//                                      (view/new), Name(view/new), Gender
//                                      (view/new), Approx Age (new, BABY OF
//                                      only), DOB(view/new), Age(view/new)
//   3. AppointmentFormApptTop      -- "Appointment info" left column, top:
//                                      Facility, Department
//      [native] <autosearch> Doctor, ng-show canShowPhysicianArea()
//   4. AppointmentFormResourceRow  -- Resource select + disabled "Add"
//                                      button, ng-show canShowResourceArea()
//   5. AppointmentFormForceBooking -- Force Booking checkbox
//   6. AppointmentFormTimeDisplay  -- "Appointment info" right column, top:
//                                      Start/End time (always
//                                      ng-disabled="true" in the original --
//                                      read-only display, set only by the
//                                      native scheduler's slot-click handler)
//      [native] <autosearch> Referral + "Add" button
//   7. AppointmentFormApptBottom   -- Priority, Visit Type (checked-in only)
//   8. AppointmentFormAssignPanel -- "Assign To" fieldset (checked-in status
//                                      only): Assign To User/Group, MRD
//                                      File, Assigned User, Assigned Group
//   9. AppointmentFormRemarksPanel -- Remark, Comments
//  10. AppointmentFormCancelledRemarks -- Cancelled Remarks (status=5 only)
//  11. AppointmentFormFooter      -- Previous Appointment / Attachments /
//                                      History / Print / Save / Cancel
//
// Real, disclosed pre-existing defects preserved exactly, NOT fixed:
//
// 1. `$scope.tabs` (Details/Order) + `$scope.switchTab(tab)` render a tab
//    STRIP but `switchTab` is a literal no-op (`//$state.go(tab.state);` is
//    commented out) -- clicking either tab does nothing. Purely decorative,
//    dead chrome in the original; left native/unchanged rather than
//    reimplemented, since reproducing inert markup adds risk for zero gain.
// 2. The Mobile Number input's digit-only restriction
//    (`onChange="numberonly($event)" onKeyUp="numberonly($event)"
//    ng-keypress="numberonly($event)"`) calls a bare global `numberonly`
//    that is never defined anywhere in this app (confirmed: no
//    `function numberonly` exists in public/js/ or public/vendor/, and this
//    controller does not define a local `$scope.numberonly` either, unlike
//    several OTHER controllers in this codebase that do define their own).
//    Every keypress on this field throws a real "numberonly is not a
//    function" error in the original (swallowed by Angular's default
//    $exceptionHandler) -- the digit-only restriction has never actually
//    worked in production. Reproduced by applying NO filtering here either.
// 3. `<ui-select ng-model="item.PatientGuarantorId">`,
//    `ResearchProjectId`, `FacilityId`, `PriorityId` (well, Priority DOES
//    have `required` but no ng-change), `VisitTypeId`, `IsMRDFile`,
//    `AssignedGroupId` all carry no `ng-change` in the original template --
//    the dispatcher below updates only the corresponding field for these,
//    with no secondary recompute, matching the original exactly.
// 4. Duplicate/orphaned `<form name="item_form">` bug class does NOT apply
//    here -- this template declares the form only once. `required` on
//    Category/Facility/Department/Priority/AppointmentDate is real and
//    registers with `item_form` in the original; those attributes are lost
//    once the fields render through React (same migration-note caveat
//    documented in DoctorPrescribeFormScreen.tsx applies here too --
//    `utl.Validator.validate($scope)` reads `item_form.$valid`, so Save's
//    client-side required-field gate is weakened for these specific fields.
//    `saveItem()`'s own `validateForm()` still independently re-checks
//    Category/Facility/Department/Priority for -1/blank server-side-styled
//    guards before the API call, so a truly empty save is still blocked --
//    only the inline red-asterisk/`$invalid` styling feedback is lost, not
//    the save-time guard itself).
// 5. `doctorChange()` sets `item.DepartmentId` from the selected doctor's
//    own department and calls `setAssignToDetails()` + `getList()`, but is
//    invoked ONLY from `getdeptCallback` (an async response handler), never
//    directly from any template `ng-change` -- reproduced by leaving that
//    call chain exactly as-is (unaffected by this migration; native
//    <autosearch> already drives `onDoctorSelected` -> `getdepartment()` ->
//    `getdeptCallback` -> `doctorChange()` unchanged).
// 6. The Resource row's "Add" button is permanently disabled
//    (`ng-disabled="true"`) with an empty `ng-click=""` in the original --
//    a decorative, never-functional button. Reproduced as an always-disabled
//    button with no dispatch.
// 7. `AssignedUserId`'s `ui-select-choices` template renders BOTH
//    `lookupitem.Title.Description` and `lookupitem.Text` as separate spans
//    (title + name) -- reproduced by combining them into one option label
//    (`toOptions` alone would drop the title prefix); handled with a small
//    local mapper instead of the shared `toOptions` helper for this one
//    field.
// 8. Start/End Time are rendered as plain disabled text (not a real time
//    picker) intentionally: they are ALWAYS `ng-disabled="true"` in the
//    original (can never be edited by typing -- only the native scheduler's
//    slot-click handler ever writes `item.StartTime`/`EndTime`, via
//    `utl.Formatter.getTimeString24Hour`), so introducing a
//    format-parsing native `<input type="time">` here would risk silently
//    blanking a value in a format the browser's time input doesn't parse,
//    for a field the user can never edit either way. A plain disabled text
//    display carries zero regression risk and shows the exact same string.
// ---------------------------------------------------------------------------

export const AppointmentFormTopBar: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canDisableAppointmentType, canDisableAppointmentDate } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, ...fieldGrid, flex: 1 }}>
      <Select
        label="Appointment Type"
        options={toOptions(lookup.AppointmentType)}
        value={item.AppointmentTypeId ?? ''}
        disabled={!!canDisableAppointmentType}
        onChange={(v) => dispatch('appointmentTypeChange', { value: v })}
      />
      <Select
        label="Appointment Status"
        options={toOptions(lookup.AppointmentStatus)}
        value={item.AppointmentStatusId ?? ''}
        onChange={(v) => dispatch('appointmentStatusChange', { value: v })}
      />
      <DatePicker
        label="Appointment Date"
        required
        value={toDateInputValue(item.AppointmentDate)}
        disabled={!!canDisableAppointmentDate}
        onChange={(v) => dispatch('appointmentDateChange', { value: v })}
      />
    </div>
  );
};

export const AppointmentFormPatientPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup = {}, selectedPatient = {}, newPatient = {}, currentcontext = {},
    canShowResearchProject, canShowApproxAge, canDisableCategory, canDisableGurarantor, canDisableProject,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const isNew = !!currentcontext.isnewpatient;
  return (
    <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: `${spacing.md} ${spacing.xl}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <Select label="Category" required disabled={!!canDisableCategory} options={toOptions(lookup.AppointmentCategory)}
          value={item.AppointmentCategoryId ?? ''}
          onChange={(v) => {
            const selected = (lookup.AppointmentCategory || []).find((o) => String(o.Id) === String(v));
            dispatch('categoryChange', { value: v, selected });
          }} />
        <Input label="MRN" value={selectedPatient.MRN || ''} disabled readOnly />
        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Select label="Guarantor" disabled={!!canDisableGurarantor} options={toOptions(lookup.PatientGuarantor)}
              value={item.PatientGuarantorId ?? ''} onChange={(v) => dispatch('guarantorChange', { value: v })} />
          </div>
          <Button variant="success" size="sm" icon="fa-plus" title="More" onClick={() => dispatch('addGuarantor')} />
        </div>
        {canShowResearchProject && (
          <Select label="Research Project Name" disabled={!!canDisableProject} options={toOptions(lookup.ResearchProject)}
            value={item.ResearchProjectId ?? ''} onChange={(v) => dispatch('researchProjectChange', { value: v })} />
        )}
        {!isNew ? (
          <Input label="Patient Mobile No" value={selectedPatient.Mobile || ''} disabled readOnly />
        ) : (
          // BUG 2 (see file header): numberonly() is never defined -- no digit filtering applied, matching real behavior.
          <Input label="Patient Mobile No" required value={newPatient.Mobile || ''} maxLength={10}
            onChange={(e) => dispatch('mobileChange', { value: e.target.value })} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {!isNew ? (
          <Input label="Patient Title" value={selectedPatient.Title?.Description || ''} disabled readOnly />
        ) : (
          <Select label="Patient Title" options={toOptions(lookup.Title)} value={newPatient.TitleId ?? ''}
            onChange={(v) => dispatch('titleChange', { value: v })} />
        )}
        {!isNew ? (
          <Input label="Patient Name" value={selectedPatient.FirstName || ''} disabled readOnly style={{ textTransform: 'uppercase' }} />
        ) : (
          <Input label="Patient Name" required value={newPatient.FirstName || ''} style={{ textTransform: 'uppercase' }}
            onChange={(e) => dispatch('firstNameChange', { value: e.target.value.toUpperCase() })} />
        )}
        {!isNew ? (
          <Input label="Patient Gender" value={selectedPatient.Gender?.Description || ''} disabled readOnly />
        ) : (
          <Select label="Patient Gender" options={toOptions(lookup.Gender)} value={newPatient.GenderId ?? ''}
            onChange={(v) => dispatch('genderChange', { value: v })} />
        )}
        {canShowApproxAge && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
            <Input label="Days" value={newPatient.ApproxAgeDays ?? ''} onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })} />
            <Input label="Months" value={newPatient.ApproxAgeMonths ?? ''} onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })} />
            <Input label="Years" value={newPatient.Age ?? ''} onChange={(e) => dispatch('ageYearsChange', { value: e.target.value })} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing.sm }}>
          {!isNew ? (
            <Input label="Patient DOB" value={toDateInputValue(selectedPatient.DOB)} disabled readOnly />
          ) : (
            <DatePicker label="Patient DOB" value={toDateInputValue(newPatient.DOB)}
              onChange={(v) => dispatch('newPatientDobChange', { value: v })} />
          )}
          {!isNew ? (
            <Input label="Patient Age" value={selectedPatient.Age ?? ''} disabled readOnly />
          ) : (
            <Input label="Patient Age" value={newPatient.Age ?? ''} onChange={(e) => dispatch('ageYearsChange', { value: e.target.value })} />
          )}
        </div>
      </div>
    </div>
  );
};

export const AppointmentFormApptTop: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {}, canDisableFacility, canDisableDepartment } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <Select label="Facility" required disabled={!!canDisableFacility} options={toOptions(lookup.Facility)}
        value={item.FacilityId ?? ''} onChange={(v) => dispatch('facilityChange', { value: v })} />
      <Select label="Department" required disabled={!!canDisableDepartment}
        options={toOptions(currentcontext.selecteddept)} value={item.DepartmentId ?? ''}
        onChange={(v) => dispatch('departmentChange', { value: v })} />
    </div>
  );
};

export const AppointmentFormResourceRow: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canDisableResource } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, display: 'flex', gap: spacing.sm, alignItems: 'flex-end', marginTop: spacing.md }}>
      <div style={{ flex: 1 }}>
        <Select label="Resource" disabled={!!canDisableResource} options={toOptions(lookup.Resource)}
          value={item.ResourceId ?? ''} onChange={(v) => dispatch('resourceChange', { value: v })} />
      </div>
      {/* BUG 6 (see file header): permanently disabled, empty ng-click in the original -- decorative only. */}
      <Button variant="success" size="sm" icon="fa-plus" title="More" disabled />
    </div>
  );
};

export const AppointmentFormForceBooking: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, marginTop: spacing.md }}>
      <Checkbox label="Force Booking" checked={!!item.IsForceBooking} onChange={(v) => dispatch('forceBookingChange', { value: v })} />
    </div>
  );
};

export const AppointmentFormTimeDisplay: React.FC<ScreenProps> = ({ reactProps }) => {
  const { item = {} } = reactProps || {};
  return (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {/* Always ng-disabled="true" in the original -- read-only display only, see BUG 8. */}
      <Input label="Start Time" required value={item.StartTime || ''} disabled readOnly />
      <Input label="End Time" required value={item.EndTime || ''} disabled readOnly />
    </div>
  );
};

export const AppointmentFormApptBottom: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canShowVisitType } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: spacing.md, marginTop: spacing.md }}>
      <Select label="Priority" required options={toOptions(lookup.Priority)} value={item.PriorityId ?? ''}
        onChange={(v) => dispatch('priorityChange', { value: v })} />
      {canShowVisitType && (
        <Select label="Visit Type" required options={toOptions(lookup.VisitType)} value={item.VisitTypeId ?? ''}
          onChange={(v) => dispatch('visitTypeChange', { value: v })} />
      )}
    </div>
  );
};

export const AppointmentFormAssignPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  // BUG 7 (see file header): the original renders Title.Description + Text as two spans; combined into one label here.
  const doctorOptions: SelectOption[] = (lookup.Doctor || []).map((d: any) => ({
    value: d.Id, label: [d.Title?.Description, d.Text].filter(Boolean).join(' '),
  }));
  return (
    <div style={panelStyle}>
      <div style={{ ...fieldGrid, marginBottom: spacing.md }}>
        <Checkbox label="Assign To User" checked={!!item.IsAssignedToUser} onChange={(v) => dispatch('assignedToUserChange', { value: v })} />
        <Checkbox label="Assign To Group" checked={!!item.IsAssignedToGroup} onChange={(v) => dispatch('assignedToGroupChange', { value: v })} />
        <Checkbox label="MRD File" checked={!!item.IsMRDFile} onChange={(v) => dispatch('mrdFileChange', { value: v })} />
        {item.IsAssignedToUser && (
          <Select label="User" options={doctorOptions} value={item.AssignedUserId ?? ''}
            onChange={(v) => {
              const selected = (lookup.Doctor || []).find((o) => String(o.Id) === String(v));
              dispatch('assignedUserChange', { value: v, selected });
            }} />
        )}
      </div>
      {item.IsAssignedToGroup && (
        <Select label="Group" options={toOptions(lookup.Group)} value={item.AssignedGroupId ?? ''}
          onChange={(v) => dispatch('assignedGroupChange', { value: v })} />
      )}
    </div>
  );
};

export const AppointmentFormRemarksPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, ...fieldGrid }}>
      <Select label="Remarks" options={toOptions(lookup.Remark)} value={item.RemarkId ?? ''}
        onChange={(v) => {
          const selected = (lookup.Remark || []).find((o) => String(o.Id) === String(v));
          dispatch('remarkChange', { value: v, selected });
        }} />
      <Input label="Comments" value={item.Comments || ''} onChange={(e) => dispatch('commentsChange', { value: e.target.value })} />
    </div>
  );
};

export const AppointmentFormCancelledRemarks: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, padding: `${spacing.sm} 0` }}>
      <Input label="Cancelled Remarks" value={item.CancelledRemarks || ''}
        onChange={(e) => dispatch('cancelledRemarksChange', { value: e.target.value })} />
    </div>
  );
};

export const AppointmentFormFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { currentcontext = {}, isCancelled } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...panelStyle, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, padding: `${spacing.sm} 0`, borderTop: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', gap: spacing.xs }}>
        <Button variant="icon" size="sm" icon="fa fa-book fa-xs" title="Previous Appointment" onClick={() => dispatch('previousAppointment')} />
        <Button variant="secondary" size="sm" icon="fa fa-paperclip fa-xs" title="Attachments" text={`(${currentcontext.attachmentcount ?? 0})`} onClick={() => dispatch('openAttachments')} />
        <Button variant="icon" size="sm" icon="fa fa-history fa-xs" title="History" onClick={() => dispatch('history')} />
      </div>
      <div style={{ display: 'flex', gap: spacing.xs }}>
        <Button variant="secondary" size="sm" text="Print" onClick={() => dispatch('print')} />
        {!isCancelled && <Button variant="primary" size="sm" text="Save" onClick={() => dispatch('save')} />}
        <Button variant="secondary" size="sm" text="Cancel" onClick={() => dispatch('cancel')} />
      </div>
    </div>
  );
};
