import React from 'react';
import { Button } from './Button';
import { spacing } from '../components/ui/tokens';

interface RegistrationActionBarProps {
  reactProps?: {
    saveCompleted?: boolean;
    billCompleted?: boolean;
    isPatientDeactivated?: boolean;
    isTempPatient?: boolean;
    patientStatusId?: number;
    referredNewVisit?: boolean;
    attachmentCount?: number;
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

export const RegistrationActionBar: React.FC<RegistrationActionBarProps> = (props: any) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction || props.reactProps?.onAction;

  const {
    saveCompleted = false,
    billCompleted = false,
    isPatientDeactivated = false,
    isTempPatient = false,
    patientStatusId = 0,
    referredNewVisit = false,
    attachmentCount = 0
  } = actualProps;

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const renderActionButton = (
    icon: string,
    tooltip: string,
    onClick: () => void,
    visible: boolean,
    disabled: boolean = false,
    badgeCount?: number
  ) => {
    if (!visible) return null;

    return (
      <Button
        variant="icon"
        icon={icon}
        title={tooltip}
        disabled={disabled}
        onClick={onClick}
        badgeCount={badgeCount}
      />
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
      {renderActionButton('fa-bed', 'Admission', () => handleAction('admission'), true)}
      {renderActionButton('fa-exclamation-triangle', 'Clinical Alert', () => handleAction('clinicalalertview'),
        referredNewVisit && Number(patientStatusId) !== 3)}
      {renderActionButton('fa-hospital-o', 'Consultation Charges', () => handleAction('consultationcharges'),
        billCompleted, isPatientDeactivated)}
      {renderActionButton('fa-calculator', 'Billing', () => handleAction('opdBill'),
        saveCompleted && Number(patientStatusId) !== 3)}
      {renderActionButton('fa-sign-out-alt', 'Checkout', () => handleAction('checkout'),
        saveCompleted && Number(patientStatusId) !== 3)}
      {renderActionButton('fa-times', 'Deactivate', () => handleAction('saveAndInactive'),
        saveCompleted && !isTempPatient, isPatientDeactivated)}
      {renderActionButton('fa-paperclip', 'Attachments', () => handleAction('openattachments'),
        saveCompleted, false, attachmentCount)}
      {renderActionButton('fa-barcode', 'Barcode', () => handleAction('printRegistrationIdlabel'),
        saveCompleted)}
      {renderActionButton('fa-plus', 'Add New', () => handleAction('addNewQuick'), true)}
      {renderActionButton('fa-home', 'Dashboard', () => handleAction('backtoList'), true)}
    </div>
  );
};
