import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export type NoteFormat = 'SOAP' | 'DAR' | 'NARRATIVE';

export interface NursingNoteItem {
    id?: number | string;
    patientId: number | string;
    encounterId?: number | string;
    recordedAt: string; // YYYY-MM-DD HH:mm
    shift: 'MORNING' | 'EVENING' | 'NIGHT';
    format: NoteFormat;
    category: 'ROUTINE' | 'POST_OP' | 'ESCALATION' | 'WOUND_CARE' | 'DISCHARGE_PLANNING' | 'OTHER';
    nurseName: string;
    // SOAP
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    // DAR
    data?: string;
    action?: string;
    response?: string;
    // Narrative
    narrativeText?: string;
}

export interface WardNursingNotesScreenProps {
    patientId: number | string;
    patientName?: string;
    wardName?: string;
    bedNumber?: string;
    encounterId?: number | string;
    notes?: NursingNoteItem[];
    onAddNote?: (note: Omit<NursingNoteItem, 'id'>) => void;
    onClose?: () => void;
}

export const WardNursingNotesScreen: React.FC<WardNursingNotesScreenProps> = ({
    patientId,
    patientName,
    wardName,
    bedNumber,
    encounterId,
    notes = [],
    onAddNote,
    onClose,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [format, setFormat] = useState<NoteFormat>('SOAP');
    const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
    const [category, setCategory] = useState<'ROUTINE' | 'POST_OP' | 'ESCALATION' | 'WOUND_CARE' | 'DISCHARGE_PLANNING' | 'OTHER'>('ROUTINE');
    const [nurseName, setNurseName] = useState('Staff Nurse');

    // SOAP
    const [subj, setSubj] = useState('');
    const [obj, setObj] = useState('');
    const [assess, setAssess] = useState('');
    const [plan, setPlan] = useState('');

    // DAR
    const [darData, setDarData] = useState('');
    const [darAction, setDarAction] = useState('');
    const [darResp, setDarResp] = useState('');

    // Narrative
    const [narrative, setNarrative] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSave = () => {
        if (format === 'SOAP' && (!subj.trim() || !plan.trim())) {
            setValidationError('Subjective and Plan are required for SOAP notes.');
            return;
        }
        if (format === 'DAR' && (!darData.trim() || !darAction.trim())) {
            setValidationError('Data and Action are required for DAR notes.');
            return;
        }
        if (format === 'NARRATIVE' && !narrative.trim()) {
            setValidationError('Narrative note content is required.');
            return;
        }

        const now = new Date();
        const recordedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (onAddNote) {
            onAddNote({
                patientId,
                encounterId,
                recordedAt,
                shift,
                format,
                category,
                nurseName: nurseName.trim() || 'Staff Nurse',
                subjective: format === 'SOAP' ? subj.trim() : undefined,
                objective: format === 'SOAP' ? obj.trim() : undefined,
                assessment: format === 'SOAP' ? assess.trim() : undefined,
                plan: format === 'SOAP' ? plan.trim() : undefined,
                data: format === 'DAR' ? darData.trim() : undefined,
                action: format === 'DAR' ? darAction.trim() : undefined,
                response: format === 'DAR' ? darResp.trim() : undefined,
                narrativeText: format === 'NARRATIVE' ? narrative.trim() : undefined,
            });
        }

        // Reset
        setSubj('');
        setObj('');
        setAssess('');
        setPlan('');
        setDarData('');
        setDarAction('');
        setDarResp('');
        setNarrative('');
        setValidationError('');
        setIsAddModalOpen(false);
    };

    const getCategoryTone = (cat: string): 'danger' | 'warning' | 'info' | 'neutral' => {
        switch (cat) {
            case 'ESCALATION': return 'danger';
            case 'POST_OP': return 'warning';
            case 'WOUND_CARE': return 'info';
            default: return 'neutral';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Inpatient Nursing Progress Notes</h1>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                            SOAP / DAR
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
                        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 text-sm shadow-sm flex items-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Write Nursing Note</span>
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

            {/* Notes Timeline Stream */}
            <Card title={`Nursing Notes Log (${notes.length})`}>
                {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No nursing notes recorded yet for this encounter.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note, idx) => (
                            <div key={note.id || idx} className="p-4 rounded-lg border border-gray-200 bg-white space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Badge tone={getCategoryTone(note.category)}>
                                            {note.category.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded">
                                            {note.shift} SHIFT
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">
                                            {note.format} Format
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Recorded on <strong>{note.recordedAt}</strong> by <strong className="text-gray-800">{note.nurseName}</strong>
                                    </div>
                                </div>

                                {note.format === 'SOAP' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800 pt-1">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="text-xs font-bold text-gray-500 uppercase">S — Subjective:</div>
                                            <div>{note.subjective || '—'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="text-xs font-bold text-gray-500 uppercase">O — Objective:</div>
                                            <div>{note.objective || '—'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="text-xs font-bold text-gray-500 uppercase">A — Assessment:</div>
                                            <div>{note.assessment || '—'}</div>
                                        </div>
                                        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                                            <div className="text-xs font-bold text-emerald-800 uppercase">P — Nursing Plan:</div>
                                            <div className="text-emerald-950 font-medium">{note.plan || '—'}</div>
                                        </div>
                                    </div>
                                )}

                                {note.format === 'DAR' && (
                                    <div className="space-y-1.5 text-sm text-gray-800 pt-1">
                                        <div><strong className="text-gray-600">D (Data):</strong> {note.data}</div>
                                        <div><strong className="text-gray-600">A (Action):</strong> {note.action}</div>
                                        <div><strong className="text-gray-600">R (Response):</strong> {note.response}</div>
                                    </div>
                                )}

                                {note.format === 'NARRATIVE' && (
                                    <div className="text-sm text-gray-800 pt-1 whitespace-pre-wrap">
                                        {note.narrativeText}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Modal: Write Note */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Write Nursing Progress Note"
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
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-semibold"
                        >
                            Save Note
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

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Note Structure</label>
                            <Select
                                value={format}
                                onChange={(v) => setFormat(v as any)}
                                options={[
                                    { label: 'SOAP Note', value: 'SOAP' },
                                    { label: 'DAR Note', value: 'DAR' },
                                    { label: 'Free Narrative', value: 'NARRATIVE' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Shift</label>
                            <Select
                                value={shift}
                                onChange={(v) => setShift(v as any)}
                                options={[
                                    { label: 'Morning Shift', value: 'MORNING' },
                                    { label: 'Evening Shift', value: 'EVENING' },
                                    { label: 'Night Shift', value: 'NIGHT' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                            <Select
                                value={category}
                                onChange={(v) => setCategory(v as any)}
                                options={[
                                    { label: 'Routine Rounding', value: 'ROUTINE' },
                                    { label: 'Post-Op Monitoring', value: 'POST_OP' },
                                    { label: 'Escalation / Deterioration', value: 'ESCALATION' },
                                    { label: 'Wound Dressing Care', value: 'WOUND_CARE' },
                                    { label: 'Discharge Planning', value: 'DISCHARGE_PLANNING' },
                                ]}
                            />
                        </div>
                    </div>

                    {format === 'SOAP' && (
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    S — Subjective (Patient symptoms / complaints) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500"
                                    rows={2}
                                    placeholder="Patient states pain is 3/10, tolerated breakfast..."
                                    value={subj}
                                    onChange={(e) => setSubj(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    O — Objective (Observations, Vitals, Drainage)
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500"
                                    rows={2}
                                    placeholder="Vitals: BP 120/75, HR 72, SpO2 98%. Surgical dressing dry and intact..."
                                    value={obj}
                                    onChange={(e) => setObj(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    A — Assessment (Nursing evaluation)
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500"
                                    rows={2}
                                    placeholder="Recovering well post-op, pain controlled, mobility improving..."
                                    value={assess}
                                    onChange={(e) => setAssess(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    P — Plan (Nursing interventions & monitoring) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500"
                                    rows={2}
                                    placeholder="Continue Q4H vitals, assist with evening ambulation, administer IV meds on time..."
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {format === 'DAR' && (
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    D — Data <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    rows={2}
                                    placeholder="Observed data..."
                                    value={darData}
                                    onChange={(e) => setDarData(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    A — Action <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    rows={2}
                                    placeholder="Nursing action taken..."
                                    value={darAction}
                                    onChange={(e) => setDarAction(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    R — Response
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    rows={2}
                                    placeholder="Patient response to intervention..."
                                    value={darResp}
                                    onChange={(e) => setDarResp(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {format === 'NARRATIVE' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Narrative Note Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 text-sm"
                                rows={6}
                                placeholder="Enter free text nursing note..."
                                value={narrative}
                                onChange={(e) => setNarrative(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
