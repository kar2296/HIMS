import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface LookupOption {
  Id: number | string;
  Text?: string;
  Description?: string;
  DisplayName?: string;
  Code?: string;
}

export interface AllOrderEntity {
  Id: number;
  WorkOrderId?: string;
  WorkOrderdid?: string;
  Orderdetailid?: number | null;
  Orderid?: number;
  Patientid?: number;
  PatientId?: number;
  EncounterId?: number;
  Encounterid?: number;
  ConsultationId?: number | null;
  Orderedbyid?: number;
  Orderedbyname?: string | null;
  WorkOrderStatusId?: number;
  Ordereddate?: string;
  Departmentid?: number;
  Subdepartmentid?: number;
  ReceivedDate?: string | null;
  Reporteddate?: string | null;
  Approvedbyid?: number | null;
  Approvedbyname?: string | null;
  OrderPriorityId?: number;
  UserId?: number | null;
  LabAssignTypeId?: number;
  TestTypeId?: number;
  IsReleased?: boolean;
  Status?: number;
  Rev?: number;
  CreatedBy?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  FacilityId?: number;
  PatientName?: string;
  PatientMrn?: string | null;
  PatientMobile?: string | null;
  SampleIdentifier?: string;
  IsRejected?: boolean;
  IsExternalLab?: boolean;
  IsPrinted?: boolean;
  IsCulture?: boolean;
  IsCriticalOrder?: boolean;
  ColorStatus?: number;
  WorkOrderStatus?: {
    DisplayName?: string;
    Description?: string;
    ColorCode?: string;
  };
  Department?: {
    DepartmentName?: string;
  };
  SubDepartment?: {
    DepartmentName?: string;
  };
  OrderPriority?: {
    Description?: string;
    ColorCode?: string | null;
  };
  LabAssignType?: {
    Description?: string;
    ColorCode?: string | null;
  };
  CreatedUser?: {
    FirstName?: string;
    LastName?: string | null;
    Title?: { Description?: string; ColorCode?: string; };
  };
  Orderedby?: {
    FirstName?: string;
    LastName?: string | null;
    Qualification?: string | null;
    Title?: { Description?: string; ColorCode?: string; };
  };
  Patient?: {
    Id?: number;
    FirstName?: string;
    MiddleName?: string | null;
    LastName?: string;
    MRN?: string;
    Age?: number;
    GenderId?: number;
    DOB?: string;
    Mobile?: string;
    Title?: { Description?: string; ColorCode?: string; };
    Gender?: { Description?: string; ColorCode?: string; };
  };
  Encounter?: {
    VisitIdentifier?: string;
    DoctorName?: string;
    EncounterTypeId?: number;
    AdmissionDate?: string;
    EncounterType?: { Description?: string; ColorCode?: string | null; };
    WardMaster?: { WardName?: string; };
    WardRoomMaster?: { RoomNo?: string; RoomName?: string | null; };
    WardRoomBedMaster?: { BedNo?: string; };
    Guarantor?: { GuarantorName?: string; };
    Doctor?: {
      FirstName?: string;
      LastName?: string | null;
      Qualification?: string | null;
      Title?: { Description?: string; ColorCode?: string; };
    };
  };
  PatientOrder?: {
    Id?: number;
    OrderNumber?: string;
    BillNumber?: string;
    OrderRequestDate?: string;
    OrderStatusId?: number;
    BillDate?: string;
  };
}

export interface AllOrdersProcessListScreenProps {
  reactProps?: {
    rows?: AllOrderEntity[];
    items?: AllOrderEntity[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: {
      totalItems?: number;
      currentPage?: number;
      pageSize?: number;
      startIndex?: number;
    };
    currentfilter?: {
      TestTypeId?: number;
      Ordereddate?: string | Date;
      EncounterTypeId?: number;
      SubDepartmentId?: number;
      PatientNameMRN?: string;
      PatWoNum?: string;
      OrderBillNo?: string;
      SampleIdentifier?: string;
      FromDate?: string | Date;
      ToDate?: string | Date;
      WorkOrderStatusId?: string | number | null;
      DoctorId?: number;
      VisitIdentifier?: string;
    };
    lookup?: {
      WorkOrderStatus?: LookupOption[];
      EncounterType?: LookupOption[];
      Department?: LookupOption[];
      Doctor?: LookupOption[];
    };
    facilityName?: string;
    facilityId?: number;
    showsubdept?: number;
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AllOrdersProcessListScreen: React.FC<AllOrdersProcessListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Bridge detection
  const rawItems = reactProps?.items || reactProps?.rows;
  const isHybrid = Boolean(reactProps && Array.isArray(rawItems));

  // Date helper
  const toDateInputString = (dateVal: string | Date | undefined | null): string => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      if (dateVal.includes('T')) return dateVal.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } else if (dateVal instanceof Date) {
      if (!isNaN(dateVal.getTime())) return dateVal.toISOString().split('T')[0];
    }
    return '';
  };

