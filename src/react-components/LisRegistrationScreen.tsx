import React, { useState, useEffect, useCallback, useRef } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';
import { apiFetch } from './utils/api';

export interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
  [key: string]: any;
}

export interface LisRegistrationItem {
  Id?: number;
  PatientId?: number;
  BannerPatientId?: number;
  EncounterId?: number;
  TitleId?: number;
  FirstName?: string;
  LastName?: string;
  Age?: string | number;
  ApproxAgeDays?: string | number;
  ApproxAgeMonths?: string | number;
  DOB?: string | Date;
  MaritalStatusId?: number;
  GenderId?: number;
  LandLine?: string;
  Mobile?: string;
  Email?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  CountryId?: number;
  Country?: string;
  StateId?: number;
  State?: string;
  DistrictId?: number;
  District?: string;
  CityId?: number;
  City?: string;
  Area?: string;
  PinCodeId?: number;
  Pincode?: string;
  IsVip?: boolean;
  VipTypeId?: number;
  ReferTypeId?: number;
  ReferrerId?: number;
  ReferrerName?: string;
  IsB2BCustomer?: boolean;
  B2BCustomerMasterId?: number;
  RemarkId?: number;
  ClinicalNotes?: string;
  ScheduleApptDispTime?: string;
  iswebcamphoto?: boolean;
  webcamphoto?: string;
  PhotoPath?: string;
  [key: string]: any;
}

export interface LisRegistrationScreenProps {
  reactProps?: {
    item?: LisRegistrationItem;
    lookup?: {
      Title?: LookupItem[];
      Gender?: LookupItem[];
      MaritalStatus?: LookupItem[];
      ReferralType?: LookupItem[];
      B2BCustomerMaster?: LookupItem[];
      ClinicalRemarks?: LookupItem[];
      VipType?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
    currentcontext?: {
      id?: number;
      attachmentcount?: number;
      Photo?: string;
      file?: any;
      CanLisRegCheckOut?: boolean;
      CanLisRegOrderRequest?: boolean;
      CanLisRegPendingOrders?: boolean;
      CanLisRegOPDBill?: boolean;
      CanLisRegDGBilling?: boolean;
      CanLisRegB2BBilling?: boolean;
    };
    SaveCompleted?: boolean;
    EncounterStatus?: string;
    privileges?: Record<string, boolean>;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const LisRegistrationScreen: React.FC<LisRegistrationScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && reactProps.item);

  // Form State
  const [item, setItem] = useState<LisRegistrationItem>({
    TitleId: 1,
    FirstName: '',
    LastName: '',
    Age: '',
    ApproxAgeDays: '',
    ApproxAgeMonths: '',
    DOB: '',
    MaritalStatusId: undefined,
    GenderId: 1,
    LandLine: '',
    Mobile: '',
    Email: '',
    AddressLine1: '',
    AddressLine2: '',
    CountryId: 238, // Default India
    Country: 'INDIA',
    StateId: undefined,
    DistrictId: undefined,
    CityId: undefined,
    Area: '',
    PinCodeId: undefined,
    Pincode: '',
    IsVip: false,
    VipTypeId: undefined,
    ReferTypeId: 1,
    ReferrerId: undefined,
    IsB2BCustomer: true,
    B2BCustomerMasterId: undefined,
    RemarkId: undefined,
    ClinicalNotes: '',
    ...reactProps?.item,
  });

  // Patient search query
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Print menu state
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const printMenuRef = useRef<HTMLDivElement>(null);

  // Sync item when Angular scope item updates
  useEffect(() => {
    if (reactProps?.item) {
      setItem((prev) => ({
        ...prev,
        ...reactProps.item,
      }));
    }
  }, [reactProps?.item]);

  // Click outside listeners
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (printMenuRef.current && !printMenuRef.current.contains(e.target as Node)) {
        setIsPrintOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  }, [onAction]);

  // Handle field change
  const handleChange = (field: keyof LisRegistrationItem, value: any) => {
    const updated = { ...item, [field]: value };
    setItem(updated);
    if (onAction) {
      dispatch('itemChange', { field, value, item: updated });
    }
  };

