/**
 * CC / HPI panel -- chief complaint and structured History of Present Illness.
 *
 * Uses the same record as the legacy symptom-notes screen (symptomnotes.js):
 *   read  : emr/PatientClinicalNotes/GetPatientClinicalNotess  (Key 1 = PatientId, 2 = EncounterId, 3 = ConsultationId)
 *   write : emr/PatientClinicalNotes/AddPatientClinicalNotes | UpdatePatientClinicalNotes  { Data: note }
 * The HPI elements (Location, Quality, Severity, Duration/Timing, Context, Modifying factors…)
 * map 1:1 onto existing PatientClinicalNotes columns -- no schema change.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { SkeletonRows } from '../../../components/ui/Loading';
import { spacing } from '../../../components/ui/tokens';
import type { EmrPanelProps, LookupItem } from '../types';
import { formatDateTime, toSelectOptions } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection } from '../EmrUi';

interface ClinicalNote {
  Id?: number;
  PatientId?: number;
  EncounterId?: number;
  ConsultationId?: number | null;
  ChiefComplaints?: string;
  IllnessTypeId?: number | null;
  DurationCount?: number | null;
  IllnessDurationTypeId?: number | null;
  Location?: string;
  Quality?: string;
  Severity?: string;
  Duration?: string;
  Timing?: string;
  Context?: string;
  ModifyingFactors?: string;
  OtherComplaints?: string;
  AdditionalNotes?: string;
  Examinations?: string;
  TreatmentComments?: string;
  UpdatedAt?: string;
  CreatedAt?: string;
  NoteStatus?: number;
  [key: string]: any;
}

interface Lookups {
  IllnessType: LookupItem[];
  IllnessDurationType: LookupItem[];
}

/** HPI elements shown as a two-column grid (the reference screen's Location/Quality/Severity… list). */
const HPI_FIELDS: { key: keyof ClinicalNote; label: string; placeholder: string }[] = [
  { key: 'Location', label: 'Location', placeholder: 'Where is the problem? e.g. right lower abdomen' },
  { key: 'Quality', label: 'Quality', placeholder: 'e.g. sharp, dull, burning, throbbing' },
  { key: 'Severity', label: 'Severity', placeholder: 'e.g. 6/10, interferes with sleep' },
  { key: 'Timing', label: 'Onset / Timing', placeholder: 'e.g. sudden onset, worse at night' },
  { key: 'Duration', label: 'Duration (details)', placeholder: 'e.g. intermittent episodes of 10 minutes' },
  { key: 'Context', label: 'Context', placeholder: 'What was the patient doing when it started?' },
  { key: 'ModifyingFactors', label: 'Modifying factors', placeholder: 'What makes it better or worse?' },
  { key: 'OtherComplaints', label: 'Associated symptoms', placeholder: 'e.g. nausea, fever, dizziness' },
];

const EMPTY_NOTE: ClinicalNote = { ChiefComplaints: '', DurationCount: null, IllnessDurationTypeId: 1, IllnessTypeId: null };

interface CcData {
  lookups: Lookups;
  note: ClinicalNote;
}

