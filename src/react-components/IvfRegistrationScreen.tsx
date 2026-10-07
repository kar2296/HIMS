import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Badge } from '../components/ui/Badge';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

const ADDRESS_FIELD_MAP: Record<string, string> = {
  countryid: 'CountryId',
  country: 'Country',
  stateid: 'StateId',
  state: 'State',
  districtid: 'DistrictId',
  district: 'District',
  cityid: 'CityId',
  city: 'City',
  area: 'Area',
  areaid: 'WardId',
  pincodeid: 'PinCodeId',
};

function mapAddressUpdate(u: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  Object.keys(u).forEach((k) => {
    const mapped = ADDRESS_FIELD_MAP[k];
    if (mapped) fields[mapped] = u[k];
  });
  return fields;
}

export interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
}

export interface Lookups {
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

export interface IvfRegistrationScreenProps {
  reactProps?: {
    item?: Record<string, any>;
    lookup?: Lookups;
    currentcontext?: {
      id?: number;
      attachmentcount?: number;
      canDisableApprove?: boolean;
      isTempPatient?: boolean;
      showfocus?: boolean;
      triedSubmit?: boolean;
      Photo?: string;
      file?: any;
    };
    flags?: {
      CanShowDeceased?: boolean;
      isPatientDeactivated?: boolean;
      EnableOPD?: boolean;
      Visitprint?: boolean;
      Vitals?: boolean;
      canShowPatientBanner?: boolean;
      adrsmandatory?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IvfRegistrationScreen: React.FC<IvfRegistrationScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {}, currentcontext = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const setField = (field: string, value: any) => dispatch('itemFieldChange', { field, value });

  // Ensure IsIvfRegistration defaults to true for IVF registration
  useEffect(() => {
    if (item.IsIvfRegistration === undefined) {
      setField('IsIvfRegistration', true);
    }
  }, [item.IsIvfRegistration]);

  const [approxAgeMode, setApproxAgeMode] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleAddressText, setGoogleAddressText] = useState('');
  const googleInputRef = useRef<HTMLInputElement>(null);

  const photoSrc = useMemo(() => {
    if (currentcontext.file && typeof currentcontext.file === 'object') {
      try {
        return URL.createObjectURL(currentcontext.file);
      } catch (e) {
        // Fallback
      }
    }
    if (currentcontext.Photo) {
      return `data:image/png;base64,${currentcontext.Photo}`;
    }
    if (item.PhotoPath) {
      return `data:image/png;base64,${item.PhotoPath}`;
    }
    return item.GenderId === 2 ? 'app/img/main/no-img-female.png' : 'app/img/main/img.jpg';
  }, [currentcontext.file, currentcontext.Photo, item.PhotoPath, item.GenderId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      dispatch('fileSelected', { file });
    }
  };

  const toInputDate = (d?: string | Date | null): string => {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const groupLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textBody,
    marginBottom: spacing.xs,
    display: 'block',
  };

  return (
    <div
      className="ivf-registration-screen"
      style={{
        fontFamily: typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        color: colors.textMain,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: PATIENT INFORMATION
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="20px"
        style={{
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: spacing.sm,
            marginBottom: spacing.md,
            borderBottom: `1px solid ${colors.surfaceSunken}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-user-circle" style={{ color: 'var(--hims-primary, #2563eb)', fontSize: '15px' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
              Patient Information
            </h3>
            <Badge tone="info">IVF</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <span style={{ fontSize: '12px', color: colors.textSubtle }}>Age Mode:</span>
            <Button
              size="xs"
              variant={!approxAgeMode ? 'primary' : 'light'}
              onClick={() => setApproxAgeMode(false)}
            >
              Exact DOB
            </Button>
            <Button
              size="xs"
              variant={approxAgeMode ? 'primary' : 'light'}
              onClick={() => setApproxAgeMode(true)}
            >
              Approx Age
            </Button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px 18px',
          }}
        >
          {/* MRN Type */}
          <div>
            <Select
              label="MRN Type"
              value={item.MRNTypeId ?? ''}
              disabled={item.IsMRNTypeDisable}
              options={(lookup.MRNType || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('MRNTypeId', val)}
            />
          </div>

          {/* Title */}
          <div>
            <Select
              label="Title"
              required
              value={item.TitleId ?? ''}
              options={(lookup.Title || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => dispatch('titleChange', { value: val })}
            />
          </div>

          {/* First Name */}
          <div>
            <Input
              label="First Name"
              required
              value={item.FirstName || ''}
              placeholder="Enter first name"
              onChange={(e) => setField('FirstName', e.target.value.toUpperCase())}
            />
          </div>

          {/* Last Name */}
          <div>
            <Input
              label="Last Name"
              required
              value={item.LastName || ''}
              placeholder="Enter last name"
              onChange={(e) => setField('LastName', e.target.value.toUpperCase())}
            />
          </div>

          {/* Gender */}
          <div>
            <Select
              label="Gender"
              required
              value={item.GenderId ?? ''}
              options={(lookup.Gender || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('GenderId', val)}
            />
          </div>

          {/* Spouse Type */}
          <div>
            <Select
              label="Spouse Type"
              value={item.GuardianTypeId ?? ''}
              options={(lookup.GuardianType || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('GuardianTypeId', val)}
            />
          </div>

          {/* Spouse Name */}
          <div>
            <Input
              label="Spouse Name"
              value={item.GuardianName || ''}
              placeholder="Enter spouse name"
              onChange={(e) => setField('GuardianName', e.target.value.toUpperCase())}
            />
          </div>

          {/* Is IVF Register Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px' }}>
            <Checkbox
              label="Is IVF Registration"
              checked={!!item.IsIvfRegistration}
              onChange={(checked) => setField('IsIvfRegistration', checked)}
            />
          </div>

          {/* DOB / Age */}
          {!approxAgeMode ? (
            <>
              <div>
                <DatePicker
                  label="Date of Birth (DOB)"
                  required
                  value={toInputDate(item.DOB)}
                  onChange={(val) => dispatch('dobChange', { value: val })}
                />
              </div>
              <div>
                <Input
                  label="Age (Years)"
                  maxLength={3}
                  value={item.Age ?? ''}
                  placeholder="Yrs"
                  onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <Input
                  label="Days"
                  value={item.ApproxAgeDays ?? ''}
                  placeholder="D"
                  onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value.replace(/[^\d]/g, '') })}
                />
                <Input
                  label="Months"
                  value={item.ApproxAgeMonths ?? ''}
                  placeholder="M"
                  onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value.replace(/[^\d]/g, '') })}
                />
                <Input
                  label="Years"
                  value={item.Age ?? ''}
                  placeholder="Y"
                  onChange={(e) => dispatch('ageYearsChange', { value: e.target.value.replace(/[^\d]/g, '') })}
                />
              </div>
              <div>
                <TimePicker
                  label="Birth Time"
                  value={item.BabyBirthTime || ''}
                  onChange={(val) => setField('BabyBirthTime', val)}
                />
              </div>
            </>
          )}

          {/* Mobile */}
          <div>
            <Input
              label="Mobile Number"
              required
              maxLength={10}
              value={item.Mobile || ''}
              placeholder="10-digit mobile"
              onChange={(e) => setField('Mobile', e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>

          {/* Marital Status */}
          <div>
            <Select
              label="Marital Status"
              required
              value={item.MaritalStatusId ?? ''}
              options={(lookup.MaritalStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('MaritalStatusId', val)}
            />
          </div>

          {/* Religion */}
          <div>
            <Select
              label="Religion"
              value={item.ReligionId ?? ''}
              options={(lookup.Religion || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('ReligionId', val)}
            />
          </div>

          {/* Nationality */}
          <div>
            <Select
              label="Nationality"
              required
              value={item.NationalityId ?? ''}
              options={(lookup.Nationality || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('NationalityId', val)}
            />
          </div>

          {/* Nationality ID */}
          <div>
            <Input
              label="National ID / Aadhaar"
              value={item.NationalityIdentifier || ''}
              placeholder="ID number"
              onChange={(e) => setField('NationalityIdentifier', e.target.value)}
            />
          </div>

          {/* Passport */}
          <div>
            <Input
              label="Passport Number"
              value={item.PasspostNumber || ''}
              placeholder="Passport #"
              onChange={(e) => setField('PasspostNumber', e.target.value.toUpperCase())}
            />
          </div>

          {/* Blood Group */}
          <div>
            <Select
              label="Blood Group"
              value={item.BloodGroupId ?? ''}
              options={(lookup.BloodGroup || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('BloodGroupId', val)}
            />
          </div>

          {/* Referral Type */}
          <div>
            <Select
              label="Referral Type"
              value={item.ReferTypeId ?? ''}
              options={(lookup.ReferralType || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => dispatch('referTypeChange', { value: val })}
            />
          </div>

          {/* Referral Doctor */}
          <div>
            <Select
              label="Referral Doctor"
              value={item.ReferrerId ?? ''}
              options={(lookup.Referral || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => dispatch('referrerChange', { value: val })}
            />
          </div>

          {/* Remarks */}
          <div>
            <Select
              label="Remarks / Reason"
              value={item.RemarkId ?? ''}
              options={(lookup.Remark || []).map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(val) => setField('RemarkId', val)}
            />
          </div>

          {/* Landline */}
          <div>
            <Input
              label="Landline"
              maxLength={10}
              value={item.LandLine || ''}
              placeholder="Landline #"
              onChange={(e) => setField('LandLine', e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email Address"
              type="email"
              value={item.Email || ''}
              placeholder="patient@example.com"
              onChange={(e) => setField('Email', e.target.value)}
            />
          </div>

          {/* Is Insurance */}
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px' }}>
            <Checkbox
              label="Insurance Patient"
              checked={!!item.IsInsurance}
              onChange={(checked) => setField('IsInsurance', checked)}
            />
          </div>

          {/* Patient Associate (if Couple or Recipient) */}
          {(item.IsCouple || item.IsRecipient) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing.xs }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Associated Patient"
                  value={item.PatientAssociate || ''}
                  disabled
                  placeholder="Selected Partner"
                />
              </div>
              <Button
                variant="light"
                size="sm"
                icon="fa-search-plus"
                onClick={() => dispatch('findPatient')}
                title="Find Associated Patient"
              />
            </div>
          )}
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ADDRESS INFORMATION
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="20px"
        style={{
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: spacing.sm,
            marginBottom: spacing.md,
            borderBottom: `1px solid ${colors.surfaceSunken}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-map-marker" style={{ color: 'var(--hims-primary, #2563eb)', fontSize: '15px' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
              Address Details
            </h3>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px 18px',
          }}
        >
          {/* Address Line 1 */}
          <div>
            <Input
              label="Address Line 1"
              value={item.AddressLine1 || ''}
              placeholder="Door No, Street"
              onChange={(e) => setField('AddressLine1', e.target.value)}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <Input
              label="Address Line 2"
              value={item.AddressLine2 || ''}
              placeholder="Area, Landmark"
              onChange={(e) => setField('AddressLine2', e.target.value)}
            />
          </div>

          {/* Country */}
          <div>
            <label style={groupLabelStyle}>Country</label>
            <CountryControl
              countryid={item.CountryId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapAddressUpdate(u) })}
            />
          </div>

          {/* State */}
          <div>
            <label style={groupLabelStyle}>State</label>
            <StateControl
              stateid={item.StateId}
              countryid={item.CountryId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapAddressUpdate(u) })}
            />
          </div>

