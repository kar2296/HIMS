/**
 * Discharge summary editor for one admission.
 *
 * Status flow = the classic form's (patientcertificates.CertificateStatusId):
 *   new / Draft (2)  -> Save draft | Complete (1) | Approve (3)
 *   Completed (1)    -> Approve (3)
 *   Approved (3)     -> Reverse to draft (2) | Release to patient (5)     (content locked)
 *   Released (5)     -> print only
 * Complete / Approve need the required sections.
 *
 * Summaries written in the classic form (free-form HTML, no data-dsw markers) are shown read-only
 * with a link to the classic form, so their formatting is never altered here.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { cleanLookup, errorText, formatDateTime } from '../emr-workspace/emrHelpers';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import { InlineNotice } from '../emr-workspace/EmrUi';
import type { LookupItem } from '../emr-workspace/types';
import {
  SECTIONS,
  CERT_STATUS,
  buildSummaryHtml,
  emptyDocument,
  isLocked,
  missingRequired,
  parseSummaryHtml,
  sanitizeForDisplay,
  type DischargeMedicine,
  type SectionKey,
  type SummaryDocument,
} from './dischargeDocument';
import {
  IP_ENCOUNTER_TYPE,
  admissionDiagnosisText,
  loadAdmission,
  loadCertificate,
  loadDischargeMedicines,
  newCertificateFor,
  personName,
  saveCertificate,
  type AdmissionRow,
  type CertificateRow,
} from './dischargeData';
import { SummaryHeader } from './SummaryHeader';
import { MedicinesTab } from './MedicinesTab';

type Tab = 'clinical' | 'medicines' | 'preview' | 'status';
type Action = 'draft' | 'complete' | 'approve' | 'reverse' | 'release';

const ACTION_TEXT: Record<Action, { title: string; message: string; yes: string; done: string; status: number }> = {
  draft: { title: 'Save draft', message: '', yes: 'Save', done: 'Draft saved.', status: CERT_STATUS.DRAFT },
  complete: { title: 'Complete summary', message: 'Mark this discharge summary as completed?', yes: 'Complete', done: 'Discharge summary completed.', status: CERT_STATUS.CREATED },
  approve: { title: 'Approve summary', message: 'Approve this discharge summary? It will be locked for editing.', yes: 'Approve', done: 'Discharge summary approved.', status: CERT_STATUS.APPROVED },
  reverse: { title: 'Reverse to draft', message: 'Move this approved summary back to draft so it can be edited?', yes: 'Reverse', done: 'Moved back to draft.', status: CERT_STATUS.DRAFT },
  release: { title: 'Release to patient', message: 'Release this discharge summary to the patient?', yes: 'Release', done: 'Released to patient.', status: CERT_STATUS.RELEASED },
};

interface Loaded {
  admission: AdmissionRow | null;
  certificate: CertificateRow | null;
  dischargeTypes: LookupItem[];
}

export interface DischargeEditorProps {
  encounterId: number;
  userId: number;
  facilityId: number;
  onBack?: () => void;
  /** Server-generated PDF download (existing print endpoints). */
  downloadFile?: (action: string, data: unknown) => void;
  navigateTo?: (state: string, params?: Record<string, unknown>) => void;
}

const auditName = (u?: { FirstName?: string; LastName?: string; Title?: { Description?: string } } | null) => personName(u) || '—';

