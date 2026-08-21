import React from 'react';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';

interface AdminDashboardProps {
  reactProps?: {
    facilityInfo?: any;
    totals?: any;
    wards?: any[];
    wardtotal?: any;
  };
}

// ---------------------------------------------------------------------------
// UI-MODERNIZATION RETROFIT: this screen's markup now renders through the
// global design-system components (PageHeader, Card, EmptyState, shared
// tokens) instead of hand-rolled inline styles / `premium-glass-panel` divs.
// NOTHING behavioral changed: same reactProps shape, same field paths off
// facilityInfo/totals/wards/wardtotal, same fallback-to-0/{} defaults, same
// formatCurrency formatting, same conditional wards.length > 0 branch.
//
// The three summary tables (Collection, Revenue By Category, Bed Occupancy)
// are kept as hand-styled <table> markup (only retokenized) rather than
// forced into DataTable: each renders a synthetic, differently-styled
// "Total" row sourced from a separate totals/wardtotal object (not from the
// mapped rows array), which DataTable's uniform rowKey/columns/rows contract
// can't express without fabricating a fake row shape -- exactly the "too
// bespoke to force in" case the retrofit guidance calls out. Only the
// EmptyState swap and Card wrapper were applied to these tables.
// ---------------------------------------------------------------------------
export const AdminDashboardComponent: React.FC<AdminDashboardProps> = ({
  reactProps = {}
}) => {
  const { facilityInfo = {}, totals = {}, wards = [], wardtotal = {} } = reactProps;

  const encounter = facilityInfo.encounter || {};
  const appointment = facilityInfo.appointment || {};
  const patient = facilityInfo.patient || {};
  const newborn = facilityInfo.newborn || {};
  const receipt = facilityInfo.receipt || [];
  const category = facilityInfo.category || [];

  const cards = [
    {
      title: 'New Patient',
      count: encounter.opNewVisitCount || 0,
      icon: 'fa-user',
      color: colors.success // success green
    },
    {
      title: 'Follow Up',
      count: encounter.opFollowUpVisitCount || 0,
      icon: 'fa-user',
      color: colors.info // info teal
    },
    {
      title: 'Appointments',
      count: appointment.AppointmentCount || 0,
      icon: 'fa-calendar-check',
      color: colors.danger // danger red
    },
    {
      title: 'Inactive',
      count: appointment.AppointmentCount || 0, // Legacy maps this to same count?
      icon: 'fa-calendar-times',
      color: colors.primary // primary blue
    },
    {
      title: 'Admissions',
      count: encounter.AdmissionCount || 0,
      icon: 'fa-user-plus',
      color: colors.danger // danger red
    },
    {
      title: 'Discharges',
      count: encounter.DischargeCount || 0,
      icon: 'fa-user-times',
      color: colors.warning // warning yellow
    },
    {
      title: 'Deceased',
      count: patient.DeseasedCount || 0,
      icon: 'fa-user-times',
      color: colors.success // success green
    },
    {
      title: 'Newborn',
      count: newborn.NewBornCount || 0,
      icon: 'fa-users',
      color: colors.success // success green
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  // Shared tint for the "Total" summary row across the tables below --
  // matches the original's rgba(235,178,0,0.1) gold tint, now derived from
  // the shared gold token instead of a hardcoded rgba literal.
  const totalRowStyle: React.CSSProperties = { backgroundColor: `${colors.gold}1a`, fontWeight: 700 };
  const thStyle: React.CSSProperties = {
    padding: spacing.sm, borderBottom: `2px solid ${colors.border}`, color: colors.textMuted,
    ...typography.helper, fontFamily: typography.fontFamily,
  };
  const stickyThStyle: React.CSSProperties = { ...thStyle, position: 'sticky', top: 0, backgroundColor: colors.surface };

  return (
    <div style={{ padding: spacing.xl, fontFamily: typography.fontFamily, backgroundColor: colors.surfaceMuted, minHeight: '100vh' }}>

      <PageHeader
        title="Admin Dashboard"
        breadcrumb={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing.xxl
      }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: radii.full,
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginRight: spacing.lg
                }}>
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <div>
                  {card.count !== undefined && (
                    <div style={{ color: colors.textMain, fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                      {card.count}
                    </div>
                  )}
                  <div style={{ ...typography.body, color: colors.textMuted, fontWeight: 500 }}>
                    {card.title}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl, marginBottom: spacing.xl }}>

        {/* Collection Table */}
        <Card title="Collection">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Particulars</th>
                  <th style={thStyle}>Cash</th>
                  <th style={thStyle}>Card</th>
                  <th style={thStyle}>Others</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ textAlign: 'left', padding: spacing.sm, fontWeight: 500, color: colors.textMain }}>{item.Key}</td>
                    <td style={{ padding: spacing.sm, color: colors.textMain }}>{formatCurrency(item.Value.CashAmount)}</td>
                    <td style={{ padding: spacing.sm, color: colors.textMain }}>{formatCurrency(item.Value.CardAmount)}</td>
                    <td style={{ padding: spacing.sm, color: colors.textMain }}>{formatCurrency(item.Value.OtherAmount)}</td>
                    <td style={{ padding: spacing.sm, fontWeight: 600, color: colors.textMain }}>{formatCurrency(item.Value.BillAmount)}</td>
                  </tr>
                ))}
                <tr style={totalRowStyle}>
                  <td style={{ textAlign: 'left', padding: spacing.md, color: colors.primary }}>Total</td>
                  <td style={{ padding: spacing.md, color: colors.primary }}>{formatCurrency(totals.cash)}</td>
                  <td style={{ padding: spacing.md, color: colors.primary }}>{formatCurrency(totals.card)}</td>
                  <td style={{ padding: spacing.md, color: colors.primary }}>{formatCurrency(totals.other)}</td>
                  <td style={{ padding: spacing.md, color: colors.primary }}>{formatCurrency(totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Revenue By Category */}
        <Card title="Revenue By Category">
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ ...stickyThStyle, textAlign: 'left' }}>Revenue</th>
                  <th style={stickyThStyle}>OP</th>
                  <th style={stickyThStyle}>IP</th>
                  <th style={stickyThStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {category.map((item: any, idx: number) => {
                  const isTotal = item.Key === 'Total';
                  return (
                    <tr key={idx} style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: isTotal ? `${colors.gold}1a` : 'transparent',
                      fontWeight: isTotal ? 700 : 400,
                      color: isTotal ? colors.primary : 'inherit'
                    }}>
                      <td style={{ textAlign: 'left', padding: spacing.sm }}>{item.Key}</td>
                      <td style={{ padding: spacing.sm }}>{formatCurrency(item.Value.OP)}</td>
                      <td style={{ padding: spacing.sm }}>{formatCurrency(item.Value.IP)}</td>
                      <td style={{ padding: spacing.sm }}>{formatCurrency(item.Value.OP + item.Value.IP)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Bed Occupancy Table */}
      <Card title="Bed Occupancy">
        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ ...stickyThStyle, textAlign: 'left' }}>Ward Name</th>
                <th style={stickyThStyle}>Available</th>
                <th style={stickyThStyle}>Occupied</th>
                <th style={stickyThStyle}>Other</th>
                <th style={stickyThStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              {wards.length > 0 ? (
                <>
                  {wards.map((ward: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ textAlign: 'left', padding: spacing.sm, fontWeight: 500, color: colors.textMain }}>{ward.WardName}</td>
                      <td style={{ padding: spacing.sm, color: colors.textMain }}>{ward.AvailableBeds}</td>
                      <td style={{ padding: spacing.sm, color: colors.textMain }}>{ward.OccupiedBeds}</td>
                      <td style={{ padding: spacing.sm, color: colors.textMain }}>{ward.OtherBeds}</td>
                      <td style={{ padding: spacing.sm, fontWeight: 600, color: colors.textMain }}>{ward.BedsCount}</td>
                    </tr>
                  ))}
                  <tr style={totalRowStyle}>
                    <td style={{ textAlign: 'left', padding: spacing.md, color: colors.primary }}>Total</td>
                    <td style={{ padding: spacing.md, color: colors.primary }}>{wardtotal.AvailableBeds}</td>
                    <td style={{ padding: spacing.md, color: colors.primary }}>{wardtotal.OccupiedBeds}</td>
                    <td style={{ padding: spacing.md, color: colors.primary }}>{wardtotal.OtherBeds}</td>
                    <td style={{ padding: spacing.md, color: colors.primary }}>{wardtotal.BedsCount}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <EmptyState text="No Data Available" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
