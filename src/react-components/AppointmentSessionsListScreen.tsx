import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface DoctorUser {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Title?: {
    Description?: string;
  };
}

export interface ResourceMaster {
  Id?: number;
  ResourceName?: string;
}

export interface AppointmentSessionItem {
  Id: number;
  FacilityId?: number;
  Facility?: {
    FacilityName?: string;
  };
  AppointmentSessionTypeId?: number;
  AppointmentSessionType?: {
    Id?: number;
    Description?: string;
    Code?: string;
  };
  DoctorId?: number;
  User?: DoctorUser;
  ResourceMaster?: ResourceMaster;
  SpecialityId?: number;
  Speciality?: {
    Id?: number;
    SpecialityName?: string;
  };
  StartDate?: string;
  EndDate?: string;
  StartTime?: string;
  EndTime?: string;
  Duration?: number;
  MaxSlotPerDay?: number;
  SlotTypeId?: number;
  AllowForceBooking?: boolean;
  IsOrderMandatory?: boolean;
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
  [key: string]: any;
}

export interface AppointmentSessionsListScreenProps {
  reactProps?: {
    items?: AppointmentSessionItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      AppointmentSessionType?: LookupOption[];
      Facility?: LookupOption[];
      Doctor?: LookupOption[];
      Speciality?: LookupOption[];
      ActiveStatus?: LookupOption[];
      [key: string]: any;
    };
    currentfilter?: {
      FacilityId?: number;
      AppointmentSessionTypeId?: number;
      DoctorId?: number;
      SpecialityId?: number;
      ActiveStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Date formatter helper (e.g. "2026-10-06T..." -> "06-Oct-2026")
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
};

export const AppointmentSessionsListScreen: React.FC<AppointmentSessionsListScreenProps> = ({
  reactProps,
  onAction
}) => {
  // Items & pagination state
  const [items, setItems] = useState<AppointmentSessionItem[]>(reactProps?.items || []);
  const [totalItems, setTotalItems] = useState(reactProps?.totalItems || 0);
  const [currentPage, setCurrentPage] = useState(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState(reactProps?.pageSize || 25);
  const [loading, setLoading] = useState(false);

  // Filters
  const [sessionTypeId, setSessionTypeId] = useState<number | ''>(reactProps?.currentfilter?.AppointmentSessionTypeId ?? -1);
  const [doctorId, setDoctorId] = useState<number | ''>(reactProps?.currentfilter?.DoctorId ?? -1);
  const [activeStatusId, setActiveStatusId] = useState<number | ''>(reactProps?.currentfilter?.ActiveStatusId ?? 2);
  const [facilityId, setFacilityId] = useState<number | ''>(reactProps?.currentfilter?.FacilityId ?? -1);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteModalItem, setDeleteModalItem] = useState<AppointmentSessionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lookups state
  const [lookups, setLookups] = useState<{
    AppointmentSessionType: LookupOption[];
    Facility: LookupOption[];
    Doctor: LookupOption[];
    Speciality: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    AppointmentSessionType: reactProps?.lookup?.AppointmentSessionType || [],
    Facility: reactProps?.lookup?.Facility || [],
    Doctor: reactProps?.lookup?.Doctor || [],
    Speciality: reactProps?.lookup?.Speciality || [],
    ActiveStatus: reactProps?.lookup?.ActiveStatus || []
  });

