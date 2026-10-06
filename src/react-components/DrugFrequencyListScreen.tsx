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
  Name?: string;
  FacilityId?: number;
  DrugFrequencyTypeId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface DrugFrequencyRow {
  Id: number;
  Code?: string;
  Name?: string;
  DrugFrequencyTypeId?: number;
  DrugFrequencyType?: { Id?: number; Description?: string; Text?: string };
  DrugFrequencySIGCodeId?: number;
  DrugFrequencySIGCode?: { Id?: number; Description?: string; Text?: string };
  NoOfTimes?: number | string;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
  IsActive?: boolean;
}

interface DrugFrequencyListScreenProps {
  reactProps?: {
    items?: DrugFrequencyRow[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    filters?: CurrentFilter;
    lookup?: {
      DrugFrequencyType?: LookupItem[];
      DrugFrequencySIGCode?: LookupItem[];
      ActiveStatus?: LookupItem[];
      Facility?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DrugFrequencyListScreen: React.FC<DrugFrequencyListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<DrugFrequencyRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    DrugFrequencyType: LookupItem[];
    DrugFrequencySIGCode: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({
    DrugFrequencyType: [],
    DrugFrequencySIGCode: [],
    ActiveStatus: []
  });

  const [filterName, setFilterName] = useState<string>('');
  const [filterType, setFilterType] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<number>(2);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DrugFrequencyRow | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    Id: number;
    Code: string;
    Name: string;
    DrugFrequencyTypeId: number | string;
    DrugFrequencySIGCodeId: number | string;
    NoOfTimes: string | number;
    IsActive: boolean;
  }>({
    Id: 0,
    Code: '',
    Name: '',
    DrugFrequencyTypeId: '',
    DrugFrequencySIGCodeId: '',
    NoOfTimes: 1,
    IsActive: true
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isEmbedded = !!onAction && !!reactProps;

  const items: DrugFrequencyRow[] = isEmbedded
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
        DrugFrequencyType: reactProps.lookup.DrugFrequencyType || [],
        DrugFrequencySIGCode: reactProps.lookup.DrugFrequencySIGCode || [],
        ActiveStatus: reactProps.lookup.ActiveStatus || []
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
          { Key: 'DrugFrequencyType' },
          { Key: 'DrugFrequencySIGCode' },
          { Key: 'ActiveStatus' }
        ])
      });
      if (resp.ok) {
        const data = await resp.json();
        setStandaloneLookups({
          DrugFrequencyType: data.DrugFrequencyType || [],
          DrugFrequencySIGCode: data.DrugFrequencySIGCode || [],
          ActiveStatus: data.ActiveStatus || []
        });
      }
    } catch (e) {
      console.warn('Error loading lookups for DrugFrequencies:', e);
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
          { Key: 2, Value: 1 }, // Default facility
          { Key: 3, Value: filterType },
          { Key: 4, Value: filterStatus }
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page
        }
      };

      const resp = await fetch('/api/clinicalmaster/DrugFrequency/GetDrugFrequencys', {
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
        showToast('Failed to load drug frequencies', 'error');
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

  const handleTypeChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterType(val);
    if (isEmbedded && onAction) {
      onAction('typeFilterChange', { value: val });
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
      Code: '',
      Name: '',
      DrugFrequencyTypeId: '',
      DrugFrequencySIGCodeId: '',
      NoOfTimes: 1,
      IsActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: DrugFrequencyRow) => {
    setEditingItem(item);
    setFormErrors({});
    setModalFormData({
      Id: item.Id,
      Code: item.Code || '',
      Name: item.Name || '',
      DrugFrequencyTypeId: item.DrugFrequencyTypeId || '',
      DrugFrequencySIGCodeId: item.DrugFrequencySIGCodeId || '',
      NoOfTimes: item.NoOfTimes || 1,
      IsActive: item.IsActive !== undefined ? item.IsActive : item.ActiveStatusId === 2
    });
    setIsModalOpen(true);

    try {
      const resp = await fetch('/api/clinicalmaster/DrugFrequency/GetDrugFrequencyById', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        const full = await resp.json();
        if (full) {
          setModalFormData({
            Id: full.Id || item.Id,
            Code: full.Code || item.Code || '',
            Name: full.Name || item.Name || '',
            DrugFrequencyTypeId: full.DrugFrequencyTypeId || item.DrugFrequencyTypeId || '',
            DrugFrequencySIGCodeId: full.DrugFrequencySIGCodeId || item.DrugFrequencySIGCodeId || '',
            NoOfTimes: full.NoOfTimes || item.NoOfTimes || 1,
            IsActive: full.IsActive !== undefined ? full.IsActive : true
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load drug frequency detail:', e);
    }
  };

  const handleDelete = async (item: DrugFrequencyRow) => {
    if (!window.confirm(`Are you sure you want to delete ${item.Name || 'this drug frequency'}?`)) {
      return;
    }

    if (isEmbedded && onAction) {
      onAction('delete', item);
      return;
    }

    try {
      const resp = await fetch('/api/clinicalmaster/DrugFrequency/DeleteDrugFrequency', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        showToast('Drug frequency deleted successfully', 'success');
        fetchList(activePage);
      } else {
        showToast('Failed to delete drug frequency', 'error');
      }
    } catch (e) {
      showToast('Error deleting item', 'error');
    }
  };

  const validateModalForm = () => {
    const errors: { [key: string]: string } = {};
    if (!modalFormData.Code.trim()) {
      errors.Code = 'Code is required';
    }
    if (!modalFormData.Name.trim()) {
      errors.Name = 'Name is required';
    }
    if (!modalFormData.DrugFrequencyTypeId) {
      errors.DrugFrequencyTypeId = 'Type is required';
    }
    if (!modalFormData.NoOfTimes || Number(modalFormData.NoOfTimes) <= 0) {
      errors.NoOfTimes = 'Number of times must be at least 1';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveModal = async () => {
    if (!validateModalForm()) return;

    setIsSaving(true);
    const isEdit = modalFormData.Id > 0;
    const actionUrl = isEdit
      ? '/api/clinicalmaster/DrugFrequency/UpdateDrugFrequency'
      : '/api/clinicalmaster/DrugFrequency/AddDrugFrequency';

    const payload = {
      Data: {
        Id: modalFormData.Id,
        Code: modalFormData.Code.trim(),
        Name: modalFormData.Name.trim(),
        DrugFrequencyTypeId: Number(modalFormData.DrugFrequencyTypeId),
        DrugFrequencySIGCodeId: modalFormData.DrugFrequencySIGCodeId ? Number(modalFormData.DrugFrequencySIGCodeId) : null,
        NoOfTimes: Number(modalFormData.NoOfTimes),
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
        showToast(isEdit ? 'Drug frequency updated successfully' : 'Drug frequency added successfully', 'success');
        setIsModalOpen(false);
        if (isEmbedded && onAction) {
          onAction('refresh');
        } else {
          fetchList(isEdit ? activePage : 1);
        }
      } else {
        showToast('Error saving drug frequency. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Network error while saving drug frequency.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const typeOptions = [
    { value: -1, label: 'All Frequency Types' },
    ...lookups.DrugFrequencyType.map((t) => ({ value: t.Id, label: t.Text }))
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
        title="Drug Frequency Master"
        breadcrumb={[
          { label: 'Clinical Masters' },
          { label: 'Drug Frequencies' }
        ]}
        actions={
          <Button
            variant="primary"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="fa fa-plus" aria-hidden="true" /> Add Frequency
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card>
        <FilterBar>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end', width: '100%' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Code / Name
              </label>
              <Input
                placeholder="Search code or name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
              />
            </div>

            {/* Type Dropdown */}
            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Frequency Type
              </label>
              <Select
                options={typeOptions}
                value={filterType}
                onChange={handleTypeChange}
              />
            </div>

            {/* Status Dropdown */}
            <div style={{ flex: '1 1 160px', minWidth: 140 }}>
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
                  setFilterType(-1);
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
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>SIG Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>No. of Times</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: 8 }}>Loading drug frequencies...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    No drug frequencies found matching the selected criteria.
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
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: colors.textMain }}>
                      {row.Code || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {row.Name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.DrugFrequencyType?.Description || row.DrugFrequencyType?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.DrugFrequencySIGCode?.Description || row.DrugFrequencySIGCode?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.NoOfTimes || '—'}
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
                          title="Edit Drug Frequency"
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
                          title="Delete Drug Frequency"
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
                {modalFormData.Id > 0 ? 'Edit Drug Frequency' : 'Add New Drug Frequency'}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Code */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. BD, TID, QDS"
                    value={modalFormData.Code}
                    onChange={(e) => setModalFormData({ ...modalFormData, Code: e.target.value })}
                  />
                  {formErrors.Code && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.Code}</div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. Twice daily"
                    value={modalFormData.Name}
                    onChange={(e) => setModalFormData({ ...modalFormData, Name: e.target.value })}
                  />
                  {formErrors.Name && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.Name}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Frequency Type */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Frequency Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Type' },
                      ...lookups.DrugFrequencyType.map((t) => ({ value: t.Id, label: t.Text }))
                    ]}
                    value={modalFormData.DrugFrequencyTypeId}
                    onChange={(val) => setModalFormData({ ...modalFormData, DrugFrequencyTypeId: val })}
                  />
                  {formErrors.DrugFrequencyTypeId && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DrugFrequencyTypeId}</div>
                  )}
                </div>

                {/* SIG Code */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    SIG Code
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select SIG Code' },
                      ...lookups.DrugFrequencySIGCode.map((s) => ({ value: s.Id, label: s.Text }))
                    ]}
                    value={modalFormData.DrugFrequencySIGCodeId}
                    onChange={(val) => setModalFormData({ ...modalFormData, DrugFrequencySIGCodeId: val })}
                  />
                </div>
              </div>

              {/* No of times */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                  No. of Times <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={String(modalFormData.NoOfTimes)}
                  onChange={(e) => setModalFormData({ ...modalFormData, NoOfTimes: Number(e.target.value) || 1 })}
                />
                {formErrors.NoOfTimes && (
                  <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.NoOfTimes}</div>
                )}
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
