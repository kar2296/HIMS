import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export type IntakeRoute = 'ORAL' | 'IV_FLUID' | 'BLOOD' | 'NG_TUBE' | 'OTHER_IN';
export type OutputRoute = 'URINE' | 'DRAIN' | 'VOMITUS' | 'STOOL' | 'OTHER_OUT';

export interface FluidEntryItem {
    id?: number | string;
    patientId: number | string;
    encounterId?: number | string;
    recordedAt: string; // YYYY-MM-DD HH:mm
    type: 'INTAKE' | 'OUTPUT';
    route: IntakeRoute | OutputRoute;
    volumeMl: number;
    description: string;
    recordedBy?: string;
}

export interface WardFluidBalanceScreenProps {
    patientId: number | string;
    patientName?: string;
    wardName?: string;
    bedNumber?: string;
    encounterId?: number | string;
    entries?: FluidEntryItem[];
    onAddEntry?: (entry: Omit<FluidEntryItem, 'id'>) => void;
    onClose?: () => void;
}

export const WardFluidBalanceScreen: React.FC<WardFluidBalanceScreenProps> = ({
    patientId,
    patientName,
    wardName,
    bedNumber,
    encounterId,
    entries = [],
    onAddEntry,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [entryType, setEntryType] = useState<'INTAKE' | 'OUTPUT'>('INTAKE');
    const [intakeRoute, setIntakeRoute] = useState<IntakeRoute>('ORAL');
    const [outputRoute, setOutputRoute] = useState<OutputRoute>('URINE');
    const [volume, setVolume] = useState('');
    const [description, setDescription] = useState('');
    const [validationError, setValidationError] = useState('');

    const totals = useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;

        for (const e of entries) {
            if (e.type === 'INTAKE') {
                totalIn += e.volumeMl || 0;
            } else if (e.type === 'OUTPUT') {
                totalOut += e.volumeMl || 0;
            }
        }

        const net = totalIn - totalOut;
        return { totalIn, totalOut, net };
    }, [entries]);

    const handleSave = () => {
        const volNum = parseInt(volume, 10);
        if (!volNum || volNum <= 0) {
            setValidationError('Volume must be greater than 0 mL.');
            return;
        }

        const now = new Date();
        const recordedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (onAddEntry) {
            onAddEntry({
                patientId,
                encounterId,
                recordedAt,
                type: entryType,
                route: entryType === 'INTAKE' ? intakeRoute : outputRoute,
                volumeMl: volNum,
                description: description.trim() || (entryType === 'INTAKE' ? intakeRoute : outputRoute),
                recordedBy: 'Ward Nurse',
            });
        }

        setVolume('');
        setDescription('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Fluid Balance (Intake & Output Chart)</h1>
                        <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-0.5 rounded">
                            24h Cumulative
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
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Record I/O Entry</span>
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

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Intake */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Fluid Intake</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">
                        +{totals.totalIn} <span className="text-sm font-normal text-gray-500">mL</span>
                    </div>
                </div>

                {/* Total Output */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Fluid Output</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                        -{totals.totalOut} <span className="text-sm font-normal text-gray-500">mL</span>
                    </div>
                </div>

                {/* Net Fluid Balance */}
                <div className={`p-4 rounded-lg border shadow-sm ${
                    totals.net >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                }`}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">Net 24h Balance</div>
                    <div className={`text-2xl font-black mt-1 ${totals.net >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
                        {totals.net > 0 ? `+${totals.net}` : totals.net} <span className="text-sm font-normal">mL</span>
                    </div>
                </div>
            </div>

            {/* Log Table */}
            <Card title={`Fluid Intake / Output Entries (${entries.length})`}>
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No fluid balance entries recorded for this shift.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Route / Source</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Volume (mL)</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Recorded By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {entries.map((e, idx) => (
                                    <tr key={e.id || idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900 font-medium text-xs whitespace-nowrap">
                                            {e.recordedAt}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={e.type === 'INTAKE' ? 'info' : 'warning'}>
                                                {e.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                                            {e.route}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {e.description}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-bold ${
                                            e.type === 'INTAKE' ? 'text-blue-700' : 'text-amber-700'
                                        }`}>
                                            {e.type === 'INTAKE' ? `+${e.volumeMl}` : `-${e.volumeMl}`} mL
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {e.recordedBy || 'Nurse'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Record Entry */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Record Fluid Intake / Output"
                width="max-w-md"
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
                            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm font-semibold"
                        >
                            Save Entry
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    {validationError && (
                        <div className="bg-red-50 text-red-700 p-2 rounded text-xs border border-red-200">
                            {validationError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setEntryType('INTAKE')}
                            className={`p-2 rounded text-xs font-bold border transition-colors ${
                                entryType === 'INTAKE'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            + Intake
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryType('OUTPUT')}
                            className={`p-2 rounded text-xs font-bold border transition-colors ${
                                entryType === 'OUTPUT'
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            - Output
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            {entryType === 'INTAKE' ? 'Intake Route' : 'Output Source'}
                        </label>
                        {entryType === 'INTAKE' ? (
                            <Select
                                value={intakeRoute}
                                onChange={(v) => setIntakeRoute(v as any)}
                                options={[
                                    { label: 'Oral Fluids / Water', value: 'ORAL' },
                                    { label: 'Intravenous Fluids (IV)', value: 'IV_FLUID' },
                                    { label: 'Blood / PRBC / FFP', value: 'BLOOD' },
                                    { label: 'Enteral / NG Tube Feed', value: 'NG_TUBE' },
                                    { label: 'Other Intake', value: 'OTHER_IN' },
                                ]}
                            />
                        ) : (
                            <Select
                                value={outputRoute}
                                onChange={(v) => setOutputRoute(v as any)}
                                options={[
                                    { label: 'Urine (Foley / Void)', value: 'URINE' },
                                    { label: 'Surgical Drain / Jackson-Pratt', value: 'DRAIN' },
                                    { label: 'Vomitus / Emesis', value: 'VOMITUS' },
                                    { label: 'Stool / Diarrhea', value: 'STOOL' },
                                    { label: 'Other Output', value: 'OTHER_OUT' },
                                ]}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Volume (mL) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 250"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description / Solution
                        </label>
                        <Input
                            placeholder="e.g. Normal Saline 0.9%, Water, Clear Urine..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
