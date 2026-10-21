import React, { useState, useMemo, useEffect, useCallback } from 'react';
import moment from 'moment';
import { colors, typography, radii } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';

export interface TatDetailsItem {
  OrderTATId?: number;
  Id?: number;
  PatientId?: number;
  PatientOrderId?: number;
  PatientOrderDetailId?: number;
  DoctorId?: number;
  TestId?: number;
  TestName?: string;
  OrderedOn?: string | null;
  AcceptedOn?: string | null;
  SampleCollectedOn?: string | null;
  SampleReceivedOn?: string | null;
  AssignedOn?: string | null;
  TechValidationOn?: string | null;
  MedValidationOn?: string | null;
  ReleasedOn?: string | null;
  Status?: number;
  Patient?: {
    Title?: { Description?: string };
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number;
    Gender?: { Description?: string };
    Mobile?: string;
  };
  Doctor?: {
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
    UserName?: string;
  };
  PatientOrder?: {
    OrderNumber?: string;
    DoctorName?: string;
    OrderRequestDate?: string;
    OrderFrom?: { DepartmentName?: string };
    OrderStatus?: { DisplayName?: string };
    CreatedUser?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
      UserName?: string;
    };
  };
  PatientOrderDetail?: {
    Id?: number;
    TestName?: string;
    DepartmentId?: number;
    [key: string]: any;
  };
  PatientWorkorder?: {
    WorkOrderId?: string;
    SampleIdentifier?: string;
    TechValidationByName?: string;
    TechValidationdate?: string | null;
    MedValidationByName?: string;
    MedValidationdate?: string | null;
    Approvedbyname?: string;
    Orderedbyname?: string;
    ResultEnteredBy?: string;
    ResultEnteredUser?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
    };
    MedUser?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
    };
    CreatedUser?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
      UserName?: string;
    };
    Orderedby?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
    };
    Assigndate?: string | null;
    ReceivedDate?: string | null;
    ReleasedBy?: string;
    ReleasedDate?: string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

