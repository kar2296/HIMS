import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorCustomerAttributes extends IAttributes {
    Id: number;
    GuarantorId: number;
    CustomerTypeId: number;
    CustomerCode: string;
    CustomerName: string;
    PolicyNo: string;
    PolicyName: string;
    CreditLimit: number;
    ApprovalLimit: number;
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

export interface GuarantorCustomerInstance extends Instance<GuarantorCustomerAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorCustomerAttributes;
}
