import React from 'react';

interface EstimationRow {
  Id?: number;
  EstimationDate?: string;
  Patient?: { FirstName?: string; Age?: number };
  Gender?: { Description?: string };
  DoctorName?: string;
  BedType?: { Description?: string };
  GuarantorType?: { Description?: string };
  SaveType?: { Description?: string };
  ContactDetails?: string;
}

interface EstimationBillingListScreenProps {
  reactProps?: {
    rows?: EstimationRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the <custom-table config="vm.gridConfig">
// in estimationbillingList.html. Column set and Edit/Delete action icons
// reproduced exactly from the original columnDefs. Note the original's
// "Date"/"Patient Name"/etc. column headers were passed through
// $translate.instant() with plain English strings (not translation keys) --
// they were never registered i18n keys, so $translate.instant() returns the
// string itself unchanged. Reproduced as plain literal text here.
export const EstimationBillingListScreen: React.FC<EstimationBillingListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="row">
      <div className="table-control formRoot">
        <table className="table table-hover table-responsive table-bordered">
          <thead className="bg-subhead">
            <tr>
              <th><span>Date</span></th>
              <th><span>Patient Name</span></th>
              <th><span>Age</span></th>
              <th><span>Gender</span></th>
              <th><span>Doctor Name</span></th>
              <th><span>Bed Type</span></th>
              <th><span>Sponser</span></th>
              <th><span>Save Type</span></th>
              <th><span>Contact Details</span></th>
              <th><span>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.Id ?? idx}>
                <td>{row.EstimationDate}</td>
                <td>{row.Patient?.FirstName}</td>
                <td>{row.Patient?.Age}</td>
                <td>{row.Gender?.Description}</td>
                <td>{row.DoctorName}</td>
                <td>{row.BedType?.Description}</td>
                <td>{row.GuarantorType?.Description}</td>
                <td>{row.SaveType?.Description}</td>
                <td>{row.ContactDetails}</td>
                <td>
                  <span className="grid-action" onClick={() => dispatch('edit', { Id: row.Id })}>
                    <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" aria-hidden="true" />
                  </span>
                  <span className="grid-action" onClick={() => dispatch('delete', { Id: row.Id })}>
                    <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
