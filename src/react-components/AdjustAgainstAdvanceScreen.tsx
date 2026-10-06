import React from 'react';

interface AdvanceRow {
  Id?: number;
  Status?: number;
  ReceiptNumber?: string;
  ReceiptDateTime?: string;
  AmountPaid?: number | string;
  AmountAdjusted?: number | string;
  AmountAvailable?: number | string;
  AdjustAmount?: number | string;
  FullAmountAdjusted?: boolean;
  _idx?: number; // index into the full (unfiltered) $scope.advanceDetails array
}

interface AdjustAgainstAdvanceScreenProps {
  reactProps?: {
    rows?: AdvanceRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// React bridge migration: replaces the plain ng-repeat table in
// adjustagainstadvance.html (advance-payment picker used when adjusting an
// advance against a bill/due amount). The modal header (close X) and the
// footer "Adjust" button stay native -- they call cancelCallback()/
// AdjustAdvance() directly on $scope and don't need any React-side state.
//
// Rows are pre-filtered by the bridge to Status===1 (reproducing the
// original's `ng-repeat="... | filter:{Status:1}"`), with each row
// carrying `_idx`, its index into the full (unfiltered)
// $scope.advanceDetails array, so edits can be written back to the exact
// original array element that AdjustAdvance() reads from.
//
// CONFIRMED PRE-EXISTING BUGS reproduced as-is (not fixed):
// - `ng-keypress="numberonly($event)"` on the AdjustAmount input calls a
//   function that is never defined anywhere in this controller or
//   globally -- every keypress throws "numberonly is not a function"
//   (silently caught by Angular), so the intended numeric-only input
//   restriction never actually applies. The field accepts free text here
//   too; downstream parseFloat() already treats non-numeric input as NaN
//   (computeAdvance's `> 0` check is false for NaN), so no crash results.
// - `ng-pattern="/^\d+$/"` visual validation styling (red border on
//   invalid input) is not reproduced -- it never blocked saving in the
//   original either, since AdjustAdvance() never checks form validity.
export const AdjustAgainstAdvanceScreen: React.FC<AdjustAgainstAdvanceScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="table-height formRoot adj_height" id="mainresponsivetablecontrol">
      <table className="table table-hover table-responsive table-bordered">
        <thead className="bg-subhead">
          <tr>
            <th className="fs-12 col-sm-2"><span>Receipt No</span></th>
            <th className="fs-12 col-sm-2"><span>Receipt Date</span></th>
            <th className="fs-12 col-sm-2"><span>Receipt Amount</span></th>
            <th className="fs-12 col-sm-2"><span>Adjusted Amount</span></th>
            <th className="fs-12 col-sm-2"><span>Available Amount</span></th>
            <th className="fs-12 col-sm-2"><span>Adjust Amount</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row._idx ?? idx}>
              <td className="fs-12 col-sm-3"><span>{row.ReceiptNumber}</span></td>
              <td className="fs-12 col-sm-3"><span>{formatDate(row.ReceiptDateTime)}</span></td>
              <td className="fs-12 col-sm-2 currency-align"><span>{row.AmountPaid}</span></td>
              <td className="fs-12 col-sm-2 currency-align"><span>{row.AmountAdjusted}</span></td>
              <td className="fs-12 col-sm-2 currency-align"><span>{row.AmountAvailable}</span></td>
              <td className="fs-12 col-sm-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="0.00"
                  value={row.AdjustAmount ?? ''}
                  disabled={!!row.FullAmountAdjusted}
                  onChange={(e) => dispatch('adjustAmountChange', { idx: row._idx, value: e.target.value })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
