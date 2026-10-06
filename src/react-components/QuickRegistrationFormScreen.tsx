import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Button } from './Button';
import { PatientSearchControl } from './PatientSearchControl';
import { RegistrationActionBar } from './RegistrationActionBar';
import { PatientIdentityBanner } from './PatientIdentityBanner';

export interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
}

export interface Lookups {
  Title: LookupItem[];
  Gender: LookupItem[];
  MaritalStatus: LookupItem[];
  VipType: LookupItem[];
  MRNType: LookupItem[];
  Religion?: LookupItem[];
  Nationality?: LookupItem[];
  Language?: LookupItem[];
  PatientType?: LookupItem[];
}

export interface ServerItem {
  Id?: number;
  PatientId?: number;
  MRN?: string;
  TitleId?: number;
  Title?: { Id?: number; Description?: string };
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
  LastName?: string;
  MiddleName?: string;
  Mobile?: string;
  LandLine?: string;
  Email?: string;
  MaritalStatusId?: number;
  NationalityIdentifier?: string;
  NationalityId?: number;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  CityId?: number;
  StateId?: number;
  CountryId?: number;
  PinCodeId?: number;
  candisable?: boolean;
  IsMLC?: boolean;
  IsVip?: boolean;
  VipTypeId?: number;
  PatientStatusId?: number;
  PatientStatus?: string;
  SaveCompleted?: boolean;
  BillCompleted?: boolean;
  ReferredNewVisit?: boolean;
  [key: string]: any;
}

export interface QuickRegistrationFormScreenProps {
  reactProps?: {
    item?: ServerItem;
    lookup?: Lookups;
    currentcontext?: {
      id?: number;
      Photo?: string;
      triedSubmit?: boolean;
      canDisableApprove?: boolean;
      attachmentcount?: number;
      isTempPatient?: boolean;
    };
    actionBar?: any;
    footer?: any;
    [key: string]: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const toIdOrNull = (value: any): number | null =>
  value !== '' && value !== null && value !== undefined ? parseInt(String(value), 10) : null;

const extractActualProps = (p: any) => {
  let curr = p;
  while (curr && curr.reactProps) {
    curr = curr.reactProps;
  }
  return curr || p || {};
};

export const QuickRegistrationFormScreen: React.FC<QuickRegistrationFormScreenProps> = (props) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction;

  const rawItem = actualProps.item || {};
  const rawCurrentContext = actualProps.currentcontext || {};

  // Form local state mirrors item
  const [item, setItem] = useState<ServerItem>(rawItem);
  const [localLookups, setLocalLookups] = useState<Lookups>({
    Title: actualProps.lookup?.Title || [],
    Gender: actualProps.lookup?.Gender || [],
    MaritalStatus: actualProps.lookup?.MaritalStatus || [],
    VipType: actualProps.lookup?.VipType || [],
    MRNType: actualProps.lookup?.MRNType || [],
  });

  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleAddressText, setGoogleAddressText] = useState('');
  const [patientSearchDisplay, setPatientSearchDisplay] = useState('');
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  const googleInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Sync props down into local item when external item changes
  useEffect(() => {
    if (actualProps.item) {
      setItem((prev) => ({
        ...prev,
        ...actualProps.item,
      }));
      if (actualProps.item.FirstName || actualProps.item.MRN) {
        const display = [
          actualProps.item.Title?.Description || '',
          actualProps.item.FirstName || '',
          actualProps.item.MRN ? `(MRN: ${actualProps.item.MRN})` : '',
        ]
          .filter(Boolean)
          .join(' ');
        setPatientSearchDisplay(display);
      }
    }
  }, [actualProps.item]);

  // Sync lookups if provided externally
  useEffect(() => {
    if (actualProps.lookup) {
      setLocalLookups({
        Title: actualProps.lookup.Title || [],
        Gender: actualProps.lookup.Gender || [],
        MaritalStatus: actualProps.lookup.MaritalStatus || [],
        VipType: actualProps.lookup.VipType || [],
        MRNType: actualProps.lookup.MRNType || [],
      });
    }
  }, [actualProps.lookup]);

