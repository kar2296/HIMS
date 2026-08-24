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
  CountryId?: number;
  StateId?: number;
  CityId?: number;
  ActiveStatusId?: number;
  Pincode?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface PincodeRow {
  Id: number;
  Pincode?: string;
  Area?: string;
  ActiveStatusId?: number;
  CityMaster?: { CityName?: string };
  DistrictMaster?: { DistrictName?: string };
  StateMaster?: { StateName?: string };
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface PincodeMasterListScreenProps {
  reactProps?: {
    items?: PincodeRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { Country?: LookupItem[]; State?: LookupItem[]; City?: LookupItem[]; ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Pincode Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/custom-table markup. All real data flow is
// unchanged -- same handleReactAction dispatch back to pincode-list.js's
// hollowed controller, same real GetPincodeMasters/DeletePincodeMaster calls,
// same utl.Modal.open('app.pincode', ...) add/edit flow.
//
// Disclosed presentational choice, not a functionality change: the live
// filter bar's Country/State/City fields are plain <ui-select> bound
// directly to lookup.Country/State/City (populated by this controller's own
// initLookup, unlike the form) -- ported here as plain Select dropdowns.
// There is no District filter in the live template (DistrictId is a real
// GetPincodeMasters query param, key 9, but no control ever sets it) --
// confirmed, not reproduced. The Dashboard/Home button (backtoList()) IS
// live in this controller/template, unlike Country/District Master --
// reproduced.
export const PincodeMasterListScreen: React.FC<PincodeMasterListScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    pagerObj = {},
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const countryOptions = lookup?.Country || [];
  const stateOptions = lookup?.State || [];
  const cityOptions = lookup?.City || [];
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [pincode, setPincode] = useState(currentfilter.Pincode || '');
  useEffect(() => { setPincode(currentfilter.Pincode || ''); }, [currentfilter.Pincode]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const runSearch = () => dispatch('search', { value: pincode });

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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Pincode Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
            <Button variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 180 }}>
            <Input
              label="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by pincode"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Country"
              value={currentfilter.CountryId != null ? String(currentfilter.CountryId) : ''}
              options={countryOptions.map((c) => ({ value: String(c.Id), label: c.Text }))}
              onChange={(v) => dispatch('locationFilterChange', { CountryId: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="State"
              value={currentfilter.StateId != null ? String(currentfilter.StateId) : ''}
              options={stateOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => dispatch('locationFilterChange', { StateId: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="City"
              value={currentfilter.CityId != null ? String(currentfilter.CityId) : ''}
              options={cityOptions.map((c) => ({ value: String(c.Id), label: c.Text }))}
              onChange={(v) => dispatch('locationFilterChange', { CityId: v ? parseInt(String(v), 10) : undefined })}
              placeholder="All"
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
                <th style={thStyle}>Pincode</th>
                <th style={thStyle}>Area</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>District</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Country</th>
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
                  <td style={tdStyle}>{row.Pincode}</td>
                  <td style={tdStyle}>{row.Area}</td>
                  <td style={tdStyle}>{row.CityMaster?.CityName}</td>
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
