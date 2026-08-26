import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface ClaimProcessFilterScreenProps {
  part: 'search' | 'filters';
  reactProps?: {
    currentfilter?: {
      BatchNo?: string;
      FacilityId?: number;
      FromDate?: string;
      ToDate?: string;
      GuarantorId?: number;
    };
    lookup?: { Facility?: LookupItem[]; Guarantor?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID claimprocess.html split.
// 'search' renders the Batch No. header search input (no auto-refetch --
// on-enter="getList()" in the original, not ng-change). 'filters'
// renders Facility (permanently disabled in the original -- ui-select
// ... ng-disabled="true"), From/To Date, and Guarantor selects, all
// auto-refetching on change. The Status filter uses <multiselectchk>, a
// generic ng-dropdown-multiselect-based library widget (angular
// component wrapping a 3rd-party multiselect-with-search directive) --
// classified alongside real ui-grid/<dynamicform> as too complex/risky
// to safely reimplement in React, so it stays untouched, native, as the
// last sibling in this row.
export const ClaimProcessFilterScreen: React.FC<ClaimProcessFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'search') {
    return (
      <div className="col-sm-3">
        <div className="filters">
          <div className="search">
            <input
              type="text"
              id="pid"
              className="form-control"
              value={currentfilter.BatchNo ?? ''}
              placeholder="Batch No."
              onChange={(e) => dispatch('batchNoChange', { value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
            />
            <div className="drhms-search-icon"><i className="fas fa-search" aria-hidden="true"></i></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="form-group col-sm-2">
        <label className="col-sm-12 control-lable">Name/UHID</label>
        <div className="col-sm-12">
          {/* permanently disabled in the original (ui-select ... ng-disabled="true") */}
          <select className="filter-combo form-control" value={currentfilter.FacilityId ?? ''} disabled>
            {(lookup.Facility || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-2">
        <label className="col-sm-12 control-lable">From Date</label>
        <div className="col-sm-12">
          <input
            type="date"
            className="form-control"
            value={currentfilter.FromDate ? currentfilter.FromDate.slice(0, 10) : ''}
            onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group col-sm-2">
        <label className="col-sm-12 control-lable">To Date</label>
        <div className="col-sm-12">
          <input
            type="date"
            className="form-control"
            value={currentfilter.ToDate ? currentfilter.ToDate.slice(0, 10) : ''}
            onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group col-sm-2">
        <label className="col-sm-12 control-lable">Payer Name</label>
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
    </>
  );
};
