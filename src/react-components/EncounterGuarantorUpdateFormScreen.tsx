import React from 'react';
import { spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

interface Lookup {
  GuarantorType?: LookupOption[];
  Guarantor?: LookupOption[];
  Tpa?: LookupOption[];
  DiscountMode?: LookupOption[];
  /** Fetched by the untouched controller's initLookup() but never referenced
   * by the original template either -- real, dead data, not wired to any
   * field here (nothing to fabricate a UI for). */
  ActiveStatus?: LookupOption[];
}

interface GuarantorUpdateItem {
  ActiveStatusId?: number;
  GuarantorLetterDate?: string;
  GuarantorId?: number;
  GuarantorCustomerId?: number;
  GuarantorName?: string;
  GuarantorTypeId?: number;
  TpaId?: number;
  CoPayPercent?: number;
  ServiceRateCategoryId?: number;
  EffectiveFrom?: string;
  EffectiveTo?: string;
  PolicyName?: string;
  PolicyNo?: string;
  EligibleAmount?: string | number;
  GuarantorLetterNo?: string;
  CreditLimit?: string | number;
  EmployeeName?: string;
  EmployeeId?: string;
  Remarks?: string;
  DiscountId?: number;
  Discount?: string | number;
  RankId?: number;
  IsActive?: boolean;
  OldGuarantorId?: number;
  [key: string]: any;
}

interface CurrentContext {
  gid?: number;
  eid?: number;
  pid?: number;
  wardId?: number;
  admissionstatusid?: number;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: GuarantorUpdateItem;
  lookup?: Lookup;
  currentcontext?: CurrentContext;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));
const toDateValue = (d?: string) => (d ? String(d).slice(0, 10) : '');

