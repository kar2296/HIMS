import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientAdviceMedicationAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    DrugId: number;
    DrugName: string;
    IsFreeText: boolean;
    Dosage: string;
    MorningFrequency: boolean;
    AfterNoonFrequency: boolean;
    EveningFrequency: boolean;
    NightFrequency: boolean;
    Duration: string;
    DurationPeriodId: number;
    DrugInstructionId: number;
    DietAdvice: string;
    Comments: string;
    FrequencyFreeText: string;
    Notes: string;
    Route: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAdviceMedicationInstance extends Instance<PatientAdviceMedicationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAdviceMedicationAttributes;
}
