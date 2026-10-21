import React, { useState, useMemo, useEffect, useRef } from 'react';
import moment from 'moment';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

// --- Types & Interfaces ---

export interface LookupUserItem {
  Id: number;
  FirstName?: string;
  LastName?: string;
  Text?: string;
  Title?: { Description?: string };
  [key: string]: any;
}

export interface LookupOptionItem {
  Id: number | string;
  Text?: string;
  Description?: string;
  [key: string]: any;
}

export interface AnalyteReferenceMaster {
  GenderId?: number;
  Agefrom?: number;
  Ageto?: number;
  MinValue?: number;
  MaxValue?: number;
  Refvalue?: string;
  [key: string]: any;
}

export interface AnalyteDetailItem {
  Id: number;
  Testid?: number;
  Testname?: string;
  Analyteid?: number;
  Analytename?: string;
  AnalyteCode?: string;
  Resultvalue?: string;
  TestValueType?: number; // 1: Free Text, 2: Ordinal, 3: Narrative/Rich, 4: Multiline, 5: Quantitative, 7: Computed
  AnalyteUOM?: string;
  Analyterange?: string;
  Qualifier?: string;
  QualifierId?: number;
  IsCriticalValue?: boolean;
  IsPrinted?: boolean;
  AttachmentsCount?: number;
  Status?: number;
  IsSelected?: boolean;
  IsAllOrderSelected?: boolean;
  ParameterObservation?: string;
  TestObservation?: string;
  WorkOrderDetailStatus?: { DisplayName?: string };
  Analyte?: {
    Code?: string;
    Listofvalue?: string;
    Formula?: string;
    Analyterefmasters?: AnalyteReferenceMaster[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface TestGroupItem {
  Testid: number;
  Testname: string;
  ProfileName?: string;
  RootProfileName?: string;
  IsNABLTest?: boolean;
  IsSelected?: boolean;
  IsAllOrderSelected?: boolean;
  details: AnalyteDetailItem[];
  [key: string]: any;
}

export interface WorkOrderHeaderData {
  Id?: number;
  WorkOrderdid?: string;
  WorkOrderStatusId?: number;
  WorkOrderStatus?: { DisplayName?: string; [key: string]: any };
  TestTypeId?: number;
  PatientId?: number;
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Title?: { Description?: string };
    Age?: number;
    Gender?: { Description?: string };
    GenderId?: number;
    DOB?: string;
    AgeInDays?: number;
    [key: string]: any;
  };
  Encounter?: {
    Id?: number;
    VisitIdentifier?: string;
    WardMaster?: { WardName?: string };
    WardRoomMaster?: { RoomNo?: string };
    WardRoomBedMaster?: { BedNo?: string };
    [key: string]: any;
  };
  PatientOrder?: {
    Id?: number;
    OrderNumber?: string;
    BillNumber?: string;
    Doctor?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  TechValidationById?: number;
  TechValidationByName?: string;
  TechValidationdate?: string | null;
  Approvedbyid?: number;
  Approvedbyname?: string;
  ApprovalSubmisdate?: string | null;
  Ordereddate?: string | null;
  ResultEntered?: string;
  ResultApproved?: string;
  OverallDue?: number;
  PrintableComments?: string;
  NonPrintableComments?: string;
  WithHeader?: boolean;
  WithoutHeader?: boolean;
  IsCulture?: boolean;
  SpecimenId?: number;
  BlockId?: number;
  ResultTypeId?: number;
  IsCompleted?: boolean;
  IsApproved?: boolean;
  [key: string]: any;
}

export interface AttachmentImageItem {
  Id: number;
  WODId?: number;
  filename: string;
  filepath: string;
  ImgEncData?: string;
  [key: string]: any;
}

export interface ResultEntryFormScreenProps {
  reactProps?: {
    item?: WorkOrderHeaderData;
    testList?: TestGroupItem[];
    lookup?: {
      User?: LookupUserItem[];
      LabTechnician?: LookupUserItem[];
      RadiologyTechnician?: LookupUserItem[];
      LabIncharge?: LookupUserItem[];
      RadiologyIncharge?: LookupUserItem[];
      Specimen?: LookupOptionItem[];
      ResultBlock?: LookupOptionItem[];
      ResultType?: LookupOptionItem[];
      Qualifier?: LookupOptionItem[];
      [key: string]: any;
    };
    AttachementImgs?: AttachmentImageItem[];
    PackageName?: string;
    isFromApproval?: boolean;
    isLoading?: boolean;
    permissions?: {
      canApprove?: boolean;
      canSave?: boolean;
      canReject?: boolean;
      canSendForApproval?: boolean;
      canPrint?: boolean;
      canPrintWithoutHeader?: boolean;
      canDisableApproveReject?: boolean;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// --- Helper Functions ---

function formatDateTime(val?: string | null): string {
  if (!val) return '—';
  const m = moment(val);
  return m.isValid() ? m.format('DD-MMM-YYYY, hh:mm A') : String(val);
}

function formatDateInput(val?: string | null): string {
  if (!val) return '';
  const m = moment(val);
  return m.isValid() ? m.format('YYYY-MM-DDTHH:mm') : '';
}

function getStatusBadge(statusId?: number, statusName?: string) {
  const sid = Number(statusId);
  switch (sid) {
    case 1:
      return { label: statusName || 'Created / In-Progress', bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: 'fa-clock-o' };
    case 3:
      return { label: statusName || 'Partially Completed', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'fa-hourglass-half' };
    case 4:
      return { label: statusName || 'Completed', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', icon: 'fa-check' };
    case 5:
      return { label: statusName || 'Sent for Approval', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe', icon: 'fa-paper-plane' };
    case 6:
      return { label: statusName || 'Rejected', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', icon: 'fa-times-circle' };
    case 7:
      return { label: statusName || 'Approved & Released', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: 'fa-shield' };
    case 9:
      return { label: statusName || 'Partially Approved', bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', icon: 'fa-check-circle-o' };
    default:
      return { label: statusName || 'Active', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: 'fa-circle' };
  }
}

// Compute Qualifier (Normal, High, Low, Critical) based on numeric value & ref range
function evaluateQualifier(valStr?: string, refMasters?: AnalyteReferenceMaster[]): { qualifier: string; qualifierId: number } {
  if (!valStr || !refMasters || refMasters.length === 0) {
    return { qualifier: 'Normal', qualifierId: 1 };
  }
  const cleanVal = parseFloat(valStr.trim().replace(/,/g, ''));
  if (isNaN(cleanVal)) {
    return { qualifier: 'Normal', qualifierId: 1 };
  }
  const ref = refMasters[0];
  if (ref.MinValue !== undefined && ref.MaxValue !== undefined) {
    if (cleanVal < ref.MinValue) {
      return { qualifier: 'Low', qualifierId: 2 };
    } else if (cleanVal > ref.MaxValue) {
      return { qualifier: 'High', qualifierId: 3 };
    }
  }
  return { qualifier: 'Normal', qualifierId: 1 };
}

// --- Main Component ---

export const ResultEntryFormScreen: React.FC<ResultEntryFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const item = reactProps?.item || {};
  const testListProp = reactProps?.testList || [];
  const lookup = reactProps?.lookup || {};
  const attachments = reactProps?.AttachementImgs || [];
  const permissions = reactProps?.permissions || {};
  const isFromApproval = !!reactProps?.isFromApproval;
  const isLoading = !!reactProps?.isLoading;
  const packageName = reactProps?.PackageName || '';

  // Local state for live filtering and parameter interaction
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'critical' | 'pending'>('all');
  const [showAttachmentsDrawer, setShowAttachmentsDrawer] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<AttachmentImageItem | null>(null);

  // Local state for header inputs
  const [printableComments, setPrintableComments] = useState(item.PrintableComments || '');
  const [nonPrintableComments, setNonPrintableComments] = useState(item.NonPrintableComments || '');
  const [techValidationById, setTechValidationById] = useState<number | undefined>(item.TechValidationById);
  const [approvedbyid, setApprovedbyid] = useState<number | undefined>(item.Approvedbyid);
  const [techValidationDate, setTechValidationDate] = useState<string>(formatDateInput(item.TechValidationdate));
  const [approvalDate, setApprovalDate] = useState<string>(formatDateInput(item.ApprovalSubmisdate));
  const [withHeader, setWithHeader] = useState<boolean>(item.WithHeader !== false);
  const [withoutHeader, setWithoutHeader] = useState<boolean>(!!item.WithoutHeader);
  const [isCompleted, setIsCompleted] = useState<boolean>(!!item.IsCompleted);
  const [isApproved, setIsApproved] = useState<boolean>(!!item.IsApproved);

  // Synchronize local form inputs when item updates from parent
  useEffect(() => {
    if (item.PrintableComments !== undefined) setPrintableComments(item.PrintableComments || '');
    if (item.NonPrintableComments !== undefined) setNonPrintableComments(item.NonPrintableComments || '');
    if (item.TechValidationById !== undefined) setTechValidationById(item.TechValidationById);
    if (item.Approvedbyid !== undefined) setApprovedbyid(item.Approvedbyid);
    if (item.TechValidationdate !== undefined) setTechValidationDate(formatDateInput(item.TechValidationdate));
    if (item.ApprovalSubmisdate !== undefined) setApprovalDate(formatDateInput(item.ApprovalSubmisdate));
    if (item.WithHeader !== undefined) setWithHeader(item.WithHeader !== false);
    if (item.WithoutHeader !== undefined) setWithoutHeader(!!item.WithoutHeader);
    if (item.IsCompleted !== undefined) setIsCompleted(!!item.IsCompleted);
    if (item.IsApproved !== undefined) setIsApproved(!!item.IsApproved);
  }, [
    item.PrintableComments,
    item.NonPrintableComments,
    item.TechValidationById,
    item.Approvedbyid,
    item.TechValidationdate,
    item.ApprovalSubmisdate,
    item.WithHeader,
    item.WithoutHeader,
    item.IsCompleted,
    item.IsApproved,
  ]);

  // Technicians and In-charge lists
  const techniciansList: LookupUserItem[] = useMemo(() => {
    return lookup.LabTechnician?.length ? lookup.LabTechnician : (lookup.User || []);
  }, [lookup.LabTechnician, lookup.User]);

  const approversList: LookupUserItem[] = useMemo(() => {
    return lookup.LabIncharge?.length ? lookup.LabIncharge : (lookup.User || []);
  }, [lookup.LabIncharge, lookup.User]);

  // Patient & Encounter metadata
  const patient = item.Patient || {};
  const patientName = [
    patient.Title?.Description,
    patient.FirstName,
    patient.MiddleName,
    patient.LastName,
  ].filter(Boolean).join(' ') || 'Unknown Patient';

  const patientMrn = patient.MRN || '—';
  const patientAgeGender = [
    patient.Age ? `${patient.Age} Yrs` : null,
    patient.Gender?.Description || null,
  ].filter(Boolean).join(' • ') || '—';

  const encounter = item.Encounter || {};
  const visitId = encounter.VisitIdentifier || '—';
  const wardLocation = [
    encounter.WardMaster?.WardName,
    encounter.WardRoomMaster?.RoomNo ? `Rm ${encounter.WardRoomMaster.RoomNo}` : null,
    encounter.WardRoomBedMaster?.BedNo ? `Bed ${encounter.WardRoomBedMaster.BedNo}` : null,
  ].filter(Boolean).join(' / ') || 'OPD / General';

  const doctorName = [
    item.PatientOrder?.Doctor?.Title?.Description,
    item.PatientOrder?.Doctor?.FirstName,
    item.PatientOrder?.Doctor?.LastName,
  ].filter(Boolean).join(' ') || 'Referring Consultant';

  const orderNumber = item.PatientOrder?.OrderNumber || '—';
  const billNumber = item.PatientOrder?.BillNumber || '—';
  const workOrderDid = item.WorkOrderdid || (item.Id ? `WO-${item.Id}` : '—');
  const overallDue = Number(item.OverallDue || 0);

  const statusBadge = getStatusBadge(item.WorkOrderStatusId, item.WorkOrderStatus?.DisplayName);

  // Work Order Approval Status:
  // Status 7 = Approved (Fully Approved)
  // Status 8 = Released (Fully Approved)
  // Status 9 = Partially Approved
  const workOrderStatusId = Number(item.WorkOrderStatusId);
  const isFullyApproved = workOrderStatusId === 7 || workOrderStatusId === 8;
  const isPartiallyApproved = workOrderStatusId === 9;

  // Approval button visibility:
  // - Once fully approved (Status 7: Approved, Status 8: Released), do NOT show the approval button
  // - If partially approved (Status 9: Partially Approved), NEED to show the approval button
  // - Otherwise (in-progress / completed / sent for approval), show unless explicitly disabled by permissions
  const canShowApproveButton = useMemo(() => {
    if (permissions.canApprove === false) return false;
    if (isFullyApproved) return false;
    if (isPartiallyApproved) return true;
    return !permissions.canDisableApproveReject;
  }, [isFullyApproved, isPartiallyApproved, permissions.canApprove, permissions.canDisableApproveReject]);

  // Local state for live test list and results interaction
  const [localTestList, setLocalTestList] = useState<TestGroupItem[]>(() => testListProp || []);
  const prevTestListPropRef = useRef(testListProp);
  const prevWorkOrderIdRef = useRef(item.Id);

  useEffect(() => {
    if (
      item.Id !== prevWorkOrderIdRef.current ||
      (testListProp && testListProp.length > 0 && (testListProp !== prevTestListPropRef.current || localTestList.length === 0))
    ) {
      prevWorkOrderIdRef.current = item.Id;
      prevTestListPropRef.current = testListProp;
      setLocalTestList(testListProp);
    }
  }, [testListProp, item.Id, localTestList.length]);

  // Compute test groups statistics
  const totalParameters = useMemo(() => {
    let count = 0;
    localTestList.forEach(tg => {
      count += (tg.details || []).filter(d => d.Status === 1).length;
    });
    return count;
  }, [localTestList]);

  const filledParameters = useMemo(() => {
    let count = 0;
    localTestList.forEach(tg => {
      (tg.details || []).forEach(d => {
        if (d.Status === 1 && d.Resultvalue && String(d.Resultvalue).trim().length > 0) {
          count++;
        }
      });
    });
    return count;
  }, [localTestList]);

  const criticalParameters = useMemo(() => {
    let count = 0;
    localTestList.forEach(tg => {
      (tg.details || []).forEach(d => {
        if (d.Status === 1 && d.IsCriticalValue) count++;
      });
    });
    return count;
  }, [localTestList]);

  // Filtered test groups and details
  const filteredTestGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return localTestList
      .map(group => {
        const matchingDetails = (group.details || []).filter(detail => {
          if (detail.Status !== 1) return false;

          // Search query check
          if (q) {
            const nameMatch = (detail.Analytename || '').toLowerCase().includes(q);
            const codeMatch = (detail.AnalyteCode || '').toLowerCase().includes(q);
            const testMatch = (group.Testname || '').toLowerCase().includes(q);
            const profileMatch = (group.ProfileName || '').toLowerCase().includes(q);
            if (!nameMatch && !codeMatch && !testMatch && !profileMatch) return false;
          }

          // Filter mode check
          if (filterMode === 'critical') {
            return !!detail.IsCriticalValue;
          }
          if (filterMode === 'flagged') {
            const qual = (detail.Qualifier || '').toLowerCase();
            return qual.includes('high') || qual.includes('low') || !!detail.IsCriticalValue;
          }
          if (filterMode === 'pending') {
            return !detail.Resultvalue || String(detail.Resultvalue).trim().length === 0;
          }

          return true;
        });

        return {
          ...group,
          matchingDetails,
        };
      })
      .filter(group => group.matchingDetails.length > 0);
  }, [localTestList, searchQuery, filterMode]);

  // Master selection state
  const isAllMasterSelected = useMemo(() => {
    if (filteredTestGroups.length === 0) return false;
    return filteredTestGroups.every(g =>
      g.matchingDetails.every(d => !!d.IsAllOrderSelected)
    );
  }, [filteredTestGroups]);

  // Handle result value change in an analyte row
  const handleValueChange = (detail: AnalyteDetailItem, newValue: string) => {
    const refMasters = detail.Analyte?.Analyterefmasters;
    const { qualifier, qualifierId } = evaluateQualifier(newValue, refMasters);

    setLocalTestList(prevList =>
      prevList.map(group => {
        if (group.Testid !== detail.Testid) return group;
        return {
          ...group,
          IsSelected: true,
          IsAllOrderSelected: true,
          details: (group.details || []).map(d => {
            if (d.Id !== detail.Id) return d;
            return {
              ...d,
              Resultvalue: newValue,
              Qualifier: qualifier,
              QualifierId: qualifierId,
              IsSelected: true,
              IsAllOrderSelected: true,
            };
          }),
        };
      })
    );

    dispatch('updateDetailValue', {
      detailId: detail.Id,
      testId: detail.Testid,
      value: newValue,
      qualifier,
      qualifierId,
    });
  };

  // Handle critical value toggle
  const handleCriticalToggle = (detail: AnalyteDetailItem) => {
    const nextCrit = !detail.IsCriticalValue;
    setLocalTestList(prevList =>
      prevList.map(group => {
        if (group.Testid !== detail.Testid) return group;
        return {
          ...group,
          details: (group.details || []).map(d => {
            if (d.Id !== detail.Id) return d;
            return {
              ...d,
              IsCriticalValue: nextCrit,
            };
          }),
        };
      })
    );

    dispatch('updateDetailCritical', {
      detailId: detail.Id,
      isCritical: nextCrit,
    });
  };

  const handleToggleSelectAll = (isSelected: boolean) => {
    setLocalTestList(prevList =>
      prevList.map(group => ({
        ...group,
        IsSelected: isSelected,
        IsAllOrderSelected: isSelected,
        details: (group.details || []).map(d => ({
          ...d,
          IsSelected: isSelected,
          IsAllOrderSelected: isSelected,
        })),
      }))
    );
    dispatch('toggleSelectAll', { isSelected });
  };

  const handleToggleTestSelect = (testId: number, isSelected: boolean) => {
    setLocalTestList(prevList =>
      prevList.map(group => {
        if (group.Testid !== testId) return group;
        return {
          ...group,
          IsSelected: isSelected,
          IsAllOrderSelected: isSelected,
          details: (group.details || []).map(d => ({
            ...d,
            IsSelected: isSelected,
            IsAllOrderSelected: isSelected,
          })),
        };
      })
    );
    dispatch('toggleTestSelect', { testId, isSelected });
  };

  const handleToggleItemSelect = (testId: number | undefined, detailId: number, isSelected: boolean) => {
    setLocalTestList(prevList =>
      prevList.map(group => {
        if (testId && group.Testid !== testId) return group;
        const hasDetail = (group.details || []).some(d => d.Id === detailId);
        if (!hasDetail) return group;

        const updatedDetails = (group.details || []).map(d => {
          if (d.Id !== detailId) return d;
          return {
            ...d,
            IsSelected: isSelected,
            IsAllOrderSelected: isSelected,
          };
        });
        const anySelected = updatedDetails.some(d => d.IsSelected);
        return {
          ...group,
          IsSelected: anySelected,
          IsAllOrderSelected: updatedDetails.every(d => d.IsAllOrderSelected),
          details: updatedDetails,
        };
      })
    );
    dispatch('toggleItemSelect', { detailId, isSelected });
  };

  // Header change handlers
  const handleHeaderFieldChange = (field: string, value: any) => {
    dispatch('updateHeaderField', { field, value });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#f8fafc',
        fontFamily: typography.fontFamily.sans,
        color: colors.textBody,
      }}
    >
      {/* ─── 1. TOP HEADER APP BAR ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => dispatch('back')}
            title="Return to Order Process Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <i className="fa fa-arrow-left" style={{ fontSize: '14px' }} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#0284c7',
                  backgroundColor: '#f0f9ff',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #bae6fd',
                }}
              >
                LIS Diagnostic Workstation
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                }}
              >
                Case DID: <strong style={{ color: '#0f172a' }}>{workOrderDid}</strong>
              </span>
            </div>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '2px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Result Entry & Validation
              {packageName && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  <i className="fa fa-cubes" style={{ marginRight: '4px' }} />
                  {packageName}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Header Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: radii.full,
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
            }}
          >
            <i className={`fa ${statusBadge.icon}`} />
            {statusBadge.label}
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />

          {/* Clinical Test Details Button */}
          <button
            onClick={() => dispatch('openLabtests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: radii.md,
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <i className="fa fa-list-alt" style={{ color: '#0284c7' }} />
            Test Details
          </button>

          {/* Previous Results Button */}
          <button
            onClick={() => dispatch('openLabResults')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: radii.md,
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <i className="fa fa-history" style={{ color: '#0d9488' }} />
            Lab History
          </button>

          {/* TAT Timeline Modal Button */}
          <button
            onClick={() => dispatch('testtat', item)}
            title="View Turnaround Time Milestones"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: radii.md,
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
          >
            <i className="fa fa-clock-o" />
            TAT Milestones
          </button>

          {/* Attachments Button */}
          <button
            onClick={() => setShowAttachmentsDrawer(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: radii.md,
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: attachments.length > 0 ? '#fef3c7' : '#ffffff',
              color: attachments.length > 0 ? '#92400e' : '#334155',
              border: `1px solid ${attachments.length > 0 ? '#fde68a' : '#cbd5e1'}`,
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
          >
            <i className="fa fa-paperclip" />
            Attachments ({attachments.length})
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ─── 2. PATIENT & ENCOUNTER CLINICAL BANNER ──────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1.2fr 1.4fr',
            gap: '18px',
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            padding: '18px 22px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          {/* Col 1: Patient Identity */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                border: '2px solid #bfdbfe',
                flexShrink: 0,
              }}
            >
              {patient.FirstName ? patient.FirstName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {patientName}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: typography.fontFamily.mono,
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    padding: '1px 6px',
                    borderRadius: radii.sm,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  MRN: {patientMrn}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '5px',
                  fontSize: '12.5px',
                  color: '#475569',
                }}
              >
                <span>
                  <i className="fa fa-user" style={{ marginRight: '4px', color: '#94a3b8' }} />
                  {patientAgeGender}
                </span>
                <span>•</span>
                <span>
                  <i className="fa fa-id-badge" style={{ marginRight: '4px', color: '#94a3b8' }} />
                  Visit: <strong>{visitId}</strong>
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  backgroundColor: '#f8fafc',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                }}
              >
                <i className="fa fa-bed" />
                {wardLocation}
              </div>
            </div>
          </div>

          {/* Col 2: Order & Consultant Details */}
          <div
            style={{
              borderLeft: '1px solid #f1f5f9',
              borderRight: '1px solid #f1f5f9',
              paddingLeft: '16px',
              paddingRight: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', minWidth: '85px' }}>Referring Dr:</span>
              <strong style={{ color: '#0f172a' }}>{doctorName}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', minWidth: '85px' }}>Order / Bill:</span>
              <span style={{ fontFamily: typography.fontFamily.mono, color: '#1e293b' }}>
                #{orderNumber} / #{billNumber}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <span style={{ color: '#64748b', minWidth: '85px' }}>Ordered On:</span>
              <span style={{ color: '#475569' }}>{formatDateTime(item.Ordereddate)}</span>
            </div>

            {overallDue > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#b91c1c',
                  backgroundColor: '#fef2f2',
                  padding: '2px 8px',
                  borderRadius: radii.sm,
                  border: '1px solid #fecaca',
                  width: 'fit-content',
                }}
              >
                <i className="fa fa-exclamation-triangle" />
                Patient Outstanding Due: ₹{overallDue.toFixed(2)}
              </div>
            )}
          </div>

          {/* Col 3: Laboratory Personnel Signatures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Technician Select */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '3px',
                }}
              >
                <span>Lab Technician</span>
                <span style={{ color: '#94a3b8' }}>Entered: {formatDateTime(item.TechValidationdate)}</span>
              </div>
              <select
                value={techValidationById || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setTechValidationById(val);
                  handleHeaderFieldChange('TechValidationById', val);
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                }}
              >
                <option value="">Select Technician...</option>
                {techniciansList.map(u => (
                  <option key={u.Id} value={u.Id}>
                    {[u.Title?.Description, u.FirstName, u.LastName].filter(Boolean).join(' ') || u.Text || `User #${u.Id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Approving In-charge Select */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '3px',
                }}
              >
                <span>Result Approver (Pathologist)</span>
                {item.ApprovalSubmisdate && (
                  <span style={{ color: '#059669' }}>
                    <i className="fa fa-check" style={{ marginRight: '3px' }} />
                    {formatDateTime(item.ApprovalSubmisdate)}
                  </span>
                )}
              </div>
              <select
                value={approvedbyid || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setApprovedbyid(val);
                  handleHeaderFieldChange('Approvedbyid', val);
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                }}
              >
                <option value="">Select Approver / In-Charge...</option>
                {approversList.map(u => (
                  <option key={u.Id} value={u.Id}>
                    {[u.Title?.Description, u.FirstName, u.LastName].filter(Boolean).join(' ') || u.Text || `User #${u.Id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── 3. SEARCH & PROGRESS METRIC BAR ────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            backgroundColor: '#ffffff',
            padding: '12px 18px',
            borderRadius: radii.lg,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px' }}>
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
              placeholder="Search parameter, test or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '12.5px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-times" />
              </button>
            )}
          </div>

          {/* Quick Filter Segmented Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: radii.md,
              padding: '3px',
              gap: '2px',
            }}
          >
            {[
              { id: 'all', label: `All (${totalParameters})` },
              { id: 'pending', label: `Pending (${totalParameters - filledParameters})` },
              { id: 'flagged', label: 'Flagged / Abnormal' },
              { id: 'critical', label: `Critical (${criticalParameters})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: filterMode === f.id ? '#ffffff' : 'transparent',
                  color: filterMode === f.id ? '#0f172a' : '#64748b',
                  boxShadow: filterMode === f.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Metrics summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>
              Progress:{' '}
              <strong style={{ color: '#0f172a' }}>
                {filledParameters} / {totalParameters}
              </strong>{' '}
              ({totalParameters > 0 ? Math.round((filledParameters / totalParameters) * 100) : 0}%)
            </span>
            <div
              style={{
                width: '100px',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${totalParameters > 0 ? (filledParameters / totalParameters) * 100 : 0}%`,
                  backgroundColor: filledParameters === totalParameters ? '#10b981' : '#0284c7',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── 4. DIAGNOSTIC PARAMETERS & RESULTS TABLE ───────────────────── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
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
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                <th style={{ padding: '12px 16px', width: '38px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllMasterSelected}
                    onChange={e => handleToggleSelectAll(e.target.checked)}
                    title="Select / Deselect all parameters"
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', width: '28%' }}>Diagnostic Test / Analyte Parameter</th>
                <th style={{ padding: '12px 16px', width: '24%' }}>
                  Observation Result Value <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ padding: '12px 16px', width: '9%' }}>UOM</th>
                <th style={{ padding: '12px 16px', width: '16%' }}>Biological Ref Range</th>
                <th style={{ padding: '12px 16px', width: '10%' }}>Clinical Flag</th>
                <th style={{ padding: '12px 14px', width: '8%', textAlign: 'center' }}>Critical</th>
                <th style={{ padding: '12px 16px', width: '10%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTestGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <i className="fa fa-folder-open-o" style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      No matching diagnostic parameters found
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Try adjusting the search query or selecting a different filter chip.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTestGroups.map(group => {
                  const isGroupSelected = group.matchingDetails.every(d => !!d.IsAllOrderSelected);

                  return (
                    <React.Fragment key={group.Testid}>
                      {/* Root Profile Header (if applicable) */}
                      {group.RootProfileName && (
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <td
                            colSpan={8}
                            style={{
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#334155',
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                              borderTop: '1px solid #e2e8f0',
                            }}
                          >
                            <i className="fa fa-folder" style={{ marginRight: '6px', color: '#64748b' }} />
                            {group.RootProfileName}
                          </td>
                        </tr>
                      )}

                      {/* Profile Name Header (if applicable) */}
                      {group.ProfileName && group.ProfileName !== group.RootProfileName && (
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td
                            colSpan={8}
                            style={{
                              padding: '6px 20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0284c7',
                              borderTop: '1px solid #e2e8f0',
                            }}
                          >
                            <i className="fa fa-tag" style={{ marginRight: '6px' }} />
                            {group.ProfileName}
                          </td>
                        </tr>
                      )}

                      {/* Test Group Header Banner */}
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ padding: '9px 16px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isGroupSelected}
                            onChange={e => handleToggleTestSelect(group.Testid, e.target.checked)}
                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                          />
                        </td>
                        <td
                          colSpan={7}
                          style={{
                            padding: '9px 12px',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '13.5px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              onClick={() => dispatch('testprofiledetails', group.Testid)}
                              style={{
                                cursor: 'pointer',
                                color: '#0369a1',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#0369a1')}
                              title="Click to view test profile master"
                            >
                              {group.Testname}
                            </span>
                            {group.IsNABLTest && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <i className="fa fa-certificate" />
                                NABL Accredited
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Parameter / Analyte Rows */}
                      {group.matchingDetails.map(detail => {
                        const isRowCritical = !!detail.IsCriticalValue;
                        const qual = (detail.Qualifier || '').toLowerCase();
                        const isHigh = qual.includes('high');
                        const isLow = qual.includes('low');

                        // Multiline values options list if Type === 4
                        const multilineOptions = detail.Analyte?.Listofvalue
                          ? detail.Analyte.Listofvalue.split(',').map(s => s.trim()).filter(Boolean)
                          : [];

                        return (
                          <tr
                            key={detail.Id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: isRowCritical ? '#fef2f2' : '#ffffff',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseEnter={e => {
                              if (!isRowCritical) e.currentTarget.style.backgroundColor = '#f8fafc';
                            }}
                            onMouseLeave={e => {
                              if (!isRowCritical) e.currentTarget.style.backgroundColor = '#ffffff';
                            }}
                          >
                            {/* Selection Checkbox */}
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!detail.IsAllOrderSelected}
                                onChange={e => handleToggleItemSelect(group.Testid, detail.Id, e.target.checked)}
                                style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                              />
                            </td>

                            {/* Parameter Name */}
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  onClick={() => dispatch('analyteprofiledetails', detail.Analyteid)}
                                  style={{
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    cursor: 'pointer',
                                    transition: 'color 0.15s',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                                  onMouseLeave={e => (e.currentTarget.style.color = '#1e293b')}
                                  title="Click to view analyte reference master"
                                >
                                  {detail.Analytename}
                                </span>
                                {detail.AnalyteCode && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      fontFamily: typography.fontFamily.mono,
                                      color: '#94a3b8',
                                    }}
                                  >
                                    [{detail.AnalyteCode}]
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Result Value Input */}
                            <td style={{ padding: '8px 16px' }}>
                              {/* Type 1: Free text / Notes */}
                              {detail.TestValueType === 1 && (
                                <textarea
                                  rows={2}
                                  value={detail.Resultvalue || ''}
                                  onChange={e => handleValueChange(detail, e.target.value)}
                                  placeholder="Enter observations..."
                                  style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    borderRadius: radii.sm,
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                  }}
                                />
                              )}

                              {/* Type 4: Multiline Dropdown */}
                              {detail.TestValueType === 4 && (
                                <select
                                  value={detail.Resultvalue || ''}
                                  onChange={e => handleValueChange(detail, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    borderRadius: radii.sm,
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <option value="">Select Result Value...</option>
                                  {multilineOptions.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Type 3: Narrative / Rich Text */}
                              {detail.TestValueType === 3 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="text"
                                    value={detail.Resultvalue || ''}
                                    onChange={e => handleValueChange(detail, e.target.value)}
                                    placeholder="Enter summary..."
                                    style={{
                                      flex: 1,
                                      padding: '6px 10px',
                                      fontSize: '12.5px',
                                      borderRadius: radii.sm,
                                      border: '1px solid #cbd5e1',
                                      outline: 'none',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => dispatch('openRichTextEditor', detail)}
                                    title="Open Rich Text Narrative Editor"
                                    style={{
                                      padding: '5px 8px',
                                      fontSize: '11px',
                                      backgroundColor: '#f1f5f9',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: radii.sm,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <i className="fa fa-edit" />
                                  </button>
                                </div>
                              )}

                              {/* Type 7: Auto Calculated */}
                              {detail.TestValueType === 7 && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#f8fafc',
                                    padding: '5px 10px',
                                    borderRadius: radii.sm,
                                    border: '1px dashed #cbd5e1',
                                  }}
                                >
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1' }}>
                                    ƒx
                                  </span>
                                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                                    {detail.Resultvalue || '—'}
                                  </strong>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>
                                    Computed
                                  </span>
                                </div>
                              )}

                              {/* Default / Type 5: Quantitative Numeric / Ordinal */}
                              {detail.TestValueType !== 1 &&
                                detail.TestValueType !== 3 &&
                                detail.TestValueType !== 4 &&
                                detail.TestValueType !== 7 && (
                                  <input
                                    type="text"
                                    value={detail.Resultvalue || ''}
                                    onChange={e => handleValueChange(detail, e.target.value)}
                                    placeholder="Enter result..."
                                    style={{
                                      width: '100%',
                                      maxWidth: '170px',
                                      padding: '6px 10px',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      borderRadius: radii.sm,
                                      border: isRowCritical
                                        ? '1.5px solid #ef4444'
                                        : isHigh
                                        ? '1.5px solid #f59e0b'
                                        : isLow
                                        ? '1.5px solid #3b82f6'
                                        : '1px solid #cbd5e1',
                                      backgroundColor: isRowCritical ? '#fff5f5' : '#ffffff',
                                      outline: 'none',
                                      boxSizing: 'border-box',
                                      transition: 'border-color 0.15s ease',
                                    }}
                                  />
                                )}
                            </td>

                            {/* UOM */}
                            <td style={{ padding: '10px 16px', color: '#64748b', fontWeight: 500 }}>
                              {detail.AnalyteUOM || '—'}
                            </td>

                            {/* Biological Ref Range */}
                            <td style={{ padding: '10px 16px', color: '#475569', fontSize: '12px' }}>
                              {detail.Analyterange ? (
                                <span style={{ fontFamily: typography.fontFamily.mono }}>
                                  {detail.Analyterange}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>

                            {/* Flag Pill */}
                            <td style={{ padding: '10px 16px' }}>
                              {detail.Resultvalue ? (
                                isRowCritical ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      borderRadius: radii.sm,
                                      backgroundColor: '#fee2e2',
                                      color: '#b91c1c',
                                      border: '1px solid #fecaca',
                                    }}
                                  >
                                    <i className="fa fa-exclamation-circle" />
                                    Critical
                                  </span>
                                ) : isHigh ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      borderRadius: radii.sm,
                                      backgroundColor: '#fef3c7',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                    }}
                                  >
                                    <i className="fa fa-arrow-up" />
                                    High
                                  </span>
                                ) : isLow ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      borderRadius: radii.sm,
                                      backgroundColor: '#eff6ff',
                                      color: '#1d4ed8',
                                      border: '1px solid #bfdbfe',
                                    }}
                                  >
                                    <i className="fa fa-arrow-down" />
                                    Low
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      borderRadius: radii.sm,
                                      backgroundColor: '#f0fdf4',
                                      color: '#15803d',
                                      border: '1px solid #bbf7d0',
                                    }}
                                  >
                                    <i className="fa fa-check" />
                                    Normal
                                  </span>
                                )
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>—</span>
                              )}
                            </td>

                            {/* Critical Value Toggle */}
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isRowCritical}
                                onChange={() => handleCriticalToggle(detail)}
                                title="Mark as critical / panic alert value"
                                style={{
                                  cursor: 'pointer',
                                  width: '15px',
                                  height: '15px',
                                  accentColor: '#dc2626',
                                }}
                              />
                            </td>

                            {/* Action Icons */}
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                {/* Trend graph icon */}
                                <button
                                  type="button"
                                  onClick={() => dispatch('graphView', detail)}
                                  title="View historical trend graph"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#0284c7',
                                    padding: '3px',
                                  }}
                                >
                                  <i className="fa fa-line-chart" />
                                </button>

                                {/* TAT icon */}
                                <button
                                  type="button"
                                  onClick={() => dispatch('testtat', detail)}
                                  title="View TAT for this test"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#6366f1',
                                    padding: '3px',
                                  }}
                                >
                                  <i className="fa fa-clock-o" />
                                </button>

