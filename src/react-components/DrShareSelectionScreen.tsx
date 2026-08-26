import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
  Department?: { DepartmentName?: string };
}

interface TeamLookupRow {
  _idx?: number; // index into the full (unfiltered) $scope.TeamLookUp array
  Status?: number;
  TeamId?: number;
  DoctorId?: number;
  PerformDrShare?: number | string;
  IsApproved?: number;
}

interface DrShareSelectionScreenProps {
  reactProps?: {
    rows?: TeamLookupRow[];
    doctorOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the ng-repeat performing-doctor/share
// table in drshareSelection.html (drshareSelection.js is the only live
// controller for this state; drshareSelection4_2.js and
// drshareSelection_ba.js are NOT referenced by any loaded state file -
// confirmed dead/orphaned alternate versions, left untouched). Rows are
// pre-filtered by the bridge to Status===1 (reproducing the original's
// `ng-show="item.Status == 1"` -- functionally equivalent for React since
// a hidden row is neither visible nor interactive), each carrying `_idx`,
// its index into the full $scope.TeamLookUp array, so edits write back to
// the exact original element that Save()/checkTotal() read from.
//
// As with opbillingpackitem, the ui-select's own ng-model (item.DoctorId)
// and its on-select handler SelectedDoctor() (which sets
// item.PerformDoctorId/PerformDoctorName separately) are both reproduced.
// The header patient-info banner, the item summary line, the "+" add-row
// button, and the Save button all stay native.
export const DrShareSelectionScreen: React.FC<DrShareSelectionScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];
  const doctorOptions = reactProps?.doctorOptions || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <table className="table table-hover table-responsive table-bordered">
      <thead className="bg-subhead">
        <tr>
          <th className="col-sm-3"><span>Doctor Name</span></th>
          <th className="col-sm-3"><span>Share Amount</span></th>
          <th className="col-sm-3"><span>Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => {
          const disabled = row.IsApproved === 1;
          return (
            <tr key={row._idx ?? idx}>
              <td>
                <select
                  className="filter-combo form-control"
                  disabled={disabled}
                  value={row.DoctorId ?? ''}
                  onChange={(e) => dispatch('doctorChange', { idx: row._idx, value: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value=""></option>
                  {doctorOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}{opt.Department?.DepartmentName ? ` (${opt.Department.DepartmentName})` : ''}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  disabled={disabled}
                  value={row.PerformDrShare ?? ''}
                  onChange={(e) => dispatch('shareChange', { idx: row._idx, value: e.target.value })}
                />
              </td>
              <td align="center">
                <button
                  type="button"
                  className="drhms-edit-button"
                  disabled={disabled}
                  onClick={() => dispatch('deleteItem', { idx: row._idx })}
                >
                  <img src="assets/svg/delete.svg" alt="" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
