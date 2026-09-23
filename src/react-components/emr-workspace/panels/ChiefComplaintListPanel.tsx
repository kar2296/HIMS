/**
 * CHIEF COMPLAINT panel (EMR panel type emr.cn.chiefcomplaint) -- coded chief complaints from the
 * Chief Complaint master. These also decide which HPI / ROS / PE questions appear (see QuestionSectionPanel).
 * Same data as the legacy cn-chiefcomplaint-section.js:
 *
 *   search : clinicalmaster/chiefcomplaint/GetChiefComplaints        (Key 3 = active 2, Key 1 = text)
 *   list   : emr/PatientChiefComplaint/GetPatientChiefComplaints     (Key 2 = PatientId, 3 = EncounterId, 4 = ConsultationId)
 *   add    : emr/PatientChiefComplaint/ManagePatientChiefComplaints  { Data: [...] }
 *   delete : emr/PatientChiefComplaint/DeletePatientChiefComplaint   { Id }
 */
import React, { useCallback, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { ConfirmModal } from '../../ConfirmModal';
import { SkeletonRows } from '../../../components/ui/Loading';
import { spacing } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { formatDate } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, SimpleTable } from '../EmrUi';
import { SearchPicker } from '../SearchPicker';

interface ChiefComplaintMaster {
  Id: number;
  Code?: string;
  ChiefComplaint: string;
  Description?: string;
}

interface PatientChiefComplaint {
  Id: number;
  ChiefComplaintId: number;
  ChiefComplaint?: string;
  StartDate?: string;
  Comments?: string;
  PatientChiefComplaintStatus?: { Description?: string };
}

export const ChiefComplaintListPanel: React.FC<EmrPanelProps> = ({ context, canEdit, onDataChanged }) => {
  const [pendingDelete, setPendingDelete] = useState<PatientChiefComplaint | null>(null);
  const [adding, setAdding] = useState(false);

  const fetcher = useCallback(async (): Promise<PatientChiefComplaint[]> => {
    if (!context.consultationId && !context.encounterId) return [];
    const params: { Key: number; Value: any }[] = [
      { Key: 2, Value: context.patientId },
      { Key: 3, Value: context.encounterId },
    ];
    if (context.consultationId) params.push({ Key: 4, Value: context.consultationId });
    const res = await apiFetch('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: params, PageContext: { PageSize: 100, PageNumber: 1 } });
    return res?.Data || [];
  }, [context.patientId, context.encounterId, context.consultationId]);
  const { data: items, loading, error, reload } = useAsyncData<PatientChiefComplaint[]>(fetcher, [], { errorMessage: 'Could not load chief complaints.' });

  const add = async (cc: ChiefComplaintMaster) => {
    if (items.some((i) => i.ChiefComplaintId === cc.Id)) {
      alert.showInfoMsg(`${cc.ChiefComplaint} is already added.`);
      return;
    }
    setAdding(true);
    try {
      await apiFetch('emr/PatientChiefComplaint/ManagePatientChiefComplaints', {
        Data: [
          {
            PatientId: context.patientId,
            EncounterId: context.encounterId,
            ConsultationId: context.consultationId ?? undefined,
            ChiefComplaintId: cc.Id,
            ChiefComplaint: cc.ChiefComplaint,
            Description: cc.Description,
            StartDate: new Date(),
            PatientChiefComplaintStatusId: 1,
          },
        ],
      });
      alert.showSuccessMsg('Chief complaint added');
      reload();
      onDataChanged?.('chiefcomplaint');
    } catch {
      /* toasted */
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    try {
      await apiFetch('emr/PatientChiefComplaint/DeletePatientChiefComplaint', { Id: target.Id });
      alert.showSuccessMsg('Chief complaint removed');
      reload();
      onDataChanged?.('chiefcomplaint');
    } catch {
      /* toasted */
    }
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <PanelSection title="Add chief complaint" icon="fa-solid fa-comment-medical" allowOverflow>
        <div style={{ maxWidth: 560 }}>
          <SearchPicker<ChiefComplaintMaster>
            id="emrws-cc-search"
            label="Chief complaint"
            placeholder={adding ? 'Adding…' : 'Search e.g. “ear pain”, “fever”'}
            action="clinicalmaster/chiefcomplaint/GetChiefComplaints"
            buildRequest={(q) => ({ Params: [{ Key: 3, Value: 2 }, { Key: 1, Value: q }], PageContext: { PageSize: 25, PageNumber: 1 } })}
            codeOf={(x) => x.Code}
            labelOf={(x) => x.ChiefComplaint}
            keyOf={(x) => x.Id}
            onPick={add}
            disabled={!canEdit || adding}
          />
        </div>
      </PanelSection>
      <PanelSection title={`Chief complaints${items.length ? ` (${items.length})` : ''}`} icon="fa-solid fa-list" flush>
        {loading ? (
          <div style={{ padding: spacing.lg }}>
            <SkeletonRows rows={2} columns={4} />
          </div>
        ) : error ? (
          <div style={{ padding: spacing.lg }}>
            <InlineNotice tone="danger">{error}</InlineNotice>
          </div>
        ) : (
          <SimpleTable headers={['Chief complaint', 'Since', 'Status', '']} empty={items.length === 0} emptyText="No chief complaint recorded">
            {items.map((i) => (
              <tr key={i.Id}>
                <td style={{ fontWeight: 600 }}>{i.ChiefComplaint || '—'}</td>
                <td>{formatDate(i.StartDate)}</td>
                <td>{i.PatientChiefComplaintStatus?.Description || 'Active'}</td>
                <td style={{ textAlign: 'right' }}>
                  <Button size="xs" variant="icon" icon="fa-solid fa-trash" aria-label={`Remove ${i.ChiefComplaint || 'chief complaint'}`} title="Remove" disabled={!canEdit} onClick={() => setPendingDelete(i)} />
                </td>
              </tr>
            ))}
          </SimpleTable>
        )}
      </PanelSection>
      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Remove chief complaint"
        message={`Remove “${pendingDelete?.ChiefComplaint || ''}” from this visit?`}
        yesLabel="Remove"
        noLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
