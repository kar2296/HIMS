import React from 'react';

interface BillingRequestRow {
  Id?: number;
  BillDateTime?: string;
  BillNumber?: string;
  Patient?: { MRN?: string; FirstName?: string };
  EncounterTypeId?: number;
  Doctor?: { FirstName?: string };
  BillAmount?: number;
  PaidAmount?: number;
  BillingRequestUser?: { FirstName?: string; LastName?: string };
  BillingRequestAt?: string;
  PatientBillId?: number;
  IsPartialCancel?: boolean;
}

interface BillingRequestListScreenProps {
  reactProps?: {
    rows?: BillingRequestRow[];
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

// React bridge migration: replaces the plain ng-repeat "PaymentDetails"
// table in billingrequestlist.html (unlike the identically-named but
// permanently-empty ng-repeat found in insuranceupdatelist.html, this one
// IS live -- getPaymentDetailListCallback genuinely assigns
// $scope.PaymentDetails). Only the edit action (EditBillingRequest) is
// wired to any UI element in the original; reproduced here.
export const BillingRequestListScreen: React.FC<BillingRequestListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
      <table className="table table-hover table-responsive table-bordered">
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
            <th><span>Status</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td className="text-left">{formatDateTime(row.BillDateTime)}</td>
              <td className="text-left">{row.BillNumber}</td>
              <td className="text-left">
                {row.Patient?.MRN} {row.Patient?.FirstName} {row.EncounterTypeId === 2 ? 'IP' : 'OP'}
              </td>
              <td className="text-left">{row.Doctor?.FirstName}</td>
              <td className="text-right">{formatCurrency(row.BillAmount)}</td>
              <td className="text-right">{formatCurrency(row.PaidAmount)}</td>
              <td className="text-left">{row.BillingRequestUser?.FirstName || row.BillingRequestUser?.LastName}</td>
              <td className="text-left">{formatDateTime(row.BillingRequestAt)}</td>
              <td>
                <span onClick={() => dispatch('editBillingRequest', { entity: row })}>
                  <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
