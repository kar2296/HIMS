import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { RoleControlMapModal } from './RoleControlMapModal';

export interface RoleListItem {
  Id: number;
  RoleName: string;
  RoleCode?: string;
  Description?: string;
  FacilityId?: number;
  ActiveStatusId?: number;
  IsActive?: boolean;
  Facility?: {
    Id: number;
    FacilityName: string;
  };
  ActiveStatus?: {
    Id: number;
    Description: string;
  };
  [key: string]: any;
}

export interface RolesListScreenProps {
  reactProps?: {
    items?: RoleListItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      Facility?: Array<{ Id: number; Text: string }>;
      ActiveStatus?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      CodeName?: string;
      FacilityId?: number;
      ActiveStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const RolesListScreen: React.FC<RolesListScreenProps> = ({ reactProps, onAction }) => {
  // Check if bridged from AngularJS
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Filter States
  const [codeName, setCodeName] = useState<string>(reactProps?.currentfilter?.CodeName || '');
  const [facilityId, setFacilityId] = useState<number>(reactProps?.currentfilter?.FacilityId ?? -1);
  const [activeStatusId, setActiveStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Data States
  const [items, setItems] = useState<RoleListItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lookups
  const [facilityOptions, setFacilityOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Facility || []
  );
  const [activeStatusOptions, setActiveStatusOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.ActiveStatus || []
  );

  // Modal States
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; item: RoleListItem | null }>({
    isOpen: false,
    item: null
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [controlMapState, setControlMapState] = useState<{
    isOpen: boolean;
    roleId: number;
    roleName: string;
  }>({
    isOpen: false,
    roleId: 0,
    roleName: ''
  });

  // Sync props when bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.lookup?.Facility) setFacilityOptions(reactProps.lookup.Facility);
      if (reactProps.lookup?.ActiveStatus) setActiveStatusOptions(reactProps.lookup.ActiveStatus);
      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.CodeName !== undefined) setCodeName(reactProps.currentfilter.CodeName || '');
        if (reactProps.currentfilter.FacilityId !== undefined) setFacilityId(reactProps.currentfilter.FacilityId ?? -1);
        if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId ?? 2);
      }
    }
  }, [reactProps]);

  // Fetch Lookups in standalone mode
  useEffect(() => {
    if (isBridged) return;

    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const lookupPayload = [
          { Key: 'ActiveStatus' },
          {
            Key: 'Facility',
            Request: {
              Params: [{ Key: 4, Value: true }]
            }
          }
        ];

        const res = await apiFetch<any>('General/Options/getoptions', lookupPayload);

        if (isMounted && res) {
          if (res.ActiveStatus) setActiveStatusOptions(res.ActiveStatus);
          if (res.Facility) setFacilityOptions(res.Facility);
        }
      } catch (err) {
        console.error('Failed to load role lookups:', err);
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, [isBridged]);

  // Fetch Role Items
  const fetchRolesList = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      if (isBridged) {
        if (onAction) {
          onAction('filterChange', {
            currentfilter: {
              CodeName: codeName,
              FacilityId: facilityId,
              ActiveStatusId: activeStatusId
            },
            pageContext: {
              currentPage: page,
              pageSize: size
            }
          });
        }
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const params: Array<{ Key: number; Value: any }> = [
          { Key: 1, Value: codeName || '' },
          { Key: 4, Value: facilityId > 0 ? facilityId : null },
          { Key: 3, Value: activeStatusId > 0 ? activeStatusId : null }
        ];

        const reqBody = {
          Params: params,
          PageContext: {
            PageSize: size,
            PageNumber: page
          }
        };

        const res = await apiFetch<any>('SystemSettings/role/GetRoles', reqBody);

        if (res) {
          setItems(res.Data || []);
          if (res.PageContext?.TotalRecords !== undefined) {
            setTotalItems(res.PageContext.TotalRecords);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch roles:', err);
        setErrorMsg(err.message || 'Failed to fetch roles list.');
      } finally {
        setLoading(false);
      }
    },
    [isBridged, onAction, codeName, facilityId, activeStatusId, currentPage, pageSize]
  );

  // Trigger search on mount and filter changes in standalone mode
  useEffect(() => {
    if (!isBridged) {
      fetchRolesList(currentPage, pageSize);
    }
  }, [currentPage, pageSize, facilityId, activeStatusId]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchRolesList(1, pageSize);
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
      return;
    }
    // AngularJS or React fallback
    if (window.location.hash.startsWith('#/app')) {
      window.location.hash = '#/app/role/0/general';
    } else {
      window.location.href = '/app/role/0';
    }
  };

  const handleEdit = (role: RoleListItem) => {
    if (onAction) {
      onAction('edit', role);
      return;
    }
    if (window.location.hash.startsWith('#/app')) {
      window.location.hash = `#/app/role/${role.Id}/general`;
    } else {
      window.location.href = `/app/role/${role.Id}`;
    }
  };

  const handleOpenControlMap = (role: RoleListItem) => {
    if (onAction) {
      onAction('rolecontrolmap', role);
    }
    setControlMapState({
      isOpen: true,
      roleId: role.Id,
      roleName: role.RoleName
    });
  };

  const handleDeletePrompt = (role: RoleListItem) => {
    setDeleteModalState({
      isOpen: true,
      item: role
    });
  };

  const handleConfirmDelete = async () => {
    const item = deleteModalState.item;
    if (!item) return;

    if (onAction) {
      onAction('delete', item);
      setDeleteModalState({ isOpen: false, item: null });
      return;
    }

    setIsDeleting(true);
    try {
      await apiFetch<any>('SystemSettings/role/DeleteRole', { Id: item.Id });

      setDeleteModalState({ isOpen: false, item: null });
      fetchRolesList(currentPage, pageSize);
    } catch (err: any) {
      console.error('Failed to delete role:', err);
      alert(err.message || 'Failed to delete role.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchRolesList(newPage, pageSize);
  };

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        minHeight: '100%',
        padding: spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
    >
      {/* Top Header & Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          backgroundColor: colors.background.secondary,
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`
        }}
      >
        {/* Title & Count Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              backgroundColor: 'rgba(74, 144, 226, 0.12)',
              color: colors.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}
          >
            <i className="fa fa-user-shield" />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.semibold,
                color: colors.text.primary
              }}
            >
              Roles Master
            </h2>
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
              Manage system permissions, security profiles, and accessible menus
            </span>
          </div>
          <span
            style={{
              marginLeft: spacing.xs,
              padding: '2px 8px',
              borderRadius: radii.full,
              backgroundColor: colors.background.tertiary,
              color: colors.text.secondary,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium
            }}
          >
            {totalItems} Records
          </span>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
          {/* Facility Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Facility:
            </label>
            <select
              value={facilityId ?? -1}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFacilityId(val);
                setCurrentPage(1);
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                minWidth: 150,
                outline: 'none'
              }}
            >
              <option value={-1}>All Facilities</option>
              {facilityOptions.map((fac) => (
                <option key={fac.Id} value={fac.Id}>
                  {fac.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Status:
            </label>
            <select
              value={activeStatusId ?? 2}
              onChange={(e) => {
                const val = Number(e.target.value);
                setActiveStatusId(val);
                setCurrentPage(1);
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '6px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                minWidth: 130,
                outline: 'none'
              }}
            >
              <option value={-1}>All Statuses</option>
              {activeStatusOptions.map((st) => (
                <option key={st.Id} value={st.Id}>
                  {st.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i
              className="fa fa-search"
              style={{
                position: 'absolute',
                left: 10,
                color: colors.text.secondary,
                fontSize: 12
              }}
            />
            <input
              type="text"
              placeholder="Search Role Name / Code..."
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '6px 12px 6px 30px',
                borderRadius: radii.full,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                width: 210,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: spacing.xs,
                padding: '6px 12px',
                fontSize: typography.fontSizes.xs,
                backgroundColor: colors.background.tertiary,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: radii.sm,
                cursor: 'pointer',
                color: colors.text.primary
              }}
            >
              Search
            </button>
          </form>

          {/* Add New Role Button */}
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              padding: '6px 16px',
              backgroundColor: colors.primary.main,
              color: '#fff',
              border: 'none',
              borderRadius: radii.sm,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              boxShadow: '0 2px 6px rgba(74, 144, 226, 0.3)'
            }}
          >
            <i className="fa fa-plus" />
            Add Role
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: colors.state.dangerLight,
            color: colors.state.danger,
            borderRadius: radii.md,
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
          }}
        >
          <i className="fa fa-exclamation-triangle" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Roles Table */}
      <div
        style={{
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: radii.md,
          overflow: 'hidden',
          backgroundColor: colors.background.primary,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
            <thead>
              <tr
                style={{
                  backgroundColor: colors.background.secondary,
                  borderBottom: `2px solid ${colors.border.subtle}`,
                  color: colors.text.secondary,
                  fontSize: typography.fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <th style={{ padding: '12px 16px', width: '22%' }}>Role Name</th>
                <th style={{ padding: '12px 16px', width: '33%' }}>Description / Details</th>
                <th style={{ padding: '12px 16px', width: '18%' }}>Facility</th>
                <th style={{ padding: '12px 16px', width: '12%' }}>Status</th>
                <th style={{ padding: '12px 16px', width: '15%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
                    <div>Loading roles...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                    <div style={{ fontSize: 36, opacity: 0.3, marginBottom: spacing.sm }}>
                      <i className="fa fa-shield-alt" />
                    </div>
                    <div style={{ fontWeight: typography.fontWeights.medium, fontSize: typography.fontSizes.md }}>
                      No Roles Found
                    </div>
                    <div style={{ fontSize: typography.fontSizes.xs, marginTop: 4 }}>
                      Try adjusting your search criteria or create a new role.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((role, idx) => {
                  const statusDesc = role.ActiveStatus?.Description || (role.ActiveStatusId === 2 ? 'Active' : 'Inactive');
                  const isActive = role.ActiveStatusId === 2;
                  const facilityName = role.Facility?.FacilityName || (role.FacilityId === -1 ? 'All Facilities' : 'Corporate / Main');

                  return (
                    <tr
                      key={role.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.background.secondary)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Role Name & Code */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: typography.fontWeights.semibold, color: colors.text.primary, fontSize: typography.fontSizes.sm }}>
                          {role.RoleName}
                        </div>
                        {role.RoleCode && (
                          <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, marginTop: 2 }}>
                            Code: <code style={{ backgroundColor: colors.background.tertiary, padding: '1px 4px', borderRadius: radii.xs }}>{role.RoleCode}</code>
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td style={{ padding: '12px 16px', color: colors.text.secondary, fontSize: typography.fontSizes.sm }}>
                        {role.Description || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No description provided</span>}
                      </td>

                      {/* Facility */}
                      <td style={{ padding: '12px 16px', fontSize: typography.fontSizes.sm }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: colors.background.tertiary,
                            color: colors.text.primary,
                            fontSize: typography.fontSizes.xs
                          }}
                        >
                          <i className="fa fa-hospital" style={{ color: colors.primary.main, fontSize: 11 }} />
                          {facilityName}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            fontSize: typography.fontSizes.xs,
                            fontWeight: typography.fontWeights.medium,
                            backgroundColor: isActive ? 'rgba(40, 167, 69, 0.12)' : 'rgba(108, 117, 125, 0.15)',
                            color: isActive ? '#1e7e34' : '#495057'
                          }}
                        >
                          {statusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                          {/* Edit Button */}
                          <button
                            type="button"
                            title="Edit Role & Permissions"
                            onClick={() => handleEdit(role)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border.subtle}`,
                              backgroundColor: colors.background.primary,
                              color: colors.primary.main,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary.main;
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.background.primary;
                              e.currentTarget.style.color = colors.primary.main;
                            }}
                          >
                            <i className="fa fa-edit" />
                          </button>

                          {/* Role Controls Button */}
                          <button
                            type="button"
                            title="Map Menus & Controls"
                            onClick={() => handleOpenControlMap(role)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border.subtle}`,
                              backgroundColor: colors.background.primary,
                              color: '#6f42c1',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#6f42c1';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.background.primary;
                              e.currentTarget.style.color = '#6f42c1';
                            }}
                          >
                            <i className="fa fa-cogs" />
                          </button>

                          {/* Delete Button (disabled if active or hidden as in angular) */}
                          <button
                            type="button"
                            title={role.ActiveStatusId === 2 ? 'Active roles cannot be deleted' : 'Delete Role'}
                            disabled={role.ActiveStatusId === 2}
                            onClick={() => handleDeletePrompt(role)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border.subtle}`,
                              backgroundColor: colors.background.primary,
                              color: role.ActiveStatusId === 2 ? colors.text.disabled : colors.state.danger,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: role.ActiveStatusId === 2 ? 'not-allowed' : 'pointer',
                              opacity: role.ActiveStatusId === 2 ? 0.4 : 1,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (role.ActiveStatusId !== 2) {
                                e.currentTarget.style.backgroundColor = colors.state.danger;
                                e.currentTarget.style.color = '#fff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (role.ActiveStatusId !== 2) {
                                e.currentTarget.style.backgroundColor = colors.background.primary;
                                e.currentTarget.style.color = colors.state.danger;
                              }
                            }}
                          >
                            <i className="fa fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background.secondary,
            gap: spacing.sm
          }}
        >
          <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            Showing {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '4px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                cursor: currentPage <= 1 || loading ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1
              }}
            >
              <i className="fa fa-chevron-left" /> Prev
            </button>

            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, padding: '0 6px' }}>
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '4px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                cursor: currentPage >= totalPages || loading ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1
              }}
            >
              Next <i className="fa fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md
          }}
          onClick={() => setDeleteModalState({ isOpen: false, item: null })}
        >
          <div
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: radii.lg,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: 420,
              padding: spacing.lg,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.full,
                  backgroundColor: colors.state.dangerLight,
                  color: colors.state.danger,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <i className="fa fa-exclamation-triangle" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, color: colors.text.primary }}>
                  Confirm Role Deletion
                </h4>
                <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, marginTop: 2 }}>
                  Are you sure you want to delete role{' '}
                  <strong>{deleteModalState.item?.RoleName}</strong>? This action cannot be undone.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm }}>
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, item: null })}
                disabled={isDeleting}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  fontSize: typography.fontSizes.sm,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '7px 20px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: colors.state.danger,
                  color: '#fff',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.medium,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
              >
                {isDeleting ? (
                  <>
                    <i className="fa fa-spinner fa-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa fa-trash-alt" /> Delete Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Control Map Modal */}
      <RoleControlMapModal
        isOpen={controlMapState.isOpen}
        roleId={controlMapState.roleId}
        roleName={controlMapState.roleName}
        onClose={() => setControlMapState({ isOpen: false, roleId: 0, roleName: '' })}
        onSaved={() => {
          fetchRolesList(currentPage, pageSize);
        }}
      />
    </div>
  );
};
