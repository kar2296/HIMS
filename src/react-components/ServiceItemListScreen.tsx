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

export interface ServiceItemEntity {
  Id: number;
  ItemCode: string;
  ShortCode?: string;
  Name: string;
  Description?: string;
  CategoryId?: number;
  SubCategoryId?: number;
  DepartmentId?: number;
  SubDepartmentId?: number;
  MasterTypeId?: number;
  MasterItemId?: number;
  MasterName?: string;
  ItemCost?: number | string;
  ActiveFrom?: string;
  ActiveTo?: string;
  FacilityId?: number;
  IsOrderable?: boolean;
  IsRateEditable?: boolean;
  IsZeroBill?: boolean;
  IsSurgicalProcedure?: boolean;
  IsEquipmentHour?: boolean;
  IsEquipmentDaily?: boolean;
  IsBedChargeHour?: boolean;
  IsBedChargeDaily?: boolean;
  IsNightCharge?: boolean;
  CanDiscountProportionate?: boolean;
  IsPackage?: boolean;
  ActiveStatusId?: number;
  Department?: {
    DepartmentName?: string;
    Description?: string;
  };
  ParentCategory?: {
    ServiceCategoryName?: string;
    Description?: string;
  };
  SubCategory?: {
    ServiceCategoryName?: string;
  };
  ActiveStatus?: {
    Description?: string;
    ColorCode?: string;
    Text?: string;
  };
  Facility?: {
    FacilityName?: string;
  };
}

export interface AdvancedFilterState {
  SubCategoryId: number;
  FacilityId: number;
  MasterTypeId: number;
  SubDepartmentId: number;
  MasterName: string;
  IsPackage: boolean;
  IsOrderable: boolean;
  IsRateEditable: boolean;
  IsZeroBill: boolean;
  IsSurgicalProcedure: boolean;
  IsEquipmentHour: boolean;
  IsEquipmentDaily: boolean;
  IsBedChargeHour: boolean;
  IsBedChargeDaily: boolean;
  IsNightCharge: boolean;
  CanDiscountProportionate: boolean;
}