interface TatDetailsProps {
  reactProps?: {
    ordertat?: TatDetailsItem[];
    isLoading?: boolean;
    currentcontext?: {
      ismodal?: boolean;
      pid?: number | null;
      oid?: number | null;
      odid?: number | null;
      TestId?: number | null;
      testtypeid?: number | null;
      [key: string]: any;
    };
    pid?: number | null;
    oid?: number | null;
    odid?: number | null;
    TestId?: number | null;
    testtypeid?: number | null;
    [key: string]: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

interface MilestoneDefinition {
  id: string;
  field: keyof TatDetailsItem;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  role: string;
  getPerformer?: (record: TatDetailsItem) => string | undefined;
}

const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'ordered',
    field: 'OrderedOn',
    label: 'Order Placed',
    shortLabel: 'Ordered',
    description: 'Requisition placed in Hospital Information System',
    icon: 'fa-file-text-o',
    role: 'Ordering Physician',
    getPerformer: (r) => {
      const doc = r.Doctor || r.PatientWorkorder?.Orderedby;
      if (doc) return `${doc.Title?.Description || 'Dr.'} ${[doc.FirstName, doc.LastName].filter(Boolean).join(' ')}`.trim();
      return r.PatientOrder?.DoctorName;
    },
  },
  {
    id: 'accepted',
    field: 'AcceptedOn',
    label: 'Order Accepted',
    shortLabel: 'Accepted',
    description: 'Order confirmed and registered at laboratory reception',
    icon: 'fa-check-circle-o',
    role: 'Laboratory Reception',
    getPerformer: (r) => {
      const u = r.CreatedUser || r.PatientWorkorder?.CreatedUser || r.PatientOrder?.CreatedUser;
      if (u) return `${u.Title?.Description || ''} ${[u.FirstName, u.LastName].filter(Boolean).join(' ')}`.trim() || u.UserName;
      return undefined;
    },
  },
  {
    id: 'collected',
    field: 'SampleCollectedOn',
    label: 'Sample Collected',
    shortLabel: 'Collected',
    description: 'Primary biological specimen drawn and barcode labeled',
    icon: 'fa-flask',
    role: 'Phlebotomist / Nurse',
    getPerformer: (r) => (r.PatientWorkorder?.SampleIdentifier ? `Barcode #${r.PatientWorkorder.SampleIdentifier}` : undefined),
  },
  {
    id: 'received',
    field: 'SampleReceivedOn',
    label: 'Sample Received in Lab',
    shortLabel: 'Received',
    description: 'Accessioned and specimen integrity checked at central lab',
    icon: 'fa-inbox',
    role: 'Accessioning Technologist',
  },
  {
    id: 'assigned',
    field: 'AssignedOn',
    label: 'Worklist Assigned',
    shortLabel: 'Assigned',
    description: 'Routed to analytical instrument / testing bench worklist',
    icon: 'fa-cogs',
    role: 'Bench Technologist',
    getPerformer: (r) => (r.PatientWorkorder?.WorkOrderId ? `Worklist ${r.PatientWorkorder.WorkOrderId}` : undefined),
  },
  {
    id: 'techValidation',
    field: 'TechValidationOn',
    label: 'Technical Validation',
    shortLabel: 'Tech Verified',
    description: 'Analytical measurements, calibrations & controls verified',
    icon: 'fa-microscope',
    role: 'Laboratory Technologist',
    getPerformer: (r) => {
      const u = r.PatientWorkorder?.ResultEnteredUser;
      if (u) return `${u.Title?.Description || ''} ${[u.FirstName, u.LastName].filter(Boolean).join(' ')}`.trim();
      return r.PatientWorkorder?.TechValidationByName || r.PatientWorkorder?.ResultEnteredBy;
    },
  },
  {
    id: 'medValidation',
    field: 'MedValidationOn',
    label: 'Medical Validation',
    shortLabel: 'Med Verified',
    description: 'Diagnostic findings authorized by consulting pathologist',
    icon: 'fa-user-md',
    role: 'Consultant Pathologist',
    getPerformer: (r) => {
      const u = r.PatientWorkorder?.MedUser;
      if (u) return `${u.Title?.Description || ''} ${[u.FirstName, u.LastName].filter(Boolean).join(' ')}`.trim();
      return r.PatientWorkorder?.MedValidationByName || r.PatientWorkorder?.Approvedbyname;
    },
  },
  {
    id: 'released',
    field: 'ReleasedOn',
    label: 'Report Released',
    shortLabel: 'Released',
    description: 'Authenticated report released to patient EMR and portal',
    icon: 'fa-paper-plane-o',
    role: 'Authorizing Authority',
    getPerformer: (r) => r.PatientWorkorder?.ReleasedBy,
  },
];

function formatTimeFormatted(isoString?: string | null): string {
  if (!isoString) return '';
  const m = moment(isoString);
  if (!m.isValid()) return '';
  return m.format('DD-MMM-YYYY, hh:mm A');
}

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return '';
  const m = moment(isoString);
  if (!m.isValid()) return '';
  return m.fromNow();
}

function formatDurationBetween(startIso?: string | null, endIso?: string | null): string {
  if (!startIso || !endIso) return '';
  const start = moment(startIso);
  const end = moment(endIso);
  if (!start.isValid() || !end.isValid()) return '';
  const diffMs = Math.max(0, end.diff(start));
  const dur = moment.duration(diffMs);
  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const mins = dur.minutes();

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(' ');
}

