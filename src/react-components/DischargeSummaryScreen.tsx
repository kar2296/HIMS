import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ClinicalAuditTrailScreen } from './ClinicalAuditTrailScreen';

export interface DischargeMedication {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
  reconciliationStatus: 'CONTINUED' | 'MODIFIED' | 'NEW' | 'DISCONTINUED';
}

export interface DischargeSummaryData {
  admissionNo: string;
  patientId: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  dischargeDate: string;
  attendingDoctor: string;
  department: string;
  admissionReason: string;
  admissionDiagnosis: string;
  dischargeDiagnosis: string;
  hospitalCourse: string;
  surgicalProcedures: string;
  investigationSummary: string;
  conditionAtDischarge: string;
  dischargeAdvice: string;
  followUpDate: string;
  followUpDoctor: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'SIGNED' | 'AMENDED';
  medications: DischargeMedication[];
}

export interface DischargeSummaryScreenProps {
  initialData?: Partial<DischargeSummaryData>;
  onSave?: (data: DischargeSummaryData) => void;
  onSign?: (data: DischargeSummaryData) => void;
  onPrint?: () => void;
  isReadOnly?: boolean;
}

export const DischargeSummaryScreen: React.FC<DischargeSummaryScreenProps> = ({
  initialData,
  onSave,
  onSign,
  onPrint,
  isReadOnly = false,
}) => {
  const [summary, setSummary] = useState<DischargeSummaryData>({
    admissionNo: initialData?.admissionNo || 'IPD-2026-00892',
    patientId: initialData?.patientId || 'P-100234',
    patientName: initialData?.patientName || 'MOHAMMED SALMAN AL-FALASI',
    ageGender: initialData?.ageGender || '45Y / Male',
    admissionDate: initialData?.admissionDate || '2026-09-18 09:30',
    dischargeDate: initialData?.dischargeDate || '2026-09-22 11:00',
    attendingDoctor: initialData?.attendingDoctor || 'Dr. Sarah Jenkins, MD (Cardiology)',
    department: initialData?.department || 'Cardiology / Inpatient Ward 3B',
    admissionReason:
      initialData?.admissionReason || 'Acute retrosternal chest pain radiating to left arm with diaphoresis.',
    admissionDiagnosis:
      initialData?.admissionDiagnosis || 'I21.0 - Acute transmural myocardial infarction of anterior wall',
    dischargeDiagnosis:
      initialData?.dischargeDiagnosis ||
      'I21.0 - ST-elevation myocardial infarction (Post-PCI to LAD with DES)',
    hospitalCourse:
      initialData?.hospitalCourse ||
      'Patient admitted through ED with STEMI. Underwent emergent coronary angiography and primary PCI with drug-eluting stent (DES) to proximal LAD. Post-procedure CCU recovery uneventful. Peak Troponin-I: 14.8 ng/mL, normalized. LVEF on discharge echo: 52%. Hemodynamically stable.',
    surgicalProcedures:
      initialData?.surgicalProcedures ||
      'Primary Percutaneous Coronary Intervention (PCI) to LAD with 1x DES (3.0 x 18mm) on 2026-09-18.',
    investigationSummary:
      initialData?.investigationSummary ||
      'ECG: Normal sinus rhythm with resolved ST elevations. Echo: EF 52%. Labs: Hb 14.2 g/dL, Creatinine 0.9 mg/dL, LDL 82 mg/dL.',
    conditionAtDischarge:
      initialData?.conditionAtDischarge ||
      'Stable, afebrile, vitals normal (BP 118/74, HR 68 bpm, SpO2 99% on RA).',
    dischargeAdvice:
      initialData?.dischargeAdvice ||
      'Strict adherence to Dual Antiplatelet Therapy (DAPT). Low sodium cardiac-prudent diet. Avoid strenuous exertion for 2 weeks.',
    followUpDate: initialData?.followUpDate || '2026-09-29 10:00 AM',
    followUpDoctor: initialData?.followUpDoctor || 'Dr. Sarah Jenkins (Cardiology OPD)',
    status: initialData?.status || 'DRAFT',
    medications: initialData?.medications || [
      {
        id: '1',
        drugName: 'Aspirin 81mg EC Tablet',
        dose: '81 mg',
        route: 'Oral',
        frequency: 'Once daily (OD)',
        duration: 'Indefinite',
        instructions: 'Take in the morning with food',
        reconciliationStatus: 'CONTINUED',
      },
      {
        id: '2',
        drugName: 'Ticagrelor (Brilinta) 90mg Tablet',
        dose: '90 mg',
        route: 'Oral',
        frequency: 'Twice daily (BD)',
        duration: '12 Months',
        instructions: 'Take 1 tablet every 12 hours. Do not stop without cardiologist approval.',
        reconciliationStatus: 'NEW',
      },
      {
        id: '3',
        drugName: 'Atorvastatin 80mg Tablet',
        dose: '80 mg',
        route: 'Oral',
        frequency: 'Once daily at night (HS)',
        duration: 'Long-term',
        instructions: 'Take with or without food at bedtime.',
        reconciliationStatus: 'NEW',
      },
      {
        id: '4',
        drugName: 'Ramipril 5mg Capsule',
        dose: '5 mg',
        route: 'Oral',
        frequency: 'Once daily (OD)',
        duration: 'Ongoing',
        instructions: 'Take in the morning. Monitor BP.',
        reconciliationStatus: 'NEW',
      },
    ],
  });

  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'MEDS' | 'SIGNATURE' | 'AUDIT'>('CLINICAL');
  const [signaturePin, setSignaturePin] = useState('');
  const [signedBy, setSignedBy] = useState<string | null>(
    summary.status === 'SIGNED' ? 'Dr. Sarah Jenkins, MD (DHA-109283)' : null
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleFieldChange = (field: keyof DischargeSummaryData, value: string) => {
    setSummary((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignSummary = () => {
    if (!signaturePin) {
      alert('Please enter your 4-digit Clinical PIN to digitally sign.');
      return;
    }
    const updated: DischargeSummaryData = {
      ...summary,
      status: 'SIGNED',
    };
    setSummary(updated);
    setSignedBy('Dr. Sarah Jenkins, MD (DHA-109283)');
    if (onSign) onSign(updated);
    showToast('Discharge Summary digitally signed and sealed with HIPAA audit record.');
  };

  const handleSave = () => {
    if (onSave) onSave(summary);
    showToast('Discharge Summary draft saved successfully.');
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
      {/* Toast */}
      {toastMsg && (
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
          {toastMsg}
        </div>
      )}

      {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, color: colors.primary }}>📋</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Hospital Inpatient Discharge Summary
            </h2>
            <Badge
              tone={
                summary.status === 'SIGNED'
                  ? 'success'
                  : summary.status === 'PENDING_APPROVAL'
                  ? 'warning'
                  : 'info'
              }
            >
              {summary.status}
            </Badge>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            IPD #{summary.admissionNo} • MRN: {summary.patientId} • Patient:{' '}
            <strong style={{ color: colors.textMain }}>{summary.patientName}</strong> ({summary.ageGender}) •
            Attending: {summary.attendingDoctor}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button
            variant="secondary"
            size="md"
            icon="fa-print"
            onClick={() => onPrint?.()}
            disabled={summary.status === 'DRAFT'}
          >
            Print / PDF
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="fa-save"
            onClick={handleSave}
            disabled={summary.status === 'SIGNED' || isReadOnly}
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: spacing.md,
          backgroundColor: '#ffffff',
          padding: '4px 8px 0',
          borderRadius: `${radii.md} ${radii.md} 0 0`,
        }}
      >
        {[
          { id: 'CLINICAL', label: 'Clinical Course & Synopsis', icon: 'fa-hospital-o' },
          { id: 'MEDS', label: `Medication Reconciliation (${summary.medications.length})`, icon: 'fa-medkit' },
          { id: 'SIGNATURE', label: 'Digital Signature & Approval', icon: 'fa-pencil-square-o' },
          { id: 'AUDIT', label: 'HIPAA Audit Trail', icon: 'fa-shield' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: `3px solid ${isActive ? colors.primary : 'transparent'}`,
                background: 'transparent',
                color: isActive ? colors.primary : colors.textMuted,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={`fa ${tab.icon}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Clinical Course */}
      {activeTab === 'CLINICAL' && (
        <Card padding={spacing.lg}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <Input
                label="Admission Reason"
                value={summary.admissionReason}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('admissionReason', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Admission Diagnosis (ICD-10)"
                value={summary.admissionDiagnosis}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('admissionDiagnosis', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Final Discharge Diagnosis"
                value={summary.dischargeDiagnosis}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('dischargeDiagnosis', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Textarea
              label="Hospital Course & Inpatient Progression"
              rows={4}
              value={summary.hospitalCourse}
              disabled={isReadOnly || summary.status === 'SIGNED'}
              onChange={(e) => handleFieldChange('hospitalCourse', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <Textarea
                label="Surgical & Interventional Procedures"
                rows={3}
                value={summary.surgicalProcedures}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('surgicalProcedures', e.target.value)}
              />
            </div>
            <div>
              <Textarea
                label="Key Diagnostic Findings & Labs"
                rows={3}
                value={summary.investigationSummary}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('investigationSummary', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <div>
              <Textarea
                label="Condition at Discharge & Vitals"
                rows={3}
                value={summary.conditionAtDischarge}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('conditionAtDischarge', e.target.value)}
              />
            </div>
            <div>
              <Textarea
                label="Discharge Advice, Diet & Rehabilitation"
                rows={3}
                value={summary.dischargeAdvice}
                disabled={isReadOnly || summary.status === 'SIGNED'}
                onChange={(e) => handleFieldChange('dischargeAdvice', e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Medication Reconciliation */}
      {activeTab === 'MEDS' && (
        <Card title="Discharge Medication Reconciliation Plan" padding={spacing.md}>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
                fontFamily: typography.fontFamily,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>#</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Drug Name & Strength</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Dose</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Route</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Frequency</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Duration</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Reconciliation Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: colors.textMain }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {summary.medications.map((med, idx) => (
                  <tr
                    key={med.id}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: colors.textMuted }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textMain }}>{med.drugName}</td>
                    <td style={{ padding: '10px 12px' }}>{med.dose}</td>
                    <td style={{ padding: '10px 12px' }}>{med.route}</td>
                    <td style={{ padding: '10px 12px' }}>{med.frequency}</td>
                    <td style={{ padding: '10px 12px' }}>{med.duration}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          backgroundColor:
                            med.reconciliationStatus === 'NEW'
                              ? colors.infoBg
                              : med.reconciliationStatus === 'CONTINUED'
                              ? colors.successBg
                              : colors.warningBg,
                          color:
                            med.reconciliationStatus === 'NEW'
                              ? colors.infoText
                              : med.reconciliationStatus === 'CONTINUED'
                              ? colors.successText
                              : colors.warningText,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: radii.sm,
                          border: `1px solid ${
                            med.reconciliationStatus === 'NEW' ? colors.infoBorder : colors.successBorder
                          }`,
                        }}
                      >
                        {med.reconciliationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: colors.textMuted, fontSize: 12 }}>{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Digital Signature */}
      {activeTab === 'SIGNATURE' && (
        <Card title="Physician Digital Authentication & Lock" padding={spacing.lg}>
          {summary.status === 'SIGNED' ? (
            <div
              style={{
                backgroundColor: colors.successBg,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: radii.md,
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <i className="fa fa-check-circle" style={{ fontSize: 48, color: colors.success, marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px', color: colors.successText, fontSize: 18, fontWeight: 700 }}>
                Discharge Summary Digitally Authenticated & Locked
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: colors.textBody }}>
                Signed by: <strong>{signedBy}</strong> on {summary.dischargeDate}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: colors.textMuted }}>
                Cryptographic SHA-256 Hash: <code style={{ fontSize: 11 }}>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
              <i className="fa fa-key" style={{ fontSize: 36, color: colors.primary, marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                Authorize Inpatient Discharge
              </h3>
              <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
                Enter your 4-digit Clinical PIN to digitally sign and commit this record to the medical archive.
              </p>
              <div style={{ marginBottom: 16 }}>
                <Input
                  type="password"
                  label="Physician PIN"
                  placeholder="••••"
                  value={signaturePin}
                  onChange={(e) => setSignaturePin(e.target.value)}
                />
              </div>
              <Button variant="primary" size="md" icon="fa-lock" onClick={handleSignSummary}>
                Sign & Lock Record
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'AUDIT' && (
        <Card title="HIPAA Clinical Access & Amendment Audit" padding={spacing.md}>
          <ClinicalAuditTrailScreen />
        </Card>
      )}
    </div>
  );
};
