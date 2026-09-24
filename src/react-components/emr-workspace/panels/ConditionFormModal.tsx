/**
 * Add / edit a past-medical-history condition inside the EMR Workspace
 * (replaces the legacy "Add Diagnosis" modal patientemr.patientcondition).
 *
 *   lookups : General/Options/getoptions  ConditionType (Final / Interim / Provisional),
 *             ConditionStatus (Active / Inactive / Recurrent / Resolved)
 *   search  : clinicalmaster/diagnosis/GetDiagnosiss  (Key 3 = text, >= 3 chars)
 *   load    : emr/patientcondition/GetPatientConditionById  { Id, PatientId }
 *   save    : emr/patientcondition/AddPatientCondition | UpdatePatientCondition  { Data }
 */
import React, { useCallback, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Modal } from '../../../components/ui/Modal';
import { Textarea } from '../../../components/ui/Input';
import { DatePicker } from '../../../components/ui/DatePicker';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { LookupItem } from '../types';
import { cleanLookup } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice } from '../EmrUi';
import { SearchPicker } from '../SearchPicker';
import type { RecordFormProps } from '../RecordListSection';

interface IcdItem {
  Id: number;
  Code?: string;
  DiagnosisName?: string;
  Description?: string;
  DiagnosisVersion?: { Description?: string };
}

interface ConditionRecord {
  Id?: number;
  Rev?: number;
  ConditionTypeId?: number | null;
  DiagnosisId?: number | null;
  Code?: string;
  DiagnosisName?: string;
  Description?: string;
  ConditionDate?: string;
  ConditionStatusId?: number | null;
  Comments?: string;
  [key: string]: unknown;
}

/** Plain patientconditions columns sent back on save (never nested includes). */
const COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'ConditionTypeId', 'DiagnosisId', 'Code', 'DiagnosisName',
  'OtherDiagnosis', 'Description', 'ConditionDate', 'ConditionStatusId', 'Comments', 'PerformedDate', 'PerformedBy',
  'IsPatientCondition', 'BodySite', 'SideId', 'DiagnosisDetails', 'IsSNOMED',
];

const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Single-choice button group (clearer than a dropdown for 3-5 options). */
const ChoiceButtons: React.FC<{
  label: string;
  required?: boolean;
  options: LookupItem[];
  value?: number | null;
  onChange: (id: number) => void;
  error?: string;
}> = ({ label, required, options, value, onChange, error }) => (
  <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
    <legend style={{ ...typography.label, color: colors.textBody, marginBottom: 6 }}>
      {label} {required && <span style={{ color: colors.danger }} aria-hidden="true">*</span>}
    </legend>
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = value === o.Id;
        return (
          <button
            key={o.Id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.Id)}
            style={{
              padding: '6px 14px', borderRadius: radii.full, cursor: 'pointer', font: `600 13px/1.3 ${typography.fontFamily}`,
              border: `1px solid ${on ? colors.primary : colors.borderStrong}`,
              background: on ? colors.primary : colors.surface, color: on ? '#fff' : colors.textBody,
            }}
          >
            {o.Text}
          </button>
        );
      })}
    </div>
    {error && <div style={{ ...typography.caption, color: colors.dangerText, marginTop: 6 }}>{error}</div>}
  </fieldset>
);

