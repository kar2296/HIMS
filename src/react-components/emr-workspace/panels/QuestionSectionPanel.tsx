/**
 * CUSTOM EMR panel renderer (EMR panel type emr.cn.question) -- one component draws every
 * admin-built form: PACU, Fall Risk, SBAR, OBGYN, nutrition, treatment questionnaires…
 * It is the React counterpart of the legacy cn-question-section.js and uses the same data:
 *
 *   definition : clinicalmaster/SectionMaster/GetSectionMasterById      (SectionTypeId 2 — question section)
 *                clinicalmaster/category/GetCategoriesByType            (SectionTypeId 3/4/5 — HPI/ROS/PE, driven by
 *                                                                          the visit's chief complaints)
 *   answers    : emr/CategorySectionEntry/GetCategorySectionEntrys     (Key 2 = SectionId, Key 3 = ConsultationId)
 *   save       : emr/CategorySectionEntry/ManageCategorySectionEntries  { Data: { details: [...] } }
 *
 * Answer rows are keyed exactly like the legacy screen (CategoryKey + ConceptKey [+ TermKey]) and use the same
 * value columns per concept type, so the existing consultation print and review notes keep working.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { alert } from '../../utils/alert';
import { Button } from '../../Button';
import { RichTextEditor } from '../../RichTextEditor';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { SkeletonRows } from '../../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps } from '../types';
import { errorText } from '../emrHelpers';
import { FieldRow, InlineNotice, PanelSection } from '../EmrUi';
import { SearchPicker } from '../SearchPicker';

/* ───────────────────────── definition model ───────────────────────── */

interface Term {
  Id: number;
  Code: string;
  TermName: string;
  DisplayOrder?: number | string;
}

interface Concept {
  Id: number;
  ConceptName: string;
  ConceptIdentifier: string;
  ValueTypeId: number;
  ValueType?: { ReferenceValueCode?: string; Description?: string };
  IsMultiple?: boolean;
  IsMandatory?: boolean;
  Attributes?: string;
  DisplayOrder?: number | string;
  Terms?: Term[];
}

interface Category {
  Id: number;
  CategoryName: string;
  CategoryIdentifier: string;
  Concepts?: Concept[];
}

interface SectionDefinition {
  SectionCategoryMaps?: { DisplayOrder?: number | string; Category?: Category }[];
}

interface Entry {
  Id: number;
  CategoryKey: string;
  ConceptKey: string;
  TermKey?: string | null;
  TermName?: string;
  ResultValue?: string | number | boolean | null;
  ResultValueJSON?: string | null;
  ResultValueRichText?: string | null;
  Comments?: string | null;
}

/** Control kinds, derived from the ValueType reference code (same mapping as the legacy screen). */
type Kind = 'text' | 'number' | 'email' | 'date' | 'boolean' | 'checkbox' | 'single' | 'multi' | 'combo' | 'notes' | 'rich' | 'rating' | 'cpt' | 'icd';

const kindOf = (c: Concept): Kind => {
  const code = (c.ValueType?.ReferenceValueCode || '').toLowerCase();
  if (c.ValueTypeId === 3 || code.startsWith('termbased')) return c.IsMultiple ? 'multi' : 'single';
  if (c.ValueTypeId === 5 || code === 'boolean') return 'boolean';
  if (c.ValueTypeId === 8 || code === 'notes') return 'notes';
  if (c.ValueTypeId === 9 || code === 'cpt') return 'cpt';
  if (c.ValueTypeId === 10 || code === 'icd') return 'icd';
  if (c.ValueTypeId === 11 || code === 'rating') return 'rating';
  if (c.ValueTypeId === 12 || code === 'ckeditor') return 'rich';
  switch (code) {
    case 'numeric':
    case 'slider':
      return 'number';
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    case 'checkbox':
      return 'checkbox';
    case 'combo':
      return 'combo';
    default:
      return 'text';
  }
};

const byOrder = <T extends { DisplayOrder?: number | string }>(a: T, b: T) => Number(a.DisplayOrder ?? 0) - Number(b.DisplayOrder ?? 0);

const ratingAttrs = (c: Concept) => {
  try {
    const a = c.Attributes ? JSON.parse(c.Attributes) : {};
    return { min: Number(a.Min ?? 0), max: Number(a.Max ?? 10), step: Number(a.Step ?? 1) || 1 };
  } catch {
    return { min: 0, max: 10, step: 1 };
  }
};

