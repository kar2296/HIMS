import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface OpBillingMoreFormScreenProps {
  part: 'discounttype' | 'performdoctor';
  reactProps?: {
    isEditable?: boolean;
    discountTypeId?: number;
    servPerformDoctorId?: number;
    discountTypeOptions?: LookupItem[];
    performingDoctorOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the two <ui-select> dropdowns
// (Discount Type, Perform Doctor) in opbilling-more.html, following the
// established ui-select -> plain <select> pattern. The two native
// <autosearch> widgets (Service Item, Doctor), the IsDoctorDiscount
// checkbox, the shared <commentscontrol>, and the Save button all stay
// native.
export const OpBillingMoreFormScreen: React.FC<OpBillingMoreFormScreenProps> = ({ part, reactProps, onAction }) => {
  const isEditable = !!reactProps?.isEditable;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'discounttype') {
    const options = reactProps?.discountTypeOptions || [];
    return (
      <select
        className="filter-combo form-control"
        disabled={!isEditable}
        value={reactProps?.discountTypeId ?? ''}
        onChange={(e) => dispatch('discountTypeChange', { value: e.target.value ? Number(e.target.value) : null })}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
        ))}
      </select>
    );
  }

  const options = reactProps?.performingDoctorOptions || [];
  return (
    <select
      className="filter-combo form-control"
      disabled={!isEditable}
      value={reactProps?.servPerformDoctorId ?? ''}
      onChange={(e) => dispatch('performDoctorChange', { value: e.target.value ? Number(e.target.value) : null })}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
      ))}
    </select>
  );
};
