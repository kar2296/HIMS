import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CreditApprovalFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
      BillTypeId?: number;
      CreditApprovalStatusId?: number;
    };
    lookup?: { BillType?: LookupItem[]; CreditApprovalStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, filter row for creditapprovalrequestlist.html
// (single mount -- the original's <patientsearch> is already commented
// out/dead, so there is no live native widget to sandwich here).
export const CreditApprovalFilterScreen: React.FC<CreditApprovalFilterScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const statusOptions = (lookup.CreditApprovalStatus && lookup.CreditApprovalStatus.length > 0)
    ? lookup.CreditApprovalStatus
    : [
        { Id: 1, Text: 'Pending' },
        { Id: 2, Text: 'Approved' },
        { Id: 3, Text: 'Rejected' },
      ];

  const billTypeOptions = (lookup.BillType && lookup.BillType.length > 0)
    ? lookup.BillType
    : [
        { Id: 1, Text: 'OP' },
        { Id: 2, Text: 'IP' },
        { Id: 4, Text: 'PHARMACY' },
        { Id: 5, Text: 'DG' },
      ];

  return (
    <div className="row" style={{ marginBottom: '15px' }}>
      <form id="item_form" name="item_form" className="form-horizontal" role="form" onSubmit={(e) => { e.preventDefault(); dispatch('fetch'); }}>
        <div className="col-sm-12" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '6px' }}>Quick Dates:</span>
            <button
              type="button"
              className="btn btn-default btn-xs"
              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}
              onClick={() => dispatch('presetDates', { preset: 'today' })}
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-default btn-xs"
              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}
              onClick={() => dispatch('presetDates', { preset: 'yesterday' })}
            >
              Yesterday
            </button>
            <button
              type="button"
              className="btn btn-default btn-xs"
              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}
              onClick={() => dispatch('presetDates', { preset: 'last7days' })}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className="btn btn-default btn-xs"
              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}
              onClick={() => dispatch('presetDates', { preset: 'last30days' })}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className="btn btn-default btn-xs"
              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}
              onClick={() => dispatch('presetDates', { preset: 'all' })}
            >
              All Records
            </button>
          </div>
        </div>

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
        <div className="form-group col-sm-2">
          <label className="col-sm-12">Bill Number</label>
          <div className="col-sm-12">
            <input
              type="text"
              className="form-control"
              placeholder="Search Bill No..."
              value={currentfilter.BillNo ?? ''}
              onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  dispatch('fetch');
                }
              }}
            />
          </div>
        </div>
        <div className="form-group col-sm-2">
          <label className="col-sm-12">Bill Type</label>
          <div className="col-sm-12">
            <select
              id="billtype"
              className="form-control"
              value={currentfilter.BillTypeId ?? ''}
              onChange={(e) => dispatch('billTypeChange', { value: Number(e.target.value) })}
            >
              {billTypeOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group col-sm-2">
          <label className="col-sm-12">Status</label>
          <div className="col-sm-12">
            <select
              id="creditapprovalstatus"
              className="form-control"
              value={currentfilter.CreditApprovalStatusId ?? 1}
              onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
            >
              <option value="-1">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-sm-12" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-default"
            style={{ minWidth: '90px' }}
            onClick={() => dispatch('reset')}
          >
            <i className="fa fa-refresh" style={{ marginRight: '5px' }}></i> Reset
          </button>
          <button
            type="submit"
            className="draftbutton"
            style={{ margin: 0, minWidth: '100px' }}
            onClick={() => dispatch('fetch')}
          >
            <span><i className="fa fa-search" style={{ marginRight: '5px' }}></i> Fetch</span>
          </button>
        </div>
      </form>
    </div>
  );
};
