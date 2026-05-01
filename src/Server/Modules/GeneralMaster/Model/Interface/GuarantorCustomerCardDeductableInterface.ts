import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorCustomerCardDeductableAttributes extends IAttributes {
    Id: number;
    GuarantorCustomerCardId: number;
    GuarantorCustomerId: number;
    GuarantorId: number;
    ServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    DeductableLimit: number;
    DeductableLoadId: number;
    DeductablePercentage: number;
    DeductableAmount: number;
    ActiveStatusId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GuarantorCustomerCardDeductableInstance extends Instance<GuarantorCustomerCardDeductableAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorCustomerCardDeductableAttributes;
}
