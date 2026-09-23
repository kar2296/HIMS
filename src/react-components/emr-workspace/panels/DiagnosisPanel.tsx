/**
 * DIAGNOSIS panel -- ICD search, add as primary/secondary, list and remove.
 *
 * Same endpoints and payload as the legacy patientdiagnosis-currentlistlist.js:
 *   search : clinicalmaster/diagnosis/GetDiagnosiss        (Key 3 = search text, ≥ 3 chars)
 *   list   : emr/patientcondition/GetPatientConditions      (Key 2 = PatientId, 5 = EncounterId, 7 = IsPatientCondition)
 *   add    : emr/patientcondition/ManagePatientConditions   { Data: [condition] }
 *   delete : emr/patientcondition/DeletePatientCondition    { Id }
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { ConfirmModal } from '../../ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, radii, shadows, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { cleanLookup, formatDate, toSelectOptions } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from '../EmrUi';

interface DiagnosisMaster {
  Id: number;
  Code: string;
  DiagnosisName: string;
  Description?: string;
  CategoryId?: number;
  TypeId?: number;
  GradeId?: number;
  SideId?: number;
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
  Status?: number;
}

const MIN_QUERY = 3;

/**
 * The same panel serves two EMR panel types:
 *  - emr.cn.diagnosis : this visit's diagnoses (IsPatientCondition = 0, filtered by encounter)
 *  - emr.cn.condition : the patient's past medical conditions / problem list (IsPatientCondition = 1, all visits)
 */
