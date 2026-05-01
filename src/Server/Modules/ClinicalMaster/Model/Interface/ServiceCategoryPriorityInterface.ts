import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ServiceCategoryPriorityAttributes extends IAttributes {
    Id: number;
    ServiceCategoryId: number;
    PriorityId: number;
    TurnAroundTime: string;
    TurnAroundTimePeriodId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceCategoryPriorityInstance extends Instance<ServiceCategoryPriorityAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceCategoryPriorityAttributes;
}
