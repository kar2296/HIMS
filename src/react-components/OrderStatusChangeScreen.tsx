import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface OrderStatusChangeItem {
  Id: number;
  OrderNumber: string;
  BillNumber?: string;
  OrderRequestDate?: string;
  PatientId?: number;
  EncounterId?: number;
  TestTypeId?: number;
  MRN?: string;
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Age?: number;
    Gender?: { Description?: string };
    Title?: { Description?: string };
  };
  EncounterType?: {
    Id?: number;
    Description?: string;
  };
  OrderPriorityId?: number;
  OrderPriority?: {
    Id?: number;
    Description?: string;
  };
  OrderStatusId?: number;
  OrderStatus?: {
    Id?: number;
    DisplayName?: string;
    Description?: string;
  };
  SubDeparement?: {
    DepartmentName?: string;
  };
  IsExternal?: boolean;
  PatientBillStatusId?: number;
}

export interface OrderStatusChangeScreenProps {
  reactProps?: {
    items?: OrderStatusChangeItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      PatName?: string;
      BillOrderNumber?: string;
      FromDate?: string | Date;
      ToDate?: string | Date;
      OrderStatusId?: string | number;
      EncounterTypeId?: number;
    };
    lookup?: {
      OrderStatus?: Array<{ Id: number | string; Text: string; DisplayName?: string }>;
      EncounterType?: Array<{ Id: number | string; Text: string; Description?: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OrderStatusChangeScreen: React.FC<OrderStatusChangeScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const [items, setItems] = useState<OrderStatusChangeItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [fromDate, setFromDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [patName, setPatName] = useState<string>(reactProps?.currentfilter?.PatName || '');
  const [billOrderNumber, setBillOrderNumber] = useState<string>(reactProps?.currentfilter?.BillOrderNumber || '');
  const [encounterTypeId, setEncounterTypeId] = useState<string>(
    String(reactProps?.currentfilter?.EncounterTypeId !== undefined ? reactProps.currentfilter.EncounterTypeId : '-1')
  );
  const [orderStatusId, setOrderStatusId] = useState<string>(
    String(reactProps?.currentfilter?.OrderStatusId !== undefined ? reactProps.currentfilter.OrderStatusId : '-1')
  );

  // Lookup options
  const orderStatuses = (reactProps?.lookup?.OrderStatus as any) || [
    { Id: -1, Text: 'All Statuses' },
    { Id: 1, Text: 'Order Placed' },
    { Id: 2, Text: 'Sample Collected' },
    { Id: 3, Text: 'Sample Acknowledged' },
    { Id: 4, Text: 'In Analysis' },
    { Id: 5, Text: 'Result Entered' },
    { Id: 6, Text: 'Approved / Verified' },
    { Id: 7, Text: 'Cancelled / Discontinued' },
  ];

  const encounterTypes = (reactProps?.lookup?.EncounterType as any) || [
    { Id: -1, Text: 'All Visit Types' },
    { Id: 1, Text: 'Outpatient (OPD)' },
    { Id: 2, Text: 'Inpatient (IPD)' },
    { Id: 3, Text: 'Emergency / Daycare' },
  ];

  // Quick stat cards calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const statEmergency = items.filter((i) => i.OrderPriorityId === 2).length;
    const routine = total - statEmergency;
    const cancelled = items.filter((i) => i.OrderStatusId === 7 || (i.OrderStatus?.DisplayName || '').toLowerCase().includes('cancel')).length;
    return {
      total,
      routine: routine > 0 ? routine : 0,
      statEmergency,
      cancelled,
    };
  }, [items, totalItems]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fromFormatted = fromDate ? `${fromDate} 00:00:00` : null;
      const toFormatted = toDate ? `${toDate} 23:59:59` : null;

      const inputData = {
        Params: [
          { Key: 1, Value: billOrderNumber.trim() || null },
          { Key: 2, Value: patName.trim() || null },
          { Key: 7, Value: fromFormatted },
          { Key: 8, Value: toFormatted },
          { Key: 9, Value: orderStatusId !== '-1' ? orderStatusId : null },
          { Key: 10, Value: encounterTypeId !== '-1' ? parseInt(encounterTypeId, 10) : -1 },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('emr/patientorder/GetPatientOrders', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('Failed to fetch order status change list, using props or cache:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, billOrderNumber, patName, orderStatusId, encounterTypeId, pageSize, currentPage, reactProps?.items, reactProps?.totalItems]);

  useEffect(() => {
    if (reactProps?.items) {
      setItems(reactProps.items);
      setTotalItems(reactProps.totalItems || reactProps.items.length);
    } else {
      fetchData();
    }
  }, [reactProps?.items, reactProps?.totalItems, fetchData]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      onAction('search', {
        PatName: patName,
        BillOrderNumber: billOrderNumber,
        FromDate: fromDate,
        ToDate: toDate,
        OrderStatusId: orderStatusId !== '-1' ? orderStatusId : null,
        EncounterTypeId: encounterTypeId !== '-1' ? parseInt(encounterTypeId, 10) : -1,
      });
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handleReset = () => {
    setPatName('');
    setBillOrderNumber('');
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setEncounterTypeId('-1');
    setOrderStatusId('-1');
    if (onAction) {
      onAction('resetFilters');
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchData();
    }
  };

  const getPriorityBadge = (priorityId?: number, description?: string) => {
    const isStat = priorityId === 2 || (description || '').toLowerCase().includes('stat') || (description || '').toLowerCase().includes('urgent');
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          background: isStat ? '#fef2f2' : '#f1f5f9',
          color: isStat ? '#dc2626' : '#475569',
          border: `1px solid ${isStat ? '#fecaca' : '#e2e8f0'}`,
        }}
      >
        {isStat && <i className="fa fa-bolt" />}
        {description || (isStat ? 'STAT / URGENT' : 'Routine')}
      </span>
    );
  };

  const getStatusBadge = (item: OrderStatusChangeItem) => {
    const statusText = item.OrderStatus?.DisplayName || item.OrderStatus?.Description || 'Order Placed';
    const isCancelled = (statusText || '').toLowerCase().includes('cancel');
    const isApproved = (statusText || '').toLowerCase().includes('approved') || (statusText || '').toLowerCase().includes('verified');

    let bg = '#eff6ff';
    let text = '#1d4ed8';
    let border = '#dbeafe';

    if (isCancelled) {
      bg = '#fef2f2';
      text = '#dc2626';
      border = '#fecaca';
    } else if (isApproved) {
      bg = '#ecfdf5';
      text = '#047857';
      border = '#a7f3d0';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          background: bg,
          color: text,
          border: `1px solid ${border}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: text,
          }}
        />
        {statusText}
      </span>
    );
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              }}
            >
              <i className="fa fa-exchange" />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Diagnostic Order Status Change Management
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Supervisor override, order recall, cancellation reason tracking, and state synchronization workbench
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => (onAction ? onAction('backtoList') : (window.location.hash = '#/app/labdashboard'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-th-large" /> Lab Dashboard
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-files-o" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Orders</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{stats.total}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-calendar-check-o" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Routine Priority</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{stats.routine}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-bolt" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>STAT / Emergency</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{stats.statEmergency}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-ban" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Cancelled / Recalled</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>{stats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          marginBottom: '20px',
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Patient Name / UHID */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Patient Name / UHID
              </label>
              <input
                type="text"
                placeholder="e.g. John, MRN-101..."
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Order/Bill No */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Order# / Bill#
              </label>
              <input
                type="text"
                placeholder="e.g. ORD-109, BL-203..."
                value={billOrderNumber}
                onChange={(e) => setBillOrderNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Visit Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Visit Type
              </label>
              <select
                value={encounterTypeId}
                onChange={(e) => setEncounterTypeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
              >
                {encounterTypes.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.Description}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Status */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Order Status
              </label>
              <select
                value={orderStatusId}
                onChange={(e) => setOrderStatusId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
              >
                {orderStatuses.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.DisplayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa fa-search" /> Fetch
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
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
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                <th style={{ padding: '12px 16px', width: '50px' }}>#</th>
                <th style={{ padding: '12px 16px', width: '150px' }}>Order Date</th>
                <th style={{ padding: '12px 16px' }}>Order# / Bill#</th>
                <th style={{ padding: '12px 16px' }}>Patient Details</th>
                <th style={{ padding: '12px 16px' }}>Visit Type</th>
                <th style={{ padding: '12px 16px' }}>Priority</th>
                <th style={{ padding: '12px 16px', width: '140px' }}>Order Status</th>
                <th style={{ padding: '12px 16px', width: '100px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '18px' }} />
                    Loading orders...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '32px', marginBottom: '8px' }}>
                      <i className="fa fa-folder-open-o" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                      No Diagnostic Orders Found
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                      Try selecting a 3-day date range or clearing your status filter.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const patient = item.Patient;
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
                      <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 500 }}>
                        {rowNumber}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <div style={{ fontWeight: 600 }}>
                          {item.OrderRequestDate
                            ? new Date(item.OrderRequestDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </div>
                        {item.OrderRequestDate && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(item.OrderRequestDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.OrderNumber}</div>
                        {item.BillNumber && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Bill: {item.BillNumber}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {patient ? (
                          <div>
                            <span
                              onClick={() => onAction && onAction('patientinfo', item)}
                              style={{
                                fontWeight: 600,
                                color: '#0284c7',
                                cursor: 'pointer',
                                textDecoration: 'none',
                              }}
                            >
                              {patient.Title?.Description ? `${patient.Title.Description} ` : ''}
                              {patient.FirstName} {patient.LastName || ''}
                            </span>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              UHID: {patient.MRN || item.MRN || '—'} &bull; {patient.Age ? `${patient.Age}y` : ''} {patient.Gender?.Description || ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {item.EncounterType?.Description || 'OPD'}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {getPriorityBadge(item.OrderPriorityId, item.OrderPriority?.Description)}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(item)}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          title="Change Order Status / Manage State"
                          onClick={() => (onAction ? onAction('edit', item) : alert(`Change status for order ${item.Id}`))}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#0284c7',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                        >
                          <i className="fa fa-pencil" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > pageSize && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
