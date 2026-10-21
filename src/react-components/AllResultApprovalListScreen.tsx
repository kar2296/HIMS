import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';
import { TatDetailsModalScreen } from './TatDetailsModalScreen';

export interface LookupOption {
  Id: number | string;
  Text?: string;
  Description?: string;
  DisplayName?: string;
  Code?: string;
}

export interface ApprovalOrderEntity {
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
  ReferenceNo?: string | null;
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
  PatientOrderDetailId?: number;
}

export interface AllResultApprovalListScreenProps {
  reactProps?: {
    rows?: ApprovalOrderEntity[];
    items?: ApprovalOrderEntity[];
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
      PatientMRN?: string;
      PatWoNum?: string;
      OrderBillNo?: string;
      WorkOrderdid?: string;
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
      Ward?: LookupOption[];
      Guarantor?: LookupOption[];
      GuarantorType?: LookupOption[];
      LabAssignType?: LookupOption[];
    };
    facilityName?: string;
    facilityId?: number;
    showsubdept?: number;
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AllResultApprovalListScreen: React.FC<AllResultApprovalListScreenProps> = ({
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

  // Default dates: past 7 days for rich data view
  const defaultToday = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultPast7 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter States
  const [sampleId, setSampleId] = useState<string>(reactProps?.currentfilter?.SampleIdentifier || '');
  const [patWoNum, setPatWoNum] = useState<string>(reactProps?.currentfilter?.PatWoNum || '');
  const [mrnSearch, setMrnSearch] = useState<string>(reactProps?.currentfilter?.PatientMRN || reactProps?.currentfilter?.PatientNameMRN || '');
  const [orderBillNo, setOrderBillNo] = useState<string>(reactProps?.currentfilter?.OrderBillNo || '');
  const [workOrderIdSearch, setWorkOrderIdSearch] = useState<string>(reactProps?.currentfilter?.WorkOrderdid || '');

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

  // Advanced Filter Modal States
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [advancedWardId, setAdvancedWardId] = useState<number>(-1);
  const [advancedGuarantorId, setAdvancedGuarantorId] = useState<number>(-1);
  const [advancedGuarantorTypeId, setAdvancedGuarantorTypeId] = useState<number>(-1);
  const [advancedLabAssignTypeId, setAdvancedLabAssignTypeId] = useState<number>(-1);
  const [advancedReferenceNo, setAdvancedReferenceNo] = useState<string>('');

  // Standalone States (for direct React dev or fallback)
  const [standaloneItems, setStandaloneItems] = useState<ApprovalOrderEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    WorkOrderStatus: LookupOption[];
    EncounterType: LookupOption[];
    Department: LookupOption[];
    Doctor: LookupOption[];
    Ward: LookupOption[];
    Guarantor: LookupOption[];
    GuarantorType: LookupOption[];
    LabAssignType: LookupOption[];
  }>({
    WorkOrderStatus: [],
    EncounterType: [],
    Department: [],
    Doctor: [],
    Ward: [],
    Guarantor: [],
    GuarantorType: [],
    LabAssignType: [],
  });

  // Embedded TAT Modal State
  const [activeTatItem, setActiveTatItem] = useState<ApprovalOrderEntity | null>(null);
  // Embedded Patient Profile Modal State
  const [activePatientItem, setActivePatientItem] = useState<ApprovalOrderEntity | null>(null);

  // Synchronize when reactProps change from AngularJS
  useEffect(() => {
    if (reactProps?.currentfilter) {
      const cf = reactProps.currentfilter;
      if (cf.SampleIdentifier !== undefined) setSampleId(cf.SampleIdentifier || '');
      if (cf.PatWoNum !== undefined) setPatWoNum(cf.PatWoNum || '');
      if (cf.PatientMRN !== undefined) setMrnSearch(cf.PatientMRN || '');
      if (cf.OrderBillNo !== undefined) setOrderBillNo(cf.OrderBillNo || '');
      if (cf.WorkOrderdid !== undefined) setWorkOrderIdSearch(cf.WorkOrderdid || '');
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
      Ward: reactProps?.lookup?.Ward || standaloneLookups.Ward || [],
      Guarantor: reactProps?.lookup?.Guarantor || standaloneLookups.Guarantor || [],
      GuarantorType: reactProps?.lookup?.GuarantorType || standaloneLookups.GuarantorType || [],
      LabAssignType: reactProps?.lookup?.LabAssignType || standaloneLookups.LabAssignType || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Standalone fetch
  const fetchStandaloneOrders = useCallback(
    async (page = 1, size = 25) => {
      setIsLoading(true);
      try {
        const fromVal = fromDate ? `${fromDate} 00:00:00` : null;
        const toVal = toDate ? `${toDate} 23:59:59` : null;

        const isBroadSearch = Boolean(orderBillNo || patWoNum || mrnSearch || sampleId || workOrderIdSearch);

        const params: Array<{ Key: number; Value: any }> = [
          { Key: 3, Value: isBroadSearch ? null : (workOrderStatusId ? Number(workOrderStatusId) : 5) },
          { Key: 28, Value: orderBillNo || null },
          { Key: 32, Value: patWoNum || null },
          { Key: 6, Value: reactProps?.currentfilter?.TestTypeId || 1 },
          { Key: 8, Value: mrnSearch || null },
          { Key: 9, Value: workOrderIdSearch || null },
          { Key: 38, Value: isBroadSearch ? null : fromVal },
          { Key: 39, Value: isBroadSearch ? null : toVal },
          { Key: 29, Value: reactProps?.facilityId || sessionHelper.getCurrentFacilityId() || 1 },
          { Key: 23, Value: subDepartmentId > 0 ? subDepartmentId : null },
          { Key: 35, Value: sampleId || null },
        ];

        const res = await callBackendApi<{
          Data: ApprovalOrderEntity[];
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
        console.error('Failed to fetch approval orders standalone:', err);
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
      workOrderIdSearch,
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
          { Key: 'Ward' },
          { Key: 'Guarantor' },
          { Key: 'GuarantorType' },
          { Key: 'LabAssignType' },
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
              Ward: data.Ward || [],
              Guarantor: data.Guarantor || [],
              GuarantorType: data.GuarantorType || [],
              LabAssignType: data.LabAssignType || [],
            });
          }
        })
        .catch(console.error);

      fetchStandaloneOrders(1, 25);
    }
  }, [isHybrid, fetchStandaloneOrders]);

