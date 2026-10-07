import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

export interface EncounterDoctorItem {
  Id?: number;
  EncounterId?: number;
  PatientId?: number;
  DoctorId?: number;
  TokenNo?: string | number;
  RegisterType?: string;
  EncounterDoctorStatus?: string | number;
  ConsultationStatusId?: number;
  ConsultationStatus?: {
    Id?: number;
    Description?: string;
  };
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Age?: number | string;
    RegisteredDate?: string;
    Title?: {
      Id?: number;
      Description?: string;
    };
    Gender?: {
      Id?: number;
      Description?: string;
    };
  };
  Doctor?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: {
      Id?: number;
      Description?: string;
    };
  };
  Department?: {
    Id?: number;
    DepartmentName?: string;
  };
  Encounter?: {
    Id?: number;
    EncounterId?: number;
    AdmissionDate?: string;
    BillingRemarks?: string;
    BillingStatusId?: number;
    BillingStatus?: {
      Id?: number;
      Description?: string;
    };
    VisitIdentifier?: string;
  };
  Appointment?: {
    AppointmentDisplays?: Array<{
      TokenNo?: string | number;
    }>;
  };
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

export interface OpVisitBillLinkScreenProps {
  reactProps?: {
    items?: EncounterDoctorItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      Department?: LookupOption[];
      BillingStatus?: LookupOption[];
      [key: string]: any;
    };
    currentfilter?: {
      facilityid?: number;
      DoctorId?: number;
      FromDate?: string;
      ToDate?: string;
      BillingStatusId?: number;
      PatientId?: number;
      DepartmentId?: number;
      patientname?: string;
      consultationstatusid?: number;
    };
    loading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const formatDateToInput = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateVal?: string): string => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return String(dateVal);
  }
};

