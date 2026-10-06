import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WardUserMapAttributes extends IAttributes {
    Id: number;
    UserId: number;
    WardId: number;
    WardName: string;
    FacilityId: number;
    UserTypeId: number;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardUserMapInstance extends Instance<WardUserMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardUserMapAttributes;
}
