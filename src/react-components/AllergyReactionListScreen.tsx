import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';
import { ConfirmModal } from './ConfirmModal';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  AllergyReactionName?: string;
  AllergyReactionTypeId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface AllergyReactionRow {
  Id: number;
  DisplayId?: string;
  AllergyReactionName?: string;
  AllergyReactionTypeId?: number;
  AllergyReactionType?: { Id?: number; Description?: string };
  Description?: string;
  ReferrenceLink?: string;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string };
  IsActive?: boolean;
  SpecialInstruction?: string;
}

interface AllergyReactionListScreenProps {
  reactProps?: {
    items?: AllergyReactionRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: {
      AllergyReactionType?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AllergyReactionListScreen: React.FC<AllergyReactionListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<AllergyReactionRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    AllergyReactionType: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({ AllergyReactionType: [], ActiveStatus: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup = standaloneLookups,
  } = reactProps || {};

  const reactionTypeOptions = lookup?.AllergyReactionType || standaloneLookups.AllergyReactionType;
  const activeStatusOptions = lookup?.ActiveStatus || standaloneLookups.ActiveStatus;

  const [nameFilter, setNameFilter] = useState(currentfilter.AllergyReactionName || '');
  const [typeFilter, setTypeFilter] = useState<number>(currentfilter.AllergyReactionTypeId ?? -1);
  const [statusFilter, setStatusFilter] = useState<number>(currentfilter.ActiveStatusId ?? 2);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AllergyReactionRow | null>(null);
  const [modalDisplayId, setModalDisplayId] = useState('');
  const [modalReactionName, setModalReactionName] = useState('');
  const [modalTypeId, setModalTypeId] = useState<number | undefined>(undefined);
  const [modalRefLink, setModalRefLink] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalComments, setModalComments] = useState('');
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
            { Key: 'AllergyReactionType' },
            { Key: 'ActiveStatus' }
          ],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookups({
              AllergyReactionType: res.AllergyReactionType || [],
              ActiveStatus: res.ActiveStatus || []
            });
          }
        }).catch(err => {
          console.error('Error fetching AllergyReaction lookups:', err);
        });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch data for standalone mode
  const fetchData = async (name = nameFilter, type = typeFilter, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [
        { Key: 1, Value: name },
        { Key: 2, Value: type },
        { Key: 3, Value: status }
      ];
      const res: any = await callBackendApi({
        action: 'clinicalmaster/AllergyReaction/GetAllergyReactions',
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
      console.error('Error loading allergy reactions:', err);
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
    fetchData(nameFilter, typeFilter, statusFilter, 1);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalDisplayId(`AR-${Date.now().toString().slice(-4)}`);
    setModalReactionName('');
    setModalTypeId(reactionTypeOptions[0]?.Id || 1);
    setModalRefLink('');
    setModalDescription('');
    setModalComments('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: AllergyReactionRow) => {
    setEditingItem(row);
    setModalDisplayId(row.DisplayId || '');
    setModalReactionName(row.AllergyReactionName || '');
    setModalTypeId(row.AllergyReactionTypeId ?? row.AllergyReactionType?.Id);
    setModalRefLink(row.ReferrenceLink || '');
    setModalDescription(row.Description || '');
    setModalComments(row.SpecialInstruction || '');
    setModalIsActive(row.IsActive ?? (row.ActiveStatusId === 2));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!modalDisplayId.trim() || !modalReactionName.trim() || !modalTypeId) {
      setModalError('Display ID, Reaction Name, and Reaction Type are required.');
      return;
    }
    setModalError('');
    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        DisplayId: modalDisplayId.trim(),
        AllergyReactionName: modalReactionName.trim(),
        AllergyReactionTypeId: Number(modalTypeId),
        ReferrenceLink: modalRefLink.trim(),
        Description: modalDescription.trim(),
        SpecialInstruction: modalComments.trim(),
        IsActive: modalIsActive,
        ActiveStatusId: modalIsActive ? 2 : 1
      };

      if (editingItem?.Id) {
        payload.Id = editingItem.Id;
        await callBackendApi({
          action: 'clinicalmaster/AllergyReaction/UpdateAllergyReaction',
          data: { Data: payload },
          type: 'post'
        });
      } else {
        await callBackendApi({
          action: 'clinicalmaster/AllergyReaction/AddAllergyReaction',
          data: { Data: payload },
          type: 'post'
        });
      }

      setIsModalOpen(false);
      fetchData(nameFilter, typeFilter, statusFilter, currentPage);
    } catch (err: any) {
      console.error('Error saving allergy reaction:', err);
      setModalError(err.message || 'Failed to save allergy reaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const [itemToDelete, setItemToDelete] = useState<AllergyReactionRow | null>(null);

  const handleDelete = (row: AllergyReactionRow) => {
    setItemToDelete(row);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'clinicalmaster/AllergyReaction/DeleteAllergyReaction',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData(nameFilter, typeFilter, statusFilter, currentPage);
    } catch (err) {
      console.error('Error deleting allergy reaction:', err);
      alert('Failed to delete allergy reaction.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, color: colors.textMain }}>
      <PageHeader
        title="Allergy Reactions"
        actions={
          <Button
            id="btnAddNewReaction"
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
            {/* Reaction Type Filter */}
            <div style={{ minWidth: 200, flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Reaction Type
              </label>
              <Select
                id="filterReactionType"
                value={typeFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setTypeFilter(num);
                  fetchData(nameFilter, num, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Types' },
                  ...reactionTypeOptions.map(t => ({ value: t.Id.toString(), label: t.Text }))
                ]}
              />
            </div>

            {/* Reaction Name / Display ID Search */}
            <div style={{ minWidth: 220, flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Reaction Name / Code
              </label>
              <Input
                id="filterReactionName"
                placeholder="Search name or display ID..."
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
                id="filterReactionStatus"
                value={statusFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setStatusFilter(num);
                  fetchData(nameFilter, typeFilter, num, 1);
                }}
                options={[
                  { value: '-1', label: 'All Status' },
                  ...activeStatusOptions.map(s => ({ value: s.Id.toString(), label: s.Text }))
                ]}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button id="btnSearchReaction" variant="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNameFilter('');
                  setTypeFilter(-1);
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} id="tableAllergyReactions">
            <thead>
              <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Display ID</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Reaction Name</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Type</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Description</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Reference Link</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center', fontWeight: 600, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    Loading allergy reactions...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No allergy reactions found.
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
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 500 }}>{row.DisplayId || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.primary }}>{row.AllergyReactionName || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.AllergyReactionType?.Description || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.Description || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                      {row.ReferrenceLink ? (
                        <a href={row.ReferrenceLink} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>
                          Link
                        </a>
                      ) : '-'}
                    </td>
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
                          className="btnEditReaction"
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
                          className="btnDeleteReaction"
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
              fetchData(nameFilter, typeFilter, statusFilter, page);
            }}
          />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalAllergyReaction"
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
              maxWidth: 580,
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
                {editingItem ? 'Edit Allergy Reaction' : 'Add Allergy Reaction'}
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
                  id="reactionValidationAlert"
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
                    Display ID <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Input
                    id="txtReactionDisplayId"
                    value={modalDisplayId}
                    onChange={(e) => setModalDisplayId(e.target.value)}
                    placeholder="e.g. AR-01"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Reaction Name <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Input
                    id="txtReactionName"
                    value={modalReactionName}
                    onChange={(e) => setModalReactionName(e.target.value)}
                    placeholder="e.g. Skin Rash / Anaphylaxis"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Reaction Type <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Select
                    id="ddlReactionType"
                    value={modalTypeId ? modalTypeId.toString() : ''}
                    onChange={(val) => setModalTypeId(Number(val))}
                    options={reactionTypeOptions.map(t => ({ value: t.Id.toString(), label: t.Text }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Reference Link
                  </label>
                  <Input
                    id="txtReactionRefLink"
                    value={modalRefLink}
                    onChange={(e) => setModalRefLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Description
                  </label>
                  <Input
                    id="txtReactionDescription"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Brief clinical description"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Comments / Instructions
                  </label>
                  <textarea
                    id="txtReactionComments"
                    value={modalComments}
                    onChange={(e) => setModalComments(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      borderRadius: 4,
                      border: `1px solid ${colors.border}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Special instructions or clinical remarks"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <input
                    type="checkbox"
                    id="chkReactionIsActive"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                  />
                  <label htmlFor="chkReactionIsActive" style={{ fontSize: 13, cursor: 'pointer' }}>
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
                  setModalDisplayId('');
                  setModalReactionName('');
                  setModalRefLink('');
                  setModalDescription('');
                  setModalComments('');
                  setModalIsActive(true);
                }}
              >
                Clear
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                id="btnSaveReaction"
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

      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Allergy Reaction"
          message={`Are you sure you want to delete "${itemToDelete.AllergyReactionName}"?`}
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
