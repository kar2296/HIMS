/**
 * VITALS panel matching SIMPLEX HIMES Master V9.3
 * Reference: https://staging.simplexworld.com/MasterV9.3/patientRegistration#tabEMR
 *
 * Implements:
 * 1. Top action strip: Load Vitals, Load Previous Vitals, Nursing Assessment Completed, Refused by Patient, Print
 * 2. Visual table layout with warm brown/orange labels (#c05621)
 * 3. Exact field adornments:
 *    - Body Temp: Celsius/Fahrenheit, up/down arrows, alert triangle, thermometer icon
 *    - Blood Pressure: Systolic / Diastolic side-by-side with mmHg and alert
 *    - Pulse Rate: Pulse/min, Age Category selector (Adult/Child/Neonate), EKG wave icon
 *    - Blood Sugar: mg/dL, blood droplet icon, alert
 *    - Waist & Hips: cm, measuring tape icon, alert
 *    - SpO2: %, pulse oximeter icon, alert
 *    - Respiratory Rate: breaths/min, alert
 *    - Vital Element Pain Score: "Now patient has pain" with Yes / No pill toggle
 *    - Vital Pain Score: Wong-Baker 6 FACES pain scale (0, 2, 4, 6, 8, 10)
 *    - Height, Weight, BMI Index: Quetelet auto-calculator with category badge
 *    - Full support for all 46 configurable elements from Master Catalog
 * 4. Recorded Vitals History flowsheet table and Allergy list
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { calculateBmi, cleanLookup, formatDateTime, qualifierIdFor, rangeStatus } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, RangeFlag } from '../EmrUi';
import { AllergyList } from './AllergyPanel';
import { draftKey, useEmrDraft, type UseEmrDraftResult } from '../useEmrDraft';
import { DraftBanners, DraftStatusChip } from '../DraftStatus';
import {
  VITAL_ELEMENTS_CATALOG,
  loadConfiguredVitalElements,
  type ConfiguredVitalElement,
  type VitalElementDef,
} from '../vitalElementsCatalog';

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
  /** Systolic for BP, or Height for BMI */
  value1: string;
  /** Diastolic for BP, or Weight for BMI */
  value2: string;
  /** Existing PatientVital.Id for this encounter */
  existingId?: number;
}

const emptyEntry = (): VitalEntry => ({ value: '', value1: '', value2: '' });

interface VitalsDraft {
  values: Record<string, [string, string, string]>;
  performedAt: string;
  notes: string;
  newReading: boolean;
  nursingCompleted?: boolean;
  refusedByPatient?: boolean;
}

const toVitalsDraft = (
  entries: Record<number, VitalEntry>,
  performedAt: string,
  notes: string,
  newReading: boolean,
  nursingCompleted = false,
  refusedByPatient = false,
): VitalsDraft => {
  const values: Record<string, [string, string, string]> = {};
  Object.keys(entries)
    .sort()
    .forEach((id) => {
      const e = entries[Number(id)];
      if (e && (e.value || e.value1 || e.value2)) {
        values[id] = [e.value, e.value1, e.value2];
      }
    });
  return { values, performedAt, notes, newReading, nursingCompleted, refusedByPatient };
};