export const ConditionFormModal: React.FC<RecordFormProps> = ({ recordId, context, onClose, onSaved }) => {
  const lookupFetcher = useCallback(async () => {
    const res = await apiFetch('General/Options/getoptions', [{ Key: 'ConditionType' }, { Key: 'ConditionStatus' }]);
    return { types: cleanLookup(res?.ConditionType), statuses: cleanLookup(res?.ConditionStatus) };
  }, []);
  const lookups = useAsyncData(lookupFetcher, { types: [] as LookupItem[], statuses: [] as LookupItem[] }, {
    errorMessage: 'Could not load the condition lists.',
  });

  const [form, setForm] = useState<ConditionRecord>({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const recordFetcher = useCallback(async (): Promise<ConditionRecord | null> => {
    if (!recordId) return { ConditionDate: today(), ConditionStatusId: 1, IsPatientCondition: 1 };
    return (await apiFetch('emr/patientcondition/GetPatientConditionById', { Id: recordId, PatientId: context.patientId })) || null;
  }, [recordId, context.patientId]);
  const record = useAsyncData<ConditionRecord | null>(recordFetcher, null, {
    errorMessage: 'Could not load the condition.',
    onSuccess: (r) => {
      setForm(r || {});
      setShowErrors(false);
    },
  });

  const set = (patch: Partial<ConditionRecord>) => setForm((f) => ({ ...f, ...patch }));

  const pickIcd = (d: IcdItem) =>
    set({ DiagnosisId: d.Id, Code: d.Code, DiagnosisName: d.DiagnosisName, Description: d.Description || d.DiagnosisName });

  const diagnosisMissing = !form.DiagnosisId && !(form.DiagnosisName || '').trim();
  const typeMissing = !form.ConditionTypeId;
  const dateMissing = !form.ConditionDate;

  const save = async () => {
    if (diagnosisMissing || typeMissing || dateMissing) {
      setShowErrors(true);
      return;
    }
    const merged: ConditionRecord = {
      ...form,
      PatientId: context.patientId,
      EncounterId: (form.EncounterId as number) || context.encounterId || undefined,
      ConsultationId: (form.ConsultationId as number) || context.consultationId || undefined,
      IsPatientCondition: form.IsPatientCondition ?? 1,
      PerformedBy: context.userId || undefined,
      PerformedDate: new Date().toISOString(),
    };
    const data: Record<string, unknown> = {};
    COLUMNS.forEach((k) => {
      if (merged[k] !== undefined) data[k] = merged[k];
    });
    setSaving(true);
    try {
      if (form.Id) await apiFetch('emr/patientcondition/UpdatePatientCondition', { Data: data });
      else await apiFetch('emr/patientcondition/AddPatientCondition', { Data: data });
      alert.showSuccessMsg(form.Id ? 'Condition updated' : 'Condition recorded');
      onSaved();
    } catch {
      /* server error already shown by apiFetch; keep the form open */
    } finally {
      setSaving(false);
    }
  };

  const loading = lookups.loading || record.loading;
  const hasDiagnosis = Boolean(form.DiagnosisId || (form.DiagnosisName || '').trim());

  return (
    <Modal
      isOpen
      portal
      title={recordId ? 'Edit condition' : 'Add past medical condition'}
      onClose={onClose}
      width="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button variant="outline-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={loading}>
            Save condition
          </Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg, ...typography.body, color: colors.textMuted }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gap: spacing.lg }}>
          {(lookups.error || record.error) && <InlineNotice tone="danger">{lookups.error || record.error}</InlineNotice>}

          {/* Diagnosis: ICD search, shown as a card once chosen */}
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...typography.label, color: colors.textBody }}>
              Diagnosis (ICD) <span style={{ color: colors.danger }} aria-hidden="true">*</span>
            </span>
            {hasDiagnosis ? (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.md, padding: '10px 12px',
                  border: `1px solid ${colors.primaryMid}`, background: colors.primaryLight, borderRadius: radii.md,
                }}
              >
                {form.Code && (
                  <span style={{ fontFamily: typography.fontFamilyMono, fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap' }}>{form.Code}</span>
                )}
                <span style={{ ...typography.body, fontWeight: 600, color: colors.textMain, flex: 1, minWidth: 0 }}>{form.DiagnosisName || form.Description}</span>
                <Button
                  size="xs"
                  variant="link"
                  onClick={() => set({ DiagnosisId: null, Code: '', DiagnosisName: '', Description: '' })}
                  aria-label="Change diagnosis"
                >
                  Change
                </Button>
              </div>
            ) : (
              <SearchPicker<IcdItem>
                id="condition-icd"
                placeholder="Search ICD code or name (e.g. E11, diabetes, hypertension)"
                action="clinicalmaster/diagnosis/GetDiagnosiss"
                buildRequest={(text) => ({ Params: [{ Key: 3, Value: text }], PageContext: { PageSize: 25, PageNumber: 1 } })}
                codeOf={(d) => d.Code}
                labelOf={(d) => [d.DiagnosisName, d.DiagnosisVersion?.Description ? `(${d.DiagnosisVersion.Description})` : ''].filter(Boolean).join(' ')}
                keyOf={(d) => d.Id}
                onPick={pickIcd}
              />
            )}
            {showErrors && diagnosisMissing && <div style={{ ...typography.caption, color: colors.dangerText }}>Search and choose the diagnosis</div>}
          </div>

          <ChoiceButtons
            label="Type"
            required
            options={lookups.data.types}
            value={form.ConditionTypeId}
            onChange={(id) => set({ ConditionTypeId: id })}
            error={showErrors && typeMissing ? 'Choose the diagnosis type' : undefined}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md, alignItems: 'start' }}>
            <DatePicker
              label="Since"
              required
              fullWidth
              value={form.ConditionDate || ''}
              max={today()}
              error={showErrors && dateMissing ? 'Enter the date' : undefined}
              onChange={(v) => set({ ConditionDate: v })}
            />
            <ChoiceButtons label="Status" options={lookups.data.statuses} value={form.ConditionStatusId} onChange={(id) => set({ ConditionStatusId: id })} />
          </div>

          <Textarea label="Comments" rows={3} value={form.Comments || ''} onChange={(e) => set({ Comments: e.target.value })} />
        </div>
      )}
    </Modal>
  );
};
