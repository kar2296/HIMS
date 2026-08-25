import React from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface RefundItem {
  PaymentTypeId?: number;
  RefundAmount?: number;
  RefundTypeId?: number;
  Comments?: string;
  BankId?: number;
  ChequeNo?: string;
  DDNumber?: string;
  WireTransferId?: string;
  AuthorizeNumber?: string;
  CollectedOn?: string; // ISO yyyy-mm-dd, converted from/to the real AngularJS Date object by the bridge
  ChequeDate?: string;
  DDDate?: string;
  WireTransferDate?: string;
  RefundIdentifier?: string;
}

interface BillingRefundFormScreenProps {
  reactProps?: {
    item?: RefundItem;
    lookup?: {
      PaymentType?: LookupItem[];
      RefundType?: LookupItem[];
      Bank?: LookupItem[];
    };
    isCompleted?: boolean;
    isAgainstReceipt?: boolean;
    canShowCancelledBtn?: boolean;
    canHidePrintledBtn?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block', ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily,
};
const fieldWrapStyle: React.CSSProperties = { marginBottom: spacing.md };

// UI-MODERNIZATION RETROFIT (Billing / Refunds form, app.refund-form,
// refundFormController). Rebuilds the real modal form's UI as a React
// component (BillingRefundFormScreen) mounted via the existing
// AngularJS<->React bridge directive. Confirmed LIVE: reached via real
// $state.go/utl.Modal.open('app.refund-form', ...) calls from
// billing/receipts/receipt-list.js, billing/creditnote/creditnote-form.js,
// and inventory/opticals/opticalentry/receipt-form.js.
//
// AngularJS (refund-form.js) remains authoritative and is hollowed to a
// thin dispatcher: it still owns the real
// billing/PatientRefund/GetPatientRefundById /
// billing/PatientRefund/AddPatientRefund /
// billing/PatientRefund/UpdatePatientRefund /
// billing/PatientRefund/PrintPatientRefund calls, the real confirm
// dialogs (Cancel/Approve), and every visibility-rule computation
// (IsCompleted, canShowCancelledBtn, canHidePrintledBtn). React only
// renders reactProps and dispatches action names via handleReactAction.
//
// Confirmed dead code, NOT reproduced (verified via full read of both
// files): the entire right-hand "PatientRefunds" table block and every
// Currency/Department/ServiceItem/PackageName/Careprovider/Guarantor/
// TerminalNo/CardType field are commented out in the real template --
// none render on the live screen. $scope.ReceiptPicker() is defined but
// has no ng-click reference anywhere in the template (fully
// unreachable) -- and its confirmCallback references
// $scope.getReceiptData, which is never defined anywhere in the
// controller either (a second, independent confirmed pre-existing bug
// in that same dead function). The commented-out Save/Clear buttons are
// also not reproduced.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The "Transaction No" field's real translate value is the literal
//   typo "Transcation No" (billing.refund-form.transationno.lbl) --
//   reproduced verbatim, not corrected.
// - The "Collected On" date field is shared across Cheque/DD/Wire
//   Transfer payment types (PaymentTypeId 2, 3, 4) in addition to each
//   type's own specific date field (Cheque Date / DD Date / Transferred
//   On) -- so for Cheque payments, both "Collected On" and "Cheque
//   Date" render together. Reproduced exactly, not deduplicated.
export const BillingRefundFormScreen: React.FC<BillingRefundFormScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {},
    lookup,
    isCompleted = false,
    isAgainstReceipt = false,
    canShowCancelledBtn = false,
    canHidePrintledBtn = false,
  } = reactProps || {};

  const paymentTypeOptions = lookup?.PaymentType || [];
  const refundTypeOptions = lookup?.RefundType || [];
  const bankOptions = lookup?.Bank || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const paymentTypeId = item.PaymentTypeId;
  const showBankAndAuthCode = paymentTypeId === 5 || paymentTypeId === 6;
  const showChequeNo = paymentTypeId === 2;
  const showDDNo = paymentTypeId === 3;
  const showWireTransferNo = paymentTypeId === 4;
  const showCollectedOn = paymentTypeId === 2 || paymentTypeId === 3 || paymentTypeId === 4;
  const showChequeDate = paymentTypeId === 2;
  const showDDDate = paymentTypeId === 3;
  const showTransferredOn = paymentTypeId === 4;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: spacing.lg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h4 style={{ ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily, margin: 0 }}>Refunds</h4>
        <span style={{ cursor: 'pointer' }} onClick={() => dispatch('backToList')} title="Close">
          <img src="assets/svg/close.svg" alt="Close" />
        </span>
      </div>

      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <div style={fieldWrapStyle}>
            <Select
              label="Payment Mode"
              value={item.PaymentTypeId != null ? String(item.PaymentTypeId) : ''}
              options={paymentTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('paymentTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
              disabled={isCompleted}
            />
          </div>
          <div style={fieldWrapStyle}>
            <Input label="Refund Amount" value={item.RefundAmount != null ? String(item.RefundAmount) : ''} disabled />
          </div>
          <div style={fieldWrapStyle}>
            <Select
              label="Refund Type"
              value={item.RefundTypeId != null ? String(item.RefundTypeId) : ''}
              options={refundTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('refundTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
              disabled={isCompleted || isAgainstReceipt}
            />
          </div>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Comments</label>
            <textarea
              rows={3}
              maxLength={4000}
              value={item.Comments || ''}
              disabled={isCompleted}
              onChange={(e) => dispatch('commentsChange', { value: e.target.value })}
              style={{ width: '100%', fontFamily: typography.fontFamily, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          {showBankAndAuthCode && (
            <div style={fieldWrapStyle}>
              <Select
                label="Bank Name"
                value={item.BankId != null ? String(item.BankId) : ''}
                options={bankOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                onChange={(v) => dispatch('bankChange', { value: v ? parseInt(String(v), 10) : undefined })}
                disabled={isCompleted}
                required
              />
            </div>
          )}
          {showChequeNo && (
            <div style={fieldWrapStyle}>
              <Input
                label="Cheque No"
                value={item.ChequeNo || ''}
                onChange={(e) => dispatch('chequeNoChange', { value: e.target.value })}
                disabled={isCompleted}
                required
              />
            </div>
          )}
          {showDDNo && (
            <div style={fieldWrapStyle}>
              <Input
                label="DD No"
                value={item.DDNumber || ''}
                onChange={(e) => dispatch('ddNoChange', { value: e.target.value })}
                disabled={isCompleted}
                required
              />
            </div>
          )}
          {showWireTransferNo && (
            <div style={fieldWrapStyle}>
              <Input
                label="Transcation No"
                value={item.WireTransferId || ''}
                onChange={(e) => dispatch('wireTransferIdChange', { value: e.target.value })}
                disabled={isCompleted}
                required
              />
            </div>
          )}
          {showBankAndAuthCode && (
            <div style={fieldWrapStyle}>
              <Input
                label="Authorized Code"
                value={item.AuthorizeNumber || ''}
                onChange={(e) => dispatch('authorizeNumberChange', { value: e.target.value })}
                disabled={isCompleted}
                maxLength={8}
                required
              />
            </div>
          )}
          {showCollectedOn && (
            <div style={fieldWrapStyle}>
              <DatePicker
                label="Collected On"
                value={item.CollectedOn || ''}
                onChange={(v) => dispatch('collectedOnChange', { value: v })}
                disabled={isCompleted}
              />
            </div>
          )}
          {showChequeDate && (
            <div style={fieldWrapStyle}>
              <DatePicker
                label="Cheque Date"
                value={item.ChequeDate || ''}
                onChange={(v) => dispatch('chequeDateChange', { value: v })}
                disabled={isCompleted}
              />
            </div>
          )}
          {showDDDate && (
            <div style={fieldWrapStyle}>
              <DatePicker
                label=" DD Date"
                value={item.DDDate || ''}
                onChange={(v) => dispatch('ddDateChange', { value: v })}
                disabled={isCompleted}
              />
            </div>
          )}
          {showTransferredOn && (
            <div style={fieldWrapStyle}>
              <DatePicker
                label="Transferred On"
                value={item.WireTransferDate || ''}
                onChange={(v) => dispatch('wireTransferDateChange', { value: v })}
                disabled={isCompleted}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
        <div>
          {canShowCancelledBtn && (
            <Button variant="secondary" onClick={() => dispatch('cancel')}>Cancel Refund</Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button variant="secondary" onClick={() => dispatch('print')}>Print Preview</Button>
          {!canHidePrintledBtn && (
            <Button variant="primary" onClick={() => dispatch('completeRefund')}>Approve</Button>
          )}
        </div>
      </div>
    </div>
  );
};
