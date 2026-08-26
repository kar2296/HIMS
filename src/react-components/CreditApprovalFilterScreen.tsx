import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CreditApprovalFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
      BillTypeId?: number;
      CreditApprovalStatusId?: number;
    };
    lookup?: { BillType?: LookupItem[]; CreditApprovalStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, filter row for creditapprovalrequestlist.html
// (single mount -- the original's <patientsearch> is already commented
// out/dead, so there is no live native widget to sandwich here).
export const CreditApprovalFilterScreen: React.FC<CreditApprovalFilterScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="row">
      <form id="item_form" name="item_form" className="form-horizontal" role="form">
        <div className="form-group col-sm-4">
          <label className="col-sm-12">From Date</label>
          <div className="col-sm-12">
            <input
              type="date"
              className="form-control"
              value={currentfilter.FromBillDate ? currentfilter.FromBillDate.slice(0, 10) : ''}
              onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-4">
          <label className="col-sm-12">To Date</label>
          <div className="col-sm-12">
            <input
              type="date"
              className="form-control"
              value={currentfilter.ToBillDate ? currentfilter.ToBillDate.slice(0, 10) : ''}
              onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-4">
          <label className="col-sm-12">Bill Number</label>
          <div className="col-sm-12">
            <input
              type="text"
              className="form-control"
              value={currentfilter.BillNo ?? ''}
              onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-4">
          <label className="col-sm-12">Bill Type</label>
          <div className="col-sm-12">
            <select
              id="billtype"
              className="form-control"
              value={currentfilter.BillTypeId ?? ''}
              onChange={(e) => dispatch('billTypeChange', { value: Number(e.target.value) })}
            >
              {(lookup.BillType || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group col-sm-3">
          <label className="col-sm-12">Status</label>
          <div className="col-sm-12">
            {/* disabled in the original (ui-select ... disabled) -- reproduced
                as a permanently disabled, display-only select */}
            <select
              id="doctorid"
              className="form-control"
              value={currentfilter.CreditApprovalStatusId ?? ''}
              disabled
              onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
            >
              {(lookup.CreditApprovalStatus || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group col-sm-3">
          <button className="draftbutton" onClick={() => dispatch('fetch')}>
            <span>Fetch</span>
          </button>
        </div>
      </form>
    </div>
  );
};