/** One answer slot in the form state. */
interface Answer {
  value: string;
  json: any[];
  rich: string;
  comments: string;
  entryId?: number;
}

const emptyAnswer = (): Answer => ({ value: '', json: [], rich: '', comments: '' });
const conceptKey = (cat: Category, c: Concept) => `${cat.CategoryIdentifier}.${c.ConceptIdentifier}`;
const termKey = (cat: Category, c: Concept, t: Term) => `${conceptKey(cat, c)}.${t.Code}`;
const truthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

const brToNewline = (html?: string | null) => (html ? html.replace(/<br\s*\/?>/gi, '\n') : '');
const newlineToBr = (text: string) => text.replace(/\r?\n/g, '<br />');

/** Normalises section categories from either definition source. */
const categoriesOf = (def: SectionDefinition | Category[] | null): Category[] => {
  const list: Category[] = Array.isArray(def)
    ? def
    : (def?.SectionCategoryMaps || [])
        .slice()
        .sort(byOrder)
        .map((m) => m.Category)
        .filter((c): c is Category => Boolean(c));
  return list
    .filter((cat) => cat.Concepts && cat.Concepts.length > 0)
    .map((cat) => ({
      ...cat,
      Concepts: (cat.Concepts || []).slice().sort(byOrder).map((c) => ({ ...c, Terms: (c.Terms || []).slice().sort(byOrder) })),
    }));
};

const SECTION_TYPE_CATEGORY: Record<number, string> = { 3: 'HPI', 4: 'ROS', 5: 'PE' };

/* ───────────────────────── component ───────────────────────── */

