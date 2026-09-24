/**
 * EMR Workspace -- the patient EMR screen from the reference video:
 * patient header → visit strip → visit-entry toolbar → panel tabs → active panel.
 *
 * Data model (all existing tables):
 *   visit entry  = consultations row (emr/consultation/*), status 1 Draft → 2 Completed → 3 Finalized
 *   EMR form     = ProfileMaster, its tabs = ProfileSections → SectionMaster (panel type = SRef)
 *   forms a user may pick = ProfileUser assignments (Assign EMR Forms to Doctors) of the logged-in user;
 *                           if they have none, the visit doctor's assignments; otherwise all active forms
 *   per-form panel nickname / mandatory = emr_profile_section_settings (optional table)
 *
 * Mounted by public/views/emr/patientemr/emrworkspace/emrworkspace.{js,html}; the hollow controller only
 * passes session context and host callbacks. All HTTP goes through utils/api.ts apiFetch().
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { colors, spacing, typography } from '../../components/ui/tokens';
import type {
  ConsultationInfo,
  EmrHostCallbacks,
  EmrWorkspaceContext,
  EncounterInfo,
  LookupItem,
  PatientInfo,
  ProfileInfo,
  SectionSetting,
  WorkspaceTab,
} from './types';
import { DEFAULT_TABS, resolvePanel, savesFromToolbar } from './panelRegistry';
import { cleanLookup, STATUS } from './emrHelpers';
import { useAsyncData } from './useAsyncData';
import { missingMandatoryPanels } from './completeness';
import { EmrWorkspaceStyles } from './EmrWorkspaceStyles';
import { PatientHeader, VisitStrip, type AllergySummary } from './PatientBanner';
import { EmrTabBar } from './EmrTabBar';
import { VisitEntryToolbar } from './VisitEntryToolbar';
import { InlineNotice } from './EmrUi';

export interface EmrWorkspaceScreenProps extends EmrHostCallbacks {
  reactProps?: {
    context?: Partial<EmrWorkspaceContext>;
    encounter?: EncounterInfo | null;
    /** Open on a specific tab (tab key or panel SRef). */
    initialTab?: string;
    /** 'emr' (OP), 'ipemr' (IP) or 'aeemr' (emergency) -- picks the EMR form type, like the classic screen. */
    emrContext?: string;
  };
}

const toInt = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : 0;
};

/** ProfileMaster.ProfilemasterTypeId values the classic consultation form uses: 1 OP, 3 IP, 6 Emergency. */
const profileTypeFor = (emrContext: string | undefined, encounterTypeId?: number) => {
  if (emrContext === 'ipemr') return 3;
  if (emrContext === 'aeemr') return 6;
  if (emrContext === 'emr') return 1;
  return encounterTypeId === 2 ? 3 : 1;
};

const sortByOrder = (a: { DisplayOrder?: string | number }, b: { DisplayOrder?: string | number }) => Number(a.DisplayOrder ?? 999) - Number(b.DisplayOrder ?? 999);

interface EntriesData {
  consultations: ConsultationInfo[];
  profiles: ProfileInfo[];
  defaultProfileId?: number;
  /** Whose form assignments were used: the logged-in user, the visit doctor, or none (all active forms). */
  formsSource?: 'user' | 'doctor' | 'all';
}

