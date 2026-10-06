import React from 'react';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing, typography } from '../components/ui/tokens';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';
import { AreaControl } from './AreaControl';
import { PincodeControl } from './PincodeControl';

// Referral form (app.referraltab.details, referralFormController) — React view.
// Used as a page (Manage Referrals → Details tab) and as a pop-up from the registration
// screens ("add referral"). The AngularJS controller loads the lookups and the record, validates,
// saves (AddReferral / UpdateReferral) and closes; this component renders the view model built by
// $scope.buildReferralFormReactProps() (bridge code at the end of referral-form.js) and reports
// input through onAction(...): setField {field, value} · address {updates} · save · back.

interface LookupItem { Id: number; Text: string }

export interface ReferralFormItem {
  ReferralTypeId?: number | null; ReferralName?: string; Qualification?: string; PhoneNo?: string;
  Email?: string; PANNo?: string; Source?: string; AccountNo?: string; BankNo?: string; IFSCCode?: string;
  AddressLine1?: string; CountryId?: number | null; StateId?: number | null; DistrictId?: number | null;
  CityId?: number | null; WardId?: number | null; PinCodeId?: number | null; Pincode?: string;
  MarketingPersonId?: number | null; ContactPerson?: string; BirthDate?: string; IsActive?: boolean; IsDefault?: boolean;
}

export interface ReferralFormViewModel {
  labels: Record<string, string>;
  item: ReferralFormItem;
  lookup: { ReferralType: LookupItem[]; MarketingPerson: LookupItem[] };
  errors: Record<string, string>;
  isModal: boolean;
  loading: boolean;
  busy: boolean;
}

export interface ReferralFormScreenProps {
  reactProps?: ReferralFormViewModel;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: spacing.xs, fontFamily: typography.fontFamily,
};
const errorStyle: React.CSSProperties = { fontSize: 12, color: colors.danger, marginTop: spacing.xs, display: 'block' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md };

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={labelStyle}>{label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}</span>
      {children}
      {error && <span style={errorStyle} role="alert">{error}</span>}
    </div>
  );
}

