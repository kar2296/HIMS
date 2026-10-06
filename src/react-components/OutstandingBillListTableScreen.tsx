import React from 'react';

interface OutstandingBillRow {
  Id?: number;
  Patient?: { MRN?: string; Title?: { Description?: string }; FirstName?: string; LastName?: string };
  BillNumber?: string;
  BillDateTime?: string;
  PatientBillStatus?: { Description?: string };
  OutStandingAmount?: number;
  PaidAmount?: number;
  BillAmount?: number;
}

interface OutstandingBillListTableScreenProps {
  reactProps?: {
    rows?: OutstandingBillRow[];
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
// outstandingbill-list.html. This modal is opened in two modes: as a bill
// picker when modalConfig.params.id is set (IsPicker=true), or as an
// outstanding-bills display when modalConfig.params.eid is set
// (IsPicker=false). CONFIRMED PRE-EXISTING BUG reproduced exactly: the
// ENTIRE content block in the original template -- dynamicform, this
// table, pagination, AND the "Out Standing Amount" total paragraph -- is
// wrapped in a single `ng-if="IsPicker"`. When IsPicker is false (the
// eid/"display" mode), the modal body renders completely empty (only the
// header/close-X shows) -- this React component is mounted inside that
// same untouched native `ng-if="IsPicker"` wrapper, so it naturally never
// renders in that mode, matching the bug. And even when IsPicker is true,
// the "Out Standing Amount" paragraph carries `ng-hide="IsPicker"`, so it
// can never actually be visible in EITHER mode -- it is permanently dead
// and is omitted here rather than reproduced, since reproducing a
// permanently-invisible element would add no observable behavior.
// As with pendingbill-list, gridConfig.enableFullRowSelection/
// enableRowSelection/multiSelect/onRegisterApi are dead code (<custom-table>
// has no such API), so only the Select icon click is reproduced.
export const OutstandingBillListTableScreen: React.FC<OutstandingBillListTableScreenProps> = ({ reactProps, onAction }) => {
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
            <th><span>Bill Number</span></th>
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
                  <i className="fa fa-check" aria-hidden="true"></i>
                </span>
              </td>
              <td>{row.Patient?.MRN}</td>
              <td>{row.BillNumber}</td>
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
