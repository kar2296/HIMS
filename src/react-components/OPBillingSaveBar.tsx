import React from 'react';

interface OPBillingSaveBarProps {
  reactProps?: {
    itemId: number;
    patientBillStatusId: number;
    patientStatusId: number;
    advanceReceiptAmount: number;
    isShow: boolean;
    canShowSaveBtn: boolean;
    canShowSaveapproveBtn: boolean;
    isFromIPBill: number;
    receiptNo: string;
    attachmentCount: number;
    privileges: {
      canAttachment: boolean;
      canSave: boolean;
      canSaveApprove: boolean;
    };
  };
  onAction?: (actionName: string) => void;
}

export const OPBillingSaveBar: React.FC<OPBillingSaveBarProps> = ({
  reactProps = {
    itemId: 0,
    patientBillStatusId: 0,
    patientStatusId: 0,
    advanceReceiptAmount: 0,
    isShow: false,
    receiptNo: '',
    attachmentCount: 0,
    privileges: {
      canAttachment: false,
      canSave: false,
      canSaveApprove: false
    }
  },
  onAction
}) => {

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  // We use a React Fragment (<></>) instead of a wrapping <div>
  // so that these buttons naturally flow into the legacy parent container (e.g. `d-flex-buttons`)
  // without breaking the horizontal alignment.
  return (
    <>
      {/* Attachments */}
      {reactProps.privileges?.canAttachment && (
        <button 
          type="button" 
          className="premium-btn-primary" 
          style={{ backgroundColor: 'var(--premium-text-muted)', borderColor: 'var(--premium-text-muted)' }} 
          onClick={() => handleAction('openattachments')} 
          title="Attachments"
        >
          <i className="fa fa-paperclip" style={{ marginRight: '6px' }}></i>
          Attachments ({reactProps.attachmentCount})
        </button>
      )}

      {/* Print Receipt */}
      {reactProps.receiptNo && (
        <button 
          type="button" 
          className="premium-btn-primary" 
          style={{ backgroundColor: 'var(--premium-blue)', borderColor: 'var(--premium-blue)' }} 
          onClick={() => handleAction('printReceipt')}
        >
          <i className="fa fa-print" style={{ marginRight: '6px' }}></i>
          Print Receipt
        </button>
      )}

      {/* Save Draft */}
      {reactProps.privileges?.canSave && reactProps.canShowSaveBtn && reactProps.isFromIPBill === 0 && (
        <button 
          type="button" 
          className="premium-btn-primary" 
          style={{ backgroundColor: 'var(--premium-gold)', color: '#fff' }}
          onClick={() => handleAction('saveAndDraft')}
        >
          Save Draft (Alt+S)
        </button>
      )}

      {/* Save & Collect */}
      {reactProps.privileges?.canSaveApprove && reactProps.canShowSaveapproveBtn && (
        <button 
          type="button" 
          className="premium-btn-primary" 
          onClick={() => handleAction('saveAndApprove')}
        >
          Save & Collect (Alt+A)
        </button>
      )}
    </>
  );
};
