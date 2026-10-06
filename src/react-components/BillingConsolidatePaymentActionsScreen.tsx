import React from 'react';
import { Button } from './Button';

interface BillingConsolidatePaymentActionsScreenProps {
  reactProps?: {
    canSaveAndApprove?: boolean;
    printpreferences?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (Billing / Consolidate Payment, action bar --
// see consolidatepayment.html's top-of-file disclosure for the full hybrid
// rationale). This mounts inside the real, separate sibling
// <div class="fooder-bgs"> that sits OUTSIDE both <form id="item_form">
// and <div id="opbillingcontrol"> in the real template -- not inside the
// payment-detail footer -- matching the live DOM structure exactly.
//
// Confirmed pre-existing quirks/bugs, preserved exactly (not "fixed"):
// - The real Print button's ng-click="print()" has no matching $scope.print
//   defined anywhere in consolidatepaymentController (unlike several
//   sibling screens, which each define their own). Clicking it today
//   throws silently inside Angular's expression evaluator with no visible
//   effect. Dispatching 'print' here is reproduced as a genuine no-op.
// - The facility-setting-driven visibility gate for the Print button
//   (getPharmacyPrintPreference()'s `if ($scope.printpreferences) if
//   (printpreferences<=0) $('#btnprint').hide()`) is a proven no-op:
//   $scope.printpreferences is hardcoded to 1 at controller init and never
//   reassigned by that function anywhere in the file (only the unrelated,
//   also-buggy $scope.dmprintpreferences is, via a further copy-paste bug
//   where its first assignment is immediately overwritten by a second,
//   unrelated facility-setting read). So the Print button is always shown
//   today regardless of facility settings. Mirrored below via the same
//   `printpreferences <= 0` gate (currently always false, matching
//   production) rather than hardcoding permanent visibility.
// - The real "DM Print" button is HTML-commented out in the template, so
//   $scope.dmPrint()/preparePrintData() (which DO exist and are otherwise
//   fully wired, including the genuinely-live Security PIN check and
//   dot-matrix printing via the getDMPrintDataController mixin) are
//   entirely unreachable in production today. Not rendered here, matching
//   what the live page shows.
// - Save & Approve dispatches straight to the real, unmodified
//   $scope.saveAndApprove(), which calls utl.Validator.validate($scope)
//   (backed by the hidden native mirror inputs in consolidatepayment.html)
//   and then getSelectionRows() -- the latter throws an uncaught
//   TypeError every time because $scope.gridApi is permanently undefined
//   (see BillingConsolidatePaymentGridScreen's disclosure for the full
//   root-cause). This is a genuine, major pre-existing production defect,
//   reproduced exactly by dispatching to the real function unmodified --
//   NOT fixed or worked around here.
// - ng-keyup="FooterFocus('saveAndApproveid')" on the real Save & Approve
//   button has no matching $scope.FooterFocus in this controller (though
//   it IS a real, defined convention in several unrelated controllers) --
//   confirmed dead, not reproduced.
// - ng-show="canSaveAndApprove" gates the real Save & Approve button;
//   findConsolidatePayBills() sets $scope.canSaveAndApprove = false right
//   before every search, and it is never reset back to true anywhere in
//   the controller except at initial declaration -- so in practice, once
//   a Find has run, Save & Approve stays hidden for the rest of the
//   screen's life. Reproduced via the same reactProps.canSaveAndApprove
//   flag mirrored straight from the real $scope value, not recomputed.
export const BillingConsolidatePaymentActionsScreen: React.FC<BillingConsolidatePaymentActionsScreenProps> = ({ reactProps, onAction }) => {
  const canSaveAndApprove = reactProps?.canSaveAndApprove ?? false;
  const printpreferences = reactProps?.printpreferences;
  const showPrint = !(printpreferences != null && printpreferences <= 0);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      {showPrint && (
        <button type="button" id="btnprint" className="draftbutton" tabIndex={-1} onClick={() => dispatch('print')}>
          Print Preview
        </button>
      )}
      {canSaveAndApprove && (
        <Button variant="primary" onClick={() => dispatch('saveAndApprove')}>Approve</Button>
      )}
    </div>
  );
};
