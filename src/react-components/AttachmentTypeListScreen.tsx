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
  DepartmentName?: string;
}

export interface AttachmentTypeRow {
  Id: number;
  Name: string;
  Description?: string;
  DepartmentId?: number;
  ReferrenceLink?: string;
  SpecialInstruction?: string;
  IsActive?: boolean;
  ActiveStatusId?: number;
  Department?: { Id?: number; DepartmentName?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; Text?: string };
}

export interface AttachmentTypeListScreenProps {
  reactProps?: {
    items?: AttachmentTypeRow[];
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
      DepartmentId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      Department?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AttachmentTypeListScreen: React.FC<AttachmentTypeListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<AttachmentTypeRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Department: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    Department: [],
    ActiveStatus: [],
  });

  // Filters
  const [filterName, setFilterName] = useState<string>('');
  const [filterDepartmentId, setFilterDepartmentId] = useState<number>(-1);
  const [filterStatusId, setFilterStatusId] = useState<number>(2);

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AttachmentTypeRow | null>(null);
  const [modalForm, setModalForm] = useState<{
    Id: number;
    Name: string;
    Description: string;
    DepartmentId: number;
    ReferrenceLink: string;
    SpecialInstruction: string;
    IsActive: boolean;
  }>({
    Id: 0,
    Name: '',
    Description: '',
    DepartmentId: -1,
    ReferrenceLink: '',
    SpecialInstruction: '',
    IsActive: true,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<AttachmentTypeRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isBridged = Boolean(reactProps);

  // Effective state
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

  const departmentLookup = isBridged
    ? (reactProps?.lookup?.Department || [])
    : standaloneLookups.Department;
  const statusLookup = isBridged
    ? (reactProps?.lookup?.ActiveStatus || [])
    : standaloneLookups.ActiveStatus;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper for API calls
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

  // Fetch Lookups standalone
  const fetchLookups = useCallback(async () => {
    try {
      const data = await callApi('General/Options/getoptions', [
        { Key: 'Department', Request: { Params: [{ Key: 5, Value: 2 }] } },
        { Key: 'ActiveStatus' },
      ]);
      setStandaloneLookups({
        Department: data.Department || [],
        ActiveStatus: data.ActiveStatus || [],
      });
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  }, []);

  // Fetch List standalone
  const fetchList = useCallback(
    async (page = 1, name = filterName, deptId = filterDepartmentId, statusId = filterStatusId) => {
      setIsLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 1, Value: name },
            { Key: 2, Value: deptId },
            { Key: 3, Value: statusId },
          ],
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        };
        const res = await callApi('clinicalmaster/AttachmentType/GetAttachmentTypes', payload);
        if (res && res.Data) {
          setStandaloneItems(res.Data);
          setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        } else {
          setStandaloneItems([]);
          setStandaloneTotal(0);
        }
      } catch (err) {
        console.error('Failed to load attachment types:', err);
        showToast('Failed to load attachment types', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [filterName, filterDepartmentId, filterStatusId, pageSize]
  );

  useEffect(() => {
    if (!isBridged) {
      fetchLookups();
      fetchList(1);
    }
  }, [isBridged, fetchLookups, fetchList]);

  // Synchronize filter inputs from bridged reactProps if provided
  useEffect(() => {
    if (isBridged && reactProps?.currentfilter) {
      setFilterName(reactProps.currentfilter.Name || '');
      setFilterDepartmentId(reactProps.currentfilter.DepartmentId ?? -1);
      setFilterStatusId(reactProps.currentfilter.ActiveStatusId ?? 2);
    }
  }, [isBridged, reactProps?.currentfilter]);

  // Handle Search
  const handleSearch = () => {
    if (isBridged && onAction) {
      onAction('search', {
        Name: filterName,
        DepartmentId: filterDepartmentId,
        ActiveStatusId: filterStatusId,
      });
    } else {
      setCurrentPage(1);
      fetchList(1, filterName, filterDepartmentId, filterStatusId);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setFilterName('');
    setFilterDepartmentId(-1);
    setFilterStatusId(2);
    if (isBridged && onAction) {
      onAction('resetFilters');
    } else {
      setCurrentPage(1);
      fetchList(1, '', -1, 2);
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

  // Open Add Modal
  const handleAddNew = () => {
    if (isBridged && onAction) {
      onAction('addNew');
      return;
    }
    setEditingItem(null);
    setModalForm({
      Id: 0,
      Name: '',
      Description: '',
      DepartmentId: -1,
      ReferrenceLink: '',
      SpecialInstruction: '',
      IsActive: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = async (row: AttachmentTypeRow) => {
    if (isBridged && onAction) {
      onAction('edit', { entity: row });
      return;
    }
    setEditingItem(row);
    try {
      setIsLoading(true);
      const res = await callApi('clinicalmaster/AttachmentType/GetAttachmentTypeById', { Id: row.Id });
      const record = res || row;
      setModalForm({
        Id: record.Id || row.Id,
        Name: record.Name || '',
        Description: record.Description || '',
        DepartmentId: record.DepartmentId || -1,
        ReferrenceLink: record.ReferrenceLink || '',
        SpecialInstruction: record.SpecialInstruction || '',
        IsActive: record.IsActive ?? true,
      });
      setFormErrors({});
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load item for edit:', err);
      showToast('Failed to load record details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Delete Confirm
  const handleDeleteClick = (row: AttachmentTypeRow) => {
    if (isBridged && onAction) {
      onAction('delete', { entity: row });
      return;
    }
    setDeleteTarget(row);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await callApi('clinicalmaster/AttachmentType/DeleteAttachmentType', { Id: deleteTarget.Id });
      showToast('Attachment Type deleted successfully');
      setDeleteTarget(null);
      fetchList(activePage);
    } catch (err) {
      console.error('Failed to delete attachment type:', err);
      showToast('Failed to delete attachment type', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Modal Form
  const handleSaveModal = async () => {
    const errors: { [key: string]: string } = {};
    if (!modalForm.Name.trim()) {
      errors.Name = 'Attachment Type Name is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const isUpdate = modalForm.Id > 0;
      const endpoint = isUpdate
        ? 'clinicalmaster/AttachmentType/UpdateAttachmentType'
        : 'clinicalmaster/AttachmentType/AddAttachmentType';

      const payload = {
        Data: {
          Id: modalForm.Id,
          Name: modalForm.Name,
          Description: modalForm.Description,
          DepartmentId: modalForm.DepartmentId > 0 ? modalForm.DepartmentId : null,
          ReferrenceLink: modalForm.ReferrenceLink,
          SpecialInstruction: modalForm.SpecialInstruction,
          IsActive: modalForm.IsActive,
        },
      };

      await callApi(endpoint, payload);
      showToast(`Attachment Type ${isUpdate ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      fetchList(activePage);
    } catch (err) {
      console.error('Failed to save attachment type:', err);
      showToast('Failed to save attachment type', 'error');
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
        title="Attachment Types"
        breadcrumb={[
          { label: 'EMR' },
          { label: 'Clinical Masters' },
          { label: 'Attachment Types' },
        ]}
        actions={
          <Button id="btnAddAttachmentType" variant="primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Add New
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card style={{ marginBottom: spacing.md }}>
        <FilterBar>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 160px',
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
                Name
              </label>
              <Input
                id="filterAttachmentTypeName"
                placeholder="Search by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
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
                Department
              </label>
              <Select
                value={filterDepartmentId}
                onChange={(val) => setFilterDepartmentId(Number(val))}
                options={[
                  { value: -1, label: '-- All Departments --' },
                  ...departmentLookup.map((opt) => ({
                    value: opt.Id,
                    label: opt.Text || opt.DepartmentName || opt.Description || `Dept #${opt.Id}`,
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
              <Button id="btnSearchAttachmentType" variant="primary" onClick={handleSearch} disabled={isLoading}>
                <i className="fas fa-search" style={{ marginRight: 6 }}></i> Search
              </Button>
              <Button id="btnResetAttachmentType" variant="outline" onClick={handleReset} disabled={isLoading}>
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
                  Name
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Description
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Department
                </th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.textMuted }}>
                  Reference Link
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
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }}></i> Loading attachment types...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No attachment types found.
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
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500, color: colors.textMain }}>
                      {row.Name}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.Description || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.Department?.DepartmentName || row.Department?.Text || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.textMuted }}>
                      {row.ReferrenceLink ? (
                        <a
                          href={row.ReferrenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: colors.primary, textDecoration: 'underline' }}
                        >
                          {row.ReferrenceLink.length > 35
                            ? `${row.ReferrenceLink.substring(0, 32)}...`
                            : row.ReferrenceLink}
                        </a>
                      ) : (
                        '-'
                      )}
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
                            row.ActiveStatus?.Description === 'Active' || row.IsActive
                              ? '#dcfce7'
                              : '#fee2e2',
                          color:
                            row.ActiveStatus?.Description === 'Active' || row.IsActive
                              ? '#166534'
                              : '#991b1b',
                        }}
                      >
                        {row.ActiveStatus?.Description || (row.IsActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: spacing.xs }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(row)}
                          title="Edit Attachment Type"
                          style={{ padding: '4px 8px' }}
                        >
                          <i className="fa fa-pencil-alt" aria-hidden="true"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(row)}
                          title="Delete Attachment Type"
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
        title={modalForm.Id > 0 ? 'Edit Attachment Type' : 'Add Attachment Type'}
        width="650px"
        portal={true}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal} disabled={isSaving} id="btnSaveAttModal">
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
          {/* Name */}
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
              Name <span style={{ color: colors.danger }}>*</span>
            </label>
            <Input
              id="inputModalAttName"
              value={modalForm.Name}
              onChange={(e) => {
                setModalForm({ ...modalForm, Name: e.target.value });
                if (formErrors.Name) setFormErrors({ ...formErrors, Name: '' });
              }}
              placeholder="Enter attachment type name"
            />
            {formErrors.Name && (
              <span id="errModalAttName" className="validation-error" style={{ fontSize: '0.75rem', color: colors.danger, marginTop: spacing.xs, display: 'block' }}>
                {formErrors.Name}
              </span>
            )}
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
              id="inputModalAttDesc"
              value={modalForm.Description}
              onChange={(e) => setModalForm({ ...modalForm, Description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          {/* Department */}
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
              Department
            </label>
            <Select
              value={modalForm.DepartmentId}
              onChange={(val) => setModalForm({ ...modalForm, DepartmentId: Number(val) })}
              options={[
                { value: -1, label: '-- Select Department --' },
                ...departmentLookup.map((opt) => ({
                  value: opt.Id,
                  label: opt.Text || opt.DepartmentName || opt.Description || `Dept #${opt.Id}`,
                })),
              ]}
            />
          </div>

          {/* Reference Link */}
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
              Reference Link
            </label>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Input
                value={modalForm.ReferrenceLink}
                onChange={(e) => setModalForm({ ...modalForm, ReferrenceLink: e.target.value })}
                placeholder="https://example.com"
                style={{ flex: 1 }}
              />
              {modalForm.ReferrenceLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(modalForm.ReferrenceLink, '_blank')}
                  title="Check Link"
                >
                  <i className="fa fa-external-link-alt"></i>
                </Button>
              )}
            </div>
          </div>

          {/* Comments / Special Instructions */}
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
              Comments
            </label>
            <textarea
              value={modalForm.SpecialInstruction}
              onChange={(e) => setModalForm({ ...modalForm, SpecialInstruction: e.target.value })}
              placeholder="Enter comments or special instructions..."
              rows={3}
              style={{
                width: '100%',
                padding: spacing.sm,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border}`,
                fontFamily: 'inherit',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* IsActive */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <input
              type="checkbox"
              id="attachmentTypeIsActive"
              checked={modalForm.IsActive}
              onChange={(e) => setModalForm({ ...modalForm, IsActive: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label
              htmlFor="attachmentTypeIsActive"
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
          message={`Are you sure you want to delete attachment type "${deleteTarget.Name}"?`}
          yesLabel={isDeleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />
      )}
    </div>
  );
};
export default AttachmentTypeListScreen;
