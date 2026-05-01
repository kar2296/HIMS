import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorCustomerCardAttributes extends IAttributes {
    Id: number;
    GuarantorCustomerId: number;
    GuarantorId: number;
    GuarantorCardTypeId: number;
    CardMasterTypeId: number;
    CardMasterId: number;
    CardCode: string;
    CardName: string;
    CardDescription: string;
    PolicyNo: string;
    PolicyName: string;
    CreditLimit: number;
    ApprovalLimit: number;
    DeductableLimit: number;
    DeductableLoadId: number;
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

export interface GuarantorCustomerCardInstance extends Instance<GuarantorCustomerCardAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorCustomerCardAttributes;
}
