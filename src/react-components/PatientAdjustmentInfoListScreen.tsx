import React, { useState, useMemo } from 'react';

interface AdjustmentRow {
  TransactionDate?: string;
  TransactionNumber?: string;
  VisitNumber?: string;
  BillAmount?: number;
  PaidAmount?: number;
  AdjustedAmount?: number;
  UnAdjustedAmount?: number;
  DueAmount?: number;
}

interface CurrentContext {
  TotalBillAmount?: number;
  TotalPaidAmount?: number;
  TotalAdjustedAmount?: number;
  TotalUnAdjustedAmount?: number;
  TotalDueAmount?: number;
}

interface PatientAdjustmentInfoListScreenProps {
  reactProps?: {
    rows?: AdjustmentRow[];
    currentcontext?: CurrentContext;
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

function formatDate(dateStr?: string): { date: string; time: string } {
  if (!dateStr) return { date: '-', time: '' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: String(dateStr), time: '' };
    const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date: dateFormatted, time: timeFormatted };
  } catch (e) {
    return { date: String(dateStr), time: '' };
  }
}

export const PatientAdjustmentInfoListScreen: React.FC<PatientAdjustmentInfoListScreenProps> = ({ reactProps }) => {
  const rows = reactProps?.rows || [];
  const cc = reactProps?.currentcontext || {};
  const [sort, setSort] = useState<SortState>({ field: 'TransactionDate', order: -1 });

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const valA = dotGet(a, sort.field);
      const valB = dotGet(b, sort.field);
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * sort.order;
      }
      const x = String(valA ?? '').toLowerCase();
      const y = String(valB ?? '').toLowerCase();
      if (x < y) return -sort.order;
      if (x > y) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const headerClick = (field: string) => {
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  const renderSortIcon = (field: string) => {
    if (!sort || sort.field !== field) {
      return <i className="fa-solid fa-sort sort-icon" aria-hidden="true" />;
    }
    return sort.order === 1 ? (
      <i className="fa-solid fa-sort-up sort-icon" style={{ color: '#0284c7' }} aria-hidden="true" />
    ) : (
      <i className="fa-solid fa-sort-down sort-icon" style={{ color: '#0284c7' }} aria-hidden="true" />
    );
  };

  const hasDue = Number(cc.TotalDueAmount || 0) > 0;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. FINANCIAL KPI SUMMARY CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="pf-stats-bar">
        <div className="pf-stat-item">
          <span>Total Bill Amount</span>
          <strong>₹ {formatCurrency(cc.TotalBillAmount)}</strong>
        </div>
        <div className="pf-stat-item highlight-emerald">
          <span>Total Paid Amount</span>
          <strong>₹ {formatCurrency(cc.TotalPaidAmount)}</strong>
        </div>
        <div className="pf-stat-item highlight-blue">
          <span>Adjusted Amount</span>
          <strong>₹ {formatCurrency(cc.TotalAdjustedAmount)}</strong>
        </div>
        <div className="pf-stat-item highlight-amber">
          <span>Un-Adjusted Amount</span>
          <strong>₹ {formatCurrency(cc.TotalUnAdjustedAmount)}</strong>
        </div>
        <div className={`pf-stat-item ${hasDue ? 'highlight-rose' : ''}`}>
          <span>Outstanding Due</span>
          <strong>₹ {formatCurrency(cc.TotalDueAmount)}</strong>
        </div>
      </div>

      {/* Hidden legacy table for backwards selector compatibility */}
      <table id="bannerdetails" style={{ display: 'none' }}>
        <tbody>
          <tr>
            <td className="totallabel">Total</td>
            <td><span>{formatCurrency(cc.TotalBillAmount)}</span></td>
          </tr>
          <tr>
            <td className="totallabel">TotalPaidAmount</td>
            <td><span>{formatCurrency(cc.TotalPaidAmount)}</span></td>
          </tr>
          <tr>
            <td className="totallabel">Amount</td>
            <td><span>{formatCurrency(cc.TotalAdjustedAmount)}</span></td>
          </tr>
          <tr>
            <td className="totallabel">Unpaid Amount</td>
            <td><span>{formatCurrency(cc.TotalUnAdjustedAmount)}</span></td>
          </tr>
          <tr>
            <td className="totallabel">Due</td>
            <td><span>{formatCurrency(cc.TotalDueAmount)}</span></td>
          </tr>
        </tbody>
      </table>

      {/* ─────────────────────────────────────────────────────────────
          2. DATA TABLE OR ILLUSTRATED EMPTY STATE
      ───────────────────────────────────────────────────────────── */}
      {rows.length > 0 ? (
        <div className="pf-table-card">
          <div className="pf-table-header-bar">
            <h4 className="pf-table-header-title">
              <i className="fa-solid fa-table-list" aria-hidden="true" />
              <span>Patient Payment Adjustments Ledger</span>
              <span className="pf-table-count-badge">{rows.length} Records Found</span>
            </h4>
          </div>

          <div className="pf-table-responsive">
            <table className="pf-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th
                    className={`sortable ${sort?.field === 'TransactionDate' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('TransactionDate')}
                  >
                    <span>Date & Time</span>
                    {renderSortIcon('TransactionDate')}
                  </th>
                  <th
                    className={`sortable ${sort?.field === 'TransactionNumber' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('TransactionNumber')}
                  >
                    <span>Bill / Receipt No#</span>
                    {renderSortIcon('TransactionNumber')}
                  </th>
                  <th
                    className={`sortable ${sort?.field === 'VisitNumber' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('VisitNumber')}
                  >
                    <span>Visit No</span>
                    {renderSortIcon('VisitNumber')}
                  </th>
                  <th
                    style={{ textAlign: 'right' }}
                    className={`sortable ${sort?.field === 'BillAmount' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('BillAmount')}
                  >
                    <span>Bill Amount</span>
                    {renderSortIcon('BillAmount')}
                  </th>
                  <th
                    style={{ textAlign: 'right' }}
                    className={`sortable ${sort?.field === 'PaidAmount' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('PaidAmount')}
                  >
                    <span>Paid Amount</span>
                    {renderSortIcon('PaidAmount')}
                  </th>
                  <th
                    style={{ textAlign: 'right' }}
                    className={`sortable ${sort?.field === 'AdjustedAmount' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('AdjustedAmount')}
                  >
                    <span>Adjusted Amount</span>
                    {renderSortIcon('AdjustedAmount')}
                  </th>
                  <th
                    style={{ textAlign: 'right' }}
                    className={`sortable ${sort?.field === 'UnAdjustedAmount' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('UnAdjustedAmount')}
                  >
                    <span>Un-Adjusted</span>
                    {renderSortIcon('UnAdjustedAmount')}
                  </th>
                  <th
                    style={{ textAlign: 'right' }}
                    className={`sortable ${sort?.field === 'DueAmount' ? 'sorted-active' : ''}`}
                    onClick={() => headerClick('DueAmount')}
                  >
                    <span>Due Amount</span>
                    {renderSortIcon('DueAmount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => {
                  const { date, time } = formatDate(row.TransactionDate);
                  const isRowDue = Number(row.DueAmount || 0) > 0;

                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 500 }}>
                        {idx + 1}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{date}</span>
                        {time && <span style={{ marginLeft: 6, color: '#64748b', fontSize: 11.5 }}>{time}</span>}
                      </td>
                      <td>
                        <span className="pf-badge-blue">
                          {row.TransactionNumber || '-'}
                        </span>
                      </td>
                      <td>
                        {row.VisitNumber ? (
                          <span className="pf-badge-slate">{row.VisitNumber}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td className="pf-currency-cell">
                        ₹ {formatCurrency(row.BillAmount)}
                      </td>
                      <td className="pf-currency-cell pf-currency-emerald">
                        ₹ {formatCurrency(row.PaidAmount)}
                      </td>
                      <td className="pf-currency-cell pf-currency-indigo">
                        ₹ {formatCurrency(row.AdjustedAmount)}
                      </td>
                      <td className="pf-currency-cell" style={{ color: '#d97706' }}>
                        ₹ {formatCurrency(row.UnAdjustedAmount)}
                      </td>
                      <td className={`pf-currency-cell ${isRowDue ? 'pf-currency-rose' : ''}`}>
                        ₹ {formatCurrency(row.DueAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="pf-empty-state">
          <div className="pf-empty-icon">
            <i className="fa-solid fa-scale-balanced" aria-hidden="true" />
          </div>
          <h3 className="pf-empty-title">No Adjustment Records Loaded</h3>
          <p className="pf-empty-desc">
            Search and select a patient in the search box above to load and reconcile financial adjustments, receipts, and balance allocations.
          </p>
          <div className="pf-empty-tips">
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Search by UHID or Patient Name
            </span>
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-calendar-days" aria-hidden="true" /> Flexible Transaction Date Range
            </span>
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-file-invoice-dollar" aria-hidden="true" /> Real-Time Ledger Reconciliation
            </span>
          </div>
        </div>
      )}
    </>
  );
};