export function getTestStatusMeta(record?: TatDetailsItem) {
  if (!record) {
    return { label: 'Order Placed', bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
  }
  if (record.ReleasedOn) {
    return { label: 'Report Released', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', dot: '#10b981' };
  }
  if (record.MedValidationOn || record.PatientWorkorder?.MedValidationdate) {
    return { label: 'Medically Validated', bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe', dot: '#8b5cf6' };
  }
  if (record.TechValidationOn || record.PatientWorkorder?.TechValidationdate) {
    return { label: 'Technically Validated', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' };
  }
  if (record.AssignedOn || record.PatientWorkorder?.Assigndate) {
    return { label: 'In Worklist', bg: '#ecfeff', color: '#155e75', border: '#a5f3fc', dot: '#06b6d4' };
  }
  if (record.SampleReceivedOn || record.PatientWorkorder?.ReceivedDate) {
    return { label: 'Sample Received', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#22c55e' };
  }
  if (record.SampleCollectedOn) {
    return { label: 'Sample Collected', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', dot: '#0284c7' };
  }
  if (record.AcceptedOn) {
    return { label: 'Order Accepted', bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' };
  }
  return { label: 'Order Placed', bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
}

export const TatDetailsModalScreen: React.FC<TatDetailsProps> = ({ reactProps, onAction }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'allTests'>('timeline');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchedList, setFetchedList] = useState<TatDetailsItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const ordertatList = (reactProps?.ordertat && reactProps.ordertat.length > 0)
    ? reactProps.ordertat
    : fetchedList;
  const isLoading = (reactProps?.isLoading || isFetching);

  const effectivePid = reactProps?.currentcontext?.pid ?? reactProps?.pid;
  const effectiveOid = reactProps?.currentcontext?.oid ?? reactProps?.oid;
  const effectiveOdid = reactProps?.currentcontext?.odid ?? reactProps?.odid;
  const effectiveTestId = reactProps?.currentcontext?.TestId ?? reactProps?.TestId;

  // Auto-fetch TAT details if not provided by parent component
  const fetchTatData = useCallback(async () => {
    if (!effectivePid && !effectiveOid) return;
    setIsFetching(true);
    try {
      const params: { Key: number; Value: any }[] = [];
      if (effectivePid) params.push({ Key: 4, Value: effectivePid });
      if (effectiveOid) params.push({ Key: 5, Value: effectiveOid });
      if (effectiveTestId) params.push({ Key: 7, Value: effectiveTestId });

      const res = await callBackendApi<{ Data?: TatDetailsItem[] }>({
        action: 'lis/ordertat/GetOrderTATs',
        data: {
          Params: params,
          PageContext: { PageSize: 500, PageNumber: 1 },
        },
        type: 'post',
      });
      if (res && Array.isArray(res.Data)) {
        setFetchedList(res.Data);
      }
    } catch (err) {
      console.error('Failed to fetch TAT records:', err);
    } finally {
      setIsFetching(false);
    }
  }, [effectivePid, effectiveOid, effectiveTestId]);

  useEffect(() => {
    if (!reactProps?.ordertat || reactProps.ordertat.length === 0) {
      fetchTatData();
    }
  }, [fetchTatData, reactProps?.ordertat]);

  // Sync selected test if matching odid is passed in currentcontext or reactProps
  useEffect(() => {
    const targetOdid = effectiveOdid;
    if (targetOdid && ordertatList.length > 0) {
      const idx = ordertatList.findIndex(
        (t) => t.PatientOrderDetailId === targetOdid || t.Id === targetOdid
      );
      if (idx !== -1) {
        setSelectedTestIndex(idx);
      }
    }
  }, [effectiveOdid, ordertatList]);

  // Keep index within bounds
  const safeIndex = selectedTestIndex >= 0 && selectedTestIndex < ordertatList.length ? selectedTestIndex : 0;
  const record: TatDetailsItem = ordertatList[safeIndex] || {};

  const dispatch = (action: string, payload?: any) => {
    if (action === 'refresh') {
      setIsRefreshing(true);
      if (!reactProps?.ordertat || reactProps.ordertat.length === 0) {
        fetchTatData();
      }
      setTimeout(() => setIsRefreshing(false), 800);
    }
    if (onAction) onAction(action, payload);
  };

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch('close');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Milestone progression calculation for active test
  const milestoneData = useMemo(() => {
    let lastCompletedIndex = -1;
    let lastCompletedTime: string | null = null;

    const items = MILESTONES.map((m, idx) => {
      let rawDate = record[m.field] as string | null | undefined;
      // Also check fallback fields from PatientWorkorder or PatientOrder
      if (!rawDate) {
        if (m.id === 'ordered') rawDate = record.PatientOrder?.OrderRequestDate;
        if (m.id === 'techValidation') rawDate = record.PatientWorkorder?.TechValidationdate;
        if (m.id === 'medValidation') rawDate = record.PatientWorkorder?.MedValidationdate;
        if (m.id === 'released') rawDate = record.PatientWorkorder?.ReleasedDate;
        if (m.id === 'received') rawDate = record.PatientWorkorder?.ReceivedDate;
      }

      const isCompleted = !!rawDate && moment(rawDate).isValid();

      if (isCompleted) {
        lastCompletedIndex = idx;
        lastCompletedTime = rawDate!;
      }

      return {
        ...m,
        date: rawDate,
        isCompleted,
        performer: m.getPerformer ? m.getPerformer(record) : undefined,
      };
    });

    const activeIndex = lastCompletedIndex < items.length - 1 ? lastCompletedIndex + 1 : -1;

    // Calculate delta durations between completed steps
    const withDurations = items.map((item, idx) => {
      let durationFromPrev = '';
      if (item.isCompleted && idx > 0) {
        // Find previous completed step
        for (let p = idx - 1; p >= 0; p--) {
          if (items[p].isCompleted && items[p].date) {
            durationFromPrev = formatDurationBetween(items[p].date, item.date);
            break;
          }
        }
      }

      const isCurrentActive = idx === activeIndex;
      const isPending = !item.isCompleted && !isCurrentActive;

      return {
        ...item,
        isCurrentActive,
        isPending,
        durationFromPrev,
      };
    });

    const completedCount = items.filter((i) => i.isCompleted).length;
    const progressPercent = Math.round((completedCount / MILESTONES.length) * 100);

    // Total TAT elapsed
    let totalTatFormatted = '—';
    if (items[0].isCompleted && items[0].date) {
      const endTime = record.ReleasedOn || lastCompletedTime || new Date().toISOString();
      totalTatFormatted = formatDurationBetween(items[0].date, endTime);
    }

    return {
      milestones: withDurations,
      completedCount,
      progressPercent,
      totalTatFormatted,
      lastCompletedIndex,
      isFullyComplete: completedCount === MILESTONES.length,
    };
  }, [record]);

  // Overall status tag
  const statusMeta = useMemo(() => getTestStatusMeta(record), [record]);

  const patient = record.Patient || ordertatList[0]?.Patient;
  const patientFullName = patient
    ? `${patient.Title?.Description || ''} ${[patient.FirstName, patient.MiddleName, patient.LastName].filter(Boolean).join(' ')}`.trim()
    : 'Patient Record';

  const orderNumber = record.PatientOrder?.OrderNumber || ordertatList[0]?.PatientOrder?.OrderNumber || `Order #${record.PatientOrderId || ''}`;
  const workOrderCode = record.PatientWorkorder?.WorkOrderId || ordertatList[0]?.PatientWorkorder?.WorkOrderId;
  const sampleIdentifier = record.PatientWorkorder?.SampleIdentifier || ordertatList[0]?.PatientWorkorder?.SampleIdentifier;
  const departmentName = record.PatientOrder?.OrderFrom?.DepartmentName || ordertatList[0]?.PatientOrder?.OrderFrom?.DepartmentName || 'Laboratory';
  const displayedTestName = record.TestName || record.PatientOrderDetail?.TestName || 'Diagnostic Investigation';
  const doctorName = record.PatientOrder?.DoctorName || record.Doctor?.FirstName
    ? `${record.Doctor?.Title?.Description || 'Dr.'} ${[record.Doctor?.FirstName, record.Doctor?.LastName].filter(Boolean).join(' ')}`.trim()
    : 'Hospital Physician';

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        background: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 100px)',
        width: '100%',
      }}
    >
      <style>{`
        .modal-dialog.modal-lg {
          max-width: 1040px !important;
          width: 95% !important;
          margin: 24px auto !important;
        }
        .modal-content {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .tat-modal-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          border-color: #cbd5e1 !important;
        }
        .tat-tab-btn:hover {
          color: #1e293b !important;
        }
        .tat-close-btn:hover {
          background: #fee2e2 !important;
          color: #ef4444 !important;
          border-color: #fca5a5 !important;
        }
        .tat-test-pill:hover {
          border-color: #93c5fd !important;
          background: #f8fafc !important;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.28)',
            }}
          >
            <i className="fa fa-history" aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Order Turnaround Time (TAT) & Milestones
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 9px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: statusMeta.bg,
                  color: statusMeta.color,
                  border: `1px solid ${statusMeta.border}`,
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
                {statusMeta.label}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Real-time audit log of diagnostic milestones, accession timestamps & processing intervals
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => dispatch('refresh')}
            title="Refresh order history"
            style={{
              height: 34,
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <i
              className={`fa fa-refresh ${isRefreshing ? 'fa-spin' : ''}`}
              style={{ fontSize: '12px', color: '#0284c7' }}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="tat-close-btn"
            onClick={() => dispatch('close')}
            title="Close dialog (Esc)"
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fa fa-times" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SCROLLABLE CONTENT BODY
      ───────────────────────────────────────────────────────────── */}
      {isLoading && (!ordertatList || ordertatList.length === 0) ? (
        <div
          style={{
            padding: '70px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#0284c7',
              animation: 'spin-slow 0.8s linear infinite',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Loading Turnaround Time Milestones...
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: 4 }}>
              Retrieving diagnostic audit logs and accession timestamps
            </div>
          </div>
        </div>
      ) : (
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {/* MULTI-TEST SELECTOR TABS (Shown when order contains multiple tests) */}
          {ordertatList.length > 1 && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa fa-list-check" style={{ color: '#0284c7' }} />
                  <span>Order Tests ({ordertatList.length} Investigations in this Order)</span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600 }}>
                  Click to inspect individual test turnaround time
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ordertatList.map((item, idx) => {
                  const isSelected = idx === safeIndex;
                  const tStatus = getTestStatusMeta(item);
                  const name = item.TestName || item.PatientOrderDetail?.TestName || `Test #${idx + 1}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="tat-test-pill"
                      onClick={() => setSelectedTestIndex(idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#0369a1' : '#334155',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '12.5px',
                        boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.15)' : '0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: isSelected ? '#0284c7' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          background: tStatus.bg,
                          color: tStatus.color,
                          border: `1px solid ${tStatus.border}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tStatus.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. HERO SUMMARY BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Top Banner Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.2px',
                    }}
                  >
                    <i className="fa fa-flask" />
                    TEST REQUISITION
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 700 }}>
                    {orderNumber}
                  </span>
                  {workOrderCode && (
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        background: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      WO: {workOrderCode}
                    </span>
                  )}
                  {sampleIdentifier && (
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        background: '#dbeafe',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <i className="fa fa-barcode" style={{ marginRight: 4 }} />
                      {sampleIdentifier}
                    </span>
                  )}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {displayedTestName}
                </h2>
              </div>

              {/* Total TAT Pill */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  background: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Total Elapsed TAT
                </span>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#0284c7', fontFamily: typography.fontFamilyMono }}>
                  {milestoneData.totalTatFormatted}
                </span>
              </div>
            </div>

            {/* Patient & Clinical Meta Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                paddingTop: 12,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Patient
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: 1 }}>
                  {patientFullName}
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {patient?.MRN ? `UHID/MRN: ${patient.MRN}` : ''} {patient?.Age ? `• ${patient.Age}Y` : ''} {patient?.Gender?.Description ? `• ${patient.Gender.Description}` : ''}
                </span>
                {patient?.Mobile && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
                    <i className="fa fa-phone" style={{ marginRight: 4, fontSize: '10px' }} />
                    {patient.Mobile}
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Ordering Doctor
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: 1 }}>
                  {doctorName}
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {departmentName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Milestone Progress
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: 1 }}>
                  {milestoneData.completedCount} of {MILESTONES.length} Milestones
                </div>
                <span style={{ fontSize: '11.5px', color: milestoneData.isFullyComplete ? '#10b981' : '#0284c7', fontWeight: 600 }}>
                  {milestoneData.progressPercent}% Completed
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Order Request Date
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: 1 }}>
                  {formatTimeFormatted(record.OrderedOn || record.PatientOrder?.OrderRequestDate) || '—'}
                </div>
                {(record.OrderedOn || record.PatientOrder?.OrderRequestDate) && (
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {formatRelativeTime(record.OrderedOn || record.PatientOrder?.OrderRequestDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: '999px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${milestoneData.progressPercent}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. VIEW MODE TOGGLE & SECTION HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {viewMode === 'timeline' && 'Turnaround Time Milestone Progression'}
                {viewMode === 'table' && 'Diagnostic Stage Audit Log'}
                {viewMode === 'allTests' && `All Order Investigations (${ordertatList.length})`}
              </h4>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {viewMode === 'allTests'
                  ? 'Overview of all test requisitions, accession timestamps, and status for this order'
                  : `Tracking milestones for ${displayedTestName}`}
              </span>
            </div>

            {/* View Mode Pill Switcher */}
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                className="tat-tab-btn"
                onClick={() => setViewMode('timeline')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'timeline' ? '#ffffff' : 'transparent',
                  color: viewMode === 'timeline' ? '#0284c7' : '#64748b',
                  boxShadow: viewMode === 'timeline' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className="fa fa-list-ul" />
                Timeline Stepper
              </button>
              <button
                type="button"
                className="tat-tab-btn"
                onClick={() => setViewMode('table')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#0284c7' : '#64748b',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className="fa fa-table" />
                Audit Log Table
              </button>
              {ordertatList.length > 1 && (
                <button
                  type="button"
                  className="tat-tab-btn"
                  onClick={() => setViewMode('allTests')}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: viewMode === 'allTests' ? '#ffffff' : 'transparent',
                    color: viewMode === 'allTests' ? '#0284c7' : '#64748b',
                    boxShadow: viewMode === 'allTests' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <i className="fa fa-th-list" />
                  All Tests ({ordertatList.length})
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4A. TIMELINE STEPPER VIEW (DEFAULT)
          ───────────────────────────────────────────────────────────── */}
          {viewMode === 'timeline' && (
            <div style={{ position: 'relative', paddingLeft: '8px' }}>
              {milestoneData.milestones.map((m, idx) => {
                const isLast = idx === milestoneData.milestones.length - 1;
                return (
                  <div
                    key={m.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      paddingBottom: isLast ? 0 : 20,
                    }}
                  >
                    {/* Stepper Node & Connecting Line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: m.isCompleted
                            ? '#10b981'
                            : m.isCurrentActive
                            ? '#0284c7'
                            : '#f1f5f9',
                          color: m.isCompleted || m.isCurrentActive ? '#ffffff' : '#94a3b8',
                          boxShadow: m.isCompleted
                            ? '0 2px 6px rgba(16, 185, 129, 0.35)'
                            : m.isCurrentActive
                            ? '0 0 0 4px rgba(2, 132, 199, 0.2)'
                            : 'none',
                          border: m.isCompleted || m.isCurrentActive ? 'none' : '2px dashed #cbd5e1',
                          zIndex: 2,
                          fontSize: '13px',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {m.isCompleted ? (
                          <i className="fa fa-check" />
                        ) : m.isCurrentActive ? (
                          <i className="fa fa-spinner fa-spin" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          style={{
                            width: 2,
                            minHeight: 46,
                            height: '100%',
                            background: m.isCompleted
                              ? '#10b981'
                              : m.isCurrentActive
                              ? 'linear-gradient(to bottom, #0284c7, #e2e8f0)'
                              : '#e2e8f0',
                            marginTop: 4,
                            marginBottom: 4,
                            borderRadius: '1px',
                          }}
                        />
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div
                      className="tat-modal-card"
                      style={{
                        flex: 1,
                        background: m.isCurrentActive ? '#f0f9ff' : '#ffffff',
                        border: m.isCurrentActive ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: m.isCompleted ? '#0f172a' : m.isCurrentActive ? '#0369a1' : '#64748b',
                            }}
                          >
                            {m.label}
                          </span>

                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 500,
                            }}
                          >
                            {m.role}
                          </span>
                        </div>

                        {/* Status & Timing Pill */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {m.durationFromPrev && (
                            <span
                              title="Turnaround time from previous milestone"
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid #bfdbfe',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <i className="fa fa-clock-o" />
                              +{m.durationFromPrev}
                            </span>
                          )}

                          {m.isCompleted ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <i className="fa fa-check" style={{ fontSize: '10px' }} />
                              Completed
                            </span>
                          ) : m.isCurrentActive ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #7dd3fc',
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: '#0284c7',
                                }}
                              />
                              Current Stage
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: '#94a3b8',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#f1f5f9',
                              }}
                            >
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
                        {m.description}
                      </div>

                      {/* Bottom Metadata: Timestamp & Performer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 4,
                          paddingTop: 6,
                          borderTop: '1px solid #f1f5f9',
                          fontSize: '12px',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        <div>
                          {m.isCompleted && m.date ? (
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>
                              <i className="fa fa-calendar-check-o" style={{ marginRight: 6, color: '#10b981' }} />
                              {formatTimeFormatted(m.date)}
                              <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
                                ({formatRelativeTime(m.date)})
                              </span>
                            </span>
                          ) : m.isCurrentActive ? (
                            <span style={{ color: '#0284c7', fontWeight: 500 }}>
                              <i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />
                              Awaiting laboratory action to complete milestone
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>
                              <i className="fa fa-clock-o" style={{ marginRight: 6 }} />
                              Workflow step queued
                            </span>
                          )}
                        </div>

                        {m.performer && (
                          <div style={{ color: '#475569', fontSize: '11.5px' }}>
                            <span style={{ color: '#94a3b8', marginRight: 4 }}>By:</span>
                            <span style={{ fontWeight: 600 }}>{m.performer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4B. AUDIT LOG TABLE VIEW
          ───────────────────────────────────────────────────────────── */}
          {viewMode === 'table' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '12.5px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 700,
                    }}
                  >
                    <th style={{ padding: '12px 16px', width: '60px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>Milestone Event</th>
                    <th style={{ padding: '12px 16px', width: '130px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Recorded Timestamp</th>
                    <th style={{ padding: '12px 16px', width: '120px' }}>Interval TAT</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Personnel / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {milestoneData.milestones.map((m, idx) => {
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        }}
                      >
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: m.isCompleted
                                ? '#ecfdf5'
                                : m.isCurrentActive
                                ? '#e0f2fe'
                                : '#f1f5f9',
                              color: m.isCompleted
                                ? '#059669'
                                : m.isCurrentActive
                                ? '#0284c7'
                                : '#94a3b8',
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className={`fa ${m.icon}`} style={{ color: '#64748b', fontSize: '13px' }} />
                            <div>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{m.label}</span>
                              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{m.role}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {m.isCompleted ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <i className="fa fa-check" style={{ fontSize: '9px' }} />
                              Completed
                            </span>
                          ) : m.isCurrentActive ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #7dd3fc',
                              }}
                            >
                              In Progress
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>Pending</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {m.isCompleted && m.date ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatTimeFormatted(m.date)}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatRelativeTime(m.date)}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {m.durationFromPrev ? (
                            <span
                              style={{
                                fontFamily: typography.fontFamilyMono,
                                fontWeight: 600,
                                color: '#0284c7',
                                fontSize: '12px',
                              }}
                            >
                              +{m.durationFromPrev}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {m.performer || m.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4C. ALL ORDER TESTS OVERVIEW (Replaces the legacy clipped table)
          ───────────────────────────────────────────────────────────── */}
          {viewMode === 'allTests' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '12.5px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 700,
                    }}
                  >
                    <th style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>Investigation / Test Name</th>
                    <th style={{ padding: '12px 16px', width: '130px' }}>Current Status</th>
                    <th style={{ padding: '12px 16px' }}>Ordered Date</th>
                    <th style={{ padding: '12px 16px' }}>Accepted Date</th>
                    <th style={{ padding: '12px 16px' }}>Sample Collected</th>
                    <th style={{ padding: '12px 16px' }}>Tech / Med Verified</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordertatList.map((item, idx) => {
                    const isSelected = idx === safeIndex;
                    const tStatus = getTestStatusMeta(item);
                    const name = item.TestName || item.PatientOrderDetail?.TestName || `Test #${idx + 1}`;
                    const orderDate = item.OrderedOn || item.PatientOrder?.OrderRequestDate;
                    const acceptedDate = item.AcceptedOn;
                    const sampleDate = item.SampleCollectedOn;
                    const verifiedDate = item.MedValidationOn || item.TechValidationOn || item.PatientWorkorder?.MedValidationdate || item.PatientWorkorder?.TechValidationdate;

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isSelected ? '#0284c7' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#64748b',
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{name}</div>
                          {item.PatientWorkorder?.WorkOrderId && (
                            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              WO: {item.PatientWorkorder.WorkOrderId}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: tStatus.bg,
                              color: tStatus.color,
                              border: `1px solid ${tStatus.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: tStatus.dot,
                              }}
                            />
                            {tStatus.label}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {orderDate ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatTimeFormatted(orderDate)}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                By: {item.PatientOrder?.CreatedUser?.FirstName || 'Staff'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {acceptedDate ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatTimeFormatted(acceptedDate)}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                By: {item.CreatedUser?.FirstName || item.PatientWorkorder?.CreatedUser?.FirstName || 'Lab Reception'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {sampleDate ? (
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatTimeFormatted(sampleDate)}</div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }}>Pending</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {verifiedDate ? (
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatTimeFormatted(verifiedDate)}</div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }}>Pending</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTestIndex(idx);
                              setViewMode('timeline');
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#0284c7',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fa fa-history" />
                            Timeline
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: '#64748b' }}>
          <i className="fa fa-info-circle" style={{ color: '#0284c7' }} />
          <span>
            LIS Turnaround Time is tracked automatically from clinical order submission to report release.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => dispatch('close')}
            style={{
              padding: '7px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
