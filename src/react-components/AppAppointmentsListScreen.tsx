import React, { useState, useMemo } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

export interface LookupOption {
  Id: number | string;
  Text: string;
}

export interface PatientInfo {
  FirstName?: string;
  LastName?: string;
  Title?: { Description?: string };
  MRN?: string;
  Age?: number | string;
  Gender?: { Description?: string };
  MRNTypeId?: number;
}

export interface DoctorInfo {
  FirstName?: string;
  LastName?: string;
  Title?: { Description?: string };
}

export interface EncounterInfo {
  EncounterId?: number;
  IsBillCompleted?: boolean;
}

export interface AppointmentEntity {
  Id: number;
  PatientId?: number;
  DoctorId?: number | string;
  AppointmentDate?: string;
  StartTime?: string;
  EndTime?: string;
  Remarks?: string;
  Patient?: PatientInfo;
  User?: DoctorInfo;
  PaymentMode?: { Description?: string };
  VirtualOrder?: {
    OrderConsultType?: { Description?: string };
    OrderTotal?: number | string;
  };
  AppointmentStatus?: {
    Id?: number;
    Description?: string;
    ColorCode?: string;
  };
  AppointmentStatusId?: number;
  Encounter?: EncounterInfo;
  billed?: string;
}

export interface CurrentFilterShape {
  FacilityId?: number;
  DepartmentId?: number;
  AppointmentTypeId?: number | string;
  DoctorId?: string;
  AppointmentStatusId?: number | string;
  appointmentdate?: string | Date;
  MRN?: string;
  Mobile?: string;
}

export interface PagerShape {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  startIndex?: number;
}

export interface ReactPropsShape {
  currentfilter?: CurrentFilterShape;
  currentcontext?: {
    candisableappttype?: boolean;
    selectedDoctor?: string;
    ct?: string;
  };
  lookup?: {
    AppointmentType?: LookupOption[];
    Doctor?: LookupOption[];
    AppointmentStatus?: LookupOption[];
    Department?: LookupOption[];
  };
  rows?: AppointmentEntity[];
  pager?: PagerShape;
  showCalendar?: boolean;
  loading?: boolean;
}

export interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateDisplay(dateVal?: string | Date): string {
  if (!dateVal) return '-';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) {
    // If string like "06/10/2026"
    return String(dateVal);
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
}

function toIsoDate(d?: string | Date): string {
  if (!d) return '';
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  // If string like "06/10/2026" (DD/MM/YYYY)
  if (typeof d === 'string' && d.includes('/')) {
    const parts = d.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY or MM/DD/YYYY
        const d1 = parseInt(parts[0], 10);
        const m1 = parseInt(parts[1], 10);
        const y1 = parseInt(parts[2], 10);
        if (d1 > 12) {
          // Definitely DD/MM/YYYY
          return `${y1}-${String(m1).padStart(2, '0')}-${String(d1).padStart(2, '0')}`;
        }
        return `${y1}-${String(m1).padStart(2, '0')}-${String(d1).padStart(2, '0')}`;
      }
    }
  }
  const dateObj = new Date(d);
  if (!isNaN(dateObj.getTime())) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
  }
  return '';
}

