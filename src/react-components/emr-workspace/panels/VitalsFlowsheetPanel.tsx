/**
 * VITALS FLOWSHEET panel (emr.ws.vitalflowsheet) -- the reference screen's "Vital Vertical":
 * every recorded vital set for the patient (all visits), newest first, one column per reading set.
 *   read : emr/patientvital/GetPatientVitals  (Key 2 = PatientId)
 * Read-only; readings are entered on the Vitals tab.
 */
import React, { useCallback, useMemo } from 'react';
import { apiFetch } from '../../utils/api';
import { Button } from '../../Button';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { formatDateTime, rangeStatus } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection } from '../EmrUi';

interface VitalRow {
  Id: number;
  VitalId: number;
  VitalName?: string;
  Description?: string;
  VitalValue?: string;
  UOM?: string;
  ReferenceRangeFrom?: string;
  ReferenceRangeTo?: string;
  GroupId?: number;
  EncounterId?: number;
  PerformedDate?: string;
}

const MAX_COLUMNS = 12;

export const VitalsFlowsheetPanel: React.FC<EmrPanelProps> = ({ context }) => {
  const fetcher = useCallback(async (): Promise<VitalRow[]> => {
    const res = await apiFetch('emr/patientvital/GetPatientVitals', { Params: [{ Key: 2, Value: context.patientId }], PageContext: { PageSize: 1000, PageNumber: 1 } });
    return res?.Data || [];
  }, [context.patientId]);
  const { data: rows, loading, error, reload } = useAsyncData<VitalRow[]>(fetcher, [], { errorMessage: 'Could not load the vitals history.' });

  const { sets, vitals } = useMemo(() => {
    const groups = new Map<string, { key: string; date?: string; encounterId?: number; values: Map<number, VitalRow> }>();
    rows.forEach((r) => {
      const key = String(r.GroupId ?? `${r.EncounterId}-${r.PerformedDate}`);
      if (!groups.has(key)) groups.set(key, { key, date: r.PerformedDate, encounterId: r.EncounterId, values: new Map() });
      groups.get(key)!.values.set(r.VitalId, r);
    });
    const sortedSets = Array.from(groups.values())
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, MAX_COLUMNS);
    const vitalMap = new Map<number, { id: number; name: string; uom?: string }>();
    sortedSets.forEach((s) => s.values.forEach((v) => vitalMap.has(v.VitalId) || vitalMap.set(v.VitalId, { id: v.VitalId, name: v.Description || v.VitalName || `Vital ${v.VitalId}`, uom: v.UOM })));
    return { sets: sortedSets, vitals: Array.from(vitalMap.values()) };
  }, [rows]);

  const cell = (v?: VitalRow) => {
    if (!v || v.VitalValue === undefined || v.VitalValue === null || v.VitalValue === '') return <span style={{ color: colors.textDisabled }}>—</span>;
    const isBp = String(v.VitalValue).includes('~');
    const text = isBp ? String(v.VitalValue).replace('~', '/') : v.VitalValue;
    const status = rangeStatus(isBp ? String(v.VitalValue).split('~')[0] : v.VitalValue, v.ReferenceRangeFrom, v.ReferenceRangeTo);
    const abnormal = status === 'high' || status === 'low';
    return (
      <span style={{ fontWeight: abnormal ? 700 : 500, color: abnormal ? colors.danger : colors.textBody }} title={abnormal ? `Outside ${v.ReferenceRangeFrom}–${v.ReferenceRangeTo}` : undefined}>
        {text}
        {abnormal && (status === 'high' ? ' ↑' : ' ↓')}
      </span>
    );
  };

  return (
    <PanelSection
      title="Vitals flowsheet"
      icon="fa-solid fa-table"
      flush
      actions={
        <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reload} disabled={loading}>
          Reload
        </Button>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg }}>
          <SkeletonRows rows={6} columns={5} />
        </div>
      ) : error ? (
        <div style={{ padding: spacing.lg }}>
          <InlineNotice tone="danger">{error}</InlineNotice>
        </div>
      ) : sets.length === 0 ? (
        <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>No vitals recorded for this patient yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="emrws-table emrws-flowsheet">
            <thead>
              <tr>
                <th scope="col">Vital</th>
                {sets.map((s) => (
                  <th key={s.key} scope="col" style={{ textAlign: 'center' }}>
                    {formatDateTime(s.date)}
                    {s.encounterId === context.encounterId && <div style={{ ...typography.caption, color: colors.primary }}>This visit</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitals.map((v) => (
                <tr key={v.id}>
                  <th scope="row" style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {v.name}
                    {v.uom && <span style={{ ...typography.caption, color: colors.textSubtle, marginLeft: 4 }}>({v.uom})</span>}
                  </th>
                  {sets.map((s) => (
                    <td key={s.key} style={{ textAlign: 'center' }}>
                      {cell(s.values.get(v.id))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelSection>
  );
};
