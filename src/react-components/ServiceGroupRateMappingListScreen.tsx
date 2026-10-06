import React from 'react';

interface SgrmRow {
  Id?: number;
  ServiceGroup?: string;
  BedType?: { Description?: string };
  Amount?: number;
  ActiveStatus?: { Description?: string };
  ActiveStatusId?: number;
}

interface ServiceGroupRateMappingListScreenProps {
  part: 'header' | 'list';
  reactProps?: {
    rows?: SgrmRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, single-module split for
// servicegroupratemappingList.html: 'header' is the title + Add button
// (opens the app.servicegroupratemapping modal, unchanged AngularJS flow --
// dispatched straight through as 'addNew' since re-implementing the modal's
// dynamic form is out of scope for this list screen); 'list' replaces the
// <custom-table config="vm.gridConfig">.
//
// Confirmed pre-existing quirk, reproduced as-is: the original delete-icon
// visibility is `ng-show="entity.ActiveStatusId == 3||ActiveStatusId==1"`.
// The second clause reads bare (unscoped) `ActiveStatusId`, which is never
// defined on $scope -- it is always `undefined`, and `undefined == 1` is
// always false. So the effective condition is simply
// `entity.ActiveStatusId === 3`, which is what is reproduced below.
export const ServiceGroupRateMappingListScreen: React.FC<ServiceGroupRateMappingListScreenProps> = ({ part, reactProps, onAction }) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div className="row">
        <div className="col-sm-9">
          <h4>Service Group Rate Mapping</h4>
        </div>
        <div className="col-sm-3">
          <div className="filters">
            <button type="button" tabIndex={-1} className="btn-add" onClick={() => dispatch('addNew')} title="Manage Service Group Rate Mapping">
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rows = reactProps?.rows || [];

  return (
    <div className="row">
      <div className="table-control formRoot">
        <table className="table table-hover table-responsive table-bordered">
          <thead className="bg-subhead">
            <tr>
              <th><span>ServiceGroup</span></th>
              <th><span>BedType</span></th>
              <th><span>Amount</span></th>
              <th><span>Status</span></th>
              <th><span>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.Id ?? idx}>
                <td>{row.ServiceGroup}</td>
                <td>{row.BedType?.Description}</td>
                <td>{row.Amount}</td>
                <td>{row.ActiveStatus?.Description}</td>
                <td>
                  <span className="grid-action" onClick={() => dispatch('edit', { Id: row.Id })}>
                    <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" aria-hidden="true" />
                  </span>
                  {row.ActiveStatusId === 3 && (
                    <span className="grid-action" onClick={() => dispatch('delete', { Id: row.Id, ServiceRateCategory: row.ServiceGroup })}>
                      <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
