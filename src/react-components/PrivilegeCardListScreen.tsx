import React, { useState } from 'react';

interface CardRow {
  Id?: number;
  UserName?: string;
  PromotionSchemeType?: { Description?: string };
  ValidTo?: string;
  CardNo?: string;
  PromotionSchemeName?: string;
}

interface LookupItem {
  Id: number;
  Text: string;
}

interface PrivilegeCardListScreenProps {
  reactProps?: {
    currentfilter?: { MembershipNumber?: string; FromDate?: string; ToDate?: string; CardTypeId?: number };
    lookup?: { PromotionSchemeType?: LookupItem[] };
    rows?: CardRow[];
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

function toDateInputValue(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// React bridge migration (single mount). Replaces privilegecardListController's
// header/filter row and <custom-table> grid (see PromotionalSchemesListScreen.tsx
// for the shared custom-table background). No native widgets, no
// utl.Validator.validate. Pagination footer (uib-pagination) is kept
// native below this mount, same rationale as promotionalschemes.
//
// Confirmed pre-existing quirk, reproduced as-is: the MembershipNumber
// search input (top-right, on-enter="getList()") is bound to
// currentfilter.MembershipNumber, but getList()'s Params never include
// it -- typing a value and pressing Enter re-fetches the exact same
// unfiltered list. Dead-but-rendered, not fixed.
export const PrivilegeCardListScreen: React.FC<PrivilegeCardListScreenProps> = ({ reactProps, onAction }) => {
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
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  return (
    <>
      <div className="row page-header">
        <h4 className="col-sm-5 mt0">Privilege Card Registered List</h4>
        <div className="col-sm-7">
          <div className="filters">
            <div className="search">
              <input
                type="text"
                className="form-control"
                placeholder="Location"
                value={currentfilter.MembershipNumber ?? ''}
                onChange={(e) => dispatch('membershipNumberChange', { value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('fetch'); }}
              />
              <i className="fas fa-search" aria-hidden="true"></i>
            </div>
            <button type="button" className="btn-add" onClick={() => dispatch('addNew')}>
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-3">
          <label className="col-sm-4">From Date</label>
          <div className="col-sm-8">
            <input
              type="date"
              className="form-control"
              value={toDateInputValue(currentfilter.FromDate)}
              onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-3">
          <label className="col-sm-4">To Date</label>
          <div className="col-sm-8">
            <input
              type="date"
              className="form-control"
              value={toDateInputValue(currentfilter.ToDate)}
              onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group col-sm-3">
          <label className="col-sm-4">Scheme Type</label>
          <div className="col-sm-8">
            <select
              className="form-control filter-combo"
              value={currentfilter.CardTypeId ?? ''}
              onChange={(e) => dispatch('cardTypeChange', { value: Number(e.target.value) })}
            >
              {(lookup.PromotionSchemeType || []).map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="custom-table table-striped table-bordered">
          <table className="table table-bordered bordered table-striped table-condensed datatable">
            <thead>
              <tr>
                <th>S.No</th>
                <th onClick={() => headerClick('PromotionSchemeType.Description')}>Scheme Type</th>
                <th onClick={() => headerClick('ValidTo')}>Eligibile Date</th>
                <th onClick={() => headerClick('CardNo')}>Card#</th>
                <th onClick={() => headerClick('PromotionSchemeName')}>PromtionalScheme Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{row.PromotionSchemeType?.Description}</td>
                  <td>{row.ValidTo ? new Date(row.ValidTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                  <td>{row.CardNo}</td>
                  <td>{row.PromotionSchemeName}</td>
                  <td>
                    <span className="grid-action" onClick={() => dispatch('view', { Id: row.Id })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                    <span className="grid-action" onClick={() => dispatch('delete', { Id: row.Id, UserName: row.UserName })}>
                      <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                    </span>
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
