import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './utils/api';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface FacilityItem {
  Id?: number;
  FacilityId?: number;
  FacilityCode?: string;
  FacilityName?: string;
  OrganizationId?: number;
  FacilityTypeId?: number;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  WardId?: number;
  CountryId?: number;
  Country?: string;
  StateId?: number;
  State?: string;
  DistrictId?: number;
  District?: string;
  CityId?: number;
  City?: string;
  PinCodeId?: number;
  PinCode?: string;
  Pincode?: string;
  LandLine?: string;
  Mobile?: string;
  FaxNo?: string;
  Email?: string;
  LicenseExpiryDate?: string;
  SeniorCitizenDiscount?: string | number;
  PAN?: string;
  TAXPlayerUserName?: string;
  TAXPlayerPassword?: string;
  DefaultPwd?: string;
  MaxFailedLoginAttempts?: number;
  IsActive?: boolean;
  IsConvertionQtyEdit?: boolean;
  IsPurchaseReturnEditable?: boolean;
  IsLabCentre?: boolean;
  IsItemCodeEdit?: boolean;
  IsMedicineCentre?: boolean;
  IsMultipleDiscount?: boolean;
  IsItemmasterDrugshow?: boolean;
  IsVAT?: boolean;
  IsShowItemType?: boolean;
  IsDoctorShare?: boolean;
  IsAdmissionDate?: boolean;
  IsSwosthaIntegration?: boolean;
  SwosthaURI?: string;
  SwosthaKey?: string;
  IsAddressSearch?: boolean;
  IsAlternateMobileMandatory?: boolean;
  IsAlternateEmailMandatory?: boolean;
  IsDueBill?: boolean;
  IsPincodeFreeText?: boolean;
  IsWardRoomEditable?: boolean;
  IsDeptWiseLabPrint?: boolean;
  ShowAliasInfo?: boolean;
  ShowMrp?: boolean;
  Showwithheadeprint?: boolean;
  Showwithoutheadeprint?: boolean;
  IsCashPatientEmrIndent?: boolean;
  IsDirectLabSync?: boolean;
  IsPharmacybasedonStore?: boolean;
  IsItemExactSearch?: boolean;
  LogoPath?: string;
  SecondLogoPath?: string;
  [key: string]: any;
}

