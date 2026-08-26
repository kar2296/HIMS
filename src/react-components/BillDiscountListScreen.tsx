import React from 'react';

interface BillInfo {
  Id?: number;
  BillNumber?: string;
  BillDateTime?: string;
  Patient?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  DoctorName?: string;
  BillAmount?: number;
  PaidAmount?: number;
  PatientId?: number;
}

interface BillDiscountListScreenProps {
  variant: 'op' | 'pharmacy';
  reactProps?: {
    rows?: BillInfo[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, results table for opbilldiscount.html (variant
// 'op') / pharmacybilldiscount.html (variant 'pharmacy'). Plain ng-repeat
// table in the original (no custom-table/ui-grid, no column-sort). The
// 'op' variant's edit control is a <button> (op) vs a <span> (pharmacy)
// in the original markup -- purely cosmetic wrapper difference with
// identical click behavior, reproduced per-variant here. editPatBills()
// payload differs too: pharmacy's modal additionally receives
// PatientId (op's does not) -- both reproduced exactly as called in the
// respective original controllers.
export const BillDiscountListScreen: React.FC<BillDiscountListScreenProps> = ({ variant, reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const edit = (row: BillInfo) => {
    if (!row.Id) return;
    const payload: any = { Id: row.Id, BillNumber: row.BillNumber };
    if (variant === 'pharmacy') {
      payload.PatientId = row.PatientId;
    }
    dispatch('edit', payload);
  };

  return (
    <div className="table-control formRoot pharmacycollections">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th><span>Bill Date</span></th>
            <th><span>Bill No</span></th>
            <th><span>Patient Name</span></th>
            <th><span>Doctor</span></th>
            <th><span>Bill Amount</span></th>
            <th><span>Paid Amount</span></th>
            <th><span>Status</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td className="text-left">
                <span>
                  {row.BillDateTime ? new Date(row.BillDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                  {row.BillDateTime ? new Date(row.BillDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                </span>
              </td>
              <td className="text-left"><span>{row.BillNumber}</span></td>
              <td className="text-left">
                <span>{row.Patient?.Title?.Description}&nbsp;{row.Patient?.FirstName}&nbsp;{row.Patient?.LastName}</span>
              </td>
              <td className="text-left"><span>{row.DoctorName}</span></td>
              <td className="text-right"><span>{formatCurrency(row.BillAmount)}</span></td>
              <td className="text-right"><span>{formatCurrency(row.PaidAmount)}</span></td>
              <td>
                {variant === 'op' ? (
                  <button type="button" tabIndex={-1} className="drhms-edit-button" onClick={() => edit(row)}>
                    <img src="assets/svg/edit.svg" alt="" />
                  </button>
                ) : (
                  <span onClick={() => edit(row)}><img src="assets/svg/edit.svg" alt="" /></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
