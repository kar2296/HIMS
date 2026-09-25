import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export type EmarStatus = 'DUE' | 'GIVEN' | 'HELD' | 'REFUSED' | 'MISSED';

export interface EmarDoseRecord {
    id: number | string;
    orderId: number | string;
    drugName: string;
    dosage: string;
    route: string;
    scheduledTime: string; // e.g. "08:00", "14:00", "20:00"
    scheduledDate: string; // "YYYY-MM-DD"
    status: EmarStatus;
    givenAt?: string;
    givenBy?: string;
    heldReason?: string;
    refusedReason?: string;
    specialInstructions?: string;
}

export interface EmarMedicationOrder {
    id: number | string;
    drugName: string;
    genericName?: string;
    dosage: string;
    unit: string;
    route: string;
    frequency: string;
    instructions?: string;
    startDate: string;
    endDate?: string;
}

export interface WardEmarScreenProps {
    patientId: number | string;
    patientName?: string;
    wardName?: string;
    bedNumber?: string;
    encounterNumber?: string;
    orders?: EmarMedicationOrder[];
    doses?: EmarDoseRecord[];
    onAdministerDose?: (doseId: number | string, givenBy: string, notes?: string) => void;
    onRecordException?: (doseId: number | string, status: 'HELD' | 'REFUSED', reason: string) => void;
    onClose?: () => void;
}

export const TIME_SLOTS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00', '02:00'];

