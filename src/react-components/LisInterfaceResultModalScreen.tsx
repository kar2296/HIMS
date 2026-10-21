import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';

export interface LisAnalyteResultItem {
  Id?: number;
  LISId?: number;
  AssetId?: number;
  AnalyteId?: number;
  AnalyteName?: string;
  Code?: string;
  LISDescription?: string;
  FullResultValue?: string | number;
  Approved?: boolean;
  Rejected?: boolean;
  IsSaved?: boolean;
  DisplayNo?: number;
  PatientWorkorderdetail?: {
    AnalyteUOM?: string;
  };
  AnalyteUOM?: string;
  Analyterange?: string;
  controlid?: string;
  tabindex?: number;
}

export interface LisInterfaceResultModalScreenProps {
  reactProps?: {
    id?: number;
    patientId?: number;
    sampleId?: string;
    isModal?: boolean;
    results?: LisAnalyteResultItem[];
    patient?: {
      MRN?: string;
      FirstName?: string;
      LastName?: string;
      Age?: number;
      Gender?: { Description?: string };
      Title?: { Description?: string };
    };
    isSaved?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const LisInterfaceResultModalScreen: React.FC<LisInterfaceResultModalScreenProps> = ({
  reactProps,
  onAction,
  onClose,
}) => {
  const [results, setResults] = useState<LisAnalyteResultItem[]>(reactProps?.results || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [sampleId, setSampleId] = useState<string>(reactProps?.sampleId || '');
  const [acceptedAll, setAcceptedAll] = useState<boolean>(false);
  const [rejectedAll, setRejectedAll] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(reactProps?.isSaved || false);

  const patient = reactProps?.patient;

  // Fetch results if not provided via props
  const fetchResults = useCallback(async () => {
    if (!sampleId && !reactProps?.sampleId) return;
    setLoading(true);
    try {
      const inputData = {
        Params: [
          { Key: 2, Value: sampleId || reactProps?.sampleId },
          { Key: 12, Value: 1 },
        ],
        PageContext: {
          PageSize: 1000,
          PageNumber: 1,
        },
      };

      const res = await callBackendApi<any>('lis/LISInterfaceResults/GetLISResultsWithoutGroup', 'POST', inputData);
      if (res && res.Data) {
        setResults(res.Data);
        const hasSaved = res.Data.some((item: LisAnalyteResultItem) => item.Approved || item.Rejected);
        setIsSaved(hasSaved);
      }
    } catch (err) {
      console.warn('Failed to fetch LIS interface result details:', err);
    } finally {
      setLoading(false);
    }
  }, [sampleId, reactProps?.sampleId]);

  useEffect(() => {
    if (reactProps?.results) {
      setResults(reactProps.results);
      if (reactProps.isSaved !== undefined) setIsSaved(reactProps.isSaved);
    } else {
      fetchResults();
    }
  }, [reactProps?.results, reactProps?.isSaved, fetchResults]);

  // Bulk Accept All
  const handleToggleAcceptAll = () => {
    const nextVal = !acceptedAll;
    setAcceptedAll(nextVal);
    if (nextVal) {
      setRejectedAll(false);
      setResults((prev) =>
        prev.map((item) => (item.IsSaved ? item : { ...item, Approved: true, Rejected: false }))
      );
    } else {
      setResults((prev) =>
        prev.map((item) => (item.IsSaved ? item : { ...item, Approved: false }))
      );
    }
    if (onAction) onAction('acceptAll', { accepted: nextVal });
  };

  // Bulk Reject All
  const handleToggleRejectAll = () => {
    const nextVal = !rejectedAll;
    setRejectedAll(nextVal);
    if (nextVal) {
      setAcceptedAll(false);
      setResults((prev) =>
        prev.map((item) => (item.IsSaved ? item : { ...item, Rejected: true, Approved: false }))
      );
    } else {
      setResults((prev) =>
        prev.map((item) => (item.IsSaved ? item : { ...item, Rejected: false }))
      );
    }
    if (onAction) onAction('rejectAll', { rejected: nextVal });
  };

  // Toggle single item accept
  const handleItemAccept = (index: number) => {
    setResults((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      target.Approved = !target.Approved;
      if (target.Approved) {
        target.Rejected = false;
      }
      copy[index] = target;
      return copy;
    });
    if (onAction) onAction('acceptItem', { index, result: results[index] });
  };

  // Toggle single item reject
  const handleItemReject = (index: number) => {
    setResults((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      target.Rejected = !target.Rejected;
      if (target.Rejected) {
        target.Approved = false;
      }
      copy[index] = target;
      return copy;
    });
    if (onAction) onAction('rejectItem', { index, result: results[index] });
  };

  // Value change
  const handleValueChange = (index: number, val: string) => {
    setResults((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], FullResultValue: val };
      return copy;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (onAction) {
      onAction('save', { results });
      return;
    }

    setSaving(true);
    try {
      const payload = { Data: results };
      await callBackendApi('lis/LISInterfaceResults/UpdateLISResult', 'POST', payload);
      setIsSaved(true);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error saving LIS results:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else if (onAction) onAction('close');
  };

  const stats = useMemo(() => {
    const total = results.length;
    const approved = results.filter((r) => r.Approved).length;
    const rejected = results.filter((r) => r.Rejected).length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending: pending > 0 ? pending : 0 };
  }, [results]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '1000px',
        margin: '0 auto',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fa fa-microchip" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              LIS Analyzer Telemetry & Result Verification
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Sample Barcode: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>{sampleId || reactProps?.sampleId || 'BARCODE-PENDING'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#64748b',
            padding: '6px',
            borderRadius: '6px',
          }}
        >
          <i className="fa fa-times" />
        </button>
      </div>

      {/* Patient Banner */}
      {patient && (
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f9ff',
            borderBottom: '1px solid #e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#bae6fd',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {patient.FirstName ? patient.FirstName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                {patient.Title?.Description ? `${patient.Title.Description} ` : ''}
                {patient.FirstName} {patient.LastName || ''}
              </span>
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>
                UHID: <b style={{ color: '#0369a1' }}>{patient.MRN || '—'}</b> &bull; {patient.Age ? `${patient.Age}y` : ''} {patient.Gender?.Description || ''}
              </span>
            </div>
          </div>

          {/* Quick Counter Badges */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
              }}
            >
              Approved: {stats.approved}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
              }}
            >
              Rejected: {stats.rejected}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
              }}
            >
              Pending: {stats.pending}
            </span>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <div style={{ padding: '20px 24px', maxHeight: '550px', overflowY: 'auto' }}>
        {/* Bulk Action Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            backgroundColor: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#15803d',
              }}
            >
              <input
                type="checkbox"
                checked={acceptedAll}
                onChange={handleToggleAcceptAll}
                disabled={isSaved}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Accept All Analytes
            </label>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#b91c1c',
              }}
            >
              <input
                type="checkbox"
                checked={rejectedAll}
                onChange={handleToggleRejectAll}
                disabled={isSaved}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Reject All Analytes
            </label>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{results.length}</b> analyzer telemetry analytes
          </div>
        </div>

        {/* Analytes Table */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '10px 12px', width: '70px', textAlign: 'center' }}>Accept</th>
                <th style={{ padding: '10px 12px', width: '70px', textAlign: 'center' }}>Reject</th>
                <th style={{ padding: '10px 12px', width: '45px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '10px 12px' }}>HIS Analyte Name</th>
                <th style={{ padding: '10px 12px' }}>LIS Analyzer Tag</th>
                <th style={{ padding: '10px 12px', width: '150px' }}>LIS Result</th>
                <th style={{ padding: '10px 12px', width: '90px' }}>Units</th>
                <th style={{ padding: '10px 12px', width: '130px' }}>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '18px' }} />
                    Loading analyzer telemetry results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No telemetry results found for Sample ID <b>{sampleId || reactProps?.sampleId}</b>.
                  </td>
                </tr>
              ) : (
                results.map((item, idx) => {
                  const isAccepted = !!item.Approved;
                  const isRejected = !!item.Rejected;
                  const rowBg = isAccepted ? '#f0fdf4' : isRejected ? '#fef2f2' : 'transparent';

                  return (
                    <tr
                      key={item.Id || idx}
                      style={{
                        backgroundColor: rowBg,
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Accept Checkbox */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAccepted}
                          onChange={() => handleItemAccept(idx)}
                          disabled={item.IsSaved || isSaved}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#16a34a',
                          }}
                        />
                      </td>

                      {/* Reject Checkbox */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isRejected}
                          onChange={() => handleItemReject(idx)}
                          disabled={item.IsSaved || isSaved}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#dc2626',
                          }}
                        />
                      </td>

                      {/* Display No */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>
                        {item.DisplayNo || idx + 1}
                      </td>

                      {/* HIS Analyte Name */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.AnalyteName || 'Analyte Parameter'}
                        </div>
                        {item.Code && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Code: {item.Code}
                          </div>
                        )}
                      </td>

                      {/* LIS Description */}
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {item.LISDescription || item.Code || '—'}
                        </span>
                      </td>

                      {/* LIS Result Value (Editable) */}
                      <td style={{ padding: '10px 12px' }}>
                        <input
                          type="text"
                          value={item.FullResultValue ?? ''}
                          onChange={(e) => handleValueChange(idx, e.target.value)}
                          disabled={item.IsSaved || isSaved}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${isAccepted ? '#86efac' : isRejected ? '#fca5a5' : '#cbd5e1'}`,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0f172a',
                            backgroundColor: '#ffffff',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>

                      {/* Units */}
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {item.PatientWorkorderdetail?.AnalyteUOM || item.AnalyteUOM || '—'}
                      </td>

                      {/* Reference Range */}
                      <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px' }}>
                        {item.Analyterange || 'Normal limits'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        {!isSaved && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            {saving ? (
              <>
                <i className="fa fa-spinner fa-spin" /> Saving...
              </>
            ) : (
              <>
                <i className="fa fa-check" /> Save & Transfer to HIS
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
