import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';
import { colors, spacing } from '../components/ui/tokens';
import { Button } from './Button';

interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
}

interface Lookups {
  Title: LookupItem[];
  Gender: LookupItem[];
  MaritalStatus: LookupItem[];
  VipType: LookupItem[];
  MRNType: LookupItem[];
}

interface ServerItem {
  Id?: number;
  TitleId?: number;
  GenderId?: number;
  MRNTypeId?: number;
  IsMRNTypeDisable?: boolean;
  Age?: number | string;
  DOB?: string;
  ApproxAgeDays?: number | string;
  ApproxAgeMonths?: number | string;
  BabyBirthTime?: string;
  PhotoPath?: string;
  iswebcamphoto?: boolean;
  webcamphoto?: string;
  FirstName?: string;
  Mobile?: string;
  MaritalStatusId?: number;
  NationalityIdentifier?: string;
  AddressLine1?: string;
  candisable?: boolean;
  IsMLC?: boolean;
  IsVip?: boolean;
  VipTypeId?: number;
  [key: string]: any;
}

interface QuickRegistrationFormScreenProps {
  reactProps?: {
    item?: ServerItem;
    lookup?: Lookups;
    currentcontext?: { id?: number; Photo?: string; triedSubmit?: boolean };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Converts a Select/native-option value (string|number|'') back to the number|null
// shape every id-lookup field on this screen has always dispatched -- mirrors the
// original inline `e.target.value ? parseInt(e.target.value, 10) : null` exactly.
const toIdOrNull = (value: any): number | null => (value !== '' && value !== null && value !== undefined ? parseInt(String(value), 10) : null);

// Quick Registration -- the high-traffic, streamlined registration form (real
// navigation targets include the OPD dashboard, patient search, full/AE/IVF
// registration flows, and the "add new" actions on several other already-migrated
// screens). Unlike newregistration/patientregistration-form, this screen already had
// two react-component mounts (RegistrationActionBar, RegistrationFooter) embedded
// directly in the live Angular template -- those are left completely untouched here;
// this component only replaces the middle "patient details + photo" form section that
// used to be a real Angular <form id="item_form">. <patientsearch>/<patientbanner> are
// also left as-is (real, working Angular directives) -- porting those is out of scope
// for this pass and carries no risk since they are not modified.
export const QuickRegistrationFormScreen: React.FC<QuickRegistrationFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup, currentcontext = {} } = reactProps || {};
  const lookups: Lookups = {
    Title: lookup?.Title || [],
    Gender: lookup?.Gender || [],
    MaritalStatus: lookup?.MaritalStatus || [],
    VipType: lookup?.VipType || [],
    MRNType: lookup?.MRNType || [],
  };

  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleAddressText, setGoogleAddressText] = useState('');
  const googleInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Every field here dispatches straight back into $scope.item the moment it changes
  // (rather than deferring to a save-time payload merge like newregistration's Save
  // button did) -- because on this screen the Save button lives in a *separate*
  // React mount (RegistrationFooter) that has no way to hand this component's local
  // state to Angular. This actually matches the original screen's real behavior more
  // closely: the live Angular <form> kept $scope.item continuously up to date on every
  // keystroke via ng-model, it never had a "draft, then merge on submit" step either.
  const setField = (field: string, value: any) => {
    dispatch('itemFieldChange', { field, value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setLocalFilePreview(URL.createObjectURL(file));
      dispatch('fileSelected', { file });
    }
  };

  const handleClearImage = () => {
    if (localFilePreview) URL.revokeObjectURL(localFilePreview);
    setLocalFilePreview(null);
    dispatch('clearimage');
  };

  // Google Places Autocomplete -- same real window.google.maps.places API/pattern used
  // on newregistration and patientregistration-form. Unlike those two screens, this
  // template has no visible address-hierarchy controls (Country/State/District/City/
  // Area/Pincode) at all -- only a single free-text Address field is shown. A resolved
  // place still populates the same hidden item fields (PinCodeId/Area/CityId/StateId/
  // CountryId/AddressLine2) the original getPincodeDataCallback set, via one bulk
  // 'itemFieldsMerge' dispatch, even though there's no dedicated UI to display them --
  // matching real current behavior exactly (those fields are saved but never shown here
  // today either).
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
      // Mirrors $scope.clearpreviousaddress() + the subsequent AddressLine1/2 set.
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

  // Mirrors canShowApproxAge(vTitleId) exactly, including the real "babyof" OR "baby"
  // code check (a genuine difference from newregistration/patientregistration-form,
  // which only check "babyof").
  const canShowApproxAge = useMemo(() => {
    const titleId = item.TitleId;
    if (!titleId || !lookups.Title.length) return false;
    const t = lookups.Title.find((x) => x.Id === titleId);
    if (!t || !t.Code) return false;
    const code = t.Code.toLowerCase();
    return code === 'babyof' || code === 'baby';
  }, [item.TitleId, lookups.Title]);

  // Client-side mirror of the original <form id="item_form">'s real required-field
  // set (Title/FirstName/DOB/Gender required; Mobile required with exactly 10 digits
  // via MINLENGTH=10/MAXLENGTH=10) -- the authoritative gate now lives in
  // $scope.isQuickRegFormValid() inside saveItem() (see quickregistration.js), which
  // replaced utl.Validator.validate($scope)/item_form.$valid since that real Angular
  // <form> no longer exists once this section is React. This is purely a *display*
  // computation so invalid fields can be highlighted the same way a submit attempt
  // used to reveal them.
  const errors = useMemo(() => {
    const e: Record<string, boolean> = {};
    if (!item.TitleId) e.TitleId = true;
    if (!item.FirstName) e.FirstName = true;
    if (!item.DOB) e.DOB = true;
    if (!item.GenderId) e.GenderId = true;
    if (!item.Mobile || String(item.Mobile).length !== 10) e.Mobile = true;
    return e;
  }, [item.TitleId, item.FirstName, item.DOB, item.GenderId, item.Mobile]);

  const showErrors = !!currentcontext.triedSubmit;
  // Same "reveal on submit-attempt only" display rule as before, just handed to each
  // design-system field's own `error` prop instead of swapping a local inline style.
  const fieldError = (key: keyof typeof errors) => (showErrors && errors[key] ? 'Required' : undefined);

  const photoSrc = item.iswebcamphoto && item.webcamphoto
    ? `data:image/png;base64,${item.webcamphoto}`
    : localFilePreview
    ? localFilePreview
    : item.PhotoPath && currentcontext.Photo
    ? `data:image/png;base64,${currentcontext.Photo}`
    : 'app/img/main/img.jpg';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 100px` }}>
      <PageHeader title="Quick Registration" />

      {showErrors && Object.keys(errors).length > 0 && (
        <div style={{ marginBottom: spacing.lg }}>
          <Alert tone="danger">
            Please complete all required fields (Title, Patient Name, DOB, Gender, and a 10-digit Mobile number) before saving.
          </Alert>
        </div>
      )}

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>
          <Select
            label="MRN Type"
            options={lookups.MRNType.map((x) => ({ value: x.Id, label: x.Text }))}
            value={item.MRNTypeId ?? ''}
            disabled={!!item.IsMRNTypeDisable}
            placeholder="Select"
            onChange={(value) => setField('MRNTypeId', toIdOrNull(value))}
          />

          <Select
            id="title"
            label="Title"
            required
            error={fieldError('TitleId')}
            options={lookups.Title.map((t) => ({ value: t.Id, label: t.Text }))}
            value={item.TitleId ?? ''}
            placeholder="Select"
            onChange={(value) => dispatch('titleChange', { value: toIdOrNull(value) })}
          />

          <Input
            label="Patient Name"
            required
            error={fieldError('FirstName')}
            value={item.FirstName || ''}
            onChange={(e) => setField('FirstName', e.target.value.toUpperCase())}
          />

          {canShowApproxAge && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: spacing.xs }}>Approx. Age</div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Input placeholder="Days" value={item.ApproxAgeDays ?? ''}
                  onChange={(e) => dispatch('approxDaysChange', { value: e.target.value })} />
                <Input placeholder="Months" value={item.ApproxAgeMonths ?? ''}
                  onChange={(e) => dispatch('approxMonthsChange', { value: e.target.value })} />
                <Input type="number" placeholder="Years" value={item.Age ?? ''}
                  onChange={(e) => dispatch('ageChange', { value: e.target.value })} />
              </div>
            </div>
          )}

          {canShowApproxAge && (
            <TimePicker
              label="Birth Time"
              value={item.BabyBirthTime || ''}
              onChange={(value) => setField('BabyBirthTime', value)}
            />
          )}

          <DatePicker
            label="DOB"
            required
            error={fieldError('DOB')}
            value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
            onChange={(value) => dispatch('dobChange', { value })}
          />

          <Input
            label="Age"
            maxLength={3}
            value={item.Age ?? ''}
            onChange={(e) => dispatch('ageChange', { value: e.target.value.replace(/[^\d]/g, '') })}
          />

          <Select
            label="Gender"
            required
            error={fieldError('GenderId')}
            options={lookups.Gender.map((g) => ({ value: g.Id, label: g.Text }))}
            value={item.GenderId ?? ''}
            placeholder="Select"
            onChange={(value) => dispatch('genderChange', { value: toIdOrNull(value) })}
          />

          <Input
            label="Mobile"
            required
            error={fieldError('Mobile')}
            maxLength={10}
            value={item.Mobile || ''}
            onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))}
          />

          <Select
            label="Marital Status"
            options={lookups.MaritalStatus.map((x) => ({ value: x.Id, label: x.Text }))}
            value={item.MaritalStatusId ?? ''}
            placeholder="Select"
            onChange={(value) => setField('MaritalStatusId', toIdOrNull(value))}
          />

          <Input
            label="Nationality ID"
            value={item.NationalityIdentifier || ''}
            onChange={(e) => setField('NationalityIdentifier', e.target.value)}
          />

          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-end' }}>
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
            <Checkbox label="Use" checked={googleEnabled} onChange={(checked) => toggleGoogleAddress(checked)} />
          </div>

          <Input
            id="Manualadd"
            label="Address"
            value={item.AddressLine1 || ''}
            disabled={!!item.candisable}
            onChange={(e) => setField('AddressLine1', e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox label="MLC" checked={!!item.IsMLC} onChange={(checked) => setField('IsMLC', checked)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox label="VIP" checked={!!item.IsVip} onChange={(checked) => setField('IsVip', checked)} />
          </div>

          <Select
            label="VIP Type"
            options={lookups.VipType.map((x) => ({ value: x.Id, label: x.Text }))}
            value={item.VipTypeId ?? ''}
            disabled={!item.IsVip}
            placeholder="Select"
            onChange={(value) => setField('VipTypeId', toIdOrNull(value))}
          />
        </div>
      </Card>

      {/* Upload & Image Preview */}
      <div style={{ marginTop: spacing.xl }}>
        <Card title="Upload & Image Preview">
          <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
            <img
              src={photoSrc}
              alt="Patient"
              style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }}
            />
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <label style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 6, border: `1px solid ${colors.borderStrong}`, cursor: 'pointer',
              }} title="Upload">
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <i className="fa fa-upload" aria-hidden="true" />
              </label>
              <Button variant="icon" icon="fa-camera" title="Web Camera" onClick={() => dispatch('openWebCam')} />
              <Button variant="icon" icon="fa-trash" title="Remove" onClick={handleClearImage} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
