import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RevenueAttributes extends IAttributes {
    Id: number;
    RevenueDate: Date;
    MISSubgroupId: number;
    MisSubGroup: string;
    BillType: string;
    FacilityId: number;
    ActualAmount: number;
    MonthToDay: number;
    CurrentYearRevenue: number;
    TotalCurrentYearRevenue: number;
    PreviousYearRevenue: number;
    PreviousYearPercentage: number;
    GrowthInYear: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RevenueInstance extends Instance<RevenueAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RevenueAttributes;
}
