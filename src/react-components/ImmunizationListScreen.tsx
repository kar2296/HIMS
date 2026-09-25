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
  ImmunizationName?: string;
  ImmunizationFrequencyId?: number;
  ConditionId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface ImmunizationRow {
  Id: number;
  ImmunizationName?: string;
  Description?: string;
  FrequencyId?: number;
  Frequency?: { Id?: number; Description?: string; Text?: string };
  ConditionId?: number;
  Condition?: { Id?: number; Description?: string; Text?: string };
  Duration?: string | number;
  PeriodId?: number;
  Period?: { Id?: number; Description?: string; Text?: string };
  RouteId?: number;
  Route?: { Id?: number; Description?: string; Text?: string };
  ScheduleFlagId?: number;
  ScheduleFlag?: { Id?: number; Description?: string; Text?: string };
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
  IsActive?: boolean;
}

interface ImmunizationListScreenProps {
  reactProps?: {
    items?: ImmunizationRow[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    filters?: CurrentFilter;
    lookup?: {
      ActiveStatus?: LookupItem[];
      Condition?: LookupItem[];
      Frequency?: LookupItem[];
      Period?: LookupItem[];
      Route?: LookupItem[];
      ScheduleFlag?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ImmunizationListScreen: React.FC<ImmunizationListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<ImmunizationRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ActiveStatus: LookupItem[];
    Condition: LookupItem[];
    Frequency: LookupItem[];
    Period: LookupItem[];
    Route: LookupItem[];
    ScheduleFlag: LookupItem[];
  }>({
    ActiveStatus: [],
    Condition: [],
    Frequency: [],
    Period: [],
    Route: [],
    ScheduleFlag: []
  });

  const [filterName, setFilterName] = useState<string>('');
  const [filterFrequency, setFilterFrequency] = useState<number>(-1);
  const [filterCondition, setFilterCondition] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<number>(2);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ImmunizationRow | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    Id: number;
    ImmunizationName: string;
    FrequencyId: number | string;
    Duration: string;
    PeriodId: number | string;
    RouteId: number | string;
    ScheduleFlagId: number | string;
    IsActive: boolean;
  }>({
    Id: 0,
    ImmunizationName: '',
    FrequencyId: '',
    Duration: '',
    PeriodId: '',
    RouteId: '',
    ScheduleFlagId: '',
    IsActive: true
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isEmbedded = !!onAction && !!reactProps;

  const items: ImmunizationRow[] = isEmbedded
    ? (reactProps.items || [])
    : standaloneItems;

  const totalItems: number = isEmbedded
    ? ((reactProps.pagerObj && reactProps.pagerObj.totalItems) ?? (reactProps.totalItems ?? items.length))
    : standaloneTotal;

  const activePage: number = isEmbedded
    ? ((reactProps.pagerObj && reactProps.pagerObj.currentPage) ?? (reactProps.currentPage ?? 1))
    : currentPage;

  const lookups = isEmbedded && reactProps.lookup
    ? {
        ActiveStatus: reactProps.lookup.ActiveStatus || [],
        Condition: reactProps.lookup.Condition || [],
        Frequency: reactProps.lookup.Frequency || [],
        Period: reactProps.lookup.Period || [],
        Route: reactProps.lookup.Route || [],
        ScheduleFlag: reactProps.lookup.ScheduleFlag || []
      }
    : standaloneLookups;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token =
      (window as any).sessionHelper?.getAuthToken?.() ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Fetch Lookups
  const fetchLookups = async () => {
    try {
      const resp = await fetch('/api/General/Options/getoptions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify([
          { Key: 'ActiveStatus' },
          { Key: 'Condition' },
          { Key: 'Frequency' },
          { Key: 'Period' },
          { Key: 'Route' },
          { Key: 'ScheduleFlag' }
        ])
      });
      if (resp.ok) {
        const data = await resp.json();
        setStandaloneLookups({
          ActiveStatus: data.ActiveStatus || [],
          Condition: data.Condition || [],
          Frequency: data.Frequency || [],
          Period: data.Period || [],
          Route: data.Route || [],
          ScheduleFlag: data.ScheduleFlag || []
        });
      }
    } catch (e) {
      console.warn('Error loading lookups for Immunization:', e);
    }
  };

