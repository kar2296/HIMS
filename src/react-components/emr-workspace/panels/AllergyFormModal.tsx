/**
 * Add / edit a patient allergy inside the EMR Workspace (replaces the legacy "Manage Allergies" modal).
 *
 *   lookups : General/Options/getoptions  Allergy (allergymasters), AllergyType, AllergySeverity, PatientAllergyStatus
 *   load    : emr/patientallergy/GetPatientAllergyById  { Id, PatientId }
 *   save    : emr/patientallergy/AddPatientAllergy | UpdatePatientAllergy  { Data }
 *
 * The allergen can be picked from the allergy master (fills its type) or typed freely -- patientallergies
 * stores AllergyName and AllergyId is optional, so recording works even while the master is empty.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Modal } from '../../../components/ui/Modal';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrWorkspaceContext, LookupItem } from '../types';
import { cleanLookup, toSelectOptions } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice } from '../EmrUi';

interface MasterAllergy extends LookupItem {
  AllergyName?: string;
  AllergyTypeId?: number;
  Description?: string;
}

interface Lookups {
  allergies: MasterAllergy[];
  types: LookupItem[];
  severities: LookupItem[];
  statuses: LookupItem[];
}

interface AllergyRecord {
  Id?: number;
  Rev?: number;
  AllergyId?: number | null;
  AllergyName?: string;
  AllergyTypeId?: number | null;
  Description?: string;
  Symptom?: string;
  AllergySeverityId?: number | null;
  StartDate?: string;
  Comments?: string;
  PatientAllergyStatusId?: number | null;
  [key: string]: unknown;
}

/** Plain patientallergies columns sent back on save (never nested includes). */
const COLUMNS = [
  'Id', 'Rev', 'EncounterId', 'ConsultationId', 'PatientId', 'AllergyId', 'AllergyName', 'AllergyTypeId', 'Description',
  'Symptom', 'ADRStatus', 'ADRScoreId', 'StartDate', 'EndDate', 'AllergySeverityId', 'AllergySource', 'Comments',
  'PatientAllergyStatusId', 'PerformedDate', 'PerformedBy',
];

const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface Props {
  isOpen: boolean;
  /** 0 = new allergy. */
  allergyId: number;
  context: EmrWorkspaceContext;
  onClose: () => void;
  onSaved: () => void;
}

