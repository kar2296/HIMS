import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './utils/api';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface UserItem {
  Id?: number;
  TitleId?: number;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Age?: number | string;
  DOB?: string;
  IsBirthDateApproximate?: boolean;
  GenderId?: number;
  Qualification?: string;
  Designation?: string;
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
  WardId?: number;
  Area?: string;
  PinCodeId?: number;
  Pincode?: string;
  PinCode?: string;
  Mobile?: string;
  Email?: string;
  OPDRoomId?: number;
  PANNo?: string;
  AccountNo?: string;
  IFSCCode?: string;
  BankName?: string;
  LicenseNo?: string;
  AdditionalPhoneNo?: string;
  TeamId?: number;
  IsActive?: boolean;
  IsHome?: boolean;
  IsSurgeon?: boolean;
  IsAnaesthisist?: boolean;
  IsPrivate?: boolean;
  PrivateDueLimit?: number | string;
  IsDiscount?: boolean;
  DiscountModeId?: number;
  DiscountLimit?: number | string;
  IsDueCheck?: boolean;
  IsTDS?: boolean;
  TDSId?: number;
  Staff?: boolean;
  IsVirtualUsers?: boolean;
  VirtualSubCategoryId?: number;
  OrgId?: number;
  FacilityId?: number;
  DepartmentId?: number;
  SubDepartmentId?: number;
  UserGroupId?: number;
  BillingCounterId?: number;
  UserTypeId?: number;
  UserName?: string;
  UseDefaultPassword?: boolean;
  Password?: string;
  ConfirmPassword?: string;
  LoginPermission?: number | boolean;
  PhotoPath?: string;
  SignPath?: string;
  SignatureName?: string;
  ActiveStatusId?: number;
  [key: string]: any;
}

