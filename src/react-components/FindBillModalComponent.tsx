import React, { useState, useEffect, useCallback } from 'react';
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
}

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

export const FindBillModalComponent: React.FC<FindBillModalProps> = (rawProps: any) => {
  const actualProps = rawProps.reactProps || rawProps.props?.reactProps || rawProps.props || rawProps;
  const onSelect = rawProps.onSelect || actualProps.onSelect;
  const onClose = rawProps.onClose || actualProps.onClose;
  const onPatientInfo = rawProps.onPatientInfo || actualProps.onPatientInfo;

  const context = actualProps.context || actualProps.modalParams?.context || 'OP';
  const modalParams = actualProps.modalParams || {};
  const facilityId = actualProps.facilityId || 1;

  // Filter States
  const [patBillNum, setPatBillNum] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(getTodayStr());
  const [toDate, setToDate] = useState<string>(getTodayStr());
  const [isOutStanding, setIsOutStanding] = useState<boolean>(false);
  const [statusId, setStatusId] = useState<number>(3); // 3 = Completed
  const [referralId, setReferralId] = useState<number>(-1);

  // Lookups
  const [statusOptions, setStatusOptions] = useState<{ Id: number; Description: string }[]>([]);
  const [referralOptions, setReferralOptions] = useState<{ Id: number; Description: string }[]>([]);

  // Grid / Data States
  const [bills, setBills] = useState<FindBillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalItems, setTotalItems] = useState<number>(0);

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
          if (res.PatientBillStatus && Array.isArray(res.PatientBillStatus)) {
            setStatusOptions(res.PatientBillStatus);
          }
          if (res.Referral && Array.isArray(res.Referral)) {
            setReferralOptions(res.Referral);
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

  // Fetch Bills
  const fetchBills = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const isDirectDg = context === 'DG';
        const billTypeVal = context === 'OP' ? 1 : context === 'DG' ? 5 : 1;
        const outStandingCond = isOutStanding ? 1 : -1;
        const patientId = modalParams?.id || -1;
        const facId = facilityId || 1;

        const params: any[] = [
          { Key: 49, Value: patBillNum.trim() || null },
          { Key: 4, Value: statusId ? Number(statusId) : -1 },
          { Key: 6, Value: billTypeVal },
          { Key: 7, Value: referralId ? Number(referralId) : -1 },
          { Key: 8, Value: facId },
          { Key: 47, Value: isDirectDg },
          { Key: 11, Value: outStandingCond },
          { Key: 12, Value: patientId },
        ];

        if (fromDate || toDate) {
          const fromStr = fromDate ? `${fromDate} 00:00:00` : '';
          const toStr = toDate ? `${toDate} 23:59:59` : '';
          params.push({ Key: 1, Value: [fromStr, toStr] });
        }

        const payload = {
          Params: params,
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        };

        const res = await apiFetch('billing/patientbills/GetFindPatientBills', payload);
        if (res && res.Data) {
          const sorted = [...res.Data].sort((a, b) => {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
          });
          setBills(sorted);
          setTotalItems(res.PageContext?.TotalRecords ?? sorted.length);
          setCurrentPage(page);
        } else {
          setBills([]);
          setTotalItems(0);
        }
      } catch (err: any) {
        console.error('Error fetching previous bills:', err);
        setError(err?.message || 'Failed to load bills');
        setBills([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [context, modalParams, facilityId, patBillNum, statusId, referralId, isOutStanding, fromDate, toDate, pageSize]
  );

  // Initial Fetch
  useEffect(() => {
    fetchBills(1);
  }, [fetchBills]);

  const handleReset = () => {
    setPatBillNum('');
    setFromDate(getTodayStr());
    setToDate(getTodayStr());
    setIsOutStanding(false);
    setStatusId(3);
    setReferralId(-1);
    setCurrentPage(1);
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
      render: (bill) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs, fontWeight: 600, color: colors.textMain }}>
          <i className="fas fa-receipt" style={{ color: colors.textMuted, fontSize: '12px' }}></i>
          <span>{bill.BillNumber}</span>
        </span>
      ),
    },
    {
      key: 'uhid',
      header: 'UHID',
      render: (bill) => <Badge tone="neutral">{bill.Patient?.MRN || '-'}</Badge>,
    },
    {
      key: 'patientName',
      header: 'Patient Name',
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
      render: (bill) => <span style={{ whiteSpace: 'nowrap' }}>{formatDateTime(bill.BillDateTime)}</span>,
    },
    {
      key: 'billAmt',
      header: 'Bill Amt',
      align: 'right',
      render: (bill) => <span style={{ fontWeight: 600, color: colors.textMain }}>{formatCurrency(bill.BillAmount)}</span>,
    },
    {
      key: 'disAmt',
      header: 'Dis Amt',
      align: 'right',
      render: (bill) => formatCurrency(bill.BillDiscount),
    },
    {
      key: 'paidAmt',
      header: 'Paid Amt',
      align: 'right',
      render: (bill) => <span style={{ fontWeight: 600, color: colors.success }}>{formatCurrency(bill.PaidAmount)}</span>,
    },
    {
      key: 'dueAmt',
      header: 'Due Amt',
      align: 'right',
      render: (bill) => (
        <span style={{ fontWeight: 600, color: Number(bill.OutStandingAmount) > 0 ? colors.danger : colors.textMuted }}>
          {formatCurrency(bill.OutStandingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (bill) => <StatusBadge status={bill.PatientBillStatus?.Description || 'Completed'} />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        boxShadow: shadows.lg,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        width: '100%',
      }}
    >
      {/* 1. Header
          This component renders its own complete dialog chrome (header, body, footer) --
          it never calls utl.Modal.open, and it has no isOpen prop, so its mounting/
          unmounting is fully owned by whatever host places it in the DOM. The
          design-system Modal owns its own fixed-position backdrop + click-outside-to-close
          behavior, which this component's markup never had; wrapping it in Modal would
          silently add a new backdrop/close interaction that isn't part of the existing
          contract, so the bespoke shell is kept and only re-tokenized here. The dark
          gradient header is intentionally left bespoke (design-system color tokens are
          all light-surface values, not dark-chrome ones) -- only spacing/radii/transition
          tokens are applied to it. */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '16px',
            }}
          >
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Previous Bills
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Search and select previous outpatient and diagnostic bills
            </span>
          </div>
        </div>

        {/* Kept as a raw button (not the shared Button component): every Button variant
            is styled for a light surface, and none reproduce the translucent-white-on-dark
            "ghost" chip this gradient header needs to stay legible -- so this one control
            is left bespoke-but-tokenized rather than forced into a mismatched variant. */}
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

      {/* 2. Filter Bar */}
      <div
        style={{
          padding: `${spacing.lg} ${spacing.xl}`,
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
          <FilterBar>
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
              <DatePicker label="From Date" value={fromDate} onChange={setFromDate} />
            </div>

            {/* To Date */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <DatePicker label="To Date" value={toDate} onChange={setToDate} />
            </div>

            {/* Status */}
            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Select
                label="Status"
                value={statusId}
                onChange={(value) => setStatusId(Number(value))}
                options={[
                  { value: -1, label: 'All Statuses' },
                  ...statusOptions.map((opt) => ({ value: opt.Id, label: opt.Description })),
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
                  ...referralOptions.map((opt) => ({ value: opt.Id, label: opt.Description })),
                ]}
              />
            </div>

            {/* Outstanding Checkbox & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
              <Checkbox label="Outstanding" checked={isOutStanding} onChange={setIsOutStanding} />

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
          </FilterBar>
        </form>
      </div>

      {/* 3. Main Data Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: spacing.lg }}>
        {error && (
          <div style={{ marginBottom: spacing.md }}>
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <DataTable<FindBillItem>
          columns={columns}
          rows={bills}
          rowKey={(row) => row.Id}
          onRowClick={handleSelectRow}
          loading={isLoading}
          emptyText="No bills found"
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
    </div>
  );
};
