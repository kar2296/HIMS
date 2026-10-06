/**
 * Order / request panels on their existing tables and forms:
 *
 *   ADMISSION DETAILS  (emr.ws.admission)        IPManagement/AdmissionRequest/GetAdmissionRequests + modal app.admissionrequestslipform
 *   SURGERY BOOKING    (emr.ws.surgerybooking / emr.cn.surgeryadvice)
 *                                                 emr/PatientSurgeryAdvice/GetPatientSurgeryAdvices + modal patientemr.surgeryadviceform
 *   DISCHARGE SUMMARY  (emr.ws.dischargesummary)  DischargeSummary/PatientCertificate/GetPatientCertificates + modal app.dischargesummary-form
 *   TREATMENT PLAN     (emr.cn.treatmentplan)     emr/TreatmentPlan/GetTreatmentPlans + modal patientemr.treatmentplanform
 */
import React from 'react';
import { apiFetch } from '../../utils/api';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import type { EmrPanelProps } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { RecordListSection, type RecordListConfig } from '../RecordListSection';

type Row = Record<string, any>;
const d = (v?: { Description?: string } | null) => v?.Description || '—';
const status = (v?: { Description?: string } | null) => (v?.Description ? <Badge tone={toneForStatus(v.Description)}>{v.Description}</Badge> : '—');

const ADMISSION: RecordListConfig<Row> = {
  title: 'Admission requests',
  icon: 'fa-solid fa-bed',
  emptyText: 'No admission requested for this patient',
  fetch: async (context) => {
    const res = await apiFetch('IPManagement/AdmissionRequest/GetAdmissionRequests', { Params: [{ Key: 11, Value: context.patientId }], PageContext: { PageSize: 50, PageNumber: 1 } });
    return res?.Data || [];
  },
  columns: [
    { header: 'Requested', render: (r) => formatDateTime(r.RequestDate) },
    { header: 'Request no', render: (r) => r.RequestIdentifier || '—' },
    { header: 'Type', render: (r) => d(r.AdmissionRequestType) },
    { header: 'Diagnosis', render: (r) => r.Diagnosis?.DiagnosisName || '—' },
    { header: 'Expected stay', render: (r) => (r.ExpectedStayDuration ? `${r.ExpectedStayDuration} day(s)` : '—') },
    { header: 'Nurse instruction', render: (r) => r.NurseInstruction || '—' },
    { header: 'Status', render: (r) => status(r.AdmissionRequestStatus) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'app.admissionrequestslipform', params: (_c, _e, r) => ({ id: r?.Id || 0 }), addLabel: 'Request admission' },
};

export const AdmissionPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="admission" config={ADMISSION} {...props} />;

const SURGERY: RecordListConfig<Row> = {
  title: 'Surgery booking',
  icon: 'fa-solid fa-hospital-user',
  emptyText: 'No surgery advised for this visit',
  fetch: async (context) => {
    const res = await apiFetch('emr/PatientSurgeryAdvice/GetPatientSurgeryAdvices', {
      Params: [
        { Key: 1, Value: context.patientId },
        { Key: 2, Value: context.encounterId },
      ],
      PageContext: { PageSize: 50, PageNumber: 1 },
    });
    return res?.Data || [];
  },
  columns: [
    { header: 'Surgery', render: (r) => <strong>{r.SurgeryName || '—'}</strong> },
    { header: 'Side', render: (r) => r.EyeSide?.Description || r.Side?.Description || '—' },
    { header: 'Planned date', render: (r) => formatDate(r.AppointmentDate) },
    { header: 'Comments', render: (r) => r.Comments || '—' },
  ],
  rowKey: (r) => r.Id,
  modal: {
    name: 'patientemr.surgeryadviceform',
    params: (c, _e, r) => ({ id: r?.Id || 0, pid: c.patientId, eid: c.encounterId, cid: c.consultationId }),
    addLabel: 'Book surgery',
  },
  deleteAction: 'emr/PatientSurgeryAdvice/DeletePatientSurgeryAdvice',
  deleteLabel: (r) => r.SurgeryName || 'this surgery booking',
};

export const SurgeryBookingPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="surgery" config={SURGERY} {...props} />;

const DISCHARGE: RecordListConfig<Row> = {
  title: 'Discharge summary',
  icon: 'fa-solid fa-file-medical',
  emptyText: 'No discharge summary started for this visit',
  fetch: async (context) => {
    const res = await apiFetch('DischargeSummary/PatientCertificate/GetPatientCertificates', {
      Params: [
        { Key: 10, Value: context.patientId },
        { Key: 6, Value: context.encounterId },
      ],
      PageContext: { PageSize: 20, PageNumber: 1 },
    });
    return res?.Data || [];
  },
  columns: [
    { header: 'Admitted', render: (r) => formatDateTime(r.AdmissionDate) },
    { header: 'Discharged', render: (r) => formatDateTime(r.DOD || r.DischargeDate) },
    { header: 'Discharge type', render: (r) => d(r.DischargeType) },
    { header: 'Approved by', render: (r) => (r.ApprovedUser ? [r.ApprovedUser.FirstName, r.ApprovedUser.LastName].filter(Boolean).join(' ') : '—') },
    { header: 'Status', render: (r) => status(r.CertificateStatus) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'app.dischargesummary-form', params: (c, _e, r) => ({ id: r?.Id || 0, pid: c.patientId, eid: c.encounterId }), addLabel: 'New discharge summary' },
};

export const DischargeSummaryPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="discharge" config={DISCHARGE} {...props} />;

const TREATMENT_PLAN: RecordListConfig<Row> = {
  title: 'Treatment plans',
  icon: 'fa-solid fa-route',
  emptyText: 'No treatment plan for this visit',
  fetch: async (context) => {
    const res = await apiFetch('emr/TreatmentPlan/GetTreatmentPlans', {
      Params: [
        { Key: 1, Value: context.patientId },
        { Key: 11, Value: context.encounterId },
      ],
      PageContext: { PageSize: 50, PageNumber: 1 },
    });
    return res?.Data || [];
  },
  columns: [
    { header: 'Plan no', render: (r) => r.PlanNumber || '—' },
    { header: 'Requested', render: (r) => formatDate(r.PlanRequestDate) },
    { header: 'Scheduled', render: (r) => `${formatDate(r.PlanScheduledFrom)} – ${formatDate(r.PlanScheduledTo)}` },
    { header: 'Sessions', render: (r) => r.NoOfDays ?? '—' },
    { header: 'Comments', render: (r) => r.Comments || '—' },
    { header: 'Status', render: (r) => status(r.PlanStatus) },
  ],
  rowKey: (r) => r.Id,
  modal: { name: 'patientemr.treatmentplanform', params: (c, _e, r) => ({ id: r?.Id || 0, pid: c.patientId, eid: c.encounterId }), addLabel: 'New plan' },
};

export const TreatmentPlanPanel: React.FC<EmrPanelProps> = (props) => <RecordListSection dataKey="treatmentplan" config={TREATMENT_PLAN} {...props} />;
