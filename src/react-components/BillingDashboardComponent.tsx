import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';

// ─────────────────────────────────────────────────────────────
// Types (unchanged from original)
// ─────────────────────────────────────────────────────────────
interface BillingPermissions {
  OPBilling?: boolean;
  IPBilling?: boolean;
  Packages?: boolean;
  DirectBilling?: boolean;
  LabBilling?: boolean;
  Refunds?: boolean;
  Receipts?: boolean;
  Reports?: boolean;
  BillingMasters?: boolean;
  Advance?: boolean;
  CancelledBill?: boolean;
  CreditBill?: boolean;
  Insurance?: boolean;
  StaffCredit?: boolean;
}

interface BillingItems {
  TodayOPBillCount?: number;
  TodayIPBillCount?: number;
  TodayRefundCount?: number;
  TodayReceiptCount?: number;
  TodayAdvanceCount?: number;
  TodayDirectBillCount?: number;
  TodayLabBillCount?: number;
  TodayCancelledBillCount?: number;
  TodayCreditBillCount?: number;
  TodayInsuranceBillCount?: number;
  TodayOPBillAmount?: number;
  TodayIPBillAmount?: number;
  TodayReceiptAmount?: number;
  TodayRefundAmount?: number;
}

export interface BillingDashboardProps {
  reactProps?: {
    items?: BillingItems;
    permissions?: BillingPermissions;
  };
  onNavigate?: (stateName: string, params?: any) => void;
}

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
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
        </div>
      ))}
    </div>
  );
};