  // Sync with reactProps changes from AngularJS bridge
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);
      if (reactProps.lookup) {
        setLookups({
          AppointmentSessionType: reactProps.lookup.AppointmentSessionType || [],
          Facility: reactProps.lookup.Facility || [],
          Doctor: reactProps.lookup.Doctor || [],
          Speciality: reactProps.lookup.Speciality || [],
          ActiveStatus: reactProps.lookup.ActiveStatus || []
        });
      }
      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.AppointmentSessionTypeId !== undefined) {
          setSessionTypeId(reactProps.currentfilter.AppointmentSessionTypeId);
        }
        if (reactProps.currentfilter.DoctorId !== undefined) {
          setDoctorId(reactProps.currentfilter.DoctorId);
        }
        if (reactProps.currentfilter.ActiveStatusId !== undefined) {
          setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
        }
        if (reactProps.currentfilter.FacilityId !== undefined) {
          setFacilityId(reactProps.currentfilter.FacilityId);
        }
      }
    }
  }, [reactProps]);

  // Standalone: fetch lookups if not supplied via bridge
  const fetchStandaloneLookups = useCallback(async () => {
    if (reactProps?.lookup && Object.keys(reactProps.lookup).length > 0) return;
    try {
      const resp = await apiFetch<any>('General/Options/getoptions', {
        method: 'POST',
        body: JSON.stringify([
          { Key: 'AppointmentSessionType' },
          { Key: 'Facility' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 2, Value: [-1, facilityId !== '' ? facilityId : -1] }]
            }
          },
          { Key: 'Speciality' },
          { Key: 'ActiveStatus' }
        ])
      });
      if (resp) {
        setLookups({
          AppointmentSessionType: resp.AppointmentSessionType || [],
          Facility: resp.Facility || [],
          Doctor: resp.Doctor || [],
          Speciality: resp.Speciality || [],
          ActiveStatus: resp.ActiveStatus || []
        });
      }
    } catch (err) {
      console.warn('Failed to load appointment session lookups:', err);
    }
  }, [reactProps?.lookup, facilityId]);

  // Fetch list data
  const loadData = useCallback(
    async (page = currentPage, size = pageSize, fSessionType = sessionTypeId, fDoctor = doctorId, fStatus = activeStatusId) => {
      // If controlled by AngularJS bridge, notify host
      if (onAction) {
        onAction('search', {
          AppointmentSessionTypeId: fSessionType === '' ? -1 : fSessionType,
          DoctorId: fDoctor === '' ? -1 : fDoctor,
          ActiveStatusId: fStatus === '' ? -1 : fStatus,
          FacilityId: facilityId === '' ? -1 : facilityId,
          currentPage: page,
          pageSize: size
        });
        return;
      }

      // Standalone mode: directly fetch from backend API
      setLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 2, Value: facilityId === '' ? -1 : facilityId },
            { Key: 3, Value: fSessionType === '' ? -1 : fSessionType },
            { Key: 5, Value: fDoctor === '' ? -1 : fDoctor },
            { Key: 7, Value: -1 },
            { Key: 8, Value: fStatus === '' ? -1 : fStatus }
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page
          }
        };

        const res = await apiFetch<any>('appointment/AppointmentSession/GetAppointmentSessions', {
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
        console.error('Error fetching appointment sessions:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [onAction, currentPage, pageSize, sessionTypeId, doctorId, activeStatusId, facilityId]
  );

  // Initial load when standalone
  useEffect(() => {
    if (!reactProps) {
      fetchStandaloneLookups();
      loadData(1, pageSize);
    }
  }, [fetchStandaloneLookups, loadData, reactProps, pageSize]);

  // Filter handlers
  const handleFilterChange = (
    newSessionType: number | '',
    newDoctor: number | '',
    newStatus: number | ''
  ) => {
    setSessionTypeId(newSessionType);
    setDoctorId(newDoctor);
    setActiveStatusId(newStatus);
    setCurrentPage(1);

    if (onAction) {
      onAction('search', {
        AppointmentSessionTypeId: newSessionType === '' ? -1 : newSessionType,
        DoctorId: newDoctor === '' ? -1 : newDoctor,
        ActiveStatusId: newStatus === '' ? -1 : newStatus,
        FacilityId: facilityId === '' ? -1 : facilityId,
        currentPage: 1,
        pageSize
      });
    } else {
      loadData(1, pageSize, newSessionType, newDoctor, newStatus);
    }
  };

  const handleResetFilters = () => {
    setSessionTypeId(-1);
    setDoctorId(-1);
    setActiveStatusId(2);
    setSearchQuery('');
    setCurrentPage(1);

    if (onAction) {
      onAction('resetFilters');
    } else {
      loadData(1, pageSize, -1, -1, 2);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (onAction) {
      onAction('pageChange', { page: newPage, pageSize });
    } else {
      loadData(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (onAction) {
      onAction('search', {
        AppointmentSessionTypeId: sessionTypeId === '' ? -1 : sessionTypeId,
        DoctorId: doctorId === '' ? -1 : doctorId,
        ActiveStatusId: activeStatusId === '' ? -1 : activeStatusId,
        FacilityId: facilityId === '' ? -1 : facilityId,
        currentPage: 1,
        pageSize: newSize
      });
    } else {
      loadData(1, newSize);
    }
  };

  // Actions
  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else {
      // In standalone hash router
      window.location.hash = '#/app/appointmentsessiontab/0';
    }
  };

  const handleEdit = (item: AppointmentSessionItem) => {
    if (onAction) {
      onAction('edit', item);
    } else {
      window.location.hash = `#/app/appointmentsessiontab/${item.Id}`;
    }
  };

  const handleDeleteClick = (item: AppointmentSessionItem) => {
    setDeleteModalItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    if (onAction) {
      onAction('delete', deleteModalItem);
      setDeleteModalItem(null);
      setDeleting(false);
      return;
    }

    // Standalone delete
    try {
      await apiFetch('appointment/AppointmentSession/DeleteAppointmentSession', {
        method: 'POST',
        body: JSON.stringify({ Id: deleteModalItem.Id })
      });
      setDeleteModalItem(null);
      loadData(currentPage, pageSize);
    } catch (err) {
      console.error('Failed to delete appointment session:', err);
      alert('Failed to delete appointment session. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter displayed rows by optional client search query (Doctor name, Resource name, or Session Type)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const docName = item.User ? `${item.User.FirstName || ''} ${item.User.LastName || ''}`.toLowerCase() : '';
      const resName = item.ResourceMaster?.ResourceName?.toLowerCase() || '';
      const typeDesc = item.AppointmentSessionType?.Description?.toLowerCase() || '';
      const facilityName = item.Facility?.FacilityName?.toLowerCase() || '';
      return docName.includes(q) || resName.includes(q) || typeDesc.includes(q) || facilityName.includes(q);
    });
  }, [items, searchQuery]);

  // Derived metrics
  const activeCount = useMemo(() => {
    return items.filter((i) => i.ActiveStatusId === 1 || i.ActiveStatusId === 2 || i.IsActive).length;
  }, [items]);

  const uniqueDoctorsCount = useMemo(() => {
    const docIds = new Set(items.map((i) => i.DoctorId).filter(Boolean));
    return docIds.size;
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Helper to format Doctor/Resource display
  const renderDoctorOrResource = (item: AppointmentSessionItem) => {
    if (item.ResourceMaster?.ResourceName) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            <i className="fa fa-hospital-user" style={{ fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: colors.textMain }}>
              {item.ResourceMaster.ResourceName}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>Resource Master</div>
          </div>
        </div>
      );
    }

    if (item.User) {
      const title = item.User.Title?.Description ? `${item.User.Title.Description} ` : '';
      const fullName = `${title}${item.User.FirstName || ''} ${item.User.LastName || ''}`.trim() || '—';
      const initial = (item.User.FirstName?.[0] || 'D').toUpperCase();

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
              border: '1px solid #bfdbfe'
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: colors.textMain }}>
              {fullName}
            </div>
            {item.Speciality?.SpecialityName && (
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {item.Speciality.SpecialityName}
              </div>
            )}
          </div>
        </div>
      );
    }

    return <span style={{ color: colors.textMuted }}>—</span>;
  };

  return (
    <div
      style={{
        padding: '20px 24px',
        background: '#f8fafc',
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: typography.fontFamily
      }}
    >
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.primary,
              marginBottom: 4
            }}
          >
            <i className="fa fa-calendar-alt" />
            <span>Appointment Configuration</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: colors.textMain,
                letterSpacing: '-0.02em'
              }}
            >
              Appointment Sessions
            </h2>
            <span
              style={{
                background: '#e0e7ff',
                color: '#3730a3',
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: radii.full
              }}
            >
              {totalItems} total
            </span>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: colors.textMuted
            }}
          >
            Manage doctor and resource consultation schedules, slot capacities, and booking timings.
          </p>
        </div>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            id="btn-add-appointment-session"
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: colors.primary,
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: radii.md,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
              transition: 'background 0.15s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.primary)}
          >
            <i className="fa fa-plus" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics & KPI Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 18
        }}
      >
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}
          >
            <i className="fa fa-clock" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Total Sessions</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.textMain }}>{totalItems}</div>
          </div>
        </div>

        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}
          >
            <i className="fa fa-check-circle" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Active Sessions</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{activeCount}</div>
          </div>
        </div>

        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}
          >
            <i className="fa fa-user-md" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Configured Doctors</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#7c3aed' }}>{uniqueDoctorsCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Filters Card */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            alignItems: 'flex-end'
          }}
        >
          {/* Filter: Session Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: 6
              }}
            >
              Session Type
            </label>
            <select
              id="filter-session-type"
              value={sessionTypeId}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                handleFilterChange(val, doctorId, activeStatusId);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                fontSize: 13,
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none'
              }}
            >
              <option value={-1}>All Session Types</option>
              {lookups.AppointmentSessionType.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Doctor / Resource */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: 6
              }}
            >
              Doctor / Resource
            </label>
            <select
              id="filter-doctor"
              value={doctorId}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                handleFilterChange(sessionTypeId, val, activeStatusId);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                fontSize: 13,
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none'
              }}
            >
              <option value={-1}>All Doctors</option>
              {lookups.Doctor.map((opt) => {
                const prefix = opt.Title?.Description ? `${opt.Title.Description} ` : '';
                const name = opt.Text || `${prefix}${opt.FirstName || ''} ${opt.LastName || ''}`.trim();
                return (
                  <option key={opt.Id} value={opt.Id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter: Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: 6
              }}
            >
              Status
            </label>
            <select
              id="filter-status"
              value={activeStatusId}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                handleFilterChange(sessionTypeId, doctorId, val);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                fontSize: 13,
                color: colors.textMain,
                background: '#ffffff',
                outline: 'none'
              }}
            >
              <option value={-1}>All Statuses</option>
              {lookups.ActiveStatus.length > 0 ? (
                lookups.ActiveStatus.map((opt) => (
                  <option key={opt.Id} value={opt.Id}>
                    {opt.Text}
                  </option>
                ))
              ) : (
                <>
                  <option value={2}>Active</option>
                  <option value={1}>Inactive</option>
                </>
              )}
            </select>
          </div>

          {/* Filter: Search Query Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: 6
              }}
            >
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-search"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                  fontSize: 13
                }}
              />
              <input
                id="filter-search-box"
                type="text"
                placeholder="Filter by doctor, type, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  fontSize: 13,
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${colors.border}`
          }}
        >
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            Showing <strong>{filteredItems.length}</strong> matching sessions
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              id="btn-reset-filters"
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '6px 14px',
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <i className="fa fa-undo" />
              <span>Reset</span>
            </button>
            <button
              id="btn-refresh-sessions"
              type="button"
              onClick={() => loadData(currentPage, pageSize)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: colors.surfaceMuted,
                color: colors.primary,
                border: `1px solid ${colors.border}`,
                padding: '6px 14px',
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <i className={`fa fa-sync ${loading ? 'fa-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Table Container */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: 16
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Session Type
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Doctor / Resource
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Start Date
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  End Date
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                  Max Slots / Day
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary, marginBottom: 8 }} />
                    <div style={{ fontSize: 13 }}>Loading appointment sessions...</div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: colors.textMuted }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        marginBottom: 12
                      }}
                    >
                      <i className="fa fa-calendar-times" />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                      No Appointment Sessions Found
                    </div>
                    <div style={{ fontSize: 12, color: colors.textMuted, maxWidth: 360, margin: '0 auto 16px' }}>
                      There are no configured slot sessions matching your current filters. Click below to add one.
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNew}
                      style={{
                        background: colors.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: radii.md,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fa fa-plus" style={{ marginRight: 6 }} />
                      Add First Session
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isActive = item.ActiveStatusId === 1 || item.ActiveStatusId === 2 || item.IsActive;
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={item.Id}
                      style={{
                        background: isEven ? '#ffffff' : '#fcfdfd',
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? '#ffffff' : '#fcfdfd')}
                    >
                      {/* Session Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#f0fdf4',
                            color: '#166534',
                            padding: '3px 10px',
                            borderRadius: radii.md,
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          <i className="fa fa-tag" style={{ fontSize: 10 }} />
                          {item.AppointmentSessionType?.Description || 'Standard Session'}
                        </span>
                        {item.Facility?.FacilityName && (
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                            {item.Facility.FacilityName}
                          </div>
                        )}
                      </td>

                      {/* Doctor / Resource */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderDoctorOrResource(item)}
                      </td>

                      {/* Start Date */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: colors.textMain, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="fa fa-calendar-day" style={{ color: colors.textMuted, fontSize: 12 }} />
                          <span>{formatDate(item.StartDate)}</span>
                        </div>
                      </td>

                      {/* End Date */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: colors.textMain, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="fa fa-calendar-check" style={{ color: colors.textMuted, fontSize: 12 }} />
                          <span>{item.EndDate ? formatDate(item.EndDate) : <span style={{ color: colors.textMuted }}>No expiry</span>}</span>
                        </div>
                      </td>

                      {/* Max Slots Per Day */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: 13,
                            fontWeight: 700,
                            padding: '2px 10px',
                            borderRadius: radii.full,
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          {item.MaxSlotPerDay ?? '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c',
                            padding: '3px 9px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 600,
                            border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isActive ? '#16a34a' : '#dc2626'
                            }}
                          />
                          {item.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            title="Edit Appointment Session"
                            onClick={() => handleEdit(item)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md,
                              border: `1px solid ${colors.border}`,
                              background: '#ffffff',
                              color: colors.primary,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#eff6ff';
                              e.currentTarget.style.borderColor = '#bfdbfe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.borderColor = colors.border;
                            }}
                          >
                            <i className="fa fa-pen" style={{ fontSize: 12 }} />
                          </button>

                          <button
                            type="button"
                            title="Delete Appointment Session"
                            onClick={() => handleDeleteClick(item)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md,
                              border: `1px solid #fee2e2`,
                              background: '#ffffff',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.borderColor = '#fee2e2';
                            }}
                          >
                            <i className="fa fa-trash" style={{ fontSize: 12 }} />
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

        {/* 5. Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: `1px solid ${colors.border}`,
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          {/* Pager summary & page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textMuted }}>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                style={{
                  padding: '4px 8px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: 12,
                  color: colors.textMain,
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          {/* Page buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: currentPage <= 1 ? '#94a3b8' : colors.textMain,
                fontSize: 12,
                fontWeight: 500,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="fa fa-chevron-left" style={{ marginRight: 4, fontSize: 10 }} />
              Previous
            </button>

            {/* Current Page Display */}
            <span
              style={{
                padding: '6px 12px',
                background: colors.primary,
                color: '#ffffff',
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: currentPage >= totalPages ? '#94a3b8' : colors.textMain,
                fontSize: 12,
                fontWeight: 500,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
              <i className="fa fa-chevron-right" style={{ marginLeft: 4, fontSize: 10 }} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Delete Confirmation Modal */}
      {deleteModalItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: 440,
              overflow: 'hidden',
              animation: 'modalSlideIn 0.2s ease-out'
            }}
          >
            <div style={{ padding: '24px 24px 16px' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16
                }}
              >
                <i className="fa fa-exclamation-triangle" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: colors.textMain }}>
                Delete Appointment Session?
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                Are you sure you want to delete this appointment session?
                {deleteModalItem.User && (
                  <>
                    {' '}Doctor:{' '}
                    <strong>
                      {deleteModalItem.User.Title?.Description ? `${deleteModalItem.User.Title.Description} ` : ''}
                      {deleteModalItem.User.FirstName} {deleteModalItem.User.LastName}
                    </strong>.
                  </>
                )}
                {deleteModalItem.ResourceMaster && (
                  <> Resource: <strong>{deleteModalItem.ResourceMaster.ResourceName}</strong>.</>
                )}
                {' '}This action cannot be undone.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: `1px solid ${colors.border}`
              }}
            >
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: '#ffffff',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {deleting && <i className="fa fa-spinner fa-spin" />}
                <span>{deleting ? 'Deleting...' : 'Delete Session'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSessionsListScreen;
