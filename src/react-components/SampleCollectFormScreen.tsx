import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface SamplePatientData {
  Title?: string;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: number;
  Gender?: string;
  PatientName?: string;
}

export interface SampleEncounterData {
  ReferralName?: string;
  FacilityName?: string;
  WardName?: string;
  BedNo?: string;
  RoomNo?: string;
}

export interface SampleDetailItem {
  Id: number;
  WorkOrderSampleId?: number;
  OrderDetailId?: number;
  TestId?: number;
  TestName: string;
  TestCode?: string;
  SampleType?: string;
  SampleIdentifier?: string | null;
  SamplePriority?: string;
  SampleStatus?: string;
  SampleStatusId?: number;
  SampleDetailStatusId?: number;
  CollectedDate?: string | null;
  IsSelected?: boolean;
  IsReadOnly?: boolean;
  IsAllSampleTypeSelected?: boolean;
  IsAllSampleTypeReadOnly?: boolean;
  SampleVolume?: string;
  SubDepartmentName?: string;
  IsSeparateSampleId?: number;
}

export interface SampleGroupItem {
  SubDepartmentName?: string | null;
  details: SampleDetailItem[];
}

export interface SampleCollectFormScreenProps {
  reactProps?: {
    sampleId?: number;
    orderId?: number;
    patient?: SamplePatientData;
    encounter?: SampleEncounterData;
    orderInfo?: {
      Id?: number;
      OrderNumber?: string;
      BillNumber?: string;
      OrderDate?: string;
      SampleStatus?: string;
      SampleStatusId?: number;
      RejectionComments?: string;
      WorkOrderDID?: string;
    };
    details?: SampleDetailItem[];
    testList?: SampleGroupItem[];
    canShowSave?: boolean;
    canShowBarcodeButton?: boolean;
    canShowReject?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const SampleCollectFormScreen: React.FC<SampleCollectFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const patient = reactProps?.patient || {};
  const encounter = reactProps?.encounter || {};
  const orderInfo = reactProps?.orderInfo || {};
  const rawDetails = useMemo(() => reactProps?.details || [], [reactProps?.details]);

  // Track selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectionComments, setRejectionComments] = useState<string>(
    orderInfo.RejectionComments || ''
  );

  // Sync rejection comments from props if updated
  useEffect(() => {
    if (orderInfo.RejectionComments !== undefined) {
      setRejectionComments(orderInfo.RejectionComments || '');
    }
  }, [orderInfo.RejectionComments]);

  const isInitializedRef = useRef<number | null>(null);

  // Helper to determine if an individual item is already collected, approved/received, or finalized
  const isItemCollectedOrApproved = (item: SampleDetailItem): boolean => {
    if (item.IsReadOnly) return true;
    if (item.SampleDetailStatusId === 3 || item.SampleDetailStatusId === 5 || item.SampleDetailStatusId === 6) {
      return true;
    }
    const statusText = (item.SampleStatus || '').toLowerCase();
    if (statusText.includes('collected') || statusText.includes('approved') || statusText.includes('received') || statusText.includes('rejected')) {
      return true;
    }
    if (statusText.includes('pending') || item.SampleDetailStatusId === 1) {
      return false;
    }
    const hasCollectedDate = Boolean(item.CollectedDate) && (
      typeof item.CollectedDate === 'string'
        ? item.CollectedDate.trim().length > 0
        : typeof item.CollectedDate === 'object' && Object.keys(item.CollectedDate as any).length > 0
    );
    if (Boolean(item.SampleIdentifier) && hasCollectedDate) {
      return true;
    }
    if (orderInfo.SampleStatusId === 3 || (orderInfo.SampleStatus && orderInfo.SampleStatus.toLowerCase() === 'collected')) {
      return true;
    }
    return false;
  };

  // Categorize items into pending (collectible) vs already collected/approved
  const pendingItems = useMemo(() => {
    return rawDetails.filter((d) => !isItemCollectedOrApproved(d));
  }, [rawDetails, orderInfo.SampleStatusId, orderInfo.SampleStatus]);

  const collectedItems = useMemo(() => {
    return rawDetails.filter((d) => isItemCollectedOrApproved(d));
  }, [rawDetails, orderInfo.SampleStatusId, orderInfo.SampleStatus]);

