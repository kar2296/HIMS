import React from 'react';
import { colors, radii, spacing, typography, transitions } from '../components/ui/tokens';

export interface PaymentDetail {
  Id?: number;
  ReceiptDateTime?: string;
  PatientBill?: { BillNumber?: string; DoctorName?: string };
  ReceiptNumber?: string;
  Patient?: {
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Age?: number;
    Title?: { Description?: string };
    Gender?: { Description?: string };
  };
  PatientName?: string;
  User?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Encounter?: { VisitIdentifier?: string };
  EncounterTypeId?: number;
  PaymentTypeId?: number;
  AmountPaid?: number;
  PatientBillId?: number;
  PaymentType?: { Description?: string };
  ReceiptType?: { Description?: string };
  ReceiptStatus?: { Description?: string };
}

interface PaymodeChangeListScreenProps {
  showBillNoColumn?: boolean;
  reactProps?: {
    PaymentDetails?: PaymentDetail[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(val?: number | string): string {
  if (val == null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(val?: string): { date: string; time: string } {
  if (!val) return { date: '—', time: '' };
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

export const PaymodeChangeListScreen: React.FC<PaymodeChangeListScreenProps> = ({
  showBillNoColumn = true,
  reactProps,
  onAction,
}) => {
  const rows = reactProps?.PaymentDetails || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const isCash = (p: PaymentDetail) =>
    p.PaymentTypeId === 1 || (p.PaymentType?.Description || '').toLowerCase() === 'cash';

  const isCard = (p: PaymentDetail) =>
    p.PaymentTypeId === 5 ||
    p.PaymentTypeId === 6 ||
    (p.PaymentType?.Description || '').toLowerCase().includes('card');

  const isOther = (p: PaymentDetail) => !isCash(p) && !isCard(p);

  // Totals
  const totalCash = rows.reduce((sum, p) => sum + (isCash(p) ? Number(p.AmountPaid || 0) : 0), 0);
  const totalCard = rows.reduce((sum, p) => sum + (isCard(p) ? Number(p.AmountPaid || 0) : 0), 0);
  const totalOther = rows.reduce((sum, p) => sum + (isOther(p) ? Number(p.AmountPaid || 0) : 0), 0);
  const grandTotal = rows.reduce((sum, p) => sum + Number(p.AmountPaid || 0), 0);

  const thStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderBottom: '2px solid #e2e8f0',
    color: '#475569',
    fontWeight: 700,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '13px',
    color: '#0f172a',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: radii.xl,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      marginBottom: 30,
      fontFamily: typography.fontFamily,
    }}>
      {/* ─────────────────────────────────────────────────────────────
          1. DATA TABLE
      ───────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          minWidth: showBillNoColumn ? 1150 : 1020,
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ ...thStyle, width: 45, textAlign: 'center' }}>#</th>
              <th style={{ ...thStyle, width: 135 }}>Bill Date</th>
              {showBillNoColumn && <th style={{ ...thStyle, width: 130 }}>Bill Number</th>}
              <th style={{ ...thStyle, width: 140 }}>Receipt Number</th>
              <th style={{ ...thStyle, minWidth: 240 }}>Patient Details</th>
              <th style={{ ...thStyle, minWidth: 160 }}>Doctor</th>
              <th style={{ ...thStyle, width: 110, textAlign: 'right' }}>Cash</th>
              <th style={{ ...thStyle, width: 110, textAlign: 'right' }}>Card</th>
              <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>Cheque / Others</th>
              <th style={{ ...thStyle, width: 100, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showBillNoColumn ? 10 : 9} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    color: '#94a3b8',
                  }}>
                    <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: 24 }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                    No payment records found
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: 4 }}>
                    Select a date range (within 3 days) or enter a receipt/bill number and click <strong>Fetch Records</strong>.
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((p, idx) => {
                const dt = formatDateTime(p.ReceiptDateTime);
                const isIp = p.EncounterTypeId === 2;
                const patientTitle = p.Patient?.Title?.Description ? `${p.Patient.Title.Description} ` : '';
                const patientName = `${patientTitle}${p.Patient?.FirstName || ''} ${p.Patient?.LastName || ''}`.trim() || p.PatientName || 'Patient';
                const patientMrn = p.Patient?.MRN || '';
                const patientAge = p.Patient?.Age ? `${p.Patient.Age} Y` : '';
                const patientGender = p.Patient?.Gender?.Description || '';

                const doctorName =
                  p.PatientBill?.DoctorName ||
                  (p.User?.FirstName
                    ? `${p.User.Title?.Description ? `${p.User.Title.Description} ` : ''}${p.User.FirstName}`
                    : '—');

                const cashVal = isCash(p) ? (p.AmountPaid || 0) : 0;
                const cardVal = isCard(p) ? (p.AmountPaid || 0) : 0;
                const otherVal = isOther(p) ? (p.AmountPaid || 0) : 0;

                return (
                  <tr
                    key={p.Id ?? idx}
                    style={{
                      transition: transitions.default,
                      backgroundColor: idx % 2 === 1 ? '#fafcff' : '#ffffff',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#fafcff' : '#ffffff')}
                  >
                    {/* Index */}
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
                      {idx + 1}
                    </td>

                    {/* Bill Date */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{dt.date}</div>
                      {dt.time && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: 10, marginRight: 4 }} />
                          {dt.time}
                        </div>
                      )}
                    </td>

                    {/* Bill Number */}
                    {showBillNoColumn && (
                      <td style={tdStyle}>
                        {p.PatientBill?.BillNumber ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#334155',
                          }}>
                            <i className="fa-solid fa-file-lines" style={{ fontSize: 11, color: '#64748b' }} />
                            <span>{p.PatientBill.BillNumber}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    )}

                    {/* Receipt Number */}
                    <td style={tdStyle}>
                      {p.ReceiptNumber ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 9px',
                          borderRadius: radii.full,
                          backgroundColor: '#eff6ff',
                          border: '1px solid #dbeafe',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#1d4ed8',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                          <span>{p.ReceiptNumber}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    {/* Patient Details */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{patientName}</span>
                        {patientMrn && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 7px',
                            borderRadius: radii.sm,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            fontFamily: 'ui-monospace, monospace',
                          }}>
                            {patientMrn}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: radii.full,
                          backgroundColor: isIp ? '#f5f3ff' : '#ecfdf5',
                          color: isIp ? '#6d28d9' : '#059669',
                          border: isIp ? '1px solid #ddd6fe' : '1px solid #a7f3d0',
                        }}>
                          {isIp ? 'IP' : 'OP'}
                        </span>
                      </div>
                      {(patientAge || patientGender) && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {[patientAge, patientGender].filter(Boolean).join(' • ')}
                        </div>
                      )}
                    </td>

                    {/* Doctor */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                        {doctorName !== '—' && (
                          <i className="fa-solid fa-user-doctor" style={{ fontSize: 12, color: '#64748b' }} />
                        )}
                        <span style={{ fontWeight: 500 }}>{doctorName}</span>
                      </div>
                    </td>

                    {/* Cash */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: cashVal > 0 ? 700 : 500,
                        color: cashVal > 0 ? '#059669' : '#94a3b8',
                      }}>
                        {formatCurrency(cashVal)}
                      </span>
                    </td>

                    {/* Card */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: cardVal > 0 ? 700 : 500,
                        color: cardVal > 0 ? '#2563eb' : '#94a3b8',
                      }}>
                        {formatCurrency(cardVal)}
                      </span>
                    </td>

                    {/* Cheque / Others */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: otherVal > 0 ? 700 : 500,
                        color: otherVal > 0 ? '#d97706' : '#94a3b8',
                      }}>
                        {formatCurrency(otherVal)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* Change Paymode Button */}
                        <button
                          type="button"
                          onClick={() => dispatch('edit', { item: p })}
                          title="Change Payment Mode"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: radii.sm,
                            border: '1px solid #bfdbfe',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: transitions.default,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                        >
                          <i className="fa-solid fa-money-bill-transfer" style={{ fontSize: 13 }} />
                        </button>

                        {/* Print Bill / Receipt Button */}
                        <button
                          type="button"
                          onClick={() => dispatch('print', { item: p })}
                          title="Print Receipt / Bill"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: radii.sm,
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: transitions.default,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.color = '#475569';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <i className="fa-solid fa-print" style={{ fontSize: 13 }} />
                        </button>
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
          2. TABLE FOOTER: SUMMARY METRICS & RECORD COUNTER
      ───────────────────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          {/* Record Count */}
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{rows.length}</strong> payment {rows.length === 1 ? 'record' : 'records'}
          </div>

          {/* Collection Breakdown Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Cash Total */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: radii.full,
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: 12,
            }}>
              <span style={{ color: '#059669', fontWeight: 600 }}>Cash:</span>
              <strong style={{ color: '#047857', fontFamily: 'monospace' }}>{formatCurrency(totalCash)}</strong>
            </div>

            {/* Card Total */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: radii.full,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: 12,
            }}>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Card:</span>
              <strong style={{ color: '#1d4ed8', fontFamily: 'monospace' }}>{formatCurrency(totalCard)}</strong>
            </div>

            {/* Other Total */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: radii.full,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: 12,
            }}>
              <span style={{ color: '#d97706', fontWeight: 600 }}>Others:</span>
              <strong style={{ color: '#b45309', fontFamily: 'monospace' }}>{formatCurrency(totalOther)}</strong>
            </div>

            {/* Grand Total */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: radii.full,
              backgroundColor: '#ffffff',
              border: '1.5px solid #4f46e5',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.08)',
            }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total:
              </span>
              <span style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: '#4338ca',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
