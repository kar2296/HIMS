import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from './ConfirmModal';
import { colors, spacing, radii } from '../components/ui/tokens';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  GenericName?: string;
}

export interface DrugRow {
  Id: number;
  DrugName: string;
  DrugCode?: string;
  DrugTypeId?: number;
  GenericId?: number;
  Description?: string;
  IsCalculateFrequencyQty?: boolean;
  ActiveStatusId?: number;
  IsActive?: boolean;
  DrugType?: { Id?: number; Description?: string; Text?: string };
  GenericMaster?: { Id?: number; GenericName?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
}

export interface DrugMasterListScreenProps {
  reactProps?: {
    items?: DrugRow[];
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
      DrugName?: string;
      DrugTypeId?: number;
      ActiveStatusId?: number;
      GenericId?: number;
    };
    advancedfilter?: {
      IsCalculateFrequencyQty?: boolean;
    };
    lookup?: {
      DrugType?: LookupOption[];
      Generic?: LookupOption[];
      ActiveStatus?: LookupOption[];
      ScheduleType?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DrugMasterListScreen: React.FC<DrugMasterListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<DrugRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    DrugType: LookupOption[];
    Generic: LookupOption[];
    ActiveStatus: LookupOption[];
    ScheduleType: LookupOption[];
  }>({
    DrugType: [],
    Generic: [],
    ActiveStatus: [],
    ScheduleType: [],
  });

