import React, { useState, useEffect, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface PriceMappingItem {
  Id: number;
  ExternalProviderId?: number;
  TestId?: number;
  TestName?: string;
  TestCode?: string;
  TESTMASTERTYPId?: number;
  TESTMASTERTYP?: {
    Description?: string;
  };
  AliasCode?: string;
  AliasName?: string;
  Price?: number;
  ActiveStatusId?: number;
  ActiveStatus?: {
    Description?: string;
  };
  IsActive?: boolean;
}

export interface ExternalProviderPriceMappingListScreenProps {
  providerId?: number;
  providerName?: string;
  reactProps?: {
    externalproviderid?: number;
    providerName?: string;
    items?: PriceMappingItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      TestName?: string;
      TESTMASTERTYPId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      TESTMASTERTYP?: Array<{ Id: number | string; Text: string }>;
      ActiveStatus?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onBack?: () => void;
}

export const ExternalProviderPriceMappingListScreen: React.FC<ExternalProviderPriceMappingListScreenProps> = ({
  providerId: propProviderId,
  providerName: propProviderName,
  reactProps,
  onAction,
  onBack,
}) => {
  const providerId = propProviderId || reactProps?.externalproviderid || 0;
  const providerName = propProviderName || reactProps?.providerName || 'External Laboratory';

  const [items, setItems] = useState<PriceMappingItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [testSearch, setTestSearch] = useState<string>(reactProps?.currentfilter?.TestName || '');
  const [typeId, setTypeId] = useState<string>(
    String(reactProps?.currentfilter?.TESTMASTERTYPId !== undefined ? reactProps.currentfilter.TESTMASTERTYPId : '-1')
  );
  const [statusId, setStatusId] = useState<string>(
    String(reactProps?.currentfilter?.ActiveStatusId !== undefined ? reactProps.currentfilter.ActiveStatusId : '2')
  );

  const testMasterTypes = (reactProps?.lookup?.TESTMASTERTYP as any) || [
    { Id: -1, Text: 'All Disciplines' },
    { Id: 1, Text: 'Molecular Biology & Genetics' },
    { Id: 2, Text: 'Specialized Histopathology' },
    { Id: 3, Text: 'Reference Cytogenetics' },
    { Id: 4, Text: 'Automated Clinical Biochemistry' },
  ];

  const fetchData = useCallback(async () => {
    if (!providerId || providerId <= 0) return;
    setLoading(true);
    try {
      const inputData = {
        Params: [
          { Key: 6, Value: testSearch.trim() || null },
          { Key: 2, Value: typeId !== '-1' ? parseInt(typeId, 10) : -1 },
          { Key: 3, Value: statusId !== '-1' ? parseInt(statusId, 10) : -1 },
          { Key: 5, Value: providerId },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('lis/PriceMapping/GetPriceMappings', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('Failed to load price mappings:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [providerId, testSearch, typeId, statusId, pageSize, currentPage, reactProps?.items, reactProps?.totalItems]);

  useEffect(() => {
    if (reactProps?.items) {
      setItems(reactProps.items);
      setTotalItems(reactProps.totalItems || reactProps.items.length);
    } else {
      fetchData();
    }
  }, [reactProps?.items, reactProps?.totalItems, fetchData]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      onAction('search', {
        TestName: testSearch,
        TESTMASTERTYPId: parseInt(typeId, 10),
        ActiveStatusId: parseInt(statusId, 10),
      });
    } else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handleReset = () => {
    setTestSearch('');
    setTypeId('-1');
    setStatusId('2');
    if (onAction) onAction('resetFilters');
    else {
      setCurrentPage(1);
      fetchData();
    }
  };

  const handleGoBack = () => {
    if (onBack) onBack();
    else if (onAction) onAction('backToList');
    else window.location.hash = '#/app/externalprovider';
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
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleGoBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-arrow-left" /> Back to Providers
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Outsource Price Schedule: <span style={{ color: '#0284c7' }}>{providerName}</span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (onAction ? onAction('addNew') : alert('Open price mapping modal'))}
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
          }}
        >
          <i className="fa fa-plus" /> Map Test Price
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          marginBottom: '20px',
        }}
      >
        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Discipline
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Test Name / Code
              </label>
              <input
                type="text"
                placeholder="e.g. Karyotyping, HLA Typing..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

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
                <i className="fa fa-search" /> Filter
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

      {/* Main Table */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px', width: '50px' }}>#</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Test Code</th>
                <th style={{ padding: '12px 16px' }}>Investigation / Test Name</th>
                <th style={{ padding: '12px 16px' }}>External Lab Alias</th>
                <th style={{ padding: '12px 16px', width: '130px', textAlign: 'right' }}>Agreed Outsource Cost</th>
                <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '18px' }} />
                    Loading price mappings...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '32px', marginBottom: '8px' }}>
                      <i className="fa fa-tags" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                      No Outsource Test Price Mappings Found
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                      Click <b>Map Test Price</b> to register agreed test costs with this laboratory.
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
                          {item.TestCode || `TST-${item.TestId || item.Id}`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.TestName || 'Diagnostic Test'}</div>
                        {item.TESTMASTERTYP?.Description && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {item.TESTMASTERTYP.Description}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {item.AliasName || item.AliasCode ? (
                          <span>
                            <b>{item.AliasCode || ''}</b> {item.AliasName ? `— ${item.AliasName}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Standard Code</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                        {item.Price !== undefined ? `$ ${Number(item.Price).toFixed(2)}` : '—'}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            title="Edit Price Mapping"
                            onClick={() => (onAction ? onAction('edit', item) : alert(`Edit price for ${item.Id}`))}
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

                          <button
                            type="button"
                            title="Delete Mapping"
                            onClick={() => (onAction ? onAction('delete', item) : alert(`Delete price for ${item.Id}`))}
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
              onPageChange={(page) => {
                setCurrentPage(page);
                if (onAction) onAction('pageChange', { page });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