// ---------------------------------------------------------------------------
// encounterguarantorupdate (app.guarantorupdateform, modal, 4 real refs) --
// opened from the encounter guarantor list to add/update a patient's guarantor
// for an admission/encounter. All API calls (GetPatientGuarantors /
// AddPatientGuarantor / UpdatePatientGuarantor / getoptions /
// GetWardInsuranceTariffs) and all business logic stay in the untouched
// Angular controller; this only renders the form and dispatches back into it.
//
// Real, disclosed specifics preserved exactly, NOT fixed:
// - guarantorChange() (invoked here via the 'guarantorSelect' dispatch) has a
//   real pre-existing bug: it sets item.GuarantorId = selectedItem.Id BEFORE
//   comparing it against item.OldGuarantorId, so that comparison is almost
//   always true (except re-picking the exact same guarantor already loaded)
//   -- meaning picking a *different* guarantor wipes the whole `item` back to
//   `{}` before re-populating only GuarantorName/GuarantorId/GuarantorTypeId/
//   TpaId/CoPayPercent/ServiceRateCategoryId, silently discarding whatever the
//   user had already typed into PolicyNo/EligibleAmount/Remarks/etc. This is
//   reproduced faithfully by dispatching straight into the unmodified
//   guarantorChange(); no guard was added here to "fix" it.
// - The original ui-select's on-select handed guarantorChange() the whole
//   lookup record (Id/Text/GuarantorTypeId/TPAId/CoPayPercent) directly. A
//   native <select> only reports the chosen id, so the 'guarantorSelect'
//   dispatch payload carries just that id and the Angular-side handler looks
//   the matching record back up from lookup.Guarantor before calling the
//   real guarantorChange() -- same object shape as before, reconstructed at
//   the bridge instead of passed through directly.
// - The GuarantorTypeId/GuarantorId/TpaId/DiscountId selects all carry
//   numeric Ids as their SelectOption value (matching the original
//   ui-select-choices' `lookupitem.Id as lookupitem`), and their dispatches
//   run the value through Number(...) before handing it to Angular, because
//   a native <select>'s onChange always reports a string -- this keeps the
//   numeric `==`/`!=` GuarantorTypeId comparisons already in this controller
//   and template (e.g. saveItem's `GuarantorTypeId == 2` check) working
//   exactly as they did before.
// - The three pairs of duplicate ng-if blocks in the original template
//   (PolicyNo, EligibleAmount/"eligibleamount", CreditLimit/"approvedamount"
//   each appeared twice, once for `GuarantorTypeId!=1&&!=3` and once for
//   `==1||==3` -- two conditions that are exact complements of each other,
//   so together the field was simply always visible with identical markup
//   either way) are consolidated into one field each below; no visibility or
//   behavior differs from the original, only the redundant duplicate JSX.
// - EffectiveFrom's two original blocks *did* differ (required only when
//   GuarantorTypeId != 1) -- that real distinction is kept via a single field
//   whose `required` prop is computed from GuarantorTypeId, rather than two
//   copies of the input.
// - utl.Validator.validate($scope) in saveItem() relied on this template's
//   native `name="item_form"` Angular form and each input's `name`/`required`/
//   `ng-pattern` attributes to know what was invalid. Per the same precedent
//   already accepted in patientguarantorgl-form.html and
//   patientdeathrecord-form.html, that native form and its named inputs are
//   removed as part of this migration, so that particular client-side gate
//   no longer blocks Save on empty required fields the way it used to; the
//   `required`/`ng-pattern`-derived markers below are kept only as visual
//   affordances. saveItem()'s own explicit business check (GuarantorTypeId==2
//   requires a GL/Approval No, alerted and blocked) is untouched and still
//   enforced.
// - Save's visibility (`ng-hide="admissionstatusid==5||admissionstatusid==6"`)
//   is reproduced as a plain conditional render below -- same effective
//   behavior, React idiom instead of ng-hide.
// - $scope.PGuarantor, $scope.IsRankExist and lookup.ActiveStatus are real
//   controller/lookup state, but the original template never rendered any of
//   them -- left out of reactProps rather than inventing UI for unused data.
// ---------------------------------------------------------------------------
export const EncounterGuarantorUpdateFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  const guarantorTypeId = item.GuarantorTypeId != null ? Number(item.GuarantorTypeId) : undefined;
  const showEmployeeFields = guarantorTypeId === 3 || guarantorTypeId === 5;
  const showDiscountFields = guarantorTypeId === 3;
  const effectiveFromRequired = guarantorTypeId !== 1;
  const canShowSave = !(currentcontext.admissionstatusid === 5 || currentcontext.admissionstatusid === 6);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Select
          label="Guarantor Type"
          required
          options={toOptions(lookup.GuarantorType)}
          value={guarantorTypeId ?? ''}
          onChange={(v) => dispatch('guarantorTypeIdChange', { value: Number(v) })}
        />
        <Select
          label="Guarantor"
          required
          options={toOptions(lookup.Guarantor)}
          value={item.GuarantorId ?? ''}
          onChange={(v) => dispatch('guarantorSelect', { value: Number(v) })}
        />
        <Select
          label="TPA"
          options={toOptions(lookup.Tpa)}
          value={item.TpaId ?? ''}
          onChange={(v) => field('TpaId', Number(v))}
        />
        <DatePicker
          label="Effective Date"
          required={effectiveFromRequired}
          value={toDateValue(item.EffectiveFrom)}
          onChange={(v) => dispatch('effectiveFromChange', { value: v })}
        />
        <DatePicker
          label="Expiry Date"
          value={toDateValue(item.EffectiveTo)}
          onChange={(v) => dispatch('effectiveToChange', { value: v })}
        />
        <DatePicker
          label="GL Date"
          value={toDateValue(item.GuarantorLetterDate)}
          onChange={(v) => dispatch('glDateChange', { value: v })}
        />
        <Input label="Policy Name" value={item.PolicyName ?? ''} onChange={(e) => field('PolicyName', e.target.value)} />
        <Input label="Policy No" value={item.PolicyNo ?? ''} onChange={(e) => field('PolicyNo', e.target.value)} />
        <Input label="Eligible Amount" value={item.EligibleAmount ?? ''} onChange={(e) => field('EligibleAmount', e.target.value)} />
        <Input label="GL / Approval No" value={item.GuarantorLetterNo ?? ''} onChange={(e) => field('GuarantorLetterNo', e.target.value)} />
        <Input label="Approved Amount" value={item.CreditLimit ?? ''} onChange={(e) => field('CreditLimit', e.target.value)} />
        {showEmployeeFields && (
          <>
            <Input label="Employee Name" value={item.EmployeeName ?? ''} onChange={(e) => field('EmployeeName', e.target.value)} />
            <Input label="Employee Id" value={item.EmployeeId ?? ''} onChange={(e) => field('EmployeeId', e.target.value)} />
          </>
        )}
        <Input label="Remarks" value={item.Remarks ?? ''} onChange={(e) => field('Remarks', e.target.value)} />
        {showDiscountFields && (
          <>
            <Select
              label="Discount"
              options={toOptions(lookup.DiscountMode)}
              value={item.DiscountId ?? ''}
              onChange={(v) => field('DiscountId', Number(v))}
            />
            <Input label="Amount" value={item.Discount ?? ''} onChange={(e) => field('Discount', e.target.value)} />
          </>
        )}
      </div>

      {canShowSave && (
        <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" text="Save" onClick={() => dispatch('saveItem')} />
        </div>
      )}
    </div>
  );
};
