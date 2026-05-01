import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ImmunizationAttributes extends IAttributes {
    Id: number;
    ImmunizationName: string;
    Description: string;
    Instruction: string;
    FrequencyId: number;
    Duration: number;
    PeriodId: number;
    ConditionId: number;
    RouteId: number;
    ScheduleFlagId: number;
    ReferrenceLink: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ImmunizationInstance extends Instance<ImmunizationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ImmunizationAttributes;
}
