import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorPaymentDetailsAttributes extends IAttributes {
    Id: number;
    VendorPaymentId: number;
    GrnId: number;
    InvoiceNo: string;
    InvoiceDate: Date;
    ReturnDate: Date;
    GrnNo: string;
    GrnDate: Date;
    InvoiceAmount: number;
    ReturnNo: number;
    NetAmount: number;
    ReturnAmount: number;
    PaidAmount: number;
    BalanceAmount: number;
    TDSPercentageId: number;
    TDSAmount: number;
    WriteOff: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VendorPaymentDetailsInstance extends Instance<VendorPaymentDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorPaymentDetailsAttributes;
}
