import React from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from './Button';

interface LookupOption {
  Id: number;
  Text: string;
  [key: string]: any;
}

interface LookupShape {
  VisitType?: LookupOption[];
  Department?: LookupOption[];
  GuarantorType?: LookupOption[];
  Guarantor?: LookupOption[];
  ReferralType?: LookupOption[];
  PromotionalScheme?: LookupOption[];
  DiscountMode?: LookupOption[];
  DiscountApprover?: LookupOption[];
  PaymentType?: LookupOption[];
  Bank?: LookupOption[];
  CardType?: LookupOption[];
  PrivateDueApprover?: LookupOption[];
  [key: string]: any;
}

interface ItemShape {
  PatientName?: string;
  MRN?: string;
  Age?: string | number;
  Gender?: { Description?: string };
  VisitTypeId?: number;
  DepartmentId?: number;
  DepartmentName?: string;
  ReferTypeId?: number;
  IsMLC?: boolean;
  PromotionalSchemeId?: number;
  InsuranceNumber?: string;
  IsEmergency?: boolean;
  IsNoBill?: boolean;
  IsOPD?: boolean;
  Comments?: string;
  PrivateDueId?: number;
  BankId?: number;
  ChequeNo?: string;
  UPIRefNumber?: string;
  DDNumber?: string;
  DDDate?: string | Date;
  WireTransferId?: string;
  WireTransferDate?: string | Date;
  ChequeDate?: string | Date;
  CollectedOn?: string | Date;
  AuthorizeNumber?: string;
  CardTypeId?: number;
  CardNumber?: string;
  GuarantorId?: number;
  [key: string]: any;
}

interface CurrentContextShape {
  GuarantorTypeId?: number;
  DiscountModeId?: number;
  BillDiscount?: number;
  DiscountApprovedBy?: number;
  TotDiscAmount?: number;
  SchemeDiscAmount?: number;
  PaymentTypeId?: number;
  ReceiptAmt?: number | null;
  RdoReceiptAmt?: boolean;
  TotBalanceAmt?: number;
  Received?: number;
  RefundAmount?: number;
  TokenNo?: string | number;
  [key: string]: any;
}

interface ServiceInfoRow {
  ServiceName?: string;
  Quantity?: number;
  Rate?: number;
  SchemeDiscountRate?: number | string;
  SchemeDiscountAmt?: number | string;
  NetAmount?: number;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: ItemShape;
  currentcontext?: CurrentContextShape;
  lookup?: LookupShape;
  defaultServiceInfo?: ServiceInfoRow[];
  defaultServiceGrossAmt?: number;
  defaultServiceTotalAmt?: number;
  saveCompleted?: boolean;
  disableReferral?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const toDateInputValue = (d?: string | Date): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: spacing.md,
  marginBottom: spacing.md,
};

const labelStyle: React.CSSProperties = { ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily };

