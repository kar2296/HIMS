import React from 'react';

interface RevenueRow {
  TransactionDate?: string;
  ServiceCategoryName?: string;
  CreditAmount?: number;
  DebitAmount?: number;
  Status?: number;
}

interface CurrentContext {
  TotalCredit?: number;
  TotalDebit?: number;
}

interface PatientRevenueInfoListScreenProps {
  reactProps?: {
    rows?: RevenueRow[];
    currentcontext?: CurrentContext;
  };
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(dateStr);
  }
}

export const PatientRevenueInfoListScreen: React.FC<PatientRevenueInfoListScreenProps> = ({ reactProps }) => {
  const rows = (reactProps?.rows || []).filter((r) => r.Status === 1);
  const cc = reactProps?.currentcontext || {};

  const totalCredit = Number(cc.TotalCredit || 0);
  const totalDebit = Number(cc.TotalDebit || 0);
  const netRevenue = totalCredit - totalDebit;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. FINANCIAL KPI SUMMARY CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="pf-stats-bar">
        <div className="pf-stat-item highlight-emerald">
          <span>Total Revenue Credit</span>
          <strong>₹ {formatCurrency(totalCredit)}</strong>
        </div>
        <div className="pf-stat-item highlight-rose">
          <span>Total Revenue Debit</span>
          <strong>₹ {formatCurrency(totalDebit)}</strong>
        </div>
        <div className="pf-stat-item highlight-blue">
          <span>Net Revenue Balance</span>
          <strong>₹ {formatCurrency(netRevenue)}</strong>
        </div>
      </div>

      {/* Hidden legacy table for backwards selector compatibility */}
      <table id="bannerdetails" style={{ display: 'none' }}>
        <tbody>
          <tr>
            <td className="totallabel">Total</td>
            <td><span>{formatCurrency(totalCredit)}</span></td>
          </tr>
          <tr>
            <td className="totallabel">Debit</td>
            <td><span>{formatCurrency(totalDebit)}</span></td>
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
              <i className="fa-solid fa-chart-pie" aria-hidden="true" />
              <span>Patient Service Revenue Distribution</span>
              <span className="pf-table-count-badge">{rows.length} Categories Found</span>
            </h4>
          </div>

          <div className="pf-table-responsive">
            <table className="pf-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th><span>Date</span></th>
                  <th><span>Revenue / Service Category</span></th>
                  <th style={{ textAlign: 'right' }}><span>Credit Amount</span></th>
                  <th style={{ textAlign: 'right' }}><span>Debit Amount</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 500 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(row.TransactionDate)}
                      </span>
                    </td>
                    <td>
                      <span className="pf-badge-blue">
                        {row.ServiceCategoryName || 'General'}
                      </span>
                    </td>
                    <td className="pf-currency-cell pf-currency-emerald">
                      ₹ {formatCurrency(row.CreditAmount)}
                    </td>
                    <td className="pf-currency-cell pf-currency-rose">
                      ₹ {formatCurrency(row.DebitAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="pf-empty-state">
          <div className="pf-empty-icon">
            <i className="fa-solid fa-chart-pie" aria-hidden="true" />
          </div>
          <h3 className="pf-empty-title">No Revenue Records Loaded</h3>
          <p className="pf-empty-desc">
            Search and select a patient in the search box above to audit categorized service revenues, credits, and debits.
          </p>
          <div className="pf-empty-tips">
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Search by UHID or Patient Name
            </span>
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-calendar-days" aria-hidden="true" /> Flexible Accounting Date Range
            </span>
            <span className="pf-empty-tip-tag">
              <i className="fa-solid fa-coins" aria-hidden="true" /> Categorized Revenue Audit
            </span>
          </div>
        </div>
      )}
    </>
  );
};
