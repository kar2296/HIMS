import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
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
  DistrictId?: number;
  ActiveStatusId?: number;
  CityCode?: string;
  CityName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface CityRow {
  Id: number;
  CityCode?: string;
  CityName?: string;
  CountryId?: number;
  StateId?: number;
  DistrictId?: number;
  ActiveStatusId?: number;
  DistrictMaster?: { DistrictName?: string };
  StateMaster?: { StateName?: string };
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface CityMasterListScreenProps {
  reactProps?: {
    items?: CityRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const CityMasterListScreen: React.FC<CityMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<CityRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [cityCode, setCityCode] = useState(currentfilter.CityCode || '');
  const [filterCountryId, setFilterCountryId] = useState<number | undefined>(currentfilter.CountryId);
  const [filterStateId, setFilterStateId] = useState<number | undefined>(currentfilter.StateId);
  const [filterDistrictId, setFilterDistrictId] = useState<number | undefined>(currentfilter.DistrictId);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Standalone Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CityRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalCountryId, setModalCountryId] = useState<number | null>(null);
  const [modalStateId, setModalStateId] = useState<number | null>(null);
  const [modalDistrictId, setModalDistrictId] = useState<number | null>(null);
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirm delete modal
  const [itemToDelete, setItemToDelete] = useState<CityRow | null>(null);

  const fetchData = async (code = cityCode, countryId = filterCountryId, stateId = filterStateId, districtId = filterDistrictId, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (code) params.push({ Key: 7, Value: code });
      if (countryId !== undefined && countryId !== null && countryId !== -1) params.push({ Key: 5, Value: countryId });
      if (stateId !== undefined && stateId !== null && stateId !== -1) params.push({ Key: 2, Value: stateId });
      if (districtId !== undefined && districtId !== null && districtId !== -1) params.push({ Key: 3, Value: districtId });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 6, Value: status });

      const res: any = await callBackendApi({
        action: 'GeneralMaster/CityMaster/GetCityMasters',
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
      console.error('Error loading city masters:', err);
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
    setModalStateId(1);
    setModalDistrictId(1);
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: CityRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalCode(row.CityCode || '');
    setModalName(row.CityName || '');
    setModalCountryId(row.CountryId || 1);
    setModalStateId(row.StateId || 1);
    setModalDistrictId(row.DistrictId || 1);
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = (row: CityRow) => {
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
        action: 'GeneralMaster/CityMaster/DeleteCityMaster',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting city master:', err);
    }
  };

  const handleModalSave = async (activeStatusId: number = 1) => {
    if (!modalCode.trim() || !modalName.trim()) {
      setModalError('City Code and City Name are required.');
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
          CityCode: modalCode.trim().toUpperCase(),
          CityName: modalName.trim(),
          CountryId: modalCountryId || 1,
          StateId: modalStateId || 1,
          DistrictId: modalDistrictId || 1,
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/CityMaster/UpdateCityMaster' : 'GeneralMaster/CityMaster/AddCityMaster',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving city record.');
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
        title="City Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button id="btnCityDashboard" variant="icon" icon="fa-home" title="Dashboard" onClick={() => dispatch('backToList')} />
            <Button id="btnAddCity" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              id="txtCityCodeSearch"
              label="City Code"
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  fetchData(cityCode, filterCountryId, filterStateId, filterDistrictId, statusFilter, 1);
                }
              }}
              placeholder="Search code"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              id="ddlCityFilterCountry"
              countryid={filterCountryId ?? null}
              onUpdate={(u) => {
                const cId = u.countryid ?? undefined;
                setFilterCountryId(cId);
                setFilterStateId(undefined);
                setFilterDistrictId(undefined);
                dispatch('locationFilterChange', { CountryId: cId, StateId: -1, DistrictId: -1 });
                fetchData(cityCode, cId, undefined, undefined, statusFilter, 1);
              }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
            <StateControl
              id="ddlCityFilterState"
              stateid={filterStateId ?? null}
              countryid={filterCountryId ?? null}
              onUpdate={(u) => {
                const sId = u.stateid ?? undefined;
                setFilterStateId(sId);
                setFilterDistrictId(undefined);
                dispatch('locationFilterChange', { StateId: sId, DistrictId: -1 });
                fetchData(cityCode, filterCountryId, sId, undefined, statusFilter, 1);
              }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>District</label>
            <DistrictControl
              id="ddlCityFilterDistrict"
              districtid={filterDistrictId ?? null}
              countryid={filterCountryId ?? null}
              stateid={filterStateId ?? null}
              onUpdate={(u) => {
                const dId = u.districtid ?? undefined;
                setFilterDistrictId(dId);
                dispatch('locationFilterChange', { DistrictId: dId });
                fetchData(cityCode, filterCountryId, filterStateId, dId, statusFilter, 1);
              }}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlCityFilterStatus"
              label="Status"
              value={statusFilter != null ? String(statusFilter) : ''}
              options={activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => {
                const val = v ? parseInt(String(v), 10) : undefined;
                setStatusFilter(val);
                dispatch('statusFilterChange', { value: val });
                fetchData(cityCode, filterCountryId, filterStateId, filterDistrictId, val, 1);
              }}
              placeholder="All"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              id="btnCitySearch"
              variant="secondary"
              onClick={() => {
                setCurrentPage(1);
                fetchData(cityCode, filterCountryId, filterStateId, filterDistrictId, statusFilter, 1);
              }}
            >
              Search
            </Button>
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblCityMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>City Code</th>
                <th style={thStyle}>City Name</th>
                <th style={thStyle}>District</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td style={tdStyle} colSpan={7}>Loading city masters...</td></tr>
              )}
              {!isLoading && displayItems.length === 0 && (
                <tr><td style={tdStyle} colSpan={7}>No records found.</td></tr>
              )}
              {!isLoading && displayItems.map((row) => (
                <tr key={row.Id} id={`cityRow_${row.Id}`}>
                  <td style={tdStyle}>{row.CityCode}</td>
                  <td style={tdStyle}>{row.CityName}</td>
                  <td style={tdStyle}>{row.DistrictMaster?.DistrictName}</td>
                  <td style={tdStyle}>{row.StateMaster?.StateName}</td>
                  <td style={tdStyle}>{row.CountryMaster?.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 1 ? 'Approved' : 'Active')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <span
                        id={`btnEditCity_${row.Id}`}
                        className="grid-action" style={{ cursor: 'pointer' }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                      >
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
                      </span>
                      {(row.ActiveStatusId === 1 || row.ActiveStatusId === 2 || row.ActiveStatusId === 3 || row.ActiveStatusId === undefined) && (
                        <span
                          id={`btnDeleteCity_${row.Id}`}
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
            fetchData(cityCode, filterCountryId, filterStateId, filterDistrictId, statusFilter, page);
          }}
        />
      </Card>

      {/* Standalone Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalCityMaster"
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
              maxWidth: 540,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: spacing.xl,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.textMain }}>
                {editingItem ? 'Edit City Master' : 'Add City Master'}
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
              <div id="cityModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalCityCode"
                label="City Code"
                required
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value)}
                placeholder="e.g. CHE, BLR, MUM"
              />
              <Input
                id="txtModalCityName"
                label="City Name"
                required
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="e.g. Chennai, Bangalore, Mumbai"
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
                <div>
                  <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
                  <CountryControl
                    id="ddlModalCityCountry"
                    countryid={modalCountryId}
                    onUpdate={(u) => setModalCountryId(u.countryid ?? 1)}
                  />
                </div>
                <div>
                  <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
                  <StateControl
                    id="ddlModalCityState"
                    stateid={modalStateId}
                    countryid={modalCountryId}
                    onUpdate={(u) => setModalStateId(u.stateid ?? 1)}
                  />
                </div>
                <div>
                  <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>District</label>
                  <DistrictControl
                    id="ddlModalCityDistrict"
                    districtid={modalDistrictId}
                    countryid={modalCountryId}
                    stateid={modalStateId}
                    onUpdate={(u) => setModalDistrictId(u.districtid ?? 1)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalCityActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalCityActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelCityModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveApproveCityModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 1 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete city ${itemToDelete?.CityName} (${itemToDelete?.CityCode})?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
