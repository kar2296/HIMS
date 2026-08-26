import React, { useState } from 'react';

interface ClaimRow {
  Id?: number;
  SubmittedOn?: string;
  ClaimNumber?: string;
  Guarantor?: { GuarantorName?: string };
  ClaimAmount?: number;
  CreatedUser?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  ClaimSubmissionStatus?: { Description?: string };
}

interface ClaimSubmissionListScreenProps {
  reactProps?: {
    rows?: ClaimRow[];
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

// React bridge migration, results table for the HYBRID
// claimsubmission-list.html split (see ClaimSubmissionFilterScreen.tsx
// for the search/filters row this sandwiches, plus the native
// <autosearch>/<multiselectchk> widgets that stay untouched there).
// Replaces <custom-table config="vm.gridConfig">, with column-sort
// emulation. Unlike the near-duplicate claimprocess.js/.html screen
// (which has multiple confirmed column-label mismatches, see
// ClaimProcessListScreen.tsx), this screen's column labels correctly
// match their underlying fields -- no mismatches to document here.
// The single Action-column link dispatches 'claim', which in the
// original navigates to app.claimsubmission-form with the row's Id.
export const ClaimSubmissionListScreen: React.FC<ClaimSubmissionListScreenProps> = ({ reactProps, onAction }) => {
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
            <th onClick={() => headerClick('SubmittedOn')}>Submission Date</th>
            <th onClick={() => headerClick('ClaimNumber')}>Batch No.</th>
            <th onClick={() => headerClick('Guarantor.GuarantorName')}>Payer Name</th>
            <th onClick={() => headerClick('ClaimAmount')}>Total Amount</th>
            <th onClick={() => headerClick('CreatedUser.FirstName')}>Created By</th>
            <th onClick={() => headerClick('ClaimSubmissionStatus.Description')}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td>
                {row.SubmittedOn ? new Date(row.SubmittedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                {row.SubmittedOn ? new Date(row.SubmittedOn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
              </td>
              <td>{row.ClaimNumber}</td>
              <td>{row.Guarantor?.GuarantorName}</td>
              <td className="pl-3">{formatCurrency(row.ClaimAmount)}</td>
              <td>
                {row.CreatedUser?.Title?.Description}&nbsp;
                {row.CreatedUser?.FirstName}&nbsp;
                {row.CreatedUser?.LastName}
              </td>
              <td>{row.ClaimSubmissionStatus?.Description}</td>
              <td>
                <span className="grid-action" title="Edit" onClick={() => dispatch('claim', { Id: row.Id })}>
                  <i className="fa fa-usd" aria-hidden="true"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
