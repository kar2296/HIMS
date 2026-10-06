/** Patient + admission header of the discharge summary editor (all values from the real admission). */
import React from 'react';
import { formatDate } from '../emr-workspace/emrHelpers';
import { admissionStatusText, bedText, doctorName, personName, type AdmissionRow } from './dischargeData';
import { SummaryStatusBadge } from './SummaryStatusBadge';

const Meta: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="dsw-meta-item">
    <div className="dsw-meta-label">{label}</div>
    <div className="dsw-meta-value">{value || '—'}</div>
  </div>
);

interface Props {
  admission: AdmissionRow;
  statusId?: number | null;
}

export const SummaryHeader: React.FC<Props> = ({ admission: a, statusId }) => {
  const p = a.Patient;
  return (
    <div className="dsw-card dsw-header">
      <div className="dsw-titlebar">
        <h2 className="dsw-patient-name">{personName(p) || 'Unknown patient'}</h2>
        <SummaryStatusBadge statusId={statusId} />
      </div>
      <div className="dsw-meta">
        <Meta label="MRN" value={p?.MRN} />
        <Meta label="Age / Sex" value={[p?.Age ? `${p.Age} Y` : '', p?.Gender?.Description].filter(Boolean).join(' / ')} />
        <Meta label="IP No." value={a.VisitIdentifier} />
        <Meta label="Ward / Bed" value={bedText(a)} />
        <Meta label="Admitted" value={formatDate(a.AdmissionDate)} />
        <Meta label="Discharged" value={a.DischargeDate ? formatDate(a.DischargeDate) : 'Not yet'} />
        <Meta label="Attending doctor" value={doctorName(a)} />
        <Meta label="Department" value={a.Department?.DepartmentName} />
        <Meta label="Admission status" value={admissionStatusText(a)} />
      </div>
    </div>
  );
};
