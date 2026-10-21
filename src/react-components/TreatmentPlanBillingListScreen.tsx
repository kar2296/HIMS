import React, { useState, useMemo, useEffect } from 'react';
import { colors, radii, shadows, typography, transitions } from '../components/ui/tokens';

export interface PatientInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: number | string;
  Mobile?: string;
  Title?: { Description?: string };
  Gender?: { Description?: string };
}

export interface DoctorInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Title?: { Description?: string };
}

export interface DepartmentInfo {
  Id?: number;
  DepartmentName?: string;
}

export interface TreatmentPlanRow {
  Id?: number;
  PlanNumber?: string;
  PlanScheduledFrom?: string;
  PlanScheduledTo?: string;
  DoctorId?: number;
  Doctor?: DoctorInfo;
  DepartmentId?: number;
  Department?: DepartmentInfo;
  PatientId?: number;
  Patient?: PatientInfo;
  EncounterId?: number;
  NoOfDays?: number;
  TotalAmount?: number;
  PlanStatusId?: number;
  PlanStatus?: { Description?: string } | string;
  TreatmentPlanDetails?: TreatmentPlanDetailRow[];
  TreatmentName?: string;
}

export interface TreatmentPlanDetailRow {
  Id?: number;
  TreatmentPlanId?: number;
  EncounterId?: number;
  PatientId?: number;
  DoctorId?: number;
  PlanScheduleDate?: string;
  ServiceName?: string;
  ServiceCode?: string;
  PlanStartTime?: string;
  PlanEndTime?: string;
  IsPaid?: boolean;
  ServicePrice?: number;
  NetAmount?: number;
  PlanDetailStatusId?: number;
  PlanStatus?: { Description?: string } | string;
}

export interface LookupItem {
  Id: number;
  Text: string;
}

export interface TreatmentPlanBillingListScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string | Date;
      ToBillDate?: string | Date;
      PlanStatusId?: number;
      PatientId?: number;
    };
    lookup?: {
      PlanStatus?: LookupItem[];
    };
    treatmentPlans?: TreatmentPlanRow[];
    treatmentPlanDetails?: TreatmentPlanDetailRow[];
    selectedPlan?: TreatmentPlanRow | null;
    selectedPatient?: PatientInfo | null;
    isLoading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value?: string | Date): string {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(value);
  }
}

function formatTime(value?: string | Date): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

function getStatusText(status?: { Description?: string } | string, fallback: string = 'Active'): string {
  if (typeof status === 'string') return status;
  if (status && typeof status === 'object' && status.Description) return status.Description;
  return fallback;
}

