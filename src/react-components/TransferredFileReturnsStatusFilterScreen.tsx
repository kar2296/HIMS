interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > Transferred File Returns list filter.
 *
 * Replaces the single <ui-select> for the status filter
 * (currentfilter.MRDIPFileStatusId, ng-change="getList()"). No
 * ng-disabled in the original. Same array-default quirk as the sibling
 * ipmrdfiletransfer-list screen (default filter value is [5, 7], which
 * never matches a single <option>).
 */
export function TransferredFileReturnsStatusFilterScreen({ reactProps, onAction }: Props) {
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
