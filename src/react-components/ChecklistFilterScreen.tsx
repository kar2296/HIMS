import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface ChecklistFilterScreenProps {
  part: 'title' | 'filters';
  reactProps?: {
    currentfilter?: {
      PatientMRN?: string;
      VisitTypeId?: number;
      PaymentDate?: string;
      BillNo?: string;
      GuarantorId?: number;
      billdate?: string;
      ChecklistStatusId?: number;
    };
    lookup?: { EncounterType?: LookupItem[]; Guarantor?: LookupItem[]; ChecklistStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID checklist.html split.
// 'title' renders the page title + the Advanced-Filter ("+") button;
// clicking it dispatches straight through to the real, unmodified
// $scope.openAdvancedFilter(), which still opens the native AngularJS
// schema-driven dynamic-form popover (utl.Modal.openDynamicForm) exactly
// as before -- that generic popover renderer is shared infrastructure
// used across many screens and is not reimplemented here (same
// treatment as the other generic-framework-widget cases in this
// migration). 'filters' renders the main filter row.
//
// Confirmed pre-existing dead-input quirks, reproduced exactly (not
// "fixed"): the "Receipt Date" field binds currentfilter.PaymentDate,
// but getList() never reads PaymentDate anywhere -- it reads
// currentfilter.BillDate instead, which no UI element ever sets, so
// this field silently has no effect on the fetched results. Likewise
// the "From Date" field binds currentfilter.billdate (lowercase b),
// but getList() reads currentfilter.AdmissionDate instead, which is
// also never bound to any UI element -- this field is equally a no-op.
// Both are reproduced as-is: the inputs are fully interactive but do
// not affect what is fetched, matching the original behavior exactly.
export const ChecklistFilterScreen: React.FC<ChecklistFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'title') {
    return (
      <div className="row">
        <h4 className="col-sm-11">Claim Checklist</h4>
        <div className="col-sm-1">
          <button
            type="button"
            tabIndex={-1}
            className="draftbutton"
            title="Advance Search"
            onClick={() => dispatch('openAdvancedFilter')}
          >
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Patient</label>
        <div className="col-sm-12">
          <input
            type="text"
            className="form-control"
            value={currentfilter.PatientMRN ?? ''}
            placeholder="NAME/MRN"
            onChange={(e) => dispatch('patientMrnChange', { value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
          />
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Visit Type</label>
        <div className="col-sm-12">
          <select
            className="filter-combo form-control"
            value={currentfilter.VisitTypeId ?? ''}
            onChange={(e) => dispatch('visitTypeChange', { value: Number(e.target.value) })}
          >
            {(lookup.EncounterType || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
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
        <label className="col-sm-12 control-lable">Bill #.</label>
        <div className="col-sm-12">
          <input
            type="text"
            className="form-control"
            value={currentfilter.BillNo ?? ''}
            placeholder="BILLNO"
            onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
          />
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Payer</label>
        <div className="col-sm-12">
          <select
            className="filter-combo form-control"
            value={currentfilter.GuarantorId ?? ''}
            onChange={(e) => dispatch('guarantorChange', { value: Number(e.target.value) })}
          >
            {(lookup.Guarantor || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">From Date</label>
        <div className="col-sm-12">
          <input
            type="date"
            className="form-control"
            value={currentfilter.billdate ? currentfilter.billdate.slice(0, 10) : ''}
            onChange={(e) => dispatch('billdateChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12 control-lable">Status</label>
        <div className="col-sm-12">
          <select
            className="filter-combo form-control"
            value={currentfilter.ChecklistStatusId ?? ''}
            onChange={(e) => dispatch('checklistStatusChange', { value: Number(e.target.value) })}
          >
            {(lookup.ChecklistStatus || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
