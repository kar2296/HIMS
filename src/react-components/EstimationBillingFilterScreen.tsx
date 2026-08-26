import React from 'react';

interface EstimationBillingFilterScreenProps {
  part: 'header' | 'filters';
  reactProps?: {
    currentfilter?: {
      FromDate?: string;
      ToDate?: string;
      SaveTypeId?: number;
    };
    lookup?: {
      SaveType?: Array<{ Id: number; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID estimationbillingList.html split.
// 'header' renders the title + Add (btn-add) button. 'filters' renders the
// From/To Date pickers and the Status ui-select (reimplemented as a plain
// select, matching the established pattern for ui-select filter dropdowns
// elsewhere in this migration). The results grid itself is a <custom-table>
// binding to a real vm.gridConfig, so it is reimplemented in React too (see
// EstimationBillingListScreen) rather than kept native.
export const EstimationBillingFilterScreen: React.FC<EstimationBillingFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div className="row">
        <div className="col-sm-9">
          <h4 className="mt0">Estimation Billing</h4>
        </div>
        <div className="col-sm-3">
          <div className="filters">
            <button type="button" tabIndex={-1} className="btn-add" onClick={() => dispatch('addNew')}>
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="drhms-list-filters">
        <div className="col-sm-4">
          <label className="col-sm-3">From Date</label>
          <div className="col-sm-9">
            <div className="datepicker">
              <input
                type="date"
                className="form-control"
                value={currentfilter.FromDate ? currentfilter.FromDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
              />
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-3">To Date</label>
          <div className="col-sm-9">
            <div className="datepicker">
              <input
                type="date"
                className="form-control"
                value={currentfilter.ToDate ? currentfilter.ToDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
              />
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-3">Status</label>
          <div className="col-sm-9">
            <select
              className="filter-combo form-control"
              value={currentfilter.SaveTypeId ?? ''}
              onChange={(e) => dispatch('saveTypeChange', { value: Number(e.target.value) })}
            >
              {(lookup.SaveType || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
