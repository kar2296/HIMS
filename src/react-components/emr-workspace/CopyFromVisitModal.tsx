/**
 * "Copy from previous visit": pick an earlier visit entry, tick what to bring over, copy.
 *
 *   visits        emr/consultation/GetConsultations            (Key 3 = PatientId, Key 14 = exclude current entry)
 *   complaints    emr/PatientChiefComplaint/GetPatientChiefComplaints  -> copied directly (ManagePatientChiefComplaints)
 *   diagnoses     emr/patientcondition/GetPatientConditions             -> copied directly (ManagePatientConditions)
 *   medicines     emr/prescription/GetPrescriptions (with details)      -> opened in Manage Prescription as a new draft to review
 *   tests         emr/patientorder/GetPatientOrders (with details)      -> opened in Manage Orders as a new order to review
 *   print         emr/consultation/PrintConsultation (the chosen visit's summary)
 *
 * Records of the chosen visit are read by its encounter; when the chosen entry belongs to the current
 * encounter (another entry of this same visit) they are read by that entry's consultation id instead.
 * Items that are already in the current visit are shown but cannot be ticked (no duplicates).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';
import type { EmrWorkspaceContext, EncounterInfo } from './types';
import { formatDate, formatDateTime } from './emrHelpers';
import { InlineNotice } from './EmrUi';
import { useAsyncData } from './useAsyncData';

type Row = Record<string, any>;
type Params = { Key: number; Value: any }[];

interface CopyFromVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: EmrWorkspaceContext;
  encounter: EncounterInfo | null;
  /** Visit entry to pre-select (e.g. the row clicked in Previous visits). */
  initialConsultationId?: number | null;
  openLegacyModal?: (modalName: string, params: Record<string, any>, onClosed?: () => void) => void;
  downloadFile?: (action: string, data: Record<string, any>) => void;
  /** Called after records were added to the current visit (panels should reload). */
  onCopied: () => void;
}

interface VisitData {
  complaints: Row[];
  diagnoses: Row[];
  prescriptions: Row[];
  orders: Row[];
}

interface CurrentData {
  complaintIds: Set<number>;
  diagnosisIds: Set<number>;
}

const EMPTY_VISIT: VisitData = { complaints: [], diagnoses: [], prescriptions: [], orders: [] };
const EMPTY_KEYS: Set<string> = new Set();
const person = (u?: { FirstName?: string; LastName?: string } | null) => (u ? [u.FirstName, u.LastName].filter(Boolean).join(' ') : '');
const list = async (p: Promise<any>): Promise<Row[]> => (await p)?.Data || [];
const isActive = (r: Row) => r.Status === undefined || r.Status === 1;
const rxLines = (p: Row): Row[] => (p.PrescriptionDetails || p.PrescriptionDetail || []).filter((d: Row) => isActive(d) && (d.DrugId > 0 || d.GenericId > 0));
const orderLines = (o: Row): Row[] => (o.PatientOrderDetails || o.PatientOrderDetail || []).filter((d: Row) => isActive(d) && d.OrderStatusId !== 2 && d.TestId > 0);

/** Keys of the tick-able items: cc:<id>, dx:<id>, rx:<detailId>, ord:<detailId>. */
type ItemKey = string;

/** Mounted only while open, so every opening starts fresh (visit, ticks, loaded data). */
export const CopyFromVisitModal: React.FC<CopyFromVisitModalProps> = (props) => (props.isOpen ? <CopyFromVisitDialog {...props} /> : null);

interface LoadedVisit extends VisitData {
  visitId: number;
}

