import React from 'react';

interface PendingBillRow {
  Id?: number;
  Patient?: { MRN?: string; Title?: { Description?: string }; FirstName?: string; LastName?: string };
  BillDateTime?: string;
  PatientBillStatus?: { Description?: string };
  OutStandingAmount?: number;
  PaidAmount?: number;
  BillAmount?: number;
}

interface PendingBillListTableScreenProps {
  reactProps?: {
    rows?: PendingBillRow[];
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

// React bridge migration: replaces <custom-table config="vm.gridConfig"> in
// pendingbill-list.html (a bill-picker modal used by other screens to pick
// a draft/pending OP bill -- BillStatusId: 1 is hardcoded in the original
// controller's defaultdata, so this always lists "Draft" bills only).
// Column set and Select action reproduced exactly from the original
// columnDefs. Note: vm.gridConfig.enableFullRowSelection, enableRowSelection,
// multiSelect, and onRegisterApi (whose rowSelectionChanged handler itself
// references an undefined `entity` variable -- a ReferenceError if it ever
// fired) are ALL dead code: the app's <custom-table> component
// (public/js/app.js, customTableController) has no onRegisterApi/selection
// API at all -- it is a bespoke lightweight table, not real ui-grid -- so
// this entire block silently does nothing. The only real way to pick a row
// is the Select column's check-icon, wired through customTable's per-cell
// handleEvent mechanism. Reproduced here as the icon-click action only.
export const PendingBillListTableScreen: React.FC<PendingBillListTableScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="table-control formRoot">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th><span>Select</span></th>
            <th><span>MRN</span></th>
            <th><span>Patient Name</span></th>
            <th><span>Date</span></th>
            <th><span>Status</span></th>
            <th><span>Due Amount</span></th>
            <th><span>Paid Amount</span></th>
            <th><span>Bill Amount</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td>
                <span className="grid-action" onClick={() => dispatch('select', { entity: row })}>
                  <i className="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i>
                </span>
              </td>
              <td>{row.Patient?.MRN}</td>
              <td>{row.Patient?.Title?.Description} {row.Patient?.FirstName} {row.Patient?.LastName}</td>
              <td>{formatDateTime(row.BillDateTime)}</td>
              <td>{row.PatientBillStatus?.Description}</td>
              <td>{formatCurrency(row.OutStandingAmount)}</td>
              <td>{formatCurrency(row.PaidAmount)}</td>
              <td>{formatCurrency(row.BillAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