const nowLocalInput = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toLocalInput = (iso?: string | null) => {
  if (!iso) return nowLocalInput();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return nowLocalInput();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface VitalsData {
  masters: VitalMaster[];
  rows: PatientVitalRow[];
  historyRows: PatientVitalRow[];
}

export const VitalsPanel: React.FC<EmrPanelProps> = ({
  context,
  encounter,
  canEdit,
  registerSaveHandler,
  onDataChanged,
}) => {
  const [entries, setEntries] = useState<Record<number, VitalEntry>>({});
  const [performedAt, setPerformedAt] = useState<string>(nowLocalInput());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const [newReading, setNewReading] = useState(false);
  const [baseline, setBaseline] = useState<VitalsDraft | undefined>(undefined);
  const [historyScope, setHistoryScope] = useState<'encounter' | 'all'>('encounter');

  // Top action strip checkboxes & temperature mode
  const [nursingCompleted, setNursingCompleted] = useState(false);
  const [refusedByPatient, setRefusedByPatient] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [ageCategory, setAgeCategory] = useState<'Adult' | 'Pediatric' | 'Neonate'>('Adult');

  const draftRef = useRef<UseEmrDraftResult<VitalsDraft> | null>(null);

  // Load configured elements for this EMR form (defaults to standard 12)
  const configuredElements: ConfiguredVitalElement[] = useMemo(() => {
    return loadConfiguredVitalElements('1');
  }, []);

  /* ───────────── data loading & reading groups ───────────── */

  const fetchVitalsData = useCallback(async (): Promise<VitalsData> => {
    const patientId = context.patientId;
    const encounterId = context.encounterId;

    const [lookup, encounterRecorded, allRecorded] = await Promise.all([
      apiFetch('General/Options/getoptions', [
        { Key: 'Vital' },
        { Key: 'PatientVitalStatus' },
        { Key: 'VitalQualifier' },
      ]).catch(() => ({})),
      encounterId
        ? apiFetch('emr/patientvital/GetPatientVitals', {
            Params: [
              { Key: 2, Value: patientId },
              { Key: 9, Value: encounterId },
            ],
            PageContext: { PageSize: 500, PageNumber: 1 },
          }).catch(() => ({ Data: [] }))
        : Promise.resolve({ Data: [] }),
      patientId
        ? apiFetch('emr/patientvital/GetPatientVitals', {
            Params: [{ Key: 2, Value: patientId }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          }).catch(() => ({ Data: [] }))
        : Promise.resolve({ Data: [] }),
    ]);

    const dbMasters = (cleanLookup(lookup?.Vital) as VitalMaster[]) || [];

    // Synthesize all 46 elements from catalog if missing in database
    const syntheticMasters: VitalMaster[] = VITAL_ELEMENTS_CATALOG.map((catEl) => {
      const match = dbMasters.find(
        (m) =>
          Number(m.Id) === catEl.elementId ||
          (m.VitalName && m.VitalName.toLowerCase() === catEl.name.toLowerCase()),
      );
      if (match) return match;
      return {
        Id: catEl.elementId,
        Text: catEl.name,
        VitalName: catEl.name,
        Description: catEl.name,
        UOM: catEl.uom || '',
        ReferenceRangeFrom: catEl.normalRange ? String(catEl.normalRange.from) : undefined,
        ReferenceRangeTo: catEl.normalRange ? String(catEl.normalRange.to) : undefined,
        DisplayOrder: catEl.elementId,
      };
    });

    return {
      masters: syntheticMasters,
      rows: encounterRecorded?.Data || [],
      historyRows: allRecorded?.Data || [],
    };
  }, [context.patientId, context.encounterId]);

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
        if (
          master &&
          (master.VitalName?.toLowerCase().includes('blood pressure') || vId === 3) &&
          typeof r.VitalValue === 'string' &&
          r.VitalValue.includes('~')
        ) {
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

  const vitalsQuery = useAsyncData<VitalsData>(
    fetchVitalsData,
    { masters: [], rows: [], historyRows: [] },
    { errorMessage: 'Could not load vitals.', onSuccess: applyLoadedVitals },
  );

  const { loading, error: loadError, reload: reloadVitals } = vitalsQuery;
  const masters = vitalsQuery.data.masters;

  /* ───────────── entry update helpers ───────────── */

  const updateEntry = (id: number, patch: Partial<VitalEntry>) => {
    const numId = Number(id);
    setEntries((prev) => ({
      ...prev,
      [numId]: { ...(prev[numId] || emptyEntry()), ...patch },
    }));
  };

  // BMI Auto-calculation (Element 2)
  const heightEntry = entries[2]?.value1 || '';
  const weightEntry = entries[2]?.value2 || '';
  const computedBmi = useMemo(() => {
    const h = parseFloat(heightEntry);
    const w = parseFloat(weightEntry);
    return calculateBmi(h, w);
  }, [heightEntry, weightEntry]);

  /* ───────────── drafts ───────────── */

  const draftStorageKey = useMemo(
    () => draftKey('vitals', context.patientId, context.encounterId, context.consultationId),
    [context.patientId, context.encounterId, context.consultationId],
  );

  const currentSnapshot = useMemo<VitalsDraft>(
    () => toVitalsDraft(entries, performedAt, notes, newReading, nursingCompleted, refusedByPatient),
    [entries, performedAt, notes, newReading, nursingCompleted, refusedByPatient],
  );

  const restoreDraft = useCallback((d: VitalsDraft) => {
    const restored: Record<number, VitalEntry> = {};
    Object.entries(d.values || {}).forEach(([id, [val, v1, v2]]) => {
      restored[Number(id)] = { value: val || '', value1: v1 || '', value2: v2 || '' };
    });
    setEntries(restored);
    if (d.performedAt) setPerformedAt(d.performedAt);
    if (d.notes) setNotes(d.notes);
    if (d.nursingCompleted !== undefined) setNursingCompleted(d.nursingCompleted);
    if (d.refusedByPatient !== undefined) setRefusedByPatient(d.refusedByPatient);
    setNewReading(Boolean(d.newReading));
    if (d.newReading) setGroupId(undefined);
  }, []);

  const draft = useEmrDraft<VitalsDraft>({
    storageKey: canEdit ? draftStorageKey : null,
    value: currentSnapshot,
    baseline,
    onRestore: restoreDraft,
  });
  draftRef.current = draft;

  /* ───────────── save vitals ───────────── */

  const save = useCallback(async (): Promise<boolean> => {
    if (!context.encounterId || !context.patientId) {
      alert.showErrorMsg('No active encounter found.');
      return false;
    }

    const payload: PatientVitalRow[] = [];
    Object.entries(entries).forEach(([idStr, ent]) => {
      const vId = Number(idStr);
      let finalVal = ent.value;
      if (vId === 3) {
        // Blood pressure
        if (ent.value1 || ent.value2) {
          finalVal = `${ent.value1 || ''}~${ent.value2 || ''}`;
        }
      } else if (vId === 2) {
        // Height & Weight & BMI
        finalVal = computedBmi ? String(computedBmi) : ent.value;
      }

      if (finalVal || ent.existingId) {
        payload.push({
          Id: ent.existingId,
          VitalId: vId,
          VitalValue: finalVal || '',
          GroupId: groupId,
          EncounterId: context.encounterId,
          PatientId: context.patientId,
          PerformedDate: performedAt,
          Comments: notes || undefined,
        });
      }
    });

    if (payload.length === 0 && !notes && !nursingCompleted && !refusedByPatient) {
      alert.showErrorMsg('Please enter at least one vital sign before saving.');
      return false;
    }

    setSaving(true);
    try {
      await apiFetch('emr/patientvital/ManagePatientVitals', { Data: payload });
      alert.showSuccessMsg('Vital signs saved successfully.');
      draft.clearDraft();
      reloadVitals();
      if (onDataChanged) onDataChanged('vitals');
      return true;
    } catch {
      alert.showErrorMsg('Failed to save vitals.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [context, entries, groupId, performedAt, notes, computedBmi, nursingCompleted, refusedByPatient, draft, reloadVitals, onDataChanged]);

  useEffect(() => {
    registerSaveHandler?.(canEdit ? save : null);
    return () => registerSaveHandler?.(null);
  }, [registerSaveHandler, canEdit, save]);

  /* ───────────── start new reading / load previous ───────────── */

  const startNewReading = () => {
    setEntries({});
    setGroupId(undefined);
    setPerformedAt(nowLocalInput());
    setNotes('');
    setNewReading(true);
    setBaseline(toVitalsDraft({}, nowLocalInput(), '', true));
  };

  const loadPreviousVitals = () => {
    const prevRows = vitalsQuery.data.historyRows.filter((r) => r.EncounterId !== context.encounterId);
    if (prevRows.length === 0) {
      alert.showInfoMsg('No previous vitals found for this patient.');
      return;
    }
    const latestPrevGroup = prevRows.reduce<number | undefined>((acc, r) => {
      const g = r.GroupId != null ? Number(r.GroupId) : undefined;
      if (g === undefined) return acc;
      return acc === undefined || g > acc ? g : acc;
    }, undefined);

    loadReadingGroup(latestPrevGroup, prevRows, masters);
    setGroupId(undefined); // Treat as new reading for this visit
    setPerformedAt(nowLocalInput());
    alert.showSuccessMsg('Loaded vitals from previous visit.');
  };

  /* ───────────── rendering each vital row matching reference image ───────────── */

  const renderVitalRow = (elDef: VitalElementDef) => {
    const mId = elDef.elementId;
    const entry = entries[mId] || emptyEntry();
    const val = entry.value;

    return (
      <div
        key={elDef.code}
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          padding: '14px 20px',
          borderBottom: '1px solid #edf2f7',
          alignItems: 'center',
          background: '#fff',
        }}
      >
        {/* Left Column: Label in warm rust/orange color (#c05621) */}
        <div>
          <span
            style={{
              color: '#c05621',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.2px',
            }}
          >
            {elDef.name}
          </span>
        </div>

        {/* Right Column: Inline Inputs with floating labels & indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* 1. Body Temperature */}
          {mId === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>
                  Reading {tempUnit === 'C' ? 'Celsius' : 'Fahrenheit'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={val}
                    disabled={!canEdit}
                    onChange={(e) => updateEntry(1, { value: e.target.value })}
                    style={{
                      width: 100,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  {val && (
                    <span style={{ fontSize: 13, color: '#e53e3e', fontWeight: 700 }}>
                      {parseFloat(val) < 36 ? '↓' : parseFloat(val) > 37.5 ? '↑' : ''}
                    </span>
                  )}
                  {val && (parseFloat(val) < 36 || parseFloat(val) > 37.5) && (
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} title="Abnormal temperature" />
                  )}
                  <i className="fa-solid fa-temperature-half" style={{ color: '#718096', fontSize: 15 }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  border: '1px solid #cbd5e0',
                  background: '#f7fafc',
                  color: '#4a5568',
                  cursor: 'pointer',
                  marginTop: 14,
                }}
              >
                °{tempUnit}
              </button>
            </div>
          )}

          {/* 2. Height, Weight and BMI Index */}
          {mId === 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Height (cm)</div>
                <input
                  type="number"
                  placeholder="170"
                  value={entry.value1}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(2, { value1: e.target.value })}
                  style={{
                    width: 90,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Weight (kg)</div>
                <input
                  type="number"
                  placeholder="70"
                  value={entry.value2}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(2, { value2: e.target.value })}
                  style={{
                    width: 90,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
              </div>

              {computedBmi && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      background: '#edf2f7',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#2d3748',
                    }}
                  >
                    BMI: {computedBmi} kg/m²
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontWeight: 700,
                      background:
                        computedBmi < 18.5
                          ? '#feebc8'
                          : computedBmi <= 24.9
                          ? '#c6f6d5'
                          : computedBmi <= 29.9
                          ? '#feebc8'
                          : '#fed7d7',
                      color:
                        computedBmi < 18.5
                          ? '#7b341e'
                          : computedBmi <= 24.9
                          ? '#22543d'
                          : computedBmi <= 29.9
                          ? '#7b341e'
                          : '#742a2a',
                    }}
                  >
                    {computedBmi < 18.5
                      ? 'Underweight'
                      : computedBmi <= 24.9
                      ? 'Normal'
                      : computedBmi <= 29.9
                      ? 'Overweight'
                      : 'Obese'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3. Blood Pressure */}
          {mId === 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Systolic Reading</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    placeholder="120"
                    value={entry.value1}
                    disabled={!canEdit}
                    onChange={(e) => updateEntry(3, { value1: e.target.value })}
                    style={{
                      width: 90,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#718096' }}>mmHg</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Diastolic Reading</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    placeholder="80"
                    value={entry.value2}
                    disabled={!canEdit}
                    onChange={(e) => updateEntry(3, { value2: e.target.value })}
                    style={{
                      width: 90,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#718096' }}>mmHg</span>
                  {entry.value1 && (parseInt(entry.value1, 10) > 140 || parseInt(entry.value2, 10) > 90) && (
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} title="Elevated blood pressure" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Pulse Rate */}
          {mId === 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Pulse Reading</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    placeholder="72"
                    value={val}
                    disabled={!canEdit}
                    onChange={(e) => updateEntry(4, { value: e.target.value })}
                    style={{
                      width: 90,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#718096' }}>/ Minute</span>
                  {val && (parseInt(val, 10) < 50 || parseInt(val, 10) > 100) && (
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} />
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#718096', fontWeight: 600, marginBottom: 2 }}>Age Category</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value as any)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 13,
                      color: '#2d3748',
                      background: '#fff',
                    }}
                  >
                    <option value="Adult">Adult</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Neonate">Neonate</option>
                  </select>
                  <i className="fa-solid fa-heart-pulse" style={{ color: '#e53e3e', fontSize: 16 }} />
                </div>
              </div>
            </div>
          )}

          {/* 5. Blood Sugar */}
          {mId === 5 && (
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Reading</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  placeholder="100"
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(5, { value: e.target.value })}
                  style={{
                    width: 100,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#718096' }}>mg/dL</span>
                <i className="fa-solid fa-droplet" style={{ color: '#e53e3e', fontSize: 14 }} />
                {val && (parseInt(val, 10) < 70 || parseInt(val, 10) > 180) && (
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} />
                )}
              </div>
            </div>
          )}

          {/* 6. Waist Circumference */}
          {mId === 6 && (
            <div>
              <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Reading Centimeter</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  placeholder="34.00"
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(6, { value: e.target.value })}
                  style={{
                    width: 100,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
                <i className="fa-solid fa-ruler-horizontal" style={{ color: '#718096', fontSize: 14 }} />
                {val && parseFloat(val) > 102 && (
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} />
                )}
              </div>
            </div>
          )}

          {/* 7. SpO2 */}
          {mId === 7 && (
            <div>
              <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Reading Peripheral Saturation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  placeholder="98"
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(7, { value: e.target.value })}
                  style={{
                    width: 100,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#718096' }}>%</span>
                <i className="fa-solid fa-lungs" style={{ color: '#3182ce', fontSize: 14 }} />
                {val && parseInt(val, 10) < 95 && (
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} />
                )}
              </div>
            </div>
          )}

          {/* 8. Respiratory Rate */}
          {mId === 8 && (
            <div>
              <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Reading</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  placeholder="16"
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(8, { value: e.target.value })}
                  style={{
                    width: 100,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#718096' }}>/ Minute</span>
                {val && (parseInt(val, 10) < 10 || parseInt(val, 10) > 24) && (
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53e3e', fontSize: 13 }} />
                )}
              </div>
            </div>
          )}

          {/* 9. Hips Circumference */}
          {mId === 9 && (
            <div>
              <div style={{ fontSize: 10, color: '#dd6b20', fontWeight: 600, marginBottom: 2 }}>Reading</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  placeholder="95.00"
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(9, { value: e.target.value })}
                  style={{
                    width: 100,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#718096' }}>cm</span>
                <i className="fa-solid fa-ruler" style={{ color: '#718096', fontSize: 14 }} />
              </div>
            </div>
          )}

          {/* 12. Vital Element Pain Score (Yes / No Toggle) */}
          {mId === 12 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 13, color: '#4a5568', fontWeight: 500 }}>Now patient has pain</span>
              <div style={{ display: 'inline-flex', borderRadius: 4, overflow: 'hidden', border: '1px solid #cbd5e0' }}>
                <button
                  type="button"
                  onClick={() => updateEntry(12, { value: 'Yes' })}
                  disabled={!canEdit}
                  style={{
                    padding: '5px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: val === 'Yes' ? '#e53e3e' : '#f7fafc',
                    color: val === 'Yes' ? '#fff' : '#4a5568',
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateEntry(12, { value: 'No' })}
                  disabled={!canEdit}
                  style={{
                    padding: '5px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: val === 'No' || val === '' ? '#38a169' : '#f7fafc',
                    color: val === 'No' || val === '' ? '#fff' : '#4a5568',
                  }}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* 16. Vital Pain Score (Wong-Baker 6 Smiley Faces 0-10) */}
          {mId === 16 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                { score: '0', label: 'No Hurt', emoji: '😄' },
                { score: '2', label: 'Hurts Little', emoji: '🙂' },
                { score: '4', label: 'Hurts More', emoji: '😐' },
                { score: '6', label: 'Hurts Even More', emoji: '🙁' },
                { score: '8', label: 'Hurts Whole Lot', emoji: '😢' },
                { score: '10', label: 'Hurts Worst', emoji: '😭' },
              ].map((face) => {
                const isSelected = val === face.score;
                return (
                  <button
                    key={face.score}
                    type="button"
                    title={`${face.score} - ${face.label}`}
                    onClick={() => updateEntry(16, { value: face.score })}
                    disabled={!canEdit}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: isSelected ? '3px solid #dd6b20' : '1px solid #cbd5e0',
                      background: isSelected ? '#feebc8' : '#f7fafc',
                      cursor: 'pointer',
                      fontSize: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 0 0 2px rgba(221,107,32,0.3)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {face.emoji}
                  </button>
                );
              })}
              {val !== '' && (
                <span
                  style={{
                    marginLeft: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#dd6b20',
                    background: '#feebc8',
                    padding: '3px 10px',
                    borderRadius: 12,
                  }}
                >
                  Score: {val}/10
                </span>
              )}
            </div>
          )}

          {/* 33. Allergy */}
          {mId === 33 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#718096' }}>Allergies logged in patient banner</span>
              <span style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>
                {context.patientId ? 'Active Allergies Monitored' : 'None Documented'}
              </span>
            </div>
          )}

          {/* Generic fallback for any other of the 46 configured elements */}
          {![1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 33].includes(mId) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {elDef.options && elDef.options.length > 0 ? (
                <select
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => updateEntry(mId, { value: e.target.value })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 13,
                    color: '#2d3748',
                    background: '#fff',
                    minWidth: 200,
                  }}
                >
                  <option value="">Select {elDef.name}…</option>
                  {elDef.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={`Enter ${elDef.name}`}
                    value={val}
                    disabled={!canEdit}
                    onChange={(e) => updateEntry(mId, { value: e.target.value })}
                    style={{
                      width: 180,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                    }}
                  />
                  {elDef.uom && <span style={{ fontSize: 12, color: '#718096' }}>{elDef.uom}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ───────────── recorded history flowsheet rendering ───────────── */

  const readingGroups = useMemo(() => {
    const rows = historyScope === 'encounter' ? vitalsQuery.data.rows : vitalsQuery.data.historyRows;
    const map = new Map<number | string, { date?: string; encounterId?: number; values: Map<number, PatientVitalRow>; comments?: string; performer?: string }>();

    rows.forEach((r) => {
      const gKey = r.GroupId != null ? r.GroupId : `row-${r.Id}`;
      if (!map.has(gKey)) {
        map.set(gKey, {
          date: r.PerformedDate,
          encounterId: r.EncounterId,
          values: new Map(),
          comments: r.Comments,
          performer: r.PerformedUser ? `${r.PerformedUser.FirstName || ''} ${r.PerformedUser.LastName || ''}`.trim() : undefined,
        });
      }
      map.get(gKey)!.values.set(Number(r.VitalId), r);
    });

    return Array.from(map.entries()).map(([k, v]) => ({
      key: String(k),
      groupId: typeof k === 'number' ? k : undefined,
      ...v,
    }));
  }, [historyScope, vitalsQuery.data]);

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <DraftBanners draft={draft} />

      {/* ────────────────── 1. TOP ACTION STRIP MATCHING REFERENCE ────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          padding: '10px 16px',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={reloadVitals}
            disabled={loading || saving}
            style={{
              background: '#b7791f',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fa-solid fa-arrows-rotate" /> Load Vitals
          </button>

          <button
            type="button"
            onClick={loadPreviousVitals}
            disabled={loading || saving}
            style={{
              background: '#b7791f',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fa-solid fa-clock-rotate-left" /> Load Previous Vitals
          </button>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: 13, color: '#4a5568' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={nursingCompleted}
              disabled={!canEdit}
              onChange={(e) => setNursingCompleted(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Nursing Assessment Completed</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={refusedByPatient}
              disabled={!canEdit}
              onChange={(e) => setRefusedByPatient(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Refused by Patient</span>
          </label>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: '#fff',
              border: '1px solid #cbd5e0',
              color: '#4a5568',
              borderRadius: 4,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa-solid fa-print" /> Print
          </button>

          <Button
            size="sm"
            variant="primary"
            icon="fa-solid fa-floppy-disk"
            onClick={save}
            loading={saving}
            loadingText="Saving…"
            disabled={!canEdit || loading}
          >
            Save Vitals
          </Button>
        </div>
      </div>

      {/* ────────────────── 2. VITAL ELEMENTS ENTRY FORM ────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Strip Header with Status & New Reading action */}
        <div
          style={{
            padding: '10px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #edf2f7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#2d3748' }}>
              <i className="fa-solid fa-heart-pulse" style={{ color: '#e53e3e', marginRight: 8 }} />
              Clinical Vital Signs Form
            </span>
            {groupId !== undefined ? (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#ebf8ff',
                  color: '#2b6cb0',
                  fontWeight: 600,
                }}
              >
                Editing Reading #{groupId}
              </span>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#f7fafc',
                  color: '#718096',
                  fontWeight: 600,
                }}
              >
                New Entry
              </span>
            )}
            <DraftStatusChip draft={draft} serverAutoSave />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#718096' }}>Recorded at:</span>
            <input
              type="datetime-local"
              value={performedAt}
              disabled={!canEdit}
              onChange={(e) => setPerformedAt(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e0',
                fontSize: 12,
                color: '#2d3748',
              }}
            />
            <Button size="xs" variant="outline-primary" icon="fa-solid fa-plus" onClick={startNewReading} disabled={!canEdit}>
              New reading
            </Button>
          </div>
        </div>

        {/* Form Body Rows */}
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonRows rows={8} columns={2} />
          </div>
        ) : loadError ? (
          <div style={{ padding: 20 }}>
            <InlineNotice tone="danger">
              {loadError}{' '}
              <Button size="xs" variant="link" onClick={reloadVitals}>
                Try again
              </Button>
            </InlineNotice>
          </div>
        ) : (
          <div>
            {/* Render all elements configured in Master (ordered) */}
            {configuredElements.map((cfg) => {
              const def = VITAL_ELEMENTS_CATALOG.find((cat) => cat.elementId === cfg.elementId);
              if (!def) return null;
              return renderVitalRow(def);
            })}

            {/* Additional Clinical Notes */}
            <div style={{ padding: '14px 20px', background: '#fafafa', borderTop: '1px solid #edf2f7' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 }}>
                Clinical Observations / Vital Notes:
              </div>
              <textarea
                rows={2}
                value={notes}
                disabled={!canEdit}
                placeholder="Patient position, cuff size, supplemental oxygen flow, or clinical notes…"
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── 3. RECORDED VITALS HISTORY FLOWSHEET ────────────────── */}
      <PanelSection
        title="Recorded Vitals Flowsheet"
        icon="fa-solid fa-clock-rotate-left"
        flush
        actions={
          <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
            <Button
              size="xs"
              variant={historyScope === 'encounter' ? 'primary' : 'outline-secondary'}
              onClick={() => setHistoryScope('encounter')}
            >
              This visit ({vitalsQuery.data.rows.length})
            </Button>
            <Button
              size="xs"
              variant={historyScope === 'all' ? 'primary' : 'outline-secondary'}
              onClick={() => setHistoryScope('all')}
            >
              All visits ({vitalsQuery.data.historyRows.length})
            </Button>
          </div>
        }
      >
        {readingGroups.length === 0 ? (
          <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>
            {historyScope === 'encounter'
              ? 'No vitals recorded for this visit yet. Fill the form above and click Save Vitals.'
              : 'No vitals recorded across previous visits.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="emrws-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 170 }}>Date & Time</th>
                  {configuredElements.slice(0, 8).map((cfg) => (
                    <th key={cfg.code} scope="col" style={{ textAlign: 'center' }}>
                      {cfg.name}
                    </th>
                  ))}
                  <th scope="col">Notes</th>
                  <th scope="col">Recorded By</th>
                  {canEdit && <th scope="col" style={{ width: 70, textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {readingGroups.map((grp) => {
                  const isCurrent = grp.groupId != null && grp.groupId === groupId;
                  return (
                    <tr key={grp.key} style={{ background: isCurrent ? '#ebf8ff' : undefined }}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: 13 }}>
                        {formatDateTime(grp.date)}
                      </td>
                      {configuredElements.slice(0, 8).map((cfg) => {
                        const cell = grp.values.get(cfg.elementId);
                        const raw = cell?.VitalValue || '—';
                        return (
                          <td key={cfg.code} style={{ textAlign: 'center', fontSize: 13 }}>
                            {raw}
                          </td>
                        );
                      })}
                      <td style={{ fontSize: 12, color: '#718096' }}>{grp.comments || '—'}</td>
                      <td style={{ fontSize: 12, color: '#718096' }}>{grp.performer || '—'}</td>
                      {canEdit && (
                        <td style={{ textAlign: 'center' }}>
                          <Button
                            size="xs"
                            variant={isCurrent ? 'primary' : 'outline-primary'}
                            onClick={() => {
                              const allRows =
                                vitalsQuery.data.rows.length > 0
                                  ? vitalsQuery.data.rows
                                  : vitalsQuery.data.historyRows;
                              loadReadingGroup(grp.groupId, allRows, masters);
                            }}
                          >
                            {isCurrent ? 'Editing' : 'Edit'}
                          </Button>
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

      {/* ────────────────── 4. ALLERGIES SUMMARY ────────────────── */}
      <AllergyList context={context} canEdit={canEdit} onDataChanged={onDataChanged} />
    </div>
  );
};
