/**
 * Claim Management > Dispatch Detail modal.
 *
 * Replaces the single <ui-select> for "Dispatched By" (item.DispatchedById).
 * The original markup has ng-disabled="true" hardcoded, so this field is
 * always a read-only display of the current user (pre-set by the controller
 * to utl.Session.getCurrentUserId()) -- reproduced exactly, not made editable.
 */
export function DispatchDetailFormScreen({ reactProps }: { reactProps: any }) {
  const lookup = reactProps?.dispatchedByOptions || [];
  const selectedId = reactProps?.dispatchedById;
  const selected = lookup.find((o: any) => o.Id === selectedId);

  return (
    <select className="filter-combo form-control" disabled value={selectedId ?? ''} onChange={() => {}}>
      {!selected && <option value="">&nbsp;</option>}
      {lookup.map((opt: any) => (
        <option key={opt.Id} value={opt.Id}>
          {opt.Title && opt.Title.Description ? `${opt.Title.Description} ` : ''}
          {opt.Text}
        </option>
      ))}
    </select>
  );
}
