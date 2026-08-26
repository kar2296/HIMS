import React from 'react';

interface PatientBill {
  BillDateTime?: string;
  BillNumber?: string;
  BillAmount?: number;
  BillDiscount?: number;
  OutStandingAmount?: number;
  User?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
}

interface BillItem {
  Id?: number;
  Status?: number;
  IsAllOrderSelected?: boolean;
  IsSelected?: boolean;
  Patient?: { FirstName?: string };
  BillDateTime?: string;
  BillNumber?: string;
  BillAmount?: number;
  BillDiscount?: number;
  OutStandingAmount?: number;
  User?: { FirstName?: string };
  PatientBill?: PatientBill;
}

interface ClaimSubmissionFormBillsScreenProps {
  reactProps?: {
    currentcontext?: { id?: number; selectall?: boolean };
    GuarantorBills?: BillItem[];
    CanshowViewbtn?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDT(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

// React bridge migration: the Load-Bills table from
// claimsubmission-form.html. Flagged high-risk (financial calculation +
// checkbox-driven selection feeding the batch's ClaimAmount) and
// investigated in full before building.
//
// Confirmed pre-existing dead code, NOT reproduced: the controller
// defines an extensive vm.gridConfig (real ui-grid columnDefs,
// enableRowSelection, onRegisterApi/$scope.gridApi) that is NEVER bound
// to any element anywhere in the actual template -- the visible table
// is a plain ng-repeat over $scope.GuarantorBills, which is what is
// reproduced here. This mirrors the same dead-gridConfig pattern found
// in claim-summary.js, claimcoveringletter.js, and
// claimcoveringletterview.js elsewhere in this module.
//
// The original renders two near-duplicate <tbody> blocks switched by
// ng-show="currentcontext.id==0" / "==">0" -- one reading bill fields
// directly off `items`, the other off `items.PatientBill` (plus four
// print/covering-letter action icons gated on CanshowViewbtn). Both are
// unified here into one row renderer keyed on `isExisting`, with
// identical field selection to the original for each case.
export const ClaimSubmissionFormBillsScreen: React.FC<ClaimSubmissionFormBillsScreenProps> = ({ reactProps, onAction }) => {
  const currentcontext = reactProps?.currentcontext || {};
  const isExisting = (currentcontext.id ?? 0) > 0;
  const rows = (reactProps?.GuarantorBills || []).filter((r) => r.Status === 1);
  const canShowViewBtn = !!reactProps?.CanshowViewbtn;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const bill = (row: BillItem): PatientBill => (isExisting ? row.PatientBill || {} : row);

  return (
    <div className="col-sm-12">
      <table className="col-sm-12 table-bordered table">
        <thead style={{ backgroundColor: '#ccc' }}>
          <tr>
            <th>
              <span>
                <input
                  type="checkbox"
                  checked={!!currentcontext.selectall}
                  onChange={(e) => dispatch('selectAllItems', { value: e.target.checked })}
                />
              </span>
            </th>
            <th><span>Bill Date</span></th>
            <th><span>Patient</span></th>
            <th><span>Bill #.</span></th>
            <th><span>Bill Amount</span></th>
            <th><span>Discount</span></th>
            <th><span>Outstanding</span></th>
            <th><span>Doctor Name</span></th>
            <th className="col-sm-1 cell-align-center"><span>Actions</span></th>
          </tr>
        </thead>
        <tbody style={{ color: '#000000' }}>
          {rows.map((row, idx) => {
            const b = bill(row);
            return (
              <tr key={row.Id ?? idx}>
                <td>
                  <center>
                    <span>
                      <input
                        type="checkbox"
                        className="case"
                        checked={!!row.IsAllOrderSelected}
                        onChange={(e) => dispatch('rowSelectChange', { index: idx, value: e.target.checked })}
                      />
                    </span>
                  </center>
                </td>
                <td><span>{formatDT(b.BillDateTime)}</span></td>
                <td><span>{row.Patient?.FirstName}</span></td>
                <td><span>{b.BillNumber}</span></td>
                <td><span>{b.BillAmount}</span></td>
                <td><span>{b.BillDiscount}</span></td>
                <td><span>{b.OutStandingAmount}</span></td>
                <td><span>{isExisting ? b.User?.FirstName : row.User?.FirstName}</span></td>
                <td>
                  {isExisting && canShowViewBtn && (
                    <>
                      <button className="drhms-icon" title="View" tabIndex={-1} onClick={() => dispatch('coveringletter', { index: idx })}>
                        <i className="fa-regular fa-newspaper"></i>
                      </button>
                      <button className="drhms-icon" title="Corporate Cover Letter" onClick={() => dispatch('corporatecoverprint', { Id: row.Id })}>
                        <i className="fa-solid fa-print"></i>
                      </button>
                      <button className="drhms-icon" tabIndex={-1} title="OP Cover Letter" onClick={() => dispatch('opcoverprint', { Id: row.Id })}>
                        <i className="fa-solid fa-print"></i>
                      </button>
                      <button className="drhms-icon" tabIndex={-1} title="TPA Cover Letter" onClick={() => dispatch('tpacoverprint', { Id: row.Id })}>
                        <i className="fa-solid fa-print"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
