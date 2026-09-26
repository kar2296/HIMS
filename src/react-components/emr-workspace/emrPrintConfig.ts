/**
 * EMR Print Configuration Master Data & Service
 * Provides centralized settings for paper size, margins, header style,
 * and section-level panel visibility for all EMR prints.
 */

export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type HeaderStyle = 'with_header' | 'without_header';
export type FontSizeScale = 'compact' | 'standard' | 'large';

export interface PrintPanelSectionConfig {
  id: string;
  name: string;
  defaultTitle: string;
  customTitle: string;
  enabled: boolean;
  order: number;
  icon: string;
  category: 'demographics' | 'clinical' | 'orders' | 'history' | 'footer';
  description: string;
}

export interface EmrPrintMasterSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  headerStyle: HeaderStyle;
  topMarginMm: number;
  bottomMarginMm: number;
  leftMarginMm: number;
  rightMarginMm: number;
  contentPaddingMm: number;
  fontSizeScale: FontSizeScale;
  showFacilityLogo: boolean;
  showHeaderDivider: boolean;
  showPageNumbers: boolean;
  showBarcode: boolean;
  showDoctorSignature: boolean;
  signatureStyle: 'right' | 'dual' | 'simple';
  customHospitalTitle?: string;
  customSubTitle?: string;
  customFooterNote?: string;
  sections: PrintPanelSectionConfig[];
}

