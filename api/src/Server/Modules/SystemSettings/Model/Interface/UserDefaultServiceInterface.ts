import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserDefaultServiceAttributes extends IAttributes {
    Id: number;
    UserId: number;
    FacilityId: number;
    ServiceItemId: number;
    Quantity: number;
    PatientTypeId: number;
    VisitTypeId: number;
    GuarantorTypeId: number;
    GuarantorId: number;
    DiscountModeId: number;
    Discount: number;
    Rate: number;
    EligibleDaysFrom: number;
    EligibleDays: number;
    NooFVisitFree: number;
    StatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserDefaultServiceInstance extends Instance<UserDefaultServiceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserDefaultServiceAttributes;
}
