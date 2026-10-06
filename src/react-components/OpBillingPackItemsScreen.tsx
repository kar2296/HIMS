import React from 'react';

interface DrLookupItem {
  Id?: number;
  DoctorName?: string;
}

interface PackItemRow {
  _idx?: number; // index into the full (unfiltered) $scope.items array
  Status?: number;
  ServiceName?: string;
  ServPerformDoctorId?: number;
  DrLookup?: DrLookupItem[];
}

interface OpBillingPackItemsScreenProps {
  reactProps?: {
    packageName?: string;
    items?: PackItemRow[];
    isEditable?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the ng-repeat items table in
// opbillingpackitem.html (the package-service performing-doctor picker
// modal). Rows are pre-filtered by the bridge to Status===1 (reproducing
// `ng-repeat="item in items | filter:{Status:1}"`), each carrying `_idx`,
// its index into the full $scope.items array, so doctor selections write
// back to the exact original element that Save() reads from.
//
// Note a quirk (not a bug) in the original: the ui-select's own ng-model
// is item.ServPerformDoctorId (auto-populated with the selected doctor's
// Id by ui-select itself), while its on-select handler, SelectedDoctor(),
// separately sets item.PerformDoctorId/PerformDoctorName/
// PerformDrShareValue/PerformDrShare from the same selection. Both sets
// of fields end up populated correctly and both are reproduced here.
//
// The header patient-info banner, the (permanently blank -- PackageName
// is never assigned anywhere in the controller) package name label, and
// the Save button all stay native.
export const OpBillingPackItemsScreen: React.FC<OpBillingPackItemsScreenProps> = ({ reactProps, onAction }) => {
  const items = reactProps?.items || [];
  const isEditable = !!reactProps?.isEditable;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <table className="table table-hover table-responsive table-bordered">
      <thead className="bg-subhead">
        <tr>
          <th className="col-sm-3"><span>Service Code</span></th>
          <th className="col-sm-3"><span>Doctor Name</span></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={item._idx ?? idx}>
            <td>
              <input type="text" className="form-control" disabled value={item.ServiceName || ''} readOnly />
            </td>
            <td>
              <select
                className="filter-combo form-control"
                disabled={!isEditable}
                value={item.ServPerformDoctorId ?? ''}
                onChange={(e) => dispatch('doctorChange', { idx: item._idx, value: e.target.value ? Number(e.target.value) : null })}
              >
                <option value=""></option>
                {(item.DrLookup || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.DoctorName}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