const CopyFromVisitDialog: React.FC<CopyFromVisitModalProps> = ({
  onClose,
  context,
  encounter,
  initialConsultationId,
  openLegacyModal,
  downloadFile,
  onCopied,
}) => {
  const { patientId, encounterId, consultationId } = context;
  const [pickedVisitId, setPickedVisitId] = useState<number | null>(null);
  const [selection, setSelection] = useState<{ visitId: number | null; keys: Set<ItemKey> }>({ visitId: null, keys: new Set() });
  const [copying, setCopying] = useState(false);

  /* ── earlier visit entries (newest first) ── */
  const visitsFetcher = useCallback(async (): Promise<Row[]> => {
    const params: Params = [{ Key: 3, Value: patientId }];
    if (consultationId) params.push({ Key: 14, Value: consultationId });
    const rows = await list(apiFetch('emr/consultation/GetConsultations', { Params: params, PageContext: { PageSize: 50, PageNumber: 1 } }));
    return rows.filter((r) => r.Id !== consultationId).sort((a, b) => String(b.CreatedAt || '').localeCompare(String(a.CreatedAt || '')));
  }, [patientId, consultationId]);
  const visitsQuery = useAsyncData<Row[]>(visitsFetcher, [], { errorMessage: 'Could not load previous visits.' });
  const visits = visitsQuery.data;
  const visit = visits.find((v) => v.Id === (pickedVisitId ?? initialConsultationId)) || visits[0] || null;
  const visitId = visit ? visit.Id : null;

  /* ── what is already in the current visit (to avoid duplicates) ── */
  const currentFetcher = useCallback(async (): Promise<CurrentData> => {
    if (!encounterId) return { complaintIds: new Set(), diagnosisIds: new Set() };
    const ccParams: Params = [
      { Key: 2, Value: patientId },
      { Key: 3, Value: encounterId },
    ];
    if (consultationId) ccParams.push({ Key: 4, Value: consultationId });
    const [cc, dx] = await Promise.all([
      list(apiFetch('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: ccParams, PageContext: { PageSize: 100, PageNumber: 1 } })),
      list(
        apiFetch('emr/patientcondition/GetPatientConditions', {
          Params: [
            { Key: 2, Value: patientId },
            { Key: 5, Value: encounterId },
            { Key: 7, Value: 0 },
          ],
          PageContext: { PageSize: 100, PageNumber: 1 },
        }),
      ),
    ]);
    return {
      complaintIds: new Set(cc.filter(isActive).map((r) => r.ChiefComplaintId).filter(Boolean)),
      diagnosisIds: new Set(dx.filter(isActive).map((r) => r.DiagnosisId).filter(Boolean)),
    };
  }, [patientId, encounterId, consultationId]);
  const { data: current } = useAsyncData<CurrentData>(currentFetcher, { complaintIds: new Set(), diagnosisIds: new Set() });

  /* ── the chosen visit's records ── */
  const visitFetcher = useCallback(async (): Promise<LoadedVisit | null> => {
    if (!visit) return null;
    // Another entry of this same visit: read by that entry; an earlier visit: read by its encounter.
    const sameEncounter = visit.EncounterId === encounterId;
    const page = { PageSize: 100, PageNumber: 1 };
    const byVisit = (encounterKey: number, consultationKey: number): Params =>
      sameEncounter ? [{ Key: consultationKey, Value: visit.Id }] : [{ Key: encounterKey, Value: visit.EncounterId }];
    const [complaints, diagnoses, prescriptions, orders] = await Promise.all([
      list(apiFetch('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: [{ Key: 2, Value: patientId }, ...byVisit(3, 4)], PageContext: page })),
      list(apiFetch('emr/patientcondition/GetPatientConditions', { Params: [{ Key: 2, Value: patientId }, { Key: 7, Value: 0 }, ...byVisit(5, 6)], PageContext: page })),
      list(apiFetch('emr/prescription/GetPrescriptions', { Params: [{ Key: 2, Value: patientId }, ...byVisit(12, 13)], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientorder/GetPatientOrders', { Params: [{ Key: 2, Value: patientId }, ...byVisit(18, 21)], PageContext: { PageSize: 50, PageNumber: 1 } })),
    ]);
    return {
      visitId: visit.Id,
      complaints: complaints.filter(isActive),
      diagnoses: diagnoses.filter(isActive),
      // cancelled prescriptions (status 2) and orders are not offered
      prescriptions: prescriptions.filter((p) => isActive(p) && p.PrecriptionStatusId !== 2 && rxLines(p).length > 0),
      orders: orders.filter((o) => isActive(o) && o.OrderStatusId !== 2 && orderLines(o).length > 0),
    };
  }, [visit, patientId, encounterId]);
  const visitQuery = useAsyncData<LoadedVisit | null>(visitFetcher, null, { errorMessage: 'Could not load that visit. Please try again.' });
  const loading = Boolean(visit) && visitQuery.data?.visitId !== visitId && !visitQuery.error;
  const data: VisitData = visitQuery.data && visitQuery.data.visitId === visitId ? visitQuery.data : EMPTY_VISIT;
  const error = visitsQuery.error || visitQuery.error || '';

  // ticks belong to the visit they were made on
  const selected = selection.visitId === visitId ? selection.keys : EMPTY_KEYS;
  const setSelected = (update: (prev: Set<ItemKey>) => Set<ItemKey>) => setSelection({ visitId, keys: update(selected) });

  /* ── selection ── */
  const complaintAlready = useCallback((r: Row) => current.complaintIds.has(r.ChiefComplaintId), [current]);
  const diagnosisAlready = useCallback((r: Row) => current.diagnosisIds.has(r.DiagnosisId), [current]);

  const sections = useMemo(() => {
    const cc = data.complaints.filter((r) => !complaintAlready(r)).map((r) => `cc:${r.Id}`);
    const dx = data.diagnoses.filter((r) => !diagnosisAlready(r)).map((r) => `dx:${r.Id}`);
    const rx = data.prescriptions.flatMap((p) => rxLines(p).map((d) => `rx:${d.Id}`));
    const ord = data.orders.flatMap((o) => orderLines(o).map((d) => `ord:${d.Id}`));
    return { cc, dx, rx, ord };
  }, [data, complaintAlready, diagnosisAlready]);

  const toggle = (key: ItemKey, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  const toggleAll = (keys: ItemKey[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });
  const allOf = (keys: ItemKey[]) => keys.length > 0 && keys.every((k) => selected.has(k));

  const count = (prefix: string) => Array.from(selected).filter((k) => k.startsWith(prefix)).length;
  const totals = { cc: count('cc:'), dx: count('dx:'), rx: count('rx:'), ord: count('ord:') };
  const totalSelected = totals.cc + totals.dx + totals.rx + totals.ord;

  /* ── copy ── */
  const copy = async () => {
    if (!visit || !encounterId) return;
    setCopying(true);
    try {
      const now = new Date();
      const complaints = data.complaints.filter((r) => selected.has(`cc:${r.Id}`));
      if (complaints.length) {
        await apiFetch('emr/PatientChiefComplaint/ManagePatientChiefComplaints', {
          Data: complaints.map((r) => ({
            PatientId: patientId,
            EncounterId: encounterId,
            ConsultationId: consultationId ?? undefined,
            ChiefComplaintId: r.ChiefComplaintId,
            ChiefComplaint: r.ChiefComplaint,
            Description: r.Description,
            StartDate: now,
            PatientChiefComplaintStatusId: r.PatientChiefComplaintStatusId || 1,
          })),
        });
      }
      const diagnoses = data.diagnoses.filter((r) => selected.has(`dx:${r.Id}`));
      if (diagnoses.length) {
        await apiFetch('emr/patientcondition/ManagePatientConditions', {
          Data: diagnoses.map((r) => ({
            PatientId: patientId,
            EncounterId: encounterId,
            ConsultationId: consultationId ?? undefined,
            DiagnosisId: r.DiagnosisId,
            DiagnosisName: r.DiagnosisName,
            Code: r.Code,
            Description: r.Description || r.DiagnosisName,
            DiagnosisDetails: r.DiagnosisDetails || r.DiagnosisName,
            ConditionTypeId: r.ConditionTypeId ?? undefined,
            ConditionDate: now,
            ConditionStatusId: 1,
            IsPatientCondition: 0,
            CategoryId: r.CategoryId || 0,
            TypeId: r.TypeId || 0,
            GradeId: r.GradeId || 0,
            SideId: r.SideId || 0,
            Comments: r.Comments || undefined,
            PerformedBy: context.userId,
            PerformedDate: now,
          })),
        });
      }
      if (complaints.length || diagnoses.length) {
        const parts = [complaints.length && `${complaints.length} complaint(s)`, diagnoses.length && `${diagnoses.length} diagnosis(es)`].filter(Boolean);
        alert.showSuccessMsg(`Copied ${parts.join(' and ')} to this visit`);
        onCopied();
      }

      // Medicines and tests open in their own forms as new drafts for review (one after the other).
      const rxIds = data.prescriptions.filter((p) => rxLines(p).some((d) => selected.has(`rx:${d.Id}`))).map((p) => p.Id);
      const rxDetailIds = Array.from(selected).filter((k) => k.startsWith('rx:')).map((k) => Number(k.slice(3)));
      const orderIds = data.orders.filter((o) => orderLines(o).some((d) => selected.has(`ord:${d.Id}`))).map((o) => o.Id);
      const orderDetailIds = Array.from(selected).filter((k) => k.startsWith('ord:')).map((k) => Number(k.slice(4)));
      const base = { id: 0, pid: patientId, eid: encounterId, cid: consultationId || undefined, startTab: 'detail' };

      const openOrders = () => {
        if (!orderIds.length || !openLegacyModal) return;
        openLegacyModal('patientemr.patientorder', { ...base, copyFromOrderIds: orderIds, copyDetailIds: orderDetailIds }, onCopied);
      };
      onClose();
      if (rxIds.length && openLegacyModal) {
        openLegacyModal(
          'patientemr.prescription',
          { ...base, doctid: encounter?.DoctorId, deptid: encounter?.DepartmentId, copyFromPrescriptionIds: rxIds, copyDetailIds: rxDetailIds },
          () => {
            onCopied();
            openOrders();
          },
        );
      } else {
        openOrders();
      }
    } catch {
      /* server error already toasted */
    } finally {
      setCopying(false);
    }
  };

  const printVisit = () => {
    if (!visit || !downloadFile) return;
    downloadFile('emr/consultation/PrintConsultation', {
      Id: visit.Id,
      Data: {
        PatientId: patientId,
        EncounterId: visit.EncounterId,
        ConsultationId: visit.Id,
        sectionList: (visit.ProfileMaster?.ProfileSections || []).map((s: Row) => s.SectionId),
      },
    });
  };

  /* ── render ── */
  const visitLabel = (v: Row) =>
    [formatDateTime(v.CreatedAt), v.Encounter?.VisitIdentifier, v.ProfileMaster?.Name || v.Name, person(v.Doc) || person(v.CreatedUser)].filter(Boolean).join(' · ');

  const nothingToCopy = !loading && visit && sections.cc.length + sections.dx.length + sections.rx.length + sections.ord.length === 0;
  const actionLabel = () => {
    if (!totalSelected) return 'Copy selected';
    const reviewOnly = totals.cc + totals.dx === 0;
    return reviewOnly ? `Open ${totalSelected} for review` : `Copy ${totalSelected} selected`;
  };

  const footer = (
    <div className="emrws-copy-footer">
      <Button variant="outline-secondary" icon="fa-solid fa-print" onClick={printVisit} disabled={!visit || !downloadFile}>
        Print this visit
      </Button>
      <div style={{ display: 'flex', gap: spacing.sm, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <Button variant="outline-secondary" onClick={onClose} disabled={copying}>
          Cancel
        </Button>
        <Button variant="primary" icon="fa-solid fa-copy" onClick={copy} loading={copying} loadingText="Copying…" disabled={!totalSelected || copying || !encounterId}>
          {actionLabel()}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen title="Copy from previous visit" onClose={onClose} footer={footer} width="860px" portal>
      <style>{copyStyles}</style>
      <div style={{ display: 'grid', gap: spacing.md }}>
        <Select
          label="Previous visit"
          options={visits.map((v) => ({ value: v.Id, label: visitLabel(v) }))}
          value={visitId ?? ''}
          placeholder={visitsQuery.loading ? 'Loading visits…' : visits.length ? 'Select a visit' : 'No previous visits'}
          disabled={visitsQuery.loading || visits.length === 0}
          onChange={(v) => setPickedVisitId(Number(v))}
        />
        {!encounterId && <InlineNotice tone="warning">There is no active visit to copy into.</InlineNotice>}
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        {loading ? (
          <SkeletonRows rows={5} columns={3} />
        ) : !visit ? null : nothingToCopy ? (
          <InlineNotice tone="info">Nothing to copy from this visit (no complaints, diagnoses, medicines or tests, or they are already in this visit).</InlineNotice>
        ) : (
          <>
            <CopySection
              title="Chief complaints"
              icon="fa-solid fa-comment-medical"
              hint="Added to this visit"
              keys={sections.cc}
              allOn={allOf(sections.cc)}
              onAll={(on) => toggleAll(sections.cc, on)}
              empty={data.complaints.length === 0}
            >
              {data.complaints.map((r) => (
                <CopyItem
                  key={r.Id}
                  checked={selected.has(`cc:${r.Id}`)}
                  onChange={(on) => toggle(`cc:${r.Id}`, on)}
                  disabled={complaintAlready(r)}
                  title={r.ChiefComplaint || r.ChiefComplaintMaster?.ChiefComplaint || 'Complaint'}
                  meta={[r.Description, complaintAlready(r) ? 'Already in this visit' : ''].filter(Boolean).join(' · ')}
                />
              ))}
            </CopySection>

            <CopySection
              title="Diagnoses"
              icon="fa-solid fa-stethoscope"
              hint="Added to this visit"
              keys={sections.dx}
              allOn={allOf(sections.dx)}
              onAll={(on) => toggleAll(sections.dx, on)}
              empty={data.diagnoses.length === 0}
            >
              {data.diagnoses.map((r) => (
                <CopyItem
                  key={r.Id}
                  checked={selected.has(`dx:${r.Id}`)}
                  onChange={(on) => toggle(`dx:${r.Id}`, on)}
                  disabled={diagnosisAlready(r)}
                  title={[r.Code, r.DiagnosisName || r.Diagnosis?.DiagnosisName].filter(Boolean).join(' – ') || 'Diagnosis'}
                  meta={[r.ConditionType?.Description, diagnosisAlready(r) ? 'Already in this visit' : ''].filter(Boolean).join(' · ')}
                />
              ))}
            </CopySection>

            <CopySection
              title="Medicines"
              icon="fa-solid fa-prescription"
              hint="Opens Manage Prescription as a new draft to review"
              keys={sections.rx}
              allOn={allOf(sections.rx)}
              onAll={(on) => toggleAll(sections.rx, on)}
              empty={data.prescriptions.length === 0}
            >
              {data.prescriptions.map((p) =>
                rxLines(p).map((d) => (
                  <CopyItem
                    key={d.Id}
                    checked={selected.has(`rx:${d.Id}`)}
                    onChange={(on) => toggle(`rx:${d.Id}`, on)}
                    title={d.DrugName || d.DrugMaster?.DrugName || d.GenericMaster?.GenericName || 'Medicine'}
                    meta={[
                      d.Dosage && `Dose ${d.Dosage}`,
                      d.DrugFrequency?.Name,
                      d.Duration && `${d.Duration} ${d.DurationPeriod?.Description || ''}`.trim(),
                      d.Quantity && `Qty ${d.Quantity}`,
                      p.Identifier || (p.PrecriptionStatusId === 1 ? 'Draft' : ''),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                )),
              )}
            </CopySection>

            <CopySection
              title="Investigations & services"
              icon="fa-solid fa-flask"
              hint="Opens Manage Orders as a new order to review"
              keys={sections.ord}
              allOn={allOf(sections.ord)}
              onAll={(on) => toggleAll(sections.ord, on)}
              empty={data.orders.length === 0}
            >
              {data.orders.map((o) =>
                orderLines(o).map((d) => (
                  <CopyItem
                    key={d.Id}
                    checked={selected.has(`ord:${d.Id}`)}
                    onChange={(on) => toggle(`ord:${d.Id}`, on)}
                    title={[d.TestCode, d.TestName].filter(Boolean).join(' – ') || 'Test'}
                    meta={[o.OrderNumber, formatDate(o.OrderRequestDate)].filter(Boolean).join(' · ')}
                  />
                )),
              )}
            </CopySection>
          </>
        )}
      </div>
    </Modal>
  );
};

/* ───────────── pieces ───────────── */

const CopySection: React.FC<{
  title: string;
  icon: string;
  hint: string;
  keys: ItemKey[];
  allOn: boolean;
  onAll: (on: boolean) => void;
  empty: boolean;
  children: React.ReactNode;
}> = ({ title, icon, hint, keys, allOn, onAll, empty, children }) => (
  <section className="emrws-copy-section">
    <header>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, minWidth: 0 }}>
        <i className={icon} aria-hidden="true" style={{ color: colors.primary }} />
        <h4 className="emrws-copy-title" style={{ ...typography.h4, margin: 0, color: colors.textMain }}>{title}</h4>
        <span style={{ ...typography.helper, color: colors.textMuted }}>{hint}</span>
      </div>
      {keys.length > 0 && <Checkbox label="Select all" checked={allOn} onChange={onAll} />}
    </header>
    {empty ? <div style={{ ...typography.body, color: colors.textSubtle, padding: `${spacing.sm} ${spacing.md}` }}>Not recorded in that visit</div> : <div>{children}</div>}
  </section>
);

const CopyItem: React.FC<{ checked: boolean; onChange: (on: boolean) => void; title: string; meta?: string; disabled?: boolean }> = ({
  checked,
  onChange,
  title,
  meta,
  disabled,
}) => (
  <label className={`emrws-copy-item${disabled ? ' is-disabled' : ''}${checked ? ' is-checked' : ''}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span style={{ minWidth: 0 }}>
      <span style={{ ...typography.body, fontWeight: 600, color: colors.textMain, display: 'block' }}>{title}</span>
      {meta && <span style={{ ...typography.helper, color: colors.textMuted }}>{meta}</span>}
    </span>
  </label>
);

const copyStyles = `
.emrws-copy-section { border: 1px solid ${colors.border}; border-radius: ${radii.lg}; overflow: hidden; }
.emrws-copy-section > header { display: flex; align-items: center; justify-content: space-between; gap: ${spacing.sm}; flex-wrap: wrap;
  padding: ${spacing.sm} ${spacing.md}; background: ${colors.surfaceMuted}; border-bottom: 1px solid ${colors.border}; }
.emrws-copy-item { display: flex !important; align-items: flex-start; gap: ${spacing.sm}; padding: ${spacing.sm} ${spacing.md}; margin: 0;
  border-bottom: 1px solid ${colors.border}; cursor: pointer; font-weight: 400; }
.emrws-copy-item:last-child { border-bottom: 0; }
.emrws-copy-item:hover { background: ${colors.surfaceMuted}; }
.emrws-copy-item.is-checked { background: ${colors.primaryLight}; }
.emrws-copy-item.is-disabled { cursor: not-allowed; opacity: .6; }
.emrws-copy-item input { width: 16px !important; height: 16px; margin: 2px 0 0 !important; flex: none; position: static !important; opacity: 1 !important; accent-color: ${colors.primary}; }
.emrws-copy-section h4.emrws-copy-title { font-size: 14px !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0 !important; }
.emrws-copy-section > header label { display: inline-flex !important; margin: 0 !important; }
.emrws-copy-footer { display: flex; align-items: center; gap: ${spacing.sm}; flex-wrap: wrap; width: 100%; }
@media (max-width: 600px) { .emrws-copy-footer > * { width: 100%; } .emrws-copy-footer button { flex: 1; } }
`;
