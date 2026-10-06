/**
 * Element builder for CUSTOM panels: edits one question group (Category) and its questions (Concepts)
 * with answer options (Terms). Saved in one call, exactly like the classic "Template Parameters" page:
 *   clinicalmaster/Category/GetCategoryById | AddCategory | UpdateCategory  { Data: { ...category, Concepts: [..., Terms: [...]] } }
 * Removed questions/options are sent with Status 2 so the server soft-deletes them.
 */
import React, { useCallback, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, spacing, typography } from '../../components/ui/tokens';
import { PanelSection, InlineNotice } from '../emr-workspace/EmrUi';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import type { LookupItem } from '../emr-workspace/types';

interface TermDraft {
  Id: number;
  TermName: string;
  Code?: string;
  Status?: number;
}

interface ConceptDraft {
  Id: number;
  key: string;
  ConceptName: string;
  ValueTypeId: number | '';
  IsMandatory: boolean;
  IsMultiple: boolean;
  Attributes?: string;
  ConceptIdentifier?: string;
  Terms: TermDraft[];
  Status?: number;
  min?: string;
  max?: string;
  step?: string;
}

interface CategoryDraft {
  Id: number;
  CategoryName: string;
  CategoryTypeId: number | '';
  CategoryIdentifier?: string;
  IsActive: boolean;
  Concepts: ConceptDraft[];
}

interface ElementBuilderProps {
  categoryId: number;
  valueTypes: LookupItem[];
  categoryTypes: LookupItem[];
  onSaved: (categoryId: number, name: string) => void;
  onClose: () => void;
}

let keySeq = 0;
const newKey = () => `c${++keySeq}`;

const isTermBased = (vt?: LookupItem) => {
  if (!vt) return false;
  const code = String(vt.ReferenceValueCode || '').toLowerCase();
  return vt.Id === 3 || code.startsWith('termbased') || code === 'combo';
};
const isRating = (vt?: LookupItem) => Boolean(vt && (vt.Id === 11 || String(vt.ReferenceValueCode || '').toLowerCase() === 'rating'));

