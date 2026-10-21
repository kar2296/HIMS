import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface SampleReviewPatientData {
  Title?: string;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: number;
  Gender?: string;
  PatientName?: string;
}

export interface SampleReviewEncounterData {
  ReferralName?: string;
  FacilityName?: string;
  WardName?: string;
  BedNo?: string;
  RoomNo?: string;
  VisitIdentifier?: string;
  EncounterType?: string;
}

export interface SampleReviewDetailItem {
  Id: number;
  WorkOrderSampleId?: number;
  OrderDetailId?: number;
  TestId?: number;
  TestName: string;
  TestCode?: string;
  SampleType?: string;
  SampleIdentifier?: string | null;
  OrderPriority?: string;
  SampleStatus?: string;
  SampleStatusId?: number;
  SampleDetailStatusId?: number;
  CollectedDate?: string | null;
  ReviewDate?: string | null;
  IsSelected?: boolean;
  IsReadOnly?: boolean;
  IsAllSampleTypeSelected?: boolean;
  IsAllSampleTypeReadOnly?: boolean;
  SampleVolume?: string;
  SubDepartmentName?: string;
  IsSeparateSampleId?: number;
}

export interface SampleReviewGroupItem {
  SubDepartmentName?: string | null;
  details: SampleReviewDetailItem[];
}

