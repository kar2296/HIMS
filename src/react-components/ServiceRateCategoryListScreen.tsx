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
import { sessionHelper } from '../services/sessionHelper';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
}

export interface ServiceRateCategoryRow {
  Id: number;
  ServiceRateCategory: string;
  Description?: string;
  Percentage?: number | string;
  IsBasic?: boolean;
  IsDefault?: boolean;
  IsActive?: boolean;
  IsAllFacility?: boolean;
  FacilityId?: number;
  ActiveStatusId?: number;
  EncounterTypeId?: number;
  PrimaryCategoryId?: number;
  TariffTypeId?: number;
  Facility?: { Id?: number; FacilityName?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
  GuarantorType?: { Id?: number; Description?: string; Text?: string };
  EncounterType?: { Id?: number; Description?: string; Text?: string };
  PrimaryCategory?: { Id?: number; Description?: string; Text?: string };
}

export interface ServiceRateCategoryListScreenProps {
  reactProps?: {
    items?: ServiceRateCategoryRow[];
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
      FacilityId?: number | number[];
      SourceTypeId?: number;
      Name?: string;
      ActiveStatusId?: number;
      TariffTypeId?: number;
    };
    lookup?: {
      Facility?: LookupOption[];
      SourceType?: LookupOption[];
      ActiveStatus?: LookupOption[];
      GuarantorType?: LookupOption[];
      EncounterType?: LookupOption[];
      PrimaryCategory?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ServiceRateCategoryListScreen: React.FC<ServiceRateCategoryListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<ServiceRateCategoryRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Facility: LookupOption[];
    SourceType: LookupOption[];
    ActiveStatus: LookupOption[];
    GuarantorType: LookupOption[];
    EncounterType: LookupOption[];
    PrimaryCategory: LookupOption[];
  }>({
    Facility: [],
    SourceType: [],
    ActiveStatus: [],
    GuarantorType: [],
    EncounterType: [],
    PrimaryCategory: [],
  });

  // Filters
  const currentFacilityId = sessionHelper.getCurrentFacilityId();
  const [filterFacilityId, setFilterFacilityId] = useState<number>(-1);
  const [filterTariffTypeId, setFilterTariffTypeId] = useState<number>(-1);
  const [filterStatusId, setFilterStatusId] = useState<number>(2);
  const [filterName, setFilterName] = useState<string>('');

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ServiceRateCategoryRow | null>(null);
  const [modalForm, setModalForm] = useState<{
    Id: number;
    ServiceRateCategory: string;
    Description: string;
    EncounterTypeId: number;
    PrimaryCategoryId: number;
    TariffTypeId: number;
    Percentage: string;
    IsBasic: boolean;
    IsDefault: boolean;
    IsActive: boolean;
    IsAllFacility: boolean;
  }>({
    Id: 0,
    ServiceRateCategory: '',
    Description: '',
    EncounterTypeId: -1,
    PrimaryCategoryId: -1,
    TariffTypeId: -1,
    Percentage: '',
    IsBasic: false,
    IsDefault: false,
    IsActive: true,
    IsAllFacility: false,
  });

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<ServiceRateCategoryRow | null>(null);

  // Determine active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? items.length)
    : standaloneTotal;

