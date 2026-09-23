/**
 * Nursing chart panels, each on its existing table and form:
 *
 *   INTAKE & OUTPUT   (emr.ws.intakeoutput)  emr/IntakeOutputChart/GetIntakeOutputCharts   + modal patientemr.inoutchartform
 *   HAEMODIALYSIS     (emr.ws.haemodialysis) emr/PatientDialysisChart/GetPatientDialysisCharts + modal patientemr.dialysischartform
 *   PRE-OP CHECKLIST  (emr.ws.preopchecklist) emr/PreOperativeChecklist/GetPreOperativeChecklists + modal patientemr.preoperativechecklist
 *   IPD PRESCRIPTION / MAR (emr.ws.mar)      emr/emar/GetEmars + modal patientemr.drugadminister
 *
 * The chart forms are the same ones the IP dashboard's Nursing Charts already use (opened with openFixedDialog).
 */
import React from 'react';
import { apiFetch } from '../../utils/api';
import { Button } from '../../Button';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, EmrWorkspaceContext } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { RecordListSection, type RecordListConfig } from '../RecordListSection';

type Row = Record<string, any>;

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};
const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));
const d = (v?: { Description?: string } | null) => v?.Description || '—';

const chartParams = (context: EmrWorkspaceContext, _e: unknown, row?: Row) => ({ id: row?.Id || 0, pid: context.patientId, eid: context.encounterId });

const byEncounter = (action: string) => async (context: EmrWorkspaceContext): Promise<Row[]> => {
  if (!context.encounterId) return [];
  const res = await apiFetch(action, {
    Params: [
      { Key: 2, Value: context.patientId },
      { Key: 3, Value: context.encounterId },
    ],
    PageContext: { PageSize: 200, PageNumber: 1 },
  });
  return res?.Data || [];
};

/* ───────────── Intake & Output ───────────── */

const FluidBalance: React.FC<{ rows: Row[] }> = ({ rows }) => {
  const intake = rows.reduce((s, r) => s + num(r.IntakeTotal ?? num(r.Oral) + num(r.IV)), 0);
  const output = rows.reduce((s, r) => s + num(r.OutputTotal ?? num(r.Urine) + num(r.Aspiration) + num(r.VomitousDiarhoea) + num(r.Drains)), 0);
  const balance = intake - output;
  const status = Math.abs(balance) < 1 ? 'Balanced' : balance > 0 ? 'Positive balance' : 'Negative balance';
  const tiles: [string, string, string][] = [
    ['Total intake', `${intake} mL`, colors.info],
    ['Total output', `${output} mL`, colors.gold],
    ['Fluid balance', `${balance > 0 ? '+' : ''}${balance} mL`, balance === 0 ? colors.success : balance > 0 ? colors.primary : colors.danger],
    ['Status', status, colors.textMain],
  ];
  return (
    <div className="emrws-stat-row" role="group" aria-label="Fluid balance">
      {tiles.map(([label, value, color]) => (
        <div key={label} style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: `${spacing.sm} ${spacing.md}`, background: colors.surfaceMuted }}>
          <div style={{ ...typography.caption, color: colors.textSubtle }}>{label}</div>
          <div style={{ ...typography.h4, color }}>{value}</div>
        </div>
      ))}
    </div>
  );
};

