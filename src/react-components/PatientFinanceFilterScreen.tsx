import React from 'react';

interface PatientFinanceFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromDate?: string;
      ToDate?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, shared between patientadjustmentinfo.html and
// patientrevenueinfo.html (identical From/To Date filter markup and
// behavior in both originals: ng-change="getList()" on each -- both
// auto-refetch, using whatever currentfilter.PatientId currently is,
// even 0/unselected). Mounted as a sibling AFTER the native
// <patientsearch> widget, which stays untouched native markup in both
// screens (genuinely feeds patientChange() -> the encounter/bill fetch
// chain).
export const PatientFinanceFilterScreen: React.FC<PatientFinanceFilterScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="col-sm-4">
        <label className="col-sm-4">From Date</label>
        <div className="col-sm-8">
          <input
            type="date"
            className="form-control"
            value={currentfilter.FromDate ? currentfilter.FromDate.slice(0, 10) : ''}
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
            value={currentfilter.ToDate ? currentfilter.ToDate.slice(0, 10) : ''}
            onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
          />
        </div>
      </div>
    </>
  );
};
