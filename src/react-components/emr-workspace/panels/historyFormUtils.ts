/**
 * Non-component helpers for the EMR Workspace history forms.
 * Every form saves through the existing Add… / Update… endpoint with plain table columns only.
 */
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import type { EmrWorkspaceContext } from '../types';

/** yyyy-mm-dd for today (local time). */
export const today = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Adds or updates a history record. Visit context and "performed" audit fields are filled here; only the
 * listed table columns are posted. Returns true when saved (server errors are already shown by apiFetch).
 */
export async function saveHistoryRecord(opts: {
  entity: string;
  columns: string[];
  record: Record<string, unknown>;
  context: EmrWorkspaceContext;
  successText: string;
  /** Set PerformedBy / PerformedDate automatically (false when the form edits them). */
  stampPerformed?: boolean;
}): Promise<boolean> {
  const { entity, columns, record, context, successText, stampPerformed = true } = opts;
  const merged: Record<string, unknown> = {
    ...record,
    PatientId: context.patientId,
    EncounterId: record.EncounterId || context.encounterId || undefined,
    ConsultationId: record.ConsultationId || context.consultationId || undefined,
  };
  if (stampPerformed) {
    merged.PerformedBy = context.userId || undefined;
    merged.PerformedDate = new Date().toISOString();
  }
  const data: Record<string, unknown> = {};
  columns.forEach((k) => {
    if (merged[k] !== undefined) data[k] = merged[k];
  });
  const isUpdate = Boolean(record.Id);
  try {
    await apiFetch(`emr/${entity.toLowerCase()}/${isUpdate ? 'Update' : 'Add'}${entity}`, { Data: data });
    alert.showSuccessMsg(successText);
    return true;
  } catch {
    return false;
  }
}
