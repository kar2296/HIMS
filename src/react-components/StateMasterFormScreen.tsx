import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface StateItem {
  Id?: number;
  StateCode?: string;
  StateName?: string;
  CountryId?: number;
  IsActive?: boolean;
  isRequested?: boolean;
}

interface StateMasterFormScreenProps {
  reactProps?: {
    item?: StateItem;
    lookup?: {
      Country?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / State Master add-edit modal):
// re-skins statemaster-form.html's real modal form with the shared
// design-system components. Mounted the same way it always was, via the
// existing real utl.Modal.open('app.statemasters', ...) call in
// statemaster-list.js -- no change to how/when this form opens. All real
// logic (getItem's real GetStateMasterById load, saveandApprove()'s real
// ActiveStatusId handling, saveItem()'s real utl.Validator.validate +
// AddStateMaster/UpdateStateMaster calls, cancelCallback's real
// $uibModalInstance.dismiss) is untouched -- dispatched by exact action name.
//
// Two things reproduced exactly from the live template, not simplifications:
// 1. There is no plain "Save" button here -- the original template's Save
//    button (ng-click="save()") is commented out/dead, unlike City Master's,
//    which is live. Confirmed against the current template. Only
//    "Save & Approve" is rendered, matching the original exactly.
// 2. Pre-existing bug, preserved not fixed: same as City Master, the live
//    template's "Save & Approve" button has always called an action name
//    (saveAndApprove) that doesn't exist on this controller (only the
//    lowercase-and saveandApprove does), so it has always silently done
//    nothing in production. Reproduced exactly -- same dispatched name,
//    same no-op -- rather than quietly wired to the working function, since
//    that would change existing behavior. Flagged in the migration report.
export const StateMasterFormScreen: React.FC<StateMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};
  const countryOptions = lookup?.Country || [];

  const [stateCode, setStateCode] = useState(item.StateCode || '');
  const [stateName, setStateName] = useState(item.StateName || '');

  useEffect(() => {
    setStateCode(item.StateCode || '');
    setStateName(item.StateName || '');
  }, [item.Id]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const commitField = (field: string, value: any) => dispatch('fieldChange', { [field]: value });

  const labelStyle: React.CSSProperties = {
    ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block',
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          State Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <Input
          label="State Code"
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          onBlur={() => commitField('StateCode', stateCode)}
        />
        <Input
          label="State Name"
          required
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          onBlur={() => commitField('StateName', stateName)}
        />
        <div>
          <label style={labelStyle}>Country</label>
          <Select
            placeholder="Select"
            value={item.CountryId != null ? String(item.CountryId) : ''}
            options={countryOptions.map((c) => ({ value: String(c.Id), label: c.Text }))}
            onChange={(v) => commitField('CountryId', v ? parseInt(String(v), 10) : undefined)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Checkbox
            label="Active"
            checked={!!item.IsActive}
            onChange={(checked) => commitField('IsActive', checked)}
          />
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
        marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}`,
      }}>
        <Button variant="success" onClick={() => dispatch('saveAndApprove')}>Save &amp; Approve</Button>
      </div>
    </div>
  );
};