function getStatusBadgeStyle(statusDesc?: string, colorCode?: string): { bg: string; color: string; dot: string } {
  if (colorCode && colorCode.startsWith('#')) {
    return {
      bg: `${colorCode}15`,
      color: colorCode,
      dot: colorCode,
    };
  }
  const s = (statusDesc || '').toLowerCase();
  if (s.includes('check') || s.includes('admit') || s.includes('in')) {
    return { bg: '#ecfdf5', color: '#047857', dot: '#10b981' };
  }
  if (s.includes('sched')) {
    return { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' };
  }
  if (s.includes('cancel') || s.includes('reject')) {
    return { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' };
  }
  if (s.includes('complete') || s.includes('finish') || s.includes('done')) {
    return { bg: '#f5f3ff', color: '#6d28d9', dot: '#8b5cf6' };
  }
  return { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
}

export const AppAppointmentsListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const currentcontext = reactProps?.currentcontext || {};
  const lookup = reactProps?.lookup || {};
  const rows = reactProps?.rows || [];
  const pager = reactProps?.pager || { totalItems: 0, currentPage: 1, pageSize: 25 };
  const showCalendar = !!reactProps?.showCalendar;
  const loading = !!reactProps?.loading;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuickStatus, setSelectedQuickStatus] = useState<string>('all');

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Quick date jump helpers
  const handleDateOffset = (offsetDays: number) => {
    let baseDate: Date;
    const curVal = currentfilter.appointmentdate;
    if (curVal instanceof Date) {
      baseDate = new Date(curVal.getTime());
    } else if (typeof curVal === 'string' && curVal.length > 0) {
      const iso = toIsoDate(curVal);
      baseDate = iso ? new Date(iso) : new Date();
    } else {
      baseDate = new Date();
    }
    baseDate.setDate(baseDate.getDate() + offsetDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    const newDateStr = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`;
    dispatch('dateChange', { value: newDateStr });
  };

  const handleTodayClick = () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    dispatch('dateChange', { value: todayStr });
  };

  // Client-side quick filter for instant responsiveness
  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const pName = `${item.Patient?.Title?.Description || ''} ${item.Patient?.FirstName || ''} ${item.Patient?.LastName || ''}`.toLowerCase();
        const mrn = (item.Patient?.MRN || '').toLowerCase();
        const doc = `${item.User?.Title?.Description || ''} ${item.User?.FirstName || ''} ${item.User?.LastName || ''}`.toLowerCase();
        const reason = (item.Remarks || '').toLowerCase();
        if (!pName.includes(q) && !mrn.includes(q) && !doc.includes(q) && !reason.includes(q)) {
          return false;
        }
      }
      // Quick status pill filter
      if (selectedQuickStatus !== 'all') {
        const s = (item.AppointmentStatus?.Description || '').toLowerCase();
        if (selectedQuickStatus === 'scheduled' && !s.includes('sched')) return false;
        if (selectedQuickStatus === 'checkedin' && !s.includes('check')) return false;
        if (selectedQuickStatus === 'completed' && !s.includes('complet')) return false;
        if (selectedQuickStatus === 'cancelled' && !s.includes('cancel')) return false;
      }
      return true;
    });
  }, [rows, searchTerm, selectedQuickStatus]);

  // Compute status counts for pills
  const statusCounts = useMemo(() => {
    const counts = { all: rows.length, scheduled: 0, checkedin: 0, completed: 0, cancelled: 0 };
    rows.forEach((r) => {
      const s = (r.AppointmentStatus?.Description || '').toLowerCase();
      if (s.includes('sched')) counts.scheduled++;
      else if (s.includes('check')) counts.checkedin++;
      else if (s.includes('complet')) counts.completed++;
      else if (s.includes('cancel')) counts.cancelled++;
    });
    return counts;
  }, [rows]);

  const isoDateVal = toIsoDate(currentfilter.appointmentdate);

  return (
    <div style={{ fontFamily: typography.fontFamily, color: '#1e293b' }}>
      {/* 1. Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            <i className="fa-solid fa-calendar-check" style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Appointments
              </h2>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                }}
              >
                {pager.totalItems || rows.length} Scheduled
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#64748b' }}>
              Real-time outpatient schedule, patient consultations & slot tracking
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Calendar / Table View Toggle */}
          <button
            type="button"
            onClick={() => dispatch('toggleView')}
            title={showCalendar ? 'Switch to Table View' : 'Switch to Calendar View'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 38,
              padding: '0 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: showCalendar ? '#eff6ff' : '#ffffff',
              color: showCalendar ? '#2563eb' : '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <i className={`fa-solid ${showCalendar ? 'fa-table-list' : 'fa-calendar-alt'}`} />
            <span>{showCalendar ? 'Table View' : 'Calendar View'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => dispatch('refresh')}
            title="Refresh List"
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <i className="fa-solid fa-rotate-right" />
          </button>

          {/* + New Appointment Button */}
          <button
            type="button"
            onClick={() => dispatch('addNew')}
            title="Create New Appointment"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 38,
              padding: '0 18px',
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
              transition: 'background 0.15s ease',
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 12 }} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* 2. Enterprise Filter Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 18,
        }}
      >
        {/* Primary Filter Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            alignItems: 'flex-end',
          }}
        >
          {/* 1. Appointment Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}
            >
              Appointment Type
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={currentfilter.AppointmentTypeId ?? ''}
                disabled={!!currentcontext.candisableappttype}
                onChange={(e) => dispatch('filterChange', { field: 'AppointmentTypeId', value: e.target.value })}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 32px 0 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: currentcontext.candisableappttype ? '#f8fafc' : '#ffffff',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  appearance: 'none',
                  cursor: currentcontext.candisableappttype ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="-1">All Types</option>
                {(lookup.AppointmentType || []).map((t) => (
                  <option key={t.Id} value={t.Id}>
                    {t.Text}
                  </option>
                ))}
              </select>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* 2. Appointment Date with Quick Jump */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}
            >
              Appointment Date
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                onClick={() => handleDateOffset(-1)}
                title="Previous Day"
                style={{
                  width: 32,
                  height: 38,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              <input
                type="date"
                value={isoDateVal}
                onChange={(e) => dispatch('dateChange', { value: e.target.value })}
                style={{
                  flex: 1,
                  height: 38,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  minWidth: 120,
                }}
              />

              <button
                type="button"
                onClick={() => handleDateOffset(1)}
                title="Next Day"
                style={{
                  width: 32,
                  height: 38,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>

              <button
                type="button"
                onClick={handleTodayClick}
                title="Jump to Today"
                style={{
                  height: 38,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
            </div>
          </div>

          {/* 3. Doctor */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}
            >
              Doctor
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={currentfilter.DoctorId ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'DoctorId', value: e.target.value })}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 32px 0 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">All Doctors</option>
                {(lookup.Doctor || []).map((d) => (
                  <option key={d.Id} value={String(d.Id)}>
                    {d.Text}
                  </option>
                ))}
              </select>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* 4. Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}
            >
              Status
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={currentfilter.AppointmentStatusId ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'AppointmentStatusId', value: e.target.value })}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 32px 0 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="-1">All Statuses</option>
                {(lookup.AppointmentStatus || []).map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Text}
                  </option>
                ))}
              </select>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Row: Quick Search, Status Pills & Clear */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Quick Search */}
          <div style={{ position: 'relative', width: 300, minWidth: 220 }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 13,
              }}
            />
            <input
              type="text"
              placeholder="Filter by Patient Name, MRN, Doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 32px 0 34px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Quick Status Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All', count: statusCounts.all },
              { id: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled },
              { id: 'checkedin', label: 'Checked In', count: statusCounts.checkedin },
              { id: 'completed', label: 'Completed', count: statusCounts.completed },
              { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map((pill) => {
              const active = selectedQuickStatus === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedQuickStatus(pill.id)}
                  style={{
                    height: 28,
                    padding: '0 10px',
                    borderRadius: 14,
                    border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                    background: active ? '#eff6ff' : '#ffffff',
                    color: active ? '#2563eb' : '#64748b',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{pill.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '0 6px',
                      borderRadius: 10,
                      background: active ? '#2563eb' : '#f1f5f9',
                      color: active ? '#ffffff' : '#64748b',
                      fontWeight: 700,
                    }}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedQuickStatus('all');
              dispatch('resetFilters');
            }}
            title="Reset Filters"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
            }}
          >
            <i className="fa-solid fa-arrow-rotate-left" style={{ fontSize: 11 }} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Main Data Content (Table view when !showCalendar) */}
      {!showCalendar && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: '#2563eb' }} />
              <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>Loading appointments...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            /* Enterprise Empty State */
            <div
              style={{
                padding: '64px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: 30,
                  marginBottom: 16,
                }}
              >
                <i className="fa-regular fa-calendar-xmark" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                No Appointments Found
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 420, margin: '0 0 20px 0', lineHeight: 1.5 }}>
                {searchTerm || selectedQuickStatus !== 'all'
                  ? 'No appointments matched your search or status filter. Try clearing the filters.'
                  : `There are no appointments scheduled for ${formatDateDisplay(currentfilter.appointmentdate)}. Create a new appointment to get started.`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => dispatch('addNew')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 38,
                    padding: '0 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
                  <span>Book Appointment</span>
                </button>
                {(searchTerm || selectedQuickStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedQuickStatus('all');
                      dispatch('resetFilters');
                    }}
                    style={{
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Enterprise Data Table */
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Date & Time
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Patient Details
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Swostha ID
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Schedule Slot
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Doctor
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Reason
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payment Mode
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Consult Type
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Amount
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((entity, idx) => {
                    const patient = entity.Patient || {};
                    const doctor = entity.User || {};
                    const badge = getStatusBadgeStyle(entity.AppointmentStatus?.Description, entity.AppointmentStatus?.ColorCode);
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={entity.Id || idx}
                        style={{
                          background: isEven ? '#ffffff' : '#fafafa',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.1s ease',
                        }}
                      >
                        {/* Date & Time */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {formatDateDisplay(entity.AppointmentDate)}
                          </div>
                          {entity.StartTime && (
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              <i className="fa-regular fa-clock" style={{ fontSize: 10, marginRight: 4 }} />
                              {entity.StartTime}
                            </div>
                          )}
                        </td>

                        {/* Patient Name */}
                        <td style={{ padding: '14px 16px' }}>
                          <div
                            onClick={() => dispatch('patientInfo', entity)}
                            style={{
                              fontWeight: 600,
                              color: '#2563eb',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                            title="Click to view patient profile"
                          >
                            <span>
                              {patient.Title?.Description ? `${patient.Title.Description} ` : ''}
                              {patient.FirstName || ''} {patient.LastName || ''}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {patient.Age ? `${patient.Age} yrs` : ''}
                            {patient.Age && patient.Gender?.Description ? ' • ' : ''}
                            {patient.Gender?.Description || ''}
                          </div>
                        </td>

                        {/* Swostha ID / MRN */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              fontSize: 12,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {patient.MRN || '-'}
                          </span>
                        </td>

                        {/* Schedule Slot */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          {entity.StartTime || entity.EndTime ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: 12,
                                fontWeight: 500,
                                color: '#334155',
                              }}
                            >
                              <span>{entity.StartTime || '-'}</span>
                              <span style={{ color: '#94a3b8' }}>–</span>
                              <span>{entity.EndTime || '-'}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>

                        {/* Doctor */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {doctor.Title?.Description ? `${doctor.Title.Description} ` : ''}
                            {doctor.FirstName || ''} {doctor.LastName || ''}
                          </div>
                        </td>

                        {/* Reason */}
                        <td style={{ padding: '14px 16px', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entity.Remarks || '-'}
                        </td>

                        {/* Payment Mode */}
                        <td style={{ padding: '14px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {entity.PaymentMode?.Description || '-'}
                        </td>

                        {/* Consult Type */}
                        <td style={{ padding: '14px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {entity.VirtualOrder?.OrderConsultType?.Description || '-'}
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {entity.VirtualOrder?.OrderTotal != null && entity.VirtualOrder?.OrderTotal !== ''
                            ? `₹${entity.VirtualOrder.OrderTotal}`
                            : '-'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 10px',
                              borderRadius: 12,
                              background: badge.bg,
                              color: badge.color,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: badge.dot,
                              }}
                            />
                            <span>{entity.AppointmentStatus?.Description || 'Scheduled'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => dispatch('editAppointment', entity)}
                              title="Edit Appointment"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#2563eb',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square" />
                            </button>

                            {/* Patient Info */}
                            <button
                              type="button"
                              onClick={() => dispatch('patientInfo', entity)}
                              title="View Patient Info"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <i className="fa-solid fa-user" />
                            </button>

                            {/* Switch to EMR if patient exists */}
                            {entity.PatientId && (
                              <button
                                type="button"
                                onClick={() => dispatch('openEmr', entity)}
                                title="Open Patient EMR"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  border: '1px solid #e2e8f0',
                                  background: '#ffffff',
                                  color: '#059669',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <i className="fa-solid fa-stethoscope" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Toolbar */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Showing {filteredRows.length > 0 ? (pager.currentPage - 1) * pager.pageSize + 1 : 0} to{' '}
              {Math.min(pager.currentPage * pager.pageSize, pager.totalItems || filteredRows.length)} of{' '}
              {pager.totalItems || filteredRows.length} items
            </div>

            {/* Pagination Controls */}
            {pager.totalItems > pager.pageSize && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  disabled={pager.currentPage <= 1}
                  onClick={() => dispatch('pageChange', { page: pager.currentPage - 1 })}
                  style={{
                    height: 32,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: pager.currentPage <= 1 ? '#94a3b8' : '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: pager.currentPage <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 10, marginRight: 4 }} />
                  Prev
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', padding: '0 8px' }}>
                  Page {pager.currentPage} of {Math.max(1, Math.ceil(pager.totalItems / pager.pageSize))}
                </span>
                <button
                  type="button"
                  disabled={pager.currentPage >= Math.ceil(pager.totalItems / pager.pageSize)}
                  onClick={() => dispatch('pageChange', { page: pager.currentPage + 1 })}
                  style={{
                    height: 32,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: pager.currentPage >= Math.ceil(pager.totalItems / pager.pageSize) ? '#94a3b8' : '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      pager.currentPage >= Math.ceil(pager.totalItems / pager.pageSize) ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, marginLeft: 4 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
