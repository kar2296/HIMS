import React from 'react';
import { Select } from '../components/ui/Select';

interface LookupItem {
  Id: number;
  Text: string;
}

interface BillingConsolidatePaymentFilterScreenProps {
  reactProps?: {
    currentfilter?: { PatientId?: number; BillTypeId?: number };
    lookup?: { BillType?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (Billing / Consolidate Payment, app.consolidatepayment,
// consolidatepaymentController) -- see consolidatepayment.html's top-of-file
// disclosure comment for the full hybrid-bridge rationale (real <form>/
// <patientsearch> stay native; this mounts as the sibling <react-component>
// inside the same Bootstrap `.row` as the native patientsearch column, so
// the `col-sm-4` / `doct_invoice_btn` wrapper classes below are the real,
// unchanged classes from consolidatepayment.html -- reused here (not
// reinvented) so the preserved <style> block in the template head keeps
// controlling layout/spacing exactly as before.
//
// Load / Find / Clear map straight onto the real, unmodified
// $scope.getList() / $scope.findConsolidatePayBills() / $scope.Clear()
// (Clear literally calls $state.reload() -- reproduced by dispatching
// 'clear' through to that same real function, not reimplemented as a
// client-side form reset).
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - "Find" and "Clear" use translate="Find" / translate="Clear" directly
//   (literal English strings as the translate key, not real dotted i18n
//   keys) -- confirmed absent from every en.json in the app. Reproduced as
//   plain literal button text, matching what renders today.
// - Both the Find and Clear buttons render the SAME icon
//   (fa-search-plus) in the real template -- Clear does not get a
//   clear/reset-style icon. Reproduced verbatim.
export const BillingConsolidatePaymentFilterScreen: React.FC<BillingConsolidatePaymentFilterScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {}, lookup } = reactProps || {};
  const billTypeOptions = lookup?.BillType || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <>
      <div className="col-sm-4">
        <label className="col-sm-4 control-label">Bill Type</label>
        <div className="col-sm-8 doct_invoice_ifield">
          <Select
            value={currentfilter.BillTypeId != null ? String(currentfilter.BillTypeId) : ''}
            options={billTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('billTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
          />
        </div>
      </div>
      <div className="col-sm-4 doct_invoice_btn">
        <button id="btnSearch" type="button" className="draftbutton" onClick={() => dispatch('loadBills')}>Load</button>
        <button id="btnSearch" type="button" className="text-white btn prv-color12 btn-sm" onClick={() => dispatch('find')}>
          <i className="fa fa-search-plus" aria-hidden="true"></i> Find
        </button>
        <button id="btnSearch" type="button" className="btn btn-warning btn-sm text-white  btn-sm" onClick={() => dispatch('clear')}>
          <i className="fa fa-search-plus" aria-hidden="true"></i> Clear
        </button>
      </div>
    </>
  );
};
