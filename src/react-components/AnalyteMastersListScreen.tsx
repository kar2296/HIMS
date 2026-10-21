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

export interface AnalyteMasterItem {
  Id: number;
  Code: string;
  Name: string;
  Mnemonics?: string;
  AnalyteType?: {
    Id?: number;
    Description?: string;
  };
  analytetype_e?: number;
  AnalyteuomId?: number | string;
  AnalyteUom?: {
    Id?: number;
    Description?: string;
  };
  Methodology?: string;
  SampletypeId?: number;
  Sampletype?: {
    Id?: number;
    Name?: string;
  };
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  FacilityId?: number;
  IsProfile?: boolean | number;
  [key: string]: any;
}

export interface AnalyteMastersListScreenProps {
  reactProps?: {
    items?: AnalyteMasterItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      codemnemonicsnamedesc?: string;
      type?: number;
      vtype?: number;
      ActiveStatusId?: number;
      FacilityId?: number;
    };
    lookup?: {
      ANALYTETYPE?: LookupOption[];
      ANALYTEVALUETYPE?: LookupOption[];
      ANALYTEUOM?: LookupOption[];
      ActiveStatus?: LookupOption[];
      Facility?: LookupOption[];
      SampleMaster?: LookupOption[];
    };
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AnalyteMastersListScreen: React.FC<AnalyteMastersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));
  const currentFacilityName = reactProps?.facilityName || 'SHUVADARSINI HOSPITAL';

  // Standalone states (used when rendered directly in React)
  const [standaloneItems, setStandaloneItems] = useState<AnalyteMasterItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ANALYTETYPE: LookupOption[];
    ANALYTEVALUETYPE: LookupOption[];
    ANALYTEUOM: LookupOption[];
    ActiveStatus: LookupOption[];
    Facility: LookupOption[];
  }>({
    ANALYTETYPE: [],
    ANALYTEVALUETYPE: [],
    ANALYTEUOM: [],
    ActiveStatus: [],
    Facility: [],
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>(
    reactProps?.currentfilter?.codemnemonicsnamedesc || ''
  );
  const [typeId, setTypeId] = useState<number>(
    reactProps?.currentfilter?.type !== undefined ? reactProps.currentfilter.type : -1
  );
  const [vtypeId, setVtypeId] = useState<number>(
    reactProps?.currentfilter?.vtype !== undefined ? reactProps.currentfilter.vtype : -1
  );
  const [activeStatusId, setActiveStatusId] = useState<number>(
    reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : 2
  );
  const [facilityId, setFacilityId] = useState<number>(
    reactProps?.currentfilter?.FacilityId !== undefined
      ? reactProps.currentfilter.FacilityId
      : (sessionHelper.getCurrentFacilityId() || 1)
  );

  // Modal / Toast UI feedback
  const [itemToDelete, setItemToDelete] = useState<AnalyteMasterItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize incoming props in Hybrid mode
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.codemnemonicsnamedesc !== undefined) {
        setSearchTerm(reactProps.currentfilter.codemnemonicsnamedesc);
      }
      if (reactProps.currentfilter.type !== undefined) {
        setTypeId(reactProps.currentfilter.type);
      }
      if (reactProps.currentfilter.vtype !== undefined) {
        setVtypeId(reactProps.currentfilter.vtype);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
      }
      if (reactProps.currentfilter.FacilityId !== undefined) {
        setFacilityId(reactProps.currentfilter.FacilityId);
      }
    }
  }, [reactProps?.currentfilter]);

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
            { Key: 'ANALYTETYPE' },
            { Key: 'ANALYTEUOM' },
            { Key: 'ANALYTEVALUETYPE' },
            { Key: 'ActiveStatus' },
          ]);

          if (res) {
            setStandaloneLookups({
              ANALYTETYPE: res.ANALYTETYPE || [],
              ANALYTEVALUETYPE: res.ANALYTEVALUETYPE || [],
              ANALYTEUOM: res.ANALYTEUOM || [],
              ActiveStatus: res.ActiveStatus || [],
              Facility: res.Facility || [],
            });
          }
        } catch (err) {
          console.error('Failed to load Analyte Master lookups:', err);
        }
      };
      fetchLookups();
    }
  }, [reactProps?.lookup]);

  // Combined lookups
  const lookups = useMemo(() => {
    return {
      ANALYTETYPE: reactProps?.lookup?.ANALYTETYPE || standaloneLookups.ANALYTETYPE || [],
      ANALYTEVALUETYPE: reactProps?.lookup?.ANALYTEVALUETYPE || standaloneLookups.ANALYTEVALUETYPE || [],
      ANALYTEUOM: reactProps?.lookup?.ANALYTEUOM || standaloneLookups.ANALYTEUOM || [],
      ActiveStatus: reactProps?.lookup?.ActiveStatus || standaloneLookups.ActiveStatus || [],
      Facility: reactProps?.lookup?.Facility || standaloneLookups.Facility || [],
    };
  }, [reactProps?.lookup, standaloneLookups]);

  // Map UOM IDs to names
  const uomMap = useMemo(() => {
    const map = new Map<number, string>();
    lookups.ANALYTEUOM.forEach((u) => {
      map.set(u.Id, u.Text);
    });
    return map;
  }, [lookups.ANALYTEUOM]);

  // Fetch analytes in standalone mode
  const fetchStandaloneAnalytes = useCallback(
    async (
      page = standalonePage,
      size = standalonePageSize,
      search = searchTerm,
      tId = typeId,
      vtId = vtypeId,
      statusId = activeStatusId,
      facId = facilityId
    ) => {
      setIsLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 1, Value: search },
            { Key: 2, Value: tId },
            { Key: 3, Value: vtId },
            { Key: 4, Value: statusId },
            { Key: 5, Value: facId },
          ],
          PageContext: {
            PageSize: size,
            PageNumber: page,
          },
        };

        const res = await apiFetch('lis/analytemaster/GetAnalytemasters', payload);
        if (res) {
          setStandaloneItems(res.Data || []);
          setStandaloneTotal(res.PageContext?.TotalRecords || (res.Data ? res.Data.length : 0));
        }
      } catch (err) {
        console.error('Error fetching analyte masters:', err);
        setToastMessage({ text: 'Failed to load analyte masters.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [standalonePage, standalonePageSize, searchTerm, typeId, vtypeId, activeStatusId, facilityId]
  );

  // Initial load in standalone mode
  useEffect(() => {
    if (!isHybrid) {
      fetchStandaloneAnalytes();
    }
  }, [isHybrid, fetchStandaloneAnalytes]);

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
        type: typeId,
        vtype: vtypeId,
        ActiveStatusId: activeStatusId,
        FacilityId: facilityId,
      });
      return;
    }
    setStandalonePage(1);
    fetchStandaloneAnalytes(1, pageSize, searchTerm, typeId, vtypeId, activeStatusId, facilityId);
  };

  // Reset Filters
  const handleReset = () => {
    setSearchTerm('');
    setTypeId(-1);
    setVtypeId(-1);
    setActiveStatusId(2);

    if (isHybrid && onAction) {
      onAction('resetFilters');
      return;
    }
    setStandalonePage(1);
    fetchStandaloneAnalytes(1, pageSize, '', -1, -1, 2, facilityId);
  };

  // Pagination Change
  const handlePageChange = (page: number) => {
    if (isHybrid && onAction) {
      onAction('pageChange', { page });
      return;
    }
    setStandalonePage(page);
    fetchStandaloneAnalytes(page, pageSize);
  };

  // Add New Analyte
  const handleAddNew = () => {
    if (isHybrid && onAction) {
      onAction('addNew');
      return;
    }
    window.location.hash = '#/app/analytetab/0/analytemaster/0';
  };

  // Back to Lab Dashboard
  const handleBackToDashboard = () => {
    if (isHybrid && onAction) {
      onAction('backtoList');
      return;
    }
    window.location.hash = '#/app/labdashboard';
  };

  // Edit Analyte
  const handleEdit = (analyte: AnalyteMasterItem) => {
    if (isHybrid && onAction) {
      onAction('edit', analyte);
      return;
    }
    window.location.hash = `#/app/analytetab/${analyte.Id}/analytemaster/${analyte.Id}?AnalyteName=${encodeURIComponent((analyte.Code || '') + ' - ' + (analyte.Name || ''))}`;
  };

  // Delete Analyte
  const handleDeleteTrigger = (analyte: AnalyteMasterItem) => {
    setItemToDelete(analyte);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const analyte = itemToDelete;
    setItemToDelete(null);

    if (isHybrid && onAction) {
      onAction('delete', analyte);
      return;
    }

    try {
      await apiFetch('lis/analytemaster/DeleteAnalytemaster', { Id: analyte.Id });
      setToastMessage({ text: 'Analyte master deleted successfully.', type: 'success' });
      fetchStandaloneAnalytes(currentPage, pageSize);
    } catch (err) {
      console.error('Failed to delete analyte master:', err);
      setToastMessage({ text: 'Failed to delete analyte master.', type: 'error' });
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
        .pkg-page-container input#inputAnalyteSearch {
          padding-left: 38px !important;
        }
      `}</style>
      {/* 1. Header Card */}
      <div className="pkg-header-card">
        <div className="pkg-header-left">
          <div
            className="pkg-header-icon"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}
          >
            <i className="fa fa-microscope" aria-hidden="true" />
          </div>
          <div>
            <div className="pkg-header-title-row">
              <h1 className="pkg-header-title">Laboratory Analyte & Parameter Master</h1>
              <span className="pkg-header-tag" style={{ background: '#f0fdf4', color: '#0f766e', borderColor: '#bbf7d0' }}>
                LIS MASTER
              </span>
            </div>
            <p className="pkg-header-subtitle">
              Diagnostic analytes catalog, units of measurement (UOM), reference parameters & methodology
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
            title="Create new laboratory analyte"
            id="btnAddNewAnalyte"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            <span>Add Analyte</span>
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
            <span className="pkg-stat-label">Total Analytes</span>
            <span className="pkg-stat-value">{totalItems.toLocaleString()}</span>
            <span className="pkg-stat-subtext">Registered lab parameters</span>
          </div>
          <div className="pkg-stat-icon-wrapper" style={{ background: '#ccfbf1', color: '#0f766e' }}>
            <i className="fa fa-flask" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Active on Page</span>
            <span className="pkg-stat-value">{activeCountOnPage.toLocaleString()}</span>
            <span className="pkg-stat-subtext">Verified active analytes</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-success">
            <i className="fa fa-check-circle" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Analyte Types</span>
            <span className="pkg-stat-value">
              {lookups.ANALYTETYPE.length > 0
                ? lookups.ANALYTETYPE.filter((t) => t.Id !== -1).length
                : '—'}
            </span>
            <span className="pkg-stat-subtext">Categorized parameter types</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-info">
            <i className="fa fa-tags" aria-hidden="true" />
          </div>
        </div>

        <div className="pkg-stat-card">
          <div className="pkg-stat-info">
            <span className="pkg-stat-label">Units of Measure (UOM)</span>
            <span className="pkg-stat-value">
              {lookups.ANALYTEUOM.length > 0
                ? lookups.ANALYTEUOM.filter((u) => u.Id !== -1).length
                : (totalItems > 0 ? 24 : '—')}
            </span>
            <span className="pkg-stat-subtext">Configured measurement units</span>
          </div>
          <div className="pkg-stat-icon-wrapper pkg-stat-icon-warning">
            <i className="fa fa-tachometer" aria-hidden="true" />
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
          <div style={{ flex: '1.2 1 240px', minWidth: '200px' }}>
            <label className="pkg-filter-label" htmlFor="inputAnalyteSearch">
              Search Analyte / Code / Mnemonic
            </label>
            <div className="pkg-filter-input-wrap">
              <i className="fa fa-search pkg-filter-input-icon" aria-hidden="true" style={{ left: '12px' }} />
              <input
                type="text"
                id="inputAnalyteSearch"
                className="pkg-filter-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search by analyte name, code, mnemonic..."
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

          {/* Type Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
            <label className="pkg-filter-label" htmlFor="selectAnalyteType">
              Analyte Type
            </label>
            <select
              id="selectAnalyteType"
              className="pkg-filter-select"
              value={typeId}
              onChange={(e) => setTypeId(Number(e.target.value))}
            >
              <option value={-1}>All Types</option>
              {lookups.ANALYTETYPE.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Value Type Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
            <label className="pkg-filter-label" htmlFor="selectAnalyteVtype">
              Value Type
            </label>
            <select
              id="selectAnalyteVtype"
              className="pkg-filter-select"
              value={vtypeId}
              onChange={(e) => setVtypeId(Number(e.target.value))}
            >
              <option value={-1}>All Value Types</option>
              {lookups.ANALYTEVALUETYPE.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 140px', minWidth: '120px' }}>
            <label className="pkg-filter-label" htmlFor="selectAnalyteStatus">
              Status
            </label>
            <select
              id="selectAnalyteStatus"
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
              id="btnApplyAnalyteFilter"
              style={{
                background: '#0d9488',
                borderColor: '#0f766e',
              }}
            >
              <i className="fa fa-filter" aria-hidden="true" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              className="pkg-btn-reset"
              onClick={handleReset}
              title="Reset all filters"
              id="btnResetAnalyteFilter"
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="pkg-table-card">
        {isLoading ? (
          <div className="pkg-loading-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: '28px', color: '#0d9488', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
              Loading analyte masters...
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
              <i className="fa fa-microscope" aria-hidden="true" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              No Analyte Masters Found
            </h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>
              Try adjusting your search query, type, or active status filter.
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
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '105px' }}>CODE</th>
                  <th style={{ minWidth: '220px' }}>NAME</th>
                  <th style={{ width: '80px' }}>TYPE</th>
                  <th style={{ width: '110px' }}>MNEMONIC</th>
                  <th style={{ width: '80px' }}>UOM</th>
                  <th style={{ width: '140px' }}>METHODOLOGY</th>
                  <th style={{ width: '110px' }}>SAMPLE TYPE</th>
                  <th style={{ width: '95px', textAlign: 'center' }}>STATUS</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
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

                  // Resolve UOM text
                  const uomDisplay =
                    typeof item.AnalyteuomId === 'string' && isNaN(Number(item.AnalyteuomId))
                      ? item.AnalyteuomId
                      : uomMap.get(Number(item.AnalyteuomId)) || item.AnalyteUom?.Description || (item.AnalyteuomId ? String(item.AnalyteuomId) : '—');

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

                      {/* Analyte Name */}
                      <td>
                        <div className="pkg-name-cell">
                          <span
                            className="pkg-name-primary"
                            title={item.Name}
                            style={{ cursor: 'pointer', color: '#0d9488' }}
                            onClick={() => handleEdit(item)}
                          >
                            {item.Name}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f0fdf4',
                            color: '#166534',
                          }}
                        >
                          {item.AnalyteType?.Description || (item.analytetype_e === 1 ? 'Lab' : 'General')}
                        </span>
                      </td>

                      {/* Mnemonic */}
                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: '#475569',
                            background: '#f8fafc',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {item.Mnemonics || '—'}
                        </span>
                      </td>

                      {/* UOM */}
                      <td>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#0369a1',
                            fontWeight: 500,
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {uomDisplay}
                        </span>
                      </td>

                      {/* Methodology */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#475569' }}>
                          {item.Methodology || '—'}
                        </span>
                      </td>

                      {/* Sample Type */}
                      <td>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                          {item.Sampletype?.Name || item.SampletypeId || '—'}
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
                            id={`btnEditAnalyte_${item.Id}`}
                            className="pkg-action-btn pkg-action-edit"
                            title="Edit analyte master"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>

                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              id={`btnDeleteAnalyte_${item.Id}`}
                              className="pkg-action-btn pkg-action-delete"
                              title="Delete analyte master"
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
              <strong>{totalItems.toLocaleString()}</strong> analytes
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
        title="Delete Analyte Master"
        message={`Are you sure you want to delete analyte "${itemToDelete?.Code} - ${itemToDelete?.Name}"? This action cannot be undone.`}
        confirmLabel="Delete Analyte"
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
