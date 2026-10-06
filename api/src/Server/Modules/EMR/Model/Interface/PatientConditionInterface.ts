import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientConditionAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ConditionTypeId: number;
    DiagnosisId: number;
    Code: string;
    DiagnosisName: string;
    OtherDiagnosis: string;
    Description: string;
    ConditionDate: Date;
    ConditionStatusId: number;
    Comments: string;
    PerformedDate: Date;
    PerformedBy: number;
    IsPatientCondition: boolean;
    Status: number;
    BodySite: string;
    SideId: number;
    CategoryId: number;
    TypeId: number;
    GradeId: number;
    TestMasterPositionId: number;
    DiagnosisDetails: string;
    IsSNOMED: boolean;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientConditionInstance extends Instance<PatientConditionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientConditionAttributes;
}
