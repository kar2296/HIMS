import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export interface PrescriptionLineItem {
    id?: number | string;
    drugId: number | string;
    drugName: string;
    genericName?: string;
    dosage: string;
    unit: string;
    route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION' | 'RECTAL' | 'OPHTHALMIC';
    frequency: 'OD' | 'BD' | 'TID' | 'QID' | 'STAT' | 'PRN' | 'Q4H' | 'Q6H' | 'Q8H';
    durationDays: number;
    totalQuantity: number;
    instructions?: string;
    foodRelation?: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH' | 'NOT_APPLICABLE';
    isAllergyOverride?: boolean;
    allergyOverrideReason?: string;
    allergyOverrideBy?: string;
    allergyOverrideAt?: string;
}

export interface PatientAllergyRef {
    allergenName: string;
    severity?: string;
    reaction?: string;
}

export interface PrescriptionDetailRowProps {
    patientId: number | string;
    items?: PrescriptionLineItem[];
    patientAllergies?: PatientAllergyRef[];
    onAddItem?: (item: PrescriptionLineItem) => void;
    onRemoveItem?: (index: number) => void;
    readOnly?: boolean;
}

export const COMMON_DRUG_CATALOG = [
    { id: 101, name: 'Paracetamol 500mg Tab', generic: 'Paracetamol', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 102, name: 'Amoxicillin 500mg Cap', generic: 'Amoxicillin', defaultUnit: 'Capsule', defaultRoute: 'ORAL' },
    { id: 103, name: 'Augmentin 625mg Tab', generic: 'Amoxicillin + Clavulanate', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 104, name: 'Ciprofloxacin 500mg Tab', generic: 'Ciprofloxacin', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 105, name: 'Pantoprazole 40mg Tab', generic: 'Pantoprazole', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 106, name: 'Metformin 500mg Tab', generic: 'Metformin', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 107, name: 'Amlodipine 5mg Tab', generic: 'Amlodipine', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 108, name: 'Atorvastatin 10mg Tab', generic: 'Atorvastatin', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 109, name: 'Ceftriaxone 1g Inj', generic: 'Ceftriaxone', defaultUnit: 'Vial', defaultRoute: 'IV' },
    { id: 110, name: 'Tramadol 50mg Inj', generic: 'Tramadol', defaultUnit: 'Ampoule', defaultRoute: 'IM' },
    { id: 111, name: 'Aspirin 75mg Tab', generic: 'Aspirin', defaultUnit: 'Tablet', defaultRoute: 'ORAL' },
    { id: 112, name: 'Salbutamol Inhaler 100mcg', generic: 'Salbutamol', defaultUnit: 'Puff', defaultRoute: 'INHALATION' },
];

export const calculateQuantity = (frequency: string, durationDays: number, dosePerIntake: number | string = 1): number => {
    const parsedDose = typeof dosePerIntake === 'number' ? dosePerIntake : parseFloat(dosePerIntake);
    const doseNum = isNaN(parsedDose) || parsedDose <= 0 ? 1 : parsedDose;
    const days = Math.max(1, durationDays);

    let dosesPerDay = 1;
    switch (frequency) {
        case 'OD':
        case 'MANE':
        case 'NOCTE':
        case 'HS':
            dosesPerDay = 1;
            break;
        case 'BD':
        case 'BID':
        case 'Q12H':
            dosesPerDay = 2;
            break;
        case 'TID':
        case 'TDS':
        case 'Q8H':
            dosesPerDay = 3;
            break;
        case 'QID':
        case 'QDS':
        case 'Q6H':
            dosesPerDay = 4;
            break;
        case 'Q4H':
            dosesPerDay = 6;
            break;
        case 'STAT':
            return doseNum;
        case 'WEEKLY':
        case 'QW':
            return Math.max(1, Math.ceil(days / 7)) * doseNum;
        case 'PRN':
        default:
            dosesPerDay = 1;
            break;
    }
    return Math.ceil(dosesPerDay * days * doseNum);
};

export const checkDrugAllergyMatch = (drugName: string, genericName?: string, allergies: PatientAllergyRef[] = []): PatientAllergyRef | null => {
    if (!allergies || allergies.length === 0) return null;
    const drugLower = (drugName || '').toLowerCase();
    const genericLower = (genericName || '').toLowerCase();

    for (const allergy of allergies) {
        const allergenLower = (allergy.allergenName || '').toLowerCase().trim();
        if (!allergenLower) continue;

        // Check if drug or generic contains allergen or vice versa (e.g. "penicillin" in "amoxicillin" or exact match)
        if (
            drugLower.includes(allergenLower) ||
            allergenLower.includes(drugLower) ||
            (genericLower && (genericLower.includes(allergenLower) || allergenLower.includes(genericLower))) ||
            (allergenLower === 'penicillin' && (drugLower.includes('amox') || genericLower.includes('amox') || drugLower.includes('augmentin')))
        ) {
            return allergy;
        }
    }
    return null;
};

