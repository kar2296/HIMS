import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FamilyConditionAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ConditionTypeId: number;
    DiagnosisId: number;
    Code: string;
    DiagnosisName: string;
    Description: string;
    RelationshipId: number;
    ConditionDate: Date;
    ConditionStatusId: number;
    Comments: string;
    PerformedDate: Date;
    PerformedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FamilyConditionInstance extends Instance<FamilyConditionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FamilyConditionAttributes;
}
