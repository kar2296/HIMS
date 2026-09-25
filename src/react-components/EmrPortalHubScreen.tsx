import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from './Button';

import { DischargeSummaryScreen } from './DischargeSummaryScreen';
import { EmrFormAssemblyScreen } from './EmrFormAssemblyScreen';
import { EmrMastersScreen } from './EmrMastersScreen';
import { EmrVisitSummaryScreen } from './EmrVisitSummaryScreen';
import { ClinicalAuditTrailScreen } from './ClinicalAuditTrailScreen';
import { PatientIdentityBanner } from './PatientIdentityBanner';
import { PatientVitalScreen } from './PatientVitalScreen';
import { PatientDiagnosisScreen } from './PatientDiagnosisScreen';
import { PatientAllergyScreen } from './PatientAllergyScreen';
import { WardEmarScreen } from './WardEmarScreen';
import { WardHandoverScreen } from './WardHandoverScreen';
import { WardFluidBalanceScreen } from './WardFluidBalanceScreen';
import { WardNursingNotesScreen } from './WardNursingNotesScreen';
import { ClinicalCdsAlertsScreen } from './ClinicalCdsAlertsScreen';

export type EmrHubView =
  | 'HUB'
  | 'WORKSTATION'
  | 'DISCHARGE_SUMMARY'
  | 'DISCHARGE_AUDIT'
  | 'FORM_ASSEMBLY'
  | 'EMR_MASTERS'
  | 'VISIT_SUMMARY'
  | 'USER_REPORT'
  | 'VISIT_REPORT_BR';

export interface EmrPortalHubScreenProps {
  hospitalName?: string;
  userName?: string;
  activeView?: EmrHubView;
  onNavigate?: (view: EmrHubView) => void;
}

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  department: string;
  room: string;
  assignedPanelCode: string;
  assignedPanelName: string;
}