  // Lookups source
  const lookups = {
    Facility: reactProps?.lookup?.Facility || standaloneLookups.Facility,
    ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
    GuarantorType: reactProps?.lookup?.GuarantorType || standaloneLookups.GuarantorType,
    EncounterType: reactProps?.lookup?.EncounterType || standaloneLookups.EncounterType,
    PrimaryCategory: reactProps?.lookup?.PrimaryCategory || standaloneLookups.PrimaryCategory,
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load all lookups in standalone mode
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [
            { Key: 'Facility', Request: { Params: [{ Key: 4, Value: true }] } },
            { Key: 'SourceType' },
            { Key: 'ActiveStatus' },
            { Key: 'GuarantorType' },
            { Key: 'EncounterType' },
            { Key: 'PrimaryCategory' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                Facility: res.Facility || [],
                SourceType: res.SourceType || [],
                ActiveStatus: res.ActiveStatus || [],
                GuarantorType: res.GuarantorType || [],
                EncounterType: res.EncounterType || [],
                PrimaryCategory: res.PrimaryCategory || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching lookups for ServiceRateCategory:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch list in standalone mode
  const fetchList = useCallback(
    async (
      facilityId = filterFacilityId,
      statusId = filterStatusId,
      tariffId = filterTariffTypeId,
      name = filterName,
      page = currentPage
    ) => {
      setIsLoading(true);
      try {
        const { callBackendApi } = await import('../services/apiService');
        const facParam = facilityId === -1 ? [-1, currentFacilityId] : facilityId;
        const res: any = await callBackendApi({
          action: 'clinicalmaster/ServiceRateCategory/GetServiceRateCategorys',
          data: {
            Params: [
              { Key: 1, Value: name.trim() },
              { Key: 2, Value: facParam },
              { Key: 3, Value: -1 }, // SourceTypeId
              { Key: 4, Value: statusId },
              { Key: 6, Value: tariffId === -1 ? undefined : tariffId },
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
        console.error('Error loading service rate categories:', err);
        setToastMessage({ text: 'Failed to load service rate categories.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [filterFacilityId, filterStatusId, filterTariffTypeId, filterName, currentPage, pageSize, currentFacilityId]
  );

  useEffect(() => {
    if (!isHybrid) {
      fetchList();
    }
  }, [isHybrid, fetchList]);

  // Handle search / filter submit
  const handleFilterSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    if (isHybrid && onAction) {
      onAction('search', {
        FacilityId: filterFacilityId,
        ActiveStatusId: filterStatusId,
        TariffTypeId: filterTariffTypeId,
        Name: filterName,
      });
      return;
    }
    fetchList(filterFacilityId, filterStatusId, filterTariffTypeId, filterName, 1);
  };

  const handleResetFilters = () => {
    setFilterFacilityId(-1);
    setFilterTariffTypeId(-1);
    setFilterStatusId(2);
    setFilterName('');
    setCurrentPage(1);
    if (isHybrid && onAction) {
      onAction('resetFilters');
      return;
    }
    fetchList(-1, 2, -1, '', 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (isHybrid && onAction) {
      onAction('pageChange', { page });
      return;
    }
    fetchList(filterFacilityId, filterStatusId, filterTariffTypeId, filterName, page);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalForm({
      Id: 0,
      ServiceRateCategory: '',
      Description: '',
      EncounterTypeId: -1,
      PrimaryCategoryId: -1,
      TariffTypeId: -1,
      Percentage: '',
      IsBasic: false,
      IsDefault: false,
      IsActive: true,
      IsAllFacility: false,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (item: ServiceRateCategoryRow) => {
    setEditingItem(item);
    setIsModalOpen(true);
    // Fetch full details if needed or populate from item
    try {
      const { callBackendApi } = await import('../services/apiService');
      const res: any = await callBackendApi({
        action: 'clinicalmaster/ServiceRateCategory/GetServiceRateCategoryById',
        data: { Id: item.Id },
        type: 'post',
      });
      const data = res || item;
      setModalForm({
        Id: data.Id || item.Id,
        ServiceRateCategory: data.ServiceRateCategory || '',
        Description: data.Description || '',
        EncounterTypeId: data.EncounterTypeId || -1,
        PrimaryCategoryId: data.PrimaryCategoryId || -1,
        TariffTypeId: data.TariffTypeId || -1,
        Percentage: data.Percentage ? String(data.Percentage) : '',
        IsBasic: Boolean(data.IsBasic),
        IsDefault: Boolean(data.IsDefault),
        IsActive: Boolean(data.IsActive ?? (data.ActiveStatusId === 2 || data.ActiveStatusId === 1)),
        IsAllFacility: Boolean(data.IsAllFacility),
      });
    } catch {
      // Fallback to table item
      setModalForm({
        Id: item.Id,
        ServiceRateCategory: item.ServiceRateCategory || '',
        Description: item.Description || '',
        EncounterTypeId: item.EncounterTypeId || -1,
        PrimaryCategoryId: item.PrimaryCategoryId || -1,
        TariffTypeId: item.TariffTypeId || -1,
        Percentage: item.Percentage ? String(item.Percentage) : '',
        IsBasic: Boolean(item.IsBasic),
        IsDefault: Boolean(item.IsDefault),
        IsActive: Boolean(item.IsActive ?? item.ActiveStatusId === 2),
        IsAllFacility: Boolean(item.IsAllFacility),
      });
    }
  };

  // Save Modal Form
  const handleSaveModal = async () => {
    if (!modalForm.ServiceRateCategory.trim()) {
      setToastMessage({ text: 'Service Rate Category name is required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        Id: modalForm.Id,
        ServiceRateCategory: modalForm.ServiceRateCategory.trim(),
        Description: modalForm.Description?.trim() || '',
        EncounterTypeId: modalForm.EncounterTypeId === -1 ? null : modalForm.EncounterTypeId,
        PrimaryCategoryId: modalForm.PrimaryCategoryId === -1 ? null : modalForm.PrimaryCategoryId,
        TariffTypeId: modalForm.TariffTypeId === -1 ? null : modalForm.TariffTypeId,
        Percentage: modalForm.Percentage ? Number(modalForm.Percentage) : 0,
        IsBasic: modalForm.IsBasic,
        IsDefault: modalForm.IsDefault,
        IsActive: modalForm.IsActive,
        IsAllFacility: modalForm.IsAllFacility,
        FacilityId: modalForm.IsAllFacility ? -1 : (currentFacilityId > 0 ? currentFacilityId : 1),
        ActiveStatusId: modalForm.IsActive ? 2 : 3,
      };

      const isEdit = payload.Id && payload.Id > 0;
      const actionName = isEdit
        ? 'clinicalmaster/ServiceRateCategory/UpdateServiceRateCategory'
        : 'clinicalmaster/ServiceRateCategory/AddServiceRateCategory';

      await callBackendApi({
        action: actionName,
        data: { Data: payload },
        type: 'post',
      });

      setToastMessage({
        text: `Service rate category ${isEdit ? 'updated' : 'created'} successfully.`,
        type: 'success',
      });
      setIsModalOpen(false);
      fetchList();
    } catch (err: any) {
      console.error('Error saving service rate category:', err);
      setToastMessage({ text: 'Failed to save service rate category.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Click
  const handleDeleteClick = (item: ServiceRateCategoryRow) => {
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
        action: 'clinicalmaster/ServiceRateCategory/DeleteServiceRateCategory',
        data: { Id: item.Id },
        type: 'post',
      });
      setToastMessage({ text: 'Service rate category deleted successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error deleting service rate category:', err);
      setToastMessage({ text: 'Failed to delete service rate category.', type: 'error' });
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
        title="Service Rate Categories"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Service Rate Categories' },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
            id="btnAddServiceRateCategory"
          >
            <i className="fa fa-plus" />
            <span>Add Rate Category</span>
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
            {/* Facility Filter */}
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
                Facility
              </label>
              <Select
                value={filterFacilityId}
                onChange={(val) => setFilterFacilityId(Number(val))}
                options={[
                  { value: -1, label: 'All Facilities' },
                  ...(lookups.Facility?.map((f) => ({ value: f.Id, label: f.Text })) || []),
                ]}
                id="filterFacility"
              />
            </div>

            {/* Tariff Type Filter */}
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
                Tariff Type
              </label>
              <Select
                value={filterTariffTypeId}
                onChange={(val) => setFilterTariffTypeId(Number(val))}
                options={[
                  { value: -1, label: 'All Tariff Types' },
                  ...(lookups.GuarantorType?.map((g) => ({ value: g.Id, label: g.Text || g.Description || '' })) || []),
                ]}
                id="filterTariffType"
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
                id="filterStatus"
              />
            </div>

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
                  placeholder="Rate category name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                  id="filterSearchName"
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button type="submit" variant="primary" id="btnFilterSearchRateCategory">
                <i className="fa fa-search" style={{ marginRight: spacing.xs }} />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} id="btnFilterResetRateCategory">
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
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '30%' }}>Service Rate Category</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '15%', textAlign: 'center' }}>Is Basic</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '20%' }}>Tariff Type</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '15%' }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '20%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, display: 'block' }} />
                    Loading service rate categories...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No service rate categories found. Click &quot;Add Rate Category&quot; to create one.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActive = item.ActiveStatusId === 2 || item.ActiveStatus?.Id === 2 || item.IsActive === true;
                  const canDelete = item.ActiveStatusId === 3 || item.ActiveStatusId === 1 || !isActive;

                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500 }}>
                        {item.ServiceRateCategory}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                        {item.IsBasic ? (
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

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.GuarantorType?.Description || item.GuarantorType?.Text || '-'}
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
                            title="Edit Rate Category"
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
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Rate Category"
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
                          )}
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
        title={editingItem ? 'Edit Service Rate Category' : 'Add Service Rate Category'}
        onClose={() => setIsModalOpen(false)}
        width="650px"
        portal={true}
        footer={
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal} disabled={isSaving} id="btnSaveRateCategoryModal">
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
          {/* Service Rate Category Name */}
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
              Service Rate Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="text"
              placeholder="Rate Category Name"
              value={modalForm.ServiceRateCategory}
              onChange={(e) => setModalForm({ ...modalForm, ServiceRateCategory: e.target.value })}
              id="inputModalRateCategory"
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
              id="inputModalDescription"
            />
          </div>

          {/* Grid row: Encounter Type & Primary Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
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
                Encounter Type
              </label>
              <Select
                value={modalForm.EncounterTypeId}
                onChange={(val) => setModalForm({ ...modalForm, EncounterTypeId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Encounter Type' },
                  ...(lookups.EncounterType?.map((e) => ({ value: e.Id, label: e.Text || e.Description || '' })) || []),
                ]}
                id="selectModalEncounterType"
              />
            </div>

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
                Primary Category
              </label>
              <Select
                value={modalForm.PrimaryCategoryId}
                onChange={(val) => setModalForm({ ...modalForm, PrimaryCategoryId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Primary Category' },
                  ...(lookups.PrimaryCategory?.map((p) => ({ value: p.Id, label: p.Text || p.Description || '' })) || []),
                ]}
                id="selectModalPrimaryCategory"
              />
            </div>
          </div>

          {/* Grid row: Tariff Type & Percentage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
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
                Tariff Type
              </label>
              <Select
                value={modalForm.TariffTypeId}
                onChange={(val) => setModalForm({ ...modalForm, TariffTypeId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Tariff Type' },
                  ...(lookups.GuarantorType?.map((g) => ({ value: g.Id, label: g.Text || g.Description || '' })) || []),
                ]}
                id="selectModalTariffType"
              />
            </div>

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
                Percentage (%)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={modalForm.Percentage}
                onChange={(e) => setModalForm({ ...modalForm, Percentage: e.target.value })}
                id="inputModalPercentage"
              />
            </div>
          </div>

          {/* Checkboxes 2x2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.sm,
              backgroundColor: '#f8fafc',
              padding: spacing.md,
              borderRadius: radii.md,
              border: `1px solid ${colors.border || '#e2e8f0'}`,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsBasic}
                onChange={(e) => setModalForm({ ...modalForm, IsBasic: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalIsBasic"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Is Basic</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsDefault}
                onChange={(e) => setModalForm({ ...modalForm, IsDefault: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalIsDefault"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Is Default</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsActive}
                onChange={(e) => setModalForm({ ...modalForm, IsActive: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalIsActive"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Is Active</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={modalForm.IsAllFacility}
                onChange={(e) => setModalForm({ ...modalForm, IsAllFacility: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                id="chkModalIsAllFacility"
              />
              <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Is All Facility</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Service Rate Category"
          message={`Are you sure you want to delete "${itemToDelete.ServiceRateCategory}"?`}
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
