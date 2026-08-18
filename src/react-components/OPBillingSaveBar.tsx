import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface OPBillingSaveBarProps {
  props?: any;
  reactProps?: {
    itemId?: number;
    patientBillStatusId?: number;
    patientStatusId?: number;
    advanceReceiptAmount?: number;
    isShow?: boolean;
    canShowSaveBtn?: boolean | number | string;
    canShowSaveapproveBtn?: boolean | number | string;
    isFromIPBill?: number | string;
    receiptNo?: string;
    attachmentCount?: number;
    privileges?: {
      canAttachment?: boolean;
      canSave?: boolean;
      canSaveApprove?: boolean;
    };
  };
  onAction?: (actionName: string) => void;
}

const extractActualProps = (p: any) => {
  let curr = p;
  while (curr && curr.reactProps) {
    curr = curr.reactProps;
  }
  return curr || p;
};

export const OPBillingSaveBar: React.FC<OPBillingSaveBarProps> = (props: any) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction || props.reactProps?.onAction;

  const [isDraftHovered, setIsDraftHovered] = useState(false);
  const [isApproveHovered, setIsApproveHovered] = useState(false);
  const [isAttachHovered, setIsAttachHovered] = useState(false);
  const [isPrintReceiptHovered, setIsPrintReceiptHovered] = useState(false);

  const {
    receiptNo = '',
    attachmentCount = 0,
    canShowSaveBtn = true,
    canShowSaveapproveBtn = true,
    isFromIPBill = 0,
    privileges = {}
  } = actualProps;

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const showAttachment = privileges?.canAttachment === true;
  
  const isSaveAllowed = canShowSaveBtn !== false && canShowSaveBtn !== 0 && canShowSaveBtn !== 'false';
  const isSaveApproveAllowed = canShowSaveapproveBtn !== false && canShowSaveapproveBtn !== 0 && canShowSaveapproveBtn !== 'false';

  const ipBillNum = isFromIPBill !== undefined && isFromIPBill !== null ? Number(isFromIPBill) : 0;
  const showSave = isSaveAllowed && (privileges?.canSave !== false) && (isNaN(ipBillNum) || ipBillNum === 0);
  const showSaveApprove = isSaveApproveAllowed && (privileges?.canSaveApprove !== false);

  // Keyboard shortcut listener (Alt+S for Save Draft, Alt+A for Save & Collect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's' && showSave) {
        e.preventDefault();
        handleAction('saveAndDraft');
      } else if (e.altKey && e.key.toLowerCase() === 'a' && showSaveApprove) {
        e.preventDefault();
        handleAction('saveAndApprove');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSave, showSaveApprove]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Attachments */}
      {showAttachment && (
        <button
          type="button"
          onClick={() => handleAction('openattachments')}
          onMouseEnter={() => setIsAttachHovered(true)}
          onMouseLeave={() => setIsAttachHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
            backgroundColor: isAttachHovered ? '#f1f5f9' : '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Attachments"
        >
          <i className="fas fa-paperclip" style={{ fontSize: '13px', color: '#64748b' }}></i>
          <span>Attachments ({attachmentCount})</span>
        </button>
      )}

      {/* Print Receipt */}
      {!!receiptNo && (
        <button
          type="button"
          onClick={() => handleAction('printReceipt')}
          onMouseEnter={() => setIsPrintReceiptHovered(true)}
          onMouseLeave={() => setIsPrintReceiptHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#ffffff',
            background: isPrintReceiptHovered
              ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
              : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)',
            transition: 'all 0.2s ease',
          }}
          title="Print Receipt"
        >
          <i className="fas fa-receipt" style={{ fontSize: '13px' }}></i>
          <span>Print Receipt</span>
        </button>
      )}

      {/* Save Draft */}
      {showSave && (
        <button
          type="button"
          onClick={() => handleAction('saveAndDraft')}
          onMouseEnter={() => setIsDraftHovered(true)}
          onMouseLeave={() => setIsDraftHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            background: isDraftHovered
              ? 'linear-gradient(135deg, #b45309 0%, #92400e 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: isDraftHovered
              ? '0 4px 12px rgba(217, 119, 6, 0.35)'
              : '0 2px 6px rgba(217, 119, 6, 0.2)',
            transform: isDraftHovered ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title="Save Draft (Alt+S / F2)"
        >
          <i className="fas fa-save" style={{ fontSize: '13px' }}></i>
          <span>Save Draft (Alt+S)</span>
        </button>
      )}

      {/* Save & Collect / Approve */}
      {showSaveApprove && (
        <button
          type="button"
          onClick={() => handleAction('saveAndApprove')}
          onMouseEnter={() => setIsApproveHovered(true)}
          onMouseLeave={() => setIsApproveHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            background: isApproveHovered
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: isApproveHovered
              ? '0 4px 12px rgba(16, 185, 129, 0.35)'
              : '0 2px 6px rgba(16, 185, 129, 0.2)',
            transform: isApproveHovered ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title="Save & Collect / Approve (Alt+A / F4)"
        >
          <i className="fas fa-check-circle" style={{ fontSize: '13px' }}></i>
          <span>Save &amp; Collect (Alt+A)</span>
        </button>
      )}
    </div>
  );
};
