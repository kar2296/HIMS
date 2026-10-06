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

export interface ProcedureRow {
  Id: number;
  Code: string;
  ProcedureName: string;
  Description?: string;
  ProcedureTypeId?: number;
  ProcedureCategoryId?: number;
  ProcedureSubCategoryId?: number;
  ProcedureCodeSchemeId?: number;
  AnaesthesiaTypeId?: number;
  Duration?: string;
  ActiveStatusId?: number;
  IsActive?: boolean;
  IsCathlabProcedures?: boolean;
  ProcedureType?: { Id?: number; Description?: string; Text?: string };
  ProcedureCategory?: { Id?: number; Description?: string; Text?: string };
  ProcedureSubCategory?: { Id?: number; Description?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
}

export interface ProcedureListScreenProps {
  reactProps?: {
    items?: ProcedureRow[];
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
      Code?: string;
      ProcedureName?: string;
      ProcedureCodeSchemeId?: number;
      ProcedureTypeId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      ProcedureCodeScheme?: LookupOption[];
      ProcedureType?: LookupOption[];
      ActiveStatus?: LookupOption[];
      ProcedureCategory?: LookupOption[];
      ProcedureSubCategory?: LookupOption[];
      AnaesthesiaType?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ProcedureListScreen: React.FC<ProcedureListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<ProcedureRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ProcedureCodeScheme: LookupOption[];
    ProcedureType: LookupOption[];
    ActiveStatus: LookupOption[];
    ProcedureCategory: LookupOption[];
    ProcedureSubCategory: LookupOption[];
    AnaesthesiaType: LookupOption[];
  }>({
    ProcedureCodeScheme: [],
    ProcedureType: [],
    ActiveStatus: [],
    ProcedureCategory: [],
    ProcedureSubCategory: [],
    AnaesthesiaType: [],
  });

  // Filters
  const [filterCode, setFilterCode] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCodeSchemeId, setFilterCodeSchemeId] = useState<number>(-1);
  const [filterProcedureTypeId, setFilterProcedureTypeId] = useState<number>(-1);
  const [filterStatusId, setFilterStatusId] = useState<number>(2);

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ProcedureRow | null>(null);
  const [modalForm, setModalForm] = useState<{
    Id: number;
    Code: string;
    ProcedureName: string;
    Description: string;
    ProcedureTypeId: number;
    ProcedureCategoryId: number;
    ProcedureSubCategoryId: number;
    AnaesthesiaTypeId: number;
    Duration: string;
    IsActive: boolean;
    IsCathlabProcedures: boolean;
  }>({
    Id: 0,
    Code: '',
    ProcedureName: '',
    Description: '',
    ProcedureTypeId: -1,
    ProcedureCategoryId: -1,
    ProcedureSubCategoryId: -1,
    AnaesthesiaTypeId: -1,
    Duration: '',
    IsActive: true,
    IsCathlabProcedures: false,
  });

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<ProcedureRow | null>(null);

  // Determine active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? items.length)
    : standaloneTotal;

  // Lookups source
  const lookups = {
    ProcedureCodeScheme: reactProps?.lookup?.ProcedureCodeScheme || standaloneLookups.ProcedureCodeScheme,
    ProcedureType: reactProps?.lookup?.ProcedureType || standaloneLookups.ProcedureType,
    ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
    ProcedureCategory: reactProps?.lookup?.ProcedureCategory || standaloneLookups.ProcedureCategory,
    ProcedureSubCategory: reactProps?.lookup?.ProcedureSubCategory || standaloneLookups.ProcedureSubCategory,
    AnaesthesiaType: reactProps?.lookup?.AnaesthesiaType || standaloneLookups.AnaesthesiaType,
  };

