import React, { useMemo, useState } from 'react';
import { colors, radii, spacing, typography } from './tokens';
import { EmptyState } from './EmptyState';
import { Loading } from './Loading';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Dotted path into the row for the default cell renderer (e.g. "GuarantorType.Description"), mirrors the app's real dotParser-filtered custom-table columns. */
  field?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => React.Key;
  actions?: (row: T) => React.ReactNode;
  actionsHeader?: React.ReactNode;
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: string;
  onRowClick?: (row: T) => void;
  /** Client-side sort, matching the app's existing custom-table `reOrder` behavior (case-insensitive string compare, toggled ascending/descending). Pass false for screens whose real data is server-sorted/paginated instead. */
  clientSort?: boolean;
}

function resolveField(row: any, path?: string) {
  if (!path) return undefined;
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), row);
}

/**
 * Global read-only summary table -- formalizes the READ-ONLY SUMMARY GRID
 * pattern already used across several migrated Registration screens
 * (column-header click-to-sort mirroring the app's real custom-table
 * `reOrder` directive, actions column, empty/loading states). Purely
 * presentational: rows/columns/actions all come from whatever real data and
 * dispatched handlers the calling screen already has -- no new data source.
 */
export function DataTable<T>({
  columns, rows, rowKey, actions, actionsHeader = 'Actions', loading, emptyText = 'No records found',
  emptyIcon, onRowClick, clientSort = true,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; order: 1 | -1 } | null>(null);

  const sortedRows = useMemo(() => {
    if (!clientSort || !sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.field) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const x = String(resolveField(a, col.field) ?? '').toLowerCase();
      const y = String(resolveField(b, col.field) ?? '').toLowerCase();
      if (x < y) return -sort.order;
      if (x > y) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort, columns, clientSort]);

  const handleHeaderClick = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    setSort((prev) => (prev && prev.key === col.key ? { key: col.key, order: prev.order === 1 ? -1 : 1 } : { key: col.key, order: 1 }));
  };

  const thStyle = (col: DataTableColumn<T>): React.CSSProperties => ({
    textAlign: col.align || 'left',
    fontSize: '12px', fontWeight: 700, color: colors.textMuted,
    padding: `${spacing.md} ${spacing.md}`, borderBottom: `2px solid ${colors.border}`,
    backgroundColor: colors.surfaceMuted, cursor: col.sortable ? 'pointer' : 'default',
    userSelect: 'none', whiteSpace: 'nowrap', fontFamily: typography.fontFamily,
    width: col.width,
  });
  const tdStyle = (col: DataTableColumn<T>): React.CSSProperties => ({
    textAlign: col.align || 'left',
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.surfaceSunken}`,
    verticalAlign: 'middle', fontSize: '13px', color: colors.textMain, fontFamily: typography.fontFamily,
  });

  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: radii.lg, backgroundColor: colors.surface }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={thStyle(c)} onClick={() => handleHeaderClick(c)}>
                {c.header}
                {clientSort && sort?.key === c.key ? (sort.order === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            {actions && <th style={{ ...thStyle({ key: '__actions', header: '' } as DataTableColumn<T>), textAlign: 'center', cursor: 'default' }}>{actionsHeader}</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: spacing.xxl }}><Loading /></td></tr>
          ) : sortedRows.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: 0 }}><EmptyState text={emptyText} icon={emptyIcon} /></td></tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background-color 0.12s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.surfaceMuted; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map((c) => (
                  <td key={c.key} style={tdStyle(c)}>
                    {c.render ? c.render(row) : String(resolveField(row, c.field) ?? '')}
                  </td>
                ))}
                {actions && (
                  <td style={{ ...tdStyle({ key: '__actions', header: '' } as DataTableColumn<T>), textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: spacing.sm, alignItems: 'center' }}>{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
