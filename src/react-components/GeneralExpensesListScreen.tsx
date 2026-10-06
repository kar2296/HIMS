import React, { useState } from 'react';

interface ExpenseRow {
  Id?: number;
  ExpenseDate?: string;
  VoucherNo?: string;
  ExpenseAmount?: number;
  RequestedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  GeneralExpenseType?: { Description?: string };
  PaymentType?: { Description?: string };
  Remarks?: string;
  GeneralExpenseStatus?: { Description?: string };
  ExpenseStatusId?: number;
}

interface GeneralExpensesListScreenProps {
  reactProps?: {
    rows?: ExpenseRow[];
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

// React bridge migration (hybrid, results-table part of the
// generalexpenses-list split -- see GeneralExpensesFilterScreen.tsx for
// the live <autosearch> widget this sandwiches and the filter fields).
// Replaces the <custom-table> grid (GeneralExpensesListController's
// vm.gridConfig), reproducing column-header-click sort and the
// Cancel/Delete icon visibility rules (Cancel shown for
// ExpenseStatusId==2, Delete shown for ExpenseStatusId==1). The
// original's rowTemplate/enableColumnResizing gridConfig properties are
// dead -- custom-table.html (the shared directive) ignores both, so no
// equivalent is reproduced.
export const GeneralExpensesListScreen: React.FC<GeneralExpensesListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];
  const [sort, setSort] = useState<SortState>(null);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

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
    <div className="custom-table table-striped table-bordered">
          <table className="table table-bordered bordered table-striped table-condensed datatable">
            <thead>
              <tr>
                <th>S.No</th>
                <th onClick={() => headerClick('ExpenseDate')}>Date</th>
                <th onClick={() => headerClick('VoucherNo')}>Voucher No</th>
                <th onClick={() => headerClick('ExpenseAmount')}>Amount</th>
                <th onClick={() => headerClick('RequestedUser.FirstName')}>Requested By</th>
                <th onClick={() => headerClick('GeneralExpenseType.Description')}>Type</th>
                <th onClick={() => headerClick('PaymentType.Description')}>Payment Mode</th>
                <th>Remarks</th>
                <th onClick={() => headerClick('GeneralExpenseStatus.Description')}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td>{idx + 1}</td>
                  <td>
                    {row.ExpenseDate ? new Date(row.ExpenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                    {row.ExpenseDate ? new Date(row.ExpenseDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                  </td>
                  <td>{row.VoucherNo}</td>
                  <td>{formatCurrency(row.ExpenseAmount)}</td>
                  <td>{row.RequestedUser?.Title?.Description} {row.RequestedUser?.FirstName} {row.RequestedUser?.LastName}</td>
                  <td>{row.GeneralExpenseType?.Description}</td>
                  <td>{row.PaymentType?.Description}</td>
                  <td>{row.Remarks}</td>
                  <td>{row.GeneralExpenseStatus?.Description}</td>
                  <td>
                    <span className="grid-action" onClick={() => dispatch('view', { Id: row.Id })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                    {row.ExpenseStatusId === 2 && (
                      <span className="grid-action" onClick={() => dispatch('cancel', { Id: row.Id })}>
                        <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                      </span>
                    )}
                    {row.ExpenseStatusId === 1 && (
                      <span className="grid-action" onClick={() => dispatch('delete', { Id: row.Id })}>
                        <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
  );
};
