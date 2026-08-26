import React from 'react';

interface EditDetailIpBillingRequestHeaderScreenProps {
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (hybrid, mount 1 of 2): the modal header/close
// button, mounted BEFORE the still-native <ippatientbanner> directive in
// editdetailipbillingrequest.html. See EditDetailIpBillingRequestListScreen
// for the mount after it (results table + Approved/Rejected buttons) and
// the full hybrid rationale.
export const EditDetailIpBillingRequestHeaderScreen: React.FC<EditDetailIpBillingRequestHeaderScreenProps> = ({ onAction }) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="modal-header custom-modal-header">
      <div className="col-sm-10">
        <h4 className="modal-title custom-modal-title">Bill Detail Info</h4>
      </div>
      <div className="col-sm-2">
        <div className="filters">
          <img src="../../../../../assets/svg/close.svg" alt="" onClick={() => dispatch('close')} />
        </div>
      </div>
    </div>
  );
};
