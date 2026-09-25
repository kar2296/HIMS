/**
 * The "Visit entry" bar above the tabs: EMR form group, start time, status and the
 * Save / Complete / Finalize / End consultation / Print actions -- or, when no visit entry exists yet,
 * the form picker with "Start visit entry".
 */
import React from 'react';
import { Button } from '../Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, typography } from '../../components/ui/tokens';
import type { ConsultationInfo, ProfileInfo } from './types';
import { formatDateTime, STATUS, statusLabel } from './emrHelpers';

interface VisitEntryToolbarProps {
  hasEncounter: boolean;
  loading: boolean;
  consultations: ConsultationInfo[];
  active: ConsultationInfo | null;
  profiles: ProfileInfo[];
  /** Explains whose assigned forms are listed (shown with the form picker). */
  formsNote?: string;
  selectedProfileId: number | '';
  onSelectProfile: (id: number) => void;
  onStart: () => void;
  starting: boolean;
  onSwitch: (id: number) => void;
  onNewEntry: () => void;
  activeTabLabel: string;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  busyAction: 'complete' | 'finalize' | null;
  onComplete: () => void;
  onFinalize: () => void;
  onEndConsultation?: () => void;
  onPrint?: () => void;
  onReviewNotes?: () => void;
  /** Copy complaints, diagnoses, medicines and tests from an earlier visit. */
  onCopyFromPrevious?: () => void;
  /** Shown while choosing a form for an additional entry. */
  onCancelStart?: () => void;
}

export const VisitEntryToolbar: React.FC<VisitEntryToolbarProps> = (p) => {
  const statusId = p.active?.ProgressNoteStatusId || STATUS.DRAFT;
  const finalized = statusId >= STATUS.FINALIZED;

  if (!p.hasEncounter) return null;

  if (!p.active) {
    return (
      <div className="emrws-toolbar emrws-start" aria-busy={p.loading}>
        <div className="emrws-toolbar-group" style={{ flex: 1, minWidth: 260 }}>
          <div style={{ width: 'min(360px, 100%)' }}>
            <Select
              label="EMR form group"
              options={p.profiles.map((pr) => ({ value: pr.Id, label: pr.Name }))}
              value={p.selectedProfileId}
              placeholder={p.loading ? 'Loading forms…' : p.profiles.length ? 'Select EMR form' : 'No EMR forms configured'}
              disabled={p.loading || p.profiles.length === 0}
              onChange={(v) => p.onSelectProfile(Number(v))}
            />
          </div>
          <span style={{ ...typography.caption, color: colors.textMuted, alignSelf: 'end', paddingBottom: 8 }}>
            {p.profiles.length === 0 && !p.loading
              ? 'Using the standard panels below. Create EMR forms in EMR Form Builder.'
              : p.formsNote || 'Start a visit entry to use the EMR form’s panels.'}
          </span>
        </div>
        <div className="emrws-toolbar-group" style={{ alignSelf: 'end' }}>
          {p.onCancelStart && (
            <Button variant="outline-secondary" onClick={p.onCancelStart}>
              Cancel
            </Button>
          )}
          <Button variant="primary" icon="fa-solid fa-play" onClick={p.onStart} loading={p.starting} loadingText="Starting…" disabled={!p.selectedProfileId || p.loading}>
            Start visit entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="emrws-toolbar">
      <div className="emrws-toolbar-group">
        <div>
          <div style={{ ...typography.labelSm, color: colors.textSubtle }}>EMR form group</div>
          {p.consultations.length > 1 ? (
            <select
              className="emrws-inline-select"
              aria-label="Visit entry"
              value={p.active.Id}
              onChange={(e) => p.onSwitch(Number(e.target.value))}
            >
              {p.consultations.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {(c.ProfileMaster?.Name || c.Name || 'Visit entry') + ' · ' + formatDateTime(c.CreatedAt)}
                </option>
              ))}
            </select>
          ) : (
            <strong style={{ ...typography.body, fontWeight: 700 }}>{p.active.ProfileMaster?.Name || p.active.Name || 'Visit entry'}</strong>
          )}
        </div>
        <div>
          <div style={{ ...typography.labelSm, color: colors.textSubtle }}>Started</div>
          <span style={{ ...typography.body }}>{formatDateTime(p.active.CreatedAt)}</span>
        </div>
        <Badge tone={finalized ? 'success' : statusId === STATUS.COMPLETED ? 'info' : 'warning'}>{statusLabel(p.active)}</Badge>
        {p.active.ReferenceNo && <span style={{ ...typography.caption, color: colors.textMuted }}>Ref {p.active.ReferenceNo}</span>}
        <Button size="xs" variant="link" icon="fa-solid fa-plus" onClick={p.onNewEntry} title="Start another visit entry with a different EMR form">
          New entry
        </Button>
      </div>
      <div className="emrws-toolbar-group" style={{ gap: spacing.sm }}>
        {p.onCopyFromPrevious && (
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-copy" onClick={p.onCopyFromPrevious} title="Copy complaints, diagnoses, medicines and tests from an earlier visit">
            Copy from previous visit
          </Button>
        )}
        {p.onReviewNotes && (
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-magnifying-glass" onClick={p.onReviewNotes}>
            Review
          </Button>
        )}
        {p.onPrint && (
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-print" onClick={p.onPrint}>
            Print
          </Button>
        )}
        {p.onEndConsultation && (
          <Button size="sm" variant="outline-danger" icon="fa-solid fa-door-open" onClick={p.onEndConsultation} title="Check the patient out (patient tracker)">
            End consultation
          </Button>
        )}
        <Button
          size="sm"
          variant="info"
          icon="fa-solid fa-check"
          onClick={p.onComplete}
          loading={p.busyAction === 'complete'}
          loadingText="Checking…"
          disabled={statusId >= STATUS.COMPLETED || p.busyAction !== null}
          title={statusId >= STATUS.COMPLETED ? 'Already completed' : 'Mark this visit entry complete (mandatory panels are checked)'}
        >
          Complete
        </Button>
        <Button
          size="sm"
          variant="warning"
          icon="fa-solid fa-lock"
          onClick={p.onFinalize}
          loading={p.busyAction === 'finalize'}
          loadingText="Finalizing…"
          disabled={finalized || p.busyAction !== null}
          title={finalized ? 'Already finalized' : 'Lock this visit entry. Later changes need an addendum.'}
        >
          Finalize
        </Button>
        <Button
          size="sm"
          variant="success"
          icon="fa-solid fa-floppy-disk"
          onClick={p.onSave}
          loading={p.saving}
          loadingText="Saving…"
          disabled={!p.canSave || finalized}
          title={p.canSave ? `Save ${p.activeTabLabel}` : 'This panel saves from its own buttons'}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
