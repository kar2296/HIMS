import React from 'react';

interface BillRow {
  Id?: number;
  EncounterId?: number;
  AdmissionDate?: string;
  BillDateTime?: string;
  VisitIdentifier?: string;
  Patient?: { MRN?: string; FirstName?: string };
  EncounterTypeId?: number;
  PatientBill?: { DoctorName?: string };
  Debit?: number;
  Credit?: number;
  Balance?: number;
  BillingRequest?: { BillingRequestUser?: { FirstName?: string; LastName?: string }; BillingRequestAt?: string };
}

interface UnlockBillingListScreenProps {
  reactProps?: {
    billUnlockDetails?: BillRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(value?: string, withTime?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = monthNames[d.getMonth()];
  const yyyy = d.getFullYear();
  var timePart = '';
  if (withTime) {
    const t = new Date(withTime);
    if (!isNaN(t.getTime())) {
      timePart = ` ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    }
  }
  return `${dd}/${mon}/${yyyy}${timePart}`;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration (hybrid, part 2 of the unlockbillingrequestlist
// screen; see unlockbillingrequestlist.js for the full disclosure
// comment). Results table for the "Billing UnLock Approval Request"
// list, driven by $scope.billUnlockDetails (built in
// getbillUnlockListCallback with the same Debit/Credit/Balance
// calculation logic as billing/opclearance's list, reused verbatim).
// The edit icon dispatches 'edit' with the row's natural key
// (bill.EncounterId, matching EditBillingRequest(item)'s use of
// item.EncounterId as modalConfig.params.id) plus the full row so the
// AngularJS side can pass it straight through as modalConfig.params.data,
// exactly like the original ng-click="EditBillingRequest(bill)".
export const UnlockBillingListScreen: React.FC<UnlockBillingListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.billUnlockDetails || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="table-control">
      <div className="bg-pattern">
        <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
          <table className="table table-hover table-responsive table-bordered">
            {rows.length > 0 && (
              <thead className="bg-subhead">
                <tr>
                  <th><span>Admission Date</span></th>
                  <th><span>Visit Identifier</span></th>
                  <th><span>Patient Name</span></th>
                  <th><span>Doctor</span></th>
                  <th><span>Debit</span></th>
                  <th><span>Credit</span></th>
                  <th><span>Balance</span></th>
                  <th><span>Requested By</span></th>
                  <th><span>Requested At</span></th>
                  <th><span>Status</span></th>
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((bill, idx) => (
                <tr key={bill.Id ?? idx}>
                  <td className="text-left">
                    <span>{formatDate(bill.AdmissionDate, bill.BillDateTime)}</span>
                  </td>
                  <td className="text-left"><span> {bill.VisitIdentifier}</span></td>
                  <td className="text-left">
                    <span> {bill.Patient?.MRN} {bill.Patient?.FirstName}</span>
                    <span>{bill.EncounterTypeId === 2 ? ' IP ' : ' OP '}</span>
                  </td>
                  <td className="text-left"><span> {bill.PatientBill?.DoctorName}</span></td>
                  <td className="text-right"><span>{formatCurrency(bill.Debit)}</span></td>
                  <td className="text-right"><span>{formatCurrency(bill.Credit)}</span></td>
                  <td className="text-right"><span>{formatCurrency(bill.Balance)}</span></td>
                  <td className="text-left">
                    <span> {bill.BillingRequest?.BillingRequestUser?.FirstName || bill.BillingRequest?.BillingRequestUser?.LastName}</span>
                  </td>
                  <td className="text-left">
                    <span>{formatDate(bill.BillingRequest?.BillingRequestAt, bill.BillingRequest?.BillingRequestAt)}</span>
                  </td>
                  <td>
                    <span onClick={() => dispatch('edit', { EncounterId: bill.EncounterId, bill })}>
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
