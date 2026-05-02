import React from 'react';

interface DashboardItems {
  TodayCheckInCount?: string | number;
  TodayScheduledCount?: string | number;
  opbillings?: string | number;
  directbilling?: string | number;
  labbilling?: string | number;
  admissions?: string | number;
  bedtransfer?: string | number;
  ippatient?: string | number;
  reports?: string | number;
  
  RegistrationCount?: string | number;
  OPVisitCount?: string | number;
  AdmittedCount?: string | number;
  DischargeCount?: string | number;
  TotalOccupancyCount?: string | number;
  PendingdischargeCount?: string | number;
  PresentOccupancyCount?: string | number;
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

interface FrontOfficeDashboardProps {
  items?: DashboardItems;
  permissions?: DashboardPermissions;
  onNavigate?: (stateName: string, params?: any) => void;
}

export const FrontOfficeDashboardComponent: React.FC<FrontOfficeDashboardProps> = ({
  items = {},
  permissions = {},
  onNavigate
}) => {

  const handleCardClick = (stateName: string, params?: any) => {
    if (onNavigate) {
      onNavigate(stateName, params);
    }
  };

  const cards = [
    {
      id: 'Registration',
      title: 'Registration',
      icon: 'fa-registered',
      count: items.TodayCheckInCount || 0,
      show: permissions.Registration,
      color: '#4a90e2', // blue
      action: () => handleCardClick('app.regcumvisitwithbill', { context: 'frontoffice' })
    },
    {
      id: 'Appointments',
      title: 'Appointments',
      icon: 'fa-user',
      count: items.TodayScheduledCount || 0,
      show: permissions.Appointments,
      color: '#50e3c2', // teal
      action: () => handleCardClick('app.appointmentstab.details')
    },
    {
      id: 'OPbilling',
      title: 'OP Billings',
      icon: 'fa-file-text-o',
      count: items.opbillings || 0,
      show: permissions.OPbilling,
      color: '#f5a623', // orange
      action: () => handleCardClick('app.opbilling-list', { tp: 'OP', context: 'frontoffice' })
    },
    {
      id: 'DirectBilling',
      title: 'Direct Billing',
      icon: 'fa-usd',
      count: items.directbilling || 0,
      show: permissions.DirectBilling,
      color: '#7ed321', // green
      action: () => handleCardClick('app.directbilling', { tp: 'DG', context: 'frontoffice' })
    },
    {
      id: 'LabBilling',
      title: 'Lab Billing',
      icon: 'fa-list',
      count: items.labbilling || 0,
      show: permissions.LabBilling,
      color: '#bd10e0', // purple
      action: () => handleCardClick('app.opbilling-list', { tp: 'DG', context: 'frontoffice' })
    },
    {
      id: 'Admissions',
      title: 'Admissions',
      icon: 'fa-inr',
      count: items.admissions || 0,
      show: permissions.Admissions,
      color: '#d0021b', // red
      action: () => handleCardClick('app.admissions', { context: 'frontoffice' })
    },
    {
      id: 'BedTransfer',
      title: 'Bed Transfer',
      icon: 'fa-percent',
      count: items.bedtransfer || 0,
      show: permissions.BedTransfer,
      color: '#9013fe', // deep purple
      action: () => handleCardClick('app.bedtransfer-list', { context: 'frontoffice' })
    },
    {
      id: 'CurrentIpPatients',
      title: 'Current IP Patients',
      icon: 'fa-briefcase',
      count: items.ippatient || 0,
      show: permissions.CurrentIpPatients,
      color: '#ff5a5f', // coral
      action: () => handleCardClick('app.currentinpatients', { context: 'frontoffice' })
    },
    {
      id: 'FrontOfficeReports',
      title: 'Reports',
      icon: 'fa-file-text-o',
      count: items.reports || 0,
      show: permissions.FrontOfficeReports,
      color: '#8b572a', // brown
      action: () => handleCardClick('app.ipopreportstab.inpatientreport', { context: 'frontoffice' })
    }
  ];

  return (
    <div style={{ padding: '24px', fontFamily: '"Poppins", sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 600 }}>
          Front Office Dashboard
        </h4>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
          Overview of today's hospital operations
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {cards.filter(c => c.show !== false).map(card => (
          <div 
            key={card.id}
            onClick={card.action}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `5px solid ${card.color}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
            }}
          >
            <div>
              <div style={{ color: '#888', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                {card.title.toUpperCase()}
              </div>
              <div style={{ color: '#333', fontSize: '28px', fontWeight: 700 }}>
                {card.count}
              </div>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: `${card.color}15`, // 15% opacity
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              <i className={`fa ${card.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        maxWidth: '600px'
      }}>
        <div style={{
          backgroundColor: '#21008d', // match new premium theme
          color: '#fff',
          padding: '16px 20px',
          fontSize: '16px',
          fontWeight: 600
        }}>
          Summary
        </div>
        
        <div style={{ padding: '0 20px' }}>
          {[
            { label: 'Today Registrations', value: items.RegistrationCount },
            { label: 'Total Consultations', value: items.OPVisitCount },
            { label: 'Today Admitted', value: items.AdmittedCount },
            { label: 'Today Discharges', value: items.DischargeCount },
            { label: 'Total Occupancy (ER & IP)', value: items.TotalOccupancyCount },
            { label: 'Pending Discharges', value: items.PendingdischargeCount },
            { label: 'Present Occupancy', value: items.PresentOccupancyCount }
          ].map((row, index, arr) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: index === arr.length - 1 ? 'none' : '1px solid #eee'
            }}>
              <span style={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>
                {row.label}
              </span>
              <span style={{ color: '#222', fontSize: '15px', fontWeight: 600 }}>
                {row.value || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
