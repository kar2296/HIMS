import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';
import { ConfirmModal } from './ConfirmModal';
import { callBackendApi } from '../services/apiService';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  VitalName?: string;
  VitalValueTypeId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface VitalRow {
  Id: number;
  VitalName?: string;
  Description?: string;
  UOM?: string;
  LoincCode?: string;
  VitalValueTypeId?: number;
  VitalValueType?: { Id?: number; Description?: string; Text?: string };
  ValueFormat?: string;
  ReferenceRangeFrom?: string | number;
  ReferenceRangeTo?: string | number;
  DisplayOrder?: number;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
  IsActive?: boolean;
}

interface VitalMasterListScreenProps {
  reactProps?: {
    items?: VitalRow[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    filters?: CurrentFilter;
    lookup?: {
      VitalValueType?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const VitalMasterListScreen: React.FC<VitalMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<VitalRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    VitalValueType: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({
    VitalValueType: [],
    ActiveStatus: []
  });

  const [filterName, setFilterName] = useState<string>('');
  const [filterValueType, setFilterValueType] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<number>(2);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<VitalRow | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    Id: number;
    VitalName: string;
    UOM: string;
    VitalValueTypeId: number | string;
    ValueFormat: string;
    ReferenceRangeFrom: string;
    ReferenceRangeTo: string;
    DisplayOrder: number;
    IsActive: boolean;
  }>({
    Id: 0,
    VitalName: '',
    UOM: '',
    VitalValueTypeId: '',
    ValueFormat: '',
    ReferenceRangeFrom: '',
    ReferenceRangeTo: '',
    DisplayOrder: 1,
    IsActive: true
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isEmbedded = !!onAction && !!reactProps;

  const items: VitalRow[] = isEmbedded
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
        VitalValueType: reactProps.lookup.VitalValueType || [],
        ActiveStatus: reactProps.lookup.ActiveStatus || []
      }
    : standaloneLookups;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Lookups
  const fetchLookups = async () => {
    try {
      const data = await callBackendApi({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'VitalValueType' },
          { Key: 'ActiveStatus' }
        ],
        type: 'post'
      });
      if (data) {
        setStandaloneLookups({
          VitalValueType: data.VitalValueType || [],
          ActiveStatus: data.ActiveStatus || []
        });
      }
    } catch (e) {
      console.warn('Error loading lookups for Vitals:', e);
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
          { Key: 2, Value: filterValueType },
          { Key: 3, Value: filterStatus }
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page
        }
      };

      const res = await callBackendApi({
        action: 'clinicalmaster/VitalMaster/GetVitalMasters',
        data: inputData,
        type: 'post'
      });

      if (res) {
        setStandaloneItems(res.Data || []);
        setStandaloneTotal(res.PageContext?.TotalRecords || 0);
        setCurrentPage(page);
      } else {
        showToast('Failed to load vitals', 'error');
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

  const handleValueTypeChange = (newVal: string | number) => {
    const val = Number(newVal);
    setFilterValueType(val);
    if (isEmbedded && onAction) {
      onAction('valueTypeFilterChange', { value: val });
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
      VitalName: '',
      UOM: '',
      VitalValueTypeId: '',
      ValueFormat: '',
      ReferenceRangeFrom: '',
      ReferenceRangeTo: '',
      DisplayOrder: (items.length + 1) * 10,
      IsActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: VitalRow) => {
    setEditingItem(item);
    setFormErrors({});
    setModalFormData({
      Id: item.Id,
      VitalName: item.VitalName || '',
      UOM: item.UOM || '',
      VitalValueTypeId: item.VitalValueTypeId || '',
      ValueFormat: item.ValueFormat || '',
      ReferenceRangeFrom: item.ReferenceRangeFrom !== undefined ? String(item.ReferenceRangeFrom) : '',
      ReferenceRangeTo: item.ReferenceRangeTo !== undefined ? String(item.ReferenceRangeTo) : '',
      DisplayOrder: item.DisplayOrder || 1,
      IsActive: item.IsActive !== undefined ? item.IsActive : item.ActiveStatusId === 2
    });
    setIsModalOpen(true);

    try {
      const full = await callBackendApi({
        action: 'clinicalmaster/VitalMaster/GetVitalMasterById',
        data: { Id: item.Id },
        type: 'post'
      });
      if (full) {
        setModalFormData({
          Id: full.Id || item.Id,
          VitalName: full.VitalName || item.VitalName || '',
          UOM: full.UOM || item.UOM || '',
          VitalValueTypeId: full.VitalValueTypeId || item.VitalValueTypeId || '',
          ValueFormat: full.ValueFormat || '',
          ReferenceRangeFrom: full.ReferenceRangeFrom !== undefined ? String(full.ReferenceRangeFrom) : '',
          ReferenceRangeTo: full.ReferenceRangeTo !== undefined ? String(full.ReferenceRangeTo) : '',
          DisplayOrder: full.DisplayOrder || 1,
          IsActive: full.IsActive !== undefined ? full.IsActive : true
        });
      }
    } catch (e) {
      console.warn('Failed to load vital detail:', e);
    }
  };

  const [itemToDelete, setItemToDelete] = useState<VitalRow | null>(null);

  const handleDelete = (item: VitalRow) => {
    if (isEmbedded && onAction) {
      onAction('delete', item);
      return;
    }
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;
    setItemToDelete(null);

    try {
      await callBackendApi({
        action: 'clinicalmaster/VitalMaster/DeleteVitalMaster',
        data: { Id: item.Id },
        type: 'post'
      });
      showToast('Vital deleted successfully', 'success');
      fetchList(activePage);
    } catch (e) {
      showToast('Error deleting vital', 'error');
    }
  };

  const validateModalForm = () => {
    const errors: { [key: string]: string } = {};
    if (!modalFormData.VitalName.trim()) {
      errors.VitalName = 'Vital Name is required';
    }
    if (!modalFormData.UOM.trim()) {
      errors.UOM = 'UOM (Unit of Measure) is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveModal = async () => {
    if (!validateModalForm()) return;

    setIsSaving(true);
    const isEdit = modalFormData.Id > 0;
    const actionName = isEdit
      ? 'clinicalmaster/VitalMaster/UpdateVitalMaster'
      : 'clinicalmaster/VitalMaster/AddVitalMaster';

    const defaultTypeId = standaloneLookups.VitalValueType[0]?.Id || 1;
    const payload = {
      Data: {
        Id: modalFormData.Id,
        VitalName: modalFormData.VitalName.trim(),
        UOM: modalFormData.UOM.trim(),
        VitalValueTypeId: modalFormData.VitalValueTypeId ? Number(modalFormData.VitalValueTypeId) : defaultTypeId,
        ValueFormat: modalFormData.ValueFormat ? modalFormData.ValueFormat.trim() : '',
        ReferenceRangeFrom: modalFormData.ReferenceRangeFrom ? modalFormData.ReferenceRangeFrom.trim() : '',
        ReferenceRangeTo: modalFormData.ReferenceRangeTo ? modalFormData.ReferenceRangeTo.trim() : '',
        DisplayOrder: Number(modalFormData.DisplayOrder) || 1,
        IsActive: modalFormData.IsActive
      }
    };

    try {
      await callBackendApi({
        action: actionName,
        data: payload,
        type: 'post'
      });

      showToast(isEdit ? 'Vital updated successfully' : 'Vital added successfully', 'success');
      setIsModalOpen(false);
      if (isEmbedded && onAction) {
        onAction('refresh');
      } else {
        fetchList(isEdit ? activePage : 1);
      }
    } catch (e) {
      showToast('Error saving vital. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const valueTypeOptions = [
    { value: -1, label: 'All Value Types' },
    ...lookups.VitalValueType.map((v) => ({ value: v.Id, label: v.Text }))
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
        title="Vital Master"
        breadcrumb={[
          { label: 'Clinical Masters' },
          { label: 'Vitals' }
        ]}
        actions={
          <Button
            id="btnAddVitalMaster"
            variant="primary"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="fa fa-plus" aria-hidden="true" /> Add Vital
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
                Vital Name
              </label>
              <Input
                id="filterVitalName"
                placeholder="Search vital name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
              />
            </div>

            {/* Value Type Dropdown */}
            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                Value Type
              </label>
              <Select
                options={valueTypeOptions}
                value={filterValueType}
                onChange={handleValueTypeChange}
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
              <Button id="btnSearchVitalMaster" variant="secondary" onClick={handleSearchSubmit}>
                <i className="fas fa-search" style={{ marginRight: 6 }} /> Search
              </Button>
              <Button
                id="btnResetVitalMaster"
                variant="outline"
                onClick={() => {
                  setFilterName('');
                  setFilterValueType(-1);
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
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Vital Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>UOM</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Value Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Range</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: 8 }}>Loading vitals...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    No vitals found matching the selected criteria.
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
                      {row.VitalName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: colors.textMain }}>
                      {row.UOM || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.VitalValueType?.Description || row.VitalValueType?.Text || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                      {row.ReferenceRangeFrom !== undefined && row.ReferenceRangeTo !== undefined
                        ? `${row.ReferenceRangeFrom} - ${row.ReferenceRangeTo}`
                        : '—'}
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
                          title="Edit Vital"
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
                          title="Delete Vital"
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
                {modalFormData.Id > 0 ? 'Edit Vital' : 'Add New Vital'}
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
                {/* Vital Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Vital Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    id="inputModalVitalName"
                    placeholder="Enter vital name (e.g. Heart Rate)"
                    value={modalFormData.VitalName}
                    onChange={(e) => setModalFormData({ ...modalFormData, VitalName: e.target.value })}
                  />
                  {formErrors.VitalName && (
                    <div className="validation-error" style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.VitalName}</div>
                  )}
                </div>

                {/* UOM */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    UOM (Unit of Measure) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    id="inputModalVitalUOM"
                    placeholder="e.g. bpm, mmHg, °F"
                    value={modalFormData.UOM}
                    onChange={(e) => setModalFormData({ ...modalFormData, UOM: e.target.value })}
                  />
                  {formErrors.UOM && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.UOM}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Value Type */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Vital Value Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Select Value Type' },
                      ...lookups.VitalValueType.map((v) => ({ value: v.Id, label: v.Text }))
                    ]}
                    value={modalFormData.VitalValueTypeId}
                    onChange={(val) => setModalFormData({ ...modalFormData, VitalValueTypeId: val })}
                  />
                  {formErrors.VitalValueTypeId && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.VitalValueTypeId}</div>
                  )}
                </div>

                {/* Value Format */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Value Format <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. 0.00 or ##"
                    value={modalFormData.ValueFormat}
                    onChange={(e) => setModalFormData({ ...modalFormData, ValueFormat: e.target.value })}
                  />
                  {formErrors.ValueFormat && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.ValueFormat}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* Reference Range From */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Range From <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="Min value (e.g. 60)"
                    value={modalFormData.ReferenceRangeFrom}
                    onChange={(e) => setModalFormData({ ...modalFormData, ReferenceRangeFrom: e.target.value })}
                  />
                  {formErrors.ReferenceRangeFrom && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.ReferenceRangeFrom}</div>
                  )}
                </div>

                {/* Reference Range To */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Range To <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    placeholder="Max value (e.g. 100)"
                    value={modalFormData.ReferenceRangeTo}
                    onChange={(e) => setModalFormData({ ...modalFormData, ReferenceRangeTo: e.target.value })}
                  />
                  {formErrors.ReferenceRangeTo && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.ReferenceRangeTo}</div>
                  )}
                </div>

                {/* Display Order */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textMain }}>
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={String(modalFormData.DisplayOrder)}
                    onChange={(e) => setModalFormData({ ...modalFormData, DisplayOrder: Number(e.target.value) || 1 })}
                  />
                </div>
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
              <Button id="btnSaveVitalModal" variant="primary" onClick={handleSaveModal} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save & Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Vital"
          message={`Are you sure you want to delete ${itemToDelete.VitalName || 'this vital'}?`}
          yesLabel="Delete"
          noLabel="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
};
