import React from 'react';

interface InsuranceUpdateBillRow {
  Id?: number;
  PatientMrn?: string;
  BillNumber?: string;
  PatientName?: string;
  BillDateTime?: string;
  PatientBillStatus?: { Description?: string };
  PaidAmount?: number;
  BillAmount?: number;
}

interface InsuranceUpdateBillListScreenProps {
  reactProps?: {
    rows?: InsuranceUpdateBillRow[];
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
// in insuranceupdatelist.html (the actual, LIVE data grid for this
// screen). Column set and the "view" action icon reproduced exactly from
// the original columnDefs.
//
// This file required careful investigation because insuranceupdatelist.html
// mixes live and dead markup extensively:
// - The top filter form's FromDate/ToDate date-pickers, the native
//   <patientsearch> (its patientid binding, not its dead patientchange
//   callback), and the "Fetch" button (ng-click="getList()") are all
//   genuinely live and stay untouched/native.
// - The BillNo filter input's ng-change="getPaymentDetailList()" and
//   <patientsearch>'s patientchange="getPaymentDetailList()" both call a
//   function that is never defined anywhere in the controller - dead,
//   silently no-op.
// - The entire middle "PaymentDetails" ng-repeat table (ReceiptDateTime/
//   BillNumber/ReceiptNumber/PatientName/Doctor/Cash/Card/ChequeOthers/
//   Status columns, paymodechange/paymodechangeprint buttons) is 100%
//   dead/orphaned: `PaymentDetails` is never assigned anywhere in
//   InsuranceUpdateListController, so this ng-repeat always iterates
//   undefined and permanently renders zero rows. Left untouched (native,
//   harmless - it already renders nothing and still will).
// - The two <customreport-table config="vm.gridConfig"> elements below
//   this component's mount are unknown/unregistered custom elements (no
//   such component exists anywhere in the app) - dead markup, left as-is.
// - The pagination widget's totalItems is never populated by
//   getListCallback (only vm.gridConfig.data is set), so
//   <ul uib-pagination> permanently shows 0 total pages even once data
//   has loaded. Pre-existing, left untouched.
export const InsuranceUpdateBillListScreen: React.FC<InsuranceUpdateBillListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="table-control formRoot">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th><span>MRN</span></th>
            <th><span>Bill Number</span></th>
            <th><span>Patient Name</span></th>
            <th><span>Date</span></th>
            <th><span>Status</span></th>
            <th><span>Paid Amount</span></th>
            <th><span>Bill Amount</span></th>
            <th><span>Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td>{row.PatientMrn}</td>
              <td>{row.BillNumber}</td>
              <td>{row.PatientName}</td>
              <td>{formatDateTime(row.BillDateTime)}</td>
              <td>{row.PatientBillStatus?.Description}</td>
              <td>{formatCurrency(row.PaidAmount)}</td>
              <td>{formatCurrency(row.BillAmount)}</td>
              <td>
                <span className="grid-action" title="View" onClick={() => dispatch('view', { Id: row.Id })}>
                  <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" aria-hidden="true" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
