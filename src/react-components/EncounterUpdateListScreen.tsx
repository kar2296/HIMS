import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';
import { EncounterUpdateModal } from './EncounterUpdateModal';

export interface EncounterListItem {
  Id: number;
  PatientId: number;
  VisitIdentifier?: string;
  AdmissionDate?: string;
  DischargeDate?: string;
  AdmissionStatusId?: number;
  NoOfDays?: number;
  DoctorName?: string;
  ReferralName?: string;
  GuarantorName?: string;
  EncounterType?: {
    Id?: number;
    Description?: string;
  } | string;
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Age?: number | string;
    Title?: { Description?: string };
    Gender?: { Description?: string };
    Mobile?: string;
  };
  Doctor?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Guarantor?: {
    Id?: number;
    GuarantorName?: string;
  };
  ReferralType?: {
    Id?: number;
    Description?: string;
  };
  Referral?: {
    Id?: number;
    ReferralCode?: string;
    ReferralName?: string;
  };
  Created?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  [key: string]: any;
}

export interface EncounterUpdateListScreenProps {
  reactProps?: {
    items?: EncounterListItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      Doctor?: Array<{ Id: number; Text: string; FirstName?: string; LastName?: string; Title?: any }>;
      EncounterType?: Array<{ Id: number; Text: string }>;
      ReferralType?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      FacilityId?: number;
      FromDate?: string;
      ToDate?: string;
      PatientNameMRN?: string;
      DoctorId?: number;
      EncounterTypeId?: number;
      ReferralTypeId?: number;
      ReferralId?: number;
      ReferralName?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(val?: string): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mm}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const EncounterUpdateListScreen: React.FC<EncounterUpdateListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Facility
  const currentFacilityId = reactProps?.currentfilter?.FacilityId || sessionHelper.getCurrentFacilityId() || 1;

  // Filter States
  const [fromDate, setFromDate] = useState<string>(
    reactProps?.currentfilter?.FromDate ? reactProps.currentfilter.FromDate.substring(0, 10) : getTodayString()
  );
  const [toDate, setToDate] = useState<string>(
    reactProps?.currentfilter?.ToDate ? reactProps.currentfilter.ToDate.substring(0, 10) : getTodayString()
  );
  const [patientNameMRN, setPatientNameMRN] = useState<string>(reactProps?.currentfilter?.PatientNameMRN || '');
  const [doctorId, setDoctorId] = useState<number>(reactProps?.currentfilter?.DoctorId ?? -1);
  const [encounterTypeId, setEncounterTypeId] = useState<number>(reactProps?.currentfilter?.EncounterTypeId ?? -1);
  const [referralTypeId, setReferralTypeId] = useState<number>(reactProps?.currentfilter?.ReferralTypeId ?? -1);
  const [referralId, setReferralId] = useState<number | null>(reactProps?.currentfilter?.ReferralId || null);
  const [referralQuery, setReferralQuery] = useState<string>(reactProps?.currentfilter?.ReferralName || '');

  // Lookups
  const [doctorLookup, setDoctorLookup] = useState<any[]>(reactProps?.lookup?.Doctor || []);
  const [encounterTypeLookup, setEncounterTypeLookup] = useState<any[]>(reactProps?.lookup?.EncounterType || []);
  const [referralTypeLookup, setReferralTypeLookup] = useState<any[]>(reactProps?.lookup?.ReferralType || []);

  // Referral Filter Autocomplete
  const [referralResults, setReferralResults] = useState<any[]>([]);
  const [isSearchingReferral, setIsSearchingReferral] = useState<boolean>(false);
  const [showReferralDropdown, setShowReferralDropdown] = useState<boolean>(false);
  const referralFilterRef = useRef<HTMLDivElement>(null);