  // Items and paging
  const allItems: ApprovalOrderEntity[] = useMemo(() => {
    return isHybrid ? (rawItems as ApprovalOrderEntity[]) || [] : standaloneItems;
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
    ? 'Radiology Result Approvals — Imaging Workstation'
    : isEndoscopy
    ? 'Endoscopy Result Approvals'
    : 'Result Approvals — Diagnostic Workstation';

  const screenBadge = isRadiology
    ? 'RIS RADIOLOGY'
    : isEndoscopy
    ? 'ENDOSCOPY'
    : 'LIS LABORATORY MEDICINE';

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    let awaitingCount = 0;
    let approvedCount = 0;
    let partialCount = 0;
    let criticalCount = 0;

    for (const item of allItems) {
      const stId = Number(item.WorkOrderStatusId);
      const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();

      if (stId === 5 || stName.includes('SEND') || stName.includes('APPROVAL')) awaitingCount++;
      else if (stId === 7 || stName.includes('FULLY APPROVED') || stName.includes('APPROVED')) approvedCount++;
      else if (stId === 9 || stName.includes('PARTIAL')) partialCount++;

      if (item.IsCriticalOrder || item.ColorStatus === 11 || (item.OrderPriority?.Description || '').toUpperCase().includes('STAT')) {
        criticalCount++;
      }
    }

    return {
      total: totalItems,
      loadedCount: allItems.length,
      awaiting: awaitingCount,
      approved: approvedCount,
      partial: partialCount,
      critical: criticalCount,
    };
  }, [allItems, totalItems]);

