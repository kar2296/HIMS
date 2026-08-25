import React from 'react';
import { PageHeader } from '../components/ui/Breadcrumb';
import { colors, spacing, typography } from '../components/ui/tokens';

interface DashboardReportsMenuScreenProps {
  onAction?: (actionName: string, payload?: any) => void;
}

interface ReportRow {
  label: string;
  action?: string; // omitted entirely for rows whose real ng-click="" is a confirmed no-op
}

const REPORTS_SECTION: ReportRow[] = [
  { label: 'IP Admission Report', action: 'ipadmissionreport' },
  { label: 'IP Discharge Report', action: 'ipdischargereport' },
  { label: 'Admission By Ward' },
  { label: 'IP Occupancy Report', action: 'ipoccupancyreport' },
  { label: 'Occupancy Ratio' },
  { label: 'Available Beds By Ward', action: 'availablebeds' },
  { label: 'MLC Patient List' },
  { label: 'Bed Transfer List', action: 'bedtransferreport' },
  { label: 'Payer Patient List' },
  { label: 'Surgery Schedule Report' },
  { label: 'Surgery Done List' },
];

const MASTERS_SECTION: ReportRow[] = [
  { label: 'Doctor List', action: 'doctorlistreport' },
  { label: 'Procedure List' },
  { label: 'Ward / Room List', action: 'wardandbedlist' },
];

const sectionHeaderStyle: React.CSSProperties = {
  background: '#fb8624', color: '#fff', fontWeight: 700,
  padding: `${spacing.sm} ${spacing.md}`, fontFamily: typography.fontFamily,
};
const rowLabelStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily, width: '83%',
};
const rowLinkCellStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
};

// UI-MODERNIZATION RETROFIT (Billing / Dashboard Reports launcher pages,
// app.nursingreport and app.doctorreport). Both real states
// (nursingreportController / doctorreportController) mount this SAME
// React component -- confirmed via a byte-for-byte comparison that
// nursingreports.html and doctorreports.html are identical templates.
// This is a pure navigation menu -- no data fetch, no reactProps needed
// -- each row's "View" link dispatches an action name that the hollowed
// controller's handleReactAction falls through to the matching real
// $scope function ($state.go with context: 'nursingreport'/'doctorreport'
// respectively, preserving the distinct real navigation per screen).
//
// CONFIRMED PRE-EXISTING BUG, reproduced exactly, not fixed: the doctor
// reports page (doctorreports.html) reuses the "Nursing Reports" section
// header and every nursingreports.* translate key verbatim -- there is
// no doctorreports.* translation namespace in the real template at all.
// The real doctor-reports screen today literally displays "Nursing
// Reports" as its section header. This component renders the same
// literal text regardless of which real state mounts it, matching that
// bug on both screens.
//
// CONFIRMED DEAD ("View" links present but non-functional): Admission By
// Ward, Occupancy Ratio, MLC Patient List, Payer Patient List, Surgery
// Schedule Report, Surgery Done List, Procedure List -- each has a real
// ng-click="" (empty) in both templates, verified via full read. These
// rows render their real label and "View" text but are NOT wired to any
// dispatch here, matching the real screen's non-functional links exactly.
export const DashboardReportsMenuScreen: React.FC<DashboardReportsMenuScreenProps> = ({ onAction }) => {
  const dispatch = (action?: string) => {
    if (action && onAction) onAction(action);
  };

  const renderSection = (title: string, rows: ReportRow[]) => (
    <div style={{ flex: '1 1 320px', minWidth: 280 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: spacing.sm }}>
        <thead>
          <tr><th colSpan={2} style={sectionHeaderStyle}>{title}</th></tr>
        </thead>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td style={rowLabelStyle}>{row.label}</td>
              <td style={rowLinkCellStyle}>
                {row.action ? (
                  <a href="#" onClick={(e) => { e.preventDefault(); dispatch(row.action); }} style={{ color: colors.primary, cursor: 'pointer' }}>View</a>
                ) : (
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: colors.primary, cursor: 'default' }}>View</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px` }}>
      <PageHeader
        title="Reports"
        actions={
          <span
            style={{ cursor: 'pointer', color: colors.primary }}
            title="Dashboard"
            onClick={() => dispatch('backtoList')}
          >
            <i className="fas fa-home" aria-hidden="true" />
          </span>
        }
      />
      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
        {renderSection('Nursing Reports', REPORTS_SECTION)}
        {renderSection('Masters', MASTERS_SECTION)}
      </div>
    </div>
  );
};
