import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DrugAlertAttributes extends IAttributes {
    Id: number;
    DrugId: number;
    DrugAlertTypeId: number;
    AlertMinValue: string;
    AlertMaxValue: string;
    DrugAgeGroupId: number;
    Alerts: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DrugAlertInstance extends Instance<DrugAlertAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrugAlertAttributes;
}
