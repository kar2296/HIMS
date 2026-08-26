import React, { useState } from 'react';

interface AdjustmentRow {
  TransactionDate?: string;
  TransactionNumber?: string;
  VisitNumber?: string;
  BillAmount?: number;
  PaidAmount?: number;
  AdjustedAmount?: number;
  UnAdjustedAmount?: number;
  DueAmount?: number;
}

interface CurrentContext {
  TotalBillAmount?: number;
  TotalPaidAmount?: number;
  TotalAdjustedAmount?: number;
  TotalUnAdjustedAmount?: number;
  TotalDueAmount?: number;
}

interface PatientAdjustmentInfoListScreenProps {
  reactProps?: {
    rows?: AdjustmentRow[];
    currentcontext?: CurrentContext;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

type SortState = { field: string; order: 1 | -1 } | null;

function dotGet(obj: any, path: string): any {
  let broke = false;
  return path.split('.').reduce((o, k) => {
    if (!broke && o && o[k] !== undefined) return o[k];
    broke = true;
    return undefined;
  }, obj);
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, results table + totals banner for
// patientadjustmentinfo.html. Replaces the <custom-table> grid
// (PatientPaymentAdjustmentController's vm.gridConfig), reproducing
// column-header-click sort. The native <ul uib-pagination> stays
// untouched as a literal DOM sibling below this mount (real pagerObj,
// used by getList()'s PageContext).
//
// Confirmed pre-existing quirks, reproduced as-is (not "fixed"):
// - The "Bill / Receipt No#" cell's link dispatches to
//   grid.appScope.handleEvents('transaction', row) in the original --
//   but handleEvents is never defined anywhere in this controller, so
//   clicking it has always done nothing (a dead/broken handler). No
//   handler is wired up here either, reproducing the same no-op.
// - $scope.currentcontext.Total* fields are never reset to 0 inside
//   getListCallback (only once, at controller init) -- so every
//   subsequent search ADDS to the previous totals instead of replacing
//   them. This is a genuine pre-existing bug, left unfixed; the banner
//   here just displays whatever currentcontext currently holds.
export const PatientAdjustmentInfoListScreen: React.FC<PatientAdjustmentInfoListScreenProps> = ({ reactProps }) => {
  const rows = reactProps?.rows || [];
  const cc = reactProps?.currentcontext || {};
  const [sort, setSort] = useState<SortState>(null);

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const x = String(dotGet(a, sort.field) ?? '').toLowerCase();
      const y = String(dotGet(b, sort.field) ?? '').toLowerCase();
      if (x < y) return -sort.order;
      if (x > y) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const headerClick = (field: string) => {
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  return (
    <>
      <div className="row">
        <div className="custom-table table-striped table-bordered">
          <table className="table table-bordered bordered table-striped table-condensed datatable">
            <thead>
              <tr>
                <th onClick={() => headerClick('TransactionDate')}>Date</th>
                <th onClick={() => headerClick('TransactionNumber')}>Bill / Receipt No#</th>
                <th onClick={() => headerClick('VisitNumber')}>Visit No</th>
                <th onClick={() => headerClick('BillAmount')}>Bill Amount</th>
                <th onClick={() => headerClick('PaidAmount')}>Paid Amount</th>
                <th onClick={() => headerClick('AdjustedAmount')}>Adjusted Amount</th>
                <th onClick={() => headerClick('UnAdjustedAmount')}>Un-Adjusted Amount</th>
                <th onClick={() => headerClick('DueAmount')}>Due Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    {row.TransactionDate ? new Date(row.TransactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                    {row.TransactionDate ? new Date(row.TransactionDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                  </td>
                  <td><a href="javascript:void(0)">{row.TransactionNumber}</a></td>
                  <td>{row.VisitNumber}</td>
                  <td>{formatCurrency(row.BillAmount)}</td>
                  <td>{formatCurrency(row.PaidAmount)}</td>
                  <td>{formatCurrency(row.AdjustedAmount)}</td>
                  <td>{formatCurrency(row.UnAdjustedAmount)}</td>
                  <td>{formatCurrency(row.DueAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right-table">
          <div className="col-sm-4">
            <table id="bannerdetails">
              <tbody>
                <tr>
                  <td className="totallabel">Total</td>
                  <td><span>{formatCurrency(cc.TotalBillAmount)}</span></td>
                </tr>
                <tr>
                  <td className="totallabel">TotalPaidAmount</td>
                  <td><span>{formatCurrency(cc.TotalPaidAmount)}</span></td>
                </tr>
                <tr>
                  <td className="totallabel">Amount</td>
                  <td><span>{formatCurrency(cc.TotalAdjustedAmount)}</span></td>
                </tr>
                <tr>
                  <td className="totallabel">Unpaid Amount</td>
                  <td><span>{formatCurrency(cc.TotalUnAdjustedAmount)}</span></td>
                </tr>
                <tr>
                  <td className="totallabel">Due</td>
                  <td><span>{formatCurrency(cc.TotalDueAmount)}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
