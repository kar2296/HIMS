import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { ConfirmModal } from './ConfirmModal';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';

export interface ServiceCategoryItem {
  Id: number;
  FacilityId?: number;
  ParentServiceCategoryId?: number;
  ServiceCategoryCode: string;
  ServiceCategoryName: string;
  DisplayOrder?: number | string;
  PrintOrder?: number | string;
  StatusId?: boolean;
  IsAllFacility?: boolean;
  IsDoctorShare?: boolean;
  Status?: number; // 1 = active, 2 = deleted
  _isNew?: boolean;
}

export interface LookupOption {
  Id: number;
  Text: string;
}

export interface ServiceCategoryListScreenProps {
  reactProps?: {
    items?: ServiceCategoryItem[];
    currentfilter?: {
      Name?: string;
      FacilityId?: number | number[];
      SourceTypeId?: number;
      ServiceGroupId?: number;
      StatusId?: any;
    };
    lookup?: {
      Facility?: LookupOption[];
      SourceType?: LookupOption[];
      OrderMasterStatus?: LookupOption[];
      ServiceGroup?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ServiceCategoryListScreen: React.FC<ServiceCategoryListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<ServiceCategoryItem[]>([]);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Facility: LookupOption[];
    SourceType: LookupOption[];
    OrderMasterStatus: LookupOption[];
    ServiceGroup: LookupOption[];
  }>({
    Facility: [],
    SourceType: [],
    OrderMasterStatus: [],
    ServiceGroup: [],
  });

  // Filters
  const currentFacilityId = sessionHelper.getCurrentFacilityId();
  const [filterFacilityId, setFilterFacilityId] = useState<number>(-1);
  const [filterName, setFilterName] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ item: ServiceCategoryItem; index: number } | null>(null);

  // Determine active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const lookupFacility = reactProps?.lookup?.Facility || standaloneLookups.Facility;

