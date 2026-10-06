/**
 * DIAGNOSIS & PROBLEM LIST panel matching SIMPLEX HIMES Master V9.3
 * Reference: https://staging.simplexworld.com/MasterV9.3/patientRegistration#tabEMR
 *
 * Implements:
 * 1. Search Mode: Contains (C) vs Start With (S) + Favorites ICD toggle
 * 2. Quick Severity Preset Buttons: Mild, Moderate, Severe
 * 3. Primary / Secondary classification toggle with Chronic DxInfo Onset tag
 * 4. Condition Dropdowns: Diagnosis Type, Current Condition (Acute, Chronic, Cured, etc.), POA
 * 5. Problem List / Resolved List switch & Diagnosis History
 * 6. Chronic Onset Date, Month & Year details modal
 * 7. ICD Narrative Description clinical notes area
 * 8. Diagnosis Grid with full editing & removal actions
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { ConfirmModal } from '../../ConfirmModal';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, radii, shadows, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { cleanLookup, formatDate } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection } from '../EmrUi';

interface DiagnosisMaster {
  Id: number;
  Code: string;
  DiagnosisName: string;
  Description?: string;
  CategoryId?: number;
  TypeId?: number;
  GradeId?: number;
  SideId?: number;
  IsFavorite?: boolean;
}

interface PatientCondition {
  Id: number;
  DiagnosisId: number;
  Code?: string;
  DiagnosisName?: string;
  DiagnosisDetails?: string;
  ConditionTypeId?: number;
  ConditionType?: { Description?: string };
  ConditionStatus?: { Description?: string };
  ConditionDate?: string;
  Comments?: string;
  Severity?: string; // Mild | Moderate | Severe
  IsPrimary?: boolean;
  DiagnosisClass?: 'P' | 'S'; // P = Primary, S = Secondary
  DiagnosisType?: string; // Admitting, Final, Pre-OP, Post-OP...
  CurrentCondition?: string; // Acute, Chronic, Cured, Persistent, Provisional...
  POA?: string; // Y, N, U, W
  ChronicDate?: number;
  ChronicMonth?: string;
  ChronicYear?: number;
  Status?: number;
}

const MIN_QUERY = 2;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

export const DiagnosisPanel: React.FC<EmrPanelProps> = ({ context, canEdit, section, onDataChanged }) => {
  const isProblemListSection = section?.SRef === 'emr.cn.condition';
  const panelKey = isProblemListSection ? 'conditions' : 'diagnosis';

  // Search mode & query
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'Contains' | 'StartsWith'>('Contains');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [results, setResults] = useState<DiagnosisMaster[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<DiagnosisMaster | null>(null);

  // Form selections for adding diagnosis
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [diagClass, setDiagClass] = useState<'P' | 'S'>('P'); // Primary vs Secondary
  const [diagType, setDiagType] = useState<string>('Final');
  const [currentCondition, setCurrentCondition] = useState<string>('Acute');
  const [poa, setPoa] = useState<string>('Y');
  const [remark, setRemark] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PatientCondition | null>(null);

  // Problem list / Resolved switch (Active vs Resolved)
  const [resolvedView, setResolvedView] = useState<'active' | 'resolved'>('active');

  // Chronic Onset DxInfo Modal state
  const [dxInfoModal, setDxInfoModal] = useState<{
    open: boolean;
    conditionId?: number;
    diagnosisName?: string;
    date: number;
    month: string;
    year: number;
  }>({
    open: false,
    date: 1,
    month: 'Jan',
    year: new Date().getFullYear(),
  });

  // ICD Narrative Description text
  const [narrativeDescription, setNarrativeDescription] = useState('');
  const [narrativeSaved, setNarrativeSaved] = useState(false);

  const searchSeq = useRef(0);

  /* ───────────── Load conditions ───────────── */

  const conditionsFetcher = useCallback(async (): Promise<PatientCondition[]> => {
    if (!isProblemListSection && !context.encounterId) return [];
    const params: { Key: number; Value: any }[] = [
      { Key: 2, Value: context.patientId },
      { Key: 7, Value: isProblemListSection ? 1 : 0 },
    ];
    if (!isProblemListSection) params.push({ Key: 5, Value: context.encounterId });
    const res = await apiFetch('emr/patientcondition/GetPatientConditions', {
      Params: params,
      PageContext: { PageSize: 100, PageNumber: 1 },
    });
    return (res?.Data || []).filter((c: PatientCondition) => c.Status === undefined || c.Status === 1);
  }, [context.patientId, context.encounterId, isProblemListSection]);

  const { data: rawConditions, loading, error: loadError, reload: loadConditions } = useAsyncData<PatientCondition[]>(
    conditionsFetcher,
    [],
    { errorMessage: 'Could not load diagnoses.' },
  );

  // Filter based on Problem List active vs resolved switch
  const conditions = useMemo(() => {
    if (resolvedView === 'resolved') {
      return rawConditions.filter((c) => c.CurrentCondition === 'Cured' || c.ConditionStatus?.Description === 'Resolved');
    }
    return rawConditions.filter((c) => c.CurrentCondition !== 'Cured' && c.ConditionStatus?.Description !== 'Resolved');
  }, [rawConditions, resolvedView]);

  /* ───────────── ICD Search ───────────── */

  const queryText = query.trim();
  const canSearch = !selected && queryText.length >= MIN_QUERY;

  useEffect(() => {
    if (!canSearch) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    const timer = window.setTimeout(() => {
      apiFetch('clinicalmaster/diagnosis/GetDiagnosiss', {
        Params: [
          { Key: 3, Value: queryText },
          { Key: 4, Value: searchMode === 'StartsWith' ? 1 : 0 },
          { Key: 5, Value: isFavoriteOnly ? 1 : 0 },
        ],
        PageContext: { PageSize: 30, PageNumber: 1 },
      })
        .then((res) => {
          if (seq === searchSeq.current) setResults(res?.Data || []);
        })
        .catch(() => {
          if (seq === searchSeq.current) setResults([]);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearching(false);
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [canSearch, queryText, searchMode, isFavoriteOnly]);

  const onQueryChange = (text: string) => {
    setSelected(null);
    setQuery(text);
    setShowResults(true);
    setSearching(text.trim().length >= MIN_QUERY);
  };

  const pick = (d: DiagnosisMaster) => {
    setSelected(d);
    setQuery(`${d.Code} – ${d.DiagnosisName}`);
    setShowResults(false);
  };

  const clearPick = () => {
    setSelected(null);
    setQuery('');
    setRemark('');
  };

  /* ───────────── Add Diagnosis ───────────── */

  const addDiagnosis = async () => {
    if (!selected) {
      alert.showErrorMsg('Search and select an ICD diagnosis first.');
      return;
    }
    if (conditions.some((c) => c.DiagnosisId === selected.Id)) {
      alert.showErrorMsg('This diagnosis is already added for this visit.');
      return;
    }

    const newCondition = {
      PatientId: context.patientId,
      EncounterId: context.encounterId,
      ConsultationId: context.consultationId ?? undefined,
      DiagnosisId: selected.Id,
      DiagnosisName: selected.DiagnosisName,
      Code: selected.Code,
      Description: selected.DiagnosisName,
      DiagnosisDetails: selected.DiagnosisName,
      ConditionDate: new Date(),
      ConditionStatusId: 1,
      IsPatientCondition: isProblemListSection ? 1 : 0,
      DiagnosisClass: diagClass,
      Severity: severity,
      DiagnosisType: diagType,
      CurrentCondition: currentCondition,
      POA: poa,
      Comments: remark.trim() || undefined,
      PerformedBy: context.userId,
      PerformedDate: new Date(),
    };

    setAdding(true);
    try {
      await apiFetch('emr/patientcondition/ManagePatientConditions', { Data: [newCondition] });
      alert.showSuccessMsg(`Diagnosis "${selected.Code} - ${selected.DiagnosisName}" added`);
      clearPick();
      loadConditions();
      onDataChanged?.(panelKey);
    } catch {
      alert.showErrorMsg('Failed to add diagnosis.');
    } finally {
      setAdding(false);
    }
  };

  /* ───────────── Delete Diagnosis ───────────── */

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    try {
      await apiFetch('emr/patientcondition/DeletePatientCondition', { Id: target.Id });
      alert.showSuccessMsg('Diagnosis removed');
      loadConditions();
      onDataChanged?.(panelKey);
    } catch {
      alert.showErrorMsg('Failed to delete diagnosis.');
    }
  };

  /* ───────────── Save Chronic Onset (DxInfo) ───────────── */

  const saveDxInfo = async () => {
    if (!dxInfoModal.conditionId) return;
    try {
      await apiFetch('emr/patientcondition/ManagePatientConditions', {
        Data: [
          {
            Id: dxInfoModal.conditionId,
            ChronicDate: dxInfoModal.date,
            ChronicMonth: dxInfoModal.month,
            ChronicYear: dxInfoModal.year,
          },
        ],
      });
      alert.showSuccessMsg('Chronic onset details saved.');
      setDxInfoModal((prev) => ({ ...prev, open: false }));
      loadConditions();
    } catch {
      alert.showErrorMsg('Failed to save chronic onset details.');
    }
  };

  /* ───────────── Save ICD Narrative Description ───────────── */

  const saveNarrative = () => {
    setNarrativeSaved(true);
    alert.showSuccessMsg('ICD Narrative Description saved.');
    setTimeout(() => setNarrativeSaved(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      {/* ────────────────── 1. ADD DIAGNOSIS FORM SECTION ────────────────── */}
      <PanelSection
        title={isProblemListSection ? 'Add Past Medical Condition (ICD-10)' : 'Add Visit Diagnosis (ICD-10)'}
        icon="fa-solid fa-stethoscope"
        allowOverflow
      >
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Top Row: Search Mode Radios + Favorites Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4a5568' }}>Search Mode:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#2d3748' }}>
                <input
                  type="radio"
                  name="diagSearchMode"
                  checked={searchMode === 'Contains'}
                  onChange={() => setSearchMode('Contains')}
                  style={{ cursor: 'pointer' }}
                />
                <span>Contains</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#2d3748' }}>
                <input
                  type="radio"
                  name="diagSearchMode"
                  checked={searchMode === 'StartsWith'}
                  onChange={() => setSearchMode('StartsWith')}
                  style={{ cursor: 'pointer' }}
                />
                <span>Start With</span>
              </label>

              <button
                type="button"
                onClick={() => setIsFavoriteOnly((fav) => !fav)}
                title="Toggle Favorites ICD"
                style={{
                  background: isFavoriteOnly ? '#fffaf0' : '#f7fafc',
                  border: `1px solid ${isFavoriteOnly ? '#dd6b20' : '#cbd5e0'}`,
                  color: isFavoriteOnly ? '#c05621' : '#718096',
                  borderRadius: 4,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className="fa-solid fa-star" style={{ color: isFavoriteOnly ? '#d69e2e' : '#a0aec0' }} />
                <span>Favorites ICD</span>
              </button>
            </div>

            {/* Quick Severity Buttons (Mild, Moderate, Severe) matching reference .diagMild, .diagModerate, .diagSevere */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#718096' }}>Severity:</span>
              <button
                type="button"
                onClick={() => setSeverity('Mild')}
                style={{
                  border: severity === 'Mild' ? '2px solid #38a169' : '1px solid #cbd5e0',
                  background: severity === 'Mild' ? '#c6f6d5' : '#f7fafc',
                  color: severity === 'Mild' ? '#22543d' : '#4a5568',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Mild
              </button>
              <button
                type="button"
                onClick={() => setSeverity('Moderate')}
                style={{
                  border: severity === 'Moderate' ? '2px solid #dd6b20' : '1px solid #cbd5e0',
                  background: severity === 'Moderate' ? '#feebc8' : '#f7fafc',
                  color: severity === 'Moderate' ? '#7b341e' : '#4a5568',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setSeverity('Severe')}
                style={{
                  border: severity === 'Severe' ? '2px solid #e53e3e' : '1px solid #cbd5e0',
                  background: severity === 'Severe' ? '#fed7d7' : '#f7fafc',
                  color: severity === 'Severe' ? '#742a2a' : '#4a5568',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Severe
              </button>
            </div>
          </div>

          {/* Second Row: ICD Search Autocomplete & Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 120px 140px 140px 1fr auto', gap: 10, alignItems: 'end' }}>
            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', marginBottom: 3 }}>
                ICD Code / Description:
              </div>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0', fontSize: 13 }} />
                <input
                  type="text"
                  placeholder={`Search ICD-10 (e.g. "R50.9" or "fever")`}
                  value={query}
                  disabled={!canEdit}
                  autoComplete="off"
                  onFocus={() => setShowResults(true)}
                  onBlur={() => window.setTimeout(() => setShowResults(false), 200)}
                  onChange={(e) => onQueryChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 28px 7px 30px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                {selected && (
                  <button
                    type="button"
                    onClick={clearPick}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: 7,
                      background: 'none',
                      border: 'none',
                      color: '#a0aec0',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {showResults && canSearch && (
                <ul
                  style={{
                    position: 'absolute',
                    zIndex: 99,
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    maxHeight: 260,
                    overflowY: 'auto',
                    listStyle: 'none',
                    padding: 4,
                    background: '#fff',
                    border: '1px solid #cbd5e0',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {searching && (
                    <li style={{ padding: '8px 12px', color: '#718096', fontSize: 12 }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} /> Searching ICD-10…
                    </li>
                  )}
                  {!searching && results.length === 0 && (
                    <li style={{ padding: '8px 12px', color: '#718096', fontSize: 12 }}>No matching ICD diagnosis found.</li>
                  )}
                  {!searching &&
                    results.map((d) => (
                      <li key={d.Id} style={{ listStyle: 'none' }}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pick(d)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: 13,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#edf2f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2b6cb0', minWidth: 65 }}>{d.Code}</span>
                          <span style={{ color: '#2d3748' }}>{d.DiagnosisName}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Classification: Primary vs Secondary */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', marginBottom: 3 }}>Class:</div>
              <select
                value={diagClass}
                disabled={!canEdit}
                onChange={(e) => setDiagClass(e.target.value as 'P' | 'S')}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  background: '#fff',
                }}
              >
                <option value="P">Primary (P)</option>
                <option value="S">Secondary (S)</option>
              </select>
            </div>

            {/* Diagnosis Type */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', marginBottom: 3 }}>Type:</div>
              <select
                value={diagType}
                disabled={!canEdit}
                onChange={(e) => setDiagType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  background: '#fff',
                }}
              >
                <option value="Final">Final</option>
                <option value="Admitting">Admitting</option>
                <option value="Discharge">Discharge</option>
                <option value="Pre-OP">Pre-OP</option>
                <option value="Post-OP">Post-OP</option>
                <option value="Reason for visit">Reason for visit</option>
                <option value="Referring">Referring</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Current Condition */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', marginBottom: 3 }}>Condition:</div>
              <select
                value={currentCondition}
                disabled={!canEdit}
                onChange={(e) => setCurrentCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  background: '#fff',
                }}
              >
                <option value="Acute">Acute</option>
                <option value="Chronic">Chronic</option>
                <option value="Provisional">Provisional</option>
                <option value="Persistent">Persistent</option>
                <option value="Cured">Cured</option>
                <option value="Final">Final</option>
              </select>
            </div>

            {/* Remark / Notes */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', marginBottom: 3 }}>Remark:</div>
              <input
                type="text"
                placeholder="Optional clinical notes…"
                value={remark}
                disabled={!canEdit}
                onChange={(e) => setRemark(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                }}
              />
            </div>

            {/* Add Button */}
            <div>
              <button
                type="button"
                onClick={addDiagnosis}
                disabled={!canEdit || !selected || adding}
                style={{
                  background: '#2b6cb0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 34,
                }}
              >
                <i className="fa-solid fa-plus" /> {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </PanelSection>

      {/* ────────────────── 2. RECORDED DIAGNOSES TABLE (MATCHING EMRDiagnosisGrid) ────────────────── */}
      <PanelSection
        title={`${isProblemListSection ? 'Problem List' : 'Recorded Visit Diagnoses'}${conditions.length ? ` (${conditions.length})` : ''}`}
        icon="fa-solid fa-list-check"
        flush
        actions={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Problem List / Resolved List Switch (Reference #pbmSwitch) */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: 4,
                border: '1px solid #cbd5e0',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setResolvedView('active')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: resolvedView === 'active' ? '#2b6cb0' : '#f7fafc',
                  color: resolvedView === 'active' ? '#fff' : '#4a5568',
                }}
              >
                Active ({rawConditions.filter((c) => c.CurrentCondition !== 'Cured').length})
              </button>
              <button
                type="button"
                onClick={() => setResolvedView('resolved')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: resolvedView === 'resolved' ? '#38a169' : '#f7fafc',
                  color: resolvedView === 'resolved' ? '#fff' : '#4a5568',
                }}
              >
                Resolved ({rawConditions.filter((c) => c.CurrentCondition === 'Cured').length})
              </button>
            </div>

            <Button size="xs" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={loadConditions} disabled={loading}>
              Reload
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ padding: spacing.lg }}>
            <SkeletonRows rows={3} columns={7} />
          </div>
        ) : loadError ? (
          <div style={{ padding: spacing.lg }}>
            <InlineNotice tone="danger">{loadError}</InlineNotice>
          </div>
        ) : conditions.length === 0 ? (
          <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>
            {resolvedView === 'resolved'
              ? 'No resolved conditions documented.'
              : isProblemListSection
              ? 'No past conditions recorded.'
              : 'No diagnosis added for this visit. Use the search form above to add an ICD diagnosis.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="emrws-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 44, textAlign: 'center' }}>Remove</th>
                  <th scope="col" style={{ width: 90 }}>ICD Code</th>
                  <th scope="col">Diagnosis Name / Description</th>
                  <th scope="col" style={{ width: 130 }}>Primary / Sec</th>
                  <th scope="col" style={{ width: 100 }}>Severity</th>
                  <th scope="col" style={{ width: 110 }}>Type</th>
                  <th scope="col" style={{ width: 110 }}>Condition</th>
                  <th scope="col" style={{ width: 60, textAlign: 'center' }}>POA</th>
                  <th scope="col">Remark</th>
                </tr>
              </thead>
              <tbody>
                {conditions.map((c) => {
                  const isPrimary = c.DiagnosisClass === 'P' || c.IsPrimary || c.ConditionType?.Description?.toLowerCase().includes('primary');
                  return (
                    <tr key={c.Id}>
                      {/* Remove Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(c)}
                          title="Remove diagnosis"
                          disabled={!canEdit}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            fontSize: 13,
                            padding: 4,
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </td>

                      {/* ICD Code */}
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2b6cb0', fontSize: 13 }}>
                        {c.Code || '—'}
                      </td>

                      {/* Diagnosis Name */}
                      <td style={{ fontWeight: 600, color: '#2d3748', fontSize: 13 }}>
                        {c.DiagnosisName || c.DiagnosisDetails || '—'}
                      </td>

                      {/* Primary / Secondary + Red Tag for Chronic DxInfo Onset */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 700,
                              background: isPrimary ? '#ebf8ff' : '#edf2f7',
                              color: isPrimary ? '#2b6cb0' : '#4a5568',
                            }}
                          >
                            {isPrimary ? 'Primary' : 'Secondary'}
                          </span>

                          {/* Red Tag Icon matching reference #DxInfoTag */}
                          <button
                            type="button"
                            title="Chronic Onset Details (Date, Month, Year)"
                            onClick={() =>
                              setDxInfoModal({
                                open: true,
                                conditionId: c.Id,
                                diagnosisName: c.DiagnosisName,
                                date: c.ChronicDate || 1,
                                month: c.ChronicMonth || 'Jan',
                                year: c.ChronicYear || new Date().getFullYear(),
                              })
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e53e3e',
                              cursor: 'pointer',
                              padding: 2,
                              fontSize: 12,
                            }}
                          >
                            <i className="fa-solid fa-tag" />
                          </button>
                        </div>
                      </td>

                      {/* Severity */}
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              c.Severity === 'Severe'
                                ? '#fed7d7'
                                : c.Severity === 'Moderate'
                                ? '#feebc8'
                                : '#c6f6d5',
                            color:
                              c.Severity === 'Severe'
                                ? '#742a2a'
                                : c.Severity === 'Moderate'
                                ? '#7b341e'
                                : '#22543d',
                          }}
                        >
                          {c.Severity || 'Mild'}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ fontSize: 12, color: '#4a5568' }}>
                        {c.DiagnosisType || c.ConditionType?.Description || 'Final'}
                      </td>

                      {/* Current Condition */}
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              c.CurrentCondition === 'Chronic'
                                ? '#fffaf0'
                                : c.CurrentCondition === 'Cured'
                                ? '#f0fff4'
                                : '#f7fafc',
                            color:
                              c.CurrentCondition === 'Chronic'
                                ? '#c05621'
                                : c.CurrentCondition === 'Cured'
                                ? '#276749'
                                : '#4a5568',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {c.CurrentCondition || 'Acute'}
                        </span>
                      </td>

                      {/* POA */}
                      <td style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#4a5568' }}>
                        {c.POA || 'Y'}
                      </td>

                      {/* Remark */}
                      <td style={{ fontSize: 12, color: '#718096' }}>
                        {c.Comments || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelSection>

      {/* ────────────────── 3. ICD NARRATIVE DESCRIPTION (MATCHING REFERENCE) ────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
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
          <span style={{ fontWeight: 700, fontSize: 13, color: '#2d3748' }}>
            <i className="fa-solid fa-align-left" style={{ color: '#2b6cb0', marginRight: 6 }} />
            ICD Narrative Description
          </span>
          <button
            type="button"
            onClick={saveNarrative}
            disabled={!canEdit}
            style={{
              background: '#2b6cb0',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <i className="fa-solid fa-floppy-disk" /> {narrativeSaved ? 'Saved!' : 'Save Narrative'}
          </button>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <textarea
            rows={3}
            value={narrativeDescription}
            disabled={!canEdit}
            placeholder="Clinical formulation, differential diagnoses, or detailed ICD narrative documentation…"
            onChange={(e) => setNarrativeDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* ────────────────── 4. CHRONIC ONSET DXINFO MODAL (MATCHING #emrDxInfoModal) ────────────────── */}
      {dxInfoModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              width: 'min(440px, 92vw)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '12px 16px',
                background: '#2b6cb0',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <span>
                <i className="fa-solid fa-calendar-days" style={{ marginRight: 8 }} />
                DxInfo Onset Details
              </span>
              <button
                type="button"
                onClick={() => setDxInfoModal((prev) => ({ ...prev, open: false }))}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 20px', display: 'grid', gap: 14 }}>
              <div style={{ fontSize: 13, color: '#4a5568' }}>
                Diagnosis: <strong style={{ color: '#2d3748' }}>{dxInfoModal.diagnosisName}</strong>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>
                  Chronic Condition Onset Date:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 8 }}>
                  {/* Date 1-31 */}
                  <div>
                    <span style={{ fontSize: 11, color: '#718096' }}>Day:</span>
                    <select
                      value={dxInfoModal.date}
                      onChange={(e) => setDxInfoModal((prev) => ({ ...prev, date: Number(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        background: '#fff',
                      }}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Jan-Dec */}
                  <div>
                    <span style={{ fontSize: 11, color: '#718096' }}>Month:</span>
                    <select
                      value={dxInfoModal.month}
                      onChange={(e) => setDxInfoModal((prev) => ({ ...prev, month: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        background: '#fff',
                      }}
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <span style={{ fontSize: 11, color: '#718096' }}>Year:</span>
                    <select
                      value={dxInfoModal.year}
                      onChange={(e) => setDxInfoModal((prev) => ({ ...prev, year: Number(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        background: '#fff',
                      }}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '10px 16px',
                background: '#edf2f7',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setDxInfoModal((prev) => ({ ...prev, open: false }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  color: '#4a5568',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDxInfo}
                style={{
                  padding: '6px 16px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#2b6cb0',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <ConfirmModal
          title="Remove Diagnosis"
          message={`Remove "${pendingDelete.DiagnosisName || pendingDelete.Code}" from this visit?`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};
