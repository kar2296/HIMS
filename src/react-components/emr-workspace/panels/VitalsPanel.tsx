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
 * Shows:
 * 1. Vital Signs Entry Form (latest reading loaded for editing, or fresh for new reading)
 * 2. Recorded Vitals History Flowsheet (all readings for this visit / all visits with edit action)
 * 3. Allergy List (AllergyPanel.tsx) under vitals.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { calculateBmi, cleanLookup, formatDateTime, qualifierIdFor, rangeStatus } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { FieldRow, InlineNotice, PainScale, PanelSection, RangeFlag } from '../EmrUi';
import { AllergyList } from './AllergyPanel';
import { draftKey, useEmrDraft, type UseEmrDraftResult } from '../useEmrDraft';
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
  EncounterId?: number;
  PatientId?: number;
  PerformedDate?: string;
  PerformedUser?: {
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Comments?: string;
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
  historyRows: PatientVitalRow[];
}

interface ReadingGroup {
  key: string;
  groupId?: number;
  encounterId?: number;
  date?: string;
  performer?: string;
  comments?: string;
  values: Map<number, PatientVitalRow>;
}

/** Master list and recorded readings: fetched together for current encounter and whole patient history. */
const fetchVitalsData = async (patientId: number, encounterId: number): Promise<VitalsData> => {
  const [lookup, encounterRecorded, allRecorded] = await Promise.all([
    apiFetch('General/Options/getoptions', [{ Key: 'Vital' }]),
    encounterId
      ? apiFetch('emr/patientvital/GetPatientVitals', {
          Params: [
            { Key: 2, Value: patientId },
            { Key: 9, Value: encounterId },
          ],
          PageContext: { PageSize: 500, PageNumber: 1 },
        })
      : Promise.resolve({ Data: [] }),
    patientId
      ? apiFetch('emr/patientvital/GetPatientVitals', {
          Params: [{ Key: 2, Value: patientId }],
          PageContext: { PageSize: 1000, PageNumber: 1 },
        })
      : Promise.resolve({ Data: [] }),
  ]);
  const masters = (cleanLookup(lookup?.Vital) as VitalMaster[])
    .slice()
    .sort((a, b) => (Number(a.DisplayOrder) || 999) - (Number(b.DisplayOrder) || 999));
  return {
    masters,
    rows: encounterRecorded?.Data || [],
    historyRows: allRecorded?.Data || [],
  };
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
  const [historyScope, setHistoryScope] = useState<'encounter' | 'all'>('encounter');
  const draftRef = useRef<UseEmrDraftResult<VitalsDraft> | null>(null);

  /* ───────────── data loading & reading groups ───────────── */

  const loadReadingGroup = useCallback(
    (targetGroupId: number | undefined, sourceRows: PatientVitalRow[], masterList: VitalMaster[]) => {
      const groupRows =
        targetGroupId === undefined
          ? sourceRows
          : sourceRows.filter((r) => r.GroupId != null && Number(r.GroupId) === Number(targetGroupId));
      const next: Record<number, VitalEntry> = {};
      groupRows.forEach((r) => {
        const vId = Number(r.VitalId);
        const master = masterList.find((m) => Number(m.Id) === vId);
        const entry: VitalEntry = {
          ...emptyEntry(),
          existingId: r.Id ? Number(r.Id) : undefined,
          value: r.VitalValue != null ? String(r.VitalValue) : '',
        };
        if (master && kindOf(master) === 'bp' && typeof r.VitalValue === 'string' && r.VitalValue.includes('~')) {
          const [sys, dia] = r.VitalValue.split('~');
          entry.value1 = sys;
          entry.value2 = dia;
        }
        next[vId] = entry;
      });
      const at = groupRows[0]?.PerformedDate ? toLocalInput(groupRows[0].PerformedDate) : nowLocalInput();
      const loadedNotes = groupRows.find((r) => r.Comments)?.Comments || '';
      setEntries(next);
      setGroupId(targetGroupId);
      setErrors({});
      setPerformedAt(at);
      setNotes(loadedNotes);
      setNewReading(false);
      setBaseline(toVitalsDraft(next, at, loadedNotes, false));
    },
    [],
  );

  /** Fill the form from the latest saved reading set of this visit. */
  const applyLoadedVitals = useCallback(
    ({ masters: masterList, rows }: VitalsData) => {
      const latestGroup = rows.reduce<number | undefined>((acc, r) => {
        const g = r.GroupId != null ? Number(r.GroupId) : undefined;
        if (g === undefined) return acc;
        return acc === undefined || g > acc ? g : acc;
      }, undefined);
      loadReadingGroup(latestGroup, rows, masterList);
    },
    [loadReadingGroup],
  );

  const vitalsFetcher = useCallback(
    () => fetchVitalsData(context.patientId, context.encounterId),
    [context.patientId, context.encounterId],
  );
  const vitalsQuery = useAsyncData<VitalsData>(
    vitalsFetcher,
    { masters: [], rows: [], historyRows: [] },
    { errorMessage: 'Could not load vitals.', onSuccess: applyLoadedVitals },
  );
  const { loading, error: loadError, reload: reloadVitals } = vitalsQuery;
  const masters = vitalsQuery.data.masters;

  /* ───────────── derived values ───────────── */

  const heightMaster = masters.find((m) => kindOf(m) === 'height');
  const weightMaster = masters.find((m) => kindOf(m) === 'weight');
  const bmiMaster = masters.find((m) => kindOf(m) === 'bmi');

  const computedBmi = useMemo(() => {
    const hVal = heightMaster ? (entries[Number(heightMaster.Id)]?.value ?? entries[heightMaster.Id]?.value) : '';
    const wVal = weightMaster ? (entries[Number(weightMaster.Id)]?.value ?? entries[weightMaster.Id]?.value) : '';
    const h = hVal ? parseFloat(hVal) : NaN;
    const w = wVal ? parseFloat(wVal) : NaN;
    return calculateBmi(h, w);
  }, [entries, heightMaster, weightMaster]);

  const updateEntry = (id: number, patch: Partial<VitalEntry>) => {
    const numId = Number(id);
    setEntries((prev) => ({ ...prev, [numId]: { ...(prev[numId] || emptyEntry()), ...patch } }));
    setErrors((prev) => {
      if (!prev[numId]) return prev;
      const next = { ...prev };
      delete next[numId];
      return next;
    });
  };

  /* ───────────── reading history computation ───────────── */

  const { readingGroups, visitCount, allCount } = useMemo(() => {
    const encRows = vitalsQuery.data.rows;
    const allRows = vitalsQuery.data.historyRows.length > 0 ? vitalsQuery.data.historyRows : vitalsQuery.data.rows;

    const buildGroups = (source: PatientVitalRow[]) => {
      const map = new Map<string, ReadingGroup>();
      source.forEach((r) => {
        const grpKey = r.GroupId != null ? `grp-${r.GroupId}` : `r-${r.Id || r.PerformedDate}`;
        if (!map.has(grpKey)) {
          let performerName = '';
          if (r.PerformedUser) {
            const title = r.PerformedUser.Title?.Description || '';
            performerName = `${title} ${r.PerformedUser.FirstName || ''} ${r.PerformedUser.LastName || ''}`.trim();
          }
          map.set(grpKey, {
            key: grpKey,
            groupId: r.GroupId != null ? Number(r.GroupId) : undefined,
            encounterId: r.EncounterId != null ? Number(r.EncounterId) : undefined,
            date: r.PerformedDate || r.CreatedAt,
            performer: performerName,
            comments: r.Comments || undefined,
            values: new Map(),
          });
        }
        map.get(grpKey)!.values.set(Number(r.VitalId), r);
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      );
    };

    const visitGroups = buildGroups(encRows);
    const allGroups = buildGroups(allRows);

    return {
      readingGroups: historyScope === 'encounter' ? visitGroups : allGroups,
      visitCount: visitGroups.length,
      allCount: allGroups.length,
    };
  }, [vitalsQuery.data.rows, vitalsQuery.data.historyRows, historyScope]);

  /** Active vitals that have at least one recorded value in the current table scope. */
  const displayedVitals = useMemo(() => {
    const idsWithValues = new Set<number>();
    readingGroups.forEach((grp) => {
      grp.values.forEach((v, vId) => {
        if (v.VitalValue != null && String(v.VitalValue).trim() !== '') {
          idsWithValues.add(Number(vId));
        }
      });
    });
    return masters.filter((m) => idsWithValues.has(Number(m.Id)));
  }, [readingGroups, masters]);

  /* ───────────── save ───────────── */

  const validate = (): Record<number, string> => {
    const errs: Record<number, string> = {};
    masters.forEach((m) => {
      const mId = Number(m.Id);
      const e = entries[mId] || entries[m.Id];
      if (!e) return;
      const kind = kindOf(m);
      if (kind === 'bp') {
        const hasSys = e.value1.trim() !== '';
        const hasDia = e.value2.trim() !== '';
        if (hasSys !== hasDia) errs[mId] = 'Enter both systolic and diastolic.';
        else if (hasSys && (!isNumeric(e.value1) || !isNumeric(e.value2))) errs[mId] = 'Blood pressure must be numbers.';
        else if (hasSys && Number(e.value1) <= Number(e.value2)) errs[mId] = 'Systolic must be higher than diastolic.';
      } else if (kind !== 'text' && kind !== 'bmi' && e.value.trim() !== '') {
        if (!isNumeric(e.value)) errs[mId] = 'Enter a number.';
        else if (Number(e.value) < 0) errs[mId] = 'Value cannot be negative.';
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
      const mId = Number(m.Id);
      const kind = kindOf(m);
      const e = entries[mId] || entries[m.Id] || emptyEntry();
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
        VitalId: mId,
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
        const latest = fresh.rows.reduce<number | undefined>((acc, r) => {
          const g = r.GroupId != null ? Number(r.GroupId) : undefined;
          if (g === undefined) return acc;
          return acc === undefined || g > acc ? g : acc;
        }, undefined);
        const latestRows = latest === undefined ? fresh.rows : fresh.rows.filter((r) => Number(r.GroupId) === latest);
        const idByVital = new Map(latestRows.map((r) => [Number(r.VitalId), r.Id]));
        setGroupId(latest);
        setNewReading(false);
        setEntries((prev) => {
          const next: Record<number, VitalEntry> = {};
          Object.keys(prev).forEach((id) => {
            const numId = Number(id);
            next[numId] = { ...prev[numId], existingId: idByVital.get(numId) };
          });
          return next;
        });
        setBaseline({ ...snapshot, newReading: false });
        return true;
      }
      draftRef.current?.clearDraft();
      alert.showSuccessMsg('Vitals saved successfully');
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
          const numId = Number(id);
          const v = d.values[id] || ['', '', ''];
          next[numId] = { value: v[0], value1: v[1], value2: v[2], existingId: d.newReading ? undefined : prev[numId]?.existingId };
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
    draftRef.current = draft;
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
    setBaseline(toVitalsDraft({}, at, '', true));
  };

  /** Load a recorded reading set from history into the entry form. */
  const handleEditGroup = (grp: ReadingGroup) => {
    const allAvailableRows =
      vitalsQuery.data.rows.length > 0 ? vitalsQuery.data.rows : vitalsQuery.data.historyRows;
    loadReadingGroup(grp.groupId, allAvailableRows, masters);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      /* ignore */
    }
  };

  /* ───────────── render controls ───────────── */

  const renderControl = (m: VitalMaster) => {
    const kind = kindOf(m);
    const mId = Number(m.Id);
    const e = entries[mId] || entries[m.Id] || emptyEntry();
    const range = m.ReferenceRangeFrom || m.ReferenceRangeTo ? `${m.ReferenceRangeFrom ?? ''}–${m.ReferenceRangeTo ?? ''} ${m.UOM ?? ''}`.trim() : undefined;
    const invalid = Boolean(errors[mId] || errors[m.Id]);
    const unit = m.UOM ? <span style={{ ...typography.caption, color: colors.textSubtle, minWidth: 40 }}>{m.UOM}</span> : null;

    if (kind === 'bp') {
      return (
        <>
          <div style={{ width: 110 }}>
            <Input size="sm" inputMode="numeric" placeholder="Systolic" aria-label="Systolic" value={e.value1} disabled={!canEdit} error={invalid ? ' ' : undefined} onChange={(ev) => updateEntry(mId, { value1: ev.target.value })} />
          </div>
          <span style={{ color: colors.textSubtle }}>/</span>
          <div style={{ width: 110 }}>
            <Input size="sm" inputMode="numeric" placeholder="Diastolic" aria-label="Diastolic" value={e.value2} disabled={!canEdit} error={invalid ? ' ' : undefined} onChange={(ev) => updateEntry(mId, { value2: ev.target.value })} />
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
      return <PainScale value={Number.isNaN(numeric as number) ? null : numeric} disabled={!canEdit} onChange={(v) => updateEntry(mId, { value: v === null ? '' : String(v) })} />;
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
            onChange={(ev) => updateEntry(mId, { value: ev.target.value })}
          />
        </div>
        {unit}
        {kind === 'number' && <RangeFlag status={rangeStatus(e.value, m.ReferenceRangeFrom, m.ReferenceRangeTo)} range={range} />}
      </>
    );
  };

  const renderHistoryCell = (valRow: PatientVitalRow | undefined, m: VitalMaster) => {
    if (!valRow || valRow.VitalValue == null || valRow.VitalValue === '') {
      return <span style={{ color: colors.textDisabled }}>—</span>;
    }
    const raw = String(valRow.VitalValue);
    const isBp = kindOf(m) === 'bp' && raw.includes('~');
    const text = isBp ? raw.replace('~', '/') : raw;
    const status = isBp
      ? rangeStatus(raw.split('~')[0], m.ReferenceRangeFrom, m.ReferenceRangeTo)
      : rangeStatus(raw, m.ReferenceRangeFrom, m.ReferenceRangeTo);
    const abnormal = status === 'high' || status === 'low';
    return (
      <span
        style={{
          fontWeight: abnormal ? 700 : 500,
          color: abnormal ? colors.danger : colors.textBody,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
        }}
        title={abnormal ? `Outside ${m.ReferenceRangeFrom}–${m.ReferenceRangeTo} ${m.UOM || ''}` : undefined}
      >
        <span>{text}</span>
        {abnormal && (
          <span style={{ fontSize: 11, color: colors.danger, fontWeight: 700 }}>
            {status === 'high' ? '↑' : '↓'}
          </span>
        )}
      </span>
    );
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <DraftBanners draft={draft} />

      {/* ────────────────────────── 1. VITAL SIGNS FORM ────────────────────────── */}
      <PanelSection
        title="Vital Signs"
        icon="fa-solid fa-heart-pulse"
        actions={
          <>
            {groupId !== undefined ? (
              <span
                style={{
                  ...typography.caption,
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: colors.primaryLight,
                  color: colors.primary,
                  fontWeight: 600,
                }}
              >
                Editing Reading #{groupId}
              </span>
            ) : (
              <span
                style={{
                  ...typography.caption,
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: colors.surfaceMuted,
                  color: colors.textSubtle,
                  fontWeight: 500,
                }}
              >
                New Reading
              </span>
            )}
            <DraftStatusChip draft={draft} serverAutoSave />
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reloadVitals} disabled={loading || saving}>
              Reload
            </Button>
            <Button
              size="sm"
              variant="outline-primary"
              icon="fa-solid fa-plus"
              onClick={startNewReading}
              disabled={!canEdit || loading || saving}
              title="Record a new set of readings for this visit"
            >
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
              .filter((m) => !(bmiMaster && Number(m.Id) === Number(bmiMaster.Id)))
              .map((m) => (
                <FieldRow
                  key={m.Id}
                  label={m.Description || m.VitalName}
                  hint={errors[Number(m.Id)] || errors[m.Id] ? <span style={{ color: colors.danger }}>{errors[Number(m.Id)] || errors[m.Id]}</span> : undefined}
                >
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

      {/* ────────────────────────── 2. RECORDED VITALS HISTORY ────────────────────────── */}
      <PanelSection
        title="Recorded Vitals History"
        icon="fa-solid fa-clock-rotate-left"
        flush
        actions={
          <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
            <Button
              size="xs"
              variant={historyScope === 'encounter' ? 'primary' : 'outline-secondary'}
              onClick={() => setHistoryScope('encounter')}
            >
              This visit ({visitCount})
            </Button>
            <Button
              size="xs"
              variant={historyScope === 'all' ? 'primary' : 'outline-secondary'}
              onClick={() => setHistoryScope('all')}
            >
              All visits ({allCount})
            </Button>
            <Button
              size="xs"
              variant="outline-secondary"
              icon="fa-solid fa-rotate"
              onClick={reloadVitals}
              disabled={loading || saving}
              title="Refresh recorded vitals"
            />
          </div>
        }
      >
        {loading ? (
          <div style={{ padding: spacing.lg }}>
            <SkeletonRows rows={4} columns={6} />
          </div>
        ) : readingGroups.length === 0 ? (
          <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>
            {historyScope === 'encounter'
              ? 'No vitals recorded for this visit yet. Enter readings in the form above and click Save vitals.'
              : 'No vitals recorded for this patient yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="emrws-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 170 }}>Date & Time</th>
                  {displayedVitals.map((m) => (
                    <th key={m.Id} scope="col" style={{ textAlign: 'center' }}>
                      <div>{m.Description || m.VitalName}</div>
                      {m.UOM && <div style={{ ...typography.caption, color: colors.textSubtle, fontWeight: 400 }}>({m.UOM})</div>}
                    </th>
                  ))}
                  <th scope="col" style={{ maxWidth: 200 }}>Notes</th>
                  <th scope="col" style={{ width: 150 }}>Recorded By</th>
                  {canEdit && <th scope="col" style={{ width: 80, textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {readingGroups.map((grp) => {
                  const isCurrentEditing = grp.groupId != null && grp.groupId === groupId;
                  const isThisVisit = grp.encounterId === context.encounterId;
                  return (
                    <tr
                      key={grp.key}
                      style={{
                        background: isCurrentEditing ? colors.primaryLight : undefined,
                      }}
                    >
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain }}>{formatDateTime(grp.date)}</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
                          {isThisVisit && (
                            <span
                              style={{
                                ...typography.caption,
                                padding: '1px 6px',
                                borderRadius: radii.full,
                                background: colors.successBg,
                                color: colors.successText,
                                border: `1px solid ${colors.successBorder}`,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              This visit
                            </span>
                          )}
                          {isCurrentEditing && (
                            <span
                              style={{
                                ...typography.caption,
                                padding: '1px 6px',
                                borderRadius: radii.full,
                                background: colors.primary,
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Editing
                            </span>
                          )}
                        </div>
                      </td>
                      {displayedVitals.map((m) => (
                        <td key={m.Id} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderHistoryCell(grp.values.get(Number(m.Id)), m)}
                        </td>
                      ))}
                      <td style={{ color: grp.comments ? colors.textBody : colors.textDisabled, fontSize: 12, maxWidth: 220 }}>
                        {grp.comments || '—'}
                      </td>
                      <td style={{ color: colors.textMuted, fontSize: 12, whiteSpace: 'nowrap' }}>
                        {grp.performer || '—'}
                      </td>
                      {canEdit && (
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {isThisVisit ? (
                            <Button
                              size="xs"
                              variant={isCurrentEditing ? 'primary' : 'outline-primary'}
                              icon="fa-solid fa-pen-to-square"
                              onClick={() => handleEditGroup(grp)}
                              title="Edit this reading set in the form above"
                            >
                              {isCurrentEditing ? 'Editing' : 'Edit'}
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="outline-secondary"
                              icon="fa-solid fa-copy"
                              onClick={() => handleEditGroup(grp)}
                              title="Load values into form as a new reading"
                            >
                              Copy
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelSection>

      {/* ────────────────────────── 3. ALLERGIES ────────────────────────── */}
      <AllergyList context={context} canEdit={canEdit} onDataChanged={onDataChanged} />
    </div>
  );
};
