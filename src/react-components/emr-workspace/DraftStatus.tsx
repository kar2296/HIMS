/**
 * Status line + banners for useEmrDraft: "Draft · not saved yet", "Saving…", "Auto-saved 10:33",
 * "Draft restored" (with Discard) and "older draft found" (Restore / Discard).
 */
import React from 'react';
import { Button } from '../Button';
import { colors, spacing, typography } from '../../components/ui/tokens';
import { InlineNotice } from './EmrUi';
import type { UseEmrDraftResult } from './useEmrDraft';

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const DraftStatusChip: React.FC<{ draft: UseEmrDraftResult<unknown>; serverAutoSave: boolean }> = ({ draft, serverAutoSave }) => {
  const { status, savedAt } = draft;
  let icon = '';
  let text = '';
  let color: string = colors.textMuted;
  if (status === 'saving') {
    icon = 'fa-solid fa-circle-notch fa-spin';
    text = 'Saving…';
  } else if (status === 'unsaved') {
    icon = 'fa-solid fa-circle';
    text = serverAutoSave ? 'Draft · saving when you pause' : 'Draft kept on this device · not saved yet';
    color = colors.warningText;
  } else if (status === 'error') {
    icon = 'fa-solid fa-triangle-exclamation';
    text = 'Auto-save failed · use Save';
    color = colors.dangerText;
  } else if (status === 'saved' && savedAt) {
    icon = 'fa-solid fa-circle-check';
    text = `Auto-saved ${time(savedAt)}`;
    color = colors.successText;
  }
  if (!text) return null;
  return (
    <span role="status" aria-live="polite" style={{ ...typography.caption, color, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <i className={icon} style={{ fontSize: status === 'unsaved' ? 7 : 12 }} aria-hidden="true" />
      {text}
    </span>
  );
};

export const DraftBanners: React.FC<{ draft: UseEmrDraftResult<unknown> }> = ({ draft }) => {
  const { restoredAt, staleDraft, discardDraft, restoreStaleDraft, dismissRestored } = draft;
  if (staleDraft) {
    return (
      <InlineNotice tone="warning">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
          <span style={{ flex: '1 1 240px' }}>
            You have an unsaved draft from {time(staleDraft.at)}, made before this record was last saved.
          </span>
          <Button size="xs" variant="outline-primary" onClick={restoreStaleDraft}>
            Restore draft
          </Button>
          <Button size="xs" variant="link" onClick={discardDraft}>
            Discard
          </Button>
        </div>
      </InlineNotice>
    );
  }
  if (restoredAt) {
    return (
      <InlineNotice tone="info">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
          <span style={{ flex: '1 1 240px' }}>Your unsaved draft from {time(restoredAt)} was restored.</span>
          <Button size="xs" variant="link" onClick={discardDraft}>
            Discard draft
          </Button>
          <Button size="xs" variant="link" onClick={dismissRestored} aria-label="Hide this message">
            OK
          </Button>
        </div>
      </InlineNotice>
    );
  }
  return null;
};
