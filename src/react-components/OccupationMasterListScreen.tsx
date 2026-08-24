import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  ActiveStatusId?: number;
  Occupations?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface OccupationRow {
  Id: number;
  Code?: string;
  ShortCode?: string;
  Occupations?: string;
  ActiveStatusId?: number;
  OccupationType?: { Description?: string };
  ActiveStatus?: { Description?: string };
}

interface OccupationMasterListScreenProps {
  reactProps?: {
    items?: OccupationRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Occupation Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/custom-table markup. All real data flow is
// unchanged -- same handleReactAction dispatch back to occupation-list.js's
// hollowed controller, same real GetOccupations/DeleteOccupation calls, same
// utl.Modal.open('app.occupations', ...) add/edit flow.
//
// Disclosed presentational choice, not a functionality change: the live
// filter bar is Status (Select) + a free-text "Occupations" search input --
// there is no OccupationTypeId filter control in the live template, even
// though it's a real GetOccupations query param (key 3) -- confirmed, not
// reproduced.
//
// IMPORTANT, preserved exactly (differs from City/State/Country/District/
// Pincode Master): the live cellTemplate shows the Edit action ONLY when
// ActiveStatusId===2 (a single ng-show, not the two-branch always-show-edit
// pattern used by the Location Hierarchy masters) -- so rows with
// ActiveStatusId 1 or 3 show only Delete, no Edit at all. Reproduced exactly.
export const OccupationMasterListScreen: React.FC<OccupationMasterListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [occupations, setOccupations] = useState(currentfilter.Occupations || '');
  useEffect(() => { setOccupations(currentfilter.Occupations || ''); }, [currentfilter.Occupations]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const runSearch = () => dispatch('search', { value: occupations });

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Occupation Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
            <Button variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Status"
              value={currentfilter.ActiveStatusId != null ? String(currentfilter.ActiveStatusId) : ''}
              options={activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Occupations"
              value={occupations}
              onChange={(e) => setOccupations(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search occupations"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Short Code</th>
                <th style={thStyle}>Occupations</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={6}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.OccupationType?.Description}</td>
                  <td style={tdStyle}>{row.Code}</td>
                  <td style={tdStyle}>{row.ShortCode}</td>
                  <td style={tdStyle}>{row.Occupations}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      {row.ActiveStatusId === 2 && (
                        <span
                          className="grid-action" style={{ cursor: 'pointer' }}
                          onClick={() => dispatch('edit', row)}
                          title="Edit"
                        >
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                        </span>
                      )}
                      {(row.ActiveStatusId === 1 || row.ActiveStatusId === 3) && (
                        <span
                          className="grid-action" style={{ cursor: 'pointer' }}
                          onClick={() => dispatch('delete', row)}
                          title="Delete"
                        >
                          <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" aria-hidden="true" />
                        </span>
                      )}
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
