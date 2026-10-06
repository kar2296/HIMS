import React from 'react';

interface PaymentDetailRow {
  Id?: number;
  BillDateTime?: string;
  BillNumber?: string;
  Patient?: { MRN?: string; FirstName?: string };
  EncounterTypeId?: number;
  PatientBill?: { DoctorName?: string; CancelReason?: string };
  BillAmount?: number;
  PaidAmount?: number;
  BillingRequestUser?: { FirstName?: string; LastName?: string };
  BillingRequestAt?: string;
}

interface IpBillingRequestListScreenProps {
  reactProps?: {
    PaymentDetails?: PaymentDetailRow[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(v?: string): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${months[d.getMonth()]}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function displayCurrency(v?: number): string {
  if (v === undefined || v === null) return '';
  return Number(v).toFixed(2);
}

// React bridge migration (single mount, results portion): renders the
// billing-approval-request results table. Edit dispatch matches by the
// row's Id (a natural key) rather than array index, since
// EditBillingRequest(PaymentDetail) in the original controller is passed
// the whole object anyway -- the lookup-by-key here just mirrors that and
// keeps the dispatch payload small.
export const IpBillingRequestListScreen: React.FC<IpBillingRequestListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.PaymentDetails || null;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
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
                  <th><span>Requested By</span></th>
                  <th><span>Requested At</span></th>
                  <th><span>Cancel Reason</span></th>
                  <th><span>Status</span></th>
                </tr>
              </thead>
            )}
            <tbody>
              {(rows || []).map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td className="text-left"><span>{formatDateTime(row.BillDateTime)}</span></td>
                  <td className="text-left"><span>{row.BillNumber}</span></td>
                  <td className="text-left">
                    <span>{row.Patient?.MRN} {row.Patient?.FirstName}</span>
                    {row.EncounterTypeId === 2 ? <span> IP </span> : <span> OP </span>}
                  </td>
                  <td className="text-left"><span>{row.PatientBill?.DoctorName}</span></td>
                  <td className="text-right"><span>{displayCurrency(row.BillAmount)}</span></td>
                  <td className="text-right"><span>{displayCurrency(row.PaidAmount)}</span></td>
                  <td className="text-left"><span>{row.BillingRequestUser?.FirstName || row.BillingRequestUser?.LastName}</span></td>
                  <td className="text-left"><span>{formatDateTime(row.BillingRequestAt)}</span></td>
                  <td className="text-left"><span>{row.PatientBill?.CancelReason}</span></td>
                  <td>
                    <span onClick={() => dispatch('edit', { id: row.Id })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
