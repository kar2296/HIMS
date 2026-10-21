import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

export interface OrganismTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
}

export interface OrganismTabScreenProps {
  reactProps?: {
    id?: number;
    organismName?: string;
    activeState?: string;
    tabs?: OrganismTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OrganismTabScreen: React.FC<OrganismTabScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const organismId = reactProps?.id ?? 0;
  const organismName = reactProps?.organismName || '';
  const initialActiveState = reactProps?.activeState || 'app.organismtab.orgisolted-form';
  const isNew = organismId === 0 || organismId === -1;

  const defaultTabs: OrganismTabDef[] = [
    {
      title: 'Organism Details',
      state: 'app.organismtab.orgisolted-form',
      canDisable: false,
      icon: 'fa-bacterium',
    },
    {
      title: 'Antibiotic Mapping',
      state: 'app.organismtab.antibioticorganismmap',
      canDisable: isNew,
      icon: 'fa-capsules',
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

  const handleTabClick = (tab: OrganismTabDef) => {
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
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
            }}
          >
            <i className="fas fa-bacterium" />
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
                Manage Organism Isolation
              </h2>
              {organismName && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  {organismName}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Microbiology organism configuration & antibiotic susceptibility panel
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleAddNew}
            title="Add New Organism"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
            }}
          >
            <i className="fa fa-plus" />
            <span>Add New</span>
          </button>

          <button
            type="button"
            onClick={handleBackToList}
            title="Back to Organisms"
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
            <span>Back to List</span>
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
                borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                background: 'transparent',
                color: isDisabled ? '#94a3b8' : isActive ? '#059669' : colors.textMain,
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
