interface ClaimRow {
  _idx: number;
  ClaimStatusId: number;
  Encounter?: string;
  Patient?: { Title?: { Description?: string }; FirstName?: string; LastName?: string; MRN?: string; Age?: number; Gender?: { Description?: string } };
  PatientId?: number;
  BillDateTime?: string;
  BillIdentifier?: string;
  BillAmount?: number;
  BillDiscount?: number;
  PaidAmount?: number;
  ToBeClaimAmount?: number;
  PatientBillStatus?: { Description?: string };
  ReceivedAmount?: number;
  TDSAmount?: number;
  Disallowed?: number;
  AgreementDiscountAmt?: number;
  Remarks?: string;
}

interface Props {
  reactProps: {
    claimableBills?: ClaimRow[];
    isDisabled?: boolean;
  };
  onAction: (actionType: string, payload: any) => void;
}

// Mirrors the real displaycurrency filter (vendor/common/ngCommonHelper.js):
// currency symbol plus Indian-style digit grouping, 2 decimals. The
// window.clientcode "swostha" branch is not reproduced, consistent with the
// precedent set by BillingBillingCollectionsScreen and siblings.
function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Mirrors the real <ngformatdate datetime-val="..."> directive's own
// 'dd-MMM-yyyy HH:mm' format (public/vendor/common/ngCommonHelper.js).
function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${min}`;
}

function patientLabel(p?: ClaimRow['Patient']) {
  if (!p) return null;
  return (
    <>
      {p.Title?.Description ? <span className="user-pl">{p.Title.Description} </span> : null}
      <span className="user-pl">{p.FirstName}</span> <span className="user-pl">{p.LastName}</span>{' '}
      <span className="user-pl">/</span> <span className="user-pl">{p.MRN}</span>{' '}
      <span className="user-pl">
        / <span className="user-pl">{p.Age}</span>
        <span className="user-pl">/</span>
        <span className="user-pl">{p.Gender?.Description}</span>
      </span>
    </>
  );
}

/**
 * Claim Management > newreceipt-form: the two plain ng-repeat tables over
 * the shared ClaimableBills array, filtered client-side exactly like the
 * original `| filter:{ClaimStatusId:1}` / `:2` -- unclaimed bills (add) and
 * claimed bills (per-row Received/TDS/Disallowed/MOU-discount/Remarks edit
 * + remove). Nearly identical to ClaimReceiptBillsTableScreen (the sibling
 * claimreceipt-form screen) but this one additionally carries an
 * AgreementDiscountAmt ("MOU Discount") column and a plain Remarks column
 * (vs. Comments there) -- kept as a separate component rather than
 * generalizing, to avoid coupling two independently-evolving screens.
 * The unclaimed table only renders when !isDisabled, matching the original
 * ng-if="!IsDisabled" on its container div.
 */
export function NewReceiptBillsTableScreen({ reactProps, onAction }: Props) {
  const bills = reactProps?.claimableBills || [];
  const isDisabled = !!reactProps?.isDisabled;
  const unclaimed = bills.filter((b) => b.ClaimStatusId === 1);
  const claimed = bills.filter((b) => b.ClaimStatusId === 2);

  return (
    <>
      {!isDisabled && (
        <div>
          <table className="table table-hover table-responsive table-bordered">
            <thead className="bg-subhead">
              <tr>
                <th><span>Visit No.</span></th>
                <th><span>Patient Info</span></th>
                <th><span>Bill Date</span></th>
                <th><span>Bill Number</span></th>
                <th><span>Bill Amount</span></th>
                <th><span>Discount</span></th>
                <th><span>Received Amount</span></th>
                <th><span>To Be Claimed</span></th>
                <th><span>Status</span></th>
                <th><span>Action</span></th>
              </tr>
            </thead>
            <tbody>
              {unclaimed.map((claims) => (
                <tr key={claims._idx}>
                  <td>{claims.Encounter}</td>
                  <td>
                    <div className="ui-grid-cell-contents">
                      <a onClick={() => onAction('patientInfo', { patientId: claims.PatientId })} style={{ cursor: 'pointer' }}>
                        {patientLabel(claims.Patient)}
                      </a>
                    </div>
                  </td>
                  <td>{formatDateTime(claims.BillDateTime)}</td>
                  <td className="currency-align">{claims.BillIdentifier}</td>
                  <td className="currency-align">{formatCurrency(claims.BillAmount)}</td>
                  <td className="currency-align">{formatCurrency(claims.BillDiscount)}</td>
                  <td className="currency-align">{formatCurrency(claims.PaidAmount)}</td>
                  <td className="currency-align">{formatCurrency(claims.ToBeClaimAmount)}</td>
                  <td className="currency-align">{claims.PatientBillStatus?.Description}</td>
                  <td className="text-center">
                    <button type="button" id="btnadditems" onClick={() => onAction('addPayment', { idx: claims._idx })}>
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <table className="table table-hover table-responsive table-bordered">
          <thead className="bg-subhead">
            <tr>
              <th><span>Visit No.</span></th>
              <th><span>Patient Info</span></th>
              <th><span>Bill Date</span></th>
              <th><span>Bill Number</span></th>
              <th><span>Due Amount</span></th>
              <th><span>Received Amount</span></th>
              <th><span>TDS</span></th>
              <th><span>Disallowed/Write Off</span></th>
              <th><span>MOU Discount</span></th>
              <th><span>Remarks</span></th>
              <th><span>Action</span></th>
            </tr>
          </thead>
          <tbody>
            {claimed.map((claims) => (
              <tr key={claims._idx}>
                <td>{claims.Encounter}</td>
                <td>
                  <div className="ui-grid-cell-contents">
                    <a onClick={() => onAction('patientInfo', { patientId: claims.PatientId })} style={{ cursor: 'pointer' }}>
                      {patientLabel(claims.Patient)}
                    </a>
                  </div>
                </td>
                <td>{formatDateTime(claims.BillDateTime)}</td>
                <td>{claims.BillIdentifier}</td>
                <td className="currency-align">{formatCurrency(claims.ToBeClaimAmount)}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="receivedamt"
                    placeholder="Received Amount"
                    disabled={isDisabled}
                    value={claims.ReceivedAmount ?? ''}
                    onChange={(e) => onAction('lineFieldChange', { idx: claims._idx, field: 'ReceivedAmount', value: e.target.value, recalc: true })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="tdsamt"
                    placeholder="TDS Amount"
                    disabled={isDisabled}
                    value={claims.TDSAmount ?? ''}
                    onChange={(e) => onAction('lineFieldChange', { idx: claims._idx, field: 'TDSAmount', value: e.target.value, recalc: true })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="disallowedamt"
                    placeholder="Disallowed Amount"
                    disabled={isDisabled}
                    value={claims.Disallowed ?? ''}
                    onChange={(e) => onAction('lineFieldChange', { idx: claims._idx, field: 'Disallowed', value: e.target.value, recalc: true })}
                  />
                </td>
                <td className="currency-align">
                  <input
                    type="text"
                    className="form-control"
                    name="mouamt"
                    placeholder="Mou Amount"
                    disabled={isDisabled}
                    value={claims.AgreementDiscountAmt ?? ''}
                    onChange={(e) => onAction('lineFieldChange', { idx: claims._idx, field: 'AgreementDiscountAmt', value: e.target.value, recalc: true })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="remarks"
                    placeholder="Remarks"
                    disabled={isDisabled}
                    value={claims.Remarks ?? ''}
                    onChange={(e) => onAction('lineFieldChange', { idx: claims._idx, field: 'Remarks', value: e.target.value, recalc: false })}
                  />
                </td>
                <td className="text-center">
                  {!isDisabled && (
                    <button type="button" id="btnremoveitems" className="btn btn-danger btn-xs" onClick={() => onAction('removePayment', { idx: claims._idx })}>
                      <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
