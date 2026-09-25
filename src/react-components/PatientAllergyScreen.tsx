import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export interface AllergyItem {
    id: number | string;
    patientId: number | string;
    allergenType: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER';
    allergenName: string;
    reaction: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
    status: 'ACTIVE' | 'RESOLVED' | 'INACTIVE';
    recordedDate: string;
    recordedBy?: string;
    notes?: string;
}

export interface PatientAllergyScreenProps {
    patientId: number | string;
    patientName?: string;
    allergies?: AllergyItem[];
    onAddAllergy?: (allergy: Omit<AllergyItem, 'id' | 'recordedDate'>) => void;
    onUpdateStatus?: (id: number | string, status: 'ACTIVE' | 'RESOLVED' | 'INACTIVE') => void;
    onClose?: () => void;
}

export const PatientAllergyScreen: React.FC<PatientAllergyScreenProps> = ({
    patientId,
    patientName,
    allergies = [],
    onAddAllergy,
    onUpdateStatus,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAllergyForStatus, setSelectedAllergyForStatus] = useState<{
        id: number | string;
        targetStatus: 'RESOLVED' | 'INACTIVE';
    } | null>(null);

    // Form state
    const [allergenType, setAllergenType] = useState<'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER'>('DRUG');
    const [allergenName, setAllergenName] = useState('');
    const [reaction, setReaction] = useState('');
    const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING'>('MODERATE');
    const [notes, setNotes] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSave = () => {
        if (!allergenName.trim()) {
            setValidationError('Allergen name is required');
            return;
        }
        if (!reaction.trim()) {
            setValidationError('Clinical reaction is required');
            return;
        }

        if (onAddAllergy) {
            onAddAllergy({
                patientId,
                allergenType,
                allergenName: allergenName.trim(),
                reaction: reaction.trim(),
                severity,
                status: 'ACTIVE',
                notes: notes.trim(),
            });
        }

        // Reset form
        setAllergenName('');
        setReaction('');
        setNotes('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    const getSeverityTone = (sev: string): 'danger' | 'warning' | 'info' | 'neutral' => {
        switch (sev) {
            case 'LIFE_THREATENING':
            case 'SEVERE':
                return 'danger';
            case 'MODERATE':
                return 'warning';
            case 'MILD':
                return 'info';
            default:
                return 'neutral';
        }
    };

    const getStatusTone = (st: string): 'success' | 'warning' | 'neutral' => {
        switch (st) {
            case 'ACTIVE':
                return 'success';
            case 'RESOLVED':
                return 'neutral';
            case 'INACTIVE':
                return 'warning';
            default:
                return 'neutral';
        }
    };

    const activeAllergies = allergies.filter(a => a.status === 'ACTIVE');
    const pastAllergies = allergies.filter(a => a.status !== 'ACTIVE');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Allergies & Adverse Reactions
                    </h1>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Record Allergy</span>
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

            {/* Active Allergies Section */}
            <Card title={`Active Allergies (${activeAllergies.length})`}>
                {activeAllergies.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <p className="font-medium text-green-700">No active allergies recorded for this patient (NKDA).</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Allergen</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Reaction</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Recorded Date</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeAllergies.map((allergy) => (
                                    <tr key={allergy.id} className="hover:bg-red-50/30">
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                            {allergy.allergenName}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {allergy.allergenType}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {allergy.reaction}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getSeverityTone(allergy.severity)}>
                                                {allergy.severity}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {allergy.recordedDate}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            {onUpdateStatus && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAllergyForStatus({ id: allergy.id, targetStatus: 'RESOLVED' })}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAllergyForStatus({ id: allergy.id, targetStatus: 'INACTIVE' })}
                                                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                                    >
                                                        Inactivate
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Resolved / Inactive Allergies Section */}
            {pastAllergies.length > 0 && (
                <Card title={`Historical / Inactive Allergies (${pastAllergies.length})`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Allergen</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Reaction</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Recorded Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {pastAllergies.map((allergy) => (
                                    <tr key={allergy.id} className="opacity-75">
                                        <td className="px-4 py-2 font-medium text-gray-700">{allergy.allergenName}</td>
                                        <td className="px-4 py-2">{allergy.allergenType}</td>
                                        <td className="px-4 py-2">{allergy.reaction}</td>
                                        <td className="px-4 py-2">
                                            <Badge tone={getStatusTone(allergy.status)}>
                                                {allergy.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2 text-xs">{allergy.recordedDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Modal: Add Allergy */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Record Patient Allergy"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                            Save Allergy
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {validationError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                            {validationError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Allergy Type <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={allergenType}
                                onChange={(val) => setAllergenType(val as any)}
                                options={[
                                    { label: 'Drug / Medication', value: 'DRUG' },
                                    { label: 'Food', value: 'FOOD' },
                                    { label: 'Environmental', value: 'ENVIRONMENTAL' },
                                    { label: 'Other', value: 'OTHER' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Severity <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={severity}
                                onChange={(val) => setSeverity(val as any)}
                                options={[
                                    { label: 'Mild (Rash, Itching)', value: 'MILD' },
                                    { label: 'Moderate (Urticaria, Nausea)', value: 'MODERATE' },
                                    { label: 'Severe (Bronchospasm, Angioedema)', value: 'SEVERE' },
                                    { label: 'Life Threatening (Anaphylaxis)', value: 'LIFE_THREATENING' },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allergen / Drug Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Penicillin, Amoxicillin, Peanuts"
                            value={allergenName}
                            onChange={(e) => setAllergenName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clinical Reaction / Symptoms <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Skin rash, facial swelling, difficulty breathing"
                            value={reaction}
                            onChange={(e) => setReaction(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clinical Notes & Observations
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500"
                            rows={3}
                            placeholder="Optional notes or details on past exposure..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog: Status Change */}
            {selectedAllergyForStatus && (
                <ConfirmationDialog
                    isOpen={true}
                    title={`Mark Allergy as ${selectedAllergyForStatus.targetStatus}`}
                    message={`Are you sure you want to change this allergy status to ${selectedAllergyForStatus.targetStatus}?`}
                    yesLabel="Confirm"
                    noLabel="Cancel"
                    variant={selectedAllergyForStatus.targetStatus === 'RESOLVED' ? 'warning' : 'danger'}
                    onConfirm={() => {
                        if (onUpdateStatus && selectedAllergyForStatus) {
                            onUpdateStatus(selectedAllergyForStatus.id, selectedAllergyForStatus.targetStatus);
                        }
                        setSelectedAllergyForStatus(null);
                    }}
                    onCancel={() => setSelectedAllergyForStatus(null)}
                />
            )}
        </div>
    );
};
