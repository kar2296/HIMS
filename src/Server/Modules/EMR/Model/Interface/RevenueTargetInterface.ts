import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RevenueTargetAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    YearId: number;
    MonthId: number;
    RevenueTarget: string;
    Description: string;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RevenueTargetInstance extends Instance<RevenueTargetAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RevenueTargetAttributes;
}