  // Client-side KPI filter & quick filter
  const displayItems = useMemo(() => {
    return allItems.filter((item) => {
      if (activeKpiFilter === 'awaiting') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 5 && !stName.includes('SEND') && !stName.includes('APPROVAL')) return false;
      } else if (activeKpiFilter === 'approved') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 7 && !stName.includes('FULLY APPROVED') && !stName.includes('APPROVED')) return false;
      } else if (activeKpiFilter === 'partial') {
        const stId = Number(item.WorkOrderStatusId);
        const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();
        if (stId !== 9 && !stName.includes('PARTIAL')) return false;
      } else if (activeKpiFilter === 'critical') {
        if (!item.IsCriticalOrder && item.ColorStatus !== 11 && !(item.OrderPriority?.Description || '').toUpperCase().includes('STAT')) {
          return false;
        }
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
        PatientMRN: mrnSearch,
        OrderBillNo: orderBillNo,
        WorkOrderdid: workOrderIdSearch,
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
        PatientMRN: mrnSearch,
        OrderBillNo: orderBillNo,
        WorkOrderdid: workOrderIdSearch,
        WorkOrderStatusId: workOrderStatusId || null,
        EncounterTypeId: encounterTypeId > 0 ? encounterTypeId : -1,
        SubDepartmentId: subDepartmentId > 0 ? subDepartmentId : -1,
        DoctorId: doctorId > 0 ? doctorId : undefined,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1, standalonePageSize);
    }
  };

  // Reset filters
  const handleResetFilter = () => {
    setSampleId('');
    setPatWoNum('');
    setMrnSearch('');
    setOrderBillNo('');
    setWorkOrderIdSearch('');
    setFromDate(defaultPast7);
    setToDate(defaultToday);
    setActiveDatePreset('7days');
    setWorkOrderStatusId('');
    setEncounterTypeId(-1);
    setSubDepartmentId(-1);
    setDoctorId(-1);
    setActiveKpiFilter('all');

    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: new Date(`${defaultPast7}T00:00:00`),
        ToDate: new Date(`${defaultToday}T23:59:59`),
        SampleIdentifier: '',
        PatWoNum: '',
        PatientMRN: '',
        OrderBillNo: '',
        WorkOrderdid: '',
        WorkOrderStatusId: null,
        EncounterTypeId: -1,
        SubDepartmentId: -1,
        DoctorId: -1,
      });
    } else {
      setStandalonePage(1);
      setTimeout(() => fetchStandaloneOrders(1, standalonePageSize), 50);
    }
  };

  // Pagination Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage, pageSize });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneOrders(newPage, standalonePageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: 1, pageSize: newSize });
    } else {
      setStandalonePageSize(newSize);
      setStandalonePage(1);
      fetchStandaloneOrders(1, newSize);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Status Badge
  const renderStatusBadge = (item: ApprovalOrderEntity) => {
    const stId = Number(item.WorkOrderStatusId);
    const stName = (item.WorkOrderStatus?.DisplayName || '').toUpperCase();

    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#cbd5e1';
    let dotColor = '#94a3b8';
    let isPulse = false;

    if (item.IsCriticalOrder || item.ColorStatus === 11) {
      bg = '#fee2e2';
      color = '#991b1b';
      border = '#fca5a5';
      dotColor = '#ef4444';
      isPulse = true;
    } else if (item.IsPrinted || item.ColorStatus === 10) {
      bg = '#ffedd5';
      color = '#9a3412';
      border = '#fdba74';
      dotColor = '#f97316';
    } else if (stId === 5 || stName.includes('SEND') || stName.includes('APPROVAL')) {
      bg = '#e0e7ff';
      color = '#3730a3';
      border = '#c7d2fe';
      dotColor = '#6366f1';
      isPulse = true;
    } else if (stId === 7 || stName.includes('FULLY APPROVED') || stName.includes('APPROVED')) {
      bg = '#d1fae5';
      color = '#065f46';
      border = '#a7f3d0';
      dotColor = '#10b981';
    } else if (stId === 9 || stName.includes('PARTIAL')) {
      bg = '#fef3c7';
      color = '#92400e';
      border = '#fde68a';
      dotColor = '#f59e0b';
    } else if (stId === 6 || stName.includes('PROGRESS')) {
      bg = '#fee2e2';
      color = '#991b1b';
      border = '#fecaca';
      dotColor = '#ef4444';
    } else if (stId === 1 || stName.includes('CREATED')) {
      bg = '#e0f2fe';
      color = '#0369a1';
      border = '#bae6fd';
      dotColor = '#0ea5e9';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: radii.full,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: isPulse ? `0 0 0 2px ${border}` : undefined,
            animation: isPulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined,
          }}
        />
        {item.WorkOrderStatus?.DisplayName || 'PENDING'}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        fontFamily: typography.fontFamily,
        color: colors.neutral[800],
        padding: spacing.md,
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          padding: `${spacing.md} ${spacing.lg}`,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: radii.md,
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '22px',
              border: '1px solid #a7f3d0',
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: 0,
                  color: colors.neutral[900],
                  letterSpacing: '-0.3px',
                }}
              >
                {screenTitle}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#065f46',
                  backgroundColor: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  border: '1px solid #a7f3d0',
                  letterSpacing: '0.4px',
                }}
              >
                {screenBadge}
              </span>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: colors.neutral[500],
                margin: '2px 0 0 0',
              }}
            >
              Review, validate, approve, and amend diagnostic results and turnaround tracking.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: colors.neutral[50],
              borderRadius: radii.full,
              border: `1px solid ${colors.neutral[200]}`,
              fontSize: '12px',
              fontWeight: 600,
              color: colors.neutral[700],
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: colors.success,
              }}
            />
            {reactProps?.facilityName || sessionHelper.getCurrentFacilityName() || 'SHUVADARSINI HOSPITAL'}
          </div>

          <button
            onClick={() => {
              if (isHybrid && onAction) onAction('refresh');
              else fetchStandaloneOrders(currentPage, pageSize);
            }}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: colors.white,
              border: `1px solid ${colors.neutral[300]}`,
              fontSize: '12px',
              fontWeight: 600,
              color: colors.neutral[700],
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: shadows.xs,
              transition: 'all 0.15s ease',
            }}
            title="Refresh list"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'fa-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => {
              if (isHybrid && onAction) onAction('dashboard');
              else window.location.hash = isRadiology ? '#/app/risdashboard' : '#/app/labdashboard';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: colors.white,
              border: `1px solid ${colors.neutral[300]}`,
              fontSize: '12px',
              fontWeight: 600,
              color: colors.neutral[700],
              cursor: 'pointer',
              boxShadow: shadows.xs,
              transition: 'all 0.15s ease',
            }}
            title="Return to Dashboard"
          >
            <i className="fa-solid fa-house" />
            Dashboard
          </button>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md,
        }}
      >
        {/* Card 1: Total */}
        <div
          onClick={() => setActiveKpiFilter('all')}
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            border: activeKpiFilter === 'all' ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.neutral[200]}`,
            boxShadow: activeKpiFilter === 'all' ? shadows.md : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: colors.primary[700], textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              TOTAL WORK ORDERS
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: colors.neutral[900], margin: '4px 0 2px 0' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
              Matching current filters
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.md,
              backgroundColor: colors.primary[50],
              color: colors.primary[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa-solid fa-list-check" />
          </div>
        </div>

        {/* Card 2: Awaiting Approval (Key Focus) */}
        <div
          onClick={() => setActiveKpiFilter('awaiting')}
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            border: activeKpiFilter === 'awaiting' ? '2px solid #6366f1' : '1px solid #e0e7ff',
            boxShadow: activeKpiFilter === 'awaiting' ? shadows.md : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: '#6366f1',
            }}
          />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              AWAITING APPROVAL
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#3730a3', margin: '4px 0 2px 0' }}>
              {stats.awaiting}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
              Pending doctor signoff
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.md,
              backgroundColor: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa-solid fa-hourglass-half" />
          </div>
        </div>

        {/* Card 3: Fully Approved */}
        <div
          onClick={() => setActiveKpiFilter('approved')}
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            border: activeKpiFilter === 'approved' ? '2px solid #10b981' : '1px solid #d1fae5',
            boxShadow: activeKpiFilter === 'approved' ? shadows.md : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              FULLY APPROVED
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', margin: '4px 0 2px 0' }}>
              {stats.approved}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
              Verified & ready to release
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.md,
              backgroundColor: '#d1fae5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
        </div>

        {/* Card 4: Partially Approved */}
        <div
          onClick={() => setActiveKpiFilter('partial')}
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            border: activeKpiFilter === 'partial' ? '2px solid #f59e0b' : '1px solid #fef3c7',
            boxShadow: activeKpiFilter === 'partial' ? shadows.md : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              PARTIALLY APPROVED
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#92400e', margin: '4px 0 2px 0' }}>
              {stats.partial}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
              Multi-test partial results
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.md,
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa-solid fa-clipboard-list" />
          </div>
        </div>

        {/* Card 5: Critical / STAT */}
        <div
          onClick={() => setActiveKpiFilter('critical')}
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.lg,
            padding: `${spacing.md} ${spacing.lg}`,
            border: activeKpiFilter === 'critical' ? '2px solid #ef4444' : '1px solid #fee2e2',
            boxShadow: activeKpiFilter === 'critical' ? shadows.md : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              CRITICAL / STAT
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', margin: '4px 0 2px 0' }}>
              {stats.critical}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
              High-priority immediate review
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.md,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          padding: spacing.lg,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        {/* Date Quick Presets Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.sm,
            paddingBottom: spacing.sm,
            borderBottom: `1px solid ${colors.neutral[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.neutral[600], marginRight: spacing.xs }}>
              <i className="fa-regular fa-calendar-days" style={{ marginRight: '6px' }} />
              Date Quick-Filters:
            </span>
            {(['today', 'yesterday', '7days', '30days', 'all'] as const).map((preset) => {
              const labels: Record<string, string> = {
                today: 'Today',
                yesterday: 'Yesterday',
                '7days': 'Last 7 Days',
                '30days': 'Last 30 Days',
                all: 'All Dates',
              };
              const isActive = activeDatePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handleDatePreset(preset)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: radii.full,
                    border: isActive ? `1px solid ${colors.primary[600]}` : `1px solid ${colors.neutral[200]}`,
                    backgroundColor: isActive ? colors.primary[600] : colors.neutral[50],
                    color: isActive ? colors.white : colors.neutral[700],
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labels[preset]}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '12px', color: colors.neutral[500] }}>
            Loaded <strong>{displayItems.length}</strong> of <strong>{totalItems}</strong> orders
          </div>
        </div>

        {/* Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
          }}
        >
          {/* Sample ID */}
          {!isRadiology && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
                Sample Identifier
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa-solid fa-vial"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.neutral[400],
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder="e.g. 10094"
                  value={sampleId}
                  onChange={(e) => setSampleId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.neutral[300]}`,
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Name / UHID / WO # */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              Patient Name / WO #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-user"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.neutral[400],
                  fontSize: '13px',
                }}
              />
              <input
                type="text"
                placeholder="Search Name or WO#"
                value={patWoNum}
                onChange={(e) => setPatWoNum(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* UHID / MRN */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              UHID / MRN
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-id-card"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.neutral[400],
                  fontSize: '13px',
                }}
              />
              <input
                type="text"
                placeholder="e.g. UHID1320"
                value={mrnSearch}
                onChange={(e) => setMrnSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Order # / Bill # */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              Order # / Bill #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-receipt"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.neutral[400],
                  fontSize: '13px',
                }}
              />
              <input
                type="text"
                placeholder="e.g. ORD-10098"
                value={orderBillNo}
                onChange={(e) => setOrderBillNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Second Row: Dates & Selects */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: spacing.md,
          }}
        >
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Work Order Status */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              Work Order Status
            </label>
            <select
              value={workOrderStatusId}
              onChange={(e) => setWorkOrderStatusId(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '12px',
                outline: 'none',
                backgroundColor: colors.white,
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Statuses</option>
              {lookups.WorkOrderStatus.map((opt) => (
                <option key={opt.Id} value={String(opt.Id)}>
                  {opt.Text || opt.DisplayName || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              Sub Department
            </label>
            <select
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '12px',
                outline: 'none',
                backgroundColor: colors.white,
                boxSizing: 'border-box',
              }}
            >
              <option value="-1">All Sub Departments</option>
              {lookups.Department.map((opt) => (
                <option key={opt.Id} value={Number(opt.Id)}>
                  {opt.Text || opt.Description || (opt as any).DepartmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Type */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px', textTransform: 'uppercase' }}>
              Patient Type
            </label>
            <select
              value={encounterTypeId}
              onChange={(e) => setEncounterTypeId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '12px',
                outline: 'none',
                backgroundColor: colors.white,
                boxSizing: 'border-box',
              }}
            >
              <option value="-1">All Patient Types</option>
              {lookups.EncounterType.map((opt) => (
                <option key={opt.Id} value={Number(opt.Id)}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing.sm }}>
            <button
              onClick={handleResetFilter}
              style={{
                padding: '8px 14px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.white,
                color: colors.neutral[700],
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '35px',
              }}
            >
              <i className="fa-solid fa-rotate-left" />
              Reset
            </button>

            <button
              onClick={handleApplyFilter}
              style={{
                padding: '8px 18px',
                borderRadius: radii.md,
                border: 'none',
                backgroundColor: '#10b981',
                color: colors.white,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '35px',
                boxShadow: shadows.sm,
                transition: 'background 0.15s ease',
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
              Fetch Orders
            </button>

            <button
              onClick={() => setIsAdvancedOpen(true)}
              style={{
                padding: '8px 12px',
                borderRadius: radii.md,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.neutral[50],
                color: colors.neutral[700],
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                height: '35px',
              }}
              title="Advanced Filters"
            >
              <i className="fa-solid fa-sliders" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Orders Data Table */}
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.sm,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `2px solid ${colors.neutral[200]}`,
                  color: colors.neutral[700],
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                <th style={{ padding: '12px 14px', width: '40px' }}>#</th>
                <th style={{ padding: '12px 14px' }}>Work Order No</th>
                <th style={{ padding: '12px 14px' }}>Order / Bill No</th>
                {!isRadiology && <th style={{ padding: '12px 14px' }}>Sample ID</th>}
                <th style={{ padding: '12px 14px' }}>Type</th>
                <th style={{ padding: '12px 14px' }}>Order Date & Time</th>
                <th style={{ padding: '12px 14px' }}>MRN / UHID</th>
                <th style={{ padding: '12px 14px' }}>Patient Details</th>
                <th style={{ padding: '12px 14px' }}>Ordered By</th>
                <th style={{ padding: '12px 14px' }}>Sub Department</th>
                <th style={{ padding: '12px 14px' }}>Room Details</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isRadiology ? 12 : 13} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#10b981' }} />
                      <span style={{ fontSize: '13px', color: colors.neutral[600] }}>Loading approval orders...</span>
                    </div>
                  </td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan={isRadiology ? 12 : 13} style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          backgroundColor: colors.neutral[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.neutral[400],
                          fontSize: '22px',
                        }}
                      >
                        <i className="fa-regular fa-folder-open" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: colors.neutral[800] }}>
                        No Diagnostic Work Orders Found
                      </div>
                      <div style={{ fontSize: '12px', color: colors.neutral[500], maxWidth: '380px' }}>
                        No orders match the current status and date filters. Try selecting "Last 7 Days" or "All Dates" to expand the search range.
                      </div>
                      <button
                        onClick={handleResetFilter}
                        style={{
                          marginTop: spacing.xs,
                          padding: '6px 16px',
                          borderRadius: radii.md,
                          backgroundColor: colors.primary[50],
                          color: colors.primary[700],
                          border: `1px solid ${colors.primary[200]}`,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayItems.map((item, index) => {
                  const woNumber = item.WorkOrderdid || item.WorkOrderId || `WO-${item.Id}`;
                  const orderNumber = item.PatientOrder?.OrderNumber || '—';
                  const billNumber = item.PatientOrder?.BillNumber;
                  const patientMrn = item.Patient?.MRN || item.PatientMrn || '—';
                  const patientName = [item.Patient?.Title?.Description, item.Patient?.FirstName, item.Patient?.LastName]
                    .filter(Boolean)
                    .join(' ') || item.PatientName || 'Unknown Patient';
                  const patientAgeGender = [item.Patient?.Age ? `${item.Patient.Age}y` : '', item.Patient?.Gender?.Description || '']
                    .filter(Boolean)
                    .join(' / ');

                  const encType = item.Encounter?.EncounterType?.Description || 'OP';
                  const dateTimeObj = formatDisplayDateTime(item.Ordereddate || item.CreatedAt);

                  const doctorName = [item.Orderedby?.Title?.Description, item.Orderedby?.FirstName, item.Orderedby?.LastName]
                    .filter(Boolean)
                    .join(' ') || item.Orderedbyname || '—';

                  const subDeptName = item.SubDepartment?.DepartmentName || '—';

                  const roomDetail = [
                    item.Encounter?.WardMaster?.WardName,
                    item.Encounter?.WardRoomMaster?.RoomNo,
                    item.Encounter?.WardRoomBedMaster?.BedNo,
                  ]
                    .filter(Boolean)
                    .join(' / ') || '—';

                  // Row background highlighting for critical/printed/attention orders
                  let rowBg = 'transparent';
                  if (item.IsCriticalOrder || item.ColorStatus === 11) {
                    rowBg = '#fff1f2';
                  } else if (item.IsPrinted || item.ColorStatus === 10) {
                    rowBg = '#fffbeb';
                  } else if (item.ColorStatus === 6) {
                    rowBg = '#fef2f2';
                  }

                  const rowNumber = (currentPage - 1) * pageSize + (index + 1);

                  return (
                    <tr
                      key={item.Id}
                      style={{
                        backgroundColor: rowBg,
                        borderBottom: `1px solid ${colors.neutral[200]}`,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (rowBg === 'transparent') e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (rowBg === 'transparent') e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* # */}
                      <td style={{ padding: '10px 14px', color: colors.neutral[500], fontWeight: 500 }}>
                        {rowNumber}
                      </td>

                      {/* Work Order No */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            onClick={() => {
                              if (isHybrid && onAction) onAction('edit', item);
                              else window.location.hash = `#/app/resultentry/${item.Id}`;
                            }}
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              padding: '2px 8px',
                              borderRadius: radii.sm,
                              border: '1px solid #bfdbfe',
                              cursor: 'pointer',
                            }}
                            title="Click to review & approve"
                          >
                            {woNumber}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(woNumber, e)}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: copiedId === woNumber ? colors.success : colors.neutral[400],
                              padding: '2px',
                              fontSize: '11px',
                            }}
                            title="Copy Work Order Number"
                          >
                            <i className={copiedId === woNumber ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
                          </button>
                        </div>
                      </td>

                      {/* Order / Bill No */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: colors.neutral[800] }}>
                          {orderNumber}
                        </div>
                        {billNumber && (
                          <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
                            Bill: {billNumber}
                          </div>
                        )}
                      </td>

                      {/* Sample ID */}
                      {!isRadiology && (
                        <td style={{ padding: '10px 14px' }}>
                          {item.SampleIdentifier ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: radii.full,
                                backgroundColor: '#f5f3ff',
                                color: '#7c3aed',
                                border: '1px solid #ddd6fe',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <i className="fa-solid fa-tag" style={{ fontSize: '9px' }} />
                              {item.SampleIdentifier}
                            </span>
                          ) : (
                            <span style={{ color: colors.neutral[400] }}>—</span>
                          )}
                        </td>
                      )}

                      {/* Type (OP / IP) */}
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: radii.sm,
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: encType.toUpperCase().includes('IP') ? '#fef3c7' : '#e0f2fe',
                            color: encType.toUpperCase().includes('IP') ? '#92400e' : '#0369a1',
                            border: encType.toUpperCase().includes('IP') ? '1px solid #fde68a' : '1px solid #bae6fd',
                          }}
                        >
                          {encType}
                        </span>
                      </td>

                      {/* Order Date & Time */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: colors.neutral[800], display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-regular fa-calendar" style={{ fontSize: '11px', color: colors.neutral[400] }} />
                          {dateTimeObj.date}
                        </div>
                        {dateTimeObj.time && (
                          <div style={{ fontSize: '11px', color: colors.neutral[500], paddingLeft: '15px' }}>
                            {dateTimeObj.time}
                          </div>
                        )}
                      </td>

                      {/* MRN / UHID */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: colors.neutral[700],
                              backgroundColor: colors.neutral[100],
                              padding: '2px 6px',
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.neutral[200]}`,
                            }}
                          >
                            {patientMrn}
                          </span>
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td style={{ padding: '10px 14px' }}>
                        <div
                          onClick={() => {
                            if (isHybrid && onAction) onAction('patientinfo', item);
                            else setActivePatientItem(item);
                          }}
                          style={{
                            fontWeight: 700,
                            color: colors.primary[700],
                            cursor: 'pointer',
                          }}
                          title="View Patient Profile"
                        >
                          {patientName}
                        </div>
                        {patientAgeGender && (
                          <div style={{ fontSize: '11px', color: colors.neutral[500] }}>
                            {patientAgeGender}
                          </div>
                        )}
                      </td>

                      {/* Ordered By */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fa-solid fa-user-doctor" style={{ fontSize: '11px', color: colors.neutral[400] }} />
                          <span style={{ fontWeight: 500, color: colors.neutral[800] }}>{doctorName}</span>
                        </div>
                      </td>

                      {/* Sub Department */}
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: colors.neutral[50],
                            color: colors.neutral[700],
                            border: `1px solid ${colors.neutral[200]}`,
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {subDeptName}
                        </span>
                      </td>

                      {/* Room Details */}
                      <td style={{ padding: '10px 14px', color: colors.neutral[600], fontSize: '11px' }}>
                        {roomDetail}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '10px 14px' }}>
                        {renderStatusBadge(item)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* 1. Review & Approve */}
                          <button
                            onClick={() => {
                              if (isHybrid && onAction) onAction('edit', item);
                              else window.location.hash = `#/app/resultentry/${item.Id}`;
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              border: '1px solid #a7f3d0',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              boxShadow: shadows.xs,
                              transition: 'all 0.15s ease',
                            }}
                            title="Approve / Review Result"
                          >
                            <i className="fa-solid fa-check" />
                          </button>

                          {/* 2. Amend Result */}
                          <button
                            onClick={() => {
                              if (isHybrid && onAction) onAction('amend', item);
                              else window.location.hash = `#/app/amendresultentry/${item.Id}`;
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              border: '1px solid #ddd6fe',
                              backgroundColor: '#f5f3ff',
                              color: '#7c3aed',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              boxShadow: shadows.xs,
                              transition: 'all 0.15s ease',
                            }}
                            title="Amend Result"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>

                          {/* 3. Turnaround Time (TAT) */}
                          <button
                            onClick={() => {
                              if (isHybrid && onAction) onAction('ordertat', item);
                              else setActiveTatItem(item);
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              border: '1px solid #bfdbfe',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              boxShadow: shadows.xs,
                              transition: 'all 0.15s ease',
                            }}
                            title="Turnaround Time (TAT) Tracking"
                          >
                            <i className="fa-solid fa-clock-rotate-left" />
                          </button>

                          {/* 4. Order History */}
                          <button
                            onClick={() => {
                              if (isHybrid && onAction) onAction('orderhistory', item);
                              else window.location.hash = `#/app/resultentryorderhistory/${item.Id}`;
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              border: `1px solid ${colors.neutral[200]}`,
                              backgroundColor: colors.neutral[50],
                              color: colors.neutral[600],
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              boxShadow: shadows.xs,
                              transition: 'all 0.15s ease',
                            }}
                            title="Order Audit & History"
                          >
                            <i className="fa-solid fa-book-medical" />
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

        {/* 5. Pagination Footer */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.lg}`,
            borderTop: `1px solid ${colors.neutral[200]}`,
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span style={{ fontSize: '12px', color: colors.neutral[600] }}>
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of <strong>{totalItems}</strong> entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: colors.neutral[500] }}>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '11px',
                  backgroundColor: colors.white,
                  color: colors.neutral[700],
                  outline: 'none',
                }}
              >
                {[10, 25, 50, 100].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              style={{
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.white,
                color: currentPage <= 1 ? colors.neutral[400] : colors.neutral[700],
                fontSize: '11px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
              title="First Page"
            >
              <i className="fa-solid fa-angles-left" />
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.white,
                color: currentPage <= 1 ? colors.neutral[400] : colors.neutral[700],
                fontSize: '11px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
              title="Previous Page"
            >
              <i className="fa-solid fa-angle-left" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = currentPage;
              if (totalPages <= 5) pNum = i + 1;
              else if (currentPage <= 3) pNum = i + 1;
              else if (currentPage >= totalPages - 2) pNum = totalPages - 4 + i;
              else pNum = currentPage - 2 + i;

              const isCurr = pNum === currentPage;
              return (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: radii.sm,
                    border: isCurr ? '1px solid #10b981' : `1px solid ${colors.neutral[300]}`,
                    backgroundColor: isCurr ? '#10b981' : colors.white,
                    color: isCurr ? colors.white : colors.neutral[700],
                    fontSize: '11px',
                    fontWeight: isCurr ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.white,
                color: currentPage >= totalPages ? colors.neutral[400] : colors.neutral[700],
                fontSize: '11px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
              title="Next Page"
            >
              <i className="fa-solid fa-angle-right" />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              style={{
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.neutral[300]}`,
                backgroundColor: colors.white,
                color: currentPage >= totalPages ? colors.neutral[400] : colors.neutral[700],
                fontSize: '11px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
              title="Last Page"
            >
              <i className="fa-solid fa-angles-right" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Advanced Filters Modal */}
      {isAdvancedOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
          }}
          onClick={() => setIsAdvancedOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: '560px',
              border: `1px solid ${colors.neutral[200]}`,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <i className="fa-solid fa-sliders" style={{ color: '#10b981', fontSize: '16px' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.neutral[800] }}>
                  Advanced Search Filters
                </h3>
              </div>
              <button
                onClick={() => setIsAdvancedOpen(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: colors.neutral[400],
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px' }}>
                    Ward / Room
                  </label>
                  <select
                    value={advancedWardId}
                    onChange={(e) => setAdvancedWardId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '12px',
                      backgroundColor: colors.white,
                    }}
                  >
                    <option value="-1">All Wards</option>
                    {lookups.Ward.map((w) => (
                      <option key={w.Id} value={Number(w.Id)}>
                        {w.Text || w.Description || (w as any).WardName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px' }}>
                    Doctor / Consultant
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '12px',
                      backgroundColor: colors.white,
                    }}
                  >
                    <option value="-1">All Doctors</option>
                    {lookups.Doctor.map((d) => (
                      <option key={d.Id} value={Number(d.Id)}>
                        {d.Text || d.Description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px' }}>
                    Guarantor / Sponsor
                  </label>
                  <select
                    value={advancedGuarantorId}
                    onChange={(e) => setAdvancedGuarantorId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '12px',
                      backgroundColor: colors.white,
                    }}
                  >
                    <option value="-1">All Guarantors</option>
                    {lookups.Guarantor.map((g) => (
                      <option key={g.Id} value={Number(g.Id)}>
                        {g.Text || g.Description || (g as any).GuarantorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px' }}>
                    Guarantor Type
                  </label>
                  <select
                    value={advancedGuarantorTypeId}
                    onChange={(e) => setAdvancedGuarantorTypeId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '12px',
                      backgroundColor: colors.white,
                    }}
                  >
                    <option value="-1">All Guarantor Types</option>
                    {lookups.GuarantorType.map((gt) => (
                      <option key={gt.Id} value={Number(gt.Id)}>
                        {gt.Text || gt.Description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.neutral[700], marginBottom: '4px' }}>
                  Reference No #
                </label>
                <input
                  type="text"
                  placeholder="Enter external or department reference no"
                  value={advancedReferenceNo}
                  onChange={(e) => setAdvancedReferenceNo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.neutral[300]}`,
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: '#f8fafc',
                borderTop: `1px solid ${colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: spacing.sm,
              }}
            >
              <button
                onClick={() => {
                  setAdvancedWardId(-1);
                  setAdvancedGuarantorId(-1);
                  setAdvancedGuarantorTypeId(-1);
                  setAdvancedReferenceNo('');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.neutral[300]}`,
                  backgroundColor: colors.white,
                  color: colors.neutral[700],
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setIsAdvancedOpen(false);
                  handleApplyFilter();
                }}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md,
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: colors.white,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Standalone Fallback TAT Modal */}
      {activeTatItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
          }}
          onClick={() => setActiveTatItem(null)}
        >
          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '95%',
              maxWidth: '1100px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${colors.neutral[200]}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: spacing.md, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveTatItem(null)}
                style={{
                  border: 'none',
                  backgroundColor: colors.neutral[100],
                  borderRadius: radii.full,
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <TatDetailsModalScreen
              reactProps={{
                pid: activeTatItem.PatientId || activeTatItem.Patient?.Id,
                oid: activeTatItem.PatientOrder?.Id || activeTatItem.Orderid,
                odid: activeTatItem.PatientOrderDetailId || activeTatItem.Id,
                testtypeid: activeTatItem.TestTypeId || 1,
              }}
              onAction={() => setActiveTatItem(null)}
            />
          </div>
        </div>
      )}

      {/* 8. Standalone Fallback Patient Profile Modal */}
      {activePatientItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
          }}
          onClick={() => setActivePatientItem(null)}
        >
          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '90%',
              maxWidth: '540px',
              overflow: 'hidden',
              border: `1px solid ${colors.neutral[200]}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: colors.primary[600],
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <i className="fa-solid fa-user-circle" style={{ fontSize: '20px' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    Patient Quick Summary
                  </h3>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>
                    MRN: {activePatientItem.Patient?.MRN || activePatientItem.PatientMrn || '—'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePatientItem(null)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: colors.white,
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm, fontSize: '13px' }}>
                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Full Name</span>
                  <strong>
                    {[activePatientItem.Patient?.Title?.Description, activePatientItem.Patient?.FirstName, activePatientItem.Patient?.LastName]
                      .filter(Boolean)
                      .join(' ') || activePatientItem.PatientName || '—'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Age / Gender</span>
                  <strong>
                    {[activePatientItem.Patient?.Age ? `${activePatientItem.Patient.Age} Years` : '', activePatientItem.Patient?.Gender?.Description]
                      .filter(Boolean)
                      .join(' / ') || '—'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Mobile Number</span>
                  <strong>{activePatientItem.Patient?.Mobile || activePatientItem.PatientMobile || '—'}</strong>
                </div>

                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Visit Identifier</span>
                  <strong>{activePatientItem.Encounter?.VisitIdentifier || '—'}</strong>
                </div>

                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Guarantor</span>
                  <strong>{activePatientItem.Encounter?.Guarantor?.GuarantorName || 'CASH'}</strong>
                </div>

                <div>
                  <span style={{ color: colors.neutral[500], fontSize: '11px', display: 'block' }}>Attending Doctor</span>
                  <strong>{activePatientItem.Encounter?.DoctorName || activePatientItem.Orderedbyname || '—'}</strong>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: '#f8fafc',
                borderTop: `1px solid ${colors.neutral[200]}`,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setActivePatientItem(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.md,
                  border: 'none',
                  backgroundColor: colors.primary[600],
                  color: colors.white,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
