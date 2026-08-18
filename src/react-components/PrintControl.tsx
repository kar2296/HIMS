import React, { useState } from 'react';
import { Button } from './Button';

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
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [isOriginalHovered, setIsOriginalHovered] = useState(false);

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

  const handleHeaderToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (onAction) {
      onAction('setHeader', {
        withHeader: isChecked,
        withoutHeader: !isChecked,
      });
    }
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    width: '480px',
    maxWidth: '92%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Preview Print Button */}
      <button
        type="button"
        onClick={handlePreviewPrint}
        onMouseEnter={() => setIsPreviewHovered(true)}
        onMouseLeave={() => setIsPreviewHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: '#ffffff',
          background: isPreviewHovered
            ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: isPreviewHovered
            ? '0 4px 12px rgba(37, 99, 235, 0.35)'
            : '0 2px 6px rgba(37, 99, 235, 0.2)',
          transform: isPreviewHovered ? 'translateY(-1px)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Preview Print"
      >
        <i className="fas fa-print" style={{ fontSize: '13px' }}></i>
        <span>Preview Print</span>
      </button>

      {/* Original Print Button */}
      {privileges.canOriginalPrint !== false && (
        <button
          type="button"
          onClick={handleOriginalPrintClick}
          onMouseEnter={() => setIsOriginalHovered(true)}
          onMouseLeave={() => setIsOriginalHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            background: isOriginalHovered
              ? 'linear-gradient(135deg, #b45309 0%, #92400e 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: isOriginalHovered
              ? '0 4px 12px rgba(217, 119, 6, 0.35)'
              : '0 2px 6px rgba(217, 119, 6, 0.2)',
            transform: isOriginalHovered ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title="Original Print"
        >
          <i className="fas fa-file-invoice" style={{ fontSize: '13px' }}></i>
          <span>Original Print</span>
        </button>
      )}

      {/* Single With Header Checkbox */}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 0 0 4px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: isWithHeader ? '#1d4ed8' : '#475569',
          backgroundColor: isWithHeader ? '#eff6ff' : '#f8fafc',
          border: `1px solid ${isWithHeader ? '#93c5fd' : '#e2e8f0'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          boxShadow: isWithHeader ? '0 1px 3px rgba(37, 99, 235, 0.12)' : 'none',
        }}
      >
        <input
          type="checkbox"
          checked={isWithHeader}
          onChange={handleHeaderToggle}
          style={{
            cursor: 'pointer',
            width: '16px',
            height: '16px',
            accentColor: '#2563eb',
            margin: 0,
          }}
        />
        <span>With Header</span>
      </label>

      {/* Original Print Request Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    fontSize: '14px',
                  }}
                >
                  <i className="fas fa-file-invoice"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Original Print Request
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleModalSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#334155',
                  }}
                >
                  Reason for Original Print
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                  placeholder="Please provide a reason..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Submit &amp; Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
