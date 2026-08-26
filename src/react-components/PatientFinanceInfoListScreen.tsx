import React from 'react';

interface PatientFinanceRow {
  TransactionDate?: string;
  TransactionNumber?: string;
  VisitNumber?: string;
  BillAmount?: number;
  PaidAmount?: number;
  AdjustedAmount?: number;
  UnAdjustedAmount?: number;
  DueAmount?: number;
}

interface PatientFinanceInfoListScreenProps {
  reactProps?: {
    rows?: PatientFinanceRow[];
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
// in patientfinanceinfo.html. Column set reproduced exactly from the
// original columnDefs. The controller's handleEvents('patientinfo', ...)/
// patientprofiledetails() are dead code -- no columnDef ever wires
// handleEvent: $scope.handleEvents, so there is no action icon to
// reproduce here.
//
// CONFIRMED PRE-EXISTING BUGS (not fixed):
// - The dynamicform's FromDate/ToDate/FacilityId filter fields are 100%
//   decorative: getList()'s inputData only ever sends { Key: 5, Value:
//   PatientId } -- there is no Key for FromDate/ToDate/FacilityId at all,
//   so changing them and clicking Apply has zero effect on the query.
// - Worse, the Apply/Reset buttons call getList() with NO argument, while
//   the initial load calls getList($scope.currentcontext.id) -- so the
//   very first click of Apply or Reset silently drops the current
//   PatientId context (sent as undefined) for the rest of the modal's
//   life.
// - currentcontext.TotalBillAmount is never reset to 0 between calls to
//   getListCallback -- it accumulates BillAmount across every
//   apply/paginate call rather than recalculating from scratch, so the
//   displayed total keeps growing rather than reflecting only the
//   current page/filter.
export const PatientFinanceInfoListScreen: React.FC<PatientFinanceInfoListScreenProps> = ({ reactProps }) => {
  const rows = reactProps?.rows || [];

  return (
    <div className="table-control formRoot">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th><span>Transaction Date</span></th>
            <th><span>Transaction Number</span></th>
            <th><span>Visit Number</span></th>
            <th><span>Bill Amount</span></th>
            <th><span>Paid Amount</span></th>
            <th><span>Adjusted Amount</span></th>
            <th><span>Unadjusted Amount</span></th>
            <th><span>Due Amount</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{formatDateTime(row.TransactionDate)}</td>
              <td>{row.TransactionNumber}</td>
              <td>{row.VisitNumber}</td>
              <td>{formatCurrency(row.BillAmount)}</td>
              <td>{formatCurrency(row.PaidAmount)}</td>
              <td>{formatCurrency(row.AdjustedAmount)}</td>
              <td>{formatCurrency(row.UnAdjustedAmount)}</td>
              <td>{formatCurrency(row.DueAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