function toDateInputValue(val?: string | Date): string {
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

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const TreatmentPlanBillingListScreen: React.FC<TreatmentPlanBillingListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const rawPlans = reactProps?.treatmentPlans || [];
  const rawPlanDetails = reactProps?.treatmentPlanDetails || [];
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const isFetching = Boolean(reactProps?.isLoading);

  // Filter States
  const [fromDate, setFromDate] = useState<string>(
    toDateInputValue(currentfilter.FromBillDate) || getTodayString()
  );
  const [toDate, setToDate] = useState<string>(
    toDateInputValue(currentfilter.ToBillDate) || getTodayString()
  );
  const [statusId, setStatusId] = useState<number>(currentfilter.PlanStatusId ?? 1);
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [planSearch, setPlanSearch] = useState<string>('');
  const [activePreset, setActivePreset] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all' | 'custom'>('today');

  // Master Table State
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    reactProps?.selectedPlan?.Id ?? null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<'planNo' | 'fromDate' | 'doctor' | 'amount' | 'status'>('fromDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [copiedPlanNo, setCopiedPlanNo] = useState<string | null>(null);

  // Sync incoming props
  useEffect(() => {
    if (currentfilter.FromBillDate) {
      setFromDate(toDateInputValue(currentfilter.FromBillDate));
    }
    if (currentfilter.ToBillDate) {
      setToDate(toDateInputValue(currentfilter.ToBillDate));
    }
    if (currentfilter.PlanStatusId !== undefined) {
      setStatusId(currentfilter.PlanStatusId);
    }
  }, [currentfilter.FromBillDate, currentfilter.ToBillDate, currentfilter.PlanStatusId]);

  useEffect(() => {
    if (reactProps?.selectedPlan?.Id) {
      setSelectedPlanId(reactProps.selectedPlan.Id);
    }
  }, [reactProps?.selectedPlan]);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  // Date Preset Helpers
  const applyPreset = (preset: 'today' | 'yesterday' | '7days' | 'month' | 'all') => {
    setActivePreset(preset);
    const today = new Date();
    let f = new Date();
    let t = new Date();

    if (preset === 'today') {
      // today
    } else if (preset === 'yesterday') {
      f.setDate(today.getDate() - 1);
      t.setDate(today.getDate() - 1);
    } else if (preset === '7days') {
      f.setDate(today.getDate() - 6);
    } else if (preset === 'month') {
      f = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === 'all') {
      f = new Date(2020, 0, 1);
      t = new Date(2030, 11, 31);
    }

    const fmtF = toDateInputValue(f);
    const fmtT = toDateInputValue(t);

    setFromDate(fmtF);
    setToDate(fmtT);

    dispatch('fromDateChange', { value: fmtF + ' 00:00:00' });
    dispatch('toDateChange', { value: fmtT + ' 23:59:59' });
    dispatch('fetch');
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setActivePreset('custom');
    dispatch('fromDateChange', { value: val ? val + ' 00:00:00' : null });
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setActivePreset('custom');
    dispatch('toDateChange', { value: val ? val + ' 23:59:59' : null });
  };

  const handleStatusChange = (val: number) => {
    setStatusId(val);
    dispatch('statusChange', { value: val });
  };

  const handleFetch = () => {
    setCurrentPage(1);
    dispatch('fetch');
  };

  const handleReset = () => {
    setActivePreset('today');
    const todayStr = getTodayString();
    setFromDate(todayStr);
    setToDate(todayStr);
    setStatusId(-1);
    setPatientSearch('');
    setPlanSearch('');
    setSelectedPlanId(null);
    setCurrentPage(1);

    dispatch('reset');
  };

  const handleCopyPlanNo = (e: React.MouseEvent, num?: string) => {
    e.stopPropagation();
    if (!num) return;
    navigator.clipboard?.writeText(num);
    setCopiedPlanNo(num);
    setTimeout(() => setCopiedPlanNo(null), 1500);
  };

  const sessionsWorkbenchRef = React.useRef<HTMLDivElement>(null);

  const handleSelectPlan = (plan: TreatmentPlanRow) => {
    setSelectedPlanId(plan.Id ?? null);
    dispatch('viewDetails', plan);
    setTimeout(() => {
      sessionsWorkbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBillPlan = (e: React.MouseEvent, plan: TreatmentPlanRow) => {
    e.stopPropagation();
    dispatch('updateBills', plan);
  };

  const handleBillSession = (dtl: TreatmentPlanDetailRow) => {
    dispatch('detailbills', dtl);
  };

  // Metrics computation across all loaded plans
  const metrics = useMemo(() => {
    const totalPlans = rawPlans.length;
    let totalPlannedAmount = 0;
    let totalSessions = 0;
    let totalPaidSessions = 0;
    let totalPendingSessions = 0;

    for (const p of rawPlans) {
      totalPlannedAmount += Number(p.TotalAmount) || 0;
      totalSessions += Number(p.NoOfDays) || 0;
      if (p.TreatmentPlanDetails) {
        for (const d of p.TreatmentPlanDetails) {
          if (d.IsPaid) totalPaidSessions++;
          else totalPendingSessions++;
        }
      }
    }

    return { totalPlans, totalPlannedAmount, totalSessions, totalPaidSessions, totalPendingSessions };
  }, [rawPlans]);

  // Client-side filtering & search on Master Plans
  const filteredPlans = useMemo(() => {
    let result = rawPlans;

    // Filter by patient search
    if (patientSearch.trim()) {
      const q = patientSearch.trim().toLowerCase();
      result = result.filter((p) => {
        const pat = p.Patient;
        const pName = `${pat?.Title?.Description || ''} ${pat?.FirstName || ''} ${pat?.LastName || ''}`.toLowerCase();
        const mrn = (pat?.MRN || '').toLowerCase();
        const mobile = (pat?.Mobile || '').toLowerCase();
        return pName.includes(q) || mrn.includes(q) || mobile.includes(q);
      });
    }

    // Filter by plan search box
    if (planSearch.trim()) {
      const q = planSearch.trim().toLowerCase();
      result = result.filter((p) => {
        const pNum = (p.PlanNumber || '').toLowerCase();
        const docName = `${p.Doctor?.Title?.Description || ''} ${p.Doctor?.FirstName || ''} ${p.Doctor?.LastName || ''}`.toLowerCase();
        const dept = (p.Department?.DepartmentName || '').toLowerCase();
        const treat = (p.TreatmentName || '').toLowerCase();
        return pNum.includes(q) || docName.includes(q) || dept.includes(q) || treat.includes(q);
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      let vA: any;
      let vB: any;
      if (sortField === 'planNo') {
        vA = a.PlanNumber || '';
        vB = b.PlanNumber || '';
      } else if (sortField === 'fromDate') {
        vA = a.PlanScheduledFrom ? new Date(a.PlanScheduledFrom).getTime() : 0;
        vB = b.PlanScheduledFrom ? new Date(b.PlanScheduledFrom).getTime() : 0;
      } else if (sortField === 'doctor') {
        vA = `${a.Doctor?.FirstName || ''} ${a.Doctor?.LastName || ''}`;
        vB = `${b.Doctor?.FirstName || ''} ${b.Doctor?.LastName || ''}`;
      } else if (sortField === 'amount') {
        vA = Number(a.TotalAmount) || 0;
        vB = Number(b.TotalAmount) || 0;
      } else if (sortField === 'status') {
        vA = getStatusText(a.PlanStatus);
        vB = getStatusText(b.PlanStatus);
      }
      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rawPlans, patientSearch, planSearch, sortField, sortAsc]);

  // Master Table Pagination
  const totalItems = filteredPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPlans = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, safePage, pageSize]);

  // Currently active selected plan object
  const activeSelectedPlan = useMemo(() => {
    if (!selectedPlanId) return rawPlans[0] || null;
    return rawPlans.find((p) => p.Id === selectedPlanId) || rawPlans[0] || null;
  }, [rawPlans, selectedPlanId]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE TITLE & WORKSTATION HEADER
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fas fa-clipboard-list" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: '-0.01em',
                }}
              >
                Treatment Plan Billing
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className="fas fa-check-circle" style={{ fontSize: '10px' }} />
                EMR & Invoicing
              </span>
            </div>
            <p
              style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: colors.textMuted,
              }}
            >
              Review clinical care plans, inspect scheduled treatment sessions, and generate billing invoices.
            </p>
          </div>
        </div>

        {/* Live Plan Count Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: radii.full,
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-calendar-alt" />
            {rawPlans.length} {rawPlans.length === 1 ? 'Care Plan Loaded' : 'Care Plans Loaded'}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXECUTIVE KPI CARDS
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {/* Metric 1: Total Plans */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            padding: '14px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Care Plans
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
              {metrics.totalPlans}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Registered treatment plans
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-file-medical" />
          </div>
        </div>

        {/* Metric 2: Total Planned Value */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            padding: '14px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Plan Value
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {formatCurrency(metrics.totalPlannedAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Total scheduled care value
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-coins" />
          </div>
        </div>

        {/* Metric 3: Total Scheduled Sessions */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            padding: '14px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled Sessions
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
              {metrics.totalSessions}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Days of treatment sessions
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-calendar-check" />
          </div>
        </div>

        {/* Metric 4: Pending Billing */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            padding: '14px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Billing Status
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706', marginTop: 4 }}>
              {metrics.totalPendingSessions > 0 ? `${metrics.totalPendingSessions} Pending` : 'All Billed'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Uninvoiced treatment sessions
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-receipt" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER WORKBENCH
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          padding: '16px 20px',
        }}
      >
        {/* Preset Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginRight: 4 }}>
              <i className="fas fa-calendar-alt" style={{ marginRight: 6 }} />
              Date Presets:
            </span>
            {(['today', 'yesterday', '7days', 'month', 'all'] as const).map((p) => {
              const labels = {
                today: 'Today',
                yesterday: 'Yesterday',
                '7days': 'Last 7 Days',
                month: 'This Month',
                all: 'All Time',
              };
              const isSelected = activePreset === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#e0f2fe' : '#f8fafc',
                    color: isSelected ? '#0284c7' : '#475569',
                    fontWeight: isSelected ? 600 : 500,
                    padding: '4px 10px',
                    borderRadius: radii.full,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Found <strong style={{ color: colors.textMain }}>{filteredPlans.length}</strong> matching plans
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr)) 160px',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Plan Status Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Plan Status
            </label>
            <select
              value={statusId}
              onChange={(e) => handleStatusChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value={-1}>All Statuses</option>
              {(lookup.PlanStatus || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Search */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Patient Name / UHID / Phone
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-user-injured"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              />
              <input
                type="text"
                placeholder="Search patient or UHID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px 0 36px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {patientSearch && (
                <button
                  type="button"
                  onClick={() => setPatientSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 2,
                  }}
                >
                  <i className="fas fa-times" style={{ fontSize: '12px' }} />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Fetch & Reset */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleFetch}
              disabled={isFetching}
              style={{
                flex: 1,
                height: 36,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: radii.md,
                fontWeight: 600,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: isFetching ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: transitions.fast,
              }}
            >
              <i className={`fas ${isFetching ? 'fa-spinner fa-spin' : 'fa-search'}`} />
              <span>{isFetching ? 'Fetching' : 'Fetch'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset Filters"
              style={{
                width: 36,
                height: 36,
                background: '#f8fafc',
                color: '#64748b',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: transitions.fast,
              }}
            >
              <i className="fas fa-redo-alt" style={{ fontSize: '12px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MASTER TREATMENT PLANS TABLE
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Table Toolbar Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: '#fafbfc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#0284c7',
                display: 'inline-block',
              }}
            />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
              Registered Treatment Plans
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: radii.full,
                background: '#e0f2fe',
                color: '#0369a1',
              }}
            >
              {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-filter"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '11px',
                }}
              />
              <input
                type="text"
                placeholder="Search plans, doctor, service..."
                value={planSearch}
                onChange={(e) => {
                  setPlanSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: 32,
                  width: 220,
                  padding: '0 8px 0 34px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '12px',
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: colors.textMuted }}>
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  height: 32,
                  padding: '0 8px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '12px',
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '10px 14px', width: 44, textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>#</th>
                <th
                  onClick={() => toggleSort('planNo')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Plan No
                    <i className={`fas fa-sort${sortField === 'planNo' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('fromDate')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Scheduled Period
                    <i className={`fas fa-sort${sortField === 'fromDate' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted }}>
                  Patient / Treatment
                </th>
                <th
                  onClick={() => toggleSort('doctor')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Doctor / Consultant
                    <i className={`fas fa-sort${sortField === 'doctor' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>
                  Sessions
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
                    Net Amount
                    <i className={`fas fa-sort${sortField === 'amount' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Status
                    <i className={`fas fa-sort${sortField === 'status' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: 170, fontWeight: 600, color: colors.textMuted }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                        }}
                      >
                        <i className="fas fa-search" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain }}>
                        No Treatment Plans Found
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, maxWidth: 360 }}>
                        {planSearch || patientSearch
                          ? 'No treatment plans match your active filter criteria. Try clearing search keywords or selecting "All Statuses".'
                          : 'No treatment plans registered in this date range. Click "All Time" to view existing care plans.'}
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          marginTop: 6,
                          padding: '6px 16px',
                          borderRadius: radii.md,
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedPlans.map((plan, idx) => {
                  const globalIdx = (safePage - 1) * pageSize + idx + 1;
                  const isSelected = selectedPlanId === plan.Id;
                  const isCopied = copiedPlanNo === plan.PlanNumber;
                  const docTitle = plan.Doctor?.Title?.Description ? `${plan.Doctor.Title.Description} ` : '';
                  const docName = `${docTitle}${plan.Doctor?.FirstName || ''} ${plan.Doctor?.LastName || ''}`.trim() || 'General Consultant';
                  const patTitle = plan.Patient?.Title?.Description ? `${plan.Patient.Title.Description} ` : '';
                  const patName = `${patTitle}${plan.Patient?.FirstName || ''} ${plan.Patient?.LastName || ''}`.trim();
                  const statusLabel = getStatusText(plan.PlanStatus);
                  const isCompleted = statusLabel.toLowerCase().includes('complete');
                  const isCancelled = statusLabel.toLowerCase().includes('cancel');

                  return (
                    <tr
                      key={plan.Id ?? idx}
                      onClick={() => handleSelectPlan(plan)}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: isSelected ? '#f0f9ff' : idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        cursor: 'pointer',
                        transition: transitions.fast,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfcfd';
                      }}
                    >
                      {/* Sl # */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>
                        {globalIdx}
                      </td>

                      {/* Plan No */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: isSelected ? '#0369a1' : '#1e293b',
                              background: isSelected ? '#e0f2fe' : '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: radii.sm,
                              border: isSelected ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                            }}
                          >
                            {plan.PlanNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPlanNo(e, plan.PlanNumber)}
                            title="Copy Plan Number"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: isCopied ? '#16a34a' : '#94a3b8',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`} style={{ fontSize: '12px' }} />
                          </button>
                        </div>
                      </td>

                      {/* Scheduled Period */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontWeight: 600, color: colors.textMain, fontSize: '12px' }}>
                            {formatDate(plan.PlanScheduledFrom)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fas fa-arrow-down" style={{ fontSize: '9px', color: '#94a3b8' }} />
                            <span>{formatDate(plan.PlanScheduledTo)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Patient & Service Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <div>
                          {patName ? (
                            <div style={{ fontWeight: 600, color: colors.textMain }}>{patName}</div>
                          ) : null}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: patName ? 2 : 0 }}>
                            {plan.Patient?.MRN && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: radii.sm,
                                  background: '#ecfeff',
                                  color: '#0891b2',
                                  border: '1px solid #cffafe',
                                }}
                              >
                                {plan.Patient.MRN}
                              </span>
                            )}
                            {plan.TreatmentName && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#475569',
                                  fontWeight: 500,
                                }}
                              >
                                {plan.TreatmentName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor / Specialty */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fas fa-user-md" style={{ color: '#0284c7', fontSize: '14px' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: colors.textMain }}>{docName}</div>
                            {plan.Department?.DepartmentName && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{plan.Department.DepartmentName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sessions Count */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {plan.NoOfDays ?? 1} {plan.NoOfDays === 1 ? 'Session' : 'Sessions'}
                        </span>
                      </td>

                      {/* Net Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: colors.textMain }}>
                          {formatCurrency(plan.TotalAmount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            background: isCompleted ? '#f0fdf4' : isCancelled ? '#fef2f2' : '#eff6ff',
                            color: isCompleted ? '#16a34a' : isCancelled ? '#dc2626' : '#2563eb',
                            border: isCompleted ? '1px solid #bbf7d0' : isCancelled ? '1px solid #fecaca' : '1px solid #bfdbfe',
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* View Sessions button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPlan(plan);
                            }}
                            title="Inspect Session Details"
                            style={{
                              background: isSelected ? '#0284c7' : '#f0f9ff',
                              color: isSelected ? '#ffffff' : '#0369a1',
                              border: isSelected ? 'none' : '1px solid #bae6fd',
                              padding: '5px 10px',
                              borderRadius: radii.md,
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fas fa-list-ul" style={{ fontSize: '10px' }} />
                            <span>Sessions</span>
                          </button>

                          {/* Bill Plan button */}
                          <button
                            type="button"
                            onClick={(e) => handleBillPlan(e, plan)}
                            title="Open Billing Modal"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: radii.md,
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                            }}
                          >
                            <i className="fas fa-file-invoice-dollar" style={{ fontSize: '10px' }} />
                            <span>Bill Plan</span>
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

        {/* Master Table Pagination */}
        {totalItems > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: `1px solid ${colors.border}`,
              background: '#f8fafc',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: '12px',
              color: colors.textMuted,
            }}
          >
            <div>
              Showing <strong style={{ color: colors.textMain }}>{(safePage - 1) * pageSize + 1}</strong> to{' '}
              <strong style={{ color: colors.textMain }}>{Math.min(safePage * pageSize, totalItems)}</strong> of{' '}
              <strong style={{ color: colors.textMain }}>{totalItems}</strong> plans
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: safePage <= 1 ? '#f1f5f9' : '#ffffff',
                  color: safePage <= 1 ? '#94a3b8' : colors.textMain,
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Previous
              </button>

              <span style={{ padding: '0 6px', fontWeight: 600, color: colors.textMain }}>
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: safePage >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: safePage >= totalPages ? '#94a3b8' : colors.textMain,
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. DETAILED SESSION SCHEDULE WORKBENCH
      ────────────────────────────────────────────────────────────── */}
      <div
        ref={sessionsWorkbenchRef}
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Detail Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: '#fafbfc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
              }}
            >
              <i className="fas fa-calendar-day" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
                  Scheduled Sessions Breakdown
                </h3>
                {activeSelectedPlan && (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '2px 8px',
                      borderRadius: radii.sm,
                    }}
                  >
                    {activeSelectedPlan.PlanNumber}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 2 }}>
                {activeSelectedPlan
                  ? `Detailed treatment session schedule and individual session invoicing.`
                  : 'Select a care plan above to inspect and bill individual treatment days.'}
              </div>
            </div>
          </div>

          {rawPlanDetails.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: radii.full,
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
              }}
            >
              {rawPlanDetails.length} {rawPlanDetails.length === 1 ? 'Session Scheduled' : 'Sessions Scheduled'}
            </span>
          )}
        </div>

        {/* Sessions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '10px 14px', width: 44, textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>#</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted }}>Session Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted }}>Treatment / Service Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted }}>Time Slot</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: colors.textMuted }}>Amount</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>Payment Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: 140, fontWeight: 600, color: colors.textMuted }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rawPlanDetails.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        <i className="fas fa-procedures" />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textMain }}>
                        {selectedPlanId ? 'No Sessions Recorded for This Plan' : 'Select a Treatment Plan Above'}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, maxWidth: 360 }}>
                        {selectedPlanId
                          ? 'This treatment plan does not contain any scheduled sessions.'
                          : 'Click "Sessions" or select any row in the Care Plans table above to inspect scheduled sessions.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rawPlanDetails.map((dtl, idx) => {
                  const sTime = formatTime(dtl.PlanStartTime);
                  const eTime = formatTime(dtl.PlanEndTime);
                  const timeSlot = sTime || eTime ? `${sTime || '--'} - ${eTime || '--'}` : 'Scheduled Time';
                  const dtlStatus = getStatusText(dtl.PlanStatus, 'Scheduled');

                  return (
                    <tr
                      key={dtl.Id ?? idx}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        transition: transitions.fast,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfcfd')}
                    >
                      {/* Session # */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>
                        {idx + 1}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <i className="far fa-calendar-alt" style={{ color: '#0284c7', fontSize: '12px' }} />
                          <span style={{ fontWeight: 600, color: colors.textMain }}>
                            {formatDate(dtl.PlanScheduleDate)}
                          </span>
                        </div>
                      </td>

                      {/* Treatment Name & Code */}
                      <td style={{ padding: '12px 14px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: colors.textMain }}>
                            {dtl.ServiceName || 'Clinical Service'}
                          </div>
                          {dtl.ServiceCode && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                color: '#64748b',
                                background: '#f1f5f9',
                                padding: '1px 6px',
                                borderRadius: radii.sm,
                              }}
                            >
                              {dtl.ServiceCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Time Slot */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="far fa-clock" style={{ fontSize: '11px' }} />
                          <span>{timeSlot}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: colors.textMain }}>
                          {formatCurrency(dtl.ServicePrice ?? dtl.NetAmount ?? 0)}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {dtl.IsPaid ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 10px',
                              borderRadius: radii.full,
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fas fa-check" style={{ fontSize: '9px' }} />
                            Paid
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 10px',
                              borderRadius: radii.full,
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fas fa-hourglass-half" style={{ fontSize: '9px' }} />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Session Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: radii.full,
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {dtlStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {!dtl.IsPaid ? (
                          <button
                            type="button"
                            onClick={() => handleBillSession(dtl)}
                            title="Invoice this scheduled session"
                            style={{
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: radii.md,
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                            }}
                          >
                            <i className="fas fa-file-invoice" style={{ fontSize: '10px' }} />
                            <span>Bill Session</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#16a34a',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fas fa-check-circle" />
                            Invoiced
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