const INTAKE_OUTPUT: RecordListConfig<Row> = {
  title: 'Intake and output chart',
  icon: 'fa-solid fa-droplet',
  emptyText: 'No intake / output recorded for this visit',
  fetch: byEncounter('emr/IntakeOutputChart/GetIntakeOutputCharts'),
  summary: (rows) => <FluidBalance rows={rows} />,
  columns: [
    { header: 'Date & time', render: (r) => `${formatDate(r.IntakeOutputChartDate)} ${r.IntakeOutputChartTime ? String(r.IntakeOutputChartTime).slice(0, 5) : ''}` },
    { header: 'Oral (mL)', render: (r) => show(r.Oral) },
    { header: 'IV (mL)', render: (r) => show(r.IV) },
    { header: 'Total intake', render: (r) => <strong>{show(r.IntakeTotal)}</strong> },
    { header: 'Urine (mL)', render: (r) => show(r.Urine) },
    { header: 'Drains', render: (r) => show(r.Drains) },
    { header: 'Aspiration', render: (r) => show(r.Aspiration) },
    { header: 'Vomit / diarrhoea', render: (r) => show(r.VomitousDiarhoea) },
    { header: 'Total output', render: (r) => <strong>{show(r.OutputTotal)}</strong> },
    { header: 'Signed by', render: (r) => show(r.Signatory) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.inoutchartform', fixed: true, params: chartParams, addLabel: 'Add entry' },
};

export const IntakeOutputPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="intakeoutput" config={INTAKE_OUTPUT} {...props} />;

/* ───────────── Haemodialysis ───────────── */

const HAEMODIALYSIS: RecordListConfig<Row> = {
  title: 'Haemodialysis flow chart',
  icon: 'fa-solid fa-filter',
  emptyText: 'No dialysis session recorded for this visit',
  fetch: byEncounter('emr/PatientDialysisChart/GetPatientDialysisCharts'),
  columns: [
    { header: 'Date', render: (r) => formatDate(r.DialysisChartDate) },
    { header: 'Session', render: (r) => [r.StartTime, r.EndTime].filter(Boolean).map((t: string) => String(t).slice(0, 5)).join(' – ') || '—' },
    { header: 'BP', render: (r) => show(r.BP) },
    { header: 'Pulse', render: (r) => show(r.Pulse) },
    { header: 'Temp', render: (r) => show(r.Temp) },
    { header: 'UF rate', render: (r) => show(r.UFR) },
    { header: 'Blood flow', render: (r) => show(r.BF) },
    { header: 'Pre / post wt', render: (r) => `${show(r.PreDialysisWt)} / ${show(r.PostDialysisWt)}` },
    { header: 'Heparin', render: (r) => show(r.Haparin) },
    { header: 'Signed by', render: (r) => show(r.Signatory) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.dialysischartform', fixed: true, params: chartParams, addLabel: 'New session' },
};

export const HaemodialysisPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="haemodialysis" config={HAEMODIALYSIS} {...props} />;

/* ───────────── Pre-operative checklist ───────────── */

const PRE_OP: RecordListConfig<Row> = {
  title: 'Pre-operative checklist',
  icon: 'fa-solid fa-list-check',
  emptyText: 'No pre-operative checklist yet',
  fetch: async (context) => {
    const res = await apiFetch('emr/PreOperativeChecklist/GetPreOperativeChecklists', { Params: [{ Key: 2, Value: context.patientId }], PageContext: { PageSize: 100, PageNumber: 1 } });
    const rows: Row[] = res?.Data || [];
    return context.encounterId ? rows.filter((r) => !r.EncounterId || r.EncounterId === context.encounterId) : rows;
  },
  columns: [
    { header: 'Checklist date', render: (r) => formatDateTime(r.CheckListOn) },
    { header: 'Type', render: (r) => d(r.CheckListType) },
    { header: 'Reviewed on', render: (r) => formatDateTime(r.ReviewedOn) },
    { header: 'Status', render: (r) => (r.PreOperativeChecklistStatus?.Description ? <Badge tone={toneForStatus(r.PreOperativeChecklistStatus.Description)}>{r.PreOperativeChecklistStatus.Description}</Badge> : '—') },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.preoperativechecklist', params: (c, _e, r) => ({ id: r?.Id || 0, pid: c.patientId, eid: c.encounterId, context: 'emr' }), addLabel: 'New checklist' },
  deleteAction: 'emr/PreOperativeChecklist/DeletePreOperativeChecklist',
  deleteLabel: () => 'this checklist',
};

export const PreOpChecklistPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="preop" config={PRE_OP} {...props} />;

/* ───────────── IPD prescription / MAR ───────────── */

const scheduleOf = (r: Row) => {
  if (r.STAT) return 'STAT';
  const mnn = [r.Morning, r.Noon, r.Night].map((v) => (v === null || v === undefined || v === '' ? '0' : String(v)));
  return mnn.some((v) => v !== '0') ? mnn.join('-') : '—';
};

const MAR: RecordListConfig<Row> = {
  title: 'Medication administration record',
  icon: 'fa-solid fa-syringe',
  emptyText: 'No medication orders to administer for this visit',
  fetch: async (context) => {
    if (!context.encounterId) return [];
    const res = await apiFetch('emr/emar/GetEmars', {
      Params: [
        { Key: 3, Value: context.patientId },
        { Key: 4, Value: context.encounterId },
      ],
      PageContext: { PageSize: 300, PageNumber: 1 },
    });
    return res?.Data || [];
  },
  columns: [
    { header: 'Drug', render: (r) => <strong>{r.DrugName || '—'}</strong> },
    { header: 'Dosage', render: (r) => show(r.Dosage) },
    { header: 'Schedule', render: (r) => scheduleOf(r) },
    { header: 'Start', render: (r) => formatDate(r.StartDate) },
    { header: 'End', render: (r) => formatDate(r.EndDate) },
    { header: 'Given', render: (r) => (r.AdministeredDate ? `${formatDateTime(r.AdministeredDate)}${r.AdministeredQuantity ? ` · ${r.AdministeredQuantity}` : ''}` : '—') },
    {
      header: 'Status',
      render: (r) => {
        const s = r.AdministerStatus?.Description;
        return s ? <Badge tone={toneForStatus(s)}>{s}</Badge> : '—';
      },
    },
  ],
  rowKey: (r) => r.Id,
};

export const IpdMarPanel: React.FC<EmrPanelProps> = (props) => {
  const { openLegacyModal, onDataChanged } = props;
  const config: RecordListConfig<Row> = {
    ...MAR,
    rowActions: (r, { reload, canEdit }) => (
      <Button
        size="xs"
        variant="outline-primary"
        icon="fa-solid fa-syringe"
        disabled={!canEdit || !openLegacyModal}
        onClick={() =>
          openLegacyModal?.('patientemr.drugadminister', { id: r.Id }, () => {
            reload();
            onDataChanged?.('mar');
          })
        }
      >
        Administer
      </Button>
    ),
  };
  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <RecordListSection dataKey="mar" config={config} {...props} />
    </div>
  );
};
