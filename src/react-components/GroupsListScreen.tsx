import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface GroupListItem {
  Id: number;
  GroupCode: string;
  GroupName: string;
  Description?: string;
  FacilityId?: number;
  ActiveStatusId?: number;
  IsActive?: boolean;
  IsAllFacility?: boolean;
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

export interface GroupsListScreenProps {
  reactProps?: {
    items?: GroupListItem[];
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

export const GroupsListScreen: React.FC<GroupsListScreenProps> = ({ reactProps, onAction }) => {
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
  const [items, setItems] = useState<GroupListItem[]>(reactProps?.items || []);
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
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; item: GroupListItem | null }>({
    isOpen: false,
    item: null
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
        console.error('Failed to load group lookups:', err);
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, [isBridged]);

  // Fetch Group Items
  const fetchGroupsList = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      if (isBridged) {
        if (onAction) {
          onAction('filterChange', {
            currentfilter: {
              CodeName: codeName,
              FacilityId: facilityId > 0 ? facilityId : null,
              ActiveStatusId: activeStatusId > 0 ? activeStatusId : null
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
          { Key: 5, Value: facilityId > 0 ? facilityId : null },
          { Key: 3, Value: activeStatusId > 0 ? activeStatusId : null }
        ];

        const reqBody = {
          Params: params,
          PageContext: {
            PageSize: size,
            PageNumber: page
          }
        };

        const res = await apiFetch<any>('SystemSettings/group/GetGroups', reqBody);

        if (res) {
          setItems(res.Data || []);
          if (res.PageContext?.TotalRecords !== undefined) {
            setTotalItems(res.PageContext.TotalRecords);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch groups:', err);
        setErrorMsg(err.message || 'Failed to fetch groups list.');
      } finally {
        setLoading(false);
      }
    },
    [isBridged, onAction, codeName, facilityId, activeStatusId, currentPage, pageSize]
  );

  // Trigger search on mount and filter changes in standalone mode
  useEffect(() => {
    if (!isBridged) {
      fetchGroupsList(currentPage, pageSize);
    }
  }, [currentPage, pageSize, facilityId, activeStatusId]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchGroupsList(1, pageSize);
  };

  const handleFacilityChange = (newFacilityId: number) => {
    setFacilityId(newFacilityId);
    setCurrentPage(1);
    if (isBridged && onAction) {
      onAction('filterChange', {
        currentfilter: {
          CodeName: codeName,
          FacilityId: newFacilityId > 0 ? newFacilityId : null,
          ActiveStatusId: activeStatusId > 0 ? activeStatusId : null
        },
        pageContext: {
          currentPage: 1,
          pageSize
        }
      });
    }
  };

  const handleStatusChange = (newStatusId: number) => {
    setActiveStatusId(newStatusId);
    setCurrentPage(1);
    if (isBridged && onAction) {
      onAction('filterChange', {
        currentfilter: {
          CodeName: codeName,
          FacilityId: facilityId > 0 ? facilityId : null,
          ActiveStatusId: newStatusId > 0 ? newStatusId : null
        },
        pageContext: {
          currentPage: 1,
          pageSize
        }
      });
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = '#/app/group/0/general';
      } else {
        window.location.href = '/app/group/0/general';
      }
    }
  };

  const handleEdit = (item: GroupListItem) => {
    if (onAction) {
      onAction('edit', item);
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = `#/app/group/${item.Id}/general`;
      } else {
        window.location.href = `/app/group/${item.Id}/general`;
      }
    }
  };

  const handleView = (item: GroupListItem) => {
    if (onAction) {
      onAction('view', item);
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = `#/app/group/${item.Id}/general`;
      } else {
        window.location.href = `/app/group/${item.Id}/general`;
      }
    }
  };

  const handleDeleteClick = (item: GroupListItem) => {
    setDeleteModalState({ isOpen: true, item });
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
      await apiFetch<any>('SystemSettings/group/DeleteGroup', { Id: item.Id });

      setDeleteModalState({ isOpen: false, item: null });
      fetchGroupsList(currentPage, pageSize);
    } catch (err: any) {
      console.error('Failed to delete group:', err);
      alert(err.message || 'Failed to delete group.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchGroupsList(newPage, pageSize);
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
            <i className="fa fa-users" />
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
              Groups Master
            </h2>
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
              Manage user role groups, access classifications, and facility assignments
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
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Facility:
            </span>
            <select
              value={facilityId ?? -1}
              onChange={(e) => handleFacilityChange(parseInt(e.target.value, 10))}
              style={{
                padding: '6px 12px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                outline: 'none',
                minWidth: 140
              }}
            >
              <option value="-1">All Facilities</option>
              {facilityOptions.map((fac) => (
                <option key={fac.Id} value={fac.Id}>
                  {fac.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Status:
            </span>
            <select
              value={activeStatusId ?? 2}
              onChange={(e) => handleStatusChange(parseInt(e.target.value, 10))}
              style={{
                padding: '6px 12px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                outline: 'none',
                minWidth: 120
              }}
            >
              <option value="-1">All Statuses</option>
              {activeStatusOptions.map((st) => (
                <option key={st.Id} value={st.Id}>
                  {st.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <input
              type="text"
              placeholder="Code / Name..."
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              style={{
                padding: '6px 30px 6px 12px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                width: 170,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: colors.text.secondary,
                cursor: 'pointer',
                padding: 4
              }}
              title="Search"
            >
              <i className="fa fa-search" style={{ fontSize: 12 }} />
            </button>
          </form>

          {/* Add New Group Button */}
          <button
            type="button"
            onClick={handleAddNew}
            title="Create New Group"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              backgroundColor: colors.primary.main,
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <i className="fa fa-plus" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: radii.md,
            padding: `${spacing.sm} ${spacing.md}`,
            color: colors.state?.danger || '#ef4444',
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-exclamation-circle" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Table Container */}
      <div
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: colors.background.tertiary,
                  borderBottom: `1px solid ${colors.border.subtle}`
                }}
              >
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '14%' }}>
                  Group Code
                </th>
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '22%' }}>
                  Group Name
                </th>
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '26%' }}>
                  Description
                </th>
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '18%' }}>
                  Facility
                </th>
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '10%' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', width: '10%', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm }}>
                      <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary.main }} />
                      <span style={{ fontSize: typography.fontSizes.sm }}>Loading groups...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm }}>
                      <i className="fa fa-inbox fa-3x" style={{ opacity: 0.3 }} />
                      <span style={{ fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium }}>
                        No groups found
                      </span>
                      <span style={{ fontSize: typography.fontSizes.xs }}>
                        Try adjusting your filters or click the plus button above to add a new group.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const facilityLabel = item.IsAllFacility ? 'All Facilities' : (item.Facility?.FacilityName || '-');
                  const statusDesc = item.ActiveStatus?.Description || (item.ActiveStatusId === 2 ? 'Active' : (item.ActiveStatusId === 1 ? 'Inactive' : 'Draft'));
                  const isActive = item.ActiveStatusId === 2;

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        transition: 'background-color 0.15s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Group Code */}
                      <td style={{ padding: '12px 16px', fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.text.primary }}>
                        <span style={{ fontFamily: 'monospace', backgroundColor: colors.background.tertiary, padding: '2px 6px', borderRadius: radii.xs, border: `1px solid ${colors.border.subtle}` }}>
                          {item.GroupCode || '-'}
                        </span>
                      </td>

                      {/* Group Name */}
                      <td style={{ padding: '12px 16px', fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.text.primary }}>
                        {item.GroupName}
                      </td>

                      {/* Description */}
                      <td style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                        {item.Description || '-'}
                      </td>

                      {/* Facility */}
                      <td style={{ padding: '12px 16px', fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="fa fa-hospital" style={{ color: colors.primary.main, opacity: 0.7 }} />
                          <span>{facilityLabel}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: radii.full,
                            fontSize: '11px',
                            fontWeight: typography.fontWeights.medium,
                            backgroundColor: isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isActive ? '#16a34a' : '#dc2626'
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#16a34a' : '#dc2626',
                              marginRight: 6
                            }}
                          />
                          {statusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* View (if Active) or Edit */}
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleView(item)}
                              title="View Group"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: radii.xs,
                                border: `1px solid ${colors.border.subtle}`,
                                backgroundColor: colors.background.primary,
                                color: colors.primary.main,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <i className="fa fa-eye" style={{ fontSize: 12 }} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              title="Edit Group"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: radii.xs,
                                border: `1px solid ${colors.border.subtle}`,
                                backgroundColor: colors.background.primary,
                                color: colors.primary.main,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <i className="fa fa-edit" style={{ fontSize: 12 }} />
                            </button>
                          )}

                          {/* Delete (if Inactive or Draft) */}
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Group"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: radii.xs,
                                border: `1px solid ${colors.border.subtle}`,
                                backgroundColor: colors.background.primary,
                                color: colors.state?.danger || '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <i className="fa fa-trash-alt" style={{ fontSize: 12 }} />
                            </button>
                          )}
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
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            backgroundColor: colors.background.tertiary,
            gap: spacing.sm
          }}
        >
          {/* Records summary */}
          <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            Showing {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>

          {/* Page controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            {/* Page size dropdown */}
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                setPageSize(newSize);
                setCurrentPage(1);
                fetchGroupsList(1, newSize);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                outline: 'none',
                marginRight: spacing.sm
              }}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>

            {/* Prev Button */}
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '4px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: currentPage <= 1 ? colors.text.muted : colors.text.primary,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSizes.xs,
                transition: 'all 0.15s ease'
              }}
            >
              Previous
            </button>

            {/* Current Page Display */}
            <span
              style={{
                padding: '4px 12px',
                borderRadius: radii.sm,
                backgroundColor: colors.primary.main,
                color: '#ffffff',
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.semibold
              }}
            >
              {currentPage} / {totalPages}
            </span>

            {/* Next Button */}
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '4px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: currentPage >= totalPages ? colors.text.muted : colors.text.primary,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSizes.xs,
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && deleteModalState.item && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: spacing.md
          }}
        >
          <div
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: radii.lg,
              border: `1px solid ${colors.border.subtle}`,
              maxWidth: 420,
              width: '100%',
              padding: spacing.lg,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.full,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: colors.state?.danger || '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <i className="fa fa-exclamation-triangle" />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: typography.fontSizes.md,
                    fontWeight: typography.fontWeights.semibold,
                    color: colors.text.primary
                  }}
                >
                  Delete Group
                </h3>
                <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                  Are you sure you want to delete this group?
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: colors.background.tertiary,
                padding: spacing.sm,
                borderRadius: radii.sm,
                fontSize: typography.fontSizes.sm,
                color: colors.text.primary
              }}
            >
              <strong>{deleteModalState.item.GroupName}</strong> ({deleteModalState.item.GroupCode})
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xs }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalState({ isOpen: false, item: null })}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.medium
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: colors.state?.danger || '#ef4444',
                  color: '#ffffff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
              >
                {isDeleting && <i className="fa fa-spinner fa-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Group'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
