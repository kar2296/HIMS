import React, { useState, useEffect } from 'react';

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

interface CurrentContext {
  FacilityId: number;
  DoctorId: number;
  FromDate: string;
  ToDate: string;
}

interface FrontOfficeDashboardProps {
  permissions?: DashboardPermissions;
  currentcontext?: CurrentContext;
  onNavigate?: (stateName: string, params?: any) => void;
}

import { apiFetch } from './utils/api';
import { RegCumVisitWithBillScreen } from './RegCumVisitWithBillScreen';

export const FrontOfficeDashboardComponent: React.FC<FrontOfficeDashboardProps> = ({
  permissions = {},
  currentcontext,
  onNavigate
}) => {
  const [items, setItems] = useState<DashboardItems>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [showRegCumVisitWithBill, setShowRegCumVisitWithBill] = useState<boolean>(false);

  useEffect(() => {
    if (!currentcontext) return;

    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { FacilityId, DoctorId, FromDate, ToDate } = currentcontext;

        // 1. GetMINIPPatientsBills (Admissions/Discharges)
        const p1 = apiFetch('Visit/Visit/GetMINIPPatientsBills', {
          Params: [
            { Key: 1, Value: FacilityId },
            { Key: 17, Value: FromDate },
            { Key: 18, Value: ToDate },
            { Key: 3, Value: [4, 5] },
          ],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        });

        // 2. GetBedOccupancyHistorys (Total Occupancy)
        const p2 = apiFetch('IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys', {
          Params: [
            { Key: 2, Value: 1 },
            { Key: 6, Value: [2, 3, 4, 5] },
            { Key: 9, Value: FacilityId },
          ]
        });

        // 3. GetDashboardOptions (Doctor counts)
        const p3 = apiFetch('Visit/DoctorDashboard/GetDashboardOptions', {
          Data: { Keys: [{ Key: 'appointment' }, { Key: 'mycheckedin' }] },
          Attributes: currentcontext
        });

        // 4. GetEncounters (Outpatient visits)
        const p4 = apiFetch('Visit/Visit/GetEncounters', {
          Params: [
            { Key: 15, Value: 1 },
            { Key: 5, Value: DoctorId },
            { Key: 17, Value: FromDate },
            { Key: 18, Value: ToDate }
          ],
          PageContext: { PageSize: 3, PageNumber: 1 }
        });

        // 5. GetFacilityDashboardOptions (Facility Summary)
        const p5 = apiFetch('SystemSettings/facilitydashboard/GetFacilityDashboardOptions', {
          Data: { Keys: [{ Key: 'encounter' }, { Key: 'patient' }, { Key: 'appointment' }] },
          Attributes: currentcontext
        });

        // Execute all requests concurrently
        const [res1, res2, res3, res4, res5] = await Promise.all([p1, p2, p3, p4, p5]);

        if (!isMounted) return;

        const newItems: DashboardItems = {};

        // Parse Res1 (Bills/Discharges)
        newItems.todayDischarge = res1?.Data?.length || 0;

        // Parse Res2 (Occupancy)
        const totalOcc = res2?.Data?.length || 0;
        newItems.TotalOccupancyCount = totalOcc;

        // Parse Res3 (Doctor Dashboard)
        newItems.TodayCheckInCount = res3?.appointment?.TodayCheckInCount || '0';
        newItems.TodayScheduledCount = res3?.appointment?.TodayScheduledCount || '0';

        // Parse Res5 (Facility Summary)
        if (res5?.encounter) {
          newItems.DischargeCount = res5.encounter.DischargeCount || '0';
          newItems.AdmittedCount = res5.encounter.AdmissionCount || '0';
          newItems.OPVisitCount = res5.encounter.OPVisitCount || '0';
          newItems.PendingdischargeCount = res5.encounter.PendingdischargeCount || '0';
        }
        if (res5?.patient) {
          newItems.RegistrationCount = res5.patient.RegistrationCount || '0';
        }

        // Calculate derived fields
        const presentOcc = Number(newItems.TotalOccupancyCount || 0) - Number(newItems.PendingdischargeCount || 0);
        newItems.PresentOccupancyCount = isNaN(presentOcc) ? '0' : presentOcc.toString();

        setItems(newItems);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => { isMounted = false; };
  }, [currentcontext]);

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
      action: () => setShowRegCumVisitWithBill(true)
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
      show: permissions.OPbilling,
      color: '#f5a623', // orange
      action: () => handleCardClick('app.opbilling-list', { tp: 'OP', context: 'frontoffice' })
    },
    {
      id: 'DirectBilling',
      title: 'Direct Billing',
      icon: 'fa-usd',
      show: permissions.DirectBilling,
      color: '#7ed321', // green
      action: () => handleCardClick('app.directbilling', { tp: 'DG', context: 'frontoffice' })
    },
    {
      id: 'LabBilling',
      title: 'Lab Billing',
      icon: 'fa-list',
      show: permissions.LabBilling,
      color: '#bd10e0', // purple
      action: () => handleCardClick('app.opbilling-list', { tp: 'DG', context: 'frontoffice' })
    },
    {
      id: 'Admissions',
      title: 'Admissions',
      icon: 'fa-inr',
      count: items.AdmittedCount || 0,
      show: permissions.Admissions,
      color: '#d0021b', // red
      action: () => handleCardClick('app.admissions', { context: 'frontoffice' })
    },
    {
      id: 'BedTransfer',
      title: 'Bed Transfer',
      icon: 'fa-percent',
      show: permissions.BedTransfer,
      color: '#9013fe', // deep purple
      action: () => handleCardClick('app.bedtransfer-list', { context: 'frontoffice' })
    },
    {
      id: 'CurrentIpPatients',
      title: 'Current IP Patients',
      icon: 'fa-briefcase',
      count: items.TotalOccupancyCount || 0,
      show: permissions.CurrentIpPatients,
      color: '#ff5a5f', // coral
      action: () => handleCardClick('app.currentinpatients', { context: 'frontoffice' })
    },
    {
      id: 'FrontOfficeReports',
      title: 'Reports',
      icon: 'fa-file-text-o',
      show: permissions.FrontOfficeReports,
      color: '#8b572a', // brown
      action: () => handleCardClick('app.ipopreportstab.inpatientreport', { context: 'frontoffice' })
    }
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-modern)', backgroundColor: 'var(--premium-bg-light)', minHeight: '100vh', opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 600 }}>
            Front Office Dashboard
          </h4>
          <p style={{ margin: '4px 0 0', color: 'var(--premium-text-muted)', fontSize: '14px' }}>
            Overview of today's hospital operations
          </p>
        </div>
        {loading && (
          <div style={{ marginLeft: '20px', color: 'var(--premium-blue)', fontSize: '14px' }}>
            <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading metrics...
          </div>
        )}
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
            className="premium-glass-panel"
            style={{
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
              borderLeft: `5px solid ${card.color}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{ color: 'var(--premium-text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                {card.title.toUpperCase()}
              </div>
              {card.count !== undefined && (
                <div style={{ color: 'var(--premium-text-main)', fontSize: '28px', fontWeight: 700 }}>
                  {card.count}
                </div>
              )}
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: `${card.color}15`,
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
      <div className="premium-glass-panel" style={{
        overflow: 'hidden',
        maxWidth: '600px'
      }}>
        <div style={{
          backgroundColor: 'var(--premium-blue)',
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
              borderBottom: index === arr.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)'
            }}>
              <span style={{ color: 'var(--premium-text-muted)', fontSize: '14px', fontWeight: 500 }}>
                {row.label}
              </span>
              <span style={{ color: 'var(--premium-text-main)', fontSize: '15px', fontWeight: 600 }}>
                {row.value || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {showRegCumVisitWithBill && (
        <RegCumVisitWithBillScreen
          context={currentcontext}
          onClose={() => setShowRegCumVisitWithBill(false)}
        />
      )}
    </div>
  );
};
