interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP Estimate "Estimate Bill Discount" modal.
 *
 * Replaces the single <ui-select> for the Discount Mode field
 * (currentcontext.DiscountModeId, ng-change="DiscountChange()"). No
 * ng-disabled in the original, so this field is always editable.
 *
 * The original ui-select-match truncates the selected option's text to
 * 20 characters with a trailing "..." -- not reproduced here, consistent
 * with every other ui-select conversion this session (plain <option>
 * text, no truncation logic reproduced).
 */
export function EstimateBillDiscountModeScreen({ reactProps, onAction }: Props) {
  const options = reactProps?.discountModeOptions || [];
  return (
    <select
      className="form-control"
      name="headerdiscountmode"
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
