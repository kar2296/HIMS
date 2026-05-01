import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface GroupRoleMapAttributes extends IAudit {
    GroupId: number;
    RoleId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GroupRoleMapInstance extends Instance<GroupRoleMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GroupRoleMapAttributes;
}
