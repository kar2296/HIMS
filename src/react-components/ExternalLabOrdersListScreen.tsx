import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface ExternalLabOrderItem {
  Id: number;
  WorkOrderdid?: string;
  WorkOrderId?: number;
  OrderNumber?: string;
  Orderid?: number;
  PatientId?: number;
  EncounterId?: number;
  PatientOrder?: {
    Id?: number;
    OrderNumber?: string;
    BillNumber?: string;
    OrderRequestDate?: string;
  };
  OrderPriority?: {
    Id?: number;
    Description?: string;
  };
  OrderPriorityId?: number;
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Age?: number;
    Gender?: { Description?: string };
    Title?: { Description?: string };
  };
  WorkOrderStatus?: {
    Id?: number;
    DisplayName?: string;
    Description?: string;
  };
  WorkOrderStatusId?: number;
  ExternalProvider?: {
    Id?: number;
    ProviderName?: string;
  };
  ExternalProviderId?: number;
  Doctor?: {
    FirstName?: string;
    LastName?: string;
  };
}

export interface ExternalLabOrdersListScreenProps {
  reactProps?: {
    items?: ExternalLabOrderItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      PatWoNum?: string;
      OrderBillNo?: string;
      Ordereddate?: string | Date;
      WorkOrderStatusId?: number;
      ExternalProviderId?: number;
    };
    lookup?: {
      WorkOrderStatus?: Array<{ Id: number | string; Text: string }>;
      ExternalProvider?: Array<{ Id: number | string; Text: string }>;
      EncounterType?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ExternalLabOrdersListScreen: React.FC<ExternalLabOrdersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const [items, setItems] = useState<ExternalLabOrderItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [orderDate, setOrderDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [patWoNum, setPatWoNum] = useState<string>(reactProps?.currentfilter?.PatWoNum || '');
  const [orderBillNo, setOrderBillNo] = useState<string>(reactProps?.currentfilter?.OrderBillNo || '');
  const [statusId, setStatusId] = useState<string>(
    String(reactProps?.currentfilter?.WorkOrderStatusId !== undefined ? reactProps.currentfilter.WorkOrderStatusId : '1')
  );
  const [providerId, setProviderId] = useState<string>(
    String(reactProps?.currentfilter?.ExternalProviderId !== undefined ? reactProps.currentfilter.ExternalProviderId : '-1')
  );

  // Lookup options
  const workOrderStatuses = (reactProps?.lookup?.WorkOrderStatus as any) || [
    { Id: -1, Text: 'All Statuses' },
    { Id: 1, Text: 'Pending Dispatch / Manifest' },
    { Id: 2, Text: 'Dispatched to External Lab' },
    { Id: 3, Text: 'Received at Referral Lab' },
    { Id: 4, Text: 'Results Ready / Uploaded' },
    { Id: 5, Text: 'Finalized & Verified' },
  ];

  const externalProviders = (reactProps?.lookup?.ExternalProvider as any) || [
    { Id: -1, Text: 'All External Providers' },
    { Id: 1, Text: 'Metropolis Reference Labs' },
    { Id: 2, Text: 'SRL Diagnostics Network' },
    { Id: 3, Text: 'Dr. Lal PathLabs Outsource' },
    { Id: 4, Text: 'Quest Diagnostics Molecular' },
  ];

  // Quick stat cards calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const pendingDispatch = items.filter((i) => i.WorkOrderStatusId === 1 || !i.WorkOrderStatusId).length;
    const dispatched = items.filter((i) => i.WorkOrderStatusId === 2 || i.WorkOrderStatusId === 3).length;
    const resultsUploaded = items.filter((i) => i.WorkOrderStatusId === 4 || i.WorkOrderStatusId === 5).length;
    return {
      total,
      pendingDispatch,
      dispatched,
      resultsUploaded,
    };
  }, [items, totalItems]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fromFormatted = orderDate ? `${orderDate} 00:00:00` : null;
      const toFormatted = orderDate ? `${orderDate} 23:59:59` : null;

      const inputData = {
        Params: [
          { Key: 3, Value: statusId !== '-1' ? parseInt(statusId, 10) : null },
          { Key: 6, Value: -1 },
          { Key: 28, Value: orderBillNo.trim() || null },
          { Key: 32, Value: patWoNum.trim() || null },
          { Key: 18, Value: providerId !== '-1' ? parseInt(providerId, 10) : null },
          { Key: 11, Value: fromFormatted },
          { Key: 12, Value: toFormatted },
          { Key: 29, Value: 1 },
          { Key: 34, Value: true },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('lis/patientworkorder/GetPatientWorkorders', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('Failed to fetch external lab orders, using props or cache:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [orderDate, statusId, orderBillNo, patWoNum, providerId, pageSize, currentPage, reactProps?.items, reactProps?.totalItems]);

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
        PatWoNum: patWoNum,
        OrderBillNo: orderBillNo,
        WorkOrderStatusId: statusId !== '-1' ? parseInt(statusId, 10) : null,
        ExternalProviderId: providerId !== '-1' ? parseInt(providerId, 10) : null,
        Ordereddate: orderDate,
      });
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handleReset = () => {
    setPatWoNum('');
    setOrderBillNo('');
    setStatusId('1');
    setProviderId('-1');
    setOrderDate(new Date().toISOString().split('T')[0]);
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

  const getStatusBadge = (item: ExternalLabOrderItem) => {
    const statusText = item.WorkOrderStatus?.DisplayName || item.WorkOrderStatus?.Description || 'Pending Dispatch';
    const sId = item.WorkOrderStatusId || 1;

    let bg = '#eff6ff';
    let text = '#1d4ed8';
    let border = '#dbeafe';

    if (sId === 2 || sId === 3) {
      // In transit / with provider
      bg = '#fffbeb';
      text = '#b45309';
      border = '#fde68a';
    } else if (sId >= 4) {
      // Completed / Uploaded
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
              <i className="fa fa-paper-plane" />
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
                External Lab Orders Tracking & Manifest
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Specimen send-out manifests, outsourced test tracking, and referral laboratory document management
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
            <i className="fa fa-list-alt" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Send-Out Orders</div>
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
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-clock-o" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Pending Manifest Dispatch</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>{stats.pendingDispatch}</div>
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
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-truck" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>In Transit / At Ref Lab</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0284c7' }}>{stats.dispatched}</div>
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
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-file-text-o" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Results Received / Uploaded</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{stats.resultsUploaded}</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end',
            }}
          >
            {/* Date Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
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

            {/* Work Order / UHID search */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Patient Name / UHID / WO#
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe, MRN-401..."
                value={patWoNum}
                onChange={(e) => setPatWoNum(e.target.value)}
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
                placeholder="e.g. ORD-1092, BL-550..."
                value={orderBillNo}
                onChange={(e) => setOrderBillNo(e.target.value)}
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

            {/* Status Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Order Status
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
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
                {workOrderStatuses.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.DisplayName}
                  </option>
                ))}
              </select>
            </div>

            {/* External Provider Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                External Lab
              </label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
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
                {externalProviders.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.ProviderName}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
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
                <i className="fa fa-search" /> Filter
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
                <th style={{ padding: '12px 16px' }}>Work Order#</th>
                <th style={{ padding: '12px 16px' }}>Order# / Bill#</th>
                <th style={{ padding: '12px 16px' }}>Patient Details</th>
                <th style={{ padding: '12px 16px' }}>External Provider</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Status</th>
                <th style={{ padding: '12px 16px', width: '130px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '18px' }} />
                    Loading external send-out orders...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '32px', marginBottom: '8px' }}>
                      <i className="fa fa-folder-open-o" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                      No External Laboratory Orders Found
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                      Try selecting a different date range or status filter.
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

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#0369a1',
                            backgroundColor: '#f0f9ff',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            border: '1px solid #e0f2fe',
                            fontSize: '12px',
                          }}
                        >
                          {item.WorkOrderdid || `WO-${item.Id}`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.PatientOrder?.OrderNumber || item.OrderNumber || '—'}
                        </div>
                        {item.PatientOrder?.BillNumber && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Bill: {item.PatientOrder.BillNumber}
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
                              UHID: {patient.MRN || '—'} &bull; {patient.Age ? `${patient.Age}y` : ''} {patient.Gender?.Description || ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#334155' }}>
                          {item.ExternalProvider?.ProviderName || 'Reference Lab'}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(item)}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            title="Assign to External Provider / Edit Manifest"
                            onClick={() => (onAction ? onAction('assign', item) : alert(`Assign WO ${item.Id}`))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-pencil" />
                          </button>

                          <button
                            type="button"
                            title="Upload External Document / Report"
                            onClick={() => (onAction ? onAction('upload', item) : alert(`Upload document for ${item.Id}`))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #bbf7d0',
                              backgroundColor: '#f0fdf4',
                              color: '#15803d',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-upload" />
                          </button>

                          <button
                            type="button"
                            title="Print Sendout Slip"
                            onClick={() => (onAction ? onAction('print', item) : alert(`Print slip for ${item.Id}`))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#f8fafc',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
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
