import React from 'react';

interface RevenueRow {
  TransactionDate?: string;
  ServiceCategoryName?: string;
  CreditAmount?: number;
  DebitAmount?: number;
  Status?: number;
}

interface CurrentContext {
  TotalCredit?: number;
  TotalDebit?: number;
}

interface PatientRevenueInfoListScreenProps {
  reactProps?: {
    rows?: RevenueRow[];
    currentcontext?: CurrentContext;
  };
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, results table + totals banner for
// patientrevenueinfo.html. This screen's vm.gridConfig (real ui-grid
// columnDefs) is entirely commented-out dead code in the original --
// results actually render via a plain ng-repeat over
// "ServiceCategories | filter:{Status:1}" (confirmed: no ui-grid/
// custom-table element anywhere in the original template). Reproduced
// as a plain table here too, filtering rows to Status===1 client-side
// to match the original's filter expression exactly.
export const PatientRevenueInfoListScreen: React.FC<PatientRevenueInfoListScreenProps> = ({ reactProps }) => {
  const rows = (reactProps?.rows || []).filter((r) => r.Status === 1);
  const cc = reactProps?.currentcontext || {};

  return (
    <>
      <div className="row">
        <form id="item_form" name="item_form" className="form-horizontal" role="form">
          <div className="table-height formRoot bill_patrevenueinfo" id="mainresponsivetablecontrol">
            <table className="table table-hover table-responsive table-bordered">
              <thead className="bg-subhead">
                <tr>
                  <th className="col-sm-3"><span>Date</span></th>
                  <th className="col-sm-3"><span>Revenue Category</span></th>
                  <th className="col-sm-3"><span>Credit Amount</span></th>
                  <th className="col-sm-3"><span>Debit Amount</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.TransactionDate}</td>
                    <td>{row.ServiceCategoryName}</td>
                    <td><label className="pull-right">{formatCurrency(row.CreditAmount)}</label></td>
                    <td><label className="pull-right">{formatCurrency(row.DebitAmount)}</label></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
      <div className="row">
        <div className="pull-right-table">
          <div className="col-sm-4">
            <table id="bannerdetails">
              <tbody>
                <tr>
                  <td className="totallabel">Total</td>
                  <td><span>{formatCurrency(cc.TotalCredit)}</span></td>
                </tr>
                <tr>
                  <td className="totallabel">Debit</td>
                  <td><span>{formatCurrency(cc.TotalDebit)}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
