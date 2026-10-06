import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AppInfoAttributes extends IAttributes {
    Id: number;
    Name: string;
    Version: string;
    UpdatedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppInfoInstance extends Instance<AppInfoAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppInfoAttributes;
}
