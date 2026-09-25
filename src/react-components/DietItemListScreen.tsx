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
  DietItemCode?: string;
  DietItemTypeId?: number;
  DietCategoryId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface DietItemRow {
  Id: number;
  DietItemCode?: string;
  DietName?: string;
  Description?: string;
  DietItemTypeId?: number;
  DietItemType?: { Id?: number; Description?: string; Text?: string };
  DietCategoryId?: number;
  DietCategory?: { Id?: number; Description?: string; Text?: string };
  DietFrequencyId?: number;
  DietFrequency?: { Id?: number; Description?: string; Text?: string };
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
  Comments?: string;
  IsActive?: boolean;
  IsDirectBill?: boolean;
}

interface DietItemListScreenProps {
  reactProps?: {
    items?: DietItemRow[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    filters?: CurrentFilter;
    lookup?: {
      DietItemType?: LookupItem[];
      DietCategory?: LookupItem[];
      DietFrequency?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DietItemListScreen: React.FC<DietItemListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<DietItemRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    DietItemType: LookupItem[];
    DietCategory: LookupItem[];
    DietFrequency: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({
    DietItemType: [],
    DietCategory: [],
    DietFrequency: [],
    ActiveStatus: []
  });

  const [filterCode, setFilterCode] = useState<string>('');
  const [filterType, setFilterType] = useState<number>(-1);
  const [filterCategory, setFilterCategory] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<number>(2);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DietItemRow | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    Id: number;
    DietItemCode: string;
    DietName: string;
    Description: string;
    DietItemTypeId: number | string;
    DietCategoryId: number | string;
    DietFrequencyId: number | string;
    Comments: string;
    IsActive: boolean;
    IsDirectBill: boolean;
  }>({
    Id: 0,
    DietItemCode: '',
    DietName: '',
    Description: '',
    DietItemTypeId: '',
    DietCategoryId: '',
    DietFrequencyId: '',
    Comments: '',
    IsActive: true,
    IsDirectBill: false
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isEmbedded = !!onAction && !!reactProps;

  const items: DietItemRow[] = isEmbedded
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
        DietItemType: reactProps.lookup.DietItemType || [],
        DietCategory: reactProps.lookup.DietCategory || [],
        DietFrequency: reactProps.lookup.DietFrequency || [],
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
          { Key: 'DietItemType' },
          { Key: 'DietCategory' },
          { Key: 'DietFrequency' },
          { Key: 'ActiveStatus' }
        ])
      });
      if (resp.ok) {
        const data = await resp.json();
        setStandaloneLookups({
          DietItemType: data.DietItemType || [],
          DietCategory: data.DietCategory || [],
          DietFrequency: data.DietFrequency || [],
          ActiveStatus: data.ActiveStatus || []
        });
      }
    } catch (e) {
      console.warn('Error loading lookups for DietItems:', e);
    }
  };

  // Fetch List (Standalone Mode)
  const fetchList = async (page: number = 1) => {
    if (isEmbedded) return;
    setLoading(true);
    try {
      const inputData = {
        Params: [
          { Key: 1, Value: filterType },
          { Key: 2, Value: filterCategory },
          { Key: 3, Value: filterStatus },
          { Key: 4, Value: filterCode }
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page
        }
      };

      const resp = await fetch('/api/clinicalmaster/DietItemMaster/GetDietItemMasters', {
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
        showToast('Failed to load diet items', 'error');
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
      onAction('search', { value: filterCode });
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

  const handleCategoryChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterCategory(val);
    if (isEmbedded && onAction) {
      onAction('categoryFilterChange', { value: val });
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
      DietItemCode: '',
      DietName: '',
      Description: '',
      DietItemTypeId: '',
      DietCategoryId: '',
      DietFrequencyId: '',
      Comments: '',
      IsActive: true,
      IsDirectBill: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: DietItemRow) => {
    setEditingItem(item);
    setFormErrors({});
    setModalFormData({
      Id: item.Id,
      DietItemCode: item.DietItemCode || '',
      DietName: item.DietName || '',
      Description: item.Description || '',
      DietItemTypeId: item.DietItemTypeId || '',
      DietCategoryId: item.DietCategoryId || '',
      DietFrequencyId: item.DietFrequencyId || '',
      Comments: item.Comments || '',
      IsActive: item.IsActive !== undefined ? item.IsActive : item.ActiveStatusId === 2,
      IsDirectBill: !!item.IsDirectBill
    });
    setIsModalOpen(true);

    try {
      const resp = await fetch('/api/clinicalmaster/DietItemMaster/GetDietItemMasterById', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        const full = await resp.json();
        if (full) {
          setModalFormData({
            Id: full.Id || item.Id,
            DietItemCode: full.DietItemCode || item.DietItemCode || '',
            DietName: full.DietName || item.DietName || '',
            Description: full.Description || item.Description || '',
            DietItemTypeId: full.DietItemTypeId || item.DietItemTypeId || '',
            DietCategoryId: full.DietCategoryId || item.DietCategoryId || '',
            DietFrequencyId: full.DietFrequencyId || item.DietFrequencyId || '',
            Comments: full.Comments || '',
            IsActive: full.IsActive !== undefined ? full.IsActive : true,
            IsDirectBill: !!full.IsDirectBill
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load item detail:', e);
    }
  };

  const handleDelete = async (item: DietItemRow) => {
    if (!window.confirm(`Are you sure you want to delete ${item.DietName || 'this diet item'}?`)) {
      return;
    }

    if (isEmbedded && onAction) {
      onAction('delete', item);
      return;
    }

    try {
      const resp = await fetch('/api/clinicalmaster/DietItemMaster/DeleteDietItemMaster', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Id: item.Id })
      });
      if (resp.ok) {
        showToast('Diet item deleted successfully', 'success');
        fetchList(activePage);
      } else {
        showToast('Failed to delete diet item', 'error');
      }
    } catch (e) {
      showToast('Error deleting item', 'error');
    }
  };

  const validateModalForm = () => {
    const errors: { [key: string]: string } = {};
    if (!modalFormData.DietItemCode.trim()) {
      errors.DietItemCode = 'Code is required';
    }
    if (!modalFormData.DietName.trim()) {
      errors.DietName = 'Diet Name is required';
    }
    if (!modalFormData.DietItemTypeId) {
      errors.DietItemTypeId = 'Diet Item Type is required';
    }
    if (!modalFormData.DietCategoryId) {
      errors.DietCategoryId = 'Category is required';
    }
    if (!modalFormData.DietFrequencyId) {
      errors.DietFrequencyId = 'Frequency is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveModal = async () => {
    if (!validateModalForm()) return;

    setIsSaving(true);
    const isEdit = modalFormData.Id > 0;
    const actionUrl = isEdit
      ? '/api/clinicalmaster/DietItemMaster/UpdateDietItemMaster'
      : '/api/clinicalmaster/DietItemMaster/AddDietItemMaster';

    const payload = {
      Data: {
        Id: modalFormData.Id,
        DietItemCode: modalFormData.DietItemCode.trim(),
        DietName: modalFormData.DietName.trim(),
        Description: modalFormData.Description.trim(),
        DietItemTypeId: Number(modalFormData.DietItemTypeId),
        DietCategoryId: Number(modalFormData.DietCategoryId),
        DietFrequencyId: Number(modalFormData.DietFrequencyId),
        Comments: modalFormData.Comments.trim(),
        IsActive: modalFormData.IsActive,
        IsDirectBill: modalFormData.IsDirectBill
      }
    };

    try {
      const resp = await fetch(actionUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        showToast(isEdit ? 'Diet item updated successfully' : 'Diet item added successfully', 'success');
        setIsModalOpen(false);
        if (isEmbedded && onAction) {
          onAction('refresh');
        } else {
          fetchList(isEdit ? activePage : 1);
        }
      } else {
        showToast('Error saving diet item. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Network error while saving diet item.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const typeOptions = [
    { value: -1, label: 'All Types' },
    ...lookups.DietItemType.map((t) => ({ value: t.Id, label: t.Text }))
  ];

  const categoryOptions = [
    { value: -1, label: 'All Categories' },
    ...lookups.DietCategory.map((c) => ({ value: c.Id, label: c.Text }))
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
        title="Diet Items Master"
        breadcrumb={[
          { label: 'Clinical Masters' },
          { label: 'Diet Items' }
        ]}
        actions={
          <Button
            variant="primary"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="fa fa-plus" aria-hidden="true" /> Add Diet Item
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
                Diet Item Code / Name
              </label>
              <Input
                placeholder="Search by code or name..."
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
              />
            </div>

            {/* Type Dropdown */}
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Diet Item Type
              </label>
              <Select
                options={typeOptions}
                value={filterType}
                onChange={handleTypeChange}
              />
            </div>

            {/* Category Dropdown */}
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Diet Category
              </label>
              <Select
                options={categoryOptions}
                value={filterCategory}
                onChange={handleCategoryChange}
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
                  setFilterCode('');
                  setFilterType(-1);
                  setFilterCategory(-1);
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
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Diet Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Frequency</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: 8 }}>Loading diet items...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    No diet items found matching the selected criteria.
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
                      {row.DietItemCode || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {row.DietName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.DietItemType?.Description || row.DietItemType?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.Description || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.DietCategory?.Description || row.DietCategory?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.DietFrequency?.Description || row.DietFrequency?.Text || '—'}
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
                          title="Edit Diet Item"
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
                          title="Delete Diet Item"
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
              maxWidth: 700,
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
                {modalFormData.Id > 0 ? 'Edit Diet Item' : 'Add New Diet Item'}
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
                {/* Code Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Diet Item Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter code (e.g. DIET001)"
                    value={modalFormData.DietItemCode}
                    onChange={(e) => setModalFormData({ ...modalFormData, DietItemCode: e.target.value })}
                  />
                  {formErrors.DietItemCode && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DietItemCode}</div>
                  )}
                </div>

                {/* Name Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Diet Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter diet name"
                    value={modalFormData.DietName}
                    onChange={(e) => setModalFormData({ ...modalFormData, DietName: e.target.value })}
                  />
                  {formErrors.DietName && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DietName}</div>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                  Description
                </label>
                <Input
                  placeholder="Enter short description"
                  value={modalFormData.Description}
                  onChange={(e) => setModalFormData({ ...modalFormData, Description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* Type Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Type' },
                      ...lookups.DietItemType.map((t) => ({ value: t.Id, label: t.Text }))
                    ]}
                    value={modalFormData.DietItemTypeId}
                    onChange={(val) => setModalFormData({ ...modalFormData, DietItemTypeId: val })}
                  />
                  {formErrors.DietItemTypeId && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DietItemTypeId}</div>
                  )}
                </div>

                {/* Category Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Category' },
                      ...lookups.DietCategory.map((c) => ({ value: c.Id, label: c.Text }))
                    ]}
                    value={modalFormData.DietCategoryId}
                    onChange={(val) => setModalFormData({ ...modalFormData, DietCategoryId: val })}
                  />
                  {formErrors.DietCategoryId && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DietCategoryId}</div>
                  )}
                </div>

                {/* Frequency Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Frequency <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Frequency' },
                      ...lookups.DietFrequency.map((f) => ({ value: f.Id, label: f.Text }))
                    ]}
                    value={modalFormData.DietFrequencyId}
                    onChange={(val) => setModalFormData({ ...modalFormData, DietFrequencyId: val })}
                  />
                  {formErrors.DietFrequencyId && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.DietFrequencyId}</div>
                  )}
                </div>
              </div>

              {/* Comments Field */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={modalFormData.Comments}
                  onChange={(e) => setModalFormData({ ...modalFormData, Comments: e.target.value })}
                  placeholder="Additional notes or comments..."
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 4,
                    border: `1px solid ${colors.border}`,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Checkboxes: Active & Direct Bill */}
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
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={modalFormData.IsDirectBill}
                    onChange={(e) => setModalFormData({ ...modalFormData, IsDirectBill: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Direct Bill</span>
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
