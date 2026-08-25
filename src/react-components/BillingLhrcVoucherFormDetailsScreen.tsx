import React from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface VoucherItem {
  AmbulanceName?: string;
  DriverName?: string;
  VehicleName?: string;
  PayTo?: string;
  VoucherAmount?: number | string;
  Remarks?: string;
  Mobile?: string;
  CreatedBy?: number;
}

interface BillingLhrcVoucherFormDetailsScreenProps {
  reactProps?: {
    item?: VoucherItem;
    lookup?: {
      User?: LookupItem[];
    };
    canShowSave?: boolean;
    canShowSaveAndApprove?: boolean;
    canShowCancel?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const fieldWrapStyle: React.CSSProperties = { marginBottom: spacing.md };
const labelStyle: React.CSSProperties = {
  display: 'block', ...typography.label, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily,
};

// Numeric-with-decimal keystroke guard, mirrors the real, live
// $scope.numberwithdecimal(e) charCode check (digits 0-9 and '.') that is
// genuinely wired via ng-keypress="numberwithdecimal($event)" on the real
// Amount field. Confirmed dead in the real template and NOT reproduced:
// the same field's onChange/onKeyUp HTML attributes calling a nonexistent
// global numberwithdecimal function (the real handler is $scope-scoped,
// not global).
function numericKeyGuard(e: React.KeyboardEvent<HTMLInputElement>) {
  if (!/[0-9.]/.test(e.key)) {
    e.preventDefault();
  }
}

// UI-MODERNIZATION RETROFIT (Billing / LHRC Voucher form, second mount --
// see BillingLhrcVoucherFormScreen for the top section and the full
// disclosure of the reachability caveat, validation-fidelity approach, and
// AngularJS-authoritative data flow, which apply equally here). Renders
// Ambulance Name / Driver Name / Vehicle Name / Pay To / Amount / Remarks /
// Mobile / Created By plus the real footer action bar (Cancel Voucher /
// Save / Save & Approve / Clear / Print), matching lhrcvoucher-form.html's
// real ng-show="CanShowCancel/CanShowSave/CanShowSaveandApprove" gating
// via reactProps.canShowCancel/canShowSave/canShowSaveAndApprove (mirrored
// straight from the real $scope.CanShow* computed by applyVisibilityRules()
// -- not reimplemented here).
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// - The real clear() function replaces the entire $scope.item with {} --
//   wiping the CreatedBy/VoucherDate/FacilityId/PaymentTypeId defaults set
//   when the modal opened, not just user-entered fields. Dispatching
//   'clear' here invokes that same real function unchanged.
// - The Cancel/Print buttons' real translate values are literal English
//   strings used directly as translate keys (translate="Cancel Voucher",
//   translate="print") rather than dotted i18n keys -- confirmed absent
//   from public/i18n, so with no missingTranslationHandler configured
//   they render as their own literal text today, including the
//   lowercase "print". Reproduced verbatim, not corrected/capitalized.
export const BillingLhrcVoucherFormDetailsScreen: React.FC<BillingLhrcVoucherFormDetailsScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, lookup, canShowSave = false, canShowSaveAndApprove = false, canShowCancel = false } = reactProps || {};
  const userOptions = lookup?.User || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ padding: `0 ${spacing.md}` }}>
      <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <div style={fieldWrapStyle}>
            <Input label="Ambulance Name" value={item.AmbulanceName || ''} onChange={(e) => dispatch('ambulanceNameChange', { value: e.target.value })} />
          </div>
          <div style={fieldWrapStyle}>
            <Input label="Driver Name" value={item.DriverName || ''} onChange={(e) => dispatch('driverNameChange', { value: e.target.value })} />
          </div>
          <div style={fieldWrapStyle}>
            <Input label="Vehicle Name" value={item.VehicleName || ''} onChange={(e) => dispatch('vehicleNameChange', { value: e.target.value })} />
          </div>
          <div style={fieldWrapStyle}>
            <Input label="Pay To" value={item.PayTo || ''} onChange={(e) => dispatch('payToChange', { value: e.target.value })} />
          </div>
        </div>

        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <div style={fieldWrapStyle}>
            <Input
              label="Amount"
              value={item.VoucherAmount != null ? String(item.VoucherAmount) : ''}
              onChange={(e) => dispatch('amountChange', { value: e.target.value })}
              onKeyPress={numericKeyGuard}
              required
            />
          </div>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Remarks</label>
            <textarea
              rows={3}
              maxLength={4000}
              value={item.Remarks || ''}
              onChange={(e) => dispatch('remarksChange', { value: e.target.value })}
              style={{ width: '100%', fontFamily: typography.fontFamily, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={fieldWrapStyle}>
            <Input
              label="Mobile #"
              value={item.Mobile || ''}
              onChange={(e) => dispatch('mobileChange', { value: e.target.value })}
              maxLength={10}
            />
          </div>
          <div style={fieldWrapStyle}>
            <Select
              label="Created By"
              value={item.CreatedBy != null ? String(item.CreatedBy) : ''}
              options={userOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
              onChange={(v) => dispatch('createdByChange', { value: v ? parseInt(String(v), 10) : undefined })}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: spacing.lg, padding: `${spacing.sm} 0`, borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div>
          {canShowCancel && (
            <Button variant="secondary" onClick={() => dispatch('cancel')}>Cancel Voucher</Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {canShowSave && (
            <Button variant="primary" onClick={() => dispatch('save')}>Save</Button>
          )}
          {canShowSaveAndApprove && (
            <Button variant="primary" onClick={() => dispatch('saveAndApprove')}>Approve</Button>
          )}
          <Button variant="secondary" onClick={() => dispatch('clear')}>Clear</Button>
          <Button variant="secondary" onClick={() => dispatch('PrintLHRCVoucher')}>print</Button>
        </div>
      </div>
    </div>
  );
};
