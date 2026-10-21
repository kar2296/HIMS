import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';
import { ConfirmModal } from './ConfirmModal';

// ─── Types ──────────────────────────────────────────────────────────────────
interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  FacilityId?: number;
  FeedbackTypeId?: number;
  FeedbackCategoryId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface FeedbackMasterRow {
  Id: number;
  FacilityId?: number;
  Facility?: { Id?: number; FacilityName?: string };
  FeedbackTypeId?: number;
  FeedbackType?: { Id?: number; Description?: string };
  FeedbackCategoryId?: number;
  FeedbackCategory?: { Id?: number; Description?: string };
  Feedbacks?: string;
  Description?: string;
  IsActive?: boolean;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string };
}

interface FeedbackMasterListScreenProps {
  reactProps?: {
    items?: FeedbackMasterRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: {
      Facility?: LookupItem[];
      FeedbackType?: LookupItem[];
      FeedbackCategory?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// ─── Toast (lightweight, inline) ────────────────────────────────────────────
const useInlineToast = () => {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 2800);
  }, []);
  const node = toast ? (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 10000,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: 8,
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        backgroundColor: toast.type === 'success' ? '#e6f4ea' : '#fce8e6',
        color: toast.type === 'success' ? '#137333' : '#c5221f',
        fontSize: 13,
        fontWeight: 500,
        maxWidth: 360,
      }}
    >
      {toast.msg}
    </div>
  ) : null;
  return { show, node };
};

