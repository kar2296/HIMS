import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from './ConfirmModal';
import { sessionHelper } from '../services/sessionHelper';
import { callBackendApi } from '../services/apiService';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
}

export interface GuarantorEntity {
  Id: number;
  Code: string;
  GuarantorName: string;
  FacilityId?: number;
  GuarantorTypeId?: number;
  CreditLimit?: number | string;
  AvailableLimit?: number | string;
  ContractDate?: string;
  ContractExpiryDate?: string;
  TPAId?: number;
  ServiceRateCategoryId?: number;
  Phone?: string;
  Email?: string;
  IsActive?: boolean;
  ActiveStatusId?: number;
  GuarantorType?: { Id?: number; Description?: string; ColorCode?: string; Text?: string };
  ActiveStatus?: { Id?: number; Description?: string; ColorCode?: string; Text?: string };
  TPA?: { Id?: number; Description?: string; Text?: string };
}

export interface GuarantorListScreenProps {
  reactProps?: {
    items?: GuarantorEntity[];
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
      FacilityId?: number;
      GuarantorName?: string;
      GuarantorTypeId?: number;
      TPAId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      GuarantorType?: LookupOption[];
      TPA?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

function formatCreditLimit(val?: number | string | null): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-IN');
}

export const GuarantorListScreen: React.FC<GuarantorListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Standalone dataset state
  const [standaloneItems, setStandaloneItems] = useState<GuarantorEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    GuarantorType: LookupOption[];
    TPA: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    GuarantorType: [],
    TPA: [],
    ActiveStatus: [],
  });

  // Filters
  const [filterGuarantorTypeId, setFilterGuarantorTypeId] = useState<number>(
    reactProps?.currentfilter?.GuarantorTypeId ?? -1
  );
  const [filterActiveStatusId, setFilterActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId ?? 2
  );
  const [filterGuarantorName, setFilterGuarantorName] = useState<string>(
    reactProps?.currentfilter?.GuarantorName ?? ''
  );

  // Pagination & Loading
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage ?? 1);
  const pageSize = reactProps?.pageSize ?? 25;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<GuarantorEntity | null>(null);

  // Determine active dataset
  const isHybrid = Boolean(reactProps && reactProps.items);
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? items.length)
    : standaloneTotal;

  // Active lookups
  const lookups = {
    GuarantorType: reactProps?.lookup?.GuarantorType || standaloneLookups.GuarantorType,
    TPA: reactProps?.lookup?.TPA || standaloneLookups.TPA,
    ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
  };

  // Sync state if reactProps change
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.GuarantorTypeId !== undefined) {
        setFilterGuarantorTypeId(reactProps.currentfilter.GuarantorTypeId);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setFilterActiveStatusId(reactProps.currentfilter.ActiveStatusId);
      }
      if (reactProps.currentfilter.GuarantorName !== undefined) {
        setFilterGuarantorName(reactProps.currentfilter.GuarantorName);
      }
    }
    if (reactProps?.currentPage) {
      setCurrentPage(reactProps.currentPage);
    }
  }, [reactProps]);

  // Standalone fetch for lookups
  useEffect(() => {
    if (!reactProps?.lookup) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [{ Key: 'GuarantorType' }, { Key: 'TPA' }, { Key: 'ActiveStatus' }],
        type: 'post',
      })
        .then((res: any) => {
          if (res) {
            setStandaloneLookups({
              GuarantorType: res.GuarantorType || [],
              TPA: res.TPA || [],
              ActiveStatus: res.ActiveStatus || [],
            });
          }
        })
        .catch(() => {});
    }
  }, [reactProps?.lookup]);

  // Standalone fetch for items
  const fetchStandaloneItems = useCallback(
    async (page: number, name: string, typeId: number, statusId: number) => {
      setIsLoading(true);
      try {
        const facilityId = sessionHelper.getCurrentFacilityId();
        const res: any = await callBackendApi({
          action: 'generalmaster/guarantor/GetGuarantors',
          data: {
            Params: [
              { Key: 1, Value: name },
              { Key: 2, Value: typeId },
              { Key: 4, Value: -1 },
              { Key: 5, Value: statusId },
              { Key: 11, Value: [-1, facilityId] },
            ],
            PageContext: {
              PageSize: pageSize,
              PageNumber: page,
            },
          },
          type: 'post',
        });
        if (res && res.Data) {
          setStandaloneItems(res.Data);
          setStandaloneTotal(res.PageContext?.TotalRecords ?? res.Data.length);
        }
      } catch {
        setToastMessage({ text: 'Failed to load guarantors.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneItems(currentPage, filterGuarantorName, filterGuarantorTypeId, filterActiveStatusId);
    }
  }, [isHybrid, currentPage, fetchStandaloneItems]);

  // KPI Metrics calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const active = items.filter(
      (i) => i.ActiveStatusId === 2 || i.ActiveStatus?.Description === 'Active' || i.IsActive === true
    ).length;
    const insurance = items.filter((i) => {
      const typeDesc = (i.GuarantorType?.Description || '').toUpperCase();
      return typeDesc.includes('INSURANCE') || typeDesc.includes('TPA');
    }).length;
    return { total, active, insurance };
  }, [items, totalItems]);

  // Actions
  const handleFilterSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      onAction('search', {
        GuarantorName: filterGuarantorName,
        GuarantorTypeId: filterGuarantorTypeId,
        ActiveStatusId: filterActiveStatusId,
      });
    } else {
      setCurrentPage(1);
      fetchStandaloneItems(1, filterGuarantorName, filterGuarantorTypeId, filterActiveStatusId);
    }
  };

  const handleResetFilters = () => {
    setFilterGuarantorName('');
    setFilterGuarantorTypeId(-1);
    setFilterActiveStatusId(2);
    if (onAction) {
      onAction('resetFilters');
    } else {
      setCurrentPage(1);
      fetchStandaloneItems(1, '', -1, 2);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchStandaloneItems(page, filterGuarantorName, filterGuarantorTypeId, filterActiveStatusId);
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else {
      window.location.hash = '#/app/guarantor/0/general';
    }
  };

  const handleEdit = (entity: GuarantorEntity) => {
    if (onAction) {
      onAction('edit', entity);
    } else {
      window.location.hash = `#/app/guarantor/${entity.Id}/general`;
    }
  };

  const handleDeleteClick = (entity: GuarantorEntity) => {
    setItemToDelete(entity);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    if (onAction) {
      onAction('delete', target);
    } else {
      setIsLoading(true);
      try {
        await callBackendApi({
          action: 'generalmaster/guarantor/DeleteGuarantor',
          data: { Id: target.Id },
          type: 'post',
        });
        setToastMessage({ text: 'Guarantor deleted successfully.', type: 'success' });
        fetchStandaloneItems(currentPage, filterGuarantorName, filterGuarantorTypeId, filterActiveStatusId);
      } catch {
        setToastMessage({ text: 'Failed to delete guarantor.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTypeBadgeClass = (typeDesc?: string) => {
    const desc = (typeDesc || '').toUpperCase();
    if (desc.includes('SELF')) return 'gt-badge-self';
    if (desc.includes('INSURANCE')) return 'gt-badge-insurance';
    if (desc.includes('GOV')) return 'gt-badge-govt';
    if (desc.includes('CORP')) return 'gt-badge-corporate';
    return 'gt-badge-self';
  };

  return (
    <div className="gt-page-container">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE HEADER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="gt-header-card">
        <div className="gt-header-left">
          <div className="gt-header-icon">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <div className="gt-header-title-row">
              <h1 className="gt-header-title">Insurance &amp; Guarantor Payers</h1>
              <span className="gt-header-tag">Billing Masters</span>
            </div>
            <p className="gt-header-subtitle">
              Manage corporate guarantors, insurance companies, credit limits, contracts and tariff policies
            </p>
          </div>
        </div>

        <div className="gt-header-right">
          <div className="gt-header-chip">
            <span className="gt-header-chip-dot" />
            <span>Payer Directory</span>
          </div>
          <div className="gt-header-actions">
            <button
              type="button"
              className="gt-btn gt-btn-primary"
              onClick={handleAddNew}
              id="btnAddGuarantor"
            >
              <i className="fa-solid fa-plus" />
              <span>Add Guarantor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY CARDS (3 Cards)
      ───────────────────────────────────────────────────────────── */}
      <div className="gt-stats-grid">
        <div className="gt-stat-card">
          <div className="gt-stat-icon blue">
            <i className="fa-solid fa-layer-group" />
          </div>
          <div className="gt-stat-info">
            <span className="gt-stat-label">Total Guarantors</span>
            <span className="gt-stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="gt-stat-card">
          <div className="gt-stat-icon emerald">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="gt-stat-info">
            <span className="gt-stat-label">Active Payers</span>
            <span className="gt-stat-value">{stats.active}</span>
          </div>
        </div>

        <div className="gt-stat-card">
          <div className="gt-stat-icon indigo">
            <i className="fa-solid fa-handshake" />
          </div>
          <div className="gt-stat-info">
            <span className="gt-stat-label">Insurance &amp; TPA</span>
            <span className="gt-stat-value">{stats.insurance}</span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            backgroundColor: toastMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${toastMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`fa-solid ${toastMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & FILTER CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="gt-filter-card">
        <div className="gt-filter-header">
          <h3 className="gt-filter-header-title">
            <i className="fa-solid fa-sliders" />
            <span>Search &amp; Filter Payers</span>
          </h3>
          <span className="gt-filter-header-badge">Master Directory</span>
        </div>

        <form onSubmit={handleFilterSearch} className="gt-filters-grid">
          {/* Guarantor Type */}
          <div className="gt-field-group">
            <label className="gt-field-label">
              <i className="fa-solid fa-tag" />
              <span>Type</span>
            </label>
            <div className="gt-input-wrapper">
              <select
                className="gt-select-control"
                value={filterGuarantorTypeId}
                onChange={(e) => setFilterGuarantorTypeId(Number(e.target.value))}
                id="selectGuarantorTypeFilter"
              >
                <option value={-1}>All Types</option>
                {lookups.GuarantorType?.map((t) => (
                  <option key={t.Id} value={t.Id}>
                    {t.Text || t.Description || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="gt-field-group">
            <label className="gt-field-label">
              <i className="fa-solid fa-toggle-on" />
              <span>Status</span>
            </label>
            <div className="gt-input-wrapper">
              <select
                className="gt-select-control"
                value={filterActiveStatusId}
                onChange={(e) => setFilterActiveStatusId(Number(e.target.value))}
                id="selectStatusFilter"
              >
                <option value={-1}>All Statuses</option>
                {lookups.ActiveStatus?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Text || s.Description || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Name/Code */}
          <div className="gt-field-group">
            <label className="gt-field-label">
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search (Code / Name)</span>
            </label>
            <div className="gt-input-wrapper">
              <input
                type="text"
                className="gt-input-control"
                placeholder="Type code or payer name..."
                value={filterGuarantorName}
                onChange={(e) => setFilterGuarantorName(e.target.value)}
                id="inputSearchGuarantor"
              />
              {filterGuarantorName && (
                <button
                  type="button"
                  className="gt-input-clear-btn"
                  onClick={() => setFilterGuarantorName('')}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="gt-filter-actions">
            <button type="submit" className="gt-btn gt-btn-primary" id="btnFilterSearch">
              <i className="fa-solid fa-magnifying-glass" />
              <span>Search</span>
            </button>
            <button
              type="button"
              className="gt-btn gt-btn-outline"
              onClick={handleResetFilters}
              id="btnFilterReset"
            >
              <i className="fa-solid fa-rotate" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ENTERPRISE TABLE CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="gt-table-card">
        <div className="gt-table-header-bar">
          <h3 className="gt-table-title">
            <i className="fa-solid fa-table-list" />
            <span>Guarantors Directory</span>
            <span className="gt-table-count-pill">
              Showing {items.length} of {totalItems || items.length} {items.length === 1 ? 'Record' : 'Records'}
            </span>
          </h3>
          <button
            type="button"
            className="gt-btn gt-btn-outline"
            style={{ height: 32, padding: '0 12px', fontSize: 12 }}
            onClick={handleAddNew}
          >
            <i className="fa-solid fa-plus" />
            <span>Add Guarantor</span>
          </button>
        </div>

        <div className="gt-table-wrapper">
          <table className="gt-table">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>#</th>
                <th style={{ width: '10%' }}>Code</th>
                <th style={{ width: '28%' }}>Payer Name</th>
                <th style={{ width: '14%' }}>Type</th>
                <th style={{ width: '12%' }}>Contract Date</th>
                <th style={{ width: '12%' }}>Expiry Date</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Credit Limit (₹)</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ marginBottom: 8, display: 'block', color: '#0284c7' }} />
                    Loading guarantors...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="gt-empty-state">
                      <div className="gt-empty-icon">
                        <i className="fa-solid fa-folder-open" />
                      </div>
                      <h4 className="gt-empty-title">No Guarantors Found</h4>
                      <p className="gt-empty-desc">
                        {filterGuarantorName || filterGuarantorTypeId !== -1 || filterActiveStatusId !== -1
                          ? 'No payers match the active filter criteria. Try resetting filters.'
                          : 'No guarantors exist yet. Click "Add Guarantor" to create one.'}
                      </p>
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary"
                        onClick={handleAddNew}
                      >
                        <i className="fa-solid fa-plus" />
                        <span>Add First Guarantor</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActive =
                    item.ActiveStatusId === 2 ||
                    item.ActiveStatus?.Description === 'Active' ||
                    item.IsActive === true;
                  const typeDesc = item.GuarantorType?.Description || item.GuarantorType?.Text || '—';
                  const canDelete = item.ActiveStatusId === 1;

                  return (
                    <tr key={item.Id || index}>
                      <td className="gt-cell-idx">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td>
                        <span className="gt-code-badge">{item.Code}</span>
                      </td>
                      <td className="gt-payer-name">
                        {item.GuarantorName}
                      </td>
                      <td>
                        <span className={`gt-badge ${getTypeBadgeClass(typeDesc)}`}>
                          {typeDesc}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>
                        {formatDate(item.ContractDate)}
                      </td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>
                        {formatDate(item.ContractExpiryDate)}
                      </td>
                      <td className="gt-table thead th.text-right" style={{ textAlign: 'right' }}>
                        <span className="gt-credit-limit">{formatCreditLimit(item.CreditLimit)}</span>
                      </td>
                      <td>
                        <span className={`gt-badge ${isActive ? 'gt-badge-active' : 'gt-badge-inactive'}`}>
                          <span className={isActive ? 'gt-badge-active-dot' : 'gt-badge-inactive-dot'} />
                          {item.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="gt-action-btn gt-action-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit / View Guarantor"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              className="gt-action-btn gt-action-del"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Guarantor"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="gt-pagination-bar">
          <div className="gt-pagination-info">
            Showing <strong>{items.length}</strong> of <strong>{totalItems}</strong> records
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Guarantor"
          message={`Are you sure you want to delete guarantor "${itemToDelete.GuarantorName}" (${itemToDelete.Code})?`}
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