  const totalCount = rawDetails.length;
  const pendingCount = pendingItems.length;
  const isFullyCollected = totalCount > 0 && pendingCount === 0;
  const isPartiallyCollected = pendingCount > 0 && collectedItems.length > 0;

  // Selected IDs should ONLY hold pending items chosen for collection
  const selectedPendingIds = useMemo(() => {
    const pendingSet = new Set(pendingItems.map((p) => p.Id));
    return selectedIds.filter((id) => pendingSet.has(id));
  }, [selectedIds, pendingItems]);

  const selectedPendingCount = selectedPendingIds.length;
  const allPendingSelected = pendingCount > 0 && selectedPendingCount === pendingCount;
  const somePendingSelected = selectedPendingCount > 0 && !allPendingSelected;

  // Sync initial selection: default pending items to selected for quick phlebotomy collection (once per order)
  useEffect(() => {
    const currentId = reactProps?.sampleId || (orderInfo as any)?.Id || (orderInfo as any)?.OrderNumber;

    if (rawDetails.length > 0 && isInitializedRef.current !== currentId) {
      isInitializedRef.current = currentId;
      if (pendingItems.length > 0) {
        const pendingIds = pendingItems.map((d) => d.Id);
        setSelectedIds(pendingIds);
        dispatch('toggleSelectAll', { selectAll: true });
      } else {
        setSelectedIds([]);
      }
    }
  }, [reactProps?.sampleId, (orderInfo as any)?.Id, (orderInfo as any)?.OrderNumber, rawDetails.length, pendingItems]);

  // Group details by Specimen type
  const specimenGroups = useMemo(() => {
    const map = new Map<string, SampleDetailItem[]>();
    for (const item of rawDetails) {
      const spec = item.SampleType || 'Standard Specimen';
      if (!map.has(spec)) {
        map.set(spec, []);
      }
      map.get(spec)!.push(item);
    }
    return Array.from(map.entries()).map(([specimen, items]) => ({
      specimen,
      volume: items[0]?.SampleVolume,
      items,
    }));
  }, [rawDetails]);

