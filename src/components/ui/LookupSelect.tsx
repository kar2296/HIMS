import React, { useMemo } from 'react';
import { Select } from './Select';
import type { SelectOption } from './Select';

/** The shape every HIMS `General/Options/getoptions` lookup array uses. */
export interface LookupItem {
  Id: number;
  Text?: string;
  Title?: { Description?: string };
  [key: string]: any;
}

export interface LookupSelectProps {
  /** Raw lookup array straight off $scope.lookup.<Key> -- no reshaping by the caller. */
  options?: LookupItem[] | null;
  /** Current id, straight off the Angular scope model. */
  value?: number | string | null;
  /** Receives the numeric Id (or null when the blank option is chosen). */
  onChange?: (id: number | null) => void;
  /** Mirrors the original ui-select's ng-keyup, used by the opbilling focus chains. */
  onKeyUp?: () => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  fullWidth?: boolean;
  /**
   * Renders each option as "{Title.Description} {Text}" instead of plain Text.
   * A handful of approver lookups do this in their original
   * ui-select-choices template (with Id === -1 kept as bare Text).
   */
  titlePrefixed?: boolean;
}

/**
 * Global adapter between the app's real lookup arrays and the design-system
 * <Select>. This exists because every migrated ui-select repeats the same
 * three conversions: {Id, Text} -> {value, label}, the native select's string
 * value -> the numeric Id the Angular scope model holds, and a leading blank
 * option matching the original ui-select's cleared state.
 *
 * Purely presentational: no data source, no API call, no business logic. The
 * caller still owns the lookup array, the current value and what happens on
 * change -- exactly as before.
 *
 * The original ui-select-match truncates the selected option's text at 8 or
 * 20 characters with a trailing "..."; that is not reproduced here (a native
 * select ellipsizes on its own width), consistent with every ui-select
 * conversion done so far.
 */
export const LookupSelect: React.FC<LookupSelectProps> = ({
  options, value, onChange, onKeyUp, disabled, label, required,
  placeholder = ' ', name, id, fullWidth = true, titlePrefixed,
}) => {
  const selectOptions: SelectOption[] = useMemo(
    () =>
      (options || []).map((o) => ({
        value: o.Id,
        label:
          titlePrefixed && o.Id !== -1 && o.Title?.Description
            ? `${o.Title.Description} ${o.Text ?? ''}`
            : (o.Text ?? ''),
      })),
    [options, titlePrefixed]
  );

  return (
    <div onKeyUp={onKeyUp}>
      <Select
        options={selectOptions}
        value={value ?? ''}
        onChange={(v) => {
          const raw = typeof v === 'number' ? v : parseInt(String(v), 10);
          onChange?.(Number.isNaN(raw) ? null : raw);
        }}
        disabled={disabled}
        label={label}
        required={required}
        placeholder={placeholder}
        name={name}
        id={id}
        fullWidth={fullWidth}
      />
    </div>
  );
};
