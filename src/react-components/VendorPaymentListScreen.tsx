import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface VendorPaymentListProps {
  reactProps?: {
    rows?: any[];
    items?: any[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      FromDate?: any;
      ToDate?: any;
      VendorMasterId?: number;
      VendorPaymentStatusId?: number;
      VendorPaymentIdentifier?: string;
      FacilityId?: number;
    };
    lookup?: {
      VendorPaymentStatus?: Array<{ Id: number | string; Text: string }>;
      Facility?: Array<{ Id: number | string; Text: string }>;
    };
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: any) => void;
}

export interface VendorPaymentItem {
  Id: number;
  VendorPaymentIdentifier: string;
  VendorPaymentDate: string;
  VendorMasterId?: number;
  VendorName: string;
  PaymentTypeId?: number;
  PaymentTypeDescription?: string;
  TotalPaidAmount: number;
  TotalNetAmount?: number;
  VendorPaymentStatusId: number;
  VendorPaymentStatusDescription: string;
  CreatedUser?: { FirstName?: string; LastName?: string };
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

export const VendorPaymentListScreen: React.FC<VendorPaymentListProps> = ({
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
  const [searchQuery, setSearchQuery] = useState<string>(
    reactProps?.currentfilter?.VendorPaymentIdentifier || ''
  );
  const [statusId, setStatusId] = useState<number>(
    reactProps?.currentfilter?.VendorPaymentStatusId !== undefined
      ? reactProps.currentfilter.VendorPaymentStatusId
      : 2 // Default: Completed
  );
  const [selectedVendorId, setSelectedVendorId] = useState<number>(
    reactProps?.currentfilter?.VendorMasterId || -1
  );
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<VendorPaymentItem | null>(null);

  // Vendor list for filter autocomplete
  const [vendors, setVendors] = useState<Array<{ Id: number; VendorName: string; VendorCode: string }>>([]);

  // Data rows
  const [payments, setPayments] = useState<VendorPaymentItem[]>([
    {
      Id: 101,
      VendorPaymentIdentifier: 'VP-2026-0089',
      VendorPaymentDate: '2026-10-17T08:30:00',
      VendorMasterId: 12,
      VendorName: 'Sun Pharma Distribution Ltd',
      PaymentTypeId: 1,
      PaymentTypeDescription: 'Cash',
      TotalPaidAmount: 45200.0,
      TotalNetAmount: 45200.0,
      VendorPaymentStatusId: 2,
      VendorPaymentStatusDescription: 'Completed',
    },
    {
      Id: 102,
      VendorPaymentIdentifier: 'VP-2026-0090',
      VendorPaymentDate: '2026-10-17T09:15:00',
      VendorMasterId: 18,
      VendorName: 'Cipla Healthcare Logistics',
      PaymentTypeId: 4,
      PaymentTypeDescription: 'Wire Transfer / NEFT',
      TotalPaidAmount: 128500.0,
      TotalNetAmount: 128500.0,
      VendorPaymentStatusId: 2,
      VendorPaymentStatusDescription: 'Completed',
    },
    {
      Id: 103,
      VendorPaymentIdentifier: 'VP-2026-0091',
      VendorPaymentDate: '2026-10-17T09:45:00',
      VendorMasterId: 22,
      VendorName: 'Apollo Surgical & Diagnostics Supplies',
      PaymentTypeId: 2,
      PaymentTypeDescription: 'Cheque',
      TotalPaidAmount: 76400.0,
      TotalNetAmount: 76400.0,
      VendorPaymentStatusId: 1,
      VendorPaymentStatusDescription: 'Draft',
    },
    {
      Id: 104,
      VendorPaymentIdentifier: 'VP-2026-0092',
      VendorPaymentDate: '2026-10-16T14:20:00',
      VendorMasterId: 14,
      VendorName: 'Medtronic Instruments India',
      PaymentTypeId: 4,
      PaymentTypeDescription: 'RTGS',
      TotalPaidAmount: 210000.0,
      TotalNetAmount: 210000.0,
      VendorPaymentStatusId: 2,
      VendorPaymentStatusDescription: 'Completed',
    },
    {
      Id: 105,
      VendorPaymentIdentifier: 'VP-2026-0093',
      VendorPaymentDate: '2026-10-16T16:10:00',
      VendorMasterId: 30,
      VendorName: 'Abbott Diagnostics Care',
      PaymentTypeId: 2,
      PaymentTypeDescription: 'Cheque',
      TotalPaidAmount: 32000.0,
      TotalNetAmount: 32000.0,
      VendorPaymentStatusId: 3,
      VendorPaymentStatusDescription: 'Cancelled',
    },
  ]);

  // Lookup statuses
  const statusOptions = reactProps?.lookup?.VendorPaymentStatus || [
    { Id: -1, Text: 'All Statuses' },
    { Id: 1, Text: 'Draft' },
    { Id: 2, Text: 'Completed' },
    { Id: 3, Text: 'Cancelled' },
  ];

  const facilityName = sessionHelper.getCurrentFacilityName() || 'SHUVADARSINI HOSPITAL';

  // Load vendors for dropdown
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await callBackendApi('pharmacy/vendormaster/GetVendorMasters', {
          Params: [
            { Key: 3, Value: 1 },
            { Key: 4, Value: 2 },
          ],
          PageContext: { PageSize: 100, PageNumber: 1 },
        });
        if (res && res.Data && Array.isArray(res.Data)) {
          setVendors(
            res.Data.map((v: any) => ({
              Id: v.Id || v.VendorMasterId,
              VendorName: v.VendorName,
              VendorCode: v.VendorCode,
            }))
          );
        }
      } catch (err) {
        console.warn('Could not load vendor master list:', err);
      }
    };
    loadVendors();
  }, []);

  // Synchronize incoming reactProps data
  useEffect(() => {
    if (reactProps?.rows && Array.isArray(reactProps.rows)) {
      if (reactProps.rows.length > 0) {
        const mapped: VendorPaymentItem[] = reactProps.rows.map((r: any) => ({
          Id: r.Id,
          VendorPaymentIdentifier: r.VendorPaymentIdentifier || `VP-${r.Id}`,
          VendorPaymentDate: r.VendorPaymentDate || new Date().toISOString(),
          VendorMasterId: r.VendorMasterId,
          VendorName: r.VendorName || r.VendorMaster?.VendorName || 'Supplier',
          PaymentTypeId: r.PaymentTypeId,
          PaymentTypeDescription: r.PaymentType?.Description || (r.PaymentTypeId === 1 ? 'Cash' : 'Bank Transfer'),
          TotalPaidAmount: Number(r.TotalPaidAmount) || 0,
          TotalNetAmount: Number(r.TotalNetAmount) || Number(r.TotalPaidAmount) || 0,
          VendorPaymentStatusId: r.VendorPaymentStatusId || 2,
          VendorPaymentStatusDescription:
            r.VendorPaymentStatus?.Description ||
            (r.VendorPaymentStatusId === 1 ? 'Draft' : r.VendorPaymentStatusId === 3 ? 'Cancelled' : 'Completed'),
          CreatedUser: r.CreatedUser,
        }));
        setPayments(mapped);
      }
    }
  }, [reactProps?.rows]);

  // Fetch list (Standalone mode)
  const fetchList = useCallback(async () => {
    if (onAction) {
      onAction('filter', {
        FromDate: fromDate,
        ToDate: toDate,
        VendorMasterId: selectedVendorId > 0 ? selectedVendorId : undefined,
        VendorPaymentStatusId: statusId !== -1 ? statusId : undefined,
        VendorPaymentIdentifier: searchQuery || undefined,
        currentPage,
        pageSize,
      });
      return;
    }

    setLoading(true);
    try {
      const facilityId = sessionHelper.getCurrentFacilityId() || 1;
      const res = await callBackendApi('pharmacy/VendorPayment/GetVendorPayments', {
        Params: [
          { Key: 1, Value: facilityId },
          { Key: 5, Value: selectedVendorId > 0 ? selectedVendorId : undefined },
          { Key: 6, Value: statusId !== -1 ? statusId : undefined },
          { Key: 7, Value: searchQuery || undefined },
          { Key: 3, Value: `${fromDate} 00:00:00` },
          { Key: 4, Value: `${toDate} 23:59:59` },
        ],
        PageContext: { PageSize: pageSize, PageNumber: currentPage },
      });

      if (res && res.Data && Array.isArray(res.Data) && res.Data.length > 0) {
        const mapped: VendorPaymentItem[] = res.Data.map((r: any) => ({
          Id: r.Id,
          VendorPaymentIdentifier: r.VendorPaymentIdentifier || `VP-${r.Id}`,
          VendorPaymentDate: r.VendorPaymentDate || new Date().toISOString(),
          VendorMasterId: r.VendorMasterId,
          VendorName: r.VendorName || r.VendorMaster?.VendorName || 'Supplier',
          PaymentTypeId: r.PaymentTypeId,
          PaymentTypeDescription: r.PaymentType?.Description || (r.PaymentTypeId === 1 ? 'Cash' : 'Bank Transfer'),
          TotalPaidAmount: Number(r.TotalPaidAmount) || 0,
          TotalNetAmount: Number(r.TotalNetAmount) || Number(r.TotalPaidAmount) || 0,
          VendorPaymentStatusId: r.VendorPaymentStatusId || 2,
          VendorPaymentStatusDescription:
            r.VendorPaymentStatus?.Description ||
            (r.VendorPaymentStatusId === 1 ? 'Draft' : r.VendorPaymentStatusId === 3 ? 'Cancelled' : 'Completed'),
          CreatedUser: r.CreatedUser,
        }));
        setPayments(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch vendor payments from API:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedVendorId, statusId, searchQuery, currentPage, pageSize, onAction]);

  // Actions
  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else if (onNavigate) {
      onNavigate('app.vendorpayments', { id: 0 });
    } else {
      window.location.hash = '#/app/vendorpayments/0';
    }
  };

  const handleEdit = (item: VendorPaymentItem) => {
    if (onAction) {
      onAction('edit', item);
    } else if (onNavigate) {
      onNavigate('app.vendorpayments', { id: item.Id });
    } else {
      window.location.hash = `#/app/vendorpayments/${item.Id}`;
    }
  };

  const handleView = (item: VendorPaymentItem) => {
    if (onAction) {
      onAction('view', item);
    } else if (onNavigate) {
      onNavigate('app.vendorpayments', { id: item.Id });
    } else {
      window.location.hash = `#/app/vendorpayments/${item.Id}`;
    }
  };

  const handleDelete = async (item: VendorPaymentItem) => {
    if (onAction) {
      onAction('delete', item);
      return;
    }

    try {
      await callBackendApi('pharmacy/VendorPayment/DeleteVendorPayment', { Id: item.Id });
      setPayments((prev) => prev.filter((p) => p.Id !== item.Id));
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleQuickRange = (days: number) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setFromDate(past.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  };

  // Filtered rows
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.VendorPaymentIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.VendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusId === -1 || p.VendorPaymentStatusId === statusId;
      const matchVendor = selectedVendorId === -1 || p.VendorMasterId === selectedVendorId;
      return matchSearch && matchStatus && matchVendor;
    });
  }, [payments, searchQuery, statusId, selectedVendorId]);

  // Statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter((p) => p.VendorPaymentStatusId === 2).length;
    const draft = payments.filter((p) => p.VendorPaymentStatusId === 1).length;
    const totalVolume = payments
      .filter((p) => p.VendorPaymentStatusId !== 3)
      .reduce((sum, p) => sum + p.TotalPaidAmount, 0);

    return { total, completed, draft, totalVolume };
  }, [payments]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '24px 32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header */}
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
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 4px rgba(67, 56, 202, 0.15)',
            }}
          >
            <i className="fa fa-credit-card" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                Supplier Payments
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                }}
              >
                PHARMACY & STORES
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Facility: <b>{facilityName}</b> &bull; Accounts Payable, GRN Settlement & Vouchers
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchList}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb')}
          >
            <i className="fa fa-plus" /> Add Supplier Payment
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Vouchers
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Filtered period</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-file-text-o" />
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
              Completed / Settled
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
              {stats.completed}
            </div>
            <div style={{ fontSize: '12px', color: '#86efac', marginTop: '2px' }}>Disbursed to suppliers</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-check-circle" />
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
              Draft Payments
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
              {stats.draft}
            </div>
            <div style={{ fontSize: '12px', color: '#fde68a', marginTop: '2px' }}>Awaiting authorization</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-clock-o" />
          </div>
        </div>

        {/* Card 4 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Total Paid Volume
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
              {formatCurrency(stats.totalVolume)}
            </div>
            <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '2px' }}>Active disbursements</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-inr" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '24px',
        }}
      >
        {/* Quick Date Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Quick Range:</span>
          <button
            type="button"
            onClick={() => handleQuickRange(0)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleQuickRange(7)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #2563eb',
              backgroundColor: '#eff6ff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#1d4ed8',
            }}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => handleQuickRange(30)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            Last 30 Days
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'flex-end',
          }}
        >
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
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
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Supplier Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Supplier / Vendor
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value={-1}>All Suppliers</option>
              {vendors.map((v) => (
                <option key={v.Id} value={v.Id}>
                  {v.VendorName} {v.VendorCode ? `(${v.VendorCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Payment Status
            </label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Search Voucher # */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Search Payment #
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-search"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              />
              <input
                type="text"
                placeholder="Voucher # or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', width: '50px' }}>#</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Payment Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Payment No</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Supplier</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Payment Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Paid Amount
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '130px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '8px' }}>
                      <i className="fa fa-folder-open-o" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                      No Supplier Payments Found
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Try adjusting the date filters or search terms
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, index) => {
                  const isCompleted = p.VendorPaymentStatusId === 2;
                  const isDraft = p.VendorPaymentStatusId === 1;
                  const isCancelled = p.VendorPaymentStatusId === 3;

                  return (
                    <tr
                      key={p.Id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc')}
                      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 500 }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(p.VendorPaymentDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {new Date(p.VendorPaymentDate).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: 700 }}>
                        {p.VendorPaymentIdentifier}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                        {p.VendorName}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#334155',
                          }}
                        >
                          {p.PaymentTypeDescription || 'Cash'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                        {formatCurrency(p.TotalPaidAmount)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isCompleted ? '#dcfce7' : isDraft ? '#fef3c7' : '#fee2e2',
                            color: isCompleted ? '#16a34a' : isDraft ? '#d97706' : '#dc2626',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isCompleted ? '#16a34a' : isDraft ? '#d97706' : '#dc2626',
                            }}
                          />
                          {p.VendorPaymentStatusDescription}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View button */}
                          <button
                            type="button"
                            title="View Voucher"
                            onClick={() => handleView(p)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-eye" />
                          </button>

                          {/* Edit button */}
                          {(isDraft || isCompleted) && (
                            <button
                              type="button"
                              title="Edit Voucher"
                              onClick={() => handleEdit(p)}
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              <i className="fa fa-pencil" />
                            </button>
                          )}

                          {/* Delete button (only Draft) */}
                          {isDraft && (
                            <button
                              type="button"
                              title="Delete Voucher"
                              onClick={() => setDeleteConfirmItem(p)}
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              <i className="fa fa-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & count */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <div>
            Showing <b>{filteredPayments.length}</b> of <b>{payments.length}</b> payment records
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Page {currentPage} of 1</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i className="fa fa-exclamation-triangle" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Confirm Deletion
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Action cannot be undone</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Are you sure you want to delete draft payment voucher{' '}
              <b style={{ color: '#0f172a' }}>{deleteConfirmItem.VendorPaymentIdentifier}</b> for supplier{' '}
              <b style={{ color: '#0f172a' }}>{deleteConfirmItem.VendorName}</b>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmItem)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
