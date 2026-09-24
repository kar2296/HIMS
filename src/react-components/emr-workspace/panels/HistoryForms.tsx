/**
 * React add/edit forms for the EMR Workspace history lists (replace the legacy AngularJS modals):
 *
 *   PastMedicalFormModal   emr/patientcondition        (ICD, type, since, status, comments)
 *   SurgicalFormModal      emr/patientsurgical         (procedure, type, date, performed by, status, notes)
 *   FamilyConditionFormModal emr/familycondition       (ICD, relationship, type, since, status, comments)
 *   SocialHistoryFormModal / FamilySocialHistoryFormModal
 *                          emr/patientsocialhistory | emr/familysocialhistory
 *                          (habit, [relationship], frequency, severity, reviewed on, status, comments)
 *
 * Lists come from the same getoptions keys the legacy forms used; ICD and procedure use the master search
 * endpoints (clinicalmaster/diagnosis/GetDiagnosiss, clinicalmaster/procedure/GetProcedures, Key 3 = text).
 * Required fields match the legacy forms.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Textarea } from '../../../components/ui/Input';
import { DatePicker } from '../../../components/ui/DatePicker';
import { SearchSelect } from '../../../components/ui/Select';
import type { EmrWorkspaceContext, LookupItem } from '../types';
import { cleanLookup } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { SearchPicker } from '../SearchPicker';
import type { RecordFormProps } from '../RecordListSection';
import { ChoiceButtons, FieldError, FieldLabel, FormRow, HistoryFormShell, PickedCard } from './historyFormKit';
import { saveHistoryRecord, today } from './historyFormUtils';

type Rec = Record<string, any>;
type Lookups = Record<string, LookupItem[]>;
type LookupKey = string | { Key: string; Request?: unknown };

/**
 * Loads the getoptions lists and the record (or `newRecord()` for a new one).
 * `lookupKeys` and `newRecord` must be stable (module constants or memoized).
 */
function useHistoryForm(entity: string, lookupKeys: LookupKey[], recordId: number, context: EmrWorkspaceContext, newRecord: () => Rec) {
  const lookupFetcher = useCallback(async (): Promise<Lookups> => {
    const res = await apiFetch('General/Options/getoptions', lookupKeys.map((k) => (typeof k === 'string' ? { Key: k } : k)));
    const out: Lookups = {};
    lookupKeys.forEach((k) => {
      const key = typeof k === 'string' ? k : k.Key;
      out[key] = cleanLookup(res?.[key]);
    });
    return out;
  }, [lookupKeys]);
  const lookups = useAsyncData<Lookups>(lookupFetcher, {}, { errorMessage: 'Could not load the lists.' });

  const [form, setForm] = useState<Rec>({});
  const recordFetcher = useCallback(async (): Promise<Rec | null> => {
    if (!recordId) return newRecord();
    return (await apiFetch(`emr/${entity.toLowerCase()}/Get${entity}ById`, { Id: recordId, PatientId: context.patientId })) || null;
  }, [entity, recordId, context.patientId, newRecord]);
  const record = useAsyncData<Rec | null>(recordFetcher, null, { errorMessage: 'Could not load the record.', onSuccess: (r) => setForm(r || {}) });

  const set = (patch: Rec) => setForm((f) => ({ ...f, ...patch }));
  return { lookups: lookups.data, form, set, loading: lookups.loading || record.loading, error: lookups.error || record.error };
}

/* ------------------------------------------------------------------ ICD field */

interface IcdItem {
  Id: number;
  Code?: string;
  DiagnosisName?: string;
  Description?: string;
  DiagnosisVersion?: { Description?: string };
}

const IcdField: React.FC<{ form: Rec; set: (p: Rec) => void; required?: boolean; showError: boolean; id: string }> = ({ form, set, required, showError, id }) => {
  const has = Boolean(form.DiagnosisId || (form.DiagnosisName || '').trim());
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <FieldLabel required={required}>Diagnosis (ICD)</FieldLabel>
      {has ? (
        <PickedCard
          code={form.Code}
          name={form.DiagnosisName || form.Description}
          changeLabel="Change diagnosis"
          onChange={() => set({ DiagnosisId: null, Code: '', DiagnosisName: '', Description: '' })}
        />
      ) : (
        <SearchPicker<IcdItem>
          id={id}
          placeholder="Search ICD code or name (e.g. E11, diabetes, hypertension)"
          action="clinicalmaster/diagnosis/GetDiagnosiss"
          buildRequest={(text) => ({ Params: [{ Key: 3, Value: text }], PageContext: { PageSize: 25, PageNumber: 1 } })}
          codeOf={(d) => d.Code}
          labelOf={(d) => [d.DiagnosisName, d.DiagnosisVersion?.Description ? `(${d.DiagnosisVersion.Description})` : ''].filter(Boolean).join(' ')}
          keyOf={(d) => d.Id}
          onPick={(d) => set({ DiagnosisId: d.Id, Code: d.Code, DiagnosisName: d.DiagnosisName, Description: d.Description || d.DiagnosisName })}
        />
      )}
      <FieldError show={showError && !has}>Search and choose the diagnosis</FieldError>
    </div>
  );
};

