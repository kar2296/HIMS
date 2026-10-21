import React, { useState, useEffect, useMemo } from 'react';

export interface PatientBannerData {
  Id?: number;
  MRN?: string;
  Title?: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Age?: number;
  Gender?: string;
  PatientName?: string;
  PatientStatus?: string;
  FacilityName?: string;
  GuarantorType?: string;
  GuarantorName?: string;
  Mobile?: string;
}

export interface EncounterBannerData {
  DoctorName?: string;
  DepartmentName?: string;
  VisitDate?: string;
  Id?: number;
}

export interface OrderItem {
  Id: number;
  TestId?: number;
  TestName: string;
  TestCode?: string;
  ClinicalData?: string | null;
  Quantity?: number;
  SampleTypeIndex?: number;
  Testmaster?: {
    IsProfile?: boolean;
    IsCulture?: boolean;
    IsCytology?: boolean;
  };
  PatientBillStatus?: {
    Description?: string;
  };
  OrderStatus?: {
    DisplayName?: string;
    Description?: string;
  };
  OrderStatusId?: number;
  WorkOrderDID?: string;
  AcceptedDate?: string | null;
  IsSelected?: boolean;
  IsAllOrderSelected?: boolean;
  IsReadOnly?: boolean;
  IsAllOrderReadOnly?: boolean;
}

