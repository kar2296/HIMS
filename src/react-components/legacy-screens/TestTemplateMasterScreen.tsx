/**
 * LIS test result templates (male / female report layout) for one test master
 * (state app.testmastertab.testtemplatemasters).
 * Migrated from public/views/lis/testmaster/testtemplatemasters.*.
 *
 *   load : lis/testmaster/GetTestmasterTemplates   (Key 1 = TestMasterId)
 *   save : lis/testmaster/AddTestmasterTemplate | UpdateTestmasterTemplate  { Data }
 */
import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { RichTextEditor } from '../RichTextEditor';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, radii, spacing, typography } from '../../components/ui/tokens';

interface TemplateRow {
  Id?: number;
  TestmasterId?: number;
  MaleDataTemplate?: string | null;
  FemaleDataTemplate?: string | null;
  ChildDataTemplate?: string | null;
  IsActive?: boolean;
  [key: string]: unknown;
}

interface TestTemplateMasterScreenProps {
  reactProps?: {
    testMasterId?: number;
    labels?: Partial<Record<'title' | 'male' | 'female' | 'back' | 'save' | 'cancel' | 'saved', string>>;
  };
  navigateTo?: (state: string, params?: Record<string, unknown>) => void;
}

const TEST_MASTER_FILTER_ID = 1; // TestmasterTemplateFilters.TestMasterId

export const TestTemplateMasterScreen: React.FC<TestTemplateMasterScreenProps> = ({ reactProps, navigateTo }) => {
  const testMasterId = Number(reactProps?.testMasterId) || 0;
  const labels = reactProps?.labels || {};

  const [template, setTemplate] = useState<TemplateRow>({ IsActive: true });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!testMasterId) return;
    let active = true;
    apiFetch('lis/testmaster/GetTestmasterTemplates', {
      Params: [{ Key: TEST_MASTER_FILTER_ID, Value: testMasterId }],
      PageContext: { PageSize: 10, PageNumber: 1 },
    })
      .then((res) => {
        if (!active) return;
        setTemplate(res?.Data?.[0] || { IsActive: true });
        setLoadError(null);
      })
      .catch(() => {
        if (active) setLoadError('Could not load the templates for this test.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [testMasterId, reloadKey]);

  const update = useCallback((field: keyof TemplateRow) => (html: string) => setTemplate((t) => ({ ...t, [field]: html })), []);

  const save = async () => {
    if (!testMasterId) return;
    setSaving(true);
    try {
      const isUpdate = Boolean(template.Id && template.Id > 0);
      await apiFetch(isUpdate ? 'lis/testmaster/UpdateTestmasterTemplate' : 'lis/testmaster/AddTestmasterTemplate', {
        Data: { ...template, TestmasterId: testMasterId },
      });
      alert.showSuccessMsg(labels.saved || 'Saved successfully');
      // Reload so a new template gets its Id; a second Save then updates instead of adding a duplicate.
      if (!isUpdate) {
        setLoading(true);
        setReloadKey((k) => k + 1);
      }
    } catch {
      /* the API layer already showed the error */
    } finally {
      setSaving(false);
    }
  };

  if (!testMasterId) {
    return <div style={{ padding: spacing.lg, color: colors.textMuted }}>Save the test first, then add its templates.</div>;
  }

  const editor = (label: string, field: 'MaleDataTemplate' | 'FemaleDataTemplate') => (
    <section style={{ display: 'grid', gap: spacing.xs }}>
      <h4 style={{ ...typography.label, margin: 0 }}>{label}</h4>
      <RichTextEditor richtext={template[field] || ''} onContentChange={update(field)} height={420} placeholder={label} />
    </section>
  );

  return (
    <div style={{ fontFamily: typography.fontFamily, display: 'grid', gap: spacing.lg }}>
      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.lg }}>
        <div style={{ padding: `${spacing.md} ${spacing.lg}`, borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ ...typography.h3, margin: 0 }}>{labels.title || 'Test Template Master'}</h3>
        </div>
        <div style={{ padding: spacing.lg, display: 'grid', gap: spacing.xl }}>
          {loading ? (
            <SkeletonRows rows={6} columns={1} />
          ) : loadError ? (
            <div role="alert" style={{ color: colors.danger }}>
              {loadError}{' '}
              <Button size="xs" variant="link" onClick={() => { setLoading(true); setReloadKey((k) => k + 1); }}>
                Try again
              </Button>
            </div>
          ) : (
            <>
              {editor(labels.male || 'Male Template Design', 'MaleDataTemplate')}
              {editor(labels.female || 'Female Template Design', 'FemaleDataTemplate')}
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Button variant="outline-secondary" size="sm" icon="fa-solid fa-angle-left" onClick={() => navigateTo?.('app.testmastertab.testmaster')}>
          {labels.back || 'Back'}
        </Button>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button variant="outline-secondary" size="sm" onClick={() => navigateTo?.('app.testmasters')}>
            {labels.cancel || 'Cancel'}
          </Button>
          <Button variant="primary" size="sm" icon="fa-solid fa-floppy-disk" onClick={save} loading={saving} loadingText="Saving…" disabled={loading || Boolean(loadError)}>
            {labels.save || 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};
