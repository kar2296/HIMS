import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './utils/api';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { FilterBar } from '../components/ui/Card';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { colors, radii, shadows, spacing, transitions, typography } from '../components/ui/tokens';

export interface FindBillItem {
  Id: number;
  BillNumber: string;
  PatientId: number;
  BillTypeId: number;
  BillDateTime: string;
  BillAmount: number;
  BillDiscount: number;
  PaidAmount: number;
  OutStandingAmount: number;
  CreditApprovalStatusId?: number;
  PrivateDueId?: number;
  PrivateDue?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Title?: {
      Description?: string;
    };
  };
  PatientBillStatus?: {
    Id?: number;
    Description?: string;
  };
  PatientBillStatusId?: number;
  Status?: number | string;
}

export const isDraftBill = (bill: FindBillItem | null | undefined): boolean => {
  if (!bill) return false;
  if (bill.PatientBillStatusId === 1) return true;
  if (!bill.BillNumber || bill.BillNumber === 'null' || bill.BillNumber === 'undefined') return true;
  if (bill.PatientBillStatus?.Id === 1) return true;
  if (bill.PatientBillStatus?.Description && bill.PatientBillStatus.Description.toLowerCase().includes('draft')) return true;
  if (typeof (bill as any).Status === 'string' && (bill as any).Status.toLowerCase().includes('draft')) return true;
  return false;
};

