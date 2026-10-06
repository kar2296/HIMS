import React from 'react';

interface RefundListFilterScreenProps {
  part: 'header' | 'filters' | 'total';
  reactProps?: {
    currentfilter?: {
      RefundTypeId?: number;
      namemrn?: string;
      RefundDateTime?: string;
      RefundStatusId?: number;
      Refundidentifier?: string;
    };
    lookup?: {
      RefundType?: Array<{ Id: number; Text: string }>;
      RefundStatus?: Array<{ Id: number; Text: string }>;
    };
    totalAmount?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID refund-list.html split. The
// results grid is a real <div ui-grid="vm.gridConfig"> with actionable
// cellTemplates (view/edit/delete wired to grid.appScope.handleEvents) and
// stays native per the shared-widget rule, along with the native
// <ul uib-pagination> below it. This covers the three custom (non-grid)
// regions: 'header' (title + Add button), 'filters' (Refund Type / Name-MRN
// search / Date / Refund Status / Refund# search -- ui-select dropdowns
// reimplemented as plain selects per the established pattern), and 'total'
// (the read-only Total amount footer input, bound to $scope.TotalAmount,
// which is computed by summing RefundAmount across the current page's rows
// in getListCallback -- reproduced as a display-only value, not recomputed
// client-side, matching the original's per-page-only total).
export const RefundListFilterScreen: React.FC<RefundListFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div className="row page-header">
        <h4 className="col-sm-6 mt0">Refunds</h4>
        <div className="col-sm-6">
          <button className="btn bt-color2 btn-xs pull-right btn-filter" onClick={() => dispatch('addNew')} title="Refunds">
            <i className="fa fa-plus" aria-hidden="true"></i>
            <span>Add New</span>
          </button>
        </div>
      </div>
    );
  }

  if (part === 'filters') {
    return (
      <div className="row filter-area">
        <div className="col-sm-12">
          <div className="col-sm-4">
            <label className="col-sm-5 control-label filter-lbl">Type</label>
            <div className="col-sm-7">
              <select className="filter-combo form-control" value={currentfilter.RefundTypeId ?? ''} onChange={(e) => dispatch('refundTypeChange', { value: Number(e.target.value) })}>
                {(lookup.RefundType || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group">
              <label className="sr-only col-sm-5 control-label filter-lbl">Name/MRN</label>
              <div className="input-group col-sm-7">
                <div className="input-group-addon"><i className="fas fa-search" aria-hidden="true"></i></div>
                <input type="text" className="form-control" placeholder=" Name/MRN"
                  value={currentfilter.namemrn ?? ''}
                  onChange={(e) => dispatch('namemrnChange', { value: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }} />
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <label className="col-sm-5 control-label">Date</label>
            <div className="col-sm-7">
              <input type="date" className="form-control"
                value={currentfilter.RefundDateTime ? String(currentfilter.RefundDateTime).slice(0, 10) : ''}
                onChange={(e) => dispatch('refundDateChange', { value: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="col-sm-12">
          <div className="col-sm-4">
            <label className="col-sm-5 control-label filter-lbl">Status</label>
            <div className="col-sm-7">
              <select className="filter-combo form-control" value={currentfilter.RefundStatusId ?? ''} onChange={(e) => dispatch('refundStatusChange', { value: Number(e.target.value) })}>
                {(lookup.RefundStatus || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-sm-4">
            <label className="col-sm-5 control-label filter-lbl">Refund #</label>
            <div className="input-group col-sm-7">
              <div className="input-group-addon"><i className="fas fa-search" aria-hidden="true"></i></div>
              <input type="text" className="form-control" placeholder="Refund #"
                value={currentfilter.Refundidentifier ?? ''}
                onChange={(e) => dispatch('refundIdentifierChange', { value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // part === 'total'
  const totalAmount = reactProps?.totalAmount ?? 0;
  return (
    <div className="col-sm-12 footerbar bill_subfooter">
      <div className="col-sm-12 well">
        <div className="col-sm-5"></div>
        <div className="col-sm-3">
          <div className="col-sm-6 text-right">
            <label className="control-label">Total :</label>
          </div>
          <div className="col-sm-6">
            <input type="text" className="form-control" value={totalAmount} disabled readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};
