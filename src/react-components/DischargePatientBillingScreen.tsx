import React, { useMemo } from 'react';
import { colors, radii, spacing, typography, shadows, transitions } from '../components/ui/tokens';
import { DatePicker } from '../components/ui/DatePicker';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';

export interface DischargePatientEntity {
  Id: number;
  VisitIdentifier?: string;
  BillDate?: string | Date;
  DischargeDate?: string | Date;
  BillNumber?: string;
  Patient?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: string | number;
    Title?: { Description?: string };
    Gender?: { Description?: string };
  };
  PatientId?: number;
  Doctor?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Guarantor?: {
    GuarantorName?: string;
  };
  GrossAmount?: number;
  BillDiscount?: number;
  NetAmount?: number;
  CancelReqRaisedStatusId?: number;
  [key: string]: any;
}

export interface LookupItem {
  Id: number;
  Text?: string;
  WardName?: string;
  GuarantorName?: string;
  FirstName?: string;
  LastName?: string;
  Title?: { Description?: string };
}

export interface DischargeFilter {
  fromdate?: string;
  todate?: string;
  PatientMRN?: string;
  BillNumber?: string;
  VisitIdentifier?: string;
  WardId?: number;
  GuarantorId?: number;
  DoctorId?: number;
  IsPaidFully?: boolean;
}

export interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface ReactPropsShape {
  items?: DischargePatientEntity[];
  lookup?: {
    Ward?: LookupItem[];
    Guarantor?: LookupItem[];
    Doctor?: LookupItem[];
  };
  currentfilter?: DischargeFilter;
  pager?: PagerObj;
  context?: string;
  loading?: boolean;
}

