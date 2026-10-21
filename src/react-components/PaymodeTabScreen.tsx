import React from 'react';
import { colors, radii, shadows, spacing, typography, transitions } from '../components/ui/tokens';

interface Tab {
  title: string;
  state: string;
  canDisable: boolean;
}

interface PaymodeTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
    activeState?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function getTabIcon(state?: string): string {
  if (!state) return 'fa-solid fa-layer-group';
  if (state.includes('tabadvrept')) return 'fa-solid fa-receipt';
  if (state.includes('tabop')) return 'fa-solid fa-file-invoice-dollar';
  if (state.includes('tabpharmacy')) return 'fa-solid fa-prescription-bottle-medical';
  return 'fa-solid fa-layer-group';
}

export const PaymodeTabScreen: React.FC<PaymodeTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const activeState = reactProps?.activeState;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const activeTab = tabs.find((t) => t.state === activeState) || tabs[0];

  return (
    <div style={{
      fontFamily: typography.fontFamily,
      boxSizing: 'border-box',
      marginBottom: 16,
    }}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP ACTION & NAVIGATION HEADER
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: radii.lg,
        padding: '14px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 14,
      }}>
        {/* Title Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: radii.md,
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.28)',
            flexShrink: 0,
          }}>
            <i className="fa-solid fa-money-bill-transfer" style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                Payment Mode Change
              </h1>
              <span style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: radii.full,
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
                letterSpacing: '0.02em',
              }}>
                Billing Management
              </span>
            </div>
            <p style={{
              margin: '3px 0 0',
              fontSize: 12.5,
              color: '#64748b',
              lineHeight: 1.4,
            }}>
              Update and modify payment modes across receipts, outpatient bills, and pharmacy collections
            </p>
          </div>
        </div>

        {/* Current Active Indicator */}
        {activeTab && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: radii.full,
            fontSize: 12,
            color: '#475569',
            fontWeight: 500,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
            }} />
            <span>Active Module: <strong style={{ color: '#0f172a' }}>{activeTab.title}</strong></span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MODERN SEGMENTED TAB SWITCHER
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: radii.md,
        padding: '4px 6px',
        maxWidth: '100%',
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => {
          const isActive = activeState === tab.state;
          const iconClass = getTabIcon(tab.state);

          return (
            <button
              key={tab.state}
              type="button"
              disabled={tab.canDisable}
              onClick={() => {
                if (!tab.canDisable && !isActive) {
                  dispatch('switchTab', { state: tab.state });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 6,
                border: isActive ? '1px solid #e0e7ff' : '1px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#4f46e5' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                opacity: tab.canDisable ? 0.5 : 1,
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: transitions.default,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive && !tab.canDisable) {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                  e.currentTarget.style.color = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !tab.canDisable) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <i className={iconClass} style={{
                fontSize: 13,
                color: isActive ? '#4f46e5' : '#94a3b8',
              }} />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
