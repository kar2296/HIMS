import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from './ConfirmModal';
import { sessionHelper } from '../services/sessionHelper';
import { apiFetch } from './utils/api';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  Code?: string;
}

export interface TestMasterItem {
  Id: number;
  Code: string;
  Name: string;
  SampletypeId?: number;
  Sampletype?: {
    Id?: number;
    Name?: string;
  };
  Methodology?: string;
  Testmastertype_e?: number;
  TESTMASTERTYP?: {
    Id?: number;
    Description?: string;
  };
  DepartmentId?: number;
  Department?: {
    Id?: number;
    DepartmentName?: string;
  };
  SubDepartmentId?: number;
  SubDepartment?: {
    Id?: number;
    DepartmentName?: string;
  };
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  FacilityId?: number;
  Facility?: {
    Id?: number;
    FacilityName?: string;
  };
  IsProfile?: boolean | number;
  IsSeparateWorkOrder?: boolean | number;
  IsDirectBill?: boolean | number;
  IsSeparateSampleId?: boolean | number;
  [key: string]: any;
}

export interface TestMastersListScreenProps {
  reactProps?: {
    items?: TestMasterItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      codemnemonicsnamedesc?: string;
      dept?: number;
      subdept?: number;
      type?: number;
      FacilityId?: number;
      ActiveStatusId?: number;
    };
    advancedfilter?: {
      IsProfile?: boolean;
      IsSeparateWorkOrder?: boolean;
      IsDirectBill?: boolean;
      IsSeparateSampleId?: boolean;
      Methodology?: string;
    };
    lookup?: {
      Department?: LookupOption[];
      SubDepartment?: LookupOption[];
      Facility?: LookupOption[];
      ActiveStatus?: LookupOption[];
      TESTMASTERTYP?: LookupOption[];
      SampleMaster?: LookupOption[];
    };
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const TestMastersListScreen: React.FC<TestMastersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));
  const currentFacilityName = reactProps?.facilityName || 'SHUVADARSINI HOSPITAL';

  // Standalone states (used when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<TestMasterItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    Department: LookupOption[];
    SubDepartment: LookupOption[];
    Facility: LookupOption[];
    ActiveStatus: LookupOption[];
    TESTMASTERTYP: LookupOption[];
  }>({
    Department: [],
    SubDepartment: [],
    Facility: [],
    ActiveStatus: [],
    TESTMASTERTYP: [],
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>(
    reactProps?.currentfilter?.codemnemonicsnamedesc || ''
  );
  const [deptId, setDeptId] = useState<number>(
    reactProps?.currentfilter?.dept !== undefined ? reactProps.currentfilter.dept : -1
  );
  const [subDeptId, setSubDeptId] = useState<number>(
    reactProps?.currentfilter?.subdept !== undefined ? reactProps.currentfilter.subdept : -1
  );
  const [filterFacilityId, setFilterFacilityId] = useState<number>(
    reactProps?.currentfilter?.FacilityId !== undefined ? reactProps.currentfilter.FacilityId : -1
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );

  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isProfile, setIsProfile] = useState<boolean>(
    Boolean(reactProps?.advancedfilter?.IsProfile)
  );
  const [isSeparateWorkOrder, setIsSeparateWorkOrder] = useState<boolean>(
    Boolean(reactProps?.advancedfilter?.IsSeparateWorkOrder)
  );
  const [isDirectBill, setIsDirectBill] = useState<boolean>(
    Boolean(reactProps?.advancedfilter?.IsDirectBill)
  );
  const [isSeparateSampleId, setIsSeparateSampleId] = useState<boolean>(
    Boolean(reactProps?.advancedfilter?.IsSeparateSampleId)
  );
  const [methodologySearch, setMethodologySearch] = useState<string>(
    reactProps?.advancedfilter?.Methodology || ''
  );

  // Modal / Toast UI feedback
  const [itemToDelete, setItemToDelete] = useState<TestMasterItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.codemnemonicsnamedesc !== undefined) {
        setSearchTerm(reactProps.currentfilter.codemnemonicsnamedesc);
      }
      if (reactProps.currentfilter.dept !== undefined) {
        setDeptId(reactProps.currentfilter.dept);
      }
      if (reactProps.currentfilter.subdept !== undefined) {
        setSubDeptId(reactProps.currentfilter.subdept);
      }
      if (reactProps.currentfilter.FacilityId !== undefined) {
        setFilterFacilityId(reactProps.currentfilter.FacilityId);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
      }
    }
    if (reactProps?.advancedfilter) {
      if (reactProps.advancedfilter.IsProfile !== undefined) {
        setIsProfile(Boolean(reactProps.advancedfilter.IsProfile));
      }
      if (reactProps.advancedfilter.IsSeparateWorkOrder !== undefined) {
        setIsSeparateWorkOrder(Boolean(reactProps.advancedfilter.IsSeparateWorkOrder));
      }
      if (reactProps.advancedfilter.IsDirectBill !== undefined) {
        setIsDirectBill(Boolean(reactProps.advancedfilter.IsDirectBill));
      }
      if (reactProps.advancedfilter.IsSeparateSampleId !== undefined) {
        setIsSeparateSampleId(Boolean(reactProps.advancedfilter.IsSeparateSampleId));
      }
      if (reactProps.advancedfilter.Methodology !== undefined) {
        setMethodologySearch(reactProps.advancedfilter.Methodology);
      }
    }
  }, [reactProps?.currentfilter, reactProps?.advancedfilter]);

  // Load Lookups for Standalone Mode
  useEffect(() => {
    if (!reactProps?.lookup) {
      const fetchLookups = async () => {
        try {
          const res = await apiFetch('General/Options/getoptions', [
            { Key: 'Organization' },
            {
              Key: 'Facility',
              Request: {
                Params: [{ Key: 4, Value: true }],
              },
            },
            { Key: 'TESTMASTERTYP' },
            { Key: 'Department' },
            { Key: 'SubDepartment' },
            { Key: 'ActiveStatus' },
          ]);

          if (res) {
            setStandaloneLookups({
              Department: res.Department || [],
              SubDepartment: res.SubDepartment || [],
              Facility: res.Facility || [],
              ActiveStatus: res.ActiveStatus || [],
              TESTMASTERTYP: res.TESTMASTERTYP || [],
            });
          }
        } catch (err) {
          console.error('Failed to load Test Master lookups:', err);
        }
      };
      fetchLookups();
    }
  }, [reactProps?.lookup]);

  // Combined lookups
  const lookups = useMemo(() => {
    return {
      Department: reactProps?.lookup?.Department || standaloneLookups.Department || [],
      SubDepartment: reactProps?.lookup?.SubDepartment || standaloneLookups.SubDepartment || [],
      Facility: reactProps?.lookup?.Facility || standaloneLookups.Facility || [],
      ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus || [],
      TESTMASTERTYP: reactProps?.lookup?.TESTMASTERTYP || standaloneLookups.TESTMASTERTYP || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Fetch tests in standalone mode
  const fetchStandaloneTests = useCallback(
    async (
      page = standalonePage,
      size = standalonePageSize,
      search = searchTerm,
      dId = deptId,
      sId = subDeptId,
      facId = filterFacilityId,
      statusId = activeStatusId,
      prof = isProfile,
      sepWo = isSeparateWorkOrder,
      dirBill = isDirectBill,
      sepSample = isSeparateSampleId,
      meth = methodologySearch
    ) => {
      setIsLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 1, Value: search },
            { Key: 3, Value: -1 },
            { Key: 4, Value: dId },
            { Key: 5, Value: sId },
            { Key: 15, Value: facId },
            { Key: 6, Value: statusId },
            { Key: 2, Value: prof ? true : undefined },
            { Key: 10, Value: sepWo ? true : undefined },
            { Key: 11, Value: dirBill ? true : undefined },
            { Key: 12, Value: sepSample ? true : undefined },
            { Key: 13, Value: meth || undefined },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('lis/testmaster/GetTestmasters', payload);
        if (res) {
          setStandaloneItems(res.Data || []);
          setStandaloneTotal(res.PageContext?.TotalRecords || (res.Data ? res.Data.length : 0));
        }
      } catch (err) {
        console.error('Error fetching test masters:', err);
        setToastMessage({ text: 'Failed to load test masters.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [
      standalonePage,
      standalonePageSize,
      searchTerm,
      deptId,
      subDeptId,
      filterFacilityId,
      activeStatusId,
      isProfile,
      isSeparateWorkOrder,
      isDirectBill,
      isSeparateSampleId,
      methodologySearch,
    ]
  );

  // Initial load in standalone mode
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneTests();
    }
  }, [isHybrid, fetchStandaloneTests]);

  // Active Items & Pagination
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid ? (reactProps?.totalItems || 0) : standaloneTotal;
  const currentPage = isHybrid ? (reactProps?.currentPage || 1) : standalonePage;
  const pageSize = isHybrid ? (reactProps?.pageSize || 25) : standalonePageSize;

  // Search & Filter Trigger
  const handleSearch = () => {
    if (isHybrid && onAction) {
      onAction('search', {
        codemnemonicsnamedesc: searchTerm,
        dept: deptId,
        subdept: subDeptId,
        FacilityId: filterFacilityId,
        ActiveStatusId: activeStatusId,
        IsProfile: isProfile,
        IsSeparateWorkOrder: isSeparateWorkOrder,
        IsDirectBill: isDirectBill,
        IsSeparateSampleId: isSeparateSampleId,
        Methodology: methodologySearch,
      });
      return;
    }
    setStandalonePage(1);
    fetchStandaloneTests(1, pageSize, searchTerm, deptId, subDeptId, filterFacilityId, activeStatusId, isProfile, isSeparateWorkOrder, isDirectBill, isSeparateSampleId, methodologySearch);
  };

  // Reset Filters
  const handleReset = () => {
    setSearchTerm('');
    setDeptId(-1);
    setSubDeptId(-1);
    setFilterFacilityId(-1);
    setActiveStatusId(2);
    setIsProfile(false);
    setIsSeparateWorkOrder(false);
    setIsDirectBill(false);
    setIsSeparateSampleId(false);
    setMethodologySearch('');

    if (isHybrid && onAction) {
      onAction('resetFilters');
      return;
    }
    setStandalonePage(1);
    fetchStandaloneTests(1, pageSize, '', -1, -1, -1, 2, false, false, false, false, '');
  };

  // Pagination Change
  const handlePageChange = (page: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page });
      return;
    }
    setStandalonePage(page);
    fetchStandaloneTests(page, pageSize);
  };

  // Add New Test
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
      return;
    }
    window.location.hash = '#/app/testmastertab/testmaster?id=0';
  };

  // Back to Lab Dashboard
  const handleBackToDashboard = () => {
    if (isHybrid && onAction) {
      onAction('backtoList');
      return;
    }
    window.location.hash = '#/app/labdashboard';
  };

  // Edit Test
  const handleEdit = (test: TestMasterItem) => {
    if (isHybrid && onAction) {
      onAction('edit', test);
      return;
    }
    window.location.hash = `#/app/testmastertab/testmaster?id=${test.Id}&TestName=${encodeURIComponent((test.Code || '') + ' - ' + (test.Name || ''))}&TestCode=${encodeURIComponent(test.Code || '')}`;
  };

  // Delete Test
  const handleDeleteTrigger = (test: TestMasterItem) => {
    setItemToDelete(test);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const test = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', test);
      return;
    }

    try {
      await apiFetch('lis/testmaster/DeleteTestmaster', { Id: test.Id });
      setToastMessage({ text: 'Test master deleted successfully.', type: 'success' });
      fetchStandaloneTests(currentPage, pageSize);
    } catch (err) {
      console.error('Failed to delete test master:', err);
      setToastMessage({ text: 'Failed to delete test master.', type: 'error' });
    }
  };

  // Auto dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeCountOnPage = items.filter(
    (item) => item.ActiveStatusId === 2 || !item.ActiveStatusId || item.ActiveStatus?.Description === 'Active'
  ).length;

  return (
    <div className="pkg-page-container">
      <style>{`
        .pkg-page-container .pkg-filter-input-wrap input.pkg-filter-input,
        .pkg-page-container input#inputTestSearch {
          padding-left: 38px !important;
        }
      `}</style>
      {/* 1. Header Card */}
      <div className="pkg-header-card">
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <i className="fa fa-flask" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Laboratory Test Master</h1>
              <span className="pkg-header-tag">LIS MASTER</span>
            </div>
            <p className="pkg-header-subtitle">
              Comprehensive diagnostic test catalog, methodology, sample requirements & department mapping
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
            className="pkg-btn-add"
            onClick={handleAddNew}
            title="Create new laboratory test master"
            id="btnAddNewTest"
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Test Master</span>
          </button>

          <button
            type="button"
            className="pkg-btn-reset"
            onClick={handleBackToDashboard}
            title="Back to Laboratory Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
            }}
          >
            <i className="fa fa-home" aria-hidden="true" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Total Test Catalog</span>
            <span className="pkg-stat-value">{totalItems.toLocaleString()}</span>
            <span className="pkg-stat-subtext">Registered diagnostic tests</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-primary">
            <i className="fa fa-vial" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Active on Page</span>
            <span className="pkg-stat-value">{activeCountOnPage.toLocaleString()}</span>
            <span className="pkg-stat-subtext">Verified active tests</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Departments</span>
            <span className="pkg-stat-value">
              {lookups.Department.length > 0
                ? lookups.Department.filter((d) => d.Id !== -1).length
                : '—'}
            </span>
            <span className="pkg-stat-subtext">Clinical lab departments</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-hospital-o" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Sub Departments</span>
            <span className="pkg-stat-value">
              {lookups.SubDepartment.length > 0
                ? lookups.SubDepartment.filter((s) => s.Id !== -1).length
                : '—'}
            </span>
            <span className="pkg-stat-subtext">Specialized lab sections</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-sitemap" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="pkg-filter-card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
            <label className="pkg-filter-label" htmlFor="inputTestSearch">
              Search Test / Code / Mnemonic
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-search pkg-filter-input-icon" aria-hidden="true" style={{ left: '12px' }} />
              <input
                type="text"
                id="inputTestSearch"
                className="pkg-filter-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search by name, code, mnemonic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="pkg-filter-clear-btn"
                  title="Clear search"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
            <label className="pkg-filter-label" htmlFor="selectTestDept">
              Department
            </label>
            <select
              id="selectTestDept"
              className="pkg-filter-select"
              value={deptId}
              onChange={(e) => setDeptId(Number(e.target.value))}
            >
              <option value={-1}>All Departments</option>
              {lookups.Department.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
            <label className="pkg-filter-label" htmlFor="selectTestSubDept">
              Sub Department
            </label>
            <select
              id="selectTestSubDept"
              className="pkg-filter-select"
              value={subDeptId}
              onChange={(e) => setSubDeptId(Number(e.target.value))}
            >
              <option value={-1}>All Sub Departments</option>
              {lookups.SubDepartment.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
            <label className="pkg-filter-label" htmlFor="selectTestFacility">
              Facility Name
            </label>
            <select
              id="selectTestFacility"
              className="pkg-filter-select"
              value={filterFacilityId}
              onChange={(e) => setFilterFacilityId(Number(e.target.value))}
            >
              <option value={-1}>All Facilities</option>
              {lookups.Facility.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 130px', minWidth: '120px' }}>
            <label className="pkg-filter-label" htmlFor="selectTestStatus">
              Status
            </label>
            <select
              id="selectTestStatus"
              className="pkg-filter-select"
              value={activeStatusId}
              onChange={(e) => setActiveStatusId(Number(e.target.value))}
            >
              <option value={-1}>All Statuses</option>
              {lookups.ActiveStatus.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Action Buttons */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '1px',
            }}
          >
            <button
              type="button"
              className="pkg-btn-filter"
              onClick={handleSearch}
              title="Apply filters"
              id="btnApplyTestFilter"
            >
              <i className="fa fa-filter" aria-hidden="true" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              className="pkg-btn-reset"
              onClick={handleReset}
              title="Reset all filters"
              id="btnResetTestFilter"
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              className="pkg-btn-reset"
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Toggle advanced filters"
              style={{
                backgroundColor: showAdvanced ? '#e0f2fe' : '#ffffff',
                borderColor: showAdvanced ? '#0284c7' : '#cbd5e1',
                color: showAdvanced ? '#0284c7' : '#475569',
              }}
            >
              <i className="fa fa-sliders" aria-hidden="true" />
              <span>More</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isProfile}
                onChange={(e) => setIsProfile(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
              />
              <span>Is Profile Test</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isSeparateWorkOrder}
                onChange={(e) => setIsSeparateWorkOrder(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
              />
              <span>Separate Work Order</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isDirectBill}
                onChange={(e) => setIsDirectBill(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
              />
              <span>Direct Bill</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isSeparateSampleId}
                onChange={(e) => setIsSeparateSampleId(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
              />
              <span>Separate Sample ID</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Methodology:</span>
              <input
                type="text"
                placeholder="e.g. CLIA, HPLC..."
                value={methodologySearch}
                onChange={(e) => setMethodologySearch(e.target.value)}
                className="pkg-filter-input"
                style={{ height: '34px', fontSize: '12px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Table Card */}
      <div className="pkg-table-card">
        {isLoading ? (
          <div className="pkg-loading-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: '28px', color: '#0284c7', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
              Loading test masters...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="pkg-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '22px',
                marginBottom: '14px',
              }}
            >
              <i className="fa fa-flask" aria-hidden="true" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              No Test Masters Found
            </h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>
              Try adjusting your search query, department, or active status filter.
            </p>
            <button type="button" className="pkg-btn-reset" onClick={handleReset}>
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Clear Filters</span>
            </button>
          </div>
        ) : (
          <div className="pkg-table-container">
            <table className="pkg-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '120px' }}>CODE</th>
                  <th style={{ minWidth: '240px' }}>TEST NAME</th>
                  <th style={{ width: '130px' }}>SAMPLE TYPE</th>
                  <th style={{ width: '140px' }}>METHODOLOGY</th>
                  <th style={{ width: '90px' }}>TYPE</th>
                  <th style={{ minWidth: '180px' }}>DEPARTMENT</th>
                  <th style={{ minWidth: '180px' }}>SUB DEPT.</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>STATUS</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const isActive =
                    item.ActiveStatusId === 2 ||
                    !item.ActiveStatusId ||
                    item.ActiveStatus?.Description === 'Active';
                  const statusDesc = item.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive');

                  return (
                    <tr key={item.Id || index}>
                      {/* S.No */}
                      <td className="pkg-col-idx" style={{ textAlign: 'center' }}>
                        {rowIndex}
                      </td>

                      {/* Code Badge */}
                      <td>
                        <span className="pkg-code-badge" title={item.Code}>
                          {item.Code || '—'}
                        </span>
                      </td>

                      {/* Test Name */}
                      <td>
                        <div className="pkg-name-cell">
                          <span
                            className="pkg-name-primary"
                            title={item.Name}
                            style={{ cursor: 'pointer', color: '#0284c7' }}
                            onClick={() => handleEdit(item)}
                          >
                            {item.Name}
                          </span>
                          {item.IsProfile && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: '#fef3c7',
                                color: '#b45309',
                                width: 'fit-content',
                              }}
                            >
                              PROFILE / PANEL
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sample Type */}
                      <td>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                          {item.Sampletype?.Name || item.SampletypeId || '—'}
                        </span>
                      </td>

                      {/* Methodology */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#475569' }}>
                          {item.Methodology || '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {item.TESTMASTERTYP?.Description || 'LAB'}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                          {item.Department?.DepartmentName || '—'}
                        </span>
                      </td>

                      {/* Sub Department */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#475569' }}>
                          {item.SubDepartment?.DepartmentName || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`pkg-status-pill ${
                            isActive ? 'pkg-status-pill-active' : 'pkg-status-pill-inactive'
                          }`}
                        >
                          <span className="pkg-status-dot" />
                          <span>{statusDesc}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="pkg-actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            id={`btnEditTest_${item.Id}`}
                            className="pkg-action-btn pkg-action-edit"
                            title="Edit test master"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              id={`btnDeleteTest_${item.Id}`}
                              className="pkg-action-btn pkg-action-delete"
                              title="Delete test master"
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

        {/* 5. Pagination Bar */}
        {totalItems > 0 && (
          <div className="pkg-pagination-bar">
            <div className="pkg-pagination-info">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong>{totalItems.toLocaleString()}</strong> tests
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Test Master"
        message={`Are you sure you want to delete test "${itemToDelete?.Code} - ${itemToDelete?.Name}"? This action cannot be undone.`}
        confirmLabel="Delete Test"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`pkg-toast ${
            toastMessage.type === 'success' ? 'pkg-toast-success' : 'pkg-toast-error'
          }`}
        >
          <i
            className={`fa ${
              toastMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
            }`}
            aria-hidden="true"
          />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
