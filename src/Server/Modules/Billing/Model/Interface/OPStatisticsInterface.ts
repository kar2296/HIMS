import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OPStatisticsAttributes extends IAttributes {
    Id: number;
    VisitDate: Date;
    EncounteType: string;
    FacilityId: number;
    PatientCount: number;
    MonthToDay: number;
    CurrentYearCount: number;
    TotalCurrentYearCount: number;
    CurrentYearPercentage: number;
    PreviousYearCount: number;
    TotalPreviousYearCount: number;
    GrowthInYear: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OPStatisticsInstance extends Instance<OPStatisticsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OPStatisticsAttributes;
}
