import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { sessionHelper } from '../services/sessionHelper';
import { EventTemplateFormScreen, type EventTemplateItem } from './EventTemplateFormScreen';

export interface EventTemplatesListScreenProps {
  reactProps?: {
    items?: EventTemplateItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      Facility?: Array<{ Id: number; Text: string; FacilityName?: string }>;
      EventType?: Array<{ Id: number; Text: string; Description?: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      facilityid?: number;
      eventtypeid?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const EventTemplatesListScreen: React.FC<EventTemplatesListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Filter States
  const [facilityId, setFacilityId] = useState<number>(
    reactProps?.currentfilter?.facilityid ?? -1
  );
  const [eventTypeId, setEventTypeId] = useState<number>(
    reactProps?.currentfilter?.eventtypeid ?? -1
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Lookups
  const [facilityLookup, setFacilityLookup] = useState<any[]>(reactProps?.lookup?.Facility || []);
  const [eventTypeLookup, setEventTypeLookup] = useState<any[]>(reactProps?.lookup?.EventType || []);

  // Pagination & Data States
  const [items, setItems] = useState<EventTemplateItem[]>(reactProps?.items || []);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Form Modal state
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    item?: EventTemplateItem;
    isDeleting?: boolean;
  }>({
    isOpen: false,
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.lookup?.Facility) setFacilityLookup(reactProps.lookup.Facility);
      if (reactProps.lookup?.EventType) setEventTypeLookup(reactProps.lookup.EventType);
      if (reactProps.currentfilter?.facilityid !== undefined) {
        setFacilityId(reactProps.currentfilter.facilityid);
      }
      if (reactProps.currentfilter?.eventtypeid !== undefined) {
        setEventTypeId(reactProps.currentfilter.eventtypeid);
      }
    }
  }, [reactProps]);

