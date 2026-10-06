type Part = 'discountmodefooter' | 'discountapprover' | 'discountapproverplain';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * opbilling-list footer discount cluster: the footer "Discount Type"
 * select (currentfilter.DiscountModeId, ng-change="BillDiscountModechange")
 * and the conditional "Discount Approver" select
 * (currentcontext.DiscountApprovedBy, ng-change="setDiscountLimit").
 *
 * PRE-EXISTING QUIRK reproduced exactly, not fixed: 'discountmodefooter'
 * shares the SAME ng-model (currentfilter.DiscountModeId) as the header
 * "Discount Type" select rendered by OpBillingHeaderSelectScreen's
 * 'discountmodeheader' part -- two independent <ui-select> controls bound
 * to one scope value with two different ng-change handlers
 * (DiscountModechange() vs BillDiscountModechange($select.selected)) in
 * the original markup. Both are kept as separate mounts here, exactly as
 * the two original <ui-select> elements were separate.
 *
 * 'discountapprover' is only ever rendered by the caller inside the
 * original's ng-if="item.TotDiscAmount>0" wrapper (left native in the
 * HTML), so this component does not re-check that condition itself.
 * Its option rendering has a special case in the original
 * ui-select-choices template: lookupitem.Id==-1 renders bare Text, any
 * other id prefixes with "{Title.Description} " -- reproduced exactly.
 */
export function OpBillingDiscountApprovalScreen({ part, reactProps, onAction }: Props) {
  if (part === 'discountmodefooter') {
    const options = reactProps?.discountModeOptions || [];
    return (
      <select
        className="form-control"
        disabled={!!reactProps?.rdoBillDiscountMode}
        value={reactProps?.discountModeFooterId ?? ''}
        onChange={(e) => onAction('discountModeFooterChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'discountapprover') {
    const options = reactProps?.discountApproverOptions || [];
    return (
      <select
        className="form-control"
        disabled={!!reactProps?.rdoApprovedById}
        value={reactProps?.discountApprovedById ?? ''}
        onChange={(e) => onAction('discountApproverChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>
            {o.Id === -1 ? o.Text : `${o.Title && o.Title.Description ? o.Title.Description + ' ' : ''}${o.Text}`}
          </option>
        ))}
      </select>
    );
  }

  // part === 'discountapproverplain'
  // editbillingrequest only: this screen's ui-select-choices template for
  // the discount approver has no Id==-1/Title.Description special case --
  // it's a plain <div ng-bind-html="lookupitem.Text | ..."> like every
  // other simple select, unlike opbilling-list's 'discountapprover' above.
  // Reproduced as plain option text rather than reusing the special-case
  // rendering.
  const plainOptions = reactProps?.discountApproverOptions || [];
  return (
    <select
      className="form-control"
      disabled={!!reactProps?.rdoApprovedById}
      value={reactProps?.discountApprovedById ?? ''}
      onChange={(e) => onAction('discountApproverChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {plainOptions.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
