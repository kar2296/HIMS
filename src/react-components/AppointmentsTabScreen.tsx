import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';

interface TabDef {
  title: string;
  state: string;
  canDisableTab: boolean;
}

interface ReactPropsShape {
  tabs?: TabDef[];
  activeState?: string;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

export const AppointmentsTabScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const isTabActive = (tabState: string) => {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    if (tabState === 'app.appointmentstab.details') {
      return hash.includes('details') || (!hash.includes('viewappoitment') && !hash.includes('appointmentcalendar'));
    }
    if (tabState === 'app.appointmentstab.viewappoitment') {
      return hash.includes('viewappoitment');
    }
    if (tabState === 'app.appointmentstab.appointmentcalendardoctor') {
      return hash.includes('appointmentcalendar');
    }
    return false;
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, maxWidth: 1380, margin: '0 auto', padding: '16px 20px 0 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Appointments
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
            Outpatient scheduling, patient booking & slot management workstation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => dispatch('addNew')}
            title="Create New Appointment"
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
              transition: 'background 0.15s ease',
            }}
          >
            <i className="fas fa-plus" aria-hidden="true" style={{ fontSize: 11 }} />
            <span>New Appointment</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch('backtodashboard')}
            title="Back to Dashboard"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              width: 36,
              height: 36,
              background: '#ffffff',
              cursor: 'pointer',
              color: '#475569',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-home" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Modern Tab Strip */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '0 4px',
          borderRadius: '8px 8px 0 0',
        }}
      >
        {tabs.map((tab) => {
          const active = isTabActive(tab.state);
          return (
            <button
              key={tab.state}
              type="button"
              onClick={() => { if (!tab.canDisableTab) dispatch('switchTab', { state: tab.state }); }}
              disabled={tab.canDisableTab}
              style={{
                border: 'none',
                background: 'none',
                padding: '12px 18px',
                cursor: tab.canDisableTab ? 'not-allowed' : 'pointer',
                opacity: tab.canDisableTab ? 0.5 : 1,
                color: active ? '#2563eb' : '#64748b',
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                fontFamily: typography.fontFamily,
                borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
