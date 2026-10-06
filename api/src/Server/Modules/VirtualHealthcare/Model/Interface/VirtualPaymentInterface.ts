import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualPaymentAttributes extends IAttributes {
    Id: number;
    PaymentDateTime: Date;
    PaymentNumber: string;
    FacilityId: number;
    OrganizationId: number;
    ReceiptTypeId: number;
    PatientId: number;
    PatientName: string;
    BillAmount: number;
    AmountPaid: string;
    DueAmount: number;
    DepartmentId: number;
    PaymentModeId: number;
    PaymentDoneById: number;
    PaymentTypeId: number;
    DoctorId: number;
    VirtualCategoryId: number;
    VirtualSubCategoryId: number;
    CategoryTypeId: number;
    VirtualOrderId: number;
    VirtualBillId: number;
    VirtualBillTypeId: number;
    CardNumber: string;
    CardDateTime: Date;
    CardExpiryDate: Date;
    BankId: number;
    CardTypeId: number;
    TerminalNoId: string;
    CardHolderName: string;
    AuthorizeNumber: number;
    AuthorizedCode: string;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: number;
    DDDate: Date;
    WireTransferId: string;
    WireTransferDate: Date;
    Comments: string;
    CancelReason: string;
    PaymentStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualPaymentInstance extends Instance<VirtualPaymentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualPaymentAttributes;
}
