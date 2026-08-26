type Part = 'paymenttype' | 'bank';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * opbilling > itemwiseopbillcancel (Partial Cancel modal): Payment Mode and
 * Bank ui-selects. The original markup's ng-disabled="IsCompleted" refers to
 * a bare $scope.IsCompleted that is never assigned anywhere in the
 * controller -- always undefined/falsy, so these fields are never actually
 * disabled in practice. Reproduced as-is (never disabled), not "fixed".
 */
export function ItemwiseOpBillCancelSelectScreen({ part, reactProps, onAction }: Props) {
  if (part === 'paymenttype') {
    const options = reactProps?.paymentTypeOptions || [];
    return (
      <select
        className="form-control"
        value={reactProps?.paymentTypeId ?? ''}
        onChange={(e) => onAction('paymentTypeChange', { id: parseInt(e.target.value, 10) })}
      >
        <option value="">Select Payment Mode</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  // part === 'bank'
  const options = reactProps?.bankOptions || [];
  return (
    <select
      className="form-control"
      value={reactProps?.bankId ?? ''}
      onChange={(e) => onAction('bankChange', { id: parseInt(e.target.value, 10) })}
    >
      <option value="">Select Bank</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
