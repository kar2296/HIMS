import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface UserSpecialityMapAttributes extends IAudit {
    UserId: number;
    SpecialityId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserSpecialityMapInstance extends Instance<UserSpecialityMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserSpecialityMapAttributes;
}