export interface UserFormScreenProps {
  reactProps?: {
    item?: UserItem;
    lookup?: Record<string, Array<{ Id: number; Text: string; [key: string]: any }>>;
    userId?: number;
    photoBase64?: string;
    signBase64?: string;
    loginsetting?: {
      MinLoginNameLength?: number;
      MaxLoginNameLength?: number;
      ReqNoOfLoginDigit?: number;
      MinPwdLength?: number;
      MaxPwdLength?: number;
      IsSpecialCharacterAllowedinPwd?: boolean | number;
    } | null;
    usernamecriteriamsg?: string | null;
    pwdcriteriamsg?: string | null;
    isSaving?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const UserFormScreen: React.FC<UserFormScreenProps> = ({
  reactProps,
  onAction
}) => {
  const userId = reactProps?.userId ?? reactProps?.item?.Id ?? 0;

  const [formData, setFormData] = useState<UserItem>(() => ({
    IsActive: true,
    CountryId: 1,
    NationalityId: 238,
    IsIncludeTax: false,
    Staff: false,
    FacilityId: -1,
    OrgId: 1,
    UseDefaultPassword: false,
    ...reactProps?.item
  }));

  const [lookups, setLookups] = useState<Record<string, Array<{ Id: number; Text: string }>>>(() => ({
    Title: [],
    Gender: [],
    Country: [],
    State: [],
    city: [],
    OPDRoom: [],
    Team: [],
    DiscountMode: [],
    GstMaster: [],
    VirtualSubCategory: [],
    Organization: [],
    Facility: [],
    Department: [],
    SubDepartment: [],
    Group: [],
    BillingCounter: [],
    UserType: [],
    ...(reactProps?.lookup || {})
  }));

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    reactProps?.photoBase64 ? `data:image/png;base64,${reactProps.photoBase64}` : null
  );
  const [signPreview, setSignPreview] = useState<string | null>(
    reactProps?.signBase64 ? `data:image/png;base64,${reactProps.signBase64}` : null
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signFile, setSignFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; actionType: 'save' | 'approve' } | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const signInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync props from bridge
  useEffect(() => {
    if (reactProps?.item) {
      setFormData(prev => ({
        ...prev,
        ...reactProps.item,
        ConfirmPassword: reactProps.item?.Password || prev.ConfirmPassword
      }));
    }
    if (reactProps?.lookup) {
      setLookups(prev => ({
        ...prev,
        ...reactProps.lookup
      }));
    }
    if (reactProps?.photoBase64) {
      setPhotoPreview(`data:image/png;base64,${reactProps.photoBase64}`);
    }
    if (reactProps?.signBase64) {
      setSignPreview(`data:image/png;base64,${reactProps.signBase64}`);
    }
    if (reactProps?.isSaving !== undefined) {
      setSaving(reactProps.isSaving);
    }
  }, [reactProps]);

  // Standalone lookup & item initialization
  useEffect(() => {
    let isMounted = true;

    const initStandalone = async () => {
      if (reactProps?.lookup && Object.keys(reactProps.lookup).length > 0) return;

      setLoading(true);
      try {
        const lookupReq = [
          { Key: 'Department', Request: { Params: [{ Key: 5, Value: 2 }, { Key: 14, Value: [-1, 1] }] } },
          { Key: 'Title' },
          { Key: 'Gender' },
          { Key: 'Country' },
          { Key: 'State' },
          { Key: 'city' },
          { Key: 'OPDRoom' },
          { Key: 'Team' },
          { Key: 'DiscountMode' },
          { Key: 'GstMaster', Request: { Params: [{ Key: 3, Value: 2 }, { Key: 5, Value: [-1, 1] }] } },
          { Key: 'VirtualSubCategory' },
          { Key: 'Organization' },
          { Key: 'Facility' },
          { Key: 'SubDepartment' },
          { Key: 'Group' },
          { Key: 'BillingCounter' },
          { Key: 'UserType' },
        ];

        const resp = await apiFetch<any>('General/Options/getoptions', {
          method: 'POST',
          body: JSON.stringify(lookupReq)
        });

        if (isMounted && resp && typeof resp === 'object') {
          setLookups(prev => ({ ...prev, ...resp }));
        }

        // If editing an existing user standalone
        if (userId > 0 && !reactProps?.item) {
          const userResp = await apiFetch<any>('SystemSettings/User/GetUserById', {
            method: 'POST',
            body: JSON.stringify({ Id: userId })
          });
          if (isMounted && userResp) {
            setFormData(prev => ({
              ...prev,
              ...userResp,
              ConfirmPassword: userResp.Password
            }));
            if (userResp.PhotoPath) {
              apiFetch<any>('SystemSettings/User/GetUserProfilePic', {
                method: 'POST',
                body: JSON.stringify({ Data: { PhotoPath: userResp.PhotoPath } })
              }).then(picRes => {
                if (isMounted && picRes?.Photo) {
                  setPhotoPreview(`data:image/png;base64,${picRes.Photo}`);
                }
              }).catch(() => {});
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize user lookups:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initStandalone();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const handleFieldChange = (field: keyof UserItem, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      // Auto set gender on Title change
      if (field === 'TitleId') {
        if (value === 10) next.GenderId = 1; // Mr -> Male
        else if (value === 11 || value === 12) next.GenderId = 2; // Mrs / Ms -> Female
      }

      // Age to DOB
      if (field === 'Age') {
        const ageNum = parseInt(value, 10);
        if (!isNaN(ageNum) && ageNum >= 0 && ageNum <= 130) {
          const d = new Date();
          d.setFullYear(d.getFullYear() - ageNum);
          next.DOB = d.toISOString().split('T')[0];
          next.IsBirthDateApproximate = true;
        }
      }

      // DOB to Age
      if (field === 'DOB') {
        const dobDate = new Date(value);
        if (!isNaN(dobDate.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          next.Age = age >= 0 ? age : 0;
          next.IsBirthDateApproximate = false;
        }
      }

      // Default Password
      if (field === 'UseDefaultPassword') {
        if (value) {
          let defPwd = 'Default@123';
          if (next.FacilityId && lookups.Facility) {
            const fac = lookups.Facility.find(f => f.Id === next.FacilityId);
            if (fac && fac.DefaultPwd) defPwd = fac.DefaultPwd;
          }
          next.Password = defPwd;
          next.ConfirmPassword = defPwd;
        } else {
          next.Password = '';
          next.ConfirmPassword = '';
        }
      }

      // Facility changed -> reload department
      if (field === 'FacilityId') {
        next.DepartmentId = -1;
        dispatch('getfacdept', { facilityId: value });
      }

      // Department changed -> reload subdepartment
      if (field === 'DepartmentId') {
        next.SubDepartmentId = undefined;
        dispatch('getsubdeptUsers', { departmentId: value });
      }

      return next;
    });

    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleAddressUpdate = (data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    dispatch('photoFileChanged', { file });
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, PhotoPath: undefined }));
    if (photoInputRef.current) photoInputRef.current.value = '';
    dispatch('clearimage');
  };

  const handleSignSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignFile(file);
    setFormData(prev => ({ ...prev, SignatureName: file.name }));
    const reader = new FileReader();
    reader.onload = ev => {
      setSignPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    dispatch('signFileChanged', { file });
  };

  const handleClearSign = () => {
    setSignFile(null);
    setSignPreview(null);
    setFormData(prev => ({ ...prev, SignPath: undefined, SignatureName: '' }));
    if (signInputRef.current) signInputRef.current.value = '';
    dispatch('clearsignfile');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.TitleId) errs.TitleId = 'Title is required';
    if (!formData.FirstName?.trim()) errs.FirstName = 'First Name is required';
    if (!formData.Age && formData.Age !== 0) errs.Age = 'Age is required';
    if (!formData.DOB) errs.DOB = 'Date of Birth is required';
    if (!formData.Mobile?.trim()) errs.Mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.Mobile.trim())) errs.Mobile = 'Enter a valid 10-digit mobile';

    if (!formData.OrgId) errs.OrgId = 'Organization is required';
    if (!formData.FacilityId || formData.FacilityId <= 0) errs.FacilityId = 'Facility / Hospital is required';
    if (!formData.DepartmentId || formData.DepartmentId <= 0) errs.DepartmentId = 'Department is required';
    if (!formData.UserGroupId) errs.UserGroupId = 'User Group is required';
    if (!formData.UserTypeId) errs.UserTypeId = 'User Type is required';
    if (!formData.UserName?.trim()) errs.UserName = 'Login Name is required';

    if (!formData.Password) errs.Password = 'Password is required';
    if (formData.Password !== formData.ConfirmPassword) {
      errs.ConfirmPassword = 'Passwords do not match';
    }

    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errs.Email = 'Invalid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const initiateSave = (actionType: 'save' | 'approve') => {
    if (!validate()) {
      setNotification({ type: 'error', message: 'Please fill in the required fields highlighted in red.' });
      setTimeout(() => {
        const firstErr = document.querySelector('.hims-input-error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstErr as HTMLElement).focus?.();
        }
      }, 60);
      return;
    }
    setConfirmModal({ isOpen: true, actionType });
  };

  const executeSave = async () => {
    if (!confirmModal) return;
    const isApprove = confirmModal.actionType === 'approve';
    setConfirmModal(null);

    const activeStatusId = isApprove ? (formData.IsActive ? 2 : 3) : 1;
    const payload = {
      ...formData,
      ActiveStatusId: activeStatusId,
      photoFile,
      signFile
    };

    if (onAction) {
      if (isApprove) {
        dispatch('saveAndApprove', payload);
      } else {
        dispatch('save', payload);
      }
      return;
    }

    // Standalone fallback save
    setSaving(true);
    try {
      const endpoint = userId > 0 ? 'SystemSettings/User/UpdateUser' : 'SystemSettings/User/AddUser';
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ Data: payload })
      });
      setNotification({
        type: 'success',
        message: isApprove ? 'User approved and saved successfully!' : 'User draft saved successfully!'
      });
      setTimeout(() => {
        dispatch('backToList');
      }, 1200);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save user.' });
    } finally {
      setSaving(false);
    }
  };

  // Modern UI Styles following Tokens
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    padding: spacing.lg,
    marginBottom: spacing.lg
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.primary,
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
    fontWeight: 500,
    color: colors.textMuted,
    marginBottom: '4px'
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    height: '34px',
    padding: '4px 10px',
    fontSize: '13px',
    fontFamily: typography.fontFamily,
    color: colors.textMain,
    backgroundColor: hasError ? '#fef2f2' : '#fff',
    border: `1px solid ${hasError ? '#ef4444' : colors.border}`,
    borderRadius: radii.md,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  });

  const selectStyle = (hasError?: boolean): React.CSSProperties => ({
    ...inputStyle(hasError),
    cursor: 'pointer'
  });

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: colors.textMain,
    cursor: 'pointer',
    userSelect: 'none'
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textMain, maxWidth: 1400, margin: '0 auto' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: radii.md,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '460px'
          }}
        >
          <i className={notification.type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-circle'} />
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 12, fontSize: 18 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.lg,
              width: '420px',
              maxWidth: '90%',
              padding: spacing.xl,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: confirmModal.actionType === 'approve' ? '#eff6ff' : '#f8fafc',
                  color: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}
              >
                <i className={confirmModal.actionType === 'approve' ? 'fa fa-check-double' : 'fa fa-save'} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {confirmModal.actionType === 'approve' ? 'Approve & Save User' : 'Save User Draft'}
              </h4>
            </div>
            <p style={{ fontSize: 14, color: colors.textMuted, margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {confirmModal.actionType === 'approve'
                ? 'Are you sure you want to approve and activate this user record?'
                : 'Are you sure you want to save this user as a draft?'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#fff',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md,
                  border: 'none',
                  backgroundColor: colors.primary,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {saving && <i className="fa fa-spinner fa-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
          <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary, marginBottom: 8 }} />
          <div>Loading user form and lookup data...</div>
        </div>
      )}

      {!loading && (
        <form onSubmit={e => e.preventDefault()}>
          {/* Section 1: User Details */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>
              <i className="fa fa-user-circle" />
              <span>User Details</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: `${spacing.md} ${spacing.md}`
              }}
            >
              {/* Title */}
              <div>
                <label style={labelStyle}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.TitleId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.TitleId)}
                  value={formData.TitleId || ''}
                  onChange={e => handleFieldChange('TitleId', Number(e.target.value))}
                >
                  <option value="">Select Title</option>
                  {(lookups.Title || []).map(t => (
                    <option key={t.Id} value={t.Id}>
                      {t.Text}
                    </option>
                  ))}
                </select>
                {errors.TitleId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.TitleId}</span>}
              </div>

              {/* First Name */}
              <div>
                <label style={labelStyle}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className={errors.FirstName ? 'hims-input-error' : ''}
                  style={inputStyle(!!errors.FirstName)}
                  value={formData.FirstName || ''}
                  onChange={e => handleFieldChange('FirstName', e.target.value.toUpperCase())}
                  placeholder="First name"
                />
                {errors.FirstName && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.FirstName}</span>}
              </div>

              {/* Middle Name */}
              <div>
                <label style={labelStyle}>Middle Name</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.MiddleName || ''}
                  onChange={e => handleFieldChange('MiddleName', e.target.value.toUpperCase())}
                  placeholder="Middle name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.LastName || ''}
                  onChange={e => handleFieldChange('LastName', e.target.value.toUpperCase())}
                  placeholder="Last name"
                />
              </div>

              {/* Age */}
              <div>
                <label style={labelStyle}>
                  Age <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  className={errors.Age ? 'hims-input-error' : ''}
                  min="0"
                  max="130"
                  style={inputStyle(!!errors.Age)}
                  value={formData.Age !== undefined ? formData.Age : ''}
                  onChange={e => handleFieldChange('Age', e.target.value)}
                  placeholder="Age"
                />
                {errors.Age && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.Age}</span>}
              </div>

              {/* DOB */}
              <div>
                <label style={labelStyle}>
                  DOB <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className={errors.DOB ? 'hims-input-error' : ''}
                  style={inputStyle(!!errors.DOB)}
                  value={formData.DOB ? formData.DOB.substring(0, 10) : ''}
                  onChange={e => handleFieldChange('DOB', e.target.value)}
                />
                {errors.DOB && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.DOB}</span>}
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  style={selectStyle()}
                  value={formData.GenderId || ''}
                  onChange={e => handleFieldChange('GenderId', Number(e.target.value))}
                >
                  <option value="">Select Gender</option>
                  {(lookups.Gender || []).map(g => (
                    <option key={g.Id} value={g.Id}>
                      {g.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label style={labelStyle}>Qualification</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.Qualification || ''}
                  onChange={e => handleFieldChange('Qualification', e.target.value)}
                  placeholder="Degree, Specialization"
                />
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>Designation</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.Designation || ''}
                  onChange={e => handleFieldChange('Designation', e.target.value)}
                  placeholder="Doctor, Nurse, Manager"
                />
              </div>

              {/* Address 1 */}
              <div>
                <label style={labelStyle}>Address Line 1</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.AddressLine1 || ''}
                  onChange={e => handleFieldChange('AddressLine1', e.target.value)}
                  placeholder="Street address, building"
                />
              </div>

              {/* Address 2 */}
              <div>
                <label style={labelStyle}>Address Line 2</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.AddressLine2 || ''}
                  onChange={e => handleFieldChange('AddressLine2', e.target.value)}
                  placeholder="Apartment, suite, unit"
                />
              </div>

              {/* Country */}
              <div>
                <label style={labelStyle}>Country</label>
                <CountryControl
                  countryid={formData.CountryId}
                  onUpdate={handleAddressUpdate}
                />
              </div>

              {/* State */}
              <div>
                <label style={labelStyle}>State</label>
                <StateControl
                  countryid={formData.CountryId}
                  stateid={formData.StateId}
                  onUpdate={handleAddressUpdate}
                />
              </div>

              {/* District */}
              <div>
                <label style={labelStyle}>District</label>
                <DistrictControl
                  countryid={formData.CountryId}
                  stateid={formData.StateId}
                  districtid={formData.DistrictId}
                  onUpdate={handleAddressUpdate}
                />
              </div>

              {/* City/Town */}
              <div>
                <label style={labelStyle}>City / Town</label>
                <CityControl
                  countryid={formData.CountryId}
                  stateid={formData.StateId}
                  districtid={formData.DistrictId}
                  cityid={formData.CityId}
                  onUpdate={handleAddressUpdate}
                />
              </div>

              {/* Area */}
              <div>
                <label style={labelStyle}>Area / Ward</label>
                <AreaControl
                  countryid={formData.CountryId}
                  stateid={formData.StateId}
                  districtid={formData.DistrictId}
                  cityid={formData.CityId}
                  areaid={formData.WardId}
                  pincode={formData.Pincode || formData.PinCode}
                  onUpdate={handleAddressUpdate}
                />
              </div>

              {/* Mobile */}
              <div>
                <label style={labelStyle}>
                  Mobile <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  className={errors.Mobile ? 'hims-input-error' : ''}
                  maxLength={10}
                  style={inputStyle(!!errors.Mobile)}
                  value={formData.Mobile || ''}
                  onChange={e => handleFieldChange('Mobile', e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                />
                {errors.Mobile && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.Mobile}</span>}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle(!!errors.Email)}
                  value={formData.Email || ''}
                  onChange={e => handleFieldChange('Email', e.target.value)}
                  placeholder="doctor@hospital.com"
                />
                {errors.Email && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.Email}</span>}
              </div>

              {/* OPD Room */}
              <div>
                <label style={labelStyle}>OPD Room#</label>
                <select
                  style={selectStyle()}
                  value={formData.OPDRoomId || ''}
                  onChange={e => handleFieldChange('OPDRoomId', Number(e.target.value))}
                >
                  <option value="">Select Room</option>
                  {(lookups.OPDRoom || []).map(r => (
                    <option key={r.Id} value={r.Id}>
                      {r.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* PAN No */}
              <div>
                <label style={labelStyle}>PAN No</label>
                <input
                  type="text"
                  maxLength={10}
                  style={inputStyle()}
                  value={formData.PANNo || ''}
                  onChange={e => handleFieldChange('PANNo', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                />
              </div>

              {/* Account No */}
              <div>
                <label style={labelStyle}>Bank Account No</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.AccountNo || ''}
                  onChange={e => handleFieldChange('AccountNo', e.target.value)}
                  placeholder="Account number"
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label style={labelStyle}>IFSC Code</label>
                <input
                  type="text"
                  maxLength={11}
                  style={inputStyle()}
                  value={formData.IFSCCode || ''}
                  onChange={e => handleFieldChange('IFSCCode', e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.BankName || ''}
                  onChange={e => handleFieldChange('BankName', e.target.value)}
                  placeholder="Bank name"
                />
              </div>

              {/* License No */}
              <div>
                <label style={labelStyle}>License No (MCI / State Council)</label>
                <input
                  type="text"
                  style={inputStyle()}
                  value={formData.LicenseNo || ''}
                  onChange={e => handleFieldChange('LicenseNo', e.target.value)}
                  placeholder="Registration / License number"
                />
              </div>

              {/* Doctor Team */}
              <div>
                <label style={labelStyle}>Doctor Team</label>
                <select
                  style={selectStyle()}
                  value={formData.TeamId || ''}
                  onChange={e => handleFieldChange('TeamId', Number(e.target.value))}
                >
                  <option value="">Select Team</option>
                  {(lookups.Team || []).map(tm => (
                    <option key={tm.Id} value={tm.Id}>
                      {tm.Text}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes & Roles */}
            <div
              style={{
                marginTop: spacing.lg,
                paddingTop: spacing.md,
                borderTop: `1px dashed ${colors.border}`,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.md,
                alignItems: 'center'
              }}
            >
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsActive}
                  onChange={e => handleFieldChange('IsActive', e.target.checked)}
                />
                <span>Active Status</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsHome}
                  onChange={e => handleFieldChange('IsHome', e.target.checked)}
                />
                <span>Home Visit Allowed</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsSurgeon}
                  onChange={e => handleFieldChange('IsSurgeon', e.target.checked)}
                />
                <span>Surgeon</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsAnaesthisist}
                  onChange={e => handleFieldChange('IsAnaesthisist', e.target.checked)}
                />
                <span>Anaesthetist</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsPrivate}
                  onChange={e => handleFieldChange('IsPrivate', e.target.checked)}
                />
                <span>Due Approver / Private</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsDiscount}
                  onChange={e => handleFieldChange('IsDiscount', e.target.checked)}
                />
                <span>Discount Approver</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsDueCheck}
                  onChange={e => handleFieldChange('IsDueCheck', e.target.checked)}
                />
                <span>Due Check</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsTDS}
                  onChange={e => handleFieldChange('IsTDS', e.target.checked)}
                />
                <span>Apply TDS</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.Staff}
                  onChange={e => handleFieldChange('Staff', e.target.checked)}
                />
                <span>Staff Member</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={!!formData.IsVirtualUsers}
                  onChange={e => handleFieldChange('IsVirtualUsers', e.target.checked)}
                />
                <span>Virtual / Teleconsult User</span>
              </label>
            </div>

            {/* Conditional fields based on checkboxes */}
            {(formData.IsPrivate || formData.IsDiscount || formData.IsTDS || formData.IsVirtualUsers) && (
              <div
                style={{
                  marginTop: spacing.md,
                  padding: spacing.md,
                  backgroundColor: '#f8fafc',
                  borderRadius: radii.md,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: spacing.md
                }}
              >
                {formData.IsPrivate && (
                  <div>
                    <label style={labelStyle}>Private Due Limit (Max ₹5,00,000)</label>
                    <input
                      type="number"
                      max={500000}
                      style={inputStyle()}
                      value={formData.PrivateDueLimit || ''}
                      onChange={e => handleFieldChange('PrivateDueLimit', e.target.value)}
                      placeholder="Due Limit"
                    />
                  </div>
                )}

                {formData.IsDiscount && (
                  <>
                    <div>
                      <label style={labelStyle}>Discount Mode</label>
                      <select
                        style={selectStyle()}
                        value={formData.DiscountModeId || ''}
                        onChange={e => handleFieldChange('DiscountModeId', Number(e.target.value))}
                      >
                        <option value="">Select Mode</option>
                        {(lookups.DiscountMode || []).map(dm => (
                          <option key={dm.Id} value={dm.Id}>
                            {dm.Text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Discount Limit (%)</label>
                      <input
                        type="number"
                        style={inputStyle()}
                        value={formData.DiscountLimit || ''}
                        onChange={e => handleFieldChange('DiscountLimit', e.target.value)}
                        placeholder="Limit"
                      />
                    </div>
                  </>
                )}

                {formData.IsTDS && (
                  <div>
                    <label style={labelStyle}>TDS Category</label>
                    <select
                      style={selectStyle()}
                      value={formData.TDSId || ''}
                      onChange={e => handleFieldChange('TDSId', Number(e.target.value))}
                    >
                      <option value="">Select TDS</option>
                      {(lookups.GstMaster || []).map(g => (
                        <option key={g.Id} value={g.Id}>
                          {g.Text}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.IsVirtualUsers && (
                  <div>
                    <label style={labelStyle}>Online Speciality</label>
                    <select
                      style={selectStyle()}
                      value={formData.VirtualSubCategoryId || ''}
                      onChange={e => handleFieldChange('VirtualSubCategoryId', Number(e.target.value))}
                    >
                      <option value="">Select Speciality</option>
                      {(lookups.VirtualSubCategory || []).map(v => (
                        <option key={v.Id} value={v.Id}>
                          {v.Text}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Organization and Security */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>
              <i className="fa fa-shield-alt" />
              <span>Organization & Security Access</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: `${spacing.md} ${spacing.md}`
              }}
            >
              {/* Organization */}
              <div>
                <label style={labelStyle}>
                  Organization Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.OrgId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.OrgId)}
                  value={formData.OrgId || ''}
                  onChange={e => handleFieldChange('OrgId', Number(e.target.value))}
                >
                  <option value="">Select Organization</option>
                  {(lookups.Organization || []).map(org => (
                    <option key={org.Id} value={org.Id}>
                      {org.Text}
                    </option>
                  ))}
                </select>
                {errors.OrgId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.OrgId}</span>}
              </div>

              {/* Facility / Hospital */}
              <div>
                <label style={labelStyle}>
                  Hospital & Clinical Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.FacilityId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.FacilityId)}
                  value={formData.FacilityId || ''}
                  onChange={e => handleFieldChange('FacilityId', Number(e.target.value))}
                >
                  <option value="">Select Facility</option>
                  {(lookups.Facility || []).map(fac => (
                    <option key={fac.Id} value={fac.Id}>
                      {fac.Text}
                    </option>
                  ))}
                </select>
                {errors.FacilityId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.FacilityId}</span>}
              </div>

              {/* Department */}
              <div>
                <label style={labelStyle}>
                  Department <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.DepartmentId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.DepartmentId)}
                  value={formData.DepartmentId || ''}
                  onChange={e => handleFieldChange('DepartmentId', Number(e.target.value))}
                >
                  <option value="">Select Department</option>
                  {(lookups.Department || []).map(dept => (
                    <option key={dept.Id} value={dept.Id}>
                      {dept.Text}
                    </option>
                  ))}
                </select>
                {errors.DepartmentId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.DepartmentId}</span>}
              </div>

              {/* Sub Department */}
              <div>
                <label style={labelStyle}>Sub Department</label>
                <select
                  style={selectStyle()}
                  value={formData.SubDepartmentId || ''}
                  onChange={e => handleFieldChange('SubDepartmentId', Number(e.target.value))}
                >
                  <option value="">Select Sub Department</option>
                  {(lookups.SubDepartment || []).map(sd => (
                    <option key={sd.Id} value={sd.Id}>
                      {sd.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Group */}
              <div>
                <label style={labelStyle}>
                  User Group <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.UserGroupId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.UserGroupId)}
                  value={formData.UserGroupId || ''}
                  onChange={e => handleFieldChange('UserGroupId', Number(e.target.value))}
                >
                  <option value="">Select Group</option>
                  {(lookups.Group || []).map(g => (
                    <option key={g.Id} value={g.Id}>
                      {g.Text}
                    </option>
                  ))}
                </select>
                {errors.UserGroupId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.UserGroupId}</span>}
              </div>

              {/* Billing Counter */}
              <div>
                <label style={labelStyle}>Billing Counter</label>
                <select
                  style={selectStyle()}
                  value={formData.BillingCounterId || ''}
                  onChange={e => handleFieldChange('BillingCounterId', Number(e.target.value))}
                >
                  <option value="">Select Billing Counter</option>
                  {(lookups.BillingCounter || []).map(bc => (
                    <option key={bc.Id} value={bc.Id}>
                      {bc.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Type */}
              <div>
                <label style={labelStyle}>
                  User Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className={errors.UserTypeId ? 'hims-input-error' : ''}
                  style={selectStyle(!!errors.UserTypeId)}
                  value={formData.UserTypeId || ''}
                  onChange={e => handleFieldChange('UserTypeId', Number(e.target.value))}
                >
                  <option value="">Select User Type</option>
                  {(lookups.UserType || []).map(ut => (
                    <option key={ut.Id} value={ut.Id}>
                      {ut.Text}
                    </option>
                  ))}
                </select>
                {errors.UserTypeId && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.UserTypeId}</span>}
              </div>

              {/* UserName / Login */}
              <div>
                <label style={labelStyle}>
                  Login Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className={errors.UserName ? 'hims-input-error' : ''}
                  style={inputStyle(!!errors.UserName)}
                  value={formData.UserName || ''}
                  onChange={e => handleFieldChange('UserName', e.target.value)}
                  placeholder="Unique username"
                />
                {errors.UserName && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.UserName}</span>}
                {reactProps?.usernamecriteriamsg && (
                  <span style={{ color: '#64748b', fontSize: 11, marginTop: 3, display: 'block' }}>
                    ℹ️ {reactProps.usernamecriteriamsg}
                  </span>
                )}
              </div>

              {/* Use Default Password (when adding new) */}
              {(userId === 0 || !userId) && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={labelStyle}>Password Defaults</label>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={!!formData.UseDefaultPassword}
                      onChange={e => handleFieldChange('UseDefaultPassword', e.target.checked)}
                    />
                    <span>Use Default Password</span>
                  </label>
                </div>
              )}

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className={errors.Password ? 'hims-input-error' : ''}
                  disabled={formData.UseDefaultPassword}
                  style={inputStyle(!!errors.Password)}
                  value={formData.Password || ''}
                  onChange={e => handleFieldChange('Password', e.target.value)}
                  placeholder="••••••••"
                />
                {errors.Password && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.Password}</span>}
                {reactProps?.pwdcriteriamsg && (
                  <span style={{ color: '#64748b', fontSize: 11, marginTop: 3, display: 'block' }}>
                    ℹ️ {reactProps.pwdcriteriamsg}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className={errors.ConfirmPassword ? 'hims-input-error' : ''}
                  disabled={formData.UseDefaultPassword}
                  style={inputStyle(!!errors.ConfirmPassword)}
                  value={formData.ConfirmPassword || ''}
                  onChange={e => handleFieldChange('ConfirmPassword', e.target.value)}
                  placeholder="••••••••"
                />
                {errors.ConfirmPassword && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.ConfirmPassword}</span>}
              </div>

              {/* Application Login Permission */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={labelStyle}>App Permission</label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={formData.LoginPermission === 1 || formData.LoginPermission === true}
                    onChange={e => handleFieldChange('LoginPermission', e.target.checked ? 1 : 0)}
                  />
                  <span>Application Login Permission</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: File Uploads & Image Previews */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>
              <i className="fa fa-camera-retro" />
              <span>User Profile Photo & Signature</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: spacing.xl }}>
              {/* Profile Photo */}
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.md
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>Profile Picture</span>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: `2px dashed ${colors.border}`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff'
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="User Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa fa-user" style={{ fontSize: 48, color: '#94a3b8' }} />
                  )}
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: radii.md,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <i className="fa fa-upload" /> Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch('openWebCam')}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: radii.md,
                      border: `1px solid ${colors.border}`,
                      backgroundColor: '#fff',
                      color: colors.textMain,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <i className="fa fa-video" /> Webcam
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      style={{
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: radii.md,
                        border: '1px solid #ef4444',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <i className="fa fa-trash-alt" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Digital Signature */}
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.md
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>Digital Signature</span>
                <div
                  style={{
                    width: 220,
                    height: 120,
                    borderRadius: radii.md,
                    border: `2px dashed ${colors.border}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    padding: 4
                  }}
                >
                  {signPreview ? (
                    <img src={signPreview} alt="Signature Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <i className="fa fa-signature" style={{ fontSize: 32, marginBottom: 4 }} />
                      <div style={{ fontSize: 11 }}>No signature uploaded</div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={signInputRef}
                  onChange={handleSignSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => signInputRef.current?.click()}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: radii.md,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <i className="fa fa-folder-open" /> Browse Signature
                  </button>

                  {signPreview && (
                    <button
                      type="button"
                      onClick={handleClearSign}
                      style={{
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: radii.md,
                        border: '1px solid #ef4444',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <i className="fa fa-trash-alt" /> Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Footer */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              borderTop: `1px solid ${colors.border}`,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: `${radii.md} ${radii.md} 0 0`,
              boxShadow: '0 -4px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => dispatch('backToList')}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#fff',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="fa fa-arrow-left" /> Back
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              {Object.keys(errors).length > 0 && (
                <div
                  style={{
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#fef2f2',
                    padding: '6px 12px',
                    borderRadius: radii.md,
                    border: '1px solid #fecaca'
                  }}
                >
                  <i className="fa fa-exclamation-circle" />
                  <span>Please fill required fields (highlighted in red)</span>
                </div>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={() => initiateSave('save')}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.primary}`,
                  backgroundColor: '#fff',
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {saving && <i className="fa fa-spinner fa-spin" />}
                Save Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => initiateSave('approve')}
                style={{
                  padding: '7px 22px',
                  borderRadius: radii.md,
                  border: 'none',
                  backgroundColor: colors.primary,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                }}
              >
                {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-check-circle" />}
                Approve User
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserFormScreen;
