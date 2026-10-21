import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { callBackendApi } from '../services/apiService';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  Code?: string;
}

export interface ProcedureType {
  Id?: number;
  Description?: string;
  ColorCode?: string;
}

export interface ProcedureSubCategory {
  Id?: number;
  Description?: string;
  ColorCode?: string;
}

export interface ActiveStatus {
  Id?: number;
  Description?: string;
  ColorCode?: string;
}

export interface SurgeryOrderProcedure {
  Id: number;
  Code: string;
  ProcedureName: string;
  Description?: string;
  Duration?: string;
  ProcedureTypeId?: number;
  ProcedureCategoryId?: number;
  ProcedureSubCategoryId?: number;
  ProcedureCodeSchemeId?: number;
  ActiveStatusId?: number;
  IsActive?: boolean;
  IsCathlabProcedures?: boolean;
  IsBillable?: boolean;
  ProcedureType?: ProcedureType;
  ProcedureSubCategory?: ProcedureSubCategory;
  ActiveStatus?: ActiveStatus;
}

export interface SurgeryOrderListScreenProps {
  reactProps?: {
    items?: SurgeryOrderProcedure[];
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
      ProcedureCodeSchemeId?: number;
      Code?: string;
      ProcedureName?: string;
      ProcedureTypeId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      ProcedureCodeScheme?: LookupOption[];
      ProcedureCategory?: LookupOption[];
      ActiveStatus?: LookupOption[];
      Department?: LookupOption[];
      ProcedureType?: LookupOption[];
    };
    isLoading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const SurgeryOrderListScreen: React.FC<SurgeryOrderListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Standalone state (when mounted outside AngularJS)
  const [standaloneItems, setStandaloneItems] = useState<SurgeryOrderProcedure[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [standaloneLoading, setStandaloneLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ProcedureCodeScheme: LookupOption[];
    ProcedureCategory: LookupOption[];
    ActiveStatus: LookupOption[];
    Department: LookupOption[];
    ProcedureType: LookupOption[];
  }>({
    ProcedureCodeScheme: [],
    ProcedureCategory: [],
    ActiveStatus: [],
    Department: [],
    ProcedureType: [],
  });

  // Filter States
  const [searchCode, setSearchCode] = useState<string>(
    reactProps?.currentfilter?.Code || reactProps?.currentfilter?.ProcedureName || ''
  );
  const [procedureTypeId, setProcedureTypeId] = useState<number>(
    reactProps?.currentfilter?.ProcedureTypeId !== undefined ? reactProps.currentfilter.ProcedureTypeId : -1
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync incoming reactProps when in hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.Code !== undefined) {
        setSearchCode(reactProps.currentfilter.Code || reactProps.currentfilter.ProcedureName || '');
      }
      if (reactProps.currentfilter.ProcedureTypeId !== undefined) {
        setProcedureTypeId(reactProps.currentfilter.ProcedureTypeId);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
      }
    }
  }, [reactProps?.currentfilter]);

  // Determine active dataset
  const items: SurgeryOrderProcedure[] = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems: number = isHybrid
    ? (reactProps?.totalItems || reactProps?.pagerObj?.totalItems || 0)
    : standaloneTotal;
  const currentPage: number = isHybrid
    ? (reactProps?.currentPage || reactProps?.pagerObj?.currentPage || 1)
    : standalonePage;
  const pageSize: number = isHybrid
    ? (reactProps?.pageSize || reactProps?.pagerObj?.pageSize || 25)
    : standalonePageSize;
  const loading: boolean = isHybrid ? Boolean(reactProps?.isLoading) : standaloneLoading;

  // Lookups
  const lookups = isHybrid ? (reactProps?.lookup || {}) : standaloneLookups;

  // Standalone API Data Fetching
  const fetchStandaloneData = useCallback(
    async (page = 1, size = 25, search = '', typeId = -1, statusId = 2) => {
      setStandaloneLoading(true);
      try {
        const inputData = {
          Params: [
            { Key: 1, Value: '' },
            { Key: 2, Value: -1 },
            { Key: 3, Value: search },
            { Key: 4, Value: typeId },
            { Key: 5, Value: statusId },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await callBackendApi<{
          Data: SurgeryOrderProcedure[];
          PageContext: { TotalRecords: number; PageSize: number; PageNumber: number };
        }>({
          action: 'clinicalmaster/procedure/GetProcedures',
          data: inputData,
          type: 'post',
        });

        if (res && res.Data) {
          setStandaloneItems(res.Data);
          setStandaloneTotal(res.PageContext?.TotalRecords || 0);
          setStandalonePage(page);
          setStandalonePageSize(size);
        }
      } catch (err) {
        console.error('Failed to fetch procedures in standalone mode:', err);
      } finally {
        setStandaloneLoading(false);
      }
    },
    []
  );

  // Standalone Lookups
  useEffect(() => {
    if (!isHybrid) {
      (async () => {
        try {
          const res = await callBackendApi<any>({
            action: 'General/Options/getoptions',
            data: [
              { Key: 'ProcedureCodeScheme' },
              { Key: 'ProcedureCategory' },
              { Key: 'ActiveStatus' },
              { Key: 'Department' },
              { Key: 'ProcedureType' },
            ],
            type: 'post',
          });
          if (res) {
            setStandaloneLookups({
              ProcedureCodeScheme: res.ProcedureCodeScheme || [],
              ProcedureCategory: res.ProcedureCategory || [],
              ActiveStatus: res.ActiveStatus || [],
              Department: res.Department || [],
              ProcedureType: res.ProcedureType || [],
            });
          }
        } catch (err) {
          console.error('Failed to load lookups in standalone mode:', err);
        }
      })();
      fetchStandaloneData(1, 25, searchCode, procedureTypeId, activeStatusId);
    }
  }, [isHybrid, fetchStandaloneData]);

  // Filter actions
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHybrid && onAction) {
      onAction('search', {
        code: searchCode.trim(),
        name: '',
        procedureTypeId,
        activeStatusId,
      });
    } else {
      fetchStandaloneData(1, pageSize, searchCode.trim(), procedureTypeId, activeStatusId);
    }
  };

  const handleResetFilters = () => {
    setSearchCode('');
    setProcedureTypeId(-1);
    setActiveStatusId(2);
    if (isHybrid && onAction) {
      onAction('resetFilters');
    } else {
      fetchStandaloneData(1, pageSize, '', -1, 2);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage === currentPage) return;
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage, pageSize });
    } else {
      fetchStandaloneData(newPage, pageSize, searchCode, procedureTypeId, activeStatusId);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (isHybrid && onAction) {
      onAction('pageChange', { page: 1, pageSize: newSize });
    } else {
      fetchStandaloneData(1, newSize, searchCode, procedureTypeId, activeStatusId);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (isHybrid && onAction) {
      onAction('refresh');
      setTimeout(() => setIsRefreshing(false), 600);
    } else {
      fetchStandaloneData(currentPage, pageSize, searchCode, procedureTypeId, activeStatusId).then(() => {
        setIsRefreshing(false);
      });
    }
  };

  const handleConfigureOrderSet = (item: SurgeryOrderProcedure) => {
    if (onAction) {
      onAction('edit', { entity: item });
    } else {
      console.log('Configure Surgery Order Set for procedure:', item);
      alert(`Surgery Order Set config for [${item.Code}] ${item.ProcedureName}`);
    }
  };

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const electiveCount = items.filter(
      (p) => p.ProcedureType?.Description?.toUpperCase() === 'ELECTIVE' || p.ProcedureTypeId === 1
    ).length;
    const emergencyCount = items.filter(
      (p) => p.ProcedureType?.Description?.toUpperCase() === 'EMERGENCY' || p.ProcedureTypeId === 2
    ).length;
    const activeCount = items.filter(
      (p) => p.ActiveStatus?.Description?.toLowerCase() === 'active' || p.IsActive === true
    ).length;

    return {
      total: totalItems || items.length,
      elective: electiveCount,
      emergency: emergencyCount,
      active: activeCount,
    };
  }, [items, totalItems]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="so-page-container">
      {/* 1. Executive Header Card */}
      <div className="so-header-card">
        <div className="so-header-left">
          <div className="so-header-icon">
            <i className="fas fa-notes-medical" aria-hidden="true" />
          </div>
          <div>
            <div className="so-header-title-row">
              <h2 className="so-header-title">Surgery Order Set</h2>
              <span className="so-header-tag">OT & Inpatient Master</span>
            </div>
            <p className="so-header-subtitle">
              Configure procedure billing services, doctor share allocations, and surgeon role mappings
            </p>
          </div>
        </div>

        <div className="so-header-right">
          <div className="so-header-chip">
            <span className="so-header-chip-dot" />
            <span>{totalItems.toLocaleString()} Catalogued Procedures</span>
          </div>
          <button
            id="btnRefreshSurgeryOrder"
            type="button"
            className={`so-btn-refresh ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh Procedures List"
          >
            <i className="fas fa-sync-alt" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="so-stats-grid">
        <div className="so-stat-card blue">
          <div className="so-stat-icon-wrap">
            <i className="fas fa-layer-group" />
          </div>
          <div className="so-stat-content">
            <span className="so-stat-label">Total Procedures</span>
            <span className="so-stat-value">{totalItems.toLocaleString()}</span>
            <span className="so-stat-sub">Surgical Procedure Catalog</span>
          </div>
        </div>

        <div className="so-stat-card emerald">
          <div className="so-stat-icon-wrap">
            <i className="fas fa-calendar-check" />
          </div>
          <div className="so-stat-content">
            <span className="so-stat-label">Elective Procedures</span>
            <span className="so-stat-value">
              {metrics.elective > 0 ? `${metrics.elective} On Page` : 'Elective Care'}
            </span>
            <span className="so-stat-sub">Planned Surgical Interventions</span>
          </div>
        </div>

        <div className="so-stat-card amber">
          <div className="so-stat-icon-wrap">
            <i className="fas fa-heartbeat" />
          </div>
          <div className="so-stat-content">
            <span className="so-stat-label">Emergency Procedures</span>
            <span className="so-stat-value">
              {metrics.emergency > 0 ? `${metrics.emergency} On Page` : 'Emergency Care'}
            </span>
            <span className="so-stat-sub">Critical OT Readiness</span>
          </div>
        </div>

        <div className="so-stat-card cyan">
          <div className="so-stat-icon-wrap">
            <i className="fas fa-check-circle" />
          </div>
          <div className="so-stat-content">
            <span className="so-stat-label">Active Master Status</span>
            <span className="so-stat-value">
              {activeStatusId === 2 ? 'Active Only' : activeStatusId === 1 ? 'Inactive Only' : 'All Statuses'}
            </span>
            <span className="so-stat-sub">Ready for Surgery Order Mapping</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar Card */}
      <div className="so-filter-card">
        <form className="so-filter-form" onSubmit={handleSearchSubmit}>
          <div className="so-search-group">
            <i className="fas fa-search so-search-icon" />
            <input
              id="inputSearchProcedure"
              type="text"
              className="so-search-input"
              placeholder="Search by code or procedure name (e.g. SMFS, SOBG)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            {searchCode && (
              <button
                id="btnClearSearch"
                type="button"
                className="so-search-clear"
                onClick={() => setSearchCode('')}
                title="Clear Search"
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          <select
            id="selectProcedureTypeFilter"
            className="so-filter-select"
            value={procedureTypeId}
            onChange={(e) => setProcedureTypeId(parseInt(e.target.value, 10))}
          >
            <option value={-1}>All Procedure Types</option>
            {lookups.ProcedureType &&
              lookups.ProcedureType.filter((t) => t.Id > 0).map((t) => (
                <option key={t.Id} value={t.Id}>
                  {t.Text || t.Description || t.Code}
                </option>
              ))}
            {(!lookups.ProcedureType || lookups.ProcedureType.length === 0) && (
              <>
                <option value={1}>ELECTIVE</option>
                <option value={2}>EMERGENCY</option>
              </>
            )}
          </select>

          <select
            id="selectStatusFilter"
            className="so-filter-select"
            value={activeStatusId}
            onChange={(e) => setActiveStatusId(parseInt(e.target.value, 10))}
          >
            <option value={2}>Active Status</option>
            <option value={1}>Inactive Status</option>
            <option value={-1}>All Statuses</option>
          </select>

          <div className="so-filter-actions">
            <button id="btnFilterSearch" type="submit" className="so-btn-search">
              <i className="fas fa-search" />
              <span>Search</span>
            </button>
            <button
              id="btnFilterReset"
              type="button"
              className="so-btn-reset"
              onClick={handleResetFilters}
            >
              <i className="fas fa-undo" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Elevated Clinical Table */}
      <div className="so-table-card">
        <div className="so-table-header-meta">
          <div className="so-table-meta-left">
            <span>Showing Procedures Catalog</span>
            <span className="so-table-count-badge">
              {totalItems > 0 ? `${startItemIndex}–${endItemIndex} of ${totalItems}` : '0 items'}
            </span>
          </div>
          <div>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        <div className="so-table-responsive">
          <table className="so-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>PROCEDURE NAME</th>
                <th style={{ width: '18%' }}>CODE</th>
                <th style={{ width: '18%' }}>PROCEDURE TYPE</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '12%' }} className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="so-loading-state">
                      <div className="so-loading-spinner">
                        <i className="fas fa-spinner" />
                      </div>
                      <p>Loading procedures for Surgery Order Set...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="so-empty-state">
                      <div className="so-empty-icon">
                        <i className="fas fa-search" />
                      </div>
                      <h4 className="so-empty-title">No Procedures Found</h4>
                      <p className="so-empty-desc">
                        No procedures matched your search criteria. Try modifying your search term or resetting filters.
                      </p>
                      <button
                        type="button"
                        className="so-btn-reset"
                        onClick={handleResetFilters}
                      >
                        <i className="fas fa-undo" />
                        <span>Reset Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const typeDesc = item.ProcedureType?.Description || 'ELECTIVE';
                  const isElective = typeDesc.toUpperCase() === 'ELECTIVE';
                  const isEmergency = typeDesc.toUpperCase() === 'EMERGENCY';
                  const isActive =
                    item.ActiveStatus?.Description?.toLowerCase() === 'active' ||
                    item.IsActive === true;

                  return (
                    <tr key={item.Id}>
                      {/* Procedure Name & Meta */}
                      <td>
                        <div className="so-proc-cell">
                          <span className="so-proc-name">{item.ProcedureName}</span>
                          <div className="so-proc-tags">
                            {item.Duration && (
                              <span className="so-duration-tag" title="Procedure Duration">
                                <i className="far fa-clock" />
                                {item.Duration} mins
                              </span>
                            )}
                            {item.ProcedureSubCategory?.Description && (
                              <span className="so-subcat-tag">
                                {item.ProcedureSubCategory.Description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Monospace Code */}
                      <td>
                        <span className="so-code-badge">{item.Code}</span>
                      </td>

                      {/* Procedure Type */}
                      <td>
                        <span
                          className={`so-type-badge ${
                            isElective ? 'elective' : isEmergency ? 'emergency' : 'default'
                          }`}
                        >
                          {typeDesc}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`so-status-pill ${isActive ? 'active' : 'inactive'}`}
                        >
                          <span className="so-status-dot" />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Configure Order Set Action */}
                      <td className="text-center">
                        <button
                          id={`btnConfigureOrderSet-${item.Id}`}
                          type="button"
                          className="so-btn-configure"
                          onClick={() => handleConfigureOrderSet(item)}
                          title="Configure Surgery Order Set (Billing Services & Doctor Shares)"
                        >
                          <i className="fas fa-sliders-h" />
                          <span>Configure</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Sticky Pagination Footer */}
      {totalItems > 0 && (
        <div className="so-pagination-bar">
          <div className="so-pagination-left">
            <div className="so-page-size-selector">
              <span>Show:</span>
              <select
                id="selectPageSize"
                className="so-page-size-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
            <span>
              Showing {startItemIndex} to {endItemIndex} of {totalItems.toLocaleString()} procedures
            </span>
          </div>

          <div className="so-pagination-controls">
            <button
              id="btnPageFirst"
              type="button"
              className="so-page-btn"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(1)}
              title="First Page"
            >
              <i className="fas fa-angle-double-left" />
            </button>
            <button
              id="btnPagePrev"
              type="button"
              className="so-page-btn"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              title="Previous Page"
            >
              <i className="fas fa-angle-left" />
            </button>

            {getPageNumbers().map((p, idx) =>
              typeof p === 'number' ? (
                <button
                  key={idx}
                  type="button"
                  className={`so-page-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="so-page-ellipsis">
                  ...
                </span>
              )
            )}

            <button
              id="btnPageNext"
              type="button"
              className="so-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              title="Next Page"
            >
              <i className="fas fa-angle-right" />
            </button>
            <button
              id="btnPageLast"
              type="button"
              className="so-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              title="Last Page"
            >
              <i className="fas fa-angle-double-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