  // Load Lookups if not present
  useEffect(() => {
    const fetchLookups = async () => {
      if (facilityLookup.length > 0 && eventTypeLookup.length > 0) return;
      try {
        const inputData = [
          { Key: 'Facility' },
          { Key: 'EventType' },
        ];
        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res) {
          if (res.Facility) setFacilityLookup(res.Facility);
          if (res.EventType) setEventTypeLookup(res.EventType);
        }
      } catch (err) {
        console.error('Failed to load lookups for event templates list:', err);
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
            facilityid: facilityId,
            eventtypeid: eventTypeId,
          },
        });
      }

      setLoading(true);
      try {
        const inputData = {
          Params: [
            { Key: 1, Value: facilityId === -1 ? null : facilityId },
            { Key: 2, Value: eventTypeId === -1 ? null : eventTypeId },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('SystemSettings/EventTemplate/GetEventTemplates', inputData);
        if (res) {
          const list = res.Data || [];
          setItems(list);
          setTotalItems(res.PageContext?.TotalRecords ?? list.length);
        }
      } catch (err) {
        console.error('Error fetching event templates list:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, isBridged, onAction, facilityId, eventTypeId]
  );

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, facilityId, eventTypeId]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    }
    setSelectedTemplateId(0);
    setFormOpen(true);
  };

  const handleEdit = (item: EventTemplateItem) => {
    if (onAction) {
      onAction('edit', item);
    }
    setSelectedTemplateId(item.Id ?? 0);
    setFormOpen(true);
  };

  const handleDeleteClick = (item: EventTemplateItem) => {
    setDeleteConfirm({
      isOpen: true,
      item,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item?.Id) return;

    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (onAction) {
        onAction('delete', deleteConfirm.item);
      }

      await apiFetch('SystemSettings/EventTemplate/DeleteEventTemplate', {
        Id: deleteConfirm.item.Id,
      });

      showToast('SMS template deleted successfully', 'success');
      setDeleteConfirm({ isOpen: false });
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      console.error('Error deleting event template:', err);
      showToast(err?.message || 'Failed to delete SMS template', 'error');
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Filter items in memory by search term
  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const key = (item.TemplateKey || '').toLowerCase();
    const module = (item.ModuleName || '').toLowerCase();
    const trigger = (item.SmsTrigger || '').toLowerCase();
    const eventType = (item.EventType?.Description || item.EventType?.Text || '').toLowerCase();
    const facility = (item.Facility?.FacilityName || item.Facility?.Text || '').toLowerCase();
    return (
      key.includes(term) ||
      module.includes(term) ||
      trigger.includes(term) ||
      eventType.includes(term) ||
      facility.includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const getStatusBadge = (statusDesc?: string | any, isActive?: boolean) => {
    const desc =
      typeof statusDesc === 'object' && statusDesc !== null
        ? statusDesc.Description || statusDesc.Text || (isActive ? 'Active' : 'Inactive')
        : statusDesc || (isActive ? 'Active' : 'Inactive');

    let bg = '#f1f5f9';
    let fg = '#475569';

    if (desc === 'Active') {
      bg = '#def7ec';
      fg = '#03543f';
    } else if (desc === 'Draft') {
      bg = '#fef08a';
      fg = '#713f12';
    } else if (desc === 'Inactive' || isActive === false) {
      bg = '#fde8e8';
      fg = '#9b1c1c';
    }

    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: bg,
          color: fg,
          display: 'inline-block',
        }}
      >
        {desc}
      </span>
    );
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '6px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Screen Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            SMS Templates
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            Manage hospital event notifications, alert triggers, and communication templates
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          <span>Add SMS Template</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 200px', minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search key, module, or trigger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Facility Filter */}
        <div style={{ width: 220 }}>
          <select
            value={facilityId}
            onChange={(e) => {
              setFacilityId(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          >
            <option value={-1}>All Hospitals (Global)</option>
            {facilityLookup.map((f) => (
              <option key={f.Id} value={f.Id}>
                {f.Text || f.FacilityName || `Facility #${f.Id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type Filter */}
        <div style={{ width: 220 }}>
          <select
            value={eventTypeId}
            onChange={(e) => {
              setEventTypeId(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          >
            <option value={-1}>All Event Types</option>
            {eventTypeLookup.map((t) => (
              <option key={t.Id} value={t.Id}>
                {t.Text || t.Description || `Type #${t.Id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(facilityId !== -1 || eventTypeId !== -1 || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setFacilityId(-1);
              setEventTypeId(-1);
              setSearchTerm('');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Hospital / Facility</th>
                <th style={{ padding: '12px 16px' }}>Template Key</th>
                <th style={{ padding: '12px 16px' }}>Module</th>
                <th style={{ padding: '12px 16px' }}>Event Type</th>
                <th style={{ padding: '12px 16px' }}>SMS Trigger</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    Loading templates...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    No SMS templates found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((row) => (
                  <tr
                    key={row.Id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {row.Facility?.FacilityName || row.Facility?.Text || 'Global (All Facilities)'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>
                      {row.TemplateKey}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {row.ModuleName || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#0f172a' }}>
                      {row.EventType?.Description || row.EventType?.Text || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontFamily: 'monospace' }}>
                      {row.SmsTrigger || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(row.ActiveStatus, row.IsActive)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          title="Edit Template"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#FFFFFF',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(row)}
                          title="Delete Template"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fff5f5',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontSize: '12px',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            Showing {filteredItems.length} of {totalItems} templates
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentPage <= 1 ? '#f1f5f9' : '#FFFFFF',
                color: currentPage <= 1 ? '#94a3b8' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentPage >= totalPages ? '#f1f5f9' : '#FFFFFF',
                color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over / Modal Form Dialog */}
      {formOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <EventTemplateFormScreen
              id={selectedTemplateId ?? 0}
              onClose={() => {
                setFormOpen(false);
                setSelectedTemplateId(null);
                fetchData(currentPage, pageSize);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: 420,
              padding: '24px',
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Confirm Deletion
            </h3>
            <p
              style={{
                margin: '0 0 20px 0',
                fontSize: '13px',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete template{' '}
              <strong>"{deleteConfirm.item?.TemplateKey}"</strong>? This action cannot be undone.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false })}
                disabled={deleteConfirm.isDeleting}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirm.isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#FFFFFF',
                  cursor: deleteConfirm.isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {deleteConfirm.isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTemplatesListScreen;