const DOCTOR_PROFILES: DoctorProfile[] = [
  { id: 'DOC-101', name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', department: 'General OPD', room: 'Consultation Room 101', assignedPanelCode: 'OPD-GEN-01', assignedPanelName: 'General OPD Assessment Form' },
  { id: 'DOC-102', name: 'Dr. Sarah Jenkins', specialty: 'Ophthalmology', department: 'Eye Clinic', room: 'Eye Examination Room 204', assignedPanelCode: 'EYE-OPT-01', assignedPanelName: 'Ophthalmology & Optometry Refraction Form' },
  { id: 'DOC-103', name: 'Dr. Tariq Al Mansoori', specialty: 'Dental / Maxillofacial', department: 'Dental Clinic', room: 'Dental Operatory 1', assignedPanelCode: 'DENT-01', assignedPanelName: 'Dental Examination & Odontogram Chart' },
  { id: 'DOC-104', name: 'Dr. Fatima Al Zahra', specialty: 'Obstetrics & Gynecology', department: 'OB/GYN Clinic', room: 'Maternity Clinic 302', assignedPanelCode: 'OBGYN-ANC-01', assignedPanelName: 'Antenatal Care (ANC) & Obstetric Form' },
  { id: 'DOC-105', name: 'Dr. Vikram Sharma', specialty: 'Anesthesiology & Critical Care', department: 'Pre-Op PAC Clinic', room: 'PAC Room 108', assignedPanelCode: 'ANES-PREOP-01', assignedPanelName: 'Pre-Anesthetic Evaluation (PAC) & Risk Stratification' },
  { id: 'DOC-106', name: 'Dr. Maya Patel', specialty: 'Physiotherapy & Rehabilitation', department: 'Rehabilitation Center', room: 'Physio Therapy Suite 2', assignedPanelCode: 'PHYSIO-01', assignedPanelName: 'Physiotherapy & Musculoskeletal ROM Matrix' },
  { id: 'DOC-107', name: 'Dr. Emily Watson', specialty: 'Emergency Medicine', department: 'Emergency Department', room: 'Triage Resuscitation Bay 1', assignedPanelCode: 'ER-TRIAGE-01', assignedPanelName: 'Emergency Triage & Rapid Resuscitation' },
];

interface QueuePatient {
  id: string;
  token: string;
  name: string;
  mrn: string;
  age: number;
  gender: 'M' | 'F';
  doctorId: string;
  doctorName: string;
  specialty: string;
  complaint: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';
  arrivalTime: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
}

const INITIAL_QUEUE: QueuePatient[] = [
  { id: 'P-101', token: 'T-01', name: 'Fatima Al Mansoori', mrn: 'MRN-784-001', age: 34, gender: 'F', doctorId: 'DOC-101', doctorName: 'Dr. Rajesh Kumar', specialty: 'General Medicine', complaint: 'Fever with chills for 3 days', status: 'WAITING', arrivalTime: '09:15 AM', priority: 'ROUTINE' },
  { id: 'P-102', token: 'T-02', name: 'Mohammed Al Nuaimi', mrn: 'MRN-784-002', age: 48, gender: 'M', doctorId: 'DOC-101', doctorName: 'Dr. Rajesh Kumar', specialty: 'General Medicine', complaint: 'High blood pressure review', status: 'WAITING', arrivalTime: '09:30 AM', priority: 'ROUTINE' },
  { id: 'P-103', token: 'T-03', name: 'Amina Rashid', mrn: 'MRN-784-003', age: 29, gender: 'F', doctorId: 'DOC-102', doctorName: 'Dr. Sarah Jenkins', specialty: 'Ophthalmology', complaint: 'Blurred vision & eye strain OD', status: 'WAITING', arrivalTime: '09:40 AM', priority: 'ROUTINE' },
  { id: 'P-104', token: 'T-04', name: 'Khalid bin Zayed', mrn: 'MRN-784-004', age: 42, gender: 'M', doctorId: 'DOC-103', doctorName: 'Dr. Tariq Al Mansoori', specialty: 'Dental / Maxillofacial', complaint: 'Severe toothache lower molar #46', status: 'WAITING', arrivalTime: '09:45 AM', priority: 'URGENT' },
  { id: 'P-105', token: 'T-05', name: 'Mariam Al Zaabi', mrn: 'MRN-784-005', age: 31, gender: 'F', doctorId: 'DOC-104', doctorName: 'Dr. Fatima Al Zahra', specialty: 'Obstetrics & Gynecology', complaint: '28-week ANC routine checkup & scan', status: 'WAITING', arrivalTime: '10:00 AM', priority: 'ROUTINE' },
  { id: 'P-106', token: 'T-06', name: 'Sultan Al Dhaheri', mrn: 'MRN-784-006', age: 56, gender: 'M', doctorId: 'DOC-105', doctorName: 'Dr. Vikram Sharma', specialty: 'Anesthesiology & Critical Care', complaint: 'Pre-op PAC evaluation for cholecystectomy', status: 'WAITING', arrivalTime: '10:15 AM', priority: 'ROUTINE' },
  { id: 'P-107', token: 'T-07', name: 'Sara Al Ali', mrn: 'MRN-784-007', age: 26, gender: 'F', doctorId: 'DOC-106', doctorName: 'Dr. Maya Patel', specialty: 'Physiotherapy & Rehabilitation', complaint: 'Post-ACL reconstruction knee stiffness', status: 'WAITING', arrivalTime: '10:30 AM', priority: 'ROUTINE' },
  { id: 'P-108', token: 'T-08', name: 'Ahmed Hassan', mrn: 'MRN-784-008', age: 62, gender: 'M', doctorId: 'DOC-107', doctorName: 'Dr. Emily Watson', specialty: 'Emergency Medicine', complaint: 'Acute retrosternal chest pain radiating to left arm', status: 'IN_CONSULTATION', arrivalTime: '10:35 AM', priority: 'STAT' },
];

export const EmrPortalHubScreen: React.FC<EmrPortalHubScreenProps> = ({
  hospitalName = 'SHUVADARSINI HOSPITAL',
  userName = 'USER',
  activeView = 'HUB',
  onNavigate,
}) => {
  const [currentView, setCurrentView] = useState<EmrHubView>(activeView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC-101');
  const [patientQueue, setPatientQueue] = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient>(INITIAL_QUEUE[0]);
  const [workstationTab, setWorkstationTab] = useState<
    'SPECIALTY_FORM' | 'OVERVIEW' | 'DIAGNOSIS' | 'ALLERGIES' | 'EMAR' | 'HANDOVER' | 'FLUIDS' | 'NOTES' | 'CDS'
  >('SPECIALTY_FORM');

  const activeDoctor = DOCTOR_PROFILES.find((d) => d.id === selectedDoctorId) || DOCTOR_PROFILES[0];
  const doctorQueue = patientQueue.filter((p) => selectedDoctorId === 'ALL' || p.doctorId === selectedDoctorId);

  const handleSelectView = (view: EmrHubView) => {
    setCurrentView(view);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const handleStartConsultation = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setPatientQueue((prev) =>
      prev.map((p) => (p.id === patient.id ? { ...p, status: 'IN_CONSULTATION' } : p))
    );
    setWorkstationTab('SPECIALTY_FORM');
    handleSelectView('WORKSTATION');
  };

  const navItems: Array<{ id: EmrHubView; label: string; icon: string; description: string; badge?: string }> = [
    {
      id: 'WORKSTATION',
      label: 'EMR Clinical Workstation',
      icon: 'fa-stethoscope',
      description: 'Comprehensive Doctor & Nursing Clinical Station',
      badge: 'Core',
    },
    {
      id: 'DISCHARGE_SUMMARY',
      label: 'Discharge Summary',
      icon: 'fa-file-text-o',
      description: 'Inpatient Hospital Course & Med Reconciliation',
      badge: 'Active',
    },
    {
      id: 'FORM_ASSEMBLY',
      label: 'Specialty Form Assembly',
      icon: 'fa-cubes',
      description: 'Configure Specialty Panels & Dynamic Clinical Forms',
    },
    {
      id: 'EMR_MASTERS',
      label: 'EMR Masters Catalog',
      icon: 'fa-database',
      description: 'Allergens, Vaccines, Lines/Drains & Clinical Scales',
    },
    {
      id: 'VISIT_SUMMARY',
      label: 'Visit & Longitudinal Summary',
      icon: 'fa-history',
      description: 'Patient Historical Encounters & Biometric Trends',
    },
    {
      id: 'DISCHARGE_AUDIT',
      label: 'HIPAA & Audit Trail',
      icon: 'fa-shield',
      description: 'Clinical Access Logging & Break-Glass Audit Trail',
    },
    {
      id: 'USER_REPORT',
      label: 'EMR User Productivity',
      icon: 'fa-bar-chart',
      description: 'Provider Encounter Productivity & Completion Metrics',
    },
    {
      id: 'VISIT_REPORT_BR',
      label: 'Branch Clinical Reports',
      icon: 'fa-hospital-o',
      description: 'Multi-Location Visit Statistics & Analytics',
    },
  ];

  const filteredItems = navItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Header Bar with Active Doctor Switcher */}
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
            <span style={{ fontSize: 20, color: colors.primary }}>🏥</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {currentView === 'HUB'
                ? 'EMR Waiting List & Clinical Hub'
                : navItems.find((i) => i.id === currentView)?.label || 'EMR'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: colors.textMuted }}>{hospitalName} • Active Clinician:</span>
            <span
              style={{
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.primaryMid}`,
              }}
            >
              {activeDoctor.name} ({activeDoctor.specialty})
            </span>
            <span style={{ fontSize: 12, color: colors.textMuted }}>• {activeDoctor.room}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Doctor Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>
              <i className="fa fa-user-md" style={{ marginRight: 4, color: colors.primary }} />
              Clinician:
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: radii.md,
                border: `1px solid ${colors.primary}`,
                backgroundColor: '#ffffff',
                color: colors.textMain,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Doctors & Specialties</option>
              {DOCTOR_PROFILES.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialty} ({doc.department})
                </option>
              ))}
            </select>
          </div>

          {currentView !== 'HUB' && (
            <Button
              variant="secondary"
              size="md"
              icon="fa-arrow-left"
              onClick={() => handleSelectView('HUB')}
            >
              Back to EMR Waiting List
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {currentView === 'HUB' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {/* Active Doctor Clinical Waiting List Queue */}
          <Card
            title={`Active Clinical Waiting List — ${activeDoctor.name} (${activeDoctor.specialty})`}
            padding={spacing.md}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: colors.textMuted }}>
                  Showing <strong>{doctorQueue.length}</strong> queued patients for <strong>{activeDoctor.department}</strong>
                </span>
                <span
                  style={{
                    backgroundColor: colors.surfaceSunken,
                    border: `1px solid ${colors.borderStrong}`,
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.primary,
                    padding: '2px 8px',
                    borderRadius: radii.sm,
                  }}
                >
                  Assigned Form: {activeDoctor.assignedPanelName} ({activeDoctor.assignedPanelCode})
                </span>
              </div>

              <div style={{ maxWidth: 300, width: '100%' }}>
                <Input
                  label=""
                  placeholder="Search patient name, MRN, token..."
                  leftIcon="fa fa-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {doctorQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: colors.textMuted }}>
                No patients currently waiting for this clinician.
              </div>
            ) : (
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: 70 }}>Token</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Patient Name & MRN</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Age / Gender</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Chief Complaint</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Arrival</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Priority</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 150 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorQueue.map((p, idx) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: colors.primary }}>
                          {p.token}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: colors.textMain }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: colors.textMuted }}>{p.mrn}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: colors.textBody }}>
                          {p.age} yrs / {p.gender === 'F' ? 'Female' : 'Male'}
                        </td>
                        <td style={{ padding: '10px 12px', color: colors.textBody }}>
                          {p.complaint}
                        </td>
                        <td style={{ padding: '10px 12px', color: colors.textMuted, fontSize: 12 }}>
                          {p.arrivalTime}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge tone={p.priority === 'STAT' ? 'danger' : p.priority === 'URGENT' ? 'warning' : 'neutral'}>
                            {p.priority}
                          </Badge>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge tone={p.status === 'IN_CONSULTATION' ? 'info' : p.status === 'COMPLETED' ? 'success' : 'neutral'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon="fa-stethoscope"
                            onClick={() => handleStartConsultation(p)}
                          >
                            Start Consult
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Quick Access Modules */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: colors.textMain }}>
              EMR Hub Stations & Specialty Operations
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectView(item.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 120,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.10)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: radii.md,
                          backgroundColor: colors.primaryLight,
                          color: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                        }}
                      >
                        <i className={`fa ${item.icon}`} />
                      </div>
                      {item.badge && <Badge tone="info">{item.badge}</Badge>}
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: colors.textMain }}>
                      {item.label}
                    </h4>
                    <p style={{ margin: 0, fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      color: colors.primary,
                      marginTop: 10,
                    }}
                  >
                    <span>Open Station</span>
                    <i className="fa fa-arrow-right" style={{ fontSize: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView === 'DISCHARGE_SUMMARY' && <DischargeSummaryScreen />}
      {currentView === 'DISCHARGE_AUDIT' && <ClinicalAuditTrailScreen />}
      {currentView === 'FORM_ASSEMBLY' && <EmrFormAssemblyScreen />}
      {currentView === 'EMR_MASTERS' && <EmrMastersScreen />}
      {currentView === 'VISIT_SUMMARY' && <EmrVisitSummaryScreen />}

      {currentView === 'WORKSTATION' && (
        <Card padding={spacing.md}>
          <PatientIdentityBanner
            patientName={selectedPatient?.name || 'Fatima Al Mansoori'}
            mrn={selectedPatient?.mrn || 'MRN-784-001'}
            age={selectedPatient?.age || 34}
            gender={selectedPatient?.gender === 'F' ? 'Female' : 'Male'}
            attendingDoctor={activeDoctor.name}
            wardName={activeDoctor.room}
          />

          {/* Workstation Subtabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              borderBottom: `2px solid ${colors.border}`,
              margin: `${spacing.md} 0`,
              backgroundColor: '#ffffff',
              padding: '4px 8px 0',
              borderRadius: `${radii.md} ${radii.md} 0 0`,
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'SPECIALTY_FORM', label: `${activeDoctor.specialty} Form (${activeDoctor.assignedPanelCode})`, icon: 'fa-file-text' },
              { id: 'OVERVIEW', label: 'Vitals & Trajectory', icon: 'fa-heartbeat' },
              { id: 'DIAGNOSIS', label: 'ICD-10 Diagnoses', icon: 'fa-stethoscope' },
              { id: 'ALLERGIES', label: 'Allergies & Adverse', icon: 'fa-exclamation-triangle' },
              { id: 'EMAR', label: 'Ward eMAR Schedule', icon: 'fa-clock-o' },
              { id: 'HANDOVER', label: 'ISBAR Handover', icon: 'fa-exchange' },
              { id: 'FLUIDS', label: 'Fluid Balance (I/O)', icon: 'fa-tint' },
              { id: 'NOTES', label: 'Nursing SOAP/DAR', icon: 'fa-pencil-square-o' },
              { id: 'CDS', label: 'CDS Alerts', icon: 'fa-bell' },
            ].map((tab) => {
              const isActive = workstationTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWorkstationTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: `3px solid ${isActive ? colors.primary : 'transparent'}`,
                    background: 'transparent',
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <i className={`fa ${tab.icon}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {workstationTab === 'SPECIALTY_FORM' && (
            <div style={{ padding: 10 }}>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: colors.primaryLight,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.primaryMid}`,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.primary }}>
                    📋 {activeDoctor.assignedPanelName}
                  </h3>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Panel Code: <strong>{activeDoctor.assignedPanelCode}</strong> • Specialty: <strong>{activeDoctor.specialty}</strong> • Doctor: <strong>{activeDoctor.name}</strong>
                  </div>
                </div>
                <Button variant="primary" size="sm" icon="fa-save" onClick={() => alert('Specialty Encounter Form Saved Successfully!')}>
                  Save & Sign Encounter
                </Button>
              </div>

              {/* Form Assembly for Doctor's Specialty */}
              <EmrFormAssemblyScreen />
            </div>
          )}

          {workstationTab === 'OVERVIEW' && <PatientVitalScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'DIAGNOSIS' && <PatientDiagnosisScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'ALLERGIES' && <PatientAllergyScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'EMAR' && <WardEmarScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'HANDOVER' && <WardHandoverScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'FLUIDS' && <WardFluidBalanceScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'NOTES' && <WardNursingNotesScreen patientId={selectedPatient?.id || 1} patientName={selectedPatient?.name} />}
          {workstationTab === 'CDS' && <ClinicalCdsAlertsScreen />}
        </Card>
      )}

      {(currentView === 'USER_REPORT' || currentView === 'VISIT_REPORT_BR') && (
        <Card title="Clinical Productivity & Branch Report" padding={spacing.lg}>
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <i className="fa fa-bar-chart" style={{ fontSize: 40, color: colors.primary, marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: colors.textMain }}>
              Clinical Activity Summary & Metrics
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
              Generating branch longitudinal analytics for {hospitalName}...
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
