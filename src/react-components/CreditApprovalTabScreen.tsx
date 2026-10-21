import React, { useState } from 'react';

interface Tab {
  title: string;
  state: string;
  billtype: number;
}

interface CreditApprovalTabScreenProps {
  reactProps?: {
    tabs?: Tab[];
    activeBillTypeId?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const CreditApprovalTabScreen: React.FC<CreditApprovalTabScreenProps> = ({ reactProps, onAction }) => {
  const tabs = reactProps?.tabs || [];
  const activeBillTypeId = reactProps?.activeBillTypeId;
  const computedIndex = activeBillTypeId != null
    ? Math.max(0, tabs.findIndex((t) => t.billtype === Number(activeBillTypeId)))
    : 0;
  const [activeIndex, setActiveIndex] = useState(computedIndex);

  React.useEffect(() => {
    if (activeBillTypeId != null) {
      const idx = tabs.findIndex((t) => t.billtype === Number(activeBillTypeId));
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [activeBillTypeId, tabs]);

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
