import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export interface VitalSignReading {
    id?: number | string;
    patientId: number | string;
    encounterId?: number | string;
    recordedAt: string; // ISO or YYYY-MM-DD HH:mm
    recordedBy?: string;
    temperature?: number; // Fahrenheit
    systolicBp?: number; // mmHg
    diastolicBp?: number; // mmHg
    heartRate?: number; // bpm
    respiratoryRate?: number; // breaths/min
    spO2?: number; // percentage
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    bloodGlucose?: number; // mg/dL
    painScore?: number; // 0 - 10
    notes?: string;
}

export interface PatientVitalScreenProps {
    patientId: number | string;
    patientName?: string;
    vitalsHistory?: VitalSignReading[];
    onRecordVitals?: (vital: Omit<VitalSignReading, 'id'>) => void;
    onClose?: () => void;
}

export const VITAL_RANGES = {
    systolicBp: { min: 90, max: 140, label: 'Systolic BP', unit: 'mmHg' },
    diastolicBp: { min: 60, max: 90, label: 'Diastolic BP', unit: 'mmHg' },
    heartRate: { min: 60, max: 100, label: 'Heart Rate', unit: 'bpm' },
    respiratoryRate: { min: 12, max: 20, label: 'Resp Rate', unit: '/min' },
    spO2: { min: 95, max: 100, label: 'SpO2', unit: '%' },
    temperature: { min: 97.0, max: 99.5, label: 'Temperature', unit: '°F' },
    bloodGlucose: { min: 70, max: 140, label: 'Blood Glucose', unit: 'mg/dL' },
};

export const calculateBmi = (weightKg?: number, heightCm?: number): number | undefined => {
    if (!weightKg || !heightCm || heightCm <= 0) return undefined;
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBmiCategory = (bmi?: number): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } => {
    if (!bmi) return { label: 'Unknown', tone: 'neutral' };
    if (bmi < 18.5) return { label: 'Underweight', tone: 'warning' };
    if (bmi < 25.0) return { label: 'Normal', tone: 'success' };
    if (bmi < 30.0) return { label: 'Overweight', tone: 'warning' };
    return { label: 'Obese', tone: 'danger' };
};