const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: colors.textMuted,
  padding: `${spacing.sm} ${spacing.md}`,
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
// visitcreateform (modal opened via utl.Modal.openFixedDialog, controller
// `VisitCreateController` in visitcreateform.js) -- the registration-cum-
// visit-with-bill creation dialog: visit type/doctor/guarantor/referral
// fields, an OP default-service-items summary with header discount, a
// payments panel, then Save (registration/patient/RegCumVisitWithBill) or
// Checkout (appointment/patienttracker/CheckoutPatient). All API calls,
// validation and calculation logic stay in the untouched Angular controller.
//
// SIX mounts share one reactProps/handleReactAction because THREE fields --
// Doctor, Referred By and Reason -- are `<autosearch>` directives (debounced,
// server-searched, presearch/postsearch-hook-driven, config-object-per-
// instance) that must stay native Angular, per the established precedent
// (see FamilyLinkScreen.tsx; registrationcumvisit.html's Doctor block). Since
// those three sit *inside* the same Bootstrap grid row as the fields around
// them, the row is split into mounts on either side of each native widget so
// the original left-to-right visual order is preserved exactly:
//   1. VisitCreateFormPatientHeader   -- Patient Name/Id/Age-Sex banner
//   2. VisitCreateFormTopFields       -- Visit Type            (before Doctor)
//      [native] Doctor autosearch, unchanged
//   3. VisitCreateFormMidFields       -- Department/Guarantor Type/Guarantor/
//                                        Source Type             (before Referred By)
//      [native] Referred By autosearch + "Add" button, unchanged
//      [native] Reason autosearch + "Add" button, unchanged (see BUG 1 below)
//   4. VisitCreateFormLowerFields     -- MLC/Scheme/Payer Number/Token Num
//   5. VisitCreateFormBillingSection  -- discount/remarks/charge toggles,
//                                        service-items table, payments panel
//   6. VisitCreateFormFooter          -- Checkout / Save
//
// The outer accordion chrome (chevron icon + expand/collapse "hidden-box"
// wrapper, driven by a plain-JS `querySelectorAll('.icon')` click listener at
// the bottom of the .html, unrelated to Angular) is left as native HTML
// around mount 5's content, matching precedent -- that vanilla script only
// finds elements present in the DOM at initial template compile, so moving
// its icon/wrapper into a React-rendered subtree (mounted asynchronously by
// reactBridge's own $watch, after that script already ran) would silently
// break the collapse toggle. Only what is *inside* hidden-box is React.
//
// Real, disclosed pre-existing defects preserved exactly, NOT fixed (line
// numbers refer to visitcreateform.js/.html as they stood before migration):
//
// 1. `vm.remarkcontrolconfig` (config object for the native "Reason"
//    <autosearch>) is referenced in the .html but is never defined anywhere
//    in this controller -- the widget has no query/api/formatdisplay to run
//    against and is non-functional in the original app exactly as it is
//    here. Its sibling "Add" button calls `addRemark()`, which is likewise
//    never defined -- clicking it is a silent no-op in the original
//    (Angular's default $exceptionHandler swallows the resulting error).
// 2. Several `ng-change`/`ng-click` handlers referenced by the original
//    template are never defined anywhere in this controller:
//    `BillDiscountModechange()` (Discount Type), `setDiscountLimit()`
//    (Discount Approved By), `HeaderDiscountValueChange()` (Discount value),
//    `getSelectedSchemeInfo()` (Scheme), and `FooterFocus()` (used on nearly
//    every payment field's `ng-keyup`, presumably for tab-order focus
//    management). In the original AngularJS app, `ng-model` still updates
//    the field immediately; only the *handler* silently fails. This bridge
//    reproduces that split exactly: the dispatcher below updates the
//    corresponding field and does NOT call these (nonexistent) functions.
//    One real, functional consequence: because `setDiscountLimit()` never
//    runs, `$scope.DiscountLimit` is never assigned anywhere in this
//    controller, so `CalculateNetAmt()`'s discount-limit enforcement
//    (`if ($scope.DiscountLimit != null && ...)`) can never trigger --
//    the discount-approver limit check is permanently dead in this screen.
// 3. This controller is a partial copy of sibling registration controllers
//    (regcumvisitwithbill.js, fullregistration.js, aepatientregistration.js,
//    etc. all define these) that dropped several helper functions during the
//    copy. Each of the following is *called* here but never defined on this
//    controller or anywhere else reachable from it, so invoking it throws a
//    real TypeError (caught by Angular's default $exceptionHandler --
//    non-fatal, but the rest of the calling function's statements after the
//    call are skipped):
//      - `handlePatientExists(data)`, called from `saveItemCallback` whenever
//        the save action returns a negative id (duplicate-patient path).
//      - `getSurgeryVisitInfo(id)`, called from `getPastVisitInfoCallback`
//        whenever the patient has at least one past visit.
//      - `setDefaultServiceIsOPD()`, called from `IsOPD()` whenever the "Is
//        OPD" checkbox is checked.
//      - `setDispBillinfo()`, called from the very last lines of
//        `CalculateNetAmt()` whenever `$scope.BillInfo` already has an entry
//        (i.e. re-opening an existing open encounter that already has a
//        bill) -- this is the highest-impact instance, since
//        `CalculateNetAmt()` is the shared recompute sink for nearly every
//        field change on this screen; on that path, every later trigger of
//        `CalculateNetAmt()` throws afresh.
//      - `$scope.printOPBill()` is referenced in `getPatientBillInfoCallback`
//        behind `$scope.OpBillPrint == true`, but `OpBillPrint` is never
//        assigned truthy anywhere in this controller, so that call is
//        unreachable in practice (dead code, not currently exploitable).
// 4. The Received Amount field carries a hard-coded HTML `disabled`
//    attribute in the original template in addition to its
//    `ng-disabled="currentcontext.RdoReceiptAmt"` binding -- the literal
//    attribute always wins, so the field can never be focused/edited by a
//    user no matter what `RdoReceiptAmt` is. `updateReceiptAmt()` (its
//    `ng-focus`) and the `ng-change="CalculateNetAmt()"` on it are therefore
//    unreachable through the UI in the original too; this component renders
//    the field permanently disabled to match.
// 5. Several `ng-disabled` bindings reference scope paths that are never
//    assigned anywhere in this controller, so they are always falsy (the
//    field is effectively never disabled), reproduced as always-enabled
//    here: `item.candisable` (Payer Number), `RdoPaymentTypeId` (Payment
//    Type), `RdoGuarantorDue` (Credit Approver), `IsDue` (Remarks),
//    `item.isCompleted` (Bank Name/Cheque No/UPI Ref/DD No/Transaction
//    No/Authorized Code/Collected On/Cheque Date/DD Date/Transferred On --
//    note also the separate, differently-cased `IsCompleted` used only on
//    Card #, itself likewise never assigned -- an additional naming
//    inconsistency on top of both being dead). `DisableReferral` (Source
//    Type select/Referred By autosearch) IS assigned, but only once, to
//    `false`, at controller init, and never reassigned -- so it too is
//    always-false/never-disabled in practice.
// 6. `MultiPay` (gates the "+" add-payment-row button next to Payment Type)
//    is never assigned anywhere, so that button never renders in the
//    original either -- no such button/action is added here.
// 7. `$scope.getTokenDisplay()` is a fully defined, real function (fetches
//    the token number for `$scope.AppointmentId` via
//    Appointment/AppointmentDisplay/GetAppointmentDisplays) that nothing in
//    this controller or its template ever calls -- dead code; the Token Num
//    field is consequently always blank, exactly as in the original.
// 8. The service-items table's rightmost column is headed "Amount" but its
//    cells actually display `serviceitem.NetAmount` (the post-discount
//    value), not the row's `Amount` -- a pre-existing label/data mismatch,
//    reproduced verbatim. Likewise the totals row labeled "RECEIVED" is
//    bound to `DefaultServiceTotalAmt` (the computed bill total), not to
//    `currentcontext.Received`/`ReceiptAmt` (the actual amount received) --
//    also reproduced verbatim.
// 9. The "Refund" figure in the totals banner
//    (`currentcontext.RefundAmount || 0`) is always 0: `RefundAmount` is
//    never assigned anywhere in this controller.
// ---------------------------------------------------------------------------

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => { onAction?.(action, payload); };

