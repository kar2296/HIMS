import React, { useState, useMemo, useEffect, useRef } from 'react';
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

export interface BillInfo {
  Id?: number;
  BillNumber?: string;
  BillDateTime?: string;
  Patient?: PatientInfo;
  DoctorName?: string;
  BillAmount?: number;
  PaidAmount?: number;
  PatientId?: number;
  PatientBillStatus?: string;
  Status?: number;
}

export interface BillDiscountListScreenProps {
  variant: 'op' | 'pharmacy';
  reactProps?: {
    rows?: BillInfo[];
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
      PatBillNum?: string;
      PatientId?: number;
    };
    isLoading?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr?: string): { date: string; time: string } {
  if (!dateStr) return { date: '-', time: '' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date, time };
  } catch {
    return { date: dateStr, time: '' };
  }
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const BillDiscountListScreen: React.FC<BillDiscountListScreenProps> = ({
  variant = 'op',
  reactProps,
  onAction,
}) => {
  const rawRows = reactProps?.rows || [];
  const currentfilter = reactProps?.currentfilter || {};
  const isFetching = Boolean(reactProps?.isLoading);

  // Filter States
  const [fromDate, setFromDate] = useState<string>(
    currentfilter.FromBillDate ? currentfilter.FromBillDate.slice(0, 10) : getTodayString()
  );
  const [toDate, setToDate] = useState<string>(
    currentfilter.ToBillDate ? currentfilter.ToBillDate.slice(0, 10) : getTodayString()
  );
  const [billNo, setBillNo] = useState<string>(currentfilter.BillNo || currentfilter.PatBillNum || '');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [activePreset, setActivePreset] = useState<'today' | 'yesterday' | '7days' | 'month' | 'custom'>('today');

  // Table pagination and sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<'date' | 'billNo' | 'patient' | 'amount' | 'paid' | 'due'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [copiedBillId, setCopiedBillId] = useState<string | null>(null);

  // Sync incoming props
  useEffect(() => {
    if (currentfilter.FromBillDate) {
      setFromDate(currentfilter.FromBillDate.slice(0, 10));
    }
    if (currentfilter.ToBillDate) {
      setToDate(currentfilter.ToBillDate.slice(0, 10));
    }
    if (currentfilter.BillNo !== undefined) {
      setBillNo(currentfilter.BillNo || '');
    }
  }, [currentfilter.FromBillDate, currentfilter.ToBillDate, currentfilter.BillNo]);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  // Date Preset Helpers
  const applyPreset = (preset: 'today' | 'yesterday' | '7days' | 'month') => {
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
    }

    const fmtF = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    const fmtT = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;

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

  const handleBillNoChange = (val: string) => {
    setBillNo(val);
    dispatch('billNoChange', { value: val });
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
    setBillNo('');
    setPatientSearch('');
    setQuickFilter('');
    setCurrentPage(1);

    dispatch('fromDateChange', { value: todayStr + ' 00:00:00' });
    dispatch('toDateChange', { value: todayStr + ' 23:59:59' });
    dispatch('billNoChange', { value: '' });
    dispatch('reset');
  };

  const handleCopyBillNo = (e: React.MouseEvent, billNum?: string) => {
    e.stopPropagation();
    if (!billNum) return;
    navigator.clipboard?.writeText(billNum);
    setCopiedBillId(billNum);
    setTimeout(() => setCopiedBillId(null), 1500);
  };

  const edit = (row: BillInfo) => {
    if (!row.Id) return;
    const payload: any = {
      Id: row.Id,
      BillNumber: row.BillNumber,
    };
    if (variant === 'pharmacy') {
      payload.PatientId = row.PatientId;
    }
    dispatch('edit', payload);
  };

  // Metrics computation across all loaded rows
  const metrics = useMemo(() => {
    const totalCount = rawRows.length;
    let totalGross = 0;
    let totalPaid = 0;
    let totalDue = 0;

    for (const r of rawRows) {
      const g = Number(r.BillAmount) || 0;
      const p = Number(r.PaidAmount) || 0;
      totalGross += g;
      totalPaid += p;
      totalDue += Math.max(0, g - p);
    }

    return { totalCount, totalGross, totalPaid, totalDue };
  }, [rawRows]);

  // Client-side instant filtering (Quick filter + Patient search)
  const filteredRows = useMemo(() => {
    let result = rawRows;

    // Filter by patient search box
    if (patientSearch.trim()) {
      const q = patientSearch.trim().toLowerCase();
      result = result.filter((r) => {
        const p = r.Patient;
        const pName = `${p?.Title?.Description || ''} ${p?.FirstName || ''} ${p?.LastName || ''}`.toLowerCase();
        const mrn = (p?.MRN || '').toLowerCase();
        const mobile = (p?.Mobile || '').toLowerCase();
        return pName.includes(q) || mrn.includes(q) || mobile.includes(q);
      });
    }

    // Filter by quick filter bar (across all text columns)
    if (quickFilter.trim()) {
      const q = quickFilter.trim().toLowerCase();
      result = result.filter((r) => {
        const billNum = (r.BillNumber || '').toLowerCase();
        const doc = (r.DoctorName || '').toLowerCase();
        const p = r.Patient;
        const pName = `${p?.Title?.Description || ''} ${p?.FirstName || ''} ${p?.LastName || ''}`.toLowerCase();
        const mrn = (p?.MRN || '').toLowerCase();
        return billNum.includes(q) || doc.includes(q) || pName.includes(q) || mrn.includes(q);
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      let vA: any;
      let vB: any;
      if (sortField === 'date') {
        vA = a.BillDateTime ? new Date(a.BillDateTime).getTime() : 0;
        vB = b.BillDateTime ? new Date(b.BillDateTime).getTime() : 0;
      } else if (sortField === 'billNo') {
        vA = a.BillNumber || '';
        vB = b.BillNumber || '';
      } else if (sortField === 'patient') {
        vA = `${a.Patient?.FirstName || ''} ${a.Patient?.LastName || ''}`;
        vB = `${b.Patient?.FirstName || ''} ${b.Patient?.LastName || ''}`;
      } else if (sortField === 'amount') {
        vA = Number(a.BillAmount) || 0;
        vB = Number(b.BillAmount) || 0;
      } else if (sortField === 'paid') {
        vA = Number(a.PaidAmount) || 0;
        vB = Number(b.PaidAmount) || 0;
      } else if (sortField === 'due') {
        vA = Math.max(0, (Number(a.BillAmount) || 0) - (Number(a.PaidAmount) || 0));
        vB = Math.max(0, (Number(b.BillAmount) || 0) - (Number(b.PaidAmount) || 0));
      }
      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rawRows, patientSearch, quickFilter, sortField, sortAsc]);

  // Pagination calculation
  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

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
          1. TOP EXECUTIVE KPI METRICS
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {/* Metric 1: Total Bills */}
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
              Total Bills
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
              {metrics.totalCount}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              {variant === 'op' ? 'Outpatient bills' : 'Pharmacy bills'}
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
            <i className="fas fa-file-invoice" />
          </div>
        </div>

        {/* Metric 2: Total Gross Value */}
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
              Total Billed
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {formatCurrency(metrics.totalGross)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Gross value before discount
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

        {/* Metric 3: Total Collected / Paid */}
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
              Total Collected
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
              {formatCurrency(metrics.totalPaid)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Paid & settled amounts
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-check-circle" />
          </div>
        </div>

        {/* Metric 4: Outstanding Due */}
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
              Outstanding Due
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: metrics.totalDue > 0 ? '#dc2626' : '#16a34a',
                marginTop: 4,
              }}
            >
              {formatCurrency(metrics.totalDue)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              Eligible for discount / write-off
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: metrics.totalDue > 0 ? '#fef2f2' : '#f0fdf4',
              color: metrics.totalDue > 0 ? '#dc2626' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className={`fas ${metrics.totalDue > 0 ? 'fa-exclamation-circle' : 'fa-check'}`} />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & QUERY WORKBENCH
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
            {(['today', 'yesterday', '7days', 'month'] as const).map((p) => {
              const labels = {
                today: 'Today',
                yesterday: 'Yesterday',
                '7days': 'Last 7 Days',
                month: 'This Month',
              };
              const isSelected = activePreset === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    color: isSelected ? '#2563eb' : '#475569',
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

          {/* Quick Result Indicator */}
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Found <strong style={{ color: colors.textMain }}>{filteredRows.length}</strong> matching bills
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 160px',
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

          {/* Bill Number */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Bill Number
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-hashtag"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              />
              <input
                type="text"
                placeholder="e.g. OPCA24-25/109"
                value={billNo}
                onChange={(e) => handleBillNoChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px 0 32px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {billNo && (
                <button
                  type="button"
                  onClick={() => handleBillNoChange('')}
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

          {/* Patient Quick Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Patient Name / UHID / Phone
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-user-injured"
                style={{
                  position: 'absolute',
                  left: 10,
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
                  padding: '0 10px 0 32px',
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

          {/* Action Buttons: Fetch & Reset */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleFetch}
              disabled={isFetching}
              style={{
                flex: 1,
                height: 36,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
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
          3. BILLS DATA WORKBENCH & TABLE
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
                background: '#2563eb',
                display: 'inline-block',
              }}
            />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
              {variant === 'op' ? 'Outpatient Bills Record' : 'Pharmacy Bills Record'}
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
              {filteredRows.length} {filteredRows.length === 1 ? 'bill' : 'bills'}
            </span>
          </div>

          {/* Quick Filter In-Result & Page Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-filter"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '11px',
                }}
              />
              <input
                type="text"
                placeholder="Filter results..."
                value={quickFilter}
                onChange={(e) => {
                  setQuickFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: 32,
                  width: 200,
                  padding: '0 8px 0 30px',
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
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
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
                <th style={{ padding: '10px 14px', width: 48, textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>#</th>
                <th
                  onClick={() => toggleSort('date')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Bill Date & Time
                    <i className={`fas fa-sort${sortField === 'date' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('billNo')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Bill Number
                    <i className={`fas fa-sort${sortField === 'billNo' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('patient')}
                  style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Patient Details
                    <i className={`fas fa-sort${sortField === 'patient' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMuted }}>
                  Consultant / Doctor
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
                    Bill Amount
                    <i className={`fas fa-sort${sortField === 'amount' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('paid')}
                  style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
                    Paid Amount
                    <i className={`fas fa-sort${sortField === 'paid' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('due')}
                  style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
                    Balance Due
                    <i className={`fas fa-sort${sortField === 'due' ? (sortAsc ? '-up' : '-down') : ''}`} style={{ fontSize: '10px' }} />
                  </span>
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: colors.textMuted }}>
                  Status
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: 120, fontWeight: 600, color: colors.textMuted }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '48px 20px', textAlign: 'center' }}>
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
                        No Bills Found
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, maxWidth: 360 }}>
                        {quickFilter || patientSearch || billNo
                          ? 'No bills match your current search criteria. Try modifying your search keywords or clearing filters.'
                          : 'No bills are registered in the selected date range. Click "This Month" or pick another date.'}
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          marginTop: 6,
                          padding: '6px 16px',
                          borderRadius: radii.md,
                          background: '#2563eb',
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
                pagedRows.map((row, idx) => {
                  const globalIdx = (safePage - 1) * pageSize + idx + 1;
                  const dt = formatDate(row.BillDateTime);
                  const bAmt = Number(row.BillAmount) || 0;
                  const pAmt = Number(row.PaidAmount) || 0;
                  const dueAmt = Math.max(0, bAmt - pAmt);
                  const isCopied = copiedBillId === row.BillNumber;

                  return (
                    <tr
                      key={row.Id ?? idx}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        transition: transitions.fast,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfcfd')}
                    >
                      {/* Sl # */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>
                        {globalIdx}
                      </td>

                      {/* Bill Date & Time */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain }}>{dt.date}</div>
                        {dt.time && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="far fa-clock" style={{ fontSize: '10px' }} />
                            <span>{dt.time}</span>
                          </div>
                        )}
                      </td>

                      {/* Bill Number (with copy button) */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#1e293b',
                              background: '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: radii.sm,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {row.BillNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyBillNo(e, row.BillNumber)}
                            title="Copy Bill Number"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: isCopied ? '#16a34a' : '#94a3b8',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: transitions.fast,
                            }}
                          >
                            <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`} style={{ fontSize: '12px' }} />
                          </button>
                        </div>
                      </td>

                      {/* Patient Information */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            <i className="fas fa-user" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: colors.textMain }}>
                              {row.Patient?.Title?.Description ? `${row.Patient.Title.Description} ` : ''}
                              {row.Patient?.FirstName || ''} {row.Patient?.LastName || ''}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
                              {row.Patient?.MRN && (
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
                                  {row.Patient.MRN}
                                </span>
                              )}
                              {(row.Patient?.Age || row.Patient?.Gender?.Description) && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    padding: '1px 6px',
                                    borderRadius: radii.sm,
                                    background: '#f1f5f9',
                                    color: '#475569',
                                  }}
                                >
                                  {row.Patient?.Age ? `${row.Patient.Age}Y` : ''}
                                  {row.Patient?.Age && row.Patient?.Gender?.Description ? ' / ' : ''}
                                  {row.Patient?.Gender?.Description || ''}
                                </span>
                              )}
                              {row.Patient?.Mobile && (
                                <span style={{ fontSize: '11px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <i className="fas fa-phone-alt" style={{ fontSize: '9px' }} />
                                  {row.Patient.Mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Name */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="fas fa-user-md" style={{ color: '#0284c7', fontSize: '13px' }} />
                          <span style={{ fontWeight: 500, color: colors.textMain }}>
                            {row.DoctorName || 'Self / Hospital'}
                          </span>
                        </div>
                      </td>

                      {/* Bill Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: colors.textMain }}>
                          {formatCurrency(bAmt)}
                        </span>
                      </td>

                      {/* Paid Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>
                          {formatCurrency(pAmt)}
                        </span>
                      </td>

                      {/* Balance Due */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {dueAmt > 0 ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color: '#dc2626',
                              background: '#fef2f2',
                              padding: '3px 8px',
                              borderRadius: radii.sm,
                              border: '1px solid #fee2e2',
                            }}
                          >
                            {formatCurrency(dueAmt)}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#16a34a',
                              background: '#f0fdf4',
                              padding: '2px 8px',
                              borderRadius: radii.full,
                            }}
                          >
                            Paid in Full
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const statusText = typeof row.PatientBillStatus === 'object' && row.PatientBillStatus
                            ? (row.PatientBillStatus as any).Description || 'Completed'
                            : (typeof row.PatientBillStatus === 'string' ? row.PatientBillStatus : (dueAmt === 0 ? 'Completed' : 'Pending'));
                          const isCompleted = statusText.toLowerCase().includes('complete') || dueAmt === 0;
                          return (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 10px',
                                borderRadius: radii.full,
                                background: isCompleted ? '#f0fdf4' : '#fef3c7',
                                color: isCompleted ? '#15803d' : '#b45309',
                                border: isCompleted ? '1px solid #bbf7d0' : '1px solid #fde68a',
                              }}
                            >
                              {statusText}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action: Open Bill Discount Modal */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => edit(row)}
                          title="Apply Bill Discount / Write Off"
                          style={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: radii.md,
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                            transition: transitions.fast,
                          }}
                        >
                          <i className="fas fa-percent" style={{ fontSize: '11px' }} />
                          <span>Discount</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. PAGINATION FOOTER
        ────────────────────────────────────────────────────────────── */}
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
              <strong style={{ color: colors.textMain }}>{totalItems}</strong> bills
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className="fas fa-chevron-left" style={{ fontSize: '10px' }} />
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Next
                <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
