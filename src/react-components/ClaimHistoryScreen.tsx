import React from 'react';

interface ClaimHistoryScreenProps {
  reactProps?: {
    item?: {
      CreatedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
      CreatedAt?: string;
      SubmittedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
      SubmittedOn?: string;
      DispatchedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
      DispatchedOn?: string;
    };
  };
}

function formatDateTime(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

// React bridge migration (single mount): read-only $uibModalInstance
// dialog (claimhistoryController) opened from other claimmanagement
// screens to show a claim's Created/Submitted/Dispatched by/on history.
// All fields come directly from modalConfig.params.history. No API
// calls, no native widgets, no utl.Validator.validate call. The
// original's own angular.extend(this, utl.Ctrl.getBaseCtrl(...)) mixin
// (adding saveAndApprove/save/canUpdatePatientInfo) is confirmed unused
// by this read-only template -- not reproduced. There is also no close
// (X) button in the original modal-header -- $scope.cancelCallback is
// defined but never wired to any element, so the modal is presumably
// dismissed only via the uib-modal default backdrop-click/ESC behavior,
// reproduced as-is (no close button added here either).
export const ClaimHistoryScreen: React.FC<ClaimHistoryScreenProps> = ({ reactProps }) => {
  const item = reactProps?.item || {};

  return (
    <>
      <div className="modal-header custom-modal-header">
        <h4 className=" mt0 ">Claim History</h4>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <form id="item_form" name="item_form" className="form-horizontal" role="form">
            <div className="panel panel-default">
              <div className="panel-body form-panel" style={{ height: 225 }}>
                <div className="col-sm-12">
                  <div className="well">
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Created By</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">
                        <span>{item.CreatedUser?.Title?.Description}&nbsp;</span>
                        <span>{item.CreatedUser?.FirstName}&nbsp;</span>
                        <span>{item.CreatedUser?.LastName}&nbsp;</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Created On</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">{formatDateTime(item.CreatedAt)}</div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Submitted By</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">
                        <span>{item.SubmittedUser?.Title?.Description}&nbsp;</span>
                        <span>{item.SubmittedUser?.FirstName}&nbsp;</span>
                        <span>{item.SubmittedUser?.LastName}&nbsp;</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Submitted On</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">{formatDateTime(item.SubmittedOn)}</div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Dispatched By</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">
                        <span>{item.DispatchedUser?.Title?.Description}&nbsp;</span>
                        <span>{item.DispatchedUser?.FirstName}&nbsp;</span>
                        <span>{item.DispatchedUser?.LastName}&nbsp;</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Dispatched On</label>
                      <div className="col-sm-1"> : </div>
                      <div className="col-sm-7">{formatDateTime(item.DispatchedOn)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
