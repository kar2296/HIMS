import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { Button } from '../Button';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, spacing, typography, radii, shadows } from '../../components/ui/tokens';
import type { ConsultationInfo, EmrWorkspaceContext, EncounterInfo } from './types';
import { formatDate, formatDateTime } from './emrHelpers';
import {
  type EmrPrintMasterSettings,
  getPrintMasterSettings,
  DEFAULT_PRINT_MASTER_SETTINGS,
} from './emrPrintConfig';

interface ConsultationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: EmrWorkspaceContext;
  encounter: EncounterInfo | null;
  consultation: ConsultationInfo | null;
  profileSectionIds: number[];
  downloadFile?: (action: string, data: any) => void;
}

interface SummaryPrintData {
  notes: any[];
  complaints: any[];
  diagnoses: any[];
  conditions: any[];
  vitals: any[];
  prescriptions: any[];
  orders: any[];
  allergies: any[];
  surgicals: any[];
  familyConditions: any[];
  socialHistories: any[];
}

export const ConsultationPrintModal: React.FC<ConsultationPrintModalProps> = ({
  isOpen,
  onClose,
  context,
  encounter,
  consultation,
  profileSectionIds,
  downloadFile,
}) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<EmrPrintMasterSettings>(() => getPrintMasterSettings());
  const [data, setData] = useState<SummaryPrintData>({
    notes: [],
    complaints: [],
    diagnoses: [],
    conditions: [],
    vitals: [],
    prescriptions: [],
    orders: [],
    allergies: [],
    surgicals: [],
    familyConditions: [],
    socialHistories: [],
  });

  // Re-read settings whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getPrintMasterSettings());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !context.patientId) return;

    let active = true;
    setLoading(true);

    const pid = context.patientId;
    const eid = context.encounterId;
    const cid = consultation?.Id || context.consultationId;

    const list = (p: Promise<any>) => p.then((r) => r?.Data || []).catch(() => []);

    Promise.all([
      list(apiFetch('emr/PatientClinicalNotes/GetPatientClinicalNotess', { Params: [{ Key: 1, Value: pid }, { Key: 2, Value: eid }, ...(cid ? [{ Key: 3, Value: cid }] : [])] })),
      list(apiFetch('emr/PatientChiefComplaint/GetPatientChiefComplaints', { Params: [{ Key: 2, Value: pid }, { Key: 3, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientcondition/GetPatientConditions', { Params: [{ Key: 2, Value: pid }, { Key: 5, Value: eid }, { Key: 7, Value: 0 }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientcondition/GetPatientConditions', { Params: [{ Key: 2, Value: pid }, { Key: 7, Value: 1 }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientvital/GetPatientVitals', { Params: [{ Key: 2, Value: pid }, { Key: 9, Value: eid }] })),
      list(apiFetch('emr/prescription/GetPrescriptions', { Params: [{ Key: 2, Value: pid }, { Key: 12, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientorder/GetPatientOrders', { Params: [{ Key: 2, Value: pid }, { Key: 18, Value: eid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientallergy/GetPatientAllergys', { Params: [{ Key: 2, Value: pid }, { Key: 4, Value: 1 }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientsurgical/GetPatientSurgicals', { Params: [{ Key: 2, Value: pid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/familycondition/GetFamilyConditions', { Params: [{ Key: 2, Value: pid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
      list(apiFetch('emr/patientsocialhistory/GetPatientSocialHistorys', { Params: [{ Key: 2, Value: pid }], PageContext: { PageSize: 50, PageNumber: 1 } })),
    ])
      .then(([notes, complaints, activeConditions, pastConditions, vitals, prescriptions, orders, allergies, surgicals, familyConditions, socialHistories]) => {
        if (!active) return;
        const latestGroup = vitals.reduce((m: number | undefined, v: any) => (v.GroupId !== undefined && (m === undefined || v.GroupId > m) ? v.GroupId : m), undefined);
        setData({
          notes,
          complaints,
          diagnoses: (activeConditions || []).filter((x: any) => x.Status === undefined || x.Status === 1),
          conditions: (pastConditions || []).filter((x: any) => x.Status === undefined || x.Status === 1),
          vitals: latestGroup === undefined ? vitals : (vitals || []).filter((v: any) => v.GroupId === latestGroup),
          prescriptions,
          orders,
          allergies,
          surgicals,
          familyConditions,
          socialHistories,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, context.patientId, context.encounterId, consultation?.Id]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (downloadFile && consultation?.Id) {
      downloadFile('emr/consultation/PrintConsultation', {
        Id: consultation.Id,
        Data: {
          PatientId: context.patientId,
          EncounterId: context.encounterId,
          ConsultationId: consultation.Id,
          sectionList: profileSectionIds,
        },
      });
    }
  };

  const patientName = [encounter?.Patient?.FirstName, encounter?.Patient?.LastName].filter(Boolean).join(' ') || 'Patient';
  const mrn = encounter?.Patient?.PatientCode || encounter?.Patient?.RegistrationNo || `MRN-${context.patientId}`;
  const doctorName = encounter?.DoctorName || encounter?.EncounterDoctors?.[0]?.DoctorName || consultation?.Doctor?.FirstName || 'Consulting Physician';
  const visitNo = encounter?.VisitNo || encounter?.EncounterNo || '—';
  const facilityName = settings.customHospitalTitle || encounter?.Facility?.FacilityName || 'SHUVADARSINI HOSPITAL';

  // Sorted enabled sections from Master config
  const enabledSections = (settings.sections || DEFAULT_PRINT_MASTER_SETTINGS.sections)
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Extract clinical notes subfields if available
  const primaryNote = data.notes[0] || {};
  const clinicalAdvice = primaryNote.ClinicalNotes || primaryNote.Notes || primaryNote.Advice || '';
  const hpiText = primaryNote.Hpi || primaryNote.HistoryOfPresentIllness || primaryNote.ChiefComplaintNotes || '';
  const examText = primaryNote.PhysicalExamination || primaryNote.ExaminationNotes || primaryNote.ReviewOfSystems || '';
  const followupDate = primaryNote.FollowUpDate || primaryNote.ReviewDate || '';

  const fontSizeBase =
    settings.fontSizeScale === 'compact' ? '11px' : settings.fontSizeScale === 'large' ? '14px' : '12.5px';
  const headingSize =
    settings.fontSizeScale === 'compact' ? '11.5px' : settings.fontSizeScale === 'large' ? '14.5px' : '13px';

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: ${settings.paperSize.toLowerCase()} ${settings.orientation};
            margin: ${settings.topMarginMm}mm ${settings.rightMarginMm}mm ${settings.bottomMarginMm}mm ${settings.leftMarginMm}mm;
          }
          body * {
            visibility: hidden !important;
          }
          #emr-print-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #fff !important;
            z-index: 99999 !important;
            padding: 0 !important;
          }
          #emr-print-sheet, #emr-print-sheet * {
            visibility: visible !important;
          }
          #emr-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: ${settings.contentPaddingMm}mm !important;
            box-shadow: none !important;
            border: 0 !important;
          }
          .emr-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="emr-print-modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          padding: spacing.md,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: 'min(940px, 98vw)',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <div
            className="emr-no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${spacing.md} ${spacing.lg}`,
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <i className="fa-solid fa-print" style={{ color: colors.primary, fontSize: 18 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ ...typography.h4, color: colors.textMain, margin: 0 }}>Consultation Sheet Print</strong>
                  <span
                    style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {settings.paperSize} &bull; {settings.orientation} &bull;{' '}
                    {settings.headerStyle === 'with_header' ? 'With Header' : 'Without Header (Pre-Printed)'}
                  </span>
                </div>
                <div style={{ ...typography.caption, color: colors.textMuted }}>
                  Formatting configured via EMR Print Configuration Master &bull; {enabledSections.length} sections enabled
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  window.open('#/emr/print-config', '_blank');
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#2563eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginRight: 4,
                }}
                title="Open Master Print Configuration Screen"
              >
                <i className="fa-solid fa-gear" /> Print Master Settings
              </button>

              <Button size="sm" variant="primary" icon="fa-solid fa-print" onClick={handlePrint}>
                Print Note
              </Button>
              {downloadFile && (
                <Button size="sm" variant="outline-primary" icon="fa-solid fa-file-pdf" onClick={handleDownload}>
                  Download PDF
                </Button>
              )}
              <Button size="sm" variant="outline-secondary" icon="fa-solid fa-xmark" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Modal Body / Printable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: spacing.xl, background: '#f1f5f9' }}>
            {loading ? (
              <SkeletonRows rows={8} columns={4} />
            ) : (
              <div
                id="emr-print-sheet"
                style={{
                  backgroundColor: '#fff',
                  color: '#0f172a',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  fontSize: fontSizeBase,
                  lineHeight: '1.45',
                  padding: `${settings.contentPaddingMm + 16}px`,
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  maxWidth: settings.paperSize === 'A5' ? '680px' : '860px',
                  margin: '0 auto',
                }}
              >
                {/* 1. Header (Rendered only if with_header) */}
                {settings.headerStyle === 'with_header' && (
                  <div
                    style={{
                      textAlign: 'center',
                      borderBottom: settings.showHeaderDivider ? '2.5px solid #2563eb' : 'none',
                      paddingBottom: spacing.sm,
                      marginBottom: spacing.md,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {settings.showFacilityLogo && (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb',
                            fontSize: 20,
                            fontWeight: 800,
                          }}
                        >
                          <i className="fa-solid fa-hospital-user" />
                        </div>
                      )}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2
                          style={{
                            margin: '0 0 3px 0',
                            fontSize: settings.paperSize === 'A5' ? '17px' : '21px',
                            fontWeight: 800,
                            color: '#1e3a8a',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {facilityName}
                        </h2>
                        <div style={{ fontSize: settings.paperSize === 'A5' ? '10.5px' : '12px', color: '#475569' }}>
                          {settings.customSubTitle || 'Outpatient Consultation & Clinical Assessment Record'}
                        </div>
                      </div>
                      {settings.showBarcode && (
                        <div style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>
                          <i className="fa-solid fa-barcode" style={{ fontSize: 28, color: '#0f172a', display: 'block' }} />
                          <span>*{mrn}*</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notice for Pre-printed Stationery Mode in preview */}
                {settings.headerStyle === 'without_header' && (
                  <div
                    className="emr-no-print"
                    style={{
                      background: '#fef3c7',
                      border: '1px dashed #f59e0b',
                      borderRadius: 4,
                      padding: '6px 12px',
                      fontSize: 11,
                      color: '#92400e',
                      textAlign: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <i className="fa-solid fa-info-circle" style={{ marginRight: 6 }} />
                    <strong>Pre-printed Stationery Mode:</strong> Header suppressed to fit pre-printed hospital stationery ({settings.topMarginMm}mm top margin reserved).
                  </div>
                )}

                {/* 2. Dynamically Render Configured Sections in Order */}
                {enabledSections.map((sec) => {
                  const sectionTitle = sec.customTitle || sec.defaultTitle;

                  switch (sec.id) {
                    case 'demographics':
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div
                            style={{
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: spacing.sm,
                              backgroundColor: '#f8fafc',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: settings.paperSize === 'A5' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                                gap: '8px 16px',
                                fontSize: fontSizeBase,
                              }}
                            >
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Patient Name</span>
                                <strong>{patientName}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>MRN / Code</span>
                                <strong style={{ fontFamily: 'monospace' }}>{mrn}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Visit Number</span>
                                <strong>{visitNo}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Date & Time</span>
                                <strong>{formatDateTime(consultation?.CreatedAt || encounter?.VisitDate)}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Doctor</span>
                                <strong>Dr. {doctorName}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Department</span>
                                <strong>{encounter?.DepartmentName || 'General Medicine'}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Encounter Type</span>
                                <strong>{encounter?.EncounterType?.Description || 'Outpatient (OP)'}</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Allergies</span>
                                <strong style={{ color: data.allergies.length ? '#dc2626' : '#16a34a' }}>
                                  {data.allergies.length ? data.allergies.map((a: any) => a.AllergyName || a.Description).join(', ') : 'No Known Allergies (NKA)'}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                    case 'vitals':
                      if (!data.vitals.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: fontSizeBase, background: '#f8fafc', padding: '8px 12px', borderRadius: '4px' }}>
                            {data.vitals.map((v: any, idx: number) => (
                              <div key={idx} style={{ display: 'inline-flex', gap: '4px' }}>
                                <span style={{ color: '#64748b' }}>{v.VitalSignMaster?.Name || v.VitalName || `Vital #${v.VitalSignMasterId}`}:</span>
                                <strong>{v.VitalSignValue ?? '—'} {v.VitalSignMaster?.Unit || ''}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );

                    case 'allergies':
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, color: data.allergies.length ? '#dc2626' : '#16a34a' }}>
                            {data.allergies.length > 0 ? (
                              <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                                {data.allergies.map((a: any, idx: number) => (
                                  <li key={idx}>
                                    <strong>{a.AllergyName || a.Description}</strong>
                                    {a.Severity && <span> ({a.Severity})</span>}
                                    {a.Notes && <span style={{ color: '#475569' }}> &bull; {a.Notes}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>Verified: No Known Drug / Food Allergies (NKDA).</span>
                            )}
                          </div>
                        </div>
                      );

                    case 'complaints':
                      if (!data.complaints.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: fontSizeBase }}>
                            {data.complaints.map((c: any, idx: number) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>
                                <strong>{c.ChiefComplaintMaster?.Name || c.ComplaintName || c.Name}</strong>
                                {c.Duration && <span> &bull; Duration: {c.Duration} {c.DurationPeriod?.Description || ''}</span>}
                                {c.Notes && <span style={{ color: '#475569' }}> &bull; {c.Notes}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                    case 'hpi':
                      if (!hpiText && !primaryNote.ClinicalNotes) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, color: '#334155', whiteSpace: 'pre-line', paddingLeft: 4 }}>
                            {hpiText || primaryNote.ClinicalNotes}
                          </div>
                        </div>
                      );

                    case 'diagnoses':
                      if (!data.diagnoses.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: fontSizeBase }}>
                            {data.diagnoses.map((d: any, idx: number) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>
                                <strong>{d.IcdCode?.IcdCode ? `[${d.IcdCode.IcdCode}] ` : ''}{d.IcdCode?.Name || d.DiagnosisName || d.ConditionName}</strong>
                                {d.DiagnosisType && <span style={{ color: '#64748b', fontSize: '11px' }}> ({d.DiagnosisType.Description || 'Diagnosis'})</span>}
                                {d.Comments && <span style={{ color: '#475569' }}> &bull; {d.Comments}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                    case 'conditions':
                      if (!data.conditions.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: fontSizeBase }}>
                            {data.conditions.map((c: any, idx: number) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>
                                <strong>{[c.Code, c.DiagnosisName || c.Description].filter(Boolean).join(' – ')}</strong>
                                {c.ConditionStatus?.Description && <span> &bull; Status: {c.ConditionStatus.Description}</span>}
                                {c.ConditionDate && <span> &bull; Since: {formatDate(c.ConditionDate)}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                    case 'prescriptions':
                      if (!data.prescriptions.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSizeBase }}>
                            <thead>
                              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '4%' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '32%' }}>Medicine</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '14%' }}>Dose</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '16%' }}>Frequency</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '14%' }}>Duration</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '20%' }}>Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.prescriptions.flatMap((p: any) =>
                                (p.PrescriptionDetails || p.PrescriptionDetail || []).map((d: any, idx: number) => (
                                  <tr key={`${p.Id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '4px 6px' }}>{idx + 1}</td>
                                    <td style={{ padding: '4px 6px', fontWeight: 600 }}>{d.DrugName || d.ItemName || '—'}</td>
                                    <td style={{ padding: '4px 6px' }}>{d.Dosage || d.Dose || '1'}</td>
                                    <td style={{ padding: '4px 6px' }}>{d.FrequencyMaster?.Description || d.Frequency || 'OD'}</td>
                                    <td style={{ padding: '4px 6px' }}>{d.Duration ? `${d.Duration} days` : '—'}</td>
                                    <td style={{ padding: '4px 6px', color: '#475569' }}>{d.Instruction || d.Remarks || 'After food'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      );

                    case 'orders':
                      if (!data.orders.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSizeBase }}>
                            <thead>
                              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '15%' }}>Code</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px' }}>Service / Test Name</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '25%' }}>Category / Department</th>
                                <th style={{ textAlign: 'left', padding: '4px 6px', width: '20%' }}>Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.orders.flatMap((o: any) =>
                                (o.PatientOrderDetails || o.PatientOrderDetail || []).filter((d: any) => d.OrderStatusId !== 2).map((d: any, idx: number) => (
                                  <tr key={`${o.Id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{d.TestCode || '—'}</td>
                                    <td style={{ padding: '4px 6px', fontWeight: 600 }}>{d.TestName}</td>
                                    <td style={{ padding: '4px 6px', color: '#475569' }}>{d.CategoryName || o.OrderTo?.DepartmentName || 'Laboratory'}</td>
                                    <td style={{ padding: '4px 6px', color: '#64748b' }}>{d.TestInstruction || '—'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      );

                    case 'examination':
                      if (!examText) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, color: '#334155', whiteSpace: 'pre-line', paddingLeft: 4 }}>
                            {examText}
                          </div>
                        </div>
                      );

                    case 'history':
                      if (!data.conditions.length && !data.surgicals.length && !data.familyConditions.length && !data.socialHistories.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, color: '#334155' }}>
                            {data.surgicals.length > 0 && (
                              <div style={{ marginBottom: 4 }}>
                                <strong>Past Surgeries:</strong>{' '}
                                {data.surgicals.map((s: any) => `${s.Procedure?.ProcedureName || s.ProcedureName || 'Surgery'} (${formatDate(s.PerformedDate)})`).join(', ')}
                              </div>
                            )}
                            {data.familyConditions.length > 0 && (
                              <div style={{ marginBottom: 4 }}>
                                <strong>Family History:</strong>{' '}
                                {data.familyConditions.map((f: any) => `${f.Relationship?.Description || 'Relative'}: ${f.DiagnosisName || f.Description}`).join(', ')}
                              </div>
                            )}
                            {data.socialHistories.length > 0 && (
                              <div>
                                <strong>Social / Lifestyle:</strong>{' '}
                                {data.socialHistories.map((sh: any) => `${sh.SocialType?.Description || 'Habit'}: ${sh.SocialFrequency?.Description || 'Occasional'}`).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      );

                    case 'procedures':
                      if (!data.surgicals.length) return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: fontSizeBase }}>
                            {data.surgicals.map((s: any, idx: number) => (
                              <li key={idx}>
                                <strong>{s.Procedure?.ProcedureName || s.ProcedureName}</strong> &bull; Performed: {formatDate(s.PerformedDate)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                    case 'treatment_plan':
                    case 'advice':
                      if (!clinicalAdvice && sec.id === 'advice') return null;
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, color: '#334155', whiteSpace: 'pre-line', paddingLeft: 4 }}>
                            {clinicalAdvice || 'Adequate rest, hydration, and adherence to prescribed medications.'}
                          </div>
                        </div>
                      );

                    case 'followup':
                      return (
                        <div key={sec.id} style={{ marginBottom: spacing.md }}>
                          <div style={{ fontWeight: 700, fontSize: headingSize, color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                            {sectionTitle}
                          </div>
                          <div style={{ fontSize: fontSizeBase, fontWeight: 600, color: '#1e3a8a', paddingLeft: 4 }}>
                            {followupDate
                              ? `Follow-up scheduled on: ${formatDate(followupDate)} with Dr. ${doctorName}`
                              : 'Review as instructed, or immediately (SOS) if symptoms persist or worsen.'}
                          </div>
                        </div>
                      );

                    case 'signature':
                      if (!settings.showDoctorSignature) return null;
                      return (
                        <div
                          key={sec.id}
                          style={{
                            display: 'flex',
                            justifyContent: settings.signatureStyle === 'dual' ? 'space-between' : 'flex-end',
                            marginTop: '36px',
                            paddingTop: '16px',
                            borderTop: '1px dashed #cbd5e1',
                          }}
                        >
                          {settings.signatureStyle === 'dual' && (
                            <div style={{ textAlign: 'center', width: '200px' }}>
                              <div style={{ borderBottom: '1px solid #64748b', marginBottom: '4px', height: '36px' }} />
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Patient / Attendant Signature</div>
                            </div>
                          )}
                          <div style={{ textAlign: 'center', width: '220px' }}>
                            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px', height: '36px' }} />
                            <strong style={{ fontSize: '12px' }}>Dr. {doctorName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Authorized Medical Practitioner</div>
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}

                {/* 3. Footer notes & timestamp */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: '24px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '11px',
                    color: '#64748b',
                  }}
                >
                  <div>{settings.customFooterNote || 'MediFlow HIMS Consultation Sheet & Prescription'}</div>
                  {settings.showPageNumbers && (
                    <div>
                      Printed on {formatDateTime(new Date().toISOString())} &bull; Page 1 of 1
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
