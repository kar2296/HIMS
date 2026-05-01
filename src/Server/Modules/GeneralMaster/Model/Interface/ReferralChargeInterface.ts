import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ReferralChargeAttributes extends IAttributes {
    Id: number;
    ReferralId: number;
    FacilityId: number;
    DiscountModeId:number;
    ReferralCharge: string;
    ServiceCategoryId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferralChargeInstance extends Instance<ReferralChargeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferralChargeAttributes;
}
