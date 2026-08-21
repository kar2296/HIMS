import React from 'react';
import { Card } from '../components/ui/Card';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Breadcrumb';
import { colors, spacing, typography, radii, transitions } from '../components/ui/tokens';

interface DoctorDashboardProps {
  items?: any;
  permissions?: any;
  tablesData?: any;
  onNavigate?: (stateName: string, params?: any) => void;
}

export const DoctorDashboardTopSection: React.FC<DoctorDashboardProps> = ({
  items = {},
  permissions = {},
  tablesData = {},
  onNavigate
}) => {

  const handleCardClick = (stateName: string, params?: any) => {
    if (onNavigate) {
      onNavigate(stateName, params);
    }
  };

  const cards = [
    {
      id: 'OP_Patients',
      title: 'OP Patients',
      icon: 'fa-user-injured',
      count: items.checkedincount || 0,
      show: permissions.OP_Patients !== false,
      color: '#4a90e2', // blue
      action: () => handleCardClick('app.oppatienttab.mycheckin')
    },
    {
      id: 'IP_Patients',
      title: 'IP Patients',
      icon: 'fa-procedures',
      count: items.inpatientcount || 0,
      show: permissions.IP_Patients !== false,
      color: '#50e3c2', // teal
      action: () => handleCardClick('app.inpatienttab.myinpatient')
    },
    {
      id: 'Appointments',
      title: 'Appointments',
      icon: 'fa-calendar-check',
      count: items.appoinmentCount || 0,
      show: permissions.Appointments !== false,
      color: '#f5a623', // orange
      action: () => handleCardClick('app.appointmentstab.viewappoitment', { iShowCalendar: 1 })
    },
    {
      id: 'SurgerySchedule',
      title: 'Surgery Schedule',
      icon: 'fa-calendar-alt',
      count: items.otschedulecount || 0,
      show: permissions.SurgerySchedule !== false,
      color: '#7ed321', // green
      action: () => handleCardClick('app.surgerydoctorchedules')
    },
    {
      id: 'Reports',
      title: 'Reports',
      icon: 'fa-clipboard',
      count: items.directbilling || 0, // Using same logic as legacy
      show: permissions.Reports !== false,
      color: '#bd10e0', // purple
      action: () => handleCardClick('app.doctorreport')
    },
    {
      id: 'DischargedPatients',
      title: 'Discharged Patients',
      icon: 'fa-hiking',
      count: items.dischargedcount || 0,
      show: true,
      color: '#ff5a5f', // coral
      action: () => handleCardClick('app.docdischargedpatient')
    },
    {
      id: 'TaskAssignment',
      title: 'Task Assignment',
      icon: 'fa-tasks',
      count: undefined,
      show: true,
      color: '#8b572a', // brown
      action: () => handleCardClick('app.taskmanagementlist')
    }
  ];

  // Stat accent colors are mapped to the design-system's semantic status
  // tones (same keyword mapping StatusBadge/toneForStatus uses: pending ->
  // warning, completed -> success, cancelled -> danger) since these labels
  // are real status words -- only the color values moved from ad-hoc hex to
  // tokens, the labels/counts/data are untouched.
  const stats = [
    { label: 'Today', count: items.TodayCount, color: colors.textMain },
    { label: 'Pending', count: items.PendingCount, color: colors.warning },
    { label: 'Completed', count: items.CompletedCount, color: colors.success },
    { label: 'Cancelled', count: items.CancelledCount, color: colors.danger }
  ];

  const renderTable = (title: string, data: any[], columns: DataTableColumn<any>[]) => (
    <Card title={title} style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <DataTable<any>
          columns={columns}
          rows={data || []}
          rowKey={(row: any) => JSON.stringify(row)}
          emptyText="No records found"
        />
      </div>
    </Card>
  );

  return (
    <div style={{ padding: spacing.xl, fontFamily: typography.fontFamily, backgroundColor: colors.surfaceMuted, minHeight: '100vh' }}>

      {/* Header */}
      <PageHeader title="Doctor Dashboard" />

      <div style={{ display: 'flex', gap: spacing.xl, marginBottom: spacing.xxl, flexWrap: 'wrap' }}>
        {/* Left Side: Cards */}
        <div style={{ flex: '3', minWidth: '600px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: spacing.lg
          }}>
            {cards.filter(c => c.show).map(card => (
              <div
                key={card.id}
                onClick={card.action}
                style={{ cursor: 'pointer', transition: transitions.base }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Card padding={spacing.lg} style={{ borderLeft: `5px solid ${card.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: colors.textMuted, ...typography.caption, fontSize: '12px', marginBottom: spacing.xs }}>
                        {card.title}
                      </div>
                      {card.count !== undefined && (
                        <div style={{ color: colors.textMain, fontSize: '24px', fontWeight: 700 }}>
                          {card.count}
                        </div>
                      )}
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: radii.full,
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      <i className={`fas ${card.icon}`}></i>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Stats Panel */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <Card style={{ height: '100%' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.lg
            }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: spacing.lg,
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: radii.md,
                  borderTop: `4px solid ${stat.color}`
                }}>
                  <div style={{ ...typography.caption, fontSize: '12px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: spacing.sm }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>
                    {stat.count || 0}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: spacing.xl,
        marginBottom: spacing.xxxl
      }}>
        {renderTable('Pending Homecare', tablesData.TodayPendingList, [
          { key: 'mrn', header: 'MRN#', field: 'PatientMrn' },
          { key: 'date', header: 'Date', render: (row: any) => new Date(row.StartDate).toLocaleDateString() },
          { key: 'name', header: 'Patient Name', field: 'PatientName' }
        ])}

        {renderTable('Completed Homecare', tablesData.TodayCompletedList, [
          { key: 'mrn', header: 'MRN#', field: 'PatientMrn' },
          { key: 'date', header: 'Date', render: (row: any) => new Date(row.StartDate).toLocaleDateString() },
          { key: 'name', header: 'Patient Name', field: 'PatientName' }
        ])}

        {renderTable('Today Admitted Patients', tablesData.admissionlist, [
          { key: 'ip', header: 'IP#', field: 'VisitIdentifier' },
          { key: 'date', header: 'Date', render: (row: any) => new Date(row.AdmissionDate).toLocaleDateString() },
          { key: 'name', header: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Discharged Patients', tablesData.dischargedlist, [
          { key: 'ip', header: 'IP#', field: 'VisitIdentifier' },
          { key: 'date', header: 'Disc.Date', render: (row: any) => new Date(row.DischargeDate).toLocaleDateString() },
          { key: 'name', header: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Surgery Patients', tablesData.ScheduleList, [
          { key: 'ip', header: 'IP#', render: (row: any) => row.Encounter?.VisitIdentifier },
          { key: 'date', header: 'Schedule Date', render: (row: any) => new Date(row.OTScheduledOn).toLocaleDateString() },
          { key: 'name', header: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Appointments', tablesData.ApnmntList, [
          { key: 'mrn', header: 'MRN', field: 'PatientMrn' },
          { key: 'date', header: 'Appt Date', render: (row: any) => new Date(row.AppointmentDate).toLocaleDateString() },
          { key: 'time', header: 'Time', render: (row: any) => `${row.StartTime} - ${row.EndTime}` },
          { key: 'name', header: 'Patient Name', field: 'PatientName' }
        ])}

        {renderTable('Lab Critical Values', tablesData.LabCriticals, [
          { key: 'name', header: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` },
          { key: 'ref', header: 'Ref #', render: (row: any) => row.PatientOrder?.OrderNumber },
          { key: 'test', header: 'Test Name', render: (row: any) => `${row.AnalyteName} - ${row.Resultvalue}` }
        ])}

        {renderTable('Radiology Critical Values', tablesData.RadCriticals, [
          { key: 'name', header: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` },
          { key: 'ref', header: 'Ref #', render: (row: any) => row.PatientOrder?.OrderNumber },
          { key: 'test', header: 'Test Name', render: (row: any) => `${row.AnalyteName} - ${row.Resultvalue}` }
        ])}

      </div>

    </div>
  );
};
