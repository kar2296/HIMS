/**
 * The spec's global-component checklist calls for a "ConfirmationDialog."
 * The app already has a full-featured, working confirmation modal at
 * `src/react-components/ConfirmModal.tsx` (used across already-migrated
 * screens for delete/cancel confirmations). Per the "Existing Logic + New
 * Presentation, not New UI + Rewritten Logic" rule, we do NOT rebuild a
 * second confirmation dialog -- we just re-export the existing one under
 * the design-system's naming so new/retrofitted screens have one obvious
 * import path, and ConfirmModal.tsx itself is left untouched.
 */
export { ConfirmModal as ConfirmationDialog } from '../../react-components/ConfirmModal';
export type { ConfirmModalProps as ConfirmationDialogProps } from '../../react-components/ConfirmModal';
