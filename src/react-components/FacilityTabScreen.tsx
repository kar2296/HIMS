import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { FacilityFormScreen } from './FacilityFormScreen';
import { FacilityDefaultServiceScreen } from './FacilityDefaultServiceScreen';
import { FacilityPreferenceSettingsScreen } from './FacilityPreferenceSettingsScreen';
import { BarcodeMasterSettingsComponent } from './BarcodeMasterSettingsComponent';

export interface FacilityTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface FacilityTabScreenProps {
  reactProps?: {
    facilityId?: number;
    facilityName?: string;
    activeState?: string;
    tabs?: FacilityTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const FacilityTabScreen: React.FC<FacilityTabScreenProps> = ({ reactProps, onAction }) => {
  const facilityId = reactProps?.facilityId ?? 0;
  const facilityName = reactProps?.facilityName ?? '';
  const initialActiveState = reactProps?.activeState || 'app.facilitytab.general';

  const defaultTabs: FacilityTabDef[] = [
    { title: 'General', state: 'app.facilitytab.general', canDisable: false, icon: 'fa-hospital' },
    { title: 'Default Service', state: 'app.facilitytab.defaultservice', canDisable: facilityId === 0, icon: 'fa-concierge-bell' },
    { title: 'General Setting', state: 'app.facilitytab.printsetting', canDisable: facilityId === 0, icon: 'fa-cog' },
    { title: 'SMS', state: 'app.facilitytab.smssettings', canDisable: facilityId === 0, icon: 'fa-comment-alt' },
    { title: 'Billing Setting', state: 'app.facilitytab.billsetting', canDisable: facilityId === 0, icon: 'fa-file-invoice-dollar' },
    { title: 'Auto Generation Code', state: 'app.facilitytab.autogeneratecodesetting', canDisable: facilityId === 0, icon: 'fa-barcode' },
    { title: 'Barcode Master Setting', state: 'app.facilitytab.barcodesetting', canDisable: facilityId === 0, icon: 'fa-qrcode' }
  ];

  const tabs = reactProps?.tabs?.length ? reactProps.tabs : defaultTabs;

  const [currentTabState, setCurrentTabState] = useState<string>(initialActiveState);

  useEffect(() => {
    if (reactProps?.activeState) {
      setCurrentTabState(reactProps.activeState);
    }
  }, [reactProps?.activeState]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleTabClick = (tab: FacilityTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);
    dispatch('switchTab', { tab, state: tab.state });
  };

  const renderActiveTabContent = () => {
    switch (currentTabState) {
      case 'app.facilitytab.general':
        return (
          <FacilityFormScreen
            reactProps={{ facilityId, facilityName }}
            onAction={onAction}
          />
        );

      case 'app.facilitytab.defaultservice':
        return (
          <FacilityDefaultServiceScreen
            facilityId={facilityId}
            onAction={onAction}
          />
        );

      case 'app.facilitytab.printsetting':
        return (
          <FacilityPreferenceSettingsScreen
            category="print"
            facilityId={facilityId}
            title="General & Print Settings"
            subtitle="Configure default print options, headers, footers, and display rules."
          />
        );

      case 'app.facilitytab.smssettings':
        return (
          <FacilityPreferenceSettingsScreen
            category="SMS"
            facilityId={facilityId}
            title="SMS Settings"
            subtitle="Configure SMS notifications, templates, and gateway trigger rules."
          />
        );

      case 'app.facilitytab.billsetting':
        return (
          <FacilityPreferenceSettingsScreen
            category="billing"
            facilityId={facilityId}
            title="Billing Settings"
            subtitle="Configure cashier workflows, discount approvals, invoice series, and roundoffs."
          />
        );

      case 'app.facilitytab.autogeneratecodesetting':
        return (
          <FacilityPreferenceSettingsScreen
            category="autogenerationcode"
            facilityId={facilityId}
            title="Auto Code Generation Settings"
            subtitle="Configure automatic numbering sequences for visits, patients, bills, and orders."
          />
        );

      case 'app.facilitytab.barcodesetting':
        return (
          <div style={{ marginTop: spacing.sm }}>
            <BarcodeMasterSettingsComponent />
          </div>
        );

      default:
        return (
          <FacilityFormScreen
            reactProps={{ facilityId, facilityName }}
            onAction={onAction}
          />
        );
    }
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, marginBottom: spacing.md }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.sm} 0 ${spacing.md}`,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            title="Back to Facilities list"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textBody,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceMuted)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <i className="fa fa-arrow-left" aria-hidden="true" style={{ fontSize: 11 }} />
            <span>Facilities</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: colors.textMain,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs
              }}
            >
              <i className="fa fa-hospital-o" style={{ color: colors.primary, fontSize: 18 }} />
              <span>Facility Management</span>
            </h3>
            {facilityName && (
              <span
                style={{
                  background: colors.primaryLight,
                  color: colors.primary,
                  padding: '3px 10px',
                  borderRadius: radii.full,
                  fontSize: '12px',
                  fontWeight: 600,
                  marginLeft: spacing.xs
                }}
              >
                {facilityName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => {
              dispatch('addNew');
              setCurrentTabState('app.facilitytab.general');
            }}
            title="Add New Facility"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: colors.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: radii.md,
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
            }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>New Facility</span>
          </button>
        </div>
      </div>

      {/* Tabs strip */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          borderBottom: `2px solid ${colors.border}`,
          paddingTop: spacing.xs,
          marginBottom: spacing.lg,
          background: colors.surface
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentTabState === tab.state;
          const isDisabled = !!tab.canDisable;

          return (
            <button
              key={tab.state}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isDisabled
                  ? colors.textDisabled
                  : isActive
                  ? colors.primary
                  : colors.textMuted,
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
                marginBottom: '-2px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.45 : 1,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.color = colors.textMain;
                  e.currentTarget.style.borderBottom = `2px solid ${colors.borderStrong}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.borderBottom = '2px solid transparent';
                }
              }}
            >
              {tab.icon && <i className={`fa ${tab.icon}`} style={{ fontSize: 12 }} />}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Screen Content */}
      <div style={{ marginTop: spacing.md }}>
        {renderActiveTabContent()}
      </div>
    </div>
  );
};
