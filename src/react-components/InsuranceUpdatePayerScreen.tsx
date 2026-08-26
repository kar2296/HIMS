import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface InsuranceUpdatePayerScreenProps {
  reactProps?: {
    guarantorTypeId?: number;
    guarantorId?: number;
    guarantorTypeOptions?: LookupItem[];
    guarantorOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the two <ui-select> dropdowns
// (Payer Type / Payer Name) in insuranceupdateform.html, following the
// established ui-select -> plain <select> reimplementation pattern. The
// modal header, the static bill-info display row (plain {{ }}
// interpolation, no bespoke markup), and the Save button all stay native.
//
// CONFIRMED PRE-EXISTING QUIRKS reproduced as-is:
// - The Payer Type select's ng-change="" is a literal empty expression --
//   it does nothing. Changing Payer Type does NOT re-filter the Payer Name
//   list; both dropdowns are always populated from their own independent,
//   unfiltered lookup arrays (lookup.GuarantorType / lookup.Guarantor).
// - Both selects carry `required`, but saveItem() never checks form
//   validity before submitting -- required is decorative only.
export const InsuranceUpdatePayerScreen: React.FC<InsuranceUpdatePayerScreenProps> = ({ reactProps, onAction }) => {
  const guarantorTypeId = reactProps?.guarantorTypeId;
  const guarantorId = reactProps?.guarantorId;
  const guarantorTypeOptions = reactProps?.guarantorTypeOptions || [];
  const guarantorOptions = reactProps?.guarantorOptions || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="row">
      <div className="col-sm-6">
        <div className="form-group">
          <label className="col-sm-12 control-label">Payer Type</label>
          <div className="col-sm-8">
            <select
              className="filter-combo form-control"
              value={guarantorTypeId ?? ''}
              onChange={(e) => dispatch('guarantorTypeChange', { value: e.target.value ? Number(e.target.value) : null })}
            >
              <option value=""></option>
              {guarantorTypeOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="col-sm-6">
        <div className="form-group">
          <label className="col-sm-12 control-label">Payer Name</label>
          <div className="col-sm-8">
            <select
              className="filter-combo form-control"
              value={guarantorId ?? ''}
              onChange={(e) => dispatch('guarantorChange', { value: e.target.value ? Number(e.target.value) : null })}
            >
              <option value=""></option>
              {guarantorOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
