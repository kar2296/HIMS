import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

export interface MultiPackageEntity {
  Id: number;
  IPPackageCode: string;
  IPPackageShortCode?: string;
  IPPackageName: string;
  IPPackageDescription?: string;
  IPPackageDays?: number;
  ICUDays?: number;
  IsUnlimitedServices?: boolean;
  ActualAmount?: number | string;
  PackageAmount?: number | string;
  IPPackageAmount?: number | string;
  DepartmentId?: number;
  GuarantorId?: number;
  GuarantorTypeId?: number;
  FacilityId?: number;
  ActiveStatusId?: number;
  Department?: {
    DepartmentName?: string;
  };
  ActiveStatus?: {
    Description?: string;
    ColorCode?: string;
  };
  IPPackageTariffDetail?: any[];
}

export interface MultiPackageListScreenProps {
  reactProps?: {
    items?: MultiPackageEntity[];
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
      IPPackageCode?: string;
      DepartmentId?: number;
      FacilityId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      Department?: LookupOption[];
      ActiveStatus?: LookupOption[];
      Facility?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const MultiPackageListScreen: React.FC<MultiPackageListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Facility ID from session
  const defaultFacilityId = sessionHelper.getCurrentFacilityId() || 1;

  // Standalone States (when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<MultiPackageEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Department: LookupOption[];
    ActiveStatus: LookupOption[];
    Facility: LookupOption[];
  }>({
    Department: [],
    ActiveStatus: [],
    Facility: [],
  });

  // Filter States
  const [searchCode, setSearchCode] = useState<string>(
    reactProps?.currentfilter?.IPPackageCode || ''
  );
  const [departmentId, setDepartmentId] = useState<number>(
    reactProps?.currentfilter?.DepartmentId !== undefined ? reactProps.currentfilter.DepartmentId : -1
  );
  const [facilityId, setFacilityId] = useState<number>(
    reactProps?.currentfilter?.FacilityId !== undefined ? reactProps.currentfilter.FacilityId : defaultFacilityId
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );

