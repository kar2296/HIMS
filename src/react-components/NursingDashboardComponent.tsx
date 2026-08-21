import React from 'react';
import { colors, radii, spacing, transitions, typography } from '../components/ui/tokens';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';

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

// ---------------------------------------------------------------------------
// UI-MODERNIZATION RETROFIT: this screen's markup now renders through the
// global design-system components (PageHeader, Card, DataTable, shared
// tokens) instead of hand-rolled `premium-glass-panel` divs and raw <table>
// markup. NOTHING behavioral changed: same `reactProps` shape, same
// `handleCardClick`/`onNavigate` dispatch, same permission-gated quick-nav
// card list (same ids/titles/icons/colors/target states/params), same seven
// data sections sourced from the exact same `data.*` arrays/fields, same
// empty-state copy per section, and no column-header sorting was ever wired
// up here (the original tables had plain, non-interactive <th> headers) --
// DataTable is used with no `sortable` columns so it never introduces sort
// behavior that didn't exist before.
//
// Every list-backed table below (Admissions, Discharges, Available Beds,
// Discharge Clearance, Lab Criticals, Radiology Criticals) is a genuinely
// simple read-only summary grid, so those move to DataTable, with each
// section's original per-cell string composition (the "Name | (MRN) | Age
// Years | VisitId - Doctor | Ward" line, the Lab/Rad "Name / MRN", "Ref #",
// "Analyte - Result UOM" cells) reproduced exactly via DataTable's `render`.
// Rows carry no server id, so (matching the original `key={idx}`) each row
// is wrapped with its array index via `withIndex()` purely for React keys --
// this adds no visible field and invents no data.
//
// The "Bed Details (Occupancy)" table is intentionally LEFT AS A HAND-ROLLED
// <table>, only restyled onto design tokens (no more `var(--premium-*)` /
// ad-hoc rgba values). Reason: its last row is a real but structurally
// different "Total" row (sourced from `data.wardtotal`, not `data.wards`)
// rendered with distinct bold/gold-highlight styling. DataTable's per-row
// rendering assumes uniform rows and has no prop for conditional row-level
// styling -- forcing the totals row through it would either lose that
// highlight or require a synthetic marker row hack. Per the retrofit
// guidance, a table this bespoke stays structurally as-is and is only
// token-restyled rather than force-fit into DataTable.
//
// No genuine "status" field is displayed anywhere on this screen (no
// ActiveStatus/discharge-status/bed-status string is rendered as text), so
// no Badge/StatusBadge was introduced -- there is nothing real to badge, and
// none should be invented.
// ---------------------------------------------------------------------------

interface IndexedRow<T> {
  item: T;
  idx: number;
}

function withIndex<T>(arr: T[]): IndexedRow<T>[] {
  return arr.map((item, idx) => ({ item, idx }));
}

interface PatientVisitRow {
  patientname?: string;
  Patient?: { MRN?: string; Age?: number };
  VisitIdentifier?: string;
  doctorname?: string;
  warddetails?: string;
  [key: string]: any;
}

interface AvailableBedRow {
  availablebedinfo?: string;
  [key: string]: any;
}

interface CriticalResultRow {
  PatientName?: string;
  PatientMrn?: string;
  PatientOrder?: { OrderNumber?: string };
  AnalyteName?: string;
  Resultvalue?: string | number;
  PatientWorkorderdetail?: { AnalyteUOM?: string };
  [key: string]: any;
}

interface WardRow {
  WardName?: string;
  AvailableBeds?: number;
  OccupiedBeds?: number;
  OtherBeds?: number;
  BedsCount?: number;
  [key: string]: any;
}

// Shared by Today Admissions / Today Discharges / Discharge Clearance --
// same cell composition as the original, only the column header text differs.
function makePatientVisitColumns(header: string): DataTableColumn<IndexedRow<PatientVisitRow>>[] {
  return [
    {
      key: 'summary',
      header,
      render: (r) => (
        <>
          <strong style={{ color: colors.textMain }}>{r.item.patientname} | ({r.item.Patient?.MRN})</strong> | {r.item.Patient?.Age} Years | {r.item.VisitIdentifier} - {r.item.doctorname} | {r.item.warddetails}
        </>
      ),
    },
  ];
}

const availableBedsColumns: DataTableColumn<IndexedRow<AvailableBedRow>>[] = [
  { key: 'info', header: 'Available Beds Information', field: 'item.availablebedinfo' },
];

// Shared by Lab Criticals / Radiology Criticals -- identical Patient Name /
// Ref # columns, distinct "Test Name" cell (radiology never showed a UOM,
// preserved exactly as-is).
function criticalResultColumns(
  testNameRender: (r: IndexedRow<CriticalResultRow>) => React.ReactNode
): DataTableColumn<IndexedRow<CriticalResultRow>>[] {
  return [
    { key: 'patient', header: 'Patient Name', render: (r) => <>{r.item.PatientName} / {r.item.PatientMrn}</> },
    { key: 'ref', header: 'Ref #', render: (r) => <>{r.item.PatientOrder?.OrderNumber}</> },
    { key: 'test', header: 'Test Name', render: testNameRender },
  ];
}

