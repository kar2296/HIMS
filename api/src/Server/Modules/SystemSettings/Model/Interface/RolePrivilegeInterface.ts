import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface RolePrivilegeAttributes extends IAttributes {
    Id: number;
    RoleId: number;
    RoleCode: string;
    FacilityId: number;
    AccessObjectTypeId: number;
    AccessObjectType: string;
    AccessActionId: number;
    AccessAction: string;
    Access: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RolePrivilegeInstance extends Instance<RolePrivilegeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RolePrivilegeAttributes;
}
