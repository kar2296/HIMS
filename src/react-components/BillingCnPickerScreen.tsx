import React from 'react';
import { Button } from './Button';
import { Pagination } from '../components/ui/Pagination';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PatientRef {
  MRN?: string;
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
  Age?: number | string;
  Gender?: { Description?: string };
}

interface CnPickerRow {
  Id: number;
  CreditNoteIdentifier?: string;
  Patient?: PatientRef;
  CreditNoteDateTime?: string;
  CreditNoteType?: { Description?: string };
  CreditNoteAmount?: number | string;
  CreditNoteStatus?: { Description?: string };
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface BillingCnPickerScreenProps {
  reactProps?: {
    gridData?: CnPickerRow[];
    pagerObj?: PagerObj;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCnDate(val?: string): string {
  // Mirrors the real cellTemplate exactly: {{val | date:'dd-MMM-yyyy'}}&nbsp;{{val | date:'HH:mm'}}
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${min}`;
}

function formatPatientNameCell(p?: PatientRef): string {
  // Mirrors the real ui-grid cellTemplate exactly (public/views/billing/refunds/cnpicker.js,
  // PatientName column). The template's markup is malformed (a stray, unconditionally-
  // rendered {{Patient.Title.Description}} sits OUTSIDE the ng-if span that gates the MRN,
  // and an orphaned </span> with no matching open tag) -- confirmed by a full read of the
  // real cellTemplate string, not assumed. Reproduced exactly, not "fixed":
  // MRN (only if Patient.Title.Description exists) + "/" + Title.Description (always,
  // even when falsy/empty) + " " + FirstName + LastName + "/" + Age + Gender.Description.
  if (!p) return '';
  const hasTitle = !!(p.Title && p.Title.Description);
  const mrn = hasTitle ? (p.MRN || '') : '';
  const titleDesc = p.Title?.Description || '';
  const age = p.Age != null ? String(p.Age) : '';
  return `${mrn}/${titleDesc} ${p.FirstName || ''}${p.LastName || ''}/${age}${p.Gender?.Description || ''}`;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
};

// UI-MODERNIZATION RETROFIT (Billing / Refunds "CN Picker" modal, app.cnpicker,
// cnPickerController). Confirmed LIVE: registered in hims-states.js's
// modalConfigProvider and opened exclusively from
// public/views/billing/creditnote/creditnote-form.js's cnPicker()
// ("Find CNs" button), which the just-migrated BillingCreditNoteFormScreen
// dispatches through unchanged.
//
// DELIBERATE PARTIAL MIGRATION, matching the precedent already established
// for creditnote-list.js's "Fetch" filter popover: the real filter area
// (<dynamicform modeldata="modeldata" schema="schema"> plus its
// Apply/Reset action buttons) is a generic, schema-driven AngularJS-only
// mechanism -- it is left as native, untouched AngularJS markup in
// cnpicker.html, not reimplemented here. Only the results grid,
// pagination, and Cancel button (the modal's primary "pick a credit
// note" function) are rebuilt in React. The modal header
// (billing.creditnote.pagetitle.lbl, "Credit Notes") is also left native
// since it is simple, shared modal chrome.
//
// AngularJS (cnpicker.js) remains authoritative for the real
// Billing/PatientCreditNote/GetPatientCreditNotes call, the dynamic-form
// filter/lookup wiring, and the modal's confirm/cancel lifecycle
// ($uibModalInstance.close/.dismiss). React only renders reactProps and
// dispatches action names via handleReactAction.
//
// Confirmed pre-existing bug, reproduced exactly (not "fixed"): the
// Patient Name cell's real ng-click="grid.appScope.handleEvents('patientinfo',row)"
// calls a function that is never defined anywhere in cnPickerController
// (this controller does not extend utl.Ctrl.getBaseCtrl and defines no
// handleEvents of its own) -- clicking it is a genuine no-op on the live
// app today. Reproduced as a dispatch the bridge's generic fallthrough
// silently no-ops on. Row selection (clicking anywhere else in the row)
// is the real, working mechanism for picking a credit note, and is
// reproduced via a separate row-level dispatch, matching the real
// ui-grid's rowSelectionChanged-driven confirmCallback behavior (the
// real markup has no stopPropagation, so both handlers can fire from a
// click on the name cell, exactly as today).
export const BillingCnPickerScreen: React.FC<BillingCnPickerScreenProps> = ({ reactProps, onAction }) => {
  const { gridData = [], pagerObj = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>{' CN No'}</th>
              <th style={thStyle}>Patient Name</th>
              <th style={thStyle}>CN Date</th>
              <th style={thStyle}>CN Type</th>
              <th style={thStyle}>CN Amount</th>
              <th style={thStyle}>{' Status'}</th>
            </tr>
          </thead>
          <tbody>
            {gridData.length === 0 && (
              <tr><td style={tdStyle} colSpan={6}>No records found.</td></tr>
            )}
            {gridData.map((row) => (
              <tr
                key={row.Id}
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch('selectRow', row)}
              >
                <td style={tdStyle}>{row.CreditNoteIdentifier}</td>
                <td
                  style={tdStyle}
                  onClick={(e) => { e.stopPropagation(); dispatch('patientinfo', row); dispatch('selectRow', row); }}
                >
                  {formatPatientNameCell(row.Patient)}
                </td>
                <td style={tdStyle}>{formatCnDate(row.CreditNoteDateTime)}</td>
                <td style={tdStyle}>{row.CreditNoteType?.Description}</td>
                <td style={tdStyle}>{row.CreditNoteAmount != null ? String(row.CreditNoteAmount) : ''}</td>
                <td style={tdStyle}>{row.CreditNoteStatus?.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
        <Button variant="danger" onClick={() => dispatch('cancelCallback')}>Cancel</Button>
      </div>
    </div>
  );
};