export const VisitCreateFormPatientHeader: React.FC<ScreenProps> = ({ reactProps }) => {
  const { item = {} } = reactProps || {};
  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textMain, display: 'flex', flexWrap: 'wrap', gap: spacing.xl, padding: `${spacing.sm} 0`, marginBottom: spacing.md, borderBottom: `1px solid ${colors.border}` }}>
      <span><strong>Patient Name:</strong> {item.PatientName}</span>
      <span><strong>Patient Id:</strong> {item.MRN}</span>
      <span><strong>Age/Sex:</strong> {item.Age}Yrs / {item.Gender?.Description}</span>
    </div>
  );
};

export const VisitCreateFormTopFields: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup = {} } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <Select label="Visit Type" required options={toOptions(lookup.VisitType)} value={item.VisitTypeId ?? ''} onChange={(v) => dispatch('itemFieldChange', { field: 'VisitTypeId', value: v })} />
    </div>
  );
};

export const VisitCreateFormMidFields: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, lookup = {}, disableReferral } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ ...fieldGrid, marginBottom: 0 }}>
      {/* Always disabled in the original (ng-disabled="true") -- deliberate: DepartmentId is auto-derived from the selected Doctor, not user-editable here. */}
      <Select label="Department" disabled options={toOptions(lookup.Department)} value={item.DepartmentId ?? ''} onChange={() => {}} />
      <Select label="Guarantor Type" required options={toOptions(lookup.GuarantorType)} value={currentcontext.GuarantorTypeId ?? ''} onChange={(v) => dispatch('guarantorTypeChange', { value: v })} />
      <Select label="Guarantor" required options={toOptions(lookup.Guarantor)} value={item.GuarantorId ?? ''} onChange={(v) => dispatch('guarantorChange', { value: v })} />
      {/* BUG 5 (see file header): DisableReferral is assigned false once at init and never reassigned -- always enabled. */}
      <Select label="Source Type" required disabled={!!disableReferral} options={toOptions(lookup.ReferralType)} value={item.ReferTypeId ?? ''} onChange={(v) => dispatch('referTypeChange', { value: v })} />
    </div>
  );
};

