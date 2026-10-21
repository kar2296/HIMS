import React, { useState } from 'react';
import { colors, radii, shadows, typography, transitions } from '../components/ui/tokens';

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
    totalAmount?: number;
    totalRecords?: number;
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
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
      const x = dotGet(a, sort.field);
      const y = dotGet(b, sort.field);
      if (typeof x === 'number' && typeof y === 'number') {
        return (x - y) * sort.order;
      }
      const sx = String(x ?? '').toLowerCase();
      const sy = String(y ?? '').toLowerCase();
      if (sx < sy) return -sort.order;
      if (sx > sy) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const headerClick = (field: string) => {
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  const renderSortIcon = (field: string) => {
    if (!sort || sort.field !== field) {
      return <i className="fa-solid fa-sort" style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '6px' }} />;
    }
    return sort.order === 1 ? (
      <i className="fa-solid fa-sort-up" style={{ color: '#2563eb', fontSize: '11px', marginLeft: '6px' }} />
    ) : (
      <i className="fa-solid fa-sort-down" style={{ color: '#2563eb', fontSize: '11px', marginLeft: '6px' }} />
    );
  };

  const renderStatusBadge = (row: ExpenseRow) => {
    const statusId = row.ExpenseStatusId;
    const desc = row.GeneralExpenseStatus?.Description || (statusId === 2 ? 'Approved' : statusId === 3 ? 'Cancelled' : 'Draft');

    if (statusId === 2) {
      // Approved
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          {desc}
        </span>
      );
    }
    if (statusId === 3) {
      // Cancelled
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          {desc}
        </span>
      );
    }
    // Draft / Pending
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fde68a',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
        {desc}
      </span>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        boxSizing: 'border-box',
        marginBottom: '16px'
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12.5px',
            color: '#0f172a'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1.5px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <th style={{ padding: '12px 14px', width: '50px', textAlign: 'center' }}>#</th>
              <th
                onClick={() => headerClick('ExpenseDate')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Date {renderSortIcon('ExpenseDate')}
              </th>
              <th
                onClick={() => headerClick('VoucherNo')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Voucher No {renderSortIcon('VoucherNo')}
              </th>
              <th
                onClick={() => headerClick('ExpenseAmount')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', textAlign: 'right', whiteSpace: 'nowrap' }}
              >
                Amount {renderSortIcon('ExpenseAmount')}
              </th>
              <th
                onClick={() => headerClick('RequestedUser.FirstName')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Requested By {renderSortIcon('RequestedUser.FirstName')}
              </th>
              <th
                onClick={() => headerClick('GeneralExpenseType.Description')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Expense Type {renderSortIcon('GeneralExpenseType.Description')}
              </th>
              <th
                onClick={() => headerClick('PaymentType.Description')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Payment Mode {renderSortIcon('PaymentType.Description')}
              </th>
              <th style={{ padding: '12px 14px', minWidth: '130px' }}>Remarks</th>
              <th
                onClick={() => headerClick('GeneralExpenseStatus.Description')}
                style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}
              >
                Status {renderSortIcon('GeneralExpenseStatus.Description')}
              </th>
              <th style={{ padding: '12px 14px', textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length > 0 ? (
              sortedRows.map((row, idx) => {
                const dateObj = row.ExpenseDate ? new Date(row.ExpenseDate) : null;
                const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                const timeStr = dateObj ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                const userFullName = [
                  row.RequestedUser?.Title?.Description,
                  row.RequestedUser?.FirstName,
                  row.RequestedUser?.LastName
                ].filter(Boolean).join(' ') || '—';

                return (
                  <tr
                    key={row.Id ?? idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafafa')}
                  >
                    {/* S.No */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                      {idx + 1}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{dateStr}</div>
                      {timeStr && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: '10px', marginRight: '4px' }} />
                          {timeStr}
                        </div>
                      )}
                    </td>

                    {/* Voucher No */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#1e293b',
                          fontWeight: 700,
                          fontSize: '12px',
                          fontFamily: typography.fontFamilyMono,
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <i className="fa-solid fa-receipt" style={{ color: '#2563eb', fontSize: '10px' }} />
                        {row.VoucherNo || '—'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '13px',
                          fontFamily: typography.fontFamilyMono
                        }}
                      >
                        {formatCurrency(row.ExpenseAmount)}
                      </span>
                    </td>

                    {/* Requested By */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          <i className="fa-regular fa-user" />
                        </div>
                        <span style={{ fontWeight: 500, color: '#1e293b' }}>{userFullName}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {row.GeneralExpenseType?.Description || '—'}
                      </span>
                    </td>

                    {/* Payment Mode */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#334155'
                        }}
                      >
                        <i className="fa-solid fa-credit-card" style={{ color: '#64748b', fontSize: '11px' }} />
                        {row.PaymentType?.Description || '—'}
                      </span>
                    </td>

                    {/* Remarks */}
                    <td style={{ padding: '12px 14px', maxWidth: '200px' }}>
                      <span
                        title={row.Remarks || ''}
                        style={{
                          display: 'inline-block',
                          maxWidth: '190px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#475569',
                          fontSize: '11.5px'
                        }}
                      >
                        {row.Remarks || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {renderStatusBadge(row)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* View / Edit */}
                        <button
                          type="button"
                          title="View / Edit Voucher"
                          onClick={() => dispatch('view', { Id: row.Id })}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <i className="fa-regular fa-eye" />
                        </button>

                        {/* Cancel (ExpenseStatusId == 2) */}
                        {row.ExpenseStatusId === 2 && (
                          <button
                            type="button"
                            title="Cancel Voucher"
                            onClick={() => dispatch('cancel', { Id: row.Id })}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#d97706',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fffbeb';
                              e.currentTarget.style.borderColor = '#fde68a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            <i className="fa-solid fa-ban" />
                          </button>
                        )}

                        {/* Delete (ExpenseStatusId == 1) */}
                        {row.ExpenseStatusId === 1 && (
                          <button
                            type="button"
                            title="Delete Voucher"
                            onClick={() => dispatch('delete', { Id: row.Id })}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            <i className="fa-regular fa-trash-can" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} style={{ padding: 0 }}>
                  {/* Empty State */}
                  <div
                    style={{
                      padding: '50px 20px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        marginBottom: '16px',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
                      }}
                    >
                      <i className="fa-solid fa-receipt" />
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '6px'
                      }}
                    >
                      No Expense Vouchers Found
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        maxWidth: '380px',
                        lineHeight: 1.5,
                        marginBottom: '20px'
                      }}
                    >
                      There are no general expense vouchers matching your selected date range and filters. Create a new voucher to record an expense.
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch('addNew')}
                      style={{
                        padding: '9px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <i className="fa-solid fa-plus" style={{ fontSize: '11px' }} />
                      <span>Record First Expense</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
