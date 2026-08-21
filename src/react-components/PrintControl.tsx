import React, { useState } from 'react';
import { Button } from './Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PrintControlProps {
  reactProps?: {
    withHeader?: boolean;
    withoutHeader?: boolean;
    privileges?: {
      canOriginalPrint?: boolean;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const PrintControl: React.FC<PrintControlProps> = (props: any) => {
  const actualProps = props.reactProps || props;
  const onAction = props.onAction || actualProps.onAction;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const privileges = actualProps.privileges || { canOriginalPrint: true };
  const isWithHeader = !!actualProps.withHeader;

  const handlePreviewPrint = () => {
    if (onAction) onAction('previewPrint');
  };

  const handleOriginalPrintClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason.');
      return;
    }
    setIsModalOpen(false);
    if (onAction) onAction('originalPrint', { reason });
  };

  // Checkbox's onChange hands back the checked boolean directly (rather than
  // the raw ChangeEvent the old <input type="checkbox"> handler read from) --
  // same setHeader action name/payload shape as before.
  const handleHeaderToggle = (isChecked: boolean) => {
    if (onAction) {
      onAction('setHeader', {
        withHeader: isChecked,
        withoutHeader: !isChecked,
      });
    }
  };

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
      {/* Preview Print Button */}
      <Button
        type="button"
        variant="info"
        icon="fas fa-print"
        onClick={handlePreviewPrint}
        title="Preview Print"
      >
        Preview Print
      </Button>

      {/* Original Print Button */}
      {privileges.canOriginalPrint !== false && (
        <Button
          type="button"
          variant="warning"
          icon="fas fa-file-invoice"
          onClick={handleOriginalPrintClick}
          title="Original Print"
        >
          Original Print
        </Button>
      )}

      {/* Single With Header Checkbox */}
      <div style={{ marginLeft: spacing.xs, padding: `6px ${spacing.md}` }}>
        <Checkbox label="With Header" checked={isWithHeader} onChange={handleHeaderToggle} />
      </div>

      {/* Original Print Request Modal
          NOTE: this is a genuinely React-owned dialog (a plain reason-entry
          form) -- there is no iframe/print-preview DOM here and the actual
          print mechanism is dispatched upstream via onAction, so the design
          system's Modal shell is safe to use in place of the hand-rolled
          overlay. The reason <form>, its onSubmit handler, the native
          `required` textarea validation, and the reason.trim() guard + alert
          are all left completely untouched -- only the chrome around them
          changed. */}
      <Modal isOpen={isModalOpen} title="Original Print Request" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleModalSubmit}>
          <Textarea
            label="Reason for Original Print"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            required
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.lg,
              paddingTop: spacing.lg,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit &amp; Print
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
