import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface OpBillingFormSelectScreenProps {
  part: 'receipttype' | 'currencytype' | 'paymenttype' | 'bank' | 'cardtype' | 'cardholder';
  reactProps?: {
    isDisabled?: boolean;
    isCompleted?: boolean;
    receiptTypeId?: number;
    currencyTypeId?: number;
    paymentTypeId?: number;
    bankId?: number;
    cardTypeId?: number;
    receiptTypeOptions?: LookupItem[];
    currencyTypeOptions?: LookupItem[];
    paymentTypeOptions?: LookupItem[];
    bankOptions?: LookupItem[];
    cardTypeOptions?: LookupItem[];
    cardHolderOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the six <ui-select> dropdowns (Receipt
// Type, Currency Type, Payment Type, Bank, Card Type, Card Holder) in
// opbilling-form.html (the OP payment-mode add form), following the
// established ui-select -> plain <select> pattern. The real
// <div ui-grid="vm.gridConfig"> results grid stays entirely native per
// the established real-ui-grid rule, as do all the native date-pickers
// and text inputs, and the "+" Add button.
//
// CONFIRMED PRE-EXISTING BUG documented (not fixed): the "Card Type"
// dropdown (ng-if="item.PaymentTypeId==5", first occurrence) and the
// "Card Holder" dropdown (ng-if="item.PaymentTypeId==5", second
// occurrence) both bind ng-model to the SAME field, item.CardTypeId, but
// populate from two DIFFERENT lookup arrays (lookup.CardType vs
// lookup.CardHolder). Selecting a value in either dropdown overwrites the
// single shared CardTypeId field, so the two controls fight over one
// value and the "Card Holder" dropdown's displayed selection will not
// reliably match a real CardHolder entry (since CardTypeId values are
// keyed against CardType, not CardHolder). Reproduced as-is: the
// 'cardtype' and 'cardholder' parts both read/write reactProps.cardTypeId.
//
// ALSO CONFIRMED: the footer's visible "Save" button calls save()`, which
// is never defined anywhere in this controller - it is dead/no-op. The
// actual save path is the "+" Add button inside the form (ng-click=
// "saveItem()", which IS defined and genuinely adds a payment row and
// refreshes the grid). Native markup, not part of this component, but
// documented here since it's easy to miss.
export const OpBillingFormSelectScreen: React.FC<OpBillingFormSelectScreenProps> = ({ part, reactProps, onAction }) => {
  const disabled = part === 'receipttype' ? !!reactProps?.isCompleted : !!reactProps?.isDisabled;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const renderSelect = (
    value: number | undefined,
    options: LookupItem[],
    actionName: string
  ) => (
    <select
      className="filter-combo form-control"
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => dispatch(actionName, { value: e.target.value ? Number(e.target.value) : null })}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
      ))}
    </select>
  );

  switch (part) {
    case 'receipttype':
      return renderSelect(reactProps?.receiptTypeId, reactProps?.receiptTypeOptions || [], 'receiptTypeChange');
    case 'currencytype':
      return renderSelect(reactProps?.currencyTypeId, reactProps?.currencyTypeOptions || [], 'currencyTypeChange');
    case 'paymenttype':
      return renderSelect(reactProps?.paymentTypeId, reactProps?.paymentTypeOptions || [], 'paymentTypeChange');
    case 'bank':
      return renderSelect(reactProps?.bankId, reactProps?.bankOptions || [], 'bankChange');
    case 'cardtype':
      return renderSelect(reactProps?.cardTypeId, reactProps?.cardTypeOptions || [], 'cardTypeChange');
    case 'cardholder':
      return renderSelect(reactProps?.cardTypeId, reactProps?.cardHolderOptions || [], 'cardTypeChange');
    default:
      return null;
  }
};
