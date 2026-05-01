import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorAgreementAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    GuarantorId: number;
    ServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    // Discount: number;
    // DiscountRate: number;
    OPDiscount: number;
    OPDiscountRate: number;
    IPDiscount: number;
    IPDiscountRate: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GuarantorAgreementInstance extends Instance<GuarantorAgreementAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorAgreementAttributes;
}
