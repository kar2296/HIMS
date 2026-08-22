import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface PatientItem {
  Id?: number;
  MRN?: string;
  FirstName?: string;
  Age?: string | number | null;
  DOB?: string | null;
  GenderId?: number | null;
  NationalityId?: number | null;
  Mobile?: string;
  TitleId?: number | null;
  ApproxAgeDays?: string | number;
  ApproxAgeMonths?: string | number;
  Title?: { Description?: string };
  Gender?: { Description?: string };
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; }
interface Lookup {
  Title?: LookupOption[];
  Gender?: LookupOption[];
  Nationality?: LookupOption[];
  [key: string]: any;
}

interface ReactPropsShape {
  item?: PatientItem;
  lookup?: Lookup;
  canShowApproxAge?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

// Mirrors the AngularJS `date:'dd/MMM/yyyy'` filter used in the original
// template's patient banner strip -- display-only formatting, no business logic.
const formatDob = (dob?: string | null): string => {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${months[d.getMonth()]}/${d.getFullYear()}`;
};

// ---------------------------------------------------------------------------
// patientdemographicupdate (app.demographicupdate, modal, opened only from
// patientsearch.js's 'update' row-action for an EXISTING patient) -- all API
// calls (GetPatientById, GetPatients, AddPatient/UpdatePatient, General/
// Options/getoptions) and validation (utl.Validator.validate) stay in the
// untouched Angular controller; this component only renders the form fields
// actually present in the original template and dispatches field changes /
// button clicks back into the existing functions.
//
// Real bugs / dead code found in the untouched controller and template,
// preserved exactly and NOT fixed here:
//
// 1. $scope.canShowPatientBanner is set to `false` once and never reassigned
//    anywhere -- AND the patient-banner block in the original .html is NOT
//    gated by it at all (no ng-if); the banner is unconditionally rendered.
//    So the flag is fully dead/inert. This component therefore renders the
//    banner unconditionally (matching the real, always-visible behavior),
//    it does NOT gate on canShowPatientBanner.
//
// 2. $scope.currentcontext.id is checked in several places (fillDefaultValues
//    gate at load, and the "new vs existing patient" branches inside
//    afterSave()/showPatientSuccessAlert()) but is NEVER initialized anywhere
//    -- only $scope.currentcontext.pid is populated, from modalConfig.params.id.
//    Since `undefined == 0` is `false` in JS, every one of those
//    `currentcontext.id == 0` checks evaluates to false on load, so:
//      - fillDefaultValues() unconditionally runs on load regardless of
//        whether an existing patient id was passed in (its effect is masked
//        in practice because getItemCallback later does a full
//        `$scope.item = data` replace of the whole item object), and
//      - the "navigate to app.fullregistrationtab.basic for a brand-new
//        patient" branches in afterSave()/showPatientSuccessAlert() are
//        unreachable from this screen; execution always falls through to
//        $scope.getItem(). Since this screen is only ever opened for an
//        existing patient (see patientsearch.js's 'update' action, which
//        always passes a real row id), that fallthrough happens to be the
//        practically useful path, but the condition as written is a
//        genuine id/pid mix-up, not an intentional design.
//
// 3. On load, $scope.getPatientById() (GetPatients action) is invoked TWICE:
//    once synchronously from lookupCallback() right after calling getItem(),
//    and again from inside getItemCallback() once GetPatientById's response
//    arrives. This is a real duplicate network call, not fixed here.
//
// 4. $scope.getPatientPatnerPidCallback (sets item.PatientAssociate) is
//    defined but never invoked from anywhere in this file, and
//    item.PatientAssociate has no corresponding field in the template --
//    fully orphaned dead code.
//
// 5. $scope.save, $scope.clear, $scope.saveAndInactive, $scope.addReferral,
//    $scope.recordDeathInfo, and $scope.fillGenderInfo are all real, working
//    functions, but none of them is invoked from anywhere in this file or
//    the original template (only saveAndApprove(), cancelCallback(),
//    patientprofiledetails(), calculateDOB(), and calculateAge() actually
//    are). They are left completely unwired here too, matching the
//    original -- not reproduced as UI actions.
//
// 6. $scope.currentcontext.file is never assigned anywhere in this
//    controller, and the template has no file-input / ngf-select element of
//    any kind. So the entire Upload.upload(...) branch inside saveItem()
//    (built for a photo/file upload, likely copy-pasted from a sibling
//    registration screen) is unreachable dead code on THIS screen --
//    saveItem() always takes the plain utl.Http.doAction() branch in
//    practice. No file-upload UI is built here, since none exists in the
//    original.
//
// 7. When canShowApproxAge is true, the original template renders BOTH the
//    approx-age "Years" input (inside .approxagediv) and the separate
//    standalone "Age" input below it, bound to the exact same item.Age model
//    and the exact same ng-change="calculateDOB(item.Age,'years')" handler --
//    i.e. two live-editable duplicate fields for the same value shown at
//    once. Reproduced faithfully (both render when canShowApproxAge is true).
//
// 8. $scope.item.tabindex, $scope.currentcontext.attachmentcount,
//    $scope.currentcontext.isTempPatient, $scope.item.IsMRNTypeDisable, and
//    $scope.isPatientDeactivated are all initialized but never read anywhere
//    else in the controller or referenced anywhere in the template --
//    inert leftover state, not surfaced in this component.
// ---------------------------------------------------------------------------
export const PatientDemographicUpdateScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canShowApproxAge } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center', marginBottom: spacing.md, color: colors.textMain }}>
        <span>
          <strong>{item.Title?.Description ? `${item.Title.Description} ` : ''}{item.FirstName}</strong>
        </span>
        <span>|</span>
        <span>{item.MRN}</span>
        <span>|</span>
        <span>{item.Gender?.Description}</span>
        <span>|</span>
        {/* The real <agedisplay> AngularJS component (itself already backed by
            the React AgeDisplay component internally) stays native -- it
            renders as a sibling in the .html template, just before this
            component's mount, rather than interleaved into this row (see
            the .html template's comment for why). */}
        <span>{formatDob(item.DOB)}</span>
        <span style={{ cursor: 'pointer', color: colors.primary }} onClick={() => dispatch('patientprofiledetails')}>
          <i className="icon-info-sign" aria-hidden="true" />
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Input
          label="First Name"
          required
          value={item.FirstName ?? ''}
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => field('FirstName', e.target.value.toUpperCase())}
        />

        {canShowApproxAge && (
          <>
            <Input
              label="Approx. Age (Days)"
              value={item.ApproxAgeDays ?? ''}
              onChange={(e) => dispatch('approxAgeChange', { part: 'days', value: e.target.value })}
            />
            <Input
              label="Approx. Age (Months)"
              value={item.ApproxAgeMonths ?? ''}
              onChange={(e) => dispatch('approxAgeChange', { part: 'months', value: e.target.value })}
            />
            <Input
              label="Approx. Age (Years)"
              value={item.Age ?? ''}
              onChange={(e) => dispatch('approxAgeChange', { part: 'years', value: e.target.value })}
            />
          </>
        )}

        <Input
          label="Age"
          value={item.Age ?? ''}
          onChange={(e) => dispatch('approxAgeChange', { part: 'years', value: e.target.value })}
        />
        <DatePicker
          label="DOB"
          required
          value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
          onChange={(value) => dispatch('dobChange', { value })}
        />

        <Select
          label="Gender"
          required
          options={toOptions(lookup.Gender)}
          value={item.GenderId ?? ''}
          onChange={(v) => field('GenderId', v)}
        />
        <Select
          label="Nationality"
          required
          options={toOptions(lookup.Nationality)}
          value={item.NationalityId ?? ''}
          onChange={(v) => field('NationalityId', v)}
        />

        <Input
          label="Mobile"
          value={item.Mobile ?? ''}
          onChange={(e) => field('Mobile', e.target.value.replace(/\D/g, ''))}
        />
      </div>

      {/* The real composite <address> Angular directive (Pincode/Area/City/
          State/Country with the app's real freetext-mode quirks) stays a
          native sibling in the .html template, per the established REUSABLE
          SUB-WIDGET PATTERN -- not reproduced here. */}

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        <Button variant="primary" text="Update" onClick={() => dispatch('saveAndApprove')} />
        <Button variant="danger" text="Cancel" onClick={() => dispatch('cancelCallback')} />
      </div>
    </div>
  );
};
