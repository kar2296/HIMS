import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDiabetesChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    DiabetesChartDate: Date;
    DiabetesChartTime: string;
    Method: string;
    InsulinDoseGiven: string;
    BloodSugarFasting: string;
    BloodSugarPP: string;
    BloodSugarRandom: string;
    UrineSugarFasting: string;
    UrineSugarPP: string;
    UrineSugarRandom: string;
    HBA1C: string;
    EAG: string;
    MicroAlbumin: string;
    Signature: string;
    Comments: string;
    EnteredBy: string;
    CheckedBy: string;
    TimePeriodId: number;
    DoctorId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDiabetesChartInstance extends Instance<PatientDiabetesChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDiabetesChartAttributes;
}