  // Fetch List
  const fetchList = async (page: number = 1) => {
    if (isEmbedded) return;
    setLoading(true);
    try {
      const inputData = {
        Params: [
          { Key: 1, Value: filterName },
          { Key: 4, Value: filterCondition },
          { Key: 2, Value: filterStatus },
          { Key: 3, Value: filterFrequency }
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page
        }
      };

      const resp = await fetch('/api/clinicalmaster/Immunization/GetImmunizations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(inputData)
      });

      if (resp.ok) {
        const res = await resp.json();
        setStandaloneItems(res.Data || []);
        setStandaloneTotal(res.PageContext?.TotalRecords || 0);
        setCurrentPage(page);
      } else {
        showToast('Failed to load immunizations', 'error');
      }
    } catch (e) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      fetchLookups();
      fetchList(1);
    }
  }, [isEmbedded]);

  const handleSearchSubmit = () => {
    if (isEmbedded && onAction) {
      onAction('search', { value: filterName });
    } else {
      fetchList(1);
    }
  };

  const handleFrequencyChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterFrequency(val);
    if (isEmbedded && onAction) {
      onAction('frequencyFilterChange', { value: val });
    } else {
      setTimeout(() => fetchList(1), 0);
    }
  };

  const handleConditionChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterCondition(val);
    if (isEmbedded && onAction) {
      onAction('conditionFilterChange', { value: val });
    } else {
      setTimeout(() => fetchList(1), 0);
    }
  };

  const handleStatusChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterStatus(val);
    if (isEmbedded && onAction) {
      onAction('statusFilterChange', { value: val });
    } else {
      setTimeout(() => fetchList(1), 0);
    }
  };

  const handlePageChange = (page: number) => {
    if (isEmbedded && onAction) {
      onAction('pageChange', { page });
    } else {
      fetchList(page);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormErrors({});
    setModalFormData({
      Id: 0,
      ImmunizationName: '',
      FrequencyId: '',
      Duration: '',
      PeriodId: '',
      RouteId: '',
      ScheduleFlagId: '',
      IsActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: ImmunizationRow) => {
    setEditingItem(item);
    setFormErrors({});
    setModalFormData({
      Id: item.Id,
      ImmunizationName: item.ImmunizationName || '',
      FrequencyId: item.FrequencyId || '',
      Duration: item.Duration !== undefined ? String(item.Duration) : '',
      PeriodId: item.PeriodId || '',
      RouteId: item.RouteId || '',
      ScheduleFlagId: item.ScheduleFlagId || '',
      IsActive: item.IsActive !== undefined ? item.IsActive : item.ActiveStatusId === 2
    });
    setIsModalOpen(true);

    try {
      const resp = await fetch('/api/clinicalmaster/Immunization/GetImmunizationById', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        const full = await resp.json();
        if (full) {
          setModalFormData({
            Id: full.Id || item.Id,
            ImmunizationName: full.ImmunizationName || item.ImmunizationName || '',
            FrequencyId: full.FrequencyId || item.FrequencyId || '',
            Duration: full.Duration !== undefined ? String(full.Duration) : '',
            PeriodId: full.PeriodId || item.PeriodId || '',
            RouteId: full.RouteId || item.RouteId || '',
            ScheduleFlagId: full.ScheduleFlagId || item.ScheduleFlagId || '',
            IsActive: full.IsActive !== undefined ? full.IsActive : true
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load immunization detail:', e);
    }
  };

  const handleDelete = async (item: ImmunizationRow) => {
    if (!window.confirm(`Are you sure you want to delete ${item.ImmunizationName || 'this immunization'}?`)) {
      return;
    }

    if (isEmbedded && onAction) {
      onAction('delete', item);
      return;
    }

    try {
      const resp = await fetch('/api/clinicalmaster/Immunization/DeleteImmunization', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        showToast('Immunization deleted successfully', 'success');
        fetchList(activePage);
      } else {
        showToast('Failed to delete immunization', 'error');
      }
    } catch (e) {
      showToast('Error deleting immunization', 'error');
    }
  };

  const validateModalForm = () => {
    const errors: { [key: string]: string } = {};
    if (!modalFormData.ImmunizationName.trim()) {
      errors.ImmunizationName = 'Immunization Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveModal = async () => {
    if (!validateModalForm()) return;

    setIsSaving(true);
    const isEdit = modalFormData.Id > 0;
    const actionUrl = isEdit
      ? '/api/clinicalmaster/Immunization/UpdateImmunization'
      : '/api/clinicalmaster/Immunization/AddImmunization';

    const payload = {
      Data: {
        Id: modalFormData.Id,
        ImmunizationName: modalFormData.ImmunizationName.trim(),
        FrequencyId: modalFormData.FrequencyId ? Number(modalFormData.FrequencyId) : null,
        Duration: modalFormData.Duration.trim(),
        PeriodId: modalFormData.PeriodId ? Number(modalFormData.PeriodId) : null,
        RouteId: modalFormData.RouteId ? Number(modalFormData.RouteId) : null,
        ScheduleFlagId: modalFormData.ScheduleFlagId ? Number(modalFormData.ScheduleFlagId) : null,
        IsActive: modalFormData.IsActive
      }
    };

    try {
      const resp = await fetch(actionUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        showToast(isEdit ? 'Immunization updated successfully' : 'Immunization added successfully', 'success');
        setIsModalOpen(false);
        if (isEmbedded && onAction) {
          onAction('refresh');
        } else {
          fetchList(isEdit ? activePage : 1);
        }
      } else {
        showToast('Error saving immunization. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Network error while saving immunization.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const frequencyOptions = [
    { value: -1, label: 'All Frequencies' },
    ...lookups.Frequency.map((f) => ({ value: f.Id, label: f.Text }))
  ];

  const conditionOptions = [
    { value: -1, label: 'All Conditions' },
    ...lookups.Condition.map((c) => ({ value: c.Id, label: c.Text }))
  ];

  const statusOptions = [
    { value: -1, label: 'All Statuses' },
    { value: 2, label: 'Active' },
    { value: 1, label: 'Inactive' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: typography.body.fontSize,
            fontWeight: 500,
            transition: 'all 0.3s ease'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Immunization Master"
        breadcrumb={[
          { label: 'Clinical Masters' },
          { label: 'Immunizations' }
        ]}
        actions={
          <Button
            variant="primary"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="fa fa-plus" aria-hidden="true" /> Add Immunization
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card>
        <FilterBar>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end', width: '100%' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Immunization Name
              </label>
              <Input
                placeholder="Search immunization..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
              />
            </div>

            {/* Frequency Dropdown */}
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Frequency
              </label>
              <Select
                options={frequencyOptions}
                value={filterFrequency}
                onChange={handleFrequencyChange}
              />
            </div>

            {/* Condition Dropdown */}
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Condition
              </label>
              <Select
                options={conditionOptions}
                value={filterCondition}
                onChange={handleConditionChange}
              />
            </div>

            {/* Status Dropdown */}
            <div style={{ flex: '1 1 140px', minWidth: 130 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Status
              </label>
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={handleStatusChange}
              />
            </div>

            {/* Search & Reset Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button variant="secondary" onClick={handleSearchSubmit}>
                <i className="fas fa-search" style={{ marginRight: 6 }} /> Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterName('');
                  setFilterFrequency(-1);
                  setFilterCondition(-1);
                  setFilterStatus(2);
                  if (isEmbedded && onAction) {
                    onAction('search', { value: '' });
                  } else {
                    setTimeout(() => fetchList(1), 0);
                  }
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </FilterBar>
      </Card>

      {/* Data Table */}
      <Card>
        <div style={{ overflowX: 'auto', minHeight: 300 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Immunization Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Frequency</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Condition</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Route</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: 8 }}>Loading immunizations...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    No immunizations found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => (
                  <tr
                    key={row.Id || idx}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {row.ImmunizationName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.Frequency?.Description || row.Frequency?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.Condition?.Description || row.Condition?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.Route?.Description || row.Route?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: row.ActiveStatusId === 2 || row.IsActive ? '#dcfce7' : '#fee2e2',
                          color: row.ActiveStatusId === 2 || row.IsActive ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {row.ActiveStatus?.Description || (row.ActiveStatusId === 2 || row.IsActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          title="Edit Immunization"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 6,
                            borderRadius: 4,
                            color: '#2563eb'
                          }}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          title="Delete Immunization"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 6,
                            borderRadius: 4,
                            color: '#dc2626'
                          }}
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            Showing {items.length} of {totalItems} total records
          </div>
          <Pagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              width: '90%',
              maxWidth: 650,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: '#f8fafc'
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.textMain }}>
                {modalFormData.Id > 0 ? 'Edit Immunization' : 'Add New Immunization'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: colors.textMuted
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {/* Immunization Name */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                  Immunization Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  placeholder="e.g. Hepatitis B, Polio"
                  value={modalFormData.ImmunizationName}
                  onChange={(e) => setModalFormData({ ...modalFormData, ImmunizationName: e.target.value })}
                />
                {formErrors.ImmunizationName && (
                  <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.ImmunizationName}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Frequency */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Frequency
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Frequency' },
                      ...lookups.Frequency.map((f) => ({ value: f.Id, label: f.Text }))
                    ]}
                    value={modalFormData.FrequencyId}
                    onChange={(val) => setModalFormData({ ...modalFormData, FrequencyId: val })}
                  />
                </div>

                {/* Route */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Route
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Route' },
                      ...lookups.Route.map((r) => ({ value: r.Id, label: r.Text }))
                    ]}
                    value={modalFormData.RouteId}
                    onChange={(val) => setModalFormData({ ...modalFormData, RouteId: val })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Duration */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Duration
                  </label>
                  <Input
                    placeholder="e.g. 6"
                    value={modalFormData.Duration}
                    onChange={(e) => setModalFormData({ ...modalFormData, Duration: e.target.value })}
                  />
                </div>

                {/* Period */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Period
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Period' },
                      ...lookups.Period.map((p) => ({ value: p.Id, label: p.Text }))
                    ]}
                    value={modalFormData.PeriodId}
                    onChange={(val) => setModalFormData({ ...modalFormData, PeriodId: val })}
                  />
                </div>
              </div>

              {/* Schedule Flag */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                  Schedule Flag
                </label>
                <Select
                  options={[
                    { value: '', label: 'Select Schedule Flag' },
                    ...lookups.ScheduleFlag.map((s) => ({ value: s.Id, label: s.Text }))
                  ]}
                  value={modalFormData.ScheduleFlagId}
                  onChange={(val) => setModalFormData({ ...modalFormData, ScheduleFlagId: val })}
                />
              </div>

              {/* Active Checkbox */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', paddingTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={modalFormData.IsActive}
                    onChange={(e) => setModalFormData({ ...modalFormData, IsActive: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                padding: '16px 24px',
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: '#f8fafc'
              }}
            >
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveModal} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save & Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
