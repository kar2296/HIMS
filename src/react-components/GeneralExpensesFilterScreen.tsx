import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface GeneralExpensesFilterScreenProps {
  part: 'addbutton' | 'filters';
  reactProps?: {
    currentfilter?: {
      FromDate?: string;
      ToDate?: string;
      PaymentTypeId?: number;
      GeneralExpenseStatusId?: number;
    };
    lookup?: { PaymentType?: LookupItem[]; GeneralExpenseStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID generalexpenses-list split
// (see GeneralExpensesListScreen.tsx / generalexpenses-list.js for the
// full disclosure). 'addbutton' renders just the Add-new button, kept as
// its own tiny mount so the live <autosearch> user-filter widget (native,
// untouched) can sit between it and the static translated title in the
// same original row. 'filters' renders the From/To date, Payment Mode,
// and Status selects (all auto-refetching on change, matching the
// original's ng-change="getList()" on every field here).
export const GeneralExpensesFilterScreen: React.FC<GeneralExpensesFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'addbutton') {
    return (
      <button type="button" className="btn-add" onClick={() => dispatch('addNew')}>
        <i className="fa fa-plus" aria-hidden="true"></i>
      </button>
    );
  }

  return (
    <>
      <div className="row">
        <div className="drhms-list-filters">
          <div className="col-sm-3">
            <label className="col-sm-12">From Date</label>
            <div className="col-sm-12">
              <input
                type="date"
                className="form-control"
                value={currentfilter.FromDate ? currentfilter.FromDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">To Date</label>
            <div className="col-sm-12">
              <input
                type="date"
                className="form-control"
                value={currentfilter.ToDate ? currentfilter.ToDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">Payment Mode</label>
            <div className="col-sm-12">
              <select
                className="form-control"
                value={currentfilter.PaymentTypeId ?? ''}
                onChange={(e) => dispatch('paymentTypeChange', { value: Number(e.target.value) })}
              >
                {(lookup.PaymentType || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">Status</label>
            <div className="col-sm-12">
              <select
                className="form-control"
                value={currentfilter.GeneralExpenseStatusId ?? ''}
                onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
              >
                {(lookup.GeneralExpenseStatus || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
