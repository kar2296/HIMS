import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { spacing, typography, radii } from '../components/ui/tokens';

export interface UserInfoData {
  UserId?: number;
  Id?: number;
  UserName?: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Age?: number | string;
  DOB?: string;
  Gender?: { Description?: string } | string;
  GenderId?: number;
  Mobile?: string;
  Email?: string;
  Qualification?: string;
  Designation?: string;
  ClinicalRole?: { Description?: string } | string;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  City?: string;
  District?: string;
  State?: string;
  Country?: string;
  Pincode?: string;
  PhotoPath?: string;
  PhotoBase64?: string;
  SignPath?: string;
  LoginPermission?: boolean | number;
  IsActive?: boolean;
  ActiveStatusId?: number;
  ActiveStatus?: { Description?: string } | string;
  Organization?: { OrgName?: string };
  OrgName?: string;
  Facility?: { FacilityName?: string };
  FacilityName?: string;
  Department?: { DepartmentName?: string };
  SubDepartment?: { DepartmentName?: string };
  Group?: { GroupName?: string };
  UserType?: { Description?: string };
  Speciality?: { SpecialityName?: string };
  Title?: { Description?: string };
  [key: string]: any;
}

export interface UserInfoScreenProps {
  reactProps?: {
    item?: UserInfoData;
    userId?: number;
    photoBase64?: string;
    isModal?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const UserInfoScreen: React.FC<UserInfoScreenProps> = ({
  reactProps,
  onAction
}) => {
  const isModal = reactProps?.isModal || false;

  const [userData, setUserData] = useState<UserInfoData | null>(reactProps?.item || null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(reactProps?.photoBase64 || null);
  const [loading, setLoading] = useState<boolean>(!reactProps?.item);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Sync props from AngularJS bridge
  useEffect(() => {
    if (reactProps?.item) {
      setUserData(reactProps.item);
    }
    if (reactProps?.photoBase64) {
      setPhotoBase64(reactProps.photoBase64);
    }
  }, [reactProps]);

  // Standalone fetch if not provided via bridge
  useEffect(() => {
    if (userData && !loading) return;

    let isMounted = true;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let currentUserId = reactProps?.userId;

        // Try getting user ID from session / local storage if standalone
        if (!currentUserId) {
          const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              currentUserId = parsed.UserId || parsed.id || parsed.Id;
            } catch (e) {
              // ignore
            }
          }
        }

        // Fallback default user ID to 1 if not available
        if (!currentUserId) {
          currentUserId = 1;
        }

        const res = await apiFetch<any>('SystemSettings/User/GetUsers', {
          Params: [{ Key: 0, Value: currentUserId }]
        });

        if (isMounted && res?.Data && res.Data.length > 0) {
          const user = res.Data[0];
          setUserData(user);

          // Fetch photo if available
          if (user.PhotoPath) {
            try {
              const photoRes = await apiFetch<any>('SystemSettings/User/GetUserProfilePic', {
                Data: { PhotoPath: user.PhotoPath }
              });
              if (isMounted && photoRes) {
                setPhotoBase64(typeof photoRes === 'string' ? photoRes : photoRes.Photo || null);
              }
            } catch (photoErr) {
              console.warn('Failed to load profile photo:', photoErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [reactProps?.userId]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopyToast(`${label} copied to clipboard!`);
      setTimeout(() => setCopyToast(null), 2500);
    }).catch(() => {});
  };

  const handleBack = () => {
    if (onAction) {
      onAction('back');
    } else {
      window.location.hash = '#/app/users';
    }
  };

  const handleClose = () => {
    if (onAction) {
      onAction('close');
    } else {
      window.history.back();
    }
  };

  // Helper getters
  const getTitle = () => {
    if (userData?.Title && typeof userData.Title === 'object') return userData.Title.Description || '';
    return '';
  };

  const getFullName = () => {
    if (!userData) return '';
    const parts = [
      getTitle(),
      userData.FirstName,
      userData.MiddleName,
      userData.LastName
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : (userData.UserName || 'Unnamed User');
  };

  const getGenderText = () => {
    if (userData?.Gender && typeof userData.Gender === 'object') return userData.Gender.Description || 'Not Specified';
    if (typeof userData?.Gender === 'string') return userData.Gender;
    if (userData?.GenderId === 1) return 'Male';
    if (userData?.GenderId === 2) return 'Female';
    return 'Not Specified';
  };

  const getClinicalRole = () => {
    if (userData?.ClinicalRole && typeof userData.ClinicalRole === 'object') return userData.ClinicalRole.Description;
    if (typeof userData?.ClinicalRole === 'string') return userData.ClinicalRole;
    return userData?.Designation || 'Hospital Staff';
  };

  const getFormattedDOB = () => {
    if (!userData?.DOB) return 'N/A';
    try {
      const d = new Date(userData.DOB);
      if (isNaN(d.getTime())) return String(userData.DOB);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(userData.DOB);
    }
  };

  const getAddressString = () => {
    if (!userData) return 'No address on file';
    const parts = [
      userData.AddressLine1,
      userData.AddressLine2,
      userData.Area,
      userData.City,
      userData.District,
      userData.State,
      userData.Country ? (userData.Pincode ? `${userData.Country} - ${userData.Pincode}` : userData.Country) : userData.Pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address on file';
  };

  const orgName = userData?.Organization?.OrgName || userData?.OrgName || 'Primary Organization';
  const facilityName = userData?.Facility?.FacilityName || userData?.FacilityName || 'Main Hospital';
  const departmentName = userData?.Department?.DepartmentName || userData?.UserDept?.DepartmentName || 'General';
  const subDepartmentName = userData?.SubDepartment?.DepartmentName || 'None';
  const userGroupName = userData?.Group?.GroupName || 'General User';
  const userTypeName = userData?.UserType?.Description || 'Staff';
  const hasLoginAccess = userData?.LoginPermission === true || userData?.LoginPermission === 1;
  const isActive = userData?.IsActive !== false && userData?.ActiveStatusId !== 3;

  return (
    <div style={{
      minHeight: isModal ? 'auto' : '100vh',
      backgroundColor: isModal ? 'transparent' : '#f8fafc',
      fontFamily: typography.fontFamily,
      padding: isModal ? spacing['2'] : `${spacing['6']} ${spacing['8']}`,
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Toast Notification */}
      {copyToast && (
        <div style={{
          position: 'fixed',
          top: 30,
          right: 30,
          zIndex: 99999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: radii.md,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>✅</span>
          <span>{copyToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['6']
      }}>
        {/* Top Header Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Cover gradient band */}
          <div style={{
            height: 90,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #0d9488 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '16px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                HIMS User Profile & Information
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isModal ? (
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#ffffff',
                    width: 32,
                    height: 32,
                    borderRadius: radii.full,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.15s'
                  }}
                  title="Close Dialog"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: radii.md,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.28)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
                >
                  <span>←</span> Back to Users
                </button>
              )}
            </div>
          </div>

          {/* Profile Identity Bar */}
          <div style={{
            padding: '0 28px 24px 28px',
            position: 'relative',
            marginTop: -42,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16
          }}>
            {/* Avatar & Main Info */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              {/* Profile Image Frame */}
              <div style={{
                width: 96,
                height: 96,
                borderRadius: radii.xl,
                backgroundColor: '#ffffff',
                border: '4px solid #ffffff',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {photoBase64 ? (
                  <img
                    src={`data:image/png;base64,${photoBase64}`}
                    alt="User Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 700
                  }}>
                    {(userData?.FirstName?.[0] || userData?.UserName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Name */}
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em'
                  }}>
                    {loading ? 'Loading Profile...' : getFullName()}
                  </h1>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 9px',
                    borderRadius: radii.full,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                    color: isActive ? '#059669' : '#dc2626',
                    border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#10b981' : '#ef4444'
                    }}></span>
                    {isActive ? 'Active Account' : 'Inactive'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 6,
                  color: '#64748b',
                  fontSize: 13
                }}>
                  <span style={{ fontWeight: 600, color: '#0369a1' }}>
                    {getClinicalRole()}
                  </span>
                  <span>•</span>
                  <span>{facilityName}</span>
                  <span>•</span>
                  <span style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                    @{userData?.UserName || '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: spacing['6']
        }}>
          {/* Card 1: Personal & Demographic Info */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 12
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}>
                👤
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Personal Information
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Demographics and personal details</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Login Name
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {userData?.UserName || '—'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Gender
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {getGenderText()}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Age / Date of Birth
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {userData?.Age ? `${userData.Age} yrs` : '—'} / {getFormattedDOB()}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Qualification
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {userData?.Qualification || '—'}
                </span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Residential Address
                </span>
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                  {getAddressString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Communication */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 12
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}>
                📞
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Contact Information
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Reachability and verified channels</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Mobile Phone */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: radii.lg,
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📱</span>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mobile Phone</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {userData?.Mobile || 'Not provided'}
                    </div>
                  </div>
                </div>
                {userData?.Mobile && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userData.Mobile!, 'Mobile number')}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: radii.sm,
                      padding: '4px 8px',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* Email Address */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: radii.lg,
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>✉️</span>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {userData?.Email || 'Not provided'}
                    </div>
                  </div>
                </div>
                {userData?.Email && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userData.Email!, 'Email address')}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: radii.sm,
                      padding: '4px 8px',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* Landline / Alternate */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: radii.lg,
                border: '1px solid #f1f5f9',
                gap: 10
              }}>
                <span style={{ fontSize: 18 }}>☎️</span>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Landline / Desk Phone</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {userData?.LandLine || 'None registered'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Organization & Hospital Mapping */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 12
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}>
                🏥
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Hospital & Department
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Organizational mapping and unit</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Organization
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {orgName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Hospital / Facility
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {facilityName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Primary Department
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {departmentName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Sub-Department
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {subDepartmentName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Clinical Speciality
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {userData?.Speciality?.SpecialityName || 'General Clinical'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Designation Role
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {getClinicalRole()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Access & Security Permissions */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 12
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}>
                🛡️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Security & Access Permissions
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>User group and system authorization</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  User Group
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  padding: '3px 10px',
                  borderRadius: radii.sm,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {userGroupName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  User Type
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {userTypeName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Login Permission
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: hasLoginAccess ? '#059669' : '#dc2626'
                }}>
                  <span>{hasLoginAccess ? '🟢 Enabled' : '🔴 Disabled'}</span>
                </span>
              </div>

              <div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 2 }}>
                  Tablet / Mobile Access
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {userData?.TabletAccess ? 'Tablet: Yes' : 'Tablet: No'} | {userData?.MobileAccess ? 'Mobile: Yes' : 'Mobile: No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 12,
          padding: '12px 0 24px 0'
        }}>
          Healthcare Information Management System • Profile Details for User #{userData?.UserId || userData?.Id || '—'}
        </div>
      </div>
    </div>
  );
};
