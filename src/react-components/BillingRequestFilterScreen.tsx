import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface BillingRequestFilterScreenProps {
  part: 'requesttype' | 'status';
  reactProps?: {
    billingRequestTypeId?: number;
    billingRequestStatusId?: number;
    requestTypeOptions?: LookupItem[];
    statusOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the two <ui-select> filters (Request
// Type, Status) in billingrequestlist.html, following the established
// ui-select -> plain <select> pattern. Neither original select had an
// ng-change - selecting a value only takes effect once the native "Fetch"
// button (ng-click="getList()") is clicked, same as here. The original's
// `ng-keyup="moveHeaderFocus('doctorid')"` called a function never defined
// anywhere (global or local) - already dead in the original, not
// reproduced.
export const BillingRequestFilterScreen: React.FC<BillingRequestFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'requesttype') {
    const options = reactProps?.requestTypeOptions || [];
    return (
      <select
        className="filter-combo form-control"
        value={reactProps?.billingRequestTypeId ?? ''}
        onChange={(e) => dispatch('requestTypeChange', { value: e.target.value ? Number(e.target.value) : null })}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
        ))}
      </select>
    );
  }

  const options = reactProps?.statusOptions || [];
  return (
    <select
      className="filter-combo form-control"
      value={reactProps?.billingRequestStatusId ?? ''}
      onChange={(e) => dispatch('statusChange', { value: e.target.value ? Number(e.target.value) : null })}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
      ))}
    </select>
  );
};
