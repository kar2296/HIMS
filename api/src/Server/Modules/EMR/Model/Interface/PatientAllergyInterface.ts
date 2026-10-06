import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientAllergyAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    AllergyId: number;
    AllergyName: string;
    AllergyTypeId: number;
    Description: string;
    Symptom: string;
    ADRStatus: string;
    ADRScoreId: number;
    StartDate: Date;
    EndDate: Date;
    AllergySeverityId: number;
    AllergySource: string;
    Comments: string;
    PatientAllergyStatusId: number;
    PerformedDate: Date;
    PerformedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAllergyInstance extends Instance<PatientAllergyAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAllergyAttributes;
}
