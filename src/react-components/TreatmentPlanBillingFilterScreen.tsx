import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface TreatmentPlanBillingFilterScreenProps {
  part: 'dates' | 'actions';
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      PlanStatusId?: number;
    };
    lookup?: { PlanStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID treatmentplanbilling.html
// split (structurally similar to physiotreatmentplan.html, but with its
// own column widths -- col-sm-2 dates vs physio's col-sm-3 -- kept
// exact per screen rather than force-sharing one component). 'dates'
// renders From/To Bill Date (no ng-change -- no auto-refetch, only the
// Fetch button calls getList()), BEFORE the native <patientsearch> in
// the same row (kept untouched -- no patientchange callback attribute
// here either). 'actions' renders the Status select + Fetch button,
// AFTER the native <patientsearch>.
export const TreatmentPlanBillingFilterScreen: React.FC<TreatmentPlanBillingFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'dates') {
    return (
      <>
        <div className="form-group col-sm-2">
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
        <div className="form-group col-sm-2">
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
      </>
    );
  }

  return (
    <>
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Status</label>
        <div className="col-sm-12">
          <select
            className="form-control"
            value={currentfilter.PlanStatusId ?? ''}
            onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
          >
            {(lookup.PlanStatus || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-2">
        <button className="draftbutton" onClick={() => dispatch('fetch')}>
          <span>Fetch</span>
        </button>
      </div>
    </>
  );
};
