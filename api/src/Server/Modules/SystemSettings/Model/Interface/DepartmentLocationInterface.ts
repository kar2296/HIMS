import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DepartmentLocationAttributes extends IAttributes {
    Id: number;
    DepartmentId: number;
    ItemCategoryId: number;
    SubItemCategoryId: number;
    OrderToDepartmentId: number;
    IsDefault: boolean;
    WorkingFromTime: string;
    WorkingToTime: string;
    OrderPriorityId: number;
    IsAllDaysSelected: boolean;
    IsMonDaySelected: boolean;
    IsTueDaySelected: boolean;
    IsWedDaySelected: boolean;
    IsThuDaySelected: boolean;
    IsFriDaySelected: boolean;
    IsSatDaySelected: boolean;
    IsSunDaySelected: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DepartmentLocationInstance extends Instance<DepartmentLocationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DepartmentLocationAttributes;
}
