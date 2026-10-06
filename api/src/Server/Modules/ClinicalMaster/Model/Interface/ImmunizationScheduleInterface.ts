import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ImmunizationScheduleAttributes extends IAttributes {
    Id: number;
    ScheduleId:number;
    ImmunizationId:number;
    ImmunizationName: string;
    ScheduleFlagId:number;
    RouteId:number;
    DosageId: number;
    Duration: number;
    PeriodId: number;
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

export interface ImmunizationScheduleInstance extends Instance<ImmunizationScheduleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ImmunizationScheduleAttributes;
}
