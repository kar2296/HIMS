import React, { useState, useMemo } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';
import { Input, Textarea } from '../components/ui/Input';
import {
  STANDARD_PANELS_CATALOG,
  searchStandardPanels,
  type StandardPanelTemplate,
} from './emr-workspace/standardPanelsCatalog';

export type FieldInputType =
  | 'TEXT'
  | 'NUMBER'
  | 'TEXTAREA'
  | 'DROPDOWN'
  | 'CHECKBOX'
  | 'DATE'
  | 'RADIO'
  | 'ODONTOGRAM'
  | 'VA_CHART'
  | 'DIAGRAM'
  | 'YES_NO'
  | 'TRUE_FALSE'
  | 'PERIOD'
  | 'FRACTION'
  | 'GRID'
  | 'HEADER';

export type RequirementType = 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL';

export type PanelCategoryType = 'STANDARD' | 'CUSTOM' | 'EXTERNAL';

export type AgeTargetMode = 'ALL' | 'ADULT' | 'CHILD' | 'NEONATE';

export type EncounterScope = 'ALL' | 'OUTPATIENT' | 'INPATIENT' | 'EMERGENCY' | 'DAY_SURGERY';

export type DockPosition = 'TOP' | 'RIGHT' | 'FULL';

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
  ageScope?: AgeTargetMode;
  pediatricNote?: string;
}

export interface FormAssemblySection {
  id: string;
  sectionTitle: string;
  nickName?: string;
  fieldsCount: number;
  isRequired: boolean;
  requirementType: RequirementType;
  order: number;
  dockPosition?: DockPosition;
  encounterScope?: EncounterScope;
  retainRevisions?: boolean;
  saveAndComplete?: boolean;
  doctorSignature?: boolean;
  patientSignature?: boolean;
  witnessSignature?: boolean;
  displayInConsultation?: boolean;
  canSkip?: boolean;
  ageTarget?: AgeTargetMode;
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
  layoutOrientation: 'HORIZONTAL' | 'VERTICAL';
  isDefault: boolean;
  encounterScope: EncounterScope;
  formGroupRole: 'CLINICIANS' | 'NURSING' | 'IP_NURSING' | 'MRD_CLAIMS' | 'OT_FORMS' | 'EMR' | 'TEST' | 'PHARMACIST' | 'IP';
  assignedDepartments: string[];
  assignedDoctors: string[];
  sections: FormAssemblySection[];
}

export interface EmrFormAssemblyScreenProps {
  onSaveTemplate?: (template: SpecialtyFormTemplate) => void;
  onAssignDepartment?: (templateId: string, departments: string[]) => void;
  initialAgeMode?: 'ADULT' | 'CHILD';
}

