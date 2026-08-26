import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface UnlockBillingFilterScreenProps {
  part: 'dates' | 'actions';
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      VisitIdentifier?: string;
      BillingRequestTypeId?: number;
      BillUnlockRequestStatusId?: number;
    };
    lookup?: {
      BillingRequestType?: LookupItem[];
      BillUnlockRequestStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function toInputValue(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// React bridge migration (hybrid, part of a 2-part filter split -- see
// UnlockBillingListScreen.tsx / unlockbillingrequestlist.js for the
// disclosure comment covering the live <patientsearch> widget this
// component's mounts sandwich). 'dates' renders the From/To bill-date
// pickers (each auto-refetches on change, matching the original's
// ng-change="getbillUnlockList()"). 'actions' renders the IP Number
// input, the Request Type select (always ng-disabled="true" in the
// original -- reproduced here as a disabled, display-only select,
// never user-editable), the Status select, and the Fetch button. None
// of the 'actions' part fields auto-refetch -- the original has no
// ng-change on them, only the Fetch button and the two date fields
// trigger getbillUnlockList().
export const UnlockBillingFilterScreen: React.FC<UnlockBillingFilterScreenProps> = ({ part, reactProps, onAction }) => {
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
              type="datetime-local"
              className="form-control"
              value={toInputValue(currentfilter.FromBillDate)}
              onChange={(e) => dispatch('fromBillDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-3">
          <label className="col-sm-12">To Date</label>
          <div className="col-sm-12">
            <input
              type="datetime-local"
              className="form-control"
              value={toInputValue(currentfilter.ToBillDate)}
              onChange={(e) => dispatch('toBillDateChange', { value: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="form-group col-sm-3">
        <label className="col-sm-12">IP Number</label>
        <div className="col-sm-12">
          <input
            type="text"
            className="form-control"
            value={currentfilter.VisitIdentifier ?? ''}
            onChange={(e) => dispatch('visitIdentifierChange', { value: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Request Type</label>
        <div className="col-sm-12">
          <select className="form-control" value={currentfilter.BillingRequestTypeId ?? ''} disabled>
            {(lookup.BillingRequestType || []).map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Status</label>
        <div className="col-sm-12">
          <select
            className="form-control"
            value={currentfilter.BillUnlockRequestStatusId ?? ''}
            onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
          >
            {(lookup.BillUnlockRequestStatus || []).map((opt) => (
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