export const WardEmarScreen: React.FC<WardEmarScreenProps> = ({
    patientId,
    patientName,
    wardName,
    bedNumber,
    encounterNumber,
    orders = [],
    doses = [],
    onAdministerDose,
    onRecordException,
    onClose,
}) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [activeShift, setActiveShift] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');

    // Administer Modal State
    const [doseToAdminister, setDoseToAdminister] = useState<EmarDoseRecord | null>(null);
    const [nurseName, setNurseName] = useState('Nurse Staff');
    const [adminNotes, setAdminNotes] = useState('');
    const [verified5Rights, setVerified5Rights] = useState({
        patient: false,
        drug: false,
        dose: false,
        route: false,
        time: false,
    });
    const [adminError, setAdminError] = useState('');

    // Exception Modal State (Held / Refused)
    const [doseForException, setDoseForException] = useState<{
        dose: EmarDoseRecord;
        type: 'HELD' | 'REFUSED';
    } | null>(null);
    const [exceptionReasonCategory, setExceptionReasonCategory] = useState('PATIENT_NPO');
    const [customExceptionReason, setCustomExceptionReason] = useState('');
    const [exceptionError, setExceptionError] = useState('');

    const handleOpenAdminister = (dose: EmarDoseRecord) => {
        setDoseToAdminister(dose);
        setVerified5Rights({
            patient: false,
            drug: false,
            dose: false,
            route: false,
            time: false,
        });
        setAdminNotes('');
        setAdminError('');
    };

    const handleConfirmAdminister = () => {
        const allChecked = Object.values(verified5Rights).every(Boolean);
        if (!allChecked) {
            setAdminError('You must verify all 5 Rights of Medication Administration before confirming.');
            return;
        }

        if (!doseToAdminister) return;

        if (onAdministerDose) {
            onAdministerDose(doseToAdminister.id, nurseName, adminNotes);
        }

        setDoseToAdminister(null);
    };

    const handleConfirmException = () => {
        const fullReason = customExceptionReason.trim()
            ? `${exceptionReasonCategory}: ${customExceptionReason.trim()}`
            : exceptionReasonCategory;

        if (!fullReason) {
            setExceptionError('A clinical reason is mandatory to record a held or refused dose.');
            return;
        }

        if (!doseForException) return;

        if (onRecordException) {
            onRecordException(doseForException.dose.id, doseForException.type, fullReason);
        }

        setDoseForException(null);
        setCustomExceptionReason('');
        setExceptionError('');
    };

    const getStatusBadge = (dose: EmarDoseRecord) => {
        switch (dose.status) {
            case 'GIVEN':
                return (
                    <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded border border-emerald-300 font-medium text-center">
                        <div>✓ GIVEN ({dose.givenAt || dose.scheduledTime})</div>
                        {dose.givenBy && <div className="text-[10px] text-emerald-700">{dose.givenBy}</div>}
                    </div>
                );
            case 'HELD':
                return (
                    <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded border border-amber-300 font-medium text-center" title={dose.heldReason}>
                        <div>⏸ HELD</div>
                        <div className="text-[10px] truncate max-w-[80px]">{dose.heldReason || 'Held'}</div>
                    </div>
                );
            case 'REFUSED':
                return (
                    <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded border border-red-300 font-medium text-center" title={dose.refusedReason}>
                        <div>✕ REFUSED</div>
                        <div className="text-[10px] truncate max-w-[80px]">{dose.refusedReason || 'Refused'}</div>
                    </div>
                );
            case 'MISSED':
                return (
                    <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-300 font-medium text-center">
                        MISSED
                    </div>
                );
            case 'DUE':
            default:
                return (
                    <button
                        type="button"
                        onClick={() => handleOpenAdminister(dose)}
                        className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-300 text-xs px-2 py-1.5 rounded font-bold transition-colors shadow-sm"
                    >
                        ● DUE — Give
                    </button>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Inpatient eMAR Administration</h1>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                            24h Shift Matrix
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                        {wardName && ` • Ward: ${wardName}`}
                        {bedNumber && ` • Bed: ${bedNumber}`}
                        {encounterNumber && ` • IP#: ${encounterNumber}`}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-2.5 py-1.5 text-sm"
                    />
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

            {/* Shift Filter */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex space-x-2">
                    {(['ALL', 'MORNING', 'EVENING', 'NIGHT'] as const).map((shift) => (
                        <button
                            key={shift}
                            type="button"
                            onClick={() => setActiveShift(shift)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded ${
                                activeShift === shift
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {shift === 'ALL' ? 'Full 24 Hours' : `${shift} Shift`}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    Showing scheduled doses for <strong>{selectedDate}</strong>
                </div>
            </div>

            {/* eMAR Timeline Matrix */}
            <Card title="Medication Administration Schedule">
                {orders.length === 0 && doses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No active medication orders scheduled for this patient.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[220px]">
                                        Medication & Order
                                    </th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700">Route</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700">Freq</th>
                                    {TIME_SLOTS.map((slot) => (
                                        <th key={slot} className="px-2 py-2 text-center font-semibold text-gray-700 min-w-[100px] border-l border-gray-200">
                                            {slot}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((ord) => {
                                    const orderDoses = doses.filter(d => d.orderId === ord.id);
                                    return (
                                        <tr key={ord.id} className="hover:bg-gray-50/50">
                                            <td className="px-3 py-3">
                                                <div className="font-bold text-gray-900">{ord.drugName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {ord.dosage} {ord.unit} {ord.instructions ? `• ${ord.instructions}` : ''}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                                                    {ord.route}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center font-bold text-blue-700 text-xs">
                                                {ord.frequency}
                                            </td>
                                            {TIME_SLOTS.map((slot) => {
                                                const doseInSlot = orderDoses.find(d => d.scheduledTime === slot);
                                                return (
                                                    <td key={slot} className="px-2 py-3 text-center border-l border-gray-200 align-middle">
                                                        {doseInSlot ? (
                                                            <div className="space-y-1">
                                                                {getStatusBadge(doseInSlot)}
                                                                {doseInSlot.status === 'DUE' && (
                                                                    <div className="flex justify-center space-x-1 text-[10px]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDoseForException({ dose: doseInSlot, type: 'HELD' })}
                                                                            className="text-amber-700 hover:underline"
                                                                        >
                                                                            Hold
                                                                        </button>
                                                                        <span className="text-gray-300">|</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDoseForException({ dose: doseInSlot, type: 'REFUSED' })}
                                                                            className="text-red-700 hover:underline"
                                                                        >
                                                                            Refuse
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 text-xs">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: 5-Rights Administration Confirmation */}
            {doseToAdminister && (
                <Modal
                    isOpen={true}
                    onClose={() => setDoseToAdminister(null)}
                    title="Record Medication Administration"
                    width="max-w-lg"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setDoseToAdminister(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAdminister}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-semibold"
                            >
                                Confirm & Record Administration
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {/* Drug Banner */}
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Medication to Administer:</div>
                            <div className="text-base font-bold text-blue-950 mt-0.5">{doseToAdminister.drugName}</div>
                            <div className="text-xs text-blue-800 mt-0.5">
                                Dose: <strong>{doseToAdminister.dosage}</strong> • Route: <strong>{doseToAdminister.route}</strong> • Scheduled: <strong>{doseToAdminister.scheduledTime}</strong>
                            </div>
                        </div>

                        {adminError && (
                            <div className="bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-200 font-medium">
                                {adminError}
                            </div>
                        )}

                        {/* 5-Rights Checklist */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                                5-Rights Safety Verification Checklist:
                            </div>
                            <div className="space-y-2 text-sm text-gray-800">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verified5Rights.patient}
                                        onChange={(e) => setVerified5Rights(prev => ({ ...prev, patient: e.target.checked }))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span><strong>Right Patient:</strong> Verified wristband barcode / identity</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verified5Rights.drug}
                                        onChange={(e) => setVerified5Rights(prev => ({ ...prev, drug: e.target.checked }))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span><strong>Right Medication:</strong> Checked label & formulation</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verified5Rights.dose}
                                        onChange={(e) => setVerified5Rights(prev => ({ ...prev, dose: e.target.checked }))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span><strong>Right Dose:</strong> Confirmed strength & quantity</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verified5Rights.route}
                                        onChange={(e) => setVerified5Rights(prev => ({ ...prev, route: e.target.checked }))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span><strong>Right Route:</strong> Confirmed administration method ({doseToAdminister.route})</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verified5Rights.time}
                                        onChange={(e) => setVerified5Rights(prev => ({ ...prev, time: e.target.checked }))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span><strong>Right Time:</strong> Within scheduled administration window</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Administering Nurse Name / Signature
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm"
                                value={nurseName}
                                onChange={(e) => setNurseName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Clinical Notes (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm"
                                placeholder="e.g. Tolerated well, taken with apple sauce..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Held / Refused Reason Capture */}
            {doseForException && (
                <Modal
                    isOpen={true}
                    onClose={() => setDoseForException(null)}
                    title={`Record Dose as ${doseForException.type}`}
                    width="max-w-md"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setDoseForException(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmException}
                                className={`px-4 py-2 text-white rounded-md text-sm font-semibold ${
                                    doseForException.type === 'HELD' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Confirm {doseForException.type}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            Please provide a clinical justification for why <strong>{doseForException.dose.drugName}</strong> ({doseForException.dose.scheduledTime}) was {doseForException.type.toLowerCase()}.
                        </p>

                        {exceptionError && (
                            <div className="bg-red-50 text-red-700 p-2 rounded text-xs border border-red-200">
                                {exceptionError}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Reason Category <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={exceptionReasonCategory}
                                onChange={(v) => setExceptionReasonCategory(String(v))}
                                options={[
                                    { label: 'Patient NPO / Fasting for Procedure', value: 'PATIENT_NPO' },
                                    { label: 'Vital Sign Out of Range (Low BP / HR)', value: 'VITAL_SIGNS_CONTRAINDICATION' },
                                    { label: 'Patient Refused Medication', value: 'PATIENT_REFUSED' },
                                    { label: 'Patient Vomiting / Unable to Tolerate', value: 'PATIENT_NAUSEATED' },
                                    { label: 'Medication Unavailable / Pharmacy Delay', value: 'PHARMACY_UNAVAILABLE' },
                                    { label: 'Doctor Order Held / Discontinued', value: 'PHYSICIAN_HELD' },
                                    { label: 'Patient Off Ward / In Radiology', value: 'PATIENT_OFF_WARD' },
                                    { label: 'Other Reason', value: 'OTHER' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                                rows={2}
                                placeholder="Provide clinical details..."
                                value={customExceptionReason}
                                onChange={(e) => setCustomExceptionReason(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