/* ------------------------------------------------------------------ Past medical */

const CONDITION_COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'ConditionTypeId', 'DiagnosisId', 'Code', 'DiagnosisName',
  'OtherDiagnosis', 'Description', 'ConditionDate', 'ConditionStatusId', 'Comments', 'PerformedDate', 'PerformedBy',
  'IsPatientCondition', 'BodySite', 'SideId', 'DiagnosisDetails', 'IsSNOMED',
];

const PAST_MEDICAL_KEYS: LookupKey[] = ['ConditionType', 'ConditionStatus'];
const newPastMedical = (): Rec => ({ ConditionDate: today(), ConditionStatusId: 1, IsPatientCondition: 1 });

export const PastMedicalFormModal: React.FC<RecordFormProps> = ({ recordId, context, onClose, onSaved }) => {
  const f = useHistoryForm('PatientCondition', PAST_MEDICAL_KEYS, recordId, context, newPastMedical);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, set } = f;
  const missing = !(form.DiagnosisId || (form.DiagnosisName || '').trim()) || !form.ConditionTypeId || !form.ConditionDate;

  const save = async () => {
    if (missing) return setShowErrors(true);
    setSaving(true);
    const ok = await saveHistoryRecord({
      entity: 'PatientCondition',
      columns: CONDITION_COLUMNS,
      record: { ...form, IsPatientCondition: form.IsPatientCondition ?? 1 },
      context,
      successText: form.Id ? 'Condition updated' : 'Condition recorded',
    });
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <HistoryFormShell title={recordId ? 'Edit condition' : 'Add past medical condition'} saveLabel="Save condition" loading={f.loading} saving={saving} error={f.error} onClose={onClose} onSave={save}>
      <IcdField id="pm-icd" form={form} set={set} required showError={showErrors} />
      <ChoiceButtons label="Type" required options={f.lookups.ConditionType || []} value={form.ConditionTypeId} onChange={(id) => set({ ConditionTypeId: id })} error={showErrors && !form.ConditionTypeId ? 'Choose the diagnosis type' : undefined} />
      <FormRow>
        <DatePicker label="Since" required fullWidth value={form.ConditionDate || ''} max={today()} error={showErrors && !form.ConditionDate ? 'Enter the date' : undefined} onChange={(v) => set({ ConditionDate: v })} />
        <ChoiceButtons label="Status" options={f.lookups.ConditionStatus || []} value={form.ConditionStatusId} onChange={(id) => set({ ConditionStatusId: id })} />
      </FormRow>
      <Textarea label="Comments" rows={3} value={form.Comments || ''} onChange={(e) => set({ Comments: e.target.value })} />
    </HistoryFormShell>
  );
};

/* ------------------------------------------------------------------ Surgical */

interface ProcedureItem {
  Id: number;
  Code?: string;
  ProcedureName?: string;
}

const SURGICAL_COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'ProcedureId', 'Code', 'ProcedureName', 'Description',
  'ProcedureTypeId', 'Comments', 'PatientSurgicalStatusId', 'PerformedDate', 'PerformedBy',
];

const newSurgical = (): Rec => ({ PatientSurgicalStatusId: 1, PerformedDate: today() });

