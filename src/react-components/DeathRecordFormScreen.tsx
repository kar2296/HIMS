import React from 'react';
import { spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from './Button';

interface DeathItem {
  DeathDate?: string;
  DeathTypeId?: number | null;
  DeathPlaceId?: number | null;
  IsDeathConfirmed?: boolean;
  DeathConfirmedBy?: number | null;
  DeathComents?: string;
  PatientStatusId?: number;
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; Title?: { Description?: string }; FirstName?: string; LastName?: string; }
interface Lookup {
  DeathType?: LookupOption[];
  DeathPlace?: LookupOption[];
  Doctor?: LookupOption[];
}

interface ReactPropsShape {
  item?: DeathItem;
  lookup?: Lookup;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
  /** patientdeathrecord-form gates Save on PatientStatusId==2; deceased-form
   * (the quickregistration variant) shows Save unconditionally. */
  showSaveOnlyWhenPatientStatus2?: boolean;
  /** patientdeathrecord-form's "created/approved" readonly fields were never
   * actually bound to anything in the original template (dead, always-empty
   * inputs) -- rendered as disabled empty inputs to match. deceased-form used
   * real <displaydate>/<displayuserlbl> directives with real values; when true,
   * this component renders nothing for that row so the Angular template can
   * place those native directives alongside it instead (REUSABLE SUB-WIDGET
   * PATTERN), preserving their real behavior rather than reproducing it. */
  readonlyFieldsAreNative?: boolean;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));
const toDoctorOptions = (items?: LookupOption[]): SelectOption[] =>
  (items || []).map((i) => ({ value: i.Id, label: [i.Title?.Description, i.FirstName, i.LastName].filter(Boolean).join(' ') }));

// ---------------------------------------------------------------------------
// Shared body for two near-identical real Angular screens:
//   - patientdeathrecord-form (app.patientdeathrecordform, modal, 6 real refs,
//     opened from fullregistration/fullregistrationtab siblings)
//   - deceased-form (app.registrarion -- real state name, typo in the source
//     -- 8 real refs, opened from the already-migrated quickregistration.js)
// Both controllers are functionally identical (getItem/saveItem/approveItem/
// reverseItem/lookups); only the Save button's visibility condition and the
// readonly audit fields differ, per the flags above. All API calls/business
// logic stay in the untouched Angular controllers; this only renders the form.
//
// Real, disclosed specifics preserved exactly, NOT fixed:
// - Both original templates' Save button calls `save()`, which neither
//   controller defines (only `saveItem`/`approveItem`/`reverseItem` exist) --
//   a real, pre-existing no-op bug. Reproduced faithfully: the Save button
//   dispatches 'save', for which there is no handler, so it silently no-ops
//   here too, exactly like the AngularJS original. Approve/Reverse are real
//   and fully wired (they call saveItem() themselves after mutating fields).
// - A future DeathDate is rejected with a real, disclosed alert (kept in the
//   untouched controller's saveItem, not reproduced here).
// - DeathConfirmedBy select is disabled unless IsDeathConfirmed is checked.
// ---------------------------------------------------------------------------
const DeathRecordFormBody: React.FC<ScreenProps> = ({
  reactProps, onAction, showSaveOnlyWhenPatientStatus2 = false, readonlyFieldsAreNative = false,
}) => {
  const { item = {}, lookup = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });
  const canShowSave = showSaveOnlyWhenPatientStatus2 ? item.PatientStatusId === 2 : true;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.md }}>
        <DatePicker label="Date of Death" required value={item.DeathDate ? String(item.DeathDate).slice(0, 10) : ''} onChange={(v) => dispatch('deathDateChange', { value: v })} />
        <Select label="Death Type" required options={toOptions(lookup.DeathType)} value={item.DeathTypeId ?? ''} onChange={(v) => field('DeathTypeId', v)} />
        <Select label="Place of Death" required options={toOptions(lookup.DeathPlace)} value={item.DeathPlaceId ?? ''} onChange={(v) => field('DeathPlaceId', v)} />
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: spacing.xs }}>
          <Checkbox label="Confirmed" checked={!!item.IsDeathConfirmed} onChange={(checked) => field('IsDeathConfirmed', checked)} />
        </div>
        <Select label="Confirmed By" options={toDoctorOptions(lookup.Doctor)} value={item.DeathConfirmedBy ?? ''} disabled={!item.IsDeathConfirmed} onChange={(v) => field('DeathConfirmedBy', v)} />
        <Input label="Comments" value={item.DeathComents ?? ''} onChange={(e) => field('DeathComents', e.target.value)} />

        {!readonlyFieldsAreNative && (
          <>
            {/* Dead in the original (never bound to any value) -- preserved as
                permanently-empty disabled fields, not fabricated with real data. */}
            <Input label="Created Date/Time" value="" disabled />
            <Input label="Created By" value="" disabled />
            <Input label="Approved By" value="" disabled />
          </>
        )}
        {/* When readonlyFieldsAreNative, the real <displaydate>/<displayuserlbl>
            directives render as native siblings in the surrounding .html
            template instead of here. */}
      </div>

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {canShowSave && (
          // Faithfully broken, per original: `save()` has no handler on the
          // Angular side either (only saveItem/approveItem/reverseItem exist).
          <Button variant="secondary" text="Save" onClick={() => dispatch('save')} />
        )}
        <Button variant="primary" text="Approve" onClick={() => dispatch('approveItem')} />
        <Button variant="danger" text="Reverse" onClick={() => dispatch('reverseItem')} />
      </div>
    </div>
  );
};

export const PatientDeathRecordFormScreen: React.FC<ScreenProps> = (props) => (
  <DeathRecordFormBody {...props} showSaveOnlyWhenPatientStatus2 readonlyFieldsAreNative={false} />
);

export const DeceasedFormScreen: React.FC<ScreenProps> = (props) => (
  <DeathRecordFormBody {...props} showSaveOnlyWhenPatientStatus2={false} readonlyFieldsAreNative />
);
