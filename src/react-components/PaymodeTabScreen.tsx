import React from 'react';

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

// React bridge migration (single mount, header only). This is a pure
// ui-router tab-switcher shell (paymodeTabController) whose only job is
// $state.go() navigation between the three payment-mode-change child
// states (app.paymodechange.tabadvrept/.tabop/.tabpharmacy). Per the
// standing rule that ui-router stays authoritative for routing, the
// <div ui-view> that renders the active child state's own
// (separately-migrated) screen is left untouched -- only the uib-tabset
// header buttons are replaced with this React mount, dispatching
// 'switchTab' with the target state name exactly like the original
// ng-click="switchTab(tab)".
export const PaymodeTabScreen: React.FC<PaymodeTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const activeState = reactProps?.activeState;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <ul className="nav nav-tabs" id="assettabs">
      {tabs.map((tab) => (
        <li key={tab.state} className={activeState === tab.state ? 'active' : ''}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!tab.canDisable) {
                dispatch('switchTab', { state: tab.state });
              }
            }}
          >
            {tab.title}
          </a>
        </li>
      ))}
    </ul>
  );
};
