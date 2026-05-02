import React from 'react';

interface AdminDashboardProps {
  reactProps?: {
    facilityInfo?: any;
    totals?: any;
    wards?: any[];
    wardtotal?: any;
  };
}

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
      color: '#28a745' // success green
    },
    {
      title: 'Follow Up',
      count: encounter.opFollowUpVisitCount || 0,
      icon: 'fa-user',
      color: '#17a2b8' // info teal
    },
    {
      title: 'Appointments',
      count: appointment.AppointmentCount || 0,
      icon: 'fa-calendar-check',
      color: '#dc3545' // danger red
    },
    {
      title: 'Inactive',
      count: appointment.AppointmentCount || 0, // Legacy maps this to same count?
      icon: 'fa-calendar-times',
      color: '#007bff' // primary blue
    },
    {
      title: 'Admissions',
      count: encounter.AdmissionCount || 0,
      icon: 'fa-user-plus',
      color: '#dc3545' // danger red
    },
    {
      title: 'Discharges',
      count: encounter.DischargeCount || 0,
      icon: 'fa-user-times',
      color: '#ffc107' // warning yellow
    },
    {
      title: 'Deceased',
      count: patient.DeseasedCount || 0,
      icon: 'fa-user-times',
      color: '#28a745' // success green
    },
    {
      title: 'Newborn',
      count: newborn.NewBornCount || 0,
      icon: 'fa-users',
      color: '#28a745' // success green
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div style={{ padding: '24px', fontFamily: '"Poppins", sans-serif', backgroundColor: '#f5f6ff', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 600 }}>
            Admin Dashboard
          </h4>
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Home &gt; Dashboard
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: `${card.color}15`,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginRight: '16px'
            }}>
              <i className={`fas ${card.icon}`}></i>
            </div>
            <div>
              <div style={{ color: '#333', fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                {card.count}
              </div>
              <div style={{ color: '#888', fontSize: '14px', fontWeight: 500 }}>
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Collection Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h5 style={{ margin: '0 0 16px 0', color: '#184e77', fontSize: '18px', fontWeight: 600 }}>Collection</h5>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #eee', color: '#555' }}>Particulars</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555' }}>Cash</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555' }}>Card</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555' }}>Others</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ textAlign: 'left', padding: '10px', fontWeight: 500 }}>{item.Key}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(item.Value.CashAmount)}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(item.Value.CardAmount)}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(item.Value.OtherAmount)}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{formatCurrency(item.Value.BillAmount)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f6abd3', fontWeight: 'bold' }}>
                  <td style={{ textAlign: 'left', padding: '12px' }}>Total</td>
                  <td style={{ padding: '12px' }}>{formatCurrency(totals.cash)}</td>
                  <td style={{ padding: '12px' }}>{formatCurrency(totals.card)}</td>
                  <td style={{ padding: '12px' }}>{formatCurrency(totals.other)}</td>
                  <td style={{ padding: '12px' }}>{formatCurrency(totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue By Category */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h5 style={{ margin: '0 0 16px 0', color: '#184e77', fontSize: '18px', fontWeight: 600 }}>Revenue By Category</h5>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Revenue</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>OP</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>IP</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {category.map((item: any, idx: number) => {
                  const isTotal = item.Key === 'Total';
                  return (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid #eee',
                      backgroundColor: isTotal ? '#f6abd3' : 'transparent',
                      fontWeight: isTotal ? 'bold' : 'normal'
                    }}>
                      <td style={{ textAlign: 'left', padding: '10px' }}>{item.Key}</td>
                      <td style={{ padding: '10px' }}>{formatCurrency(item.Value.OP)}</td>
                      <td style={{ padding: '10px' }}>{formatCurrency(item.Value.IP)}</td>
                      <td style={{ padding: '10px' }}>{formatCurrency(item.Value.OP + item.Value.IP)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bed Occupancy Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h5 style={{ margin: '0 0 16px 0', color: '#184e77', fontSize: '18px', fontWeight: 600 }}>Bed Occupancy</h5>
        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Ward Name</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Available</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Occupied</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Other</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#555', position: 'sticky', top: 0, backgroundColor: '#fff' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {wards.length > 0 ? (
                <>
                  {wards.map((ward: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ textAlign: 'left', padding: '10px', fontWeight: 500 }}>{ward.WardName}</td>
                      <td style={{ padding: '10px' }}>{ward.AvailableBeds}</td>
                      <td style={{ padding: '10px' }}>{ward.OccupiedBeds}</td>
                      <td style={{ padding: '10px' }}>{ward.OtherBeds}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{ward.BedsCount}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f6abd3', fontWeight: 'bold' }}>
                    <td style={{ textAlign: 'left', padding: '12px' }}>Total</td>
                    <td style={{ padding: '12px' }}>{wardtotal.AvailableBeds}</td>
                    <td style={{ padding: '12px' }}>{wardtotal.OccupiedBeds}</td>
                    <td style={{ padding: '12px' }}>{wardtotal.OtherBeds}</td>
                    <td style={{ padding: '12px' }}>{wardtotal.BedsCount}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', color: '#999', fontStyle: 'italic' }}>No Data Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
