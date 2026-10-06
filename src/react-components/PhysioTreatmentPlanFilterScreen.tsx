import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface PhysioTreatmentPlanFilterScreenProps {
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

// React bridge migration, part of the HYBRID physiotreatmentplan.html
// split. 'dates' renders From/To Bill Date inputs (no ng-change in the
// original -- no auto-refetch, only the Fetch button calls getList()),
// BEFORE the native <patientsearch> in the same row (kept untouched --
// no patientchange callback attribute in the original either, so
// selecting a patient alone does not auto-refetch). 'actions' renders
// the Status select + Fetch button, AFTER the native <patientsearch>.
export const PhysioTreatmentPlanFilterScreen: React.FC<PhysioTreatmentPlanFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'dates') {
    return (
      <>
        <div className="form-group col-sm-3">
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
        <div className="form-group col-sm-3">
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
      <div className="form-group col-sm-3">
        <button className="draftbutton" onClick={() => dispatch('fetch')}>
          <span>Fetch</span>
        </button>
      </div>
    </>
  );
};
