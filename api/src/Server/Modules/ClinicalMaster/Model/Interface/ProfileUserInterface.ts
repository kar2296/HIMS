import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ProfileUserAttributes extends IAttributes {
    Id: number;
    ProfileId: number;
    FacilityId: number;
    DepartmentId: number;
    UserId: number;
    VisitTypeId: number;
    IsDefault: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProfileUserInstance extends Instance<ProfileUserAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProfileUserAttributes;
}
