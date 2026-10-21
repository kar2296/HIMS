import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';
import { apiFetch } from './utils/api';

export interface LookupOption {
  Id: number | string;
  Text: string;
  FirstName?: string;
  LastName?: string;
  Title?: { Description?: string };
}

export interface PatientInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: number | string;
  DOB?: string;
  Mobile?: string;
  Title?: { Description?: string; Id?: number };
  Gender?: { Description?: string; Id?: number };
}

export interface DoctorInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  Title?: { Description?: string };
}

export interface PatientBillItem {
  Id: number;
  PatientId: number;
  BillNumber?: string;
  BillDateTime?: string;
  Date?: string;
  BillAmount?: number;
  BillDiscount?: number;
  PaidAmount?: number;
  OutStandingAmount?: number;
  Patient?: PatientInfo;
  Doctor?: DoctorInfo;
  User?: DoctorInfo;
  PatientBillStatus?: {
    Id?: number;
    Description?: string;
  };
  PatientBillStatusId?: number;
  Department?: {
    DepartmentName?: string;
  };
  Facility?: {
    FacilityName?: string;
  };
  CreatedUser?: {
    FirstName?: string;
    LastName?: string;
  };
  [key: string]: any;
}

export interface CurrentFilterState {
  FacilityId?: number;
  PatientBillStatusId?: number | string;
  Billdatetime?: string;
  DoctorId?: number | string;
  AppointmentTypeId?: number | string;
  SearchQuery?: string;
}

export interface AppointmentBillPendingListScreenProps {
  reactProps?: {
    items?: PatientBillItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      PatientBillStatus?: LookupOption[];
      AppointmentType?: LookupOption[];
      Doctor?: LookupOption[];
      Department?: LookupOption[];
      [key: string]: any;
    };
    currentfilter?: CurrentFilterState;
    currentcontext?: {
      ct?: string;
      candisableappttype?: boolean;
      [key: string]: any;
    };
    canDocFilter?: boolean;
    loading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(val?: string): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

function formatCurrency(val?: number | string | null): string {
  if (val == null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AppointmentBillPendingListScreen: React.FC<AppointmentBillPendingListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Facility & User info
  const currentFacilityId = reactProps?.currentfilter?.FacilityId || sessionHelper.getCurrentFacilityId() || 1;
  const isPhysicianUser = sessionHelper.getUserTypeId() === '2';
  const currentUserId = sessionHelper.getCurrentUserId();

  // Filters State
  const [billDate, setBillDate] = useState<string>(() => {
    if (reactProps?.currentfilter?.Billdatetime) {
      return String(reactProps.currentfilter.Billdatetime).substring(0, 10);
    }
    return getTodayString();
  });

  const [billStatusId, setBillStatusId] = useState<number | string>(() => {
    return reactProps?.currentfilter?.PatientBillStatusId ?? 1;
  });

  const [appointmentTypeId, setAppointmentTypeId] = useState<number | string>(() => {
    return reactProps?.currentfilter?.AppointmentTypeId ?? '';
  });

  const [doctorId, setDoctorId] = useState<number | string>(() => {
    if (reactProps?.currentfilter?.DoctorId != null) return reactProps.currentfilter.DoctorId;
    if (isPhysicianUser && currentUserId > 0) return currentUserId;
    return '';
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return reactProps?.currentfilter?.SearchQuery ?? '';
  });

  // Lookups State
  const [patientBillStatusLookup, setPatientBillStatusLookup] = useState<LookupOption[]>(
    reactProps?.lookup?.PatientBillStatus || []
  );
  const [appointmentTypeLookup, setAppointmentTypeLookup] = useState<LookupOption[]>(
    reactProps?.lookup?.AppointmentType || []
  );
  const [doctorLookup, setDoctorLookup] = useState<LookupOption[]>(
    reactProps?.lookup?.Doctor || []
  );

  // Pagination & List State
  const [items, setItems] = useState<PatientBillItem[]>(reactProps?.items || []);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(reactProps?.loading));
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.loading !== undefined) setIsLoading(reactProps.loading);

