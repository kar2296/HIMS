interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP Encounter "Apply Discount" modal.
 *
 * Replaces the single <ui-select> for Discount Mode
 * (currentcontext.DiscountModeId).
 *
 * CONFIRMED PRE-EXISTING BUGS, reproduced not fixed (grepped the whole
 * controller, neither is defined anywhere):
 *  - ng-change="BillDiscountModechange($select.selected)" calls a
 *    function that does not exist -- selecting a mode would throw in
 *    the original. Not reproduced; only the ng-model equivalent
 *    (updating currentcontext.DiscountModeId) is dispatched.
 *  - ng-disabled="currentcontext.RdoBillDiscountMode" reads a scope
 *    property that is never assigned anywhere in this controller, so
 *    the original select is always enabled in practice. Reproduced
 *    as-is (the disabled prop always evaluates false today).
 */
export function DiscountFormModeScreen({ reactProps, onAction }: Props) {
  const options = reactProps?.discountModeOptions || [];
  return (
    <select
      className="form-control"
      name="headerdiscountmode"
      disabled={!!reactProps?.rdoBillDiscountMode}
      value={reactProps?.discountModeId ?? ''}
      onChange={(e) => onAction('discountModeChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
