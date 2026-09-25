/**
 * "Today's OPD Visits (n)" button + list, as on the new-design registration screen.
 *
 *   data  Visit/Visit/GetEncounters  (Key 15 EncounterTypeId = 1 OP, Key 1 FacilityId,
 *                                     Key 83/84 CreatedFrom/CreatedTo = today)
 *   pick  onSelectPatient(patientId) -- the registration screen loads that patient
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from './utils/api';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/Loading';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { useAsyncData } from './emr-workspace/useAsyncData';

type Row = Record<string, any>;

interface TodayOpdVisitsProps {
  reactProps?: { facilityId?: number | string };
  facilityId?: number | string;
  onSelectPatient?: (patientId: number) => void;
}

const OP_ENCOUNTER = 1;
const todayRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
};
const timeOf = (v?: string) => (v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
const nameOf = (p?: Row | null) => (p ? [p.FirstName, p.MiddleName, p.LastName].filter(Boolean).join(' ') : '');

export const TodayOpdVisits: React.FC<TodayOpdVisitsProps> = (props) => {
  const facilityId = Number(props.facilityId ?? props.reactProps?.facilityId) || 0;
  const onSelectPatient = props.onSelectPatient;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);

  const fetcher = useCallback(async (): Promise<Row[]> => {
    void version; // re-read when the list is opened again
    const { from, to } = todayRange();
    const params: { Key: number; Value: any }[] = [
      { Key: 15, Value: OP_ENCOUNTER },
      { Key: 83, Value: from },
      { Key: 84, Value: to },
    ];
    if (facilityId > 0) params.push({ Key: 1, Value: facilityId });
    const res = await apiFetch('Visit/Visit/GetEncounters', { Params: params, PageContext: { PageSize: 500, PageNumber: 1 } });
    return (res?.Data || []).sort((a: Row, b: Row) => String(b.CreatedAt || '').localeCompare(String(a.CreatedAt || '')));
  }, [facilityId, version]);
  const { data: visits, loading, error } = useAsyncData<Row[]>(fetcher, [], { errorMessage: "Could not load today's visits." });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter((v) =>
      [nameOf(v.Patient), v.PatientMrn, v.Patient?.MRN, v.VisitIdentifier, v.DoctorName, v.Patient?.Mobile]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q)),
    );
  }, [visits, query]);

  const openList = () => {
    setVersion((v) => v + 1);
    setQuery('');
    setOpen(true);
  };
  const pick = (v: Row) => {
    setOpen(false);
    if (v.PatientId && onSelectPatient) onSelectPatient(Number(v.PatientId));
  };

  return (
    <>
      <button type="button" className="reg-nd-btn is-green" onClick={openList} title="Patients who have an OP visit today">
        <i className="fas fa-clipboard-list" aria-hidden="true" /> Today&apos;s OPD Visits ({loading ? '…' : visits.length})
      </button>
      <Modal isOpen={open} title={`Today's OPD visits (${visits.length})`} onClose={() => setOpen(false)} width="880px" portal>
        <div style={{ display: 'grid', gap: spacing.md }}>
          <input
            type="search"
            className="form-control"
            placeholder="Filter by name, UHID, visit no, doctor or mobile…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter today's visits"
            style={{ height: 40, borderRadius: radii.md }}
          />
          {loading ? (
            <SkeletonRows rows={5} columns={5} />
          ) : error ? (
            <div style={{ ...typography.body, color: colors.danger }}>{error}</div>
          ) : shown.length === 0 ? (
            <div style={{ ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.xl }}>
              {visits.length ? 'No visit matches the filter.' : 'No OP visits registered today yet.'}
            </div>
          ) : (
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.lg, overflow: 'auto', maxHeight: '60vh' }}>
              <table className="today-opd-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {['Time', 'Visit no', 'UHID', 'Patient', 'Doctor', 'Department'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((v) => (
                    <tr key={v.Id} onClick={() => pick(v)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && pick(v)} title="Open this patient">
                      <td>{timeOf(v.CreatedAt)}</td>
                      <td>{v.VisitIdentifier || '—'}</td>
                      <td>{v.PatientMrn || v.Patient?.MRN || '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {nameOf(v.Patient) || '—'}
                        {v.Patient?.Mobile && <span style={{ display: 'block', ...typography.helper, color: colors.textMuted }}>{v.Patient.Mobile}</span>}
                      </td>
                      <td>{v.DoctorName || '—'}</td>
                      <td>{v.Department?.DepartmentName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <style>{`
          .today-opd-table th { position: sticky; top: 0; background: ${colors.surfaceMuted}; color: ${colors.textMuted}; font-size: 11px;
            font-weight: 700; text-transform: uppercase; letter-spacing: .04em; text-align: left; padding: 10px 12px; border-bottom: 1px solid ${colors.border}; }
          .today-opd-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: ${colors.textMain}; }
          .today-opd-table tbody tr { cursor: pointer; }
          .today-opd-table tbody tr:hover td, .today-opd-table tbody tr:focus td { background: ${colors.primaryLight}; outline: none; }
        `}</style>
      </Modal>
    </>
  );
};