export const SurgicalFormModal: React.FC<RecordFormProps> = ({ recordId, context, onClose, onSaved }) => {
  const facilityId = context.facilityId || 1;
  const keys = useMemo<LookupKey[]>(
    () => ['ProcedureType', 'PatientSurgicalStatus', { Key: 'Doctor', Request: { Params: [{ Key: 2, Value: [-1, facilityId] }] } }],
    [facilityId],
  );
  const f = useHistoryForm('PatientSurgical', keys, recordId, context, newSurgical);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, set } = f;
  const hasProcedure = Boolean(form.ProcedureId || (form.ProcedureName || '').trim());
  const doctors = f.lookups.Doctor || [];
  const missing = !hasProcedure || !form.ProcedureTypeId || !form.PerformedDate || !form.PerformedBy;

  const save = async () => {
    if (missing) return setShowErrors(true);
    setSaving(true);
    // PerformedBy / PerformedDate are the surgeon and surgery date here, so they are not auto-stamped.
    const ok = await saveHistoryRecord({
      entity: 'PatientSurgical',
      columns: SURGICAL_COLUMNS,
      record: form,
      context,
      successText: form.Id ? 'Surgery updated' : 'Surgery recorded',
      stampPerformed: false,
    });
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <HistoryFormShell title={recordId ? 'Edit surgery' : 'Add past surgery'} saveLabel="Save surgery" loading={f.loading} saving={saving} error={f.error} onClose={onClose} onSave={save}>
      <div style={{ display: 'grid', gap: 6 }}>
        <FieldLabel required>Procedure</FieldLabel>
        {hasProcedure ? (
          <PickedCard code={form.Code} name={form.ProcedureName || form.Procedure?.ProcedureName} changeLabel="Change procedure" onChange={() => set({ ProcedureId: null, Code: '', ProcedureName: '' })} />
        ) : (
          <SearchPicker<ProcedureItem>
            id="surg-procedure"
            placeholder="Search procedure name or code (e.g. appendicectomy)"
            action="clinicalmaster/procedure/GetProcedures"
            buildRequest={(text) => ({ Params: [{ Key: 3, Value: text }], PageContext: { PageSize: 25, PageNumber: 1 } })}
            codeOf={(p) => p.Code}
            labelOf={(p) => p.ProcedureName || ''}
            keyOf={(p) => p.Id}
            onPick={(p) => set({ ProcedureId: p.Id, Code: p.Code, ProcedureName: p.ProcedureName })}
          />
        )}
        <FieldError show={showErrors && !hasProcedure}>Search and choose the procedure</FieldError>
      </div>
      <ChoiceButtons label="Type" required options={f.lookups.ProcedureType || []} value={form.ProcedureTypeId} onChange={(id) => set({ ProcedureTypeId: id })} error={showErrors && !form.ProcedureTypeId ? 'Choose elective or emergency' : undefined} />
      <FormRow>
        <DatePicker label="Date of surgery" required fullWidth value={form.PerformedDate || ''} max={today()} error={showErrors && !form.PerformedDate ? 'Enter the date' : undefined} onChange={(v) => set({ PerformedDate: v })} />
        <SearchSelect
          label="Performed by"
          required
          placeholder="Search doctor"
          options={doctors.map((d) => ({ value: d.Id, label: d.Text }))}
          value={form.PerformedBy ?? ''}
          onChange={(v) => set({ PerformedBy: Number(v) })}
          error={showErrors && !form.PerformedBy ? 'Choose the doctor' : undefined}
        />
      </FormRow>
      <ChoiceButtons label="Status" options={f.lookups.PatientSurgicalStatus || []} value={form.PatientSurgicalStatusId} onChange={(id) => set({ PatientSurgicalStatusId: id })} />
      <Textarea label="Notes" rows={3} placeholder="Hospital, complications, other details" value={form.Description || ''} onChange={(e) => set({ Description: e.target.value })} />
    </HistoryFormShell>
  );
};

/* ------------------------------------------------------------------ Family condition */

const FAMILY_CONDITION_COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'ConditionTypeId', 'DiagnosisId', 'Code', 'DiagnosisName',
  'Description', 'RelationshipId', 'ConditionDate', 'ConditionStatusId', 'Comments', 'PerformedDate', 'PerformedBy',
];

const FAMILY_CONDITION_KEYS: LookupKey[] = ['ConditionType', 'ConditionStatus', 'Relationship'];
const newFamilyCondition = (): Rec => ({ ConditionDate: today(), ConditionStatusId: 1 });

export const FamilyConditionFormModal: React.FC<RecordFormProps> = ({ recordId, context, onClose, onSaved }) => {
  const f = useHistoryForm('FamilyCondition', FAMILY_CONDITION_KEYS, recordId, context, newFamilyCondition);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, set } = f;
  const hasDiagnosis = Boolean(form.DiagnosisId || (form.DiagnosisName || '').trim());
  const missing = !hasDiagnosis || !form.RelationshipId || !form.ConditionTypeId;

  const save = async () => {
    if (missing) return setShowErrors(true);
    setSaving(true);
    const ok = await saveHistoryRecord({
      entity: 'FamilyCondition',
      columns: FAMILY_CONDITION_COLUMNS,
      record: form,
      context,
      successText: form.Id ? 'Family history updated' : 'Family history recorded',
    });
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <HistoryFormShell title={recordId ? 'Edit family history' : 'Add family history'} saveLabel="Save family history" loading={f.loading} saving={saving} error={f.error} onClose={onClose} onSave={save}>
      <IcdField id="fam-icd" form={form} set={set} required showError={showErrors} />
      <ChoiceButtons label="Relationship" required options={f.lookups.Relationship || []} value={form.RelationshipId} onChange={(id) => set({ RelationshipId: id })} error={showErrors && !form.RelationshipId ? 'Choose the relative' : undefined} />
      <ChoiceButtons label="Type" required options={f.lookups.ConditionType || []} value={form.ConditionTypeId} onChange={(id) => set({ ConditionTypeId: id })} error={showErrors && !form.ConditionTypeId ? 'Choose the diagnosis type' : undefined} />
      <FormRow>
        <DatePicker label="Since" fullWidth value={form.ConditionDate || ''} max={today()} onChange={(v) => set({ ConditionDate: v })} />
        <ChoiceButtons label="Status" options={f.lookups.ConditionStatus || []} value={form.ConditionStatusId} onChange={(id) => set({ ConditionStatusId: id })} />
      </FormRow>
      <Textarea label="Comments" rows={3} value={form.Comments || ''} onChange={(e) => set({ Comments: e.target.value })} />
    </HistoryFormShell>
  );
};