const labColumns = criticalResultColumns((r) => (
  <><strong style={{ color: colors.textMain }}>{r.item.AnalyteName}</strong> - {r.item.Resultvalue} {r.item.PatientWorkorderdetail?.AnalyteUOM}</>
));

const radColumns = criticalResultColumns((r) => (
  <><strong style={{ color: colors.textMain }}>{r.item.AnalyteName}</strong> - {r.item.Resultvalue}</>
));

// Token-based restyle of the hand-rolled Bed Details (Occupancy) table --
// left as a raw <table>, see the block comment above for why.
const wardHeaderStyle: React.CSSProperties = {
  backgroundColor: colors.surfaceMuted,
  color: colors.textMuted,
  fontSize: typography.label.fontSize,
  fontWeight: typography.label.fontWeight,
  padding: `${spacing.md} ${spacing.lg}`,
  textAlign: 'left',
  borderBottom: `2px solid ${colors.border}`,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  fontFamily: typography.fontFamily,
};

const wardCellStyle: React.CSSProperties = {
  padding: `${spacing.md} ${spacing.lg}`,
  borderBottom: `1px solid ${colors.border}`,
  fontSize: '14px',
  color: colors.textMuted,
  fontFamily: typography.fontFamily,
};

export const NursingDashboardComponent: React.FC<NursingDashboardProps> = ({
  reactProps,
  onNavigate
}) => {
  const data = reactProps || {
    permissions: {},
    admissions: [],
    discharges: [],
    availableBeds: [],
    dischargeClearance: [],
    wards: [],
    wardtotal: { BedsCount: 0, OccupiedBeds: 0, AvailableBeds: 0, OtherBeds: 0 },
    labCriticals: [],
    radCriticals: []
  };
  const { permissions } = data;

  const handleCardClick = (stateName: string, params?: any) => {
    if (onNavigate) {
      onNavigate(stateName, params);
    }
  };

  const cards = [
    {
      id: 'OPPatients',
      title: 'OP Patients',
      icon: 'fa-user-injured',
      show: permissions.CanNursingCurrentOpPatients !== false,
      color: '#4a90e2', // blue
      action: () => handleCardClick('app.oppatienttab.allcheckin', { context: 'nursing' })
    },
    {
      id: 'Appointments',
      title: 'Appointments',
      icon: 'fa-calendar-alt',
      show: permissions.CanNursingAppointments !== false,
      color: '#50e3c2', // teal
      action: () => handleCardClick('app.appointmentstab.details')
    },
    {
      id: 'Reports',
      title: 'Reports',
      icon: 'fa-clipboard',
      show: permissions.CanNursingReports !== false,
      color: '#f5a623', // orange
      action: () => handleCardClick('app.nursingreport')
    },
    {
      id: 'IPPatients',
      title: 'IP Patients',
      icon: 'fa-procedures',
      show: permissions.CanNursingCurrentIpPatients !== false,
      color: '#7ed321', // green
      action: () => handleCardClick('app.inpatienttab.myinpatient', { context: 'nursing' })
    },
    {
      id: 'WardManage',
      title: 'Ward Manage',
      icon: 'fa-person-booth',
      show: permissions.CanNursingWardManagement !== false,
      color: '#bd10e0', // purple
      action: () => handleCardClick('app.bedmanagementtab.inpatient', { context: 'nursing' })
    },
    {
      id: 'MyTask',
      title: 'My Task',
      icon: 'fa-file-text-o',
      show: permissions.CanNursingMytask !== false,
      color: '#ff5a5f', // coral
      action: () => handleCardClick('app.mytasklist')
    },
    {
      id: 'BedManagement',
      title: 'Bed Management',
      icon: 'fa-bed',
      show: permissions.CanNursingBedManagement !== false,
      color: '#8b572a', // brown
      action: () => handleCardClick('app.bedmanagement')
    },
    {
      id: 'BedTransfer',
      title: 'Bed Transfer',
      icon: 'fa-exchange',
      show: permissions.CanNursingBedTransfer !== false,
      color: '#e46a76', // pink
      action: () => handleCardClick('app.bedtransfer-list')
    },
    {
      id: 'BedReceive',
      title: 'Bed Receive',
      icon: 'fa-get-pocket',
      show: permissions.CanNursingBedReceive !== false,
      color: '#00c292', // mint
      action: () => handleCardClick('app.otbedreceive')
    }
  ];

  const admissionsColumns = makePatientVisitColumns('Admissions');
  const dischargesColumns = makePatientVisitColumns('Discharges');
  const dischargeClearanceColumns = makePatientVisitColumns('Patients');

  // Same "wards + a distinct Total row" shape as the original -- the Total
  // row is only appended when there IS ward data, exactly mirroring the
  // original's `data.wards.length > 0 ? (...rows, totalRow) : (empty row)`.
  const wardRows: WardRow[] = data.wards;
  const wardTotal = data.wardtotal;

  return (
    <div style={{ padding: spacing.xl, fontFamily: typography.fontFamily, backgroundColor: colors.surfaceMuted, minHeight: '100vh' }}>

      <PageHeader title="Nursing Dashboard" />

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing.xxl
      }}>
        {cards.filter(c => c.show).map(card => (
          <div
            key={card.id}
            onClick={card.action}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Card style={{ borderTop: `4px solid ${card.color}`, transition: transitions.base }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: radii.md,
                backgroundColor: `${card.color}15`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                <i className={`fas ${card.icon}`}></i>
              </div>

              <div style={{ color: colors.textMain, fontSize: '15px', fontWeight: 600, marginTop: spacing.lg, fontFamily: typography.fontFamily }}>
                {card.title}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: spacing.xl
      }}>

        {/* Today Admissions */}
        <Card title="Today Admissions">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<PatientVisitRow>>
              columns={admissionsColumns}
              rows={withIndex(data.admissions)}
              rowKey={(r) => r.idx}
              emptyText="No admissions today"
              clientSort={false}
            />
          </div>
        </Card>

        {/* Today Discharges */}
        <Card title="Today Discharges">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<PatientVisitRow>>
              columns={dischargesColumns}
              rows={withIndex(data.discharges)}
              rowKey={(r) => r.idx}
              emptyText="No discharges today"
              clientSort={false}
            />
          </div>
        </Card>

        {/* Available Beds */}
        <Card title="Available Beds">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<AvailableBedRow>>
              columns={availableBedsColumns}
              rows={withIndex(data.availableBeds)}
              rowKey={(r) => r.idx}
              emptyText="No beds available"
              clientSort={false}
            />
          </div>
        </Card>

        {/* Discharge Clearance Patients */}
        <Card title="Discharge Clearance Patients">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<PatientVisitRow>>
              columns={dischargeClearanceColumns}
              rows={withIndex(data.dischargeClearance)}
              rowKey={(r) => r.idx}
              emptyText="No patients pending clearance"
              clientSort={false}
            />
          </div>
        </Card>

        {/* Bed Details / Occupancy -- kept as a hand-rolled table, token-restyled only (see block comment above) */}
        <Card title="Bed Details (Occupancy)">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={wardHeaderStyle}>Ward</th>
                  <th style={wardHeaderStyle}>Available</th>
                  <th style={wardHeaderStyle}>Occupied</th>
                  <th style={wardHeaderStyle}>Other</th>
                  <th style={wardHeaderStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {wardRows.length > 0 ? (
                  <>
                    {wardRows.map((ward, idx) => (
                      <tr key={idx}>
                        <td style={{ ...wardCellStyle, fontWeight: 600, color: colors.textMain }}>{ward.WardName}</td>
                        <td style={wardCellStyle}>{ward.AvailableBeds}</td>
                        <td style={wardCellStyle}>{ward.OccupiedBeds}</td>
                        <td style={wardCellStyle}>{ward.OtherBeds}</td>
                        <td style={wardCellStyle}>{ward.BedsCount}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: `${colors.gold}1a` }}>
                      <td style={{ ...wardCellStyle, fontWeight: 700, color: colors.primary }}>Total</td>
                      <td style={{ ...wardCellStyle, fontWeight: 700, color: colors.primary }}>{wardTotal.AvailableBeds}</td>
                      <td style={{ ...wardCellStyle, fontWeight: 700, color: colors.primary }}>{wardTotal.OccupiedBeds}</td>
                      <td style={{ ...wardCellStyle, fontWeight: 700, color: colors.primary }}>{wardTotal.OtherBeds}</td>
                      <td style={{ ...wardCellStyle, fontWeight: 700, color: colors.primary }}>{wardTotal.BedsCount}</td>
                    </tr>
                  </>
                ) : (
                  <tr><td colSpan={5} style={{ ...wardCellStyle, textAlign: 'center' }}>No ward data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Lab Criticals */}
        <Card title="Lab Critical Value Patients">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<CriticalResultRow>>
              columns={labColumns}
              rows={withIndex(data.labCriticals)}
              rowKey={(r) => r.idx}
              emptyText="No critical lab results"
              clientSort={false}
            />
          </div>
        </Card>

        {/* Radiology Criticals */}
        <Card title="Radiology Critical Value Patients">
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <DataTable<IndexedRow<CriticalResultRow>>
              columns={radColumns}
              rows={withIndex(data.radCriticals)}
              rowKey={(r) => r.idx}
              emptyText="No critical radiology results"
              clientSort={false}
            />
          </div>
        </Card>

      </div>

    </div>
  );
};
