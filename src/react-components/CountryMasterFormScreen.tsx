import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { colors, spacing, typography } from '../components/ui/tokens';

interface CountryItem {
  Id?: number;
  CountryCode?: string;
  CountryName?: string;
  IsActive?: boolean;
  isRequested?: boolean;
}

interface CountryMasterFormScreenProps {
  reactProps?: {
    item?: CountryItem;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Country Master add-edit modal):
// re-skins countrymaster-form.html's real modal form with the shared
// design-system components. Mounted the same way it always was, via the
// existing real utl.Modal.open('app.countrymasters', ...) call in
// countrymaster-list.js -- no change to how/when this form opens. All real
// logic (getItem's real GetCountryMasterById load, save()/saveandApprove()'s
// real ActiveStatusId handling, saveItem()'s real utl.Validator.validate +
// AddCountryMaster/UpdateCountryMaster calls, cancelCallback's real
// $uibModalInstance.dismiss) is untouched -- dispatched by exact action name.
//
// Pre-existing bug, preserved not fixed: same as City/State Master, the live
// template's "Save & Approve" button has always called an action name
// (saveAndApprove) that doesn't exist on this controller (only the
// lowercase-and saveandApprove does), so it has always silently done
// nothing in production. Reproduced exactly.
export const CountryMasterFormScreen: React.FC<CountryMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {} } = reactProps || {};

  const [countryCode, setCountryCode] = useState(item.CountryCode || '');
  const [countryName, setCountryName] = useState(item.CountryName || '');

  useEffect(() => {
    setCountryCode(item.CountryCode || '');
    setCountryName(item.CountryName || '');
  }, [item.Id]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const commitField = (field: string, value: any) => dispatch('fieldChange', { [field]: value });

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Country Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <Input
          label="Country Code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          onBlur={() => commitField('CountryCode', countryCode)}
        />
        <Input
          label="Country Name"
          required
          value={countryName}
          onChange={(e) => setCountryName(e.target.value)}
          onBlur={() => commitField('CountryName', countryName)}
        />
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
