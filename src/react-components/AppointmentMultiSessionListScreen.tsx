import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { AppointmentMultiSessionModal } from './AppointmentMultiSessionModal';

export interface MultiSessionItem {
  Id: number;
  FacilityId?: number;
  AppointmentSessionTypeId?: number;
  AppointmentSessionType?: {
    Id?: number;
    Description?: string;
  };
  DoctorId?: number;
  User?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
  };
  ResourceMaster?: {
    Id?: number;
    ResourceName?: string;
  };
  StartDate?: string;
  EndDate?: string;
  StartTime?: string;
  EndTime?: string;
  Duration?: number;
  SlotDuration?: number;
  MaxSlotPerDay?: number;
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  [key: string]: any;
}

export interface AppointmentMultiSessionListScreenProps {
  doctorId?: number;
  parentSessionId?: number;
  reactProps?: {
    doctorId?: number;
    parentSessionId?: number;
    items?: MultiSessionItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    currentfilter?: {
      ActiveStatusId?: number;
      DoctorId?: number;
      FacilityId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const AppointmentMultiSessionListScreen: React.FC<AppointmentMultiSessionListScreenProps> = ({
  doctorId: directDocId,
  parentSessionId: directParentId,
  reactProps,
  onAction
}) => {
  const effectiveDoctorId = directDocId ?? reactProps?.doctorId ?? reactProps?.currentfilter?.DoctorId ?? -1;
  const effectiveParentId = directParentId ?? reactProps?.parentSessionId ?? 0;

  const [items, setItems] = useState<MultiSessionItem[]>(reactProps?.items || []);
  const [totalItems, setTotalItems] = useState(reactProps?.totalItems || 0);
  const [currentPage, setCurrentPage] = useState(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState(reactProps?.pageSize || 25);
  const [activeStatusId, setActiveStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number>(0);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<MultiSessionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (page = currentPage, status = activeStatusId) => {
    if (onAction) {
      onAction('getList', { currentPage: page, ActiveStatusId: status });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Params: [
          { Key: 2, Value: 1 },
          { Key: 3, Value: -1 },
          { Key: 5, Value: effectiveDoctorId },
          { Key: 7, Value: -1 },
          { Key: 8, Value: status }
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page
        }
      };

      const res = await apiFetch<any>('appointment/AppointmentMultiSession/GetAppointmentMultiSessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords ?? res.Data.length);
      } else {
        setItems([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Failed to load multi sessions:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [onAction, currentPage, activeStatusId, pageSize, effectiveDoctorId]);

  useEffect(() => {
    if (!reactProps) {
      loadData(1, activeStatusId);
    }
  }, [loadData, reactProps, activeStatusId]);

  const handleOpenAdd = () => {
    setEditingId(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MultiSessionItem) => {
    setEditingId(item.Id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await apiFetch('appointment/AppointmentMultiSession/DeleteAppointmentMultiSession', {
        method: 'POST',
        body: JSON.stringify({ Id: deleteItem.Id })
      });
      setDeleteItem(null);
      loadData(currentPage, activeStatusId);
    } catch (e) {
      console.error('Failed to delete multi session', e);
      alert('Failed to delete multi session.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: radii.lg,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: spacing.xl,
        fontFamily: typography.fontFamily
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.border?.subtle || '#e2e8f0'}`
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.text?.primary || '#1e293b' }}>
            Multi Appointment Sessions
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: colors.text?.secondary || '#64748b' }}>
            Manage parallel and recurring slot configurations for this doctor.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
            <select
              value={activeStatusId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setActiveStatusId(val);
                setCurrentPage(1);
                loadData(1, val);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            >
              <option value={-1}>All Statuses</option>
              <option value={2}>Active</option>
              <option value={1}>Draft</option>
              <option value={3}>Inactive</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: radii.md,
              backgroundColor: colors.primary?.main || '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            <i className="fa fa-plus" /> Add Multi Session
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary?.main || '#2563eb' }} />
          <div style={{ marginTop: 8 }}>Loading multi-sessions...</div>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            backgroundColor: '#f8fafc',
            borderRadius: radii.md,
            border: '1px dashed #cbd5e1'
          }}
        >
          <i className="fa fa-calendar-times fa-3x" style={{ color: '#94a3b8', marginBottom: 12 }} />
          <h4 style={{ margin: 0, color: '#334155', fontWeight: 600 }}>No Multi-Sessions Configured</h4>
          <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.875rem' }}>
            Click &quot;Add Multi Session&quot; to define supplementary or overlapping clinic slot configurations.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: '8px 16px',
              borderRadius: radii.md,
              backgroundColor: colors.primary?.main || '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-plus" style={{ marginRight: 6 }} /> Configure Multi Session
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Type</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Doctor / Resource</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Start Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>End Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Timings</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Slots / Day</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const targetName = row.User
                  ? `${row.User.FirstName || ''} ${row.User.LastName || ''}`
                  : row.ResourceMaster?.ResourceName || '—';
                const isActive = row.ActiveStatusId === 2 || row.ActiveStatusId === 1;

                return (
                  <tr
                    key={row.Id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                      {row.AppointmentSessionType?.Description || 'Session'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>{targetName}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDate(row.StartDate)}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDate(row.EndDate)}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {row.StartTime && row.EndTime ? `${row.StartTime} - ${row.EndTime}` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{row.MaxSlotPerDay ?? '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: radii.full || 9999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#065f46' : '#991b1b'
                        }}
                      >
                        {row.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Edit multi session"
                        >
                          <i className="fa fa-edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteItem(row)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: radii.sm,
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Delete multi session"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.lg,
            paddingTop: spacing.md,
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            color: '#64748b'
          }}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} multi sessions
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => {
                const prev = currentPage - 1;
                setCurrentPage(prev);
                loadData(prev, activeStatusId);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', fontWeight: 600, color: '#1e293b' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const next = currentPage + 1;
                setCurrentPage(next);
                loadData(next, activeStatusId);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Multi Session Edit Modal */}
      <AppointmentMultiSessionModal
        isOpen={isModalOpen}
        id={editingId}
        doctorId={effectiveDoctorId}
        parentSessionId={effectiveParentId}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => loadData(currentPage, activeStatusId)}
      />

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.lg,
              padding: spacing.xl,
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#b91c1c' }}>
              <i className="fa fa-exclamation-triangle" style={{ marginRight: 8 }} />
              Confirm Delete
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#475569' }}>
              Are you sure you want to delete Multi Session #{deleteItem.Id}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.md,
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentMultiSessionListScreen;
