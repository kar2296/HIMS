import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface LookupOption {
  Id: number | string;
  Text: string;
  Description?: string;
  DisplayName?: string;
  Code?: string;
}

export interface SampleEntity {
  Id: number;
  WorkOrderId?: number;
  PatientOrderId?: number;
  PatientId?: number;
  Encounterid?: number;
  SampleStatusId?: number;
  SamplePriorityId?: number;
  LabAssignTypeId?: number;
  RejectionComments?: string | null;
  Status?: number;
  Rev?: number;
  CreatedBy?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  OrderPriority?: {
    Description?: string;
    ColorCode?: string;
  };
  LabAssignType?: {
    Description?: string;
    ColorCode?: string;
  };
  SampleStatus?: {
    Id?: number;
    Description?: string;
    ColorCode?: string;
  };
  Encounter?: {
    GuarantorId?: number;
    GuarantorTypeId?: number;
    VisitIdentifier?: string;
  };
  Patient?: {
    Id?: number;
    TitleId?: number;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number | string;
    GenderId?: number;
    Title?: { Description?: string; ColorCode?: string };
    Gender?: { Description?: string; ColorCode?: string };
  };
  PatientOrder?: {
    Id?: number;
    OrderNumber?: string;
    BillNumber?: string;
    OrderRequestDate?: string;
    OrderStatus?: {
      DisplayName?: string;
      Description?: string;
    };
    SubDeparement?: {
      DepartmentName?: string;
    };
  };
  PatientWorkorder?: {
    WorkOrderdid?: string;
    CreatedAt?: string;
    WorkOrderStatus?: {
      DisplayName?: string;
    };
  };
  [key: string]: any;
}

export interface SampleReviewListScreenProps {
  reactProps?: {
    rows?: SampleEntity[];
    items?: SampleEntity[];
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
      PatNameOrderNo?: string;
      ordernrbillnr?: string;
      namemrn?: string;
      Patient?: string;
      PatOrdNo?: string;
      FromDate?: string | Date;
      ToDate?: string | Date;
      OrderRequestDate?: string | Date;
      EncounterTypeId?: number;
      patienttypeid?: number;
      SubDepartmentId?: number;
      samplestatusid?: number | string;
      orderstatusid?: number | string;
      VisitIdentifier?: string;
    };
    lookup?: {
      OrderStatus?: LookupOption[];
      SampleStatus?: LookupOption[];
      EncounterType?: LookupOption[];
      SubDepartment?: LookupOption[];
      Doctor?: LookupOption[];
    };
    facilityName?: string;
    facilityId?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const SampleReviewListScreen: React.FC<SampleReviewListScreenProps> = ({
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

  // Filter States
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultTo = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>(
    reactProps?.currentfilter?.PatNameOrderNo ||
      reactProps?.currentfilter?.ordernrbillnr ||
      reactProps?.currentfilter?.namemrn ||
      ''
  );
  const [fromDate, setFromDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.FromDate) || defaultFrom
  );
  const [toDate, setToDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.ToDate) || defaultTo
  );
  const [encounterTypeId, setEncounterTypeId] = useState<number>(
    reactProps?.currentfilter?.EncounterTypeId !== undefined && reactProps?.currentfilter?.EncounterTypeId !== -1
      ? Number(reactProps.currentfilter.EncounterTypeId)
      : reactProps?.currentfilter?.patienttypeid !== undefined
      ? Number(reactProps.currentfilter.patienttypeid)
      : -1
  );
  const [subDeptId, setSubDeptId] = useState<number>(
    reactProps?.currentfilter?.SubDepartmentId !== undefined ? Number(reactProps.currentfilter.SubDepartmentId) : -1
  );
  const [sampleStatusId, setSampleStatusId] = useState<number | string>(
    reactProps?.currentfilter?.samplestatusid !== undefined ? reactProps.currentfilter.samplestatusid : -1
  );
  const [orderStatusId, setOrderStatusId] = useState<number | string>(
    reactProps?.currentfilter?.orderstatusid !== undefined ? reactProps.currentfilter.orderstatusid : -1
  );
  const [visitIdentifier, setVisitIdentifier] = useState<string>(
    reactProps?.currentfilter?.VisitIdentifier || ''
  );