  // Auto-hide toast after 4s
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
            {
              Key: 'Facility',
              Request: {
                Params: [{ Key: 4, Value: true }],
              },
            },
            { Key: 'SourceType' },
            { Key: 'OrderMasterStatus' },
            { Key: 'ServiceGroup' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                Facility: res.Facility || [],
                SourceType: res.SourceType || [],
                OrderMasterStatus: res.OrderMasterStatus || [],
                ServiceGroup: res.ServiceGroup || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching lookups for ServiceCategory:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // Create an empty line item
  const createEmptyLineItem = useCallback((): ServiceCategoryItem => {
    return {
      Id: 0,
      FacilityId: currentFacilityId > 0 ? currentFacilityId : 1,
      ParentServiceCategoryId: -1,
      ServiceCategoryCode: '',
      ServiceCategoryName: '',
      DisplayOrder: '',
      PrintOrder: '',
      StatusId: true,
      IsAllFacility: false,
      IsDoctorShare: false,
      Status: 1,
      _isNew: true,
    };
  }, [currentFacilityId]);

  // Fetch list in standalone mode
  const fetchList = useCallback(
    async (facilityId = filterFacilityId, name = filterName) => {
      setIsLoading(true);
      try {
        const { callBackendApi } = await import('../services/apiService');
        const facParam = facilityId === -1 ? [-1, currentFacilityId] : facilityId;
        const res: any = await callBackendApi({
          action: 'clinicalmaster/servicecategory/GetServiceCategorys',
          data: {
            Params: [
              { Key: 1, Value: name.trim() },
              { Key: 2, Value: facParam },
              { Key: 3, Value: 1 }, // SourceTypeId
              { Key: 4, Value: -1 }, // ServiceGroupId
              { Key: 5, Value: undefined }, // StatusId
            ],
            PageContext: {
              PageSize: 400,
              PageNumber: 1,
            },
          },
          type: 'post',
        });

        const list: ServiceCategoryItem[] = (res?.Data || []).map((row: any) => ({
          ...row,
          Status: row.Status ?? 1,
          StatusId: Boolean(row.StatusId ?? true),
          IsAllFacility: Boolean(row.IsAllFacility ?? false),
          IsDoctorShare: Boolean(row.IsDoctorShare ?? false),
        }));

        // Append one empty line item at the bottom (matching AngularJS behavior)
        list.push(createEmptyLineItem());
        setStandaloneItems(list);
      } catch (err: any) {
        console.error('Error loading service categories:', err);
        setToastMessage({ text: 'Failed to load service categories.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [filterFacilityId, filterName, currentFacilityId, createEmptyLineItem]
  );

  // Initial load for standalone mode
  useEffect(() => {
    if (!isHybrid) {
      fetchList();
    }
  }, [isHybrid, fetchList]);

  // Handle cell edit
  const handleCellChange = (
    index: number,
    field: keyof ServiceCategoryItem,
    value: any
  ) => {
    if (isHybrid && onAction) {
      onAction('cellChange', { index, field, value });
    }

    setStandaloneItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Add new row button
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
      return;
    }
    setStandaloneItems((prev) => [...prev, createEmptyLineItem()]);
  };

  // Trigger Delete item
  const handleDeleteClick = (item: ServiceCategoryItem, index: number) => {
    // If it's an unpersisted empty/new line, just remove it from local state
    if (!item.Id || item.Id === 0) {
      setStandaloneItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // Persisted item: ask for confirmation
    setItemToDelete({ item, index });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { item, index } = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('deleteItem', { index, item });
      return;
    }

    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const deletePayload = [{ ...item, Status: 2 }];
      await callBackendApi({
        action: 'clinicalmaster/servicecategory/ManageSerivceCategories',
        data: { Data: deletePayload },
        type: 'post',
      });
      setToastMessage({ text: 'Service category deleted successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error deleting service category:', err);
      setToastMessage({ text: 'Failed to delete service category.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Save all items
  const handleSave = async () => {
    const currentList = items;
    // Validation
    const activeItems = currentList.filter((it) => it.Status !== 2);

    for (let i = 0; i < activeItems.length; i++) {
      const it = activeItems[i];
      const hasCode = Boolean(it.ServiceCategoryCode && it.ServiceCategoryCode.trim());
      const hasName = Boolean(it.ServiceCategoryName && it.ServiceCategoryName.trim());

      // If last item is completely blank, ignore it
      if (i === activeItems.length - 1 && !hasCode && !hasName) {
        continue;
      }

      if (!hasCode || !hasName) {
        setToastMessage({
          text: 'Code and Category Name are required for all entered records.',
          type: 'error',
        });
        return;
      }
    }

    // Prepare items for save
    const linesToSave = activeItems
      .filter((it) => it.ServiceCategoryCode?.trim() && it.ServiceCategoryName?.trim())
      .map((it) => {
        let facId = it.FacilityId;
        if (it.IsAllFacility) {
          facId = -1;
        } else if (!facId || facId === -1) {
          facId = currentFacilityId > 0 ? currentFacilityId : 1;
        }
        return {
          ...it,
          FacilityId: facId,
          ParentServiceCategoryId: -1,
          Status: 1,
          DisplayOrder: it.DisplayOrder ? Number(it.DisplayOrder) : 0,
          PrintOrder: it.PrintOrder ? Number(it.PrintOrder) : 0,
        };
      });

    if (linesToSave.length === 0) {
      setToastMessage({ text: 'Please enter at least one valid category to save.', type: 'error' });
      return;
    }

    if (isHybrid && onAction) {
      onAction('saveItem', { items: linesToSave });
      return;
    }

    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'clinicalmaster/servicecategory/ManageSerivceCategories',
        data: { Data: linesToSave },
        type: 'post',
      });
      setToastMessage({ text: 'Service categories saved successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error saving service categories:', err);
      setToastMessage({ text: 'Failed to save service categories.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter submit handler
  const handleFilterSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHybrid && onAction) {
      onAction('getList', { FacilityId: filterFacilityId, Name: filterName });
      return;
    }
    fetchList(filterFacilityId, filterName);
  };

  const handleResetFilters = () => {
    setFilterFacilityId(-1);
    setFilterName('');
    if (isHybrid && onAction) {
      onAction('getList', { FacilityId: -1, Name: '' });
      return;
    }
    fetchList(-1, '');
  };

  const visibleItems = items.filter((it) => it.Status !== 2);

  return (
    <div className="sc-page-container">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE HEADER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="sc-header-card">
        <div className="sc-header-left">
          <div className="sc-header-icon">
            <i className="fa fa-th-list fa-solid fa-layer-group" />
          </div>
          <div>
            <div className="sc-header-title-row">
              <h1 className="sc-header-title">Service Categories</h1>
              <span className="sc-header-tag">Clinical Masters</span>
            </div>
            <p className="sc-header-subtitle">
              Manage clinical service classifications, doctor shares, ordering and facility permissions
            </p>
          </div>
        </div>

        <div className="sc-header-right">
          <div className="sc-header-chip">
            <span className="sc-header-chip-dot" />
            <span>Master Directory</span>
          </div>
          <div className="sc-header-actions">
            <button
              type="button"
              className="sc-btn sc-btn-outline"
              onClick={handleAddNew}
              id="btnAddNewServiceCategory"
            >
              <i className="fa fa-plus fa-solid fa-plus" />
              <span>Add Row</span>
            </button>
            <button
              type="button"
              className="sc-btn sc-btn-primary"
              onClick={handleSave}
              disabled={isSaving}
              id="btnSaveServiceCategoriesTop"
            >
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin fa-solid fa-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-save fa-solid fa-floppy-disk" />
                  <span>Save All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY CARDS (3 Cards)
      ───────────────────────────────────────────────────────────── */}
      <div className="sc-stats-grid">
        <div className="sc-stat-card">
          <div className="sc-stat-icon blue">
            <i className="fa fa-sitemap fa-solid fa-folder-tree" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Total Categories</span>
            <span className="sc-stat-value">{visibleItems.length}</span>
          </div>
        </div>

        <div className="sc-stat-card">
          <div className="sc-stat-icon emerald">
            <i className="fa fa-check-circle fa-solid fa-circle-check" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Active Categories</span>
            <span className="sc-stat-value">
              {visibleItems.filter((i) => Boolean(i.StatusId)).length}
            </span>
          </div>
        </div>

        <div className="sc-stat-card">
          <div className="sc-stat-icon indigo">
            <i className="fa fa-user-md fa-solid fa-user-doctor" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Doctor Share Eligible</span>
            <span className="sc-stat-value">
              {visibleItems.filter((i) => Boolean(i.IsDoctorShare)).length}
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
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: 4,
            }}
          >
            <i className="fa fa-times" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & FILTER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="sc-filter-card">
        <div className="sc-filter-header">
          <h3 className="sc-filter-header-title">
            <i className="fa fa-filter fa-solid fa-sliders" />
            <span>Search & Filter Categories</span>
          </h3>
          <span className="sc-filter-header-badge">Clinical Directory</span>
        </div>

        <form onSubmit={handleFilterSearch} className="sc-filters-grid">
          {/* Facility Filter */}
          <div className="sc-field-group">
            <label className="sc-field-label">
              <i className="fa-solid fa-hospital" />
              <span>Facility</span>
            </label>
            <div className="sc-input-wrapper">
              <select
                className="sc-select-control"
                value={filterFacilityId}
                onChange={(e) => setFilterFacilityId(Number(e.target.value))}
                id="selectFacilityFilter"
              >
                <option value={-1}>All Facilities</option>
                {lookupFacility?.map((fac) => (
                  <option key={fac.Id} value={fac.Id}>
                    {fac.Text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Category */}
          <div className="sc-field-group">
            <label className="sc-field-label">
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search Category (Code / Name)</span>
            </label>
            <div className="sc-input-wrapper">
              <input
                type="text"
                className="sc-input-control"
                placeholder="Type code or category name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                id="inputSearchCategory"
              />
              {filterName && (
                <button
                  type="button"
                  className="sc-input-clear-btn"
                  onClick={() => setFilterName('')}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sc-filter-actions">
            <button type="submit" className="sc-btn sc-btn-primary" id="btnFilterSearch">
              <i className="fa fa-search fa-solid fa-magnifying-glass" />
              <span>Search</span>
            </button>
            <button
              type="button"
              className="sc-btn sc-btn-outline"
              onClick={handleResetFilters}
              id="btnFilterReset"
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
      <div className="sc-table-card">
        <div className="sc-table-header-bar">
          <h3 className="sc-table-title">
            <i className="fa fa-list-alt fa-solid fa-table-list" />
            <span>Service Categories List</span>
            <span className="sc-table-count-pill">
              {visibleItems.length} {visibleItems.length === 1 ? 'Record' : 'Records'}
            </span>
          </h3>
          <button
            type="button"
            className="sc-btn sc-btn-outline"
            style={{ height: 32, padding: '0 12px', fontSize: 12 }}
            onClick={handleAddNew}
          >
            <i className="fa fa-plus fa-solid fa-plus" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="sc-table-wrapper">
          <table className="sc-table">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>#</th>
                <th style={{ width: '18%' }}>
                  Code <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ width: '30%' }}>
                  Category Name <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ width: '11%', textAlign: 'center' }}>Display Order</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Print Order</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'center' }}>All Facility</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Doctor Share</th>
                <th style={{ width: '6%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: 8, display: 'block', color: '#0284c7' }} />
                    Loading service categories...
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="sc-empty-state">
                      <div className="sc-empty-icon">
                        <i className="fa fa-folder-open-o fa-solid fa-folder-open" />
                      </div>
                      <h4 className="sc-empty-title">No Service Categories Found</h4>
                      <p className="sc-empty-desc">
                        {filterName || filterFacilityId !== -1
                          ? 'No categories match the active search criteria. Try resetting filters.'
                          : 'No categories exist yet. Click "Add Row" below to create the first record.'}
                      </p>
                      <button
                        type="button"
                        className="sc-btn sc-btn-primary"
                        onClick={handleAddNew}
                      >
                        <i className="fa fa-plus fa-solid fa-plus" />
                        <span>Add First Category</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, index) => (
                  <tr key={item.Id ? `id-${item.Id}` : `new-${index}`} className={!item.Id ? 'new-row' : ''}>
                    <td className="sc-cell-idx">{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="sc-cell-input code-input"
                        value={item.ServiceCategoryCode || ''}
                        onChange={(e) => handleCellChange(index, 'ServiceCategoryCode', e.target.value)}
                        placeholder="e.g. LAB01"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="sc-cell-input"
                        value={item.ServiceCategoryName || ''}
                        onChange={(e) => handleCellChange(index, 'ServiceCategoryName', e.target.value)}
                        placeholder="Category Name"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="sc-cell-input number-input"
                        value={item.DisplayOrder ?? ''}
                        onChange={(e) => handleCellChange(index, 'DisplayOrder', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="sc-cell-input number-input"
                        value={item.PrintOrder ?? ''}
                        onChange={(e) => handleCellChange(index, 'PrintOrder', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="text-center">
                      <label className="sc-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="sc-checkbox"
                          checked={Boolean(item.StatusId)}
                          onChange={(e) => handleCellChange(index, 'StatusId', e.target.checked)}
                          title="Active Status"
                        />
                      </label>
                    </td>
                    <td className="text-center">
                      <label className="sc-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="sc-checkbox"
                          checked={Boolean(item.IsAllFacility)}
                          onChange={(e) => handleCellChange(index, 'IsAllFacility', e.target.checked)}
                          title="Applicable to All Facilities"
                        />
                      </label>
                    </td>
                    <td className="text-center">
                      <label className="sc-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="sc-checkbox"
                          checked={Boolean(item.IsDoctorShare)}
                          onChange={(e) => handleCellChange(index, 'IsDoctorShare', e.target.checked)}
                          title="Doctor Share Eligible"
                        />
                      </label>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="sc-btn-del"
                        onClick={() => handleDeleteClick(item, index)}
                        title="Delete Category"
                      >
                        <i className="fa fa-trash-o fa-solid fa-trash-can" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. STICKY FOOTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="sc-footer-bar">
        <div className="sc-footer-summary">
          Total categories:{' '}
          <strong>{visibleItems.length}</strong>
          {items.some((i) => !i.Id) && (
            <span style={{ marginLeft: 12, color: '#059669', fontWeight: 600 }}>
              (Unsaved new records present)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="sc-btn sc-btn-outline"
            onClick={handleAddNew}
          >
            <i className="fa fa-plus fa-solid fa-plus" />
            <span>Add Row</span>
          </button>
          <button
            type="button"
            className="sc-btn sc-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
            id="btnSaveServiceCategoriesBottom"
          >
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin fa-solid fa-spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fa fa-save fa-solid fa-floppy-disk" />
                <span>Save All Categories</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Service Category"
          message={`Are you sure you want to delete "${
            itemToDelete.item.ServiceCategoryName || itemToDelete.item.ServiceCategoryCode || 'this record'
          }"?`}
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
