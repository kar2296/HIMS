/**
 * Data access for the Discharge Summary Workstation. Every call goes through utils/api.ts apiFetch()
 * (the app's single HTTP path). Only existing endpoints and tables are used:
 *   Visit/Visit/GetEncounters                                  -- IP admissions (worklist + header)
 *   DischargeSummary/patientcertificate/GetPatientCertificates -- the summary (patientcertificates)
 *   dischargesummary/PatientCertificate/Add|UpdatePatientCertificate
 *   emr/prescription/GetPrescriptions (IsDischargeMedication)  -- discharge medicines
 */
import { apiFetch } from '../utils/api';
import type { DischargeMedicine } from './dischargeDocument';

/** EncounterFilters (api/.../Visit/Common/Filters.e.ts). */
const ENC = { Id: 0, AdmissionStatusId: 3, PatientNameMRN: 11, EncounterTypeId: 15 } as const;
/** PatientCertificateFilters. */
const CERT = { EncounterId: 6 } as const;
/** PrescriptionFilters. */
const RX = { PatientId: 2, EncounterId: 12, IsDischargeMedication: 16 } as const;

/** EncounterTypeId of an in-patient admission. */
export const IP_ENCOUNTER_TYPE = 2;

/** Encounter.AdmissionStatusId values shown in the classic form. */
export const ADMISSION_STATUS: Record<number, string> = {
  1: 'Draft',
  2: 'Admitted',
  3: 'Fit for Discharge',
  4: 'Clinical Discharge',
  5: 'Financial Discharge',
  6: 'Physical Discharge',
};

export interface Named {
  Description?: string;
}
export interface PersonName {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Title?: Named;
}

export interface AdmissionRow {
  Id: number;
  PatientId: number;
  EncounterTypeId?: number;
  VisitIdentifier?: string;
  AdmissionDate?: string;
  DischargeDate?: string;
  AdmissionStatusId?: number;
  AdmissionStatus?: Named;
  DischargeTypeId?: number | null;
  DoctorId?: number;
  DoctorName?: string;
  DepartmentId?: number;
  GuarantorId?: number;
  WardId?: number;
  RoomId?: number;
  BedId?: number;
  FacilityId?: number;
  AdmitDiagnosis?: string | null;
  OtherDiagnosis?: string | null;
  Diagnosis?: { Description?: string; Name?: string; Code?: string } | null;
  Department?: { DepartmentName?: string };
  Doctor?: PersonName & { Qualification?: string };
  WardMaster?: { WardName?: string };
  WardRoomBedMaster?: { BedNo?: string; Description?: string };
  Patient?: PersonName & { Id?: number; MRN?: string; Age?: number | string; Mobile?: string; Gender?: Named; DOB?: string };
  [key: string]: unknown;
}

/** patientcertificates row (fields the classic form sends back on save). */
export interface CertificateRow {
  Id?: number;
  PatientId?: number;
  PatientName?: string;
  PatientMrn?: string;
  Mobile?: string;
  EncounterId?: number;
  WardId?: number;
  RoomId?: number;
  BedId?: number;
  GuarantorId?: number;
  AdmissionDate?: string;
  DischargeDate?: string;
  DoctorId?: number;
  DepartmentId?: number;
  DoctorName?: string;
  DataTemplate?: string;
  SurgeryDate?: string;
  TemplateTypeId?: number;
  NoteTypeId?: number;
  NoteTemplateId?: number;
  DischargeTypeId?: number;
  CertificateStatusId?: number;
  ReleasedToPatient?: number;
  AdmissionStatusId?: number;
  FacilityId?: number;
  VisitIdentifier?: string;
  ReleasedOn?: string;
  ReleasedBy?: number;
  ApprovedOn?: string;
  AprovedBy?: number;
  Rev?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedUser?: PersonName;
  UpdatedByUser?: PersonName;
  AprovedUser?: PersonName;
  [key: string]: unknown;
}

