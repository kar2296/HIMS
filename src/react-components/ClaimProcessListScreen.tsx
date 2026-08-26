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

interface ClaimProcessListScreenProps {
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

// React bridge migration, results table for the HYBRID claimprocess.html
// split (see ClaimProcessFilterScreen.tsx for the search/filters row this
// sandwiches, plus the native <multiselectchk> Status filter that stays
// untouched there). Replaces <custom-table config="vm.gridConfig">.
//
// Confirmed pre-existing column-label mismatches in
// claimprocessController's vm.gridConfig.columnDefs, reproduced exactly
// (not corrected, per "document, don't fix"):
//   - "Claim No" header actually renders the SubmittedOn date/time
//   - "UHID" header actually renders ClaimNumber
//   - "Patient Name" header actually renders Guarantor.GuarantorName
//   - "Claim Date" header actually renders ClaimAmount (currency)
//   - "Payer Name" header actually renders the Createdy/CreatedUser name
// Column-header-click sort emulates ui-grid's default (client-side,
// string-compare) behavior against the underlying (mislabeled) field.
// The single Action-column link dispatches 'claim', which in the
// original calls $state.go('app.claimprocessform', {id: row.entity.Id})
// -- that route target is the CONFIRMED-BROKEN claimprocessform screen
// (controller/template mismatch, left untouched elsewhere in this
// migration), so this link still navigates there unchanged since
// navigation targets are not something this migration corrects.
export const ClaimProcessListScreen: React.FC<ClaimProcessListScreenProps> = ({ reactProps, onAction }) => {
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
            <th onClick={() => headerClick('SubmittedOn')}>Claim No</th>
            <th onClick={() => headerClick('ClaimNumber')}>UHID</th>
            <th onClick={() => headerClick('Guarantor.GuarantorName')}>Patient Name</th>
            <th onClick={() => headerClick('ClaimAmount')}>Claim Date</th>
            <th onClick={() => headerClick('CreatedUser.FirstName')}>Payer Name</th>
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
                <a className="grid-action btn btn-warning btn-xs" onClick={() => dispatch('claim', { Id: row.Id })}>
                  <i className="fa fa-usd" aria-hidden="true"></i>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
