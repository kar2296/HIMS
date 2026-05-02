import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientCriticalOrderAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientOrderId: number;
    PatientOrderDetailId: number;
    PatientWorkOrderId: number;
    PatientWorkOrderDetailId: number;
    TestId: number;
    TestName: string;
    AnalyteId: number;
    AnalyteName: string;
    Resultvalue: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientCriticalOrderInstance extends Instance<PatientCriticalOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientCriticalOrderAttributes;
}