  const formatDisplayDateTime = (dateVal?: string | null): { date: string; time: string } => {
    if (!dateVal) return { date: '—', time: '' };
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return { date: String(dateVal), time: '' };
      const date = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { date, time };
    } catch {
      return { date: String(dateVal), time: '' };
    }
  };

  // Default dates: default to today or past 7 days
  const defaultToday = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultPast7 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter States
  const [sampleId, setSampleId] = useState<string>(reactProps?.currentfilter?.SampleIdentifier || '');
  const [patWoNum, setPatWoNum] = useState<string>(reactProps?.currentfilter?.PatWoNum || '');
  const [mrnSearch, setMrnSearch] = useState<string>(reactProps?.currentfilter?.PatientNameMRN || '');
  const [orderBillNo, setOrderBillNo] = useState<string>(reactProps?.currentfilter?.OrderBillNo || '');

  const [fromDate, setFromDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.FromDate) || defaultPast7
  );
  const [toDate, setToDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.ToDate) || defaultToday
  );
  const [workOrderStatusId, setWorkOrderStatusId] = useState<string>(
    reactProps?.currentfilter?.WorkOrderStatusId ? String(reactProps.currentfilter.WorkOrderStatusId) : ''
  );
  const [encounterTypeId, setEncounterTypeId] = useState<number>(
    reactProps?.currentfilter?.EncounterTypeId !== undefined ? Number(reactProps.currentfilter.EncounterTypeId) : -1
  );
  const [subDepartmentId, setSubDepartmentId] = useState<number>(
    reactProps?.currentfilter?.SubDepartmentId !== undefined ? Number(reactProps.currentfilter.SubDepartmentId) : -1
  );
  const [doctorId, setDoctorId] = useState<number>(
    reactProps?.currentfilter?.DoctorId !== undefined ? Number(reactProps.currentfilter.DoctorId) : -1
  );

  const [activeDatePreset, setActiveDatePreset] = useState<string>('7days');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Standalone States (for direct React dev or fallback)
  const [standaloneItems, setStandaloneItems] = useState<AllOrderEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    WorkOrderStatus: LookupOption[];
    EncounterType: LookupOption[];
    Department: LookupOption[];
    Doctor: LookupOption[];
  }>({
    WorkOrderStatus: [],
    EncounterType: [],
    Department: [],
    Doctor: [],
  });



  // Synchronize when reactProps change from AngularJS
  useEffect(() => {
    if (reactProps?.currentfilter) {
      const cf = reactProps.currentfilter;
      if (cf.SampleIdentifier !== undefined) setSampleId(cf.SampleIdentifier || '');
      if (cf.PatWoNum !== undefined) setPatWoNum(cf.PatWoNum || '');
      if (cf.PatientNameMRN !== undefined) setMrnSearch(cf.PatientNameMRN || '');
      if (cf.OrderBillNo !== undefined) setOrderBillNo(cf.OrderBillNo || '');
      if (cf.FromDate !== undefined) setFromDate(toDateInputString(cf.FromDate));
      if (cf.ToDate !== undefined) setToDate(toDateInputString(cf.ToDate));
      if (cf.WorkOrderStatusId !== undefined && cf.WorkOrderStatusId !== null) {
        setWorkOrderStatusId(String(cf.WorkOrderStatusId));
      }
      if (cf.EncounterTypeId !== undefined) setEncounterTypeId(Number(cf.EncounterTypeId));
      if (cf.SubDepartmentId !== undefined) setSubDepartmentId(Number(cf.SubDepartmentId));
      if (cf.DoctorId !== undefined) setDoctorId(Number(cf.DoctorId));
    }
  }, [reactProps?.currentfilter]);

  // Combined Lookups
  const lookups = useMemo(() => {
    return {
      WorkOrderStatus: reactProps?.lookup?.WorkOrderStatus || standaloneLookups.WorkOrderStatus || [],
      EncounterType: reactProps?.lookup?.EncounterType || standaloneLookups.EncounterType || [],
      Department: reactProps?.lookup?.Department || standaloneLookups.Department || [],
      Doctor: reactProps?.lookup?.Doctor || standaloneLookups.Doctor || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Standalone fetch
  const fetchStandaloneOrders = useCallback(
    async (page = 1, size = 25) => {
      setIsLoading(true);
      try {
        const fromVal = fromDate ? `${fromDate} 00:00:00` : null;
        const toVal = toDate ? `${toDate} 23:59:59` : null;

        const isBroadSearch = Boolean(orderBillNo || patWoNum || mrnSearch || sampleId);

        const params: Array<{ Key: number; Value: any }> = [
          { Key: 3, Value: isBroadSearch ? null : workOrderStatusId || null },
          { Key: 28, Value: orderBillNo || null },
          { Key: 32, Value: patWoNum || null },
          { Key: 6, Value: reactProps?.currentfilter?.TestTypeId || 1 },
          { Key: 38, Value: isBroadSearch ? null : fromVal },
          { Key: 39, Value: isBroadSearch ? null : toVal },
          { Key: 40, Value: ['1', '6', '8', '9', '10', '11', '16', '17'] },
          { Key: 29, Value: reactProps?.facilityId || sessionHelper.getCurrentFacilityId() || 1 },
          { Key: 30, Value: null },
          { Key: 13, Value: doctorId > 0 ? doctorId : null },
          { Key: 16, Value: encounterTypeId > 0 ? encounterTypeId : null },
          { Key: 8, Value: mrnSearch || null },
          { Key: 23, Value: subDepartmentId > 0 ? subDepartmentId : null },
          { Key: 35, Value: sampleId || null },
        ];

        const res = await callBackendApi<{
          Data: AllOrderEntity[];
          PageContext?: { TotalRecords: number };
        }>({
          action: 'lis/patientworkorder/GetPatientWorkorders',
          data: {
            Params: params,
            PageContext: { PageSize: size, PageNumber: page },
          },
          type: 'post',
        });

        if (res && Array.isArray(res.Data)) {
          const processed = res.Data.map((item) => {
            const mapped = { ...item };
            mapped.ColorStatus = mapped.WorkOrderStatusId;
            if (mapped.IsPrinted) mapped.ColorStatus = 10;
            if (mapped.IsCriticalOrder) mapped.ColorStatus = 11;
            return mapped;
          });
          setStandaloneItems(processed);
          setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        }
      } catch (err) {
        console.error('Failed to fetch orders standalone:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      fromDate,
      toDate,
      workOrderStatusId,
      orderBillNo,
      patWoNum,
      mrnSearch,
      sampleId,
      doctorId,
      encounterTypeId,
      subDepartmentId,
      reactProps?.currentfilter?.TestTypeId,
      reactProps?.facilityId,
    ]
  );

  // Standalone lookup load
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi<any>({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'WorkOrderStatus', Default: false },
          { Key: 'EncounterType' },
          {
            Key: 'Department',
            Request: {
              Params: [{ Key: 6, Value: 8 }],
            },
          },
          { Key: 'Doctor' },
        ],
        type: 'post',
      })
        .then((data) => {
          if (data) {
            setStandaloneLookups({
              WorkOrderStatus: data.WorkOrderStatus || [],
              EncounterType: data.EncounterType || [],
              Department: data.Department || [],
              Doctor: data.Doctor || [],
            });
          }
        })
        .catch(console.error);

      fetchStandaloneOrders(1, 25);
    }
  }, [isHybrid, fetchStandaloneOrders]);

  // Items and paging
  const allItems: AllOrderEntity[] = useMemo(() => {
    return isHybrid ? (rawItems as AllOrderEntity[]) || [] : standaloneItems;
  }, [isHybrid, rawItems, standaloneItems]);

  const totalItems = isHybrid
    ? reactProps?.totalItems ?? reactProps?.pagerObj?.totalItems ?? allItems.length
    : standaloneTotal;

  const currentPage = isHybrid
    ? reactProps?.currentPage ?? reactProps?.pagerObj?.currentPage ?? 1
    : standalonePage;

  const pageSize = isHybrid
    ? reactProps?.pageSize ?? reactProps?.pagerObj?.pageSize ?? 25
    : standalonePageSize;

  // Test Type
  const testTypeId = reactProps?.currentfilter?.TestTypeId ?? 1;
  const isRadiology = testTypeId === 2;
  const isEndoscopy = testTypeId === 4;

  const screenTitle = isRadiology
    ? 'Radiology Orders — RIS Process'
    : isEndoscopy
    ? 'Endoscopy Orders'
    : 'Result Entry — Diagnostic Work Orders';

  const screenBadge = isRadiology
    ? 'RIS RADIOLOGY'
    : isEndoscopy
    ? 'ENDOSCOPY'
    : 'LIS LABORATORY MEDICINE';

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    let createdCount = 0;
    let inProgressCount = 0;
    let criticalCount = 0;
    let completedCount = 0;

    for (const item of allItems) {
      const stId = Number(item.WorkOrderStatusId);
      const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();

      if (stId === 1 || stName.includes('CREATED')) createdCount++;
      else if (stId === 6 || stName.includes('PROGRESS') || stName.includes('ASSIGN')) inProgressCount++;
      else if (stId === 8 || stId === 9 || stName.includes('COMPLET') || stName.includes('APPROV') || item.IsPrinted) {
        completedCount++;
      }

      if (item.IsCriticalOrder || item.ColorStatus === 11 || (item.OrderPriority?.Description || '').toUpperCase().includes('STAT')) {
        criticalCount++;
      }
    }

    return {
      total: totalItems,
      loadedCount: allItems.length,
      created: createdCount,
      inProgress: inProgressCount,
      critical: criticalCount,
      completed: completedCount,
    };
  }, [allItems, totalItems]);

  // Client-side KPI filter & quick filter
  const displayItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. KPI Filter
      if (activeKpiFilter === 'created') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 1 && !stName.includes('CREATED')) return false;
      } else if (activeKpiFilter === 'in_progress') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 6 && !stName.includes('PROGRESS') && !stName.includes('ASSIGN')) return false;
      } else if (activeKpiFilter === 'critical') {
        if (!item.IsCriticalOrder && item.ColorStatus !== 11 && !(item.OrderPriority?.Description || '').toUpperCase().includes('STAT')) {
          return false;
        }
      } else if (activeKpiFilter === 'completed') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 8 && stId !== 9 && !stName.includes('COMPLET') && !item.IsPrinted) return false;
      }

      return true;
    });
  }, [allItems, activeKpiFilter]);

  // Handle Date Presets
  const handleDatePreset = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'all') => {
    setActiveDatePreset(preset);
    const today = new Date();
    let f = '';
    let t = today.toISOString().split('T')[0];

    if (preset === 'today') {
      f = t;
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      f = y.toISOString().split('T')[0];
      t = f;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      f = d.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      f = d.toISOString().split('T')[0];
    } else if (preset === 'all') {
      f = '';
      t = '';
    }

    setFromDate(f);
    setToDate(t);

    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: f ? new Date(`${f}T00:00:00`) : null,
        ToDate: t ? new Date(`${t}T23:59:59`) : null,
        SampleIdentifier: sampleId,
        PatWoNum: patWoNum,
        PatientNameMRN: mrnSearch,
        OrderBillNo: orderBillNo,
        WorkOrderStatusId: workOrderStatusId || null,
        EncounterTypeId: encounterTypeId > 0 ? encounterTypeId : -1,
        SubDepartmentId: subDepartmentId > 0 ? subDepartmentId : -1,
        DoctorId: doctorId > 0 ? doctorId : undefined,
      });
    } else {
      setTimeout(() => fetchStandaloneOrders(1, pageSize), 50);
    }
  };

  // Trigger search / filter apply
  const handleApplyFilter = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: fromDate ? new Date(`${fromDate}T00:00:00`) : null,
        ToDate: toDate ? new Date(`${toDate}T23:59:59`) : null,
        SampleIdentifier: sampleId,
        PatWoNum: patWoNum,
        PatientNameMRN: mrnSearch,
        OrderBillNo: orderBillNo,
        WorkOrderStatusId: workOrderStatusId || null,
        EncounterTypeId: encounterTypeId > 0 ? encounterTypeId : -1,
        SubDepartmentId: subDepartmentId > 0 ? subDepartmentId : -1,
        DoctorId: doctorId > 0 ? doctorId : undefined,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1, pageSize);
    }
  };

  // Reset filters
  const handleReset = () => {
    setSampleId('');
    setPatWoNum('');
    setMrnSearch('');
    setOrderBillNo('');
    setFromDate(defaultPast7);
    setToDate(defaultToday);
    setWorkOrderStatusId('');
    setEncounterTypeId(-1);
    setSubDepartmentId(-1);
    setDoctorId(-1);
    setActiveDatePreset('7days');
    setActiveKpiFilter('all');

    if (isHybrid && onAction) {
      onAction('resetFilters');
    } else {
      setStandalonePage(1);
      setTimeout(() => fetchStandaloneOrders(1, 25), 50);
    }
  };

  // Pagination Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage, pageSize });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneOrders(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: 1, pageSize: newSize });
    } else {
      setStandalonePage(1);
      setStandalonePageSize(newSize);
      fetchStandaloneOrders(1, newSize);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Render Status Badge
  const renderStatusBadge = (item: AllOrderEntity) => {
    const isCritical = item.IsCriticalOrder || item.ColorStatus === 11;
    const isPrinted = item.IsPrinted || item.ColorStatus === 10;
    const rawStatus = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
    const stId = Number(item.WorkOrderStatusId);

    if (isCritical) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.25)',
              animation: 'pkgPulse 1.5s infinite',
            }}
          />
          CRITICAL
        </span>
      );
    }

    if (isPrinted) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe',
          }}
        >
          <i className="fa fa-print" style={{ fontSize: '10px' }} />
          PRINTED
        </span>
      );
    }

    if (stId === 1 || rawStatus.includes('CREATED')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
          CREATED
        </span>
      );
    }

    if (stId === 6 || rawStatus.includes('PROGRESS') || rawStatus.includes('ASSIGN')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          IN PROGRESS
        </span>
      );
    }

    if (rawStatus.includes('PARTIAL')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0284c7' }} />
          PARTIAL
        </span>
      );
    }

    if (stId === 8 || stId === 9 || rawStatus.includes('COMPLET') || rawStatus.includes('APPROV')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
          COMPLETED
        </span>
      );
    }

    if (rawStatus.includes('REJECT') || stId === 7) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: radii.full,
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#e11d48' }} />
          REJECTED
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 9px',
          borderRadius: radii.full,
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: '1px solid #e2e8f0',
        }}
      >
        {rawStatus || 'PENDING'}
      </span>
    );
  };

  const totalPages = Math.ceil(totalItems / (pageSize || 25)) || 1;

  return (
    <div className="pkg-page-container orderack-container" style={{ padding: '16px 20px 40px' }}>
      {/* 1. Executive Modern Header */}
      <div className="pkg-header-card" style={{ marginBottom: spacing[4] }}>
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: isRadiology
                ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: isRadiology
                ? '0 4px 12px rgba(124, 58, 237, 0.28)'
                : '0 4px 12px rgba(2, 132, 199, 0.28)',
            }}
          >
            <i className={`fa ${isRadiology ? 'fa-x-ray' : 'fa-flask'}`} aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title" style={{ fontSize: '20px', margin: 0 }}>
                {screenTitle}
              </h1>
              <span
                className="pkg-header-tag"
                style={{
                  backgroundColor: isRadiology ? '#f5f3ff' : '#f0f9ff',
                  color: isRadiology ? '#7c3aed' : '#0284c7',
                  borderColor: isRadiology ? '#ddd6fe' : '#bae6fd',
                }}
              >
                {screenBadge}
              </span>
            </div>
            <p className="pkg-header-subtitle">
              Live processing workstation for diagnostic work orders, specimen review, turnaround tracking, and result entry.
            </p>
          </div>
        </div>

        <div className="pkg-header-right">
          {/* Facility Chip */}
          <div className="pkg-header-chip">
            <span className="pkg-header-chip-dot" />
            <span>{reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              if (isHybrid && onAction) onAction('refresh');
              else fetchStandaloneOrders(currentPage, pageSize);
            }}
            title="Refresh Orders List"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              padding: '7px 13px',
              borderRadius: radii.md,
              color: '#334155',
              border: '1px solid #cbd5e1',
            }}
          >
            <i className={`fa fa-refresh ${isLoading ? 'fa-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Home / Dashboard Button */}
          <button
            type="button"
            className="btn btn-default"
            onClick={() => onAction && onAction('dashboard')}
            title="Back to Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              padding: '7px 13px',
              borderRadius: radii.md,
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderColor: '#0284c7',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fa fa-home" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Summary Cards */}
      <div
        className="pkg-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: spacing[4],
        }}
      >
        {/* Total Orders */}
        <div
          className="pkg-stat-card"
          onClick={() => setActiveKpiFilter('all')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'all' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            backgroundColor: activeKpiFilter === 'all' ? '#f0f9ff' : '#ffffff',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label" style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
              Total Work Orders
            </span>
            <span className="pkg-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
              {stats.total.toLocaleString()}
            </span>
            <span className="pkg-stat-subtext" style={{ fontSize: '11px', color: '#94a3b8' }}>
              Matching current filters
            </span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-list-check" aria-hidden="true" />
          </div>
        </div>

        {/* Created / Pending Orders */}
        <div
          className="pkg-stat-card"
          onClick={() => setActiveKpiFilter('created')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'created' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            backgroundColor: activeKpiFilter === 'created' ? '#fffbeb' : '#ffffff',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label" style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
              Created / Awaiting
            </span>
            <span className="pkg-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', margin: '4px 0 2px' }}>
              {stats.created.toLocaleString()}
            </span>
            <span className="pkg-stat-subtext" style={{ fontSize: '11px', color: '#94a3b8' }}>
              Ready for processing
            </span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-hourglass-start" aria-hidden="true" />
          </div>
        </div>

        {/* In Progress / Assigned */}
        <div
          className="pkg-stat-card"
          onClick={() => setActiveKpiFilter('in_progress')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'in_progress' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            backgroundColor: activeKpiFilter === 'in_progress' ? '#eff6ff' : '#ffffff',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label" style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
              In Progress / Testing
            </span>
            <span className="pkg-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', margin: '4px 0 2px' }}>
              {stats.inProgress.toLocaleString()}
            </span>
            <span className="pkg-stat-subtext" style={{ fontSize: '11px', color: '#94a3b8' }}>
              Under active bench review
            </span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-microscope" aria-hidden="true" />
          </div>
        </div>

        {/* Critical Orders */}
        <div
          className="pkg-stat-card"
          onClick={() => setActiveKpiFilter('critical')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'critical' ? '2px solid #ef4444' : '1px solid #e2e8f0',
            backgroundColor: activeKpiFilter === 'critical' ? '#fef2f2' : '#ffffff',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label" style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
              Critical / STAT
            </span>
            <span className="pkg-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', margin: '4px 0 2px' }}>
              {stats.critical.toLocaleString()}
            </span>
            <span className="pkg-stat-subtext" style={{ fontSize: '11px', color: '#94a3b8' }}>
              High-priority immediate action
            </span>
          </div>
          <div className="pkg-stat-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <i className="fa fa-triangle-exclamation" aria-hidden="true" />
          </div>
        </div>

        {/* Completed / Printed */}
        <div
          className="pkg-stat-card"
          onClick={() => setActiveKpiFilter('completed')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'completed' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeKpiFilter === 'completed' ? '#ecfdf5' : '#ffffff',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label" style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
              Reported / Released
            </span>
            <span className="pkg-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '4px 0 2px' }}>
              {stats.completed.toLocaleString()}
            </span>
            <span className="pkg-stat-subtext" style={{ fontSize: '11px', color: '#94a3b8' }}>
              Results published or printed
            </span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-circle-check" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Advanced Diagnostic Filter & Search Bar */}
      <div className="pkg-filter-card" style={{ marginBottom: spacing[4], padding: '16px 20px', borderRadius: 14 }}>
        {/* Quick Date Presets Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[3],
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: 4 }}>
              <i className="fa fa-calendar-check" style={{ marginRight: 6, color: '#0284c7' }} />
              Date Quick-Filters:
            </span>
            <button
              type="button"
              className={`orderack-preset-chip ${activeDatePreset === 'today' ? 'active' : ''}`}
              onClick={() => handleDatePreset('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`orderack-preset-chip ${activeDatePreset === 'yesterday' ? 'active' : ''}`}
              onClick={() => handleDatePreset('yesterday')}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`orderack-preset-chip ${activeDatePreset === '7days' ? 'active' : ''}`}
              onClick={() => handleDatePreset('7days')}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`orderack-preset-chip ${activeDatePreset === '30days' ? 'active' : ''}`}
              onClick={() => handleDatePreset('30days')}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className={`orderack-preset-chip ${activeDatePreset === 'all' ? 'active' : ''}`}
              onClick={() => handleDatePreset('all')}
            >
              All Dates
            </button>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            Loaded <strong>{displayItems.length}</strong> of <strong>{totalItems.toLocaleString()}</strong> orders
          </div>
        </div>

        {/* Row 1: Fast Search Inputs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isRadiology
              ? 'repeat(auto-fit, minmax(220px, 1fr))'
              : 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
            marginBottom: 12,
          }}
        >
          {!isRadiology && (
            <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
              <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Sample Identifier
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa fa-vial"
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '12px',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  className="pkg-filter-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="e.g. 10086"
                  value={sampleId}
                  onChange={(e) => setSampleId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                />
                {sampleId && (
                  <button
                    type="button"
                    onClick={() => setSampleId('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 2,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              Patient Name / WO #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-user"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="pkg-filter-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search Name or WO#"
                value={patWoNum}
                onChange={(e) => setPatWoNum(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              />
              {patWoNum && (
                <button
                  type="button"
                  onClick={() => setPatWoNum('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              UHID / MRN
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-id-card"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="pkg-filter-input"
                style={{ paddingLeft: '32px' }}
                placeholder="e.g. UHID76"
                value={mrnSearch}
                onChange={(e) => setMrnSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              />
              {mrnSearch && (
                <button
                  type="button"
                  onClick={() => setMrnSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              Order # / Bill #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-receipt"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="pkg-filter-input"
                style={{ paddingLeft: '32px' }}
                placeholder="e.g. ORD-10103"
                value={orderBillNo}
                onChange={(e) => setOrderBillNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              />
              {orderBillNo && (
                <button
                  type="button"
                  onClick={() => setOrderBillNo('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Filter Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* From Date */}
          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              From Date
            </label>
            <input
              type="date"
              className="pkg-filter-input"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActiveDatePreset('');
              }}
            />
          </div>

          {/* To Date */}
          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              To Date
            </label>
            <input
              type="date"
              className="pkg-filter-input"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActiveDatePreset('');
              }}
            />
          </div>

          {/* Work Order Status */}
          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              Work Order Status
            </label>
            <select
              className="pkg-filter-select"
              value={workOrderStatusId}
              onChange={(e) => setWorkOrderStatusId(e.target.value)}
            >
              <option value="">All Statuses</option>
              {lookups.WorkOrderStatus.map((st) => (
                <option key={st.Id} value={st.Id}>
                  {st.DisplayName || st.Text || st.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Type / Encounter Type */}
          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              Patient Type
            </label>
            <select
              className="pkg-filter-select"
              value={encounterTypeId}
              onChange={(e) => setEncounterTypeId(Number(e.target.value))}
            >
              <option value="-1">All Patient Types</option>
              {lookups.EncounterType.map((enc) => (
                <option key={enc.Id} value={enc.Id}>
                  {enc.Text || enc.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department */}
          <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
            <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
              Sub Department
            </label>
            <select
              className="pkg-filter-select"
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(Number(e.target.value))}
            >
              <option value="-1">All Sub Departments</option>
              {lookups.Department.map((dept) => (
                <option key={dept.Id} value={dept.Id}>
                  {dept.Text || dept.Description || (dept as any).DepartmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter (if available) */}
          {lookups.Doctor.length > 0 && (
            <div className="pkg-filter-group" style={{ marginBottom: 0 }}>
              <label className="pkg-filter-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Ordered By Doctor
              </label>
              <select
                className="pkg-filter-select"
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
              >
                <option value="-1">All Doctors</option>
                {lookups.Doctor.map((doc) => (
                  <option key={doc.Id} value={doc.Id}>
                    {doc.Text || doc.Description}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            className="btn btn-default"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              padding: '7px 16px',
              borderRadius: radii.md,
              color: '#475569',
              border: '1px solid #cbd5e1',
            }}
          >
            <i className="fa fa-undo" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApplyFilter}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              padding: '7px 20px',
              borderRadius: radii.md,
              backgroundColor: '#0284c7',
              borderColor: '#0284c7',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className={`fa fa-search ${isLoading ? 'fa-spin' : ''}`} />
            <span>Fetch Orders</span>
          </button>
        </div>
      </div>

      {/* 4. Enterprise Diagnostic Work Orders Table */}
      <div className="pkg-table-card" style={{ marginBottom: spacing[4], borderRadius: 14 }}>
        <div className="pkg-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="pkg-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '130px' }}>Work Order No</th>
                <th style={{ minWidth: '150px' }}>Order / Bill No</th>
                {!isRadiology && <th style={{ minWidth: '100px' }}>Sample ID</th>}
                <th style={{ minWidth: '90px' }}>Type</th>
                <th style={{ minWidth: '140px' }}>Order Date & Time</th>
                <th style={{ minWidth: '110px' }}>MRN / UHID</th>
                <th style={{ minWidth: '220px' }}>Patient Details</th>
                <th style={{ minWidth: '160px' }}>Ordered By</th>
                <th style={{ minWidth: '140px' }}>Sub Department</th>
                <th style={{ minWidth: '130px' }}>Room / Bed</th>
                <th style={{ minWidth: '130px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '140px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isRadiology ? 12 : 13} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#0284c7' }} />
                      <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                        Loading diagnostic work orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan={isRadiology ? 12 : 13} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="pkg-empty-state" style={{ maxWidth: 440, margin: '0 auto' }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          color: '#94a3b8',
                          fontSize: 28,
                        }}
                      >
                        <i className={`fa ${isRadiology ? 'fa-x-ray' : 'fa-flask'}`} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                        No Diagnostic Work Orders Found
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                        There are no orders matching your current date range and filter criteria. Try clicking "Last 30 Days" or "All Dates" to expand your view.
                      </p>
                      <button
                        type="button"
                        className="btn btn-default btn-sm"
                        onClick={handleReset}
                        style={{ fontWeight: 600, borderRadius: radii.md }}
                      >
                        <i className="fa fa-refresh" style={{ marginRight: 6 }} /> Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayItems.map((item, index) => {
                  const woNumber = item.WorkOrderdid || item.WorkOrderId || `WO-${item.Id}`;
                  const orderNum = item.PatientOrder?.OrderNumber || '—';
                  const billNum = item.PatientOrder?.BillNumber;
                  const encType = item.Encounter?.EncounterType?.Description || 'OP';
                  const isIp = encType.toUpperCase().includes('IP');
                  const orderDateTime = formatDisplayDateTime(item.CreatedAt || item.Ordereddate);

                  const patName =
                    item.PatientName ||
                    `${item.Patient?.Title?.Description ? item.Patient.Title.Description + ' ' : ''}${
                      item.Patient?.FirstName || ''
                    } ${item.Patient?.LastName || ''}`.trim();

                  const ageGender = [
                    item.Patient?.Age ? `${item.Patient.Age}y` : null,
                    item.Patient?.Gender?.Description || null,
                  ]
                    .filter(Boolean)
                    .join(' / ');

                  const doctorName =
                    item.Orderedby
                      ? `${item.Orderedby.Title?.Description ? item.Orderedby.Title.Description + ' ' : ''}${
                          item.Orderedby.FirstName || ''
                        } ${item.Orderedby.LastName || ''}`.trim()
                      : '—';

                  const subDeptName = item.SubDepartment?.DepartmentName || item.Department?.DepartmentName || '—';

                  const ward = item.Encounter?.WardMaster?.WardName;
                  const room = item.Encounter?.WardRoomMaster?.RoomNo;
                  const bed = item.Encounter?.WardRoomBedMaster?.BedNo;
                  const roomDetails = [ward, room, bed ? `Bed ${bed}` : null].filter(Boolean).join(' / ') || '—';

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* S.No */}
                      <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      {/* Work Order No */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              padding: '2px 7px',
                              borderRadius: 4,
                              border: '1px solid #bfdbfe',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {woNumber}
                          </span>
                          <button
                            type="button"
                            title="Copy Work Order Number"
                            onClick={() => handleCopy(woNumber, `wo-${item.Id}`)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              padding: 2,
                              color: copiedId === `wo-${item.Id}` ? '#10b981' : '#94a3b8',
                              fontSize: '11px',
                            }}
                          >
                            <i className={`fa ${copiedId === `wo-${item.Id}` ? 'fa-check' : 'fa-copy'}`} />
                          </button>
                        </div>
                      </td>

                      {/* Order No / Bill No */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                            {orderNum}
                          </span>
                          {billNum && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              Bill: {billNum}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sample ID (if Lab) */}
                      {!isRadiology && (
                        <td>
                          {item.SampleIdentifier ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '11.5px',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                backgroundColor: '#f5f3ff',
                                color: '#7c3aed',
                                border: '1px solid #ddd6fe',
                              }}
                            >
                              <i className="fa fa-vial" style={{ fontSize: '9px' }} />
                              {item.SampleIdentifier}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                      )}

                      {/* Patient Type */}
                      <td>
                        <span
                          className={`orderack-visit-badge ${isIp ? 'orderack-visit-ip' : 'orderack-visit-op'}`}
                        >
                          {encType}
                        </span>
                      </td>

                      {/* Order Date & Time */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                            <i className="fa fa-calendar-o" style={{ color: '#0284c7', marginRight: 5 }} />
                            {orderDateTime.date}
                          </span>
                          {orderDateTime.time && (
                            <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: 16 }}>
                              {orderDateTime.time}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* MRN / UHID */}
                      <td>
                        <span className="orderack-mrn-chip">
                          {item.Patient?.MRN || item.PatientMrn || '—'}
                        </span>
                      </td>

                      {/* Patient Information */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button
                            type="button"
                            className="orderack-pat-name-btn"
                            title="Click to view Patient Profile"
                            onClick={() => {
                              if (onAction) {
                                onAction('patientinfo', {
                                  PatientId: item.PatientId || item.Patient?.Id,
                                  ...item,
                                });
                              }
                            }}
                          >
                            {patName || 'Unknown Patient'}
                          </button>
                          {ageGender && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {ageGender}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ordered By Doctor */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i className="fa fa-user-doctor" style={{ color: '#0284c7', fontSize: '11px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                            {doctorName}
                          </span>
                        </div>
                      </td>

                      {/* Sub Department */}
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 4,
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {subDeptName}
                        </span>
                      </td>

                      {/* Room Details */}
                      <td>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {roomDetails}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        {renderStatusBadge(item)}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {/* Result Entry / Edit */}
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            title="Result Entry / Edit Results"
                            onClick={() => onAction && onAction('edit', item)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: radii.sm,
                              backgroundColor: '#eff6ff',
                              borderColor: '#bfdbfe',
                              color: '#2563eb',
                            }}
                          >
                            <i className="fa fa-pen-to-square" />
                          </button>

                          {/* Order TAT Modal Trigger */}
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            title="Order Turnaround Time (TAT)"
                            onClick={() => {
                              if (onAction) onAction('ordertat', item);
                            }}
                            style={{
                              padding: '5px 8px',
                              borderRadius: radii.sm,
                              backgroundColor: '#f8fafc',
                              borderColor: '#e2e8f0',
                              color: '#0284c7',
                            }}
                          >
                            <i className="fa fa-stopwatch" />
                          </button>

                          {/* Order History */}
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            title="Order History"
                            onClick={() => onAction && onAction('orderhistory', item)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: radii.sm,
                              backgroundColor: '#f8fafc',
                              borderColor: '#e2e8f0',
                              color: '#64748b',
                            }}
                          >
                            <i className="fa fa-notes-medical" />
                          </button>

                          {/* Print WorkSheet */}
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            title="Print Work Order Sheet"
                            onClick={() => onAction && onAction('worksheet', item)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: radii.sm,
                              backgroundColor: '#f8fafc',
                              borderColor: '#e2e8f0',
                              color: '#64748b',
                            }}
                          >
                            <i className="fa fa-print" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modern Responsive Pagination Bar */}
      <div
        className="pkg-pagination-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '13px', color: '#64748b' }}>
          <span>
            Showing{' '}
            <strong>
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong>
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong>{totalItems.toLocaleString()}</strong> records
          </span>

          {/* Page size dropdown */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px' }}>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                backgroundColor: '#f8fafc',
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            className="btn btn-default btn-xs"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(1)}
            title="First Page"
            style={{ padding: '5px 9px', borderRadius: radii.sm }}
          >
            <i className="fa fa-angles-left" />
          </button>
          <button
            type="button"
            className="btn btn-default btn-xs"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            title="Previous Page"
            style={{ padding: '5px 9px', borderRadius: radii.sm }}
          >
            <i className="fa fa-chevron-left" />
          </button>

          <span
            style={{
              padding: '4px 10px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0284c7',
              backgroundColor: '#f0f9ff',
              borderRadius: 6,
              border: '1px solid #bae6fd',
              margin: '0 4px',
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-default btn-xs"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            title="Next Page"
            style={{ padding: '5px 9px', borderRadius: radii.sm }}
          >
            <i className="fa fa-chevron-right" />
          </button>
          <button
            type="button"
            className="btn btn-default btn-xs"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(totalPages)}
            title="Last Page"
            style={{ padding: '5px 9px', borderRadius: radii.sm }}
          >
            <i className="fa fa-angles-right" />
          </button>
        </div>
      </div>

    </div>
  );
};
