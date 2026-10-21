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

export interface PackageEntity {
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
  Guarantor?: {
    Id?: number;
    GuarantorId?: number;
    GuarantorName?: string;
    GuarantorTypeId?: number;
    GuarantorType?: {
      Description?: string;
    };
  };
  ActiveStatus?: {
    Description?: string;
    ColorCode?: string;
  };
  ServiceRateCategory?: {
    Id?: number;
    ServiceRateCategory?: string;
    Description?: string;
  };
}

export interface PackageListScreenProps {
  reactProps?: {
    items?: PackageEntity[];
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
      GuarantorTypeId?: number;
      GuarantorName?: number;
      FacilityId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      Department?: LookupOption[];
      ActiveStatus?: LookupOption[];
      Facility?: LookupOption[];
      Guarantor?: LookupOption[];
      GuarantorType?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const PackageListScreen: React.FC<PackageListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Facility ID from session
  const defaultFacilityId = sessionHelper.getCurrentFacilityId() || 1;

  // Standalone States (when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<PackageEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Department: LookupOption[];
    ActiveStatus: LookupOption[];
    Facility: LookupOption[];
    Guarantor: LookupOption[];
    GuarantorType: LookupOption[];
  }>({
    Department: [],
    ActiveStatus: [],
    Facility: [],
    Guarantor: [],
    GuarantorType: [],
  });

  // Filter States
  const [searchCode, setSearchCode] = useState<string>(
    reactProps?.currentfilter?.IPPackageCode || ''
  );
  const [payerId, setPayerId] = useState<number>(
    reactProps?.currentfilter?.GuarantorName !== undefined ? reactProps.currentfilter.GuarantorName : -1
  );
  const [payerTypeId, setPayerTypeId] = useState<number>(
    reactProps?.currentfilter?.GuarantorTypeId !== undefined ? reactProps.currentfilter.GuarantorTypeId : -1
  );
  const [facilityId, setFacilityId] = useState<number>(
    reactProps?.currentfilter?.FacilityId !== undefined ? reactProps.currentfilter.FacilityId : defaultFacilityId
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );

