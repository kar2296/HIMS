import React, { useState, useMemo, useEffect } from 'react';
import { colors, radii, shadows, typography, transitions } from '../components/ui/tokens';

export interface InpatientItem {
  Id?: number;
  VisitIdentifier?: string;
  PatientId?: number;
  Patient?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: string | number;
    Title?: { Description?: string };
    Gender?: { Description?: string };
    Mobile?: string;
  };
  DoctorId?: number;
  Doctor?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Department?: {
    DepartmentName?: string;
  };
  WardMaster?: {
    WardName?: string;
  };
  WardRoomMaster?: {
    RoomNo?: string;
  };
  WardRoomBedMaster?: {
    BedNo?: string;
  };
  AdmissionDate?: string;
  DischargeDate?: string;
  Guarantor?: {
    GuarantorName?: string;
  };
  GuarantorTypeId?: number;
  ReferralName?: string;
  NoOfDays?: number | string;
  Debit?: number;
  Credit?: number;
  Balance?: number;
  AdmissionStatusId?: number;
  AdmissionStatus?: {
    Description?: string;
  };
  IsBillLock?: number | boolean;
  IsPackageAssigned?: boolean | number;
  ColorCode?: number;
  SurgeryEntryId?: number;
  FinalBills?: any[];
}

export interface InpatientLookupItem {
  Id: number;
  Text?: string;
  Description?: string;
  Name?: string;
  GuarantorName?: string;
  WardName?: string;
}

export interface InpatientLookups {
  Ward?: InpatientLookupItem[];
  Guarantor?: InpatientLookupItem[];
  AdmissionStatus?: InpatientLookupItem[];
  TPA?: InpatientLookupItem[];
  GuarantorType?: InpatientLookupItem[];
  Doctor?: InpatientLookupItem[];
  Department?: InpatientLookupItem[];
}

export interface InpatientFilter {
  FacilityId?: number;
  AdmissionStatusId?: number | number[];
  WardId?: number | null;
  FindLockedBills?: number | boolean;
  IsBillLock?: number | null;
  IsPackageAssigned?: number | null;
  FindPackageAssigned?: number | boolean;
  IsEstimatedBill?: number | null;
  PatientMRN?: string | null;
  VisitIdentifier?: string | null;
  admissiondate?: string | Date | null;
  DischargeDate?: string | Date | null;
  TPAId?: number | null;
  GuarantorId?: number | null;
}

export interface InpatientAdvancedFilter {
  DepartmentId?: number | null;
  DoctorId?: number | null;
  GuarantorTypeId?: number | string | null;
  GuarantorId?: number | null;
  BillFromDate?: string | null;
  BillToDate?: string | null;
  DOA?: string | null;
  Phone?: string | null;
}

export interface InpatientMetrics {
  totalOccupancy: number;
  todayAdmission: number;
  todayDischarge: number;
  pendingDischarge: number;
  self: number;
  insurance: number;
  corporate: number;
  government: number;
  activeFilter?: number;
}

export interface InpatientPager {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  startIndex?: number;
}

export interface InpatientBillingListScreenProps {
  reactProps?: {
    items?: InpatientItem[];
    metrics?: InpatientMetrics;
    currentfilter?: InpatientFilter;
    advancedfilter?: InpatientAdvancedFilter;
    lookup?: InpatientLookups;
    pager?: InpatientPager;
    isLoading?: boolean;
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// ─────────────────────────────────────────────────────────────
// CRISP INLINE SVG ICONS (Zero external font dependencies)
// ─────────────────────────────────────────────────────────────
const IconSearch: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconHash: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconCalendar: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBed: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
);

const IconLock: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconPackage: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconFilter: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconReset: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconRefresh: React.FC<{ size?: number; color?: string; spin?: boolean }> = ({ size = 13, color = 'currentColor', spin = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: spin ? 'spin 1s linear infinite' : 'none' }}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconSliders: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const IconArrowLeft: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconUserMd: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const IconDoor: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h20" />
    <circle cx="14" cy="12" r="1" />
  </svg>
);

