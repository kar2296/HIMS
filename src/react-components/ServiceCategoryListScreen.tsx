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
      {/* Page Header */}
      <PageHeader
        title="Service Categories"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Service Categories' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <Button
              variant="outline"
              onClick={handleAddNew}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
              id="btnAddNewServiceCategory"
            >
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Row</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
              id="btnSaveServiceCategoriesTop"
            >
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-save" />
                  <span>Save All</span>
                </>
              )}
            </Button>
          </div>
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
            <div style={{ minWidth: 220, flex: '1 1 220px' }}>
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
                  ...(lookupFacility?.map((fac) => ({ value: fac.Id, label: fac.Text })) || []),
                ]}
                id="selectFacilityFilter"
              />
            </div>

            {/* Code / Name Search */}
            <div style={{ minWidth: 260, flex: '2 1 260px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Search Category (Code / Name)
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Type code or category name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                  id="inputSearchCategory"
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button type="submit" variant="primary" id="btnFilterSearch">
                <i className="fa fa-search" style={{ marginRight: spacing.xs }} />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} id="btnFilterReset">
                <i className="fa fa-refresh" style={{ marginRight: spacing.xs }} />
                Reset
              </Button>
            </div>
          </form>
        </FilterBar>
      </Card>

      {/* Main Grid Card */}
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
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '16%' }}>
                  <span>Code</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '28%' }}>
                  <span>Category Name</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '12%' }}>Display Order</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '12%' }}>Print Order</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '8%', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '10%', textAlign: 'center' }}>
                  All Facility
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '10%', textAlign: 'center' }}>
                  Doctor Share
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '6%', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, display: 'block' }} />
                    Loading service categories...
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No service categories found. Click &quot;Add Row&quot; to create one.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, index) => {
                  return (
                    <tr
                      key={item.Id ? `id-${item.Id}` : `new-${index}`}
                      style={{
                        borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.ServiceCategoryCode || ''}
                          onChange={(e) => handleCellChange(index, 'ServiceCategoryCode', e.target.value)}
                          placeholder="Code"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border || '#cbd5e1'}`,
                            fontSize: '0.875rem',
                          }}
                        />
                      </td>

                      {/* Category Name */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.ServiceCategoryName || ''}
                          onChange={(e) => handleCellChange(index, 'ServiceCategoryName', e.target.value)}
                          placeholder="Category Name"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border || '#cbd5e1'}`,
                            fontSize: '0.875rem',
                          }}
                        />
                      </td>

                      {/* Display Order */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="number"
                          className="form-control"
                          value={item.DisplayOrder ?? ''}
                          onChange={(e) => handleCellChange(index, 'DisplayOrder', e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border || '#cbd5e1'}`,
                            fontSize: '0.875rem',
                          }}
                        />
                      </td>

                      {/* Print Order */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="number"
                          className="form-control"
                          value={item.PrintOrder ?? ''}
                          onChange={(e) => handleCellChange(index, 'PrintOrder', e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border || '#cbd5e1'}`,
                            fontSize: '0.875rem',
                          }}
                        />
                      </td>

                      {/* Status */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(item.StatusId)}
                          onChange={(e) => handleCellChange(index, 'StatusId', e.target.checked)}
                          style={{
                            cursor: 'pointer',
                            width: 18,
                            height: 18,
                            accentColor: colors.primary,
                          }}
                          title="Active Status"
                        />
                      </td>

                      {/* Is All Facility */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(item.IsAllFacility)}
                          onChange={(e) => handleCellChange(index, 'IsAllFacility', e.target.checked)}
                          style={{
                            cursor: 'pointer',
                            width: 18,
                            height: 18,
                            accentColor: colors.primary,
                          }}
                          title="Applicable to All Facilities"
                        />
                      </td>

                      {/* Doctor Share */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(item.IsDoctorShare)}
                          onChange={(e) => handleCellChange(index, 'IsDoctorShare', e.target.checked)}
                          style={{
                            cursor: 'pointer',
                            width: 18,
                            height: 18,
                            accentColor: colors.primary,
                          }}
                          title="Doctor Share Eligible"
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item, index)}
                          title="Delete Category"
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sticky Bottom Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#ffffff',
          padding: `${spacing.sm} ${spacing.lg}`,
          borderRadius: radii.md,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${colors.border || '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>
          Total rows:{' '}
          <strong style={{ color: colors.textMain }}>{visibleItems.length}</strong>
        </div>
        <div style={{ display: 'flex', gap: spacing.md }}>
          <Button
            variant="outline"
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
          >
            <i className="fa fa-plus" />
            <span>Add Row</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
            id="btnSaveServiceCategoriesBottom"
          >
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fa fa-save" />
                <span>Save Categories</span>
              </>
            )}
          </Button>
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
