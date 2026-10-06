import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RoleAttributes extends IAttributes {
    Id: number;
    RoleCode: string;
    RoleName: string;
    Description: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Comments: string;
    Status: number;
    ActiveStatusId: number;
    IsAllFacility: boolean;
    FacilityId: number;
    LandingControlId: number;
    IsActive: boolean;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RoleInstance extends Instance<RoleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RoleAttributes;
}
