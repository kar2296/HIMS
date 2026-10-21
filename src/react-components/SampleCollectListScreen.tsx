import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface LookupOption {
  Id: number | string;
  Text: string;
  Description?: string;
  DisplayName?: string;
  Code?: string;
}

export interface WorkOrderSampleItem {
  Id: number;
  WorkOrderId?: number;
  PatientOrderId?: number;
  PatientId?: number;
  Encounterid?: number;
  SampleStatusId?: number;
  SamplePriorityId?: number;
  LabAssignTypeId?: number;
  Status?: number;
  Rev?: number;
  CreatedBy?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  OrderPriority?: {
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
    Title?: { Description?: string };
    Gender?: { Description?: string };
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

export interface SampleCollectListScreenProps {
  reactProps?: {
    items?: WorkOrderSampleItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      PatOrdNo?: string;
      ordernrbillnr?: string;
      Patient?: string;
      patienttypeid?: number;
      samplestatusid?: any;
      orderstatusid?: any;
      FromDate?: string | Date;
      ToDate?: string | Date;
      SubDepartmentId?: number;
      VisitIdentifier?: string;
      WorkOrderdid?: string;
    };
    lookup?: {
      OrderStatus?: LookupOption[];
      SampleStatus?: LookupOption[];
      PatientType?: LookupOption[];
      SubDepartment?: LookupOption[];
    };
    facilityName?: string;
    facilityId?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: Record<string, any>) => void;
}

export const SampleCollectListScreen: React.FC<SampleCollectListScreenProps> = ({
  reactProps,
  onAction,
  onNavigate,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Date format utility
  const formatInputDate = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatInputDate(new Date());

  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<WorkOrderSampleItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(
    reactProps?.currentfilter?.PatOrdNo || reactProps?.currentfilter?.ordernrbillnr || ''
  );
  const [fromDate, setFromDate] = useState<string>(
    reactProps?.currentfilter?.FromDate ? String(reactProps.currentfilter.FromDate).slice(0, 10) : todayStr
  );
  const [toDate, setToDate] = useState<string>(
    reactProps?.currentfilter?.ToDate ? String(reactProps.currentfilter.ToDate).slice(0, 10) : todayStr
  );
  const [sampleStatusId, setSampleStatusId] = useState<string | number>(
    reactProps?.currentfilter?.samplestatusid ?? ''
  );
  const [orderStatusId, setOrderStatusId] = useState<string | number>(
    reactProps?.currentfilter?.orderstatusid ?? -1
  );

  // Sync props from AngularJS when in hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.PatOrdNo !== undefined) {
        setSearchQuery(reactProps.currentfilter.PatOrdNo);
      }
      if (reactProps.currentfilter.FromDate) {
        setFromDate(String(reactProps.currentfilter.FromDate).slice(0, 10));
      }
      if (reactProps.currentfilter.ToDate) {
        setToDate(String(reactProps.currentfilter.ToDate).slice(0, 10));
      }
      if (reactProps.currentfilter.samplestatusid !== undefined) {
        setSampleStatusId(reactProps.currentfilter.samplestatusid);
      }
      if (reactProps.currentfilter.orderstatusid !== undefined) {
        setOrderStatusId(reactProps.currentfilter.orderstatusid);
      }
    }
  }, [reactProps?.currentfilter]);

  // Standalone API Fetch
  const fetchSamples = useCallback(async (page: number, size: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const facilityId = sessionHelper.getFacilityId() || 1;
      const payload = {
        Params: [
          { Key: 4, Value: searchQuery || null },
          { Key: 3, Value: -1 },
          { Key: 20, Value: searchQuery || null },
          { Key: 21, Value: sampleStatusId || null },
          { Key: 7, Value: ['1', '6', '8', '9', '10', '11', '16', '17'] },
          { Key: 24, Value: fromDate ? `${fromDate} 00:00:00` : null },
          { Key: 25, Value: toDate ? `${toDate} 23:59:59` : null },
          { Key: 17, Value: facilityId }
        ],
        PageContext: {
          PageSize: size,
          PageNumber: page,
        }
      };

      const res = await callBackendApi('lis/workordersample/GetWorkOrderSamples', payload);
      const data = res?.data || res?.Data || res?.rows || [];
      const total = res?.PageContext?.TotalRecords || res?.total || (Array.isArray(data) ? data.length : 0);

      setStandaloneItems(Array.isArray(data) ? data : []);
      setStandaloneTotal(total);
    } catch (err: any) {
      console.error('Failed to load sample collection worklist:', err);
      setErrorMessage(err?.message || 'Failed to fetch sample records.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, fromDate, toDate, sampleStatusId]);

  useEffect(() => {
    if (!isHybrid) {
      fetchSamples(standalonePage, standalonePageSize);
    }
  }, [isHybrid, standalonePage, standalonePageSize, fetchSamples]);

  // Active items and pagination info
  const items: WorkOrderSampleItem[] = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems: number = isHybrid ? (reactProps?.totalItems || 0) : standaloneTotal;
  const currentPage: number = isHybrid ? (reactProps?.currentPage || 1) : standalonePage;
  const pageSize: number = isHybrid ? (reactProps?.pageSize || 25) : standalonePageSize;

  // KPIs
  const stats = useMemo(() => {
    let pending = 0;
    let collected = 0;
    let urgent = 0;
    items.forEach((item) => {
      const statusDesc = (item.SampleStatus?.Description || '').toLowerCase();
      const priorityDesc = (item.OrderPriority?.Description || '').toLowerCase();
      if (statusDesc.includes('pending') || item.SampleStatusId === 1) {
        pending++;
      } else if (statusDesc.includes('collected') || item.SampleStatusId === 3) {
        collected++;
      }
      if (priorityDesc.includes('stat') || priorityDesc.includes('urgent')) {
        urgent++;
      }
    });
    return { total: totalItems || items.length, pending, collected, urgent };
  }, [items, totalItems]);

  // Actions
  const handleCollect = (sample: WorkOrderSampleItem) => {
    if (onAction) {
      onAction('edit', sample);
      return;
    }
    if (onNavigate) {
      onNavigate('app.samplecollect', { id: sample.Id });
      return;
    }
    window.location.hash = `#/app/samplecollect/${sample.Id}`;
  };

  const handlePatientInfo = (sample: WorkOrderSampleItem) => {
    if (onAction) {
      onAction('patientinfo', sample);
    }
  };

  const handleTatClick = (sample: WorkOrderSampleItem) => {
    if (onAction) {
      onAction('ordertat', sample);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHybrid && onAction) {
      onAction('filter', {
        PatOrdNo: searchQuery,
        FromDate: fromDate,
        ToDate: toDate,
        samplestatusid: sampleStatusId,
        orderstatusid: orderStatusId,
      });
    } else {
      setStandalonePage(1);
      fetchSamples(1, standalonePageSize);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFromDate(todayStr);
    setToDate(todayStr);
    setSampleStatusId('');
    setOrderStatusId(-1);
    if (isHybrid && onAction) {
      onAction('filter', {
        PatOrdNo: '',
        FromDate: todayStr,
        ToDate: todayStr,
        samplestatusid: '',
        orderstatusid: -1,
      });
    } else {
      setStandalonePage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('page', newPage);
    } else {
      setStandalonePage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isHybrid && onAction) {
      onAction('pageSize', newSize);
    } else {
      setStandalonePageSize(newSize);
      setStandalonePage(1);
    }
  };

  return (
    <div
      style={{
        padding: spacing.lg,
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
          background: '#ffffff',
          padding: `${spacing.md} ${spacing.lg}`,
          borderRadius: radii.xl,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.lg,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <i className="fas fa-vial" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: -0.3,
                }}
              >
                Sample Collection Worklist
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                Phlebotomy & Specimen Intake
              </span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Track specimen accessioning, tube barcoding, and collection confirmation
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('app.labdashboard');
              else window.location.hash = '#/app/labdashboard';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.textMain,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa fa-home" style={{ color: colors.primary }} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: radii.md,
              border: 'none',
              background: colors.primary,
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: `${spacing.md} ${spacing.lg}`,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>
              Total Orders
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: colors.textMain, marginTop: 4 }}>
              {stats.total}
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: '#eff6ff',
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <i className="fas fa-clipboard-list" />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: `${spacing.md} ${spacing.lg}`,
            borderRadius: radii.lg,
            border: '1px solid #fed7aa',
            boxShadow: shadows.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#c2410c', textTransform: 'uppercase' }}>
              Pending Collection
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', marginTop: 4 }}>
              {stats.pending}
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <i className="fas fa-hourglass-half" />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: `${spacing.md} ${spacing.lg}`,
            borderRadius: radii.lg,
            border: '1px solid #bbf7d0',
            boxShadow: shadows.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>
              Collected
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
              {stats.collected}
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <i className="fas fa-check-circle" />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: `${spacing.md} ${spacing.lg}`,
            borderRadius: radii.lg,
            border: '1px solid #fecaca',
            boxShadow: shadows.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', textTransform: 'uppercase' }}>
              Urgent / STAT
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
              {stats.urgent}
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <i className="fas fa-bolt" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Panel ──────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          padding: spacing.md,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
            alignItems: 'end',
          }}
        >
          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Search UHID / Patient / Order / Bill #
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '0 10px',
                height: 38,
              }}
            >
              <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 13 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="MRN, name, or order #..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  width: '100%',
                  color: colors.textMain,
                }}
              />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                background: '#f8fafc',
                fontSize: 13,
                color: colors.textMain,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                background: '#f8fafc',
                fontSize: 13,
                color: colors.textMain,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Sample Status */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Sample Status
            </label>
            <select
              value={sampleStatusId}
              onChange={(e) => setSampleStatusId(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                background: '#f8fafc',
                fontSize: 13,
                color: colors.textMain,
              }}
            >
              <option value="">All Sample Statuses</option>
              <option value="1">Pending Collection</option>
              <option value="3">Collected</option>
              <option value="5">Received / Accepted</option>
              <option value="4">Rejected</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              type="submit"
              style={{
                flex: 1,
                height: 38,
                borderRadius: radii.md,
                border: 'none',
                background: colors.primary,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
              }}
            >
              <i className="fas fa-filter" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                height: 38,
                padding: '0 14px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: colors.textMuted,
                fontWeight: 500,
                fontSize: 13,
                cursor: 'pointer',
              }}
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* ── Table Container ───────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        {errorMessage && (
          <div
            style={{
              padding: spacing.md,
              background: '#fef2f2',
              color: '#b91c1c',
              borderBottom: '1px solid #fecaca',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="fas fa-exclamation-circle" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: '#f1f5f9',
                  borderBottom: `2px solid ${colors.border}`,
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                <th style={{ padding: '12px 16px', width: 48, textAlign: 'center' }}>#</th>
                <th style={{ padding: '12px 16px' }}>Order / Bill #</th>
                <th style={{ padding: '12px 16px' }}>Patient Info</th>
                <th style={{ padding: '12px 16px' }}>Priority</th>
                <th style={{ padding: '12px 16px' }}>Work Order #</th>
                <th style={{ padding: '12px 16px' }}>Order Date</th>
                <th style={{ padding: '12px 16px' }}>Sample Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: colors.primary, marginBottom: 8 }} />
                    <div>Loading specimen orders...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-inbox fa-3x" style={{ color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textMain }}>No sample collection records found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Adjust your search query or date range filter</div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1;
                  const pat = row.Patient || {};
                  const patName = [pat.Title?.Description, pat.FirstName, pat.LastName].filter(Boolean).join(' ') || 'Unnamed Patient';
                  const priority = row.OrderPriority?.Description || 'Routine';
                  const isStat = priority.toLowerCase().includes('stat') || priority.toLowerCase().includes('urgent');
                  const statusDesc = row.SampleStatus?.Description || 'Pending Collection';
                  const isCollected = statusDesc.toLowerCase().includes('collected') || row.SampleStatusId === 3;
                  const isAccepted = statusDesc.toLowerCase().includes('received') || statusDesc.toLowerCase().includes('accepted');

                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* S.No */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: colors.textMuted, fontWeight: 600 }}>
                        {sNo}
                      </td>

                      {/* Order / Bill No */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: colors.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="fas fa-hashtag" style={{ fontSize: 11, opacity: 0.6 }} />
                          <span>{row.PatientOrder?.OrderNumber || '—'}</span>
                        </div>
                        {row.PatientOrder?.BillNumber && (
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                            Bill: {row.PatientOrder.BillNumber}
                          </div>
                        )}
                      </td>

                      {/* Patient Info */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.full,
                              background: '#e0f2fe',
                              color: '#0369a1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {(pat.FirstName || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handlePatientInfo(row)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                fontWeight: 700,
                                color: colors.textMain,
                                fontSize: 13,
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                            >
                              {patName}
                            </button>
                            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                              MRN: <strong>{pat.MRN || '—'}</strong>
                              {pat.Age ? ` • ${pat.Age}y` : ''}
                              {pat.Gender?.Description ? ` • ${pat.Gender.Description}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isStat ? '#fee2e2' : '#f1f5f9',
                            color: isStat ? '#b91c1c' : '#475569',
                          }}
                        >
                          {isStat && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />}
                          {priority}
                        </span>
                      </td>

                      {/* Work Order # */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain, fontSize: 12 }}>
                          {row.PatientWorkorder?.WorkOrderdid || '—'}
                        </div>
                        {row.PatientOrder?.SubDeparement?.DepartmentName && (
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                            {row.PatientOrder.SubDeparement.DepartmentName}
                          </div>
                        )}
                      </td>

                      {/* Created At / Order Date */}
                      <td style={{ padding: '12px 16px', color: colors.textMuted, fontSize: 12 }}>
                        {row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : '—'}
                        {row.CreatedAt && (
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>
                            {new Date(row.CreatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* Sample Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isAccepted
                              ? '#dcfce7'
                              : isCollected
                              ? '#e0f2fe'
                              : '#fef3c7',
                            color: isAccepted
                              ? '#15803d'
                              : isCollected
                              ? '#0369a1'
                              : '#b45309',
                          }}
                        >
                          {statusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleCollect(row)}
                            title={isCollected ? 'View / Edit Sample' : 'Collect Sample'}
                            style={{
                              padding: '6px 12px',
                              borderRadius: radii.md,
                              border: isCollected ? `1px solid ${colors.border}` : 'none',
                              background: isCollected ? '#ffffff' : colors.primary,
                              color: isCollected ? colors.textMain : '#ffffff',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: isCollected ? 'none' : '0 2px 4px rgba(37, 99, 235, 0.2)',
                            }}
                          >
                            <i className={isCollected ? 'fas fa-eye' : 'fas fa-vial'} />
                            <span>{isCollected ? 'Review' : 'Collect'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTatClick(row)}
                            title="Turnaround Time Audit"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              border: `1px solid ${colors.border}`,
                              background: '#ffffff',
                              color: colors.textMuted,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            <i className="fas fa-clock" />
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

        {/* ── Table Footer & Pagination ───────────────────────── */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border}`,
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            Showing{' '}
            <strong>
              {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong>{totalItems}</strong> records
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};
