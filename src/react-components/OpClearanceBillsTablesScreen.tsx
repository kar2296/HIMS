import React from 'react';

interface BillRow {
  Id?: number;
  SalesSerialNo?: number;
  BillNumber?: string;
  BillDateTime?: string;
  Encounter?: { VisitIdentifier?: string };
  User?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  PharmacySaleType?: { Description?: string };
  BillAmount?: number;
  BillDiscount?: number;
  PaidAmount?: number;
  DueAmount?: number;
  select?: boolean;
}

interface ReturnRow {
  Id?: number;
  ReturnSerialNo?: number;
  ReturnNumber?: string;
  ReturnDateTime?: string;
  BillNumber?: string;
  BillDateTime?: string;
  Encounter?: { VisitIdentifier?: string };
  User?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  ReturnAmount?: number;
  RoundOffValue?: number;
  NetReturnAmount?: number;
  RefundedAmount?: number;
  select1?: boolean;
}

interface OpClearanceBillsTablesScreenProps {
  part: 'patientbills' | 'pharmacybills' | 'returns';
  reactProps?: {
    patientBills?: BillRow[];
    patientPharmacyBills?: BillRow[];
    patientPharmacyReturns?: ReturnRow[];
    currentcontext?: { selectallchk?: boolean; selectallchk1?: boolean };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function fmtDate(v?: string) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

// React bridge migration for the 3 ng-repeat tables in opclearance-form.html
// (none use ui-grid/custom-table -- plain hand-rolled markup, so all 3 are
// reimplemented). Each table is only rendered when its list is non-empty,
// matching the original's ng-if="X.length > 0" wrapper (handled in the
// .html around each mount).
//
// CONFIRMED PRE-EXISTING BUG, reproduced as-is: the 'patientbills' table's
// header select-all checkbox is bound to the SAME model
// (currentcontext.selectallchk) and SAME handler (SelectAll) as the
// 'pharmacybills' table's header select-all -- but $scope.SelectAll(chk)
// only ever sets `.select` on PatientPharmacyBills rows, never on
// PatientBills rows. So clicking the PatientBills table's "select all"
// checkbox visually moves (shared boolean) but silently selects ALL of the
// *pharmacy* bills instead, while never touching the OP bills it appears to
// control. Reproduced by giving both header checkboxes the same
// `selectAllBills` value/dispatch, matching the real (buggy) behavior.
//
// Also confirmed dead: every row's ng-change="selectionChangedCal(...)" /
// "selectionChangedCal()" calls an undefined controller function -- the
// checkbox itself still toggles (plain two-way model binding), but no
// recalculation of totals happens on check/uncheck. Reproduced by simply
// toggling `select`/`select1` with no side effect, matching reality.
export const OpClearanceBillsTablesScreen: React.FC<OpClearanceBillsTablesScreenProps> = ({ part, reactProps, onAction }) => {
  const currentcontext = reactProps?.currentcontext || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'patientbills') {
    const rows = reactProps?.patientBills || [];
    if (rows.length === 0) return null;
    return (
      <>
        <div className="col-sm-12"><span>Patient Bills</span></div>
        <div className="col-sm-12">
          <div className="drhms-table-control">
            <div className="drhms-bg-pattern">
              <div className="drhms-table-height">
                <table className="drhms-responsive-table">
                  <thead>
                    <tr>
                      <th><span>SI No</span></th>
                      <th><span>Bill No</span></th>
                      <th><span>Bill Date</span></th>
                      <th><span>OP/IP No</span></th>
                      <th><span>Doctor</span></th>
                      <th><span>Bill Amount</span></th>
                      <th><span>Discount</span></th>
                      <th><span>Paid Amount</span></th>
                      <th><span>Due Amount</span></th>
                      <th>
                        <input type="checkbox" className="custom-checkbox" checked={!!currentcontext.selectallchk}
                          onClick={() => dispatch('selectAllBills', { value: !currentcontext.selectallchk })} readOnly />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.Id ?? idx}>
                        <td>{row.SalesSerialNo}</td>
                        <td>{row.BillNumber}</td>
                        <td>{fmtDate(row.BillDateTime)}</td>
                        <td>{row.Encounter?.VisitIdentifier}</td>
                        <td>{row.User?.Title?.Description}&nbsp;{row.User?.FirstName}&nbsp;{row.User?.LastName}</td>
                        <td>{row.BillAmount}</td>
                        <td>{row.BillDiscount}</td>
                        <td>{row.PaidAmount}</td>
                        <td>{row.DueAmount}</td>
                        <td>
                          <input type="checkbox" className="custom-checkbox" checked={!!row.select}
                            disabled={row.DueAmount === 0}
                            onChange={(e) => dispatch('selectBill', { Id: row.Id, value: e.target.checked })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (part === 'pharmacybills') {
    const rows = reactProps?.patientPharmacyBills || [];
    if (rows.length === 0) return null;
    return (
      <>
        <div className="col-sm-12"><span>Bill Details</span></div>
        <div className="col-sm-12">
          <div className="drhms-table-control">
            <div className="drhms-bg-pattern">
              <div className="drhms-table-height">
                <table className="drhms-responsive-table">
                  <thead>
                    <tr>
                      <th><span>SI No</span></th>
                      <th><span>Bill No</span></th>
                      <th><span>Bill Date</span></th>
                      <th><span>OP/IP No</span></th>
                      <th><span>Doctor</span></th>
                      <th><span>SaleType</span></th>
                      <th><span>Bill Amount</span></th>
                      <th><span>Discount</span></th>
                      <th><span>Paid Amount</span></th>
                      <th><span>Due Amount</span></th>
                      <th>
                        <input type="checkbox" className="custom-checkbox" checked={!!currentcontext.selectallchk}
                          onClick={() => dispatch('selectAllBills', { value: !currentcontext.selectallchk })} readOnly />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.Id ?? idx}>
                        <td>{row.SalesSerialNo}</td>
                        <td>{row.BillNumber}</td>
                        <td>{fmtDate(row.BillDateTime)}</td>
                        <td>{row.Encounter?.VisitIdentifier}</td>
                        <td>{row.User?.Title?.Description}&nbsp;{row.User?.FirstName}&nbsp;{row.User?.LastName}</td>
                        <td>{row.PharmacySaleType?.Description}</td>
                        <td>{row.BillAmount}</td>
                        <td>{row.BillDiscount}</td>
                        <td>{row.PaidAmount}</td>
                        <td>{row.DueAmount}</td>
                        <td>
                          <input type="checkbox" className="custom-checkbox" checked={!!row.select}
                            onChange={(e) => dispatch('selectPharmacyBill', { Id: row.Id, value: e.target.checked })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // part === 'returns'
  const rows = reactProps?.patientPharmacyReturns || [];
  if (rows.length === 0) return null;
  return (
    <>
      <div className="col-sm-12"><span>Return Details</span></div>
      <div className="col-sm-12">
        <div className="drhms-table-control">
          <div className="drhms-bg-pattern">
            <div className="drhms-table-height">
              <table className="drhms-responsive-table">
                <thead>
                  <tr>
                    <th><span>SI No</span></th>
                    <th><span>Return No</span></th>
                    <th><span>Return Date</span></th>
                    <th><span>Bill No</span></th>
                    <th><span>Bill Date</span></th>
                    <th><span>OP/IP No</span></th>
                    <th><span>Doctor</span></th>
                    <th><span>Return Amount</span></th>
                    <th><span>Round Off</span></th>
                    <th><span>Net Amount</span></th>
                    <th><span>Refund Amount</span></th>
                    <th>
                      <input type="checkbox" className="custom-checkbox" checked={!!currentcontext.selectallchk1}
                        onClick={() => dispatch('selectAllReturns', { value: !currentcontext.selectallchk1 })} readOnly />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.Id ?? idx}>
                      <td>{row.ReturnSerialNo}</td>
                      <td>{row.ReturnNumber}</td>
                      <td>{fmtDate(row.ReturnDateTime)}</td>
                      <td>{row.BillNumber}</td>
                      <td>{fmtDate(row.BillDateTime)}</td>
                      <td>{row.Encounter?.VisitIdentifier}</td>
                      <td>{row.User?.Title?.Description}&nbsp;{row.User?.FirstName}&nbsp;{row.User?.LastName}</td>
                      <td>{row.ReturnAmount}</td>
                      <td>{row.RoundOffValue}</td>
                      <td>{row.NetReturnAmount}</td>
                      <td>{row.RefundedAmount}</td>
                      <td>
                        <input type="checkbox" className="custom-checkbox" checked={!!row.select1}
                          onChange={(e) => dispatch('selectReturn', { Id: row.Id, value: e.target.checked })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
