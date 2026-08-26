import { useState } from 'react';

interface Column {
  field: string;
  displayName: string;
}

interface Props {
  reactProps: any;
}

/**
 * billhistory-list modal: reproduces vm.gridConfig's 5 plain read-only
 * columns (Date, Status, CreatedBy, ReferenceNo, Comments), which are
 * driven purely by data + columnDefs -- there are no cellTemplates and
 * no ng-click/actions wiring anywhere in the original columnDefs, so
 * this is a plain display table. ui-grid's built-in column-header
 * click-to-sort (its default, since this columnDefs never sets
 * enableSorting: false) is reproduced as a simple 3-state toggle;
 * ui-grid's row virtualization, column resize, and filter row are not
 * reproduced since this screen's config uses none of them (a small,
 * non-virtualized modal list).
 *
 * NOTE on things intentionally NOT carried over: the original
 * controller defines $scope.handleEvents('edit'|'delete', row) but no
 * column or template in the original columnDefs ever calls it -- dead
 * code, confirmed via the controller and template, reproduced by
 * omission (no edit/delete affordance exists in the original render
 * either). The "Total" field below the grid is a static, hardcoded
 * value="420" input in the original markup (left native, unrelated to
 * this component) -- a pre-existing placeholder quirk, not something
 * this migration introduced.
 */
export function BillHistoryListScreen({ reactProps }: Props) {
  const columns: Column[] = reactProps?.columns || [];
  const rows: any[] = reactProps?.rows || [];
  const [sort, setSort] = useState<{ field: string; dir: 1 | -1 } | null>(null);

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const av = a?.[sort.field] ?? '';
        const bv = b?.[sort.field] ?? '';
        return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
      })
    : rows;

  const toggleSort = (field: string) => {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, dir: 1 };
      if (prev.dir === 1) return { field, dir: -1 };
      return null;
    });
  };

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.field} style={{ cursor: 'pointer' }} onClick={() => toggleSort(c.field)}>
              {c.displayName}
              {sort?.field === c.field ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, idx) => (
          <tr key={idx}>
            {columns.map((c) => (
              <td key={c.field}>{row?.[c.field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
