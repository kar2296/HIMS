/**
 * MEDICAL / FAMILY / SOCIAL HISTORY panel.
 *
 * One component, several EMR panel types (SectionMaster.SRef):
 *   emr.ws.history            → all five history lists (the reference screen's combined tab)
 *   emr.cn.familycondition    → family medical history only
 *   emr.cn.socialhistory      → social history only
 *   emr.cn.familysocialhistory→ family social history only
 *
 * Every list reads the existing Get…s endpoint and adds/edits through the existing history modal, so the
 * master pick-lists (relationship, social type, frequency, severity…) and rules stay exactly as today.
 */
import React from 'react';
import { apiFetch } from '../../utils/api';
import { spacing } from '../../../components/ui/tokens';
import type { EmrPanelProps, EmrWorkspaceContext } from '../types';
import { formatDate } from '../emrHelpers';
import { RecordListSection, type RecordListConfig } from '../RecordListSection';
import { ConditionFormModal } from './ConditionFormModal';

type Row = Record<string, any>;

const byPatient = (action: string) => async (context: EmrWorkspaceContext): Promise<Row[]> => {
  const res = await apiFetch(action, { Params: [{ Key: 2, Value: context.patientId }], PageContext: { PageSize: 200, PageNumber: 1 } });
  return res?.Data || [];
};

const modalParams = (context: EmrWorkspaceContext, _e: unknown, row?: Row) => ({ id: row?.Id || 0, pid: context.patientId, cid: context.consultationId });
const d = (v?: { Description?: string } | null) => v?.Description || '—';

const PAST_MEDICAL: RecordListConfig<Row> = {
  title: 'Past medical history',
  icon: 'fa-solid fa-notes-medical',
  emptyText: 'No past medical conditions recorded',
  fetch: async (context) => {
    const res = await apiFetch('emr/patientcondition/GetPatientConditions', {
      Params: [
        { Key: 2, Value: context.patientId },
        { Key: 7, Value: 1 },
      ],
      PageContext: { PageSize: 200, PageNumber: 1 },
    });
    return res?.Data || [];
  },
  columns: [
    { header: 'Condition', render: (r) => <strong>{[r.Code, r.DiagnosisName || r.Description].filter(Boolean).join(' – ') || '—'}</strong> },
    { header: 'Status', render: (r) => d(r.ConditionStatus) },
    { header: 'Since', render: (r) => formatDate(r.ConditionDate) },
    { header: 'Comments', render: (r) => r.Comments || '—' },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.patientcondition', params: modalParams, addLabel: 'Add condition', form: ConditionFormModal },
  deleteAction: 'emr/patientcondition/DeletePatientCondition',
  deleteLabel: (r) => r.DiagnosisName || 'this condition',
};

const SURGICAL: RecordListConfig<Row> = {
  title: 'Past surgical history',
  icon: 'fa-solid fa-user-doctor',
  emptyText: 'No previous surgery recorded',
  fetch: byPatient('emr/patientsurgical/GetPatientSurgicals'),
  columns: [
    { header: 'Procedure', render: (r) => <strong>{r.Procedure?.ProcedureName || r.ProcedureName || '—'}</strong> },
    { header: 'Type', render: (r) => d(r.ProcedureType) },
    { header: 'Date', render: (r) => formatDate(r.PerformedDate) },
    { header: 'Status', render: (r) => d(r.PatientSurgicalStatus) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.patientsurgical', params: modalParams, addLabel: 'Add surgery' },
  deleteAction: 'emr/patientsurgical/DeletePatientSurgical',
  deleteLabel: (r) => r.Procedure?.ProcedureName || r.ProcedureName || 'this surgery',
};

const FAMILY: RecordListConfig<Row> = {
  title: 'Family history',
  icon: 'fa-solid fa-people-roof',
  emptyText: 'No family history recorded',
  fetch: byPatient('emr/familycondition/GetFamilyConditions'),
  columns: [
    { header: 'Condition', render: (r) => <strong>{r.DiagnosisName || r.Description || '—'}</strong> },
    { header: 'Relationship', render: (r) => d(r.Relationship) },
    { header: 'Type', render: (r) => d(r.ConditionType) },
    { header: 'Status', render: (r) => d(r.ConditionStatus) },
    { header: 'Since', render: (r) => formatDate(r.ConditionDate) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.familycondition', params: modalParams, addLabel: 'Add family history' },
  deleteAction: 'emr/familycondition/DeleteFamilyCondition',
  deleteLabel: (r) => r.DiagnosisName || 'this family history',
};

const SOCIAL: RecordListConfig<Row> = {
  title: 'Social history',
  icon: 'fa-solid fa-smoking',
  emptyText: 'No social history recorded',
  fetch: byPatient('emr/patientsocialhistory/GetPatientSocialHistorys'),
  columns: [
    { header: 'Habit', render: (r) => <strong>{d(r.SocialType)}</strong> },
    { header: 'Frequency', render: (r) => d(r.SocialFrequency) },
    { header: 'Severity', render: (r) => d(r.Severity) },
    { header: 'Reviewed', render: (r) => formatDate(r.ReviewDate) },
    { header: 'Status', render: (r) => d(r.SocialHistoryStatus) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.patientsocialhistory', params: modalParams, addLabel: 'Add social history' },
  deleteAction: 'emr/patientsocialhistory/DeletePatientSocialHistory',
  deleteLabel: (r) => r.SocialType?.Description || 'this entry',
};

const FAMILY_SOCIAL: RecordListConfig<Row> = {
  title: 'Family social history',
  icon: 'fa-solid fa-house-user',
  emptyText: 'No family social history recorded',
  fetch: byPatient('emr/familysocialhistory/GetFamilySocialHistorys'),
  columns: [
    { header: 'Habit', render: (r) => <strong>{d(r.SocialType)}</strong> },
    { header: 'Relationship', render: (r) => d(r.Relationship) },
    { header: 'Frequency', render: (r) => d(r.SocialFrequency) },
    { header: 'Severity', render: (r) => d(r.Severity) },
    { header: 'Reviewed', render: (r) => formatDate(r.ReviewDate) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.familysocialhistory', params: modalParams, addLabel: 'Add family social history' },
  deleteAction: 'emr/familysocialhistory/DeleteFamilySocialHistory',
  deleteLabel: (r) => r.SocialType?.Description || 'this entry',
};

const LISTS_BY_SREF: Record<string, { key: string; config: RecordListConfig<Row> }[]> = {
  'emr.cn.familycondition': [{ key: 'family', config: FAMILY }],
  'emr.cn.socialhistory': [{ key: 'social', config: SOCIAL }],
  'emr.cn.familysocialhistory': [{ key: 'familysocial', config: FAMILY_SOCIAL }],
};

const ALL_LISTS = [
  { key: 'pastmedical', config: PAST_MEDICAL },
  { key: 'surgical', config: SURGICAL },
  { key: 'family', config: FAMILY },
  { key: 'social', config: SOCIAL },
  { key: 'familysocial', config: FAMILY_SOCIAL },
];

export const HistoryPanel: React.FC<EmrPanelProps> = (props) => {
  const lists = (props.section?.SRef && LISTS_BY_SREF[props.section.SRef]) || ALL_LISTS;
  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      {lists.map((l) => (
        <RecordListSection key={l.key} dataKey={`history-${l.key}`} config={l.config} {...props} />
      ))}
    </div>
  );
};
