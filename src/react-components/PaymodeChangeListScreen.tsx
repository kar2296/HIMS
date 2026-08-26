import React from 'react';

interface PaymentDetail {
  Id?: number;
  ReceiptDateTime?: string;
  PatientBill?: { BillNumber?: string; DoctorName?: string };
  ReceiptNumber?: string;
  Patient?: { MRN?: string; FirstName?: string };
  EncounterTypeId?: number;
  PaymentTypeId?: number;
  AmountPaid?: number;
  PatientBillId?: number;
}

interface PaymodeChangeListScreenProps {
  showBillNoColumn?: boolean;
  reactProps?: {
    PaymentDetails?: PaymentDetail[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, shared results table for the three
// payment-mode-change list screens (see PaymodeChangeFilterScreen.tsx for
// the full disclosure). showBillNoColumn=false drops the Bill Number
// column entirely for the advrept variant, which has no
// PatientBill.BillNumber to show (matching the original template
// difference). The last header column is mislabeled "Status" in ALL
// THREE original templates (billing.paymodechange.status.lbl) but its
// data cell actually renders the edit/print action buttons, never an
// actual status value -- reproduced verbatim, not fixed. paymodechange()
// opens the paychanger modal (left as pure AngularJS -- validator-driven
// payment-method-change form, deliberately not migrated, see commit
// message) via the existing 'edit' action; paymodechangeprint()
// downloads a PDF via the existing 'print' action.
export const PaymodeChangeListScreen: React.FC<PaymodeChangeListScreenProps> = ({ showBillNoColumn = true, reactProps, onAction }) => {
  const rows = reactProps?.PaymentDetails || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const isCash = (p: PaymentDetail) => p.PaymentTypeId === 1;
  const isCard = (p: PaymentDetail) => p.PaymentTypeId === 5 || p.PaymentTypeId === 6;
  const isOther = (p: PaymentDetail) => !isCash(p) && !isCard(p);

  return (
    <div className="drhms-table-control">
      <div className="drhms-bg-pattern">
        <div className="drhms-table-height">
          <table className="drhms-responsive-table">
            {rows.length > 0 && (
              <thead className="bg-subhead">
                <tr>
                  <th><span>Bill Date</span></th>
                  {showBillNoColumn && <th><span>Bill Number</span></th>}
                  <th><span>Receipt Number</span></th>
                  <th><span>Patient Name</span></th>
                  <th><span>Doctor</span></th>
                  <th><span>Cash</span></th>
                  <th><span>Card</span></th>
                  <th><span>Cheque/Others</span></th>
                  <th><span>Status</span></th>
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((p, idx) => (
                <tr key={p.Id ?? idx}>
                  <td className="text-left">
                    <span>
                      {p.ReceiptDateTime ? new Date(p.ReceiptDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                      {p.ReceiptDateTime ? new Date(p.ReceiptDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                    </span>
                  </td>
                  {showBillNoColumn && (
                    <td className="text-left"><span> {p.PatientBill?.BillNumber}</span></td>
                  )}
                  <td className="text-left"><span> {p.ReceiptNumber}</span></td>
                  <td className="text-left">
                    <span> {p.Patient?.MRN} {p.Patient?.FirstName}</span>
                    <span>{p.EncounterTypeId === 2 ? ' IP ' : ' OP '}</span>
                  </td>
                  <td className="text-left"><span> {p.PatientBill?.DoctorName}</span></td>
                  <td className="text-right"><span>{formatCurrency(isCash(p) ? p.AmountPaid : 0)}</span></td>
                  <td className="text-right"><span>{formatCurrency(isCard(p) ? p.AmountPaid : 0)}</span></td>
                  <td className="text-right"><span>{formatCurrency(isOther(p) ? p.AmountPaid : 0)}</span></td>
                  <td>
                    <button type="button" className="drhms-edit-button" onClick={() => dispatch('edit', { item: p })}>
                      <img src="assets/svg/edit.svg" alt="" />
                    </button>
                    <button type="button" className="drhms-edit-button" onClick={() => dispatch('print', { item: p })}>
                      <i className="fa fa-print"></i>
                    </button>
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
