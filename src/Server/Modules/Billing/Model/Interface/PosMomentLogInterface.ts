import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PosMomentLogAttributes extends IAttributes {
    Id: number;
    ResponseCode: string;
    ResponseMessage: string;
    ProcessingId: string;
    CustomerId: string;
    Amount: number;
    TransactionId: string;
    CashbackDiscountedAmount: string;
    PayMode: string;
    TransactionType: string;
    TransactionStatus: string;
    BankResponseCode: string;
    BankResponseMessage: string;
    RrnId: string;
    TimeStamp: string;
    TransactionAmount: string;
    InvoiceNumber: string;
    UniqueIdentifierProvider: string;
    IcccCode: string;
    CardNumber: string;
    CardHolderName: string;
    CardType: string;
    ApprovalCode: string;
    CheckSumHash: string;
    SplitPayButtonId: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PosMomentLogInstance extends Instance<PosMomentLogAttributes> {
    dataValues: PosMomentLogAttributes;
}
