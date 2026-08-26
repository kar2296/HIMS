import React from 'react';

interface PatientBillRow {
  Id?: number;
  PatientId?: number;
  BillNumber?: string;
  PatientBillId?: number;
  BillDateTime?: string;
  Patient?: { MRN?: string; FirstName?: string };
  EncounterTypeId?: number;
  UserDoctor?: { FirstName?: string };
  BillAmount?: number;
  PaidAmount?: number;
  OutStandingAmount?: number;
  PrivateDue?: { FirstName?: string; LastName?: string };
  CreditApprovalStatus?: { Description?: string };
}

interface CreditApprovalListScreenProps {
  reactProps?: {
    rows?: PatientBillRow[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, results table for creditapprovalrequestlist.html.
// Plain ng-repeat table in the original (no custom-table/ui-grid, no
// sort). The header row is only shown when PatientBills is non-null
// (ng-if="PatientBills") -- reproduced via the `rows` prop being
// null/undefined vs. an array.
export const CreditApprovalListScreen: React.FC<CreditApprovalListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const edit = (row: PatientBillRow) => {
    if (!row.Id) return;
    dispatch('edit', {
      Id: row.Id,
      PatientId: row.PatientId,
      BillNumber: row.BillNumber,
      PatientBillId: row.PatientBillId,
      item: row,
    });
  };

  return (
    <div className="row">
      <form id="item_form" name="item_form" className="form-horizontal" role="form">
        <div className="table-control">
          <div className="bg-pattern">
            <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
              <table className="table table-hover table-responsive table-bordered">
                {rows && (
                  <thead className="bg-subhead">
                    <tr>
                      <th><span>Bill Date</span></th>
                      <th><span>Bill No</span></th>
                      <th><span>Patient Name</span></th>
                      <th><span>Doctor</span></th>
                      <th><span>Bill Amount</span></th>
                      <th><span>Paid Amount</span></th>
                      <th><span>Due Amount</span></th>
                      <th><span>Due Approver</span></th>
                      <th><span>Status</span></th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {(rows || []).map((row, idx) => (
                    <tr key={row.Id ?? idx}>
                      <td className="text-left">
                        <span>
                          {row.BillDateTime ? new Date(row.BillDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                          {row.BillDateTime ? new Date(row.BillDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                        </span>
                      </td>
                      <td className="text-left"><span>{row.BillNumber}</span></td>
                      <td className="text-left">
                        <span>{row.Patient?.MRN} {row.Patient?.FirstName}</span>
                        {row.EncounterTypeId === 2 ? <span> IP </span> : <span> OP </span>}
                      </td>
                      <td className="text-left"><span>{row.UserDoctor?.FirstName}</span></td>
                      <td className="text-right"><span>{formatCurrency(row.BillAmount)}</span></td>
                      <td className="text-right"><span>{formatCurrency(row.PaidAmount)}</span></td>
                      <td className="text-right"><span>{formatCurrency(row.OutStandingAmount)}</span></td>
                      <td className="text-left"><span>{row.PrivateDue?.FirstName || row.PrivateDue?.LastName}</span></td>
                      <td className="text-left"><span>{row.CreditApprovalStatus?.Description}</span></td>
                      <td>
                        <span onClick={() => edit(row)}><img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" /></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
