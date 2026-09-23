/**
 * EMR PANEL SELECTION -- which EMR forms (ProfileMaster) each user may use, and which is their default.
 * Same data the classic "Template Screen Users" page edits (clinicalmaster/ProfileUser/*):
 *
 *   forms       : clinicalmaster/ProfileMaster/GetProfileMasters   (Key 3 = active 2)
 *   assignments : clinicalmaster/ProfileUser/GetProfileUsers       (Key 5 = UserId)
 *   assign      : clinicalmaster/ProfileUser/AddProfileUser        { Data }
 *   unassign    : clinicalmaster/ProfileUser/DeleteProfileUser     { Id }
 *   default     : clinicalmaster/ProfileUser/UpdateProfileUser     { Data: { Id, IsDefault } }
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { SearchSelect } from '../../components/ui/Select';
import { SkeletonRows } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, typography } from '../../components/ui/tokens';
import { EmrWorkspaceStyles } from '../emr-workspace/EmrWorkspaceStyles';
import { InlineNotice, PanelSection, SimpleTable } from '../emr-workspace/EmrUi';
import { useAsyncData } from '../emr-workspace/useAsyncData';
import { cleanLookup } from '../emr-workspace/emrHelpers';
import type { LookupItem } from '../emr-workspace/types';

interface Props {
  reactProps?: { userId?: number; facilityId?: number };
}

interface ProfileRow {
  Id: number;
  Name: string;
  Description?: string;
  ProfilemasterTypeId?: string;
  IsIVF?: boolean;
}

interface Assignment {
  Id: number;
  ProfileId: number;
  UserId: number;
  IsDefault?: boolean;
  VisitTypeId?: number;
  FacilityId?: number;
  DepartmentId?: number;
}

/** Only the ProfileUser columns go back to the API (the list rows also carry the joined ProfileMaster). */
const toProfileUserRow = (a: Assignment, IsDefault: boolean) => ({
  Id: a.Id,
  ProfileId: a.ProfileId,
  UserId: a.UserId,
  VisitTypeId: a.VisitTypeId,
  FacilityId: a.FacilityId,
  DepartmentId: a.DepartmentId,
  IsDefault,
});

const typeNames = (csv: string | undefined, noteTypes: LookupItem[]) =>
  (csv || '')
    .split(',')
    .map((id) => noteTypes.find((t) => String(t.Id) === id.trim())?.Text)
    .filter(Boolean)
    .join(', ') || '—';

