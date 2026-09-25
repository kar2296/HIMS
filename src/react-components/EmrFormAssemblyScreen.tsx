import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';
import { Input, Textarea } from '../components/ui/Input';

export type FieldInputType =
  | 'TEXT'
  | 'NUMBER'
  | 'TEXTAREA'
  | 'DROPDOWN'
  | 'CHECKBOX'
  | 'DATE'
  | 'RADIO'
  | 'ODONTOGRAM'
  | 'VA_CHART';

export type RequirementType = 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL';

export type PanelCategoryType = 'STANDARD' | 'CUSTOM';

export interface FormFieldDefinition {
  id: string;
  fieldCode: string;
  fieldLabel: string;
  fieldType: FieldInputType;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  unit?: string;
  isRequired: boolean;
  requirementType: RequirementType;
  order: number;
}

export interface FormAssemblySection {
  id: string;
  sectionTitle: string;
  fieldsCount: number;
  isRequired: boolean;
  requirementType: RequirementType;
  order: number;
  fields: FormFieldDefinition[];
}

export interface SpecialtyFormTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  specialty: string;
  panelType: PanelCategoryType;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  assignedDepartments: string[];
  assignedDoctors: string[];
  sections: FormAssemblySection[];
}

export interface EmrFormAssemblyScreenProps {
  onSaveTemplate?: (template: SpecialtyFormTemplate) => void;
  onAssignDepartment?: (templateId: string, departments: string[]) => void;
}

