import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { GroupFormScreen } from './GroupFormScreen';
import { GroupRoleMapScreen } from './GroupRoleMapScreen';
import { GroupFacilityMapScreen } from './GroupFacilityMapScreen';
import { apiFetch } from './utils/api';

export interface GroupTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface GroupTabScreenProps {
  reactProps?: {
    groupId?: number;
    groupName?: string;
    groupCode?: string;
    activeState?: string;
    tabs?: GroupTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const GroupTabScreen: React.FC<GroupTabScreenProps> = ({ reactProps, onAction }) => {
  // Extract groupId from reactProps or window hash/path
  const parseGroupId = (): number => {
    if (reactProps?.groupId !== undefined) return reactProps.groupId;
    const hash = window.location.hash;
    const match = hash.match(/#\/app\/group\/(\d+)/);
    if (match && match[1]) return parseInt(match[1], 10);
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/app\/group\/(\d+)/);
    if (pathMatch && pathMatch[1]) return parseInt(pathMatch[1], 10);
    return 0;
  };

  const [groupId, setGroupId] = useState<number>(parseGroupId());
  const [groupName, setGroupName] = useState<string>(reactProps?.groupName || '');
  const [groupCode, setGroupCode] = useState<string>(reactProps?.groupCode || '');

  // Determine initial active state
  const parseInitialState = (): string => {
    if (reactProps?.activeState) return reactProps.activeState;
    const hash = window.location.hash;
    if (hash.includes('/roles')) return 'app.grouptab.role';
    if (hash.includes('/facilities')) return 'app.grouptab.facility';
    return 'app.grouptab.general';
  };

  const [currentTabState, setCurrentTabState] = useState<string>(parseInitialState());

  const canDisableTabs = groupId === 0;

  const defaultTabs: GroupTabDef[] = [
    { title: 'General', state: 'app.grouptab.general', canDisable: false, icon: 'fa-id-badge' },
    { title: 'Role Mapping', state: 'app.grouptab.role', canDisable: canDisableTabs, icon: 'fa-user-tag' },
    { title: 'Facility Mapping', state: 'app.grouptab.facility', canDisable: canDisableTabs, icon: 'fa-hospital' }
  ];

  const tabs = reactProps?.tabs?.length ? reactProps.tabs : defaultTabs;

  // Fetch basic group details for header badge if editing existing group
  useEffect(() => {
    if (groupId > 0 && !groupName) {
      let isMounted = true;
      apiFetch<any>('SystemSettings/group/GetGroupById', { Id: groupId })
        .then((res) => {
          if (isMounted && res) {
            const data = res.Data || res;
            if (data.GroupName) setGroupName(data.GroupName);
            if (data.GroupCode) setGroupCode(data.GroupCode);
          }
        })
        .catch((err) => console.error('Failed to fetch group summary:', err));

      return () => {
        isMounted = false;
      };
    }
  }, [groupId, groupName]);

  const handleTabClick = (tab: GroupTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);

    if (onAction) {
      onAction('switchTab', { tab, state: tab.state });
    }

    // Update URL hash for UI-router sync
    if (window.location.hash.startsWith('#/app')) {
      const stateSuffix = tab.state.replace('app.grouptab.', '');
      const subpath = stateSuffix === 'role' ? 'roles' : (stateSuffix === 'facility' ? 'facilities' : stateSuffix);
      window.location.hash = `#/app/group/${groupId}/${subpath}`;
    }
  };

  const handleAddNew = () => {
    setGroupId(0);
    setGroupName('');
    setGroupCode('');
    setCurrentTabState('app.grouptab.general');

    if (onAction) {
      onAction('addNew');
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = '#/app/group/0/general';
      } else {
        window.location.href = '/app/group/0/general';
      }
    }
  };

  const handleBack = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = '#/app/groups';
      } else {
        window.location.href = '/app/groups';
      }
    }
  };

  const renderActiveTabContent = () => {
    switch (currentTabState) {
      case 'app.grouptab.role':
        return (
          <GroupRoleMapScreen
            groupId={groupId}
            reactProps={{ groupId, groupName }}
            onAction={onAction}
          />
        );
      case 'app.grouptab.facility':
        return (
          <GroupFacilityMapScreen
            groupId={groupId}
            reactProps={{ groupId, groupName }}
            onAction={onAction}
          />
        );
      case 'app.grouptab.general':
      default:
        return (
          <GroupFormScreen
            groupId={groupId}
            reactProps={{ groupId, groupName }}
            onAction={onAction}
            onSaved={(newId) => {
              setGroupId(newId);
            }}
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
      {/* Top Header Card */}
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
        {/* Left: Title & Group Metadata Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Back to Groups List"
          >
            <i className="fa fa-arrow-left" />
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
                {groupId > 0 ? (groupName || 'Edit Group') : 'New User Group'}
              </h2>

              {groupId > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    backgroundColor: 'rgba(74, 144, 226, 0.12)',
                    color: colors.primary.main,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: typography.fontWeights.semibold,
                    fontFamily: 'monospace'
                  }}
                >
                  {groupCode || `ID: ${groupId}`}
                </span>
              )}
            </div>

            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
              {groupId > 0
                ? 'Configure group properties, assigned roles, and facility access'
                : 'Define a new user group for classification and permission management'}
            </span>
          </div>
        </div>

        {/* Right: Add New Button */}
        <button
          type="button"
          onClick={handleAddNew}
          title="Create New Group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            padding: '6px 14px',
            borderRadius: radii.sm,
            backgroundColor: colors.primary.main,
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: typography.fontSizes.xs,
            fontWeight: typography.fontWeights.semibold,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'background-color 0.15s ease'
          }}
        >
          <i className="fa fa-plus" />
          <span>New Group</span>
        </button>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          borderBottom: `2px solid ${colors.border.subtle}`,
          paddingLeft: spacing.xs
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentTabState === tab.state;
          const isDisabled = Boolean(tab.canDisable);

          return (
            <button
              key={tab.state}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: `${spacing.sm} ${spacing.md}`,
                border: 'none',
                borderBottom: isActive ? `2px solid ${colors.primary.main}` : '2px solid transparent',
                marginBottom: -2,
                backgroundColor: 'transparent',
                color: isDisabled
                  ? colors.text.muted
                  : isActive
                  ? colors.primary.main
                  : colors.text.secondary,
                fontSize: typography.fontSizes.sm,
                fontWeight: isActive ? typography.fontWeights.semibold : typography.fontWeights.medium,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon && <i className={`fa ${tab.icon}`} style={{ fontSize: 13 }} />}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Screen Content */}
      <div>{renderActiveTabContent()}</div>
    </div>
  );
};
