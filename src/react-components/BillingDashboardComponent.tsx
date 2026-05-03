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
    setLoading(true);

    const fetchData = async () => {
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

        // Run all requests concurrently
        const [
          countsRes,
          facilityRes,
          admsnRes,
          discrgRes,
          bedsRes,
          disclrRes,
          occupancyRes
        ] = await Promise.all([
          countsReq,
          facilityReq,
          admsnReq,
          discrgReq,
          bedsReq,
          disclrReq,
          occupancyReq
        ]);

        if (!isMounted) return;

        let newCounts = { ...counts };

        // Process Facility Options for IP Counts
        if (facilityRes && facilityRes.encounter) {
          const enc = facilityRes.encounter;
          newCounts.TotalAdmissionCount = enc.TotalAdmissionCount || '0';
          newCounts.DischargeCount = enc.DischargeCount || '0';
          newCounts.AdmittedCount = enc.AdmissionCount || '0';
          newCounts.FitforDischargeCount = enc.FitfordischargeCount || '0';
          newCounts.ClinicalDischargeCount = enc.ClinicaldischargeCount || '0';
          newCounts.FinancialDischargeCount = enc.FinancedischargeCount || '0';
        }

        // Process Occupancy
        if (occupancyRes && occupancyRes.Data) {
          newCounts.TotalOccupancyCount = String(occupancyRes.Data.length || 0);
        }

        setCounts(newCounts);

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
          if (item.WardRoomBedMaster) warddetails += item.WardRoomBedMaster.BedNo;

          return { ...item, patientname, doctorname, warddetails };
        };

        // Admissions
        if (admsnRes && admsnRes.Data) {
          setLatAdmsnData(admsnRes.Data.map(formatEncounter));
        }

        // Discharges
        if (discrgRes && discrgRes.Data) {
          let sorted = [...discrgRes.Data].sort((a: any, b: any) => {
            return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
          });
          setLatDiscrgData(sorted.map(formatEncounter));
        }

        // Available beds
        if (bedsRes && bedsRes.Data) {
          // Emulate the group-by WardId logic
          const bedsData = bedsRes.Data;
          const grouped: { [key: string]: any[] } = {};
          bedsData.forEach((bed: any) => {
            const wardId = bed.WardId;
            if (!grouped[wardId]) grouped[wardId] = [];
            grouped[wardId].push(bed);
          });

          const formattedBeds: any[] = [];
          Object.keys(grouped).forEach(wardId => {
            const wardBeds = grouped[wardId];
            if (wardBeds.length > 0) {
              // Group them into a string
              let fullWardDetails = '';
              let wardName = '';
              let roomNo = '';
              let bedsString = '';

              wardBeds.forEach((bed: any, idx: number) => {
                if (bed.WardMaster) wardName = bed.WardMaster.WardName + ' - ';
                if (bed.WardRoomMaster) roomNo = bed.WardRoomMaster.RoomNo + ' - ';
                if (bed.BedNo) bedsString += bed.BedNo;
                if (idx !== wardBeds.length - 1) bedsString += ',';
              });

              fullWardDetails = wardName + roomNo + bedsString;
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin fa-3x fa-fw" style={{ color: '#5d9cec' }}></i>
        <h4 style={{ color: '#666', marginTop: '15px' }}>Loading Dashboard Data...</h4>
      </div>
    );
  }

  return (
    <div>
      <div className="row page-header" style={{ margin: '0', padding: '15px', borderBottom: '1px solid #eee' }}>
        <h4 style={{ margin: 0, color: '#333' }}>Billing Dashboard</h4>
      </div>
      <div className="col-sm-12" style={{ marginTop: '20px' }}>
        <div className="card-flex-box-billing">
          {hasAccess('QuickRegistration') && (
            <div className="card-box-item box-bg-color1" onClick={() => nav('app.quickregistration', { context: 'billing' })}>
              <div className="card-box-header">
                <i className="fa fa-registered" aria-hidden="true"></i>
                <div>Registrations</div>
              </div>
              <div>{counts.registration}</div>
            </div>
          )}
          {hasAccess('Billing_OPPatients') && (
            <div className="card-box-item box-bg-color2" onClick={() => nav('app.opbilling-list', { tp: 'OP', context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-user" aria-hidden="true"></i></div>
                <div>OP Billings</div>
              </div>
              <div>{counts.opbilling}</div>
            </div>
          )}
          {hasAccess('Billing_DirectBilling') && (
            <div className="card-box-item box-bg-color3" onClick={() => nav('app.directbilling', { tp: 'DG', context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-file-text-o" aria-hidden="true"></i></div>
                <div>Direct Billing</div>
              </div>
              <div>{counts.directbilling}</div>
            </div>
          )}
          {hasAccess('Billing_LabBilling') && (
            <div className="card-box-item box-bg-color4" onClick={() => nav('app.opbilling-list', { tp: 'DG', context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-usd" aria-hidden="true"></i></div>
                <div>LAB/Radiology/Others</div>
              </div>
              <div>{counts.labbilling}</div>
            </div>
          )}
          {hasAccess('billing_CurrentIpBilling') && (
            <div className="card-box-item box-bg-color5" onClick={() => nav('app.inpatient-billing', { context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-list" aria-hidden="true"></i></div>
                <div>IP Billing</div>
              </div>
              <div>{counts.ipbilling}</div>
            </div>
          )}
          {hasAccess('Discharged_IP_Billing') && (
            <div className="card-box-item box-bg-color6" onClick={() => nav('app.discharged-patients', { context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-inr" aria-hidden="true"></i></div>
                <div>Discharged IP Billing</div>
              </div>
              <div>{counts.dischargesipbilling}</div>
            </div>
          )}
          {hasAccess('Billing_Admissions') && (
            <div className="card-box-item box-bg-color7" onClick={() => nav('app.admissions', { context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-percent" aria-hidden="true"></i></div>
                <div>Admissions</div>
              </div>
              <div>{counts.admission}</div>
            </div>
          )}
          {hasAccess('Billing_CurrentIPPatients') && (
            <div className="card-box-item box-bg-color8" onClick={() => nav('app.currentinpatients', { context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-briefcase" aria-hidden="true"></i></div>
                <div>Current IP Patients</div>
              </div>
              <div>{counts.ippatients}</div>
            </div>
          )}
          {hasAccess('BillingReports') && (
            <div className="card-box-item box-bg-color9" onClick={() => nav('app.billingreportstab.opinvoicebillingreport', { context: 'billing' })}>
              <div className="card-box-header">
                <div><i className="fa fa-file-text-o" aria-hidden="true"></i></div>
                <div>Reports</div>
              </div>
              <div>{counts.reports}</div>
            </div>
          )}
        </div>
      </div>

      <div className="col-sm-12" style={{ marginTop: '20px' }}>
        <div className="col-sm-6">
          <table id="bannerdetails" style={{ marginTop: '20px', background: '#5d9cec', color: '#fff', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Admission</td>
              </tr>
            </tbody>
          </table>
          <table id="bannerdetails" style={{ width: '100%', border: '1px solid #ddd' }}>
            <tbody>
              {latAdmsnData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>
                    <strong>{item.patientname} | ( {item.Patient?.MRN} )</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latAdmsnData.length === 0 && (
                <tr><td style={{ padding: '8px', textAlign: 'center', color: '#777' }}>No Admissions</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="col-sm-6">
          <table id="bannerdetails" style={{ marginTop: '20px', background: '#5d9cec', color: '#fff', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Discharge</td>
              </tr>
            </tbody>
          </table>
          <table id="bannerdetails" style={{ width: '100%', border: '1px solid #ddd' }}>
            <tbody>
              {latDiscrgData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>
                    <strong>{item.patientname} | ( {item.Patient?.MRN} )</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latDiscrgData.length === 0 && (
                <tr><td style={{ padding: '8px', textAlign: 'center', color: '#777' }}>No Discharges</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-sm-12">
        <div className="col-sm-6">
          <table id="bannerdetails" style={{ marginTop: '20px', background: '#5d9cec', color: '#fff', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Beds</td>
              </tr>
            </tbody>
          </table>
          <table id="bannerdetails" style={{ width: '100%', border: '1px solid #ddd' }}>
            <tbody>
              {latAvailbedData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{item.availablebedinfo}</td>
                </tr>
              ))}
              {latAvailbedData.length === 0 && (
                <tr><td style={{ padding: '8px', textAlign: 'center', color: '#777' }}>No Beds Available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="col-sm-6">
          <table id="bannerdetails" style={{ marginTop: '20px', background: '#5d9cec', color: '#fff', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Discharge Clearance</td>
              </tr>
            </tbody>
          </table>
          <table id="bannerdetails" style={{ width: '100%', border: '1px solid #ddd' }}>
            <tbody>
              {latDisclrData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>
                    <strong>{item.patientname} | ( {item.Patient?.MRN} )</strong> | {item.Patient?.Age} Years | {item.VisitIdentifier} - {item.doctorname} | {item.warddetails}
                  </td>
                </tr>
              ))}
              {latDisclrData.length === 0 && (
                <tr><td style={{ padding: '8px', textAlign: 'center', color: '#777' }}>No Clearances</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="col-sm-6">
          <table id="bannerdetails" style={{ marginTop: '20px', background: '#5d9cec', color: '#fff', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Occupancy Summary</td>
              </tr>
            </tbody>
          </table>
          <table id="bannerdetails" style={{ width: '100%', border: '1px solid #ddd' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Total Admissions</td><td style={{ padding: '8px' }}>{counts.TotalAdmissionCount}</td></tr>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Today Admitted</td><td style={{ padding: '8px' }}>{counts.AdmittedCount}</td></tr>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Total FitforDischarges</td><td style={{ padding: '8px' }}>{counts.FitforDischargeCount}</td></tr>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Total ClinicalDischarges</td><td style={{ padding: '8px' }}>{counts.ClinicalDischargeCount}</td></tr>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Total FinancialDischarges</td><td style={{ padding: '8px' }}>{counts.FinancialDischargeCount}</td></tr>
              <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>Today Discharges</td><td style={{ padding: '8px' }}>{counts.DischargeCount}</td></tr>
              <tr><td style={{ padding: '8px' }}>Total Occupancy</td><td style={{ padding: '8px' }}>{counts.TotalOccupancyCount}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="fooder-bgs"></div>
    </div>
  );
};
