type Part =
  | 'serviceratecategory'
  | 'guarantortypepayer'
  | 'discountmodeheader'
  | 'patienttype'
  | 'guarantortypediscountcategory'
  | 'doctorid'
  | 'guarantorid'
  | 'payertype';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * opbilling-list header cluster: Rate Type, Payer Type (permanently
 * disabled), header Discount Type, Patient Type, and Discount Category.
 *
 * Several of these fields drive a jQuery/AngularJS keyboard focus-chain
 * (moveHeaderFocus) that is left entirely in the controller -- this
 * component only forwards the native onKeyUp event via the 'headerKeyUp'
 * action with the same literal nextId string the original
 * ng-keyup="moveHeaderFocus('...')" passed, so moveHeaderFocus runs
 * unchanged (including its own quirks, e.g. it unconditionally focuses
 * #doctorid on every keyup regardless of which field fired it -- not
 * reproduced differently here, just passed through as-is).
 *
 * NOTE: 'guarantortypepayer' shares DOM id="GuarantorTypeId" with
 * 'guarantortypediscountcategory' below (and with the original
 * ui-select) -- a pre-existing duplicate-id quirk in the original
 * markup, reproduced exactly rather than fixed, since nothing in the
 * controller resolves this id via getElementById (only via ng-keyup
 * inline expressions, which don't care about duplicate ids).
 */
export function OpBillingHeaderSelectScreen({ part, reactProps, onAction }: Props) {
  if (part === 'serviceratecategory') {
    const options = reactProps?.serviceRateCategoryOptions || [];
    return (
      <select
        id="ServiceRateCategoryId"
        className="form-control"
        disabled={!!reactProps?.disRateType}
        value={reactProps?.serviceRateCategoryId ?? ''}
        onChange={(e) => onAction('serviceRateCatChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('headerKeyUp', { nextId: 'ServiceRateCategoryId' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'guarantortypepayer') {
    // Always disabled in the original (ng-disabled="true") -- the browser
    // never fires onChange on a disabled <select>, so this is effectively
    // decorative, exactly like the source markup.
    const options = reactProps?.guarantorTypeOptions || [];
    return (
      <select id="GuarantorTypeId" className="form-control" disabled value={reactProps?.guarantorTypePayerId ?? ''} onChange={() => {}}>
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'discountmodeheader') {
    const options = reactProps?.discountModeOptions || [];
    return (
      <select
        id="DiscountModeId"
        className="form-control ui-select-grid"
        disabled={!!reactProps?.rdoBillDiscountMode}
        value={reactProps?.discountModeHeaderId ?? ''}
        onChange={(e) => onAction('discountModeHeaderChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('headerKeyUp', { nextId: 'DiscountModeId' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'patienttype') {
    const options = reactProps?.patientTypeOptions || [];
    return (
      <select
        className="form-control"
        value={reactProps?.patientTypeId ?? ''}
        onChange={(e) => onAction('patientTypeChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'guarantortypediscountcategory') {
    const options = reactProps?.guarantorTypeOptions || [];
    return (
      <select
        id="GuarantorTypeId"
        className="form-control ui-select-grid"
        value={reactProps?.guarantorTypeDiscountCategoryId ?? ''}
        onChange={(e) => onAction('guarantorTypeDiscountCategoryChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('headerKeyUp', { nextId: 'GuarantorTypeId' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'doctorid') {
    // editbillingrequest only: a live Doctor <ui-select> (opbilling-list
    // long ago upgraded this field to the <autosearch> widget instead, so
    // this is a fresh part, not a reused one). ng-change="onDoctorSelected"
    // is called with the FULL selected lookup object in the original
    // (it reads .Title.Description and .Text), so the dispatcher resolves
    // and passes the whole object, not just the id.
    const options = reactProps?.doctorOptions || [];
    return (
      <select
        id="doctorid"
        className="form-control"
        disabled={!!reactProps?.doctorDisabled}
        value={reactProps?.doctorId ?? ''}
        onChange={(e) => onAction('doctorChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('headerKeyUp', { nextId: 'doctorid' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'guarantorid') {
    // editbillingrequest only: a live "Payer" ui-select bound to
    // currentfilter.GuarantorId (opbilling-list's equivalent field is the
    // <autosearch> widget, not a ui-select). ng-change="GuarantorChange"
    // reads .Id/.Text/.GuarantorTypeId/.ServiceRateCategoryId off the
    // selected object, so the dispatcher resolves and passes the full
    // lookup object.
    const options = reactProps?.guarantorOptions || [];
    return (
      <select
        id="GuarantorId"
        className="form-control"
        disabled={!!reactProps?.guarantorDisabled}
        value={reactProps?.guarantorId ?? ''}
        onChange={(e) => onAction('guarantorChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('headerKeyUp', { nextId: 'GuarantorId' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  // part === 'payertype'
  // editbillingrequest only: unlike opbilling-list/opbillingest-list where
  // this "Payer Type" field is permanently ng-disabled="true", here it is
  // ng-disabled="RdoPayScenarioId||vm.Context=='DG'" -- a real, dynamic
  // gate -- so (unlike 'guarantortypepayer' above) this variant has a live
  // onChange calling getInsurancelookup(), matching the original exactly.
  const payerTypeOptions = reactProps?.guarantorTypeOptions || [];
  return (
    <select
      id="GuarantorTypeId"
      className="form-control"
      disabled={!!reactProps?.payerTypeDisabled}
      value={reactProps?.guarantorTypePayerId ?? ''}
      onChange={(e) => onAction('payerTypeChange', { id: parseInt(e.target.value, 10) })}
      onKeyUp={() => onAction('headerKeyUp', { nextId: 'GuarantorTypeId' })}
    >
      <option value="">&nbsp;</option>
      {payerTypeOptions.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
