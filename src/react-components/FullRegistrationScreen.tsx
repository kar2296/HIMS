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
  Occupation?: LookupItem[];
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
  Photo?: string;
  file?: any;
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
// Shared compact label style
const groupLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '2px',
  fontFamily: typography.fontFamily,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

// Reusable lookup-driven select -- compact styled
const Sel: React.FC<{
  id?: string;
  value: any;
  options?: LookupItem[];
  onChange: (v: number | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}> = ({ id, value, options, onChange, disabled, error, label, required }) => (
  <Select
    id={id}
    label={label}
    required={required}
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
// ---------------------------------------------------------------------------
export const FullRegistrationScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const setField = (field: string, value: any) => dispatch('itemFieldChange', { field, value });

  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const [occupations, setOccupations] = useState<LookupItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiFetch('generalmaster/Occupation/GetOccupations', {
      Params: [],
      PageContext: { PageSize: 100, PageNumber: 1 },
      Occupations: '',
      PageIndex: 1,
    })
      .then((res: any) => {
        if (!isMounted) return;
        const list = res?.Data || res?.rows || (Array.isArray(res) ? res : []);
        if (Array.isArray(list)) {
          setOccupations(list.map((o: any) => ({
            Id: o.Id ?? o.OccupationId,
            Text: o.Occupations ? `${o.Occupations}${o.Code ? ` (${o.Code})` : ''}` : (o.Text || `Occupation #${o.Id}`),
            Code: o.Code,
          })));
        }
      })
      .catch((err) => console.error('Failed to load occupations', err));
    return () => { isMounted = false; };
  }, []);

  const occupationOptions = occupations.length > 0 ? occupations : (lookup.Occupation || []);

  useEffect(() => {
    if ((currentcontext.id ?? 0) <= 0) {
      const t = setTimeout(() => {
        const el = document.getElementById('select-title') || document.getElementById('title');
        el?.focus();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [currentcontext.id]);

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

  const photoSrc = item.iswebcamphoto && item.webcamphoto
    ? `data:image/png;base64,${item.webcamphoto}`
    : localFilePreview
    ? localFilePreview
    : item.PhotoPath && currentcontext.Photo
    ? `data:image/png;base64,${currentcontext.Photo}`
    : 'app/img/main/img.jpg';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLocalFilePreview(previewUrl);
      dispatch('fileSelected', { file });
      dispatch('itemFieldChange', { field: 'iswebcamphoto', value: false });
    }
  };

  const handleClearImage = () => {
    setLocalFilePreview(null);
    dispatch('clearimage');
  };

  return (
    <div
      className="full-registration-screen"
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: `${spacing.xs} 0 ${spacing.md}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .full-registration-screen {
          font-size: 12px;
          width: 100%;
        }
        .full-registration-screen label {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          margin-bottom: 3px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.3px !important;
        }
        .full-registration-screen input:not([type="checkbox"]),
        .full-registration-screen select {
          height: 32px !important;
          min-height: 32px !important;
          font-size: 12.5px !important;
          padding: 0 10px !important;
          border-radius: 6px !important;
          border: 1px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          box-sizing: border-box !important;
          width: 100% !important;
        }
        .full-registration-screen select {
          padding-right: 28px !important;
        }
        .full-registration-screen input:focus,
        .full-registration-screen select:focus {
          border-color: var(--hims-primary, #21008d) !important;
          box-shadow: 0 0 0 2px rgba(33, 0, 141, 0.12) !important;
          outline: none !important;
        }
        .full-reg-checkbox-wrap label {
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 6px !important;
          margin-bottom: 0 !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          font-size: 11.5px !important;
          text-transform: none !important;
        }
        .full-reg-checkbox-wrap label span {
          white-space: nowrap !important;
        }
        .full-registration-screen .field-sm {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 960px) {
          .full-reg-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .full-reg-photo-panel {
            grid-column: span 2 !important;
            grid-row: auto !important;
            min-height: auto !important;
            flex-direction: row !important;
            gap: 16px !important;
            padding: 8px 16px !important;
          }
        }
        @media (max-width: 600px) {
          .full-reg-grid {
            grid-template-columns: 1fr !important;
          }
          .full-reg-photo-panel {
            grid-column: span 1 !important;
            grid-row: auto !important;
          }
        }
      `}</style>

      {showErrors && Object.keys(errors).length > 0 && (
        <Alert tone="danger">
          Please complete all required fields (Title, First Name, Last Name, Gender, a 10-digit Mobile number,
          DOB, Marital Status, Nationality, and a 6-digit Pincode) before saving.
        </Alert>
      )}

      {/* Patient Info Card with Integrated Top-Right Photo Box in 4-Column Grid */}
      <Card title="Patient Info" padding="10px 14px">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px 12px',
            alignItems: 'start',
          }}
          className="full-reg-grid"
        >
          {/* Row 1 - Col 1: Title */}
          <Sel
            id="title"
            label="Title"
            required
            error={errorMessageFor('TitleId', 'Required')}
            value={item.TitleId}
            options={lookup.Title}
            onChange={(v) => dispatch('titleChange', { value: v })}
          />

          {/* Row 1 - Col 2: First Name */}
          <Input label="First Name" required error={errorMessageFor('FirstName', 'Required')} value={item.FirstName || ''}
            onChange={(e) => setField('FirstName', e.target.value.toUpperCase())} />

          {/* Row 1 - Col 3: Last Name */}
          <Input label="Last Name" required error={errorMessageFor('LastName', 'Required')} value={item.LastName || ''}
            onChange={(e) => setField('LastName', e.target.value.toUpperCase())} />

          {/* Row 1-3 - Col 4: Top-Right Photo Upload Panel inside Grid */}
          <div
            className="full-reg-photo-panel"
            style={{
              gridColumn: '4',
              gridRow: '1 / span 3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
              height: '100%',
              minHeight: '154px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <i className="fa fa-camera" style={{ color: 'var(--hims-primary, #21008d)', fontSize: '11px' }} />
              <span>Photo</span>
            </div>

            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #cbd5e1',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                marginBottom: '8px',
              }}
            >
              <img
                src={photoSrc}
                alt="Patient Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'app/img/main/img.jpg';
                }}
              />
            </div>

            {/* Photo Action Buttons */}
            <div style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '170px', justifyContent: 'center' }}>
              <label
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 8px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                  height: '26px',
                  margin: 0,
                  textTransform: 'none',
                }}
                title="Upload Photo"
              >
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <i className="fa fa-upload" style={{ color: 'var(--hims-primary, #21008d)', fontSize: '10px' }} />
                <span>Upload</span>
              </label>

              <button
                type="button"
                onClick={() => dispatch('openWebCam')}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 8px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: '26px',
                  boxSizing: 'border-box',
                }}
                title="Capture from Web Camera"
              >
                <i className="fa fa-camera" style={{ fontSize: '10px' }} />
                <span>Webcam</span>
              </button>

              {(localFilePreview || item.PhotoPath || item.iswebcamphoto || (currentcontext.Photo && item.PhotoPath)) && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  style={{
                    padding: '0 8px',
                    borderRadius: '5px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    height: '26px',
                    boxSizing: 'border-box',
                  }}
                  title="Remove Photo"
                >
                  <i className="fa fa-trash" style={{ fontSize: '10px' }} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2 - Col 1: Middle Name */}
          <Input label="Middle Name" value={item.MiddleName || ''}
            onChange={(e) => setField('MiddleName', e.target.value.toUpperCase())} />

          {/* Row 2 - Col 2: Alias Name */}
          <Input label="Alias Name" value={item.AliasName || ''}
            onChange={(e) => setField('AliasName', e.target.value.toUpperCase())} />

          {/* Row 2 - Col 3: MRN Type */}
          <Sel label="MRN Type" value={item.MRNTypeId} options={lookup.MRNType} disabled={!!item.IsMRNTypeDisable}
            onChange={(v) => setField('MRNTypeId', v)} />

          {/* Row 3 - Col 1: Gender */}
          <Sel label="Gender" value={item.GenderId} options={lookup.Gender} error={errorMessageFor('GenderId', 'Required')}
            onChange={(v) => setField('GenderId', v)} />

          {showApproxAge ? (
            <>
              {/* Row 3 - Col 2: Birth Time */}
              <TimePicker label="Birth Time" value={item.BabyBirthTime || ''}
                onChange={(value) => setField('BabyBirthTime', value)} />

              {/* Row 3 - Col 3: DOB */}
              <DatePicker label="DOB" required error={errorMessageFor('DOB', 'Required')}
                value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
                onChange={(value) => dispatch('dobChange', { value })} />

              {/* Row 4 - Cols 1-2: Approx Age */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={groupLabelStyle}>Approx. Age</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <Input placeholder="Days" value={item.ApproxAgeDays ?? ''}
                    onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })} />
                  <Input placeholder="Months" value={item.ApproxAgeMonths ?? ''}
                    onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })} />
                  <Input placeholder="Years" value={item.Age ?? ''}
                    onChange={(e) => dispatch('ageYearsChange', { value: e.target.value })} />
                </div>
              </div>

              {/* Row 4 - Col 3: Age */}
              <Input label="Age" maxLength={3} value={item.Age ?? ''}
                onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })} />

              {/* Row 4 - Col 4: Marital Status */}
              <Sel label="Marital Status" value={item.MaritalStatusId} options={lookup.MaritalStatus} error={errorMessageFor('MaritalStatusId', 'Required')}
                onChange={(v) => setField('MaritalStatusId', v)} />

              {/* Row 5: Mobile, Spouse Type, Spouse Name */}
              <Input id="contactnr" label="Mobile" required error={errorMessageFor('Mobile', 'Enter a 10-digit mobile number')}
                maxLength={10} value={item.Mobile || ''}
                onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))} />

              <Sel label="Spouse Type" value={item.GuardianTypeId} options={lookup.GuardianType}
                onChange={(v) => setField('GuardianTypeId', v)} />

              <Input label="Spouse Name" value={item.GuardianName || ''}
                onChange={(e) => setField('GuardianName', e.target.value.toUpperCase())} />

              <div />
            </>
          ) : (
            <>
              {/* Row 3 - Col 2: DOB */}
              <DatePicker label="DOB" required error={errorMessageFor('DOB', 'Required')}
                value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
                onChange={(value) => dispatch('dobChange', { value })} />

              {/* Row 3 - Col 3: Age */}
              <Input label="Age" maxLength={3} value={item.Age ?? ''}
                onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })} />

              {/* Row 4: Mobile, Marital Status, Spouse Type, Spouse Name */}
              <Input id="contactnr" label="Mobile" required error={errorMessageFor('Mobile', 'Enter a 10-digit mobile number')}
                maxLength={10} value={item.Mobile || ''}
                onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))} />

              <Sel label="Marital Status" value={item.MaritalStatusId} options={lookup.MaritalStatus} error={errorMessageFor('MaritalStatusId', 'Required')}
                onChange={(v) => setField('MaritalStatusId', v)} />

              <Sel label="Spouse Type" value={item.GuardianTypeId} options={lookup.GuardianType}
                onChange={(v) => setField('GuardianTypeId', v)} />

              <Input label="Spouse Name" value={item.GuardianName || ''}
                onChange={(e) => setField('GuardianName', e.target.value.toUpperCase())} />
            </>
          )}

          {/* Row 5: Religion, Nationality, Nationality ID, Passport */}
          <Sel label="Religion" value={item.ReligionId} options={lookup.Religion} onChange={(v) => setField('ReligionId', v)} />

          <Sel label="Nationality" value={item.NationalityId} options={lookup.Nationality} error={errorMessageFor('NationalityId', 'Required')}
            onChange={(v) => setField('NationalityId', v)} />

          <Input label="Nationality ID" value={item.NationalityIdentifier || ''}
            onChange={(e) => setField('NationalityIdentifier', e.target.value)} />

          <Input label="Passport Number" value={item.PasspostNumber || ''}
            onChange={(e) => setField('PasspostNumber', e.target.value)} />

          {/* Row 6: Visa Type, Visa Number, Visa Expiry, Occupation */}
          <Sel label="Visa Type" value={item.VisaTypeId} options={lookup.VisaType} onChange={(v) => setField('VisaTypeId', v)} />

          <Input label="Visa Number" value={item.VisaNumber || ''}
            onChange={(e) => setField('VisaNumber', e.target.value)} />

          <DatePicker label="Visa Expiry" value={item.VisaExpiry ? String(item.VisaExpiry).slice(0, 10) : ''}
            onChange={(value) => setField('VisaExpiry', value)} />

          {/* Occupation */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Sel
                label="Occupation"
                value={item.OccupationId}
                options={occupationOptions}
                disabled={!!item.isAdmitted}
                onChange={(v) => dispatch('itemFieldChange', { field: 'OccupationId', value: v })}
              />
            </div>
            <button
              type="button"
              title="Add Occupation"
              onClick={() => dispatch('addOccupation')}
              style={{
                height: '32px',
                width: '32px',
                minWidth: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: 'var(--hims-primary, #21008d)',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <i className="fa fa-plus" aria-hidden="true" style={{ fontSize: '11px' }} />
            </button>
          </div>

          {/* Row 7: Patient Type, Blood Group, Refer Type, Referrer */}
          <Sel label="Patient Type" value={item.PatientTypeId} options={lookup.PatientType} onChange={(v) => setField('PatientTypeId', v)} />

          <Sel label="Blood Group" value={item.BloodGroupId} options={lookup.BloodGroup} onChange={(v) => setField('BloodGroupId', v)} />

          <Sel label="Refer Type" value={item.ReferTypeId} options={lookup.ReferralType}
            onChange={(v) => dispatch('referTypeChange', { value: v })} />

          {/* Referrer */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Sel label="Referrer" value={item.ReferrerId} options={lookup.Referral}
                onChange={(v) => dispatch('referrerChange', { value: v })} />
            </div>
            <button
              type="button"
              title="Add Referral"
              onClick={() => dispatch('addReferral')}
              style={{
                height: '32px',
                width: '32px',
                minWidth: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: 'var(--hims-primary, #21008d)',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <i className="fa fa-plus" aria-hidden="true" style={{ fontSize: '11px' }} />
            </button>
          </div>

          {/* Row 8: Remarks, Land Line, Email, Income */}
          <Sel label="Remarks" value={item.RemarkId} options={lookup.Remark} onChange={(v) => setField('RemarkId', v)} />

          <Input id="landline" label="Land Line" error={errorMessageFor('LandLine', 'Enter a 10-digit landline number')}
            maxLength={10} value={item.LandLine || ''}
            onChange={(e) => setField('LandLine', e.target.value.replace(/[^\d]/g, ''))} />

          <Input type="email" label="Email" error={errorMessageFor('Email', 'Enter a valid email address')} value={item.Email || ''}
            onChange={(e) => setField('Email', e.target.value)} />

          <Input label="Income" error={errorMessageFor('Income', 'Numbers only')} value={item.Income || ''}
            onChange={(e) => setField('Income', e.target.value)} />

          {/* Row 9: Flags & VIP */}
          <div>
            <label style={groupLabelStyle}>Flags</label>
            <div className="full-reg-checkbox-wrap" style={{ display: 'flex', gap: '14px', alignItems: 'center', height: '32px' }}>
              <Checkbox label="VIP" checked={!!item.IsVip} onChange={(checked) => setField('IsVip', checked)} />
              <Checkbox label="Insurance" checked={!!item.IsInsurance} onChange={(checked) => setField('IsInsurance', checked)} />
              <Checkbox label="IVF" checked={!!item.IsIvfRegistration} onChange={(checked) => setField('IsIvfRegistration', checked)} />
            </div>
          </div>

          {item.IsVip ? (
            <Sel label="VIP Type" value={item.VipTypeId} options={lookup.VipType}
              onChange={(v) => setField('VipTypeId', v)} />
          ) : (
            <div />
          )}

          {showFindPatient ? (
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="Patient Associate" value={item.PatientAssociate || ''} disabled />
            </div>
          ) : null}
        </div>
      </Card>

      {/* Address Info Card */}
      <Card title="Address Info" padding="10px 14px">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px 12px',
            alignItems: 'start',
          }}
          className="full-reg-grid"
        >
          {/* Row 1: Address Line 1 (2 cols), Address Line 2 (2 cols) */}
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Address Line 1" value={item.AddressLine1 || ''}
              onChange={(e) => setField('AddressLine1', e.target.value.toUpperCase())} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Address Line 2" value={item.AddressLine2 || ''}
              onChange={(e) => setField('AddressLine2', e.target.value.toUpperCase())} />
          </div>

          {/* Row 2: Country, State, District, City */}
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

          {/* Row 3: Area/Ward, Pincode, Google Places Search (2 cols) */}
          <Input label={item.CountryId === 2 ? 'Ward No' : 'Area'} value={item.Area || ''} onChange={(e) => setField('Area', e.target.value)} />

          <Input label="Pincode" required error={errorMessageFor('Pincode', 'Enter a 6-digit pincode')}
            maxLength={6} value={item.Pincode || ''}
            onChange={(e) => setField('Pincode', e.target.value)} />

          {/* Google Places Search */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', gridColumn: 'span 2' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
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
            <div className="full-reg-checkbox-wrap" style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
              <Checkbox label="Use" checked={googleEnabled} onChange={toggleGoogleAddress} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FullRegistrationFooter -- left-hand footer button group.
// ---------------------------------------------------------------------------
export const FullRegistrationFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, flags = {}, currentcontext = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const disabledByStatus = item.PatientStatusId === 3;
  const isRegistered = Number(item.PatientStatusId) === 2 && !currentcontext.isTempPatient;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button
        type="button"
        variant="light"
        size="sm"
        icon="fa-undo"
        onClick={() => dispatch('clear')}
        title="Reset form"
        style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}
      >
        Reset Form
      </Button>
      {isRegistered && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabledByStatus}
          onClick={() => dispatch('visitcreate')}
          style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}
        >
          New Visit
        </Button>
      )}
      {isRegistered && flags.Vitals && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabledByStatus}
          onClick={() => dispatch('vitals')}
          style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}
        >
          Vitals
        </Button>
      )}
      {isRegistered && flags.Visitprint && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabledByStatus}
          onClick={() => dispatch('visitprint')}
          style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}
        >
          Visit Print
        </Button>
      )}
    </div>
  );
};
