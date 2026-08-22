import React from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

interface LookupShape {
  Doctor?: LookupOption[];
  Guarantor?: LookupOption[];
  ServiceRateCategory?: LookupOption[];
  Department?: LookupOption[];
  ServiceItem?: LookupOption[];
  PaymentType?: LookupOption[];
  CardType?: LookupOption[];
  Bank?: LookupOption[];
  CurrencyType?: LookupOption[];
  DiscountMode?: LookupOption[];
  /** Never requested by the controller's initLookup() -- always empty. See bug notes in opdbill.js. */
  User?: LookupOption[];
}

interface BillItem {
  PaymentTypeId?: number;
  BillDateTime?: string;
  BillPriorityId?: number;
  FacilityId?: number;
  PatientId?: number;
  BillAmount?: number;
  BillDiscount?: number;
  TotalNet?: number;
  OutStandingAmount?: number;
  /** Displayed in the original footer but never assigned anywhere in the controller -- always blank. */
  TotRndoffAmt?: number;
  ApprovedById?: number;
  Remarks?: string;
  PaidAmount?: number;
  BankId?: number;
  ChequeNo?: string;
  ChequeDate?: string | Date;
  DDNumber?: string;
  DDDate?: string | Date;
  WireTransferId?: string;
  WireTransferDate?: string | Date;
  CardTypeId?: number;
  CardNumber?: string;
  CollectedOn?: string | Date;
  /** Read/sent by saveItem()/AddPaymentDetails() but its <ui-select> is commented out of the original template -- always undefined. */
  CurrencyTypeId?: number;
  [key: string]: any;
}

interface BillDetailRow {
  ServiceId?: number;
  Rate?: number;
  Quantity?: number;
  GrossAmount?: number;
  DoctorShare?: number;
  DiscountAmount?: number;
  NetAmount?: number;
  /** Dual-purposed: the service item's own Status from the API, and (set to 2) this row's soft-delete flag. Only Status===1 rows render, matching the original's `filter:{Status:1}`. */
  Status?: number;
  isDisabled?: boolean;
  [key: string]: any;
}

interface EncounterShape {
  Id?: number;
  DoctorId?: number;
  DepartmentId?: number;
  GuarantorId?: number;
  ServiceRateCategoryId?: number;
  EncounterTypeId?: number;
  [key: string]: any;
}

interface SelectedPatientShape {
  Title?: { Description?: string };
  FirstName?: string;
  MRN?: string;
  Gender?: { Description?: string };
  Age?: string | number;
  DOB?: string;
}

interface CurrentContextShape {
  ismodal?: boolean;
  eid?: number;
  pid?: number;
  bid?: number;
}

interface ReactPropsShape {
  item?: BillItem;
  billDetails?: BillDetailRow[];
  encounter?: EncounterShape;
  selectedPatient?: SelectedPatientShape;
  lookup?: LookupShape;
  headerDiscount?: number | string;
  currentcontext?: CurrentContextShape;
}

interface OpdBillScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');

/** Converts whatever the controller holds (real JS Date, ISO string, or nothing) into the yyyy-MM-dd string DatePicker expects. Presentational only -- no format the app didn't already produce elsewhere. */
const toDateInputValue = (d?: string | Date): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: colors.textMuted,
  padding: `${spacing.md} ${spacing.md}`,
  borderBottom: `2px solid ${colors.border}`,
  backgroundColor: colors.surfaceMuted,
  whiteSpace: 'nowrap',
  fontFamily: typography.fontFamily,
};