  // Age <-> DOB calculations
  const calculateDOBFromAge = (yearsVal: any) => {
    const years = parseInt(yearsVal, 10);
    if (!isNaN(years) && years >= 0) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - years);
      const dobStr = d.toISOString().split('T')[0];
      handleChange('DOB', dobStr);
    }
  };

  const calculateAgeFromDOB = (dobVal: any) => {
    if (!dobVal) return;
    const birthDate = new Date(dobVal);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      handleChange('Age', age >= 0 ? age : 0);
    }
  };

  // Title change fills gender
  const handleTitleChange = (titleId: number) => {
    handleChange('TitleId', titleId);
    // Find Title in lookup
    const titles = reactProps?.lookup?.Title || [];
    const sel = titles.find((t) => t.Id === titleId);
    if (sel && sel.Code) {
      const code = sel.Code.toLowerCase();
      if (code === 'mr' || code === 'mstr') {
        handleChange('GenderId', 1); // Male
      } else if (code === 'ms' || code === 'mrs' || code === 'miss') {
        handleChange('GenderId', 2); // Female
      }
    }
  };

  // Search Patient
  const handlePatientSearch = async (query: string) => {
    setPatientSearchQuery(query);
    if (!query || query.length < 2) {
      setPatientSearchResults([]);
      return;
    }
    setIsSearchingPatient(true);
    try {
      const res = await apiFetch({
        action: 'Registration/PatientSearch/Search',
        data: {
          SearchCriteria: query,
          PageContext: { PageSize: 10, PageNumber: 1 },
        },
      });
      if (res && res.Data) {
        setPatientSearchResults(res.Data);
        setIsSearchOpen(true);
      }
    } catch (e) {
      console.error('Patient search error:', e);
    } finally {
      setIsSearchingPatient(false);
    }
  };

  const handleSelectPatient = (p: any) => {
    setIsSearchOpen(false);
    setPatientSearchQuery(`${p.MRN || ''} - ${p.FirstName || ''} ${p.LastName || ''}`.trim());
    if (onAction) {
      dispatch('patientSelected', p);
    } else {
      setItem((prev) => ({
        ...prev,
        PatientId: p.Id,
        BannerPatientId: p.Id,
        FirstName: p.FirstName,
        LastName: p.LastName,
        GenderId: p.GenderId,
        Mobile: p.Mobile,
        DOB: p.DOB,
        Age: p.Age,
      }));
    }
  };

  // Lookups
  const titles = reactProps?.lookup?.Title || [];
  const genders = reactProps?.lookup?.Gender || [];
  const maritalStatuses = reactProps?.lookup?.MaritalStatus || [];
  const referralTypes = reactProps?.lookup?.ReferralType || [];
  const b2bCustomers = reactProps?.lookup?.B2BCustomerMaster || [];
  const remarks = reactProps?.lookup?.ClinicalRemarks || [];
  const vipTypes = reactProps?.lookup?.VipType || [];

  const isSaveCompleted = Boolean(reactProps?.SaveCompleted);
  const encounterStatus = reactProps?.EncounterStatus || (isSaveCompleted ? 'Registered' : 'New');

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '8px 16px',
        paddingBottom: '80px', // Space for fixed footer
      }}
    >
      {/* ── Top Header / Patient Search Card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.lg}`,
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        {/* Patient Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 320 }} ref={patientSearchRef}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '0 12px',
                height: 38,
              }}
            >
              <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 14 }} />
              <input
                type="text"
                placeholder="Search Patient Name / Phone / UHID..."
                value={patientSearchQuery}
                onChange={(e) => handlePatientSearch(e.target.value)}
                onFocus={() => {
                  if (patientSearchResults.length > 0) setIsSearchOpen(true);
                }}
                disabled={isSaveCompleted}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  color: colors.textMain,
                  width: '100%',
                }}
              />
              {isSearchingPatient && <i className="fas fa-spinner fa-spin" style={{ color: colors.primary, fontSize: 13 }} />}
            </div>

            {/* Patient Autocomplete Results */}
            {isSearchOpen && patientSearchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: '#ffffff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  boxShadow: shadows.lg,
                  maxHeight: 240,
                  overflowY: 'auto',
                  zIndex: 1000,
                }}
              >
                {patientSearchResults.map((p) => (
                  <div
                    key={p.Id}
                    onClick={() => handleSelectPatient(p)}
                    style={{
                      padding: '8px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <div style={{ fontWeight: 600, color: colors.textMain }}>
                      {p.FirstName} {p.LastName} <span style={{ fontSize: 11, color: colors.primary, fontFamily: 'monospace' }}>({p.MRN})</span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>
                      Mobile: {p.Mobile || '—'} | Gender: {p.Gender?.Description || '—'} | Age: {p.Age || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>Status:</span>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: radii.full,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
                background: isSaveCompleted ? '#ecfdf5' : '#eff6ff',
                color: isSaveCompleted ? '#059669' : '#2563eb',
                border: `1px solid ${isSaveCompleted ? '#a7f3d0' : '#bfdbfe'}`,
              }}
            >
              {encounterStatus}
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => dispatch('order_dashboard')}
            title="LIS Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.primary,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-flask" />
            <span>LIS Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch('pickPatient')}
            title="Find Existing Patient"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fas fa-search" />
            <span>Find Patient</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch('addNew')}
            title="New Patient Registration"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <i className="fa fa-plus" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: Patient Demographics & OP Visit ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: spacing.md, alignItems: 'start' }}>
        
        {/* Left Form: Demographics + OP Visit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          
          {/* Section 1: Patient Registration */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: radii.lg,
              boxShadow: shadows.sm,
              border: `1px solid ${colors.border}`,
              padding: `${spacing.md} ${spacing.lg}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: spacing.md, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.xs }}>
              <i className="fas fa-user-plus" style={{ color: colors.primary, fontSize: 16 }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.textMain }}>
                Patient Registration Demographics
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.md,
              }}
            >
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Title <span style={{ color: colors.danger }}>*</span>
                </label>
                <select
                  value={item.TitleId || ''}
                  onChange={(e) => handleTitleChange(parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Title</option>
                  {titles.map((t) => (
                    <option key={t.Id} value={t.Id}>
                      {t.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  First Name <span style={{ color: colors.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={item.FirstName || ''}
                  onChange={(e) => handleChange('FirstName', e.target.value.toUpperCase())}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={item.LastName || ''}
                  onChange={(e) => handleChange('LastName', e.target.value.toUpperCase())}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Age */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Age (Years)
                </label>
                <input
                  type="number"
                  placeholder="Age"
                  value={item.Age ?? ''}
                  onChange={(e) => {
                    handleChange('Age', e.target.value);
                    calculateDOBFromAge(e.target.value);
                  }}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* DOB */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Date of Birth <span style={{ color: colors.danger }}>*</span>
                </label>
                <input
                  type="date"
                  value={item.DOB ? (typeof item.DOB === 'string' ? item.DOB.split('T')[0] : '') : ''}
                  onChange={(e) => {
                    handleChange('DOB', e.target.value);
                    calculateAgeFromDOB(e.target.value);
                  }}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Gender <span style={{ color: colors.danger }}>*</span>
                </label>
                <select
                  value={item.GenderId || ''}
                  onChange={(e) => handleChange('GenderId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Gender</option>
                  {genders.map((g) => (
                    <option key={g.Id} value={g.Id}>
                      {g.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Marital Status
                </label>
                <select
                  value={item.MaritalStatusId || ''}
                  onChange={(e) => handleChange('MaritalStatusId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Status</option>
                  {maritalStatuses.map((m) => (
                    <option key={m.Id} value={m.Id}>
                      {m.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Mobile No. <span style={{ color: colors.danger }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={item.Mobile || ''}
                  onChange={(e) => handleChange('Mobile', e.target.value)}
                  disabled={isSaveCompleted}
                  maxLength={15}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Landline */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Landline
                </label>
                <input
                  type="text"
                  placeholder="Landline number"
                  value={item.LandLine || ''}
                  onChange={(e) => handleChange('LandLine', e.target.value)}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="patient@domain.com"
                  value={item.Email || ''}
                  onChange={(e) => handleChange('Email', e.target.value)}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Address Line 1 */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Address Line
                </label>
                <input
                  type="text"
                  placeholder="Street / House / Building"
                  value={item.AddressLine1 || ''}
                  onChange={(e) => handleChange('AddressLine1', e.target.value)}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Geographical Address Selectors */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: spacing.md,
                marginTop: spacing.md,
                paddingTop: spacing.md,
                borderTop: '1px dashed #e2e8f0',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Country
                </label>
                <CountryControl
                  countryid={item.CountryId}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.countryid !== undefined) handleChange('CountryId', updates.countryid);
                    if (updates.country !== undefined) handleChange('Country', updates.country);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  State
                </label>
                <StateControl
                  countryid={item.CountryId}
                  stateid={item.StateId}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.stateid !== undefined) handleChange('StateId', updates.stateid);
                    if (updates.state !== undefined) handleChange('State', updates.state);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  District
                </label>
                <DistrictControl
                  countryid={item.CountryId}
                  stateid={item.StateId}
                  districtid={item.DistrictId}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.districtid !== undefined) handleChange('DistrictId', updates.districtid);
                    if (updates.district !== undefined) handleChange('District', updates.district);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  City / Town
                </label>
                <CityControl
                  countryid={item.CountryId}
                  stateid={item.StateId}
                  districtid={item.DistrictId}
                  cityid={item.CityId}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.cityid !== undefined) handleChange('CityId', updates.cityid);
                    if (updates.city !== undefined) handleChange('City', updates.city);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Area
                </label>
                <AreaControl
                  countryid={item.CountryId}
                  stateid={item.StateId}
                  districtid={item.DistrictId}
                  cityid={item.CityId}
                  areaid={item.AreaId}
                  pincode={item.Pincode}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.area !== undefined) handleChange('Area', updates.area);
                    if (updates.areaid !== undefined) handleChange('AreaId', updates.areaid);
                    if (updates.pincode !== undefined) handleChange('Pincode', updates.pincode);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Pin Code
                </label>
                <PincodeControl
                  countryid={item.CountryId}
                  stateid={item.StateId}
                  districtid={item.DistrictId}
                  cityid={item.CityId}
                  pincodeid={item.PinCodeId}
                  pincode={item.Pincode}
                  candisable={isSaveCompleted}
                  onUpdate={(updates: any) => {
                    if (updates.pincodeid !== undefined) handleChange('PinCodeId', updates.pincodeid);
                    if (updates.pincode !== undefined) handleChange('Pincode', updates.pincode);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: OP Visit & Referral Details */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: radii.lg,
              boxShadow: shadows.sm,
              border: `1px solid ${colors.border}`,
              padding: `${spacing.md} ${spacing.lg}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: spacing.md, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.xs }}>
              <i className="fas fa-stethoscope" style={{ color: colors.primary, fontSize: 16 }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.textMain }}>
                OP Visit & Clinical Reference
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md,
              }}
            >
              {/* Referral Type */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Source / Referral Type <span style={{ color: colors.danger }}>*</span>
                </label>
                <select
                  value={item.ReferTypeId || ''}
                  onChange={(e) => handleChange('ReferTypeId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  {referralTypes.map((r) => (
                    <option key={r.Id} value={r.Id}>
                      {r.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referred By */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Referred By <span style={{ color: colors.danger }}>*</span>
                  </label>
                  {!isSaveCompleted && (
                    <button
                      type="button"
                      onClick={() => dispatch('addReferral')}
                      title="Add New Referral Doctor"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: colors.primary,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      + Add New
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Referrer doctor or hospital"
                  value={item.ReferrerName || ''}
                  onChange={(e) => handleChange('ReferrerName', e.target.value)}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* B2B Customer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    B2B Customer
                  </label>
                  <label style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.IsB2BCustomer)}
                      onChange={(e) => handleChange('IsB2BCustomer', e.target.checked)}
                      disabled={isSaveCompleted}
                    />
                    <span>Is B2B</span>
                  </label>
                </div>
                <select
                  value={item.B2BCustomerMasterId || ''}
                  onChange={(e) => handleChange('B2BCustomerMasterId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select B2B Partner</option>
                  {b2bCustomers.map((b) => (
                    <option key={b.Id} value={b.Id}>
                      {b.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinical Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Remarks Type
                </label>
                <select
                  value={item.RemarkId || ''}
                  onChange={(e) => handleChange('RemarkId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 13,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Remarks</option>
                  {remarks.map((rm) => (
                    <option key={rm.Id} value={rm.Id}>
                      {rm.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Information link */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Appointment Details
                  </label>
                  {!isSaveCompleted && (
                    <a
                      href="#/app/appointments"
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch('viewScheduleAppt');
                      }}
                      style={{ fontSize: 11, color: colors.primary, textDecoration: 'none', fontWeight: 600 }}
                    >
                      View Schedule
                    </a>
                  )}
                </div>
                <div
                  style={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    background: '#f8fafc',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: 12,
                    color: item.ScheduleApptDispTime ? colors.textMain : colors.textMuted,
                  }}
                >
                  {item.ScheduleApptDispTime ? `Appt: ${item.ScheduleApptDispTime}` : 'No scheduled appointment selected'}
                </div>
              </div>

              {/* Clinical Notes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter sample collection instructions or diagnosis notes..."
                  value={item.ClinicalNotes || ''}
                  onChange={(e) => handleChange('ClinicalNotes', e.target.value)}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '8px 10px',
                    fontSize: 13,
                    background: '#ffffff',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Photo & VIP Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            boxShadow: shadows.sm,
            border: `1px solid ${colors.border}`,
            padding: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', textAlign: 'center', marginBottom: spacing.sm }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
              Patient Photo
            </span>
          </div>

          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: radii.full,
              border: `3px solid #e2e8f0`,
              overflow: 'hidden',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            }}
          >
            {item.webcamphoto ? (
              <img src={`data:image/png;base64,${item.webcamphoto}`} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : reactProps?.currentcontext?.Photo ? (
              <img src={`data:image/png;base64,${reactProps.currentcontext.Photo}`} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="fas fa-user" style={{ fontSize: 64, color: '#94a3b8' }} />
            )}
          </div>

          {/* Photo Actions */}
          {!isSaveCompleted && (
            <div style={{ display: 'flex', gap: 8, marginBottom: spacing.lg }}>
              <button
                type="button"
                onClick={() => dispatch('openWebCam')}
                title="Capture Webcam Photo"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#f59e0b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <i className="fa fa-camera" />
              </button>

              <button
                type="button"
                onClick={() => dispatch('clearimage')}
                title="Clear Photo"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: '#ffffff',
                  color: colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <i className="fa fa-refresh" />
              </button>
            </div>
          )}

          {/* VIP Section */}
          <div style={{ width: '100%', borderTop: `1px solid ${colors.border}`, paddingTop: spacing.md }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: spacing.xs, fontSize: 13, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={Boolean(item.IsVip)}
                onChange={(e) => handleChange('IsVip', e.target.checked)}
                disabled={isSaveCompleted}
                style={{ width: 16, height: 16, accentColor: '#d97706', cursor: 'pointer' }}
              />
              <span style={{ color: '#b45309' }}>VIP Patient</span>
            </label>

            {item.IsVip && (
              <div style={{ marginTop: 6 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                  VIP Type
                </label>
                <select
                  value={item.VipTypeId || ''}
                  onChange={(e) => handleChange('VipTypeId', parseInt(e.target.value, 10))}
                  disabled={isSaveCompleted}
                  style={{
                    width: '100%',
                    height: 34,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: 12,
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                >
                  <option value="">Select VIP Type</option>
                  {vipTypes.map((v) => (
                    <option key={v.Id} value={v.Id}>
                      {v.Text}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Footer Bar ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: `1px solid ${colors.border}`,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        {/* Left Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.textMain,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-angle-left" />
            <span>Back</span>
          </button>

          {isSaveCompleted && (
            <>
              {/* Checkout */}
              <button
                type="button"
                onClick={() => dispatch('checkout')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 14px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-check-circle" />
                <span>Checkout</span>
              </button>

              {/* Attachments */}
              <button
                type="button"
                onClick={() => dispatch('openattachments')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: '#ffffff',
                  color: colors.textMain,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-paperclip" />
                <span>Attachments ({reactProps?.currentcontext?.attachmentcount || 0})</span>
              </button>

              {/* Order Request */}
              <button
                type="button"
                onClick={() => dispatch('orderrequest')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#ce14ce',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-vial" />
                <span>Order Request</span>
              </button>

              {/* Pending Orders */}
              <button
                type="button"
                onClick={() => dispatch('pendingorders')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#ec7c16',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-clock" />
                <span>Pending Orders</span>
              </button>

              {/* OPD Bill */}
              <button
                type="button"
                onClick={() => dispatch('OPDBill')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-receipt" />
                <span>OPD Bill</span>
              </button>

              {/* DG Billing */}
              <button
                type="button"
                onClick={() => dispatch('dgbilling')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#f05092',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-file-invoice-dollar" />
                <span>DG Bill</span>
              </button>

              {/* B2B Billing */}
              <button
                type="button"
                onClick={() => dispatch('b2bbilling')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#923fbd',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-handshake" />
                <span>B2B Bill</span>
              </button>
            </>
          )}
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {isSaveCompleted && (
            <div ref={printMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsPrintOpen(!isPrintOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 14px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: '#ffffff',
                  color: colors.textMain,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-print" />
                <span>Print</span>
                <i className="fa fa-caret-up" />
              </button>

              {isPrintOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 8,
                    background: '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    boxShadow: shadows.lg,
                    minWidth: 180,
                    zIndex: 1000,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintOpen(false);
                      dispatch('printRegistrationIdCard');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-id-card" style={{ color: colors.primary }} />
                    <span>Print ID Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintOpen(false);
                      dispatch('printPatientLabel');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-barcode" style={{ color: '#059669' }} />
                    <span>Print Patient Label</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!isSaveCompleted && (
            <button
              type="button"
              onClick={() => dispatch('saveAndApprove', item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 36,
                padding: '0 18px',
                borderRadius: radii.md,
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              }}
            >
              <i className="fa fa-check" />
              <span>Save & Activate</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => dispatch('clear')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#f8fafc',
              color: colors.textMain,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
