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
      canAttachment: false
    }
  },
  onAction
}) => {

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '12px',
    fontSize: '14px',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const defaultBtnStyle = { ...btnStyle, backgroundColor: '#e2e6ea', color: '#333' };
  const primaryBtnStyle = { ...btnStyle, backgroundColor: '#0056b3', color: '#fff' };
  const successBtnStyle = { ...btnStyle, backgroundColor: '#28a745', color: '#fff' };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      
      {/* Attachments */}
      {reactProps.privileges.canAttachment && (
        <button style={defaultBtnStyle} onClick={() => handleAction('openattachments')} title="Attachments">
          <i className="fa fa-paperclip" style={{ marginRight: '6px' }}></i>
          ({reactProps.attachmentCount})
        </button>
      )}

      {/* Print Receipt */}
      {reactProps.receiptNo && (
        <button style={{...primaryBtnStyle, backgroundColor: '#17a2b8'}} onClick={() => handleAction('printReceipt')}>
          <i className="fa fa-print" style={{ marginRight: '6px' }}></i>
          Print Receipt
        </button>
      )}

      {/* Save Draft */}
      {reactProps.privileges.canSave && reactProps.canShowSaveBtn && reactProps.isFromIPBill === 0 && (
        <button style={defaultBtnStyle} onClick={() => handleAction('saveAndDraft')}>
          Save Draft (Alt+S)
        </button>
      )}

      {/* Save & Collect */}
      {reactProps.privileges.canSaveApprove && reactProps.canShowSaveapproveBtn && (
        <button style={successBtnStyle} onClick={() => handleAction('saveAndApprove')}>
          Save & Collect (Alt+A)
        </button>
      )}

    </div>
  );
};