/** Plain columns only -- nested includes are never posted back. */
const CERT_COLUMNS: (keyof CertificateRow)[] = [
  'Id', 'PatientId', 'PatientName', 'PatientMrn', 'Mobile', 'EncounterId', 'WardId', 'RoomId', 'BedId',
  'GuarantorId', 'AdmissionDate', 'DischargeDate', 'DoctorId', 'DepartmentId', 'DoctorName', 'DataTemplate',
  'SurgeryDate', 'TemplateTypeId', 'NoteTypeId', 'NoteTemplateId', 'DischargeTypeId', 'CertificateStatusId',
  'ReleasedToPatient', 'AdmissionStatusId', 'FacilityId', 'VisitIdentifier', 'ReleasedOn', 'ReleasedBy',
  'ApprovedOn', 'AprovedBy', 'Rev',
];

export const personName = (p?: PersonName | null, withTitle = true): string =>
  [withTitle ? p?.Title?.Description : '', p?.FirstName, p?.MiddleName, p?.LastName].filter(Boolean).join(' ').trim();

export const doctorName = (a: AdmissionRow): string => personName(a.Doctor) || (a.DoctorName || '').trim();

export const bedText = (a: AdmissionRow): string =>
  [a.WardMaster?.WardName, a.WardRoomBedMaster?.Description || a.WardRoomBedMaster?.BedNo].filter(Boolean).join(' · ');

export const admissionStatusText = (a: AdmissionRow): string =>
  a.AdmissionStatus?.Description || ADMISSION_STATUS[a.AdmissionStatusId || 0] || '';

// ---------------------------------------------------------------- worklist

export interface WorklistQuery {
  admissionStatusIds: number[];
  search: string;
  pageNumber: number;
  pageSize: number;
}

export interface WorklistPage {
  rows: AdmissionRow[];
  total: number;
  certificates: Record<number, CertificateRow>;
}

export async function loadWorklist(q: WorklistQuery): Promise<WorklistPage> {
  const params: { Key: number; Value: unknown }[] = [
    { Key: ENC.EncounterTypeId, Value: IP_ENCOUNTER_TYPE },
    { Key: ENC.AdmissionStatusId, Value: q.admissionStatusIds },
  ];
  const search = q.search.trim();
  if (search) params.push({ Key: ENC.PatientNameMRN, Value: search });
  const res = await apiFetch('Visit/Visit/GetEncounters', {
    Params: params,
    PageContext: { PageSize: q.pageSize, PageNumber: q.pageNumber },
  });
  const rows: AdmissionRow[] = res?.Data || [];
  const certificates = await loadCertificatesFor(rows.map((r) => r.Id));
  return { rows, total: res?.PageContext?.TotalRecords ?? rows.length, certificates };
}

/** Latest summary per encounter (one call for the whole page). */
export async function loadCertificatesFor(encounterIds: number[]): Promise<Record<number, CertificateRow>> {
  const ids = encounterIds.filter((id) => id > 0);
  if (ids.length === 0) return {};
  const res = await apiFetch('DischargeSummary/patientcertificate/GetPatientCertificates', {
    Params: [{ Key: CERT.EncounterId, Value: ids }],
    PageContext: { PageSize: ids.length * 3, PageNumber: 1 },
  });
  const map: Record<number, CertificateRow> = {};
  (res?.Data || []).forEach((c: CertificateRow) => {
    const enc = c.EncounterId || 0;
    if (!map[enc] || (c.Id || 0) > (map[enc].Id || 0)) map[enc] = c;
  });
  return map;
}

// ---------------------------------------------------------------- one admission

export async function loadAdmission(encounterId: number): Promise<AdmissionRow | null> {
  const res = await apiFetch('Visit/Visit/GetEncounters', {
    Params: [{ Key: ENC.Id, Value: encounterId }],
    PageContext: { PageSize: 1, PageNumber: 1 },
  });
  return (res?.Data || [])[0] || null;
}

export async function loadCertificate(encounterId: number): Promise<CertificateRow | null> {
  const map = await loadCertificatesFor([encounterId]);
  return map[encounterId] || null;
}

interface PrescriptionLine {
  DrugName?: string;
  DrugGenericName?: string;
  Dosage?: string;
  Morning?: string | number;
  Noon?: string | number;
  Night?: string | number;
  Duration?: string | number;
  DurationPeriod?: Named;
  DrugFrequency?: Named;
  DrugRoute?: Named;
  DrugInstruction?: Named;
  AdminInstructions?: string;
  Notes?: string;
  Status?: number;
}