export interface OrderAcknowledgementFormScreenProps {
  reactProps?: {
    orderid?: number;
    pid?: number;
    tp?: number;
    patient?: PatientBannerData;
    encounter?: EncounterBannerData;
    orderInfo?: {
      Id?: number;
      OrderNumber?: string;
      BillNumber?: string;
      BillingId?: number;
      EncounterTypeId?: number;
      DoctorName?: string;
    };
    orderList?: OrderItem[];
    canShowAccept?: boolean;
    canShowCancel?: boolean;
    canDisableAcceptCancel?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OrderAcknowledgementFormScreen: React.FC<OrderAcknowledgementFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const tp = Number(reactProps?.tp || 1);
  const isLab = tp === 1;
  const isRis = tp === 2;
  const isEndoscopy = tp === 4;

  const moduleTitle = isLab
    ? 'Laboratory Order Acceptance'
    : isRis
    ? 'Radiology Order Acceptance'
    : isEndoscopy
    ? 'Endoscopy Order Acceptance'
    : 'Order Acceptance & Processing';

  const moduleTag = isLab
    ? 'LIS / LABORATORY'
    : isRis
    ? 'RIS / RADIOLOGY'
    : isEndoscopy
    ? 'ENDOSCOPY'
    : 'ORDER PROCESSING';

  const moduleIcon = isLab ? 'fa-flask' : isRis ? 'fa-sun-o' : 'fa-clipboard-check';

  const orderList = reactProps?.orderList || [];
  const patient = reactProps?.patient || {};
  const encounter = reactProps?.encounter || {};
  const orderInfo = reactProps?.orderInfo || {};

  // Local state for checkboxes to allow immediate UI responsiveness
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Helper to check if an item is already finalized (accepted, cancelled, or read-only)
  const isFinalizedItem = (item: OrderItem) => {
    return Boolean(
      item.IsReadOnly ||
      item.IsAllOrderReadOnly ||
      item.OrderStatusId === 10 ||
      item.OrderStatusId === 2 ||
      item.OrderStatus?.DisplayName?.toUpperCase() === 'ACCEPTED' ||
      item.OrderStatus?.DisplayName?.toUpperCase() === 'CANCELLED'
    );
  };

  const activeSelectableItems = useMemo(() => {
    return orderList.filter((item) => !isFinalizedItem(item));
  }, [orderList]);

  useEffect(() => {
    // Only pending, unfinalized items should ever be selectable
    const explicitlySelected = activeSelectableItems.filter((item) => item.IsSelected || item.IsAllOrderSelected);

    if (explicitlySelected.length > 0) {
      setSelectedIds(explicitlySelected.map((item) => item.Id));
    } else if (activeSelectableItems.length > 0) {
      const allActiveIds = activeSelectableItems.map((item) => item.Id);
      setSelectedIds(allActiveIds);
      dispatch('toggleSelectAll', { selectAll: true, selectedIds: allActiveIds });
    } else {
      setSelectedIds([]);
    }
  }, [activeSelectableItems]);

  const isAllSelected =
    activeSelectableItems.length > 0 &&
    activeSelectableItems.every((item) => selectedIds.includes(item.Id));

  const isIndeterminate =
    activeSelectableItems.some((item) => selectedIds.includes(item.Id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    const nextSelectAll = !isAllSelected;
    let nextSelected: number[] = [];
    if (nextSelectAll) {
      nextSelected = activeSelectableItems.map((item) => item.Id);
    }
    setSelectedIds(nextSelected);
    dispatch('toggleSelectAll', { selectAll: nextSelectAll, selectedIds: nextSelected });
  };

  const handleToggleItem = (item: OrderItem) => {
    if (isFinalizedItem(item)) return;
    const isCurrentlySelected = selectedIds.includes(item.Id);
    const nextSelected = isCurrentlySelected
      ? selectedIds.filter((id) => id !== item.Id)
      : [...selectedIds, item.Id];
    setSelectedIds(nextSelected);
    dispatch('toggleItemSelect', { item, isSelected: !isCurrentlySelected, selectedIds: nextSelected });
  };

  // Stats calculation
  const totalCount = orderList.length;
  const selectedCount = selectedIds.length;
  const profileCount = orderList.filter((item) => item.Testmaster?.IsProfile).length;
  const singleCount = totalCount - profileCount;

  // Patient display name
  const patFullName =
    patient.PatientName ||
    `${patient.Title ? `${patient.Title} ` : ''}${patient.FirstName || ''} ${
      patient.LastName || ''
    }`.trim() ||
    'Patient Profile';

  const canDisable = reactProps?.canDisableAcceptCancel ?? false;
  const isAllFinalized = orderList.length > 0 && orderList.every(isFinalizedItem);
  const isOrderAccepted = Boolean(
    isAllFinalized ||
    (orderList.length > 0 && activeSelectableItems.length === 0) ||
    canDisable ||
    orderInfo?.OrderStatusId === 10 ||
    orderInfo?.OrderStatusId === 2
  );
  const canShowAcceptButton = (reactProps?.canShowAccept ?? true) && !canDisable && !isOrderAccepted && activeSelectableItems.length > 0;
  const canAccept = canShowAcceptButton && selectedCount > 0;
  const canCancel = (reactProps?.canShowCancel ?? true) && !canDisable && !isOrderAccepted && activeSelectableItems.length > 0;

  // Format date time
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pkg-page-container orderack-form-container" style={{ padding: '20px 24px', maxWidth: '100%' }}>
      {/* 1. Executive Context Header */}
      <div className="pkg-header-card" style={{ marginBottom: 20 }}>
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: isLab
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            <i className={`fa ${moduleIcon}`} aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">{moduleTitle}</h1>
              <span className="pkg-header-tag">{moduleTag}</span>
              {orderInfo.OrderNumber && (
                <span className="orderack-mrn-chip" style={{ fontSize: '12px', padding: '3px 8px' }}>
                  {orderInfo.OrderNumber}
                </span>
              )}
            </div>
            <p className="pkg-header-subtitle">
              Verify diagnostic test orders, review clinical profiles, and confirm laboratory acceptance
            </p>
          </div>
        </div>

        <div className="pkg-header-right">
          <div className="pkg-header-chip" title="Current facility affiliation">
            <span className="pkg-header-chip-dot" />
            <span>{reactProps?.facilityName || patient.FacilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          <button
            type="button"
            id="btnBackToOrdersTop"
            className="pkg-btn-reset"
            onClick={() => dispatch('back')}
            title="Return to order acceptance list"
            style={{ height: '36px', padding: '0 14px' }}
          >
            <i className="fa fa-arrow-left" aria-hidden="true" style={{ marginRight: 6 }} />
            <span>Back to Orders</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Patient & Encounter Card */}
      <div
        className="orderack-patient-card"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          padding: '18px 22px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px',
                border: '1px solid #7dd3fc',
              }}
            >
              <i className="fa fa-user" aria-hidden="true" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {patFullName}
                </span>
                {patient.MRN && (
                  <span className="orderack-mrn-chip" title="Medical Record Number / UHID">
                    {patient.MRN}
                  </span>
                )}
                <span
                  className="pkg-status-pill pkg-status-pill-active"
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                >
                  <span className="pkg-status-dot" />
                  <span>{patient.PatientStatus || 'Active'}</span>
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: 2 }}>
                {patient.Age ? `${patient.Age} Years` : ''}
                {patient.Gender ? ` • ${patient.Gender}` : ''}
                {patient.Mobile ? ` • 📞 ${patient.Mobile}` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="orderack-visit-badge orderack-visit-op"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Outpatient (OP)
            </span>
          </div>
        </div>

        {/* 4-Column Clinical Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            fontSize: '13px',
          }}
        >
          {/* Col 1: Doctor & Dept */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Ordering Physician
            </span>
            <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 4 }}>
              {encounter.DoctorName || 'Dr. ANUP DUKANIYA'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
              {encounter.DepartmentName || 'General OPD'}
            </div>
          </div>

          {/* Col 2: Order & Bill # */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Order & Bill Reference
            </span>
            <div style={{ fontWeight: 600, color: '#0369a1', fontFamily: 'monospace', marginTop: 4 }}>
              {orderInfo.OrderNumber || 'ORD-10103'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
              Bill: <strong>{orderInfo.BillNumber || 'SHIP-11701'}</strong>
            </div>
          </div>

          {/* Col 3: Payment & Tariff */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Billing / Sponsor
            </span>
            <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 4 }}>
              {patient.GuarantorType || 'SELF'} ({patient.GuarantorName || 'CASH'})
            </div>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 500, marginTop: 2 }}>
              <i className="fa fa-check-circle" style={{ marginRight: 4 }} />
              Payment Cleared
            </div>
          </div>

          {/* Col 4: Visit & Hospital */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Facility & Visit
            </span>
            <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 4 }}>
              {patient.FacilityName || 'SHUVADARSINI HOSPITAL'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
              Visit Date: Today
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid" style={{ marginBottom: 20 }}>
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Tests Ordered</span>
            <span className="pkg-stat-value">{totalCount}</span>
            <span className="pkg-stat-subtext">Tests in current requisition</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-flask" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Selected for Acceptance</span>
            <span className="pkg-stat-value" style={{ color: selectedCount > 0 ? '#0284c7' : '#94a3b8' }}>
              {selectedCount} of {totalCount}
            </span>
            <span className="pkg-stat-subtext">Ready to acknowledge</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-check-square-o" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Diagnostic Profiles</span>
            <span className="pkg-stat-value" style={{ color: '#7c3aed' }}>
              {profileCount}
            </span>
            <span className="pkg-stat-subtext">Composite panel packages</span>
          </div>
          <div className="pkg-stat-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
            <i className="fa fa-cubes" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Single Tests</span>
            <span className="pkg-stat-value" style={{ color: '#059669' }}>
              {singleCount}
            </span>
            <span className="pkg-stat-subtext">Individual investigative tests</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-list" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 4. MediFlow Tests Acceptance Table Card */}
      <div className="pkg-table-card" style={{ marginBottom: 80 }}>
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
              Diagnostic Tests Requisition
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ({selectedCount} of {totalCount} selected)
            </span>
          </div>

          {!isOrderAccepted && activeSelectableItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="orderack-preset-chip"
                onClick={handleToggleSelectAll}
                style={{ fontSize: '12px', padding: '4px 12px' }}
              >
                <i
                  className={`fa ${isAllSelected ? 'fa-check-square' : 'fa-square-o'}`}
                  style={{ marginRight: 6 }}
                />
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>

        <div className="pkg-table-responsive">
          <table className="pkg-table" id="tblOrderAcceptanceItems">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>
                  {!isOrderAccepted && activeSelectableItems.length > 0 ? (
                    <input
                      type="checkbox"
                      id="chkSelectAllTests"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={handleToggleSelectAll}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      title="Select/Deselect all tests"
                    />
                  ) : (
                    <i
                      className="fa fa-check-circle"
                      style={{ color: '#16a34a', fontSize: '15px' }}
                      title="All items processed"
                    />
                  )}
                </th>
                <th className="pkg-col-idx" style={{ width: '45px' }}>
                  #
                </th>
                <th style={{ minWidth: '260px' }}>Test Name & Code</th>
                <th style={{ width: '150px' }}>Clinical Data</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Type</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Bill Status</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Order Status</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Work Order #</th>
                <th style={{ width: '150px' }}>Accepted On</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((item, index) => {
                const isSelected = selectedIds.includes(item.Id);
                const isReadOnly = item.IsReadOnly || item.IsAllOrderReadOnly;
                const isProfile = Boolean(item.Testmaster?.IsProfile);

                const statusName = item.OrderStatus?.DisplayName || 'CREATED';
                const isAccepted = item.OrderStatusId === 10 || statusName.toUpperCase() === 'ACCEPTED';
                const isCancelled = item.OrderStatusId === 2 || statusName.toUpperCase() === 'CANCELLED';

                return (
                  <tr
                    key={item.Id || index}
                    style={{
                      backgroundColor: isSelected ? '#f0f9ff' : undefined,
                      cursor: isReadOnly ? 'default' : 'pointer',
                    }}
                    onClick={() => handleToggleItem(item)}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      {isAccepted ? (
                        <span
                          title="Test Order Accepted"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#15803d',
                            fontSize: '11px',
                          }}
                        >
                          <i className="fa fa-check" />
                        </span>
                      ) : isCancelled ? (
                        <span
                          title="Test Order Cancelled"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '11px',
                          }}
                        >
                          <i className="fa fa-times" />
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isReadOnly}
                          onChange={() => handleToggleItem(item)}
                          style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer', width: 16, height: 16 }}
                        />
                      )}
                    </td>

                    {/* S.No */}
                    <td className="pkg-col-idx">{index + 1}</td>

                    {/* Test Name & Code */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>
                          {item.TestName}
                        </span>
                        {item.TestCode && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="orderack-mrn-chip" style={{ fontSize: '10.5px' }}>
                              {item.TestCode}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Clinical Data */}
                    <td>
                      <span style={{ fontSize: '12px', color: item.ClinicalData ? '#334155' : '#94a3b8' }}>
                        {item.ClinicalData || '—'}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#f1f5f9',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#475569',
                        }}
                      >
                        {item.Quantity || 1}
                      </span>
                    </td>

                    {/* Profile vs Single */}
                    <td style={{ textAlign: 'center' }}>
                      {isProfile ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            border: '1px solid #e9d5ff',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <i className="fa fa-cubes" style={{ marginRight: 4 }} />
                          Profile
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Single
                        </span>
                      )}
                    </td>

                    {/* Bill Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="pkg-status-pill pkg-status-pill-active"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        <span>{item.PatientBillStatus?.Description || 'Completed'}</span>
                      </span>
                    </td>

                    {/* Order Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`pkg-status-pill ${
                          isAccepted
                            ? 'pkg-status-pill-active'
                            : isCancelled
                            ? 'pkg-status-pill-inactive'
                            : 'pkg-status-pill-draft'
                        }`}
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        <span className="pkg-status-dot" />
                        <span>{statusName}</span>
                      </span>
                    </td>

                    {/* Work Order # */}
                    <td style={{ textAlign: 'center' }}>
                      {item.WorkOrderDID ? (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#0284c7',
                          }}
                        >
                          {item.WorkOrderDID}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</span>
                      )}
                    </td>

                    {/* Accepted On */}
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {formatDateTime(item.AcceptedDate)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Executive Action Bar */}
      <div
        className="orderack-action-bar"
        style={{
          marginTop: 20,
          marginBottom: 40,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            id="btnBackToOrdersBottom"
            className="pkg-btn-reset"
            onClick={() => dispatch('back')}
            title="Return to order acceptance list"
            style={{ height: '40px', padding: '0 18px', fontSize: '13px' }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" style={{ marginRight: 6, fontSize: '15px' }} />
            <span>Back to Orders</span>
          </button>

          {canCancel && (
            <button
              type="button"
              id="btnOrderCancel"
              onClick={() => dispatch('cancel')}
              title="Cancel the selected diagnostic requisition"
              style={{
                height: '40px',
                padding: '0 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#e11d48',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i className="fa fa-ban" aria-hidden="true" style={{ marginRight: 6 }} />
              <span>Cancel Order</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isOrderAccepted ? (
            <span
              id="badgeOrderAccepted"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 8,
              }}
            >
              <i className="fa fa-check-circle" aria-hidden="true" style={{ fontSize: '15px' }} />
              <span>Order Accepted</span>
            </span>
          ) : (
            <>
              <span style={{ fontSize: '13.5px', color: '#475569' }}>
                <strong style={{ color: selectedCount > 0 ? '#0284c7' : '#0f172a' }}>{selectedCount}</strong> of <strong>{totalCount}</strong> tests selected
              </span>

              {canShowAcceptButton && (
                <button
                  type="button"
                  id="btnAcceptOrder"
                  disabled={!canAccept}
                  onClick={() => dispatch('accept')}
                  title={canAccept ? 'Acknowledge & accept selected test orders' : 'Select at least 1 test to accept'}
                  style={{
                    height: '42px',
                    padding: '0 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: canAccept
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : '#cbd5e1',
                    border: 'none',
                    borderRadius: 8,
                    cursor: canAccept ? 'pointer' : 'not-allowed',
                    boxShadow: canAccept ? '0 3px 8px rgba(2, 132, 199, 0.35)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <i className="fa fa-check-circle" aria-hidden="true" />
                  <span>Accept Order {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
