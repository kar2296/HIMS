import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';
import { SequenceMastersModal, type SequenceMasterItem } from './SequenceMastersModal';

export interface SequenceMastersListScreenProps {
  reactProps?: {
    items?: SequenceMasterItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      Facility?: Array<{ Id: number; Text: string }>;
      SourceType?: Array<{ Id: number; Text: string }>;
      ActiveStatus?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      FacilityId?: number;
      SourceTypeId?: number;
      Name?: string;
      StatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const SequenceMastersListScreen: React.FC<SequenceMastersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  const currentUserId = sessionHelper.getCurrentUserId();
  const defaultFacilityId = reactProps?.currentfilter?.FacilityId ?? sessionHelper.getCurrentFacilityId() ?? -1;

  // Filter States
  const [facilityId, setFacilityId] = useState<number>(defaultFacilityId);

  // Lookups
  const [facilityLookup, setFacilityLookup] = useState<any[]>(reactProps?.lookup?.Facility || []);

  // Pagination & Data States
  const [items, setItems] = useState<SequenceMasterItem[]>(reactProps?.items || []);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(null);

  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'redisToSql' | 'sqlToRedis';
    title: string;
    message: string;
    item?: SequenceMasterItem;
  }>({
    isOpen: false,
    type: 'redisToSql',
    title: '',
    message: '',
  });
  const [isProcessingSync, setIsProcessingSync] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.lookup?.Facility) setFacilityLookup(reactProps.lookup.Facility);
      if (reactProps.currentfilter?.FacilityId !== undefined) {
        setFacilityId(reactProps.currentfilter.FacilityId);
      }
    }
  }, [reactProps]);

  // Fetch Lookups
  useEffect(() => {
    if (facilityLookup.length > 0) return;

    const fetchLookups = async () => {
      try {
        const inputData = [
          { Key: 'Facility' },
          { Key: 'SourceType' },
          { Key: 'ActiveStatus' },
        ];
        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res?.Data?.Facility) {
          setFacilityLookup(res.Data.Facility);
        }
      } catch (err) {
        console.error('Failed to load Sequence Master lookups:', err);
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
            FacilityId: facilityId,
          },
        });
      }

      setLoading(true);
      try {
        const inputData = {
          Params: [{ Key: 3, Value: facilityId === -1 ? null : facilityId }],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('General/SequenceMasters/GetSequenceMasterss', inputData);
        if (res) {
          const list = res.Data || [];
          setItems(list);
          setTotalItems(res.PageContext?.TotalRecords ?? list.length);
        }
      } catch (err) {
        console.error('Error fetching sequence masters list:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, isBridged, onAction, facilityId]
  );

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, facilityId]);

  const handleEdit = (item: SequenceMasterItem) => {
    setSelectedSequenceId(item.Id ?? null);
    setModalOpen(true);
    if (onAction) {
      onAction('edit', item);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSyncRedisToSql = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'redisToSql',
      title: 'Sync Redis to SQL',
      message: 'Are you sure you want to synchronize sequence counters from Redis cache to the SQL database?',
    });
  };

  const handleOpenSyncSqlToRedis = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'sqlToRedis',
      title: 'Sync SQL to Redis',
      message: 'Are you sure you want to synchronize sequence counters from SQL database into the Redis cache?',
    });
  };

  const handleOpenDelete = (item: SequenceMasterItem) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Delete Sequence Master?',
      message: `Are you sure you want to delete sequence "${item.SeqName}"?`,
      item,
    });
  };

  const handleExecuteConfirm = async () => {
    setIsProcessingSync(true);
    try {
      if (confirmDialog.type === 'redisToSql') {
        const payload = {
          Id: null,
          Params: [],
          PageContext: { PageSize: 1000, PageNumber: 1 },
        };
        await apiFetch('General/SequenceMasters/SyncRedisToSqlSequenceMasters', payload);
        showToast('Successfully synchronized Redis to SQL sequences.');
        fetchData(currentPage, pageSize);
      } else if (confirmDialog.type === 'sqlToRedis') {
        const payload = {
          Id: null,
          Params: [],
          PageContext: { PageSize: 1000, PageNumber: 1 },
        };
        await apiFetch('General/SequenceMasters/SyncSqlToRedisSequenceMasters', payload);
        showToast('Successfully synchronized SQL to Redis sequences.');
        fetchData(currentPage, pageSize);
      } else if (confirmDialog.type === 'delete' && confirmDialog.item) {
        await apiFetch('General/SequenceMasters/DeleteSequenceMasters', { Id: confirmDialog.item.Id });
        showToast('Sequence Master deleted successfully.');
        fetchData(currentPage, pageSize);
      }
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error('Action failed:', err);
      showToast(err?.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setIsProcessingSync(false);
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
            <span>Sequence Masters</span>
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
            Sequence Masters
          </h1>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
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
            {totalItems} Sequences
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

          {/* Sync Redis to SQL Button */}
          <button
            type="button"
            onClick={handleOpenSyncRedisToSql}
            style={{
              padding: '7px 14px',
              borderRadius: radii.md || '8px',
              border: `1px solid #93c5fd`,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              transition: 'background-color 0.15s',
            }}
            title="Sync Redis sequence counters into SQL database"
          >
            <i className="fa-solid fa-cloud-arrow-down" />
            <span>Sync Redis to SQL</span>
          </button>

          {/* Sync SQL to Redis Button (Available for Admin/UserId 1) */}
          {(currentUserId === 1 || currentUserId === -1) && (
            <button
              type="button"
              onClick={handleOpenSyncSqlToRedis}
              style={{
                padding: '7px 14px',
                borderRadius: radii.md || '8px',
                border: `1px solid #cbd5e1`,
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
              title="Sync SQL sequence counters into Redis cache"
            >
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>Sync SQL to Redis</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: toastMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${toastMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: radii.md || '8px',
            color: toastMessage.type === 'success' ? '#15803d' : '#b91c1c',
            fontSize: '13px',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <i className={`fa-solid ${toastMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg || '12px',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          padding: spacing.md,
          marginBottom: spacing.lg,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: spacing.lg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <label
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.textMain || '#334155',
              whiteSpace: 'nowrap',
            }}
          >
            Facility:
          </label>
          <select
            value={facilityId ?? ''}
            onChange={(e) => {
              setFacilityId(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: radii.md || '8px',
              border: `1px solid ${colors.border || '#cbd5e1'}`,
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff',
              minWidth: '240px',
            }}
          >
            <option value="-1">All Facilities</option>
            {facilityLookup.map((f) => (
              <option key={f.Id} value={f.Id}>
                {f.Text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
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
                <th style={{ padding: '12px 16px' }}>Sequence Name</th>
                <th style={{ padding: '12px 16px' }}>Facility</th>
                <th style={{ padding: '12px 16px' }}>Prefix</th>
                <th style={{ padding: '12px 16px' }}>Start ID</th>
                <th style={{ padding: '12px 16px' }}>Last ID</th>
                <th style={{ padding: '12px 16px' }}>Inc Size</th>
                <th style={{ padding: '12px 16px' }}>Block Size</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center' }}>
                    <i
                      className="fa-solid fa-circle-notch fa-spin"
                      style={{ fontSize: '28px', color: colors.primary?.main || '#2563eb' }}
                    />
                    <div style={{ marginTop: 8, color: colors.textMuted || '#64748b', fontSize: '13px' }}>
                      Loading Sequence Masters...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
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
                      <i className="fa-solid fa-arrow-down-1-9" />
                    </div>
                    <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', fontSize: '15px' }}>
                      No Sequence Masters Found
                    </div>
                    <div style={{ color: colors.textMuted || '#64748b', fontSize: '13px', marginTop: 4 }}>
                      Select a different facility to view sequence configuration.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => (
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
                    {/* Sequence Name */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                      {row.SeqName}
                    </td>

                    {/* Facility */}
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {row.Facility?.FacilityName || '-'}
                    </td>

                    {/* Prefix */}
                    <td style={{ padding: '12px 16px' }}>
                      {row.SeqPrefix ? (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            backgroundColor: '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1e293b',
                          }}
                        >
                          {row.SeqPrefix}
                        </span>
                      ) : (
                        <span style={{ color: colors.textMuted || '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Start ID */}
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {row.SeqStartId ?? '-'}
                    </td>

                    {/* Last ID */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: colors.primary?.main || '#2563eb' }}>
                      {row.SeqLastId ?? '-'}
                    </td>

                    {/* Inc Size */}
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {row.SeqIncSize ?? 1}
                    </td>

                    {/* Block Size */}
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {row.SeqBlockSize ?? 1}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          title="Edit Sequence"
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

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(row)}
                          title="Delete Sequence"
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
                ))
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

      {/* Edit Sequence Modal */}
      <SequenceMastersModal
        isOpen={modalOpen}
        sequenceId={selectedSequenceId}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchData(currentPage, pageSize);
        }}
      />

      {/* Action Confirmation Dialog */}
      {confirmDialog.isOpen && (
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
          onClick={() => !isProcessingSync && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
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
                  backgroundColor: confirmDialog.type === 'delete' ? '#fee2e2' : '#eff6ff',
                  color: confirmDialog.type === 'delete' ? '#dc2626' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i
                  className={`fa-solid ${
                    confirmDialog.type === 'delete'
                      ? 'fa-triangle-exclamation'
                      : confirmDialog.type === 'redisToSql'
                      ? 'fa-cloud-arrow-down'
                      : 'fa-cloud-arrow-up'
                  }`}
                />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: colors.textMain || '#0f172a' }}>
                  {confirmDialog.title}
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#334155', margin: `0 0 ${spacing.lg} 0`, lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
              <button
                type="button"
                disabled={isProcessingSync}
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.md || '8px',
                  border: `1px solid ${colors.border || '#cbd5e1'}`,
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  cursor: isProcessingSync ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingSync}
                onClick={handleExecuteConfirm}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md || '8px',
                  border: 'none',
                  backgroundColor: confirmDialog.type === 'delete' ? '#dc2626' : colors.primary?.main || '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isProcessingSync ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                {isProcessingSync ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Confirm</span>
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
