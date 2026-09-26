/**
 * Master catalog and seed database for all 77 EMR Masters from SIMPLEX HIMES v9.3
 * Reference: https://staging.simplexworld.com/MasterV9.3/
 */

export interface MasterColumn {
  key: string;
  label: string;
  width?: number | string;
  type?: 'text' | 'badge' | 'number' | 'date';
}

export interface MasterField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface MasterItem {
  id: number;
  code?: string;
  name?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  category?: string;
  department?: string;
  [key: string]: any;
}

export interface EmrMasterDefinition {
  key: string;
  title: string;
  category:
    | 'ROS & Symptoms'
    | 'Physical Examination'
    | 'Anesthesia'
    | 'Clinical Assessments & Scoring'
    | 'Nursing & ICU'
    | 'Surgery & OT'
    | 'Physical Therapy & Rehab'
    | 'Emergency & Triage'
    | 'Specialty Forms'
    | 'Immunizations'
    | 'Administration & Configuration';
  legacyUrl: string;
  description: string;
  columns: MasterColumn[];
  fields: MasterField[];
  seedData: MasterItem[];
}

export const EMR_MASTERS_CATALOG: EmrMasterDefinition[] = [
  // ─── 1. ROS & Symptoms ───
  {
    key: 'ros-symptoms',
    title: 'EMR ROS Symptoms',
    category: 'ROS & Symptoms',
    legacyUrl: 'viewROSSymptoms',
    description: 'Master catalog of Review of Systems (ROS) clinical symptoms.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'category', label: 'Organ System' },
      { key: 'description', label: 'Symptom Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'category', label: 'Organ System', type: 'select', options: ['Constitutional', 'Eyes', 'ENT', 'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Genitourinary', 'Musculoskeletal', 'Neurological', 'Psychiatric', 'Endocrine', 'Hematologic'], required: true },
      { key: 'description', label: 'Symptom Description', type: 'text', placeholder: 'e.g. Chronic cough, chest tightness', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, category: 'Constitutional', description: 'Fatigue / Malaise', status: 'Active' },
      { id: 2, category: 'Constitutional', description: 'Unexplained Weight Loss', status: 'Active' },
      { id: 3, category: 'Cardiovascular', description: 'Palpitations', status: 'Active' },
      { id: 4, category: 'Cardiovascular', description: 'Orthopnea', status: 'Active' },
      { id: 5, category: 'Respiratory', description: 'Dyspnea on exertion', status: 'Active' },
      { id: 6, category: 'Respiratory', description: 'Hemoptysis', status: 'Active' },
      { id: 7, category: 'Gastrointestinal', description: 'Dysphagia', status: 'Active' },
      { id: 8, category: 'Neurological', description: 'Syncope / Lightheadedness', status: 'Active' },
    ],
  },
  {
    key: 'ros-symptoms-abnormal',
    title: 'EMR ROS Symptoms Abnormalities',
    category: 'ROS & Symptoms',
    legacyUrl: 'viewROSSymptomsAbnormal',
    description: 'Manages abnormal findings and red-flag triggers for ROS symptoms.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'symptomName', label: 'ROS Symptom' },
      { key: 'description', label: 'Abnormal Finding Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'symptomName', label: 'Associated ROS Symptom', type: 'text', placeholder: 'e.g. Chest pain', required: true },
      { key: 'description', label: 'Abnormality Detail', type: 'textarea', placeholder: 'e.g. Crushing retrosternal pain radiating to left arm', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, symptomName: 'Chest Pain', description: 'Crushing substernal pressure with diaphoresis (Cardiac Red Flag)', status: 'Active' },
      { id: 2, symptomName: 'Dyspnea', description: 'Stridor or audible wheezing at rest', status: 'Active' },
      { id: 3, symptomName: 'Headache', description: 'Thunderclap onset / worst headache of life', status: 'Active' },
      { id: 4, symptomName: 'Abdominal Pain', description: 'Rebound tenderness / involuntary guarding', status: 'Active' },
    ],
  },

  // ─── 2. Physical Examination ───
  {
    key: 'physical-exam-desc',
    title: 'EMR Physical Exam Descriptions',
    category: 'Physical Examination',
    legacyUrl: 'viewPhysicalExamDescription',
    description: 'Master catalog of physical examination items and normal finding templates.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'category', label: 'Exam System' },
      { key: 'description', label: 'Examination Item' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'category', label: 'Exam System', type: 'select', options: ['General Appearance', 'Head & Neck', 'Cardiovascular', 'Respiratory', 'Abdomen', 'Neurological', 'Extremities', 'Skin'], required: true },
      { key: 'description', label: 'Examination Item', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, category: 'General Appearance', description: 'Well-nourished, in no acute distress', status: 'Active' },
      { id: 2, category: 'Cardiovascular', description: 'Normal S1 and S2, no murmurs, gallops, or rubs', status: 'Active' },
      { id: 3, category: 'Respiratory', description: 'Clear to auscultation bilaterally, good air entry', status: 'Active' },
      { id: 4, category: 'Abdomen', description: 'Soft, non-distended, non-tender, active bowel sounds', status: 'Active' },
    ],
  },
  {
    key: 'physical-exam-abnormal',
    title: 'EMR Physical Exam Abnormality Findings',
    category: 'Physical Examination',
    legacyUrl: 'viewPhysicalExamAbnormality',
    description: 'Clinical abnormal signs and physical findings matrix.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'examSystem', label: 'System' },
      { key: 'description', label: 'Abnormality Finding' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'examSystem', label: 'Exam System', type: 'text', required: true },
      { key: 'description', label: 'Abnormal Sign / Finding', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, examSystem: 'General', description: 'Marked pallor, icterus present', status: 'Active' },
      { id: 2, examSystem: 'Cardiovascular', description: 'Grade 3/6 systolic ejection murmur at right upper sternal border', status: 'Active' },
      { id: 3, examSystem: 'Respiratory', description: 'Bilateral basal inspiratory fine crackles', status: 'Active' },
      { id: 4, examSystem: 'Abdomen', description: 'Hepatomegaly 3cm below costal margin, tender', status: 'Active' },
    ],
  },

  // ─── 3. Anesthesia Masters ───
  {
    key: 'anesthesia-common',
    title: 'Anesthesia Common Master',
    category: 'Anesthesia',
    legacyUrl: 'EMRCommon/getAnesthesiaMenu/1',
    description: 'Master parameters and normal ranges for pre-op and intra-op anesthesia.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'code', label: 'Parameter Code' },
      { key: 'header', label: 'Header Group' },
      { key: 'description', label: 'Parameter Name' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'code', label: 'Parameter Code', type: 'text', required: true },
      { key: 'header', label: 'Header Group', type: 'select', options: ['Airway Assessment', 'Pre-Medication', 'Anesthetic Induction', 'Monitoring', 'Regional Anesthesia', 'Recovery (PACU)'], required: true },
      { key: 'description', label: 'Parameter Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, code: 'ASA_CLASS', header: 'Airway Assessment', description: 'ASA Physical Status Classification (I-VI)', status: 'Active' },
      { id: 2, code: 'MALLAMPATI', header: 'Airway Assessment', description: 'Mallampati Airway Score (Class I-IV)', status: 'Active' },
      { id: 3, code: 'INTUBATION', header: 'Anesthetic Induction', description: 'Endotracheal Tube Size & Cormack Grade', status: 'Active' },
      { id: 4, code: 'ALB_SCORE', header: 'Recovery (PACU)', description: 'Modified Aldrete PACU Discharge Score', status: 'Active' },
    ],
  },
  {
    key: 'anesthesia-record',
    title: 'Anesthesia Record Master',
    category: 'Anesthesia',
    legacyUrl: 'EMRCommon/AnesthesiaRecordView',
    description: 'Order sequence and time-based logging templates for intra-operative anesthesia charts.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'orderSeq', label: 'Order Seq', width: 90 },
      { key: 'type', label: 'Common Type' },
      { key: 'description', label: 'Monitoring Event' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'orderSeq', label: 'Order Sequence', type: 'number', required: true },
      { key: 'type', label: 'Log Type', type: 'text', required: true },
      { key: 'description', label: 'Event Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, orderSeq: 1, type: 'Time Check', description: 'Anesthesia Induction Start', status: 'Active' },
      { id: 2, orderSeq: 2, type: 'Time Check', description: 'Intubation Confirmed / Bilateral Breath Sounds', status: 'Active' },
      { id: 3, orderSeq: 3, type: 'Time Check', description: 'Surgical Incision', status: 'Active' },
      { id: 4, orderSeq: 4, type: 'Time Check', description: 'Extubation / Reversal Agent Given', status: 'Active' },
    ],
  },
  {
    key: 'anesthesia-templates',
    title: 'Anesthesia Templates',
    category: 'Anesthesia',
    legacyUrl: 'viewAnesthesia',
    description: 'Preoperative and intraoperative anesthesia documentation templates.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Template Name' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Template Name', type: 'text', required: true },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Anesthesiology' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'General Anesthesia Standard Adult Protocol', department: 'Anesthesiology', status: 'Active' },
      { id: 2, name: 'Subarachnoid Block (Spinal Anesthesia) Template', department: 'Anesthesiology', status: 'Active' },
      { id: 3, name: 'Monitored Anesthesia Care (MAC) with Sedation', department: 'Anesthesiology', status: 'Active' },
      { id: 4, name: 'Labor Epidural Analgesia Record', department: 'Obstetrics', status: 'Active' },
    ],
  },

  // ─── 4. Clinical Assessments & Scoring ───
  {
    key: 'appetite',
    title: 'Appetite Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrAppetite',
    description: 'Standard clinical documentation options for patient appetite intake.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Appetite Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Appetite Description', type: 'text', placeholder: 'e.g. Good, Fair, Poor', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'Good / Normal Appetite (≥75% meals consumed)', status: 'Active' },
      { id: 2, description: 'Fair Appetite (50-74% meals consumed)', status: 'Active' },
      { id: 3, description: 'Poor / Decreased Appetite (<50% meals consumed)', status: 'Active' },
      { id: 4, description: 'Anorexic / Refusing solid foods', status: 'Active' },
    ],
  },
  {
    key: 'swallowing',
    title: 'Swallowing Screening Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrSwallowing',
    description: 'Clinical dysphagia screening and swallowing status options.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Swallowing Status' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Swallowing Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'Normal / Intact Swallowing Reflex', status: 'Active' },
      { id: 2, description: 'Dysphagia for Solids only', status: 'Active' },
      { id: 3, description: 'Dysphagia for Liquids only (Coughing / Choking)', status: 'Active' },
      { id: 4, description: 'Severe Dysphagia - NPO / Aspiration Risk', status: 'Active' },
    ],
  },
  {
    key: 'weight-changes',
    title: 'Recent Weight Changes Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrRecentWeightChanges',
    description: 'Nutritional options for documenting acute or chronic weight fluctuations.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Weight Change Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Weight Change Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'No Weight Change (Weight Stable)', status: 'Active' },
      { id: 2, description: 'Unintentional Weight Loss (>5% in 1 month)', status: 'Active' },
      { id: 3, description: 'Severe Unintentional Weight Loss (>10% in 6 months)', status: 'Active' },
      { id: 4, description: 'Rapid Fluid Weight Gain (>2 kg in 48h - Heart Failure / Renal)', status: 'Active' },
    ],
  },
  {
    key: 'fall-risk-assessments',
    title: 'Fall Risk Assessments Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'getFallRiskAssessments',
    description: 'Inpatient fall risk assessment tool types and protocols.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Assessment Name' },
      { key: 'type', label: 'Scale Type' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Assessment Name', type: 'text', required: true },
      { key: 'type', label: 'Scale Type', type: 'select', options: ['Adult Inpatient (Morse)', 'Pediatric (Humpty Dumpty)', 'Elderly (Hendrich II)', 'Rehabilitation (Berg)'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Morse Fall Scale Protocol', type: 'Adult Inpatient (Morse)', status: 'Active' },
      { id: 2, name: 'Humpty Dumpty Pediatric Fall Protocol', type: 'Pediatric (Humpty Dumpty)', status: 'Active' },
      { id: 3, name: 'Hendrich II Fall Risk Model', type: 'Elderly (Hendrich II)', status: 'Active' },
    ],
  },
  {
    key: 'fall-risk-factors',
    title: 'Fall Risk Factors',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrFallRiskFactors',
    description: 'Risk factor checklist items contributing to fall risk scores.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Risk Factor Description' },
      { key: 'points', label: 'Default Points' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Factor Description', type: 'text', required: true },
      { key: 'points', label: 'Assigned Score Points', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'History of falling within past 3 months', points: 25, status: 'Active' },
      { id: 2, description: 'Secondary clinical diagnosis present', points: 15, status: 'Active' },
      { id: 3, description: 'Ambulatory aid (Crutches / Walker / Furniture support)', points: 30, status: 'Active' },
      { id: 4, description: 'Intravenous therapy / Heparin lock connected', points: 20, status: 'Active' },
      { id: 5, description: 'Impaired gait / Weakness', points: 20, status: 'Active' },
      { id: 6, description: 'Mental status: Overestimates abilities / forgets limitations', points: 15, status: 'Active' },
    ],
  },
  {
    key: 'humpty-dumpty',
    title: 'Humpty Dumpty Fall Scale Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'EMRCommon/HumDumView',
    description: 'Pediatric Humpty Dumpty Fall Risk Scale scoring configuration.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'header', label: 'Dimension' },
      { key: 'description', label: 'Parameter & Criteria' },
      { key: 'score', label: 'Score Value' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'header', label: 'Dimension', type: 'text', required: true },
      { key: 'description', label: 'Parameter Criteria', type: 'text', required: true },
      { key: 'score', label: 'Score', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, header: 'Age', description: 'Under 3 years old', score: 4, status: 'Active' },
      { id: 2, header: 'Age', description: '3 to 7 years old', score: 3, status: 'Active' },
      { id: 3, header: 'Diagnosis', description: 'Neurological diagnosis', score: 4, status: 'Active' },
      { id: 4, header: 'Medications', description: 'Sedatives, hypnotics, phenobarbital', score: 3, status: 'Active' },
    ],
  },
  {
    key: 'gad7',
    title: 'Generalised Anxiety Disorder (GAD-7) Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'EMRCommon/viewGeneralAnxietyDisorder',
    description: 'Standard GAD-7 assessment scale survey items and scoring levels.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'orderSeq', label: 'Item #', width: 70 },
      { key: 'description', label: 'Questionnaire Prompt' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'orderSeq', label: 'Question Number', type: 'number', required: true },
      { key: 'description', label: 'Question Text', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, orderSeq: 1, description: 'Feeling nervous, anxious or on edge', status: 'Active' },
      { id: 2, orderSeq: 2, description: 'Not being able to stop or control worrying', status: 'Active' },
      { id: 3, orderSeq: 3, description: 'Worrying too much about different things', status: 'Active' },
      { id: 4, orderSeq: 4, description: 'Trouble relaxing', status: 'Active' },
      { id: 5, orderSeq: 5, description: 'Being so restless that it is hard to sit still', status: 'Active' },
      { id: 6, orderSeq: 6, description: 'Becoming easily annoyed or irritable', status: 'Active' },
      { id: 7, orderSeq: 7, description: 'Feeling afraid as if something awful might happen', status: 'Active' },
    ],
  },
  {
    key: 'phq9',
    title: 'Patient Health Questionnaire (PHQ-9) Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'EMRCommon/viewPatientHealthQuestionnaire',
    description: 'Standard PHQ-9 depression screening tool items and clinical thresholds.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'orderSeq', label: 'Item #', width: 70 },
      { key: 'description', label: 'Depression Screen Prompt' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'orderSeq', label: 'Question #', type: 'number', required: true },
      { key: 'description', label: 'Question Prompt', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, orderSeq: 1, description: 'Little interest or pleasure in doing things', status: 'Active' },
      { id: 2, orderSeq: 2, description: 'Feeling down, depressed, or hopeless', status: 'Active' },
      { id: 3, orderSeq: 3, description: 'Trouble falling or staying asleep, or sleeping too much', status: 'Active' },
      { id: 4, orderSeq: 4, description: 'Feeling tired or having little energy', status: 'Active' },
      { id: 5, orderSeq: 5, description: 'Poor appetite or overeating', status: 'Active' },
      { id: 6, orderSeq: 6, description: 'Feeling bad about yourself or that you are a failure', status: 'Active' },
      { id: 7, orderSeq: 7, description: 'Trouble concentrating on things such as reading or television', status: 'Active' },
      { id: 8, orderSeq: 8, description: 'Moving or speaking so slowly that other people have noticed', status: 'Active' },
      { id: 9, orderSeq: 9, description: 'Thoughts that you would be better off dead, or hurting yourself', status: 'Active' },
    ],
  },
  {
    key: 'pain-frequency',
    title: 'Pain Score Frequency Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrPainScoreFrequency',
    description: 'Standard clinical options for pain frequency and periodicity.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Pain Frequency Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Frequency Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'Constant / Unremitting (Present continuous all day)', status: 'Active' },
      { id: 2, description: 'Intermittent (Comes and goes in waves)', status: 'Active' },
      { id: 3, description: 'Occasional (Triggered only by movement / exertion)', status: 'Active' },
      { id: 4, description: 'Nocturnal (Awakens patient from sleep)', status: 'Active' },
    ],
  },
  {
    key: 'caregiver-education',
    title: 'Patient Caregiver Education Master',
    category: 'Clinical Assessments & Scoring',
    legacyUrl: 'viewEmrPCD',
    description: 'Standard education topics and documentation options for patients and families.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Educational Topic' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'category', label: 'Education Category', type: 'text', required: true },
      { key: 'description', label: 'Topic Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, category: 'Medications', description: 'Drug indication, dosage timing, and major adverse effects', status: 'Active' },
      { id: 2, category: 'Diet & Nutrition', description: 'Diabetic / Renal / Low-salt diet restrictions', status: 'Active' },
      { id: 3, category: 'Safety & Falls', description: 'Call bell usage, non-skid socks, assisted ambulation', status: 'Active' },
      { id: 4, category: 'Wound Care', description: 'Surgical incision hygiene, dressing change, signs of infection', status: 'Active' },
    ],
  },

  // ─── 5. Nursing & ICU Masters ───
  {
    key: 'crrt-nursing',
    title: 'CRRT Nursing Documentation Master',
    category: 'Nursing & ICU',
    legacyUrl: 'viewCRRTNursingMaster',
    description: 'Continuous Renal Replacement Therapy parameter catalog.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'header', label: 'Header Category' },
      { key: 'description', label: 'Parameter Detail' },
      { key: 'detailType', label: 'Type' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'header', label: 'Category', type: 'text', required: true },
      { key: 'description', label: 'Parameter Name', type: 'text', required: true },
      { key: 'detailType', label: 'Value Type', type: 'select', options: ['Numeric (mL/hr)', 'Numeric (mmHg)', 'Dropdown', 'Text'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, header: 'Prescription', description: 'Blood Flow Rate (Qb mL/min)', detailType: 'Numeric (mL/hr)', status: 'Active' },
      { id: 2, header: 'Prescription', description: 'Dialysate Flow Rate (Qd mL/hr)', detailType: 'Numeric (mL/hr)', status: 'Active' },
      { id: 3, header: 'Monitoring', description: 'Filter Transmembrane Pressure (TMP)', detailType: 'Numeric (mmHg)', status: 'Active' },
      { id: 4, header: 'Anticoagulation', description: 'Citrate / Heparin Protocol Infusion', detailType: 'Dropdown', status: 'Active' },
    ],
  },
  {
    key: 'icu-ventilation',
    title: 'ICU Ventilation Master',
    category: 'Nursing & ICU',
    legacyUrl: 'viewICUVentilationMaster',
    description: 'Mechanical ventilator settings and airway monitoring parameters.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'header', label: 'Category' },
      { key: 'description', label: 'Parameter' },
      { key: 'options', label: 'Options / UOM' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'header', label: 'Category', type: 'text', required: true },
      { key: 'description', label: 'Ventilator Parameter', type: 'text', required: true },
      { key: 'options', label: 'Units / Range / Options', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, header: 'Mode', description: 'Ventilation Mode', options: 'AC/VC, AC/PC, SIMV, PSV, APRV, CPAP', status: 'Active' },
      { id: 2, header: 'Settings', description: 'FiO2 (Fraction of Inspired Oxygen)', options: '21% - 100%', status: 'Active' },
      { id: 3, header: 'Settings', description: 'Positive End-Expiratory Pressure (PEEP)', options: '0 - 25 cmH2O', status: 'Active' },
      { id: 4, header: 'Settings', description: 'Tidal Volume (Vt)', options: 'mL (6-8 mL/kg PBW)', status: 'Active' },
      { id: 5, header: 'Monitoring', description: 'Peak Inspiratory Pressure (Ppeak)', options: 'cmH2O (<35)', status: 'Active' },
    ],
  },
  {
    key: 'lines-drains-category',
    title: 'Lines & Drains Category Master',
    category: 'Nursing & ICU',
    legacyUrl: 'LinesDrainsCategory',
    description: 'Invasive vascular access, surgical drains, and catheter classification.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Category Name' },
      { key: 'type', label: 'Access Type' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Category Name', type: 'text', required: true },
      { key: 'type', label: 'Access Type', type: 'select', options: ['Vascular Lines', 'Surgical Drains', 'Urinary Catheters', 'Enteral Tubes', 'Chest Tubes'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Peripheral Intravenous Line (PIVC)', type: 'Vascular Lines', status: 'Active' },
      { id: 2, name: 'Central Venous Catheter (CVC)', type: 'Vascular Lines', status: 'Active' },
      { id: 3, name: 'Arterial Line (A-Line)', type: 'Vascular Lines', status: 'Active' },
      { id: 4, name: 'Jackson-Pratt (JP) Closed Wound Drain', type: 'Surgical Drains', status: 'Active' },
      { id: 5, name: 'Indwelling Foley Catheter', type: 'Urinary Catheters', status: 'Active' },
      { id: 6, name: 'Intercostal Chest Drain (ICD)', type: 'Chest Tubes', status: 'Active' },
    ],
  },
  {
    key: 'ipd-nursing-task',
    title: 'IPD Nursing Task Master',
    category: 'Nursing & ICU',
    legacyUrl: 'getIPDNursing',
    description: 'Standard nursing clinical care activities scheduled during inpatient admissions.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Task Name' },
      { key: 'icon', label: 'Icon Code' },
      { key: 'department', label: 'Target Ward' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Nursing Task Name', type: 'text', required: true },
      { key: 'icon', label: 'FontAwesome Icon Class', type: 'text', placeholder: 'fa-solid fa-bed' },
      { key: 'department', label: 'Target Ward', type: 'text', placeholder: 'All Wards' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Vital Signs Q4H Check', icon: 'fa-solid fa-heart-pulse', department: 'All Wards', status: 'Active' },
      { id: 2, name: 'Position Turning Q2H (Pressure Injury Prevention)', icon: 'fa-solid fa-arrows-spin', department: 'ICU / HDU', status: 'Active' },
      { id: 3, name: 'Blood Glucose Monitoring (AC / HS)', icon: 'fa-solid fa-droplet', department: 'Medical Ward', status: 'Active' },
      { id: 4, name: 'Surgical Wound Dressing Change', icon: 'fa-solid fa-bandage', department: 'Surgical Ward', status: 'Active' },
    ],
  },

  // ─── 6. Surgery & OT Masters ───
  {
    key: 'surgery-booking',
    title: 'EMR Surgery Booking Details Master',
    category: 'Surgery & OT',
    legacyUrl: 'viewSurgeryBooking',
    description: 'Operating theatre booking parameters, laterality, and classification rules.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Surgery Procedure Name' },
      { key: 'method', label: 'Classification' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Procedure Name', type: 'text', required: true },
      { key: 'method', label: 'Classification', type: 'select', options: ['Major Surgery', 'Minor Surgery', 'Intermediate', 'Day Care (Ambulatory)'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Laparoscopic Cholecystectomy', method: 'Major Surgery', status: 'Active' },
      { id: 2, name: 'Total Knee Arthroplasty (TKA)', method: 'Major Surgery', status: 'Active' },
      { id: 3, name: 'Inguinal Hernioplasty (Lichtenstein)', method: 'Intermediate', status: 'Active' },
      { id: 4, name: 'Diagnostic Upper GI Endoscopy', method: 'Day Care (Ambulatory)', status: 'Active' },
    ],
  },
  {
    key: 'surgery-item-count',
    title: 'Surgery Item Count Master (SIC)',
    category: 'Surgery & OT',
    legacyUrl: 'getSIC',
    description: 'Sponge, sharp, and instrument count items for operating room safety.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Item Name' },
      { key: 'category', label: 'Item Category' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Surgical Item Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Sponges / Gauze', 'Sharps / Needles', 'Instruments', 'Miscellaneous Devices'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Laparotomy Sponges (Ray-Tec X-ray Detectable)', category: 'Sponges / Gauze', status: 'Active' },
      { id: 2, name: 'Surgical Gauze Swabs 10x10', category: 'Sponges / Gauze', status: 'Active' },
      { id: 3, name: 'Suture Needles', category: 'Sharps / Needles', status: 'Active' },
      { id: 4, name: 'Scalpel Blades #10 / #11 / #15', category: 'Sharps / Needles', status: 'Active' },
      { id: 5, name: 'Artery Forceps / Hemostats', category: 'Instruments', status: 'Active' },
    ],
  },
  {
    key: 'surgery-templates',
    title: 'Surgery Verification Templates (WHO Checklist)',
    category: 'Surgery & OT',
    legacyUrl: 'getSurgeryTemplates',
    description: 'WHO Surgical Safety Checklist templates (Sign In, Time Out, Sign Out).',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Checklist Stage' },
      { key: 'department', label: 'Service / Department' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Checklist Stage Name', type: 'text', required: true },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'Operating Theatre' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Sign In (Before Induction of Anesthesia)', department: 'Operating Theatre', status: 'Active' },
      { id: 2, name: 'Time Out (Before Skin Incision)', department: 'Operating Theatre', status: 'Active' },
      { id: 3, name: 'Sign Out (Before Patient Leaves Operating Room)', department: 'Operating Theatre', status: 'Active' },
    ],
  },
  {
    key: 'patient-skin-prep',
    title: 'Patient Skin Prep Master',
    category: 'Surgery & OT',
    legacyUrl: 'getPatientSP',
    description: 'Surgical antiseptic skin preparation protocols and solutions.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'prepArea', label: 'Anatomical Area' },
      { key: 'solution', label: 'Antiseptic Solution' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'prepArea', label: 'Anatomical Area', type: 'text', required: true },
      { key: 'solution', label: 'Solution Used', type: 'select', options: ['Chlorhexidine Gluconate 2% in 70% Isopropyl Alcohol', 'Povidone-Iodine 10% Aqueous', 'Povidone-Iodine 10% in Alcohol', 'Sterile Saline (Mucosal)'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, prepArea: 'Abdomen & Flank', solution: 'Chlorhexidine Gluconate 2% in 70% Isopropyl Alcohol', status: 'Active' },
      { id: 2, prepArea: 'Ophthalmic / Periorbital Area', solution: 'Povidone-Iodine 10% Aqueous', status: 'Active' },
      { id: 3, prepArea: 'Extremities (Orthopedic Site)', solution: 'Chlorhexidine Gluconate 2% in 70% Isopropyl Alcohol', status: 'Active' },
    ],
  },

  // ─── 7. Physical Therapy & Rehab ───
  {
    key: 'range-of-motion',
    title: 'Range of Motion (ROM) Master',
    category: 'Physical Therapy & Rehab',
    legacyUrl: 'rangeOfMotion',
    description: 'Joint anatomical movements and normative degree thresholds.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'joint', label: 'Joint Name' },
      { key: 'movement', label: 'Movement Type' },
      { key: 'normalDegrees', label: 'Normal Degrees (°)' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'joint', label: 'Joint Name', type: 'text', required: true },
      { key: 'movement', label: 'Movement', type: 'text', required: true },
      { key: 'normalDegrees', label: 'Normal Degrees (°)', type: 'text', placeholder: 'e.g. 0-140°', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, joint: 'Knee', movement: 'Flexion', normalDegrees: '0 - 135°', status: 'Active' },
      { id: 2, joint: 'Knee', movement: 'Extension', normalDegrees: '0 - 5°', status: 'Active' },
      { id: 3, joint: 'Shoulder', movement: 'Forward Flexion', normalDegrees: '0 - 180°', status: 'Active' },
      { id: 4, joint: 'Shoulder', movement: 'Abduction', normalDegrees: '0 - 180°', status: 'Active' },
      { id: 5, joint: 'Hip', movement: 'Flexion', normalDegrees: '0 - 120°', status: 'Active' },
    ],
  },
  {
    key: 'muscle-strength',
    title: 'Muscle Strength (MRC) Master',
    category: 'Physical Therapy & Rehab',
    legacyUrl: 'MuscleStrength/view',
    description: 'Medical Research Council 0-5 muscle grading scale.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'grade', label: 'MRC Grade' },
      { key: 'description', label: 'Clinical Definition' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'grade', label: 'MRC Grade (0-5)', type: 'text', required: true },
      { key: 'description', label: 'Clinical Definition', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, grade: 'Grade 5', description: 'Normal power against full resistance', status: 'Active' },
      { id: 2, grade: 'Grade 4', description: 'Active movement against gravity and moderate resistance', status: 'Active' },
      { id: 3, grade: 'Grade 3', description: 'Active movement against gravity only (no resistance)', status: 'Active' },
      { id: 4, grade: 'Grade 2', description: 'Active movement with gravity eliminated', status: 'Active' },
      { id: 5, grade: 'Grade 1', description: 'Flicker or trace contraction visible / palpable', status: 'Active' },
      { id: 6, grade: 'Grade 0', description: 'Complete paralysis (no muscle contraction)', status: 'Active' },
    ],
  },

  // ─── 8. Emergency & Triage ───
  {
    key: 'emergency-type',
    title: 'Emergency Type Master',
    category: 'Emergency & Triage',
    legacyUrl: 'viewEmergencydetails',
    description: 'Classifications of emergency department presentations.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Emergency Type Name' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Emergency Type Name', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Major Trauma (Polytrauma / MVC)', status: 'Active' },
      { id: 2, name: 'Acute Cardiac (Chest Pain / STEMI)', status: 'Active' },
      { id: 3, name: 'Acute Stroke (Code Stroke / CVA)', status: 'Active' },
      { id: 4, name: 'Respiratory Arrest / Severe Distress', status: 'Active' },
      { id: 5, name: 'General Medical Emergency', status: 'Active' },
      { id: 6, name: 'Pediatric Emergency', status: 'Active' },
    ],
  },
  {
    key: 'triage-level',
    title: 'EMR Triage CTAS Interventions & Disposition',
    category: 'Emergency & Triage',
    legacyUrl: 'viewTriageLevel',
    description: 'Canadian Triage and Acuity Scale (CTAS) levels and target response times.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Triage Acuity Level' },
      { key: 'targetTime', label: 'Response Target' },
      { key: 'details', label: 'Clinical Criteria' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Triage Level', type: 'text', required: true },
      { key: 'targetTime', label: 'Target Time', type: 'text', required: true },
      { key: 'details', label: 'Criteria', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'CTAS Level 1 - Resuscitation', targetTime: 'Immediate (0 min)', details: 'Arrest, shock, severe respiratory failure, unconsciousness', status: 'Active' },
      { id: 2, name: 'CTAS Level 2 - Emergent', targetTime: '< 15 minutes', details: 'Severe pain (8-10), altered mental state, high-risk cardiac presentation', status: 'Active' },
      { id: 3, name: 'CTAS Level 3 - Urgent', targetTime: '< 30 minutes', details: 'Moderate distress, mild dehydration, potential fracture', status: 'Active' },
      { id: 4, name: 'CTAS Level 4 - Less Urgent', targetTime: '< 60 minutes', details: 'Minor trauma, earache, uncomplicated UTI', status: 'Active' },
      { id: 5, name: 'CTAS Level 5 - Non-Urgent', targetTime: '< 120 minutes', details: 'Medication refill, suture removal, chronic mild symptom', status: 'Active' },
    ],
  },

  // ─── 9. Specialty Forms ───
  {
    key: 'dental-category',
    title: 'Dental Category Details Master',
    category: 'Specialty Forms',
    legacyUrl: 'viewDentalCategory',
    description: 'Dental anatomical quadrant and clinical diagnostic categories.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'name', label: 'Category Name' },
      { key: 'type', label: 'Type Name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'name', label: 'Category Name', type: 'text', required: true },
      { key: 'type', label: 'Type Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, name: 'Caries / Cavity', type: 'Restorative', description: 'Enamel & dentin decay requiring filling / inlay', status: 'Active' },
      { id: 2, name: 'Pulpitis / Periapical Abscess', type: 'Endodontics', description: 'Root canal therapy indicated', status: 'Active' },
      { id: 3, name: 'Gingivitis / Periodontitis', type: 'Periodontics', description: 'Scaling and root planing protocol', status: 'Active' },
      { id: 4, name: 'Impacted Third Molar', type: 'Oral Surgery', description: 'Surgical extraction indicated', status: 'Active' },
    ],
  },
  {
    key: 'obgyn-bleeding',
    title: 'OBGYN Bleeding Patterns Master',
    category: 'Specialty Forms',
    legacyUrl: 'viewEMROBGYNBleedingPattern',
    description: 'Menstrual and abnormal uterine bleeding (AUB) descriptions.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Bleeding Pattern Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Pattern Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'Normal Menstrual Flow (Eumenorrhea, 3-7 days, regular)', status: 'Active' },
      { id: 2, description: 'Heavy Menstrual Bleeding / Menorrhagia (>80mL / soaking pads hourly)', status: 'Active' },
      { id: 3, description: 'Intermenstrual Bleeding / Metrorrhagia (Spotting between cycles)', status: 'Active' },
      { id: 4, description: 'Post-Coital Bleeding', status: 'Active' },
      { id: 5, description: 'Post-Menopausal Bleeding (Red Flag for Endometrial Pathology)', status: 'Active' },
    ],
  },
  {
    key: 'drug-instructions',
    title: 'Drug Instructions Method Master',
    category: 'Administration & Configuration',
    legacyUrl: 'viewDrugInstructions',
    description: 'Standardized prescription dosage food relationships and patient instructions.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'description', label: 'Instruction Description' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'description', label: 'Instruction Description', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, description: 'Before Food (Take 30-60 mins prior to meals)', status: 'Active' },
      { id: 2, description: 'After Food (Take immediately following meal)', status: 'Active' },
      { id: 3, description: 'With Food / Meal', status: 'Active' },
      { id: 4, description: 'At Bedtime (HS)', status: 'Active' },
      { id: 5, description: 'As Directed by Physician / PRN for pain', status: 'Active' },
    ],
  },
  {
    key: 'template-short-codes',
    title: 'Template Short Code Master',
    category: 'Administration & Configuration',
    legacyUrl: 'viewTemplateShortCode',
    description: 'Physician auto-expanding shorthand macros for rapid clinical documentation.',
    columns: [
      { key: 'id', label: 'S.No', width: 60 },
      { key: 'code', label: 'Short Code Macro' },
      { key: 'description', label: 'Expanded Clinical Text' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { key: 'code', label: 'Short Code (e.g. .htn)', type: 'text', required: true },
      { key: 'description', label: 'Expanded Replacement Text', type: 'textarea', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    seedData: [
      { id: 1, code: '.htn', description: 'Patient with essential hypertension on regular antihypertensive therapy, BP controlled.', status: 'Active' },
      { id: 2, code: '.t2dm', description: 'Type 2 Diabetes Mellitus without acute complications, compliant with oral hypoglycemic agents.', status: 'Active' },
      { id: 3, code: '.normpe', description: 'General: Well-appearing, alert. CVS: S1 S2 normal, no murmurs. RS: Clear breath sounds bilaterally. PA: Soft, non-tender. CNS: No focal neurological deficit.', status: 'Active' },
    ],
  },
];

const LOCAL_STORAGE_KEY_PREFIX = 'himes_emr_master_';

/** Get live items for a master key (from localStorage or seedData) */
export function getMasterData(masterKey: string): MasterItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${masterKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback */
  }
  const def = EMR_MASTERS_CATALOG.find((m) => m.key === masterKey || m.legacyUrl.toLowerCase() === masterKey.toLowerCase());
  return def ? def.seedData : [];
}

/** Save updated items for a master key */
export function saveMasterData(masterKey: string, items: MasterItem[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${masterKey}`, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}