export const DEFAULT_PRINT_SECTIONS: PrintPanelSectionConfig[] = [
  {
    id: 'demographics',
    name: 'Patient Demographics',
    defaultTitle: 'PATIENT DEMOGRAPHICS & VISIT INFO',
    customTitle: 'PATIENT DEMOGRAPHICS & VISIT INFO',
    enabled: true,
    order: 1,
    icon: 'fa-user',
    category: 'demographics',
    description: 'UHID, Patient Name, Age, Gender, Visit / OP Number, Admission Date, Attending Doctor',
  },
  {
    id: 'vitals',
    name: 'Vitals & Biometrics',
    defaultTitle: 'VITALS & BIOMETRICS',
    customTitle: 'VITALS & BIOMETRICS',
    enabled: true,
    order: 2,
    icon: 'fa-heart-pulse',
    category: 'clinical',
    description: 'Blood Pressure, Pulse, Temperature, SpO2, Respiratory Rate, Height, Weight, BMI',
  },
  {
    id: 'allergies',
    name: 'Allergies & Alerts',
    defaultTitle: 'ALLERGIES & ADVERSE REACTIONS',
    customTitle: 'ALLERGIES & ADVERSE REACTIONS',
    enabled: true,
    order: 3,
    icon: 'fa-triangle-exclamation',
    category: 'clinical',
    description: 'Drug, Food, Environmental allergies, or verified No Known Allergies (NKA)',
  },
  {
    id: 'complaints',
    name: 'Chief Complaints',
    defaultTitle: 'CHIEF COMPLAINTS',
    customTitle: 'CHIEF COMPLAINTS',
    enabled: true,
    order: 4,
    icon: 'fa-clipboard-question',
    category: 'clinical',
    description: 'Primary presenting complaints, duration, severity, and onset notes',
  },
  {
    id: 'hpi',
    name: 'History of Present Illness (HPI)',
    defaultTitle: 'HISTORY OF PRESENT ILLNESS (HPI)',
    customTitle: 'HISTORY OF PRESENT ILLNESS (HPI)',
    enabled: true,
    order: 5,
    icon: 'fa-file-lines',
    category: 'clinical',
    description: 'Detailed narrative description of presenting illness and symptom evolution',
  },
  {
    id: 'diagnoses',
    name: 'Diagnoses & Impressions',
    defaultTitle: 'DIAGNOSIS & CLINICAL IMPRESSIONS',
    customTitle: 'DIAGNOSIS & CLINICAL IMPRESSIONS',
    enabled: true,
    order: 6,
    icon: 'fa-stethoscope',
    category: 'clinical',
    description: 'Primary and secondary diagnoses with ICD-10 coding and certainty',
  },
  {
    id: 'conditions',
    name: 'Problem List & Chronic Conditions',
    defaultTitle: 'PROBLEM LIST / CHRONIC CONDITIONS',
    customTitle: 'PROBLEM LIST / CHRONIC CONDITIONS',
    enabled: true,
    order: 7,
    icon: 'fa-notes-medical',
    category: 'clinical',
    description: 'Ongoing past medical conditions, comorbidities, and active health issues',
  },
  {
    id: 'prescriptions',
    name: 'Prescriptions & Medications (Rx)',
    defaultTitle: 'PRESCRIPTIONS & MEDICATIONS (Rx)',
    customTitle: 'PRESCRIPTIONS & MEDICATIONS (Rx)',
    enabled: true,
    order: 8,
    icon: 'fa-pills',
    category: 'orders',
    description: 'Drug names, generic components, dosage, frequency, duration, route, and timing instructions',
  },
  {
    id: 'orders',
    name: 'Investigations & Diagnostic Services',
    defaultTitle: 'ORDERED INVESTIGATIONS & SERVICES',
    customTitle: 'ORDERED INVESTIGATIONS & SERVICES',
    enabled: true,
    order: 9,
    icon: 'fa-vial-virus',
    category: 'orders',
    description: 'Laboratory blood tests, pathology, radiology imaging (X-Ray, USG, CT), and diagnostics',
  },
  {
    id: 'examination',
    name: 'Review of Systems & Physical Exam',
    defaultTitle: 'PHYSICAL EXAMINATION & SYSTEM REVIEW',
    customTitle: 'PHYSICAL EXAMINATION & SYSTEM REVIEW',
    enabled: true,
    order: 10,
    icon: 'fa-person',
    category: 'clinical',
    description: 'Systemic examination findings (CVS, RS, CNS, P/A) and structured question responses',
  },
  {
    id: 'history',
    name: 'Medical / Surgical / Social History',
    defaultTitle: 'PAST MEDICAL, SURGICAL & SOCIAL HISTORY',
    customTitle: 'PAST MEDICAL, SURGICAL & SOCIAL HISTORY',
    enabled: true,
    order: 11,
    icon: 'fa-clock-rotate-left',
    category: 'history',
    description: 'Past hospitalizations, surgeries, family disease history, smoking, alcohol, and lifestyle',
  },
  {
    id: 'procedures',
    name: 'Procedures Performed / Planned',
    defaultTitle: 'PROCEDURES PERFORMED / PLANNED',
    customTitle: 'PROCEDURES PERFORMED / PLANNED',
    enabled: true,
    order: 12,
    icon: 'fa-syringe',
    category: 'orders',
    description: 'Minor surgical procedures, dressings, suture removals, and clinical interventions',
  },
  {
    id: 'treatment_plan',
    name: 'Treatment Plan & Therapy Advice',
    defaultTitle: 'TREATMENT PLAN & THERAPY ADVICE',
    customTitle: 'TREATMENT PLAN & THERAPY ADVICE',
    enabled: true,
    order: 13,
    icon: 'fa-list-check',
    category: 'clinical',
    description: 'Physical therapy goals, package session planning, diet, and clinical regimens',
  },
  {
    id: 'advice',
    name: 'Clinical Notes & Patient Advice',
    defaultTitle: 'CLINICAL ADVICE & INSTRUCTIONS',
    customTitle: 'CLINICAL ADVICE & INSTRUCTIONS',
    enabled: true,
    order: 14,
    icon: 'fa-comment-medical',
    category: 'clinical',
    description: 'Dietary guidance, activity restrictions, warning signs, and patient counseling',
  },
  {
    id: 'followup',
    name: 'Follow-up & Next Appointment',
    defaultTitle: 'FOLLOW-UP & REVIEW SCHEDULE',
    customTitle: 'FOLLOW-UP & REVIEW SCHEDULE',
    enabled: true,
    order: 15,
    icon: 'fa-calendar-check',
    category: 'clinical',
    description: 'Review date, doctor to visit, repeat tests required before next consultation',
  },
  {
    id: 'signature',
    name: 'Doctor Signature & Authorization',
    defaultTitle: 'AUTHORIZED DOCTOR SIGNATURE',
    customTitle: 'AUTHORIZED DOCTOR SIGNATURE',
    enabled: true,
    order: 16,
    icon: 'fa-signature',
    category: 'footer',
    description: 'Consultant name, degree qualifications, medical council registration number, signature',
  },
];

