import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PosLogAttributes extends IAttributes {
    Id: number;
    Stan: string;
    Currency: string;
    SaleAmt: string;
    Last4Digit: string;
    MID: string;
    TID: string;
    BatchNr: string;
    CrdType: string;
    InvoiceNr: string;
    DateTime: string;
    AppVersion: string;
    BaseAmount: string;
    TipAmount: string;
    RRN: string;
    AuthCode: string;
    AID: string;
    TVR: string;
    ContactType: string;
    TranType: string;
    EmvAppName: string;
    IsPinEntered: string;
    billNumber: string;
    TranId: string;
    PayerVPA: string;
    PayerName: string;
    TxnStatus: string;
    MerchantVPA: string;
    PayerAmount: string;
    PayerMobile: string;
    TxnCompletionDate: string;
    ErpClientId: string;
    ErpTranId: string;
    FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PosLogInstance extends Instance<PosLogAttributes> {
    dataValues: PosLogAttributes;
}
