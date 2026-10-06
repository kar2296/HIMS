import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DetailIpBillingRequestFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillingRequestTypeId?: number;
      BillingRequestStatusId?: number;
    };
    lookup?: {
      BillingRequestType?: LookupItem[];
      BillingRequestStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  // 'dates' (before the native <patientsearch>), 'requesttype' (right
  // after it), 'statusfetch' (the Status select + Fetch button, which sit
  // inside their own nested wrapper div in the original markup, preserved
  // here). See DetailIpBillingRequestListScreen / the HTML disclosure
  // comment for the full hybrid rationale -- <patientsearch> is a live
  // native-only widget here too, same as the sibling ipbillingrequestlist.
  part: 'dates' | 'requesttype' | 'statusfetch';
}

function toDateTimeInputValue(v?: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DetailIpBillingRequestFilterScreen: React.FC<DetailIpBillingRequestFilterScreenProps> = ({ reactProps, onAction, part }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const requestTypeOptions = (lookup.BillingRequestType || []).map((o) => ({ value: o.Id, label: o.Text }));
  const requestStatusOptions = (lookup.BillingRequestStatus || []).map((o) => ({ value: o.Id, label: o.Text }));

  if (part === 'dates') {
    return (
      <>
        <div className="form-group col-sm-3">
          <label className="col-sm-12">From Date</label>
          <div className="col-sm-12">
            <input
              type="datetime-local"
              className="form-control"
              value={toDateTimeInputValue(currentfilter.FromBillDate)}
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
              value={toDateTimeInputValue(currentfilter.ToBillDate)}
              onChange={(e) => dispatch('toBillDateChange', { value: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  if (part === 'requesttype') {
    return (
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Request Type</label>
        <div className="col-sm-12">
          <select
            className="form-control"
            tabIndex={-1}
            value={currentfilter.BillingRequestTypeId ?? ''}
            onChange={(e) => dispatch('requestTypeChange', { value: Number(e.target.value) })}
          >
            {requestTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // part === 'statusfetch'
  return (
    <div className="form-group col-sm-12">
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Status</label>
        <div className="col-sm-12">
          <select
            className="form-control"
            tabIndex={-1}
            value={currentfilter.BillingRequestStatusId ?? ''}
            onChange={(e) => dispatch('requestStatusChange', { value: Number(e.target.value) })}
          >
            {requestStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group col-sm-3">
        <button className="draftbutton" type="button" onClick={() => dispatch('fetch')}>
          Fetch
        </button>
      </div>
    </div>
  );
};
