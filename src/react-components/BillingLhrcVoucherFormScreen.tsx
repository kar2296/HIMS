import React from 'react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface VoucherItem {
  LHRCVoucherNo?: string;
  VoucherDate?: string; // ISO yyyy-mm-dd, converted from/to the real AngularJS Date object by the bridge
  VoucherTypeId?: number;
  PaymentTypeId?: number;
  BankId?: number;
  ChequeNo?: string;
  DDNumber?: string;
  WireTransferId?: string;
  AuthorizeNumber?: string;
  CollectedOn?: string;
  TerminalNoId?: number;
  ChequeDate?: string;
  DDDate?: string;
  WireTransferDate?: string;
  CardTypeId?: number;
}

interface BillingLhrcVoucherFormScreenProps {
  reactProps?: {
    item?: VoucherItem;
    lookup?: {
      VoucherType?: LookupItem[];
      PaymentType?: LookupItem[];
      Bank?: LookupItem[];
      TerminalNoId?: LookupItem[];
      Terminal?: LookupItem[];
      CardType?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const fieldWrapStyle: React.CSSProperties = { marginBottom: spacing.md };

// UI-MODERNIZATION RETROFIT (Billing / LHRC Voucher form, app.lhrcvoucherform,
// LHRCVoucherFormController). Rebuilds the top section of the real modal's
// form -- Voucher No, Voucher Date, Type, Payment Type, and every
// PaymentTypeId-conditional payment-detail field -- as a React component
// mounted via the existing AngularJS<->React bridge directive, sitting
// inside the real, unchanged <form name="item_form"> in lhrcvoucher-form.html.
//
// The "Patient Name" field (a <patientsearch> component, itself already
// independently React-migrated via its own nested bridge) and everything
// below it are NOT part of this mount -- see lhrcvoucher-form.html
// (native patientsearch form-group) and BillingLhrcVoucherFormDetailsScreen
// (Ambulance/Driver/Vehicle/PayTo/Amount/Remarks/Mobile/CreatedBy + the
// footer action bar).
//
// AngularJS remains authoritative for the real
// Billing/LHRCVoucher/GetLHRCVoucherById/AddLHRCVoucher/UpdateLHRCVoucher
// calls and applyVisibilityRules(). React only renders reactProps and
// dispatches action names via handleReactAction.
//
// VALIDATION FIDELITY: the real required/ng-pattern validators for Voucher
// Date, Bank Name, Cheque No, DD No, Wire Transfer No, Authorized Code,
// and Terminal No/Card Type are preserved via hidden native mirror inputs
// in lhrcvoucher-form.html (see the disclosure comment there and in
// lhrcvoucher-form.js) rather than reimplemented here, so
// utl.Validator.validate($scope)'s real item_form.$valid check keeps
// working exactly as before.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The Voucher No and Voucher Date fields are permanently disabled in
//   the real template (a literal HTML `disabled` attribute, not
//   ng-disabled) -- reproduced as always-disabled here, not editable.
// - The "Bank Name" field shows for ANY PaymentTypeId other than 1 (Cash)
//   and 7, not just card/POS types -- distinct from the narrower
//   PaymentTypeId 5||6 gating used by the Refunds form's Bank Name field.
//   Reproduced exactly.
// - Several labels here reuse the shared billing.receipt-form.* i18n
//   namespace verbatim, including its pre-existing quirks: "Transcation
//   No" (a real typo in billing.receipt-form.transationno.lbl, not
//   "Transaction No"), "Auth Code" (billing.receipt-form.authorisedcode.lbl,
//   not "Authorized Code"), and " DD Date" (billing.receipt-form.dddate.lbl
//   has a real leading space). Reproduced verbatim, not corrected.
export const BillingLhrcVoucherFormScreen: React.FC<BillingLhrcVoucherFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};

  const voucherTypeOptions = lookup?.VoucherType || [];
  const paymentTypeOptions = lookup?.PaymentType || [];
  const bankOptions = lookup?.Bank || [];
  const terminalOptions = lookup?.Terminal || [];
  const cardTypeOptions = lookup?.CardType || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const paymentTypeId = item.PaymentTypeId;
  const showBank = paymentTypeId != null && paymentTypeId > 1 && paymentTypeId !== 7;
  const showChequeNo = paymentTypeId === 2;
  const showDDNo = paymentTypeId === 3;
  const showWireTransferNo = paymentTypeId === 4;
  const showAuthCode = paymentTypeId === 5 || paymentTypeId === 6;
  const showCollectedOn = paymentTypeId === 2 || paymentTypeId === 3 || paymentTypeId === 4;
  const showTerminal = paymentTypeId === 5 || paymentTypeId === 6;
  const showChequeDate = paymentTypeId === 2;
  const showDDDate = paymentTypeId === 3;
  const showTransferredOn = paymentTypeId === 4;
  const showCardType = paymentTypeId === 5 || paymentTypeId === 6;

  return (
    <div style={{ padding: `0 ${spacing.md}` }}>
      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <div style={fieldWrapStyle}>
            <Input label="Voucher No" value={item.LHRCVoucherNo || ''} disabled />
          </div>
          <div style={fieldWrapStyle}>
            <DatePicker label="Date" value={item.VoucherDate || ''} onChange={(v) => dispatch('voucherDateChange', { value: v })} disabled />
          </div>
          <div style={fieldWrapStyle}>
            <Select
              label="Type"
              value={item.VoucherTypeId != null ? String(item.VoucherTypeId) : ''}
              options={voucherTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('voucherTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
            />
          </div>
          <div style={fieldWrapStyle}>
            <Select
              label="Payment Type"
              value={item.PaymentTypeId != null ? String(item.PaymentTypeId) : ''}
              options={paymentTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('paymentTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          {showBank && (
            <div style={fieldWrapStyle}>
              <Select
                label="Bank Name"
                value={item.BankId != null ? String(item.BankId) : ''}
                options={bankOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                onChange={(v) => dispatch('bankChange', { value: v ? parseInt(String(v), 10) : undefined })}
                required
              />
            </div>
          )}
          {showChequeNo && (
            <div style={fieldWrapStyle}>
              <Input label="Cheque No" value={item.ChequeNo || ''} onChange={(e) => dispatch('chequeNoChange', { value: e.target.value })} required />
            </div>
          )}
          {showDDNo && (
            <div style={fieldWrapStyle}>
              <Input label="DD No" value={item.DDNumber || ''} onChange={(e) => dispatch('ddNumberChange', { value: e.target.value })} required />
            </div>
          )}
          {showWireTransferNo && (
            <div style={fieldWrapStyle}>
              <Input label="Transcation No" value={item.WireTransferId || ''} onChange={(e) => dispatch('wireTransferIdChange', { value: e.target.value })} required />
            </div>
          )}
          {showAuthCode && (
            <div style={fieldWrapStyle}>
              <Input
                label="Auth Code"
                value={item.AuthorizeNumber || ''}
                onChange={(e) => dispatch('authorizeNumberChange', { value: e.target.value })}
                maxLength={8}
                required
              />
            </div>
          )}
          {showCollectedOn && (
            <div style={fieldWrapStyle}>
              <DatePicker label="Collected On" value={item.CollectedOn || ''} onChange={(v) => dispatch('collectedOnChange', { value: v })} />
            </div>
          )}
          {showTerminal && (
            <div style={fieldWrapStyle}>
              <Select
                label="Terminal No"
                value={item.TerminalNoId != null ? String(item.TerminalNoId) : ''}
                options={terminalOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                onChange={(v) => dispatch('terminalChange', { value: v ? parseInt(String(v), 10) : undefined })}
                required
              />
            </div>
          )}
          {showChequeDate && (
            <div style={fieldWrapStyle}>
              <DatePicker label="Cheque Date" value={item.ChequeDate || ''} onChange={(v) => dispatch('chequeDateChange', { value: v })} />
            </div>
          )}
          {showDDDate && (
            <div style={fieldWrapStyle}>
              <DatePicker label=" DD Date" value={item.DDDate || ''} onChange={(v) => dispatch('ddDateChange', { value: v })} />
            </div>
          )}
          {showTransferredOn && (
            <div style={fieldWrapStyle}>
              <DatePicker label="Transferred On" value={item.WireTransferDate || ''} onChange={(v) => dispatch('wireTransferDateChange', { value: v })} />
            </div>
          )}
          {showCardType && (
            <div style={fieldWrapStyle}>
              <Select
                label="Card Type"
                value={item.CardTypeId != null ? String(item.CardTypeId) : ''}
                options={cardTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                onChange={(v) => dispatch('cardTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
                required
              />
            </div>
          )}
        </div>
      </div>
      <div style={{ borderBottom: `1px solid ${colors.border}`, margin: `${spacing.sm} 0 ${spacing.md}` }} />
    </div>
  );
};
