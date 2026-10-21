import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from './ConfirmModal';
import { sessionHelper } from '../services/sessionHelper';
import { callBackendApi } from '../services/apiService';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  Code?: string;
}

export interface SgrmRow {
  Id?: number;
  ServiceGroup?: string;
  BedTypeId?: number;
  BedType?: { Id?: number; Description?: string; Text?: string };
  Amount?: number | string;
  ActiveStatusId?: number;
  ActiveStatus?: { Description?: string; ColorCode?: string };
}

export interface ServiceGroupRateMappingListScreenProps {
  part?: 'header' | 'list' | 'all';
  reactProps?: {
    rows?: SgrmRow[];
    items?: SgrmRow[];
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
      ServiceGroup?: string;
      BedTypeId?: number;
      ActiveStatusId?: number;
      Amount?: number;
    };
    lookup?: {
      BedType?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ServiceGroupRateMappingListScreen: React.FC<ServiceGroupRateMappingListScreenProps> = ({
  part,
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const rawItems = reactProps?.items || reactProps?.rows;
  const isHybrid = Boolean(reactProps && Array.isArray(rawItems));

  // Standalone States (when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<SgrmRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    BedType: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    BedType: [],
    ActiveStatus: [],
  });

  // Filter States
  const [searchGroup, setSearchGroup] = useState<string>(
    reactProps?.currentfilter?.ServiceGroup || ''
  );
  const [bedTypeId, setBedTypeId] = useState<number>(
    reactProps?.currentfilter?.BedTypeId !== undefined ? reactProps.currentfilter.BedTypeId : -1
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );

  // Modal / Toast UI feedback
  const [itemToDelete, setItemToDelete] = useState<SgrmRow | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.ServiceGroup !== undefined) setSearchGroup(reactProps.currentfilter.ServiceGroup);
      if (reactProps.currentfilter.BedTypeId !== undefined) setBedTypeId(reactProps.currentfilter.BedTypeId);
      if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
    }
  }, [reactProps?.currentfilter]);

  // Lookups memo
  const lookups = useMemo(() => {
    return {
      BedType: reactProps?.lookup?.BedType || standaloneLookups.BedType,
      ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Active Items & Pagination
  const allItems = isHybrid ? (rawItems || []) : standaloneItems;
  const currentPage = isHybrid
    ? (reactProps?.pagerObj?.currentPage || reactProps?.currentPage || 1)
    : standalonePage;
  const pageSize = isHybrid
    ? (reactProps?.pagerObj?.pageSize || reactProps?.pageSize || 25)
    : standalonePageSize;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? allItems.length)
    : standaloneTotal;

  // Client-side filtering when backend returns all records
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Service Group search
      if (searchGroup.trim()) {
        const query = searchGroup.trim().toLowerCase();
        const groupName = (item.ServiceGroup || '').toLowerCase();
        if (!groupName.includes(query)) return false;
      }
      // 2. Bed Type filter
      if (bedTypeId !== -1) {
        const itemBedTypeId = item.BedTypeId ?? item.BedType?.Id;
        if (itemBedTypeId !== undefined && itemBedTypeId !== bedTypeId) return false;
      }
      // 3. Status filter
      if (activeStatusId !== -1) {
        const itemStatusId = item.ActiveStatusId;
        if (itemStatusId !== undefined && itemStatusId !== activeStatusId) return false;
      }
      return true;
    });
  }, [allItems, searchGroup, bedTypeId, activeStatusId]);

  // Standalone: Fetch Lookups
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [{ Key: 'BedType' }, { Key: 'ActiveStatus' }],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              BedType: res.BedType || [],
              ActiveStatus: res.ActiveStatus || [],
            });
          }
        })
        .catch((err) => console.error('Failed to load lookups:', err));
    }
  }, [isHybrid]);

  // Standalone: Fetch Mappings
  const fetchStandaloneMappings = useCallback(
    (page: number, filtersToUse?: any) => {
      setIsLoading(true);
      const groupVal = filtersToUse?.ServiceGroup !== undefined ? filtersToUse.ServiceGroup : searchGroup;
      const bId = filtersToUse?.BedTypeId !== undefined ? filtersToUse.BedTypeId : bedTypeId;
      const sId = filtersToUse?.ActiveStatusId !== undefined ? filtersToUse.ActiveStatusId : activeStatusId;

      const inputData = {
        Params: [
          { Key: 2, Value: groupVal },
          { Key: 3, Value: bId },
          { Key: 5, Value: sId },
        ],
        PageContext: {
          PageSize: standalonePageSize,
          PageNumber: page,
        },
      };

      callBackendApi({
        action: 'BillingMaster/ServiceGroupRateMapping/GetAllServiceGroupRateMapping',
        data: inputData,
      })
        .then((res: any) => {
          setIsLoading(false);
          if (res && res.Data) {
            setStandaloneItems(res.Data);
            if (res.PageContext && res.PageContext.TotalRecords !== undefined) {
              setStandaloneTotal(res.PageContext.TotalRecords);
            }
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error('Failed to get service group rate mappings:', err);
        });
    },
    [searchGroup, bedTypeId, activeStatusId, standalonePageSize]
  );

  // Standalone mount fetch
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneMappings(1);
    }
  }, [isHybrid, fetchStandaloneMappings]);

  // Handler: Execute Search
  const handleSearch = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        ServiceGroup: searchGroup.trim(),
        BedTypeId: Number(bedTypeId),
        ActiveStatusId: Number(activeStatusId),
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneMappings(1);
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearchGroup('');
    setBedTypeId(-1);
    setActiveStatusId(2);

    if (isHybrid && onAction) {
      onAction('resetFilters', {
        ServiceGroup: '',
        BedTypeId: -1,
        ActiveStatusId: 2,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneMappings(1, {
        ServiceGroup: '',
        BedTypeId: -1,
        ActiveStatusId: 2,
      });
    }
  };

  // Handler: Page Change
  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneMappings(newPage);
    }
  };

  // Handler: Add New Mapping
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
    }
  };

  // Handler: Edit Mapping
  const handleEdit = (item: SgrmRow) => {
    if (isHybrid && onAction) {
      onAction('edit', { Id: item.Id });
    }
  };

  // Handler: Delete Mapping Trigger
  const handleDeleteTrigger = (item: SgrmRow) => {
    setItemToDelete(item);
  };

  // Handler: Delete Confirmed
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', { Id: target.Id, ServiceGroup: target.ServiceGroup });
    } else {
      callBackendApi({
        action: 'BillingMaster/ServiceGroupRateMapping/DeleteServiceGroupRateMapping',
        data: { Id: target.Id },
      })
        .then(() => {
          setToastMessage({ text: 'Rate mapping deleted successfully', type: 'success' });
          fetchStandaloneMappings(standalonePage);
        })
        .catch((err) => {
          setToastMessage({ text: 'Failed to delete rate mapping', type: 'error' });
          console.error(err);
        });
    }
  };

  // Currency Formatter
  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null || val === '') return '₹ 0.00';
    const num = Number(val);
    if (isNaN(num)) return '₹ 0.00';
    return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Number Formatter
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const total = allItems.length;
    const active = allItems.filter((r) => r.ActiveStatusId === 2 || !r.ActiveStatusId).length;
    const distinctBedTypes = new Set(
      allItems.map((r) => r.BedType?.Description || (r.BedTypeId ? `Bed ${r.BedTypeId}` : 'General'))
    ).size;
    const sumAmount = allItems.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const avgAmount = total > 0 ? sumAmount / total : 0;
    return {
      total,
      active,
      distinctBedTypes,
      avgAmount,
    };
  }, [allItems]);

  // Auto dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Backward-compatibility: if explicitly mounted as part='header' in legacy multi-mount
  if (part === 'header') {
    return (
      <div className="pkg-header-card" style={{ marginBottom: 12 }}>
        <div className="pkg-header-left">
          <div className="pkg-header-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <i className="fa fa-calculator" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Service Group Rate Mapping</h1>
              <span className="pkg-header-tag">BILLING MASTER</span>
            </div>
            <p className="pkg-header-subtitle">
              Configure departmental service group rates by bed category, ward class & pricing rules
            </p>
          </div>
        </div>
        <div className="pkg-header-right">
          <button
            type="button"
            id="btnAddRateMappingLegacy"
            className="pkg-btn-add"
            onClick={handleAddNew}
            title="Manage Service Group Rate Mapping"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Rate Mapping</span>
          </button>
        </div>
      </div>
    );
  }

  // Full unified MediFlow Enterprise Screen (when part === undefined, part === 'all', or part === 'list')
  return (
    <div className="pkg-page-container">
      {/* 1. Executive Header Card */}
      <div className="pkg-header-card">
        <div className="pkg-header-left">
          <div className="pkg-header-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <i className="fa fa-calculator" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Service Group Rate Mapping</h1>
              <span className="pkg-header-tag">BILLING MASTER</span>
            </div>
            <p className="pkg-header-subtitle">
              Configure departmental service group rates by bed category, ward class & pricing rules
            </p>
          </div>
        </div>

        <div className="pkg-header-right">
          <div className="pkg-header-chip" title="Current facility affiliation">
            <span className="pkg-header-chip-dot" />
            <span>SHUVADARSINI HOSPITAL</span>
          </div>

          <button
            type="button"
            id="btnAddRateMapping"
            className="pkg-btn-add"
            onClick={handleAddNew}
            title="Create new service group rate mapping"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Rate Mapping</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Mappings</span>
            <span className="pkg-stat-value">{formatNumber(stats.total)}</span>
            <span className="pkg-stat-subtext">Configured group rates</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-cubes" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Active Rates</span>
            <span className="pkg-stat-value">{formatNumber(stats.active)}</span>
            <span className="pkg-stat-subtext">Operational mappings</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Bed Types</span>
            <span className="pkg-stat-value">
              {stats.distinctBedTypes || (lookups.BedType.length > 0 ? lookups.BedType.filter((b) => b.Id !== -1).length : 3)}
            </span>
            <span className="pkg-stat-subtext">Ward categories</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-bed" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Average Base Rate</span>
            <span className="pkg-stat-value" style={{ fontSize: '18px', color: '#0284c7' }}>
              {formatCurrency(stats.avgAmount)}
            </span>
            <span className="pkg-stat-subtext">Across active beds</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-inr" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="pkg-filter-card">
        <div className="pkg-filter-row">
          {/* Service Group Search Input */}
          <div className="pkg-filter-col pkg-filter-col-search">
            <label className="pkg-filter-label" htmlFor="inputSearchServiceGroup">
              Service Group Name
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-search pkg-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputSearchServiceGroup"
                className="pkg-filter-input"
                placeholder="Search by service group name (e.g. bed charges, consultation)..."
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {searchGroup && (
                <button
                  type="button"
                  className="pkg-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setSearchGroup('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Bed Type Filter */}
          <div className="pkg-filter-col">
            <label className="pkg-filter-label" htmlFor="selectBedTypeFilter">
              Bed Type
            </label>
            <select
              id="selectBedTypeFilter"
              className="pkg-filter-select"
              value={bedTypeId}
              onChange={(e) => setBedTypeId(Number(e.target.value))}
            >
              <option value={-1}>All Bed Types</option>
              {lookups.BedType.filter((b) => b.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="pkg-filter-col" style={{ flex: '1 1 140px' }}>
            <label className="pkg-filter-label" htmlFor="selectStatusFilter">
              Status
            </label>
            <select
              id="selectStatusFilter"
              className="pkg-filter-select"
              value={activeStatusId}
              onChange={(e) => setActiveStatusId(Number(e.target.value))}
            >
              <option value={-1}>All Statuses</option>
              <option value={2}>Active</option>
              <option value={1}>Draft</option>
              <option value={3}>Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pkg-filter-actions">
            <button
              type="button"
              id="btnFilterSearch"
              className="pkg-btn-search"
              onClick={handleSearch}
              title="Apply filters"
            >
              <i className="fa fa-filter" aria-hidden="true" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              id="btnFilterReset"
              className="pkg-btn-reset"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Enterprise Data Table Card */}
      <div className="pkg-table-card">
        {isLoading ? (
          <div className="pkg-loading-overlay">
            <div className="pkg-spinner" />
            <span>Loading rate mappings...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="pkg-empty-state">
            <i className="fa fa-calculator pkg-empty-icon" aria-hidden="true" />
            <h3 className="pkg-empty-title">No service group rate mappings found</h3>
            <p className="pkg-empty-desc">
              Try adjusting your search criteria, clearing bed type or status filters, or creating a new rate mapping.
            </p>
            <button type="button" className="pkg-btn-add" onClick={handleAddNew}>
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Rate Mapping</span>
            </button>
          </div>
        ) : (
          <div className="pkg-table-responsive">
            <table className="pkg-table" id="tblServiceGroupRateMappings">
              <thead>
                <tr>
                  <th className="pkg-col-idx" style={{ width: '60px' }}>#</th>
                  <th style={{ minWidth: '260px' }}>Service Group</th>
                  <th style={{ width: '220px' }}>Bed Type</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '110px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((row, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const isDraft = row.ActiveStatusId === 1;
                  const isInactive = row.ActiveStatusId === 3;
                  const statusDesc =
                    row.ActiveStatus?.Description ||
                    (isDraft ? 'Draft' : isInactive ? 'Inactive' : 'Active');
                  const bedTypeDesc = row.BedType?.Description || row.BedType?.Text || 'General';

                  return (
                    <tr key={row.Id || index}>
                      <td className="pkg-col-idx">{rowIndex}</td>

                      {/* Service Group */}
                      <td>
                        <div className="pkg-name-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: '#f0f9ff',
                                color: '#0284c7',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                border: '1px solid #bae6fd',
                              }}
                            >
                              <i className="fa fa-folder-o" aria-hidden="true" />
                            </span>
                            <span className="pkg-name-primary" style={{ fontSize: '13.5px', textTransform: 'capitalize' }}>
                              {row.ServiceGroup || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Bed Type */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            <i className="fa fa-bed" style={{ color: '#0284c7', fontSize: '11px' }} />
                            <span>{bedTypeDesc}</span>
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <span className="pkg-amount-val" style={{ fontSize: '14px', color: '#0f172a' }}>
                          {formatCurrency(row.Amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`pkg-status-pill ${
                            isDraft
                              ? 'pkg-status-pill-draft'
                              : isInactive
                              ? 'pkg-status-pill-inactive'
                              : 'pkg-status-pill-active'
                          }`}
                        >
                          <span className="pkg-status-dot" />
                          <span>{statusDesc}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="pkg-actions-cell">
                          <button
                            type="button"
                            id={`btnEditSgrm_${row.Id}`}
                            className="pkg-action-btn pkg-action-edit"
                            title="Edit Rate Mapping"
                            onClick={() => handleEdit(row)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {/* Delete button (effective condition: ActiveStatusId === 3 or 1) */}
                          {(row.ActiveStatusId === 3 || row.ActiveStatusId === 1) && (
                            <button
                              type="button"
                              id={`btnDeleteSgrm_${row.Id}`}
                              className="pkg-action-btn pkg-action-delete"
                              title="Delete Rate Mapping"
                              onClick={() => handleDeleteTrigger(row)}
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Sticky / Unified Pagination Bar */}
        {filteredItems.length > 0 && (
          <div className="pkg-pagination-bar">
            <div className="pkg-pagination-info">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredItems.length)}</strong> of{' '}
              <strong>{formatNumber(filteredItems.length)}</strong> rate mappings
            </div>

            <div className="pkg-pagination-controls">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredItems.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Rate Mapping"
        message={`Are you sure you want to delete rate mapping for "${itemToDelete?.ServiceGroup} - ${itemToDelete?.BedType?.Description || 'General'}"? This action cannot be undone.`}
        confirmLabel="Delete Mapping"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`pkg-toast ${toastMessage.type === 'success' ? 'pkg-toast-success' : 'pkg-toast-error'}`}>
          <i
            className={`fa ${toastMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
            aria-hidden="true"
          />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
