import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { AutosearchSelect } from './AutosearchSelect';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PincodeItem {
  Id?: number;
  Pincode?: string;
  Area?: string;
  CityId?: number;
  DistrictId?: number;
  StateId?: number;
  CountryId?: number;
  IsActive?: boolean;
}

interface PincodeMasterFormScreenProps {
  reactProps?: { item?: PincodeItem };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Pincode Master add-edit modal):
// re-skins pincode-form.html's real modal form with the shared design-system
// components. Mounted the same way it always was, via the existing real
// utl.Modal.open('app.pincode', ...) call in pincode-list.js -- no change to
// how/when this form opens. All real logic (getItem's real
// GetPincodeMasterById load, saveandApprove()'s real ActiveStatusId
// handling, saveItem()'s real utl.Validator.validate + AddPincodeMaster/
// UpdatePincodeMaster calls, cancelCallback's real $uibModalInstance.dismiss)
// is untouched -- dispatched by exact action name.
//
// NOTE -- different from City/State/Country/District Master: this live
// template has NO plain "Save" button at all (commented out in the original,
// same as State Master), and its "Save & Approve" button correctly calls
// ng-click="saveandApprove()" (lowercase-and) -- which DOES match this
// controller's real $scope.saveandApprove function. There is no casing bug
// on this particular screen; confirmed by reading both files directly.
// Reproduced as a single "Save & Approve" button dispatching 'saveandApprove'.
//
// Disclosed presentational choice, not a functionality change: City/
// District/State/Country are the real live <autosearch> typeahead widgets
// (independent per-field search against CityMaster/DistrictMaster/
// StateMaster/CountryMaster's real GetX APIs, no cross-field cascading --
// confirmed by reading public/vendor/components/autosearch.js and this
// form's four vm.*controlconfig blocks). Ported here as AutosearchSelect,
// a generic React port of that same widget, rather than the
// CityControl/DistrictControl/StateControl/CountryControl components used
// elsewhere in the app for cascading address pickers -- those require a
// parent id (e.g. StateControl needs countryid) before they'll show any
// options, which would remove the real ability to pick e.g. a State before
// a Country here.
export const PincodeMasterFormScreen: React.FC<PincodeMasterFormScreenProps> = ({ reactProps, onAction }) => {
  const { item = {} } = reactProps || {};

  const [pincode, setPincode] = useState(item.Pincode || '');
  const [area, setArea] = useState(item.Area || '');

  useEffect(() => {
    setPincode(item.Pincode || '');
    setArea(item.Area || '');
  }, [item.Id]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const commitField = (field: string, value: any) => dispatch('fieldChange', { [field]: value });

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Pincode Master
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        <Input
          label="Pincode"
          required
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          onBlur={() => commitField('Pincode', pincode)}
        />
        <Input
          label="Area"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
          onBlur={() => commitField('Area', area)}
        />
        <AutosearchSelect
          label="City"
          required
          itemId={item.CityId ?? null}
          api="generalmaster/CityMaster/GetCityMasters"
          nameField="CityName"
          searchKey={4}
          onSelect={(id) => commitField('CityId', id ?? undefined)}
        />
        <AutosearchSelect
          label="District"
          required
          itemId={item.DistrictId ?? null}
          api="generalmaster/DistrictMaster/GetDistrictMasters"
          nameField="DistrictName"
          searchKey={4}
          onSelect={(id) => commitField('DistrictId', id ?? undefined)}
        />
        <AutosearchSelect
          label="State"
          required
          itemId={item.StateId ?? null}
          api="generalmaster/StateMaster/GetStateMasters"
          nameField="StateName"
          searchKey={4}
          onSelect={(id) => commitField('StateId', id ?? undefined)}
        />
        <AutosearchSelect
          label="Country"
          required
          itemId={item.CountryId ?? null}
          api="generalmaster/CountryMaster/GetCountryMasters"
          nameField="CountryName"
          searchKey={3}
          onSelect={(id) => commitField('CountryId', id ?? undefined)}
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
        <Button variant="success" onClick={() => dispatch('saveandApprove')}>Save &amp; Approve</Button>
      </div>
    </div>
  );
};
