import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

interface AutosearchOption {
  Id: number;
  [key: string]: any;
}

interface AutosearchSelectProps {
  label?: string;
  itemId?: number | null;
  api: string;
  nameField: string;
  searchKey: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onSelect: (id: number | null, name: string) => void;
}

// Generic React port of the legacy <autosearch> widget
// (public/vendor/components/autosearch.js), used by pincode-form.js's
// City/District/State/Country fields. Behavior deliberately mirrors the
// original exactly:
//  - resolving the current itemId to its display name via a by-id lookup
//    against the same real master API (Key 0 = id) -- same as autosearch.js's
//    $watch('cvm.itemid', ...) calling cvm.searchItem(newValue, true)
//    whenever itemid becomes truthy.
//  - a free-text search dropdown against the same API (searchKey = the
//    field's real query Key from the original presearch* functions), only
//    once more than 2 characters are typed -- same >2-character threshold.
//  - deliberately INDEPENDENT per field, no cross-field cascading -- the
//    real autosearch configs for City/District/State/Country in
//    pincode-form.js never filtered by each other's current selection
//    either (unlike the CityControl/StateControl/etc. components used
//    elsewhere for cascading address pickers, which would be a real
//    functionality change if reused here).
export const AutosearchSelect: React.FC<AutosearchSelectProps> = ({
  label, itemId, api, nameField, searchKey, placeholder, required, disabled, onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<AutosearchOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedForId, setResolvedForId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (itemId && itemId >= 1 && itemId !== resolvedForId) {
      setLoading(true);
      apiFetch(api, { Params: [{ Key: 0, Value: itemId }], PageContext: { PageSize: -1, PageNumber: 1 } })
        .then((res) => {
          if (!isMounted) return;
          const match = res && res.Data && res.Data[0];
          if (match) {
            setQuery(match[nameField] || '');
            setResolvedForId(itemId);
          }
        })
        .catch((err) => console.error('AutosearchSelect: failed to resolve ' + nameField, err))
        .finally(() => { if (isMounted) setLoading(false); });
    } else if (!itemId) {
      setQuery('');
      setResolvedForId(null);
    }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, api, nameField]);

  const runSearch = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text || text.length <= 2) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      apiFetch(api, { Params: [{ Key: searchKey, Value: text }], PageContext: { PageSize: -1, PageNumber: 1 } })
        .then((res) => setOptions((res && res.Data) || []))
        .catch((err) => console.error('AutosearchSelect: failed to search ' + nameField, err))
        .finally(() => setLoading(false));
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);
    setResolvedForId(null);
    if (!value) onSelect(null, '');
    runSearch(value);
  };

  const handlePick = (opt: AutosearchOption) => {
    setQuery(opt[nameField] || '');
    setOptions([]);
    setOpen(false);
    setResolvedForId(opt.Id);
    onSelect(opt.Id, opt[nameField] || '');
  };

  const labelStyle: React.CSSProperties = {
    ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block',
  };

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label style={labelStyle}>
          {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder || (loading ? 'Loading...' : 'Type to search')}
        onChange={handleChange}
        onFocus={() => { if (options.length) setOpen(true); }}
        onBlur={() => { blurTimerRef.current = setTimeout(() => setOpen(false), 150); }}
        style={{
          width: '100%', height: '34px', fontSize: '13px', padding: '0 12px',
          fontFamily: typography.fontFamily, color: colors.textMain,
          backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
          border: `1px solid ${colors.border}`, borderRadius: radii.sm, outline: 'none', boxSizing: 'border-box',
        }}
      />
      {open && options.length > 0 && (
        <ul style={{
          position: 'absolute', zIndex: 20, left: 0, right: 0, marginTop: 2,
          maxHeight: 220, overflowY: 'auto', backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`, borderRadius: radii.sm,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', listStyle: 'none', padding: 0,
        }}>
          {options.map((opt) => (
            <li
              key={opt.Id}
              onMouseDown={(e) => { e.preventDefault(); handlePick(opt); }}
              style={{ padding: '6px 12px', fontSize: '13px', fontFamily: typography.fontFamily, color: colors.textMain, cursor: 'pointer' }}
            >
              {opt[nameField]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
