import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { sessionHelper } from '../services/sessionHelper';
import { callBackendApi } from '../services/apiService';

export interface LookupOption {
  Id: number | string;
  Text: string;
  Description?: string;
  DisplayName?: string;
  Code?: string;
}

export interface PatientInfo {
  Id?: number;
  MRN?: string;
  FirstName?: string;
  LastName?: string;
  Age?: number;
  Gender?: { Description?: string; ColorCode?: string };
  Title?: { Description?: string; ColorCode?: string };
}

export interface OrderEntity {
  Id: number;
  EncounterId?: number;
  PatientId: number;
  OrderTypeId?: number;
  OrderNumber?: string;
  BillNumber?: string;
  BillAmount?: number;
  OrderRequestDate?: string;
  OrderScheduleDate?: string;
  DoctorId?: number;
  DoctorName?: string;
  Doctor?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string; ColorCode?: string };
  };
  OrderPriorityId?: number;
  OrderPriority?: {
    Description?: string;
    ColorCode?: string;
  };
  EncounterTypeId?: number;
  EncounterType?: {
    Description?: string;
    ColorCode?: string;
  };
  TESTMASTERTYP?: {
    Description?: string;
  };
  TestTypeId?: number;
  FacilityId?: number;
  Facility?: {
    FacilityName?: string;
  };
  OrderFrom?: {
    DepartmentName?: string;
  };
  OrderTo?: {
    DepartmentName?: string;
  };
  ParentDeparement?: {
    DepartmentName?: string;
  };
  SubDeparement?: {
    DepartmentName?: string;
  };
  OrderStatusId?: number;
  OrderStatus?: {
    DisplayName?: string;
    Description?: string;
  };
  IsExternalLab?: boolean;
  IsExternal?: string;
  WardMaster?: {
    WardName?: string;
  };
  WardRoomMaster?: {
    RoomNo?: string;
  };
  WardRoomBedMaster?: {
    BedNo?: string;
  };
  Patient?: PatientInfo;
  PatientBillStatusId?: number;
  Encounter?: {
    VisitIdentifier?: string;
    VisitTypeId?: number;
  };
}

export interface OrderAcknowledgementListScreenProps {
  reactProps?: {
    rows?: OrderEntity[];
    items?: OrderEntity[];
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
      PatName?: string;
      BillOrderNumber?: string;
      FromDate?: string | Date;
      ToDate?: string | Date;
      EncounterTypeId?: number;
      OrderStatusId?: string | number | string[];
      TestTypeId?: number;
    };
    lookup?: {
      OrderStatus?: LookupOption[];
      EncounterType?: LookupOption[];
    };
    tp?: number | string;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OrderAcknowledgementListScreen: React.FC<OrderAcknowledgementListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const rawItems = reactProps?.items || reactProps?.rows;
  const isHybrid = Boolean(reactProps && Array.isArray(rawItems));

  // Determine test category (tp: 1 = LIS/Lab, 2 = RIS/Radiology, 4 = Endoscopy)
  const tp = Number(reactProps?.tp || reactProps?.currentfilter?.TestTypeId || 1);
  const isLab = tp === 1;
  const isRis = tp === 2;
  const isEndoscopy = tp === 4;

  const categoryTitle = isLab
    ? 'Laboratory Order Acceptance'
    : isRis
    ? 'Radiology Order Acceptance'
    : isEndoscopy
    ? 'Endoscopy Order Acceptance'
    : 'Order Acknowledgements';

  const categoryTag = isLab
    ? 'LIS / LABORATORY'
    : isRis
    ? 'RIS / RADIOLOGY'
    : isEndoscopy
    ? 'ENDOSCOPY'
    : 'ORDER MANAGEMENT';

  const categorySubtitle = isLab
    ? 'Review, verify & process clinical laboratory diagnostic and pathology orders'
    : isRis
    ? 'Review, verify & process diagnostic imaging, radiological procedures & scans'
    : 'Review, verify & process clinical orders across hospital departments';

  const headerIcon = isLab ? 'fa-flask' : isRis ? 'fa-sun-o' : 'fa-clipboard';

  // Format Helper for Date Inputs (YYYY-MM-DD)
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

