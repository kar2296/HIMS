import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';

export interface PatientEncounter {
  id: string;
  visitNo: string;
  visitDate: string;
  encounterType: 'OPD' | 'IPD' | 'EMERGENCY' | 'DAY_SURGERY';
  department: string;
  doctorName: string;
  primaryDiagnosis: string;
  chiefComplaint: string;
  vitalSnapshot: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
    bmi: number;
  };
  prescriptionsCount: number;
  labOrdersCount: number;
}

export interface EmrVisitSummaryScreenProps {
  patientId?: string;
  patientName?: string;
  ageGender?: string;
  onSelectEncounter?: (encounterId: string) => void;
}

export const EmrVisitSummaryScreen: React.FC<EmrVisitSummaryScreenProps> = ({
  patientId = 'P-100234',
  patientName = 'MOHAMMED SALMAN AL-FALASI',
  ageGender = '45Y / Male',
  onSelectEncounter,
}) => {
  const [encounters] = useState<PatientEncounter[]>([
    {
      id: 'ENC-001',
      visitNo: 'IPD-2026-00892',
      visitDate: '2026-09-18',
      encounterType: 'IPD',
      department: 'Cardiology (Inpatient)',
      doctorName: 'Dr. Sarah Jenkins',
      primaryDiagnosis: 'I21.0 - Acute transmural myocardial infarction of anterior wall',
      chiefComplaint: 'Severe retrosternal chest pain radiating to left jaw & arm with diaphoresis',
      vitalSnapshot: { bp: '118/74', pulse: 68, temp: 36.8, spo2: 99, bmi: 27.4 },
      prescriptionsCount: 5,
      labOrdersCount: 6,
    },
    {
      id: 'ENC-002',
      visitNo: 'OPD-2026-04910',
      visitDate: '2026-08-10',
      encounterType: 'OPD',
      department: 'Internal Medicine OPD',
      doctorName: 'Dr. Marcus Vance',
      primaryDiagnosis: 'I10 - Essential (primary) hypertension',
      chiefComplaint: 'Routine blood pressure review & medication renewal',
      vitalSnapshot: { bp: '138/86', pulse: 74, temp: 36.6, spo2: 98, bmi: 27.6 },
      prescriptionsCount: 2,
      labOrdersCount: 3,
    },
    {
      id: 'ENC-003',
      visitNo: 'EMR-2026-01209',
      visitDate: '2026-05-14',
      encounterType: 'EMERGENCY',
      department: 'Emergency Medicine',
      doctorName: 'Dr. Khalid Al-Mansoor',
      primaryDiagnosis: 'K21.9 - Gastro-esophageal reflux disease without esophagitis',
      chiefComplaint: 'Epigastric burning and acid regurgitation post-meal',
      vitalSnapshot: { bp: '142/88', pulse: 82, temp: 37.1, spo2: 98, bmi: 27.8 },
      prescriptionsCount: 2,
      labOrdersCount: 2,
    },
    {
      id: 'ENC-004',
      visitNo: 'OPD-2026-01004',
      visitDate: '2026-02-02',
      encounterType: 'OPD',
      department: 'General Practice OPD',
      doctorName: 'Dr. Elena Rostova',
      primaryDiagnosis: 'E11.9 - Type 2 diabetes mellitus without complications',
      chiefComplaint: 'Annual health checkup and HbA1c screening',
      vitalSnapshot: { bp: '132/82', pulse: 70, temp: 36.5, spo2: 99, bmi: 28.1 },
      prescriptionsCount: 1,
      labOrdersCount: 4,
    },
  ]);

  const [selectedEncounterId, setSelectedEncounterId] = useState<string>(encounters[0].id);
  const selectedEncounter = encounters.find((e) => e.id === selectedEncounterId) || encounters[0];

  const handleSelect = (id: string) => {
    setSelectedEncounterId(id);
    onSelectEncounter?.(id);
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
            <span style={{ fontSize: 20, color: colors.primary }}>📈</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              EMR Visit Summary & Longitudinal Patient Timeline
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            MRN: {patientId} • Patient: <strong style={{ color: colors.textMain }}>{patientName}</strong> ({ageGender}) •
            Total Encounters: {encounters.length}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button variant="secondary" size="md" icon="fa-print">
            Export History
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Encounters Timeline (Left 35%) & Encounter Detail (Right 65%) */}
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        {/* Left Column: Encounter Timeline */}
        <div style={{ flex: '1 1 320px', maxWidth: 400 }}>
          <Card title="Past Encounters Timeline" padding={spacing.md}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {encounters.map((enc) => {
                const isSelected = selectedEncounterId === enc.id;
                return (
                  <div
                    key={enc.id}
                    onClick={() => handleSelect(enc.id)}
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
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>
                          {enc.visitNo}
                        </span>
                        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                          {enc.visitDate} • {enc.department}
                        </div>
                      </div>
                      <Badge
                        tone={
                          enc.encounterType === 'IPD'
                            ? 'primary'
                            : enc.encounterType === 'EMERGENCY'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {enc.encounterType}
                      </Badge>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMain, marginTop: 6 }}>
                      {enc.primaryDiagnosis}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: colors.textMuted,
                        marginTop: 8,
                        borderTop: `1px solid ${isSelected ? colors.primaryMid : '#f1f5f9'}`,
                        paddingTop: 6,
                      }}
                    >
                      <span>
                        <i className="fa fa-user-md" style={{ marginRight: 4 }} />
                        {enc.doctorName}
                      </span>
                      <span>
                        <i className="fa fa-medkit" style={{ marginRight: 4 }} />
                        {enc.prescriptionsCount} Rx • {enc.labOrdersCount} Labs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Encounter Detailed Snapshot */}
        <div style={{ flex: '2 1 550px' }}>
          <Card
            title={`Encounter Detail: ${selectedEncounter.visitNo} (${selectedEncounter.visitDate})`}
            padding={spacing.md}
          >
            {/* Header info */}
            <div
              style={{
                backgroundColor: colors.surfaceSunken,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '14px 18px',
                marginBottom: spacing.md,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Attending Physician
                </span>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginTop: 2 }}>
                  {selectedEncounter.doctorName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Clinical Department
                </span>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginTop: 2 }}>
                  {selectedEncounter.department}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>
                  Encounter Classification
                </span>
                <div style={{ marginTop: 2 }}>
                  <Badge tone={selectedEncounter.encounterType === 'IPD' ? 'primary' : 'info'}>
                    {selectedEncounter.encounterType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Chief Complaint & Diagnosis */}
            <div style={{ marginBottom: spacing.md }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                Chief Complaint
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: colors.textBody, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}>
                {selectedEncounter.chiefComplaint}
              </p>
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                Primary Diagnosis (ICD-10)
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: colors.textBody, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}>
                {selectedEncounter.primaryDiagnosis}
              </p>
            </div>

            {/* Vital Signs Trajectory Snapshot */}
            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                Vital Signs Snapshot at Encounter
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: 12,
                }}
              >
                {[
                  { label: 'Blood Pressure', value: selectedEncounter.vitalSnapshot.bp, unit: 'mmHg', icon: 'fa-heartbeat' },
                  { label: 'Pulse Rate', value: `${selectedEncounter.vitalSnapshot.pulse}`, unit: 'bpm', icon: 'fa-heart' },
                  { label: 'Temperature', value: `${selectedEncounter.vitalSnapshot.temp}`, unit: '°C', icon: 'fa-thermometer-half' },
                  { label: 'Oxygen (SpO2)', value: `${selectedEncounter.vitalSnapshot.spo2}`, unit: '%', icon: 'fa-tint' },
                  { label: 'Body Mass Index', value: `${selectedEncounter.vitalSnapshot.bmi}`, unit: 'kg/m²', icon: 'fa-calculator' },
                ].map((v, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: radii.md,
                      padding: '12px 10px',
                      textAlign: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <i className={`fa ${v.icon}`} style={{ color: colors.primary, fontSize: 16, marginBottom: 4 }} />
                    <div style={{ fontSize: 11, color: colors.textMuted }}>{v.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, marginTop: 4 }}>
                      {v.value} <span style={{ fontSize: 11, fontWeight: 400, color: colors.textMuted }}>{v.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