export const VisitCreateFormLowerFields: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, lookup = {}, saveCompleted } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={fieldGrid}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>MLC</label>
        <Checkbox checked={!!item.IsMLC} disabled={!!saveCompleted} onChange={(v) => dispatch('itemFieldChange', { field: 'IsMLC', value: v })} />
      </div>
      {/* BUG 2 (see file header): getSelectedSchemeInfo() is undefined -- selecting a scheme only updates this field. */}
      <Select label="Scheme" options={toOptions(lookup.PromotionalScheme)} value={item.PromotionalSchemeId ?? ''} onChange={(v) => dispatch('promotionalSchemeChange', { value: v })} />
      {/* BUG 5 (see file header): item.candisable is never assigned -- always enabled. */}
      <Input label="Payer Number" value={item.InsuranceNumber ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'InsuranceNumber', value: e.target.value })} />
      {/* BUG 7 (see file header): TokenNo is always blank -- getTokenDisplay() is dead code, never invoked. */}
      <Input label="Token Num" value={currentcontext.TokenNo ?? ''} disabled fullWidth={false} style={{ width: 70, borderRadius: 999, textAlign: 'center' }} />
    </div>
  );
};

export const VisitCreateFormBillingSection: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, currentcontext = {}, lookup = {},
    defaultServiceInfo = [], defaultServiceGrossAmt = 0, defaultServiceTotalAmt = 0,
    saveCompleted,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const paymentTypeId = Number(currentcontext.PaymentTypeId);
  const showScheme = Number(item.PromotionalSchemeId) > 0;
  const showDiscountApprover = Number(currentcontext.TotDiscAmount) > 0 || Number(currentcontext.SchemeDiscAmount) > 0;

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textMain }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: spacing.lg, marginBottom: spacing.lg }}>
        <div>
          {/* BUG 2 (see file header): BillDiscountModechange() is undefined -- selecting a mode only updates this field. */}
          <Select label="Discount Type" options={toOptions(lookup.DiscountMode)} value={currentcontext.DiscountModeId ?? ''} onChange={(v) => dispatch('discountModeChange', { value: v })} />
          <div style={{ display: 'grid', gridTemplateColumns: showDiscountApprover ? '1fr 1fr' : '1fr', gap: spacing.sm, marginTop: spacing.sm }}>
            {/* BUG 2 (see file header): HeaderDiscountValueChange() is undefined -- typing a discount only updates this field, it does not recompute totals live (the recompute happens elsewhere, e.g. on Save). */}
            <Input label="Discount" value={currentcontext.BillDiscount ?? ''} onChange={(e) => dispatch('billDiscountChange', { value: e.target.value })} />
            {showDiscountApprover && (
              /* BUG 2 (see file header): setDiscountLimit() is undefined -- DiscountLimit is permanently unset, so the discount-limit check in CalculateNetAmt() never fires. */
              <Select label="Discount Approved By" required options={toOptions(lookup.DiscountApprover)} value={currentcontext.DiscountApprovedBy ?? ''} onChange={(v) => dispatch('discountApprovedByChange', { value: v })} />
            )}
          </div>
          <div style={{ marginTop: spacing.sm }}>
            {/* BUG 5 (see file header): IsDue is never assigned -- always enabled. */}
            <Input label="Remarks" placeholder="Remarks" value={item.Comments ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'Comments', value: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.sm, marginTop: spacing.lg }}>
            <div>
              <div style={labelStyle}>Emergency Charge</div>
              <Checkbox checked={!!item.IsEmergency} disabled={!!saveCompleted} onChange={(v) => dispatch('emergencyChargeToggle', { value: v })} />
            </div>
            <div>
              <div style={labelStyle}>No Bill</div>
              <Checkbox checked={!!item.IsNoBill} disabled={!!saveCompleted} onChange={(v) => dispatch('noBillToggle', { value: v })} />
            </div>
            <div>
              <div style={labelStyle}>Is OPD</div>
              {/* BUG 3 (see file header): setDefaultServiceIsOPD() is undefined -- checking this throws inside IsOPD()'s true-branch. */}
              <Checkbox checked={!!item.IsOPD} disabled={!!saveCompleted} onChange={(v) => dispatch('isOpdToggle', { value: v })} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: radii.lg, backgroundColor: colors.surface }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: '28%' }}>Service code / Name</th>
                <th style={th}>Qty</th>
                <th style={th}>Rate</th>
                {showScheme && <th style={th}>Scheme Dis (%)</th>}
                {showScheme && <th style={th}>Scheme Dis (Rs)</th>}
                {/* BUG 8 (see file header): header says "Amount" but the cell below shows NetAmount, matching the original verbatim. */}
                <th style={th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {defaultServiceInfo.length === 0 ? (
                <tr>
                  <td colSpan={showScheme ? 6 : 4} style={{ ...td, textAlign: 'center', color: colors.textSubtle, padding: spacing.xl }}>No items</td>
                </tr>
              ) : (
                defaultServiceInfo.map((row, idx) => (
                  <tr key={idx}>
                    <td style={td}>{row.ServiceName}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{row.Quantity}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{row.Rate}</td>
                    {showScheme && <td style={td}>{row.SchemeDiscountRate} %</td>}
                    {showScheme && <td style={{ ...td, textAlign: 'right' }}>{row.SchemeDiscountAmt}</td>}
                    <td style={{ ...td, textAlign: 'right' }}>{row.NetAmount}</td>
                  </tr>
                ))
              )}
              <tr>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>TOTAL</td>
                <td style={td} />
                {showScheme && <><td style={td} /><td style={td} /></>}
                <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{defaultServiceGrossAmt}</td>
              </tr>
              <tr>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>DISCOUNT</td>
                <td style={td} />
                {showScheme && <><td style={td} /><td style={td} /></>}
                <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{currentcontext.TotDiscAmount}</td>
              </tr>
              {/* BUG 8 (see file header): labeled "RECEIVED" but bound to DefaultServiceTotalAmt (the bill total), reproduced verbatim. */}
              <tr>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>RECEIVED</td>
                <td style={td} />
                {showScheme && <><td style={td} /><td style={td} /></>}
                <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{defaultServiceTotalAmt}</td>
              </tr>
              <tr>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>DUE</td>
                <td style={td} />
                {showScheme && <><td style={td} /><td style={td} /></>}
                <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{currentcontext.TotBalanceAmt}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing.lg }}>
          <div style={fieldGrid}>
            {/* BUG 5 (see file header): RdoPaymentTypeId is never assigned -- always enabled. No ng-change existed in the original either. */}
            <Select label="Payment Type" required options={toOptions(lookup.PaymentType)} value={currentcontext.PaymentTypeId ?? ''} onChange={(v) => dispatch('currentContextFieldChange', { field: 'PaymentTypeId', value: v })} />
            {/* BUG 4 (see file header): always disabled -- matches the original's hard-coded `disabled` attribute. */}
            <Input label="Received Amount" value={currentcontext.ReceiptAmt ?? ''} disabled onFocus={() => dispatch('updateReceiptAmt')} onChange={(e) => dispatch('receiptAmtChange', { value: e.target.value })} />
            {Number(currentcontext.TotBalanceAmt) > 0 && (
              /* BUG 5 (see file header): RdoGuarantorDue is never assigned -- always enabled. */
              <Select label="Credit Approver" required options={toOptions(lookup.PrivateDueApprover)} value={item.PrivateDueId ?? ''} onChange={(v) => dispatch('itemFieldChange', { field: 'PrivateDueId', value: v })} />
            )}
            {paymentTypeId > 1 && paymentTypeId !== 7 && (
              <Select label="Bank Name" required options={toOptions(lookup.Bank)} value={item.BankId ?? ''} onChange={(v) => dispatch('itemFieldChange', { field: 'BankId', value: v })} />
            )}
            {paymentTypeId === 2 && (
              <Input label="Cheque No" required value={item.ChequeNo ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'ChequeNo', value: e.target.value })} />
            )}
            {paymentTypeId === 11 && (
              <Input label="Ref. Number" required value={item.UPIRefNumber ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'UPIRefNumber', value: e.target.value })} />
            )}
            {paymentTypeId === 3 && (
              <Input label="DD No" required pattern="\d+" value={item.DDNumber ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'DDNumber', value: e.target.value })} />
            )}
            {paymentTypeId === 4 && (
              <Input label="Transaction No" required value={item.WireTransferId ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'WireTransferId', value: e.target.value })} />
            )}
            {(paymentTypeId === 5 || paymentTypeId === 6) && (
              <Input label="Authorized Code" required maxLength={8} value={item.AuthorizeNumber ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'AuthorizeNumber', value: e.target.value })} />
            )}
            {paymentTypeId === 2 && (
              <DatePicker label="Cheque Date" value={toDateInputValue(item.ChequeDate)} onChange={(v) => dispatch('itemDateFieldChange', { field: 'ChequeDate', value: v })} />
            )}
            {paymentTypeId === 3 && (
              <DatePicker label="DD Date" value={toDateInputValue(item.DDDate)} onChange={(v) => dispatch('itemDateFieldChange', { field: 'DDDate', value: v })} />
            )}
            {paymentTypeId === 4 && (
              <DatePicker label="Transferred On" value={toDateInputValue(item.WireTransferDate)} onChange={(v) => dispatch('itemDateFieldChange', { field: 'WireTransferDate', value: v })} />
            )}
            {(paymentTypeId === 5 || paymentTypeId === 6) && (
              <Select label="Card Type" required options={toOptions(lookup.CardType)} value={item.CardTypeId ?? ''} onChange={(v) => dispatch('itemFieldChange', { field: 'CardTypeId', value: v })} />
            )}
            {(paymentTypeId === 5 || paymentTypeId === 6) && (
              /* BUG 5 (see file header): the original disables this one via a bare "IsCompleted" (not "item.isCompleted" like its siblings) -- also never assigned, but noted as a separate dead/inconsistent binding. */
              <Input label="Card # (Last 4 Digits)" maxLength={4} value={item.CardNumber ?? ''} onChange={(e) => dispatch('itemFieldChange', { field: 'CardNumber', value: e.target.value })} />
            )}
            {(paymentTypeId === 2 || paymentTypeId === 3 || paymentTypeId === 4) && (
              <DatePicker label="Collected On" value={toDateInputValue(item.CollectedOn)} onChange={(v) => dispatch('itemDateFieldChange', { field: 'CollectedOn', value: v })} />
            )}
          </div>

          <div style={{ backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md, fontSize: '13px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.danger, fontWeight: 700 }}>
              <span>Net Amount</span><span>{defaultServiceTotalAmt}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xs }}>
              <span>Paid Amount</span><span>{currentcontext.Received}</span>
            </div>
            {/* BUG 9 (see file header): RefundAmount is never assigned anywhere -- always 0. */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xs, color: colors.danger, fontWeight: 700 }}>
              <span>Refund</span><span>{currentcontext.RefundAmount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VisitCreateFormFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { saveCompleted } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, fontFamily: typography.fontFamily }}>
      {saveCompleted ? (
        <Button variant="primary" text="Checkout" onClick={() => dispatch('checkout')} />
      ) : (
        <Button variant="primary" text="Save" onClick={() => dispatch('save')} />
      )}
    </div>
  );
};
