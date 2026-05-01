import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ServiceItemAliasAttributes extends IAttributes {
    Id: number;
    ServiceItemId: number;
    AliasTypeId: number;
    ExternalProviderId: number;
    AliasId: string;
    AliasName: string;
    GroupId: number;
    IsSupplementary: boolean;
    Surcharge: string;
    Discount: string;
    StatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceItemAliasInstance extends Instance<ServiceItemAliasAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceItemAliasAttributes;
}