export const AllergyFormModal: React.FC<Props> = ({ isOpen, allergyId, context, onClose, onSaved }) => {
  const lookupFetcher = useCallback(async (): Promise<Lookups> => {
    if (!isOpen) return { allergies: [], types: [], severities: [], statuses: [] };
    const res = await apiFetch('General/Options/getoptions', [
      { Key: 'Allergy' },
      { Key: 'AllergyType' },
      { Key: 'AllergySeverity' },
      { Key: 'PatientAllergyStatus' },
    ]);
    return {
      allergies: cleanLookup(res?.Allergy) as MasterAllergy[],
      types: cleanLookup(res?.AllergyType),
      severities: cleanLookup(res?.AllergySeverity),
      statuses: cleanLookup(res?.PatientAllergyStatus),
    };
  }, [isOpen]);
  const lookups = useAsyncData<Lookups>(lookupFetcher, { allergies: [], types: [], severities: [], statuses: [] }, {
    errorMessage: 'Could not load allergy lists.',
  });

  const [form, setForm] = useState<AllergyRecord>({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const nameRef = useRef<HTMLInputElement>(null);

  const recordFetcher = useCallback(async (): Promise<AllergyRecord | null> => {
    if (!isOpen) return null;
    if (!allergyId) return { StartDate: today(), PatientAllergyStatusId: 1 };
    return (await apiFetch('emr/patientallergy/GetPatientAllergyById', { Id: allergyId, PatientId: context.patientId })) || null;
  }, [isOpen, allergyId, context.patientId]);
  const record = useAsyncData<AllergyRecord | null>(recordFetcher, null, {
    errorMessage: 'Could not load the allergy.',
    onSuccess: (r) => {
      setForm(r || {});
      setShowErrors(false);
    },
  });

  // Focus the allergen field once the form is ready.
  useEffect(() => {
    if (isOpen && !record.loading) nameRef.current?.focus();
  }, [isOpen, record.loading]);

  const set = (patch: Partial<AllergyRecord>) => setForm((f) => ({ ...f, ...patch }));

  const query = (form.AllergyName || '').trim().toLowerCase();
  const suggestions = useMemo(
    () =>
      query
        ? lookups.data.allergies.filter((a) => (a.Text || a.AllergyName || '').toLowerCase().includes(query)).slice(0, 8)
        : [],
    [lookups.data.allergies, query],
  );

  const pick = (a: MasterAllergy) => {
    set({ AllergyId: a.Id, AllergyName: a.AllergyName || a.Text, AllergyTypeId: a.AllergyTypeId || form.AllergyTypeId, Description: a.Description });
    setSuggestOpen(false);
    setActiveIndex(-1);
  };

  const onNameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setSuggestOpen(false);
    }
  };

  const nameMissing = !(form.AllergyName || '').trim();
  const typeMissing = !form.AllergyTypeId;

  const save = async () => {
    if (nameMissing || typeMissing) {
      setShowErrors(true);
      return;
    }
    const data: Record<string, unknown> = {};
    const merged: AllergyRecord = {
      ...form,
      AllergyName: (form.AllergyName || '').trim(),
      PatientId: context.patientId,
      EncounterId: (form.EncounterId as number) || context.encounterId || undefined,
      ConsultationId: (form.ConsultationId as number) || context.consultationId || undefined,
      PerformedBy: context.userId || undefined,
      PerformedDate: new Date().toISOString(),
    };
    COLUMNS.forEach((k) => {
      if (merged[k] !== undefined) data[k] = merged[k];
    });
    setSaving(true);
    try {
      if (form.Id) await apiFetch('emr/patientallergy/UpdatePatientAllergy', { Data: data });
      else await apiFetch('emr/patientallergy/AddPatientAllergy', { Data: data });
      alert.showSuccessMsg(form.Id ? 'Allergy updated' : 'Allergy recorded');
      onSaved();
    } catch {
      /* server error already shown by apiFetch; keep the form open */
    } finally {
      setSaving(false);
    }
  };

  const loading = lookups.loading || record.loading;
  const masterEmpty = !lookups.loading && lookups.data.allergies.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      title={allergyId ? 'Edit allergy' : 'Add allergy'}
      onClose={onClose}
      width="640px"
      portal
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button variant="outline-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={loading}>
            Save allergy
          </Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg, ...typography.body, color: colors.textMuted }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gap: spacing.lg }}>
          {(lookups.error || record.error) && <InlineNotice tone="danger">{lookups.error || record.error}</InlineNotice>}

          {/* Allergen: master search or free text */}
          <div style={{ position: 'relative' }}>
            <Input
              ref={nameRef}
              label="Allergen"
              required
              fullWidth
              placeholder={masterEmpty ? 'e.g. Penicillin, Peanuts, Latex' : 'Search the allergy list or type a name'}
              value={form.AllergyName || ''}
              autoComplete="off"
              role="combobox"
              aria-expanded={suggestOpen && suggestions.length > 0}
              aria-controls="allergy-suggestions"
              aria-activedescendant={activeIndex >= 0 ? `allergy-opt-${activeIndex}` : undefined}
              error={showErrors && nameMissing ? 'Enter the allergen' : undefined}
              helperText={
                form.AllergyId
                  ? 'From the allergy list'
                  : masterEmpty
                    ? 'The allergy master is empty, so the name is saved as typed. Add common allergens in the Allergies master (#/app/allergies).'
                    : 'Not in the allergy list — it will be saved as typed'
              }
              onChange={(e) => {
                set({ AllergyName: e.target.value, AllergyId: null });
                setSuggestOpen(true);
                setActiveIndex(-1);
              }}
              onKeyDown={onNameKey}
              onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
            />
            {suggestOpen && suggestions.length > 0 && (
              <ul
                id="allergy-suggestions"
                role="listbox"
                style={{
                  position: 'absolute', zIndex: 5, left: 0, right: 0, top: '100%', margin: '4px 0 0', padding: 4, listStyle: 'none',
                  background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.md, boxShadow: '0 8px 20px rgba(15,23,42,.12)',
                  maxHeight: 240, overflowY: 'auto',
                }}
              >
                {suggestions.map((a, i) => (
                  <li
                    key={a.Id}
                    id={`allergy-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(a);
                    }}
                    style={{
                      padding: '8px 10px', borderRadius: radii.sm, cursor: 'pointer', ...typography.body,
                      background: i === activeIndex ? colors.primaryLight : 'transparent',
                    }}
                  >
                    {a.Text || a.AllergyName}
                    {a.AllergyTypeId && (
                      <span style={{ ...typography.caption, color: colors.textSubtle, marginLeft: 8 }}>
                        {lookups.data.types.find((t) => t.Id === a.AllergyTypeId)?.Text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Type as buttons: faster than a dropdown and always visible */}
          <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <legend style={{ ...typography.label, color: colors.textBody, marginBottom: 6 }}>
              Type <span style={{ color: colors.danger }} aria-hidden="true">*</span>
            </legend>
            {lookups.data.types.length === 0 ? (
              <InlineNotice tone="warning">No allergy types are set up (reference list "AllergyType").</InlineNotice>
            ) : (
              <div role="radiogroup" aria-label="Allergy type" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lookups.data.types.map((t) => {
                  const on = form.AllergyTypeId === t.Id;
                  return (
                    <button
                      key={t.Id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set({ AllergyTypeId: t.Id })}
                      style={{
                        padding: '6px 14px', borderRadius: radii.full, cursor: 'pointer', font: `600 13px/1.3 ${typography.fontFamily}`,
                        border: `1px solid ${on ? colors.primary : colors.borderStrong}`,
                        background: on ? colors.primary : colors.surface, color: on ? '#fff' : colors.textBody,
                      }}
                    >
                      {t.Text}
                    </button>
                  );
                })}
              </div>
            )}
            {showErrors && typeMissing && lookups.data.types.length > 0 && (
              <div style={{ ...typography.caption, color: colors.dangerText, marginTop: 6 }}>Choose the allergy type</div>
            )}
          </fieldset>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
            <Input
              label="Reaction"
              fullWidth
              placeholder="e.g. Rash, swelling, anaphylaxis"
              value={form.Symptom || ''}
              onChange={(e) => set({ Symptom: e.target.value })}
            />
            {lookups.data.severities.length > 0 && (
              <Select
                label="Severity"
                fullWidth
                placeholder="Select severity"
                options={toSelectOptions(lookups.data.severities)}
                value={form.AllergySeverityId ?? ''}
                onChange={(v) => set({ AllergySeverityId: v === '' ? null : Number(v) })}
              />
            )}
            <DatePicker label="Since" fullWidth value={form.StartDate || ''} max={today()} onChange={(v) => set({ StartDate: v })} />
            {lookups.data.statuses.length > 0 && (
              <Select
                label="Status"
                fullWidth
                options={toSelectOptions(lookups.data.statuses)}
                value={form.PatientAllergyStatusId ?? ''}
                onChange={(v) => set({ PatientAllergyStatusId: v === '' ? null : Number(v) })}
              />
            )}
          </div>

          <Textarea label="Comments" rows={3} value={form.Comments || ''} onChange={(e) => set({ Comments: e.target.value })} />
        </div>
      )}
    </Modal>
  );
};
