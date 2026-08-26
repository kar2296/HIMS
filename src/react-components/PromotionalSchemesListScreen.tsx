import React, { useState } from 'react';

interface SchemeRow {
  Id?: number;
  PromotionSchemeName?: string;
  ActiveStatus?: { Description?: string };
  ActiveStatusId?: number;
}

interface LookupItem {
  Id: number;
  Text: string;
}

interface PromotionalSchemesListScreenProps {
  reactProps?: {
    currentfilter?: { ActiveStatusId?: number };
    lookup?: { ActiveStatus?: LookupItem[] };
    rows?: SchemeRow[];
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

// React bridge migration (single mount). Replaces the <custom-table> grid
// (promotionalSchemeListController's vm.gridConfig, a shared app-wide
// component defined in public/js/app.js + custom-table.html) with a
// purpose-built table reproducing its exact behavior: columnDefs-driven
// columns, client-side column-header-click sorting (custom-table's
// reOrder(), string-lowercase compare via dot-path field lookup, order
// flips on repeated clicks of the same column), and the same edit/delete
// action-icon visibility rules (edit shown for ActiveStatusId in
// {1,2,3,4,5} i.e. always; delete shown only for ActiveStatusId==1).
// No native widgets, no utl.Validator.validate -- single mount.
export const PromotionalSchemesListScreen: React.FC<PromotionalSchemesListScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
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
    setSort((prev) => {
      if (prev && prev.field === field) {
        return { field, order: prev.order === 1 ? -1 : 1 };
      }
      return { field, order: 1 };
    });
  };

  return (
    <>
      <div className="row page-header">
        <h4 className="col-sm-7 mt0">Promotional Schemes</h4>
        <div className="col-sm-5">
          <label className="col-sm-4 control-label filter-lbl">Status</label>
          <div className="col-sm-7">
            <select
              className="form-control filter-combo"
              value={currentfilter.ActiveStatusId ?? ''}
              onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
            >
              {(lookup.ActiveStatus || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-1">
            <button type="button" className="btn-add" onClick={() => dispatch('addNew')}>
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="custom-table table-striped table-bordered">
          <table className="table table-bordered bordered table-striped table-condensed datatable">
            <thead>
              <tr>
                <th onClick={() => headerClick('PromotionSchemeName')}>Scheme Name</th>
                <th onClick={() => headerClick('ActiveStatus.Description')}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td>{row.PromotionSchemeName}</td>
                  <td>{row.ActiveStatus?.Description}</td>
                  <td>
                    <span className="grid-action" onClick={() => dispatch('edit', { Id: row.Id })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                    {row.ActiveStatusId === 1 && (
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
      </div>
    </>
  );
};
