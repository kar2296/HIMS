/**
 * Draft + auto-save for EMR panels and forms.
 *
 * 1. Local draft: every change is kept on this device (localStorage) per user + visit entry + panel,
 *    so a reload, a crash, closing the app or switching panels never loses what was typed. When the
 *    panel opens again the draft is restored (or offered, if the saved record changed since).
 * 2. Server auto-save (optional): panels whose save updates the same record pass `autoSave`; it runs
 *    silently after the user pauses, when the panel is left and when the app goes to the background --
 *    only when `canAutoSave` (e.g. required fields filled). No pop-ups; the status line shows progress.
 *
 * The draft is removed once the server copy matches (after a manual or automatic save).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type DraftStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface StoredDraft<T> {
  data: T;
  /** Serialized baseline the draft was made on top of (detects newer server data). */
  base: string;
  at: number;
}

export interface UseEmrDraftOptions<T> {
  /** Unique per user + visit entry + panel (+ record). null switches drafts and auto-save off. */
  storageKey: string | null;
  /** Current form state (only the user-entered parts; no server ids). */
  value: T;
  /** Same shape, as last loaded from / saved to the server. undefined until loaded. */
  baseline: T | undefined;
  /** Put a restored draft back into the form. */
  onRestore: (draft: T) => void;
  /** Silent server save. Resolve true when saved (and update `baseline`). Omit for local drafts only. */
  autoSave?: () => Promise<boolean>;
  /** Auto-save to the server only when true (e.g. required fields present). */
  canAutoSave?: boolean;
  /** Pause after the last change before a server auto-save. */
  delayMs?: number;
}

export interface UseEmrDraftResult<T> {
  status: DraftStatus;
  /** Time of the last successful auto-save. */
  savedAt: number | null;
  /** Set when a draft was restored into the form. */
  restoredAt: number | null;
  /** A draft older than the current saved record (not restored automatically). */
  staleDraft: StoredDraft<T> | null;
  restoreStaleDraft: () => void;
  /** Throw away the local draft and go back to the saved record. */
  discardDraft: () => void;
  dismissRestored: () => void;
  /** Forget the draft without touching the form (call after a successful save that closes the form). */
  clearDraft: () => void;
}

const PREFIX = 'hims-emr-draft:';
const DRAFT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // drafts older than two weeks are dropped

const ser = (v: unknown) => {
  try {
    return JSON.stringify(v) ?? '';
  } catch {
    return '';
  }
};
function readDraft<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const d = JSON.parse(raw) as StoredDraft<T>;
    if (!d || typeof d.at !== 'number' || Date.now() - d.at > DRAFT_TTL_MS) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return d;
  } catch {
    return null;
  }
}
function writeDraft<T>(key: string, d: StoredDraft<T>) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(d));
  } catch {
    /* storage full or blocked: drafts are best effort */
  }
}
function removeDraft(key: string) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** Builds a draft key; returns null when any part is missing (drafts off). */
export const draftKey = (...parts: Array<string | number | null | undefined>): string | null =>
  parts.every((p) => p !== null && p !== undefined && p !== '' && p !== 0) ? parts.join(':') : null;

export function useEmrDraft<T>({ storageKey, value, baseline, onRestore, autoSave, canAutoSave = false, delayMs = 4000 }: UseEmrDraftOptions<T>): UseEmrDraftResult<T> {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const [staleDraft, setStaleDraft] = useState<StoredDraft<T> | null>(null);
  /** Key whose stored draft has been checked (restore happens once per key). */
  const [checkedKey, setCheckedKey] = useState<string | null>(null);

  const valueSer = ser(value);
  const baseSer = baseline === undefined ? null : ser(baseline);
  const dirty = baseSer !== null && valueSer !== baseSer;

  // 1) Once the saved record is loaded, bring back this key's draft. Done while rendering (React's
  //    "adjust state when props change" pattern): onRestore only updates the calling component's state.
  if (storageKey && baseSer !== null && checkedKey !== storageKey) {
    setCheckedKey(storageKey);
    setStaleDraft(null);
    setRestoredAt(null);
    const d = readDraft<T>(storageKey);
    if (d && ser(d.data) !== baseSer) {
      if (d.base === baseSer) {
        onRestore(d.data);
        setRestoredAt(d.at);
      } else {
        setStaleDraft(d); // saved record changed after this draft: let the user decide
      }
    }
  }
  const ready = storageKey !== null && checkedKey === storageKey && baseSer !== null;

  // 2) Keep the stored draft in step with the form (nothing stored when it matches the saved record).
  useEffect(() => {
    if (!ready || !storageKey || baseSer === null) return;
    if (!dirty) {
      removeDraft(storageKey);
      return;
    }
    const t = window.setTimeout(() => writeDraft(storageKey, { data: JSON.parse(valueSer), base: baseSer, at: Date.now() }), 400);
    return () => window.clearTimeout(t);
  }, [ready, storageKey, valueSer, baseSer, dirty]);

  // Latest values for timers / unmount / visibility handlers.
  const live = useRef({ dirty, canAutoSave, autoSave, ready });
  useEffect(() => {
    live.current = { dirty, canAutoSave, autoSave, ready };
  });
  const inFlight = useRef(false);

  const runAutoSave = useCallback(async () => {
    const { dirty: d, canAutoSave: ok, autoSave: fn, ready: r } = live.current;
    if (!r || !d || !ok || !fn || inFlight.current) return;
    inFlight.current = true;
    setSaveState('saving');
    try {
      const saved = await fn();
      setSaveState(saved ? 'saved' : 'error');
      if (saved) setSavedAt(Date.now());
    } catch {
      setSaveState('error');
    } finally {
      inFlight.current = false;
    }
  }, []);

  // 3) Server auto-save after a pause in typing.
  useEffect(() => {
    if (!ready || !autoSave || !dirty || !canAutoSave) return;
    const t = window.setTimeout(runAutoSave, delayMs);
    return () => window.clearTimeout(t);
  }, [ready, autoSave, dirty, canAutoSave, valueSer, delayMs, runAutoSave]);

  // 4) ...and right away when the app goes to the background or the panel/form closes.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void runAutoSave();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      void runAutoSave();
    };
  }, [runAutoSave]);

  const discardDraft = useCallback(() => {
    if (storageKey) removeDraft(storageKey);
    setStaleDraft(null);
    setRestoredAt(null);
    setSaveState('idle');
    if (baseline !== undefined) onRestore(baseline);
  }, [storageKey, baseline, onRestore]);

  const restoreStaleDraft = useCallback(() => {
    if (!staleDraft) return;
    onRestore(staleDraft.data);
    setRestoredAt(staleDraft.at);
    setStaleDraft(null);
  }, [staleDraft, onRestore]);

  const dismissRestored = useCallback(() => setRestoredAt(null), []);

  const clearDraft = useCallback(() => {
    if (storageKey) removeDraft(storageKey);
    setStaleDraft(null);
    setRestoredAt(null);
    setSaveState('idle');
  }, [storageKey]);

  const status: DraftStatus =
    saveState === 'saving' ? 'saving' : dirty ? (saveState === 'error' ? 'error' : 'unsaved') : saveState === 'saved' ? 'saved' : 'idle';

  return {
    status,
    savedAt,
    // The "restored" note only matters while the restored text is still unsaved.
    restoredAt: dirty ? restoredAt : null,
    staleDraft,
    restoreStaleDraft,
    discardDraft,
    dismissRestored,
    clearDraft,
  };
}
