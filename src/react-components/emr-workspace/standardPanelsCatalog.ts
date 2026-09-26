import type { FormAssemblySection, FormFieldDefinition, RequirementType } from '../EmrFormAssemblyScreen';

export interface StandardPanelTemplate {
  id: string;
  sectionTitle: string;
  nickName: string;
  aliases?: string[];
  category: 'General Assessment' | 'Nursing & Inpatient' | 'Surgical & Peri-Op' | 'Specialty Clinics';
  requirementType: RequirementType;
  description: string;
  icon: string;
  fields: FormFieldDefinition[];
}

export const STANDARD_PANELS_CATALOG: StandardPanelTemplate[] = [
  // =========================================================================
  // GENERAL CLINICAL & OPD ASSESSMENT (INCLUDING STAGING -NORMAL PANELS)
  // =========================================================================
  {
    id: 'STD-PANEL-CC-NORMAL',
    sectionTitle: 'Chief Complaint-Normal',
    nickName: 'Chief Complaint',
    aliases: [
      'Chief Complaint',
      'Chief Complaints',
      'Chief Complaint-Normal',
      'Chief Complaints-Normal',
      'Chief Complaint - Normal',
      'Chief Complaints - Normal',
      'CC-Normal',
      'CC Normal',
      'Presenting Complaints',
      'Reason For Visit',
      'Primary Complaint',
      'Complaint',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Patient primary presenting symptom/complaint, duration, duration unit, severity rating, and clinical notes.',
    icon: 'fa-user-md',
    fields: [
      { id: 'F-CCN-1', fieldCode: 'FLD_CHIEF_COMPLAINT_NAME', fieldLabel: 'Chief Complaint', fieldType: 'TEXT', placeholder: 'Select or enter chief complaint (e.g. Fever, Chest Pain, Abdominal Pain)...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-CCN-2', fieldCode: 'FLD_DURATION_VAL', fieldLabel: 'Duration', fieldType: 'NUMBER', placeholder: 'e.g. 3', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-CCN-3', fieldCode: 'FLD_DURATION_UNIT', fieldLabel: 'Duration Unit', fieldType: 'DROPDOWN', options: ['Hours', 'Days', 'Weeks', 'Months', 'Years'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-CCN-4', fieldCode: 'FLD_SEVERITY', fieldLabel: 'Severity', fieldType: 'DROPDOWN', options: ['Mild', 'Moderate', 'Severe', 'Critical'], isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-CCN-5', fieldCode: 'FLD_DESCRIPTION', fieldLabel: 'Description / Remarks', fieldType: 'TEXTAREA', placeholder: 'Clinical details, onset characteristics, radiation, relieving / aggravating factors...', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-CC-HPI',
    sectionTitle: 'Chief Complaints & History of Present Illness (HPI)',
    nickName: 'Chief Complaints',
    aliases: [
      'Chief Complaints',
      'Chief Complaint',
      'HPI',
      'Chief Complaints & HPI',
      'CC HPI',
      'History of Present Illness',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Patient primary presenting symptoms, duration, severity scale, and chronological progression narrative.',
    icon: 'fa-user-md',
    fields: [
      { id: 'F-CC-1', fieldCode: 'FLD_CHIEF_COMPLAINT', fieldLabel: 'Primary Complaint', fieldType: 'TEXT', placeholder: 'e.g. High grade fever with chills / acute retrosternal chest pain', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-CC-2', fieldCode: 'FLD_DURATION_PERIOD', fieldLabel: 'Duration & Onset Period', fieldType: 'PERIOD', unit: 'Days', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-CC-3', fieldCode: 'FLD_SEVERITY_SCALE', fieldLabel: 'Symptom Severity (VAS / Grade)', fieldType: 'DROPDOWN', options: ['Mild (VAS 1-3)', 'Moderate (VAS 4-6)', 'Severe (VAS 7-9)', 'Excruciating (VAS 10)'], isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-CC-4', fieldCode: 'FLD_HPI_NARRATIVE', fieldLabel: 'History of Present Illness (HPI)', fieldType: 'TEXTAREA', placeholder: 'Chronological symptom progression, triggers, relieving/aggravating factors, associated symptoms...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-HPI-NORMAL',
    sectionTitle: 'History of Present Illness-Normal',
    nickName: 'HPI',
    aliases: [
      'History of Present Illness',
      'HPI',
      'HPI-Normal',
      'History of Present Illness-Normal',
      'History of Present Illness - Normal',
      'Present Illness',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Chronological progression of symptoms, triggers, prior episodes, and associated clinical manifestations.',
    icon: 'fa-file-text-o',
    fields: [
      { id: 'F-HPI-1', fieldCode: 'FLD_HPI_ONSET', fieldLabel: 'Onset & Chronology', fieldType: 'TEXT', placeholder: 'Acute onset / gradual onset over past 3 days...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-HPI-2', fieldCode: 'FLD_HPI_DETAILS', fieldLabel: 'History of Present Illness (HPI) Narrative', fieldType: 'TEXTAREA', placeholder: 'Detailed clinical narration of symptoms, progression, triggers, relieving factors...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-HPI-3', fieldCode: 'FLD_HPI_ASSOCIATED', fieldLabel: 'Associated Symptoms', fieldType: 'TEXT', placeholder: 'e.g. Associated with nausea, vomiting, dizziness...', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-ROS-NORMAL',
    sectionTitle: 'Review of Systems-Normal',
    nickName: 'Review of Systems',
    aliases: [
      'Review of Systems',
      'ROS',
      'Review of Systems-Normal',
      'Review of Systems - Normal',
      'ROS-Normal',
      'System Review',
    ],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'System-by-system inventory: Constitutional, HEENT, CVS, Resp, GI, GU, Musculoskeletal, Neuro, Skin.',
    icon: 'fa-stethoscope',
    fields: [
      { id: 'F-ROS-1', fieldCode: 'FLD_ROS_CONSTITUTIONAL', fieldLabel: 'Constitutional (Fever, chills, weight changes)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-ROS-2', fieldCode: 'FLD_ROS_HEENT', fieldLabel: 'HEENT (Head, Eyes, Ears, Nose, Throat)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-ROS-3', fieldCode: 'FLD_ROS_RESP', fieldLabel: 'Respiratory (Cough, dyspnea, wheezing)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-ROS-4', fieldCode: 'FLD_ROS_CVS', fieldLabel: 'Cardiovascular (Chest pain, palpitations, orthopnea)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-ROS-5', fieldCode: 'FLD_ROS_GI', fieldLabel: 'Gastrointestinal (Abdominal pain, nausea, vomiting, diarrhea)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
      { id: 'F-ROS-6', fieldCode: 'FLD_ROS_GU', fieldLabel: 'Genitourinary (Dysuria, frequency, hematuria)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 6, ageScope: 'ALL' },
      { id: 'F-ROS-7', fieldCode: 'FLD_ROS_NEURO', fieldLabel: 'Neurological (Headache, syncope, numbness, weakness)', fieldType: 'TEXT', placeholder: 'Normal / Negative', isRequired: false, requirementType: 'OPTIONAL', order: 7, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-VITALS-NORMAL',
    sectionTitle: 'Vital Signs-Normal',
    nickName: 'Vital Signs',
    aliases: [
      'Vital Signs',
      'Vitals',
      'Vital Signs-Normal',
      'Vital Signs - Normal',
      'Vitals-Normal',
      'Vitals - Normal',
      'Clinical Vitals',
      'Vidal',
      'Biometrics',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Core physiological biometrics: Blood Pressure, Pulse Rate, Temperature, SpO2, Respiratory Rate, Weight, Height, BMI.',
    icon: 'fa-heartbeat',
    fields: [
      { id: 'F-VSN-1', fieldCode: 'FLD_BP_SYS', fieldLabel: 'Systolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '120', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ADULT' },
      { id: 'F-VSN-2', fieldCode: 'FLD_BP_DIA', fieldLabel: 'Diastolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '80', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ADULT' },
      { id: 'F-VSN-3', fieldCode: 'FLD_PULSE_RATE', fieldLabel: 'Heart / Pulse Rate', fieldType: 'NUMBER', unit: 'bpm', placeholder: '72', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-VSN-4', fieldCode: 'FLD_TEMP_C', fieldLabel: 'Core Temperature (°C)', fieldType: 'NUMBER', unit: '°C', placeholder: '37.0', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
      { id: 'F-VSN-5', fieldCode: 'FLD_SPO2', fieldLabel: 'Oxygen Saturation (SpO2)', fieldType: 'NUMBER', unit: '%', placeholder: '98', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
      { id: 'F-VSN-6', fieldCode: 'FLD_RESP_RATE', fieldLabel: 'Respiratory Rate', fieldType: 'NUMBER', unit: 'breaths/min', placeholder: '16', isRequired: true, requirementType: 'MANDATORY', order: 6, ageScope: 'ALL' },
      { id: 'F-VSN-7', fieldCode: 'FLD_HEIGHT_CM', fieldLabel: 'Height / Length', fieldType: 'NUMBER', unit: 'cm', placeholder: '170', isRequired: false, requirementType: 'OPTIONAL', order: 7, ageScope: 'ALL' },
      { id: 'F-VSN-8', fieldCode: 'FLD_WEIGHT_KG', fieldLabel: 'Body Weight', fieldType: 'NUMBER', unit: 'kg', placeholder: '70', isRequired: true, requirementType: 'MANDATORY', order: 8, ageScope: 'ALL' },
      { id: 'F-VSN-9', fieldCode: 'FLD_PAIN_SCORE', fieldLabel: 'Pain Score (0-10)', fieldType: 'DROPDOWN', options: ['0 - No Hurt', '2 - Mild Hurt', '4 - Moderate Hurt', '6 - Severe Hurt', '8 - Very Severe', '10 - Worst Pain'], isRequired: false, requirementType: 'OPTIONAL', order: 9, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-VITALS',
    sectionTitle: 'Vitals & Physiological Biometrics',
    nickName: 'Clinical Vitals',
    aliases: ['Vitals', 'Clinical Vitals', 'Vitals & Physiological Biometrics', 'Biometrics', 'Vidal'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Core physiological parameters: BP, Heart Rate, SpO2, Temperature, Respiratory Rate, and BMI.',
    icon: 'fa-heartbeat',
    fields: [
      { id: 'F-VIT-1', fieldCode: 'FLD_BP_SYS', fieldLabel: 'Systolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '120', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ADULT' },
      { id: 'F-VIT-2', fieldCode: 'FLD_BP_DIA', fieldLabel: 'Diastolic Blood Pressure', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '80', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ADULT' },
      { id: 'F-VIT-3', fieldCode: 'FLD_PULSE_RATE', fieldLabel: 'Heart / Pulse Rate', fieldType: 'NUMBER', unit: 'bpm', placeholder: '72', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-VIT-4', fieldCode: 'FLD_TEMP_C', fieldLabel: 'Core Temperature (°C)', fieldType: 'NUMBER', unit: '°C', placeholder: '37.0', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
      { id: 'F-VIT-5', fieldCode: 'FLD_SPO2', fieldLabel: 'Oxygen Saturation (SpO2)', fieldType: 'NUMBER', unit: '%', placeholder: '98', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
      { id: 'F-VIT-6', fieldCode: 'FLD_RESP_RATE', fieldLabel: 'Respiratory Rate', fieldType: 'NUMBER', unit: 'breaths/min', placeholder: '16', isRequired: true, requirementType: 'MANDATORY', order: 6, ageScope: 'ALL' },
      { id: 'F-VIT-7', fieldCode: 'FLD_HEIGHT_CM', fieldLabel: 'Height / Length', fieldType: 'NUMBER', unit: 'cm', placeholder: '170', isRequired: false, requirementType: 'OPTIONAL', order: 7, ageScope: 'ALL' },
      { id: 'F-VIT-8', fieldCode: 'FLD_WEIGHT_KG', fieldLabel: 'Body Weight', fieldType: 'NUMBER', unit: 'kg', placeholder: '70', isRequired: true, requirementType: 'MANDATORY', order: 8, ageScope: 'ALL' },
      { id: 'F-VIT-9', fieldCode: 'FLD_PAIN_SCORE', fieldLabel: 'Wong-Baker FACES Pain Score', fieldType: 'DROPDOWN', options: ['0 - No Hurt 😄', '2 - Hurts Little Bit 🙂', '4 - Hurts Little More 😐', '6 - Hurts Even More 🙁', '8 - Hurts Whole Lot 😢', '10 - Hurts Worst 😭'], isRequired: false, requirementType: 'OPTIONAL', order: 9, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-PE-NORMAL',
    sectionTitle: 'Physical Examination-Normal',
    nickName: 'Physical Exam',
    aliases: [
      'Physical Examination',
      'Physical Exam',
      'Physical Examination-Normal',
      'Physical Examination - Normal',
      'PE-Normal',
      'General Examination',
      'Systemic Examination',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Systemic physical examination: General Appearance, CVS, Respiratory, Abdomen, CNS, Extremities.',
    icon: 'fa-stethoscope',
    fields: [
      { id: 'F-PEN-1', fieldCode: 'FLD_GEN_EXAM', fieldLabel: 'General Appearance & Sensorium', fieldType: 'DROPDOWN', options: ['Alert, conscious, well oriented', 'Febrile, flushed, mild distress', 'Pale / Anemic appearance', 'Dehydrated, dry mucous membranes', 'Lethargic / Drowsy', 'Acute distress'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-PEN-2', fieldCode: 'FLD_CVS_EXAM', fieldLabel: 'Cardiovascular System (CVS)', fieldType: 'TEXT', placeholder: 'S1, S2 heard, regular rhythm, no murmur', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-PEN-3', fieldCode: 'FLD_RS_EXAM', fieldLabel: 'Respiratory System (Chest / Lungs)', fieldType: 'TEXT', placeholder: 'Bilateral vesicular breath sounds, clear lung fields', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-PEN-4', fieldCode: 'FLD_PA_EXAM', fieldLabel: 'Per Abdomen (PA)', fieldType: 'TEXT', placeholder: 'Soft, non-tender, no organomegaly, normal bowel sounds', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-PEN-5', fieldCode: 'FLD_CNS_EXAM', fieldLabel: 'Central Nervous System (CNS)', fieldType: 'TEXT', placeholder: 'GCS 15/15, cranial nerves intact, no focal neurological deficit', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
      { id: 'F-PEN-6', fieldCode: 'FLD_EXTREM_EXAM', fieldLabel: 'Extremities & Musculoskeletal', fieldType: 'TEXT', placeholder: 'No clubbing, cyanosis, edema or joint swelling', isRequired: false, requirementType: 'OPTIONAL', order: 6, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-PHYSICAL-EXAM',
    sectionTitle: 'Systemic Physical Examination',
    nickName: 'Physical Exam',
    aliases: ['Physical Exam', 'Systemic Physical Examination', 'General Exam', 'Clinical Examination'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Systemic head-to-toe clinical examination: General appearance, CVS, Chest, Abdomen, CNS.',
    icon: 'fa-stethoscope',
    fields: [
      { id: 'F-PE-1', fieldCode: 'FLD_GEN_EXAM', fieldLabel: 'General Appearance & Sensorium', fieldType: 'DROPDOWN', options: ['Alert, conscious, well oriented', 'Febrile, flushed, mild distress', 'Pale / Anemic appearance', 'Dehydrated, dry mucous membranes', 'Lethargic / Drowsy', 'Acute distress'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-PE-2', fieldCode: 'FLD_CVS_EXAM', fieldLabel: 'Cardiovascular System (CVS)', fieldType: 'TEXT', placeholder: 'S1, S2 heard, regular rhythm, no murmur', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-PE-3', fieldCode: 'FLD_RS_EXAM', fieldLabel: 'Respiratory System (Chest / Lungs)', fieldType: 'TEXT', placeholder: 'Bilateral vesicular breath sounds, clear lung fields', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-PE-4', fieldCode: 'FLD_PA_EXAM', fieldLabel: 'Per Abdomen (PA)', fieldType: 'TEXT', placeholder: 'Soft, non-tender, no organomegaly, normal bowel sounds', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-PE-5', fieldCode: 'FLD_CNS_EXAM', fieldLabel: 'Central Nervous System (CNS)', fieldType: 'TEXT', placeholder: 'GCS 15/15, cranial nerves intact, no focal neurological deficit', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
      { id: 'F-PE-6', fieldCode: 'FLD_EXTREM_EXAM', fieldLabel: 'Extremities & Musculoskeletal', fieldType: 'TEXT', placeholder: 'No clubbing, cyanosis, edema or joint swelling', isRequired: false, requirementType: 'OPTIONAL', order: 6, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DX-NORMAL',
    sectionTitle: 'Diagnosis-Normal',
    nickName: 'Diagnosis',
    aliases: [
      'Diagnosis',
      'Diagnosis-Normal',
      'Diagnosis - Normal',
      'ICD10 Diagnosis',
      'Clinical Diagnosis',
      'Dx-Normal',
      'Dx',
      'Diagnoses',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'ICD-10 clinical impression, primary diagnosis, secondary diagnoses, and chronic flags.',
    icon: 'fa-book',
    fields: [
      { id: 'F-DXN-1', fieldCode: 'FLD_PRIMARY_DX', fieldLabel: 'Primary Clinical Diagnosis', fieldType: 'TEXT', placeholder: 'e.g. Acute Upper Respiratory Tract Infection', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DXN-2', fieldCode: 'FLD_ICD10_PRIMARY', fieldLabel: 'Primary ICD-10 Code', fieldType: 'TEXT', placeholder: 'J06.9', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-DXN-3', fieldCode: 'FLD_SECONDARY_DX', fieldLabel: 'Secondary / Comorbid Diagnoses', fieldType: 'TEXTAREA', placeholder: 'Essential Hypertension (I10), Type 2 Diabetes (E11.9)', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-DXN-4', fieldCode: 'FLD_IS_CHRONIC', fieldLabel: 'Chronic Illness / Comorbidity Flag', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DIAGNOSIS',
    sectionTitle: 'Clinical Impression & ICD-10 Diagnosis',
    nickName: 'Diagnosis Coding',
    aliases: ['Diagnosis', 'ICD10', 'Diagnosis Coding', 'Clinical Impression', 'Dx'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'ICD-10 coded primary & secondary diagnoses, comorbidity tags, and diagnostic narrative.',
    icon: 'fa-book',
    fields: [
      { id: 'F-DX-1', fieldCode: 'FLD_PRIMARY_DX', fieldLabel: 'Primary Clinical Diagnosis', fieldType: 'TEXT', placeholder: 'e.g. Acute Upper Respiratory Tract Infection', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DX-2', fieldCode: 'FLD_ICD10_PRIMARY', fieldLabel: 'Primary ICD-10 Code', fieldType: 'TEXT', placeholder: 'J06.9', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-DX-3', fieldCode: 'FLD_SECONDARY_DX', fieldLabel: 'Secondary / Comorbid Diagnoses', fieldType: 'TEXTAREA', placeholder: 'Essential Hypertension (I10), Type 2 Diabetes (E11.9)', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-DX-4', fieldCode: 'FLD_IS_CHRONIC', fieldLabel: 'Chronic Illness / Comorbidity Flag', fieldType: 'CHECKBOX', isRequired: false, requirementType: 'CONDITIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-ALLERGY-NORMAL',
    sectionTitle: 'Allergy-Normal',
    nickName: 'Allergies',
    aliases: [
      'Allergy',
      'Allergies',
      'Allergy-Normal',
      'Allergy - Normal',
      'Allergies-Normal',
      'Allergies - Normal',
      'Drug Allergy',
      'Adverse Reactions',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Drug, food, contrast, and environmental allergies with severity and reaction characteristics.',
    icon: 'fa-exclamation-triangle',
    fields: [
      { id: 'F-ALGN-1', fieldCode: 'FLD_ALLERGEN_NAME', fieldLabel: 'Known Allergen / Substance', fieldType: 'TEXT', placeholder: 'e.g. Penicillin / Sulfa / Contrast media', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-ALGN-2', fieldCode: 'FLD_ALLERGY_TYPE', fieldLabel: 'Allergen Category', fieldType: 'DROPDOWN', options: ['Drug / Medication', 'Food / Dietary', 'Radiological Contrast', 'Environmental / Pollen', 'Latex / Medical Device'], isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-ALGN-3', fieldCode: 'FLD_ALLERGY_SEVERITY', fieldLabel: 'Severity Level', fieldType: 'DROPDOWN', options: ['Mild (Local Rash/Pruritus)', 'Moderate (Urticaria/Bronchospasm)', 'Severe (Anaphylaxis/Shock)'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-ALGN-4', fieldCode: 'FLD_REACTION_NOTES', fieldLabel: 'Reaction Symptoms & Verification Date', fieldType: 'TEXTAREA', placeholder: 'Facial swelling and dyspnea after oral amoxicillin in 2021', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-ALLERGIES',
    sectionTitle: 'Allergies & Adverse Drug Reactions',
    nickName: 'Allergies',
    aliases: ['Allergies', 'Allergy', 'Adverse Drug Reactions', 'Drug Allergies'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Documented drug, food, contrast, and environmental allergies with reaction type and severity.',
    icon: 'fa-exclamation-triangle',
    fields: [
      { id: 'F-ALG-1', fieldCode: 'FLD_ALLERGEN_NAME', fieldLabel: 'Known Allergen / Substance', fieldType: 'TEXT', placeholder: 'e.g. Penicillin / Sulfa / Contrast media', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-ALG-2', fieldCode: 'FLD_ALLERGY_TYPE', fieldLabel: 'Allergen Category', fieldType: 'DROPDOWN', options: ['Drug / Medication', 'Food / Dietary', 'Radiological Contrast', 'Environmental / Pollen', 'Latex / Medical Device'], isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-ALG-3', fieldCode: 'FLD_ALLERGY_SEVERITY', fieldLabel: 'Severity Level', fieldType: 'DROPDOWN', options: ['Mild (Local Rash/Pruritus)', 'Moderate (Urticaria/Bronchospasm)', 'Severe (Anaphylaxis/Shock)'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-ALG-4', fieldCode: 'FLD_REACTION_NOTES', fieldLabel: 'Reaction Symptoms & Verification Date', fieldType: 'TEXTAREA', placeholder: 'Facial swelling and dyspnea after oral amoxicillin in 2021', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-PRESCRIPTION-NORMAL',
    sectionTitle: 'Prescription-Normal',
    nickName: 'Prescription',
    aliases: [
      'Prescription',
      'Prescriptions',
      'Prescription-Normal',
      'Prescription - Normal',
      'Medication Order',
      'Medications',
      'Rx Plan',
      'Rx-Normal',
      'Rx',
    ],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Outpatient medication prescribing, dosage schedules, laboratory/imaging requests, follow-up instructions.',
    icon: 'fa-pencil-square-o',
    fields: [
      { id: 'F-RXN-1', fieldCode: 'FLD_RX_ORDERS', fieldLabel: 'Medication Orders & Dosage Instructions', fieldType: 'TEXTAREA', placeholder: 'Tab Paracetamol 500mg TDS x 3 days, Tab Amoxicillin 500mg TDS x 5 days...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-RXN-2', fieldCode: 'FLD_LAB_RAD_ORDERS', fieldLabel: 'Laboratory & Radiology Requests', fieldType: 'TEXT', placeholder: 'CBC, ESR, Chest X-Ray PA View, USG Abdomen', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-RXN-3', fieldCode: 'FLD_FOLLOWUP_DATE', fieldLabel: 'Next Follow-up Appointment Date', fieldType: 'DATE', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-RXN-4', fieldCode: 'FLD_PATIENT_ADVICE', fieldLabel: 'Patient Advice & Education', fieldType: 'TEXTAREA', placeholder: 'Increase oral hydration, avoid cold drinks, review in 3 days if fever persists...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-RX-PLAN',
    sectionTitle: 'Orders, Prescriptions & Plan of Care',
    nickName: 'Rx & Treatment Plan',
    aliases: ['Rx', 'Treatment Plan', 'Orders', 'Prescriptions', 'Plan of Care', 'Medication Orders'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Outpatient medication prescribing, dosage schedules, laboratory/imaging requests, follow-up.',
    icon: 'fa-pencil-square-o',
    fields: [
      { id: 'F-RX-1', fieldCode: 'FLD_RX_ORDERS', fieldLabel: 'Medication Orders & Dosage Instructions', fieldType: 'TEXTAREA', placeholder: 'Tab Paracetamol 500mg TDS x 3 days, Tab Amoxicillin 500mg TDS x 5 days...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-RX-2', fieldCode: 'FLD_LAB_RAD_ORDERS', fieldLabel: 'Laboratory & Radiology Diagnostic Requests', fieldType: 'TEXT', placeholder: 'CBC, ESR, Chest X-Ray PA View, USG Abdomen', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-RX-3', fieldCode: 'FLD_FOLLOWUP_DATE', fieldLabel: 'Next Follow-up Appointment Date', fieldType: 'DATE', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-RX-4', fieldCode: 'FLD_PATIENT_EDUCATION', fieldLabel: 'Patient Education & Advice', fieldType: 'TEXTAREA', placeholder: 'Increase oral hydration, report immediately if high fever persists...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-PMH-NORMAL',
    sectionTitle: 'Past Medical History-Normal',
    nickName: 'Past Medical History',
    aliases: [
      'Past Medical History',
      'PMH',
      'Past Medical History-Normal',
      'Past Medical History - Normal',
      'PMH-Normal',
      'Medical History',
    ],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'Longitudinal record of past chronic diseases, prior hospitalizations, and major medical conditions.',
    icon: 'fa-history',
    fields: [
      { id: 'F-PMHN-1', fieldCode: 'FLD_PAST_MEDICAL_DX', fieldLabel: 'Past Medical Conditions', fieldType: 'TEXTAREA', placeholder: 'Hypertension (10 yrs), Type 2 Diabetes Mellitus, Dyslipidemia...', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-PMHN-2', fieldCode: 'FLD_PAST_HOSPITALIZATIONS', fieldLabel: 'Prior Hospitalizations / ICU Stays', fieldType: 'TEXTAREA', placeholder: 'Admitted in 2022 for Dengue fever, uncomplicated course...', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-PMHN-3', fieldCode: 'FLD_CURRENT_MEDS', fieldLabel: 'Regular Home Medications', fieldType: 'TEXTAREA', placeholder: 'Tab Telmisartan 40mg OD, Tab Metformin 500mg BD...', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-HISTORY',
    sectionTitle: 'Past Medical, Surgical & Family History',
    nickName: 'Medical History',
    aliases: ['Medical History', 'Surgical History', 'Family History', 'Social History', 'History'],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'Longitudinal record of past medical illnesses, prior operations, family illnesses, and social habits.',
    icon: 'fa-history',
    fields: [
      { id: 'F-HIST-1', fieldCode: 'FLD_PAST_MEDICAL', fieldLabel: 'Past Medical History', fieldType: 'TEXTAREA', placeholder: 'Hypertension (10 yrs), Type 2 DM, Ischemic Heart Disease...', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-HIST-2', fieldCode: 'FLD_PAST_SURGICAL', fieldLabel: 'Past Surgical History & Procedures', fieldType: 'TEXTAREA', placeholder: 'Appendectomy (2015), Cholecystectomy (2018)...', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-HIST-3', fieldCode: 'FLD_FAMILY_HISTORY', fieldLabel: 'Family History (Cardiac / Cancer / DM)', fieldType: 'TEXTAREA', placeholder: 'Father: CAD / Myocardial Infarction at 52; Mother: T2DM...', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-HIST-4', fieldCode: 'FLD_SOCIAL_HABITS', fieldLabel: 'Social History & Habits (Smoking / Alcohol)', fieldType: 'TEXTAREA', placeholder: 'Non-smoker, occasional alcohol, sedentary desk job...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-FAMILY-HX',
    sectionTitle: 'Family History-Normal',
    nickName: 'Family History',
    aliases: ['Family History', 'FH', 'Family History-Normal', 'Family History - Normal', 'FH-Normal'],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'Familial and hereditary disorders: Cardiovascular disease, Diabetes, Malignancies, Hypertension.',
    icon: 'fa-users',
    fields: [
      { id: 'F-FH-1', fieldCode: 'FLD_FH_CAD', fieldLabel: 'Cardiovascular / Early CAD in 1st Degree Relatives', fieldType: 'TEXT', placeholder: 'Father had MI at age 52; Mother has hypertension', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-FH-2', fieldCode: 'FLD_FH_DM', fieldLabel: 'Diabetes / Endocrine Heredity', fieldType: 'TEXT', placeholder: 'Maternal grandmother with T2DM', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-FH-3', fieldCode: 'FLD_FH_CANCER', fieldLabel: 'Familial Malignancies / Cancer History', fieldType: 'TEXT', placeholder: 'No known family history of malignancy', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-SOCIAL-HX',
    sectionTitle: 'Social History-Normal',
    nickName: 'Social History',
    aliases: ['Social History', 'SH', 'Social History-Normal', 'Social History - Normal', 'SH-Normal', 'Habits'],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'Tobacco/smoking pack years, alcohol intake units, occupational hazards, physical activity.',
    icon: 'fa-coffee',
    fields: [
      { id: 'F-SH-1', fieldCode: 'FLD_SH_TOBACCO', fieldLabel: 'Tobacco / Smoking Status', fieldType: 'DROPDOWN', options: ['Never Smoker', 'Former Smoker (Quit)', 'Current Light Smoker (< 10/day)', 'Current Heavy Smoker (> 20/day)', 'Chews Tobacco / Gutka'], isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-SH-2', fieldCode: 'FLD_SH_ALCOHOL', fieldLabel: 'Alcohol Consumption', fieldType: 'DROPDOWN', options: ['Non-Drinker / Teetotaler', 'Occasional / Social (< 2 units/week)', 'Moderate Drinker', 'Heavy / Daily Drinker'], isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-SH-3', fieldCode: 'FLD_SH_OCCUPATION', fieldLabel: 'Occupation & Environmental Hazards', fieldType: 'TEXT', placeholder: 'Software engineer, desk work / Factory worker, dust exposure', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-TREATMENT-PLAN',
    sectionTitle: 'Treatment Plan-Normal',
    nickName: 'Treatment Plan',
    aliases: ['Treatment Plan', 'Plan', 'Treatment Plan-Normal', 'Treatment Plan - Normal', 'Plan of Care'],
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    description: 'Comprehensive outpatient clinical plan of care, diagnostics, referrals, and patient instructions.',
    icon: 'fa-list-alt',
    fields: [
      { id: 'F-TP-1', fieldCode: 'FLD_PLAN_SUMMARY', fieldLabel: 'Clinical Plan Summary', fieldType: 'TEXTAREA', placeholder: 'Symptomatic medical management, lifestyle modifications, dietary advice...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-TP-2', fieldCode: 'FLD_INVESTIGATIONS_REQ', fieldLabel: 'Pending Investigations / Labs', fieldType: 'TEXT', placeholder: 'Ultrasound KUB, Serum Creatinine, Urine Routine...', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-TP-3', fieldCode: 'FLD_REFERRALS', fieldLabel: 'Cross Specialty Referrals', fieldType: 'TEXT', placeholder: 'Cardiology consultation for persistent chest pain', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-PROBLEMS',
    sectionTitle: 'Problem List & Chronic Conditions',
    nickName: 'Problem List',
    aliases: ['Problem List', 'Problems', 'Chronic Conditions', 'Medical Issues'],
    category: 'General Assessment',
    requirementType: 'OPTIONAL',
    description: 'Longitudinal problem list tracking active, controlled, or resolved chronic medical conditions.',
    icon: 'fa-list-ul',
    fields: [
      { id: 'F-PBM-1', fieldCode: 'FLD_PROBLEM_NAME', fieldLabel: 'Chronic Condition / Diagnosis', fieldType: 'TEXT', placeholder: 'e.g. Essential Hypertension', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-PBM-2', fieldCode: 'FLD_PROBLEM_ICD', fieldLabel: 'ICD-10 Code', fieldType: 'TEXT', placeholder: 'I10', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-PBM-3', fieldCode: 'FLD_PROBLEM_STATUS', fieldLabel: 'Clinical Status', fieldType: 'DROPDOWN', options: ['Active & Uncontrolled', 'Active & Well Controlled', 'In Remission', 'Resolved'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-PBM-4', fieldCode: 'FLD_PROBLEM_ONSET', fieldLabel: 'Approximate Onset Date / Duration', fieldType: 'TEXT', placeholder: 'Diagnosed 5 years ago (2021)', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },

  // =========================================================================
  // NURSING & INPATIENT CARE
  // =========================================================================
  {
    id: 'STD-PANEL-NURSING-NOTES',
    sectionTitle: 'Nursing Notes-Normal',
    nickName: 'Nursing Notes',
    aliases: ['Nursing Notes', 'Nurse Notes', 'Nursing Notes-Normal', 'Nursing Notes - Normal', 'Nursing Progress', 'Ward Notes'],
    category: 'Nursing & Inpatient',
    requirementType: 'MANDATORY',
    description: 'Inpatient shift nursing notes: Assessment, Data-Action-Response (DAR), IV line status, and nursing care.',
    icon: 'fa-user-md',
    fields: [
      { id: 'F-NN-1', fieldCode: 'FLD_NURSING_SHIFT', fieldLabel: 'Shift (Morning / Evening / Night)', fieldType: 'DROPDOWN', options: ['Morning Shift (07:00 - 15:00)', 'Evening Shift (15:00 - 23:00)', 'Night Shift (23:00 - 07:00)'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-NN-2', fieldCode: 'FLD_NURSING_NOTES_TEXT', fieldLabel: 'Nursing Observations & Progress (DAR / SOAP)', fieldType: 'TEXTAREA', placeholder: 'Patient received comfortable in bed, IV cannula patent on left forearm, vitals monitored...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-NN-3', fieldCode: 'FLD_IV_LINE_STATUS', fieldLabel: 'IV Cannula / Line Site Status', fieldType: 'DROPDOWN', options: ['Healthy, patent, no phlebitis', 'Mild erythema / Site changed', 'Infiltration / Removed', 'No IV line in situ'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-IP-NURSING',
    sectionTitle: 'Inpatient Bedside & eMAR Station',
    nickName: 'IP Nursing / eMAR',
    aliases: ['Inpatient Nursing', 'eMAR', 'Bedside Station', 'Ward Nursing', 'eMAR Station'],
    category: 'Nursing & Inpatient',
    requirementType: 'MANDATORY',
    description: 'Ward nurse assessment, bedside medication administration scheduling, IV lines, shift tracking.',
    icon: 'fa-medkit',
    fields: [
      { id: 'F-IPN-1', fieldCode: 'FLD_WARD_ACUITY', fieldLabel: 'Patient Acuity Level', fieldType: 'DROPDOWN', options: ['Level 1 - Stable / Minimal Care', 'Level 2 - Moderate / Assisted Care', 'Level 3 - High Dependency / Step-down', 'Level 4 - Critical / Intensive Care'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-IPN-2', fieldCode: 'FLD_EMAR_SCHEDULE', fieldLabel: 'eMAR Medication Administration Record', fieldType: 'TEXTAREA', placeholder: 'Document administered meds, dose timing, IV infusions running...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-IPN-3', fieldCode: 'FLD_BEDSIDE_NOTES', fieldLabel: 'Bedside Nursing Progress Notes (DAR / SOAP)', fieldType: 'TEXTAREA', placeholder: 'Data, Action, Response clinical notes...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-FLUID-IO',
    sectionTitle: 'Fluid Intake & Output (I/O Balance)',
    nickName: 'Fluid Balance (I/O)',
    aliases: ['Fluid Balance', 'Intake Output', 'Fluid IO', 'IO Chart', 'I/O'],
    category: 'Nursing & Inpatient',
    requirementType: 'OPTIONAL',
    description: 'Hourly fluid balance tracking: Oral, IV fluids, urine, NG tube, drains, and cumulative 24h balance.',
    icon: 'fa-tint',
    fields: [
      { id: 'F-FIO-1', fieldCode: 'FLD_INTAKE_ORAL', fieldLabel: 'Oral Fluid Intake (mL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '500', isRequired: false, requirementType: 'OPTIONAL', order: 1, ageScope: 'ALL' },
      { id: 'F-FIO-2', fieldCode: 'FLD_INTAKE_IV', fieldLabel: 'Intravenous (IV) Infusion (mL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '1000', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-FIO-3', fieldCode: 'FLD_OUTPUT_URINE', fieldLabel: 'Urine Output (mL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '800', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-FIO-4', fieldCode: 'FLD_OUTPUT_DRAIN', fieldLabel: 'Surgical Drain / NG Output (mL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '50', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-FIO-5', fieldCode: 'FLD_BALANCE_24H', fieldLabel: 'Cumulative 24-hr Fluid Balance (mL)', fieldType: 'NUMBER', unit: 'mL', placeholder: '+650', isRequired: true, requirementType: 'MANDATORY', order: 5, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-ISBAR',
    sectionTitle: 'Nursing Assessment & Shift Handover (ISBAR)',
    nickName: 'Nursing ISBAR',
    aliases: ['ISBAR', 'Handover', 'Shift Handover', 'ISBAR Handover', 'Nursing Handover'],
    category: 'Nursing & Inpatient',
    requirementType: 'MANDATORY',
    description: 'Standardized clinical handover: Identification, Situation, Background, Assessment, Recommendation.',
    icon: 'fa-exchange',
    fields: [
      { id: 'F-ISB-1', fieldCode: 'FLD_ISBAR_SITUATION', fieldLabel: 'Situation & Immediate Issue', fieldType: 'TEXTAREA', placeholder: 'Patient admitted post-laparotomy Day 1, reports moderate incision pain...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-ISB-2', fieldCode: 'FLD_ISBAR_BACKGROUND', fieldLabel: 'Background & Pertinent History', fieldType: 'TEXTAREA', placeholder: 'Known hypertensive, allergy to penicillin, received 1L RL intra-op...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-ISB-3', fieldCode: 'FLD_ISBAR_ASSESSMENT', fieldLabel: 'Assessment & Current Status', fieldType: 'TEXTAREA', placeholder: 'Vitals stable, abdomen soft with mild surgical tenderness, drain 40mL serosanguinous...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-ISB-4', fieldCode: 'FLD_ISBAR_RECOMMENDATION', fieldLabel: 'Recommendation & Plan for Shift', fieldType: 'TEXTAREA', placeholder: 'Repeat hemoglobin in morning, encourage ambulation, titrate analgesia...', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DISCHARGE-NORMAL',
    sectionTitle: 'Discharge Summary-Normal',
    nickName: 'Discharge Summary',
    aliases: [
      'Discharge Summary',
      'Discharge Summary-Normal',
      'Discharge Summary - Normal',
      'Discharge Note',
      'Hospital Course',
      'Discharge-Normal',
    ],
    category: 'Nursing & Inpatient',
    requirementType: 'MANDATORY',
    description: 'Standard inpatient discharge summary: Diagnosis, hospital course, discharge condition, medications, and advice.',
    icon: 'fa-file-text-o',
    fields: [
      { id: 'F-DSN-1', fieldCode: 'FLD_FINAL_DX', fieldLabel: 'Final Primary Discharge Diagnosis', fieldType: 'TEXT', placeholder: 'e.g. Acute Appendicitis (K35.80) - Post Laparoscopic Appendectomy', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DSN-2', fieldCode: 'FLD_HOSPITAL_COURSE_NARRATIVE', fieldLabel: 'Summary of Hospital Course & Treatment', fieldType: 'TEXTAREA', placeholder: 'Admitted via ER, surgery performed on Day 1, afebrile post-op, tolerated oral diet, wound clean...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-DSN-3', fieldCode: 'FLD_DISCHARGE_CONDITION', fieldLabel: 'Condition at Time of Discharge', fieldType: 'DROPDOWN', options: ['Clinically Stable / Cured', 'Improved / Ambulatory', 'Transferred to Tertiary Center', 'DAMA (Discharge Against Medical Advice)'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-DSN-4', fieldCode: 'FLD_DISCHARGE_MEDICATIONS', fieldLabel: 'Discharge Medications & Dosage', fieldType: 'TEXTAREA', placeholder: 'Tab Paracetamol 650mg SOS, Tab Cefuroxime 500mg BD x 5 days...', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
      { id: 'F-DSN-5', fieldCode: 'FLD_FOLLOWUP_ADVICE', fieldLabel: 'Follow-up Date & Red Flag Instructions', fieldType: 'TEXTAREA', placeholder: 'Review in Surgical OPD in 7 days for suture removal. Report immediately if fever > 38.5C...', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DISCHARGE-SUMMARY',
    sectionTitle: 'Discharge Course & Medication Reconciliation',
    nickName: 'Discharge Course',
    aliases: ['Discharge Summary', 'Discharge Course', 'Medication Reconciliation', 'Discharge Note'],
    category: 'Nursing & Inpatient',
    requirementType: 'MANDATORY',
    description: 'Complete inpatient course summary, discharge medications, follow-up dates, and patient counseling.',
    icon: 'fa-file-text-o',
    fields: [
      { id: 'F-DIS-1', fieldCode: 'FLD_HOSPITAL_COURSE', fieldLabel: 'Hospital Course & Clinical Progress', fieldType: 'TEXTAREA', placeholder: 'Patient admitted on ... underwent successful procedure ... recovered uneventfully...', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DIS-2', fieldCode: 'FLD_DISCHARGE_VITALS', fieldLabel: 'Discharge Condition & Stable Vitals', fieldType: 'TEXTAREA', placeholder: 'BP 124/82, HR 76, Afebrile, SpO2 99%, wound dressing clean and dry...', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-DIS-3', fieldCode: 'FLD_MED_RECON', fieldLabel: 'Reconciled Discharge Medications', fieldType: 'TEXTAREA', placeholder: 'Complete list of discharge drugs with dose, frequency, and duration...', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-DIS-4', fieldCode: 'FLD_DISCHARGE_WARNINGS', fieldLabel: 'Follow-up Date & Red Flag Warnings', fieldType: 'TEXTAREA', placeholder: 'Review in Surgical OPD on Day 7. Return to ER if high fever or sudden bleeding...', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
    ],
  },

  // =========================================================================
  // SURGICAL & PERI-OPERATIVE
  // =========================================================================
  {
    id: 'STD-PANEL-PREOP',
    sectionTitle: 'Pre-Operative Verification & Checklist',
    nickName: 'Pre-Op Checklist',
    aliases: ['Pre-Op', 'Pre-Operative', 'Pre-Op Checklist', 'Surgical Checklist', 'Pre-Op Verification'],
    category: 'Surgical & Peri-Op',
    requirementType: 'MANDATORY',
    description: 'Pre-operative nursing verification: Consent, NPO status, site marking, anesthesia clearance.',
    icon: 'fa-check-square-o',
    fields: [
      { id: 'F-PRE-1', fieldCode: 'FLD_PREOP_CONSENT', fieldLabel: 'Informed Surgical & Anesthesia Consent Verified', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-PRE-2', fieldCode: 'FLD_PREOP_FASTING', fieldLabel: 'Fasting / NPO Status (Hours)', fieldType: 'NUMBER', unit: 'Hours', placeholder: '8', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-PRE-3', fieldCode: 'FLD_PREOP_CLEARANCE', fieldLabel: 'Pre-Op Anesthesia Clearance', fieldType: 'DROPDOWN', options: ['Cleared (ASA Class I-II)', 'Cleared with High Risk (ASA Class III-IV)', 'Deferred / Pending Investigations'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-PRE-4', fieldCode: 'FLD_PREOP_SITE_MARK', fieldLabel: 'Surgical Site Marked by Operating Surgeon', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-OT-SAFETY',
    sectionTitle: 'Intra-Operative & WHO Safety Checklist',
    nickName: 'OT Safety Checklist',
    aliases: ['WHO Checklist', 'OT Safety', 'Intra-Operative Safety', 'Surgical Safety Checklist'],
    category: 'Surgical & Peri-Op',
    requirementType: 'MANDATORY',
    description: 'WHO Surgical Safety Checklist: Sign In, Time Out, Sign Out, needle/sponge/instrument counts.',
    icon: 'fa-shield',
    fields: [
      { id: 'F-OT-1', fieldCode: 'FLD_WHO_SIGNIN', fieldLabel: 'Sign In: Before Induction of Anesthesia', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-OT-2', fieldCode: 'FLD_WHO_TIMEOUT', fieldLabel: 'Time Out: Before Skin Incision', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-OT-3', fieldCode: 'FLD_WHO_SIGNOUT', fieldLabel: 'Sign Out: Before Patient Leaves Operating Room', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-OT-4', fieldCode: 'FLD_COUNT_CORRECT', fieldLabel: 'Needle, Sponge & Instrument Counts Correct', fieldType: 'YES_NO', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-SURGERY-BOOKING',
    sectionTitle: 'Surgery Advice & OT Booking',
    nickName: 'Surgery Booking',
    aliases: ['Surgery Booking', 'OT Booking', 'Surgery Advice', 'Operation Booking'],
    category: 'Surgical & Peri-Op',
    requirementType: 'OPTIONAL',
    description: 'Surgical procedure advice, anesthesia preference, OT booking priority, and instrument requests.',
    icon: 'fa-calendar',
    fields: [
      { id: 'F-SB-1', fieldCode: 'FLD_PROCEDURE_NAME', fieldLabel: 'Proposed Surgical Procedure', fieldType: 'TEXT', placeholder: 'e.g. Laparoscopic Cholecystectomy', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-SB-2', fieldCode: 'FLD_ANESTHESIA_PREF', fieldLabel: 'Preferred Anesthesia Technique', fieldType: 'DROPDOWN', options: ['General Anesthesia', 'Spinal / Subarachnoid Block', 'Epidural Anesthesia', 'Regional Nerve Block', 'Local Anesthesia + Monitored Sedation'], isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-SB-3', fieldCode: 'FLD_OT_PRIORITY', fieldLabel: 'Booking Priority / Acuity', fieldType: 'DROPDOWN', options: ['Elective (Planned)', 'Semi-Urgent (< 48 hours)', 'Emergency STAT (< 2 hours)'], isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-SB-4', fieldCode: 'FLD_SPECIAL_IMPLANTS', fieldLabel: 'Special Implants / Instruments Required', fieldType: 'TEXTAREA', placeholder: 'Mesh 15x15cm, Harmonic scalpel, Ligaclip applier...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },

  // =========================================================================
  // SPECIALTY CLINICAL PANELS
  // =========================================================================
  {
    id: 'STD-PANEL-PEDIATRIC',
    sectionTitle: 'Pediatric Assessment & Growth Chart',
    nickName: 'Pediatric Growth',
    aliases: ['Pediatric', 'Growth Chart', 'Pediatric Assessment', 'Child Health', 'Peds'],
    category: 'Specialty Clinics',
    requirementType: 'OPTIONAL',
    description: 'Child-specific biometrics: Head circumference (OFC), MUAC, WHO percentiles, vaccination status.',
    icon: 'fa-child',
    fields: [
      { id: 'F-PED-1', fieldCode: 'FLD_HEAD_CIRC', fieldLabel: 'Head Circumference (OFC)', fieldType: 'NUMBER', unit: 'cm', placeholder: '35.5', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'CHILD' },
      { id: 'F-PED-2', fieldCode: 'FLD_MUAC_VAL', fieldLabel: 'Mid-Upper Arm Circumference (MUAC)', fieldType: 'NUMBER', unit: 'cm', placeholder: '14.0', isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'CHILD' },
      { id: 'F-PED-3', fieldCode: 'FLD_WHO_PERCENTILE', fieldLabel: 'WHO Growth Percentile Category', fieldType: 'DROPDOWN', options: ['< 3rd Percentile (Underweight)', '3rd - 15th Percentile', '15th - 50th Percentile (Normal)', '50th - 85th Percentile', '> 85th Percentile (Overweight)', '> 97th Percentile (Obese)'], isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'CHILD' },
      { id: 'F-PED-4', fieldCode: 'FLD_VACCINE_STATUS', fieldLabel: 'Immunization Schedule Status', fieldType: 'DROPDOWN', options: ['Up-to-date for Age', 'Partially Immunized / Delayed', 'Not Immunized', 'Contraindicated'], isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'CHILD' },
    ],
  },
  {
    id: 'STD-PANEL-OBGYN',
    sectionTitle: 'Obstetric Antenatal History & Examination',
    nickName: 'Antenatal / OBGYN',
    aliases: ['OBGYN', 'Antenatal', 'Obstetric', 'Maternity', 'Pregnancy'],
    category: 'Specialty Clinics',
    requirementType: 'OPTIONAL',
    description: 'Antenatal profile: G/P/L/A obstetric index, gestational age, fundal height, fetal heart rate.',
    icon: 'fa-female',
    fields: [
      { id: 'F-OB-1', fieldCode: 'FLD_OB_GPLA', fieldLabel: 'Obstetric Index (Gravida / Para / Living / Abortion)', fieldType: 'TEXT', placeholder: 'G2 P1 L1 A0', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-OB-2', fieldCode: 'FLD_GEST_WEEKS', fieldLabel: 'Gestational Age (Weeks)', fieldType: 'NUMBER', unit: 'Weeks', placeholder: '32', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-OB-3', fieldCode: 'FLD_FUNDAL_HT', fieldLabel: 'Symphysis-Fundal Height (SFH)', fieldType: 'NUMBER', unit: 'cm', placeholder: '32', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-OB-4', fieldCode: 'FLD_FETAL_BPM', fieldLabel: 'Fetal Heart Rate (FHR)', fieldType: 'NUMBER', unit: 'bpm', placeholder: '144', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
      { id: 'F-OB-5', fieldCode: 'FLD_FETAL_LIE', fieldLabel: 'Fetal Presentation & Lie', fieldType: 'DROPDOWN', options: ['Cephalic (Vertex)', 'Breech', 'Transverse Lie', 'Variable / Unstable'], isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-OPHTHALMOLOGY',
    sectionTitle: 'Ophthalmology Examination & Visual Acuity',
    nickName: 'Ophthalmology Exam',
    aliases: ['Ophthalmology', 'Eye Exam', 'Visual Acuity', 'Vision', 'Eye'],
    category: 'Specialty Clinics',
    requirementType: 'OPTIONAL',
    description: 'Snellen Visual Acuity (OD/OS), Tonometry Intraocular Pressure (IOP), anterior segment slit lamp.',
    icon: 'fa-eye',
    fields: [
      { id: 'F-OPH-1', fieldCode: 'FLD_VA_RIGHT', fieldLabel: 'Visual Acuity Right Eye (OD)', fieldType: 'VA_CHART', placeholder: '6/6', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-OPH-2', fieldCode: 'FLD_VA_LEFT', fieldLabel: 'Visual Acuity Left Eye (OS)', fieldType: 'VA_CHART', placeholder: '6/6', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-OPH-3', fieldCode: 'FLD_IOP_OD', fieldLabel: 'Intraocular Pressure OD (Goldmann)', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '16', isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-OPH-4', fieldCode: 'FLD_IOP_OS', fieldLabel: 'Intraocular Pressure OS (Goldmann)', fieldType: 'NUMBER', unit: 'mmHg', placeholder: '16', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
      { id: 'F-OPH-5', fieldCode: 'FLD_SLIT_FINDINGS', fieldLabel: 'Slit Lamp & Fundus Examination', fieldType: 'TEXTAREA', placeholder: 'Cornea clear, anterior chamber deep and quiet, lens clear, CDR 0.3...', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DENTAL',
    sectionTitle: 'Dental Odontogram Examination',
    nickName: 'Dental Odontogram',
    aliases: ['Dental', 'Odontogram', 'Teeth', 'Dentistry', 'Dental Exam'],
    category: 'Specialty Clinics',
    requirementType: 'OPTIONAL',
    description: 'Interactive adult/pediatric 32-tooth odontogram, periodontal probing depths, dental procedures.',
    icon: 'fa-smile-o',
    fields: [
      { id: 'F-DEN-1', fieldCode: 'FLD_ODONTOGRAM_GRID', fieldLabel: '32-Tooth Adult Odontogram Grid', fieldType: 'ODONTOGRAM', isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DEN-2', fieldCode: 'FLD_PERIO_STATUS', fieldLabel: 'Periodontal & Gingival Health', fieldType: 'DROPDOWN', options: ['Healthy Gingiva', 'Mild Gingivitis / Marginal Erythema', 'Moderate Periodontitis (Pocket 4-5mm)', 'Advanced Periodontitis (> 6mm Bone Loss)'], isRequired: false, requirementType: 'OPTIONAL', order: 2, ageScope: 'ALL' },
      { id: 'F-DEN-3', fieldCode: 'FLD_OCCLUSION_TYPE', fieldLabel: 'Angle\'s Occlusion Classification', fieldType: 'DROPDOWN', options: ['Class I - Normal Molar Relationship', 'Class II - Retrognathic / Overjet', 'Class III - Prognathic / Underbite'], isRequired: false, requirementType: 'OPTIONAL', order: 3, ageScope: 'ALL' },
      { id: 'F-DEN-4', fieldCode: 'FLD_DENTAL_RX', fieldLabel: 'Dental Treatment Plan & Restorations', fieldType: 'TEXTAREA', placeholder: 'Tooth #36 Composite restoration, Tooth #46 Scaling & Root planing...', isRequired: false, requirementType: 'OPTIONAL', order: 4, ageScope: 'ALL' },
    ],
  },
  {
    id: 'STD-PANEL-DIALYSIS',
    sectionTitle: 'Dialysis Treatment Flowsheet',
    nickName: 'Hemodialysis Session',
    aliases: ['Dialysis', 'Hemodialysis', 'Renal', 'Nephrology', 'Dialysis Flowsheet'],
    category: 'Specialty Clinics',
    requirementType: 'OPTIONAL',
    description: 'Hemodialysis session logs: Vascular access, blood pump rate, ultrafiltration target, anticoagulation.',
    icon: 'fa-filter',
    fields: [
      { id: 'F-DIA-1', fieldCode: 'FLD_VASCULAR_ACCESS', fieldLabel: 'Dialysis Vascular Access Site', fieldType: 'DROPDOWN', options: ['Left Radiocephalic AV Fistula', 'Right Brachiocephalic AV Fistula', 'Left Brachiobasilic Transposition', 'Tunneled Internal Jugular Catheter (Permcath)', 'Temporary Femoral Dialysis Line'], isRequired: true, requirementType: 'MANDATORY', order: 1, ageScope: 'ALL' },
      { id: 'F-DIA-2', fieldCode: 'FLD_BLOOD_FLOW', fieldLabel: 'Blood Flow Rate (BFR)', fieldType: 'NUMBER', unit: 'mL/min', placeholder: '300', isRequired: true, requirementType: 'MANDATORY', order: 2, ageScope: 'ALL' },
      { id: 'F-DIA-3', fieldCode: 'FLD_TARGET_UF_L', fieldLabel: 'Target Ultrafiltration Volume', fieldType: 'NUMBER', unit: 'Litres', placeholder: '2.5', isRequired: true, requirementType: 'MANDATORY', order: 3, ageScope: 'ALL' },
      { id: 'F-DIA-4', fieldCode: 'FLD_PRE_POST_WT', fieldLabel: 'Pre vs Post Dialysis Weight', fieldType: 'TEXT', placeholder: 'Pre: 68.5 kg / Post: 66.0 kg', isRequired: true, requirementType: 'MANDATORY', order: 4, ageScope: 'ALL' },
      { id: 'F-DIA-5', fieldCode: 'FLD_HEPARIN_UNITS', fieldLabel: 'Heparin Anticoagulation Units', fieldType: 'NUMBER', unit: 'Units', placeholder: '5000', isRequired: false, requirementType: 'OPTIONAL', order: 5, ageScope: 'ALL' },
    ],
  },
];

/**
 * Searches and filters the standard panels catalog with comprehensive word-level tokenization,
 * alias matching, typo tolerance, and relevance scoring.
 *
 * e.g.
 * - "Chief Complaint-Normal" -> exact match rank 1
 * - "Chief Complaint" -> matches both Chief Complaint-Normal and Chief Complaints & HPI
 * - "Chif" -> typo tolerance matches Chief Complaint
 * - "Normal" -> lists all -Normal standard panels
 */
export function searchStandardPanels(
  query: string,
  existingSections: FormAssemblySection[] = []
): Array<StandardPanelTemplate & { isAlreadyAdded: boolean }> {
  const rawQ = (query || '').trim();
  const q = rawQ.toLowerCase();
  const existingTitles = new Set(existingSections.map((s) => s.sectionTitle.toLowerCase().trim()));
  const existingNicks = new Set(existingSections.map((s) => (s.nickName || '').toLowerCase().trim()));

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normQ = normalize(q);

  if (!normQ) {
    return STANDARD_PANELS_CATALOG.map((panel) => ({
      ...panel,
      isAlreadyAdded:
        existingTitles.has(panel.sectionTitle.toLowerCase().trim()) ||
        existingNicks.has(panel.nickName.toLowerCase().trim()),
    }));
  }

  // Tokenize query words: e.g. "Chief Complaint-Normal" -> ["chief", "complaint", "normal"]
  const qWords = q.split(/[\s\-_,./\\]+/).filter(Boolean);

  const scoredResults: { panel: StandardPanelTemplate; score: number }[] = [];

  for (const panel of STANDARD_PANELS_CATALOG) {
    const normTitle = normalize(panel.sectionTitle);
    const normNick = normalize(panel.nickName);
    const normCat = normalize(panel.category);
    const aliases = panel.aliases || [];
    const normAliases = aliases.map(normalize);

    let score = 0;

    // 1. Exact normalized matches
    if (normTitle === normQ) {
      score += 1200;
    } else if (normAliases.some((a) => a === normQ)) {
      score += 1100;
    } else if (normNick === normQ) {
      score += 1000;
    } else if (normTitle.startsWith(normQ)) {
      score += 850;
    } else if (normAliases.some((a) => a.startsWith(normQ))) {
      score += 800;
    } else if (normTitle.includes(normQ)) {
      score += 650;
    } else if (normNick.includes(normQ)) {
      score += 550;
    } else if (normAliases.some((a) => a.includes(normQ))) {
      score += 500;
    } else if (normCat.includes(normQ)) {
      score += 300;
    }

    // 2. Tokenized word-level matching
    if (qWords.length > 0) {
      const allText = `${panel.sectionTitle} ${panel.nickName} ${aliases.join(' ')} ${panel.category}`.toLowerCase();
      const matchedWords = qWords.filter((w) => allText.includes(w));
      if (matchedWords.length === qWords.length) {
        // Every word in user search query is present
        score += 500 + matchedWords.length * 60;
      } else if (matchedWords.length > 0) {
        // Partial word matches
        score += matchedWords.length * 50;
      }
    }

    // 3. Typo aliases & shortcuts
    if (normQ === 'chif' || normQ === 'cheif') {
      if (normTitle.includes('chief') || normNick.includes('chief')) score += 400;
    }
    if (normQ === 'vidal' || normQ === 'vitals' || normQ === 'vital') {
      if (normTitle.includes('vital') || normNick.includes('vital')) score += 400;
    }
    if (normQ === 'diag' || normQ === 'dx') {
      if (normTitle.includes('diagnos') || normNick.includes('diagnos')) score += 400;
    }
    if (normQ === 'med' || normQ === 'rx') {
      if (normTitle.includes('prescript') || normNick.includes('rx') || normTitle.includes('order')) score += 400;
    }
    if (normQ === 'pe' || normQ === 'exam') {
      if (normTitle.includes('physical') || normNick.includes('physical')) score += 400;
    }

    // 4. Subsequence fuzzy match (for single-word typos)
    if (score === 0 && normQ.length >= 3) {
      let qIdx = 0;
      for (let i = 0; i < normTitle.length && qIdx < normQ.length; i++) {
        if (normTitle[i] === normQ[qIdx]) qIdx++;
      }
      if (qIdx === normQ.length) {
        score += 150;
      }
    }

    if (score > 0) {
      scoredResults.push({ panel, score });
    }
  }

  // Sort descending by score
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.map(({ panel }) => {
    const isAlreadyAdded =
      existingTitles.has(panel.sectionTitle.toLowerCase().trim()) ||
      existingNicks.has(panel.nickName.toLowerCase().trim());
    return {
      ...panel,
      isAlreadyAdded,
    };
  });
}