  // Standalone States (when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<OrderEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    OrderStatus: LookupOption[];
    EncounterType: LookupOption[];
  }>({
    OrderStatus: [],
    EncounterType: [],
  });

  // Filter States
  const [patSearch, setPatSearch] = useState<string>(reactProps?.currentfilter?.PatName || '');
  const [orderBillSearch, setOrderBillSearch] = useState<string>(
    reactProps?.currentfilter?.BillOrderNumber || ''
  );
  const [fromDate, setFromDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.FromDate) ||
      (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
      })()
  );
  const [toDate, setToDate] = useState<string>(
    toDateInputString(reactProps?.currentfilter?.ToDate) || new Date().toISOString().split('T')[0]
  );
  const [encounterTypeId, setEncounterTypeId] = useState<number>(
    reactProps?.currentfilter?.EncounterTypeId !== undefined
      ? Number(reactProps.currentfilter.EncounterTypeId)
      : -1
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [activeDatePreset, setActiveDatePreset] = useState<string>('7days');

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.PatName !== undefined) {
        setPatSearch(reactProps.currentfilter.PatName);
      }
      if (reactProps.currentfilter.BillOrderNumber !== undefined) {
        setOrderBillSearch(reactProps.currentfilter.BillOrderNumber);
      }
      if (reactProps.currentfilter.FromDate !== undefined) {
        setFromDate(toDateInputString(reactProps.currentfilter.FromDate));
      }
      if (reactProps.currentfilter.ToDate !== undefined) {
        setToDate(toDateInputString(reactProps.currentfilter.ToDate));
      }
      if (reactProps.currentfilter.EncounterTypeId !== undefined) {
        setEncounterTypeId(Number(reactProps.currentfilter.EncounterTypeId));
      }
    }
  }, [reactProps?.currentfilter]);

  // Lookups memo
  const lookups = useMemo(() => {
    return {
      OrderStatus: reactProps?.lookup?.OrderStatus || standaloneLookups.OrderStatus,
      EncounterType: reactProps?.lookup?.EncounterType || standaloneLookups.EncounterType,
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Active Items & Pagination
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

  // Filter Items client-side if needed for immediate responsiveness
  const displayItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Patient Name / UHID
      if (patSearch.trim()) {
        const q = patSearch.trim().toLowerCase();
        const patName = `${item.Patient?.FirstName || ''} ${item.Patient?.LastName || ''}`.toLowerCase();
        const mrn = (item.Patient?.MRN || '').toLowerCase();
        if (!patName.includes(q) && !mrn.includes(q)) return false;
      }
      // 2. Order # / Bill #
      if (orderBillSearch.trim()) {
        const q = orderBillSearch.trim().toLowerCase();
        const oNum = (item.OrderNumber || '').toLowerCase();
        const bNum = (item.BillNumber || '').toLowerCase();
        if (!oNum.includes(q) && !bNum.includes(q)) return false;
      }
      // 3. Encounter Type
      if (encounterTypeId !== -1) {
        if (item.EncounterTypeId !== undefined && item.EncounterTypeId !== encounterTypeId) {
          return false;
        }
      }
      // 4. Status filter if selected specifically
      if (orderStatusFilter !== 'all') {
        const sId = String(item.OrderStatusId);
        if (sId !== orderStatusFilter) return false;
      }
      return true;
    });
  }, [allItems, patSearch, orderBillSearch, encounterTypeId, orderStatusFilter]);

  // Standalone: Fetch Lookups
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [{ Key: 'OrderStatus', Default: false }, { Key: 'EncounterType' }],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              OrderStatus: res.OrderStatus || [],
              EncounterType: res.EncounterType || [],
            });
          }
        })
        .catch((err) => console.error('Failed to load lookups:', err));
    }
  }, [isHybrid]);

  // Standalone: Fetch Orders
  const fetchStandaloneOrders = useCallback(
    (page: number, filtersToUse?: any) => {
      setIsLoading(true);
      const fromVal = filtersToUse?.FromDate || fromDate;
      const toVal = filtersToUse?.ToDate || toDate;
      const patVal = filtersToUse?.PatName !== undefined ? filtersToUse.PatName : patSearch;
      const ordVal = filtersToUse?.BillOrderNumber !== undefined ? filtersToUse.BillOrderNumber : orderBillSearch;
      const encVal = filtersToUse?.EncounterTypeId !== undefined ? filtersToUse.EncounterTypeId : encounterTypeId;

      const inputData = {
        Params: [
          { Key: 3, Value: -1 }, // Priority
          { Key: 4, Value: ['1', '15', '16', '17'] }, // Status
          { Key: 32, Value: ordVal },
          { Key: 8, Value: patVal },
          { Key: 9, Value: tp },
          { Key: 20, Value: encVal },
          { Key: 12, Value: fromVal ? `${fromVal} 00:00:00` : null },
          { Key: 13, Value: toVal ? `${toVal} 23:59:59` : null },
          { Key: 27, Value: sessionHelper.getFacilityId() || 1 },
        ],
        PageContext: {
          PageSize: standalonePageSize,
          PageNumber: page,
        },
      };

      callBackendApi({
        action: 'emr/patientorder/GetPatientOrderWithoutDetails',
        data: inputData,
      })
        .then((res: any) => {
          setIsLoading(false);
          if (res && res.Data) {
            setStandaloneItems(res.Data);
            if (res.PageContext && res.PageContext.TotalRecords !== undefined) {
              setStandaloneTotal(res.PageContext.TotalRecords);
            }
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error('Failed to load patient orders:', err);
        });
    },
    [fromDate, toDate, patSearch, orderBillSearch, encounterTypeId, tp, standalonePageSize]
  );

  // Standalone mount fetch
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneOrders(1);
    }
  }, [isHybrid, fetchStandaloneOrders]);

  // Date Preset Quick Handler
  const handleDatePreset = (preset: 'today' | '7days' | '30days' | 'month') => {
    setActiveDatePreset(preset);
    const todayObj = new Date();
    const toStr = todayObj.toISOString().split('T')[0];
    let fromStr = toStr;

    if (preset === 'today') {
      fromStr = toStr;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromStr = d.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      fromStr = d.toISOString().split('T')[0];
    } else if (preset === 'month') {
      const d = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      fromStr = d.toISOString().split('T')[0];
    }

    setFromDate(fromStr);
    setToDate(toStr);

    if (isHybrid && onAction) {
      onAction('search', {
        PatName: patSearch.trim(),
        BillOrderNumber: orderBillSearch.trim(),
        FromDate: fromStr,
        ToDate: toStr,
        EncounterTypeId: Number(encounterTypeId),
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1, {
        FromDate: fromStr,
        ToDate: toStr,
      });
    }
  };

  // Handler: Execute Search / Fetch
  const handleSearch = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        PatName: patSearch.trim(),
        BillOrderNumber: orderBillSearch.trim(),
        FromDate: fromDate,
        ToDate: toDate,
        EncounterTypeId: Number(encounterTypeId),
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1);
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    const todayObj = new Date();
    const toStr = todayObj.toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const fromStr = d.toISOString().split('T')[0];

    setPatSearch('');
    setOrderBillSearch('');
    setFromDate(fromStr);
    setToDate(toStr);
    setEncounterTypeId(-1);
    setOrderStatusFilter('all');
    setActiveDatePreset('7days');

    if (isHybrid && onAction) {
      onAction('resetFilters', {
        PatName: '',
        BillOrderNumber: '',
        FromDate: fromStr,
        ToDate: toStr,
        EncounterTypeId: -1,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneOrders(1, {
        PatName: '',
        BillOrderNumber: '',
        FromDate: fromStr,
        ToDate: toStr,
        EncounterTypeId: -1,
      });
    }
  };

  // Handler: Page Change
  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneOrders(newPage);
    }
  };

  // Handler: Open Order Processing Form
  const handleProcessOrder = (order: OrderEntity) => {
    if (onAction) {
      onAction('edit', order);
    }
  };

  // Handler: Open Patient Profile
  const handlePatientInfo = (order: OrderEntity) => {
    if (onAction) {
      onAction('patientinfo', order);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = allItems.length;
    const pending = allItems.filter(
      (o) =>
        o.OrderStatusId === 1 ||
        (o.OrderStatus?.DisplayName || '').toLowerCase().includes('create') ||
        (o.OrderStatus?.DisplayName || '').toLowerCase().includes('pending')
    ).length;
    const executed = allItems.filter(
      (o) =>
        o.OrderStatusId === 2 ||
        (o.OrderStatus?.DisplayName || '').toLowerCase().includes('execut') ||
        (o.OrderStatus?.DisplayName || '').toLowerCase().includes('complet')
    ).length;
    const urgent = allItems.filter(
      (o) =>
        o.OrderPriorityId === 2 ||
        (o.OrderPriority?.Description || '').toLowerCase().includes('stat') ||
        (o.OrderPriority?.Description || '').toLowerCase().includes('urgent')
    ).length;
    const opCount = allItems.filter(
      (o) => o.EncounterTypeId === 1 || (o.EncounterType?.Description || '').toLowerCase() === 'op'
    ).length;
    const ipCount = allItems.filter(
      (o) => o.EncounterTypeId === 2 || (o.EncounterType?.Description || '').toLowerCase() === 'ip'
    ).length;

    return {
      total,
      pending,
      executed,
      urgent,
      opCount,
      ipCount,
    };
  }, [allItems]);

  // Formatter for Date Time (e.g. 11-Oct-2026, 10:33 AM)
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${day}, ${time}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pkg-page-container orderack-container">
      {/* 1. Executive Header Card */}
      <div className="pkg-header-card">
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: isLab
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : isRis
                ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }}
          >
            <i className={`fa ${headerIcon}`} aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">{categoryTitle}</h1>
              <span className="pkg-header-tag">{categoryTag}</span>
            </div>
            <p className="pkg-header-subtitle">{categorySubtitle}</p>
          </div>
        </div>

        <div className="pkg-header-right">
          <div className="pkg-header-chip" title="Current facility affiliation">
            <span className="pkg-header-chip-dot" />
            <span>{reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          <button
            type="button"
            id="btnRefreshOrders"
            className="pkg-btn-add"
            onClick={handleSearch}
            title="Refresh order list"
            style={{
              background: isLab
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            <i className="fa fa-refresh" aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Orders</span>
            <span className="pkg-stat-value">{stats.total}</span>
            <span className="pkg-stat-subtext">Retrieved in date range</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-list-alt" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Pending Acceptance</span>
            <span className="pkg-stat-value" style={{ color: '#d97706' }}>
              {stats.pending}
            </span>
            <span className="pkg-stat-subtext">Awaiting collection/processing</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-clock-o" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Stat / Urgent</span>
            <span className="pkg-stat-value" style={{ color: stats.urgent > 0 ? '#e11d48' : '#64748b' }}>
              {stats.urgent}
            </span>
            <span className="pkg-stat-subtext">High priority diagnostic orders</span>
          </div>
          <div
            className="pkg-stat-icon-wrapper"
            style={{
              backgroundColor: stats.urgent > 0 ? '#ffe4e6' : '#f1f5f9',
              color: stats.urgent > 0 ? '#e11d48' : '#64748b',
            }}
          >
            <i className="fa fa-bolt" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Encounters</span>
            <span className="pkg-stat-value" style={{ fontSize: '18px', color: '#0284c7' }}>
              {stats.opCount} OP / {stats.ipCount} IP
            </span>
            <span className="pkg-stat-subtext">Outpatient & Inpatient mix</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-hospital-o" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Advanced Filter Card */}
      <div className="pkg-filter-card">
        {/* Date presets row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: 4 }}>
              <i className="fa fa-calendar-check-o" style={{ marginRight: 4 }} /> Quick Range:
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
              className={`orderack-preset-chip ${activeDatePreset === 'month' ? 'active' : ''}`}
              onClick={() => handleDatePreset('month')}
            >
              This Month
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {stats.total > 0 && (
              <span>
                Found <strong>{stats.total}</strong> orders ({stats.pending} pending)
              </span>
            )}
          </div>
        </div>

        <div className="pkg-filter-row">
          {/* Patient Search */}
          <div className="pkg-filter-col pkg-filter-col-search" style={{ minWidth: 200 }}>
            <label className="pkg-filter-label" htmlFor="inputPatSearch">
              Patient Name / UHID
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-user pkg-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputPatSearch"
                className="pkg-filter-input"
                placeholder="Search patient name or UHID..."
                value={patSearch}
                onChange={(e) => setPatSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {patSearch && (
                <button
                  type="button"
                  className="pkg-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setPatSearch('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Order # / Bill # Search */}
          <div className="pkg-filter-col pkg-filter-col-search" style={{ minWidth: 180 }}>
            <label className="pkg-filter-label" htmlFor="inputOrderBillSearch">
              Order # / Bill #
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-barcode pkg-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputOrderBillSearch"
                className="pkg-filter-input"
                placeholder="Order# or Bill#..."
                value={orderBillSearch}
                onChange={(e) => setOrderBillSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {orderBillSearch && (
                <button
                  type="button"
                  className="pkg-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setOrderBillSearch('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* From Date */}
          <div className="pkg-filter-col" style={{ flex: '0 1 145px' }}>
            <label className="pkg-filter-label" htmlFor="inputFromDate">
              From Date
            </label>
            <input
              type="date"
              id="inputFromDate"
              className="pkg-filter-select"
              style={{ padding: '7px 10px', height: '38px' }}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActiveDatePreset('');
              }}
            />
          </div>

          {/* To Date */}
          <div className="pkg-filter-col" style={{ flex: '0 1 145px' }}>
            <label className="pkg-filter-label" htmlFor="inputToDate">
              To Date
            </label>
            <input
              type="date"
              id="inputToDate"
              className="pkg-filter-select"
              style={{ padding: '7px 10px', height: '38px' }}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActiveDatePreset('');
              }}
            />
          </div>

          {/* Encounter Type */}
          <div className="pkg-filter-col" style={{ flex: '0 1 130px' }}>
            <label className="pkg-filter-label" htmlFor="selectEncounterType">
              Visit Type
            </label>
            <select
              id="selectEncounterType"
              className="pkg-filter-select"
              value={encounterTypeId}
              onChange={(e) => setEncounterTypeId(Number(e.target.value))}
            >
              <option value={-1}>All Visits</option>
              {lookups.EncounterType.filter((opt) => Number(opt.Id) !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status */}
          <div className="pkg-filter-col" style={{ flex: '0 1 140px' }}>
            <label className="pkg-filter-label" htmlFor="selectOrderStatus">
              Order Status
            </label>
            <select
              id="selectOrderStatus"
              className="pkg-filter-select"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {lookups.OrderStatus.filter((opt) => Number(opt.Id) !== -1).map((opt) => (
                <option key={opt.Id} value={String(opt.Id)}>
                  {opt.DisplayName || opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pkg-filter-actions">
            <button
              type="button"
              id="btnFilterFetch"
              className="pkg-btn-search"
              onClick={handleSearch}
              title="Apply filters"
            >
              <i className="fa fa-filter" aria-hidden="true" />
              <span>Fetch</span>
            </button>

            <button
              type="button"
              id="btnFilterReset"
              className="pkg-btn-reset"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Enterprise Orders Data Table Card */}
      <div className="pkg-table-card">
        {isLoading ? (
          <div className="pkg-loading-overlay">
            <div className="pkg-spinner" />
            <span>Loading diagnostic orders...</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="pkg-empty-state">
            <i className={`fa ${headerIcon} pkg-empty-icon`} aria-hidden="true" />
            <h3 className="pkg-empty-title">No orders found</h3>
            <p className="pkg-empty-desc">
              No diagnostic orders matched your current filters or date range ({fromDate} to {toDate}).
              Try expanding your date range to view recent orders.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
              <button
                type="button"
                className="pkg-btn-add"
                onClick={() => handleDatePreset('7days')}
                style={{ fontSize: '13px' }}
              >
                <i className="fa fa-calendar" aria-hidden="true" />
                <span>View Last 7 Days</span>
              </button>
              <button
                type="button"
                className="pkg-btn-reset"
                onClick={handleResetFilters}
                style={{ fontSize: '13px' }}
              >
                <i className="fa fa-refresh" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pkg-table-responsive">
            <table className="pkg-table" id="tblOrderAcknowledgements">
              <thead>
                <tr>
                  <th className="pkg-col-idx" style={{ width: '50px' }}>
                    #
                  </th>
                  <th style={{ width: '170px' }}>Order & Bill #</th>
                  <th style={{ width: '160px' }}>Order Date</th>
                  <th style={{ minWidth: '220px' }}>Patient Information</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Visit</th>
                  <th style={{ width: '150px' }}>Location / Dept</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Priority</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const isUrgent =
                    item.OrderPriorityId === 2 ||
                    (item.OrderPriority?.Description || '').toLowerCase().includes('stat') ||
                    (item.OrderPriority?.Description || '').toLowerCase().includes('urgent');

                  const statusName =
                    item.OrderStatus?.DisplayName || item.OrderStatus?.Description || 'CREATED';
                  const isCreated = item.OrderStatusId === 1 || statusName.toUpperCase() === 'CREATED';
                  const isExecuted =
                    item.OrderStatusId === 2 || statusName.toUpperCase() === 'EXECUTED';
                  const isAccepted =
                    item.OrderStatusId === 10 || statusName.toUpperCase() === 'ACCEPTED';
                  const isRejected =
                    item.OrderStatusId === 15 || statusName.toUpperCase() === 'REJECTED';
                  const isProcessed = isExecuted || isAccepted;

                  const encDesc = item.EncounterType?.Description || 'OP';
                  const isIP = encDesc.toUpperCase() === 'IP';

                  const pat = item.Patient;
                  const rawTitle = (pat?.Title?.Description || '').trim();
                  const title = rawTitle ? (rawTitle.endsWith('.') ? `${rawTitle} ` : `${rawTitle}. `) : '';
                  const fullName = `${title}${pat?.FirstName || 'Patient'} ${pat?.LastName || ''}`.trim();
                  const ageGender = `${pat?.Age ? `${pat.Age} Y` : ''}${
                    pat?.Gender?.Description ? ` / ${pat.Gender.Description}` : ''
                  }`.trim();

                  const locationText = isIP
                    ? `${item.WardMaster?.WardName || 'Ward'}${
                        item.WardRoomMaster?.RoomNo ? ` / R:${item.WardRoomMaster.RoomNo}` : ''
                      }${item.WardRoomBedMaster?.BedNo ? ` / B:${item.WardRoomBedMaster.BedNo}` : ''}`
                    : item.OrderFrom?.DepartmentName || item.ParentDeparement?.DepartmentName || 'Outpatient';

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        backgroundColor: isUrgent ? '#fff1f2' : undefined,
                      }}
                    >
                      {/* S.No */}
                      <td className="pkg-col-idx">{rowIndex}</td>

                      {/* Order No / Bill No */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#0369a1',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {item.OrderNumber || '—'}
                          </span>
                          {item.BillNumber && (
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#64748b',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <i className="fa fa-file-text-o" style={{ fontSize: '10px' }} />
                              <span>{item.BillNumber}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Date */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                          {formatDateTime(item.OrderRequestDate)}
                        </span>
                      </td>

                      {/* Patient Information */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handlePatientInfo(item)}
                              className="orderack-pat-name-btn"
                              title="Click to view patient profile"
                            >
                              {fullName}
                            </button>
                            {pat?.MRN && (
                              <span className="orderack-mrn-chip" title="Medical Record Number / UHID">
                                {pat.MRN}
                              </span>
                            )}
                          </div>
                          {ageGender && (
                            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {ageGender}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visit Type */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`orderack-visit-badge ${
                            isIP ? 'orderack-visit-ip' : 'orderack-visit-op'
                          }`}
                        >
                          {encDesc}
                        </span>
                      </td>

                      {/* Location / Ward */}
                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#475569',
                            display: 'inline-block',
                            maxWidth: '150px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={locationText}
                        >
                          {locationText}
                        </span>
                      </td>

                      {/* Priority */}
                      <td style={{ textAlign: 'center' }}>
                        {isUrgent ? (
                          <span className="orderack-priority-urgent">
                            <i className="fa fa-exclamation-triangle" style={{ fontSize: '10px' }} />
                            <span>STAT</span>
                          </span>
                        ) : (
                          <span className="orderack-priority-routine">
                            <span>Routine</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`pkg-status-pill ${
                            isCreated
                              ? 'pkg-status-pill-draft'
                              : isExecuted
                              ? 'pkg-status-pill-active'
                              : isRejected
                              ? 'pkg-status-pill-inactive'
                              : 'pkg-status-pill-active'
                          }`}
                        >
                          <span className="pkg-status-dot" />
                          <span>{statusName}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            id={`btnProcessOrder_${item.Id}`}
                            className={isProcessed ? 'orderack-btn-view' : 'orderack-btn-process'}
                            title={isProcessed ? 'View diagnostic order details' : 'Acknowledge / Process diagnostic order'}
                            onClick={() => handleProcessOrder(item)}
                          >
                            <i className={`fa ${isProcessed ? 'fa-eye' : 'fa-check-square-o'}`} aria-hidden="true" />
                            <span>{isProcessed ? 'View' : 'Process'}</span>
                          </button>

                          <button
                            type="button"
                            className="orderack-btn-profile"
                            title="Patient Profile"
                            onClick={() => handlePatientInfo(item)}
                          >
                            <i className="fa fa-user-circle-o" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Sticky / Unified Pagination Bar */}
        {displayItems.length > 0 && (
          <div className="pkg-pagination-bar">
            <div className="pkg-pagination-info">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, displayItems.length)}</strong> of{' '}
              <strong>{displayItems.length}</strong> orders
            </div>

            <div className="pkg-pagination-controls">
              <Pagination
                currentPage={currentPage}
                totalItems={displayItems.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
