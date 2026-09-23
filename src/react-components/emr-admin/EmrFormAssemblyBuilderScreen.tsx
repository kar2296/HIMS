/**
 * EMR FORM ASSEMBLY -- build an EMR form (ProfileMaster) from panels (SectionMaster), like the reference
 * "EMR Form Assembly" screen: selected panels with nickname / mandatory / order / dock, and the panel library.
 *
 *   forms     : clinicalmaster/ProfileMaster/GetProfileMasters | GetProfileMasterById | AddProfileMaster | UpdateProfileMaster
 *   panels    : clinicalmaster/SectionMaster/GetSectionMasters
 *   layout    : clinicalmaster/ProfileSection/GetProfileSections (Key 2 = ProfileId) | ManageProfileSection { Id, Data }
 *   settings  : clinicalmaster/ProfileSectionSetting/GetProfileSectionSettings | ManageProfileSectionSettings  (new, optional table)
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { Input, Textarea } from '../../components/ui/Input';
import { SkeletonRows } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';
import { EmrWorkspaceStyles } from '../emr-workspace/EmrWorkspaceStyles';
import { InlineNotice, PanelSection } from '../emr-workspace/EmrUi';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import { cleanLookup } from '../emr-workspace/emrHelpers';
import { isQuestionSection, panelTypeLabel } from '../emr-workspace/panelRegistry';
import type { LookupItem, SectionMasterInfo } from '../emr-workspace/types';

interface Props {
  reactProps?: { userId?: number; facilityId?: number };
  navigateTo?: (state: string, params?: Record<string, any>) => void;
}

interface FormRow {
  Id: number;
  Name: string;
  Description?: string;
  ProfilemasterTypeId?: string;
  IsIVF?: boolean;
  IsActive?: boolean;
  ActiveStatusId?: number;
  FacilityId?: number;
  [key: string]: any;
}

interface PlacedPanel {
  SectionId: number;
  DockPositionId: number;
  NickName: string;
  IsMandatory: boolean;
}

const DOCK = { TOP: 2, RIGHT: 3 };
const emptyForm = (facilityId?: number): FormRow => ({ Id: 0, Name: '', Description: '', ProfilemasterTypeId: '', IsIVF: false, IsActive: true, FacilityId: facilityId });

export const EmrFormAssemblyBuilderScreen: React.FC<Props> = ({ reactProps, navigateTo }) => {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [form, setForm] = useState<FormRow>(emptyForm(reactProps?.facilityId));
  const [placed, setPlaced] = useState<PlacedPanel[]>([]);
  const [formSearch, setFormSearch] = useState('');
  const [panelSearch, setPanelSearch] = useState('');
  const [savingForm, setSavingForm] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingFormId, setPendingFormId] = useState<number | null>(null);

  /* ───────── masters ───────── */

  const mastersFetcher = useCallback(async () => {
    const [lookups, sections] = await Promise.all([
      apiFetch('General/Options/getoptions', [{ Key: 'SectionNoteType' }]),
      apiFetch('clinicalmaster/SectionMaster/GetSectionMasters', { Params: [], PageContext: { PageSize: 2000, PageNumber: 1 } }),
    ]);
    return { noteTypes: cleanLookup(lookups?.SectionNoteType), sections: (sections?.Data || []) as SectionMasterInfo[] };
  }, []);
  const masters = useAsyncData(mastersFetcher, { noteTypes: [] as LookupItem[], sections: [] as SectionMasterInfo[] }, { errorMessage: 'Could not load panels.' });

  const formsFetcher = useCallback(async (): Promise<FormRow[]> => {
    const res = await apiFetch('clinicalmaster/ProfileMaster/GetProfileMasters', { Params: [], PageContext: { PageSize: 1000, PageNumber: 1 } });
    return res?.Data || [];
  }, []);
  const forms = useAsyncData<FormRow[]>(formsFetcher, [], { errorMessage: 'Could not load EMR forms.' });

  /* ───────── selected form ───────── */

  const layoutFetcher = useCallback(async () => {
    if (!selectedId) return { form: null as FormRow | null, placed: [] as PlacedPanel[] };
    // Form, layout and optional settings are independent reads.
    const [formRes, sectionsRes, settingsRes] = await Promise.all([
      apiFetch('clinicalmaster/ProfileMaster/GetProfileMasterById', { Id: selectedId }),
      apiFetch('clinicalmaster/ProfileSection/GetProfileSections', { Params: [{ Key: 2, Value: selectedId }], PageContext: { PageSize: 500, PageNumber: 1 } }),
      apiFetch('clinicalmaster/ProfileSectionSetting/GetProfileSectionSettings', { Params: [{ Key: 1, Value: selectedId }] }).catch(() => null),
    ]);
    const settings: any[] = settingsRes?.Data || [];
    const rows: any[] = (sectionsRes?.Data || []).slice().sort((a: any, b: any) => (a.DockPositionId || 2) - (b.DockPositionId || 2) || Number(a.DisplayOrder || 0) - Number(b.DisplayOrder || 0));
    return {
      form: formRes as FormRow,
      placed: rows.map((r) => {
        const s = settings.find((x) => Number(x.SectionId) === Number(r.SectionId));
        return { SectionId: Number(r.SectionId), DockPositionId: r.DockPositionId || DOCK.TOP, NickName: s?.NickName || '', IsMandatory: Boolean(s?.IsMandatory) };
      }),
    };
  }, [selectedId]);
  const layout = useAsyncData(layoutFetcher, { form: null as FormRow | null, placed: [] as PlacedPanel[] }, {
    errorMessage: 'Could not load the form.',
    onSuccess: (d) => {
      if (d.form) setForm({ ...d.form, IsActive: d.form.ActiveStatusId ? d.form.ActiveStatusId === 2 : d.form.IsActive !== false });
      setPlaced(d.placed);
      setDirty(false);
    },
  });

  const sectionById = useMemo(() => new Map(masters.data.sections.map((s) => [s.Id, s])), [masters.data.sections]);
  const placedIds = new Set(placed.map((p) => p.SectionId));
  const available = masters.data.sections.filter((s) => !placedIds.has(s.Id) && (!panelSearch.trim() || s.Name.toLowerCase().includes(panelSearch.trim().toLowerCase())));
  const visibleForms = forms.data.filter((f) => !formSearch.trim() || f.Name.toLowerCase().includes(formSearch.trim().toLowerCase()));

  const applyPick = (id: number) => {
    setSelectedId(id);
    if (!id) {
      setForm(emptyForm(reactProps?.facilityId));
      setPlaced([]);
      setDirty(false);
    }
  };

  // Unsaved layout edits are confirmed before switching forms.
  const pickForm = (id: number) => {
    if (dirty && id !== selectedId) {
      setPendingFormId(id);
      return;
    }
    applyPick(id);
  };

  /* ───────── form details ───────── */

  const typeIds = (form.ProfilemasterTypeId || '').split(',').map((x) => x.trim()).filter(Boolean);
  const toggleType = (id: number) => {
    const next = typeIds.includes(String(id)) ? typeIds.filter((x) => x !== String(id)) : [...typeIds, String(id)];
    setForm((f) => ({ ...f, ProfilemasterTypeId: next.join(',') }));
  };

  const saveForm = async () => {
    if (!form.Name.trim()) {
      alert.showErrorMsg('Enter the form name.');
      return;
    }
    if (typeIds.length === 0) {
      alert.showErrorMsg('Select at least one encounter type.');
      return;
    }
    setSavingForm(true);
    try {
      const data = { ...form, Name: form.Name.trim(), ActiveStatusId: form.IsActive ? 2 : 3, FacilityId: form.FacilityId || reactProps?.facilityId };
      const action = form.Id ? 'clinicalmaster/ProfileMaster/UpdateProfileMaster' : 'clinicalmaster/ProfileMaster/AddProfileMaster';
      const res = await apiFetch(action, { Data: data });
      alert.showSuccessMsg('EMR form saved');
      forms.reload();
      if (!form.Id && typeof res === 'number') setSelectedId(res);
      else layout.reload();
    } catch {
      /* toasted */
    } finally {
      setSavingForm(false);
    }
  };

  /* ───────── layout editing ───────── */

  const edit = (next: PlacedPanel[]) => {
    setPlaced(next);
    setDirty(true);
  };
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= placed.length) return;
    const next = placed.slice();
    [next[index], next[target]] = [next[target], next[index]];
    edit(next);
  };
  const patch = (index: number, p: Partial<PlacedPanel>) => edit(placed.map((x, i) => (i === index ? { ...x, ...p } : x)));

  const saveLayout = async () => {
    if (!selectedId) return;
    setSavingLayout(true);
    try {
      let top = 0;
      let right = 0;
      const sections = placed.map((p) => ({
        ProfileId: selectedId,
        SectionId: p.SectionId,
        DockPositionId: p.DockPositionId,
        DisplayOrder: String(p.DockPositionId === DOCK.RIGHT ? ++right : ++top),
      }));
      await apiFetch('clinicalmaster/ProfileSection/ManageProfileSection', { Id: selectedId, Data: sections });
      // Nicknames / mandatory flags live in the optional settings table -- saved after the layout.
      try {
        await apiFetch('clinicalmaster/ProfileSectionSetting/ManageProfileSectionSettings', {
          Id: selectedId,
          Data: placed.filter((p) => p.NickName.trim() || p.IsMandatory).map((p) => ({ SectionId: p.SectionId, NickName: p.NickName.trim(), IsMandatory: p.IsMandatory })),
        });
      } catch {
        alert.showErrorMsg('Panels saved, but nicknames / mandatory flags were not (run scripts/emr_profile_section_settings.sql).');
      }
      alert.showSuccessMsg('Form layout saved');
      layout.reload();
    } catch {
      /* toasted */
    } finally {
      setSavingLayout(false);
    }
  };

  const kindBadge = (s?: SectionMasterInfo) =>
    !s ? null : isQuestionSection(s) ? <Badge tone="warning">CUSTOM</Badge> : <Badge tone="info">STD</Badge>;

  /* ───────── render ───────── */

  return (
    <div className="emrws-root">
      <EmrWorkspaceStyles />
      <div className="emrws-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ ...typography.h2, margin: 0 }}>EMR Form Assembly</h1>
            <p style={{ ...typography.body, color: colors.textMuted, margin: `${spacing.xs} 0 0` }}>Build EMR forms from standard and custom panels. Doctors pick a form when they start a visit entry.</p>
          </div>
          {navigateTo && (
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button size="sm" variant="outline-secondary" icon="fa-solid fa-user-check" onClick={() => navigateTo('app.emrpanelselection')}>
                Panel selection
              </Button>
              <Button size="sm" variant="outline-secondary" icon="fa-solid fa-pen-ruler" onClick={() => navigateTo('app.emrpaneleditor')}>
                Edit panels
              </Button>
            </div>
          )}
        </div>
        {(masters.error || forms.error) && <InlineNotice tone="danger">{masters.error || forms.error}</InlineNotice>}

        <div className="emrws-admin-grid">
          {/* forms list */}
          <PanelSection
            title="EMR forms"
            icon="fa-solid fa-layer-group"
            flush
            actions={
              <Button size="xs" variant="primary" icon="fa-solid fa-plus" onClick={() => pickForm(0)}>
                New
              </Button>
            }
          >
            <div style={{ padding: spacing.sm }}>
              <Input size="sm" leftIcon="fa-solid fa-magnifying-glass" placeholder="Search forms" value={formSearch} onChange={(e) => setFormSearch(e.target.value)} aria-label="Search forms" />
            </div>
            {forms.loading ? (
              <div style={{ padding: spacing.md }}>
                <SkeletonRows rows={6} columns={1} />
              </div>
            ) : (
              <ul className="emrws-list" role="listbox" aria-label="EMR forms">
                {visibleForms.map((f) => (
                  <li key={f.Id}>
                    <button type="button" role="option" aria-selected={f.Id === selectedId} className="emrws-list-item" onClick={() => pickForm(f.Id)}>
                      <span style={{ fontWeight: 600 }}>{f.Name}</span>
                      {f.ActiveStatusId === 3 && <Badge tone="neutral">Inactive</Badge>}
                    </button>
                  </li>
                ))}
                {visibleForms.length === 0 && <li style={{ padding: spacing.md, color: colors.textSubtle, ...typography.body }}>No forms</li>}
              </ul>
            )}
          </PanelSection>

          <div style={{ display: 'grid', gap: spacing.lg, minWidth: 0 }}>
            {/* form details */}
            <PanelSection
              title={form.Id ? `Form: ${form.Name}` : 'New EMR form'}
              icon="fa-solid fa-file-pen"
              actions={
                <Button size="sm" variant="primary" icon="fa-solid fa-floppy-disk" onClick={saveForm} loading={savingForm} loadingText="Saving…">
                  Save form
                </Button>
              }
            >
              {selectedId && layout.loading ? (
                <SkeletonRows rows={3} columns={2} />
              ) : (
                <div style={{ display: 'grid', gap: spacing.md }}>
                  <div className="emrws-grid-2">
                    <Input label="Form name" required value={form.Name} onChange={(e) => setForm((f) => ({ ...f, Name: e.target.value }))} placeholder="e.g. OP - Clinicians" />
                    <Textarea label="Description" rows={1} value={form.Description || ''} onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))} />
                  </div>
                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend style={{ ...typography.label, marginBottom: spacing.xs }}>
                      Encounter types <span style={{ color: colors.danger }}>*</span>
                    </legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
                      {masters.data.noteTypes.map((t) => (
                        <label key={t.Id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.body }}>
                          <input type="checkbox" checked={typeIds.includes(String(t.Id))} onChange={() => toggleType(t.Id)} />
                          {t.Text}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div style={{ display: 'flex', gap: spacing.xl, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.body }}>
                      <input type="checkbox" checked={form.IsActive !== false} onChange={(e) => setForm((f) => ({ ...f, IsActive: e.target.checked }))} /> Active
                    </label>
                    <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.body }}>
                      <input type="checkbox" checked={Boolean(form.IsIVF)} onChange={(e) => setForm((f) => ({ ...f, IsIVF: e.target.checked }))} /> IVF form
                    </label>
                  </div>
                </div>
              )}
            </PanelSection>

            {/* layout */}
            {selectedId ? (
              <div className="emrws-grid-2" style={{ alignItems: 'start' }}>
                <PanelSection
                  title={`Panels on this form (${placed.length})`}
                  icon="fa-solid fa-table-columns"
                  flush
                  actions={
                    <Button size="sm" variant="success" icon="fa-solid fa-floppy-disk" onClick={saveLayout} loading={savingLayout} loadingText="Saving…" disabled={!dirty}>
                      Save & assign
                    </Button>
                  }
                >
                  {placed.length === 0 ? (
                    <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSubtle, ...typography.body }}>Add panels from the library →</div>
                  ) : (
                    <ol className="emrws-placed">
                      {placed.map((p, i) => {
                        const s = sectionById.get(p.SectionId);
                        return (
                          <li key={p.SectionId}>
                            <div className="emrws-placed-head">
                              <span style={{ ...typography.caption, color: colors.textSubtle, width: 18 }}>{i + 1}</span>
                              <strong style={{ flex: 1, minWidth: 0 }}>{s?.Name || `Panel ${p.SectionId}`}</strong>
                              {kindBadge(s)}
                              <Button size="xs" variant="icon" icon="fa-solid fa-arrow-up" aria-label="Move up" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                              <Button size="xs" variant="icon" icon="fa-solid fa-arrow-down" aria-label="Move down" title="Move down" disabled={i === placed.length - 1} onClick={() => move(i, 1)} />
                              <Button size="xs" variant="icon" icon="fa-solid fa-xmark" aria-label="Remove panel" title="Remove" onClick={() => edit(placed.filter((_, j) => j !== i))} />
                            </div>
                            <div className="emrws-placed-body emrws-placed-body--grow">
                              <Input size="sm" placeholder="Nickname (tab label)" value={p.NickName} onChange={(e) => patch(i, { NickName: e.target.value })} aria-label={`Nickname for ${s?.Name || 'panel'}`} />
                              <select className="emrws-inline-select" value={p.DockPositionId} onChange={(e) => patch(i, { DockPositionId: Number(e.target.value) })} aria-label="Dock position">
                                <option value={DOCK.TOP}>Top tabs</option>
                                <option value={DOCK.RIGHT}>Right tabs</option>
                              </select>
                              <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...typography.caption, whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={p.IsMandatory} onChange={(e) => patch(i, { IsMandatory: e.target.checked })} /> Mandatory
                              </label>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </PanelSection>

                <PanelSection title="Panel library" icon="fa-solid fa-shapes" flush>
                  <div style={{ padding: spacing.sm }}>
                    <Input size="sm" leftIcon="fa-solid fa-magnifying-glass" placeholder="Search panels" value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)} aria-label="Search panels" />
                  </div>
                  {masters.loading ? (
                    <div style={{ padding: spacing.md }}>
                      <SkeletonRows rows={6} columns={2} />
                    </div>
                  ) : (
                    <ul className="emrws-list" style={{ maxHeight: 520, overflowY: 'auto' }}>
                      {available.map((s) => (
                        <li key={s.Id} className="emrws-library-item">
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600 }}>{s.Name}</div>
                            <div style={{ ...typography.caption, color: colors.textSubtle }}>{isQuestionSection(s) ? 'Custom questions' : panelTypeLabel(s.SRef) || s.SRef || 'Standard'}</div>
                          </div>
                          {kindBadge(s)}
                          <Button size="xs" variant="outline-primary" icon="fa-solid fa-plus" onClick={() => edit([...placed, { SectionId: s.Id, DockPositionId: s.DockPositionId || DOCK.TOP, NickName: '', IsMandatory: false }])} aria-label={`Add ${s.Name}`}>
                            Add
                          </Button>
                        </li>
                      ))}
                      {available.length === 0 && <li style={{ padding: spacing.md, color: colors.textSubtle, ...typography.body }}>No more panels</li>}
                    </ul>
                  )}
                </PanelSection>
              </div>
            ) : (
              <div style={{ padding: spacing.xl, border: `1px dashed ${colors.borderStrong}`, borderRadius: radii.lg, color: colors.textMuted, textAlign: 'center', ...typography.body }}>
                Save the form first, then add panels to it.
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={pendingFormId !== null}
        title="Discard unsaved changes?"
        message="The panel layout of this form has unsaved changes. Switching forms will discard them."
        yesLabel="Discard"
        noLabel="Keep editing"
        variant="warning"
        onConfirm={() => {
          if (pendingFormId !== null) applyPick(pendingFormId);
          setPendingFormId(null);
        }}
        onCancel={() => setPendingFormId(null)}
      />
    </div>
  );
};
