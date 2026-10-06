import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientProcedureAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ProcedureId: number;
    Code: string;
    ProcedureName: string;
    Description: string;
    ProcedureTypeId: number;
    Comments: string;
    PatientProcedureStatusId: number;
    PerformedDate: Date;
    PerformedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientProcedureInstance extends Instance<PatientProcedureAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientProcedureAttributes;
}