  // Pagination & Data States
  const [items, setItems] = useState<EncounterListItem[]>(reactProps?.items || []);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.lookup) {
        if (reactProps.lookup.Doctor) setDoctorLookup(reactProps.lookup.Doctor);
        if (reactProps.lookup.EncounterType) setEncounterTypeLookup(reactProps.lookup.EncounterType);
        if (reactProps.lookup.ReferralType) setReferralTypeLookup(reactProps.lookup.ReferralType);
      }
      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.FromDate) setFromDate(String(reactProps.currentfilter.FromDate).substring(0, 10));
        if (reactProps.currentfilter.ToDate) setToDate(String(reactProps.currentfilter.ToDate).substring(0, 10));
        if (reactProps.currentfilter.PatientNameMRN !== undefined) setPatientNameMRN(reactProps.currentfilter.PatientNameMRN);
        if (reactProps.currentfilter.DoctorId !== undefined) setDoctorId(reactProps.currentfilter.DoctorId);
        if (reactProps.currentfilter.EncounterTypeId !== undefined) setEncounterTypeId(reactProps.currentfilter.EncounterTypeId);
        if (reactProps.currentfilter.ReferralTypeId !== undefined) setReferralTypeId(reactProps.currentfilter.ReferralTypeId);
        if (reactProps.currentfilter.ReferralId !== undefined) setReferralId(reactProps.currentfilter.ReferralId);
      }
    }
  }, [reactProps]);

  // Outside click for referral filter typeahead
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (referralFilterRef.current && !referralFilterRef.current.contains(e.target as Node)) {
        setShowReferralDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Lookups (in standalone or if missing)
  useEffect(() => {
    if (doctorLookup.length > 0 && encounterTypeLookup.length > 0 && referralTypeLookup.length > 0) return;

    const fetchLookups = async () => {
      try {
        const inputData = [
          { Key: 'ReferralType' },
          { Key: 'EncounterType' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 2, Value: [-1, currentFacilityId] }],
            },
          },
        ];

        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res && res.Data) {
          if (Array.isArray(res.Data.Doctor)) setDoctorLookup(res.Data.Doctor);
          if (Array.isArray(res.Data.EncounterType)) setEncounterTypeLookup(res.Data.EncounterType);
          if (Array.isArray(res.Data.ReferralType)) setReferralTypeLookup(res.Data.ReferralType);
        }
      } catch (err) {
        console.error('Failed to load filter lookups:', err);
      }
    };

    fetchLookups();
  }, [currentFacilityId]);

  // Referral Filter Autocomplete Debounce
  useEffect(() => {
    if (!referralQuery || referralQuery.length < 2) {
      setReferralResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingReferral(true);
      try {
        const params: any[] = [
          { Key: 8, Value: 1 },
          { Key: 1, Value: referralQuery },
        ];
        if (referralTypeId > 0) {
          params.push({ Key: 3, Value: referralTypeId });
        }

        const res = await apiFetch('generalmaster/referral/GetReferrals', {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: 1 },
        });

        const list = res?.Data || [];
        setReferralResults(list);
        setShowReferralDropdown(true);
      } catch (err) {
        console.error('Referral filter search error:', err);
      } finally {
        setIsSearchingReferral(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [referralQuery, referralTypeId]);

  // Fetch List Data
  const fetchData = useCallback(
    async (page = currentPage, size = pageSize) => {
      if (isBridged && onAction) {
        onAction('fetchData', {
          currentPage: page,
          pageSize: size,
          currentfilter: {
            FacilityId: currentFacilityId,
            FromDate: fromDate,
            ToDate: toDate,
            PatientNameMRN: patientNameMRN,
            DoctorId: doctorId,
            EncounterTypeId: encounterTypeId,
            ReferralTypeId: referralTypeId,
            ReferralId: referralId,
          },
        });
      }

      setLoading(true);
      try {
        let fromParam: string | null = fromDate ? `${fromDate} 00:00:00` : null;
        let toParam: string | null = toDate ? `${toDate} 23:59:59` : null;

        if (patientNameMRN.trim()) {
          fromParam = null;
          toParam = null;
        }

        const inputData = {
          Params: [
            { Key: 17, Value: fromParam },
            { Key: 18, Value: toParam },
            { Key: 1, Value: currentFacilityId },
            { Key: 11, Value: patientNameMRN.trim() || null },
            { Key: 15, Value: encounterTypeId === -1 ? null : encounterTypeId },
            { Key: 5, Value: doctorId === -1 ? null : doctorId },
            { Key: 56, Value: referralTypeId === -1 ? null : referralTypeId },
            { Key: 41, Value: referralId || null },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('Visit/Visit/GetEncounters', inputData);
        if (res) {
          const rawList = res.Data || [];
          const filteredList: EncounterListItem[] = [];
          const now = new Date();

          for (const item of rawList) {
            // Exclude admission status 6 (Discharged/Cancelled) as per legacy logic
            if (item.AdmissionStatusId !== 6) {
              const clone = { ...item };
              if (clone.AdmissionDate) {
                const admDate = new Date(clone.AdmissionDate);
                const diffMs = now.getTime() - admDate.getTime();
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                clone.NoOfDays = Math.max(1, days + 1);
              }
              filteredList.push(clone);
            }
          }

          setItems(filteredList);
          setTotalItems(res.PageContext?.TotalRecords ?? filteredList.length);
        }
      } catch (err) {
        console.error('Error fetching encounters list:', err);
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      pageSize,
      isBridged,
      onAction,
      currentFacilityId,
      fromDate,
      toDate,
      patientNameMRN,
      doctorId,
      encounterTypeId,
      referralTypeId,
      referralId,
    ]
  );

  // Trigger fetch on mount or parameter changes
  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  const handleResetFilters = () => {
    const today = getTodayString();
    setFromDate(today);
    setToDate(today);
    setPatientNameMRN('');
    setDoctorId(-1);
    setEncounterTypeId(-1);
    setReferralTypeId(-1);
    setReferralId(null);
    setReferralQuery('');
    setCurrentPage(1);
    setTimeout(() => {
      fetchData(1, pageSize);
    }, 50);
  };

  const handleOpenEdit = (item: EncounterListItem) => {
    setSelectedEncounterId(item.Id);
    setSelectedPatientId(item.PatientId || item.Patient?.Id || null);
    setModalOpen(true);

    if (onAction) {
      onAction('edit', item);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div
      style={{
        padding: spacing.lg,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Page Title & Breadcrumb Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: colors.textMuted || '#64748b',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Inpatient</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }} />
            <span>Referral Doctor Change</span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: colors.textMain || '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Referral Doctor Change
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <span
            style={{
              backgroundColor: '#e2e8f0',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: radii.full || '9999px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {totalItems} Encounters Found
          </span>
          <button
            type="button"
            onClick={() => fetchData(currentPage, pageSize)}
            disabled={loading}
            style={{
              padding: '7px 12px',
              borderRadius: radii.md || '8px',
              border: `1px solid ${colors.border || '#cbd5e1'}`,
              backgroundColor: '#ffffff',
              color: colors.textMain || '#334155',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
            }}
            title="Refresh Table"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg || '12px',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          padding: spacing.lg,
          marginBottom: spacing.lg,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: spacing.md,
            }}
          >
            {/* Search Input: Patient/UHID/Visit#/Mobile# */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                Search Patient / UHID / Visit#
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Patient Name, MRN, Visit#, Mobile..."
                  value={patientNameMRN}
                  onChange={(e) => setPatientNameMRN(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted || '#94a3b8',
                    fontSize: '12px',
                  }}
                />
              </div>
            </div>

            {/* From Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            {/* To Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            {/* Doctor Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                Doctor Name
              </label>
              <select
                value={doctorId ?? ''}
                onChange={(e) => setDoctorId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="-1">All Doctors</option>
                {doctorLookup.map((doc) => {
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

            {/* Visit Type Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                Visit Type
              </label>
              <select
                value={encounterTypeId ?? ''}
                onChange={(e) => setEncounterTypeId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="-1">All Visit Types</option>
                {encounterTypeLookup.map((enc) => (
                  <option key={enc.Id} value={enc.Id}>
                    {enc.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Type Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                Source Type
              </label>
              <select
                value={referralTypeId ?? ''}
                onChange={(e) => setReferralTypeId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="-1">All Source Types</option>
                {referralTypeLookup.map((rt) => (
                  <option key={rt.Id} value={rt.Id}>
                    {rt.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* Referral Autosearch Filter */}
            <div ref={referralFilterRef} style={{ position: 'relative' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain || '#334155',
                  marginBottom: 4,
                }}
              >
                Referral
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Filter by referral name..."
                  value={referralQuery}
                  onChange={(e) => {
                    setReferralQuery(e.target.value);
                    if (!showReferralDropdown) setShowReferralDropdown(true);
                  }}
                  onFocus={() => {
                    if (referralResults.length > 0) setShowReferralDropdown(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
                {referralId && (
                  <button
                    type="button"
                    onClick={() => {
                      setReferralId(null);
                      setReferralQuery('');
                      setShowReferralDropdown(false);
                    }}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: colors.textMuted || '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Dropdown Options */}
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
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 40,
                  }}
                >
                  {referralResults.map((item) => (
                    <div
                      key={item.Id}
                      onClick={() => {
                        setReferralId(item.Id);
                        const label = `${item.ReferralName}${item.ReferralCode ? ` (${item.ReferralCode})` : ''}`;
                        setReferralQuery(label);
                        setShowReferralDropdown(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ fontWeight: 600, color: colors.textMain || '#0f172a' }}>{item.ReferralName}</span>
                      {item.ReferralCode && (
                        <span style={{ color: colors.textMuted || '#64748b', marginLeft: 6 }}>({item.ReferralCode})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.md,
              paddingTop: spacing.sm,
              borderTop: `1px solid ${colors.border || '#f1f5f9'}`,
            }}
          >
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '7px 16px',
                borderRadius: radii.md || '8px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: colors.textMain || '#475569',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '7px 20px',
                borderRadius: radii.md || '8px',
                border: 'none',
                backgroundColor: colors.primary?.main || '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Encounters Data Grid */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg || '12px',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `2px solid ${colors.border || '#e2e8f0'}`,
                  color: colors.textMuted || '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '12px 14px' }}>Visit #</th>
                <th style={{ padding: '12px 14px' }}>DOA</th>
                <th style={{ padding: '12px 14px' }}>DOD</th>
                <th style={{ padding: '12px 14px' }}>Visit Type</th>
                <th style={{ padding: '12px 14px' }}>Patient ID</th>
                <th style={{ padding: '12px 14px' }}>Patient Name</th>
                <th style={{ padding: '12px 14px' }}>Doctor Name</th>
                <th style={{ padding: '12px 14px' }}>Guarantor</th>
                <th style={{ padding: '12px 14px' }}>Source Type</th>
                <th style={{ padding: '12px 14px' }}>Referral Name</th>
                <th style={{ padding: '12px 14px' }}>Created By</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center' }}>
                    <i
                      className="fa-solid fa-circle-notch fa-spin"
                      style={{ fontSize: '28px', color: colors.primary?.main || '#2563eb' }}
                    />
                    <div style={{ marginTop: 8, color: colors.textMuted || '#64748b', fontSize: '13px' }}>
                      Loading encounters...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '48px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        fontSize: '20px',
                      }}
                    >
                      <i className="fa-solid fa-folder-open" />
                    </div>
                    <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', fontSize: '15px' }}>
                      No Encounters Found
                    </div>
                    <div style={{ color: colors.textMuted || '#64748b', fontSize: '13px', marginTop: 4 }}>
                      Try adjusting the date range or patient search criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const patientTitle = row.Patient?.Title?.Description || '';
                  const patientFirst = row.Patient?.FirstName || '';
                  const patientLast = row.Patient?.LastName || '';
                  const patientAge = row.Patient?.Age ?? '';
                  const patientGender = row.Patient?.Gender?.Description || '';
                  const patientNameFormatted = [patientTitle, patientFirst, patientLast].filter(Boolean).join(' ');

                  const docTitle = row.Doctor?.Title?.Description || '';
                  const docFirst = row.Doctor?.FirstName || '';
                  const docLast = row.Doctor?.LastName || '';
                  const docNameFormatted = [docTitle, docFirst, docLast].filter(Boolean).join(' ') || row.DoctorName || '-';

                  const encTypeDesc =
                    typeof row.EncounterType === 'object'
                      ? row.EncounterType?.Description
                      : row.EncounterType || '-';

                  const createdTitle = row.Created?.Title?.Description || '';
                  const createdFirst = row.Created?.FirstName || '';
                  const createdLast = row.Created?.LastName || '';
                  const createdFormatted = [createdTitle, createdFirst, createdLast].filter(Boolean).join(' ') || '-';

                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border || '#f1f5f9'}`,
                        transition: 'background 0.15s',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafafa')
                      }
                    >
                      {/* Visit # */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                        {row.VisitIdentifier || row.Id}
                      </td>

                      {/* DOA */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#334155' }}>
                        {formatDateTime(row.AdmissionDate)}
                      </td>

                      {/* DOD */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {formatDateTime(row.DischargeDate)}
                      </td>

                      {/* Encounter Type */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor:
                              encTypeDesc === 'Inpatient'
                                ? '#dbeafe'
                                : encTypeDesc === 'Emergency'
                                ? '#fee2e2'
                                : '#e0e7ff',
                            color:
                              encTypeDesc === 'Inpatient'
                                ? '#1d4ed8'
                                : encTypeDesc === 'Emergency'
                                ? '#b91c1c'
                                : '#4338ca',
                          }}
                        >
                          {encTypeDesc}
                        </span>
                      </td>

                      {/* Patient ID */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: colors.primary?.main || '#2563eb' }}>
                        {row.Patient?.MRN || row.MRN || '-'}
                      </td>

                      {/* Patient Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                          {patientNameFormatted || 'Unknown'}
                        </div>
                        {(patientAge || patientGender) && (
                          <div style={{ fontSize: '11px', color: colors.textMuted || '#64748b' }}>
                            {patientAge ? `${patientAge} Y` : ''} {patientGender ? `/ ${patientGender}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Doctor Name */}
                      <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 500 }}>
                        {docNameFormatted}
                      </td>

                      {/* Guarantor */}
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {row.Guarantor?.GuarantorName || row.GuarantorName || 'Self'}
                      </td>

                      {/* Source Type */}
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {row.ReferralType?.Description || row.ReferralTypeName || '-'}
                      </td>

                      {/* Referral Name */}
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {row.Referral?.ReferralName || row.ReferralName || '-'}
                      </td>

                      {/* Created By */}
                      <td style={{ padding: '12px 14px', color: colors.textMuted || '#64748b', fontSize: '12px' }}>
                        {createdFormatted}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          title="Update Doctor / Referral"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: radii.md || '6px',
                            border: `1px solid ${colors.border || '#cbd5e1'}`,
                            backgroundColor: '#ffffff',
                            color: colors.primary?.main || '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary?.main || '#2563eb';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = colors.primary?.main || '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.color = colors.primary?.main || '#2563eb';
                            e.currentTarget.style.borderColor = colors.border || '#cbd5e1';
                          }}
                        >
                          <i className="fa-solid fa-user-doctor" style={{ fontSize: '14px' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.lg}`,
            borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
            backgroundColor: '#ffffff',
            gap: spacing.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span style={{ fontSize: '13px', color: colors.textMuted || '#64748b' }}>
              Showing {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '12px', color: colors.textMuted || '#64748b' }}>Per page:</span>
              <select
                value={pageSize ?? ''}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: radii.sm || '4px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{
                padding: '5px 10px',
                borderRadius: radii.sm || '6px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? '#94a3b8' : '#334155',
                fontSize: '12px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <span
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textMain || '#0f172a',
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{
                padding: '5px 10px',
                borderRadius: radii.sm || '6px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                fontSize: '12px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* In-page Encounter Update Modal */}
      <EncounterUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchData(currentPage, pageSize);
        }}
        encounterId={selectedEncounterId}
        patientId={selectedPatientId}
        facilityId={currentFacilityId}
      />
    </div>
  );
};