export const PrescriptionDetailRowComponent: React.FC<PrescriptionDetailRowProps> = ({
    patientId,
    items = [],
    patientAllergies = [],
    onAddItem,
    onRemoveItem,
    readOnly = false,
}) => {
    // Form fields
    const [selectedDrug, setSelectedDrug] = useState<any>(null);
    const [customDrugName, setCustomDrugName] = useState('');
    const [dosage, setDosage] = useState('1');
    const [unit, setUnit] = useState('Tablet');
    const [route, setRoute] = useState<'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION' | 'RECTAL' | 'OPHTHALMIC'>('ORAL');
    const [frequency, setFrequency] = useState<'OD' | 'BD' | 'TID' | 'QID' | 'STAT' | 'PRN' | 'Q4H' | 'Q6H' | 'Q8H'>('BD');
    const [durationDays, setDurationDays] = useState('5');
    const [foodRelation, setFoodRelation] = useState<'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH' | 'NOT_APPLICABLE'>('AFTER_FOOD');
    const [instructions, setInstructions] = useState('');

    // Allergy Override Modal State
    const [pendingItemWithAllergy, setPendingItemWithAllergy] = useState<{
        item: PrescriptionLineItem;
        matchedAllergy: PatientAllergyRef;
    } | null>(null);
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideError, setOverrideError] = useState('');

    const calculatedQty = useMemo(() => {
        const days = parseInt(durationDays, 10) || 1;
        return calculateQuantity(frequency, days, dosage);
    }, [frequency, durationDays, dosage]);

    const handleSelectDrug = (drug: typeof COMMON_DRUG_CATALOG[0]) => {
        setSelectedDrug(drug);
        setCustomDrugName(drug.name);
        setUnit(drug.defaultUnit);
        setRoute(drug.defaultRoute as any);
    };

    const handleAddDrug = () => {
        const drugName = customDrugName.trim() || (selectedDrug ? selectedDrug.name : '');
        if (!drugName) {
            alert('Please select or enter a drug name.');
            return;
        }

        const genericName = selectedDrug ? selectedDrug.generic : undefined;
        const matchedAllergy = checkDrugAllergyMatch(drugName, genericName, patientAllergies);

        const newItem: PrescriptionLineItem = {
            drugId: selectedDrug ? selectedDrug.id : Date.now(),
            drugName,
            genericName,
            dosage: dosage.trim() || '1',
            unit,
            route,
            frequency,
            durationDays: parseInt(durationDays, 10) || 1,
            totalQuantity: calculatedQty,
            foodRelation,
            instructions: instructions.trim() || undefined,
        };

        if (matchedAllergy) {
            // Must prompt for mandatory clinical override reason
            setPendingItemWithAllergy({ item: newItem, matchedAllergy });
            setOverrideReason('');
            setOverrideError('');
            return;
        }

        if (onAddItem) {
            onAddItem(newItem);
        }

        // Reset form
        setSelectedDrug(null);
        setCustomDrugName('');
        setInstructions('');
    };

    const handleConfirmAllergyOverride = () => {
        if (!overrideReason.trim()) {
            setOverrideError('Mandatory clinical reason is required to override allergy alert.');
            return;
        }

        if (!pendingItemWithAllergy || !onAddItem) return;

        const overriddenItem: PrescriptionLineItem = {
            ...pendingItemWithAllergy.item,
            isAllergyOverride: true,
            allergyOverrideReason: overrideReason.trim(),
            allergyOverrideBy: 'Attending Clinician',
            allergyOverrideAt: new Date().toISOString(),
        };

        onAddItem(overriddenItem);

        // Clear
        setPendingItemWithAllergy(null);
        setOverrideReason('');
        setOverrideError('');
        setSelectedDrug(null);
        setCustomDrugName('');
        setInstructions('');
    };

    return (
        <div className="space-y-4">
            {/* Quick Catalog Bar */}
            {!readOnly && (
                <Card title="Prescribe Medication / Drug Line Item">
                    <div className="space-y-3">
                        {/* Drug Catalog Chips */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quick Select Formulary:
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-gray-50 rounded border border-gray-200">
                                {COMMON_DRUG_CATALOG.map((d) => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => handleSelectDrug(d)}
                                        className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                                            selectedDrug?.id === d.id
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Line Item Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Medication Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Enter drug name or select from list..."
                                    value={customDrugName}
                                    onChange={(e) => setCustomDrugName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Dose & Unit
                                </label>
                                <div className="flex space-x-1">
                                    <Input
                                        value={dosage}
                                        onChange={(e) => setDosage(e.target.value)}
                                        placeholder="1"
                                    />
                                    <Select
                                        value={unit}
                                        onChange={(v) => setUnit(String(v))}
                                        options={[
                                            { label: 'Tab', value: 'Tablet' },
                                            { label: 'Cap', value: 'Capsule' },
                                            { label: 'ml', value: 'ml' },
                                            { label: 'mg', value: 'mg' },
                                            { label: 'Vial', value: 'Vial' },
                                            { label: 'Puff', value: 'Puff' },
                                            { label: 'Drop', value: 'Drop' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Route
                                </label>
                                <Select
                                    value={route}
                                    onChange={(v) => setRoute(v as any)}
                                    options={[
                                        { label: 'Oral (PO)', value: 'ORAL' },
                                        { label: 'Intravenous (IV)', value: 'IV' },
                                        { label: 'Intramuscular (IM)', value: 'IM' },
                                        { label: 'Subcutaneous (SC)', value: 'SC' },
                                        { label: 'Topical', value: 'TOPICAL' },
                                        { label: 'Inhalation', value: 'INHALATION' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Frequency
                                </label>
                                <Select
                                    value={frequency}
                                    onChange={(v) => setFrequency(v as any)}
                                    options={[
                                        { label: 'Once Daily (OD)', value: 'OD' },
                                        { label: 'Twice Daily (BD)', value: 'BD' },
                                        { label: 'Thrice Daily (TID)', value: 'TID' },
                                        { label: 'Four Times (QID)', value: 'QID' },
                                        { label: 'As Needed (PRN)', value: 'PRN' },
                                        { label: 'Immediate (STAT)', value: 'STAT' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Duration (Days)
                                </label>
                                <Input
                                    type="number"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(e.target.value)}
                                    placeholder="5"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Total Qty (Auto)
                                </label>
                                <div className="p-2 bg-gray-100 rounded text-sm font-bold text-gray-800 border border-gray-200">
                                    {calculatedQty} {unit}s
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Food Relation
                                </label>
                                <Select
                                    value={foodRelation}
                                    onChange={(v) => setFoodRelation(v as any)}
                                    options={[
                                        { label: 'After Food (PC)', value: 'AFTER_FOOD' },
                                        { label: 'Before Food (AC)', value: 'BEFORE_FOOD' },
                                        { label: 'With Food', value: 'WITH_FOOD' },
                                        { label: 'Empty Stomach', value: 'EMPTY_STOMACH' },
                                        { label: 'N/A', value: 'NOT_APPLICABLE' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex items-end space-x-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Special Instructions / Remarks
                                </label>
                                <Input
                                    placeholder="e.g. Take with a full glass of water, avoid alcohol..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDrug}
                                className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 text-sm shadow-sm whitespace-nowrap"
                            >
                                + Add Drug
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Prescribed Medications Table */}
            <Card title={`Prescribed Medications (${items.length} items)`}>
                {items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        No medications prescribed yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Drug Name</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Dose / Route</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Frequency</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Total Qty</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Instructions</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Allergy Status</th>
                                    {!readOnly && (
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-500 font-mono text-xs">{idx + 1}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-gray-900">{item.drugName}</div>
                                            {item.genericName && (
                                                <div className="text-xs text-gray-500">{item.genericName}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-gray-800">
                                            {item.dosage} {item.unit} • <span className="font-mono text-xs text-gray-600">{item.route}</span>
                                        </td>
                                        <td className="px-3 py-2 font-medium text-blue-700">
                                            {item.frequency}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {item.durationDays} days
                                        </td>
                                        <td className="px-3 py-2 font-bold text-gray-900">
                                            {item.totalQuantity}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 text-xs">
                                            <div>{item.foodRelation?.replace('_', ' ')}</div>
                                            {item.instructions && <div className="italic text-gray-500">{item.instructions}</div>}
                                        </td>
                                        <td className="px-3 py-2">
                                            {item.isAllergyOverride ? (
                                                <div title={`Reason: ${item.allergyOverrideReason || 'N/A'}`}>
                                                    <Badge tone="danger">Override Logged</Badge>
                                                </div>
                                            ) : (
                                                <Badge tone="success">Clear</Badge>
                                            )}
                                        </td>
                                        {!readOnly && (
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveItem && onRemoveItem(idx)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Mandatory Allergy Override Confirmation */}
            {pendingItemWithAllergy && (
                <Modal
                    isOpen={true}
                    onClose={() => setPendingItemWithAllergy(null)}
                    title="⚠️ Clinical Allergy Warning & Override"
                    width="max-w-lg"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setPendingItemWithAllergy(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                            >
                                Cancel & Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAllergyOverride}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold"
                            >
                                Confirm Override & Prescribe
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <div className="bg-red-50 border border-red-300 rounded p-3 text-red-800 text-sm">
                            <div className="font-bold flex items-center gap-1">
                                <span>⛔ Allergy Conflict Detected:</span>
                            </div>
                            <p className="mt-1">
                                The prescribed medication <strong>{pendingItemWithAllergy.item.drugName}</strong> conflicts with patient allergy:
                            </p>
                            <div className="mt-2 bg-white p-2 rounded border border-red-200 text-xs font-mono">
                                Allergen: <strong>{pendingItemWithAllergy.matchedAllergy.allergenName}</strong>
                                {pendingItemWithAllergy.matchedAllergy.severity && ` (Severity: ${pendingItemWithAllergy.matchedAllergy.severity})`}
                            </div>
                        </div>

                        {overrideError && (
                            <div className="bg-red-100 text-red-700 p-2 rounded text-xs border border-red-300">
                                {overrideError}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-800 mb-1">
                                Mandatory Clinical Justification / Override Reason <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-red-500"
                                rows={3}
                                placeholder="Explain clinical necessity, desensitization protocol, or alternative tolerability verification..."
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
