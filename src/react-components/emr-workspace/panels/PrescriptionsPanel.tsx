/**
 * PRESCRIPTIONS panel -- this visit's prescriptions with their drug lines.
 *
 *   list        : emr/prescription/GetPrescriptions  (Key 2 = PatientId, Key 12 = EncounterId)
 *   add / edit  : the existing, fully-featured prescription form (modal "patientemr.prescription"),
 *                 so pharmacy stock lookup, drug interactions, allergy checks and billing rules
 *                 are reused as-is instead of being re-implemented here.
 */
import React, { useCallback } from 'react';
import { apiFetch } from '../../utils/api';
import { Button } from '../../Button';
import { SkeletonRows } from '../../../components/ui/Loading';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import { colors, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from '../EmrUi';

interface PrescriptionDetail {
  Id: number;
  DrugName?: string;
  DrugCode?: string;
  DrugGenericName?: string;
  Dosage?: string;
  Morning?: string | number;
  Noon?: string | number;
  Night?: string | number;
  Duration?: string | number;
  DurationPeriod?: { Description?: string };
  DrugFrequency?: { Description?: string };
  DrugRoute?: { Description?: string };
  DrugInstruction?: { Description?: string };
  Quantity?: number;
  StartDate?: string;
  Notes?: string;
  Status?: number;
}

interface Prescription {
  Id: number;
  Identifier?: string;
  PrescriptionDate?: string;
  PrecriptionStatus?: { Description?: string };
  PrescriptionPriority?: { Description?: string };
  StoreMaster?: { StoreName?: string };
  Doctor?: { FirstName?: string; LastName?: string };
  User?: { FirstName?: string; LastName?: string };
  PrescriptionDetails?: PrescriptionDetail[];
  PrescriptionDetail?: PrescriptionDetail[];
}

const detailsOf = (p: Prescription) => (p.PrescriptionDetails || p.PrescriptionDetail || []).filter((d) => d.Status === undefined || d.Status === 1);

const frequencyText = (d: PrescriptionDetail) => {
  if (d.DrugFrequency?.Description) return d.DrugFrequency.Description;
  const mnn = [d.Morning, d.Noon, d.Night].map((v) => (v === undefined || v === null || v === '' ? '0' : String(v)));
  return mnn.some((v) => v !== '0') ? mnn.join('-') : '—';
};

export const PrescriptionsPanel: React.FC<EmrPanelProps> = ({ context, encounter, canEdit, openLegacyModal, onDataChanged }) => {

  const fetcher = useCallback(async (): Promise<Prescription[]> => {
    if (!context.encounterId) return [];
    const res = await apiFetch('emr/prescription/GetPrescriptions', {
      Params: [
        { Key: 2, Value: context.patientId },
        { Key: 12, Value: context.encounterId },
      ],
      PageContext: { PageSize: 50, PageNumber: 1 },
    });
    return res?.Data || [];
  }, [context.patientId, context.encounterId]);
  const { data: items, loading, error: loadError, reload: load } = useAsyncData<Prescription[]>(fetcher, [], { errorMessage: 'Could not load prescriptions.' });

  const openForm = (id: number) => {
    openLegacyModal?.(
      'patientemr.prescription',
      {
        id,
        pid: context.patientId,
        eid: context.encounterId,
        cid: context.consultationId,
        doctid: encounter?.DoctorId,
        deptid: encounter?.DepartmentId,
      },
      () => {
        load();
        onDataChanged?.('prescriptions');
      },
    );
  };

  const doctorName = (p: Prescription) => {
    const u = p.Doctor || p.User;
    return u ? [u.FirstName, u.LastName].filter(Boolean).join(' ') : '—';
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <PanelSection
        title="Prescriptions for this visit"
        icon="fa-solid fa-prescription-bottle-medical"
        actions={
          <>
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={load} disabled={loading}>
              Reload
            </Button>
            <Button size="sm" variant="primary" icon="fa-solid fa-plus" onClick={() => openForm(0)} disabled={!canEdit || !openLegacyModal}>
              New prescription
            </Button>
          </>
        }
      >
        {loading ? (
          <SkeletonRows rows={4} columns={6} />
        ) : loadError ? (
          <InlineNotice tone="danger">{loadError}</InlineNotice>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.textSubtle }}>
            <i className="fa-solid fa-pills" style={{ fontSize: 28, marginBottom: spacing.sm }} aria-hidden="true" />
            <div style={{ ...typography.body }}>No prescriptions yet for this visit.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: spacing.lg }}>
            {items.map((p) => {
              const lines = detailsOf(p);
              return (
                <div key={p.Id} className="emrws-subcard">
                  <div className="emrws-subcard-head">
                    <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ color: colors.textMain }}>{p.Identifier || `Rx #${p.Id}`}</strong>
                      <span style={{ ...typography.caption, color: colors.textMuted }}>{formatDateTime(p.PrescriptionDate)}</span>
                      <span style={{ ...typography.caption, color: colors.textMuted }}>
                        <i className="fa-solid fa-user-doctor" style={{ marginRight: 4 }} aria-hidden="true" />
                        {doctorName(p)}
                      </span>
                      {p.StoreMaster?.StoreName && <span style={{ ...typography.caption, color: colors.textMuted }}>{p.StoreMaster.StoreName}</span>}
                      {p.PrecriptionStatus?.Description && <Badge tone={toneForStatus(p.PrecriptionStatus.Description)}>{p.PrecriptionStatus.Description}</Badge>}
                    </div>
                    <Button size="xs" variant="outline-primary" icon="fa-solid fa-pen" onClick={() => openForm(p.Id)} disabled={!openLegacyModal}>
                      Open
                    </Button>
                  </div>
                  <SimpleTable headers={['Drug', 'Dosage', 'Frequency', 'Route', 'Duration', 'Qty', 'Start', 'Instructions']} empty={lines.length === 0} emptyText="No drug lines">
                    {lines.map((d) => (
                      <tr key={d.Id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.DrugName || '—'}</div>
                          {d.DrugGenericName && <div style={{ ...typography.caption, color: colors.textSubtle }}>{d.DrugGenericName}</div>}
                        </td>
                        <td>{d.Dosage || '—'}</td>
                        <td>{frequencyText(d)}</td>
                        <td>{d.DrugRoute?.Description || '—'}</td>
                        <td>{d.Duration ? `${d.Duration} ${d.DurationPeriod?.Description || ''}`.trim() : '—'}</td>
                        <td>{d.Quantity ?? '—'}</td>
                        <td>{formatDate(d.StartDate)}</td>
                        <td>{d.DrugInstruction?.Description || d.Notes || '—'}</td>
                      </tr>
                    ))}
                  </SimpleTable>
                </div>
              );
            })}
          </div>
        )}
      </PanelSection>
    </div>
  );
};
