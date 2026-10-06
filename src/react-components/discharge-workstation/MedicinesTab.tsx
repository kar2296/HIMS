/**
 * Discharge medicines: the editable list that goes into the summary, plus the discharge
 * prescriptions of this admission that can be added to it.
 */
import React from 'react';
import { Button } from '../Button';
import { InlineNotice } from '../emr-workspace/EmrUi';
import type { DischargeMedicine } from './dischargeDocument';

const COLUMNS: { key: keyof DischargeMedicine; label: string }[] = [
  { key: 'name', label: 'Medicine' },
  { key: 'dose', label: 'Dose' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'route', label: 'Route' },
  { key: 'duration', label: 'Duration' },
  { key: 'instructions', label: 'Instructions' },
];

const sameMedicine = (a: DischargeMedicine, b: DischargeMedicine) =>
  a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && (a.dose || '') === (b.dose || '');

interface Props {
  medicines: DischargeMedicine[];
  onChange: (next: DischargeMedicine[]) => void;
  prescribed: DischargeMedicine[];
  prescribedLoading: boolean;
  prescribedError: string | null;
  readOnly: boolean;
}

export const MedicinesTab: React.FC<Props> = ({ medicines, onChange, prescribed, prescribedLoading, prescribedError, readOnly }) => {
  const update = (index: number, key: keyof DischargeMedicine, value: string) =>
    onChange(medicines.map((m, i) => (i === index ? { ...m, [key]: value } : m)));
  const remove = (index: number) => onChange(medicines.filter((_, i) => i !== index));
  const notAdded = prescribed.filter((p) => !medicines.some((m) => sameMedicine(m, p)));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="dsw-titlebar">
        <h3 style={{ margin: 0, fontSize: 15 }}>Medicines on the summary ({medicines.length})</h3>
        {!readOnly && (
          <Button variant="outline-primary" size="sm" icon="fa-solid fa-plus" onClick={() => onChange([...medicines, { name: '' }])}>
            Add medicine
          </Button>
        )}
      </div>

      <div className="dsw-table-wrap">
        <table className="dsw-table">
          <thead>
            <tr>
              <th>#</th>
              {COLUMNS.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {!readOnly && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 2} style={{ textAlign: 'center', padding: 20 }}>
                  No discharge medicines added.
                </td>
              </tr>
            )}
            {medicines.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                {COLUMNS.map((c) => (
                  <td key={c.key}>
                    {readOnly ? (
                      m[c.key] || '—'
                    ) : (
                      <input
                        className="dsw-cell-input"
                        value={m[c.key] || ''}
                        aria-label={`${c.label} for medicine ${i + 1}`}
                        aria-invalid={c.key === 'name' && !m.name.trim() ? true : undefined}
                        onChange={(e) => update(i, c.key, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td>
                    <Button variant="icon" size="sm" icon="fa-solid fa-trash" title="Remove" aria-label={`Remove medicine ${i + 1}`} onClick={() => remove(i)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && medicines.some((m) => !m.name.trim()) && <div className="dsw-hint">Rows without a medicine name are left out of the summary.</div>}

      {!readOnly && (
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="dsw-titlebar">
            <h3 style={{ margin: 0, fontSize: 15 }}>Discharge prescriptions for this admission</h3>
            {notAdded.length > 1 && (
              <Button variant="outline-primary" size="sm" onClick={() => onChange([...medicines, ...notAdded])}>
                Add all ({notAdded.length})
              </Button>
            )}
          </div>
          {prescribedLoading && <div className="dsw-hint">Loading prescriptions…</div>}
          {prescribedError && <InlineNotice tone="warning">Could not load discharge prescriptions: {prescribedError}</InlineNotice>}
          {!prescribedLoading && !prescribedError && prescribed.length === 0 && (
            <div className="dsw-hint">No discharge medication has been prescribed for this admission. Add medicines above, or prescribe them from the patient's EMR.</div>
          )}
          {prescribed.length > 0 && (
            <div className="dsw-table-wrap">
              <table className="dsw-table">
                <tbody>
                  {prescribed.map((p, i) => {
                    const added = !notAdded.includes(p);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{[p.dose, p.frequency, p.route, p.duration].filter(Boolean).join(' · ')}</td>
                        <td style={{ textAlign: 'right' }}>
                          {added ? (
                            <span className="dsw-hint">Added</span>
                          ) : (
                            <Button variant="outline-primary" size="xs" onClick={() => onChange([...medicines, p])}>
                              Add
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
