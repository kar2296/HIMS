/**
 * Patient header + visit strip shown above the EMR tab bar
 * (mirrors the reference screen: photo, name, age/gender, MRN, contact, allergy line,
 * then a highlighted strip with visit date, visit no, encounter type and doctor).
 */
import React from 'react';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Loading';
import type { EncounterInfo, PatientInfo } from './types';
import { formatAge, formatDate, formatDateTime, fullName } from './emrHelpers';

interface MetaProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'danger';
}

const Meta: React.FC<MetaProps> = ({ icon, label, value, tone = 'default' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }} title={label}>
    <i className={icon} style={{ color: tone === 'danger' ? colors.danger : colors.textSubtle, fontSize: 12, width: 14, textAlign: 'center' }} aria-hidden="true" />
    <span style={{ ...typography.caption, color: colors.textSubtle }}>{label}</span>
    <span style={{ ...typography.body, fontWeight: 600, color: tone === 'danger' ? colors.danger : colors.textBody, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {value}
    </span>
  </div>
);

export interface AllergySummary {
  loading: boolean;
  names: string[];
}

interface PatientHeaderProps {
  patient: PatientInfo | null;
  loading: boolean;
  allergies: AllergySummary;
  photoSrc?: string;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({ patient, loading, allergies, photoSrc }) => {
  if (loading && !patient) {
    return (
      <div className="emrws-card" style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
        <Skeleton width={56} height={56} rounded />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <Skeleton width="40%" height={18} />
          <Skeleton width="70%" height={12} />
          <Skeleton width="55%" height={12} />
        </div>
      </div>
    );
  }

  const name = fullName(patient);
  const gender = patient?.Gender?.Description;
  // "NKA" rows (recorded from the Allergies panel) mean "no known allergies", not an allergen.
  const realAllergies = allergies.names.filter((n) => n.trim().toUpperCase() !== 'NKA');
  const nka = realAllergies.length === 0 && allergies.names.length > 0;
  const allergyText = allergies.loading
    ? 'Checking…'
    : realAllergies.length > 0
      ? realAllergies.join(', ')
      : nka
        ? 'No known allergies (NKA)'
        : 'Not recorded';

  return (
    <div className="emrws-card emrws-patient">
      <Avatar name={name} src={photoSrc} size="xl" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap', minWidth: 0 }}>
            <h2 style={{ ...typography.h3, margin: 0, color: colors.primary, textTransform: 'uppercase' }}>{name}</h2>
            <span style={{ ...typography.body, color: colors.textMuted }}>
              {[gender, formatAge(patient?.DOB)].filter(Boolean).join(' · ')}
              {patient?.DOB ? ` · DOB ${formatDate(patient.DOB)}` : ''}
            </span>
          </div>
          <span
            style={{
              ...typography.label,
              padding: '3px 10px',
              borderRadius: radii.full,
              background: colors.primaryLight,
              color: colors.primary,
              whiteSpace: 'nowrap',
            }}
          >
            MRN {patient?.MRN || '—'}
          </span>
        </div>
        <div className="emrws-meta-grid">
          <Meta icon="fa-solid fa-phone" label="Mobile" value={patient?.Mobile || '—'} />
          {patient?.Nationality?.Description && <Meta icon="fa-solid fa-flag" label="Nationality" value={patient.Nationality.Description} />}
          {patient?.BloodGroup?.Description && <Meta icon="fa-solid fa-droplet" label="Blood group" value={patient.BloodGroup.Description} tone="danger" />}
          {patient?.Email && <Meta icon="fa-solid fa-envelope" label="Email" value={patient.Email} />}
        </div>
        <div style={{ marginTop: spacing.sm, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: realAllergies.length ? colors.danger : colors.textSubtle, fontSize: 12 }} aria-hidden="true" />
          <span style={{ ...typography.caption, color: colors.textSubtle }}>Allergy</span>
          <span style={{ ...typography.body, fontWeight: 600, color: realAllergies.length ? colors.danger : colors.textMuted }}>{allergyText}</span>
        </div>
      </div>
    </div>
  );
};

interface VisitStripProps {
  encounter: EncounterInfo | null;
  encounterTypeLabel?: string;
}

export const VisitStrip: React.FC<VisitStripProps> = ({ encounter, encounterTypeLabel }) => {
  if (!encounter) {
    return (
      <div className="emrws-visit" style={{ justifyContent: 'center' }}>
        <span style={{ ...typography.body, color: colors.warningText }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} aria-hidden="true" />
          No active visit selected. Open the EMR from a checked-in visit to record clinical data.
        </span>
      </div>
    );
  }
  const visitDate = encounter.ArrivedDate || encounter.AdmissionDate || encounter.CreatedAt;
  const items: [string, React.ReactNode][] = [
    ['Visit date', formatDateTime(visitDate)],
    ['Visit no', encounter.VisitIdentifier || encounter.Id],
    ['Encounter', encounterTypeLabel || '—'],
    ['Doctor', encounter.DoctorName || '—'],
  ];
  return (
    <div className="emrws-visit">
      {items.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ ...typography.caption, color: colors.warningText, opacity: 0.8, whiteSpace: 'nowrap' }}>{label}</span>
          <span style={{ ...typography.body, fontWeight: 600, color: colors.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        </div>
      ))}
    </div>
  );
};
