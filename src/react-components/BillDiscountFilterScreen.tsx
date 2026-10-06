import React from 'react';

interface BillDiscountFilterScreenProps {
  part: 'dates' | 'actions';
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID opbilldiscount.html /
// pharmacybilldiscount.html split (shared component -- both screens use
// identical filter markup/behavior). 'dates' renders the From/To Bill
// Date inputs (no ng-change in the original -- these do NOT auto-refetch,
// reproduced as-is: only the Fetch button below triggers getList()).
// 'actions' renders the Bill Number input + Fetch button, sandwiching
// the native <patientsearch> widget which sits between 'dates' and
// 'actions' in the original row (kept untouched native markup in the
// .html file since it is a shared native business-search directive).
//
// Confirmed pre-existing quirk, reproduced as-is (not "fixed"): the
// visible "Bill Number" input binds to currentfilter.BillNo, but
// getList() reads currentfilter.PatBillNum (Key 49) -- a different,
// never-populated property. Typing in Bill Number has no effect on the
// fetched results in the original, and this remains true here.
// Similarly <patientsearch> binds currentfilter.PatientId, which
// getList() never reads either -- selecting a patient also has no
// effect on the fetched results.
export const BillDiscountFilterScreen: React.FC<BillDiscountFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'dates') {
    return (
      <>
        <div className="col-sm-4">
          <label className="col-sm-4">From Date</label>
          <div className="col-sm-8">
            <input
              type="date"
              className="form-control"
              value={currentfilter.FromBillDate ? currentfilter.FromBillDate.slice(0, 10) : ''}
              onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-4">To Date</label>
          <div className="col-sm-8">
            <input
              type="date"
              className="form-control"
              value={currentfilter.ToBillDate ? currentfilter.ToBillDate.slice(0, 10) : ''}
              onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="col-sm-4">
        <label className="col-sm-4">Bill Number</label>
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control"
            value={currentfilter.BillNo ?? ''}
            onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="col-sm-4">
        <button className="draftbutton" onClick={() => dispatch('fetch')}>
          <i className="fas fa-search" aria-hidden="true"></i>&nbsp;&nbsp;
          <span>Fetch</span>
        </button>
      </div>
    </>
  );
};
