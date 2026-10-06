import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface ExecutableProcedureListFilterScreenProps {
  part: 'department' | 'status' | 'raisedfrom';
  reactProps?: {
    departmentId?: number;
    executableProcedureStatusId?: number;
    billsRaisedFromId?: number;
    departmentOptions?: LookupItem[];
    statusOptions?: LookupItem[];
    raisedFromOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the three <ui-select> filter dropdowns
// (Department, Status, Raised From) in executableprocedure-list.html,
// following the established ui-select -> plain <select> reimplementation
// pattern. The two real <div ui-grid> grids (toggled by
// currentfilter.BillsRaisedFromId != 3 / == 3) stay entirely native per
// the established real-ui-grid rule, as does the native <patientsearch>
// filter and the date-picker filter.
export const ExecutableProcedureListFilterScreen: React.FC<ExecutableProcedureListFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'department') {
    const options = reactProps?.departmentOptions || [];
    return (
      <select
        className="filter-combo form-control"
        value={reactProps?.departmentId ?? ''}
        onChange={(e) => dispatch('departmentChange', { value: e.target.value ? Number(e.target.value) : null })}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'status') {
    const options = reactProps?.statusOptions || [];
    return (
      <select
        className="filter-combo form-control"
        value={reactProps?.executableProcedureStatusId ?? ''}
        onChange={(e) => dispatch('statusChange', { value: e.target.value ? Number(e.target.value) : null })}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
        ))}
      </select>
    );
  }

  // part === 'raisedfrom'
  const options = reactProps?.raisedFromOptions || [];
  return (
    <select
      className="filter-combo form-control"
      value={reactProps?.billsRaisedFromId ?? ''}
      onChange={(e) => dispatch('raisedFromChange', { value: e.target.value ? Number(e.target.value) : null })}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
      ))}
    </select>
  );
};
