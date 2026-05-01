import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface RoomTypeMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OrganizationId: number;
    Code: string;
    RoomTypeName: string;
    RoomClassificationTypeId: number;
    Description: string;
    ServiceRateCategoryId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RoomTypeMasterInstance extends Instance<RoomTypeMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RoomTypeMasterAttributes;
}
