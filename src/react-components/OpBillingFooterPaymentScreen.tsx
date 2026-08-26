type Part = 'paymenttype' | 'creditapprover' | 'bank' | 'cardtype' | 'terminal';

interface Props {
  part: Part;
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * opbilling-list footer payment cluster: Payment Type, Credit Approver,
 * Bank, Card Type, and Terminal.
 *
 * Every part here fires a native onKeyUp that dispatches 'footerKeyUp'
 * with the exact literal nextId string the original
 * ng-keyup="FooterFocus('...')" passed, so $scope.FooterFocus runs
 * completely unchanged (including its own quirks -- see below).
 *
 * TWO GENUINE PRE-EXISTING BUGS in FooterFocus, reproduced not fixed:
 *  1. The "cardno" branch does `document.getElementById('TerminalNoId')`,
 *     which never matches any real DOM id (the Terminal select's real id
 *     is "Terminal") -- so pressing Enter on the Card/Auth Code field
 *     never actually reaches the Terminal dropdown today.
 *  2. The Terminal select's own ng-keyup passes 'Terminal' (matching its
 *     own id), but FooterFocus only special-cases nextId=="TerminalNoId"
 *     -- so pressing Enter while focused on Terminal is a no-op today.
 * Nothing here changes that behavior; the compatibility adapter in
 * setCmbFocus only prevents the associated *throw*, not the mismatch
 * itself, per the "don't fix pre-existing behaviour" migration rule.
 */
export function OpBillingFooterPaymentScreen({ part, reactProps, onAction }: Props) {
  if (part === 'paymenttype') {
    const options = reactProps?.paymentTypeOptions || [];
    return (
      <select
        id="paymenttype"
        className="form-control"
        disabled={!!reactProps?.rdoPaymentTypeId}
        value={reactProps?.paymentTypeId ?? ''}
        onChange={(e) => onAction('paymentTypeChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('footerKeyUp', { nextId: 'paymenttype' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'creditapprover') {
    const options = reactProps?.privateDueApproverOptions || [];
    return (
      <select
        id="creditapprover"
        className="form-control"
        disabled={!!reactProps?.rdoGuarantorDue}
        value={reactProps?.privateDueId ?? ''}
        onChange={(e) => onAction('creditApproverChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('footerKeyUp', { nextId: 'creditapprover' })}
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
        id="BankName"
        className="form-control"
        value={reactProps?.bankId ?? ''}
        onChange={(e) => onAction('bankChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('footerKeyUp', { nextId: 'BankName' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  if (part === 'cardtype') {
    const options = reactProps?.cardTypeOptions || [];
    return (
      <select
        id="CardType"
        className="form-control"
        disabled={!!reactProps?.itemIsCompleted}
        value={reactProps?.cardTypeId ?? ''}
        onChange={(e) => onAction('cardTypeChange', { id: parseInt(e.target.value, 10) })}
        onKeyUp={() => onAction('footerKeyUp', { nextId: 'CardType' })}
      >
        <option value="">&nbsp;</option>
        {options.map((o: any) => (
          <option key={o.Id} value={o.Id}>{o.Text}</option>
        ))}
      </select>
    );
  }

  // part === 'terminal'
  const options = reactProps?.terminalOptions || [];
  return (
    <select
      id="Terminal"
      className="form-control"
      disabled={!!reactProps?.itemIsCompleted}
      value={reactProps?.terminalNoId ?? ''}
      onChange={(e) => onAction('terminalChange', { id: parseInt(e.target.value, 10) })}
      onKeyUp={() => onAction('footerKeyUp', { nextId: 'Terminal' })}
    >
      <option value="">&nbsp;</option>
      {options.map((o: any) => (
        <option key={o.Id} value={o.Id}>{o.Text}</option>
      ))}
    </select>
  );
}
