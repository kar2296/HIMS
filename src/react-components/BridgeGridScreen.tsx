import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Button } from './Button';

export interface BridgeGridColumn {
  /** Cell key inside each row's `cells` map. The literal '__sno' renders the
   * 1-based position in the displayed order, matching the {{index+1}} S.No
   * cellTemplate every one of these grids uses. */
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Renders the cell as a clickable link that dispatches 'cellAction'
   * with { key, id }, for the cellTemplates wrapped in <a ng-click="...">. */
  link?: boolean;
}

export interface BridgeGridRow {
  id: number | string;
  /** Display strings, already formatted by the AngularJS bridge (using the
   * same $filter('date', ...) calls the original cellTemplates used), so no
   * formatting logic is duplicated in React. */
  cells: Record<string, string>;
  /** Per-row action button label, for grids with a single row action; omit
   * to hide the button for that row (the ng-show/ng-hide cellTemplates). */
  actionLabel?: string;
  /** Grids whose actions column holds several buttons supply them per row,
   * so a row can legitimately offer a different set (edit vs view vs delete)
   * exactly as its original ng-show/ng-hide cellTemplate did. */
  actions?: { key: string; label: string; variant?: string; icon?: string; color?: string; title?: string }[];
  /** Per-cell tooltip text, keyed by column key. Some original cellTemplates
   * wrap the cell in uib-tooltip (e.g. the Patient cell showing
   * "Title First Last | MRN | Age | Gender"); the bridge supplies the same
   * interpolated string so the hover text survives the conversion. Optional,
   * so existing callers are unaffected. */
  cellTitles?: Record<string, string>;
  /** True when the row matches the screen's config.background.style rule. */
  highlight?: boolean;
  /** Per-row highlight style, for screens whose config.background.style maps
   * SEVERAL field values to different colours (e.g. daycarebillinglist's
   * ColorCode 5 vs 6). Falls back to reactProps.highlightStyle, then to the
   * default red, so existing callers are unaffected. */
  highlightStyle?: React.CSSProperties;
}

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Shared renderer for the AngularJS <custom-table config="vm.gridConfig">
 * grids across Billing. One component for the whole family instead of a
 * near-duplicate per screen: each screen's bridge supplies its own columns,
 * pre-formatted cell strings, action label and highlight flag, so the
 * screen-specific parts stay in that screen's controller and this component
 * holds no business logic, no data source and no API knowledge.
 *
 * Behavior it reproduces from custom-table.html / app.js:
 *  - Column-header click-to-sort (custom-table's `reOrder`: case-insensitive
 *    string compare, toggled ascending/descending) via DataTable's clientSort,
 *    enabled per column by the calling bridge. Columns whose original field is
 *    an object or a number are left unsortable, because reOrder calls
 *    .toLowerCase() on the raw value and throws for those today.
 *  - S.No renumbering with the displayed order ({{index+1}}).
 *  - The per-row ng-style highlight driven by config.background.style.
 *  - <a ng-click="handleEvents('...', entity)"> cells, dispatched as
 *    'cellAction' so the bridge can call the screen's existing unchanged
 *    handleEvents with the real entity.
 *
 * NOT reproduced (deliberate, documented): rz-table column resizing, and the
 * colour box in the status cellTemplates -- that box's style attribute is
 * malformed in every one of these screens and has never set a background
 * colour, so it has never been visible.
 */
export const BridgeGridScreen: React.FC<Props> = ({ reactProps, onAction }) => {
  const cols: BridgeGridColumn[] = reactProps?.columns || [];
  const rows: BridgeGridRow[] = reactProps?.rows || [];
  const actionsHeader: string = reactProps?.actionsHeader || 'Actions';
  const hasActions: boolean = !!reactProps?.hasActions;

  const columns: DataTableColumn<BridgeGridRow>[] = cols.map((c) => ({
    key: c.key,
    header: c.header,
    field: `cells.${c.key}`,
    sortable: c.sortable,
    width: c.width,
    align: c.align,
    render:
      c.key === '__sno'
        ? (_r, i) => i + 1
        : c.link
        ? (r) => (
            <a
              href=""
              title={r.cellTitles?.[c.key]}
              onClick={(e) => {
                e.preventDefault();
                onAction('cellAction', { key: c.key, id: r.id });
              }}
              style={{ color: colors.primary, cursor: 'pointer' }}
            >
              {r.cells?.[c.key]}
            </a>
          )
        : (r) =>
            r.cellTitles?.[c.key] ? (
              <span title={r.cellTitles[c.key]}>{r.cells?.[c.key] ?? ''}</span>
            ) : (
              r.cells?.[c.key] ?? ''
            ),
  }));

  return (
    <div style={{ padding: `0 ${spacing.xs} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <DataTable<BridgeGridRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="No records found"
        actionsHeader={actionsHeader}
        rowStyle={(r) => (r.highlight ? (r.highlightStyle || reactProps?.highlightStyle || { background: 'red', color: '#fff' }) : undefined)}
        actions={
          hasActions
            ? (r) =>
                r.actions && r.actions.length ? (
                  <>
                    {r.actions.map((a) => (
                      <Button
                        key={a.key}
                        variant={(a.variant as any) || 'primary'}
                        size="xs"
                        text={a.label}
                        icon={a.icon}
                        title={a.title}
                        style={a.color ? { color: a.color } : undefined}
                        onClick={() => onAction('rowAction', { key: a.key, id: r.id })}
                      />
                    ))}
                  </>
                ) : r.actionLabel ? (
                  <Button
                    variant="primary"
                    size="xs"
                    text={r.actionLabel}
                    onClick={() => onAction('rowAction', { id: r.id })}
                  />
                ) : null
            : undefined
        }
      />
    </div>
  );
};
