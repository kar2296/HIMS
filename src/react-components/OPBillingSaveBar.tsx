import React, { useEffect } from 'react';
import { Button } from './Button';
import { spacing, typography } from '../components/ui/tokens';

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
        gap: spacing.sm,
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Attachments */}
      {showAttachment && (
        <Button
          type="button"
          variant="secondary"
          icon="fa-paperclip"
          onClick={() => handleAction('openattachments')}
          title="Attachments"
        >
          Attachments ({attachmentCount})
        </Button>
      )}

      {/* Print Receipt */}
      {!!receiptNo && (
        <Button
          type="button"
          variant="info"
          icon="fa-receipt"
          onClick={() => handleAction('printReceipt')}
          title="Print Receipt"
        >
          Print Receipt
        </Button>
      )}

      {/* Save Draft */}
      {showSave && (
        <Button
          type="button"
          variant="warning"
          icon="fa-save"
          onClick={() => handleAction('saveAndDraft')}
          title="Save Draft (Alt+S / F2)"
        >
          Save Draft (Alt+S)
        </Button>
      )}

      {/* Save & Collect / Approve */}
      {showSaveApprove && (
        <Button
          type="button"
          variant="success"
          icon="fa-check-circle"
          onClick={() => handleAction('saveAndApprove')}
          title="Save & Collect / Approve (Alt+A / F4)"
        >
          Save &amp; Collect (Alt+A)
        </Button>
      )}
    </div>
  );
};
