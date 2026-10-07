import React, { useMemo, useState } from 'react';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { colors, spacing, typography } from '../components/ui/tokens';

// Shared React view for simple master list screens (search box, drop-down filters, a sortable
// table with per-row action icons, pagination). The AngularJS controller stays in charge of the
// lookups, the list request, delete confirmation and navigation; it builds the view model below
// and handles the actions this component reports through onAction(...):
//   setSearch {value} · search · setFilter {key, value} · page {page} · addNew · home
//   rowAction {action, index} · headerAction {action}
// Filters are drop-downs by default; type 'text' filters report setFilter while typing and
// 'search' on Enter, type 'date' filters ("yyyy-MM-dd") report setFilter on change.
// Used by: Referrals, Ward Master, Division, Store Masters, Vendor Masters, Item Masters.

export interface MasterListOption { Id: number; Text: string }

export interface MasterListFilter {
  key: string;
  label: string;
  /** 'select' (default), 'text' or 'date'. */
  type?: 'select' | 'text' | 'date';
  value: number | string;
  /** Drop-down entries (select filters only). */
  options?: MasterListOption[];
  /** When set, an extra first entry with value -1 (the API's "no filter"). */
  allLabel?: string;
  placeholder?: string;
}

export interface MasterListHeaderAction {
  action: string;
  title: string;
  /** Font Awesome class. */
  icon: string;
}

export interface MasterListRowAction {
  action: string;
  title: string;
  /** 'edit' / 'delete' use the app's SVG icons; anything else is a Font Awesome class. */
  icon: string;
}

export interface MasterListRow {
  index: number;
  cells: Record<string, string>;
  actions: MasterListRowAction[];
}

export interface MasterListViewModel {
  id: string;
  labels: {
    title: string; searchPlaceholder?: string; addTooltip?: string; homeTooltip?: string;
    colActions: string; loading: string; noRecords: string;
  };
  search?: { value: string };
  filters: MasterListFilter[];
  columns: { key: string; label: string }[];
  rows: MasterListRow[];
  pager: { totalItems: number; currentPage: number; pageSize: number };
  loading: boolean;
  showAdd?: boolean;
  showHome?: boolean;
  /** Extra header buttons (e.g. print / export), reported as headerAction {action}. */
  headerActions?: MasterListHeaderAction[];
}

