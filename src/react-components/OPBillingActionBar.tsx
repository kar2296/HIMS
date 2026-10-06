import React from 'react';
import { Button } from './Button';
import { spacing } from '../components/ui/tokens';

interface OPBillingActionBarProps {
  reactProps?: {
    context?: string;
    ipIsBillLock?: boolean;
    ipBillListEnabled?: boolean;
    privileges?: {
      canViewPreviousBills?: boolean;
      canViewOutstandingBills?: boolean;
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

export const OPBillingActionBar: React.FC<OPBillingActionBarProps> = (props: any) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction || props.reactProps?.onAction;

  const context = actualProps.context || 'OP';
  const ipIsBillLock = actualProps.ipIsBillLock || false;
  const ipBillListEnabled = actualProps.ipBillListEnabled || false;
  const privileges = actualProps.privileges || {};

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
    disabled: boolean = false
  ) => {
    if (!visible) return null;
    return (
      <Button
        variant="icon"
        icon={icon}
        title={tooltip}
        disabled={disabled}
        onClick={onClick}
      />
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
      {/* Add New Bill */}
      {renderActionButton('fa-plus', 'Add New (F7)', () => handleAction('addNewBill'),
        context === 'OP' || context === 'DG')}

      {/* Find Bill */}
      {renderActionButton('fa-search-plus', 'Find Bill', () => handleAction('findBill'),
        (context === 'OP' && privileges.canViewPreviousBills) || context === 'DG')}

      {/* IP Bill List */}
      {renderActionButton('fa-calendar', 'IP Bill List', () => handleAction('getIPBillList'),
        !ipIsBillLock && ipBillListEnabled)}

      {/* Outstanding Bills */}
      {renderActionButton('fa-h-square', 'Outstanding Bills', () => handleAction('outstandingBill'),
        privileges.canViewOutstandingBills)}

      {/* Dashboard */}
      {renderActionButton('fa-home', 'Dashboard', () => handleAction('backtoList'),
        context === 'frontoffice' || context === 'billing' || context === 'OP')}
    </div>
  );
};
