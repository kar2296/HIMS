/**
 * MRD & OT reports menu (state app.ipopreportstab.mrd&otreport).
 * Migrated from public/views/dashboard/frontoffice/mrd&otreport.* -- the AngularJS controller
 * only supplies privileges, translated labels and navigation.
 */
import React from 'react';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';
import { EmptyState } from '../../components/ui/EmptyState';

interface MrdOtReportScreenProps {
  reactProps?: {
    privileges?: { otSchedule?: boolean; surgeryEntry?: boolean };
    labels?: { otSchedule?: string; surgeryEntry?: string; noAccess?: string };
  };
  navigateTo?: (state: string, params?: Record<string, unknown>) => void;
}

interface ReportLink {
  key: string;
  label: string;
  icon: string;
  state: string;
}

const REPORT_CONTEXT = { context: 'mrdandotreports' };

export const MrdOtReportScreen: React.FC<MrdOtReportScreenProps> = ({ reactProps, navigateTo }) => {
  const privileges = reactProps?.privileges || {};
  const labels = reactProps?.labels || {};

  const reports: ReportLink[] = [
    privileges.otSchedule && { key: 'otschedule', label: labels.otSchedule || 'OT Schedule Report', icon: 'fa-solid fa-calendar-days', state: 'app.otschedulereport' },
    privileges.surgeryEntry && { key: 'surgeryentry', label: labels.surgeryEntry || 'OT Register Report', icon: 'fa-solid fa-book-medical', state: 'app.surgeryentryreports' },
  ].filter((r): r is ReportLink => Boolean(r));

  if (reports.length === 0) {
    return <EmptyState icon="fa-solid fa-lock" text={labels.noAccess || 'No MRD & OT reports are available for your role.'} />;
  }

  return (
    <div style={{ padding: spacing.lg, display: 'grid', gap: spacing.sm, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {reports.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => navigateTo?.(r.state, REPORT_CONTEXT)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            cursor: 'pointer',
            textAlign: 'left',
            font: `600 14px ${typography.fontFamily}`,
            color: colors.textMain,
          }}
        >
          <span
            aria-hidden="true"
            style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: radii.md, background: colors.primaryLight, color: colors.primary }}
          >
            <i className={r.icon} />
          </span>
          <span style={{ flex: 1 }}>{r.label}</span>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" style={{ color: colors.textSubtle }} />
        </button>
      ))}
    </div>
  );
};
