/**
 * Shared pieces for the EMR Workspace history forms (past medical, surgical, family, social):
 * a single-choice button group, a picked-item card and the form shell (helpers: historyFormUtils.ts).
 */
import React from 'react';
import { Button } from '../../Button';
import { Modal } from '../../../components/ui/Modal';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { LookupItem } from '../types';
import { InlineNotice } from '../EmrUi';

export const FieldError: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) =>
  show ? <div style={{ ...typography.caption, color: colors.dangerText, marginTop: 6 }}>{children}</div> : null;

export const FieldLabel: React.FC<{ required?: boolean; children: React.ReactNode }> = ({ required, children }) => (
  <span style={{ ...typography.label, color: colors.textBody }}>
    {children} {required && <span style={{ color: colors.danger }} aria-hidden="true">*</span>}
  </span>
);

/** Single-choice button group -- clearer and faster than a dropdown for short reference lists. */
export const ChoiceButtons: React.FC<{
  label: string;
  required?: boolean;
  options: LookupItem[];
  value?: number | null;
  onChange: (id: number) => void;
  error?: string;
  emptyText?: string;
}> = ({ label, required, options, value, onChange, error, emptyText }) => (
  <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
    <legend style={{ padding: 0, marginBottom: 6 }}>
      <FieldLabel required={required}>{label}</FieldLabel>
    </legend>
    {options.length === 0 ? (
      <InlineNotice tone="warning">{emptyText || `No values are set up for ${label.toLowerCase()}.`}</InlineNotice>
    ) : (
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const on = value === o.Id;
          return (
            <button
              key={o.Id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.Id)}
              style={{
                padding: '6px 14px', borderRadius: radii.full, cursor: 'pointer', font: `600 13px/1.3 ${typography.fontFamily}`,
                border: `1px solid ${on ? colors.primary : colors.borderStrong}`,
                background: on ? colors.primary : colors.surface, color: on ? '#fff' : colors.textBody,
              }}
            >
              {o.Text}
            </button>
          );
        })}
      </div>
    )}
    <FieldError show={Boolean(error)}>{error}</FieldError>
  </fieldset>
);

/** The chosen master item (ICD / procedure) with a "Change" action. */
export const PickedCard: React.FC<{ code?: string; name?: string; onChange: () => void; changeLabel: string }> = ({ code, name, onChange, changeLabel }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: spacing.md, padding: '10px 12px',
      border: `1px solid ${colors.primaryMid}`, background: colors.primaryLight, borderRadius: radii.md,
    }}
  >
    {code && <span style={{ fontFamily: typography.fontFamilyMono, fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap' }}>{code}</span>}
    <span style={{ ...typography.body, fontWeight: 600, color: colors.textMain, flex: 1, minWidth: 0 }}>{name}</span>
    <Button size="xs" variant="link" onClick={onChange} aria-label={changeLabel}>
      Change
    </Button>
  </div>
);

/** Modal shell shared by the history forms (rendered in document.body -- see Modal `portal`). */
export const HistoryFormShell: React.FC<{
  title: string;
  saveLabel: string;
  loading: boolean;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}> = ({ title, saveLabel, loading, saving, error, onClose, onSave, children }) => (
  <Modal
    isOpen
    portal
    title={title}
    onClose={onClose}
    width="680px"
    footer={
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        <Button variant="outline-secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" icon="fa-solid fa-floppy-disk" onClick={onSave} loading={saving} loadingText="Saving…" disabled={loading}>
          {saveLabel}
        </Button>
      </div>
    }
  >
    {loading ? (
      <div style={{ padding: spacing.lg, ...typography.body, color: colors.textMuted }}>Loading…</div>
    ) : (
      <div style={{ display: 'grid', gap: spacing.lg }}>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        {children}
      </div>
    )}
  </Modal>
);

/** Two-column row that stacks on narrow screens. */
export const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md, alignItems: 'start' }}>{children}</div>
);
