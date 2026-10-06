import React from 'react';

interface ClaimSubmissionFormScreenProps {
  part: 'header' | 'infocol1' | 'infocol2' | 'infocol3' | 'loadbutton' | 'footer';
  reactProps?: {
    currentcontext?: { id?: number };
    item?: {
      ClaimNumber?: string;
      CreatedAt?: string;
      FromBillDate?: string;
      ToBillDate?: string;
      SubmittedOn?: string;
      DispatchedOn?: string;
      ClaimSubmissionStatus?: { Description?: string };
      SubmittedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
      DispatchedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
      TrackingNumber?: string;
      Comments?: string;
    };
    ShowCreate?: boolean;
    ShowSubmission?: boolean;
    ShowDispatch?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDT(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

// React bridge migration, claimsubmission-form.html split into several
// parts, sandwiching the native <patientsearch> (header, only when
// currentcontext.id==0) and <autosearch> (infocol1's Payer row, always)
// widgets -- both kept native/untouched, same business-search
// directives used throughout this migration. See
// ClaimSubmissionFormBillsScreen.tsx for the Load-Bills table (the
// highest-risk part of this screen: checkbox selection driving the
// batch's claim amount and bill list).
export const ClaimSubmissionFormScreen: React.FC<ClaimSubmissionFormScreenProps> = ({ part, reactProps, onAction }) => {
  const currentcontext = reactProps?.currentcontext || {};
  const item = reactProps?.item || {};
  const isExisting = (currentcontext.id ?? 0) > 0;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div className="row">
        <div className="drhms-filters">
          <div className="col-sm-10">
            <h4>Claim Submission</h4>
          </div>
          {isExisting ? (
            <>
              <div className="col-sm-4">
                <div>
                  <span>Batch No.: {item.ClaimNumber}</span>
                </div>
              </div>
              <div className="col-sm-3">
                <div>
                  <span>{formatDT(item.CreatedAt)}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-sm-3">
                <input
                  type="date"
                  className="form-control"
                  value={item.FromBillDate ? item.FromBillDate.slice(0, 10) : ''}
                  onChange={(e) => dispatch('fromBillDateChange', { value: e.target.value })}
                />
              </div>
              <div className="col-sm-3">
                <input
                  type="date"
                  className="form-control"
                  value={item.ToBillDate ? item.ToBillDate.slice(0, 10) : ''}
                  onChange={(e) => dispatch('toBillDateChange', { value: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (part === 'infocol1') {
    return (
      <>
        <div className="col-sm-12">
          <label className="col-sm-4">Batch #</label>
          <div className="col-sm-8">:
            <span className="head-title">{item.ClaimNumber}</span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Submited Date</label>
          <div className="col-sm-8">:
            <span>{formatDT(item.SubmittedOn)}</span>
          </div>
        </div>
      </>
    );
  }

  if (part === 'infocol2') {
    return (
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">Submitted By</label>
          <div className="col-sm-8">:
            <span className="head-title">{item.SubmittedUser?.Title?.Description}&nbsp;{item.SubmittedUser?.FirstName}&nbsp;{item.SubmittedUser?.LastName}</span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Dispatched Date</label>
          <div className="col-sm-8">:
            <span>{formatDT(item.DispatchedOn)}</span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Status</label>
          <div className="col-sm-8">:
            {item.ClaimSubmissionStatus?.Description}
          </div>
        </div>
      </div>
    );
  }

  if (part === 'infocol3') {
    return (
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">Track #</label>
          <div className="col-sm-8">:
            {item.TrackingNumber}
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Track Comments</label>
          <div className="col-sm-8">:
            {item.Comments}
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Track Dispatched By</label>
          <div className="col-sm-8">:
            {item.DispatchedUser?.Title?.Description}&nbsp;{item.DispatchedUser?.FirstName}&nbsp;{item.DispatchedUser?.LastName}
          </div>
        </div>
      </div>
    );
  }

  if (part === 'loadbutton') {
    if (isExisting) return null;
    return (
      <div className="row">
        <div className="pull-right">
          <button type="button" className="draftbutton" onClick={() => dispatch('selectGridList')}>Load</button>
        </div>
      </div>
    );
  }

  // part === 'footer'
  return (
    <div className="fooder-bgs">
      <div className="row">
        <div className="pull-left">
          <button type="button" className="btn pyr-color10 btn-sm" onClick={() => dispatch('backToList')}>
            <i className="fa fa-angle-left" aria-hidden="true"></i>
            <span className="btn-fontsize"> &nbsp; Back</span>
          </button>
          {isExisting && (
            <button className="draftbutton" title="History" onClick={() => dispatch('historyLink')}>
              <i className="fa fa-history fa-xs" aria-hidden="true"></i>
            </button>
          )}
        </div>
        <div className="pull-right">
          {isExisting && (
            <button type="button" className="draftbutton" onClick={() => dispatch('printclaim')}>
              <i className="fa fa-print"></i> Preview Print
            </button>
          )}
          {reactProps?.ShowCreate && (
            <button type="button" className="draftbutton" onClick={() => dispatch('saveAlert', { status: 2 })}>Create Batch</button>
          )}
          {reactProps?.ShowSubmission && (
            <button type="button" className="draftbutton" onClick={() => dispatch('saveAlert', { status: 3 })}>Submission</button>
          )}
          {reactProps?.ShowDispatch && (
            <button type="button" className="draftbutton" onClick={() => dispatch('dispatchClaim')}>Dispatch</button>
          )}
        </div>
      </div>
    </div>
  );
};
