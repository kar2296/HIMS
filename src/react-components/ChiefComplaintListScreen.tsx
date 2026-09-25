import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  ChiefComplaint?: string;
  ChiefComplaintCategoryId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface ChiefComplaintRow {
  Id: number;
  Code?: string;
  ChiefComplaint?: string;
  ChiefComplaintCategoryId?: number;
  ChiefComplaintCategory?: { Id?: number; Description?: string };
  Description?: string;
  ReferrenceLink?: string;
  BodySite?: string;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string };
  IsActive?: boolean;
}

interface ChiefComplaintListScreenProps {
  reactProps?: {
    items?: ChiefComplaintRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: {
      ChiefComplaintCategory?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ChiefComplaintListScreen: React.FC<ChiefComplaintListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<ChiefComplaintRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ChiefComplaintCategory: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({ ChiefComplaintCategory: [], ActiveStatus: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup = standaloneLookups,
  } = reactProps || {};

  const categoryOptions = lookup?.ChiefComplaintCategory || standaloneLookups.ChiefComplaintCategory;
  const activeStatusOptions = lookup?.ActiveStatus || standaloneLookups.ActiveStatus;

  const [nameFilter, setNameFilter] = useState(currentfilter.ChiefComplaint || '');
  const [categoryFilter, setCategoryFilter] = useState<number>(currentfilter.ChiefComplaintCategoryId ?? -1);
  const [statusFilter, setStatusFilter] = useState<number>(currentfilter.ActiveStatusId ?? 2);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChiefComplaintRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalCategoryId, setModalCategoryId] = useState<number | undefined>(undefined);
  const [modalDescription, setModalDescription] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Lookups for standalone mode
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [
            { Key: 'ChiefComplaintCategory' },
            { Key: 'ActiveStatus' }
          ],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookups({
              ChiefComplaintCategory: res.ChiefComplaintCategory || [],
              ActiveStatus: res.ActiveStatus || []
            });
          }
        }).catch(err => {
          console.error('Error fetching ChiefComplaint lookups:', err);
        });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch data for standalone mode
  const fetchData = async (name = nameFilter, category = categoryFilter, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [
        { Key: 1, Value: name },
        { Key: 2, Value: category },
        { Key: 3, Value: status }
      ];
      const res: any = await callBackendApi({
        action: 'clinicalmaster/chiefcomplaint/GetChiefComplaints',
        data: {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: page }
        },
        type: 'post'
      });
      if (res?.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error loading chief complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reactProps?.items) {
      fetchData();
    }
  }, [reactProps?.items]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(nameFilter, categoryFilter, statusFilter, 1);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalCode('');
    setModalName('');
    setModalCategoryId(categoryOptions[0]?.Id);
    setModalDescription('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: ChiefComplaintRow) => {
    setEditingItem(row);
    setModalCode(row.Code || '');
    setModalName(row.ChiefComplaint || '');
    setModalCategoryId(row.ChiefComplaintCategoryId ?? row.ChiefComplaintCategory?.Id);
    setModalDescription(row.Description || '');
    setModalIsActive(row.IsActive ?? (row.ActiveStatusId === 2));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!modalName.trim() || !modalCategoryId) {
      setModalError('Chief Complaint Name and Category are required.');
      return;
    }
    setModalError('');
    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        Code: modalCode.trim(),
        ChiefComplaint: modalName.trim(),
        ChiefComplaintCategoryId: Number(modalCategoryId),
        Description: modalDescription.trim(),
        IsActive: modalIsActive,
        ActiveStatusId: modalIsActive ? 2 : 1
      };

      if (editingItem?.Id) {
        payload.Id = editingItem.Id;
        await callBackendApi({
          action: 'clinicalmaster/chiefcomplaint/UpdateChiefComplaint',
          data: { Data: payload },
          type: 'post'
        });
      } else {
        await callBackendApi({
          action: 'clinicalmaster/chiefcomplaint/AddChiefComplaint',
          data: { Data: payload },
          type: 'post'
        });
      }

      setIsModalOpen(false);
      fetchData(nameFilter, categoryFilter, statusFilter, currentPage);
    } catch (err: any) {
      console.error('Error saving chief complaint:', err);
      setModalError(err.message || 'Failed to save chief complaint.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: ChiefComplaintRow) => {
    if (window.confirm(`Are you sure you want to delete "${row.ChiefComplaint}"?`)) {
      try {
        const { callBackendApi } = await import('../services/apiService');
        await callBackendApi({
          action: 'clinicalmaster/chiefcomplaint/DeleteChiefComplaint',
          data: { Id: row.Id },
          type: 'post'
        });
        fetchData(nameFilter, categoryFilter, statusFilter, currentPage);
      } catch (err) {
        console.error('Error deleting chief complaint:', err);
        alert('Failed to delete chief complaint.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, color: colors.textMain }}>
      <PageHeader
        title="Chief Complaints"
        actions={
          <Button
            id="btnAddNewChiefComplaint"
            variant="primary"
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            Add New
          </Button>
        }
      />

      <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
        <FilterBar>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end', width: '100%' }}>
            {/* Category Filter */}
            <div style={{ minWidth: 200, flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Category
              </label>
              <Select
                id="filterComplaintCategory"
                value={categoryFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setCategoryFilter(num);
                  fetchData(nameFilter, num, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Categories' },
                  ...categoryOptions.map(c => ({ value: c.Id.toString(), label: c.Text }))
                ]}
              />
            </div>

            {/* Complaint Name Search */}
            <div style={{ minWidth: 220, flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Chief Complaint Name
              </label>
              <Input
                id="filterComplaintName"
                placeholder="Search complaint..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Status
              </label>
              <Select
                id="filterComplaintStatus"
                value={statusFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setStatusFilter(num);
                  fetchData(nameFilter, categoryFilter, num, 1);
                }}
                options={[
                  { value: '-1', label: 'All Status' },
                  ...activeStatusOptions.map(s => ({ value: s.Id.toString(), label: s.Text }))
                ]}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button id="btnSearchComplaint" variant="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNameFilter('');
                  setCategoryFilter(-1);
                  setStatusFilter(2);
                  fetchData('', -1, 2, 1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </FilterBar>
      </Card>

      {/* Grid Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} id="tableChiefComplaints">
            <thead>
              <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Code</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Chief Complaint</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Category</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Description</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center', fontWeight: 600, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    Loading chief complaints...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No chief complaints found.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.Id}
                    style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500 }}>{row.Code || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.primary }}>{row.ChiefComplaint || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.ChiefComplaintCategory?.Description || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.Description || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor: row.ActiveStatusId === 2 ? '#e6f4ea' : '#fce8e6',
                          color: row.ActiveStatusId === 2 ? '#137333' : '#c5221f'
                        }}
                      >
                        {row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.xs }}>
                        <button
                          className="btnEditComplaint"
                          onClick={() => handleEdit(row)}
                          title="Edit"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: colors.primary,
                            padding: 4
                          }}
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                        <button
                          className="btnDeleteComplaint"
                          onClick={() => handleDelete(row)}
                          title="Delete"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d93025',
                            padding: 4
                          }}
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </button>
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
              fetchData(nameFilter, categoryFilter, statusFilter, page);
            }}
          />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalChiefComplaint"
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
            zIndex: 9999
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {editingItem ? 'Edit Chief Complaint' : 'Add Chief Complaint'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: colors.textMuted
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: spacing.lg, maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
              {modalError && (
                <div
                  id="complaintValidationAlert"
                  style={{
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                    backgroundColor: '#fce8e6',
                    color: '#c5221f',
                    borderRadius: 4,
                    fontSize: 13
                  }}
                >
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Category <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Select
                    id="ddlComplaintCategory"
                    value={modalCategoryId ? modalCategoryId.toString() : ''}
                    onChange={(val) => setModalCategoryId(Number(val))}
                    options={categoryOptions.map(c => ({ value: c.Id.toString(), label: c.Text }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Chief Complaint Name <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Input
                    id="txtComplaintName"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Chest Pain / Fever / Headache"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Code
                  </label>
                  <Input
                    id="txtComplaintCode"
                    value={modalCode}
                    onChange={(e) => setModalCode(e.target.value)}
                    placeholder="e.g. CC-01"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Description
                  </label>
                  <Input
                    id="txtComplaintDescription"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Brief clinical description"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <input
                    type="checkbox"
                    id="chkComplaintIsActive"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                  />
                  <label htmlFor="chkComplaintIsActive" style={{ fontSize: 13, cursor: 'pointer' }}>
                    Active Status
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                backgroundColor: colors.surfaceSunken
              }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setModalCode('');
                  setModalName('');
                  setModalDescription('');
                  setModalIsActive(true);
                }}
              >
                Clear
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                id="btnSaveComplaint"
                variant="primary"
                onClick={handleSaveModal}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
