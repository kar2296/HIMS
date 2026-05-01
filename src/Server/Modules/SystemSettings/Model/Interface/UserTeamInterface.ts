import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserTeamAttributes extends IAttributes {
    Id: number;
    UserId: number;
    TeamId: number;
    GroupId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    Comments: string;
    Status: number;
    IsDefault: boolean;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserTeamInstance extends Instance<UserTeamAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    TeamId: number;
    dataValues: UserTeamAttributes;
}
