import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

export interface TemplateScreenTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface TemplateScreenTabProps {
  reactProps?: {
    id?: number;
    name?: string;
    activeState?: string;
    tabs?: TemplateScreenTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const TemplateScreenTab: React.FC<TemplateScreenTabProps> = ({
  reactProps,
  onAction,
}) => {
  const templateId = reactProps?.id ?? 0;
  const templateName = reactProps?.name || '';
  const initialActiveState = reactProps?.activeState || 'app.templatescreentab.templatescreen';
  const isNew = templateId === 0 || templateId === -1;

  const defaultTabs: TemplateScreenTabDef[] = [
    {
      title: 'Manage Profiles',
      state: 'app.templatescreentab.templatescreen',
      canDisable: false,
      icon: 'fa-id-card',
    },
    {
      title: 'Profile Sections',
      state: 'app.templatescreentab.templatescreensection',
      canDisable: isNew,
      icon: 'fa-layer-group',
    },
    {
      title: 'Profile Users',
      state: 'app.templatescreentab.templatescreenusers',
      canDisable: isNew,
      icon: 'fa-user-nurse',
    },
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

  const handleTabClick = (tab: TemplateScreenTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);
    dispatch('switchTab', { tab, state: tab.state });
  };

  const handleAddNew = () => {
    dispatch('addNew');
  };

  const handleBackToList = () => {
    dispatch('backToList');
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        margin: '0 auto',
        padding: '0 4px',
        marginBottom: spacing.md,
      }}
    >
      {/* ── Top Header Card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.lg}`,
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fas fa-columns" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: -0.3,
                }}
              >
                Manage Template Screen
              </h2>
              {templateName && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#e0f2fe',
                    color: '#0369a1',
                  }}
                >
                  {templateName}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Clinical form templates, sections, and assigned users
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleAddNew}
            title="Add New Profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <i className="fa fa-plus" />
            <span>Add New</span>
          </button>

          <button
            type="button"
            onClick={handleBackToList}
            title="Back to List"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.textMain,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-arrow-left" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: spacing.md,
          background: '#ffffff',
          padding: '4px 8px 0',
          borderRadius: `${radii.lg}px ${radii.lg}px 0 0`,
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentTabState === tab.state || currentTabState.endsWith(tab.state);
          const isDisabled = Boolean(tab.canDisable);

          return (
            <button
              key={tab.state}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                background: 'transparent',
                color: isDisabled ? '#94a3b8' : isActive ? '#2563eb' : colors.textMain,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                opacity: isDisabled ? 0.6 : 1,
              }}
            >
              {tab.icon && <i className={`fas ${tab.icon}`} />}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
