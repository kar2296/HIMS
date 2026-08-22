import React from 'react';
import { colors, spacing, radii, typography } from '../components/ui/tokens';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface AssignToOption {
  Id: number;
  Text: string;
}

interface LookupOption {
  Id: number;
  Text: string;
}

interface Lookup {
  Group?: LookupOption[];
  DurationPeriod?: LookupOption[];
  [key: string]: any;
}

interface TrackerItem {
  StartDate?: string;
  AssignTo?: number;
  FacilityId?: number;
  DurationPeriodId?: number;
  DurationPeriod?: string;
  isTracker?: number;
  IsTracker?: number;
  PatientTrackerId?: number;
  PatientId?: number;
  AppointmentId?: number;
  EncounterId?: number;
  DoctorId?: number;
  AssignedGroupId?: number | null;
  AssignedGroupName?: string | null;
  AssignedUserId?: number;
  AssignedUserName?: string;
  DepartmentId?: number;
  TrackerNotes?: string;
  FollowupAppointmentOn?: string | null;
  Duration?: string;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: TrackerItem;
  lookup?: Lookup;
  assignToOptions?: AssignToOption[];
  from?: number;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// patienttracker (app.patienttracker, patientTrackerController) -- a modal,
// opened 32 real ways across the app (checkout flows, followup tracking,
// doctor-dashboard handoffs, EMR topbar, banners, etc.), to assign/checkout a
// patient's current visit: pick an AssignTo mode (User / Group / Consultation
// / Complete Visit), optionally pick a doctor (native autosearch, left
// untouched below) or a group, add notes, and either a specific follow-up
// date or a duration+period pair. Saves via
// appointment/patienttracker/AssignPatient|CheckoutPatient|
// CheckoutConsultationPatient, chosen by AssignTo (all in the real,
// unchanged saveItem()). Lookups (DurationPeriod) via
// General/Options/getoptions; the current patient's doctor/department info
// via registration/patient/GetPatients (getPatientById()).
//
// SCOPE NOTES:
// - The `<autosearch>` doctor/user picker (vm.doctorcontrolconfig, live
//   server search against SystemSettings/User/GetMinUsers) is a real,
//   server-searched typeahead directive -- left 100% NATIVE in
//   patienttracker.html, unchanged, per the same rule already applied to
//   FamilyLinkScreen/DeathRecordFormScreen's own <autosearch>/native
//   sub-widgets. Only its surrounding `ng-show="canShowUser()"` wrapper
//   stays in the native template; this component renders nothing for it.
// - The modal header (title toggle between "Check-Out"
//   (registration.patienttracker.pagetitle.lbl) and the from==1 variant,
//   plus the Close/X icon calling cancelCallback() directly) stays NATIVE in
//   the .html, exactly like deceased-form.html's own native header -- it
//   needs no bridging since `from`/`cancelCallback` are untouched, live
//   $scope values already evaluated by Angular on every digest.
// - The old inline <style> block's `.btn-feedback-selected` /
//   `.btn-feedback-notselected` label classes targeted the native
//   <radiogroupcontrol> markup this component replaces; since that markup
//   no longer exists on this screen, those rules are not carried forward
//   (dead CSS) -- this component's Assign-To control uses the shared design
//   tokens instead, consistent with every other migrated screen.
//
// REAL, DISCLOSED PRE-EXISTING BUGS/DEAD CODE -- PRESERVED AS-IS, NOT FIXED:
//
// - CASING MISMATCH ON THE TRACKER FLAG: `$scope.item` is initialized with
//   `isTracker: 0` (lowercase i), but when opened for an existing tracker
//   (`modalConfig.params.tracker.FollowupAppointmentOn` present) the
//   controller instead sets `$scope.item.IsTracker = 1` (capital I) -- a
//   SEPARATE property on the same object. The original `isTracker` field is
//   never updated to 1 and stays 0 forever; a differently-cased `IsTracker`
//   field is added alongside it. Whichever casing the save endpoint actually
//   reads, the other is dead weight. Not fixed -- both keys are passed
//   through `reactProps.item` exactly as the controller produces them.
// - DEAD `$scope.currentcontext` INITIALIZATION: the controller assigns
//   `$scope.currentcontext = { id: -1, DoctorName: '' }`, then two
//   statements later completely overwrites it with
//   `$scope.currentcontext = { ismodal: ... }` before either field is ever
//   read -- the first assignment is pure dead code. Not fixed (not
//   reproduced/exposed here; `currentcontext` isn't part of this screen's
//   visible UI at all -- the one place that used to show
//   `{{currentcontext.DoctorName}}` is already commented out in the real
//   template).
// - UNGUARDED `modalConfig.params` ACCESS: the main setup block is guarded
//   with `if (modalConfig && modalConfig.params) { ... }`, but immediately
//   after it, `console.log(modalConfig.params)` and the
//   `vm.AssignToOptions` from=='doctordashboard'/'followuptracker' trimming
//   both read `modalConfig.params.*` with NO such guard. If this modal were
//   ever opened without a `params` object, these lines throw. Every one of
//   the 32 real `utl.Modal.open('app.patienttracker', ...)` call sites
//   happens to always pass `params`, so this is latent, not currently
//   triggered -- not fixed.
// - `vm.AssignToOptions.splice(2, 1)` / `.splice(1, 2)` FILTER BY ARRAY
//   POSITION, NOT BY Id -- if the 3-entry options literal (User/Consultation/
//   CompleteVisit; Group is commented out of it) is ever reordered, these
//   splices silently start trimming the wrong entries. Reproduced unchanged
//   (the controller still computes the final, already-trimmed
//   `vm.AssignToOptions` array; this component only renders whatever list it
//   is handed).
// - `canShowGroup()` / THE GROUP PICKER IS EFFECTIVELY UNREACHABLE IN
//   PRODUCTION TODAY, even though its markup (unlike Room/Facility/
//   ReviewNotes below) is NOT commented out in the real template: the
//   `{ Id: 2, Text: ... }` entry is commented out of the `vm.AssignToOptions`
//   array literal, so no radio button can ever set `AssignTo === 2`, and a
//   grep of all 32 real call sites shows none ever pass `assignto: 2`
//   either. The only way to reach this branch is a future caller passing
//   `params.assignto = 2` explicitly. Reproduced faithfully as real,
//   dead-in-practice UI wired to the real (if unreachable)
//   `$scope.onGroupChange` -- not removed, not fixed.
// - `$scope.canShowFacility()` / `$scope.canShowRoom()` /
//   `$scope.canShowReviewNotes()` / `$scope.onRoomChange()` are referenced
//   ONLY inside HTML blocks (Facility ui-select, Room ui-select,
//   ReviewNotes checkbox) that are entirely commented out in the real
//   template -- 100% dead. Not reproduced (nothing real to wire).
// - `$scope.backToList()` IS DEAD: the only element that would call it (a
//   commented-out Cancel button, `<!-- <button ... ng-click="backToList()"
//   ... -->`) is commented out in the real template. The actual, live Close
//   (X) icon calls `cancelCallback()` DIRECTLY instead, bypassing
//   backToList's `currentcontext.ismodal` check entirely. Not reproduced (no
//   Cancel button rendered here -- there is none in production either); the
//   native header's Close icon (kept as-is) is the only real dismiss action.
// - `openAppointmentForm()` (local function) and `$scope.doctor_dashboard()`
//   are both fully dead: `openAppointmentForm` has zero call sites anywhere
//   in this file, and the only place `doctor_dashboard()` was ever called is
//   inside a commented-out block within `saveItemCallback`. Neither is
//   exposed here.
// - Commented-out `<commentscontrol comments="item.TrackerComments">` --
//   `item.TrackerComments` is referenced nowhere else in the controller.
//   Dead, not reproduced.
// - HEADER TITLE TIMING BUG (native, not touched by this component): the
//   header only swaps to the "FollowUp Tracker" title when `$scope.from`
//   is already 1 at render time, which only happens at init if
//   `modalConfig.params.tracker.FollowupAppointmentOn` is already set.
//   `saveItem()` also sets `$scope.from = 1` when
//   `modalConfig.params.from === 'followuptracker'`, but by then the form is
//   already being submitted/closed -- too late to change what the user saw.
//   So opening this modal from followuptrackers.js's "add a new followup"
//   flow (`from: 'followuptracker'`, no existing tracker yet) keeps the
//   generic "Check-Out" title for the whole time the form is visible. Real,
//   pre-existing, left in the untouched native header markup.
// - `translate="FollowUp Tracker"` (the from==1 header variant) is a LITERAL
//   STRING used directly as the translate directive's key, not a real
//   `registration.patienttracker.*` key (confirmed absent from both en.json
//   and ar.json) -- unlike the primary title
//   (`registration.patienttracker.pagetitle.lbl`, a real key resolving to
//   "Check-Out"), this variant will never be translated (e.g. to Arabic) and
//   only reads correctly in English by coincidence of $translate's
//   missing-key fallback. Native markup, not touched here, disclosed as-is.
// - The native `<autosearch>` tag itself carries two more pre-existing
//   defects, left untouched since this widget stays native:
//   `candisable="SaveCompleted"` and `tabindex="tabindexmap.patienttabindex"`
//   both reference `$scope` properties (`SaveCompleted`, `tabindexmap`) that
//   are never defined anywhere in this controller -- always `undefined` --
//   and `isrequired="true"` is duplicated as a literal attribute on the same
//   tag.
// - `uib-datepicker-popup="{{datePickerOptions.dateFormat}}"` /
//   `placeholder="{{datePickerOptions.placeholder}}"` (the real Follow-up
//   date field) reference `$scope.datePickerOptions`, which this controller
//   never defines -- both were always empty in production, so the native
//   picker fell back to its own default format with no placeholder. This is
//   migrated to the shared `<DatePicker>` (a native `input[type=date]`,
//   always ISO `yyyy-mm-dd`) -- a genuine display-format difference from
//   "whatever the uib default renders", but since the original binding
//   already resolved to nothing real, there was no working format left to
//   faithfully preserve. Disclosed rather than silently invented.
// ---------------------------------------------------------------------------

const toOptions = (items?: LookupOption[]) => (items || []).map((o) => ({ value: o.Id, label: o.Text }));

export const PatientTrackerScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, assignToOptions = [], from = 0 } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  const assignTo = Number(item.AssignTo);
  // Same conditions as the real canShowGroup()/item.AssignTo==3 checks in the
  // untouched controller/template -- computed here rather than re-derived
  // through a bridged function, since both are pure comparisons against the
  // same item.AssignTo value already present in reactProps.
  const showGroup = assignTo === 2;
  const showFollowupDate = assignTo === 3;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {/* Real condition: ng-show="from == 0" in the original template --
          hidden once from===1 (see header-timing-bug disclosure above). */}
      {from === 0 && (
        <div style={{ marginBottom: spacing.md }}>
          <label style={{ ...typography.label, color: colors.textMain, display: 'block', marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
            Assign To
          </label>
          <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
            {assignToOptions.map((opt) => {
              const selected = assignTo === Number(opt.Id);
              return (
                <button
                  key={opt.Id}
                  type="button"
                  onClick={() => dispatch('assignToChange', { value: opt.Id })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: radii.sm,
                    border: `1px solid ${selected ? colors.primary : colors.border}`,
                    backgroundColor: selected ? colors.primaryLight : colors.surface,
                    color: selected ? colors.primary : colors.textMain,
                    fontSize: '13px',
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {opt.Text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Real condition: ng-show="canShowGroup()" -- markup present in the
          real template but effectively unreachable in production today, see
          disclosure above. Reproduced faithfully, not removed. */}
      {showGroup && (
        <div style={{ marginBottom: spacing.md, maxWidth: 360 }}>
          <Select
            label="Group"
            options={toOptions(lookup.Group)}
            value={item.AssignedGroupId ?? ''}
            onChange={(v) => dispatch('groupChange', { value: Number(v) })}
          />
        </div>
      )}

      {/* Real condition: ng-show="canShowUser()" -- the actual <autosearch>
          doctor/user picker renders as a NATIVE sibling in
          patienttracker.html here (live server-searched typeahead, not
          reimplemented in React). Nothing rendered in this slot. */}

      <div style={{ marginBottom: spacing.md }}>
        <Textarea
          label="Notes"
          rows={3}
          value={item.TrackerNotes ?? ''}
          onChange={(e) => field('TrackerNotes', e.target.value)}
        />
      </div>

      {showFollowupDate ? (
        // Real condition: ng-if="item.AssignTo==3"
        <div style={{ marginBottom: spacing.md, maxWidth: 320 }}>
          <DatePicker
            label="Followup Appointment On"
            value={item.FollowupAppointmentOn ? String(item.FollowupAppointmentOn).slice(0, 10) : ''}
            onChange={(v) => dispatch('followupDateChange', { value: v })}
          />
        </div>
      ) : (
        // Real condition: ng-hide="item.AssignTo==3" -- same real label
        // (registration.patienttracker.followupappointments.lbl) is reused
        // by the original template for this Duration+Period pair too.
        <div style={{ marginBottom: spacing.md }}>
          <label style={{ ...typography.label, color: colors.textMain, display: 'block', marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
            Followup Appointment On
          </label>
          <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <Input
                value={item.Duration ?? ''}
                onChange={(e) => field('Duration', e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <Select
                options={toOptions(lookup.DurationPeriod)}
                value={item.DurationPeriodId ?? ''}
                onChange={(v) => dispatch('durationPeriodChange', { value: Number(v) })}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" text="Save" onClick={() => dispatch('saveItem')} />
      </div>
    </div>
  );
};
