import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientClinicalNotesAttributes extends IAttributes {
    Id: number;
    PatientClinicalNotesTypeId: number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    IllnessTypeId: number;
    ChiefComplaints: string;
    DurationCount: number;
    IllnessDurationTypeId: number;
    Examinations: string;
    TreatmentComments: string;
    Location: string;
    Quality: string;
    Severity: string;
    Duration: string;
    Timing: string;
    Context: string;
    ModifyingFactors: string;
    AdditionalNotes: string;
    OtherComplaints: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientClinicalNotesInstance extends Instance<PatientClinicalNotesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientClinicalNotesAttributes;
}
