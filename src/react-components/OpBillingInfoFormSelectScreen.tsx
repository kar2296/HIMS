type Part = 'priority' | 'guarantortype' | 'doctorname' | 'department' | 'tolocation';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > opbillinginfo-form (OP Billing Info master) -- 5 structurally
 * identical <ui-select> fields (Priority, Guarantor Type, Doctor Name,
 * Department, Order To Location), none with ng-change/ng-disabled.
 *
 * NOTE (pre-existing, out of scope for this conversion): this
 * controller's initLookup() only ever requests the "Facility" lookup
 * key -- it never fetches Priority/GuarantorType/DoctorName/Department/
 * ToLocation. So lookup.Priority etc. are always undefined today and
 * every one of these 5 dropdowns already renders with zero options in
 * production. Reproduced as-is: each part's options array is simply
 * empty, matching current behavior exactly (not a regression introduced
 * by this migration).
 */
export function OpBillingInfoFormSelectScreen({ part, reactProps, onAction }: Props) {
  const config: Record<Part, { optionsKey: string; actionType: string; valueKey: string }> = {
    priority: { optionsKey: 'priorityOptions', actionType: 'priorityChange', valueKey: 'priorityId' },
    guarantortype: { optionsKey: 'guarantorTypeOptions', actionType: 'guarantorTypeChange', valueKey: 'guarantorTypeId' },
    doctorname: { optionsKey: 'doctorNameOptions', actionType: 'doctorNameChange', valueKey: 'doctorNameId' },
    department: { optionsKey: 'departmentOptions', actionType: 'departmentChange', valueKey: 'departmentId' },
    tolocation: { optionsKey: 'toLocationOptions', actionType: 'toLocationChange', valueKey: 'toLocationId' },
  };
  const { optionsKey, actionType, valueKey } = config[part];
  const options = reactProps?.[optionsKey] || [];

  return (
    <select
      className="form-control"
      value={reactProps?.[valueKey] ?? ''}
      onChange={(e) => onAction(actionType, { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
