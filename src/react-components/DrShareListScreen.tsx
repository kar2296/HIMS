import React from 'react';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { Button } from './Button';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DoctorShareRow {
  Id: number;
  DoctorClass?: { Description?: string };
  ShareType?: { Description?: string };
  ActiveFrom?: string;
  ActiveTo?: string;
  EncounterType?: { Description?: string };
  ActiveStatus?: { Description?: string };
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface DrShareListScreenProps {
  reactProps?: {
    currentfilter?: {
      DoctorClassId?: number;
      ShareTypeId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      DoctorClass?: LookupItem[];
      ShareType?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
    gridData?: DoctorShareRow[];
    pagerObj?: PagerObj;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Matches the original ngformatdate directive's datetime-val binding
// ({{datetimeVal | date : 'dd-MMM-yyyy HH:mm'}}), reproduced verbatim.
function formatDateTime(val?: string): string {
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

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
};

// React bridge migration (single mount): doctorsharelist.js has no active
// native-only widgets (no autosearch/patientsearch) and no
// utl.Validator.validate($scope) call, so the entire screen -- header,
// filters, grid, and pagination -- is rendered by this one
// <react-component> mount (app.drfeemapping / doctorShareListController).
//
// Preserved real API calls (unchanged): billing/doctorshare/GetDoctorShare
// (getList, filtered by DoctorClassId/ShareTypeId/ActiveStatusId, real
// server-side pagination via PageContext.PageSize/PageNumber -- unlike
// several other migrated Billing screens, this pager is NOT dead),
// General/Options/getoptions (Facility/DoctorClass/ShareType/ActiveStatus
// lookups). Add New and row Edit both navigate via $state.go to
// app.drfeemappingform ({id: 0} / {id: row.Id}), not a modal.
//
// Confirmed pre-existing quirk, reproduced as-is: the filter label for
// DoctorClassId reads "Doctor Share Class" (billing.doctorshare.
// drshareclass.lbl) while the grid column header for the same underlying
// field reads "Doctor Class" (billing.doctorshare.drclass.lbl) -- the two
// labels genuinely differ in the original template; not unified here.
export const DrShareListScreen: React.FC<DrShareListScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const gridData = reactProps?.gridData || [];
  const pagerObj = reactProps?.pagerObj || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const doctorClassOptions = (lookup.DoctorClass || []).map((o) => ({ value: o.Id, label: o.Text }));
  const shareTypeOptions = (lookup.ShareType || []).map((o) => ({ value: o.Id, label: o.Text }));
  const activeStatusOptions = (lookup.ActiveStatus || []).map((o) => ({ value: o.Id, label: o.Text }));

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Doctor Fee Master"
        actions={
          <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Doctor Share Class"
              options={doctorClassOptions}
              value={currentfilter.DoctorClassId ?? -1}
              onChange={(v) => dispatch('doctorClassChange', { value: Number(v) })}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Fee Type"
              options={shareTypeOptions}
              value={currentfilter.ShareTypeId ?? -1}
              onChange={(v) => dispatch('shareTypeChange', { value: Number(v) })}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Status"
              options={activeStatusOptions}
              value={currentfilter.ActiveStatusId ?? 2}
              onChange={(v) => dispatch('activeStatusChange', { value: Number(v) })}
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Doctor Class</th>
                <th style={thStyle}>Fee Type</th>
                <th style={thStyle}>Active From</th>
                <th style={thStyle}>Active To</th>
                <th style={thStyle}>Visit Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridData.length === 0 && (
                <tr><td style={tdStyle} colSpan={7}>No records found.</td></tr>
              )}
              {gridData.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.DoctorClass?.Description}</td>
                  <td style={tdStyle}>{row.ShareType?.Description}</td>
                  <td style={tdStyle}>{formatDateTime(row.ActiveFrom)}</td>
                  <td style={tdStyle}>{formatDateTime(row.ActiveTo)}</td>
                  <td style={tdStyle}>{row.EncounterType?.Description}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description}</td>
                  <td style={tdStyle}>
                    <span style={{ cursor: 'pointer' }} title="Edit" onClick={() => dispatch('edit', { entity: row })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
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
