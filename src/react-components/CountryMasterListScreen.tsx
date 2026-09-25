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
  ActiveStatusId?: number;
  CountryCode?: string;
  CountryName?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface CountryRow {
  Id: number;
  CountryCode?: string;
  CountryName?: string;
  ActiveStatusId?: number;
  ActiveStatus?: { Description?: string };
}

interface CountryMasterListScreenProps {
  reactProps?: {
    items?: CountryRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: { ActiveStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (GeneralMaster / Country Master list): re-skins
// the existing real screen with the shared design-system components instead
// of the legacy Bootstrap/ui-grid markup. All real data flow is unchanged --
// same handleReactAction dispatch back to countrymaster-list.js's hollowed
// controller, same real GetCountryMasters/DeleteCountryMaster calls, same
// utl.Modal.open('app.countrymasters', ...) add/edit flow.
//
// Note: unlike City/State Master, this screen has no "Dashboard/Home" button
// and no backtoList() function in the live controller/template -- confirmed,
// not an oversight -- so none is rendered here either.
export const CountryMasterListScreen: React.FC<CountryMasterListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<CountryRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup,
  } = reactProps || {};
  const activeStatusOptions = lookup?.ActiveStatus || [];

  const [countryCode, setCountryCode] = useState(currentfilter.CountryCode || '');
  useEffect(() => { setCountryCode(currentfilter.CountryCode || ''); }, [currentfilter.CountryCode]);

  useEffect(() => {
    if (!reactProps?.items) {
      setIsLoading(true);
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'GeneralMaster/CountryMaster/GetCountryMasters',
          data: { Params: [], PageContext: { PageSize: 25, PageNumber: 1 } },
          type: 'post'
        }).then((res: any) => {
          if (res?.Data) {
            setStandaloneItems(res.Data);
            setStandaloneTotal(res.TotalRecords || res.Data.length);
          }
          setIsLoading(false);
        }).catch((err) => {
          console.error('Error loading country masters:', err);
          setIsLoading(false);
        });
      }).catch(() => setIsLoading(false));
    }
  }, [reactProps]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CountryRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(currentfilter.ActiveStatusId);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  const fetchData = async (code = countryCode, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [];
      if (code) params.push({ Key: 2, Value: code });
      if (status !== undefined && status !== null && status !== -1) params.push({ Key: 4, Value: status });
      const res: any = await callBackendApi({
        action: 'GeneralMaster/CountryMaster/GetCountryMasters',
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
      console.error('Error loading country masters:', err);
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
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: CountryRow) => {
    if (onAction) {
      onAction('edit', row);
    }
    setEditingItem(row);
    setModalCode(row.CountryCode || '');
    setModalName(row.CountryName || '');
    setModalIsActive(row.ActiveStatusId === 1 || row.ActiveStatusId === 2);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (row: CountryRow) => {
    if (onAction) {
      onAction('delete', row);
      return;
    }
    if (window.confirm(`Are you sure you want to delete country ${row.CountryName || row.CountryCode}?`)) {
      try {
        const { callBackendApi } = await import('../services/apiService');
        await callBackendApi({
          action: 'GeneralMaster/CountryMaster/DeleteCountryMaster',
          data: { Id: row.Id },
          type: 'post'
        });
        fetchData();
      } catch (err) {
        console.error('Error deleting country master:', err);
      }
    }
  };

  const handleModalSave = async (activeStatusId: number = 1) => {
    if (!modalCode.trim() || !modalName.trim()) {
      setModalError('Country Code and Country Name are required.');
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
          CountryCode: modalCode.trim().toUpperCase(),
          CountryName: modalName.trim(),
          ActiveStatusId: activeStatusId,
          IsActive: modalIsActive
        }
      };
      await callBackendApi({
        action: isUpdate ? 'GeneralMaster/CountryMaster/UpdateCountryMaster' : 'GeneralMaster/CountryMaster/AddCountryMaster',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setIsSaving(false);
      setModalError(err?.message || 'Error saving country record.');
    }
  };

  const runSearch = () => {
    if (onAction) {
      onAction('search', { value: countryCode });
    } else {
      setCurrentPage(1);
      fetchData(countryCode, statusFilter, 1);
    }
  };

  const handleStatusChange = (val?: number) => {
    setStatusFilter(val);
    if (onAction) {
      onAction('statusFilterChange', { value: val });
    } else {
      setCurrentPage(1);
      fetchData(countryCode, val, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchData(countryCode, statusFilter, page);
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
        title="Country Master"
        actions={
          <Button id="btnAddNewCountry" variant="primary" icon="fa-plus" onClick={handleAddNew}>Add New</Button>
        }
      />

      <Card>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            <Input
              id="txtCountryCodeSearch"
              label="Country Code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              onBlur={runSearch}
              placeholder="Search by code"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              id="ddlCountryStatusFilter"
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
            <Button id="btnCountrySearch" variant="secondary" onClick={runSearch}>Search</Button>
          </div>
        </FilterBar>

        <div style={{ overflowX: 'auto' }}>
          <table id="tblCountryMaster" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Country Code</th>
                <th style={thStyle}>Country Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={4}>{isLoading ? 'Loading records...' : 'No records found.'}</td></tr>
              )}
              {items.map((row) => (
                <tr key={row.Id} data-country-id={row.Id}>
                  <td style={tdStyle}>{row.CountryCode}</td>
                  <td style={tdStyle}>{row.CountryName}</td>
                  <td style={tdStyle}>{row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Approved' : row.ActiveStatusId === 1 ? 'Draft' : 'Inactive')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <button
                        className="btn-edit-country"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        aria-label={`Edit ${row.CountryName || row.CountryCode}`}
                      >
                        <i className="fa fa-pencil" style={{ color: colors.primary }} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-delete-country"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => handleDelete(row)}
                        title="Delete"
                        aria-label={`Delete ${row.CountryName || row.CountryCode}`}
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
          id="countryModalOverlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div
            id="countryModalDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="countryModalTitle"
            style={{
              backgroundColor: '#fff', borderRadius: 8, padding: spacing.xl,
              width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
              <h3 id="countryModalTitle" style={{ margin: 0, ...typography.h3, color: colors.textMain }}>
                {editingItem ? 'Edit Country Master' : 'Add Country Master'}
              </h3>
              <button
                id="btnCloseCountryModal"
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: colors.textMuted }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div id="countryModalError" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <Input
                id="txtModalCountryCode"
                label="Country Code"
                required
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value)}
                placeholder="e.g. IN, US, QA"
              />
              <Input
                id="txtModalCountryName"
                label="Country Name"
                required
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="e.g. India, United States"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <input
                  id="chkModalCountryActive"
                  type="checkbox"
                  checked={modalIsActive}
                  onChange={(e) => setModalIsActive(e.target.checked)}
                />
                <label htmlFor="chkModalCountryActive" style={{ fontSize: 14, color: colors.textMain, cursor: 'pointer' }}>Active</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <Button id="btnCancelCountryModal" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button id="btnSaveCountryModal" variant="secondary" onClick={() => handleModalSave(1)} disabled={isSaving}>Save</Button>
              <Button id="btnSaveApproveCountryModal" variant="primary" onClick={() => handleModalSave(modalIsActive ? 2 : 3)} disabled={isSaving}>Save &amp; Approve</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
