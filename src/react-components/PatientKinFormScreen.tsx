import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from './Button';

interface KinItem {
  RelationshipId?: number | null;
  TitleId?: number | null;
  GenderId?: number | null;
  Name?: string;
  ApproxAgeDays?: string | number;
  ApproxAgeMonths?: string | number;
  Age?: string | number;
  DOB?: string;
  LandLine?: string;
  Mobile?: string;
  BloodGroupId?: number | null;
  Comments?: string;
  SameAddress?: boolean;
  FirstName?: string; MiddleName?: string; LastName?: string; MRN?: string;
  Gender?: { Description?: string };
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; }
interface Lookup {
  Relationship?: LookupOption[];
  Title?: LookupOption[];
  Gender?: LookupOption[];
  BloodGroup?: LookupOption[];
}

interface ReactPropsShape {
  item?: KinItem;
  lookup?: Lookup;
  canShowPatientBanner?: boolean;
  canShowApproxAge?: boolean;
  canUpdatePatientInfo?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

// ---------------------------------------------------------------------------
// patientkin-form (app.fullregistrationtab.patientkin, modal, 4 real refs) --
// the real Add/Edit form opened by patientkin-list.js's addNew()/edit() (the
// already-migrated PatientKinListScreen). All API calls (GetPatientKinById,
// AddPatientKin/UpdatePatientKin, GetPatientById for "same address" copy,
// General/Options/getoptions lookups) stay in the untouched Angular controller;
// this component only renders the form and dispatches field changes back.
//
// Real, disclosed specifics preserved exactly:
// - fillGenderInfo(): choosing Title "MR" forces Gender=Male; "MRS"/"MS"/"MISS"
//   forces Gender=Female. Dispatched as 'titleChange' so the controller (which
//   already has this exact mapping) can apply it -- not reimplemented here, to
//   avoid a second, possibly-drifting copy of the TitleId magic numbers.
// - Approx-age (Days/Months/Years) fields only render when canShowApproxAge is
//   true (Title == the lookup's "BABY OF" entry) -- computed in Angular exactly
//   as before, passed down as a plain boolean.
// - Save validation: at least one of LandLine/Mobile is required -- this is a
//   real, hand-written check in the Angular controller (not utl.Validator), so
//   it is left there; the Save button always dispatches and the controller
//   still owns whether it actually submits.
// - "Same Address" checkbox re-fetches the patient's address and copies it
//   onto the kin record -- dispatched as 'sameAddressChange', handled by the
//   controller's existing sameaddress()/getPatientItem() functions.
// - The composite <address> Angular directive (Ward/District/City/State/
//   Country/Pincode with the app's real freetext-mode quirks) is deliberately
//   left as a native sibling tag in the .html template, NOT reproduced here --
//   per the established REUSABLE SUB-WIDGET PATTERN, to avoid re-deriving its
//   field-name mapping outside a dedicated pass.
// - Save button visibility gated on canUpdatePatientInfo (false once the
//   patient is Deceased), matching the original ng-if="canUpdatePatientInfo()".
// ---------------------------------------------------------------------------
export const PatientKinFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, canShowPatientBanner, canShowApproxAge, canUpdatePatientInfo = true } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {canShowPatientBanner && (
        <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.md, color: colors.textMain }}>
          {(item.FirstName || item.MiddleName || item.LastName) && (
            <span><em style={{ color: colors.primary }}>Name:</em> <strong>{[item.FirstName, item.MiddleName, item.LastName].filter(Boolean).join(' ')}</strong></span>
          )}
          {item.MRN != null && <span><em style={{ color: colors.primary }}>MRN Number:</em> <strong>{item.MRN}</strong></span>}
          {item.Age != null && <span><em style={{ color: colors.primary }}>Age / DOB:</em> <strong>{item.Age}</strong></span>}
          {item.Gender?.Description && <span><em style={{ color: colors.primary }}>Gender:</em> <strong>{item.Gender.Description}</strong></span>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Select label="Relationship" required options={toOptions(lookup.Relationship)} value={item.RelationshipId ?? ''} onChange={(v) => field('RelationshipId', v)} />
        <Select label="Title" required options={toOptions(lookup.Title)} value={item.TitleId ?? ''} onChange={(v) => dispatch('titleChange', { value: v })} />
        <Select label="Gender" required options={toOptions(lookup.Gender)} value={item.GenderId ?? ''} onChange={(v) => field('GenderId', v)} />
        <Input label="Name" required value={item.Name ?? ''} onChange={(e) => field('Name', e.target.value)} />

        {canShowApproxAge && (
          <>
            <Input label="Approx. Days" value={item.ApproxAgeDays ?? ''} onChange={(e) => dispatch('approxAgeChange', { part: 'days', value: e.target.value })} />
            <Input label="Approx. Months" value={item.ApproxAgeMonths ?? ''} onChange={(e) => dispatch('approxAgeChange', { part: 'months', value: e.target.value })} />
          </>
        )}

        <Input label="Age (Years)" value={item.Age ?? ''} onChange={(e) => dispatch('approxAgeChange', { part: 'years', value: e.target.value })} />
        <DatePicker label="DOB" value={item.DOB ? String(item.DOB).slice(0, 10) : ''} onChange={(value) => dispatch('dobChange', { value })} />

        <Input label="Landline" value={item.LandLine ?? ''} maxLength={10} onChange={(e) => field('LandLine', e.target.value.replace(/\D/g, ''))} />
        <Input label="Mobile" value={item.Mobile ?? ''} maxLength={10} onChange={(e) => field('Mobile', e.target.value.replace(/\D/g, ''))} />
        <Select label="Blood Group" options={toOptions(lookup.BloodGroup)} value={item.BloodGroupId ?? ''} onChange={(v) => field('BloodGroupId', v)} />
        <Input label="Comments" value={item.Comments ?? ''} onChange={(e) => field('Comments', e.target.value)} />
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: spacing.xs }}>
          <Checkbox label="Same Address" checked={!!item.SameAddress} onChange={(checked) => dispatch('sameAddressChange', { value: checked })} />
        </div>
      </div>

      {/* The real <address> Angular directive renders as a native sibling below
          this mount point in the .html template -- left untouched. */}

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {canUpdatePatientInfo && (
          <Button variant="primary" text="Save" onClick={() => dispatch('saveItem')} />
        )}
      </div>
    </div>
  );
};
