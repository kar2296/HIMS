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

interface CityItem {
  Id?: number;
  CityCode?: string;
  CityName?: string;
  DistrictId?: number;
  StateId?: number;
  CountryId?: number;
  IsActive?: boolean;
  isRequested?: boolean;
}

interface CityMasterFormScreenProps {
  reactProps?: {
    item?: CityItem;
    lookup?: {
      Country?: LookupItem[];
      State?: LookupItem[];
      District?: LookupItem[];
      City?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / City Master add-edit modal):
// re-skins citymaster-form.html's real modal form with the shared
// design-system components. Mounted the same way it always was, via the
// existing real utl.Modal.open('app.citymasters', ...) call in
// citymaster-list.js -- no change to how/when this form opens. All real
// logic (getItem's real GetCityMasterById load, save()/saveAndApprove()'s
// real ActiveStatusId handling, saveItem()'s real utl.Validator.validate +
// AddCityMaster/UpdateCityMaster calls, cancelCallback's real
// $uibModalInstance.dismiss) is untouched -- dispatched by exact action name.
//
// Pre-existing bug, preserved not fixed: the live template's "Save & Approve"
// button has always called an action name (saveAndApprove) that doesn't
// exist on this controller (only the lowercase-and saveandApprove does), so
// it has always silently done nothing in production. Reproduced exactly --
// same dispatched name, same no-op -- rather than quietly wired to the
// working function, since that would change existing behavior. Flagged in
// the migration report; a one-line fix if the real behavior should change.
export const CityMasterFormScreen: React.FC<CityMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup } = reactProps || {};
  const countryOptions = lookup?.Country || [];
  const stateOptions = lookup?.State || [];
  const districtOptions = lookup?.District || [];

  const [cityCode, setCityCode] = useState(item.CityCode || '');
  const [cityName, setCityName] = useState(item.CityName || '');

  useEffect(() => {
    setCityCode(item.CityCode || '');
    setCityName(item.CityName || '');
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
          City Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <Input
          label="City Code"
          value={cityCode}
          onChange={(e) => setCityCode(e.target.value)}
          onBlur={() => commitField('CityCode', cityCode)}
        />
        <Input
          label="City Name"
          required
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onBlur={() => commitField('CityName', cityName)}
        />
        <div>
          <label style={labelStyle}>District</label>
          <Select
            placeholder="Select"
            value={item.DistrictId != null ? String(item.DistrictId) : ''}
            options={districtOptions.map((d) => ({ value: String(d.Id), label: d.Text }))}
            onChange={(v) => commitField('DistrictId', v ? parseInt(String(v), 10) : undefined)}
          />
        </div>
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