export interface ServiceItemListScreenProps {
  reactProps?: {
    items?: ServiceItemEntity[];
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
      Code?: string;
      Name?: string;
      DepartmentId?: number;
      CategoryId?: number;
      ActiveStatusId?: number;
      FacilityId?: number;
    };
    advancedfilter?: Partial<AdvancedFilterState>;
    lookup?: {
      Department?: LookupOption[];
      SubDepartment?: LookupOption[];
      ActiveStatus?: LookupOption[];
      ServiceSubCategory?: LookupOption[];
      ServiceCategory?: LookupOption[];
      ServiceGroup?: LookupOption[];
      MasterType?: LookupOption[];
      Facility?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ServiceItemListScreen: React.FC<ServiceItemListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  // Hybrid Bridge Detection
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Facility ID from session
  const defaultFacilityId = sessionHelper.getCurrentFacilityId() || 1;

  // Standalone States (used when running purely in React)
  const [standaloneItems, setStandaloneItems] = useState<ServiceItemEntity[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Department: LookupOption[];
    SubDepartment: LookupOption[];
    ActiveStatus: LookupOption[];
    ServiceSubCategory: LookupOption[];
    ServiceCategory: LookupOption[];
    ServiceGroup: LookupOption[];
    MasterType: LookupOption[];
    Facility: LookupOption[];
  }>({
    Department: [],
    SubDepartment: [],
    ActiveStatus: [],
    ServiceSubCategory: [],
    ServiceCategory: [],
    ServiceGroup: [],
    MasterType: [],
    Facility: [],
  });

  // Primary Filter State
  const [searchCode, setSearchCode] = useState<string>(
    reactProps?.currentfilter?.Code || ''
  );
  const [departmentId, setDepartmentId] = useState<number>(
    reactProps?.currentfilter?.DepartmentId !== undefined ? reactProps.currentfilter.DepartmentId : -1
  );
  const [facilityId, setFacilityId] = useState<number>(
    reactProps?.currentfilter?.FacilityId !== undefined ? reactProps.currentfilter.FacilityId : defaultFacilityId
  );
  const [categoryId, setCategoryId] = useState<number>(
    reactProps?.currentfilter?.CategoryId !== undefined ? reactProps.currentfilter.CategoryId : -1
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );

  // Advanced Filter Drawer State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    SubCategoryId: reactProps?.advancedfilter?.SubCategoryId ?? -1,
    FacilityId: reactProps?.advancedfilter?.FacilityId ?? -1,
    MasterTypeId: reactProps?.advancedfilter?.MasterTypeId ?? -1,
    SubDepartmentId: reactProps?.advancedfilter?.SubDepartmentId ?? -1,
    MasterName: reactProps?.advancedfilter?.MasterName ?? '',
    IsPackage: Boolean(reactProps?.advancedfilter?.IsPackage),
    IsOrderable: Boolean(reactProps?.advancedfilter?.IsOrderable),
    IsRateEditable: Boolean(reactProps?.advancedfilter?.IsRateEditable),
    IsZeroBill: Boolean(reactProps?.advancedfilter?.IsZeroBill),
    IsSurgicalProcedure: Boolean(reactProps?.advancedfilter?.IsSurgicalProcedure),
    IsEquipmentHour: Boolean(reactProps?.advancedfilter?.IsEquipmentHour),
    IsEquipmentDaily: Boolean(reactProps?.advancedfilter?.IsEquipmentDaily),
    IsBedChargeHour: Boolean(reactProps?.advancedfilter?.IsBedChargeHour),
    IsBedChargeDaily: Boolean(reactProps?.advancedfilter?.IsBedChargeDaily),
    IsNightCharge: Boolean(reactProps?.advancedfilter?.IsNightCharge),
    CanDiscountProportionate: Boolean(reactProps?.advancedfilter?.CanDiscountProportionate),
  });

  // UI Feedback States
  const [itemToDelete, setItemToDelete] = useState<ServiceItemEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.Code !== undefined) setSearchCode(reactProps.currentfilter.Code);
      if (reactProps.currentfilter.DepartmentId !== undefined) setDepartmentId(reactProps.currentfilter.DepartmentId);
      if (reactProps.currentfilter.FacilityId !== undefined) setFacilityId(reactProps.currentfilter.FacilityId);
      if (reactProps.currentfilter.CategoryId !== undefined) setCategoryId(reactProps.currentfilter.CategoryId);
      if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
    }
    if (reactProps?.advancedfilter) {
      setAdvancedFilters((prev) => ({
        ...prev,
        ...reactProps.advancedfilter,
      }));
    }
  }, [reactProps?.currentfilter, reactProps?.advancedfilter]);

  // Active Lookups
  const lookups = useMemo(() => {
    return {
      Department: reactProps?.lookup?.Department || standaloneLookups.Department,
      SubDepartment: reactProps?.lookup?.SubDepartment || standaloneLookups.SubDepartment,
      ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus,
      ServiceSubCategory: reactProps?.lookup?.ServiceSubCategory || standaloneLookups.ServiceSubCategory,
      ServiceCategory: reactProps?.lookup?.ServiceCategory || standaloneLookups.ServiceCategory,
      ServiceGroup: reactProps?.lookup?.ServiceGroup || standaloneLookups.ServiceGroup,
      MasterType: reactProps?.lookup?.MasterType || standaloneLookups.MasterType,
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

  // Count active advanced filter flags
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.SubCategoryId !== -1) count++;
    if (advancedFilters.SubDepartmentId !== -1) count++;
    if (advancedFilters.MasterTypeId !== -1) count++;
    if (advancedFilters.MasterName.trim() !== '') count++;
    if (advancedFilters.IsPackage) count++;
    if (advancedFilters.IsOrderable) count++;
    if (advancedFilters.IsRateEditable) count++;
    if (advancedFilters.IsZeroBill) count++;
    if (advancedFilters.IsSurgicalProcedure) count++;
    if (advancedFilters.IsEquipmentHour) count++;
    if (advancedFilters.IsEquipmentDaily) count++;
    if (advancedFilters.IsBedChargeHour) count++;
    if (advancedFilters.IsBedChargeDaily) count++;
    if (advancedFilters.IsNightCharge) count++;
    if (advancedFilters.CanDiscountProportionate) count++;
    return count;
  }, [advancedFilters]);

  // Load Lookups in standalone mode
  useEffect(() => {
    if (!isHybrid) {
      callBackendApi({
        action: 'General/Options/getoptions',
        data: [
          { Key: 'Department' },
          { Key: 'SubDepartment' },
          { Key: 'ActiveStatus' },
          { Key: 'ServiceSubCategory' },
          { Key: 'ServiceCategory' },
          { Key: 'ServiceGroup' },
          { Key: 'MasterType' },
          { Key: 'Facility' },
        ],
      })
        .then((res: any) => {
          if (res && typeof res === 'object') {
            setStandaloneLookups({
              Department: res.Department || [],
              SubDepartment: res.SubDepartment || [],
              ActiveStatus: res.ActiveStatus || [],
              ServiceSubCategory: res.ServiceSubCategory || [],
              ServiceCategory: res.ServiceCategory || [],
              ServiceGroup: res.ServiceGroup || [],
              MasterType: res.MasterType || [],
              Facility: res.Facility || [],
            });
          }
        })
        .catch((err) => console.error('Error fetching lookups:', err));
    }
  }, [isHybrid]);

  // Fetch Items in Standalone Mode
  const fetchStandaloneItems = useCallback(
    (page: number, filtersToUse?: any) => {
      setIsLoading(true);
      const codeVal = filtersToUse?.Code !== undefined ? filtersToUse.Code : searchCode;
      const deptVal = filtersToUse?.DepartmentId !== undefined ? filtersToUse.DepartmentId : departmentId;
      const catVal = filtersToUse?.CategoryId !== undefined ? filtersToUse.CategoryId : categoryId;
      const statusVal = filtersToUse?.ActiveStatusId !== undefined ? filtersToUse.ActiveStatusId : activeStatusId;
      const facVal = filtersToUse?.FacilityId !== undefined ? filtersToUse.FacilityId : facilityId;
      const adv = filtersToUse?.advanced || advancedFilters;

      const inputData = {
        Params: [
          { Key: 1, Value: codeVal },
          { Key: 2, Value: deptVal },
          { Key: 3, Value: catVal },
          { Key: 4, Value: statusVal },
          { Key: 34, Value: facVal },
          { Key: 7, Value: adv.SubCategoryId },
          { Key: 8, Value: adv.FacilityId },
          { Key: 9, Value: adv.MasterTypeId },
          { Key: 10, Value: adv.SubDepartmentId },
          { Key: 12, Value: adv.MasterName },
          { Key: 11, Value: adv.IsPackage },
          { Key: 15, Value: adv.IsOrderable },
          { Key: 16, Value: adv.IsRateEditable },
          { Key: 17, Value: adv.IsZeroBill },
          { Key: 18, Value: adv.IsSurgicalProcedure },
          { Key: 19, Value: adv.IsEquipmentHour },
          { Key: 20, Value: adv.IsEquipmentDaily },
          { Key: 21, Value: adv.IsBedChargeHour },
          { Key: 22, Value: adv.IsBedChargeDaily },
          { Key: 23, Value: adv.IsNightCharge },
          { Key: 24, Value: adv.CanDiscountProportionate },
        ],
        PageContext: {
          PageSize: standalonePageSize,
          PageNumber: page,
        },
      };

      callBackendApi({
        action: 'clinicalmaster/serviceitem/GetServiceItems',
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
          console.error('Failed to get service items:', err);
        });
    },
    [
      searchCode,
      departmentId,
      categoryId,
      activeStatusId,
      facilityId,
      advancedFilters,
      standalonePageSize,
    ]
  );

  // Trigger search on mount for standalone mode
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneItems(1);
    }
  }, [isHybrid, fetchStandaloneItems]);

  // Handler: Execute Search
  const handleSearch = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        Code: searchCode.trim(),
        DepartmentId: Number(departmentId),
        CategoryId: Number(categoryId),
        ActiveStatusId: Number(activeStatusId),
        FacilityId: Number(facilityId),
        advancedfilter: advancedFilters,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneItems(1);
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearchCode('');
    setDepartmentId(-1);
    setCategoryId(-1);
    setActiveStatusId(2);
    setFacilityId(defaultFacilityId);
    const resetAdv: AdvancedFilterState = {
      SubCategoryId: -1,
      FacilityId: -1,
      MasterTypeId: -1,
      SubDepartmentId: -1,
      MasterName: '',
      IsPackage: false,
      IsOrderable: false,
      IsRateEditable: false,
      IsZeroBill: false,
      IsSurgicalProcedure: false,
      IsEquipmentHour: false,
      IsEquipmentDaily: false,
      IsBedChargeHour: false,
      IsBedChargeDaily: false,
      IsNightCharge: false,
      CanDiscountProportionate: false,
    };
    setAdvancedFilters(resetAdv);

    if (isHybrid && onAction) {
      onAction('resetFilters', {
        Code: '',
        DepartmentId: -1,
        CategoryId: -1,
        ActiveStatusId: 2,
        FacilityId: defaultFacilityId,
        advancedfilter: resetAdv,
      });
    } else {
      setStandalonePage(1);
      fetchStandaloneItems(1, {
        Code: '',
        DepartmentId: -1,
        CategoryId: -1,
        ActiveStatusId: 2,
        FacilityId: defaultFacilityId,
        advanced: resetAdv,
      });
    }
  };

  // Handler: Page Change
  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page: newPage });
    } else {
      setStandalonePage(newPage);
      fetchStandaloneItems(newPage);
    }
  };

  // Handler: Add New Service
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
    } else {
      window.location.hash = '#/app/serviceitem/0/details';
    }
  };

  // Handler: Edit Service
  const handleEdit = (item: ServiceItemEntity) => {
    if (isHybrid && onAction) {
      onAction('edit', item);
    } else {
      window.location.hash = `#/app/serviceitem/${item.Id}/details`;
    }
  };

  // Handler: Delete Service Trigger
  const handleDeleteTrigger = (item: ServiceItemEntity) => {
    setItemToDelete(item);
  };

  // Handler: Delete Confirmed
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    const targetItem = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', targetItem);
    } else {
      callBackendApi({
        action: 'clinicalmaster/serviceitem/DeleteServiceItem',
        data: { Id: targetItem.Id },
      })
        .then(() => {
          setToastMessage({ text: 'Service item deleted successfully', type: 'success' });
          fetchStandaloneItems(standalonePage);
        })
        .catch((err) => {
          setToastMessage({ text: 'Failed to delete service item', type: 'error' });
          console.error(err);
        });
    }
  };

  // Handler: Export to Excel
  const handleExport = () => {
    if (isHybrid && onAction) {
      onAction('export');
    } else {
      callBackendApi({
        action: 'SystemSettings/MasterExport/MasterExportXL',
        data: {
          Data: {
            targetcontext: 'ServiceItemMaster',
            Code: searchCode,
            DepartmentId: departmentId,
            CategoryId: categoryId,
            ActiveStatus: activeStatusId,
            SubCategoryId: advancedFilters.SubCategoryId,
            FacilityId: facilityId,
            MasterTypeId: advancedFilters.MasterTypeId,
            SubDepartmentId: advancedFilters.SubDepartmentId,
            IsPackage: advancedFilters.IsPackage,
            MasterName: advancedFilters.MasterName,
          },
        },
      })
        .then(() => {
          setToastMessage({ text: 'Export file prepared successfully', type: 'success' });
        })
        .catch((err) => {
          setToastMessage({ text: 'Failed to export service items', type: 'error' });
          console.error(err);
        });
    }
  };

  // Helper: Format Currency
  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null || val === '') return '—';
    const num = Number(val);
    if (isNaN(num)) return '—';
    return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper: Format Number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="srv-page-container">
      {/* 1. Executive Header Card */}
      <div className="srv-header-card">
        <div className="srv-header-left">
          <div className="srv-header-icon">
            <i className="fa fa-cubes" aria-hidden="true" />
          </div>
          <div>
            <div className="srv-header-title-row">
              <h1 className="srv-header-title">Billing Services Catalog</h1>
              <span className="srv-header-tag">CLINICAL MASTER</span>
            </div>
            <p className="srv-header-subtitle">
              Comprehensive clinical & billing procedure master, tariff mapping, and departmental catalog
            </p>
          </div>
        </div>

        <div className="srv-header-right">
          <div className="srv-header-chip" title="Current facility affiliation">
            <span className="srv-header-chip-dot" />
            <span>SHUVADARSINI HOSPITAL</span>
          </div>

          <button
            type="button"
            id="btnExportServiceItem"
            className="srv-btn-export"
            onClick={handleExport}
            title="Export full catalog to Excel"
          >
            <i className="fa fa-file-excel-o" aria-hidden="true" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            id="btnAddServiceItem"
            className="srv-btn-add"
            onClick={handleAddNew}
            title="Create new service item"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="srv-stats-grid">
        <div className="srv-stat-card">
          <div className="srv-stat-info">
            <span className="srv-stat-label">Total Services</span>
            <span className="srv-stat-value">{formatNumber(totalItems)}</span>
            <span className="srv-stat-subtext">Registered catalog items</span>
          </div>
          <div className="srv-stat-icon-wrapper srv-stat-icon-primary">
            <i className="fa fa-cubes" aria-hidden="true" />
          </div>
        </div>

        <div className="srv-stat-card">
          <div className="srv-stat-info">
            <span className="srv-stat-label">Active Items</span>
            <span className="srv-stat-value">
              {formatNumber(items.filter((i) => i.ActiveStatusId === 2 || !i.ActiveStatusId).length)}
            </span>
            <span className="srv-stat-subtext">On current page</span>
          </div>
          <div className="srv-stat-icon-wrapper srv-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>

        <div className="srv-stat-card">
          <div className="srv-stat-info">
            <span className="srv-stat-label">Departments</span>
            <span className="srv-stat-value">
              {lookups.Department.length > 0 ? lookups.Department.filter((d) => d.Id !== -1).length : '—'}
            </span>
            <span className="srv-stat-subtext">Clinical departments</span>
          </div>
          <div className="srv-stat-icon-wrapper srv-stat-icon-info">
            <i className="fa fa-hospital-o" aria-hidden="true" />
          </div>
        </div>

        <div className="srv-stat-card">
          <div className="srv-stat-info">
            <span className="srv-stat-label">Billing Groups</span>
            <span className="srv-stat-value">
              {lookups.ServiceCategory.length > 0 ? lookups.ServiceCategory.filter((c) => c.Id !== -1).length : '—'}
            </span>
            <span className="srv-stat-subtext">Category classifications</span>
          </div>
          <div className="srv-stat-icon-wrapper srv-stat-icon-warning">
            <i className="fa fa-tags" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="srv-filter-card">
        <div className="srv-filter-row">
          {/* Code / Name Search */}
          <div className="srv-filter-col srv-filter-col-search">
            <label className="srv-filter-label" htmlFor="inputSearchService">
              Code / Service Name
            </label>
            <div className="srv-filter-input-wrap">
              <i className="fa fa-search srv-filter-input-icon" aria-hidden="true" />
              <input
                type="text"
                id="inputSearchService"
                className="srv-filter-input"
                placeholder="Search by code or procedure name..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {searchCode && (
                <button
                  type="button"
                  className="srv-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setSearchCode('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div className="srv-filter-col">
            <label className="srv-filter-label" htmlFor="selectDepartmentFilter">
              Department
            </label>
            <select
              id="selectDepartmentFilter"
              className="srv-filter-select"
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

          {/* Facility Filter */}
          <div className="srv-filter-col">
            <label className="srv-filter-label" htmlFor="selectFacilityFilter">
              Facility
            </label>
            <select
              id="selectFacilityFilter"
              className="srv-filter-select"
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
            >
              <option value={-1}>All Facilities</option>
              {lookups.Facility.filter((f) => f.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Category / Billing Group Filter */}
          <div className="srv-filter-col">
            <label className="srv-filter-label" htmlFor="selectCategoryFilter">
              Billing Group
            </label>
            <select
              id="selectCategoryFilter"
              className="srv-filter-select"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              <option value={-1}>All Groups</option>
              {lookups.ServiceCategory.filter((c) => c.Id !== -1).map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="srv-filter-col" style={{ flex: '1 1 140px' }}>
            <label className="srv-filter-label" htmlFor="selectStatusFilter">
              Status
            </label>
            <select
              id="selectStatusFilter"
              className="srv-filter-select"
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
          <div className="srv-filter-actions">
            <button
              type="button"
              id="btnFilterSearch"
              className="srv-btn-search"
              onClick={handleSearch}
              title="Apply filters"
            >
              <i className="fa fa-filter" aria-hidden="true" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              id="btnFilterReset"
              className="srv-btn-reset"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              id="btnToggleAdvanced"
              className={`srv-btn-advanced-toggle ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Show advanced filters"
            >
              <i className="fa fa-sliders" aria-hidden="true" />
              <span>Advanced</span>
              {activeAdvancedCount > 0 && (
                <span className="srv-advanced-badge">{activeAdvancedCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Advanced Filter Collapsible Drawer */}
        {showAdvanced && (
          <div className="srv-advanced-panel">
            <div className="srv-advanced-grid">
              {/* Sub Category */}
              <div className="srv-filter-col">
                <label className="srv-filter-label">Sub Category</label>
                <select
                  className="srv-filter-select"
                  value={advancedFilters.SubCategoryId}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, SubCategoryId: Number(e.target.value) })
                  }
                >
                  <option value={-1}>All Sub Categories</option>
                  {lookups.ServiceSubCategory.filter((s) => s.Id !== -1).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Department */}
              <div className="srv-filter-col">
                <label className="srv-filter-label">Sub Department</label>
                <select
                  className="srv-filter-select"
                  value={advancedFilters.SubDepartmentId}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, SubDepartmentId: Number(e.target.value) })
                  }
                >
                  <option value={-1}>All Sub Departments</option>
                  {(lookups.SubDepartment.length > 0 ? lookups.SubDepartment : lookups.Department)
                    .filter((s) => s.Id !== -1)
                    .map((opt) => (
                      <option key={opt.Id} value={opt.Id}>
                        {opt.Text}
                      </option>
                    ))}
                </select>
              </div>

              {/* Master Type */}
              <div className="srv-filter-col">
                <label className="srv-filter-label">Master Type</label>
                <select
                  className="srv-filter-select"
                  value={advancedFilters.MasterTypeId}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, MasterTypeId: Number(e.target.value) })
                  }
                >
                  <option value={-1}>All Master Types</option>
                  {lookups.MasterType.filter((m) => m.Id !== -1).map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Master Item Name */}
              <div className="srv-filter-col">
                <label className="srv-filter-label">Master Item Name</label>
                <input
                  type="text"
                  className="srv-filter-input"
                  style={{ paddingLeft: '11px' }}
                  placeholder="Master item keyword..."
                  value={advancedFilters.MasterName}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, MasterName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Feature Checkboxes / Flags Grid */}
            <div className="srv-flags-grid">
              <label className={`srv-flag-chip ${advancedFilters.IsPackage ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsPackage}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsPackage: e.target.checked })
                  }
                />
                <span>Package Service</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsOrderable ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsOrderable}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsOrderable: e.target.checked })
                  }
                />
                <span>Orderable</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsRateEditable ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsRateEditable}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsRateEditable: e.target.checked })
                  }
                />
                <span>Rate Editable</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsZeroBill ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsZeroBill}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsZeroBill: e.target.checked })
                  }
                />
                <span>Zero Bill</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsSurgicalProcedure ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsSurgicalProcedure}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsSurgicalProcedure: e.target.checked })
                  }
                />
                <span>Surgical Procedure</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsBedChargeHour ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsBedChargeHour}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsBedChargeHour: e.target.checked })
                  }
                />
                <span>Bed Charge (Hourly)</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsBedChargeDaily ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsBedChargeDaily}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsBedChargeDaily: e.target.checked })
                  }
                />
                <span>Bed Charge (Daily)</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsEquipmentHour ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsEquipmentHour}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsEquipmentHour: e.target.checked })
                  }
                />
                <span>Equipment (Hourly)</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsEquipmentDaily ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsEquipmentDaily}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsEquipmentDaily: e.target.checked })
                  }
                />
                <span>Equipment (Daily)</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.IsNightCharge ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.IsNightCharge}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, IsNightCharge: e.target.checked })
                  }
                />
                <span>Night Charge</span>
              </label>

              <label className={`srv-flag-chip ${advancedFilters.CanDiscountProportionate ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={advancedFilters.CanDiscountProportionate}
                  onChange={(e) =>
                    setAdvancedFilters({ ...advancedFilters, CanDiscountProportionate: e.target.checked })
                  }
                />
                <span>Proportionate Discount</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 5. Enterprise Data Table Card */}
      <div className="srv-table-card">
        {isLoading ? (
          <div className="srv-loading-overlay">
            <div className="srv-spinner" />
            <span>Loading catalog items...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="srv-empty-state">
            <i className="fa fa-cubes srv-empty-icon" aria-hidden="true" />
            <h3 className="srv-empty-title">No service items found</h3>
            <p className="srv-empty-desc">
              Try adjusting your search keywords, clearing status filters, or creating a new service item.
            </p>
            <button type="button" className="srv-btn-add" onClick={handleAddNew}>
              <i className="fa fa-plus" aria-hidden="true" />
              <span>Add Service Item</span>
            </button>
          </div>
        ) : (
          <div className="srv-table-responsive">
            <table className="srv-table">
              <thead>
                <tr>
                  <th className="srv-col-idx">#</th>
                  <th>Service Code</th>
                  <th>Service Name & Details</th>
                  <th>Department</th>
                  <th>Billing Group / Category</th>
                  <th style={{ textAlign: 'right' }}>Standard Cost</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const isDraft = item.ActiveStatusId === 1;
                  const isInactive = item.ActiveStatusId === 3;
                  const statusDesc = item.ActiveStatus?.Description || (isDraft ? 'Draft' : isInactive ? 'Inactive' : 'Active');

                  return (
                    <tr key={item.Id || index}>
                      <td className="srv-col-idx">{rowIndex}</td>

                      {/* Code Badge */}
                      <td>
                        <span className="srv-code-badge" title={item.ItemCode}>
                          {item.ItemCode || '—'}
                        </span>
                      </td>

                      {/* Name & Flags */}
                      <td>
                        <div className="srv-name-cell">
                          <span className="srv-name-primary" title={item.Name}>
                            {item.Name}
                          </span>
                          {item.Description && item.Description !== item.Name && (
                            <span className="srv-name-desc" title={item.Description}>
                              {item.Description}
                            </span>
                          )}

                          {/* Quick Badges / Flags */}
                          <div className="srv-tags-row">
                            {item.IsPackage && (
                              <span className="srv-tag srv-tag-package" title="Package Service">
                                <i className="fa fa-archive" style={{ fontSize: '9px' }} /> Package
                              </span>
                            )}
                            {item.IsSurgicalProcedure && (
                              <span className="srv-tag srv-tag-proc" title="Surgical Procedure">
                                <i className="fa fa-user-md" style={{ fontSize: '9px' }} /> Procedure
                              </span>
                            )}
                            {item.IsZeroBill && (
                              <span className="srv-tag srv-tag-zerobill" title="Zero Bill Allowed">
                                Zero-Bill
                              </span>
                            )}
                            {item.IsOrderable && (
                              <span className="srv-tag srv-tag-orderable" title="Orderable in EMR">
                                Orderable
                              </span>
                            )}
                            {item.IsRateEditable && (
                              <span className="srv-tag srv-tag-editable" title="Rate Editable in Billing">
                                Rate Editable
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="srv-dept-text">
                          {item.Department?.DepartmentName || item.Department?.Description || '—'}
                        </span>
                      </td>

                      {/* Category / Billing Group */}
                      <td>
                        <span className="srv-category-text">
                          {item.ParentCategory?.ServiceCategoryName ||
                            item.ParentCategory?.Description ||
                            item.SubCategory?.ServiceCategoryName ||
                            '—'}
                        </span>
                      </td>

                      {/* Cost */}
                      <td style={{ textAlign: 'right' }}>
                        <span className="srv-cost-val">{formatCurrency(item.ItemCost)}</span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`srv-status-pill ${
                            isDraft
                              ? 'srv-status-pill-draft'
                              : isInactive
                              ? 'srv-status-pill-inactive'
                              : 'srv-status-pill-active'
                          }`}
                        >
                          <span className="srv-status-dot" />
                          <span>{statusDesc}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="srv-actions-cell">
                          <button
                            type="button"
                            id={`btnEditService_${item.Id}`}
                            className="srv-action-btn srv-action-edit"
                            title="Edit service item details"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {/* Delete button only shown for Draft items, matching legacy condition: ng-show="entity.ActiveStatusId==1" */}
                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              id={`btnDeleteService_${item.Id}`}
                              className="srv-action-btn srv-action-delete"
                              title="Delete draft item"
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

        {/* 6. Sticky / Unified Pagination Bar */}
        {totalItems > 0 && (
          <div className="srv-pagination-bar">
            <div className="srv-pagination-info">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong>{formatNumber(totalItems)}</strong> catalog entries
            </div>

            <div className="srv-pagination-controls">
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

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Service Item"
        message={`Are you sure you want to delete "${itemToDelete?.ItemCode} - ${itemToDelete?.Name}"? This action cannot be undone.`}
        confirmLabel="Delete Service"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`srv-toast ${toastMessage.type === 'success' ? 'srv-toast-success' : 'srv-toast-error'}`}>
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
