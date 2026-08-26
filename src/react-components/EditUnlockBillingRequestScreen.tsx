import React from 'react';

interface EditUnlockBillingRequestScreenProps {
  reactProps?: {
    item?: {
      VisitIdentifier?: string;
      Patient?: { MRN?: string; FirstName?: string };
      EncounterTypeId?: number;
      AdmissionDate?: string;
      Credit?: number;
      Debit?: number;
      Balance?: number;
      BillUnlockRequestStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateTime(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = monthNames[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mon}-${yyyy} ${hh}:${mi}`;
}

// React bridge migration (single mount): "Visit Info" modal
// (editunlockbillingrequestController), opened from the Billing UnLock
// Approval Request list's edit icon. No API calls happen inside this
// modal's template itself -- UnlockApproved()/UnlockRejected() call
// Billing/BillingRequest/AddBillingRequest or .../UpdateBillingRequest
// (preserved, unchanged, invoked from the AngularJS bridge). No native
// widgets, no utl.Validator.validate -- qualifies for a single mount.
// Both action buttons are disabled once BillUnlockRequestStatusId > 1,
// reproduced verbatim via the disabled prop below.
export const EditUnlockBillingRequestScreen: React.FC<EditUnlockBillingRequestScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const isDisabled = (item.BillUnlockRequestStatusId ?? 0) > 1;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="modal-header custom-modal-header">
        <div className="col-sm-10">
          <h4 className="modal-title custom-modal-title">Visit Info</h4>
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
                <td><span>Visit Identifier</span> :</td>
                <td>{item.VisitIdentifier}</td>
                <td><span>Patient Name</span> :</td>
                <td className="text-left">
                  <span> {item.Patient?.MRN} / {item.Patient?.FirstName} /</span>
                  <span>{item.EncounterTypeId === 2 ? ' IP ' : ' OP '}</span>
                </td>
                <td>Admission Date</td>
                <td><span>{formatDateTime(item.AdmissionDate)}</span></td>
                <td><span>Credit</span>:</td>
                <td>{item.Credit}</td>
                <td><span>Debit</span>:</td>
                <td>{item.Debit}</td>
                <td><span>Balance</span>:</td>
                <td>{item.Balance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right">
          <span>
            <button type="button" className="draftbutton" disabled={isDisabled} onClick={() => dispatch('approve')}>
              Approved
            </button>
          </span>
          <span>
            <button type="button" className="draftbutton" disabled={isDisabled} onClick={() => dispatch('reject')}>
              Rejected
            </button>
          </span>
        </div>
      </div>
    </>
  );
};
