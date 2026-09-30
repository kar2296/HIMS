import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';
import { ReferenceValueGroupModal } from './ReferenceValueGroupModal';

export interface ReferenceValueGroupListItem {
  Id: number;
  GroupCode: string;
  GroupName: string;
  Description?: string;
  ActiveFrom?: string | Date;
  ActiveTo?: string | Date | null;
  IsSortByDescription?: boolean | number;
  IsActive?: boolean;
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id: number;
    Description: string;
  };
  Facility?: {
    Id: number;
    FacilityName: string;
  };
  [key: string]: any;
}

export interface ReferenceValueGroupsListScreenProps {
  reactProps?: {
    items?: ReferenceValueGroupListItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      ActiveStatus?: Array<{ Id: number; Text: string }>;
      Facility?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      CodeName?: string;
      facilityid?: number;
      moduleid?: number;
      ActiveStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ReferenceValueGroupsListScreen: React.FC<ReferenceValueGroupsListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  const currentFacilityId = reactProps?.currentfilter?.facilityid || sessionHelper.getCurrentFacilityId() || 1;

  // Filter States
  const [codeName, setCodeName] = useState<string>(reactProps?.currentfilter?.CodeName || '');
  const [activeStatusId, setActiveStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);

  // Lookups
  const [activeStatusLookup, setActiveStatusLookup] = useState<any[]>(reactProps?.lookup?.ActiveStatus || []);

  // Pagination & Data States
  const [items, setItems] = useState<ReferenceValueGroupListItem[]>(reactProps?.items || []);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ReferenceValueGroupListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.lookup?.ActiveStatus) setActiveStatusLookup(reactProps.lookup.ActiveStatus);
      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.CodeName !== undefined) setCodeName(reactProps.currentfilter.CodeName);
        if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
      }
    }
  }, [reactProps]);

  // Fetch Lookups
  useEffect(() => {
    if (activeStatusLookup.length > 0) return;

    const fetchLookups = async () => {
      try {
        const inputData = [
          { Key: 'Facility', Request: { Params: [{ Key: 4, Value: true }] } },
          { Key: 'ActiveStatus' },
        ];
        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res?.Data?.ActiveStatus) {
          setActiveStatusLookup(res.Data.ActiveStatus);
        }
      } catch (err) {
        console.error('Failed to load ActiveStatus lookup:', err);
      }
    };

    fetchLookups();
  }, []);

  // Fetch List Data
  const fetchData = useCallback(
    async (page = currentPage, size = pageSize) => {
      if (isBridged && onAction) {
        onAction('fetchData', {
          currentPage: page,
          pageSize: size,
          currentfilter: {
            CodeName: codeName.trim(),
            facilityid: currentFacilityId,
            moduleid: -1,
            ActiveStatusId: activeStatusId,
          },
        });
      }

      setLoading(true);
      try {
        const inputData = {
          Params: [
            { Key: 1, Value: codeName.trim() },
            { Key: 3, Value: currentFacilityId },
            { Key: 4, Value: -1 },
            { Key: 5, Value: activeStatusId === -1 ? null : activeStatusId },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('SystemSettings/referencevaluegroup/GetReferenceValueGroups', inputData);
        if (res) {
          const list = res.Data || [];
          setItems(list);
          setTotalItems(res.PageContext?.TotalRecords ?? list.length);
        }
      } catch (err) {
        console.error('Error fetching reference value groups list:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, isBridged, onAction, currentFacilityId, codeName, activeStatusId]
  );

  // Initial and parameter update fetch
  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  const handleResetFilters = () => {
    setCodeName('');
    setActiveStatusId(2);
    setCurrentPage(1);
    setTimeout(() => {
      fetchData(1, pageSize);
    }, 50);
  };

  const handleAddNew = () => {
    setSelectedGroupId(0);
    setModalOpen(true);
    if (onAction) {
      onAction('addNew');
    }
  };

  const handleEdit = (item: ReferenceValueGroupListItem) => {
    setSelectedGroupId(item.Id);
    setModalOpen(true);
    if (onAction) {
      onAction('edit', item);
    }
  };

  const handleOpenReferenceValues = (item: ReferenceValueGroupListItem) => {
    if (onAction) {
      onAction('refvalueaction', item);
    }
    // Also support direct route navigation
    const targetUrl = `#/app/referencevalues?id=${item.Id}&groupId=${item.Id}&groupCode=${encodeURIComponent(item.GroupCode || '')}&IsProfile=${item.IsProfile || false}`;
    window.location.hash = `/app/referencevalues?id=${item.Id}&groupId=${item.Id}&groupCode=${encodeURIComponent(item.GroupCode || '')}`;
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (onAction) {
        onAction('delete', itemToDelete);
      }
      await apiFetch('SystemSettings/referencevaluegroup/DeleteReferenceValueGroup', { Id: itemToDelete.Id });
      setSuccessToast(`Reference Value Group "${itemToDelete.GroupName}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData(currentPage, pageSize);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      console.error('Failed to delete Reference Value Group:', err);
      alert(err?.message || 'Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div
      style={{
        padding: spacing.lg,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: colors.textMuted || '#64748b',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>EMR</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }} />
            <span>App Manager</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }} />
            <span>Reference Value Groups</span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: colors.textMain || '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Reference Value Groups
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <span
            style={{
              backgroundColor: '#e2e8f0',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: radii.full || '9999px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {totalItems} Groups
          </span>

          <button
            type="button"
            onClick={() => fetchData(currentPage, pageSize)}
            disabled={loading}
            style={{
              padding: '7px 12px',
              borderRadius: radii.md || '8px',
              border: `1px solid ${colors.border || '#cbd5e1'}`,
              backgroundColor: '#ffffff',
              color: colors.textMain || '#334155',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
            }}
            title="Refresh Table"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            style={{
              padding: '7px 16px',
              borderRadius: radii.md || '8px',
              border: 'none',
              backgroundColor: colors.primary?.main || '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <i className="fa-solid fa-plus" />
            <span>Add Reference Value Group</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: radii.md || '8px',
            color: '#15803d',
            fontSize: '13px',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <i className="fa-solid fa-circle-check" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg || '12px',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          padding: spacing.md,
          marginBottom: spacing.lg,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end' }}>
          {/* Status Filter */}
          <div style={{ minWidth: 180 }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textMain || '#334155',
                marginBottom: 4,
              }}
            >
              Status
            </label>
            <select
              value={activeStatusId ?? ''}
              onChange={(e) => setActiveStatusId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: radii.md || '8px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="-1">All Statuses</option>
              {activeStatusLookup.length > 0 ? (
                activeStatusLookup.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Text}
                  </option>
                ))
              ) : (
                <>
                  <option value="2">Active</option>
                  <option value="1">Inactive</option>
                </>
              )}
            </select>
          </div>

          {/* Code / Name Search Input */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textMain || '#334155',
                marginBottom: 4,
              }}
            >
              Code / Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by code or name..."
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted || '#94a3b8',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '8px 16px',
                borderRadius: radii.md || '8px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: colors.textMain || '#475569',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                borderRadius: radii.md || '8px',
                border: 'none',
                backgroundColor: colors.primary?.main || '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grid Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg || '12px',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `2px solid ${colors.border || '#e2e8f0'}`,
                  color: colors.textMuted || '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Group Code</th>
                <th style={{ padding: '12px 16px' }}>Group Name</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                    <i
                      className="fa-solid fa-circle-notch fa-spin"
                      style={{ fontSize: '28px', color: colors.primary?.main || '#2563eb' }}
                    />
                    <div style={{ marginTop: 8, color: colors.textMuted || '#64748b', fontSize: '13px' }}>
                      Loading Reference Value Groups...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        fontSize: '20px',
                      }}
                    >
                      <i className="fa-solid fa-layer-group" />
                    </div>
                    <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', fontSize: '15px' }}>
                      No Reference Value Groups Found
                    </div>
                    <div style={{ color: colors.textMuted || '#64748b', fontSize: '13px', marginTop: 4 }}>
                      Click "+ Add Reference Value Group" to create the first group.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const statusDesc =
                    row.ActiveStatus?.Description ||
                    (row.ActiveStatusId === 2 || row.IsActive !== false ? 'Active' : 'Inactive');
                  const isActive = statusDesc.toLowerCase().includes('active');

                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border || '#f1f5f9'}`,
                        transition: 'background 0.15s',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafafa')
                      }
                    >
                      {/* Group Code */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                        {row.GroupCode}
                      </td>

                      {/* Group Name */}
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>
                        {row.GroupName}
                        {row.Description && (
                          <div style={{ fontSize: '11px', color: colors.textMuted || '#64748b', marginTop: 2 }}>
                            {row.Description}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#16a34a' : '#dc2626',
                            }}
                          />
                          {statusDesc}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            title="Edit Reference Value Group"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md || '6px',
                              border: `1px solid ${colors.border || '#cbd5e1'}`,
                              backgroundColor: '#ffffff',
                              color: colors.primary?.main || '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary?.main || '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = colors.primary?.main || '#2563eb';
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square" style={{ fontSize: '13px' }} />
                          </button>

                          {/* Reference Values Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenReferenceValues(row)}
                            title="View / Configure Reference Values"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md || '6px',
                              border: `1px solid ${colors.border || '#cbd5e1'}`,
                              backgroundColor: '#ffffff',
                              color: '#0891b2',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#0891b2';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = '#0891b2';
                            }}
                          >
                            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '13px' }} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setItemToDelete(row);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Reference Value Group"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md || '6px',
                              border: `1px solid ${colors.border || '#cbd5e1'}`,
                              backgroundColor: '#ffffff',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                          >
                            <i className="fa-solid fa-trash-can" style={{ fontSize: '13px' }} />
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

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.lg}`,
            borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
            backgroundColor: '#ffffff',
            gap: spacing.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span style={{ fontSize: '13px', color: colors.textMuted || '#64748b' }}>
              Showing {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '12px', color: colors.textMuted || '#64748b' }}>Per page:</span>
              <select
                value={pageSize ?? ''}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: radii.sm || '4px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{
                padding: '5px 10px',
                borderRadius: radii.sm || '6px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? '#94a3b8' : '#334155',
                fontSize: '12px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <span
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textMain || '#0f172a',
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{
                padding: '5px 10px',
                borderRadius: radii.sm || '6px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                fontSize: '12px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* In-page Add/Edit Modal */}
      <ReferenceValueGroupModal
        isOpen={modalOpen}
        groupId={selectedGroupId}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchData(currentPage, pageSize);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: spacing.md,
          }}
          onClick={() => !isDeleting && setDeleteDialogOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              borderRadius: radii.lg || '12px',
              padding: spacing.lg,
              boxShadow: shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                  Delete Reference Value Group?
                </h4>
                <div style={{ fontSize: '12px', color: colors.textMuted || '#64748b', marginTop: 2 }}>
                  This action cannot be undone.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#334155', margin: `0 0 ${spacing.lg} 0` }}>
              Are you sure you want to delete <strong>{itemToDelete.GroupName}</strong> ({itemToDelete.GroupCode})?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteDialogOpen(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md || '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                {isDeleting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
