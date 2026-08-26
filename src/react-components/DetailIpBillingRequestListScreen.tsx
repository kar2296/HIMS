import React from 'react';

interface PaymentDetailRow {
  Id?: number;
  PatientId?: number;
  EncounterId?: number;
  BillNumber?: string;
  PatientBillId?: number;
  Patient?: { MRN?: string; FirstName?: string };
  Encounter?: { WardMaster?: { WardName?: string }; Guarantor?: { GuarantorName?: string } };
  BillingRequestUser?: { FirstName?: string; LastName?: string };
  BillingRequestAt?: string;
}

interface DetailIpBillingRequestListScreenProps {
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

// React bridge migration (single mount, results portion). Edit dispatch
// matches by the row's Id (natural key) rather than array index -- the
// original ng-repeat here has no filter (PaymentDetail in PaymentDetails),
// so index would technically be safe, but matching by Id keeps the same
// convention used across this migration and stays safe if a filter is
// ever added later.
export const DetailIpBillingRequestListScreen: React.FC<DetailIpBillingRequestListScreenProps> = ({ reactProps, onAction }) => {
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
                  <th><span>S.No</span></th>
                  <th><span>Patient Name</span></th>
                  <th><span>MRN</span></th>
                  <th><span>Ward</span></th>
                  <th><span>Insurance</span></th>
                  <th><span>Requested By</span></th>
                  <th><span>Requested At</span></th>
                  <th><span>Status</span></th>
                </tr>
              </thead>
            )}
            <tbody>
              {(rows || []).map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td className="text-left"><span>{idx + 1}</span></td>
                  <td className="text-left"><span>{row.Patient?.FirstName}</span></td>
                  <td className="text-left"><span>{row.Patient?.MRN}</span></td>
                  <td className="text-left"><span>{row.Encounter?.WardMaster?.WardName}</span></td>
                  <td className="text-left"><span>{row.Encounter?.Guarantor?.GuarantorName}</span></td>
                  <td className="text-left"><span>{row.BillingRequestUser?.FirstName || row.BillingRequestUser?.LastName}</span></td>
                  <td className="text-left"><span>{formatDateTime(row.BillingRequestAt)}</span></td>
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
