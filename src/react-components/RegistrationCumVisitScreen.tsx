import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from './utils/api';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';
import { Button } from './Button';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { colors, spacing, typography, breakpoints } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
  ReferralTypeId?: number;
}

interface Lookups {
  Title?: LookupItem[];
  Gender?: LookupItem[];
  VisitType?: LookupItem[];
  Department?: LookupItem[];
  Referral?: LookupItem[];
  GuarantorType?: LookupItem[];
  Guarantor?: LookupItem[];
  ReferralType?: LookupItem[];
  GuardianType?: LookupItem[];
}

interface ServerItem {
  [key: string]: any;
}

interface CurrentContext {
  id?: number;
  triedSubmit?: boolean;
  canDisableApprove?: boolean;
}

interface Flags {
  EnableOPD?: boolean;
  Vitals?: boolean;
  EnableSave?: boolean;
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

// Design-system-token label style, used only for the field groups that keep a
// plain external <label> -- the address sub-controls (which have no built-in
// label prop of their own) and the multi-input "Approx. Age" group. Every
// field that now renders through Input/Select/DatePicker uses that
// component's own built-in `label`/`required` prop instead (see below).
const legacyLabelStyle: React.CSSProperties = {
  ...typography.label, display: 'block', color: colors.textMain, marginBottom: spacing.xs,
};
const fieldStyle: React.CSSProperties = { marginBottom: spacing.lg };

// Lookup-driven <select> option mapper -- avoids repeating the same
// option-mapping boilerplate for the plain lookup selects on this screen.
// Purely a presentational shape conversion (LookupItem[] -> {value,label}[]
// for the design-system Select); no data source/logic change.
function toOptions(options?: LookupItem[]): { value: number; label: string }[] {
  return (options || []).map((o) => ({ value: o.Id, label: o.Text }));
}

// Mirrors $scope.canShowApproxAge(vTitleId) exactly -- registrationcumvisit.js checks
// ONLY the "babyof" Title code (confirmed by reading the function; genuinely narrower
// than fullregistration/quickregistration, which also accept "baby").
function canShowApproxAge(titleId: number | null | undefined, titleLookup: LookupItem[] | undefined): boolean {
  if (!titleId || !titleLookup || !titleLookup.length) return false;
  const t = titleLookup.find((x) => x.Id === titleId);
  if (!t || !t.Code) return false;
  return t.Code.toLowerCase() === 'babyof';
}

// The reused Country/State/District/City/Area/Pincode controls emit generic lowercase
// field names (countryid/country/stateid/state/districtid/district/cityid/city/area/
// areaid/pincodeid/pincode) mirroring the Angular addressCtrl's own cvm.* bindings --
// NOT this screen's real item field names. The real <address> usage in
// registrationcumvisit.html only binds: country/countryid, state/stateid, city/cityid,
// area, pincode/pincodeid -> item's matching fields. It does NOT bind district/
// districtid or areaid at all (confirmed in the original template) -- so those two
// stay genuinely disconnected from item, exactly as in the real, currently-running
// app (see the District-handling note below). This map reproduces only the real
// bindings.
const ADDRESS_FIELD_MAP: Record<string, string> = {
  countryid: 'CountryId', country: 'Country',
  stateid: 'StateId', state: 'State',
  cityid: 'CityId', city: 'City',
  area: 'Area',
  pincodeid: 'PinCodeId', pincode: 'Pincode',
  // districtid/district/areaid intentionally NOT mapped -- see District note below.
};
function mapAddressUpdate(u: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  Object.keys(u).forEach((k) => {
    const mapped = ADDRESS_FIELD_MAP[k];
    if (mapped) fields[mapped] = u[k];
  });
  return fields;
}

// ---------------------------------------------------------------------------
// RegistrationCumVisitScreen -- the "Registration" + "OP Visit" form.
//
// Scope / fidelity notes (disclosed in the completion report):
// - <patientsearch> and the Doctor <autosearch> stay real, untouched native Angular
//   markup in registrationcumvisit.html (same REUSABLE-SUB-WIDGET precedent as other
//   screens) -- they are not rendered by this component. Doctor's real
//   isrequired="true" still participates in this screen's validation gate
//   ($scope.isRegCumVisitFormValid() in registrationcumvisit.js checks DoctorId).
// - Comments (<commentscontrol>) is reimplemented directly as a plain textarea --
//   confirmed via commentscontrol.html/.js it is just a bare
//   `<textarea ng-model="cvm.comments">` wrapper with no real logic worth preserving
//   natively.
// - Country/State/City/Area/Pincode reuse the already-migrated dropdown React
//   components. The real <address> usage here has pincode="item.Pincode" (a genuine
//   two-way binding, NOT the literal 'freetext' string used on fullregistration) --
//   so, per vendor/components/address.html's non-freetext branch, ALL SIX address
//   controls are the dropdown components, not free-text inputs.
// - DISTRICT IS A REAL, DISCLOSED, PRE-EXISTING DEAD-END (not a new bug introduced by
//   this migration): registrationcumvisit.html's <address> tag never passes a
//   district/districtid attribute at all. In the real Angular app, address.html's
//   internal <districtcontrol district="cvm.district" districtid="cvm.districtid">
//   still renders and is fully selectable, but cvm.districtid is a LOCAL, isolated
//   variable inside addressCtrl (Angular's `=` binding with nothing supplied on the
//   parent tag) -- it is used internally by address.html to drive
//   <citycontrol districtid="cvm.districtid">, but the chosen district is NEVER
//   written back to item.DistrictId, so it is silently dropped on Save. This is
//   reproduced exactly below: District is a real, working dropdown backed by local
//   component state (not dispatched to item at all) that feeds City the same way the
//   real cvm.districtid does, matching today's actual (if surprising) behavior.
//
// Visual-layer retrofit note: this pass swaps raw <input>/<select>/<button> markup
// for the global design-system components (src/components/ui) and Button
// (./Button) -- purely presentational. No prop, dispatch action name/payload
// shape, or validation computation below changed as part of that swap. The
// design-system Select has no ref-forwarding, so the Title field's real
// "focus 1s after mount when this is a brand-new record" behavior is now driven
// by document.getElementById('title') instead of a React ref -- same element
// (id="title" is passed straight through to Select), same condition, same 1000ms
// delay, same cleanup; not a behavior change.
// ---------------------------------------------------------------------------
export const RegistrationCumVisitScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const setField = (field: string, value: any) => dispatch('itemFieldChange', { field, value });

