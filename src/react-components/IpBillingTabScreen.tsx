import React from 'react';
import { colors, radii, shadows, typography, spacing } from '../components/ui/tokens';

export interface IpBillingTabItem {
  title: string;
  state: string;
  canDisable?: boolean;
}

export interface IpBillingTabScreenProps {
  reactProps?: {
    Data?: any;
    selectedPatient?: any;
    EncounterDetails?: any;
    item?: any;
    FinalBillInfo?: any;
    Islocked?: boolean;
    tabs?: IpBillingTabItem[];
    activeTabState?: string;
    patientAlertsCount?: number;
    currentcontext?: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IpBillingTabScreen: React.FC<IpBillingTabScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const {
    Data = {},
    selectedPatient = {},
    EncounterDetails = {},
    item = {},
    FinalBillInfo = {},
    Islocked = false,
    tabs = [],
    patientAlertsCount = 0,
    currentcontext = {},
  } = reactProps || {};

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const isDayCare = Boolean(currentcontext?.isdaycare);
  const isBillLocked = Boolean(Islocked || item?.IsBillLock);

  const [currentHash, setCurrentHash] = React.useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.hash : '';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Active tab detection
  const isTabActive = (tabState: string) => {
    const rawHash = (typeof window !== 'undefined' && window.location.hash ? window.location.hash : currentHash).toLowerCase();
    const cleanHash = rawHash.replace(/[-_]/g, '');
    const cleanState = tabState.toLowerCase().replace(/[-_]/g, '');
    const tabKey = cleanState.split('.').pop() || '';

    if (tabKey === 'summary') {
      return (
        cleanHash.includes('summary') ||
        (!cleanHash.includes('billdetails') &&
          !cleanHash.includes('receipts') &&
          !cleanHash.includes('refunds') &&
          !cleanHash.includes('insurancebill') &&
          !cleanHash.includes('pharmacybill'))
      );
    }
    if (tabKey === 'billdetails') {
      return cleanHash.includes('billdetails') || cleanHash.includes('ipbilldetails');
    }
    if (tabKey === 'receipts') {
      return cleanHash.includes('receipts');
    }
    if (tabKey === 'refunds') {
      return cleanHash.includes('refunds');
    }
    if (tabKey === 'insurancebill') {
      return cleanHash.includes('insurancebill');
    }
    if (tabKey === 'pharmacybillmodify') {
      return cleanHash.includes('pharmacybillmodify') || cleanHash.includes('pharmacybill');
    }

    if (reactProps?.activeTabState) {
      return reactProps.activeTabState === tabState;
    }

    return cleanHash.includes(tabKey);
  };

  // Helper date formatter
  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${mins}`;
    } catch {
      return String(dateVal);
    }
  };

  const patientName = [
    selectedPatient?.Title?.Description,
    selectedPatient?.FirstName,
    selectedPatient?.LastName,
  ].filter(Boolean).join(' ') || (Data?.PatientName || '-');

  const uhid = selectedPatient?.MRN || selectedPatient?.PatientMrn || Data?.PatientMrn || '-';
  const visitId = EncounterDetails?.VisitIdentifier || Data?.VisitIdentifier || '-';
  const age = selectedPatient?.Age ? `${selectedPatient.Age} Y` : Data?.Age ? `${Data.Age} Y` : '-';
  const gender = selectedPatient?.Gender?.Description || selectedPatient?.GenderName || Data?.GenderName || '-';

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        padding: '0 0 8px 0',
        width: '100%',
        color: colors.textMain,
        boxSizing: 'border-box',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. ENTERPRISE HEADER & TOP WORKSPACE BAR
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '10px 18px',
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: 10,
        }}
      >
        {/* Title, Department, & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: radii.md,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
              }}
            >
              <i className="fas fa-file-invoice-dollar" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isDayCare ? 'DayCare Billing' : 'In-Patient (IP) Billing'}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Encounter #{Data?.Id || currentcontext?.id || '-'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 1 }}>
                Hospital Information Management System • Inpatient Invoicing & Financial Settlement
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isBillLocked ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: radii.full,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
              >
                <i className="fas fa-lock" style={{ fontSize: 11 }} /> Billing Locked
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: radii.full,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block',
                  }}
                />
                Billing Active
              </span>
            )}

            {FinalBillInfo?.PatientBillStatus?.Description && (
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: radii.full,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                }}
              >
                {FinalBillInfo.PatientBillStatus.Description}
              </span>
            )}

            {Data?.IsPharmacyClearance !== undefined && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: radii.full,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: Data?.IsPharmacyClearance ? '#ecfdf5' : '#fffbeb',
                  color: Data?.IsPharmacyClearance ? '#059669' : '#b45309',
                  border: `1px solid ${Data?.IsPharmacyClearance ? '#a7f3d0' : '#fde68a'}`,
                }}
              >
                <i
                  className={Data?.IsPharmacyClearance ? 'fas fa-check-circle' : 'fas fa-clock'}
                  style={{ fontSize: 11 }}
                />
                Pharmacy: {Data?.IsPharmacyClearance ? 'Cleared' : 'Pending'}
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* IP Clearance */}
          <button
            type="button"
            onClick={() => dispatch('getIPClearence')}
            title="IP Clearance Check"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: radii.md,
              border: '1px solid #99f6e4',
              background: '#f0fdfa',
              color: '#0f766e',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-shield-alt" style={{ fontSize: 13, color: '#14b8a6' }} />
            IP Clearance
          </button>

          {/* Discharge History */}
          <button
            type="button"
            onClick={() => dispatch('patientDischarge')}
            title="Discharge History"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: radii.md,
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-history" style={{ fontSize: 13, color: '#3b82f6' }} />
            Discharge History
          </button>

          {/* Attachments */}
          <button
            type="button"
            onClick={() => dispatch('addAttachment')}
            title="Clinical Attachments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: radii.md,
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              color: '#c2410c',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-paperclip" style={{ fontSize: 13, color: '#f97316' }} />
            Attachments
            {patientAlertsCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: radii.full,
                  padding: '1px 6px',
                  marginLeft: 2,
                }}
              >
                {patientAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ENTERPRISE PATIENT IDENTITY HERO CARD (3-COLUMN MEDICAL GRID)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(290px, 1.1fr) minmax(280px, 1fr)',
          gap: 16,
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: 10,
        }}
      >
        {/* Column 1: Patient Primary Identity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            paddingRight: 16,
            borderRight: '1px solid #f1f5f9',
          }}
        >
          {/* Patient Avatar Circle */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.full,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 17,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
            }}
          >
            {patientName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Baby|Master)\s+/i, '').charAt(0).toUpperCase() || 'P'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => dispatch('patientprofiledetails', selectedPatient)}
                  title="View Patient Profile"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: 15,
                    textAlign: 'left',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                >
                  {patientName}
                </button>
                {selectedPatient?.IsVip && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#dc2626',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      padding: '1px 6px',
                      borderRadius: radii.sm,
                    }}
                  >
                    VIP
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch('patcmnts')}
                title="Patient Comments & Notes"
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              >
                <i className="fas fa-comment-dots" style={{ fontSize: 13 }} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                }}
              >
                {age} • {gender}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#1d4ed8',
                  backgroundColor: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #bfdbfe',
                  fontFamily: 'monospace',
                }}
              >
                UHID: {uhid}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#0f766e',
                  backgroundColor: '#f0fdfa',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #99f6e4',
                  fontFamily: 'monospace',
                }}
              >
                IP: {visitId}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Clinical Location & Care Team */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 6,
            paddingRight: 16,
            borderRight: '1px solid #f1f5f9',
          }}
        >
          {/* Ward / Room */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Ward / Room:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {item?.WardDetails || Data?.WardMaster?.WardName || '-'}
              </span>
              <button
                type="button"
                onClick={() => dispatch('Bedoccupancy')}
                title="Bed Occupancy & Bed Transfer History"
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '2px 6px',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <i className="fas fa-bed" style={{ fontSize: 11 }} />
                <span>Bed</span>
              </button>
            </div>
          </div>

          {/* Doctor / Referral */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Doctor / Ref:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  maxWidth: 180,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={`${item?.DoctorName || Data?.DoctorName || '-'} / ${item?.ReferralName || Data?.ReferralName || '-'}`}
              >
                {item?.DoctorName || Data?.DoctorName || '-'}/{item?.ReferralName || Data?.ReferralName || 'SELF'}
              </span>
              <button
                type="button"
                onClick={() => dispatch('addDoctor')}
                title="Transfer / Change Doctor"
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '2px 6px',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <i className="fas fa-user-md" style={{ fontSize: 11 }} />
                <span>Dr</span>
              </button>
            </div>
          </div>

          {/* Payer / TPA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Payer / TPA:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {Data?.Guarantor?.GuarantorName || 'CASH'}/{Data?.TPA?.Description || '-'}
              </span>
              <button
                type="button"
                onClick={() => dispatch('addGuarantor')}
                title="Edit Payer / Sponsor Details"
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '2px 6px',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <i className="fas fa-hand-holding-usd" style={{ fontSize: 11 }} />
                <span>Payer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Inpatient Dates & Invoicing */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          {/* DOA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              DOA:
            </span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              <i className="fas fa-calendar-check" style={{ marginRight: 5, color: '#059669', fontSize: 11 }} />
              {formatDate(Data?.AdmissionDate)}
            </span>
          </div>

          {/* DOD */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              DOD:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {formatDate(Data?.DischargeDate)}
              </span>
              <button
                type="button"
                onClick={() => dispatch('editdischarge')}
                title="Modify Discharge Date"
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '2px 6px',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <i className="fas fa-edit" style={{ fontSize: 11 }} />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Bill # / Bill Date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Bill # / Date:
            </span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {FinalBillInfo?.BillNumber || '-'} {FinalBillInfo?.BillDateTime ? `/ ${formatDate(FinalBillInfo.BillDateTime)}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ENTERPRISE TAB NAVIGATION STRIP
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: 12,
          backgroundColor: '#ffffff',
          borderRadius: `${radii.lg} ${radii.lg} 0 0`,
          padding: '0 12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
          {tabs.map((tab, idx) => {
            const active = isTabActive(tab.state);
            return (
              <button
                key={idx}
                type="button"
                disabled={tab.canDisable}
                onClick={() => {
                  dispatch('switchTab', tab);
                }}
                style={{
                  padding: '11px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: active ? '#2563eb' : tab.canDisable ? '#94a3b8' : '#64748b',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
                  marginBottom: -2,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Quick Toolbar (Lock Bill & Pending Orders) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          {/* Pending Orders Button */}
          <button
            type="button"
            onClick={() => dispatch('pendingorders')}
            title="Pending Diagnostic / Pharmacy Orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: radii.full,
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              color: '#c2410c',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="far fa-clock" style={{ fontSize: 12, color: '#f97316' }} />
            <span>Pending Orders</span>
          </button>

          {/* Lock / Unlock Bill Button */}
          <button
            type="button"
            onClick={() => dispatch('lockctrl')}
            title={isBillLocked ? 'Click to Unlock Bill' : 'Click to Lock Bill'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: radii.full,
              border: 'none',
              background: isBillLocked
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isBillLocked
                ? '0 2px 6px rgba(239, 68, 68, 0.3)'
                : '0 2px 6px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <i
              className={isBillLocked ? 'fas fa-lock' : 'fas fa-lock-open'}
              style={{ fontSize: 12 }}
            />
            <span>{isBillLocked ? 'Bill Locked' : 'Bill Active'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
