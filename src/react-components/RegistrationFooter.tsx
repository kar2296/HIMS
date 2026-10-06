import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from './Button';
import { colors, spacing, radii, shadows } from '../components/ui/tokens';

interface RegistrationFooterProps {
  reactProps?: {
    patientStatusId?: number;
    attachmentCount?: number;
    enableOPD?: boolean;
    isTempPatient?: boolean;
    vitalsEnabled?: boolean;
    visitPrintEnabled?: boolean;
    canDisableApprove?: boolean;
    privileges?: {
      canDeceased?: boolean;
      canAttachment?: boolean;
      canNewVisit?: boolean;
      canOPDBill?: boolean;
      canCrossConsult?: boolean;
    };
    showPrintDropdown?: boolean;
    swosthaPatient?: number;
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

export const RegistrationFooter: React.FC<RegistrationFooterProps> = (props: any) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction || props.reactProps?.onAction;

  const [showPrintMenu, setShowPrintMenu] = React.useState(false);

  const {
    patientStatusId = 0,
    attachmentCount = 0,
    enableOPD = false,
    isTempPatient = false,
    vitalsEnabled = false,
    visitPrintEnabled = false,
    canDisableApprove = false,
    privileges = {},
    showPrintDropdown = true,
    swosthaPatient = 0
  } = actualProps;

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const isDisabled = canDisableApprove === true || canDisableApprove === 'true' || Number(canDisableApprove) === 1;

  return (
    <div className="hims-reg-footer" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      backgroundColor: colors.surface,
      borderTop: '2px solid var(--premium-blue, #21008d)',
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)',
      position: 'sticky',
      bottom: 0,
      zIndex: 30,
      marginTop: spacing.md,
      flexWrap: 'wrap',
      gap: spacing.xs,
      minHeight: '46px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>

        {privileges.canCrossConsult === true && Number(patientStatusId) === 2 && (
          <Button variant="secondary" onClick={() => handleAction('crossconsult')}>
            Multiple Consultation
          </Button>
        )}

        {privileges.canDeceased !== false && Number(patientStatusId) === 2 && (
          <Button variant="danger" onClick={() => handleAction('deceased')}>
            Deceased
          </Button>
        )}

        {privileges.canAttachment === true && Number(patientStatusId) === 2 && (
          <Button
            variant="secondary"
            icon="fa-paperclip"
            onClick={() => handleAction('openattachments')}
            title="Attachments"
          >
            ({attachmentCount})
          </Button>
        )}

        {privileges.canNewVisit === true && Number(patientStatusId) === 2 && (
          <Button
            variant="warning"
            disabled={Number(patientStatusId) === 3}
            onClick={() => handleAction('newvisit')}
          >
            New Visit
          </Button>
        )}

        {privileges.canOPDBill === true && Number(patientStatusId) === 2 && (
          <Button
            variant="info"
            disabled={Number(patientStatusId) === 3}
            onClick={() => handleAction('opdBill')}
          >
            OPD Bill
          </Button>
        )}

        {vitalsEnabled !== false && !isTempPatient && Number(patientStatusId) === 2 && (
          <Button
            variant="primary"
            disabled={Number(patientStatusId) === 3}
            onClick={() => handleAction('vitals')}
            style={{ backgroundColor: '#6f42c1' }}
          >
            Vitals
          </Button>
        )}

        {visitPrintEnabled !== false && !isTempPatient && !showPrintDropdown && Number(patientStatusId) === 2 && (
          <Button
            variant="success"
            disabled={Number(patientStatusId) === 3}
            onClick={() => handleAction('visitprint')}
          >
            Visit Print
          </Button>
        )}

        {showPrintDropdown === true && Number(patientStatusId) === 2 && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button
              variant="light"
              onClick={() => setShowPrintMenu(!showPrintMenu)}
            >
              Print <i className="fa fa-caret-down" style={{ marginLeft: spacing.xs }}></i>
            </Button>
            {showPrintMenu && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, marginBottom: spacing.sm,
                backgroundColor: colors.surface, borderRadius: radii.sm, boxShadow: shadows.md,
                minWidth: '200px', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1000
              }}>
                <div style={{padding: `${spacing.sm} ${spacing.lg}`, cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, color: colors.textMain}} onClick={() => { handleAction('printRegistration'); setShowPrintMenu(false); }}>Registration Print</div>
                <div style={{padding: `${spacing.sm} ${spacing.lg}`, cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, color: colors.textMain}} onClick={() => { handleAction('printRegistrationIdlabel'); setShowPrintMenu(false); }}>Registration ID Label</div>
                <div style={{padding: `${spacing.sm} ${spacing.lg}`, cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, color: colors.textMain}} onClick={() => { handleAction('print5'); setShowPrintMenu(false); }}>Registration Label (A4)</div>
                <div style={{padding: `${spacing.sm} ${spacing.lg}`, cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, color: colors.textMain}} onClick={() => { handleAction('printVisitSlip'); setShowPrintMenu(false); }}>Visit Print</div>
                <div style={{padding: `${spacing.sm} ${spacing.lg}`, cursor: 'pointer', color: colors.textMain}} onClick={() => { handleAction('printOPBill'); setShowPrintMenu(false); }}>OP Bill Print</div>
              </div>
            )}
          </div>
        )}

      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto', flexShrink: 0 }}>
        {actualProps.canShowSaveBtn && (
          <Button
            variant="warning"
            size="md"
            onClick={() => handleAction('save')}
            style={{ fontWeight: 600, padding: '6px 14px', fontSize: '13px' }}
          >
            Save Draft
          </Button>
        )}

        {Number(swosthaPatient) === 1 ? (
          <Button
            variant="success"
            size="md"
            disabled={isDisabled}
            onClick={() => handleAction('saveSwosthaPatient')}
            style={{
              backgroundColor: '#28a745',
              color: '#ffffff',
              fontWeight: 700,
              padding: '7px 18px',
              fontSize: '13.5px',
              boxShadow: '0 2px 8px rgba(40, 167, 69, 0.25)'
            }}
          >
            Save Swostha Patient
          </Button>
        ) : (
          <Button
            variant="success"
            size="md"
            disabled={isDisabled}
            onClick={() => handleAction('saveAndApprove')}
            style={{
              backgroundColor: '#28a745',
              color: '#ffffff',
              fontWeight: 700,
              padding: '7px 18px',
              fontSize: '13.5px',
              boxShadow: '0 2px 8px rgba(40, 167, 69, 0.25)'
            }}
          >
            Save &amp; Activate
          </Button>
        )}
      </div>
    </div>
  );
};
