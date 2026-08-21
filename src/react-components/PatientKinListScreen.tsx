import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Button } from './Button';

interface KinEntity {
  Id: number;
  Name?: string;
  Title?: { Description?: string };
  Mobile?: string;
  Relationship?: { Description?: string };
  Comments?: string;
  [key: string]: any;
}

interface CurrentContext {
  patientid?: number;
}

interface Flags {
  canUpdatePatientInfo?: boolean;
}

interface ReactPropsShape {
  items?: KinEntity[];
  currentcontext?: CurrentContext;
  flags?: Flags;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// PatientKinListScreen -- the "Patient Kins" tab of the fullregistration tab shell
// (app.fullregistrationtab.patientkins). Real Angular state is a read-only summary
// grid (vm.gridConfig.data, populated by getListCallback) rendered via the generic
// <custom-table> directive (js/custom-table.html/app.js) -- there is no inline
// editing here (unlike patientidentity-list): Add/Edit both open the real
// app.fullregistrationtab.patientkin MODAL (confirmed to exist in hims-states.js),
// and Delete calls a real DeletePatientKin API directly after a confirm dialog. Kept
// as native dispatched Angular calls (utl.Modal.open/utl.Dialog.confirmDelete) --
// only the grid rendering itself is reimplemented in React.
//
// Real, disclosed specifics:
// - The "Name" column concatenates Title.Description + Name, exactly matching the
//   original's cellTemplate.
// - Column-header click-to-sort is real (customTable's reOrder: toggles ascending/
//   descending, case-insensitive string compare, supports dotted field paths) --
//   reproduced here as pure client-side display sort (nothing depends on the sorted
//   order server-side, so this never needs to round-trip through Angular).
// - Add/Save-successful "+" button gates on canUpdatePatientInfo() (real, from
//   baseController -- false only once the session-cached patient is "Deceased").
//
// UI-MODERNIZATION RETROFIT: this screen's markup now renders through the global
// design-system components (DataTable, Button, shared tokens) instead of hand-rolled
// inline styles/raw <table>. NOTHING behavioral changed: same dispatch() calls with
// the same action names/payload shapes (addNew/edit/delete/backTolist), same field
// names, same column-click sort behavior (now via DataTable's clientSort, which
// mirrors the same case-insensitive string compare the original local sort used),
// same canUpdatePatientInfo Add-button gate.
// ---------------------------------------------------------------------------
export const PatientKinListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], flags = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<KinEntity>[] = [
    {
      key: 'name',
      header: 'Name',
      field: 'Name',
      sortable: true,
      render: (e) => <>{e.Title?.Description ? `${e.Title.Description} ` : ''}{e.Name}</>,
    },
    { key: 'mobile', header: 'Phone No', field: 'Mobile', sortable: true },
    { key: 'relationship', header: 'Relationship', field: 'Relationship.Description', sortable: true },
    { key: 'comments', header: 'Comments', field: 'Comments', sortable: true },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.md }}>
        {flags.canUpdatePatientInfo && (
          <Button
            variant="success"
            title="Add"
            icon="fas fa-plus"
            onClick={() => dispatch('addNew')}
          />
        )}
      </div>

      <DataTable<KinEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          <>
            <Button
              variant="icon"
              size="sm"
              title="Edit"
              icon="fas fa-edit"
              onClick={() => dispatch('edit', { entity })}
              style={{ color: colors.primary }}
            />
            <Button
              variant="icon"
              size="sm"
              title="Delete"
              icon="fas fa-trash"
              onClick={() => dispatch('delete', { entity })}
              style={{ color: colors.danger }}
            />
          </>
        )}
      />

      <div style={{ marginTop: spacing.xl }}>
        <Button
          variant="secondary"
          icon="fa fa-angle-left"
          text="Back"
          onClick={() => dispatch('backTolist')}
        />
      </div>
    </div>
  );
};
