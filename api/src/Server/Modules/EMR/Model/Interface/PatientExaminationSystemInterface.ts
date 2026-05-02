import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientExaminationSystemAttributes extends IAttributes {
    Id: number;
    ExaminationId:number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    SystemId: number;
    System: string;
    FindingsId: number;
    LeftEye: string;
    RightEye: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientExaminationSystemInstance extends Instance<PatientExaminationSystemAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientExaminationSystemAttributes;
}
