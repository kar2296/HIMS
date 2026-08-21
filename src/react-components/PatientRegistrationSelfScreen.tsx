import React, { useState } from 'react';
import { PatientSearchControl } from './PatientSearchControl';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, radii, spacing, typography, shadows, zIndex } from '../components/ui/tokens';

interface ColumnDef {
  field: string;
  displayName: string;
}

interface MrnTypeOption {
  Id?: number;
  Text?: string;
}

interface CurrentFilter {
  FromDate?: string;
  ToDate?: string;
  MRNTypeId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface PatientRegistrationSelfScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    patientDisplay?: string;
    referralDisplay?: string;
    mrnTypeOptions?: MrnTypeOption[];
    columnDefs?: ColumnDef[];
    gridData?: any[];
    pagerObj?: PagerObj;
    canShowPrint?: boolean;
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onPatientSearch?: (query: string) => Promise<any[]>;
  onPatientSelect?: (patient: any) => void;
  onReferralSearch?: (query: string) => Promise<any[]>;
  onReferralSelect?: (referral: any) => void;
}

// Mirrors AngularJS's `date` filter formatting used by the original cellTemplate
// (`{{entity.RegisteredDate | date : 'dd-MM-yyyy'}}`).
function formatDateDDMMYYYY(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
}

// Mirrors AngularJS's <input type="text" uib-datepicker-popup> value <-> the
// `currentfilter.FromDate/ToDate` Date objects the controller's $filter('date', ...)
// calls expect -- converted here to/from the yyyy-MM-dd string a native date input uses.
function toDateInputValue(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Faithful port of customTableController.reOrder()'s dot-path field resolution --
// same traversal semantics (stops and falls back to '' the moment any segment is
// missing), adapted to compare as plain strings instead of assuming `.toLowerCase()`
// only ever sees strings (the original would throw on a numeric field; that was never
// reachable behavior, not something to preserve).
function resolveField(obj: any, field: string): any {
  let broke = false;
  let cur = obj;
  for (const part of field.split('.')) {
    if (!broke && cur && cur[part]) {
      cur = cur[part];
    } else {
      broke = true;
    }
  }
  return broke ? undefined : cur;
}

// ---------------------------------------------------------------------------
// UI-MODERNIZATION RETROFIT: this screen's markup now renders through the
// global design-system components (Input, Select, DatePicker, PageHeader,
// Card/FilterBar, Pagination, Button, shared tokens) instead of hand-rolled
// Bootstrap markup/inline styles. NOTHING behavioral changed: same dispatch()
// calls with the same action names/payload shapes (search/dateChange/
// mrnTypeChange/editRow/backtoReport/excelDownload/print/pageChange), same
// field names, same async referral-autocomplete flow, same client-side sort.
//
// The results grid intentionally stays a raw <table> (only re-skinned with
// tokens) rather than being swapped for the shared <DataTable>: this screen's
// 'idx' pseudo-column renders `index + 1` from *this render's* post-sort
// position, and its own column-header click handler feeds a local
// dispatch-free `sort` state that `sortedData` (above) consumes to reorder
// before that index is computed. <DataTable> owns both its header-click
// handling and its post-sort row order internally and exposes neither the
// resulting index nor a way to hook in this screen's own `handleSort` --
// swapping it in would either silently break the row-number column or turn
// column-header clicks into dead no-ops. Neither is an acceptable regression
// on a production data grid, so the existing sort/render logic below is kept
// completely untouched.
// ---------------------------------------------------------------------------
export const PatientRegistrationSelfScreen: React.FC<PatientRegistrationSelfScreenProps> = ({
  reactProps,
  onAction,
  onPatientSearch,
  onPatientSelect,
  onReferralSearch,
  onReferralSelect,
}) => {
  const {
    currentfilter = {},
    patientDisplay = '',
    referralDisplay = '',
    mrnTypeOptions = [],
    columnDefs = [],
    gridData = [],
    pagerObj = {},
    canShowPrint = false,
    context = '',
  } = reactProps || {};

  const [referralQuery, setReferralQuery] = useState(referralDisplay);
  const [referralResults, setReferralResults] = useState<any[]>([]);
  const [referralOpen, setReferralOpen] = useState(false);
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 } | null>(null);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleReferralInput = async (value: string) => {
    setReferralQuery(value);
    if (value && value.length > 2 && onReferralSearch) {
      const results = await onReferralSearch(value);
      setReferralResults(results || []);
      setReferralOpen(true);
    } else {
      setReferralResults([]);
      setReferralOpen(false);
    }
  };

  const selectReferral = (referral: any) => {
    setReferralQuery(`${referral.ReferralName} (${referral.ReferralCode})`);
    setReferralOpen(false);
    setReferralResults([]);
    if (onReferralSelect) onReferralSelect(referral);
  };

  const handleSort = (field: string) => {
    setSort((prev) => {
      const nextOrder: 1 | -1 = prev && prev.field === field ? (prev.order === 1 ? -1 : 1) : 1;
      return { field, order: nextOrder };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sort) return gridData;
    const { field, order } = sort;
    const copy = [...gridData];
    copy.sort((a, b) => {
      const av = resolveField(a, field);
      const bv = resolveField(b, field);
      const x = av !== undefined && av !== null ? String(av).toLowerCase() : '';
      const y = bv !== undefined && bv !== null ? String(bv).toLowerCase() : '';
      if (x < y) return -order;
      if (x > y) return order;
      return 0;
    });
    return copy;
  }, [gridData, sort]);

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  const renderCell = (field: string, entity: any, index: number) => {
    switch (field) {
      case 'idx':
        return <span>{index + 1}</span>;
      case 'FirstName':
        return (
          <span>
            {entity.Title && entity.Title.Description ? `${entity.Title.Description} ` : ''}
            <span>{entity.FirstName}</span>&nbsp;<span>{entity.LastName}</span>
          </span>
        );
      case 'Age':
        return (
          <span>
            <span>{entity.Age}</span>&nbsp;/<span>{entity.Gender && entity.Gender.Description}</span>
          </span>
        );
      case 'RegisteredDate':
        return <span>{formatDateDDMMYYYY(entity.RegisteredDate)}</span>;
      case 'Id':
        return (
          <span
            className="grid-action"
            style={{ cursor: 'pointer' }}
            onClick={() => dispatch('editRow', { Id: entity.Id, PatientId: entity.PatientId })}
          >
            <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
          </span>
        );
      default:
        return <span>{resolveField(entity, field) ?? ''}</span>;
    }
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 700,
    color: colors.textMuted,
    padding: `${spacing.md} ${spacing.md}`,
    borderBottom: `2px solid ${colors.border}`,
    backgroundColor: colors.surfaceMuted,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderBottom: `1px solid ${colors.surfaceSunken}`,
    verticalAlign: 'middle',
    fontSize: '13px',
    color: colors.textMain,
    fontFamily: typography.fontFamily,
  };

  return (
    <div className="patientregistration-self-screen" style={{ fontFamily: typography.fontFamily, padding: spacing.md }}>
      <PageHeader
        title="Patient Registered"
        actions={
          <PatientSearchControl
            reactProps={{
              controlId: 'drhms-patinet-search-box',
              canDisable: false,
              tabIndex: 0,
              patientDisplay: patientDisplay,
              placeholder: 'Patient Name/Phone/UHID search',
            }}
            onSearch={onPatientSearch || (() => Promise.resolve([]))}
            onSelect={(patient) => onPatientSelect && onPatientSelect(patient)}
          />
        }
      />

      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 240, position: 'relative' }}>
            <Input
              label="Referral Doctor"
              value={referralQuery}
              onChange={(e) => handleReferralInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (!referralQuery || referralQuery.length === 0)) {
                  dispatch('search');
                }
              }}
              placeholder="Search Referral Doctor"
              autoComplete="off"
            />
            {referralOpen && referralResults.length > 0 && (
              <ul
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: zIndex.dropdown,
                  width: '100%',
                  maxHeight: 200,
                  overflowY: 'auto',
                  margin: 0,
                  padding: `${spacing.xs} 0`,
                  listStyle: 'none',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.sm,
                  boxShadow: shadows.md,
                  boxSizing: 'border-box',
                }}
              >
                {referralResults.map((r, i) => (
                  <li
                    key={r.Id || i}
                    onClick={() => selectReferral(r)}
                    style={{
                      cursor: 'pointer',
                      padding: `${spacing.xs} ${spacing.md}`,
                      fontSize: '13px',
                      fontFamily: typography.fontFamily,
                      color: colors.textMain,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.surfaceMuted; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {r.ReferralName} ({r.ReferralCode})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ minWidth: 200 }}>
            <DatePicker
              label="From Date"
              value={toDateInputValue(currentfilter.FromDate)}
              onChange={(value) => dispatch('dateChange', { field: 'FromDate', value })}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <DatePicker
              label="To Date"
              value={toDateInputValue(currentfilter.ToDate)}
              onChange={(value) => dispatch('dateChange', { field: 'ToDate', value })}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <Select
              label="Type"
              value={currentfilter.MRNTypeId ?? ''}
              onChange={(value) => dispatch('mrnTypeChange', { value: parseInt(String(value), 10) })}
              options={mrnTypeOptions.map((opt) => ({ value: opt.Id ?? '', label: opt.Text ?? '' }))}
            />
          </div>
        </FilterBar>
      </Card>

      <Card padding="0" style={{ marginBottom: spacing.lg }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columnDefs.map((col) => (
                  <th key={col.field} onClick={() => handleSort(col.field)} style={thStyle}>
                    {col.displayName}
                    {sort && sort.field === col.field ? (sort.order === 1 ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columnDefs.length || 1} style={{ ...tdStyle, textAlign: 'center', color: colors.textSubtle, padding: spacing.xl }}>
                    No records found
                  </td>
                </tr>
              ) : (
                sortedData.map((entity, index) => (
                  <tr key={entity.Id || index}>
                    {columnDefs.map((col) => (
                      <td key={col.field} style={tdStyle}>{renderCell(col.field, entity, index)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="fooder-bgs">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }}>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {context && (
              <Button variant="secondary" onClick={() => dispatch('backtoReport')}>
                Back
              </Button>
            )}
            <Button variant="secondary" onClick={() => dispatch('excelDownload')}>
              Export CSV
            </Button>
            {canShowPrint && (
              <Button variant="secondary" onClick={() => dispatch('print')}>
                Print
              </Button>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => dispatch('pageChange', { page })}
          />
        </div>
      </div>
    </div>
  );
};