  // Filters
  const [filterDrugName, setFilterDrugName] = useState<string>('');
  const [filterDrugTypeId, setFilterDrugTypeId] = useState<number>(-1);
  const [filterGenericId, setFilterGenericId] = useState<number>(-1);
  const [filterStatusId, setFilterStatusId] = useState<number>(2);
  const [filterCalculateFreq, setFilterCalculateFreq] = useState<boolean>(false);

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DrugRow | null>(null);
  const [modalForm, setModalForm] = useState<{
    Id: number;
    DrugName: string;
    DrugCode: string;
    DrugTypeId: number;
    GenericId: number;
    Description: string;
    IsCalculateFrequencyQty: boolean;
    IsActive: boolean;
  }>({
    Id: 0,
    DrugName: '',
    DrugCode: '',
    DrugTypeId: -1,
    GenericId: -1,
    Description: '',
    IsCalculateFrequencyQty: false,
    IsActive: true,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<DrugRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isBridged = Boolean(reactProps);

  // Effective values
  const items = isBridged ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isBridged
    ? (reactProps?.totalItems ?? reactProps?.pagerObj?.totalItems ?? items.length)
    : standaloneTotal;
  const activePage = isBridged
    ? (reactProps?.currentPage ?? reactProps?.pagerObj?.currentPage ?? 1)
    : currentPage;
  const activePageSize = isBridged
    ? (reactProps?.pageSize ?? reactProps?.pagerObj?.pageSize ?? 25)
    : pageSize;

  const drugTypeLookup = isBridged
    ? (reactProps?.lookup?.DrugType || [])
    : standaloneLookups.DrugType;
  const genericLookup = isBridged
    ? (reactProps?.lookup?.Generic || [])
    : standaloneLookups.Generic;
  const statusLookup = isBridged
    ? (reactProps?.lookup?.ActiveStatus || [])
    : standaloneLookups.ActiveStatus;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // API caller
  const callApi = async (action: string, data: any) => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      (window as any).authToken ||
      '';
    const response = await fetch(`/api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  };

  // Fetch Lookups
  const fetchLookups = useCallback(async () => {
    try {
      const data = await callApi('General/Options/getoptions', [
        { Key: 'DrugType' },
        { Key: 'Generic' },
        { Key: 'ActiveStatus' },
        { Key: 'ScheduleType' },
      ]);
      setStandaloneLookups({
        DrugType: data.DrugType || [],
        Generic: data.Generic || [],
        ActiveStatus: data.ActiveStatus || [],
        ScheduleType: data.ScheduleType || [],
      });
    } catch (err) {
      console.error('Failed to load drug lookups:', err);
    }
  }, []);

  // Fetch List
  const fetchList = useCallback(
    async (
      page = 1,
      drugName = filterDrugName,
      typeId = filterDrugTypeId,
      genId = filterGenericId,
      statusId = filterStatusId,
      calcFreq = filterCalculateFreq
    ) => {
      setIsLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 1, Value: drugName },
            { Key: 2, Value: typeId },
            { Key: 3, Value: statusId },
            { Key: 4, Value: genId },
            { Key: 7, Value: calcFreq ? true : undefined },
          ],
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        };
        const res = await callApi('clinicalmaster/DrugMaster/GetDrugMasters', payload);
        if (res && res.Data) {
          setStandaloneItems(res.Data);
          setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        } else {
          setStandaloneItems([]);
          setStandaloneTotal(0);
        }
      } catch (err) {
        console.error('Failed to load drug master list:', err);
        showToast('Failed to load drugs', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [filterDrugName, filterDrugTypeId, filterGenericId, filterStatusId, filterCalculateFreq, pageSize]
  );

  useEffect(() => {
    if (!isBridged) {
      fetchLookups();
      fetchList(1);
    }
  }, [isBridged, fetchLookups, fetchList]);

  // Synchronize bridged filters
  useEffect(() => {
    if (isBridged && reactProps?.currentfilter) {
      setFilterDrugName(reactProps.currentfilter.DrugName || '');
      setFilterDrugTypeId(reactProps.currentfilter.DrugTypeId ?? -1);
      setFilterGenericId(reactProps.currentfilter.GenericId ?? -1);
      setFilterStatusId(reactProps.currentfilter.ActiveStatusId ?? 2);
    }
    if (isBridged && reactProps?.advancedfilter) {
      setFilterCalculateFreq(Boolean(reactProps.advancedfilter.IsCalculateFrequencyQty));
    }
  }, [isBridged, reactProps?.currentfilter, reactProps?.advancedfilter]);

  // Handle Search
  const handleSearch = () => {
    if (isBridged && onAction) {
      onAction('search', {
        DrugName: filterDrugName,
        DrugTypeId: filterDrugTypeId,
        GenericId: filterGenericId,
        ActiveStatusId: filterStatusId,
        IsCalculateFrequencyQty: filterCalculateFreq,
      });
    } else {
      setCurrentPage(1);
      fetchList(1, filterDrugName, filterDrugTypeId, filterGenericId, filterStatusId, filterCalculateFreq);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setFilterDrugName('');
    setFilterDrugTypeId(-1);
    setFilterGenericId(-1);
    setFilterStatusId(2);
    setFilterCalculateFreq(false);
    if (isBridged && onAction) {
      onAction('resetFilters');
    } else {
      setCurrentPage(1);
      fetchList(1, '', -1, -1, 2, false);
    }
  };

  // Handle Page Change
  const handlePageChange = (page: number) => {
    if (isBridged && onAction) {
      onAction('pageChange', { page });
    } else {
      setCurrentPage(page);
      fetchList(page);
    }
  };

  // Add New
  const handleAddNew = () => {
    if (isBridged && onAction) {
      onAction('addNew');
      return;
    }
    setEditingItem(null);
    setModalForm({
      Id: 0,
      DrugName: '',
      DrugCode: '',
      DrugTypeId: -1,
      GenericId: -1,
      Description: '',
      IsCalculateFrequencyQty: false,
      IsActive: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Edit Item
  const handleEdit = (row: DrugRow) => {
    if (isBridged && onAction) {
      onAction('edit', row);
      return;
    }
    setEditingItem(row);
    setModalForm({
      Id: row.Id,
      DrugName: row.DrugName || '',
      DrugCode: row.DrugCode || '',
      DrugTypeId: row.DrugTypeId || row.DrugType?.Id || -1,
      GenericId: row.GenericId || row.GenericMaster?.Id || -1,
      Description: row.Description || '',
      IsCalculateFrequencyQty: Boolean(row.IsCalculateFrequencyQty),
      IsActive: row.ActiveStatusId === 2 || row.IsActive !== false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Delete Click
  const handleDeleteClick = (row: DrugRow) => {
    if (isBridged && onAction) {
      onAction('delete', row);
      return;
    }
    setDeleteTarget(row);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await callApi('clinicalmaster/DrugMaster/DeleteDrugMaster', { Id: deleteTarget.Id });
      showToast('Drug deleted successfully');
      setDeleteTarget(null);
      fetchList(activePage);
    } catch (err) {
      console.error('Failed to delete drug:', err);
      showToast('Failed to delete drug', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Modal
  const handleSaveModal = async () => {
    const errors: { [key: string]: string } = {};
    if (!modalForm.DrugName.trim()) {
      errors.DrugName = 'Drug Name is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const isUpdate = modalForm.Id > 0;
      const endpoint = isUpdate
        ? 'clinicalmaster/DrugMaster/UpdateDrugMaster'
        : 'clinicalmaster/DrugMaster/AddDrugMaster';

      const payload = {
        Data: {
          Id: modalForm.Id,
          DrugName: modalForm.DrugName,
          DrugCode: modalForm.DrugCode,
          DrugTypeId: modalForm.DrugTypeId > 0 ? modalForm.DrugTypeId : null,
          GenericId: modalForm.GenericId > 0 ? modalForm.GenericId : null,
          Description: modalForm.Description,
          IsCalculateFrequencyQty: modalForm.IsCalculateFrequencyQty,
          IsActive: modalForm.IsActive,
          ActiveStatusId: modalForm.IsActive ? 2 : 1,
        },
      };

      await callApi(endpoint, payload);
      showToast(`Drug ${isUpdate ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      fetchList(activePage);
    } catch (err) {
      console.error('Failed to save drug:', err);
      showToast('Failed to save drug', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: spacing.md, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'error' ? colors.danger : colors.success,
            color: '#fff',
            padding: `${spacing.sm} ${spacing.lg}`,
            borderRadius: radii.md,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Drug Master"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Drug Master' },
        ]}
        actions={
          <Button id="btnAddDrugMaster" variant="primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Add New Drug
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card style={{ marginBottom: spacing.md }}>
        <FilterBar>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 160px',
              gap: spacing.md,
              alignItems: 'flex-end',
              width: '100%',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Drug Name
              </label>
              <Input
                id="filterDrugName"
                placeholder="Search by drug name..."
                value={filterDrugName}
                onChange={(e) => setFilterDrugName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Drug Type
              </label>
              <Select
                value={filterDrugTypeId}
                onChange={(val) => setFilterDrugTypeId(Number(val))}
                options={[
                  { value: -1, label: '-- All Types --' },
                  ...drugTypeLookup.map((opt) => ({
                    value: opt.Id,
                    label: opt.Text || opt.Description || `Type #${opt.Id}`,
                  })),
                ]}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Generic
              </label>
              <Select
                value={filterGenericId}
                onChange={(val) => setFilterGenericId(Number(val))}
                options={[
                  { value: -1, label: '-- All Generics --' },
                  ...genericLookup.map((opt) => ({
                    value: opt.Id,
                    label: opt.Text || opt.GenericName || opt.Description || `Generic #${opt.Id}`,
                  })),
                ]}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Status
              </label>
              <Select
                value={filterStatusId}
                onChange={(val) => setFilterStatusId(Number(val))}
                options={[
                  { value: -1, label: '-- All Status --' },
                  ...statusLookup.map((opt) => ({
                    value: opt.Id,
                    label: opt.Text || opt.Description || `Status #${opt.Id}`,
                  })),
                ]}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button id="btnSearchDrugMaster" variant="primary" onClick={handleSearch} disabled={isLoading}>
                <i className="fas fa-search" style={{ marginRight: 6 }}></i> Search
              </Button>
              <Button id="btnResetDrugMaster" variant="outline" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </div>
          </div>
        </FilterBar>
      </Card>

      {/* Data Table */}
      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#f1f5f9',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Drug Type
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Drug Code
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Drug Name
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Generic
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Status
                </th>
                <th
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontWeight: 600,
                    color: colors.textMuted,
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }}></i> Loading drug master list...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No drugs found.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.Id}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.DrugType?.Description || row.DrugType?.Text || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.DrugCode || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500, color: colors.textMain }}>
                      {row.DrugName}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.GenericMaster?.GenericName || row.GenericMaster?.Text || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: radii.full,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            row.ActiveStatus?.Description === 'Active' || row.ActiveStatusId === 2 || row.IsActive
                              ? '#dcfce7'
                              : '#fee2e2',
                          color:
                            row.ActiveStatus?.Description === 'Active' || row.ActiveStatusId === 2 || row.IsActive
                              ? '#166534'
                              : '#991b1b',
                        }}
                      >
                        {row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: spacing.xs }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(row)}
                          title="Edit Drug"
                          style={{ padding: '4px 8px' }}
                        >
                          <i className="fa fa-pencil-alt" aria-hidden="true"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(row)}
                          title="Delete Drug"
                          style={{ padding: '4px 8px' }}
                        >
                          <i className="fa fa-trash" aria-hidden="true"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: spacing.md,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>
            Showing {items.length > 0 ? (activePage - 1) * activePageSize + 1 : 0} to{' '}
            {Math.min(activePage * activePageSize, totalItems)} of {totalItems} entries
          </div>
          <Pagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={activePageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalForm.Id > 0 ? 'Edit Drug' : 'Add New Drug'}
        width="650px"
        portal={true}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal} disabled={isSaving} id="btnSaveDrugModal">
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }}></i> Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {/* Drug Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.xs,
              }}
            >
              Drug Name <span style={{ color: colors.danger }}>*</span>
            </label>
            <Input
              id="inputModalDrugName"
              value={modalForm.DrugName}
              onChange={(e) => {
                setModalForm({ ...modalForm, DrugName: e.target.value });
                if (formErrors.DrugName) setFormErrors({ ...formErrors, DrugName: '' });
              }}
              placeholder="Enter drug name"
            />
            {formErrors.DrugName && (
              <span id="errModalDrugName" className="validation-error" style={{ fontSize: '0.75rem', color: colors.danger, marginTop: spacing.xs, display: 'block' }}>
                {formErrors.DrugName}
              </span>
            )}
          </div>

          {/* Drug Code */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.xs,
              }}
            >
              Drug Code
            </label>
            <Input
              id="inputModalDrugCode"
              value={modalForm.DrugCode}
              onChange={(e) => setModalForm({ ...modalForm, DrugCode: e.target.value })}
              placeholder="Enter drug code"
            />
          </div>

          {/* Drug Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.xs,
              }}
            >
              Drug Type
            </label>
            <Select
              value={modalForm.DrugTypeId}
              onChange={(val) => setModalForm({ ...modalForm, DrugTypeId: Number(val) })}
              options={[
                { value: -1, label: '-- Select Drug Type --' },
                ...drugTypeLookup.map((opt) => ({
                  value: opt.Id,
                  label: opt.Text || opt.Description || `Type #${opt.Id}`,
                })),
              ]}
            />
          </div>

          {/* Generic */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.xs,
              }}
            >
              Generic
            </label>
            <Select
              value={modalForm.GenericId}
              onChange={(val) => setModalForm({ ...modalForm, GenericId: Number(val) })}
              options={[
                { value: -1, label: '-- Select Generic --' },
                ...genericLookup.map((opt) => ({
                  value: opt.Id,
                  label: opt.Text || opt.GenericName || opt.Description || `Generic #${opt.Id}`,
                })),
              ]}
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.xs,
              }}
            >
              Description
            </label>
            <Input
              id="inputModalDrugDesc"
              value={modalForm.Description}
              onChange={(e) => setModalForm({ ...modalForm, Description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          {/* Calculate Frequency Qty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <input
              type="checkbox"
              id="drugCalculateFreq"
              checked={modalForm.IsCalculateFrequencyQty}
              onChange={(e) => setModalForm({ ...modalForm, IsCalculateFrequencyQty: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label
              htmlFor="drugCalculateFreq"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                cursor: 'pointer',
              }}
            >
              Calculate Frequency Qty
            </label>
          </div>

          {/* IsActive */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <input
              type="checkbox"
              id="drugIsActive"
              checked={modalForm.IsActive}
              onChange={(e) => setModalForm({ ...modalForm, IsActive: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label
              htmlFor="drugIsActive"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.textMain,
                cursor: 'pointer',
              }}
            >
              Active
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Confirm Delete"
          message={`Are you sure you want to delete drug "${deleteTarget.DrugName}"?`}
          yesLabel={isDeleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />
      )}
    </div>
  );
};
export default DrugMasterListScreen;