  // Format Helpers
  const formatDateTime = (dtStr?: string | null) => {
    if (!dtStr) return '—';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dtStr;
    }
  };

  // Selection handlers - only operate on pending items
  const handleToggleSelectAll = () => {
    if (isFullyCollected || pendingCount === 0) return;
    const nextState = !allPendingSelected;
    if (nextState) {
      const newIds = pendingItems.map((d) => d.Id);
      setSelectedIds(newIds);
      dispatch('toggleSelectAll', { selectAll: true });
    } else {
      setSelectedIds([]);
      dispatch('toggleSelectAll', { selectAll: false });
    }
  };

  const handleToggleGroup = (groupItems: SampleDetailItem[]) => {
    const groupPending = groupItems.filter((i) => !isItemCollectedOrApproved(i));
    if (groupPending.length === 0) return;

    const areAllInGroupSelected = groupPending.every((i) => selectedPendingIds.includes(i.Id));

    let updatedIds: number[];
    if (areAllInGroupSelected) {
      updatedIds = selectedPendingIds.filter((id) => !groupPending.some((i) => i.Id === id));
    } else {
      const toAdd = groupPending.map((i) => i.Id).filter((id) => !selectedPendingIds.includes(id));
      updatedIds = [...selectedPendingIds, ...toAdd];
    }

    setSelectedIds(updatedIds);
    dispatch('toggleSampleType', {
      sampleType: groupItems[0]?.SampleType,
      isSelected: !areAllInGroupSelected,
      items: groupPending,
    });
  };

  const handleToggleItem = (item: SampleDetailItem) => {
    if (isItemCollectedOrApproved(item)) return;
    const isCurrentlySelected = selectedPendingIds.includes(item.Id);
    let nextIds: number[];

    if (isCurrentlySelected) {
      nextIds = selectedPendingIds.filter((id) => id !== item.Id);
    } else {
      nextIds = [...selectedPendingIds, item.Id];
    }

    setSelectedIds(nextIds);
    dispatch('toggleItem', { item, isSelected: !isCurrentlySelected });
  };

  const handleRemarksChange = (val: string) => {
    setRejectionComments(val);
    dispatch('updateRejectionRemarks', { remarks: val });
  };

  // Status badge styling
  const getStatusBadge = (status?: string) => {
    const s = (status || 'Pending').toLowerCase();
    if (s.includes('collected') && !s.includes('partial')) {
      return {
        bg: '#ecfdf5',
        color: '#059669',
        border: '#a7f3d0',
        dot: '#10b981',
        text: 'Collected',
      };
    }
    if (s.includes('partial')) {
      return {
        bg: '#eff6ff',
        color: '#2563eb',
        border: '#bfdbfe',
        dot: '#3b82f6',
        text: 'Partially Collected',
      };
    }
    if (s.includes('reject')) {
      return {
        bg: '#fff1f2',
        color: '#e11d48',
        border: '#fecdd3',
        dot: '#f43f5e',
        text: 'Rejected',
      };
    }
    return {
      bg: '#fffbeb',
      color: '#d97706',
      border: '#fde68a',
      dot: '#f59e0b',
      text: 'Pending Collection',
    };
  };

  const statusMeta = getStatusBadge(orderInfo.SampleStatus);
  const patientInitials = (patient.FirstName?.[0] || 'P') + (patient.LastName?.[0] || '');

  // Only enable save button if there are pending items to collect and at least 1 is selected
  const canSave = reactProps?.canShowSave !== false && !isFullyCollected && selectedPendingCount > 0;
  const canReject = Boolean(reactProps?.canShowReject);

  // Barcodes should always remain available for printing in phlebotomy whenever sample or identifier exists
  const canShowBarcode =
    Boolean(reactProps?.canShowBarcodeButton) ||
    rawDetails.some((d) => Boolean(d.SampleIdentifier)) ||
    Boolean(orderInfo.Id) ||
    isFullyCollected ||
    isPartiallyCollected;

  return (
    <div
      className="mediflow-samplecollect-container"
      style={{
        padding: '24px 32px 60px 32px',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1e293b',
      }}
    >
      {/* 1. Executive Context Header */}
      <div
        className="pkg-header-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          background: '#ffffff',
          borderRadius: 12,
          padding: '12px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fa fa-flask" aria-hidden="true" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.2px',
                }}
              >
                Sample Collections & Phlebotomy
              </h2>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: '#e0f2fe',
                  color: '#0369a1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                LIS / PHLEBOTOMY
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Verify test specimens, collect diagnostic tubes, and manage lab phlebotomy tracking
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '11.5px',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span>{reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          <button
            type="button"
            id="btnBackToSampleListTop"
            className="pkg-btn-reset"
            onClick={() => dispatch('back')}
            title="Return to sample collections worklist"
            style={{
              height: '34px',
              padding: '0 14px',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 7,
              cursor: 'pointer',
              fontWeight: 500,
              color: '#334155',
            }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" style={{ fontSize: '14px' }} />
            <span>Back to List</span>
          </button>
        </div>
      </div>

      {/* 2. Patient Profile & Encounter Requisition Card */}
      <div
        className="orderack-patient-card"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '12px 18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          marginBottom: 10,
        }}
      >
        {/* Patient Identity Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottom: '1px solid #f1f5f9',
            marginBottom: 8,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13.5px',
                border: '1px solid #bfdbfe',
              }}
            >
              {patientInitials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {patient.Title ? `${patient.Title} ` : ''}
                  {patient.FirstName || ''} {patient.LastName || ''}
                  {!patient.FirstName && !patient.LastName ? patient.PatientName || 'Patient' : ''}
                </span>

                {patient.MRN && (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: 5,
                      background: '#f1f5f9',
                      color: '#0284c7',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {patient.MRN}
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  <span>Active</span>
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 1,
                  fontSize: '11.5px',
                  color: '#64748b',
                }}
              >
                {patient.Age && <span>{patient.Age} Y</span>}
                {patient.Gender && <span>• {patient.Gender}</span>}
                {encounter.WardName && (
                  <span>
                    • Location: <strong>{encounter.WardName}</strong>
                    {encounter.BedNo ? ` / Bed ${encounter.BedNo}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 16,
                background: statusMeta.bg,
                color: statusMeta.color,
                border: `1px solid ${statusMeta.border}`,
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: statusMeta.dot,
                }}
              />
              <span>{statusMeta.text}</span>
            </span>
          </div>
        </div>

        {/* 4-Card Clinical Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 8,
          }}
        >
          {/* Card 1: Requisition & Bill */}
          <div
            style={{
              padding: '7px 11px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Order & Bill Reference
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#0284c7',
                marginTop: 2,
                fontFamily: 'monospace',
              }}
            >
              {orderInfo.OrderNumber || '—'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Bill: <strong>{orderInfo.BillNumber || '—'}</strong>
            </div>
          </div>

          {/* Card 2: Order Date & Referred By */}
          <div
            style={{
              padding: '7px 11px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Order Date & Referred By
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 2,
              }}
            >
              {formatDateTime(orderInfo.OrderDate)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Referred: <strong>{encounter.ReferralName || 'SELF'}</strong>
            </div>
          </div>

          {/* Card 3: Patient Location & Bed */}
          <div
            style={{
              padding: '7px 11px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Ward & Bed Location
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <i className="fa fa-bed" style={{ color: '#0284c7', fontSize: '11px' }} />
              <span>{encounter.WardName || 'HDU'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Bed: <strong>{encounter.BedNo || '—'}</strong>
              {encounter.RoomNo ? ` / Rm: ${encounter.RoomNo}` : ''}
            </div>
          </div>

          {/* Card 4: Facility & Work Order */}
          <div
            style={{
              padding: '7px 11px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Facility & Work Order
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {encounter.FacilityName || reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              WO: <strong>{orderInfo.WorkOrderDID || 'Pending Generation'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Telemetry KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 8,
          marginBottom: 10,
        }}
      >
        {/* Metric 1: Total Tests to Collect */}
        <div
          className="pkg-stat-card"
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              className="pkg-stat-label"
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Total Tests to Collect
            </div>
            <div
              className="pkg-stat-value"
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: 1,
              }}
            >
              {totalCount}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 1 }}>
              Diagnostic tests in sample
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            <i className="fa fa-flask" aria-hidden="true" />
          </div>
        </div>

        {/* Metric 2: Selected for Collection */}
        <div
          className="pkg-stat-card"
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              className="pkg-stat-label"
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Selected for Collection
            </div>
            <div
              className="pkg-stat-value"
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: isFullyCollected ? '#059669' : selectedPendingCount > 0 ? '#0284c7' : '#0f172a',
                marginTop: 1,
              }}
            >
              {isFullyCollected
                ? 'All Collected'
                : `${selectedPendingCount} of ${pendingCount}`}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 1 }}>
              {isFullyCollected
                ? `${totalCount} of ${totalCount} tests collected`
                : `${collectedItems.length > 0 ? `${collectedItems.length} collected, ` : ''}${pendingCount} pending to collect`}
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: isFullyCollected ? '#ecfdf5' : selectedPendingCount > 0 ? '#e0f2fe' : '#f8fafc',
              color: isFullyCollected ? '#059669' : selectedPendingCount > 0 ? '#0284c7' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            <i className={`fa ${isFullyCollected ? 'fa-check-circle' : 'fa-check-square-o'}`} aria-hidden="true" />
          </div>
        </div>

        {/* Metric 3: Specimen Types Required */}
        <div
          className="pkg-stat-card"
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              className="pkg-stat-label"
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Specimens Required
            </div>
            <div
              className="pkg-stat-value"
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#7c3aed',
                marginTop: 1,
              }}
            >
              {specimenGroups.length} Specimen{specimenGroups.length === 1 ? '' : 's'}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#94a3b8',
                marginTop: 1,
                maxWidth: 150,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={specimenGroups.map((g) => g.specimen).join(', ')}
            >
              {specimenGroups.map((g) => g.specimen).join(', ') || 'None'}
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            <i className="fa fa-tint" aria-hidden="true" />
          </div>
        </div>

        {/* Metric 4: Barcode / Collection Status */}
        <div
          className="pkg-stat-card"
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              className="pkg-stat-label"
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              Sample Barcode Status
            </div>
            <div
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: canShowBarcode ? '#059669' : '#d97706',
                marginTop: 1,
              }}
            >
              {canShowBarcode ? 'Barcode Ready' : 'Pending Collection'}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 1 }}>
              {canShowBarcode ? 'Labels ready for printing' : 'Save to generate barcode labels'}
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: canShowBarcode ? '#ecfdf5' : '#fffbeb',
              color: canShowBarcode ? '#059669' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            <i className="fa fa-barcode" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 4. MediFlow Sample Requisition Table */}
      <div
        className="pkg-table-card"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        {/* Table Header Bar */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafbfc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a' }}>
              Sample Collection Requisition
            </span>
            {isFullyCollected ? (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className="fa fa-check-circle" aria-hidden="true" />
                <span>All {totalCount} tests collected</span>
              </span>
            ) : isPartiallyCollected ? (
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                ({selectedPendingCount} of {pendingCount} pending selected • {collectedItems.length} collected)
              </span>
            ) : (
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                ({selectedPendingCount} of {totalCount} selected)
              </span>
            )}
          </div>

          <button
            type="button"
            id="btnToggleSelectAll"
            disabled={isFullyCollected || pendingCount === 0}
            onClick={handleToggleSelectAll}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: isFullyCollected ? '#94a3b8' : '#334155',
              cursor: isFullyCollected ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: isFullyCollected ? 0.7 : 1,
            }}
          >
            <i
              className={`fa ${isFullyCollected ? 'fa-check-circle' : allPendingSelected ? 'fa-check-square' : somePendingSelected ? 'fa-minus-square' : 'fa-square-o'}`}
              style={{ color: isFullyCollected ? '#059669' : allPendingSelected ? '#0284c7' : '#64748b' }}
            />
            <span>{isFullyCollected ? 'All Collected' : allPendingSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            id="tblSampleCollectionItems"
            className="pkg-table"
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>
                  <input
                    type="checkbox"
                    id="chkSelectAll"
                    checked={isFullyCollected || allPendingSelected}
                    disabled={isFullyCollected || pendingCount === 0}
                    ref={(input) => {
                      if (input) input.indeterminate = !isFullyCollected && somePendingSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    style={{
                      cursor: isFullyCollected ? 'not-allowed' : 'pointer',
                      width: 16,
                      height: 16,
                    }}
                  />
                </th>
                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                <th style={{ width: '150px' }}>Specimen</th>
                <th style={{ minWidth: '240px' }}>Test Name & Code</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Priority</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '190px' }}>Collected Date</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Sample ID</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specimenGroups.map((group, gIdx) => {
                const groupPending = group.items.filter((i) => !isItemCollectedOrApproved(i));
                const isGroupFullyCollected = groupPending.length === 0;
                const isGroupAllSelected =
                  groupPending.length > 0 &&
                  groupPending.every((i) => selectedPendingIds.includes(i.Id));
                const isGroupSomeSelected =
                  groupPending.length > 0 &&
                  !isGroupAllSelected &&
                  groupPending.some((i) => selectedPendingIds.includes(i.Id));

                return (
                  <React.Fragment key={group.specimen || gIdx}>
                    {/* Specimen Header Row */}
                    <tr
                      style={{
                        background: '#f8fafc',
                        borderTop: gIdx > 0 ? '2px solid #e2e8f0' : undefined,
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          id={`chkSpecimenGroup_${gIdx}`}
                          className="specimen-group-checkbox"
                          checked={isGroupFullyCollected || isGroupAllSelected}
                          disabled={isGroupFullyCollected}
                          ref={(input) => {
                            if (input) input.indeterminate = !isGroupFullyCollected && isGroupSomeSelected;
                          }}
                          onChange={() => handleToggleGroup(group.items)}
                          style={{
                            cursor: isGroupFullyCollected ? 'not-allowed' : 'pointer',
                            width: 15,
                            height: 15,
                          }}
                        />
                      </td>
                      <td colSpan={8} style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 10px',
                              borderRadius: 6,
                              background: '#ede9fe',
                              color: '#6d28d9',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-tint" aria-hidden="true" />
                            <span>{group.specimen}</span>
                          </span>

                          {group.volume && (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              Volume: <strong>{group.volume}</strong>
                            </span>
                          )}

                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                            ({group.items.length} investigation{group.items.length === 1 ? '' : 's'})
                          </span>

                          {isGroupFullyCollected ? (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#059669',
                                background: '#ecfdf5',
                                padding: '1px 6px',
                                borderRadius: 4,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              • All Collected
                            </span>
                          ) : groupPending.length < group.items.length ? (
                            <span style={{ fontSize: '11px', color: '#2563eb' }}>
                              • {group.items.length - groupPending.length} collected, {groupPending.length} pending
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>

                    {/* Specimen Detail Items */}
                    {group.items.map((item, idx) => {
                      const isCollected = isItemCollectedOrApproved(item);
                      const isSelected = !isCollected && selectedPendingIds.includes(item.Id);
                      const isReadOnly = isCollected || Boolean(item.IsReadOnly);
                      const rowStatus = getStatusBadge(item.SampleStatus);

                      return (
                        <tr
                          key={item.Id || idx}
                          style={{
                            backgroundColor: isSelected ? '#f0f9ff' : isCollected ? '#fafafa' : undefined,
                            cursor: isReadOnly ? 'default' : 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                          onClick={() => {
                            if (!isReadOnly) handleToggleItem(item);
                          }}
                        >
                          {/* Row Checkbox */}
                          <td
                            style={{ textAlign: 'center', padding: '12px 10px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              id={`chkRowItem_${item.Id}`}
                              className="row-checkbox"
                              checked={isCollected || isSelected}
                              disabled={isReadOnly}
                              onChange={() => {
                                if (!isReadOnly) handleToggleItem(item);
                              }}
                              style={{
                                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                width: 16,
                                height: 16,
                              }}
                            />
                          </td>

                          {/* S.No */}
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                            {idx + 1}
                          </td>

                          {/* Specimen Badge */}
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '11.5px',
                                fontWeight: 600,
                              }}
                            >
                              {item.SampleType || 'Standard'}
                            </span>
                          </td>

                          {/* Test Name & Code */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: '13.5px',
                                  color: '#0f172a',
                                }}
                              >
                                {item.TestName}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {item.TestCode && (
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      color: '#0284c7',
                                    }}
                                  >
                                    {item.TestCode}
                                  </span>
                                )}

                                {item.SubDepartmentName && (
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    {item.SubDepartmentName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Priority */}
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background:
                                  item.SamplePriority?.toLowerCase() === 'stat'
                                    ? '#fee2e2'
                                    : item.SamplePriority?.toLowerCase() === 'urgent'
                                    ? '#fef3c7'
                                    : '#f1f5f9',
                                color:
                                  item.SamplePriority?.toLowerCase() === 'stat'
                                    ? '#dc2626'
                                    : item.SamplePriority?.toLowerCase() === 'urgent'
                                    ? '#d97706'
                                    : '#475569',
                              }}
                            >
                              {item.SamplePriority || 'Routine'}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background: rowStatus.bg,
                                color: rowStatus.color,
                                border: `1px solid ${rowStatus.border}`,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: rowStatus.dot,
                                }}
                              />
                              <span>{rowStatus.text}</span>
                            </span>
                          </td>

                          {/* Collection Date */}
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: item.CollectedDate ? '#1e293b' : '#94a3b8',
                                }}
                              >
                                {item.CollectedDate
                                  ? formatDateTime(item.CollectedDate)
                                  : isSelected
                                  ? 'Current Time (on save)'
                                  : 'Not Collected'}
                              </span>
                            </div>
                          </td>

                          {/* Sample Identifier */}
                          <td style={{ textAlign: 'center' }}>
                            {item.SampleIdentifier ? (
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  color: '#0284c7',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: '#e0f2fe',
                                }}
                              >
                                {item.SampleIdentifier}
                              </span>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Pending</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td
                            style={{ textAlign: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="btn-gr-round"
                              onClick={() => dispatch('tat', item)}
                              title="View Turnaround Time & Test Audit"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0284c7',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <i className="fa fa-clock-o" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {specimenGroups.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <i className="fa fa-info-circle" style={{ fontSize: '24px', color: '#94a3b8', marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No sample collection items available for this requisition</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Remarks & Barcode Printing Actions Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '18px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ flex: '1', minWidth: '280px' }}>
          <label
            htmlFor="rejectionRemarks"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              marginBottom: 6,
            }}
          >
            Rejection Comments & Phlebotomy Notes
          </label>
          <input
            id="rejectionRemarks"
            type="text"
            className="form-control"
            value={rejectionComments}
            onChange={(e) => handleRemarksChange(e.target.value)}
            placeholder="Enter reason if rejecting samples or additional phlebotomy notes..."
            style={{
              width: '100%',
              maxWidth: '650px',
              height: '38px',
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {canShowBarcode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
              Print Barcodes:
            </span>
            <button
              type="button"
              id="btnPrintBarcodeSample"
              onClick={() => dispatch('generateBarcode')}
              className="pkg-btn-reset"
              title="Print Sample barcode label 2.5mm X 5mm"
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fa fa-barcode" aria-hidden="true" />
              <span>Sample 2.5×5mm</span>
            </button>

            <button
              type="button"
              id="btnPrintBarcodeSlide"
              onClick={() => dispatch('pathologistBarcode')}
              className="pkg-btn-reset"
              title="Print slide barcode 2.5mm X 5mm"
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fa fa-print" aria-hidden="true" />
              <span>Slide 2.5×5mm</span>
            </button>

            <button
              type="button"
              id="btnPrintBarcodeHisto"
              onClick={() => dispatch('histoBarcode')}
              className="pkg-btn-reset"
              title="Print histo barcode 5mm X 10mm"
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fa fa-tags" aria-hidden="true" />
              <span>Histo 5×10mm</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Executive Action Bar */}
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
            id="btnBackToSampleListBottom"
            className="pkg-btn-reset"
            onClick={() => dispatch('back')}
            title="Return to sample collections list"
            style={{
              height: '40px',
              padding: '0 18px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" style={{ fontSize: '15px' }} />
            <span>Back to List</span>
          </button>

          {canReject && (
            <button
              type="button"
              id="btnRejectSample"
              onClick={() => dispatch('reject')}
              title="Reject the selected sample collection"
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fa fa-ban" aria-hidden="true" />
              <span>Reject Sample</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isFullyCollected ? (
            <span
              style={{
                fontSize: '13px',
                color: '#059669',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ecfdf5',
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #a7f3d0',
              }}
            >
              <i className="fa fa-check-circle" style={{ fontSize: '14px' }} />
              <span>All {totalCount} of {totalCount} tests collected</span>
            </span>
          ) : isPartiallyCollected ? (
            <span style={{ fontSize: '13.5px', color: '#475569' }}>
              <strong style={{ color: selectedPendingCount > 0 ? '#0284c7' : '#0f172a' }}>
                {selectedPendingCount}
              </strong>{' '}
              of <strong>{pendingCount}</strong> pending tests selected{' '}
              <span style={{ fontSize: '12px', color: '#64748b' }}>({collectedItems.length} collected)</span>
            </span>
          ) : (
            <span style={{ fontSize: '13.5px', color: '#475569' }}>
              <strong style={{ color: selectedPendingCount > 0 ? '#0284c7' : '#0f172a' }}>
                {selectedPendingCount}
              </strong>{' '}
              of <strong>{totalCount}</strong> tests selected
            </span>
          )}

          <button
            type="button"
            id="btnSaveSampleCollection"
            disabled={!canSave}
            onClick={() => dispatch('save')}
            title={
              isFullyCollected
                ? 'All tests have already been collected'
                : canSave
                ? `Record collection for ${selectedPendingCount} selected pending test(s)`
                : 'Select at least 1 pending test to collect'
            }
            style={{
              height: '42px',
              padding: '0 24px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#ffffff',
              background: canSave
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : '#cbd5e1',
              border: 'none',
              borderRadius: 8,
              cursor: canSave ? 'pointer' : 'not-allowed',
              boxShadow: canSave ? '0 3px 8px rgba(2, 132, 199, 0.35)' : 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className={`fa ${isFullyCollected ? 'fa-check' : 'fa-check-circle'}`} aria-hidden="true" />
            <span>
              {isFullyCollected
                ? 'All Samples Collected'
                : `Collect & Save Samples ${selectedPendingCount > 0 ? `(${selectedPendingCount})` : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
