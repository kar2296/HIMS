import React from 'react';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export interface PatientIdentityBannerProps {
    patientId?: number | string;
    mrn?: string;
    patientName: string;
    gender?: string;
    dob?: string;
    age?: number | string;
    bloodGroup?: string;
    bedNumber?: string;
    wardName?: string;
    encounterNumber?: string;
    encounterType?: 'OP' | 'IP' | 'ER' | 'DAYCARE';
    attendingDoctor?: string;
    admissionDate?: string;
    allergies?: Array<{
        id?: number | string;
        allergenName: string;
        severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
        reaction?: string;
    }>;
    fallRisk?: boolean;
    infectionAlert?: string;
    vipStatus?: boolean;
    onAllergyClick?: () => void;
    onEditPatientClick?: () => void;
}

export const PatientIdentityBanner: React.FC<PatientIdentityBannerProps> = ({
    patientId,
    mrn,
    patientName,
    gender,
    age,
    bloodGroup,
    bedNumber,
    wardName,
    encounterNumber,
    encounterType = 'OP',
    attendingDoctor,
    allergies = [],
    fallRisk = false,
    infectionAlert,
    vipStatus = false,
    onAllergyClick,
    onEditPatientClick,
}) => {
    const hasSevereAllergy = allergies.some(
        a => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING'
    );

    const getEncounterTone = (type: string): 'info' | 'success' | 'warning' | 'neutral' => {
        switch (type) {
            case 'IP': return 'info';
            case 'ER': return 'warning';
            case 'OP': return 'success';
            default: return 'neutral';
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 mb-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Avatar & Primary Demographics */}
                <div className="flex items-center space-x-3">
                    <Avatar
                        name={patientName}
                        size="lg"
                    />
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-bold text-gray-900">{patientName}</h2>
                            {mrn && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                                    MRN: {mrn}
                                </span>
                            )}
                            <Badge tone={getEncounterTone(encounterType)}>
                                {encounterType}
                            </Badge>
                            {vipStatus && (
                                <Badge tone="warning">VIP</Badge>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-2 mt-0.5">
                            {gender && <span>{gender}</span>}
                            {gender && age && <span>•</span>}
                            {age && <span>{age} yrs</span>}
                            {bloodGroup && (
                                <>
                                    <span>•</span>
                                    <span className="font-semibold text-red-600">{bloodGroup}</span>
                                </>
                            )}
                            {wardName && (
                                <>
                                    <span>•</span>
                                    <span>Ward: {wardName} {bedNumber ? `(Bed: ${bedNumber})` : ''}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle: Clinical Metadata */}
                <div className="hidden md:flex flex-col text-sm text-gray-600 border-l border-gray-200 pl-4 space-y-0.5">
                    {encounterNumber && (
                        <div><span className="text-gray-400">Encounter:</span> <span className="font-medium text-gray-800">{encounterNumber}</span></div>
                    )}
                    {attendingDoctor && (
                        <div><span className="text-gray-400">Doctor:</span> <span className="font-medium text-gray-800">{attendingDoctor}</span></div>
                    )}
                </div>

                {/* Right: Clinical Safety Alerts & Allergies */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Allergy Alert Pill */}
                    {allergies.length > 0 ? (
                        <button
                            type="button"
                            onClick={onAllergyClick}
                            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                hasSevereAllergy
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            }`}
                            title={allergies.map(a => `${a.allergenName} (${a.severity || 'Unknown'})`).join(', ')}
                        >
                            <span className="mr-1.5">⚠️</span>
                            <span>{allergies.length} ALLERG{allergies.length > 1 ? 'IES' : 'Y'}</span>
                        </button>
                    ) : (
                        <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200 font-medium">
                            No Known Allergies (NKDA)
                        </span>
                    )}

                    {fallRisk && (
                        <Badge tone="warning">
                            Fall Risk
                        </Badge>
                    )}

                    {infectionAlert && (
                        <Badge tone="danger">
                            {infectionAlert}
                        </Badge>
                    )}

                    {onEditPatientClick && (
                        <button
                            type="button"
                            onClick={onEditPatientClick}
                            className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                        >
                            Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
