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

export interface DispatchOrderEntity {
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
  DepartmentId?: number;
  SubDepartmentId?: number;
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
  ReleasedDate?: string | null;
  ReleasedBy?: number | null;
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
    AddressLine1?: string;
    City?: string;
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

export interface ResultDispatchListScreenProps {
  reactProps?: {
    rows?: DispatchOrderEntity[];
    items?: DispatchOrderEntity[];
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
    };
    facilityName?: string;
    facilityId?: number;
    withoutHeader?: boolean;
    tp?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ResultDispatchListScreen: React.FC<ResultDispatchListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid vs Standalone detection
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

  // Date preset calculations
  const defaultToday = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultPast7 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultPast30 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter States
  const [patWoNum, setPatWoNum] = useState<string>(reactProps?.currentfilter?.PatWoNum || '');
  const [orderBillNo, setOrderBillNo] = useState<string>(reactProps?.currentfilter?.OrderBillNo || '');
  const [mrnSearch, setMrnSearch] = useState<string>(reactProps?.currentfilter?.PatientMRN || '');
  const [workOrderdid, setWorkOrderdid] = useState<string>(reactProps?.currentfilter?.WorkOrderdid || '');

  const [fromDate, setFromDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.FromDate) || defaultPast7
  );
  const [toDate, setToDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.ToDate) || defaultToday
  );
  const [workOrderStatusId, setWorkOrderStatusId] = useState<string>(
    reactProps?.currentfilter?.WorkOrderStatusId ? String(reactProps.currentfilter.WorkOrderStatusId) : '7'
  );
  const [encounterTypeId, setEncounterTypeId] = useState<number>(
    reactProps?.currentfilter?.EncounterTypeId !== undefined ? Number(reactProps.currentfilter.EncounterTypeId) : -1
  );
  const [subDepartmentId, setSubDepartmentId] = useState<number>(
    reactProps?.currentfilter?.SubDepartmentId !== undefined ? Number(reactProps.currentfilter.SubDepartmentId) : -1
  );

  const [withoutHeader, setWithoutHeader] = useState<boolean>(
    reactProps?.withoutHeader !== undefined ? reactProps.withoutHeader : true
  );

  const [activeDatePreset, setActiveDatePreset] = useState<string>('7days');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Standalone States (for direct React dev or fallback)
  const [standaloneItems, setStandaloneItems] = useState<DispatchOrderEntity[]>([]);
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
  }>({
    WorkOrderStatus: [],
    EncounterType: [],
    Department: [],
    Doctor: [],
    Ward: [],
  });

  // Modal States
  const [activeTatItem, setActiveTatItem] = useState<DispatchOrderEntity | null>(null);
  const [activePatientItem, setActivePatientItem] = useState<DispatchOrderEntity | null>(null);
  const [releaseConfirmItem, setReleaseConfirmItem] = useState<DispatchOrderEntity | null>(null);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize when reactProps change from AngularJS
  useEffect(() => {
    if (reactProps?.currentfilter) {
      const cf = reactProps.currentfilter;
      if (cf.PatWoNum !== undefined) setPatWoNum(cf.PatWoNum || '');
      if (cf.OrderBillNo !== undefined) setOrderBillNo(cf.OrderBillNo || '');
      if (cf.PatientMRN !== undefined) setMrnSearch(cf.PatientMRN || '');
      if (cf.WorkOrderdid !== undefined) setWorkOrderdid(cf.WorkOrderdid || '');
      if (cf.FromDate !== undefined) setFromDate(toDateInputString(cf.FromDate));
      if (cf.ToDate !== undefined) setToDate(toDateInputString(cf.ToDate));
      if (cf.WorkOrderStatusId !== undefined && cf.WorkOrderStatusId !== null) {
        setWorkOrderStatusId(String(cf.WorkOrderStatusId));
      }
      if (cf.EncounterTypeId !== undefined) setEncounterTypeId(Number(cf.EncounterTypeId));
      if (cf.SubDepartmentId !== undefined) setSubDepartmentId(Number(cf.SubDepartmentId));
    }
    if (reactProps?.withoutHeader !== undefined) {
      setWithoutHeader(reactProps.withoutHeader);
    }
  }, [reactProps?.currentfilter, reactProps?.withoutHeader]);

  // Combined Lookups
  const lookups = useMemo(() => {
    return {
      WorkOrderStatus: reactProps?.lookup?.WorkOrderStatus || standaloneLookups.WorkOrderStatus || [],
      EncounterType: reactProps?.lookup?.EncounterType || standaloneLookups.EncounterType || [],
      Department: reactProps?.lookup?.Department || standaloneLookups.Department || [],
      Doctor: reactProps?.lookup?.Doctor || standaloneLookups.Doctor || [],
      Ward: reactProps?.lookup?.Ward || standaloneLookups.Ward || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Standalone fetch
  const fetchStandaloneOrders = useCallback(
    async (page = 1, size = 25) => {
      setIsLoading(true);
      try {
        const fromVal = fromDate ? `${fromDate} 00:00:00` : null;
        const toVal = toDate ? `${toDate} 23:59:59` : null;
        const isBroad = Boolean(orderBillNo || patWoNum || mrnSearch || workOrderdid);

        const params: Array<{ Key: number; Value: any }> = [
          { Key: 3, Value: isBroad ? null : (workOrderStatusId ? Number(workOrderStatusId) : 7) },
          { Key: 6, Value: reactProps?.tp || reactProps?.currentfilter?.TestTypeId || 1 },
          { Key: 28, Value: orderBillNo || null },
          { Key: 32, Value: patWoNum || null },
          { Key: 9, Value: workOrderdid || null },
          { Key: 16, Value: encounterTypeId > 0 ? encounterTypeId : null },
          { Key: 11, Value: isBroad ? null : fromVal },
          { Key: 12, Value: isBroad ? null : toVal },
          { Key: 23, Value: subDepartmentId > 0 ? subDepartmentId : null },
          { Key: 29, Value: reactProps?.facilityId || sessionHelper.getCurrentFacilityId() || 1 },
        ];

        const payload = {
          Params: params,
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await callBackendApi<{
          Data: DispatchOrderEntity[];
          PageContext: { TotalRecords: number; PageNumber: number; PageSize: number };
        }>({
          action: 'lis/patientworkorder/GetPatientWorkorders',
          data: payload,
          type: 'post',
        });

        if (res && Array.isArray(res.Data)) {
          const processed = res.Data.map((item) => {
            let colorStatus = item.WorkOrderStatusId;
            if (item.IsPrinted) colorStatus = 10;
            return { ...item, ColorStatus: colorStatus };
          });
          setStandaloneItems(processed);
          setStandaloneTotal(res.PageContext?.TotalRecords || processed.length);
        } else {
          setStandaloneItems([]);
          setStandaloneTotal(0);
        }
      } catch (err) {
        console.error('Error fetching dispatch work orders:', err);
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
      workOrderdid,
      encounterTypeId,
      subDepartmentId,
      reactProps?.tp,
      reactProps?.currentfilter?.TestTypeId,
      reactProps?.facilityId,
    ]
  );

  // Fetch Lookups Standalone
  useEffect(() => {
    if (!isHybrid && standaloneLookups.WorkOrderStatus.length === 0) {
      (async () => {
        try {
          const res = await callBackendApi<any>({
            action: 'General/Options/getoptions',
            data: [
              { Key: 'WorkOrderStatus' },
              { Key: 'EncounterType' },
              {
                Key: 'Doctor',
                Request: {
                  Params: [{ Key: 2, Value: [-1, sessionHelper.getCurrentFacilityId() || 1] }],
                },
              },
              { Key: 'Department' },
              { Key: 'Ward' },
            ],
            type: 'post',
          });
          if (res) {
            setStandaloneLookups({
              WorkOrderStatus: res.WorkOrderStatus || [],
              EncounterType: res.EncounterType || [],
              Department: res.Department || [],
              Doctor: res.Doctor || [],
              Ward: res.Ward || [],
            });
          }
        } catch (e) {
          console.error('Error fetching lookups standalone:', e);
        }
      })();
    }
  }, [isHybrid, standaloneLookups.WorkOrderStatus.length]);

  // Initial standalone data load
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneOrders(standalonePage, standalonePageSize);
    }
  }, [isHybrid, fetchStandaloneOrders, standalonePage, standalonePageSize]);

  // Active items list
  const currentItems: DispatchOrderEntity[] = useMemo(() => {
    const raw = isHybrid ? rawItems || [] : standaloneItems;
    return raw.map((item) => {
      let colorStatus = item.WorkOrderStatusId;
      if (item.IsPrinted) colorStatus = 10;
      return { ...item, ColorStatus: colorStatus };
    });
  }, [isHybrid, rawItems, standaloneItems]);

  const totalCount = isHybrid
    ? reactProps?.totalItems ?? reactProps?.pagerObj?.totalItems ?? currentItems.length
    : standaloneTotal;

  const currentPage = isHybrid ? reactProps?.currentPage || 1 : standalonePage;
  const pageSize = isHybrid ? reactProps?.pageSize || 25 : standalonePageSize;

  // KPI Calculations
  const kpiStats = useMemo(() => {
    let approvedCount = 0;
    let releasedCount = 0;
    let printedCount = 0;
    let criticalCount = 0;

    currentItems.forEach((item) => {
      const isRel = item.WorkOrderStatusId === 8 || Boolean(item.ReleasedDate);
      const isApp = item.WorkOrderStatusId === 7;
      const isPrt = Boolean(item.IsPrinted) || item.ColorStatus === 10;
      const isCrit = Boolean(item.IsCriticalOrder) || item.OrderPriorityId === 2 || item.OrderPriorityId === 3;

      if (isRel) releasedCount++;
      else if (isApp) approvedCount++;

      if (isPrt) printedCount++;
      if (isCrit) criticalCount++;
    });

    return {
      total: totalCount,
      approved: approvedCount,
      released: releasedCount,
      printed: printedCount,
      critical: criticalCount,
    };
  }, [currentItems, totalCount]);

  // Filtered Items for Display based on KPI selection or In-Memory filter
  const displayedItems = useMemo(() => {
    if (activeKpiFilter === 'all') return currentItems;
    if (activeKpiFilter === 'approved') {
      return currentItems.filter((i) => i.WorkOrderStatusId === 7 && !i.ReleasedDate);
    }
    if (activeKpiFilter === 'released') {
      return currentItems.filter((i) => i.WorkOrderStatusId === 8 || Boolean(i.ReleasedDate));
    }
    if (activeKpiFilter === 'printed') {
      return currentItems.filter((i) => i.IsPrinted || i.ColorStatus === 10);
    }
    if (activeKpiFilter === 'critical') {
      return currentItems.filter((i) => i.IsCriticalOrder || i.OrderPriorityId === 2 || i.OrderPriorityId === 3);
    }
    return currentItems;
  }, [currentItems, activeKpiFilter]);

  // Preset Date handler
  const handleDatePreset = (preset: string) => {
    setActiveDatePreset(preset);
    let from = '';
    let to = defaultToday;

    if (preset === 'today') {
      from = defaultToday;
    } else if (preset === '7days') {
      from = defaultPast7;
    } else if (preset === '30days') {
      from = defaultPast30;
    } else if (preset === 'all') {
      from = '';
      to = '';
    }

    setFromDate(from);
    setToDate(to);

    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: from ? new Date(from) : null,
        ToDate: to ? new Date(to) : null,
        PatWoNum: patWoNum,
        OrderBillNo: orderBillNo,
        WorkOrderStatusId: workOrderStatusId ? Number(workOrderStatusId) : null,
        SubDepartmentId: subDepartmentId,
        EncounterTypeId: encounterTypeId,
      });
    } else {
      setTimeout(() => fetchStandaloneOrders(1, pageSize), 50);
    }
  };

  // Trigger Search / Fetch
  const handleSearchClick = () => {
    setActiveKpiFilter('all');
    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: fromDate ? new Date(fromDate) : null,
        ToDate: toDate ? new Date(toDate) : null,
        PatWoNum: patWoNum,
        OrderBillNo: orderBillNo,
        WorkOrderdid: workOrderdid,
        PatientMRN: mrnSearch,
        WorkOrderStatusId: workOrderStatusId ? Number(workOrderStatusId) : null,
        SubDepartmentId: subDepartmentId,
        EncounterTypeId: encounterTypeId,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1, pageSize);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setPatWoNum('');
    setOrderBillNo('');
    setMrnSearch('');
    setWorkOrderdid('');
    setWorkOrderStatusId('');
    setEncounterTypeId(-1);
    setSubDepartmentId(-1);
    setFromDate(defaultPast7);
    setToDate(defaultToday);
    setActiveDatePreset('7days');
    setActiveKpiFilter('all');

    if (isHybrid && onAction) {
      onAction('search', {
        FromDate: new Date(defaultPast7),
        ToDate: new Date(defaultToday),
        PatWoNum: '',
        OrderBillNo: '',
        WorkOrderdid: '',
        PatientMRN: '',
        WorkOrderStatusId: null,
        SubDepartmentId: -1,
        EncounterTypeId: -1,
      });
    } else {
      setTimeout(() => fetchStandaloneOrders(1, pageSize), 50);
    }
  };

  // Header toggle handler
  const handleToggleWithoutHeader = (val: boolean) => {
    setWithoutHeader(val);
    if (isHybrid && onAction) {
      onAction('toggleWithoutHeader', val);
    }
  };

  // Action Handlers
  const handleReleaseClick = (item: DispatchOrderEntity) => {
    setReleaseConfirmItem(item);
  };

  const handleConfirmRelease = async () => {
    if (!releaseConfirmItem) return;
    setIsReleasing(true);

    try {
      if (isHybrid && onAction) {
        onAction('release', releaseConfirmItem);
        setToastMessage(`Result for Work Order ${releaseConfirmItem.WorkOrderdid || releaseConfirmItem.Id} successfully released!`);
      } else {
        const payload = {
          Id: releaseConfirmItem.Id,
          Data: {
            itemId: releaseConfirmItem,
            withoutHeader: withoutHeader,
          },
        };
        await callBackendApi({
          action: 'lis/patientworkorder/DispatchResult',
          data: payload,
          type: 'post',
        });
        setToastMessage(`Result for Work Order ${releaseConfirmItem.WorkOrderdid || releaseConfirmItem.Id} successfully released!`);
        await fetchStandaloneOrders(standalonePage, standalonePageSize);
      }
    } catch (err: any) {
      console.error('Failed to release dispatch result:', err);
      alert('Error releasing dispatch result: ' + (err?.message || 'Server error'));
    } finally {
      setIsReleasing(false);
      setReleaseConfirmItem(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handlePrintClick = (item: DispatchOrderEntity, typeVariant?: string) => {
    if (isHybrid && onAction) {
      if (typeVariant) {
        onAction(typeVariant, item);
      } else {
        onAction('print', item);
      }
    } else {
      alert(`Printing report for Work Order ${item.WorkOrderdid || item.Id} (${withoutHeader ? 'Without Hospital Header' : 'With Header'}). In production, PDF opens in a new tab.`);
    }
  };

  const handleTatClick = (item: DispatchOrderEntity) => {
    setActiveTatItem(item);
  };

  const handleHistoryClick = (item: DispatchOrderEntity) => {
    if (isHybrid && onAction) {
      onAction('orderhistory', item);
    } else {
      alert(`Viewing Order History for Work Order ${item.WorkOrderdid || item.Id}`);
    }
  };

  const handlePatientProfileClick = (item: DispatchOrderEntity) => {
    if (isHybrid && onAction) {
      onAction('patientinfo', item);
    } else {
      setActivePatientItem(item);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage, pageSize });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneOrders(newPage, pageSize);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Status Badge Helper
  const renderStatusBadge = (item: DispatchOrderEntity) => {
    const isRel = item.WorkOrderStatusId === 8 || Boolean(item.ReleasedDate);
    const isPrt = Boolean(item.IsPrinted) || item.ColorStatus === 10;
    const statusName = (item.WorkOrderStatus?.DisplayName || item.WorkOrderStatus?.Description || 'PENDING').toUpperCase();

    if (isRel) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            backgroundColor: '#f3e8ff',
            color: '#7e22ce',
            border: '1px solid #d8b4fe',
          }}
        >
          <i className="fa-solid fa-paper-plane" style={{ fontSize: '10px' }} />
          RELEASED
        </span>
      );
    }

    if (item.WorkOrderStatusId === 7) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ fontSize: '10px' }} />
          APPROVED
        </span>
      );
    }

    if (isPrt) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
          }}
        >
          <i className="fa-solid fa-print" style={{ fontSize: '10px' }} />
          PRINTED
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: '1px solid #cbd5e1',
        }}
      >
        <i className="fa-solid fa-clock" style={{ fontSize: '10px' }} />
        {statusName}
      </span>
    );
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priorityName?: string | null) => {
    const p = (priorityName || 'Routine').toLowerCase();
    if (p.includes('stat') || p.includes('urgent') || p.includes('emergency')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#ffe4e6',
            color: '#e11d48',
            border: '1px solid #fecdd3',
          }}
        >
          <i className="fa-solid fa-bolt" />
          STAT
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #bfdbfe',
        }}
      >
        Routine
      </span>
    );
  };

  // Determine Test Type Title Badge
  const tp = reactProps?.tp || reactProps?.currentfilter?.TestTypeId || 1;
  const testTypeLabel = useMemo(() => {
    if (tp === 1) return { name: 'Laboratory Medicine (LIS)', icon: 'fa-vial-virus', bg: '#eff6ff', color: '#1d4ed8' };
    if (tp === 2) return { name: 'Radiology & Imaging (RIS)', icon: 'fa-x-ray', bg: '#fdf2f8', color: '#be185d' };
    if (tp === 4) return { name: 'Endoscopy & Diagnostics', icon: 'fa-stethoscope', bg: '#f0fdf4', color: '#15803d' };
    return { name: 'Diagnostic Results Dispatch', icon: 'fa-notes-medical', bg: '#f8fafc', color: '#334155' };
  }, [tp]);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: typography.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#0f172a',
        padding: spacing.lg,
        boxSizing: 'border-box',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: radii.md,
            boxShadow: shadows.lg,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ fontSize: '18px' }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              marginLeft: '10px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* 1. Header & Navigation Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          padding: '18px 24px',
          boxShadow: shadows.sm,
          marginBottom: spacing.lg,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EMR Order Management
            </span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: testTypeLabel.bg,
                color: testTypeLabel.color,
              }}
            >
              <i className={`fa-solid ${testTypeLabel.icon}`} />
              {testTypeLabel.name}
            </span>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
              }}
            >
              <i className="fa-solid fa-paper-plane" style={{ fontSize: '18px' }} />
            </span>
            Result Dispatch & Delivery Station
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Review approved diagnostic orders, release authorized results for delivery, and generate official patient printouts.
          </p>
        </div>

        {/* Action Controls & Header Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Print Header Toggle Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              padding: '6px 12px',
              borderRadius: radii.lg,
              border: '1px solid #e2e8f0',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              <i className="fa-solid fa-heading" style={{ marginRight: '6px', color: '#2563eb' }} />
              Print Without Header
            </span>
            <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={withoutHeader}
                onChange={(e) => handleToggleWithoutHeader(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: withoutHeader ? '#2563eb' : '#cbd5e1',
                  borderRadius: '20px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    height: '14px',
                    width: '14px',
                    left: withoutHeader ? '20px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: '0.2s',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => (isHybrid && onAction ? onAction('refresh') : fetchStandaloneOrders(currentPage, pageSize))}
            disabled={isLoading}
            title="Refresh Data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`} />
            Refresh
          </button>

          {/* Dashboard Button */}
          <button
            onClick={() => (isHybrid && onAction ? onAction('dashboard') : alert('Navigating to Lab Dashboard'))}
            title="Return to Lab Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: radii.md,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <i className="fa-solid fa-house" />
            Dashboard
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: spacing.lg,
        }}
      >
        {/* KPI: Total */}
        <div
          onClick={() => setActiveKpiFilter('all')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            padding: '16px 20px',
            border: activeKpiFilter === 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            boxShadow: activeKpiFilter === 'all' ? '0 4px 12px rgba(37,99,235,0.12)' : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Work Orders
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
              {kpiStats.total}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>All diagnostic cases</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-layer-group" />
          </div>
        </div>

        {/* KPI: Ready for Dispatch (Approved) */}
        <div
          onClick={() => setActiveKpiFilter('approved')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            padding: '16px 20px',
            border: activeKpiFilter === 'approved' ? '2px solid #059669' : '1px solid #e2e8f0',
            boxShadow: activeKpiFilter === 'approved' ? '0 4px 12px rgba(5,150,105,0.15)' : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ready for Dispatch
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#047857', margin: '2px 0 0' }}>
              {kpiStats.approved}
            </div>
            <div style={{ fontSize: '11px', color: '#059669' }}>Approved & awaiting release</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
        </div>

        {/* KPI: Dispatched / Released */}
        <div
          onClick={() => setActiveKpiFilter('released')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            padding: '16px 20px',
            border: activeKpiFilter === 'released' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
            boxShadow: activeKpiFilter === 'released' ? '0 4px 12px rgba(124,58,237,0.15)' : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Released / Dispatched
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#6d28d9', margin: '2px 0 0' }}>
              {kpiStats.released}
            </div>
            <div style={{ fontSize: '11px', color: '#7c3aed' }}>Results delivered to patient</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-paper-plane" />
          </div>
        </div>

        {/* KPI: Printed */}
        <div
          onClick={() => setActiveKpiFilter('printed')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            padding: '16px 20px',
            border: activeKpiFilter === 'printed' ? '2px solid #d97706' : '1px solid #e2e8f0',
            boxShadow: activeKpiFilter === 'printed' ? '0 4px 12px rgba(217,119,6,0.15)' : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Printed Reports
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', margin: '2px 0 0' }}>
              {kpiStats.printed}
            </div>
            <div style={{ fontSize: '11px', color: '#d97706' }}>Physical copies generated</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-print" />
          </div>
        </div>

        {/* KPI: Critical / STAT */}
        <div
          onClick={() => setActiveKpiFilter('critical')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            padding: '16px 20px',
            border: activeKpiFilter === 'critical' ? '2px solid #e11d48' : '1px solid #e2e8f0',
            boxShadow: activeKpiFilter === 'critical' ? '0 4px 12px rgba(225,29,72,0.15)' : shadows.xs,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              STAT / Critical
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#be123c', margin: '2px 0 0' }}>
              {kpiStats.critical}
            </div>
            <div style={{ fontSize: '11px', color: '#e11d48' }}>High-priority dispatches</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#ffe4e6',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Station */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          padding: '20px 24px',
          boxShadow: shadows.sm,
          marginBottom: spacing.lg,
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Quick Date Range Preset Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Quick Date:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'all', label: 'All Records' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDatePreset(preset.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: activeDatePreset === preset.id ? 700 : 500,
                  backgroundColor: activeDatePreset === preset.id ? '#2563eb' : '#f1f5f9',
                  color: activeDatePreset === preset.id ? '#ffffff' : '#475569',
                  border: activeDatePreset === preset.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {activeKpiFilter !== 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Filtered by KPI:</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                }}
              >
                {activeKpiFilter.toUpperCase()}
                <i
                  className="fa-solid fa-xmark"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveKpiFilter('all')}
                />
              </span>
            </div>
          )}
        </div>

        {/* Main Filter Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end',
          }}
        >
          {/* Universal Search: Name / MRN / WO */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Patient Name / UHID / WO #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '13px' }}
              />
              <input
                type="text"
                value={patWoNum}
                onChange={(e) => setPatWoNum(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                placeholder="Name, UHID, WO#..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Order # / Bill # Search */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Order # / Bill #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-receipt"
                style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '13px' }}
              />
              <input
                type="text"
                value={orderBillNo}
                onChange={(e) => setOrderBillNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                placeholder="ORD-10103, SHIP-11701..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Work Order Status
            </label>
            <select
              value={workOrderStatusId}
              onChange={(e) => setWorkOrderStatusId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Statuses</option>
              <option value="7">Approved (Ready to Dispatch)</option>
              <option value="8">Released (Dispatched)</option>
              <option value="4">Completed</option>
              <option value="5">Send For Approval</option>
              <option value="1">Created</option>
              {lookups.WorkOrderStatus.map((opt) => (
                <option key={opt.Id} value={String(opt.Id)}>
                  {opt.DisplayName || opt.Description || opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Sub Department
            </label>
            <select
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              <option value={-1}>All Sub Departments</option>
              {lookups.Department.map((opt) => (
                <option key={opt.Id} value={Number(opt.Id)}>
                  {opt.Description || opt.Text || opt.DisplayName}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActiveDatePreset('');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActiveDatePreset('');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Action Buttons: Fetch & Reset */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSearchClick}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: radii.md,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
              }}
            >
              <i className="fa-solid fa-filter" />
              Fetch
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset All Filters"
              style={{
                padding: '9px 12px',
                borderRadius: radii.md,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-arrows-rotate" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Results Data Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          boxShadow: shadows.sm,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          marginBottom: spacing.xl,
        }}
      >
        {/* Table Top Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
              Dispatch Work Orders Queue
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#e2e8f0',
                color: '#334155',
              }}
            >
              {displayedItems.length} displayed of {totalCount} total
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing records {startRecord} - {endRecord} of {totalCount}
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '12px 14px', width: '45px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '12px 14px' }}>Work Order #</th>
                <th style={{ padding: '12px 14px' }}>Order & Bill #</th>
                <th style={{ padding: '12px 14px' }}>Date & Time</th>
                <th style={{ padding: '12px 14px' }}>Priority</th>
                <th style={{ padding: '12px 14px' }}>Patient Info</th>
                <th style={{ padding: '12px 14px' }}>Encounter / Ward</th>
                <th style={{ padding: '12px 14px' }}>Sub Department</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Released Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#2563eb', marginBottom: '10px', display: 'block' }} />
                    Loading dispatch records...
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        margin: '0 auto 14px',
                      }}
                    >
                      <i className="fa-solid fa-folder-open" />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      No Work Orders Found
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94a3b8' }}>
                      Try broadening your date range or clearing specific filter parameters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      style={{
                        padding: '6px 14px',
                        borderRadius: radii.md,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Reset Filters to Last 7 Days
                    </button>
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, index) => {
                  const isReleased = item.WorkOrderStatusId === 8 || Boolean(item.ReleasedDate);
                  const isPrinted = Boolean(item.IsPrinted) || item.ColorStatus === 10;
                  const isApproved = item.WorkOrderStatusId === 7;

                  // Row background styling: subtle highlights
                  let rowBg = '#ffffff';
                  if (isReleased) {
                    rowBg = '#faf5ff'; // subtle purple
                  } else if (isPrinted) {
                    rowBg = '#fffdf5'; // subtle gold
                  }

                  const formattedOrderDate = formatDisplayDateTime(item.PatientOrder?.OrderRequestDate || item.Ordereddate);
                  const formattedReleasedDate = formatDisplayDateTime(item.ReleasedDate);

                  return (
                    <tr
                      key={item.Id}
                      style={{
                        backgroundColor: rowBg,
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = rowBg;
                      }}
                    >
                      {/* S.No */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        {startRecord + index}
                      </td>

                      {/* Work Order # */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              color: '#1e293b',
                              backgroundColor: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {item.WorkOrderdid || item.WorkOrderId || `WO-${item.Id}`}
                          </span>
                          <button
                            onClick={() => handleCopyText(item.WorkOrderdid || String(item.Id), `wo-${item.Id}`)}
                            title="Copy Work Order Number"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedId === `wo-${item.Id}` ? '#059669' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '11px',
                            }}
                          >
                            <i className={`fa-solid ${copiedId === `wo-${item.Id}` ? 'fa-check' : 'fa-copy'}`} />
                          </button>
                        </div>
                      </td>

                      {/* Order No & Bill No */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#2563eb', fontSize: '12px' }}>
                            {item.PatientOrder?.OrderNumber || '—'}
                          </span>
                          {item.PatientOrder?.BillNumber && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Bill: <span style={{ fontWeight: 600 }}>{item.PatientOrder.BillNumber}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {formattedOrderDate.date}
                        </div>
                        {formattedOrderDate.time && (
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {formattedOrderDate.time}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '12px 14px' }}>
                        {renderPriorityBadge(item.OrderPriority?.Description)}
                      </td>

                      {/* Patient Info */}
                      <td style={{ padding: '12px 14px', maxWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              flexShrink: 0,
                            }}
                          >
                            {(item.Patient?.FirstName?.[0] || item.PatientName?.[0] || 'P').toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <button
                              onClick={() => handlePatientProfileClick(item)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#2563eb',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title="View Patient Profile"
                            >
                              {item.Patient?.Title?.Description && `${item.Patient.Title.Description} `}
                              {item.Patient?.FirstName || item.PatientName || 'Unknown Patient'} {item.Patient?.LastName || ''}
                            </button>
                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <span>{item.Patient?.MRN || 'UHID—'}</span>
                              <span>•</span>
                              <span>
                                {item.Patient?.Age ? `${item.Patient.Age}y` : ''} {item.Patient?.Gender?.Description || ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Encounter / Room */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: item.Encounter?.EncounterType?.Description === 'IP' ? '#fef3c7' : '#ecfdf5',
                                color: item.Encounter?.EncounterType?.Description === 'IP' ? '#b45309' : '#047857',
                              }}
                            >
                              {item.Encounter?.EncounterType?.Description || 'OP'}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
                              {item.Encounter?.VisitIdentifier || '—'}
                            </span>
                          </div>
                          {item.Encounter?.WardMaster?.WardName && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {item.Encounter.WardMaster.WardName}
                              {item.Encounter.WardRoomBedMaster?.BedNo ? ` / Bed ${item.Encounter.WardRoomBedMaster.BedNo}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sub Department */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            backgroundColor: '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.SubDepartment?.DepartmentName || item.Department?.DepartmentName || 'General Lab'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        {renderStatusBadge(item)}
                      </td>

                      {/* Released Date */}
                      <td style={{ padding: '12px 14px' }}>
                        {item.ReleasedDate ? (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>
                              {formattedReleasedDate.date}
                            </div>
                            <div style={{ fontSize: '11px', color: '#a78bfa' }}>
                              {formattedReleasedDate.time}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Not released yet
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Release Dispatch Button */}
                          {!isReleased ? (
                            <button
                              onClick={() => handleReleaseClick(item)}
                              title="Release / Dispatch Result"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: radii.md,
                                backgroundColor: isApproved ? '#059669' : '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <i className="fa-solid fa-paper-plane" style={{ fontSize: '10px' }} />
                              Release
                            </button>
                          ) : (
                            <span
                              title="Already released on date"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '4px 8px',
                                borderRadius: radii.md,
                                backgroundColor: '#f5f3ff',
                                color: '#7c3aed',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <i className="fa-solid fa-check-double" />
                              Dispatched
                            </span>
                          )}

                          {/* Print Report Button */}
                          <button
                            onClick={() => handlePrintClick(item)}
                            title="Print Diagnostic Report"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.borderColor = '#93c5fd';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#334155';
                            }}
                          >
                            <i className="fa-solid fa-print" />
                          </button>

                          {/* TAT Timeline Button */}
                          <button
                            onClick={() => handleTatClick(item)}
                            title="View Order Turnaround Time (TAT)"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.borderColor = '#86efac';
                              e.currentTarget.style.color = '#15803d';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            <i className="fa-solid fa-clock-rotate-left" />
                          </button>

                          {/* History Button */}
                          <button
                            onClick={() => handleHistoryClick(item)}
                            title="View Diagnostic History"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: radii.md,
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#faf5ff';
                              e.currentTarget.style.borderColor = '#d8b4fe';
                              e.currentTarget.style.color = '#7c3aed';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            <i className="fa-solid fa-notes-medical" />
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

        {/* 5. Pagination Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (isHybrid && onAction) {
                  onAction('pageChange', { page: 1, pageSize: newSize });
                } else {
                  setStandalonePageSize(newSize);
                  setStandalonePage(1);
                  fetchStandaloneOrders(1, newSize);
                }
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1 || isLoading}
              title="First Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              <i className="fa-solid fa-angles-left" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              title="Previous Page"
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Prev
            </button>

            <span
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              title="Next Page"
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              title="Last Page"
              style={{
                padding: '6px 10px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              <i className="fa-solid fa-angles-right" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Release Confirmation Modal */}
      {releaseConfirmItem && (
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
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: '520px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  <i className="fa-solid fa-paper-plane" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                    Confirm Result Dispatch Release
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Authorize final diagnostic report distribution
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReleaseConfirmItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: radii.lg,
                  padding: '14px 18px',
                  marginBottom: '18px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Work Order #</span>
                    <strong style={{ fontFamily: 'monospace' }}>
                      {releaseConfirmItem.WorkOrderdid || releaseConfirmItem.WorkOrderId || `WO-${releaseConfirmItem.Id}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Patient MRN</span>
                    <strong>{releaseConfirmItem.Patient?.MRN || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Patient Name</span>
                    <strong>
                      {releaseConfirmItem.Patient?.FirstName || releaseConfirmItem.PatientName || 'Unknown Patient'} {releaseConfirmItem.Patient?.LastName || ''}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Sub Department</span>
                    <strong>{releaseConfirmItem.SubDepartment?.DepartmentName || releaseConfirmItem.Department?.DepartmentName || 'LIS'}</strong>
                  </div>
                </div>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to release and dispatch this diagnostic result? Once released, the results are officially published and viewable in the patient portal & doctor workspace.
              </p>

              {/* Header Option Toggle in Modal */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: radii.md,
                  border: '1px solid #e2e8f0',
                }}
              >
                <input
                  type="checkbox"
                  id="modal-without-header"
                  checked={withoutHeader}
                  onChange={(e) => handleToggleWithoutHeader(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="modal-without-header" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Print Without Hospital Header (Letterhead Mode)
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                onClick={() => setReleaseConfirmItem(null)}
                disabled={isReleasing}
                style={{
                  padding: '9px 18px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                disabled={isReleasing}
                style={{
                  padding: '9px 20px',
                  borderRadius: radii.md,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isReleasing ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(5,150,105,0.25)',
                }}
              >
                {isReleasing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" />
                    Confirm Release
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAT Details Modal */}
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
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left" />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Turnaround Time (TAT) Analysis — {activeTatItem.WorkOrderdid || `WO-${activeTatItem.Id}`}
                </h3>
              </div>
              <button
                onClick={() => setActiveTatItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
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
        </div>
      )}

      {/* 8. Patient Profile Preview Modal (Standalone) */}
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
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: '560px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  {(activePatientItem.Patient?.FirstName?.[0] || 'P').toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {activePatientItem.Patient?.Title?.Description && `${activePatientItem.Patient.Title.Description} `}
                    {activePatientItem.Patient?.FirstName || activePatientItem.PatientName || 'Patient'} {activePatientItem.Patient?.LastName || ''}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    MRN / UHID: {activePatientItem.Patient?.MRN || '—'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePatientItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Age / Gender</span>
                  <strong>
                    {activePatientItem.Patient?.Age ? `${activePatientItem.Patient.Age} Years` : '—'} / {activePatientItem.Patient?.Gender?.Description || '—'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Date of Birth</span>
                  <strong>{activePatientItem.Patient?.DOB || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Mobile Number</span>
                  <strong>{activePatientItem.Patient?.Mobile || activePatientItem.PatientMobile || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Encounter Visit #</span>
                  <strong>{activePatientItem.Encounter?.VisitIdentifier || '—'} ({activePatientItem.Encounter?.EncounterType?.Description || 'OP'})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Attending / Ordering Doctor</span>
                  <strong>
                    {activePatientItem.Orderedby?.Title?.Description && `${activePatientItem.Orderedby.Title.Description} `}
                    {activePatientItem.Orderedby?.FirstName || activePatientItem.Orderedbyname || 'Dr. Assigned'} {activePatientItem.Orderedby?.LastName || ''}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Ward / Room / Bed</span>
                  <strong>
                    {activePatientItem.Encounter?.WardMaster?.WardName
                      ? `${activePatientItem.Encounter.WardMaster.WardName} / Bed ${activePatientItem.Encounter.WardRoomBedMaster?.BedNo || '—'}`
                      : 'Outpatient Clinic'}
                  </strong>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setActivePatientItem(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.md,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
