import React, { useState, useMemo } from 'react';
import { colors, radii, shadows, typography, spacing } from '../components/ui/tokens';

export interface IpBillingSummaryScreenProps {
  reactProps?: {
    EncounterInfo?: any;
    Data?: any;
    selectedPatient?: any;
    item?: any;
    currentcontext?: any;
    PatientSummaryDetails?: any[];
    SupplementaryDetails?: any[];
    PackageDetails?: any[];
    lookup?: {
      DiscountMode?: any[];
      DiscountApprover?: any[];
      GuarantorType?: any[];
      SettlementType?: any[];
      PaymentType?: any[];
      FamilyLink?: any[];
      Guarantor?: any[];
      PrivateDueApprover?: any[];
      Bank?: any[];
      CardType?: any[];
    };
    currentfilter?: any;
    isFinalized?: boolean;
    MultiPay?: boolean;
    moudiscount?: number;
    candisabledischargebtn?: boolean;
    canShowSaveBtn?: boolean;
    isSaving?: boolean;
    privileges?: {
      CanIPSUM_PRINT?: boolean;
      CanIPSUM_INSURANCE?: boolean;
      CanIPSUM_PHARMACY?: boolean;
      CanIPSUM_DISCHARGE?: boolean;
      CanIPSUM_FINALIZE?: boolean;
      CanIPSUM_BILL_LOCK?: boolean;
      IPDiscount?: boolean;
      [key: string]: any;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IpBillingSummaryScreen: React.FC<IpBillingSummaryScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const {
    EncounterInfo = {},
    Data = {},
    item = {},
    currentcontext = {},
    PatientSummaryDetails = [],
    SupplementaryDetails = [],
    PackageDetails = [],
    lookup = {},
    currentfilter = {},
    isFinalized = false,
    MultiPay = false,
    moudiscount = 0,
    candisabledischargebtn = false,
    isSaving = false,
    privileges = {},
  } = reactProps || {};

  // Local UI states
  const [consultationOpen, setConsultationOpen] = useState(true);
  const [billDetailsOpen, setBillDetailsOpen] = useState(true);
  const [secondaryGuarantorOpen, setSecondaryGuarantorOpen] = useState(true);
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
  const [billItemsSearch, setBillItemsSearch] = useState('');

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  // Currency formatter
  const formatCurrency = (amount?: number | string) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return '₹0.00';
    }
    const num = Number(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Date formatter
  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${mins}`;
    } catch {
      return String(dateVal);
    }
  };

  // Filtered supplementary items
  const filteredBillItems = useMemo(() => {
    if (!SupplementaryDetails || !Array.isArray(SupplementaryDetails)) return [];
    if (!billItemsSearch.trim()) return SupplementaryDetails;
    const q = billItemsSearch.toLowerCase();
    return SupplementaryDetails.filter((b) =>
      b.ServiceName?.toLowerCase().includes(q) ||
      b.BillNumber?.toLowerCase().includes(q) ||
      b.ItemCode?.toLowerCase().includes(q)
    );
  }, [SupplementaryDetails, billItemsSearch]);

  // Derived flags
  const isPackageAssigned = Boolean(EncounterInfo?.IsPackageAssigned);
  const isInsurance = Boolean(item?.GuarantorTypeId > 1 || currentfilter?.GuarantorTypeId > 1);
  const isBillLock = Boolean(item?.IsBillLock);

  // Grouped category totals
  const categoriesGrossTotal = useMemo(() => {
    if (!PatientSummaryDetails || !Array.isArray(PatientSummaryDetails)) return 0;
    return PatientSummaryDetails.reduce((sum, c) => sum + (Number(c.GroupGrossAmount) || 0), 0);
  }, [PatientSummaryDetails]);

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: '#0f172a',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: PACKAGE DETAILS (IF ASSIGNED)
      ───────────────────────────────────────────────────────────── */}
      {isPackageAssigned && PackageDetails && PackageDetails.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radii.md,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                <i className="fas fa-box" />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Assigned Package Details
                </h3>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Inclusions and Exclusions Breakdown
                </span>
              </div>
            </div>
          </div>

          {PackageDetails.map((pkg: any, idx: number) => (
            <div
              key={idx}
              style={{
                background: '#faf5ff',
                borderRadius: radii.md,
                border: '1px solid #e9d5ff',
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#581c87' }}>
                    {pkg.IPPackageName || pkg.PackageName || 'Standard IP Package'}
                  </span>
                  <span style={{ fontSize: 12, color: '#7e22ce', marginLeft: 10 }}>
                    Fixed Rate: <strong>{formatCurrency(pkg.PackageAmount)}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch('editBill', pkg)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: radii.sm,
                    border: '1px solid #a855f7',
                    background: '#ffffff',
                    color: '#7e22ce',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: 4 }} /> Edit Package
                </button>
              </div>

              {/* Package Inclusion & Exclusion Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div style={{ background: '#ffffff', padding: 10, borderRadius: radii.sm, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#059669', fontWeight: 700, marginBottom: 4 }}>
                    Package Inclusions
                  </div>
                  <div>Net Inclusion: {formatCurrency(pkg.NetInclusion)}</div>
                </div>
                <div style={{ background: '#ffffff', padding: 10, borderRadius: radii.sm, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#dc2626', fontWeight: 700, marginBottom: 4 }}>
                    Package Exclusions
                  </div>
                  <div>Net Exclusion: {formatCurrency(pkg.NetExclusion)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: PRIMARY CONSULTATION BILL / SERVICE CATEGORIES
      ───────────────────────────────────────────────────────────── */}
      {!isPackageAssigned && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {/* Card Header (Collapsible) */}
          <div
            onClick={() => setConsultationOpen(!consultationOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-stethoscope" style={{ fontSize: 15 }} />
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}>
                {currentcontext?.RankFirstGuarantor || 'CASH / Inpatient Consultation Bill'}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.22)',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {PatientSummaryDetails?.length || 0} Categories
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                Subtotal: {formatCurrency(currentcontext?.viewGrossAmount || categoriesGrossTotal)}
              </span>
              <i
                className={`fas fa-chevron-${consultationOpen ? 'up' : 'down'}`}
                style={{ fontSize: 13, transition: 'transform 0.2s ease' }}
              />
            </div>
          </div>

          {/* Card Body */}
          {consultationOpen && (
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: radii.md,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category Name</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Gross Amount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Discount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Tax Amount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Net Amount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!PatientSummaryDetails || PatientSummaryDetails.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                          <i className="fas fa-folder-open" style={{ fontSize: 24, display: 'block', marginBottom: 6, color: '#cbd5e1' }} />
                          No billing categories found for this encounter.
                        </td>
                      </tr>
                    ) : (
                      PatientSummaryDetails.filter((b: any) => b.Status === 1 || b.Status === undefined).map((bill: any, idx: number) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '9px 14px', fontWeight: 600, color: '#0f172a' }}>
                            {bill.ServiceCategory?.ServiceCategoryName || bill.CategoryName || 'General Services'}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 500, fontFamily: 'monospace' }}>
                            {formatCurrency(bill.GroupGrossAmount)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: bill.GroupDiscountAmount > 0 ? '#dc2626' : '#64748b', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.GroupDiscountAmount)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.GroupTaxAmount)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.GroupNetAmount)}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {/* Category Print */}
                              <button
                                type="button"
                                onClick={() => dispatch('print3', {
                                  bill: bill,
                                  CategoryId: bill.ServiceCategoryId,
                                  CategoryName: bill.ServiceCategory?.ServiceCategoryName,
                                })}
                                title="Print Category Bill"
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#475569',
                                  borderRadius: radii.sm,
                                  width: 28,
                                  height: 28,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <i className="fas fa-print" style={{ fontSize: 12 }} />
                              </button>

                              {/* View Details Eye */}
                              <button
                                type="button"
                                onClick={() => dispatch('plusopensupplementary', bill)}
                                title="View Item Details"
                                style={{
                                  border: '1px solid #bfdbfe',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  borderRadius: radii.sm,
                                  width: 28,
                                  height: 28,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <i className="fas fa-eye" style={{ fontSize: 12 }} />
                              </button>

                              {/* Intermediate details for Pharmacy (category 49) */}
                              {bill.ServiceCategoryId === 49 && bill.GroupGrossAmount !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => dispatch('intermediateBillDetails', bill)}
                                  title="Pharmacy Bill Modifications"
                                  style={{
                                    border: '1px solid #fecaca',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    borderRadius: radii.sm,
                                    width: 28,
                                    height: 28,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <i className="fas fa-coins" style={{ fontSize: 12 }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {PatientSummaryDetails && PatientSummaryDetails.length > 0 && (
                    <tfoot>
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
                        <td style={{ padding: '9px 14px' }}>Total Category Amount</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(categoriesGrossTotal)}
                        </td>
                        <td colSpan={2} />
                        <td style={{ padding: '9px 14px', textAlign: 'right', color: '#059669', fontSize: 14, fontFamily: 'monospace' }}>
                          {formatCurrency(currentcontext?.viewGrossAmount || categoriesGrossTotal)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: BILL DETAILS (SUPPLEMENTARY ITEMS)
      ───────────────────────────────────────────────────────────── */}
      {!isPackageAssigned && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {/* Card Header (Collapsible) */}
          <div
            onClick={() => setBillDetailsOpen(!billDetailsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-list-check" style={{ color: '#2563eb', fontSize: 15 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                Bill Item Details
              </span>
              <span
                style={{
                  background: '#e2e8f0',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {SupplementaryDetails?.length || 0} Items
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i
                className={`fas fa-chevron-${billDetailsOpen ? 'up' : 'down'}`}
                style={{ fontSize: 13, color: '#64748b' }}
              />
            </div>
          </div>

          {/* Card Body */}
          {billDetailsOpen && (
            <div style={{ padding: '12px 16px' }}>
              {/* Filter and count header */}
              {SupplementaryDetails && SupplementaryDetails.length > 0 && (
                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ position: 'relative', width: 280 }}>
                    <i
                      className="fas fa-search"
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: 12,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Filter bill items..."
                      value={billItemsSearch}
                      onChange={(e) => setBillItemsSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        borderRadius: radii.md,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 12,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Showing <strong>{filteredBillItems.length}</strong> of {SupplementaryDetails.length} items
                  </span>
                </div>
              )}

              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: radii.md,
                  maxHeight: 320,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Date & Time</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Discount</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Ins. Amount</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Pat. Amount</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Tax</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!filteredBillItems || filteredBillItems.length === 0) ? (
                      <tr>
                        <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                          {SupplementaryDetails?.length === 0
                            ? 'Click the eye icon on any category above to view itemized breakdown.'
                            : 'No matching items found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredBillItems.map((bill: any, idx: number) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '8px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {formatDate(bill.BillDateTime)}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {bill.ServiceName || '-'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {bill.Quantity || 1}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.Rate)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: bill.DiscountAmount > 0 ? '#dc2626' : '#64748b', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.DiscountAmount)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.InsNetAmount)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.PatNetAmount)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.GSTAmount)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                            {formatCurrency(bill.NetAmount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: SECONDARY GUARANTOR BILL (IF APPLICABLE)
      ───────────────────────────────────────────────────────────── */}
      {isInsurance && !isPackageAssigned && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: radii.lg,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setSecondaryGuarantorOpen(!secondaryGuarantorOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#475569',
              color: '#ffffff',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-shield-halved" style={{ fontSize: 15 }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                {currentcontext?.RankSecGuarantor || 'Secondary Guarantor / Insurance Portion'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className={`fas fa-chevron-${secondaryGuarantorOpen ? 'up' : 'down'}`} style={{ fontSize: 13 }} />
            </div>
          </div>

          {secondaryGuarantorOpen && (
            <div style={{ padding: '12px 16px' }}>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: radii.md }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Discount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Net Amount</th>
                      <th style={{ padding: '9px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PatientSummaryDetails?.filter((b: any) => b.Status === 1).map((bill: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '9px 14px', fontWeight: 600 }}>
                          {bill.ServiceCategory?.ServiceCategoryName || '-'}
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(bill.GroupSplitGrossAmount || bill.GroupSplitPatAmount)}
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(bill.GroupSplitDiscountAmount)}
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                          {formatCurrency(bill.GroupSplitNetAmount || bill.GroupSplitPatAmount)}
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => dispatch('plusopenselfsupplementary', bill)}
                            title="View Self Supplementary"
                            style={{
                              border: 'none',
                              background: '#eff6ff',
                              color: '#2563eb',
                              borderRadius: radii.sm,
                              padding: '4px 8px',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fas fa-eye" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: FINANCIAL METRICS & SETTLEMENT ENGINE
      ───────────────────────────────────────────────────────────── */}
      {/* 5.1 Financial Summary KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* Gross Amount */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            border: '1px solid #bae6fd',
            borderRadius: radii.lg,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Gross Amount
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', marginTop: 4, fontFamily: 'monospace' }}>
            {formatCurrency(currentcontext?.TotGrossAmount)}
          </div>
        </div>

        {/* Total Discount */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: radii.lg,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Discount
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#581c87', marginTop: 4, fontFamily: 'monospace' }}>
            {formatCurrency(currentcontext?.TotDiscAmount || currentcontext?.BillDiscount)}
          </div>
        </div>

        {/* Advance / Receipts */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: radii.lg,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Advance / Receipts
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#064e3b', marginTop: 4, fontFamily: 'monospace' }}>
            {formatCurrency(currentcontext?.TotalReceiptAmount)}
          </div>
        </div>

        {/* Net Amount */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: radii.lg,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Net Amount
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#312e81', marginTop: 4, fontFamily: 'monospace' }}>
            {formatCurrency(currentcontext?.TotNetAmount)}
          </div>
        </div>

        {/* Balance Due */}
        <div
          style={{
            background: Number(currentcontext?.TotBalanceAmt) > 0
              ? 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: `1px solid ${Number(currentcontext?.TotBalanceAmt) > 0 ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: radii.lg,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: Number(currentcontext?.TotBalanceAmt) > 0 ? '#b91c1c' : '#15803d',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Final Balance Due
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: Number(currentcontext?.TotBalanceAmt) > 0 ? '#991b1b' : '#166534',
              marginTop: 4,
              fontFamily: 'monospace',
            }}
          >
            {formatCurrency(currentcontext?.TotBalanceAmt)}
          </div>
        </div>
      </div>

      {/* 5.2 3-Column Settlement Suite (Discounts, Settlement, & Ledger) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 16,
          background: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: 16,
          marginBottom: 12,
        }}
      >
        {/* Column 1: Discounts & Schemes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-tag" style={{ color: '#2563eb' }} />
              Discounts & Schemes
            </h4>
          </div>

          {/* Discount Mode */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Discount Type
            </label>
            <select
              value={currentfilter?.DiscountModeId ?? ''}
              disabled={isFinalized || currentcontext?.RdoBillDiscountMode}
              onChange={(e) => dispatch('selectChange', { type: 'DiscountMode', value: Number(e.target.value) })}
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                background: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="">Select Discount Type</option>
              {lookup?.DiscountMode?.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name}</option>
              ))}
            </select>
          </div>

          {/* Bill Discount Value */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Bill Discount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={currentcontext?.BillDiscount ?? ''}
              disabled={isFinalized || currentcontext?.RdoBillDiscount}
              onChange={(e) => dispatch('discountChange', e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* MOU Discount (if enabled) */}
          {moudiscount === 1 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
                MOU Discount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentcontext?.MOUBillDiscount ?? ''}
                disabled={isFinalized || currentcontext?.RdoBillDiscount}
                onChange={(e) => dispatch('mouDiscountChange', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  height: 34,
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 12.5,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Discount Approver */}
          {Number(currentcontext?.BillDiscount) > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
                Discount Approved By
              </label>
              <select
                value={currentcontext?.DiscountApprovedBy ?? ''}
                disabled={isFinalized}
                onChange={(e) => dispatch('selectChange', { type: 'DiscountApprover', value: Number(e.target.value) })}
                style={{
                  width: '100%',
                  height: 34,
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 12.5,
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                <option value="">Select Approver</option>
                {lookup?.DiscountApprover?.map((opt: any) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Guarantor Category */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Guarantor Category
            </label>
            <select
              value={currentfilter?.GuarantorTypeId ?? ''}
              disabled={isFinalized}
              onChange={(e) => dispatch('selectChange', { type: 'GuarantorType', value: Number(e.target.value) })}
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                background: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="">Select Category</option>
              {lookup?.GuarantorType?.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name}</option>
              ))}
            </select>
          </div>

          {/* Discount Coupon Code */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Discount Coupon
            </label>
            <input
              type="text"
              value={item?.DiscountCoupon ?? ''}
              disabled={isFinalized}
              onChange={(e) => dispatch('fieldChange', { field: 'DiscountCoupon', value: e.target.value })}
              placeholder="Coupon Code"
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Column 2: Settlement & Payment Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-credit-card" style={{ color: '#2563eb' }} />
              Settlement &amp; Payment
            </h4>
          </div>

          {/* Settlement Type */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Settlement Type
            </label>
            <select
              value={currentcontext?.FSTypeId ?? 1}
              disabled={isFinalized}
              onChange={(e) => dispatch('selectChange', { type: 'SettlementType', value: Number(e.target.value) })}
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                background: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              {lookup?.SettlementType?.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name || opt.Text}</option>
              )) || (
                <>
                  <option value={1}>Full Settlement</option>
                  <option value={2}>Advance</option>
                  <option value={3}>Credit / Due</option>
                  <option value={4}>Refund</option>
                </>
              )}
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Payment Mode
            </label>
            <select
              value={currentcontext?.PaymentTypeId ?? item?.PaymentTypeId ?? 1}
              disabled={isFinalized}
              onChange={(e) => dispatch('selectChange', { type: 'PaymentType', value: Number(e.target.value) })}
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                background: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              {lookup?.PaymentType?.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name || opt.Text}</option>
              )) || (
                <>
                  <option value={1}>Cash</option>
                  <option value={2}>Credit Card</option>
                  <option value={3}>Debit Card</option>
                  <option value={4}>Cheque</option>
                  <option value={5}>UPI / Net Banking</option>
                </>
              )}
            </select>
          </div>

          {/* Received / Settlement Amount */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Received / Settlement Amount <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentcontext?.ReceiptAmt ?? ''}
                disabled={isFinalized}
                onChange={(e) => dispatch('receiptAmtChange', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  height: 34,
                  padding: '0 10px 0 24px',
                  borderRadius: radii.md,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Cheque / UPI / Card Details (Conditional) */}
          {(currentcontext?.PaymentTypeId === 4 || item?.PaymentTypeId === 4) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Bank Name</label>
                <select
                  value={item?.BankId ?? ''}
                  onChange={(e) => dispatch('fieldChange', { field: 'BankId', value: Number(e.target.value) })}
                  style={{ width: '100%', height: 32, borderRadius: radii.sm, border: '1px solid #cbd5e1', fontSize: 12 }}
                >
                  <option value="">Select Bank</option>
                  {lookup?.Bank?.map((b: any) => (
                    <option key={b.Id} value={b.Id}>{b.Text || b.Name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Cheque No</label>
                <input
                  type="text"
                  value={item?.ChequeNo ?? ''}
                  onChange={(e) => dispatch('fieldChange', { field: 'ChequeNo', value: e.target.value })}
                  placeholder="Cheque #"
                  style={{ width: '100%', height: 32, borderRadius: radii.sm, border: '1px solid #cbd5e1', fontSize: 12, padding: '0 6px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* Credit Due Approver */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Credit Due Approver
            </label>
            <select
              value={item?.PrivateDueId ?? ''}
              disabled={isFinalized}
              onChange={(e) => dispatch('fieldChange', { field: 'PrivateDueId', value: Number(e.target.value) })}
              style={{
                width: '100%',
                height: 34,
                padding: '0 10px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                background: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="">Select Due Approver</option>
              {lookup?.PrivateDueApprover?.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>{opt.Description || opt.Name || opt.Text}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 3: Ledger Summary & Print Flags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-calculator" style={{ color: '#2563eb' }} />
              Ledger Summary &amp; Print Options
            </h4>
          </div>

          {/* Compact Ledger Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: radii.md, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#64748b' }}>Gross Amount</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TotGrossAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#64748b' }}>Advance / Paid</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#059669', fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TotalReceiptAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#64748b' }}>Discount</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#dc2626', fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TotDiscAmount || currentcontext?.BillDiscount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#64748b' }}>Tax Amount</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TaxAmount || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '7px 10px', color: '#0f172a' }}>Net Amount</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#0f172a', fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TotNetAmount)}
                  </td>
                </tr>
                <tr style={{ background: '#fef2f2', fontWeight: 700, color: '#b91c1c' }}>
                  <td style={{ padding: '8px 10px' }}>Final Balance Due</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(currentcontext?.TotBalanceAmt)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Print Checkbox Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.PatientBill)}
                onChange={(e) => dispatch('fieldChange', { field: 'PatientBill', value: e.target.checked })}
              />
              <span>Patient Bill</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.WithHeader)}
                onChange={(e) => dispatch('fieldChange', { field: 'WithHeader', value: e.target.checked })}
              />
              <span>With Header</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.WithoutHeader)}
                onChange={(e) => dispatch('fieldChange', { field: 'WithoutHeader', value: e.target.checked })}
              />
              <span>Without Header</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.BothBill)}
                onChange={(e) => dispatch('fieldChange', { field: 'BothBill', value: e.target.checked })}
              />
              <span>Both Bills</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.DrugBill)}
                onChange={(e) => dispatch('fieldChange', { field: 'DrugBill', value: e.target.checked })}
              />
              <span>Pharmacy Breakup</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#334155' }}>
              <input
                type="checkbox"
                checked={Boolean(item?.NonMedical)}
                onChange={(e) => dispatch('fieldChange', { field: 'NonMedical', value: e.target.checked })}
              />
              <span>Non-Medical</span>
            </label>
          </div>

          {/* Remarks Textarea */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 3, display: 'block' }}>
              Billing Remarks / Comments
            </label>
            <textarea
              rows={2}
              value={item?.Comments ?? ''}
              disabled={isFinalized}
              onChange={(e) => dispatch('fieldChange', { field: 'Comments', value: e.target.value })}
              placeholder="Enter billing remarks..."
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: radii.md,
                border: '1.5px solid #cbd5e1',
                fontSize: 12,
                fontFamily: typography.fontFamily,
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: INLINE BOTTOM ACTION TOOLBAR
          (Matches OpBillingListScreen: stays inline with generous margins, never covers content!)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 14,
          marginBottom: 36,
          padding: '12px 18px',
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-arrow-left" /> Back to List
          </button>

          {/* Pharmacy Print */}
          <button
            type="button"
            onClick={() => dispatch('printPharmacy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: radii.md,
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              color: '#c2410c',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-prescription" /> Pharmacy Print
          </button>

          {/* Discharge Slip Print */}
          <button
            type="button"
            onClick={() => dispatch('printDischargeSlip')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: radii.md,
              border: '1px solid #bae6fd',
              background: '#f0f9ff',
              color: '#0369a1',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-file-medical" /> Discharge Slip
          </button>

          {/* Print Preview Dropdown Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setPrintDropdownOpen(!printDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: radii.md,
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-print" /> Print Preview <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 2 }} />
            </button>

            {printDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: 8,
                  background: '#ffffff',
                  borderRadius: radii.md,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e2e8f0',
                  minWidth: 210,
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => { setPrintDropdownOpen(false); dispatch('printBillSummary'); }}
                  style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}
                >
                  <i className="fas fa-file-invoice" style={{ marginRight: 8, color: '#2563eb' }} /> Bill Summary
                </div>
                <div
                  onClick={() => { setPrintDropdownOpen(false); dispatch('printBillDetails'); }}
                  style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}
                >
                  <i className="fas fa-list-check" style={{ marginRight: 8, color: '#2563eb' }} /> Bill Details
                </div>
                {isPackageAssigned && (
                  <>
                    <div
                      onClick={() => { setPrintDropdownOpen(false); dispatch('printPackageDetails'); }}
                      style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}
                    >
                      <i className="fas fa-box" style={{ marginRight: 8, color: '#2563eb' }} /> Package Details
                    </div>
                    <div
                      onClick={() => { setPrintDropdownOpen(false); dispatch('printPackageInclusion'); }}
                      style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}
                    >
                      <i className="fas fa-layer-group" style={{ marginRight: 8, color: '#2563eb' }} /> Package Inclusion
                    </div>
                  </>
                )}
                <div
                  onClick={() => { setPrintDropdownOpen(false); dispatch('printDailywise'); }}
                  style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}
                >
                  <i className="fas fa-calendar-day" style={{ marginRight: 8, color: '#2563eb' }} /> Daily-wise Print
                </div>
                <div
                  onClick={() => { setPrintDropdownOpen(false); dispatch('printNonMedical'); }}
                  style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', color: '#0f172a' }}
                >
                  <i className="fas fa-notes-medical" style={{ marginRight: 8, color: '#2563eb' }} /> Non-Medical Print
                </div>
              </div>
            )}
          </div>

          {/* Excel Export */}
          <button
            type="button"
            onClick={() => dispatch('excelDownload')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: radii.md,
              border: 'none',
              background: '#15803d',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-file-excel" /> Excel
          </button>
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Patient Discharge (if eligible) */}
          {!candisabledischargebtn && (
            <button
              type="button"
              onClick={() => dispatch('patientDischarge')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: radii.md,
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              }}
            >
              <i className="fas fa-sign-out-alt" /> Discharge
            </button>
          )}

          {/* Finalize Bill Button */}
          {!isFinalized && isBillLock && (
            <button
              type="button"
              onClick={() => dispatch('saveAndApprove')}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 22px',
                borderRadius: radii.md,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: isSaving ? 'wait' : 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              <i className="fas fa-check-circle" /> Finalize Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
