import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';

// ─────────────────────────────────────────────────────────────
// Types (unchanged from original)
// ─────────────────────────────────────────────────────────────
interface DashboardItems {
  TodayCheckInCount?: string | number;
  TodayScheduledCount?: string | number;
  DirectBillingCount?: string | number;
  AdmittedCount?: string | number;
  PendingdischargeCount?: string | number;
  TotalOccupancyCount?: string | number;
  PresentOccupancyCount?: string | number;
  todayDischarge?: string | number;
}

interface DashboardPermissions {
  Registration?: boolean;
  Appointments?: boolean;
  OPbilling?: boolean;
  DirectBilling?: boolean;
  LabBilling?: boolean;
  Admissions?: boolean;
  BedTransfer?: boolean;
  CurrentIpPatients?: boolean;
  FrontOfficeReports?: boolean;
}

export interface FrontOfficeDashboardProps {
  reactProps?: {
    items?: DashboardItems;
    permissions?: DashboardPermissions;
    facilityInfo?: any;
  };
  onNavigate?: (stateName: string, params?: any) => void;
}

// ─────────────────────────────────────────────────────────────
// Chart tooltip
// ─────────────────────────────────────────────────────────────
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: radii.md, padding: '10px 14px', boxShadow: shadows.lg,
      fontFamily: typography.fontFamily, fontSize: '12px',
    }}>
      <div style={{ fontWeight: 700, color: colors.textMain, marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const FrontOfficeDashboardComponent: React.FC<FrontOfficeDashboardProps> = ({
  reactProps,
  onNavigate,
}) => {
  const items: DashboardItems = reactProps?.items || {};
  const permissions: DashboardPermissions = reactProps?.permissions || {};
  const [showRegCumVisitWithBill, setShowRegCumVisitWithBill] = useState(false);

  const handleCardClick = (stateName: string, params?: any) => {
    if (onNavigate) onNavigate(stateName, params);
  };

  // ── Metric cards definition ──
  const metricCards = [
    {
      title: 'Registrations',
      count: items.TodayCheckInCount || 0,
      icon: 'fa-registered',
      color: '#2563eb',
      show: permissions.Registration,
      action: () => setShowRegCumVisitWithBill(true),
    },
    {
      title: 'Appointments',
      count: items.TodayScheduledCount || 0,
      icon: 'fa-calendar-check',
      color: '#0ea5e9',
      show: permissions.Appointments,
      action: () => handleCardClick('app.appointmentstab.details'),
    },
    {
      title: 'IP Admissions',
      count: items.AdmittedCount || 0,
      icon: 'fa-hospital-user',
      color: '#f43f5e',
      show: permissions.Admissions,
      action: () => handleCardClick('app.admissions', { context: 'frontoffice' }),
    },
    {
      title: 'IP Patients',
      count: items.TotalOccupancyCount || 0,
      icon: 'fa-procedures',
      color: '#ec4899',
      show: permissions.CurrentIpPatients,
      action: () => handleCardClick('app.currentinpatients', { context: 'frontoffice' }),
    },
    {
      title: 'Bed Transfers',
      count: items.PendingdischargeCount || 0,
      icon: 'fa-bed-pulse',
      color: '#6366f1',
      show: permissions.BedTransfer,
      action: () => handleCardClick('app.bedtransfer-list', { context: 'frontoffice' }),
    },
    {
      title: 'Today Discharges',
      count: items.todayDischarge || 0,
      icon: 'fa-person-walking-arrow-right',
      color: '#10b981',
      show: true,
      action: () => handleCardClick('app.docdischargedpatient'),
    },
  ].filter((c) => c.show !== false);

  // ── Action cards (quick navigation) ──
  const actionCards = [
    {
      title: 'OP Billings',
      icon: 'fa-file-invoice',
      color: '#f59e0b',
      show: permissions.OPbilling,
      action: () => handleCardClick('app.opbilling-list', { tp: 'OP', context: 'frontoffice' }),
    },
    {
      title: 'Direct Billing',
      icon: 'fa-money-bill-wave',
      color: '#10b981',
      show: permissions.DirectBilling,
      action: () => handleCardClick('app.directbilling', { tp: 'DG', context: 'frontoffice' }),
    },
    {
      title: 'Lab Billing',
      icon: 'fa-flask',
      color: '#a855f7',
      show: permissions.LabBilling,
      action: () => handleCardClick('app.opbilling-list', { tp: 'DG', context: 'frontoffice' }),
    },
    {
      title: 'Reports',
      icon: 'fa-chart-bar',
      color: '#64748b',
      show: permissions.FrontOfficeReports,
      action: () => handleCardClick('app.ipopreportstab.inpatientreport', { context: 'frontoffice' }),
    },
  ].filter((c) => c.show !== false);

  // ── Mock weekly trend data for chart (real counts would be piped as props) ──
  const weeklyData = [
    { day: 'Mon', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Tue', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Wed', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Thu', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Fri', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Sat', registrations: 0, appointments: 0, admissions: 0 },
    { day: 'Today', registrations: Number(items.TodayCheckInCount || 0), appointments: Number(items.TodayScheduledCount || 0), admissions: Number(items.AdmittedCount || 0) },
  ];

  // Occupancy donut
  const occupied = Number(items.PresentOccupancyCount || 0);
  const total = Number(items.TotalOccupancyCount || 1);
  const available = Math.max(0, total - occupied);
  const occupancyData = [
    { name: 'Occupied', value: occupied },
    { name: 'Available', value: available },
  ];

  return (
    <DashboardPageWrapper
      title="Front Office Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* RegCumVisit trigger handled as before */}
      {showRegCumVisitWithBill && (
        <div style={{ display: 'none' }} data-trigger="showRegCumVisitWithBill" />
      )}

      {/* ── KPI Metrics ── */}
      <DashboardSection title="Today's Activity" subtitle="Real-time patient flow metrics">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: spacing.lg,
        }}>
          {metricCards.map((card, i) => (
            <StatCard
              key={i}
              title={card.title}
              count={card.count}
              icon={card.icon}
              color={card.color}
              onClick={card.action}
            />
          ))}
        </div>
      </DashboardSection>

      {/* ── Charts ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: spacing.xl,
        marginBottom: spacing.xxl,
      }}>
        {/* Weekly trend bar chart */}
        <Card>
          <div style={{ marginBottom: spacing.lg }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>
              Weekly Activity Trend
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>
              Registrations, appointments & admissions
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} allowDecimals={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: typography.fontFamily, paddingTop: '8px' }} />
              <Bar dataKey="registrations" name="Registrations" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" name="Appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="admissions" name="Admissions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Occupancy donut */}
        <Card>
          <div style={{ marginBottom: spacing.md }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>
              Bed Occupancy
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>
              Current IP bed utilization
            </p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                <Cell fill="#ec4899" />
                <Cell fill="#d1d5db" />
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Summary */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.sm }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899', fontFamily: typography.fontFamily }}>{occupied}</div>
              <div style={{ fontSize: '11px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>Occupied</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.success, fontFamily: typography.fontFamily }}>{available}</div>
              <div style={{ fontSize: '11px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>Available</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Quick Navigation ── */}
      <DashboardSection title="Quick Navigation" subtitle="Common workflows">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: spacing.md,
        }}>
          {actionCards.map((card, i) => (
            <ActionCard
              key={i}
              title={card.title}
              icon={card.icon}
              color={card.color}
              onClick={card.action}
            />
          ))}
        </div>
      </DashboardSection>
    </DashboardPageWrapper>
  );
};
