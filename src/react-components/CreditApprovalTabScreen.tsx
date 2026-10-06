import React, { useState } from 'react';

interface Tab {
  title: string;
  state: string;
  billtype: number;
}

interface CreditApprovalTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): replaces the <uib-tabset> tab
// header in creditapprovaltab.html. Unlike PaymodeTabScreen/
// BillDiscountTabScreen, all 3 tabs here route to the SAME state
// ('app.creditapprovaltab.creditapproval') with a different `billtype`
// param -- $state.current.name can never distinguish them. The original
// AngularUI Bootstrap <uib-tabset active="active"> never had $scope.active
// wired up either, so its active-highlight was already purely
// click-driven (index-based), decoupled from the route. Reproduced here
// with the same semantics: a local useState<number> defaulting to 0
// (matching switchTab($scope.tabs[0]) called unconditionally on init).
export const CreditApprovalTabScreen: React.FC<CreditApprovalTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const click = (tab: Tab, idx: number) => {
    setActiveIndex(idx);
    dispatch('switchTab', { state: tab.state, billtype: tab.billtype });
  };

  return (
    <ul className="nav nav-tabs" id="assettabs">
      {tabs.map((tab, idx) => (
        <li key={idx} className={activeIndex === idx ? 'active' : ''}>
          <a href="javascript:void(0)" onClick={() => click(tab, idx)}>
            {tab.title}
          </a>
        </li>
      ))}
    </ul>
  );
};
