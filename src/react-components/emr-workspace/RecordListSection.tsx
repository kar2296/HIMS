/**
 * Generic "list + add/edit/remove" section for EMR panels whose data entry already exists as a
 * proven AngularJS form (history, charts, checklists, requests…). The list renders in React from the
 * existing Get… endpoint; Add / Edit open the existing modal so validation and business rules are reused;
 * Remove calls the existing Delete… endpoint.
 */
import React, { useCallback, useState } from 'react';
import { alert } from '../utils/alert';
import { apiFetch } from '../utils/api';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { SkeletonRows } from '../../components/ui/Loading';
import { spacing } from '../../components/ui/tokens';
import type { EmrPanelProps, EmrWorkspaceContext, EncounterInfo } from './types';
import { useAsyncData } from './useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from './EmrUi';

export interface RecordColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

export interface RecordListConfig<T> {
  title: string;
  icon: string;
  emptyText: string;
  /** Loads the rows (use apiFetch against the existing Get… endpoint). */
  fetch: (context: EmrWorkspaceContext, encounter: EncounterInfo | null) => Promise<T[]>;
  columns: RecordColumn<T>[];
  rowKey: (row: T) => React.Key;
  /** Existing AngularJS modal used for add + edit. */
  modal?: {
    name: string;
    /** Legacy chart forms are opened with openFixedDialog. */
    fixed?: boolean;
    params: (context: EmrWorkspaceContext, encounter: EncounterInfo | null, row?: T) => Record<string, any>;
    addLabel?: string;
    /** Some legacy forms are create-only. */
    noEdit?: boolean;
  };
  /** Existing Delete… action ({ Id }). */
  deleteAction?: string;
  deleteLabel?: (row: T) => string;
  /** Optional summary shown above the table (totals, balance…). */
  summary?: (rows: T[]) => React.ReactNode;
  /** Extra per-row actions. */
  rowActions?: (row: T, ctx: { reload: () => void; canEdit: boolean }) => React.ReactNode;
  /** Extra header actions. */
  headerActions?: (ctx: { reload: () => void; canEdit: boolean }) => React.ReactNode;
}

type SectionProps<T> = Pick<EmrPanelProps, 'context' | 'encounter' | 'canEdit' | 'openLegacyModal' | 'onDataChanged'> & {
  config: RecordListConfig<T>;
  dataKey: string;
};

export function RecordListSection<T>({ config, dataKey, context, encounter, canEdit, openLegacyModal, onDataChanged }: SectionProps<T>) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const { fetch } = config;

  const fetcher = useCallback(() => fetch(context, encounter), [fetch, context, encounter]);
  const { data: rows, loading, error, reload } = useAsyncData<T[]>(fetcher, [], { errorMessage: `Could not load ${config.title.toLowerCase()}.` });

  const changed = () => {
    reload();
    onDataChanged?.(dataKey);
  };

  const openModal = (row?: T) => {
    if (!config.modal || !openLegacyModal) return;
    openLegacyModal(config.modal.name, config.modal.params(context, encounter, row), changed, { fixed: config.modal.fixed });
  };

  const confirmDelete = async () => {
    const target = pendingDelete as any;
    setPendingDelete(null);
    if (!target || !config.deleteAction) return;
    try {
      await apiFetch(config.deleteAction, { Id: target.Id });
      alert.showSuccessMsg('Removed');
      changed();
    } catch {
      /* toasted */
    }
  };

  const hasRowActions = Boolean((config.modal && !config.modal.noEdit) || config.deleteAction || config.rowActions);
  const headers = [...config.columns.map((c) => c.header), ...(hasRowActions ? [''] : [])];

  return (
    <PanelSection
      title={`${config.title}${rows.length ? ` (${rows.length})` : ''}`}
      icon={config.icon}
      flush
      actions={
        <>
          {config.headerActions?.({ reload, canEdit })}
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reload} disabled={loading} aria-label={`Reload ${config.title}`}>
            Reload
          </Button>
          {config.modal && (
            <Button size="sm" variant="outline-primary" icon="fa-solid fa-plus" onClick={() => openModal()} disabled={!canEdit || !openLegacyModal}>
              {config.modal.addLabel || 'Add'}
            </Button>
          )}
        </>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg }}>
          <SkeletonRows rows={3} columns={Math.min(config.columns.length, 5)} />
        </div>
      ) : error ? (
        <div style={{ padding: spacing.lg }}>
          <InlineNotice tone="danger">{error}</InlineNotice>
        </div>
      ) : (
        <>
          {config.summary && rows.length > 0 && <div style={{ padding: `${spacing.md} ${spacing.lg} 0` }}>{config.summary(rows)}</div>}
          <SimpleTable headers={headers} empty={rows.length === 0} emptyText={config.emptyText}>
            {rows.map((row) => (
              <tr key={config.rowKey(row)}>
                {config.columns.map((c) => (
                  <td key={c.header}>{c.render(row)}</td>
                ))}
                {hasRowActions && (
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {config.rowActions?.(row, { reload, canEdit })}
                    {config.modal && !config.modal.noEdit && (
                      <Button size="xs" variant="icon" icon="fa-solid fa-pen" title="Open" aria-label="Open record" disabled={!openLegacyModal} onClick={() => openModal(row)} />
                    )}
                    {config.deleteAction && (
                      <Button size="xs" variant="icon" icon="fa-solid fa-trash" title="Remove" aria-label="Remove record" disabled={!canEdit} onClick={() => setPendingDelete(row)} />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </SimpleTable>
        </>
      )}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={`Remove from ${config.title}`}
        message={`Remove ${pendingDelete ? config.deleteLabel?.(pendingDelete) || 'this record' : ''}?`}
        yesLabel="Remove"
        noLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PanelSection>
  );
}