  const [activeDatePreset, setActiveDatePreset] = useState<string>('7days');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string>('all');

  // Standalone States
  const [standaloneItems, setStandaloneItems] = useState<SampleEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    OrderStatus: LookupOption[];
    SampleStatus: LookupOption[];
    EncounterType: LookupOption[];
    SubDepartment: LookupOption[];
  }>({
    OrderStatus: [],
    SampleStatus: [],
    EncounterType: [],
    SubDepartment: [],
  });

  // Sync hybrid props
  useEffect(() => {
    if (reactProps?.currentfilter) {
      const cf = reactProps.currentfilter;
      if (cf.PatNameOrderNo !== undefined) setSearchTerm(cf.PatNameOrderNo);
      else if (cf.ordernrbillnr !== undefined) setSearchTerm(cf.ordernrbillnr);
      if (cf.FromDate !== undefined) setFromDate(toDateInputString(cf.FromDate));
      if (cf.ToDate !== undefined) setToDate(toDateInputString(cf.ToDate));
      if (cf.patienttypeid !== undefined && cf.patienttypeid !== -1) setEncounterTypeId(Number(cf.patienttypeid));
      if (cf.SubDepartmentId !== undefined) setSubDeptId(Number(cf.SubDepartmentId));
      if (cf.samplestatusid !== undefined) setSampleStatusId(cf.samplestatusid);
      if (cf.orderstatusid !== undefined) setOrderStatusId(cf.orderstatusid);
      if (cf.VisitIdentifier !== undefined) setVisitIdentifier(cf.VisitIdentifier);
    }
  }, [reactProps?.currentfilter]);

  // Combined lookups
  const lookups = useMemo(() => {
    return {
      OrderStatus: reactProps?.lookup?.OrderStatus || standaloneLookups.OrderStatus || [],
      SampleStatus: reactProps?.lookup?.SampleStatus || standaloneLookups.SampleStatus || [],
      EncounterType: reactProps?.lookup?.EncounterType || standaloneLookups.EncounterType || [],
      SubDepartment: reactProps?.lookup?.SubDepartment || standaloneLookups.SubDepartment || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Active items & pager
  const allItems = isHybrid ? rawItems || [] : standaloneItems;
  const currentPage = isHybrid
    ? reactProps?.pagerObj?.currentPage || reactProps?.currentPage || 1
    : standalonePage;
  const pageSize = isHybrid
    ? reactProps?.pagerObj?.pageSize || reactProps?.pageSize || 25
    : standalonePageSize;
  const totalItems = isHybrid
    ? reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? allItems.length
    : standaloneTotal;

  // Standalone: Fetch Lookups
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'OrderStatus' },
          { Key: 'SampleStatus' },
          { Key: 'EncounterType' },
          {
            Key: 'SubDepartment',
            Request: { Params: [{ Key: 6, Value: 8 }] }, // LIS Department ID: 8
          },
        ],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              OrderStatus: res.OrderStatus || [],
              SampleStatus: res.SampleStatus || [],
              EncounterType: res.EncounterType || [],
              SubDepartment: res.SubDepartment || [],
            });
          }
        })
        .catch((err) => console.error('Failed to load lookups:', err));
    }
  }, [isHybrid]);

  // Standalone: Fetch Orders
  const fetchStandaloneSamples = useCallback(
    (page: number, customFilters?: any) => {
      setIsLoading(true);
      const fromVal = customFilters?.FromDate !== undefined ? customFilters.FromDate : fromDate;
      const toVal = customFilters?.ToDate !== undefined ? customFilters.ToDate : toDate;
      const searchVal = customFilters?.PatNameOrderNo !== undefined ? customFilters.PatNameOrderNo : searchTerm;
      const encVal = customFilters?.EncounterTypeId !== undefined ? customFilters.EncounterTypeId : encounterTypeId;
      const subDeptVal = customFilters?.SubDepartmentId !== undefined ? customFilters.SubDepartmentId : subDeptId;
      const sampleStVal = customFilters?.samplestatusid !== undefined ? customFilters.samplestatusid : sampleStatusId;
      const ordStVal = customFilters?.orderstatusid !== undefined ? customFilters.orderstatusid : orderStatusId;
      const visitVal = customFilters?.VisitIdentifier !== undefined ? customFilters.VisitIdentifier : visitIdentifier;

      const params: any[] = [
        { Key: 17, Value: reactProps?.facilityId || (sessionHelper.getCurrentFacilityId() > 0 ? sessionHelper.getCurrentFacilityId() : 1) },
      ];

      if (fromVal) params.push({ Key: 10, Value: `${fromVal} 00:00:00` });
      if (toVal) params.push({ Key: 11, Value: `${toVal} 23:59:59` });
      if (searchVal && searchVal.trim()) params.push({ Key: 20, Value: searchVal.trim() });
      if (encVal !== -1) params.push({ Key: 3, Value: encVal });
      if (subDeptVal !== -1) params.push({ Key: 15, Value: subDeptVal });
      if (sampleStVal !== -1 && sampleStVal !== '') params.push({ Key: 21, Value: sampleStVal });
      if (ordStVal !== -1 && ordStVal !== '') params.push({ Key: 7, Value: ordStVal });
      if (visitVal && visitVal.trim()) params.push({ Key: 18, Value: visitVal.trim() });

      callBackendApi({
        action: 'lis/workordersample/GetWorkOrderSamples',
        data: {
          Params: params,
          PageContext: {
            PageSize: standalonePageSize,
            PageNumber: page,
          },
        },
      })
        .then((res: any) => {
          setIsLoading(false);
          if (res && res.Data) {
            setStandaloneItems(res.Data);
            if (res.PageContext?.TotalRecords !== undefined) {
              setStandaloneTotal(res.PageContext.TotalRecords);
            }
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error('Failed to load work order samples:', err);
        });
    },
    [
      fromDate,
      toDate,
      searchTerm,
      encounterTypeId,
      subDeptId,
      sampleStatusId,
      orderStatusId,
      visitIdentifier,
      reactProps?.facilityId,
      standalonePageSize,
    ]
  );

  // Initial fetch for standalone
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneSamples(1);
    }
  }, [isHybrid, fetchStandaloneSamples]);

  // Execute Search action
  const handleApplyFilter = (customOverrides?: any) => {
    const payload = {
      PatNameOrderNo: searchTerm.trim(),
      ordernrbillnr: searchTerm.trim(),
      namemrn: searchTerm.trim(),
      FromDate: fromDate,
      ToDate: toDate,
      EncounterTypeId: encounterTypeId,
      patienttypeid: encounterTypeId,
      SubDepartmentId: subDeptId,
      samplestatusid: sampleStatusId,
      orderstatusid: orderStatusId,
      VisitIdentifier: visitIdentifier.trim(),
      ...customOverrides,
    };

    if (isHybrid && onAction) {
      onAction('search', payload);
    } else {
      setStandalonePage(1);
      fetchStandaloneSamples(1, payload);
    }
  };

  // Date Presets Handler
  const handleDatePreset = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'all') => {
    setActiveDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let newFrom = '';
    let newTo = todayStr;

    if (preset === 'today') {
      newFrom = todayStr;
      newTo = todayStr;
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      newFrom = yStr;
      newTo = yStr;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      newFrom = d.toISOString().split('T')[0];
      newTo = todayStr;
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      newFrom = d.toISOString().split('T')[0];
      newTo = todayStr;
    } else if (preset === 'all') {
      newFrom = '';
      newTo = '';
    }

    setFromDate(newFrom);
    setToDate(newTo);
    handleApplyFilter({ FromDate: newFrom, ToDate: newTo });
  };

  // KPI Quick Filter Toggle
  const handleKpiClick = (type: 'all' | 'pending' | 'collected' | 'received' | 'urgent') => {
    if (activeKpiFilter === type) {
      // Toggle off
      setActiveKpiFilter('all');
      setSampleStatusId(-1);
      handleApplyFilter({ samplestatusid: -1 });
      return;
    }

    setActiveKpiFilter(type);
    if (type === 'all') {
      setSampleStatusId(-1);
      handleApplyFilter({ samplestatusid: -1 });
    } else if (type === 'pending') {
      setSampleStatusId(1);
      handleApplyFilter({ samplestatusid: 1 });
    } else if (type === 'collected') {
      setSampleStatusId(2);
      handleApplyFilter({ samplestatusid: 2 });
    } else if (type === 'received') {
      setSampleStatusId(3);
      handleApplyFilter({ samplestatusid: 3 });
    }
  };

  // Reset Filters
  const handleReset = () => {
    setSearchTerm('');
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setEncounterTypeId(-1);
    setSubDeptId(-1);
    setSampleStatusId(-1);
    setOrderStatusId(-1);
    setVisitIdentifier('');
    setActiveDatePreset('7days');
    setActiveKpiFilter('all');

    if (isHybrid && onAction) {
      onAction('resetFilters');
    } else {
      setStandalonePage(1);
      fetchStandaloneSamples(1, {
        PatNameOrderNo: '',
        FromDate: defaultFrom,
        ToDate: defaultTo,
        EncounterTypeId: -1,
        SubDepartmentId: -1,
        samplestatusid: -1,
        orderstatusid: -1,
        VisitIdentifier: '',
      });
    }
  };

  // Page change
  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneSamples(newPage);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let collected = 0;
    let received = 0;
    let urgent = 0;

    for (const it of allItems) {
      const sId = Number(it.SampleStatusId);
      const desc = (it.SampleStatus?.Description || '').toLowerCase();
      const pDesc = (it.OrderPriority?.Description || '').toLowerCase();

      if (sId === 1 || desc.includes('pending')) pending++;
      else if (sId === 2 || desc.includes('collect')) collected++;
      else if (sId === 3 || sId === 5 || desc.includes('review') || desc.includes('receiv')) received++;

      if (pDesc.includes('stat') || pDesc.includes('urgent') || Number(it.SamplePriorityId) === 2) urgent++;
    }

    return {
      total: totalItems,
      currentLoaded: allItems.length,
      pending,
      collected,
      received,
      urgent,
    };
  }, [allItems, totalItems]);

  // Client-side quick filter for instantaneous responsiveness
  const displayItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const oNum = (item.PatientOrder?.OrderNumber || '').toLowerCase();
        const bNum = (item.PatientOrder?.BillNumber || '').toLowerCase();
        const woNum = (item.PatientWorkorder?.WorkOrderdid || '').toLowerCase();
        const patName = `${item.Patient?.FirstName || ''} ${item.Patient?.LastName || ''}`.toLowerCase();
        const mrn = (item.Patient?.MRN || '').toLowerCase();
        const visit = (item.Encounter?.VisitIdentifier || '').toLowerCase();

        const match =
          oNum.includes(q) ||
          bNum.includes(q) ||
          woNum.includes(q) ||
          patName.includes(q) ||
          mrn.includes(q) ||
          visit.includes(q);

        if (!match) return false;
      }

      // 2. Encounter type match
      if (encounterTypeId !== -1) {
        const encId = item.Encounterid || (item as any).EncounterTypeId;
        if (encId !== undefined && encId !== encounterTypeId) {
          // Keep item if not directly filterable client-side, let server handle it
        }
      }

      // 3. KPI quick filter match
      if (activeKpiFilter === 'pending') {
        const sId = Number(item.SampleStatusId);
        const desc = (item.SampleStatus?.Description || '').toLowerCase();
        if (sId !== 1 && !desc.includes('pending')) return false;
      } else if (activeKpiFilter === 'collected') {
        const sId = Number(item.SampleStatusId);
        const desc = (item.SampleStatus?.Description || '').toLowerCase();
        if (sId !== 2 && !desc.includes('collect')) return false;
      } else if (activeKpiFilter === 'received') {
        const sId = Number(item.SampleStatusId);
        const desc = (item.SampleStatus?.Description || '').toLowerCase();
        if (sId !== 3 && sId !== 5 && !desc.includes('receiv') && !desc.includes('review')) return false;
      } else if (activeKpiFilter === 'urgent') {
        const pDesc = (item.OrderPriority?.Description || '').toLowerCase();
        if (!pDesc.includes('stat') && !pDesc.includes('urgent')) return false;
      }

      return true;
    });
  }, [allItems, searchTerm, encounterTypeId, activeKpiFilter]);

  // Total pages
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Render Sample Status Pill
  const renderSampleStatusBadge = (statusId?: number, statusObj?: { Description?: string; ColorCode?: string }) => {
    const sId = Number(statusId);
    const text = statusObj?.Description || (sId === 1 ? 'Pending' : sId === 2 ? 'Collected' : sId === 3 || sId === 5 ? 'Received' : 'Unknown');
    const lower = text.toLowerCase();

    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#cbd5e1';
    let dot = '#94a3b8';

    if (sId === 1 || lower.includes('pending')) {
      bg = '#fffbeb';
      color = '#b45309';
      border = '#fde68a';
      dot = '#f59e0b';
    } else if (sId === 2 || lower.includes('collect')) {
      bg = '#f0f9ff';
      color = '#0369a1';
      border = '#bae6fd';
      dot = '#0284c7';
    } else if (sId === 3 || sId === 5 || lower.includes('receiv') || lower.includes('review') || lower.includes('accept')) {
      bg = '#ecfdf5';
      color = '#047857';
      border = '#a7f3d0';
      dot = '#10b981';
    } else if (lower.includes('reject') || lower.includes('cancel')) {
      bg = '#fff1f2';
      color = '#be123c';
      border = '#fecdd3';
      dot = '#f43f5e';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: radii.full,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontSize: '11.5px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: dot,
            display: 'inline-block',
          }}
        />
        {text}
      </span>
    );
  };

  // Render Priority Badge
  const renderPriorityBadge = (priority?: { Description?: string; ColorCode?: string }, priorityId?: number) => {
    const desc = priority?.Description || (Number(priorityId) === 2 ? 'Stat' : 'Routine');
    const isStat = desc.toLowerCase().includes('stat') || desc.toLowerCase().includes('urgent');

    if (isStat) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: radii.sm,
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <i className="fa fa-bolt" /> {desc}
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: radii.sm,
          backgroundColor: '#f8fafc',
          color: '#475569',
          border: '1px solid #e2e8f0',
          fontSize: '11px',
          fontWeight: 500,
        }}
      >
        {desc}
      </span>
    );
  };

  return (
    <div className="pkg-page-container orderack-container" style={{ padding: spacing[4], background: colors.neutral[50] }}>
      {/* 1. Header Card */}
      <div className="pkg-header-card" style={{ marginBottom: spacing[4] }}>
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <i className="fa fa-flask" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Sample Reviews & Acceptance</h1>
              <span className="pkg-header-tag">LIS / CLINICAL LABORATORY</span>
            </div>
            <p className="pkg-header-subtitle">
              Verify, review, receive or reject laboratory diagnostic specimens before result entry
            </p>
          </div>
        </div>

        <div className="pkg-header-right">
          <div className="pkg-header-chip">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
              }}
            />
            <span>{reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          <button
            type="button"
            className="btn btn-default btn-sm"
            onClick={() => onAction && onAction('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              borderRadius: radii.md,
              borderColor: colors.neutral[300],
            }}
          >
            <i className="fa fa-tachometer" /> Dashboard
          </button>

          <button
            type="button"
            className="btn btn-default btn-sm"
            onClick={() => onAction && onAction('orderack')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              borderRadius: radii.md,
              borderColor: colors.neutral[300],
            }}
          >
            <i className="fa fa-check-square-o" /> Order Acceptance
          </button>

          <button
            type="button"
            className="btn btn-default btn-sm"
            onClick={() => onAction && onAction('samplecollect')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              borderRadius: radii.md,
              borderColor: colors.neutral[300],
            }}
          >
            <i className="fa fa-tint" /> Sample Collections
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleApplyFilter()}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              borderRadius: radii.md,
              backgroundColor: '#0284c7',
              borderColor: '#0284c7',
            }}
          >
            <i className={`fa fa-refresh ${isLoading ? 'fa-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Metrics Grid */}
      <div className="pkg-stats-grid" style={{ marginBottom: spacing[4] }}>
        {/* Total Samples */}
        <div
          className="pkg-stat-card"
          onClick={() => handleKpiClick('all')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'all' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Specimens</span>
            <span className="pkg-stat-value" style={{ color: '#0f172a' }}>
              {stats.total}
            </span>
            <span className="pkg-stat-subtext">Registered specimen records</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-database" aria-hidden="true" />
          </div>
        </div>

        {/* Pending Review */}
        <div
          className="pkg-stat-card"
          onClick={() => handleKpiClick('pending')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'pending' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Pending Review</span>
            <span className="pkg-stat-value" style={{ color: '#d97706' }}>
              {stats.pending}
            </span>
            <span className="pkg-stat-subtext">Awaiting laboratory reception</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-clock-o" aria-hidden="true" />
          </div>
        </div>

        {/* Collected / In Transit */}
        <div
          className="pkg-stat-card"
          onClick={() => handleKpiClick('collected')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'collected' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Collected / Transit</span>
            <span className="pkg-stat-value" style={{ color: '#0284c7' }}>
              {stats.collected}
            </span>
            <span className="pkg-stat-subtext">Drawn & in laboratory transit</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-truck" aria-hidden="true" />
          </div>
        </div>

        {/* Accepted / Received */}
        <div
          className="pkg-stat-card"
          onClick={() => handleKpiClick('received')}
          style={{
            cursor: 'pointer',
            border: activeKpiFilter === 'received' ? '2px solid #10b981' : '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}
        >
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Reviewed & Received</span>
            <span className="pkg-stat-value" style={{ color: '#059669' }}>
              {stats.received}
            </span>
            <span className="pkg-stat-subtext">Verified & ready for result entry</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Card */}
      <div className="pkg-filter-card" style={{ marginBottom: spacing[4], padding: spacing[4] }}>
        {/* Preset Date Range Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[3],
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: 4 }}>
              <i className="fa fa-calendar-check-o" style={{ marginRight: 4 }} /> Date Preset:
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

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <strong>{displayItems.length}</strong> of <strong>{totalItems}</strong> records
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Quick Search */}
          <div className="pkg-filter-group" style={{ gridColumn: 'span 2' }}>
            <label className="pkg-filter-label">Quick Search (Order #, Bill #, Patient, UHID)</label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-search"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                className="pkg-filter-input"
                placeholder="Search Order #, Bill #, Patient Name, MRN, OP/IP No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                style={{ paddingLeft: 34 }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    handleApplyFilter({ PatNameOrderNo: '' });
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa fa-times-circle" />
                </button>
              )}
            </div>
          </div>

          {/* From Date */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">From Date</label>
            <input
              type="date"
              className="pkg-filter-input"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActiveDatePreset('custom');
              }}
            />
          </div>

          {/* To Date */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">To Date</label>
            <input
              type="date"
              className="pkg-filter-input"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActiveDatePreset('custom');
              }}
            />
          </div>

          {/* Encounter Type */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">Encounter Type</label>
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
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">Laboratory Sub-Department</label>
            <select
              className="pkg-filter-select"
              value={subDeptId}
              onChange={(e) => setSubDeptId(Number(e.target.value))}
            >
              <option value="-1">All Sub-Departments</option>
              {lookups.SubDepartment.map((dept) => (
                <option key={dept.Id} value={dept.Id}>
                  {dept.Text || dept.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Sample Status */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">Sample Status</label>
            <select
              className="pkg-filter-select"
              value={sampleStatusId}
              onChange={(e) => {
                setSampleStatusId(e.target.value);
                setActiveKpiFilter('all');
              }}
            >
              <option value="-1">All Sample Statuses</option>
              {lookups.SampleStatus.map((st) => (
                <option key={st.Id} value={st.Id}>
                  {st.Text || st.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">Order Status</label>
            <select
              className="pkg-filter-select"
              value={orderStatusId}
              onChange={(e) => setOrderStatusId(e.target.value)}
            >
              <option value="-1">All Order Statuses</option>
              {lookups.OrderStatus.map((st) => (
                <option key={st.Id} value={st.Id}>
                  {st.Text || st.Description || st.DisplayName}
                </option>
              ))}
            </select>
          </div>

          {/* OP/IP No */}
          <div className="pkg-filter-group">
            <label className="pkg-filter-label">OP/IP Number</label>
            <input
              type="text"
              className="pkg-filter-input"
              placeholder="e.g. OP24-25/87"
              value={visitIdentifier}
              onChange={(e) => setVisitIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
            />
          </div>
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
              borderRadius: radii.md,
            }}
          >
            <i className="fa fa-undo" /> Reset Filters
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleApplyFilter()}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              borderRadius: radii.md,
              backgroundColor: '#0284c7',
              borderColor: '#0284c7',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
            }}
          >
            <i className={`fa fa-filter ${isLoading ? 'fa-spin' : ''}`} /> Apply Filters
          </button>
        </div>
      </div>

      {/* 4. Enterprise Diagnostic Samples Table */}
      <div className="pkg-table-card" style={{ marginBottom: spacing[4] }}>
        <div className="pkg-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="pkg-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '150px' }}>Request Date & Time</th>
                <th style={{ minWidth: '160px' }}>Order & Work Order #</th>
                <th style={{ minWidth: '220px' }}>Patient Details</th>
                <th style={{ minWidth: '130px' }}>Visit ID</th>
                <th style={{ minWidth: '100px' }}>Priority</th>
                <th style={{ minWidth: '140px' }}>Sample Status</th>
                <th style={{ minWidth: '130px' }}>Order Status</th>
                <th style={{ minWidth: '130px' }}>Assignment</th>
                <th style={{ minWidth: '140px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '48px 24px', textAlign: 'center' }}>
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
                        <i className="fa fa-flask" />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                        No Diagnostic Samples Found
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                        There are no specimen records matching your selected filter criteria and date range. Try switching to "Last 30 Days" or resetting filters.
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
                  const reqDateTime = formatDisplayDateTime(
                    item.PatientOrder?.OrderRequestDate || item.CreatedAt
                  );
                  const isMale = (item.Patient?.Gender?.Description || '').toUpperCase() === 'MALE';
                  const initials =
                    `${(item.Patient?.FirstName || '')[0] || ''}${(item.Patient?.LastName || '')[0] || ''}`.toUpperCase() || 'PT';

                  const isReviewed = Number(item.SampleStatusId) === 5 || Number(item.SampleStatusId) === 3;

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Row Index */}
                      <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      {/* Request Date & Time */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                            <i className="fa fa-calendar-o" style={{ color: '#0284c7', marginRight: 6 }} />
                            {reqDateTime.date}
                          </span>
                          {reqDateTime.time && (
                            <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: 18 }}>
                              {reqDateTime.time}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order # / Bill # / Work Order # */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '12px',
                              color: '#0f172a',
                            }}
                          >
                            <i className="fa fa-tag" style={{ color: '#64748b', fontSize: 10 }} />
                            {item.PatientOrder?.OrderNumber || `ORD-${item.PatientOrderId || item.Id}`}
                          </span>
                          {item.PatientWorkorder?.WorkOrderdid && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '11px',
                                color: '#0284c7',
                                fontWeight: 600,
                              }}
                            >
                              <i className="fa fa-barcode" style={{ fontSize: 10 }} />
                              WO: {item.PatientWorkorder.WorkOrderdid}
                            </span>
                          )}
                          {item.PatientOrder?.BillNumber && (
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              Bill: {item.PatientOrder.BillNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              backgroundColor: isMale ? '#eff6ff' : '#fdf2f8',
                              color: isMale ? '#2563eb' : '#db2777',
                              border: `1px solid ${isMale ? '#bfdbfe' : '#fbcfe8'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <button
                              type="button"
                              className="orderack-pat-name-btn"
                              onClick={() =>
                                onAction &&
                                onAction('patientinfo', {
                                  PatientId: item.PatientId || item.Patient?.Id,
                                })
                              }
                              title="Click to view Patient Profile"
                            >
                              {item.Patient?.Title?.Description ? `${item.Patient.Title.Description} ` : ''}
                              {item.Patient?.FirstName || 'Patient'} {item.Patient?.LastName || ''}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              {item.Patient?.MRN && (
                                <span className="orderack-mrn-chip">{item.Patient.MRN}</span>
                              )}
                              {(item.Patient?.Age !== undefined || item.Patient?.Gender?.Description) && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {item.Patient.Age ? `${item.Patient.Age} Yrs` : ''}
                                  {item.Patient.Age && item.Patient.Gender?.Description ? ' / ' : ''}
                                  {item.Patient.Gender?.Description || ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Visit / Encounter */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#1e293b',
                            }}
                          >
                            {item.Encounter?.VisitIdentifier || '—'}
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 600,
                              color: item.Encounter?.VisitIdentifier?.includes('IP') ? '#1d4ed8' : '#15803d',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.Encounter?.VisitIdentifier?.includes('IP') ? 'Inpatient' : 'Outpatient'}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td>{renderPriorityBadge(item.OrderPriority, item.SamplePriorityId)}</td>

                      {/* Sample Status */}
                      <td>{renderSampleStatusBadge(item.SampleStatusId, item.SampleStatus)}</td>

                      {/* Order Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {item.PatientOrder?.OrderStatus?.DisplayName || item.PatientOrder?.OrderStatus?.Description || 'CREATED'}
                        </span>
                      </td>

                      {/* Assignment / Lab Type */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                            {item.LabAssignType?.Description || 'Inhouse'}
                          </span>
                          {item.PatientOrder?.SubDeparement?.DepartmentName && (
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              {item.PatientOrder.SubDeparement.DepartmentName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Review & Receive button */}
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() =>
                              onAction &&
                              onAction(isReviewed ? 'view' : 'edit', {
                                Id: item.Id,
                                SampleStatusId: item.SampleStatusId,
                              })
                            }
                            title={isReviewed ? 'View Sample Review' : 'Review & Receive Sample'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 9px',
                              borderRadius: radii.md,
                              backgroundColor: isReviewed ? '#f1f5f9' : '#0284c7',
                              color: isReviewed ? '#334155' : '#ffffff',
                              border: `1px solid ${isReviewed ? '#cbd5e1' : '#0284c7'}`,
                              fontWeight: 600,
                              fontSize: '11.5px',
                              cursor: 'pointer',
                            }}
                          >
                            <i className={isReviewed ? 'fa fa-eye' : 'fa fa-pencil-square-o'} />
                            <span>{isReviewed ? 'View' : 'Review'}</span>
                          </button>

                          {/* Order TAT Modal Trigger */}
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            onClick={() =>
                              onAction &&
                              onAction('ordertat', {
                                PatientId: item.PatientId || item.Patient?.Id,
                                PatientOrderId: item.PatientOrderId || item.PatientOrder?.Id || item.Id,
                                Id: item.Id,
                              })
                            }
                            title="Turnaround Time (TAT) & Order History"
                            style={{
                              padding: '5px 8px',
                              borderRadius: radii.md,
                              borderColor: '#cbd5e1',
                              color: '#0284c7',
                              fontWeight: 600,
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-clock-o" />
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

        {/* 5. Pagination & Summary Footer */}
        {totalItems > 0 && (
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              backgroundColor: '#ffffff',
              borderBottomLeftRadius: radii.xl,
              borderBottomRightRadius: radii.xl,
            }}
          >
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
              Showing{' '}
              <strong>{(currentPage - 1) * pageSize + (displayItems.length > 0 ? 1 : 0)}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong>{totalItems}</strong> entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-default btn-xs"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ borderRadius: radii.sm, padding: '4px 8px' }}
              >
                <i className="fa fa-chevron-left" /> Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn btn-xs ${isActive ? 'btn-primary' : 'btn-default'}`}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      borderRadius: radii.sm,
                      padding: '4px 10px',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#0284c7' : undefined,
                      borderColor: isActive ? '#0284c7' : undefined,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className="btn btn-default btn-xs"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{ borderRadius: radii.sm, padding: '4px 8px' }}
              >
                Next <i className="fa fa-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
