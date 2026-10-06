import React from 'react';

interface CancelRemarksScreenProps {
  reactProps?: {
    item?: { CancelReason?: string };
    currentcontext?: { ismodal?: boolean };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): this is a small $uibModalInstance
// dialog (CancelRemarksController) opened from other Billing screens to
// collect a free-text cancel reason. No API calls, no lookups (the
// commented-out lookupCallback/initLookup in the original controller are
// dead code, left untouched), no native-only widgets, no
// utl.Validator.validate call -- qualifies for a single mount covering the
// modal header (shown only when opened as a modal, via currentcontext.ismodal)
// and the textarea + OK button form below it. The saveItem() guard
// (does nothing if CancelReason is falsy) is reproduced verbatim.
export const CancelRemarksScreen: React.FC<CancelRemarksScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const isModal = reactProps?.currentcontext?.ismodal ?? false;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      {isModal && (
        <div className="modal-header custom-modal-header">
          <div className="col-sm-10">
            <h4 className="modal-title custom-modal-title">Cancel Reason</h4>
          </div>
          <div className="col-sm-2">
            <div className="filters">
              <img src="../../../../../assets/svg/close.svg" alt="" onClick={() => dispatch('close')} />
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-sm-12">
          <form id="item_form" name="item_form" className="form-horizontal" role="form">
            <div className="panel-body form-panel outer_border">
              <div className="panel panel-default">
                <div className="table-responsive hm_dashboard top_logo">
                  <div id="dash-board">
                    <label className="col-sm-5 control-label">
                      <span style={{ paddingRight: 10 }}>Cancel Reason</span>:
                    </label>
                    <div className="col-sm-5">
                      <textarea
                        rows={3}
                        name="remark"
                        maxLength={4000}
                        style={{ width: '100%' }}
                        className="notes-textarea"
                        required
                        value={item.CancelReason ?? ''}
                        onChange={(e) => dispatch('cancelReasonChange', { value: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="pull-right">
                <button type="button" className="draftbutton" onClick={() => dispatch('save')}>
                  OK
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
