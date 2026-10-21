import React from 'react';
import { colors, radii, shadows, typography } from '../components/ui/tokens';

export interface IpBillingCorrectionsActionBarProps {
  reactProps?: {
    canBack?: boolean;
    canExcel?: boolean;
    canUpdate?: boolean;
    canDoctorShareUpdate?: boolean;
    isDisabled?: boolean;
    updateLabel?: string;
    totalNet?: number | string;
    itemCount?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IpBillingCorrectionsActionBar: React.FC<IpBillingCorrectionsActionBarProps> = ({
  reactProps,
  onAction,
}) => {
  const {
    canBack = true,
    canExcel = true,
    canUpdate = true,
    canDoctorShareUpdate = false,
    isDisabled = false,
    updateLabel = 'Update Bill',
    totalNet,
    itemCount,
  } = reactProps || {};

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const formatCurrency = (amt: any) => {
    if (amt === undefined || amt === null) return '';
    const n = Number(amt);
    if (isNaN(n)) return String(amt);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: radii.lg,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        marginTop: 16,
        marginBottom: 16,
        fontFamily: typography.fontFamily,
      }}
    >
      {/* ─── Left Group: Navigation & Export ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {canBack && (
          <button
            type="button"
            onClick={() => dispatch('back')}
            title="Return to Summary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: 11, color: '#64748b' }} />
            <span>Back</span>
          </button>
        )}

        {canExcel && (
          <button
            type="button"
            onClick={() => dispatch('excelDownload')}
            title="Download Excel Report"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.28)',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-file-excel" style={{ fontSize: 14 }} />
            <span>Export Excel</span>
          </button>
        )}
      </div>

      {/* ─── Center: Live Summary Pill ──────────────────────────────── */}
      {totalNet !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: radii.full,
            fontSize: 12,
          }}
        >
          <span style={{ color: '#64748b', fontWeight: 600 }}>Total Net Amount:</span>
          <span style={{ color: '#059669', fontWeight: 800, fontSize: 14 }}>
            {formatCurrency(totalNet)}
          </span>
          {itemCount !== undefined && (
            <span style={{ color: '#94a3b8', fontSize: 11.5 }}>({itemCount} items)</span>
          )}
        </div>
      )}

      {/* ─── Right Group: Primary Submission Actions ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {canDoctorShareUpdate && (
          <button
            type="button"
            onClick={() => dispatch('updateDoctorshare')}
            title="Update Doctor Share Distribution"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 20px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.28)',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-user-md" style={{ fontSize: 13 }} />
            <span>DoctorShare Update</span>
          </button>
        )}

        {canUpdate && (
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => dispatch('completeBill')}
            title="Save and update bill details"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 24px',
              borderRadius: radii.md,
              border: 'none',
              background: isDisabled
                ? '#94a3b8'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-check-circle" style={{ fontSize: 14 }} />
            <span>{updateLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