  // Auto-hide toast after 4s
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
            { Key: 'ProcedureCodeScheme' },
            { Key: 'ProcedureType' },
            { Key: 'ActiveStatus' },
            { Key: 'ProcedureCategory' },
            { Key: 'ProcedureSubCategory' },
            { Key: 'AnaesthesiaType' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                ProcedureCodeScheme: res.ProcedureCodeScheme || [],
                ProcedureType: res.ProcedureType || [],
                ActiveStatus: res.ActiveStatus || [],
                ProcedureCategory: res.ProcedureCategory || [],
                ProcedureSubCategory: res.ProcedureSubCategory || [],
                AnaesthesiaType: res.AnaesthesiaType || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching lookups for Procedure:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch list in standalone mode
  const fetchList = useCallback(
    async (
      code = filterCode,
      name = filterName,
      codeSchemeId = filterCodeSchemeId,
      procTypeId = filterProcedureTypeId,
      statusId = filterStatusId,
      page = currentPage
    ) => {
      setIsLoading(true);
      try {
        const { callBackendApi } = await import('../services/apiService');
        const res: any = await callBackendApi({
          action: 'clinicalmaster/procedure/GetProcedures',
          data: {
            Params: [
              { Key: 1, Value: name.trim() },
              { Key: 2, Value: codeSchemeId },
              { Key: 3, Value: code.trim() },
              { Key: 4, Value: procTypeId },
              { Key: 5, Value: statusId },
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
        console.error('Error loading procedures:', err);
        setToastMessage({ text: 'Failed to load procedures.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [filterCode, filterName, filterCodeSchemeId, filterProcedureTypeId, filterStatusId, currentPage, pageSize]
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
        Code: filterCode,
        ProcedureName: filterName,
        ProcedureCodeSchemeId: filterCodeSchemeId,
        ProcedureTypeId: filterProcedureTypeId,
        ActiveStatusId: filterStatusId,
      });
      return;
    }
    fetchList(filterCode, filterName, filterCodeSchemeId, filterProcedureTypeId, filterStatusId, 1);
  };

  const handleResetFilters = () => {
    setFilterCode('');
    setFilterName('');
    setFilterCodeSchemeId(-1);
    setFilterProcedureTypeId(-1);
    setFilterStatusId(2);
    setCurrentPage(1);
    if (isHybrid && onAction) {
      onAction('resetFilters');
      return;
    }
    fetchList('', '', -1, -1, 2, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (isHybrid && onAction) {
      onAction('pageChange', { page });
      return;
    }
    fetchList(filterCode, filterName, filterCodeSchemeId, filterProcedureTypeId, filterStatusId, page);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalForm({
      Id: 0,
      Code: '',
      ProcedureName: '',
      Description: '',
      ProcedureTypeId: -1,
      ProcedureCategoryId: -1,
      ProcedureSubCategoryId: -1,
      AnaesthesiaTypeId: -1,
      Duration: '',
      IsActive: true,
      IsCathlabProcedures: false,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (item: ProcedureRow) => {
    setEditingItem(item);
    setIsModalOpen(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const res: any = await callBackendApi({
        action: 'clinicalmaster/procedure/GetProcedureById',
        data: { Id: item.Id },
        type: 'post',
      });
      const data = res || item;
      setModalForm({
        Id: data.Id || item.Id,
        Code: data.Code || '',
        ProcedureName: data.ProcedureName || '',
        Description: data.Description || '',
        ProcedureTypeId: data.ProcedureTypeId || -1,
        ProcedureCategoryId: data.ProcedureCategoryId || -1,
        ProcedureSubCategoryId: data.ProcedureSubCategoryId || -1,
        AnaesthesiaTypeId: data.AnaesthesiaTypeId || -1,
        Duration: data.Duration ? String(data.Duration) : '',
        IsActive: Boolean(data.IsActive ?? data.ActiveStatusId === 2),
        IsCathlabProcedures: Boolean(data.IsCathlabProcedures),
      });
    } catch {
      setModalForm({
        Id: item.Id,
        Code: item.Code || '',
        ProcedureName: item.ProcedureName || '',
        Description: item.Description || '',
        ProcedureTypeId: item.ProcedureTypeId || -1,
        ProcedureCategoryId: item.ProcedureCategoryId || -1,
        ProcedureSubCategoryId: item.ProcedureSubCategoryId || -1,
        AnaesthesiaTypeId: item.AnaesthesiaTypeId || -1,
        Duration: item.Duration ? String(item.Duration) : '',
        IsActive: Boolean(item.IsActive ?? item.ActiveStatusId === 2),
        IsCathlabProcedures: Boolean(item.IsCathlabProcedures),
      });
    }
  };

  // Save Modal Form
  const handleSaveModal = async () => {
    if (!modalForm.Code.trim() || !modalForm.ProcedureName.trim()) {
      setToastMessage({ text: 'Code and Procedure Name are required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const currentFacilityId = sessionHelper.getCurrentFacilityId();
      const payload: any = {
        Id: modalForm.Id,
        FacilityId: currentFacilityId > 0 ? currentFacilityId : 1,
        Code: modalForm.Code.trim(),
        ProcedureName: modalForm.ProcedureName.trim(),
        Description: modalForm.Description?.trim() || '',
        ProcedureTypeId: modalForm.ProcedureTypeId === -1 ? null : modalForm.ProcedureTypeId,
        ProcedureCategoryId: modalForm.ProcedureCategoryId === -1 ? null : modalForm.ProcedureCategoryId,
        ProcedureSubCategoryId: modalForm.ProcedureSubCategoryId === -1 ? null : modalForm.ProcedureSubCategoryId,
        AnaesthesiaTypeId: modalForm.AnaesthesiaTypeId === -1 ? null : modalForm.AnaesthesiaTypeId,
        Duration: modalForm.Duration || null,
        IsActive: modalForm.IsActive,
        IsCathlabProcedures: modalForm.IsCathlabProcedures,
        ActiveStatusId: modalForm.IsActive ? 2 : 3,
      };

      const isEdit = payload.Id && payload.Id > 0;
      const actionName = isEdit
        ? 'clinicalmaster/procedure/UpdateProcedure'
        : 'clinicalmaster/procedure/AddProcedure';

      await callBackendApi({
        action: actionName,
        data: { Data: payload },
        type: 'post',
      });

      setToastMessage({
        text: `Procedure ${isEdit ? 'updated' : 'created'} successfully.`,
        type: 'success',
      });
      setIsModalOpen(false);
      fetchList();
    } catch (err: any) {
      console.error('Error saving procedure:', err);
      setToastMessage({ text: 'Failed to save procedure.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Click
  const handleDeleteClick = (item: ProcedureRow) => {
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
        action: 'clinicalmaster/procedure/DeleteProcedure',
        data: { Id: item.Id },
        type: 'post',
      });
      setToastMessage({ text: 'Procedure deleted successfully.', type: 'success' });
      fetchList();
    } catch (err: any) {
      console.error('Error deleting procedure:', err);
      setToastMessage({ text: 'Failed to delete procedure.', type: 'error' });
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
        title="Procedures"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Procedures' },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
            id="btnAddProcedure"
          >
            <i className="fa fa-plus" />
            <span>Add Procedure</span>
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
            {/* Code Scheme */}
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
                Code Scheme
              </label>
              <Select
                value={filterCodeSchemeId}
                onChange={(val) => setFilterCodeSchemeId(Number(val))}
                options={[
                  { value: -1, label: 'All Code Schemes' },
                  ...(lookups.ProcedureCodeScheme?.map((s) => ({ value: s.Id, label: s.Text })) || []),
                ]}
                id="filterProcedureCodeScheme"
              />
            </div>

            {/* Procedure Type */}
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
                Procedure Type
              </label>
              <Select
                value={filterProcedureTypeId}
                onChange={(val) => setFilterProcedureTypeId(Number(val))}
                options={[
                  { value: -1, label: 'All Procedure Types' },
                  ...(lookups.ProcedureType?.map((t) => ({ value: t.Id, label: t.Text || t.Description || '' })) || []),
                ]}
                id="filterProcedureType"
              />
            </div>

            {/* Status */}
            <div style={{ minWidth: 150, flex: '1 1 150px' }}>
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
                id="filterProcedureStatus"
              />
            </div>

            {/* Code Search */}
            <div style={{ minWidth: 140, flex: '1 1 140px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Code
              </label>
              <Input
                type="text"
                placeholder="Code..."
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                id="filterProcedureCode"
              />
            </div>

            {/* Name Search */}
            <div style={{ minWidth: 200, flex: '2 1 200px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMain,
                }}
              >
                Procedure Name
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Procedure Name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                  id="filterProcedureName"
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
              <Button type="submit" variant="primary" id="btnFilterSearchProcedure">
                <i className="fa fa-search" style={{ marginRight: spacing.xs }} />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} id="btnFilterResetProcedure">
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
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '15%' }}>Code</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '25%' }}>Procedure Name</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '18%' }}>Procedure Type</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '16%' }}>Category</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '14%' }}>Sub Category</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '6%' }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, width: '6%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, display: 'block' }} />
                    Loading procedures...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No procedures found. Click &quot;Add Procedure&quot; to create one.
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
                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.primary }}>
                        {item.Code}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500 }}>
                        {item.ProcedureName}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.ProcedureType?.Description || item.ProcedureType?.Text || '-'}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.ProcedureCategory?.Description || item.ProcedureCategory?.Text || '-'}
                      </td>

                      <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                        {item.ProcedureSubCategory?.Description || item.ProcedureSubCategory?.Text || '-'}
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
                            title="Edit Procedure"
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
                            title="Delete Procedure"
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
        title={editingItem ? 'Edit Procedure' : 'Add Procedure'}
        onClose={() => setIsModalOpen(false)}
        width="650px"
        portal={true}
        footer={
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal} disabled={isSaving} id="btnSaveProcedureModal">
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
          {/* Code & Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: spacing.md }}>
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
                Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <Input
                type="text"
                placeholder="Code"
                value={modalForm.Code}
                onChange={(e) => setModalForm({ ...modalForm, Code: e.target.value })}
                id="inputModalProcedureCode"
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
                Procedure Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <Input
                type="text"
                placeholder="Procedure Name"
                value={modalForm.ProcedureName}
                onChange={(e) => setModalForm({ ...modalForm, ProcedureName: e.target.value })}
                id="inputModalProcedureName"
              />
            </div>
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
              id="inputModalProcedureDescription"
            />
          </div>

          {/* Procedure Type & Category */}
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
                Procedure Type
              </label>
              <Select
                value={modalForm.ProcedureTypeId}
                onChange={(val) => setModalForm({ ...modalForm, ProcedureTypeId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Procedure Type' },
                  ...(lookups.ProcedureType?.map((t) => ({ value: t.Id, label: t.Text || t.Description || '' })) || []),
                ]}
                id="selectModalProcedureType"
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
                Category
              </label>
              <Select
                value={modalForm.ProcedureCategoryId}
                onChange={(val) => setModalForm({ ...modalForm, ProcedureCategoryId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Category' },
                  ...(lookups.ProcedureCategory?.map((c) => ({ value: c.Id, label: c.Text || c.Description || '' })) || []),
                ]}
                id="selectModalProcedureCategory"
              />
            </div>
          </div>

          {/* SubCategory & Anaesthesia Type */}
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
                Sub Category
              </label>
              <Select
                value={modalForm.ProcedureSubCategoryId}
                onChange={(val) => setModalForm({ ...modalForm, ProcedureSubCategoryId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Sub Category' },
                  ...(lookups.ProcedureSubCategory?.map((sc) => ({ value: sc.Id, label: sc.Text || sc.Description || '' })) || []),
                ]}
                id="selectModalProcedureSubCategory"
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
                Anaesthesia Type
              </label>
              <Select
                value={modalForm.AnaesthesiaTypeId}
                onChange={(val) => setModalForm({ ...modalForm, AnaesthesiaTypeId: Number(val) })}
                options={[
                  { value: -1, label: 'Select Anaesthesia Type' },
                  ...(lookups.AnaesthesiaType?.map((a) => ({ value: a.Id, label: a.Text || a.Description || '' })) || []),
                ]}
                id="selectModalAnaesthesiaType"
              />
            </div>
          </div>

          {/* Duration & Checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, alignItems: 'center' }}>
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
                Duration (minutes)
              </label>
              <Input
                type="text"
                placeholder="Duration"
                value={modalForm.Duration}
                onChange={(e) => setModalForm({ ...modalForm, Duration: e.target.value })}
                id="inputModalProcedureDuration"
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: spacing.lg,
                alignItems: 'center',
                paddingTop: spacing.lg,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modalForm.IsActive}
                  onChange={(e) => setModalForm({ ...modalForm, IsActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                  id="chkModalProcedureIsActive"
                />
                <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Active</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modalForm.IsCathlabProcedures}
                  onChange={(e) => setModalForm({ ...modalForm, IsCathlabProcedures: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: colors.primary, cursor: 'pointer' }}
                  id="chkModalProcedureIsCathlab"
                />
                <span style={{ fontSize: '0.875rem', color: colors.textMain }}>Cathlab Procedure</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Procedure"
          message={`Are you sure you want to delete procedure "${itemToDelete.ProcedureName}"?`}
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
