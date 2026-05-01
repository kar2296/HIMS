import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface UserTaxDetailAttributes extends IAttributes {
    Id: number;
    UserId: number;
    IsGSTRegistered: boolean;
    GSTId: string;
    BusinessRegNo: string;
    BusinessName: string;
    BusinessAddress: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserTaxDetailInstance extends Instance<UserTaxDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserTaxDetailAttributes;
}
