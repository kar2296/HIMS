import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';
import { Input } from '../components/ui/Input';

export type FollowupStatus =
  | 'ALL'
  | 'PENDING'
  | 'SAMPLE_COLLECTED'
  | 'RESULT_ENTERED'
  | 'VERIFIED_DISPATCHED'
  | 'CRITICAL_ALERT';

export type OrderCategory = 'ALL' | 'LAB' | 'RADIOLOGY' | 'CARDIOLOGY' | 'PROCEDURE';

export type PriorityLevel = 'STAT' | 'URGENT' | 'ROUTINE';

export interface InvestigationFollowupItem {
  id: string;
  workOrderNo: string;
  orderDate: string;
  scheduledDate: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'M' | 'F';
  visitType: 'OPD' | 'IPD' | 'EMERGENCY';
  wardOrRoom: string;
  orderType: 'LAB' | 'RADIOLOGY' | 'CARDIOLOGY' | 'PROCEDURE';
  doctorId: string;
  doctorName: string;
  specialty: string;
  investigationName: string;
  testCode: string;
  clinicalIndication: string;
  priority: PriorityLevel;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'RESULT_ENTERED' | 'VERIFIED_DISPATCHED' | 'CRITICAL_ALERT';
  tatMinutes: number;
  tatTargetMinutes: number;
  resultSummary?: string;
  criticalValue?: boolean;
  resultParameters?: Array<{
    name: string;
    value: string;
    unit: string;
    refRange: string;
    isAbnormal: boolean;
  }>;
  followupNotes?: string[];
  patientNotified?: boolean;
}

