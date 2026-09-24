/**
 * EMR panel registry: maps an EMR panel type (SectionMaster.SRef) to the React panel that renders it.
 *
 * - `emr.cn.*` types are the ones the classic consultation screen already uses, so EMR forms built for it
 *   work here unchanged.
 * - `emr.ws.*` types are workspace-only panels (charts, requests, addendum…). Add them to an EMR form from
 *   EMR Masters → Edit Panel (Standard panel type).
 * - Anything else falls back to LegacySectionPanel, which opens the classic consultation for that entry.
 */
import type React from 'react';
import type { EmrPanelProps, SectionMasterInfo, WorkspaceTab } from './types';
import { VitalsPanel } from './panels/VitalsPanel';
import { ChiefComplaintPanel } from './panels/ChiefComplaintPanel';
import { ChiefComplaintListPanel } from './panels/ChiefComplaintListPanel';
import { DiagnosisPanel } from './panels/DiagnosisPanel';
import { AllergyPanel } from './panels/AllergyPanel';
import { PrescriptionsPanel } from './panels/PrescriptionsPanel';
import { ServicesPanel, ServiceDeliveryPanel } from './panels/ServicesPanels';
import { QuestionSectionPanel } from './panels/QuestionSectionPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { IntakeOutputPanel, HaemodialysisPanel, PreOpChecklistPanel, IpdMarPanel } from './panels/NursingChartPanels';
import { AdmissionPanel, SurgeryBookingPanel, DischargeSummaryPanel, TreatmentPlanPanel } from './panels/RequestPanels';
import { VitalsFlowsheetPanel } from './panels/VitalsFlowsheetPanel';
import { SummaryPanel, PreviousVisitsPanel, ResultsPanel, AddendumPanel, LegacySectionPanel } from './panels/ConsultationPanels';

export const QUESTION_SREF = 'emr.cn.question';

export interface PanelType {
  sref: string;
  label: string;
  description: string;
  component: React.FC<EmrPanelProps>;
  /** Panels with a toolbar "Save" (they register a save handler). */
  savesFromToolbar?: boolean;
}

/** Standard (built-in) panel types, in the order offered in EMR Masters. */
export const PANEL_TYPES: PanelType[] = [
  { sref: 'emr.cn.vital', label: 'Vitals', description: 'Vital signs from the Vital master, BMI, pain score and allergies.', component: VitalsPanel, savesFromToolbar: true },
  { sref: 'emr.cn.chiefcomplaint', label: 'Chief complaint (coded)', description: 'Chief complaints from the master; drives HPI / ROS / PE questions.', component: ChiefComplaintListPanel },
  { sref: 'emr.cn.clinicalnotes', label: 'CC / HPI', description: 'Chief complaint text and structured history of present illness.', component: ChiefComplaintPanel, savesFromToolbar: true },
  { sref: 'emr.cn.diagnosis', label: 'Diagnosis', description: 'ICD-coded visit diagnoses (primary / secondary).', component: DiagnosisPanel },
  { sref: 'emr.cn.condition', label: 'Problem list', description: 'Past medical conditions carried across visits.', component: DiagnosisPanel },
  { sref: 'emr.cn.allergy', label: 'Allergies', description: 'Drug, food and substance allergies, or NKA.', component: AllergyPanel },
  { sref: 'emr.cn.prescription', label: 'Prescriptions', description: 'Outpatient prescriptions (pharmacy-linked form).', component: PrescriptionsPanel },
  { sref: 'emr.cn.order', label: 'Services', description: 'Lab, radiology and procedure orders.', component: ServicesPanel },
  { sref: 'emr.cn.procedureorders', label: 'Procedure orders', description: 'Procedure orders (same order form as Services).', component: ServicesPanel },
  { sref: 'emr.ws.servicedelivery', label: 'Service delivery', description: 'Everything ordered for the visit with delivery status.', component: ServiceDeliveryPanel },
  { sref: 'emr.ws.history', label: 'Medical / family / social history', description: 'Past medical & surgical, family and social history.', component: HistoryPanel },
  { sref: 'emr.cn.familycondition', label: 'Family history', description: 'Family medical conditions.', component: HistoryPanel },
  { sref: 'emr.cn.socialhistory', label: 'Social history', description: 'Smoking, alcohol and other habits.', component: HistoryPanel },
  { sref: 'emr.cn.familysocialhistory', label: 'Family social history', description: 'Habits of family members.', component: HistoryPanel },
  { sref: 'emr.ws.vitalflowsheet', label: 'Vitals flowsheet', description: 'All vital sets across visits, newest first.', component: VitalsFlowsheetPanel },
  { sref: 'emr.ws.intakeoutput', label: 'Intake & output chart', description: 'Fluid intake / output with running balance.', component: IntakeOutputPanel },
  { sref: 'emr.ws.haemodialysis', label: 'Haemodialysis chart', description: 'Dialysis session flow chart.', component: HaemodialysisPanel },
  { sref: 'emr.ws.preopchecklist', label: 'Pre-operative checklist', description: 'Ward / OR pre-operative checklist.', component: PreOpChecklistPanel },
  { sref: 'emr.ws.mar', label: 'IPD prescription (MAR)', description: 'Medication administration record for inpatients.', component: IpdMarPanel },
  { sref: 'emr.ws.admission', label: 'Admission details', description: 'Admission requests for this patient.', component: AdmissionPanel },
  { sref: 'emr.ws.surgerybooking', label: 'Surgery booking', description: 'Surgery advice / OT booking for this visit.', component: SurgeryBookingPanel },
  { sref: 'emr.cn.surgeryadvice', label: 'Surgery advice', description: 'Surgery advice (same as Surgery booking).', component: SurgeryBookingPanel },
  { sref: 'emr.ws.dischargesummary', label: 'Discharge summary', description: 'Discharge summary for this admission.', component: DischargeSummaryPanel },
  { sref: 'emr.cn.treatmentplan', label: 'Treatment plan', description: 'Scheduled treatment plans (sessions / packages).', component: TreatmentPlanPanel },
  { sref: 'emr.ws.addendum', label: 'Addendum', description: 'Sign clinical notes and add amendments.', component: AddendumPanel },
  { sref: 'emr.cn.reviewnotes', label: 'Summary', description: 'Summary of this visit entry with print.', component: SummaryPanel },
  { sref: 'emr.cn.previousnotes', label: 'Previous visits', description: 'Earlier visit entries for this patient.', component: PreviousVisitsPanel },
  { sref: 'emr.cn.labresults', label: 'Lab results', description: 'Laboratory results viewer.', component: ResultsPanel },
  { sref: 'emr.cn.radiologyresults', label: 'Radiology results', description: 'Radiology results viewer.', component: ResultsPanel },
];

