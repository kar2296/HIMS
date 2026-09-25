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
  CountryId?: number;
  StateId?: number;
  CityId?: number;
  ActiveStatusId?: number;
  Pincode?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface PincodeRow {
  Id: number;
  Pincode?: string;
  Area?: string;
  ActiveStatusId?: number;
  CityMaster?: { CityName?: string };
  DistrictMaster?: { DistrictName?: string };
  StateMaster?: { StateName?: string };
  CountryMaster?: { CountryName?: string };
  ActiveStatus?: { Description?: string };
}

interface PincodeMasterListScreenProps {
  reactProps?: {
    items?: PincodeRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { Country?: LookupItem[]; State?: LookupItem[]; City?: LookupItem[]; ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Pincode Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/custom-table markup. All real data flow is
// unchanged -- same handleReactAction dispatch back to pincode-list.js's
// hollowed controller, same real GetPincodeMasters/DeletePincodeMaster calls,
// same utl.Modal.open('app.pincode', ...) add/edit flow.
//
// Disclosed presentational choice, not a functionality change: the live
// filter bar's Country/State/City fields are plain <ui-select> bound
// directly to lookup.Country/State/City (populated by this controller's own
// initLookup, unlike the form) -- ported here as plain Select dropdowns.
// There is no District filter in the live template (DistrictId is a real
// GetPincodeMasters query param, key 9, but no control ever sets it) --
// confirmed, not reproduced. The Dashboard/Home button (backtoList()) IS
// live in this controller/template, unlike Country/District Master --
// reproduced.
export const PincodeMasterListScreen: React.FC<PincodeMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<PincodeRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const countryOptions = lookup?.Country || [];
  const stateOptions = lookup?.State || [];
  const cityOptions = lookup?.City || [];
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [pincode, setPincode] = useState(currentfilter.Pincode || '');
  useEffect(() => { setPincode(currentfilter.Pincode || ''); }, [currentfilter.Pincode]);

  useEffect(() => {
    if (!reactProps?.items) {
      setIsLoading(true);
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'GeneralMaster/PincodeMaster/GetPincodeMasters',
          data: { Params: [], PageContext: { PageSize: 25, PageNumber: 1 } },
          type: 'post'
        }).then((res: any) => {
          if (res?.Data) {
            setStandaloneItems(res.Data);
            setStandaloneTotal(res.TotalRecords || res.Data.length);
          }
          setIsLoading(false);
        }).catch((err) => {
          console.error('Error loading pincode masters:', err);
          setIsLoading(false);
        });
      }).catch(() => setIsLoading(false));
    }
  }, [reactProps]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PincodeRow | null>(null);
  const [modalPincode, setModalPincode] = useState('');
  const [modalArea, setModalArea] = useState('');
  const [modalCountryId, setModalCountryId] = useState<number | null>(null);
  const [modalStateId, setModalStateId] = useState<number | null>(null);
  const [modalDistrictId, setModalDistrictId] = useState<number | null>(null);
  const [modalCityId, setModalCityId] = useState<number | null>(null);
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [filterCountryId, setFilterCountryId] = useState<number | undefined>(currentfilter.CountryId);
  const [filterStateId, setFilterStateId] = useState<number | undefined>(currentfilter.StateId);
  const [filterCityId, setFilterCityId] = useState<number | undefined>(currentfilter.CityId);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  const fetchData = async (pin = pincode, countryId = filterCountryId, stateId = filterStateId, cityId = filterCityId, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (pin) params.push({ Key: 5, Value: pin });
      if (countryId !== undefined && countryId !== null && countryId !== -1) params.push({ Key: 2, Value: countryId });
      if (stateId !== undefined && stateId !== null && stateId !== -1) params.push({ Key: 3, Value: stateId });
      if (cityId !== undefined && cityId !== null && cityId !== -1) params.push({ Key: 4, Value: cityId });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 8, Value: status });

      const res: any = await callBackendApi({
        action: 'GeneralMaster/PincodeMaster/GetPincodeMasters',
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
      console.error('Error loading pincode masters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    }
    setEditingItem(null);
    setModalPincode('');
    setModalArea('');
    setModalCountryId(null);
    setModalStateId(null);
    setModalDistrictId(null);
    setModalCityId(null);
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: PincodeRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalPincode(row.Pincode || '');
    setModalArea(row.Area || '');
    setModalCountryId(null);
    setModalStateId(null);
    setModalDistrictId(null);
    setModalCityId(null);
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (row: PincodeRow) => {
    if (onAction) {
      onAction('delete', row);
      return;
    }
    if (window.confirm(`Are you sure you want to delete pincode ${row.Pincode} (${row.Area})?`)) {
      try {
        const { callBackendApi } = await import('../services/apiService');
        await callBackendApi({
          action: 'GeneralMaster/PincodeMaster/DeletePincodeMaster',
          data: { Id: row.Id },
          type: 'post'
        });
        fetchData();
      } catch (err) {
        console.error('Error deleting pincode master:', err);
      }
    }
  };

  const handleModalSave = async (activeStatusId: number = 2) => {
    if (!modalPincode.trim() || !modalArea.trim()) {
      setModalError('Pincode and Area are required.');
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
          Pincode: modalPincode.trim(),
          Area: modalArea.trim(),
          CountryId: modalCountryId || 1,
          StateId: modalStateId || 1,
          DistrictId: modalDistrictId || 1,
          CityId: modalCityId || 1,
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/PincodeMaster/UpdatePincodeMaster' : 'GeneralMaster/PincodeMaster/AddPincodeMaster',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving pincode record.');
    }
  };

  const runSearch = () => {
    if (onAction) {
      onAction('search', { value: pincode });
    } else {
      setCurrentPage(1);
      fetchData(pincode, filterCountryId, filterStateId, filterCityId, statusFilter, 1);
    }
  };

  const handleCountryFilterChange = (countryId?: number) => {
    setFilterCountryId(countryId);
    if (onAction) {
      onAction('locationFilterChange', { CountryId: countryId });
    } else {
      setCurrentPage(1);
      fetchData(pincode, countryId, filterStateId, filterCityId, statusFilter, 1);
    }
  };

  const handleStateFilterChange = (stateId?: number) => {
    setFilterStateId(stateId);
    if (onAction) {
      onAction('locationFilterChange', { StateId: stateId });
    } else {
      setCurrentPage(1);
      fetchData(pincode, filterCountryId, stateId, filterCityId, statusFilter, 1);
    }
  };

  const handleCityFilterChange = (cityId?: number) => {
    setFilterCityId(cityId);
    if (onAction) {
      onAction('locationFilterChange', { CityId: cityId });
    } else {
      setCurrentPage(1);
      fetchData(pincode, filterCountryId, filterStateId, cityId, statusFilter, 1);
    }
  };

  const handleStatusChange = (val?: number) => {
    setStatusFilter(val);
    if (onAction) {
      onAction('statusFilterChange', { value: val });
    } else {
      setCurrentPage(1);
      fetchData(pincode, filterCountryId, filterStateId, filterCityId, val, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchData(pincode, filterCountryId, filterStateId, filterCityId, statusFilter, page);
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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Pincode Master"
        actions={
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button id="btnAddNewPincode" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              id="txtPincodeSearch"
              label="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by pincode"
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlPincodeCountryFilter"
              label="Country"
              value={filterCountryId != null ? String(filterCountryId) : ''}
              options={countryOptions.map((c) => ({ value: String(c.Id), label: c.Text }))}
              onChange={(v) => handleCountryFilterChange(v ? parseInt(String(v), 10) : undefined)}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlPincodeStateFilter"
              label="State"
              value={filterStateId != null ? String(filterStateId) : ''}
              options={stateOptions.map((s) => ({ value: String(s.Id), label: s.Text }))}
              onChange={(v) => handleStateFilterChange(v ? parseInt(String(v), 10) : undefined)}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlPincodeCityFilter"
              label="City"
              value={filterCityId != null ? String(filterCityId) : ''}
              options={cityOptions.map((c) => ({ value: String(c.Id), label: c.Text }))}
              onChange={(v) => handleCityFilterChange(v ? parseInt(String(v), 10) : undefined)}
              placeholder="All"
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              id="ddlPincodeStatusFilter"
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
            <Button id="btnPincodeSearch" variant="secondary" onClick={runSearch}>Search</Button>
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblPincodeMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Pincode</th>
                <th style={thStyle}>Area</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>District</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={8}>{isLoading ? 'Loading records...' : 'No records found.'}</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id} data-pincode-id={row.Id}>
                  <td style={tdStyle}>{row.Pincode}</td>
                  <td style={tdStyle}>{row.Area}</td>
                  <td style={tdStyle}>{row.CityMaster?.CityName}</td>
                  <td style={tdStyle}>{row.DistrictMaster?.DistrictName}</td>
                  <td style={tdStyle}>{row.StateMaster?.StateName}</td>
                  <td style={tdStyle}>{row.CountryMaster?.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Approved' : row.ActiveStatusId === 1 ? 'Draft' : 'Inactive')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <button
                        className="btn-edit-pincode"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        aria-label={`Edit ${row.Pincode}`}
                      >
                        <i className="fa fa-pencil" style={{ color: colors.primary }} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-delete-pincode"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleDelete(row)}
                        title="Delete"
                        aria-label={`Delete ${row.Pincode}`}
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
          id="pincodeModalOverlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div
            id="pincodeModalDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pincodeModalTitle"
            style={{
              backgroundColor: '#fff', borderRadius: 8, padding: spacing.xl,
              width: '100%', maxWidth: 550, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 id="pincodeModalTitle" style={{ margin: 0, ...typography.h3, color: colors.textMain }}>
                {editingItem ? 'Edit Pincode Master' : 'Add Pincode Master'}
              </h3>
              <button
                id="btnClosePincodeModal"
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: colors.textMuted }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div id="pincodeModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalPincode"
                label="Pincode"
                required
                maxLength={6}
                value={modalPincode}
                onChange={(e) => setModalPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 110001, 560001"
              />
              <Input
                id="txtModalArea"
                label="Area"
                required
                value={modalArea}
                onChange={(e) => setModalArea(e.target.value)}
                placeholder="e.g. Connaught Place, Indiranagar"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalPincodeActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalPincodeActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelPincodeModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveApprovePincodeModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 2 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