export interface MasterListScreenProps {
  reactProps?: MasterListViewModel;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

const ALL = -1;

const th: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.sm} ${spacing.sm}`, fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 0.5, color: colors.textMain, background: '#eef2f7', borderBottom: `2px solid ${colors.border}`,
  whiteSpace: 'nowrap', userSelect: 'none',
};
const td: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, fontSize: 13, color: colors.textMain, borderBottom: `1px solid ${colors.border}`,
};
const iconBtn = (bg: string): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: 8, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontSize: 16, flexShrink: 0,
});
const actionBtn: React.CSSProperties = {
  border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 4px', color: colors.textMain, fontSize: 15,
};

function ActionIcon({ icon }: { icon: string }) {
  if (icon === 'edit' || icon === 'delete') {
    return <img className="drhms-edit-button" src={`assets/svg/${icon}.svg`} alt="" />;
  }
  return <i className={icon} aria-hidden="true" />;
}

export const MasterListScreen: React.FC<MasterListScreenProps> = ({ reactProps, onAction }) => {
  const [sort, setSort] = useState<{ key: string; order: 1 | -1 } | null>(null);
  const rows = reactProps?.rows;

  // Clicking a column header sorts the loaded page; clicking it again reverses the order
  // (same as the old <custom-table> grid).
  const sortedRows = useMemo(() => {
    const list = rows || [];
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const x = (a.cells[sort.key] || '').toLowerCase();
      const y = (b.cells[sort.key] || '').toLowerCase();
      return x < y ? -sort.order : x > y ? sort.order : 0;
    });
  }, [rows, sort]);

  const vm = reactProps;
  if (!vm) return null;
  const send = (action: string, payload?: Record<string, unknown>) => onAction?.(action, payload);
  const L = vm.labels;
  const { totalItems, currentPage, pageSize } = vm.pager;
  const first = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalItems);
  const colCount = vm.columns.length + 1;

  const headerClick = (key: string) =>
    setSort((prev) => (prev && prev.key === key ? { key, order: prev.order === 1 ? -1 : 1 } : { key, order: 1 }));
  const sortMark = (key: string) => (sort && sort.key === key ? (sort.order === 1 ? ' ▲' : ' ▼') : '');
  const filterOptions = (f: MasterListFilter) => [
    ...(f.allLabel ? [{ value: ALL, label: f.allLabel }] : []),
    // Some lookups already contain their own -1 entry ("Please Select"); with "All" shown it
    // would be a second entry for the same value, so it is left out.
    ...(f.options || []).filter((o) => !(f.allLabel && o.Id === ALL)).map((o) => ({ value: o.Id, label: o.Text })),
  ];
  const renderFilter = (f: MasterListFilter) => {
    if (f.type === 'text') {
      return (
        <Input key={f.key} label={f.label} name={f.key} placeholder={f.placeholder ?? f.label} leftIcon="fas fa-search"
          value={String(f.value ?? '')}
          onChange={(e) => send('setFilter', { key: f.key, value: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') send('search'); }} />
      );
    }
    if (f.type === 'date') {
      return (
        <DatePicker key={f.key} label={f.label} name={f.key} value={String(f.value ?? '')}
          onChange={(v) => send('setFilter', { key: f.key, value: v })} />
      );
    }
    return (
      <Select key={f.key} label={f.label} name={f.key} options={filterOptions(f)} value={f.value}
        onChange={(v) => send('setFilter', { key: f.key, value: v === '' ? ALL : Number(v) })} />
    );
  };

  return (
    <div id={`${vm.id}-react`} style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{L.title}</h4>
        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
          {vm.search && (
            <div style={{ minWidth: 220 }}>
              <Input name="search" aria-label={L.searchPlaceholder} placeholder={L.searchPlaceholder}
                leftIcon="fas fa-search" value={vm.search.value}
                onChange={(e) => send('setSearch', { value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') send('search'); }} />
            </div>
          )}
          {(vm.headerActions || []).map((a) => (
            <button key={a.action} type="button" style={iconBtn('#0f766e')} title={a.title} aria-label={a.title}
              data-header-action={a.action} onClick={() => send('headerAction', { action: a.action })}>
              <i className={a.icon} aria-hidden="true" />
            </button>
          ))}
          {vm.showAdd !== false && (
            <button type="button" style={iconBtn('#2563eb')} title={L.addTooltip} aria-label={L.addTooltip} onClick={() => send('addNew')}>
              <i className="fa fa-plus" aria-hidden="true" />
            </button>
          )}
          {vm.showHome && (
            <button type="button" style={iconBtn('#64748b')} title={L.homeTooltip} aria-label={L.homeTooltip} onClick={() => send('home')}>
              <i className="fas fa-home" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {vm.filters.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
          {vm.filters.map(renderFilter)}
        </div>
      )}

      <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label={L.title} aria-busy={vm.loading}>
          <thead>
            <tr>
              {vm.columns.map((c) => (
                <th key={c.key} style={{ ...th, cursor: 'pointer' }} onClick={() => headerClick(c.key)}>{c.label}{sortMark(c.key)}</th>
              ))}
              <th style={{ ...th, width: 120 }}>{L.colActions}</th>
            </tr>
          </thead>
          <tbody style={{ opacity: vm.loading && sortedRows.length > 0 ? 0.5 : 1 }}>
            {sortedRows.length === 0 ? (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: colors.textMuted, padding: spacing.lg }} colSpan={colCount}>
                  {vm.loading ? L.loading : L.noRecords}
                </td>
              </tr>
            ) : (
              sortedRows.map((r) => (
                <tr key={r.index}>
                  {vm.columns.map((c) => <td key={c.key} style={td}>{r.cells[c.key]}</td>)}
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {r.actions.map((a) => (
                      <button key={a.action} type="button" style={actionBtn} title={a.title} data-action={a.action}
                        aria-label={`${a.title} ${r.cells[vm.columns[0]?.key] || ''}`.trim()}
                        onClick={() => send('rowAction', { action: a.action, index: r.index })}>
                        <ActionIcon icon={a.icon} />
                      </button>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap',
        marginTop: spacing.md, padding: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6 }}>
        <span style={{ fontSize: 13, color: colors.textMuted }} data-testid="masterlist-showing">
          Showing {first}-{last} of {totalItems} items
        </span>
        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize}
          onPageChange={(page) => send('page', { page })} />
      </div>
    </div>
  );
};

export default MasterListScreen;