const INITIAL_INVESTIGATIONS: InvestigationFollowupItem[] = [
  {
    id: 'INV-001',
    workOrderNo: 'WO-2026-9001',
    orderDate: '22/09/2026 08:30 AM',
    scheduledDate: '22/09/2026 09:00 AM',
    patientId: 'P-101',
    patientName: 'Fatima Al Mansoori',
    mrn: 'MRN-784-001',
    age: 34,
    gender: 'F',
    visitType: 'OPD',
    wardOrRoom: 'General OPD Room 101',
    orderType: 'LAB',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    investigationName: 'Complete Blood Count (CBC) with Differential',
    testCode: 'LAB-CBC-01',
    clinicalIndication: 'High-grade fever for 3 days, chills and malaise. Rule out dengue/malaria.',
    priority: 'URGENT',
    status: 'RESULT_ENTERED',
    tatMinutes: 45,
    tatTargetMinutes: 60,
    criticalValue: false,
    resultSummary: 'Mild leukocytosis (WBC 12.8 x10^3/uL), Platelets normal (240 x10^3/uL)',
    resultParameters: [
      { name: 'Hemoglobin (Hb)', value: '13.2', unit: 'g/dL', refRange: '12.0 - 15.5', isAbnormal: false },
      { name: 'WBC Count', value: '12.8', unit: 'x10^3/uL', refRange: '4.0 - 11.0', isAbnormal: true },
      { name: 'Platelet Count', value: '240', unit: 'x10^3/uL', refRange: '150 - 450', isAbnormal: false },
      { name: 'Neutrophils', value: '78', unit: '%', refRange: '40 - 70', isAbnormal: true },
      { name: 'Lymphocytes', value: '18', unit: '%', refRange: '20 - 40', isAbnormal: false },
    ],
    followupNotes: ['Sample received at central lab 08:45 AM', 'Analyzer batch run completed 09:15 AM'],
    patientNotified: true,
  },
  {
    id: 'INV-002',
    workOrderNo: 'WO-2026-9002',
    orderDate: '22/09/2026 09:00 AM',
    scheduledDate: '22/09/2026 09:30 AM',
    patientId: 'P-108',
    patientName: 'Ahmed Hassan',
    mrn: 'MRN-784-008',
    age: 62,
    gender: 'M',
    visitType: 'EMERGENCY',
    wardOrRoom: 'ER Resuscitation Bay 1',
    orderType: 'CARDIOLOGY',
    doctorId: 'DOC-107',
    doctorName: 'Dr. Emily Watson',
    specialty: 'Emergency Medicine',
    investigationName: '12-Lead Electrocardiogram (ECG) & Serum Troponin-I',
    testCode: 'CARD-ECG-02',
    clinicalIndication: 'Acute retrosternal crushing chest pain radiating to left jaw & diaphoresis.',
    priority: 'STAT',
    status: 'CRITICAL_ALERT',
    tatMinutes: 15,
    tatTargetMinutes: 20,
    criticalValue: true,
    resultSummary: 'CRITICAL ALERT: ST Elevation in leads V1-V4 (Anterior STEMI). Troponin-I: 4.82 ng/mL',
    resultParameters: [
      { name: 'High-Sensitivity Troponin-I', value: '4.82', unit: 'ng/mL', refRange: '< 0.04', isAbnormal: true },
      { name: 'CK-MB Isoenzyme', value: '58', unit: 'U/L', refRange: '< 25', isAbnormal: true },
      { name: 'Serum Potassium (K+)', value: '4.2', unit: 'mmol/L', refRange: '3.5 - 5.0', isAbnormal: false },
    ],
    followupNotes: ['CRITICAL RESULT telephoned directly to Dr. Emily Watson at 09:14 AM', 'Cath lab activated for primary PCI'],
    patientNotified: false,
  },
  {
    id: 'INV-003',
    workOrderNo: 'WO-2026-9003',
    orderDate: '22/09/2026 09:15 AM',
    scheduledDate: '22/09/2026 10:00 AM',
    patientId: 'P-103',
    patientName: 'Amina Rashid',
    mrn: 'MRN-784-003',
    age: 29,
    gender: 'F',
    visitType: 'OPD',
    wardOrRoom: 'Eye Clinic Room 204',
    orderType: 'RADIOLOGY',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Ophthalmology',
    investigationName: 'Optical Coherence Tomography (OCT) Macula & Disc',
    testCode: 'RAD-OCT-01',
    clinicalIndication: 'Sudden onset blurred central vision OD. Assess for maculopathy or CSCR.',
    priority: 'ROUTINE',
    status: 'VERIFIED_DISPATCHED',
    tatMinutes: 35,
    tatTargetMinutes: 90,
    criticalValue: false,
    resultSummary: 'Normal foveal contour, central subfield thickness 245 um. No subretinal fluid.',
    resultParameters: [
      { name: 'Central Subfield Thickness (OD)', value: '245', unit: 'um', refRange: '220 - 270', isAbnormal: false },
      { name: 'Optic Nerve RNFL Average', value: '98', unit: 'um', refRange: '85 - 110', isAbnormal: false },
    ],
    followupNotes: ['Scan acquired by Optometrist', 'Verified and signed by Dr. Sarah Jenkins'],
    patientNotified: true,
  },
  {
    id: 'INV-004',
    workOrderNo: 'WO-2026-9004',
    orderDate: '22/09/2026 09:30 AM',
    scheduledDate: '22/09/2026 10:15 AM',
    patientId: 'P-104',
    patientName: 'Khalid bin Zayed',
    mrn: 'MRN-784-004',
    age: 42,
    gender: 'M',
    visitType: 'OPD',
    wardOrRoom: 'Dental Operatory 1',
    orderType: 'RADIOLOGY',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Tariq Al Mansoori',
    specialty: 'Dental / Maxillofacial',
    investigationName: 'Orthopantomogram (OPG) Panoramic Dental X-Ray',
    testCode: 'RAD-OPG-01',
    clinicalIndication: 'Severe throbbing pain tooth #46 with periapical tenderness. Evaluate impaction #48.',
    priority: 'URGENT',
    status: 'SAMPLE_COLLECTED',
    tatMinutes: 20,
    tatTargetMinutes: 45,
    criticalValue: false,
    followupNotes: ['Patient positioned in OPG gantry at 09:40 AM', 'Digital radiograph processing in progress'],
    patientNotified: false,
  },
  {
    id: 'INV-005',
    workOrderNo: 'WO-2026-9005',
    orderDate: '22/09/2026 09:45 AM',
    scheduledDate: '22/09/2026 10:30 AM',
    patientId: 'P-105',
    patientName: 'Mariam Al Zaabi',
    mrn: 'MRN-784-005',
    age: 31,
    gender: 'F',
    visitType: 'OPD',
    wardOrRoom: 'OB/GYN Clinic Room 302',
    orderType: 'RADIOLOGY',
    doctorId: 'DOC-104',
    doctorName: 'Dr. Fatima Al Zahra',
    specialty: 'Obstetrics & Gynecology',
    investigationName: 'Obstetric Ultrasound Fetal Growth & Doppler Study',
    testCode: 'RAD-US-OBS',
    clinicalIndication: '28-week antenatal evaluation for fetal biometry, amniotic fluid AFI, and umbilical artery PI.',
    priority: 'ROUTINE',
    status: 'PENDING',
    tatMinutes: 10,
    tatTargetMinutes: 60,
    criticalValue: false,
    followupNotes: ['Patient queued in ultrasound waiting area'],
    patientNotified: false,
  },
  {
    id: 'INV-006',
    workOrderNo: 'WO-2026-9006',
    orderDate: '22/09/2026 10:00 AM',
    scheduledDate: '22/09/2026 10:45 AM',
    patientId: 'P-106',
    patientName: 'Sultan Al Dhaheri',
    mrn: 'MRN-784-006',
    age: 56,
    gender: 'M',
    visitType: 'OPD',
    wardOrRoom: 'Pre-Op PAC Room 108',
    orderType: 'LAB',
    doctorId: 'DOC-105',
    doctorName: 'Dr. Vikram Sharma',
    specialty: 'Anesthesiology',
    investigationName: 'Coagulation Profile (PT/INR, aPTT) & Renal Function Test',
    testCode: 'LAB-COAG-01',
    clinicalIndication: 'Pre-anesthetic evaluation for elective laparoscopic cholecystectomy under GA.',
    priority: 'ROUTINE',
    status: 'SAMPLE_COLLECTED',
    tatMinutes: 15,
    tatTargetMinutes: 60,
    criticalValue: false,
    followupNotes: ['Blood sample drawn in phlebotomy booth #3'],
    patientNotified: false,
  },
  {
    id: 'INV-007',
    workOrderNo: 'WO-2026-9007',
    orderDate: '22/09/2026 10:15 AM',
    scheduledDate: '22/09/2026 11:00 AM',
    patientId: 'P-107',
    patientName: 'Sara Al Ali',
    mrn: 'MRN-784-007',
    age: 26,
    gender: 'F',
    visitType: 'OPD',
    wardOrRoom: 'Physiotherapy Suite 2',
    orderType: 'RADIOLOGY',
    doctorId: 'DOC-106',
    doctorName: 'Dr. Maya Patel',
    specialty: 'Physiotherapy',
    investigationName: 'MRI Right Knee Joint (Non-Contrast)',
    testCode: 'RAD-MRI-KNEE',
    clinicalIndication: 'Post-ACL reconstruction follow-up at 12 weeks. Assess graft integrity and meniscal status.',
    priority: 'ROUTINE',
    status: 'PENDING',
    tatMinutes: 5,
    tatTargetMinutes: 120,
    criticalValue: false,
    followupNotes: ['Scheduled in MRI Slot B for 11:00 AM'],
    patientNotified: false,
  },
];

