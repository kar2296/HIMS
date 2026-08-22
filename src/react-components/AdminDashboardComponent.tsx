import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  reactProps?: {
    facilityInfo?: any;
    totals?: any;
    wards?: any[];
    wardtotal?: any;
  };
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '10px 14px', boxShadow: shadows.lg, fontFamily: typography.fontFamily, fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: colors.textMain, marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
        </div>
      ))}
    </div>
  );
};

const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export const AdminDashboardComponent: React.FC<AdminDashboardProps> = ({ reactProps = {} }) => {
  const { facilityInfo = {}, totals = {}, wards = [], wardtotal = {} } = reactProps;
  const encounter = facilityInfo.encounter || {};
  const appointment = facilityInfo.appointment || {};
  const patient = facilityInfo.patient || {};
  const newborn = facilityInfo.newborn || {};
  const receipt = facilityInfo.receipt || [];
  const category = facilityInfo.category || [];

  // ── KPI cards ──
  const kpis = [
    { title: 'New Patients', count: encounter.opNewVisitCount || 0, icon: 'fa-user-plus', color: '#10b981' },
    { title: 'Follow-Up', count: encounter.opFollowUpVisitCount || 0, icon: 'fa-user-check', color: '#0ea5e9' },
    { title: 'Appointments', count: appointment.AppointmentCount || 0, icon: 'fa-calendar-check', color: '#2563eb' },
    { title: 'Admissions', count: encounter.AdmissionCount || 0, icon: 'fa-hospital-user', color: '#f59e0b' },
    { title: 'Discharges', count: encounter.DischargeCount || 0, icon: 'fa-person-walking-arrow-right', color: '#6366f1' },
    { title: 'Newborns', count: newborn.NewBornCount || 0, icon: 'fa-baby', color: '#ec4899' },
    { title: 'Deceased', count: patient.DeseasedCount || 0, icon: 'fa-ribbon', color: '#64748b' },
  ];

  // ── Revenue chart ──
  const revenueData = receipt.map((item: any) => ({
    name: item.Key,
    cash: item.Value?.CashAmount || 0,
    card: item.Value?.CardAmount || 0,
    other: item.Value?.OtherAmount || 0,
  }));

  // ── Revenue by category pie ──
  const catData = category.slice(0, 6).filter((c: any) => c.Key !== 'Total').map((item: any, i: number) => ({
    name: item.Key,
    value: (item.Value?.OP || 0) + (item.Value?.IP || 0),
    color: colors.chart[i % colors.chart.length],
  }));

  // ── Bed occupancy table columns ──
  const wardCols: DataTableColumn<any>[] = [
    { key: 'ward', header: 'Ward', field: 'WardName', sortable: true },
    { key: 'avail', header: 'Available', field: 'AvailableBeds', align: 'center' },
    { key: 'occ', header: 'Occupied', field: 'OccupiedBeds', align: 'center' },
    { key: 'other', header: 'Other', field: 'OtherBeds', align: 'center' },
    { key: 'total', header: 'Total', field: 'BedsCount', align: 'center' },
  ];

  const occupancyPct = wardtotal.BedsCount > 0
    ? Math.round((wardtotal.OccupiedBeds / wardtotal.BedsCount) * 100)
    : 0;

  return (
    <DashboardPageWrapper
      title="Admin Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* ── KPI metrics ── */}
      <DashboardSection title="Hospital Activity">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing.lg }}>
          {kpis.map((k, i) => <StatCard key={i} title={k.title} count={k.count} icon={k.icon} color={k.color} />)}
        </div>
      </DashboardSection>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: spacing.xl, marginBottom: spacing.xxl }}>
        {/* Collection bar chart */}
        <Card>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>Collection Summary</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>Cash / Card / Others by department</p>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueData} barGap={3} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cash" name="Cash" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="card" name="Card" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="other" name="Others" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSubtle, fontSize: '13px', fontFamily: typography.fontFamily }}>
              No collection data today
            </div>
          )}
        </Card>

        {/* Revenue by category pie */}
        <Card>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>Revenue by Category</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>OP + IP combined</p>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value">
                    {catData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                {catData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', color: colors.textMuted, flex: 1, fontFamily: typography.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textMain, fontFamily: typography.fontFamily, flexShrink: 0 }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSubtle, fontSize: '13px' }}>No data</div>
          )}
        </Card>
      </div>

      {/* ── Bed Occupancy ── */}
      <DashboardSection
        title="Bed Occupancy"
        subtitle={`${wardtotal.OccupiedBeds || 0} / ${wardtotal.BedsCount || 0} beds occupied (${occupancyPct}%)`}
      >
        {/* Occupancy progress bar */}
        <div style={{ marginBottom: spacing.lg, background: colors.surfaceSunken, borderRadius: radii.full, height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${occupancyPct}%`, background: occupancyPct > 80 ? colors.danger : occupancyPct > 60 ? colors.warning : colors.success, borderRadius: radii.full, transition: 'width 0.6s ease' }} />
        </div>

        <DataTable<any>
          columns={wardCols}
          rows={wardRows}
          rowKey={(row: any) => row.WardName || JSON.stringify(row)}
          emptyText="No ward data available"
          emptyIcon="fa-bed"
          clientSort={true}
        />
      </DashboardSection>

    </DashboardPageWrapper>
  );
};
