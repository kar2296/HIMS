/**
 * "Has this mandatory panel been filled?" checks used by the Complete action.
 * Each check reads the same endpoint the panel itself uses. Panel types without a check are treated as
 * satisfied (they are lists of optional orders/requests).
 */
import { apiFetch } from '../utils/api';
import type { EmrWorkspaceContext, WorkspaceTab } from './types';
import { isQuestionSection } from './panelRegistry';

const count = async (action: string, body: Record<string, any>) => {
  const res = await apiFetch(action, body);
  return (res?.Data || []).length as number;
};

export async function panelHasData(tab: WorkspaceTab, ctx: EmrWorkspaceContext): Promise<boolean> {
  const pid = ctx.patientId;
  const eid = ctx.encounterId;
  const cid = ctx.consultationId;

  if (tab.section && isQuestionSection(tab.section)) {
    if (!cid) return false;
    const res = await apiFetch('emr/CategorySectionEntry/GetCategorySectionEntrys', {
      Params: [
        { Key: 2, Value: tab.section.Id },
        { Key: 3, Value: cid },
      ],
      PageContext: { PageSize: 500, PageNumber: 1 },
    });
    return (res?.Data || []).some(
      (e: any) =>
        (e.ResultValue !== null && e.ResultValue !== undefined && e.ResultValue !== '' && e.ResultValue !== '0' && e.ResultValue !== 0 && e.ResultValue !== 'false') ||
        (e.ResultValueRichText && String(e.ResultValueRichText).replace(/<[^>]*>/g, '').trim()) ||
        (e.ResultValueJSON && e.ResultValueJSON !== '[]'),
    );
  }

  switch (tab.sref) {
    case 'emr.cn.vital':
      return (await count('emr/patientvital/GetPatientVitals', { Params: [{ Key: 2, Value: pid }, { Key: 9, Value: eid }] })) > 0;
    case 'emr.cn.diagnosis':
      return (await count('emr/patientcondition/GetPatientConditions', { Params: [{ Key: 2, Value: pid }, { Key: 5, Value: eid }, { Key: 7, Value: 0 }], PageContext: { PageSize: 5, PageNumber: 1 } })) > 0;
    case 'emr.cn.clinicalnotes':
      return (await count('emr/PatientClinicalNotes/GetPatientClinicalNotess', { Params: [{ Key: 1, Value: pid }, { Key: 2, Value: eid }] })) > 0;
    case 'emr.cn.chiefcomplaint':
      return (await count('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: [{ Key: 2, Value: pid }, { Key: 3, Value: eid }], PageContext: { PageSize: 5, PageNumber: 1 } })) > 0;
    case 'emr.cn.allergy':
      return (await count('emr/patientallergy/GetPatientAllergys', { Params: [{ Key: 2, Value: pid }, { Key: 4, Value: 1 }], PageContext: { PageSize: 5, PageNumber: 1 } })) > 0;
    case 'emr.cn.prescription':
      return (await count('emr/prescription/GetPrescriptions', { Params: [{ Key: 2, Value: pid }, { Key: 12, Value: eid }], PageContext: { PageSize: 5, PageNumber: 1 } })) > 0;
    case 'emr.cn.order':
      return (await count('emr/patientorder/GetPatientOrders', { Params: [{ Key: 2, Value: pid }, { Key: 18, Value: eid }], PageContext: { PageSize: 5, PageNumber: 1 } })) > 0;
    default:
      return true;
  }
}

/** Returns the labels of mandatory tabs that have no data yet. Checks run in parallel (independent reads). */
export async function missingMandatoryPanels(tabs: WorkspaceTab[], ctx: EmrWorkspaceContext): Promise<string[]> {
  const mandatory = tabs.filter((t) => t.mandatory);
  const results = await Promise.all(mandatory.map((t) => panelHasData(t, ctx).catch(() => true)));
  return mandatory.filter((_, i) => !results[i]).map((t) => t.label);
}