const frequencyOf = (d: PrescriptionLine): string => {
  if (d.DrugFrequency?.Description) return d.DrugFrequency.Description;
  const mnn = [d.Morning, d.Noon, d.Night].map((v) => (v === undefined || v === null || v === '' ? '0' : String(v)));
  return mnn.some((v) => v !== '0') ? mnn.join('-') : '';
};

export const prescriptionToMedicine = (d: PrescriptionLine): DischargeMedicine => ({
  name: [d.DrugName, d.DrugGenericName && d.DrugGenericName !== d.DrugName ? `(${d.DrugGenericName})` : '']
    .filter(Boolean)
    .join(' ')
    .trim(),
  dose: d.Dosage ? String(d.Dosage) : '',
  frequency: frequencyOf(d),
  route: d.DrugRoute?.Description || '',
  duration: d.Duration ? `${d.Duration} ${d.DurationPeriod?.Description || ''}`.trim() : '',
  instructions: [d.DrugInstruction?.Description, d.AdminInstructions, d.Notes].filter(Boolean).join('; '),
});

/** Active discharge-medication lines prescribed in this admission. */
export async function loadDischargeMedicines(patientId: number, encounterId: number): Promise<DischargeMedicine[]> {
  const res = await apiFetch('emr/prescription/GetPrescriptions', {
    Params: [
      { Key: RX.PatientId, Value: patientId },
      { Key: RX.EncounterId, Value: encounterId },
      { Key: RX.IsDischargeMedication, Value: true },
    ],
    PageContext: { PageSize: 100, PageNumber: 1 },
  });
  const lines: PrescriptionLine[] = [];
  (res?.Data || []).forEach((p: { PrescriptionDetails?: PrescriptionLine[]; PrescriptionDetail?: PrescriptionLine[] }) => {
    (p.PrescriptionDetails || p.PrescriptionDetail || []).forEach((d) => {
      if (d.Status === undefined || d.Status === 1) lines.push(d);
    });
  });
  return lines.map(prescriptionToMedicine).filter((m) => m.name);
}

// ---------------------------------------------------------------- save

/** New patientcertificates row for an admission, filled the way the classic form fills it. */
export const newCertificateFor = (a: AdmissionRow, facilityId: number): CertificateRow => ({
  PatientId: a.PatientId,
  PatientName: personName(a.Patient),
  PatientMrn: a.Patient?.MRN,
  Mobile: a.Patient?.Mobile,
  EncounterId: a.Id,
  WardId: a.WardId,
  RoomId: a.RoomId,
  BedId: a.BedId,
  GuarantorId: a.GuarantorId,
  AdmissionDate: a.AdmissionDate,
  DischargeDate: a.DischargeDate,
  DoctorId: a.DoctorId,
  DepartmentId: a.DepartmentId,
  DoctorName: doctorName(a),
  NoteTypeId: 1,
  NoteTemplateId: -1,
  DischargeTypeId: a.DischargeTypeId || 1,
  AdmissionStatusId: a.AdmissionStatusId,
  FacilityId: a.FacilityId || facilityId,
  VisitIdentifier: a.VisitIdentifier,
});

/** Adds or updates the summary; returns its Id. */
export async function saveCertificate(row: CertificateRow): Promise<number> {
  const data: CertificateRow = {};
  CERT_COLUMNS.forEach((k) => {
    if (row[k] !== undefined) (data as Record<string, unknown>)[k] = row[k];
  });
  if (data.Id && data.Id > 0) {
    await apiFetch('dischargesummary/PatientCertificate/UpdatePatientCertificate', { Data: data });
    return data.Id;
  }
  delete data.Id;
  const id = await apiFetch('dischargesummary/PatientCertificate/AddPatientCertificate', { Data: data });
  return typeof id === 'number' ? id : parseInt(String(id), 10) || 0;
}

/** Text for the admission-diagnosis section of a new summary. */
export const admissionDiagnosisText = (a: AdmissionRow): string =>
  [a.Diagnosis?.Description || a.Diagnosis?.Name, a.AdmitDiagnosis, a.OtherDiagnosis]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .filter((v, i, all) => all.indexOf(v) === i)
    .join('\n');