export interface DischargePatientBillingScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(val?: string | Date): string {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

function formatCurrency(val?: number | string): string {
  if (val == null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDoctorName(doc?: LookupItem): string {
  if (!doc) return '—';
  const title = doc.Title?.Description ? doc.Title.Description + ' ' : '';
  const first = doc.FirstName || '';
  const last = doc.LastName ? ' ' + doc.LastName : '';
  const full = `${title}${first}${last}`.trim();
  return full || doc.Text || '—';
}

export const DischargePatientBillingScreen: React.FC<DischargePatientBillingScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = { totalItems: 0, currentPage: 1, pageSize: 25 },
    context = '',
    loading = false,
  } = reactProps || {};

  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;
  const pageSize = pager.pageSize || 25;

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Convert lookups to dropdown options
  const wardOptions = useMemo(() => {
    const list = lookup.Ward || [];
    return [
      { value: -1, label: 'All Wards' },
      ...list.map((w) => ({ value: w.Id, label: w.WardName || w.Text || `Ward ${w.Id}` })),
    ];
  }, [lookup.Ward]);

  const payerOptions = useMemo(() => {
    const list = lookup.Guarantor || [];
    return [
      { value: -1, label: 'All Payers' },
      ...list.map((g) => ({ value: g.Id, label: g.GuarantorName || g.Text || `Payer ${g.Id}` })),
    ];
  }, [lookup.Guarantor]);

  const doctorOptions = useMemo(() => {
    const list = lookup.Doctor || [];
    return [
      { value: -1, label: 'All Doctors' },
      ...list.map((d) => ({ value: d.Id, label: getDoctorName(d) })),
    ];
  }, [lookup.Doctor]);

  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textMain, padding: '4px 0 24px 0' }}>
      {/* ─────────────────────────────────────────────────────────────
           1. MODERN ENTERPRISE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          border: `1px solid ${colors.border}`,
          padding: `${spacing.md} ${spacing.lg}`,
          marginBottom: spacing.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(30, 64, 175, 0.25)',
            }}
          >
            <i className="fas fa-file-invoice-dollar" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: colors.textMain,
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Discharge Billing
            </h2>
            <div
              style={{
                fontSize: '12px',
                color: colors.textMuted,
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              In-Patient Discharged Encounters &amp; Financial Settlement Records
            </div>
          </div>
        </div>

        {/* Header Search Boxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          {/* Patient Name / MRN */}
          <div style={{ position: 'relative', width: 175 }}>
            <i
              className="fas fa-user"
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="dpb-search-input"
              placeholder="NAME / MRN"
              value={currentfilter.PatientMRN || ''}
              onChange={(e) => dispatch('filterChange', { field: 'PatientMRN', value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') dispatch('search');
              }}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1.5px solid ${colors.border}`,
                fontSize: '12.5px',
                fontFamily: typography.fontFamily,
                color: colors.textMain,
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: transitions.default,
              }}
            />
          </div>

          {/* Bill Number */}
          <div style={{ position: 'relative', width: 150 }}>
            <i
              className="fas fa-receipt"
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="dpb-search-input"
              placeholder="Bill #"
              value={currentfilter.BillNumber || ''}
              onChange={(e) => dispatch('filterChange', { field: 'BillNumber', value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') dispatch('search');
              }}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1.5px solid ${colors.border}`,
                fontSize: '12.5px',
                fontFamily: typography.fontFamily,
                color: colors.textMain,
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: transitions.default,
              }}
            />
          </div>

          {/* IP Number */}
          <div style={{ position: 'relative', width: 150 }}>
            <i
              className="fas fa-bed"
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="dpb-search-input"
              placeholder="IP #"
              value={currentfilter.VisitIdentifier || ''}
              onChange={(e) => dispatch('filterChange', { field: 'VisitIdentifier', value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') dispatch('search');
              }}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1.5px solid ${colors.border}`,
                fontSize: '12.5px',
                fontFamily: typography.fontFamily,
                color: colors.textMain,
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: transitions.default,
              }}
            />
          </div>

          {/* Search Action Button */}
          <button
            type="button"
            onClick={() => dispatch('search')}
            title="Execute Search"
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.28)',
              transition: transitions.default,
            }}
          >
            <i className="fas fa-search" style={{ fontSize: '13px' }} />
          </button>

          {/* Optional Return Home Button */}
          {context === 'billing' && (
            <button
              type="button"
              onClick={() => dispatch('home')}
              title="Return to Dashboard"
              style={{
                width: 38,
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: colors.textMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: transitions.default,
              }}
            >
              <i className="fas fa-home" style={{ fontSize: '14px' }} />
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
           2. MODERN FILTERS BAR
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          border: `1px solid ${colors.border}`,
          padding: '14px 18px',
          marginBottom: spacing.md,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: spacing.md,
            alignItems: 'flex-end',
          }}
        >
          {/* From Date */}
          <div>
            <DatePicker
              label="From"
              value={currentfilter.fromdate || ''}
              onChange={(val) => dispatch('filterChangeAndSearch', { field: 'fromdate', value: val })}
            />
          </div>

          {/* To Date */}
          <div>
            <DatePicker
              label="To"
              value={currentfilter.todate || ''}
              onChange={(val) => dispatch('filterChangeAndSearch', { field: 'todate', value: val })}
            />
          </div>

          {/* Ward Select */}
          <div>
            <Select
              label="Select Ward"
              value={currentfilter.WardId ?? -1}
              onChange={(val) => dispatch('filterChangeAndSearch', { field: 'WardId', value: Number(val) })}
              options={wardOptions}
            />
          </div>

          {/* Payer Select */}
          <div>
            <Select
              label="Payer"
              value={currentfilter.GuarantorId ?? -1}
              onChange={(val) => dispatch('filterChangeAndSearch', { field: 'GuarantorId', value: Number(val) })}
              options={payerOptions}
            />
          </div>

          {/* Doctor Select */}
          <div>
            <Select
              label="Doctor"
              value={currentfilter.DoctorId ?? -1}
              onChange={(val) => dispatch('filterChangeAndSearch', { field: 'DoctorId', value: Number(val) })}
              options={doctorOptions}
            />
          </div>

          {/* Due Bills Only & Refresh Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
              height: 38,
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '12.5px',
                fontWeight: 600,
                color: colors.textMain,
                cursor: 'pointer',
                margin: 0,
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={!!currentfilter.IsPaidFully}
                onChange={(e) => dispatch('isduebill', { value: e.target.checked })}
                style={{
                  accentColor: colors.primary,
                  width: 16,
                  height: 16,
                  cursor: 'pointer',
                }}
              />
              <span>Due Bills Only</span>
            </label>

            <button
              type="button"
              onClick={() => dispatch('search')}
              title="Refresh List"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceMuted,
                color: colors.textMain,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: transitions.default,
                height: 36,
              }}
            >
              <i className="fas fa-sync-alt" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
           3. MODERN DATA TABLE CARD
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 1050 }}>
            <thead>
              <tr
                style={{
                  backgroundColor: colors.surfaceMuted,
                  borderBottom: `2px solid ${colors.border}`,
                }}
              >
                <th style={{ ...thStyle, width: 50, textAlign: 'center' }}>S.No</th>
                <th style={{ ...thStyle, width: 100 }}>IP Number</th>
                <th style={{ ...thStyle, width: 125 }}>Bill Date</th>
                <th style={{ ...thStyle, width: 125 }}>Discharge Date</th>
                <th style={{ ...thStyle, width: 110 }}>Bill No</th>
                <th style={{ ...thStyle, minWidth: 180, maxWidth: 260 }}>Patient Name</th>
                <th style={{ ...thStyle, minWidth: 140, maxWidth: 180 }}>Admitting Doctor</th>
                <th style={{ ...thStyle, minWidth: 100 }}>Payer</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Bill Amount</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Discount Amount</th>
                <th style={{ ...thStyle, width: 105, textAlign: 'right' }}>Net Amount</th>
                <th className="dpb-sticky-actions-th" style={{ ...thStyle, width: 85, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ padding: '60px 20px', textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: colors.primary, marginBottom: 12 }} />
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Loading discharged patient records...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '60px 20px', textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-file-invoice" style={{ fontSize: '38px', color: '#cbd5e1', marginBottom: 12 }} />
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain }}>No records found</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: 4 }}>
                      Try adjusting the date range, search filters, or clearing the query.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((entity, idx) => {
                  const sNo = startRecord + idx;
                  const patientTitle = entity.Patient?.Title?.Description ? entity.Patient.Title.Description + ' ' : '';
                  const patientName = `${patientTitle}${entity.Patient?.FirstName || ''} ${entity.Patient?.LastName || ''}`.trim();
                  const patientMrn = entity.Patient?.MRN || '';
                  const patientAge = entity.Patient?.Age ? `${entity.Patient.Age}` : '';
                  const patientGender = entity.Patient?.Gender?.Description || '';
                  const patientDisplay = `${patientName || 'Patient'}${patientMrn ? ` / ${patientMrn}` : ''}${
                    patientAge ? ` / ${patientAge}` : ''
                  }${patientGender ? ` / ${patientGender}` : ''}`;

                  const doctorTitle = entity.Doctor?.Title?.Description ? entity.Doctor.Title.Description + ' ' : '';
                  const doctorName = `${doctorTitle}${entity.Doctor?.FirstName || ''} ${entity.Doctor?.LastName || ''}`.trim() || '—';

                  const payerName = entity.Guarantor?.GuarantorName || 'Self / Cash';

                  const gross = entity.GrossAmount ?? 0;
                  const discount = entity.BillDiscount ?? 0;
                  const net = entity.NetAmount ?? (gross - discount);

                  const cancelStatus = entity.CancelReqRaisedStatusId;

                  return (
                    <tr
                      key={entity.Id ?? idx}
                      style={{
                        borderBottom: `1px solid ${colors.surfaceSunken}`,
                        transition: transitions.default,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfdfd',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfdfd')
                      }
                    >
                      {/* S.No */}
                      <td style={{ ...tdStyle, textAlign: 'center', color: colors.textMuted, fontWeight: 500 }}>
                        {sNo}
                      </td>

                      {/* IP Number */}
                      <td style={{ ...tdStyle, fontWeight: 600, color: colors.textMain }}>
                        {entity.VisitIdentifier || '—'}
                      </td>

                      {/* Bill Date */}
                      <td style={{ ...tdStyle, fontSize: '12px', color: '#475569' }}>
                        {formatDate(entity.BillDate)}
                      </td>

                      {/* Discharge Date */}
                      <td style={{ ...tdStyle, fontSize: '12px', color: '#475569' }}>
                        {formatDate(entity.DischargeDate)}
                      </td>

                      {/* Bill No */}
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#334155' }}>
                        {entity.BillNumber || '—'}
                      </td>

                      {/* Patient Name (Clickable link) */}
                      <td style={{ ...tdStyle, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a
                          href=""
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch('patientinfo', { entity });
                          }}
                          style={{
                            color: colors.primary,
                            fontWeight: 600,
                            textDecoration: 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          title={patientDisplay}
                        >
                          {patientDisplay}
                        </a>
                      </td>

                      {/* Admitting Doctor */}
                      <td style={{ ...tdStyle, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doctorName}>
                        {doctorName}
                      </td>

                      {/* Payer */}
                      <td style={{ ...tdStyle, color: '#475569' }}>{payerName}</td>

                      {/* Bill Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(gross)}
                      </td>

                      {/* Discount Amount */}
                      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: discount > 0 ? '#b91c1c' : '#64748b' }}>
                        {formatCurrency(discount)}
                      </td>

                      {/* Net Amount */}
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#0f172a',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatCurrency(net)}
                      </td>

                      {/* Actions */}
                      <td className="dpb-sticky-actions-td" style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Navigate to IP Billing Tab Summary */}
                          <button
                            type="button"
                            onClick={() => dispatch('edit', { entity })}
                            title="In-Patient Billing Tab"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: radii.sm,
                              border: 'none',
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
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                          >
                            <i className="fas fa-procedures" style={{ fontSize: '13px' }} />
                          </button>

                          {/* Cancel Request (when not already raised) */}
                          {!(cancelStatus === 1 || cancelStatus === 2) && (
                            <button
                              type="button"
                              onClick={() => dispatch('cancelrequest', { entity })}
                              title="Cancel Request"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: 'none',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: transitions.default,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                            >
                              <i className="fas fa-trash-alt" style={{ fontSize: '12px' }} />
                            </button>
                          )}

                          {/* Cancel Bill (when CancelReqRaisedStatusId == 2) */}
                          {cancelStatus === 2 && (
                            <button
                              type="button"
                              onClick={() => dispatch('cancel', { entity })}
                              title="Cancel Bill"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: radii.sm,
                                border: 'none',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: transitions.default,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#b91c1c';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#b91c1c';
                              }}
                            >
                              <i className="fas fa-times" style={{ fontSize: '14px' }} />
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
             4. PAGINATION FOOTER
        ───────────────────────────────────────────────────────────── */}
        {totalItems > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderTop: `1px solid ${colors.border}`,
              backgroundColor: '#ffffff',
              flexWrap: 'wrap',
              gap: spacing.md,
            }}
          >
            <div style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500 }}>
              Showing <span style={{ fontWeight: 600, color: colors.textMain }}>{startRecord}</span> to{' '}
              <span style={{ fontWeight: 600, color: colors.textMain }}>{endRecord}</span> of{' '}
              <span style={{ fontWeight: 600, color: colors.textMain }}>{totalItems}</span> records
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => dispatch('pageChange', { page })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: colors.textMuted,
  padding: '12px 14px',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '12.5px',
  color: colors.textMain,
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};