export const EmrWorkspaceScreen: React.FC<EmrWorkspaceScreenProps> = ({ reactProps, openLegacyModal, navigateTo, downloadFile }) => {
  const rawContext = reactProps?.context;
  const patientId = toInt(rawContext?.patientId);
  const encounterId = toInt(rawContext?.encounterId);
  const requestedConsultationId = rawContext?.consultationId ? toInt(rawContext.consultationId) : 0;
  const userId = toInt(rawContext?.userId);
  const userTypeId = rawContext?.userTypeId ? toInt(rawContext.userTypeId) : undefined;
  const facilityId = rawContext?.facilityId ? toInt(rawContext.facilityId) : undefined;

  /* ───────────── header data ───────────── */

  const patientFetcher = useCallback(async (): Promise<{ patient: PatientInfo | null; photo?: string }> => {
    if (!patientId) return { patient: null };
    const patient: PatientInfo = await apiFetch('registration/patient/GetPatientById', { Id: patientId });
    let photo: string | undefined;
    // The photo request needs PhotoPath from the patient record → runs after it.
    if (patient?.PhotoPath) {
      try {
        const pic = await apiFetch('registration/Patient/GetPatientProfilePic', { Data: { Id: patient.Id, PhotoPath: patient.PhotoPath } });
        if (pic?.Photo) photo = String(pic.Photo).startsWith('data:') ? pic.Photo : `data:image/jpeg;base64,${pic.Photo}`;
      } catch {
        /* no photo → initials avatar */
      }
    }
    return { patient: patient || null, photo };
  }, [patientId]);
  const patientQuery = useAsyncData(patientFetcher, { patient: null });

  const allergyFetcher = useCallback(async (): Promise<string[]> => {
    if (!patientId) return [];
    const res = await apiFetch('emr/patientallergy/GetPatientAllergys', {
      Params: [
        { Key: 2, Value: patientId },
        { Key: 4, Value: 1 },
      ],
      PageContext: { PageSize: 100, PageNumber: 1 },
    });
    return (res?.Data || []).map((a: any) => a.AllergyName).filter(Boolean);
  }, [patientId]);
  const allergyQuery = useAsyncData<string[]>(allergyFetcher, []);
  const allergies: AllergySummary = { loading: allergyQuery.loading, names: allergyQuery.error ? [] : allergyQuery.data };
  const reloadAllergySummary = allergyQuery.reload;

  // The controller passes the session encounter; for a deep link with only an id, load it the same way the
  // patientemr parent state does.
  const propEncounter = reactProps?.encounter ?? null;
  const encounterFetcher = useCallback(async (): Promise<EncounterInfo | null> => {
    if (propEncounter || !encounterId) return null;
    const res = await apiFetch('Visit/Visit/GetEncounters', { Params: [{ Key: 0, Value: encounterId }, { Key: 35, Value: true }] });
    return res?.Data?.[0] || null;
  }, [propEncounter, encounterId]);
  const fetchedEncounter = useAsyncData<EncounterInfo | null>(encounterFetcher, null).data;
  const encounter = propEncounter || fetchedEncounter;

  const encounterTypesFetcher = useCallback(async () => cleanLookup((await apiFetch('General/Options/getoptions', [{ Key: 'EncounterType' }]))?.EncounterType), []);
  const encounterTypes = useAsyncData<LookupItem[]>(encounterTypesFetcher, []).data;
  const encounterTypeLabel = useMemo(() => {
    const id = encounter?.EncounterTypeId;
    if (!id) return undefined;
    return encounterTypes.find((t) => t.Id === id)?.Text || (id === 2 ? 'IP' : id === 1 ? 'OP' : undefined);
  }, [encounter?.EncounterTypeId, encounterTypes]);

  /* ───────────── visit entries & EMR forms ───────────── */

  const profileType = profileTypeFor(reactProps?.emrContext, encounter?.EncounterTypeId);
  const visitDoctorId = toInt(encounter?.DoctorId);

  const entriesFetcher = useCallback(async (): Promise<EntriesData> => {
    if (!encounterId || !patientId) return { consultations: [], profiles: [] };
    const assignedTo = (uid: number): Promise<any[]> =>
      apiFetch('clinicalmaster/ProfileUser/GetProfileUsers', {
        Params: [
          { Key: 5, Value: uid },
          { Key: 9, Value: profileType },
        ],
      })
        .then((res) => (res?.Data || []).filter((a: any) => a.ProfileMaster))
        .catch(() => []);
    // Visit entries and the user's form assignments are independent reads.
    const [consultRes, mine] = await Promise.all([
      apiFetch('emr/consultation/GetConsultations', {
        Params: [
          { Key: 2, Value: encounterId },
          { Key: 3, Value: patientId },
        ],
        PageContext: { PageSize: 100, PageNumber: 1 },
      }),
      assignedTo(userId),
    ]);
    let assignments: any[] = mine;
    let formsSource: EntriesData['formsSource'] = 'user';
    // Someone other than the visit doctor (admin, nurse, covering doctor) without own forms: use the doctor's.
    if (assignments.length === 0 && visitDoctorId && visitDoctorId !== userId) {
      assignments = await assignedTo(visitDoctorId);
      formsSource = 'doctor';
    }
    let profiles: ProfileInfo[] = [];
    const seen = new Set<number>();
    assignments.forEach((a) => {
      if (a.ProfileMaster && !seen.has(a.ProfileMaster.Id)) {
        seen.add(a.ProfileMaster.Id);
        profiles.push(a.ProfileMaster);
      }
    });
    // No assignment for this user → every active form of this type (same fallback as the classic screen).
    if (profiles.length === 0) {
      const all = await apiFetch('clinicalmaster/ProfileMaster/GetProfileMasters', {
        Params: [
          { Key: 4, Value: profileType },
          { Key: 3, Value: 2 },
        ],
      }).catch(() => ({ Data: [] }));
      profiles = all?.Data || [];
      formsSource = 'all';
    }
    const def = assignments.find((a) => a.IsDefault && a.ProfileMaster)?.ProfileMaster?.Id;
    return { consultations: consultRes?.Data || [], profiles, defaultProfileId: def || profiles[0]?.Id, formsSource };
  }, [encounterId, patientId, userId, profileType, visitDoctorId]);

  const [pickedProfileId, setPickedProfileId] = useState<number | ''>('');
  const [chosenConsultationId, setChosenConsultationId] = useState<number>(requestedConsultationId);
  const [startingNew, setStartingNew] = useState(false);
  const entries = useAsyncData<EntriesData>(entriesFetcher, { consultations: [], profiles: [] }, { errorMessage: 'Could not load visit entries.' });
  const consultations = entries.data.consultations;
  const profiles = entries.data.profiles;
  const selectedProfileId = pickedProfileId || entries.data.defaultProfileId || '';
  const visitDoctorName = [encounter?.Doctor?.Title?.Description, encounter?.Doctor?.FirstName, encounter?.Doctor?.LastName].filter(Boolean).join(' ') || encounter?.DoctorName || 'the visit doctor';
  const formsNote =
    entries.data.formsSource === 'doctor'
      ? `Showing the EMR forms assigned to ${visitDoctorName} (the visit doctor).`
      : entries.data.formsSource === 'all' && profiles.length > 0
        ? 'No EMR forms are assigned to you or the visit doctor, so all active forms are listed. Assign forms in "Assign EMR Forms to Doctors".'
        : undefined;

  const activeSummary = consultations.find((c) => c.Id === chosenConsultationId) || consultations[0] || null;
  const activeConsultationId = startingNew ? 0 : activeSummary?.Id || 0;

  const consultationFetcher = useCallback(async (): Promise<ConsultationInfo | null> => {
    if (!activeConsultationId) return null;
    return (await apiFetch('emr/consultation/GetConsultationById', { Id: activeConsultationId })) || null;
  }, [activeConsultationId]);
  const consultationQuery = useAsyncData<ConsultationInfo | null>(consultationFetcher, null);
  const consultationDetail = consultationQuery.data;
  const active: ConsultationInfo | null = useMemo(
    () => (activeConsultationId ? { ...(activeSummary as ConsultationInfo), ...(consultationDetail || {}) } : null),
    [activeConsultationId, activeSummary, consultationDetail],
  );
  const profileId = active?.ProfileId || active?.ProfileMaster?.Id || 0;

  const settingsFetcher = useCallback(async (): Promise<SectionSetting[]> => {
    if (!profileId) return [];
    // Optional table: if it has not been created yet the workspace simply shows no nicknames / mandatory flags.
    const res = await apiFetch('clinicalmaster/ProfileSectionSetting/GetProfileSectionSettings', { Params: [{ Key: 1, Value: profileId }] }).catch(() => null);
    return res?.Data || [];
  }, [profileId]);
  const settings = useAsyncData<SectionSetting[]>(settingsFetcher, []).data;

  /* ───────────── tabs ───────────── */

  const tabs: WorkspaceTab[] = useMemo(() => {
    const sections = active?.ProfileMaster?.ProfileSections || [];
    if (!active || sections.length === 0) return DEFAULT_TABS;
    const setting = (sectionId: number) => settings.find((s) => s.SectionId === sectionId);
    const ordered = sections
      .filter((ps) => ps.SectionMaster)
      .slice()
      .sort((a, b) => (a.DockPositionId === b.DockPositionId ? sortByOrder(a, b) : (a.DockPositionId || 2) - (b.DockPositionId || 2)));
    return ordered.map((ps) => {
      const sm = ps.SectionMaster!;
      const st = setting(sm.Id);
      return {
        key: `section-${sm.Id}`,
        label: st?.NickName?.trim() || sm.Name,
        sref: sm.SRef || 'emr.cn.question',
        section: sm,
        mandatory: Boolean(st?.IsMandatory),
        dock: ps.DockPositionId,
      };
    });
  }, [active, settings]);

  const profileSectionIds = useMemo(() => tabs.filter((t) => t.section).map((t) => t.section!.Id), [tabs]);

  const [selectedTabKey, setSelectedTabKey] = useState<string>('');
  const [visited, setVisited] = useState<string[]>([]);
  const initialTab = reactProps?.initialTab;
  const activeTab = tabs.find((t) => t.key === selectedTabKey) || tabs.find((t) => initialTab && (t.key === initialTab || t.sref === initialTab)) || tabs[0];
  const mounted = useMemo(() => Array.from(new Set([...visited.filter((k) => tabs.some((t) => t.key === k)), activeTab.key])), [visited, tabs, activeTab.key]);

  const selectTab = (key: string) => {
    setSelectedTabKey(key);
    setVisited((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  /* ───────────── actions ───────────── */

  const saveHandlerRef = useRef<(() => Promise<boolean>) | null>(null);
  const [hasSaveHandler, setHasSaveHandler] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [busyAction, setBusyAction] = useState<'complete' | 'finalize' | null>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  const registerSaveHandler = useCallback((handler: (() => Promise<boolean>) | null) => {
    saveHandlerRef.current = handler;
    setHasSaveHandler(Boolean(handler));
  }, []);

  const saveActivePanel = async () => {
    if (!saveHandlerRef.current) return;
    setSaving(true);
    try {
      await saveHandlerRef.current();
    } finally {
      setSaving(false);
    }
  };

  const startEntry = async () => {
    const profile = profiles.find((p) => p.Id === selectedProfileId);
    if (!profile || !encounter) return;
    setStarting(true);
    try {
      const newId = await apiFetch('emr/consultation/AddConsultation', {
        Data: {
          PatientId: patientId,
          EncounterId: encounterId,
          EncounterDoctorId: encounter.EncounterDoctorId || encounter.DoctorId,
          VisitTypeId: encounter.VisitTypeId,
          Name: profile.Name,
          ProfileId: profile.Id,
          IsIVF: profile.IsIVF ? 1 : 0,
          ProgressNoteStatusId: STATUS.DRAFT,
        },
      });
      alert.showSuccessMsg(`${profile.Name} started`);
      if (typeof newId === 'number') setChosenConsultationId(newId);
      setStartingNew(false);
      setSelectedTabKey('');
      setVisited([]);
      entries.reload();
    } catch {
      /* toasted */
    } finally {
      setStarting(false);
    }
  };

  const updateStatus = async (statusId: number) => {
    if (!active) return false;
    await apiFetch('emr/consultation/UpdateProgressNoteStatus', { Id: active.Id, Data: { ProgressNoteStatusId: statusId, ApprovedBy: userId } });
    entries.reload();
    consultationQuery.reload();
    return true;
  };

  const complete = async () => {
    if (!active) return;
    setBusyAction('complete');
    try {
      const context: EmrWorkspaceContext = { patientId, encounterId, consultationId: active.Id, userId };
      const missing = await missingMandatoryPanels(tabs, context);
      if (missing.length) {
        alert.showErrorMsg(`Complete the mandatory panels first: ${missing.join(', ')}`);
        const first = tabs.find((t) => t.label === missing[0]);
        if (first) selectTab(first.key);
        return;
      }
      await updateStatus(STATUS.COMPLETED);
      alert.showSuccessMsg('Visit entry completed');
    } catch {
      /* toasted */
    } finally {
      setBusyAction(null);
    }
  };

  const finalize = async () => {
    setConfirmFinalize(false);
    setBusyAction('finalize');
    try {
      await updateStatus(STATUS.FINALIZED);
      alert.showSuccessMsg('Visit entry finalized');
    } catch {
      /* toasted */
    } finally {
      setBusyAction(null);
    }
  };

  const onDataChanged = useCallback(
    (panelKey: string) => {
      if (panelKey === 'allergies' || panelKey === 'vitals') reloadAllergySummary();
    },
    [reloadAllergySummary],
  );

  /* ───────────── panel context ───────────── */

  const context: EmrWorkspaceContext = useMemo(
    () => ({ patientId, encounterId, consultationId: active?.Id || null, userId, userTypeId, facilityId }),
    [patientId, encounterId, active?.Id, userId, userTypeId, facilityId],
  );
  const finalized = (active?.ProgressNoteStatusId || 0) >= STATUS.FINALIZED;
  const canEdit = Boolean(encounter && encounterId) && !finalized;

  /* ───────────── render ───────────── */

  if (!patientId) {
    return (
      <div className="emrws-root">
        <EmrWorkspaceStyles />
        <div className="emrws-stack">
          <InlineNotice tone="warning">No patient is selected. Open the EMR from a patient list or visit to use the EMR workspace.</InlineNotice>
        </div>
      </div>
    );
  }

  return (
    <div className="emrws-root">
      <EmrWorkspaceStyles />
      <div className="emrws-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <h1 style={{ ...typography.h2, margin: 0, color: colors.textMain }}>Electronic Medical Records</h1>
          {navigateTo && (
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-table-columns" onClick={() => navigateTo('patientemr.summarynotetab.patientdashboard', { pid: patientId, eid: encounterId })}>
              Patient dashboard
            </Button>
          )}
        </div>

        <PatientHeader patient={patientQuery.data.patient} loading={patientQuery.loading} allergies={allergies} photoSrc={patientQuery.data.photo} />
        <VisitStrip encounter={encounter} encounterTypeLabel={encounterTypeLabel} />

        <div className="emrws-card" style={{ padding: spacing.md, display: 'grid', gap: spacing.md }}>
          {entries.error && <InlineNotice tone="danger">{entries.error}</InlineNotice>}
          <VisitEntryToolbar
            hasEncounter={Boolean(encounter && encounterId)}
            loading={entries.loading}
            consultations={consultations}
            active={active}
            profiles={profiles}
            formsNote={formsNote}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setPickedProfileId}
            onStart={startEntry}
            starting={starting}
            onSwitch={(id) => {
              setChosenConsultationId(id);
              setSelectedTabKey('');
              setVisited([]);
            }}
            onNewEntry={() => setStartingNew(true)}
            onCancelStart={startingNew ? () => setStartingNew(false) : undefined}
            activeTabLabel={activeTab.label}
            canSave={hasSaveHandler && savesFromToolbar(activeTab)}
            saving={saving}
            onSave={saveActivePanel}
            busyAction={busyAction}
            onComplete={complete}
            onFinalize={() => setConfirmFinalize(true)}
            onEndConsultation={
              openLegacyModal
                ? () =>
                    openLegacyModal('app.patienttracker', { pid: patientId, eid: encounterId, aid: encounter?.AppointmentId, from: 'doctordashboard' }, () => entries.reload())
                : undefined
            }
            onPrint={
              downloadFile && active
                ? () =>
                    downloadFile('emr/consultation/PrintConsultation', {
                      Id: active.Id,
                      Data: { PatientId: patientId, EncounterId: encounterId, ConsultationId: active.Id, sectionList: profileSectionIds },
                    })
                : undefined
            }
            onReviewNotes={openLegacyModal && active ? () => openLegacyModal('patientemr.reviewnotes', { cid: active.Id, pid: patientId }) : undefined}
          />
          {finalized && <InlineNotice tone="success">This visit entry is finalized and locked. Use an Addendum to record late changes.</InlineNotice>}
          {!encounter && !entries.loading && <InlineNotice tone="warning">No active visit — panels are read-only.</InlineNotice>}
          <EmrTabBar tabs={tabs} activeKey={activeTab.key} onChange={selectTab} />
        </div>

        <div id="emrws-panel" role="tabpanel" aria-labelledby={`emrws-tab-${activeTab.key}`}>
          {mounted.map((key) => {
            const tab = tabs.find((t) => t.key === key);
            if (!tab) return null;
            const Panel = resolvePanel(tab);
            const isActive = key === activeTab.key;
            return (
              <div key={`${active?.Id || 0}-${key}`} hidden={!isActive}>
                <Panel
                  context={context}
                  encounter={encounter}
                  canEdit={canEdit}
                  section={tab.section || { Id: 0, Name: tab.label, SRef: tab.sref }}
                  profileSectionIds={profileSectionIds}
                  openLegacyModal={openLegacyModal}
                  navigateTo={navigateTo}
                  downloadFile={downloadFile}
                  onDataChanged={onDataChanged}
                  registerSaveHandler={isActive ? registerSaveHandler : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmFinalize}
        title="Finalize visit entry"
        message="Finalizing locks this visit entry. Later changes can only be added as an addendum. Continue?"
        yesLabel="Finalize"
        noLabel="Cancel"
        variant="warning"
        onConfirm={finalize}
        onCancel={() => setConfirmFinalize(false)}
      />
    </div>
  );
};
