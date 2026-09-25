import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from './ConfirmModal';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
}

export interface CategoryTypeRow {
  Id: number;
  Name: string;
  Description?: string;
  CategoryTypeRefId?: number;
  IsAssociatedWithCC?: boolean;
  IsActive?: boolean;
  ActiveStatusId?: number;
  SpecialInstruction?: string;
  CategoryTypeRef?: { Id?: number; Description?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
}

export interface CategoryTypeListScreenProps {
  reactProps?: {
    items?: CategoryTypeRow[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    pagerObj?: {
      totalItems?: number;
      currentPage?: number;
      pageSize?: number;
      startIndex?: number;
    };
    currentfilter?: {
      Name?: string;
      CategoryTypeRefId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      CategoryTypeRef?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const CategoryTypeListScreen: React.FC<CategoryTypeListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<CategoryTypeRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    CategoryTypeRef: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    CategoryTypeRef: [],
    ActiveStatus: [],
  });

  // Filters
  const [filterName, setFilterName] = useState<string>('');
  const [filterTypeRefId, setFilterTypeRefId] = useState<number>(-1);
  const [filterStatusId, setFilterStatusId] = useState<number>(2);

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CategoryTypeRow | null>(null);
  const [modalForm, setModalForm] = useState<{
    Id: number;
    Name: string;
    Description: string;
    CategoryTypeRefId: number;
    IsAssociatedWithCC: boolean;
    IsActive: boolean;
    SpecialInstruction: string;
  }>({
    Id: 0,
    Name: '',
    Description: '',
    CategoryTypeRefId: -1,
    IsAssociatedWithCC: false,
    IsActive: true,
    SpecialInstruction: '',
  });

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<CategoryTypeRow | null>(null);

  // Active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? items.length)
    : standaloneTotal;

  // Lookups source
  const lookups = {
    CategoryTypeRef: reactProps?.lookup?.CategoryTypeRef || standaloneLookups.CategoryTypeRef,
    ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load lookups in standalone mode
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [
            { Key: 'CategoryTypeRef' },
            { Key: 'ActiveStatus' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                CategoryTypeRef: res.CategoryTypeRef || [],
                ActiveStatus: res.ActiveStatus || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching lookups for CategoryType:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch list in standalone mode
  const fetchList = useCallback(
    async (
      name = filterName,
      typeRefId = filterTypeRefId,
      statusId = filterStatusId,
      page = currentPage
    ) => {
      setIsLoading(true);
      try {
        const { callBackendApi } = await import('../services/apiService');
        const res: any = await callBackendApi({
          action: 'clinicalmaster/CategoryTypeMaster/GetCategoryTypeMasters',
          data: {
            Params: [
              { Key: 1, Value: name.trim() },
              { Key: 2, Value: typeRefId },
              { Key: 3, Value: statusId },
            ],
            PageContext: {
              PageSize: pageSize,
              PageNumber: page,
            },
          },
          type: 'post',
        });

        if (res?.Data) {
          setStandaloneItems(res.Data);
          setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        }
      } catch (err: any) {
        console.error('Error loading category types:', err);
        setToastMessage({ text: 'Failed to load category types.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [filterName, filterTypeRefId, filterStatusId, currentPage, pageSize]
  );

  useEffect(() => {
    if (!isHybrid) {
      fetchList();
    }
  }, [isHybrid, fetchList]);

  // Filter handlers
  const handleFilterSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    if (isHybrid && onAction) {
      onAction('search', {
        Name: filterName,
        CategoryTypeRefId: filterTypeRefId,
        ActiveStatusId: filterStatusId,
      });
      return;
    }
    fetchList(filterName, filterTypeRefId, filterStatusId, 1);
  };

  const handleResetFilters = () => {
    setFilterName('');
    setFilterTypeRefId(-1);
    setFilterStatusId(2);
    setCurrentPage(1);
    if (isHybrid && onAction) {
      onAction('resetFilters');
      return;
    }
    fetchList('', -1, 2, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (isHybrid && onAction) {
      onAction('pageChange', { page });
      return;
    }
    fetchList(filterName, filterTypeRefId, filterStatusId, page);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalForm({
      Id: 0,
      Name: '',
      Description: '',
      CategoryTypeRefId: -1,
      IsAssociatedWithCC: false,
      IsActive: true,
      SpecialInstruction: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (item: CategoryTypeRow) => {
    setEditingItem(item);
    setIsModalOpen(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const res: any = await callBackendApi({
        action: 'clinicalmaster/CategoryTypeMaster/GetCategoryTypeMasterById',
        data: { Id: item.Id },
        type: 'post',
      });
      const data = res || item;
      setModalForm({
        Id: data.Id || item.Id,
        Name: data.Name || '',
        Description: data.Description || '',
        CategoryTypeRefId: data.CategoryTypeRefId || -1,
        IsAssociatedWithCC: Boolean(data.IsAssociatedWithCC),
        IsActive: Boolean(data.IsActive ?? data.ActiveStatusId === 2),
        SpecialInstruction: data.SpecialInstruction || '',
      });
    } catch {
      setModalForm({
        Id: item.Id,
        Name: item.Name || '',
        Description: item.Description || '',
        CategoryTypeRefId: item.CategoryTypeRefId || -1,
        IsAssociatedWithCC: Boolean(item.IsAssociatedWithCC),
        IsActive: Boolean(item.IsActive ?? item.ActiveStatusId === 2),
        SpecialInstruction: item.SpecialInstruction || '',
      });
    }
  };

  // Save Modal Form
  const handleSaveModal = async () => {
    if (!modalForm.Name.trim()) {
      setToastMessage({ text: 'Category type name is required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        Id: modalForm.Id,
        Name: modalForm.Name.trim(),
        Description: modalForm.Description?.trim() || '',
        CategoryTypeRefId: modalForm.CategoryTypeRefId === -1 ? null : modalForm.CategoryTypeRefId,
        IsAssociatedWithCC: modalForm.IsAssociatedWithCC,
        IsActive: modalForm.IsActive,
        ActiveStatusId: modalForm.IsActive ? 2 : 3,
        SpecialInstruction: modalForm.SpecialInstruction?.trim() || '',
      };

      const isEdit = payload.Id && payload.Id > 0;
      const actionName = isEdit
        ? 'clinicalmaster/CategoryTypeMaster/UpdateCategoryTypeMaster'
        : 'clinicalmaster/CategoryTypeMaster/AddCategoryTypeMaster';

      await callBackendApi({
        action: actionName,
        data: { Data: payload },
        type: 'post',
      });

      setToastMessage({
        text: `Category type ${isEdit ? 'updated' : 'created'} successfully.`,
        type: 'success',
      });
      setIsModalOpen(false);
      fetchList();
    } catch (err: any) {
      console.error('Error saving category type:', err);
      setToastMessage({ text: 'Failed to save category type.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Click
  const handleDeleteClick = (item: CategoryTypeRow) => {
    setItemToDelete(item);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', item);
      return;
    }

    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'clinicalmaster/CategoryTypeMaster/DeleteCategoryTypeMaster',
        data: { Id: item.Id },
        type: 'post',
      });
      setToastMessage({ text: 'Category type deleted successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error deleting category type:', err);
      setToastMessage({ text: 'Failed to delete category type.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: spacing.lg,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
      }}
    >
      {/* Header */}
      <PageHeader
        title="Category Types"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Category Types' },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
            id="btnAddCategoryType"
          >
            <i className="fa fa-plus" />
            <span>Add Category Type</span>
          </Button>
        }
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: radii.md,
            backgroundColor: toastMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${toastMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: typography.body.fontSize,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <i className={`fa ${toastMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}
          >
            <i className="fa fa-times" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <Card style={{ padding: spacing.md }}>
        <FilterBar>
          <form
            onSubmit={handleFilterSearch}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.md,
              alignItems: 'flex-end',
              width: '100%',
            }}
          >
            {/* Name Search */}
            <div style={{ minWidth: 220, flex: '2 1 220px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Search Name
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Category type name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                  id="filterCategoryTypeName"
                />
                {filterName && (
                  <button
                    type="button"
                    onClick={() => setFilterName('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fa fa-times" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Type Ref Filter */}
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Type
              </label>
              <Select
                value={filterTypeRefId}
                onChange={(val) => setFilterTypeRefId(Number(val))}
                options={[
                  { value: -1, label: 'All Types' },
                  ...(lookups.CategoryTypeRef?.map((r) => ({ value: r.Id, label: r.Text || r.Description || '' })) || []),
                ]}
                id="filterCategoryTypeRef"
              />
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: 160, flex: '1 1 160px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Status
              </label>
              <Select
                value={filterStatusId}
                onChange={(val) => setFilterStatusId(Number(val))}
                options={[
                  { value: -1, label: 'All Statuses' },
                  ...(lookups.ActiveStatus?.map((s) => ({ value: s.Id, label: s.Text || s.Description || '' })) || []),
                ]}
                id="filterCategoryTypeStatus"
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button type="submit" variant="primary" id="btnFilterSearchCatType">
                <i className="fa fa-search" style={{ marginRight: spacing.xs }} />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} id="btnFilterResetCatType">
                <i className="fa fa-refresh" style={{ marginRight: spacing.xs }} />
                Reset
              </Button>
            </div>
          </form>
        </FilterBar>
      </Card>

      {/* Grid Table Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              color: colors.textMain,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f1f5f9',
                  borderBottom: `2px solid ${colors.border || '#e2e8f0'}`,
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '25%' }}>Name</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '30%' }}>Description</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '20%' }}>Type</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '12%', textAlign: 'center' }}>
                  Associated with CC
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '8%' }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '5%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, display: 'block' }} />
                    Loading category types...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No category types found. Click &quot;Add Category Type&quot; to create one.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActive = item.ActiveStatusId === 2 || item.ActiveStatus?.Id === 2 || item.IsActive === true;

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>
                        {item.Name}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.Description || '-'}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.CategoryTypeRef?.Description || item.CategoryTypeRef?.Text || '-'}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                        {item.IsAssociatedWithCC ? (
                          <span
                            style={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 8px',
                              borderRadius: radii.full,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Yes
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                              padding: '2px 8px',
                              borderRadius: radii.full,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            No
                          </span>
                        )}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                        <span
                          style={{
                            backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#065f46' : '#991b1b',
                            padding: '3px 8px',
                            borderRadius: radii.full,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#10b981' : '#ef4444',
                            }}
                          />
                          {item.ActiveStatus?.Description || item.ActiveStatus?.Text || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: spacing.xs }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Category Type"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '6px 8px',
                              borderRadius: radii.sm,
                              color: colors.primary,
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <i className="fa fa-edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete Category Type"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '6px 8px',
                              borderRadius: radii.sm,
                              color: '#ef4444',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <i className="fa fa-trash-alt" />
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
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>
            Showing {items.length} of {totalItems} records
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Edit Category Type' : 'Add Category Type'}
        onClose={() => setIsModalOpen(false)}
        width="600px"
        portal={true}
        footer={
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal} disabled={isSaving} id="btnSaveCatTypeModal">
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin" style={{ marginRight: spacing.xs }} />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-save" style={{ marginRight: spacing.xs }} />
                  Save &amp; Approve
                </>
              )}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {/* Name */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
              }}
            >
              Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="text"
              placeholder="Category Type Name"
              value={modalForm.Name}
              disabled={Boolean(editingItem && editingItem.Id > 0)}
              onChange={(e) => setModalForm({ ...modalForm, Name: e.target.value })}
              id="inputModalCatTypeName"
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
              }}
            >
              Description
            </label>
            <Input
              type="text"
              placeholder="Description"
              value={modalForm.Description}
              onChange={(e) => setModalForm({ ...modalForm, Description: e.target.value })}
              id="inputModalCatTypeDesc"
            />
          </div>

          {/* Type Ref */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
              }}
            >
              Category Type Reference
            </label>
            <Select
              value={modalForm.CategoryTypeRefId}
              onChange={(val) => setModalForm({ ...modalForm, CategoryTypeRefId: Number(val) })}
              options={[
                { value: -1, label: 'Select Type Reference' },
                ...(lookups.CategoryTypeRef?.map((r) => ({ value: r.Id, label: r.Text || r.Description || '' })) || []),
              ]}
              id="selectModalCatTypeRef"
            />
          </div>

          {/* Checkboxes */}
          <div
            style={{
              display: 'flex',
              gap: spacing.xl,
              backgroundColor: '#f8fafc',
              padding: spacing.md,
              borderRadius: radii.md,
              border: `1px solid ${colors.border || '#e2e8f0'}`,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsAssociatedWithCC}
                onChange={(e) => setModalForm({ ...modalForm, IsAssociatedWithCC: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalCatTypeAssociatedCC"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Associated with CC</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsActive}
                onChange={(e) => setModalForm({ ...modalForm, IsActive: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalCatTypeIsActive"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Active</span>
            </label>
          </div>

          {/* Comments / Special Instructions */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
              }}
            >
              Comments
            </label>
            <textarea
              value={modalForm.SpecialInstruction}
              onChange={(e) => setModalForm({ ...modalForm, SpecialInstruction: e.target.value })}
              placeholder="Additional comments or instructions..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                fontSize: '0.875rem',
                fontFamily: typography.fontFamily,
                resize: 'vertical',
              }}
              id="txtModalCatTypeComments"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Category Type"
          message={`Are you sure you want to delete category type "${itemToDelete.Name}"?`}
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
