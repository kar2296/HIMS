import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface IpBillingRequestFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
      BillingRequestTypeId?: number;
      BillingRequestStatusId?: number;
    };
    lookup?: {
      BillingRequestType?: LookupItem[];
      BillingRequestStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  // 'dates' renders FromBillDate+ToBillDate (they sit before the native
  // <patientsearch> widget in the original markup); 'actions' renders
  // BillNo + RequestType + Status + the Fetch button (they sit after it).
  // Split into two mounts so the live native <patientsearch> field --
  // present in the markup, though currentfilter.PatientId/selectedPatient
  // are never read by getPaymentDetailList()'s Params, so it has no actual
  // effect on the fetched list; still a live rendered native-only widget,
  // so per the HYBRID rule it stays untouched between these two mounts.
  part: 'dates' | 'actions';
}

function toDateTimeInputValue(v?: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// React bridge migration (hybrid, partial): the top filter row contains one
// genuinely live native widget -- <patientsearch> bound to
// currentfilter.PatientId / selectedPatient -- so per this migration's HYBRID
// rule that field stays untouched, native markup. Everything else in the
// row is migrated via two React mounts sandwiching it (part="dates" before,
// part="actions" after), preserving the original left-to-right field order.
export const IpBillingRequestFilterScreen: React.FC<IpBillingRequestFilterScreenProps> = ({ reactProps, onAction, part }) => {
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

  return (
    <>
      <div className="form-group col-sm-3">
        <label className="col-sm-12">Bill Number</label>
        <div className="col-sm-12">
          <input
            type="text"
            tabIndex={-1}
            className="form-control"
            placeholder=""
            value={currentfilter.BillNo ?? ''}
            onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
          />
        </div>
      </div>
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
    </>
  );
};