export const DischargeEditor: React.FC<DischargeEditorProps> = ({ encounterId, userId, facilityId, onBack, downloadFile, navigateTo }) => {
  const [tab, setTab] = useState<Tab>('clinical');
  const [doc, setDoc] = useState<SummaryDocument>(emptyDocument);
  const [legacyHtml, setLegacyHtml] = useState<string | null>(null);
  const [dischargeTypeId, setDischargeTypeId] = useState<number>(1);
  const [dirty, setDirty] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const medsPrefilled = useRef(false);

  // ---- load admission + summary
  const fetcher = useCallback(async (): Promise<Loaded> => {
    const [admission, certificate, options] = await Promise.all([
      loadAdmission(encounterId),
      loadCertificate(encounterId),
      apiFetch('General/Options/getoptions', [{ Key: 'DischargeType' }]).catch(() => ({})),
    ]);
    return { admission, certificate, dischargeTypes: cleanLookup(options?.DischargeType) };
  }, [encounterId]);

  const onLoaded = useCallback((data: Loaded) => {
    const parsed = parseSummaryHtml(data.certificate?.DataTemplate);
    setDirty(false);
    setShowErrors(false);
    setDischargeTypeId(data.certificate?.DischargeTypeId || data.admission?.DischargeTypeId || 1);
    if (parsed.kind === 'legacy') {
      setLegacyHtml(parsed.html);
      setDoc(emptyDocument());
      medsPrefilled.current = true;
      return;
    }
    setLegacyHtml(null);
    if (parsed.kind === 'structured') {
      setDoc(parsed.doc);
      medsPrefilled.current = true;
      return;
    }
    // New summary: start from what the admission already records.
    const fresh = emptyDocument();
    if (data.admission) fresh.sections.admissionDiagnosis = admissionDiagnosisText(data.admission);
    setDoc(fresh);
    medsPrefilled.current = false;
  }, []);

  const { data, loading, error, reload } = useAsyncData<Loaded>(fetcher, { admission: null, certificate: null, dischargeTypes: [] }, {
    errorMessage: 'Could not load the admission.',
    onSuccess: onLoaded,
  });
  const { admission, certificate } = data;

  // ---- discharge prescriptions (independent: a failure here must not block the summary)
  const rxFetcher = useCallback(
    () => (admission ? loadDischargeMedicines(admission.PatientId, admission.Id) : Promise.resolve<DischargeMedicine[]>([])),
    [admission],
  );
  const rx = useAsyncData<DischargeMedicine[]>(rxFetcher, [], {
    errorMessage: 'Request failed.',
    // A new summary starts with the prescribed discharge medicines (once).
    onSuccess: (meds) => {
      if (medsPrefilled.current || !admission) return;
      medsPrefilled.current = true;
      if (meds.length > 0) setDoc((d) => (d.medicines.length ? d : { ...d, medicines: meds }));
    },
  });

  const statusId = certificate?.CertificateStatusId;
  const locked = isLocked(statusId);
  const isLegacy = legacyHtml !== null;
  const canEdit = !locked && !isLegacy;
  const missing = useMemo(() => missingRequired(doc.sections), [doc.sections]);
  const html = useMemo(() => buildSummaryHtml(doc), [doc]);
  const hasContent = SECTIONS.some((s) => doc.sections[s.key].trim()) || doc.medicines.some((m) => m.name.trim());

  const actions: Action[] = (() => {
    if (statusId === CERT_STATUS.APPROVED) return ['reverse', 'release'];
    if (statusId === CERT_STATUS.RELEASED || statusId === CERT_STATUS.CANCELLED) return [];
    if (isLegacy) return statusId === CERT_STATUS.CREATED || statusId === CERT_STATUS.DRAFT ? ['approve'] : [];
    if (statusId === CERT_STATUS.CREATED) return ['approve'];
    return ['draft', 'complete', 'approve'];
  })();

  const setSection = (key: SectionKey, value: string) => {
    setDoc((d) => ({ ...d, sections: { ...d.sections, [key]: value } }));
    setDirty(true);
  };
  const setMedicines = (medicines: DischargeMedicine[]) => {
    setDoc((d) => ({ ...d, medicines }));
    setDirty(true);
  };

  // ---- save
  const run = async (action: Action) => {
    if (!admission) return;
    const target = ACTION_TEXT[action].status;
    const now = new Date().toISOString();
    const row: CertificateRow = {
      ...(certificate || newCertificateFor(admission, facilityId)),
      DischargeTypeId: dischargeTypeId,
      CertificateStatusId: target,
    };
    // Legacy documents keep their stored HTML untouched; only the status changes.
    if (!isLegacy) row.DataTemplate = html;
    if (action === 'approve') {
      row.AprovedBy = userId;
      row.ApprovedOn = now;
    }
    if (action === 'release') {
      row.ReleasedBy = userId;
      row.ReleasedOn = now;
      row.ReleasedToPatient = 1;
    }
    setSaving(true);
    try {
      await saveCertificate(row);
      alert.showSuccessMsg(ACTION_TEXT[action].done);
      reload();
    } catch (err) {
      // apiFetch already shows the server message; keep the edits so nothing is lost.
      console.error('Discharge summary save failed', errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const request = (action: Action) => {
    if ((action === 'complete' || action === 'approve') && !isLegacy && missing.length > 0) {
      setShowErrors(true);
      setTab('clinical');
      alert.showErrorMsg(`Please fill: ${missing.join(', ')}.`);
      return;
    }
    if (action === 'draft' && !hasContent) {
      alert.showErrorMsg('Nothing to save yet.');
      return;
    }
    if (action === 'draft') {
      void run('draft');
      return;
    }
    setPending(action);
  };

  const back = () => {
    if (dirty && canEdit) setConfirmLeave(true);
    else onBack?.();
  };

  const print = (withHeader: boolean) =>
    downloadFile?.(
      withHeader ? 'DischargeSummary/patientcertificate/PrintPatientCertificate' : 'DischargeSummary/patientcertificate/PrintPatientCertificatewithoutheader',
      { Id: encounterId },
    );

  if (loading && !admission) {
    return (
      <div className="dsw-stack">
        <div className="dsw-card">Loading discharge summary…</div>
      </div>
    );
  }
  if (error || !admission) {
    return (
      <div className="dsw-stack">
        <InlineNotice tone="danger">{error || 'Admission not found.'}</InlineNotice>
        <div className="dsw-actions">
          {onBack && <Button variant="outline-secondary" onClick={onBack}>Back to list</Button>}
          <Button variant="primary" onClick={reload}>Try again</Button>
        </div>
      </div>
    );
  }

  if (admission.EncounterTypeId && admission.EncounterTypeId !== IP_ENCOUNTER_TYPE) {
    return (
      <div className="dsw-stack">
        <InlineNotice tone="warning">
          Discharge summaries are written for in-patient admissions. This visit ({admission.VisitIdentifier || admission.Id}) is not an admission.
        </InlineNotice>
        {onBack && (
          <div>
            <Button variant="outline-secondary" onClick={onBack}>Back to list</Button>
          </div>
        )}
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'clinical', label: 'Clinical summary', icon: 'fa-solid fa-notes-medical' },
    ...(isLegacy ? [] : [{ key: 'medicines' as Tab, label: 'Medicines', icon: 'fa-solid fa-pills', count: doc.medicines.length }]),
    ...(isLegacy ? [] : [{ key: 'preview' as Tab, label: 'Preview', icon: 'fa-solid fa-eye' }]),
    { key: 'status', label: 'Status & history', icon: 'fa-solid fa-clock-rotate-left' },
  ];

  return (
    <div className="dsw-stack">
      <div className="dsw-card dsw-titlebar">
        <h1 className="dsw-title">
          {onBack && <Button variant="icon" size="sm" icon="fa-solid fa-arrow-left" title="Back to list" aria-label="Back to list" onClick={back} />}
          Discharge Summary
        </h1>
        <div className="dsw-actions">
          {certificate?.Id && (
            <>
              <Button variant="outline-secondary" size="sm" icon="fa-solid fa-print" onClick={() => print(true)} disabled={dirty}>
                Print
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => print(false)} disabled={dirty} className="dsw-hide-sm">
                Print (no header)
              </Button>
            </>
          )}
          {actions.includes('draft') && (
            <Button variant="outline-primary" size="sm" icon="fa-solid fa-floppy-disk" onClick={() => request('draft')} loading={saving}>
              Save draft
            </Button>
          )}
          {actions.includes('complete') && (
            <Button variant="primary" size="sm" icon="fa-solid fa-check" onClick={() => request('complete')} disabled={saving}>
              Complete
            </Button>
          )}
          {actions.includes('approve') && (
            <Button variant="success" size="sm" icon="fa-solid fa-signature" onClick={() => request('approve')} disabled={saving}>
              Approve
            </Button>
          )}
          {actions.includes('reverse') && (
            <Button variant="outline-secondary" size="sm" icon="fa-solid fa-rotate-left" onClick={() => request('reverse')} disabled={saving}>
              Reverse to draft
            </Button>
          )}
          {actions.includes('release') && (
            <Button variant="primary" size="sm" icon="fa-solid fa-share" onClick={() => request('release')} disabled={saving}>
              Release to patient
            </Button>
          )}
        </div>
      </div>

      <SummaryHeader admission={admission} statusId={statusId} />

      {dirty && certificate?.Id && <InlineNotice tone="info">You have unsaved changes. Save before printing.</InlineNotice>}
      {locked && <InlineNotice tone="info">This summary is {statusId === CERT_STATUS.APPROVED ? 'approved' : 'closed'} and can no longer be edited.</InlineNotice>}

      <div className="dsw-card" style={{ display: 'grid', gap: 16 }}>
        <div className="dsw-tabs" role="tablist" aria-label="Discharge summary sections">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" id={`dsw-tab-${t.key}`} aria-selected={tab === t.key} aria-controls={`dsw-panel-${t.key}`} className="dsw-tab" onClick={() => setTab(t.key)}>
              <i className={t.icon} aria-hidden="true" />
              {t.label}
              {t.count !== undefined && <span className="dsw-count">{t.count}</span>}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`dsw-panel-${tab}`} aria-labelledby={`dsw-tab-${tab}`}>
          {tab === 'clinical' && isLegacy && (
            <div style={{ display: 'grid', gap: 12 }}>
              <InlineNotice tone="info">
                This summary was written in the classic discharge summary form. It is shown here as it will print; edit it in the classic form so its formatting is kept.
              </InlineNotice>
              {navigateTo && certificate?.Id && !locked && (
                <div>
                  <Button variant="outline-primary" size="sm" icon="fa-solid fa-pen-to-square" onClick={() => navigateTo('app.dischargesummary-form', { id: certificate.Id, pid: admission.PatientId })}>
                    Edit in classic form
                  </Button>
                </div>
              )}
              <div className="dsw-preview" dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(legacyHtml || '') }} />
            </div>
          )}

          {tab === 'clinical' && !isLegacy && (
            <div className="dsw-form">
              {SECTIONS.map((s) => {
                const invalid = showErrors && s.required && !doc.sections[s.key].trim();
                return (
                  <React.Fragment key={s.key}>
                    <div className={`dsw-field${s.wide ? ' dsw-field--wide' : ''}`}>
                      <label className="dsw-label" htmlFor={`dsw-${s.key}`}>
                        {s.title}
                        {s.required && <span className="dsw-required" aria-hidden="true">*</span>}
                      </label>
                      <textarea
                        id={`dsw-${s.key}`}
                        className="dsw-textarea"
                        rows={s.rows}
                        value={doc.sections[s.key]}
                        placeholder={s.placeholder}
                        disabled={!canEdit}
                        required={s.required}
                        aria-invalid={invalid || undefined}
                        aria-describedby={invalid ? `dsw-${s.key}-err` : undefined}
                        onChange={(e) => setSection(s.key, e.target.value)}
                      />
                      {invalid && <span id={`dsw-${s.key}-err`} className="dsw-error">Required to complete or approve.</span>}
                    </div>
                    {/* The summary type sits beside the final diagnosis. */}
                    {s.key === 'finalDiagnosis' && (
                      <div className="dsw-field">
                        <label className="dsw-label" htmlFor="dsw-type">Summary type</label>
                        <select
                          id="dsw-type"
                          className="dsw-select"
                          value={dischargeTypeId}
                          disabled={!canEdit}
                          onChange={(e) => {
                            setDischargeTypeId(Number(e.target.value));
                            setDirty(true);
                          }}
                        >
                          {(data.dischargeTypes.length ? data.dischargeTypes : [{ Id: 1, Text: 'Discharge Summary' }]).map((o) => (
                            <option key={o.Id} value={o.Id}>{o.Text}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {tab === 'medicines' && !isLegacy && (
            <MedicinesTab
              medicines={doc.medicines}
              onChange={setMedicines}
              prescribed={rx.data}
              prescribedLoading={rx.loading}
              prescribedError={rx.error}
              readOnly={!canEdit}
            />
          )}

          {tab === 'preview' && !isLegacy && (
            hasContent ? <div className="dsw-preview" dangerouslySetInnerHTML={{ __html: html }} /> : <div className="dsw-hint">Nothing written yet.</div>
          )}

          {tab === 'status' && (
            <div className="dsw-audit">
              <AuditItem label="Created" who={auditName(certificate?.CreatedUser)} when={certificate?.CreatedAt} />
              <AuditItem label="Last updated" who={auditName(certificate?.UpdatedByUser)} when={certificate?.UpdatedAt} />
              <AuditItem label="Approved" who={auditName(certificate?.AprovedUser)} when={certificate?.ApprovedOn} />
              <AuditItem label="Released to patient" who={certificate?.ReleasedOn ? 'Yes' : '—'} when={certificate?.ReleasedOn} />
              {!certificate && <div className="dsw-hint">Not saved yet.</div>}
            </div>
          )}
        </div>
      </div>

      {pending && (
        <ConfirmModal
          isOpen
          title={ACTION_TEXT[pending].title}
          message={ACTION_TEXT[pending].message}
          yesLabel={ACTION_TEXT[pending].yes}
          noLabel="Cancel"
          variant={pending === 'reverse' ? 'warning' : 'primary'}
          onConfirm={() => {
            const a = pending;
            setPending(null);
            void run(a);
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {confirmLeave && (
        <ConfirmModal
          isOpen
          title="Unsaved changes"
          message="Leave without saving your changes?"
          yesLabel="Leave"
          noLabel="Stay"
          variant="warning"
          onConfirm={() => {
            setConfirmLeave(false);
            onBack?.();
          }}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
};

const AuditItem: React.FC<{ label: string; who: string; when?: string | null }> = ({ label, who, when }) => (
  <div className="dsw-card" style={{ padding: 12 }}>
    <div className="dsw-meta-label">{label}</div>
    <div className="dsw-meta-value">{who}</div>
    <div className="dsw-hint">{when ? formatDateTime(when) : ''}</div>
  </div>
);
