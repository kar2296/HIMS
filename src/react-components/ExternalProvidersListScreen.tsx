import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface ExternalProviderItem {
  Id: number;
  Code?: string;
  ProviderName: string;
  TESTMASTERTYPId?: number;
  TESTMASTERTYP?: {
    Id?: number;
    Description?: string;
  };
  FacilityId?: number;
  Facility?: {
    FacilityName?: string;
  };
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  IsProfile?: boolean;
  ContactPerson?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  Accreditation?: string;
}

export interface ExternalProvidersListScreenProps {
  reactProps?: {
    items?: ExternalProviderItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      ProviderName?: string;
      FacilityId?: number;
      ActiveStatusId?: number;
      TESTMASTERTYPId?: number;
      codemnemonicsnamedesc?: string;
    };
    lookup?: {
      ActiveStatus?: Array<{ Id: number | string; Text: string }>;
      TESTMASTERTYP?: Array<{ Id: number | string; Text: string }>;
      Facility?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const ExternalProvidersListScreen: React.FC<ExternalProvidersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const [items, setItems] = useState<ExternalProviderItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(
    reactProps?.currentfilter?.ProviderName || reactProps?.currentfilter?.codemnemonicsnamedesc || ''
  );
  const [typeId, setTypeId] = useState<string>(
    String(reactProps?.currentfilter?.TESTMASTERTYPId !== undefined ? reactProps.currentfilter.TESTMASTERTYPId : '-1')
  );
  const [statusId, setStatusId] = useState<string>(
    String(reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : '2')
  );

  // Lookups with realistic fallbacks
  const testMasterTypes = (reactProps?.lookup?.TESTMASTERTYP as any) || [
    { Id: -1, Text: 'All Laboratory Disciplines' },
    { Id: 1, Text: 'Molecular Biology & Genetics' },
    { Id: 2, Text: 'Specialized Histopathology' },
    { Id: 3, Text: 'Reference Cytogenetics' },
    { Id: 4, Text: 'Automated Clinical Biochemistry' },
    { Id: 5, Text: 'Immunology & Flow Cytometry' },
  ];

  const activeStatuses = (reactProps?.lookup?.ActiveStatus as any) || [
    { Id: -1, Text: 'All Statuses' },
    { Id: 1, Text: 'Active / Draft' },
    { Id: 2, Text: 'Approved / Active' },
    { Id: 3, Text: 'Inactive / Suspended' },
    { Id: 4, Text: 'Under Review' },
  ];

  // Quick stat cards calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const active = items.filter((i) => i.ActiveStatusId === 1 || i.ActiveStatusId === 2 || !i.ActiveStatusId).length;
    const specialized = items.filter((i) => i.TESTMASTERTYPId === 1 || i.TESTMASTERTYPId === 2).length;
    const pendingReview = items.filter((i) => i.ActiveStatusId === 4 || i.ActiveStatusId === 3).length;
    return {
      total,
      active,
      specialized,
      pendingReview,
    };
  }, [items, totalItems]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const inputData = {
        Params: [
          { Key: 1, Value: -1 },
          { Key: 2, Value: typeId !== '-1' ? parseInt(typeId, 10) : -1 },
          { Key: 3, Value: statusId !== '-1' ? parseInt(statusId, 10) : -1 },
          { Key: 4, Value: searchQuery.trim() || null },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('lis/ExternalProvider/GetExternalProvideres', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('Failed to fetch external providers list, using props or cache:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [typeId, statusId, searchQuery, pageSize, currentPage, reactProps?.items, reactProps?.totalItems]);

  useEffect(() => {
    if (reactProps?.items) {
      setItems(reactProps.items);
      setTotalItems(reactProps.totalItems || reactProps.items.length);
    } else {
      fetchData();
    }
  }, [reactProps?.items, reactProps?.totalItems, fetchData]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      onAction('search', {
        ProviderName: searchQuery,
        TESTMASTERTYPId: parseInt(typeId, 10),
        ActiveStatusId: parseInt(statusId, 10),
      });
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setTypeId('-1');
    setStatusId('2');
    if (onAction) {
      onAction('resetFilters');
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onAction) {
      onAction('pageChange', { page });
    } else {
      fetchData();
    }
  };

  const getStatusBadge = (item: ExternalProviderItem) => {
    const statusDesc = item.ActiveStatus?.Description || (item.ActiveStatusId === 2 ? 'Approved / Active' : item.ActiveStatusId === 1 ? 'Active' : 'Inactive');
    const isApproved = item.ActiveStatusId === 2 || statusDesc.toLowerCase().includes('approved') || statusDesc.toLowerCase().includes('active');
    const isDraft = item.ActiveStatusId === 1;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          background: isApproved ? '#dcfce7' : isDraft ? '#e0f2fe' : '#f1f5f9',
          color: isApproved ? '#15803d' : isDraft ? '#0369a1' : '#475569',
          border: `1px solid ${isApproved ? '#bbf7d0' : isDraft ? '#bae6fd' : '#e2e8f0'}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isApproved ? '#16a34a' : isDraft ? '#0284c7' : '#64748b',
          }}
        />
        {statusDesc}
      </span>
    );
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              }}
            >
              <i className="fa fa-hospital-o" />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                External Referral Laboratories Master
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Accredited reference laboratories, outsource providers, and send-out investigation networks
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => (onAction ? onAction('addNew') : alert('Open new provider registration form'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <i className="fa fa-plus" /> Add External Lab
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-building" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Providers</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{stats.total}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-check-circle" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Approved & Active</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{stats.active}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-flask" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Specialized Genetics/Histo</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#9333ea' }}>{stats.specialized}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-clock-o" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Draft / Under Review</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>{stats.pendingReview}</div>
          </div>
        </div>
      </div>

      {/* Modern Filter Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          marginBottom: '20px',
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end',
            }}
          >
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Search Code / Provider Name
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa fa-search"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder="e.g. Metropolis, SRL, LAB-001..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Test Master Discipline Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Specialty / Discipline
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
              >
                {testMasterTypes.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.Description}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Provider Status
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
              >
                {activeStatuses.map((opt: any) => (
                  <option key={opt.Id} value={String(opt.Id)}>
                    {opt.Text || opt.Description}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa fa-filter" /> Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                <th style={{ padding: '12px 16px', width: '60px' }}>#</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Lab Code</th>
                <th style={{ padding: '12px 16px' }}>External Provider Name</th>
                <th style={{ padding: '12px 16px' }}>Laboratory Discipline</th>
                <th style={{ padding: '12px 16px', width: '140px' }}>Status</th>
                <th style={{ padding: '12px 16px', width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '18px' }} />
                    Loading external referral laboratories...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '32px', marginBottom: '8px' }}>
                      <i className="fa fa-hospital-o" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                      No External Laboratory Providers Found
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                      Try adjusting your search criteria or register a new referral laboratory.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.Id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 500 }}>
                        {rowNumber}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#0369a1',
                            backgroundColor: '#f0f9ff',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            border: '1px solid #e0f2fe',
                            fontSize: '12px',
                          }}
                        >
                          {item.Code || `EXT-${item.Id}`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.ProviderName}
                        </div>
                        {item.ContactPerson && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            <i className="fa fa-user" style={{ marginRight: '4px' }} />
                            {item.ContactPerson} {item.Phone ? `(${item.Phone})` : ''}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          <i className="fa fa-microchip" style={{ color: '#0284c7' }} />
                          {item.TESTMASTERTYP?.Description || 'General Reference Lab'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(item)}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            title="Edit Provider"
                            onClick={() => (onAction ? onAction('edit', item) : alert(`Edit ${item.ProviderName}`))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                            }}
                          >
                            <i className="fa fa-pencil" />
                          </button>

                          {item.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              title="Delete Provider"
                              onClick={() => (onAction ? onAction('delete', item) : alert(`Delete ${item.ProviderName}`))}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                border: '1px solid #fecaca',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                              }}
                            >
                              <i className="fa fa-trash" />
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
        {totalItems > pageSize && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
