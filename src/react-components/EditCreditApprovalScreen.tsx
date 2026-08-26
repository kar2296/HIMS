import React from 'react';

interface EditCreditApprovalScreenProps {
  reactProps?: {
    item?: {
      BillNumber?: string;
      BillDateTime?: string;
      BillAmount?: number;
      PaidAmount?: number;
      OutStandingAmount?: number;
      CreditApprovalStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): this is a small $uibModalInstance
// dialog (editCreditController) opened from creditapprovalrequestlist's
// edit icon. All fields come directly from the PatientBill entity passed
// in via modalConfig.params.item -- the original controller's own
// getBillInfoByBillId()/patientChange() calls are already commented out
// (dead), so no additional API call happens on open; reproduced as-is
// (no extra fetch added here either). No native widgets, no
// utl.Validator.validate call.
export const EditCreditApprovalScreen: React.FC<EditCreditApprovalScreenProps> = ({ reactProps, onAction }) => {
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
                <td><span>Bill Number</span>:</td>
                <td>{item.BillNumber}</td>
                <td>Bill Date</td>
                <td>
                  <span>
                    {item.BillDateTime ? new Date(item.BillDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                    {item.BillDateTime ? new Date(item.BillDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                  </span>
                </td>
                <td><span>Bill Amount</span>:</td>
                <td>{item.BillAmount}</td>
                <td><span>Paid Amount</span>:</td>
                <td>{item.PaidAmount}</td>
                <td><span>Due Amount</span>:</td>
                <td>{item.OutStandingAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right">
          <span>
            <button
              type="button"
              className="draftbutton"
              disabled={(item.CreditApprovalStatusId ?? 0) > 1}
              onClick={() => dispatch('approve')}
            >
              Approved
            </button>
          </span>
          <span>
            <button
              type="button"
              className="draftbutton"
              disabled={(item.CreditApprovalStatusId ?? 0) > 1}
              onClick={() => dispatch('reject')}
            >
              Rejected
            </button>
          </span>
        </div>
      </div>
    </>
  );
};
