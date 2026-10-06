import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface IpBillListServiceCategoryScreenProps {
  reactProps?: {
    serviceCategoryId?: number;
    serviceCategoryOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the single <ui-select> Service
// Category filter in ipbilllist.html (the IP-bill-loading picker used by
// e.g. opclearance-form's "Load Bill" workflow), following the
// established ui-select -> plain <select> pattern. Selecting a value
// dispatches getDetails() immediately, matching the original's
// ng-change="getDetails()".
export const IpBillListServiceCategoryScreen: React.FC<IpBillListServiceCategoryScreenProps> = ({ reactProps, onAction }) => {
  const options = reactProps?.serviceCategoryOptions || [];

  return (
    <select
      className="filter-combo form-control"
      value={reactProps?.serviceCategoryId ?? ''}
      onChange={(e) => onAction?.('serviceCategoryChange', { value: e.target.value ? Number(e.target.value) : null })}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
      ))}
    </select>
  );
};
