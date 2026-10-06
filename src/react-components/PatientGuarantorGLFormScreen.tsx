import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Button } from './Button';

interface GLEntity {
  Id: number;
  GuarantorLetterNo?: string;
  PatientGuarantor?: { GuarantorLetterDate?: string };
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

interface SelectedPatient {
  Title?: { Description?: string };
  FirstName?: string;
  MRN?: string;
  Gender?: { Description?: string };
  Age?: string | number;
  DOB?: string;
}

interface CurrentContext {
  gname?: string;
  gtypedes?: string;
}

interface ReactPropsShape {
  item?: GLItem;
  glRecords?: GLEntity[];
  selectedPatient?: SelectedPatient;
  currentcontext?: CurrentContext;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');

// ---------------------------------------------------------------------------
// patientguarantorgl-form (app.patientguarantorglform, modal, 2 real refs) --
// opened from the already-migrated patientguarantor-list's "GL" action. Lists
// existing GL (guarantor letter) records for this guarantor/patient pair via a
// real ui-grid (now a DataTable) and lets the user add a new one. All API
// calls (GetPatientGuarantorGLs / AddPatientGuarantorGL / UpdatePatientGuarantorGL
// / DeletePatientGuarantorGL) stay in the untouched Angular controller.
//
// Real, disclosed specifics preserved exactly, NOT fixed:
// - The original template's file-upload input (`ngf-change="cvm.fileSelected()"`)
//   references `cvm`, which this controller never defines or injects -- selecting
//   a file here has never actually done anything. Rendered as an inert file
//   input (no onChange wired) to match the original's real, broken behavior.
// - ActiveFrom defaults to today (server/client "current date"), matching the
//   controller's initial `$scope.item = { ActiveFrom: ... }`.
// - The info icon next to the patient name opens the real registration.patientprofile
//   modal (dispatched as 'patientProfile', unchanged).
// ---------------------------------------------------------------------------
export const PatientGuarantorGLFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, glRecords = [], selectedPatient = {}, currentcontext = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const field = (name: string, value: any) => dispatch('itemFieldChange', { field: name, value });

  const columns: DataTableColumn<GLEntity>[] = [
    { key: 'glrefno', header: 'GL Ref No', field: 'GuarantorLetterNo', sortable: true },
    { key: 'gldate', header: 'GL Date', sortable: true, render: (e) => <>{fmtDate(e.PatientGuarantor?.GuarantorLetterDate)}</> },
    { key: 'limit', header: 'Limit', field: 'GLLimit', sortable: true },
    { key: 'consumed', header: 'Consumed', field: 'ConsumedLimit', sortable: true },
    { key: 'balance', header: 'Balance', field: 'BalanceLimit', sortable: true },
    { key: 'activefrom', header: 'Active From', sortable: true, render: (e) => <>{fmtDate(e.ActiveFrom)}</> },
    { key: 'activeto', header: 'Active To', sortable: true, render: (e) => <>{fmtDate(e.ActiveTo)}</> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md, color: colors.textMain }}>
        <div>
          <span>{selectedPatient.Title?.Description} {selectedPatient.FirstName}</span>
          <button onClick={() => dispatch('patientProfile')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, margin: `0 ${spacing.xs}` }} title="Patient profile">
            <i className="icon-info-sign" />
          </button>
          {' | '}<span>{selectedPatient.MRN}</span>{' | '}<span>{selectedPatient.Gender?.Description}</span>
          {' | Age: '}<span>{selectedPatient.Age}</span>
          {' | DOB: '}<span>{selectedPatient.DOB ? fmtDate(selectedPatient.DOB) : ''}</span>
        </div>
        <div>
          <span><em>Guarantor:</em> {currentcontext.gname}</span>{'  '}
          <span><em>Guarantor Type:</em> {currentcontext.gtypedes}</span>
        </div>
      </div>

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
