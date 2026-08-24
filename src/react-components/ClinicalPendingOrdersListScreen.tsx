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
  patient?: string;
  orderstatusid?: number;
  OrderDate?: string; // ISO yyyy-mm-dd, converted from/to the real AngularJS Date object by the bridge
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface UserRef {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface PatientRef {
  MRN?: string;
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface OrderRow {
  Id: number;
  OrderRequestDate?: string;
  Patient?: PatientRef;
  PatientId?: number;
  User?: UserRef;
  OrderNumber?: string;
  PatientOrderDetails?: any;
}

interface ClinicalPendingOrdersListScreenProps {
  reactProps?: {
    items?: OrderRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { OrderStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatOrderDateTime(val?: string): string {
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

function displayPerson(p?: { Title?: { Description?: string }; FirstName?: string; LastName?: string }): string {
  // Mirrors the real <displayuser>/inline Patient.FirstName cellTemplate markup
  // exactly (vendor/common/ngCommonHelper.js): "Title FirstName LastName".
  if (!p) return '';
  const parts: string[] = [];
  if (p.Title?.Description) parts.push(p.Title.Description);
  if (p.FirstName) parts.push(p.FirstName);
  const titleAndFirst = parts.join(' ');
  return p.LastName ? `${titleAndFirst} ${p.LastName}` : titleAndFirst;
}

// UI-MODERNIZATION RETROFIT (Billing / Clinical Orders "Pending Orders" list,
// app.pendingorders, PendingOrderListController). Re-skins the real ui-grid
// screen with the shared design-system components (table/Select/DatePicker/
// Pagination) instead of ui-grid + ui-select + uib-datepicker-popup. All real
// data flow is unchanged -- same handleReactAction dispatch back to
// clinicalpendingorders-list.js's hollowed controller, same real
// emr/patientorder/GetPatientOrders call and PageContext-based pagination.
//
// Confirmed dead code, NOT reproduced (verified via full template read --
// the markup is entirely commented out): the "Filter"/"Add New Orders"
// header buttons (openAdvancedFilter/addNewOrder), and by extension
// addNewOrder(), patientprofiledetails(), onDeleteConfirmed()/
// deleteItemCallback() -- none of these have any live UI trigger in the
// real template (the grid's Actions column only wires B2B/OPB/DGB via
// handleEvents). currentfilter.orderpriorityid/WardId/TestTypeId and
// advancedfilter.From/To are set as defaults but have no bound UI control
// either -- confirmed dead, not rendered as filters here.
//
// Confirmed pre-existing quirks, preserved exactly (not "fixed"):
// 1. The "Referred By" column and the "Patient" column both read
//    row.Patient (FirstName/LastName/Title) -- there is no separate
//    referring-doctor field wired up in the real cellTemplate, so both
//    columns display the same patient name. Reproduced exactly.
// 2. Both "Ordered No" and "Referred By" column headers use translate
//    keys that do not exist in public/i18n (patientemr.patientorder-list.
//    orderedno.lbl / .referredby.lbl -- verified absent from
//    emr/patientemr/en.json). The app's $translateProvider has no
//    missingTranslationHandler configured (public/js/app.js), so
//    angular-translate's default behavior applies: $translate.instant()
//    returns the raw translation-id string itself. The real screen
//    therefore literally displays these dotted key strings as column
//    headers. Reproduced exactly rather than substituting a "nice" label.
export const ClinicalPendingOrdersListScreen: React.FC<ClinicalPendingOrdersListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const orderStatusOptions = lookup?.OrderStatus || [];

  const [patient, setPatient] = useState(currentfilter.patient || '');
  useEffect(() => { setPatient(currentfilter.patient || ''); }, [currentfilter.patient]);

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
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader title="Pending Orders" />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Name/MRN"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search', { patient }); }}
              placeholder="Name/MRN"
            />
          </div>
          <div style={{ minWidth: 170 }}>
            <DatePicker
              label="Order Date"
              value={currentfilter.OrderDate || ''}
              onChange={(v) => dispatch('dateChange', { value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Status"
              value={currentfilter.orderstatusid != null ? String(currentfilter.orderstatusid) : ''}
              options={orderStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Order Date</th>
                <th style={thStyle}>Patient ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Ordered By</th>
                <th style={thStyle}>{/* real translate key is missing from i18n -- see disclosure comment above */}patientemr.patientorder-list.orderedno.lbl</th>
                <th style={thStyle}>{/* real translate key is missing from i18n -- see disclosure comment above */}patientemr.patientorder-list.referredby.lbl</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={7}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{formatOrderDateTime(row.OrderRequestDate)}</td>
                  <td style={tdStyle}>{row.Patient?.MRN}</td>
                  <td style={tdStyle}>{displayPerson(row.Patient)}</td>
                  <td style={tdStyle}>{displayPerson(row.User)}</td>
                  <td style={tdStyle}>{row.OrderNumber}</td>
                  <td style={tdStyle}>{displayPerson(row.Patient)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <Button variant="secondary" onClick={() => dispatch('b2bbillinglist', row)}>B2B</Button>
                      <Button variant="secondary" onClick={() => dispatch('opbillinglist', row)}>OPB</Button>
                      <Button variant="secondary" onClick={() => dispatch('dgbillinglist', row)}>DGB</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
