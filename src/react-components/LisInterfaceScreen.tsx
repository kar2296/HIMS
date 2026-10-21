import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface LisInterfaceItem {
  Id: number;
  LISId?: number;
  Sampleid?: string;
  PatientName?: string;
  MRNNo?: string;
  AssetId?: number;
  Asset?: {
    AssetName?: string;
  };
  PatientWorkorder?: {
    Id?: number;
    WorkOrderNo?: string;
    Encounter?: {
      VisitIdentifier?: string;
    };
  };
  LISInterfacePatientDetail?: {
    PatientId?: number;
  };
  PatientId?: number;
  Patient?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Age?: number;
    Gender?: { Description?: string };
    Title?: { Description?: string };
  };
  Approved?: boolean;
  Rejected?: boolean;
  CreatedDate?: string;
  WorkOrderId?: number;
}

export interface LisInterfaceScreenProps {
  reactProps?: {
    items?: LisInterfaceItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      Sampleid?: string;
      PatientName?: string;
      MRNNo?: string;
      FromDate?: string | Date;
      ToDate?: string | Date;
      StatusId?: number;
      AssetId?: number;
      EncounterTypeId?: number;
      VisitIdentifier?: string;
    };
    lookup?: {
      AssetName?: Array<{ Id: number | string; Text: string }>;
      Status?: Array<{ Id: number | string; Text: string }>;
      EncounterType?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const LisInterfaceScreen: React.FC<LisInterfaceScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const [items, setItems] = useState<LisInterfaceItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Filters
  const [fromDate, setFromDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sampleId, setSampleId] = useState<string>(reactProps?.currentfilter?.Sampleid || '');
  const [patientSearch, setPatientSearch] = useState<string>(reactProps?.currentfilter?.PatientName || '');
  const [mrnNo, setMrnNo] = useState<string>(reactProps?.currentfilter?.MRNNo || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assetId, setAssetId] = useState<string>(String(reactProps?.currentfilter?.AssetId || '-1'));

  // Asset options
  const assetOptions = (reactProps?.lookup?.AssetName as any) || [
    { Id: -1, Text: 'All Analyzers' },
    { Id: 1, Text: 'Mindray BS-800' },
    { Id: 2, Text: 'Sysmex XN-1000' },
    { Id: 3, Text: 'Beckman Coulter DxC' },
    { Id: 4, Text: 'Roche Cobas c311' },
  ];

  // Quick stat cards calculation
  const stats = useMemo(() => {
    const total = totalItems || items.length;
    const approved = items.filter((i) => i.Approved).length;
    const rejected = items.filter((i) => i.Rejected).length;
    const pending = total - approved - rejected;
    return {
      total,
      approved,
      rejected,
      pending: pending > 0 ? pending : 0,
    };
  }, [items, totalItems]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fromFormatted = fromDate ? `${fromDate} 00:00:00` : null;
      const toFormatted = toDate ? `${toDate} 23:59:59` : null;

      const inputData = {
        Params: [
          { Key: 2, Value: sampleId || null },
          { Key: 5, Value: patientSearch || null },
          { Key: 6, Value: mrnNo || null },
          { Key: 7, Value: fromFormatted },
          { Key: 8, Value: toFormatted },
          { Key: 9, Value: statusFilter === 'APPROVED' ? 1 : statusFilter === 'REJECTED' ? 2 : 0 },
          { Key: 10, Value: -1 },
          { Key: 11, Value: null },
          { Key: 12, Value: 1 },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: currentPage,
        },
      };

      const res = await callBackendApi<any>('lis/lisinterface/GetLISInterfaceResults', 'POST', inputData);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      } else if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } catch (err) {
      console.warn('API fetch failed, fallback to reactProps:', err);
      if (reactProps?.items) {
        setItems(reactProps.items);
        setTotalItems(reactProps.totalItems || reactProps.items.length);
      }
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, sampleId, patientSearch, mrnNo, statusFilter, pageSize, currentPage, reactProps]);

  useEffect(() => {
    if (reactProps?.items && reactProps.items.length > 0) {
      setItems(reactProps.items);
      setTotalItems(reactProps.totalItems || reactProps.items.length);
    } else {
      fetchData();
    }
  }, [reactProps, fetchData]);

  const handleActionClick = (actionName: string, entity: LisInterfaceItem) => {
    if (onAction) {
      onAction(actionName, entity);
    } else if ((window as any).angular) {
      const $scope = (window as any).angular.element(document.querySelector('[ng-controller], [ui-view]'))?.scope();
      if ($scope && typeof $scope.handleEvents === 'function') {
        $scope.handleEvents(actionName, entity);
      }
    }
  };

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (statusFilter === 'APPROVED') {
      list = list.filter((i) => i.Approved);
    } else if (statusFilter === 'REJECTED') {
      list = list.filter((i) => i.Rejected);
    } else if (statusFilter === 'PENDING') {
      list = list.filter((i) => !i.Approved && !i.Rejected);
    }
    return list;
  }, [items, statusFilter]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
            Analyzer & Instrument Interface
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Bi-directional analyzer telemetry feed, automated specimen matching, and LIS workorder sync
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => fetchData()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-sync" /> Refresh Instrument Feed
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Feeds
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            {stats.total}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#c2410c', textTransform: 'uppercase' }}>
            Pending Validation
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ea580c', marginTop: '6px' }}>
            {stats.pending}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>
            Validated & Approved
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {stats.approved}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c', textTransform: 'uppercase' }}>
            Flagged / Rejected
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginTop: '6px' }}>
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Analyzer / Device
          </label>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#fff',
              outline: 'none',
            }}
          >
            {assetOptions.map((opt: any) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Sample Barcode / ID
          </label>
          <input
            type="text"
            placeholder="Sample ID..."
            value={sampleId}
            onChange={(e) => setSampleId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              width: '150px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Patient Name / MRN
          </label>
          <input
            type="text"
            placeholder="MRN / Name..."
            value={mrnNo || patientSearch}
            onChange={(e) => {
              setMrnNo(e.target.value);
              setPatientSearch(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              width: '150px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#fff',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved / Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => fetchData()}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-filter" /> Search
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Sample ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Patient Info</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>UHID / MRN</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Visit Identifier</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Approval Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <i className="fa fa-circle-notch fa-2x" />
                    </div>
                    <div style={{ marginTop: '10px' }}>Connecting to analyzer telemetry...</div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <i className="fa fa-microchip fa-3x" style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#64748b' }}>
                      No analyzer test results found for the specified criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const patientName =
                    item.PatientName ||
                    `${item.Patient?.Title?.Description || ''} ${item.Patient?.FirstName || ''} ${
                      item.Patient?.LastName || ''
                    }`.trim() ||
                    'Unknown Patient';

                  return (
                    <tr
                      key={item.Id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0284c7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa fa-barcode" style={{ color: '#64748b' }} />
                          <span>{item.Sampleid || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{patientName}</div>
                        {item.Patient?.Gender?.Description && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {item.Patient.Gender.Description} • Age: {item.Patient.Age || 'N/A'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>
                        {item.MRNNo || item.Patient?.MRN || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {item.PatientWorkorder?.Encounter?.VisitIdentifier || 'Direct Specimen'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {item.Approved ? (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                            }}
                          >
                            <i className="fa fa-check-circle" style={{ marginRight: '4px' }} /> APPROVED
                          </span>
                        ) : item.Rejected ? (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                            }}
                          >
                            <i className="fa fa-times-circle" style={{ marginRight: '4px' }} /> REJECTED
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#ffedd5',
                              color: '#c2410c',
                            }}
                          >
                            <i className="fa fa-clock" style={{ marginRight: '4px' }} /> PENDING
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            title={item.Approved || item.Rejected ? 'View Analyte Results' : 'Edit / Validate Result'}
                            onClick={() => handleActionClick(item.Approved || item.Rejected ? 'view' : 'edit', item)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: item.Approved || item.Rejected ? '1px solid #cbd5e1' : '1px solid #0284c7',
                              backgroundColor: item.Approved || item.Rejected ? '#fff' : '#e0f2fe',
                              color: item.Approved || item.Rejected ? '#475569' : '#0369a1',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className={item.Approved || item.Rejected ? 'fa fa-eye' : 'fa fa-edit'} />
                            {item.Approved || item.Rejected ? 'View' : 'Process'}
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

        {/* Pagination Bar */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {filteredItems.length} of {totalItems} feeds
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((totalItems || 1) / pageSize)}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchData();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LisInterfaceScreen;
