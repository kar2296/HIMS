import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface ReceivedReceiptsFilterScreenProps {
  part: 'header' | 'receiptno' | 'dateandstatus';
  reactProps?: {
    currentfilter?: {
      PaymentIdentifier?: string;
      PaymentDate?: string;
      InsurancePaymentStatusId?: number;
    };
    lookup?: { InsurancePaymentStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID receivedreceipts.html
// split. 'header' renders the title + Add ("+") button (navigates to
// app.claimmanagement-listtab.newreceipts, an AngularJS-fallback
// validator-gated form left untouched elsewhere in this migration).
// 'receiptno' renders the Receipt # search input (Enter-key only, no
// auto-refetch); the native <autosearch> Guarantor widget sits between
// this and 'dateandstatus' in the HTML and stays untouched (same
// business-search directive kept native throughout this migration).
// 'dateandstatus' renders Receipt Date + Status, both auto-refetching
// on change.
export const ReceivedReceiptsFilterScreen: React.FC<ReceivedReceiptsFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div>
        <h4 className="col-sm-9">Payer Receipts</h4>
        <div className="col-sm-3">
          <div className="filters">
            <button type="button" tabIndex={-1} className="btn-add" title="Payer receipt" onClick={() => dispatch('addNew')}>
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (part === 'receiptno') {
    return (
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Receipt #</label>
        <div className="col-sm-12">
          <input
            type="text"
            id="pid"
            className="form-control"
            placeholder="Receipt Number"
            value={currentfilter.PaymentIdentifier ?? ''}
            onChange={(e) => dispatch('paymentIdentifierChange', { value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Receipt Date</label>
        <div className="col-sm-12">
          <input
            type="date"
            className="form-control"
            value={currentfilter.PaymentDate ? currentfilter.PaymentDate.slice(0, 10) : ''}
            onChange={(e) => dispatch('paymentDateChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Status</label>
        <div className="col-sm-12">
          <select
            className="filter-combo form-control"
            value={currentfilter.InsurancePaymentStatusId ?? ''}
            onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
          >
            {(lookup.InsurancePaymentStatus || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
