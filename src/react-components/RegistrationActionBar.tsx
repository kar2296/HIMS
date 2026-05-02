import React from 'react';

interface RegistrationActionBarProps {
  reactProps?: {
    saveCompleted: boolean;
    billCompleted: boolean;
    isPatientDeactivated: boolean;
    isTempPatient: boolean;
    patientStatusId: number;
    referredNewVisit: boolean;
    attachmentCount: number;
  };
  onAction?: (actionName: string) => void;
}

export const RegistrationActionBar: React.FC<RegistrationActionBarProps> = ({
  reactProps = {
    saveCompleted: false,
    billCompleted: false,
    isPatientDeactivated: false,
    isTempPatient: false,
    patientStatusId: 0,
    referredNewVisit: false,
    attachmentCount: 0
  },
  onAction
}) => {

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const buttonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#fff',
    color: '#004e77',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    marginLeft: '8px',
    fontSize: '16px'
  };

  const renderButton = (
    icon: string, 
    tooltip: string, 
    onClick: () => void, 
    visible: boolean, 
    disabled: boolean = false,
    badgeCount?: number
  ) => {
    if (!visible) return null;
    
    return (
      <button 
        style={{
          ...buttonStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative'
        }}
        onClick={disabled ? undefined : onClick}
        title={tooltip}
      >
        <i className={`fas ${icon}`}></i>
        {badgeCount !== undefined && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ff5a5f',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {renderButton('fa-bed', 'Admission', () => handleAction('admission'), true)}
      {renderButton('fa-exclamation-triangle', 'Clinical Alert', () => handleAction('clinicalalertview'), 
        reactProps.referredNewVisit && reactProps.patientStatusId !== 3)}
      {renderButton('fa-hospital-o', 'Consultation Charges', () => handleAction('consultationcharges'), 
        reactProps.billCompleted, reactProps.isPatientDeactivated)}
      {renderButton('fa-calculator', 'Billing', () => handleAction('opdBill'), 
        reactProps.saveCompleted && reactProps.patientStatusId !== 3)}
      {renderButton('fa-sign-out-alt', 'Checkout', () => handleAction('checkout'), 
        reactProps.saveCompleted && reactProps.patientStatusId !== 3)}
      {renderButton('fa-times', 'Deactivate', () => handleAction('saveAndInactive'), 
        reactProps.saveCompleted && !reactProps.isTempPatient, reactProps.isPatientDeactivated)}
      {renderButton('fa-paperclip', 'Attachments', () => handleAction('openattachments'), 
        reactProps.saveCompleted, false, reactProps.attachmentCount)}
      {renderButton('fa-barcode', 'Barcode', () => handleAction('printRegistrationIdlabel'), 
        reactProps.saveCompleted)}
      {renderButton('fa-plus', 'Add New', () => handleAction('addNewQuick'), true)}
      {renderButton('fa-home', 'Dashboard', () => handleAction('backtoList'), true)}
    </div>
  );
};
