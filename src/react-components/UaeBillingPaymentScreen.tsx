import React from 'react';

interface LookupOpt { Id: number; Text: string; }

interface UaeBillingPaymentScreenProps {
  part: 'payment' | 'footer';
  reactProps?: {
    item?: {
      BankId?: number;
      ChequeNo?: string;
      ChequeDate?: string;
      DDNumber?: string;
      DDDate?: string;
      WireTransferId?: string;
      WireTransferDate?: string;
      AuthorizeNumber?: string;
      CollectedOn?: string;
      TerminalNoId?: number;
      CardTypeId?: number;
    };
    currentcontext?: { PaymentTypeId?: number; ReceiptAmt?: number };
    lookup?: {
      PaymentType?: LookupOpt[];
      Bank?: LookupOpt[];
      Terminal?: LookupOpt[];
      CardType?: LookupOpt[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration for the Receipt/payment fieldset and footer of
// uae-billing-form.html, split into 2 mounts.
//
// 'payment': Payment Type (currentcontext.PaymentTypeId) and its
// conditional Bank/Cheque/DD/WireTransfer/Card/Terminal/CollectedOn fields
// are real, live two-way bindings -- reproduced faithfully, including
// showing them together for PaymentTypeId 5 or 6 (card types show both
// Card Type + Terminal + Authorised Code) exactly as in the original. The
// Credit Approver dropdowns are OMITTED: both variants are gated on
// `currentcontext.TotBalanceAmt>0`, and TotBalanceAmt is initialized to 0
// and never reassigned anywhere in this controller, so that condition is
// always false -- they never render. The "View Receipt" button is likewise
// omitted: canShowViewReceipt is only ever set inside applyVisibilityRules(),
// which is defined but never called (its one call site is commented out)
// -- canShowViewReceipt stays undefined and the button never renders.
//
// 'footer': ONLY Back and Clear/Cancel actually render. Save
// (`ng-if="HasPrivilege('QuickRegistration','Save')"`) and Save & Approve
// are omitted -- `HasPrivilege` is not defined anywhere (this codebase's
// privilege mixin, utl.Ctrl.getPrivilegeCtrl, only provides `HasAccess`,
// never `HasPrivilege`), so those ng-if calls always throw/catch to false
// and the buttons never render. Visit Print is likewise omitted
// (`ng-if="Visitprint"`, never assigned). Back and Clear/Cancel DO render
// but are reproduced as real, visible, intentionally-unhandled no-ops:
// backToList() and clear() are both referenced in the template but neither
// is defined anywhere on this controller -- clicking them does nothing in
// the original (this screen has no save/submit path at all).
export const UaeBillingPaymentScreen: React.FC<UaeBillingPaymentScreenProps> = ({ part, reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const currentcontext = reactProps?.currentcontext || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'payment') {
    const pt = currentcontext.PaymentTypeId;
    return (
      <>
        <div className="col-sm-6">
          <div className="form-group">
            <label className="col-sm-5">Payment Type</label>
            <div className="col-sm-7 toprighttext">
              <select className="form-control" value={pt ?? ''} onChange={(e) => dispatch('paymentTypeChange', { value: Number(e.target.value) })}>
                {(lookup.PaymentType || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-5">Receipt Amount</label>
            <div className="col-sm-7">
              <input type="text" className="form-control" value={currentcontext.ReceiptAmt ?? ''} disabled readOnly />
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          {pt !== undefined && pt > 1 && pt !== 7 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Bank Name</label>
              <div className="col-sm-7 toprightbankname">
                <select className="form-control" value={item.BankId ?? ''} onChange={(e) => dispatch('bankIdChange', { value: Number(e.target.value) })}>
                  {(lookup.Bank || []).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {pt === 2 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Cheque No</label>
              <div className="col-sm-7">
                <input type="text" className="form-control" value={item.ChequeNo ?? ''} onChange={(e) => dispatch('chequeNoChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 3 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">DD No</label>
              <div className="col-sm-7">
                <input type="text" className="form-control" value={item.DDNumber ?? ''} onChange={(e) => dispatch('ddNumberChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 4 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Transaction No</label>
              <div className="col-sm-7">
                <input type="text" className="form-control" value={item.WireTransferId ?? ''} onChange={(e) => dispatch('wireTransferIdChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 5 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Authorised Code</label>
              <div className="col-sm-7">
                <input type="text" className="form-control" maxLength={8} value={item.AuthorizeNumber ?? ''} onChange={(e) => dispatch('authorizeNumberChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {(pt === 4 || pt === 3 || pt === 2) && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Collected On</label>
              <div className="col-sm-7 toprightcollectedon">
                <input type="date" className="form-control" value={item.CollectedOn ? String(item.CollectedOn).slice(0, 10) : ''} onChange={(e) => dispatch('collectedOnChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {(pt === 5 || pt === 6) && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Terminal No</label>
              <div className="col-sm-7 toprightterminateno">
                <select className="form-control" value={item.TerminalNoId ?? ''} onChange={(e) => dispatch('terminalNoIdChange', { value: Number(e.target.value) })}>
                  {(lookup.Terminal || []).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {pt === 2 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Cheque Date</label>
              <div className="col-sm-7 toprightchequedate">
                <input type="date" className="form-control" value={item.ChequeDate ? String(item.ChequeDate).slice(0, 10) : ''} onChange={(e) => dispatch('chequeDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 3 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">DD Date</label>
              <div className="col-sm-7 toprightchequedate">
                <input type="date" className="form-control" value={item.DDDate ? String(item.DDDate).slice(0, 10) : ''} onChange={(e) => dispatch('ddDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 4 && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Transferred On</label>
              <div className="col-sm-7 toprightchequedate">
                <input type="date" className="form-control" value={item.WireTransferDate ? String(item.WireTransferDate).slice(0, 10) : ''} onChange={(e) => dispatch('wireTransferDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {(pt === 5 || pt === 6) && (
            <div className="form-group">
              <label className="col-sm-5 control-label">Card Type</label>
              <div className="col-sm-7 toprightchequedate">
                <select className="form-control" value={item.CardTypeId ?? ''} onChange={(e) => dispatch('cardTypeIdChange', { value: Number(e.target.value) })}>
                  {(lookup.CardType || []).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // part === 'footer'
  return (
    <div className="col-sm-12">
      <div className="pull-left footer_reg_align">
        <button type="button" className="btn pyr-color10 btn-sm" tabIndex={-1} onClick={() => dispatch('backToList')}>
          <i className="fa fa-angle-left" aria-hidden="true"></i>&nbsp;&nbsp;
          <span className="btn-fontsize">Back</span>
        </button>
      </div>
      <div className="pull-right footer_reg_align">
        <button type="button" className="btn btn-warning btn-sm ml4" onClick={() => dispatch('clear')}>Clear</button>
        <button type="button" className="draftbutton" onClick={() => dispatch('backToList')}>Cancel</button>
      </div>
    </div>
  );
};
