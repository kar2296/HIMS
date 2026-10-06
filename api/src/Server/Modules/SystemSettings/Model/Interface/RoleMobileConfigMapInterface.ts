import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface RoleMobileConfigMapAttributes extends IAttributes {
    RoleId: number;
    MobileConfigId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RoleMobileConfigMapInstance extends Instance<RoleMobileConfigMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RoleMobileConfigMapAttributes;
}
