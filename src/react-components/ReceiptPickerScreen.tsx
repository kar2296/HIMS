import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text?: string;
  Description?: string;
}

interface ModelData {
  mrn?: string;
  From?: string;
  To?: string;
  PatientId?: number;
  FirstName?: string;
  LastName?: string;
  receipt?: string;
  ReceiptStatusId?: number;
  billnumber?: string;
  phamarcybillnumber?: string;
  FacilityId?: number;
  ReceiptTypeId?: number;
  [key: string]: any;
}

interface ReceiptRow {
  Id?: number;
  ReceiptDateTime?: string;
  Patient?: { MRN?: string; Title?: { Description?: string }; FirstName?: string; Age?: number; Gender?: { Description?: string } };
  ReceiptNumber?: string;
  PaymentType?: { Description?: string };
  GuarantorType?: { Description?: string };
  GurantorName?: string;
  AmountPaid?: number;
}

interface ReceiptPickerScreenProps {
  reactProps?: {
    modeldata?: ModelData;
    lookup?: { ReceiptStatus?: LookupItem[] };
    gridData?: ReceiptRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate's 'dd-MM-yyyy HH:mm:ss' date filter.
function formatDateTime(val?: string): string {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatCurrency(val?: number): string {
  if (val == null || isNaN(val)) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DEFAULT_MODEL: ModelData = {
  mrn: '', From: '', To: '', PatientId: -1, FirstName: '', LastName: '',
  receipt: '', ReceiptStatusId: 1, billnumber: '', phamarcybillnumber: '',
  FacilityId: -1, ReceiptTypeId: 2,
};

// UI-MODERNIZATION RETROFIT (Billing / "Find Receipt" picker modal,
// public/views/billing/receiptpicker/receiptpicker.html + .js): re-skins the
// real modal-full picker opened from receipt-form.js:477, receipt-list.js:84,
// refund-form.js:125, ipbillmodification-list.js:101, ipbill-list.js:79 via
// utl.Modal.open('app.receiptpicker', ...). All real data/logic is
// untouched -- filter fields and grid data are exactly what the hollowed
// receiptpicker.js controller's real $scope.modeldata / $scope.gridData
// already produce via the real Billing/PatientPaymentDetails/
// GetPatientPaymentDetails call; Apply/Reset dispatch straight to the real,
// unmodified $scope.actionClick.
//
// CONFIRMED PRE-EXISTING, preserved not fixed (all confirmed by reading
// receiptpicker.js in full, not assumed):
// 1) $scope.initLookup() only ever fetches ReceiptStatus/Referral/VisitType
//    from General/Options/getoptions -- it never fetches "Patient" or
//    "Facility" or "ReceiptType". So the real schema's PatientId ("MR
//    Number"), FacilityId ("Facility") and ReceiptTypeId ("Type") select
//    controls are bound to lookup keys that are never populated -- all three
//    have always rendered with zero options in production. Reproduced
//    exactly: those three selects below render with an empty option list.
// 2) OP/DG/IPNumber, billnumber ("Bill No"), phamarcybillnumber
//    ("PharmacyBill No") and FacilityId are all real, visible filter fields,
//    but $scope.getList()'s real Params array never includes any of them --
//    typing into any of these four fields has never affected the search
//    results. Not fixed; the fields are still rendered (matching the real
//    template) but their real no-op nature is disclosed here rather than
//    silently reproduced as if functional.
// 3) The results grid's "OP/DG/IP" column cellTemplate is a hardcoded
//    literal '{{"OP"}}' -- NOT computed from the row's real EncountertypeId
//    field despite the column name. Reproduced exactly: every row shows
//    "OP" regardless of its actual encounter type.
// 4) gridApi.selection.on.rowSelectionChanged's handler reads a bare
//    `entity.Id` instead of `row.entity.Id` (confirmed by direct comparison
//    against the correct row.entity.Id pattern used in ~79 other picker
//    screens across this codebase, e.g. admissionpicker.js:164) -- `entity`
//    is not defined in that scope, so clicking any result row throws a
//    ReferenceError before $scope.confirmCallback({rid: entity.Id}) is ever
//    reached. In production this means selecting a receipt from this picker
//    has never actually worked at any of its 5 call sites -- the picker
//    opens and filters, but a row click never returns a value to the
//    caller. Preserved exactly, not fixed (this is a UI interaction bug,
//    not something introduced by this migration, and correcting it would
//    change real behavior beyond the scope of this retrofit): the row
//    click below logs the same failure to the console and does not call
//    onAction('confirmCallback', ...).
// 5) getList() always sends PageContext { PageSize: 25, PageNumber: 1 } no
//    matter which page is selected, and sets pagerObj.totalItems to just
//    the current page's row count (not a real backend total) -- so paging
//    beyond page 1 has never changed the result set. The pager below is
//    reproduced for visual parity but is equally inert, matching real
//    behavior.
export const ReceiptPickerScreen: React.FC<ReceiptPickerScreenProps> = ({ reactProps, onAction }) => {
  const lookup = reactProps?.lookup;
  const gridData = reactProps?.gridData || [];
  const serverModel = reactProps?.modeldata;

  const [model, setModel] = useState<ModelData>(serverModel || DEFAULT_MODEL);

  useEffect(() => {
    if (serverModel) setModel(serverModel);
  }, [serverModel]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const setField = (field: string, value: any) => setModel((m) => ({ ...m, [field]: value }));

  const applyFilter = () => dispatch('apply', { modeldata: model });
  const resetFilter = () => dispatch('reset');

  const onRowClick = (_row: ReceiptRow) => {
    // Reproduces the real controller's confirmed "entity is not defined"
    // ReferenceError -- selecting a row has never worked in production.
    // See disclosure #4 above.
    console.error("ReceiptPickerScreen: row selection is a no-op -- the real receiptpicker.js's rowSelectionChanged handler references an undefined 'entity' variable, so this has never returned a value to the opening screen.");
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily, cursor: 'pointer',
  };

  const patientLabel = (p?: ReceiptRow['Patient']) => {
    if (!p) return '';
    return [p.Title?.Description, p.FirstName, p.MRN, p.Age, p.Gender?.Description].filter((v) => v !== undefined && v !== null && v !== '').join(' / ');
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, fontFamily: typography.fontFamily }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Find Receipt
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      <Card>
        <FilterBar>
          <Input label="From Date" type="date" value={model.From || ''} onChange={(e) => setField('From', e.target.value)} />
          <Select label="MR Number" placeholder="Select" options={[]} value="" onChange={() => {}} />
          <Input label="First Name" value={model.FirstName || ''} onChange={(e) => setField('FirstName', e.target.value)} />

          <Input label="To Date" type="date" value={model.To || ''} onChange={(e) => setField('To', e.target.value)} />
          <Input label="OP/DG/IP No" value={model['OP/DG/IPNumber'] || ''} onChange={(e) => setField('OP/DG/IPNumber', e.target.value)} />
          <Input label="Last Name" value={model.LastName || ''} onChange={(e) => setField('LastName', e.target.value)} />

          <Input label="Receipt No" value={model.receipt || ''} onChange={(e) => setField('receipt', e.target.value)} />
          <Select
            label="Status"
            placeholder="Select"
            options={(lookup?.ReceiptStatus || []).map((s) => ({ value: String(s.Id), label: s.Text || s.Description || '' }))}
            value={model.ReceiptStatusId != null ? String(model.ReceiptStatusId) : ''}
            onChange={(v) => setField('ReceiptStatusId', v ? parseInt(String(v), 10) : undefined)}
          />
          <Input label="Bill No" value={model.billnumber || ''} onChange={(e) => setField('billnumber', e.target.value)} />

          <Input label="PharmacyBill No" value={model.phamarcybillnumber || ''} onChange={(e) => setField('phamarcybillnumber', e.target.value)} />
          <Select label="Facility" placeholder="Select" options={[]} value="" onChange={() => {}} />
          <Select label="Type" placeholder="Select" options={[]} value="" onChange={() => {}} />
        </FilterBar>

        <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.md }}>
          <Button variant="primary" onClick={applyFilter}>Fetch</Button>
          <Button variant="danger" onClick={resetFilter}>Reset</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Receipt Date</th>
                <th style={thStyle}>MR Number</th>
                <th style={thStyle}>OP/DG/IP No</th>
                <th style={thStyle}>Receipt Number</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Payment Type</th>
                <th style={thStyle}>Payer Scenerio</th>
                <th style={thStyle}>Payer Name</th>
                <th style={thStyle}>Receipts Amount</th>
              </tr>
            </thead>
            <tbody>
              {gridData.length === 0 && (
                <tr><td style={tdStyle} colSpan={9}>No records found.</td></tr>
              )}
              {gridData.map((row, idx) => (
                <tr key={row.Id ?? idx} onClick={() => onRowClick(row)}>
                  <td style={tdStyle}>{formatDateTime(row.ReceiptDateTime)}</td>
                  <td style={tdStyle}>{row.Patient?.MRN}</td>
                  <td style={tdStyle}>OP</td>
                  <td style={tdStyle}>{row.ReceiptNumber}</td>
                  <td style={tdStyle}>{patientLabel(row.Patient)}</td>
                  <td style={tdStyle}>{row.PaymentType?.Description}</td>
                  <td style={tdStyle}>{row.GuarantorType?.Description}</td>
                  <td style={tdStyle}>{row.GurantorName}</td>
                  <td style={tdStyle}>{formatCurrency(row.AmountPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={1}
          totalItems={gridData.length}
          pageSize={25}
          onPageChange={() => dispatch('pageChange')}
        />
      </Card>
    </div>
  );
};