/* ------------------------------------------------------------------ Social history (patient / family) */

const SOCIAL_COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'RelationshipId', 'SocialTypeId', 'SocialFrequencyId', 'SeverityId',
  'ReviewDate', 'Comments', 'SocialHistoryStatusId', 'PerformedDate', 'PerformedBy',
];

const SOCIAL_KEYS: LookupKey[] = ['SocialType', 'SocialFrequency', 'Severity', 'SocialHistoryStatus'];
const FAMILY_SOCIAL_KEYS: LookupKey[] = [...SOCIAL_KEYS, 'Relationship'];
const newSocial = (): Rec => ({ SocialHistoryStatusId: 1, ReviewDate: today() });

const SocialForm: React.FC<RecordFormProps & { family: boolean }> = ({ recordId, context, onClose, onSaved, family }) => {
  const entity = family ? 'FamilySocialHistory' : 'PatientSocialHistory';
  const f = useHistoryForm(entity, family ? FAMILY_SOCIAL_KEYS : SOCIAL_KEYS, recordId, context, newSocial);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, set } = f;
  const missing = !form.SocialTypeId || !form.SocialFrequencyId || (family && !form.RelationshipId);
  const noun = family ? 'Family social history' : 'Social history';

  const save = async () => {
    if (missing) return setShowErrors(true);
    setSaving(true);
    const ok = await saveHistoryRecord({
      entity,
      columns: family ? SOCIAL_COLUMNS : SOCIAL_COLUMNS.filter((c) => c !== 'RelationshipId'),
      record: form,
      context,
      successText: `${noun} ${form.Id ? 'updated' : 'recorded'}`,
    });
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <HistoryFormShell title={`${recordId ? 'Edit' : 'Add'} ${noun.toLowerCase()}`} saveLabel="Save" loading={f.loading} saving={saving} error={f.error} onClose={onClose} onSave={save}>
      {family && (
        <ChoiceButtons label="Relationship" required options={f.lookups.Relationship || []} value={form.RelationshipId} onChange={(id) => set({ RelationshipId: id })} error={showErrors && !form.RelationshipId ? 'Choose the relative' : undefined} />
      )}
      <ChoiceButtons label="Habit" required options={f.lookups.SocialType || []} value={form.SocialTypeId} onChange={(id) => set({ SocialTypeId: id })} error={showErrors && !form.SocialTypeId ? 'Choose the habit' : undefined} />
      <ChoiceButtons label="Frequency" required options={f.lookups.SocialFrequency || []} value={form.SocialFrequencyId} onChange={(id) => set({ SocialFrequencyId: id })} error={showErrors && !form.SocialFrequencyId ? 'Choose how often' : undefined} />
      <ChoiceButtons label="Severity" options={f.lookups.Severity || []} value={form.SeverityId} onChange={(id) => set({ SeverityId: id })} />
      <FormRow>
        <DatePicker label="Reviewed on" fullWidth value={form.ReviewDate || ''} max={today()} onChange={(v) => set({ ReviewDate: v })} />
        <ChoiceButtons label="Status" options={f.lookups.SocialHistoryStatus || []} value={form.SocialHistoryStatusId} onChange={(id) => set({ SocialHistoryStatusId: id })} />
      </FormRow>
      <Textarea label="Comments" rows={3} placeholder="Quantity, duration, quit date…" value={form.Comments || ''} onChange={(e) => set({ Comments: e.target.value })} />
    </HistoryFormShell>
  );
};

export const SocialHistoryFormModal: React.FC<RecordFormProps> = (p) => <SocialForm {...p} family={false} />;
export const FamilySocialHistoryFormModal: React.FC<RecordFormProps> = (p) => <SocialForm {...p} family />;