export const InvestigationFollowupTrackerScreen: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationFollowupItem[]>(INITIAL_INVESTIGATIONS);
  const [statusFilter, setStatusFilter] = useState<FollowupStatus>('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderCategory>('ALL');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InvestigationFollowupItem | null>(null);
  const [viewResultModal, setViewResultModal] = useState<InvestigationFollowupItem | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  const filteredList = investigations
    .filter((inv) => statusFilter === 'ALL' || inv.status === statusFilter)
    .filter((inv) => orderTypeFilter === 'ALL' || inv.orderType === orderTypeFilter)
    .filter((inv) => selectedDoctorFilter === 'ALL' || inv.doctorId === selectedDoctorFilter || inv.doctorName.toLowerCase().includes(selectedDoctorFilter.toLowerCase()))
    .filter(
      (inv) =>
        inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.workOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.investigationName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleUpdateStatus = (id: string, newStatus: InvestigationFollowupItem['status']) => {
    setInvestigations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
    );
    showToast(`Order status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleNotifyPatient = (id: string) => {
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              patientNotified: true,
              followupNotes: [...(inv.followupNotes || []), `Patient successfully notified via SMS/Portal at ${new Date().toLocaleTimeString()}`],
            }
          : inv
      )
    );
    showToast('Patient notification SMS & WhatsApp dispatched!');
  };

  const handleAddNote = (id: string) => {
    if (!newNoteText.trim()) return;
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              followupNotes: [...(inv.followupNotes || []), `${newNoteText.trim()} (${new Date().toLocaleTimeString()})`],
            }
          : inv
      )
    );
    setNewNoteText('');
    showToast('Clinical follow-up note appended!');
  };

  const pendingCount = investigations.filter((i) => i.status === 'PENDING' || i.status === 'SAMPLE_COLLECTED').length;
  const readyCount = investigations.filter((i) => i.status === 'RESULT_ENTERED' || i.status === 'VERIFIED_DISPATCHED').length;
  const criticalCount = investigations.filter((i) => i.status === 'CRITICAL_ALERT').length;

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
      {actionSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 100000,
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
          {actionSuccessToast}
        </div>
      )}

      {/* Screen Header */}
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
            <span style={{ fontSize: 22, color: colors.primary }}>🔬</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Investigation Followup Trackers
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            Real-time tracking of diagnostic laboratory, radiology imaging, and cardiology investigation orders with clinical turnaround times (TAT) and result dispatch status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="secondary"
            size="md"
            icon="fa-refresh"
            onClick={() => showToast('Investigation tracker synced with LIS/RIS live queue!')}
          >
            Refresh Tracker
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
              Total Orders Today
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textMain, marginTop: 2 }}>
              {investigations.length}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.full,
              backgroundColor: colors.primaryLight,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="fa fa-list-alt" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
              Pending / In-Process
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 2 }}>
              {pendingCount}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.full,
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="fa fa-clock-o" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
              Results Ready / Verified
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.success, marginTop: 2 }}>
              {readyCount}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.full,
              backgroundColor: colors.successBg,
              color: colors.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="fa fa-check-circle" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: criticalCount > 0 ? '#fff1f2' : '#ffffff',
            border: `1px solid ${criticalCount > 0 ? '#fecdd3' : colors.border}`,
            borderRadius: radii.md,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: criticalCount > 0 ? '#e11d48' : colors.textMuted, textTransform: 'uppercase' }}>
              Critical Safety Alerts
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: criticalCount > 0 ? '#e11d48' : colors.textMain, marginTop: 2 }}>
              {criticalCount}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.full,
              backgroundColor: criticalCount > 0 ? '#ffe4e6' : colors.surfaceSunken,
              color: criticalCount > 0 ? '#e11d48' : colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="fa fa-exclamation-triangle" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card padding={spacing.md} style={{ marginBottom: spacing.md }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
              Order Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 13,
                borderRadius: radii.sm,
                border: `1px solid ${colors.borderStrong}`,
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
              Status Filter:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FollowupStatus)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: radii.sm,
                border: `1px solid ${colors.borderStrong}`,
                backgroundColor: '#ffffff',
                color: colors.textMain,
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SAMPLE_COLLECTED">Sample Collected</option>
              <option value="RESULT_ENTERED">Result Entered</option>
              <option value="VERIFIED_DISPATCHED">Verified & Dispatched</option>
              <option value="CRITICAL_ALERT">Critical Alert</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
              Order Type:
            </label>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value as OrderCategory)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: radii.sm,
                border: `1px solid ${colors.borderStrong}`,
                backgroundColor: '#ffffff',
                color: colors.textMain,
                outline: 'none',
              }}
            >
              <option value="ALL">All Order Types</option>
              <option value="LAB">Laboratory / Pathology</option>
              <option value="RADIOLOGY">Radiology & Imaging</option>
              <option value="CARDIOLOGY">Cardiology & Diagnostics</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
              Doctor / Specialty:
            </label>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: radii.sm,
                border: `1px solid ${colors.borderStrong}`,
                backgroundColor: '#ffffff',
                color: colors.textMain,
                outline: 'none',
              }}
            >
              <option value="ALL">All Ordering Doctors</option>
              <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (General Medicine)</option>
              <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Ophthalmology)</option>
              <option value="Dr. Tariq Al Mansoori">Dr. Tariq Al Mansoori (Dental)</option>
              <option value="Dr. Fatima Al Zahra">Dr. Fatima Al Zahra (OB/GYN)</option>
              <option value="Dr. Vikram Sharma">Dr. Vikram Sharma (Anesthesia / PAC)</option>
              <option value="Dr. Maya Patel">Dr. Maya Patel (Physiotherapy)</option>
              <option value="Dr. Emily Watson">Dr. Emily Watson (Emergency)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
              Quick Search:
            </label>
            <Input
              label=""
              placeholder="Name / UHID / WorkOrder#..."
              leftIcon="fa fa-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Main Investigation Orders Table */}
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.textMain }}>
            Tracked Diagnostic Orders ({filteredList.length})
          </h3>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            Showing real-time diagnostic pipeline & turnaround status
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: colors.textMuted }}>
            <i className="fa fa-search" style={{ fontSize: 32, marginBottom: 8, display: 'block', opacity: 0.5 }} />
            No investigation orders found matching current filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: 40 }}>#</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Work Order & Timestamps</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Patient Details</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Investigation / Test</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ordering Clinician</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Priority & TAT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Follow-up Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, idx) => {
                  const isCritical = item.status === 'CRITICAL_ALERT' || item.criticalValue;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: isCritical ? '#fff1f2' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: colors.textMuted, fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: colors.primary }}>{item.workOrderNo}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Ordered: {item.orderDate}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Sched: {item.scheduledDate}</div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: colors.textMain }}>{item.patientName}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>
                          {item.mrn} • {item.age}y/{item.gender}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textBody, marginTop: 2 }}>
                          <span style={{ backgroundColor: colors.surfaceSunken, padding: '1px 5px', borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}` }}>
                            {item.visitType}: {item.wardOrRoom}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            backgroundColor: item.orderType === 'LAB' ? '#eff6ff' : item.orderType === 'RADIOLOGY' ? '#f5f3ff' : '#fef3c7',
                            color: item.orderType === 'LAB' ? colors.primary : item.orderType === 'RADIOLOGY' ? '#7c3aed' : '#d97706',
                            border: `1px solid ${item.orderType === 'LAB' ? '#bfdbfe' : item.orderType === 'RADIOLOGY' ? '#ddd6fe' : '#fde68a'}`,
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: radii.sm,
                          }}
                        >
                          {item.orderType}
                        </span>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: colors.textMain }}>{item.investigationName}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Code: {item.testCode}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 }}>
                          Indication: {item.clinicalIndication}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain }}>{item.doctorName}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>{item.specialty}</div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div>
                          <Badge tone={item.priority === 'STAT' ? 'danger' : item.priority === 'URGENT' ? 'warning' : 'neutral'}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                          TAT: <strong>{item.tatMinutes}m</strong> / {item.tatTargetMinutes}m target
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        {item.status === 'CRITICAL_ALERT' && (
                          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', padding: '2px 8px', borderRadius: radii.sm, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa fa-bell" /> Critical Alert
                          </span>
                        )}
                        {item.status === 'VERIFIED_DISPATCHED' && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 8px', borderRadius: radii.sm, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa fa-check" /> Verified
                          </span>
                        )}
                        {item.status === 'RESULT_ENTERED' && (
                          <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #93c5fd', padding: '2px 8px', borderRadius: radii.sm, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa fa-file-text-o" /> Result Ready
                          </span>
                        )}
                        {item.status === 'SAMPLE_COLLECTED' && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: radii.sm, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa fa-flask" /> In Processing
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: radii.sm, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa fa-clock-o" /> Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            title="View / Verify Diagnostic Result"
                            onClick={() => setViewResultModal(item)}
                            style={{
                              border: `1px solid ${colors.primary}`,
                              backgroundColor: colors.primaryLight,
                              color: colors.primary,
                              borderRadius: radii.sm,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            <i className="fa fa-eye" style={{ marginRight: 3 }} />
                            Result
                          </button>

                          <button
                            type="button"
                            title="Open Follow-up & Audit Trail"
                            onClick={() => setSelectedItem(item)}
                            style={{
                              border: `1px solid ${colors.border}`,
                              backgroundColor: '#ffffff',
                              color: colors.textBody,
                              borderRadius: radii.sm,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: 11,
                            }}
                          >
                            <i className="fa fa-commenting-o" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* Investigation Result & Report Modal                                       */}
      {/* ========================================================================= */}
      {viewResultModal && (
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
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: 750,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSunken, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                  Diagnostic Report: {viewResultModal.investigationName}
                </h3>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Work Order: <strong>{viewResultModal.workOrderNo}</strong> • Patient: <strong>{viewResultModal.patientName}</strong> ({viewResultModal.mrn})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewResultModal(null)}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: colors.textMuted }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* Critical Alert Warning Banner if applicable */}
              {(viewResultModal.criticalValue || viewResultModal.status === 'CRITICAL_ALERT') && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #f87171',
                    borderRadius: radii.md,
                    padding: '12px 16px',
                    color: '#991b1b',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <i className="fa fa-exclamation-triangle" style={{ fontSize: 18 }} />
                  CRITICAL LAB / DIAGNOSTIC VALUE DETECTED — MANDATORY VERIFICATION & CLINICAL CALL-BACK RECORDED
                </div>
              )}

              {/* Patient and Clinical Summary Box */}
              <div
                style={{
                  backgroundColor: colors.surfaceSunken,
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: radii.md,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 12,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: colors.textMuted }}>Ordering Doctor:</span>
                  <div style={{ fontWeight: 700, color: colors.textMain }}>{viewResultModal.doctorName}</div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted }}>Specialty:</span>
                  <div style={{ fontWeight: 700, color: colors.textMain }}>{viewResultModal.specialty}</div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted }}>Order Priority:</span>
                  <div style={{ fontWeight: 700, color: colors.textMain }}>{viewResultModal.priority}</div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted }}>Turnaround Time:</span>
                  <div style={{ fontWeight: 700, color: colors.primary }}>{viewResultModal.tatMinutes} mins</div>
                </div>
              </div>

              {/* Lab Parameters Table */}
              {viewResultModal.resultParameters && viewResultModal.resultParameters.length > 0 ? (
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, overflow: 'hidden', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Test Parameter</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Observed Value</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Reference Range</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewResultModal.resultParameters.map((p, pi) => (
                        <tr
                          key={pi}
                          style={{
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: p.isAbnormal ? '#fff1f2' : '#ffffff',
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.name}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: p.isAbnormal ? '#e11d48' : colors.textMain }}>
                            {p.value} {p.unit}
                          </td>
                          <td style={{ padding: '8px 12px', color: colors.textMuted }}>{p.refRange} {p.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {p.isAbnormal ? (
                              <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: radii.sm }}>
                                ABNORMAL
                              </span>
                            ) : (
                              <span style={{ color: colors.success, fontSize: 11, fontWeight: 700 }}>
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '16px', backgroundColor: colors.surfaceSunken, borderRadius: radii.md, color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
                  {viewResultModal.resultSummary || 'Investigation result is currently in processing. Final report will appear here once verified.'}
                </div>
              )}

              {/* Result Summary / Clinical Impression */}
              {viewResultModal.resultSummary && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>
                    Pathologist / Radiologist Interpretation:
                  </label>
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', border: `1px solid ${colors.border}`, borderRadius: radii.sm, fontSize: 13, color: colors.textMain }}>
                    {viewResultModal.resultSummary}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSunken, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="secondary"
                size="md"
                icon="fa-phone"
                onClick={() => {
                  handleNotifyPatient(viewResultModal.id);
                  setViewResultModal(null);
                }}
              >
                Notify Patient (SMS / Call)
              </Button>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" size="md" onClick={() => setViewResultModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon="fa-check"
                  onClick={() => {
                    handleUpdateStatus(viewResultModal.id, 'VERIFIED_DISPATCHED');
                    setViewResultModal(null);
                  }}
                >
                  Verify & Sign Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Clinical Notes & Follow-up History Drawer Modal                           */}
      {/* ========================================================================= */}
      {selectedItem && (
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
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: 620,
              padding: 24,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${colors.border}`, paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                  Follow-up Audit Log: {selectedItem.workOrderNo}
                </h3>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {selectedItem.investigationName} • {selectedItem.patientName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: colors.textMuted }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 8 }}>
                Activity & Follow-up Timeline:
              </label>
              <div style={{ backgroundColor: colors.surfaceSunken, borderRadius: radii.md, padding: '12px 16px', maxHeight: 200, overflowY: 'auto' }}>
                {(selectedItem.followupNotes || []).length === 0 ? (
                  <span style={{ fontSize: 12, color: colors.textMuted }}>No follow-up notes logged yet.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(selectedItem.followupNotes || []).map((note, ni) => (
                      <div key={ni} style={{ fontSize: 12, color: colors.textMain, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <i className="fa fa-angle-right" style={{ color: colors.primary, marginTop: 2 }} />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>
                Append Follow-up Note / Patient Contact Log:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. Doctor contacted patient with urgent scan results..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNote(selectedItem.id);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.borderStrong}`,
                    outline: 'none',
                  }}
                />
                <Button variant="primary" size="md" onClick={() => handleAddNote(selectedItem.id)}>
                  Add Note
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
              <Button variant="secondary" size="md" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
