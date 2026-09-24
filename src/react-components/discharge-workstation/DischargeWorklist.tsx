/**
 * Worklist: in-patient admissions with the state of their discharge summary.
 * Clicking a row opens the editor for that admission.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { formatDate } from '../emr-workspace/emrHelpers';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import { InlineNotice } from '../emr-workspace/EmrUi';
import { certStatusLabel } from './dischargeDocument';
import { admissionStatusText, bedText, doctorName, loadWorklist, personName, type AdmissionRow, type WorklistPage } from './dischargeData';
import { SummaryStatusBadge } from './SummaryStatusBadge';

const FILTERS: { label: string; ids: number[] }[] = [
  { label: 'Admitted', ids: [2] },
  { label: 'Fit for discharge', ids: [3] },
  { label: 'Clinical discharge', ids: [4] },
  { label: 'Discharged', ids: [5, 6] },
];
const DEFAULT_FILTERS = ['Admitted', 'Fit for discharge', 'Clinical discharge'];
const PAGE_SIZE = 25;

interface Props {
  onOpen: (admission: AdmissionRow) => void;
}

export const DischargeWorklist: React.FC<Props> = ({ onOpen }) => {
  const [active, setActive] = useState<string[]>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Search runs 400 ms after the user stops typing.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const statusIds = useMemo(() => FILTERS.filter((f) => active.includes(f.label)).flatMap((f) => f.ids), [active]);

  const fetcher = useCallback(
    () =>
      statusIds.length === 0
        ? Promise.resolve<WorklistPage>({ rows: [], total: 0, certificates: {} })
        : loadWorklist({ admissionStatusIds: statusIds, search, pageNumber: page, pageSize: PAGE_SIZE }),
    [statusIds, search, page],
  );
  const { data, loading, error, reload } = useAsyncData<WorklistPage>(fetcher, { rows: [], total: 0, certificates: {} }, {
    errorMessage: 'Could not load in-patients.',
  });

  const toggle = (label: string) => {
    setActive((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
    setPage(1);
  };

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div className="dsw-stack">
      <div className="dsw-card dsw-titlebar">
        <h1 className="dsw-title">
          <i className="fa-solid fa-file-medical" aria-hidden="true" style={{ color: 'var(--hims-primary, #2563eb)' }} />
          Discharge Summary Workstation
        </h1>
        <Button variant="outline-secondary" size="sm" icon="fa-solid fa-rotate" onClick={reload} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="dsw-card" style={{ display: 'grid', gap: 12 }}>
        <div className="dsw-filters">
          <input
            className="dsw-input"
            type="search"
            placeholder="Search patient name or MRN"
            aria-label="Search patient name or MRN"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {FILTERS.map((f) => (
            <button key={f.label} type="button" className="dsw-chip" aria-pressed={active.includes(f.label)} onClick={() => toggle(f.label)}>
              {f.label}
            </button>
          ))}
        </div>

        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        {statusIds.length === 0 && <InlineNotice tone="info">Select at least one admission status.</InlineNotice>}

        <div className="dsw-table-wrap">
          <table className="dsw-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>IP No.</th>
                <th className="dsw-hide-sm">Admitted</th>
                <th className="dsw-hide-sm">Ward / Bed</th>
                <th>Doctor</th>
                <th className="dsw-hide-sm">Admission</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && data.rows.length === 0 && statusIds.length > 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                    No in-patients found.
                  </td>
                </tr>
              )}
              {data.rows.map((a) => {
                const cert = data.certificates[a.Id];
                const open = () => onOpen(a);
                return (
                  <tr
                    key={a.Id}
                    className="dsw-row-button"
                    tabIndex={0}
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                      }
                    }}
                    aria-label={`Open discharge summary for ${personName(a.Patient)}`}
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{personName(a.Patient) || '—'}</div>
                      <div className="dsw-hint">
                        {[a.Patient?.MRN, a.Patient?.Age ? `${a.Patient.Age} Y` : '', a.Patient?.Gender?.Description].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{a.VisitIdentifier || '—'}</td>
                    <td className="dsw-hide-sm" style={{ whiteSpace: 'nowrap' }}>{formatDate(a.AdmissionDate)}</td>
                    <td className="dsw-hide-sm">{bedText(a) || '—'}</td>
                    <td>{doctorName(a) || '—'}</td>
                    <td className="dsw-hide-sm">{admissionStatusText(a) || '—'}</td>
                    <td>
                      <SummaryStatusBadge statusId={cert?.CertificateStatusId} title={cert ? certStatusLabel(cert.CertificateStatusId) : undefined} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="dsw-pager">
          <span className="dsw-hint">
            {data.total} patient{data.total === 1 ? '' : 's'}
          </span>
          <div className="dsw-actions">
            <Button variant="outline-secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="dsw-hint">
              Page {page} of {pages}
            </span>
            <Button variant="outline-secondary" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