  useEffect(() => {
    if ((currentcontext.id ?? 0) <= 0) {
      const t = setTimeout(() => (document.getElementById('title') as HTMLSelectElement | null)?.focus(), 1000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local-only District selection -- see the District note above. Never dispatched to
  // item; only used to drive the City control's districtid prop, mirroring the real
  // cvm.districtid's local (never-propagated) role in address.html.
  const [localDistrictId, setLocalDistrictId] = useState<number | null>(null);
  // Local-only Area numeric id -- the real <address> tag never binds areaid to item
  // either (only the "area" text is bound), so item has no AreaId field to read the
  // current selection back from. Tracked locally purely so the dropdown highlights
  // the chosen row; the resulting Area TEXT is still dispatched into item.Area via
  // mapAddressUpdate below, matching the real binding exactly.
  const [localAreaId, setLocalAreaId] = useState<number | null>(null);

  // Google Places Autocomplete -- same real window.google.maps.places API/pattern used
  // on the other already-migrated registration screens; bypasses the original Angular
  // chkgoogleaddopt/enablegoogleaddopt()/gm-places-autocomplete machinery entirely
  // (that machinery becomes real, disclosed dead code in registrationcumvisit.js once
  // this input moves to React). On resolve, mirrors $scope.clearpreviousaddress()'s
  // exact reset set and $scope.getPincodeDataCallback's exact field set (PinCodeId/
  // Area/CityId/StateId/CountryId only -- this screen's getPincodeDataCallback does
  // NOT set DistrictId, matching the District note above).
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
      const fields: Record<string, any> = {
        AddressLine1: addressLine1, AddressLine2: addressLine2,
        PinCodeId: -1, Area: '', CityId: -1, StateId: -1, CountryId: -1,
      };

      if (pincode) {
        try {
          const res = await apiFetch('generalmaster/PincodeMaster/GetPincodeMasters', {
            Params: [{ Key: 5, Value: pincode }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          });
          if (res && res.Data && res.Data.length > 0) {
            const d = res.Data[0];
            fields.PinCodeId = d.Id;
            fields.Area = d.Area;
            fields.CityId = d.CityId;
            fields.StateId = d.StateId;
            fields.CountryId = d.CountryId;
          }
        } catch (err) {
          console.error('Pincode lookup failed', err);
        }
      }
      dispatch('itemFieldsMerge', { fields });
      setGoogleAddressText(`${name} ${address1}`.trim());
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
        fields: { AddressLine1: '', AddressLine2: '', PinCodeId: -1, Area: '', CityId: -1, StateId: -1, CountryId: -1 },
      });
    } else {
      setTimeout(() => googleInputRef.current?.focus(), 100);
    }
  };

  // Unified address-cascade handler for all six controls. districtid/areaid are kept
  // in local-only state (see notes above); every other key in the cascade (which can
  // include city/area/pincode resets even when the change originated on District --
  // City/Area/Pincode ARE real item bindings, so those resets still need to reach
  // item exactly as they do in the real, currently-running Angular app) is mapped and
  // merged into item via mapAddressUpdate.
  const handleAddressUpdate = (u: Record<string, any>) => {
    if (Object.prototype.hasOwnProperty.call(u, 'districtid')) setLocalDistrictId(u.districtid ?? null);
    if (Object.prototype.hasOwnProperty.call(u, 'areaid')) setLocalAreaId(u.areaid ?? null);
    const fields = mapAddressUpdate(u);
    if (Object.keys(fields).length > 0) dispatch('itemFieldsMerge', { fields });
  };

  const showApproxAge = canShowApproxAge(item.TitleId, lookup.Title);

  // Client-side mirror of $scope.isRegCumVisitFormValid() (registrationcumvisit.js) --
  // purely a display computation. Note DoctorId is part of the real gate too (Doctor's
  // native <autosearch isrequired="true">) but has no visual field here to flag since
  // that widget stays native.
  const errors = useMemo(() => {
    const e: Record<string, boolean> = {};
    if (!item.TitleId) e.TitleId = true;
    if (!item.FirstName) e.FirstName = true;
    if (!item.DOB) e.DOB = true;
    if (!item.GenderId) e.GenderId = true;
    if (!item.VisitTypeId) e.VisitTypeId = true;
    if (item.Mobile && String(item.Mobile).length !== 10) e.Mobile = true;
    if (item.LandLine && String(item.LandLine).length !== 10) e.LandLine = true;
    return e;
  }, [item.TitleId, item.FirstName, item.DOB, item.GenderId, item.VisitTypeId, item.Mobile, item.LandLine]);

  const showErrors = !!currentcontext.triedSubmit;
  // Same gate as the original fieldStyleFor -- only now it decides whether to pass
  // an `error` string into the design-system field instead of swapping inline styles.
  const fieldErrorFor = (key: keyof typeof errors, message: string): string | undefined =>
    (showErrors && errors[key]) ? message : undefined;

  const referralOptions = lookup.Referral || [];

  return (
    <div style={{ maxWidth: breakpoints.desktop, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}` }}>
      {showErrors && (Object.keys(errors).length > 0) && (
        <Alert tone="danger">
          Please complete all required fields (Title, Patient Name, DOB, Gender, Visit Type, Doctor,
          and a 10-digit Mobile/LandLine if entered) before saving.
        </Alert>
      )}

      <Card title="Registration" style={{ marginTop: spacing.lg }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>

          <div style={fieldStyle}>
            <Select id="title" label="Title" required options={toOptions(lookup.Title)} placeholder="Select"
              value={item.TitleId ?? ''} error={fieldErrorFor('TitleId', 'Required')}
              onChange={(v) => dispatch('titleChange', { value: v ? parseInt(String(v), 10) : null })} />
          </div>

          <div style={fieldStyle}>
            <Input label="Patient Name" required value={item.FirstName || ''}
              error={fieldErrorFor('FirstName', 'Required')}
              onChange={(e) => setField('FirstName', e.target.value.toUpperCase())} />
          </div>

          {showApproxAge && (
            <div style={fieldStyle}>
              <label style={legacyLabelStyle}>Approx. Age</label>
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

          <div style={fieldStyle}>
            <Input label="Age" maxLength={3} value={item.Age ?? ''}
              onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })} />
          </div>

          <div style={fieldStyle}>
            <DatePicker label="DOB" required value={item.DOB || ''}
              error={fieldErrorFor('DOB', 'Required')}
              onChange={(value) => dispatch('dobChange', { value })} />
          </div>

          <div style={fieldStyle}>
            <Select label="Gender" required options={toOptions(lookup.Gender)} placeholder="Select"
              value={item.GenderId ?? ''} error={fieldErrorFor('GenderId', 'Required')}
              onChange={(v) => setField('GenderId', v ? parseInt(String(v), 10) : null)} />
          </div>

          <div style={fieldStyle}>
            <Select label="Spouse Type" options={toOptions(lookup.GuardianType)} placeholder="Select"
              value={item.GuardianTypeId ?? ''}
              onChange={(v) => setField('GuardianTypeId', v ? parseInt(String(v), 10) : null)} />
          </div>

          <div style={fieldStyle}>
            <Input label="Spouse Name" value={item.GuardianName || ''}
              onChange={(e) => setField('GuardianName', e.target.value.toUpperCase())} />
          </div>

          <div style={fieldStyle}>
            <Input label="Land Line" maxLength={10} value={item.LandLine || ''}
              error={fieldErrorFor('LandLine', 'Must be 10 digits')}
              onChange={(e) => setField('LandLine', e.target.value.replace(/[^\d]/g, ''))} />
          </div>

          <div style={fieldStyle}>
            <Input label="Mobile" maxLength={10} value={item.Mobile || ''}
              error={fieldErrorFor('Mobile', 'Must be 10 digits')}
              onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))} />
          </div>

          <div style={fieldStyle}>
            <Input label="Nationality Id" value={item.NationalityIdentifier || ''}
              onChange={(e) => setField('NationalityIdentifier', e.target.value)} />
          </div>

          <div style={{ ...fieldStyle, gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-end', gap: spacing.sm }}>
            <div style={{ flex: 1 }}>
              <Input ref={googleInputRef} label="Google Address" disabled={!googleEnabled}
                defaultValue={googleAddressText} placeholder={googleEnabled ? 'Start typing an address...' : ''} />
            </div>
            <div style={{ height: 36, display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={googleEnabled} onChange={toggleGoogleAddress} />
            </div>
          </div>

          <div style={fieldStyle}>
            <Input label="Address Line 1" value={item.AddressLine1 || ''}
              onChange={(e) => setField('AddressLine1', e.target.value.toUpperCase())} />
          </div>

          <div style={fieldStyle}>
            <Input label="Address Line 2" value={item.AddressLine2 || ''}
              onChange={(e) => setField('AddressLine2', e.target.value.toUpperCase())} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>Country</label>
            <CountryControl countryid={item.CountryId} onUpdate={handleAddressUpdate} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>{item.CountryId === 1 ? 'State' : item.CountryId === 2 ? 'Province' : 'State'}</label>
            <StateControl stateid={item.StateId} countryid={item.CountryId}
              onUpdate={handleAddressUpdate} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>District</label>
            <DistrictControl districtid={localDistrictId} countryid={item.CountryId} stateid={item.StateId}
              onUpdate={handleAddressUpdate} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>{item.CountryId === 2 ? 'Municipality' : 'City/Town'}</label>
            <CityControl cityid={item.CityId} countryid={item.CountryId} stateid={item.StateId} districtid={localDistrictId}
              onUpdate={handleAddressUpdate} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>{item.CountryId === 2 ? 'Ward No' : 'Area'}</label>
            <AreaControl areaid={localAreaId} cityid={item.CityId} stateid={item.StateId}
              districtid={localDistrictId} countryid={item.CountryId} pincode={item.Pincode}
              onUpdate={handleAddressUpdate} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>Pincode</label>
            <PincodeControl pincodeid={item.PinCodeId} pincode={item.Pincode} cityid={item.CityId} stateid={item.StateId}
              districtid={localDistrictId} countryid={item.CountryId}
              onUpdate={handleAddressUpdate} />
          </div>
        </div>
      </Card>

      <Card title="OP Visit" style={{ marginTop: spacing.xl }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>

          <div style={fieldStyle}>
            <Select label="Visit Type" required options={toOptions(lookup.VisitType)} placeholder="Select"
              value={item.VisitTypeId ?? ''} error={fieldErrorFor('VisitTypeId', 'Required')}
              onChange={(v) => setField('VisitTypeId', v ? parseInt(String(v), 10) : null)} />
          </div>

          {/* Doctor stays native -- see component-level note. */}

          <div style={fieldStyle}>
            <Select label="Department" options={toOptions(lookup.Department)} placeholder="Select" disabled
              value={item.DepartmentId ?? ''} onChange={() => {}} />
          </div>

          <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
            <Textarea label="Comments" style={{ height: 76 }} value={item.Comments || ''}
              onChange={(e) => setField('Comments', e.target.value)} />
          </div>

          <div style={fieldStyle}>
            <label style={legacyLabelStyle}>Referred By</label>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <div style={{ flex: 1 }}>
                <Select options={toOptions(referralOptions)} placeholder="Select" value={item.ReferrerId ?? ''}
                  onChange={(v) => {
                    const id = v ? parseInt(String(v), 10) : null;
                    const selected = referralOptions.find((r) => r.Id === id);
                    dispatch('referrerChange', { value: id, referralTypeId: selected ? selected.ReferralTypeId : undefined });
                  }} />
              </div>
              <Button type="button" title="Add Referral" variant="success" icon="fa fa-plus"
                onClick={() => dispatch('addReferral')} />
            </div>
          </div>

          <div style={fieldStyle}>
            <Select label="Referral Type" options={toOptions(lookup.ReferralType)} placeholder="Select"
              value={item.ReferTypeId ?? ''}
              onChange={(v) => dispatch('referTypeChange', { value: v ? parseInt(String(v), 10) : null })} />
          </div>

          <div style={fieldStyle}>
            <Select label="Guarantor Type" options={toOptions(lookup.GuarantorType)} placeholder="Select" disabled
              value={item.GuarantorTypeId ?? ''} onChange={() => {}} />
          </div>

          <div style={fieldStyle}>
            <Select label="Guarantor" options={toOptions(lookup.Guarantor)} placeholder="Select" disabled
              value={item.GuarantorId ?? ''} onChange={() => {}} />
          </div>
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------
// RegistrationCumVisitFooter -- OPDBill / Vitals / VisitPrint.
//
// Back, the Print dropdown, Save, SaveAndApprove, and ClearForm all stay real,
// untouched native Angular markup in registrationcumvisit.html: Back/Save/
// SaveAndApprove keep their real working alt+b/alt+t/alt+a keyboard shortcuts (an
// Angular `hotkey` directive attribute would not work on a React-rendered button,
// same precedent as fullregistration's Save/SaveAndApprove), the Print dropdown is a
// real bootstrap uib-dropdown widget with its own alt+p hotkey on the toggle button,
// and ClearForm is a trivial always-visible button with no item-field data needs, so
// none of the five need to move into React for this pass.
//
// item.PatientStatusId, currentcontext.isTempPatient, and isPatientDeactivated are
// never set anywhere in registrationcumvisit.js (confirmed by grep) -- so the real
// ng-disabled="item.PatientStatusId==3" / ng-hide="currentcontext.isTempPatient"
// guards on these three buttons are always false/no-op today. Reproduced here by
// simply never disabling/hiding these buttons beyond their real ng-if flag gates.
// ---------------------------------------------------------------------------
export const RegistrationCumVisitFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { flags = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {flags.EnableOPD && (
        <Button type="button" variant="info" style={{ marginRight: spacing.sm, background: '#2563eb' }} onClick={() => dispatch('OPDBill')}>
          OP Bill
        </Button>
      )}
      {flags.Vitals && (
        <Button type="button" variant="info" style={{ marginRight: spacing.sm, background: '#0891b2' }} onClick={() => dispatch('vitals')}>
          Vitals
        </Button>
      )}
      {flags.Vitals && (
        <Button type="button" variant="info" style={{ marginRight: spacing.sm, background: '#6658a2' }} onClick={() => dispatch('visitprint')}>
          Visit Print
        </Button>
      )}
    </div>
  );
};
