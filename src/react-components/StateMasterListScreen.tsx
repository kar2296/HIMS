import React from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
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
  CountryId?: number;
  StateId?: number;
  CityId?: number;
  ActiveStatusId?: number;
  StateCode?: string;
  StateName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface StateRow {
  Id: number;
  StateCode?: string;
  StateName?: string;
  ActiveStatusId?: number;
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface StateMasterListScreenProps {
  reactProps?: {
    items?: StateRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / State Master list): re-skins the
// existing real screen with the shared design-system components instead of
// the legacy Bootstrap/ui-grid markup. All real data flow is unchanged --
// same handleReactAction dispatch back to statemaster-list.js's hollowed
// controller, same real GetStateMasters/DeleteStateMaster calls, same
// utl.Modal.open('app.statemasters', ...) add/edit flow (see 'addNew'/'edit').
//
// Disclosed presentational choice, not a functionality change: the Country
// filter uses the shared CountryControl dropdown (already used by
// Registration and City Master) instead of the original <autosearch>
// typeahead widget. The original template's StateCode/StateName text-filter
// inputs and the standalone State autosearch config are commented out
// (dead) in the live markup -- confirmed against the current template, not
// assumed -- so they are correctly not reproduced here either.
export const StateMasterListScreen: React.FC<StateMasterListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="State Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
            <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              countryid={currentfilter.CountryId ?? null}
              onUpdate={(u) => dispatch('locationFilterChange', { CountryId: u.countryid ?? undefined })}
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
                <th style={thStyle}>State Code</th>
                <th style={thStyle}>State Name</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={5}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.StateCode}</td>
                  <td style={tdStyle}>{row.StateName}</td>
                  <td style={tdStyle}>{row.CountryMaster?.CountryName}</td>
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
