import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientComplaintsAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    EncounterTypeId: number;
    SymptomId: number;
    LDuration: string;
    LDurationPeriodId: number;
    RDuration: string;
    RDurationPeriodId: number;
    LOnset: string;
    ROnset: string;
    LProgression: string;
    RProgression: string;
    LTreatmentTaken: string;
    RTreatmentTaken: string;
    LSeverityId: string;
    RSeverityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientComplaintsInstance extends Instance<PatientComplaintsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientComplaintsAttributes;
}
