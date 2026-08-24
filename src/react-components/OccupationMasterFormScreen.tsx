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

interface OccupationItem {
  Id?: number;
  OccupationTypeId?: number;
  Code?: string;
  ShortCode?: string;
  Occupations?: string;
  IsActive?: boolean;
}

interface OccupationMasterFormScreenProps {
  reactProps?: { item?: OccupationItem; lookup?: { OccupationType?: LookupItem[] } };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Occupation Master add-edit
// modal): re-skins occupation-form.html's real modal form with the shared
// design-system components. Mounted the same way it always was, via the
// existing real utl.Modal.open('app.occupations', ...) call in
// occupation-list.js -- no change to how/when this form opens. All real
// logic (getItem's real GetOccupationById load, saveItem's real
// utl.Validator.validate + AddOccupation/UpdateOccupation calls,
// cancelCallback's real $uibModalInstance.dismiss) is untouched -- dispatched
// by exact action name.
//
// IMPORTANT, confirmed pre-existing issue, NOT introduced or fixed here:
// this live template's only visible action button calls
// ng-click="saveAndApprove()", but occupation-form.js defines NEITHER
// saveAndApprove NOR saveandApprove -- only a plain saveItem() that nothing
// in the UI ever calls (the real "Save" button is commented out in the
// original template, same as State/Pincode Master). So this modal's primary
// action button has always been a complete no-op in production -- confirmed
// by reading both files directly, and by checking modalConfigProvider.add
// ('app.occupations', ...) for any other footer button (there is none).
// Reproduced exactly: the button dispatches 'saveAndApprove', which matches
// no real controller function, same as the live behavior today.
export const OccupationMasterFormScreen: React.FC<OccupationMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};
  const occupationTypeOptions = lookup?.OccupationType || [];

  const [code, setCode] = useState(item.Code || '');
  const [shortCode, setShortCode] = useState(item.ShortCode || '');
  const [occupations, setOccupations] = useState(item.Occupations || '');

  useEffect(() => {
    setCode(item.Code || '');
    setShortCode(item.ShortCode || '');
    setOccupations(item.Occupations || '');
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
          Occupation Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <div>
          <label style={labelStyle}>Type</label>
          <Select
            placeholder="Select"
            value={item.OccupationTypeId != null ? String(item.OccupationTypeId) : ''}
            options={occupationTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => commitField('OccupationTypeId', v ? parseInt(String(v), 10) : undefined)}
          />
        </div>
        <Input
          label="Code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onBlur={() => commitField('Code', code)}
        />
        <Input
          label="Short Code"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          onBlur={() => commitField('ShortCode', shortCode)}
        />
        <Input
          label="Occupations"
          required
          value={occupations}
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => setOccupations(e.target.value.toUpperCase())}
          onBlur={() => commitField('Occupations', occupations)}
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
        <Button variant="success" onClick={() => dispatch('saveAndApprove')}>Save &amp; Approve</Button>
      </div>
    </div>
  );
};
