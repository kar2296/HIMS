import React from 'react';

interface Tab {
  title: string;
  state: string;
  canDisable?: boolean;
}

interface PatientFinanceTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
    activeState?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount): replaces the <uib-tabset> tab
// header in patientfinancetab.html. Same pattern as PaymodeTabScreen /
// BillDiscountTabScreen -- the 2 tabs route to 2 distinct states
// (app.patientfinancetab.patientadjustmentinfo /
// app.patientfinancetab.patientrevenueinfo), so active-highlight is
// derived by comparing tab.state to $state.current.name, refreshed on
// $stateChangeSuccess (added to patientfinancetab.js via $scope.$on,
// since $rootScope isn't injected into this controller -- $scope.$on
// still receives it because $stateChangeSuccess is $broadcast from
// $rootScope down through all child scopes). Native <div ui-view> stays
// untouched below.
export const PatientFinanceTabScreen: React.FC<PatientFinanceTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const activeState = reactProps?.activeState;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <ul className="nav nav-tabs">
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
