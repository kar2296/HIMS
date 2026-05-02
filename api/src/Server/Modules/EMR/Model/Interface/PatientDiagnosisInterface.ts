import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDiagnosisAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ConditionTypeId: number;
    DiagnosisTypeId: number;
    DiagnosisId: number;
    Code: string;
    DiagnosisName: string;
    OtherDiagnosisName: string;
    Description: string;
    Date: Date;
    DiagnosisStatusId: number;
    ConditionStatusId: number;
    Comments: string;
    DOA: Date;
    DOD: Date;
    PerformedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDiagnosisInstance extends Instance<PatientDiagnosisAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDiagnosisAttributes;
}
