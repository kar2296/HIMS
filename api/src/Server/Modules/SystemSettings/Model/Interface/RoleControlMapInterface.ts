import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RoleControlMapAttributes extends IAttributes {
    RoleId: number;
    ControlId: number;
    DisplayOrder: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RoleControlMapInstance extends Instance<RoleControlMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RoleControlMapAttributes;
}
