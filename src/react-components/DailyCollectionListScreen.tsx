import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CollectionRow {
  Id?: number;
  CollectionDate?: string;
  OpeningBalance?: number;
  Cash?: number;
  PettyCash?: number;
  Deposit?: number;
  BalanceCash?: number;
  Card?: number;
  EOD?: number;
  VarianceCard?: number;
  UPI?: number;
  BankCredit?: number;
  VarianceUPI?: number;
  Chequeddwire?: number;
  ChequeDeposit?: number;
  VarianceCheque?: number;
  CollectionStatus?: { Description?: string };
  IsSelected?: boolean;
  IsAllSelected?: boolean;
  IsUpdated?: number;
  IsReadOnly?: boolean;
}

interface DailyCollectionListScreenProps {
  reactProps?: {
    currentfilter?: { FacilityId?: number; FromDate?: string; ToDate?: string; CollectionStatusId?: number };
    lookup?: { Facility?: LookupItem[]; CollectionStatus?: LookupItem[] };
    CollectionDetails?: CollectionRow[];
    selectall?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dd}-${monthNames[d.getMonth()]}-${d.getFullYear()}`;
}

// React bridge migration (single mount). Daily Collection list
// (DailyCollectionListController). No native widgets, no live
// utl.Validator.validate($scope) call (its two references are both
// commented out in the original -- dead code). The per-row select
// checkbox dispatches 'toggleSelect' unconditionally (matching the
// original ng-model="item.IsSelected" two-way binding, which is what
// actually drives the checkbox regardless of ShaSelectionChange()).
//
// Confirmed pre-existing quirks, reproduced as-is (not fixed):
// - The row checkbox's ng-click handler in the original,
//   ShaSelectionChange(item), does not exist anywhere in the controller
//   (only an unused SelectionChange() is defined) -- calling it is a
//   silent no-op in AngularJS; the checkbox still toggles because
//   ng-model handles that independently. Reproduced by NOT wiring any
//   click side-effect beyond the toggle itself.
// - selectAllItems() reads $scope.currentcontext.selectall, but
//   $scope.currentcontext is never initialized anywhere in this
//   controller -- calling it throws a TypeError. Reproduced verbatim:
//   the 'selectAll' action below calls the same unguarded function.
export const DailyCollectionListScreen: React.FC<DailyCollectionListScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const rows = reactProps?.CollectionDetails || [];
  const selectall = reactProps?.selectall ?? false;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="row">
        <h4>Daily Collection</h4>
      </div>
      <div className="row">
        <form id="item_form" name="item_form" className="form-horizontal" role="form">
          <div className="col-sm-3">
            <label className="col-sm-12">Facility</label>
            <div className="col-sm-12">
              <select
                className="form-control"
                value={currentfilter.FacilityId ?? ''}
                onChange={(e) => dispatch('facilityChange', { value: Number(e.target.value) })}
              >
                {(lookup.Facility || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">From Date</label>
            <div className="col-sm-12">
              <input
                type="date"
                className="form-control"
                value={currentfilter.FromDate ? currentfilter.FromDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">To Date</label>
            <div className="col-sm-12">
              <input
                type="date"
                className="form-control"
                value={currentfilter.ToDate ? currentfilter.ToDate.slice(0, 10) : ''}
                onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <label className="col-sm-12">Collection Status</label>
            <div className="col-sm-12">
              <select
                className="form-control"
                value={currentfilter.CollectionStatusId ?? ''}
                onChange={(e) => dispatch('collectionStatusChange', { value: Number(e.target.value) })}
              >
                {(lookup.CollectionStatus || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>
      <div className="row">
        <div className="drhms-table-control">
          <div className="drhms-bg-pattern">
            <div className="drhms-table-height">
              {rows.length > 0 && (
                <table className="drhms-responsive-table">
                  <thead className="bg-subhead">
                    <tr>
                      <th>
                        <span>
                          <input
                            type="checkbox"
                            checked={selectall}
                            onChange={(e) => dispatch('selectAll', { value: e.target.checked })}
                          />
                        </span>
                      </th>
                      <th>Date</th>
                      <th>Opening Balance</th>
                      <th>Collection Cash</th>
                      <th>PettyCash Exp.</th>
                      <th>Deposit</th>
                      <th>Balance</th>
                      <th>Card Collection</th>
                      <th>EOD</th>
                      <th>Variance</th>
                      <th>UPI Collection</th>
                      <th>Bank Credit</th>
                      <th>Variance</th>
                      <th>Chq. Collection</th>
                      <th>Chq. Deposit</th>
                      <th>Difference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, idx) => (
                      <tr key={item.Id ?? idx}>
                        <td>
                          <center>
                            <span>
                              <input
                                type="checkbox"
                                className="case"
                                checked={item.IsSelected ?? false}
                                disabled={!!item.IsUpdated}
                                onChange={(e) => dispatch('toggleSelect', { Id: item.Id, value: e.target.checked })}
                              />
                            </span>
                          </center>
                        </td>
                        <td>{formatDate(item.CollectionDate)}</td>
                        <td>{item.OpeningBalance}</td>
                        <td>{item.Cash}</td>
                        <td>{item.PettyCash}</td>
                        <td>
                          <input
                            type="text"
                            value={item.Deposit ?? ''}
                            disabled={!!item.IsUpdated}
                            onChange={(e) => dispatch('depositChange', { Id: item.Id, value: e.target.value })}
                          />
                        </td>
                        <td><input type="text" value={item.BalanceCash ?? ''} disabled readOnly /></td>
                        <td>{item.Card}</td>
                        <td>
                          <input
                            type="text"
                            value={item.EOD ?? ''}
                            disabled={!!item.IsUpdated}
                            onChange={(e) => dispatch('eodChange', { Id: item.Id, value: e.target.value })}
                          />
                        </td>
                        <td><input type="text" value={item.VarianceCard ?? ''} disabled readOnly /></td>
                        <td>{item.UPI}</td>
                        <td>
                          <input
                            type="text"
                            value={item.BankCredit ?? ''}
                            disabled={!!item.IsUpdated}
                            onChange={(e) => dispatch('bankCreditChange', { Id: item.Id, value: e.target.value })}
                          />
                        </td>
                        <td><input type="text" value={item.VarianceUPI ?? ''} disabled readOnly /></td>
                        <td>{item.Chequeddwire}</td>
                        <td>
                          <input
                            type="text"
                            value={item.ChequeDeposit ?? ''}
                            disabled={!!item.IsUpdated}
                            onChange={(e) => dispatch('chequeDepositChange', { Id: item.Id, value: e.target.value })}
                          />
                        </td>
                        <td><input type="text" value={item.VarianceCheque ?? ''} disabled readOnly /></td>
                        <td>{item.CollectionStatus?.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fooder-bgs">
        <div className="row">
          <div className="pull-right">
            {rows.length > 0 && (
              <>
                <button type="button" className="draftbutton" onClick={() => dispatch('save')}>Save</button>
                <button type="button" className="draftbutton" onClick={() => dispatch('approve')}>Approve</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
