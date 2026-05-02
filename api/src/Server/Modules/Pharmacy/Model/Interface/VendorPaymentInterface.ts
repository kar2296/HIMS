import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorPaymentAttributes extends IAttributes {
    Id: number;
    VendorPaymentIdentifier: string;
    VendorPaymentDate: string;
    VendorPaymentStatusId: number;
    FacilityId: number;
    VendorMasterId: number;
    VendorName: string;
    Address: string;
    ContactNo: string;
    TotalInvoiceAmount: number;
    TotalNetAmount: number;
    TotalPaidAmount: number;
    TotalTDSAmount: number;
    TotalOutstandingAmount: number;
    WriteOff: number;
    PaymentTypeId: number;
    BankId: number;
    CardTypeId: number;
    CardNumber: string;
    CardExpiryDate: Date;
    CardHolderName: string;
    TerminalNoId: number;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: string;
    DDDate: Date;
    WireTransferId: number;
    WireTransferDate: Date;
    IsTDS: boolean;
    TDSId: number;
    TSDPercentage: string;
    BeforeOutstanding: number;
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

export interface VendorPaymentInstance extends Instance<VendorPaymentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorPaymentAttributes;
}
