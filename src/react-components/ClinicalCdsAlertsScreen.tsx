import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type ClinicianDecision = 'ACCEPTED_AND_CANCELLED' | 'OVERRIDDEN' | 'MODIFIED_DOSE' | 'ACKNOWLEDGED';

export interface CdsAlertEvent {
    id: number | string;
    timestamp: string;
    ruleType: 'DRUG_ALLERGY' | 'DRUG_DRUG_INTERACTION' | 'CRITICAL_VITALS' | 'DUPLICATE_ORDER' | 'MAX_DOSE_EXCEEDED';
    severity: AlertSeverity;
    alertMessage: string;
    patientId: number | string;
    patientName: string;
    clinicianName: string;
    decision: ClinicianDecision;
    overrideReason?: string;
}

export interface ClinicalCdsAlertsScreenProps {
    alerts?: CdsAlertEvent[];
    onClose?: () => void;
}

export const ClinicalCdsAlertsScreen: React.FC<ClinicalCdsAlertsScreenProps> = ({
    alerts = [],
    onClose,
}) => {
    const [selectedRule, setSelectedRule] = useState<string>('ALL');
    const [selectedAlertForDetails, setSelectedAlertForDetails] = useState<CdsAlertEvent | null>(null);

    // Analytics calculations
    const totalAlerts = alerts.length;
    const allergyAlerts = alerts.filter(a => a.ruleType === 'DRUG_ALLERGY');
    const allergyOverrides = allergyAlerts.filter(a => a.decision === 'OVERRIDDEN').length;
    const allergyOverrideRate = allergyAlerts.length > 0 ? Math.round((allergyOverrides / allergyAlerts.length) * 100) : 0;

    const criticalVitalsAlerts = alerts.filter(a => a.ruleType === 'CRITICAL_VITALS').length;
    const drugInteractionAlerts = alerts.filter(a => a.ruleType === 'DRUG_DRUG_INTERACTION').length;

    const getSeverityTone = (sev: AlertSeverity): 'danger' | 'warning' | 'info' | 'neutral' => {
        switch (sev) {
            case 'CRITICAL':
            case 'HIGH': return 'danger';
            case 'MODERATE': return 'warning';
            default: return 'info';
        }
    };

    const getDecisionTone = (dec: ClinicianDecision): 'success' | 'danger' | 'info' | 'neutral' => {
        switch (dec) {
            case 'ACCEPTED_AND_CANCELLED': return 'success';
            case 'OVERRIDDEN': return 'danger';
            case 'MODIFIED_DOSE': return 'info';
            default: return 'neutral';
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (selectedRule === 'ALL') return true;
        return a.ruleType === selectedRule;
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Clinical Decision Support (CDS) & Safety Analytics</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                            Safety Telemetry
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Real-time clinical safety rules monitoring, allergy warning override telemetry, and clinical decision analytics.
                    </p>
                </div>
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

            {/* Safety KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Total CDS Alerts Fired</div>
                    <div className="text-2xl font-black text-gray-900 mt-1">{totalAlerts}</div>
                    <div className="text-xs text-gray-400 mt-1">Across all clinical encounters</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Allergy Override Rate</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                        {allergyOverrideRate}%
                        <span className="text-xs font-normal text-gray-500 ml-1">({allergyOverrides}/{allergyAlerts.length})</span>
                    </div>
                    <div className="text-xs text-amber-700 mt-1">Mandatory clinical justification logged</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Critical Vitals Breaches</div>
                    <div className="text-2xl font-black text-red-600 mt-1">{criticalVitalsAlerts}</div>
                    <div className="text-xs text-red-700 mt-1">Immediate nurse notification triggered</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Drug-Drug Interactions</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">{drugInteractionAlerts}</div>
                    <div className="text-xs text-blue-700 mt-1">Formulary cross-checks active</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex space-x-2 overflow-x-auto">
                {(['ALL', 'DRUG_ALLERGY', 'DRUG_DRUG_INTERACTION', 'CRITICAL_VITALS', 'DUPLICATE_ORDER', 'MAX_DOSE_EXCEEDED'] as const).map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRule(r)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                            selectedRule === r
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {r.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Alert Event Stream */}
            <Card title={`Safety Alert Events (${filteredAlerts.length})`}>
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No alerts recorded for the selected safety rule.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Rule Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Alert Message</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Clinician Action</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAlerts.map((alt) => (
                                    <tr key={alt.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-nowrap">
                                            {alt.timestamp}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getSeverityTone(alt.severity)}>
                                                {alt.severity}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800 text-xs">
                                            {alt.ruleType.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 font-medium max-w-sm truncate" title={alt.alertMessage}>
                                            {alt.alertMessage}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {alt.patientName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getDecisionTone(alt.decision)}>
                                                {alt.decision.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAlertForDetails(alt)}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Alert Details */}
            {selectedAlertForDetails && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedAlertForDetails(null)}
                    title={`CDS Safety Alert #${selectedAlertForDetails.id}`}
                    width="max-w-md"
                    footer={
                        <button
                            type="button"
                            onClick={() => setSelectedAlertForDetails(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
                        >
                            Close
                        </button>
                    }
                >
                    <div className="space-y-3 text-sm">
                        <div className="bg-red-50 border border-red-200 p-3 rounded">
                            <div className="text-xs font-bold text-red-700 uppercase">Alert Message:</div>
                            <div className="text-red-950 font-bold mt-1">{selectedAlertForDetails.alertMessage}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-500">Patient:</span> <strong>{selectedAlertForDetails.patientName}</strong></div>
                            <div><span className="text-gray-500">Clinician:</span> <strong>{selectedAlertForDetails.clinicianName}</strong></div>
                            <div><span className="text-gray-500">Decision:</span> <strong>{selectedAlertForDetails.decision}</strong></div>
                            <div><span className="text-gray-500">Timestamp:</span> <strong>{selectedAlertForDetails.timestamp}</strong></div>
                        </div>

                        {selectedAlertForDetails.overrideReason && (
                            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded">
                                <div className="text-xs font-bold text-amber-900 uppercase">Clinician Override Justification:</div>
                                <div className="text-amber-950 mt-1">{selectedAlertForDetails.overrideReason}</div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};
