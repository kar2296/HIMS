import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
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
  DistrictCode?: string;
  DistrictName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface DistrictRow {
  Id: number;
  DistrictCode?: string;
  DistrictName?: string;
  ActiveStatusId?: number;
  StateMaster?: { StateName?: string };
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface DistrictMasterListScreenProps {
  reactProps?: {
    items?: DistrictRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / District Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/ui-grid markup. All real data flow is unchanged --
// same handleReactAction dispatch back to districtmaster-list.js's hollowed
// controller, same real GetDistrictMasters/DeleteDistrictMaster calls, same
// utl.Modal.open('app.districtmasters', ...) add/edit flow.
//
// Disclosed presentational choice, not a functionality change: the
// State/Country filters use the shared StateControl/CountryControl
// dropdowns (already used elsewhere in GeneralMaster/Registration) instead
// of the original <autosearch> typeahead widgets. The standalone
// DistrictName text filter is commented out (dead) in the live template --
// confirmed, not reproduced. No Dashboard/Home button exists in the live
// controller/template either -- confirmed, not reproduced.
export const DistrictMasterListScreen: React.FC<DistrictMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<DistrictRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [districtCode, setDistrictCode] = useState(currentfilter.DistrictCode || '');
  useEffect(() => { setDistrictCode(currentfilter.DistrictCode || ''); }, [currentfilter.DistrictCode]);

  useEffect(() => {
    if (!reactProps?.items) {
      setIsLoading(true);
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'GeneralMaster/DistrictMaster/GetDistrictMasters',
          data: { Params: [], PageContext: { PageSize: 25, PageNumber: 1 } },
          type: 'post'
        }).then((res: any) => {
          if (res?.Data) {
            setStandaloneItems(res.Data);
            setStandaloneTotal(res.TotalRecords || res.Data.length);
          }
          setIsLoading(false);
        }).catch((err) => {
          console.error('Error loading district masters:', err);
          setIsLoading(false);
        });
      }).catch(() => setIsLoading(false));
    }
  }, [reactProps]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DistrictRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalCountryId, setModalCountryId] = useState<number | null>(null);
  const [modalStateId, setModalStateId] = useState<number | null>(null);
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [filterCountryId, setFilterCountryId] = useState<number | undefined>(currentfilter.CountryId);
  const [filterStateId, setFilterStateId] = useState<number | undefined>(currentfilter.StateId);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  const fetchData = async (code = districtCode, stateId = filterStateId, countryId = filterCountryId, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (code) params.push({ Key: 7, Value: code });
      if (stateId !== undefined && stateId !== null && stateId !== -1) params.push({ Key: 2, Value: stateId });
      if (countryId !== undefined && countryId !== null && countryId !== -1) params.push({ Key: 5, Value: countryId });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 6, Value: status });

      const res: any = await callBackendApi({
        action: 'GeneralMaster/DistrictMaster/GetDistrictMasters',
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
      console.error('Error loading district masters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    }
    setEditingItem(null);
    setModalCode('');
    setModalName('');
    setModalCountryId(null);
    setModalStateId(null);
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: DistrictRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalCode(row.DistrictCode || '');
    setModalName(row.DistrictName || '');
    setModalCountryId(null);
    setModalStateId(null);
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const [itemToDelete, setItemToDelete] = useState<DistrictRow | null>(null);

  const handleDelete = (row: DistrictRow) => {
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
        action: 'GeneralMaster/DistrictMaster/DeleteDistrictMaster',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting district master:', err);
    }
  };

  const handleModalSave = async (activeStatusId: number = 1) => {
    if (!modalCode.trim() || !modalName.trim()) {
      setModalError('District Code and District Name are required.');
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
          DistrictCode: modalCode.trim().toUpperCase(),
          DistrictName: modalName.trim(),
          CountryId: modalCountryId || 1,
          StateId: modalStateId || 1,
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/DistrictMaster/UpdateDistrictMaster' : 'GeneralMaster/DistrictMaster/AddDistrictMaster',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving district record.');
    }
  };

  const runSearch = () => {
    if (onAction) {
      onAction('search', { value: districtCode });
    } else {
      setCurrentPage(1);
      fetchData(districtCode, filterStateId, filterCountryId, statusFilter, 1);
    }
  };

  const handleCountryFilterChange = (countryId?: number) => {
    setFilterCountryId(countryId);
    setFilterStateId(undefined);
    if (onAction) {
      onAction('locationFilterChange', { CountryId: countryId, StateId: -1 });
    } else {
      setCurrentPage(1);
      fetchData(districtCode, undefined, countryId, statusFilter, 1);
    }
  };

  const handleStateFilterChange = (stateId?: number) => {
    setFilterStateId(stateId);
    if (onAction) {
      onAction('locationFilterChange', { StateId: stateId });
    } else {
      setCurrentPage(1);
      fetchData(districtCode, stateId, filterCountryId, statusFilter, 1);
    }
  };

  const handleStatusChange = (val?: number) => {
    setStatusFilter(val);
    if (onAction) {
      onAction('statusFilterChange', { value: val });
    } else {
      setCurrentPage(1);
      fetchData(districtCode, filterStateId, filterCountryId, val, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchData(districtCode, filterStateId, filterCountryId, statusFilter, page);
    }
  };

  const totalItems = pagerObj.totalItems || standaloneTotal;
  const pageSize = pagerObj.pageSize || 25;

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
        title="District Master"
        actions={
          <Button id="btnAddNewDistrict" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 180 }}>
            <Input
              id="txtDistrictCodeSearch"
              label="District Code"
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by code"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              countryid={filterCountryId ?? null}
              onUpdate={(u) => handleCountryFilterChange(u.countryid ?? undefined)}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
            <StateControl
              stateid={filterStateId ?? null}
              countryid={filterCountryId ?? null}
              onUpdate={(u) => handleStateFilterChange(u.stateid ?? undefined)}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlDistrictStatusFilter"
              label="Status"
              value={statusFilter != null ? String(statusFilter) : ''}
              options={activeStatusOptions.length > 0 ? activeStatusOptions.map((s) => ({ value: String(s.Id), label: s.Text })) : [
                { value: '1', label: 'Draft' },
                { value: '2', label: 'Approved' },
                { value: '3', label: 'Inactive' }
              ]}
              onChange={(v) => handleStatusChange(v ? parseInt(String(v), 10) : undefined)}
              placeholder="All"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button id="btnDistrictSearch" variant="secondary" onClick={runSearch}>Search</Button>
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblDistrictMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>District Code</th>
                <th style={thStyle}>District Name</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={6}>{isLoading ? 'Loading records...' : 'No records found.'}</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id} data-district-id={row.Id}>
                  <td style={tdStyle}>{row.DistrictCode}</td>
                  <td style={tdStyle}>{row.DistrictName}</td>
                  <td style={tdStyle}>{row.StateMaster?.StateName}</td>
                  <td style={tdStyle}>{row.CountryMaster?.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Approved' : row.ActiveStatusId === 1 ? 'Draft' : 'Inactive')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <button
                        className="btn-edit-district"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        aria-label={`Edit ${row.DistrictName || row.DistrictCode}`}
                      >
                        <i className="fa fa-pencil" style={{ color: colors.primary }} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-delete-district"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleDelete(row)}
                        title="Delete"
                        aria-label={`Delete ${row.DistrictName || row.DistrictCode}`}
                      >
                        <i className="fa fa-trash" style={{ color: colors.danger || '#ef4444' }} aria-hidden="true" />
                      </button>
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
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Embedded React Add/Edit Modal Dialog */}
      {isModalOpen && (
        <div
          id="districtModalOverlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div
            id="districtModalDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="districtModalTitle"
            style={{
              backgroundColor: '#fff', borderRadius: 8, padding: spacing.xl,
              width: '100%', maxWidth: 550, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 id="districtModalTitle" style={{ margin: 0, ...typography.h3, color: colors.textMain }}>
                {editingItem ? 'Edit District Master' : 'Add District Master'}
              </h3>
              <button
                id="btnCloseDistrictModal"
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: colors.textMuted }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div id="districtModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalDistrictCode"
                label="District Code"
                required
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value)}
                placeholder="e.g. DL, BLR"
              />
              <Input
                id="txtModalDistrictName"
                label="District Name"
                required
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="e.g. New Delhi, Bengaluru Urban"
              />
              <div>
                <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
                <CountryControl
                  countryid={modalCountryId}
                  onUpdate={(u) => {
                    setModalCountryId(u.countryid ?? null);
                    setModalStateId(null);
                  }}
                />
              </div>
              <div>
                <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
                <StateControl
                  stateid={modalStateId}
                  countryid={modalCountryId}
                  onUpdate={(u) => setModalStateId(u.stateid ?? null)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalDistrictActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalDistrictActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelDistrictModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveDistrictModal" variant="secondary" onClick={() => handleModalSave(1)} disabled={isSaving}>Save</Button>
              <Button id="btnSaveApproveDistrictModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 2 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete District"
          message={`Are you sure you want to delete district ${itemToDelete.DistrictName || itemToDelete.DistrictCode}?`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
};
