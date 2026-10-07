import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { UserFormScreen } from './UserFormScreen';
import type { UserItem } from './UserFormScreen';

export interface UserTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface UserTabScreenProps {
  reactProps?: {
    userId?: number;
    userName?: string;
    activeState?: string;
    tabs?: UserTabDef[];
    item?: UserItem;
    lookup?: Record<string, Array<{ Id: number; Text: string; [key: string]: any }>>;
    photoBase64?: string;
    signBase64?: string;
    isSaving?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const UserTabScreen: React.FC<UserTabScreenProps> = ({
  reactProps,
  onAction
}) => {
  const userId = reactProps?.userId ?? reactProps?.item?.Id ?? 0;
  const initialActiveState = reactProps?.activeState || 'app.usertab.general';

  const defaultTabs: UserTabDef[] = [
    {
      title: 'General',
      state: 'app.usertab.general',
      canDisable: false,
      icon: 'fa-user'
    },
    {
      title: 'User Hospital Map',
      state: 'app.usertab.userfacilitymap',
      canDisable: userId === 0,
      icon: 'fa-hospital'
    },
    {
      title: 'Doctor Consultation Charges',
      state: 'app.usertab.consultationservice',
      canDisable: userId === 0,
      icon: 'fa-file-invoice-dollar'
    }
  ];

  const tabs = reactProps?.tabs?.length ? reactProps.tabs : defaultTabs;
  const [currentTabState, setCurrentTabState] = useState<string>(initialActiveState);

  useEffect(() => {
    if (reactProps?.activeState) {
      setCurrentTabState(reactProps.activeState);
    }
  }, [reactProps?.activeState]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const handleTabClick = (tab: UserTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);
    dispatch('switchTab', { tab, state: tab.state });
  };

  const handleAddNew = () => {
    setCurrentTabState('app.usertab.general');
    dispatch('addNew');
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: colors.surfaceSunken,
        minHeight: '100vh',
        padding: `${spacing.lg} ${spacing.xl}`
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: colors.textMain,
              letterSpacing: '-0.3px'
            }}
          >
            Manage Users and Doctors
          </h2>
          {userId > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.primary,
                backgroundColor: colors.primaryLight,
                padding: '2px 8px',
                borderRadius: radii.full
              }}
            >
              ID #{userId}
            </span>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={handleAddNew}
            title="Add New User"
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              backgroundColor: colors.primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <i className="fa fa-plus" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: spacing.xs,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: spacing.lg,
          backgroundColor: '#fff',
          borderRadius: `${radii.lg} ${radii.lg} 0 0`,
          padding: `0 ${spacing.md}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = currentTabState === tab.state;
          const isDisabled = !!tab.canDisable;

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: `${spacing.md} ${spacing.lg}`,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isDisabled
                  ? colors.textDisabled
                  : isActive
                  ? colors.primary
                  : colors.textMuted,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              {tab.icon && <i className={`fa ${tab.icon}`} style={{ fontSize: 12 }} />}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {currentTabState === 'app.usertab.general' && (
          <UserFormScreen reactProps={reactProps} onAction={onAction} />
        )}

        {currentTabState === 'app.usertab.userfacilitymap' && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.lg,
              border: `1px solid ${colors.border}`,
              padding: spacing.xl,
              textAlign: 'center',
              color: colors.textMuted
            }}
          >
            <i className="fa fa-hospital fa-3x" style={{ color: colors.primary, marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: colors.textMain }}>User Hospital Map</h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              Map user privileges and access permissions across affiliated hospital facilities.
            </p>
          </div>
        )}

        {currentTabState === 'app.usertab.consultationservice' && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.lg,
              border: `1px solid ${colors.border}`,
              padding: spacing.xl,
              textAlign: 'center',
              color: colors.textMuted
            }}
          >
            <i className="fa fa-file-invoice-dollar fa-3x" style={{ color: colors.primary, marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: colors.textMain }}>Doctor Consultation Charges</h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              Configure outpatient & inpatient consultation charges, follow-up durations, and tariffs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTabScreen;
