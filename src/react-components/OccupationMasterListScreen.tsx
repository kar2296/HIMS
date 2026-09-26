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
  ActiveStatusId?: number;
  Occupations?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface OccupationRow {
  Id: number;
  Code?: string;
  ShortCode?: string;
  Occupations?: string;
  ActiveStatusId?: number;
  OccupationTypeId?: number;
  OccupationType?: { Description?: string };
  ActiveStatus?: { Description?: string };
}

interface OccupationMasterListScreenProps {
  reactProps?: {
    items?: OccupationRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OccupationMasterListScreen: React.FC<OccupationMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<OccupationRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [occupations, setOccupations] = useState(currentfilter.Occupations || '');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Standalone Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OccupationRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalShortCode, setModalShortCode] = useState('');
  const [modalOccupations, setModalOccupations] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirm delete modal
  const [itemToDelete, setItemToDelete] = useState<OccupationRow | null>(null);

  const fetchData = async (occ = occupations, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (occ) params.push({ Key: 4, Value: occ });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 6, Value: status });

      const res: any = await callBackendApi({
        action: 'GeneralMaster/Occupation/GetOccupations',
        data: {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: page }
        },
        type: 'post'
      });
      if (res?.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error loading occupations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reactProps?.items) {
      fetchData();
    }
  }, [reactProps]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    }
    setEditingItem(null);
    setModalCode('');
    setModalShortCode('');
    setModalOccupations('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: OccupationRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalCode(row.Code || '');
    setModalShortCode(row.ShortCode || '');
    setModalOccupations(row.Occupations || '');
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = (row: OccupationRow) => {
    if (onAction) {
      onAction('delete', row);
      return;
    }
    setItemToDelete(row);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'GeneralMaster/Occupation/DeleteOccupation',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting occupation master:', err);
    }
  };

  const handleModalSave = async (activeStatusId: number = 2) => {
    if (!modalOccupations.trim() || !modalCode.trim()) {
      setModalError('Occupation Name and Code are required.');
      return;
    }
    setIsSaving(true);
    setModalError('');
    try {
      const { callBackendApi } = await import('../services/apiService');
      const isUpdate = !!editingItem?.Id;
      const payload = {
        Data: {
          Id: editingItem?.Id || 0,
          Code: modalCode.trim().toUpperCase(),
          ShortCode: modalShortCode.trim().toUpperCase() || modalCode.trim().toUpperCase(),
          Occupations: modalOccupations.trim(),
          OccupationTypeId: editingItem?.OccupationTypeId || 1,
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/Occupation/UpdateOccupation' : 'GeneralMaster/Occupation/AddOccupation',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving occupation record.');
    }
  };

  const totalItems = pagerObj.totalItems || standaloneTotal;
  const pageSize = pagerObj.pageSize || 25;
  const displayItems = reactProps?.items || standaloneItems;

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
  };
  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Occupation Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button id="btnOccupationDashboard" variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
            <Button id="btnAddOccupation" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Select
              id="ddlOccupationFilterStatus"
              label="Status"
              value={statusFilter != null ? String(statusFilter) : ''}
              options={activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => {
                const val = v ? parseInt(String(v), 10) : undefined;
                setStatusFilter(val);
                dispatch('statusFilterChange', { value: val });
                fetchData(occupations, val, 1);
              }}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Input
              id="txtOccupationSearch"
              label="Occupations"
              value={occupations}
              onChange={(e) => setOccupations(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  fetchData(occupations, statusFilter, 1);
                }
              }}
              placeholder="Search occupations"
            />
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblOccupationMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Short Code</th>
                <th style={thStyle}>Occupations</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td style={tdStyle} colSpan={6}>Loading occupations...</td></tr>
              )}
              {!isLoading && displayItems.length === 0 && (
                <tr><td style={tdStyle} colSpan={6}>No records found.</td></tr>
              )}
              {!isLoading && displayItems.map((row) => (
                <tr key={row.Id} id={`occupationRow_${row.Id}`}>
                  <td style={tdStyle}>{row.OccupationType?.Description || 'General'}</td>
                  <td style={tdStyle}>{row.Code}</td>
                  <td style={tdStyle}>{row.ShortCode}</td>
                  <td style={tdStyle}>{row.Occupations}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 1 ? 'Approved' : 'Active')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <span
                        id={`btnEditOccupation_${row.Id}`}
                        className="grid-action" style={{ cursor: 'pointer' }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                      >
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                      </span>
                      {(row.ActiveStatusId === 1 || row.ActiveStatusId === 2 || row.ActiveStatusId === 3 || row.ActiveStatusId === undefined) && (
                        <span
                          id={`btnDeleteOccupation_${row.Id}`}
                          className="grid-action" style={{ cursor: 'pointer' }}
                          onClick={() => handleDelete(row)}
                          title="Delete"
                        >
                          <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            dispatch('pageChange', { page });
            fetchData(occupations, statusFilter, page);
          }}
        />
      </Card>

      {/* Standalone Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalOccupationMaster"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: spacing.md
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: spacing.xl,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.textMain }}>
                {editingItem ? 'Edit Occupation' : 'Add Occupation'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: colors.textMuted }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div id="occupationModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalOccupationCode"
                label="Code"
                required
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value)}
                placeholder="e.g. DOC, ENG, TCH"
              />
              <Input
                id="txtModalOccupationShortCode"
                label="Short Code"
                value={modalShortCode}
                onChange={(e) => setModalShortCode(e.target.value)}
                placeholder="e.g. DOC"
              />
              <Input
                id="txtModalOccupationName"
                label="Occupation"
                required
                value={modalOccupations}
                onChange={(e) => setModalOccupations(e.target.value)}
                placeholder="e.g. Doctor, Engineer, Teacher"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalOccupationActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalOccupationActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelOccupationModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveApproveOccupationModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 2 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete occupation ${itemToDelete?.Occupations} (${itemToDelete?.Code})?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