export const PatientVitalScreen: React.FC<PatientVitalScreenProps> = ({
    patientId,
    patientName,
    vitalsHistory = [],
    onRecordVitals,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'trends'>('table');

    // Form inputs
    const [temp, setTemp] = useState('');
    const [sys, setSys] = useState('');
    const [dia, setDia] = useState('');
    const [hr, setHr] = useState('');
    const [rr, setRr] = useState('');
    const [spo2, setSpo2] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [glucose, setGlucose] = useState('');
    const [pain, setPain] = useState('0');
    const [notes, setNotes] = useState('');
    const [validationError, setValidationError] = useState('');

    const calculatedBmi = useMemo(() => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        return calculateBmi(w, h);
    }, [weight, height]);

    const latestVitals = vitalsHistory.length > 0 ? vitalsHistory[0] : null;

    const handleSave = () => {
        if (!temp && !sys && !dia && !hr && !spo2 && !weight) {
            setValidationError('Please record at least one vital sign reading.');
            return;
        }

        const now = new Date();
        const recordedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (onRecordVitals) {
            onRecordVitals({
                patientId,
                recordedAt,
                temperature: temp ? parseFloat(temp) : undefined,
                systolicBp: sys ? parseInt(sys, 10) : undefined,
                diastolicBp: dia ? parseInt(dia, 10) : undefined,
                heartRate: hr ? parseInt(hr, 10) : undefined,
                respiratoryRate: rr ? parseInt(rr, 10) : undefined,
                spO2: spo2 ? parseInt(spo2, 10) : undefined,
                heightCm: height ? parseFloat(height) : undefined,
                weightKg: weight ? parseFloat(weight) : undefined,
                bmi: calculatedBmi,
                bloodGlucose: glucose ? parseFloat(glucose) : undefined,
                painScore: pain ? parseInt(pain, 10) : undefined,
                notes: notes.trim() || undefined,
            });
        }

        // Reset
        setTemp('');
        setSys('');
        setDia('');
        setHr('');
        setRr('');
        setSpo2('');
        setHeight('');
        setWeight('');
        setGlucose('');
        setPain('0');
        setNotes('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    const isAbnormal = (val?: number, range?: { min: number; max: number }): boolean => {
        if (val === undefined || range === undefined) return false;
        return val < range.min || val > range.max;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Patient Vital Signs & Biometrics</h1>
                    <p className="text-sm text-gray-500">
                        {patientName ? `Patient: ${patientName}` : `Patient ID: ${patientId}`}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="border border-gray-300 rounded-md p-0.5 flex bg-gray-50">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 text-xs font-medium rounded ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                        >
                            Log Table
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('trends')}
                            className={`px-3 py-1.5 text-xs font-medium rounded ${viewMode === 'trends' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                        >
                            Trend Charts
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm shadow-sm"
                    >
                        + Record Vitals
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

            {/* Quick Summary Cards (Latest Reading) */}
            {latestVitals && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {/* BP */}
                    <div className={`p-3 rounded-lg border ${
                        isAbnormal(latestVitals.systolicBp, VITAL_RANGES.systolicBp) || isAbnormal(latestVitals.diastolicBp, VITAL_RANGES.diastolicBp)
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-xs text-gray-500 font-medium">Blood Pressure</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {latestVitals.systolicBp && latestVitals.diastolicBp
                                ? `${latestVitals.systolicBp}/${latestVitals.diastolicBp}`
                                : '—'}
                            <span className="text-xs font-normal text-gray-500 ml-1">mmHg</span>
                        </div>
                    </div>

                    {/* Heart Rate */}
                    <div className={`p-3 rounded-lg border ${
                        isAbnormal(latestVitals.heartRate, VITAL_RANGES.heartRate)
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-xs text-gray-500 font-medium">Heart Rate / Pulse</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {latestVitals.heartRate ?? '—'}
                            <span className="text-xs font-normal text-gray-500 ml-1">bpm</span>
                        </div>
                    </div>

                    {/* SpO2 */}
                    <div className={`p-3 rounded-lg border ${
                        isAbnormal(latestVitals.spO2, VITAL_RANGES.spO2)
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-xs text-gray-500 font-medium">Oxygen Sat (SpO2)</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {latestVitals.spO2 ? `${latestVitals.spO2}%` : '—'}
                        </div>
                    </div>

                    {/* Temp */}
                    <div className={`p-3 rounded-lg border ${
                        isAbnormal(latestVitals.temperature, VITAL_RANGES.temperature)
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-xs text-gray-500 font-medium">Temperature</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {latestVitals.temperature ? `${latestVitals.temperature}°F` : '—'}
                        </div>
                    </div>

                    {/* Resp Rate */}
                    <div className={`p-3 rounded-lg border ${
                        isAbnormal(latestVitals.respiratoryRate, VITAL_RANGES.respiratoryRate)
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-xs text-gray-500 font-medium">Resp Rate</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {latestVitals.respiratoryRate ?? '—'}
                            <span className="text-xs font-normal text-gray-500 ml-1">/min</span>
                        </div>
                    </div>

                    {/* BMI */}
                    <div className="p-3 rounded-lg border bg-white border-gray-200">
                        <div className="text-xs text-gray-500 font-medium">BMI</div>
                        <div className="text-lg font-bold text-gray-900 mt-1 flex items-center justify-between">
                            <span>{latestVitals.bmi ?? '—'}</span>
                            {latestVitals.bmi && (
                                <Badge tone={getBmiCategory(latestVitals.bmi).tone}>
                                    {getBmiCategory(latestVitals.bmi).label}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Mode: Table or Trends */}
            {viewMode === 'table' ? (
                <Card title={`Vitals Log History (${vitalsHistory.length} readings)`}>
                    {vitalsHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No vitals recorded yet. Click &quot;Record Vitals&quot; to add the first measurement.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Date/Time</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">BP (mmHg)</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Pulse</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">SpO2</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Temp</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Resp</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">BMI</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Glucose</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Pain</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vitalsHistory.map((v, idx) => (
                                        <tr key={v.id || idx} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-900">{v.recordedAt}</td>
                                            <td className={`px-3 py-2 font-mono ${
                                                isAbnormal(v.systolicBp, VITAL_RANGES.systolicBp) || isAbnormal(v.diastolicBp, VITAL_RANGES.diastolicBp)
                                                    ? 'text-red-600 font-bold'
                                                    : 'text-gray-800'
                                            }`}>
                                                {v.systolicBp && v.diastolicBp ? `${v.systolicBp}/${v.diastolicBp}` : '—'}
                                            </td>
                                            <td className={`px-3 py-2 ${isAbnormal(v.heartRate, VITAL_RANGES.heartRate) ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                                                {v.heartRate ?? '—'}
                                            </td>
                                            <td className={`px-3 py-2 ${isAbnormal(v.spO2, VITAL_RANGES.spO2) ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                                                {v.spO2 ? `${v.spO2}%` : '—'}
                                            </td>
                                            <td className={`px-3 py-2 ${isAbnormal(v.temperature, VITAL_RANGES.temperature) ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                                                {v.temperature ? `${v.temperature}°F` : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-800">{v.respiratoryRate ?? '—'}</td>
                                            <td className="px-3 py-2 text-gray-800">{v.bmi ?? '—'}</td>
                                            <td className={`px-3 py-2 ${isAbnormal(v.bloodGlucose, VITAL_RANGES.bloodGlucose) ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                                                {v.bloodGlucose ?? '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-800">{v.painScore !== undefined ? `${v.painScore}/10` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            ) : (
                /* Interactive Multi-Point Trend Chart */
                <Card title="Clinical Trend Visualizer">
                    <div className="p-4 space-y-6">
                        {/* SpO2 Trend */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Oxygen Saturation (SpO2) Trajectory</h3>
                            <div className="flex items-end space-x-3 h-32 bg-gray-50 p-4 rounded border border-gray-200">
                                {vitalsHistory.slice(0, 10).reverse().map((v, i) => {
                                    const val = v.spO2 || 0;
                                    const heightPct = Math.max(10, Math.min(100, (val - 80) * 5));
                                    const isLow = val < 95;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                            <span className={`text-xs font-bold ${isLow ? 'text-red-600' : 'text-green-700'}`}>{val}%</span>
                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-t transition-all ${isLow ? 'bg-red-500' : 'bg-blue-500'}`}
                                            />
                                            <span className="text-[10px] text-gray-500 truncate max-w-[50px]">{v.recordedAt.split(' ')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pulse / Heart Rate Trend */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Heart Rate / Pulse (bpm) Trajectory</h3>
                            <div className="flex items-end space-x-3 h-32 bg-gray-50 p-4 rounded border border-gray-200">
                                {vitalsHistory.slice(0, 10).reverse().map((v, i) => {
                                    const val = v.heartRate || 0;
                                    const heightPct = Math.max(10, Math.min(100, (val / 160) * 100));
                                    const abnormal = val < 60 || val > 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                            <span className={`text-xs font-bold ${abnormal ? 'text-red-600' : 'text-gray-800'}`}>{val}</span>
                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-t transition-all ${abnormal ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                            <span className="text-[10px] text-gray-500 truncate max-w-[50px]">{v.recordedAt.split(' ')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Modal: Record Vitals */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Record Patient Vital Signs"
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
                            Save Vitals
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Temp (°F)
                            </label>
                            <Input
                                type="number"
                                placeholder="98.6"
                                value={temp}
                                onChange={(e) => setTemp(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Systolic BP (mmHg)
                            </label>
                            <Input
                                type="number"
                                placeholder="120"
                                value={sys}
                                onChange={(e) => setSys(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Diastolic BP (mmHg)
                            </label>
                            <Input
                                type="number"
                                placeholder="80"
                                value={dia}
                                onChange={(e) => setDia(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Heart Rate (bpm)
                            </label>
                            <Input
                                type="number"
                                placeholder="72"
                                value={hr}
                                onChange={(e) => setHr(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Resp Rate (/min)
                            </label>
                            <Input
                                type="number"
                                placeholder="16"
                                value={rr}
                                onChange={(e) => setRr(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                SpO2 (%)
                            </label>
                            <Input
                                type="number"
                                placeholder="98"
                                value={spo2}
                                onChange={(e) => setSpo2(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Height (cm)
                            </label>
                            <Input
                                type="number"
                                placeholder="170"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Weight (kg)
                            </label>
                            <Input
                                type="number"
                                placeholder="70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Blood Glucose (mg/dL)
                            </label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={glucose}
                                onChange={(e) => setGlucose(e.target.value)}
                            />
                        </div>
                    </div>

                    {calculatedBmi && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm flex items-center justify-between">
                            <span className="text-blue-900 font-medium">Calculated BMI: <strong>{calculatedBmi}</strong></span>
                            <Badge tone={getBmiCategory(calculatedBmi).tone}>
                                {getBmiCategory(calculatedBmi).label}
                            </Badge>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Clinical Notes
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500"
                            rows={2}
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
