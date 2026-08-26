import React from 'react';

interface LookupOpt { Id: number; Text: string; }

interface OpClearancePaymentScreenProps {
  part: 'discount' | 'paymenttype' | 'paymentdetails' | 'summary' | 'footer';
  reactProps?: {
    item?: {
      PaymentTypeId?: number;
      BankId?: number;
      ChequeNo?: string;
      ChequeDate?: string;
      UPIRefNumber?: string;
      DDNumber?: string;
      DDDate?: string;
      WireTransferId?: string;
      WireTransferDate?: string;
      AuthorizeNumber?: string;
      CollectedOn?: string;
      Comments?: string;
      PrivateDueId?: number;
      GuarantorDueId?: number;
      GuarantorTypeId?: number;
    };
    currentcontext?: { ReceiptAmt?: number; TotBalanceAmt?: number };
    currentfilter?: {
      PatientId?: number;
      TotalGrossAmount?: number;
      TotalDiscountAmount?: number;
      TotalAvailableAmount?: number;
      TotalPaidAmount?: number;
      TotalRefundAmount?: number;
      TotalReturnAmount?: number;
      TotalDueAmount?: number;
      TotalSalesAmount?: number;
    };
    lookup?: {
      PaymentType?: LookupOpt[];
      Bank?: LookupOpt[];
      PrivateDueApprover?: LookupOpt[];
      User?: LookupOpt[];
    };
    items?: { IsPharmacyClearance?: boolean };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function fmtMoney(v?: number) {
  return (v ?? 0).toFixed(2);
}

// React bridge migration for the discount/payment/summary/footer region of
// opclearance-form.html, split into 4 mounts.
//
// 'discount': CONFIRMED BROKEN, reproduced as-is. This controller never
// extends utl.Ctrl.getPrivilegeCtrl, so HasAccess(...) is undefined
// everywhere it's called here -- it throws (caught, evaluates falsy) so the
// discount-value input's `ng-if="HasAccess('PharmacySales','PS_Discount')"`
// never renders. Likewise `item.TotDiscAmount` is never assigned anywhere
// in this controller, so the Discount Approver dropdown's
// `ng-if="item.TotDiscAmount>0"` never renders either. The two labels
// ("Discount" and "Discount Approver") are the ONLY things that actually
// render in this region -- no input ever appears under either. Reproduced
// as label-only, matching the real broken UI exactly.
//
// 'paymenttype': Payment Type select is real; the "Adjustment" link
// (PaymentTypeId==7) dispatches to the real AdjustAgainstAdvance(). The
// Received Amount input carries a literal HTML `disabled` attribute in the
// original IN ADDITION to `ng-disabled` -- the literal attribute alone
// makes it permanently non-interactive regardless of the ng-disabled
// expression, so it is display-only here too. The "addPay" plus-button
// (ng-if="MultiPay") never renders (MultiPay is undefined) and is omitted.
// Credit-approver selects are gated on item.GuarantorTypeId, a real value
// from encounter/guarantor data.
//
// 'paymentdetails': the Bank/Cheque/DD/UPI/WireTransfer/Card fields gated
// on item.PaymentTypeId are all real and straightforward. Their
// `ng-disabled="item.isCompleted"` is always false (isCompleted is never
// assigned) so they are never actually disabled here either -- always
// editable, reproduced as such (no disabled prop wired to isCompleted).
//
// 'summary': the billingbanner totals table -- all real, interpolated
// currency values from currentfilter, no bugs.
//
// 'footer': Pay Advance / Print / Back / Pay Due / Finalize are all real
// and wired to their unchanged controller functions. The "DM Print" button
// is omitted -- $scope.ShowPrintBtn is hardcoded `false` and the one other
// assignment site is commented out, so `ng-if="ShowPrintBtn==1"` can never
// be true; the button never renders in the original.
export const OpClearancePaymentScreen: React.FC<OpClearancePaymentScreenProps> = ({ part, reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const currentcontext = reactProps?.currentcontext || {};
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'discount') {
    return (
      <div className="col-sm-12">
        <div className="col-sm-6 no-padding">
          <label className="col-sm-12">Discount</label>
          <label className="col-sm-12">Discount Approver</label>
        </div>
        <div>
          <label className="col-sm-12">Remarks</label>
          <div className="col-sm-12">
            <input type="text" className="form-control" title={item.Comments}
              value={item.Comments ?? ''} onChange={(e) => dispatch('remarksChange', { value: e.target.value })}
              placeholder="Remarks" />
          </div>
        </div>
      </div>
    );
  }

  if (part === 'paymenttype') {
    return (
      <div className="col-sm-4">
        <div>
          <label className="col-sm-12">Payment Type</label>
          <div className="col-sm-12 toprighttext">
            <select className="form-control" value={item.PaymentTypeId ?? ''}
              onChange={(e) => dispatch('paymentTypeChange', { value: Number(e.target.value) })}>
              {(lookup.PaymentType || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        {item.PaymentTypeId === 7 && (
          <a className="link" onClick={() => dispatch('adjustAgainstAdvance')} style={{ marginLeft: 46 }}>Adjustment</a>
        )}
        <div>
          <label className="col-sm-12">Receipt Amount</label>
          <div className="col-sm-12">
            <input type="text" className="form-control" value={currentcontext.ReceiptAmt ?? ''} disabled readOnly />
          </div>
        </div>
        {(currentcontext.TotBalanceAmt ?? 0) > 0 && (
          <div>
            {item.GuarantorTypeId === 1 && (
              <>
                <label className="col-sm-12">Credit Approver</label>
                <div className="col-sm-12">
                  <select className="form-control" value={item.PrivateDueId ?? ''}
                    onChange={(e) => dispatch('creditApproverChange', { value: Number(e.target.value) })}>
                    {(lookup.PrivateDueApprover || []).map((opt) => (
                      <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {(item.GuarantorTypeId ?? 0) > 1 && (
              <div className="col-sm-12">
                <select className="form-control" value={item.GuarantorDueId ?? ''} disabled>
                  {(lookup.User || []).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (part === 'paymentdetails') {
    const pt = item.PaymentTypeId;
    return (
      <>
        <div className="col-sm-4">
          {pt !== undefined && pt > 1 && pt !== 7 && (
            <div>
              <label className="col-sm-12">Bank Name</label>
              <div className="col-sm-12 toprightbankname">
                <select className="form-control" value={item.BankId ?? ''} onChange={(e) => dispatch('bankIdChange', { value: Number(e.target.value) })}>
                  {(lookup.Bank || []).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {pt === 2 && (
            <div>
              <label className="col-sm-12">Cheque No</label>
              <div className="col-sm-12">
                <input type="text" className="form-control" value={item.ChequeNo ?? ''} onChange={(e) => dispatch('chequeNoChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 11 && (
            <div>
              <label className="col-sm-12">Ref Number</label>
              <div className="col-sm-12">
                <input type="text" className="form-control" value={item.UPIRefNumber ?? ''} onChange={(e) => dispatch('upiRefNumberChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 3 && (
            <div>
              <label className="col-sm-12">DD No</label>
              <div className="col-sm-12">
                <input type="text" className="form-control" value={item.DDNumber ?? ''} onChange={(e) => dispatch('ddNumberChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 4 && (
            <div>
              <label className="col-sm-12">Transaction No</label>
              <div className="col-sm-12">
                <input type="text" className="form-control" value={item.WireTransferId ?? ''} onChange={(e) => dispatch('wireTransferIdChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {(pt === 5 || pt === 6) && (
            <div>
              <label className="col-sm-12">Authorised Code</label>
              <div className="col-sm-12">
                <input type="text" className="form-control" maxLength={4} value={item.AuthorizeNumber ?? ''} onChange={(e) => dispatch('authorizeNumberChange', { value: e.target.value })} />
              </div>
            </div>
          )}
        </div>
        <div className="col-sm-4">
          {pt === 2 && (
            <div>
              <label className="col-sm-12">Cheque Date</label>
              <div className="col-sm-12 toprightchequedate">
                <input type="date" className="form-control" value={item.ChequeDate ? String(item.ChequeDate).slice(0, 10) : ''} onChange={(e) => dispatch('chequeDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 3 && (
            <div>
              <label className="col-sm-12">DD Date</label>
              <div className="col-sm-12 toprightchequedate">
                <input type="date" className="form-control" value={item.DDDate ? String(item.DDDate).slice(0, 10) : ''} onChange={(e) => dispatch('ddDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {pt === 4 && (
            <div>
              <label className="col-sm-12">Transferred On</label>
              <div className="col-sm-12 toprightchequedate">
                <input type="date" className="form-control" value={item.WireTransferDate ? String(item.WireTransferDate).slice(0, 10) : ''} onChange={(e) => dispatch('wireTransferDateChange', { value: e.target.value })} />
              </div>
            </div>
          )}
          {(pt === 4 || pt === 3 || pt === 2) && (
            <div>
              <label className="col-sm-12">Collected On</label>
              <div className="col-sm-12 toprightcollectedon">
                <input type="date" className="form-control" value={item.CollectedOn ? String(item.CollectedOn).slice(0, 10) : ''} onChange={(e) => dispatch('collectedOnChange', { value: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (part === 'summary') {
    return (
      <div className="col-sm-3">
        <div className="billingbanner">
          <table id="bannerdetails" className="foot">
            <tbody>
              <tr><td>Gross Amount :</td><td className="currency-align">{fmtMoney(currentfilter.TotalGrossAmount)}</td></tr>
              <tr><td>Discount :</td><td className="currency-align">{fmtMoney(currentfilter.TotalDiscountAmount)}</td></tr>
              <tr><td>Available Advance :</td><td className="currency-align">{fmtMoney(currentfilter.TotalAvailableAmount)}</td></tr>
              <tr><td>Paid Amount :</td><td className="currency-align">{fmtMoney(currentfilter.TotalPaidAmount)}</td></tr>
              <tr><td>Refunded Amount:</td><td className="currency-align">{fmtMoney(currentfilter.TotalRefundAmount)}</td></tr>
              {(currentfilter.TotalDueAmount ?? 0) > 0 && (
                <tr><td>Refunded Amount Used:</td><td className="currency-align">{fmtMoney(currentfilter.TotalReturnAmount)}</td></tr>
              )}
              <tr><td>Due Amount :</td><td className="currency-align">{fmtMoney(currentfilter.TotalDueAmount)}</td></tr>
              <tr className="drhms-special-count"><td>Net Amount</td><td className="currency-align">{fmtMoney(currentfilter.TotalSalesAmount)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // part === 'footer'
  const items = reactProps?.items || {};
  return (
    <div className="fooder-bgs">
      <div className="pull-left">
        {(currentfilter.PatientId ?? 0) > 0 && (
          <button className="draftbutton" onClick={() => dispatch('payAdvance')}>Pay Advance</button>
        )}
        <button type="button" className="draftbutton" tabIndex={-1} onClick={() => dispatch('print')}>
          <i className="fa fa-print"></i>Print
        </button>
        <button type="button" className="draftbutton" onClick={() => dispatch('backToList')}>Back</button>
      </div>
      <div className="pull-right">
        {(currentcontext.ReceiptAmt ?? 0) > 0 && (
          <button type="button" className="draftbutton" onClick={() => dispatch('payDue')}>Pay Due</button>
        )}
        {(currentfilter.PatientId ?? 0) > 0 && (
          <button type="button" className="draftbutton"
            disabled={items.IsPharmacyClearance === true || (currentcontext.ReceiptAmt ?? 0) > 0}
            onClick={() => dispatch('finalize')}>Finalize</button>
        )}
      </div>
    </div>
  );
};
