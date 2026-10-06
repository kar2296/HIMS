import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StaffDiscountAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    StoreTypeId: number;
    StoreMasterId: number;
    UserTypeId: number;
    UserId: number;
    StaffDiscountTypeId: number;
    StaffDiscountPercentage: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    ActiveStatusId: number;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StaffDiscountInstance extends Instance<StaffDiscountAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StaffDiscountAttributes;
}
