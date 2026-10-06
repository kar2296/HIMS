import React from 'react';

interface EditIpBillingRequestScreenProps {
  reactProps?: {
    item?: {
      BillNumber?: string;
      BillDateTime?: string;
      BillAmount?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(v?: string): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${months[d.getMonth()]}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// React bridge migration (single mount): editipbillingrequestController is
// a small $uibModalInstance dialog (the "Bill Info" approve/reject dialog
// opened from ipbillingrequestlist's edit action). No API-triggering inputs
// -- only two buttons dispatching to the existing CancelApproved()/
// CancelRejected() functions, which call the same
// Billing/BillingRequest/AddBillingRequest|UpdateBillingRequest and
// Billing/PatientBills/AddPatientBills|UpdatePatientBillsFromCancel APIs as
// before. No native-only widgets, no utl.Validator.validate call.
export const EditIpBillingRequestScreen: React.FC<EditIpBillingRequestScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="modal-header custom-modal-header">
        <div className="col-sm-10">
          <h4 className="modal-title custom-modal-title">Bill Info</h4>
        </div>
        <div className="col-sm-2">
          <div className="filters">
            <img src="../../../../../assets/svg/close.svg" alt="" onClick={() => dispatch('close')} />
          </div>
        </div>
      </div>
      <div className="col-sm-12">
        <div className="drhms-refund-table">
          <table>
            <tbody>
              <tr>
                <td><span>Bill Number</span> :</td>
                <td>{item.BillNumber}</td>
                <td>Bill Date</td>
                <td>
                  <span>{formatDateTime(item.BillDateTime)}</span>
                </td>
                <td><span>Bill Amount</span>:</td>
                <td>{item.BillAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right">
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('approve')}>
              Approved
            </button>
          </span>
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('reject')}>
              Rejected
            </button>
          </span>
        </div>
      </div>
    </>
  );
};
