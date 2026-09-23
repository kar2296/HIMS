/**
 * Debounced type-ahead picker over any existing master "Get…s" endpoint
 * (ICD diagnoses, CPT procedures, chief complaints, drugs…).
 * The caller supplies how to build the request and how to label a result.
 */
import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Input } from '../../components/ui/Input';
import { colors, radii, shadows, spacing, typography } from '../../components/ui/tokens';

export interface SearchPickerProps<T> {
  label?: string;
  placeholder?: string;
  /** API action, e.g. 'clinicalmaster/diagnosis/GetDiagnosiss'. */
  action: string;
  /** Builds the request body for a search text. */
  buildRequest: (text: string) => Record<string, any>;
  /** Short code shown in monospace before the label (optional). */
  codeOf?: (item: T) => string | undefined;
  labelOf: (item: T) => string;
  keyOf: (item: T) => React.Key;
  onPick: (item: T) => void;
  disabled?: boolean;
  minChars?: number;
  /** Clear the box after a pick (list-style pickers) instead of showing the picked label. */
  clearOnPick?: boolean;
  id?: string;
}

export function SearchPicker<T>({
  label,
  placeholder,
  action,
  buildRequest,
  codeOf,
  labelOf,
  keyOf,
  onPick,
  disabled,
  minChars = 3,
  clearOnPick = true,
  id,
}: SearchPickerProps<T>) {
  const [text, setText] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const seq = useRef(0);
  // Keep the latest request builder without re-running the effect on every render.
  const buildRef = useRef(buildRequest);
  useEffect(() => {
    buildRef.current = buildRequest;
  });

  const query = text.trim();
  const canSearch = !picked && query.length >= minChars;

  useEffect(() => {
    if (!canSearch) return;
    const mySeq = ++seq.current;
    const timer = window.setTimeout(() => {
      apiFetch(action, buildRef.current(query))
        .then((res) => {
          if (mySeq === seq.current) setResults(res?.Data || []);
        })
        .catch(() => {
          if (mySeq === seq.current) setResults([]);
        })
        .finally(() => {
          if (mySeq === seq.current) setSearching(false);
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [action, canSearch, query]);

  const listId = `${id || 'emrws-picker'}-results`;

  return (
    <div style={{ position: 'relative' }}>
      <Input
        id={id}
        label={label}
        leftIcon="fa-solid fa-magnifying-glass"
        placeholder={placeholder || `Type at least ${minChars} characters`}
        value={text}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && canSearch}
        aria-controls={listId}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setPicked(false);
          setText(e.target.value);
          setOpen(true);
          setSearching(e.target.value.trim().length >= minChars);
        }}
      />
      {open && canSearch && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            maxHeight: 280,
            overflowY: 'auto',
            listStyle: 'none',
            padding: 4,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            boxShadow: shadows.lg,
          }}
        >
          {searching && <li style={{ padding: spacing.sm, color: colors.textSubtle, ...typography.body }}>Searching…</li>}
          {!searching && results.length === 0 && <li style={{ padding: spacing.sm, color: colors.textSubtle, ...typography.body }}>No matches</li>}
          {!searching &&
            results.map((item) => (
              <li key={keyOf(item)} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="emrws-option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPick(item);
                    setOpen(false);
                    if (clearOnPick) {
                      setText('');
                    } else {
                      setText(labelOf(item));
                      setPicked(true);
                    }
                  }}
                >
                  {codeOf?.(item) && <span style={{ fontFamily: typography.fontFamilyMono, fontWeight: 600, color: colors.primary, minWidth: 70 }}>{codeOf(item)}</span>}
                  <span>{labelOf(item)}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
