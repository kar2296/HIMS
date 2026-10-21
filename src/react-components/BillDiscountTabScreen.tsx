import React from 'react';
import { colors, radii, shadows, typography, transitions } from '../components/ui/tokens';

interface Tab {
  title: string;
  state: string;
  canDisable?: boolean;
}

interface BillDiscountTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
    activeState?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const BillDiscountTabScreen: React.FC<BillDiscountTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [
    { title: 'OP Bills', state: 'app.billdscnttab.opbills' },
    { title: 'Pharmacy Bills', state: 'app.billdscnttab.pharmacybills' }
  ];
  const activeState = reactProps?.activeState || 'app.billdscnttab.opbills';

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const getTabIcon = (state: string) => {
    if (state.includes('pharmacy')) return 'fa-pills';
    return 'fa-file-invoice-dollar';
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: radii.lg,
        border: `1px solid ${colors.border || '#e2e8f0'}`,
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        padding: '16px 20px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* Title & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.md,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          <i className="fas fa-tags" aria-hidden="true" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textMain || '#0f172a',
                fontFamily: typography.fontFamily,
                letterSpacing: '-0.01em',
              }}
            >
              Bill Discount & Write Off
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: radii.full || 9999,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <i className="fas fa-shield-alt" style={{ fontSize: '10px' }} />
              Approvals & Adjustments
            </span>
          </div>
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: '12px',
              color: colors.textMuted || '#64748b',
              fontFamily: typography.fontFamily,
            }}
          >
            Review outpatient & pharmacy billing, apply approved line discounts, and write off balance dues.
          </p>
        </div>
      </div>

      {/* Modern Segmented Tab Buttons */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          gap: 4,
        }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeState === tab.state;
          return (
            <button
              key={tab.state}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.canDisable}
              onClick={() => !tab.canDisable && dispatch('switchTab', { state: tab.state })}
              style={{
                border: 'none',
                outline: 'none',
                cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                padding: '8px 18px',
                borderRadius: radii.md,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#475569',
                background: isActive
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: transitions.fast || 'all 0.15s ease',
              }}
            >
              <i
                className={`fas ${getTabIcon(tab.state)}`}
                style={{
                  fontSize: '13px',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