export const EmrFormAssemblyScreen: React.FC<EmrFormAssemblyScreenProps> = ({
  onSaveTemplate,
  initialAgeMode = 'ADULT',
}) => {
  // Global Active Age Switcher: Simulates viewing an Adult patient (>= 18) vs Pediatric patient (< 18)
  const [activeAgeMode, setActiveAgeMode] = useState<'ADULT' | 'CHILD' | 'NEONATE'>(
    initialAgeMode === 'CHILD' ? 'CHILD' : 'ADULT'
  );

  const [templates, setTemplates] = useState<SpecialtyFormTemplate[]>([
    // =========================================================================
    // REFERENCE STANDARD EMA FORMS (from SIMPLEX HIMES Staging Reference)
    // =========================================================================
    {
      id: 'TPL-STD-OP-CLIN',
      templateCode: 'OP-CLINICIANS',
      templateName: 'OP - CLINICIANS (General OPD Assessment)',
      specialty: 'General Medicine & Family Practice',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'HORIZONTAL',
      isDefault: true,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'CLINICIANS',
      assignedDepartments: ['General OPD', 'Family Medicine', 'Internal Medicine', 'Consultation Suite 1'],
      assignedDoctors: ['Dr. Rajesh Kumar', 'Dr. Mohammed Al Nuaimi', 'Dr. Sarah Jenkins'],
      sections: [
        {
          id: 'SEC-CLIN-1',
          sectionTitle: 'Chief Complaints & History of Present Illness (HPI)',
          nickName: 'Presenting Complaints',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FC-1', fieldCode: 'FLD_CHIEF_COMPLAINT', fieldLabel: 'Primary Complaint', fieldType: 'TEXT', placeholder: 'e.g. Fever with chills / dry cough', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FC-2', fieldCode: 'FLD_DURATION_PERIOD', fieldLabel: 'Duration & Progression', fieldType: 'PERIOD', unit: 'Days', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FC-3', fieldCode: 'FLD_SEVERITY_SCALE', fieldLabel: 'Symptom Severity (VAS / Grade)', fieldType: 'DROPDOWN', options: ['Mild (VAS 1-3)', 'Moderate (VAS 4-6)', 'Severe (VAS 7-9)', 'Excruciating (VAS 10)'], isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
            { id: 'FC-4', fieldCode: 'FLD_HPI_NARRATIVE', fieldLabel: 'History of Present Illness (HPI)', fieldType: 'TEXTAREA', placeholder: 'Chronological symptom progression, triggers, associated factors...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-CLIN-2',
          sectionTitle: 'Vitals & Physiological Biometrics',
          nickName: 'Clinical Vitals',
          fieldsCount: 8,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          dockPosition: 'TOP',
          encounterScope: 'ALL',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FV-1', fieldCode: 'FLD_BP_SYS', fieldLabel: 'Systolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '120', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ADULT' },
            { id: 'FV-2', fieldCode: 'FLD_BP_DIA', fieldLabel: 'Diastolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '80', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ADULT' },
            { id: 'FV-3', fieldCode: 'FLD_PULSE_RATE', fieldLabel: 'Heart / Pulse Rate', fieldType: 'NUMBER', unit: 'bpm', placeholder: '72', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FV-4', fieldCode: 'FLD_TEMP_C', fieldLabel: 'Core Temperature', fieldType: 'NUMBER', unit: '°C', placeholder: '37.0', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
            { id: 'FV-5', fieldCode: 'FLD_SPO2', fieldLabel: 'Oxygen Saturation (SpO2)', fieldType: 'NUMBER', unit: '%', placeholder: '98', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
            { id: 'FV-6', fieldCode: 'FLD_RESP_RATE', fieldLabel: 'Respiratory Rate', fieldType: 'NUMBER', unit: 'breaths/min', placeholder: '16', isRequired: true, requirementType: 'MANDATORY', order: 6, ageScope: 'ALL' },
            { id: 'FV-7', fieldCode: 'FLD_HEIGHT_CM', fieldLabel: 'Height / Length', fieldType: 'NUMBER', unit: 'cm', placeholder: '170', isRequired: false, requirementType: 'OPTIONAL', order: 7, ageScope: 'ALL' },
            { id: 'FV-8', fieldCode: 'FLD_WEIGHT_KG', fieldLabel: 'Body Weight', fieldType: 'NUMBER', unit: 'kg', placeholder: '70', isRequired: true, requirementType: 'MANDATORY', order: 8, ageScope: 'ALL' },
            // Pediatric-specific dynamic vitals fields:
            { id: 'FV-PED-1', fieldCode: 'FLD_HEAD_CIRCUMFERENCE', fieldLabel: 'Head Circumference (OFC)', fieldType: 'NUMBER', unit: 'cm', placeholder: '35.5', isRequired: true, requirementType: 'MANDATORY', order: 9, ageScope: 'CHILD', pediatricNote: 'Standard for pediatric patients < 36 months' },
            { id: 'FV-PED-2', fieldCode: 'FLD_MUAC', fieldLabel: 'Mid-Upper Arm Circumference (MUAC)', fieldType: 'NUMBER', unit: 'cm', placeholder: '14.0', isRequired: false, requirementType: 'OPTIONAL', order: 10, ageScope: 'CHILD', pediatricNote: 'Nutritional status screening' },
            { id: 'FV-PED-3', fieldCode: 'FLD_GROWTH_PERCENTILE', fieldLabel: 'WHO Growth Percentile Category', fieldType: 'DROPDOWN', options: ['< 3rd Percentile (Underweight)', '3rd - 15th Percentile', '15th - 50th Percentile (Normal)', '50th - 85th Percentile', '> 85th Percentile (Overweight)', '> 97th Percentile (Obese)'], isRequired: false, requirementType: 'CONDITIONAL', order: 11, ageScope: 'CHILD' },
          ],
        },
        {
          id: 'SEC-CLIN-3',
          sectionTitle: 'Systemic Physical Examination',
          nickName: 'Physical Exam',
          fieldsCount: 6,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 3,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: false,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FPE-1', fieldCode: 'FLD_GEN_EXAM', fieldLabel: 'General Appearance & Sensorium', fieldType: 'DROPDOWN', options: ['Alert, conscious, well oriented', 'Febrile, flushed, mild distress', 'Pale / Anemic appearance', 'Dehydrated, dry mucous membranes', 'Lethargic / Drowsy', 'Acute distress'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FPE-2', fieldCode: 'FLD_CVS_EXAM', fieldLabel: 'Cardiovascular System (CVS)', fieldType: 'TEXT', placeholder: 'S1, S2 heard, regular rhythm, no murmur', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
            { id: 'FPE-3', fieldCode: 'FLD_RS_EXAM', fieldLabel: 'Respiratory System (Chest / Lungs)', fieldType: 'TEXT', placeholder: 'Bilateral vesicular breath sounds, clear fields', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
            { id: 'FPE-4', fieldCode: 'FLD_PA_EXAM', fieldLabel: 'Per Abdomen (PA)', fieldType: 'TEXT', placeholder: 'Soft, non-tender, no organomegaly, normal bowel sounds', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
            { id: 'FPE-5', fieldCode: 'FLD_CNS_EXAM', fieldLabel: 'Central Nervous System (CNS)', fieldType: 'TEXT', placeholder: 'GCS 15/15, cranial nerves intact, no focal deficit', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ADULT' },
            { id: 'FPE-PED-1', fieldCode: 'FLD_PED_GCS', fieldLabel: 'Pediatric Glasgow Coma Scale (pGCS)', fieldType: 'DROPDOWN', options: ['15 - Normal Pediatric Behavior', '13-14 - Mild Alteration', '9-12 - Moderate Impairment', '<= 8 - Severe Coma'], isRequired: true, requirementType: 'MANDATORY', order: 6, ageScope: 'CHILD' },
          ],
        },
        {
          id: 'SEC-CLIN-4',
          sectionTitle: 'Clinical Impression & ICD-10 Diagnosis',
          nickName: 'Diagnosis Coding',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 4,
          dockPosition: 'TOP',
          encounterScope: 'ALL',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FD-1', fieldCode: 'FLD_PRIMARY_DX', fieldLabel: 'Primary Clinical Diagnosis', fieldType: 'TEXT', placeholder: 'e.g. Acute Upper Respiratory Tract Infection', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FD-2', fieldCode: 'FLD_ICD10_PRIMARY', fieldLabel: 'Primary ICD-10 Code', fieldType: 'TEXT', placeholder: 'J06.9', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FD-3', fieldCode: 'FLD_IS_CHRONIC', fieldLabel: 'Chronic Illness / Comorbidity', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 3, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-CLIN-5',
          sectionTitle: 'Orders, Prescriptions & Plan of Care',
          nickName: 'Rx & Treatment Plan',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 5,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FR-1', fieldCode: 'FLD_RX_ORDERS', fieldLabel: 'Medication Orders & Dosage Instructions', fieldType: 'TEXTAREA', placeholder: 'Tab Paracetamol 500mg TDS x 3 days...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FR-2', fieldCode: 'FLD_LAB_RAD_ORDERS', fieldLabel: 'Laboratory & Radiology Diagnostic Requests', fieldType: 'TEXT', placeholder: 'CBC, ESR, Chest X-Ray PA View', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
            { id: 'FR-3', fieldCode: 'FLD_FOLLOWUP_DATE', fieldLabel: 'Next Follow-up Appointment Date', fieldType: 'DATE', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-OP-NURSE',
      templateCode: 'OP-NURSING',
      templateName: 'OP - NURSING (Triage & Intake Assessment)',
      specialty: 'Outpatient Nursing',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: true,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'NURSING',
      assignedDepartments: ['OPD Nursing Station', 'Triage Area', 'Injection Room'],
      assignedDoctors: ['Staff Nurse In-Charge', 'Triage Nursing Team'],
      sections: [
        {
          id: 'SEC-OPN-1',
          sectionTitle: 'Nurse Intake & Allergy Screening',
          nickName: 'Allergy Screen',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'ALL',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: true,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FON-1', fieldCode: 'FLD_NKA_STATUS', fieldLabel: 'No Known Allergies (NKA)', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
            { id: 'FON-2', fieldCode: 'FLD_ALLERGY_DETAILS', fieldLabel: 'Known Drug, Food or Substance Allergies', fieldType: 'TEXT', placeholder: 'e.g. Penicillin (Anaphylaxis), Peanuts (Urticaria)', isRequired: false, requirementType: 'CONDITIONAL', order: 2, ageScope: 'ALL' },
            { id: 'FON-3', fieldCode: 'FLD_ALLERGY_SEVERITY', fieldLabel: 'Allergic Reaction Severity', fieldType: 'DROPDOWN', options: ['Mild', 'Moderate', 'Severe / Life-Threatening'], isRequired: false, requirementType: 'CONDITIONAL', order: 3, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-OPN-2',
          sectionTitle: 'Fall Risk & Vulnerability Assessment',
          nickName: 'Fall Risk Scale',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          dockPosition: 'TOP',
          encounterScope: 'ALL',
          retainRevisions: false,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FON-4', fieldCode: 'FLD_FALL_HISTORY', fieldLabel: 'History of Falls within Last 6 Months', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FON-5', fieldCode: 'FLD_AMBULATION_AID', fieldLabel: 'Requires Ambulatory Assistance / Cane / Wheelchair', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FON-6', fieldCode: 'FLD_FALL_RISK_LEVEL', fieldLabel: 'Calculated Fall Risk Category', fieldType: 'DROPDOWN', options: ['Low Risk (Green Band)', 'Moderate Risk (Yellow Band)', 'High Fall Risk (Red Band - Direct Nurse Supervision)'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-OPN-3',
          sectionTitle: 'Pediatric Immunization & Growth Tracking',
          nickName: 'Child Immunization',
          fieldsCount: 3,
          isRequired: false,
          requirementType: 'CONDITIONAL',
          order: 3,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: true,
          ageTarget: 'CHILD',
          fields: [
            { id: 'FON-PED-1', fieldCode: 'FLD_IMMUNIZATION_STATUS', fieldLabel: 'Vaccination Schedule Up to Date', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'CHILD' },
            { id: 'FON-PED-2', fieldCode: 'FLD_VACCINE_MISSED', fieldLabel: 'Pending / Delayed Vaccines', fieldType: 'TEXT', placeholder: 'e.g. MMR-2 booster pending', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'CHILD' },
            { id: 'FON-PED-3', fieldCode: 'FLD_FEEDING_PATTERN', fieldLabel: 'Infant Feeding Regimen', fieldType: 'DROPDOWN', options: ['Exclusive Breastfeeding', 'Formula Feed', 'Mixed Feed', 'Age-Appropriate Solid Weaning'], isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'CHILD' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-IP-NURSE',
      templateCode: 'IP-NURSING',
      templateName: 'IP NURSING (Inpatient Bedside & eMAR Station)',
      specialty: 'Inpatient Nursing & Critical Care',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: true,
      encounterScope: 'INPATIENT',
      formGroupRole: 'IP_NURSING',
      assignedDepartments: ['General Ward', 'ICU', 'HDU', 'Maternity Ward', 'Surgical Ward'],
      assignedDoctors: ['Inpatient Nursing Staff', 'Dr. Alexander Reed'],
      sections: [
        {
          id: 'SEC-IPN-1',
          sectionTitle: 'Vital Signs & 24h Hemodynamic Trajectory',
          nickName: '24h Vitals',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FIN-1', fieldCode: 'FLD_IP_BP', fieldLabel: 'Non-Invasive BP (NIBP)', fieldType: 'TEXT', placeholder: '120/80', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FIN-2', fieldCode: 'FLD_IP_HR', fieldLabel: 'Continuous Heart Rate', fieldType: 'NUMBER', unit: 'bpm', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FIN-3', fieldCode: 'FLD_IP_TEMP', fieldLabel: 'Body Temperature', fieldType: 'NUMBER', unit: '°C', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FIN-4', fieldCode: 'FLD_IP_SPO2', fieldLabel: 'SpO2 on Room Air / O2 Device', fieldType: 'NUMBER', unit: '%', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
            { id: 'FIN-5', fieldCode: 'FLD_IP_O2_SUPPORT', fieldLabel: 'Supplemental Oxygen Rate', fieldType: 'DROPDOWN', options: ['Room Air', '2L via Nasal Cannula', '4L via Facemask', '10L via Non-Rebreather', 'High Flow Nasal Cannula (HFNC)', 'Mechanical Ventilation'], isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-IPN-2',
          sectionTitle: 'Intake & Output Fluid Balance Chart',
          nickName: 'I/O Fluid Chart',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FIN-6', fieldCode: 'FLD_ORAL_INTAKE', fieldLabel: 'Oral Fluid Intake (24h)', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FIN-7', fieldCode: 'FLD_IV_INTAKE', fieldLabel: 'IV Infusions & Medications', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FIN-8', fieldCode: 'FLD_TOTAL_OUTPUT', fieldLabel: 'Total Output (Urine + Drain + Stool)', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FIN-9', fieldCode: 'FLD_NET_BALANCE', fieldLabel: 'Calculated Net Fluid Balance (+/-)', fieldType: 'NUMBER', unit: 'mL', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-IPN-3',
          sectionTitle: 'ISBAR Shift Handover Communication',
          nickName: 'ISBAR Handover',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 3,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: false,
          patientSignature: false,
          witnessSignature: true,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FIN-10', fieldCode: 'FLD_ISBAR_S', fieldLabel: 'Situation (Active Acute Issues)', fieldType: 'TEXT', placeholder: 'Post-op Day 1, pain well controlled', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FIN-11', fieldCode: 'FLD_ISBAR_B', fieldLabel: 'Background (Admission Reason & Co-morbidities)', fieldType: 'TEXT', placeholder: 'Admitted for laparoscopic cholecystectomy, HTN', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FIN-12', fieldCode: 'FLD_ISBAR_A', fieldLabel: 'Assessment (Current Vital Status & Lines)', fieldType: 'TEXT', placeholder: 'Vitals stable, IV cannula in left forearm patent', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FIN-13', fieldCode: 'FLD_ISBAR_R', fieldLabel: 'Recommendation (Plan for Next Shift)', fieldType: 'TEXT', placeholder: 'Mobilize to chair, repeat electrolytes at 6 PM', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-PRE-OP',
      templateCode: 'PRE-OPERATIVE',
      templateName: 'PRE-OPERATIVE (Pre-Op Verification & Checklist)',
      specialty: 'Surgical Day Care & Anesthesia',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'INPATIENT',
      formGroupRole: 'EMR',
      assignedDepartments: ['Pre-Op Holding Area', 'Surgical Ward', 'Day Surgery Unit'],
      assignedDoctors: ['Dr. Vikram Sharma', 'Operating Surgeon', 'Pre-Op Holding Nurse'],
      sections: [
        {
          id: 'SEC-PRE-1',
          sectionTitle: 'Pre-Operative Verification Checklist',
          nickName: 'Pre-Op Safety',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: true,
          witnessSignature: true,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FPRE-1', fieldCode: 'FLD_CONSENT_SIGNED', fieldLabel: 'Informed Surgical & Anesthesia Consent Signed', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FPRE-2', fieldCode: 'FLD_SITE_MARKED', fieldLabel: 'Surgical Site Marked by Operating Surgeon', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FPRE-3', fieldCode: 'FLD_NPO_HOURS', fieldLabel: 'NPO Hours for Solids / Clear Liquids', fieldType: 'PERIOD', unit: 'Hours', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FPRE-4', fieldCode: 'FLD_BLOOD_CROSSMATCH', fieldLabel: 'Blood Cross-match & Availability Confirmed', fieldType: 'DROPDOWN', options: ['Confirmed Ready in Blood Bank', 'Type & Screen Only', 'Not Indicated for this Procedure'], isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
            { id: 'FPRE-5', fieldCode: 'FLD_JEWELRY_REMOVED', fieldLabel: 'Dentures / Hearing Aids / Jewelry Removed', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-OT-FORM',
      templateCode: 'OT-FORMS',
      templateName: 'OT FORMS (Intra-Operative & WHO Safety Checklist)',
      specialty: 'Operating Theater & Surgery',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'INPATIENT',
      formGroupRole: 'OT_FORMS',
      assignedDepartments: ['Operating Theater 1', 'Operating Theater 2', 'Laparoscopy Suite'],
      assignedDoctors: ['Operating Surgeon', 'Anesthetist', 'Scrub Nurse', 'Circulating Nurse'],
      sections: [
        {
          id: 'SEC-OT-1',
          sectionTitle: 'WHO Surgical Safety Checklist',
          nickName: 'WHO Time-Out',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: true,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FOT-1', fieldCode: 'FLD_SIGN_IN', fieldLabel: 'Sign-In: Patient identity, site, procedure and pulse oximeter confirmed', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FOT-2', fieldCode: 'FLD_TIME_OUT', fieldLabel: 'Time-Out: Entire surgical team verbally confirmed patient, procedure and anticipated critical events', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FOT-3', fieldCode: 'FLD_SIGN_OUT', fieldLabel: 'Sign-Out: Instrument, sponge and needle counts verified correct', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FOT-4', fieldCode: 'FLD_SPECIMEN_LABEL', fieldLabel: 'Pathology Specimen Accurately Labeled with Patient MRN', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
          ],
        },
        {
          id: 'SEC-OT-2',
          sectionTitle: 'Operative Findings & Procedure Summary',
          nickName: 'Surgical Log',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 2,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FOT-5', fieldCode: 'FLD_PROCEDURE_PERFORMED', fieldLabel: 'Exact Procedure Name Performed', fieldType: 'TEXT', placeholder: 'e.g. Diagnostic Laparoscopy and Appendectomy', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FOT-6', fieldCode: 'FLD_ESTIMATED_BLOOD_LOSS', fieldLabel: 'Estimated Blood Loss (EBL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '50', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FOT-7', fieldCode: 'FLD_SURGEON_NARRATIVE', fieldLabel: 'Intra-Operative Narrative & Technique', fieldType: 'TEXTAREA', placeholder: 'Standard 3-port entry, mesoappendix coagulated, base ligated with endoloop...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-POST-OP',
      templateCode: 'POST-OP',
      templateName: 'POST OP (PACU Recovery & Aldrete Score)',
      specialty: 'Post-Anesthesia Care Unit (PACU)',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'INPATIENT',
      formGroupRole: 'IP',
      assignedDepartments: ['PACU Recovery Room', 'Post-Surgical Floor'],
      assignedDoctors: ['PACU Recovery Nurse', 'Dr. Vikram Sharma'],
      sections: [
        {
          id: 'SEC-POP-1',
          sectionTitle: 'Aldrete Recovery Scoring & Discharge Criteria',
          nickName: 'Aldrete Score',
          fieldsCount: 6,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FPOP-1', fieldCode: 'FLD_ALDRETE_ACTIVITY', fieldLabel: 'Activity: Moves all 4 extremities voluntarily (2), 2 extremities (1), none (0)', fieldType: 'DROPDOWN', options: ['2 - Moves 4 extremities', '1 - Moves 2 extremities', '0 - Unable to move extremities'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FPOP-2', fieldCode: 'FLD_ALDRETE_RESP', fieldLabel: 'Respiration: Breathes deeply & coughs (2), dyspneic (1), apneic (0)', fieldType: 'DROPDOWN', options: ['2 - Deep breath & cough freely', '1 - Dyspneic / shallow breathing', '0 - Apneic'], isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FPOP-3', fieldCode: 'FLD_ALDRETE_CIRC', fieldLabel: 'Circulation: BP within +/- 20mmHg of baseline (2), +/- 20-50mmHg (1), >50mmHg (0)', fieldType: 'DROPDOWN', options: ['2 - BP +/- 20mmHg pre-op', '1 - BP +/- 20-50mmHg pre-op', '0 - BP +/- >50mmHg pre-op'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FPOP-4', fieldCode: 'FLD_ALDRETE_CONSCIOUS', fieldLabel: 'Consciousness: Fully awake (2), arousable on calling (1), not responding (0)', fieldType: 'DROPDOWN', options: ['2 - Fully awake', '1 - Arousable on calling', '0 - Not responding'], isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
            { id: 'FPOP-5', fieldCode: 'FLD_ALDRETE_O2', fieldLabel: 'O2 Saturation: SpO2 > 92% on room air (2), requires supplemental O2 (1), SpO2 < 90% (0)', fieldType: 'DROPDOWN', options: ['2 - SpO2 > 92% room air', '1 - Requires supplemental O2', '0 - SpO2 < 90% with O2'], isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
            { id: 'FPOP-6', fieldCode: 'FLD_FIT_FOR_WARD', fieldLabel: 'Fit for Transfer to Surgical Inpatient Ward (Aldrete >= 9)', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 6, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-STD-MRD',
      templateCode: 'MRD-DISCHARGE',
      templateName: 'MRD (Hospital Discharge Summary & Claims)',
      specialty: 'Medical Records & Inpatient Services',
      panelType: 'STANDARD',
      version: 'v9.3',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'INPATIENT',
      formGroupRole: 'MRD_CLAIMS',
      assignedDepartments: ['MRD Department', 'Medical Inpatient Unit', 'Insurance Claims Office'],
      assignedDoctors: ['Discharge Consultant', 'Dr. Alexander Reed', 'MRD Officer'],
      sections: [
        {
          id: 'SEC-MRD-1',
          sectionTitle: 'Inpatient Hospital Course & Discharge Condition',
          nickName: 'Hospital Course',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'INPATIENT',
          retainRevisions: true,
          saveAndComplete: true,
          doctorSignature: true,
          patientSignature: true,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FMRD-1', fieldCode: 'FLD_DISCHARGE_CONDITION', fieldLabel: 'Condition at Time of Discharge', fieldType: 'DROPDOWN', options: ['Improved / Hemodynamically Stable', 'Cured / Resolved', 'Transferred to Tertiary Center', 'Discharged Against Medical Advice (DAMA)', 'Expired'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FMRD-2', fieldCode: 'FLD_FINAL_DX_ICD', fieldLabel: 'Final Primary Discharge ICD-10 Diagnosis', fieldType: 'TEXT', placeholder: 'K35.80 - Acute appendicitis', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FMRD-3', fieldCode: 'FLD_HOSPITAL_COURSE_SUMMARY', fieldLabel: 'Brief Narrative of Inpatient Course', fieldType: 'TEXTAREA', placeholder: 'Admitted with acute abdominal pain, underwent uncomplicated appendectomy, tolerated oral diet, afebrile on discharge...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
            { id: 'FMRD-4', fieldCode: 'FLD_DISCHARGE_ADVICE', fieldLabel: 'Discharge Instructions & Emergency Warning Signs', fieldType: 'TEXTAREA', placeholder: 'Wound care instructions, seek immediate ER attention if fever > 38.5C, wound discharge, severe pain...', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
          ],
        },
      ],
    },

    // =========================================================================
    // REFERENCE CUSTOM SPECIALTY EMA FORMS (Dental, Eye, OBGYN, PAC, Physio, Peds)
    // =========================================================================
    {
      id: 'TPL-CUST-DENT',
      templateCode: 'DENT-01',
      templateName: 'Dental Examination & Odontogram Chart',
      specialty: 'Dental / Maxillofacial',
      panelType: 'CUSTOM',
      version: 'v2.0',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'CLINICIANS',
      assignedDepartments: ['Dental Operatory 1', 'Orthodontic Clinic', 'Oral Surgery'],
      assignedDoctors: ['Dr. Tariq Al Mansoori'],
      sections: [
        {
          id: 'SEC-DENT-1',
          sectionTitle: 'Interactive Dental Odontogram FDI Chart',
          nickName: 'Odontogram Chart',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FDENT-1', fieldCode: 'FLD_ODONTOGRAM_GRID', fieldLabel: 'FDI Tooth Matrix (Adult 32-Tooth / Pediatric 20-Tooth)', fieldType: 'ODONTOGRAM', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FDENT-2', fieldCode: 'FLD_GINGIVAL_INDEX', fieldLabel: 'Gingival / Periodontal Status', fieldType: 'DROPDOWN', options: ['Healthy / No Inflammation', 'Mild Gingivitis (Marginal erythema)', 'Moderate Periodontitis (Pocket depth 4-5mm)', 'Severe Periodontitis (Pocket depth > 6mm, bone loss)'], isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FDENT-3', fieldCode: 'FLD_TREATMENT_PLAN_DENT', fieldLabel: 'Proposed Dental Procedures', fieldType: 'TEXTAREA', placeholder: 'Composite restoration #46 occlusal, ultrasonic scaling & polishing...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-EYE',
      templateCode: 'EYE-OPT-01',
      templateName: 'Ophthalmology & Optometry Refraction Form',
      specialty: 'Ophthalmology & Optometry',
      panelType: 'CUSTOM',
      version: 'v2.2',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'CLINICIANS',
      assignedDepartments: ['Eye Clinic', 'Optometry Suite 2', 'Refraction Room'],
      assignedDoctors: ['Dr. Sarah Jenkins'],
      sections: [
        {
          id: 'SEC-EYE-1',
          sectionTitle: 'Visual Acuity & Refraction Matrix',
          nickName: 'Snellen & Refraction',
          fieldsCount: 4,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FEYE-1', fieldCode: 'FLD_SNELLEN_VA', fieldLabel: 'Snellen Visual Acuity Matrix (OD Right / OS Left)', fieldType: 'VA_CHART', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FEYE-2', fieldCode: 'FLD_IOP_TONOMETRY', fieldLabel: 'Intraocular Pressure (IOP) Goldmann Tonometry', fieldType: 'TEXT', placeholder: 'OD: 15 mmHg | OS: 16 mmHg', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FEYE-3', fieldCode: 'FLD_SLIT_LAMP', fieldLabel: 'Slit Lamp Anterior Segment Findings', fieldType: 'TEXTAREA', placeholder: 'Cornea clear, anterior chamber deep and quiet, lens clear bilaterally...', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
            { id: 'FEYE-4', fieldCode: 'FLD_FUNDUS_EXAM', fieldLabel: 'Dilated Funduscopy (Optic Disc & Macula)', fieldType: 'TEXTAREA', placeholder: 'Disc pink, cup-to-disc ratio 0.3, macula intact, vessels normal caliber...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-OBGYN',
      templateCode: 'OBGYN-ANC-01',
      templateName: 'Antenatal Care (ANC) & Obstetric Form',
      specialty: 'Obstetrics & Gynecology',
      panelType: 'CUSTOM',
      version: 'v2.1',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'CLINICIANS',
      assignedDepartments: ['Maternity OPD', 'Antenatal Clinic 3', 'Fetal Assessment Unit'],
      assignedDoctors: ['Dr. Fatima Al Zahra'],
      sections: [
        {
          id: 'SEC-OB-1',
          sectionTitle: 'Obstetric History (GPTAL) & Gestational Milestones',
          nickName: 'ANC Milestones',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ADULT',
          fields: [
            { id: 'FOB-1', fieldCode: 'FLD_OB_GRAVIDA', fieldLabel: 'Gravida (Total Pregnancies)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ADULT' },
            { id: 'FOB-2', fieldCode: 'FLD_OB_PARA', fieldLabel: 'Para (Viable Births)', fieldType: 'NUMBER', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ADULT' },
            { id: 'FOB-3', fieldCode: 'FLD_LMP_DATE', fieldLabel: 'Last Menstrual Period (LMP)', fieldType: 'DATE', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ADULT' },
            { id: 'FOB-4', fieldCode: 'FLD_EDD_DATE', fieldLabel: 'Estimated Due Date (EDD by Naegele Rule)', fieldType: 'DATE', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ADULT' },
            { id: 'FOB-5', fieldCode: 'FLD_FETAL_HEART_RATE', fieldLabel: 'Fetal Heart Rate (FHR Doppler)', fieldType: 'NUMBER', unit: 'bpm', placeholder: '142', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ADULT' },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-PED-WELL',
      templateCode: 'PED-WELL-01',
      templateName: 'Pediatric Well-Child & Growth Assessment',
      specialty: 'Pediatrics & Neonatology',
      panelType: 'CUSTOM',
      version: 'v1.8',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'CLINICIANS',
      assignedDepartments: ['Pediatric Clinic', 'Child Wellness Suite', 'Neonatal Follow-up'],
      assignedDoctors: ['Dr. Maya Patel', 'Pediatric Specialist'],
      sections: [
        {
          id: 'SEC-PED-1',
          sectionTitle: 'Pediatric Anthropometry & WHO Growth Percentiles',
          nickName: 'Child Growth',
          fieldsCount: 5,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'CHILD',
          fields: [
            { id: 'FPED-1', fieldCode: 'FLD_BIRTH_WEIGHT', fieldLabel: 'Birth Weight', fieldType: 'NUMBER', unit: 'kg', placeholder: '3.2', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'CHILD' },
            { id: 'FPED-2', fieldCode: 'FLD_HEAD_CIRC', fieldLabel: 'Head Circumference (OFC)', fieldType: 'NUMBER', unit: 'cm', placeholder: '36.0', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'CHILD' },
            { id: 'FPED-3', fieldCode: 'FLD_LENGTH_HEIGHT', fieldLabel: 'Recumbent Length / Standing Height', fieldType: 'NUMBER', unit: 'cm', placeholder: '85', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'CHILD' },
            { id: 'FPED-4', fieldCode: 'FLD_WEIGHT_AGE_PERCENTILE', fieldLabel: 'WHO Weight-for-Age Percentile', fieldType: 'DROPDOWN', options: ['< 3rd percentile (Severe Wasting)', '3rd - 15th percentile', '15th - 85th percentile (Normal)', '> 85th percentile (Overweight)'], isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'CHILD' },
            { id: 'FPED-5', fieldCode: 'FLD_DEV_MILESTONES', fieldLabel: 'Denver Developmental Milestones Status', fieldType: 'DROPDOWN', options: ['Appropriate for Chronological Age', 'Mild Developmental Delay', 'Significant Motor Delay', 'Significant Speech / Language Delay'], isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'CHILD' },
          ],
        },
      ],
    },
    {
      id: 'TPL-CUST-PHYSIO',
      templateCode: 'PHYSIO-01',
      templateName: 'Physiotherapy & Musculoskeletal ROM Matrix',
      specialty: 'Physiotherapy & Rehabilitation',
      panelType: 'CUSTOM',
      version: 'v1.4',
      status: 'ACTIVE',
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: 'OUTPATIENT',
      formGroupRole: 'TEST',
      assignedDepartments: ['Physiotherapy OPD', 'Rehabilitation Center'],
      assignedDoctors: ['Dr. Maya Patel'],
      sections: [
        {
          id: 'SEC-PH1',
          sectionTitle: 'Joint Range of Motion (ROM) & Goniometry',
          nickName: 'Joint ROM',
          fieldsCount: 3,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: 'OUTPATIENT',
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
          fields: [
            { id: 'FPH-1', fieldCode: 'FLD_TARGET_JOINT', fieldLabel: 'Target Joint / Extremity', fieldType: 'DROPDOWN', options: ['Shoulder (Flexion/Abduction)', 'Knee (Flexion/Extension)', 'Hip (Internal/External)', 'Cervical Spine', 'Lumbar Spine'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
            { id: 'FPH-2', fieldCode: 'FLD_ROM_DEGREES', fieldLabel: 'Active Range of Motion (Goniometry)', fieldType: 'NUMBER', unit: 'Degrees (°)', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
            { id: 'FPH-3', fieldCode: 'FLD_MUSCLE_GRADE', fieldLabel: 'MRC Muscle Strength Grade (0-5)', fieldType: 'DROPDOWN', options: ['Grade 5 - Normal Strength', 'Grade 4 - Active Against Resistance', 'Grade 3 - Active Against Gravity', 'Grade 2 - Gravity Eliminated', 'Grade 1 - Trace Flicker', 'Grade 0 - Complete Paralysis'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
          ],
        },
      ],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<SpecialtyFormTemplate>(templates[0]);
  const [panelCategoryFilter, setPanelCategoryFilter] = useState<'ALL' | 'STANDARD' | 'CUSTOM'>('ALL');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionReq, setNewSectionReq] = useState<RequirementType>('MANDATORY');
  const [newSectionNickName, setNewSectionNickName] = useState('');
  const [selectedMasterPanel, setSelectedMasterPanel] = useState<StandardPanelTemplate | null>(null);
  const [showPanelSuggestions, setShowPanelSuggestions] = useState(false);
  const [showBrowseLibraryModal, setShowBrowseLibraryModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');

  const panelSearchResults = useMemo(() => {
    return searchStandardPanels(newSectionTitle, selectedTemplate.sections);
  }, [newSectionTitle, selectedTemplate.sections]);

  const activeMasterPanel = useMemo(() => {
    if (selectedMasterPanel) return selectedMasterPanel;
    const trimmed = newSectionTitle.trim().toLowerCase();
    if (!trimmed) return null;
    return (
      STANDARD_PANELS_CATALOG.find(
        (p) =>
          p.sectionTitle.toLowerCase().trim() === trimmed ||
          p.nickName.toLowerCase().trim() === trimmed
      ) || null
    );
  }, [selectedMasterPanel, newSectionTitle]);

  // New Custom Panel Creation Modal
  const [showNewPanelModal, setShowNewPanelModal] = useState(false);
  const [newPanelCode, setNewPanelCode] = useState('');
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelSpecialty, setNewPanelSpecialty] = useState('');
  const [newPanelDepartments, setNewPanelDepartments] = useState('');
  const [newPanelRole, setNewPanelRole] = useState<any>('CLINICIANS');
  const [newPanelScope, setNewPanelScope] = useState<EncounterScope>('ALL');

  // Section / Panel Configuration Drawer / Modal state
  const [configuringSection, setConfiguringSection] = useState<FormAssemblySection | null>(null);

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
  const [newFieldAgeScope, setNewFieldAgeScope] = useState<AgeTargetMode>('ALL');

  // Interactive Live Preview State
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => panelCategoryFilter === 'ALL' || t.panelType === panelCategoryFilter)
      .filter(
        (t) =>
          selectedDoctorFilter === 'ALL' ||
          (t.assignedDoctors || []).some((d) => d.toLowerCase().includes(selectedDoctorFilter.toLowerCase()))
      )
      .filter((t) => selectedRoleFilter === 'ALL' || t.formGroupRole === selectedRoleFilter)
      .filter(
        (t) =>
          t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.assignedDoctors || []).some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [templates, panelCategoryFilter, selectedDoctorFilter, selectedRoleFilter, searchQuery]);

  // Handle Create Custom Panel
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
      layoutOrientation: 'VERTICAL',
      isDefault: false,
      encounterScope: newPanelScope,
      formGroupRole: newPanelRole,
      assignedDepartments: depts,
      assignedDoctors: ['All Attending Specialists'],
      sections: [
        {
          id: `SEC-${Date.now()}-1`,
          sectionTitle: 'Specialty Clinical Findings',
          nickName: 'Clinical Observations',
          fieldsCount: 2,
          isRequired: true,
          requirementType: 'MANDATORY',
          order: 1,
          dockPosition: 'TOP',
          encounterScope: newPanelScope,
          retainRevisions: true,
          saveAndComplete: false,
          doctorSignature: true,
          patientSignature: false,
          witnessSignature: false,
          displayInConsultation: true,
          canSkip: false,
          ageTarget: 'ALL',
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
              ageScope: 'ALL',
            },
            {
              id: `F-${Date.now()}-2`,
              fieldCode: 'FLD_SPECIALTY_NOTES',
              fieldLabel: 'Specialty Assessment Narrative',
              fieldType: 'TEXTAREA',
              placeholder: 'Enter detailed examination narrative...',
              isRequired: false,
              requirementType: 'OPTIONAL',
              order: 2,
              ageScope: 'ALL',
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
    triggerToast(`Custom Panel "${newTemplate.templateName}" created successfully!`);
    if (onSaveTemplate) onSaveTemplate(newTemplate);
  };

  const triggerToast = (msg: string) => {
    setSaveToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
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

    const matchedMaster = activeMasterPanel;
    let fieldsToUse: FormFieldDefinition[] = [];

    if (matchedMaster && matchedMaster.fields.length > 0) {
      fieldsToUse = matchedMaster.fields.map((f, idx) => ({
        ...f,
        id: `F-${Date.now()}-${idx + 1}`,
      }));
    } else {
      const cleanCode = `FLD_${newSectionTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15)}`;
      fieldsToUse = [
        {
          id: `F-${Date.now()}-1`,
          fieldCode: cleanCode,
          fieldLabel: `${newSectionTitle} Finding`,
          fieldType: 'TEXT',
          placeholder: 'Enter clinical observations...',
          isRequired: newSectionReq === 'MANDATORY',
          requirementType: newSectionReq,
          order: 1,
          ageScope: 'ALL',
        },
      ];
    }

    const newSec: FormAssemblySection = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      sectionTitle: newSectionTitle.trim(),
      nickName: newSectionNickName.trim() || (matchedMaster?.nickName || newSectionTitle.trim()),
      fieldsCount: fieldsToUse.length,
      isRequired: newSectionReq === 'MANDATORY',
      requirementType: newSectionReq,
      order: selectedTemplate.sections.length + 1,
      dockPosition: 'TOP',
      encounterScope: selectedTemplate.encounterScope,
      retainRevisions: true,
      saveAndComplete: false,
      doctorSignature: true,
      patientSignature: false,
      witnessSignature: false,
      displayInConsultation: true,
      canSkip: false,
      ageTarget: 'ALL',
      fields: fieldsToUse,
    };
    const updated: SpecialtyFormTemplate = {
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSec],
    };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    setNewSectionTitle('');
    setNewSectionNickName('');
    setSelectedMasterPanel(null);
    setShowPanelSuggestions(false);
    triggerToast(`Added panel "${newSec.sectionTitle}" (${fieldsToUse.length} fields) to ${selectedTemplate.templateName}`);
    if (onSaveTemplate) onSaveTemplate(updated);
  };

  const handleRemoveSection = (sectionId: string) => {
    const updated: SpecialtyFormTemplate = {
      ...selectedTemplate,
      sections: selectedTemplate.sections.filter((s) => s.id !== sectionId),
    };
    setSelectedTemplate(updated);
    setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    triggerToast('Section removed');
    if (onSaveTemplate) onSaveTemplate(updated);
  };

  const handleSave = () => {
    if (onSaveTemplate) onSaveTemplate(selectedTemplate);
    triggerToast(`Form Assembly configuration for "${selectedTemplate.templateName}" saved successfully!`);
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
    setNewFieldAgeScope('ALL');
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
      ageScope: newFieldAgeScope,
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
    setNewFieldAgeScope('ALL');
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
    triggerToast(`Field schema for "${editingSection.sectionTitle}" updated.`);
    if (onSaveTemplate) onSaveTemplate(updatedTemplate);
  };

  const handleSaveSectionConfig = () => {
    if (!configuringSection) return;
    const updatedSections = selectedTemplate.sections.map((s) =>
      s.id === configuringSection.id ? configuringSection : s
    );
    const updatedTemplate = { ...selectedTemplate, sections: updatedSections };
    setSelectedTemplate(updatedTemplate);
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)));
    setConfiguringSection(null);
    triggerToast(`Panel settings updated for "${configuringSection.sectionTitle}"`);
    if (onSaveTemplate) onSaveTemplate(updatedTemplate);
  };

  // Toggle tooth in Odontogram
  const toggleTooth = (toothNumber: number) => {
    setSelectedTeeth((prev) =>
      prev.includes(toothNumber) ? prev.filter((t) => t !== toothNumber) : [...prev, toothNumber]
    );
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
            zIndex: 99999,
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
          {saveToastMessage || 'Form assembly saved successfully!'}
        </div>
      )}

      {/* Global Top Banner & Age-Based View Switcher */}
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
            <span style={{ fontSize: 22, color: colors.primary }}>📑</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              EMA Forms & Specialty Panel Assembly
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: radii.full,
              }}
            >
              SIMPLEX HIMES v9.3 MATCHED
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            Configure and document Standard and Custom EMA forms, panel libraries, adult vs child dynamic views, and options end-to-end.
          </p>
        </div>

        {/* Global Age-Based View Switcher (Adult vs Child vs Neonate) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radii.md,
              padding: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, padding: '0 8px', textTransform: 'uppercase' }}>
              Patient Age Mode:
            </span>
            <button
              type="button"
              onClick={() => setActiveAgeMode('ADULT')}
              style={{
                border: 'none',
                borderRadius: radii.sm,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: activeAgeMode === 'ADULT' ? 700 : 500,
                backgroundColor: activeAgeMode === 'ADULT' ? colors.primary : 'transparent',
                color: activeAgeMode === 'ADULT' ? '#ffffff' : colors.textBody,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>👤 Adult (≥ 18y)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAgeMode('CHILD')}
              style={{
                border: 'none',
                borderRadius: radii.sm,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: activeAgeMode === 'CHILD' ? 700 : 500,
                backgroundColor: activeAgeMode === 'CHILD' ? '#7c3aed' : 'transparent',
                color: activeAgeMode === 'CHILD' ? '#ffffff' : colors.textBody,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>👶 Pediatric / Child (&lt; 18y)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAgeMode('NEONATE')}
              style={{
                border: 'none',
                borderRadius: radii.sm,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: activeAgeMode === 'NEONATE' ? 700 : 500,
                backgroundColor: activeAgeMode === 'NEONATE' ? '#d97706' : 'transparent',
                color: activeAgeMode === 'NEONATE' ? '#ffffff' : colors.textBody,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🍼 Neonate (&lt; 2y)</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button
              variant="secondary"
              size="md"
              icon="fa-database"
              onClick={() => {
                window.location.href = '/emr/masters';
              }}
              style={{ backgroundColor: '#1e293b', color: '#ffffff', border: 'none' }}
            >
              EMR Masters (77)
            </Button>
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
      </div>

      {/* Main 2-Column Split: Form Library (35%) & Assembly Detail / Editor (65%) */}
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        {/* Left Column: Form & Panel Library */}
        <div style={{ flex: '1 1 350px', maxWidth: 440 }}>
          <Card title="EMA Forms & Panels Library" padding={spacing.md} style={{ marginBottom: spacing.md }}>
            {/* Filter Tabs: All / Standard / Custom */}
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
                { id: 'ALL', label: 'All Forms', count: templates.length },
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

            {/* Filter by Role / Group */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: spacing.sm }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: colors.textMuted, marginBottom: 3, textTransform: 'uppercase' }}>
                  Role Group:
                </label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 11,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.borderStrong}`,
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Groups</option>
                  <option value="CLINICIANS">Clinicians</option>
                  <option value="NURSING">Nursing</option>
                  <option value="IP_NURSING">IP Nursing</option>
                  <option value="MRD_CLAIMS">MRD & Claims</option>
                  <option value="OT_FORMS">OT Forms</option>
                  <option value="EMR">EMR</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: colors.textMuted, marginBottom: 3, textTransform: 'uppercase' }}>
                  Doctor / Clinician:
                </label>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 11,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.borderStrong}`,
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Clinicians</option>
                  <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                  <option value="Dr. Tariq Al Mansoori">Dr. Tariq Al Mansoori</option>
                  <option value="Dr. Fatima Al Zahra">Dr. Fatima Al Zahra</option>
                  <option value="Dr. Vikram Sharma">Dr. Vikram Sharma</option>
                  <option value="Dr. Maya Patel">Dr. Maya Patel</option>
                  <option value="Dr. Alexander Reed">Dr. Alexander Reed</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: spacing.sm }}>
              <Input
                label=""
                placeholder="Search forms, panels, specialty..."
                leftIcon="fa fa-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Templates List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
                maxHeight: 580,
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
                          {tpl.isDefault && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                color: '#047857',
                                backgroundColor: '#d1fae5',
                                border: '1px solid #6ee7b7',
                                padding: '1px 5px',
                                borderRadius: radii.sm,
                              }}
                            >
                              DEFAULT
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted }}>
                            {tpl.templateCode}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
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
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
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
                        fontSize: 11,
                        color: colors.textMuted,
                        marginTop: 8,
                        borderTop: `1px solid ${isSelected ? colors.primaryMid : '#f1f5f9'}`,
                        paddingTop: 6,
                      }}
                    >
                      <span>
                        <i className="fa fa-cubes" style={{ marginRight: 4, color: colors.primary }} />
                        {tpl.sections.length} Panels
                      </span>
                      <span>
                        <i className="fa fa-building-o" style={{ marginRight: 4 }} />
                        {tpl.encounterScope}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Template Assembly Detail & Editor */}
        <div style={{ flex: '2 1 600px' }}>
          <Card
            title={`Form Architecture: ${selectedTemplate.templateName}`}
            padding={spacing.md}
            style={{ marginBottom: spacing.md }}
          >
            {/* Form Attributes Summary Banner */}
            <div
              style={{
                backgroundColor: colors.surfaceSunken,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '14px 18px',
                marginBottom: spacing.md,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  Form Classification
                </span>
                <div style={{ marginTop: 4 }}>
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
                    {selectedTemplate.panelType === 'STANDARD' ? '🏛️ STANDARD SYSTEM' : '✨ CUSTOM SPECIALTY'}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  Layout & Orientation
                </span>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
                  {selectedTemplate.layoutOrientation === 'HORIZONTAL' ? '↔️ Horizontal (Tabbed)' : '↕️ Vertical (Accordion Canvas)'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  Encounter Scoping
                </span>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
                  🏷️ {selectedTemplate.encounterScope}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  Role Group
                </span>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
                  👥 {selectedTemplate.formGroupRole}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  Assigned Clinicians
                </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {selectedTemplate.assignedDoctors.map((doc, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: colors.primaryLight,
                        border: `1px solid ${colors.primaryMid}`,
                        color: colors.primary,
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: radii.sm,
                        fontWeight: 700,
                      }}
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Panels / Sections Header */}
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
                Form Panels & Sections ({selectedTemplate.sections.length})
              </h4>
              <span style={{ fontSize: 11, color: colors.textMuted }}>
                Active Patient Age Filter: <strong>{activeAgeMode}</strong>
              </span>
            </div>

            {/* List of Panels in Active Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.md }}>
              {selectedTemplate.sections.map((sec, idx) => {
                // Determine whether this panel is visible for current age mode
                const isAgeMatch =
                  !sec.ageTarget ||
                  sec.ageTarget === 'ALL' ||
                  sec.ageTarget === activeAgeMode ||
                  (sec.ageTarget === 'CHILD' && (activeAgeMode === 'CHILD' || activeAgeMode === 'NEONATE'));

                return (
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
                      opacity: isAgeMatch ? 1 : 0.6,
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                            {sec.nickName || sec.sectionTitle}
                          </span>
                          {sec.nickName && sec.nickName !== sec.sectionTitle && (
                            <span style={{ fontSize: 11, color: colors.textMuted }}>({sec.sectionTitle})</span>
                          )}
                          {renderRequirementBadge(
                            sec.requirementType || (sec.isRequired ? 'MANDATORY' : 'OPTIONAL'),
                            () => cycleSectionRequirement(sec.id)
                          )}
                          {sec.ageTarget && sec.ageTarget !== 'ALL' && (
                            <span
                              style={{
                                backgroundColor: '#fdf4ff',
                                color: '#a21caf',
                                border: '1px solid #f0abfc',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: radii.sm,
                              }}
                            >
                              {sec.ageTarget === 'CHILD' ? '👶 Child Only' : '👤 Adult Only'}
                            </span>
                          )}
                          {sec.doctorSignature && (
                            <span title="Doctor Signature Required" style={{ fontSize: 11, color: colors.primary }}>
                              ✍️ Dr Sig
                            </span>
                          )}
                          {sec.patientSignature && (
                            <span title="Patient Signature Required" style={{ fontSize: 11, color: '#059669' }}>
                              ✍️ Pt Sig
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                          {sec.fields?.length || sec.fieldsCount || 0} Fields • Dock: {sec.dockPosition || 'TOP'} • Rev: {sec.retainRevisions ? 'Retained' : 'Overwrite'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Panel */}
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
                        }}
                      >
                        <i className="fa fa-arrow-down" />
                      </button>

                      {/* Options / Behavior Settings Button */}
                      <button
                        type="button"
                        title="Panel Options (Signatures, Nickname, Dock, Scope)"
                        onClick={() => setConfiguringSection(JSON.parse(JSON.stringify(sec)))}
                        style={{
                          border: `1px solid ${colors.borderStrong}`,
                          background: '#ffffff',
                          borderRadius: radii.sm,
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: colors.textBody,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <i className="fa fa-sliders" />
                        Options
                      </button>

                      {/* Standard Vital Master Element Editor Button (46 Elements) */}
                      {sec.sectionTitle?.toUpperCase().includes('VITAL') && (
                        <button
                          type="button"
                          title="Configure Standard Vital Elements (All 46)"
                          onClick={() => {
                            window.location.hash = `#/emr/edit-vital/${sec.id || 'panel_1_1_0'}/${selectedTemplate.id || 1}`;
                          }}
                          style={{
                            border: '1px solid #c05621',
                            background: '#fffaf0',
                            borderRadius: radii.sm,
                            padding: '5px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: '#c05621',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 1px 2px rgba(192,86,33,0.1)',
                          }}
                        >
                          <i className="fa fa-heart-pulse" />
                          Vital Elements (46)
                        </button>
                      )}

                      {/* Fields Designer Button */}
                      <button
                        type="button"
                        title="Configure Panel Fields & Preview"
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

                      {/* Remove Section */}
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
                );
              })}
            </div>

            {/* Add New Section / Panel to Selected Template */}
            <div
              style={{
                backgroundColor: colors.surfaceSunken,
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: radii.md,
                padding: '16px',
                marginTop: spacing.md,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                    ➕ Add Panel to Template
                  </span>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                    (Type to search standard panels from library or create custom)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBrowseLibraryModal(true)}
                  style={{
                    border: '1px solid #3b82f6',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '4px 10px',
                    borderRadius: radii.sm,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <i className="fa fa-th-list" />
                  Browse Standard Panels ({STANDARD_PANELS_CATALOG.length})
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: spacing.sm,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Search Input with floating suggestions */}
                <div style={{ flex: '2 1 240px', position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      label=""
                      placeholder="Search panel (e.g. Chief Complaints, Vitals, Physical Exam)..."
                      value={newSectionTitle}
                      onChange={(e) => {
                        setNewSectionTitle(e.target.value);
                        setSelectedMasterPanel(null);
                        setShowPanelSuggestions(true);
                      }}
                      onFocus={() => setShowPanelSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSection();
                        if (e.key === 'Escape') setShowPanelSuggestions(false);
                      }}
                    />
                    {newSectionTitle && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewSectionTitle('');
                          setSelectedMasterPanel(null);
                          setShowPanelSuggestions(false);
                        }}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Suggestions Popover / Dropdown */}
                  {showPanelSuggestions && panelSearchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: radii.md,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 9999,
                        marginTop: 4,
                        maxHeight: 280,
                        overflowY: 'auto',
                      }}
                    >
                      <div
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f1f5f9',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>AVAILABLE STANDARD PANELS ({panelSearchResults.length})</span>
                        <span style={{ fontWeight: 400, color: '#64748b' }}>Click to select & load details</span>
                      </div>
                      {panelSearchResults.map((panel) => (
                        <div
                          key={panel.id}
                          onClick={() => {
                            setNewSectionTitle(panel.sectionTitle);
                            setNewSectionNickName(panel.nickName);
                            setNewSectionReq(panel.requirementType);
                            setSelectedMasterPanel(panel);
                            setShowPanelSuggestions(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: panel.isAlreadyAdded ? '#f8fafc' : '#ffffff',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = panel.isAlreadyAdded ? '#f8fafc' : '#ffffff';
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i className={`fa ${panel.icon}`} style={{ color: '#2563eb', fontSize: 13 }} />
                              <strong style={{ fontSize: 13, color: '#1e293b' }}>{panel.sectionTitle}</strong>
                              <span style={{ fontSize: 11, color: '#64748b' }}>({panel.nickName})</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              {panel.description}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 12,
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                              }}
                            >
                              {panel.fields.length} Fields
                            </span>
                            {panel.isAlreadyAdded ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                }}
                              >
                                ✓ In Template
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  backgroundColor: '#dbeafe',
                                  color: '#1d4ed8',
                                }}
                              >
                                + Select
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nickname Input */}
                <div style={{ flex: '1 1 150px' }}>
                  <Input
                    label=""
                    placeholder="Panel Nickname"
                    value={newSectionNickName}
                    onChange={(e) => setNewSectionNickName(e.target.value)}
                  />
                </div>

                {/* Requirement Select */}
                <div style={{ minWidth: 120 }}>
                  <select
                    value={newSectionReq}
                    onChange={(e) => setNewSectionReq(e.target.value as RequirementType)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: 12,
                      borderRadius: radii.sm,
                      border: `1px solid ${colors.borderStrong}`,
                      backgroundColor: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    <option value="MANDATORY">Mandatory</option>
                    <option value="OPTIONAL">Optional</option>
                    <option value="CONDITIONAL">Conditional</option>
                  </select>
                </div>

                {/* Add Button */}
                <Button
                  variant="primary"
                  size="md"
                  icon="fa-plus"
                  onClick={handleAddSection}
                  disabled={!newSectionTitle.trim()}
                >
                  Add Panel
                </Button>
              </div>

              {/* Loaded Panel Details Preview Box */}
              {activeMasterPanel && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: radii.sm,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
                        ✓ Loaded Panel Details: <strong>{activeMasterPanel.sectionTitle}</strong>
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                        {activeMasterPanel.fields.length} Fields Configured
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                        Category: {activeMasterPanel.category}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>
                      ⚡ Ready to Add — Click "+ Add Panel" to insert
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#374151', fontWeight: 700 }}>Predefined Fields:</span>
                    {activeMasterPanel.fields.map((f, i) => (
                      <span
                        key={f.id}
                        style={{
                          fontSize: 11,
                          backgroundColor: '#ffffff',
                          border: '1px solid #bbf7d0',
                          padding: '2px 8px',
                          borderRadius: 4,
                          color: '#1e293b',
                        }}
                      >
                        <strong>{i + 1}. {f.fieldLabel}</strong> <span style={{ color: '#64748b' }}>({f.fieldType}{f.unit ? ` • ${f.unit}` : ''})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Panel Options Configuration Drawer / Modal                                */}
      {/* ========================================================================= */}
      {configuringSection && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 99999,
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
              maxWidth: 620,
              padding: 24,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${colors.border}`, paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, color: colors.primary }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                  Panel Behavior & Options: {configuringSection.sectionTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfiguringSection(null)}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: colors.textMuted }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Input
                  label="Panel Display Nickname (Override Title in Consultation)"
                  placeholder="e.g. Clinical Vitals"
                  value={configuringSection.nickName || ''}
                  onChange={(e) => setConfiguringSection({ ...configuringSection, nickName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                    Dock Position
                  </label>
                  <select
                    value={configuringSection.dockPosition || 'TOP'}
                    onChange={(e) => setConfiguringSection({ ...configuringSection, dockPosition: e.target.value as DockPosition })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}
                  >
                    <option value="TOP">Top Dock (Main Canvas Pane)</option>
                    <option value="RIGHT">Right Dock (Side Slideout)</option>
                    <option value="FULL">Full Canvas Width</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                    Age-Target Filtering
                  </label>
                  <select
                    value={configuringSection.ageTarget || 'ALL'}
                    onChange={(e) => setConfiguringSection({ ...configuringSection, ageTarget: e.target.value as AgeTargetMode })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}
                  >
                    <option value="ALL">All Patients (Adults & Children)</option>
                    <option value="ADULT">Adult Only (Age ≥ 18)</option>
                    <option value="CHILD">Pediatric Only (Age &lt; 18)</option>
                    <option value="NEONATE">Neonate / Infant (&lt; 2y)</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes for Options Matching Reference */}
              <div style={{ backgroundColor: colors.surfaceSunken, padding: 14, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase' }}>
                  Operational Flags & Signatures
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.retainRevisions)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, retainRevisions: e.target.checked })}
                    />
                    Retain Revisions (History log)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.saveAndComplete)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, saveAndComplete: e.target.checked })}
                    />
                    Save & Complete Trigger
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.doctorSignature)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, doctorSignature: e.target.checked })}
                    />
                    Doctor Signature Required
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.patientSignature)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, patientSignature: e.target.checked })}
                    />
                    Patient Signature Required
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.witnessSignature)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, witnessSignature: e.target.checked })}
                    />
                    Witness Signature Required
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(configuringSection.canSkip)}
                      onChange={(e) => setConfiguringSection({ ...configuringSection, canSkip: e.target.checked })}
                    />
                    Can Skip Option in Flow
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
              <Button variant="secondary" size="md" onClick={() => setConfiguringSection(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" icon="fa-check" onClick={handleSaveSectionConfig}>
                Save Panel Options
              </Button>
            </div>
          </div>
        </div>
      )}

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
            zIndex: 99999,
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <Input
                  label="Panel / Form Code *"
                  placeholder="e.g. DERM-01"
                  value={newPanelCode}
                  onChange={(e) => setNewPanelCode(e.target.value)}
                />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                    Role Group *
                  </label>
                  <select
                    value={newPanelRole}
                    onChange={(e) => setNewPanelRole(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}
                  >
                    <option value="CLINICIANS">Clinicians / Doctors</option>
                    <option value="NURSING">Nursing</option>
                    <option value="IP_NURSING">Inpatient Nursing</option>
                    <option value="MRD_CLAIMS">MRD & Claims</option>
                    <option value="OT_FORMS">Operating Theater</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                    Encounter Scope *
                  </label>
                  <select
                    value={newPanelScope}
                    onChange={(e) => setNewPanelScope(e.target.value as EncounterScope)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}
                  >
                    <option value="ALL">All Encounters (OP & IP)</option>
                    <option value="OUTPATIENT">Outpatient (OP)</option>
                    <option value="INPATIENT">Inpatient (IP)</option>
                    <option value="EMERGENCY">Emergency (ER)</option>
                  </select>
                </div>
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
              maxWidth: 960,
              maxHeight: '92vh',
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
                    Configure Fields: {editingSection.nickName || editingSection.sectionTitle}
                  </h3>
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Form: {selectedTemplate.templateName} ({selectedTemplate.templateCode}) •{' '}
                  {editingSection.fields?.length || 0} Configured Fields • Active Age Mode:{' '}
                  <strong style={{ color: activeAgeMode === 'ADULT' ? colors.primary : '#7c3aed' }}>
                    {activeAgeMode}
                  </strong>
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

            {/* Modal Navigation Tabs: Schema Designer vs Live Encounter Preview */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: `1px solid ${colors.border}`,
                padding: '0 20px',
                backgroundColor: '#ffffff',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
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
                  Live Encounter Preview & Age Testing
                </button>
              </div>

              {/* Age Mode Indicator inside Modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ color: colors.textMuted, fontWeight: 600 }}>Test View:</span>
                <span
                  style={{
                    backgroundColor: activeAgeMode === 'ADULT' ? colors.primaryLight : '#f3e8ff',
                    color: activeAgeMode === 'ADULT' ? colors.primary : '#7c3aed',
                    padding: '2px 8px',
                    borderRadius: radii.sm,
                    fontWeight: 700,
                    border: `1px solid ${activeAgeMode === 'ADULT' ? colors.primaryMid : '#d8b4fe'}`,
                  }}
                >
                  {activeAgeMode === 'ADULT' ? 'Adult Physiological' : 'Pediatric Anthropometric'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {fieldModalTab === 'FIELDS' ? (
                <div>
                  {/* Current Fields Table */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                        Active Clinical Fields ({editingSection.fields?.length || 0})
                      </h4>
                      <span style={{ fontSize: 11, color: colors.textMuted }}>
                        Click on Requirement tag to cycle Mandatory / Optional / Conditional
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
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Age Scope</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Unit / Options</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Requirement</th>
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
                                <td style={{ padding: '8px 10px' }}>
                                  <span
                                    style={{
                                      backgroundColor: f.ageScope === 'CHILD' ? '#f3e8ff' : f.ageScope === 'ADULT' ? '#eff6ff' : '#f1f5f9',
                                      color: f.ageScope === 'CHILD' ? '#7c3aed' : f.ageScope === 'ADULT' ? colors.primary : colors.textMuted,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: radii.sm,
                                    }}
                                  >
                                    {f.ageScope || 'ALL'}
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

                  {/* Enhanced 16-Type Clinical Field Designer Form */}
                  <div
                    style={{
                      backgroundColor: colors.surfaceSunken,
                      border: `1px solid ${colors.borderStrong}`,
                      borderRadius: radii.md,
                      padding: 16,
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                      ➕ Add Clinical Field (16 Canonical Canvas Control Types)
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                      <div>
                        <Input
                          label="Field Label *"
                          placeholder="e.g. Corneal Clarity, Head Circumference"
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
                            fontSize: 12,
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.borderStrong}`,
                            backgroundColor: '#ffffff',
                            color: colors.textMain,
                            outline: 'none',
                            fontWeight: 600,
                          }}
                        >
                          <option value="TEXT">1. Single Line Text</option>
                          <option value="NUMBER">2. Numeric / Measurement</option>
                          <option value="TEXTAREA">3. Multi-line Narrative / Textarea</option>
                          <option value="DROPDOWN">4. Dropdown Single Select</option>
                          <option value="RADIO">5. Radio Button Group</option>
                          <option value="CHECKBOX">6. Boolean Checkbox Toggle</option>
                          <option value="DATE">7. Date / Calendar Picker</option>
                          <option value="ODONTOGRAM">8. Dental Odontogram (32/20-Tooth Grid)</option>
                          <option value="VA_CHART">9. Visual Acuity (Snellen Chart)</option>
                          <option value="DIAGRAM">10. Anatomical Diagram / Body Map</option>
                          <option value="YES_NO">11. Yes / No Toggle</option>
                          <option value="TRUE_FALSE">12. True / False Selection</option>
                          <option value="PERIOD">13. Period / Onset Duration</option>
                          <option value="FRACTION">14. Fraction Input (e.g. 20/20)</option>
                          <option value="GRID">15. Tabular Matrix / Grid</option>
                          <option value="HEADER">16. Sub-section Section Header</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                          Age Scope
                        </label>
                        <select
                          value={newFieldAgeScope}
                          onChange={(e) => setNewFieldAgeScope(e.target.value as AgeTargetMode)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: 12,
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.borderStrong}`,
                            backgroundColor: '#ffffff',
                            fontWeight: 600,
                          }}
                        >
                          <option value="ALL">All Ages (Adult & Child)</option>
                          <option value="ADULT">Adult Only (Age ≥ 18)</option>
                          <option value="CHILD">Pediatric / Child Only (Age &lt; 18)</option>
                          <option value="NEONATE">Neonate / Infant (&lt; 2y)</option>
                        </select>
                      </div>

                      <div>
                        <Input
                          label="Unit of Measure (Optional)"
                          placeholder="e.g. mmHg, bpm, cm, mg/dL"
                          value={newFieldUnit}
                          onChange={(e) => setNewFieldUnit(e.target.value)}
                        />
                      </div>
                    </div>

                    {(newFieldType === 'DROPDOWN' || newFieldType === 'RADIO' || newFieldType === 'GRID') && (
                      <div style={{ marginBottom: 12 }}>
                        <Input
                          label="Select Options (Comma-separated values)"
                          placeholder="e.g. Normal, Mild, Moderate, Severe"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Requirement Type Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMain }}>
                          Requirement Level:
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: colors.dangerText, fontWeight: 700 }}>
                          <input
                            type="radio"
                            name="reqTypeRadioModal"
                            value="MANDATORY"
                            checked={newFieldReqType === 'MANDATORY'}
                            onChange={() => setNewFieldReqType('MANDATORY')}
                          />
                          Mandatory
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: colors.textBody, fontWeight: 600 }}>
                          <input
                            type="radio"
                            name="reqTypeRadioModal"
                            value="OPTIONAL"
                            checked={newFieldReqType === 'OPTIONAL'}
                            onChange={() => setNewFieldReqType('OPTIONAL')}
                          />
                          Optional
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: colors.warningText, fontWeight: 700 }}>
                          <input
                            type="radio"
                            name="reqTypeRadioModal"
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
                /* ========================================================================= */
                /* Live Interactive Encounter Form Preview (With Adult/Child Switching)      */
                /* ========================================================================= */
                <div>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: activeAgeMode === 'ADULT' ? colors.primaryLight : '#fdf4ff',
                      borderRadius: radii.md,
                      border: `1px solid ${activeAgeMode === 'ADULT' ? colors.primaryMid : '#f0abfc'}`,
                      marginBottom: 16,
                      fontSize: 12,
                      color: activeAgeMode === 'ADULT' ? colors.primaryHover : '#86198f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa fa-info-circle" style={{ fontSize: 16 }} />
                      <span>
                        Simulating Live Encounter Documentation for{' '}
                        <strong>
                          {activeAgeMode === 'ADULT' ? 'Adult Patient (34 Years, Female)' : 'Pediatric Patient (4 Years, Male)'}
                        </strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setActiveAgeMode('ADULT')}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: radii.sm,
                          border: 'none',
                          backgroundColor: activeAgeMode === 'ADULT' ? colors.primary : '#ffffff',
                          color: activeAgeMode === 'ADULT' ? '#ffffff' : colors.textBody,
                          cursor: 'pointer',
                        }}
                      >
                        Adult View
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAgeMode('CHILD')}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: radii.sm,
                          border: 'none',
                          backgroundColor: activeAgeMode === 'CHILD' ? '#7c3aed' : '#ffffff',
                          color: activeAgeMode === 'CHILD' ? '#ffffff' : colors.textBody,
                          cursor: 'pointer',
                        }}
                      >
                        Child View
                      </button>
                    </div>
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
                        {editingSection.nickName || editingSection.sectionTitle}
                      </h4>
                      {renderRequirementBadge(editingSection.requirementType || (editingSection.isRequired ? 'MANDATORY' : 'OPTIONAL'))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {(editingSection.fields || [])
                        .filter((f) => {
                          if (!f.ageScope || f.ageScope === 'ALL') return true;
                          if (activeAgeMode === 'ADULT') return f.ageScope === 'ADULT';
                          return f.ageScope === 'CHILD' || f.ageScope === 'NEONATE';
                        })
                        .map((f) => (
                          <div key={f.id}>
                            {f.fieldType === 'TEXT' && (
                              <Input
                                label={`${f.fieldLabel} ${f.requirementType === 'MANDATORY' ? '*' : f.requirementType === 'CONDITIONAL' ? ' (Conditional)' : ''}`}
                                placeholder={f.placeholder || `Enter ${f.fieldLabel.toLowerCase()}...`}
                                value={previewValues[f.id] || ''}
                                onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              />
                            )}

                            {f.fieldType === 'NUMBER' && (
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                  {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : ''} {f.unit ? `(${f.unit})` : ''}
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="number"
                                    placeholder={f.placeholder || '0.00'}
                                    value={previewValues[f.id] || ''}
                                    onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
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
                                label={`${f.fieldLabel} ${f.requirementType === 'MANDATORY' ? '*' : ''}`}
                                placeholder={f.placeholder || `Enter ${f.fieldLabel.toLowerCase()} narrative...`}
                                rows={3}
                                value={previewValues[f.id] || ''}
                                onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              />
                            )}

                            {f.fieldType === 'DROPDOWN' && (
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                  {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : ''}
                                </label>
                                <select
                                  value={previewValues[f.id] || ''}
                                  onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: 12,
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

                            {f.fieldType === 'YES_NO' && (
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                                  {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : ''}
                                </label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                  {['Yes', 'No'].map((val) => (
                                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                      <input
                                        type="radio"
                                        name={`yn_${f.id}`}
                                        value={val}
                                        checked={previewValues[f.id] === val}
                                        onChange={() => setPreviewValues({ ...previewValues, [f.id]: val })}
                                      />
                                      {val}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {f.fieldType === 'PERIOD' && (
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
                                  {f.fieldLabel} {f.requirementType === 'MANDATORY' ? '*' : ''}
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <input
                                    type="number"
                                    placeholder="3"
                                    style={{ width: '40%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}
                                  />
                                  <select style={{ width: '60%', padding: '8px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                                    <option>Days</option>
                                    <option>Weeks</option>
                                    <option>Months</option>
                                    <option>Hours</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Odontogram Interactive Component */}
                            {f.fieldType === 'ODONTOGRAM' && (
                              <div style={{ gridColumn: '1 / -1', padding: 14, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                                    🦷 {activeAgeMode === 'ADULT' ? 'Adult Permanent 32-Tooth FDI Grid' : 'Pediatric Primary 20-Tooth Deciduous Grid'}
                                  </span>
                                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                                    Selected Teeth: <strong>{selectedTeeth.join(', ') || 'None'}</strong>
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {/* Upper Jaw */}
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {(activeAgeMode === 'ADULT'
                                      ? [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
                                      : [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
                                    ).map((tooth) => {
                                      const isPicked = selectedTeeth.includes(tooth);
                                      return (
                                        <button
                                          key={tooth}
                                          type="button"
                                          onClick={() => toggleTooth(tooth)}
                                          style={{
                                            padding: '6px 8px',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            borderRadius: radii.sm,
                                            border: `1px solid ${isPicked ? colors.primary : colors.border}`,
                                            backgroundColor: isPicked ? colors.primary : '#ffffff',
                                            color: isPicked ? '#ffffff' : colors.textMain,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {tooth}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Lower Jaw */}
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {(activeAgeMode === 'ADULT'
                                      ? [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
                                      : [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
                                    ).map((tooth) => {
                                      const isPicked = selectedTeeth.includes(tooth);
                                      return (
                                        <button
                                          key={tooth}
                                          type="button"
                                          onClick={() => toggleTooth(tooth)}
                                          style={{
                                            padding: '6px 8px',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            borderRadius: radii.sm,
                                            border: `1px solid ${isPicked ? colors.primary : colors.border}`,
                                            backgroundColor: isPicked ? colors.primary : '#ffffff',
                                            color: isPicked ? '#ffffff' : colors.textMain,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {tooth}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Visual Acuity Snellen Chart */}
                            {f.fieldType === 'VA_CHART' && (
                              <div style={{ gridColumn: '1 / -1', padding: 14, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                                  👁️ Snellen Visual Acuity Matrix
                                </span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>OD (Right Eye):</label>
                                    <select style={{ width: '100%', padding: '6px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                                      <option>6/6 (Normal 20/20)</option>
                                      <option>6/9</option>
                                      <option>6/12</option>
                                      <option>6/18</option>
                                      <option>6/60</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>OS (Left Eye):</label>
                                    <select style={{ width: '100%', padding: '6px 10px', fontSize: 12, borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                                      <option>6/6 (Normal 20/20)</option>
                                      <option>6/9</option>
                                      <option>6/12</option>
                                      <option>6/18</option>
                                      <option>6/60</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Anatomical Diagram / Body Map */}
                            {f.fieldType === 'DIAGRAM' && (
                              <div style={{ gridColumn: '1 / -1', padding: 14, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                                  🗺️ Anatomical Body Map & Pain Location Marker
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, border: '2px dashed #cbd5e1', borderRadius: radii.sm, marginTop: 8, color: colors.textMuted, fontSize: 12 }}>
                                  <i className="fa fa-crosshairs" style={{ marginRight: 6 }} /> Click canvas to pinpoint anatomical region or wound location
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
                      <Button
                        variant="primary"
                        size="md"
                        icon="fa-check"
                        onClick={() => triggerToast('Clinical Encounter test inputs verified!')}
                      >
                        Verify & Sign Encounter Preview
                      </Button>
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
                Close
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
      {/* ========================================================================= */}
      {/* Browse Standard Panels Library Modal                                      */}
      {/* ========================================================================= */}
      {showBrowseLibraryModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 99999,
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
              maxWidth: 860,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                  📚 Standard Panels Library ({STANDARD_PANELS_CATALOG.length} Panels)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                  Select any standard panel to insert it directly with all its predefined fields into <strong>{selectedTemplate.templateName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBrowseLibraryModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Panels Grid */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(['General Assessment', 'Nursing & Inpatient', 'Surgical & Peri-Op', 'Specialty Clinics'] as const).map((cat) => {
                const catPanels = STANDARD_PANELS_CATALOG.filter((p) => p.category === cat);
                if (catPanels.length === 0) return null;
                return (
                  <div key={cat}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                      {cat} ({catPanels.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 10 }}>
                      {catPanels.map((p) => {
                        const isAdded = selectedTemplate.sections.some(
                          (s) => s.sectionTitle.toLowerCase().trim() === p.sectionTitle.toLowerCase().trim()
                        );
                        return (
                          <div
                            key={p.id}
                            style={{
                              border: isAdded ? '1px solid #cbd5e1' : '1px solid #bfdbfe',
                              backgroundColor: isAdded ? '#f8fafc' : '#ffffff',
                              borderRadius: radii.md,
                              padding: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: 8,
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className={`fa ${p.icon}`} style={{ color: isAdded ? '#94a3b8' : '#2563eb' }} />
                                  <span style={{ fontSize: 13, fontWeight: 700, color: isAdded ? '#64748b' : '#1e293b' }}>
                                    {p.sectionTitle}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: '#f1f5f9', color: '#475569' }}>
                                  {p.fields.length} Fields
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                {p.description}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                Nickname: <strong>{p.nickName}</strong>
                              </span>
                              <Button
                                variant={isAdded ? 'secondary' : 'primary'}
                                size="sm"
                                icon={isAdded ? 'fa-check' : 'fa-plus'}
                                onClick={() => {
                                  setNewSectionTitle(p.sectionTitle);
                                  setNewSectionNickName(p.nickName);
                                  setNewSectionReq(p.requirementType);
                                  setSelectedMasterPanel(p);
                                  setShowBrowseLibraryModal(false);
                                }}
                              >
                                {isAdded ? 'Select Again' : 'Load Details'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
              <Button variant="secondary" size="md" onClick={() => setShowBrowseLibraryModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
