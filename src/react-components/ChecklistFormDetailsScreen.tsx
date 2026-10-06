import React from 'react';

interface YesNoOption {
  Id: number;
  Text: string;
  ColorCode?: string;
}

interface DetailItem {
  GuarantorChecklist?: { Title?: string; SubTitle?: string };
  ChecklistId?: number;
  ChecklistStatusId?: number;
  SubTitle?: string;
}

interface ChecklistFormDetailsScreenProps {
  reactProps?: {
    Details?: DetailItem[];
    lookup?: { YesNo?: YesNoOption[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: reimplements the <radiogroupcontrol> business
// component (public/vendor/components/radiogroupcontrol.js) used per-row
// in checklist-form.html's document-checklist table. Unlike the
// generic-3rd-party-library widgets kept native elsewhere in this
// migration (ui-grid, <dynamicform>, <multiselectchk>), this is a small,
// fully in-house AngularJS component (~80 total lines including
// template) with simple, fully-understood behavior: a button-group of
// Yes/No choices, highlighting the one matching the row's
// ChecklistStatusId, colored per lookup.YesNo's ColorCode. Reproduced
// exactly: clicking an option updates that row's ChecklistStatusId (via
// dispatch) -- saveItem() (wired from the Approve button in
// ChecklistFormScreen's 'footer' part) reads these values directly off
// $scope.Details, so no separate save wiring is needed here.
export const ChecklistFormDetailsScreen: React.FC<ChecklistFormDetailsScreenProps> = ({ reactProps, onAction }) => {
  const details = reactProps?.Details || [];
  const options = reactProps?.lookup?.YesNo || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <form id="item_form" name="item_form" className="form-horizontal" role="form">
      <table className="table table-responsive">
        <thead>
          <tr>
            <th>DOCUMENTS REQUIRED FOR CLAIMING HOSPITALIZATION EXPENSES</th>
          </tr>
        </thead>
        <tbody>
          {details.map((item, idx) => (
            <tr key={item.ChecklistId ?? idx}>
              <td className="col-sm-12 pd0">
                <div className="col-sm-9">
                  <label className="h4">{item.GuarantorChecklist?.Title}</label>
                  <br />
                  {item.SubTitle && (
                    <span className="h5">({item.GuarantorChecklist?.SubTitle})</span>
                  )}
                </div>
                <div className="col-sm-3 radio_control_btn">
                  <div className="btn-group col-sm-12" role="group" data-toggle="buttons">
                    {options.map((opt) => (
                      <label
                        key={opt.Id}
                        className={`btn btn-sm width btn-custom-radio ${item.ChecklistStatusId === opt.Id ? 'btn-feedback-selected' : 'btn-feedback-notselected'} ${opt.Text}`}
                        onClick={() => dispatch('detailStatusChange', { index: idx, ChecklistId: item.ChecklistId, ChecklistStatusId: opt.Id })}
                      >
                        <div className="feedback-icon"></div>
                        <span style={{ color: opt.ColorCode }}>{opt.Text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
};
