import React from 'react';
import { PageHeader } from '../components/ui/Breadcrumb';
import { colors, spacing, typography } from '../components/ui/tokens';

interface TabDef {
  title: string;
  state: string;
  canDisable: boolean;
}

interface BillingReportsTabScreenProps {
  reactProps?: {
    tabs?: TabDef[];
    currentState?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (Billing / Billing Reports tab hub,
// app.billingreportstab, BillingReportTabController). Confirmed LIVE via
// the real app.billingreportstab hub already traced from the billing
// dashboard earlier in this migration effort; its 5 children
// (opinvoicebillingreport/ipinvoicebillingreport/masterbillingreport/
// revenuereport/surgerybillingreport) are real child states of this hub.
//
// This component only re-skins the tab bar and header -- the nested
// child screen itself is rendered by AngularJS ui-router into the real
// <div ui-view> below (left untouched, native markup), since ui-router
// remains authoritative for routing/nested-view rendering throughout
// this migration. Each child screen will get its own React migration in
// a later batch; until then it continues to render as AngularJS content
// inside this same ui-view exactly as it does today.
//
// Confirmed pre-existing bug, reproduced exactly (not "fixed"): the
// first tab's title is looked up via
// $translate.instant('reports.billingivoice.lbl ') -- note the trailing
// space baked into the translation key itself, which does not match the
// real key (reports.billingivoice.lbl, no trailing space). Since the
// app's $translateProvider has no missingTranslationHandler configured,
// this tab's real label on the live app today is the literal raw string
// "reports.billingivoice.lbl " (with trailing space), not "Collection
// Reports For OP/IP". Reproduced verbatim via the tabs array passed in
// from the bridge (which mirrors the real $translate.instant() calls
// exactly, typo included) rather than substituting the "intended" label.
//
// Minor bridge-only addition (not a business-logic change): the active
// tab is highlighted by comparing reactProps.currentState
// ($state.current.name) against each tab's target state. The real
// uib-tabset's own "active" binding pointed at an undefined $scope.active
// variable that was never set anywhere in the real controller, so this
// is a small visual clarity improvement within the UI-modernization
// scope of this retrofit, not a reproduction of a specific real binding.
export const BillingReportsTabScreen: React.FC<BillingReportsTabScreenProps> = ({ reactProps, onAction }) => {
  const { tabs = [], currentState = '' } = reactProps || {};

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 0` }}>
      <PageHeader
        title="Billing Reports"
        actions={
          <span
            style={{ cursor: 'pointer', color: colors.primary }}
            title="Dashboard"
            onClick={() => dispatch('addNew')}
          >
            <i className="fas fa-home" aria-hidden="true" />
          </span>
        }
      />
      <div style={{ display: 'flex', gap: spacing.xs, borderBottom: `1px solid ${colors.border}`, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = tab.state === currentState;
          return (
            <button
              key={tab.state}
              type="button"
              disabled={tab.canDisable}
              onClick={() => dispatch('switchTab', tab)}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                border: 'none',
                borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
                background: 'transparent',
                cursor: tab.canDisable ? 'not-allowed' : 'pointer',
                opacity: tab.canDisable ? 0.5 : 1,
                fontFamily: typography.fontFamily,
                ...typography.body,
                color: isActive ? colors.primary : colors.textMain,
                fontWeight: isActive ? 600 : 400,
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
