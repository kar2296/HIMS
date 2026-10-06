import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { ConfirmModal } from './ConfirmModal';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';

export interface LookupOption {
  Id: number;
  Text: string;
}

export interface ServiceGroupItem {
  Id: number;
  FacilityId: number;
  SourceTypeId: number;
  ServiceGroupCode: string;
  ServiceGroupName: string;
  DisplayOrder?: number | string;
  StatusId?: boolean;
  Status?: number; // 1 = active, 2 = deleted
  _isNew?: boolean;
}

export interface ServiceGroupListScreenProps {
  reactProps?: {
    items?: ServiceGroupItem[];
    currentfilter?: {
      FacilityId?: number;
      SourceTypeId?: number;
      Name?: string;
      StatusId?: any;
    };
    lookup?: {
      Facility?: LookupOption[];
      SourceType?: LookupOption[];
      OrderMasterStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ServiceGroupListScreen: React.FC<ServiceGroupListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<ServiceGroupItem[]>([]);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Facility: LookupOption[];
    SourceType: LookupOption[];
    OrderMasterStatus: LookupOption[];
  }>({
    Facility: [],
    SourceType: [],
    OrderMasterStatus: [],
  });

  // Filters
  const currentFacilityId = sessionHelper.getCurrentFacilityId();
  const [filterFacilityId, setFilterFacilityId] = useState<number>(currentFacilityId > 0 ? currentFacilityId : 1);
  const [filterSourceTypeId, setFilterSourceTypeId] = useState<number>(1);
  const [filterStatusId, setFilterStatusId] = useState<number>(-1);
  const [filterName, setFilterName] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ item: ServiceGroupItem; index: number } | null>(null);

