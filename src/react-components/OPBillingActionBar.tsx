import React from 'react';

interface OPBillingActionBarProps {
  reactProps?: {
    context: string;
    ipIsBillLock: boolean;
    ipBillListEnabled: boolean;
    privileges: {
      canViewPreviousBills: boolean;
      canViewOutstandingBills: boolean;
    };
  };
  onAction?: (actionName: string) => void;
}

export const OPBillingActionBar: React.FC<OPBillingActionBarProps> = ({
  reactProps = {
    context: 'OP',
    ipIsBillLock: false,
    ipBillListEnabled: false,
    privileges: {
      canViewPreviousBills: false,
      canViewOutstandingBills: false
    }
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
    disabled: boolean = false
  ) => {
    if (!visible) return null;
    
    return (
      <button 
        style={{
          ...buttonStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onClick={disabled ? undefined : onClick}
        title={tooltip}
      >
        <i className={`fa ${icon}`}></i>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      
      {/* Add New Bill */}
      {renderButton('fa-plus', 'Add New (F7)', () => handleAction('addNewBill'), 
        reactProps.context === 'OP' || reactProps.context === 'DG')}
      
      {/* Find Bill */}
      {renderButton('fa-search-plus', 'Find Bill', () => handleAction('findBill'), 
        (reactProps.context === 'OP' && reactProps.privileges.canViewPreviousBills) || reactProps.context === 'DG')}
      
      {/* IP Bill List */}
      {renderButton('fa-calendar', 'IP Bill List', () => handleAction('getIPBillList'), 
        !reactProps.ipIsBillLock && reactProps.ipBillListEnabled)}
      
      {/* Outstanding Bills */}
      {renderButton('fa-h-square', 'Outstanding Bills', () => handleAction('outstandingBill'), 
        reactProps.privileges.canViewOutstandingBills)}
      
      {/* Dashboard */}
      {renderButton('fa-home', 'Dashboard', () => handleAction('backtoList'), 
        reactProps.context === 'frontoffice' || reactProps.context === 'billing' || reactProps.context === 'OP')}
      
    </div>
  );
};
