import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DynamicQRLogAttributes extends IAttributes {
    Id: number;
    MerchantId: string;
    SubMerchantId: string;
    TerminalId: string;
    BankRRN: string;
    MerchantTranId: string;
    PayerName: string;
    PayerMobile: string;
    PayerVA: string;
    PayerAmount: string;
    TxnStatus: string;
    TxnInitDate: string;
    TxnCompletionDate: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DynamicQRLogInstance extends Instance<DynamicQRLogAttributes> {
    dataValues: DynamicQRLogAttributes;
}
