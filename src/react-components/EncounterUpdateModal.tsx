import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows, zIndex } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';

export interface EncounterUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  encounterId: number | null;
  patientId: number | null;
  facilityId?: number;
}

export const EncounterUpdateModal: React.FC<EncounterUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  encounterId,
  patientId,
  facilityId,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [encounterData, setEncounterData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);

  // Lookups
  const [doctorList, setDoctorList] = useState<Array<{ Id: number; Text?: string; FirstName?: string; LastName?: string; Title?: { Description?: string } }>>([]);
  const [referralTypeList, setReferralTypeList] = useState<Array<{ Id: number; Text: string }>>([]);

  // Form Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(-1);
  const [selectedReferralTypeId, setSelectedReferralTypeId] = useState<number>(-1);
  const [selectedReferralId, setSelectedReferralId] = useState<number | null>(null);
  const [selectedReferralName, setSelectedReferralName] = useState<string>('');

  // Referral typeahead
  const [referralSearchQuery, setReferralSearchQuery] = useState<string>('');
  const [referralResults, setReferralResults] = useState<any[]>([]);
  const [isSearchingReferral, setIsSearchingReferral] = useState<boolean>(false);
  const [showReferralDropdown, setShowReferralDropdown] = useState<boolean>(false);
  const referralDropdownRef = useRef<HTMLDivElement>(null);

  // Error/Success messages
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const currentFacility = facilityId || sessionHelper.getCurrentFacilityId() || 1;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (referralDropdownRef.current && !referralDropdownRef.current.contains(e.target as Node)) {
        setShowReferralDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Lookups
  useEffect(() => {
    if (!isOpen) return;

    const fetchLookups = async () => {
      try {
        const lookupReq = [
          { Key: 'ReferralType' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 2, Value: [-1, currentFacility] }],
            },
          },
        ];

        const res = await apiFetch('General/Options/getoptions', lookupReq);
        if (res && res.Data) {
          if (Array.isArray(res.Data.Doctor)) {
            setDoctorList(res.Data.Doctor);
          }
          if (Array.isArray(res.Data.ReferralType)) {
            setReferralTypeList(res.Data.ReferralType);
          }
        }
      } catch (err) {
        console.error('Failed to load lookups for EncounterUpdateModal', err);
      }
    };

    fetchLookups();
  }, [isOpen, currentFacility]);

  // Fetch Encounter & Patient Data
  useEffect(() => {
    if (!isOpen || !encounterId) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage('');
    setSuccessToast('');

    const loadData = async () => {
      try {
        // 1. Get Encounter Details
        const encRes = await apiFetch('Visit/Visit/GetEncounterById', { Id: encounterId });
        const enc = encRes?.Data || encRes;

        if (isMounted && enc) {
          setEncounterData(enc);
          setSelectedDoctorId(enc.DoctorId ?? -1);
          setSelectedReferralTypeId(enc.ReferralTypeId ?? -1);
          setSelectedReferralId(enc.ReferralId ?? null);

          const refName = enc.Referral?.ReferralName || enc.ReferralName || '';
          const refCode = enc.Referral?.ReferralCode || '';
          const displayRef = refName ? (refCode ? `${refName} (${refCode})` : refName) : '';
          setSelectedReferralName(displayRef);
          setReferralSearchQuery(displayRef);
        }

        // 2. Get Patient Details if patientId available
        const pid = patientId || enc?.PatientId;
        if (pid) {
          try {
            const patRes = await apiFetch('registration/patient/GetPatientById', { Id: pid });
            if (isMounted && patRes?.Data) {
              setPatientData(patRes.Data);
            }
          } catch (e) {
            console.warn('Could not fetch patient details', e);
          }
        }
      } catch (err: any) {
        console.error('Error fetching encounter details:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Failed to load encounter information');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, encounterId, patientId]);

  // Referral Live Search Debounce
  useEffect(() => {
    if (!referralSearchQuery || referralSearchQuery.length < 2) {
      setReferralResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingReferral(true);
      try {
        const params: any[] = [
          { Key: 8, Value: 1 },
          { Key: 1, Value: referralSearchQuery },
        ];
        if (selectedReferralTypeId > 0) {
          params.push({ Key: 3, Value: selectedReferralTypeId });
        }

        const res = await apiFetch('generalmaster/referral/GetReferrals', {
          Params: params,
          PageContext: { PageSize: 30, PageNumber: 1 },
        });

        const list = res?.Data || [];
        setReferralResults(list);
        setShowReferralDropdown(true);
      } catch (err) {
        console.error('Referral search error', err);
      } finally {
        setIsSearchingReferral(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [referralSearchQuery, selectedReferralTypeId]);

  const handleSelectReferral = (item: any) => {
    setSelectedReferralId(item.Id);
    const label = `${item.ReferralName || ''}${item.ReferralCode ? ` (${item.ReferralCode})` : ''}`;
    setSelectedReferralName(label);
    setReferralSearchQuery(label);
    setShowReferralDropdown(false);
  };

  const handleClearReferral = () => {
    setSelectedReferralId(null);
    setSelectedReferralName('');
    setReferralSearchQuery('');
    setShowReferralDropdown(false);
  };

  const handleSave = async () => {
    if (!encounterId) return;

    setSaving(true);
    setErrorMessage('');

    try {
      // Find selected doctor text
      const selectedDocObj = doctorList.find((d) => d.Id === selectedDoctorId);
      let docName = '';
      if (selectedDocObj) {
        const parts = [
          selectedDocObj.Title?.Description,
          selectedDocObj.FirstName,
          selectedDocObj.LastName,
        ].filter(Boolean);
        docName = parts.length > 0 ? parts.join(' ') : (selectedDocObj.Text || '');
      }

      const updatedPayload = {
        ...(encounterData || {}),
        Id: encounterId,
        DoctorId: selectedDoctorId > 0 ? selectedDoctorId : null,
        DoctorName: docName || encounterData?.DoctorName,
        ReferralTypeId: selectedReferralTypeId > 0 ? selectedReferralTypeId : null,
        ReferralId: selectedReferralId,
        ReferralName: selectedReferralName || encounterData?.ReferralName,
      };

      await apiFetch('Visit/Visit/UpdateEncounter', { Data: updatedPayload });

      setSuccessToast('Encounter updated successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Save encounter error:', err);
      setErrorMessage(err?.message || 'Failed to update encounter details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Patient Demographic helper
  const patientDisplayName = patientData
    ? [patientData.Title?.Description, patientData.FirstName, patientData.LastName].filter(Boolean).join(' ')
    : encounterData?.Patient
    ? [encounterData.Patient.Title?.Description, encounterData.Patient.FirstName, encounterData.Patient.LastName].filter(Boolean).join(' ')
    : 'Patient';

  const patientMrn = patientData?.MRN || encounterData?.Patient?.MRN || encounterData?.MRN || '-';
  const patientAge = patientData?.Age ?? encounterData?.Patient?.Age ?? '-';
  const patientGender = patientData?.Gender?.Description || encounterData?.Patient?.Gender?.Description || '-';
  const patientMobile = patientData?.Mobile || (patientData?.PrimaryContact?.Phone1) || encounterData?.Patient?.Mobile || '-';
  const guarantorName = patientData?.Encounters?.[0]?.EncounterGuarantors?.[0]?.Guarantor?.GuarantorName || encounterData?.Guarantor?.GuarantorName || 'Self / General';
  const visitIdentifier = encounterData?.VisitIdentifier || encounterData?.Id || '-';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.modal || 1050,
        padding: spacing.md,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: colors.surface || '#ffffff',
          borderRadius: radii.xl || '16px',
          boxShadow: shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.lg}`,
            borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.md || '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: colors.primary?.main || '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-user-doctor" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 600,
                  color: colors.textMain || '#0f172a',
                  fontFamily: typography.fontFamily,
                }}
              >
                Update Referral & Doctor
              </h3>
              <span style={{ fontSize: '12px', color: colors.textMuted || '#64748b' }}>
                Visit #{visitIdentifier} • Patient MRN: {patientMrn}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm || '6px',
              border: 'none',
              background: 'transparent',
              color: colors.textMuted || '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1, position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255,255,255,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                gap: spacing.sm,
              }}
            >
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: colors.primary?.main || '#2563eb' }} />
              <span style={{ fontSize: '13px', color: colors.textMuted || '#64748b', fontWeight: 500 }}>
                Loading Encounter Details...
              </span>
            </div>
          )}

          {/* Toast / Error Notices */}
          {errorMessage && (
            <div
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: radii.md || '8px',
                color: '#b91c1c',
                fontSize: '13px',
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <i className="fa-solid fa-circle-exclamation" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successToast && (
            <div
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: radii.md || '8px',
                color: '#15803d',
                fontSize: '13px',
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <i className="fa-solid fa-circle-check" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Patient Header Banner */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: `1px solid ${colors.border || '#e2e8f0'}`,
              borderRadius: radii.lg || '12px',
              padding: spacing.md,
              marginBottom: spacing.lg,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: spacing.sm,
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted || '#64748b', fontWeight: 600 }}>
                Patient Name
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textMain || '#0f172a', marginTop: 2 }}>
                {patientDisplayName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted || '#64748b', fontWeight: 600 }}>
                MRN / UHID
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.primary?.main || '#2563eb', marginTop: 2 }}>
                {patientMrn}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted || '#64748b', fontWeight: 600 }}>
                Age / Gender
              </div>
              <div style={{ fontSize: '13px', color: colors.textMain || '#0f172a', marginTop: 2 }}>
                {patientAge} Y / {patientGender}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted || '#64748b', fontWeight: 600 }}>
                Contact No
              </div>
              <div style={{ fontSize: '13px', color: colors.textMain || '#0f172a', marginTop: 2 }}>
                {patientMobile}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted || '#64748b', fontWeight: 600 }}>
                Guarantor / Payer
              </div>
              <div style={{ fontSize: '13px', color: colors.textMain || '#0f172a', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {guarantorName}
              </div>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Field: Attending / Approved Doctor */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textMain || '#0f172a',
                  marginBottom: spacing.xs,
                }}
              >
                Approved By / Doctor <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedDoctorId ?? ''}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: colors.textMain || '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <option value="-1">-- Select Doctor --</option>
                  {doctorList.map((doc) => {
                    const label = doc.Text
                      ? doc.Text
                      : [doc.Title?.Description, doc.FirstName, doc.LastName].filter(Boolean).join(' ');
                    return (
                      <option key={doc.Id} value={doc.Id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Field: Source Type (Referral Type) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textMain || '#0f172a',
                  marginBottom: spacing.xs,
                }}
              >
                Source Type (Referral Type)
              </label>
              <select
                value={selectedReferralTypeId ?? ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedReferralTypeId(val);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: colors.textMain || '#0f172a',
                  outline: 'none',
                }}
              >
                <option value="-1">-- Select Source Type --</option>
                {referralTypeList.map((rt) => (
                  <option key={rt.Id} value={rt.Id}>
                    {rt.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* Field: Referred By (Autosearch referral) */}
            <div ref={referralDropdownRef} style={{ position: 'relative' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textMain || '#0f172a',
                  marginBottom: spacing.xs,
                }}
              >
                Referred By / Referral Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Type to search referral name or code..."
                  value={referralSearchQuery}
                  onChange={(e) => {
                    setReferralSearchQuery(e.target.value);
                    if (!showReferralDropdown) setShowReferralDropdown(true);
                  }}
                  onFocus={() => {
                    if (referralResults.length > 0) setShowReferralDropdown(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 12px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: colors.textMain || '#0f172a',
                    outline: 'none',
                  }}
                />
                {isSearchingReferral && (
                  <i
                    className="fa-solid fa-circle-notch fa-spin"
                    style={{ position: 'absolute', right: 12, color: colors.primary?.main || '#2563eb' }}
                  />
                )}
                {!isSearchingReferral && selectedReferralId && (
                  <button
                    type="button"
                    onClick={handleClearReferral}
                    style={{
                      position: 'absolute',
                      right: 10,
                      background: 'none',
                      border: 'none',
                      color: colors.textMuted || '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    title="Clear selected referral"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Referral Autosearch Dropdown */}
              {showReferralDropdown && referralResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    borderRadius: radii.md || '8px',
                    boxShadow: shadows.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    marginTop: 4,
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 50,
                  }}
                >
                  {referralResults.map((item) => (
                    <div
                      key={item.Id}
                      onClick={() => handleSelectReferral(item)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                          {item.ReferralName}
                        </span>
                        {item.ReferralCode && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#e2e8f0',
                              color: '#475569',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.ReferralCode}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textMuted || '#64748b', display: 'flex', gap: spacing.md }}>
                        {item.PhoneNo && <span>Tel: {item.PhoneNo}</span>}
                        {item.AddressLine1 && <span>{item.AddressLine1}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            padding: `${spacing.md} ${spacing.lg}`,
            borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
            backgroundColor: '#f8fafc',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '8px 16px',
              borderRadius: radii.md || '8px',
              border: `1px solid ${colors.border || '#cbd5e1'}`,
              backgroundColor: '#ffffff',
              color: colors.textMain || '#334155',
              fontSize: '13px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              padding: '8px 20px',
              borderRadius: radii.md || '8px',
              border: 'none',
              backgroundColor: colors.primary?.main || '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
