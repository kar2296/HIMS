import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
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
  CountryId?: number;
  StateId?: number;
  CityId?: number;
  ActiveStatusId?: number;
  StateCode?: string;
  StateName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface StateRow {
  Id: number;
  StateCode?: string;
  StateName?: string;
  CountryId?: number;
  ActiveStatusId?: number;
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface StateMasterListScreenProps {
  reactProps?: {
    items?: StateRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const StateMasterListScreen: React.FC<StateMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<StateRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [stateCode, setStateCode] = useState(currentfilter.StateCode || '');
  const [stateName, setStateName] = useState(currentfilter.StateName || '');
  const [filterCountryId, setFilterCountryId] = useState<number | undefined>(currentfilter.CountryId);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Standalone Add/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StateRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalCountryId, setModalCountryId] = useState<number | null>(null);
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirm delete modal state
  const [itemToDelete, setItemToDelete] = useState<StateRow | null>(null);

  const fetchData = async (code = stateCode, name = stateName, countryId = filterCountryId, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (code) params.push({ Key: 3, Value: code });
      if (name) params.push({ Key: 4, Value: name });
      if (countryId !== undefined && countryId !== null && countryId !== -1) params.push({ Key: 2, Value: countryId });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 5, Value: status });

      const res: any = await callBackendApi({
        action: 'GeneralMaster/StateMaster/GetStateMasters',
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
      console.error('Error loading state masters:', err);
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
    setModalName('');
    setModalCountryId(1);
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: StateRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalCode(row.StateCode || '');
    setModalName(row.StateName || '');
    setModalCountryId(row.CountryId || 1);
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = (row: StateRow) => {
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
        action: 'GeneralMaster/StateMaster/DeleteStateMaster',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting state master:', err);
    }
  };

  const handleModalSave = async (activeStatusId: number = 1) => {
    if (!modalCode.trim() || !modalName.trim()) {
      setModalError('State Code and State Name are required.');
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
          StateCode: modalCode.trim().toUpperCase(),
          StateName: modalName.trim(),
          CountryId: modalCountryId || 1,
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/StateMaster/UpdateStateMaster' : 'GeneralMaster/StateMaster/AddStateMaster',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving state record.');
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
        title="State Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button id="btnStateDashboard" variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
            <Button id="btnAddState" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              id="txtStateCodeSearch"
              label="State Code"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  fetchData(stateCode, stateName, filterCountryId, statusFilter, 1);
                }
              }}
              placeholder="Search code"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              id="ddlStateFilterCountry"
              countryid={filterCountryId ?? null}
              onUpdate={(u) => {
                const cId = u.countryid ?? undefined;
                setFilterCountryId(cId);
                dispatch('locationFilterChange', { CountryId: cId });
                fetchData(stateCode, stateName, cId, statusFilter, 1);
              }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              id="ddlStateFilterStatus"
              label="Status"
              value={statusFilter != null ? String(statusFilter) : ''}
              options={activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => {
                const val = v ? parseInt(String(v), 10) : undefined;
                setStatusFilter(val);
                dispatch('statusFilterChange', { value: val });
                fetchData(stateCode, stateName, filterCountryId, val, 1);
              }}
              placeholder="All"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              id="btnStateSearch"
              variant="secondary"
              onClick={() => {
                setCurrentPage(1);
                fetchData(stateCode, stateName, filterCountryId, statusFilter, 1);
              }}
            >
              Search
            </Button>
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblStateMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>State Code</th>
                <th style={thStyle}>State Name</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td style={tdStyle} colSpan={5}>Loading state masters...</td></tr>
              )}
              {!isLoading && displayItems.length === 0 && (
                <tr><td style={tdStyle} colSpan={5}>No records found.</td></tr>
              )}
              {!isLoading && displayItems.map((row) => (
                <tr key={row.Id} id={`stateRow_${row.Id}`}>
                  <td style={tdStyle}>{row.StateCode}</td>
                  <td style={tdStyle}>{row.StateName}</td>
                  <td style={tdStyle}>{row.CountryMaster?.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 1 ? 'Approved' : 'Active')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <span
                        id={`btnEditState_${row.Id}`}
                        className="grid-action" style={{ cursor: 'pointer' }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                      >
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                      </span>
                      {(row.ActiveStatusId === 1 || row.ActiveStatusId === 2 || row.ActiveStatusId === 3 || row.ActiveStatusId === undefined) && (
                        <span
                          id={`btnDeleteState_${row.Id}`}
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
            fetchData(stateCode, stateName, filterCountryId, statusFilter, page);
          }}
        />
      </Card>

      {/* Standalone Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalStateMaster"
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
                {editingItem ? 'Edit State Master' : 'Add State Master'}
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
              <div id="stateModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalStateCode"
                label="State Code"
                required
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value)}
                placeholder="e.g. TN, KA, MH"
              />
              <Input
                id="txtModalStateName"
                label="State Name"
                required
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="e.g. Tamil Nadu, Karnataka"
              />
              <div>
                <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
                <CountryControl
                  id="ddlModalStateCountry"
                  countryid={modalCountryId}
                  onUpdate={(u) => setModalCountryId(u.countryid ?? 1)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalStateActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalStateActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelStateModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveApproveStateModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 1 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete state ${itemToDelete?.StateName} (${itemToDelete?.StateCode})?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
