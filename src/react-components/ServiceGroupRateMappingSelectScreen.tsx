interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * servicegroupratemapping modal: single Bed Type <ui-select>
 * (ng-model="item.BedTypeId", no ng-disabled/ng-change/ng-keyup in the
 * original -- a plain two-way-bound field with no side effects).
 */
export function ServiceGroupRateMappingSelectScreen({ reactProps, onAction }: Props) {
  const options = reactProps?.bedTypeOptions || [];
  return (
    <select
      className="form-control"
      value={reactProps?.bedTypeId ?? ''}
      onChange={(e) => onAction('bedTypeChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
