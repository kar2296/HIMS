import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { RoleFormScreen } from './RoleFormScreen';
import { RoleFacilityMapScreen } from './RoleFacilityMapScreen';
import { RolePrivilegeListScreen } from './RolePrivilegeListScreen';
import { RoleMobileConfigScreen } from './RoleMobileConfigScreen';
import { apiFetch } from './utils/api';

export interface RoleTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface RoleTabScreenProps {
  reactProps?: {
    roleId?: number;
    roleName?: string;
    roleCode?: string;
    activeState?: string;
    tabs?: RoleTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const RoleTabScreen: React.FC<RoleTabScreenProps> = ({ reactProps, onAction }) => {
  // Extract roleId from reactProps or window hash/path
  const parseRoleId = (): number => {
    if (reactProps?.roleId !== undefined) return reactProps.roleId;
    const hash = window.location.hash;
    const match = hash.match(/#\/app\/role\/(\d+)/);
    if (match && match[1]) return parseInt(match[1], 10);
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/app\/role\/(\d+)/);
    if (pathMatch && pathMatch[1]) return parseInt(pathMatch[1], 10);
    return 0;
  };

  const [roleId, setRoleId] = useState<number>(parseRoleId());
  const [roleName, setRoleName] = useState<string>(reactProps?.roleName || '');
  const [roleCode, setRoleCode] = useState<string>(reactProps?.roleCode || '');

  // Determine initial active state
  const parseInitialState = (): string => {
    if (reactProps?.activeState) return reactProps.activeState;
    const hash = window.location.hash;
    if (hash.includes('/facilities')) return 'app.roletab.facility';
    if (hash.includes('/roleprivileges')) return 'app.roletab.roleprivileges';
    if (hash.includes('/mobileappconfig')) return 'app.roletab.mobileappconfig';
    return 'app.roletab.general';
  };

  const [currentTabState, setCurrentTabState] = useState<string>(parseInitialState());

  const canDisableTabs = roleId === 0;

  const defaultTabs: RoleTabDef[] = [
    { title: 'General', state: 'app.roletab.general', canDisable: false, icon: 'fa-id-card' },
    { title: 'Facilities', state: 'app.roletab.facility', canDisable: canDisableTabs, icon: 'fa-hospital' },
    { title: 'Special Privileges', state: 'app.roletab.roleprivileges', canDisable: canDisableTabs, icon: 'fa-key' },
    { title: 'Mobile Config', state: 'app.roletab.mobileappconfig', canDisable: canDisableTabs, icon: 'fa-mobile-alt' }
  ];

  const tabs = reactProps?.tabs?.length ? reactProps.tabs : defaultTabs;

  // Fetch basic role details for header badge if editing existing role
  useEffect(() => {
    if (roleId > 0 && !roleName) {
      let isMounted = true;
      apiFetch<any>('SystemSettings/role/GetRoleById', { Id: roleId })
        .then((res) => {
          if (isMounted && res) {
            const data = res.Data || res;
            if (data.RoleName) setRoleName(data.RoleName);
            if (data.RoleCode) setRoleCode(data.RoleCode);
          }
        })
        .catch((err) => console.error('Failed to fetch role summary:', err));

      return () => {
        isMounted = false;
      };
    }
  }, [roleId, roleName]);

  const handleTabClick = (tab: RoleTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);

    if (onAction) {
      onAction('switchTab', { tab, state: tab.state });
    }

    // Update URL hash for UI-router sync
    if (window.location.hash.startsWith('#/app')) {
      const stateSuffix = tab.state.replace('app.roletab.', '');
      const subpath = stateSuffix === 'facility' ? 'facilities' : stateSuffix;
      window.location.hash = `#/app/role/${roleId}/${subpath}`;
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      onAction('backToList');
      return;
    }
    if (window.location.hash.startsWith('#/app')) {
      window.location.hash = '#/app/roles';
    } else {
      window.location.href = '/app/roles';
    }
  };

  const handleRoleSaved = (newId: number) => {
    setRoleId(newId);
  };

  const renderActiveTabContent = () => {
    switch (currentTabState) {
      case 'app.roletab.general':
        return (
          <RoleFormScreen
            roleId={roleId}
            onAction={onAction}
            onSaved={handleRoleSaved}
          />
        );

      case 'app.roletab.facility':
        return (
          <RoleFacilityMapScreen
            roleId={roleId}
            roleName={roleName}
            onAction={onAction}
          />
        );

      case 'app.roletab.roleprivileges':
        return (
          <RolePrivilegeListScreen
            roleId={roleId}
            roleCode={roleCode}
            roleName={roleName}
            onAction={onAction}
          />
        );

      case 'app.roletab.mobileappconfig':
        return (
          <RoleMobileConfigScreen
            roleId={roleId}
            roleName={roleName}
            onAction={onAction}
          />
        );

      default:
        return (
          <RoleFormScreen
            roleId={roleId}
            onAction={onAction}
            onSaved={handleRoleSaved}
          />
        );
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        minHeight: '100%',
        padding: spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
    >
      {/* Top Breadcrumb & Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          backgroundColor: colors.background.secondary,
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              padding: '6px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.sm,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <i className="fa fa-angle-left" /> Back to Roles
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.semibold,
                  color: colors.text.primary
                }}
              >
                {roleId > 0 ? (roleName || `Role #${roleId}`) : 'Create New Role'}
              </h2>

              {roleId > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    backgroundColor: 'rgba(74, 144, 226, 0.12)',
                    color: colors.primary.main,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: typography.fontWeights.medium
                  }}
                >
                  ID: {roleId}
                </span>
              )}
            </div>

            <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, marginTop: 2 }}>
              System Settings &bull; Role Security Profile & Access Configuration
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: `2px solid ${colors.border.subtle}`,
          gap: spacing.xs,
          overflowX: 'auto',
          backgroundColor: colors.background.secondary,
          padding: `0 ${spacing.md}`,
          borderRadius: `${radii.md} ${radii.md} 0 0`
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentTabState === tab.state;
          const isDisabled = tab.canDisable;

          return (
            <button
              key={tab.state}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              title={isDisabled ? 'Save the role first to unlock additional tabs' : tab.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: '12px 18px',
                fontSize: typography.fontSizes.sm,
                fontWeight: isActive ? typography.fontWeights.semibold : typography.fontWeights.medium,
                color: isDisabled
                  ? colors.text.disabled
                  : isActive
                  ? colors.primary.main
                  : colors.text.secondary,
                border: 'none',
                borderBottom: `3px solid ${isActive ? colors.primary.main : 'transparent'}`,
                backgroundColor: 'transparent',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon && <i className={`fa ${tab.icon}`} />}
              {tab.title}
              {isDisabled && (
                <i className="fa fa-lock" style={{ fontSize: 10, marginLeft: 2, opacity: 0.6 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div
        style={{
          border: `1px solid ${colors.border.subtle}`,
          borderTop: 'none',
          borderRadius: `0 0 ${radii.md} ${radii.md}`,
          backgroundColor: colors.background.primary,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {renderActiveTabContent()}
      </div>
    </div>
  );
};
