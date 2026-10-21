import React, { useState, useEffect, useMemo } from 'react';
import { callBackendApi } from '../services/apiService';

export interface OrderItem {
  Id: number;
  TestName?: string;
  TestCode?: string;
  ClinicalData?: string;
  PatientBillStatusId?: number;
  PatientBillStatus?: {
    Description?: string;
  };
  OrderStatusId?: number;
  OrderStatus?: {
    DisplayName?: string;
    Description?: string;
  };
  WorkOrderDID?: string;
  AcceptedDate?: string;
  IsAllOrderSelected?: boolean;
  IsSelected?: boolean;
  IsReadOnly?: boolean;
  Testmaster?: {
    IsProfile?: boolean;
    IsCulture?: boolean;
    IsCytology?: boolean;
  };
}

export interface OrderStatusChangeFormScreenProps {
  reactProps?: {
    orderid?: number;
    pid?: number;
    item?: any;
    orderList?: OrderItem[];
    lookup?: {
      OrderStatus?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const OrderStatusChangeFormScreen: React.FC<OrderStatusChangeFormScreenProps> = ({
  reactProps,
  onAction,
  onClose,
}) => {
  const [orderList, setOrderList] = useState<OrderItem[]>(reactProps?.orderList || []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bulkStatusId, setBulkStatusId] = useState<number | ''>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (reactProps?.orderList) {
      setOrderList(reactProps.orderList);
    }
  }, [reactProps?.orderList]);

  const orderStatuses = reactProps?.lookup?.OrderStatus || [
    { Id: 1, Text: 'Ordered / Pending' },
    { Id: 2, Text: 'Cancelled' },
    { Id: 3, Text: 'Sample Collected' },
    { Id: 4, Text: 'Sample Received' },
    { Id: 10, Text: 'Accepted / Attended' },
    { Id: 5, Text: 'In Progress' },
    { Id: 6, Text: 'Result Entered' },
    { Id: 7, Text: 'Authorized / Approved' },
  ];

  const handleToggleSelectAll = (checked: boolean) => {
    setOrderList((prev) =>
      prev.map((item) => (item.IsReadOnly ? item : { ...item, IsSelected: checked, IsAllOrderSelected: checked }))
    );
  };

  const handleToggleItem = (id: number, checked: boolean) => {
    setOrderList((prev) =>
      prev.map((item) => (item.Id === id ? { ...item, IsSelected: checked, IsAllOrderSelected: checked } : item))
    );
  };

  const handleStatusChange = (id: number, statusId: number) => {
    setOrderList((prev) =>
      prev.map((item) => (item.Id === id ? { ...item, OrderStatusId: statusId } : item))
    );
  };

  const handleApplyBulkStatus = () => {
    if (!bulkStatusId) return;
    setOrderList((prev) =>
      prev.map((item) =>
        item.IsSelected && !item.IsReadOnly ? { ...item, OrderStatusId: Number(bulkStatusId) } : item
      )
    );
  };

  const selectedCount = useMemo(() => orderList.filter((it) => it.IsSelected).length, [orderList]);
  const selectableCount = useMemo(() => orderList.filter((it) => !it.IsReadOnly).length, [orderList]);
  const isAllSelected = selectableCount > 0 && selectedCount === selectableCount;

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orderList;
    const q = searchTerm.toLowerCase();
    return orderList.filter(
      (it) =>
        it.TestName?.toLowerCase().includes(q) ||
        it.TestCode?.toLowerCase().includes(q) ||
        it.ClinicalData?.toLowerCase().includes(q) ||
        it.WorkOrderDID?.toLowerCase().includes(q)
    );
  }, [orderList, searchTerm]);

  const handleSave = async () => {
    if (onAction) {
      onAction('save', { orderList });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Header: reactProps?.item || {},
        Details: orderList,
      };
      await callBackendApi('emr/PatientOrderDetail/UpdatePatientOrderDetailStatus', 'POST', { Data: payload });
      if (onClose) onClose();
    } catch (err) {
      console.error('Error updating order statuses:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSelected = () => {
    const selected = orderList.filter((it) => it.IsSelected);
    if (selected.length === 0) {
      alert('Please select at least one order to cancel.');
      return;
    }
    if (onAction) {
      onAction('cancel', { selectedList: selected });
      return;
    }
    alert(`Cancelling ${selected.length} orders...`);
  };

  const handleBack = () => {
    if (onAction) {
      onAction('back');
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-arrow-left" /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Diagnostic Order Status Change
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                Order #{reactProps?.orderid || '—'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Modify lifecycle status of individual ordered investigations, profiles, and outsource tests
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
            {saving ? 'Saving...' : 'Save Status Changes'}
          </button>
        </div>
      </div>

      {/* Bulk Control & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <i
              className="fa fa-search"
              style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8', fontSize: '12px' }}
            />
            <input
              type="text"
              placeholder="Search test name, code, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 30px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Selected: <b style={{ color: '#0f172a' }}>{selectedCount}</b> of {orderList.length} items
          </span>
        </div>

        {/* Batch Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Batch Status:</span>
          <select
            value={bulkStatusId}
            onChange={(e) => setBulkStatusId(e.target.value ? Number(e.target.value) : '')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">Choose Status...</option>
            {orderStatuses.map((st) => (
              <option key={st.Id} value={st.Id}>
                {st.Text}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApplyBulkStatus}
            disabled={!bulkStatusId || selectedCount === 0}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: bulkStatusId && selectedCount > 0 ? '#f0fdf4' : '#f8fafc',
              color: bulkStatusId && selectedCount > 0 ? '#15803d' : '#94a3b8',
              fontWeight: 600,
              fontSize: '12px',
              cursor: bulkStatusId && selectedCount > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Apply to Selected
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '10px 16px', width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleToggleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px' }}>Investigation / Test</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px' }}>Clinical Indication</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px', width: '90px' }}>Profile?</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px', width: '130px' }}>Bill Status</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px', width: '200px' }}>Order Status</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px', width: '140px' }}>Work Order DID</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: '12px', width: '130px' }}>Accepted On</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  No investigation orders found for this requisition.
                </td>
              </tr>
            ) : (
              filteredOrders.map((row) => {
                const isReadOnly = row.IsReadOnly || row.OrderStatusId === 10 || row.OrderStatusId === 2;
                return (
                  <tr
                    key={row.Id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: row.IsSelected ? '#f0f9ff' : '#ffffff',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!row.IsSelected}
                        disabled={isReadOnly}
                        onChange={(e) => handleToggleItem(row.Id, e.target.checked)}
                        style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                      />
                    </td>

                    {/* Test Name & Code */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.TestName}</div>
                      {row.TestCode && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Code: <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{row.TestCode}</span>
                        </div>
                      )}
                    </td>

                    {/* Clinical Data */}
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
                      {row.ClinicalData || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>

                    {/* Profile */}
                    <td style={{ padding: '12px 16px' }}>
                      {row.Testmaster?.IsProfile ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f3e8ff',
                            color: '#7e22ce',
                          }}
                        >
                          Profile
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Single</span>
                      )}
                    </td>

                    {/* Bill Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor:
                            row.PatientBillStatus?.Description?.toLowerCase().includes('paid')
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            row.PatientBillStatus?.Description?.toLowerCase().includes('paid')
                              ? '#15803d'
                              : '#b45309',
                        }}
                      >
                        {row.PatientBillStatus?.Description || 'Settled'}
                      </span>
                    </td>

                    {/* Order Status Select */}
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={row.OrderStatusId || 1}
                        disabled={isReadOnly}
                        onChange={(e) => handleStatusChange(row.Id, parseInt(e.target.value, 10))}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          backgroundColor: isReadOnly ? '#f1f5f9' : '#ffffff',
                          cursor: isReadOnly ? 'not-allowed' : 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {orderStatuses.map((st) => (
                          <option key={st.Id} value={st.Id}>
                            {st.Text}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Work Order DID */}
                    <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                      {row.WorkOrderDID ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {row.WorkOrderDID}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>

                    {/* Accepted Date */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                      {row.AcceptedDate ? (
                        new Date(row.AcceptedDate).toLocaleDateString('en-GB')
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <i className="fa fa-angle-left" /> Back to Order List
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCancelSelected}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-ban" /> Cancel Selected Orders
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
            {saving ? 'Saving...' : 'Save & Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};