const IconFileInvoice: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconUser: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconCopy: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function formatCurrency(val?: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (num == null || isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(val?: string | Date): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(val);
  }
}

function formatTime(val?: string | Date): string {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '';
  }
}

function toDateInputString(val?: string | Date | null): string {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

export const InpatientBillingListScreen: React.FC<InpatientBillingListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const rawItems = reactProps?.items || [];
  const metrics = reactProps?.metrics || {
    totalOccupancy: 0,
    todayAdmission: 0,
    todayDischarge: 0,
    pendingDischarge: 0,
    self: 0,
    insurance: 0,
    corporate: 0,
    government: 0,
    activeFilter: 0,
  };
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const pager = reactProps?.pager || { totalItems: 0, currentPage: 1, pageSize: 25 };
  const isLoading = Boolean(reactProps?.isLoading);
  const context = reactProps?.context || '';

  // Local filter states
  const [mrnSearch, setMrnSearch] = useState<string>(currentfilter.PatientMRN || '');
  const [ipNoSearch, setIpNoSearch] = useState<string>(currentfilter.VisitIdentifier || '');
  const [doaDate, setDoaDate] = useState<string>(toDateInputString(currentfilter.admissiondate));
  const [wardId, setWardId] = useState<number | ''>(currentfilter.WardId ?? '');
  const [payerId, setPayerId] = useState<number | ''>(currentfilter.GuarantorId ?? '');
  const [statusId, setStatusId] = useState<number | ''>(
    Array.isArray(currentfilter.AdmissionStatusId)
      ? ''
      : (currentfilter.AdmissionStatusId ?? '')
  );
  const [tpaId, setTpaId] = useState<number | ''>(currentfilter.TPAId ?? '');
  const [isLocked, setIsLocked] = useState<boolean>(Boolean(currentfilter.FindLockedBills || currentfilter.IsBillLock));
  const [isPackaged, setIsPackaged] = useState<boolean>(Boolean(currentfilter.FindPackageAssigned || currentfilter.IsPackageAssigned));

  // In-table search filter
  const [tableSearch, setTableSearch] = useState<string>('');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Sync when props change
  useEffect(() => {
    setMrnSearch(currentfilter.PatientMRN || '');
    setIpNoSearch(currentfilter.VisitIdentifier || '');
    setDoaDate(toDateInputString(currentfilter.admissiondate));
    setWardId(currentfilter.WardId ?? '');
    setPayerId(currentfilter.GuarantorId ?? '');
    setStatusId(
      Array.isArray(currentfilter.AdmissionStatusId)
        ? ''
        : (currentfilter.AdmissionStatusId ?? '')
    );
    setTpaId(currentfilter.TPAId ?? '');
    setIsLocked(Boolean(currentfilter.FindLockedBills || currentfilter.IsBillLock));
    setIsPackaged(Boolean(currentfilter.FindPackageAssigned || currentfilter.IsPackageAssigned));
  }, [
    currentfilter.PatientMRN,
    currentfilter.VisitIdentifier,
    currentfilter.admissiondate,
    currentfilter.WardId,
    currentfilter.GuarantorId,
    currentfilter.AdmissionStatusId,
    currentfilter.TPAId,
    currentfilter.FindLockedBills,
    currentfilter.IsBillLock,
    currentfilter.FindPackageAssigned,
    currentfilter.IsPackageAssigned,
  ]);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const handleCopyIp = (ip?: string) => {
    if (!ip) return;
    navigator.clipboard?.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // KPI card configuration
  const kpiCards = [
    {
      id: 0,
      type: 'occupancy',
      val: 0,
      label: 'Total Occupancy',
      count: metrics.totalOccupancy,
      accent: '#2563eb',
      bgLight: '#eff6ff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
        </svg>
      ),
    },
    {
      id: 1,
      type: 'admission',
      val: 0,
      label: 'Today Admissions',
      count: metrics.todayAdmission,
      accent: '#d97706',
      bgLight: '#fffbeb',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
    {
      id: 2,
      type: 'today_discharge',
      val: 0,
      label: 'Today Discharged',
      count: metrics.todayDischarge,
      accent: '#059669',
      bgLight: '#ecfdf5',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: 3,
      type: 'pending_discharge',
      val: 0,
      label: 'Pending Discharges',
      count: metrics.pendingDischarge,
      accent: '#7c3aed',
      bgLight: '#f5f3ff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 4,
      type: 'guarantor',
      val: 1,
      label: 'Self Paying',
      count: metrics.self,
      accent: '#4f46e5',
      bgLight: '#eef2ff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 5,
      type: 'guarantor',
      val: 2,
      label: 'Insurance / TPA',
      count: metrics.insurance,
      accent: '#0891b2',
      bgLight: '#ecfeff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: 6,
      type: 'guarantor',
      val: 3,
      label: 'Corporate',
      count: metrics.corporate,
      accent: '#e11d48',
      bgLight: '#fff1f2',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="2" />
          <path d="M8 6h.01M8 10h.01M8 14h.01M15 6h.01M15 10h.01M15 14h.01" />
        </svg>
      ),
    },
    {
      id: 7,
      type: 'guarantor',
      val: 0,
      label: 'Government',
      count: metrics.government,
      accent: '#0f766e',
      bgLight: '#f0fdfa',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="21" x2="21" y2="21" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="5 10 5 21" />
          <polyline points="19 10 19 21" />
          <polyline points="12 10 12 21" />
          <path d="M12 2L2 7h20L12 2z" />
        </svg>
      ),
    },
  ];

  // In-table client-side filter
  const filteredItems = useMemo(() => {
    if (!tableSearch.trim()) return rawItems;
    const q = tableSearch.toLowerCase().trim();
    return rawItems.filter((item) => {
      const pName = `${item.Patient?.FirstName || ''} ${item.Patient?.LastName || ''}`.toLowerCase();
      const mrn = (item.Patient?.MRN || '').toLowerCase();
      const ip = (item.VisitIdentifier || '').toLowerCase();
      const doc = `${item.Doctor?.FirstName || ''} ${item.Doctor?.LastName || ''}`.toLowerCase();
      const room = `${item.WardMaster?.WardName || ''} ${item.WardRoomMaster?.RoomNo || ''} ${item.WardRoomBedMaster?.BedNo || ''}`.toLowerCase();
      const guarantor = (item.Guarantor?.GuarantorName || '').toLowerCase();
      const ref = (item.ReferralName || '').toLowerCase();
      const status = (item.AdmissionStatus?.Description || '').toLowerCase();

      return (
        pName.includes(q) ||
        mrn.includes(q) ||
        ip.includes(q) ||
        doc.includes(q) ||
        room.includes(q) ||
        guarantor.includes(q) ||
        ref.includes(q) ||
        status.includes(q)
      );
    });
  }, [rawItems, tableSearch]);

  const handleApplyFilterCard = (card: typeof kpiCards[0]) => {
    dispatch('applyFilter', { type: card.type, val: card.val, index: card.id });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispatch('search');
  };

  const handleResetFilters = () => {
    setMrnSearch('');
    setIpNoSearch('');
    setDoaDate('');
    setWardId('');
    setPayerId('');
    setStatusId('');
    setTpaId('');
    setIsLocked(false);
    setIsPackaged(false);
    setTableSearch('');
    dispatch('clearFilter');
  };

  const totalPages = Math.max(1, Math.ceil((pager.totalItems || 0) / (pager.pageSize || 25)));
  const currentPage = pager.currentPage || 1;

  const renderStatusBadge = (item: InpatientItem) => {
    const statusText = item.AdmissionStatus?.Description || 'Admitted';
    let bg = '#eff6ff';
    let textCol = '#1d4ed8';
    let borderCol = '#bfdbfe';

    if (item.IsPackageAssigned || item.ColorCode === 7) {
      bg = '#fff7ed';
      textCol = '#c2410c';
      borderCol = '#fed7aa';
    } else if (item.IsBillLock || item.ColorCode === 6) {
      bg = '#fef2f2';
      textCol = '#b91c1c';
      borderCol = '#fecaca';
    } else if (item.AdmissionStatusId === 5 || item.ColorCode === 5) {
      bg = '#eef2ff';
      textCol = '#4338ca';
      borderCol = '#c7d2fe';
    } else if (item.AdmissionStatusId === 3 || item.AdmissionStatusId === 4) {
      bg = '#f5f3ff';
      textCol = '#6d28d9';
      borderCol = '#ddd6fe';
    } else if (item.AdmissionStatusId === 6) {
      bg = '#f8fafc';
      textCol = '#475569';
      borderCol = '#e2e8f0';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: radii.full,
            fontSize: 11,
            fontWeight: 600,
            background: bg,
            color: textCol,
            border: `1px solid ${borderCol}`,
            width: 'fit-content',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: textCol }} />
          {statusText}
        </span>
        {item.IsBillLock ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <IconLock size={10} color="#dc2626" /> Bill Locked
          </span>
        ) : null}
        {item.IsPackageAssigned ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <IconPackage size={10} color="#d97706" /> Packaged
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        background: '#f8fafc',
        fontFamily: typography.fontFamily,
        color: colors.textBody,
        padding: '16px 20px 40px 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. ENTERPRISE EXECUTIVE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: '#ffffff',
          borderRadius: radii.lg,
          padding: '14px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
              flexShrink: 0,
            }}
          >
            <IconBed size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
                IP Patient Billing
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#2563eb',
                  background: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  border: '1px solid #bfdbfe',
                }}
              >
                Inpatient Billing Console
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  border: '1px solid #a7f3d0',
                }}
              >
                Live Census
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#64748b' }}>
              Real-time monitoring of admitted inpatients, length of stay, deposits, charges, and settlement
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          {(context === 'frontoffice' || context === 'billing') && (
            <button
              type="button"
              onClick={() => dispatch('backToList')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 13px',
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: transitions.fast,
              }}
            >
              <IconArrowLeft size={13} color="#475569" />
              Back to Dashboard
            </button>
          )}

          <button
            type="button"
            onClick={() => dispatch('openAdvancedFilter')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              borderRadius: radii.md,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: transitions.fast,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <IconSliders size={13} color="#2563eb" />
            Advanced Filter
          </button>

          <button
            type="button"
            onClick={() => dispatch('refresh')}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: radii.md,
              fontSize: 12,
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
              transition: transitions.fast,
            }}
          >
            <IconRefresh size={13} color="#ffffff" spin={isLoading} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. METRIC CARDS (8-COLUMN SINGLE LINE EXECUTIVE DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {kpiCards.map((card) => {
          const isActive = metrics.activeFilter === card.id;
          return (
            <div
              key={card.id}
              onClick={() => handleApplyFilterCard(card)}
              style={{
                background: isActive ? card.bgLight : '#ffffff',
                border: isActive ? `2px solid ${card.accent}` : '1px solid #e2e8f0',
                borderRadius: radii.md,
                padding: '7px 9px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isActive
                  ? `0 2px 8px ${card.accent}22`
                  : '0 1px 2px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 56,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = card.accent;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                }
              }}
            >
              {/* Top: Full width label */}
              <div style={{ marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: isActive ? card.accent : '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.2',
                    display: 'block',
                  }}
                  title={card.label}
                >
                  {card.label}
                </span>
              </div>

              {/* Bottom: Count + Active badge on left, Icon on right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: '1' }}>
                    {card.count}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 7.5,
                        fontWeight: 700,
                        color: card.accent,
                        background: '#ffffff',
                        padding: '1px 4px',
                        borderRadius: radii.full,
                        border: `1px solid ${card.accent}`,
                        textTransform: 'uppercase',
                        lineHeight: '1',
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radii.sm,
                    background: card.bgLight,
                    color: card.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${card.accent}33`,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ENTERPRISE FILTER WORKBENCH (Single Line Toolbar)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          padding: '8px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          marginBottom: 12,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            width: '100%',
          }}
        >
          {/* 1. PATIENT NAME / MRN */}
          <div style={{ flex: '1.3 1 125px', minWidth: 110, maxWidth: 170 }}>
            <label
              title="Patient Name or MRN"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Name / MRN
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <IconSearch size={12} color="#94a3b8" />
              </span>
              <input
                type="text"
                placeholder="Name / MRN..."
                value={mrnSearch}
                onChange={(e) => {
                  setMrnSearch(e.target.value);
                  dispatch('filterChange', { field: 'PatientMRN', value: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                style={{
                  width: '100%',
                  height: 31,
                  padding: '4px 8px 4px 26px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 11.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  transition: transitions.fast,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>
          </div>

          {/* 2. IP NUMBER */}
          <div style={{ flex: '1 1 95px', minWidth: 85, maxWidth: 115 }}>
            <label
              title="Inpatient Visit Number"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              IP Number
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <IconHash size={11} color="#94a3b8" />
              </span>
              <input
                type="text"
                placeholder="IP No..."
                value={ipNoSearch}
                onChange={(e) => {
                  setIpNoSearch(e.target.value);
                  dispatch('filterChange', { field: 'VisitIdentifier', value: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                style={{
                  width: '100%',
                  height: 31,
                  padding: '4px 8px 4px 24px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 11.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  transition: transitions.fast,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>
          </div>

          {/* 3. ADMISSION DATE (DOA) */}
          <div style={{ flex: '1 1 105px', minWidth: 95, maxWidth: 120 }}>
            <label
              title="Admission Date (Date of Admission)"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              DOA (Date)
            </label>
            <input
              type="date"
              value={doaDate}
              onChange={(e) => {
                setDoaDate(e.target.value);
                dispatch('filterChange', { field: 'admissiondate', value: e.target.value || null });
              }}
              style={{
                width: '100%',
                height: 31,
                padding: '4px 6px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 11,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
                color: '#334155',
                transition: transitions.fast,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
          </div>

          {/* 4. WARD */}
          <div style={{ flex: '1 1 95px', minWidth: 85, maxWidth: 115 }}>
            <label
              title="Ward Filter"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Ward
            </label>
            <select
              value={wardId}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setWardId(val ?? '');
                dispatch('filterChange', { field: 'WardId', value: val });
              }}
              style={{
                width: '100%',
                height: 31,
                padding: '4px 6px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 11,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                color: '#334155',
                transition: transitions.fast,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            >
              <option value="">All Wards</option>
              {(lookup.Ward || []).map((w) => (
                <option key={w.Id} value={w.Id}>
                  {w.Text || w.WardName || w.Name}
                </option>
              ))}
            </select>
          </div>

          {/* 5. PAYER (GUARANTOR) */}
          <div style={{ flex: '1 1 95px', minWidth: 85, maxWidth: 115 }}>
            <label
              title="Payer / Guarantor"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Payer
            </label>
            <select
              value={payerId}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setPayerId(val ?? '');
                dispatch('filterChange', { field: 'GuarantorId', value: val });
              }}
              style={{
                width: '100%',
                height: 31,
                padding: '4px 6px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 11,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                color: '#334155',
                transition: transitions.fast,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            >
              <option value="">All Payers</option>
              {(lookup.Guarantor || []).map((g) => (
                <option key={g.Id} value={g.Id}>
                  {g.Text || g.GuarantorName || g.Name}
                </option>
              ))}
            </select>
          </div>

          {/* 6. STATUS */}
          <div style={{ flex: '1 1 90px', minWidth: 80, maxWidth: 110 }}>
            <label
              title="Admission Status"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Status
            </label>
            <select
              value={statusId}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setStatusId(val ?? '');
                dispatch('filterChange', { field: 'AdmissionStatusId', value: val });
              }}
              style={{
                width: '100%',
                height: 31,
                padding: '4px 6px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 11,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                color: '#334155',
                transition: transitions.fast,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            >
              <option value="">All Statuses</option>
              {(lookup.AdmissionStatus || []).map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.Text || s.Description || s.Name}
                </option>
              ))}
            </select>
          </div>

          {/* 7. TPA */}
          <div style={{ flex: '1 1 90px', minWidth: 80, maxWidth: 110 }}>
            <label
              title="Third Party Administrator"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              TPA
            </label>
            <select
              value={tpaId}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setTpaId(val ?? '');
                dispatch('filterChange', { field: 'TPAId', value: val });
              }}
              style={{
                width: '100%',
                height: 31,
                padding: '4px 6px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 11,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                color: '#334155',
                transition: transitions.fast,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            >
              <option value="">All TPAs</option>
              {(lookup.TPA || []).map((t) => (
                <option key={t.Id} value={t.Id}>
                  {t.Text || t.Name}
                </option>
              ))}
            </select>
          </div>

          {/* 8. TOGGLE PILLS: LOCKED & PACKAGED */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {/* Is Locked */}
            <label
              title="Filter by Locked Bills"
              style={{
                height: 31,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isLocked ? '#b91c1c' : '#475569',
                cursor: 'pointer',
                padding: '0 8px',
                borderRadius: radii.md,
                background: isLocked ? '#fee2e2' : '#f8fafc',
                border: `1px solid ${isLocked ? '#fca5a5' : '#cbd5e1'}`,
                userSelect: 'none',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                transition: transitions.fast,
              }}
            >
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => {
                  setIsLocked(e.target.checked);
                  dispatch('filterChange', { field: 'FindLockedBills', value: e.target.checked ? 1 : 0 });
                }}
                style={{ accentColor: '#dc2626', cursor: 'pointer', margin: 0 }}
              />
              <IconLock size={11} color={isLocked ? '#b91c1c' : '#64748b'} />
              <span>Locked</span>
            </label>

            {/* Is Packaged */}
            <label
              title="Filter by Packages Assigned"
              style={{
                height: 31,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isPackaged ? '#c2410c' : '#475569',
                cursor: 'pointer',
                padding: '0 8px',
                borderRadius: radii.md,
                background: isPackaged ? '#ffedd5' : '#f8fafc',
                border: `1px solid ${isPackaged ? '#fdba74' : '#cbd5e1'}`,
                userSelect: 'none',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                transition: transitions.fast,
              }}
            >
              <input
                type="checkbox"
                checked={isPackaged}
                onChange={(e) => {
                  setIsPackaged(e.target.checked);
                  dispatch('filterChange', { field: 'FindPackageAssigned', value: e.target.checked ? 1 : 0 });
                }}
                style={{ accentColor: '#ea580c', cursor: 'pointer', margin: 0 }}
              />
              <IconPackage size={11} color={isPackaged ? '#c2410c' : '#64748b'} />
              <span>Packages</span>
            </label>
          </div>

          {/* 9. ACTION BUTTONS: RESET & SEARCH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset All Filters"
              style={{
                height: 31,
                padding: '0 10px',
                borderRadius: radii.md,
                fontSize: 11,
                fontWeight: 600,
                color: '#64748b',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <IconReset size={11} color="#64748b" />
              Reset
            </button>

            <button
              type="submit"
              title="Apply Search"
              style={{
                height: 31,
                padding: '0 12px',
                borderRadius: radii.md,
                fontSize: 11,
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                transition: transitions.fast,
              }}
            >
              <IconFilter size={11} color="#ffffff" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. INPATIENT RECORDS DIRECTORY & TABLE
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Table Toolbar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Inpatient Directory
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: radii.full,
                border: '1px solid #bfdbfe',
              }}
            >
              {pager.totalItems || filteredItems.length} records found
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 220 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <IconSearch size={13} color="#94a3b8" />
              </span>
              <input
                type="text"
                placeholder="Filter current view..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 34px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span>Show</span>
              <select
                value={pager.pageSize}
                onChange={(e) => dispatch('pageSizeChange', { pageSize: Number(e.target.value) })}
                style={{
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  outline: 'none',
                  background: '#ffffff',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <th style={{ padding: '10px 12px', width: 40, textAlign: 'center' }}>#</th>
                <th style={{ padding: '10px 12px', minWidth: 120 }}>IP Number</th>
                <th style={{ padding: '10px 12px', minWidth: 180 }}>Patient Details</th>
                <th style={{ padding: '10px 12px', minWidth: 160 }}>Admitting Doctor</th>
                <th style={{ padding: '10px 12px', minWidth: 160 }}>Room Details</th>
                <th style={{ padding: '10px 12px', minWidth: 130 }}>DOA / Stay</th>
                <th style={{ padding: '10px 12px', minWidth: 150 }}>Payer & Referral</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', minWidth: 95 }}>Debit</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', minWidth: 95 }}>Credit</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', minWidth: 105 }}>Balance</th>
                <th style={{ padding: '10px 12px', minWidth: 120 }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    style={{
                      padding: '48px 16px',
                      textAlign: 'center',
                      color: '#94a3b8',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        <IconBed size={28} color="#94a3b8" />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                        No inpatient records found matching your filters
                      </span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          marginTop: 4,
                          padding: '6px 14px',
                          borderRadius: radii.md,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#2563eb',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          cursor: 'pointer',
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const pName = `${item.Patient?.FirstName || ''} ${item.Patient?.LastName || ''}`.trim() || 'Unknown';
                  const mrn = item.Patient?.MRN || '-';
                  const age = item.Patient?.Age ? `${item.Patient.Age} Y` : '';
                  const gender = item.Patient?.Gender?.Description || '';
                  const docTitle = item.Doctor?.Title?.Description ? `${item.Doctor.Title.Description} ` : '';
                  const docName = `${docTitle}${item.Doctor?.FirstName || ''} ${item.Doctor?.LastName || ''}`.trim() || '-';
                  const wardName = item.WardMaster?.WardName || '';
                  const roomNo = item.WardRoomMaster?.RoomNo || '';
                  const bedNo = item.WardRoomBedMaster?.BedNo || '';
                  const isPositiveBalance = (item.Balance || 0) > 0;
                  const balanceAmount = item.Balance || 0;

                  // Highlighting background if row is specially tagged
                  let rowBg = idx % 2 === 0 ? '#ffffff' : '#fcfdfd';
                  if (item.IsBillLock) {
                    rowBg = 'rgba(239, 68, 68, 0.03)';
                  } else if (item.IsPackageAssigned) {
                    rowBg = 'rgba(249, 115, 22, 0.03)';
                  }

                  return (
                    <tr
                      key={item.Id || idx}
                      style={{
                        background: rowBg,
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                      }}
                    >
                      {/* S.No */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
                        {(currentPage - 1) * pager.pageSize + idx + 1}
                      </td>

                      {/* IP NUMBER */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: radii.sm,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {item.VisitIdentifier || '-'}
                          </span>
                          {item.VisitIdentifier && (
                            <button
                              type="button"
                              onClick={() => handleCopyIp(item.VisitIdentifier)}
                              title={copiedIp === item.VisitIdentifier ? 'Copied!' : 'Copy IP Number'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: copiedIp === item.VisitIdentifier ? '#16a34a' : '#94a3b8',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {copiedIp === item.VisitIdentifier ? (
                                <IconCheck size={12} color="#16a34a" />
                              ) : (
                                <IconCopy size={12} color="#94a3b8" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* PATIENT DETAILS */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <a
                            onClick={() => dispatch('patientInfo', { entity: item })}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#2563eb',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            {pName}
                          </a>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                            <span
                              style={{
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                padding: '1px 5px',
                                borderRadius: radii.sm,
                                fontWeight: 600,
                              }}
                            >
                              {mrn}
                            </span>
                            {(age || gender) && (
                              <span>
                                {age} {gender ? `• ${gender}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ADMITTING DOCTOR */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <IconUserMd size={14} color="#0284c7" />
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{docName}</span>
                        </div>
                      </td>

                      {/* ROOM DETAILS */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {wardName || roomNo || bedNo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IconDoor size={13} color="#64748b" />
                            <span>
                              <strong>{wardName || '-'}</strong>
                              {roomNo ? ` / Rm: ${roomNo}` : ''}
                              {bedNo ? ` / Bed: ${bedNo}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* DOA / STAY */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {formatDate(item.AdmissionDate)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                            <span>{formatTime(item.AdmissionDate)}</span>
                            {item.NoOfDays != null && (
                              <span
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  padding: '1px 5px',
                                  borderRadius: radii.sm,
                                  fontWeight: 600,
                                }}
                              >
                                {item.NoOfDays} Days
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PAYER & REFERRAL */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#0369a1',
                              background: '#f0f9ff',
                              padding: '2px 7px',
                              borderRadius: radii.sm,
                              border: '1px solid #bae6fd',
                              display: 'inline-block',
                            }}
                          >
                            {item.Guarantor?.GuarantorName || 'CASH / SELF'}
                          </span>
                          {item.ReferralName && (
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              Ref: {item.ReferralName}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* DEBIT */}
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {formatCurrency(item.Debit)}
                      </td>

                      {/* CREDIT */}
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {formatCurrency(item.Credit)}
                      </td>

                      {/* BALANCE */}
                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isPositiveBalance ? '#b91c1c' : '#15803d',
                            background: isPositiveBalance ? '#fef2f2' : '#f0fdf4',
                            padding: '2px 7px',
                            borderRadius: radii.sm,
                            border: `1px solid ${isPositiveBalance ? '#fecaca' : '#bbf7d0'}`,
                            display: 'inline-block',
                            fontFamily: 'monospace',
                          }}
                        >
                          {formatCurrency(balanceAmount)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: '10px 12px' }}>
                        {renderStatusBadge(item)}
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => dispatch('edit', { entity: item })}
                            title="Inpatients Billing Summary"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: transitions.fast,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                          >
                            <IconBed size={14} color="currentColor" />
                          </button>

                          <button
                            type="button"
                            onClick={() => dispatch('packages', { entity: item })}
                            title="Package Assignment"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              border: '1px solid #bbf7d0',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: transitions.fast,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#16a34a';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0fdf4';
                              e.currentTarget.style.color = '#16a34a';
                            }}
                          >
                            <IconFileInvoice size={13} color="currentColor" />
                          </button>

                          <button
                            type="button"
                            onClick={() => dispatch('patientInfo', { entity: item })}
                            title="Patient Information"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: transitions.fast,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#64748b';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            <IconUser size={13} color="currentColor" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. MODERN PAGINATION FOOTER
        ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: '#ffffff',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Showing{' '}
            <strong style={{ color: '#0f172a' }}>
              {pager.totalItems === 0 ? 0 : (currentPage - 1) * pager.pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong style={{ color: '#0f172a' }}>
              {Math.min(currentPage * pager.pageSize, pager.totalItems || 0)}
            </strong>{' '}
            of <strong style={{ color: '#0f172a' }}>{pager.totalItems || 0}</strong> inpatients
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => dispatch('pageChange', { page: 1 })}
              title="First Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: 12,
              }}
            >
              «
            </button>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => dispatch('pageChange', { page: currentPage - 1 })}
              title="Previous Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: 12,
              }}
            >
              ‹
            </button>

            {/* Page number pill */}
            <span
              style={{
                padding: '5px 12px',
                borderRadius: radii.md,
                background: '#2563eb',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => dispatch('pageChange', { page: currentPage + 1 })}
              title="Next Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: 12,
              }}
            >
              ›
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => dispatch('pageChange', { page: totalPages })}
              title="Last Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: 12,
              }}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