  // Modal / Toast UI feedback
  const [itemToDelete, setItemToDelete] = useState<PackageEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.IPPackageCode !== undefined) setSearchCode(reactProps.currentfilter.IPPackageCode);
      if (reactProps.currentfilter.GuarantorName !== undefined) setPayerId(reactProps.currentfilter.GuarantorName);
      if (reactProps.currentfilter.GuarantorTypeId !== undefined) setPayerTypeId(reactProps.currentfilter.GuarantorTypeId);
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
      Guarantor: reactProps?.lookup?.Guarantor || standaloneLookups.Guarantor,
      GuarantorType: reactProps?.lookup?.GuarantorType || standaloneLookups.GuarantorType,
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

  // Standalone: Fetch Lookups
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'Department' },
          { Key: 'ActiveStatus' },
          { Key: 'Facility' },
          {
            Key: 'Guarantor',
            Request: {
              Params: [{ Key: 7, Value: [-1, defaultFacilityId] }],
            },
          },
          { Key: 'GuarantorType' },
        ],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              Department: res.Department || [],
              ActiveStatus: res.ActiveStatus || [],
              Facility: res.Facility || [],
              Guarantor: res.Guarantor || [],
              GuarantorType: res.GuarantorType || [],
            });
          }
        })
        .catch((err) => console.error('Failed to load lookups:', err));
    }
  }, [isHybrid, defaultFacilityId]);

  // Standalone: Fetch IP Packages
  const fetchStandalonePackages = useCallback(
    (page: number, filtersToUse?: any) => {
      setIsLoading(true);
      const codeVal = filtersToUse?.IPPackageCode !== undefined ? filtersToUse.IPPackageCode : searchCode;
      const pId = filtersToUse?.GuarantorName !== undefined ? filtersToUse.GuarantorName : payerId;
      const ptId = filtersToUse?.GuarantorTypeId !== undefined ? filtersToUse.GuarantorTypeId : payerTypeId;
      const fId = filtersToUse?.FacilityId !== undefined ? filtersToUse.FacilityId : facilityId;
      const sId = filtersToUse?.ActiveStatusId !== undefined ? filtersToUse.ActiveStatusId : activeStatusId;

      const inputData = {
        Params: [
          { Key: 1, Value: codeVal },
          { Key: 2, Value: ptId },
          { Key: 3, Value: pId },
          { Key: 4, Value: fId },
          { Key: 5, Value: sId },
        ],
        PageContext: {
          PageSize: standalonePageSize,
          PageNumber: page,
        },
      };

      callBackendApi({
        action: 'clinicalmaster/IPPackage/GetIPPackages',
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
          console.error('Failed to get IP packages:', err);
        });
    },
    [searchCode, payerId, payerTypeId, facilityId, activeStatusId, standalonePageSize]
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
        GuarantorName: Number(payerId),
        GuarantorTypeId: Number(payerTypeId),
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
    setPayerId(-1);
    setPayerTypeId(-1);
    setFacilityId(defaultFacilityId);
    setActiveStatusId(2);

    if (isHybrid && onAction) {
      onAction('resetFilters', {
        IPPackageCode: '',
        GuarantorName: -1,
        GuarantorTypeId: -1,
        FacilityId: defaultFacilityId,
        ActiveStatusId: 2,
      });
    } else {
      setStandalonePage(1);
      fetchStandalonePackages(1, {
        IPPackageCode: '',
        GuarantorName: -1,
        GuarantorTypeId: -1,
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
      window.location.hash = '#/app/app.package/0';
    }
  };

  // Handler: Edit Package
  const handleEdit = (item: PackageEntity) => {
    if (isHybrid && onAction) {
      onAction('edit', item);
    } else {
      window.location.hash = `#/app/app.package/${item.Id}`;
    }
  };

  // Handler: Delete Package Trigger
  const handleDeleteTrigger = (item: PackageEntity) => {
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
          <div className="pkg-header-icon">
            <i className="fa fa-archive" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Clinical Packages Catalog</h1>
              <span className="pkg-header-tag">CLINICAL MASTER</span>
            </div>
            <p className="pkg-header-subtitle">
              Comprehensive inpatient packages directory, surgical bundles, tariff mapping & payer agreements
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
            id="btnAddPackage"
            className="pkg-btn-add"
            onClick={handleAddNew}
            title="Create new clinical package"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Packages</span>
            <span className="pkg-stat-value">{formatNumber(totalItems)}</span>
            <span className="pkg-stat-subtext">Registered clinical packages</span>
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
            <span className="pkg-stat-label">Payers / TPA</span>
            <span className="pkg-stat-value">
              {lookups.Guarantor.length > 0 ? lookups.Guarantor.filter((g) => g.Id !== -1).length : '—'}
            </span>
            <span className="pkg-stat-subtext">Associated insurers</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-shield" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="pkg-filter-card">
        <div className="pkg-filter-row">
          {/* Code / Package Name Search */}
          <div className="pkg-filter-col pkg-filter-col-search">
            <label className="pkg-filter-label" htmlFor="inputSearchPackage">
              Code / Package Name
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-search pkg-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputSearchPackage"
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

          {/* Payer Name Filter */}
          <div className="pkg-filter-col">
            <label className="pkg-filter-label" htmlFor="selectPayerFilter">
              Payer Name
            </label>
            <select
              id="selectPayerFilter"
              className="pkg-filter-select"
              value={payerId}
              onChange={(e) => setPayerId(Number(e.target.value))}
            >
              <option value={-1}>All Payers</option>
              {lookups.Guarantor.filter((g) => g.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Payer Type Filter */}
          <div className="pkg-filter-col">
            <label className="pkg-filter-label" htmlFor="selectPayerTypeFilter">
              Payer Type
            </label>
            <select
              id="selectPayerTypeFilter"
              className="pkg-filter-select"
              value={payerTypeId}
              onChange={(e) => setPayerTypeId(Number(e.target.value))}
            >
              <option value={-1}>All Types</option>
              {lookups.GuarantorType.filter((gt) => gt.Id !== -1).map((opt) => (
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
            <span>Loading clinical packages...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="pkg-empty-state">
            <i className="fa fa-archive pkg-empty-icon" aria-hidden="true" />
            <h3 className="pkg-empty-title">No clinical packages found</h3>
            <p className="pkg-empty-desc">
              Try adjusting your search criteria, clearing status or payer filters, or creating a new package bundle.
            </p>
            <button type="button" className="pkg-btn-add" onClick={handleAddNew}>
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Package</span>
            </button>
          </div>
        ) : (
          <div className="pkg-table-responsive">
            <table className="pkg-table">
              <thead>
                <tr>
                  <th className="pkg-col-idx">#</th>
                  <th>Package Code</th>
                  <th>Package Name & Department</th>
                  <th>Payer Type</th>
                  <th>Payer Name</th>
                  <th style={{ textAlign: 'right' }}>Package Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
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
                  const amount = item.PackageAmount ?? item.IPPackageAmount ?? 0;

                  return (
                    <tr key={item.Id || index}>
                      <td className="pkg-col-idx">{rowIndex}</td>

                      {/* Code Badge */}
                      <td>
                        <span className="pkg-code-badge" title={item.IPPackageCode}>
                          {item.IPPackageCode || '—'}
                        </span>
                      </td>

                      {/* Package Name & Department */}
                      <td>
                        <div className="pkg-name-cell">
                          <span className="pkg-name-primary" title={item.IPPackageName}>
                            {item.IPPackageName}
                          </span>
                          <span className="pkg-dept-text" title={item.Department?.DepartmentName}>
                            {item.Department?.DepartmentName || 'General Specialty'}
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

                      {/* Payer Type */}
                      <td>
                        <span className="pkg-payer-type-badge">
                          {item.Guarantor?.GuarantorType?.Description || 'SELF'}
                        </span>
                      </td>

                      {/* Payer Name */}
                      <td>
                        <span className="pkg-payer-name-text">
                          {item.Guarantor?.GuarantorName || 'Self / General Pay'}
                        </span>
                      </td>

                      {/* Package Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <span className="pkg-amount-val">{formatCurrency(amount)}</span>
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
                            id={`btnEditPackage_${item.Id}`}
                            className="pkg-action-btn pkg-action-edit"
                            title={isDraft ? 'Edit draft package' : 'View / Edit package details'}
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {/* Delete button only shown for Draft items, matching legacy: ng-show="entity.ActiveStatusId==1" */}
                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              id={`btnDeletePackage_${item.Id}`}
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
        title="Delete Package"
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