  // Modal / Toast UI feedback
  const [itemToDelete, setItemToDelete] = useState<MultiPackageEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.IPPackageCode !== undefined) setSearchCode(reactProps.currentfilter.IPPackageCode);
      if (reactProps.currentfilter.DepartmentId !== undefined) setDepartmentId(reactProps.currentfilter.DepartmentId);
      if (reactProps.currentfilter.FacilityId !== undefined) setFacilityId(reactProps.currentfilter.FacilityId);
      if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
    }
  }, [reactProps?.currentfilter]);

  // Lookups memo
  const lookups = useMemo(() => {
    return {
      Department: reactProps?.lookup?.Department || standaloneLookups.Department,
      ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
      Facility: reactProps?.lookup?.Facility || standaloneLookups.Facility,
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Active Items & Pagination
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const currentPage = isHybrid
    ? (reactProps?.pagerObj?.currentPage || reactProps?.currentPage || 1)
    : standalonePage;
  const pageSize = isHybrid
    ? (reactProps?.pagerObj?.pageSize || reactProps?.pageSize || 25)
    : standalonePageSize;
  const totalItems = isHybrid
    ? (reactProps?.pagerObj?.totalItems ?? reactProps?.totalItems ?? items.length)
    : standaloneTotal;

  // Current Facility Name
  const currentFacilityName = useMemo(() => {
    const matched = lookups.Facility.find((f) => f.Id === facilityId);
    return matched?.Text || 'SHUVADARSINI HOSPITAL';
  }, [lookups.Facility, facilityId]);

  // Standalone: Fetch Lookups
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'Department' },
          { Key: 'ActiveStatus' },
          { Key: 'Facility' },
        ],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              Department: res.Department || [],
              ActiveStatus: res.ActiveStatus || [],
              Facility: res.Facility || [],
            });
          }
        })
        .catch((err) => console.error('Failed to load lookups:', err));
    }
  }, [isHybrid]);

  // Standalone: Fetch Tariff IP Packages
  const fetchStandalonePackages = useCallback(
    (page: number, filtersToUse?: any) => {
      setIsLoading(true);
      const codeVal = filtersToUse?.IPPackageCode !== undefined ? filtersToUse.IPPackageCode : searchCode;
      const deptId = filtersToUse?.DepartmentId !== undefined ? filtersToUse.DepartmentId : departmentId;
      const fId = filtersToUse?.FacilityId !== undefined ? filtersToUse.FacilityId : facilityId;
      const sId = filtersToUse?.ActiveStatusId !== undefined ? filtersToUse.ActiveStatusId : activeStatusId;

      const inputData = {
        Params: [
          { Key: 1, Value: codeVal },
          { Key: 8, Value: deptId },
          { Key: 4, Value: fId },
          { Key: 5, Value: sId },
        ],
        PageContext: {
          PageSize: standalonePageSize,
          PageNumber: page,
        },
      };

      callBackendApi({
        action: 'clinicalmaster/IPPackage/GetTariffIPPackages',
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
          console.error('Failed to get tariff IP packages:', err);
        });
    },
    [searchCode, departmentId, facilityId, activeStatusId, standalonePageSize]
  );

  // Standalone mount fetch
  useEffect(() => {
    if (!isHybrid) {
      fetchStandalonePackages(1);
    }
  }, [isHybrid, fetchStandalonePackages]);

  // Handler: Execute Search
  const handleSearch = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        IPPackageCode: searchCode.trim(),
        DepartmentId: Number(departmentId),
        FacilityId: Number(facilityId),
        ActiveStatusId: Number(activeStatusId),
      });
    } else {
      setStandalonePage(1);
      fetchStandalonePackages(1);
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearchCode('');
    setDepartmentId(-1);
    setFacilityId(defaultFacilityId);
    setActiveStatusId(2);

    if (isHybrid && onAction) {
      onAction('resetFilters', {
        IPPackageCode: '',
        DepartmentId: -1,
        FacilityId: defaultFacilityId,
        ActiveStatusId: 2,
      });
    } else {
      setStandalonePage(1);
      fetchStandalonePackages(1, {
        IPPackageCode: '',
        DepartmentId: -1,
        FacilityId: defaultFacilityId,
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
      fetchStandalonePackages(newPage);
    }
  };

  // Handler: Add New Package
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
    } else {
      window.location.hash = '#/app/app.multitariffpackage/0';
    }
  };

  // Handler: Edit Package
  const handleEdit = (item: MultiPackageEntity) => {
    if (isHybrid && onAction) {
      onAction('edit', item);
    } else {
      window.location.hash = `#/app/app.multitariffpackage/${item.Id}`;
    }
  };

  // Handler: Delete Package Trigger
  const handleDeleteTrigger = (item: MultiPackageEntity) => {
    setItemToDelete(item);
  };

  // Handler: Delete Confirmed
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', target);
    } else {
      callBackendApi({
        action: 'clinicalmaster/IPPackage/DeleteIPPackage',
        data: { Id: target.Id },
      })
        .then(() => {
          setToastMessage({ text: 'Package deleted successfully', type: 'success' });
          fetchStandalonePackages(standalonePage);
        })
        .catch((err) => {
          setToastMessage({ text: 'Failed to delete package', type: 'error' });
          console.error(err);
        });
    }
  };

  // Number Formatter
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  // Auto dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="pkg-page-container">
      {/* 1. Executive Header Card */}
      <div className="pkg-header-card">
        <div className="pkg-header-left">
          <div className="pkg-header-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <i className="fa fa-tags" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Insurance & Tariff Packages</h1>
              <span className="pkg-header-tag">CLINICAL MASTER</span>
            </div>
            <p className="pkg-header-subtitle">
              Comprehensive multi-tariff clinical packages directory, departmental bundles & procedure pricing
            </p>
          </div>
        </div>

        <div className="pkg-header-right">
          <div className="pkg-header-chip" title="Current facility affiliation">
            <span className="pkg-header-chip-dot" />
            <span>{currentFacilityName}</span>
          </div>

          <button
            type="button"
            id="btnAddTariffPackage"
            className="pkg-btn-add"
            onClick={handleAddNew}
            title="Create new multi-tariff clinical package"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Tariff Package</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Packages</span>
            <span className="pkg-stat-value">{formatNumber(totalItems)}</span>
            <span className="pkg-stat-subtext">Registered tariff packages</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-cubes" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Active Packages</span>
            <span className="pkg-stat-value">
              {formatNumber(items.filter((p) => p.ActiveStatusId === 2 || !p.ActiveStatusId).length)}
            </span>
            <span className="pkg-stat-subtext">On current page</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Departments</span>
            <span className="pkg-stat-value">
              {lookups.Department.length > 0 ? lookups.Department.filter((d) => d.Id !== -1).length : '—'}
            </span>
            <span className="pkg-stat-subtext">Clinical specialties</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-hospital-o" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Active Hospital</span>
            <span className="pkg-stat-value" style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
              {currentFacilityName.length > 18 ? currentFacilityName.slice(0, 18) + '...' : currentFacilityName}
            </span>
            <span className="pkg-stat-subtext">Primary facility</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-building-o" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="pkg-filter-card">
        <div className="pkg-filter-row">
          {/* Code / Package Name Search */}
          <div className="pkg-filter-col pkg-filter-col-search">
            <label className="pkg-filter-label" htmlFor="inputSearchTariffPackage">
              Code / Package Name
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-search pkg-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputSearchTariffPackage"
                className="pkg-filter-input"
                placeholder="Search by package code or name..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {searchCode && (
                <button
                  type="button"
                  className="pkg-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setSearchCode('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div className="pkg-filter-col">
            <label className="pkg-filter-label" htmlFor="selectDepartmentFilter">
              Department
            </label>
            <select
              id="selectDepartmentFilter"
              className="pkg-filter-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
            >
              <option value={-1}>All Departments</option>
              {lookups.Department.filter((d) => d.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital / Facility Filter */}
          <div className="pkg-filter-col">
            <label className="pkg-filter-label" htmlFor="selectFacilityFilter">
              Hospital
            </label>
            <select
              id="selectFacilityFilter"
              className="pkg-filter-select"
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
            >
              <option value={-1}>All Hospitals</option>
              {lookups.Facility.filter((f) => f.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="pkg-filter-col" style={{ flex: '1 1 130px' }}>
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
            <span>Loading tariff packages...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="pkg-empty-state">
            <i className="fa fa-tags pkg-empty-icon" aria-hidden="true" />
            <h3 className="pkg-empty-title">No tariff packages found</h3>
            <p className="pkg-empty-desc">
              Try adjusting your search criteria, clearing status or department filters, or creating a new package.
            </p>
            <button type="button" className="pkg-btn-add" onClick={handleAddNew}>
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Tariff Package</span>
            </button>
          </div>
        ) : (
          <div className="pkg-table-responsive">
            <table className="pkg-table" id="tblTariffPackages">
              <thead>
                <tr>
                  <th className="pkg-col-idx" style={{ width: '55px' }}>#</th>
                  <th style={{ width: '150px' }}>Package Code</th>
                  <th style={{ minWidth: '320px' }}>Package Name</th>
                  <th style={{ width: '220px' }}>Department</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '110px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const isDraft = item.ActiveStatusId === 1;
                  const isInactive = item.ActiveStatusId === 3;
                  const statusDesc =
                    item.ActiveStatus?.Description ||
                    (isDraft ? 'Draft' : isInactive ? 'Inactive' : 'Active');

                  return (
                    <tr key={item.Id || index}>
                      <td className="pkg-col-idx">{rowIndex}</td>

                      {/* Code Badge */}
                      <td>
                        <span className="pkg-code-badge" title={item.IPPackageCode}>
                          {item.IPPackageCode || '—'}
                        </span>
                      </td>

                      {/* Package Name */}
                      <td>
                        <div className="pkg-name-cell">
                          <span className="pkg-name-primary" title={item.IPPackageName}>
                            {item.IPPackageName}
                          </span>

                          {/* Quick Info Tags */}
                          {(item.IPPackageDays || item.ICUDays || item.IsUnlimitedServices) && (
                            <div className="pkg-tags-row">
                              {Boolean(item.IPPackageDays) && (
                                <span className="pkg-tag pkg-tag-days">
                                  <i className="fa fa-calendar-o" style={{ fontSize: '9px' }} />{' '}
                                  {item.IPPackageDays} Days
                                </span>
                              )}
                              {Boolean(item.ICUDays) && (
                                <span className="pkg-tag pkg-tag-icu">
                                  <i className="fa fa-heartbeat" style={{ fontSize: '9px' }} />{' '}
                                  {item.ICUDays} ICU Days
                                </span>
                              )}
                              {item.IsUnlimitedServices && (
                                <span className="pkg-tag pkg-tag-unlimited">
                                  Unlimited Services
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa fa-hospital-o" style={{ color: '#0284c7', fontSize: '12px' }} />
                          <span className="pkg-dept-text" title={item.Department?.DepartmentName}>
                            {item.Department?.DepartmentName || 'General Specialty'}
                          </span>
                        </div>
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
                            id={`btnEditTariffPackage_${item.Id}`}
                            className="pkg-action-btn pkg-action-edit"
                            title={isDraft ? 'Edit draft package' : 'View / Edit tariff package details'}
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {/* Delete button shown only for Draft items, matching legacy: ng-show="entity.ActiveStatusId==1" */}
                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              id={`btnDeleteTariffPackage_${item.Id}`}
                              className="pkg-action-btn pkg-action-delete"
                              title="Delete draft package"
                              onClick={() => handleDeleteTrigger(item)}
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
        {totalItems > 0 && (
          <div className="pkg-pagination-bar">
            <div className="pkg-pagination-info">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong>{formatNumber(totalItems)}</strong> catalog entries
            </div>

            <div className="pkg-pagination-controls">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
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
        title="Delete Tariff Package"
        message={`Are you sure you want to delete package "${itemToDelete?.IPPackageCode} - ${itemToDelete?.IPPackageName}"? This action cannot be undone.`}
        confirmLabel="Delete Package"
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