export const DEFAULT_PRINT_MASTER_SETTINGS: EmrPrintMasterSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  headerStyle: 'with_header',
  topMarginMm: 12,
  bottomMarginMm: 12,
  leftMarginMm: 14,
  rightMarginMm: 14,
  contentPaddingMm: 2,
  fontSizeScale: 'standard',
  showFacilityLogo: true,
  showHeaderDivider: true,
  showPageNumbers: true,
  showBarcode: true,
  showDoctorSignature: true,
  signatureStyle: 'right',
  customHospitalTitle: 'SHUVADARSINI HOSPITAL & DIABETIC CARE',
  customSubTitle: 'Outpatient Consultation & Clinical Assessment Record',
  customFooterNote: 'Keep this document safe for future reference and follow-up consultations.',
  sections: DEFAULT_PRINT_SECTIONS,
};

const STORAGE_KEY = 'hims_emr_print_master_config_v1';

/**
 * Load EMR Print Master settings from local storage or fallback to defaults
 */
export function getPrintMasterSettings(): EmrPrintMasterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRINT_MASTER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<EmrPrintMasterSettings>;

    // Merge default sections if new ones were added
    const existingSectionMap = new Map((parsed.sections || []).map((s) => [s.id, s]));
    const mergedSections = DEFAULT_PRINT_SECTIONS.map((def) => {
      const existing = existingSectionMap.get(def.id);
      return existing ? { ...def, ...existing } : def;
    });

    return {
      ...DEFAULT_PRINT_MASTER_SETTINGS,
      ...parsed,
      sections: mergedSections.sort((a, b) => a.order - b.order),
    };
  } catch {
    return DEFAULT_PRINT_MASTER_SETTINGS;
  }
}

/**
 * Save EMR Print Master settings
 */
export function savePrintMasterSettings(settings: EmrPrintMasterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save EMR Print Master settings:', err);
  }
}

/**
 * Reset to factory defaults
 */
export function resetPrintMasterSettings(): EmrPrintMasterSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
  return DEFAULT_PRINT_MASTER_SETTINGS;
}

/**
 * Preset templates for instant setup
 */
export const PRINT_PRESETS: { id: string; name: string; description: string; settings: Partial<EmrPrintMasterSettings> }[] = [
  {
    id: 'a4_letterhead',
    name: 'Standard A4 (With Hospital Header)',
    description: 'Full hospital letterhead with logo, GSTIN, CIN, and balanced 12mm margins for standard A4 paper.',
    settings: {
      paperSize: 'A4',
      orientation: 'portrait',
      headerStyle: 'with_header',
      topMarginMm: 12,
      bottomMarginMm: 12,
      leftMarginMm: 14,
      rightMarginMm: 14,
      contentPaddingMm: 2,
      fontSizeScale: 'standard',
      showFacilityLogo: true,
      showHeaderDivider: true,
      showPageNumbers: true,
    },
  },
  {
    id: 'a4_preprinted',
    name: 'Pre-Printed Letterhead Stationery (Without Header)',
    description: 'Header omitted with 38mm top margin to fit pre-printed hospital stationery pads.',
    settings: {
      paperSize: 'A4',
      orientation: 'portrait',
      headerStyle: 'without_header',
      topMarginMm: 38,
      bottomMarginMm: 12,
      leftMarginMm: 14,
      rightMarginMm: 14,
      contentPaddingMm: 0,
      fontSizeScale: 'standard',
      showFacilityLogo: false,
      showHeaderDivider: false,
      showPageNumbers: true,
    },
  },
  {
    id: 'a5_rx_pad',
    name: 'Compact Prescription Pad A5 (Rx Focus)',
    description: 'Scaled for A5 doctor prescription pads with compact fonts, vitals, diagnosis, and prescription focus.',
    settings: {
      paperSize: 'A5',
      orientation: 'portrait',
      headerStyle: 'with_header',
      topMarginMm: 8,
      bottomMarginMm: 8,
      leftMarginMm: 10,
      rightMarginMm: 10,
      contentPaddingMm: 1,
      fontSizeScale: 'compact',
      showFacilityLogo: false,
      showHeaderDivider: true,
      showPageNumbers: false,
    },
  },
  {
    id: 'a4_comprehensive',
    name: 'Comprehensive Clinical Case Sheet A4',
    description: 'All 16 sections enabled including Review of Systems, Physical Exam, and detailed medical histories.',
    settings: {
      paperSize: 'A4',
      orientation: 'portrait',
      headerStyle: 'with_header',
      topMarginMm: 14,
      bottomMarginMm: 14,
      leftMarginMm: 16,
      rightMarginMm: 16,
      contentPaddingMm: 3,
      fontSizeScale: 'standard',
      showFacilityLogo: true,
      showHeaderDivider: true,
      showPageNumbers: true,
      showBarcode: true,
    },
  },
];
