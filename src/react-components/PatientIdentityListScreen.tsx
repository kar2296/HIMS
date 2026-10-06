import React from 'react';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Button } from './Button';

interface LookupItem {
  Id: number;
  Text: string;
}

interface Lookups {
  PatientIdentityType?: LookupItem[];
}

interface IdentityItem {
  Id: number;
  Status: number;
  StatusId: boolean;
  PatientIdentityTypeId?: number;
  IDNumber?: string;
  Comments?: string;
  ImagePath?: string;
  canShowUpload?: boolean;
  [key: string]: any;
}

interface CurrentContext {
  patientid?: number;
  id?: number;
  canShowUpload?: boolean;
}

interface Flags {
  canUpdatePatientInfo?: boolean;
}

interface ReactPropsShape {
  items?: IdentityItem[];
  lookup?: Lookups;
  currentcontext?: CurrentContext;
  flags?: Flags;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: '12px', fontWeight: 700, color: colors.textMuted,
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `2px solid ${colors.border}`,
  backgroundColor: colors.surfaceMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`, verticalAlign: 'middle',
};

// ---------------------------------------------------------------------------
// PatientIdentityListScreen -- the "Patient Identities" tab of the fullregistration
// tab shell (app.fullregistrationtab.patientids). A grid/line-item editor, not a
// single-item form -- Angular's real state lives in vm.items (a plain array, not
// $scope.item), so this component is the whole screen (table + top "+ Add" button +
// footer) in one react-component mount, unlike the multi-mount form screens.
//
// Every field dispatches immediately on change ('rowFieldChange' {index, field,
// value}) mutating vm.items IN PLACE via the real live array reference passed down
// as `items` -- required (not just a fidelity nicety) because Delete/Upload dispatch
// the actual item OBJECT REFERENCE back into real Angular functions
// ($scope.deleteItem/$scope.upload) that rely on object identity (e.g.
// onDeleteConfirmed sets item.Status = 2 directly, and saveItem()'s
// getLinesForSave() later reads that exact same array) -- cloning would silently
// break Delete/Save.
//
// Real, disclosed specifics:
// - Type/ID Number/Comments/Status(checkbox) are the four real editable columns;
//   Upload column only renders when currentcontext.canShowUpload (real: true once at
//   least one saved identity with Id>0 exists).
// - The Cancel button's real ng-click="saveCancelled()" calls a function that is NOT
//   defined anywhere reachable from this controller's scope chain (confirmed by
//   grepping this file, basecontroller.js, and the parent fullregistrationtab.js) --
//   a genuine, pre-existing, currently-inert button (click does nothing). Preserved
//   faithfully: dispatched the same as every other action, and the generic
//   handleReactAction fallback in patientidentity-list.js silently no-ops since
//   $scope.saveCancelled is not a function, matching real current behavior exactly
//   (just without the original's harmless Angular expression-evaluation console
//   error, since this bypasses ng-click's expression evaluator entirely).
// - Back (addNewFull) is inherited from the parent fullRegistrationTabController's
//   scope (real Angular prototypal scope inheritance, unaffected by this migration)
//   -- $state.go('app.fullregistrationtab.basic', {id:0}) in the real app.
// - "+" Add (top) and Save both gate on canUpdatePatientInfo() (real: false only when
//   the session-cached patient status is "Deceased"), computed once per
//   refreshReactProps() call and passed as flags.canUpdatePatientInfo.
// ---------------------------------------------------------------------------
export const PatientIdentityListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], lookup = {}, currentcontext = {}, flags = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const rows = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.Status === 1);

  const typeOptions = lookup.PatientIdentityType || [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <Card
        padding={spacing.md}
        style={{ marginBottom: spacing.lg }}
        actions={flags.canUpdatePatientInfo && (
          <Button
            variant="icon"
            title="Add"
            onClick={() => dispatch('addNew')}
            icon="fas fa-plus"
            rounded="full"
            style={{ width: 34, height: 34, minWidth: 34, minHeight: 34, border: 'none', background: '#16a34a', color: '#fff' }}
          />
        )}
      >
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: radii.md }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Type *</th>
                <th style={thStyle}>ID Number *</th>
                <th style={thStyle}>Comments</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                {currentcontext.canShowUpload && <th style={{ ...thStyle, textAlign: 'center' }}>Upload</th>}
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, index }) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    <Select
                      value={item.PatientIdentityTypeId ?? ''}
                      placeholder="Select"
                      options={typeOptions.map((t) => ({ value: t.Id, label: t.Text }))}
                      onChange={(v) => dispatch('rowFieldChange', {
                        index, field: 'PatientIdentityTypeId',
                        value: v ? parseInt(String(v), 10) : null,
                      })}
                    />
                  </td>
                  <td style={tdStyle}>
                    <Input
                      value={item.IDNumber || ''}
                      onChange={(e) => dispatch('rowFieldChange', { index, field: 'IDNumber', value: e.target.value })}
                    />
                  </td>
                  <td style={tdStyle}>
                    <Input
                      value={item.Comments || ''}
                      onChange={(e) => dispatch('rowFieldChange', { index, field: 'Comments', value: e.target.value })}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Checkbox
                      checked={!!item.StatusId}
                      onChange={(checked) => dispatch('rowFieldChange', { index, field: 'StatusId', value: checked })}
                    />
                  </td>
                  {currentcontext.canShowUpload && (
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <Button
                        variant="link"
                        title="Upload"
                        icon="fas fa-file-upload"
                        onClick={() => dispatch('upload', { item })}
                        style={{ color: colors.info, padding: 0, minHeight: 'auto' }}
                      />
                    </td>
                  )}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Button
                      variant="link"
                      title="Delete"
                      icon="fas fa-trash"
                      onClick={() => dispatch('deleteItem', { index, item })}
                      style={{ color: colors.danger, padding: 0, minHeight: 'auto' }}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', color: colors.textSubtle }} colSpan={6}>No records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl }}>
        <Button variant="secondary" icon="fa fa-angle-left" onClick={() => dispatch('addNewFull')}>
          Back
        </Button>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {flags.canUpdatePatientInfo && (
            <Button variant="primary" onClick={() => dispatch('saveItem')}>
              Save
            </Button>
          )}
          <Button variant="warning" onClick={() => dispatch('clear')}>
            Clear
          </Button>
          <Button variant="secondary" onClick={() => dispatch('saveCancelled')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