                                {/* Observations icon */}
                                <button
                                  type="button"
                                  onClick={() => dispatch('openObservations', detail)}
                                  title="Clinical observations / comments"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '3px',
                                  }}
                                >
                                  <i className="fa fa-comment-o" />
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

        {/* ─── 5. CULTURE & MICROBIOLOGY PANEL (Conditional) ─────────────── */}
        {item.IsCulture && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              border: '1px solid #e2e8f0',
              padding: '18px 22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '18px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Specimen Type
              </label>
              <select
                value={item.SpecimenId || ''}
                onChange={e => handleHeaderFieldChange('SpecimenId', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">Select Specimen...</option>
                {(lookup.Specimen || []).map(s => (
                  <option key={s.Id} value={s.Id}>
                    {s.Text || s.Description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Block / Media
              </label>
              <select
                value={item.BlockId || ''}
                onChange={e => handleHeaderFieldChange('BlockId', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">Select Block...</option>
                {(lookup.ResultBlock || []).map(b => (
                  <option key={b.Id} value={b.Id}>
                    {b.Text || b.Description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Result Type
              </label>
              <select
                value={item.ResultTypeId || ''}
                onChange={e => handleHeaderFieldChange('ResultTypeId', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">Select Result Type...</option>
                {(lookup.ResultType || []).map(r => (
                  <option key={r.Id} value={r.Id}>
                    {r.Text || r.Description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ─── 6. CLINICAL COMMENTS & IMPRESSIONS ─────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px',
          }}
        >
          {/* Printable Diagnostic Comments */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa fa-file-text-o" style={{ color: '#0284c7' }} />
                Printable Diagnostic Impressions
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Appears on Lab PDF report</span>
            </div>
            <textarea
              rows={3}
              placeholder="Enter overall clinical impression, summary interpretation, or correlation remarks..."
              value={printableComments}
              onChange={e => {
                setPrintableComments(e.target.value);
                handleHeaderFieldChange('PrintableComments', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '12.5px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: typography.fontFamily.sans,
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Non-Printable Internal Notes */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa fa-lock" style={{ color: '#64748b' }} />
                Non-Printable Internal Lab Notes
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Internal communication only</span>
            </div>
            <textarea
              rows={3}
              placeholder="Confidential laboratory notes, sample condition upon receipt, rerun records..."
              value={nonPrintableComments}
              onChange={e => {
                setNonPrintableComments(e.target.value);
                handleHeaderFieldChange('NonPrintableComments', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '12.5px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: typography.fontFamily.sans,
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>

        {/* ─── 7. BOTTOM ACTION COMMAND BAR (INLINE AT END OF PAGE) ────────── */}
        <div
          id="resultEntryActionBar"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            border: '1px solid #e2e8f0',
            padding: '14px 22px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left Side: Back & Header Options & Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btnBackToList"
              onClick={() => dispatch('back')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: radii.md,
                fontSize: '12.5px',
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-angle-left" />
              Back to List
            </button>

            {/* With Header Checkbox */}
            <label
              id="lblWithHeader"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: radii.md,
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                userSelect: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                id="chkWithHeader"
                type="checkbox"
                checked={withHeader}
                onChange={e => {
                  const checked = e.target.checked;
                  setWithHeader(checked);
                  setWithoutHeader(!checked);
                  handleHeaderFieldChange('WithHeader', checked);
                  handleHeaderFieldChange('WithoutHeader', !checked);
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#0284c7',
                }}
              />
              <span>With Header</span>
            </label>

            {/* Print Button */}
            {Boolean(Number(item.WorkOrderStatusId) >= 3 || permissions.canPrint || permissions.canPrintWithoutHeader) && (
              <button
                id="btnPrintLabReport"
                onClick={() => dispatch('print', { withHeader, withoutHeader })}
                title={withHeader ? 'Print Lab Report (With Header)' : 'Print Lab Report (Without Header)'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: radii.md,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  border: '1px solid #0284c7',
                  cursor: 'pointer',
                  boxShadow: shadows.sm,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#0284c7';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0284c7';
                }}
              >
                <i className="fa fa-print" />
                Print Lab Report
              </button>
            )}

            {/* Send for Approval Button */}
            {!isFromApproval && !isFullyApproved && !permissions.canDisableApproveReject && (
              <button
                id="btnSendForApproval"
                onClick={() => dispatch('sendForApproval', { header: item, testList: localTestList })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: radii.md,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  backgroundColor: '#f3e8ff',
                  color: '#6b21a8',
                  border: '1px solid #d8b4fe',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-paper-plane" />
                Send for Approval
              </button>
            )}
          </div>

          {/* Right Side: Status Checkboxes, Save, Approve, Reject */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Status Checkboxes */}
            {!isFullyApproved && Number(item.WorkOrderStatusId) <= 3 && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <input
                  id="chkMarkCompleted"
                  type="checkbox"
                  checked={isCompleted}
                  onChange={e => {
                    setIsCompleted(e.target.checked);
                    handleHeaderFieldChange('IsCompleted', e.target.checked);
                  }}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                Mark as Completed
              </label>
            )}

            {!isFullyApproved && (Number(item.WorkOrderStatusId) >= 4 || isPartiallyApproved) && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <input
                  id="chkMarkApproved"
                  type="checkbox"
                  checked={isApproved}
                  onChange={e => {
                    setIsApproved(e.target.checked);
                    handleHeaderFieldChange('IsApproved', e.target.checked);
                  }}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                Mark as Approved
              </label>
            )}

            {/* Reject / Redo Button */}
            {!isFullyApproved && !permissions.canDisableApproveReject && (
              <button
                id="btnRejectOrder"
                onClick={() => dispatch('reject', { item })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: radii.md,
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <i className="fa fa-times-circle" />
                Reject / Redo
              </button>
            )}

            {/* Save Draft / Progress Button */}
            <button
              id="btnSaveForm"
              onClick={() => dispatch('save', { header: item, computeStatus: true, testList: localTestList })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: radii.md,
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0369a1')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0284c7')}
            >
              <i className="fa fa-save" />
              Save Results
            </button>

            {/* Approve Order Button */}
            {canShowApproveButton && (
              <button
                id="btnApproveOrder"
                onClick={() => dispatch('approve', { header: item, testList: localTestList })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  borderRadius: radii.md,
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <i className="fa fa-shield" />
                Approve Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── 8. ATTACHMENTS DRAWER MODAL ─────────────────────────────────── */}
      {showAttachmentsDrawer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setShowAttachmentsDrawer(false)}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '90vw',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 101,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                <i className="fa fa-paperclip" style={{ marginRight: '8px', color: '#0284c7' }} />
                Case Attachments ({attachments.length})
              </h3>
              <button
                onClick={() => setShowAttachmentsDrawer(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {attachments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '36px 0' }}>
                  <i className="fa fa-picture-o" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                  No files or images attached to this work order.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {attachments.map(att => (
                    <div
                      key={att.Id}
                      style={{
                        borderRadius: radii.lg,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      {att.ImgEncData && (
                        <img
                          src={`data:image/png;base64,${att.ImgEncData}`}
                          alt={att.filename}
                          style={{
                            width: '100%',
                            maxHeight: '160px',
                            objectFit: 'contain',
                            backgroundColor: '#0f172a',
                            cursor: 'pointer',
                          }}
                          onClick={() => setActivePreviewImage(att)}
                        />
                      )}
                      <div
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {att.filename}
                        </span>
                        <button
                          onClick={() => dispatch('downloadAttachment', att)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            borderRadius: radii.sm,
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            color: '#0284c7',
                          }}
                        >
                          <i className="fa fa-download" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      {activePreviewImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setActivePreviewImage(null)}
        >
          <img
            src={`data:image/png;base64,${activePreviewImage.ImgEncData}`}
            alt={activePreviewImage.filename}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: radii.lg,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
};
