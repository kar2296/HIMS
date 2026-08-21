import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from './utils/api';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { colors, spacing, typography, radii, controlHeight } from '../components/ui/tokens';

// The reused Country/State/District/City controls emit generic lowercase field
// names (countryid/country/stateid/state/districtid/district/cityid/city/area/
// areaid/pincodeid/pincode) that mirror the Angular addressCtrl's own cvm.* bindings
// -- NOT this screen's real item field names. The real <address> usage in
// fullregistration.html binds: country/countryid/state/stateid/district/districtid/
// city/cityid -> item's matching PascalCase fields, area -> item.Area, AND
// areaid -> item.WardId (a genuine field-name mismatch, confirmed in the original
// template), while pincode itself is a hardcoded literal ('freetext') so it never
// binds to any item field (item.Pincode is bound via the separate "pintext"
// attribute instead, handled directly by the free-text Pincode input below, not by
// this cascade). This map reproduces those exact bindings so selecting Country/
// State/District/City actually updates the record that gets saved.
const FULLREG_ADDRESS_FIELD_MAP: Record<string, string> = {
  countryid: 'CountryId', country: 'Country',
  stateid: 'StateId', state: 'State',
  districtid: 'DistrictId', district: 'District',
  cityid: 'CityId', city: 'City',
  area: 'Area', areaid: 'WardId',
  pincodeid: 'PinCodeId',
  // pincode intentionally omitted -- not a real item binding on this screen.
};
function mapFullRegAddressUpdate(u: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  Object.keys(u).forEach((k) => {
    const mapped = FULLREG_ADDRESS_FIELD_MAP[k];
    if (mapped) fields[mapped] = u[k];
  });
  return fields;
}

interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
}

interface Lookups {
  Title?: LookupItem[];
  Gender?: LookupItem[];
  GuardianType?: LookupItem[];
  MaritalStatus?: LookupItem[];
  Religion?: LookupItem[];
  Nationality?: LookupItem[];
  VisaType?: LookupItem[];
  VipType?: LookupItem[];
  PatientType?: LookupItem[];
  BloodGroup?: LookupItem[];
  ReferralType?: LookupItem[];
  Referral?: LookupItem[];
  Remark?: LookupItem[];
  MRNType?: LookupItem[];
}

interface ServerItem {
  [key: string]: any;
}

interface CurrentContext {
  id?: number;
  attachmentcount?: number;
  canDisableApprove?: boolean;
  isTempPatient?: boolean;
  showfocus?: boolean;
  triedSubmit?: boolean;
}

interface Flags {
  CanShowDeceased?: boolean;
  isPatientDeactivated?: boolean;
  EnableOPD?: boolean;
  Visitprint?: boolean;
  Vitals?: boolean;
  canShowPatientBanner?: boolean;
  adrsmandatory?: number;
}

interface ReactPropsShape {
  item?: ServerItem;
  lookup?: Lookups;
  currentcontext?: CurrentContext;
  flags?: Flags;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Shared label style for rows that aren't rendered through Input/Select's own
// built-in `label` prop -- i.e. the address-hierarchy sub-controls
// (CountryControl/StateControl/DistrictControl/CityControl), which render their
// own control with no label prop of their own, and the Approx. Age group of
// three plain inputs sharing one label. Matches the design-system's own
// internal Input/Select label styling so everything lines up visually.
const groupLabelStyle: React.CSSProperties = {
  ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily, display: 'block',
};

// Grid container used for both the "Patient Info" and "Address Info" field
// groups -- same layout as before (auto-fit responsive columns), now driven by
// design-system spacing tokens instead of a hardcoded pixel gap.
const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg,
};

