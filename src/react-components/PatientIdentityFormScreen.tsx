import React from 'react';
import { spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { Button } from './Button';

interface IdentityItem {
  PatientIdentityTypeId?: number | null;
  IDNumber?: string;
  Comments?: string;
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; }
interface Lookup {
  PatientIdentityType?: LookupOption[];
}

interface ReactPropsShape {
  item?: IdentityItem;
  lookup?: Lookup;
  canUpdatePatientInfo?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

// ---------------------------------------------------------------------------
// patientidentity-form (`app.fullregistrationtab.patientidentity`, a full
// modalState -- not a $uibModal -- opened via `$state.go(...,
// { patientidentityid }))`). Confirmed genuinely reachable: NOT called from
// the already-migrated PatientIdentityListScreen (that screen edits inline,
// per the GRID/LIST-EDITOR pattern), but from three real, separately
// reachable screens outside the Registration module --
// public/views/inpatient/admissions/admissionlog-list.js,
// public/views/emr/patientemr/patientorders/aoe.js, and
// public/views/emr/patientemr/patientorders/ticksheet.js -- each with a
// live `$state.go('app.fullregistrationtab.patientidentity', {...})` call.
// (A fourth caller, fullregistration/auditlog-list.js, is itself confirmed
// dead code per the reachability sweep and does not count as real traffic.)
//
// All API calls (GetPatientIdentityById, AddPatientIdentity/
// UpdatePatientIdentity, General/Options/getoptions for the PatientIdentityType
// lookup) stay in the untouched Angular controller; this component only
// renders the form and dispatches field changes back.
//
// Real, disclosed behavior preserved exactly, NOT changed:
// - Save button visibility gated on canUpdatePatientInfo() (false once the
//   patient's PatientObject session status is "Deceased"), matching the
//   original ng-if="canUpdatePatientInfo()" -- same real base-controller
//   mixin used by patientkin-form/patientidentity-list/familylinking.
// - `backToList()` in the real controller unconditionally does
//   `$state.go('app.fullregistrationtab.patientidentity')`'s sibling call --
//   actually `$state.go('app.fullregistrationtab.patientids')` -- regardless
//   of which of the three unrelated screens above opened this form. That
//   means Cancel (and Save-then-close) always lands the user in the Full
//   Registration "Patient IDs" tab, never back in AOE/Ticksheet/Admission Log
//   where they started. This is pre-existing real navigation behavior,
//   reproduced faithfully via the unchanged `backToList()`/`$state.go` call,
//   not "fixed" to return to the real caller.
// ---------------------------------------------------------------------------
export const PatientIdentityFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canUpdatePatientInfo = true } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Select
          label="Type"
          options={toOptions(lookup.PatientIdentityType)}
          value={item.PatientIdentityTypeId ?? ''}
          onChange={(v) => field('PatientIdentityTypeId', v)}
        />
        <Input label="ID Number" value={item.IDNumber ?? ''} onChange={(e) => field('IDNumber', e.target.value)} />
        <Input label="Comments" value={item.Comments ?? ''} onChange={(e) => field('Comments', e.target.value)} />
      </div>

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {canUpdatePatientInfo && (
          <Button variant="primary" text="Save" onClick={() => dispatch('saveItem')} />
        )}
        <Button variant="danger" text="Cancel" onClick={() => dispatch('backToList')} />
      </div>
    </div>
  );
};
