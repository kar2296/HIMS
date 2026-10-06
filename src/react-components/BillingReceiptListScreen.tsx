import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  receipt?: string;
  namemrn?: string;
  ReceiptTypeId?: number;
  ReceiptStatusId?: number;
  Fromreceiptdate?: string; // ISO yyyy-mm-dd, converted from/to the real AngularJS Date object by the bridge
  Toreceiptdate?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface ReceiptRow {
  Id: number;
  ReceiptNumber?: string;
  ReceiptDateTime?: string;
  Patient?: {
    Title?: { Description?: string };
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number;
    Gender?: { Description?: string };
  };
  PatientId?: number;
  EncounterId?: number;
  ReceiptType?: { Description?: string };
  AmountPaid?: number;
  PaymentType?: { Description?: string };
  ReceiptStatus?: { Description?: string };
  ReceiptStatusId?: number;
  PaymentStatusId?: number;
}

interface BillingReceiptListScreenProps {
  reactProps?: {
    items?: ReceiptRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ReceiptType?: LookupItem[]; ReceiptStatus?: LookupItem[] };
    totalAmount?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatReceiptDateTime(val?: string): string {
  // Mirrors the real <ngformatdate datetime-val="..."> directive's
  // 'dd-MMM-yyyy HH:mm' format exactly (vendor/common/ngCommonHelper.js).
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

function formatCurrency(val?: number): string {
  if (val == null) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Mirrors the real cellTemplate's exact literal concatenation:
// {Title}.{FirstName}{LastName}/{MRN}/{Age}/{Gender} -- preserved verbatim,
// including the literal "." after the title and the "/" separators, not
// reformatted into a nicer layout.
function formatPatientInfo(p?: ReceiptRow['Patient']): string {
  if (!p) return '';
  const title = p.Title?.Description || '';
  const name = `${p.FirstName || ''}${p.LastName || ''}`;
  return `${title}.${name}/${p.MRN || ''}/${p.Age != null ? p.Age : ''}/${p.Gender?.Description || ''}`;
}

// UI-MODERNIZATION RETROFIT (Billing / Receipts list, app.receipt-list,
// receiptListController). Re-skins the real custom-table screen with the
// shared design-system components instead of the legacy customTable/
// ui-select/uib-datepicker-popup markup. All real data flow is unchanged
// -- same handleReactAction dispatch back to receipt-list.js's hollowed
// controller, same real Billing/PatientPaymentDetails/
// GetPatientPaymentDetails call, same real "Previous Bills" flow that
// opens the already-migrated ReceiptPickerScreen modal
// (utl.Modal.open('app.receiptpicker', ...)).
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// 1. Both date filters ("From" and "To") share the identical real
//    translate key billing.receipt-list.date.lbl ("Date") -- there is no
//    separate From/To label in the real template. Reproduced verbatim
//    (both DatePickers below are labeled "Date").
// 2. For a receipt with ReceiptStatusId === 2, the real cellTemplate
//    renders TWO edit-style icons side by side: an always-visible "view"
//    action (no ng-show) and a status-gated "edit" action (ng-show
//    ReceiptStatusId==2) -- both use the same edit.svg icon and dispatch
//    to the exact same real $state.go('app.receipt-form', {id, pid})
//    call. Reproduced exactly as two identical-looking controls, not
//    collapsed into one.
// 3. The Name/MRN filter's placeholder ("NAME/MRN") is a literal string
//    in the real template, not a translate key -- reproduced verbatim
//    rather than converted to a translated label.
export const BillingReceiptListScreen: React.FC<BillingReceiptListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
    totalAmount,
  } = reactProps || {};
  const receiptTypeOptions = lookup?.ReceiptType || [];
  const receiptStatusOptions = lookup?.ReceiptStatus || [];

  const [receiptNo, setReceiptNo] = useState(currentfilter.receipt || '');
  useEffect(() => { setReceiptNo(currentfilter.receipt || ''); }, [currentfilter.receipt]);
  const [nameMrn, setNameMrn] = useState(currentfilter.namemrn || '');
  useEffect(() => { setNameMrn(currentfilter.namemrn || ''); }, [currentfilter.namemrn]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Receipts"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="primary" icon="fa-plus" title="Receipts" onClick={() => dispatch('addNew')} />
            <Button variant="secondary" icon="fa-search-plus" title="Previous Bills" onClick={() => dispatch('pickPatient')} />
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              label="Receipt No"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search', { receipt: receiptNo, namemrn: nameMrn }); }}
              placeholder="Receipt No"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <Input
              label="Name/MRN"
              value={nameMrn}
              onChange={(e) => setNameMrn(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search', { receipt: receiptNo, namemrn: nameMrn }); }}
              placeholder="NAME/MRN"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Type"
              value={currentfilter.ReceiptTypeId != null ? String(currentfilter.ReceiptTypeId) : ''}
              options={receiptTypeOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('typeFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date"
              value={currentfilter.Fromreceiptdate || ''}
              onChange={(v) => dispatch('fromDateChange', { value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date"
              value={currentfilter.Toreceiptdate || ''}
              onChange={(v) => dispatch('toDateChange', { value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Status"
              value={currentfilter.ReceiptStatusId != null ? String(currentfilter.ReceiptStatusId) : ''}
              options={receiptStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Receipt No</th>
                <th style={thStyle}>Receipt Date</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Receipt Amount</th>
                <th style={thStyle}>Payment Mode</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={8}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.ReceiptNumber}</td>
                  <td style={tdStyle}>{formatReceiptDateTime(row.ReceiptDateTime)}</td>
                  <td style={tdStyle}>{formatPatientInfo(row.Patient)}</td>
                  <td style={tdStyle}>{row.ReceiptType?.Description}</td>
                  <td style={tdStyle}>{formatCurrency(row.AmountPaid)}</td>
                  <td style={tdStyle}>{row.PaymentType?.Description}</td>
                  <td style={tdStyle}>{row.ReceiptStatus?.Description}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <span className="grid-action" style={{ cursor: 'pointer' }} title="View" onClick={() => dispatch('view', row)}>
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="View" aria-hidden="true" />
                      </span>
                      {(row.ReceiptStatusId === 1 || row.ReceiptStatusId === 3) && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Refund" onClick={() => dispatch('refund', row)}>
                          <i className="fas fa-money" aria-hidden="true" />
                        </span>
                      )}
                      {row.ReceiptStatusId === 4 && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Print Refund" onClick={() => dispatch('refundview', row)}>
                          <i className="fas fa-print" aria-hidden="true" />
                        </span>
                      )}
                      {row.ReceiptStatusId === 2 && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Edit" onClick={() => dispatch('edit', row)}>
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                        </span>
                      )}
                      {row.ReceiptStatusId === 2 && (
                        <span className="grid-action" style={{ cursor: 'pointer' }} title="Delete" onClick={() => dispatch('delete', row)}>
                          <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: `${spacing.sm} ${spacing.md}` }}>
          <span style={{ ...typography.label, color: colors.textMuted, marginRight: spacing.sm }}>Total:</span>
          <span style={{ ...typography.body, color: colors.textMain, fontWeight: 600 }}>{formatCurrency(totalAmount)}</span>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </Card>
    </div>
  );
};
