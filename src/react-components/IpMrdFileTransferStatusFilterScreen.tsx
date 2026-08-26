interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > IP File Transfer list filter.
 *
 * Replaces the single <ui-select> for the status filter
 * (currentfilter.MRDIPFileStatusId, ng-change="getList()"). No
 * ng-disabled in the original.
 *
 * Note: the controller's default currentfilter.MRDIPFileStatusId is the
 * array [6, 7] (a multi-status filter used only for the initial
 * getList() query) -- that array never matches a single <option> value,
 * so this select (like the original ui-select bound to the same
 * ng-model) simply shows no selection until the user changes it. Not a
 * regression introduced here.
 */
export function IpMrdFileTransferStatusFilterScreen({ reactProps, onAction }: Props) {
  const options = reactProps?.statusOptions || [];
  return (
    <select
      className="filter-combo form-control"
      value={reactProps?.statusId ?? ''}
      onChange={(e) => onAction('statusChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
