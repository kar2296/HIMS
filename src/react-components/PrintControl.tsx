import React, { useState } from 'react';

interface PrintControlProps {
  reactProps?: {
    withHeader: boolean;
    withoutHeader: boolean;
    privileges?: {
      canOriginalPrint?: boolean;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const PrintControl: React.FC<PrintControlProps> = ({
  reactProps = {
    withHeader: false,
    withoutHeader: false,
    privileges: { canOriginalPrint: true }
  },
  onAction
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handlePreviewPrint = () => {
    if (onAction) onAction('previewPrint');
  };

  const handleOriginalPrintClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason."); // Fallback validation
      return;
    }
    setIsModalOpen(false);
    if (onAction) onAction('originalPrint', { reason });
  };

  const handleWithHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (onAction) {
      onAction('setHeader', { 
        withHeader: isChecked, 
        withoutHeader: isChecked ? false : reactProps.withoutHeader 
      });
    }
  };

  const handleWithoutHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (onAction) {
      onAction('setHeader', { 
        withHeader: isChecked ? false : reactProps.withHeader, 
        withoutHeader: isChecked 
      });
    }
  };

  // Styles matching the modern layout and the legacy drhms-common-btn
  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(270deg, #698700 0%, #c61f1f 100%)',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'opacity 0.2s'
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  };

  const modalStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <button type="button" style={btnStyle} onClick={handlePreviewPrint}>
        <i className="fa fa-print" style={{ marginRight: '6px' }}></i> Preview Print
      </button>

      {reactProps.privileges?.canOriginalPrint !== false && (
        <button type="button" style={btnStyle} onClick={handleOriginalPrintClick}>
          <i className="fa fa-print" style={{ marginRight: '6px' }}></i> Original Print
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
        <input 
          type="checkbox" 
          checked={reactProps.withHeader} 
          onChange={handleWithHeaderChange} 
          style={{ marginRight: '8px', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
        <label style={{ margin: 0, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleWithHeaderChange({ target: { checked: !reactProps.withHeader } } as any)}>With Header</label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input 
          type="checkbox" 
          checked={reactProps.withoutHeader} 
          onChange={handleWithoutHeaderChange} 
          style={{ marginRight: '8px', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
        <label style={{ margin: 0, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleWithoutHeaderChange({ target: { checked: !reactProps.withoutHeader } } as any)}>Without Header</label>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ background: '#f8f9fa', padding: '16px', borderBottom: '1px solid #e0e4f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#444' }}>Original Print Request</h4>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
              >&times;</button>
            </div>
            <form onSubmit={handleModalSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: '#444' }}>Reason for Original Print</label>
                <textarea 
                  rows={3} 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #dcdfe6', fontSize: '14px', fontFamily: 'inherit' }}
                  placeholder="Please provide a reason..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: '#e2e6ea', color: '#333' }}>Cancel</button>
                <button type="submit" style={btnStyle}>Submit &amp; Print</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
