import React from 'react';

interface Tab {
  title: string;
  state: string;
  canDisable?: boolean;
}

interface BillDiscountTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
    activeState?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): replaces the <uib-tabset> tab
// header in billdiscounttab.html. Same pattern as PaymodeTabScreen --
// active-tab highlighting is derived by comparing tab.state to
// $state.current.name, refreshed on $stateChangeSuccess (added to
// billdiscounttab.js) so nested-state navigation (via the native
// <div ui-view class="tabview">, left untouched below this mount) keeps
// the highlight in sync.
export const BillDiscountTabScreen: React.FC<BillDiscountTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const activeState = reactProps?.activeState;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <ul className="nav nav-tabs" id="assettabs">
      {tabs.map((tab) => (
        <li key={tab.state} className={activeState === tab.state ? 'active' : ''}>
          <a href="javascript:void(0)" onClick={() => !tab.canDisable && dispatch('switchTab', { state: tab.state })}>
            {tab.title}
          </a>
        </li>
      ))}
    </ul>
  );
};
