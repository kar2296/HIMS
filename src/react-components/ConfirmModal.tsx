import React from 'react';

export interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  yesLabel?: string;
  noLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success' | 'info';
  icon?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen = true,
  title = 'Confirm',
  message = '',
  yesLabel = 'Yes',
  noLabel = 'No',
  variant,
  icon,
  width = '350px',
  maxWidth = '90vw',
  minHeight,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const isDeleteOrDanger =
    variant === 'danger' ||
    title.toLowerCase().includes('delete') ||
    title.toLowerCase().includes('deactivate') ||
    title.toLowerCase().includes('remove') ||
    title.toLowerCase().includes('cancel');

  const isSuccess = variant === 'success' || title.toLowerCase().includes('success');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: width,
          maxWidth: maxWidth,
          minHeight: minHeight,
          boxShadow: '0 16px 32px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'confirmModalPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#ffffff',
              }}
            >
              <i
                className={
                  icon ||
                  (isDeleteOrDanger
                    ? 'fa fa-exclamation-circle'
                    : isSuccess
                    ? 'fa fa-check-circle'
                    : 'fa fa-question-circle')
                }
              ></i>
            </div>
            <h4
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h4>
          </div>

          <button
            type="button"
            onClick={handleClose}
            title="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#ffffff',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              lineHeight: 1,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          >
            &times;
          </button>
        </div>

        {/* Compact Body */}
        <div
          style={{
            padding: '16px 18px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Visual Circle Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isDeleteOrDanger
                ? '#fee2e2'
                : isSuccess
                ? '#dcfce7'
                : '#eff6ff',
              color: isDeleteOrDanger
                ? '#dc2626'
                : isSuccess
                ? '#16a34a'
                : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              marginBottom: '10px',
            }}
          >
            <i
              className={
                icon ||
                (isDeleteOrDanger
                  ? 'fa fa-exclamation'
                  : isSuccess
                  ? 'fa fa-check'
                  : 'fa fa-question')
              }
            ></i>
          </div>

          {/* Message Content */}
          <div
            style={{
              fontSize: '13.5px',
              color: '#1e293b',
              fontWeight: 600,
              lineHeight: 1.45,
              maxWidth: '290px',
            }}
          >
            {message}
          </div>
        </div>

        {/* Compact Footer */}
        <div
          style={{
            padding: '10px 14px 12px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {noLabel && (
            <button
              type="button"
              onClick={handleClose}
              style={{
                minWidth: '80px',
                height: '32px',
                padding: '0 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              {noLabel}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            style={{
              minWidth: '80px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '6px',
              border: 'none',
              background: isDeleteOrDanger
                ? 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isDeleteOrDanger
                ? '0 2px 5px rgba(30, 27, 75, 0.2)'
                : '0 2px 5px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDeleteOrDanger
                ? '0 2px 5px rgba(30, 27, 75, 0.2)'
                : '0 2px 5px rgba(37, 99, 235, 0.2)';
            }}
          >
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
