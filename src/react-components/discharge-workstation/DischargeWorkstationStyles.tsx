/**
 * Scoped styles for the Discharge Summary Workstation. Everything is prefixed `dsw-` and lives under
 * `.dsw-root`, so nothing leaks into legacy AngularJS screens. CSS (not inline) is used where media
 * queries, hover, focus and table rules are needed.
 */
import React from 'react';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';

const css = `
.dsw-root { font-family: ${typography.fontFamily}; color: ${colors.textBody}; background: ${colors.surfaceMuted};
  min-height: 100%; padding: ${spacing.lg}; box-sizing: border-box; }
.dsw-root *, .dsw-root *::before, .dsw-root *::after { box-sizing: border-box; }
.dsw-stack { display: grid; gap: ${spacing.md}; max-width: 1400px; margin: 0 auto; min-width: 0; }
.dsw-card { background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: ${radii.lg}; padding: ${spacing.lg}; min-width: 0; }

.dsw-titlebar { display: flex; flex-wrap: wrap; gap: ${spacing.sm}; align-items: center; justify-content: space-between; }
.dsw-title { margin: 0; font-size: 20px; font-weight: 700; color: ${colors.textMain}; display: flex; align-items: center; gap: ${spacing.sm}; }
.dsw-actions { display: flex; flex-wrap: wrap; gap: ${spacing.sm}; align-items: center; }

.dsw-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: ${radii.full};
  font: 600 12px/1.6 ${typography.fontFamily}; white-space: nowrap; border: 1px solid transparent; }
.dsw-badge--none { background: ${colors.neutralBg}; color: ${colors.textMuted}; border-color: ${colors.neutralBorder}; }
.dsw-badge--draft { background: ${colors.warningBg}; color: ${colors.warningText}; border-color: ${colors.warningBorder}; }
.dsw-badge--done { background: ${colors.infoBg}; color: ${colors.infoText}; border-color: ${colors.infoBorder}; }
.dsw-badge--ok { background: ${colors.successBg}; color: ${colors.successText}; border-color: ${colors.successBorder}; }
.dsw-badge--bad { background: ${colors.dangerBg}; color: ${colors.dangerText}; border-color: ${colors.dangerBorder}; }

/* Patient / admission header */
.dsw-header { display: grid; gap: ${spacing.sm}; }
.dsw-patient-name { margin: 0; font-size: 18px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; overflow-wrap: anywhere; }
.dsw-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: ${spacing.sm} ${spacing.lg}; }
.dsw-meta-item { min-width: 0; }
.dsw-meta-label { font: 600 11px/1.4 ${typography.fontFamily}; color: ${colors.textSubtle}; text-transform: uppercase; letter-spacing: .04em; }
.dsw-meta-value { font: 500 14px/1.4 ${typography.fontFamily}; color: ${colors.textBody}; overflow-wrap: anywhere; }

/* Tabs */
.dsw-tabs { display: flex; gap: 4px; border-bottom: 1px solid ${colors.border}; overflow-x: auto; scrollbar-width: thin; }
.dsw-tab { appearance: none; background: none; border: 0; border-bottom: 2px solid transparent; padding: 10px 14px; cursor: pointer;
  font: 600 13px/1.3 ${typography.fontFamily}; color: ${colors.textMuted}; white-space: nowrap; display: inline-flex; gap: 6px; align-items: center; }
.dsw-tab:hover { color: ${colors.primary}; }
.dsw-tab:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: -2px; border-radius: ${radii.sm}; }
.dsw-tab[aria-selected="true"] { color: ${colors.primary}; border-bottom-color: ${colors.primary}; }
.dsw-count { background: ${colors.surfaceSunken}; color: ${colors.textMuted}; border-radius: ${radii.full}; padding: 0 7px; font-size: 11px; }

/* Section form */
.dsw-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${spacing.lg}; }
.dsw-field { display: grid; gap: 6px; min-width: 0; }
.dsw-field--wide { grid-column: 1 / -1; }
.dsw-label { font: 600 13px/1.4 ${typography.fontFamily}; color: ${colors.textBody}; display: flex; gap: 4px; align-items: baseline; }
.dsw-required { color: ${colors.danger}; }
.dsw-textarea, .dsw-input, .dsw-select { width: 100%; min-width: 0; border: 1px solid ${colors.borderStrong}; border-radius: ${radii.md};
  padding: 8px 10px; font: 400 14px/1.5 ${typography.fontFamily}; color: ${colors.textBody}; background: ${colors.surface}; }
.dsw-textarea { resize: vertical; }
.dsw-textarea:focus, .dsw-input:focus, .dsw-select:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primaryLight}; }
.dsw-textarea[aria-invalid="true"] { border-color: ${colors.danger}; }
.dsw-textarea:disabled, .dsw-input:disabled, .dsw-select:disabled { background: ${colors.surfaceSunken}; color: ${colors.textMuted}; }
.dsw-hint { font: 400 12px/1.4 ${typography.fontFamily}; color: ${colors.textSubtle}; }
.dsw-error { font: 500 12px/1.4 ${typography.fontFamily}; color: ${colors.dangerText}; }

/* Tables */
.dsw-table-wrap { overflow-x: auto; border: 1px solid ${colors.border}; border-radius: ${radii.md}; }
.dsw-table { width: 100%; border-collapse: collapse; font: 400 13px/1.45 ${typography.fontFamily}; }
.dsw-table th { text-align: left; background: ${colors.surfaceSunken}; color: ${colors.textMuted}; font-weight: 600; padding: 8px 10px; white-space: nowrap; }
.dsw-table td { padding: 8px 10px; border-top: 1px solid ${colors.border}; vertical-align: top; }
.dsw-table tbody tr:hover { background: ${colors.surfaceMuted}; }
.dsw-row-button { cursor: pointer; }
.dsw-row-button:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: -2px; }
.dsw-table .dsw-cell-input { width: 100%; min-width: 90px; border: 1px solid ${colors.border}; border-radius: ${radii.sm}; padding: 4px 6px; font: inherit; }

/* Worklist filters */
.dsw-filters { display: flex; flex-wrap: wrap; gap: ${spacing.sm}; align-items: center; }
.dsw-filters .dsw-input { flex: 1 1 240px; max-width: 420px; }
.dsw-chip { appearance: none; border: 1px solid ${colors.border}; background: ${colors.surface}; color: ${colors.textBody};
  border-radius: ${radii.full}; padding: 5px 12px; font: 600 12px/1.3 ${typography.fontFamily}; cursor: pointer; }
.dsw-chip[aria-pressed="true"] { background: ${colors.primaryLight}; border-color: ${colors.primary}; color: ${colors.primary}; }
.dsw-chip:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 2px; }
.dsw-pager { display: flex; justify-content: space-between; align-items: center; gap: ${spacing.sm}; flex-wrap: wrap; }

/* Preview (the printed document) */
.dsw-preview { background: #fff; border: 1px solid ${colors.border}; border-radius: ${radii.md}; padding: ${spacing.xl};
  font: 400 14px/1.6 Calibri, ${typography.fontFamily}; color: #111; overflow-x: auto; }
.dsw-preview table { border-collapse: collapse; width: 100%; }
.dsw-preview td, .dsw-preview th { border: 1px solid #999; padding: 4px 6px; text-align: left; }
.dsw-preview p { margin: 0 0 6px; }

.dsw-audit { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: ${spacing.md}; }

@media (max-width: 900px) {
  .dsw-form { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .dsw-root { padding: ${spacing.sm}; }
  .dsw-card { padding: ${spacing.md}; }
  .dsw-actions { width: 100%; }
  .dsw-actions > * { flex: 1 1 auto; }
  .dsw-hide-sm { display: none; }
}
`;

export const DischargeWorkstationStyles: React.FC = () => <style>{css}</style>;
