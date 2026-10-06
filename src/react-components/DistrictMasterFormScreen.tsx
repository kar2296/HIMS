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

interface DistrictItem {
  Id?: number;
  DistrictCode?: string;
  DistrictName?: string;
  StateId?: number;
  CountryId?: number;
  IsActive?: boolean;
  isRequested?: boolean;
}

interface DistrictMasterFormScreenProps {
  reactProps?: {
    item?: DistrictItem;
    lookup?: {
      State?: LookupItem[];
      Country?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / District Master add-edit modal):
// re-skins districtmaster-form.html's real modal form with the shared
// design-system components. Mounted the same way it always was, via the
// existing real utl.Modal.open('app.districtmasters', ...) call in
// districtmaster-list.js -- no change to how/when this form opens. All real
// logic (getItem's real GetDistrictMasterById load, save()/saveandApprove()'s
// real ActiveStatusId handling, saveItem()'s real utl.Validator.validate +
// AddDistrictMaster/UpdateDistrictMaster calls, cancelCallback's real
// $uibModalInstance.dismiss) is untouched -- dispatched by exact action name.
//
// Pre-existing bug, preserved not fixed: same as City/State/Country Master,
// the live template's "Save & Approve" button has always called an action
// name (saveAndApprove) that doesn't exist on this controller (only the
// lowercase-and saveandApprove does), so it has always silently done
// nothing in production. Reproduced exactly.
export const DistrictMasterFormScreen: React.FC<DistrictMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};
  const stateOptions = lookup?.State || [];
  const countryOptions = lookup?.Country || [];

  const [districtCode, setDistrictCode] = useState(item.DistrictCode || '');
  const [districtName, setDistrictName] = useState(item.DistrictName || '');

  useEffect(() => {
    setDistrictCode(item.DistrictCode || '');
    setDistrictName(item.DistrictName || '');
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
          District Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <Input
          label="District Code"
          value={districtCode}
          onChange={(e) => setDistrictCode(e.target.value)}
          onBlur={() => commitField('DistrictCode', districtCode)}
        />
        <Input
          label="District Name"
          required
          value={districtName}
          onChange={(e) => setDistrictName(e.target.value)}
          onBlur={() => commitField('DistrictName', districtName)}
        />
        <div>
          <label style={labelStyle}>State</label>
          <Select
            placeholder="Select"
            value={item.StateId != null ? String(item.StateId) : ''}
            options={stateOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
            onChange={(v) => commitField('StateId', v ? parseInt(String(v), 10) : undefined)}
          />
        </div>
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
        {!item.isRequested && (
          <Button variant="secondary" onClick={() => dispatch('save')}>Save</Button>
        )}
        <Button variant="success" onClick={() => dispatch('saveAndApprove')}>Save &amp; Approve</Button>
      </div>
    </div>
  );
};
