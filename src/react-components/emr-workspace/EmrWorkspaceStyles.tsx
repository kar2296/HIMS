/**
 * Scoped styles for the EMR Workspace. Everything is prefixed with `emrws-` and lives under
 * `.emrws-root`, so nothing leaks into legacy AngularJS screens. Kept in CSS (not inline) only
 * where media queries / hover / table rules are needed.
 */
import React from 'react';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';

const css = `
.emrws-root { font-family: ${typography.fontFamily}; color: ${colors.textBody}; background: ${colors.surfaceMuted}; min-height: 100%; padding: ${spacing.lg}; box-sizing: border-box; }
.emrws-root *, .emrws-root *::before, .emrws-root *::after { box-sizing: border-box; }
.emrws-stack { display: grid; gap: ${spacing.md}; max-width: 1600px; margin: 0 auto; }

.emrws-card { background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: ${radii.lg}; padding: ${spacing.lg}; }
.emrws-patient { display: flex; gap: ${spacing.lg}; align-items: flex-start; }
.emrws-meta-grid { display: flex; flex-wrap: wrap; gap: ${spacing.sm} ${spacing.xl}; margin-top: ${spacing.sm}; }

.emrws-visit { display: flex; flex-wrap: wrap; gap: ${spacing.sm} ${spacing.xl}; align-items: center; padding: ${spacing.sm} ${spacing.lg};
  background: ${colors.warningBg}; border: 1px solid ${colors.warningBorder}; border-radius: ${radii.md}; }

.emrws-toolbar { display: flex; flex-wrap: wrap; gap: ${spacing.sm}; align-items: center; justify-content: space-between; }
.emrws-toolbar-group { display: flex; flex-wrap: wrap; gap: ${spacing.sm}; align-items: center; }

.emrws-tabbar { display: flex; flex-wrap: wrap; gap: 6px; }
.emrws-tab { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: ${radii.md}; cursor: pointer;
  border: 1px solid ${colors.border}; background: ${colors.surface}; color: ${colors.textBody}; font: 600 12px/1.3 ${typography.fontFamily};
  transition: background .15s, border-color .15s, color .15s; white-space: nowrap; }
.emrws-tab:hover { border-color: ${colors.primary}; color: ${colors.primary}; }
.emrws-tab:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 2px; }
.emrws-tab[aria-selected="true"] { background: ${colors.primary}; border-color: ${colors.primary}; color: #fff; }
.emrws-tab-star { color: ${colors.danger}; }
.emrws-tab[aria-selected="true"] .emrws-tab-star { color: #fff; }
.emrws-tab-select { display: none; }

.emrws-field-row { display: grid; grid-template-columns: 220px 1fr; gap: ${spacing.md}; align-items: center; padding: ${spacing.sm} 0; border-bottom: 1px solid ${colors.surfaceSunken}; }
.emrws-field-row:last-child { border-bottom: none; }

.emrws-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${spacing.md}; }
.emrws-grid-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: ${spacing.md}; }
.emrws-diagnosis-form { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1fr) auto; gap: ${spacing.md}; align-items: start; }

.emrws-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.emrws-table th { text-align: left; padding: 8px 12px; background: ${colors.surfaceMuted}; color: ${colors.textMuted}; font-weight: 600; font-size: 12px;
  border-bottom: 1px solid ${colors.border}; white-space: nowrap; }
.emrws-table td { padding: 9px 12px; border-bottom: 1px solid ${colors.surfaceSunken}; vertical-align: top; }
.emrws-table tbody tr:hover td { background: ${colors.surfaceMuted}; }
.emrws-group-row td { background: ${colors.primaryLight} !important; color: ${colors.primary}; font-size: 12px; padding: 6px 12px; }

.emrws-subcard { border: 1px solid ${colors.border}; border-radius: ${radii.md}; overflow: hidden; }
.emrws-subcard-head { display: flex; justify-content: space-between; align-items: center; gap: ${spacing.sm}; flex-wrap: wrap;
  padding: ${spacing.sm} ${spacing.md}; background: ${colors.surfaceMuted}; border-bottom: 1px solid ${colors.border}; font-size: 13px; }

.emrws-option { display: flex; gap: ${spacing.md}; width: 100%; text-align: left; padding: 8px 10px; border: none; background: transparent;
  border-radius: ${radii.sm}; cursor: pointer; font: 13px/1.4 ${typography.fontFamily}; color: ${colors.textBody}; }
.emrws-option:hover, .emrws-option:focus-visible { background: ${colors.primaryLight}; outline: none; }
.emrws-clear-btn { position: absolute; right: 8px; top: 30px; border: none; background: transparent; color: ${colors.textSubtle}; cursor: pointer; padding: 4px; }

.emrws-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 6px 4px 10px; border-radius: ${radii.full}; background: ${colors.primaryLight};
  color: ${colors.primary}; font-size: 12px; }
.emrws-chip button { border: none; background: transparent; color: inherit; cursor: pointer; padding: 2px 4px; }
.emrws-stat-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: ${spacing.sm}; }
.emrws-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${spacing.lg}; font-size: 13px; }
.emrws-summary-block { border-left: 3px solid ${colors.primaryMid}; padding-left: ${spacing.md}; }
.emrws-dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px ${spacing.md}; margin: 0; }
.emrws-dl dt { color: ${colors.textMuted}; font-weight: 600; }
.emrws-dl dd { margin: 0; }
.emrws-inline-select { border: 1px solid ${colors.border}; border-radius: ${radii.sm}; padding: 4px 8px; font: 600 13px ${typography.fontFamily}; color: ${colors.textMain}; background: ${colors.surface}; max-width: 360px; }
.emrws-start { align-items: flex-end; }
.emrws-flowsheet tbody th { padding: 9px 12px; border-bottom: 1px solid ${colors.surfaceSunken}; font-weight: 600; font-size: 13px; background: ${colors.surface}; position: sticky; left: 0; }
.emrws-flowsheet thead th:first-child { position: sticky; left: 0; z-index: 1; }

/* admin screens (EMR form assembly / panel editor) */
.emrws-admin-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: ${spacing.lg}; align-items: start; }
.emrws-list { list-style: none; margin: 0; padding: 0 ${spacing.sm} ${spacing.sm}; display: grid; gap: 2px; }
.emrws-list-item { display: flex; align-items: center; justify-content: space-between; gap: ${spacing.sm}; width: 100%; text-align: left;
  padding: 8px 10px; border: 1px solid transparent; border-radius: ${radii.md}; background: transparent; cursor: pointer;
  font: 13px/1.4 ${typography.fontFamily}; color: ${colors.textBody}; }
.emrws-list-item:hover { background: ${colors.surfaceMuted}; }
.emrws-list-item:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 1px; }
.emrws-list-item[aria-selected="true"] { background: ${colors.primaryLight}; border-color: ${colors.primaryMid}; color: ${colors.primary}; }
.emrws-placed { list-style: none; margin: 0; padding: ${spacing.sm}; display: grid; gap: ${spacing.sm}; }
.emrws-placed > li { border: 1px solid ${colors.border}; border-radius: ${radii.md}; background: ${colors.surface}; }
.emrws-placed-head { display: flex; align-items: center; gap: 6px; padding: 6px ${spacing.sm}; font-size: 13px; border-bottom: 1px solid ${colors.surfaceSunken}; }
.emrws-placed-body { display: flex; gap: ${spacing.sm}; align-items: center; padding: ${spacing.sm}; }
.emrws-placed-body--grow > :first-child { flex: 1; min-width: 0; }
.emrws-library-item { display: flex; align-items: center; justify-content: space-between; gap: ${spacing.sm}; padding: 8px 10px;
  border-bottom: 1px solid ${colors.surfaceSunken}; font-size: 13px; }
.emrws-library-item > :first-child { flex: 1; }
.emrws-library-item:last-child { border-bottom: none; }

@media (max-width: 1280px) {
  .emrws-admin-grid .emrws-grid-2 { grid-template-columns: 1fr; }
}
@media (max-width: 1024px) {
  .emrws-admin-grid { grid-template-columns: 1fr; }
  .emrws-diagnosis-form { grid-template-columns: 1fr 1fr; }
  .emrws-field-row { grid-template-columns: 170px 1fr; }
}
@media (max-width: 640px) {
  .emrws-root { padding: ${spacing.sm}; }
  .emrws-patient { flex-direction: column; }
  .emrws-tabbar { display: none; }
  .emrws-tab-select { display: block; }
  .emrws-field-row { grid-template-columns: 1fr; gap: 6px; }
  .emrws-grid-2, .emrws-grid-3, .emrws-diagnosis-form, .emrws-summary { grid-template-columns: 1fr; }
  .emrws-stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .emrws-placed-body { flex-wrap: wrap; }
}
@media print {
  .emrws-toolbar, .emrws-tabbar, .emrws-tab-select { display: none !important; }
  .emrws-root { background: #fff; padding: 0; }
}
`;

export const EmrWorkspaceStyles: React.FC = () => <style>{css}</style>;
