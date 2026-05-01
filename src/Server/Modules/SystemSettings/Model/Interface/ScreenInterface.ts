import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ScreenAttributes extends IAttributes {
    Id: number;
    ModuleId: number;
    ScreenCode: string;
    ScreenName: string;
    GroupName: string;
    DisplayOrder: number;
    URL: string;
    ImagePath: string;
    IsEnabled: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ScreenInstance extends Instance<ScreenAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ScreenAttributes;
}
