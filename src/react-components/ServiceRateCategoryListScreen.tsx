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
    <div className="src-page-container">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE HEADER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="src-header-card">
        <div className="src-header-left">
          <div className="src-header-icon">
            <i className="fa fa-calculator fa-solid fa-calculator" />
          </div>
          <div>
            <div className="src-header-title-row">
              <h1 className="src-header-title">Service Rate Categories</h1>
              <span className="src-header-tag">Clinical Masters</span>
            </div>
            <p className="src-header-subtitle">
              Configure clinical rate categories, tariff associations, percentages and billing defaults
            </p>
          </div>
        </div>

        <div className="src-header-right">
          <div className="src-header-chip">
            <span className="src-header-chip-dot" />
            <span>Rate Category Registry</span>
          </div>
          <div className="src-header-actions">
            <button
              type="button"
              className="src-btn src-btn-primary"
              onClick={handleOpenAdd}
              id="btnAddServiceRateCategory"
            >
              <i className="fa fa-plus fa-solid fa-plus" />
              <span>Add Rate Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY CARDS (3 Cards)
      ───────────────────────────────────────────────────────────── */}
      <div className="src-stats-grid">
        <div className="src-stat-card">
          <div className="src-stat-icon blue">
            <i className="fa fa-th-list fa-solid fa-layer-group" />
          </div>
          <div className="src-stat-info">
            <span className="src-stat-label">Total Rate Categories</span>
            <span className="src-stat-value">{totalItems || items.length}</span>
          </div>
        </div>

        <div className="src-stat-card">
          <div className="src-stat-icon emerald">
            <i className="fa fa-check-circle fa-solid fa-circle-check" />
          </div>
          <div className="src-stat-info">
            <span className="src-stat-label">Active Categories</span>
            <span className="src-stat-value">
              {items.filter((i) => i.ActiveStatusId === 2 || i.ActiveStatus?.Id === 2 || i.IsActive === true).length}
            </span>
          </div>
        </div>

        <div className="src-stat-card">
          <div className="src-stat-icon indigo">
            <i className="fa fa-tag fa-solid fa-tag" />
          </div>
          <div className="src-stat-info">
            <span className="src-stat-label">Basic Categories</span>
            <span className="src-stat-value">
              {items.filter((i) => Boolean(i.IsBasic)).length}
            </span>
          </div>
        </div>
      </div>

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
            marginBottom: 14,
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

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & FILTER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="src-filter-card">
        <div className="src-filter-header">
          <h3 className="src-filter-header-title">
            <i className="fa fa-filter fa-solid fa-sliders" />
            <span>Search & Filter Rate Categories</span>
          </h3>
          <span className="src-filter-header-badge">Master Directory</span>
        </div>

        <form onSubmit={handleFilterSearch} className="src-filters-grid">
          {/* Facility Filter */}
          <div className="src-field-group">
            <label className="src-field-label">
              <i className="fa-solid fa-hospital" />
              <span>Facility</span>
            </label>
            <div className="src-input-wrapper">
              <select
                className="src-select-control"
                value={filterFacilityId}
                onChange={(e) => setFilterFacilityId(Number(e.target.value))}
                id="filterFacility"
              >
                <option value={-1}>All Facilities</option>
                {lookups.Facility?.map((f) => (
                  <option key={f.Id} value={f.Id}>
                    {f.Text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tariff Type Filter */}
          <div className="src-field-group">
            <label className="src-field-label">
              <i className="fa-solid fa-receipt" />
              <span>Tariff Type</span>
            </label>
            <div className="src-input-wrapper">
              <select
                className="src-select-control"
                value={filterTariffTypeId}
                onChange={(e) => setFilterTariffTypeId(Number(e.target.value))}
                id="filterTariffType"
              >
                <option value={-1}>All Tariff Types</option>
                {lookups.GuarantorType?.map((g) => (
                  <option key={g.Id} value={g.Id}>
                    {g.Text || g.Description || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="src-field-group">
            <label className="src-field-label">
              <i className="fa-solid fa-toggle-on" />
              <span>Status</span>
            </label>
            <div className="src-input-wrapper">
              <select
                className="src-select-control"
                value={filterStatusId}
                onChange={(e) => setFilterStatusId(Number(e.target.value))}
                id="filterStatus"
              >
                <option value={-1}>All Statuses</option>
                {lookups.ActiveStatus?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Text || s.Description || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name Search */}
          <div className="src-field-group">
            <label className="src-field-label">
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search Name</span>
            </label>
            <div className="src-input-wrapper">
              <input
                type="text"
                className="src-input-control"
                placeholder="Rate category name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                id="filterSearchName"
              />
              {filterName && (
                <button
                  type="button"
                  className="src-input-clear-btn"
                  onClick={() => setFilterName('')}
                  title="Clear search"
                >
                  <i className="fa fa-times fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="src-filter-actions">
            <button type="submit" className="src-btn src-btn-primary" id="btnFilterSearchRateCategory">
              <i className="fa fa-search fa-solid fa-magnifying-glass" />
              <span>Search</span>
            </button>
            <button
              type="button"
              className="src-btn src-btn-outline"
              onClick={handleResetFilters}
              id="btnFilterResetRateCategory"
            >
              <i className="fa fa-refresh fa-solid fa-rotate" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ENTERPRISE TABLE CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="src-table-card">
        <div className="src-table-header-bar">
          <h3 className="src-table-title">
            <i className="fa fa-list-alt fa-solid fa-table-list" />
            <span>Service Rate Categories Directory</span>
            <span className="src-table-count-pill">
              Showing {items.length} of {totalItems || items.length} {items.length === 1 ? 'Record' : 'Records'}
            </span>
          </h3>
          <button
            type="button"
            className="src-btn src-btn-outline"
            style={{ height: 32, padding: '0 12px', fontSize: 12 }}
            onClick={handleOpenAdd}
          >
            <i className="fa fa-plus fa-solid fa-plus" />
            <span>Add Rate Category</span>
          </button>
        </div>

        <div className="src-table-wrapper">
          <table className="src-table">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>#</th>
                <th style={{ width: '32%' }}>Service Rate Category</th>
                <th style={{ width: '14%', textAlign: 'center' }}>Is Basic</th>
                <th style={{ width: '22%' }}>Tariff Type</th>
                <th style={{ width: '16%' }}>Status</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: 8, display: 'block', color: '#0284c7' }} />
                    Loading service rate categories...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="src-empty-state">
                      <div className="src-empty-icon">
                        <i className="fa fa-folder-open-o fa-solid fa-folder-open" />
                      </div>
                      <h4 className="src-empty-title">No Service Rate Categories Found</h4>
                      <p className="src-empty-desc">
                        {filterName || filterFacilityId !== -1 || filterTariffTypeId !== -1 || filterStatusId !== -1
                          ? 'No rate categories match the active filter criteria. Try resetting filters.'
                          : 'No rate categories exist yet. Click "Add Rate Category" to create one.'}
                      </p>
                      <button
                        type="button"
                        className="src-btn src-btn-primary"
                        onClick={handleOpenAdd}
                      >
                        <i className="fa fa-plus fa-solid fa-plus" />
                        <span>Add First Rate Category</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActive = item.ActiveStatusId === 2 || item.ActiveStatus?.Id === 2 || item.IsActive === true;

                  return (
                    <tr key={item.Id || index}>
                      <td className="src-cell-idx">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="src-category-name">
                        {item.ServiceRateCategory}
                      </td>
                      <td className="text-center">
                        {item.IsBasic ? (
                          <span className="src-badge src-badge-yes">Yes</span>
                        ) : (
                          <span className="src-badge src-badge-no">No</span>
                        )}
                      </td>
                      <td style={{ color: '#475569' }}>
                        {item.GuarantorType?.Description || item.GuarantorType?.Text || '—'}
                      </td>
                      <td>
                        <span className={`src-badge ${isActive ? 'src-badge-active' : 'src-badge-inactive'}`}>
                          <span className={isActive ? 'src-badge-active-dot' : 'src-badge-inactive-dot'} />
                          {item.ActiveStatus?.Description || item.ActiveStatus?.Text || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="src-action-btn src-action-edit"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Rate Category"
                          >
                            <i className="fa fa-pencil fa-solid fa-pen-to-square" />
                          </button>
                          <button
                            type="button"
                            className="src-action-btn src-action-del"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete Rate Category"
                          >
                            <i className="fa fa-trash-o fa-solid fa-trash-can" />
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
        <div className="src-pagination-bar">
          <div className="src-pagination-info">
            Showing <strong>{items.length}</strong> of <strong>{totalItems}</strong> records
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

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
