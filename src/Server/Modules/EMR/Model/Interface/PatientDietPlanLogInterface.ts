import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDietPlanLogAttributes extends IAttributes {
    Id: number;
    PatientDietPlanId: number;
    Reason: string;
    PatientDietPlanStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDietPlanLogInstance extends Instance<PatientDietPlanLogAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDietPlanLogAttributes;
}
