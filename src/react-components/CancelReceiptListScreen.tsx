import React from 'react';

interface CancelReceiptRow {
  Id?: number;
  ReceiptNumber?: string;
  ReceiptDateTime?: string;
  Patient?: { Title?: { Description?: string }; FirstName?: string; LastName?: string; MRN?: string; Age?: number; Gender?: { Description?: string }; PatientId?: number };
  PatientId?: number;
  ReceiptType?: { Description?: string };
  AmountPaid?: number;
  PaymentType?: { Description?: string };
  ReceiptStatus?: { Description?: string };
}

interface CancelReceiptListScreenProps {
  reactProps?: {
    rows?: CancelReceiptRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mi}`;
}

// React bridge migration: replaces <custom-table config="vm.gridConfig">
// in cancelreceipt.html. Column set and the patient-info link reproduced
// exactly from the original columnDefs.
//
// SIGNIFICANT CONFIRMED BUG found while investigating this controller
// (not fixed, per policy): line `$scope.closeReceipt =
// $scope.cancelCallback();` in cancelReceiptFormController runs
// unconditionally during controller construction and CALLS
// cancelCallback() immediately (invoking $uibModalInstance.dismiss()),
// rather than merely assigning a reference to it (the parentheses make
// this an immediate call, not `= $scope.cancelCallback;`). This means the
// modal dismisses itself the instant it opens, before any data loads or
// the user can interact with it -- the entire Cancel Receipt screen is
// effectively unreachable in production as written. `closeReceipt` itself
// is never referenced anywhere else, so it has no other purpose. This
// migration reproduces the rest of the screen's logic faithfully in case
// this bug is ever fixed independently, but does not fix it here, since
// it is a pre-existing business-logic defect unrelated to the migration.
export const CancelReceiptListScreen: React.FC<CancelReceiptListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="table-control formRoot">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th><span>Receipt No</span></th>
            <th><span>Receipt Date</span></th>
            <th><span>Patient Info</span></th>
            <th><span>Type</span></th>
            <th><span>Receipt Amount</span></th>
            <th><span>Payment Mode</span></th>
            <th><span>Status</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td>{row.ReceiptNumber}</td>
              <td>{formatDateTime(row.ReceiptDateTime)}</td>
              <td>
                <a onClick={() => dispatch('patientinfo', { entity: row })} style={{ cursor: 'pointer' }}>
                  {row.Patient?.Title?.Description}.{row.Patient?.FirstName}{row.Patient?.LastName} {row.Patient?.MRN} {row.Patient?.Age} {row.Patient?.Gender?.Description}
                </a>
              </td>
              <td>{row.ReceiptType?.Description}</td>
              <td>{formatCurrency(row.AmountPaid)}</td>
              <td>{row.PaymentType?.Description}</td>
              <td>{row.ReceiptStatus?.Description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
