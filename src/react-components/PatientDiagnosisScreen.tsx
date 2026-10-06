import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export interface DiagnosisItem {
    id: number | string;
    patientId: number | string;
    encounterId?: number | string;
    icd10Code: string;
    description: string;
    diagnosisType: 'PROVISIONAL' | 'FINAL' | 'DIFFERENTIAL';
    status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'INACTIVE';
    severity?: 'MILD' | 'MODERATE' | 'SEVERE';
    isPrimary?: boolean;
    onsetDate?: string;
    resolvedDate?: string;
    diagnosedBy?: string;
    notes?: string;
    recordedDate: string;
}

export interface PatientDiagnosisScreenProps {
    patientId: number | string;
    patientName?: string;
    encounterId?: number | string;
    diagnoses?: DiagnosisItem[];
    onAddDiagnosis?: (diag: Omit<DiagnosisItem, 'id' | 'recordedDate'>) => void;
    onUpdateDiagnosis?: (id: number | string, patch: Partial<DiagnosisItem>) => void;
    onDeleteDiagnosis?: (id: number | string) => void;
    onClose?: () => void;
}

export const COMMON_ICD10_LIST = [
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
    { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
    { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
    { code: 'R07.9', description: 'Chest pain, unspecified' },
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
    { code: 'M54.5', description: 'Low back pain' },
    { code: 'K35.80', description: 'Unspecified acute appendicitis' },
    { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified' },
    { code: 'J18.9', description: 'Pneumonia, unspecified organism' },
    { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery' },
];

export const PatientDiagnosisScreen: React.FC<PatientDiagnosisScreenProps> = ({
    patientId,
    patientName,
    encounterId,
    diagnoses = [],
    onAddDiagnosis,
    onUpdateDiagnosis,
    onDeleteDiagnosis,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'CHRONIC' | 'RESOLVED'>('ALL');
    const [selectedDiagnosisForAction, setSelectedDiagnosisForAction] = useState<{
        id: number | string;
        action: 'RESOLVE' | 'DELETE';
    } | null>(null);

    // Form inputs
    const [icdCode, setIcdCode] = useState('');
    const [description, setDescription] = useState('');
    const [diagType, setDiagType] = useState<'PROVISIONAL' | 'FINAL' | 'DIFFERENTIAL'>('PROVISIONAL');
    const [status, setStatus] = useState<'ACTIVE' | 'CHRONIC'>('ACTIVE');
    const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MODERATE');
    const [isPrimary, setIsPrimary] = useState(false);
    const [onsetDate, setOnsetDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [notes, setNotes] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSelectIcd = (item: { code: string; description: string }) => {
        setIcdCode(item.code);
        setDescription(item.description);
    };

    const handleSave = () => {
        if (!description.trim()) {
            setValidationError('Diagnosis description or ICD-10 selection is required.');
            return;
        }

        if (onAddDiagnosis) {
            onAddDiagnosis({
                patientId,
                encounterId,
                icd10Code: icdCode.trim() || 'R69', // R69 = Illness, unspecified
                description: description.trim(),
                diagnosisType: diagType,
                status,
                severity,
                isPrimary,
                onsetDate,
                notes: notes.trim() || undefined,
            });
        }

        // Reset
        setIcdCode('');
        setDescription('');
        setDiagType('PROVISIONAL');
        setStatus('ACTIVE');
        setSeverity('MODERATE');
        setIsPrimary(false);
        setNotes('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    const getTypeTone = (t: string): 'info' | 'success' | 'warning' | 'neutral' => {
        switch (t) {
            case 'FINAL': return 'success';
            case 'PROVISIONAL': return 'info';
            case 'DIFFERENTIAL': return 'warning';
            default: return 'neutral';
        }
    };

    const getStatusTone = (s: string): 'success' | 'warning' | 'info' | 'neutral' => {
        switch (s) {
            case 'ACTIVE': return 'success';
            case 'CHRONIC': return 'warning';
            case 'RESOLVED': return 'neutral';
            case 'INACTIVE': return 'neutral';
            default: return 'neutral';
        }
    };

    const filteredDiagnoses = diagnoses.filter(d => {
        const matchesSearch =
            d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.icd10Code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'ALL' ||
            (filterStatus === 'ACTIVE' && (d.status === 'ACTIVE' || d.status === 'CHRONIC')) ||
            (filterStatus === 'CHRONIC' && d.status === 'CHRONIC') ||
            (filterStatus === 'RESOLVED' && d.status === 'RESOLVED');
        return matchesSearch && matchesStatus;
    });

    const activeCount = diagnoses.filter(d => d.status === 'ACTIVE' || d.status === 'CHRONIC').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Clinical Diagnoses & Problem List</h1>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                        {encounterId ? ` • Encounter: ${encounterId}` : ''}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Add Diagnosis</span>
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

            {/* Filter & Search Bar */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        All ({diagnoses.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus('ACTIVE')}
                        className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Active / Chronic ({activeCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus('RESOLVED')}
                        className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === 'RESOLVED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Resolved ({diagnoses.filter(d => d.status === 'RESOLVED').length})
                    </button>
                </div>

                <div className="w-64">
                    <Input
                        placeholder="Search ICD-10 code or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Diagnoses List Card */}
            <Card title={`Diagnoses List (${filteredDiagnoses.length})`}>
                {filteredDiagnoses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No diagnoses found matching the selected criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">ICD-10 Code</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Diagnosis Description</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Classification</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Onset Date</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDiagnoses.map((diag) => (
                                    <tr key={diag.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono font-bold text-blue-700">
                                            {diag.icd10Code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900">{diag.description}</span>
                                                {diag.isPrimary && (
                                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            {diag.notes && (
                                                <p className="text-xs text-gray-500 mt-0.5">{diag.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getTypeTone(diag.diagnosisType)}>
                                                {diag.diagnosisType}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getStatusTone(diag.status)}>
                                                {diag.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {diag.onsetDate || diag.recordedDate}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2 text-xs">
                                            {diag.status !== 'RESOLVED' && onUpdateDiagnosis && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDiagnosisForAction({ id: diag.id, action: 'RESOLVE' })}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
                                            {onDeleteDiagnosis && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDiagnosisForAction({ id: diag.id, action: 'DELETE' })}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Add Diagnosis */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Patient Diagnosis"
                width="max-w-2xl"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Save Diagnosis
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

                    {/* Quick ICD-10 Suggestions */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quick Select Common ICD-10 Diagnosis:
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-gray-50 rounded border border-gray-200">
                            {COMMON_ICD10_LIST.map((c) => (
                                <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => handleSelectIcd(c)}
                                    className="text-xs bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-2 py-1 rounded text-left transition-colors"
                                >
                                    <span className="font-mono font-bold text-blue-600 mr-1">{c.code}</span>
                                    <span>{c.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                ICD-10 Code
                            </label>
                            <Input
                                placeholder="e.g. E11.9"
                                value={icdCode}
                                onChange={(e) => setIcdCode(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Diagnosis Description <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Enter diagnosis text..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Classification <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={diagType}
                                onChange={(v) => setDiagType(v as any)}
                                options={[
                                    { label: 'Provisional (Working)', value: 'PROVISIONAL' },
                                    { label: 'Final (Confirmed)', value: 'FINAL' },
                                    { label: 'Differential', value: 'DIFFERENTIAL' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <Select
                                value={status}
                                onChange={(v) => setStatus(v as any)}
                                options={[
                                    { label: 'Active', value: 'ACTIVE' },
                                    { label: 'Chronic', value: 'CHRONIC' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Severity
                            </label>
                            <Select
                                value={severity}
                                onChange={(v) => setSeverity(v as any)}
                                options={[
                                    { label: 'Mild', value: 'MILD' },
                                    { label: 'Moderate', value: 'MODERATE' },
                                    { label: 'Severe', value: 'SEVERE' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Onset Date
                            </label>
                            <Input
                                type="date"
                                value={onsetDate}
                                onChange={(e) => setOnsetDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                        <input
                            id="primaryDiagCheckbox"
                            type="checkbox"
                            checked={isPrimary}
                            onChange={(e) => setIsPrimary(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="primaryDiagCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Mark as Primary Diagnosis for current encounter
                        </label>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Clinical Notes & Discussion
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500"
                            rows={2}
                            placeholder="Optional differential details or findings..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Action Confirmation Dialog */}
            {selectedDiagnosisForAction && (
                <ConfirmationDialog
                    isOpen={true}
                    title={selectedDiagnosisForAction.action === 'RESOLVE' ? 'Mark Diagnosis as Resolved' : 'Delete Diagnosis'}
                    message={
                        selectedDiagnosisForAction.action === 'RESOLVE'
                            ? 'Are you sure you want to mark this diagnosis as resolved?'
                            : 'Are you sure you want to delete this diagnosis record?'
                    }
                    yesLabel={selectedDiagnosisForAction.action === 'RESOLVE' ? 'Resolve' : 'Delete'}
                    noLabel="Cancel"
                    variant={selectedDiagnosisForAction.action === 'RESOLVE' ? 'warning' : 'danger'}
                    onConfirm={() => {
                        if (selectedDiagnosisForAction.action === 'RESOLVE' && onUpdateDiagnosis) {
                            const now = new Date();
                            const resolvedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            onUpdateDiagnosis(selectedDiagnosisForAction.id, { status: 'RESOLVED', resolvedDate });
                        } else if (selectedDiagnosisForAction.action === 'DELETE' && onDeleteDiagnosis) {
                            onDeleteDiagnosis(selectedDiagnosisForAction.id);
                        }
                        setSelectedDiagnosisForAction(null);
                    }}
                    onCancel={() => setSelectedDiagnosisForAction(null)}
                />
            )}
        </div>
    );
};
