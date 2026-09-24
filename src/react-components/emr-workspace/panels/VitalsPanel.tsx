/**
 * VITALS panel.
 *
 * Driven entirely by the Vital master (General/Options/getoptions → "Vital"), exactly like the
 * legacy patientvital-form.js, and saved through the same endpoint:
 *   read : emr/patientvital/GetPatientVitals   (Key 2 = PatientId, Key 9 = EncounterId)
 *   write: emr/patientvital/ManagePatientVitals { Data: PatientVital[] }
 * Blood pressure is stored as "systolic~diastolic" and BMI is computed from height/weight,
 * matching the legacy rules so existing reports keep working.
 *
 * The allergy list (AllergyPanel.tsx) is shown under the vitals, as on the reference screen.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { calculateBmi, cleanLookup, qualifierIdFor, rangeStatus } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { FieldRow, InlineNotice, PainScale, PanelSection, RangeFlag } from '../EmrUi';
import { AllergyList } from './AllergyPanel';
import { draftKey, useEmrDraft } from '../useEmrDraft';
import { DraftBanners, DraftStatusChip } from '../DraftStatus';

interface VitalMaster extends LookupItem {
  VitalName: string;
  Description: string;
  UOM?: string;
  GraphTypeId?: number;
  VitalValueTypeId?: number;
  LoincCode?: string;
  ValueFormat?: string;
  ReferenceRangeFrom?: string;
  ReferenceRangeTo?: string;
  Mnemonic?: string;
  DisplayOrder?: number;
}

interface PatientVitalRow {
  Id?: number;
  VitalId: number;
  VitalValue: string;
  GroupId?: number;
  PerformedDate?: string;
  [key: string]: any;
}

interface VitalEntry {
  value: string;
  /** Systolic for BP. */
  value1: string;
  /** Diastolic for BP. */
  value2: string;
  /** Existing PatientVital.Id for this encounter (update instead of insert). */
  existingId?: number;
}

type VitalKind = 'bp' | 'bmi' | 'height' | 'weight' | 'pain' | 'text' | 'number';

const kindOf = (m: VitalMaster): VitalKind => {
  const d = (m.Description || m.VitalName || '').toLowerCase().trim();
  if (d === 'blood pressure') return 'bp';
  if (d === 'bmi') return 'bmi';
  if (d === 'height') return 'height';
  if (d === 'weight') return 'weight';
  if (d.includes('pain')) return 'pain';
  const hasRange = m.ReferenceRangeFrom !== undefined && m.ReferenceRangeFrom !== null && m.ReferenceRangeFrom !== '';
  return hasRange ? 'number' : 'text';
};

const emptyEntry = (): VitalEntry => ({ value: '', value1: '', value2: '' });

/** What the draft keeps: typed values only (never saved reading ids). */
interface VitalsDraft {
  values: Record<string, [string, string, string]>;
  performedAt: string;
  notes: string;
  /** Typed on a "New reading" (restoring must not overwrite the earlier set). */
  newReading: boolean;
}
const toVitalsDraft = (entries: Record<number, VitalEntry>, performedAt: string, notes: string, newReading: boolean): VitalsDraft => {
  const values: Record<string, [string, string, string]> = {};
  Object.keys(entries)
    .sort()
    .forEach((id) => {
      const e = entries[Number(id)];
      if (e && (e.value.trim() || e.value1.trim() || e.value2.trim())) values[id] = [e.value.trim(), e.value1.trim(), e.value2.trim()];
    });
  return { values, performedAt, notes: notes.trim(), newReading };
};

