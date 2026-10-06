import React from 'react';
import { Button } from './Button';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PatientBillDetailLine {
  ServiceName?: string;
  BatchId?: string;
  ExpiryDate?: string;
  Quantity?: number;
  Rate?: number;
  DiscountAmount?: number;
  Amount?: number;
}

interface PharmacyBillRow {
  BillDateTime?: string;
  BillNumber?: string;
  PatientBillDetails?: PatientBillDetailLine[];
  StoreMaster?: { StoreName?: string };
  BillAmount?: number;
}

interface PatientReturnDetailLine {
  ItemName?: string;
  BatchId?: string;
  ExpiryDate?: string;
  ReturnQuantity?: number;
  Rate?: number;
  DiscountAmount?: number;
  Amount?: number;
}

interface PharmacyReturnRow {
  ReturnDateTime?: string;
  ReturnNumber?: string;
  BillNumber?: string;
  PatientReturnDetails?: PatientReturnDetailLine[];
  StoreMaster?: { StoreName?: string };
  ReturnAmount?: number;
}

interface PatientSummary {
  MRN?: string;
  Title?: string;
  FirstName?: string;
  LastName?: string;
  Age?: number;
  Gender?: string;
}

interface OpPharmacyBillsScreenProps {
  reactProps?: {
    pharmacyBillDetails?: PharmacyBillRow[];
    pharmacyRetBillDetails?: PharmacyReturnRow[];
    totalAmount?: number;
    summaryview?: number;
    patient?: PatientSummary | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatCurrency(val?: number): string {
  if (val == null || isNaN(val)) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// UI-MODERNIZATION RETROFIT (Billing / "OP Pharmacy Bills" detail-summary
// modal, public/views/billing/oppharmacydetails/oppharmacybills.html +
// oppharmacybills.js, controller OpPharmacyBillsController, real modal
// registration app.oppharmacybills): re-skins the real modal opened from
// ipbillmodification-form.js:974, insurance-bill.js:715, summary1.js:1393,
// summary.js:2026 and pharmacybill-modify.js:471 via utl.Modal.open('app.
// oppharmacybills', { params: { eid, pid, summaryview }, ... }). All real
// data/logic is untouched -- rows come from the real
// billing/PatientBills/GetPatientBills and billing/patientreturns/
// GetPatientReturns calls already made by the hollowed controller; Print
// dispatches straight to the real, unmodified $scope.oppharmacyprint
// (billing/patientbills/PrintOPPharmacyBillsforIP).
//
// CONFIRMED PRE-EXISTING, preserved not fixed (confirmed by reading both
// files in full, not assumed):
// 1) The real template embeds AngularJS's shared <patientbanner
//    patientid="currentcontext.pid" delegatefn="setBannerDelegate(cmp)">
//    component, which independently fetches registration/patient/
//    GetPatientById and renders name/MRN/age/gender/encounter/guarantor
//    info with its own template. AngularJS directives cannot render inside
//    a React tree, so this screen's hollowed controller now issues that
//    exact same real GetPatientById call itself and exposes a Name/MRN/
//    Age/Gender subset via reactProps.patient -- the same simplification
//    already used for the Patient Kin Master form migrated earlier this
//    session (full encounter/guarantor/mobile/print-history detail from
//    the original banner is not reproduced). setBannerDelegate itself is
//    not defined by this controller in the real code either (confirmed:
//    19 of the 21 screens across this codebase that embed <patientbanner>
//    omit it too) -- it is a normal no-op refresh hook, not a bug, and is
//    not reproduced.
// 2) $scope.currentfilter (orderno/testname/fromdate/todate) is defined in
//    the real controller but no filter UI in the real template ever binds
//    to it -- confirmed dead. Not reproduced.
// 3) $scope.doctor_dashboard() and $scope.patient_dashboard() are defined
//    but no element in the real template calls either -- confirmed dead.
//    Not reproduced.
// 4) currentcontext.summaryview (real caller-supplied flag, 0 or 1) toggles
//    the Item Name/Batch/Expiry/Qty/Sales Price/Discount/Amount detail
//    columns in both tables via ng-if="currentcontext.summaryview == 0" --
//    reproduced exactly below, driven by the real value passed through
//    reactProps (not hardcoded to 0).
// 5) Each bill/return row's detail columns are themselves small nested
//    tables iterating that row's real PatientBillDetails/
//    PatientReturnDetails array (one line item per row) -- reproduced
//    exactly as nested tables rather than flattened, matching the real
//    cellTemplate structure.
export const OpPharmacyBillsScreen: React.FC<OpPharmacyBillsScreenProps> = ({ reactProps, onAction }) => {
  const bills = reactProps?.pharmacyBillDetails || [];
  const returns = reactProps?.pharmacyRetBillDetails || [];
  const totalAmount = reactProps?.totalAmount;
  const summaryview = reactProps?.summaryview ?? 0;
  const showDetailCols = summaryview === 0;
  const patient = reactProps?.patient;
  const patientName = patient ? [patient.Title, patient.FirstName, patient.LastName].filter(Boolean).join(' ') : '';

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily, verticalAlign: 'top',
  };
  const innerTdStyle: React.CSSProperties = { padding: `2px ${spacing.xs}`, ...typography.body, fontFamily: typography.fontFamily };

  const detailCol = (rows: { text: React.ReactNode }[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}><td style={innerTdStyle}>{r.text}</td></tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, fontFamily: typography.fontFamily }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Detail Summary
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      {patient && (
        <div style={{
          display: 'flex', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.md, color: colors.textMain,
          ...typography.body, fontFamily: typography.fontFamily,
        }}>
          {patientName && <span><em style={{ color: colors.primary }}>Name:</em> <strong>{patientName}</strong></span>}
          {patient.MRN != null && <span><em style={{ color: colors.primary }}>MRN Number:</em> <strong>{patient.MRN}</strong></span>}
          {patient.Age != null && <span><em style={{ color: colors.primary }}>Age:</em> <strong>{patient.Age}</strong></span>}
          {patient.Gender && <span><em style={{ color: colors.primary }}>Gender:</em> <strong>{patient.Gender}</strong></span>}
        </div>
      )}

      <h4 style={{ ...typography.h4, color: colors.textMain, fontFamily: typography.fontFamily }}>Pharmacy Sales</h4>
      <div style={{ overflowX: 'auto', marginBottom: spacing.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Bill No.</th>
              {showDetailCols && <th style={thStyle}>Item Name</th>}
              {showDetailCols && <th style={thStyle}>Batch</th>}
              {showDetailCols && <th style={thStyle}>Expiry</th>}
              {showDetailCols && <th style={thStyle}>Qty</th>}
              {showDetailCols && <th style={thStyle}>Sales Price</th>}
              {showDetailCols && <th style={thStyle}>Discount</th>}
              {showDetailCols && <th style={thStyle}>Amount</th>}
              <th style={thStyle}>Store Name</th>
              <th style={thStyle}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{formatDateTime(row.BillDateTime)}</td>
                <td style={tdStyle}>{row.BillNumber}</td>
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: d.ServiceName })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: d.BatchId })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: formatDateTime(d.ExpiryDate) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: d.Quantity })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: formatCurrency(d.Rate) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: formatCurrency(d.DiscountAmount) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientBillDetails || []).map((d) => ({ text: formatCurrency(d.Amount) })))}</td>}
                <td style={tdStyle}>{row.StoreMaster?.StoreName}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 500 }}>{row.BillAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ ...typography.h4, color: colors.textMain, fontFamily: typography.fontFamily }}>Pharmacy Return</h4>
      <div style={{ overflowX: 'auto', marginBottom: spacing.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Return No.</th>
              <th style={thStyle}>Bill No.</th>
              {showDetailCols && <th style={thStyle}>Item Name</th>}
              {showDetailCols && <th style={thStyle}>Batch</th>}
              {showDetailCols && <th style={thStyle}>Expiry</th>}
              {showDetailCols && <th style={thStyle}>Qty</th>}
              {showDetailCols && <th style={thStyle}>Sales Price</th>}
              {showDetailCols && <th style={thStyle}>Discount</th>}
              {showDetailCols && <th style={thStyle}>Amount</th>}
              <th style={thStyle}>Store Name</th>
              <th style={thStyle}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{formatDateTime(row.ReturnDateTime)}</td>
                <td style={tdStyle}>{row.ReturnNumber}</td>
                <td style={tdStyle}>{row.BillNumber}</td>
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: d.ItemName })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: d.BatchId })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: formatDateTime(d.ExpiryDate) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: d.ReturnQuantity })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: formatCurrency(d.Rate) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: formatCurrency(d.DiscountAmount) })))}</td>}
                {showDetailCols && <td style={tdStyle}>{detailCol((row.PatientReturnDetails || []).map((d) => ({ text: formatCurrency(d.Amount) })))}</td>}
                <td style={tdStyle}>{row.StoreMaster?.StoreName}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 500 }}>{row.ReturnAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: spacing.md, borderTop: `1px solid ${colors.border}`,
      }}>
        <Button variant="secondary" onClick={() => dispatch('oppharmacyprint')}>Print</Button>
        <span style={{ ...typography.h4, color: colors.textMain, fontFamily: typography.fontFamily }}>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};
