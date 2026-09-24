import React from 'react';
import { CERT_STATUS, certStatusLabel } from './dischargeDocument';

const toneFor = (statusId?: number | null): string => {
  switch (statusId) {
    case CERT_STATUS.DRAFT:
      return 'draft';
    case CERT_STATUS.CREATED:
      return 'done';
    case CERT_STATUS.APPROVED:
    case CERT_STATUS.RELEASED:
      return 'ok';
    case CERT_STATUS.CANCELLED:
      return 'bad';
    default:
      return 'none';
  }
};

/** Discharge summary status pill (Not started / Draft / Completed / Approved / Released / Cancelled). */
export const SummaryStatusBadge: React.FC<{ statusId?: number | null; title?: string }> = ({ statusId, title }) => (
  <span className={`dsw-badge dsw-badge--${toneFor(statusId)}`} title={title}>
    {certStatusLabel(statusId)}
  </span>
);
