import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';
import { apiFetch } from './utils/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Breadcrumb';
import { colors, spacing, typography, radii, controlHeight } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
}

interface Lookups {
  Title: LookupItem[];
  Gender: LookupItem[];
  MaritalStatus: LookupItem[];
  Religion: LookupItem[];
  Nationality: LookupItem[];
  Language: LookupItem[];
  PatientType: LookupItem[];
}

interface ServerItem {
  Id?: number;
  TitleId?: number;
  GenderId?: number;
  Age?: number | string;
  DOB?: string;
  ApproxAgeDays?: number | string;
  ApproxAgeMonths?: number | string;
  PhotoPath?: string;
  iswebcamphoto?: boolean;
  webcamphoto?: string;
  [key: string]: any;
}

interface NewRegistrationScreenProps {
  reactProps?: {
    item?: ServerItem;
    lookup?: Lookups;
    currentcontext?: { id?: number; Photo?: string };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

interface LocalFields {
  FirstName: string;
  MaritalStatusId?: number | string;
  ReligionId?: number | string;
  NationalityId?: number | string;
  NationalityIdentifier: string;
  PreferredLanguageId?: number | string;
  PatientTypeId?: number | string;
  LandLine: string;
  Mobile: string;
  Email: string;
  IsSmsCommunicationPreference: boolean;
  IsEmailCommunicationPreference: boolean;
}

interface AddressChain {
  countryid: number | null;
  country: string;
  stateid: number | null;
  state: string;
  districtid: number | null;
  district: string;
  cityid: number | null;
  city: string;
  areaid: number | null;
  area: string;
  pincodeid: number | null;
  pincode: string;
}

const emptyLocal: LocalFields = {
  FirstName: '',
  NationalityIdentifier: '',
  LandLine: '',
  Mobile: '',
  Email: '',
  IsSmsCommunicationPreference: false,
  IsEmailCommunicationPreference: false,
};

const emptyAddress: AddressChain = {
  countryid: null, country: '',
  stateid: null, state: '',
  districtid: null, district: '',
  cityid: null, city: '',
  areaid: null, area: '',
  pincodeid: null, pincode: '',
};

// Shared label style for the address-hierarchy sub-controls (CountryControl etc.) and
// other composite fields below that aren't a single Input/Select -- matches the
// design-system's own internal Input/Select label styling so they line up visually.
const groupLabelStyle: React.CSSProperties = {
  ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily, display: 'block',
};

export const NewRegistrationScreen: React.FC<NewRegistrationScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup, currentcontext = {} } = reactProps || {};
  const lookups: Lookups = {
    Title: lookup?.Title || [],
    Gender: lookup?.Gender || [],
    MaritalStatus: lookup?.MaritalStatus || [],
    Religion: lookup?.Religion || [],
    Nationality: lookup?.Nationality || [],
    Language: lookup?.Language || [],
    PatientType: lookup?.PatientType || [],
  };