export const ReferralFormScreen: React.FC<ReferralFormScreenProps> = ({ reactProps, onAction }) => {
  const vm = reactProps;
  if (!vm) return null;
  const send = (action: string, payload?: Record<string, unknown>) => onAction?.(action, payload);
  const L = vm.labels;
  const item = vm.item;
  const err = vm.errors || {};
  const set = (field: string, value: unknown) => send('setField', { field, value });
  const address = (updates: Record<string, unknown>) => send('address', { updates });
  const text = (field: keyof ReferralFormItem, label: string, extra?: Partial<React.ComponentProps<typeof Input>>, required?: boolean) => (
    <Field label={label} required={required} error={err[field]}>
      <Input name={String(field).toLowerCase()} aria-label={label} value={(item[field] as string) || ''}
        onChange={(e) => set(field, e.target.value)} {...extra} />
    </Field>
  );

  // Same labels as the old address block: Nepal (CountryId 2) uses Province / Municipality / Ward No
  // and has no pin code.
  const countryId = item.CountryId;
  const stateLabel = countryId === 2 ? 'Province' : L.state;
  const cityLabel = countryId === 2 ? 'Municipality' : L.city;
  const areaLabel = countryId === 2 ? 'Ward No' : L.area;

  return (
    <div id="referralform-react" style={{ fontFamily: typography.fontFamily, padding: vm.isModal ? 0 : `${spacing.sm} 0` }}>
      {vm.isModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.sm} ${spacing.md}`,
          borderBottom: `1px solid ${colors.border}`, marginBottom: spacing.md }}>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{L.modalTitle}</h4>
          <button type="button" onClick={() => send('back')} aria-label={L.close} title={L.close}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <img src="assets/svg/close.svg" alt="" />
          </button>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send('save'); }} noValidate
        style={{ padding: vm.isModal ? `0 ${spacing.md} ${spacing.md}` : 0, opacity: vm.loading ? 0.6 : 1 }} aria-busy={vm.loading}>
        {vm.loading && <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm }}>{L.loading}</div>}

        <div style={grid}>
          <Field label={L.sourceType} required error={err.ReferralTypeId}>
            <Select name="referraltype" aria-label={L.sourceType} placeholder={L.select} value={item.ReferralTypeId ?? ''}
              options={vm.lookup.ReferralType.map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(v) => set('ReferralTypeId', v === '' ? null : Number(v))} />
          </Field>
          {text('ReferralName', L.referralName, {
            // The old field had the "uppercase" directive.
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('ReferralName', e.target.value.toUpperCase()),
          }, true)}
          {text('Qualification', L.qualification)}
          {text('PhoneNo', L.phoneNo, {
            inputMode: 'numeric', maxLength: 10,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('PhoneNo', e.target.value.replace(/\D/g, '').slice(0, 10)),
          }, true)}
          {text('Email', L.email, { type: 'email' })}
          {text('PANNo', L.panNo)}
          {text('Source', L.source)}
          {text('AccountNo', L.accountNo)}
          {text('BankNo', L.bankNo)}
          {text('IFSCCode', L.ifscCode)}
          {text('AddressLine1', L.address1)}

          <Field label={L.country}>
            <CountryControl countryid={item.CountryId} onUpdate={address} />
          </Field>
          <Field label={stateLabel}>
            <StateControl countryid={item.CountryId} stateid={item.StateId} onUpdate={address} />
          </Field>
          <Field label={L.district}>
            <DistrictControl countryid={item.CountryId} stateid={item.StateId} districtid={item.DistrictId} onUpdate={address} />
          </Field>
          <Field label={cityLabel}>
            <CityControl countryid={item.CountryId} stateid={item.StateId} districtid={item.DistrictId} cityid={item.CityId} onUpdate={address} />
          </Field>
          <Field label={areaLabel}>
            <AreaControl countryid={item.CountryId} stateid={item.StateId} districtid={item.DistrictId} cityid={item.CityId}
              areaid={item.WardId} pincode={item.Pincode} onUpdate={address} />
          </Field>
          {countryId !== 2 && (
            <Field label={L.pincode}>
              <PincodeControl countryid={item.CountryId} stateid={item.StateId} districtid={item.DistrictId} cityid={item.CityId}
                pincodeid={item.PinCodeId} pincode={item.Pincode} onUpdate={address} />
            </Field>
          )}

          <Field label={L.marketingPerson}>
            <Select name="marketingperson" aria-label={L.marketingPerson} placeholder={L.select} value={item.MarketingPersonId ?? ''}
              options={vm.lookup.MarketingPerson.map((o) => ({ value: o.Id, label: o.Text }))}
              onChange={(v) => set('MarketingPersonId', v === '' ? null : Number(v))} />
          </Field>
          {text('ContactPerson', L.contactPerson)}
          <Field label={L.birthDate} error={err.BirthDate}>
            <DatePicker name="birthdate" value={item.BirthDate || ''} onChange={(v) => set('BirthDate', v)} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: spacing.xl, marginTop: spacing.lg, flexWrap: 'wrap' }}>
          {(['IsActive', 'IsDefault'] as const).map((field) => (
            <label key={field} style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: 0, cursor: 'pointer' }}>
              <input type="checkbox" name={field.toLowerCase()} checked={!!item[field]}
                onChange={(e) => set(field, e.target.checked)} style={{ width: 16, height: 16 }} />
              {field === 'IsActive' ? L.isActive : L.isDefault}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm, flexWrap: 'wrap' }}>
          <button type="button" className="btn pyr-color10 btn-sm" onClick={() => send('back')}>
            <i className="fa fa-angle-left" aria-hidden="true" />&nbsp;&nbsp;<span className="btn-fontsize">{L.back}</span>
          </button>
          <button type="submit" className="draftbutton" disabled={vm.busy || vm.loading}
            style={vm.busy || vm.loading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
            {vm.busy ? L.saving : L.saveApprove}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferralFormScreen;
