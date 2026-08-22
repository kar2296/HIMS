import React from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';

// ─────────────────────────────────────────────────────────────
// Types — unchanged from original
// ─────────────────────────────────────────────────────────────
interface DoctorDashboardProps {
  reactProps?: {
    items?: {
      checkedincount?: number;
      inpatientcount?: number;
      appoinmentCount?: number;
      otschedulecount?: number;
      directbilling?: number;
      dischargedcount?: number;
      TodayCount?: number;
      PendingCount?: number;
      CompletedCount?: number;
      CancelledCount?: number;
    };
    permissions?: {
      OP_Patients?: boolean;
      IP_Patients?: boolean;
      Appointments?: boolean;
      SurgerySchedule?: boolean;
      Reports?: boolean;
    };
  };
  onNavigate?: (stateName: string, params?: any) => void;
}

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

export const DoctorDashboardTopSection: React.FC<DoctorDashboardProps> = ({ reactProps, onNavigate }) => {
  const items = reactProps?.items || {};
  const permissions = reactProps?.permissions || {};

  const handleCardClick = (state: string, params?: any) => {
    if (onNavigate) onNavigate(state, params);
  };

  const metricCards = [
    { title: 'OP Patients', count: items.checkedincount || 0, icon: 'fa-user-injured', color: '#2563eb', show: permissions.OP_Patients !== false, action: () => handleCardClick('app.oppatienttab.mycheckin') },
    { title: 'IP Patients', count: items.inpatientcount || 0, icon: 'fa-procedures', color: '#10b981', show: permissions.IP_Patients !== false, action: () => handleCardClick('app.inpatienttab.myinpatient') },
    { title: 'Appointments', count: items.appoinmentCount || 0, icon: 'fa-calendar-check', color: '#f59e0b', show: permissions.Appointments !== false, action: () => handleCardClick('app.appointmentstab.viewappoitment', { iShowCalendar: 1 }) },
    { title: 'Surgery Schedule', count: items.otschedulecount || 0, icon: 'fa-calendar-days', color: '#0ea5e9', show: permissions.SurgerySchedule !== false, action: () => handleCardClick('app.surgerydoctorchedules') },
    { title: 'Direct Billing', count: items.directbilling || 0, icon: 'fa-file-invoice', color: '#a855f7', show: permissions.Reports !== false, action: () => handleCardClick('app.doctorreport') },
    { title: 'Discharged', count: items.dischargedcount || 0, icon: 'fa-person-walking-arrow-right', color: '#f43f5e', show: true, action: () => handleCardClick('app.docdischargedpatient') },
  ].filter((c) => c.show !== false);

  const actionCards = [
    { title: 'Task Assignment', icon: 'fa-list-check', color: '#64748b', action: () => handleCardClick('app.taskmanagementlist') },
  ];

  // Appointment status chart
  const statusData = [
    { label: 'Today', value: items.TodayCount || 0, fill: '#2563eb' },
    { label: 'Pending', value: items.PendingCount || 0, fill: '#f59e0b' },
    { label: 'Completed', value: items.CompletedCount || 0, fill: '#10b981' },
    { label: 'Cancelled', value: items.CancelledCount || 0, fill: '#ef4444' },
  ];

  return (
    <DashboardPageWrapper
      title="Doctor Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* ── KPI metrics ── */}
      <DashboardSection title="My Patients Today">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: spacing.lg }}>
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