  // Active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const lookupFacility = reactProps?.lookup?.Facility || standaloneLookups.Facility;
  const lookupSourceType = reactProps?.lookup?.SourceType || standaloneLookups.SourceType;
  const lookupStatus = reactProps?.lookup?.OrderMasterStatus || standaloneLookups.OrderMasterStatus;

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
            { Key: 'Facility' },
            { Key: 'SourceType' },
            { Key: 'OrderMasterStatus' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                Facility: res.Facility || [],
                SourceType: res.SourceType || [],
                OrderMasterStatus: res.OrderMasterStatus || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching lookups for ServiceGroup:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // Create empty line item
  const createEmptyLineItem = useCallback((): ServiceGroupItem => {
    return {
      Id: 0,
      FacilityId: filterFacilityId > 0 ? filterFacilityId : (currentFacilityId > 0 ? currentFacilityId : 1),
      SourceTypeId: filterSourceTypeId > 0 ? filterSourceTypeId : 1,
      ServiceGroupCode: '',
      ServiceGroupName: '',
      DisplayOrder: '',
      Status: 1,
      StatusId: true,
      _isNew: true,
    };
  }, [filterFacilityId, filterSourceTypeId, currentFacilityId]);

  // Fetch list
  const fetchList = useCallback(
    async (
      facilityId = filterFacilityId,
      sourceTypeId = filterSourceTypeId,
      statusId = filterStatusId,
      name = filterName
    ) => {
      setIsLoading(true);
      try {
        const { callBackendApi } = await import('../services/apiService');
        const params: any[] = [
          { Key: 1, Value: name.trim() },
          { Key: 2, Value: facilityId },
          { Key: 3, Value: sourceTypeId },
        ];

        if (statusId === 1) {
          params.push({ Key: 5, Value: 1 });
        } else if (statusId === 0) {
          params.push({ Key: 6, Value: 1 });
        }

        const res: any = await callBackendApi({
          action: 'clinicalmaster/servicegroup/GetServiceGroups',
          data: {
            Params: params,
            PageContext: { PageSize: 100, PageNumber: 1 },
          },
          type: 'post',
        });

        const list: ServiceGroupItem[] = (res?.Data || []).map((row: any) => ({
          ...row,
          Status: row.Status ?? 1,
          StatusId: Boolean(row.StatusId ?? true),
        }));

        list.push(createEmptyLineItem());
        setStandaloneItems(list);
      } catch (err: any) {
        console.error('Error loading service groups:', err);
        setToastMessage({ text: 'Failed to load service groups.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [filterFacilityId, filterSourceTypeId, filterStatusId, filterName, createEmptyLineItem]
  );

  useEffect(() => {
    if (!isHybrid) {
      fetchList();
    }
  }, [isHybrid, fetchList]);

  // Handle cell edit
  const handleCellChange = (
    index: number,
    field: keyof ServiceGroupItem,
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
  const handleDeleteClick = (item: ServiceGroupItem, index: number) => {
    if (!item.Id || item.Id === 0) {
      setStandaloneItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
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
        action: 'clinicalmaster/servicegroup/ManageSerivceGroups',
        data: { Data: deletePayload },
        type: 'post',
      });
      setToastMessage({ text: 'Service group deleted successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error deleting service group:', err);
      setToastMessage({ text: 'Failed to delete service group.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Save all items
  const handleSave = async () => {
    const currentList = items;
    const activeItems = currentList.filter((it) => it.Status !== 2);

    for (let i = 0; i < activeItems.length; i++) {
      const it = activeItems[i];
      const hasCode = Boolean(it.ServiceGroupCode && it.ServiceGroupCode.trim());
      const hasName = Boolean(it.ServiceGroupName && it.ServiceGroupName.trim());

      // If last item is blank, ignore it
      if (i === activeItems.length - 1 && !hasCode && !hasName) {
        continue;
      }

      if (!hasCode || !hasName || !it.FacilityId || it.FacilityId === -1 || !it.SourceTypeId || it.SourceTypeId === -1) {
        setToastMessage({
          text: 'Facility, Source Type, Group Code, and Group Name are required for all entered records.',
          type: 'error',
        });
        return;
      }
    }

    const linesToSave = activeItems
      .filter((it) => it.ServiceGroupCode?.trim() && it.ServiceGroupName?.trim())
      .map((it) => ({
        ...it,
        Status: 1,
        DisplayOrder: it.DisplayOrder ? Number(it.DisplayOrder) : 0,
      }));

    if (linesToSave.length === 0) {
      setToastMessage({ text: 'Please enter at least one valid group to save.', type: 'error' });
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
        action: 'clinicalmaster/servicegroup/ManageSerivceGroups',
        data: { Data: linesToSave },
        type: 'post',
      });
      setToastMessage({ text: 'Service groups saved successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error saving service groups:', err);
      setToastMessage({ text: 'Failed to save service groups.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter handlers
  const handleFilterSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHybrid && onAction) {
      onAction('getList', {
        FacilityId: filterFacilityId,
        SourceTypeId: filterSourceTypeId,
        StatusId: filterStatusId,
        Name: filterName,
      });
      return;
    }
    fetchList(filterFacilityId, filterSourceTypeId, filterStatusId, filterName);
  };

  const handleResetFilters = () => {
    setFilterFacilityId(currentFacilityId > 0 ? currentFacilityId : 1);
    setFilterSourceTypeId(1);
    setFilterStatusId(-1);
    setFilterName('');
    if (isHybrid && onAction) {
      onAction('getList', {
        FacilityId: currentFacilityId > 0 ? currentFacilityId : 1,
        SourceTypeId: 1,
        StatusId: -1,
        Name: '',
      });
      return;
    }
    fetchList(currentFacilityId > 0 ? currentFacilityId : 1, 1, -1, '');
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
        title="Service Groups"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Service Groups' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <Button
              variant="outline"
              onClick={handleAddNew}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
              id="btnAddNewServiceGroup"
            >
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Row</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
              id="btnSaveServiceGroupsTop"
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
                options={lookupFacility?.map((fac) => ({ value: fac.Id, label: fac.Text })) || []}
                id="selectFacilityFilterGroup"
              />
            </div>

            {/* Source Type Filter */}
            <div style={{ minWidth: 180, flex: '1 1 180px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Source Type
              </label>
              <Select
                value={filterSourceTypeId}
                onChange={(val) => setFilterSourceTypeId(Number(val))}
                options={lookupSourceType?.map((src) => ({ value: src.Id, label: src.Text })) || []}
                id="selectSourceTypeFilterGroup"
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
                  ...(lookupStatus?.map((st) => ({ value: st.Id, label: st.Text })) || []),
                ]}
                id="selectStatusFilterGroup"
              />
            </div>

            {/* Code / Name Search */}
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
                Search Group
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Type group code or name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                  id="inputSearchGroup"
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
              <Button type="submit" variant="primary" id="btnFilterSearchGroup">
                <i className="fa fa-search" style={{ marginRight: spacing.xs }} />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} id="btnFilterResetGroup">
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
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '20%' }}>
                  <span>Facility</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '18%' }}>
                  <span>Source Type</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '16%' }}>
                  <span>Group Code</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '24%' }}>
                  <span>Item Group Name</span>
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '10%' }}>Display Order</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '6%', textAlign: 'center' }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '6%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, display: 'block' }} />
                    Loading service groups...
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No service groups found. Click &quot;Add Row&quot; to create one.
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
                      {/* Facility */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <Select
                          value={item.FacilityId}
                          onChange={(val) => handleCellChange(index, 'FacilityId', Number(val))}
                          options={lookupFacility?.map((f) => ({ value: f.Id, label: f.Text })) || []}
                        />
                      </td>

                      {/* Source Type */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <Select
                          value={item.SourceTypeId}
                          onChange={(val) => handleCellChange(index, 'SourceTypeId', Number(val))}
                          options={lookupSourceType?.map((s) => ({ value: s.Id, label: s.Text })) || []}
                        />
                      </td>

                      {/* Code */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.ServiceGroupCode || ''}
                          onChange={(e) => handleCellChange(index, 'ServiceGroupCode', e.target.value)}
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

                      {/* Item Group Name */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.ServiceGroupName || ''}
                          onChange={(e) => handleCellChange(index, 'ServiceGroupName', e.target.value)}
                          placeholder="Group Name"
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

                      {/* Actions */}
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}`, textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item, index)}
                          title="Delete Group"
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
            id="btnSaveServiceGroupsBottom"
          >
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fa fa-save" />
                <span>Save Groups</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Service Group"
          message={`Are you sure you want to delete "${
            itemToDelete.item.ServiceGroupName || itemToDelete.item.ServiceGroupCode || 'this group'
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
