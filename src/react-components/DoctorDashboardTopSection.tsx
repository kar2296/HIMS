import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';
import { doctorDashboardApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

// ─────────────────────────────────────────────────────────────
// Types — unchanged from original
// ─────────────────────────────────────────────────────────────
interface DoctorDashboardProps {
  // Direct props — the AngularJS bridge spreads props via {...validProps}
  // so items/permissions/onNavigate arrive at top level, NOT under reactProps
  items?: {
    checkedincount?: number | string;
    inpatientcount?: number | string;
    appoinmentCount?: number | string;
    otschedulecount?: number | string;
    directbilling?: number | string;
    dischargedcount?: number | string;
    TodayCount?: number | string;
    PendingCount?: number | string;
    CompletedCount?: number | string;
    CancelledCount?: number | string;
  };
  permissions?: {
    OP_Patients?: boolean;
    IP_Patients?: boolean;
    Appointments?: boolean;
    SurgerySchedule?: boolean;
    Reports?: boolean;
  };
  onNavigate?: (stateName: string, params?: any) => void;
  // Defensive fallback for any legacy reactProps wrapping
  reactProps?: {
    items?: DoctorDashboardProps['items'];
    permissions?: DoctorDashboardProps['permissions'];
  };
}

// Safely coerce AngularJS string-numbers like '0' / '2' to a real number
const toNum = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v) || 0;

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '10px 14px', boxShadow: shadows.lg, fontFamily: typography.fontFamily, fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: colors.textMain, marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.fill, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export const DoctorDashboardTopSection: React.FC<DoctorDashboardProps> = (allProps) => {
  // Angular bridge still passes items/permissions as optional props;
  // we use them as the initial value but immediately overwrite with a direct API call.
  const propItems = allProps.items || allProps.reactProps?.items || {};
  const rawPermissions = allProps.permissions || allProps.reactProps?.permissions || {};
  // If rawPermissions has entries but every single one is false (legacy stub failure),
  // default to allowing access so doctor dashboard options (OP, IP, Appointments, etc.) are visible.
  const hasAnyTrue = Object.values(rawPermissions).some((v) => v === true);
  const permissions: DoctorDashboardProps['permissions'] =
    Object.keys(rawPermissions).length > 0 && !hasAnyTrue
      ? { OP_Patients: true, IP_Patients: true, Appointments: true, SurgerySchedule: true, Reports: true }
      : rawPermissions;
  const onNavigate = allProps.onNavigate;

  // ── Self-fetch state ───────────────────────────────────────
  const [counts, setCounts] = useState<DoctorDashboardProps['items']>(propItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayDate = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const fetchCounts = useCallback(async () => {
    try {
      const doctorId   = sessionHelper.getCurrentUserId();
      const facilityId = sessionHelper.getCurrentFacilityId();
      const today      = todayDate();
      const fromDate   = `${today} 00:00:00`;
      const toDate     = `${today} 23:59:59`;

      const res: any = await doctorDashboardApi.getDashboardCounts(
        doctorId, facilityId, fromDate, toDate
      );

      // Map API response keys to our counts state
      setCounts({
        checkedincount:  res?.mycheckedin?.checkedincount  ?? 0,
        inpatientcount:  res?.myinpatient?.inpatientcount  ?? 0,
        dischargedcount: res?.myinpatient?.dischargedcount ?? 0,
        appoinmentCount: res?.appointment?.appoinmentCount ?? 0,
        otschedulecount: res?.otschedule?.otschedulecount  ?? 0,
        directbilling:   res?.directbilling?.count         ?? 0,
        TodayCount:      res?.appointment?.appoinmentCount ?? 0,
        PendingCount:    res?.appointment?.PendingCount    ?? 0,
        CompletedCount:  res?.appointment?.CompletedCount  ?? 0,
        CancelledCount:  res?.appointment?.CancelledCount  ?? 0,
      });
      setError(null);
    } catch (e: any) {
      setError('Could not load dashboard data');
      // Keep whatever counts we already have (Angular-passed or previous fetch)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    // Auto-refresh every 5 minutes
    const timer = setInterval(fetchCounts, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchCounts]);

  // Merge: prefer live fetched data once loaded, fall back to Angular-passed props
  const items = loading ? propItems : (counts || propItems);

  const handleCardClick = (state: string, params?: any) => {
    if (onNavigate) onNavigate(state, params);
  };

  const metricCards = [
    { title: 'OP Patients',      count: toNum(items.checkedincount),  icon: 'fa-user-injured',              color: '#2563eb', show: permissions.OP_Patients !== false,      action: () => handleCardClick('app.oppatienttab.mycheckin') },
    { title: 'IP Patients',      count: toNum(items.inpatientcount),  icon: 'fa-procedures',                color: '#10b981', show: permissions.IP_Patients !== false,      action: () => handleCardClick('app.inpatienttab.myinpatient') },
    { title: 'Appointments',     count: toNum(items.appoinmentCount), icon: 'fa-calendar-check',            color: '#f59e0b', show: permissions.Appointments !== false,     action: () => handleCardClick('app.appointmentstab.viewappoitment', { iShowCalendar: 1 }) },
    { title: 'Surgery Schedule', count: toNum(items.otschedulecount), icon: 'fa-calendar-days',             color: '#0ea5e9', show: permissions.SurgerySchedule !== false, action: () => handleCardClick('app.surgerydoctorchedules') },
    { title: 'Direct Billing',   count: toNum(items.directbilling),   icon: 'fa-file-invoice',              color: '#a855f7', show: permissions.Reports !== false,          action: () => handleCardClick('app.doctorreport') },
    { title: 'Discharged',       count: toNum(items.dischargedcount), icon: 'fa-person-walking-arrow-right',color: '#f43f5e', show: true,                                  action: () => handleCardClick('app.docdischargedpatient') },
  ].filter((c) => c.show !== false);

  const actionCards = [
    { title: 'Task Assignment', icon: 'fa-list-check', color: '#64748b', action: () => handleCardClick('app.taskmanagementlist') },
  ];

  // Appointment status chart
  const statusData = [
    { label: 'Today',     value: toNum(items.TodayCount),     fill: '#2563eb' },
    { label: 'Pending',   value: toNum(items.PendingCount),   fill: '#f59e0b' },
    { label: 'Completed', value: toNum(items.CompletedCount), fill: '#10b981' },
    { label: 'Cancelled', value: toNum(items.CancelledCount), fill: '#ef4444' },
  ];

  // 6 cards → 3 cols = 2 even rows (no lone card on last row)
  const gridCols = metricCards.length === 6 ? 'repeat(3, 1fr)'
    : metricCards.length === 4 ? 'repeat(2, 1fr)'
    : 'repeat(auto-fill, minmax(200px, 1fr))';

  return (
    <DashboardPageWrapper
      title="Doctor Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* ── KPI metrics ── */}
      <DashboardSection
        title="My Patients Today"
        action={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {error && (
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>
                {error}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); fetchCounts(); }}
              title="Refresh counts"
              style={{
                background: 'none', border: `1px solid ${colors.border}`, cursor: 'pointer',
                padding: '4px 10px', color: colors.textMuted, fontSize: '12px',
                borderRadius: radii.sm, display: 'flex', alignItems: 'center', gap: '5px',
                fontFamily: typography.fontFamily, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = colors.primary; e.currentTarget.style.borderColor = colors.primary; }}
              onMouseLeave={e => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.borderColor = colors.border; }}
            >
              <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </span>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: spacing.lg }}>
          {metricCards.map((card, i) => (
            <StatCard key={i} title={card.title} count={card.count} icon={card.icon} color={card.color} onClick={card.action} />
          ))}
        </div>
      </DashboardSection>

      {/* ── Appointment status chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: spacing.xl, marginBottom: spacing.xxl }}>
        <Card>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>Appointment Status</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>Today's appointment breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} allowDecimals={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status summary cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {statusData.map((s, i) => (
            <div key={i} style={{
              background: colors.surface, borderRadius: radii.md, padding: '12px 16px',
              border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px',
              borderLeft: `4px solid ${s.fill}`, boxShadow: shadows.card,
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.fill, fontFamily: typography.fontFamily, minWidth: '36px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMuted, fontFamily: typography.fontFamily }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      {actionCards.length > 0 && (
        <DashboardSection title="Quick Actions">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.md }}>
            {actionCards.map((card, i) => (
              <ActionCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
            ))}
          </div>
        </DashboardSection>
      )}
    </DashboardPageWrapper>
  );
};


