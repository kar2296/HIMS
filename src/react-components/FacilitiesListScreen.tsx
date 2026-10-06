import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';
import { ConfirmModal } from './ConfirmModal';

export interface FacilityRow {
  Id: number;
  FacilityCode?: string;
  FacilityName?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  ActiveStatusId?: number;
  OrganizationId?: number;
  Organization?: {
    OrgName?: string;
  };
  PincodeMaster?: {
    Pincode?: string;
  };
  CityMaster?: {
    CityName?: string;
  };
  DistrictMaster?: {
    DistrictName?: string;
  };
  StateMaster?: {
    StateName?: string;
  };
  CountryMaster?: {
    CountryName?: string;
  };
  ActiveStatus?: {
    Description?: string;
  };
}

export interface LookupItem {
  Id: number;
  Text: string;
}

export interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

export interface FacilitiesListScreenProps {
  reactProps?: {
    items?: FacilityRow[];
    pagerObj?: PagerObj;
    currentfilter?: {
      facilityname?: string;
      facilitycode?: string;
      ActiveStatusId?: number;
    };
    lookup?: {
      ActiveStatus?: LookupItem[];
      Organization?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const FacilitiesListScreen: React.FC<FacilitiesListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<FacilityRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{ ActiveStatus: LookupItem[]; Organization: LookupItem[] }>({
    ActiveStatus: [],
    Organization: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<FacilityRow | null>(null);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup = standaloneLookups
  } = reactProps || {};

  const activeStatusOptions = lookup?.ActiveStatus || standaloneLookups.ActiveStatus || [];

  const [searchCode, setSearchCode] = useState(currentfilter.facilitycode || '');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    currentfilter.ActiveStatusId !== undefined ? currentfilter.ActiveStatusId : 2
  );
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  useEffect(() => {
    if (currentfilter.facilitycode !== undefined) {
      setSearchCode(currentfilter.facilitycode);
    }
  }, [currentfilter.facilitycode]);

  useEffect(() => {
    if (currentfilter.ActiveStatusId !== undefined) {
      setStatusFilter(currentfilter.ActiveStatusId);
    }
  }, [currentfilter.ActiveStatusId]);

  useEffect(() => {
    if (pagerObj.currentPage !== undefined) {
      setCurrentPage(pagerObj.currentPage);
    }
  }, [pagerObj.currentPage]);

  // Standalone mode: load lookups and items if reactProps is not supplied
  const isStandalone = !reactProps?.items && !onAction;

  const fetchStandaloneData = async (code: string = searchCode, status: number | undefined = statusFilter, page: number = currentPage) => {
    if (!isStandalone) return;
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const inputData = {
        Params: [
          { Key: 1, Value: '' },
          { Key: 2, Value: code },
          { Key: 3, Value: status !== undefined ? status : 2 },
          { Key: 4, Value: true }
        ],
        PageContext: {
          PageSize: 25,
          PageNumber: page
        }
      };
      const res: any = await callBackendApi({
        action: 'SystemSettings/facility/GetFacilitys',
        data: inputData,
        type: 'post'
      });
      if (res && res.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error fetching facilities standalone:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isStandalone) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [{ Key: 'ActiveStatus' }, { Key: 'Organization' }],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookups({
              ActiveStatus: res.ActiveStatus || [],
              Organization: res.Organization || []
            });
          }
        }).catch(err => console.error('Error fetching lookups:', err));
      });
      fetchStandaloneData(searchCode, statusFilter, 1);
    }
  }, [isStandalone]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const handleSearchSubmit = () => {
    if (onAction) {
      dispatch('search', { value: searchCode });
    } else {
      setCurrentPage(1);
      fetchStandaloneData(searchCode, statusFilter, 1);
    }
  };

  const handleStatusChange = (val: string | number) => {
    const numVal = val !== '' ? parseInt(String(val), 10) : undefined;
    setStatusFilter(numVal);
    if (onAction) {
      dispatch('statusFilterChange', { value: numVal });
    } else {
      setCurrentPage(1);
      fetchStandaloneData(searchCode, numVal, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      dispatch('pageChange', { page });
    } else {
      fetchStandaloneData(searchCode, statusFilter, page);
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      dispatch('addNew');
    } else {
      window.location.hash = '#/app/facility/0/general';
    }
  };

  const handleEdit = (row: FacilityRow) => {
    if (onAction) {
      dispatch('edit', row);
    } else {
      window.location.hash = `#/app/facility/${row.Id}/general`;
    }
  };

  const handleView = (row: FacilityRow) => {
    if (onAction) {
      dispatch('view', row);
    } else {
      window.location.hash = `#/app/facility/${row.Id}/general`;
    }
  };

  const handleDeleteClick = (row: FacilityRow) => {
    if (onAction) {
      dispatch('delete', row);
    } else {
      setItemToDelete(row);
    }
  };

  const handleSettingsClick = (row: FacilityRow) => {
    if (onAction) {
      dispatch('setting', row);
    }
  };

  const confirmDeleteStandalone = async () => {
    if (!itemToDelete) return;
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'SystemSettings/facility/DeleteFacility',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchStandaloneData(searchCode, statusFilter, currentPage);
    } catch (err) {
      console.error('Error deleting facility:', err);
    }
  };

  const displayItems = useMemo(() => items || [], [items]);

  const thStyle: React.CSSProperties = {
    padding: `${spacing.sm}px ${spacing.md}px`,
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textSecondary,
    borderBottom: `2px solid ${colors.border}`,
    backgroundColor: '#f8fafc',
    whiteSpace: 'nowrap'
  };

  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: '13px',
    color: colors.textMain,
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle'
  };

  const renderStatusBadge = (statusDesc?: string, statusId?: number) => {
    const desc = statusDesc || (statusId === 1 ? 'Draft' : statusId === 2 ? 'Active' : statusId === 3 ? 'Inactive' : 'Pending');
    let bg = '#f1f5f9';
    let color = '#475569';
    let borderColor = '#cbd5e1';

    if (desc.toLowerCase() === 'active') {
      bg = '#ecfdf5';
      color = '#059669';
      borderColor = '#a7f3d0';
    } else if (desc.toLowerCase() === 'draft') {
      bg = '#eff6ff';
      color = '#2563eb';
      borderColor = '#bfdbfe';
    } else if (desc.toLowerCase() === 'inactive' || desc.toLowerCase() === 'deactive') {
      bg = '#fef2f2';
      color = '#dc2626';
      borderColor = '#fecaca';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${borderColor}`,
          textTransform: 'capitalize'
        }}
      >
        {desc}
      </span>
    );
  };

  const renderAddress = (row: FacilityRow) => {
    const parts = [
      row.AddressLine1,
      row.AddressLine2,
      row.CityMaster?.CityName,
      row.PincodeMaster?.Pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div style={{ padding: spacing.md, maxWidth: '100%' }}>
      <PageHeader
        title="Facilities"
        breadcrumbs={[
          { label: 'Application Manager' },
          { label: 'Facilities', active: true }
        ]}
        actions={
          <Button
            id="btnAddFacility"
            variant="primary"
            onClick={handleAddNew}
            icon="fa-plus"
          >
            Add New Facility
          </Button>
        }
      />

      <Card style={{ marginTop: spacing.md, padding: 0 }}>
        <FilterBar style={{ padding: spacing.md, display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'flex-end', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ flex: '1 1 240px', minWidth: 200 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>
              Search Code / Name
            </label>
            <Input
              id="txtFacilitySearch"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              placeholder="Search by Code or Name..."
              icon="fa-search"
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>
              Status Filter
            </label>
            <Select
              id="ddlFacilityFilterStatus"
              value={statusFilter !== undefined ? String(statusFilter) : ''}
              options={[
                { value: '', label: 'All Statuses' },
                ...activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))
              ]}
              onChange={handleStatusChange}
              placeholder="Select Status"
            />
          </div>

          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-end' }}>
            <Button
              id="btnFacilitySearch"
              variant="secondary"
              onClick={handleSearchSubmit}
              icon="fa-search"
            >
              Search
            </Button>
            {(searchCode || (statusFilter !== undefined && statusFilter !== 2)) && (
              <Button
                id="btnFacilityReset"
                variant="ghost"
                onClick={() => {
                  setSearchCode('');
                  setStatusFilter(2);
                  if (onAction) {
                    dispatch('search', { value: '' });
                    dispatch('statusFilterChange', { value: 2 });
                  } else {
                    setCurrentPage(1);
                    fetchStandaloneData('', 2, 1);
                  }
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table id="tblFacilitiesList" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Facility Code</th>
                <th style={thStyle}>Facility Name</th>
                <th style={thStyle}>Organization</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', padding: spacing.xl }} colSpan={6}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: spacing.sm }} /> Loading facilities...
                  </td>
                </tr>
              )}
              {!isLoading && displayItems.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', padding: spacing.xl, color: colors.textMuted }} colSpan={6}>
                    No facilities found.
                  </td>
                </tr>
              )}
              {!isLoading && displayItems.map((row) => (
                <tr
                  key={row.Id}
                  id={`facilityRow_${row.Id}`}
                  style={{
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <span
                      onClick={() => handleView(row)}
                      style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'none' }}
                      title="View details"
                    >
                      {row.FacilityCode || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {row.FacilityName || '-'}
                  </td>
                  <td style={tdStyle}>
                    {row.Organization?.OrgName || '-'}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={renderAddress(row)}>
                    {renderAddress(row)}
                  </td>
                  <td style={tdStyle}>
                    {renderStatusBadge(row.ActiveStatus?.Description, row.ActiveStatusId)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: spacing.sm, alignItems: 'center' }}>
                      {/* View icon if active / approved / active-like */}
                      {(row.ActiveStatusId === 2 || row.ActiveStatusId === 3 || row.ActiveStatusId === 4 || row.ActiveStatusId === 5) && (
                        <button
                          type="button"
                          id={`btnViewFacility_${row.Id}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#0284c7'
                          }}
                          onClick={() => handleView(row)}
                          title="View Details"
                        >
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="View" style={{ width: 16, height: 16 }} />
                        </button>
                      )}

                      {/* Edit icon if draft (ActiveStatusId == 1) */}
                      {row.ActiveStatusId === 1 && (
                        <button
                          type="button"
                          id={`btnEditFacility_${row.Id}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#0284c7'
                          }}
                          onClick={() => handleEdit(row)}
                          title="Edit Facility"
                        >
                          <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" style={{ width: 16, height: 16 }} />
                        </button>
                      )}

                      {/* Delete icon if draft (ActiveStatusId == 1) */}
                      {row.ActiveStatusId === 1 && (
                        <button
                          type="button"
                          id={`btnDeleteFacility_${row.Id}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#ef4444'
                          }}
                          onClick={() => handleDeleteClick(row)}
                          title="Delete Facility"
                        >
                          <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" style={{ width: 16, height: 16 }} />
                        </button>
                      )}

                      {/* Setting button */}
                      <button
                        type="button"
                        id={`btnSettingFacility_${row.Id}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: '#64748b'
                        }}
                        onClick={() => handleSettingsClick(row)}
                        title="Facility Settings"
                      >
                        <i className="fa fa-cog" style={{ fontSize: '14px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagerObj.totalItems !== undefined && pagerObj.totalItems > 0 && (
          <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }}>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>
              Showing {Math.min((currentPage - 1) * (pagerObj.pageSize || 25) + 1, pagerObj.totalItems)} to{' '}
              {Math.min(currentPage * (pagerObj.pageSize || 25), pagerObj.totalItems)} of {pagerObj.totalItems} facilities
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(pagerObj.totalItems / (pagerObj.pageSize || 25))}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* Delete confirmation modal for standalone mode */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Facility"
        message={`Are you sure you want to delete "${itemToDelete?.FacilityName}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteStandalone}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
