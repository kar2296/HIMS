import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { colors, radii, shadows, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  receipt?: string;
  namemrn?: string;
  ReceiptTypeId?: number;
  ReceiptStatusId?: number;
  Fromreceiptdate?: string; // ISO yyyy-mm-dd
  Toreceiptdate?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface ReceiptRow {
  Id: number;
  ReceiptNumber?: string;
  ReceiptDateTime?: string;
  Patient?: {
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number;
    Gender?: { Description?: string };
  };
  PatientId?: number;
  EncounterId?: number;
  ReceiptType?: { Description?: string };
  AmountPaid?: number;
  PaymentType?: { Description?: string };
  ReceiptStatus?: { Description?: string };
  ReceiptStatusId?: number;
  PaymentStatusId?: number;
}

interface BillingReceiptListScreenProps {
  reactProps?: {
    items?: ReceiptRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ReceiptType?: LookupItem[]; ReceiptStatus?: LookupItem[] };
    totalAmount?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatReceiptDateTime(val?: string): { date: string; time: string } {
  if (!val) return { date: '-', time: '' };
  const d = new Date(val);
  if (isNaN(d.getTime())) return { date: val, time: '' };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return {
    date: `${dd}-${mmm}-${yyyy}`,
    time: `${hh}:${min}`,
  };
}

function formatCurrency(val?: number | string): string {
  if (val == null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status?: string, statusId?: number) {
  const s = (status || '').toLowerCase();
  if (statusId === 1 || s.includes('complete')) {
    return {
      bg: '#ecfdf5',
      color: '#059669',
      border: '#a7f3d0',
      dot: '#10b981',
      label: status || 'Completed',
    };
  }
  if (statusId === 2 || s.includes('draft')) {
    return {
      bg: '#fffbeb',
      color: '#d97706',
      border: '#fde68a',
      dot: '#f59e0b',
      label: status || 'Draft',
    };
  }
  if (statusId === 4 || s.includes('refund')) {
    return {
      bg: '#eff6ff',
      color: '#2563eb',
      border: '#bfdbfe',
      dot: '#3b82f6',
      label: status || 'Refunded',
    };
  }
  if (statusId === 3 || s.includes('cancel')) {
    return {
      bg: '#fef2f2',
      color: '#dc2626',
      border: '#fecaca',
      dot: '#ef4444',
      label: status || 'Cancelled',
    };
  }
  return {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    dot: '#64748b',
    label: status || 'Unknown',
  };
}

function getPaymentModeBadge(mode?: string) {
  const m = (mode || '').toLowerCase();
  if (m.includes('cash')) {
    return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: 'fa fa-money-bill-wave' };
  }
  if (m.includes('upi') || m.includes('online')) {
    return { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff', icon: 'fa fa-mobile-screen-button' };
  }
  if (m.includes('card')) {
    return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: 'fa fa-credit-card' };
  }
  if (m.includes('cheque') || m.includes('check')) {
    return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: 'fa fa-money-check' };
  }
  return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: 'fa fa-wallet' };
}

function getReceiptTypeBadge(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('ip advance') || t.includes('inpatient')) {
    return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
  }
  if (t.includes('op advance') || t.includes('outpatient')) {
    return { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' };
  }
  if (t.includes('pharmacy')) {
    return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
  }
  if (t.includes('due') || t.includes('collect')) {
    return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
  }
  if (t.includes('transfer')) {
    return { bg: '#fefce8', color: '#a16207', border: '#fef08a' };
  }
  if (t.includes('adjustment')) {
    return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
  }
  return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0' };
}

