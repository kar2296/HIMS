import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Button } from './Button';

interface GLEntity {
  Id: number;
  GuarantorLetterNo?: string;
  GuarantorLetterDate?: string;
  GLLimit?: string | number;
  ConsumedLimit?: string | number;
  BalanceLimit?: string | number;
  ActiveFrom?: string;
  ActiveTo?: string;
  [key: string]: any;
}

interface GLItem {
  GuarantorLetterNo?: string;
  GuarantorLetterDate?: string;
  MaxNoOfdays?: string | number;
  CurrentVisitNumber?: string | number;
  MaximumVisitNumber?: string | number;
  DurationMedicine?: string | number;
  ActiveFrom?: string;
  ActiveTo?: string;
  GLLimit?: string | number;
  ConsumedLimit?: string | number;
  BalanceLimit?: string | number;
  RandB?: string | number;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: GLItem;
  glRecords?: GLEntity[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');

// ---------------------------------------------------------------------------
// encounterguarantorgl-form (app.encounterguarantorglform, modal) -----------
// Opened from the already-migrated encounterguarantor-list's "GL" action.
// Lists existing GL (guarantor letter) records for this encounter guarantor
// via a real ui-grid (now a DataTable) and lets the user add a new one. All
// API calls (GetEncounterGuarantorGLs / AddEncounterGuarantorGL /
// UpdateEncounterGuarantorGL / DeleteEncounterGuarantorGL) stay in the
// untouched Angular controller.
//
// Real, disclosed specifics preserved exactly, NOT fixed:
// - The original template's file-upload input (`ngf-change="cvm.fileSelected()"`)
//   references `cvm`, which this controller never defines or injects (the
//   controller only ever uses `vm`/`$scope`) -- selecting a file here has
//   never actually done anything. Rendered as an inert file input (no
//   onChange wired) to match the original's real, broken behavior.
// - ActiveFrom defaults to today (server/client "current date"), matching the
//   controller's initial `$scope.item = { ActiveFrom: ... }`.
// - Unlike the sibling patient-level screen, this controller never receives
//   or sets `$scope.SelectedPatient`, and never defines a `patientprofiledetails`
//   function -- the original template (encounterguarantorgl-form.html) has no
//   patient-info / guarantor-name-and-type header at all, so none is rendered
//   here either.
// - The grid's date column reads the GL date from a flat `GuarantorLetterDate`
//   field on each row entity (`row.entity.GuarantorLetterDate`), NOT the
//   nested `PatientGuarantor.GuarantorLetterDate` the patient-level sibling
//   screen uses -- confirmed from the real column defs in
//   encounterguarantorgl-form.js.
// ---------------------------------------------------------------------------
export const EncounterGuarantorGLFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, glRecords = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  const columns: DataTableColumn<GLEntity>[] = [
    { key: 'glrefno', header: 'GL Ref No', field: 'GuarantorLetterNo', sortable: true },
    { key: 'gldate', header: 'GL Date', sortable: true, render: (e) => <>{fmtDate(e.GuarantorLetterDate)}</> },
    { key: 'limit', header: 'Limit', field: 'GLLimit', sortable: true },
    { key: 'consumed', header: 'Consumed', field: 'ConsumedLimit', sortable: true },
    { key: 'balance', header: 'Balance', field: 'BalanceLimit', sortable: true },
    { key: 'activefrom', header: 'Active From', sortable: true, render: (e) => <>{fmtDate(e.ActiveFrom)}</> },
    { key: 'activeto', header: 'Active To', sortable: true, render: (e) => <>{fmtDate(e.ActiveTo)}</> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Input label="GL Ref No" required value={item.GuarantorLetterNo ?? ''} onChange={(e) => field('GuarantorLetterNo', e.target.value)} />
        <DatePicker label="GL Date" required value={item.GuarantorLetterDate ? String(item.GuarantorLetterDate).slice(0, 10) : ''} onChange={(v) => dispatch('glDateChange', { value: v })} />
        <Input label="Max No. Of Days" value={item.MaxNoOfdays ?? ''} onChange={(e) => field('MaxNoOfdays', e.target.value)} />
        <Input label="Current Visit No" value={item.CurrentVisitNumber ?? ''} onChange={(e) => field('CurrentVisitNumber', e.target.value)} />
        <Input label="Maximum Visit No" value={item.MaximumVisitNumber ?? ''} onChange={(e) => field('MaximumVisitNumber', e.target.value)} />
        <Input label="Duration (Medicine)" value={item.DurationMedicine ?? ''} onChange={(e) => field('DurationMedicine', e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs }}>Select File</label>
          {/* Preserved as inert: the original ngf-change handler (cvm.fileSelected) was never defined. */}
          <input type="file" disabled title="Not functional in the original screen" />
        </div>
        <DatePicker label="Active From" required value={item.ActiveFrom ? String(item.ActiveFrom).slice(0, 10) : ''} onChange={(v) => dispatch('activeFromChange', { value: v })} />
        <DatePicker label="Active To" value={item.ActiveTo ? String(item.ActiveTo).slice(0, 10) : ''} onChange={(v) => dispatch('activeToChange', { value: v })} />
        <Input label="GL Limit" value={item.GLLimit ?? ''} onChange={(e) => field('GLLimit', e.target.value)} />
        <Input label="Consumed" value={item.ConsumedLimit ?? ''} onChange={(e) => field('ConsumedLimit', e.target.value)} />
        <Input label="Balance" value={item.BalanceLimit ?? ''} onChange={(e) => field('BalanceLimit', e.target.value)} />
        <Input label="R&B" value={item.RandB ?? ''} onChange={(e) => field('RandB', e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: `${spacing.md} 0` }}>
        <Button variant="success" text="Add" onClick={() => dispatch('saveItem')} />
      </div>

      <DataTable<GLEntity>
        columns={columns}
        rows={glRecords}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          <>
            <Button variant="icon" size="sm" title="Edit" icon="fas fa-edit" onClick={() => dispatch('edit', { entity })} style={{ color: colors.primary }} />
            <Button variant="icon" size="sm" title="Delete" icon="fas fa-trash" onClick={() => dispatch('delete', { entity })} style={{ color: colors.danger }} />
          </>
        )}
      />

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="secondary" text="Cancel" onClick={() => dispatch('backToList')} />
      </div>
    </div>
  );
};
