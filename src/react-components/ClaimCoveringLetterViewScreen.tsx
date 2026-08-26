import React from 'react';

interface DetailItem {
  Id?: number;
  Title?: string;
  ChecklistValue?: string;
  Status?: number;
  ClaimCoveringletter?: { Id?: number };
}

interface ClaimCoveringLetterViewScreenProps {
  reactProps?: {
    currentcontext?: { FirstName?: string; PatientMRN?: string };
    Details?: DetailItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): $uibModalInstance dialog
// (ClaimcoveringletterViewController) -- near-twin of
// ClaimCoveringLetterScreen.tsx (claimcoveringletter.html), but with
// Back and Print buttons LIVE here (they are hidden/commented-out in
// the sibling modal). Confirmed pre-existing dead element, NOT
// reproduced: <custom-table config="vm.gridConfig"> -- vm.gridConfig is
// never defined in this controller either, always rendered empty.
//
// Confirmed pre-existing crash bug in saveItem() -> getLinesForSave(),
// reproduced as-is (not fixed, since that function is untouched by
// this migration): for a newly-added blank row (Id: 0, no
// ClaimCoveringletter property), the loop's second `if` check --
// `if (item.ClaimCoveringletter.Id > 0)` -- runs unconditionally (not
// an else-if) and throws "Cannot read properties of undefined" because
// item.ClaimCoveringletter is undefined on a new row. Clicking Save
// after adding a new line (via the shared modal-shell "+" button, see
// below) already crashes today; this migration does not change that.
//
// Not touched by this migration at all: the controller's
// `$scope.$parent.addNew = ...` line (wiring the shared utl.Modal
// chrome "+" button outside this template).
export const ClaimCoveringLetterViewScreen: React.FC<ClaimCoveringLetterViewScreenProps> = ({ reactProps, onAction }) => {
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
          <button type="button" className="pull-left btn btn-sm pyr-color10" onClick={() => dispatch('backToList')}>
            <i className="fa fa-angle-left"></i>&nbsp;&nbsp;
            <span>Back</span>
          </button>
          <div className="pull-right">
            <button id="btnSaveForm" type="button" className="draftbutton" onClick={() => dispatch('save')}>Save</button>
            <button type="button" className="draftbutton" onClick={() => dispatch('print')}>Print</button>
          </div>
        </div>
      </div>
    </>
  );
};