export interface FacilityFormScreenProps {
  reactProps?: {
    item?: FacilityItem;
    lookup?: {
      FacilityType?: Array<{ Id: number; Text: string }>;
      Organization?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    facilityId?: number;
    logoBase64?: string;
    isSaving?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const FacilityFormScreen: React.FC<FacilityFormScreenProps> = ({ reactProps, onAction }) => {
  const initialId = reactProps?.facilityId ?? reactProps?.item?.Id ?? 0;

  const [formData, setFormData] = useState<FacilityItem>(() => ({
    IsActive: true,
    CountryId: 1,
    ...reactProps?.item
  }));

  const [lookups, setLookups] = useState<{
    FacilityType: Array<{ Id: number; Text: string }>;
    Organization: Array<{ Id: number; Text: string }>;
  }>({
    FacilityType: reactProps?.lookup?.FacilityType || [],
    Organization: reactProps?.lookup?.Organization || []
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    reactProps?.logoBase64 ? `data:image/png;base64,${reactProps.logoBase64}` : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync props if provided
  useEffect(() => {
    if (reactProps?.item) {
      setFormData(prev => ({ ...prev, ...reactProps.item }));
    }
    if (reactProps?.lookup) {
      setLookups({
        FacilityType: reactProps.lookup.FacilityType || [],
        Organization: reactProps.lookup.Organization || []
      });
    }
    if (reactProps?.logoBase64) {
      setLogoPreview(`data:image/png;base64,${reactProps.logoBase64}`);
    }
  }, [reactProps]);

  // Initial load if running standalone or id changed
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        // Load lookups if missing
        if (!lookups.FacilityType.length || !lookups.Organization.length) {
          const lookupRes = await apiFetch('General/Options/getoptions', [
            { Key: 'FacilityType' },
            { Key: 'Language' },
            { Key: 'Organization' },
            { Key: 'Pincode' },
            { Key: 'City' },
            { Key: 'State' },
            { Key: 'Country' }
          ]);
          if (isMounted && lookupRes) {
            setLookups({
              FacilityType: lookupRes.FacilityType || [],
              Organization: lookupRes.Organization || []
            });
          }
        }

        // Load facility item if editing
        if (initialId > 0 && (!formData.FacilityCode || !formData.FacilityName)) {
          const itemRes = await apiFetch('SystemSettings/facility/GetFacilityById', { Id: initialId });
          if (isMounted && itemRes) {
            setFormData(prev => ({ ...prev, ...itemRes }));

            // Load Logo
            if (itemRes.LogoPath) {
              try {
                const logoRes = await apiFetch('SystemSettings/facility/GetFacilityLogo', {
                  Data: { Id: itemRes.Id, LogoPath: itemRes.LogoPath }
                });
                if (isMounted && logoRes?.Logo) {
                  setLogoPreview(`data:image/png;base64,${logoRes.Logo}`);
                }
              } catch (e) {
                console.warn('Could not fetch logo', e);
              }
            }

            // Load Preferences
            try {
              const prefRes = await apiFetch('SystemSettings/FacilityPreference/GetFacilityPreferences', {
                Params: [
                  { Key: 1, Value: 'general' },
                  { Key: 3, Value: itemRes.FacilityId || itemRes.Id },
                  { Key: 2, Value: ['directlabsync', 'pharseqbasedonstore', 'itemexactsearch'] }
                ],
                PageContext: { PageSize: 500, PageNumber: 1 }
              });
              if (isMounted && prefRes?.Data) {
                const prefs: any = {};
                for (const p of prefRes.Data) {
                  if (p.PreferenceKey === 'directlabsync') prefs.IsDirectLabSync = parseInt(p.PreferenceValue) === 1;
                  if (p.PreferenceKey === 'pharseqbasedonstore') prefs.IsPharmacybasedonStore = parseInt(p.PreferenceValue) === 1;
                  if (p.PreferenceKey === 'itemexactsearch') prefs.IsItemExactSearch = parseInt(p.PreferenceValue) === 1;
                }
                setFormData(prev => ({ ...prev, ...prefs }));
              }
            } catch (e) {
              console.warn('Could not fetch preferences', e);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize facility form', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [initialId]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    dispatch('fieldChange', { [field]: value });
  };

  const handleAddressUpdate = (updates: Record<string, any>) => {
    setFormData(prev => {
      const next: any = { ...prev };
      if (updates.countryid !== undefined) next.CountryId = updates.countryid === -1 ? null : updates.countryid;
      if (updates.country !== undefined) next.Country = updates.country;
      if (updates.stateid !== undefined) next.StateId = updates.stateid === -1 ? null : updates.stateid;
      if (updates.state !== undefined) next.State = updates.state;
      if (updates.districtid !== undefined) next.DistrictId = updates.districtid === -1 ? null : updates.districtid;
      if (updates.district !== undefined) next.District = updates.district;
      if (updates.cityid !== undefined) next.CityId = updates.cityid === -1 ? null : updates.cityid;
      if (updates.city !== undefined) next.City = updates.city;
      if (updates.areaid !== undefined) next.WardId = updates.areaid === -1 ? null : updates.areaid;
      if (updates.area !== undefined) next.Area = updates.area;
      if (updates.pincodeid !== undefined) next.PinCodeId = updates.pincodeid === -1 ? null : updates.pincodeid;
      if (updates.pincode !== undefined) {
        next.PinCode = updates.pincode;
        next.Pincode = updates.pincode;
      }
      return next;
    });
    dispatch('onAddressUpdate', updates);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      dispatch('onLogoUpload', { file });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.FacilityCode?.trim()) errs.FacilityCode = 'Facility code is required';
    if (!formData.FacilityName?.trim()) errs.FacilityName = 'Facility name is required';
    if (!formData.OrganizationId) errs.OrganizationId = 'Organization is required';
    if (!formData.FacilityTypeId) errs.FacilityTypeId = 'Facility type is required';
    if (!formData.LandLine?.trim()) errs.LandLine = 'Landline / Phone is required';
    if (!formData.LicenseExpiryDate) errs.LicenseExpiryDate = 'License expiry date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (isApprove = false) => {
    if (!validate()) return;

    if (onAction) {
      dispatch(isApprove ? 'saveAndApprove' : 'saveItem', { item: formData, file: selectedFile });
      return;
    }

    // Standalone fallback
    setSaving(true);
    try {
      const isUpdate = (formData.Id || initialId) > 0;
      const actionName = isUpdate ? 'SystemSettings/Facility/UpdateFacility' : 'SystemSettings/Facility/AddFacility';
      await apiFetch(actionName, { Data: formData, file: selectedFile });
      dispatch('backToList');
    } catch (err) {
      console.error('Failed to save facility', err);
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    radii: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.textMain,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: `1px solid ${colors.border}`
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textBody,
    marginBottom: 4
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: `1px solid ${colors.border}`,
    radii: radii.md,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: typography.fontFamily,
    transition: 'border-color 0.15s ease'
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '12px',
    fontWeight: 500,
    color: colors.textBody,
    cursor: 'pointer',
    userSelect: 'none'
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
        <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary }} />
        <div style={{ marginTop: spacing.sm, fontSize: 13 }}>Loading facility information...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textBody }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

        {/* 1. Basic Information */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-info-circle" style={{ color: colors.primary }} />
            <span>Basic Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.md }}>
            <div>
              <label style={labelStyle}>
                Facility Code <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: errors.FacilityCode ? '#ef4444' : colors.border }}
                value={formData.FacilityCode || ''}
                onChange={(e) => handleFieldChange('FacilityCode', e.target.value)}
                placeholder="e.g. FAC01"
              />
              {errors.FacilityCode && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.FacilityCode}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Facility Name <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: errors.FacilityName ? '#ef4444' : colors.border }}
                value={formData.FacilityName || ''}
                onChange={(e) => handleFieldChange('FacilityName', e.target.value)}
                placeholder="e.g. City General Hospital"
              />
              {errors.FacilityName && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.FacilityName}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Organization <span style={{ color: colors.gold }}>*</span>
              </label>
              <select
                style={{ ...inputStyle, borderColor: errors.OrganizationId ? '#ef4444' : colors.border, background: '#fff' }}
                value={formData.OrganizationId || ''}
                onChange={(e) => handleFieldChange('OrganizationId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              >
                <option value="">Select Organization</option>
                {lookups.Organization.map((org) => (
                  <option key={org.Id} value={org.Id}>{org.Text}</option>
                ))}
              </select>
              {errors.OrganizationId && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.OrganizationId}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Facility Type <span style={{ color: colors.gold }}>*</span>
              </label>
              <select
                style={{ ...inputStyle, borderColor: errors.FacilityTypeId ? '#ef4444' : colors.border, background: '#fff' }}
                value={formData.FacilityTypeId || ''}
                onChange={(e) => handleFieldChange('FacilityTypeId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              >
                <option value="">Select Facility Type</option>
                {lookups.FacilityType.map((ft) => (
                  <option key={ft.Id} value={ft.Id}>{ft.Text}</option>
                ))}
              </select>
              {errors.FacilityTypeId && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.FacilityTypeId}</div>}
            </div>
          </div>
        </div>

        {/* 2. Address Details */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-map-marker" style={{ color: colors.primary }} />
            <span>Address & Location</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Address Line 1</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.AddressLine1 || ''}
                onChange={(e) => handleFieldChange('AddressLine1', e.target.value)}
                placeholder="Street address, building, premises"
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Address Line 2</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.AddressLine2 || ''}
                onChange={(e) => handleFieldChange('AddressLine2', e.target.value)}
                placeholder="Apartment, suite, unit, etc."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
            <div>
              <label style={labelStyle}>Country</label>
              <CountryControl
                countryid={formData.CountryId}
                onUpdate={handleAddressUpdate}
              />
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <StateControl
                countryid={formData.CountryId}
                stateid={formData.StateId}
                onUpdate={handleAddressUpdate}
              />
            </div>

            <div>
              <label style={labelStyle}>District</label>
              <DistrictControl
                countryid={formData.CountryId}
                stateid={formData.StateId}
                districtid={formData.DistrictId}
                onUpdate={handleAddressUpdate}
              />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <CityControl
                countryid={formData.CountryId}
                stateid={formData.StateId}
                districtid={formData.DistrictId}
                cityid={formData.CityId}
                onUpdate={handleAddressUpdate}
              />
            </div>

            <div>
              <label style={labelStyle}>Area / Ward</label>
              <AreaControl
                countryid={formData.CountryId}
                stateid={formData.StateId}
                districtid={formData.DistrictId}
                cityid={formData.CityId}
                areaid={formData.WardId}
                pincode={formData.IsPincodeFreeText ? 'freetext' : formData.PinCode}
                onUpdate={handleAddressUpdate}
              />
            </div>

            <div>
              <label style={labelStyle}>Pincode / Postal Code</label>
              {formData.IsPincodeFreeText ? (
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.Pincode || formData.PinCode || ''}
                  onChange={(e) => handleFieldChange('Pincode', e.target.value)}
                  placeholder="Enter postal code"
                />
              ) : (
                <PincodeControl
                  countryid={formData.CountryId}
                  stateid={formData.StateId}
                  districtid={formData.DistrictId}
                  cityid={formData.CityId}
                  pincodeid={formData.PinCodeId}
                  pincode={formData.PinCode}
                  onUpdate={handleAddressUpdate}
                />
              )}
            </div>
          </div>
        </div>

        {/* 3. Contact & Credentials */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-phone" style={{ color: colors.primary }} />
            <span>Contact Information & Credentials</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
            <div>
              <label style={labelStyle}>
                LandLine / Phone <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: errors.LandLine ? '#ef4444' : colors.border }}
                value={formData.LandLine || ''}
                onChange={(e) => handleFieldChange('LandLine', e.target.value.replace(/\D/g, ''))}
                placeholder="Primary contact phone"
              />
              {errors.LandLine && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.LandLine}</div>}
            </div>

            <div>
              <label style={labelStyle}>Mobile (10 digits)</label>
              <input
                type="text"
                maxLength={10}
                style={inputStyle}
                value={formData.Mobile || ''}
                onChange={(e) => handleFieldChange('Mobile', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
              />
            </div>

            <div>
              <label style={labelStyle}>Fax No</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.FaxNo || ''}
                onChange={(e) => handleFieldChange('FaxNo', e.target.value)}
                placeholder="Fax number"
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={formData.Email || ''}
                onChange={(e) => handleFieldChange('Email', e.target.value)}
                placeholder="hospital@example.com"
              />
            </div>

            <div>
              <label style={labelStyle}>
                License Expiry Date <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="date"
                style={{ ...inputStyle, borderColor: errors.LicenseExpiryDate ? '#ef4444' : colors.border }}
                value={formData.LicenseExpiryDate ? formData.LicenseExpiryDate.substring(0, 10) : ''}
                onChange={(e) => handleFieldChange('LicenseExpiryDate', e.target.value)}
              />
              {errors.LicenseExpiryDate && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.LicenseExpiryDate}</div>}
            </div>

            <div>
              <label style={labelStyle}>Senior Citizen Discount (%)</label>
              <input
                type="text"
                maxLength={2}
                style={inputStyle}
                value={formData.SeniorCitizenDiscount || ''}
                onChange={(e) => handleFieldChange('SeniorCitizenDiscount', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 10"
              />
            </div>

            <div>
              <label style={labelStyle}>PAN</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.PAN || ''}
                onChange={(e) => handleFieldChange('PAN', e.target.value)}
                placeholder="PAN Number"
              />
            </div>

            <div>
              <label style={labelStyle}>Taxpayer Username</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.TAXPlayerUserName || ''}
                onChange={(e) => handleFieldChange('TAXPlayerUserName', e.target.value)}
                placeholder="Tax user name"
              />
            </div>

            <div>
              <label style={labelStyle}>Taxpayer Password</label>
              <input
                type="password"
                style={inputStyle}
                value={formData.TAXPlayerPassword || ''}
                onChange={(e) => handleFieldChange('TAXPlayerPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={labelStyle}>Default Password</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.DefaultPwd || ''}
                onChange={(e) => handleFieldChange('DefaultPwd', e.target.value)}
                placeholder="User initial password"
              />
            </div>

            <div>
              <label style={labelStyle}>Max Failed Login Attempts</label>
              <input
                type="number"
                style={inputStyle}
                value={formData.MaxFailedLoginAttempts ?? 10}
                onChange={(e) => handleFieldChange('MaxFailedLoginAttempts', parseInt(e.target.value, 10))}
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* 4. Swostha Integration */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-plug" style={{ color: colors.primary }} />
            <span>Swostha Integration</span>
          </div>

          <div style={{ marginBottom: spacing.md }}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsSwosthaIntegration}
                onChange={(e) => handleFieldChange('IsSwosthaIntegration', e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Enable Swostha Integration</span>
            </label>
          </div>

          {formData.IsSwosthaIntegration && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing.md }}>
              <div>
                <label style={labelStyle}>Swostha URI</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.SwosthaURI || ''}
                  onChange={(e) => handleFieldChange('SwosthaURI', e.target.value)}
                  placeholder="https://api.swostha.gov..."
                />
              </div>

              <div>
                <label style={labelStyle}>Swostha Secret Key</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.SwosthaKey || ''}
                  onChange={(e) => handleFieldChange('SwosthaKey', e.target.value)}
                  placeholder="Secret access key"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. System & Operational Flags */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-sliders" style={{ color: colors.primary }} />
            <span>System & Workflow Configuration</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '12px 16px',
              padding: `${spacing.xs} 0`
            }}
          >
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={formData.IsActive ?? true}
                onChange={(e) => handleFieldChange('IsActive', e.target.checked)}
              />
              <span>Active Facility</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsConvertionQtyEdit}
                onChange={(e) => handleFieldChange('IsConvertionQtyEdit', e.target.checked)}
              />
              <span>Conversion Qty Edit</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsPurchaseReturnEditable}
                onChange={(e) => handleFieldChange('IsPurchaseReturnEditable', e.target.checked)}
              />
              <span>Purchase Return Edit</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsLabCentre}
                onChange={(e) => handleFieldChange('IsLabCentre', e.target.checked)}
              />
              <span>Is Lab Center</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsItemCodeEdit}
                onChange={(e) => handleFieldChange('IsItemCodeEdit', e.target.checked)}
              />
              <span>Is Item Code Edit</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsMedicineCentre}
                onChange={(e) => handleFieldChange('IsMedicineCentre', e.target.checked)}
              />
              <span>Is Medicine Center</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsMultipleDiscount}
                onChange={(e) => handleFieldChange('IsMultipleDiscount', e.target.checked)}
              />
              <span>Is Multiple Discount</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsItemmasterDrugshow}
                onChange={(e) => handleFieldChange('IsItemmasterDrugshow', e.target.checked)}
              />
              <span>Itemmaster Drug Show</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsVAT}
                onChange={(e) => handleFieldChange('IsVAT', e.target.checked)}
              />
              <span>Is VAT Applicable</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsShowItemType}
                onChange={(e) => handleFieldChange('IsShowItemType', e.target.checked)}
              />
              <span>Show Item Type</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsDoctorShare}
                onChange={(e) => handleFieldChange('IsDoctorShare', e.target.checked)}
              />
              <span>Doctor Share</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsAdmissionDate}
                onChange={(e) => handleFieldChange('IsAdmissionDate', e.target.checked)}
              />
              <span>Is Admission Date</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsAddressSearch}
                onChange={(e) => handleFieldChange('IsAddressSearch', e.target.checked)}
              />
              <span>Address Search</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsAlternateMobileMandatory}
                onChange={(e) => handleFieldChange('IsAlternateMobileMandatory', e.target.checked)}
              />
              <span>Alternate Mobile Mandatory</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsAlternateEmailMandatory}
                onChange={(e) => handleFieldChange('IsAlternateEmailMandatory', e.target.checked)}
              />
              <span>Alternate Email Mandatory</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsDueBill}
                onChange={(e) => handleFieldChange('IsDueBill', e.target.checked)}
              />
              <span>Due Bill Allowed</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsPincodeFreeText}
                onChange={(e) => handleFieldChange('IsPincodeFreeText', e.target.checked)}
              />
              <span>Free Text (Pincode)</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsWardRoomEditable}
                onChange={(e) => handleFieldChange('IsWardRoomEditable', e.target.checked)}
              />
              <span>Ward/Room Not Editable</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsDeptWiseLabPrint}
                onChange={(e) => handleFieldChange('IsDeptWiseLabPrint', e.target.checked)}
              />
              <span>Department Wise (Lab Result)</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.ShowAliasInfo}
                onChange={(e) => handleFieldChange('ShowAliasInfo', e.target.checked)}
              />
              <span>Show Alias Code</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.ShowMrp}
                onChange={(e) => handleFieldChange('ShowMrp', e.target.checked)}
              />
              <span>Show MRP</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.Showwithheadeprint}
                onChange={(e) => handleFieldChange('Showwithheadeprint', e.target.checked)}
              />
              <span>Show With Header Print</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.Showwithoutheadeprint}
                onChange={(e) => handleFieldChange('Showwithoutheadeprint', e.target.checked)}
              />
              <span>Show Without Header Print</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsCashPatientEmrIndent}
                onChange={(e) => handleFieldChange('IsCashPatientEmrIndent', e.target.checked)}
              />
              <span>Cash Patient EMR Indent</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsDirectLabSync}
                onChange={(e) => handleFieldChange('IsDirectLabSync', e.target.checked)}
              />
              <span>Direct Lab Sync</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsPharmacybasedonStore}
                onChange={(e) => handleFieldChange('IsPharmacybasedonStore', e.target.checked)}
              />
              <span>Pharmacy Sequence Based on Store</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsItemExactSearch}
                onChange={(e) => handleFieldChange('IsItemExactSearch', e.target.checked)}
              />
              <span>Exact Search by Item Name</span>
            </label>
          </div>
        </div>

        {/* 6. Logo Upload */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-picture-o" style={{ color: colors.primary }} />
            <span>Facility Logo</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 120,
                height: 120,
                radii: radii.md,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: colors.surfaceMuted
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Facility Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: colors.textMuted }}>
                  <i className="fa fa-hospital-o fa-2x" />
                  <div style={{ fontSize: 11, marginTop: 4 }}>No Logo</div>
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.primary,
                  background: colors.primaryLight,
                  border: `1px solid ${colors.primaryMid}`,
                  radii: radii.md,
                  cursor: 'pointer'
                }}
              >
                <i className="fa fa-upload" />
                <span>Upload Logo Image</span>
              </button>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 6 }}>
                PNG, JPG or SVG format up to 5MB.
              </div>
            </div>
          </div>
        </div>

        {/* 7. Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} 0`,
            borderTop: `1px solid ${colors.border}`,
            marginTop: spacing.md
          }}
        >
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textBody,
              background: colors.surfaceMuted,
              border: `1px solid ${colors.border}`,
              radii: radii.md,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-arrow-left" />
            <span>Back to List</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                background: colors.primary,
                border: 'none',
                radii: radii.md,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
              }}
            >
              {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />}
              <span>Save</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                background: '#10b981',
                border: 'none',
                radii: radii.md,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(16,185,129,0.25)'
              }}
            >
              {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-check" />}
              <span>Save &amp; Approve</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
