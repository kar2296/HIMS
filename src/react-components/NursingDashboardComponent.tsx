import React from 'react';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';
import { Card } from '../components/ui/Card';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';

// ─────────────────────────────────────────────────────────────
// Types (unchanged from original)
// ─────────────────────────────────────────────────────────────
interface NursingDashboardProps {
  reactProps?: {
    permissions: any;
    admissions: any[];
    discharges: any[];
    availableBeds: any[];
    dischargeClearance: any[];
    wards: any[];
    wardtotal: any;
    labCriticals: any[];
    radCriticals: any[];
  };
  onNavigate?: (stateName: string, params?: any) => void;
}

interface IndexedRow<T> { item: T; idx: number; }
function withIndex<T>(arr: T[]): IndexedRow<T>[] {
  return arr.map((item, idx) => ({ item, idx }));
}

function makePatientCols(header: string): DataTableColumn<IndexedRow<any>>[] {
  return [{
    key: 'summary', header,
    render: (r) => (
      <div>
        <strong style={{ color: colors.textMain }}>{r.item.patientname}</strong>
        <span style={{ color: colors.textMuted }}> ({r.item.Patient?.MRN})</span>
        <span style={{ color: colors.textSubtle, fontSize: '12px' }}> · {r.item.Patient?.Age} yrs · {r.item.VisitIdentifier} · {r.item.doctorname}</span>
        {r.item.warddetails && <span style={{ color: colors.textSubtle, fontSize: '12px' }}> · {r.item.warddetails}</span>}
      </div>
    ),
  }];
}

const criticalCols = (testRender: (r: IndexedRow<any>) => React.ReactNode): DataTableColumn<IndexedRow<any>>[] => [
  { key: 'patient', header: 'Patient', render: (r) => <><strong>{r.item.PatientName}</strong> <span style={{ color: colors.textSubtle, fontSize: '12px' }}>/{r.item.PatientMrn}</span></> },
  { key: 'ref', header: 'Order #', render: (r) => <>{r.item.PatientOrder?.OrderNumber}</> },
  { key: 'test', header: 'Result', render: testRender },
];

const labCols = criticalCols((r) => (
  <><strong style={{ color: colors.danger }}>{r.item.AnalyteName}</strong> — {r.item.Resultvalue} {r.item.PatientWorkorderdetail?.AnalyteUOM}</>
));

const radCols = criticalCols((r) => (
  <><strong style={{ color: colors.warning }}>{r.item.AnalyteName}</strong> — {r.item.Resultvalue}</>
));

