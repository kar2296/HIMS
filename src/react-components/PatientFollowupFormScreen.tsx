import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface FollowupItem {
  IsActive?: boolean;
  FacilityId?: number;
  FollowupStatusId?: number | null;
  FollowupTypeId?: number | null;
  FirstFollowupDate?: string;
  FirstComments?: string;
  FirstAdmitedDate?: string;
  SecondFollowupDate?: string;
  SecondComments?: string;
  SecondAdmitedDate?: string;
  ThirdFollowupDate?: string;
  ThirdComments?: string;
  ThirdAdmitedDate?: string;
  PatientId?: number;
  DoctorId?: number;
  DoctorName?: string;
  RecomendedProcedure?: string;
  DepartmentId?: number;
  UnitId?: number;
  UserTeam?: string;
  EncounterId?: number;
  [key: string]: any;
}

interface LookupItem { Id: number; Text: string; }
interface Lookup {
  FollowupType?: LookupItem[];
  FollowupStatus?: LookupItem[];
  Facility?: LookupItem[];
}

interface ReactPropsShape {
  item?: FollowupItem;
  lookup?: Lookup;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupItem[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

// ---------------------------------------------------------------------------
// patientfollowup-form (app.patientfollowuptab.patientfollowup,
// PatientFollowUpFormController, modal, opened by both the already-migrated
// PendingFollowupListScreen and this migration's sibling
// FollowupListScreen, plus an unrelated third caller,
// medicalcertificate/referralfeedback/referrallist.js -- untouched, out of
// scope here). All API calls (GetPatientFollowupById,
// Addpatientfollowup/Updatepatientfollowup, General/Options/getoptions
// lookups) and all business logic stay in the untouched Angular controller;
// this component only renders the form fields and dispatches field changes/
// button clicks back to it.
//
// The modal-header (`<div class="modal-header">...`) and the
// `<patientbanner patientid="item.PatientId">` directive are left as NATIVE
// untouched sibling tags in the .html, per the established REUSABLE
// SUB-WIDGET PATTERN (patientbanner is a live component, not a static
// summary). The read-only Doctor/RecomendedProcedure/UserTeam summary line
// (plain scope interpolations, not a live widget) IS reproduced below.
//
// Date fields (FirstFollowupDate/FirstAdmitedDate/SecondFollowupDate/
// SecondAdmitedDate/ThirdFollowupDate/ThirdAdmitedDate) are real `ng-date-
// object` + `uib-datepicker-popup` fields bound to Date objects on `item`;
// the controller bridge converts them to/from ISO yyyy-mm-dd strings for
// this component's DatePicker, same technique as the AdmissionDate
// conversion already used in PendingFollowupListScreen/FollowupListScreen.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - "SAVE & APPROVE" BUTTON IS COMPLETELY DEAD DUE TO A CASE-TYPO: the real
//   button markup is `ng-click="saveAndApprove()"`, but the controller only
//   ever defines `$scope.saveandApprove` (lowercase "and") -- there is no
//   `$scope.saveAndApprove` anywhere in this controller. AngularJS therefore
//   throws (evaluating an undefined expression as a function call) every
//   time this button is clicked, and the click silently does nothing visible
//   to the user (error only surfaces in the browser console) -- the entire
//   "save & approve" flow (which sets FollowupStatusId to 2 or 3 depending
//   on item.IsActive) is unreachable in production today. Reproduced exactly
//   below: the button dispatches a real 'saveAndApprove' action, but the
//   controller bridge's handleReactAction deliberately has NO case for it
//   (matching the real typo'd, silently-broken wiring) -- NOT wired to the
//   real (correctly-spelled) $scope.saveandApprove function, since doing so
//   would silently fix a live bug rather than reproduce it.
// - item.IsActive (used by the real, but unreachable, saveandApprove() to
//   pick FollowupStatusId 2 vs 3) is set once at controller init (`true`)
//   and is NEVER exposed on any control anywhere in the real
//   patientfollowup-form.html -- there is no checkbox/toggle for it. Dead
//   field, not rendered here (nothing in the UI could ever change it away
//   from its default `true` in production).
// - NO FIELD ON THIS FORM CARRIES a `required` attribute (or any other
//   client-side validation constraint) in the real .html -- `saveItem()`
//   calls `utl.Validator.validate($scope)`, but since no field/ui-select in
//   this template opts into validation, that call is effectively a no-op
//   pass-through today. No `required` styling is added below beyond what
//   the real template already has (none), to avoid inventing validation UX
//   that does not exist in production.
// - THE DOCTOR/PROCEDURE/UNIT SUMMARY LINE MISUSES ng-translate: the real
//   markup is `<span translate="Doctor Name :"></span>` (and similarly
//   "Recomended Procedure :", "Unit/Location :") -- passing literal English
//   text as the translate KEY rather than an i18n lookup key (e.g.
//   `registration.patientfollowup.doctorname.lbl`). If that literal string
//   is not itself a registered translation id, AngularJS's `translate`
//   directive renders it as-is (so it happens to look right in English,
//   coincidentally) but it will never actually translate in any other
//   locale. Reproduced below as plain hardcoded English text (same visible
//   behavior), not as real i18n lookups, to avoid fabricating translation
//   keys that do not exist in the real template.
// - clear() unconditionally does `$scope.item = {}` -- wipes IsActive,
//   FacilityId, PatientId, EncounterId, DoctorId/DoctorName, everything --
//   with no re-fetch of the original context. Reproduced unchanged via a
//   real 'clear' dispatch to the untouched $scope.clear().
// - EDIT-CONTEXT INITIALIZATION HAS NO NULL GUARD: when opened with
//   modalConfig.params present but params.encounter absent/undefined (true
//   for openModal(0)'s addNew() path in both sibling list screens, and for
//   the plain `openModal(Id)` used by the unrelated referrallist.js
//   caller), the controller does
//   `$scope.Encounter = modalConfig.params.encounter;` (undefined) then
//   immediately, unguarded, `$scope.item.PatientId = $scope.Encounter.
//   PatientId` -- reading a property off `undefined` throws immediately on
//   modal open. This form is therefore only safely opened today via the
//   "edit" paths that pass a real `encounter` object (see the matching
//   disclosure on FollowupListScreen.tsx re: whether that object's shape
//   actually matches what this controller assumes). Not fixed/guarded here.
// - getItemCallback() does `$scope.item.UserTeam = $scope.item.Team.
//   Description` unguarded -- if a fetched-by-id item has no `Team`
//   relation populated, this throws. Not fixed here; not independently
//   reproducible/verifiable from the frontend alone.
// - A block of commented-out getList()/getListCallback() code (an
//   abandoned "list of encounters for this patient" grid, `vm.gridConfig`
//   is never even defined in this controller) is left dead in the real
//   file. Not reproduced.
// ---------------------------------------------------------------------------
export const PatientFollowupFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {/* Real markup: <b><span translate="Doctor Name :">...<span class="number">{{item.DoctorName}}</span> etc.
          See disclosure above re: translate="..." literal-text-as-key misuse. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md, color: colors.textMain }}>
        <span><strong>Doctor Name :</strong> <span style={{ color: '#d500f9', fontWeight: 700 }}>{item.DoctorName}</span></span>
        <span><strong>Recomended Procedure :</strong> <span style={{ color: '#d500f9', fontWeight: 700 }}>{item.RecomendedProcedure}</span></span>
        <span><strong>Unit/Location :</strong> <span style={{ color: '#d500f9', fontWeight: 700 }}>{item.UserTeam}</span></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.lg }}>
        {/* Left panel */}
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 4, padding: spacing.md }}>
          <Select
            label="Followup Type"
            options={toOptions(lookup.FollowupType)}
            value={item.FollowupTypeId ?? ''}
            onChange={(v) => field('FollowupTypeId', Number(v))}
          />
          <div style={{ height: spacing.sm }} />
          <Select
            label="Status"
            options={toOptions(lookup.FollowupStatus)}
            value={item.FollowupStatusId ?? ''}
            onChange={(v) => field('FollowupStatusId', Number(v))}
          />
          <div style={{ marginTop: spacing.md, color: '#241ab7', fontSize: '14px', fontWeight: 600 }}>First Followup</div>
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Date"
            value={item.FirstFollowupDate ? String(item.FirstFollowupDate).slice(0, 10) : ''}
            onChange={(v) => field('FirstFollowupDate', v)}
          />
          <div style={{ height: spacing.sm }} />
          <Input
            label="Comments"
            value={item.FirstComments ?? ''}
            onChange={(e) => field('FirstComments', e.target.value)}
          />
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Expected Admission Date"
            value={item.FirstAdmitedDate ? String(item.FirstAdmitedDate).slice(0, 10) : ''}
            onChange={(v) => field('FirstAdmitedDate', v)}
          />
        </div>

        {/* Right panel */}
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 4, padding: spacing.md }}>
          <div style={{ color: '#241ab7', fontSize: '14px', fontWeight: 600 }}>Second Followup</div>
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Date"
            value={item.SecondFollowupDate ? String(item.SecondFollowupDate).slice(0, 10) : ''}
            onChange={(v) => field('SecondFollowupDate', v)}
          />
          <div style={{ height: spacing.sm }} />
          <Input
            label="Comments"
            value={item.SecondComments ?? ''}
            onChange={(e) => field('SecondComments', e.target.value)}
          />
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Expected Admission Date"
            value={item.SecondAdmitedDate ? String(item.SecondAdmitedDate).slice(0, 10) : ''}
            onChange={(v) => field('SecondAdmitedDate', v)}
          />

          <div style={{ marginTop: spacing.md, color: '#241ab7', fontSize: '14px', fontWeight: 600 }}>Third Followup</div>
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Date"
            value={item.ThirdFollowupDate ? String(item.ThirdFollowupDate).slice(0, 10) : ''}
            onChange={(v) => field('ThirdFollowupDate', v)}
          />
          <div style={{ height: spacing.sm }} />
          <Input
            label="Comments"
            value={item.ThirdComments ?? ''}
            onChange={(e) => field('ThirdComments', e.target.value)}
          />
          <div style={{ height: spacing.sm }} />
          <DatePicker
            label="Expected Admission Date"
            value={item.ThirdAdmitedDate ? String(item.ThirdAdmitedDate).slice(0, 10) : ''}
            onChange={(v) => field('ThirdAdmitedDate', v)}
          />
        </div>
      </div>

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Button variant="primary" text="Save" onClick={() => dispatch('save')} />
        {/* Real bug: dispatches 'saveAndApprove', which the controller bridge deliberately
            does NOT handle -- reproducing the real ng-click="saveAndApprove()" typo that
            never reaches the real (correctly-named) $scope.saveandApprove. See disclosure above. */}
        <Button variant="secondary" text="Save & Approve" onClick={() => dispatch('saveAndApprove')} />
        <Button variant="warning" text="Clear" onClick={() => dispatch('clear')} />
        <Button variant="outline" text="Cancel" onClick={() => dispatch('backToList')} />
      </div>
    </div>
  );
};