export const EmrPanelSelectionScreen: React.FC<Props> = ({ reactProps }) => {
  const [userId, setUserId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [busyProfile, setBusyProfile] = useState<number | null>(null);

  const mastersFetcher = useCallback(async () => {
    // Independent reads: users, note types and all active forms.
    const [lookups, forms] = await Promise.all([
      apiFetch('General/Options/getoptions', [{ Key: 'User' }, { Key: 'SectionNoteType' }]),
      apiFetch('clinicalmaster/ProfileMaster/GetProfileMasters', { Params: [{ Key: 3, Value: 2 }], PageContext: { PageSize: 500, PageNumber: 1 } }),
    ]);
    return { users: cleanLookup(lookups?.User), noteTypes: cleanLookup(lookups?.SectionNoteType), forms: (forms?.Data || []) as ProfileRow[] };
  }, []);
  const masters = useAsyncData(mastersFetcher, { users: [] as LookupItem[], noteTypes: [] as LookupItem[], forms: [] as ProfileRow[] }, { errorMessage: 'Could not load EMR forms.' });

  const assignmentsFetcher = useCallback(async (): Promise<Assignment[]> => {
    if (!userId) return [];
    const res = await apiFetch('clinicalmaster/ProfileUser/GetProfileUsers', { Params: [{ Key: 5, Value: userId }], PageContext: { PageSize: 500, PageNumber: 1 } });
    return res?.Data || [];
  }, [userId]);
  const assignments = useAsyncData<Assignment[]>(assignmentsFetcher, []);

  const forms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return masters.data.forms.filter((f) => !q || f.Name.toLowerCase().includes(q) || (f.Description || '').toLowerCase().includes(q));
  }, [masters.data.forms, search]);

  const assignmentFor = (profileId: number) => assignments.data.find((a) => a.ProfileId === profileId);

  const toggleAssign = async (form: ProfileRow) => {
    if (!userId) return;
    const current = assignmentFor(form.Id);
    setBusyProfile(form.Id);
    try {
      if (current) {
        await apiFetch('clinicalmaster/ProfileUser/DeleteProfileUser', { Id: current.Id });
        alert.showSuccessMsg(`${form.Name} removed`);
      } else {
        await apiFetch('clinicalmaster/ProfileUser/AddProfileUser', {
          Data: { ProfileId: form.Id, UserId: userId, FacilityId: reactProps?.facilityId, IsDefault: assignments.data.length === 0 },
        });
        alert.showSuccessMsg(`${form.Name} assigned`);
      }
      assignments.reload();
    } catch {
      /* toasted */
    } finally {
      setBusyProfile(null);
    }
  };

  const makeDefault = async (form: ProfileRow) => {
    const target = assignmentFor(form.Id);
    if (!target) return;
    setBusyProfile(form.Id);
    try {
      // Only one default per user: clear the others first (sequential, the order matters).
      for (const a of assignments.data.filter((x) => x.IsDefault && x.Id !== target.Id)) {
        await apiFetch('clinicalmaster/ProfileUser/UpdateProfileUser', { Data: toProfileUserRow(a, false) });
      }
      await apiFetch('clinicalmaster/ProfileUser/UpdateProfileUser', { Data: toProfileUserRow(target, true) });
      alert.showSuccessMsg(`${form.Name} is now the default`);
      assignments.reload();
    } catch {
      /* toasted */
    } finally {
      setBusyProfile(null);
    }
  };

  const assignedCount = assignments.data.length;

  return (
    <div className="emrws-root">
      <EmrWorkspaceStyles />
      <div className="emrws-stack">
        <div>
          <h1 style={{ ...typography.h2, margin: 0 }}>EMR Panel Selection</h1>
          <p style={{ ...typography.body, color: colors.textMuted, margin: `${spacing.xs} 0 0` }}>Choose which EMR forms a user can start in the EMR workspace, and their default form.</p>
        </div>
        {masters.error && <InlineNotice tone="danger">{masters.error}</InlineNotice>}
        <PanelSection title="User" icon="fa-solid fa-user" allowOverflow>
          <div className="emrws-grid-2">
            <SearchSelect
              label="User"
              options={masters.data.users.map((u) => ({ value: u.Id, label: u.Text }))}
              value={userId}
              placeholder={masters.loading ? 'Loading users…' : 'Search user'}
              onChange={(v) => setUserId(Number(v))}
            />
            <div style={{ alignSelf: 'end', ...typography.body, color: colors.textMuted }}>
              {userId ? `${assignedCount} form${assignedCount === 1 ? '' : 's'} assigned` : 'Select a user to manage their forms.'}
            </div>
          </div>
        </PanelSection>

        <PanelSection
          title="Assigned EMR forms"
          icon="fa-solid fa-table-list"
          flush
          actions={
            <input
              className="emrws-inline-select"
              style={{ fontWeight: 400, minWidth: 220 }}
              type="search"
              placeholder="Search forms"
              aria-label="Search forms"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        >
          {masters.loading || (userId && assignments.loading) ? (
            <div style={{ padding: spacing.lg }}>
              <SkeletonRows rows={6} columns={5} />
            </div>
          ) : (
            <SimpleTable headers={['EMR form', 'Encounter types', 'Description', 'Assigned', 'Default']} empty={forms.length === 0} emptyText="No EMR forms. Create one in EMR Form Assembly.">
              {forms.map((f) => {
                const a = assignmentFor(f.Id);
                const busy = busyProfile === f.Id;
                return (
                  <tr key={f.Id}>
                    <td>
                      <strong>{f.Name}</strong>
                      {f.IsIVF && (
                        <span style={{ marginLeft: 6 }}>
                          <Badge tone="info">IVF</Badge>
                        </span>
                      )}
                    </td>
                    <td>{typeNames(f.ProfilemasterTypeId, masters.data.noteTypes)}</td>
                    <td style={{ color: colors.textMuted }}>{f.Description || '—'}</td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: userId ? 'pointer' : 'not-allowed' }}>
                        <input type="checkbox" checked={Boolean(a)} disabled={!userId || busy} onChange={() => toggleAssign(f)} aria-label={`Assign ${f.Name}`} style={{ width: 16, height: 16 }} />
                        <span style={{ color: a ? colors.successText : colors.textSubtle }}>{a ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td>
                      {a ? (
                        a.IsDefault ? (
                          <Badge tone="success">Default</Badge>
                        ) : (
                          <Button size="xs" variant="link" disabled={busy} onClick={() => makeDefault(f)}>
                            Make default
                          </Button>
                        )
                      ) : (
                        <span style={{ color: colors.textDisabled }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </SimpleTable>
          )}
        </PanelSection>
      </div>
    </div>
  );
};
