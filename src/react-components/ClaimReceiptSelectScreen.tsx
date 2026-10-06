type Part =
  | 'guarantortype'
  | 'guarantor'
  | 'encountertype'
  | 'paymenttype'
  | 'bank'
  | 'terminal'
  | 'cardtype';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Claim Management > claimreceipt-form (insurance claim receipt).
 * One component covers all 7 ui-select fields on this screen via the `part`
 * prop, matching the pattern used on opbilling-form. All fields share the
 * same ng-disabled="IsDisabled" in the original markup.
 */
export function ClaimReceiptSelectScreen({ part, reactProps, onAction }: Props) {
  const disabled = !!reactProps?.isDisabled;

  if (part === 'guarantortype') {
    const options = reactProps?.guarantorTypeOptions || [];
    return (
      <select
        className="form-control"
        disabled={disabled}
        value={reactProps?.guarantorTypeId ?? ''}
        onChange={(e) => onAction('guarantorTypeChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'guarantor') {
    const options = reactProps?.guarantorOptions || [];
    return (
      <select
        className="form-control"
        disabled={disabled}
        value={reactProps?.guarantorId ?? ''}
        onChange={(e) => onAction('guarantorChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'encountertype') {
    const options = reactProps?.encounterTypeOptions || [];
    return (
      <select
        className="filter-combo form-control"
        disabled={disabled}
        value={reactProps?.encounterTypeId ?? ''}
        onChange={(e) => onAction('encounterTypeChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'paymenttype') {
    const options = reactProps?.paymentTypeOptions || [];
    return (
      <select
        className="form-control"
        disabled={disabled}
        value={reactProps?.paymentTypeId ?? ''}
        onChange={(e) => onAction('paymentTypeChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'bank') {
    const options = reactProps?.bankOptions || [];
    return (
      <select
        className="form-control"
        disabled={disabled}
        value={reactProps?.bankId ?? ''}
        onChange={(e) => onAction('bankChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'terminal') {
    const options = reactProps?.terminalOptions || [];
    return (
      <select
        className="form-control"
        disabled={disabled}
        value={reactProps?.terminalId ?? ''}
        onChange={(e) => onAction('terminalChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  // part === 'cardtype'
  const options = reactProps?.cardTypeOptions || [];
  return (
    <select
      className="form-control"
      disabled={disabled}
      value={reactProps?.cardTypeId ?? ''}
      onChange={(e) => onAction('cardTypeChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