export const OpVisitBillLinkScreen: React.FC<OpVisitBillLinkScreenProps> = ({
  reactProps,
  onAction
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Current date strings
  const todayStr = useMemo(() => formatDateToInput(new Date()), []);

  // Filter States
  const [fromDate, setFromDate] = useState<string>(
    reactProps?.currentfilter?.FromDate ? formatDateToInput(new Date(reactProps.currentfilter.FromDate)) : todayStr
  );
  const [toDate, setToDate] = useState<string>(
    reactProps?.currentfilter?.ToDate ? formatDateToInput(new Date(reactProps.currentfilter.ToDate)) : todayStr
  );
  const [doctorId, setDoctorId] = useState<number>(reactProps?.currentfilter?.DoctorId ?? -1);
  const [departmentId, setDepartmentId] = useState<number>(reactProps?.currentfilter?.DepartmentId ?? -1);
  const [billingStatusId, setBillingStatusId] = useState<number>(reactProps?.currentfilter?.BillingStatusId ?? 1);
  const [patientSearch, setPatientSearch] = useState<string>(reactProps?.currentfilter?.patientname || '');
  const [activeTab, setActiveTab] = useState<string>('pending'); // 'all' | 'pending' | 'billed' | 'cancelled'

  // Standalone list and pagination state
  const [items, setItems] = useState<EncounterDoctorItem[]>(reactProps?.items || []);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [loading, setLoading] = useState<boolean>(reactProps?.loading || false);

  // Lookups state
  const [departments, setDepartments] = useState<LookupOption[]>(reactProps?.lookup?.Department || []);
  const [billingStatuses, setBillingStatuses] = useState<LookupOption[]>(reactProps?.lookup?.BillingStatus || []);
  const [doctorsList, setDoctorsList] = useState<LookupOption[]>([]);

  // Sync props from AngularJS bridge
  useEffect(() => {
    if (reactProps?.items !== undefined) {
      setItems(reactProps.items);
    }
    if (reactProps?.totalItems !== undefined) {
      setTotalItems(reactProps.totalItems);
    }
    if (reactProps?.currentPage !== undefined) {
      setCurrentPage(reactProps.currentPage);
    }
    if (reactProps?.pageSize !== undefined) {
      setPageSize(reactProps.pageSize);
    }
    if (reactProps?.lookup?.Department) {
      setDepartments(reactProps.lookup.Department);
    }
    if (reactProps?.lookup?.BillingStatus) {
      setBillingStatuses(reactProps.lookup.BillingStatus);
    }
    if (reactProps?.loading !== undefined) {
      setLoading(reactProps.loading);
    }
  }, [reactProps]);

  // Load Lookups in Standalone mode
  useEffect(() => {
    if (isBridged && departments.length > 0) return;

    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const res = await apiFetch<any>('General/Options/getoptions', [
          {
            Key: 'Department',
            Request: { Params: [{ Key: 3, Value: 1 }] }
          },
          {
            Key: 'BillingStatus'
          }
        ]);
        if (isMounted && res) {
          if (res.Department) setDepartments(res.Department);
          if (res.BillingStatus) setBillingStatuses(res.BillingStatus);
        }

        // Fetch doctors
        const docRes = await apiFetch<any>('SystemSettings/User/GetUsers', {
          Params: [{ Key: 3, Value: 2 }],
          PageContext: { PageSize: 100, PageNumber: 1 }
        });
        if (isMounted && docRes?.Data) {
          const docs: LookupOption[] = docRes.Data.map((d: any) => ({
            Id: d.Id || d.UserId,
            Text: [d.Title?.Description, d.FirstName, d.LastName].filter(Boolean).join(' ') || d.UserName
          }));
          setDoctorsList(docs);
        }
      } catch (err) {
        console.error('Error fetching lookups:', err);
      }
    };

    fetchLookups();
    return () => { isMounted = false; };
  }, [isBridged]);

  // Standalone Fetch
  const fetchListStandalone = useCallback(async () => {
    setLoading(true);
    try {
      const fromFormatted = `${fromDate} 00:00:00`;
      const toFormatted = `${toDate} 23:59:59`;

      const params: any[] = [
        { Key: 2, Value: { AppointmentStatus: 6, My: false } },
        { Key: 10, Value: 1 },
        { Key: 20, Value: 1 }
      ];

      if (!patientSearch) {
        params.push({ Key: 22, Value: [fromFormatted, toFormatted] });
      }
      if (doctorId > 0) {
        params.push({ Key: 13, Value: doctorId });
      }
      if (departmentId > 0) {
        params.push({ Key: 12, Value: departmentId });
      }
      if (billingStatusId > 0) {
        params.push({ Key: 34, Value: billingStatusId });
      }

      const res = await apiFetch<any>('Visit/EncounterDoctor/GetEncounterDoctors', {
        Params: params,
        PageContext: { PageSize: pageSize, PageNumber: currentPage }
      });

      if (res?.Data) {
        const enriched = res.Data.map((item: any) => {
          let tokenNo = '';
          if (item.Appointment?.AppointmentDisplays?.length > 0) {
            tokenNo = item.Appointment.AppointmentDisplays[0].TokenNo || '';
          }
          let registerType = 'Follow Up';
          if (item.Patient?.RegisteredDate) {
            const regD = new Date(item.Patient.RegisteredDate).toDateString();
            const nowD = new Date().toDateString();
            if (regD === nowD) registerType = 'New';
          }
          return {
            ...item,
            TokenNo: tokenNo,
            RegisterType: registerType
          };
        });
        setItems(enriched);
        setTotalItems(res.PageContext?.TotalRecords || enriched.length);
      }
    } catch (err) {
      console.error('Error loading encounters:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, doctorId, departmentId, billingStatusId, patientSearch, pageSize, currentPage]);

  useEffect(() => {
    if (!isBridged) {
      fetchListStandalone();
    }
  }, [isBridged, fetchListStandalone]);

  // Handle Tab Switch
  const handleTabChange = (tabKey: string, statusId: number) => {
    setActiveTab(tabKey);
    setBillingStatusId(statusId);

    if (onAction) {
      onAction('filterChange', {
        BillingStatusId: statusId,
        FromDate: fromDate,
        ToDate: toDate,
        DoctorId: doctorId,
        DepartmentId: departmentId,
        patientname: patientSearch
      });
    }
  };

  // Handle Filter Submit
  const handleSearch = () => {
    if (onAction) {
      onAction('filterChange', {
        FromDate: fromDate,
        ToDate: toDate,
        DoctorId: doctorId,
        DepartmentId: departmentId,
        BillingStatusId: billingStatusId,
        patientname: patientSearch
      });
    } else {
      fetchListStandalone();
    }
  };

  // Quick Date Range helper
  const handleDatePreset = (preset: 'today' | 'yesterday' | 'week' | 'month') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'today') {
      // today
    } else if (preset === 'yesterday') {
      start.setDate(now.getDate() - 1);
      end.setDate(now.getDate() - 1);
    } else if (preset === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (preset === 'month') {
      start.setDate(now.getDate() - 30);
    }

    const startStr = formatDateToInput(start);
    const endStr = formatDateToInput(end);
    setFromDate(startStr);
    setToDate(endStr);

    if (onAction) {
      onAction('filterChange', {
        FromDate: startStr,
        ToDate: endStr,
        DoctorId: doctorId,
        DepartmentId: departmentId,
        BillingStatusId: billingStatusId,
        patientname: patientSearch
      });
    }
  };

  // Actions
  const handleBillingClick = (item: EncounterDoctorItem) => {
    const payload = {
      ...item,
      EncounterId: item.EncounterId || item.Encounter?.Id || item.Id,
      PatientId: item.PatientId || item.Patient?.Id,
      DoctorId: item.DoctorId || (item as any).Doctor?.Id || (item as any).DoctorId
    };
    if (onAction) {
      onAction('billing', payload);
    } else {
      alert(`Opening Consultation Billing for Encounter #${payload.EncounterId} - Patient: ${item.Patient?.FirstName || ''}`);
    }
  };

  const handlePatientInfo = (item: EncounterDoctorItem) => {
    if (onAction) {
      onAction('patientinfo', item);
    }
  };

  // Derived metrics
  const pendingCount = useMemo(() => {
    return items.filter(i => {
      const bStatus = i.Encounter?.BillingStatusId ?? i.Encounter?.BillingStatus?.Id;
      return bStatus === 1 || !bStatus;
    }).length;
  }, [items]);

  const billedCount = useMemo(() => {
    return items.filter(i => {
      const bStatus = i.Encounter?.BillingStatusId ?? i.Encounter?.BillingStatus?.Id;
      return bStatus === 2;
    }).length;
  }, [items]);

  const newPatientCount = useMemo(() => {
    return items.filter(i => i.RegisterType === 'New').length;
  }, [items]);

  // Tab Definitions
  const tabs = [
    { key: 'pending', label: 'Pending Billing', statusId: 1, icon: '⏳', count: pendingCount },
    { key: 'all', label: 'All Visits', statusId: -1, icon: '📋', count: totalItems || items.length },
    { key: 'billed', label: 'Billed / Completed', statusId: 2, icon: '✅', count: billedCount },
    { key: 'cancelled', label: 'Cancelled / Others', statusId: 3, icon: '🚫', count: 0 }
  ];

  return (
    <div style={{
      fontFamily: typography.fontFamily,
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '24px 28px',
      color: colors.textMain,
      boxSizing: 'border-box'
    }}>
      {/* Top Header Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: radii.xl,
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
        marginBottom: spacing['6'],
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: radii.lg,
            backgroundColor: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 20,
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
          }}>
            💳
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}>
              OP Visit Details & Bill Linking
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: 13, color: '#64748b' }}>
              Manage outpatient visit encounters, link consultation charges, and verify billing statuses.
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: radii.lg,
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
              Total Visits
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {totalItems || items.length}
            </span>
          </div>

          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: radii.lg,
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
              Pending Bill
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#b45309' }}>
              {pendingCount}
            </span>
          </div>

          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #d1fae5',
            borderRadius: radii.lg,
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
              New Registrations
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#047857' }}>
              {newPatientCount}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: radii.xl,
        border: '1px solid #e2e8f0',
        padding: '6px 8px',
        marginBottom: spacing['5'],
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key, tab.statusId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: radii.lg,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0284c7' : '#64748b',
                backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: isActive ? '#0284c7' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#475569',
                padding: '2px 7px',
                borderRadius: radii.full,
                fontSize: 11,
                fontWeight: 600
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: radii.xl,
        border: '1px solid #e2e8f0',
        padding: '18px 22px',
        marginBottom: spacing['6'],
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {/* Date presets */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
              Quick Dates:
            </span>
            {(['today', 'yesterday', 'week', 'month'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handleDatePreset(p)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: radii.sm,
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {p === 'today' ? 'Today' : p === 'yesterday' ? 'Yesterday' : p === 'week' ? 'Last 7 Days' : 'This Month'}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Filter by doctor, department, or patient identifier
          </span>
        </div>

        {/* Inputs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          alignItems: 'flex-end'
        }}>
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Doctor */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Doctor
            </label>
            <select
              value={doctorId}
              onChange={e => setDoctorId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value={-1}>All Doctors</option>
              {doctorsList.map(doc => (
                <option key={doc.Id} value={doc.Id}>{doc.Text}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Department
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value={-1}>All Departments</option>
              {departments.map(dept => (
                <option key={dept.Id} value={dept.Id}>{dept.Text}</option>
              ))}
            </select>
          </div>

          {/* Billing Status */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Billing Status
            </label>
            <select
              value={billingStatusId}
              onChange={e => setBillingStatusId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value={-1}>All Statuses</option>
              {billingStatuses.map(status => (
                <option key={status.Id} value={status.Id}>{status.Text}</option>
              ))}
            </select>
          </div>

          {/* Patient Search */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Patient Name / MRN
            </label>
            <input
              type="text"
              placeholder="Search MRN or name..."
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                fontSize: 13,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleSearch}
              style={{
                flex: 1,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: radii.md,
                padding: '9px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0369a1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0284c7'}
            >
              <span>🔍</span> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setFromDate(todayStr);
                setToDate(todayStr);
                setDoctorId(-1);
                setDepartmentId(-1);
                setBillingStatusId(-1);
                setPatientSearch('');
                setActiveTab('all');
                if (onAction) {
                  onAction('filterChange', {
                    FromDate: todayStr,
                    ToDate: todayStr,
                    DoctorId: -1,
                    DepartmentId: -1,
                    BillingStatusId: -1,
                    patientname: ''
                  });
                }
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: radii.md,
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer'
              }}
              title="Reset Filters"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: radii.xl,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 28, marginBottom: 8, animation: 'spin 1s infinite linear' }}>⏳</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Loading outpatient encounters...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#0f172a' }}>No Outpatient Visits Found</h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              Try adjusting your date range, doctor, or billing status filter above.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: 13
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600
                }}>
                  <th style={{ padding: '12px 14px', width: 45 }}>#</th>
                  <th style={{ padding: '12px 14px' }}>Patient Name</th>
                  <th style={{ padding: '12px 14px' }}>Age / Sex</th>
                  <th style={{ padding: '12px 14px' }}>Patient ID</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Visit Date & Time</th>
                  <th style={{ padding: '12px 14px' }}>Doctor</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Consultation</th>
                  <th style={{ padding: '12px 14px' }}>Billing Remarks</th>
                  <th style={{ padding: '12px 14px' }}>Billing Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const patientFullName = [
                    item.Patient?.Title?.Description,
                    item.Patient?.FirstName,
                    item.Patient?.LastName
                  ].filter(Boolean).join(' ') || 'Unnamed Patient';

                  const doctorFullName = [
                    item.Doctor?.Title?.Description,
                    item.Doctor?.FirstName,
                    item.Doctor?.LastName
                  ].filter(Boolean).join(' ') || item.DoctorName || 'Not Assigned';

                  const isNew = item.RegisterType === 'New';
                  const billingStatusDesc = item.Encounter?.BillingStatus?.Description || 'Pending';
                  const isBilled = billingStatusDesc.toLowerCase().includes('bill') || item.Encounter?.BillingStatusId === 2;

                  return (
                    <tr
                      key={item.Id || item.EncounterId || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* S.No */}
                      <td style={{ padding: '12px 14px', color: '#94a3b8', fontWeight: 500 }}>
                        {((currentPage - 1) * pageSize) + idx + 1}
                      </td>

                      {/* Patient Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          onClick={() => handlePatientInfo(item)}
                          style={{
                            fontWeight: 600,
                            color: '#0284c7',
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                        >
                          {patientFullName}
                        </span>
                      </td>

                      {/* Age / Sex */}
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {item.Patient?.Age ? `${item.Patient.Age} yrs` : '—'} / {item.Patient?.Gender?.Description || '—'}
                      </td>

                      {/* Patient ID */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          backgroundColor: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 12,
                          color: '#0f172a'
                        }}>
                          {item.Patient?.MRN || '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: radii.full,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: isNew ? '#ecfdf5' : '#f1f5f9',
                          color: isNew ? '#059669' : '#475569',
                          border: `1px solid ${isNew ? '#a7f3d0' : '#e2e8f0'}`
                        }}>
                          {item.RegisterType || 'Follow Up'}
                        </span>
                      </td>

                      {/* Visit Date */}
                      <td style={{ padding: '12px 14px', color: '#334155', whiteSpace: 'nowrap' }}>
                        {formatDisplayDate(item.Encounter?.AdmissionDate)}
                      </td>

                      {/* Doctor */}
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#0f172a' }}>
                        {doctorFullName}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {item.Department?.DepartmentName || '—'}
                      </td>

                      {/* Consultation Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: radii.md,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor: '#f1f5f9',
                          color: '#334155'
                        }}>
                          {item.ConsultationStatus?.Description || 'Pending'}
                        </span>
                      </td>

                      {/* Billing Remarks */}
                      <td style={{ padding: '12px 14px', color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.Encounter?.BillingRemarks || '—'}
                      </td>

                      {/* Billing Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: radii.full,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: isBilled ? '#ecfdf5' : '#fffbeb',
                          color: isBilled ? '#059669' : '#b45309',
                          border: `1px solid ${isBilled ? '#a7f3d0' : '#fde68a'}`
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: isBilled ? '#10b981' : '#f59e0b'
                          }} />
                          {billingStatusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleBillingClick(item)}
                          title="Open Consultation Billing"
                          style={{
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            borderRadius: radii.md,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                        >
                          <span>💳</span> Bill
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {items.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems || items.length)} of {totalItems || items.length} records
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setCurrentPage(1);
                    if (onAction) {
                      onAction('pageChange', { currentPage: 1, pageSize: newSize });
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: radii.sm,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    if (onAction) onAction('pageChange', { currentPage: prev, pageSize });
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: radii.sm,
                    border: '1px solid #cbd5e1',
                    backgroundColor: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                    color: currentPage <= 1 ? '#94a3b8' : '#334155',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  Prev
                </button>

                <span style={{
                  padding: '5px 12px',
                  borderRadius: radii.sm,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12
                }}>
                  {currentPage}
                </span>

                <button
                  type="button"
                  disabled={currentPage * pageSize >= (totalItems || items.length)}
                  onClick={() => {
                    const next = currentPage + 1;
                    setCurrentPage(next);
                    if (onAction) onAction('pageChange', { currentPage: next, pageSize });
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: radii.sm,
                    border: '1px solid #cbd5e1',
                    backgroundColor: currentPage * pageSize >= (totalItems || items.length) ? '#f1f5f9' : '#ffffff',
                    color: currentPage * pageSize >= (totalItems || items.length) ? '#94a3b8' : '#334155',
                    cursor: currentPage * pageSize >= (totalItems || items.length) ? 'not-allowed' : 'pointer',
                    fontSize: 12
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpVisitBillLinkScreen;
