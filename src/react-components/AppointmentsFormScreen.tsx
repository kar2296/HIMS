import React from 'react';
import { spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';

interface LookupOption {
  Id: number;
  Text: string;
}

interface ItemShape {
  AppointmentCategoryId?: number | string;
  AppointmentDate?: string | Date;
  AppointmentStatus?: { Description?: string };
  DepartmentId?: number | string;
  DoctorId?: number | string;
  PriorityId?: number | string;
  AppointmentStatusId?: number | string;
  StartTime?: string;
  EndTime?: string;
  Remarks?: string;
  IsVideoConsultation?: boolean;
  VisitTypeId?: number | string;
  ReferTypeId?: number | string;
  CancelorRescheduleComments?: string;
  DoctorName?: string;
  DepartmentName?: string;
  PatientId?: number;
  SelectedSlot?: string;
  IsForceBooking?: number;
  candisable?: boolean;
}

interface SelectedPatientShape {
  Title?: { Description?: string };
  FirstName?: string;
  DOB?: string;
  Age?: number | string;
  Gender?: { Description?: string };
  Mobile?: string;
  Email?: string;
  AddressLine1?: string;
}

interface NewPatientShape {
  TitleId?: number | string;
  FirstName?: string;
  DOB?: string;
  Age?: number | string;
  GenderId?: number | string;
  Mobile?: string;
  Email?: string;
  ApproxAgeDays?: number | string;
  ApproxAgeMonths?: number | string;
  AddressLine1?: string;
}

interface CurrentContextShape {
  id?: number;
  isnewpatient?: boolean;
  isreschedule?: boolean;
  Qualification?: string;
}

interface LookupShape {
  AppointmentCategory?: LookupOption[];
  Title?: LookupOption[];
  Gender?: LookupOption[];
  Department?: LookupOption[];
  Doctor?: LookupOption[];
  Priority?: LookupOption[];
  AppointmentStatus?: LookupOption[];
  VisitType?: LookupOption[];
  ReferralType?: LookupOption[];
}

interface SlotItem {
  SlotName?: string;
  AvialSlot?: string;
  Selected?: boolean;
  isSelected?: boolean;
  isBookedAppt?: boolean;
  isHoliday?: boolean;
  isBreak?: boolean;
}

interface AvailSlotGroup {
  SlotName?: string;
  SlotItems?: SlotItem[];
}

interface ReactPropsShape {
  item?: ItemShape;
  lookup?: LookupShape;
  currentcontext?: CurrentContextShape;
  selectedPatient?: SelectedPatientShape;
  newPatient?: NewPatientShape;
  searchDoctorbydept?: number;
  disableAppointment?: number;
  disableSlot?: number;
  noshown?: number;
  CanShowCancel?: boolean;
  CanShowCheckin?: boolean;
  CanShowSaveBtn?: boolean;
  canDisablePatientDiv?: boolean;
  canDisableAppointmentDiv?: boolean;
  canShowVisitType?: boolean;
  canShowApproxAge?: boolean;
  newAppointmentSlot?: AvailSlotGroup[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => {
  onAction?.(action, payload);
};

// Same ISO yyyy-mm-dd bridge convention used across the project's DatePicker-
// backed fields (see AppointmentFormScreen.tsx's toDateInputValue).
function toDateInputValue(d?: string | Date): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Real `$scope.numberonly(e)` keypress filter, reproduced verbatim (digits and
// charCode 0 pass through, everything else is prevented) -- this screen DOES
// define numberonly locally (unlike appointment-form.js's sibling bug where
// the same-named global doesn't exist anywhere in the app).
function numericOnly(e: React.KeyboardEvent<HTMLInputElement>) {
  const charCode = e.charCode;
  if ((charCode > 47 && charCode < 58) || charCode === 0) return;
  e.preventDefault();
}

// React bridge migration for appointmentnew/appointments-form.js
// (`appointmentsFormController`, the appointmentstab "Details" tab, reached
// via the shell's nested `<div ui-view>` -- see AppointmentsTabScreen.tsx).
// This is by far the largest single controller migrated so far (2,950 lines,
// 97 top-level $scope functions) -- much of that size turns out to be DEAD
// CODE once cross-checked against the live (non-commented) template, almost
// certainly copy-pasted from the already-migrated appointment-form.js /
// appointments-list.js siblings and never trimmed. Confirmed dead, NOT
// reproduced (left exactly as-is in the untouched .js, still defined and
// still harmless, just never invoked from any live UI element):
//  - The ENTIRE jqx-scheduler wiring (`getSchedulerSource`, `refreshScheler`,
//    `apptClick`, `calDateChange`, `apptBindingComplete`, `createDummyAppt`,
//    which is unconditionally SELF-INVOKED at controller init) -- there is
//    NO `<jqx-scheduler>`/`#scheduler` element anywhere in this template, so
//    every jQuery `$('#scheduler')...` call in this block silently no-ops
//    (selecting nothing). This screen's real appointment-slot picker is a
//    completely different, native `ng-repeat` button grid (see
//    AppointmentsFormSlotPicker below), fed by `getDrApptSessionCallback`
//    (NOT the scheduler code), left fully native/untouched.
//  - `overwriteCurrentItem()` -- only a commented-out call remains; would
//    also throw (references an uninjected `modalConfig`) if ever called.
//  - `backToList()` (references an uninjected/undefined `$scope.confirmCallback`,
//    would throw if ever called), `UpdateAppointmentRequest()` (the only thing
//    that would have invoked backToList as a callback, itself never called),
//    `checkOut()`/`CheckoutCallback()` (no button anywhere dispatches
//    `checkOut()`; `$scope.CanShowCheckout` is set but never read by any
//    `ng-show` in the template).
//  - `appointmentCategoryChanged(item)` -- the real `<radiogroupcontrol>` usage
//    here has NO `changeev` attribute bound at all, so this handler is never
//    invoked; category selection only ever runs the directive's own two-way
//    `itemid` binding (see AppointmentsFormCategoryButtons below).
//  - `canDisableGurarantor/Facility/Consultant/Resource/Time/Category/RemarksDiv/
//    PatientSearch/AppointmentType/AppointmentDate`, `addGuarantor()` -- none of
//    these names appear anywhere in the live template (no Guarantor/Facility/
//    Consultant/Resource UI exists on this screen at all, unlike its sibling
//    appointment-form.js which has all of them) -- confirmed dead.
//  - `savecrossconsultation()` / `isPreviousEncounterCheckinExist(+Callback)` /
//    `confirmcheckout(+Callback)` / `isPreviousEncounterExist(+Callback)` --
//    none are called from anywhere in this file or the template; dead.
//  - `canShowResearchProject()` is called by the template
//    (`ng-show="canShowResearchProject()"`) but is **never defined anywhere**
//    in this controller -- the expression throws on every digest and Angular
//    treats the failed evaluation as falsy, so the Research Project field is
//    ALWAYS HIDDEN in production today, for every appointment, regardless of
//    any real business rule. Reproduced faithfully by not rendering a
//    Research Project field at all (matching its real always-hidden state),
//    rather than "fixing" it by adding the missing function.
//  - `DisableReferral` (used as `ng-disabled`/`candisable` on the ReferType
//    select and Referrer autosearch) is never assigned anywhere either --
//    always `undefined`/falsy, so the Referrer/ReferType controls are always
//    enabled in practice. Reproduced by never disabling them.
//
// Architecture: six React mounts sharing one reactProps/handleReactAction --
// AppointmentsFormStatusBar (the tiny "Appointment Status: X" line, shown
// only once an existing appointment is loaded), AppointmentsFormCategoryButtons
// (replaces the real `<radiogroupcontrol>` vendor widget -- inspected its
// source directly: it's a thin uib-btn-radio wrapper with no `changeev` bound
// here, so a plain button group dispatching a value-set action is fully
// faithful), AppointmentsFormPatientPanel (the dual existing-patient/new-patient
// fields, toggled by `item.AppointmentCategoryId==1`), AppointmentsFormAppointmentPanel
// (date/department/doctor/priority/status/remarks/video-consult/visit-type/
// refer-type/cancel-reschedule-comments), AppointmentsFormSlotPicker (doctor
// photo/name/department header + the real native slot-grid, fed by
// `NewAppointmentSlot`), and AppointmentsFormFooter (Cancel/No-Shown/CheckIn/
// Reschedule/Save). Kept fully native, untouched, as siblings around/between
// the mounts at their exact original positions: `<patientbanner>`,
// `<patientsearch>` (shown only when AppointmentCategoryId!=1), the Google
// Places address-autocomplete block (`gm-places-autocomplete`, itself gated
// by a REAL, live `item.IsAddressSearch` facility setting -- not dead), and
// the Referrer `<autosearch>` widget -- all matching the established
// REUSABLE-SUB-WIDGET-PATTERN precedent (live, server-searched/config-driven
// vendor directives, reimplementing risks regression).
//
// Migration-note (not a pre-existing bug, disclosed for the record): `saveItem()`
// guards with `if (!utl.Validator.validate($scope)) { $scope.showErrorMsg(...); return; }`
// -- `$scope.showErrorMsg` is never defined anywhere in this controller (the
// real pattern used everywhere else is `utl.Alert.showErrorMsg`), so this
// branch would throw an uncaught TypeError if it were ever reached. Post-
// migration, `utl.Validator.validate($scope)` reads Angular ngModel/
// FormController state, which the now-React-rendered fields no longer
// register with, so this validator trivially returns true and the broken
// branch becomes provably unreachable rather than merely unlikely --
// `validateForm()` (which uses the correct `utl.Alert.showErrorMsg` throughout)
// remains the real, working save-time gate, unchanged.
const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: spacing.md,
};

const panelStyle: React.CSSProperties = { fontFamily: typography.fontFamily };

export const AppointmentsFormStatusBar: React.FC<ScreenProps> = ({ reactProps }) => {
  const { item = {}, currentcontext = {} } = reactProps || {};
  if (!((currentcontext.id ?? 0) > 0)) return null;
  return (
    <div style={{ ...panelStyle, textAlign: 'center', padding: `${spacing.sm} 0` }}>
      <span>
        <strong style={{ fontSize: 12 }}>Appointment Status: </strong>
        <strong style={{ fontSize: 12, color: '#ff0000' }}>{item.AppointmentStatus?.Description}</strong>
      </span>
    </div>
  );
};

// Replaces the real <radiogroupcontrol itemid="item.AppointmentCategoryId"
// items="lookup.AppointmentCategory"> vendor widget. Inspected its source
// (public/vendor/components/radiogroupcontrol.js/.html) directly: it's a
// thin uib-btn-radio wrapper whose only side effect (`changeev()`) is never
// bound in this screen's usage, so a plain button group dispatching a
// value-set action is fully faithful to the real, live behavior here.
export const AppointmentsFormCategoryButtons: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { lookup = {}, item = {}, canDisablePatientDiv } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const items = lookup.AppointmentCategory || [];
  return (
    <div className="btn-custom-radio" style={{ ...panelStyle, display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
      {items.map((opt) => {
        const active = String(item.AppointmentCategoryId) === String(opt.Id);
        return (
          <button
            key={opt.Id}
            type="button"
            disabled={!!canDisablePatientDiv}
            onClick={() => dispatch('categorySelect', { value: opt.Id })}
            className={active ? 'btn btn-primary' : 'btn btn-default'}
            style={{ cursor: canDisablePatientDiv ? 'not-allowed' : 'pointer' }}
          >
            {opt.Text}
          </button>
        );
      })}
    </div>
  );
};

// "Patient info" fieldset (ng-disabled="canDisablePatientDiv()"): dual
// existing-patient (view-only, read from `selectedPatient`) / new-patient
// (editable, bound to `newPatient`) fields, toggled by
// `item.AppointmentCategoryId==1`. Kept native/untouched, sitting around
// this mount at their exact original positions (per the file header):
// the Google Places address-autocomplete block (real, gated by the live
// `item.IsAddressSearch` facility setting) and the Research Project field
// is NOT rendered at all (confirmed always-hidden dead code -- see header).
export const AppointmentsFormPatientPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup = {}, selectedPatient = {}, newPatient = {}, canShowApproxAge, canDisablePatientDiv,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const isNew = String(item.AppointmentCategoryId) === '1';
  return (
    <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: `${spacing.md} ${spacing.xl}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {!isNew ? (
          <Input label="Patient Title" value={selectedPatient.Title?.Description || ''} disabled readOnly />
        ) : (
          <Select label="Patient Title" required disabled={!!canDisablePatientDiv} options={toOptions(lookup.Title)}
            value={newPatient.TitleId ?? ''} onChange={(v) => dispatch('titleChange', { value: v })} />
        )}
        {!isNew ? (
          <Input label="Patient Name" value={selectedPatient.FirstName || ''} disabled readOnly style={{ textTransform: 'uppercase' }} />
        ) : (
          <Input label="Patient Name" required disabled={!!canDisablePatientDiv} style={{ textTransform: 'uppercase' }}
            value={newPatient.FirstName || ''}
            onChange={(e) => dispatch('firstNameChange', { value: e.target.value.toUpperCase() })} />
        )}
        {!isNew ? (
          <Input label="Patient Gender" value={selectedPatient.Gender?.Description || ''} disabled readOnly />
        ) : (
          <Select label="Patient Gender" required disabled={!!canDisablePatientDiv} options={toOptions(lookup.Gender)}
            value={newPatient.GenderId ?? ''} onChange={(v) => dispatch('genderChange', { value: v })} />
        )}
        {!isNew ? (
          // ng-disabled="CanShowSaveBtn == false" in the original -- editable, not view-only.
          <Input label="Patient Mobile No" value={selectedPatient.Mobile || ''} disabled={reactProps?.CanShowSaveBtn === false}
            onChange={(e) => dispatch('selectedPatientMobileChange', { value: e.target.value })} />
        ) : (
          <Input label="Patient Mobile No" required maxLength={10} disabled={!!canDisablePatientDiv}
            value={newPatient.Mobile || ''} onKeyPress={numericOnly}
            onChange={(e) => dispatch('newPatientMobileChange', { value: e.target.value })} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {!isNew ? (
          <Input label="Patient DOB" value={toDateInputValue(selectedPatient.DOB)} disabled readOnly />
        ) : (
          <DatePicker label="Patient DOB" disabled={!!canDisablePatientDiv} value={toDateInputValue(newPatient.DOB)}
            onChange={(v) => dispatch('newPatientDobChange', { value: v })} />
        )}
        {!isNew ? (
          <Input label="Patient Age" value={selectedPatient.Age ?? ''} disabled readOnly />
        ) : (
          <Input label="Patient Age" required maxLength={3} disabled={!!canDisablePatientDiv}
            value={newPatient.Age ?? ''} onKeyPress={numericOnly}
            onChange={(e) => dispatch('newPatientAgeChange', { value: e.target.value })} />
        )}
        {/* Email carries no `disabled`/ng-disabled in the original for either
            branch -- it is genuinely editable even for an existing patient. */}
        {!isNew ? (
          <Input label="Email" type="email" value={selectedPatient.Email || ''}
            onChange={(e) => dispatch('selectedPatientEmailChange', { value: e.target.value })} />
        ) : (
          <Input label="Email" type="email" value={newPatient.Email || ''}
            onChange={(e) => dispatch('newPatientEmailChange', { value: e.target.value })} />
        )}
        {!isNew ? (
          <Input label="Address" value={selectedPatient.AddressLine1 || ''} disabled={!!item.candisable}
            onChange={(e) => dispatch('selectedPatientAddressChange', { value: e.target.value })} />
        ) : (
          <Input label="Address" value={newPatient.AddressLine1 || ''} disabled={!!item.candisable}
            onChange={(e) => dispatch('newPatientAddressChange', { value: e.target.value })} />
        )}
        {canShowApproxAge && isNew && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
            <Input label="Days" value={newPatient.ApproxAgeDays ?? ''} disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })} />
            <Input label="Months" value={newPatient.ApproxAgeMonths ?? ''} disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })} />
            <Input label="Years" value={newPatient.Age ?? ''} disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeYearsChange', { value: e.target.value })} />
          </div>
        )}
      </div>
    </div>
  );
};

// "Appointment info" fieldset (ng-disabled="canDisableAppointmentDiv()") --
// every field below inherits that fieldset-level disable, several ALSO carry
// a stricter per-field ng-disabled in the original (combined with OR below).
// Kept native/untouched around this mount, at their exact original
// positions: the Referrer `<autosearch>` widget (server-searched, config-
// driven -- reimplementing risks regression, same precedent as
// AppointmentFormScreen.tsx's Doctor/Referral autosearch rows).
export const AppointmentsFormAppointmentPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup = {}, searchDoctorbydept, disableAppointment, canDisableAppointmentDiv, canShowVisitType,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const fieldsetDisabled = !!canDisableAppointmentDiv;
  const dateDeptDoctorDisabled = fieldsetDisabled || item.AppointmentStatusId === 6 || String(item.AppointmentStatusId) === '6' || !!disableAppointment;
  return (
    <div style={{ ...panelStyle, ...fieldGrid }}>
      <DatePicker label="Date" required disabled={dateDeptDoctorDisabled}
        value={toDateInputValue(item.AppointmentDate)}
        onChange={(v) => dispatch('appointmentDateChange', { value: v })} />

      {searchDoctorbydept === 1 || String(searchDoctorbydept) === '1' ? (
        <Select label="Department" required disabled={dateDeptDoctorDisabled} options={toOptions(lookup.Department)}
          value={item.DepartmentId ?? ''} onChange={(v) => dispatch('departmentChange', { value: v })} />
      ) : (
        // searchDoctorbydept == 0: this duplicate Department select is
        // ng-disabled="true" in the original -- always a read-only display.
        <Select label="Department" disabled options={toOptions(lookup.Department)} value={item.DepartmentId ?? ''} />
      )}

      <Select label="Doctor" required disabled={dateDeptDoctorDisabled} options={toOptions(lookup.Doctor)}
        value={item.DoctorId ?? ''}
        onChange={(v) => {
          const selected = (lookup.Doctor || []).find((o) => String(o.Id) === String(v));
          dispatch('doctorSelect', { value: v, selected });
        }} />

      <Select label="Priority" required disabled={fieldsetDisabled} options={toOptions(lookup.Priority)}
        value={item.PriorityId ?? ''} onChange={(v) => dispatch('priorityChange', { value: v })} />

      <Select label="Appointment Status" disabled={fieldsetDisabled} options={toOptions(lookup.AppointmentStatus)}
        value={item.AppointmentStatusId ?? ''} onChange={(v) => dispatch('appointmentStatusSelect', { value: v })} />

      {/* Always ng-disabled="true" in the original -- read-only display,
          set only by the real slot-click handler (SlotBooking). */}
      <Input label="Start Time" required value={item.StartTime || ''} disabled readOnly />
      <Input label="End Time" required value={item.EndTime || ''} disabled readOnly />

      <Input label="Remarks" placeholder="Remarks" disabled={fieldsetDisabled} value={item.Remarks || ''}
        onChange={(e) => dispatch('remarksChange', { value: e.target.value })} />

      <Checkbox label="Is Video Consultation" checked={!!item.IsVideoConsultation} disabled={fieldsetDisabled}
        onChange={(v) => dispatch('videoConsultToggle', { value: v })} />

      {canShowVisitType && (
        <Select label="Visit Type" required disabled={fieldsetDisabled} options={toOptions(lookup.VisitType)}
          value={item.VisitTypeId ?? ''} onChange={(v) => dispatch('visitTypeChange', { value: v })} />
      )}

      {/* DisableReferral is never assigned anywhere in the controller --
          always falsy/undefined -- so this select is never actually
          disabled in production, matching real, live behavior. */}
      <Select label="Source Type" required disabled={fieldsetDisabled} options={toOptions(lookup.ReferralType)}
        value={item.ReferTypeId ?? ''} onChange={(v) => dispatch('referTypeChange', { value: v })} />

      <Input label="Cancel/Reschedule Comments" placeholder="Cancel/Reschedule Comments" disabled={fieldsetDisabled}
        value={item.CancelorRescheduleComments || ''}
        onChange={(e) => dispatch('cancelRescheduleCommentsChange', { value: e.target.value })} />
    </div>
  );
};

// Doctor name/department/qualification header (real, live text) + the
// actual interactive slot-grid (fed by `NewAppointmentSlot`, itself computed
// by the untouched Angular controller from real API responses). The
// decorative photo <img> pair and the static Booked/Break/Available legend
// have NO live bindings that change based on user interaction (photo relies
// on the `ngf-thumbnail` vendor directive) and are left fully native in the
// .html, immediately above this mount.
export const AppointmentsFormSlotPicker: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, newAppointmentSlot = [], disableSlot } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const forceBooking = item.IsForceBooking === 1 || String(item.IsForceBooking) === '1';
  return (
    <div style={panelStyle}>
      <div className="doctor-details">
        <span className="doctor-info">
          <i className="icofont-doctor" />{item.DoctorName}
        </span>
        &nbsp;&nbsp;
        <span className="doctor-info1">{item.DepartmentName} &nbsp; {currentcontext.Qualification}</span>
      </div>
      {newAppointmentSlot.filter((g) => (g.SlotItems?.length || 0) > 0).map((group, gi) => (
        <div key={group.SlotName || gi} className="col-sm-12 slot-list">
          <p className="slot-name">{group.SlotName}</p>
          <div className="term-opt btn-group" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {(group.SlotItems || []).map((it, ii) => {
              const cls = !it.isSelected && !it.isHoliday && !it.isBreak && !it.isBookedAppt
                ? 'Available' : it.Selected ? 'Selected' : it.isBookedAppt ? 'Bookeditem1' : it.isHoliday ? 'Holidayitem' : it.isBreak ? 'Breakitem' : '';
              const disabled = forceBooking ? !!disableSlot : (!!it.isBookedAppt || !!it.isHoliday || !!it.isBreak || !!disableSlot);
              return (
                <div key={ii} className={`term-opt btn-group cust_btnouter ${cls}`} title={it.AvialSlot}>
                  <button type="button" disabled={disabled} onClick={() => dispatch('slotClick', { item: it })}
                    style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', border: 'none', background: 'none' }}>
                    <strong>{it.AvialSlot}</strong>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {item.SelectedSlot && (
        <div className="col-sm-12 text-center mgt10">
          <span className="text-center">
            <strong style={{ fontSize: 12, color: '#ff0000' }}>Selected Slot is : {item.SelectedSlot}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export const AppointmentsFormFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, noshown, CanShowCancel, CanShowCheckin, CanShowSaveBtn } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const isNoshown = (String(item.AppointmentStatusId) === '2') && (noshown === 1 || String(noshown) === '1');
  return (
    <div className="fooder-bgs">
      <div className="button-list">
        {CanShowCancel && <button type="button" className="cancel-btn" onClick={() => dispatch('cancelClick')}>Cancel</button>}
        {isNoshown && <button type="button" className="noshow-btn" onClick={() => dispatch('noshownClick')}>No Shown</button>}
        {CanShowCheckin && <button type="button" className="checkin-btn" onClick={() => dispatch('checkinClick')}>CheckIn</button>}
        {currentcontext.isreschedule === true && <button type="button" className="reshedule-btn" onClick={() => dispatch('rescheduleClick')}>Re-Schedule</button>}
        {CanShowSaveBtn && <button type="button" className="save-btn" onClick={() => dispatch('saveClick')}>Save</button>}
      </div>
    </div>
  );
};
