import React from 'react';

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

  const renderTableCard = (title: string, children: React.ReactNode) => (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '350px' // fixed height for uniformity
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafbfc'
      }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: 600 }}>{title}</h3>
      </div>
      <div style={{ overflow: 'auto', flex: 1, padding: '0' }}>
        {children}
      </div>
    </div>
  );

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa',
    color: '#444',
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #eaeaea',
    position: 'sticky',
    top: 0,
    zIndex: 1
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#555'
  };

  return (
    <div style={{ padding: '24px', fontFamily: '"Poppins", sans-serif', backgroundColor: '#f5f6ff', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 600 }}>
            Nursing Dashboard
          </h4>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {cards.filter(c => c.show).map(card => (
          <div 
            key={card.id}
            onClick={card.action}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderTop: `4px solid ${card.color}`,
              height: '140px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '8px',
                backgroundColor: `${card.color}15`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
            
            <div style={{ color: '#555', fontSize: '15px', fontWeight: 600, marginTop: 'auto' }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Today Admissions */}
        {renderTableCard("Today Admissions", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={tableHeaderStyle}>Admissions</th></tr>
            </thead>
            <tbody>
              {data.admissions.length > 0 ? data.admissions.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              )) : (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No admissions today</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Today Discharges */}
        {renderTableCard("Today Discharges", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={tableHeaderStyle}>Discharges</th></tr>
            </thead>
            <tbody>
              {data.discharges.length > 0 ? data.discharges.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              )) : (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No discharges today</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Available Beds */}
        {renderTableCard("Available Beds", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={tableHeaderStyle}>Available Beds Information</th></tr>
            </thead>
            <tbody>
              {data.availableBeds.length > 0 ? data.availableBeds.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    {item.availablebedinfo}
                  </td>
                </tr>
              )) : (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No beds available</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Discharge Clearance Patients */}
        {renderTableCard("Discharge Clearance Patients", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={tableHeaderStyle}>Patients</th></tr>
            </thead>
            <tbody>
              {data.dischargeClearance.length > 0 ? data.dischargeClearance.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              )) : (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No patients pending clearance</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Bed Details / Occupancy */}
        {renderTableCard("Bed Details (Occupancy)", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Ward</th>
                <th style={tableHeaderStyle}>Available</th>
                <th style={tableHeaderStyle}>Occupied</th>
                <th style={tableHeaderStyle}>Other</th>
                <th style={tableHeaderStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.wards.length > 0 ? (
                <>
                  {data.wards.map((ward, idx) => (
                    <tr key={idx}>
                      <td style={{...tableCellStyle, fontWeight: 600, color: '#333'}}>{ward.WardName}</td>
                      <td style={tableCellStyle}>{ward.AvailableBeds}</td>
                      <td style={tableCellStyle}>{ward.OccupiedBeds}</td>
                      <td style={tableCellStyle}>{ward.OtherBeds}</td>
                      <td style={tableCellStyle}>{ward.BedsCount}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#fdfdfd' }}>
                    <td style={{...tableCellStyle, fontWeight: 700, color: '#222'}}>Total</td>
                    <td style={{...tableCellStyle, fontWeight: 700}}>{data.wardtotal.AvailableBeds}</td>
                    <td style={{...tableCellStyle, fontWeight: 700}}>{data.wardtotal.OccupiedBeds}</td>
                    <td style={{...tableCellStyle, fontWeight: 700}}>{data.wardtotal.OtherBeds}</td>
                    <td style={{...tableCellStyle, fontWeight: 700}}>{data.wardtotal.BedsCount}</td>
                  </tr>
                </>
              ) : (
                <tr><td colSpan={5} style={{...tableCellStyle, textAlign: 'center'}}>No ward data available</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Lab Criticals */}
        {renderTableCard("Lab Critical Value Patients", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Patient Name</th>
                <th style={tableHeaderStyle}>Ref #</th>
                <th style={tableHeaderStyle}>Test Name</th>
              </tr>
            </thead>
            <tbody>
              {data.labCriticals.length > 0 ? data.labCriticals.map((lab, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    {lab.PatientName} / {lab.PatientMrn}
                  </td>
                  <td style={tableCellStyle}>
                    {lab.PatientOrder?.OrderNumber}
                  </td>
                  <td style={tableCellStyle}>
                    <strong>{lab.AnalyteName}</strong> - {lab.Resultvalue} {lab.PatientWorkorderdetail?.AnalyteUOM}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{...tableCellStyle, textAlign: 'center'}}>No critical lab results</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Radiology Criticals */}
        {renderTableCard("Radiology Critical Value Patients", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Patient Name</th>
                <th style={tableHeaderStyle}>Ref #</th>
                <th style={tableHeaderStyle}>Test Name</th>
              </tr>
            </thead>
            <tbody>
              {data.radCriticals.length > 0 ? data.radCriticals.map((rad, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    {rad.PatientName} / {rad.PatientMrn}
                  </td>
                  <td style={tableCellStyle}>
                    {rad.PatientOrder?.OrderNumber}
                  </td>
                  <td style={tableCellStyle}>
                    <strong>{rad.AnalyteName}</strong> - {rad.Resultvalue}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{...tableCellStyle, textAlign: 'center'}}>No critical radiology results</td></tr>
              )}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
};
