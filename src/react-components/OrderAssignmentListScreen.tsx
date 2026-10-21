import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { sessionHelper } from '../services/sessionHelper';
import { callBackendApi } from '../services/apiService';

export interface OrderAssignmentEntity {
  Id: number;
  Ordernumber?: string;
  OrderNumber?: string;
  Orderrequestdate?: string;
  OrderRequestDate?: string;
  DoctorName?: string;
  Doctor?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string; ColorCode?: string };
  };
  PriorityStatus?: {
    DisplayName?: string;
    Description?: string;
    ColorCode?: string;
  };
  Priority?: string;
  OrderStatus?: {
    DisplayName?: string;
    Description?: string;
  };
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    DOB?: string;
    Gender?: { Description?: string };
    Title?: { Description?: string };
  };
  TechnicianName?: string;
  AssignedUser?: string;
  Remarks?: string;
}

export interface OrderAssignmentListScreenProps {
  reactProps?: {
    items?: OrderAssignmentEntity[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    departmentId?: number | string;
    currentfilter?: {
      OrderReqDate?: string | Date;
      ordernr?: string;
      mrn?: string;
      Orderstatuse?: number | string;
      status?: number;
    };
    lookup?: {
      OrderStatus?: Array<{ Id: number | string; Text?: string; DisplayName?: string }>;
      Priority?: Array<{ Id: number | string; Text?: string; DisplayName?: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  departmentId?: number | string;
}

export const OrderAssignmentListScreen: React.FC<OrderAssignmentListScreenProps> = ({
  reactProps,
  onAction,
  departmentId: propDepartmentId,
}) => {
  const currentDeptId = propDepartmentId || reactProps?.departmentId || 1;
  const isLab = String(currentDeptId) === '1';
  const deptTitle = isLab ? 'Laboratory Order Assignment' : 'Diagnostic Order Assignment';

  const [items, setItems] = useState<OrderAssignmentEntity[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [reqDate, setReqDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [orderNr, setOrderNr] = useState<string>(reactProps?.currentfilter?.ordernr || '');
  const [mrn, setMrn] = useState<string>(reactProps?.currentfilter?.mrn || '');
  const [orderStatus, setOrderStatus] = useState<string>(String(reactProps?.currentfilter?.Orderstatuse || '-1'));
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Lookups
  const [statusOptions, setStatusOptions] = useState<Array<{ Id: number | string; Text: string }>>(
    (reactProps?.lookup?.OrderStatus as any) || [
      { Id: -1, Text: 'All Statuses' },
      { Id: 1, Text: 'Pending Assignment' },
      { Id: 2, Text: 'Assigned' },
      { Id: 3, Text: 'In Progress' },
      { Id: 4, Text: 'Completed' },
    ]
  );

  // Quick stat calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const pending = items.filter(
      (i) =>
        i.OrderStatus?.DisplayName?.toLowerCase().includes('pending') ||
        !i.TechnicianName
    ).length;
    const assigned = items.filter(
      (i) =>
        i.OrderStatus?.DisplayName?.toLowerCase().includes('assign') ||
        Boolean(i.TechnicianName)
    ).length;
    const urgent = items.filter(
      (i) =>
        i.PriorityStatus?.DisplayName?.toLowerCase().includes('stat') ||
        i.PriorityStatus?.DisplayName?.toLowerCase().includes('urgent')
    ).length;

    return { total, pending, assigned, urgent };
  }, [items, totalItems]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = reqDate ? `${reqDate} 00:00:00` : '';
      const toDate = reqDate ? `${reqDate} 23:59:59` : '';

      const inputData = {
        Params: [
          { Key: 1, Value: currentDeptId },
          { Key: 2, Value: [fromDate, toDate] },
          { Key: 3, Value: orderNr || null },
          { Key: 4, Value: mrn || null },
          { Key: 5, Value: orderStatus !== '-1' ? orderStatus : null },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('lis/patientorders/GetPatientOrders', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('Could not fetch via API, falling back to props:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [currentDeptId, reqDate, orderNr, mrn, orderStatus, pageSize, currentPage, reactProps]);

  useEffect(() => {
    if (reactProps?.items && reactProps.items.length > 0) {
      setItems(reactProps.items);
      setTotalItems(reactProps.totalItems || reactProps.items.length);
    } else {
      fetchData();
    }
  }, [reactProps, fetchData]);

  const handleActionClick = (actionName: string, entity: OrderAssignmentEntity) => {
    if (onAction) {
      onAction(actionName, entity);
    } else if ((window as any).angular) {
      const $scope = (window as any).angular.element(document.querySelector('[ng-controller], [ui-view]'))?.scope();
      if ($scope && typeof $scope.handleEvents === 'function') {
        $scope.handleEvents(actionName, entity);
      }
    }
  };

  // Filtered view
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (priorityFilter !== 'ALL') {
      result = result.filter((i) =>
        (i.PriorityStatus?.DisplayName || '').toUpperCase().includes(priorityFilter)
      );
    }
    return result;
  }, [items, priorityFilter]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
            {deptTitle}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Assign, balance and monitor diagnostic tests across laboratory workstations and duty technologists
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => fetchData()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <i className="fa fa-sync" /> Refresh Worklist
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Worklist
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            {stats.total}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#c2410c', textTransform: 'uppercase' }}>
            Pending Assignment
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ea580c', marginTop: '6px' }}>
            {stats.pending}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>
            Assigned / In Progress
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {stats.assigned}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c', textTransform: 'uppercase' }}>
            STAT / Urgent Orders
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginTop: '6px' }}>
            {stats.urgent}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Request Date
          </label>
          <input
            type="date"
            value={reqDate}
            onChange={(e) => setReqDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Order #
          </label>
          <input
            type="text"
            placeholder="Search Order Number..."
            value={orderNr}
            onChange={(e) => setOrderNr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              width: '180px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Patient MRN / UHID
          </label>
          <input
            type="text"
            placeholder="Search MRN / Name..."
            value={mrn}
            onChange={(e) => setMrn(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              width: '180px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Status
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#fff',
              outline: 'none',
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text || (opt as any).DisplayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#fff',
              outline: 'none',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
            <option value="STAT">STAT</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => fetchData()}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-filter" /> Search
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Order #</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Request Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Patient Info</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Priority</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Order Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Assigned Tech / Pathologist</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <i className="fa fa-circle-notch fa-2x" />
                    </div>
                    <div style={{ marginTop: '10px' }}>Loading order assignments...</div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <i className="fa fa-clipboard-list fa-3x" style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#64748b' }}>
                      No orders found matching the filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isUrgent =
                    item.PriorityStatus?.DisplayName?.toLowerCase().includes('urgent') ||
                    item.PriorityStatus?.DisplayName?.toLowerCase().includes('stat');

                  const patientName = `${item.Patient?.Title?.Description || ''} ${item.Patient?.FirstName || ''} ${
                    item.Patient?.LastName || ''
                  }`.trim();

                  return (
                    <tr
                      key={item.Id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isUrgent ? '#fff1f2' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0284c7' }}>
                        {item.Ordernumber || item.OrderNumber || `#ORD-${item.Id}`}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {item.Orderrequestdate || item.OrderRequestDate
                          ? new Date(item.Orderrequestdate || item.OrderRequestDate || '').toLocaleString()
                          : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {patientName || 'Anonymous Patient'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          MRN: {item.Patient?.MRN || 'N/A'} | {item.Patient?.Gender?.Description || 'Unknown'} | Dr.{' '}
                          {item.DoctorName || item.Doctor?.LastName || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isUrgent ? '#ffe4e6' : '#e0f2fe',
                            color: isUrgent ? '#e11d48' : '#0369a1',
                          }}
                        >
                          {item.PriorityStatus?.DisplayName || (isUrgent ? 'STAT' : 'Normal')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                          }}
                        >
                          {item.OrderStatus?.DisplayName || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {item.TechnicianName || item.AssignedUser ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa fa-user-check" style={{ color: '#16a34a' }} />
                            <span style={{ fontWeight: 500 }}>{item.TechnicianName || item.AssignedUser}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            title="Assign / Order Detail"
                            onClick={() => handleActionClick('action', item)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #0284c7',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fa fa-user-tag" /> Assign
                          </button>
                          <button
                            title="Order Details"
                            onClick={() => handleActionClick('billing', item)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#fff',
                              color: '#475569',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fa fa-file-invoice" />
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
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {filteredItems.length} of {totalItems} items
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((totalItems || 1) / pageSize)}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchData();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAssignmentListScreen;