      if (reactProps.lookup) {
        if (reactProps.lookup.PatientBillStatus) setPatientBillStatusLookup(reactProps.lookup.PatientBillStatus);
        if (reactProps.lookup.AppointmentType) setAppointmentTypeLookup(reactProps.lookup.AppointmentType);
        if (reactProps.lookup.Doctor) setDoctorLookup(reactProps.lookup.Doctor);
      }

      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.Billdatetime) {
          setBillDate(String(reactProps.currentfilter.Billdatetime).substring(0, 10));
        }
        if (reactProps.currentfilter.PatientBillStatusId !== undefined) {
          setBillStatusId(reactProps.currentfilter.PatientBillStatusId);
        }
        if (reactProps.currentfilter.AppointmentTypeId !== undefined) {
          setAppointmentTypeId(reactProps.currentfilter.AppointmentTypeId);
        }
        if (reactProps.currentfilter.DoctorId !== undefined) {
          setDoctorId(reactProps.currentfilter.DoctorId);
        }
        if (reactProps.currentfilter.SearchQuery !== undefined) {
          setSearchQuery(reactProps.currentfilter.SearchQuery);
        }
      }
    }
  }, [reactProps]);

  // Fetch Lookups for standalone mode
  useEffect(() => {
    if (isBridged && patientBillStatusLookup.length > 0 && doctorLookup.length > 0) return;

    const fetchLookups = async () => {
      try {
        const inputData = [
          { Key: 'PatientBillStatus' },
          { Key: 'AppointmentType' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 2, Value: [-1, currentFacilityId] }],
            },
          },
        ];

        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res && res.Data) {
          if (Array.isArray(res.Data.PatientBillStatus)) setPatientBillStatusLookup(res.Data.PatientBillStatus);
          if (Array.isArray(res.Data.AppointmentType)) setAppointmentTypeLookup(res.Data.AppointmentType);
          if (Array.isArray(res.Data.Doctor)) setDoctorLookup(res.Data.Doctor);
        }
      } catch (err) {
        console.error('Failed to load pending bills lookups:', err);
      }
    };

    fetchLookups();
  }, [isBridged, currentFacilityId, patientBillStatusLookup.length, doctorLookup.length]);

  // Standalone data fetcher
  const fetchStandaloneBills = useCallback(
    async (page = 1) => {
      if (isBridged) return;
      setIsLoading(true);
      try {
        const fromDateStr = billDate ? `${billDate} 00:00:00` : null;
        const toDateStr = billDate ? `${billDate} 23:59:59` : null;

        const params: Array<{ Key: number; Value: any }> = [
          { Key: 8, Value: currentFacilityId },
          { Key: 4, Value: billStatusId ? Number(billStatusId) : 1 },
          { Key: 64, Value: true },
          { Key: 17, Value: fromDateStr },
          { Key: 18, Value: toDateStr },
        ];

        if (doctorId && Number(doctorId) > 0) {
          params.push({ Key: 7, Value: Number(doctorId) });
        }
        if (searchQuery.trim()) {
          params.push({ Key: 13, Value: searchQuery.trim() });
        }

        const inputData = {
          Params: params,
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        };

        const res = await apiFetch('billing/patientbills/GetPatientBills', inputData);
        if (res && res.Data) {
          setItems(res.Data || []);
          setTotalItems(res.PageContext?.TotalRecords ?? res.Data.length);
          setCurrentPage(page);
        } else {
          setItems([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error('Failed to fetch pending bills:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isBridged, billDate, currentFacilityId, billStatusId, doctorId, searchQuery, pageSize]
  );

  useEffect(() => {
    if (!isBridged) {
      fetchStandaloneBills(1);
    }
  }, [isBridged, fetchStandaloneBills]);

  // Action Dispatches
  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const handleApplyFilter = () => {
    if (isBridged) {
      dispatch('filterChange', {
        currentfilter: {
          Billdatetime: billDate,
          PatientBillStatusId: billStatusId ? Number(billStatusId) : 1,
          AppointmentTypeId: appointmentTypeId ? Number(appointmentTypeId) : undefined,
          DoctorId: doctorId ? Number(doctorId) : undefined,
          SearchQuery: searchQuery.trim() || undefined,
        },
        currentPage: 1,
      });
    } else {
      fetchStandaloneBills(1);
    }
  };

  const handleReset = () => {
    const today = getTodayString();
    setBillDate(today);
    setBillStatusId(1);
    setSearchQuery('');
    setAppointmentTypeId('');
    const defaultDoc = isPhysicianUser && currentUserId > 0 ? currentUserId : '';
    setDoctorId(defaultDoc);

    if (isBridged) {
      dispatch('resetFilters');
    } else {
      setTimeout(() => fetchStandaloneBills(1), 0);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isBridged) {
      dispatch('pageChange', { page: newPage });
    } else {
      fetchStandaloneBills(newPage);
    }
  };

  const handleBill = (row: PatientBillItem) => {
    if (isBridged) {
      dispatch('bill', row);
    } else {
      // Standalone navigation via angular $state if available, or hash navigation
      if ((window as any).angular) {
        const injector = (window as any).angular.element(document.body).injector();
        const $state = injector?.get('$state');
        if ($state) {
          $state.go('app.clinicalapnmntbilling', { bid: row.Id, pid: row.PatientId });
          return;
        }
      }
      window.location.hash = `#/app/clinicalapnmntbilling?bid=${row.Id}&pid=${row.PatientId}`;
    }
  };

  const handlePatientInfo = (row: PatientBillItem) => {
    if (isBridged) {
      dispatch('patientinfo', row);
    } else {
      const pid = row.PatientId || row.Patient?.Id;
      if (pid && (window as any).angular) {
        const injector = (window as any).angular.element(document.body).injector();
        const utl = injector?.get('utl');
        if (utl?.Modal) {
          utl.Modal.open('registration.patientprofile', {
            params: { pid },
            confirmCallback: () => fetchStandaloneBills(currentPage),
          });
          return;
        }
      }
      if (pid) {
        window.location.hash = `#/app/patientprofile?pid=${pid}`;
      }
    }
  };

  // Filter items in-memory if query typed and bridged backend doesn't filter
  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((row) => {
      const billNo = (row.BillNumber || '').toLowerCase();
      const mrn = (row.Patient?.MRN || '').toLowerCase();
      const pName = `${row.Patient?.FirstName || ''} ${row.Patient?.LastName || ''}`.toLowerCase();
      const docName = `${row.Doctor?.FirstName || ''} ${row.Doctor?.LastName || ''}`.toLowerCase();
      return billNo.includes(q) || mrn.includes(q) || pName.includes(q) || docName.includes(q);
    });
  }, [items, searchQuery]);

  // Aggregate Metrics Summary
  const metrics = useMemo(() => {
    const totalCount = totalItems || displayedItems.length;
    let totalBilled = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    displayedItems.forEach((row) => {
      totalBilled += Number(row.BillAmount || 0);
      totalDiscount += Number(row.BillDiscount || 0);
      totalPaid += Number(row.PaidAmount || 0);
      totalDue += Number(row.OutStandingAmount || 0);
    });

    return { totalCount, totalBilled, totalDiscount, totalPaid, totalDue };
  }, [totalItems, displayedItems]);

  const canDisableDoctor = Boolean(reactProps?.canDocFilter || isPhysicianUser);

  // Table styling tokens
  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: `${spacing.md} ${spacing.md}`,
    backgroundColor: '#f8fafc',
    borderBottom: `2px solid ${colors.border}`,
    ...typography.label,
    color: '#475569',
    fontFamily: typography.fontFamily,
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: `${spacing.md} ${spacing.md}`,
    borderBottom: `1px solid ${colors.border}`,
    ...typography.body,
    color: colors.textMain,
    fontFamily: typography.fontFamily,
    fontSize: '13px',
    verticalAlign: 'middle',
  };

  return (
    <div
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: `${spacing.lg} ${spacing.xl} 48px`,
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Pending Consultation Bills"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <Button
              variant="outline-secondary"
              size="sm"
              icon="fa-solid fa-circle-question"
              title="Workflow Process Flow"
              onClick={() => setShowGuideModal(true)}
            >
              Process Flow
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              icon="fa-solid fa-rotate-right"
              loading={isLoading}
              title="Refresh Pending List"
              onClick={() => (isBridged ? dispatch('refresh') : fetchStandaloneBills(currentPage))}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* Metric 1: Pending Bills */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            boxShadow: shadows.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-file-invoice" />
          </div>
          <div>
            <div style={{ ...typography.helper, color: colors.textMuted, fontWeight: 600 }}>Total Records</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: colors.textMain }}>
              {metrics.totalCount}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: '#2563eb',
            }}
          />
        </div>

        {/* Metric 2: Total Bill Amount */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            boxShadow: shadows.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div>
            <div style={{ ...typography.helper, color: colors.textMuted, fontWeight: 600 }}>Total Billed</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
              {formatCurrency(metrics.totalBilled)}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: '#16a34a',
            }}
          />
        </div>

        {/* Metric 3: Paid Amount */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            boxShadow: shadows.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <div style={{ ...typography.helper, color: colors.textMuted, fontWeight: 600 }}>Total Paid</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
              {formatCurrency(metrics.totalPaid)}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: '#059669',
            }}
          />
        </div>

        {/* Metric 4: Due / Outstanding */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            boxShadow: shadows.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-clock-rotate-left" />
          </div>
          <div>
            <div style={{ ...typography.helper, color: colors.textMuted, fontWeight: 600 }}>Total Due / Outstanding</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>
              {formatCurrency(metrics.totalDue)}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: '#d97706',
            }}
          />
        </div>
      </div>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: spacing.lg,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          backgroundColor: '#fff',
        }}
      >
        <FilterBar>
          {/* Appointment Type */}
          <div style={{ flex: '1 1 200px', minWidth: 180 }}>
            <Select
              label="Appointment Type"
              value={appointmentTypeId != null ? String(appointmentTypeId) : ''}
              options={[
                { value: '', label: 'All Types' },
                ...appointmentTypeLookup.map((opt) => ({
                  value: String(opt.Id),
                  label: opt.Text,
                })),
              ]}
              onChange={(val) => {
                setAppointmentTypeId(val ? String(val) : '');
              }}
              disabled={reactProps?.currentcontext?.candisableappttype}
              placeholder="All Types"
            />
          </div>

          {/* Date Picker */}
          <div style={{ flex: '1 1 180px', minWidth: 160 }}>
            <DatePicker
              label="Bill Date"
              value={billDate}
              onChange={(val) => {
                setBillDate(val);
              }}
            />
          </div>

          {/* Doctor Filter */}
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Select
              label="Doctor"
              value={doctorId != null ? String(doctorId) : ''}
              options={[
                { value: '', label: 'All Doctors' },
                ...doctorLookup.map((doc) => ({
                  value: String(doc.Id),
                  label: doc.Text || `${doc.FirstName || ''} ${doc.LastName || ''}`.trim() || String(doc.Id),
                })),
              ]}
              onChange={(val) => {
                setDoctorId(val ? String(val) : '');
              }}
              disabled={canDisableDoctor}
              placeholder="All Doctors"
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1 1 180px', minWidth: 160 }}>
            <Select
              label="Bill Status"
              value={billStatusId != null ? String(billStatusId) : '1'}
              options={[
                { value: '', label: 'All Statuses' },
                ...patientBillStatusLookup.map((st) => ({
                  value: String(st.Id),
                  label: st.Text,
                })),
              ]}
              onChange={(val) => {
                setBillStatusId(val ? String(val) : '');
              }}
              placeholder="All Statuses"
            />
          </div>

          {/* Search Query */}
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Input
              label="Quick Search"
              placeholder="MRN / Name / Bill #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilter();
              }}
              leftIcon="fa-solid fa-magnifying-glass"
            />
          </div>

          {/* Filter Action Buttons */}
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', marginTop: 'auto' }}>
            <Button
              variant="primary"
              size="md"
              icon="fa-solid fa-filter"
              onClick={handleApplyFilter}
            >
              Apply
            </Button>
            <Button
              variant="outline-secondary"
              size="md"
              icon="fa-solid fa-xmark"
              onClick={handleReset}
              title="Reset to defaults"
            >
              Reset
            </Button>
          </div>
        </FilterBar>
      </Card>

      {/* Main Table Card */}
      <Card
        style={{
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          backgroundColor: '#fff',
          overflow: 'hidden',
          boxShadow: shadows.sm,
        }}
      >
        {/* Table Header Summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${spacing.sm} ${spacing.md}`,
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMuted }}>
            Showing{' '}
            <span style={{ color: colors.textMain, fontWeight: 700 }}>
              {displayedItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span style={{ color: colors.textMain, fontWeight: 700 }}>
              {Math.min(currentPage * pageSize, totalItems || displayedItems.length)}
            </span>{' '}
            of <span style={{ color: colors.textMain, fontWeight: 700 }}>{totalItems || displayedItems.length}</span> bills
          </div>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: colors.primary }}>
              <i className="fa-solid fa-circle-notch fa-spin" />
              <span>Fetching records...</span>
            </div>
          )}
        </div>

        {/* Scrollable Table */}
        <div style={{ overflowX: 'auto', minHeight: 280 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>#</th>
                <th style={thStyle}>Bill Number</th>
                <th style={thStyle}>MRN</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Doctor</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Bill Amt</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Discount</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Paid Amt</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Due Amt</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm }}>
                      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: colors.primary }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textMuted }}>
                        Loading pending consultation bills...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px 0' }}>
                    <EmptyState
                      icon="fa-solid fa-receipt"
                      text="No pending consultation bills found"
                      subtext="Try adjusting the date range, status, or search filters above."
                      action={
                        <Button variant="secondary" size="sm" icon="fa-solid fa-rotate-left" onClick={handleReset}>
                          Reset Filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                displayedItems.map((row, index) => {
                  const patientTitle = row.Patient?.Title?.Description || '';
                  const patientFirst = row.Patient?.FirstName || '';
                  const patientLast = row.Patient?.LastName || '';
                  const patientFullName = `${patientTitle} ${patientFirst} ${patientLast}`.trim() || 'Unknown Patient';
                  const docTitle = row.Doctor?.Title?.Description || row.User?.Title?.Description || '';
                  const docFirst = row.Doctor?.FirstName || row.User?.FirstName || '';
                  const docLast = row.Doctor?.LastName || row.User?.LastName || '';
                  const doctorFullName = `${docTitle} ${docFirst} ${docLast}`.trim() || '-';
                  const statusDesc = row.PatientBillStatus?.Description || 'Pending';
                  const isDue = Number(row.OutStandingAmount || 0) > 0;
                  const rowNum = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={row.Id || index}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfd',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          index % 2 === 0 ? '#fff' : '#fcfcfd';
                      }}
                    >
                      {/* # Index */}
                      <td style={{ ...tdStyle, textAlign: 'center', color: colors.textSubtle, fontSize: '12px' }}>
                        {rowNum}
                      </td>

                      {/* Bill Number */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontFamily: typography.fontFamilyMono || 'monospace',
                              fontWeight: 700,
                              color: row.BillNumber ? '#0f172a' : colors.textSubtle,
                              backgroundColor: row.BillNumber ? '#f1f5f9' : 'transparent',
                              padding: '2px 8px',
                              borderRadius: radii.sm,
                              border: row.BillNumber ? '1px solid #e2e8f0' : 'none',
                              fontSize: '12px',
                            }}
                          >
                            {row.BillNumber || `ID: #${row.Id}`}
                          </span>
                        </div>
                      </td>

                      {/* MRN */}
                      <td style={tdStyle}>
                        {row.Patient?.MRN ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: radii.full,
                              backgroundColor: '#e0e7ff',
                              color: '#3730a3',
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.3px',
                            }}
                          >
                            {row.Patient.MRN}
                          </span>
                        ) : (
                          <span style={{ color: colors.textSubtle }}>-</span>
                        )}
                      </td>

                      {/* Patient Name */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePatientInfo(row);
                            }}
                            title="Click to view Patient Profile"
                            style={{
                              color: colors.primary,
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.textDecoration = 'none';
                            }}
                          >
                            <i className="fa-regular fa-user" style={{ fontSize: '11px', color: colors.textMuted }} />
                            <span>{patientFullName}</span>
                          </a>
                          {(row.Patient?.Age || row.Patient?.Gender?.Description) && (
                            <span style={{ fontSize: '11px', color: colors.textSubtle, marginTop: 2 }}>
                              {row.Patient?.Age ? `${row.Patient.Age} yrs` : ''}
                              {row.Patient?.Age && row.Patient?.Gender?.Description ? ' • ' : ''}
                              {row.Patient?.Gender?.Description || ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bill Date */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.textMuted }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: '11px' }} />
                          <span>{formatDateTime(row.BillDateTime || row.Date)}</span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td style={tdStyle}>
                        {doctorFullName !== '-' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <i className="fa-solid fa-user-doctor" style={{ fontSize: '12px', color: '#64748b' }} />
                            <span style={{ fontWeight: 500, color: colors.textMain }}>{doctorFullName}</span>
                          </div>
                        ) : (
                          <span style={{ color: colors.textSubtle }}>-</span>
                        )}
                      </td>

                      {/* Bill Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(row.BillAmount)}
                      </td>

                      {/* Discount Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right', color: colors.textMuted }}>
                        {formatCurrency(row.BillDiscount)}
                      </td>

                      {/* Paid Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span
                          style={{
                            color: Number(row.PaidAmount || 0) > 0 ? '#16a34a' : colors.textMuted,
                            fontWeight: Number(row.PaidAmount || 0) > 0 ? 600 : 400,
                          }}
                        >
                          {formatCurrency(row.PaidAmount)}
                        </span>
                      </td>

                      {/* Outstanding Due Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: isDue ? 700 : 500,
                            color: isDue ? '#dc2626' : colors.textMuted,
                            backgroundColor: isDue ? '#fef2f2' : 'transparent',
                            padding: isDue ? '2px 6px' : '0',
                            borderRadius: radii.sm,
                          }}
                        >
                          {formatCurrency(row.OutStandingAmount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              statusDesc.toLowerCase() === 'paid'
                                ? '#dcfce7'
                                : statusDesc.toLowerCase().includes('cancel')
                                ? '#fee2e2'
                                : '#fef3c7',
                            color:
                              statusDesc.toLowerCase() === 'paid'
                                ? '#15803d'
                                : statusDesc.toLowerCase().includes('cancel')
                                ? '#b91c1c'
                                : '#b45309',
                            border: `1px solid ${
                              statusDesc.toLowerCase() === 'paid'
                                ? '#bbf7d0'
                                : statusDesc.toLowerCase().includes('cancel')
                                ? '#fecaca'
                                : '#fde68a'
                            }`,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor:
                                statusDesc.toLowerCase() === 'paid'
                                ? '#16a34a'
                                : statusDesc.toLowerCase().includes('cancel')
                                ? '#dc2626'
                                : '#d97706',
                            }}
                          />
                          {statusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleBill(row)}
                            title="Bill / Edit Consultation"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              height: 30,
                              padding: '0 10px',
                              borderRadius: radii.sm,
                              border: '1px solid #2563eb',
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#1d4ed8';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb';
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square" style={{ fontSize: '11px' }} />
                            <span>Bill</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePatientInfo(row)}
                            title="View Patient Details"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border}`,
                              backgroundColor: '#fff',
                              color: colors.textMuted,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = colors.primary;
                              (e.currentTarget as HTMLElement).style.borderColor = colors.primary;
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = colors.textMuted;
                              (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
                            }}
                          >
                            <i className="fa-regular fa-id-badge" style={{ fontSize: '13px' }} />
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

        {/* Footer Pagination */}
        <div style={{ padding: `${spacing.md} ${spacing.lg}`, borderTop: `1px solid ${colors.border}` }}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems || displayedItems.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Process Flow Guide Modal */}
      {showGuideModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: spacing.lg,
          }}
          onClick={() => setShowGuideModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              maxWidth: 900,
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <i className="fa-solid fa-circle-info" style={{ color: colors.primary, fontSize: '18px' }} />
                <h3 style={{ ...typography.sectionHeading, margin: 0, color: colors.textMain }}>
                  Consultation Billing Workflow Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  padding: spacing.xs,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div style={{ padding: spacing.lg, overflowY: 'auto', textAlign: 'center' }}>
              <img
                src="mock/usermanual/appointments/Appointments.jpg"
                alt="Appointments Process Flow"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div
                style={{
                  marginTop: spacing.md,
                  textAlign: 'left',
                  backgroundColor: '#f8fafc',
                  padding: spacing.md,
                  borderRadius: radii.md,
                  fontSize: '13px',
                  color: colors.textMain,
                  lineHeight: '1.6',
                }}
              >
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Workflow Summary:</p>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Patients registered for consultation appointments appear with pending billing status.</li>
                  <li>Clicking <strong>Bill</strong> loads the consultation billing entry screen with service details.</li>
                  <li>Clicking the <strong>Patient Name</strong> or ID badge opens the demographic profile and history.</li>
                  <li>Bills completed through OPD cashier or settlement will transition out of this pending queue.</li>
                </ul>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: '#f8fafc',
              }}
            >
              <Button variant="secondary" size="sm" onClick={() => setShowGuideModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
