import React from 'react';
import { Button } from './Button';

interface RegistrationFooterProps {
  reactProps?: {
    patientStatusId: number;
    attachmentCount: number;
    enableOPD: boolean;
    isTempPatient: boolean;
    vitalsEnabled: boolean;
    visitPrintEnabled: boolean;
    canDisableApprove: boolean;
    privileges: {
      canDeceased: boolean;
      canAttachment: boolean;
      canNewVisit: boolean;
      canOPDBill: boolean;
    };
  };
  onAction?: (actionName: string) => void;
}

export const RegistrationFooter: React.FC<RegistrationFooterProps> = ({
  reactProps = {
    patientStatusId: 0,
    attachmentCount: 0,
    enableOPD: false,
    isTempPatient: false,
    vitalsEnabled: false,
    visitPrintEnabled: false,
    canDisableApprove: false,
    privileges: {
      canDeceased: false,
      canAttachment: false,
      canNewVisit: false,
      canOPDBill: false
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
  const warningBtnStyle = { ...btnStyle, backgroundColor: '#ffc107', color: '#333' };
  const dangerBtnStyle = { ...btnStyle, backgroundColor: '#dc3545', color: '#fff' };
  const successBtnStyle = { ...btnStyle, backgroundColor: '#28a745', color: '#fff' };
  const primaryBtnStyle = { ...btnStyle, backgroundColor: '#0056b3', color: '#fff' };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e0e4f0',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        {reactProps.privileges.canDeceased && reactProps.patientStatusId === 2 && (
          <button style={dangerBtnStyle} onClick={() => handleAction('deceased')}>
            Deceased
          </button>
        )}

        {reactProps.privileges.canAttachment && (
          <button style={defaultBtnStyle} onClick={() => handleAction('openattachments')} title="Attachments">
            <i className="fa fa-paperclip" style={{ marginRight: '6px' }}></i>
            ({reactProps.attachmentCount})
          </button>
        )}

        {reactProps.privileges.canNewVisit && reactProps.patientStatusId === 2 && (
          <button 
            style={{...warningBtnStyle, opacity: reactProps.patientStatusId === 3 ? 0.5 : 1}} 
            disabled={reactProps.patientStatusId === 3}
            onClick={() => handleAction('newvisit')}
          >
            New Visit
          </button>
        )}

        {reactProps.privileges.canOPDBill && reactProps.enableOPD && (
          <button 
            style={{...primaryBtnStyle, backgroundColor: '#17a2b8', opacity: reactProps.patientStatusId === 3 ? 0.5 : 1}} 
            disabled={reactProps.patientStatusId === 3}
            onClick={() => handleAction('opdBill')}
          >
            OPD Bill
          </button>
        )}

        {reactProps.vitalsEnabled && !reactProps.isTempPatient && (
          <button 
            style={{...primaryBtnStyle, backgroundColor: '#6f42c1', opacity: reactProps.patientStatusId === 3 ? 0.5 : 1}} 
            disabled={reactProps.patientStatusId === 3}
            onClick={() => handleAction('vitals')}
          >
            Vitals
          </button>
        )}

        {reactProps.visitPrintEnabled && !reactProps.isTempPatient && (
          <button 
            style={{...primaryBtnStyle, backgroundColor: '#20c997', opacity: reactProps.patientStatusId === 3 ? 0.5 : 1}} 
            disabled={reactProps.patientStatusId === 3}
            onClick={() => handleAction('visitprint')}
          >
            Visit Print
          </button>
        )}

      </div>

      <div>
        <button 
          style={{
            ...successBtnStyle,
            opacity: reactProps.canDisableApprove ? 0.5 : 1,
            cursor: reactProps.canDisableApprove ? 'not-allowed' : 'pointer'
          }}
          disabled={reactProps.canDisableApprove}
          onClick={() => handleAction('saveAndApprove')}
        >
          Save & Activate
        </button>
      </div>
    </div>
  );
};
