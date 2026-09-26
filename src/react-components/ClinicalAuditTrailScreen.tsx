import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export type AuditEventType =
    | 'VIEW'
    | 'MODIFY'
    | 'ALLERGY_OVERRIDE'
    | 'NOTE_AMENDMENT'
    | 'CONCURRENCY_CONFLICT'
    | 'BREAK_GLASS';

export interface AuditLogEntry {
    id: number | string;
    timestamp: string; // ISO
    eventType: AuditEventType;
    userId: string | number;
    userName: string;
    userRole: string;
    patientId: number | string;
    patientName: string;
    mrn?: string;
    actionSummary: string;
    ipAddress?: string;
    justification?: string;
    oldValue?: any;
    newValue?: any;
}

export interface ClinicalAuditTrailScreenProps {
    logs?: AuditLogEntry[];
    onExportAudit?: () => void;
    onClose?: () => void;
}

export const ClinicalAuditTrailScreen: React.FC<ClinicalAuditTrailScreenProps> = ({
    logs = [],
    onExportAudit,
    onClose,
}) => {
    const [selectedEventType, setSelectedEventType] = useState<'ALL' | AuditEventType>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLogEntry | null>(null);

    const getEventTone = (type: AuditEventType): 'danger' | 'warning' | 'info' | 'neutral' => {
        switch (type) {
            case 'BREAK_GLASS':
            case 'ALLERGY_OVERRIDE':
                return 'danger';
            case 'CONCURRENCY_CONFLICT':
            case 'NOTE_AMENDMENT':
                return 'warning';
            case 'MODIFY':
                return 'info';
            case 'VIEW':
            default:
                return 'neutral';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesType = selectedEventType === 'ALL' || log.eventType === selectedEventType;
        const matchesSearch =
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actionSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.mrn && log.mrn.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const breakGlassCount = logs.filter(l => l.eventType === 'BREAK_GLASS').length;
    const allergyOverrideCount = logs.filter(l => l.eventType === 'ALLERGY_OVERRIDE').length;
    const conflictCount = logs.filter(l => l.eventType === 'CONCURRENCY_CONFLICT').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Clinical Audit Trail & Access Logs</h1>
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded">
                            HIPAA Compliant Log
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Immutable record of all patient chart access, clinical notes amendments, allergy overrides, and security events.
                    </p>
                </div>
                <div className="flex space-x-2">
                    {onExportAudit && (
                        <button
                            type="button"
                            onClick={onExportAudit}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                        >
                            Export Audit CSV
                        </button>
                    )}
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Total Events</div>
                    <div className="text-xl font-bold text-gray-900 mt-0.5">{logs.length}</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-xs text-red-700 font-semibold uppercase">Emergency Break-Glass</div>
                    <div className="text-xl font-bold text-red-900 mt-0.5">{breakGlassCount}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="text-xs text-amber-700 font-semibold uppercase">Allergy Overrides</div>
                    <div className="text-xl font-bold text-amber-900 mt-0.5">{allergyOverrideCount}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="text-xs text-yellow-700 font-semibold uppercase">Concurrency Conflicts (409)</div>
                    <div className="text-xl font-bold text-yellow-900 mt-0.5">{conflictCount}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                    {(['ALL', 'BREAK_GLASS', 'ALLERGY_OVERRIDE', 'NOTE_AMENDMENT', 'CONCURRENCY_CONFLICT', 'MODIFY', 'VIEW'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedEventType(type)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                                selectedEventType === type
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {type.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                <div className="w-64">
                    <Input
                        placeholder="Search clinician, patient, MRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Audit Log Table */}
            <Card title={`Audit Events (${filteredLogs.length})`}>
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No audit records found matching the filter criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Event Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Clinician / User</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Action Summary</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Audit Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className={`hover:bg-gray-50 ${log.eventType === 'BREAK_GLASS' ? 'bg-red-50/40' : ''}`}>
                                        <td className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={getEventTone(log.eventType)}>
                                                {log.eventType.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">{log.userName}</div>
                                            <div className="text-xs text-gray-500">{log.userRole}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{log.patientName}</div>
                                            {log.mrn && <div className="text-xs font-mono text-gray-500">{log.mrn}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 max-w-sm truncate" title={log.actionSummary}>
                                            {log.actionSummary}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLogForDetails(log)}
                                                className="text-purple-600 hover:text-purple-800 text-xs font-semibold"
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal: Audit Event Details */}
            {selectedLogForDetails && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedLogForDetails(null)}
                    title={`Audit Log Record #${selectedLogForDetails.id}`}
                    width="max-w-xl"
                    footer={
                        <button
                            type="button"
                            onClick={() => setSelectedLogForDetails(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
                        >
                            Close
                        </button>
                    }
                >
                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                            <div><span className="text-gray-500">Event Type:</span> <strong>{selectedLogForDetails.eventType}</strong></div>
                            <div><span className="text-gray-500">Timestamp:</span> <strong>{selectedLogForDetails.timestamp}</strong></div>
                            <div><span className="text-gray-500">User:</span> <strong>{selectedLogForDetails.userName} ({selectedLogForDetails.userRole})</strong></div>
                            <div><span className="text-gray-500">IP Address:</span> <span className="font-mono">{selectedLogForDetails.ipAddress || '127.0.0.1'}</span></div>
                            <div><span className="text-gray-500">Patient:</span> <strong>{selectedLogForDetails.patientName}</strong></div>
                            <div><span className="text-gray-500">MRN:</span> <span className="font-mono">{selectedLogForDetails.mrn || 'N/A'}</span></div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-gray-700 uppercase">Action Description:</div>
                            <div className="text-gray-900 mt-1 bg-white p-2.5 rounded border border-gray-200">
                                {selectedLogForDetails.actionSummary}
                            </div>
                        </div>

                        {selectedLogForDetails.justification && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                                <div className="text-xs font-bold text-amber-900 uppercase">Mandatory Justification / Clinical Reason:</div>
                                <div className="text-amber-950 mt-1">{selectedLogForDetails.justification}</div>
                            </div>
                        )}

                        {selectedLogForDetails.oldValue && selectedLogForDetails.newValue && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-red-50 p-2 rounded border border-red-200">
                                    <div className="font-bold text-red-800 mb-1">Previous State (Before):</div>
                                    <pre className="text-red-900 whitespace-pre-wrap">{JSON.stringify(selectedLogForDetails.oldValue, null, 2)}</pre>
                                </div>
                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                    <div className="font-bold text-green-800 mb-1">Updated State (After):</div>
                                    <pre className="text-green-900 whitespace-pre-wrap">{JSON.stringify(selectedLogForDetails.newValue, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};