export const EmrFormAssemblyScreen: React.FC<EmrFormAssemblyScreenProps> = ({
  onSaveTemplate,
}) => {
  const [templates, setTemplates] = useState<SpecialtyFormTemplate[]>([
    // ==========================================
    // STANDARD (BUILT-IN / SYSTEM CORE) PANELS
    // ==========================================
    {
      id: 'TPL-STD-01',
      templateCode: 'OPD-GEN-01',
      templateName: 'General OPD Assessment Form',
      specialty: 'General Medicine',
      panelType: 'STANDARD',
      version: 'v2.4',
      status: 'ACTIVE',
      assignedDepartments: ['General OPD', 'Family Medicine', 'Internal Medicine'],
      assignedDoctors: ['Dr. Rajesh Kumar', 'Dr. Mohammed Al Nuaimi'],
      sections: [
        {
          id: 'SEC-1',
          sectionTitle: 'Chief Complaints & History of Present Illness (HPI)',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'F1-1', fieldCode: 'FLD_CHIEF_COMPLAINT', fieldLabel: 'Primary Complaint', fieldType: 'TEXT', placeholder: 'e.g. Fever with chills for 3 days', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F1-2', fieldCode: 'FLD_ONSET_DURATION', fieldLabel: 'Onset Duration', fieldType: 'NUMBER', unit: 'Days', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F1-3', fieldCode: 'FLD_SEVERITY', fieldLabel: 'Pain / Symptom Severity', fieldType: 'DROPDOWN', options: ['Mild', 'Moderate', 'Severe', 'Excruciating'], isRequired: false, requirementType: 'OPTIONAL', order: 3 },
            { id: 'F1-4', fieldCode: 'FLD_HPI_NARRATIVE', fieldLabel: 'Detailed History of Present Illness', fieldType: 'TEXTAREA', placeholder: 'Chronological progression of symptoms...', isRequired: false, requirementType: 'OPTIONAL', order: 4 },
          ],
        },
        {
          id: 'SEC-2',
          sectionTitle: 'Systemic Physical Examination',
          fieldsCount: 8,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'F2-1', fieldCode: 'FLD_GEN_APPEARANCE', fieldLabel: 'General Appearance', fieldType: 'DROPDOWN', options: ['Well Nourished & Alert', 'Pale / Anemic', 'Febrile & Flushed', 'Toxic / Distressed', 'Lethargic'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F2-2', fieldCode: 'FLD_PULSE_RATE', fieldLabel: 'Pulse Rate', fieldType: 'NUMBER', unit: 'bpm', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F2-3', fieldCode: 'FLD_BP_SYS', fieldLabel: 'Systolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'F2-4', fieldCode: 'FLD_BP_DIA', fieldLabel: 'Diastolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', isRequired: true, requirementType: 'MANDATORY', order: 4 },
            { id: 'F2-5', fieldCode: 'FLD_RESP_RATE', fieldLabel: 'Respiratory Rate', fieldType: 'NUMBER', unit: 'breaths/min', isRequired: true, requirementType: 'MANDATORY', order: 5 },
            { id: 'F2-6', fieldCode: 'FLD_CVS_EXAM', fieldLabel: 'Cardiovascular (Heart Sounds)', fieldType: 'TEXT', placeholder: 'S1, S2 heard, no murmur', isRequired: false, requirementType: 'OPTIONAL', order: 6 },
            { id: 'F2-7', fieldCode: 'FLD_RS_EXAM', fieldLabel: 'Respiratory (Chest / Lungs)', fieldType: 'TEXT', placeholder: 'Bilateral vesicular breath sounds, no wheeze', isRequired: false, requirementType: 'OPTIONAL', order: 7 },
            { id: 'F2-8', fieldCode: 'FLD_PA_EXAM', fieldLabel: 'Abdomen (Per Abdomen)', fieldType: 'TEXT', placeholder: 'Soft, non-tender, no organomegaly', isRequired: false, requirementType: 'OPTIONAL', order: 8 },
          ],
        },
        {
          id: 'SEC-3',
          sectionTitle: 'Clinical Impression & ICD-10 Diagnosis',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 3,
          fields: [
            { id: 'F3-1', fieldCode: 'FLD_PROV_DIAGNOSIS', fieldLabel: 'Provisional Clinical Diagnosis', fieldType: 'TEXT', placeholder: 'Acute Upper Respiratory Tract Infection', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F3-2', fieldCode: 'FLD_ICD10_CODE', fieldLabel: 'ICD-10 Primary Code', fieldType: 'TEXT', placeholder: 'J06.9', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F3-3', fieldCode: 'FLD_IS_CHRONIC', fieldLabel: 'Chronic Condition / Comorbidity', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 3 },
          ],
        },
        {
          id: 'SEC-4',
          sectionTitle: 'Plan of Care & Patient Advice',
          fieldsCount: 2,
          isRequired: false,
          requirementType: 'OPTIONAL',
          order: 4,
          fields: [
            { id: 'F4-1', fieldCode: 'FLD_CARE_PLAN', fieldLabel: 'Clinical Treatment Plan & Instructions', fieldType: 'TEXTAREA', placeholder: 'Dietary advice, rest, hydration, warning signs...', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F4-2', fieldCode: 'FLD_REVIEW_TIMELINE', fieldLabel: 'Follow-up Review Schedule', fieldType: 'DROPDOWN', options: ['3 Days', '5 Days', '1 Week', '2 Weeks', '1 Month', 'PRN (As Needed)'], isRequired: false, requirementType: 'OPTIONAL', order: 2 },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-02',
      templateCode: 'IPD-NURSE-01',
      templateName: 'Inpatient Bedside & eMAR Nursing Station',
      specialty: 'Inpatient Nursing',
      panelType: 'STANDARD',
      version: 'v2.1',
      status: 'ACTIVE',
      assignedDepartments: ['General Ward', 'ICU', 'CCU', 'Post-Op Recovery'],
      assignedDoctors: ['Inpatient Nursing Team', 'Dr. Alexander Reed'],
      sections: [
        {
          id: 'SEC-N1',
          sectionTitle: 'Vital Signs & 24h Monitoring Trajectory',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'FN-1', fieldCode: 'FLD_IPD_BP', fieldLabel: 'Non-Invasive Blood Pressure (NIBP)', fieldType: 'TEXT', placeholder: '120/80', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FN-2', fieldCode: 'FLD_IPD_PULSE', fieldLabel: 'Pulse Rate', fieldType: 'NUMBER', unit: 'bpm', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FN-3', fieldCode: 'FLD_IPD_TEMP', fieldLabel: 'Core Temperature', fieldType: 'NUMBER', unit: '°C', isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'FN-4', fieldCode: 'FLD_IPD_SPO2', fieldLabel: 'Oxygen Saturation (SpO2)', fieldType: 'NUMBER', unit: '%', isRequired: true, requirementType: 'MANDATORY', order: 4 },
            { id: 'FN-5', fieldCode: 'FLD_IPD_O2_SUPPORT', fieldLabel: 'Supplemental O2 Flow Rate', fieldType: 'TEXT', placeholder: 'Room Air / 2L via NC', isRequired: false, requirementType: 'CONDITIONAL', order: 5 },
          ],
        },
        {
          id: 'SEC-N2',
          sectionTitle: 'Intake & Output Fluid Balance Summary',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'FN-21', fieldCode: 'FLD_TOTAL_INTAKE', fieldLabel: '24-Hour Cumulative Intake', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FN-22', fieldCode: 'FLD_TOTAL_OUTPUT', fieldLabel: '24-Hour Cumulative Output', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FN-23', fieldCode: 'FLD_NET_BALANCE', fieldLabel: 'Net Fluid Balance (+/-)', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 3 },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-03',
      templateCode: 'ER-TRIAGE-01',
      templateName: 'Emergency Triage & Rapid Resuscitation',
      specialty: 'Emergency Medicine',
      panelType: 'STANDARD',
      version: 'v1.9',
      status: 'ACTIVE',
      assignedDepartments: ['Emergency Department', 'Trauma Resuscitation'],
      assignedDoctors: ['Dr. Emily Watson', 'Emergency Triage Team'],
      sections: [
        {
          id: 'SEC-ER1',
          sectionTitle: 'Emergency Severity Index (ESI) Triage Classification',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'FER-1', fieldCode: 'FLD_ESI_LEVEL', fieldLabel: 'ESI Triage Level', fieldType: 'DROPDOWN', options: ['Level 1 - Resuscitation (Immediate)', 'Level 2 - Emergent (High Risk)', 'Level 3 - Urgent (Multiple Resources)', 'Level 4 - Less Urgent', 'Level 5 - Non-Urgent'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FER-2', fieldCode: 'FLD_TRIAGE_CHIEF', fieldLabel: 'Triage Acuity Complaint', fieldType: 'TEXT', placeholder: 'Acute chest pain, severe trauma, shortness of breath', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FER-3', fieldCode: 'FLD_GCS_TOTAL', fieldLabel: 'Glasgow Coma Scale Total', fieldType: 'NUMBER', placeholder: '15', isRequired: true, requirementType: 'MANDATORY', order: 3 },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-04',
      templateCode: 'DISCH-SUM-01',
      templateName: 'Inpatient Hospital Discharge Summary',
      specialty: 'Medical Records / Inpatient',
      panelType: 'STANDARD',
      version: 'v3.0',
      status: 'ACTIVE',
      assignedDepartments: ['All Inpatient Wards', 'ICU', 'Cardiology', 'Surgery'],
      assignedDoctors: ['Dr. Alexander Reed', 'Discharge Coordination Team'],
      sections: [
        {
          id: 'SEC-DS1',
          sectionTitle: 'Hospital Course & Inpatient Synopsis',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'FDS-1', fieldCode: 'FLD_DS_ADMIT_REASON', fieldLabel: 'Reason for Admission', fieldType: 'TEXT', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FDS-2', fieldCode: 'FLD_DS_COURSE', fieldLabel: 'Hospital Progression & Summary', fieldType: 'TEXTAREA', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FDS-3', fieldCode: 'FLD_DS_SURGERY', fieldLabel: 'Surgical / Invasive Procedures Performed', fieldType: 'TEXTAREA', isRequired: false, requirementType: 'OPTIONAL', order: 3 },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-05',
      templateCode: 'SOAP-NOTE-01',
      templateName: 'Physician SOAP Progress & Consultation Note',
      specialty: 'Clinical Practice',
      panelType: 'STANDARD',
      version: 'v2.0',
      status: 'ACTIVE',
      assignedDepartments: ['All Outpatient & Inpatient Specialties'],
      assignedDoctors: ['All Attending Clinicians'],
      sections: [
        {
          id: 'SEC-SP1',
          sectionTitle: 'Structured SOAP Note',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'FSP-1', fieldCode: 'FLD_SOAP_S', fieldLabel: 'Subjective (Patient Reported History & Symptoms)', fieldType: 'TEXTAREA', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FSP-2', fieldCode: 'FLD_SOAP_O', fieldLabel: 'Objective (Physical Exam, Labs & Diagnostics)', fieldType: 'TEXTAREA', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FSP-3', fieldCode: 'FLD_SOAP_A', fieldLabel: 'Assessment (Clinical Impression & Differential Diagnosis)', fieldType: 'TEXTAREA', isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'FSP-4', fieldCode: 'FLD_SOAP_P', fieldLabel: 'Plan (Prescriptions, Orders, Referrals & Followup)', fieldType: 'TEXTAREA', isRequired: true, requirementType: 'MANDATORY', order: 4 },
          ],
        },
      ],
    },

    // ==========================================
    // CUSTOM SPECIALTY / DYNAMIC PANELS
    // ==========================================
    {
      id: 'TPL-CUST-01',
      templateCode: 'DENT-01',
      templateName: 'Dental Examination & Odontogram Chart',
      specialty: 'Dental / Maxillofacial',
      panelType: 'CUSTOM',
      version: 'v1.8',
      status: 'ACTIVE',
      assignedDepartments: ['Dental Clinic', 'Orthodontics'],
      assignedDoctors: ['Dr. Tariq Al Mansoori'],
      sections: [
        {
          id: 'SEC-11',
          sectionTitle: 'Dental Chief Complaint & Pain Score (VAS 1-10)',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'F11-1', fieldCode: 'FLD_DENT_COMPLAINT', fieldLabel: 'Chief Dental Concern', fieldType: 'TEXT', placeholder: 'e.g. Throbbing pain in lower right molar', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F11-2', fieldCode: 'FLD_DENT_PAIN_SCORE', fieldLabel: 'Visual Analogue Pain Scale (VAS)', fieldType: 'DROPDOWN', options: ['0 - No Pain', '1-3 Mild Pain', '4-6 Moderate Pain', '7-9 Severe Pain', '10 - Worst Pain'], isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F11-3', fieldCode: 'FLD_DENT_TRIGGER', fieldLabel: 'Pain Trigger', fieldType: 'DROPDOWN', options: ['Thermal (Cold/Hot)', 'Mastication / Chewing', 'Spontaneous / Night Pain', 'Sweet / Sour Foods'], isRequired: false, requirementType: 'OPTIONAL', order: 3 },
          ],
        },
        {
          id: 'SEC-12',
          sectionTitle: 'Interactive Adult / Child 32-Tooth Odontogram Grid',
          fieldsCount: 2,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'F12-1', fieldCode: 'FLD_ODONTOGRAM_CHART', fieldLabel: 'Adult 32-Tooth FDI Charting Grid', fieldType: 'ODONTOGRAM', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F12-2', fieldCode: 'FLD_TOOTH_FINDINGS', fieldLabel: 'Pathology Summary (Caries, Missing, Restored, RCT)', fieldType: 'TEXTAREA', placeholder: 'Tooth #16: Deep occlusal caries; Tooth #48: Impacted', isRequired: false, requirementType: 'OPTIONAL', order: 2 },
          ],
        },
        {
          id: 'SEC-13',
          sectionTitle: 'Periodontal Screening & Plaque Index',
          fieldsCount: 4,
          isRequired: false,
          requirementType: 'OPTIONAL',
          order: 3,
          fields: [
            { id: 'F13-1', fieldCode: 'FLD_PLAQUE_INDEX', fieldLabel: 'Plaque Index Score', fieldType: 'DROPDOWN', options: ['Score 0 - Good Oral Hygiene', 'Score 1 - Mild Plaque', 'Score 2 - Moderate Plaque', 'Score 3 - Heavy Calculus'], isRequired: false, requirementType: 'OPTIONAL', order: 1 },
            { id: 'F13-2', fieldCode: 'FLD_GINGIVAL_BLEEDING', fieldLabel: 'Gingival Bleeding on Probing (BOP)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'OPTIONAL', order: 2 },
            { id: 'F13-3', fieldCode: 'FLD_POCKET_DEPTH', fieldLabel: 'Max Probing Pocket Depth', fieldType: 'NUMBER', unit: 'mm', isRequired: false, requirementType: 'CONDITIONAL', order: 3 },
            { id: 'F13-4', fieldCode: 'FLD_MOBILITY_GRADE', fieldLabel: 'Tooth Mobility Grade', fieldType: 'DROPDOWN', options: ['None', 'Grade I (<1mm horizontal)', 'Grade II (>1mm horizontal)', 'Grade III (Vertical mobility)'], isRequired: false, requirementType: 'OPTIONAL', order: 4 },
          ],
        },
        {
          id: 'SEC-14',
          sectionTitle: 'Procedure Treatment Plan (Extraction, RCT, Scaling)',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 4,
          fields: [
            { id: 'F14-1', fieldCode: 'FLD_DENT_PROCEDURE', fieldLabel: 'Proposed Dental Procedure', fieldType: 'DROPDOWN', options: ['Ultrasonic Scaling & Polishing', 'Root Canal Treatment (RCT)', 'Simple Tooth Extraction', 'Surgical Extraction / Impaction', 'Composite Resin Restoration', 'Crown & Bridge Preparation', 'Dental Implant'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F14-2', fieldCode: 'FLD_TARGET_TEETH', fieldLabel: 'Target Tooth Number(s) (FDI)', fieldType: 'TEXT', placeholder: 'e.g. 16, 26, 48', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F14-3', fieldCode: 'FLD_ANESTHESIA_TYPE', fieldLabel: 'Local Anesthetic Technique', fieldType: 'DROPDOWN', options: ['Infiltration Anesthesia', 'Inferior Alveolar Nerve Block (IANB)', 'Mental Nerve Block', 'Topical Benzocaine Only'], isRequired: false, requirementType: 'OPTIONAL', order: 3 },
            { id: 'F14-4', fieldCode: 'FLD_DENT_CONSENT', fieldLabel: 'Informed Consent Signed by Patient', fieldType: 'CHECKBOX', isRequired: true, requirementType: 'MANDATORY', order: 4 },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-02',
      templateCode: 'EYE-OPT-01',
      templateName: 'Ophthalmology & Optometry Refraction Form',
      specialty: 'Ophthalmology',
      panelType: 'CUSTOM',
      version: 'v3.1',
      status: 'ACTIVE',
      assignedDepartments: ['Eye Clinic', 'Optometry Dept'],
      assignedDoctors: ['Dr. Sarah Jenkins'],
      sections: [
        {
          id: 'SEC-21',
          sectionTitle: 'Visual Acuity (Uncorrected / Corrected - OD / OS)',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'F21-1', fieldCode: 'FLD_VA_OD_UC', fieldLabel: 'Right Eye (OD) Uncorrected Snellen Acuity', fieldType: 'DROPDOWN', options: ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'Counting Fingers (CF)', 'Hand Motion (HM)', 'Light Perception (LP)'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F21-2', fieldCode: 'FLD_VA_OS_UC', fieldLabel: 'Left Eye (OS) Uncorrected Snellen Acuity', fieldType: 'DROPDOWN', options: ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'Counting Fingers (CF)', 'Hand Motion (HM)', 'Light Perception (LP)'], isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F21-3', fieldCode: 'FLD_VA_OD_PINHOLE', fieldLabel: 'Right Eye (OD) With Pinhole', fieldType: 'TEXT', placeholder: '6/6', isRequired: false, requirementType: 'CONDITIONAL', order: 3 },
            { id: 'F21-4', fieldCode: 'FLD_VA_OS_PINHOLE', fieldLabel: 'Left Eye (OS) With Pinhole', fieldType: 'TEXT', placeholder: '6/6', isRequired: false, requirementType: 'CONDITIONAL', order: 4 },
          ],
        },
        {
          id: 'SEC-22',
          sectionTitle: 'Auto-Refractometer & Keratometry Readings',
          fieldsCount: 6,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'F22-1', fieldCode: 'FLD_OD_SPHERE', fieldLabel: 'OD Sphere (SPH)', fieldType: 'NUMBER', unit: 'Diopters', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F22-2', fieldCode: 'FLD_OD_CYLINDER', fieldLabel: 'OD Cylinder (CYL)', fieldType: 'NUMBER', unit: 'Diopters', isRequired: false, requirementType: 'OPTIONAL', order: 2 },
            { id: 'F22-3', fieldCode: 'FLD_OD_AXIS', fieldLabel: 'OD Axis', fieldType: 'NUMBER', unit: 'Degrees (°)', isRequired: false, requirementType: 'OPTIONAL', order: 3 },
            { id: 'F22-4', fieldCode: 'FLD_OS_SPHERE', fieldLabel: 'OS Sphere (SPH)', fieldType: 'NUMBER', unit: 'Diopters', isRequired: true, requirementType: 'MANDATORY', order: 4 },
            { id: 'F22-5', fieldCode: 'FLD_OS_CYLINDER', fieldLabel: 'OS Cylinder (CYL)', fieldType: 'NUMBER', unit: 'Diopters', isRequired: false, requirementType: 'OPTIONAL', order: 5 },
            { id: 'F22-6', fieldCode: 'FLD_OS_AXIS', fieldLabel: 'OS Axis', fieldType: 'NUMBER', unit: 'Degrees (°)', isRequired: false, requirementType: 'OPTIONAL', order: 6 },
          ],
        },
        {
          id: 'SEC-23',
          sectionTitle: 'Slit Lamp & Dilated Fundus Examination',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 3,
          fields: [
            { id: 'F23-1', fieldCode: 'FLD_CORNEA_EXAM', fieldLabel: 'Corneal Clarity & Epithelium', fieldType: 'DROPDOWN', options: ['Clear & Lustrous', 'Epithelial Defect / Abrasion', 'Corneal Infiltrate / Ulcer', 'Stromal Edema', 'Old Scar / Opacity'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F23-2', fieldCode: 'FLD_LENS_STATUS', fieldLabel: 'Crystalline Lens Status', fieldType: 'DROPDOWN', options: ['Clear Phakic', 'Nuclear Sclerosis NS Grade 1-2', 'Cortical Cataract', 'Posterior Subcapsular Cataract', 'Pseudophakic (PCIOL in situ)'], isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F23-3', fieldCode: 'FLD_CUP_DISC_RATIO', fieldLabel: 'Optic Disc Cup-to-Disc Ratio (C:D)', fieldType: 'NUMBER', placeholder: '0.3', isRequired: false, requirementType: 'OPTIONAL', order: 3 },
            { id: 'F23-4', fieldCode: 'FLD_MACULA_RETINA', fieldLabel: 'Macula & Peripheral Retina', fieldType: 'TEXT', placeholder: 'Normal foveal reflex, no hemorrhage or drusen', isRequired: false, requirementType: 'OPTIONAL', order: 4 },
          ],
        },
        {
          id: 'SEC-24',
          sectionTitle: 'Intraocular Pressure (IOP - Goldmann / Non-Contact)',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 4,
          fields: [
            { id: 'F24-1', fieldCode: 'FLD_IOP_OD', fieldLabel: 'Right Eye (OD) IOP', fieldType: 'NUMBER', unit: 'mmHg', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F24-2', fieldCode: 'FLD_IOP_OS', fieldLabel: 'Left Eye (OS) IOP', fieldType: 'NUMBER', unit: 'mmHg', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F24-3', fieldCode: 'FLD_IOP_METHOD', fieldLabel: 'Tonometry Measurement Method', fieldType: 'DROPDOWN', options: ['Goldmann Applanation Tonometry (GAT)', 'Non-Contact Air-Puff (NCT)', 'iCare Rebound Tonometer', 'Tono-Pen'], isRequired: false, requirementType: 'OPTIONAL', order: 3 },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-03',
      templateCode: 'OBGYN-ANC-01',
      templateName: 'Antenatal Care (ANC) & Obstetric Form',
      specialty: 'Obstetrics & Gynecology',
      panelType: 'CUSTOM',
      version: 'v2.0',
      status: 'ACTIVE',
      assignedDepartments: ['OB/GYN Clinic', 'Maternity Ward'],
      assignedDoctors: ['Dr. Fatima Al Zahra'],
      sections: [
        {
          id: 'SEC-31',
          sectionTitle: 'Obstetric History (G, P, L, A) & LMP / EDD Calculator',
          fieldsCount: 6,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'F31-1', fieldCode: 'FLD_GRAVIDA', fieldLabel: 'Gravida (G)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F31-2', fieldCode: 'FLD_PARA', fieldLabel: 'Para (P)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F31-3', fieldCode: 'FLD_LIVING', fieldLabel: 'Living (L)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'F31-4', fieldCode: 'FLD_ABORTION', fieldLabel: 'Abortions (A)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 4 },
            { id: 'F31-5', fieldCode: 'FLD_LMP_DATE', fieldLabel: 'Last Menstrual Period (LMP)', fieldType: 'DATE', isRequired: true, requirementType: 'MANDATORY', order: 5 },
            { id: 'F31-6', fieldCode: 'FLD_EDD_DATE', fieldLabel: 'Estimated Date of Delivery (EDD)', fieldType: 'DATE', isRequired: true, requirementType: 'MANDATORY', order: 6 },
          ],
        },
        {
          id: 'SEC-32',
          sectionTitle: 'Antenatal Visit Matrix (Symphysio-Fundal Height, FHR, Presentation)',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'F32-1', fieldCode: 'FLD_SFH_HEIGHT', fieldLabel: 'Symphysis-Fundal Height (SFH)', fieldType: 'NUMBER', unit: 'cm', isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F32-2', fieldCode: 'FLD_FETAL_HR', fieldLabel: 'Fetal Heart Rate (FHR)', fieldType: 'NUMBER', unit: 'bpm', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F32-3', fieldCode: 'FLD_FETAL_PRES', fieldLabel: 'Fetal Presentation', fieldType: 'DROPDOWN', options: ['Cephalic / Vertex', 'Breech (Frank / Complete)', 'Transverse Lie', 'Unstable Lie'], isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'F32-4', fieldCode: 'FLD_FETAL_MOVEMENTS', fieldLabel: 'Fetal Movements (Quickening)', fieldType: 'DROPDOWN', options: ['Active & Normal (>10 kicks/2h)', 'Reduced Fetal Movements', 'Absent'], isRequired: true, requirementType: 'MANDATORY', order: 4 },
          ],
        },
        {
          id: 'SEC-33',
          sectionTitle: 'High-Risk Pregnancy Checklist (GDM, PIH, Preeclampsia)',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'CONDITIONAL',
          order: 3,
          fields: [
            { id: 'F33-1', fieldCode: 'FLD_HR_GDM', fieldLabel: 'Gestational Diabetes Mellitus (GDM)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 1 },
            { id: 'F33-2', fieldCode: 'FLD_HR_PIH', fieldLabel: 'Pregnancy-Induced Hypertension (PIH / Preeclampsia)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 2 },
            { id: 'F33-3', fieldCode: 'FLD_HR_PREV_CS', fieldLabel: 'Previous Lower Segment Cesarean Section (LSCS)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 3 },
            { id: 'F33-4', fieldCode: 'FLD_HR_MULTIPLE', fieldLabel: 'Multiple Gestation (Twins / Triplets)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 4 },
            { id: 'F33-5', fieldCode: 'FLD_HR_RH_NEG', fieldLabel: 'Rh-Negative Blood Group (Anti-D Required)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 5 },
          ],
        },
        {
          id: 'SEC-34',
          sectionTitle: 'Ultrasound Fetal Biometry (BPD, HC, AC, FL, EFW)',
          fieldsCount: 5,
          isRequired: false,
          requirementType: 'OPTIONAL',
          order: 4,
          fields: [
            { id: 'F34-1', fieldCode: 'FLD_US_BPD', fieldLabel: 'Biparietal Diameter (BPD)', fieldType: 'NUMBER', unit: 'mm', isRequired: false, requirementType: 'OPTIONAL', order: 1 },
            { id: 'F34-2', fieldCode: 'FLD_US_HC', fieldLabel: 'Head Circumference (HC)', fieldType: 'NUMBER', unit: 'mm', isRequired: false, requirementType: 'OPTIONAL', order: 2 },
            { id: 'F34-3', fieldCode: 'FLD_US_AC', fieldLabel: 'Abdominal Circumference (AC)', fieldType: 'NUMBER', unit: 'mm', isRequired: false, requirementType: 'OPTIONAL', order: 3 },
            { id: 'F34-4', fieldCode: 'FLD_US_FL', fieldLabel: 'Femur Length (FL)', fieldType: 'NUMBER', unit: 'mm', isRequired: false, requirementType: 'OPTIONAL', order: 4 },
            { id: 'F34-5', fieldCode: 'FLD_US_EFW', fieldLabel: 'Estimated Fetal Weight (EFW)', fieldType: 'NUMBER', unit: 'Grams', isRequired: false, requirementType: 'OPTIONAL', order: 5 },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-04',
      templateCode: 'ANES-PREOP-01',
      templateName: 'Pre-Anesthetic Evaluation (PAC) & Risk Stratification',
      specialty: 'Anesthesiology',
      panelType: 'CUSTOM',
      version: 'v1.5',
      status: 'ACTIVE',
      assignedDepartments: ['Anesthesia Dept', 'OT Complex'],
      assignedDoctors: ['Dr. Vikram Sharma'],
      sections: [
        {
          id: 'SEC-41',
          sectionTitle: 'ASA Physical Status Classification (ASA I - VI)',
          fieldsCount: 2,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'F41-1', fieldCode: 'FLD_ASA_CLASS', fieldLabel: 'ASA Physical Status', fieldType: 'DROPDOWN', options: ['ASA I - Normal Healthy Patient', 'ASA II - Mild Systemic Disease', 'ASA III - Severe Systemic Disease', 'ASA IV - Severe Disease with Threat to Life', 'ASA V - Moribund Patient', 'ASA VI - Brain Dead Organ Donor'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F41-2', fieldCode: 'FLD_EMERGENCY_MODIFIER', fieldLabel: 'Emergency Case ("E" Modifier)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 2 },
          ],
        },
        {
          id: 'SEC-42',
          sectionTitle: 'Airway Assessment (Mallampati I-IV, Thyromental Distance)',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          fields: [
            { id: 'F42-1', fieldCode: 'FLD_MALLAMPATI', fieldLabel: 'Modified Mallampati Class', fieldType: 'DROPDOWN', options: ['Class I - Soft palate, fauces, uvula, pillars visible', 'Class II - Soft palate, fauces, uvula visible', 'Class III - Soft palate, base of uvula visible', 'Class IV - Soft palate not visible at all (Difficult Airway)'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F42-2', fieldCode: 'FLD_THYROMENTAL_DIST', fieldLabel: 'Thyromental Distance', fieldType: 'NUMBER', unit: 'cm (Normal > 6.5 cm)', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F42-3', fieldCode: 'FLD_MOUTH_OPENING', fieldLabel: 'Inter-Incisor Mouth Opening', fieldType: 'NUMBER', unit: 'cm (Normal >= 4 cm)', isRequired: true, requirementType: 'MANDATORY', order: 3 },
            { id: 'F42-4', fieldCode: 'FLD_DENTITION_STATUS', fieldLabel: 'Dentition & Dental Hygiene', fieldType: 'DROPDOWN', options: ['Intact Natural Teeth', 'Loose / Carious Incisors', 'Fixed Bridge / Crown', 'Full Upper / Lower Dentures', 'Edentulous'], isRequired: false, requirementType: 'OPTIONAL', order: 4 },
          ],
        },
        {
          id: 'SEC-43',
          sectionTitle: 'Cardiovascular & Pulmonary Risk Assessment',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 3,
          fields: [
            { id: 'F43-1', fieldCode: 'FLD_METS_CAPACITY', fieldLabel: 'Functional Capacity (METS)', fieldType: 'DROPDOWN', options: ['> 4 METS (Can climb 2 flights of stairs)', '< 4 METS (Poor functional capacity)'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F43-2', fieldCode: 'FLD_CARDIAC_RISK', fieldLabel: 'Cardiac History / Risk Markers', fieldType: 'TEXT', placeholder: 'Prior MI, stents, pacemakers, hypertension...', isRequired: false, requirementType: 'OPTIONAL', order: 2 },
            { id: 'F43-3', fieldCode: 'FLD_PULM_RISK', fieldLabel: 'Pulmonary / Airway Markers', fieldType: 'DROPDOWN', options: ['No Respiratory Symptoms', 'Active Asthma / Bronchospasm', 'COPD / Emphysema', 'Obstructive Sleep Apnea (OSA) / STOP-BANG High Risk', 'Recent Upper Respiratory Tract Infection (< 2 weeks)'], isRequired: false, requirementType: 'OPTIONAL', order: 3 },
          ],
        },
        {
          id: 'SEC-44',
          sectionTitle: 'Anesthetic Plan & Informed Consent Confirmation',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 4,
          fields: [
            { id: 'F44-1', fieldCode: 'FLD_PRIMARY_TECHNIQUE', fieldLabel: 'Primary Anesthetic Technique', fieldType: 'DROPDOWN', options: ['General Anesthesia (GA) with ETT', 'GA with Laryngeal Mask Airway (LMA)', 'Spinal Subarachnoid Block (SAB)', 'Epidural Anesthesia', 'Combined Spinal Epidural (CSE)', 'Peripheral Regional Nerve Block', 'Monitored Anesthesia Care (MAC) Sedation'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'F44-2', fieldCode: 'FLD_NPO_STATUS', fieldLabel: 'NPO (Fasting) Compliance Verified', fieldType: 'CHECKBOX', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'F44-3', fieldCode: 'FLD_PAC_CONSENT', fieldLabel: 'Informed Anesthetic Consent Signed', fieldType: 'CHECKBOX', isRequired: true, requirementType: 'MANDATORY', order: 3 },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-05',
      templateCode: 'PHYSIO-01',
      templateName: 'Physiotherapy & Musculoskeletal ROM Matrix',
      specialty: 'Physiotherapy & Rehabilitation',
      panelType: 'CUSTOM',
      version: 'v1.4',
      status: 'ACTIVE',
      assignedDepartments: ['Physiotherapy OPD', 'Rehabilitation Center'],
      assignedDoctors: ['Dr. Maya Patel'],
      sections: [
        {
          id: 'SEC-PH1',
          sectionTitle: 'Joint Range of Motion (ROM) & Goniometry',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            { id: 'FPH-1', fieldCode: 'FLD_TARGET_JOINT', fieldLabel: 'Target Joint / Extremity', fieldType: 'DROPDOWN', options: ['Shoulder (Flexion/Abduction)', 'Knee (Flexion/Extension)', 'Hip (Internal/External)', 'Cervical Spine', 'Lumbar Spine'], isRequired: true, requirementType: 'MANDATORY', order: 1 },
            { id: 'FPH-2', fieldCode: 'FLD_ROM_DEGREES', fieldLabel: 'Active Range of Motion', fieldType: 'NUMBER', unit: 'Degrees (°)', isRequired: true, requirementType: 'MANDATORY', order: 2 },
            { id: 'FPH-3', fieldCode: 'FLD_MUSCLE_GRADE', fieldLabel: 'Medical Research Council (MRC) Muscle Grade', fieldType: 'DROPDOWN', options: ['Grade 5 - Normal Strength', 'Grade 4 - Active Against Resistance', 'Grade 3 - Active Against Gravity', 'Grade 2 - Active Gravity Eliminated', 'Grade 1 - Trace Muscle Flicker', 'Grade 0 - Complete Paralysis'], isRequired: true, requirementType: 'MANDATORY', order: 3 },
          ],
        },
      ],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<SpecialtyFormTemplate>(templates[0]);
  const [panelCategoryFilter, setPanelCategoryFilter] = useState<'ALL' | 'STANDARD' | 'CUSTOM'>('ALL');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionReq, setNewSectionReq] = useState<RequirementType>('MANDATORY');
  const [saveToast, setSaveToast] = useState(false);

  // New Custom Panel Creation Modal
  const [showNewPanelModal, setShowNewPanelModal] = useState(false);
  const [newPanelCode, setNewPanelCode] = useState('');
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelSpecialty, setNewPanelSpecialty] = useState('');
  const [newPanelDepartments, setNewPanelDepartments] = useState('');

  // Field configuration modal state
  const [editingSection, setEditingSection] = useState<FormAssemblySection | null>(null);
  const [fieldModalTab, setFieldModalTab] = useState<'FIELDS' | 'PREVIEW'>('FIELDS');

  // New field input form state inside modal
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldInputType>('TEXT');
  const [newFieldUnit, setNewFieldUnit] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldReqType, setNewFieldReqType] = useState<RequirementType>('MANDATORY');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');

  const filteredTemplates = templates
    .filter((t) => panelCategoryFilter === 'ALL' || t.panelType === panelCategoryFilter)
    .filter(
      (t) =>
        selectedDoctorFilter === 'ALL' ||
        (t.assignedDoctors || []).some((d) => d.toLowerCase().includes(selectedDoctorFilter.toLowerCase()))
    )
    .filter(
      (t) =>
        t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedDoctors || []).some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Create new Custom Panel
  const handleCreateCustomPanel = () => {
    if (!newPanelName.trim() || !newPanelCode.trim()) return;
    const depts = newPanelDepartments
      ? newPanelDepartments.split(',').map((d) => d.trim()).filter(Boolean)
      : ['General Specialty OPD'];

    const newTemplate: SpecialtyFormTemplate = {
      id: `TPL-CUST-${Date.now().toString().slice(-4)}`,
      templateCode: newPanelCode.trim().toUpperCase(),
      templateName: newPanelName.trim(),
      specialty: newPanelSpecialty.trim() || 'General Specialty',
      panelType: 'CUSTOM',
      version: 'v1.0',
      status: 'ACTIVE',
      assignedDepartments: depts,
      assignedDoctors: ['All Attending Specialists'],
      sections: [
        {
          id: `SEC-${Date.now()}-1`,
          sectionTitle: 'Clinical Assessment & Findings',
          fieldsCount: 2,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          fields: [
            {
              id: `F-${Date.now()}-1`,
              fieldCode: 'FLD_PRIMARY_FINDING',
              fieldLabel: 'Primary Clinical Finding',
              fieldType: 'TEXT',
              placeholder: 'Enter clinical observations...',
              isRequired: true,
              requirementType: 'MANDATORY',
              order: 1,
            },
            {
              id: `F-${Date.now()}-2`,
              fieldCode: 'FLD_CLINICAL_NOTES',
              fieldLabel: 'Specialty Notes & Instructions',
              fieldType: 'TEXTAREA',
              placeholder: 'Enter detailed notes...',
              isRequired: false,
              requirementType: 'OPTIONAL',
              order: 2,
            },
          ],
        },
      ],
    };

    const updatedList = [...templates, newTemplate];
    setTemplates(updatedList);
    setSelectedTemplate(newTemplate);
    setShowNewPanelModal(false);
    setNewPanelCode('');
    setNewPanelName('');
    setNewPanelSpecialty('');
    setNewPanelDepartments('');
    if (onSaveTemplate) onSaveTemplate(newTemplate);
  };

  // Cycle section requirement
  const cycleSectionRequirement = (sectionId: string) => {
    const updatedSections = selectedTemplate.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const nextReq: RequirementType =
        s.requirementType === 'MANDATORY'
          ? 'OPTIONAL'
          : s.requirementType === 'OPTIONAL'
          ? 'CONDITIONAL'
          : 'MANDATORY';
      return {
        ...s,
        requirementType: nextReq,
        isRequired: nextReq === 'MANDATORY',
      };
    });
    const updated = { ...selectedTemplate, sections: updatedSections };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    if (onSaveTemplate) onSaveTemplate(updated);
  };

  // Cycle field requirement
  const cycleFieldRequirement = (fieldId: string) => {
    if (!editingSection) return;
    const updatedFields = (editingSection.fields || []).map((f) => {
      if (f.id !== fieldId) return f;
      const nextReq: RequirementType =
        f.requirementType === 'MANDATORY'
          ? 'OPTIONAL'
          : f.requirementType === 'OPTIONAL'
          ? 'CONDITIONAL'
          : 'MANDATORY';
      return {
        ...f,
        requirementType: nextReq,
        isRequired: nextReq === 'MANDATORY',
      };
    });
    setEditingSection({
      ...editingSection,
      fields: updatedFields,
    });
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: FormAssemblySection = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      sectionTitle: newSectionTitle.trim(),
      fieldsCount: 1,
      isRequired: newSectionReq === 'MANDATORY',
      requirementType: newSectionReq,
      order: selectedTemplate.sections.length + 1,
      fields: [
        {
          id: `F-${Date.now()}-1`,
          fieldCode: `FLD_${newSectionTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15)}`,
          fieldLabel: `${newSectionTitle} Observation`,
          fieldType: 'TEXT',
          placeholder: 'Enter clinical observations...',
          isRequired: newSectionReq === 'MANDATORY',
          requirementType: newSectionReq,
          order: 1,
        },
      ],
    };
    const updated: SpecialtyFormTemplate = {
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSec],
    };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    setNewSectionTitle('');
    if (onSaveTemplate) onSaveTemplate(updated);
  };

  const handleRemoveSection = (sectionId: string) => {
    const updated: SpecialtyFormTemplate = {
      ...selectedTemplate,
      sections: selectedTemplate.sections.filter((s) => s.id !== sectionId),
    };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    if (onSaveTemplate) onSaveTemplate(updated);
  };

  const handleSave = () => {
    if (onSaveTemplate) onSaveTemplate(selectedTemplate);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedTemplate.sections.length) return;
    const sections = [...selectedTemplate.sections];
    const temp = sections[index];
    sections[index] = sections[newIdx];
    sections[newIdx] = temp;
    const updated = { ...selectedTemplate, sections };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
  };

  const openFieldModal = (section: FormAssemblySection) => {
    try {
      const secCopy: FormAssemblySection = JSON.parse(JSON.stringify(section));
      if (!secCopy.fields || !Array.isArray(secCopy.fields)) {
        secCopy.fields = [];
      }
      setEditingSection(secCopy);
      setFieldModalTab('FIELDS');
      setNewFieldLabel('');
      setNewFieldType('TEXT');
      setNewFieldUnit('');
      setNewFieldOptions('');
      setNewFieldReqType('MANDATORY');
      setNewFieldPlaceholder('');
    } catch (e) {
      console.error('Failed to open field modal:', e);
    }
  };

  const handleAddFieldToSection = () => {
    if (!editingSection || !newFieldLabel.trim()) return;
    const cleanCode = `FLD_${newFieldLabel.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 18)}`;
    const parsedOptions = newFieldOptions
      ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : undefined;

    const newField: FormFieldDefinition = {
      id: `FLD-${Date.now().toString().slice(-5)}`,
      fieldCode: cleanCode,
      fieldLabel: newFieldLabel.trim(),
      fieldType: newFieldType,
      unit: newFieldUnit.trim() || undefined,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options: parsedOptions,
      isRequired: newFieldReqType === 'MANDATORY',
      requirementType: newFieldReqType,
      order: (editingSection.fields?.length || 0) + 1,
    };

    const updatedFields = [...(editingSection.fields || []), newField];
    setEditingSection({
      ...editingSection,
      fields: updatedFields,
      fieldsCount: updatedFields.length,
    });

    setNewFieldLabel('');
    setNewFieldUnit('');
    setNewFieldOptions('');
    setNewFieldPlaceholder('');
    setNewFieldReqType('MANDATORY');
  };

  const handleRemoveField = (fieldId: string) => {
    if (!editingSection) return;
    const updatedFields = (editingSection.fields || []).filter((f) => f.id !== fieldId);
    setEditingSection({
      ...editingSection,
      fields: updatedFields,
      fieldsCount: updatedFields.length,
    });
  };

  const handleSaveFieldsModal = () => {
    if (!editingSection) return;
    const updatedSections = selectedTemplate.sections.map((s) =>
      s.id === editingSection.id
        ? { ...editingSection, fieldsCount: (editingSection.fields || []).length }
        : s
    );
    const updatedTemplate: SpecialtyFormTemplate = {
      ...selectedTemplate,
      sections: updatedSections,
    };
    setSelectedTemplate(updatedTemplate);
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)));
    setEditingSection(null);
    if (onSaveTemplate) onSaveTemplate(updatedTemplate);
  };

  const renderRequirementBadge = (req: RequirementType, onClick?: () => void) => {
    const isClickable = Boolean(onClick);
    if (req === 'MANDATORY') {
      return (
        <span
          onClick={onClick}
          title={isClickable ? 'Click to change: Mandatory -> Optional -> Conditional' : undefined}
          style={{
            backgroundColor: colors.dangerBg,
            color: colors.dangerText,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: radii.sm,
            border: `1px solid ${colors.dangerBorder}`,
            cursor: isClickable ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            userSelect: 'none',
          }}
        >
          <i className="fa fa-asterisk" style={{ fontSize: 9 }} />
          Mandatory
        </span>
      );
    }
    if (req === 'CONDITIONAL') {
      return (
        <span
          onClick={onClick}
          title={isClickable ? 'Click to change: Conditional -> Mandatory -> Optional' : undefined}
          style={{
            backgroundColor: colors.warningBg,
            color: colors.warningText,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: radii.sm,
            border: `1px solid ${colors.warningBorder}`,
            cursor: isClickable ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            userSelect: 'none',
          }}
        >
          <i className="fa fa-code-fork" style={{ fontSize: 10 }} />
          Conditional
        </span>
      );
    }
    return (
      <span
        onClick={onClick}
        title={isClickable ? 'Click to change: Optional -> Conditional -> Mandatory' : undefined}
        style={{
          backgroundColor: colors.neutralBg,
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: radii.sm,
          border: `1px solid ${colors.border}`,
          cursor: isClickable ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          userSelect: 'none',
        }}
      >
        Optional
      </span>
    );
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Toast Notification */}
      {saveToast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: colors.successBg,
            border: `1px solid ${colors.successBorder}`,
            color: colors.successText,
            padding: '12px 20px',
            borderRadius: radii.md,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <i className="fa fa-check-circle" style={{ color: colors.success, fontSize: 18 }} />
          Form assembly configuration saved successfully!
        </div>
      )}

      {/* Top Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
          flexWrap: 'wrap',
          gap: spacing.sm,
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: spacing.sm,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, color: colors.primary }}>📑</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              EMR Form Assembly & Specialty Panels
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            Manage Standard Core System Panels and Custom Specialty Dynamic Assemblies across hospital departments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button
            variant="secondary"
            size="md"
            icon="fa-plus"
            onClick={() => setShowNewPanelModal(true)}
          >
            Create Custom Panel
          </Button>
          <Button variant="primary" size="md" icon="fa-save" onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Catalog List (Left 35%) & Assembly Detail (Right 65%) */}
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        {/* Left Column: Template Catalog */}
        <div style={{ flex: '1 1 340px', maxWidth: 430 }}>
          <Card title="Clinical Panels Catalog" padding={spacing.md} style={{ marginBottom: spacing.md }}>
            {/* Standard vs Custom Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: `1px solid ${colors.border}`,
                marginBottom: spacing.sm,
                backgroundColor: colors.surfaceSunken,
                padding: 4,
                borderRadius: radii.md,
              }}
            >
              {[
                { id: 'ALL', label: 'All Panels', count: templates.length },
                { id: 'STANDARD', label: 'Standard', count: templates.filter((t) => t.panelType === 'STANDARD').length },
                { id: 'CUSTOM', label: 'Custom', count: templates.filter((t) => t.panelType === 'CUSTOM').length },
              ].map((tab) => {
                const isActive = panelCategoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPanelCategoryFilter(tab.id as any)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: radii.sm,
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? colors.primary : colors.textMuted,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        backgroundColor: isActive ? colors.primaryLight : '#e2e8f0',
                        color: isActive ? colors.primary : colors.textMuted,
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: radii.full,
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Doctor / Clinician Filter */}
            <div style={{ marginBottom: spacing.sm }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                <i className="fa fa-user-md" style={{ marginRight: 4, color: colors.primary }} />
                Filter by Clinician / Doctor:
              </label>
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: 12,
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.borderStrong}`,
                  backgroundColor: '#ffffff',
                  color: colors.textMain,
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Doctors & Specialties</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (General Medicine)</option>
                <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Ophthalmology)</option>
                <option value="Dr. Tariq Al Mansoori">Dr. Tariq Al Mansoori (Dental)</option>
                <option value="Dr. Fatima Al Zahra">Dr. Fatima Al Zahra (OB/GYN)</option>
                <option value="Dr. Vikram Sharma">Dr. Vikram Sharma (Anesthesiology / PAC)</option>
                <option value="Dr. Maya Patel">Dr. Maya Patel (Physiotherapy)</option>
                <option value="Dr. Emily Watson">Dr. Emily Watson (Emergency)</option>
                <option value="Dr. Alexander Reed">Dr. Alexander Reed (Inpatient / Discharge)</option>
              </select>
            </div>

            <div style={{ marginBottom: spacing.sm }}>
              <Input
                label=""
                placeholder="Search panels, specialty, code..."
                leftIcon="fa fa-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
                maxHeight: 560,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                const isStd = tpl.panelType === 'STANDARD';
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: radii.md,
                      border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                      backgroundColor: isSelected ? colors.primaryLight : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: isStd ? colors.primaryHover : '#7c3aed',
                              backgroundColor: isStd ? '#eff6ff' : '#f5f3ff',
                              border: `1px solid ${isStd ? '#bfdbfe' : '#ddd6fe'}`,
                              padding: '1px 6px',
                              borderRadius: radii.sm,
                              letterSpacing: '0.5px',
                            }}
                          >
                            {tpl.panelType}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted }}>
                            {tpl.templateCode} • {tpl.specialty}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: colors.textMain,
                            marginTop: 4,
                          }}
                        >
                          {tpl.templateName}
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: isSelected ? colors.primary : '#e2e8f0',
                          color: isSelected ? '#ffffff' : colors.textBody,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: radii.full,
                        }}
                      >
                        {tpl.version}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                        color: colors.textMuted,
                        marginTop: 8,
                        borderTop: `1px solid ${isSelected ? colors.primaryMid : '#f1f5f9'}`,
                        paddingTop: 6,
                      }}
                    >
                      <span>
                        <i className="fa fa-list-ul" style={{ marginRight: 4 }} />
                        {tpl.sections.length} Sections
                      </span>
                      <span>
                        <i className="fa fa-hospital-o" style={{ marginRight: 4 }} />
                        {tpl.assignedDepartments.length} Depts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Template Assembly Editor */}
        <div style={{ flex: '2 1 550px' }}>
          <Card
            title={`Form Assembly: ${selectedTemplate.templateName} (${selectedTemplate.templateCode})`}
            padding={spacing.md}
            style={{ marginBottom: spacing.md }}
          >
            {/* Template Metadata Box */}
            <div
              style={{
                backgroundColor: colors.surfaceSunken,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '14px 18px',
                marginBottom: spacing.md,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Panel Classification
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span
                    style={{
                      backgroundColor: selectedTemplate.panelType === 'STANDARD' ? colors.primaryLight : '#f5f3ff',
                      color: selectedTemplate.panelType === 'STANDARD' ? colors.primary : '#7c3aed',
                      border: `1px solid ${selectedTemplate.panelType === 'STANDARD' ? colors.primaryMid : '#ddd6fe'}`,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: radii.sm,
                    }}
                  >
                    {selectedTemplate.panelType === 'STANDARD' ? '🏛️ STANDARD SYSTEM PANEL' : '✨ CUSTOM SPECIALTY PANEL'}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Clinical Specialty
                </span>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
                  {selectedTemplate.specialty}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Assigned Clinicians / Doctors
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {(selectedTemplate.assignedDoctors || ['All Attending Doctors']).map((doc, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: colors.primaryLight,
                        border: `1px solid ${colors.primaryMid}`,
                        color: colors.primary,
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: radii.sm,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <i className="fa fa-user-md" style={{ fontSize: 10 }} />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Assigned Departments
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {selectedTemplate.assignedDepartments.map((dept, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${colors.borderStrong}`,
                        color: colors.textBody,
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: radii.sm,
                        fontWeight: 600,
                      }}
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Lifecycle Status
                </span>
                <div style={{ marginTop: 4 }}>
                  <Badge tone={selectedTemplate.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {selectedTemplate.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Configured Sections Heading */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
                borderBottom: `1px solid ${colors.border}`,
                paddingBottom: 6,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textMain }}>
                Configured Form Sections ({selectedTemplate.sections.length})
              </h4>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                Click requirement tag to toggle Mandatory / Optional / Conditional
              </span>
            </div>

            {/* Sections List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.md }}>
              {selectedTemplate.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radii.full,
                        backgroundColor: colors.primaryLight,
                        color: colors.primary,
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>
                          {sec.sectionTitle}
                        </span>
                        {/* Interactive Clickable Requirement Badge */}
                        {renderRequirementBadge(sec.requirementType || (sec.isRequired ? 'MANDATORY' : 'OPTIONAL'), () =>
                          cycleSectionRequirement(sec.id)
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, display: 'block' }}>
                        {sec.fields?.length || sec.fieldsCount || 0} Active Clinical Input Fields
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      title="Move Up"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      style={{
                        border: `1px solid ${colors.border}`,
                        background: '#ffffff',
                        borderRadius: radii.sm,
                        padding: '4px 8px',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        opacity: idx === 0 ? 0.4 : 1,
                        color: colors.textBody,
                      }}
                    >
                      <i className="fa fa-arrow-up" />
                    </button>
                    <button
                      type="button"
                      title="Move Down"
                      disabled={idx === selectedTemplate.sections.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      style={{
                        border: `1px solid ${colors.border}`,
                        background: '#ffffff',
                        borderRadius: radii.sm,
                        padding: '4px 8px',
                        cursor: idx === selectedTemplate.sections.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: idx === selectedTemplate.sections.length - 1 ? 0.4 : 1,
                        color: colors.textBody,
                      }}
                    >
                      <i className="fa fa-arrow-down" />
                    </button>
                    <button
                      type="button"
                      title="Configure Fields"
                      onClick={() => openFieldModal(sec)}
                      style={{
                        border: `1px solid ${colors.primary}`,
                        background: colors.primaryLight,
                        borderRadius: radii.sm,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 1px 2px rgba(37,99,235,0.1)',
                      }}
                    >
                      <i className="fa fa-cog" />
                      Fields ({sec.fields?.length || sec.fieldsCount || 0})
                    </button>
                    <button
                      type="button"
                      title="Delete Section"
                      onClick={() => handleRemoveSection(sec.id)}
                      style={{
                        border: `1px solid ${colors.dangerBorder}`,
                        background: colors.dangerBg,
                        borderRadius: radii.sm,
                        padding: '5px 8px',
                        fontSize: 12,
                        cursor: 'pointer',
                        color: colors.dangerText,
                      }}
                    >
                      <i className="fa fa-trash-o" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Section Toolbar with Requirement Type Selector */}
            <div
              style={{
                display: 'flex',
                gap: spacing.sm,
                alignItems: 'center',
                backgroundColor: colors.surfaceSunken,
                border: `1px dashed ${colors.borderStrong}`,
                borderRadius: radii.md,
                padding: '12px 16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 240px' }}>
                <Input
                  label=""
                  placeholder="Enter new section title (e.g. Ophthalmology IOP Readings)..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSection();
                  }}
                />
              </div>

              <div style={{ minWidth: 140 }}>
                <select
                  value={newSectionReq}
                  onChange={(e) => setNewSectionReq(e.target.value as RequirementType)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.borderStrong}`,
                    backgroundColor: '#ffffff',
                    color: colors.textMain,
                    outline: 'none',
                    fontWeight: 600,
                  }}
                >
                  <option value="MANDATORY">Mandatory</option>
                  <option value="OPTIONAL">Optional</option>
                  <option value="CONDITIONAL">Conditional</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="md"
                icon="fa-plus"
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
              >
                Add Section
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Create Custom Specialty Panel Modal                                       */}
      {/* ========================================================================= */}
      {showNewPanelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.lg,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: 580,
              padding: 24,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${colors.border}`, paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>✨</span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.textMain }}>
                  Create Custom Specialty Panel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPanelModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: colors.textMuted }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Input
                  label="Panel / Form Code *"
                  placeholder="e.g. DERM-01, ORTHO-02"
                  value={newPanelCode}
                  onChange={(e) => setNewPanelCode(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Panel Title / Name *"
                  placeholder="e.g. Dermatology Assessment & Lesion Chart"
                  value={newPanelName}
                  onChange={(e) => setNewPanelName(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Clinical Specialty *"
                  placeholder="e.g. Dermatology / Venereology"
                  value={newPanelSpecialty}
                  onChange={(e) => setNewPanelSpecialty(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Assigned Hospital Departments (Comma separated)"
                  placeholder="e.g. Skin Clinic, Laser Center, OPD-3"
                  value={newPanelDepartments}
                  onChange={(e) => setNewPanelDepartments(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
              <Button variant="secondary" size="md" onClick={() => setShowNewPanelModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="fa-check"
                disabled={!newPanelCode.trim() || !newPanelName.trim()}
                onClick={handleCreateCustomPanel}
              >
                Create Custom Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Interactive Clinical Fields Configuration Modal & Schema Designer         */}
      {/* ========================================================================= */}
      {editingSection && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.lg,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: 900,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceSunken,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: colors.primary, fontSize: 18 }}>⚙️</span>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                    Configure Fields: {editingSection.sectionTitle}
                  </h3>
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Template: {selectedTemplate.templateName} ({selectedTemplate.templateCode}) •{' '}
                  {editingSection.fields?.length || 0} Configured Clinical Fields
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: colors.textMuted,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs (Field Schema Designer vs Live Clinical Preview) */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: `1px solid ${colors.border}`,
                padding: '0 20px',
                backgroundColor: '#ffffff',
              }}
            >
              <button
                type="button"
                onClick={() => setFieldModalTab('FIELDS')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: `3px solid ${fieldModalTab === 'FIELDS' ? colors.primary : 'transparent'}`,
                  background: 'transparent',
                  color: fieldModalTab === 'FIELDS' ? colors.primary : colors.textMuted,
                  fontWeight: fieldModalTab === 'FIELDS' ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-list" style={{ marginRight: 6 }} />
                Field Schema List ({editingSection.fields?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setFieldModalTab('PREVIEW')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: `3px solid ${fieldModalTab === 'PREVIEW' ? colors.primary : 'transparent'}`,
                  background: 'transparent',
                  color: fieldModalTab === 'PREVIEW' ? colors.primary : colors.textMuted,
                  fontWeight: fieldModalTab === 'PREVIEW' ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-eye" style={{ marginRight: 6 }} />
                Interactive Encounter Form Preview
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {fieldModalTab === 'FIELDS' ? (
                <div>
                  {/* Current Fields Table */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                        Active Clinical Input Fields
                      </h4>
                      <span style={{ fontSize: 11, color: colors.textMuted }}>
                        Click on any badge under Requirement to cycle Mandatory / Optional / Conditional
                      </span>
                    </div>

                    {(!editingSection.fields || editingSection.fields.length === 0) ? (
                      <div
                        style={{
                          padding: 24,
                          textAlign: 'center',
                          backgroundColor: colors.surfaceSunken,
                          borderRadius: radii.md,
                          color: colors.textMuted,
                          fontSize: 13,
                        }}
                      >
                        No clinical fields configured yet for this section. Add one below.
                      </div>
                    ) : (
                      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, width: 30 }}>#</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Field Label & Code</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Input Type</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Unit / Options</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Requirement Type (Click to Toggle)</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, width: 60 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingSection.fields.map((f, i) => (
                              <tr
                                key={f.id}
                                style={{
                                  borderBottom: `1px solid ${colors.border}`,
                                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                                }}
                              >
                                <td style={{ padding: '8px 10px', color: colors.textMuted, fontWeight: 600 }}>{i + 1}</td>
                                <td style={{ padding: '8px 10px' }}>
                                  <div style={{ fontWeight: 600, color: colors.textMain }}>{f.fieldLabel}</div>
                                  <div style={{ fontSize: 10, color: colors.textMuted }}>{f.fieldCode}</div>
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <span
                                    style={{
                                      backgroundColor: colors.primaryLight,
                                      color: colors.primary,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: radii.sm,
                                    }}
                                  >
                                    {f.fieldType}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 10px', color: colors.textBody }}>
                                  {f.unit ? (
                                    <span style={{ fontWeight: 600, color: colors.primary }}>Unit: {f.unit}</span>
                                  ) : f.options?.length ? (
                                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                                      {f.options.slice(0, 3).join(', ')}
                                      {f.options.length > 3 ? ` (+${f.options.length - 3} more)` : ''}
                                    </span>
                                  ) : (
                                    <span style={{ color: colors.textDisabled }}>—</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  {renderRequirementBadge(
                                    f.requirementType || (f.isRequired ? 'MANDATORY' : 'OPTIONAL'),
                                    () => cycleFieldRequirement(f.id)
                                  )}
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveField(f.id)}
                                    title="Delete Field"
                                    style={{
                                      border: `1px solid ${colors.dangerBorder}`,
                                      backgroundColor: colors.dangerBg,
                                      color: colors.dangerText,
                                      borderRadius: radii.sm,
                                      padding: '3px 6px',
                                      cursor: 'pointer',
                                      fontSize: 11,
                                    }}
                                  >
                                    <i className="fa fa-trash-o" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Add Field Form */}
                  <div
                    style={{
                      backgroundColor: colors.surfaceSunken,
                      border: `1px solid ${colors.borderStrong}`,
                      borderRadius: radii.md,
                      padding: 16,
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                      ➕ Add New Clinical Field
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                      <div>
                        <Input
                          label="Field Label *"
                          placeholder="e.g. Corneal Clarity, Pain VAS, Gravida"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                          Input Control Type *
                        </label>
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value as FieldInputType)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: 13,
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.borderStrong}`,
                            backgroundColor: '#ffffff',
                            color: colors.textMain,
                            outline: 'none',
                          }}
                        >
                          <option value="TEXT">Single Line Text</option>
                          <option value="NUMBER">Numeric / Measurement</option>
                          <option value="TEXTAREA">Multi-line Narrative / Textarea</option>
                          <option value="DROPDOWN">Dropdown Single Select</option>
                          <option value="RADIO">Radio Button Group</option>
                          <option value="CHECKBOX">Boolean Checkbox Toggle</option>
                          <option value="DATE">Date / Calendar</option>
                          <option value="ODONTOGRAM">Dental 32-Tooth Odontogram Grid</option>
                          <option value="VA_CHART">Ophthalmology Visual Acuity Chart</option>
                        </select>
                      </div>

                      <div>
                        <Input
                          label="Unit of Measure (Optional)"
                          placeholder="e.g. mmHg, bpm, cm, Diopters"
                          value={newFieldUnit}
                          onChange={(e) => setNewFieldUnit(e.target.value)}
                        />
                      </div>
                    </div>

                    {(newFieldType === 'DROPDOWN' || newFieldType === 'RADIO') && (
                      <div style={{ marginBottom: 12 }}>
                        <Input
                          label="Select Options (Comma-separated values)"
                          placeholder="e.g. Mild, Moderate, Severe, Excruciating"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Requirement Type Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMain }}>
                          Requirement Type:
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: colors.dangerText, fontWeight: 600 }}>
                          <input
                            type="radio"
                            name="reqTypeRadio"
                            value="MANDATORY"
                            checked={newFieldReqType === 'MANDATORY'}
                            onChange={() => setNewFieldReqType('MANDATORY')}
                          />
                          Mandatory
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: colors.textBody, fontWeight: 500 }}>
                          <input
                            type="radio"
                            name="reqTypeRadio"
                            value="OPTIONAL"
                            checked={newFieldReqType === 'OPTIONAL'}
                            onChange={() => setNewFieldReqType('OPTIONAL')}
                          />
                          Optional
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: colors.warningText, fontWeight: 600 }}>
                          <input
                            type="radio"
                            name="reqTypeRadio"
                            value="CONDITIONAL"
                            checked={newFieldReqType === 'CONDITIONAL'}
                            onChange={() => setNewFieldReqType('CONDITIONAL')}
                          />
                          Conditional
                        </label>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        icon="fa-plus"
                        disabled={!newFieldLabel.trim()}
                        onClick={handleAddFieldToSection}
                      >
                        Add Field to Section
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Interactive Encounter Form Preview */
                <div>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: colors.primaryLight,
                      borderRadius: radii.md,
                      border: `1px solid ${colors.primaryMid}`,
                      marginBottom: 16,
                      fontSize: 12,
                      color: colors.primaryHover,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <i className="fa fa-info-circle" style={{ fontSize: 16 }} />
                    This live preview shows exactly how clinicians will see and document this section during a clinical encounter.
                  </div>

                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: radii.md,
                      padding: 20,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${colors.border}`, paddingBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.textMain }}>
                        {editingSection.sectionTitle}
                      </h4>
                      {renderRequirementBadge(editingSection.requirementType || (editingSection.isRequired ? 'MANDATORY' : 'OPTIONAL'))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {(editingSection.fields || []).map((f) => (
                        <div key={f.id}>
                          {f.fieldType === 'TEXT' && (
                            <Input
                              label={`${f.fieldLabel} ${f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}`}
                              placeholder={f.placeholder || `Enter ${f.fieldLabel.toLowerCase()}...`}
                            />
                          )}

                          {f.fieldType === 'NUMBER' && (
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''} {f.unit ? `(${f.unit})` : ''}
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: 13,
                                    borderRadius: f.unit ? `${radii.sm} 0 0 ${radii.sm}` : radii.sm,
                                    border: `1px solid ${colors.borderStrong}`,
                                    outline: 'none',
                                  }}
                                />
                                {f.unit && (
                                  <span
                                    style={{
                                      backgroundColor: colors.surfaceSunken,
                                      border: `1px solid ${colors.borderStrong}`,
                                      borderLeft: 'none',
                                      padding: '8px 12px',
                                      fontSize: 12,
                                      color: colors.textMuted,
                                      borderRadius: `0 ${radii.sm} ${radii.sm} 0`,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {f.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {f.fieldType === 'TEXTAREA' && (
                            <Textarea
                              label={`${f.fieldLabel} ${f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}`}
                              placeholder={f.placeholder || `Enter ${f.fieldLabel.toLowerCase()} narrative...`}
                              rows={3}
                            />
                          )}

                          {f.fieldType === 'DROPDOWN' && (
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}
                              </label>
                              <select
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: 13,
                                  borderRadius: radii.sm,
                                  border: `1px solid ${colors.borderStrong}`,
                                  backgroundColor: '#ffffff',
                                  outline: 'none',
                                }}
                              >
                                <option value="">-- Select {f.fieldLabel} --</option>
                                {(f.options || []).map((opt, oi) => (
                                  <option key={oi} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {f.fieldType === 'RADIO' && (
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                                {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}
                              </label>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {(f.options || []).map((opt, oi) => (
                                  <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                                    <input type="radio" name={`radio_${f.id}`} value={opt} />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {f.fieldType === 'CHECKBOX' && (
                            <div style={{ paddingTop: 20 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: colors.textMain, cursor: 'pointer' }}>
                                <input type="checkbox" style={{ width: 18, height: 18 }} />
                                {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}
                              </label>
                            </div>
                          )}

                          {f.fieldType === 'DATE' && (
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}
                              </label>
                              <input
                                type="date"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: 13,
                                  borderRadius: radii.sm,
                                  border: `1px solid ${colors.borderStrong}`,
                                  outline: 'none',
                                }}
                              />
                            </div>
                          )}

                          {f.fieldType === 'ODONTOGRAM' && (
                            <div style={{ gridColumn: '1 / -1', padding: 12, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMain }}>
                                🦷 Adult 32-Tooth Odontogram FDI Chart Grid (Interactive)
                              </span>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                                {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    style={{
                                      padding: '6px 8px',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      border: `1px solid ${colors.border}`,
                                      borderRadius: radii.sm,
                                      backgroundColor: '#ffffff',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {f.fieldType === 'VA_CHART' && (
                            <div style={{ gridColumn: '1 / -1', padding: 12, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMain }}>
                                👁️ Snellen Acuity Matrix (OD / OS)
                              </span>
                              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <select style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                                  <option>OD: 6/6 (Normal)</option>
                                  <option>OD: 6/9</option>
                                  <option>OD: 6/12</option>
                                </select>
                                <select style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                                  <option>OS: 6/6 (Normal)</option>
                                  <option>OS: 6/9</option>
                                  <option>OS: 6/12</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceSunken,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditingSection(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="fa-check"
                onClick={handleSaveFieldsModal}
              >
                Save & Apply Section Fields
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
