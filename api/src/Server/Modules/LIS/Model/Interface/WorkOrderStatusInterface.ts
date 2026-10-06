import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WorkOrderStatusAttributes extends IAttributes {
    Id: number;
    DisplayName: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WorkOrderStatusInstance extends Instance<WorkOrderStatusAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WorkOrderStatusAttributes;
}
