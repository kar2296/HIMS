import React, { useState } from 'react';
import { colors, radii, shadows, typography, spacing } from '../components/ui/tokens';

export interface IpBillingReceiptsScreenProps {
  reactProps?: {
    gridProps?: {
      columns?: any[];
      rows?: any[];
      actionsHeader?: string;
      hasActions?: boolean;
      highlightStyle?: React.CSSProperties;
    };
    TotalAmt?: number | string;
    canAdvance?: boolean;
    canAdjustments?: boolean;
    isDisabled?: boolean;
    pagerObj?: {
      totalItems: number;
      currentPage: number;
      pageSize: number;
      startIndex: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const IpBillingReceiptsScreen: React.FC<IpBillingReceiptsScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const {
    gridProps = {},
    TotalAmt = 0,
    canAdvance = true,
    canAdjustments = true,
    isDisabled = false,
    pagerObj = { totalItems: 0, currentPage: 1, pageSize: 25, startIndex: 0 },
  } = reactProps || {};

  const columns = gridProps.columns || [];
  const rows = gridProps.rows || [];
  const hasActions = Boolean(gridProps.hasActions);
  const actionsHeader = gridProps.actionsHeader || 'Actions';

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const valA = a.cells?.[sortKey] ?? '';
      const valB = b.cells?.[sortKey] ?? '';
      const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      return sortAsc ? comp : -comp;
    });
  }, [rows, sortKey, sortAsc]);

  // Formatter for currency
  const formatCurrency = (amt: any) => {
    const n = Number(amt);
    if (isNaN(n)) return '₹0.00';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Pagination calculation
  const totalItems = pagerObj.totalItems || rows.length || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        width: '100%',
        color: colors.textMain,
        boxSizing: 'border-box',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. MODERN ACTION BAR (TITLE & BUTTONS)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 12,
        }}
      >
        {/* Left: Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
            }}
          >
            <i className="fas fa-receipt" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Advance Collections & Payment Receipts
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                }}
              >
                {totalItems} {totalItems === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
              Manage inpatient advance deposits, fund transfers, and payment vouchers
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canAdjustments && (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => dispatch('adjustments')}
              title="Adjust Against Advance / Fund"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 15px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
            >
              <i className="fas fa-sliders-h" style={{ fontSize: 13, color: '#0d9488' }} />
              <span>Adjustments</span>
            </button>
          )}

          {canAdvance && (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => dispatch('advance')}
              title="Add Inpatient Advance Deposit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 18px',
                borderRadius: radii.md,
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.25)';
                }
              }}
            >
              <i className="fas fa-plus-circle" style={{ fontSize: 13 }} />
              <span>Advance</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DATA TABLE CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th
                  style={{
                    width: '50px',
                    padding: '10px 14px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid #e2e8f0',
                  }}
                >
                  #
                </th>
                {columns.map((col: any) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{
                        padding: '10px 14px',
                        textAlign: col.align || 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isSorted ? '#2563eb' : '#64748b',
                        letterSpacing: '0.04em',
                        borderBottom: '2px solid #e2e8f0',
                        cursor: col.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <i
                            className={
                              isSorted
                                ? sortAsc
                                  ? 'fas fa-arrow-up'
                                  : 'fas fa-arrow-down'
                                : 'fas fa-sort'
                            }
                            style={{
                              fontSize: 10,
                              color: isSorted ? '#2563eb' : '#94a3b8',
                            }}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
                {hasActions && (
                  <th
                    style={{
                      width: '160px',
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#64748b',
                      letterSpacing: '0.04em',
                      borderBottom: '2px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {actionsHeader}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 2 : 1)}
                    style={{
                      padding: '48px 20px',
                      textAlign: 'center',
                      color: '#94a3b8',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: radii.full,
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: '#94a3b8',
                        }}
                      >
                        <i className="fas fa-file-invoice" />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                        No receipt records found
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Advance deposits and receipt vouchers for this patient will appear here
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedRows.map((row: any, rIdx: number) => {
                  const isCancelled = row.cells?.['ReceiptStatus.Description']?.toLowerCase()?.includes('cancel') || row.highlight;
                  return (
                    <tr
                      key={row.id || rIdx}
                      style={{
                        backgroundColor: isCancelled ? '#fff5f5' : rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isCancelled ? '#fee2e2' : '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isCancelled ? '#fff5f5' : rIdx % 2 === 0 ? '#ffffff' : '#fafafa';
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontSize: 12,
                          color: '#64748b',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        {startItem + rIdx}
                      </td>

                      {columns.map((col: any) => {
                        const cellVal = row.cells?.[col.key] ?? '';
                        const isAmt = col.key === 'AmountPaid' || col.align === 'right';
                        const isReceiptNo = col.key === 'ReceiptNumber';
                        const isStatus = col.key === 'ReceiptStatus.Description';
                        const isPayMode = col.key === 'PaymentType.Description';

                        return (
                          <td
                            key={col.key}
                            style={{
                              padding: '10px 14px',
                              textAlign: col.align || 'left',
                              fontSize: 13,
                              borderBottom: '1px solid #f1f5f9',
                              color: isCancelled ? '#991b1b' : '#1e293b',
                              fontVariantNumeric: isAmt ? 'tabular-nums' : undefined,
                            }}
                          >
                            {isReceiptNo ? (
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontFamily: 'monospace',
                                  fontSize: 12.5,
                                }}
                              >
                                {cellVal}
                              </span>
                            ) : isAmt ? (
                              <span style={{ fontWeight: 700, color: isCancelled ? '#dc2626' : '#0f172a' }}>
                                {cellVal}
                              </span>
                            ) : isStatus ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 8px',
                                  borderRadius: radii.full,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  backgroundColor: isCancelled ? '#fef2f2' : '#ecfdf5',
                                  color: isCancelled ? '#dc2626' : '#059669',
                                  border: `1px solid ${isCancelled ? '#fecaca' : '#a7f3d0'}`,
                                }}
                              >
                                {cellVal}
                              </span>
                            ) : isPayMode ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 8px',
                                  borderRadius: radii.sm,
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                {cellVal}
                              </span>
                            ) : (
                              <span>{cellVal}</span>
                            )}
                          </td>
                        );
                      })}

                      {hasActions && (
                        <td
                          style={{
                            padding: '8px 14px',
                            textAlign: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {row.actions && row.actions.length > 0 ? (
                              row.actions.map((act: any) => {
                                const isDanger = act.key === 'delete' || act.key === 'cancel';
                                const isSuccess = act.key === 'fund' || act.key === 'refund';
                                return (
                                  <button
                                    key={act.key}
                                    type="button"
                                    title={act.title || act.key}
                                    onClick={() => dispatch('rowAction', { key: act.key, id: row.id })}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: radii.md,
                                      border: '1px solid #e2e8f0',
                                      backgroundColor: '#ffffff',
                                      color: act.color || (isDanger ? '#ef4444' : isSuccess ? '#16a34a' : '#2563eb'),
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: 12,
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = isDanger ? '#fee2e2' : isSuccess ? '#dcfce7' : '#eff6ff';
                                      e.currentTarget.style.borderColor = isDanger ? '#fca5a5' : isSuccess ? '#86efac' : '#93c5fd';
                                      e.currentTarget.style.transform = 'scale(1.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ffffff';
                                      e.currentTarget.style.borderColor = '#e2e8f0';
                                      e.currentTarget.style.transform = 'none';
                                    }}
                                  >
                                    <i className={act.icon || 'fas fa-cog'} />
                                  </button>
                                );
                              })
                            ) : (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>-</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FINANCIAL SUMMARY & PAGINATION FOOTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          padding: '12px 18px',
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
            Showing {startItem}-{endItem} of {totalItems} items
          </span>

          {totalPages > 1 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => dispatch('pageChange', 1)}
                title="First Page"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage <= 1 ? '#cbd5e1' : '#475569',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fas fa-angle-double-left" />
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => dispatch('pageChange', currentPage - 1)}
                title="Previous Page"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage <= 1 ? '#cbd5e1' : '#475569',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fas fa-angle-left" />
              </button>

              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: radii.sm,
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid #bfdbfe',
                }}
              >
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => dispatch('pageChange', currentPage + 1)}
                title="Next Page"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fas fa-angle-right" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => dispatch('pageChange', totalPages)}
                title="Last Page"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.sm,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                <i className="fas fa-angle-double-right" />
              </button>
            </div>
          )}
        </div>

        {/* Financial Stat Box: Total Receipts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 16px',
            borderRadius: radii.md,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            boxShadow: '0 1px 2px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.full,
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            <i className="fas fa-wallet" />
          </div>
          <div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#15803d',
                letterSpacing: '0.04em',
              }}
            >
              Total Receipts / Advance
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: '#14532d',
                letterSpacing: '-0.01em',
              }}
            >
              {formatCurrency(TotalAmt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