export interface SampleReviewFormScreenProps {
  reactProps?: {
    sampleId?: number;
    orderId?: number;
    patient?: SampleReviewPatientData;
    encounter?: SampleReviewEncounterData;
    orderInfo?: {
      Id?: number;
      OrderNumber?: string;
      BillNumber?: string;
      OrderDate?: string;
      SampleStatus?: string;
      SampleStatusId?: number;
      DoctorName?: string;
      User?: any;
    };
    details?: SampleReviewDetailItem[];
    testList?: SampleReviewGroupItem[];
    canShowSave?: boolean;
    canShowBarcodeButton?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

/**
 * Helper to convert various date string formats to HTML5 datetime-local string (YYYY-MM-DDTHH:mm)
 */
function toDateTimeLocalString(dtStr?: string | null): string {
  if (!dtStr) return '';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Helper to format date for human display
 */
function formatHumanDateTime(dtStr?: string | null): string {
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
}

export const SampleReviewFormScreen: React.FC<SampleReviewFormScreenProps> = ({
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

  // Track selected IDs and review dates locally for instant responsive UI
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reviewDates, setReviewDates] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received'>('all');
  const isInitializedRef = useRef<number | null>(null);

  // Check if detail is already received (SampleDetailStatusId === 5)
  const isDetailReceived = (item: SampleReviewDetailItem): boolean => {
    if (item.SampleDetailStatusId === 5) return true;
    if (item.IsReadOnly) return true;
    const s = (item.SampleStatus || '').toLowerCase();
    return s.includes('received') || s.includes('reviewed');
  };

  // Classify pending vs received items
  const pendingItems = useMemo(() => {
    return rawDetails.filter((d) => !isDetailReceived(d));
  }, [rawDetails]);

  const receivedItems = useMemo(() => {
    return rawDetails.filter((d) => isDetailReceived(d));
  }, [rawDetails]);

  const totalCount = rawDetails.length;
  const pendingCount = pendingItems.length;
  const receivedCount = receivedItems.length;
  const isFullyReceived = totalCount > 0 && pendingCount === 0;

  // Selected pending IDs
  const selectedPendingIds = useMemo(() => {
    const pendingSet = new Set(pendingItems.map((p) => p.Id));
    return selectedIds.filter((id) => pendingSet.has(id));
  }, [selectedIds, pendingItems]);

  const selectedCount = selectedPendingIds.length;
  const allPendingSelected = pendingCount > 0 && selectedCount === pendingCount;
  const somePendingSelected = selectedCount > 0 && !allPendingSelected;

  // Initialize selection & default review dates
  useEffect(() => {
    const currentId = reactProps?.sampleId || (orderInfo as any)?.Id;
    if (rawDetails.length > 0 && isInitializedRef.current !== currentId) {
      isInitializedRef.current = currentId;

      const initialDates: Record<number, string> = {};
      const nowStr = toDateTimeLocalString(new Date().toISOString());

      // Auto-select pending items for phlebotomy / specimen reception efficiency
      const newSelectedIds: number[] = [];
      rawDetails.forEach((item) => {
        if (!isDetailReceived(item)) {
          newSelectedIds.push(item.Id);
          initialDates[item.Id] = item.ReviewDate ? toDateTimeLocalString(item.ReviewDate) : nowStr;
        } else {
          initialDates[item.Id] = toDateTimeLocalString(item.ReviewDate || item.CollectedDate);
        }
      });

      setSelectedIds(newSelectedIds);
      setReviewDates(initialDates);

      // Notify bridge if items defaulted to selected
      if (newSelectedIds.length > 0) {
        dispatch('toggleSelectAll', { selectAll: true });
      }
    }
  }, [reactProps?.sampleId, (orderInfo as any)?.Id, rawDetails]);

  // Group raw details by Specimen / SampleType
  const specimenGroups = useMemo(() => {
    const map = new Map<string, SampleReviewDetailItem[]>();
    for (const item of rawDetails) {
      const spec = item.SampleType || 'Standard Specimen';
      if (!map.has(spec)) {
        map.set(spec, []);
      }
      map.get(spec)!.push(item);
    }
    return Array.from(map.entries()).map(([specimen, items]) => ({
      specimen,
      volume: items[0]?.SampleVolume || 'Standard',
      subDepartment: items[0]?.SubDepartmentName,
      items,
    }));
  }, [rawDetails]);

  // Filtered specimen groups
  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return specimenGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          const matchesTerm =
            !term ||
            item.TestName.toLowerCase().includes(term) ||
            (item.TestCode && item.TestCode.toLowerCase().includes(term)) ||
            (item.SampleIdentifier && item.SampleIdentifier.toLowerCase().includes(term)) ||
            (item.SampleType && item.SampleType.toLowerCase().includes(term));

          const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && !isDetailReceived(item)) ||
            (statusFilter === 'received' && isDetailReceived(item));

          return matchesTerm && matchesStatus;
        });

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((g) => g.items.length > 0);
  }, [specimenGroups, searchTerm, statusFilter]);

  // Handlers
  const handleToggleSelectAll = () => {
    if (isFullyReceived || pendingCount === 0) return;
    const nextSelectState = !allPendingSelected;
    if (nextSelectState) {
      const nowStr = toDateTimeLocalString(new Date().toISOString());
      const nextDates = { ...reviewDates };
      const allIds = pendingItems.map((p) => {
        if (!nextDates[p.Id]) nextDates[p.Id] = nowStr;
        return p.Id;
      });
      setSelectedIds(allIds);
      setReviewDates(nextDates);
      dispatch('toggleSelectAll', { selectAll: true });
    } else {
      setSelectedIds([]);
      dispatch('toggleSelectAll', { selectAll: false });
    }
  };

  const handleToggleGroup = (groupItems: SampleReviewDetailItem[]) => {
    const groupPending = groupItems.filter((i) => !isDetailReceived(i));
    if (groupPending.length === 0) return;

    const areAllInGroupSelected = groupPending.every((i) => selectedPendingIds.includes(i.Id));
    let nextIds: number[];

    if (areAllInGroupSelected) {
      nextIds = selectedPendingIds.filter((id) => !groupPending.some((i) => i.Id === id));
    } else {
      const nowStr = toDateTimeLocalString(new Date().toISOString());
      const nextDates = { ...reviewDates };
      groupPending.forEach((item) => {
        if (!nextDates[item.Id]) nextDates[item.Id] = nowStr;
      });
      setReviewDates(nextDates);
      const toAdd = groupPending.map((i) => i.Id).filter((id) => !selectedPendingIds.includes(id));
      nextIds = [...selectedPendingIds, ...toAdd];
    }

    setSelectedIds(nextIds);
    dispatch('toggleSampleType', {
      sampleType: groupItems[0]?.SampleType,
      isSelected: !areAllInGroupSelected,
      items: groupPending,
    });
  };

  const handleToggleItem = (item: SampleReviewDetailItem) => {
    if (isDetailReceived(item)) return;
    const isCurrentlySelected = selectedPendingIds.includes(item.Id);
    let nextIds: number[];

    if (isCurrentlySelected) {
      nextIds = selectedPendingIds.filter((id) => id !== item.Id);
    } else {
      nextIds = [...selectedPendingIds, item.Id];
      if (!reviewDates[item.Id]) {
        setReviewDates((prev) => ({
          ...prev,
          [item.Id]: toDateTimeLocalString(new Date().toISOString()),
        }));
      }
    }

    setSelectedIds(nextIds);
    dispatch('toggleItem', { item, isSelected: !isCurrentlySelected });
  };

  const handleReviewDateChange = (item: SampleReviewDetailItem, value: string) => {
    setReviewDates((prev) => ({ ...prev, [item.Id]: value }));
    dispatch('updateReviewDate', { id: item.Id, date: value });
  };

  const handleSetAllToNow = () => {
    const nowStr = toDateTimeLocalString(new Date().toISOString());
    const nextDates = { ...reviewDates };
    selectedPendingIds.forEach((id) => {
      nextDates[id] = nowStr;
      dispatch('updateReviewDate', { id, date: nowStr });
    });
    setReviewDates(nextDates);
  };

  // Status Badge Metadata
  const getStatusBadge = (status?: string, statusId?: number) => {
    const s = (status || '').toLowerCase();
    if (statusId === 5 || s.includes('received') || s.includes('reviewed')) {
      return {
        bg: '#ecfdf5',
        color: '#059669',
        border: '#a7f3d0',
        dot: '#10b981',
        text: 'Received / Reviewed',
      };
    }
    if (statusId === 4 || s.includes('partial')) {
      return {
        bg: '#eff6ff',
        color: '#2563eb',
        border: '#bfdbfe',
        dot: '#3b82f6',
        text: 'Partially Received',
      };
    }
    if (s.includes('collected')) {
      return {
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
        dot: '#22c55e',
        text: 'Collected (In Transit)',
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
      text: 'Pending Review',
    };
  };

  const orderStatusBadge = getStatusBadge(orderInfo.SampleStatus, orderInfo.SampleStatusId);
  const patientInitials = (patient.FirstName?.[0] || 'P') + (patient.LastName?.[0] || '');

  const canSave = reactProps?.canShowSave !== false && !isFullyReceived && selectedCount > 0;
  const canShowBarcode =
    Boolean(reactProps?.canShowBarcodeButton) ||
    rawDetails.some((d) => Boolean(d.SampleIdentifier)) ||
    Boolean(orderInfo.Id);

  return (
    <div
      className="mediflow-samplereview-container"
      style={{
        padding: '24px 32px 40px 32px',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1e293b',
      }}
    >
      {/* 1. Header Toolbar */}
      <div
        className="pkg-header-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          background: '#ffffff',
          borderRadius: 12,
          padding: '14px 22px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '19px',
              boxShadow: '0 3px 8px rgba(99, 102, 241, 0.3)',
            }}
          >
            <i className="fa fa-stethoscope" aria-hidden="true" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.3px',
                }}
              >
                Sample Review & Reception
              </h1>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: '#e0e7ff',
                  color: '#4338ca',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                LIS / SPECIMEN RECEPTION
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Verify laboratory specimen integrity, confirm diagnostic reception timestamps, and track turnaround time
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
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
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
              }}
            />
            <span>{reactProps?.facilityName || 'SHUVADARSINI HOSPITAL'}</span>
          </div>

          <button
            type="button"
            id="btnBackToSampleReviewListTop"
            className="pkg-btn-reset"
            onClick={() => dispatch('back')}
            title="Return to Sample Review Worklist"
            style={{
              height: '34px',
              padding: '0 14px',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 7,
              cursor: 'pointer',
              fontWeight: 500,
              color: '#334155',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" style={{ fontSize: '15px' }} />
            <span>Back to Worklist</span>
          </button>
        </div>
      </div>

      {/* 2. Patient Identity & Requisition Banner Card */}
      <div
        className="orderack-patient-card"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          marginBottom: 14,
        }}
      >
        {/* Patient Identity Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottom: '1px solid #f1f5f9',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
                border: '1px solid #c7d2fe',
              }}
            >
              {patientInitials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '16px',
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
                      fontSize: '11.5px',
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: '#f1f5f9',
                      color: '#4338ca',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    MRN: {patient.MRN}
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
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
                  <span>Active Encounter</span>
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 3,
                  fontSize: '12px',
                  color: '#64748b',
                }}
              >
                {patient.Age !== undefined && <span>{patient.Age} Yrs</span>}
                {patient.Gender && <span>• {patient.Gender}</span>}
                {encounter.WardName && (
                  <span>
                    • Ward: <strong>{encounter.WardName}</strong>
                    {encounter.BedNo ? ` (Bed ${encounter.BedNo})` : ''}
                    {encounter.RoomNo ? ` / Room ${encounter.RoomNo}` : ''}
                  </span>
                )}
                {encounter.EncounterType && (
                  <span>• Encounter: <strong>{encounter.EncounterType}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 16,
                background: orderStatusBadge.bg,
                color: orderStatusBadge.color,
                border: `1px solid ${orderStatusBadge.border}`,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: orderStatusBadge.dot,
                }}
              />
              <span>{orderStatusBadge.text}</span>
            </span>
          </div>
        </div>

        {/* 4-Card Clinical Metric Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {/* Card 1: Requisition Reference */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Order & Bill Reference
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#4338ca',
                marginTop: 2,
                fontFamily: 'monospace',
              }}
            >
              {orderInfo.OrderNumber || '—'}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
              Bill No: <strong>{orderInfo.BillNumber || '—'}</strong>
            </div>
          </div>

          {/* Card 2: Order Date & Referred By */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Order Date & Referral
            </div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 2,
              }}
            >
              {formatHumanDateTime(orderInfo.OrderDate)}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
              Doctor: <strong>{encounter.ReferralName || orderInfo.DoctorName || 'SELF'}</strong>
            </div>
          </div>

          {/* Card 3: Clinical Location & Bed */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Location & Facility
            </div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 2,
              }}
            >
              {encounter.WardName || 'OPD / Diagnostic Lab'}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
              Bed/Room: <strong>{encounter.BedNo || encounter.RoomNo || '—'}</strong>
            </div>
          </div>

          {/* Card 4: Reception Progress Indicator */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              background: isFullyReceived ? '#ecfdf5' : '#f8fafc',
              border: isFullyReceived ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: isFullyReceived ? '#059669' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Specimen Reception Status
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isFullyReceived ? '#059669' : '#0f172a',
                marginTop: 2,
              }}
            >
              {receivedCount} of {totalCount} Specimens Received
            </div>
            <div
              style={{
                fontSize: '11.5px',
                color: isFullyReceived ? '#047857' : '#64748b',
                marginTop: 2,
              }}
            >
              {pendingCount > 0 ? (
                <span>
                  <strong>{pendingCount}</strong> Pending Verification
                </span>
              ) : (
                <span>✓ All Specimens Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar & Filter Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Select All Pending Checkbox */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: isFullyReceived || pendingCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              userSelect: 'none',
              margin: 0,
            }}
          >
            <input
              type="checkbox"
              id="chkSelectAllReviewSamples"
              checked={allPendingSelected && pendingCount > 0}
              disabled={isFullyReceived || pendingCount === 0}
              ref={(input) => {
                if (input) input.indeterminate = somePendingSelected;
              }}
              onChange={handleToggleSelectAll}
              style={{
                width: 17,
                height: 17,
                cursor: isFullyReceived || pendingCount === 0 ? 'not-allowed' : 'pointer',
                accentColor: '#4338ca',
              }}
            />
            <span>
              Select All Pending ({selectedCount}/{pendingCount})
            </span>
          </label>

          {/* Quick Action: Set All Review Dates to Now */}
          {selectedCount > 0 && (
            <button
              type="button"
              id="btnSetAllReviewDatesNow"
              onClick={handleSetAllToNow}
              title="Synchronize current date-time for all selected specimens"
              style={{
                height: '30px',
                padding: '0 10px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#e0e7ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#c7d2fe';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff';
              }}
            >
              <i className="fa fa-clock-o" aria-hidden="true" />
              <span>Set Current Time on Selected ({selectedCount})</span>
            </button>
          )}

          {/* Status Segment Filter */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: 8,
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                border: 'none',
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                color: statusFilter === 'all' ? '#0f172a' : '#64748b',
                fontWeight: statusFilter === 'all' ? 700 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              style={{
                border: 'none',
                background: statusFilter === 'pending' ? '#ffffff' : 'transparent',
                color: statusFilter === 'pending' ? '#d97706' : '#64748b',
                fontWeight: statusFilter === 'pending' ? 700 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: statusFilter === 'pending' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('received')}
              style={{
                border: 'none',
                background: statusFilter === 'received' ? '#ffffff' : 'transparent',
                color: statusFilter === 'received' ? '#059669' : '#64748b',
                fontWeight: statusFilter === 'received' ? 700 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: statusFilter === 'received' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Received ({receivedCount})
            </button>
          </div>
        </div>

        {/* Quick Filter Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <i
            className="fa fa-search"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          />
          <input
            type="text"
            placeholder="Search test name, code, barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              paddingLeft: '30px',
              paddingRight: searchTerm ? '26px' : '10px',
              fontSize: '12.5px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              outline: 'none',
              color: '#1e293b',
              background: '#ffffff',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 0,
              }}
            >
              <i className="fa fa-times-circle" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Diagnostic Specimens & Reception Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          overflow: 'hidden',
          marginBottom: 30,
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
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  height: '42px',
                }}
              >
                <th style={{ width: '45px', textAlign: 'center', padding: '8px 12px' }}>
                  <span>SEL</span>
                </th>
                <th style={{ width: '130px', padding: '8px 12px' }}>Specimen</th>
                <th style={{ width: '100px', padding: '8px 12px' }}>Test Code</th>
                <th style={{ minWidth: '220px', padding: '8px 12px' }}>Test Name</th>
                <th style={{ width: '100px', padding: '8px 12px' }}>Priority</th>
                <th style={{ width: '130px', padding: '8px 12px' }}>Status</th>
                <th style={{ width: '90px', padding: '8px 12px' }}>Volume</th>
                <th style={{ width: '210px', padding: '8px 12px' }}>Review Date & Time</th>
                <th style={{ width: '120px', padding: '8px 12px' }}>Sample ID</th>
                <th style={{ width: '110px', textAlign: 'center', padding: '8px 12px' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#64748b',
                    }}
                  >
                    <div style={{ fontSize: '24px', color: '#cbd5e1', marginBottom: 8 }}>
                      <i className="fa fa-flask" aria-hidden="true" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                      No diagnostic specimens match your filter
                    </div>
                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                      Try adjusting the search query or status filter above
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const groupPending = group.items.filter((i) => !isDetailReceived(i));
                  const isGroupAllPendingSelected =
                    groupPending.length > 0 &&
                    groupPending.every((i) => selectedPendingIds.includes(i.Id));

                  return (
                    <React.Fragment key={`group-${group.specimen}`}>
                      {/* Specimen Header Row */}
                      <tr
                        style={{
                          background: '#f1f5f9',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                          <input
                            type="checkbox"
                            checked={isGroupAllPendingSelected}
                            disabled={groupPending.length === 0}
                            onChange={() => handleToggleGroup(group.items)}
                            title={
                              groupPending.length === 0
                                ? 'All specimens in this group are already received'
                                : 'Select/Deselect all pending in this specimen group'
                            }
                            style={{
                              width: 16,
                              height: 16,
                              cursor: groupPending.length === 0 ? 'not-allowed' : 'pointer',
                              accentColor: '#4338ca',
                            }}
                          />
                        </td>
                        <td
                          colSpan={9}
                          style={{
                            padding: '8px 12px',
                            fontWeight: 700,
                            color: '#334155',
                            fontSize: '12px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i
                                className="fa fa-eyedropper"
                                aria-hidden="true"
                                style={{ color: '#6366f1' }}
                              />
                              <span style={{ color: '#0f172a', fontWeight: 700 }}>
                                {group.specimen}
                              </span>
                              {group.volume && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: '#e2e8f0',
                                    color: '#475569',
                                  }}
                                >
                                  Req: {group.volume}
                                </span>
                              )}
                              {group.subDepartment && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '1px 7px',
                                    borderRadius: 10,
                                    background: '#e0e7ff',
                                    color: '#4338ca',
                                  }}
                                >
                                  {group.subDepartment}
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
                              {group.items.length} test{group.items.length > 1 ? 's' : ''} in tube
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Specimen Detail Rows */}
                      {group.items.map((item) => {
                        const isReceived = isDetailReceived(item);
                        const isSelected = selectedPendingIds.includes(item.Id);
                        const rowReviewDate =
                          reviewDates[item.Id] || toDateTimeLocalString(item.ReviewDate);

                        const rowStatus = getStatusBadge(item.SampleStatus, item.SampleDetailStatusId);

                        // Priority styling
                        const pri = (item.OrderPriority || 'Routine').toLowerCase();
                        let priColor = '#475569';
                        let priBg = '#f1f5f9';
                        let priBorder = '#e2e8f0';
                        if (pri.includes('stat') || pri.includes('urgent') || pri.includes('emerg')) {
                          priColor = '#e11d48';
                          priBg = '#fff1f2';
                          priBorder = '#fecdd3';
                        }

                        return (
                          <tr
                            key={`detail-${item.Id}`}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: isReceived
                                ? '#fcfdfd'
                                : isSelected
                                ? '#f5f7ff'
                                : '#ffffff',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseOver={(e) => {
                              if (!isReceived && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isReceived && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            {/* Checkbox */}
                            <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                              <input
                                type="checkbox"
                                checked={isReceived ? true : isSelected}
                                disabled={isReceived}
                                onChange={() => handleToggleItem(item)}
                                title={
                                  isReceived
                                    ? 'Specimen has already been received & verified'
                                    : 'Check to review and receive this specimen'
                                }
                                style={{
                                  width: 17,
                                  height: 17,
                                  cursor: isReceived ? 'not-allowed' : 'pointer',
                                  accentColor: '#4338ca',
                                }}
                              />
                            </td>

                            {/* Specimen Type */}
                            <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px' }}>
                              <span style={{ fontWeight: 500 }}>
                                {item.SampleType || 'Standard'}
                              </span>
                            </td>

                            {/* Test Code */}
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: '#475569',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                {item.TestCode || '—'}
                              </span>
                            </td>

                            {/* Test Name */}
                            <td style={{ padding: '10px 12px' }}>
                              <button
                                type="button"
                                onClick={() => item.TestId && dispatch('testProfile', item.TestId)}
                                title="Click to view test profile instructions and reference ranges"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  textAlign: 'left',
                                  color: '#4338ca',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  textDecoration: 'none',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                {item.TestName}
                              </button>
                            </td>

                            {/* Priority */}
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 10,
                                  background: priBg,
                                  color: priColor,
                                  border: `1px solid ${priBorder}`,
                                }}
                              >
                                {item.OrderPriority || 'Routine'}
                              </span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 12,
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

                            {/* Required Volume */}
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>
                              <span>{item.SampleVolume || '—'}</span>
                            </td>

                            {/* Review Date & Time */}
                            <td style={{ padding: '10px 12px' }}>
                              {isReceived ? (
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#059669',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                  }}
                                >
                                  <i className="fa fa-check-circle" aria-hidden="true" />
                                  <span>{formatHumanDateTime(item.ReviewDate)}</span>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input
                                    type="datetime-local"
                                    value={rowReviewDate}
                                    disabled={!isSelected}
                                    onChange={(e) => handleReviewDateChange(item, e.target.value)}
                                    style={{
                                      height: '30px',
                                      padding: '2px 8px',
                                      fontSize: '12px',
                                      borderRadius: 6,
                                      border: '1px solid #cbd5e1',
                                      outline: 'none',
                                      color: isSelected ? '#1e293b' : '#94a3b8',
                                      background: isSelected ? '#ffffff' : '#f8fafc',
                                      cursor: isSelected ? 'text' : 'not-allowed',
                                    }}
                                  />
                                </div>
                              )}
                            </td>

                            {/* Sample Barcode / Identifier */}
                            <td style={{ padding: '10px 12px' }}>
                              {item.SampleIdentifier ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    color: '#0369a1',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                  }}
                                >
                                  <i
                                    className="fa fa-barcode"
                                    aria-hidden="true"
                                    style={{ fontSize: '11px' }}
                                  />
                                  <span>{item.SampleIdentifier}</span>
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                {/* TAT Details Button */}
                                <button
                                  type="button"
                                  onClick={() => dispatch('tat', item)}
                                  title="View Order Turnaround Time (TAT) Milestones"
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    color: '#6366f1',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                                    e.currentTarget.style.borderColor = '#c7d2fe';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  <i className="fa fa-clock-o" aria-hidden="true" />
                                </button>

                                {/* Attachments Button */}
                                <button
                                  type="button"
                                  onClick={() => dispatch('attachments', item)}
                                  title="View Clinical Specimen Attachments & Forms"
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    color: '#0284c7',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e0f2fe';
                                    e.currentTarget.style.borderColor = '#bae6fd';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  <i className="fa fa-paperclip" aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Action Bar */}
      <div
        className="orderack-action-bar"
        style={{
          marginTop: 20,
          marginBottom: 30,
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
            id="btnBackToWorklistBottom"
            onClick={() => dispatch('back')}
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" style={{ fontSize: '15px' }} />
            <span>Back to Worklist</span>
          </button>

          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            {selectedCount > 0 ? (
              <span>
                <strong>{selectedCount}</strong> pending specimen{selectedCount > 1 ? 's' : ''} selected for reception
              </span>
            ) : isFullyReceived ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>
                ✓ All specimens have been received & verified
              </span>
            ) : (
              <span>Select specimens to confirm reception</span>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canShowBarcode && (
            <button
              type="button"
              id="btnPrintSampleBarcodes"
              onClick={() => dispatch('generateBarcode')}
              title="Print laboratory tube barcode labels"
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              <i className="fa fa-barcode" aria-hidden="true" style={{ fontSize: '14px' }} />
              <span>Print Barcode</span>
            </button>
          )}

          <button
            type="button"
            id="btnSaveSampleReview"
            onClick={() => dispatch('save')}
            disabled={!canSave}
            title={
              !canSave
                ? 'Select at least one pending specimen with review date to confirm reception'
                : 'Confirm and receive selected laboratory specimens'
            }
            style={{
              height: '38px',
              padding: '0 20px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: canSave
                ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)'
                : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              boxShadow: canSave ? '0 2px 8px rgba(67, 56, 202, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              if (canSave) {
                e.currentTarget.style.filter = 'brightness(1.08)';
              }
            }}
            onMouseOut={(e) => {
              if (canSave) {
                e.currentTarget.style.filter = 'none';
              }
            }}
          >
            <i className="fa fa-check" aria-hidden="true" />
            <span>Confirm & Receive {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