// Concept attributes are stored as a JSON string; a malformed value falls back to defaults.
const parseAttributes = (raw: unknown): Record<string, any> => {
  if (typeof raw !== 'string' || !raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const fromServer = (c: any): CategoryDraft => ({
  Id: c.Id,
  CategoryName: c.CategoryName || '',
  CategoryTypeId: c.CategoryTypeId || '',
  CategoryIdentifier: c.CategoryIdentifier,
  IsActive: c.IsActive !== false,
  Concepts: (c.Concepts || [])
    .slice()
    .sort((a: any, b: any) => Number(a.DisplayOrder || 0) - Number(b.DisplayOrder || 0))
    .map((x: any) => {
      const attr = parseAttributes(x.Attributes);
      return {
        Id: x.Id,
        key: newKey(),
        ConceptName: x.ConceptName || '',
        ValueTypeId: x.ValueTypeId || '',
        IsMandatory: Boolean(x.IsMandatory),
        IsMultiple: Boolean(x.IsMultiple),
        Attributes: x.Attributes,
        ConceptIdentifier: x.ConceptIdentifier,
        Terms: (x.Terms || []).slice().sort((a: any, b: any) => Number(a.DisplayOrder || 0) - Number(b.DisplayOrder || 0)).map((t: any) => ({ Id: t.Id, TermName: t.TermName, Code: t.Code })),
        min: attr.Min !== undefined ? String(attr.Min) : '0',
        max: attr.Max !== undefined ? String(attr.Max) : '10',
        step: attr.Step !== undefined ? String(attr.Step) : '1',
      };
    }),
});

const emptyCategory = (): CategoryDraft => ({ Id: 0, CategoryName: '', CategoryTypeId: '', IsActive: true, Concepts: [] });

export const ElementBuilder: React.FC<ElementBuilderProps> = ({ categoryId, valueTypes, categoryTypes, onSaved, onClose }) => {
  const [draft, setDraft] = useState<CategoryDraft>(emptyCategory());
  const [removed, setRemoved] = useState<ConceptDraft[]>([]);
  const [removedTerms, setRemovedTerms] = useState<Record<string, TermDraft[]>>({});
  const [termInput, setTermInput] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetcher = useCallback(async () => (categoryId ? fromServer(await apiFetch('clinicalmaster/Category/GetCategoryById', { Id: categoryId })) : emptyCategory()), [categoryId]);
  const query = useAsyncData<CategoryDraft>(fetcher, emptyCategory(), {
    errorMessage: 'Could not load the question group.',
    onSuccess: (d) => {
      setDraft(d);
      setRemoved([]);
      setRemovedTerms({});
    },
  });

  const vtOf = (c: ConceptDraft) => valueTypes.find((v) => v.Id === c.ValueTypeId);
  const patchConcept = (key: string, p: Partial<ConceptDraft>) => setDraft((d) => ({ ...d, Concepts: d.Concepts.map((c) => (c.key === key ? { ...c, ...p } : c)) }));

  const addConcept = () =>
    setDraft((d) => ({ ...d, Concepts: [...d.Concepts, { Id: 0, key: newKey(), ConceptName: '', ValueTypeId: '', IsMandatory: false, IsMultiple: false, Terms: [], min: '0', max: '10', step: '1' }] }));

  const removeConcept = (c: ConceptDraft) => {
    if (c.Id) setRemoved((r) => [...r, c]);
    setDraft((d) => ({ ...d, Concepts: d.Concepts.filter((x) => x.key !== c.key) }));
  };

  const moveConcept = (index: number, delta: number) =>
    setDraft((d) => {
      const t = index + delta;
      if (t < 0 || t >= d.Concepts.length) return d;
      const next = d.Concepts.slice();
      [next[index], next[t]] = [next[t], next[index]];
      return { ...d, Concepts: next };
    });

  const addTerm = (c: ConceptDraft) => {
    const text = (termInput[c.key] || '').trim();
    if (!text) return;
    if (c.Terms.some((t) => t.TermName.toLowerCase() === text.toLowerCase())) {
      alert.showInfoMsg('That option already exists.');
      return;
    }
    patchConcept(c.key, { Terms: [...c.Terms, { Id: 0, TermName: text }] });
    setTermInput((s) => ({ ...s, [c.key]: '' }));
  };

  const removeTerm = (c: ConceptDraft, t: TermDraft) => {
    if (t.Id) setRemovedTerms((r) => ({ ...r, [c.key]: [...(r[c.key] || []), t] }));
    patchConcept(c.key, { Terms: c.Terms.filter((x) => x !== t) });
  };

  const validate = (): string | null => {
    if (!draft.CategoryName.trim()) return 'Enter the question group name.';
    if (draft.Concepts.length === 0) return 'Add at least one question.';
    for (const c of draft.Concepts) {
      if (!c.ConceptName.trim()) return 'Every question needs a label.';
      if (!c.ValueTypeId) return `Choose an answer type for “${c.ConceptName}”.`;
      if (isTermBased(vtOf(c)) && c.Terms.length === 0) return `Add answer options for “${c.ConceptName}”.`;
      if (isRating(vtOf(c)) && !(Number(c.max) > Number(c.min))) return `Rating “${c.ConceptName}”: max must be greater than min.`;
    }
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) {
      alert.showErrorMsg(problem);
      return;
    }
    const concepts = [
      ...draft.Concepts.map((c, i) => ({
        Id: c.Id,
        CategoryId: draft.Id || undefined,
        ConceptName: c.ConceptName.trim(),
        ConceptIdentifier: c.ConceptIdentifier,
        ValueTypeId: c.ValueTypeId,
        IsMandatory: c.IsMandatory,
        IsMultiple: isTermBased(vtOf(c)) ? c.IsMultiple : false,
        Attributes: isRating(vtOf(c)) ? JSON.stringify({ Min: Number(c.min), Max: Number(c.max), Step: Number(c.step) || 1 }) : c.Attributes,
        DisplayOrder: i,
        ActiveStatus: 'Active',
        Status: 1,
        Terms: [
          ...c.Terms.map((t, j) => ({ Id: t.Id, TermName: t.TermName, Code: t.Code || t.TermName, DisplayOrder: j, Status: 1 })),
          ...(removedTerms[c.key] || []).map((t) => ({ Id: t.Id, TermName: t.TermName, Code: t.Code || t.TermName, Status: 2 })),
        ],
      })),
      ...removed.map((c) => ({ Id: c.Id, ConceptName: c.ConceptName, ConceptIdentifier: c.ConceptIdentifier, ValueTypeId: c.ValueTypeId, Status: 2, Terms: [] })),
    ];
    const data = {
      Id: draft.Id || undefined,
      CategoryName: draft.CategoryName.trim(),
      CategoryTypeId: draft.CategoryTypeId || undefined,
      CategoryIdentifier: draft.CategoryIdentifier,
      IsActive: draft.IsActive,
      ActiveStatus: 'Active',
      Concepts: concepts,
    };
    setSaving(true);
    try {
      const res = await apiFetch(draft.Id ? 'clinicalmaster/Category/UpdateCategory' : 'clinicalmaster/Category/AddCategory', { Data: data });
      const id = draft.Id || (typeof res === 'number' ? res : 0);
      alert.showSuccessMsg('Questions saved');
      onSaved(id, data.CategoryName);
      if (draft.Id) query.reload();
    } catch {
      /* toasted */
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelSection
      title={draft.Id ? `Questions: ${draft.CategoryName}` : 'New question group'}
      icon="fa-solid fa-list-ol"
      actions={
        <>
          <Button size="sm" variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…">
            Save questions
          </Button>
        </>
      }
    >
      {query.loading ? (
        <SkeletonRows rows={5} columns={3} />
      ) : query.error ? (
        <InlineNotice tone="danger">{query.error}</InlineNotice>
      ) : (
        <div style={{ display: 'grid', gap: spacing.md }}>
          <div className="emrws-grid-2">
            <Input label="Question group name" required value={draft.CategoryName} onChange={(e) => setDraft((d) => ({ ...d, CategoryName: e.target.value }))} placeholder="e.g. Fall risk factors" />
            <Select label="Group type" options={categoryTypes.map((t) => ({ value: t.Id, label: t.Text }))} value={draft.CategoryTypeId} placeholder="General" onChange={(v) => setDraft((d) => ({ ...d, CategoryTypeId: Number(v) }))} />
          </div>

          {draft.Concepts.length === 0 && <InlineNotice tone="info">No questions yet — add the first one.</InlineNotice>}

          <ol className="emrws-placed">
            {draft.Concepts.map((c, i) => {
              const vt = vtOf(c);
              return (
                <li key={c.key}>
                  <div className="emrws-placed-head">
                    <span style={{ ...typography.caption, color: colors.textSubtle, width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Input size="sm" placeholder="Question label" value={c.ConceptName} onChange={(e) => patchConcept(c.key, { ConceptName: e.target.value })} aria-label={`Question ${i + 1} label`} />
                    </div>
                    <div style={{ width: 190 }}>
                      <Select options={valueTypes.map((v) => ({ value: v.Id, label: v.Text }))} value={c.ValueTypeId} placeholder="Answer type" onChange={(v) => patchConcept(c.key, { ValueTypeId: Number(v) })} />
                    </div>
                    <Button size="xs" variant="icon" icon="fa-solid fa-arrow-up" aria-label="Move up" disabled={i === 0} onClick={() => moveConcept(i, -1)} />
                    <Button size="xs" variant="icon" icon="fa-solid fa-arrow-down" aria-label="Move down" disabled={i === draft.Concepts.length - 1} onClick={() => moveConcept(i, 1)} />
                    <Button size="xs" variant="icon" icon="fa-solid fa-trash" aria-label="Remove question" onClick={() => removeConcept(c)} />
                  </div>
                  <div className="emrws-placed-body" style={{ flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.caption }}>
                      <input type="checkbox" checked={c.IsMandatory} onChange={(e) => patchConcept(c.key, { IsMandatory: e.target.checked })} /> Mandatory
                    </label>
                    {isTermBased(vt) && (
                      <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.caption }}>
                        <input type="checkbox" checked={c.IsMultiple} onChange={(e) => patchConcept(c.key, { IsMultiple: e.target.checked })} /> Allow several answers
                      </label>
                    )}
                    {isRating(vt) && (
                      <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
                        {(['min', 'max', 'step'] as const).map((k) => (
                          <div key={k} style={{ width: 80 }}>
                            <Input size="sm" type="number" value={c[k] || ''} onChange={(e) => patchConcept(c.key, { [k]: e.target.value })} aria-label={`Rating ${k}`} placeholder={k} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isTermBased(vt) && (
                    <div className="emrws-placed-body" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                      {c.Terms.map((t) => (
                        <span key={`${t.Id}-${t.TermName}`} className="emrws-chip">
                          {t.TermName}
                          <button type="button" aria-label={`Remove option ${t.TermName}`} onClick={() => removeTerm(c, t)}>
                            <i className="fa-solid fa-xmark" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                      <div style={{ width: 200 }}>
                        <Input
                          size="sm"
                          placeholder="Add option + Enter"
                          value={termInput[c.key] || ''}
                          onChange={(e) => setTermInput((s) => ({ ...s, [c.key]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTerm(c);
                            }
                          }}
                          aria-label="New answer option"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <div>
            <Button size="sm" variant="outline-primary" icon="fa-solid fa-plus" onClick={addConcept}>
              Add question
            </Button>
          </div>
        </div>
      )}
    </PanelSection>
  );
};
