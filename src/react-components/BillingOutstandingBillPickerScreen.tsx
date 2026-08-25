import React from 'react';
import { Button } from './Button';
import { Pagination } from '../components/ui/Pagination';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PersonRef {
  MRN?: string;
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface OutstandingBillRow {
  Id: number;
  Patient?: PersonRef;
  BillNumber?: string;
  BillDateTime?: string;
  User?: PersonRef;
  Status?: string;
  OutStandingAmount?: number | string;
  PaidAmount?: number | string;
  BillAmount?: number | string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface BillingOutstandingBillPickerScreenProps {
  reactProps?: {
    gridData?: OutstandingBillRow[];
    pagerObj?: PagerObj;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatBillDate(val?: string): string {
  // Mirrors the real cellTemplate exactly: BillDateTime ? (date:'dd/MM/yyyy HH:mm:ss') : 'N/A'
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

function formatPersonCell(p?: PersonRef): string {
  // Mirrors the real cellTemplate exactly: " {{Title.Description}} {{FirstName}} {{LastName}}"
  // (leading space, plain concatenation, no gating logic -- unlike the similar-looking
  // Patient Name cells in creditnote-list/cnpicker, this one has no malformed markup).
  if (!p) return '';
  return `${p.Title?.Description || ''} ${p.FirstName || ''} ${p.LastName || ''}`;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.xs} ${spacing.sm}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
};

// UI-MODERNIZATION RETROFIT (Billing / Receipts "Outstanding Bills" picker
// modal, app.outstandingreceipt-list, outstandingreceiptListController).
// Confirmed LIVE: registered in hims-states.js's modalConfigProvider and
// opened from three separate receipt-form.js controllers' patient/bill
// picker flows (public/views/billing/receipts/receipt-form.js,
// public/views/pharmacy/advances/receipt-form.js, and
// public/views/inventory/opticals/opticalentry/receipt-form.js) -- none
// of those callers are migrated yet (the billing one is deliberately
// deferred due to its live third-party POS payment gateway integration),
// but this modal is self-contained and can be migrated independently;
// utl.Modal.open('app.outstandingreceipt-list', ...) works the same
// whether the calling screen is AngularJS or React.
//
// DELIBERATE PARTIAL MIGRATION, matching the precedent already used for
// creditnote-list.js's "Fetch" popover and the cnpicker modal: the real
// filter area (<dynamicform modeldata="modeldata" schema="schema"> plus
// its Apply/Reset action buttons) is a generic, schema-driven
// AngularJS-only mechanism and is left as native, untouched markup,
// along with the modal header. AngularJS remains authoritative for the
// real billing/patientbills/GetPatientBills call, the dynamic-form
// filter/lookup wiring, and the modal's confirm/cancel lifecycle
// ($uibModalInstance.close/.dismiss).
//
// Confirmed pre-existing quirk, reproduced exactly (not "fixed"): the
// "OP/DG/IP" column header (billing.findbill-list.ipnumber.lbl) is bound
// to a cellTemplate that always renders the literal string "OP"
// regardless of the row's actual EncountertypeId/bill type -- every row
// shows "OP" in this column on the live app today, even IP/DG bills.
export const BillingOutstandingBillPickerScreen: React.FC<BillingOutstandingBillPickerScreenProps> = ({ reactProps, onAction }) => {
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
              <th style={thStyle}>UHID</th>
              <th style={thStyle}>Bill No</th>
              <th style={thStyle}>OP/DG/IP</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Cons.Doctor</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Due Amount</th>
              <th style={thStyle}>Paid Amount</th>
              <th style={thStyle}>Bill Amount</th>
            </tr>
          </thead>
          <tbody>
            {gridData.length === 0 && (
              <tr><td style={tdStyle} colSpan={10}>No records found.</td></tr>
            )}
            {gridData.map((row) => (
              <tr
                key={row.Id}
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch('selectRow', { BillId: row.Id })}
              >
                <td style={tdStyle}>{row.Patient?.MRN}</td>
                <td style={tdStyle}>{row.BillNumber}</td>
                <td style={tdStyle}>OP</td>
                <td style={tdStyle}>{formatPersonCell(row.Patient)}</td>
                <td style={tdStyle}>{formatBillDate(row.BillDateTime)}</td>
                <td style={tdStyle}>{formatPersonCell(row.User)}</td>
                <td style={tdStyle}>{row.Status}</td>
                <td style={tdStyle}>{row.OutStandingAmount != null ? String(row.OutStandingAmount) : ''}</td>
                <td style={tdStyle}>{row.PaidAmount != null ? String(row.PaidAmount) : ''}</td>
                <td style={tdStyle}>{row.BillAmount != null ? String(row.BillAmount) : ''}</td>
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