// Small reusable lookup-driven select -- avoids repeating the same
// option-mapping boilerplate for the ~15 plain lookup selects on this screen.
// Internally now renders the global design-system `Select` (restyled visual
// layer only); external shape/behavior is unchanged -- callers still pass an
// `Id`/`Text` LookupItem[] and get back a parsed number-or-null via onChange,
// exactly like the original raw <select> version did.
const Sel: React.FC<{
  id?: string;
  value: any;
  options?: LookupItem[];
  onChange: (v: number | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
}> = ({ id, value, options, onChange, disabled, error, label }) => (
  <Select
    id={id}
    label={label}
    value={value ?? ''}
    options={(options || []).map((o) => ({ value: o.Id, label: o.Text }))}
    onChange={(v) => onChange(v === '' || v === undefined || v === null ? null : parseInt(String(v), 10))}
    disabled={disabled}
    error={error}
    placeholder="Select"
  />
);

// Mirrors $scope.canShowApproxAge(vTitleId) exactly, including the real "babyof" OR
// "baby" Title-code check (fullregistration.js checks both, same as quickregistration).
function canShowApproxAge(titleId: number | null | undefined, titleLookup: LookupItem[] | undefined): boolean {
  if (!titleId || !titleLookup || !titleLookup.length) return false;
  const t = titleLookup.find((x) => x.Id === titleId);
  if (!t || !t.Code) return false;
  const code = t.Code.toLowerCase();
  return code === 'babyof' || code === 'baby';
}

// ---------------------------------------------------------------------------
// FullRegistrationPatientOptions -- the small header panel next to <patientbanner>
// (Attachments badge + Admission button). Real gate: ng-if="item.PatientStatusId==2"
// (no HasPrivilege involved here, so this one genuinely renders).
// ---------------------------------------------------------------------------
export const FullRegistrationPatientOptions: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  if (item.PatientStatusId !== 2) return null;

  return (
    <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', alignItems: 'center', padding: `${spacing.sm} 0` }}>
      <Button
        type="button"
        variant="icon"
        title="Attachments"
        badgeCount={currentcontext.attachmentcount ?? 0}
        onClick={() => dispatch('openattachments')}
      >
        <i className="fas fa-paperclip fa-xs" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="icon"
        title="Admission"
        onClick={() => dispatch('admission')}
      >
        <i className="fa fa-adn" aria-hidden="true" />
      </Button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FullRegistrationScreen -- the main "Patient Info" + "Address Info" form.
//
// Scope notes (disclosed in the completion report):
// - Occupation (<autosearch>) is left as a real, untouched Angular directive
//   positioned right after this component in the DOM (see fullregistration.html) --
//   it is a genuinely complex, still-Angular-native, shared typeahead widget with real
//   working search logic; porting it is out of scope for this pass, matching the
//   established precedent of leaving <patientbanner>/<patientsearch> untouched.
// - Country/State/District/City reuse the already-migrated CountryControl/
//   StateControl/DistrictControl/CityControl React components. The real <address>
//   component here uses pincode="'freetext'" (a hardcoded literal, confirmed by
//   reading vendor/components/address.html) -- meaning Area and Pincode are real plain
//   free-text inputs (not the Area/Pincode dropdown controls used on other already-
//   migrated screens), which is exactly how they are rendered below.
// - The freetext Pincode input is real, required, and constrained to exactly 6
//   characters (MINLENGTH/MAXLENGTH=6) in the original template -- this is folded
//   into $scope.isFullRegFormValid() in fullregistration.js.
// - HasPrivilege(...) is called throughout the original template (Deactivate,
//   FR-Deceased, Attachment, FR-OPDBill, ORIGINAL_PRINT, FR-Findpatient) but is a
//   function that does not exist anywhere in this codebase (confirmed by exhaustive
//   grep across public/) -- every element gated by it is therefore
//   ALWAYS hidden in the real, currently-running app. This component preserves that
//   real (if surprising) behavior faithfully rather than inventing privilege logic:
//   the "Find Patient" button (gated FR-Findpatient) is omitted below.
// ---------------------------------------------------------------------------
export const FullRegistrationScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const setField = (field: string, value: any) => dispatch('itemFieldChange', { field, value });

  const titleSelectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    // Mirrors $scope.setFocusTitle()/$scope.callTitleFocus(): auto-focus the Title
    // field ~1s after load, but only for a brand-new registration (id<=0). The real
    // Angular mechanism queried a ui-select DOM node that no longer exists once this
    // section is React, so the equivalent behavior is reimplemented here directly
    // (same real observable effect: Title gets focus on a fresh registration).
    if ((currentcontext.id ?? 0) <= 0) {
      const t = setTimeout(() => titleSelectRef.current?.focus(), 1000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google Places Autocomplete -- same real window.google.maps.places API/pattern
  // used on newregistration/patientregistration-form/quickregistration. On resolve,
  // mirrors $scope.clearpreviousaddress() + the exact field-mapping quirk (route->city
  // local var, locality->area local var) + the real $scope.getPincodeDataCallback,
  // which here sets item.Ward (NOT item.Area -- a genuine pre-existing inconsistency
  // versus clearpreviousaddress, which resets item.Area; the visible freetext Area
  // field is bound to item.Area and is therefore NOT auto-filled by this lookup,
  // matching real current behavior exactly).
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleAddressText, setGoogleAddressText] = useState('');
  const googleInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!googleEnabled || !googleInputRef.current) return;
    const g = (window as any).google;
    if (!g || !g.maps || !g.maps.places) {
      console.error('Google Maps Places API not loaded (window.google.maps.places missing)');
      return;
    }
    const autocomplete = new g.maps.places.Autocomplete(googleInputRef.current, {});
    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;
      const name = place.name || '';
      let address1 = '', address2 = '', city = '', area = '', state = '', country = '', pincode = '';
      for (const comp of place.address_components) {
        const addressType = comp.types && comp.types[0];
        if (addressType === 'premise') address1 = comp.long_name;
        else if (addressType === 'sublocality_level_1') address2 = comp.long_name;
        else if (addressType === 'route') city = comp.long_name;
        else if (addressType === 'locality') area = comp.long_name;
        else if (addressType === 'administrative_area_level_1') state = comp.long_name;
        else if (addressType === 'country') country = comp.long_name;
        else if (addressType === 'postal_code') pincode = comp.long_name;
      }
      const addressLine1 = `${name} ${address1} ${address2} ${city}`;
      const addressLine2 = `${area} ${state} ${country} ${pincode}`;
      // Mirrors clearpreviousaddress()'s real reset set (includes WardId/DistrictId,
      // a larger set than the other already-migrated registration screens).
      const fields: Record<string, any> = {
        AddressLine1: addressLine1, AddressLine2: addressLine2,
        PinCodeId: -1, Area: '', WardId: -1, CityId: -1, StateId: -1, DistrictId: -1, CountryId: -1,
      };

      if (pincode) {
        try {
          const res = await apiFetch('generalmaster/PincodeMaster/GetPincodeMasters', {
            Params: [{ Key: 5, Value: pincode }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          });
          if (res && res.Data && res.Data.length > 0) {
            const d = res.Data[0];
            // Mirrors getPincodeDataCallback exactly: sets Ward (not Area), City/State/
            // Country/District -- preserved verbatim, including the Ward/Area mismatch.
            fields.PinCodeId = d.Id;
            fields.Ward = d.Area;
            fields.CityId = d.CityId;
            fields.StateId = d.StateId;
            fields.CountryId = d.CountryId;
            fields.DistrictId = d.DistrictId;
          }
        } catch (err) {
          console.error('Pincode lookup failed', err);
        }
      }
      dispatch('itemFieldsMerge', { fields });
    });

    return () => {
      if (g.maps.event) g.maps.event.clearInstanceListeners(autocomplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleEnabled]);

  const toggleGoogleAddress = (checked: boolean) => {
    setGoogleEnabled(checked);
    if (!checked) {
      setGoogleAddressText('');
      dispatch('itemFieldsMerge', {
        fields: { AddressLine1: '', AddressLine2: '', PinCodeId: -1, Area: '', WardId: -1, CityId: -1, StateId: -1, DistrictId: -1, CountryId: -1 },
      });
    } else {
      setTimeout(() => googleInputRef.current?.focus(), 100);
    }
  };

  const showApproxAge = canShowApproxAge(item.TitleId, lookup.Title);

  // Client-side mirror of $scope.isFullRegFormValid() -- purely a display computation
  // so invalid fields can be highlighted the way the real <form>'s .ng-invalid classing
  // used to; the authoritative gate remains $scope.isFullRegFormValid() in
  // fullregistration.js's saveItem().
  const errors = useMemo(() => {
    const e: Record<string, boolean> = {};
    if (!item.TitleId) e.TitleId = true;
    if (!item.FirstName) e.FirstName = true;
    if (!item.LastName) e.LastName = true;
    if (!item.GenderId) e.GenderId = true;
    if (!item.Mobile || String(item.Mobile).length !== 10) e.Mobile = true;
    if (!item.DOB) e.DOB = true;
    if (!item.MaritalStatusId) e.MaritalStatusId = true;
    if (!item.NationalityId) e.NationalityId = true;
    if (!item.Pincode || String(item.Pincode).length !== 6) e.Pincode = true;
    if (item.LandLine && String(item.LandLine).length !== 10) e.LandLine = true;
    if (item.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.Email)) e.Email = true;
    if (item.Income && !/^\d+$/.test(String(item.Income))) e.Income = true;
    return e;
  }, [item.TitleId, item.FirstName, item.LastName, item.GenderId, item.Mobile, item.DOB,
      item.MaritalStatusId, item.NationalityId, item.Pincode, item.LandLine, item.Email, item.Income]);

  const showErrors = !!currentcontext.triedSubmit;
  // Replaces the old fieldStyleFor(key) (which swapped a whole inline style
  // object) with a short validation message handed to the design-system
  // Input/Select's own `error` prop -- same underlying `errors`/`showErrors`
  // computation as before, only the presentation of "this field is invalid"
  // changed (red border + message from the shared component, instead of a
  // hand-rolled invalidInputStyle object).
  const errorMessageFor = (key: keyof typeof errors, message: string): string | undefined =>
    (showErrors && errors[key]) ? message : undefined;

  const showFindPatient = item.IsCouple || item.IsRecipient;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      {showErrors && Object.keys(errors).length > 0 && (
        <Alert tone="danger">
          Please complete all required fields (Title, First Name, Last Name, Gender, a 10-digit Mobile number,
          DOB, Marital Status, Nationality, and a 6-digit Pincode) before saving.
        </Alert>
      )}

      <Card title="Patient Info">
        <div style={gridStyle}>

          <Sel label="MRN Type" value={item.MRNTypeId} options={lookup.MRNType} disabled={!!item.IsMRNTypeDisable}
            onChange={(v) => setField('MRNTypeId', v)} />

          {/* Title is kept as a native <select> (restyled with design-system tokens
              rather than swapped for the Select component) because $scope.setFocusTitle's
              real auto-focus-on-load behavior above depends on a live DOM node ref
              (titleSelectRef.current?.focus()) -- the Select component doesn't forward a
              ref, so wrapping it here would silently break that focus behavior. The
              native browser focus outline is left in place (not overridden) for the same
              reason -- this field is the one genuinely auto-focused on a fresh
              registration, so its focus indicator has to stay visible. */}
          <div>
            <label htmlFor="title" style={groupLabelStyle}>Title <span style={{ color: colors.danger, marginLeft: 2 }}>*</span></label>
            <select
              id="title"
              ref={titleSelectRef}
              value={item.TitleId ?? ''}
              onChange={(e) => dispatch('titleChange', { value: e.target.value ? parseInt(e.target.value, 10) : null })}
              style={{
                width: '100%', height: controlHeight, fontSize: '13px', padding: '0 30px 0 12px',
                fontFamily: typography.fontFamily, color: colors.textMain, backgroundColor: colors.surface,
                border: `1px solid ${showErrors && errors.TitleId ? colors.danger : colors.border}`,
                borderRadius: radii.sm, boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              <option value="">Select</option>
              {(lookup.Title || []).map((t) => <option key={t.Id} value={t.Id}>{t.Text}</option>)}
            </select>
          </div>

          <Input label="First Name" required error={errorMessageFor('FirstName', 'Required')} value={item.FirstName || ''}
            onChange={(e) => setField('FirstName', e.target.value.toUpperCase())} />

          <Input label="Middle Name" value={item.MiddleName || ''}
            onChange={(e) => setField('MiddleName', e.target.value.toUpperCase())} />

          <Input label="Last Name" required error={errorMessageFor('LastName', 'Required')} value={item.LastName || ''}
            onChange={(e) => setField('LastName', e.target.value.toUpperCase())} />

          <Input label="Alias Name" value={item.AliasName || ''}
            onChange={(e) => setField('AliasName', e.target.value.toUpperCase())} />

          <Sel label="Gender" value={item.GenderId} options={lookup.Gender} error={errorMessageFor('GenderId', 'Required')}
            onChange={(v) => setField('GenderId', v)} />

          <Input id="contactnr" label="Mobile" required error={errorMessageFor('Mobile', 'Enter a 10-digit mobile number')}
            maxLength={10} value={item.Mobile || ''}
            onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))} />

          <Sel label="Spouse Type" value={item.GuardianTypeId} options={lookup.GuardianType}
            onChange={(v) => setField('GuardianTypeId', v)} />

          <Input label="Spouse Name" value={item.GuardianName || ''}
            onChange={(e) => setField('GuardianName', e.target.value.toUpperCase())} />

          {showApproxAge && (
            <div>
              <div style={groupLabelStyle}>Approx. Age</div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Input placeholder="Days" value={item.ApproxAgeDays ?? ''}
                  onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })} />
                <Input placeholder="Months" value={item.ApproxAgeMonths ?? ''}
                  onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })} />
                <Input placeholder="Years" value={item.Age ?? ''}
                  onChange={(e) => dispatch('ageYearsChange', { value: e.target.value })} />
              </div>
            </div>
          )}

          {showApproxAge && (
            <TimePicker label="Birth Time" value={item.BabyBirthTime || ''}
              onChange={(value) => setField('BabyBirthTime', value)} />
          )}

          <DatePicker label="DOB" required error={errorMessageFor('DOB', 'Required')}
            value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
            onChange={(value) => dispatch('dobChange', { value })} />

          <Input label="Age" maxLength={3} value={item.Age ?? ''}
            onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })} />

          <Sel label="Marital Status" value={item.MaritalStatusId} options={lookup.MaritalStatus} error={errorMessageFor('MaritalStatusId', 'Required')}
            onChange={(v) => setField('MaritalStatusId', v)} />

          <Sel label="Religion" value={item.ReligionId} options={lookup.Religion} onChange={(v) => setField('ReligionId', v)} />

          <Sel label="Nationality" value={item.NationalityId} options={lookup.Nationality} error={errorMessageFor('NationalityId', 'Required')}
            onChange={(v) => setField('NationalityId', v)} />

          <Input label="Nationality ID" value={item.NationalityIdentifier || ''}
            onChange={(e) => setField('NationalityIdentifier', e.target.value)} />

          <Input label="Passport Number" value={item.PasspostNumber || ''}
            onChange={(e) => setField('PasspostNumber', e.target.value)} />

          <Sel label="Visa Type" value={item.VisaTypeId} options={lookup.VisaType} onChange={(v) => setField('VisaTypeId', v)} />

          <Input label="Visa Number" value={item.VisaNumber || ''}
            onChange={(e) => setField('VisaNumber', e.target.value)} />

          <DatePicker label="Visa Expiry" value={item.VisaExpiry ? String(item.VisaExpiry).slice(0, 10) : ''}
            onChange={(value) => setField('VisaExpiry', value)} />

          {/* Occupation (<autosearch>) intentionally omitted here -- rendered as a real,
              untouched Angular directive immediately after this component (see
              fullregistration.html). */}

          {/* Remark: the real template renders this exact select TWICE (a genuine
              copy-paste duplication, confirmed by reading fullregistration.html), both
              bound to item.RemarkId with an ng-change/ng-disabled that reference
              remarkChange()/canDisableRemarksDiv() -- functions confirmed (by exhaustive
              grep across public/) to be undefined anywhere in this screen's scope. Real
              current behavior: a plain, always-enabled select with no side effect on
              change. Both instances are preserved below, faithfully matching the
              duplicate appearance. */}
          <Sel label="Remarks" value={item.RemarkId} options={lookup.Remark} onChange={(v) => setField('RemarkId', v)} />

          <Sel label="Patient Type" value={item.PatientTypeId} options={lookup.PatientType} onChange={(v) => setField('PatientTypeId', v)} />

          <Sel label="Blood Group" value={item.BloodGroupId} options={lookup.BloodGroup} onChange={(v) => setField('BloodGroupId', v)} />

          <Sel label="Refer Type" value={item.ReferTypeId} options={lookup.ReferralType}
            onChange={(v) => dispatch('referTypeChange', { value: v })} />

          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Sel label="Referrer" value={item.ReferrerId} options={lookup.Referral}
                onChange={(v) => dispatch('referrerChange', { value: v })} />
            </div>
            <Button type="button" variant="icon" title="Add Referral" onClick={() => dispatch('addReferral')}>
              <i className="fa fa-plus" aria-hidden="true" />
            </Button>
          </div>

          <Sel label="Remarks" value={item.RemarkId} options={lookup.Remark} onChange={(v) => setField('RemarkId', v)} />

          <Input id="landline" label="Land Line" error={errorMessageFor('LandLine', 'Enter a 10-digit landline number')}
            maxLength={10} value={item.LandLine || ''}
            onChange={(e) => setField('LandLine', e.target.value.replace(/[^\d]/g, ''))} />

          <Input type="email" label="Email" error={errorMessageFor('Email', 'Enter a valid email address')} value={item.Email || ''}
            onChange={(e) => setField('Email', e.target.value)} />

          <Input label="Income" error={errorMessageFor('Income', 'Numbers only')} value={item.Income || ''}
            onChange={(e) => setField('Income', e.target.value)} />

          <Checkbox label="VIP" checked={!!item.IsVip} onChange={(checked) => setField('IsVip', checked)} />

          <Sel label="VIP Type" value={item.VipTypeId} options={lookup.VipType} disabled={!item.IsVip}
            onChange={(v) => setField('VipTypeId', v)} />

          <Checkbox label="Insurance" checked={!!item.IsInsurance} onChange={(checked) => setField('IsInsurance', checked)} />

          <Checkbox label="Is IVF Register" checked={!!item.IsIvfRegistration} onChange={(checked) => setField('IsIvfRegistration', checked)} />

          {showFindPatient && (
            <div>
              {/* Find Patient button omitted: gated by HasPrivilege('FullRegistration','FR-Findpatient'),
                  which is always hidden today (see file-level note above). */}
              <Input label="Patient" value={item.PatientAssociate || ''} disabled />
            </div>
          )}
        </div>
      </Card>

      <Card title="Address Info">
        <div style={gridStyle}>
          <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                id="googleaddopt"
                ref={googleInputRef}
                label="Search Address (Google)"
                disabled={!googleEnabled}
                value={googleAddressText}
                onChange={(e) => setGoogleAddressText(e.target.value)}
                placeholder="Start typing an address..."
              />
            </div>
            <div style={{ height: controlHeight, display: 'flex', alignItems: 'center' }}>
              <Checkbox label="Use" checked={googleEnabled} onChange={toggleGoogleAddress} />
            </div>
          </div>

          <Input label="Address Line 1" value={item.AddressLine1 || ''}
            onChange={(e) => setField('AddressLine1', e.target.value.toUpperCase())} />

          <Input label="Address Line 2" value={item.AddressLine2 || ''}
            onChange={(e) => setField('AddressLine2', e.target.value.toUpperCase())} />

          <div>
            <label style={groupLabelStyle}>Country</label>
            <CountryControl countryid={item.CountryId} onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapFullRegAddressUpdate(u) })} />
          </div>

          <div>
            <label style={groupLabelStyle}>{item.CountryId === 1 ? 'State' : item.CountryId === 2 ? 'Province' : 'State'}</label>
            <StateControl stateid={item.StateId} countryid={item.CountryId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapFullRegAddressUpdate(u) })} />
          </div>

          <div>
            <label style={groupLabelStyle}>District</label>
            <DistrictControl districtid={item.DistrictId} countryid={item.CountryId} stateid={item.StateId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapFullRegAddressUpdate(u) })} />
          </div>

          <div>
            <label style={groupLabelStyle}>{item.CountryId === 2 ? 'Municipality' : 'City/Town'}</label>
            <CityControl cityid={item.CityId} countryid={item.CountryId} stateid={item.StateId} districtid={item.DistrictId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapFullRegAddressUpdate(u) })} />
          </div>

          {/* Real <address> usage here has pincode="'freetext'" (a hardcoded literal
              string, confirmed in fullregistration.html) -- per vendor/components/
              address.html's freetext branch, Area and Pincode are real plain free-text
              inputs, not the Area/Pincode dropdown controls used elsewhere. */}
          <Input label={item.CountryId === 2 ? 'Ward No' : 'Area'} value={item.Area || ''} onChange={(e) => setField('Area', e.target.value)} />

          <Input label="Pincode" required error={errorMessageFor('Pincode', 'Enter a 6-digit pincode')}
            maxLength={6} value={item.Pincode || ''}
            onChange={(e) => setField('Pincode', e.target.value)} />
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FullRegistrationFooter -- left-hand footer button group.
//
// Real current visibility, traced from fullregistration.html: SaveInactive,
// Deceased, the footer Attachments button, OPDBill, and the entire Print dropdown
// (Registration Print/Label/Barcode, Patient Label, OP Bill) are all gated by
// HasPrivilege(...), which is always false today (see note above) -- so none of
// those five are rendered here, matching real behavior. Only NewVisit, Vitals, and
// VisitPrint render unconditionally today (gated solely by real, defined booleans/
// PatientStatusId, no HasPrivilege involved). Save/SaveAndApprove keep their real
// alt+t/alt+a keyboard shortcuts by staying native Angular markup in
// fullregistration.html (an Angular `hotkey` directive attribute would not work on
// a React-rendered button) -- so they are not part of this component.
// ---------------------------------------------------------------------------
export const FullRegistrationFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, flags = {}, currentcontext = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const disabledByStatus = item.PatientStatusId === 3;

  return (
    <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
      {item.PatientStatusId === 2 && !currentcontext.isTempPatient && (
        <Button type="button" variant="secondary" disabled={disabledByStatus}
          onClick={() => dispatch('visitcreate')}>New Visit</Button>
      )}
      {flags.Vitals && !currentcontext.isTempPatient && (
        <Button type="button" variant="secondary" disabled={disabledByStatus}
          onClick={() => dispatch('vitals')}>Vitals</Button>
      )}
      {flags.Visitprint && !currentcontext.isTempPatient && (
        <Button type="button" variant="secondary" disabled={disabledByStatus}
          onClick={() => dispatch('visitprint')}>Visit Print</Button>
      )}
    </div>
  );
};