export const DiagnosisPanel: React.FC<EmrPanelProps> = ({ context, canEdit, section, onDataChanged }) => {
  const isProblemList = section?.SRef === 'emr.cn.condition';
  const panelKey = isProblemList ? 'conditions' : 'diagnosis';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DiagnosisMaster[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<DiagnosisMaster | null>(null);
  const [conditionTypeId, setConditionTypeId] = useState<number | ''>('');
  const [remark, setRemark] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PatientCondition | null>(null);

  const searchSeq = useRef(0);

  const conditionsFetcher = useCallback(async (): Promise<PatientCondition[]> => {
    if (!isProblemList && !context.encounterId) return [];
    const params: { Key: number; Value: any }[] = [
      { Key: 2, Value: context.patientId },
      { Key: 7, Value: isProblemList ? 1 : 0 },
    ];
    if (!isProblemList) params.push({ Key: 5, Value: context.encounterId });
    const res = await apiFetch('emr/patientcondition/GetPatientConditions', {
      Params: params,
      PageContext: { PageSize: 100, PageNumber: 1 },
    });
    return (res?.Data || []).filter((c: PatientCondition) => c.Status === undefined || c.Status === 1);
  }, [context.patientId, context.encounterId, isProblemList]);
  const { data: conditions, loading, error: loadError, reload: loadConditions } = useAsyncData<PatientCondition[]>(conditionsFetcher, [], {
    errorMessage: 'Could not load diagnoses.',
  });

  const typesFetcher = useCallback(async () => cleanLookup((await apiFetch('General/Options/getoptions', [{ Key: 'ConditionType' }]))?.ConditionType), []);
  const { data: conditionTypes } = useAsyncData<LookupItem[]>(typesFetcher, [], {
    onSuccess: (list) => {
      if (list.length) setConditionTypeId((current) => (current === '' ? list[0].Id : current));
    },
  });

  const queryText = query.trim();
  const canSearch = !selected && queryText.length >= MIN_QUERY;

  // Debounced ICD search; a sequence number drops out-of-order responses.
  useEffect(() => {
    if (!canSearch) return;
    const seq = ++searchSeq.current;
    const timer = window.setTimeout(() => {
      apiFetch('clinicalmaster/diagnosis/GetDiagnosiss', {
        Params: [{ Key: 3, Value: queryText }],
        PageContext: { PageSize: 25, PageNumber: 1 },
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
    }, 350);
    return () => window.clearTimeout(timer);
  }, [canSearch, queryText]);

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

  const addDiagnosis = async () => {
    if (!selected) {
      alert.showErrorMsg('Search and select a diagnosis first.');
      return;
    }
    if (conditions.some((c) => c.DiagnosisId === selected.Id)) {
      alert.showErrorMsg(isProblemList ? 'This condition is already on the problem list.' : 'This diagnosis is already added for this visit.');
      return;
    }
    const condition = {
      PatientId: context.patientId,
      EncounterId: context.encounterId,
      ConsultationId: context.consultationId ?? undefined,
      DiagnosisId: selected.Id,
      DiagnosisName: selected.DiagnosisName,
      Code: selected.Code,
      Description: selected.DiagnosisName,
      DiagnosisDetails: selected.DiagnosisName,
      ConditionTypeId: conditionTypeId === '' ? undefined : conditionTypeId,
      ConditionDate: new Date(),
      ConditionStatusId: 1,
      IsPatientCondition: isProblemList ? 1 : 0,
      CategoryId: selected.CategoryId || 0,
      TypeId: selected.TypeId || 0,
      GradeId: selected.GradeId || 0,
      SideId: selected.SideId || 0,
      Comments: remark.trim() || undefined,
      PerformedBy: context.userId,
      PerformedDate: new Date(),
    };
    setAdding(true);
    try {
      await apiFetch('emr/patientcondition/ManagePatientConditions', { Data: [condition] });
      alert.showSuccessMsg('Diagnosis added');
      clearPick();
      loadConditions();
      onDataChanged?.(panelKey);
    } catch {
      /* server error already toasted */
    } finally {
      setAdding(false);
    }
  };

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
      /* server error already toasted */
    }
  };

  const typeLabel = (c: PatientCondition) =>
    c.ConditionType?.Description || conditionTypes.find((t) => t.Id === c.ConditionTypeId)?.Text || '—';

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>

      <PanelSection title={isProblemList ? 'Add Past Condition (ICD)' : 'Add Diagnosis (ICD)'} icon="fa-solid fa-stethoscope" allowOverflow>
        <div className="emrws-diagnosis-form">
          <div style={{ position: 'relative' }}>
            <Input
              label="ICD code or description"
              leftIcon="fa-solid fa-magnifying-glass"
              placeholder={`Type at least ${MIN_QUERY} characters, e.g. “otitis” or “H66”`}
              value={query}
              disabled={!canEdit}
              autoComplete="off"
              role="combobox"
              aria-expanded={showResults && results.length > 0}
              aria-controls="emrws-icd-results"
              onFocus={() => setShowResults(true)}
              onBlur={() => window.setTimeout(() => setShowResults(false), 150)}
              onChange={(e) => onQueryChange(e.target.value)}
            />
            {selected && (
              <button type="button" onClick={clearPick} aria-label="Clear selected diagnosis" className="emrws-clear-btn">
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            )}
            {showResults && canSearch && (
              <ul
                id="emrws-icd-results"
                role="listbox"
                style={{
                  position: 'absolute',
                  zIndex: 20,
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  maxHeight: 280,
                  overflowY: 'auto',
                  listStyle: 'none',
                  padding: 4,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  boxShadow: shadows.lg,
                }}
              >
                {searching && <li style={{ padding: spacing.sm, color: colors.textSubtle, ...typography.body }}>Searching…</li>}
                {!searching && results.length === 0 && <li style={{ padding: spacing.sm, color: colors.textSubtle, ...typography.body }}>No matching diagnosis</li>}
                {!searching &&
                  results.map((d) => (
                    <li key={d.Id} role="option" aria-selected={false}>
                      <button type="button" className="emrws-option" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(d)}>
                        <span style={{ fontFamily: typography.fontFamilyMono, fontWeight: 600, color: colors.primary, minWidth: 70 }}>{d.Code}</span>
                        <span>{d.DiagnosisName}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <Select
            label="Primary / Secondary"
            options={toSelectOptions(conditionTypes)}
            value={conditionTypeId}
            placeholder="Select"
            disabled={!canEdit}
            onChange={(v) => setConditionTypeId(Number(v))}
          />
          <Input label="Remark" value={remark} placeholder="Optional" disabled={!canEdit} onChange={(e) => setRemark(e.target.value)} />
          <div style={{ alignSelf: 'end' }}>
            <Button variant="primary" icon="fa-solid fa-plus" onClick={addDiagnosis} loading={adding} loadingText="Adding…" disabled={!canEdit || !selected}>
              Add
            </Button>
          </div>
        </div>
      </PanelSection>

      <PanelSection
        title={`${isProblemList ? 'Problem List' : 'Visit Diagnoses'}${conditions.length ? ` (${conditions.length})` : ''}`}
        icon="fa-solid fa-list-check"
        flush
        actions={
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={loadConditions} disabled={loading}>
            Reload
          </Button>
        }
      >
        {loading ? (
          <div style={{ padding: spacing.lg }}>
            <SkeletonRows rows={3} columns={5} />
          </div>
        ) : loadError ? (
          <div style={{ padding: spacing.lg }}>
            <InlineNotice tone="danger">{loadError}</InlineNotice>
          </div>
        ) : (
          <SimpleTable headers={['ICD code', 'Diagnosis', 'Type', 'Status', 'Date', 'Remark', '']} empty={conditions.length === 0} emptyText={isProblemList ? 'No past conditions recorded' : 'No diagnosis added for this visit'}>
            {conditions.map((c) => (
              <tr key={c.Id}>
                <td style={{ fontFamily: typography.fontFamilyMono, fontWeight: 600, color: colors.primary }}>{c.Code || '—'}</td>
                <td>{c.DiagnosisName || c.DiagnosisDetails || '—'}</td>
                <td>{typeLabel(c)}</td>
                <td>{c.ConditionStatus?.Description || 'Active'}</td>
                <td>{formatDate(c.ConditionDate)}</td>
                <td>{c.Comments || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <Button size="xs" variant="icon" icon="fa-solid fa-trash" title="Remove diagnosis" aria-label={`Remove ${c.DiagnosisName || 'diagnosis'}`} disabled={!canEdit} onClick={() => setPendingDelete(c)} />
                </td>
              </tr>
            ))}
          </SimpleTable>
        )}
      </PanelSection>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Remove diagnosis"
        message={`Remove ${pendingDelete?.Code ? `${pendingDelete.Code} – ` : ''}${pendingDelete?.DiagnosisName || 'this diagnosis'} from this visit?`}
        yesLabel="Remove"
        noLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
