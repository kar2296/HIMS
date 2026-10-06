import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export interface IsbarHandoverRecord {
    id?: number | string;
    patientId: number | string;
    encounterId?: number | string;
    shift: 'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'NIGHT_TO_MORNING';
    handoverDate: string;
    outgoingNurse: string;
    incomingNurse?: string;
    status: 'DRAFT' | 'COMPLETED' | 'ACKNOWLEDGED';
    // ISBAR
    identification: {
        patientName: string;
        mrn?: string;
        bedNumber: string;
        wardName: string;
        attendingDoctor: string;
        resuscitationStatus: 'FULL_CODE' | 'DNR' | 'DNI' | 'COMFORT_CARE';
    };
    situation: {
        admissionReason: string;
        currentCondition: 'STABLE' | 'OBSERVATION' | 'DETERIORATING' | 'CRITICAL';
        primaryConcerns: string;
    };
    background: {
        keyMedicalHistory: string;
        allergies: string;
        activeInfectionsOrPrecautions?: string;
        fallRisk: boolean;
    };
    assessment: {
        vitalsSummary: string;
        neurologicalStatus: string;
        woundsDrainsLines: string; // IV lines, catheters, surgical dressings
        painScore?: number;
        pendingResults?: string;
    };
    recommendation: {
        actionItems: string;
        monitoringPlan: string;
        pendingConsultsOrReviews?: string;
        escalationTriggers?: string;
    };
}

export interface WardHandoverScreenProps {
    patientId: number | string;
    patientName?: string;
    wardName?: string;
    bedNumber?: string;
    encounterId?: number | string;
    handovers?: IsbarHandoverRecord[];
    onSaveHandover?: (handover: IsbarHandoverRecord) => void;
    onAcknowledgeHandover?: (handoverId: number | string, incomingNurse: string) => void;
    onClose?: () => void;
}

