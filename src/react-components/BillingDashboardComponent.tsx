import React, { useState, useEffect } from 'react';

interface PrivilegeMap {
  [key: string]: boolean;
}

interface BillingDashboardProps {
  privileges?: PrivilegeMap;
  context?: any;
  navigateTo?: (state: string, params?: any) => void;
}

import { apiFetch } from './utils/api';

export const BillingDashboardComponent: React.FC<BillingDashboardProps> = ({
  privileges = {},
  context = {},
  navigateTo
}) => {
  const [counts, setCounts] = useState({
    registration: '0',
    opbilling: '0',
    directbilling: '0',
    labbilling: '0',
    ipbilling: '0',
    dischargesipbilling: '0',
    admission: '0',
    ippatients: '0',
    reports: '0',
    TotalAdmissionCount: '0',
    AdmittedCount: '0',
    FitforDischargeCount: '0',
    ClinicalDischargeCount: '0',
    FinancialDischargeCount: '0',
    DischargeCount: '0',
    TotalOccupancyCount: '0'
  });

  const [latAdmsnData, setLatAdmsnData] = useState<any[]>([]);
  const [latDiscrgData, setLatDiscrgData] = useState<any[]>([]);
  const [latAvailbedData, setLatAvailbedData] = useState<any[]>([]);
  const [latDisclrData, setLatDisclrData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = (feature: string) => {
    return !!privileges[feature];
  };

  const nav = (route: string, params?: any) => {
    if (navigateTo) navigateTo(route, params);
  };

  useEffect(() => {
    if (!context.FacilityId) return;

    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setLoading(true);
      try {
        // 1. Dashboard counts (appointment, mycheckedin)
        const countsPayload = {
          Data: { Keys: [{ Key: 'appointment' }, { Key: 'mycheckedin' }] },
          Attributes: context
        };
        const countsReq = apiFetch('Visit/DoctorDashboard/GetDashboardOptions', countsPayload);

        // 2. Facility options
        const facilityPayload = {
          Data: { Keys: [{ Key: 'encounter' }, { Key: 'patient' }, { Key: 'appointment' }] },
          Attributes: context
        };
        const facilityReq = apiFetch('SystemSettings/facilitydashboard/GetFacilityDashboardOptions', facilityPayload);

        // 3. Encounters (Admissions)
        const admsnPayload = {
          Params: [
            { Key: 1, Value: context.FacilityId },
            { Key: 38, Value: "2, 3, 4, 5" },
            { Key: 17, Value: context.FromDate },
            { Key: 18, Value: context.ToDate }
          ],
          PageContext: { PageSize: 6, PageNumber: 1 }
        };
        const admsnReq = apiFetch('Visit/Visit/GetEncounters', admsnPayload);

        // 4. Encounters (Today discharges)
        const discrgPayload = {
          Params: [
            { Key: 1, Value: context.FacilityId },
            { Key: 3, Value: 6 },
            { Key: 28, Value: context.FromDate },
            { Key: 29, Value: context.ToDate }
          ],
          PageContext: { PageSize: 6, PageNumber: 1 }
        };
        const discrgReq = apiFetch('Visit/Visit/GetEncounters', discrgPayload);

        // 5. Available beds
        const bedsPayload = {
          Params: [
            { Key: 9, Value: 2 },
            { Key: 3, Value: context.FacilityId },
            { Key: 5, Value: 1 }
          ],
          PageContext: { PageSize: -1, PageNumber: 1 }
        };
        const bedsReq = apiFetch('GeneralMaster/WardRoomBedMaster/GetWardRoomBedMasters', bedsPayload);

        // 6. Discharge clearance
        const disclrPayload = {
          Params: [
            { Key: 1, Value: context.FacilityId },
            { Key: 3, Value: 4 },
            { Key: 28, Value: context.FromDate },
            { Key: 29, Value: context.ToDate }
          ],
          PageContext: { PageSize: 3, PageNumber: 1 }
        };
        const disclrReq = apiFetch('Visit/Visit/GetEncounters', disclrPayload);

        // 7. Occupancy count
        const occupancyPayload = {
          Params: [
            { Key: 2, Value: 1 },
            { Key: 6, Value: [2, 3, 4, 5] }
          ]
        };
        const occupancyReq = apiFetch('IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys', occupancyPayload);

        // 8. OP/DG Bill counts
        const opdPayload = {
          Data: { Keys: [{ Key: 'opbillbo' }] },
          Attributes: context
        };
        const opdReq = apiFetch('Registration/opddashboard/GetOPDDashboardOptions', opdPayload);

        // Run all requests concurrently
        const [
          _countsRes,
          facilityRes,
          admsnRes,
          discrgRes,
          bedsRes,
          disclrRes,
          occupancyRes,
          opdRes
        ] = await Promise.all([
          countsReq,
          facilityReq,
          admsnReq,
          discrgReq,
          bedsReq,
          disclrReq,
          occupancyReq,
          opdReq
        ]);

        if (!isMounted) return;

        setCounts(prevCounts => {
          const newCounts = { ...prevCounts };

          // Process Facility Options for IP Counts
          if (facilityRes && facilityRes.encounter) {
            const enc = facilityRes.encounter;
            newCounts.TotalAdmissionCount = enc.TotalAdmissionCount || '0';
            newCounts.DischargeCount = enc.DischargeCount || '0';
            newCounts.AdmittedCount = enc.AdmissionCount || '0';
            newCounts.admission = enc.AdmissionCount || '0';
            newCounts.FitforDischargeCount = enc.FitfordischargeCount || '0';
            newCounts.ClinicalDischargeCount = enc.ClinicaldischargeCount || '0';
            newCounts.FinancialDischargeCount = enc.FinancedischargeCount || '0';
          }

          if (facilityRes && facilityRes.patient) {
            newCounts.registration = facilityRes.patient.RegistrationCount || '0';
          }

          // Process OP/DG Bill Counts
          if (opdRes && opdRes.opbillbo) {
            newCounts.opbilling = String(opdRes.opbillbo.OPBillCount || 0);
            newCounts.labbilling = String(opdRes.opbillbo.DGBillCount || 0);
          }

          // Process Occupancy
          if (occupancyRes && occupancyRes.Data) {
            newCounts.TotalOccupancyCount = String(occupancyRes.Data.length || 0);
            newCounts.ippatients = String(occupancyRes.Data.length || 0);
          }

          return newCounts;
        });

        // Helper to format patient/doctor/ward details from encounters
        const formatEncounter = (item: any) => {
          let patientname = '';
          if (item.Patient) {
            if (item.Patient.Title) patientname = item.Patient.Title.Description + ' .';
            if (item.Patient.FirstName) patientname += ' ' + item.Patient.FirstName;
            if (item.Patient.LastName) patientname += ' ' + item.Patient.LastName;
          }

          let doctorname = '';
          if (item.Doctor) {
            if (item.Doctor.Title) doctorname = item.Doctor.Title.Description + ' .';
            if (item.Doctor.FirstName) doctorname += ' ' + item.Doctor.FirstName;
            if (item.Doctor.LastName) doctorname += ' ' + item.Doctor.LastName;
          }

          let warddetails = '';
          if (item.WardMaster) warddetails = item.WardMaster.WardName + ' - ';
          if (item.WardRoomMaster) warddetails += item.WardRoomMaster.RoomNo + ' - ';
          if (item.BedNo) warddetails += item.BedNo;

          return {
            ...item,
            patientname,
            doctorname,
            warddetails,
            encounterid: item.EncounterId,
            mrno: item.MRNo
          };
        };

        // Admissions list
        if (admsnRes && admsnRes.Data) {
          setLatAdmsnData(admsnRes.Data.map(formatEncounter));
        }

        // Discharges list
        if (discrgRes && discrgRes.Data) {
          const sorted = [...discrgRes.Data].sort((a: any, b: any) => {
            return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
          });
          setLatDiscrgData(sorted.map(formatEncounter));
        }

        // Available Beds formatting
        if (bedsRes && bedsRes.Data) {
          const grouped: Record<string, any[]> = {};
          bedsRes.Data.forEach((bed: any) => {
            const wId = bed.WardMasterId || 'unknown';
            if (!grouped[wId]) grouped[wId] = [];
            grouped[wId].push(bed);
          });

          const formattedBeds: any[] = [];
          Object.keys(grouped).forEach(wardId => {
            const wardBeds = grouped[wardId];
            if (wardBeds.length > 0) {
              let wardName = '';
              let roomNo = '';
              let bedsString = '';

              wardBeds.forEach((bed: any, idx: number) => {
                if (bed.WardMaster) wardName = bed.WardMaster.WardName + ' - ';
                if (bed.WardRoomMaster) roomNo = bed.WardRoomMaster.RoomNo + ' - ';
                if (bed.BedNo) bedsString += bed.BedNo;
                if (idx !== wardBeds.length - 1) bedsString += ',';
              });

              const fullWardDetails = wardName + roomNo + bedsString;
              formattedBeds.push({ availablebedinfo: fullWardDetails });
            }
          });
          setLatAvailbedData(formattedBeds);
        }

        // Discharge Clearance
        if (disclrRes && disclrRes.Data) {
          setLatDisclrData(disclrRes.Data.map(formatEncounter));
        }

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [context]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-modern)' }}>
        <i className="fa fa-spinner fa-spin fa-3x fa-fw" style={{ color: 'var(--premium-blue)' }}></i>
        <h4 style={{ color: 'var(--premium-text-main)', marginTop: '15px' }}>Loading Dashboard Data...</h4>
      </div>
    );
  }

  const cards = [
    {
      id: 'Registration',
      title: 'Registrations',
      icon: 'fa-registered',
      count: counts.registration,
      show: hasAccess('QuickRegistration'),
      color: '#4a90e2',
      action: () => nav('app.quickregistration', { context: 'billing' })
    },
    {
      id: 'OPbilling',
      title: 'OP Billings',
      icon: 'fa-user',
      count: counts.opbilling,
      show: hasAccess('Billing_OPPatients'),
      color: '#f5a623',
      action: () => nav('app.opbilling-list', { tp: 'OP', context: 'billing' })
    },
    {
      id: 'DirectBilling',
      title: 'Direct Billing',
      icon: 'fa-file-text-o',
      count: undefined,
      show: hasAccess('Billing_DirectBilling'),
      color: '#7ed321',
      action: () => nav('app.directbilling', { tp: 'DG', context: 'billing' })
    },
    {
      id: 'LabBilling',
      title: 'LAB/Radiology/Others',
      icon: 'fa-usd',
      count: counts.labbilling,
      show: hasAccess('Billing_LabBilling'),
      color: '#bd10e0',
      action: () => nav('app.opbilling-list', { tp: 'DG', context: 'billing' })
    },
    {
      id: 'IPBilling',
      title: 'IP Billing',
      icon: 'fa-list',
      count: undefined,
      show: hasAccess('billing_CurrentIpBilling'),
      color: '#50e3c2',
      action: () => nav('app.inpatient-billing', { context: 'billing' })
    },
    {
      id: 'DischargedIPBilling',
      title: 'Discharged IP Billing',
      icon: 'fa-inr',
      count: undefined,
      show: hasAccess('Discharged_IP_Billing'),
      color: '#e46a76',
      action: () => nav('app.discharged-patients', { context: 'billing' })
    },
    {
      id: 'Admissions',
      title: 'Admissions',
      icon: 'fa-percent',
      count: counts.admission,
      show: hasAccess('Billing_Admissions'),
      color: '#d0021b',
      action: () => nav('app.admissions', { context: 'billing' })
    },
    {
      id: 'CurrentIpPatients',
      title: 'Current IP Patients',
      icon: 'fa-briefcase',
      count: counts.ippatients,
      show: hasAccess('Billing_CurrentIPPatients'),
      color: '#ff5a5f',
      action: () => nav('app.currentinpatients', { context: 'billing' })
    },
    {
      id: 'Reports',
      title: 'Reports',
      icon: 'fa-file-text-o',
      count: undefined,
      show: hasAccess('BillingReports'),
      color: '#8b572a',
      action: () => nav('app.billingreportstab.opinvoicebillingreport', { context: 'billing' })
    }
  ];

  const renderTableCard = (title: string, children: React.ReactNode) => (
    <div className="premium-glass-panel" style={{
      padding: '20px',
      height: '350px', // fixed height for uniformity
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--premium-blue)', fontSize: '18px', fontWeight: 600 }}>
        {title}
      </h3>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {children}
      </div>
    </div>
  );

  const tableCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    fontSize: '14px',
    color: 'var(--premium-text-muted)'
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-modern)', backgroundColor: 'var(--premium-bg-light)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 600 }}>
            Billing Dashboard
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

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Today Admissions */}
        {renderTableCard("Admission", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {latAdmsnData.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong style={{color: 'var(--premium-text-main)'}}>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latAdmsnData.length === 0 && (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No Admissions</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Today Discharges */}
        {renderTableCard("Discharge", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {latDiscrgData.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong style={{color: 'var(--premium-text-main)'}}>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latDiscrgData.length === 0 && (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No Discharges</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Available Beds */}
        {renderTableCard("Beds", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {latAvailbedData.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>{item.availablebedinfo}</td>
                </tr>
              ))}
              {latAvailbedData.length === 0 && (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No Beds Available</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Discharge Clearance */}
        {renderTableCard("Discharge Clearance", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {latDisclrData.map((item, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>
                    <strong style={{color: 'var(--premium-text-main)'}}>{item.patientname} | ({item.Patient?.MRN})</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latDisclrData.length === 0 && (
                <tr><td style={{...tableCellStyle, textAlign: 'center'}}>No Clearances</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Occupancy Summary */}
        {renderTableCard("Occupancy Summary", 
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={tableCellStyle}>Total Admissions</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.TotalAdmissionCount}</td></tr>
              <tr><td style={tableCellStyle}>Today Admitted</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.AdmittedCount}</td></tr>
              <tr><td style={tableCellStyle}>Total Fit for Discharges</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.FitforDischargeCount}</td></tr>
              <tr><td style={tableCellStyle}>Total Clinical Discharges</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.ClinicalDischargeCount}</td></tr>
              <tr><td style={tableCellStyle}>Total Financial Discharges</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.FinancialDischargeCount}</td></tr>
              <tr><td style={tableCellStyle}>Today Discharges</td><td style={{...tableCellStyle, fontWeight: 600, color: 'var(--premium-text-main)'}}>{counts.DischargeCount}</td></tr>
              <tr style={{ backgroundColor: 'rgba(235, 178, 0, 0.1)' }}>
                <td style={{...tableCellStyle, fontWeight: 700, color: 'var(--premium-blue)'}}>Total Occupancy</td>
                <td style={{...tableCellStyle, fontWeight: 700, color: 'var(--premium-blue)'}}>{counts.TotalOccupancyCount}</td>
              </tr>
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};