// ─── Main Screen ────────────────────────────────────────────────────────────
export const FeedbackMasterListScreen: React.FC<FeedbackMasterListScreenProps> = ({ reactProps, onAction }) => {
  // ─── Standalone data state (when running outside AngularJS wrapper) ───────
  const [standaloneItems, setStandaloneItems] = useState<FeedbackMasterRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Facility: LookupItem[];
    FeedbackType: LookupItem[];
    FeedbackCategory: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({ Facility: [], FeedbackType: [], FeedbackCategory: [], ActiveStatus: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup = standaloneLookups,
  } = reactProps || {};

  const facilityOptions = lookup?.Facility || standaloneLookups.Facility;
  const feedbackTypeOptions = lookup?.FeedbackType || standaloneLookups.FeedbackType;
  const feedbackCategoryOptions = lookup?.FeedbackCategory || standaloneLookups.FeedbackCategory;
  const activeStatusOptions = lookup?.ActiveStatus || standaloneLookups.ActiveStatus;

  // ─── Filter state ─────────────────────────────────────────────────────────
  const [facilityFilter, setFacilityFilter] = useState<number>(currentfilter.FacilityId ?? 1);
  const [typeFilter, setTypeFilter] = useState<number>(currentfilter.FeedbackTypeId ?? -1);
  const [categoryFilter, setCategoryFilter] = useState<number>(currentfilter.FeedbackCategoryId ?? -1);
  const [statusFilter, setStatusFilter] = useState<number>(currentfilter.ActiveStatusId ?? 2);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // ─── Modal state (Add/Edit) ───────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedbackMasterRow | null>(null);
  const [modalFacilityId, setModalFacilityId] = useState<number | undefined>(undefined);
  const [modalTypeId, setModalTypeId] = useState<number | undefined>(undefined);
  const [modalCategoryId, setModalCategoryId] = useState<number | undefined>(undefined);
  const [modalFeedbacks, setModalFeedbacks] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ─── Delete confirmation state ────────────────────────────────────────────
  const [itemToDelete, setItemToDelete] = useState<FeedbackMasterRow | null>(null);
  const toast = useInlineToast();

  // ─── Fetch Lookups (standalone mode) ──────────────────────────────────────
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [
            { Key: 'Facility' },
            { Key: 'FeedbackType' },
            { Key: 'FeedbackCategory' },
            { Key: 'ActiveStatus' },
          ],
          type: 'post',
        })
          .then((res: any) => {
            if (res) {
              setStandaloneLookups({
                Facility: res.Facility || [],
                FeedbackType: res.FeedbackType || [],
                FeedbackCategory: res.FeedbackCategory || [],
                ActiveStatus: res.ActiveStatus || [],
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching FeedbackMaster lookups:', err);
          });
      });
    }
  }, [reactProps?.lookup]);

  // ─── Fetch list data (standalone mode) ────────────────────────────────────
  const fetchData = async (
    facility = facilityFilter,
    type = typeFilter,
    category = categoryFilter,
    status = statusFilter,
    page = currentPage
  ) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [
        { Key: 1, Value: facility },
        { Key: 2, Value: category },
        { Key: 3, Value: type },
        { Key: 4, Value: status },
      ];
      const res: any = await callBackendApi({
        action: 'generalmaster/FeedbacksMaster/GetFeedbacksMasters',
        data: {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: page },
        },
        type: 'post',
      });
      if (res?.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error loading feedback masters:', err);
      toast.show('Failed to load feedback masters.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reactProps?.items) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactProps?.items]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingItem(null);
    setModalFacilityId(facilityFilter > 0 ? facilityFilter : facilityOptions[0]?.Id);
    setModalTypeId(feedbackTypeOptions[0]?.Id);
    setModalCategoryId(feedbackCategoryOptions[0]?.Id);
    setModalFeedbacks('');
    setModalDescription('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = async (row: FeedbackMasterRow) => {
    // Fetch fresh item details (preserves original AngularJS behavior)
    try {
      const { callBackendApi } = await import('../services/apiService');
      const res: any = await callBackendApi({
        action: 'generalmaster/FeedbacksMaster/GetFeedbacksMasterById',
        data: { Id: row.Id },
        type: 'post',
      });
      const data = res?.Data || res || row;
      setEditingItem(data);
      setModalFacilityId(data.FacilityId ?? data.Facility?.Id);
      setModalTypeId(data.FeedbackTypeId ?? data.FeedbackType?.Id);
      setModalCategoryId(data.FeedbackCategoryId ?? data.FeedbackCategory?.Id);
      setModalFeedbacks(data.Feedbacks || '');
      setModalDescription(data.Description || '');
      setModalIsActive(data.IsActive ?? (data.ActiveStatusId === 2));
      setModalError('');
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading feedback master item:', err);
      // Fall back to the row data we already have
      setEditingItem(row);
      setModalFacilityId(row.FacilityId ?? row.Facility?.Id);
      setModalTypeId(row.FeedbackTypeId ?? row.FeedbackType?.Id);
      setModalCategoryId(row.FeedbackCategoryId ?? row.FeedbackCategory?.Id);
      setModalFeedbacks(row.Feedbacks || '');
      setModalDescription(row.Description || '');
      setModalIsActive(row.IsActive ?? (row.ActiveStatusId === 2));
      setModalError('');
      setIsModalOpen(true);
    }
  };

  const validateForm = (): string | null => {
    if (!modalFacilityId) return 'Facility is required.';
    if (!modalCategoryId) return 'Category is required.';
    if (!modalTypeId) return 'Type is required.';
    if (!modalFeedbacks.trim()) return 'Feedback name is required.';
    return null;
  };

  const doSave = async (approve: boolean) => {
    const validationError = validateForm();
    if (validationError) {
      setModalError(validationError);
      return;
    }
    setModalError('');
    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        FacilityId: Number(modalFacilityId),
        FeedbackTypeId: Number(modalTypeId),
        FeedbackCategoryId: Number(modalCategoryId),
        Feedbacks: modalFeedbacks.trim(),
        Description: modalDescription.trim(),
        IsActive: approve ? true : modalIsActive,
        ActiveStatusId: approve ? 2 : (modalIsActive ? 2 : 1),
      };

      if (editingItem?.Id) {
        payload.Id = editingItem.Id;
        await callBackendApi({
          action: 'generalmaster/FeedbacksMaster/UpdateFeedbacksMaster',
          data: { Data: payload },
          type: 'post',
        });
      } else {
        await callBackendApi({
          action: 'generalmaster/FeedbacksMaster/AddFeedbacksMaster',
          data: { Data: payload },
          type: 'post',
        });
      }

      toast.show('Saved successfully.', 'success');
      setIsModalOpen(false);
      fetchData(facilityFilter, typeFilter, categoryFilter, statusFilter, currentPage);
    } catch (err: any) {
      console.error('Error saving feedback master:', err);
      setModalError(err?.message || 'Failed to save feedback master.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => doSave(false);
  const handleSaveAndApprove = () => doSave(true);

  const handleDelete = (row: FeedbackMasterRow) => {
    setItemToDelete(row);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'generalmaster/FeedbacksMaster/DeleteFeedbacksMaster',
        data: { Id: itemToDelete.Id },
        type: 'post',
      });
      toast.show('Deleted successfully.', 'success');
      setItemToDelete(null);
      fetchData(facilityFilter, typeFilter, categoryFilter, statusFilter, currentPage);
    } catch (err) {
      console.error('Error deleting feedback master:', err);
      toast.show('Failed to delete feedback master.', 'error');
    }
  };

  const resetFilters = () => {
    setFacilityFilter(1);
    setTypeFilter(-1);
    setCategoryFilter(-1);
    setStatusFilter(2);
    setCurrentPage(1);
    fetchData(1, -1, -1, 2, 1);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: `${spacing.lg} ${spacing.xl} 40px`,
        color: colors.textMain,
      }}
    >
      {toast.node}

      <PageHeader
        title="Feedback Masters"
        subtitle="Manage patient feedback categories, types and templates"
        actions={
          <Button
            id="btnAddNewFeedback"
            variant="primary"
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            Add Feedback
          </Button>
        }
      />

      {/* ─── Filters Card ───────────────────────────────────────────────── */}
      <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
        <FilterBar>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.md,
              alignItems: 'flex-end',
              width: '100%',
            }}
          >
            {/* Feedback Type */}
            <div style={{ minWidth: 200, flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Feedback Type
              </label>
              <Select
                id="filterFeedbackType"
                value={typeFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setTypeFilter(num);
                  setCurrentPage(1);
                  fetchData(facilityFilter, num, categoryFilter, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Types' },
                  ...feedbackTypeOptions.map((t) => ({
                    value: t.Id.toString(),
                    label: t.Text,
                  })),
                ]}
              />
            </div>

            {/* Feedback Category */}
            <div style={{ minWidth: 200, flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Feedback Category
              </label>
              <Select
                id="filterFeedbackCategory"
                value={categoryFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setCategoryFilter(num);
                  setCurrentPage(1);
                  fetchData(facilityFilter, typeFilter, num, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Categories' },
                  ...feedbackCategoryOptions.map((c) => ({
                    value: c.Id.toString(),
                    label: c.Text,
                  })),
                ]}
              />
            </div>

            {/* Status */}
            <div style={{ minWidth: 160 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                Status
              </label>
              <Select
                id="filterFeedbackStatus"
                value={statusFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setStatusFilter(num);
                  setCurrentPage(1);
                  fetchData(facilityFilter, typeFilter, categoryFilter, num, 1);
                }}
                options={[
                  { value: '-1', label: 'All Status' },
                  ...activeStatusOptions.map((s) => ({
                    value: s.Id.toString(),
                    label: s.Text,
                  })),
                ]}
              />
            </div>

            {/* Reset */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </FilterBar>
      </Card>

      {/* ─── Grid Card ─────────────────────────────────────────────────── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
            id="tableFeedbackMasters"
          >
            <thead>
              <tr
                style={{
                  backgroundColor: colors.surfaceSunken,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <th style={thCellStyle}>Feedback Type</th>
                <th style={thCellStyle}>Category</th>
                <th style={thCellStyle}>Feedback</th>
                <th style={thCellStyle}>Description</th>
                <th style={thCellStyle}>Status</th>
                <th style={{ ...thCellStyle, textAlign: 'center', width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: spacing.xl,
                      color: colors.textMuted,
                    }}
                  >
                    Loading feedback masters...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: spacing.xl,
                      color: colors.textMuted,
                    }}
                  >
                    No feedback masters found.
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
                    <td style={tdCellStyle}>{row.FeedbackType?.Description || '-'}</td>
                    <td style={tdCellStyle}>{row.FeedbackCategory?.Description || '-'}</td>
                    <td style={{ ...tdCellStyle, color: colors.primary, fontWeight: 500 }}>
                      {row.Feedbacks || '-'}
                    </td>
                    <td style={tdCellStyle}>{row.Description || '-'}</td>
                    <td style={tdCellStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor:
                            row.ActiveStatusId === 2 ? '#e6f4ea' : '#fce8e6',
                          color: row.ActiveStatusId === 2 ? '#137333' : '#c5221f',
                        }}
                      >
                        {row.ActiveStatus?.Description ||
                          (row.ActiveStatusId === 2 ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: spacing.xs,
                        }}
                      >
                        <button
                          className="btnEditFeedback"
                          onClick={() => handleEdit(row)}
                          title="Edit"
                          style={iconBtnStyle(colors.primary)}
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                        {row.ActiveStatusId === 1 && (
                          <button
                            className="btnDeleteFeedback"
                            onClick={() => handleDelete(row)}
                            title="Delete"
                            style={iconBtnStyle('#d93025')}
                          >
                            <i className="fa fa-trash" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}` }}>
          <Pagination
            currentPage={currentPage}
            totalItems={pagerObj.totalItems || standaloneTotal}
            pageSize={pagerObj.pageSize || 25}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchData(facilityFilter, typeFilter, categoryFilter, statusFilter, page);
            }}
          />
        </div>
      </Card>

      {/* ─── Add / Edit Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          id="modalFeedbackMaster"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              width: '100%',
              maxWidth: 720,
              boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surfaceSunken,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.textMain }}>
                {editingItem ? 'Edit Feedback' : 'Add Feedback'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: colors.textMuted,
                  padding: 4,
                }}
                title="Close"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1 }}>
              {modalError && (
                <div
                  id="feedbackValidationAlert"
                  style={{
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                    backgroundColor: '#fce8e6',
                    color: '#c5221f',
                    borderRadius: 6,
                    fontSize: 13,
                    border: '1px solid #f5c6cb',
                  }}
                >
                  {modalError}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: spacing.md,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Facility <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Select
                    id="ddlFeedbackFacility"
                    value={modalFacilityId ? modalFacilityId.toString() : ''}
                    onChange={(val) => setModalFacilityId(Number(val))}
                    options={facilityOptions.map((f) => ({
                      value: f.Id.toString(),
                      label: f.Text,
                    }))}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Category <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Select
                    id="ddlFeedbackCategory"
                    value={modalCategoryId ? modalCategoryId.toString() : ''}
                    onChange={(val) => setModalCategoryId(Number(val))}
                    options={feedbackCategoryOptions.map((c) => ({
                      value: c.Id.toString(),
                      label: c.Text,
                    }))}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Type <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Select
                    id="ddlFeedbackType"
                    value={modalTypeId ? modalTypeId.toString() : ''}
                    onChange={(val) => setModalTypeId(Number(val))}
                    options={feedbackTypeOptions.map((t) => ({
                      value: t.Id.toString(),
                      label: t.Text,
                    }))}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Feedback Name <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Input
                    id="txtFeedbackName"
                    value={modalFeedbacks}
                    onChange={(e) => setModalFeedbacks(e.target.value)}
                    placeholder="e.g. Was the staff polite?"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <Input
                    id="txtFeedbackDescription"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Optional short description"
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingTop: spacing.sm,
                  }}
                >
                  <input
                    type="checkbox"
                    id="chkFeedbackIsActive"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label
                    htmlFor="chkFeedbackIsActive"
                    style={{ fontSize: 13, cursor: 'pointer', color: colors.textMain }}
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                backgroundColor: colors.surfaceSunken,
              }}
            >
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                id="btnSaveFeedback"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                id="btnSaveApproveFeedback"
                variant="primary"
                onClick={handleSaveAndApprove}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ───────────────────────────────────────── */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Feedback"
          message={`Are you sure you want to delete "${itemToDelete.Feedbacks || 'this feedback'}"?`}
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

// ─── Inline styles ──────────────────────────────────────────────────────────
const thCellStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`,
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  color: colors.textMuted,
};

const tdCellStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`,
  verticalAlign: 'middle',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  marginBottom: spacing.xs,
  color: colors.textMain,
};

const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: 'none',
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  cursor: 'pointer',
  color: color,
  padding: '6px 10px',
  fontSize: 13,
  transition: 'all 0.15s ease',
});

export default FeedbackMasterListScreen;
