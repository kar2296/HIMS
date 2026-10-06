import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface InsurancePaymentAttributes extends IAttributes {
    Id: number;
    PaymentIdentifier: string;
    PaymentDate: Date;
    FacilityId: number;
    GuarantorId: number;
    GuarantorTypeId: number;
    GuarantorName: string;
    ToBeClaimAmount: number;
    ReceivedAmount: number;
    TDSAmount: number;
    Disallowed: number;
    InsurancePaymentStatusId: number;
    PaymentTypeId: number;
    BankId: number;
    CardTypeId: number;
    CardNumber: string;
    CardExpiryDate: Date;
    CardHolderName: string;
    TerminalNoId: string;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: number;
    DDDate: Date;
    WireTransferId: string;
    WireTransferDate: Date;
    Comments: String;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    ReferenceNumber: string;
    AuthorizedCode: string;
}

export interface InsurancePaymentInstance extends Instance<InsurancePaymentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: InsurancePaymentAttributes;
}
