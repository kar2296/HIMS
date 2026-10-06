import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ModuleAttributes extends IAttributes {
    Id: number;
    ModuleCode: string;
    ModuleName: string;
    DisplayOrder: number;
    URL: string;
    IsEnabled: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ModuleInstance extends Instance<ModuleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ModuleAttributes;
}
