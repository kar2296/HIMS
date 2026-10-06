/**
 * EDIT EMR PANEL -- the panel library (SectionMaster) and, for CUSTOM panels, which question groups they show.
 * Same data the classic "Template Tabs" and "Template Parameters" pages edit:
 *
 *   panels     : clinicalmaster/SectionMaster/GetSectionMasters | GetSectionMasterById | AddSectionMaster | UpdateSectionMaster
 *   groups     : clinicalmaster/SectionMaster/GetCategories (Key 0 = SectionId) | MapCategories { Data: { map, sectionid } }
 *   group list : clinicalmaster/Category/GetCategorysWithoutConcept (Key 3 = active 2)
 *   questions  : ElementBuilder (Category / Concept / Term)
 *
 * Panel types: STANDARD panels pick a built-in React panel (SRef, see emr-workspace/panelRegistry.ts);
 * CUSTOM panels (section type Question / HPI / ROS / PE) render their question groups with QuestionSectionPanel.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SkeletonRows } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, typography } from '../../components/ui/tokens';
import { EmrWorkspaceStyles } from '../emr-workspace/EmrWorkspaceStyles';
import { InlineNotice, PanelSection } from '../emr-workspace/EmrUi';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import { cleanLookup } from '../emr-workspace/emrHelpers';
import { PANEL_TYPES, QUESTION_SREF, QUESTION_SECTION_TYPES, isQuestionSection, panelTypeLabel } from '../emr-workspace/panelRegistry';
import type { LookupItem, SectionMasterInfo } from '../emr-workspace/types';
import { ElementBuilder } from './ElementBuilder';

interface Props {
  navigateTo?: (state: string, params?: Record<string, any>) => void;
}

interface PanelDraft {
  Id: number;
  Name: string;
  SectionTypeId: number | '';
  SRef: string;
  DockPositionId: number | '';
  SectionNoteTypeId: string;
  Description?: string;
  [key: string]: any;
}

interface GroupRef {
  Id: number;
  Name: string;
}

const emptyPanel = (): PanelDraft => ({ Id: 0, Name: '', SectionTypeId: 2, SRef: QUESTION_SREF, DockPositionId: 2, SectionNoteTypeId: '' });

export const EmrPanelEditorScreen: React.FC<Props> = ({ navigateTo }) => {
  const [selectedId, setSelectedId] = useState(0);
  const [panel, setPanel] = useState<PanelDraft>(emptyPanel());
  const [groups, setGroups] = useState<GroupRef[]>([]);
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [builderFor, setBuilderFor] = useState<number | null>(null);

  const mastersFetcher = useCallback(async () => {
    const [lookups, panels, categories] = await Promise.all([
      apiFetch('General/Options/getoptions', [{ Key: 'SectionType' }, { Key: 'DockPosition' }, { Key: 'SectionNoteType' }, { Key: 'ValueType' }, { Key: 'CategoryType' }]),
      apiFetch('clinicalmaster/SectionMaster/GetSectionMasters', { Params: [], PageContext: { PageSize: 2000, PageNumber: 1 } }),
      apiFetch('clinicalmaster/Category/GetCategorysWithoutConcept', { Params: [{ Key: 3, Value: 2 }], PageContext: { PageSize: 100000, PageNumber: 1 } }),
    ]);
    return {
      sectionTypes: cleanLookup(lookups?.SectionType),
      docks: cleanLookup(lookups?.DockPosition),
      noteTypes: cleanLookup(lookups?.SectionNoteType),
      valueTypes: cleanLookup(lookups?.ValueType),
      categoryTypes: cleanLookup(lookups?.CategoryType),
      panels: (panels?.Data || []) as SectionMasterInfo[],
      categories: ((categories?.Data || []) as any[]).map((c) => ({ Id: c.Id, Name: c.CategoryName })) as GroupRef[],
    };
  }, []);
  const masters = useAsyncData(
    mastersFetcher,
    { sectionTypes: [] as LookupItem[], docks: [] as LookupItem[], noteTypes: [] as LookupItem[], valueTypes: [] as LookupItem[], categoryTypes: [] as LookupItem[], panels: [] as SectionMasterInfo[], categories: [] as GroupRef[] },
    { errorMessage: 'Could not load the panel library.' },
  );

  const panelFetcher = useCallback(async () => {
    if (!selectedId) return { panel: emptyPanel(), groups: [] as GroupRef[] };
    const [p, maps] = await Promise.all([
      apiFetch('clinicalmaster/SectionMaster/GetSectionMasterById', { Id: selectedId }),
      apiFetch('clinicalmaster/SectionMaster/GetCategories', { Params: [{ Key: 0, Value: selectedId }] }).catch(() => []),
    ]);
    const mapList: any[] = (Array.isArray(maps) ? maps : maps?.Data || []).slice().sort((a: any, b: any) => Number(a.DisplayOrder || 0) - Number(b.DisplayOrder || 0));
    const catNames = new Map<number, string>();
    (p?.SectionCategoryMaps || []).forEach((m: any) => m.Category && catNames.set(m.CategoryId, m.Category.CategoryName));
    return {
      panel: { ...emptyPanel(), ...p, SRef: p?.SRef || QUESTION_SREF, SectionNoteTypeId: p?.SectionNoteTypeId || '' } as PanelDraft,
      groups: mapList.map((m) => ({ Id: m.CategoryId, Name: catNames.get(m.CategoryId) || `Group ${m.CategoryId}` })),
    };
  }, [selectedId]);
  const detail = useAsyncData(panelFetcher, { panel: emptyPanel(), groups: [] as GroupRef[] }, {
    errorMessage: 'Could not load the panel.',
    onSuccess: (d) => {
      setPanel(d.panel);
      setGroups(d.groups);
    },
  });

  const isCustom = QUESTION_SECTION_TYPES.includes(Number(panel.SectionTypeId)) || panel.SRef === QUESTION_SREF;
  const categoryName = useMemo(() => new Map(masters.data.categories.map((c) => [c.Id, c.Name])), [masters.data.categories]);
  const visiblePanels = masters.data.panels.filter((p) => !search.trim() || p.Name.toLowerCase().includes(search.trim().toLowerCase()));
  const availableGroups = masters.data.categories.filter((c) => !groups.some((g) => g.Id === c.Id) && (!groupSearch.trim() || c.Name.toLowerCase().includes(groupSearch.trim().toLowerCase())));

  const noteTypeIds = panel.SectionNoteTypeId.split(',').map((x) => x.trim()).filter(Boolean);
  const toggleNoteType = (id: number) => {
    const next = noteTypeIds.includes(String(id)) ? noteTypeIds.filter((x) => x !== String(id)) : [...noteTypeIds, String(id)];
    setPanel((p) => ({ ...p, SectionNoteTypeId: next.join(',') }));
  };

  const pick = (id: number) => {
    setBuilderFor(null);
    setSelectedId(id);
    if (!id) {
      setPanel(emptyPanel());
      setGroups([]);
    }
  };

  const moveGroup = (i: number, d: number) =>
    setGroups((g) => {
      const t = i + d;
      if (t < 0 || t >= g.length) return g;
      const next = g.slice();
      [next[i], next[t]] = [next[t], next[i]];
      return next;
    });

  const save = async () => {
    if (!panel.Name.trim()) {
      alert.showErrorMsg('Enter the panel name.');
      return;
    }
    if (!panel.SectionTypeId) {
      alert.showErrorMsg('Choose the panel type.');
      return;
    }
    if (!isCustom && (!panel.SRef || panel.SRef === QUESTION_SREF)) {
      alert.showErrorMsg('Choose which standard panel this is.');
      return;
    }
    setSaving(true);
    try {
      const data = { ...panel, Name: panel.Name.trim(), SRef: isCustom ? QUESTION_SREF : panel.SRef };
      const res = await apiFetch(panel.Id ? 'clinicalmaster/SectionMaster/UpdateSectionMaster' : 'clinicalmaster/SectionMaster/AddSectionMaster', { Data: data });
      const id = panel.Id || (typeof res === 'number' ? res : 0);
      // Question groups are mapped after the panel exists (needs its id).
      if (isCustom && id) {
        await apiFetch('clinicalmaster/SectionMaster/MapCategories', {
          Data: { sectionid: id, map: groups.map((g, i) => ({ SectionId: id, CategoryId: g.Id, DisplayOrder: i })) },
        });
      }
      alert.showSuccessMsg('Panel saved');
      masters.reload();
      if (!panel.Id && id) setSelectedId(id);
      else detail.reload();
    } catch {
      /* toasted */
    } finally {
      setSaving(false);
    }
  };

  const stdOptions = PANEL_TYPES.map((t) => ({ value: t.sref, label: `${t.label} (${t.sref})` }));

  return (
    <div className="emrws-root">
      <EmrWorkspaceStyles />
      <div className="emrws-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ ...typography.h2, margin: 0 }}>EMR Panels</h1>
            <p style={{ ...typography.body, color: colors.textMuted, margin: `${spacing.xs} 0 0` }}>Create standard panels and custom question panels, then add them to EMR forms.</p>
          </div>
          {navigateTo && (
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-layer-group" onClick={() => navigateTo('app.emrformbuilder')}>
              Form assembly
            </Button>
          )}
        </div>
        {masters.error && <InlineNotice tone="danger">{masters.error}</InlineNotice>}

        <div className="emrws-admin-grid">
          <PanelSection
            title="Panel library"
            icon="fa-solid fa-shapes"
            flush
            actions={
              <Button size="xs" variant="primary" icon="fa-solid fa-plus" onClick={() => pick(0)}>
                New
              </Button>
            }
          >
            <div style={{ padding: spacing.sm }}>
              <Input size="sm" leftIcon="fa-solid fa-magnifying-glass" placeholder="Search panels" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search panels" />
            </div>
            {masters.loading ? (
              <div style={{ padding: spacing.md }}>
                <SkeletonRows rows={8} columns={1} />
              </div>
            ) : (
              <ul className="emrws-list" role="listbox" aria-label="Panels" style={{ maxHeight: 640, overflowY: 'auto' }}>
                {visiblePanels.map((p) => (
                  <li key={p.Id}>
                    <button type="button" role="option" aria-selected={p.Id === selectedId} className="emrws-list-item" onClick={() => pick(p.Id)}>
                      <span style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.Name}</span>
                      {isQuestionSection(p) ? <Badge tone="warning">CUSTOM</Badge> : <Badge tone="info">STD</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PanelSection>

          <div style={{ display: 'grid', gap: spacing.lg, minWidth: 0 }}>
            <PanelSection
              title={panel.Id ? `Edit panel: ${panel.Name}` : 'New panel'}
              icon="fa-solid fa-pen-ruler"
              allowOverflow
              actions={
                <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…">
                  Save panel
                </Button>
              }
            >
              {selectedId && detail.loading ? (
                <SkeletonRows rows={4} columns={2} />
              ) : (
                <div style={{ display: 'grid', gap: spacing.md }}>
                  <div className="emrws-grid-2">
                    <Input label="Panel name" required value={panel.Name} onChange={(e) => setPanel((p) => ({ ...p, Name: e.target.value }))} placeholder="e.g. Fall Risk Assessment" />
                    <Select
                      label="Panel type"
                      required
                      options={masters.data.sectionTypes.map((t) => ({ value: t.Id, label: t.Text }))}
                      value={panel.SectionTypeId}
                      placeholder="Select"
                      onChange={(v) => setPanel((p) => ({ ...p, SectionTypeId: Number(v), SRef: QUESTION_SECTION_TYPES.includes(Number(v)) ? QUESTION_SREF : p.SRef === QUESTION_SREF ? '' : p.SRef }))}
                    />
                  </div>
                  {!isCustom && (
                    <Select label="Standard panel" required options={stdOptions} value={panel.SRef} placeholder="Choose the built-in panel" onChange={(v) => setPanel((p) => ({ ...p, SRef: String(v) }))} helperText={panelTypeLabel(panel.SRef) ? PANEL_TYPES.find((t) => t.sref === panel.SRef)?.description : undefined} />
                  )}
                  <div className="emrws-grid-2">
                    <Select label="Default dock" options={masters.data.docks.map((d) => ({ value: d.Id, label: d.Text }))} value={panel.DockPositionId} placeholder="Top" onChange={(v) => setPanel((p) => ({ ...p, DockPositionId: Number(v) }))} />
                    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                      <legend style={{ ...typography.label, marginBottom: spacing.xs }}>Used in</legend>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
                        {masters.data.noteTypes.map((t) => (
                          <label key={t.Id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.body }}>
                            <input type="checkbox" checked={noteTypeIds.includes(String(t.Id))} onChange={() => toggleNoteType(t.Id)} />
                            {t.Text}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  {isCustom && Number(panel.SectionTypeId) !== 2 && (
                    <InlineNotice tone="info">HPI / ROS / PE panels pick their question groups automatically from the patient’s chief complaints (Chief Complaint ↔ Category map).</InlineNotice>
                  )}
                </div>
              )}
            </PanelSection>

            {isCustom && Number(panel.SectionTypeId) === 2 && (
              <div className="emrws-grid-2" style={{ alignItems: 'start' }}>
                <PanelSection title={`Question groups on this panel (${groups.length})`} icon="fa-solid fa-list-check" flush>
                  {groups.length === 0 ? (
                    <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>Add question groups from the right, then Save panel.</div>
                  ) : (
                    <ol className="emrws-placed">
                      {groups.map((g, i) => (
                        <li key={g.Id}>
                          <div className="emrws-placed-head">
                            <span style={{ ...typography.caption, color: colors.textSubtle, width: 18 }}>{i + 1}</span>
                            <strong style={{ flex: 1 }}>{categoryName.get(g.Id) || g.Name}</strong>
                            <Button size="xs" variant="outline-primary" icon="fa-solid fa-pen" onClick={() => setBuilderFor(g.Id)}>
                              Questions
                            </Button>
                            <Button size="xs" variant="icon" icon="fa-solid fa-arrow-up" aria-label="Move up" disabled={i === 0} onClick={() => moveGroup(i, -1)} />
                            <Button size="xs" variant="icon" icon="fa-solid fa-arrow-down" aria-label="Move down" disabled={i === groups.length - 1} onClick={() => moveGroup(i, 1)} />
                            <Button size="xs" variant="icon" icon="fa-solid fa-xmark" aria-label="Remove group" onClick={() => setGroups((gs) => gs.filter((x) => x.Id !== g.Id))} />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </PanelSection>
                <PanelSection
                  title="Question groups"
                  icon="fa-solid fa-boxes-stacked"
                  flush
                  actions={
                    <Button size="xs" variant="primary" icon="fa-solid fa-plus" onClick={() => setBuilderFor(0)}>
                      New group
                    </Button>
                  }
                >
                  <div style={{ padding: spacing.sm }}>
                    <Input size="sm" leftIcon="fa-solid fa-magnifying-glass" placeholder="Search groups" value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} aria-label="Search question groups" />
                  </div>
                  <ul className="emrws-list" style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {availableGroups.slice(0, 300).map((c) => (
                      <li key={c.Id} className="emrws-library-item">
                        <span style={{ fontWeight: 600, minWidth: 0 }}>{c.Name}</span>
                        <Button size="xs" variant="icon" icon="fa-solid fa-pen" aria-label={`Edit ${c.Name}`} title="Edit questions" onClick={() => setBuilderFor(c.Id)} />
                        <Button size="xs" variant="outline-primary" icon="fa-solid fa-plus" onClick={() => setGroups((g) => [...g, c])}>
                          Add
                        </Button>
                      </li>
                    ))}
                    {availableGroups.length === 0 && <li style={{ padding: spacing.md, color: colors.textSubtle, ...typography.body }}>No more groups</li>}
                  </ul>
                </PanelSection>
              </div>
            )}

            {builderFor !== null && (
              <ElementBuilder
                categoryId={builderFor}
                valueTypes={masters.data.valueTypes}
                categoryTypes={masters.data.categoryTypes}
                onClose={() => setBuilderFor(null)}
                onSaved={(id, name) => {
                  masters.reload();
                  // A new group created here is added to the panel straight away (still needs Save panel).
                  if (builderFor === 0 && id) {
                    setGroups((g) => (g.some((x) => x.Id === id) ? g : [...g, { Id: id, Name: name }]));
                    setBuilderFor(id);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