  // Standalone mode: fetch lookups if not present from AngularJS bridge
  useEffect(() => {
    if (!localLookups.Title.length) {
      const fetchLookups = async () => {
        try {
          const inputData = [
            { Key: 'Title' },
            { Key: 'MaritalStatus' },
            { Key: 'Religion' },
            { Key: 'Nationality' },
            { Key: 'Language' },
            { Key: 'VisaType' },
            { Key: 'VipType' },
            { Key: 'PatientType' },
            { Key: 'Gender' },
            { Key: 'MRNType', Default: false },
          ];
          const res = await apiFetch('General/Options/getoptions', inputData);
          if (res?.Data) {
            setLocalLookups({
              Title: res.Data.Title || [],
              Gender: res.Data.Gender || [],
              MaritalStatus: res.Data.MaritalStatus || [],
              VipType: res.Data.VipType || [],
              MRNType: res.Data.MRNType || [],
            });
          }
        } catch (err) {
          console.error('Failed to load Quick Registration lookups:', err);
        }
      };
      fetchLookups();
    }
  }, [localLookups.Title.length]);

  const dispatch = useCallback(
    (action: string, payload?: any) => {
      if (onAction) {
        onAction(action, payload);
      }
    },
    [onAction]
  );

  const setField = (field: string, value: any) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    dispatch('itemFieldChange', { field, value });
  };

  const handleTitleChange = (val: number | null) => {
    let genderId = item.GenderId;
    const titleObj = localLookups.Title.find((t) => t.Id === val);
    const code = (titleObj?.Code || titleObj?.Text || '').trim().toLowerCase();
    if (val === 10 || val === 37 || code === 'mr' || code === 'mr.' || code === 'master') {
      // 10-Mr, 37-Master -> Male (1)
      genderId = 1;
    } else if (val === 11 || val === 12 || val === 5 || code === 'mrs' || code === 'mrs.' || code === 'ms' || code === 'ms.' || code === 'miss') {
      // 11-Mrs, 12-Ms, 5-Miss -> Female (2)
      genderId = 2;
    }
    setItem((prev) => ({ ...prev, TitleId: val ?? undefined, GenderId: genderId }));
    dispatch('titleChange', { value: val });
  };

  const handleGenderChange = (val: number | null) => {
    setItem((prev) => ({ ...prev, GenderId: val ?? undefined }));
    dispatch('genderChange', { value: val });
  };

  const calculateDOBFromYears = (years: number | string) => {
    if (!years || isNaN(Number(years))) return;
    const y = parseInt(String(years), 10);
    const d = new Date();
    d.setFullYear(d.getFullYear() - y);
    const dobStr = d.toISOString().slice(0, 10);
    setItem((prev) => ({ ...prev, DOB: dobStr, Age: y, IsBirthDateApproximate: true }));
    dispatch('ageChange', { value: y });
  };

  const calculateAgeFromDOB = (dobStr: string) => {
    if (!dobStr) return;
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 0) age = 0;
    setItem((prev) => ({ ...prev, DOB: dobStr, Age: age }));
    dispatch('dobChange', { value: dobStr });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalFilePreview(url);
      dispatch('fileSelected', { file });
    }
  };

  const handleClearImage = () => {
    if (localFilePreview) URL.revokeObjectURL(localFilePreview);
    setLocalFilePreview(null);
    setItem((prev) => ({ ...prev, PhotoPath: undefined, iswebcamphoto: false, webcamphoto: undefined }));
    dispatch('clearimage');
  };

  // Google Places Autocomplete
  useEffect(() => {
    if (!googleEnabled || !googleInputRef.current) return;
    const g = (window as any).google;
    if (!g || !g.maps || !g.maps.places) return;

    const autocomplete = new g.maps.places.Autocomplete(googleInputRef.current, {});
    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;
      const name = place.name || '';
      let address1 = '',
        address2 = '',
        city = '',
        area = '',
        state = '',
        country = '',
        pincode = '';
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
      const addressLine1 = `${name} ${address1} ${address2} ${city}`.trim();
      const addressLine2 = `${area} ${state} ${country} ${pincode}`.trim();

      const fields: Record<string, any> = {
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        PinCodeId: -1,
        Area: '',
        CityId: -1,
        StateId: -1,
        CountryId: -1,
      };

      if (pincode) {
        try {
          const res = await apiFetch('generalmaster/PincodeMaster/GetPincodeMasters', {
            Params: [{ Key: 5, Value: pincode }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          });
          if (res?.Data && res.Data.length > 0) {
            const d = res.Data[0];
            fields.PinCodeId = d.Id;
            fields.Area = d.Area;
            fields.CityId = d.CityId;
            fields.StateId = d.StateId;
            fields.CountryId = d.CountryId;
          }
        } catch (err) {
          console.error('Pincode lookup error:', err);
        }
      }

      setItem((prev) => ({ ...prev, ...fields }));
      dispatch('itemFieldsMerge', { fields });
    });

    return () => {
      if (g.maps?.event && autocomplete) {
        g.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [googleEnabled, dispatch]);

  const toggleGoogleAddress = (checked: boolean) => {
    setGoogleEnabled(checked);
    if (!checked) {
      setGoogleAddressText('');
      const fields = {
        AddressLine1: '',
        AddressLine2: '',
        PinCodeId: -1,
        Area: '',
        CityId: -1,
        StateId: -1,
        CountryId: -1,
      };
      setItem((prev) => ({ ...prev, ...fields }));
      dispatch('itemFieldsMerge', { fields });
    } else {
      setTimeout(() => googleInputRef.current?.focus(), 100);
    }
  };

  // Baby age calculation logic
  const canShowApproxAge = useMemo(() => {
    const titleId = item.TitleId;
    if (!titleId || !localLookups.Title.length) return false;
    const t = localLookups.Title.find((x) => x.Id === titleId);
    if (!t) return false;
    const val = (t.Code || t.Text || '').toLowerCase().replace(/[\s_.-]/g, '');
    return val.includes('baby') || val.includes('infant');
  }, [item.TitleId, localLookups.Title]);

  // Validation errors
  const errors = useMemo(() => {
    const e: Record<string, boolean> = {};
    if (!item.TitleId) e.TitleId = true;
    if (!item.FirstName || !item.FirstName.trim()) e.FirstName = true;
    if (!item.DOB) e.DOB = true;
    if (!item.GenderId) e.GenderId = true;
    if (!item.Mobile || String(item.Mobile).replace(/[^\d]/g, '').length !== 10) e.Mobile = true;
    return e;
  }, [item.TitleId, item.FirstName, item.DOB, item.GenderId, item.Mobile]);

  const isFormValid = Object.keys(errors).length === 0;
  const showErrors = submittedAttempt || !!rawCurrentContext.triedSubmit;
  const fieldError = (key: keyof typeof errors) => (showErrors && errors[key] ? 'Required' : undefined);

  // Patient Search API handler
  const handlePatientSearch = async (query: string) => {
    try {
      const inputData = {
        Params: [
          { Key: 7, Value: 2 },
          { Key: 37, Value: 2 },
          { Key: 1, Value: query },
        ],
        PageContext: { PageSize: 20, PageNumber: 1 },
      };
      const res = await apiFetch('registration/Patient/GetMinPatientSearch', inputData);
      const data = res?.Data || [];
      return data.map((pat: any) => ({
        ...pat,
        PatientName: [pat.FirstName, pat.LastName].filter(Boolean).join(' ') || pat.PatientName,
        TitleDesc: pat.Title?.Description || pat.TitleDesc || '',
        GenderCode: pat.GenderId === 1 ? 'M' : pat.GenderId === 2 ? 'F' : 'U',
      }));
    } catch (err) {
      console.error('Patient search error:', err);
      return [];
    }
  };

  const handlePatientSelect = (pat: any) => {
    if (!pat) return;
    const displayName = [pat.TitleDesc || pat.Title?.Description || '', pat.PatientName || pat.FirstName || '']
      .filter(Boolean)
      .join(' ');
    setPatientSearchDisplay(displayName);
    setItem((prev) => ({
      ...prev,
      ...pat,
      Id: pat.Id,
      PatientId: pat.Id,
    }));
    dispatch('patientSelect', { patient: pat });
    dispatch('itemFieldsMerge', { fields: { PatientId: pat.Id, Id: pat.Id, ...pat } });
  };

  // Intercept Save & Activate or Save to perform friendly instant validation
  const handleSaveAction = (actionName: string) => {
    if (!isFormValid) {
      setSubmittedAttempt(true);
      return;
    }
    dispatch(actionName);
  };

  // Composite action bar & footer props
  const actionBarProps = {
    saveCompleted: item.SaveCompleted || actualProps.actionBar?.saveCompleted || false,
    billCompleted: item.BillCompleted || actualProps.actionBar?.billCompleted || false,
    isPatientDeactivated: item.PatientStatusId === 3 || actualProps.actionBar?.isPatientDeactivated || false,
    isTempPatient: item.MRNTypeId === 1 || actualProps.actionBar?.isTempPatient || false,
    patientStatusId: item.PatientStatusId || 0,
    referredNewVisit: item.ReferredNewVisit || false,
    attachmentCount: rawCurrentContext.attachmentcount || actualProps.actionBar?.attachmentCount || 0,
  };

  const photoSrc = item.iswebcamphoto && item.webcamphoto
    ? `data:image/png;base64,${item.webcamphoto}`
    : localFilePreview
    ? localFilePreview
    : item.PhotoPath && rawCurrentContext.Photo
    ? `data:image/png;base64,${rawCurrentContext.Photo}`
    : 'app/img/main/img.jpg';

  const isExistingPatient = !!(item.Id && item.Id > 0);

  return (
    <div
      className="quick-registration-screen"
      style={{
        fontFamily: typography.fontFamily,
        maxWidth: 1240,
        margin: '0 auto',
        padding: '10px 16px 50px',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .quick-registration-screen {
          font-size: 12px;
        }
        .quick-registration-screen label {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          margin-bottom: 2px !important;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .quick-registration-screen input,
        .quick-registration-screen select {
          height: 30px !important;
          min-height: 30px !important;
          font-size: 12px !important;
          padding: 0 8px !important;
          border-radius: 5px !important;
        }
        .quick-registration-screen select {
          padding-right: 24px !important;
        }
        .quick-registration-screen .quick-field-sm {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 960px) {
          .quick-reg-layout-wrap {
            flex-direction: column !important;
          }
          .quick-reg-photo-panel {
            width: 100% !important;
            flex-direction: row !important;
            justify-content: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Top Header & Integrated Search / Quick Action Bar */}
      <div style={{ marginBottom: spacing.sm }}>
        <PageHeader
          title="Quick Registration"
          subtitle={
            isExistingPatient
              ? `MRN: ${item.MRN || item.Id} | Status: ${item.PatientStatus || 'Active'}`
              : 'Fast-track OPD registration and demographic entry'
          }
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
              <div style={{ width: 260 }}>
                <PatientSearchControl
                  reactProps={{
                    controlId: 'drhms-patinet-search-box',
                    canDisable: false,
                    tabIndex: 1,
                    patientDisplay: patientSearchDisplay,
                    placeholder: 'Search Name/Phone/UHID...',
                  }}
                  onSearch={handlePatientSearch}
                  onSelect={handlePatientSelect}
                />
              </div>
              <RegistrationActionBar reactProps={actionBarProps} onAction={dispatch} />
            </div>
          }
        />
      </div>

      {/* Patient Identity Banner (if a patient is selected) */}
      {isExistingPatient && (
        <div style={{ marginBottom: spacing.sm }}>
          <PatientIdentityBanner
            patientId={item.Id}
            mrn={item.MRN}
            patientName={[item.Title?.Description, item.FirstName, item.LastName].filter(Boolean).join(' ')}
            age={item.Age}
            gender={item.GenderId === 1 ? 'Male' : item.GenderId === 2 ? 'Female' : 'Other'}
            dob={item.DOB ? String(item.DOB).slice(0, 10) : undefined}
            vipStatus={!!item.IsVip}
          />
        </div>
      )}

      {/* Validation Alert */}
      {showErrors && Object.keys(errors).length > 0 && (
        <div style={{ marginBottom: spacing.sm }}>
          <Alert tone="danger">
            Please complete all required fields (<strong>Title</strong>, <strong>Patient Name</strong>,{' '}
            <strong>DOB</strong>, <strong>Gender</strong>, and a valid <strong>10-digit Mobile number</strong>) before saving.
          </Alert>
        </div>
      )}

      {/* Main Demographics Form with Integrated Top-Right Photo Box */}
      <Card padding="12px 16px" style={{ marginBottom: spacing.md }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: '6px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: radii.sm,
                backgroundColor: 'rgba(33, 0, 141, 0.08)',
                color: 'var(--premium-blue, #21008d)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
              }}
            >
              <i className="fa fa-user-plus" />
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
              Patient Demographic Details
            </span>
          </div>
          {item.PatientStatusId && (
            <Badge tone={item.PatientStatusId === 2 ? 'success' : item.PatientStatusId === 3 ? 'danger' : 'neutral'}>
              {item.PatientStatus || (item.PatientStatusId === 2 ? 'Active' : 'Draft')}
            </Badge>
          )}
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'nowrap' }} className="quick-reg-layout-wrap">
          {/* Left: Compact Demographics Form Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="quick-reg-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px 12px',
                alignItems: 'start',
              }}
            >
              {/* MRN Type */}
              <div className="quick-field-sm">
                <Select
                  label="MRN Type"
                  options={localLookups.MRNType.map((x) => ({ value: x.Id, label: x.Text }))}
                  value={item.MRNTypeId ?? ''}
                  disabled={!!item.IsMRNTypeDisable}
                  placeholder="Select"
                  onChange={(value) => setField('MRNTypeId', toIdOrNull(value))}
                />
              </div>

              {/* Title */}
              <div className="quick-field-sm">
                <Select
                  id="title"
                  label="Title"
                  required
                  error={fieldError('TitleId')}
                  options={localLookups.Title.map((t) => ({ value: t.Id, label: t.Text }))}
                  value={item.TitleId ?? ''}
                  placeholder="Select"
                  onChange={(value) => handleTitleChange(toIdOrNull(value))}
                />
              </div>

              {/* Patient Name */}
              <div className="quick-field-sm">
                <Input
                  id="firstname"
                  label="Patient Name"
                  required
                  size="sm"
                  error={fieldError('FirstName')}
                  value={item.FirstName || ''}
                  placeholder="ENTER PATIENT NAME"
                  onChange={(e) => setField('FirstName', e.target.value.toUpperCase())}
                />
              </div>

              {/* Approx Age & Birth Time for Baby */}
              {canShowApproxAge && (
                <div className="quick-field-sm" style={{ gridColumn: 'span 2' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: colors.textMain,
                      marginBottom: '2px',
                      display: 'block',
                      textTransform: 'uppercase',
                    }}
                  >
                    Approx. Age (Baby)
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Input
                      size="sm"
                      placeholder="Days"
                      value={item.ApproxAgeDays ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, '');
                        setField('ApproxAgeDays', val);
                        dispatch('approxDaysChange', { value: val });
                      }}
                    />
                    <Input
                      size="sm"
                      placeholder="Months"
                      value={item.ApproxAgeMonths ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, '');
                        setField('ApproxAgeMonths', val);
                        dispatch('approxMonthsChange', { value: val });
                      }}
                    />
                    <Input
                      size="sm"
                      placeholder="Years"
                      value={item.Age ?? ''}
                      onChange={(e) => calculateDOBFromYears(e.target.value.replace(/[^\d]/g, ''))}
                    />
                  </div>
                </div>
              )}

              {canShowApproxAge && (
                <div className="quick-field-sm">
                  <TimePicker
                    label="Birth Time"
                    value={item.BabyBirthTime || ''}
                    onChange={(value) => setField('BabyBirthTime', value)}
                  />
                </div>
              )}

              {/* DOB */}
              <div className="quick-field-sm">
                <DatePicker
                  label="DOB"
                  required
                  error={fieldError('DOB')}
                  value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
                  onChange={(value) => calculateAgeFromDOB(value)}
                />
              </div>

              {/* Age */}
              <div className="quick-field-sm">
                <Input
                  label="Age (Years)"
                  size="sm"
                  maxLength={3}
                  value={item.Age ?? ''}
                  placeholder="e.g. 28"
                  onChange={(e) => calculateDOBFromYears(e.target.value.replace(/[^\d]/g, ''))}
                />
              </div>

              {/* Gender */}
              <div className="quick-field-sm">
                <Select
                  label="Gender"
                  required
                  error={fieldError('GenderId')}
                  options={localLookups.Gender.map((g) => ({ value: g.Id, label: g.Text }))}
                  value={item.GenderId ?? ''}
                  placeholder="Select"
                  onChange={(value) => handleGenderChange(toIdOrNull(value))}
                />
              </div>

              {/* Mobile */}
              <div className="quick-field-sm">
                <Input
                  id="mobile"
                  label="Mobile Number"
                  required
                  size="sm"
                  error={fieldError('Mobile')}
                  maxLength={10}
                  value={item.Mobile || ''}
                  placeholder="10-digit mobile"
                  onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))}
                />
              </div>

              {/* Marital Status */}
              <div className="quick-field-sm">
                <Select
                  label="Marital Status"
                  options={localLookups.MaritalStatus.map((x) => ({ value: x.Id, label: x.Text }))}
                  value={item.MaritalStatusId ?? ''}
                  placeholder="Select"
                  onChange={(value) => setField('MaritalStatusId', toIdOrNull(value))}
                />
              </div>

              {/* Nationality ID */}
              <div className="quick-field-sm">
                <Input
                  label="Nationality ID"
                  size="sm"
                  value={item.NationalityIdentifier || ''}
                  placeholder="Passport / National ID"
                  onChange={(e) => setField('NationalityIdentifier', e.target.value)}
                />
              </div>

              {/* Google Places Search */}
              <div className="quick-field-sm" style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    id="googleaddopt"
                    ref={googleInputRef}
                    size="sm"
                    label="Search Address (Google)"
                    disabled={!googleEnabled}
                    value={googleAddressText}
                    onChange={(e) => setGoogleAddressText(e.target.value)}
                    placeholder="Start typing an address..."
                  />
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <Checkbox label="Use" checked={googleEnabled} onChange={(checked) => toggleGoogleAddress(checked)} />
                </div>
              </div>

              {/* Address Line */}
              <div className="quick-field-sm">
                <Input
                  id="Manualadd"
                  label="Address"
                  size="sm"
                  value={item.AddressLine1 || ''}
                  disabled={!!item.candisable}
                  placeholder="Street, locality, city"
                  onChange={(e) => setField('AddressLine1', e.target.value)}
                />
              </div>

              {/* Flags & VIP Type */}
              <div className="quick-field-sm" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px' }}>
                  <Checkbox label="MLC" checked={!!item.IsMLC} onChange={(checked) => setField('IsMLC', checked)} />
                  <Checkbox label="VIP" checked={!!item.IsVip} onChange={(checked) => setField('IsVip', checked)} />
                </div>
                {item.IsVip && (
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <Select
                      label="VIP Type"
                      options={localLookups.VipType.map((x) => ({ value: x.Id, label: x.Text }))}
                      value={item.VipTypeId ?? ''}
                      placeholder="Select VIP Type"
                      onChange={(value) => setField('VipTypeId', toIdOrNull(value))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Top-Right Photo Upload Panel */}
          <div
            className="quick-reg-photo-panel"
            style={{
              width: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <i className="fa fa-camera" style={{ color: 'var(--premium-blue, #21008d)', fontSize: '11px' }} />
              <span>Photo</span>
            </div>

            <div
              style={{
                width: '84px',
                height: '84px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                }}
                title="Upload Photo"
              >
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <i className="fa fa-upload" style={{ color: 'var(--premium-blue, #21008d)', fontSize: '11px' }} />
                <span>Upload</span>
              </label>

              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => dispatch('openWebCam')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    padding: '4px 6px',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Capture from Web Camera"
                >
                  <i className="fa fa-camera" style={{ fontSize: '10px' }} />
                  <span>Webcam</span>
                </button>

                {(localFilePreview || item.PhotoPath || item.iswebcamphoto) && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={{
                      padding: '4px 7px',
                      borderRadius: '5px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Remove Photo"
                  >
                    <i className="fa fa-trash" style={{ fontSize: '10px' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Action Bar - ONLY Clean Quick Registration Actions */}
      <div
        className="quick-reg-footer"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: colors.surface,
          borderTop: '2px solid var(--premium-blue, #21008d)',
          boxShadow: '0 -3px 12px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          marginTop: spacing.sm,
          boxSizing: 'border-box',
          borderRadius: radii.sm,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <Button
            variant="light"
            size="sm"
            icon="fa-undo"
            onClick={() => dispatch('addNewQuick')}
            title="Reset form"
            style={{ fontSize: '12px', height: '30px' }}
          >
            Reset Form
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {actualProps.footer?.canShowSaveBtn && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleSaveAction('save')}
              style={{ fontWeight: 600, padding: '5px 12px', fontSize: '12px', height: '30px' }}
            >
              Save Draft
            </Button>
          )}

          <Button
            variant="success"
            size="sm"
            disabled={!isFormValid || rawCurrentContext.canDisableApprove}
            onClick={() => handleSaveAction('saveAndApprove')}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontWeight: 700,
              padding: '6px 18px',
              fontSize: '13px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
            }}
          >
            Save &amp; Activate
          </Button>
        </div>
      </div>
    </div>
  );
};
