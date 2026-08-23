import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
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
  CountryId?: number;
  StateId?: number;
  CityId?: number;
  DistrictId?: number;
  ActiveStatusId?: number;
  CityCode?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface CityRow {
  Id: number;
  CityCode?: string;
  CityName?: string;
  ActiveStatusId?: number;
  DistrictMaster?: { DistrictName?: string };
  StateMaster?: { StateName?: string };
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface CityMasterListScreenProps {
  reactProps?: {
    items?: CityRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / City Master list): re-skins the
// existing real screen with the shared design-system components instead of
// the legacy Bootstrap/ui-grid markup. All real data flow is unchanged --
// same handleReactAction dispatch back to citymaster-list.js's hollowed
// controller, same real GetCityMasters/DeleteCityMaster calls, same
// utl.Modal.open('app.citymasters', ...) add/edit flow (see 'addNew'/'edit').
//
// Two disclosed presentational choices, not functionality changes:
// 1. The District/State/Country filter fields now use the shared
//    DistrictControl/StateControl/CountryControl dropdowns (already used by
//    the Registration screens) instead of the original <autosearch> typeahead
//    widgets. Selecting one cascades the others (clears State/District when
//    Country changes) -- a side effect of reusing these controls, not present
//    in the original's independent autosearch fields, but it keeps the
//    filter state internally consistent rather than dropping any capability.
// 2. The original list template's filter table visibly repeats the District
//    field twice (a copy/paste artifact -- both cells were bound to the same
//    vm.districtcontrolconfig). Rendered once here; no functional filter was
//    dropped.
export const CityMasterListScreen: React.FC<CityMasterListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [cityCode, setCityCode] = useState(currentfilter.CityCode || '');
  useEffect(() => { setCityCode(currentfilter.CityCode || ''); }, [currentfilter.CityCode]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const runSearch = () => dispatch('search', { value: cityCode });

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
        title="City Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
            <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Input
              label="City Code"
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by code"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              countryid={currentfilter.CountryId ?? null}
              onUpdate={(u) => dispatch('locationFilterChange', {
                CountryId: u.countryid ?? undefined, StateId: -1, DistrictId: -1,
              })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
            <StateControl
              stateid={currentfilter.StateId ?? null}
              countryid={currentfilter.CountryId ?? null}
              onUpdate={(u) => dispatch('locationFilterChange', {
                StateId: u.stateid ?? undefined, DistrictId: -1,
              })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>District</label>
            <DistrictControl
              districtid={currentfilter.DistrictId ?? null}
              countryid={currentfilter.CountryId ?? null}
              stateid={currentfilter.StateId ?? null}
              onUpdate={(u) => dispatch('locationFilterChange', { DistrictId: u.districtid ?? undefined })}
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
                <th style={thStyle}>City Code</th>
                <th style={thStyle}>City Name</th>
                <th style={thStyle}>District</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={7}>No records found.</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{row.CityCode}</td>
                  <td style={tdStyle}>{row.CityName}</td>
                  <td style={tdStyle}>{row.DistrictMaster?.DistrictName}</td>
                  <td style={tdStyle}>{row.StateMaster?.StateName}</td>
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