const td: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`,
  borderBottom: `1px solid ${colors.surfaceSunken}`,
  verticalAlign: 'middle',
  fontSize: '13px',
  color: colors.textMain,
  fontFamily: typography.fontFamily,
};

// ---------------------------------------------------------------------------
// opdbill (app.opdbill, modal, opened via utl.Modal.open('app.opdbill', ...))
// -- an OPD bill creation/edit form: patient/encounter context, an editable
// service-items grid, header discount/approval, a payments panel, and
// Print / Save & Approve actions. All API calls (GetPatientById,
// GetEncounters, GetServiceItemById, GetFacilityDefaultServices,
// AddPatientBills/UpdatePatientBills, General/Options/getoptions) stay in the
// untouched Angular controller (opdbill.js).
//
// Real, disclosed specifics preserved exactly, NOT fixed (see opdbill.js for
// the full list with line-level detail):
// - The patient-info icon (`patientProfile`) and the footer "Print" button
//   (`print`) both dispatch actions with NO case in handleReactAction,
//   because the original ng-click handlers (`patientprofiledetails()`,
//   `print()`) called functions the controller never defined -- already
//   silent no-ops in the AngularJS app.
// - Changing a row's Service Item calls back into the real getServiceItem(),
//   which (in the original too) ignores which row changed and only re-pulls
//   the facility's default services -- the row's Rate/GrossAmount are not
//   refreshed from the newly picked service.
// - "Approved By" has no real options: lookup.User is never requested.
// - "Round Off" is always blank: item.TotRndoffAmt is never assigned.
// - There is no Currency picker: CurrencyTypeId is read on save but its
//   <ui-select> was already commented out of the template.
// - No client-side validation blocks Save & Approve: the original's
//   `item_form.isValid()` guard was already commented out, so `required`
//   marks below are visual only, matching the original exactly.
// - There is no "Save Draft" button here (only Print + Save & Approve) --
//   the controller's saveDraft() function exists but nothing in the original
//   template ever called it; no such button is added here.
// ---------------------------------------------------------------------------
export const OpdBillScreen: React.FC<OpdBillScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {},
    billDetails = [],
    encounter = {},
    selectedPatient = {},
    lookup = {},
    headerDiscount,
  } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { onAction?.(action, payload); };
  const itemField = (field: string, value: any) => dispatch('itemFieldChange', { field, value });
  const itemDateField = (field: string, value: any) => dispatch('itemDateFieldChange', { field, value });
  const encounterField = (field: string, value: any) => dispatch('encounterFieldChange', { field, value });

  const doctorOptions = toOptions(lookup.Doctor);
  const departmentOptions = toOptions(lookup.Department);
  const guarantorOptions = toOptions(lookup.Guarantor);
  const serviceRateCategoryOptions = toOptions(lookup.ServiceRateCategory);
  const serviceItemOptions = toOptions(lookup.ServiceItem);
  const paymentTypeOptions = toOptions(lookup.PaymentType);
  const bankOptions = toOptions(lookup.Bank);
  const cardTypeOptions = toOptions(lookup.CardType);
  const approvedByOptions = toOptions(lookup.User); // always [] -- see bug notes above

  const paymentTypeId = Number(item.PaymentTypeId);

  // Mirrors the original `<tr ng-repeat="item in PatientBillDetails | filter:{Status:1}">`
  const visibleRows = billDetails
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.Status === 1);

  const showMRN = !!selectedPatient.MRN && selectedPatient.MRN.length > 0;

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.sm} 0` }}>
      {showMRN && (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.md, fontSize: '13px' }}>
          <span>{selectedPatient.Title?.Description} {selectedPatient.FirstName}</span>
          <span>|</span>
          <span>{selectedPatient.MRN}</span>
          <span>|</span>
          <span>{selectedPatient.Gender?.Description}</span>
          <span>|</span>
          <span>{selectedPatient.Age} Years</span>
          <span>|</span>
          <span>{fmtDate(selectedPatient.DOB)}</span>
          {/* KNOWN BUG (preserved): patientprofiledetails() was never defined
              on this controller -- clicking this icon was always a silent
              no-op in the original AngularJS. No case is wired for
              'patientProfile' in handleReactAction. */}
          <button
            onClick={() => dispatch('patientProfile')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary }}
            title="Patient profile"
          >
            <i className="icon-info-sign" />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
        <Select label="Doctor" options={doctorOptions} value={encounter.DoctorId ?? ''} onChange={(v) => encounterField('DoctorId', v)} />
        <Select label="Department" options={departmentOptions} value={encounter.DepartmentId ?? ''} onChange={(v) => encounterField('DepartmentId', v)} />
        <Select label="Guarantor" options={guarantorOptions} value={encounter.GuarantorId ?? ''} onChange={(v) => encounterField('GuarantorId', v)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md, marginBottom: spacing.lg }}>
        <Select label="Service Rate Category" options={serviceRateCategoryOptions} value={encounter.ServiceRateCategoryId ?? ''} onChange={(v) => encounterField('ServiceRateCategoryId', v)} />
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: radii.lg, marginBottom: spacing.md, backgroundColor: colors.surface }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: '30%' }}>Item Name</th>
              <th style={th}>Rate</th>
              <th style={th}>Qty</th>
              <th style={th}>Gross</th>
              <th style={th}>Doctor Share</th>
              <th style={th}>Discount (Rs)</th>
              <th style={th}>Net Amount</th>
              <th style={{ ...th, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...td, textAlign: 'center', color: colors.textSubtle, padding: spacing.xl }}>
                  No items
                </td>
              </tr>
            ) : (
              visibleRows.map(({ row, index }) => (
                <tr key={index}>
                  <td style={td}>
                    <Select
                      options={serviceItemOptions}
                      value={row.ServiceId ?? ''}
                      onChange={(v) => dispatch('rowServiceItemChange', { index, value: v })}
                    />
                  </td>
                  <td style={td}>
                    <Input value={row.Rate ?? ''} disabled fullWidth={false} style={{ width: 90 }} />
                  </td>
                  <td style={td}>
                    <Input
                      value={row.Quantity ?? ''}
                      onChange={(e) => dispatch('rowQuantityChange', { index, value: e.target.value })}
                      fullWidth={false}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td style={td}>
                    <Input value={row.GrossAmount ?? ''} disabled fullWidth={false} style={{ width: 90 }} />
                  </td>
                  <td style={td}>
                    <Input
                      value={row.DoctorShare ?? ''}
                      onChange={(e) => dispatch('rowDoctorShareChange', { index, value: e.target.value })}
                      fullWidth={false}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td style={td}>
                    <Input
                      value={row.DiscountAmount ?? ''}
                      onChange={(e) => dispatch('rowDiscountChange', { index, value: e.target.value })}
                      fullWidth={false}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td style={td}>{row.NetAmount ?? ''}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <Button
                      variant="danger"
                      size="xs"
                      icon="fa fa-trash"
                      title="Delete"
                      disabled={!!row.isDisabled}
                      onClick={() => dispatch('deleteDetail', { index })}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap', padding: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, marginBottom: spacing.md, fontSize: '13px' }}>
        <span>Discount: <strong>{item.BillDiscount ?? 0}</strong></span>
        <span>Total: <strong>{item.TotalNet ?? 0}</strong></span>
        {/* KNOWN BUG (preserved): TotRndoffAmt is never assigned anywhere in
            the controller -- Round Off is always blank in the original too. */}
        <span>Round Off: <strong>{item.TotRndoffAmt ?? ''}</strong></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: spacing.lg }}>
        <Input label="Discount" value={headerDiscount ?? ''} onChange={(e) => dispatch('headerDiscountChange', { value: e.target.value })} />
        {/* KNOWN BUG (preserved): lookup.User is never requested by
            initLookup() -- this dropdown's option list is always empty. */}
        <Select label="Approved By" options={approvedByOptions} value={item.ApprovedById ?? ''} onChange={(v) => itemField('ApprovedById', v)} />
        <Input label="Remarks" placeholder="Service Bill" value={item.Remarks ?? ''} onChange={(e) => itemField('Remarks', e.target.value)} />
      </div>

      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg }}>
        <h3 style={{ ...typography.h3, marginTop: 0, marginBottom: spacing.md, color: colors.textMain }}>Payments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
          <Select label="Payment Mode" required options={paymentTypeOptions} value={item.PaymentTypeId ?? ''} onChange={(v) => itemField('PaymentTypeId', v)} />
          <Input label="Receipt Amount" required value={item.PaidAmount ?? ''} onChange={(e) => dispatch('paidAmountChange', { value: e.target.value })} />

          {paymentTypeId !== 1 && (
            <Select label="Bank Name" required options={bankOptions} value={item.BankId ?? ''} onChange={(v) => itemField('BankId', v)} />
          )}
          {paymentTypeId === 2 && (
            <Input label="Cheque No" required value={item.ChequeNo ?? ''} onChange={(e) => itemField('ChequeNo', e.target.value)} />
          )}
          {paymentTypeId === 3 && (
            <Input label="DD No" required pattern="\d+" value={item.DDNumber ?? ''} onChange={(e) => itemField('DDNumber', e.target.value)} />
          )}
          {paymentTypeId !== 1 && (
            <DatePicker label="Collected On" value={toDateInputValue(item.CollectedOn)} onChange={(v) => itemDateField('CollectedOn', v)} />
          )}
          {paymentTypeId === 2 && (
            <DatePicker label="Cheque Date" value={toDateInputValue(item.ChequeDate)} onChange={(v) => itemDateField('ChequeDate', v)} />
          )}
          {paymentTypeId === 3 && (
            <DatePicker label="DD Date" value={toDateInputValue(item.DDDate)} onChange={(v) => itemDateField('DDDate', v)} />
          )}
          {paymentTypeId === 4 && (
            <Input label="Transaction No" required value={item.WireTransferId ?? ''} onChange={(e) => itemField('WireTransferId', e.target.value)} />
          )}
          {paymentTypeId === 4 && (
            <DatePicker label="Transferred On" value={toDateInputValue(item.WireTransferDate)} onChange={(v) => itemDateField('WireTransferDate', v)} />
          )}
          {paymentTypeId === 5 && (
            <Select label="Card Type" required options={cardTypeOptions} value={item.CardTypeId ?? ''} onChange={(v) => itemField('CardTypeId', v)} />
          )}
          {paymentTypeId === 5 && (
            <Input label="Card No" required value={item.CardNumber ?? ''} onChange={(e) => itemField('CardNumber', e.target.value)} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {/* KNOWN BUG (preserved): print() was never defined on this controller
            in the original -- clicking this button was always a silent
            no-op. No case is wired for 'print' in handleReactAction. */}
        <Button variant="secondary" text="Print" onClick={() => dispatch('print')} />
        <Button variant="info" text="Save & Approve" onClick={() => dispatch('saveAndApprove')} />
      </div>
    </div>
  );
};