export const NursingDashboardComponent: React.FC<NursingDashboardProps> = ({ reactProps, onNavigate }) => {
  const data = reactProps || {
    permissions: {}, admissions: [], discharges: [], availableBeds: [],
    dischargeClearance: [], wards: [], wardtotal: {}, labCriticals: [], radCriticals: [],
  };
  const { permissions } = data;

  const handleCardClick = (state: string, params?: any) => { if (onNavigate) onNavigate(state, params); };

  const metricCards = [
    { title: 'OP Patients', icon: 'fa-user-injured', color: '#2563eb', show: permissions.CanNursingCurrentOpPatients !== false, action: () => handleCardClick('app.oppatienttab.allcheckin', { context: 'nursing' }) },
    { title: 'IP Patients', icon: 'fa-procedures', color: '#10b981', show: permissions.CanNursingCurrentIpPatients !== false, action: () => handleCardClick('app.inpatienttab.myinpatient', { context: 'nursing' }) },
    { title: 'Appointments', icon: 'fa-calendar-check', color: '#f59e0b', show: permissions.CanNursingAppointments !== false, action: () => handleCardClick('app.appointmentstab.details') },
    { title: 'Ward Manage', icon: 'fa-building-user', color: '#8b5cf6', show: permissions.CanNursingWardManagement !== false, action: () => handleCardClick('app.bedmanagementtab.inpatient', { context: 'nursing' }) },
    { title: 'Today Admissions', count: data.admissions.length, icon: 'fa-hospital-user', color: '#0ea5e9', show: true, action: () => handleCardClick('app.admissions', { context: 'nursing' }) },
    { title: 'Available Beds', count: data.availableBeds.length, icon: 'fa-bed', color: '#64748b', show: permissions.CanNursingBedManagement !== false, action: () => handleCardClick('app.bedmanagement') },
  ].filter((c) => c.show !== false);

  const actionCards = [
    { title: 'Bed Transfer', icon: 'fa-right-left', color: '#f43f5e', show: permissions.CanNursingBedTransfer !== false, action: () => handleCardClick('app.bedtransfer-list') },
    { title: 'Bed Receive', icon: 'fa-inbox', color: '#06b6d4', show: permissions.CanNursingBedReceive !== false, action: () => handleCardClick('app.otbedreceive') },
    { title: 'My Tasks', icon: 'fa-list-check', color: '#84cc16', show: permissions.CanNursingMytask !== false, action: () => handleCardClick('app.mytasklist') },
    { title: 'Reports', icon: 'fa-chart-bar', color: '#f59e0b', show: permissions.CanNursingReports !== false, action: () => handleCardClick('app.nursingreport') },
  ].filter((c) => c.show !== false);

  // Bed occupancy for the ward
  const wardRows = data.wards;
  const wardTotal = data.wardtotal || {};
  const wardCols: DataTableColumn<any>[] = [
    { key: 'ward', header: 'Ward', field: 'WardName', sortable: true },
    { key: 'avail', header: 'Available', field: 'AvailableBeds', align: 'center' },
    { key: 'occ', header: 'Occupied', field: 'OccupiedBeds', align: 'center' },
    { key: 'other', header: 'Other', field: 'OtherBeds', align: 'center' },
    { key: 'total', header: 'Total', field: 'BedsCount', align: 'center' },
  ];

  return (
    <DashboardPageWrapper title="Nursing Dashboard" subtitle="Ward management, patient flow & critical alerts">
      {/* ── KPI cards ── */}
      <DashboardSection title="Overview">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing.lg }}>
          {metricCards.map((card, i) => (
            <StatCard key={i} title={card.title} count={(card as any).count} icon={card.icon} color={card.color} onClick={card.action} />
          ))}
        </div>
      </DashboardSection>

      {/* ── Patient tables grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: spacing.xl, marginBottom: spacing.xxl }}>
        <Card title="Today Admissions">
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.admissions)} columns={makePatientCols('Patient')} rowKey={(r) => r.idx} emptyText="No admissions today" clientSort={false} />
          </div>
        </Card>
        <Card title="Today Discharges">
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.discharges)} columns={makePatientCols('Patient')} rowKey={(r) => r.idx} emptyText="No discharges today" clientSort={false} />
          </div>
        </Card>
        <Card title="Discharge Clearance">
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.dischargeClearance)} columns={makePatientCols('Patient')} rowKey={(r) => r.idx} emptyText="No patients pending clearance" clientSort={false} />
          </div>
        </Card>
        <Card title="Available Beds">
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.availableBeds)} columns={[{ key: 'info', header: 'Bed Information', field: 'item.availablebedinfo' }]} rowKey={(r) => r.idx} emptyText="No available beds" clientSort={false} />
          </div>
        </Card>
      </div>

      {/* ── Critical alerts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl, marginBottom: spacing.xxl }}>
        <Card title="🚨 Lab Critical Values" style={{ borderTop: `3px solid ${colors.danger}` }}>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.labCriticals)} columns={labCols} rowKey={(r) => r.idx} emptyText="No critical lab results" clientSort={false} />
          </div>
        </Card>
        <Card title="🔶 Radiology Criticals" style={{ borderTop: `3px solid ${colors.warning}` }}>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            <DataTable rows={withIndex(data.radCriticals)} columns={radCols} rowKey={(r) => r.idx} emptyText="No critical radiology results" clientSort={false} />
          </div>
        </Card>
      </div>

      {/* ── Bed occupancy table ── */}
      <DashboardSection title="Bed Details (Occupancy)">
        <DataTable<any>
          columns={wardCols}
          rows={wardRows}
          rowKey={(row: any) => row.WardName || JSON.stringify(row)}
          emptyText="No ward data available"
          clientSort={true}
        />
        {wardRows.length > 0 && (
          <div style={{
            display: 'flex', gap: spacing.xl, padding: `${spacing.md} ${spacing.lg}`,
            background: `${colors.gold}12`, borderRadius: radii.md, marginTop: spacing.md,
            fontFamily: typography.fontFamily,
          }}>
            {[['Total Beds', wardTotal.BedsCount], ['Occupied', wardTotal.OccupiedBeds], ['Available', wardTotal.AvailableBeds], ['Other', wardTotal.OtherBeds]].map(([l, v], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: colors.primary }}>{v || 0}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* ── Quick actions ── */}
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