  const [local, setLocal] = useState<LocalFields>(emptyLocal);
  const [address, setAddress] = useState<AddressChain>(emptyAddress);
  // AddressLine1/2 are real item fields, but the live template has no manual input for
  // them today (address.html comments those inputs out) -- the only thing that ever
  // sets them is the Google-Places handler below, matching current real behavior.
  const [addressLines, setAddressLines] = useState({ AddressLine1: '', AddressLine2: '' });
  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleAddressText, setGoogleAddressText] = useState('');
  const googleInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Re-sync local fields + address chain whenever a fresh server record loads
  // (id transitions, e.g. after getItemCallback loads an existing patient).
  useEffect(() => {
    setLocal({
      FirstName: item.FirstName || '',
      MaritalStatusId: item.MaritalStatusId,
      ReligionId: item.ReligionId,
      NationalityId: item.NationalityId,
      NationalityIdentifier: item.NationalityIdentifier || '',
      PreferredLanguageId: item.PreferredLanguageId,
      PatientTypeId: item.PatientTypeId,
      LandLine: item.LandLine || '',
      Mobile: item.Mobile || '',
      Email: item.Email || '',
      IsSmsCommunicationPreference: !!item.IsSmsCommunicationPreference,
      IsEmailCommunicationPreference: !!item.IsEmailCommunicationPreference,
    });
    setAddress({
      countryid: item.CountryId ?? null, country: item.Country || '',
      stateid: item.StateId ?? null, state: item.State || '',
      districtid: null, district: '',
      cityid: item.CityId ?? null, city: item.City || '',
      areaid: null, area: item.Area || '',
      pincodeid: item.PinCodeId ?? null, pincode: item.Pincode || '',
    });
    setAddressLines({
      AddressLine1: item.AddressLine1 || '',
      AddressLine2: item.AddressLine2 || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.Id]);

  const canShowApproxAge = useMemo(() => {
    const titleId = item.TitleId;
    if (!titleId || !lookups.Title.length) return false;
    const t = lookups.Title.find((x) => x.Id === titleId);
    return !!(t && t.Code && t.Code.toLowerCase() === 'babyof');
  }, [item.TitleId, lookups.Title]);

  const handleLocalChange = (field: keyof LocalFields, value: any) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressUpdate = (updates: Partial<AddressChain>) => {
    setAddress((prev) => ({ ...prev, ...updates }));
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

  // Google Places Autocomplete -- real window.google.maps.places API (the app's real
  // Maps script + key is loaded globally in index.html). Field mapping mirrors the
  // original gmPlacesAutocomplete::placeChanged handler in newregistration.js exactly.
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
      setAddressLines({ AddressLine1: addressLine1, AddressLine2: addressLine2 });
      // Mirrors $scope.clearpreviousaddress() -- the original clears the previous
      // resolved address hierarchy the moment a new place's components start parsing.
      setAddress(emptyAddress);

      if (pincode) {
        try {
          const res = await apiFetch('generalmaster/PincodeMaster/GetPincodeMasters', {
            Params: [{ Key: 5, Value: pincode }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          });
          if (res && res.Data && res.Data.length > 0) {
            const d = res.Data[0];
            setAddress((prev) => ({
              ...prev,
              pincodeid: d.Id, pincode: d.Pincode || pincode,
              area: d.Area || area,
              cityid: d.CityId, city: d.CityMaster?.CityName || '',
              stateid: d.StateId, state: d.StateMaster?.StateName || '',
              countryid: d.CountryId, country: d.CountryMaster?.CountryName || '',
            }));
          }
        } catch (err) {
          console.error('Pincode lookup failed', err);
        }
      }
    });

    return () => {
      if (g.maps.event) g.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [googleEnabled]);

  const toggleGoogleAddress = (checked: boolean) => {
    setGoogleEnabled(checked);
    if (!checked) {
      setGoogleAddressText('');
      setAddress(emptyAddress);
      setAddressLines({ AddressLine1: '', AddressLine2: '' });
    } else {
      setTimeout(() => googleInputRef.current?.focus(), 100);
    }
  };

  const handleSave = () => {
    const payload: Record<string, any> = {
      ...local,
      ...addressLines,
      CountryId: address.countryid, Country: address.country,
      StateId: address.stateid, State: address.state,
      CityId: address.cityid, City: address.city,
      Area: address.area,
      PinCodeId: address.pincodeid, Pincode: address.pincode,
    };
    dispatch('save', payload);
  };

  // Mirrors the original ng-show precedence exactly: webcam photo, then a freshly
  // selected (not-yet-saved) file thumbnail, then the saved PhotoPath's fetched image,
  // then a gender-based placeholder.
  const genderId = item.GenderId;
  const photoSrc = item.iswebcamphoto && item.webcamphoto
    ? `data:image/png;base64,${item.webcamphoto}`
    : localFilePreview
    ? localFilePreview
    : item.PhotoPath && currentcontext.Photo
    ? `data:image/png;base64,${currentcontext.Photo}`
    : genderId === 2
    ? 'app/img/main/no-img-female.png'
    : 'app/img/main/img.jpg';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 100px` }}>
      <PageHeader
        title="Patient Registration Form"
        actions={<Button variant="primary" icon="fa-sign-out" onClick={() => dispatch('logout')}>Logout</Button>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {/* Photo */}
        <Card title="Photograph">
          <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
            <img
              src={photoSrc}
              alt="Patient"
              style={{ width: 110, height: 110, borderRadius: radii.full, objectFit: 'cover', border: `1px solid ${colors.border}` }}
            />
            <div style={{ display: 'flex', gap: spacing.sm }}>
              {/*
                Hidden-file-input-under-a-styled-label trigger -- kept as native markup
                (rather than the design-system Input, which is a labeled text-style
                field, or FileUpload, which renders its own larger dropzone/label UI)
                so this stays the same compact 36x36 icon control sitting inline with
                the webcam/clear icon buttons. Only the hardcoded hex colors are swapped
                for design tokens; handleFileChange/its file payload are untouched.
              */}
              <label style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}`, cursor: 'pointer',
                backgroundColor: colors.surface,
              }} title="Upload">
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <i className="fa fa-upload" aria-hidden="true" />
              </label>
              <Button variant="icon" icon="fa-camera" title="Webcam" onClick={() => dispatch('openWebCam')} />
              <Button variant="icon" icon="fa-trash" title="Clear" onClick={handleClearImage} />
            </div>
          </div>
        </Card>

        {/* Personal details */}
        <Card title="Personal Details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>
            <Select
              label="Title"
              required
              placeholder="Select"
              value={item.TitleId != null ? String(item.TitleId) : ''}
              options={lookups.Title.map((t) => ({ value: String(t.Id), label: t.Text }))}
              onChange={(value) => dispatch('titleChange', { value: value ? parseInt(String(value), 10) : null })}
            />

            <Input
              label="Patient Name"
              required
              value={local.FirstName}
              onChange={(e) => handleLocalChange('FirstName', e.target.value.toUpperCase())}
            />

            {canShowApproxAge && (
              <div>
                <label style={groupLabelStyle}>Approx. Age</label>
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <Input placeholder="Days" value={item.ApproxAgeDays ?? ''}
                    onChange={(e) => dispatch('approxDaysChange', { value: e.target.value })} />
                  <Input placeholder="Months" value={item.ApproxAgeMonths ?? ''}
                    onChange={(e) => dispatch('approxMonthsChange', { value: e.target.value })} />
                </div>
              </div>
            )}

            <Input
              label="Age"
              placeholder="Years"
              value={item.Age ?? ''}
              onChange={(e) => dispatch('ageChange', { value: e.target.value })}
            />

            <DatePicker
              label="DOB"
              required
              value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
              onChange={(value) => dispatch('dobChange', { value })}
            />

            {canShowApproxAge && (
              <Input
                label="Years"
                value={item.Age ?? ''}
                onChange={(e) => dispatch('ageChange', { value: e.target.value })}
              />
            )}

            <Select
              label="Gender"
              required
              placeholder="Select"
              value={item.GenderId != null ? String(item.GenderId) : ''}
              options={lookups.Gender.map((g) => ({ value: String(g.Id), label: g.Text }))}
              onChange={(value) => dispatch('genderChange', { value: value ? parseInt(String(value), 10) : null })}
            />

            <Select
              label="Marital Status"
              placeholder="Select"
              value={local.MaritalStatusId ?? ''}
              options={lookups.MaritalStatus.map((x) => ({ value: String(x.Id), label: x.Text }))}
              onChange={(value) => handleLocalChange('MaritalStatusId', value ? parseInt(String(value), 10) : undefined)}
            />

            <Select
              label="Religion"
              placeholder="Select"
              value={local.ReligionId ?? ''}
              options={lookups.Religion.map((x) => ({ value: String(x.Id), label: x.Text }))}
              onChange={(value) => handleLocalChange('ReligionId', value ? parseInt(String(value), 10) : undefined)}
            />

            <Select
              label="Nationality"
              placeholder="Select"
              value={local.NationalityId ?? ''}
              options={lookups.Nationality.map((x) => ({ value: String(x.Id), label: x.Text }))}
              onChange={(value) => handleLocalChange('NationalityId', value ? parseInt(String(value), 10) : undefined)}
            />

            <Input
              label="Nationality ID"
              value={local.NationalityIdentifier}
              onChange={(e) => handleLocalChange('NationalityIdentifier', e.target.value)}
            />

            <Select
              label="Preferred Language"
              placeholder="Select"
              value={local.PreferredLanguageId ?? ''}
              options={lookups.Language.map((x) => ({ value: String(x.Id), label: x.Text }))}
              onChange={(value) => handleLocalChange('PreferredLanguageId', value ? parseInt(String(value), 10) : undefined)}
            />

            <Select
              label="Patient Type"
              placeholder="Select"
              value={local.PatientTypeId ?? ''}
              options={lookups.PatientType.map((x) => ({ value: String(x.Id), label: x.Text }))}
              onChange={(value) => handleLocalChange('PatientTypeId', value ? parseInt(String(value), 10) : undefined)}
            />

            <Input
              label="Landline"
              value={local.LandLine}
              maxLength={15}
              onChange={(e) => handleLocalChange('LandLine', e.target.value.replace(/[^\d]/g, ''))}
            />

            <Input
              label="Mobile"
              value={local.Mobile}
              maxLength={15}
              onChange={(e) => handleLocalChange('Mobile', e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>
          <div style={{ ...typography.helper, color: colors.textMuted, marginTop: spacing.sm }}>
            At least one of Landline or Mobile is required to save.
          </div>
        </Card>

        {/* Address (Google-assisted opt-in + manual hierarchy) */}
        <Card title="Address">
          {/* Google-assisted address (opt-in) */}
          <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-end', marginBottom: spacing.lg }}>
            <div style={{ flex: 1 }}>
              {/*
                Google Places Autocomplete's own input -- restyled via the design-system
                Input component. Input forwards its ref straight through to the real
                native <input> DOM node (no wrapping element around the input itself),
                so window.google.maps.places.Autocomplete(googleInputRef.current, {})
                still attaches to the exact same element it always did. The autocomplete
                init/ref/listener/resolve logic above is completely untouched -- only
                this label/input's visual chrome changed. The widget's own dropdown is
                injected by Google into document.body and is not touched here.
              */}
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
              <Checkbox label="Use Google Address" checked={googleEnabled} onChange={toggleGoogleAddress} />
            </div>
          </div>

          {/* Manual address hierarchy -- CountryControl/StateControl/DistrictControl/
             CityControl/AreaControl/PincodeControl are pre-existing migrated
             sub-components, invoked here exactly as before (untouched). */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: spacing.lg }}>
            <div>
              <label style={groupLabelStyle}>Country</label>
              <CountryControl countryid={address.countryid} onUpdate={handleAddressUpdate} />
            </div>
            <div>
              <label style={groupLabelStyle}>State</label>
              <StateControl stateid={address.stateid} countryid={address.countryid} onUpdate={handleAddressUpdate} />
            </div>
            <div>
              <label style={groupLabelStyle}>District</label>
              <DistrictControl districtid={address.districtid} countryid={address.countryid} stateid={address.stateid} onUpdate={handleAddressUpdate} />
            </div>
            <div>
              <label style={groupLabelStyle}>City / Town</label>
              <CityControl cityid={address.cityid} countryid={address.countryid} stateid={address.stateid} districtid={address.districtid} onUpdate={handleAddressUpdate} />
            </div>
            <div>
              <label style={groupLabelStyle}>Area</label>
              <AreaControl areaid={address.areaid} cityid={address.cityid} stateid={address.stateid} districtid={address.districtid} countryid={address.countryid} pincode={address.pincode} onUpdate={handleAddressUpdate} />
            </div>
            <div>
              <label style={groupLabelStyle}>Pincode</label>
              <PincodeControl pincodeid={address.pincodeid} pincode={address.pincode} cityid={address.cityid} stateid={address.stateid} districtid={address.districtid} countryid={address.countryid} onUpdate={handleAddressUpdate} />
            </div>
          </div>
        </Card>

        {/* Contact + communication preferences */}
        <Card title="Contact & Communication Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>
            <Input
              label="Email"
              type="email"
              value={local.Email}
              onChange={(e) => handleLocalChange('Email', e.target.value)}
            />
            <div style={{ display: 'flex', gap: spacing.xl, alignItems: 'center' }}>
              <Checkbox
                label="SMS"
                checked={local.IsSmsCommunicationPreference}
                onChange={(checked) => handleLocalChange('IsSmsCommunicationPreference', checked)}
              />
              <Checkbox
                label="Email"
                checked={local.IsEmailCommunicationPreference}
                onChange={(checked) => handleLocalChange('IsEmailCommunicationPreference', checked)}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, background: colors.surface,
        borderTop: `1px solid ${colors.border}`, padding: `${spacing.md} ${spacing.xl}`, display: 'flex', justifyContent: 'flex-end',
      }}>
        <Button variant="success" onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};
