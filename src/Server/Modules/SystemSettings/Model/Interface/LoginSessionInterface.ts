import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LoginSessionAttributes extends IAttributes {
    Id: number;
    UserId: number;
    UserName: string;
    LoginTime: Date;
    LogoutTime: Date;
    SessionId: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LoginSessionInstance extends Instance<LoginSessionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LoginSessionAttributes;
}