/** datetime-local value for "now". */
const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const toLocalInput = (value?: string) => {
  if (!value) return nowLocalInput();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return nowLocalInput();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const isNumeric = (v: string) => v.trim() !== '' && !Number.isNaN(Number(v));

interface VitalsData {
  masters: VitalMaster[];
  rows: PatientVitalRow[];
}

/** Master list and this visit's readings are independent → fetched together. */
const fetchVitalsData = async (patientId: number, encounterId: number): Promise<VitalsData> => {
  const [lookup, recorded] = await Promise.all([
    apiFetch('General/Options/getoptions', [{ Key: 'Vital' }]),
    encounterId
      ? apiFetch('emr/patientvital/GetPatientVitals', {
          Params: [
            { Key: 2, Value: patientId },
            { Key: 9, Value: encounterId },
          ],
        })
      : Promise.resolve({ Data: [] }),
  ]);
  const masters = (cleanLookup(lookup?.Vital) as VitalMaster[]).slice().sort((a, b) => (a.DisplayOrder ?? 999) - (b.DisplayOrder ?? 999));
  return { masters, rows: recorded?.Data || [] };
};

export const VitalsPanel: React.FC<EmrPanelProps> = ({ context, encounter, canEdit, registerSaveHandler, onDataChanged }) => {
  const [entries, setEntries] = useState<Record<number, VitalEntry>>({});
  const [performedAt, setPerformedAt] = useState<string>(nowLocalInput());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  /** GroupId of the reading set being edited; undefined = a new set (server assigns one). */
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const [newReading, setNewReading] = useState(false);
  const [baseline, setBaseline] = useState<VitalsDraft | undefined>(undefined);


  /* ───────────── data loading ───────────── */

  /** Fill the form from the latest saved reading set (same rule as the legacy form). */
  const applyLoadedVitals = ({ masters: masterList, rows }: VitalsData) => {
    const latestGroup = rows.reduce<number | undefined>((acc, r) => (r.GroupId !== undefined && r.GroupId !== null && (acc === undefined || r.GroupId > acc) ? r.GroupId : acc), undefined);
    const latestRows = latestGroup === undefined ? rows : rows.filter((r) => r.GroupId === latestGroup);
    const next: Record<number, VitalEntry> = {};
    latestRows.forEach((r) => {
      const master = masterList.find((m) => m.Id === r.VitalId);
      const entry: VitalEntry = { ...emptyEntry(), existingId: r.Id, value: r.VitalValue ?? '' };
      if (master && kindOf(master) === 'bp' && typeof r.VitalValue === 'string' && r.VitalValue.includes('~')) {
        const [sys, dia] = r.VitalValue.split('~');
        entry.value1 = sys;
        entry.value2 = dia;
      }
      next[r.VitalId] = entry;
    });
    const at = latestRows[0]?.PerformedDate ? toLocalInput(latestRows[0].PerformedDate) : nowLocalInput();
    const loadedNotes = latestRows.find((r) => r.Comments)?.Comments || '';
    setEntries(next);
    setGroupId(latestGroup);
    setErrors({});
    setPerformedAt(at);
    setNotes(loadedNotes);
    setNewReading(false);
    setBaseline(toVitalsDraft(next, at, loadedNotes, false));
  };

  const vitalsFetcher = useCallback(() => fetchVitalsData(context.patientId, context.encounterId), [context.patientId, context.encounterId]);
  const vitalsQuery = useAsyncData<VitalsData>(vitalsFetcher, { masters: [], rows: [] }, { errorMessage: 'Could not load vitals.', onSuccess: applyLoadedVitals });
  const { loading, error: loadError, reload: reloadVitals } = vitalsQuery;
  const masters = vitalsQuery.data.masters;


  /* ───────────── derived values ───────────── */

  const heightMaster = masters.find((m) => kindOf(m) === 'height');
  const weightMaster = masters.find((m) => kindOf(m) === 'weight');
  const bmiMaster = masters.find((m) => kindOf(m) === 'bmi');

  const computedBmi = useMemo(() => {
    const h = heightMaster ? parseFloat(entries[heightMaster.Id]?.value || '') : NaN;
    const w = weightMaster ? parseFloat(entries[weightMaster.Id]?.value || '') : NaN;
    return calculateBmi(h, w);
  }, [entries, heightMaster, weightMaster]);

  const updateEntry = (id: number, patch: Partial<VitalEntry>) => {
    setEntries((prev) => ({ ...prev, [id]: { ...(prev[id] || emptyEntry()), ...patch } }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  /* ───────────── save ───────────── */

  const validate = (): Record<number, string> => {
    const errs: Record<number, string> = {};
    masters.forEach((m) => {
      const e = entries[m.Id];
      if (!e) return;
      const kind = kindOf(m);
      if (kind === 'bp') {
        const hasSys = e.value1.trim() !== '';
        const hasDia = e.value2.trim() !== '';
        if (hasSys !== hasDia) errs[m.Id] = 'Enter both systolic and diastolic.';
        else if (hasSys && (!isNumeric(e.value1) || !isNumeric(e.value2))) errs[m.Id] = 'Blood pressure must be numbers.';
        else if (hasSys && Number(e.value1) <= Number(e.value2)) errs[m.Id] = 'Systolic must be higher than diastolic.';
      } else if (kind !== 'text' && kind !== 'bmi' && e.value.trim() !== '') {
        if (!isNumeric(e.value)) errs[m.Id] = 'Enter a number.';
        else if (Number(e.value) < 0) errs[m.Id] = 'Value cannot be negative.';
      }
    });
    return errs;
  };

  /** Saves the reading set. Silent = auto-save: no messages; skipped while something is invalid. */
  const persist = useCallback(async (silent: boolean): Promise<boolean> => {
    if (!canEdit) {
      if (!silent) alert.showErrorMsg('Open a visit before recording vitals.');
      return false;
    }
    const errs = validate();
    if (!silent) setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (!silent) alert.showErrorMsg('Please correct the highlighted vitals.');
      return false;
    }
    const snapshot = toVitalsDraft(entries, performedAt, notes, newReading);

    const performedDate = new Date(performedAt);
    const rows: any[] = [];
    masters.forEach((m) => {
      const kind = kindOf(m);
      const e = entries[m.Id] || emptyEntry();
      let value = e.value.trim();
      if (kind === 'bp') value = e.value1.trim() && e.value2.trim() ? `${e.value1.trim()}~${e.value2.trim()}` : '';
      if (kind === 'bmi') value = computedBmi ? String(computedBmi) : '';
      if (!value && !e.existingId) return;

      const status = kind === 'bp' ? rangeStatus(e.value1, m.ReferenceRangeFrom, m.ReferenceRangeTo) : rangeStatus(value, m.ReferenceRangeFrom, m.ReferenceRangeTo);
      rows.push({
        ...(e.existingId ? { Id: e.existingId } : {}),
        ...(groupId !== undefined ? { GroupId: groupId } : {}),
        PatientId: context.patientId,
        EncounterId: context.encounterId,
        ConsultationId: context.consultationId ?? undefined,
        EncounterTypeId: encounter?.EncounterTypeId,
        VitalId: m.Id,
        VitalName: m.VitalName,
        Description: m.Description,
        VitalValue: value,
        VitalValueTypeId: m.VitalValueTypeId,
        UOM: m.UOM,
        LoincCode: m.LoincCode,
        Mnemonic: m.Mnemonic,
        GraphTypeId: m.GraphTypeId,
        ValueFormat: m.ValueFormat,
        ReferenceRangeFrom: m.ReferenceRangeFrom,
        ReferenceRangeTo: m.ReferenceRangeTo,
        VitalQualifierId: qualifierIdFor(status),
        Comments: notes.trim() || undefined,
        PerformedDate: performedDate,
        PerformedBy: context.userId,
        PatientVitalStatusId: 1,
        // Clearing a previously saved value removes that reading (Status 2 = delete in ManagePatientVitals).
        Status: value ? 1 : 2,
      });
    });

    if (rows.length === 0) {
      if (!silent) alert.showInfoMsg('Enter at least one vital reading.');
      return false;
    }

    if (!silent) setSaving(true);
    try {
      await apiFetch('emr/patientvital/ManagePatientVitals', { Data: rows });
      if (silent) {
        // Adopt the saved reading ids (so the next save updates them) but keep anything typed meanwhile.
        const fresh = await fetchVitalsData(context.patientId, context.encounterId);
        const latest = fresh.rows.reduce<number | undefined>((acc, r) => (r.GroupId !== undefined && r.GroupId !== null && (acc === undefined || r.GroupId > acc) ? r.GroupId : acc), undefined);
        const latestRows = latest === undefined ? fresh.rows : fresh.rows.filter((r) => r.GroupId === latest);
        const idByVital = new Map(latestRows.map((r) => [r.VitalId, r.Id]));
        setGroupId(latest);
        setNewReading(false);
        setEntries((prev) => {
          const next: Record<number, VitalEntry> = {};
          Object.keys(prev).forEach((id) => {
            next[Number(id)] = { ...prev[Number(id)], existingId: idByVital.get(Number(id)) };
          });
          return next;
        });
        setBaseline({ ...snapshot, newReading: false });
        return true;
      }
      alert.showSuccessMsg('Vitals saved');
      reloadVitals();
      onDataChanged?.('vitals');
      return true;
    } catch {
      return false; // utl.Http already showed the server's error toast
    } finally {
      if (!silent) setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, masters, entries, computedBmi, performedAt, notes, groupId, newReading, context, encounter, reloadVitals, onDataChanged]);
  const save = useCallback(() => persist(false), [persist]);
  const autoSave = useCallback(() => persist(true), [persist]);

  const vitalsDraftValue = toVitalsDraft(entries, performedAt, notes, newReading);
  const hasAnyValue = Object.keys(vitalsDraftValue.values).length > 0;
  const draft = useEmrDraft<VitalsDraft>({
    storageKey: canEdit ? draftKey(context.userId, context.consultationId, 'vitals') : null,
    value: vitalsDraftValue,
    baseline,
    onRestore: (d) => {
      setEntries((prev) => {
        const next: Record<number, VitalEntry> = {};
        const ids = new Set([...Object.keys(prev), ...Object.keys(d.values)]);
        ids.forEach((id) => {
          const v = d.values[id] || ['', '', ''];
          next[Number(id)] = { value: v[0], value1: v[1], value2: v[2], existingId: d.newReading ? undefined : prev[Number(id)]?.existingId };
        });
        return next;
      });
      if (d.newReading) setGroupId(undefined);
      setNewReading(d.newReading);
      setPerformedAt(d.performedAt);
      setNotes(d.notes);
    },
    autoSave,
    canAutoSave: canEdit && hasAnyValue && Object.keys(validate()).length === 0,
  });


  useEffect(() => {
    registerSaveHandler?.(save);
    return () => registerSaveHandler?.(null);
  }, [registerSaveHandler, save]);

  /** Start a fresh set of readings (e.g. repeat observation later in the same visit). */
  const startNewReading = () => {
    const at = nowLocalInput();
    setEntries({});
    setErrors({});
    setGroupId(undefined);
    setNotes('');
    setPerformedAt(at);
    setNewReading(true);
    // An empty new reading is not an unsaved change.
    setBaseline(toVitalsDraft({}, at, '', true));
  };


  /* ───────────── render ───────────── */

  const renderControl = (m: VitalMaster) => {
    const kind = kindOf(m);
    const e = entries[m.Id] || emptyEntry();
    const range = m.ReferenceRangeFrom || m.ReferenceRangeTo ? `${m.ReferenceRangeFrom ?? ''}–${m.ReferenceRangeTo ?? ''} ${m.UOM ?? ''}`.trim() : undefined;
    const invalid = Boolean(errors[m.Id]);
    const unit = m.UOM ? <span style={{ ...typography.caption, color: colors.textSubtle, minWidth: 40 }}>{m.UOM}</span> : null;

    if (kind === 'bp') {
      return (
        <>
          <div style={{ width: 110 }}>
            <Input size="sm" inputMode="numeric" placeholder="Systolic" aria-label="Systolic" value={e.value1} disabled={!canEdit} error={invalid ? ' ' : undefined} onChange={(ev) => updateEntry(m.Id, { value1: ev.target.value })} />
          </div>
          <span style={{ color: colors.textSubtle }}>/</span>
          <div style={{ width: 110 }}>
            <Input size="sm" inputMode="numeric" placeholder="Diastolic" aria-label="Diastolic" value={e.value2} disabled={!canEdit} error={invalid ? ' ' : undefined} onChange={(ev) => updateEntry(m.Id, { value2: ev.target.value })} />
          </div>
          {unit || <span style={{ ...typography.caption, color: colors.textSubtle }}>mmHg</span>}
          <RangeFlag status={rangeStatus(e.value1, m.ReferenceRangeFrom, m.ReferenceRangeTo)} range={range} />
        </>
      );
    }
    if (kind === 'bmi') {
      const shown = computedBmi ? String(computedBmi) : e.value;
      return (
        <>
          <div style={{ width: 140 }}>
            <Input size="sm" readOnly value={shown} placeholder="Auto" aria-label="BMI" />
          </div>
          {unit}
          <RangeFlag status={rangeStatus(shown, m.ReferenceRangeFrom, m.ReferenceRangeTo)} range={range} />
        </>
      );
    }
    if (kind === 'pain') {
      const numeric = e.value === '' ? null : Number(e.value);
      return <PainScale value={Number.isNaN(numeric as number) ? null : numeric} disabled={!canEdit} onChange={(v) => updateEntry(m.Id, { value: v === null ? '' : String(v) })} />;
    }
    return (
      <>
        <div style={{ width: kind === 'text' ? 260 : 140 }}>
          <Input
            size="sm"
            inputMode={kind === 'text' ? 'text' : 'decimal'}
            placeholder="Reading"
            aria-label={m.Description || m.VitalName}
            value={e.value}
            disabled={!canEdit}
            error={invalid ? ' ' : undefined}
            onChange={(ev) => updateEntry(m.Id, { value: ev.target.value })}
          />
        </div>
        {unit}
        {kind === 'number' && <RangeFlag status={rangeStatus(e.value, m.ReferenceRangeFrom, m.ReferenceRangeTo)} range={range} />}
      </>
    );
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>

      <DraftBanners draft={draft} />
      <PanelSection
        title="Vital Signs"
        icon="fa-solid fa-heart-pulse"
        actions={
          <>
            <DraftStatusChip draft={draft} serverAutoSave />
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reloadVitals} disabled={loading || saving}>
              Reload
            </Button>
            <Button size="sm" variant="outline-primary" icon="fa-solid fa-plus" onClick={startNewReading} disabled={!canEdit || loading || saving} title="Record a new set of readings for this visit">
              New reading
            </Button>
            <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={!canEdit || loading}>
              Save vitals
            </Button>
          </>
        }
      >
        {loading ? (
          <SkeletonRows rows={6} columns={3} />
        ) : loadError ? (
          <InlineNotice tone="danger">
            {loadError}{' '}
            <Button size="xs" variant="link" onClick={reloadVitals}>
              Try again
            </Button>
          </InlineNotice>
        ) : masters.length === 0 ? (
          <InlineNotice tone="info">No vitals are configured in the Vital master yet.</InlineNotice>
        ) : (
          <div style={{ display: 'grid', gap: 2 }}>
            <FieldRow label="Recorded at" hint="Date & time of measurement">
              <div style={{ width: 220 }}>
                <Input size="sm" type="datetime-local" value={performedAt} disabled={!canEdit} onChange={(e) => setPerformedAt(e.target.value)} aria-label="Recorded at" />
              </div>
            </FieldRow>
            {masters
              .filter((m) => !(bmiMaster && m.Id === bmiMaster.Id))
              .map((m) => (
                <FieldRow key={m.Id} label={m.Description || m.VitalName} hint={errors[m.Id] ? <span style={{ color: colors.danger }}>{errors[m.Id]}</span> : undefined}>
                  {renderControl(m)}
                </FieldRow>
              ))}
            {bmiMaster && (
              <FieldRow label={bmiMaster.Description || 'BMI'} hint="Calculated from height (cm) and weight (kg)">
                {renderControl(bmiMaster)}
              </FieldRow>
            )}
            <div style={{ marginTop: spacing.md }}>
              <Textarea label="Vital notes" rows={3} value={notes} disabled={!canEdit} placeholder="Observations, patient position, device used…" onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}
      </PanelSection>

      <AllergyList context={context} canEdit={canEdit} onDataChanged={onDataChanged} />
    </div>
  );
};
