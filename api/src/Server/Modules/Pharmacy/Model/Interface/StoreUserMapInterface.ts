import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StoreUserMapAttributes extends IAttributes {
    Id: number;
    UserId: number;
    StoreMasterId: number;
    StoreCode: string;
    StoreName: string;
    StoreTypeId: number;
    FacilityId: number;
    ActiveStatusId: number;
    UserTypeId: number;
    IsDefault: boolean;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StoreUserMapInstance extends Instance<StoreUserMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StoreUserMapAttributes;
}