export const ChiefComplaintPanel: React.FC<EmrPanelProps> = ({ context, canEdit: canEditVisit, registerSaveHandler, onDataChanged }) => {
  const [note, setNote] = useState<ClinicalNote>(EMPTY_NOTE);
  /** A signed clinical note is locked (the backend rejects updates) -- changes go through Addendum. */
  const signed = (note.NoteStatus || 0) >= 2;
  const canEdit = canEditVisit && !signed;
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  const fetcher = useCallback(async (): Promise<CcData> => {
    const params: { Key: number; Value: any }[] = [
      { Key: 1, Value: context.patientId },
      { Key: 2, Value: context.encounterId },
    ];
    if (context.consultationId) params.push({ Key: 3, Value: context.consultationId });
    // Lookups and the saved note are independent reads.
    const [lookupRes, noteRes] = await Promise.all([
      apiFetch('General/Options/getoptions', [{ Key: 'IllnessType' }, { Key: 'IllnessDurationType' }]),
      context.encounterId ? apiFetch('emr/PatientClinicalNotes/GetPatientClinicalNotess', { Params: params }) : Promise.resolve({ Data: [] }),
    ]);
    return {
      lookups: { IllnessType: lookupRes?.IllnessType || [], IllnessDurationType: lookupRes?.IllnessDurationType || [] },
      note: noteRes?.Data?.[0] ? { ...EMPTY_NOTE, ...noteRes.Data[0] } : EMPTY_NOTE,
    };
  }, [context.patientId, context.encounterId, context.consultationId]);

  const query = useAsyncData<CcData>(fetcher, { lookups: { IllnessType: [], IllnessDurationType: [] }, note: EMPTY_NOTE }, {
    errorMessage: 'Could not load the clinical note.',
    onSuccess: (data) => {
      setNote(data.note);
      setFieldErrors({});
    },
  });
  const { loading, error: loadError, reload } = query;
  const lookups = query.data.lookups;

  const setField = (key: keyof ClinicalNote, value: any) => {
    setNote((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) setFieldErrors((prev) => ({ ...prev, [key as string]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!note.ChiefComplaints?.trim()) errs.ChiefComplaints = 'Chief complaint is required.';
    if (!note.IllnessTypeId || note.IllnessTypeId === -1) errs.IllnessTypeId = 'Select the illness type.';
    if (note.DurationCount === null || note.DurationCount === undefined || Number(note.DurationCount) <= 0) errs.DurationCount = 'Enter how long (e.g. 3).';
    if (!note.IllnessDurationTypeId || note.IllnessDurationTypeId === -1) errs.IllnessDurationTypeId = 'Select days / weeks…';
    return errs;
  };

  const save = useCallback(async (): Promise<boolean> => {
    if (!canEdit) {
      alert.showErrorMsg('Open a visit before recording the complaint.');
      return false;
    }
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      alert.showErrorMsg('Please complete the required fields.');
      return false;
    }
    const payload: ClinicalNote = {
      ...note,
      ChiefComplaints: note.ChiefComplaints?.trim(),
      DurationCount: Number(note.DurationCount),
      PatientId: context.patientId,
      EncounterId: context.encounterId,
      ConsultationId: context.consultationId ?? note.ConsultationId ?? null,
    };
    const action = note.Id ? 'emr/PatientClinicalNotes/UpdatePatientClinicalNotes' : 'emr/PatientClinicalNotes/AddPatientClinicalNotes';
    setSaving(true);
    try {
      await apiFetch(action, { Data: payload });
      alert.showSuccessMsg('Chief complaint & HPI saved');
      reload();
      onDataChanged?.('cc-hpi');
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, note, context, reload, onDataChanged]);

  useEffect(() => {
    registerSaveHandler?.(save);
    return () => registerSaveHandler?.(null);
  }, [registerSaveHandler, save]);

  if (loading) {
    return (
      <PanelSection title="Chief Complaint" icon="fa-solid fa-comment-medical">
        <SkeletonRows rows={5} columns={2} />
      </PanelSection>
    );
  }

  if (loadError) {
    return (
      <InlineNotice tone="danger">
        {loadError}{' '}
        <Button size="xs" variant="link" onClick={reload}>
          Try again
        </Button>
      </InlineNotice>
    );
  }

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      {signed && <InlineNotice tone="info">This clinical note is signed and locked. Use the Addendum panel to add late changes.</InlineNotice>}
      <PanelSection
        title="Chief Complaint"
        icon="fa-solid fa-comment-medical"
        actions={
          <>
            {note.Id && <span style={{ fontSize: 12, color: '#64748b' }}>Last saved {formatDateTime(note.UpdatedAt || note.CreatedAt)}</span>}
            <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={!canEdit}>
              Save
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: spacing.md }}>
          <Textarea
            label="Chief complaint"
            required
            rows={2}
            value={note.ChiefComplaints || ''}
            disabled={!canEdit}
            error={fieldErrors.ChiefComplaints || undefined}
            placeholder="In the patient's words, e.g. “Pain in the right ear for 3 days”"
            onChange={(e) => setField('ChiefComplaints', e.target.value)}
          />
          <div className="emrws-grid-3">
            <Select
              label="Illness type"
              required
              options={toSelectOptions(lookups.IllnessType)}
              value={note.IllnessTypeId ?? ''}
              placeholder="Select"
              disabled={!canEdit}
              error={fieldErrors.IllnessTypeId || undefined}
              onChange={(v) => setField('IllnessTypeId', Number(v))}
            />
            <Input
              label="Since"
              required
              type="number"
              min={1}
              value={note.DurationCount ?? ''}
              disabled={!canEdit}
              error={fieldErrors.DurationCount || undefined}
              onChange={(e) => setField('DurationCount', e.target.value === '' ? null : Number(e.target.value))}
            />
            <Select
              label="Period"
              required
              options={toSelectOptions(lookups.IllnessDurationType)}
              value={note.IllnessDurationTypeId ?? ''}
              placeholder="Select"
              disabled={!canEdit}
              error={fieldErrors.IllnessDurationTypeId || undefined}
              onChange={(v) => setField('IllnessDurationTypeId', Number(v))}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="History of Present Illness" icon="fa-solid fa-notes-medical">
        <div className="emrws-grid-2">
          {HPI_FIELDS.map((f) => (
            <Input
              key={f.key as string}
              label={f.label}
              value={(note[f.key] as string) || ''}
              placeholder={f.placeholder}
              disabled={!canEdit}
              onChange={(e) => setField(f.key, e.target.value)}
            />
          ))}
        </div>
        <div style={{ display: 'grid', gap: spacing.md, marginTop: spacing.md }}>
          <Textarea label="Previous treatment" rows={2} value={note.TreatmentComments || ''} disabled={!canEdit} placeholder="Medicines or treatment already tried and the response" onChange={(e) => setField('TreatmentComments', e.target.value)} />
          <Textarea label="CC & HPI notes" rows={4} value={note.AdditionalNotes || ''} disabled={!canEdit} placeholder="Narrative history, relevant negatives…" onChange={(e) => setField('AdditionalNotes', e.target.value)} />
        </div>
      </PanelSection>
    </div>
  );
};
