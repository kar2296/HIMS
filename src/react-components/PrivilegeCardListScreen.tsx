import React, { useState } from 'react';
import { Pagination } from '../components/ui/Pagination';

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
    pager?: { totalItems: number; currentPage: number; pageSize: number };
    loading?: boolean;
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Same format as the old grid's "date : 'dd-MMM-yyyy'" filter, e.g. 01-Oct-2026.
function formatDdMmmYyyy(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
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
// utl.Validator.validate. Pagination is rendered here and reported as
// 'pageChange' (the old uib-pagination footer was removed).
//
// Search box (top-right): bound to currentfilter.MembershipNumber. It used
// to be dead (never sent); privilegecardlist.js now sends it as the API's
// CardNo filter when Enter is pressed, so it searches by Card#.
export const PrivilegeCardListScreen: React.FC<PrivilegeCardListScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const rows = reactProps?.rows || [];
  const pager = reactProps?.pager || { totalItems: 0, currentPage: 1, pageSize: 25 };
  const loading = !!reactProps?.loading;
  const firstIndex = (pager.currentPage - 1) * pager.pageSize;
  const lastIndex = Math.min(pager.currentPage * pager.pageSize, pager.totalItems);
  const fromValue = toDateInputValue(currentfilter.FromDate);
  const toValue = toDateInputValue(currentfilter.ToDate);
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
                placeholder="Search Card#"
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
              value={fromValue}
              max={toValue || undefined}
              aria-label="From Date"
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
              value={toValue}
              min={fromValue || undefined}
              aria-label="To Date"
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
              onChange={(e) => dispatch('cardTypeChange', { value: e.target.value ? Number(e.target.value) : undefined })}
            >
              {/* No scheme type selected = all types (same as the old empty ui-select). */}
              <option value="">All</option>
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
            <tbody style={{ opacity: loading && sortedRows.length > 0 ? 0.5 : 1 }} aria-busy={loading}>
              {sortedRows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#64748b' }}>
                    {loading ? 'Loading...' : 'No records found'}
                  </td>
                </tr>
              )}
              {sortedRows.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  {/* Numbered across pages (page 2 starts at 26, not 1). */}
                  <td>{firstIndex + idx + 1}</td>
                  <td>{row.PromotionSchemeType?.Description}</td>
                  <td>{formatDdMmmYyyy(row.ValidTo)}</td>
                  <td>{row.CardNo}</td>
                  <td>{row.PromotionSchemeName}</td>
                  <td>
                    <span className="grid-action" onClick={() => dispatch('view', { Id: row.Id })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                    <span className="grid-action" onClick={() => dispatch('delete', { Id: row.Id, UserName: row.UserName || (row.CardNo ? `card ${row.CardNo}` : 'this card') })}>
                      <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '8px 15px' }}>
        <span style={{ fontSize: 13, color: '#64748b' }} data-testid="privilegecard-showing">
          Showing {pager.totalItems === 0 ? 0 : firstIndex + 1}-{lastIndex} of {pager.totalItems} items
        </span>
        <Pagination currentPage={pager.currentPage} totalItems={pager.totalItems} pageSize={pager.pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })} />
      </div>
    </>
  );
};
