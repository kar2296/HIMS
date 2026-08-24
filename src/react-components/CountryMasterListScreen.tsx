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
  CountryCode?: string;
  CountryName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface CountryRow {
  Id: number;
  CountryCode?: string;
  CountryName?: string;
  ActiveStatusId?: number;
  ActiveStatus?: { Description?: string };
}

interface CountryMasterListScreenProps {
  reactProps?: {
    items?: CountryRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Country Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/ui-grid markup. All real data flow is unchanged --
// same handleReactAction dispatch back to countrymaster-list.js's hollowed
// controller, same real GetCountryMasters/DeleteCountryMaster calls, same
// utl.Modal.open('app.countrymasters', ...) add/edit flow.
//
// Note: unlike City/State Master, this screen has no "Dashboard/Home" button
// and no backtoList() function in the live controller/template -- confirmed,
// not an oversight -- so none is rendered here either.
export const CountryMasterListScreen: React.FC<CountryMasterListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [countryCode, setCountryCode] = useState(currentfilter.CountryCode || '');
  useEffect(() => { setCountryCode(currentfilter.CountryCode || ''); }, [currentfilter.CountryCode]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const runSearch = () => dispatch('search', { value: countryCode });

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
        title="Country Master"
        actions={
          <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Input
              label="Country Code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by code"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Status"
              value={currentfilter.ActiveStatusId != null ? String(currentfilter.ActiveStatusId) : ''}
              options={activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('statusFilterChange', { value: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Country Code</th>
                <th style={thStyle}>Country Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={4}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.CountryCode}</td>
                  <td style={tdStyle}>{row.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <span
                        className="grid-action" style={{ cursor: 'pointer' }}
                        onClick={() => dispatch('edit', row)}
                        title="Edit"
                      >
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                      </span>
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
