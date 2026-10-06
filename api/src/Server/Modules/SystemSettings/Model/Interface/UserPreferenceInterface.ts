import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface UserPreferenceAttributes extends IAttributes {
    Id: number;
    UserId: number;
    PrefKey: string;
    PrefValue: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserPreferenceInstance extends Instance<UserPreferenceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserPreferenceAttributes;
}