export const QuestionSectionPanel: React.FC<EmrPanelProps> = (props) => {
  const { context, canEdit, section, registerSaveHandler, onDataChanged, fallbackPanels, navigateTo } = props;
  const sectionId = section?.Id;
  const sectionTypeId = section?.SectionTypeId ?? 2;
  const consultationId = context.consultationId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [reloadKey, setReloadKey] = useState(0);

  // Definition first, then answers (answers are keyed by the definition's identifiers).
  useEffect(() => {
    if (!sectionId || !consultationId) return;
    let active = true;
    (async () => {
      try {
        let defs: Category[];
        if (SECTION_TYPE_CATEGORY[sectionTypeId]) {
          const res = await apiFetch('clinicalmaster/category/GetCategoriesByType', {
            Data: { consultationid: consultationId, categorytype: SECTION_TYPE_CATEGORY[sectionTypeId] },
          });
          defs = categoriesOf(Array.isArray(res) ? res : res?.Data || []);
        } else {
          defs = categoriesOf(await apiFetch('clinicalmaster/SectionMaster/GetSectionMasterById', { Id: sectionId }));
        }
        const saved = await apiFetch('emr/CategorySectionEntry/GetCategorySectionEntrys', {
          Params: [
            { Key: 2, Value: sectionId },
            { Key: 3, Value: consultationId },
          ],
          PageContext: { PageSize: 500, PageNumber: 1 },
        });
        if (!active) return;
        setCategories(defs);
        setAnswers(buildAnswers(defs, saved?.Data || []));
        setMissing([]);
        setLoadError(null);
      } catch (err: any) {
        if (!active) return;
        const code = err?.Error?.Code || err?.code || err?.Error?.Message;
        setLoadError(
          String(code || '').includes('NO_PAIENT_CC')
            ? 'Add the patient’s chief complaint first — this panel’s questions are chosen from the chief complaints.'
            : errorText(err, 'Could not load this panel.'),
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sectionId, sectionTypeId, consultationId, reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const setAnswer = (key: string, patch: Partial<Answer>) => {
    setAnswers((prev) => ({ ...prev, [key]: { ...(prev[key] || emptyAnswer()), ...patch } }));
    setMissing((prev) => (prev.length ? prev.filter((k) => k !== key) : prev));
  };

  /* ───────────── save ───────────── */

  const save = useCallback(async (): Promise<boolean> => {
    if (!canEdit || !sectionId || !consultationId) {
      alert.showErrorMsg('Start a visit entry before filling this panel.');
      return false;
    }
    // Mandatory concepts
    const req: string[] = [];
    categories.forEach((cat) =>
      (cat.Concepts || []).forEach((c) => {
        if (!c.IsMandatory) return;
        const kind = kindOf(c);
        if (kind === 'multi') {
          if (!(c.Terms || []).some((t) => truthy(answers[termKey(cat, c, t)]?.value))) req.push(conceptKey(cat, c));
          return;
        }
        const a = answers[conceptKey(cat, c)] || emptyAnswer();
        const empty = kind === 'cpt' || kind === 'icd' ? a.json.length === 0 : kind === 'notes' || kind === 'rich' ? !a.rich.replace(/<[^>]*>/g, '').trim() : a.value === '';
        if (empty) req.push(conceptKey(cat, c));
      }),
    );
    setMissing(req);
    if (req.length) {
      alert.showErrorMsg('Please answer the mandatory questions (marked *).');
      return false;
    }

    const base = { EncounterId: context.encounterId, ConsultationId: consultationId, PatientId: context.patientId, SectionId: sectionId };
    const details: any[] = [];
    categories.forEach((cat) =>
      (cat.Concepts || []).forEach((c) => {
        const kind = kindOf(c);
        const keys = { CategoryKey: cat.CategoryIdentifier, ConceptKey: c.ConceptIdentifier };
        if (kind === 'multi') {
          (c.Terms || []).forEach((t) => {
            const a = answers[termKey(cat, c, t)] || emptyAnswer();
            details.push({ ...base, ...keys, Id: a.entryId || 0, ResultValue: truthy(a.value) ? 1 : 0, TermKey: t.Code, TermName: t.TermName, Comments: a.comments || undefined });
          });
          return;
        }
        const a = answers[conceptKey(cat, c)] || emptyAnswer();
        const row: any = { ...base, ...keys, Id: a.entryId || 0, Comments: a.comments || undefined };
        if (kind === 'cpt' || kind === 'icd') row.ResultValueJSON = JSON.stringify(a.json);
        else if (kind === 'rich') row.ResultValueRichText = a.rich;
        else if (kind === 'notes') row.ResultValueRichText = newlineToBr(a.rich);
        else if (kind === 'rating') row.ResultValue = a.value === '' ? '' : `${a.value}/${ratingAttrs(c).max}`;
        else if (kind === 'boolean') row.ResultValue = a.value === '' ? '' : Number(a.value);
        else if (kind === 'checkbox') row.ResultValue = truthy(a.value);
        else if (kind === 'date') row.ResultValue = a.value ? new Date(a.value) : '';
        else row.ResultValue = a.value;
        details.push(row);
      }),
    );

    setSaving(true);
    try {
      await apiFetch('emr/CategorySectionEntry/ManageCategorySectionEntries', { Data: { details } });
      alert.showSuccessMsg(`${section?.Name || 'Panel'} saved`);
      reload();
      onDataChanged?.(`section-${sectionId}`);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [canEdit, sectionId, consultationId, categories, answers, context.encounterId, context.patientId, section, reload, onDataChanged]);

  // No questions configured: the fallback panel (if any) owns the toolbar Save; otherwise there is nothing to save.
  const noQuestions = !loading && !loadError && categories.length === 0;
  useEffect(() => {
    if (noQuestions) return;
    registerSaveHandler?.(save);
    return () => registerSaveHandler?.(null);
  }, [registerSaveHandler, save, noQuestions]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.value !== '' && a.value !== 'false' && a.value !== '0' ? true : a.json.length > 0 || a.rich.trim() !== '').length,
    [answers],
  );

  /* ───────────── render ───────────── */

  if (!consultationId) {
    return <InlineNotice tone="info">Start a visit entry (toolbar above) to fill in this panel.</InlineNotice>;
  }
  if (loading) {
    return (
      <PanelSection title={section?.Name || 'Loading…'} icon="fa-solid fa-clipboard-list">
        <SkeletonRows rows={6} columns={2} />
      </PanelSection>
    );
  }
  if (loadError) {
    return (
      <InlineNotice tone={loadError.startsWith('Add the patient') ? 'warning' : 'danger'}>
        {loadError}{' '}
        <Button size="xs" variant="link" onClick={reload}>
          Try again
        </Button>
      </InlineNotice>
    );
  }
  if (categories.length === 0) {
    const panelName = section?.Name || 'This panel';
    if (fallbackPanels && fallbackPanels.length > 0) {
      const labels = fallbackPanels.map((f) => f.label).join(' and ');
      return (
        <div style={{ display: 'grid', gap: spacing.lg }}>
          <InlineNotice tone="info">
            “{panelName}” has no custom questions yet, so the standard {labels} {fallbackPanels.length > 1 ? 'panels are' : 'panel is'} shown.
            {navigateTo && (
              <>
                {' '}
                <Button size="xs" variant="link" onClick={() => navigateTo('app.emrpaneleditor')}>
                  Add questions in EMR Panel Editor
                </Button>
              </>
            )}
          </InlineNotice>
          {fallbackPanels.map((f, i) => {
            const Fallback = f.component;
            // Only the first panel may own the toolbar "Save" (one handler at a time).
            return <Fallback key={f.label} {...props} fallbackPanels={undefined} registerSaveHandler={i === 0 ? registerSaveHandler : undefined} />;
          })}
        </div>
      );
    }
    return (
      <PanelSection title={panelName} icon="fa-solid fa-clipboard-list">
        <div style={{ textAlign: 'center', padding: `${spacing.xl} ${spacing.lg}`, display: 'grid', gap: spacing.sm, justifyItems: 'center' }}>
          <i className="fa-solid fa-list-check" style={{ fontSize: 28, color: colors.textSubtle }} aria-hidden="true" />
          <div style={{ ...typography.body, fontWeight: 600, color: colors.textMain }}>No questions are set up for “{panelName}” yet</div>
          <div style={{ ...typography.caption, color: colors.textMuted, maxWidth: 460 }}>
            Add the questions, check-lists or note fields this panel should collect in EMR Panel Editor. They will appear here for every visit entry that uses this EMR form.
          </div>
          {navigateTo && (
            <Button size="sm" variant="outline-primary" icon="fa-solid fa-pen-to-square" onClick={() => navigateTo('app.emrpaneleditor')}>
              Set up this panel
            </Button>
          )}
        </div>
      </PanelSection>
    );
  }

  const disabled = !canEdit;

  const renderConcept = (cat: Category, c: Concept) => {
    const kind = kindOf(c);
    const key = conceptKey(cat, c);
    const a = answers[key] || emptyAnswer();
    const inputId = `emrws-q-${sectionId}-${c.Id}`;

    switch (kind) {
      case 'boolean':
        return (
          <div role="radiogroup" aria-label={c.ConceptName} style={{ display: 'inline-flex', gap: 6 }}>
            {[
              { v: '1', l: 'Yes' },
              { v: '0', l: 'No' },
            ].map((o) => (
              <TermButton key={o.v} selected={a.value === o.v} disabled={disabled} onClick={() => setAnswer(key, { value: a.value === o.v ? '' : o.v })} role="radio">
                {o.l}
              </TermButton>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={truthy(a.value)} disabled={disabled} onChange={(e) => setAnswer(key, { value: e.target.checked ? 'true' : 'false' })} style={{ width: 16, height: 16 }} />
            <span style={{ ...typography.body, color: colors.textMuted }}>Yes</span>
          </label>
        );
      case 'single':
        return (
          <div style={{ display: 'grid', gap: 6, width: '100%' }}>
            <div role="radiogroup" aria-label={c.ConceptName} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(c.Terms || []).map((t) => (
                <TermButton key={t.Code} role="radio" selected={a.value === t.Code} disabled={disabled} onClick={() => setAnswer(key, { value: a.value === t.Code ? '' : t.Code })}>
                  {t.TermName}
                </TermButton>
              ))}
              <CommentToggle open={Boolean(openComments[key]) || Boolean(a.comments)} onToggle={() => setOpenComments((p) => ({ ...p, [key]: !p[key] }))} />
            </div>
            {(openComments[key] || a.comments) && <Input size="sm" placeholder="Comment" value={a.comments} disabled={disabled} onChange={(e) => setAnswer(key, { comments: e.target.value })} aria-label={`${c.ConceptName} comment`} />}
          </div>
        );
      case 'multi':
        return (
          <div role="group" aria-label={c.ConceptName} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(c.Terms || []).map((t) => {
              const tk = termKey(cat, c, t);
              const ta = answers[tk] || emptyAnswer();
              return (
                <TermButton key={t.Code} role="checkbox" selected={truthy(ta.value)} disabled={disabled} onClick={() => setAnswer(tk, { value: truthy(ta.value) ? '0' : '1' })}>
                  {t.TermName}
                </TermButton>
              );
            })}
          </div>
        );
      case 'combo':
        return (
          <div style={{ width: 280 }}>
            <Select id={inputId} options={(c.Terms || []).map((t) => ({ value: t.Code, label: t.TermName }))} value={a.value} placeholder="Select" disabled={disabled} onChange={(v) => setAnswer(key, { value: String(v) })} />
          </div>
        );
      case 'notes':
        return <Textarea id={inputId} rows={3} value={a.rich} disabled={disabled} onChange={(e) => setAnswer(key, { rich: e.target.value })} aria-label={c.ConceptName} />;
      case 'rich':
        return (
          <div style={{ width: '100%' }}>
            <RichTextEditor richtext={a.rich} onContentChange={(html) => setAnswer(key, { rich: html })} readonly={disabled} height={200} placeholder={c.ConceptName} />
          </div>
        );
      case 'rating': {
        const { min, max, step } = ratingAttrs(c);
        const current = a.value === '' ? min : Number(a.value);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, width: 'min(420px, 100%)' }}>
            <input type="range" min={min} max={max} step={step} value={current} disabled={disabled} onChange={(e) => setAnswer(key, { value: e.target.value })} aria-label={c.ConceptName} style={{ flex: 1 }} />
            <span style={{ ...typography.body, fontWeight: 600, minWidth: 56 }}>{a.value === '' ? '—' : `${a.value} / ${max}`}</span>
          </div>
        );
      }
      case 'cpt':
      case 'icd': {
        const isIcd = kind === 'icd';
        return (
          <div style={{ display: 'grid', gap: 6, width: '100%' }}>
            <div style={{ maxWidth: 480 }}>
              <SearchPicker<any>
                id={inputId}
                placeholder={isIcd ? 'Search ICD code or diagnosis' : 'Search CPT code or procedure'}
                action={isIcd ? 'clinicalmaster/diagnosis/GetDiagnosiss' : 'clinicalmaster/procedure/GetProcedures'}
                buildRequest={(q) => ({ Params: [{ Key: 3, Value: q }], PageContext: { PageSize: 25, PageNumber: 1 } })}
                codeOf={(x) => x.Code}
                labelOf={(x) => (isIcd ? x.DiagnosisName : x.ProcedureName)}
                keyOf={(x) => x.Id}
                disabled={disabled}
                onPick={(x) => {
                  const idKey = isIcd ? 'DiagnosisId' : 'ProcedureId';
                  if (a.json.some((j) => j[idKey] === x.Id)) return;
                  const item = isIcd ? { DiagnosisId: x.Id, DiagnosisName: x.DiagnosisName, Code: x.Code } : { ProcedureId: x.Id, ProcedureName: x.ProcedureName, Code: x.Code };
                  setAnswer(key, { json: [...a.json, item] });
                }}
              />
            </div>
            {a.json.length > 0 && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {a.json.map((j) => {
                  const idKey = isIcd ? 'DiagnosisId' : 'ProcedureId';
                  return (
                    <li key={j[idKey]} className="emrws-chip">
                      {j.Code && <strong>{j.Code}</strong>} {isIcd ? j.DiagnosisName : j.ProcedureName}
                      {!disabled && (
                        <button type="button" aria-label="Remove" onClick={() => setAnswer(key, { json: a.json.filter((x) => x[idKey] !== j[idKey]) })}>
                          <i className="fa-solid fa-xmark" aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      }
      case 'date':
        return (
          <div style={{ width: 200 }}>
            <Input id={inputId} size="sm" type="date" value={a.value} disabled={disabled} onChange={(e) => setAnswer(key, { value: e.target.value })} aria-label={c.ConceptName} />
          </div>
        );
      default:
        return (
          <div style={{ width: kind === 'text' ? 'min(420px, 100%)' : 200 }}>
            <Input
              id={inputId}
              size="sm"
              type={kind === 'email' ? 'email' : 'text'}
              inputMode={kind === 'number' ? 'decimal' : undefined}
              value={a.value}
              disabled={disabled}
              onChange={(e) => setAnswer(key, { value: e.target.value })}
              aria-label={c.ConceptName}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
        <span style={{ ...typography.caption, color: colors.textSubtle }}>
          {answeredCount} answered · questions marked <span style={{ color: colors.danger }}>*</span> are required
        </span>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={reload} disabled={saving}>
            Reload
          </Button>
          <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={disabled}>
            Save {section?.Name || ''}
          </Button>
        </div>
      </div>
      {categories.map((cat) => (
        <PanelSection key={cat.Id} title={cat.CategoryName} icon="fa-solid fa-clipboard-list" allowOverflow>
          <div style={{ display: 'grid', gap: 2 }}>
            {(cat.Concepts || []).map((c) => {
              const key = conceptKey(cat, c);
              const isMissing = missing.includes(key);
              return (
                <FieldRow
                  key={c.Id}
                  label={
                    <span style={{ color: isMissing ? colors.danger : undefined }}>
                      {c.ConceptName}
                      {c.IsMandatory && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
                    </span>
                  }
                  hint={isMissing ? <span style={{ color: colors.danger }}>Required</span> : undefined}
                >
                  {renderConcept(cat, c)}
                </FieldRow>
              );
            })}
          </div>
        </PanelSection>
      ))}
    </div>
  );
};

/* ───────────────────────── helpers ───────────────────────── */

function buildAnswers(categories: Category[], saved: Entry[]): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  const byKey = new Map<string, Entry>();
  saved.forEach((e) => byKey.set(e.TermKey ? `${e.CategoryKey}.${e.ConceptKey}.${e.TermKey}` : `${e.CategoryKey}.${e.ConceptKey}`, e));

  categories.forEach((cat) =>
    (cat.Concepts || []).forEach((c) => {
      const kind = kindOf(c);
      if (kind === 'multi') {
        (c.Terms || []).forEach((t) => {
          const k = termKey(cat, c, t);
          const e = byKey.get(k);
          out[k] = { ...emptyAnswer(), entryId: e?.Id, value: e && truthy(e.ResultValue) ? '1' : '0', comments: e?.Comments || '' };
        });
        return;
      }
      const k = conceptKey(cat, c);
      const e = byKey.get(k);
      const a: Answer = { ...emptyAnswer(), entryId: e?.Id, comments: e?.Comments || '' };
      if (e) {
        if (kind === 'cpt' || kind === 'icd') {
          try {
            a.json = e.ResultValueJSON ? JSON.parse(e.ResultValueJSON) || [] : [];
          } catch {
            a.json = [];
          }
        } else if (kind === 'rich') a.rich = e.ResultValueRichText || '';
        else if (kind === 'notes') a.rich = brToNewline(e.ResultValueRichText);
        else if (kind === 'rating') a.value = String(e.ResultValue ?? '').split('/')[0] || '';
        else if (kind === 'boolean') a.value = e.ResultValue === null || e.ResultValue === undefined || e.ResultValue === '' ? '' : truthy(e.ResultValue) ? '1' : '0';
        else if (kind === 'checkbox') a.value = truthy(e.ResultValue) ? 'true' : 'false';
        else if (kind === 'date') {
          const d = e.ResultValue ? new Date(String(e.ResultValue)) : null;
          a.value = d && !Number.isNaN(d.getTime()) ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
        } else a.value = e.ResultValue === null || e.ResultValue === undefined ? '' : String(e.ResultValue);
      }
      out[k] = a;
    }),
  );
  return out;
}

const TermButton: React.FC<{ selected: boolean; disabled?: boolean; onClick: () => void; role: 'radio' | 'checkbox'; children: React.ReactNode }> = ({ selected, disabled, onClick, role, children }) => (
  <button
    type="button"
    role={role}
    aria-checked={selected}
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: '5px 12px',
      borderRadius: radii.full,
      border: `1px solid ${selected ? colors.primary : colors.border}`,
      background: selected ? colors.primary : colors.surface,
      color: selected ? '#fff' : colors.textBody,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled && !selected ? 0.6 : 1,
      ...typography.label,
    }}
  >
    {children}
  </button>
);

const CommentToggle: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={open}
    title="Add a comment"
    style={{ border: 'none', background: 'transparent', color: open ? colors.primary : colors.textSubtle, cursor: 'pointer', padding: '4px 6px' }}
  >
    <i className="fa-regular fa-comment" aria-hidden="true" />
    <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
      Comment
    </span>
  </button>
);
