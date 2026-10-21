import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface RadiologyCriticalValuesProps {
  reactProps?: {
    rows?: any[];
    items?: any[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      FromDate?: string;
      ToDate?: string;
      PatWoNum?: string;
      EncounterTypeId?: number;
      SubDepartmentId?: number;
    };
    lookup?: {
      EncounterType?: Array<{ Id: number | string; Text: string }>;
      Department?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: any) => void;
}

export interface CriticalFindingRow {
  Id: number;
  WorkOrderdid?: string;
  OrderNumber?: string;
  BillNumber?: string;
  EncounterType?: string;
  OrderRequestDate?: string;
  PatientMrn?: string;
  PatientName?: string;
  Age?: number;
  Gender?: string;
  TestDetails?: string;
  AnalyteName?: string;
  Resultvalue?: string;
  AnalyteUOM?: string;
  OrderedBy?: string;
  CriticalFinding?: string;
  EscalationStatus?: 'Acknowledged' | 'Notified' | 'Pending Call';
}

const safeFormatDate = (val: any): string => {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) {
    try {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};

export const RadiologyCriticalValuesScreen: React.FC<RadiologyCriticalValuesProps> = ({
  reactProps,
  onAction,
  onNavigate,
}) => {
  const [fromDate, setFromDate] = useState<string>(
    safeFormatDate(reactProps?.currentfilter?.FromDate)
  );
  const [toDate, setToDate] = useState<string>(
    safeFormatDate(reactProps?.currentfilter?.ToDate)
  );
  const [searchQuery, setSearchQuery] = useState<string>(reactProps?.currentfilter?.PatWoNum || '');
  const [encounterTypeId, setEncounterTypeId] = useState<number>(reactProps?.currentfilter?.EncounterTypeId || -1);
  const [subDepartmentId, setSubDepartmentId] = useState<number>(reactProps?.currentfilter?.SubDepartmentId || -1);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [loading, setLoading] = useState<boolean>(false);

  // Fallback demo/mock data if no records returned from backend
  const [rows, setRows] = useState<CriticalFindingRow[]>([
    {
      Id: 1,
      WorkOrderdid: 'RAD-WO-2026-0045',
      OrderNumber: 'ORD-98841',
      BillNumber: 'BL-4401',
      EncounterType: 'Emergency / Casualty',
      OrderRequestDate: '2026-10-17 07:15',
      PatientMrn: 'UHID-88102',
      PatientName: 'Sanjay Behera',
      Age: 48,
      Gender: 'Male',
      TestDetails: 'CT Brain Non-Contrast (NCCT)',
      AnalyteName: 'Acute Intracranial Hemorrhage',
      Resultvalue: 'Acute Subdural Hematoma (8mm shift)',
      AnalyteUOM: 'mm',
      OrderedBy: 'Dr. B. K. Jena (ER Consultant)',
      CriticalFinding: 'Mass effect with 8mm midline shift towards left; Urgent Neuro consult required',
      EscalationStatus: 'Notified',
    },
    {
      Id: 2,
      WorkOrderdid: 'RAD-WO-2026-0048',
      OrderNumber: 'ORD-98852',
      BillNumber: 'BL-4412',
      EncounterType: 'Inpatient (ICU)',
      OrderRequestDate: '2026-10-17 07:45',
      PatientMrn: 'UHID-88129',
      PatientName: 'Priyanka Mohanty',
      Age: 32,
      Gender: 'Female',
      TestDetails: 'Portable Digital X-Ray Chest Bedside',
      AnalyteName: 'Pneumothorax Alert',
      Resultvalue: 'Large Right Tension Pneumothorax (>40%)',
      AnalyteUOM: '%',
      OrderedBy: 'Dr. S. K. Mahapatra (Critical Care)',
      CriticalFinding: 'Complete collapse of right upper and middle lobes with mediastinal shift',
      EscalationStatus: 'Acknowledged',
    },
    {
      Id: 3,
      WorkOrderdid: 'RAD-WO-2026-0051',
      OrderNumber: 'ORD-98860',
      BillNumber: 'BL-4425',
      EncounterType: 'Outpatient (OPD)',
      OrderRequestDate: '2026-10-17 08:30',
      PatientMrn: 'UHID-88144',
      PatientName: 'Narayan Rao',
      Age: 67,
      Gender: 'Male',
      TestDetails: 'CT Pulmonary Angiography (CTPA)',
      AnalyteName: 'Pulmonary Embolism Flag',
      Resultvalue: 'Bilateral Saddle Embolus',
      AnalyteUOM: 'Present',
      OrderedBy: 'Dr. P. C. Tripathy (Cardiology)',
      CriticalFinding: 'Large filling defect extending into main and bifurcation branches of pulmonary trunk',
      EscalationStatus: 'Pending Call',
    },
  ]);

  const encounterTypes = reactProps?.lookup?.EncounterType || [
    { Id: -1, Text: 'All Patient / Visit Types' },
    { Id: 1, Text: 'Outpatient (OPD)' },
    { Id: 2, Text: 'Inpatient (IPD)' },
    { Id: 3, Text: 'Emergency / Casualty' },
  ];

  const departments = reactProps?.lookup?.Department || [
    { Id: -1, Text: 'All Radiology Modalities' },
    { Id: 62, Text: 'Digital Radiography (X-Ray)' },
    { Id: 63, Text: 'CT Scan' },
    { Id: 64, Text: 'MRI Imaging' },
    { Id: 65, Text: 'Ultrasound / Color Doppler' },
  ];

  const facilityName = sessionHelper.getCurrentFacilityName() || 'SHUVADARSINI HOSPITAL';

  // Synchronize incoming reactProps
  useEffect(() => {
    if (reactProps?.rows && Array.isArray(reactProps.rows) && reactProps.rows.length > 0) {
      const mapped: CriticalFindingRow[] = reactProps.rows.map((r: any, idx: number) => ({
        Id: r.Id || idx + 1,
        WorkOrderdid: r.PatientWorkorder?.WorkOrderdid || r.WorkOrderdid || '—',
        OrderNumber: r.PatientOrder?.OrderNumber || r.OrderNumber || '—',
        BillNumber: r.PatientOrder?.BillNumber || r.BillNumber || '—',
        EncounterType: r.PatientOrder?.Encounter?.EncounterType?.Description || r.EncounterType || 'Inpatient',
        OrderRequestDate: r.PatientOrder?.OrderRequestDate || r.OrderRequestDate || '—',
        PatientMrn: r.Patient?.MRN || r.MRN || '—',
        PatientName: r.Patient
          ? `${r.Patient.Title?.Description || ''} ${r.Patient.FirstName} ${r.Patient.LastName || ''}`.trim()
          : 'Patient',
        Age: r.Patient?.Age,
        Gender: r.Patient?.Gender?.Description,
        TestDetails: r.PatientWorkorderdetail?.TestName || r.TestName || 'Radiology Examination',
        AnalyteName: r.AnalyteName || 'Critical Observation',
        Resultvalue: r.Resultvalue || 'Critical Finding',
        AnalyteUOM: r.PatientWorkorderdetail?.AnalyteUOM || '',
        OrderedBy: r.PatientOrder?.DoctorName || r.DoctorName || 'Attending Physician',
        CriticalFinding: r.Comments || 'STAT finding escalated to ordering clinician',
        EscalationStatus: r.IsAcknowledged ? 'Acknowledged' : 'Notified',
      }));
      setRows(mapped);
    }
  }, [reactProps?.rows]);

  const handleFilter = () => {
    if (onAction) {
      onAction('filter', {
        FromDate: fromDate,
        ToDate: toDate,
        PatWoNum: searchQuery,
        EncounterTypeId: encounterTypeId,
        SubDepartmentId: subDepartmentId,
        currentPage,
        pageSize,
      });
    }
  };

  const handleBack = () => {
    if (onAction) {
      onAction('back');
    } else if (onNavigate) {
      onNavigate('app.ris_dashboard');
    } else {
      window.location.hash = '#/app/ris_dashboard';
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.PatientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.PatientMrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.WorkOrderdid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.AnalyteName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [rows, searchQuery]);

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '24px 32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-arrow-left" /> Back to Dashboard
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                Radiology Critical Findings & STAT Value Tracker
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa fa-bell" /> {filteredRows.length} URGENT ALERTS
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
              Facility: <b>{facilityName}</b> &bull; Quality Management & Emergency Clinician Notification Protocol
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleFilter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
          }}
        >
          <i className="fa fa-refresh" /> Refresh Alerts
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Encounter Type */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              Visit / Encounter Type
            </label>
            <select
              value={encounterTypeId}
              onChange={(e) => setEncounterTypeId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              {encounterTypes.map((et) => (
                <option key={et.Id} value={et.Id}>
                  {et.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              Radiology Modality
            </label>
            <select
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              {departments.map((d) => (
                <option key={d.Id} value={d.Id}>
                  {d.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              Patient Name / UHID / Accession
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-search"
                style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8', fontSize: '12px' }}
              />
              <input
                type="text"
                placeholder="Search patient, finding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Findings Data Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', width: '50px' }}>#</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', width: '150px' }}>Accession / WorkOrder</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Patient Details</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Requested Study</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Critical Observation</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Ordering Clinician</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', width: '130px' }}>Notification Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right', width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No critical radiological findings recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={row.Id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: row.EscalationStatus === 'Pending Call' ? '#fff1f2' : 'transparent',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                        {row.WorkOrderdid}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Order: {row.OrderNumber}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.PatientName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {row.PatientMrn} &bull; {row.Age ? `${row.Age}y` : ''} {row.Gender || ''} &bull; <b style={{ color: '#0284c7' }}>{row.EncounterType}</b>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{row.TestDetails}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Requested: {row.OrderRequestDate}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#dc2626',
                          }}
                        />
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>{row.AnalyteName}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 600, marginTop: '2px' }}>
                        {row.Resultvalue} {row.AnalyteUOM}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                      {row.OrderedBy}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor:
                            row.EscalationStatus === 'Acknowledged'
                              ? '#dcfce7'
                              : row.EscalationStatus === 'Notified'
                              ? '#e0f2fe'
                              : '#fee2e2',
                          color:
                            row.EscalationStatus === 'Acknowledged'
                              ? '#15803d'
                              : row.EscalationStatus === 'Notified'
                              ? '#0369a1'
                              : '#dc2626',
                        }}
                      >
                        {row.EscalationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onAction) onAction('view', row);
                          else window.location.hash = '#/app/allorders/2';
                        }}
                        style={{
                          padding: '5px 12px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0284c7',
                          cursor: 'pointer',
                        }}
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
