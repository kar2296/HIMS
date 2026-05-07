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
      canCrossConsult?: boolean;
    };
    showPrintDropdown?: boolean;
    swosthaPatient?: number;
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
      canOPDBill: false,
      canCrossConsult: false
    },
    showPrintDropdown: false,
    swosthaPatient: 0
  },
  onAction
}) => {
  const [showPrintMenu, setShowPrintMenu] = React.useState(false);

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '12px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)'
  };

  const defaultBtnStyle = { ...btnStyle, backgroundColor: 'var(--premium-bg-light)', color: 'var(--premium-text-main)' };
  const warningBtnStyle = { ...btnStyle, backgroundColor: 'var(--premium-gold)', color: '#fff' };
  const dangerBtnStyle = { ...btnStyle, backgroundColor: 'var(--premium-danger)', color: '#fff' };
  const successBtnStyle = { ...btnStyle, backgroundColor: 'var(--premium-blue)', color: '#fff' };
  const primaryBtnStyle = { ...btnStyle, backgroundColor: 'var(--premium-blue)', color: '#fff' };

  return (
    <div className="premium-glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        {reactProps.privileges.canCrossConsult && reactProps.patientStatusId === 2 && (
          <button style={defaultBtnStyle} onClick={() => handleAction('crossconsult')}>
            Multiple Consultation
          </button>
        )}

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

        {reactProps.visitPrintEnabled && !reactProps.isTempPatient && !reactProps.showPrintDropdown && (
          <button 
            style={{...primaryBtnStyle, backgroundColor: '#20c997', opacity: reactProps.patientStatusId === 3 ? 0.5 : 1}} 
            disabled={reactProps.patientStatusId === 3}
            onClick={() => handleAction('visitprint')}
          >
            Visit Print
          </button>
        )}

        {reactProps.showPrintDropdown && (
          <div style={{ position: 'relative' }}>
            <button 
              style={{...defaultBtnStyle, backgroundColor: '#f8f9fa'}} 
              onClick={() => setShowPrintMenu(!showPrintMenu)}
            >
              Print <i className="fa fa-caret-down" style={{ marginLeft: '6px' }}></i>
            </button>
            {showPrintMenu && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px',
                backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '200px', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1000
              }}>
                <div style={{padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={() => { handleAction('printRegistration'); setShowPrintMenu(false); }}>Registration Print</div>
                <div style={{padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={() => { handleAction('printRegistrationIdlabel'); setShowPrintMenu(false); }}>Registration ID Label</div>
                <div style={{padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={() => { handleAction('print5'); setShowPrintMenu(false); }}>Registration Label (A4)</div>
                <div style={{padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={() => { handleAction('printVisitSlip'); setShowPrintMenu(false); }}>Visit Print</div>
                <div style={{padding: '8px 16px', cursor: 'pointer'}} onClick={() => { handleAction('printOPBill'); setShowPrintMenu(false); }}>OP Bill Print</div>
              </div>
            )}
          </div>
        )}

      </div>

      <div>
        {reactProps.swosthaPatient === 1 ? (
          <button 
            style={{
              ...successBtnStyle,
              opacity: reactProps.canDisableApprove ? 0.5 : 1,
              cursor: reactProps.canDisableApprove ? 'not-allowed' : 'pointer'
            }}
            disabled={reactProps.canDisableApprove}
            onClick={() => handleAction('saveSwosthaPatient')}
          >
            Save Swostha Patient
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
};
