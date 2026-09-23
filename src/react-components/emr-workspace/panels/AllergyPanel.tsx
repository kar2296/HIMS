/**
 * ALLERGY panel (EMR panel type emr.cn.allergy) -- also embedded at the bottom of the Vitals tab.
 *
 *   list          : emr/patientallergy/GetPatientAllergys  (Key 2 = PatientId, Key 4 = status 1 active)
 *   add / edit    : the existing allergy form (modal "patientemr.patientallergy") -- it already
 *                   handles the drug / food / substance master search, reactions and severity.
 *   NKA           : "No known allergies" is recorded the same way the legacy form does (an allergy row
 *                   named "NKA"), so it prints and alerts consistently.
 */
import React, { useCallback, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { SkeletonRows } from '../../../components/ui/Loading';
import { spacing } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { formatDate } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from '../EmrUi';

interface AllergyRow {
  Id: number;
  AllergyName?: string;
  StartDate?: string;
  Symptom?: string;
  AllergyType?: { Description?: string };
  AllergySeverity?: { Description?: string };
  PatientAllergyStatus?: { Description?: string };
  Comments?: string;
}

type AllergyListProps = Pick<EmrPanelProps, 'context' | 'canEdit' | 'openLegacyModal' | 'onDataChanged'>;

/** The allergy table with Add / Edit / NKA actions (no outer tab chrome). */
export const AllergyList: React.FC<AllergyListProps> = ({ context, canEdit, openLegacyModal, onDataChanged }) => {
  const [markingNka, setMarkingNka] = useState(false);

  const fetcher = useCallback(async (): Promise<AllergyRow[]> => {
    const res = await apiFetch('emr/patientallergy/GetPatientAllergys', {
      Params: [
        { Key: 2, Value: context.patientId },
        { Key: 4, Value: 1 },
      ],
      PageContext: { PageSize: 100, PageNumber: 1 },
    });
    return res?.Data || [];
  }, [context.patientId]);
  const { data: allergies, loading, error, reload } = useAsyncData<AllergyRow[]>(fetcher, [], { errorMessage: 'Could not load allergies.' });

  const changed = () => {
    reload();
    onDataChanged?.('allergies');
  };

  const openForm = (id = 0) => {
    openLegacyModal?.('patientemr.patientallergy', { id, pid: context.patientId, cid: context.consultationId }, changed);
  };

  const hasRealAllergy = allergies.some((a) => (a.AllergyName || '').trim().toUpperCase() !== 'NKA');
  const hasNka = allergies.some((a) => (a.AllergyName || '').trim().toUpperCase() === 'NKA');

  const markNka = async () => {
    setMarkingNka(true);
    try {
      await apiFetch('emr/patientallergy/ManagePatientAllergys', {
        Data: [
          {
            PatientId: context.patientId,
            EncounterId: context.encounterId,
            ConsultationId: context.consultationId ?? undefined,
            AllergyName: 'NKA',
            Description: 'No known allergies',
            StartDate: new Date(),
            PatientAllergyStatusId: 1,
            PerformedBy: context.userId,
            PerformedDate: new Date(),
            Status: 1,
          },
        ],
      });
      alert.showSuccessMsg('Recorded: no known allergies');
      changed();
    } catch {
      /* server error already toasted */
    } finally {
      setMarkingNka(false);
    }
  };

  return (
    <PanelSection
      title="Allergies"
      icon="fa-solid fa-triangle-exclamation"
      flush
      actions={
        <>
          {!hasRealAllergy && !hasNka && (
            <Button size="sm" variant="outline-secondary" onClick={markNka} loading={markingNka} loadingText="Saving…" disabled={!canEdit} title="Record that the patient has no known allergies">
              NKA
            </Button>
          )}
          <Button size="sm" variant="outline-primary" icon="fa-solid fa-plus" onClick={() => openForm(0)} disabled={!canEdit || !openLegacyModal}>
            Add allergy
          </Button>
        </>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg }}>
          <SkeletonRows rows={2} columns={4} />
        </div>
      ) : error ? (
        <div style={{ padding: spacing.lg }}>
          <InlineNotice tone="danger">{error}</InlineNotice>
        </div>
      ) : (
        <SimpleTable headers={['Allergy', 'Type', 'Reaction', 'Severity', 'Since', 'Status', '']} empty={allergies.length === 0} emptyText="No allergies recorded — use NKA if the patient has none">
          {allergies.map((a) => (
            <tr key={a.Id}>
              <td style={{ fontWeight: 600 }}>{a.AllergyName || '—'}</td>
              <td>{a.AllergyType?.Description || '—'}</td>
              <td>{a.Symptom || '—'}</td>
              <td>{a.AllergySeverity?.Description || '—'}</td>
              <td>{formatDate(a.StartDate)}</td>
              <td>{a.PatientAllergyStatus?.Description || 'Active'}</td>
              <td style={{ textAlign: 'right' }}>
                <Button size="xs" variant="icon" icon="fa-solid fa-pen" title="Edit allergy" aria-label={`Edit ${a.AllergyName || 'allergy'}`} disabled={!canEdit} onClick={() => openForm(a.Id)} />
              </td>
            </tr>
          ))}
        </SimpleTable>
      )}
    </PanelSection>
  );
};

export const AllergyPanel: React.FC<EmrPanelProps> = (props) => <AllergyList {...props} />;