          {/* District */}
          <div>
            <label style={groupLabelStyle}>District</label>
            <DistrictControl
              districtid={item.DistrictId}
              countryid={item.CountryId}
              stateid={item.StateId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapAddressUpdate(u) })}
            />
          </div>

          {/* City */}
          <div>
            <label style={groupLabelStyle}>City / Municipality</label>
            <CityControl
              cityid={item.CityId}
              countryid={item.CountryId}
              stateid={item.StateId}
              districtid={item.DistrictId}
              onUpdate={(u) => dispatch('itemFieldsMerge', { fields: mapAddressUpdate(u) })}
            />
          </div>

          {/* Area / Ward */}
          <div>
            <Input
              label="Area / Ward"
              value={item.Area || ''}
              placeholder="Area name"
              onChange={(e) => setField('Area', e.target.value)}
            />
          </div>

          {/* Pincode */}
          <div>
            <Input
              label="Pincode"
              maxLength={6}
              value={item.Pincode || ''}
              placeholder="6-digit pincode"
              onChange={(e) => setField('Pincode', e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>

          {/* Google Places Search */}
          <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'flex-end', gridColumn: 'span 2' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Search Address (Google Places)"
                disabled={!googleEnabled}
                value={googleAddressText}
                onChange={(e) => setGoogleAddressText(e.target.value)}
                placeholder="Start typing location..."
              />
            </div>
            <div style={{ paddingBottom: '6px' }}>
              <Checkbox
                label="Enable Search"
                checked={googleEnabled}
                onChange={(c) => setGoogleEnabled(c)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: PHOTO & UPLOAD PREVIEW
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="20px"
        style={{
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            paddingBottom: spacing.sm,
            marginBottom: spacing.md,
            borderBottom: `1px solid ${colors.surfaceSunken}`,
          }}
        >
          <i className="fa fa-camera" style={{ color: 'var(--hims-primary, #2563eb)', fontSize: '15px' }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
            Photo & Image Capture
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: radii.full,
              overflow: 'hidden',
              border: `2px solid ${colors.border}`,
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.sm,
              flexShrink: 0,
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  color: colors.textMain,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: shadows.xs,
                  margin: 0,
                }}
              >
                <i className="fa fa-upload" style={{ color: 'var(--hims-primary, #2563eb)' }} />
                <span>Upload Photo</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </label>

              <Button
                size="sm"
                variant="light"
                icon="fa-camera"
                onClick={() => dispatch('openWebCam')}
                title="Capture with Webcam"
              >
                Webcam
              </Button>

              <Button
                size="sm"
                variant="light"
                icon="fa-trash-o"
                onClick={() => dispatch('clearimage')}
                title="Remove photo"
              >
                Remove
              </Button>
            </div>
            <span style={{ fontSize: '11px', color: colors.textSubtle }}>
              Supported formats: JPEG, PNG, WebP (max 10MB)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
