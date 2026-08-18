import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';

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
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

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

  const getStatusBadgeStyle = (statusDesc?: string) => {
    const desc = (statusDesc || '').toLowerCase();
    if (desc.includes('complete')) {
      return {
        bg: '#ecfdf5',
        color: '#065f46',
        border: '#a7f3d0',
      };
    }
    if (desc.includes('draft') || desc.includes('open')) {
      return {
        bg: '#fffbeb',
        color: '#92400e',
        border: '#fde68a',
      };
    }
    if (desc.includes('cancel')) {
      return {
        bg: '#fef2f2',
        color: '#991b1b',
        border: '#fecaca',
      };
    }
    return {
      bg: '#f1f5f9',
      color: '#334155',
      border: '#cbd5e1',
    };
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        width: '100%',
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
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

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBills(1);
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          {/* Name / UHID / Bill# */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Name / UHID / Bill#
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fas fa-search"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              ></i>
              <input
                type="text"
                value={patBillNum}
                onChange={(e) => setPatBillNum(e.target.value)}
                placeholder="Search Name/UHID/Bill#..."
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0f172a',
              }}
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <option value={-1}>All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Referred By */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Referred By
            </label>
            <select
              value={referralId}
              onChange={(e) => setReferralId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <option value={-1}>All Referrals</option>
              {referralOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Checkbox & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                userSelect: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: isOutStanding ? '#eff6ff' : 'transparent',
                border: `1px solid ${isOutStanding ? '#bfdbfe' : '#e2e8f0'}`,
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={isOutStanding}
                onChange={(e) => setIsOutStanding(e.target.checked)}
                style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2563eb' }}
              />
              Outstanding
            </label>

            {/* Fetch Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-filter"></i>
                  <span>Fetch</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Reset Filters"
            >
              <i className="fas fa-undo-alt"></i>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Main Data Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {error && (
          <div style={{ padding: '16px 24px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '13px', borderBottom: '1px solid #fecaca' }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <th style={{ padding: '12px 16px', width: '80px', textAlign: 'center' }}>Select</th>
              <th style={{ padding: '12px 16px', minWidth: '120px' }}>Bill No</th>
              <th style={{ padding: '12px 16px', width: '100px' }}>UHID</th>
              <th style={{ padding: '12px 16px', minWidth: '160px' }}>Patient Name</th>
              <th style={{ padding: '12px 16px', minWidth: '150px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Bill Amt</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Dis Amt</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Paid Amt</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Due Amt</th>
              <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '24px', color: '#2563eb', marginBottom: '12px', display: 'block' }}></i>
                  <span>Loading previous bills...</span>
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '12px', display: 'block' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569', display: 'block' }}>
                    No bills found
                  </span>
                  <span style={{ fontSize: '12px' }}>Try adjusting your search criteria or date range</span>
                </td>
              </tr>
            ) : (
              bills.map((bill, index) => {
                const isHovered = hoveredRowId === bill.Id;
                const statusStyle = getStatusBadgeStyle(bill.PatientBillStatus?.Description);
                const title = bill.Patient?.Title?.Description ? `${bill.Patient.Title.Description} ` : '';
                const firstName = bill.Patient?.FirstName || '';
                const lastName = bill.Patient?.LastName ? ` ${bill.Patient.LastName}` : '';
                const fullName = `${title}${firstName}${lastName}`.trim() || '-';
                const hasDue = Number(bill.OutStandingAmount) > 0;

                return (
                  <tr
                    key={bill.Id || index}
                    onMouseEnter={() => setHoveredRowId(bill.Id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isHovered ? '#f0fdf4' : index % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectRow(bill)}
                  >
                    {/* Select Action */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(bill);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                          transition: 'transform 0.15s, background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Select Bill"
                      >
                        <i className="fas fa-check" style={{ fontSize: '13px' }}></i>
                      </button>
                    </td>

                    {/* Bill No */}
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-receipt" style={{ color: '#64748b', fontSize: '12px' }}></i>
                        <span>{bill.BillNumber}</span>
                      </div>
                    </td>

                    {/* UHID */}
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {bill.Patient?.MRN || '-'}
                      </span>
                    </td>

                    {/* Patient Name */}
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        type="button"
                        onClick={(e) => handlePatientClick(e, bill.PatientId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#2563eb',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        title="Click to view patient profile"
                      >
                        <i className="fas fa-user-circle" style={{ color: '#93c5fd', fontSize: '14px' }}></i>
                        <span>{fullName}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '10px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {formatDateTime(bill.BillDateTime)}
                    </td>

                    {/* Bill Amount */}
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {formatCurrency(bill.BillAmount)}
                    </td>

                    {/* Discount Amount */}
                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748b' }}>
                      {formatCurrency(bill.BillDiscount)}
                    </td>

                    {/* Paid Amount */}
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                      {formatCurrency(bill.PaidAmount)}
                    </td>

                    {/* Due Amount */}
                    <td
                      style={{
                        padding: '10px 16px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: hasDue ? '#dc2626' : '#64748b',
                      }}
                    >
                      {formatCurrency(bill.OutStandingAmount)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {bill.PatientBillStatus?.Description || 'Completed'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Footer & Pagination */}
      <div
        style={{
          padding: '12px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{startItemIndex}</span>–
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{endItemIndex}</span> of{' '}
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalItems}</span> bills
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => fetchBills(1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
            title="First Page"
          >
            <i className="fas fa-angle-double-left"></i>
          </button>

          {/* Prev Page */}
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => fetchBills(currentPage - 1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
            title="Previous Page"
          >
            <i className="fas fa-angle-left"></i>
          </button>

          {/* Current Page Badge */}
          <div
            style={{
              minWidth: '32px',
              height: '32px',
              padding: '0 8px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentPage}
          </div>

          <span style={{ fontSize: '12px', color: '#64748b', margin: '0 4px' }}>of {totalPages}</span>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => fetchBills(currentPage + 1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
            title="Next Page"
          >
            <i className="fas fa-angle-right"></i>
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => fetchBills(totalPages)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
            title="Last Page"
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
