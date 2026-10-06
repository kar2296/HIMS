import React from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CreditNoteDetailRow {
  CNCompleted?: boolean;
  ServiceName?: string;
  ServiceAmount?: number;
  Discount?: number;
  NetAmount?: number;
  CNAmount?: number;
  CreditNoteTypeId?: number;
  CreditNoteAmount?: number;
  Comments?: string;
  IsEditable?: boolean;
  Status?: number;
}

interface CreditNoteItem {
  PatientName?: string;
  Patient?: { MRN?: string };
  BillDateTime?: string;
  BillNumber?: string;
  VisitIdentifier?: string;
  CreditNoteDateTime?: string; // ISO yyyy-mm-dd
  CreditNoteIdentifier?: string;
  FacilityId?: number;
  CreditNoteTypeId?: number;
  CreditNoteAmount?: number;
  CreditNoteApprovedById?: number;
  Comments?: string;
  isCompleted?: boolean;
}

interface BillingCreditNoteFormScreenProps {
  reactProps?: {
    item?: CreditNoteItem;
    patientAge?: number | string;
    patientAlertsCount?: number;
    creditNoteDetails?: CreditNoteDetailRow[];
    lookup?: { CreditNoteType?: LookupItem[]; User?: LookupItem[]; Facility?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatBillDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mmm}/${yyyy} ${hh}:${min}`;
}

function formatCurrency(val?: number): string {
  if (val == null) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
};

// UI-MODERNIZATION RETROFIT (Billing / Credit Note form, app.creditnote,
// creditnoteFormController). Rebuilds the real form's data-entry UI
// (header patient/bill summary, CN Date/No/Facility fields, the credit
// note line-items table, and the footer CN Type/Amount/Approved By/
// Comments fieldset) as a React component (BillingCreditNoteFormScreen)
// mounted via the existing AngularJS<->React bridge directive.
// Confirmed LIVE via real $state.go('app.creditnote', {id}) navigation
// from creditnote-list.js (addNew/edit) and from creditnote-form.js's
// own addNew()/clear() flow.
//
// DELIBERATE PARTIAL MIGRATION, not an oversight: the bottom action bar
// (Back / CN Status badge / Refund / Save & Approve / Clear) and the
// <printcontrol> component are left as native AngularJS markup in
// creditnote-form.html, NOT ported into this React component.
// <printcontrol> (vendor/components/printcontrol.js) is itself already
// backed by its own independently-migrated React component
// (PrintControl) via a nested bridge -- reimplementing it a second time
// here would duplicate that existing migration and risk diverging from
// it. Keeping the whole action bar native also avoids splitting the
// Save/Approve/Clear/Refund business logic across two rendering trees
// for no benefit, since none of the complexity that motivates this
// migration (ui-grid, ui-select, date pickers) applies to that bar.
//
// AngularJS (creditnote-form.js) remains authoritative and is hollowed
// only for the portion this component renders: it still owns the real
// Billing/PatientBillDetails/GetPatientBillDetails,
// Billing/PatientCreditNote/GetPatientCreditNotes,
// Billing/PatientCreditNote/AddPatientCreditNote,
// billing/patientbills/GetPatientBills, and
// registration/patient/GetPatientById calls, plus every amount-
// validation rule (headerCalc/calCreditAmount). React only renders
// reactProps and dispatches action names via handleReactAction.
//
// Confirmed pre-existing bugs, reproduced exactly (not "fixed"):
// - The Patient Alerts icon's real ng-click="alertviewclick()" has no
//   matching function anywhere in the controller -- clicking it is a
//   real no-op on the live app today. Reproduced as a dispatch to an
//   action name the bridge's generic fallthrough silently no-ops on.
// - The line-items table has TWO columns sharing the identical real
//   header text "CN Amount" (billing.creditnote.cnamt.lbl) -- one is
//   the read-only amount already applied (creditnote.CNAmount), the
//   other is the editable amount being applied now
//   (creditnote.CreditNoteAmount). Reproduced verbatim, not
//   disambiguated.
// - The line-items table only ever shows rows where Status === 1
//   (the real template's `| filter:{Status:1}`) -- reproduced via the
//   same client-side filter.
export const BillingCreditNoteFormScreen: React.FC<BillingCreditNoteFormScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {},
    patientAge,
    patientAlertsCount,
    creditNoteDetails = [],
    lookup,
  } = reactProps || {};

  const cnTypeOptions = lookup?.CreditNoteType || [];
  const userOptions = lookup?.User || [];
  const facilityOptions = lookup?.Facility || [];
  const visibleRows = creditNoteDetails
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => row.Status === 1);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md }}>
        <h4 style={{ ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily, margin: 0 }}>Credit Notes</h4>
        <div style={{ ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily }}>
          <span>{item.PatientName}</span>{' '}
          <span style={{ cursor: 'pointer' }} onClick={() => dispatch('patientprofiledetails')} title="Patient Profile"><i className="icon-info-sign" /></span>{' '}
          |<span>{item.Patient?.MRN}</span>{' '}
          | <span>{patientAge != null ? patientAge : ''}</span>|<span>{formatBillDateTime(item.BillDateTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
          <span style={{ ...typography.body, fontFamily: typography.fontFamily }}>{' Bill No : '}{item.BillNumber}</span>
          <span style={{ ...typography.body, fontFamily: typography.fontFamily }}>{'Visit No :'}{item.VisitIdentifier}</span>
          <span style={{ cursor: 'pointer', color: colors.warning }} title="Patient Alerts" onClick={() => dispatch('alertviewclick')}>
            <i className="fa fa-exclamation-triangle" aria-hidden="true" /> {patientAlertsCount}
          </span>
          <Button variant="secondary" onClick={() => dispatch('cnPicker')}>Find CNs</Button>
          <Button variant="secondary" onClick={() => dispatch('findBill')}>Find Bills</Button>
          <Button variant="primary" icon="fa-plus" title="Credit Note" onClick={() => dispatch('addNew')}>Add New</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.md }}>
        <div style={{ minWidth: 180 }}>
          <DatePicker label="Credit Note Date" value={item.CreditNoteDateTime || ''} disabled />
        </div>
        <div style={{ minWidth: 160 }}>
          <Input label=" Credit Note No" value={item.CreditNoteIdentifier || ''} disabled maxLength={8} />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Facility"
            value={item.FacilityId != null ? String(item.FacilityId) : ''}
            options={facilityOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            disabled
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: spacing.md }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              <th style={thStyle}>Service Name *</th>
              <th style={thStyle}>Bill Amount</th>
              <th style={thStyle}>Discount</th>
              <th style={thStyle}>Net Amount</th>
              <th style={thStyle}>CN Amount</th>
              <th style={thStyle}>CN Type</th>
              <th style={thStyle}>CN Amount</th>
              <th style={thStyle}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr><td style={tdStyle} colSpan={9}>No records found.</td></tr>
            )}
            {visibleRows.map(({ row, idx }) => (
              <tr key={idx}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={!!row.IsEditable}
                    disabled={row.CNCompleted || item.isCompleted}
                    onChange={(e) => dispatch('rowEditableChange', { index: idx, value: e.target.checked })}
                  />
                </td>
                <td style={tdStyle}><Input value={row.ServiceName || ''} disabled /></td>
                <td style={tdStyle}>{formatCurrency(row.ServiceAmount)}</td>
                <td style={tdStyle}>{formatCurrency(row.Discount)}</td>
                <td style={tdStyle}>{formatCurrency(row.NetAmount)}</td>
                <td style={tdStyle}>{formatCurrency(row.CNAmount)}</td>
                <td style={tdStyle}>
                  <Select
                    value={row.CreditNoteTypeId != null ? String(row.CreditNoteTypeId) : ''}
                    options={cnTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
                    onChange={(v) => dispatch('rowTypeChange', { index: idx, value: v ? parseInt(String(v), 10) : undefined })}
                    disabled={!row.IsEditable}
                  />
                </td>
                <td style={tdStyle}>
                  <Input
                    value={row.CreditNoteAmount != null ? String(row.CreditNoteAmount) : ''}
                    onChange={(e) => dispatch('rowAmountChange', { index: idx, value: e.target.value })}
                    disabled={!row.IsEditable}
                  />
                </td>
                <td style={tdStyle}>
                  <Input
                    value={row.Comments || ''}
                    onChange={(e) => dispatch('rowCommentsChange', { index: idx, value: e.target.value })}
                    disabled={!row.IsEditable}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.md }}>
        <span style={{ ...typography.label, color: colors.textMuted, marginRight: spacing.sm }}>Total :</span>
        <span style={{ ...typography.body, color: colors.textMain, fontWeight: 600 }}>{formatCurrency(item.CreditNoteAmount)}</span>
      </div>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', border: `1px solid ${colors.border}`, borderRadius: 4, padding: spacing.md }}>
        <div style={{ minWidth: 200 }}>
          <Select
            label="CN Type"
            value={item.CreditNoteTypeId != null ? String(item.CreditNoteTypeId) : ''}
            options={cnTypeOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('cnTypeChange', { value: v ? parseInt(String(v), 10) : undefined })}
            disabled={item.isCompleted}
            required
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <Input label="CN Amount" value={item.CreditNoteAmount != null ? String(item.CreditNoteAmount) : ''} disabled required />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Approved By"
            value={item.CreditNoteApprovedById != null ? String(item.CreditNoteApprovedById) : ''}
            options={userOptions.map((o) => ({ value: String(o.Id), label: o.Text }))}
            onChange={(v) => dispatch('approvedByChange', { value: v ? parseInt(String(v), 10) : undefined })}
            disabled={item.isCompleted}
            required
          />
        </div>
        <div style={{ minWidth: 200, flex: 1 }}>
          <Input
            label="Comments"
            value={item.Comments || ''}
            onChange={(e) => dispatch('commentsChange', { value: e.target.value })}
            disabled={item.isCompleted}
          />
        </div>
      </div>
    </div>
  );
};
