import React from 'react';

interface DetailItem {
  Id?: number;
  Title?: string;
  ChecklistValue?: string;
  Status?: number;
}

interface ClaimCoveringLetterScreenProps {
  reactProps?: {
    currentcontext?: { FirstName?: string; PatientMRN?: string };
    Details?: DetailItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): $uibModalInstance dialog
// (ClaimcoveringletterController) for editing a guarantor's claim
// covering-letter checklist lines. Confirmed pre-existing dead
// elements, NOT reproduced (there is nothing to render):
//   - <custom-table config="vm.gridConfig"> in the original template --
//     vm.gridConfig is never defined anywhere in the controller, so
//     this grid has always rendered empty/undefined in production.
//   - The Print button (ng-show="canShowPrintBtn") -- canShowPrintBtn
//     is never set anywhere either, so ng-show is always falsy and the
//     button has never been visible. The controller's opcoverprint()/
//     tpacoverprint() functions are also unused dead code (no button
//     anywhere calls them).
// The commented-out Back/Save&Approve/Clear/Cancel buttons in the
// original markup are also not reproduced (dead markup, never active).
//
// Not touched by this migration at all: the controller's
// `$scope.$parent.addNew = $scope.addNewLineItem` line, which wires a
// "+" button rendered by the shared utl.Modal chrome OUTSIDE this
// template -- that shared modal-shell infrastructure is used by many
// other modals across the app and is out of scope here; it continues
// to work exactly as before regardless of this React mount.
export const ClaimCoveringLetterScreen: React.FC<ClaimCoveringLetterScreenProps> = ({ reactProps, onAction }) => {
  const currentcontext = reactProps?.currentcontext || {};
  const details = (reactProps?.Details || []).filter((d) => d.Status === 1);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="modal-header custom-modal-header">
        <h4 className="col-sm-6">Claim Covering Letter</h4>
        <div className="col-sm-6">
          <div className="filters">
            <img src="../../../../../assets/svg/close.svg" onClick={() => dispatch('close')} alt="" />
          </div>
        </div>
      </div>

      <div className="col-sm-12">
        <div className="head-details">
          <p>Name:{currentcontext.FirstName}</p>
          <p>Patient ID:{currentcontext.PatientMRN}</p>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="data-table-list">
            <table className="table">
              <thead className="table-subhead">
                <tr>
                  <th className="col-sm-2"><span>Title</span></th>
                  <th className="col-sm-2"><span>SubTitle</span></th>
                  <th className="col-sm-1"><span>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {details.map((item, idx) => (
                  <tr key={item.Id ?? idx}>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.Title ?? ''}
                        onChange={(e) => dispatch('titleChange', { index: idx, value: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.ChecklistValue ?? ''}
                        onChange={(e) => dispatch('checklistValueChange', { index: idx, value: e.target.value })}
                      />
                    </td>
                    <td align="center">
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => dispatch('deleteDetail', { index: idx })}>
                        <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="fooder-bgs">
        <div className="col-sm-12">
          <div className="pull-right">
            <button id="btnSaveForm" type="button" className="draftbutton" onClick={() => dispatch('save')}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
};
