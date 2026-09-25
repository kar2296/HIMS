/**
 * Visit-entry level panels:
 *
 *   SUMMARY        (emr.cn.reviewnotes)  live summary of this visit entry + server print (emr/consultation/PrintConsultation)
 *                                        + the existing review-notes screen (modal patientemr.reviewnotes)
 *   PREVIOUS VISITS(emr.cn.previousnotes) emr/consultation/GetConsultations (Key 3 = PatientId, Key 14 = exclude current)
 *   RESULTS        (emr.cn.labresults / emr.cn.radiologyresults) the existing result viewers
 *   ADDENDUM       (emr.ws.addendum)     sign / amend clinical notes (emr/PatientClinicalNotes/Sign… / Amend…)
 *   UNSUPPORTED    any other legacy panel type -- opens the classic consultation screen for that entry
 */
import React, { useCallback, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { Textarea, Input } from '../../../components/ui/Input';
import { SkeletonRows } from '../../../components/ui/Loading';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import { colors, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from '../EmrUi';

type Row = Record<string, any>;
const person = (u?: { FirstName?: string; LastName?: string } | null) => (u ? [u.FirstName, u.LastName].filter(Boolean).join(' ') : '');

/* ═════════════════════════ SUMMARY ═════════════════════════ */

interface SummaryData {
  note: Row | null;
  complaints: Row[];
  diagnoses: Row[];
  vitals: Row[];
  prescriptions: Row[];
  orders: Row[];
  allergies: Row[];
}

const Block: React.FC<{ title: string; empty: boolean; children: React.ReactNode }> = ({ title, empty, children }) => (
  <div className="emrws-summary-block">
    <h4 style={{ ...typography.labelSm, color: colors.textSubtle, margin: `0 0 ${spacing.xs}` }}>{title}</h4>
    {empty ? <span style={{ color: colors.textDisabled, ...typography.body }}>Not recorded</span> : children}
  </div>
);

export const SummaryPanel: React.FC<EmrPanelProps> = ({ context, openLegacyModal, downloadFile, profileSectionIds }) => {
  const fetcher = useCallback(async (): Promise<SummaryData> => {
    const pid = context.patientId;
    const eid = context.encounterId;
    const cid = context.consultationId;
    const list = (p: Promise<any>) => p.then((r) => r?.Data || []).catch(() => []);
    // Independent reads → in parallel. Each one degrades to empty rather than failing the whole summary.
    const [notes, complaints, diagnoses, vitals, prescriptions, orders, allergies] = await Promise.all([
      list(apiFetch('emr/PatientClinicalNotes/GetPatientClinicalNotess', { Params: [{ Key: 1, Value: pid }, { Key: 2, Value: eid }, ...(cid ? [{ Key: 3, Value: cid }] : [])] })),
      list(apiFetch('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: [{ Key: 2, Value: pid }, { Key: 3, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientcondition/GetPatientConditions', { Params: [{ Key: 2, Value: pid }, { Key: 5, Value: eid }, { Key: 7, Value: 0 }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientvital/GetPatientVitals', { Params: [{ Key: 2, Value: pid }, { Key: 9, Value: eid }] })),
      list(apiFetch('emr/prescription/GetPrescriptions', { Params: [{ Key: 2, Value: pid }, { Key: 12, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientorder/GetPatientOrders', { Params: [{ Key: 2, Value: pid }, { Key: 18, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientallergy/GetPatientAllergys', { Params: [{ Key: 2, Value: pid }, { Key: 4, Value: 1 }], PageContext: { PageSize: 50, PageNumber: 1 } })),
    ]);
    const latestGroup = vitals.reduce((m: number | undefined, v: Row) => (v.GroupId !== undefined && (m === undefined || v.GroupId > m) ? v.GroupId : m), undefined);
    return {
      note: notes[0] || null,
      complaints,
      diagnoses: diagnoses.filter((x: Row) => x.Status === undefined || x.Status === 1),
      vitals: latestGroup === undefined ? vitals : vitals.filter((v: Row) => v.GroupId === latestGroup),
      prescriptions,
      orders,
      allergies,
    };
  }, [context.patientId, context.encounterId, context.consultationId]);
  const { data, loading, error, reload } = useAsyncData<SummaryData>(fetcher, { note: null, complaints: [], diagnoses: [], vitals: [], prescriptions: [], orders: [], allergies: [] });

  const print = () => {
    if (!context.consultationId) return;
    downloadFile?.('emr/consultation/PrintConsultation', {
      Id: context.consultationId,
      Data: { PatientId: context.patientId, EncounterId: context.encounterId, ConsultationId: context.consultationId, sectionList: profileSectionIds || [] },
    });
  };

  return (
    <PanelSection
      title="Visit summary"
      icon="fa-solid fa-file-lines"
      actions={
        <>
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reload} disabled={loading}>
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
            icon="fa-solid fa-magnifying-glass"
            disabled={!openLegacyModal || !context.consultationId}
            onClick={() => openLegacyModal?.('patientemr.reviewnotes', { cid: context.consultationId, pid: context.patientId })}
          >
            Review notes
          </Button>
          <Button size="sm" variant="primary" icon="fa-solid fa-print" onClick={print} disabled={!downloadFile || !context.consultationId}>
            Print
          </Button>
        </>
      }
    >
      {loading ? (
        <SkeletonRows rows={6} columns={2} />
      ) : error ? (
        <InlineNotice tone="danger">{error}</InlineNotice>
      ) : (
        <div className="emrws-summary">
          <Block title="Chief complaint" empty={!data.note?.ChiefComplaints && data.complaints.length === 0}>
            <p style={{ margin: 0 }}>{[...data.complaints.map((c) => c.ChiefComplaint), data.note?.ChiefComplaints].filter(Boolean).join('; ')}</p>
          </Block>
          <Block title="History of present illness" empty={!data.note || !['Location', 'Quality', 'Severity', 'Timing', 'Context', 'ModifyingFactors', 'OtherComplaints', 'AdditionalNotes'].some((k) => data.note?.[k])}>
            <dl className="emrws-dl">
              {(
                [
                  ['Location', 'Location'],
                  ['Quality', 'Quality'],
                  ['Severity', 'Severity'],
                  ['Onset / timing', 'Timing'],
                  ['Context', 'Context'],
                  ['Modifying factors', 'ModifyingFactors'],
                  ['Associated symptoms', 'OtherComplaints'],
                  ['Notes', 'AdditionalNotes'],
                ] as const
              )
                .filter(([, k]) => data.note?.[k])
                .map(([label, k]) => (
                  <React.Fragment key={k}>
                    <dt>{label}</dt>
                    <dd>{data.note?.[k]}</dd>
                  </React.Fragment>
                ))}
            </dl>
          </Block>
          <Block title="Allergies" empty={data.allergies.length === 0}>
            <p style={{ margin: 0, color: colors.danger, fontWeight: 600 }}>{data.allergies.map((a) => a.AllergyName).join(', ')}</p>
          </Block>
          <Block title="Vitals" empty={data.vitals.length === 0}>
            <p style={{ margin: 0 }}>
              {data.vitals
                .filter((v) => v.VitalValue)
                .map((v) => `${v.Description || v.VitalName}: ${String(v.VitalValue).replace('~', '/')}${v.UOM ? ` ${v.UOM}` : ''}`)
                .join(' · ')}
            </p>
          </Block>
          <Block title="Diagnosis" empty={data.diagnoses.length === 0}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.diagnoses.map((dx) => (
                <li key={dx.Id}>
                  <strong>{dx.Code}</strong> {dx.DiagnosisName}
                  {dx.ConditionType?.Description ? ` (${dx.ConditionType.Description})` : ''}
                </li>
              ))}
            </ul>
          </Block>
          <Block title="Prescriptions" empty={data.prescriptions.length === 0}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.prescriptions.flatMap((p) =>
                (p.PrescriptionDetails || p.PrescriptionDetail || []).map((l: Row) => (
                  <li key={`${p.Id}-${l.Id}`}>
                    {l.DrugName} {l.Dosage ? `— ${l.Dosage}` : ''} {l.Duration ? `for ${l.Duration} ${l.DurationPeriod?.Description || ''}` : ''}
                  </li>
                )),
              )}
            </ul>
          </Block>
          <Block title="Services ordered" empty={data.orders.length === 0}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.orders.flatMap((o) =>
                (o.PatientOrderDetails || o.PatientOrderDetail || []).map((l: Row) => (
                  <li key={`${o.Id}-${l.Id}`}>
                    {l.TestName}
                    {l.OrderStatus?.DisplayName ? ` — ${l.OrderStatus.DisplayName}` : ''}
                  </li>
                )),
              )}
            </ul>
          </Block>
        </div>
      )}
    </PanelSection>
  );
};

/* ═════════════════════════ PREVIOUS VISITS ═════════════════════════ */

export const PreviousVisitsPanel: React.FC<EmrPanelProps> = ({ context, openLegacyModal, downloadFile, onCopyFromVisit }) => {
  const fetcher = useCallback(async (): Promise<Row[]> => {
    const params: { Key: number; Value: any }[] = [{ Key: 3, Value: context.patientId }];
    if (context.consultationId) params.push({ Key: 14, Value: context.consultationId });
    const res = await apiFetch('emr/consultation/GetConsultations', { Params: params, PageContext: { PageSize: 50, PageNumber: 1 } });
    return res?.Data || [];
  }, [context.patientId, context.consultationId]);
  const { data: rows, loading, error, reload } = useAsyncData<Row[]>(fetcher, [], { errorMessage: 'Could not load previous visits.' });

  return (
    <PanelSection
      title="Previous visit entries"
      icon="fa-solid fa-clock-rotate-left"
      flush
      actions={
        <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reload} disabled={loading}>
          Reload
        </Button>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg }}>
          <SkeletonRows rows={4} columns={5} />
        </div>
      ) : error ? (
        <div style={{ padding: spacing.lg }}>
          <InlineNotice tone="danger">{error}</InlineNotice>
        </div>
      ) : (
        <SimpleTable headers={['Date', 'Visit no', 'EMR form', 'Doctor', 'Status', '']} empty={rows.length === 0} emptyText="No previous visit entries">
          {rows.map((r) => (
            <tr key={r.Id}>
              <td>{formatDateTime(r.CreatedAt)}</td>
              <td>{r.Encounter?.VisitIdentifier || r.EncounterId}</td>
              <td>{r.ProfileMaster?.Name || r.Name || '—'}</td>
              <td>{person(r.Doc) || person(r.CreatedUser) || '—'}</td>
              <td>{r.ProgressNoteStatus?.Description ? <Badge tone={toneForStatus(r.ProgressNoteStatus.Description)}>{r.ProgressNoteStatus.Description}</Badge> : '—'}</td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Button size="xs" variant="outline-primary" icon="fa-solid fa-eye" disabled={!openLegacyModal} onClick={() => openLegacyModal?.('patientemr.reviewnotes', { cid: r.Id, pid: context.patientId })}>
                  View
                </Button>{' '}
                {onCopyFromVisit && (
                  <>
                    <Button size="xs" variant="outline-secondary" icon="fa-solid fa-copy" title="Copy complaints, diagnoses, medicines and tests into this visit" onClick={() => onCopyFromVisit(r.Id)}>
                      Copy
                    </Button>{' '}
                  </>
                )}
                <Button
                  size="xs"
                  variant="icon"
                  icon="fa-solid fa-print"
                  title="Print"
                  aria-label="Print visit entry"
                  disabled={!downloadFile}
                  onClick={() =>
                    downloadFile?.('emr/consultation/PrintConsultation', {
                      Id: r.Id,
                      Data: { PatientId: context.patientId, EncounterId: r.EncounterId, ConsultationId: r.Id, sectionList: (r.ProfileMaster?.ProfileSections || []).map((s: Row) => s.SectionId) },
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </SimpleTable>
      )}
    </PanelSection>
  );
};

/* ═════════════════════════ RESULTS ═════════════════════════ */

export const ResultsPanel: React.FC<EmrPanelProps> = ({ context, section, openLegacyModal, navigateTo }) => {
  const sref = section?.SRef || '';
  const showLab = sref !== 'emr.cn.radiologyresults';
  const showRad = sref !== 'emr.cn.labresults';
  return (
    <div className="emrws-grid-2">
      {showLab && (
        <PanelSection title="Lab results" icon="fa-solid fa-vial">
          <p style={{ ...typography.body, color: colors.textMuted, marginTop: 0 }}>Validated laboratory results with previous values and reference ranges.</p>
          {/* The lab result list is a page (state), not a registered modal. */}
          <Button variant="primary" icon="fa-solid fa-up-right-from-square" disabled={!navigateTo} onClick={() => navigateTo?.('patientemr.labresults', { context: 'emr', from: 'emrworkspace' })}>
            Open lab results
          </Button>
        </PanelSection>
      )}
      {showRad && (
        <PanelSection title="Radiology results" icon="fa-solid fa-x-ray">
          <p style={{ ...typography.body, color: colors.textMuted, marginTop: 0 }}>Radiology reports ordered for this visit.</p>
          <Button variant="primary" icon="fa-solid fa-up-right-from-square" disabled={!openLegacyModal} onClick={() => openLegacyModal?.('patientemr.radiologyresults', { eid: context.encounterId, pid: context.patientId })}>
            Open radiology results
          </Button>
        </PanelSection>
      )}
    </div>
  );
};

/* ═════════════════════════ ADDENDUM ═════════════════════════ */

const NOTE_STATUS: Record<number, { label: string; tone: 'neutral' | 'success' | 'warning' }> = {
  1: { label: 'Draft', tone: 'neutral' },
  2: { label: 'Signed', tone: 'success' },
  3: { label: 'Amended', tone: 'warning' },
};

export const AddendumPanel: React.FC<EmrPanelProps> = ({ context, canEdit, onDataChanged }) => {
  const [target, setTarget] = useState<Row | null>(null);
  const [reason, setReason] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const fetcher = useCallback(async (): Promise<Row[]> => {
    if (!context.encounterId) return [];
    const res = await apiFetch('emr/PatientClinicalNotes/GetPatientClinicalNotess', { Params: [{ Key: 1, Value: context.patientId }, { Key: 2, Value: context.encounterId }] });
    return (res?.Data || []).slice().sort((a: Row, b: Row) => new Date(b.CreatedAt || 0).getTime() - new Date(a.CreatedAt || 0).getTime());
  }, [context.patientId, context.encounterId]);
  const { data: notes, loading, error, reload } = useAsyncData<Row[]>(fetcher, [], { errorMessage: 'Could not load clinical notes.' });

  const sign = async (note: Row) => {
    setBusy(true);
    try {
      await apiFetch('emr/PatientClinicalNotes/SignPatientClinicalNote', { Id: note.Id, Data: { Id: note.Id } });
      alert.showSuccessMsg('Clinical note signed');
      reload();
      onDataChanged?.('addendum');
    } catch {
      /* toasted */
    } finally {
      setBusy(false);
    }
  };

  const submitAddendum = async () => {
    if (!target) return;
    if (!reason.trim() || !text.trim()) {
      alert.showErrorMsg('Enter the reason and the addendum text.');
      return;
    }
    const stamp = formatDateTime(new Date());
    const { Id, CreatedAt: _c, UpdatedAt: _u, SignedAt: _sa, SignedBy: _sb, SignedContent: _sc, NoteStatus: _ns, ...content } = target;
    setBusy(true);
    try {
      await apiFetch('emr/PatientClinicalNotes/AmendPatientClinicalNote', {
        Id,
        Data: {
          ...content,
          Id,
          OriginalNoteId: Id,
          AmendmentReason: reason.trim(),
          AdditionalNotes: `${target.AdditionalNotes ? `${target.AdditionalNotes}\n\n` : ''}Addendum (${stamp}): ${text.trim()}`,
          IsSignedImmediately: true,
        },
      });
      alert.showSuccessMsg('Addendum saved');
      setTarget(null);
      setReason('');
      setText('');
      reload();
      onDataChanged?.('addendum');
    } catch {
      /* toasted */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <InlineNotice tone="info">A signed clinical note cannot be edited. Add an addendum instead — the original is kept and marked “Amended”.</InlineNotice>
      <PanelSection title="Clinical notes for this visit" icon="fa-solid fa-signature" flush>
        {loading ? (
          <div style={{ padding: spacing.lg }}>
            <SkeletonRows rows={3} columns={4} />
          </div>
        ) : error ? (
          <div style={{ padding: spacing.lg }}>
            <InlineNotice tone="danger">{error}</InlineNotice>
          </div>
        ) : (
          <SimpleTable headers={['Written', 'Chief complaint', 'Status', 'Signed', '']} empty={notes.length === 0} emptyText="No clinical note yet — write one on the CC / HPI tab">
            {notes.map((n) => {
              const st = NOTE_STATUS[n.NoteStatus || 1] || NOTE_STATUS[1];
              return (
                <tr key={n.Id}>
                  <td>{formatDateTime(n.CreatedAt)}</td>
                  <td>
                    {n.ChiefComplaints || '—'}
                    {n.AmendmentOf && <div style={{ ...typography.caption, color: colors.textSubtle }}>Addendum · {n.AmendmentReason}</div>}
                  </td>
                  <td>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </td>
                  <td>{n.SignedAt ? formatDate(n.SignedAt) : '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {(n.NoteStatus || 1) < 2 && (
                      <Button size="xs" variant="outline-success" icon="fa-solid fa-signature" disabled={!canEdit || busy} onClick={() => sign(n)}>
                        Sign
                      </Button>
                    )}
                    {n.NoteStatus === 2 && (
                      <Button size="xs" variant="outline-primary" icon="fa-solid fa-plus" disabled={busy} onClick={() => setTarget(n)}>
                        Addendum
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </SimpleTable>
        )}
      </PanelSection>
      {target && (
        <PanelSection title="New addendum" icon="fa-solid fa-pen-to-square">
          <div style={{ display: 'grid', gap: spacing.md }}>
            <Input label="Reason for addendum" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Late entry, clarification, results received" />
            <Textarea label="Addendum" required rows={4} value={text} onChange={(e) => setText(e.target.value)} />
            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button variant="outline-secondary" onClick={() => setTarget(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="primary" icon="fa-solid fa-floppy-disk" onClick={submitAddendum} loading={busy} loadingText="Saving…">
                Save & sign addendum
              </Button>
            </div>
          </div>
        </PanelSection>
      )}
    </div>
  );
};

/* ═════════════════════════ UNSUPPORTED ═════════════════════════ */

export const LegacySectionPanel: React.FC<EmrPanelProps> = ({ context, section, navigateTo }) => (
  <div style={{ display: 'grid', gap: spacing.md, justifyItems: 'start', padding: spacing.xl, background: colors.surface, border: `1px dashed ${colors.borderStrong}`, borderRadius: 12 }}>
    <h3 style={{ ...typography.h3, margin: 0 }}>{section?.Name || 'Panel'}</h3>
    <p style={{ ...typography.body, color: colors.textMuted, margin: 0, maxWidth: 620 }}>
      This panel type (<code>{section?.SRef || 'unknown'}</code>) is still served by the classic consultation screen. Open it there — your entries are saved to the same visit.
    </p>
    <Button
      variant="primary"
      icon="fa-solid fa-up-right-from-square"
      disabled={!navigateTo || !context.consultationId}
      onClick={() => navigateTo?.('patientemr.consultation', { id: context.consultationId, eid: context.encounterId, context: 'emr' })}
    >
      Open in classic consultation
    </Button>
  </div>
);