export interface FindBillModalProps {
  props?: any;
  reactProps?: {
    context?: string;
    modalParams?: {
      id?: number;
      context?: string;
    };
    facilityId?: number;
    initialStatusId?: number;
  };
  onSelect?: (data: { BillId: number; PatientId: number; BillTypeId: number }) => void;
  onClose?: () => void;
  onPatientInfo?: (patientId: number) => void;
}

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPastDateStr = (daysAgo: number = 30) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FindBillModalComponent: React.FC<FindBillModalProps> = (rawProps: any) => {
  const actualProps = rawProps.reactProps || rawProps.props?.reactProps || rawProps.props || rawProps;
  const onSelect = rawProps.onSelect || actualProps.onSelect;
  const onClose = rawProps.onClose || actualProps.onClose;
  const onPatientInfo = rawProps.onPatientInfo || actualProps.onPatientInfo;

  const isDirectDg = Boolean(
    actualProps.context === 'DG' ||
    actualProps.modalParams?.context === 'DG' ||
    rawProps.context === 'DG' ||
    (typeof window !== 'undefined' && (
      window.location.hash.includes('directbilling') ||
      window.location.hash.includes('/DG') ||
      window.location.pathname.includes('directbilling')
    ))
  );
  const context = isDirectDg ? 'DG' : (actualProps.context || actualProps.modalParams?.context || rawProps.context || 'OP');
  const modalParams = actualProps.modalParams || {};
  const facilityId = actualProps.facilityId || 1;

  // Filter States - default fromDate to empty (All Time) for DG or past 30 days for OP
  const [patBillNum, setPatBillNum] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(isDirectDg ? '' : getPastDateStr(30));
  const [toDate, setToDate] = useState<string>(isDirectDg ? '' : getTodayStr());
  const [isOutStanding, setIsOutStanding] = useState<boolean>(false);
  const [dueApprovalPending, setDueApprovalPending] = useState<boolean>(false);
  const [dueApprovalBill, setDueApprovalBill] = useState<FindBillItem | null>(null);
  const [dueApprovalActionLoading, setDueApprovalActionLoading] = useState<boolean>(false);
  const [statusId, setStatusId] = useState<number>(3); // 3 = Completed
  const [referralId, setReferralId] = useState<number>(-1);
  const [withHeader, setWithHeader] = useState<boolean>(true); // With Header checkbox
  const [selectedBill, setSelectedBill] = useState<FindBillItem | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Lookups
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [referralOptions, setReferralOptions] = useState<any[]>([]);

  // Grid / Data States
  const [bills, setBills] = useState<FindBillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [printingBillId, setPrintingBillId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [printMessage, setPrintMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Helper to safely access Angular utl if available
  const getAngularUtl = () => {
    try {
      const angularObj = (window as any).angular;
      if (angularObj && document.body) {
        const injector = angularObj.element(document.body).injector();
        return injector?.get('utl');
      }
    } catch {
      return null;
    }
    return null;
  };

  // Load Lookups
  useEffect(() => {
    let isMounted = true;
    const loadLookups = async () => {
      try {
        const res = await apiFetch('General/Options/getoptions', [
          { Key: 'BillType' },
          { Key: 'PatientBillStatus' },
          { Key: 'Referral' },
        ]);
        if (isMounted && res) {
          const rawStatus = res.PatientBillStatus || res.Data?.PatientBillStatus;
          if (Array.isArray(rawStatus)) {
            setStatusOptions(rawStatus);
          }
          const rawReferral = res.Referral || res.Data?.Referral;
          if (Array.isArray(rawReferral)) {
            setReferralOptions(rawReferral);
          }
        }
      } catch (err) {
        console.error('Error fetching lookups for Previous Bills:', err);
      }
    };
    loadLookups();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchSeqRef = useRef<number>(0);

  const activePreset = React.useMemo(() => {
    const today = getTodayStr();
    const yesterday = getPastDateStr(1);
    if (!fromDate && !toDate) return 'all';
    if (fromDate === today && toDate === today) return 'today';
    if (fromDate === yesterday && toDate === yesterday) return 'yesterday';
    if (fromDate === getPastDateStr(7) && toDate === today) return '7d';
    if (fromDate === getPastDateStr(30) && toDate === today) return '30d';
    return 'custom';
  }, [fromDate, toDate]);

  // Fetch Bills with optional filter overrides
  const fetchBills = useCallback(
    async (page: number = 1, filterOverrides?: any) => {
      const seq = ++fetchSeqRef.current;
      setIsLoading(true);
      setError('');
      try {
        const isDgMode = isDirectDg || context === 'DG';
        const billTypeVal = isDgMode ? 5 : 1;
        const patientId = modalParams?.id || -1;
        const facId = facilityId || 1;

        const currentSearch = filterOverrides && filterOverrides.patBillNum !== undefined ? filterOverrides.patBillNum : patBillNum;
        const currentFrom = filterOverrides && filterOverrides.fromDate !== undefined ? filterOverrides.fromDate : fromDate;
        const currentTo = filterOverrides && filterOverrides.toDate !== undefined ? filterOverrides.toDate : toDate;
        const currentOutStanding = filterOverrides && filterOverrides.isOutStanding !== undefined ? filterOverrides.isOutStanding : isOutStanding;
        const currentDueApprovalPending = filterOverrides && filterOverrides.dueApprovalPending !== undefined ? filterOverrides.dueApprovalPending : dueApprovalPending;
        const currentStatus = filterOverrides && filterOverrides.statusId !== undefined ? filterOverrides.statusId : statusId;
        const currentReferral = filterOverrides && filterOverrides.referralId !== undefined ? filterOverrides.referralId : referralId;

        const params: any[] = [
          { Key: 6, Value: billTypeVal },
          { Key: 8, Value: facId },
          { Key: 47, Value: isDgMode },
        ];

        // 1. Search text (Name / UHID / Bill#) -> Key 49
        const trimmedSearch = (currentSearch || '').trim();
        if (trimmedSearch) {
          params.push({ Key: 49, Value: trimmedSearch });
        }

        // 2. Status -> Key 4 (omitted or -1 if All Statuses)
        if (currentStatus !== -1 && currentStatus !== null && currentStatus !== undefined) {
          params.push({ Key: 4, Value: Number(currentStatus) });
        }

        // 3. Referred By -> Key 43 (PatientBillsFilters.ReferralId, not Key 7 Doctor)
        if (currentReferral !== -1 && currentReferral !== null && currentReferral !== undefined) {
          params.push({ Key: 43, Value: Number(currentReferral) });
        }

        // 4. Outstanding -> Key 11
        if (currentOutStanding || currentDueApprovalPending) {
          params.push({ Key: 11, Value: 1 });
        }

        // 5. Patient ID -> Key 12 (only when in OP context and not searching globally; in DG direct billing we search all walk-in DG bills)
        if (!isDgMode && patientId && Number(patientId) > 0 && !trimmedSearch) {
          params.push({ Key: 12, Value: Number(patientId) });
        }

        // 6. Dates
        let fDate = (currentFrom || '').trim();
        let tDate = (currentTo || '').trim();

        if (fDate && tDate) {
          if (fDate > tDate) {
            const temp = fDate;
            fDate = tDate;
            tDate = temp;
          }
          params.push({ Key: 1, Value: [`${fDate} 00:00:00`, `${tDate} 23:59:59`] });
        } else if (fDate) {
          params.push({ Key: 17, Value: `${fDate} 00:00:00` });
        } else if (tDate) {
          params.push({ Key: 18, Value: `${tDate} 23:59:59` });
        }

        const payload = {
          Params: params,
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        };

        const res = await apiFetch('billing/patientbills/GetFindPatientBills', payload);
        if (seq !== fetchSeqRef.current) return;

        if (res && res.Data) {
          let list: FindBillItem[] = Array.isArray(res.Data) ? res.Data : [];
          if (isDgMode) {
            // DIRECT BILLING ONLY: strictly filter to BillTypeId === 5 or BillNumber starting with 'DG'
            list = list.filter((b) => b.BillTypeId === 5 || (b.BillNumber && String(b.BillNumber).trim().toUpperCase().startsWith('DG')));
          } else {
            // OP BILLING ONLY: strictly filter to BillTypeId === 1 and not DG bills
            list = list.filter((b) => b.BillTypeId === 1 && (!b.BillNumber || !String(b.BillNumber).trim().toUpperCase().startsWith('DG')));
          }
          if (currentDueApprovalPending) {
            list = list.filter((b) => Number(b.OutStandingAmount) > 0 && b.CreditApprovalStatusId !== 2);
          }
          const sorted = [...list].sort((a, b) => {
            const timeB = new Date(b.BillDateTime).getTime() || b.Id || 0;
            const timeA = new Date(a.BillDateTime).getTime() || a.Id || 0;
            return timeB - timeA;
          });
          setBills(sorted);
          setTotalItems(res.PageContext?.TotalRecords ?? sorted.length);
          setCurrentPage(page);
          if (sorted.length > 0 && (!selectedBill || !sorted.some((s) => s.Id === selectedBill.Id))) {
            setSelectedBill(sorted[0]);
          }
        } else {
          setBills([]);
          setTotalItems(0);
          setSelectedBill(null);
        }
      } catch (err: any) {
        if (seq !== fetchSeqRef.current) return;
        console.error('Error fetching previous bills:', err);
        setError(err?.message || 'Failed to load bills');
        setBills([]);
        setTotalItems(0);
      } finally {
        if (seq === fetchSeqRef.current) {
          setIsLoading(false);
        }
      }
    },
    [context, modalParams, facilityId, patBillNum, statusId, referralId, isOutStanding, dueApprovalPending, fromDate, toDate, pageSize, selectedBill]
  );

  const handleApplyPreset = (preset: 'today' | 'yesterday' | '7d' | '30d' | 'all') => {
    let newFrom = '';
    let newTo = '';
    const today = getTodayStr();
    const yesterday = getPastDateStr(1);

    if (preset === 'today') {
      newFrom = today;
      newTo = today;
    } else if (preset === 'yesterday') {
      newFrom = yesterday;
      newTo = yesterday;
    } else if (preset === '7d') {
      newFrom = getPastDateStr(7);
      newTo = today;
    } else if (preset === '30d') {
      newFrom = getPastDateStr(30);
      newTo = today;
    } else if (preset === 'all') {
      newFrom = '';
      newTo = '';
    }

    setFromDate(newFrom);
    setToDate(newTo);
    setCurrentPage(1);
    fetchBills(1, { fromDate: newFrom, toDate: newTo });
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    let newTo = toDate;
    if (val && toDate && val > toDate) {
      newTo = val;
      setToDate(val);
    }
    setCurrentPage(1);
    fetchBills(1, { fromDate: val, toDate: newTo });
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    let newFrom = fromDate;
    if (val && fromDate && val < fromDate) {
      newFrom = val;
      setFromDate(val);
    }
    setCurrentPage(1);
    fetchBills(1, { fromDate: newFrom, toDate: val });
  };

  // Initial Fetch
  useEffect(() => {
    fetchBills(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    const defFrom = getPastDateStr(30);
    const defTo = getTodayStr();
    setPatBillNum('');
    setFromDate(defFrom);
    setToDate(defTo);
    setIsOutStanding(false);
    setDueApprovalPending(false);
    setDueApprovalBill(null);
    setStatusId(3);
    setReferralId(-1);
    setSelectedBill(null);
    setCurrentPage(1);

    fetchBills(1, {
      patBillNum: '',
      fromDate: defFrom,
      toDate: defTo,
      isOutStanding: false,
      dueApprovalPending: false,
      statusId: 3,
      referralId: -1,
    });
  };

  const handleSelectRow = (bill: FindBillItem) => {
    if (onSelect) {
      onSelect({
        BillId: bill.Id,
        PatientId: bill.PatientId,
        BillTypeId: bill.BillTypeId,
      });
    }
  };

  const handlePatientClick = (e: React.MouseEvent, patientId?: number) => {
    e.stopPropagation();
    if (patientId && onPatientInfo) {
      onPatientInfo(patientId);
    }
  };

  // Print Bill Handler (supports withHeader / withoutHeader)
  const handlePrint = async (bill: FindBillItem) => {
    if (!bill || !bill.Id || isDraftBill(bill)) return;
    setPrintingBillId(bill.Id);
    setPrintMessage('');
    try {
      const isDG = bill.BillTypeId === 5;
      const actionName = withHeader
        ? 'billing/patientbills/PrintOPPatientBills'
        : isDG
        ? 'billing/patientbills/PrintPatientDGBillsWithoutHeader'
        : 'billing/patientbills/PrintPatientBillsWithoutHeader';

      const payload = {
        Id: bill.Id,
        Data: {
          isprint: false,
          withHeader: withHeader ? 1 : 0,
          withoutHeader: withHeader ? 0 : 1,
        },
      };

      // 1. Try Angular utl.Http.doPrint if running in Angular shell
      let printed = false;
      const utl = getAngularUtl();
      if (utl && utl.Http && typeof utl.Http.doPrint === 'function') {
        utl.Http.doPrint({
          action: actionName,
          data: payload,
          type: 'post',
        });
        printed = true;
      }

      // 2. Direct fetch fallback
      if (!printed) {
        const token = localStorage.getItem('token');
        const apiRoot = (window as any).appPath?.apiroot || '/api/';
        const targetUrl = `${apiRoot.replace(/\/$/, '')}/${actionName.replace(/^\//, '')}`;

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Print failed (${res.status} ${res.statusText})`);
        }

        const blob = await res.blob();
        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL);
        if (printWindow && typeof printWindow.print === 'function') {
          try {
            printWindow.print();
          } catch {
            // printWindow fallback
          }
        } else {
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          iframe.src = fileURL;
          document.body.appendChild(iframe);
          iframe.onload = () => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (err) {
              console.warn('iframe print error:', err);
            }
          };
        }
      }
    } catch (err: any) {
      console.error('Error printing bill:', err);
      setPrintMessage(err?.message || 'Failed to print bill');
    } finally {
      setPrintingBillId(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${mins}`;
  };

  const formatCurrency = (val: number | undefined | null) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Same name-composition logic the legacy table used inline per-row; only relocated
  // into a named helper so DataTable's per-row `render` callbacks can share it.
  const getPatientFullName = (bill: FindBillItem) => {
    const title = bill.Patient?.Title?.Description ? `${bill.Patient.Title.Description} ` : '';
    const firstName = bill.Patient?.FirstName || '';
    const lastName = bill.Patient?.LastName ? ` ${bill.Patient.LastName}` : '';
    return `${title}${firstName}${lastName}`.trim() || '-';
  };

  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(currentPage * pageSize, totalItems);

  const handleOpenDueApproval = (bill: FindBillItem) => {
    const utl = getAngularUtl();
    if (utl?.Modal?.open) {
      try {
        utl.Modal.open('app.editcreditapproval', {
          params: {
            id: bill.Id,
            pid: bill.PatientId,
            billnumber: bill.BillNumber,
            patientbillid: (bill as any).PatientBillId || bill.Id,
            item: bill,
          },
          confirmCallback: () => {
            fetchBills(currentPage);
          },
        });
        return;
      } catch (e) {
        console.warn('Failed opening Angular editcreditapproval modal, using React modal fallback:', e);
      }
    }
    setDueApprovalBill(bill);
  };

  const handleUpdateDueApproval = async (bill: FindBillItem, newStatusId: number) => {
    try {
      setDueApprovalActionLoading(true);
      await apiFetch('Billing/PatientBills/UpdatePatientBillsforDue', {
        Data: {
          Id: bill.Id,
          CreditApprovalStatusId: newStatusId,
        },
      });

      // Update in local state
      setBills((prev) =>
        prev.map((b) => (b.Id === bill.Id ? { ...b, CreditApprovalStatusId: newStatusId } : b))
      );
      if (selectedBill && selectedBill.Id === bill.Id) {
        setSelectedBill({ ...selectedBill, CreditApprovalStatusId: newStatusId });
      }

      setPrintMessage(
        newStatusId === 2
          ? `✓ Due Approved successfully for Bill ${bill.BillNumber}`
          : `Due authorization rejected for Bill ${bill.BillNumber}`
      );
      setDueApprovalBill(null);
    } catch (err: any) {
      console.error('Failed to update due approval status:', err);
      setError(err?.message || 'Failed to update due approval status');
    } finally {
      setDueApprovalActionLoading(false);
    }
  };

  const columns: DataTableColumn<FindBillItem>[] = [
    {
      key: 'select',
      header: 'Select',
      align: 'center',
      width: '80px',
      render: (bill) => (
        <Button
          type="button"
          variant="success"
          size="sm"
          rounded="full"
          icon="fas fa-check"
          title="Select Bill"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectRow(bill);
          }}
        />
      ),
    },
    {
      key: 'billNo',
      header: 'Bill No',
      width: '130px',
      render: (bill) => (
        <span
          role="button"
          tabIndex={0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing.xs,
            fontWeight: 600,
            color: '#2563eb',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectRow(bill);
          }}
          title={`Click to load ${bill.BillNumber}`}
        >
          <i className="fas fa-receipt" style={{ color: '#2563eb', fontSize: '12px' }}></i>
          <span style={{ borderBottom: '1px dashed #2563eb' }}>{bill.BillNumber}</span>
        </span>
      ),
    },
    {
      key: 'uhid',
      header: 'UHID',
      width: '100px',
      render: (bill) => <Badge tone="neutral">{bill.Patient?.MRN || '-'}</Badge>,
    },
    {
      key: 'patientName',
      header: 'Patient Name',
      width: '160px',
      render: (bill) => (
        <Button
          type="button"
          variant="link"
          icon="fas fa-user-circle"
          title="Click to view patient profile"
          onClick={(e) => handlePatientClick(e, bill.PatientId)}
        >
          {getPatientFullName(bill)}
        </Button>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '130px',
      render: (bill) => <span style={{ whiteSpace: 'nowrap' }}>{formatDateTime(bill.BillDateTime)}</span>,
    },
    {
      key: 'billAmt',
      header: 'Bill Amt',
      width: '95px',
      align: 'right',
      render: (bill) => <span style={{ fontWeight: 600, color: colors.textMain }}>{formatCurrency(bill.BillAmount)}</span>,
    },
    {
      key: 'disAmt',
      header: 'Dis Amt',
      width: '85px',
      align: 'right',
      render: (bill) => formatCurrency(bill.BillDiscount),
    },
    {
      key: 'paidAmt',
      header: 'Paid Amt',
      width: '95px',
      align: 'right',
      render: (bill) => <span style={{ fontWeight: 600, color: colors.success }}>{formatCurrency(bill.PaidAmount)}</span>,
    },
    {
      key: 'dueAmt',
      header: 'Due Amt',
      width: '95px',
      align: 'right',
      render: (bill) => (
        <span style={{ fontWeight: 600, color: Number(bill.OutStandingAmount) > 0 ? colors.danger : colors.textMuted }}>
          {formatCurrency(bill.OutStandingAmount)}
        </span>
      ),
    },
    {
      key: 'dueApproval',
      header: 'Due Approval',
      align: 'center',
      width: '120px',
      render: (bill) => {
        const hasDue = Number(bill.OutStandingAmount) > 0;
        if (!hasDue) {
          return <span style={{ color: colors.textMuted, fontSize: '11px' }}>Paid / Nil</span>;
        }
        if (bill.CreditApprovalStatusId === 2) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #86efac',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
              }}
              title="Due authorized / approved"
            >
              <i className="fas fa-check-circle" style={{ fontSize: '10px' }} />
              Approved
            </span>
          );
        }
        if (bill.CreditApprovalStatusId === 3) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
              }}
              title="Due authorization rejected"
            >
              <i className="fas fa-times-circle" style={{ fontSize: '10px' }} />
              Rejected
            </span>
          );
        }
        return (
          <Button
            type="button"
            variant="warning"
            size="sm"
            icon="fas fa-stamp"
            title="Click to approve or review Due"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDueApproval(bill);
            }}
          >
            Approve Due
          </Button>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      align: 'center',
      render: (bill) => <StatusBadge status={bill.PatientBillStatus?.Description || 'Completed'} />,
    },
    {
      key: 'print',
      header: 'Print',
      align: 'center',
      width: '100px',
      render: (bill) => {
        if (isDraftBill(bill)) {
          return <span style={{ color: colors.textMuted, fontSize: '13px' }}>—</span>;
        }
        const isPrintingThis = printingBillId === bill.Id;
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon="fas fa-print"
            loading={isPrintingThis}
            title={withHeader ? 'Print with Header' : 'Print without Header'}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBill(bill);
              handlePrint(bill);
            }}
          >
            Print
          </Button>
        );
      },
    },
  ];

  return (
    <div
      className="find-bill-modal-root"
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        boxShadow: shadows.lg,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
        minHeight: '600px',
        maxHeight: '92vh',
        width: '100%',
      }}
    >
      <style>{`
        .modal-dialog:has(.find-bill-modal-root),
        .modal-dialog.modal-lg {
          width: 95vw !important;
          max-width: 1250px !important;
          margin: 15px auto !important;
        }
        .modal-content:has(.find-bill-modal-root) {
          border-radius: 16px !important;
          overflow: hidden !important;
        }
      `}</style>
      {/* 1. Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          padding: `${spacing.lg} ${spacing.xl}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: radii.md,
              backgroundColor: isDirectDg ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDirectDg ? '#60a5fa' : '#38bdf8',
              fontSize: '16px',
            }}
          >
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Previous {isDirectDg ? 'Direct (DG)' : 'Outpatient (OP)'} Bills</span>
              {isDirectDg && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600 }}>
                  Direct / DG Only
                </span>
              )}
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {isDirectDg
                ? 'Search and select previous direct & diagnostic bills (DG bills only)'
                : 'Search and select previous outpatient consultation bills (OP bills only)'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: radii.md,
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: radii.md,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            title="Close (Esc)"
          >
            <i className="fas fa-times" style={{ fontSize: '14px' }}></i>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      {showFilters && (
        <div
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            backgroundColor: colors.surfaceMuted,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBills(1);
          }}
        >
          {/* Quick Date Presets Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-calendar-day" style={{ color: colors.primary }}></i> Date Preset:
              </span>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ].map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p.id as any)}
                    style={{
                      background: isActive ? colors.primary : colors.surface,
                      color: isActive ? '#ffffff' : colors.textMain,
                      border: `1px solid ${isActive ? colors.primary : colors.border}`,
                      borderRadius: radii.full,
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: transitions.fast,
                      boxShadow: isActive ? shadows.sm : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isActive && <i className="fas fa-check" style={{ fontSize: '10px' }}></i>}
                    {p.label}
                  </button>
                );
              })}
              {activePreset === 'custom' && (
                <span
                  style={{
                    fontSize: '11px',
                    color: colors.primary,
                    fontWeight: 600,
                    marginLeft: '4px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '3px 10px',
                    borderRadius: radii.full,
                  }}
                >
                  Custom Range
                </span>
              )}
            </div>

            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.danger,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                }}
                title="Clear date filter to show all bills"
              >
                <i className="fas fa-times-circle"></i> Clear Dates
              </button>
            )}
          </div>

          <FilterBar style={{ marginBottom: spacing.xs, gap: spacing.sm }}>
            {/* Name / UHID / Bill# */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Input
                label="Name / UHID / Bill#"
                value={patBillNum}
                onChange={(e) => setPatBillNum(e.target.value)}
                placeholder="Search Name/UHID/Bill#..."
                leftIcon="fas fa-search"
              />
            </div>

            {/* From Date */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <DatePicker label="From Date" value={fromDate} onChange={handleFromDateChange} />
            </div>

            {/* To Date */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <DatePicker label="To Date" value={toDate} onChange={handleToDateChange} />
            </div>

            {/* Status */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Select
                label="Status"
                value={statusId}
                onChange={(value) => setStatusId(Number(value))}
                options={[
                  { value: -1, label: 'All Statuses' },
                  ...statusOptions
                    .filter((opt: any) => opt && opt.Id !== -1)
                    .map((opt: any) => ({
                      value: opt.Id,
                      label: opt.Text || opt.Description || String(opt.Id),
                    })),
                ]}
              />
            </div>

            {/* Referred By */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Select
                label="Referred By"
                value={referralId}
                onChange={(value) => setReferralId(Number(value))}
                options={[
                  { value: -1, label: 'All Referrals' },
                  ...referralOptions
                    .filter((opt: any) => opt && opt.Id !== -1)
                    .map((opt: any) => ({
                      value: opt.Id,
                      label: opt.Text || opt.Description || opt.ReferralName || String(opt.Id),
                    })),
                ]}
              />
            </div>

            {/* Outstanding Checkbox, With Header Checkbox, Action Buttons & Right-Side Print */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
                <Checkbox label="Outstanding" checked={isOutStanding} onChange={setIsOutStanding} />

                <Checkbox
                  label="Due Approval Pending"
                  checked={dueApprovalPending}
                  onChange={(checked: boolean) => {
                    setDueApprovalPending(checked);
                    if (checked) setIsOutStanding(true);
                  }}
                />

                <Checkbox
                  label={
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs, fontWeight: 500 }}>
                      <span>With Header</span>
                      <span style={{ fontSize: '11px', color: withHeader ? colors.primary : colors.textMuted, fontWeight: 600 }}>
                        ({withHeader ? 'Header Included' : 'Without Header'})
                      </span>
                    </span>
                  }
                  checked={withHeader}
                  onChange={setWithHeader}
                />

                <Button type="submit" variant="primary" icon="fas fa-filter" loading={isLoading} loadingText="Fetching...">
                  Fetch
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  icon="fas fa-undo-alt"
                  onClick={handleReset}
                  title="Reset Filters"
                />
              </div>

              {/* Right Side Print Option (Hidden for Draft Bills) */}
              {selectedBill && !isDraftBill(selectedBill) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' }}>
                  <Button
                    type="button"
                    variant="primary"
                    icon="fas fa-print"
                    disabled={printingBillId === selectedBill.Id}
                    loading={Boolean(printingBillId === selectedBill.Id)}
                    onClick={() => handlePrint(selectedBill)}
                    title={
                      withHeader
                        ? `Print Bill ${selectedBill.BillNumber} with Header`
                        : `Print Bill ${selectedBill.BillNumber} without Header`
                    }
                  >
                    {`Print ${selectedBill.BillNumber} (${withHeader ? 'With Header' : 'Without Header'})`}
                  </Button>
                </div>
              )}
            </div>
          </FilterBar>
        </form>
      </div>
      )}

      {/* 3. Main Data Table */}
      <div style={{ flex: 1, minHeight: '280px', overflowY: 'auto', overflowX: 'auto', padding: spacing.md }}>
        {error && (
          <div style={{ marginBottom: spacing.md }}>
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        {printMessage && (
          <div style={{ marginBottom: spacing.md }}>
            <Alert tone="danger">{printMessage}</Alert>
          </div>
        )}

        <DataTable<FindBillItem>
          columns={columns}
          rows={bills}
          rowKey={(row) => row.Id}
          onRowClick={(row) => {
            setSelectedBill(row);
            handleSelectRow(row);
          }}
          rowStyle={(row) => (selectedBill?.Id === row.Id ? { backgroundColor: '#e0f2fe' } : undefined)}
          loading={isLoading}
          emptyText={isDirectDg ? 'No direct bills found' : 'No bills found'}
          emptyIcon="fas fa-folder-open"
        />
      </div>

      {/* 4. Footer & Pagination */}
      <div
        style={{
          padding: `${spacing.md} ${spacing.xl}`,
          backgroundColor: colors.surfaceMuted,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <div style={{ fontSize: '13px', color: colors.textMuted }}>
          Showing <span style={{ fontWeight: 600, color: colors.textMain }}>{startItemIndex}</span>–
          <span style={{ fontWeight: 600, color: colors.textMain }}>{endItemIndex}</span> of{' '}
          <span style={{ fontWeight: 600, color: colors.textMain }}>{totalItems}</span> bills
        </div>

        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={fetchBills} />
      </div>

      {/* 5. Due Approval Action Modal */}
      {dueApprovalBill && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
          }}
          onClick={() => setDueApprovalBill(null)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: 520,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radii.md,
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                  }}
                >
                  <i className="fas fa-stamp" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: colors.textMain }}>
                    Due Approval
                  </h4>
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>
                    Bill #{dueApprovalBill.BillNumber}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDueApprovalBill(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: 4,
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: spacing.lg }}>
              <div
                style={{
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm, fontSize: '12px' }}>
                  <div>
                    <span style={{ color: colors.textMuted }}>Patient: </span>
                    <strong>{getPatientFullName(dueApprovalBill)}</strong>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>UHID: </span>
                    <Badge tone="neutral">{dueApprovalBill.Patient?.MRN || '-'}</Badge>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>Date: </span>
                    <span>{formatDateTime(dueApprovalBill.BillDateTime)}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>Total Bill: </span>
                    <strong>{formatCurrency(dueApprovalBill.BillAmount)}</strong>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>Paid Amount: </span>
                    <strong style={{ color: colors.success }}>{formatCurrency(dueApprovalBill.PaidAmount)}</strong>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>Outstanding Due: </span>
                    <strong style={{ color: colors.danger, fontSize: '14px' }}>
                      {formatCurrency(dueApprovalBill.OutStandingAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: radii.sm,
                  backgroundColor:
                    dueApprovalBill.CreditApprovalStatusId === 2
                      ? '#ecfdf5'
                      : dueApprovalBill.CreditApprovalStatusId === 3
                      ? '#fef2f2'
                      : '#fffbeb',
                  border: `1px solid ${
                    dueApprovalBill.CreditApprovalStatusId === 2
                      ? '#10b981'
                      : dueApprovalBill.CreditApprovalStatusId === 3
                      ? '#ef4444'
                      : '#f59e0b'
                  }`,
                  color:
                    dueApprovalBill.CreditApprovalStatusId === 2
                      ? '#065f46'
                      : dueApprovalBill.CreditApprovalStatusId === 3
                      ? '#991b1b'
                      : '#92400e',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                }}
              >
                <i
                  className={
                    dueApprovalBill.CreditApprovalStatusId === 2
                      ? 'fas fa-check-circle'
                      : dueApprovalBill.CreditApprovalStatusId === 3
                      ? 'fas fa-times-circle'
                      : 'fas fa-clock'
                  }
                />
                <span>
                  Current Due Status:{' '}
                  {dueApprovalBill.CreditApprovalStatusId === 2
                    ? 'Approved'
                    : dueApprovalBill.CreditApprovalStatusId === 3
                    ? 'Rejected'
                    : 'Pending Authorization'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDueApprovalBill(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="danger"
                icon="fas fa-times"
                loading={dueApprovalActionLoading}
                onClick={() => handleUpdateDueApproval(dueApprovalBill, 3)}
              >
                Reject Due
              </Button>
              <Button
                type="button"
                variant="success"
                icon="fas fa-check-double"
                loading={dueApprovalActionLoading}
                onClick={() => handleUpdateDueApproval(dueApprovalBill, 2)}
              >
                Approve Due
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
