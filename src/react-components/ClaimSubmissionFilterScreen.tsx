import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface ClaimSubmissionFilterScreenProps {
  part: 'search' | 'filters';
  reactProps?: {
    currentfilter?: {
      BatchNo?: string;
      FromDate?: string;
      ToDate?: string;
      FacilityId?: number;
      BillNo?: string;
    };
    lookup?: { Facility?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID claimsubmission-list.html
// split. 'search' renders the Batch No. header search input (Enter-key
// only, no auto-refetch) plus the Add ("+") button. 'filters' renders
// From/To Date, Facility (permanently disabled in the original --
// ui-select ... ng-disabled="true"), and Bill #.; the native
// <autosearch> Guarantor widget and <multiselectchk> Status widget sit
// after this in the HTML and stay untouched (same widgets kept native
// throughout this migration).
//
// Confirmed pre-existing dead-input quirk, reproduced exactly (not
// "fixed"): the "Bill #." field binds currentfilter.BillNo, but
// getList() never reads BillNo anywhere in its Params -- this input is
// fully interactive but has zero effect on the fetched results.
export const ClaimSubmissionFilterScreen: React.FC<ClaimSubmissionFilterScreenProps> = ({ part, reactProps, onAction }) => {
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
              value={currentfilter.BatchNo ?? ''}
              placeholder="Batch No."
              onChange={(e) => dispatch('batchNoChange', { value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
            />
            <div className="drhms-search-icon"><i className="fas fa-search" aria-hidden="true"></i></div>
          </div>
          &nbsp;&nbsp;
          <button type="button" tabIndex={-1} className="btn-add" title="Claim Submission" onClick={() => dispatch('addNew')}>
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
        <label className="col-sm-12 control-lable">Facility</label>
        <div className="col-sm-12">
          <select className="filter-combo form-control" value={currentfilter.FacilityId ?? ''} disabled>
            {(lookup.Facility || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-2">
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
    </>
  );
};
