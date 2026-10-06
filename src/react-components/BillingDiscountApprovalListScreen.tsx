import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  DiscountApprovalStatusId?: number;
  BillTypeId?: number;
  FromBillDate?: string | Date;
  ToBillDate?: string | Date;
  BillNo?: string;
}

interface PatientBillRow {
  Id?: number;
  PatientId?: number;
  PatientBillId?: number;
  BillNumber?: string;
  BillDateTime?: string;
  EncounterTypeId?: number;
  BillAmount?: number | string;
  PaidAmount?: number | string;
  BillDiscount?: number | string;
  DiscountApprovalComments?: string;
  Patient?: { MRN?: string; FirstName?: string };
  UserDoctor?: { FirstName?: string };
  DiscountApprovedUser?: { FirstName?: string; LastName?: string };
  DiscountApprovalStatus?: { Description?: string };
}

interface BillingDiscountApprovalListScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    lookup?: { BillType?: LookupItem[]; DiscountApprovalStatus?: LookupItem[] };
    PatientBills?: PatientBillRow[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(val: number | string | undefined | null): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${day}/${months[date.getMonth()]}/${date.getFullYear()} ${time}`;
}

// FromBillDate/ToBillDate are bound via ng-date-object (a real JS Date
// object) on the AngularJS $scope, the same confirmed convention used
// elsewhere in this migration -- despite the controller's initial seed
// value coming from $filter('date')(...) as a formatted string, the
// datetime-picker directive's own parsers/formatters convert it to a Date.
function toDateTimeInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const thStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`,
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: colors.textMain,
  borderBottom: `1px solid ${colors.border}`,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`,
  fontSize: '13px',
  color: colors.textMain,
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: 'top',
};

export function BillingDiscountApprovalListScreen({ reactProps, onAction }: BillingDiscountApprovalListScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const patientBills = reactProps?.PatientBills;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const billTypeOptions = (lookup.BillType || []).map((o) => ({ value: String(o.Id), label: o.Text }));
  const statusOptions = (lookup.DiscountApprovalStatus || []).map((o) => ({ value: String(o.Id), label: o.Text }));

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <h4 style={{ margin: `0 0 ${spacing.md}`, ...typography.h4 }}>Discount Approval</h4>

      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: spacing.lg }}>
        <div style={{ minWidth: 190 }}>
          <DatePicker
            label="From Date"
            includeTime
            value={toDateTimeInputValue(currentfilter.FromBillDate)}
            onChange={(v) => dispatch('fromDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 190 }}>
          <DatePicker
            label="To Date"
            includeTime
            value={toDateTimeInputValue(currentfilter.ToBillDate)}
            onChange={(v) => dispatch('toDateChange', { value: v })}
          />
        </div>
        <div style={{ minWidth: 160 }}>
          {/* Bound to currentfilter.BillNo in the original template, but never
              referenced by getPatientBillList()'s filter Params or anywhere
              else in the controller -- a pre-existing dead/no-op filter field,
              reproduced verbatim (it updates state but never affects the list). */}
          <Input
            label="Bill Number"
            value={currentfilter.BillNo || ''}
            onChange={(e) => dispatch('billNoChange', { value: e.target.value })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Bill Type"
            options={billTypeOptions}
            value={currentfilter.BillTypeId != null ? String(currentfilter.BillTypeId) : ''}
            onChange={(v) => dispatch('billTypeChange', { value: v ? Number(v) : null })}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            label="Status"
            options={statusOptions}
            value={currentfilter.DiscountApprovalStatusId != null ? String(currentfilter.DiscountApprovalStatusId) : ''}
            onChange={(v) => dispatch('statusChange', { value: v ? Number(v) : null })}
          />
        </div>
        <div>
          <button type="button" className="draftbutton" onClick={() => dispatch('fetch')}>Fetch</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {patientBills && (
            <thead>
              <tr style={{ background: colors.surfaceMuted }}>
                <th style={thStyle}>Bill Date</th>
                <th style={thStyle}>Bill No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Bill Amount</th>
                <th style={thStyle}>Paid Amount</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Discount Comments</th>
                <th style={thStyle}>Discount Approver</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
          )}
          <tbody>
            {(patientBills || []).map((bill, idx) => (
              <tr key={bill.Id ?? idx}>
                <td style={tdStyle}>{formatDateTime(bill.BillDateTime)}</td>
                <td style={tdStyle}>{bill.BillNumber}</td>
                <td style={tdStyle}>
                  {bill.Patient?.MRN} {bill.Patient?.FirstName}
                  {/* Literal, untranslated IP/OP tag -- reproduced verbatim. */}
                  {bill.EncounterTypeId === 2 ? ' IP' : ' OP'}
                </td>
                <td style={tdStyle}>{bill.UserDoctor?.FirstName}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(bill.BillAmount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(bill.PaidAmount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(bill.BillDiscount)}</td>
                <td style={tdStyle}>{bill.DiscountApprovalComments}</td>
                <td style={tdStyle}>
                  {/* FirstName || LastName -- shows LastName only when FirstName is
                      falsy, never both together. Pre-existing quirk, reproduced verbatim. */}
                  {bill.DiscountApprovedUser?.FirstName || bill.DiscountApprovedUser?.LastName}
                </td>
                <td style={tdStyle}>{bill.DiscountApprovalStatus?.Description}</td>
                <td style={tdStyle}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => dispatch('editBillingRequest', { entity: bill })}
                  >
                    <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
