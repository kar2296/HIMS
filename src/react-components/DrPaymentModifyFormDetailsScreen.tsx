import React from 'react';

interface DrPaymentModifyFormDetailsScreenProps {
  reactProps?: {
    item?: { NetAmount?: number | string; DoctorShare?: number | string; Remarks?: string };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Reproduces $scope.numberonly verbatim (drpaymentmodify-form.js): a
// DIFFERENT keyCode allow-list than the standard numberonlyKeyDown helper
// used elsewhere in this migration (Delete/Backspace/Tab/Escape/Enter/
// NumpadDot/Period, plus Ctrl/Cmd+A and arrow keys) -- the same distinct
// variant already confirmed on cashsubmission-form.
function drShareNumberOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const keyCode = e.keyCode;
  if ([46, 8, 9, 27, 13, 110, 190].indexOf(keyCode) !== -1 ||
    (keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    (keyCode >= 35 && keyCode <= 40)) {
    return;
  }
  if (e.shiftKey || keyCode < 48 || keyCode > 57) {
    e.preventDefault();
  }
}

export function DrPaymentModifyFormDetailsScreen({ reactProps, onAction }: DrPaymentModifyFormDetailsScreenProps) {
  const item = reactProps?.item || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="col-sm-4 form-group paddingtop">
        <div className="col-sm-12">
          <label className="col-sm-12 control-label">Amount</label>
          <div className="col-sm-12">
            <input type="text" className="form-control" disabled value={item.NetAmount ?? ''} readOnly />
          </div>
        </div>
      </div>
      <div className="col-sm-4 form-group paddingtop">
        <div className="col-sm-12">
          <label className="col-sm-12 control-label">Dr. Share</label>
          <div className="col-sm-12">
            <input
              type="text"
              className="form-control"
              value={item.DoctorShare ?? ''}
              onKeyDown={drShareNumberOnlyKeyDown}
              onChange={(e) => dispatch('doctorShareChange', { value: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="col-sm-4 form-group paddingtop">
        <div className="col-sm-12">
          <label className="col-sm-12 control-label">Remarks</label>
          <div className="col-sm-12">
            <input
              type="text"
              className="form-control"
              value={item.Remarks || ''}
              onChange={(e) => dispatch('remarksChange', { value: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="fooder-bgs">
        <div className="pull-right">
          <div className="col-sm-12">
            <button id="btnCancelForm" type="button" className="draftbutton" onClick={() => dispatch('save')}>
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