export const BillingReceiptListScreen: React.FC<BillingReceiptListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
    totalAmount,
  } = reactProps || {};

  const receiptTypeOptions = lookup?.ReceiptType || [];
  const receiptStatusOptions = lookup?.ReceiptStatus || [];

  const [receiptNo, setReceiptNo] = useState(currentfilter.receipt || '');
  useEffect(() => { setReceiptNo(currentfilter.receipt || ''); }, [currentfilter.receipt]);

  const [nameMrn, setNameMrn] = useState(currentfilter.namemrn || '');
  useEffect(() => { setNameMrn(currentfilter.namemrn || ''); }, [currentfilter.namemrn]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const handleSearchSubmit = () => {
    dispatch('search', { receipt: receiptNo, namemrn: nameMrn });
  };

  const handleClearFilters = () => {
    setReceiptNo('');
    setNameMrn('');
    dispatch('search', { receipt: '', namemrn: '' });
  };

  return (
    <div style={{
      padding: '16px 20px 80px',
      fontFamily: typography.fontFamily,
      boxSizing: 'border-box',
    }}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP ACTION & NAVIGATION HEADER
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: radii.lg,
        padding: '14px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 16,
      }}>
        {/* Title Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: radii.md,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
          }}>
            <i className="fa-solid fa-receipt" style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.01em',
              }}>
                Receipts
              </h1>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}>
                Billing Receipts & Collections
              </span>
            </div>
            <p style={{
              margin: '2px 0 0',
              fontSize: 12,
              color: '#64748b',
            }}>
              Inpatient, Outpatient, Advance receipts and payment history
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => dispatch('pickPatient')}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <i className="fa-solid fa-clock-rotate-left" style={{ color: '#64748b' }} />
            Previous Bills
          </button>

          <button
            type="button"
            onClick={() => dispatch('addNew')}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.28)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.38)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.28)';
            }}
          >
            <i className="fa-solid fa-plus" />
            New Receipt
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MODERN FILTER CARD
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: radii.lg,
        padding: '14px 18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 16,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          alignItems: 'flex-end',
        }}>
          {/* Receipt No */}
          <div>
            <Input
              label="Receipt No"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
              placeholder="REC24-25/..."
              leftIcon="fa fa-receipt"
            />
          </div>

          {/* Name / MRN */}
          <div>
            <Input
              label="Patient Name / MRN"
              value={nameMrn}
              onChange={(e) => setNameMrn(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
              placeholder="Search Name or MRN..."
              leftIcon="fa fa-user"
            />
          </div>

          {/* Receipt Type */}
          <div>
            <Select
              label="Receipt Type"
              value={currentfilter.ReceiptTypeId != null ? String(currentfilter.ReceiptTypeId) : ''}
              options={receiptTypeOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('typeFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All Types"
            />
          </div>

          {/* From Date */}
          <div>
            <DatePicker
              label="From Date"
              value={currentfilter.Fromreceiptdate || ''}
              onChange={(v) => dispatch('fromDateChange', { value: v })}
            />
          </div>

          {/* To Date */}
          <div>
            <DatePicker
              label="To Date"
              value={currentfilter.Toreceiptdate || ''}
              onChange={(v) => dispatch('toDateChange', { value: v })}
            />
          </div>

          {/* Status */}
          <div>
            <Select
              label="Status"
              value={currentfilter.ReceiptStatusId != null ? String(currentfilter.ReceiptStatusId) : ''}
              options={receiptStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All Statuses"
            />
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleSearchSubmit}
              title="Search"
              style={{
                flex: 1,
                height: 34,
                borderRadius: radii.md,
                border: 'none',
                background: colors.primary,
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
              Search
            </button>

            {(receiptNo || nameMrn) && (
              <button
                type="button"
                onClick={handleClearFilters}
                title="Clear"
                style={{
                  height: 34,
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RECEIPT LIST TABLE CARD
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: radii.lg,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: 13,
            textAlign: 'left',
          }}>
            <thead style={{
              backgroundColor: '#f8fafc',
            }}>
              <tr>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  minWidth: 130,
                }}>
                  Receipt No
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  minWidth: 140,
                }}>
                  Receipt Date
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  minWidth: 260,
                }}>
                  Patient Details
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  minWidth: 120,
                }}>
                  Type
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  minWidth: 130,
                }}>
                  Amount
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  minWidth: 120,
                }}>
                  Payment Mode
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  minWidth: 110,
                }}>
                  Status
                </th>
                <th style={{
                  padding: '11px 14px',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  minWidth: 110,
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-folder-open" style={{ fontSize: 32, color: '#cbd5e1' }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>No receipts found</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Try adjusting your filters or date range</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, index) => {
                  const statusInfo = getStatusBadge(row.ReceiptStatus?.Description, row.ReceiptStatusId);
                  const paymentInfo = getPaymentModeBadge(row.PaymentType?.Description);
                  const typeInfo = getReceiptTypeBadge(row.ReceiptType?.Description);
                  const dateInfo = formatReceiptDateTime(row.ReceiptDateTime);

                  const p = row.Patient;
                  const patientTitle = p?.Title?.Description ? `${p.Title.Description} ` : '';
                  const patientName = p ? `${patientTitle}${p.FirstName || ''} ${p.LastName || ''}`.trim() : '-';
                  const patientMrn = p?.MRN || '';
                  const patientAge = p?.Age != null ? `${p.Age} Y` : '';
                  const patientGender = p?.Gender?.Description || '';

                  return (
                    <tr
                      key={row.Id || index}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fbfcfd',
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fbfcfd'; }}
                    >
                      {/* Receipt No */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: 600,
                        color: '#0f172a',
                        fontSize: 12.5,
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                          }} />
                          {row.ReceiptNumber}
                        </span>
                      </td>

                      {/* Receipt Date */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        color: '#334155',
                        whiteSpace: 'nowrap',
                        fontSize: 12.5,
                      }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{dateInfo.date}</div>
                        {dateInfo.time && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>{dateInfo.time}</div>
                        )}
                      </td>

                      {/* Patient Details */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                              {patientName}
                            </span>
                            {patientMrn && (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 4,
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                fontFamily: 'monospace',
                              }}>
                                {patientMrn}
                              </span>
                            )}
                          </div>
                          {(patientAge || patientGender) && (
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>
                              {[patientAge, patientGender].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Receipt Type */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 8px',
                          borderRadius: radii.sm,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: typeInfo.bg,
                          color: typeInfo.color,
                          border: `1px solid ${typeInfo.border}`,
                        }}>
                          {row.ReceiptType?.Description || '-'}
                        </span>
                      </td>

                      {/* Receipt Amount */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: '#0f172a',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      }}>
                        {formatCurrency(row.AmountPaid)}
                      </td>

                      {/* Payment Mode */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '2px 8px',
                          borderRadius: radii.sm,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: paymentInfo.bg,
                          color: paymentInfo.color,
                          border: `1px solid ${paymentInfo.border}`,
                        }}>
                          <i className={paymentInfo.icon} style={{ fontSize: 10 }} />
                          {row.PaymentType?.Description || '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.border}`,
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: statusInfo.dot,
                          }} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* View */}
                          <button
                            type="button"
                            title="View Receipt"
                            onClick={() => dispatch('view', row)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.sm,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.12s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.borderColor = '#93c5fd';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                          >
                            <i className="fa-regular fa-eye" style={{ fontSize: 13 }} />
                          </button>

                          {/* Refund */}
                          {(row.ReceiptStatusId === 1 || row.ReceiptStatusId === 3) && (
                            <button
                              type="button"
                              title="Refund Receipt"
                              onClick={() => dispatch('refund', row)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: '1px solid #a7f3d0',
                                backgroundColor: '#f0fdf4',
                                color: '#059669',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dcfce7';
                                e.currentTarget.style.borderColor = '#86efac';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0fdf4';
                                e.currentTarget.style.borderColor = '#a7f3d0';
                              }}
                            >
                              <i className="fa-solid fa-money-bill-wave" style={{ fontSize: 12 }} />
                            </button>
                          )}

                          {/* Print Refund */}
                          {row.ReceiptStatusId === 4 && (
                            <button
                              type="button"
                              title="Print Refund"
                              onClick={() => dispatch('refundview', row)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: '1px solid #c7d2fe',
                                backgroundColor: '#eef2ff',
                                color: '#4338ca',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e0e7ff';
                                e.currentTarget.style.borderColor = '#a5b4fc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#eef2ff';
                                e.currentTarget.style.borderColor = '#c7d2fe';
                              }}
                            >
                              <i className="fa-solid fa-print" style={{ fontSize: 12 }} />
                            </button>
                          )}

                          {/* Edit (for Draft status 2) */}
                          {row.ReceiptStatusId === 2 && (
                            <button
                              type="button"
                              title="Edit Receipt"
                              onClick={() => dispatch('edit', row)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: '1px solid #fde68a',
                                backgroundColor: '#fffbeb',
                                color: '#d97706',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef3c7';
                                e.currentTarget.style.borderColor = '#fcd34d';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fffbeb';
                                e.currentTarget.style.borderColor = '#fde68a';
                              }}
                            >
                              <i className="fa-solid fa-pen" style={{ fontSize: 12 }} />
                            </button>
                          )}

                          {/* Delete (for Draft status 2) */}
                          {row.ReceiptStatusId === 2 && (
                            <button
                              type="button"
                              title="Delete Receipt"
                              onClick={() => dispatch('delete', row)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: '1px solid #fecaca',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                e.currentTarget.style.borderColor = '#fca5a5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                              }}
                            >
                              <i className="fa-solid fa-trash-can" style={{ fontSize: 12 }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. TABLE FOOTER: SUMMARY CHIP & PAGINATION
        ───────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          {/* Record Count */}
          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            {totalItems > 0 ? (
              <span>
                Showing <strong style={{ color: '#0f172a' }}>{startIndex}</strong> to{' '}
                <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of{' '}
                <strong style={{ color: '#0f172a' }}>{totalItems}</strong> receipts
              </span>
            ) : (
              <span>0 receipts</span>
            )}
          </div>

          {/* Total Amount Badge */}
          {totalAmount != null && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 9999,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Amount:
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#059669',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}>
                {formatCurrency(totalAmount)}
              </span>
            </div>
          )}

          {/* Pagination Controls */}
          <div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => dispatch('pageChange', { page })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