const fmt = (v?: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export const BillingDashboardComponent: React.FC<BillingDashboardProps> = ({ reactProps, onNavigate }) => {
  const items: BillingItems = reactProps?.items || {};
  const permissions: BillingPermissions = reactProps?.permissions || {};

  const handleCardClick = (state: string, params?: any) => {
    if (onNavigate) onNavigate(state, params);
  };

  // ── KPI metrics ──
  const metricCards = [
    { title: 'OP Bills Today', count: items.TodayOPBillCount || 0, icon: 'fa-file-invoice', color: '#2563eb', show: permissions.OPBilling, action: () => handleCardClick('app.opbilling-list', { tp: 'OP', context: 'billing' }) },
    { title: 'IP Bills Today', count: items.TodayIPBillCount || 0, icon: 'fa-hospital', color: '#0ea5e9', show: permissions.IPBilling, action: () => handleCardClick('app.ipbillinglist', { context: 'billing' }) },
    { title: 'Lab Bills Today', count: items.TodayLabBillCount || 0, icon: 'fa-flask', color: '#8b5cf6', show: permissions.LabBilling, action: () => handleCardClick('app.opbilling-list', { tp: 'DG', context: 'billing' }) },
    { title: 'Direct Bills', count: items.TodayDirectBillCount || 0, icon: 'fa-money-bill-wave', color: '#10b981', show: permissions.DirectBilling, action: () => handleCardClick('app.directbilling', { context: 'billing' }) },
    { title: 'Receipts Today', count: items.TodayReceiptCount || 0, icon: 'fa-receipt', color: '#f59e0b', show: permissions.Receipts, action: () => handleCardClick('app.billing-receipts', { context: 'billing' }) },
    { title: 'Advances Today', count: items.TodayAdvanceCount || 0, icon: 'fa-hand-holding-dollar', color: '#06b6d4', show: permissions.Advance, action: () => handleCardClick('app.advancebilling', { context: 'billing' }) },
    { title: 'Refunds Today', count: items.TodayRefundCount || 0, icon: 'fa-rotate-left', color: '#f97316', show: permissions.Refunds, action: () => handleCardClick('app.refundbillinglist', { context: 'billing' }) },
    { title: 'Credit Bills', count: items.TodayCreditBillCount || 0, icon: 'fa-credit-card', color: '#64748b', show: permissions.CreditBill, action: () => handleCardClick('app.creditbilllist', { context: 'billing' }) },
  ].filter((c) => c.show !== false);

  // Revenue distribution pie
  const revenueData = [
    { name: 'OP Revenue', value: items.TodayOPBillAmount || 0 },
    { name: 'IP Revenue', value: items.TodayIPBillAmount || 0 },
    { name: 'Receipts', value: items.TodayReceiptAmount || 0 },
    { name: 'Refunds', value: items.TodayRefundAmount || 0 },
  ].filter((d) => d.value > 0);

  const revenueColors = ['#2563eb', '#0ea5e9', '#10b981', '#f97316'];

  // Weekly revenue trend
  const weekData = [
    { day: 'Mon', op: 0, ip: 0 },
    { day: 'Tue', op: 0, ip: 0 },
    { day: 'Wed', op: 0, ip: 0 },
    { day: 'Thu', op: 0, ip: 0 },
    { day: 'Fri', op: 0, ip: 0 },
    { day: 'Sat', op: 0, ip: 0 },
    { day: 'Today', op: items.TodayOPBillAmount || 0, ip: items.TodayIPBillAmount || 0 },
  ];

  // Quick nav
  const actionCards = [
    { title: 'Insurance Bills', icon: 'fa-shield-halved', color: '#6366f1', show: permissions.Insurance, action: () => handleCardClick('app.insurancebillinglist', { context: 'billing' }) },
    { title: 'Cancelled Bills', icon: 'fa-ban', color: '#ef4444', show: permissions.CancelledBill, action: () => handleCardClick('app.cancelledbilllist', { context: 'billing' }) },
    { title: 'Staff Credit', icon: 'fa-user-tie', color: '#14b8a6', show: permissions.StaffCredit, action: () => handleCardClick('app.staffcreditbilllist') },
    { title: 'Billing Reports', icon: 'fa-chart-column', color: '#84cc16', show: permissions.Reports, action: () => handleCardClick('app.billingreportstab.billingcollectionreport', { context: 'billing' }) },
    { title: 'Billing Masters', icon: 'fa-list-check', color: '#a78bfa', show: permissions.BillingMasters, action: () => handleCardClick('app.billingmasters', { context: 'billing' }) },
    { title: 'Packages', icon: 'fa-box-open', color: '#fb923c', show: permissions.Packages, action: () => handleCardClick('app.billingpackages', { context: 'billing' }) },
  ].filter((c) => c.show !== false);

  return (
    <DashboardPageWrapper
      title="Billing Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* ── Revenue Summary ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: spacing.lg,
        marginBottom: spacing.xxl,
      }}>
        {[
          { label: 'OP Revenue', value: fmt(items.TodayOPBillAmount), color: '#2563eb', icon: 'fa-arrow-up-right-dots' },
          { label: 'IP Revenue', value: fmt(items.TodayIPBillAmount), color: '#0ea5e9', icon: 'fa-chart-line' },
          { label: 'Total Receipts', value: fmt(items.TodayReceiptAmount), color: '#10b981', icon: 'fa-sack-dollar' },
        ].map((item, i) => (
          <div key={i} style={{
            background: colors.surface, borderRadius: radii.lg, padding: '20px',
            border: `1px solid ${colors.border}`, boxShadow: shadows.card,
            borderLeft: `4px solid ${item.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: radii.md,
                background: `${item.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: item.color, fontSize: '16px',
              }}>
                <i className={`fa-solid ${item.icon}`} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, fontFamily: typography.fontFamily, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.label}
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: colors.textMain, fontFamily: typography.fontFamily, letterSpacing: '-0.5px' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bill count KPIs ── */}
      <DashboardSection title="Today's Billing Activity">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing.md }}>
          {metricCards.map((card, i) => (
            <StatCard key={i} title={card.title} count={card.count} icon={card.icon} color={card.color} onClick={card.action} />
          ))}
        </div>
      </DashboardSection>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: spacing.xl, marginBottom: spacing.xxl }}>
        <Card>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>
            Revenue Trend (This Week)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>OP vs IP billing amounts</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: colors.textMuted, fontFamily: typography.fontFamily }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="op" name="OP Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ip" name="IP Revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: colors.textMain, fontFamily: typography.fontFamily }}>
            Revenue Split
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>Today's distribution</p>
          {revenueData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={revenueData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {revenueData.map((_, i) => <Cell key={i} fill={revenueColors[i % revenueColors.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {revenueData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: revenueColors[i % revenueColors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: colors.textMuted, flex: 1, fontFamily: typography.fontFamily }}>{d.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMain, fontFamily: typography.fontFamily }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSubtle, fontSize: '13px', fontFamily: typography.fontFamily }}>
              No billing data today
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick Navigation ── */}
      {actionCards.length > 0 && (
        <DashboardSection title="Quick Navigation">
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