const BY_SREF = new Map(PANEL_TYPES.map((p) => [p.sref, p]));

/**
 * Question panels named after a clinical area ("Diagnosis", "Complaints & History", "Treatment Plan"…) but
 * with no questions configured yet show the matching standard panel(s) -- the same ones "New entry" uses --
 * so the doctor can still record that part of the visit. Every matching rule contributes (in order), so
 * "Complaints & History" gets CC / HPI and the medical / family / social history. "Other …" panels are
 * free-form add-ons to a standard panel that is usually on the form already, so they get no fallback.
 */
const NAME_FALLBACKS: Array<[RegExp, string]> = [
  [/vital/i, 'emr.cn.vital'],
  [/complaint|\bhpi\b|presenting|present(ing)? illness/i, 'emr.cn.clinicalnotes'],
  [/allerg/i, 'emr.cn.allergy'],
  [/complaints? (&|and) history|medical history|family history|social history|past history/i, 'emr.ws.history'],
  [/diagnos|impression|assessment/i, 'emr.cn.diagnosis'],
  [/prescription|medication|\brx\b/i, 'emr.cn.prescription'],
  [/investigation|lab order|\bservices?\b|procedure order/i, 'emr.cn.order'],
  [/treatment plan/i, 'emr.cn.treatmentplan'],
  [/admission/i, 'emr.ws.admission'],
  [/discharge/i, 'emr.ws.dischargesummary'],
  [/surgery|surgical advice|\bot booking/i, 'emr.ws.surgerybooking'],
  [/previous (visit|note)/i, 'emr.cn.previousnotes'],
  [/lab result/i, 'emr.cn.labresults'],
  [/radiology/i, 'emr.cn.radiologyresults'],
];

export type FallbackPanel = { label: string; component: React.FC<EmrPanelProps> };

export const builtInPanelsForName = (name?: string | null): FallbackPanel[] => {
  if (!name || /^\s*other\b/i.test(name)) return [];
  const srefs = Array.from(new Set(NAME_FALLBACKS.filter(([re]) => re.test(name)).map(([, sref]) => sref)));
  return srefs
    .map((sref) => BY_SREF.get(sref))
    .filter((t): t is PanelType => Boolean(t))
    .map((t) => ({ label: t.label, component: t.component }));
};

/** Section types (reference values) used by question panels: 2 question, 3 HPI, 4 ROS, 5 PE. */
export const QUESTION_SECTION_TYPES = [2, 3, 4, 5];

export const isQuestionSection = (s?: SectionMasterInfo | null) => !s?.SRef || s.SRef === QUESTION_SREF;

/** Picks the panel component for a tab. */
export const resolvePanel = (tab: WorkspaceTab): React.FC<EmrPanelProps> => {
  if (tab.section && isQuestionSection(tab.section)) return QuestionSectionPanel;
  return BY_SREF.get(tab.sref)?.component || LegacySectionPanel;
};

export const panelTypeLabel = (sref?: string | null) => (sref ? BY_SREF.get(sref)?.label : undefined);

export const savesFromToolbar = (tab: WorkspaceTab) => (tab.section && isQuestionSection(tab.section)) || Boolean(BY_SREF.get(tab.sref)?.savesFromToolbar);

/**
 * Tabs used when the visit has no EMR form yet (no visit entry started, or no forms configured) --
 * the core clinical panels, so the screen is never empty.
 */
export const DEFAULT_TABS: WorkspaceTab[] = [
  { key: 'default-vitals', label: 'Vitals', sref: 'emr.cn.vital', mandatory: true },
  { key: 'default-cchpi', label: 'CC / HPI', sref: 'emr.cn.clinicalnotes' },
  { key: 'default-diagnosis', label: 'Diagnosis', sref: 'emr.cn.diagnosis' },
  { key: 'default-allergy', label: 'Allergies', sref: 'emr.cn.allergy' },
  { key: 'default-history', label: 'Medical / Family / Social History', sref: 'emr.ws.history' },
  { key: 'default-services', label: 'Services', sref: 'emr.cn.order' },
  { key: 'default-prescriptions', label: 'Prescriptions', sref: 'emr.cn.prescription' },
  { key: 'default-delivery', label: 'Service Delivery', sref: 'emr.ws.servicedelivery' },
  { key: 'default-flowsheet', label: 'Vitals Flowsheet', sref: 'emr.ws.vitalflowsheet' },
  { key: 'default-previous', label: 'Previous Visits', sref: 'emr.cn.previousnotes' },
];
