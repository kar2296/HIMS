/**
 * LIS antibiotic culture entry, opened as a popup (modal 'app.antibiotic-culture') from the
 * result rich-text editor. Migrated from public/views/lis/antibioticculture/antibiotic-culture.*.
 *
 *   lookups   : General/Options/getoptions (CultureResult, SampleMaster, OrgIsolation)
 *   saved rows: lis/PatientWorkOrderAntibiotics/GetPatientWorkOrderAntibioticss (Key 1 = WorkOrderId)
 *   panel     : lis/AntibioticMaster/GetAntibioticOrganismMaps (Key 2 = organism)
 *   save      : lis/PatientWorkOrderAntibiotics/ManagePatientWorkOrderAntibiotics { Data: rows[] }
 *
 * On save the popup closes with { data: <culture report HTML> }, which the caller appends to the result.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { RichTextEditor } from '../RichTextEditor';
import { Input } from '../../components/ui/Input';
import { SearchSelect, Select } from '../../components/ui/Select';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';
import { cleanLookup, formatAge, fullName } from '../emr-workspace/emrHelpers';
import type { LookupItem } from '../emr-workspace/types';
import { PopupFrame } from './PopupFrame';
import { buildCultureReportHtml } from './cultureReport';

type LabelKey =
  | 'title' | 'specimen' | 'site' | 'microNo' | 'growth' | 'organism' | 'editOrganismMap' | 'cultureReport'
  | 'antibiotics' | 'results' | 'mic' | 'gramStain' | 'remarks' | 'save' | 'saved' | 'noAntibiotics';

interface AntibioticCultureScreenProps {
  reactProps?: {
    context?: { patientId?: number; encounterId?: number; orderId?: number; workOrderId?: number };
    labels?: Partial<Record<LabelKey, string>>;
  };
  onClose?: (result: { data: string }) => void;
  onCancel?: () => void;
  openLegacyModal?: (name: string, params: Record<string, unknown>, onClosed?: () => void) => void;
}

interface CultureHeader {
  OrderedDate?: string;
  SpecimenId?: number | null;
  OrganismIsolatedId?: number | null;
  GramStain?: string;
  Blood?: string;
  MicroNo?: string;
  CultutreReport?: string;
  Remarks?: string;
  ColonyCount?: string;
}

interface AntibioticRow {
  key: string;
  Id: number;
  Antibiotics: string;
  ResultId?: number | null;
  MCH?: string;
}

interface Lookups {
  CultureResult: LookupItem[];
  SampleMaster: LookupItem[];
  OrgIsolation: LookupItem[];
}

const WORK_ORDER_FILTER = 1; // PatientWorkOrderAntibioticsFilters.WorkOrderId
const ORGANISM_FILTER = 2; // AntibioticOrganismMapFilters.OrganismMapId
const PAGE = { PageSize: 100, PageNumber: 1 };
const HEADER_FIELDS: (keyof CultureHeader)[] = ['OrderedDate', 'SpecimenId', 'OrganismIsolatedId', 'GramStain', 'Blood', 'MicroNo', 'CultutreReport', 'Remarks', 'ColonyCount'];

const textOf = (list: LookupItem[], id?: number | null) => (id ? list.find((x) => x.Id === Number(id))?.Text || '' : '');

let rowSeq = 0;
const newKey = () => `ab${++rowSeq}`;

export const AntibioticCultureScreen: React.FC<AntibioticCultureScreenProps> = ({ reactProps, onClose, onCancel, openLegacyModal }) => {
  const ctx = reactProps?.context || {};
  const labels = reactProps?.labels || {};
  const L = (key: LabelKey, fallback: string) => labels[key] || fallback;

  const [lookups, setLookups] = useState<Lookups>({ CultureResult: [], SampleMaster: [], OrgIsolation: [] });
  const [header, setHeader] = useState<CultureHeader>({ OrderedDate: new Date().toISOString(), GramStain: '', Remarks: '' });
  const [rows, setRows] = useState<AntibioticRow[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupVersion, setLookupVersion] = useState(0);

  // Lookups, saved results and the patient banner are independent reads.
  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch('General/Options/getoptions', [{ Key: 'CultureResult' }, { Key: 'SampleMaster' }, { Key: 'OrgIsolation' }]),
      lookupVersion === 0 && ctx.workOrderId
        ? apiFetch('lis/PatientWorkOrderAntibiotics/GetPatientWorkOrderAntibioticss', { Params: [{ Key: WORK_ORDER_FILTER, Value: ctx.workOrderId }], PageContext: PAGE })
        : Promise.resolve(null),
      lookupVersion === 0 && ctx.patientId ? apiFetch('registration/patient/GetPatientById', { Id: ctx.patientId }).catch(() => null) : Promise.resolve(undefined),
    ])
      .then(([opts, saved, pat]) => {
        if (!active) return;
        setLookups({ CultureResult: cleanLookup(opts?.CultureResult), SampleMaster: cleanLookup(opts?.SampleMaster), OrgIsolation: cleanLookup(opts?.OrgIsolation) });
        if (pat !== undefined) setPatient(pat);
        const savedRows: any[] = saved?.Data || [];
        if (savedRows.length > 0) {
          const first = savedRows[0];
          setHeader(Object.fromEntries(HEADER_FIELDS.map((f) => [f, first[f] ?? (f === 'GramStain' || f === 'Remarks' ? '' : undefined)])) as CultureHeader);
          setRows(savedRows.map((r) => ({ key: newKey(), Id: r.Id, Antibiotics: r.Antibiotics, ResultId: r.ResultId, MCH: r.MCH || '' })));
        }
      })
      .catch(() => {
        /* toast already shown */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ctx.workOrderId, ctx.patientId, lookupVersion]);

  const setField = <K extends keyof CultureHeader>(field: K, value: CultureHeader[K]) => setHeader((h) => ({ ...h, [field]: value }));

  // Picking an organism loads its antibiotic panel (replacing the current list, as before).
  const chooseOrganism = async (organismId: number) => {
    setField('OrganismIsolatedId', organismId);
    setRows([]);
    if (!organismId) return;
    setLoadingPanel(true);
    try {
      const res = await apiFetch('lis/AntibioticMaster/GetAntibioticOrganismMaps', { Params: [{ Key: ORGANISM_FILTER, Value: organismId }], PageContext: PAGE });
      setRows(
        ((res?.Data || []) as any[])
          .filter((m) => Number(m.OrganismMapId) === organismId)
          .map((m) => ({ key: newKey(), Id: 0, Antibiotics: m.AntibioticMaster?.AntibioticName || '', ResultId: null, MCH: '' })),
      );
    } catch {
      /* toast already shown */
    } finally {
      setLoadingPanel(false);
    }
  };

  const patchRow = (key: string, patch: Partial<AntibioticRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const organismName = textOf(lookups.OrgIsolation, header.OrganismIsolatedId);

  const reportHtml = useMemo(
    () =>
      buildCultureReportHtml({
        specimenName: textOf(lookups.SampleMaster, header.SpecimenId),
        growth: header.ColonyCount,
        microNo: header.MicroNo,
        site: header.Blood,
        cultureReport: header.CultutreReport,
        organismIsolated: organismName,
        gramStainHtml: header.GramStain,
        remarksHtml: header.Remarks,
        antibiotics: rows.map((r) => ({ name: r.Antibiotics, result: textOf(lookups.CultureResult, r.ResultId), mic: r.MCH })),
      }),
    [header, rows, lookups, organismName],
  );

  const save = async () => {
    const base = {
      OrderedDate: header.OrderedDate,
      PatientId: ctx.patientId,
      EncounterId: ctx.encounterId,
      OrderId: ctx.orderId,
      WorkOrderId: ctx.workOrderId,
      SpecimenId: header.SpecimenId,
      OrganismIsolatedId: header.OrganismIsolatedId,
      GramStain: header.GramStain,
      Blood: header.Blood,
      MicroNo: header.MicroNo,
      CultutreReport: header.CultutreReport,
      Remarks: header.Remarks,
      ColonyCount: header.ColonyCount,
    };
    // Rows are only stored against an isolated organism (same rule as before). Built fresh on every
    // save, so saving twice no longer re-sends the earlier rows.
    const lines = Number(header.OrganismIsolatedId) > 0 ? rows.map((r) => ({ ...base, Id: r.Id || 0, Antibiotics: r.Antibiotics, ResultId: r.ResultId, MCH: r.MCH })) : [];
    setSaving(true);
    try {
      await apiFetch('lis/PatientWorkOrderAntibiotics/ManagePatientWorkOrderAntibiotics', { Data: lines });
      alert.showSuccessMsg(L('saved', 'Saved successfully'));
      onClose?.({ data: reportHtml });
    } catch {
      /* toast already shown */
    } finally {
      setSaving(false);
    }
  };

  const editOrganismMap = () => openLegacyModal?.('app.antibiotictab.organismmap', {}, () => setLookupVersion((v) => v + 1));

  const patientLine = patient
    ? [fullName(patient), patient.MRN, patient.Gender?.Description, patient.DOB ? formatAge(patient.DOB) : null].filter(Boolean).join(' | ')
    : undefined;

  const resultOptions = lookups.CultureResult.map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <PopupFrame
      title={L('title', 'Culture Report')}
      subtitle={patientLine}
      onClose={() => onCancel?.()}
      footer={
        <Button variant="primary" size="sm" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={loading}>
          {L('save', 'Save')}
        </Button>
      }
    >
      {loading ? (
        <SkeletonRows rows={8} columns={2} />
      ) : (
        <div style={{ display: 'grid', gap: spacing.lg, fontFamily: typography.fontFamily }}>
          <div style={{ display: 'grid', gap: spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <SearchSelect
              label={L('specimen', 'Specimen')}
              options={lookups.SampleMaster.map((o) => ({ value: o.Id, label: o.Text }))}
              value={header.SpecimenId ?? ''}
              placeholder="Search specimen"
              onChange={(v) => setField('SpecimenId', Number(v) || null)}
            />
            <Input label={L('site', 'Site')} value={header.Blood || ''} onChange={(e) => setField('Blood', e.target.value)} />
            <Input label={L('microNo', 'Micro No.')} value={header.MicroNo || ''} onChange={(e) => setField('MicroNo', e.target.value)} />
            <Input label={L('growth', 'Growth')} value={header.ColonyCount || ''} onChange={(e) => setField('ColonyCount', e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing.xs }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SearchSelect
                  label={L('organism', 'Organism Isolated')}
                  options={lookups.OrgIsolation.map((o) => ({ value: o.Id, label: o.Text }))}
                  value={header.OrganismIsolatedId ?? ''}
                  placeholder="Search organism"
                  onChange={(v) => chooseOrganism(Number(v) || 0)}
                />
              </div>
              {openLegacyModal && (
                <Button variant="outline-secondary" size="sm" icon="fa-solid fa-pen-to-square" aria-label={L('editOrganismMap', 'Edit organism map')} title={L('editOrganismMap', 'Edit organism map')} onClick={editOrganismMap} />
              )}
            </div>
            <Input label={L('cultureReport', 'Culture Report')} value={header.CultutreReport || ''} onChange={(e) => setField('CultutreReport', e.target.value)} />
          </div>

          <section style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, overflow: 'hidden' }}>
            <div style={{ padding: `${spacing.sm} ${spacing.md}`, background: colors.surfaceMuted, borderBottom: `1px solid ${colors.border}`, ...typography.label, color: colors.primary }}>
              {organismName || L('antibiotics', 'Antibiotics')}
            </div>
            {loadingPanel ? (
              <div style={{ padding: spacing.md }}>
                <SkeletonRows rows={5} columns={3} />
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: spacing.lg, color: colors.textMuted, ...typography.body }}>
                {header.OrganismIsolatedId ? L('noAntibiotics', 'No antibiotics are mapped to this organism.') : 'Choose the organism isolated to list its antibiotics.'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: colors.surfaceMuted, color: colors.textMuted, textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>{L('antibiotics', 'Antibiotics')}</th>
                    <th style={{ padding: '8px 12px', width: 220 }}>{L('results', 'Results')}</th>
                    <th style={{ padding: '8px 12px', width: 160 }}>{L('mic', 'MIC')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} style={{ borderTop: `1px solid ${colors.surfaceSunken}` }}>
                      <td style={{ padding: '6px 12px', fontWeight: 600 }}>{r.Antibiotics}</td>
                      <td style={{ padding: '6px 12px' }}>
                        <Select options={resultOptions} value={r.ResultId ?? ''} placeholder="—" onChange={(v) => patchRow(r.key, { ResultId: Number(v) || null })} />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <Input size="sm" value={r.MCH || ''} onChange={(e) => patchRow(r.key, { MCH: e.target.value })} aria-label={`${L('mic', 'MIC')} ${r.Antibiotics}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <div style={{ display: 'grid', gap: spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <section style={{ display: 'grid', gap: spacing.xs }}>
              <h4 style={{ ...typography.label, margin: 0 }}>{L('gramStain', 'Gram Stain')}</h4>
              <RichTextEditor richtext={header.GramStain || ''} onContentChange={(html) => setField('GramStain', html)} height={200} />
            </section>
            <section style={{ display: 'grid', gap: spacing.xs }}>
              <h4 style={{ ...typography.label, margin: 0 }}>{L('remarks', 'Remarks')}</h4>
              <RichTextEditor richtext={header.Remarks || ''} onContentChange={(html) => setField('Remarks', html)} height={200} />
            </section>
          </div>
        </div>
      )}
    </PopupFrame>
  );
};