export const WardHandoverScreen: React.FC<WardHandoverScreenProps> = ({
    patientId,
    patientName,
    wardName,
    bedNumber,
    encounterId,
    handovers = [],
    onSaveHandover,
    onAcknowledgeHandover,
    onClose,
}) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedHandover, setSelectedHandover] = useState<IsbarHandoverRecord | null>(
        handovers.length > 0 ? handovers[0] : null
    );

    // Form state
    const [shift, setShift] = useState<'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'NIGHT_TO_MORNING'>('MORNING_TO_EVENING');
    const [outgoingNurse, setOutgoingNurse] = useState('Staff Nurse A');
    const [resuscitation, setResuscitation] = useState<'FULL_CODE' | 'DNR' | 'DNI' | 'COMFORT_CARE'>('FULL_CODE');
    const [condition, setCondition] = useState<'STABLE' | 'OBSERVATION' | 'DETERIORATING' | 'CRITICAL'>('STABLE');
    const [situationReason, setSituationReason] = useState('');
    const [primaryConcerns, setPrimaryConcerns] = useState('');
    const [medHistory, setMedHistory] = useState('');
    const [allergiesText, setAllergiesText] = useState('NKDA');
    const [fallRisk, setFallRisk] = useState(false);
    const [vitalsSummary, setVitalsSummary] = useState('');
    const [neuroStatus, setNeuroStatus] = useState('Alert & Oriented x3');
    const [woundsLines, setWoundsLines] = useState('Right forearm 20G IV cannula');
    const [actionItems, setActionItems] = useState('');
    const [monitoringPlan, setMonitoringPlan] = useState('Q4H Vitals');
    const [validationError, setValidationError] = useState('');

    const handleSave = () => {
        if (!situationReason.trim()) {
            setValidationError('Situation (Admission Reason) is required.');
            return;
        }
        if (!actionItems.trim()) {
            setValidationError('Recommendation (Action Items) is required.');
            return;
        }

        const now = new Date();
        const handoverDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newRecord: IsbarHandoverRecord = {
            id: Date.now(),
            patientId,
            encounterId,
            shift,
            handoverDate,
            outgoingNurse: outgoingNurse.trim(),
            status: 'COMPLETED',
            identification: {
                patientName: patientName || 'Patient',
                bedNumber: bedNumber || 'Ward Bed',
                wardName: wardName || 'General Ward',
                attendingDoctor: 'Dr. Attending',
                resuscitationStatus: resuscitation,
            },
            situation: {
                admissionReason: situationReason.trim(),
                currentCondition: condition,
                primaryConcerns: primaryConcerns.trim(),
            },
            background: {
                keyMedicalHistory: medHistory.trim(),
                allergies: allergiesText.trim(),
                fallRisk,
            },
            assessment: {
                vitalsSummary: vitalsSummary.trim(),
                neurologicalStatus: neuroStatus.trim(),
                woundsDrainsLines: woundsLines.trim(),
            },
            recommendation: {
                actionItems: actionItems.trim(),
                monitoringPlan: monitoringPlan.trim(),
            },
        };

        if (onSaveHandover) {
            onSaveHandover(newRecord);
        }

        setSelectedHandover(newRecord);
        setIsCreateModalOpen(false);
    };

    const getConditionTone = (cond: string): 'success' | 'warning' | 'danger' | 'info' => {
        switch (cond) {
            case 'CRITICAL':
            case 'DETERIORATING': return 'danger';
            case 'OBSERVATION': return 'warning';
            default: return 'success';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Structured Clinical Nursing Handover</h1>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                            ISBAR Standard
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                        {wardName && ` • Ward: ${wardName}`}
                        {bedNumber && ` • Bed: ${bedNumber}`}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>New Shift Handover</span>
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>

            {/* Handover List Tabs & Detail View */}
            {selectedHandover ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Left: Previous Handovers */}
                    <div className="lg:col-span-1 bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                        <div className="text-xs font-bold text-gray-500 uppercase">Handovers Log</div>
                        {handovers.map((h, idx) => (
                            <button
                                key={h.id || idx}
                                type="button"
                                onClick={() => setSelectedHandover(h)}
                                className={`w-full text-left p-2.5 rounded border transition-colors ${
                                    selectedHandover.id === h.id
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <div className="font-semibold text-xs">{h.shift.replace(/_/g, ' ')}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{h.handoverDate}</div>
                                <div className="text-[11px] text-gray-600 mt-0.5">By: {h.outgoingNurse}</div>
                            </button>
                        ))}
                    </div>

                    {/* Right: ISBAR Structured Content */}
                    <div className="lg:col-span-3 space-y-3">
                        {/* Status Header */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Badge tone={getConditionTone(selectedHandover.situation.currentCondition)}>
                                    Condition: {selectedHandover.situation.currentCondition}
                                </Badge>
                                <Badge tone="neutral">
                                    Resuscitation: {selectedHandover.identification.resuscitationStatus}
                                </Badge>
                                {selectedHandover.background.fallRisk && (
                                    <Badge tone="warning">High Fall Risk</Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                Logged by: <strong>{selectedHandover.outgoingNurse}</strong> on {selectedHandover.handoverDate}
                            </div>
                        </div>

                        {/* I - Identification */}
                        <Card title="I — Identification">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div><span className="text-gray-500">Patient:</span> <strong>{selectedHandover.identification.patientName}</strong></div>
                                <div><span className="text-gray-500">Bed:</span> <strong>{selectedHandover.identification.bedNumber}</strong></div>
                                <div><span className="text-gray-500">Ward:</span> <strong>{selectedHandover.identification.wardName}</strong></div>
                                <div><span className="text-gray-500">Attending:</span> <strong>{selectedHandover.identification.attendingDoctor}</strong></div>
                            </div>
                        </Card>

                        {/* S - Situation */}
                        <Card title="S — Situation">
                            <div className="space-y-1 text-sm text-gray-800">
                                <div><span className="text-gray-500 font-medium text-xs">Reason for Admission:</span> {selectedHandover.situation.admissionReason}</div>
                                {selectedHandover.situation.primaryConcerns && (
                                    <div><span className="text-gray-500 font-medium text-xs">Immediate Concerns:</span> {selectedHandover.situation.primaryConcerns}</div>
                                )}
                            </div>
                        </Card>

                        {/* B - Background */}
                        <Card title="B — Background">
                            <div className="space-y-1 text-sm text-gray-800">
                                <div><span className="text-gray-500 font-medium text-xs">Medical History:</span> {selectedHandover.background.keyMedicalHistory || 'None'}</div>
                                <div><span className="text-gray-500 font-medium text-xs">Allergies:</span> {selectedHandover.background.allergies || 'NKDA'}</div>
                            </div>
                        </Card>

                        {/* A - Assessment */}
                        <Card title="A — Assessment">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-800">
                                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-semibold mb-1">Vitals / Hemodynamics:</div>
                                    <div>{selectedHandover.assessment.vitalsSummary || 'Stable'}</div>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-semibold mb-1">Neurological & Pain:</div>
                                    <div>{selectedHandover.assessment.neurologicalStatus}</div>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-semibold mb-1">Lines, Tubes & Drains:</div>
                                    <div>{selectedHandover.assessment.woundsDrainsLines}</div>
                                </div>
                            </div>
                        </Card>

                        {/* R - Recommendation */}
                        <Card title="R — Recommendation & Shift Plan">
                            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded text-sm text-indigo-950 space-y-2">
                                <div>
                                    <div className="text-xs font-bold text-indigo-900 uppercase">Action Plan for Next Shift:</div>
                                    <div className="mt-0.5">{selectedHandover.recommendation.actionItems}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-900 uppercase">Monitoring Frequency:</div>
                                    <div className="mt-0.5">{selectedHandover.recommendation.monitoringPlan}</div>
                                </div>
                            </div>
                        </Card>

                        {/* Acknowledgment Bar */}
                        {selectedHandover.status !== 'ACKNOWLEDGED' && onAcknowledgeHandover && (
                            <div className="flex justify-end p-3 bg-white rounded-lg border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => onAcknowledgeHandover(selectedHandover.id!, 'Incoming Staff Nurse')}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 shadow-sm"
                                >
                                    ✓ Acknowledge Handover Receipt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <Card>
                    <div className="text-center py-10 text-gray-500">
                        No handover records created yet. Click &quot;New Shift Handover&quot; to generate an ISBAR handover sheet.
                    </div>
                </Card>
            )}

            {/* Modal: New Handover */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create ISBAR Nursing Handover"
                width="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                            Save & Sign Handover
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    {validationError && (
                        <div className="bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-200">
                            {validationError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Shift</label>
                            <Select
                                value={shift}
                                onChange={(v) => setShift(v as any)}
                                options={[
                                    { label: 'Morning -> Evening Shift', value: 'MORNING_TO_EVENING' },
                                    { label: 'Evening -> Night Shift', value: 'EVENING_TO_NIGHT' },
                                    { label: 'Night -> Morning Shift', value: 'NIGHT_TO_MORNING' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Patient Condition</label>
                            <Select
                                value={condition}
                                onChange={(v) => setCondition(v as any)}
                                options={[
                                    { label: 'Stable', value: 'STABLE' },
                                    { label: 'Close Observation', value: 'OBSERVATION' },
                                    { label: 'Deteriorating', value: 'DETERIORATING' },
                                    { label: 'Critical', value: 'CRITICAL' },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Situation (Admission Reason & Clinical Focus) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Post-op Day 1 Laparoscopic Cholecystectomy..."
                            value={situationReason}
                            onChange={(e) => setSituationReason(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Medical Background</label>
                            <Input
                                placeholder="e.g. HTN, T2DM"
                                value={medHistory}
                                onChange={(e) => setMedHistory(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vitals / Assessment</label>
                            <Input
                                placeholder="e.g. BP 124/80, HR 76, SpO2 98%"
                                value={vitalsSummary}
                                onChange={(e) => setVitalsSummary(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Lines, Tubes & Catheters</label>
                        <Input
                            placeholder="e.g. IV line left arm, Foley catheter draining clear urine"
                            value={woundsLines}
                            onChange={(e) => setWoundsLines(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Recommendation (Action Plan for Next Shift) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                            rows={2}
                            placeholder="e.g. Repeat CBC at 16:00, ambulate with assistance, doctor review pending..."
                            value={actionItems}
                            onChange={(e) => setActionItems(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
