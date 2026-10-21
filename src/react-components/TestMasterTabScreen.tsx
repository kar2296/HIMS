import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface TestMasterTabDef {
  title: string;
  state: string;
  canDisable?: boolean;
  icon?: string;
  badge?: string;
}

export interface TestMasterTabScreenProps {
  reactProps?: {
    id?: number;
    testName?: string;
    testCode?: string;
    activeState?: string;
    tabs?: TestMasterTabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const TestMasterTabScreen: React.FC<TestMasterTabScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const testId = reactProps?.id ?? 0;
  const testName = reactProps?.testName || '';
  const testCode = reactProps?.testCode || '';
  const initialActiveState = reactProps?.activeState || 'app.testmastertab.testmaster';

  const isNew = testId === 0 || testId === -1;

  const defaultTabs: TestMasterTabDef[] = [
    {
      title: 'General Test Master',
      state: 'app.testmastertab.testmaster',
      canDisable: false,
      icon: 'fa-flask-vial',
    },
    {
      title: 'Test Analyte Mapping',
      state: 'app.testmastertab.testmasteranalytemaps',
      canDisable: isNew,
      icon: 'fa-sitemap',
    },
    {
      title: 'Bill of Materials (BOM)',
      state: 'app.testmastertab.testbommasters',
      canDisable: isNew,
      icon: 'fa-boxes-stacked',
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

  const handleTabClick = (tab: TestMasterTabDef) => {
    if (tab.canDisable) return;
    setCurrentTabState(tab.state);
    if (onAction) {
      dispatch('switchTab', { tab, state: tab.state });
    } else {
      window.location.hash = `#/app/testmastertab/${testId}/${tab.state.replace('app.testmastertab.', '')}`;
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      dispatch('addNew');
    } else {
      window.location.hash = '#/app/testmastertab/0/testmaster';
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      dispatch('backToList');
    } else {
      window.location.hash = '#/app/testmasters';
    }
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        marginBottom: spacing.md,
      }}
    >
      {/* ── Top Header Card ── */}
      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: radii.xl,
          padding: '16px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: radii.lg,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.28)',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-flask" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: '-0.02em',
                }}
              >
                Test Master
              </h2>

              {!isNew ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 12px',
                    borderRadius: radii.full,
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0284c7',
                  }}
                >
                  <i className="fa-solid fa-hashtag" style={{ fontSize: '10px' }} />
                  <span>{testCode ? `${testCode} • ` : ''}{testName || `Test #${testId}`}</span>
                </div>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 12px',
                    borderRadius: radii.full,
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#059669',
                  }}
                >
                  <i className="fa-solid fa-sparkles" style={{ fontSize: '10px' }} />
                  New Test Setup
                </span>
              )}
            </div>

            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: colors.textMuted }}>
              Laboratory diagnostic investigation master & parameter mapping configuration
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: '#f8fafc',
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = colors.borderStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '12px' }} />
            <span>Back to Catalog</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            title="Create New Laboratory Test"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.35)';
            }}
          >
            <i className="fa-solid fa-plus" />
            <span>Add New Test</span>
          </button>
        </div>
      </div>

      {/* ── Modern Tabs Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          background: '#ffffff',
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          padding: '4px 6px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = currentTabState === tab.state || (idx === 0 && currentTabState.endsWith('.testmaster'));
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
                gap: '8px',
                padding: '9px 16px',
                borderRadius: radii.md,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isDisabled
                  ? colors.textDisabled
                  : isActive
                  ? '#0284c7'
                  : colors.textSecondary,
                backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = colors.textMain;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              {tab.icon && <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '13px' }} />}
              <span>{tab.title}</span>
              {isDisabled && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                    padding: '2px 6px',
                    borderRadius: radii.full,
                  }}
                >
                  Save test first
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TestMasterTabScreen;
