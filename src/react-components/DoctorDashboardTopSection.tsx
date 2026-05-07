import React from 'react';

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

  const stats = [
    { label: 'Today', count: items.TodayCount, color: 'var(--premium-text-main)' },
    { label: 'Pending', count: items.PendingCount, color: '#f5a623' },
    { label: 'Completed', count: items.CompletedCount, color: '#50e3c2' },
    { label: 'Cancelled', count: items.CancelledCount, color: '#e46a76' }
  ];

  const renderTable = (title: string, data: any[], columns: any[]) => (
    <div className="premium-glass-panel" style={{
      padding: '20px',
      height: '350px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--premium-blue)', fontSize: '18px', fontWeight: 600 }}>
        {title}
      </h3>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'var(--glass-bg)',
                  color: 'var(--premium-text-muted)',
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderBottom: '2px solid rgba(0,0,0,0.05)',
                  zIndex: 1,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === columns.length - 1 ? '0 8px 8px 0' : '0'
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  {columns.map((col, j) => (
                    <td key={j} style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--premium-text-main)' }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center', color: 'var(--premium-text-muted)', fontStyle: 'italic' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-modern)', backgroundColor: 'var(--premium-bg-light)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: 0, color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 600 }}>
          Doctor Dashboard
        </h4>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {/* Left Side: Cards */}
        <div style={{ flex: '3', minWidth: '600px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {cards.filter(c => c.show).map(card => (
              <div 
                key={card.id}
                onClick={card.action}
                className="premium-glass-panel"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                  borderLeft: `5px solid ${card.color}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ color: 'var(--premium-text-muted)', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                    {card.title}
                  </div>
                  {card.count !== undefined && (
                    <div style={{ color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 700 }}>
                      {card.count}
                    </div>
                  )}
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
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
            ))}
          </div>
        </div>

        {/* Right Side: Stats Panel */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div className="premium-glass-panel" style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            height: '100%'
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                borderTop: `4px solid ${stat.color}`
              }}>
                <div style={{ fontSize: '12px', color: 'var(--premium-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>
                  {stat.count || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {renderTable('Pending Homecare', tablesData.TodayPendingList, [
          { label: 'MRN#', key: 'PatientMrn' },
          { label: 'Date', render: (row: any) => new Date(row.StartDate).toLocaleDateString() },
          { label: 'Patient Name', key: 'PatientName' }
        ])}

        {renderTable('Completed Homecare', tablesData.TodayCompletedList, [
          { label: 'MRN#', key: 'PatientMrn' },
          { label: 'Date', render: (row: any) => new Date(row.StartDate).toLocaleDateString() },
          { label: 'Patient Name', key: 'PatientName' }
        ])}

        {renderTable('Today Admitted Patients', tablesData.admissionlist, [
          { label: 'IP#', key: 'VisitIdentifier' },
          { label: 'Date', render: (row: any) => new Date(row.AdmissionDate).toLocaleDateString() },
          { label: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Discharged Patients', tablesData.dischargedlist, [
          { label: 'IP#', key: 'VisitIdentifier' },
          { label: 'Disc.Date', render: (row: any) => new Date(row.DischargeDate).toLocaleDateString() },
          { label: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Surgery Patients', tablesData.ScheduleList, [
          { label: 'IP#', render: (row: any) => row.Encounter?.VisitIdentifier },
          { label: 'Schedule Date', render: (row: any) => new Date(row.OTScheduledOn).toLocaleDateString() },
          { label: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` }
        ])}

        {renderTable('Today Appointments', tablesData.ApnmntList, [
          { label: 'MRN', key: 'PatientMrn' },
          { label: 'Appt Date', render: (row: any) => new Date(row.AppointmentDate).toLocaleDateString() },
          { label: 'Time', render: (row: any) => `${row.StartTime} - ${row.EndTime}` },
          { label: 'Patient Name', key: 'PatientName' }
        ])}
        
        {renderTable('Lab Critical Values', tablesData.LabCriticals, [
          { label: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` },
          { label: 'Ref #', render: (row: any) => row.PatientOrder?.OrderNumber },
          { label: 'Test Name', render: (row: any) => `${row.AnalyteName} - ${row.Resultvalue}` }
        ])}

        {renderTable('Radiology Critical Values', tablesData.RadCriticals, [
          { label: 'Patient Name', render: (row: any) => `${row.PatientName} / ${row.PatientMrn}` },
          { label: 'Ref #', render: (row: any) => row.PatientOrder?.OrderNumber },
          { label: 'Test Name', render: (row: any) => `${row.AnalyteName} - ${row.Resultvalue}` }
        ])}

      </div>

    </div>
  );
};
